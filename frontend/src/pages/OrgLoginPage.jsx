import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { authAPI } from '../services/api';

const OrgLoginPage = () => {
  const { login, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);

  React.useEffect(() => {
    const checkHealth = async () => {
      try {
        await authAPI.checkHealth();
        setIsBackendHealthy(true);
        setIsOffline(false);
      } catch (err) {
        setIsBackendHealthy(false);
        setIsOffline(true);
      }
    };

    checkHealth();
    const intervalId = setInterval(checkHealth, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (isLoading) return;
    setErrors({});
    setIsLoading(true);
    setApiError('');
    setIsOffline(false);

    try {
      // Step 1: Login — get real JWT from backend
      const res = await authAPI.login(form);
      const { access_token } = res.data;

      // Step 2: Temporarily store token so getMe interceptor can use it
      localStorage.setItem('rocas_token', access_token);

      // Step 3: Fetch full user profile (id, email, full_name, role, is_active)
      const userRes = await authAPI.getMe();
      const userData = userRes.data;

      // Step 4: Complete the login — store real token + user object
      login(userData, access_token);

      // Step 5: Role-based redirect using centralized helper
      navigate(getDashboardRoute(userData.role));
    } catch (err) {
      // Ensure no stale or invalid token ever persists
      localStorage.removeItem('rocas_token');
      localStorage.removeItem('rocas_user');

      const status = err.response?.status;

      if (status === 401 || status === 400) {
        setApiError(
          err.response?.data?.detail || 'Incorrect email or password. Please try again.'
        );
      } else if (status === 422) {
        setApiError('Validation error. Check your inputs and retry.');
      } else if (
        status === 502 || status === 503 || status === 504 ||
        err.isGatewayError || err.isNetworkError || !err.response
      ) {
        // Backend is genuinely offline — show a clear offline message
        setIsOffline(true);
        setApiError(
          'Backend server is unreachable. Make sure FastAPI is running on port 8000, then try again.'
        );
      } else {
        const msg = err.response?.data?.detail || err.response?.data?.message || 'unexpected error';
        setApiError(`Login failed (${status ?? 'network error'}): ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--theme-hero-gradient)' }}
    >
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
            >
              <span className="text-white font-bold text-2xl">🏢</span>
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-content">Organization Portal</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            Sign in to manage and analyze candidates
          </p>
        </div>

        {/* Card */}
        <div
          className="card p-8 shadow-2xl border-0"
          style={{ background: 'var(--theme-glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--theme-glass-border)' }}
        >
          {/* Error Banner */}
          {!isBackendHealthy && !apiError && (
            <div className="mb-4 p-4 rounded-xl text-sm font-medium flex flex-col gap-2"
              style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)',
                color: '#FCD34D'
              }}
            >
              <div>🔌 Backend server is currently offline.</div>
              <div className="text-xs mt-1 opacity-80">
                <strong>How to start:</strong> Open a terminal and run{' '}
                <code className="bg-black/30 px-1 py-0.5 rounded font-mono">
                  cd backend && uvicorn app.main:app --reload --port 8000
                </code>
              </div>
            </div>
          )}

          {apiError && (
            <div className="mb-4 p-4 rounded-xl text-sm font-medium flex flex-col gap-2"
              style={{
                background: isOffline ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                border: isOffline ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(239,68,68,0.3)',
                color: isOffline ? '#FCD34D' : '#FCA5A5'
              }}
            >
              <div>{isOffline ? '🔌' : '⚠️'} {apiError}</div>
              {isOffline && (
                <div className="text-xs mt-1 opacity-80">
                  <strong>How to start:</strong> Open a terminal and run{' '}
                  <code className="bg-black/30 px-1 py-0.5 rounded font-mono">
                    cd backend && uvicorn app.main:app --reload --port 8000
                  </code>{' '}
                  then click Sign In again.
                </div>
              )}
            </div>
          )}

          {/* Quick-Fill Demo Recruiter Account */}
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
            <p className="text-xs font-bold text-emerald-400 mb-2.5 uppercase tracking-wide">
              ⚡ Quick-Fill Recruiter Account
            </p>
            <button
              type="button"
              onClick={() => setForm({ email: 'recruiter@rocas.ai', password: 'recruiter123' })}
              className="w-full text-left px-3 py-2 bg-page hover:bg-surface-hover border border-border-default rounded-xl text-xs font-medium text-content transition-all shadow-sm flex items-center justify-between"
            >
              <span>🏢 <b>Recruiter Portal</b> (recruiter@rocas.ai)</span>
              <span className="text-emerald-400 font-semibold">Click to Fill →</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-5">
              <label className="label text-content-muted">Work Email Address</label>
              <input
                type="email"
                id="org-email"
                className={`input-field bg-page border-border-default text-content placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                placeholder="hr@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="label text-content-muted">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  id="org-password"
                  className={`input-field pr-12 bg-page border-border-default text-content placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.password ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-muted text-sm"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1 font-medium">{errors.password}</p>}
            </div>

            {/* Forgot */}
            <div className="flex justify-end mb-6">
              <button type="button" className="text-sm hover:underline font-medium" style={{ color: '#34D399' }}>
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full text-base py-3 text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
            >
              Sign In to Portal
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-border-default pt-6">
            <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
              Don't have an organization account?{' '}
              <Link to="/org-register" className="font-semibold hover:underline" style={{ color: '#10B981' }}>
                Register here
              </Link>
            </p>
            <p className="text-sm mt-3" style={{ color: 'var(--theme-text-secondary)' }}>
              Looking for student or mentor login?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: '#6C63FF' }}>
                Go here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgLoginPage;
