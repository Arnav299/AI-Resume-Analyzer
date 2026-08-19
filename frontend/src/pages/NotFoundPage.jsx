import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0A0E1A 0%, #130D2E 50%, #0A1A2E 100%)' }}
    >
      {/* Background orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blob"
        style={{ background: 'radial-gradient(circle, #6C63FF, transparent)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-10 blob blob-delay-2"
        style={{ background: 'radial-gradient(circle, #00D4FF, transparent)', filter: 'blur(60px)' }}
      />

      <div className="relative max-w-lg w-full text-center animate-slide-up">
        {/* Giant 404 */}
        <div className="mb-4 select-none">
          <span
            className="text-9xl font-black"
            style={{
              background: 'linear-gradient(135deg, #6C63FF 0%, #00D4FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 40px rgba(108,99,255,0.4))',
              lineHeight: 1,
            }}
          >
            404
          </span>
        </div>

        {/* Illustration emoji */}
        <div className="text-6xl mb-6 animate-float">🧭</div>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Suggestions */}
        <div
          className="rounded-2xl p-5 mb-8 text-left"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <p className="text-sm font-semibold text-white mb-3">You might be looking for:</p>
          <div className="space-y-2">
            {[
              { label: 'Home', to: '/', icon: '🏠' },
              { label: 'Dashboard', to: '/dashboard', icon: '📊' },
              { label: 'Analyze Resume', to: '/analyze', icon: '🤖' },
              { label: 'Upload Resume', to: '/upload', icon: '📤' },
            ].map(({ label, to, icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-surface/10"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                <span>{icon}</span>
                <span>{label}</span>
                <span className="ml-auto" style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-surface/10"
            style={{
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            ← Go Back
          </button>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
              boxShadow: '0 4px 20px rgba(108,99,255,0.35)',
            }}
          >
            🏠 Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
