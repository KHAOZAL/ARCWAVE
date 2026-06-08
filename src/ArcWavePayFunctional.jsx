import { useEffect } from "react";
import React, { useMemo, useState } from "react";
import { createWalletClient, custom, parseUnits } from "viem";

const ARC_CHAIN_ID_HEX = "0x4cef52";

const ERC20_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
];

function isAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(value || "");
}

function shortAddress(address) {
  if (!address || !address.startsWith("0x")) return "Not set";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ArcWavePayFunctional({ tokenA, tokenB }) {

  // ARCWAVEP13_FINAL_SEND_READER
  useEffect(() => {
    const ARC_CHAIN_ID_HEX = "0x4cef52";
    const ARC_RPC = "https://rpc.testnet.arc.network";
    const ARC_EXPLORER = "https://testnet.arcscan.app";

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

      const valueWei = BigInt(wholeClean) * 1000000000000000000n + BigInt(fracClean);
      return "0x" + valueWei.toString(16);
    }

    function setPayStatus(message) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];

      while (walker.nextNode()) nodes.push(walker.currentNode);

      const known = [
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
        "Connecting wallet",
        "Preparing payment"
      ];

      for (const node of nodes) {
        const current = String(node.nodeValue || "");
        if (known.some((k) => current.includes(k))) {
          node.nodeValue = message;
        }
      }
    }

    function getAllInputs() {
      return Array.from(document.querySelectorAll("input, textarea"));
    }

    function getRecipient() {
      const inputs = getAllInputs();

      console.log("[ArcWave Pay] all inputs:", inputs.map((i) => ({
        value: i.value,
        placeholder: i.placeholder,
        name: i.name,
        id: i.id,
        className: i.className
      })));

      // procura qualquer 0x válido dentro dos inputs
      for (const input of inputs) {
        const raw = String(input.value || "").trim();
        const match = raw.match(/0x[a-fA-F0-9]{40}/);
        if (match) return match[0];
      }

      // fallback: procura no texto da página
      const pageText = document.body.innerText || "";
      const match = pageText.match(/0x[a-fA-F0-9]{40}/);
      if (match) return match[0];

      return "";
    }

    function getAmount() {
      const inputs = getAllInputs();

      // tenta achar input cujo valor seja número e que não seja endereço
      for (const input of inputs) {
        const raw = String(input.value || "").trim().replace(",", ".");

        if (/^0x/i.test(raw)) continue;

        if (/^\d+(\.\d+)?$/.test(raw)) {
          return raw;
        }
      }

      return "";
    }

    async function switchToArcTestnet() {
      const current = await window.ethereum.request({
        method: "eth_chainId",
      });

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
            params: [
              {
                chainId: ARC_CHAIN_ID_HEX,
                chainName: "Arc Testnet",
                rpcUrls: [ARC_RPC],
                blockExplorerUrls: [ARC_EXPLORER],
                nativeCurrency: {
                  name: "USDC",
                  symbol: "USDC",
                  decimals: 18,
                },
              },
            ],
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

        console.log("[ArcWave Pay] Send Payment clicked");

        if (!window.ethereum) {
          alert("Wallet não encontrada. Use Rabby, MetaMask ou Brave Wallet.");
          setPayStatus("Wallet not found");
          return;
        }

        setPayStatus("Connecting wallet...");

        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const from = accounts?.[0];

        if (!from) {
          setPayStatus("Wallet not connected");
          return;
        }

        setPayStatus("Switching to Arc Testnet...");
        await switchToArcTestnet();

        const recipient = getRecipient();
        const amountRaw = getAmount();

        console.log("[ArcWave Pay] from:", from);
        console.log("[ArcWave Pay] recipient:", recipient);
        console.log("[ArcWave Pay] amount:", amountRaw);

        if (!isAddress(recipient)) {
          alert(
            "Recipient inválido.\n\n" +
            "Lido pelo front: " + recipient + "\n" +
            "Tamanho: " + String(recipient || "").length + " caracteres\n\n" +
            "Precisa ser 0x + 40 hex = 42 caracteres."
          );
          setPayStatus("Invalid recipient");
          return;
        }

        const valueHex = parseNativeUSDC18(amountRaw);

        setPayStatus("Confirm transaction in wallet...");

        const txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from,
              to: recipient,
              value: valueHex,
              data: "0x",
            },
          ],
        });

        window.__ARCWAVE_LAST_PAY_TX__ = txHash;
        localStorage.setItem("ARCWAVE_LAST_PAY_TX", txHash);

        setPayStatus("Payment sent");

        const links = document.querySelectorAll("a");
        links.forEach((a) => {
          const label = String(a.innerText || a.textContent || "").toLowerCase();

          if (label.includes("explorer") || label.includes("view")) {
            a.href = `${ARC_EXPLORER}/tx/${txHash}`;
            a.target = "_blank";
            a.rel = "noreferrer";
          }
        });

        console.log("[ArcWave Pay] tx:", txHash);
      } catch (err) {
        console.error("[ArcWave Pay] payment error:", err);
        setPayStatus(err?.shortMessage || err?.message || "Payment failed");
      }
    }

    function bindSendButton() {
      const buttons = Array.from(document.querySelectorAll("button"));

      const sendButton = buttons.find((button) =>
        String(button.innerText || button.textContent || "")
          .trim()
          .toLowerCase()
          .includes("send payment")
      );

      if (!sendButton) return;

      if (sendButton.dataset.arcwaveSendFinal === "true") return;

      sendButton.dataset.arcwaveSendFinal = "true";
      sendButton.addEventListener("click", sendNativeUSDC, true);

      console.log("[ArcWave Pay] Send Payment button bound FINAL");
    }

    bindSendButton();

    const interval = setInterval(bindSendButton, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);


