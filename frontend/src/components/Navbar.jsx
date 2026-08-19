import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout, isAuthenticated, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-primary/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
              <span className="text-white font-black text-lg">R</span>
            </div>
            <span className="font-bold text-lg hidden sm:block"
              style={{ background: 'linear-gradient(135deg, #6C63FF, #5A52E0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ResumeAI
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">

              {/* Analyze Resume & Get Full Access — only for unauthenticated users */}
              {!isAuthenticated && (
                <>
                  <Link to="/analyze"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #60A5FA, #3B82F6)', color: 'white', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                    🤖 Analyze Resume
                  </Link>

                  <div className="relative group ml-2">
                    <button
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-1.5"
                      style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', color: 'white', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }}>
                      Get Full Access ▾
                    </button>
                    <div className="absolute right-0 mt-2 w-52 bg-page border border-border-subtle rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
                      <Link to="/login" className="px-4 py-3 text-sm font-semibold text-content hover:bg-surface-hover border-b border-border-default flex items-center gap-2">
                        🎓 Student Portal
                      </Link>
                      <Link to="/org-login" className="px-4 py-3 text-sm font-semibold text-content hover:bg-surface-hover flex items-center gap-2">
                        🏢 Organization Portal
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {isAuthenticated ? (
                <>
                  {location.pathname !== '/' && (
                    <Link to="/"
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-page text-content-secondary hover:text-content flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      Home
                    </Link>
                  )}
                  {['recruiter', 'organization', 'admin', 'executive'].includes(user?.role) ? (
                    <>
                      <Link to={getDashboardRoute ? getDashboardRoute(user?.role) : '/recruiter'}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-page text-content-secondary hover:text-content">
                        Dashboard
                      </Link>
                      <Link to="/jd-studio"
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-page text-content-secondary hover:text-content">
                        JD Studio
                      </Link>
                      <Link to="/org-dashboard"
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-page text-content-secondary hover:text-content">
                        Bulk Analysis
                      </Link>
                      <Link to="/kanban"
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-page text-content-secondary hover:text-content">
                        Pipeline
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/dashboard"
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-page text-content-secondary hover:text-content">
                        Dashboard
                      </Link>
                      <Link to="/upload"
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-page text-content-secondary hover:text-content">
                        Upload
                      </Link>
                      <Link to="/roles"
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-page text-content-secondary hover:text-content">
                        Career Roles
                      </Link>
                      <Link to="/analysis"
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-page text-content-secondary hover:text-content">
                        Results
                      </Link>
                    </>
                  )}

                  {/* User Menu */}
                  <div className="flex items-center gap-3 ml-2 pl-4 border-l border-border-default">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium hidden lg:block text-content-secondary">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{ color: '#EF4444', background: 'rgba(239,68,68,0.06)' }}>
                      Logout
                    </button>
                    <div className="pl-4 ml-2 border-l border-border-default flex items-center">
                      <ThemeToggle />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {location.pathname !== '/' && (
                    <Link to="/"
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-page text-content-secondary hover:text-content">
                      Home
                    </Link>
                  )}
                  <Link to="/register"
                    className="ml-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: 'linear-gradient(135deg, #22D3EE, #06B6D4)', color: 'white', boxShadow: '0 4px 12px rgba(6,182,212,0.3)' }}>
                    Create Account
                  </Link>
                  <div className="ml-2 pl-4 flex items-center border-l border-border-default">
                    <ThemeToggle />
                  </div>
                </>
              )}
            </div>

            {/* Bulb Icon */}
            <button className="p-2 text-content-muted hover:text-yellow-500 transition-colors rounded-full hover:bg-surface-hover focus:outline-none" aria-label="Toggle Theme">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/>
                <path d="M9 18h6"/>
                <path d="M10 22h4"/>
              </svg>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-xl transition-colors hover:bg-surface-hover ${menuOpen ? 'bg-primary/10' : 'bg-transparent'}`}
            >
              <div className="space-y-1.5 w-5">
                <div className={`h-0.5 rounded-full transition-all duration-300 bg-content ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <div className={`h-0.5 rounded-full transition-all duration-300 bg-content ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <div className={`h-0.5 rounded-full transition-all duration-300 bg-content ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 animate-fade-in border-t border-primary/10">
            <div className="flex flex-col gap-1">
              {/* Analyze Resume & Get Full Access — only for unauthenticated users */}
              {!isAuthenticated && (
                <>
                  <Link to="/analyze" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg, #60A5FA, #3B82F6)', color: 'white', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                    🤖 Analyze Resume (Free)
                  </Link>

                  <div className="flex flex-col gap-2 mt-2 mb-1">
                    <Link to="/login" onClick={() => setMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', color: 'white', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }}>
                      🎓 Student Portal
                    </Link>
                    <Link to="/org-login" onClick={() => setMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                      🏢 Organization Portal
                    </Link>
                  </div>
                </>
              )}
              {isAuthenticated ? (
                <>
                  {(!user?.role || ['student'].includes(user?.role)) ? (
                    [
                      ...(location.pathname !== '/' ? [{ to: '/', label: 'Home' }] : []),
                      { to: '/dashboard', label: 'Dashboard' },
                      { to: '/upload', label: 'Upload Resume' },
                      { to: '/roles', label: 'Career Roles' },
                      { to: '/analysis', label: 'Analysis Results' },
                    ].map(({ to, label }) => (
                      <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                        className="px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-page text-content-secondary hover:text-content">
                        {label}
                      </Link>
                    ))
                  ) : (
                    [
                      ...(location.pathname !== '/' ? [{ to: '/', label: 'Home' }] : []),
                      { to: getDashboardRoute ? getDashboardRoute(user?.role) : '/recruiter', label: 'Dashboard' },
                      { to: '/jd-studio', label: 'JD Studio' },
                      { to: '/org-dashboard', label: 'Bulk Analysis' },
                      { to: '/kanban', label: 'Pipeline' },
                    ].map(({ to, label }) => (
                      <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                        className="px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-page text-content-secondary hover:text-content">
                        {label}
                      </Link>
                    ))
                  )}
                  <button onClick={handleLogout}
                    className="text-left px-4 py-3 text-sm font-semibold rounded-xl"
                    style={{ color: '#EF4444' }}>
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-center mt-1"
                  style={{ background: 'linear-gradient(135deg, #22D3EE, #06B6D4)', color: 'white' }}>
                  Create Account
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
