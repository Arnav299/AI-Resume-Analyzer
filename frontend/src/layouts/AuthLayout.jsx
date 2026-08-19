import React from 'react';
import { Link } from 'react-router-dom';

/**
 * AuthLayout — centered layout for login/register/onboarding pages.
 * Provides animated gradient background with floating orbs.
 */
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden hero-gradient">
      {/* Animated background orbs */}
      <div
        className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full opacity-20 blob"
        style={{ background: 'radial-gradient(circle, #6C63FF, transparent)' }}
      />
      <div
        className="absolute bottom-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-15 blob blob-delay-4"
        style={{ background: 'radial-gradient(circle, #00D4FF, transparent)' }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full opacity-10 blob blob-delay-2"
        style={{ background: 'radial-gradient(circle, #A78BFA, transparent)' }}
      />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}
            >
              <span className="text-white font-black text-xl">R</span>
            </div>
            <span
              className="font-bold text-xl text-primary"
            >
              ResumeAI
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 shadow-2xl glass">
          {(title || subtitle) && (
            <div className="text-center mb-7">
              {title && <h1 className="text-2xl font-extrabold text-content">{title}</h1>}
              {subtitle && <p className="text-sm text-content-secondary mt-1.5">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
