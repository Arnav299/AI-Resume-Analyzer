import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { authAPI } from '../services/api';

const OrgRegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'recruiter' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.full_name) errs.full_name = 'Organization/Company Name is required.';
    if (!form.email) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    setApiError('');
    setSuccessMsg('');

    try {
      await authAPI.register(form);
      setSuccessMsg('Organization account successfully created! Redirecting to login...');
      setTimeout(() => {
        navigate('/org-login');
      }, 2000);
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        setApiError(err.response.data?.detail || 'Account with this email already exists.');
      } else if (status === 422) {
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
          setApiError(detail.map(d => d.msg || JSON.stringify(d)).join(', '));
        } else {
          setApiError(String(detail) || 'Validation error. Check your inputs.');
        }
      } else if (!err.response) {
        setApiError('Cannot connect to the server. Please ensure the backend is running on port 8000.');
      } else {
        setApiError(err.response.data?.detail || `Registration failed (${status}). Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #0A0E1A 0%, #130D2E 50%, #0A1A2E 100%)' }}>
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              <span className="text-white font-bold text-2xl">🏢</span>
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Organization Registration</h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Join to find and analyze top candidates</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-2xl border-0" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {apiError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">
              ⚠️ {apiError}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-medium">
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            
            {/* Organization Name */}
            <div className="mb-5">
              <label className="label text-content-muted">Organization / Company Name</label>
              <input
                type="text"
                className={`input-field bg-surface/5 border-white/10 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.full_name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                placeholder="Acme Corp"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
              {errors.full_name && <p className="text-red-400 text-xs mt-1 font-medium">{errors.full_name}</p>}
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="label text-content-muted">Work Email Address</label>
              <input
                type="email"
                className={`input-field bg-surface/5 border-white/10 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                placeholder="hr@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="label text-content-muted">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`input-field pr-12 bg-surface/5 border-white/10 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.password ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            <Button type="submit" isLoading={isLoading} className="w-full text-base py-3 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              Create Organization Account
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-white/10 pt-6">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Already have an account?{' '}
              <Link to="/org-login" className="font-semibold hover:underline" style={{ color: '#10B981' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgRegisterPage;
