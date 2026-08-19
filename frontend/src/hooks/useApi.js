import { useState, useCallback } from 'react';

/**
 * useApi — generic data-fetching hook.
 *
 * @param {() => Promise<any>} apiFn — async function that returns axios response
 * @returns {{ data, loading, error, execute, reset }}
 *
 * @example
 * const { data, loading, error, execute } = useApi(dashboardAPI.getStudent);
 * useEffect(() => { execute(); }, []);
 */
const useApi = (apiFn) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFn(...args);
        const result = response?.data ?? response;
        setData(result);
        return result;
      } catch (err) {
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'An unexpected error occurred.';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

export default useApi;
