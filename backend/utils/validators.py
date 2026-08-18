import os

from config import config


class UnsupportedFileType(ValueError):
    """Raised when an uploaded file's extension isn't one Basira supports."""


def get_extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def is_allowed_file(filename: str) -> bool:
    return get_extension(filename) in config.ALLOWED_EXTENSIONS


def file_kind(filename: str) -> str:
    """Returns 'tabular' for Excel/CSV files, 'pdf' for PDFs.

    Raises UnsupportedFileType for anything else — callers should validate
    with is_allowed_file() first, but this is a safe second guard.
    """
    ext = get_extension(filename)
    if ext in config.ALLOWED_TABULAR_EXTENSIONS:
        return "tabular"
    if ext in config.ALLOWED_PDF_EXTENSIONS:
        return "pdf"
    raise UnsupportedFileType(f"'.{ext}' is not a supported file type")


def safe_filename(filename: str) -> str:
    """Strips any directory components so the name is safe to display and
    store as metadata. Physical storage never uses this name directly as a
    path — each upload lives under its own UUID-named folder — so this only
    needs to guard against path traversal, not sanitize to ASCII (uploaded
    Arabic filenames should still display correctly).
    """
    name = os.path.basename(filename).replace("\\", "").strip()
    return name or "file"
