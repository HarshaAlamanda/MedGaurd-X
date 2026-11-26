<h1 align="center">MedGuard-X</h1>

<p align="center">
  <strong>AI-Powered Health Risk &amp; Medical Fraud Analysis</strong>
</p>

<p align="center">
  Explore patient risk, flag suspicious records, and analyze medical documents<br />
  in one interactive dashboard.
</p>

<p align="center">
  <a href="https://medgaurd-x.vercel.app"><strong>Launch Demo</strong></a>
  &nbsp; &middot; &nbsp;
  <a href="https://medgaurd-x.onrender.com/docs"><strong>API Documentation</strong></a>
  &nbsp; &middot; &nbsp;
  <a href="#getting-started"><strong>Getting Started</strong></a>
  &nbsp; &middot; &nbsp;
  <a href="#system-architecture"><strong>Architecture</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&amp;logo=python&amp;logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&amp;logo=fastapi&amp;logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-19-20232a?style=flat-square&amp;logo=react&amp;logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/XGBoost-3.2-374151?style=flat-square" alt="XGBoost 3.2" />
  <img src="https://img.shields.io/badge/OpenCV-374151?style=flat-square&amp;logo=opencv&amp;logoColor=white" alt="OpenCV" />
</p>

## MedGuard-X · Health Intelligence

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Heart_Monitor_Flat_Icon_GIF_Animation.gif" width="100" height="100" alt="Animated heart monitor representing MedGuard-X health analysis" />
</p>

<p align="center"><strong>Patient data · Risk insights · Document screening</strong></p>

MedGuard-X combines **XGBoost risk predictions**, **OCR text extraction**, and **document structure analysis** in a React and FastAPI application. Review model scores, export PDF reports, and revisit saved analyses from your account.

| Health risk | Fraud screening | Document analysis |
| --- | --- | --- |
| Estimate patient risk from clinical measurements. | Flag potentially anomalous records with model-generated scores. | Extract text and assess medical-document signals with Tesseract OCR and OpenCV. |

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
│         React 19 + Vite + Tailwind CSS + Framer Motion          │
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
| React 19 + Vite | UI framework + build tool |
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

### Deployment in Motion

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/WP25_Rocket_-_blue.gif" width="160" height="160" alt="Animated blue rocket illustrating application deployment" />
</p>

<p align="center"><strong>Commit → Build → Deploy → Review</strong><br /><sub>Illustrative animation; not a live deployment-status indicator.</sub></p>

Use the [Vercel frontend](https://medgaurd-x.vercel.app) and [Render API documentation](https://medgaurd-x.onrender.com/docs) to review the deployed application. Deployment settings are described below.

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

## Animation Credits

- [Heart Monitor Flat Icon GIF Animation.gif](https://commons.wikimedia.org/wiki/File:Heart_Monitor_Flat_Icon_GIF_Animation.gif) by [Videoplasty.com](https://videoplasty.com), licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Original GIF embedded unchanged.
- [WP25 Rocket - blue.gif](https://commons.wikimedia.org/wiki/File:WP25_Rocket_-_blue.gif) by Wikimedia Foundation staff and contractors, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Original GIF embedded unchanged; displayed at a smaller size.

---

## Author

**Harsha Vardhan**  
AI/ML Developer · [aharsha1587@gmail.com](mailto:aharsha1587@gmail.com) · [GitHub](https://github.com/HarshaAlamanda)

---

<div align="center">
  <sub>Built with FastAPI · React · XGBoost · Tesseract OCR · Framer Motion</sub>
</div>
