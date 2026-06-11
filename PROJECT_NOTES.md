# MedGuard-X — Complete Project Notes
### Interview-Ready Reference | Built by Harsha Vardhan

---

## 1. PROJECT OVERVIEW

- **What it is:** An end-to-end AI web platform that detects medical fraud and health risks in real time using machine learning, OCR, and computer vision
- **Why it matters:** Traditional medical audit systems are manual and slow — MedGuard-X automates detection with 98%+ model accuracy and delivers results in under 2 seconds

- **Core idea:** A user uploads a medical document or enters patient vitals, the system runs it through multiple AI models, and returns a risk verdict with fraud probability score
- **Unique value:** Combines three different AI approaches (XGBoost ML, Tesseract OCR, OpenCV vision) into one unified pipeline with a production-grade animated UI

---

## 2. FULL TECH STACK

```
┌─────────────────────────────────────────────────────┐
│                  TECH STACK MAP                      │
│                                                      │
│  FRONTEND              BACKEND           DATABASE    │
│  ─────────             ───────           ────────    │
│  React 18              FastAPI           SQLite      │
│  Vite                  Uvicorn           stdlib      │
│  Tailwind CSS          Python 3.11       sqlite3     │
│  Framer Motion         XGBoost                       │
│  Axios                 scikit-learn      AUTH        │
│  jsPDF                 Tesseract OCR     ─────       │
│  React Router v6       pdfplumber        JWT         │
│                        OpenCV            bcrypt      │
│  DEPLOYMENT            joblib            python-jose │
│  ───────────                                         │
│  Vercel (frontend)     EMAIL             ML FILES    │
│  Render (backend)      ─────             ────────    │
│  GitHub (source)       Gmail SMTP        .joblib     │
│                        smtplib           .json feat  │
└─────────────────────────────────────────────────────┘
```

---

## 3. SYSTEM ARCHITECTURE

```
USER
 │
 ▼
┌─────────────────────────────────────┐
│   Vercel (medgaurd-x.vercel.app)    │
│   React SPA                         │
│   • 6 pages (lazy loaded)           │
│   • JWT stored in localStorage      │
│   • Axios with Bearer interceptor   │
└─────────────────┬───────────────────┘
                  │ HTTPS REST API
                  ▼
┌─────────────────────────────────────┐
│   Render (medgaurd-x.onrender.com)  │
│   FastAPI + Uvicorn                 │
│   • 15 endpoints                    │
│   • CORS middleware                 │
│   • JWT auth via python-jose        │
└───┬───────────┬────────────┬────────┘
    │           │            │
    ▼           ▼            ▼
┌───────┐  ┌────────┐  ┌──────────┐
│SQLite │  │XGBoost │  │Tesseract │
│.db    │  │Models  │  │+ OpenCV  │
│users  │  │.joblib │  │OCR       │
│history│  │files   │  │pipeline  │
└───────┘  └────────┘  └──────────┘
```

---

## 4. ML PIPELINE — HOW IT WORKS

