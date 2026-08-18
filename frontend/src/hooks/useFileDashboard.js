import { useCallback, useEffect, useState } from 'react';
import { getFile } from '../services/api.js';

export function useFileDashboard(fileId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!fileId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getFile(fileId);
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to load this file.');
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
