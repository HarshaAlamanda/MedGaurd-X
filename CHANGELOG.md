# Changelog

All notable changes to MedGuard-X are documented here.

---

## [1.3.0] — 2026-06-11

### Added
- Admin panel at `/admin` with employee ID + password gate
- First name and last name fields on signup form
- CSV export endpoint `GET /admin/export-users` for user management
- One-click CSV download button in admin UI

### Fixed
- Signup, Login, ResetPassword pages now use configured `api` instance (was using raw axios with no baseURL)
- SPA routing 404s on Vercel fixed via `vercel.json` rewrite rule
- Render cold-start handled: backend ping on app load + 60s axios timeout

---

## [1.2.0] — 2026-06-11

### Added
- Deployed backend to Render (https://medgaurd-x.onrender.com)
- Deployed frontend to Vercel (https://medgaurd-x.vercel.app)
- `render.yaml` with Tesseract + OpenCV system dependencies
- Runtime hostname check for API URL (no env var needed)
- `vercel.json` for React SPA routing

### Changed
- Removed PyTorch + torchvision from requirements (512MB Render free tier limit)
- `medical_cnn.py` now falls back to OpenCV-only when torch unavailable
- Tesseract path auto-detects Windows vs Linux

---

## [1.1.0] — 2026-06-10

### Added
- Analysis History (Stage 4): auto-save every scan to SQLite per user
- User Profile page (Stage 5): change password, account stats, delete account
- PDF Export (Stage 6): formatted A4 report via jsPDF
- Persistent login across sessions (localStorage + sessionStorage)
- `GET /auth/profile` endpoint with total/fraud/clear stats
- `POST/GET/DELETE /analyses` endpoints with JWT protection

### Changed
- Navbar redesigned: translucent glass, spring-animated pill, dropdown menu
- Footer simplified to 2-column (removed Platform links)
- Page transition overlay fixed (race condition, reduced to 700ms)
- All routes lazy-loaded with React.lazy() + Suspense

---

## [1.0.0] — 2026-05-22

### Added
- Initial full-stack implementation
- FastAPI backend with XGBoost health risk + fraud detection
- Tesseract OCR + pdfplumber document analysis
- MobileNetV2 CNN visual document classifier
- React 18 frontend with Framer Motion animations
- JWT authentication (register, login, forgot/reset password)
- Gmail SMTP password reset emails
- Glassmorphism UI with animated ECG overlay
- SQLite database with bcrypt password hashing