```
INPUT: Patient Vitals (21 fields)
        │
        ▼
┌───────────────────────┐
│  PREPROCESSING        │
│  • Impute missing     │  ← Uses saved imputer.joblib
│  • Feature engineer   │  ← pulse_pressure, bmi_proxy, symptom flags
│  • StandardScaler     │  ← Uses saved scaler.joblib
└───────────┬───────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
┌─────────┐   ┌──────────┐
│ HEALTH  │   │ FRAUD    │
│ RISK    │   │ DETECTOR │
│ MODEL   │   │ MODEL    │
│         │   │          │
│ Output: │   │ Output:  │
│ Low /   │   │ 0.0–1.0  │
│ Med /   │   │ score    │
│ High    │   │ + binary │
└────┬────┘   └────┬─────┘
     │              │
     └──────┬───────┘
            ▼
    COMBINED RESULT
    • Risk level badge
    • Fraud probability bar
    • Save to SQLite history
    • Export as PDF report


INPUT: Medical Document (PDF / Image)
        │
        ├──── PDF? ──── pdfplumber.extract_text()
        │                    │
        └──── Image? ─── Tesseract OCR
                         • Greyscale + sharpen preprocess
                         • pytesseract.image_to_string()
                              │
                         ┌────▼─────────────────┐
                         │  TEXT ANALYSIS        │
                         │  • 40+ medical terms  │
                         │  • Suspicious words   │
                         │  • Word count check   │
                         └────┬─────────────────-┘
                              │
                         ┌────▼─────────────────┐
                         │  OpenCV STRUCTURAL   │
                         │  • Light ratio       │
                         │  • Edge density      │
                         │  • Table detection   │
                         │  • Text block count  │
                         └────┬─────────────────┘
                              │
                         FRAUD SCORE = 0.0–1.0
                         Threshold > 0.55 = FRAUD
```

---

## 5. FEATURES — STAGE BY STAGE

### Stage 1 — Core Auth + Landing
- Built JWT-based register/login/logout with bcrypt password hashing, no third-party auth library
- Created animated landing page with ECG overlay, glassmorphism cards, and gradient hero text

### Stage 2 — Analysis Dashboard
- Built dual-tab dashboard: Tab 1 = Document upload + OCR, Tab 2 = Patient vitals form
- Integrated XGBoost models via joblib, results displayed as animated fraud gauge + risk badge

### Stage 3 — Password Reset
- Implemented Gmail SMTP flow: user requests reset → backend generates secure token → email sent with link
- Used `secrets.token_urlsafe(32)` with 1-hour expiry stored in SQLite, deleted on use

### Stage 4 — Analysis History
- Added SQLite `analyses` table; every scan auto-saves with email, type, result, timestamp
- Built history panel in dashboard with date formatting, delete button, and "Saved to account" badge

### Stage 5 — User Profile Page
- Built profile page showing avatar (initials), member-since date, total/fraud/clear stats from API
- Added change-password form (3 fields, match indicator) and danger zone account deletion

### Stage 6 — PDF Export
- Used jsPDF to generate formatted A4 report: dark header, vitals table, fraud bar, keyword list
- File saves as `MedGuard-Report-[timestamp].pdf` client-side with no server involvement

### Stage 7 — Deployment
- Deployed backend to Render with `render.yaml`, frontend to Vercel with `vercel.json` SPA routing
- Set up GitHub → Vercel + Render auto-deploy pipeline: every `git push` redeploys both

### Stage 8 — Admin Panel
- Added employee ID + password gate at `/admin` route, visible only after authentication
- One-click CSV download of all registered users (id, email, first/last name, signup date)

---

## 6. ISSUES FACED & HOW WE RESOLVED THEM

### Issue 1 — OneDrive Corrupting .venv
```
Problem:  pip packages installed in .venv inside OneDrive folder
          OSError: [Errno 22] Invalid argument when Python read .py files
          OneDrive stores files as cloud-only placeholders — not real files

Root cause: OneDrive "Files On-Demand" feature makes files appear to exist
            locally but they are actually cloud stubs that fail on binary read

Fix:      Abandoned .venv entirely — installed all packages globally
          Ran backend with: python -m uvicorn api:app --port 8001
          This is why requirements.txt exists — for Render to install fresh
```

### Issue 2 — passlib Incompatible with bcrypt 5.0
```
Problem:  bcrypt 5.0 changed its internal API
          passlib.hash.bcrypt crashed with AttributeError on import
          App refused to start entirely

Root cause: passlib 1.7.4 calls bcrypt.__about__.__version__
            which was removed in bcrypt 5.0

Fix:      Removed passlib completely from the stack
          Used bcrypt directly: bcrypt.hashpw() and bcrypt.checkpw()
          No wrapper library needed — bcrypt's own API is simple enough
```

