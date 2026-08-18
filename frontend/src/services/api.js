import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  // No default Content-Type here on purpose — axios auto-detects it per
  // request (JSON for plain objects, multipart+boundary for FormData). A
  // blanket 'application/json' default can leak into file uploads and
  // silently break the multipart boundary.
});

/**
 * Uploads a file (Excel/CSV/PDF) and returns the initial dashboard payload
 * ({ meta, stats, charts } for tabular files, { meta, extraction } for PDFs).
 */
export function uploadFile(file, onProgress) {
  const form = new FormData();
  form.append('file', file);
  return api
    .post('/upload', form, {
      // No Content-Type set here on purpose — the browser needs to add its
      // own multipart boundary parameter automatically. Setting it manually
      // (even to 'multipart/form-data') strips that boundary and breaks
      // the upload silently.
      onUploadProgress: onProgress
        ? (e) => onProgress(e.total ? Math.round((e.loaded / e.total) * 100) : 0)
        : undefined,
    })
    .then((res) => res.data.data);
}

/** Re-fetches the dashboard payload for a previously uploaded file. */
export function getFile(fileId) {
  return api.get(`/files/${fileId}`).then((res) => res.data.data);
}

/**
 * AI-generated summary/key points/anomalies/recommendations (or
 * important_numbers/faq for PDFs). Cached server-side after the first call.
 */
export function getInsights(fileId, { refresh = false } = {}) {
  return api
    .get(`/files/${fileId}/insights`, { params: refresh ? { refresh: 'true' } : undefined })
    .then((res) => res.data.data);
}

/** Asks a question about a specific file, grounded in its extracted data. */
export function askQuestion(fileId, question, history = []) {
  return api
    .post(`/files/${fileId}/chat`, { question, history })
    .then((res) => res.data.data);
}

export function deleteFile(fileId) {
  return api.delete(`/files/${fileId}`).then((res) => res.data.data);
}

/** Downloads a real .xlsx export of a file's analysis and triggers a save. */
export function exportXlsx(fileId, filename) {
  return downloadBlob(`/files/${fileId}/export/xlsx`, `${filename}-basira-report.xlsx`);
}

/** Downloads a real .pdf report of a file's analysis and triggers a save. */
export function exportPdf(fileId, filename) {
  return downloadBlob(`/files/${fileId}/export/pdf`, `${filename}-basira-report.pdf`);
}

function downloadBlob(path, downloadName) {
  return api.get(path, { responseType: 'blob' }).then((res) => {
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/** Asks a question grounded in the combined context of several files. */
export function askCombinedQuestion(fileIds, question, history = []) {
  return api
    .post('/combined/chat', { file_ids: fileIds, question, history })
    .then((res) => res.data.data);
}
