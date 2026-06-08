
const ARC_CHAIN_ID_HEX = "0x4cef52";
const ARC_RPC = "https://rpc.testnet.arc.network";
const ARC_EXPLORER = "https://testnet.arcscan.app";

console.log("[ArcWave Pay CLEAN] loaded");

function isPayPage() {
  return window.location.pathname.includes("/pay");
}

function isAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(value || "").trim());
}

function parseNativeUSDC18(value) {
  const raw = String(value || "").trim().replace(",", ".");

  if (!raw || Number(raw) <= 0) {
    throw new Error("Invalid amount");
  }

  const [whole, frac = ""] = raw.split(".");
  const wholeClean = whole || "0";
  const fracClean = frac.slice(0, 18).padEnd(18, "0");

  if (!/^\d+$/.test(wholeClean) || !/^\d+$/.test(fracClean)) {
    throw new Error("Invalid amount");
  }

  const valueWei =
    BigInt(wholeClean) * 1000000000000000000n + BigInt(fracClean);

  return "0x" + valueWei.toString(16);
}

function getInputs() {
  return Array.from(document.querySelectorAll("input, textarea"));
}

function getRecipient() {
  const inputs = getInputs();

  console.log("[ArcWave Pay CLEAN] inputs:", inputs.map((i) => ({
    value: i.value,
    placeholder: i.placeholder,
    name: i.name,
    id: i.id,
    className: i.className
  })));

  for (const input of inputs) {
    const raw = String(input.value || "").trim();
    const match = raw.match(/0x[a-fA-F0-9]{40}/);
    if (match) return match[0];
  }

  return "";
}

function getAmount() {
  const inputs = getInputs();

  for (const input of inputs) {
    const raw = String(input.value || "").trim().replace(",", ".");

    if (/^0x/i.test(raw)) continue;

    if (/^\d+(\.\d+)?$/.test(raw)) {
      return raw;
    }
  }

  return "";
}

function setStatus(message) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];

  while (walker.nextNode()) nodes.push(walker.currentNode);

  const targets = [
    "Ready",
    "Wallet connected.",
    "Payment sent",
    "Payment failed",
    "Invalid recipient",
    "Invalid amount",
    "Wallet not found",
    "Wallet not connected",
    "Confirm transaction in wallet",
    "Switching to Arc Testnet",
    "Connecting wallet"
  ];

  for (const node of nodes) {
    const text = String(node.nodeValue || "");
    if (targets.some((target) => text.includes(target))) {
      node.nodeValue = message;
    }
  }
}

async function switchToArc() {
  const current = await window.ethereum.request({ method: "eth_chainId" });

  if (String(current).toLowerCase() === ARC_CHAIN_ID_HEX) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_CHAIN_ID_HEX }],
    });
  } catch (err) {
    if (err && err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: ARC_CHAIN_ID_HEX,
          chainName: "Arc Testnet",
          rpcUrls: [ARC_RPC],
          blockExplorerUrls: [ARC_EXPLORER],
          nativeCurrency: {
            name: "USDC",
            symbol: "USDC",
            decimals: 18,
          },
        }],
      });
    } else {
      throw err;
    }
  }
}

async function sendNativeUSDC(event) {
  try {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();

    if (window.__ARCWAVE_PAY_SENDING__) return;
    window.__ARCWAVE_PAY_SENDING__ = true;

    setTimeout(() => {
      window.__ARCWAVE_PAY_SENDING__ = false;
    }, 2500);

    console.log("[ArcWave Pay CLEAN] Send Payment clicked");

    if (!window.ethereum) {
      alert("Wallet não encontrada. Use Rabby, MetaMask ou Brave Wallet.");
      setStatus("Wallet not found");
      return;
    }

    setStatus("Connecting wallet...");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const from = accounts?.[0];

    if (!from) {
      setStatus("Wallet not connected");
      return;
    }

    setStatus("Switching to Arc Testnet...");
    await switchToArc();

    const recipient = getRecipient();
    const amount = getAmount();

    console.log("[ArcWave Pay CLEAN] from:", from);
    console.log("[ArcWave Pay CLEAN] recipient:", recipient);
    console.log("[ArcWave Pay CLEAN] amount:", amount);

    if (!isAddress(recipient)) {
      alert(
        "Recipient inválido.\\n\\n" +
        "Lido pelo front: " + recipient + "\\n" +
        "Tamanho: " + String(recipient || "").length + " caracteres\\n\\n" +
        "Precisa ser 0x + 40 hex = 42 caracteres."
      );
      setStatus("Invalid recipient");
      return;
    }

    const valueHex = parseNativeUSDC18(amount);

    setStatus("Confirm transaction in wallet...");

    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [{
        from,
        to: recipient,
        value: valueHex,
        data: "0x",
      }],
    });

    window.__ARCWAVE_LAST_PAY_TX__ = txHash;
    localStorage.setItem("ARCWAVE_LAST_PAY_TX", txHash);

    setStatus("Payment sent");

    for (const a of document.querySelectorAll("a")) {
      const label = String(a.innerText || a.textContent || "").toLowerCase();

      if (label.includes("explorer") || label.includes("view")) {
        a.href = `${ARC_EXPLORER}/tx/${txHash}`;
        a.target = "_blank";
        a.rel = "noreferrer";
      }
    }

    console.log("[ArcWave Pay CLEAN] TX:", txHash);
  } catch (err) {
    console.error("[ArcWave Pay CLEAN] payment error:", err);
    alert(err?.shortMessage || err?.message || "Payment failed");
    setStatus(err?.shortMessage || err?.message || "Payment failed");
  } finally {
    setTimeout(() => {
      window.__ARCWAVE_PAY_SENDING__ = false;
    }, 1000);
  }
}

function isSendPaymentText(text) {
  const t = String(text || "").trim().toLowerCase();
  return t.includes("send payment") || t.includes("send usdc");
}

function findSendButton() {
  const candidates = Array.from(document.querySelectorAll("button, a, div, span"));

  return candidates.find((el) => {
    const text = String(el.innerText || el.textContent || "");
    const rect = el.getBoundingClientRect();

    return (
      isSendPaymentText(text) &&
      rect.width > 40 &&
      rect.height > 20
    );
  });
}

function bindSendButton() {
  if (!isPayPage()) return;

  const btn = findSendButton();

  if (!btn) return;

  btn.removeAttribute("disabled");
  btn.style.pointerEvents = "auto";
  btn.style.cursor = "pointer";

  if (btn.dataset.arcwaveCleanSend === "true") return;

  // clone remove handlers quebrados antigos mantendo o visual
  const clone = btn.cloneNode(true);

  clone.dataset.arcwaveCleanSend = "true";
  clone.removeAttribute("disabled");
  clone.style.pointerEvents = "auto";
  clone.style.cursor = "pointer";

  clone.addEventListener("click", sendNativeUSDC, true);
  clone.addEventListener("pointerup", sendNativeUSDC, true);

  btn.parentNode.replaceChild(clone, btn);

  console.log("[ArcWave Pay CLEAN] Send Payment button replaced and bound");
}

function globalCapture(event) {
  if (!isPayPage()) return;

  let el = event.target;

  for (let i = 0; i < 8 && el; i++) {
    if (isSendPaymentText(el.innerText || el.textContent)) {
      sendNativeUSDC(event);
      return;
    }

    el = el.parentElement;
  }
}

window.addEventListener("click", globalCapture, true);

setInterval(bindSendButton, 600);
setTimeout(bindSendButton, 300);
setTimeout(bindSendButton, 1000);
setTimeout(bindSendButton, 2000);
