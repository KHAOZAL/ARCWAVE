
import {
  BridgeKit,
  ArcTestnet,
  EthereumSepolia,
} from "@circle-fin/bridge-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";

const ARC_CHAIN_ID_HEX = "0x4cef52";
const ARC_RPC = "https://rpc.testnet.arc.network";
const ARC_EXPLORER = "https://testnet.arcscan.app";

function normalizeAmount(value) {
  const raw = String(value || "").trim().replace(",", ".");

  if (!raw || Number(raw) <= 0 || !/^\d+(\.\d+)?$/.test(raw)) {
    throw new Error("Invalid bridge amount.");
  }

  return raw;
}

function isAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(value || "").trim());
}

async function switchToArc() {
  if (!window.ethereum) throw new Error("Wallet provider not found.");

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

function getExplorerUrl(result) {
  const steps = Array.isArray(result?.steps) ? result.steps : [];

  for (const step of steps) {
    if (step?.explorerUrl) return step.explorerUrl;
    if (step?.data?.explorerUrl) return step.data.explorerUrl;
    if (step?.txHash) return `${ARC_EXPLORER}/tx/${step.txHash}`;
    if (step?.data?.txHash) return `${ARC_EXPLORER}/tx/${step.data.txHash}`;
  }

  if (result?.explorerUrl) return result.explorerUrl;
  if (result?.txHash) return `${ARC_EXPLORER}/tx/${result.txHash}`;

  return "";
}

export async function arcwaveBridgeUSDC({ amount, recipient, onStatus } = {}) {
  const status = (message) => {
    console.log("[ArcWave Circle Bridge]", message);
    if (typeof onStatus === "function") onStatus(message);
  };

  if (!window.ethereum) {
    throw new Error("Wallet not found. Use Rabby, MetaMask or Brave Wallet.");
  }

  const bridgeAmount = normalizeAmount(amount);
  // User-controlled adapters resolve the destination address automatically
  // from the connected wallet. Do not pass address manually.
  status("Connecting wallet...");

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const from = accounts?.[0];

  if (!from) {
    throw new Error("Wallet not connected.");
  }

  status("Switching wallet to Arc Testnet...");
  await switchToArc();

  status("Creating Circle Viem adapter...");
  const adapter = await createViemAdapterFromProvider({
    provider: window.ethereum,
  });

  status("Starting Circle CCTP bridge...");

  const kit = new BridgeKit();

  const result = await kit.bridge({
    from: {
      adapter,
      chain: ArcTestnet,
    },
    to: {
      adapter,
      chain: EthereumSepolia,
    },
    amount: bridgeAmount,
  });

  console.log("[ArcWave Circle Bridge] FULL RESULT:");
  console.dir(result, { depth: 20 });
  window.__ARCWAVE_LAST_BRIDGE_RESULT__ = result;

  const explorerUrl = getExplorerUrl(result);

  const steps = Array.isArray(result?.steps) ? result.steps : [];
  console.log("[ArcWave Circle Bridge] steps:", steps);

  status("Bridge submitted via Circle CCTP. Waiting/mint status should be checked in logs.");

  return {
    result,
    explorerUrl,
    steps,
  };
}

window.arcwaveBridgeUSDC = arcwaveBridgeUSDC;
