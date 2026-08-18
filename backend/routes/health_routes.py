from flask import Blueprint

from config import config
from utils.responses import ok

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health():
    return ok(
        {
            "status": "ok",
            "ai_configured": bool(config.GROQ_API_KEY),
        }
    )
