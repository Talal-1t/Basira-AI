# Basira AI — Backend

Flask API that powers file upload, analysis, and AI chat for Basira AI.
Matches the spec's stack: Flask, Flask-CORS, pandas, NumPy, openpyxl,
pdfplumber, PyPDF2, and Groq (Llama 3.3).

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # then add your GROQ_API_KEY
python app.py
```

The API runs on `http://localhost:5000` by default. Health check:
`GET http://localhost:5000/api/health`.

Get a free Groq API key at https://console.groq.com/keys. Without one,
upload/stats/charts still work fully — only the AI endpoints
(`/insights`, `/chat`) return a `503 ai_not_configured` error until a key is
set.

## Arabic text handling

- **CSV files**: encoding is auto-detected (`services/excel_service.py`).
  CSVs exported from Excel on an Arabic Windows locale are usually `cp1256`,
  not UTF-8 — reading them as UTF-8 produces mojibake even though the file
  itself is fine. This is detected and handled automatically.
- **PDF files**: Arabic-majority lines are corrected for RTL reading order
  using `arabic-reshaper` + `python-bidi` (`services/pdf_service.py`).
  pdfplumber extracts glyphs by position regardless of script direction,
  which often reverses Arabic text. This is a best-effort heuristic — set
  `ARABIC_PDF_FIX=false` in `.env` if it ever makes a specific document look
  worse instead of better.

## How a file flows through the API

1. `POST /api/upload` — saves the file, runs analysis immediately (pandas
   for Excel/CSV, pdfplumber/PyPDF2 for PDF), and returns everything needed
   for the first dashboard paint.
2. `GET /api/files/:id` — re-fetch the same dashboard payload later
   (stats + charts, or PDF extraction) without re-uploading.
3. `GET /api/files/:id/insights` — AI-generated summary, key points,
   anomalies/important numbers, and recommendations/FAQ. Cached after the
   first call; pass `?refresh=true` to force regeneration.
4. `POST /api/files/:id/chat` — ask a question about the file; answers are
   grounded in the actual extracted data, not general knowledge.
5. `DELETE /api/files/:id` — removes the file and all cached data.

## API reference

### `POST /api/upload`
`multipart/form-data`, field name `file`. Accepts `.xlsx`, `.xls`, `.csv`,
`.pdf`, up to 500MB by default (configurable via `MAX_UPLOAD_MB`).

Tabular response:
```json
{
  "success": true,
  "data": {
    "meta": { "id": "...", "filename": "sales.xlsx", "kind": "tabular", "...": "..." },
    "stats": {
      "shape": { "rows": 1200, "columns": 8 },
      "missing_values": { "total": 14, "percent_of_cells": 0.15, "by_column": { "...": 0 } },
      "duplicate_rows": 3,
      "column_types": { "region": "categorical", "revenue": "numeric" },
      "numeric_stats": { "revenue": { "mean": 4820.5, "min": 0, "max": 91000, "...": "..." } },
      "categorical_stats": { "region": [{ "value": "East", "count": 320 }] }
    },
    "charts": [
      { "type": "pie", "title": "Distribution of region", "data": [{ "label": "East", "value": 320 }] },
      { "type": "bar", "title": "revenue by region", "data": [{ "label": "East", "value": 91000 }] }
    ]
  }
}
```

PDF response:
```json
{
  "success": true,
  "data": {
    "meta": { "id": "...", "filename": "report.pdf", "kind": "pdf", "...": "..." },
    "extraction": {
      "page_count": 12,
      "text": "...",
      "headings": [{ "text": "Executive Summary", "page": 1 }],
      "tables": [{ "page": 4, "rows": [["Q1", "Q2"], ["120", "140"]] }]
    }
  }
}
```

### `GET /api/files/:id`
Same shape as the upload response, recomputed from cache when available.

### `GET /api/files/:id/insights`
```json
{
  "success": true,
  "data": {
    "summary": "...",
    "key_points": ["...", "..."],
    "anomalies": ["..."],
    "recommendations": ["..."]
  }
}
```
PDF files get `important_numbers` and `faq` instead of `anomalies` /
`recommendations`.

### `POST /api/files/:id/chat`
Request body:
```json
{ "question": "Which month had the highest sales?", "history": [{ "role": "user", "content": "..." }] }
```
Response:
```json
{ "success": true, "data": { "question": "...", "answer": "..." } }
```

### `DELETE /api/files/:id`
Removes the file and its cached stats/charts/insights.

## Error format

Every error follows the same envelope:
```json
{ "success": false, "error": { "message": "...", "code": "unsupported_type" } }
```

## Project structure

```
backend/
  app.py                  Flask app factory, blueprint registration, error handlers
  config.py                Env-driven configuration
  routes/                  Thin HTTP handlers (upload, files, chat, health)
  services/
    storage_service.py      Per-upload folder + JSON cache on disk
    excel_service.py         pandas analysis for Excel/CSV
    chart_service.py         Pie/bar/line/scatter chart builders
    pdf_service.py            pdfplumber/PyPDF2 text, table, heading extraction
    file_service.py            Orchestrates the above; what routes call
  ai/
    groq_client.py           Thin Groq wrapper, lazy init, JSON-mode parsing
    prompts.py                 Prompt templates (chat, dataset insights, PDF insights)
    service.py                  High-level AI operations used by file_service
  utils/
    validators.py             File-type checks
    responses.py               Standard JSON envelopes + numpy/pandas-safe serialization
  uploads/                   Runtime storage — one folder per upload, gitignored
```

## Deployment (Render)

- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`
- Set `GEMINI_API_KEY` and `CORS_ORIGINS` (your Vercel frontend URL) as
  environment variables in the Render dashboard.
- Uploads are stored on local disk, which is ephemeral on Render's free
  tier — files won't survive a redeploy. For production, swap
  `storage_service.py`'s local filesystem calls for an object store (e.g.
  S3-compatible storage); every other service only depends on that module's
  public functions, so the change is isolated to one file.
