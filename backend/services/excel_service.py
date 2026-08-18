from __future__ import annotations

import os

import numpy as np
import pandas as pd

MAX_CATEGORY_LEVELS = 12  # categorical stats stop being useful past this cardinality
SAMPLE_ROWS = 20  # rows of the actual data included in AI/chat context

# Encodings tried in order when reading a CSV. utf-8-sig/utf-8 cover the vast
# majority of files; cp1256 and cp720 are the common Windows/legacy Arabic
# encodings that show up when a CSV was exported from Excel with an Arabic
# locale — without this, Arabic text reads back as mojibake (garbled boxes
# and question marks) even though the file itself isn't corrupted.
CSV_ENCODING_CANDIDATES = ["utf-8-sig", "utf-8", "cp1256", "cp720", "cp1252", "latin-1"]


def _detect_csv_encoding(path: str) -> str:
    """Picks the best-guess encoding for a CSV using charset-normalizer,
    falling back to trying each candidate encoding directly if detection
    is inconclusive. Returns the first encoding that can actually decode
    the file without errors.
    """
    try:
        from charset_normalizer import from_path

        best = from_path(path).best()
        if best is not None and best.encoding:
            encoding = best.encoding
            # Normalize any UTF-8 variant to utf-8-sig so a leading BOM (common
            # in Excel-exported CSVs) gets stripped instead of leaking into
            # the first column name as a stray character.
            if encoding.replace("-", "_").lower() in ("utf_8", "utf8"):
                return "utf-8-sig"
            return encoding
    except Exception:
        pass

    for encoding in CSV_ENCODING_CANDIDATES:
        try:
            with open(path, "r", encoding=encoding) as f:
                f.read(4096)
            return encoding
        except (UnicodeDecodeError, LookupError):
            continue
    return "utf-8"  # last resort — pandas will raise a clear error if this is wrong


def read_tabular(path: str) -> pd.DataFrame:
    ext = os.path.splitext(path)[1].lower()
    if ext == ".csv":
        encoding = _detect_csv_encoding(path)
        # Sniff the separator instead of assuming a comma — exported CSVs
        # (Excel, regional locales) frequently use ';' or '\t'.
        return pd.read_csv(path, sep=None, engine="python", encoding=encoding)
    return pd.read_excel(path, engine="openpyxl" if ext == ".xlsx" else None)


def _classify_column(series: pd.Series) -> str:
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
    # try parsing as dates before giving up to "categorical"/"text"
    if series.dtype == object:
        sample = series.dropna().head(30)
        if len(sample) > 0:
            parsed = pd.to_datetime(sample, errors="coerce", format="mixed")
            if parsed.notna().mean() > 0.8:
                return "datetime"
    if series.nunique(dropna=True) <= MAX_CATEGORY_LEVELS:
        return "categorical"
    return "text"


def analyze(df: pd.DataFrame) -> dict:
    """Builds the full structural + statistical profile of a dataframe:
    shape, missing values, duplicates, per-column types, and numeric /
    categorical summaries — everything the dashboard needs to render.
    """
    n_rows, n_cols = df.shape
    missing_per_col = df.isna().sum()
    total_cells = n_rows * n_cols if n_cols else 0
    total_missing = int(missing_per_col.sum())
    duplicate_rows = int(df.duplicated().sum())

    column_types = {}
    numeric_stats = {}
    categorical_stats = {}

    for col in df.columns:
        series = df[col]
        col_type = _classify_column(series)
        column_types[str(col)] = col_type

        if col_type == "numeric":
            desc = series.describe()
            numeric_stats[str(col)] = {
                "count": int(desc.get("count", 0)),
                "mean": float(desc.get("mean")) if pd.notna(desc.get("mean")) else None,
                "std": float(desc.get("std")) if pd.notna(desc.get("std")) else None,
                "min": float(desc.get("min")) if pd.notna(desc.get("min")) else None,
                "max": float(desc.get("max")) if pd.notna(desc.get("max")) else None,
                "median": float(series.median()) if series.notna().any() else None,
                "sum": float(series.sum()) if series.notna().any() else None,
            }
        elif col_type == "categorical":
            counts = series.value_counts(dropna=True).head(MAX_CATEGORY_LEVELS)
            categorical_stats[str(col)] = [
                {"value": str(value), "count": int(count)}
                for value, count in counts.items()
            ]

    return {
        "shape": {"rows": n_rows, "columns": n_cols},
        "missing_values": {
            "total": total_missing,
            "percent_of_cells": round((total_missing / total_cells) * 100, 2) if total_cells else 0,
            "by_column": {str(k): int(v) for k, v in missing_per_col.items()},
        },
        "duplicate_rows": duplicate_rows,
        "empty_cells": total_missing,  # NaN/blank cells, same measure as missing_values.total
        "column_types": column_types,
        "numeric_stats": numeric_stats,
        "categorical_stats": categorical_stats,
        "columns": [str(c) for c in df.columns],
    }


def sample_rows(df: pd.DataFrame, n: int = SAMPLE_ROWS) -> list[dict]:
    """A small, JSON-safe sample of real rows — used to ground AI answers
    without shipping the whole (possibly huge) file into the prompt.
    """
    sample = df.head(n).copy()
    for col in sample.columns:
        if pd.api.types.is_datetime64_any_dtype(sample[col]):
            sample[col] = sample[col].astype(str)
    return sample.replace({np.nan: None}).to_dict(orient="records")


def to_context_text(df: pd.DataFrame, profile: dict, n: int = SAMPLE_ROWS) -> str:
    """Renders a compact, readable text block describing the dataset —
    this is what gets sent to the AI provider as grounding context.
    """
    lines = [
        f"Rows: {profile['shape']['rows']}, Columns: {profile['shape']['columns']}",
        f"Column types: {profile['column_types']}",
        f"Missing values: {profile['missing_values']['total']} "
        f"({profile['missing_values']['percent_of_cells']}% of cells)",
        f"Duplicate rows: {profile['duplicate_rows']}",
    ]
    if profile["numeric_stats"]:
        lines.append("Numeric column stats: " + str(profile["numeric_stats"]))
    if profile["categorical_stats"]:
        lines.append("Top categories per column: " + str(profile["categorical_stats"]))
    lines.append(f"Sample of first {min(n, len(df))} rows (JSON records):")
    lines.append(str(sample_rows(df, n)))
    return "\n".join(lines)
