import React from 'react';

/**
 * LoadingSpinner — versatile spinner component.
 * @param {'fullpage' | 'inline' | 'overlay'} variant
 * @param {string} [message]
 * @param {string} [size] — 'sm' | 'md' | 'lg'
 */
const SpinnerCore = ({ spinnerClass, message }) => (
  <div className="flex flex-col items-center gap-4">
    {/* Outer ring */}
    <div className="relative flex items-center justify-center">
      <div
        className={`${spinnerClass} rounded-full animate-spin`}
        style={{
          border: '3px solid rgba(108,99,255,0.15)',
          borderTopColor: '#6C63FF',
          borderRightColor: '#00D4FF',
        }}
      />
      {/* Inner pulse dot */}
      <div
        className="absolute w-2 h-2 rounded-full animate-pulse"
        style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}
      />
    </div>
    {message && (
      <p className="text-sm font-medium animate-pulse" style={{ color: 'rgba(108,99,255,0.8)' }}>
        {message}
      </p>
    )}
  </div>
);

const LoadingSpinner = ({ variant = 'inline', message = 'Loading…', size = 'md' }) => {
  const sizes = { sm: 'h-6 w-6', md: 'h-12 w-12', lg: 'h-20 w-20' };
  const spinnerClass = sizes[size] || sizes.md;

  if (variant === 'fullpage') {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ background: 'linear-gradient(135deg, #0A0E1A 0%, #130D2E 50%, #0A1A2E 100%)' }}
      >
        <SpinnerCore spinnerClass={spinnerClass} message={message} />
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center rounded-2xl z-20"
        style={{ background: 'rgba(10,14,26,0.7)', backdropFilter: 'blur(8px)' }}
      >
        <SpinnerCore spinnerClass={spinnerClass} message={message} />
      </div>
    );
  }

  // Default: inline
  return (
    <div className="flex items-center justify-center py-12">
      <SpinnerCore spinnerClass={spinnerClass} message={message} />
    </div>
  );
};

export default LoadingSpinner;
