from flask import Blueprint, request

from ai.groq_client import AINotConfigured
from services import file_service
from utils.responses import error, ok

chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/files/<file_id>/chat")
def chat_with_file(file_id):
    body = request.get_json(silent=True) or {}
    question = (body.get("question") or "").strip()
    history = body.get("history") or []

    if not question:
        return error("'question' is required.", 400)
    if not isinstance(history, list):
        return error("'history' must be a list of {role, content} messages.", 400)

    try:
        answer = file_service.ask_question(file_id, question, history)
    except file_service.FileNotFound:
        return error("File not found.", 404, code="not_found")
    except AINotConfigured as exc:
        return error(str(exc), 503, code="ai_not_configured")
    except Exception as exc:  # noqa: BLE001
        return error(f"Failed to get an answer: {exc}", 502, code="ai_request_failed")

    return ok({"question": question, "answer": answer})


@chat_bp.post("/combined/chat")
def chat_with_combined_files():
    body = request.get_json(silent=True) or {}
    question = (body.get("question") or "").strip()
    history = body.get("history") or []
    file_ids = body.get("file_ids") or []

    if not question:
        return error("'question' is required.", 400)
    if not isinstance(history, list):
        return error("'history' must be a list of {role, content} messages.", 400)
    if not isinstance(file_ids, list) or len(file_ids) < 2:
        return error("'file_ids' must be a list of at least 2 file ids.", 400)

    try:
        answer = file_service.ask_combined_question(file_ids, question, history)
    except file_service.FileNotFound:
        return error("One or more files were not found.", 404, code="not_found")
    except AINotConfigured as exc:
        return error(str(exc), 503, code="ai_not_configured")
    except Exception as exc:  # noqa: BLE001
        return error(f"Failed to get an answer: {exc}", 502, code="ai_request_failed")

    return ok({"question": question, "answer": answer, "file_ids": file_ids})
