export function preventZoom() {
  let lastTouchEnd = 0;

  const isInteractive = (target) => {
    if (!target || typeof target.closest !== "function") return false;

    return Boolean(
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select") ||
      target.closest("[role='button']")
    );
  };

  document.addEventListener(
    "dblclick",
    function (event) {
      if (!isInteractive(event.target)) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    { passive: false, capture: true }
  );

  document.addEventListener(
    "touchend",
    function (event) {
      const now = Date.now();

      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }

      lastTouchEnd = now;
    },
    { passive: false }
  );
}
