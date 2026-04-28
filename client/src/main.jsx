import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import './index.css';

// No StrictMode — Chart.js canvas is incompatible with StrictMode's
// double-mount behavior (React 18) and causes blank-screen crashes in production.
createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
