from flask import Blueprint, request

from config import config
from services import file_service
from utils.responses import error, ok
from utils.validators import UnsupportedFileType, is_allowed_file

upload_bp = Blueprint("upload", __name__)


@upload_bp.post("/upload")
def upload_file():
    if "file" not in request.files:
        return error("No file part in the request. Send it under the 'file' field.", 400)

    file_storage = request.files["file"]
    if not file_storage or file_storage.filename == "":
        return error("No file selected.", 400)

    if not is_allowed_file(file_storage.filename):
        allowed = ", ".join(sorted(f".{e}" for e in config.ALLOWED_EXTENSIONS))
        return error(f"Unsupported file type. Allowed types: {allowed}", 415, code="unsupported_type")

    try:
        result = file_service.process_upload(file_storage)
    except UnsupportedFileType as exc:
        return error(str(exc), 415, code="unsupported_type")
    except Exception as exc:  # noqa: BLE001 — surfaced to the client as a clean 500
        return error(f"Failed to process file: {exc}", 500, code="processing_failed")

    return ok(result, status=201)
