import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/upload', label: 'Upload Resume', icon: '📄' },
  { to: '/roles', label: 'Career Roles', icon: '🎯' },
  { to: '/analysis', label: 'Analysis Results', icon: '📊' },
  { to: '/skills', label: 'Skills Analysis', icon: '⚡' },
  { to: '/recommendations', label: 'AI Recommendations', icon: '💡' },
  { to: '/learning-path', label: 'Learning Path', icon: '🗺️' },
  { to: '/history', label: 'History', icon: '📋' },
  { to: '/report', label: 'Detailed Report', icon: '📄' },
  { to: '/mentor', label: 'Mentor Review', icon: '👨‍🏫' },
  { to: '/feedback', label: 'Feedback', icon: '💬' },
  { to: '/profile', label: 'My Profile', icon: '👤' },
  { to: '/student-manual', label: 'User Manual', icon: '📖' },
  { to: '/student-about', label: 'About the Product', icon: '📦' },
];


const Sidebar = () => {
  const { user, logout } = useAuth();
  const { resumeName, clearCurrentResume } = useResume();

  return (
    <aside className="w-64 min-h-screen bg-surface border-r border-border-subtle flex flex-col shadow-sm">
      {/* Brand */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <div>
            <p className="font-bold text-textDark text-lg leading-none"></p>
            <p className="text-xs text-content-muted mt-0.5">AI Career Portal</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-textDark text-sm truncate">{user?.name || 'Student'}</p>
            <p className="text-xs text-content-muted truncate">{user?.email || 'student@.ai'}</p>
          </div>
        </div>
      </div>

      {/* Current Resume */}
      {resumeName && (
        <div className="px-4 py-3 border-b border-border-subtle relative group">
          <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-1.5 flex justify-between items-center">
            Current Resume
            <button
              onClick={clearCurrentResume}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Remove current resume"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </p>
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-base flex-shrink-0">📄</span>
            <p className="text-xs font-semibold text-emerald-800 truncate" title={resumeName}>{resumeName}</p>
          </div>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-xs font-semibold text-content-muted uppercase tracking-wider px-3 mb-3">Navigation</p>
        <ul className="space-y-1">
          {navItems
            .filter((item) => {
              if (item.to === '/mentor' && user?.role !== 'mentor') return false;
              if (item.to === '/dashboard' && user?.role === 'mentor') return false;
              return true;
            })
            .map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-content-secondary hover:bg-blue-50 hover:text-primary'
                  }`
                }
              >
                <span className="text-base">{icon}</span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border-subtle">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-red-50 transition-all duration-200"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