### Issue 3 — Gmail SMTP Not Sending Password Reset Emails
```
Problem:  Forgot password form showed success but email never arrived
          Backend was printing to console and returning 200 silently
          No real error surfaced to the frontend

Root cause: SMTP_PASS was a placeholder value in .env
            Backend had a silent fallback: print → return 200 anyway

Fix:      Added smtp_ready check — if SMTP_PASS is placeholder return 503
          User generated a real Gmail App Password (16-char code)
          Emails now deliver correctly; spam folder check was needed initially
```

### Issue 4 — Page Transition Overlay Stuck on Screen
```
Problem:  ECG animation overlay appeared on page load and never disappeared
          Screen was stuck showing the transition for 30+ seconds sometimes
          Happened specifically when vite dev server restarted mid-navigation

Root cause: timerRef race condition — new navigation triggered before
            old timer cleared, leaving overlay in an inconsistent state

Fix:      Added clearTimeout(timerRef.current) before every new transition
          Reduced overlay duration from 1000ms to 700ms
          Used React.lazy() + Suspense so pages load faster
```

### Issue 5 — Port 8001 Already in Use
```
Problem:  Backend failed to start: "address already in use"
          Happened after force-closing terminal without stopping uvicorn
          Stale Python process holding the port

Root cause: Windows doesn't auto-release ports when process is killed
            The ghost process kept the socket open

Fix:      Get-Process python | Stop-Process in PowerShell
          Killed all lingering Python processes, port freed instantly
```

### Issue 6 — Render Free Tier Out of Memory (512MB)
```
Problem:  Render build failed: "Out of memory (used over 512Mi)"
          PyTorch alone is ~400MB installed + torchvision ~100MB
          No room left for FastAPI, XGBoost, OpenCV, etc.

Root cause: MobileNetV2 CNN required PyTorch which is far too heavy
            for Render's free tier 512MB RAM limit

Fix:      Removed torch and torchvision from requirements.txt entirely
          Rewrote medical_cnn.py with try/except — torch optional
          OpenCV structural analysis covers 80% of scoring anyway
          If torch unavailable: use 100% structural score (graceful degrade)
```

### Issue 7 — Vercel Build Failed: manualChunks Not a Function
```
Problem:  Vercel build error: "TypeError: manualChunks is not a function"
          Our vite.config.js used manualChunks as an object (key → array)
          Vercel installed a newer Vite version using rolldown bundler

Root cause: rolldown (Vite 6's new bundler) only accepts manualChunks
            as a function — the object form is rollup-only syntax

Fix:      Removed manualChunks from vite.config.js entirely
          The optimization is nice-to-have, not required for the app to work
          Build passed in 12 seconds after removal
```

### Issue 8 — Signup "Registration Failed" Even with Working Backend
```
Problem:  Frontend showed "Registration failed. Check your connection"
          But backend /docs confirmed all endpoints were live
          Error persisted across multiple deployments and fixes

Root cause (took 6 attempts to find): Signup.jsx, Login.jsx, and
          ResetPassword.jsx were importing raw axios (import axios from 'axios')
          Raw axios has baseURL = undefined → requests go to current domain
          All auth requests were POSTing to vercel.app/auth/register (404)
          Our configured api instance (with Render baseURL) was never used

Fix:      Changed all three pages: import api from '../api/axios'
          Changed axios.post() → api.post() in all three files
          One line change per file — solved in one commit
```

### Issue 9 — GitHub Push Rejected (Diverged Histories)
```
Problem:  Clicked "Add README" when creating GitHub repo
          This created an initial commit on GitHub's side
          Local repo had different initial commit — push rejected

Root cause: Two unrelated git histories — local branch and GitHub branch
            had no common ancestor commit

Fix:      git pull origin main --allow-unrelated-histories
          Merge conflict on README.md → kept our detailed README
          git checkout --ours README.md → git add → git commit
          Then git push -u origin master:main — succeeded
```

