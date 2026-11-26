# MedGuard-X — AI Medical Risk & Fraud Detection Platform

<div align="center">

![MedGuard-X](https://img.shields.io/badge/MedGuard--X-AI%20Medical%20Platform-0d9488?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOSA0LjUgOS00LjV2LTVsLTkgNC41TDIgMTJ6Ii8+PC9zdmc+)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![XGBoost](https://img.shields.io/badge/XGBoost-ML-FF6600?style=for-the-badge)
![Deployed](https://img.shields.io/badge/Deployed-Live-22c55e?style=for-the-badge&logo=vercel&logoColor=white)

**[🚀 Live Demo](https://medgaurd-x.vercel.app)** · **[📡 API Docs](https://medgaurd-x.onrender.com/docs)** · **[📁 GitHub](https://github.com/HarshaAlamanda/MedGaurd-X)**

> An end-to-end AI platform that detects medical fraud and health risks in real time.  
> Analyzes patient vitals, flags anomalous records, and verifies medical document authenticity  
> using XGBoost, Tesseract OCR, and OpenCV — with animated results, PDF export, and per-user history.

</div>

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│              https://medgaurd-x.vercel.app                      │
│                                                                  │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│   │ Landing  │  │  Login / │  │Dashboard │  │   Profile /  │  │
│   │  Page    │  │  Signup  │  │ Analysis │  │    Admin     │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│         React 18 + Vite + Tailwind CSS + Framer Motion          │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS (Axios + JWT Bearer)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FastAPI BACKEND (Render)                        │
│              https://medgaurd-x.onrender.com                    │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ /auth/*    │  │ /predict/* │  │ /analyze/  │  │/analyses │ │
│  │ register   │  │ health     │  │ document   │  │ history  │ │
│  │ login      │  │ fraud      │  │            │  │ export   │ │
│  │ reset-pwd  │  └─────┬──────┘  └─────┬──────┘  └──────────┘ │
│  └─────┬──────┘        │               │                        │
│        │               ▼               ▼                        │
│  ┌─────▼──────┐  ┌────────────┐  ┌────────────┐               │
│  │  SQLite DB │  │  XGBoost   │  │ Tesseract  │               │
│  │  (users,   │  │  Models    │  │ OCR +      │               │
│  │  analyses) │  │  (.joblib) │  │ OpenCV CNN │               │
│  └────────────┘  └────────────┘  └────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## ML Pipeline

```
                    ┌─────────────────────────────────┐
                    │         INPUT SOURCES           │
                    └──────┬──────────────┬───────────┘
                           │              │
              ┌────────────▼───┐    ┌─────▼──────────────┐
              │  Patient Data  │    │  Medical Document  │
              │  (21 vitals)   │    │  (PDF / Image)     │
              └────────────┬───┘    └─────┬──────────────┘
                           │              │
          ┌────────────────▼──┐    ┌──────▼──────────────┐
          │   PREPROCESSING   │    │    OCR PIPELINE     │
          │ • Imputation      │    │ • pdfplumber (PDF)  │
          │ • Feature eng.    │    │ • Tesseract (image) │
          │ • Scaling         │    │ • Text cleaning     │
          └──────┬────────────┘    └──────┬──────────────┘
                 │                        │
    ┌────────────▼───────┐    ┌───────────▼────────────────┐
    │   DUAL XGBOOST     │    │     DOCUMENT ANALYSIS      │
    │                    │    │                             │
    │ ┌────────────────┐ │    │ ┌─────────────────────┐   │
    │ │ Health Risk    │ │    │ │ Keyword Matching     │   │
    │ │ Classifier     │ │    │ │ 40+ medical terms    │   │
    │ │ Low/Med/High   │ │    │ └──────────┬──────────┘   │
    │ └────────────────┘ │    │            │               │
    │ ┌────────────────┐ │    │ ┌──────────▼──────────┐   │
    │ │ Fraud Detector │ │    │ │ OpenCV Structural   │   │
    │ │ Score 0.0-1.0  │ │    │ │ Analysis (edges,    │   │
    │ └────────────────┘ │    │ │ tables, whitespace) │   │
    └──────┬─────────────┘    └──────────┬────────────────┘
           │                             │
           └──────────────┬──────────────┘
                          ▼
              ┌───────────────────────┐
              │     RESULTS ENGINE    │
              │ • Animated UI verdict │
              │ • Fraud probability   │
              │ • Risk classification │
              │ • PDF report export   │
              │ • Save to history     │
              └───────────────────────┘
```

---

## Project Structure

```
MedGaurd-X/
│
├── api.py                          # FastAPI app — all endpoints
├── database.py                     # SQLite ORM (users, analyses, tokens)
├── medical_cnn.py                  # OpenCV document classifier
├── requirements.txt                # Python dependencies
├── render.yaml                     # Render deployment config
├── .env.example                    # Environment variable template
│
├── ── ML Models ──
│   ├── health_risk_model.joblib    # XGBoost health classifier
│   ├── health_risk_scaler.joblib
│   ├── health_risk_imputer.joblib
│   ├── health_risk_label_encoder.joblib
│   ├── health_features.json
│   ├── fraud_detection_model.joblib # XGBoost fraud detector
│   ├── fraud_detection_scaler.joblib
│   ├── fraud_detection_imputer.joblib
│   └── fraud_features.json
│
├── ── Training Scripts ──
│   ├── train_health.py
│   ├── train_fraud.py
│   └── generate_dataset.py
│
└── frontend/                       # React + Vite app
    ├── index.html
    ├── vite.config.js
    ├── vercel.json                 # SPA routing rewrite rule
    ├── tailwind.config.js
    │
    └── src/
        ├── App.jsx                 # Routes + page transitions
        ├── main.jsx
        │
        ├── api/
        │   └── axios.js            # Configured instance (runtime URL)
        │
        ├── context/
        │   └── AuthContext.jsx     # JWT auth state
        │
        ├── pages/
        │   ├── Landing.jsx         # Public hero page
        │   ├── Login.jsx
        │   ├── Signup.jsx          # First name, last name, email, password
        │   ├── Dashboard.jsx       # Analysis tabs + history
        │   ├── Profile.jsx         # Change password, delete account
        │   ├── ResetPassword.jsx
        │   └── Admin.jsx           # Employee-gated CSV export
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx      # Translucent glass navbar
        │   │   ├── Footer.jsx
        │   │   └── ProtectedRoute.jsx
        │   ├── dashboard/
        │   │   ├── DocumentUpload.jsx
        │   │   ├── PatientForm.jsx
        │   │   └── FraudGauge.jsx  # Animated SVG arc
        │   ├── animations/
        │   │   ├── PageTransitionOverlay.jsx
        │   │   ├── HeartbeatLine.jsx
        │   │   └── MedicalParticles.jsx
        │   └── ui/
        │       ├── GlassCard.jsx
        │       ├── GradientButton.jsx
        │       └── AnimatedInput.jsx
        │
        └── utils/
            └── exportPdf.js        # jsPDF formatted report
```

---

## Features

| Module | Description | Status |
|--------|-------------|--------|
| **Health Risk AI** | XGBoost predicts Low / Medium / High risk from 21 patient vitals | ✅ Live |
| **Fraud Detection** | ML model flags anomalous records with fraud probability 0–100% | ✅ Live |
| **Document OCR** | Tesseract extracts text from PDFs and images, detects 40+ medical keywords | ✅ Live |
| **CNN Visual Analysis** | OpenCV structural analysis verifies document authenticity | ✅ Live |
| **Analysis History** | Every scan auto-saved per user, deletable, paginated | ✅ Live |
| **PDF Export** | Formatted A4 report with vitals table, fraud bar, keywords | ✅ Live |
| **User Profile** | Change password, view stats (total / fraud / clear), delete account | ✅ Live |
| **Password Reset** | Time-limited reset link via Gmail SMTP | ✅ Live |
| **Admin Panel** | Employee-gated CSV export of all registered users | ✅ Live |

---

## API Endpoints

```
AUTH
  POST   /auth/register          Register new user (email, password, first_name, last_name)
  POST   /auth/login             Login → JWT token
  POST   /auth/forgot-password   Send reset email
  POST   /auth/reset-password    Set new password from token
  GET    /auth/profile           Get profile + stats (protected)
  POST   /auth/change-password   Update password (protected)
  DELETE /auth/account           Delete account + all data (protected)

PREDICTION
  POST   /predict/health         XGBoost health risk → {risk_level, confidence, features}
  POST   /predict/fraud          XGBoost fraud score → {fraud_score, is_fraud}

DOCUMENT
  POST   /analyze/document       OCR + CNN analysis → {fraud_score, keywords, is_medical}

HISTORY
  GET    /analyses               All saved analyses for current user (protected)
  POST   /analyses               Save analysis result (protected)
  DELETE /analyses/{id}          Delete one analysis (protected)

ADMIN
  GET    /admin/export-users     Download users CSV (?key=ADMIN_KEY)
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Python 3.11 | Core language |
| FastAPI + Uvicorn | REST API server |
| XGBoost + scikit-learn | Health risk & fraud ML models |
| Tesseract OCR | Text extraction from documents |
| pdfplumber | PDF text extraction |
| OpenCV (headless) | Document structural analysis |
| SQLite (stdlib) | User & analysis persistence |
| python-jose | JWT token generation & validation |
| bcrypt | Password hashing |
| smtplib + Gmail SMTP | Password reset emails |
| python-dotenv | Environment variable loading |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework + build tool |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Page transitions + animations |
| Axios | HTTP client with JWT interceptor |
| jsPDF | Client-side PDF export |
| React Router v6 | Client-side routing |

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) (Windows) or `apt-get install tesseract-ocr` (Linux)

### 1. Clone the repo
```bash
git clone https://github.com/HarshaAlamanda/MedGaurd-X.git
cd MedGaurd-X
```

### 2. Backend setup
```bash
pip install -r requirements.txt
cp .env.example .env
# Fill in SMTP credentials and secret key
python -m uvicorn api:app --port 8001 --reload
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Environment Variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
MEDGUARD_SECRET=change_this_to_a_long_random_string
FRONTEND_URL=http://localhost:5173
ADMIN_KEY=your_admin_key
```

> **Gmail App Password:** Google Account → Security → 2-Step Verification → App passwords

---

## Deployment

| Service | Purpose | Config |
|---------|---------|--------|
| [Render](https://render.com) | Python backend | `render.yaml` |
| [Vercel](https://vercel.com) | React frontend | root: `frontend` |

**Auto-deploy:** Every push to `main` triggers automatic redeployment on both platforms.

> ⚠️ Render free tier sleeps after 15 min of inactivity. First request after sleep takes ~30s to wake up.

---

## Screenshots

| Landing Page | Dashboard | Analysis Results |
|-------------|-----------|-----------------|
| Animated hero with ECG overlay | Dual-tab analysis interface | Real-time fraud gauge + risk badge |

---

## Disclaimer

> Built for research and educational purposes only. Not intended for clinical diagnosis or medical decision-making. Always consult a qualified healthcare professional.

---

## Author

**Harsha Vardhan**  
AI/ML Developer · [aharsha1587@gmail.com](mailto:aharsha1587@gmail.com) · [GitHub](https://github.com/HarshaAlamanda)

---

<div align="center">
  <sub>Built with FastAPI · React · XGBoost · Tesseract OCR · Framer Motion</sub>
</div>
