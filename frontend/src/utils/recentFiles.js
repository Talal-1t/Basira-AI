const STORAGE_KEY = 'basira:recent_files';
const MAX_ENTRIES = 30;

export function getRecentFiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentFile(entry) {
  try {
    const existing = getRecentFiles().filter((f) => f.id !== entry.id);
    const next = [{ ...entry, savedAt: Date.now() }, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('basira:recent-files-changed'));
  } catch {
    // localStorage can fail in private-browsing mode — not worth surfacing an error for.
  }
}

export function removeRecentFile(id) {
  try {
    const next = getRecentFiles().filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('basira:recent-files-changed'));
  } catch {
    // ignore
  }
}