### Issue 10 — Vercel SPA Routing 404 on Page Refresh
```
Problem:  Navigating to /login or /signup directly returned 404: NOT_FOUND
          Clicking links within the app worked, but direct URL access failed
          Vercel tried to find a real file at /login — which doesn't exist

Root cause: React Router handles routing client-side via JavaScript
            On first load, Vercel looks for a real file matching the path
            No index.html fallback was configured

Fix:      Created frontend/vercel.json with a catch-all rewrite rule:
          { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
          All paths now serve index.html → React Router takes over
```

---

## 7. AUTH FLOW

```
REGISTER
User fills form → POST /auth/register {email, password, first_name, last_name}
    │
    ▼
Backend: bcrypt.hashpw(password) → INSERT INTO users
    │
    ▼
201 Created → Frontend navigates to /login


LOGIN
User submits → POST /auth/login (form-urlencoded username/password)
    │
    ▼
Backend: get_user(email) → bcrypt.checkpw(password, hash)
    │
    ▼
jwt.encode({sub: email, exp: +24h}) → access_token returned
    │
    ▼
Frontend stores token in localStorage as 'medguard_token'
Axios interceptor attaches: Authorization: Bearer <token>
    │
    ▼
Every protected route calls get_current_user(token) dependency
jwt.decode(token) → extracts email → passed to endpoint


PASSWORD RESET
User enters email → POST /auth/forgot-password
    │
    ▼
secrets.token_urlsafe(32) → stored in password_reset_tokens table
    │
    ▼
Gmail SMTP sends email with link: /reset-password?token=xxx
    │
    ▼
User clicks link → POST /auth/reset-password {token, new_password}
Backend validates token + expiry → bcrypt new hash → DELETE token
```

---

## 8. DATABASE SCHEMA

```
┌──────────────────────────────────────────┐
│               users                      │
├──────────────┬───────────────────────────┤
│ id           │ INTEGER PRIMARY KEY       │
│ email        │ TEXT UNIQUE NOT NULL      │
│ hashed_pw    │ TEXT NOT NULL             │
│ first_name   │ TEXT DEFAULT ''           │
│ last_name    │ TEXT DEFAULT ''           │
│ created_at   │ TIMESTAMP DEFAULT NOW     │
└──────────────┴───────────────────────────┘

┌──────────────────────────────────────────┐
│          password_reset_tokens           │
├──────────────┬───────────────────────────┤
│ token        │ TEXT PRIMARY KEY          │
│ email        │ TEXT NOT NULL             │
│ expires_at   │ TEXT (ISO datetime)       │
└──────────────┴───────────────────────────┘

┌──────────────────────────────────────────┐
│               analyses                   │
├──────────────┬───────────────────────────┤
│ id           │ INTEGER PRIMARY KEY       │
│ email        │ TEXT NOT NULL             │
│ analysis_type│ TEXT (health/fraud/doc)   │
│ patient_data │ TEXT (JSON blob)          │
│ health_risk  │ TEXT (Low/Medium/High)    │
│ fraud_score  │ REAL (0.0 – 1.0)         │
│ is_fraud     │ INTEGER (0 or 1)          │
│ doc_result   │ TEXT (JSON blob)          │
│ created_at   │ TEXT (ISO datetime)       │
└──────────────┴───────────────────────────┘
```

---

## 9. DEPLOYMENT WORKFLOW

```
LOCAL DEVELOPMENT
      │
      ▼
git add . → git commit → git push origin HEAD:main
      │
      ├─────────────────────────────────────┐
      ▼                                     ▼
VERCEL (webhook)                    RENDER (webhook)
Detects push to main                Detects push to main
      │                                     │
      ▼                                     ▼
npm install (254 packages)          apt-get install tesseract-ocr
npm run build (vite build)          apt-get install libgl1-mesa-glx
Build in ~12s                       pip install -r requirements.txt
Deploy to CDN edge                  Build in ~4-8 min
      │                                     │
      ▼                                     ▼
https://medgaurd-x.vercel.app       https://medgaurd-x.onrender.com
SPA with vercel.json routing        FastAPI + Uvicorn on $PORT
```

