/* eslint-disable */
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('rocas_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('rocas_token') || null);

  // userData should be the full object from /api/auth/me
  // e.g. { id, email, full_name, role, is_active, created_at }
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('rocas_user', JSON.stringify(userData));
    localStorage.setItem('rocas_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rocas_user');
    localStorage.removeItem('rocas_token');
  };

  // Returns the correct dashboard path for a given role
  const getDashboardRoute = (role) => {
    if (role === 'recruiter' || role === 'executive' || role === 'organization') return '/recruiter';
    if (role === 'admin') return '/executive';
    if (role === 'mentor') return '/mentor';
    return '/dashboard'; // student (default)
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user && !!token, getDashboardRoute }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
