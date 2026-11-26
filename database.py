import sqlite3
import os
import secrets
import bcrypt
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "medguard.db")


def _get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with _get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                first_name TEXT DEFAULT '',
                last_name TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Add columns to existing DB if upgrading
        for col in [("first_name", "TEXT DEFAULT ''"), ("last_name", "TEXT DEFAULT ''")]:
            try:
                conn.execute(f"ALTER TABLE users ADD COLUMN {col[0]} {col[1]}")
            except Exception:
                pass
        conn.execute("""
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                token TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                expires_at TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                analysis_type TEXT NOT NULL,
                patient_data TEXT,
                health_risk TEXT,
                fraud_score REAL,
                is_fraud INTEGER DEFAULT 0,
                doc_result TEXT,
                created_at TEXT NOT NULL
            )
        """)
        conn.commit()


def create_user(email: str, password: str, first_name: str = "", last_name: str = "") -> bool:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    try:
        with _get_conn() as conn:
            conn.execute(
                "INSERT INTO users (email, hashed_password, first_name, last_name) VALUES (?, ?, ?, ?)",
                (email.lower().strip(), hashed, first_name.strip(), last_name.strip()),
            )
            conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False


def get_all_users() -> list:
    with _get_conn() as conn:
        rows = conn.execute(
            "SELECT id, email, first_name, last_name, created_at FROM users ORDER BY created_at DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def get_user(email: str):
    with _get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ?", (email.lower().strip(),)
        ).fetchone()
    return dict(row) if row else None


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ── Password reset ─────────────────────────────────────────────────────────────

def create_reset_token(email: str) -> str | None:
    """Generates a secure reset token for the email. Returns None if email not registered."""
    user = get_user(email)
    if not user:
        return None
    token = secrets.token_urlsafe(32)
    expires_at = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    with _get_conn() as conn:
        conn.execute("DELETE FROM password_reset_tokens WHERE email = ?", (email.lower().strip(),))
        conn.execute(
            "INSERT INTO password_reset_tokens (token, email, expires_at) VALUES (?, ?, ?)",
            (token, email.lower().strip(), expires_at),
        )
        conn.commit()
    return token


def get_reset_token(token: str) -> str | None:
    """Returns the email linked to a valid, unexpired token. None if invalid/expired."""
    with _get_conn() as conn:
        row = conn.execute(
            "SELECT email, expires_at FROM password_reset_tokens WHERE token = ?",
            (token,),
        ).fetchone()
    if not row:
        return None
    if datetime.utcnow() > datetime.fromisoformat(row["expires_at"]):
        delete_reset_token(token)
        return None
    return row["email"]


def delete_reset_token(token: str):
    with _get_conn() as conn:
        conn.execute("DELETE FROM password_reset_tokens WHERE token = ?", (token,))
        conn.commit()


def update_password(email: str, new_password: str):
    hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    with _get_conn() as conn:
        conn.execute(
            "UPDATE users SET hashed_password = ? WHERE email = ?",
            (hashed, email.lower().strip()),
        )
        conn.commit()


# ── Analysis history ───────────────────────────────────────────────────────────

def save_analysis(email: str, analysis_type: str, patient_data, health_risk, fraud_score, is_fraud, doc_result) -> int:
    import json
    with _get_conn() as conn:
        cur = conn.execute(
            """INSERT INTO analyses (email, analysis_type, patient_data, health_risk, fraud_score, is_fraud, doc_result, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                email.lower().strip(),
                analysis_type,
                json.dumps(patient_data) if patient_data else None,
                health_risk,
                round(float(fraud_score), 6) if fraud_score is not None else None,
                1 if is_fraud else 0,
                json.dumps(doc_result) if doc_result else None,
                datetime.utcnow().isoformat(),
            )
        )
        conn.commit()
        return cur.lastrowid


def get_user_analyses(email: str) -> list:
    import json
    with _get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM analyses WHERE email = ? ORDER BY created_at DESC",
            (email.lower().strip(),)
        ).fetchall()
    result = []
    for row in rows:
        d = dict(row)
        d['patient_data'] = json.loads(d['patient_data']) if d.get('patient_data') else None
        d['doc_result']   = json.loads(d['doc_result'])   if d.get('doc_result')   else None
        d['is_fraud']     = bool(d['is_fraud'])
        result.append(d)
    return result


def delete_user(email: str):
    with _get_conn() as conn:
        conn.execute("DELETE FROM analyses WHERE email = ?", (email.lower().strip(),))
        conn.execute("DELETE FROM password_reset_tokens WHERE email = ?", (email.lower().strip(),))
        conn.execute("DELETE FROM users WHERE email = ?", (email.lower().strip(),))
        conn.commit()


def delete_analysis(analysis_id: int, email: str) -> bool:
    with _get_conn() as conn:
        cur = conn.execute(
            "DELETE FROM analyses WHERE id = ? AND email = ?",
            (analysis_id, email.lower().strip())
        )
        conn.commit()
        return cur.rowcount > 0


init_db()
