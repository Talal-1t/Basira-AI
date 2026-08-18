from flask import Blueprint, request, send_file
import io

from ai.groq_client import AINotConfigured
from services import file_service, export_service, storage_service
from utils.responses import error, ok

files_bp = Blueprint("files", __name__)


@files_bp.get("/files/<file_id>")
def get_dashboard(file_id):
    try:
        data = file_service.get_dashboard(file_id)
    except file_service.FileNotFound:
        return error("File not found.", 404, code="not_found")
    return ok(data)


@files_bp.get("/files/<file_id>/insights")
def get_insights(file_id):
    force = request.args.get("refresh") == "true"
    try:
        data = file_service.get_insights(file_id, force=force)
    except file_service.FileNotFound:
        return error("File not found.", 404, code="not_found")
    except AINotConfigured as exc:
        return error(str(exc), 503, code="ai_not_configured")
    except Exception as exc:  # noqa: BLE001
        return error(f"Failed to generate insights: {exc}", 502, code="ai_request_failed")
    return ok(data)


@files_bp.delete("/files/<file_id>")
def delete_file(file_id):
    deleted = file_service.delete_file(file_id)
    if not deleted:
        return error("File not found.", 404, code="not_found")
    return ok({"deleted": True})


@files_bp.get("/files/<file_id>/export/xlsx")
def export_xlsx(file_id):
    meta = storage_service.get_meta(file_id)
    if not meta:
        return error("File not found.", 404, code="not_found")
    try:
        data = export_service.build_xlsx(file_id)
    except Exception as exc:  # noqa: BLE001
        return error(f"Failed to build Excel export: {exc}", 500, code="export_failed")
    name = meta["filename"].rsplit(".", 1)[0]
    return send_file(
        io.BytesIO(data),
        as_attachment=True,
        download_name=f"{name}-basira-report.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@files_bp.get("/files/<file_id>/export/pdf")
def export_pdf(file_id):
    meta = storage_service.get_meta(file_id)
    if not meta:
        return error("File not found.", 404, code="not_found")
    try:
        data = export_service.build_pdf(file_id)
    except Exception as exc:  # noqa: BLE001
        return error(f"Failed to build PDF export: {exc}", 500, code="export_failed")
    name = meta["filename"].rsplit(".", 1)[0]
    return send_file(
        io.BytesIO(data),
        as_attachment=True,
        download_name=f"{name}-basira-report.pdf",
        mimetype="application/pdf",
    )
