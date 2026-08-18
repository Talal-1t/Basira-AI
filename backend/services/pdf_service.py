from __future__ import annotations

import re
import statistics

import pdfplumber
from PyPDF2 import PdfReader

from config import config

MAX_TABLES = 25
MAX_HEADINGS = 60
HEADING_SIZE_RATIO = 1.15  # a line counts as a heading if its font is this much bigger than the page median
HEADING_MAX_CHARS = 120

_ARABIC_RANGE = re.compile(r"[\u0600-\u06FF\u0750-\u077F]")
_ARABIC_FIX_WARNED = False


def _fix_arabic_line(line: str) -> str:
    """Corrects RTL word/letter order for Arabic-majority lines.

    pdfplumber extracts glyph positions left-to-right regardless of the
    script's reading direction, which frequently leaves Arabic text visually
    reversed or with disconnected letterforms. Reshaping + the bidi
    algorithm restores normal reading order. Only applied to lines where
    Arabic characters are the majority, so Latin/mixed lines (numbers,
    English headers, etc.) are left untouched. Silently no-ops if the
    optional arabic-reshaper / python-bidi packages aren't installed.
    """
    global _ARABIC_FIX_WARNED
    if not config.ARABIC_PDF_FIX or not line.strip():
        return line

    letters = [c for c in line if c.isalpha()]
    if not letters:
        return line
    arabic_ratio = sum(1 for c in letters if _ARABIC_RANGE.match(c)) / len(letters)
    if arabic_ratio < 0.5:
        return line

    try:
        import arabic_reshaper
        from bidi.algorithm import get_display

        reshaped = arabic_reshaper.reshape(line)
        return get_display(reshaped)
    except ImportError:
        if not _ARABIC_FIX_WARNED:
            print(
                "[Basira] arabic-reshaper/python-bidi not installed — "
                "Arabic PDF text extraction may look reversed. "
                "Run: pip install arabic-reshaper python-bidi"
            )
            _ARABIC_FIX_WARNED = True
        return line
    except Exception:
        return line  # never let a text-shaping edge case break extraction


def _fix_arabic_text(text: str) -> str:
    return "\n".join(_fix_arabic_line(line) for line in text.split("\n"))


def _page_metadata(path: str) -> dict:
    try:
        reader = PdfReader(path)
        info = reader.metadata or {}
        return {
            "page_count": len(reader.pages),
            "title": str(info.title) if info and info.title else None,
            "author": str(info.author) if info and info.author else None,
        }
    except Exception:
        # PyPDF2 is a secondary source here — pdfplumber below is what
        # actually drives extraction, so metadata failures aren't fatal.
        return {"page_count": None, "title": None, "author": None}


def _extract_headings(page, page_number: int) -> list[dict]:
    """Heuristic heading detection: words are grouped into lines by their
    'top' position, and a line is treated as a heading if its font size is
    meaningfully larger than the page's median font size and it's short
    enough to plausibly be a title rather than a paragraph.
    """
    try:
        words = page.extract_words(extra_attrs=["size"])
    except Exception:
        return []
    if not words:
        return []

    sizes = [w["size"] for w in words if "size" in w]
    if not sizes:
        return []
    median_size = statistics.median(sizes)

    lines: dict[float, list[dict]] = {}
    for w in words:
        top = round(w["top"], 1)
        lines.setdefault(top, []).append(w)

    headings = []
    for top in sorted(lines):
        line_words = lines[top]
        text = " ".join(w["text"] for w in line_words).strip()
        avg_size = sum(w.get("size", median_size) for w in line_words) / len(line_words)
        if (
            text
            and len(text) <= HEADING_MAX_CHARS
            and avg_size >= median_size * HEADING_SIZE_RATIO
        ):
            headings.append(
                {"text": _fix_arabic_line(text), "page": page_number, "font_size": round(avg_size, 1)}
            )
    return headings


def extract(path: str) -> dict:
    """Extracts text, tables, and heuristically-detected headings from a
    PDF. Returns everything the dashboard and AI layer need — nothing here
    calls the AI provider; summarization happens in ai/groq_client.py from
    this extracted text.
    """
    meta = _page_metadata(path)

    page_texts: list[str] = []
    tables: list[dict] = []
    headings: list[dict] = []

    with pdfplumber.open(path) as pdf:
        page_count = meta["page_count"] or len(pdf.pages)

        for i, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            page_texts.append(_fix_arabic_text(text))

            if len(headings) < MAX_HEADINGS:
                headings.extend(_extract_headings(page, i))

            if len(tables) < MAX_TABLES:
                for table in page.extract_tables() or []:
                    if len(tables) >= MAX_TABLES:
                        break
                    rows = [
                        [_fix_arabic_line(cell) if isinstance(cell, str) else cell for cell in row]
                        for row in table
                        if any(cell not in (None, "") for cell in row)
                    ]
                    if rows:
                        tables.append({"page": i, "rows": rows})

    full_text = "\n\n".join(t for t in page_texts if t).strip()

    return {
        "page_count": page_count,
        "title": meta["title"],
        "author": meta["author"],
        "text": full_text,
        "char_count": len(full_text),
        "headings": headings[:MAX_HEADINGS],
        "tables": tables[:MAX_TABLES],
    }


def to_context_text(extraction: dict, max_chars: int = 14000) -> str:
    """Truncated, readable text block for grounding AI summaries/chat —
    full documents can be far larger than a prompt should carry."""
    text = extraction["text"]
    if len(text) > max_chars:
        text = text[:max_chars] + "\n\n[...truncated...]"
    headings = ", ".join(h["text"] for h in extraction["headings"][:15])
    parts = [f"Document: {extraction.get('title') or 'Untitled'} ({extraction['page_count']} pages)"]
    if headings:
        parts.append(f"Headings found: {headings}")
    parts.append("Extracted text:\n" + text)
    return "\n".join(parts)
