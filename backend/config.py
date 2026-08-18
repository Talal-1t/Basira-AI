import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    """Single source of truth for backend configuration, read from .env."""

    # --- Groq ---
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

    # --- CORS ---
    # In dev mode (DEBUG=True) any http://localhost:<port> or
    # http://127.0.0.1:<port> origin is allowed automatically, on top of
    # CORS_ORIGINS. Vite auto-increments its port (5173 -> 5174 -> 5175...)
    # whenever the default is already taken, so pinning to one exact port
    # is a common source of "upload silently fails" CORS issues — this
    # removes that whole class of problem for local development.
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ]
    DEV_CORS_ORIGIN_REGEX = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"

    # --- Uploads ---
    UPLOAD_FOLDER = os.path.join(BASE_DIR, os.getenv("UPLOAD_FOLDER", "uploads"))
    MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "500"))
    MAX_CONTENT_LENGTH = MAX_UPLOAD_MB * 1024 * 1024

    # Applies arabic-reshaper + python-bidi correction to Arabic-majority
    # lines extracted from PDFs. This is a best-effort heuristic fix for
    # pdfplumber's known RTL text-order issues — set to "false" in .env if
    # it ever makes a specific document's text worse instead of better.
    ARABIC_PDF_FIX = os.getenv("ARABIC_PDF_FIX", "true").lower() == "true"

    ALLOWED_TABULAR_EXTENSIONS = {"xlsx", "xls", "csv"}
    ALLOWED_PDF_EXTENSIONS = {"pdf"}
    ALLOWED_EXTENSIONS = ALLOWED_TABULAR_EXTENSIONS | ALLOWED_PDF_EXTENSIONS

    # --- Misc ---
    PORT = int(os.getenv("PORT", "5000"))
    DEBUG = os.getenv("FLASK_ENV", "development") == "development"


config = Config()