useEffect(() => {
    const ARC_CHAIN_ID_HEX = "0x4cef52";
    const ARC_RPC = "https://rpc.testnet.arc.network";
    const ARC_EXPLORER = "https://testnet.arcscan.app";
    const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

    function isAddress(value) {
      return /^0x[a-fA-F0-9]{40}$/.test(String(value || "").trim());
    }

    function parseUnits6(value) {
      const raw = String(value || "").trim().replace(",", ".");
      if (!raw || Number(raw) <= 0) {
        throw new Error("Invalid amount");
      }

      const [whole, frac = ""] = raw.split(".");
      const wholeClean = whole || "0";
      const fracClean = frac.slice(0, 6).padEnd(6, "0");

      if (!/^\d+$/.test(wholeClean) || !/^\d+$/.test(fracClean)) {
        throw new Error("Invalid amount");
      }

      return BigInt(wholeClean) * 1000000n + BigInt(fracClean);
    }

    function encodeTransfer(to, amount) {
      const selector = "a9059cbb";
      const toEncoded = String(to).toLowerCase().replace(/^0x/, "").padStart(64, "0");
      const amountEncoded = amount.toString(16).padStart(64, "0");
      return "0x" + selector + toEncoded + amountEncoded;
    }

    function updateStatus(message) {
      window.__ARCWAVE_PAY_STATUS__ = message;

      const root = document.querySelector(".payPage") || document.body;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];

      while (walker.nextNode()) {
        nodes.push(walker.currentNode);
      }

      const statusWords = [
        "Ready",
        "Payment sent",
        "Payment failed",
        "Payment link copied",
        "Invalid recipient",
        "Invalid amount",
        "Wallet not found",
        "Wallet not connected",
        "Confirm transaction in wallet",
        "Switching to Arc Testnet",
        "No chain was provided",
        "Not on Arc"
      ];

      for (const node of nodes) {
        const current = node.nodeValue || "";
        if (statusWords.some((word) => current.includes(word))) {
          node.nodeValue = message;
        }
      }
    }

    function patchVisualTexts() {
      const root = document.querySelector(".payPage") || document.body;

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];

      while (walker.nextNode()) {
        nodes.push(walker.currentNode);
      }

      for (const node of nodes) {
        node.nodeValue = String(node.nodeValue || "")
          .replaceAll("USDC", "USDC")
          .replaceAll("token=USDC", "token=USDC")
          .replaceAll("0x3600...0000", "0x3600...0000")
          .replaceAll("USDC transfer", "USDC transfer")
          .replaceAll("Not on Arc", "Arc Testnet");
      }

      const anchors = root.querySelectorAll("a");
      anchors.forEach((a) => {
        const label = String(a.innerText || a.textContent || "").toLowerCase();

        if (label.includes("view on explorer") || label.includes("view token") || label.includes("view tx")) {
          const tx = window.__ARCWAVE_LAST_PAY_TX__ || localStorage.getItem("ARCWAVE_LAST_PAY_TX");
          a.href = tx
            ? `${ARC_EXPLORER}/tx/${tx}`
            : `${ARC_EXPLORER}/address/${USDC_ADDRESS}`;

          a.target = "_blank";
          a.rel = "noreferrer";
        }
      });
    }

    async function switchToArcTestnet() {
      if (!window.ethereum) {
        throw new Error("Wallet not found");
      }

      const currentChain = await window.ethereum.request({ method: "eth_chainId" });

      if (String(currentChain).toLowerCase() === ARC_CHAIN_ID_HEX) {
        return;
      }

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ARC_CHAIN_ID_HEX }],
        });
      } catch (err) {
        if (err && err.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: ARC_CHAIN_ID_HEX,
                chainName: "Arc Testnet",
                rpcUrls: [ARC_RPC],
                blockExplorerUrls: [ARC_EXPLORER],
                nativeCurrency: {
                  name: "USDC",
                  symbol: "USDC",
                  decimals: 18,
                },
              },
            ],
          });
        } else {
          throw err;
        }
      }
    }

    function findInputByLabel(labelText) {
      const labels = Array.from(document.querySelectorAll(".payPage label, label"));
      const label = labels.find((l) =>
        String(l.innerText || l.textContent || "").toLowerCase().includes(labelText.toLowerCase())
      );

      if (!label) return null;

      const container = label.parentElement;
      if (!container) return null;

      return container.querySelector("input, textarea, select");
    }

    function getRecipient() {
      const byLabel = findInputByLabel("recipient");
      if (byLabel && byLabel.value) return byLabel.value.trim();

      const inputs = Array.from(document.querySelectorAll(".payPage input, input"));
      const byPlaceholder = inputs.find((i) => String(i.placeholder || "").toLowerCase().includes("0x"));

      if (byPlaceholder) return byPlaceholder.value.trim();

      const byValue = inputs.find((i) => /^0x[a-fA-F0-9]{1,40}$/.test(String(i.value || "").trim()));
      return byValue ? byValue.value.trim() : "";
    }

    function getAmount() {
      const byLabel = findInputByLabel("amount");
      if (byLabel && byLabel.value) return byLabel.value.trim();

      const inputs = Array.from(document.querySelectorAll(".payPage input, input"));
      const numeric = inputs.find((i) => {
        const value = String(i.value || "").trim().replace(",", ".");
        return /^\d+(\.\d+)?$/.test(value);
      });

      return numeric ? numeric.value.trim() : "";
    }

    function getMemo() {
      const byLabel = findInputByLabel("memo");
      if (byLabel && byLabel.value) return byLabel.value.trim();

      return "ArcWave payment";
    }

    
