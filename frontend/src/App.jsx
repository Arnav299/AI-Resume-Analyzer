import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ResumeProvider } from './context/ResumeContext';
import AppRoutes from './routes/AppRoutes';

/**
 * Purge stale / invalid tokens from localStorage on every app boot.
 *
 * WHY THIS EXISTS:
 *   A previous version of the app stored 'mock_token_123' as a fallback when
 *   the backend was offline. That fake token is NOT a valid JWT — the backend
 *   always returns 401 for it, which triggers an infinite redirect loop
 *   (KanbanBoard → 401 → /org-login → mock getMe → KanbanBoard → 401 …).
 *
 *   This cleanup runs once at startup and removes any known-bad tokens so
 *   users are taken to the real login page instead of looping forever.
 */
function PurgeBadTokens() {
  useEffect(() => {
    const token = localStorage.getItem('rocas_token');
    const KNOWN_BAD_TOKENS = ['mock_token_123'];
    if (token && KNOWN_BAD_TOKENS.includes(token)) {
      console.info('[App] Purging stale mock token from localStorage. Please log in with real credentials.');
      localStorage.removeItem('rocas_token');
      localStorage.removeItem('rocas_user');
    }
  }, []);
  return null;
}

import { ThemeProvider } from './context/ThemeContext';

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <PurgeBadTokens />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { maxWidth: '420px' },
          }}
        />
        <ResumeProvider>
          <AppRoutes />
        </ResumeProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
