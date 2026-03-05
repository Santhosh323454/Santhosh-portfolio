import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './ErrorBoundary.jsx'

window.onerror = function (message, source, lineno, colno, error) {
  document.body.innerHTML = `<div style="padding: 2rem; color: #900; background: #fee; font-family: monospace;">
      <h2>Boot Error!</h2>
      <pre>${message}</pre>
      <pre>${error?.stack}</pre>
  </div>`;
};

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (err) {
  document.body.innerHTML = `<div style="padding: 2rem; color: #900; background: #fee; font-family: monospace;">
      <h2>Render Crash!</h2>
      <pre>${err.toString()}</pre>
  </div>`;
}