async function sendPayment(event) {
  try {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    console.log("[ArcWave Pay COMPONENT] Send Payment clicked");

    const ARC_CHAIN_ID_HEX = "0x4cef52";
    const ARC_RPC = "https://rpc.testnet.arc.network";
    const ARC_EXPLORER = "https://testnet.arcscan.app";

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

    function readRecipient() {
      const inputs = Array.from(document.querySelectorAll("input, textarea"));

      console.log("[ArcWave Pay COMPONENT] inputs:", inputs.map((i) => ({
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

    
function readAmount() {
  // Lê diretamente o campo Amount visível da página, não o valor antigo/default.
  const inputs = Array.from(document.querySelectorAll("input, textarea"));

  console.log("[ArcWave Pay AMOUNT FIX] inputs:", inputs.map((i) => ({
    value: i.value,
    placeholder: i.placeholder,
    name: i.name,
    id: i.id,
    className: i.className,
    visible: !!(i.offsetWidth || i.offsetHeight || i.getClientRects().length)
  })));

  // 1) Procura pelo label "Amount" e pega o primeiro input depois dele no DOM.
  const labels = Array.from(document.querySelectorAll("label"));

  const amountLabel = labels.find((label) =>
    String(label.innerText || label.textContent || "")
      .trim()
      .toLowerCase() === "amount"
  ) || labels.find((label) =>
    String(label.innerText || label.textContent || "")
      .trim()
      .toLowerCase()
      .includes("amount")
  );

  if (amountLabel) {
    const all = Array.from(document.querySelectorAll("label, input, textarea, select"));
    const labelIndex = all.indexOf(amountLabel);

    if (labelIndex >= 0) {
      for (let i = labelIndex + 1; i < all.length; i++) {
        const el = all[i];

        if (el.tagName === "LABEL") break;

        if (el.matches && el.matches("input, textarea")) {
          const value = String(el.value || "").trim().replace(",", ".");

          if (!/^0x/i.test(value) && /^\d+(\.\d+)?$/.test(value)) {
            console.log("[ArcWave Pay AMOUNT FIX] amount by label:", value);
            return value;
          }
        }
      }
    }
  }

  // 2) Fallback: pega input numérico visível que NÃO seja endereço.
  const visibleNumericInputs = inputs
    .filter((input) => !!(input.offsetWidth || input.offsetHeight || input.getClientRects().length))
    .map((input) => String(input.value || "").trim().replace(",", "."))
    .filter((value) =>
      value &&
      !/^0x/i.test(value) &&
      /^\d+(\.\d+)?$/.test(value)
    );

  if (visibleNumericInputs.length > 0) {
    console.log("[ArcWave Pay AMOUNT FIX] amount by visible numeric:", visibleNumericInputs[0]);
    return visibleNumericInputs[0];
  }

  // 3) Último fallback: qualquer input numérico.
  const numericInputs = inputs
    .map((input) => String(input.value || "").trim().replace(",", "."))
    .filter((value) =>
      value &&
      !/^0x/i.test(value) &&
      /^\d+(\.\d+)?$/.test(value)
    );

  if (numericInputs.length > 0) {
    console.log("[ArcWave Pay AMOUNT FIX] amount by any numeric:", numericInputs[0]);
    return numericInputs[0];
  }

  console.log("[ArcWave Pay AMOUNT FIX] amount not found");
  return "";
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

    function safeSetStatus(message) {
      try {
        if (typeof setStatus === "function") {
          setStatus(message);
          return;
        }
      } catch (_) {}

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
        const t = String(node.nodeValue || "");
        if (targets.some((target) => t.includes(target))) {
          node.nodeValue = message;
        }
      }
    }

    if (!window.ethereum) {
      alert("Wallet não encontrada. Use Rabby, MetaMask ou Brave Wallet.");
      safeSetStatus("Wallet not found");
      return;
    }

    safeSetStatus("Connecting wallet...");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const from = accounts?.[0];

    if (!from) {
      safeSetStatus("Wallet not connected");
      return;
    }

    safeSetStatus("Switching to Arc Testnet...");
    await switchToArc();

    const recipient = readRecipient();
    const payAmount = readAmount();

    console.log("[ArcWave Pay COMPONENT] from:", from);
    console.log("[ArcWave Pay COMPONENT] recipient:", recipient);
    console.log("[ArcWave Pay COMPONENT] amount:", payAmount);

    if (!isAddress(recipient)) {
      alert(
        "Recipient inválido.\\n\\n" +
        "Lido pelo front: " + recipient + "\\n" +
        "Tamanho: " + String(recipient || "").length + " caracteres\\n\\n" +
        "Precisa ser 0x + 40 hex = 42 caracteres."
      );
      safeSetStatus("Invalid recipient");
      return;
    }

    const valueHex = parseNativeUSDC18(payAmount);

    safeSetStatus("Confirm transaction in wallet...");

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

    try {
      if (typeof setTxHash === "function") setTxHash(txHash);
    } catch (_) {}

    safeSetStatus("Payment sent");

    for (const a of document.querySelectorAll("a")) {
      const label = String(a.innerText || a.textContent || "").toLowerCase();

      if (label.includes("explorer") || label.includes("view")) {
        a.href = `${ARC_EXPLORER}/tx/${txHash}`;
        a.target = "_blank";
        a.rel = "noreferrer";
      }
    }

    console.log("[ArcWave Pay COMPONENT] TX:", txHash);
  } catch (err) {
    console.error("[ArcWave Pay COMPONENT] payment error:", err);
    alert(err?.shortMessage || err?.message || "Payment failed");

    try {
      if (typeof setStatus === "function") {
        setStatus(err?.shortMessage || err?.message || "Payment failed");
      }
    } catch (_) {}
  }
}


    async function copyPaymentLink() {
      const recipient = getRecipient();
      const amount = getAmount();
      const memo = getMemo();

      const url = new URL(window.location.origin + "/pay");
      url.searchParams.set("to", recipient || "");
      url.searchParams.set("amount", amount || "");
      url.searchParams.set("token", "USDC");
      url.searchParams.set("memo", memo || "");

      await navigator.clipboard.writeText(url.toString());
      updateStatus("Payment link copied");
    }

    function openExplorer() {
      const tx = window.__ARCWAVE_LAST_PAY_TX__ || localStorage.getItem("ARCWAVE_LAST_PAY_TX");

      const url = tx
        ? `${ARC_EXPLORER}/tx/${tx}`
        : `${ARC_EXPLORER}/address/${USDC_ADDRESS}`;

      window.open(url, "_blank", "noopener,noreferrer");
    }

    function handlePayClick(event) {
      const el = event.target.closest("button, a");
      if (!el) return;

      const label = String(el.innerText || el.textContent || "").trim().toLowerCase();

      if (label.includes("send payment")) {
        event.preventDefault();
        event.stopPropagation();
        sendPayment();
        return;
      }

      if (label.includes("copy payment link")) {
        event.preventDefault();
        event.stopPropagation();
        copyPaymentLink();
        return;
      }

      if (label.includes("view on explorer") || label.includes("view token") || label.includes("view tx")) {
        event.preventDefault();
        event.stopPropagation();
        openExplorer();
        return;
      }
    }

    patchVisualTexts();
document.addEventListener("click", handlePayClick, true);

    return () => {
      document.removeEventListener("click", handlePayClick, true);
    };
  }, []);


  const tokens = useMemo(() => {
    return [tokenA, tokenB].filter((token) => token?.address && token?.symbol);
  }, [tokenA, tokenB]);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("10");
  const [memo, setMemo] = useState("ArcWave testnet payment");
  const [selectedToken, setSelectedToken] = useState(tokens[0]?.address || "");
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("Ready");
  const [txHash, setTxHash] = useState("");

  const token = tokens.find((item) => item.address === selectedToken) || tokens[0];

  async function ensureArcNetwork() {
    if (!window.ethereum) throw new Error("Wallet not found.");

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ARC_CHAIN_ID_HEX }]
      });
    } catch (error) {
      if (error?.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: ARC_CHAIN_ID_HEX,
              chainName: "Arc Testnet",
              nativeCurrency: {
                name: "USDC",
                symbol: "USDC",
                decimals: 18
              },
              rpcUrls: ["https://rpc.testnet.arc.network"],
              blockExplorerUrls: ["https://testnet.arcscan.app"]
            }
          ]
        });
      } else {
        throw error;
      }
    }
  }

  async function connectWallet() {
    try {
      setStatus("Connecting wallet...");
      if (!window.ethereum) throw new Error("Install MetaMask or Rabby.");

      await ensureArcNetwork();

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      setAccount(accounts?.[0] || "");
      setStatus("Wallet connected.");
    } catch (error) {
      setStatus(error?.message || "Connection failed.");
    }
  }

  async function sendPayment() {
    try {
      setTxHash("");

      if (!window.ethereum) throw new Error("Wallet not found.");
      if (!token?.address) throw new Error("Token not selected.");
      if (!isAddress(recipient)) throw new Error("Invalid recipient address.");
      if (!Number(amount) || Number(amount) <= 0) throw new Error("Invalid amount.");

      setStatus("Preparing payment...");
      await ensureArcNetwork();

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      const sender = accounts?.[0];
      if (!sender) throw new Error("Wallet not connected.");

      setAccount(sender);

      const walletClient = createWalletClient({
        transport: custom(window.ethereum)
      });

      const decimals = token.decimals ?? 18;
      const value = parseUnits(amount, decimals);

      setStatus(`Sending ${amount} ${token.symbol}...`);

      const hash = await walletClient.writeContract({
        account: sender,
        address: token.address,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [recipient, value]
      });

      setTxHash(hash);
      setStatus("Payment sent.");
    } catch (error) {
      setStatus(error?.shortMessage || error?.message || "Payment failed.");
    }
  }

  const paymentLink = useMemo(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      to: recipient,
      amount,
      token: token?.symbol || "",
      memo
    });

    return `${base}/pay?${params.toString()}`;
  }, [recipient, amount, token?.symbol, memo]);

  function copy(text) {
    navigator.clipboard?.writeText(text);
    setStatus("Copied to clipboard.");
  }

  return (
    <section className="arcPayFunctionalPage">
      <div className="arcPayFunctionalHeader">
        <span>STABLECOIN CHECKOUT</span>
        <h1>ArcWave Pay</h1>
        <p>
          Send stablecoin payments on Arc Testnet using direct ERC20 transfers.
          Create payment links, preview invoices and test checkout flows.
        </p>
      </div>

      <div className="arcPayFunctionalGrid">
        <div className="arcPayFunctionalCard">
          <h2>Create Payment</h2>
          <p>Fill payment details and send testnet stablecoins.</p>

          <label>Recipient Address</label>
          <input
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="0x..."
          />

          <label>Token</label>
          <select
            value={selectedToken}
            onChange={(event) => setSelectedToken(event.target.value)}
          >
            {tokens.map((item) => (
              <option key={item.address} value={item.address}>
                {item.symbol}
              </option>
            ))}
          </select>

          <label>Amount</label>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="10"
          />

          <label>Memo</label>
          <input
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="Payment memo"
          />

          <div className="arcPayFunctionalActions">
            <button type="button" onClick={connectWallet}>
              Connect Wallet
            </button>

            <button type="button" onClick={sendPayment}>
              Send Payment
            </button>
          </div>
        </div>

        <div className="arcPayFunctionalCard">
          <h2>Payment Preview</h2>

          <div className="arcPayRows">
            <div><span>You pay</span><b>{amount || "0"} {token?.symbol}</b></div>
            <div><span>To</span><b>{shortAddress(recipient)}</b></div>
            <div><span>From</span><b>{shortAddress(account)}</b></div>
            <div><span>Network</span><b>Arc Testnet</b></div>
            <div><span>Status</span><b className="good">{status}</b></div>
          </div>

          {txHash && (
            <div className="arcTxBox">
              <span>Transaction Hash</span>
              <b>{shortAddress(txHash)}</b>
              <button type="button" onClick={() => copy(txHash)}>Copy Hash</button>
            </div>
          )}
        </div>

        <div className="arcPayFunctionalCard">
          <h2>Payment Link</h2>
          <p>Share a checkout-style link for this payment request.</p>

          <div className="arcPayLinkBox">{paymentLink}</div>

          <div className="arcFakeQr">
            {Array.from({ length: 81 }).map((_, index) => (
              <span
                key={index}
                className={index % 2 === 0 || index % 7 === 0 || index % 13 === 0 ? "on" : ""}
              />
            ))}
          </div>

          <button type="button" onClick={() => copy(paymentLink)}>
            Copy Payment Link
          </button>
        </div>

        <div className="arcPayFunctionalCard">
          <h2>Checkout Status</h2>

          <div className="arcStatusCircle">✓</div>

          <div className="arcPayRows">
            <div><span>Mode</span><b>Testnet</b></div>
            <div><span>Transfer Type</span><b>USDC transfer</b></div>
            <div><span>Token Contract</span><b>{shortAddress(token?.address)}</b></div>
            <div><span>Invoice</span><b>arc-pay-demo</b></div>
          </div>

          <button type="button" onClick={() => txHash && window.open(`https://testnet.arcscan.app/tx/${txHash}`, "_blank")}>
            View on Explorer
          </button>
        </div>
      </div>
    </section>
  );
}
