import React from "react";
import DexApp from "./DexApp.jsx";
import PageZoomWatcher from "./PageZoomWatcher.jsx";
import "./index.css";

export default function App() {
  const path = window.location.pathname;

  if (path.startsWith("/swap")) {
    return (
      <>
        <DexApp />
        <PageZoomWatcher />
</>
    );
  }

  return (
    <main className="arcwave-landing">
      <img
        src="/assets/arcwave-landing.webp"
        alt="ArcWave"
        className="arcwave-landing-bg"
      />

      <div className="arcwave-slogan">
        Stablecoin Liquidity &amp; Pool Intelligence for ARC.
      </div>

      <a
        href="/swap"
        className="arcwave-launch-hotspot"
        aria-label="Launch App"
      />

      <footer className="arcwave-footer">
        <div className="arcwave-footer-left">
          © 2026 ARCWAVE® · ALL RIGHTS RESERVED.
        </div>

        <div className="arcwave-footer-right">
          IP / UI / BUILD BY <span>@SALAZAHRR</span> &amp; <span>@KHAOZAL</span>
        </div>
      </footer>
    </main>
  );
}
