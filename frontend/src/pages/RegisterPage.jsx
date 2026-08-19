import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { authAPI } from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.full_name) errs.full_name = 'Full Name is required.';
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
      setSuccessMsg('Account successfully created! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      if (err.isNetworkError) {
        setApiError('Cannot connect to the server. Please make sure the backend is running.');
      } else if (err.response?.status === 400) {
        setApiError(err.response.data?.detail || 'Account with this email already exists.');
      } else if (err.response?.status === 422) {
        setApiError('Invalid registration data. Please check your inputs and try again.');
      } else {
        setApiError('An error occurred during registration. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-textDark">Create Account</h1>
          <p className="text-content-muted mt-2 text-sm">Join to supercharge your career</p>
        </div>

        {/* Card */}
        <div className="card p-8 shadow-xl border-0">
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-error text-sm font-medium">
              ⚠️ {apiError}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            
            {/* Full Name */}
            <div className="mb-5">
              <label className="label">Full Name</label>
              <input
                type="text"
                className={`input-field ${errors.full_name ? 'border-error ring-1 ring-error' : ''}`}
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
              {errors.full_name && <p className="text-error text-xs mt-1 font-medium">{errors.full_name}</p>}
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="label">Email Address</label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'border-error ring-1 ring-error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className="text-error text-xs mt-1 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`input-field pr-12 ${errors.password ? 'border-error ring-1 ring-error' : ''}`}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-secondary text-sm"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-error text-xs mt-1 font-medium">{errors.password}</p>}
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="label">I am a...</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'student' })}
                  className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                    form.role === 'student' 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-page text-content-secondary hover:bg-surface-hover'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'recruiter' })}
                  className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                    form.role === 'recruiter' 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-page text-content-secondary hover:bg-surface-hover'
                  }`}
                >
                  Recruiter
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full text-base py-3">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-content-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
