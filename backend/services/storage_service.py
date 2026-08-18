from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone

from config import config
from utils.validators import file_kind, get_extension, safe_filename

META_FILENAME = "meta.json"


def _file_dir(file_id: str) -> str:
    return os.path.join(config.UPLOAD_FOLDER, file_id)


def _meta_path(file_id: str) -> str:
    return os.path.join(_file_dir(file_id), META_FILENAME)


def _cache_path(file_id: str, name: str) -> str:
    return os.path.join(_file_dir(file_id), f"{name}.json")


def save_upload(file_storage) -> dict:
    """Persists an uploaded werkzeug FileStorage to its own folder and
    returns the metadata dict (also written to meta.json alongside it).
    """
    file_id = uuid.uuid4().hex
    original_name = safe_filename(file_storage.filename)
    ext = get_extension(original_name)
    kind = file_kind(original_name)

    folder = _file_dir(file_id)
    os.makedirs(folder, exist_ok=True)

    stored_path = os.path.join(folder, f"original.{ext}")
    file_storage.save(stored_path)

    meta = {
        "id": file_id,
        "filename": original_name,
        "extension": ext,
        "kind": kind,
        "size_bytes": os.path.getsize(stored_path),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "stored_path": stored_path,
    }
    with open(_meta_path(file_id), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    return meta


def get_meta(file_id: str) -> dict | None:
    path = _meta_path(file_id)
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_original_path(file_id: str) -> str | None:
    meta = get_meta(file_id)
    return meta["stored_path"] if meta else None


def cache_get(file_id: str, name: str):
    """Reads a previously cached derived JSON blob (e.g. 'stats', 'charts',
    'extraction'), or None if it hasn't been computed yet.
    """
    path = _cache_path(file_id, name)
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def cache_set(file_id: str, name: str, data) -> None:
    os.makedirs(_file_dir(file_id), exist_ok=True)
    with open(_cache_path(file_id, name), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def delete_upload(file_id: str) -> bool:
    folder = _file_dir(file_id)
    if not os.path.isdir(folder):
        return False
    for name in os.listdir(folder):
        os.remove(os.path.join(folder, name))
    os.rmdir(folder)
    return True


def exists(file_id: str) -> bool:
    return os.path.exists(_meta_path(file_id))
