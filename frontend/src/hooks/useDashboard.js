import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

/**
 * useDashboard — fetches dashboard data based on role.
 * @param {'student' | 'mentor' | 'admin' | 'recruiter' | 'executive'} role
 * @returns {{ data, loading, error, refetch }}
 */
const useDashboard = (role = 'student') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;

      switch (role) {
        case 'student':
          response = await dashboardAPI.getStudent();
          break;
        case 'mentor':
          response = await dashboardAPI.getMentor();
          break;
        case 'admin':
        case 'executive':
          response = await dashboardAPI.getAdmin();
          break;
        case 'recruiter':
          // Recruiter uses admin stats + resume list
          response = await dashboardAPI.getAdmin();
          break;
        default:
          response = await dashboardAPI.getStudent();
      }

      setData(response?.data ?? response);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load dashboard data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return { data, loading, error, refetch: fetchData };
};

export default useDashboard;
