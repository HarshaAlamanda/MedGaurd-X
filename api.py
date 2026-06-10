from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
import joblib
import pandas as pd
import json
import io
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

from PIL import Image, ImageFilter, ImageEnhance
import pdfplumber
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
from jose import JWTError, jwt

import database        # uses bcrypt directly — no passlib dependency
import medical_cnn     # MobileNetV2 + OpenCV document classifier

app = FastAPI(title="MedGuardX API", version="4.0")

_extra_origin = os.environ.get("FRONTEND_URL", "")
_allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if _extra_origin and _extra_origin not in _allowed_origins:
    _allowed_origins.append(_extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY    = os.environ.get("MEDGUARD_SECRET", "medguard-secret-key-change-in-production")
SMTP_HOST     = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER     = os.environ.get("SMTP_USER", "")
SMTP_PASS     = os.environ.get("SMTP_PASS", "")
FRONTEND_URL  = os.environ.get("FRONTEND_URL", "http://localhost:5173")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ================= MODELS =================
class PatientRecord(BaseModel):
    patient_id: int
    age: Optional[int] = 0
    gender: str
    blood_pressure_systolic: Optional[float] = None
    blood_pressure_diastolic: Optional[float] = None
    heart_rate: Optional[float] = None
    temperature: Optional[float] = None
    oxygen_saturation: Optional[float] = None
    glucose_level: Optional[float] = None
    medical_condition: Optional[str] = "None"
    symptoms: Optional[str] = "None"
    visit_date: str

class RegisterRequest(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class SaveAnalysisRequest(BaseModel):
    analysis_type: str
    patient_data: Optional[dict] = None
    health_risk: Optional[str] = None
    fraud_score: Optional[float] = None
    is_fraud: bool = False
    doc_result: Optional[dict] = None

# ================= PREPROCESS =================
def preprocess(df):
    df = df.copy()

    df["visit_date"] = pd.to_datetime(df["visit_date"], errors="coerce")
    df["gender"] = df["gender"].map({"F": 0, "M": 1}).fillna(0)

    cond_map = {
        "Asthma": 0,
        "Diabetes": 1,
        "Heart Disease": 2,
        "Hypertension": 3,
        "None": 4,
    }
    df["medical_condition"] = df["medical_condition"].map(cond_map).fillna(4)

    df["visit_month"] = df["visit_date"].dt.month
    df["visit_day"] = df["visit_date"].dt.day
    df["visit_dayofweek"] = df["visit_date"].dt.dayofweek

    symptoms = ["Fever", "Cough", "Fatigue", "Shortness of Breath", "Chest Pain"]
    for s in symptoms:
        df[f"symptom_{s.replace(' ', '_')}"] = df["symptoms"].str.contains(s, case=False, na=False).astype(int)

    # Derived features (must match training)
    sbp = pd.to_numeric(df.get("blood_pressure_systolic", 0), errors="coerce").fillna(0)
    dbp = pd.to_numeric(df.get("blood_pressure_diastolic", 0), errors="coerce").fillna(0)
    age = pd.to_numeric(df.get("age", 0), errors="coerce").fillna(0)
    glu = pd.to_numeric(df.get("glucose_level", 0), errors="coerce").fillna(0)

    df["pulse_pressure"] = sbp - dbp
    df["bmi_proxy"] = glu / (age + 1)

    symptom_cols = [c for c in df.columns if c.startswith("symptom_")]
    df["symptom_count"] = df[symptom_cols].sum(axis=1)
    df["is_weekend"] = (df["visit_dayofweek"] >= 5).astype(int)

    df = df.drop(columns=["patient_id", "symptoms", "visit_date"], errors="ignore")

    return df.apply(pd.to_numeric, errors="coerce")

# ================= LOAD MODELS =================
try:
    FRAUD_MODEL = joblib.load("fraud_detection_model.joblib")
    FRAUD_SCALER = joblib.load("fraud_detection_scaler.joblib")
    FRAUD_IMPUTER = joblib.load("fraud_detection_imputer.joblib")

    HEALTH_MODEL = joblib.load("health_risk_model.joblib")
    HEALTH_SCALER = joblib.load("health_risk_scaler.joblib")
    HEALTH_IMPUTER = joblib.load("health_risk_imputer.joblib")
    HEALTH_LABEL = joblib.load("health_risk_label_encoder.joblib")

    with open("fraud_features.json") as f:
        FRAUD_FEATURES = json.load(f)["feature_names"]

    with open("health_features.json") as f:
        HEALTH_FEATURES = json.load(f)["feature_names"]

except Exception as e:
    print("Model loading error:", e)
    FRAUD_MODEL = FRAUD_SCALER = FRAUD_IMPUTER = None
    HEALTH_MODEL = HEALTH_SCALER = HEALTH_IMPUTER = HEALTH_LABEL = None
    FRAUD_FEATURES = []
    HEALTH_FEATURES = []

# ================= JWT HELPERS =================
def create_access_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

# ================= ROOT =================
@app.get("/")
def root():
    return {"status": "ok"}

# ================= AUTH =================
@app.post("/auth/register", status_code=201)
def register(req: RegisterRequest):
    if not req.email or "@" not in req.email:
        raise HTTPException(status_code=400, detail="Invalid email")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    created = database.create_user(req.email, req.password)
    if not created:
        raise HTTPException(status_code=409, detail="Email already registered")
    return {"message": "Account created successfully"}

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = database.get_user(form_data.username)
    if not user or not database.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["email"])
    return {"access_token": token, "token_type": "bearer"}

# ================= FRAUD =================
@app.post("/predict/fraud")
def predict_fraud(record: PatientRecord):
    if FRAUD_MODEL is None:
        raise HTTPException(status_code=500, detail="Fraud model not loaded")

    df = pd.DataFrame([record.dict()])
    X = preprocess(df)
    X = X.reindex(columns=FRAUD_FEATURES, fill_value=0)
    X = FRAUD_IMPUTER.transform(X)
    X = FRAUD_SCALER.transform(X)

    pred = FRAUD_MODEL.predict(X)[0]
    prob = 0.0
    if hasattr(FRAUD_MODEL, "predict_proba"):
        prob = float(FRAUD_MODEL.predict_proba(X)[0][1])

    return {"is_fraud": bool(pred), "fraud_score": prob}

# ================= HEALTH =================
@app.post("/predict/health")
def predict_health(record: PatientRecord):
    if HEALTH_MODEL is None:
        raise HTTPException(status_code=500, detail="Health model not loaded")

    df = pd.DataFrame([record.dict()])
    X = preprocess(df)
    X = X.reindex(columns=HEALTH_FEATURES, fill_value=0)
    X = HEALTH_IMPUTER.transform(X)
    X = HEALTH_SCALER.transform(X)

    pred = HEALTH_MODEL.predict(X)[0]
    label = HEALTH_LABEL.inverse_transform([pred])[0]

    return {"health_risk": str(label)}

# ================= OCR =================
def preprocess_image_for_ocr(img: Image.Image) -> Image.Image:
    """Enhance image quality before OCR for better text extraction."""
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    # Upscale small images so Tesseract can read fine print
    w, h = img.size
    if w < 1000:
        scale = 1000 / w
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    # Convert to greyscale
    img = img.convert("L")
    # Sharpen and increase contrast
    img = img.filter(ImageFilter.SHARPEN)
    img = ImageEnhance.Contrast(img).enhance(2.0)
    return img

def extract_pdf(content):
    text = ""
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for p in pdf.pages:
            page_text = p.extract_text() or ""
            text += page_text
            # If pdfplumber got nothing (scanned PDF), try OCR on the page image
            if len(page_text.strip()) < 20:
                try:
                    page_img = p.to_image(resolution=200).original
                    page_img = preprocess_image_for_ocr(page_img)
                    text += pytesseract.image_to_string(page_img, config="--psm 6") or ""
                except Exception:
                    pass
    return text

def extract_image(content):
    img = Image.open(io.BytesIO(content))
    img = preprocess_image_for_ocr(img)
    # --psm 6: assume a single uniform block of text (good for documents)
    # --oem 3: use LSTM OCR engine
    text = pytesseract.image_to_string(img, config="--psm 6 --oem 3")
    return text

# ================= DOCUMENT =================
MEDICAL_KEYWORDS = [
    "diagnosis", "patient", "blood", "pressure", "glucose", "temperature",
    "heart rate", "symptom", "prescription", "treatment", "hospital",
    "clinic", "doctor", "physician", "medical", "health", "bmi",
    "cholesterol", "hemoglobin", "creatinine", "sodium", "potassium",
    "therapy", "medication", "dosage", "mg", "ml", "lab", "test result",
    "report", "scan", "x-ray", "mri", "ecg", "ward", "discharge",
    "pulse", "oxygen", "spo2", "platelet", "wbc", "rbc", "hba1c",
    "radiology", "pathology", "surgery", "admission", "clinical",
    "specimen", "urinalysis", "culture", "biopsy", "ultrasound",
    "mmhg", "bpm", "mg/dl", "fever", "cough", "fatigue", "nausea",
    "allergy", "insulin", "tablet", "capsule", "injection", "dose",
    "refill", "pharmacy", "lab result", "blood test", "urine test",
]

SUSPICIOUS_WORDS = [
    "fake", "edited", "dummy", "sample document", "invalid", "test document",
    "lorem ipsum", "placeholder", "draft", "void", "not valid",
    "cancelled", "forged", "fabricated", "example", "template",
    "fill in", "your name here", "insert", "todo",
]

def compute_document_fraud_score(
    text: str,
    word_count: int,
    matched_keywords: list,
    suspicious_hits: list,
) -> float:
    """
    Returns a fraud probability score between 0.0 (genuine) and 1.0 (fraudulent).
    Logic:
      - Blank / unreadable doc → 0.95
      - Start at 0.75 (suspicious by default)
      - Each medical keyword reduces score (more keywords = more legitimate)
      - Suspicious words add heavily to score
      - Short docs with few words stay high
    """
    if word_count < 10:
        return 0.95

    score = 0.75

    # Each keyword lowers fraud likelihood (cap benefit at 20 keywords)
    kw_count = min(len(matched_keywords), 20)
    score -= kw_count * 0.035          # max reduction: 0.70

    # Suspicious words raise fraud likelihood
    score += min(len(suspicious_hits) * 0.25, 0.50)

    # Very short docs (10-30 words) remain suspicious
    if word_count < 30:
        score += 0.20

    return round(max(0.04, min(0.96, score)), 3)


@app.post("/analyze/document")
async def analyze_document(file: UploadFile = File(...)):
    content = await file.read()
    filename = (file.filename or "").lower()
    is_image = not filename.endswith(".pdf")

    try:
        if not is_image:
            text = extract_pdf(content)
        else:
            text = extract_image(content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not read file: {str(e)}")

    text_lower = text.lower()
    word_count = len(text.split())

    # ── OCR keyword analysis ────────────────────────────────────────
    matched_keywords = [kw for kw in MEDICAL_KEYWORDS if kw in text_lower]
    suspicious_hits  = [w  for w  in SUSPICIOUS_WORDS  if w  in text_lower]
    ocr_is_medical   = len(matched_keywords) >= 3

    # ── CNN + OpenCV visual analysis (images only) ──────────────────
    cnn_medical_score = None
    cnn_details = {}
    if is_image:
        try:
            pil_img = Image.open(io.BytesIO(content))
            cnn_result = medical_cnn.classify_medical_document(pil_img)
            cnn_medical_score = cnn_result["cnn_medical_score"]
            cnn_details = cnn_result["details"]
        except Exception:
            cnn_medical_score = None   # degrade gracefully if CNN fails

    # ── Combined is_medical decision ───────────────────────────────
    if cnn_medical_score is not None:
        # Both OCR keywords AND CNN must agree for images
        # (prevents random image with medical words from slipping through)
        if ocr_is_medical and cnn_medical_score >= 0.30:
            is_medical = True
        elif not ocr_is_medical and cnn_medical_score >= 0.65:
            # CNN is very confident even if OCR got little text (blurry scan)
            is_medical = True
        else:
            is_medical = False
    else:
        is_medical = ocr_is_medical   # PDF: rely on OCR alone

    if word_count < 10:
        is_medical = False

    # ── Fraud score ─────────────────────────────────────────────────
    ocr_fraud = compute_document_fraud_score(text, word_count, matched_keywords, suspicious_hits)

    if cnn_medical_score is not None:
        # Blend: OCR fraud × 0.55 + visual non-doc signal × 0.45
        visual_fraud = 1.0 - cnn_medical_score
        fraud_score = round(ocr_fraud * 0.55 + visual_fraud * 0.45, 3)
    else:
        fraud_score = ocr_fraud

    fraud_score = round(max(0.04, min(0.96, fraud_score)), 3)
    suspected_fraud = fraud_score > 0.55 or len(suspicious_hits) > 0

    return {
        "raw_text": text,
        "word_count": word_count,
        "document_fraud_score": fraud_score,
        "suspected_fraud": suspected_fraud,
        "is_medical_report": is_medical,
        "medical_keywords_found": matched_keywords[:12],
        "suspicious_terms": suspicious_hits,
        "cnn_medical_score": cnn_medical_score,
        "cnn_details": cnn_details,
    }


# ================= EMAIL =================
def _send_reset_email(to_email: str, token: str):
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"

    html = f"""
    <html>
    <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',sans-serif;">
      <div style="max-width:480px;margin:40px auto;background:#1e293b;border-radius:16px;
                  padding:36px;border:1px solid rgba(255,255,255,0.08);">

        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-flex;align-items:center;justify-content:center;
                      width:52px;height:52px;border-radius:14px;
                      background:linear-gradient(135deg,#0d9488,#2563eb);margin-bottom:12px;">
            <span style="color:#fff;font-size:26px;">🛡️</span>
          </div>
          <h1 style="margin:0;font-size:20px;
                     background:linear-gradient(135deg,#2dd4bf,#3b82f6);
                     -webkit-background-clip:text;-webkit-text-fill-color:transparent;">
            MedGuard-X
          </h1>
        </div>

        <h2 style="color:#f1f5f9;font-size:18px;margin:0 0 10px;">Reset your password</h2>
        <p style="color:rgba(255,255,255,0.45);font-size:14px;line-height:1.7;margin:0 0 24px;">
          We received a request to reset the password for <strong style="color:rgba(255,255,255,0.7);">{to_email}</strong>.
          Click the button below to choose a new password. This link expires in <strong style="color:#2dd4bf;">1 hour</strong>.
        </p>

        <div style="text-align:center;margin-bottom:24px;">
          <a href="{reset_link}"
             style="display:inline-block;padding:14px 36px;border-radius:10px;
                    background:linear-gradient(135deg,#0d9488,#2563eb);
                    color:#fff;font-weight:700;font-size:15px;text-decoration:none;
                    letter-spacing:0.02em;">
            Reset Password
          </a>
        </div>

        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:20px 0;" />
        <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center;margin:0;">
          If the button doesn't work, copy this link into your browser:<br/>
          <span style="color:rgba(45,212,191,0.6);word-break:break-all;">{reset_link}</span>
        </p>
        <p style="color:rgba(255,255,255,0.15);font-size:11px;text-align:center;margin:12px 0 0;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "MedGuard-X — Password Reset Link"
    msg["From"]    = f"MedGuard-X <{SMTP_USER}>"
    msg["To"]      = to_email
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, to_email, msg.as_string())


# ================= FORGOT PASSWORD =================
@app.post("/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    if not req.email or "@" not in req.email:
        raise HTTPException(status_code=400, detail="Invalid email address")

    token = database.create_reset_token(req.email)

    smtp_ready = SMTP_USER and SMTP_PASS and "your_16_char" not in SMTP_PASS

    if not smtp_ready:
        raise HTTPException(
            status_code=503,
            detail="Email service is not configured. Please set SMTP_PASS in your .env file (Gmail App Password)."
        )

    if token:
        try:
            _send_reset_email(req.email, token)
        except Exception as e:
            print(f"[SMTP ERROR] {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to send email: {str(e)}"
            )

    # Always return the same message (don't reveal if email exists)
    return {"message": "If this email is registered, a reset link has been sent."}


# ================= RESET PASSWORD =================
@app.post("/auth/reset-password")
def reset_password(req: ResetPasswordRequest):
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    email = database.get_reset_token(req.token)
    if not email:
        raise HTTPException(status_code=400, detail="Reset link is invalid or has expired. Please request a new one.")

    database.update_password(email, req.new_password)
    database.delete_reset_token(req.token)

    return {"message": "Password reset successfully. You can now sign in with your new password."}


# ================= ANALYSIS HISTORY =================
@app.post("/analyses", status_code=201)
def save_analysis(req: SaveAnalysisRequest, current_user: str = Depends(get_current_user)):
    analysis_id = database.save_analysis(
        email=current_user,
        analysis_type=req.analysis_type,
        patient_data=req.patient_data,
        health_risk=req.health_risk,
        fraud_score=req.fraud_score,
        is_fraud=req.is_fraud,
        doc_result=req.doc_result,
    )
    return {"id": analysis_id}


@app.get("/analyses")
def get_analyses(current_user: str = Depends(get_current_user)):
    return database.get_user_analyses(current_user)


@app.delete("/analyses/{analysis_id}")
def delete_analysis(analysis_id: int, current_user: str = Depends(get_current_user)):
    ok = database.delete_analysis(analysis_id, current_user)
    if not ok:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"message": "Deleted"}


# ================= USER PROFILE =================
@app.get("/auth/profile")
def get_profile(current_user: str = Depends(get_current_user)):
    user = database.get_user(current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    analyses = database.get_user_analyses(current_user)
    fraud_count    = sum(1 for a in analyses if a["is_fraud"])
    return {
        "email":      user["email"],
        "created_at": user["created_at"],
        "total_analyses": len(analyses),
        "fraud_detected": fraud_count,
        "verified_clear": len(analyses) - fraud_count,
    }


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@app.post("/auth/change-password")
def change_password(req: ChangePasswordRequest, current_user: str = Depends(get_current_user)):
    user = database.get_user(current_user)
    if not user or not database.verify_password(req.current_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    if req.current_password == req.new_password:
        raise HTTPException(status_code=400, detail="New password must be different from current password")
    database.update_password(current_user, req.new_password)
    return {"message": "Password changed successfully"}


class DeleteAccountRequest(BaseModel):
    password: str

@app.delete("/auth/account")
def delete_account(req: DeleteAccountRequest, current_user: str = Depends(get_current_user)):
    user = database.get_user(current_user)
    if not user or not database.verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")
    database.delete_user(current_user)
    return {"message": "Account deleted"}
