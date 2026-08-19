import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, Users, TrendingUp, UploadCloud,
  Kanban, LogOut, ChevronRight, Zap, Search, CheckCircle, XCircle,
  ShieldCheck, BookOpen, Info
} from 'lucide-react';

const orgNavItems = [
  { to: '/jd-studio',      label: 'JD Studio',            icon: FileText,       badge: null,  section: 'main' },
  { to: '/org-dashboard',  label: 'Bulk Analysis',        icon: LayoutDashboard, badge: null, section: 'main' },
  { to: '/recruiter',      label: 'Recruiter',            icon: Users,          badge: null,  section: 'main' },
  { to: '/executive',      label: 'Executive',            icon: TrendingUp,     badge: null,  section: 'main' },
  { to: '/upload-wizard',  label: 'Upload Wizard',        icon: UploadCloud,    badge: 'New', section: 'main' },
  { to: '/kanban',         label: 'Pipeline Board',       icon: Kanban,         badge: null,  section: 'main' },
];

const screeningNavItems = [
  { to: '/kanban?stage=screening', label: 'Screening',     icon: Search,        badge: null },
];

const bucketNavItems = [
  { to: '/kanban?bucket=successful',     label: '✅ Successful',    icon: CheckCircle, badge: null, color: '#10B981' },
  { to: '/kanban?bucket=not_successful', label: '❌ Not Successful', icon: XCircle,    badge: null, color: '#F87171' },
];

const helpNavItems = [
  { to: '/user-manual', label: 'User Manual',       icon: BookOpen },
  { to: '/about',       label: 'About the Product', icon: Info     },
];

const OrgSidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.full_name || user?.name || 'O').substring(0, 2).toUpperCase();
  const displayName = user?.full_name || user?.name || 'Organization';
  const isHRManager = user?.role === 'admin' || user?.role === 'hr_manager';

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)' }}>

      {/* Brand Logo */}
      <div className="px-5 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #60A5FA)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-black text-white text-base leading-none tracking-tight">ResumeAI</p>
            <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Enterprise Portal</p>
          </div>
        </Link>
      </div>

      {/* User Badge */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #60A5FA)' }}>
            {initials}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="font-semibold text-white text-sm truncate leading-tight">{displayName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {isHRManager && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <ShieldCheck size={9} />HR Manager
                </span>
              )}
              <p className="text-[10px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {isHRManager ? 'Admin · Full Access' : 'Recruiter'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-1">

        {/* Main Navigation */}
        <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Navigation
        </p>
        {orgNavItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/recruiter'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'hover:text-white'
              }`
            }
            style={({ isActive }) => isActive
              ? { background: 'linear-gradient(135deg, rgba(37,99,235,0.9), rgba(96,165,250,0.7))', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }
              : { color: 'rgba(255,255,255,0.5)' }
            }
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.2)', color: '#22C55E' }}>
                {badge}
              </span>
            )}
            <ChevronRight size={13} className="opacity-0 group-hover:opacity-40 transition-opacity" />
          </NavLink>
        ))}

        {/* Screening Section */}
        <div className="pt-4 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Screening
          </p>
          {screeningNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive ? 'text-white shadow-lg' : 'hover:text-white'
                }`
              }
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, rgba(37,99,235,0.9), rgba(96,165,250,0.7))', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }
                : { color: 'rgba(255,255,255,0.5)' }
              }
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={13} className="opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>
          ))}
        </div>

        {/* Buckets Section */}
        <div className="pt-2 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Buckets
          </p>
          {bucketNavItems.map(({ to, label, icon: Icon, color }) => (
            <NavLink
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group hover:bg-surface/5"
              style={{ color: 'rgba(255,255,255,0.55)' }}
            >
              <Icon size={17} style={{ color }} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={13} className="opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>
          ))}
        </div>

        {/* Help & Information Section */}
        <div className="pt-2 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Help &amp; Information
          </p>
          {helpNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive ? 'text-white shadow-lg' : 'hover:text-white'
                }`
              }
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, rgba(37,99,235,0.9), rgba(96,165,250,0.7))', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }
                : { color: 'rgba(255,255,255,0.5)' }
              }
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={13} className="opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>
          ))}
        </div>

      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ color: 'rgba(248,113,113,0.8)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#F87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,0.8)'; }}
        >
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default OrgSidebar;
