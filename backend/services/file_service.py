from __future__ import annotations

from ai import service as ai_service
from services import chart_service, excel_service, pdf_service, storage_service


class FileNotFound(LookupError):
    pass


def _require_meta(file_id: str) -> dict:
    meta = storage_service.get_meta(file_id)
    if not meta:
        raise FileNotFound(file_id)
    return meta


def process_upload(file_storage) -> dict:
    """Saves the upload, runs the appropriate analysis pipeline immediately,
    caches the result, and returns everything the dashboard needs for the
    first paint — no separate "processing" polling step required.
    """
    meta = storage_service.save_upload(file_storage)
    file_id = meta["id"]

    if meta["kind"] == "tabular":
        df = excel_service.read_tabular(meta["stored_path"])
        stats = excel_service.analyze(df)
        charts = chart_service.build_charts(df)
        storage_service.cache_set(file_id, "stats", stats)
        storage_service.cache_set(file_id, "charts", charts)
        return {"meta": meta, "stats": stats, "charts": charts}

    extraction = pdf_service.extract(meta["stored_path"])
    storage_service.cache_set(file_id, "extraction", extraction)
    return {"meta": meta, "extraction": extraction}


def get_dashboard(file_id: str) -> dict:
    meta = _require_meta(file_id)

    if meta["kind"] == "tabular":
        stats = storage_service.cache_get(file_id, "stats")
        charts = storage_service.cache_get(file_id, "charts")
        if stats is None or charts is None:
            df = excel_service.read_tabular(meta["stored_path"])
            stats = stats or excel_service.analyze(df)
            charts = charts if charts is not None else chart_service.build_charts(df)
            storage_service.cache_set(file_id, "stats", stats)
            storage_service.cache_set(file_id, "charts", charts)
        return {"meta": meta, "stats": stats, "charts": charts}

    extraction = storage_service.cache_get(file_id, "extraction")
    if extraction is None:
        extraction = pdf_service.extract(meta["stored_path"])
        storage_service.cache_set(file_id, "extraction", extraction)
    return {"meta": meta, "extraction": extraction}


def get_context_text(file_id: str) -> str:
    """The grounding text handed to Gemini for both chat and insights."""
    meta = _require_meta(file_id)

    if meta["kind"] == "tabular":
        df = excel_service.read_tabular(meta["stored_path"])
        stats = storage_service.cache_get(file_id, "stats") or excel_service.analyze(df)
        return excel_service.to_context_text(df, stats)

    extraction = storage_service.cache_get(file_id, "extraction") or pdf_service.extract(
        meta["stored_path"]
    )
    return pdf_service.to_context_text(extraction)


def get_insights(file_id: str, force: bool = False) -> dict:
    meta = _require_meta(file_id)

    if not force:
        cached = storage_service.cache_get(file_id, "insights")
        if cached is not None:
            return cached

    context = get_context_text(file_id)
    if meta["kind"] == "tabular":
        insights = ai_service.dataset_insights(context)
    else:
        insights = ai_service.pdf_insights(context)

    storage_service.cache_set(file_id, "insights", insights)
    return insights


def ask_question(file_id: str, question: str, history: list[dict] | None = None) -> str:
    context = get_context_text(file_id)
    return ai_service.answer_question(context, question, history)


def get_combined_context(file_ids: list[str]) -> str:
    """Builds one grounding text block spanning several files, each clearly
    labeled, so the AI can answer questions that span multiple uploads
    (e.g. 'compare the sales file against the branches file')."""
    parts = []
    for file_id in file_ids:
        meta = _require_meta(file_id)
        parts.append(f"=== FILE: {meta['filename']} ===\n{get_context_text(file_id)}")
    return "\n\n".join(parts)


def ask_combined_question(
    file_ids: list[str], question: str, history: list[dict] | None = None
) -> str:
    context = get_combined_context(file_ids)
    return ai_service.answer_question(context, question, history)


def delete_file(file_id: str) -> bool:
    return storage_service.delete_upload(file_id)
