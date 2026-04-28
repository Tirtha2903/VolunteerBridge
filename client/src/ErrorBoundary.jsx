import { Component } from 'react';

/**
 * Global error boundary — catches any render-phase error and shows a
 * recovery screen instead of a blank page.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[VolunteerBridge] Render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#070d1a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f0f6ff',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem',
          textAlign: 'center',
          gap: '1rem',
        }}>
          <div style={{ fontSize: '3rem' }}>🌿</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>VolunteerBridge</h1>
          <p style={{ color: '#8b9ab5', maxWidth: 400 }}>
            Something went wrong loading the app. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.7rem 2rem',
              background: 'linear-gradient(135deg, #00f5a0, #00d4ff)',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              color: '#070d1a',
            }}
          >
            🔄 Reload Page
          </button>
          {import.meta.env.DEV && (
            <pre style={{
              marginTop: '1rem',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 8,
              padding: '1rem',
              fontSize: '0.75rem',
              color: '#f87171',
              textAlign: 'left',
              maxWidth: 600,
              overflow: 'auto',
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
