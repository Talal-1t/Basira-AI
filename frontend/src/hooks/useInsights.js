import { useCallback, useEffect, useState } from 'react';
import { getInsights } from '../services/api.js';

export function useInsights(fileId) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  const load = useCallback(
    async (refresh = false) => {
      if (!fileId) return;
      setLoading(true);
      setError(null);
      setErrorCode(null);
      try {
        const result = await getInsights(fileId, { refresh });
        setInsights(result);
      } catch (err) {
        setError(err?.response?.data?.error?.message || 'Failed to generate insights.');
        setErrorCode(err?.response?.data?.error?.code || null);
      } finally {
        setLoading(false);
      }
    },
    [fileId]
  );

  useEffect(() => {
    load();
  }, [load]);

  return { insights, loading, error, errorCode, reload: load };
}
