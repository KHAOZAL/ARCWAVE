
/* ArcWave: prevent browser double-click zoom/jump */
if (typeof window !== "undefined" && !window.__arcwaveNoDoubleClickZoom) {
  window.__arcwaveNoDoubleClickZoom = true;
  document.addEventListener(
    "dblclick",
    function (event) {
      event.preventDefault();
      event.stopPropagation();
    },
    { passive: false, capture: true }
  );
}

// Block old double-click handlers from ghost widgets
document.addEventListener("dblclick", (event) => {
  const target = event.target;
  if (
    target &&
    target.closest &&
    (
      target.closest(".floating-agent-btn") ||
      target.closest(".wave-agent-floating") ||
      target.closest(".agent-floating") ||
      target.closest(".ai-agent-fab")
    )
  ) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./arcwaveNoDoubleClick.js";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
