import React from 'react';
import classNames from 'classnames';

const Button = ({ children, variant = 'primary', isLoading = false, className = '', disabled = false, type = 'button', onClick }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-primary hover:bg-secondary text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-primary py-2.5 px-6',
    secondary: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary py-2.5 px-6',
    danger: 'bg-error hover:bg-red-700 text-white shadow-md focus:ring-error py-2.5 px-6',
    ghost: 'text-content-secondary hover:bg-surface-hover py-2.5 px-6',
    success: 'bg-success hover:bg-green-600 text-white shadow-md focus:ring-success py-2.5 px-6',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={classNames(base, variants[variant], className)}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