---

## 10. COMMIT HISTORY SUMMARY

```
01740f1  Initial commit
8268a17  Initial commit: MedGuard-X AI platform (51 files)
f16fbb1  Add README, ML artifacts, training scripts
6e640cc  Merge remote init, keep project README
5fad799  Use VITE_API_URL env var for production
c603595  Fix Tesseract path for Linux, add system deps to render.yaml
a452cc4  Remove torch/torchvision, CNN falls back to OpenCV-only      ← Memory fix
2bdac02  Remove manualChunks for rolldown compatibility                ← Build fix
05cf91f  Hardcode Render URL as fallback for production
47bbef1  Use runtime hostname check to set API URL
80e1c44  Add vercel.json to fix SPA routing 404s                      ← Routing fix
d7ef96d  Wake up Render on app load, increase axios timeout to 60s
27a5cd2  Fix Signup/Login/ResetPassword to use configured api          ← Root cause fix
4933f3a  Add first/last name to signup, admin CSV export endpoint
4966c1e  Add admin page with one-click CSV download
3b5f08f  Add employee ID + password gate to admin page
19b3c26  docs: add system architecture ASCII diagram to README
4a61efd  docs: add CHANGELOG with version history
83ae986  chore: add ADMIN_KEY to env.example template

Total: 19 commits
```

---

## 11. KEY DESIGN DECISIONS

- **No passlib** — bcrypt 5.0 broke passlib compatibility; using bcrypt directly is simpler and more reliable
- **SQLite over PostgreSQL** — SQLite is zero-config and sufficient for this scale; avoids extra service cost
- **No Redux** — React Context + useState covers auth state; Redux would be overkill for this app size
- **No Docker** — Render handles Python + apt-get natively; Docker adds complexity without benefit here
- **OpenCV over PyTorch** — PyTorch (400MB) exceeds Render free tier RAM; OpenCV covers 80% of CNN scoring
- **jsPDF client-side** — PDF generation in the browser avoids sending sensitive patient data to server again
- **Lazy loading** — React.lazy() + Suspense splits JS bundles per page, reducing initial load from ~800KB to ~120KB
- **Runtime URL detection** — `window.location.hostname === 'localhost'` is more reliable than env vars in Vite builds

---

## 12. INTERVIEW TALKING POINTS

- **"What was the hardest bug?"** → The axios import bug (Issue 8) — 6 deployments to find that 3 pages used raw axios instead of our configured instance with baseURL
- **"How did you handle auth?"** → JWT with 24h expiry, bcrypt hashing, axios interceptor attaches token, 401 clears token and redirects to login
- **"How does the fraud detection work?"** → Two-layer: XGBoost score on patient vitals + OCR/OpenCV analysis on documents. Fraud if score > 0.55 or suspicious words found
- **"Why Render + Vercel instead of one platform?"** → Render handles Python well; Vercel is best-in-class for React SPAs with edge CDN. Separation of concerns
- **"How did you solve the 512MB memory issue?"** → Identified PyTorch as the culprit, made it optional via try/except, rewrote CNN module to degrade gracefully to OpenCV-only
- **"What would you improve?"** → Replace SQLite with PostgreSQL for production persistence (Render wipes SQLite on redeploy), add rate limiting to auth endpoints, add unit tests

---

## 13. LIVE LINKS

| Resource | URL |
|----------|-----|
| Live App | https://medgaurd-x.vercel.app |
| API Docs | https://medgaurd-x.onrender.com/docs |
| Admin Panel | https://medgaurd-x.vercel.app/admin |
| GitHub Repo | https://github.com/HarshaAlamanda/MedGaurd-X |

---

*Built and documented by Harsha Vardhan — June 2026*
