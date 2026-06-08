import { useEffect } from "react";

function detectNavPage(text) {
  const t = String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  if (t.includes("intelligence")) return "intelligence";
  if (t.includes("waveagent") || t.includes("wave agent")) return "waveagent";
  if (t === "lab" || t.includes(" lab")) return "lab";

  if (
    t.includes("swap") ||
    t.includes("liquidity") ||
    t.includes("remove") ||
    t.includes("analytics")
  ) {
    return "normal";
  }

  return null;
}

export default function PageZoomWatcher() {
  useEffect(() => {
    function handleClick(e) {
      setTimeout(() => {
        const el =
          e.target?.closest?.("button, a, [role='button'], nav *, header *") ||
          e.target;

        const text = el?.innerText || el?.textContent || "";
        const page = detectNavPage(text);

        if (page === "intelligence") {
          document.body.dataset.arcPage = "intelligence";
          return;
        }

        if (page === "waveagent") {
          document.body.dataset.arcPage = "waveagent";
          return;
        }

        if (page === "lab") {
          document.body.dataset.arcPage = "lab";
          return;
        }

        if (page === "normal") {
          delete document.body.dataset.arcPage;
        }
      }, 0);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
