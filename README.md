# MedGuard-X — AI Medical Risk & Fraud Detection Platform

> MedGuard-X is an AI platform detecting medical fraud and health risks using XGBoost, MobileNetV2 CNN, and Tesseract OCR. It analyzes patient vitals, flags anomalous records, and scans medical documents for authenticity — delivering real-time verdicts with animated results, PDF export, and persistent history per user.

![MedGuard-X](https://img.shields.io/badge/MedGuard--X-AI%20Platform-teal?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![XGBoost](https://img.shields.io/badge/XGBoost-ML-orange?style=for-the-badge)

---

## Features

| Module | Description |
|--------|-------------|
| **Health Risk AI** | XGBoost classifier predicts Low / Medium / High risk from 21 patient vitals |
| **Fraud Detection** | ML model flags anomalous medical records with a fraud probability score |
| **Document OCR** | Tesseract OCR extracts text from PDFs and images, detects suspicious keywords |
| **CNN Visual Analysis** | MobileNetV2 verifies document authenticity via visual pattern recognition |
| **Analysis History** | Every scan is saved per user account and accessible across sessions |
| **PDF Export** | Download a formatted A4 report of any analysis result |
| **User Profile** | Change password, view account stats, delete account |
| **Password Reset** | Automated reset link sent via Gmail SMTP |

---

## Tech Stack

**Backend**
- Python · FastAPI · Uvicorn
- XGBoost · scikit-learn · PyTorch · MobileNetV2
- Tesseract OCR · pdfplumber · OpenCV
- SQLite · JWT (python-jose) · bcrypt · Gmail SMTP

**Frontend**
- React 18 · Vite · Tailwind CSS
- Framer Motion · jsPDF · Axios

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/MedGuard-X.git
cd MedGuard-X
```

### 2. Backend setup
```bash
pip install -r requirements.txt
cp .env.example .env
# Fill in your SMTP credentials in .env
python -m uvicorn api:app --port 8001
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_gmail_app_password
MEDGUARD_SECRET=a_long_random_secret_string
FRONTEND_URL=http://localhost:5173
```

To get a Gmail App Password: Google Account → Security → 2-Step Verification → App passwords

---

## Deployment

- **Backend** → [Render](https://render.com) (see `render.yaml`)
- **Frontend** → [Vercel](https://vercel.com) (root: `frontend`, build: `npm run build`)

---

## Disclaimer

> Built for research and educational purposes only. Not intended for clinical diagnosis or medical decision-making.

---

## Author

**Harsha Vardhan** · [aharsha1587@gmail.com](mailto:aharsha1587@gmail.com)
