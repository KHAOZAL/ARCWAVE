/* ArcWave: prevent Activity background clicks / double-click UI jumps */
if (typeof window !== "undefined" && !window.__arcwaveActivityClickShield) {
  window.__arcwaveActivityClickShield = true;

  const isEditable = (target) => {
    if (!target) return false;
    const tag = target.tagName ? target.tagName.toLowerCase() : "";
    return (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      target.isContentEditable
    );
  };

  const isAllowedInteractive = (target) => {
    return Boolean(
      target?.closest?.(".menuBtn") ||
      target?.closest?.("button") ||
      target?.closest?.("a") ||
      target?.closest?.("input") ||
      target?.closest?.("textarea") ||
      target?.closest?.("select")
    );
  };

  const isActivityOpen = () => {
    return Boolean(
      document.querySelector(".awActivityPremium") ||
      document.querySelector(".awActivityPage") || document.querySelector(".nftVaultExact")
    );
  };

  const block = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    return false;
  };

  const guard = (event) => {
    if (isEditable(event.target)) return;

    const activityOpen = isActivityOpen();

    /*
      Se Activity está aberta:
      - deixa menu/botões/inputs funcionarem
      - bloqueia clique em área vazia, fundo, glow, cards sem botão etc.
      Isso impede o bug A/B de sumir/voltar.
    */
    if (activityOpen && !isAllowedInteractive(event.target)) {
      return block(event);
    }

    /*
      Bloqueia segundo clique de duplo clique em qualquer lugar não editável.
    */
    if (event.type === "dblclick" || (event.detail && event.detail > 1)) {
      return block(event);
    }
  };

  [
    "pointerdown",
    "pointerup",
    "mousedown",
    "mouseup",
    "click",
    "dblclick",
    "selectstart"
  ].forEach((eventName) => {
    document.addEventListener(eventName, guard, {
      capture: true,
      passive: false
    });
  });

  document.documentElement.style.touchAction = "manipulation";
  document.body.style.touchAction = "manipulation";
}
