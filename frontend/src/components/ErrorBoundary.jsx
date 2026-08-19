import React from 'react';

/**
 * Detects "Failed to fetch dynamically imported module" errors, which happen
 * when the Vite dev server is not running or a page chunk fails to load.
 * Shows a targeted reload UI for this case instead of the generic error screen.
 */
const isDynamicImportError = (error) => {
  if (!error) return false;
  const msg = error.message || error.toString();
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Unable to preload CSS') ||
    msg.includes('fetch') && msg.includes('import')
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // ── Special case: dynamic import failed (dev server stopped / chunk 404) ──
      if (isDynamicImportError(this.state.error)) {
        return (
          <div
            className="min-h-screen flex items-center justify-center p-6"
            style={{ background: 'linear-gradient(135deg, #0A0E1A 0%, #130D2E 50%, #0A1A2E 100%)' }}
          >
            <div
              className="max-w-md w-full rounded-3xl p-10 text-center"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6"
                style={{
                  background: 'rgba(108,99,255,0.15)',
                  border: '1px solid rgba(108,99,255,0.3)',
                }}
              >
                🔄
              </div>

              <h1 className="text-2xl font-extrabold text-white mb-3">
                Page Failed to Load
              </h1>
              <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                A page module could not be fetched. This usually means the dev server
                was restarted or the network connection was briefly interrupted.
              </p>
              <p className="text-xs mb-8 mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Make sure the Vite dev server is running on port 5173, then reload.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleReload}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
                    boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
                  }}
                >
                  🔄 Reload Page
                </button>
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  🏠 Go Home
                </button>
              </div>
            </div>
          </div>
        );
      }

      // ── Generic error fallback ──────────────────────────────────────────────
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ background: 'linear-gradient(135deg, #0A0E1A 0%, #130D2E 50%, #0A1A2E 100%)' }}
        >
          <div
            className="max-w-lg w-full rounded-3xl p-10 text-center animate-fade-in"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6"
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              ⚠️
            </div>

            <h1 className="text-2xl font-extrabold text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
              An unexpected error occurred in the application.
            </p>

            {this.state.error && (
              <div
                className="rounded-xl p-4 text-left mb-6 mt-4"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                <p className="text-xs font-mono" style={{ color: '#F87171' }}>
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                🔄 Try Again
              </button>
              <button
                onClick={this.handleReset}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
                  boxShadow: '0 4px 15px rgba(108,99,255,0.3)',
                }}
              >
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
