from __future__ import annotations

import pandas as pd

MAX_PIE_SLICES = 8
MAX_BAR_CATEGORIES = 12
MAX_LINE_POINTS = 200
MAX_SCATTER_POINTS = 500


def _numeric_columns(df: pd.DataFrame) -> list[str]:
    return [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]


def _categorical_columns(df: pd.DataFrame, max_levels: int = 20) -> list[str]:
    return [
        c
        for c in df.columns
        if not pd.api.types.is_numeric_dtype(df[c]) and df[c].nunique(dropna=True) <= max_levels
    ]


def _datetime_columns(df: pd.DataFrame) -> list[str]:
    cols = [c for c in df.columns if pd.api.types.is_datetime64_any_dtype(df[c])]
    if cols:
        return cols
    # heuristic: object columns that parse cleanly as dates
    for c in df.columns:
        if df[c].dtype == object:
            sample = df[c].dropna().head(30)
            if len(sample) and pd.to_datetime(sample, errors="coerce", format="mixed").notna().mean() > 0.8:
                cols.append(c)
    return cols


def build_pie_chart(df: pd.DataFrame) -> dict | None:
    cat_cols = _categorical_columns(df, max_levels=MAX_PIE_SLICES)
    if not cat_cols:
        return None
    col = cat_cols[0]
    counts = df[col].value_counts(dropna=True).head(MAX_PIE_SLICES)
    return {
        "type": "pie",
        "title": f"Distribution of {col}",
        "category_column": col,
        "data": [{"label": str(k), "value": int(v)} for k, v in counts.items()],
    }


def build_bar_chart(df: pd.DataFrame) -> dict | None:
    cat_cols = _categorical_columns(df, max_levels=MAX_BAR_CATEGORIES)
    num_cols = _numeric_columns(df)
    if not cat_cols or not num_cols:
        return None
    cat_col, num_col = cat_cols[0], num_cols[0]
    grouped = df.groupby(cat_col)[num_col].sum().sort_values(ascending=False).head(MAX_BAR_CATEGORIES)
    return {
        "type": "bar",
        "title": f"{num_col} by {cat_col}",
        "category_column": cat_col,
        "value_column": num_col,
        "data": [{"label": str(k), "value": float(v)} for k, v in grouped.items()],
    }


def build_line_chart(df: pd.DataFrame) -> dict | None:
    date_cols = _datetime_columns(df)
    num_cols = _numeric_columns(df)
    if not date_cols or not num_cols:
        return None
    date_col, num_col = date_cols[0], num_cols[0]
    series = df[[date_col, num_col]].dropna()
    series[date_col] = pd.to_datetime(series[date_col], errors="coerce", format="mixed")
    series = series.dropna().sort_values(date_col).head(MAX_LINE_POINTS)
    return {
        "type": "line",
        "title": f"{num_col} over {date_col}",
        "x_column": date_col,
        "y_column": num_col,
        "data": [
            {"x": row[date_col].isoformat(), "y": float(row[num_col])}
            for _, row in series.iterrows()
        ],
    }


def build_scatter_chart(df: pd.DataFrame) -> dict | None:
    num_cols = _numeric_columns(df)
    if len(num_cols) < 2:
        return None
    x_col, y_col = num_cols[0], num_cols[1]
    points = df[[x_col, y_col]].dropna().head(MAX_SCATTER_POINTS)
    return {
        "type": "scatter",
        "title": f"{y_col} vs {x_col}",
        "x_column": x_col,
        "y_column": y_col,
        "data": [{"x": float(row[x_col]), "y": float(row[y_col])} for _, row in points.iterrows()],
    }


def build_charts(df: pd.DataFrame) -> list[dict]:
    """Returns whichever chart types make sense for this dataframe's shape —
    not every dataset has a date column or a low-cardinality category, so
    charts that don't apply are simply omitted rather than faked.
    """
    builders = [build_pie_chart, build_bar_chart, build_line_chart, build_scatter_chart]
    charts = []
    for build in builders:
        chart = build(df)
        if chart:
            charts.append(chart)
    return charts
