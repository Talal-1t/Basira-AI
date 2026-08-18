import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://basira-ai.onrender.com/api',
});

// دالة مساعدة معالجة الاستجابات بأمان لمنع استلام undefined
const handleResponse = (res) => {
  if (res.data && res.data.data !== undefined) {
    return res.data.data;
  }
  return res.data;
};

export function uploadFile(file, onProgress) {
  const form = new FormData();
  form.append('file', file);
  return api
    .post('/upload', form, {
      onUploadProgress: onProgress
        ? (e) => onProgress(e.total ? Math.round((e.loaded / e.total) * 100) : 0)
        : undefined,
    })
    .then(handleResponse);
}

export function getFile(fileId) {
  return api.get(`/files/${fileId}`).then(handleResponse);
}

export function getInsights(fileId, { refresh = false } = {}) {
  return api
    .get(`/files/${fileId}/insights`, { params: refresh ? { refresh: 'true' } : undefined })
    .then(handleResponse);
}

export function askQuestion(fileId, question, history = []) {
  return api
    .post(`/files/${fileId}/chat`, { question, history })
    .then(handleResponse);
}

export function deleteFile(fileId) {
  return api.delete(`/files/${fileId}`).then(handleResponse);
}

export function exportXlsx(fileId, filename) {
  return downloadBlob(`/files/${fileId}/export/xlsx`, `${filename}-basira-report.xlsx`);
}

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

export function askCombinedQuestion(fileIds, question, history = []) {
  return api
    .post('/combined/chat', { file_ids: fileIds, question, history })
    .then(handleResponse);
}