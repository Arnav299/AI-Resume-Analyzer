import React, { useState, useEffect, useRef } from 'react';

/**
 * NotificationBell — dropdown notification component.
 * Accepts a list of notifications from parent or fetches from API.
 */
const NotificationBell = ({ notifications = [] }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const typeIcon = (type) => {
    if (type === 'success') return '✅';
    if (type === 'warning') return '⚠️';
    if (type === 'error') return '❌';
    return '🔔';
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-xl transition-all hover:bg-surface/10"
        style={{ color: 'rgba(255,255,255,0.7)' }}
        aria-label="Notifications"
        id="notification-bell-btn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-xs font-bold flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', fontSize: '10px' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50 animate-fade-in"
          style={{
            background: 'rgba(20,25,40,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span className="font-bold text-white text-sm">Notifications</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold transition-colors hover:text-white"
                style={{ color: '#6C63FF' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Items */}
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-surface/5"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: n.read ? 'transparent' : 'rgba(108,99,255,0.05)',
                  }}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-snug">{n.title}</p>
                    {n.message && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {n.message}
                      </p>
                    )}
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {n.time}
                    </p>
                  </div>
                  {!n.read && (
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: '#6C63FF' }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
