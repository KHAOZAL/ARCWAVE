
import { useEffect, useMemo, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  http,
  parseUnits,
} from "viem";
import "./index.css";
import { WaveAgentLeftPanel, LabLeftPanel } from "./WaveAgentLabPanels";

import PremiumWaveAgent from "./PremiumWaveAgent";
import ArcWaveLab from "./ArcWaveLab";
import ArcWavePayFunctional from "./ArcWavePayFunctional";
import ArcWaveActivity from "./ArcWaveActivity";
import ArcWaveVaults from "./ArcWaveVaults";
import { arcwaveBridgeUSDC } from "./arcwaveCircleBridge.js";
const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "Test USDC",
    symbol: "tUSDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://testnet.arcscan.app",
    },
  },
};

const TOKENS = {
  USDC: {
    symbol: "USDC",
    name: "USDC",
    address: "0x3600000000000000000000000000000000000000",
  },
  TARC: {
    symbol: "tARC",
    name: "Test ARC",
    address: "0x605cF46994C1fc75c04D2386d88E2529DC1C3C77",
  },
  TUSDT: {
    symbol: "tUSDT",
    name: "Test USDT",
    address: "0x211aabF85b0162b07DdCB88AE076E8485d1fe5Cc",
  },
  TDAI: {
    symbol: "tDAI",
    name: "Test DAI",
    address: "0x1f74243d2b360a848BC1833dEF27d2bBA7fC19A5",
  },
  TUSDE: {
    symbol: "tUSDe",
    name: "Test USDe",
    address: "0xCD7eC626C79573a5aC5CD79b45b9274fB896E128",
  },
  TPYUSD: {
    symbol: "tPYUSD",
    name: "Test PYUSD",
    address: "0x1Ee284FA2252f1521d31AC6FAC912EcaCC52e72D",
  },

  EURC: {
    symbol: "EURC",
    name: "EURC",
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  },
  CIRBTC: {
    symbol: "cirBTC",
    name: "Circle Wrapped Bitcoin",
    address: "0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF",
  },
};

const POOLS = [
  {
    id: "USDC_TARC",
    label: "tARC / tUSDC",
    tokenA: "TARC",
    tokenB: "USDC",
    address: "0xf6460A7B4f367Dae52ba14495Ed4A165a382C5E5",
  },
  {
    id: "USDC_TUSDT",
    label: "tUSDT / tUSDC",
    tokenA: "TUSDT",
    tokenB: "USDC",
    address: "0x439F5EB7D329087557ea9373a1d1b33aE1bdB3Ac",
  },
  {
    id: "USDC_TDAI",
    label: "tDAI / tUSDC",
    tokenA: "TDAI",
    tokenB: "USDC",
    address: "0xa7e93F279a437133E707A22726bbD3852AEbb93F",
  },
  {
    id: "USDC_TUSDE",
    label: "tUSDe / tUSDC",
    tokenA: "TUSDE",
    tokenB: "USDC",
    address: "0x106DC0bA10b8081a594F977FB8c176703D6E9791",
  },
  {
    id: "USDC_TPYUSD",
    label: "tPYUSD / tUSDC",
    tokenA: "TPYUSD",
    tokenB: "USDC",
    address: "0xB2982bE59d35dd01c728024d736a0b5F7166D97c",
  },

  {
    id: "USDC_EURC",
    label: "USDC / EURC",
    tokenA: "USDC",
    tokenB: "EURC",
    address: "0x96dc62b75ac50af7675bea0cb8ffe693dac501ec",
  },
  {
    id: "USDC_CIRBTC",
    label: "USDC / cirBTC",
    tokenA: "USDC",
    tokenB: "CIRBTC",
    address: "0xb0ec9a78ebc5a0b8f1205596cc08b1dc73fac6f0",
  },
];


const ARCWAVE_FACTORY = "0xEd62670DB50E6e1C312F086B3230168D7E1521AA";
const ARCWAVE_ROUTER = "0xD0796C8e58DE024E063770981E153629BcF41932";

const FACTORY_ABI = [
  {
    name: "createPool",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
    ],
    outputs: [{ type: "address" }],
  },
  {
    name: "getPool",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
    ],
    outputs: [{ type: "address" }],
  },
  {
    name: "allPoolsLength",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
];

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
];

const DEX_ABI = [
  {
    name: "reserveA",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "reserveB",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "totalLiquidity",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "liquidityOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "addLiquidity",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "removeLiquidity",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "liquidity", type: "uint256" }],
    outputs: [{ type: "uint256" }, { type: "uint256" }],
  },
  {
    name: "swapWithDeadline",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" },
      { name: "minAmountOut", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
];

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
});

function shortAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getNetworkName(chainIdHex) {
  if (!chainIdHex) return "Not connected";
  if (chainIdHex.toLowerCase() === "0x4cef52") return "Arc Testnet";
  return "Wrong network";
}

function safeParse(value, tokenOrSymbol) {
  try {
    return parseUnits(value || "0", tokenDecimals(tokenOrSymbol));
  } catch {
    return 0n;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fmt(value, maxDecimals = 6) {
  try {
    const n = Number(formatUnits(value || 0n, 18));
    if (!Number.isFinite(n)) return "0";
    if (n === 0) return "0";
    if (n < 0.000001) return n.toFixed(8);
    return n.toLocaleString("en-US", {
      maximumFractionDigits: maxDecimals,
    });
  } catch {
    return "0";
  }
}





function getWalletSwapMax(balanceIn, tokenInObj) {
  try {
    const decimals = tokenDecimals(tokenInObj);
    const walletMax = Number(formatUnits(balanceIn || 0n, decimals));

    if (!Number.isFinite(walletMax) || walletMax <= 0) {
      return "0";
    }

    return clean(walletMax);
  } catch {
    return "0";
  }
}

function tokenDecimals(tokenOrSymbol) {
  const address =
    typeof tokenOrSymbol === "object"
      ? tokenOrSymbol?.address?.toLowerCase()
      : "";

  const symbol =
    typeof tokenOrSymbol === "string"
      ? tokenOrSymbol
      : tokenOrSymbol?.symbol || "";

  const normalized = String(symbol || "").toUpperCase();

  if (
    address === "0x3600000000000000000000000000000000000000" ||
    address === "0x89b50855aa3be2f677cd6303cec089b5f319d72a" ||
    normalized === "USDC" ||
    normalized === "EURC"
  ) {
    return 6;
  }

  if (
    address === "0xf0c4a4ce82a5746abaad9425360ab04fbba432bf" ||
    normalized === "CIRBTC"
  ) {
    return 8;
  }

  return 18;
}

function formatTokenAmount(value, tokenOrSymbol, digits = 6) {
  try {
    return clean(Number(formatUnits(value || 0n, tokenDecimals(tokenOrSymbol))).toFixed(digits));
  } catch {
    return "0";
  }
}


function clean(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(6).replace(/\.?0+$/, "");
}

export default function App() {
  const [activeTab, setActiveTab] = useState("swap");
    const [liquidityMode, setLiquidityMode] = useState("add");
const [selectedPoolId, setSelectedPoolId] = useState("USDC_TARC");
  const [labMode, setLabMode] = useState("routes");
  const [routeAmount, setRouteAmount] = useState("10");
  const [routeResults, setRouteResults] = useState([]);
  const [createPoolA, setCreatePoolA] = useState(TOKENS.USDC.address);
  const [createPoolB, setCreatePoolB] = useState(TOKENS.TUSDT.address);
  const [simAmount, setSimAmount] = useState("1000");
  const [govChoice, setGovChoice] = useState("USDC/tEURC");
  const [bugChecks, setBugChecks] = useState({});
  const [localPoints, setLocalPoints] = useState(() => {
    try {
      return Number(localStorage.getItem("arcwave_points") || "0");
    } catch {
      return 0;
    }
  });

  const currentPool = useMemo(() => {
    return POOLS.find((pool) => pool.id === selectedPoolId) || POOLS[0];
  }, [selectedPoolId]);

  const tokenA = TOKENS[currentPool.tokenA];
  const tokenB = TOKENS[currentPool.tokenB];
  const DEX = currentPool.address;

  const [wallet, setWallet] = useState("");
  const [walletClient, setWalletClient] = useState(null);
  const [network, setNetwork] = useState("Not connected");
  const [status, setStatus] = useState("Ready.");
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("");
  const [activityLog, setActivityLog] = useState([]);

  const [tokenIn, setTokenIn] = useState(TOKENS.USDC.address);
  const [payAmount, setPayAmount] = useState("0.1");

  const [slippageMode, setSlippageMode] = useState("0.5");
  const [customSlippage, setCustomSlippage] = useState("");

  const [liqA, setLiqA] = useState("0.1");
  const [liqB, setLiqB] = useState("0.1");

  const [removePercent, setRemovePercent] = useState("50");
  const [bridgeAmount, setBridgeAmount] = useState("0.01");
  const [bridgeRecipient, setBridgeRecipient] = useState("");

  const [reserveA, setReserveA] = useState(0n);
  const [reserveB, setReserveB] = useState(0n);
  const [totalLiquidity, setTotalLiquidity] = useState(0n);
  const [myLiquidity, setMyLiquidity] = useState(0n);

  const [balanceA, setBalanceA] = useState(0n);
  const [balanceB, setBalanceB] = useState(0n);
  const [allowanceA, setAllowanceA] = useState(0n);
  const [allowanceB, setAllowanceB] = useState(0n);

  const tokenInIsA = tokenIn.toLowerCase() === tokenA.address.toLowerCase();
  const tokenInObj = tokenInIsA ? tokenA : tokenB;
  const tokenOutObj = tokenInIsA ? tokenB : tokenA;
  const balanceIn = tokenInIsA ? balanceA : balanceB;

  const estimatedOutBigInt = useMemo(() => {
    const amountIn = safeParse(payAmount, tokenInObj);
    if (amountIn <= 0n || reserveA <= 0n || reserveB <= 0n) return 0n;

    const reserveIn = tokenInIsA ? reserveA : reserveB;
    const reserveOut = tokenInIsA ? reserveB : reserveA;

    const amountInWithFee = amountIn * 997n;
    return (amountInWithFee * reserveOut) / ((reserveIn * 1000n) + amountInWithFee);
  }, [payAmount, tokenInIsA, reserveA, reserveB]);

  const slippagePercent = useMemo(() => {
    const value = slippageMode === "custom" ? customSlippage : slippageMode;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return 0.5;
    return n;
  }, [slippageMode, customSlippage]);

  const minimumOutBigInt = useMemo(() => {
    if (estimatedOutBigInt <= 0n) return 0n;
    const bps = BigInt(Math.round(slippagePercent * 100));
    return (estimatedOutBigInt * (10000n - bps)) / 10000n;
  }, [estimatedOutBigInt, slippagePercent]);

  const priceImpactNumber = useMemo(() => {
    try {
      const amountIn = Number(payAmount || "0");
      const amountOut = Number(formatUnits(estimatedOutBigInt, 18));
      const rA = Number(formatUnits(reserveA, 18));
      const rB = Number(formatUnits(reserveB, 18));

      if (!amountIn || !amountOut || !rA || !rB) return 0;

      const spot = tokenInIsA ? rB / rA : rA / rB;
      const execution = amountOut / amountIn;
      const impact = ((spot - execution) / spot) * 100;

      if (!Number.isFinite(impact)) return 0;
      return Math.max(0, impact);
    } catch {
      return 0;
    }
  }, [payAmount, estimatedOutBigInt, reserveA, reserveB, tokenInIsA]);

  const priceImpact = `${priceImpactNumber.toFixed(2)}%`;

  const removeLiquidityAmount = useMemo(() => {
    const pct = BigInt(Number(removePercent || "0"));
    return (myLiquidity * pct) / 100n;
  }, [myLiquidity, removePercent]);

  const removeAmountA = useMemo(() => {
    if (totalLiquidity === 0n) return 0n;
    return (removeLiquidityAmount * reserveA) / totalLiquidity;
  }, [removeLiquidityAmount, reserveA, totalLiquidity]);

  const removeAmountB = useMemo(() => {
    if (totalLiquidity === 0n) return 0n;
    return (removeLiquidityAmount * reserveB) / totalLiquidity;
  }, [removeLiquidityAmount, reserveB, totalLiquidity]);

  const poolShare = useMemo(() => {
    if (totalLiquidity === 0n || myLiquidity === 0n) return "0.00%";
    const share = (Number(myLiquidity) / Number(totalLiquidity)) * 100;
    if (!Number.isFinite(share)) return "0.00%";
    return `${share.toFixed(2)}%`;
  }, [myLiquidity, totalLiquidity]);

  const poolPrice = useMemo(() => {
    const a = Number(formatUnits(reserveA || 0n, 18));
    const b = Number(formatUnits(reserveB || 0n, 18));
    if (!a || !b) return "0";
    return (b / a).toFixed(6);
  }, [reserveA, reserveB]);

  const inversePoolPrice = useMemo(() => {
    const a = Number(formatUnits(reserveA || 0n, 18));
    const b = Number(formatUnits(reserveB || 0n, 18));
    if (!a || !b) return "0";
    return (a / b).toFixed(6);
  }, [reserveA, reserveB]);

  const healthScore = useMemo(() => {
    const a = Number(formatUnits(reserveA || 0n, 18));
    const b = Number(formatUnits(reserveB || 0n, 18));
    if (!a || !b) return 0;

    const ratio = Math.min(a, b) / Math.max(a, b);
    const balanceScore = ratio * 60;
    const liquidityScore = Math.min(Math.log10(a + b + 1) * 10, 30);
    const activityScore = totalLiquidity > 0n ? 10 : 0;

    return Math.round(balanceScore + liquidityScore + activityScore);
  }, [reserveA, reserveB, totalLiquidity]);


  const reserveANumber = useMemo(() => {
    return Number(formatUnits(reserveA || 0n, 18));
  }, [reserveA]);

  const reserveBNumber = useMemo(() => {
    return Number(formatUnits(reserveB || 0n, 18));
  }, [reserveB]);

  const totalDepthNumber = useMemo(() => {
    return reserveANumber + reserveBNumber;
  }, [reserveANumber, reserveBNumber]);

  const poolBalanceLabel = useMemo(() => {
    if (!reserveANumber || !reserveBNumber) return "0% / 0%";
    const total = reserveANumber + reserveBNumber;
    const aPct = (reserveANumber / total) * 100;
    const bPct = (reserveBNumber / total) * 100;
    return `${aPct.toFixed(1)}% / ${bPct.toFixed(1)}%`;
  }, [reserveANumber, reserveBNumber]);

  const poolDepthLabel = useMemo(() => {
    if (!totalDepthNumber) return "$0";
    if (totalDepthNumber >= 1_000_000) return `$${(totalDepthNumber / 1_000_000).toFixed(2)}M`;
    if (totalDepthNumber >= 1_000) return `$${(totalDepthNumber / 1_000).toFixed(2)}K`;
    return `$${totalDepthNumber.toFixed(2)}`;
  }, [totalDepthNumber]);

  const intelligenceScenarios = useMemo(() => {
    const sizes = [100, 1000, 10000, 100000];

    return sizes.map((size) => {
      if (!reserveANumber || !reserveBNumber) {
        return {
          size,
          output: "0",
          impact: "0.00%",
          status: "No liquidity",
        };
      }

      const reserveIn = tokenInIsA ? reserveANumber : reserveBNumber;
      const reserveOut = tokenInIsA ? reserveBNumber : reserveANumber;
      const amountInWithFee = size * 0.997;
      const output = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
      const spot = reserveOut / reserveIn;
      const execution = output / size;
      const impact = Math.max(0, ((spot - execution) / spot) * 100);

      let status = "Healthy";
      if (impact > 5) status = "High impact";
      else if (impact > 1) status = "Moderate";
      else if (impact > 0.25) status = "Low impact";

      return {
        size,
        output: Number.isFinite(output) ? output.toFixed(2) : "0",
        impact: Number.isFinite(impact) ? `${impact.toFixed(2)}%` : "0.00%",
        status,
      };
    });
  }, [reserveANumber, reserveBNumber, tokenInIsA]);

  const liquidityNeededEstimate = useMemo(() => {
    const scenario = intelligenceScenarios.find((item) => item.size === 10000);
    if (!scenario || !totalDepthNumber) return "$0";

    const impact = Number(String(scenario.impact).replace("%", ""));
    if (!Number.isFinite(impact) || impact <= 0.1) return "Current liquidity is enough";

    const required = totalDepthNumber * (impact / 0.1);

    if (required >= 1_000_000) return `~$${(required / 1_000_000).toFixed(2)}M`;
    if (required >= 1_000) return `~$${(required / 1_000).toFixed(2)}K`;
    return `~$${required.toFixed(2)}`;
  }, [intelligenceScenarios, totalDepthNumber]);



  const poolComposition = useMemo(() => {
    if (!reserveANumber || !reserveBNumber) {
      return {
        aPct: "50.0",
        bPct: "50.0",
        imbalance: "Unknown",
        range: "45%–55%",
      };
    }

    const total = reserveANumber + reserveBNumber;
    const aPct = (reserveANumber / total) * 100;
    const bPct = (reserveBNumber / total) * 100;
    const deviation = Math.abs(aPct - 50);

    let imbalance = "Low";
    if (deviation > 20) imbalance = "High";
    else if (deviation > 8) imbalance = "Medium";

    return {
      aPct: aPct.toFixed(1),
      bPct: bPct.toFixed(1),
      imbalance,
      range: "45%–55%",
    };
  }, [reserveANumber, reserveBNumber]);

  const routingInsight = useMemo(() => {
    const s100 = intelligenceScenarios.find((item) => item.size === 100);
    const s1000 = intelligenceScenarios.find((item) => item.size === 1000);

    const impact100 = Number(String(s100?.impact || "0").replace("%", ""));
    const impact1000 = Number(String(s1000?.impact || "0").replace("%", ""));

    let safeSize = "<$200";
    let mediumImpact = "~$500";
    let highImpact = "$1,000+";

    if (impact100 <= 0.1 && impact1000 <= 0.5) {
      safeSize = "<$1,000";
      mediumImpact = "~$10,000";
      highImpact = "$100,000+";
    } else if (impact100 <= 0.5) {
      safeSize = "<$200";
      mediumImpact = "~$500";
      highImpact = "$1,000+";
    }

    return {
      route: "Direct pool",
      safeSize,
      mediumImpact,
      highImpact,
      note: "Best for small stablecoin swaps.",
    };
  }, [intelligenceScenarios]);

  const riskFlags = useMemo(() => {
    const flags = [];

    flags.push(poolComposition.imbalance === "Low" ? "Balanced" : `${poolComposition.imbalance} imbalance`);
    flags.push("Live");

    if (totalDepthNumber < 1000) flags.push("Low depth");
    else flags.push("Depth OK");

    const s1000 = intelligenceScenarios.find((item) => item.size === 1000);
    const impact1000 = Number(String(s1000?.impact || "0").replace("%", ""));
    flags.push(impact1000 > 1 ? "High impact on size" : "Impact OK");

    return flags;
  }, [poolComposition.imbalance, totalDepthNumber, intelligenceScenarios]);


  const simulatedImpactDrop = useMemo(() => {
    const add = Number(simAmount || "0");
    const a = Number(formatUnits(reserveA || 0n, 18));
    const b = Number(formatUnits(reserveB || 0n, 18));
    if (!add || !a || !b) return "0.00%";

    const oldLiquidity = a + b;
    const newLiquidity = oldLiquidity + add + add;
    const improvement = (1 - oldLiquidity / newLiquidity) * 100;

    if (!Number.isFinite(improvement)) return "0.00%";
    return `${improvement.toFixed(2)}%`;
  }, [simAmount, reserveA, reserveB]);

  function setSwapHalf() {
    setPayAmount(clean(Number(formatUnits(balanceIn, tokenDecimals(tokenInObj))) / 2));
  }

  function setSwapMax() {
    setPayAmount(clean(Number(formatUnits(balanceIn, tokenDecimals(tokenInObj)))));
  }

  function handleLiquidityA(value) {
    setLiqA(value);

    const n = Number(value);
    const rA = Number(formatUnits(reserveA, 18));
    const rB = Number(formatUnits(reserveB, 18));

    if (Number.isFinite(n) && rA > 0 && rB > 0) {
      setLiqB(clean((n * rB) / rA));
    }
  }

  function handleLiquidityB(value) {
    setLiqB(value);

    const n = Number(value);
    const rA = Number(formatUnits(reserveA, 18));
    const rB = Number(formatUnits(reserveB, 18));

    if (Number.isFinite(n) && rA > 0 && rB > 0) {
      setLiqA(clean((n * rA) / rB));
    }
  }

  function setLiquidityHalfA() {
    handleLiquidityA(clean(Number(formatUnits(balanceA, tokenDecimals(tokenA))) / 2));
  }

  function setLiquidityMaxA() {
    handleLiquidityA(clean(Number(formatUnits(balanceA, tokenDecimals(tokenA)))));
  }

  function setLiquidityHalfB() {
    handleLiquidityB(clean(Number(formatUnits(balanceB, tokenDecimals(tokenB))) / 2));
  }

  function setLiquidityMaxB() {
    handleLiquidityB(clean(Number(formatUnits(balanceB, tokenDecimals(tokenB)))));
  }

  function flipTokens() {
    setTokenIn(tokenInIsA ? tokenB.address : tokenA.address);
    setPayAmount("0.1");
  }

  function changePool(poolId) {
    const nextPool = POOLS.find((pool) => pool.id === poolId) || POOLS[0];
    const nextTokenA = TOKENS[nextPool.tokenA];

    setSelectedPoolId(poolId);
    setTokenIn(nextTokenA.address);
    setPayAmount("0.1");
    setLiqA("0.1");
    setLiqB("0.1");
    setRemovePercent("50");
    setStatus("Pool changed. Refreshing data...");
  }


  function addLocalPoints(amount) {
    setLocalPoints((prev) => {
      const next = prev + amount;
      try {
        localStorage.setItem("arcwave_points", String(next));
      } catch {}
      return next;
    });
  }

  async function scanStableRoutes() {
    try {
      setLoading(true);
      setStatus("Scanning stablecoin routes...");

      const amountIn = safeParse(routeAmount, tokenInObj);

      if (amountIn <= 0n) {
        alert("Digite um valor maior que zero.");
        return;
      }

      const results = [];

      for (const pool of POOLS) {
        const aToken = TOKENS[pool.tokenA];
        const bToken = TOKENS[pool.tokenB];

        if (!aToken || !bToken) continue;

        const [rA, rB] = await Promise.all([
          publicClient.readContract({
            address: pool.address,
            abi: DEX_ABI,
            functionName: "reserveA",
          }),
          publicClient.readContract({
            address: pool.address,
            abi: DEX_ABI,
            functionName: "reserveB",
          }),
        ]);

        if (rA <= 0n || rB <= 0n) continue;

        const amountInWithFee = amountIn * 997n;
        const out = (amountInWithFee * rB) / ((rA * 1000n) + amountInWithFee);

        const input = Number(formatUnits(amountIn, 18));
        const output = Number(formatUnits(out, 18));
        const reserveANum = Number(formatUnits(rA, 18));
        const reserveBNum = Number(formatUnits(rB, 18));
        const spot = reserveBNum / reserveANum;
        const execution = output / input;
        const impact = Math.max(0, ((spot - execution) / spot) * 100);

        results.push({
          pool: pool.label,
          poolAddress: pool.address,
          tokenOut: bToken.symbol,
          output,
          impact,
        });
      }

      results.sort((a, b) => b.output - a.output);
      setRouteResults(results);
      setStatus("Route scan completed.");
      addLocalPoints(25);
    } catch (err) {
      console.error(err);
      setStatus(err.shortMessage || err.message || "Route scan failed.");
    } finally {
      setLoading(false);
    }
  }

  async function doCreatePool() {
    try {
      if (!wallet || !walletClient) {
        await connectWallet();
        return;
      }

      await switchToArc();

      if (!createPoolA || !createPoolB || createPoolA.toLowerCase() === createPoolB.toLowerCase()) {
        alert("Escolha dois tokens diferentes.");
        return;
      }

      setLoading(true);
      setStatus("Creating pool through ArcWaveFactory...");

      const existing = await publicClient.readContract({
        address: ARCWAVE_FACTORY,
        abi: FACTORY_ABI,
        functionName: "getPool",
        args: [createPoolA, createPoolB],
      });

      if (existing && existing !== "0x0000000000000000000000000000000000000000") {
        setStatus(`Pool already exists: ${existing}`);
        alert(`Pool already exists: ${existing}`);
        return;
      }

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

      const hash = await walletClient.writeContract({
        address: ARCWAVE_FACTORY,
        abi: FACTORY_ABI,
        functionName: "createPool",
        args: [createPoolA, createPoolB],
        account: wallet,
        chain: arcTestnet,
      });

      await wait(hash);
      setStatus("Pool created. Copy tx from wallet/explorer and register it in frontend pool list if needed.");
      addLocalPoints(100);
    } catch (err) {
      console.error(err);
      setStatus(err.shortMessage || err.message || "Create pool failed.");
      console.warn("ArcWave tx warning:", err.shortMessage || err.message || "Create pool failed.");
    } finally {
      setLoading(false);
    }
  }

  function toggleBugCheck(key) {
    setBugChecks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const completed = Object.values(next).filter(Boolean).length;
      try {
        localStorage.setItem("arcwave_bug_checks", JSON.stringify(next));
      } catch {}
      if (!prev[key]) addLocalPoints(5);
      setStatus(`Bug checklist progress: ${completed}/8`);
      return next;
    });
  }

  async function switchToArc() {
    if (!window.ethereum) {
      alert("Instale ou desbloqueie Rabby/MetaMask.");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x4cef52" }],
      });
      setNetwork("Arc Testnet");
    } catch {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x4cef52",
            chainName: "Arc Testnet",
            nativeCurrency: {
              name: "USDC",
              symbol: "USDC",
              decimals: 18,
            },
            rpcUrls: ["https://rpc.testnet.arc.network"],
            blockExplorerUrls: ["https://testnet.arcscan.app"],
          },
        ],
      });
      setNetwork("Arc Testnet");
    }
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("Nenhuma wallet detectada. Use Rabby ou MetaMask.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const account = accounts?.[0];
      if (!account) return;

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      const client = createWalletClient({
        account,
        chain: arcTestnet,
        transport: custom(window.ethereum),
      });

      setWallet(account);
      setWalletClient(client);
      setNetwork(getNetworkName(chainId));

      if (chainId?.toLowerCase() !== "0x4cef52") {
        await switchToArc();
      }

      setStatus("Wallet connected.");
      await refreshData(account);
    } catch (err) {
      console.error(err);
      setStatus(err.shortMessage || err.message || "Connect failed.");
      alert("Falha ao conectar wallet.");
    }
  }

  function disconnectWallet() {
    setWallet("");
    setWalletClient(null);
    setNetwork("Disconnected");
    setBalanceA(0n);
    setBalanceB(0n);
    setAllowanceA(0n);
    setAllowanceB(0n);
    setMyLiquidity(0n);
    setStatus("Disconnected from interface.");
  }

  async function refreshData(accountOverride) {
    const account = accountOverride || wallet;

    try {
      setLoading(true);
      setStatus("Refreshing pool data...");

      const [rA, rB, tL] = await Promise.all([
        publicClient.readContract({
          address: DEX,
          abi: DEX_ABI,
          functionName: "reserveA",
        }),
        publicClient.readContract({
          address: DEX,
          abi: DEX_ABI,
          functionName: "reserveB",
        }),
        publicClient.readContract({
          address: DEX,
          abi: DEX_ABI,
          functionName: "totalLiquidity",
        }),
      ]);

      setReserveA(rA);
      setReserveB(rB);
      setTotalLiquidity(tL);

      if (account) {
        const [bA, bB, aA, aB, myLiq] = await Promise.all([
          publicClient.readContract({
            address: tokenA.address,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [account],
          }),
          publicClient.readContract({
            address: tokenB.address,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [account],
          }),
          publicClient.readContract({
            address: tokenA.address,
            abi: ERC20_ABI,
            functionName: "allowance",
            args: [account, DEX],
          }),
          publicClient.readContract({
            address: tokenB.address,
            abi: ERC20_ABI,
            functionName: "allowance",
            args: [account, DEX],
          }),
          publicClient.readContract({
            address: DEX,
            abi: DEX_ABI,
            functionName: "liquidityOf",
            args: [account],
          }),
        ]);

        setBalanceA(bA);
        setBalanceB(bB);
        setAllowanceA(aA);
        setAllowanceB(aB);
        setMyLiquidity(myLiq);
      }

      setLastRefresh(new Date().toLocaleTimeString());
      setStatus("On-chain data updated.");
    } catch (err) {
      console.error(err);
      setStatus(err.shortMessage || err.message || "Refresh failed.");
    } finally {
      setLoading(false);
    }
  }


  function copyText(value) {
    navigator.clipboard?.writeText(value);
    setStatus("Copied to clipboard.");
  }

  function recordActivity(type, hash) {
    const item = {
      type,
      hash,
      pool: currentPool?.label || "Unknown pool",
      time: new Date().toLocaleTimeString(),
    };

    setActivityLog((prev) => {
      const next = [item, ...prev].slice(0, 5);
      localStorage.setItem("arcwave_activity", JSON.stringify(next));
      return next;
    });
  }

  async function wait(hash) {
    setStatus(`Waiting tx: ${hash}`);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status !== "success") {
      throw new Error("Transaction reverted.");
    }

    setStatus(`Confirmed: ${hash}`);
    recordActivity("Transaction", hash);

    await sleep(1500);
    return receipt;
  }

  async function approveIfNeeded(tokenAddress, amount) {
    const isA = tokenAddress.toLowerCase() === tokenA.address.toLowerCase();
    const currentAllowance = isA ? allowanceA : allowanceB;

    if (currentAllowance >= amount) return;

    setStatus(`Approving ${isA ? tokenA.symbol : tokenB.symbol}...`);

    const hash = await walletClient.writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [DEX, amount],
      account: wallet,
      chain: arcTestnet,
    });

    await wait(hash);
    await refreshData(wallet);
  }

  async function doSwap() {
    try {
      if (!wallet || !walletClient) {
        await connectWallet();
        return;
      }

      await switchToArc();

      const amountIn = safeParse(payAmount, tokenInObj);

      if (amountIn <= 0n) {
        alert("Coloque valor maior que zero.");
        return;
      }

      if (!minimumOutBigInt || minimumOutBigInt <= 0n) {
        console.warn("ArcWave tx warning:", "Route output is zero. Try a smaller amount, refresh pool data, or choose another pool.");
        return;
      }

      setLoading(true);

      await approveIfNeeded(tokenIn, amountIn);

      setStatus(`Calling swap ${tokenInObj.symbol} → ${tokenOutObj.symbol}...`);

            const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

const hash = await walletClient.writeContract({
        address: DEX,
        abi: DEX_ABI,
        functionName: "swapWithDeadline",
        args: [tokenIn, amountIn, minimumOutBigInt, deadline],
        account: wallet,
        chain: arcTestnet,
      });

      await wait(hash);
      addLocalPoints(10);
      await refreshData(wallet);
      await sleep(1000);
      await refreshData(wallet);
    } catch (err) {
      console.error(err);
      setStatus(err.shortMessage || err.message || "Swap failed.");
      console.warn("ArcWave tx warning:", err.shortMessage || err.message || "Swap failed.");
    } finally {
      setLoading(false);
    }
  }

  async function doAddLiquidity() {
    try {
      if (!wallet || !walletClient) {
        await connectWallet();
        return;
      }

      await switchToArc();

      const amountA = safeParse(liqA, tokenA);
      const amountB = safeParse(liqB, tokenB);

      if (amountA <= 0n || amountB <= 0n) {
        alert("Coloque valores maiores que zero.");
        return;
      }

      setLoading(true);

      await approveIfNeeded(tokenA.address, amountA);
      await approveIfNeeded(tokenB.address, amountB);

      setStatus("Calling addLiquidity...");

      const hash = await walletClient.writeContract({
        address: DEX,
        abi: DEX_ABI,
        functionName: "addLiquidity",
        args: [amountA, amountB],
        account: wallet,
        chain: arcTestnet,
      });

      await wait(hash);
      await refreshData(wallet);
      await sleep(1000);
      await refreshData(wallet);
    } catch (err) {
      console.error(err);
      setStatus(err.shortMessage || err.message || "Add liquidity failed.");
      console.warn("ArcWave tx warning:", err.shortMessage || err.message || "Add liquidity failed.");
    } finally {
      setLoading(false);
    }
  }

  async function doRemoveLiquidity() {
    try {
      if (!wallet || !walletClient) {
        await connectWallet();
        return;
      }

      await switchToArc();

      if (removeLiquidityAmount <= 0n) {
        alert("Você não tem liquidez para remover nessa pool.");
        return;
      }

      setLoading(true);
      setStatus("Calling removeLiquidity...");

      const hash = await walletClient.writeContract({
        address: DEX,
        abi: DEX_ABI,
        functionName: "removeLiquidity",
        args: [removeLiquidityAmount],
        account: wallet,
        chain: arcTestnet,
      });

      await wait(hash);
      addLocalPoints(50);
      await refreshData(wallet);
      await sleep(1000);
      await refreshData(wallet);
    } catch (err) {
      console.error(err);
      setStatus(err.shortMessage || err.message || "Remove liquidity failed.");
      console.warn("ArcWave tx warning:", err.shortMessage || err.message || "Remove liquidity failed.");
    } finally {
      setLoading(false);
    }
  }

  async function mintTestTokens() {
    try {
      if (!wallet || !walletClient) {
        await connectWallet();
        return;
      }

      await switchToArc();

      setLoading(true);

      const mintAmount = parseUnits("100", 18);

      setStatus(`Getting test ${tokenA.symbol}...`);

      const h1 = await walletClient.writeContract({
        address: tokenA.address,
        abi: ERC20_ABI,
        functionName: "mint",
        args: [wallet, mintAmount],
        account: wallet,
        chain: arcTestnet,
      });

      await wait(h1);

      setStatus(`Getting test ${tokenB.symbol}...`);

      const h2 = await walletClient.writeContract({
        address: tokenB.address,
        abi: ERC20_ABI,
        functionName: "mint",
        args: [wallet, mintAmount],
        account: wallet,
        chain: arcTestnet,
      });

      await wait(h2);
      await refreshData(wallet);
      await sleep(1000);
      await refreshData(wallet);
    } catch (err) {
      console.error(err);
      setStatus(err.shortMessage || err.message || "Pool Intelligence failed.");
      console.warn("ArcWave tx warning:", err.shortMessage || err.message || "Pool Intelligence failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTokenIn(tokenA.address);
    refreshData(wallet);
  }, [selectedPoolId]);

  useEffect(() => {
    async function init() {
      if (!window.ethereum) {
        refreshData();
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        const chainId = await window.ethereum.request({ method: "eth_chainId" });

        setNetwork(getNetworkName(chainId));

        if (accounts?.length) {
          const account = accounts[0];

          const client = createWalletClient({
            account,
            chain: arcTestnet,
            transport: custom(window.ethereum),
          });

          setWallet(account);
          setWalletClient(client);
          await refreshData(account);
        } else {
          await refreshData();
        }

        const onAccountsChanged = (accountsChanged) => {
          const next = accountsChanged?.[0] || "";
          setWallet(next);
          if (next) refreshData(next);
        };

        const onChainChanged = (newChainId) => {
          setNetwork(getNetworkName(newChainId));
          refreshData(wallet);
        };

        window.ethereum.on("accountsChanged", onAccountsChanged);
        window.ethereum.on("chainChanged", onChainChanged);

        return () => {
          window.ethereum.removeListener?.("accountsChanged", onAccountsChanged);
          window.ethereum.removeListener?.("chainChanged", onChainChanged);
        };
      } catch (err) {
        console.error(err);
      }
    }

    init();
  }, []);


  useEffect(() => {
    try {
      const saved = localStorage.getItem("arcwave_activity");
      if (saved) setActivityLog(JSON.parse(saved));
    } catch {
      setActivityLog([]);
    }
  }, []);

  const balanceInDisplay = formatTokenAmount(balanceIn, tokenInObj, 4);
  const swapButtonText = loading ? "Processing..." : wallet ? "Swap Now" : "Connect Wallet";

  return (
    <div className={`appShell tab-${activeTab} ${activeTab === "docs" ? "docsMode" : ""} ${activeTab === "lab" ? "labMode" : ""} ${activeTab === "intelligence" ? "intelligenceMode" : ""} ${activeTab === "points" ? "pointsMode" : ""}`}>
      <div className="noise"></div>
      <div className="glow glowBlue"></div>
      <div className="glow glowPink"></div>

      <header className="topNav">
        <div className="brand">
          <div className="logoMark">
            <span>A</span>
            <span>W</span>
          </div>
          <div className="brandName">ArcWave</div>
        </div>

        <nav className="menu">
          <button
            type="button"
            className={activeTab === "swap" ? "menuBtn active" : "menuBtn"}
            onClick={() => setActiveTab("swap")}
          >
            Swap
          </button>

          <button
            type="button"
            className={activeTab === "liquidity" ? "menuBtn active" : "menuBtn"}
            onClick={() => setActiveTab("liquidity")}
          >
            Liquidity
          </button>

          <button
            type="button"
            className={activeTab === "bridge" ? "menuBtn active" : "menuBtn"}
            onClick={() => setActiveTab("bridge")}
          >
            Bridge
          </button>

          <button
            type="button"
            className={activeTab === "analytics" ? "menuBtn active" : "menuBtn"}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>

          <button
            type="button"
            className={activeTab === "intelligence" ? "menuBtn active" : "menuBtn"}
            onClick={() => setActiveTab("intelligence")}
          >
            Intelligence
          </button>

          <button
            type="button"
            className={activeTab === "docs" ? "menuBtn active" : "menuBtn"}
            onClick={() => setActiveTab("docs")}
          >
            WaveAgent
          </button>


          <button
            type="button"
            className={activeTab === "lab" ? "menuBtn active" : "menuBtn"}
            onClick={() => setActiveTab("lab")}
          >Pay</button>
          <button
            type="button"
            className={activeTab === "vaults" ? "menuBtn active" : "menuBtn"}
            onClick={() => setActiveTab("vaults")}
          >
            Vaults
          </button>

          <button
            type="button"
            className={activeTab === "activity" ? "menuBtn active" : "menuBtn"}
            onClick={() => setActiveTab("activity")}
          >
            Activity
          </button>
        </nav>

        <div className="walletArea">
          {wallet ? (
            <>
              <div className="walletPill">{shortAddress(wallet)}</div>
              <button type="button" className="disconnect" onClick={disconnectWallet}>
                Disconnect
              </button>
            </>
          ) : (
            <button type="button" className="disconnect" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <main className="mainGrid">
        <section className="leftSide">
          {activeTab === "docs" ? (
            <PremiumWaveAgent />
          ) : activeTab === "vaults" ? (
            <ArcWaveVaults />
          ) : activeTab === "activity" ? (
            <ArcWaveActivity />
          ) : activeTab === "lab" ? (
            <ArcWavePayFunctional
              tokenA={tokenA}
              tokenB={tokenB}
            />
          ) : activeTab === "intelligence" ? (
            <>
              <h1>Liquidity intelligence.</h1>

              <p className="description">
                Real-time insights for Arc stablecoin liquidity.
              </p>

              <div className="premiumKpiGrid">
                <div className="premiumKpiCard">
                  <div className="premiumIcon">♡</div>
                  <div>
                    <strong>{healthScore}/100</strong>
                    <span>Pool Health</span>
                  </div>
                </div>

                <div className="premiumKpiCard">
                  <div className="premiumIcon amber">♙</div>
                  <div>
                    <strong>{poolDepthLabel}</strong>
                    <span>Depth</span>
                  </div>
                </div>

                <div className="premiumKpiCard">
                  <div className="premiumIcon purple">◌</div>
                  <div>
                    <strong>{poolBalanceLabel}</strong>
                    <span>Balance</span>
                  </div>
                </div>

                <div className="premiumKpiCard wide">
                  <div className="premiumIcon gold">↗</div>
                  <div>
                    <strong>{liquidityNeededEstimate}</strong>
                    <span>Liquidity Needed</span>
                    <p>For a $10k swap under 0.10% impact.</p>
                  </div>
                </div>

                <div className="premiumKpiCard wide">
                  <div className="premiumIcon violet">▣</div>
                  <div>
                    <strong>Stress Test</strong>
                    <span>Simulate large flows</span>
                    <p>Measure impact and reserve pressure.</p>
                  </div>
                </div>
              </div>

              <div className="exactPremiumBlock poolCompositionCard">
                <div className="exactBlockTitle">Pool Composition</div>

                <div className="compositionBar exact">
                  <div
                    className="compositionFillA"
                    style={{ width: `${poolComposition.aPct}%` }}
                  />
                  <div
                    className="compositionFillB"
                    style={{ width: `${poolComposition.bPct}%` }}
                  />
                </div>

                <div className="compositionTopLabels">
                  <span>{poolComposition.aPct}%</span>
                  <span>{poolComposition.bPct}%</span>
                </div>

                <div className="compositionLabels">
                  <small>{tokenA.symbol}</small>
                  <small>{tokenB.symbol}</small>
                </div>

                <div className="compositionMeta centered">
                  <span>Imbalance: {poolComposition.imbalance}</span>
                  <span>Range: {poolComposition.range}</span>
                </div>

                <p>Balanced pool. No rebalance needed.</p>
              </div>

              <div className="exactPremiumBlock routingInsightCard">
                <div className="exactBlockTitle">Routing Insight</div>

                <div className="routingFourGrid">
                  <div>
                    <span>Best route</span>
                    <strong>{routingInsight.route}</strong>
                  </div>
                  <div>
                    <span>Safe size</span>
                    <strong>{routingInsight.safeSize}</strong>
                  </div>
                  <div>
                    <span>Medium impact</span>
                    <strong>{routingInsight.mediumImpact}</strong>
                  </div>
                  <div>
                    <span>High impact</span>
                    <strong>{routingInsight.highImpact}</strong>
                  </div>
                </div>

                <p>{routingInsight.note}</p>
              </div>

              <div className="premiumInsightGrid">
                <div className="premiumInsightCard poolCompositionCard">
                  <div className="premiumCardHeader">
                    <span>Pool Composition</span>
                    <strong>{poolComposition.aPct}% / {poolComposition.bPct}%</strong>
                  </div>

                  <div className="compositionBar">
                    <div
                      className="compositionFillA"
                      style={{ width: `${poolComposition.aPct}%` }}
                    />
                    <div
                      className="compositionFillB"
                      style={{ width: `${poolComposition.bPct}%` }}
                    />
                  </div>

                  <div className="compositionLabels">
                    <small>{tokenA.symbol}</small>
                    <small>{tokenB.symbol}</small>
                  </div>

                  <div className="compositionMeta">
                    <span>Imbalance: {poolComposition.imbalance}</span>
                    <span>Range: {poolComposition.range}</span>
                  </div>

                  <p>Balanced pool. No rebalance needed.</p>
                </div>

                <div className="premiumInsightCard routingInsightCard">
                  <div className="premiumCardHeader">
                    <span>Routing Insight</span>
                    <strong>{routingInsight.route}</strong>
                  </div>

                  <div className="routingGrid">
                    <div>
                      <span>Safe size</span>
                      <strong>{routingInsight.safeSize}</strong>
                    </div>
                    <div>
                      <span>Medium impact</span>
                      <strong>{routingInsight.mediumImpact}</strong>
                    </div>
                    <div>
                      <span>High impact</span>
                      <strong>{routingInsight.highImpact}</strong>
                    </div>
                  </div>

                  <p>{routingInsight.note}</p>
                </div>
              </div>
            </>
          ) : activeTab === "points" ? (
            <>
              <h1>ArcWave Points.</h1>

              <p className="description">
                Reputation for real testnet activity across swaps, liquidity,
                removals, bug testing and stablecoin pool exploration.
              </p>

              <div className="metricRow">
                <div className="metricCard">
                  <span>Swap</span>
                  <strong>+10</strong>
                </div>

                <div className="metricCard">
                  <span>Liquidity</span>
                  <strong>+50</strong>
                </div>

                <div className="metricCard">
                  <span>Remove</span>
                  <strong>+20</strong>
                </div>
              </div>

              <div className="liquidityRow">
                <div className="liquidityCard">
                  <span>Bug reports</span>
                  <strong>+250—5K</strong>
                  <p>Based on severity, clarity and usefulness.</p>
                </div>

                <div className="liquidityCard">
                  <span>Reputation</span>
                  <strong>Tester rank</strong>
                  <p>Points are reputation only. No guaranteed airdrop.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1>Trade with the wave of liquidity.</h1>

              <p className="description">
                ArcWave is a decentralized exchange interface built for seamless trading,
                stablecoin swaps, routing and liquidity on the Arc testnet.
              </p>

              <div className="metricRow">
                <div className="metricCard">
                  <span>Selected Pool</span>
                  <strong>{currentPool.label}</strong>
                </div>

                <div className="metricCard">
                  <span>Impact</span>
                  <strong>{priceImpact}</strong>
                </div>

                <div className="metricCard">
                  <span>Fee</span>
                  <strong>0.30%</strong>
                </div>
              </div>

              <div className="liquidityRow">
                <div className="liquidityCard">
                  <span>{tokenA.symbol} Reserve</span>
                  <strong>{fmt(reserveA, 4)} {tokenA.symbol}</strong>
                  <p>Current reserve for token A.</p>
                </div>

                <div className="liquidityCard">
                  <span>{tokenB.symbol} Reserve</span>
                  <strong>{fmt(reserveB, 4)} {tokenB.symbol}</strong>
                  <p>Current reserve for token B.</p>
                </div>
              </div>

              <div className="statusStrip">
                <div>
                  <span>ArcWave Status</span>
                  <strong>Testnet Live</strong>
                </div>
                <div>
                  <span>Pools</span>
                  <strong>{POOLS.length}</strong>
                </div>
                <div>
                  <span>Stable Pools</span>
                  <strong>{POOLS.length - 1}</strong>
                </div>
                <div>
                  <span>Roadmap</span>
                  <strong>Reputation</strong>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="swapPanel">
          <div className="panelHeader">
            <div>
              <h2>
                {activeTab === "swap"
                  ? "Swap"
                  : activeTab === "liquidity"
                  ? "Liquidity"
                  : activeTab === "bridge"
                  ? "Bridge"
                  : activeTab === "analytics"
                  ? "Analytics"
                  : activeTab === "intelligence"
                  ? "Intelligence"
                  : activeTab === "points"
                  ? "Points"
                  : activeTab === "docs"
                  ? "WaveAgent"
                  : activeTab === "lab"
                  ? "Lab"
                  : "Swap"}
              </h2>
              <p>Network · {network}</p>
            </div>

            <button
              type="button"
              className="refreshBtn"
              onClick={() => refreshData(wallet)}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {/* ARCWAVE_HIDE_POOL_ON_BRIDGE */}
{activeTab !== "bridge" && (
<div className="poolSelectorBox">
            <label>Pool</label>
            <select value={selectedPoolId} onChange={(e) => changePool(e.target.value)}>
              {POOLS.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.label}
                </option>
              ))}
            </select>
          </div>
)}

          {activeTab === "intelligence" && (
            <>
              <div className="intelligenceHero">
                <span>ARCWAVE INTELLIGENCE</span>
                <h3>Pool health for Arc stablecoins.</h3>
                <p>
                  Live testnet data. Always up to date.
                </p>
              </div>

              <div className="intelligenceGrid">
                <div className="intelligenceCard">
                  <span>POOL HEALTH</span>
                  <strong>{healthScore}/100</strong>
                  <p>Balance, depth and liquidity quality.</p>
                </div>

                <div className="intelligenceCard">
                  <span>LIQUIDITY DEPTH</span>
                  <strong>{poolDepthLabel}</strong>
                  <p>Total selected pool depth.</p>
                </div>

                <div className="intelligenceCard">
                  <span>POOL BALANCE</span>
                  <strong>{poolBalanceLabel}</strong>
                  <p>Reserve distribution.</p>
                </div>

                <div className="intelligenceCard">
                  <span>0.10% TARGET</span>
                  <strong>{liquidityNeededEstimate}</strong>
                  <p>Target liquidity for low impact.</p>
                </div>
              </div>

              <div className="stressTable">
                <div className="stressHeader">
                  <span>STABLECOIN STRESS LAB</span>
                  <strong>Swap impact simulator</strong>
                </div>

                {intelligenceScenarios.map((scenario) => (
                  <div className="stressRow" key={scenario.size}>
                    <div>
                      <span>Swap size</span>
                      <strong>${scenario.size.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>Est. output</span>
                      <strong>{scenario.output}</strong>
                    </div>
                    <div>
                      <span>Impact</span>
                      <strong>{scenario.impact}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{scenario.status}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="riskFlagsCard exact">
                <div className="riskFlagsHeader">
                  <span>Risk Flags</span>
                </div>

                <div className="riskPillRow">
                  {riskFlags.map((flag) => (
                    <span className="riskPill" key={flag}>{flag}</span>
                  ))}
                </div>
              </div>

            </>
          )}

          {activeTab === "swap" && (
            <div className="swapRoutePage">
              <section className="swapTradePanel">
                <div className="swapPanelHero">
                  <span>ARCWAVE SWAP</span>
                  <h2>Swap with route intelligence.</h2>
                  <p>
                    Preview execution, slippage and route quality before sending your transaction.
                  </p>
                </div>


                <div className="swapCompactPoolSelector">
                  <span>POOL</span>

                  <div className="swapCompactPoolPill">
                    <div className="swapCompactPoolIcons">
                      <span className="realUSDCIcon" aria-hidden="true">
  <svg viewBox="0 0 32 32" role="img">
    <circle cx="16" cy="16" r="15" fill="#2775CA" />
    <path d="M16 5.5a10.5 10.5 0 1 0 0 21a10.5 10.5 0 0 0 0-21Zm0 2a8.5 8.5 0 1 1 0 17a8.5 8.5 0 0 1 0-17Z" fill="white" opacity=".92"/>
    <path d="M16 9.2v13.6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M19.8 12.5c-.7-1.2-1.9-1.8-3.7-1.8c-2.2 0-3.7 1.1-3.7 2.8c0 1.9 1.5 2.5 3.6 2.9c2 .4 2.9.7 2.9 1.8c0 1-.9 1.6-2.7 1.6c-1.7 0-2.8-.6-3.6-1.8" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M8.7 11.2a8.7 8.7 0 0 0 0 9.6M23.3 11.2a8.7 8.7 0 0 1 0 9.6" fill="none" stroke="white" strokeWidth="1.35" strokeLinecap="round" opacity=".85"/>
  </svg>
</span>
                      <i>t</i>
                    </div>

                    <strong>{currentPool.label}</strong>
                    <small>⌄</small>

                    <select
                      value={selectedPoolId}
                      onChange={(e) => changePool(e.target.value)}
                      aria-label="Select swap pool"
                    >
                      {POOLS.map((pool) => (
                        <option key={pool.id} value={pool.id}>
                          {pool.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="swapTokenBox">
                  <div className="swapTokenHeader">
                    <div>
                      <span>YOU PAY</span>
                      <strong>{tokenInObj.symbol}</strong>
                    </div>

                    <div className="swapTokenSwitch">
                      <button
                        type="button"
                        className={tokenInIsA ? "active" : ""}
                        onClick={() => setTokenIn(tokenA.address)}
                      >
                        {tokenA.symbol}
                      </button>
                      <button
                        type="button"
                        className={!tokenInIsA ? "active" : ""}
                        onClick={() => setTokenIn(tokenB.address)}
                      >
                        {tokenB.symbol}
                      </button>
                    </div>
                  </div>

                  <div className="swapAmountLine">
                    <input
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="0.5"
                    />

                    <button type="button" className="swapTokenPill">
                      {tokenInObj.symbol}
                    </button>
                  </div>

                  <div className="swapBalanceLine">
                    <span>Balance: {formatTokenAmount(balanceIn, tokenInObj, 6)} {tokenInObj.symbol}</span>
                    <button
                      type="button"
                      onClick={() => setPayAmount(getWalletSwapMax(balanceIn, tokenInObj))}
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div className="swapDirectionDivider">
                  <button
                    type="button"
                    onClick={() => setTokenIn(tokenInIsA ? tokenB.address : tokenA.address)}
                    title="Switch swap direction"
                  >
                    ↓
                  </button>
                </div>

                <div className="swapTokenBox receive">
                  <div className="swapTokenHeader">
                    <div>
                      <span>YOU RECEIVE</span>
                      <strong>{tokenOutObj.symbol}</strong>
                    </div>

                    <em>Estimated</em>
                  </div>

                  <div className="swapAmountLine">
                    <input value={formatTokenAmount(estimatedOutBigInt, tokenOutObj, 6)} readOnly />
                    <button type="button" className="swapTokenPill">
                      {tokenOutObj.symbol}
                    </button>
                  </div>
                </div>

                <div className="swapSlippageBox">
                  <div className="swapSlippageTop">
                    <span>SLIPPAGE TOLERANCE</span>
                    <strong>{slippagePercent}%</strong>
                  </div>

                  <div className="swapSlippageButtons">
                    {["0.1", "0.5", "1.0"].map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={slippageMode === v ? "active" : ""}
                        onClick={() => setSlippageMode(v)}
                      >
                        {v}%
                      </button>
                    ))}

                    <button
                      type="button"
                      className={slippageMode === "custom" ? "active" : ""}
                      onClick={() => setSlippageMode("custom")}
                    >
                      Custom
                    </button>
                  </div>

                  {slippageMode === "custom" && (
                    <input
                      className="swapCustomSlip"
                      value={customSlippage}
                      onChange={(e) => setCustomSlippage(e.target.value)}
                      placeholder="Custom %"
                    />
                  )}
                </div>

                <button
                  type="button"
                  className="swapPrimaryCTA"
                  onClick={doSwap}
                  disabled={loading}
                >
                  {swapButtonText}
                </button>

                <button
                  type="button"
                  className="swapSecondaryCTA"
                  onClick={mintTestTokens}
                  disabled={loading}
                >
                  Get Test Tokens
                </button>
              </section>

              <section className="swapRoutePanel">
                <div className="routeBadge">ROUTE INTELLIGENCE</div>

                <h2>{tokenInObj.symbol} → {tokenOutObj.symbol}</h2>
                <p className="routeSubtitle">
                  Direct pool route selected through {currentPool.label}.
                </p>

                <div className="routeMap">
                  <div className="routeNode">
                    <span>{tokenInObj.symbol}</span>
                    <small>Input</small>
                  </div>

                  <div className="routeConnector">
                    <strong>0.30%</strong>
                    <span>LP fee</span>
                  </div>

                  <div className="routeNode pool">
                    <span>{currentPool.label}</span>
                    <small>Pool</small>
                  </div>

                  <div className="routeConnector">
                    <strong>{priceImpact}</strong>
                    <span>Impact</span>
                  </div>

                  <div className="routeNode">
                    <span>{tokenOutObj.symbol}</span>
                    <small>Output</small>
                  </div>
                </div>

                <div className="routeStatsGrid">
                  <div>
                    <span>Expected output</span>
                    <strong>{formatTokenAmount(estimatedOutBigInt, tokenOutObj, 6)} {tokenOutObj.symbol}</strong>
                  </div>

                  <div>
                    <span>Minimum received</span>
                    <strong>{formatTokenAmount(minimumOutBigInt, tokenOutObj, 6)} {tokenOutObj.symbol}</strong>
                  </div>

                  <div>
                    <span>Price impact</span>
                    <strong>{priceImpact}</strong>
                  </div>

                  <div>
                    <span>Slippage tolerance</span>
                    <strong>{slippagePercent}%</strong>
                  </div>
                </div>

                <div className="routeDepthBox">
                  <div>
                    <span>{tokenA.symbol} Reserve</span>
                    <strong>{fmt(reserveA, 6)}</strong>
                  </div>

                  <div>
                    <span>{tokenB.symbol} Reserve</span>
                    <strong>{fmt(reserveB, 6)}</strong>
                  </div>

                  <div>
                    <span>Total liquidity</span>
                    <strong>{fmt(totalLiquidity, 6)}</strong>
                  </div>
                </div>

                <div className={
                  priceImpactNumber >= 5
                    ? "routeReason warning"
                    : priceImpactNumber >= 1
                    ? "routeReason medium"
                    : "routeReason"
                }>
                  <strong>
                    {priceImpactNumber >= 5
                      ? "High impact route"
                      : priceImpactNumber >= 1
                      ? "Moderate impact route"
                      : "Low impact route"}
                  </strong>

                  <p>
                    {priceImpactNumber >= 5
                      ? "This trade is large compared to available pool reserves. Consider reducing the amount or using a deeper pool."
                      : priceImpactNumber >= 1
                      ? "This route is usable, but the trade size is starting to affect execution price relative to pool depth."
                      : "Best direct route selected because this pool offers sufficient liquidity and the lowest available execution cost for this pair."}
                  </p>
                </div>

                <div className="routeFormulaBox">
                  <span>Slippage explanation</span>
                  <p>
                    Estimated slippage comes from trade size versus pool reserves, plus the 0.30% LP fee.
                    Minimum received applies your selected tolerance before the transaction is sent.
                  </p>
                </div>
              </section>
            </div>
          )}



          {activeTab === "liquidity" && (
            <div className="liquidityMockupPage">
              <section className="liquidityMockupHero">
                <h1>
                  Manage liquidity
                  <br />
                  with <span>precision.</span>
                </h1>

                <p className="liquidityMockupSubtitle">
                  Provide liquidity to ArcWave protected pools and help power deep, efficient stablecoin markets on Arc Testnet.
                </p>

                <div className="liquidityMockupFeatures">
                  <div className="liquidityMockupFeature">
                    <div className="liquidityMockupFeatureIcon">ϟ</div>
                    <div>
                      <strong>Earn trading fees</strong>
                      <p>Get a share of swaps in your pool.</p>
                    </div>
                  </div>

                  <div className="liquidityMockupFeature">
                    <div className="liquidityMockupFeatureIcon">◇</div>
                    <div>
                      <strong>Secure &amp; non-custodial</strong>
                      <p>Your funds stay in your wallet.</p>
                    </div>
                  </div>

                  <div className="liquidityMockupFeature">
                    <div className="liquidityMockupFeatureIcon">◌</div>
                    <div>
                      <strong>Transparent &amp; efficient</strong>
                      <p>Real-time data and clear pool insights.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="liquidityMockupPanel">
                <div className="liquidityPanelHeader">
                  <div>
                    <h2>Liquidity</h2>
                    <p>Provide liquidity to ArcWave protected pools and help power deep, efficient stablecoin markets on Arc Testnet.</p>
                  </div>

                  <div className="liquidityHeaderActions">
                    <span className="liquidityNetworkBadge">● Arc Testnet</span>
                    <button type="button" className="liquidityRefreshButton">
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="liquidityPoolSelector">
                  <label>POOL</label>
                  <div className="liquidityPoolSelectBox realPoolSwitch">
                    <div className="liquidityPoolIcons">
                      <span className="realUSDCIcon" aria-hidden="true">
  <svg viewBox="0 0 32 32" role="img">
    <circle cx="16" cy="16" r="15" fill="#2775CA" />
    <path d="M16 5.5a10.5 10.5 0 1 0 0 21a10.5 10.5 0 0 0 0-21Zm0 2a8.5 8.5 0 1 1 0 17a8.5 8.5 0 0 1 0-17Z" fill="white" opacity=".92"/>
    <path d="M16 9.2v13.6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M19.8 12.5c-.7-1.2-1.9-1.8-3.7-1.8c-2.2 0-3.7 1.1-3.7 2.8c0 1.9 1.5 2.5 3.6 2.9c2 .4 2.9.7 2.9 1.8c0 1-.9 1.6-2.7 1.6c-1.7 0-2.8-.6-3.6-1.8" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M8.7 11.2a8.7 8.7 0 0 0 0 9.6M23.3 11.2a8.7 8.7 0 0 1 0 9.6" fill="none" stroke="white" strokeWidth="1.35" strokeLinecap="round" opacity=".85"/>
  </svg>
</span>
                      <span className="liqIconTARC">t</span>
                    </div>

                    <strong>{currentPool.label}</strong>
                    <small>⌄</small>

                    <select
                      className="liquidityPoolNativeSelect"
                      value={selectedPoolId}
                      onChange={(e) => changePool(e.target.value)}
                      aria-label="Select liquidity pool"
                    >
                      {POOLS.map((pool) => (
                        <option key={pool.id} value={pool.id}>
                          {pool.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="liquidityInnerTabs">
                  <button
                    type="button"
                    className={liquidityMode === "add" ? "liquidityInnerTab active" : "liquidityInnerTab"}
                    onClick={() => setLiquidityMode("add")}
                  >
                    Add
                  </button>

                  <button
                    type="button"
                    className={liquidityMode === "remove" ? "liquidityInnerTab active" : "liquidityInnerTab"}
                    onClick={() => setLiquidityMode("remove")}
                  >
                    Remove
                  </button>
                </div>

                {liquidityMode === "add" && (
                  <div className="liquidityModeContent">
                    <div className="liquidityTokenBox">
                      <div className="liquidityTokenHeader">
                        <div>
                          <span>Token A</span>
                          <strong>{tokenA.symbol}</strong>
                        </div>
                        <p>Balance: {formatTokenAmount(balanceA, tokenA, 6)} {tokenA.symbol}</p>
                      </div>

                      <div className="liquidityAmountRow">
                        <input
                          value={liqA}
                          onChange={(e) => handleLiquidityA(e.target.value)}
                          placeholder="0.10"
                        />

                        <button type="button" className="liquidityTokenSelector">
                          <span className="realUSDCIcon" aria-hidden="true">
  <svg viewBox="0 0 32 32" role="img">
    <circle cx="16" cy="16" r="15" fill="#2775CA" />
    <path d="M16 5.5a10.5 10.5 0 1 0 0 21a10.5 10.5 0 0 0 0-21Zm0 2a8.5 8.5 0 1 1 0 17a8.5 8.5 0 0 1 0-17Z" fill="white" opacity=".92"/>
    <path d="M16 9.2v13.6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M19.8 12.5c-.7-1.2-1.9-1.8-3.7-1.8c-2.2 0-3.7 1.1-3.7 2.8c0 1.9 1.5 2.5 3.6 2.9c2 .4 2.9.7 2.9 1.8c0 1-.9 1.6-2.7 1.6c-1.7 0-2.8-.6-3.6-1.8" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M8.7 11.2a8.7 8.7 0 0 0 0 9.6M23.3 11.2a8.7 8.7 0 0 1 0 9.6" fill="none" stroke="white" strokeWidth="1.35" strokeLinecap="round" opacity=".85"/>
  </svg>
</span>
                          {tokenA.symbol}
                        </button>
                      </div>

                      <div className="liquidityQuickButtons">
                        <button type="button" onClick={setLiquidityHalfA}>HALF</button>
                        <button type="button" onClick={setLiquidityMaxA}>MAX</button>
                      </div>
                    </div>

                    <div className="liquidityPlusDivider">
                      <span title="Add both assets to the pool">+</span>
                    </div>

                    <div className="liquidityTokenBox">
                      <div className="liquidityTokenHeader">
                        <div>
                          <span>Token B</span>
                          <strong>{tokenB.symbol}</strong>
                        </div>
                        <p>Balance: {formatTokenAmount(balanceB, tokenB, 6)} {tokenB.symbol}</p>
                      </div>

                      <div className="liquidityAmountRow">
                        <input
                          value={liqB}
                          onChange={(e) => handleLiquidityB(e.target.value)}
                          placeholder="0.10"
                        />

                        <button type="button" className="liquidityTokenSelector">
                          <span className="liqIconTARC">t</span>
                          {tokenB.symbol}
                        </button>
                      </div>

                      <div className="liquidityQuickButtons">
                        <button type="button" onClick={setLiquidityHalfB}>HALF</button>
                        <button type="button" onClick={setLiquidityMaxB}>MAX</button>
                      </div>
                    </div>

                    <div className="liquiditySummaryBox">
                      <div className="liquiditySummaryTitle">POOL SUMMARY</div>

                      <div className="liquiditySummaryGrid">
                        <div className="liquiditySummaryItem">
                          <span>{tokenA.symbol} Reserve</span>
                          <strong>{fmt(reserveA, 6)}</strong>
                          <small>{tokenA.symbol}</small>
                        </div>

                        <div className="liquiditySummaryItem">
                          <span>{tokenB.symbol} Reserve</span>
                          <strong>{fmt(reserveB, 6)}</strong>
                          <small>{tokenB.symbol}</small>
                        </div>

                        <div className="liquiditySummaryItem">
                          <span>Total LP</span>
                          <strong>{fmt(totalLiquidity, 6)}</strong>
                          <small>LP</small>
                        </div>

                        <div className="liquiditySummaryItem">
                          <span>Fee</span>
                          <strong>0.30%</strong>
                          <small>Pool fee</small>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="liquidityPrimaryCTA"
                      onClick={doAddLiquidity}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : wallet ? "Add Liquidity" : "Connect Wallet"}
                    </button>

                    <button
                      type="button"
                      className="liquiditySecondaryCTA"
                      onClick={mintTestTokens}
                      disabled={loading}
                    >
                      Get Test Tokens
                    </button>

                    <div className="liquidityLpFooter">
                      <div>
                        <span>Your LP position</span>
                        <strong>{fmt(myLiquidity, 6)} LP</strong>
                      </div>

                      <button type="button" onClick={() => setLiquidityMode("remove")}>
                        Switch to Remove →
                      </button>
                    </div>
                  </div>
                )}

                {liquidityMode === "remove" && (
                  <div className="liquidityModeContent">
                    <div className="liquidityRemoveHero">
                      <span>Your LP position</span>
                      <strong>{fmt(myLiquidity, 6)} LP</strong>
                      <p>{currentPool.label}</p>
                    </div>

                    <div className="liquidityTokenBox">
                      <div className="liquidityTokenHeader">
                        <div>
                          <span>Amount to remove</span>
                          <strong>{removePercent}%</strong>
                        </div>
                        <p>LP burned: {fmt(removeLiquidityAmount, 6)}</p>
                      </div>

                      <div className="liquidityAmountRow">
                        <input value={fmt(removeLiquidityAmount, 6)} readOnly />
                        <button type="button" className="liquidityTokenSelector">
                          <span className="liqIconLP">LP</span>
                          LP
                        </button>
                      </div>

                      <div className="liquidityRemoveOptions">
                        {["25", "50", "75", "100"].map((v) => (
                          <button
                            key={v}
                            type="button"
                            className={removePercent === v ? "active" : ""}
                            onClick={() => setRemovePercent(v)}
                          >
                            {v === "100" ? "MAX" : `${v}%`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="liquidityReceiveBox">
                      <div className="liquiditySummaryTitle">YOU RECEIVE</div>

                      <div className="liquidityReceiveGrid">
                        <div>
                          <span>{tokenA.symbol}</span>
                          <strong>{fmt(removeAmountA, 6)}</strong>
                          <small>{tokenA.symbol}</small>
                        </div>

                        <div>
                          <span>{tokenB.symbol}</span>
                          <strong>{fmt(removeAmountB, 6)}</strong>
                          <small>{tokenB.symbol}</small>
                        </div>
                      </div>
                    </div>

                    <div className="liquiditySummaryBox">
                      <div className="liquiditySummaryGrid compact">
                        <div className="liquiditySummaryItem">
                          <span>Pool</span>
                          <strong>{currentPool.label}</strong>
                          <small>Selected pair</small>
                        </div>

                        <div className="liquiditySummaryItem">
                          <span>Removing</span>
                          <strong>{removePercent}%</strong>
                          <small>LP share</small>
                        </div>

                        <div className="liquiditySummaryItem">
                          <span>LP burned</span>
                          <strong>{fmt(removeLiquidityAmount, 6)}</strong>
                          <small>LP</small>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="liquidityPrimaryCTA"
                      onClick={doRemoveLiquidity}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : wallet ? "Remove Liquidity" : "Connect Wallet"}
                    </button>

                    <button
                      type="button"
                      className="liquiditySecondaryCTA"
                      onClick={() => setLiquidityMode("add")}
                    >
                      Back to Add
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}



          {activeTab === "bridge" && (
            <div className="bridgeMockupPage">
              <section className="bridgeMockupHero">
                <h1>
                  Move stablecoins
                  <br />
                  across networks<span>.</span>
                </h1>

                <p className="bridgeMockupSubtitle">
                  Bridge USDC from Arc Testnet to Ethereum Sepolia using Circle CCTP
                  for secure, native transfers.
                </p>

                <div className="bridgeMockupFeatures">
                  <div className="bridgeMockupFeature">
                    <div className="bridgeMockupFeatureIcon">ϟ</div>
                    <div>
                      <strong>Fast settlement</strong>
                      <p>Powered by Circle CCTP for near-instant, reliable cross-chain transfers.</p>
                    </div>
                  </div>

                  <div className="bridgeMockupFeature">
                    <div className="bridgeMockupFeatureIcon">$</div>
                    <div>
                      <strong>Native USDC flow</strong>
                      <p>Move native USDC. No wrapping, no liquidity friction, just seamless transfers.</p>
                    </div>
                  </div>

                  <div className="bridgeMockupFeature">
                    <div className="bridgeMockupFeatureIcon">◇</div>
                    <div>
                      <strong>Transparent transfer tracking</strong>
                      <p>Every step is verifiable onchain with full transparency from burn to mint.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bridgeMockupPanel">
                <div className="bridgeMockupBadge">ARCWAVE BRIDGE</div>

                <h2>Bridge Preview — USDC across networks.</h2>

                <div className="bridgeMockupRoute">
                  <div className="bridgeMockupRouteCard">
                    <span>FROM</span>
                    <div className="bridgeMockupRouteMain">
                      <div className="bridgeIconAW">AW</div>
                      <div>
                        <strong>Arc Testnet</strong>
                        <div className="bridgeMockupPills">
                          <em>Network</em>
                          <em className="live">● Live</em>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bridgeMockupArrow">→</div>

                  <div className="bridgeMockupRouteCard">
                    <span>TO</span>
                    <div className="bridgeMockupRouteMain">
                      <div className="bridgeIconETH" aria-hidden="true">
  <svg viewBox="0 0 24 24" className="bridgeEthSvg">
    <path d="M12 1.5L5.8 11.85L12 8.7L18.2 11.85L12 1.5Z" fill="currentColor"/>
    <path d="M12 22.5L5.8 13.2L12 16.95L18.2 13.2L12 22.5Z" fill="currentColor" opacity="0.92"/>
  </svg>
</div>
                      <div>
                        <strong>Ethereum Sepolia</strong>
                        <div className="bridgeMockupPills">
                          <em>Network</em>
                          <em className="live">● Live</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bridgeMockupAmountBox">
                  <label>AMOUNT TO BRIDGE</label>

                  <div className="bridgeMockupAmountLine">
                    <input
                      value={bridgeAmount}
                      onChange={(e) => setBridgeAmount(e.target.value)}
                      placeholder="0.01"
                    />

                    <div className="bridgeMockupTokenPill">
                      <span className="bridgeIconUSDC bridgeRealUSDCIcon" aria-hidden="true">
                        <svg viewBox="0 0 32 32" role="img">
                          <circle cx="16" cy="16" r="15" fill="#2775CA" />
                          <path d="M16 5.5a10.5 10.5 0 1 0 0 21a10.5 10.5 0 0 0 0-21Zm0 2a8.5 8.5 0 1 1 0 17a8.5 8.5 0 0 1 0-17Z" fill="white" opacity=".92"/>
                          <path d="M16 9.2v13.6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                          <path d="M19.8 12.5c-.7-1.2-1.9-1.8-3.7-1.8c-2.2 0-3.7 1.1-3.7 2.8c0 1.9 1.5 2.5 3.6 2.9c2 .4 2.9.7 2.9 1.8c0 1-.9 1.6-2.7 1.6c-1.7 0-2.8-.6-3.6-1.8" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                          <path d="M8.7 11.2a8.7 8.7 0 0 0 0 9.6M23.3 11.2a8.7 8.7 0 0 1 0 9.6" fill="none" stroke="white" strokeWidth="1.35" strokeLinecap="round" opacity=".85"/>
                        </svg>
                      </span>
                      <strong>USDC</strong>
                      <small>⌄</small>
                    </div>
                  </div>

                  <div className="bridgeMockupUnderLine">
                    <span>Balance: {formatTokenAmount(balanceA, "USDC", 6)} USDC</span>
                    <button type="button" onClick={() => setBridgeAmount(clean(Number(formatUnits(balanceA, tokenDecimals(tokenA)))))}>Max</button>
                  </div>
                </div>

                <div className="bridgeMockupWalletBox">
                  <label>DESTINATION WALLET</label>

                  <div className="bridgeMockupWalletLine">
                    <input
                      value={wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Connected wallet"}
                      readOnly
                    />

                    <button
                      type="button"
                      className="bridgeMockupCopy"
                      onClick={() => navigator.clipboard?.writeText(wallet || "")}
                    >
                      □
                    </button>

                    <div className="bridgeMockupSepoliaPill">
                      <span className="bridgeIconETH small" aria-hidden="true">
  <svg viewBox="0 0 24 24" className="bridgeEthSvg">
    <path d="M12 1.5L5.8 11.85L12 8.7L18.2 11.85L12 1.5Z" fill="currentColor"/>
    <path d="M12 22.5L5.8 13.2L12 16.95L18.2 13.2L12 22.5Z" fill="currentColor" opacity="0.92"/>
  </svg>
</span>
                      <strong>Sepolia</strong>
                      <em>● Live</em>
                    </div>
                  </div>
                </div>

                <div className="bridgeMockupInfoRow">
                  <div>
                    <span>ESTIMATED FEE</span>
                    <strong>0.0008 USDC</strong>
                  </div>

                  <div>
                    <span>ESTIMATED TIME</span>
                    <strong>1–2 min</strong>
                  </div>

                  <div>
                    <span>BRIDGE MODEL</span>
                    <strong>CCTP / Burn &amp; Mint</strong>
                  </div>
                </div>

                <div className="bridgeMockupSteps">
                  <div className="active"><strong>1</strong><span>Prepare</span></div>
                  <div><strong>2</strong><span>Burn</span></div>
                  <div><strong>3</strong><span>Attest</span></div>
                  <div><strong>4</strong><span>Mint</span></div>
                </div>

                <button
                  type="button"
                  className="bridgeMockupCTA"
                  disabled={loading}
                  onClick={async () => {
                    try {
                      setLoading(true);
                      setStatus("Starting Circle CCTP bridge...");

                      const out = await arcwaveBridgeUSDC({
                        amount: bridgeAmount,
                        onStatus: setStatus,
                      });

                      setStatus("Bridge submitted via Circle CCTP.");

                      if (out?.explorerUrl) {
                        window.open(out.explorerUrl, "_blank", "noopener,noreferrer");
                      }

                      console.log("Bridge submitted via Circle CCTP. Check wallet/explorer for status.");
                    } catch (err) {
                      console.error("[ArcWave Bridge] error:", err);
                      setStatus(err?.shortMessage || err?.message || "Bridge failed.");
                      console.warn("ArcWave tx warning:", err?.shortMessage || err?.message || "Bridge failed.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Processing..." : "Bridge USDC →"}
                </button>

                <div className="bridgeMockupSecurity">
                  ♡ Secured by Circle CCTP. Funds are never custodied by ArcWave.
                </div>
              </section>
            </div>
          )}



          {activeTab === "docs" && (
            <>
              <div className="infoHero">
                <span>ARCWAVE AI</span>
                <h3>Meet WaveAgent.</h3>
                <p>
                  ArcWave is a stablecoin-native DEX interface on Arc Testnet.
                  Use it to test swaps, add liquidity, remove liquidity, analytics,
                  points and stablecoin pool behavior.
                </p>
              </div>

              <div className="featureGrid">
                <div className="featureCard">
                  <span>01</span>
                  <strong>Swap Co-Pilot</strong>
                  <p>Get guided explanations before swapping, including slippage, estimated output and price impact.</p>
                </div>

                <div className="featureCard">
                  <span>02</span>
                  <strong>Pool Intelligence</strong>
                  <p>Understand reserves, liquidity depth, pool balance and execution quality.</p>
                </div>

                <div className="featureCard">
                  <span>03</span>
                  <strong>Swap</strong>
                  <p>Choose a pool, set slippage and execute a test swap.</p>
                </div>

                <div className="featureCard">
                  <span>04</span>
                  <strong>Liquidity</strong>
                  <p>Add or remove liquidity and check your LP position.</p>
                </div>
              </div>

              <div className="contractBox">
                <h4>Developer Core</h4>

                <div className="contractLine">
                  <span>Factory</span>
                  <strong>0x0414...4d6f</strong>
                  <button type="button" onClick={() => navigator.clipboard.writeText("0xEd62670DB50E6e1C312F086B3230168D7E1521AA")}>Copy</button>
                </div>

                <div className="contractLine">
                  <span>Router</span>
                  <strong>0x40cC...08B0</strong>
                  <button type="button" onClick={() => navigator.clipboard.writeText("0xD0796C8e58DE024E063770981E153629BcF41932")}>Copy</button>
                </div>

                <div className="contractLine">
                  <span>Selected Pool</span>
                  <strong>{currentPool.label}</strong>
                  <button type="button" onClick={() => navigator.clipboard.writeText(currentPool.address)}>Copy</button>
                </div>
              </div>

              

              

              

              <div className="disclaimerBox">
                ArcWave Points are a reputation system. They are not a token,
                not a financial product and not a guaranteed airdrop.
              </div>
            </>
          )}

          {activeTab === "lab" && (
            <>
              <div className="infoHero labHero">
                <span>ARCWAVE LAB</span>
                <h3>Stablecoin liquidity lab for Arc Testnet.</h3>
                <p>
                  ArcWave Lab turns the DEX into a testing environment for routes,
                  pool creation, liquidity simulation, LP analytics, bug testing and
                  governance experiments.
                </p>
              </div>

              <div className="featureGrid">
                <div className="featureCard">
                  <span>01</span>
                  <strong>Stable Route Scanner</strong>
                  <p>Compare stablecoin routes and identify the best pool to swap.</p>
                </div>

                <div className="featureCard">
                  <span>02</span>
                  <strong>Pool Creator</strong>
                  <p>Create new pools through ArcWaveFactory.</p>
                </div>

                <div className="featureCard">
                  <span>03</span>
                  <strong>Liquidity Simulator</strong>
                  <p>Simulate how deeper liquidity reduces price impact.</p>
                </div>

                <div className="featureCard">
                  <span>04</span>
                  <strong>Governance Sandbox</strong>
                  <p>Mock votes for pools, fees and future incentives.</p>
                </div>
              </div>

              <div className="analyticsWide">
                <div>
                  <span>Factory</span>
                  <strong>0x0414...4d6f</strong>
                </div>

                <div>
                  <span>Router</span>
                  <strong>0x40cC...08B0</strong>
                </div>

                <div>
                  <span>Current Pool</span>
                  <strong>{currentPool.label}</strong>
                </div>

                <div>
                  <span>Pool Status</span>
                  <strong>{reserveA > 0n && reserveB > 0n ? "Active" : "Empty"}</strong>
                </div>

                <div>
                  <span>Lab Status</span>
                  <strong>Prototype Live</strong>
                </div>
              </div>

              

              <button
                type="button"
                className="primaryAction"
                onClick={() => setActiveTab("analytics")}
              >
                View Analytics
              </button>
            </>
          )}


          


          {activeTab === "points" && (
            <>
              <div className="pointsHero">
                <span>ARCWAVE POINTS</span>
                <h3>Test the wave. Build reputation.</h3>
                <p>
                  Points measure useful testnet participation across swaps,
                  liquidity, removals and bug reports. They are reputation only,
                  not a token and not a guaranteed airdrop.
                </p>
              </div>

              <div className="pointsProfile">
                <div>
                  <span>Your estimated points</span>
                  <strong>0</strong>
                </div>

                <div>
                  <span>Tester role</span>
                  <strong>{wallet ? "Active Tester" : "Not connected"}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{wallet ? "Tracking locally" : "Swap Co-Pilot"}</strong>
                </div>
              </div>

              <div className="pointsGrid">
                <div className="pointsCard">
                  <span>SWAP</span>
                  <strong>+10</strong>
                  <p>Per completed swap.</p>
                </div>

                <div className="pointsCard">
                  <span>LIQUIDITY</span>
                  <strong>+50</strong>
                  <p>Per add liquidity transaction.</p>
                </div>

                <div className="pointsCard">
                  <span>REMOVE</span>
                  <strong>+20</strong>
                  <p>Per remove liquidity transaction.</p>
                </div>

                <div className="pointsCard">
                  <span>BUG REPORT</span>
                  <strong>+250—5K</strong>
                  <p>Based on severity and usefulness.</p>
                </div>
              </div>

              <div className="disclaimerBox">
                ArcWave Points are reputation only. They are not a token,
                not a financial product and not a guaranteed airdrop.
              </div>

              <button
                type="button"
                className="primaryAction"
                onClick={() => setActiveTab("swap")}
              >
                Start Testing
              </button>
            </>
          )}

<p className="statusLine">Status: {status}</p>
          {lastRefresh && <p className="lastRefresh">Last refresh: {lastRefresh}</p>}
        </section>
      </main>


      {activeTab === "security" && (
        <section className="securityPage">
          <div className="securityHero">
            <span className="securityBadge">ARCWAVE SECURITY</span>
            <h1>Protected liquidity infrastructure for Arc.</h1>
            <p>
              ArcWave is built with a security-first foundation for stablecoin liquidity:
              protected pools, safer ERC20 transfers, slippage controls, emergency pause
              mechanisms and a passing Foundry test suite.
            </p>
          </div>

          <div className="securityGrid">
            <div className="securityCard">
              <span>01</span>
              <h3>SafeERC20 Transfers</h3>
              <p>
                Token transfers use SafeERC20 patterns to reduce compatibility issues with
                ERC20 implementations that do not behave as expected.
              </p>
            </div>

            <div className="securityCard">
              <span>02</span>
              <h3>Reentrancy Protection</h3>
              <p>
                Swap and liquidity functions are protected with nonReentrant guards to reduce
                attack surface around token transfers and state updates.
              </p>
            </div>

            <div className="securityCard">
              <span>03</span>
              <h3>Emergency Pause</h3>
              <p>
                Critical protocol actions can be paused in emergency situations, allowing the
                system to stop swaps and liquidity operations if needed.
              </p>
            </div>

            <div className="securityCard">
              <span>04</span>
              <h3>Slippage Protection</h3>
              <p>
                Swaps use minimum output checks so users are protected from receiving less than
                their configured tolerance.
              </p>
            </div>

            <div className="securityCard">
              <span>05</span>
              <h3>Deadline-Enabled Swaps</h3>
              <p>
                Deadline-enabled swap functions help prevent old transactions from being executed
                after market conditions change.
              </p>
            </div>

            <div className="securityCard">
              <span>06</span>
              <h3>Verified Stablecoin Pools</h3>
              <p>
                ArcWave starts with protected, curated stablecoin pools instead of permissionless
                random token listings.
              </p>
            </div>
          </div>

          <div className="securityStatusPanel">
            <div>
              <span>Foundry Tests</span>
              <strong>12 / 12 Passed</strong>
            </div>
            <div>
              <span>Network</span>
              <strong>Arc Testnet</strong>
            </div>
            <div>
              <span>Factory</span>
              <strong>0xEd62...21AA</strong>
            </div>
            <div>
              <span>Router</span>
              <strong>0xD079...1932</strong>
            </div>
          </div>

          <div className="securityNote">
            <h3>Production roadmap</h3>
            <p>
              Before mainnet, ArcWave plans to add multisig ownership, timelock protection,
              more invariant tests, static analysis and external review.
            </p>
          </div>
        </section>
      )}


      {activeTab === "footerDocs" && (
        <section className="footerDocsPage">
          <div className="footerDocsHero">
            <span className="footerDocsBadge">ARCWAVE DOCS</span>
            <h1>Stablecoin liquidity and pool intelligence for Arc.</h1>
            <p>
              ArcWave is a working Arc testnet DEX focused on stablecoin swaps,
              protected liquidity pools, route intelligence and transparent pool data.
            </p>
          </div>

          <div className="footerDocsGrid">
            <div className="footerDocsCard">
              <h3>What is ArcWave?</h3>
              <p>
                ArcWave is a decentralized exchange interface for Arc Testnet, built around
                stablecoin liquidity, routing and pool intelligence.
              </p>
            </div>

            <div className="footerDocsCard">
              <h3>Core features</h3>
              <ul>
                <li>Stablecoin swaps</li>
                <li>Add and remove liquidity</li>
                <li>Pool reserve tracking</li>
                <li>Price impact preview</li>
                <li>Route intelligence</li>
              </ul>
            </div>

            <div className="footerDocsCard">
              <h3>Supported pools</h3>
              <ul>
                <li>tUSDC / tARC</li>
                <li>tUSDC / tUSDT</li>
                <li>tUSDC / tDAI</li>
                <li>tUSDC / tUSDe</li>
                <li>tUSDC / tPYUSD</li>
              </ul>
            </div>

            <div className="footerDocsCard">
              <h3>How to swap</h3>
              <p>
                Connect your wallet, select a pool, enter an amount, review expected output,
                price impact and minimum received, then execute the transaction.
              </p>
            </div>

            <div className="footerDocsCard">
              <h3>How liquidity works</h3>
              <p>
                Liquidity providers deposit both assets into a pool and receive an LP position
                representing their share of that pool.
              </p>
            </div>

            <div className="footerDocsCard">
              <h3>Security</h3>
              <p>
                ArcWave uses SafeERC20 transfers, reentrancy protection, emergency pause controls,
                slippage protection and deadline-enabled swap functions.
              </p>
            </div>
          </div>

          <div className="footerDocsContracts">
            <h3>Arc Testnet contracts</h3>
            <div><span>Factory</span><strong>0xEd62670DB50E6e1C312F086B3230168D7E1521AA</strong></div>
            <div><span>Router</span><strong>0xD0796C8e58DE024E063770981E153629BcF41932</strong></div>
            <div><span>Tests</span><strong>12 / 12 Foundry tests passing</strong></div>
          </div>
        </section>
      )}


      {activeTab === "footerGrant" && (
        <section className="footerGrantPage">
          <div className="footerGrantHero">
            <span className="footerGrantBadge">ARCWAVE GRANT PROPOSAL</span>
            <h1>Stablecoin liquidity and pool intelligence for Arc.</h1>
            <p>
              ArcWave is requesting ecosystem support to continue building a stablecoin-focused
              liquidity and pool intelligence layer for Arc. The current prototype is live on
              Arc Testnet with protected pools, swap execution, liquidity management and
              security-focused smart contracts.
            </p>
          </div>

          <div className="footerGrantGrid">
            <div className="footerGrantCard">
              <span>01</span>
              <h3>Live prototype</h3>
              <p>
                ArcWave is already live on Arc Testnet with a working DEX interface, swap page,
                liquidity management and protected stablecoin pools.
              </p>
            </div>

            <div className="footerGrantCard">
              <span>02</span>
              <h3>Security ready</h3>
              <p>
                The protocol uses SafeERC20 transfers, reentrancy protection, emergency pause
                controls, slippage protection and deadline-enabled swap functions.
              </p>
            </div>

            <div className="footerGrantCard">
              <span>03</span>
              <h3>Pool intelligence</h3>
              <p>
                ArcWave surfaces reserves, expected output, minimum received, price impact,
                route quality and pool-level execution data.
              </p>
            </div>

            <div className="footerGrantCard">
              <span>04</span>
              <h3>Why it matters</h3>
              <p>
                Arc needs transparent and reliable stablecoin liquidity. ArcWave helps users
                and builders understand pool health before transactions are sent.
              </p>
            </div>

            <div className="footerGrantCard">
              <span>05</span>
              <h3>Grant use</h3>
              <p>
                Grant funding would support deeper analytics, verified pool labels, route
                intelligence, documentation, testnet campaigns and security hardening.
              </p>
            </div>

            <div className="footerGrantCard">
              <span>06</span>
              <h3>Next milestones</h3>
              <p>
                Upcoming work includes improved dashboards, better route scoring, public pool
                health views, multisig readiness and external audit preparation.
              </p>
            </div>
          </div>

          <div className="footerGrantStatus">
            <div>
              <span>Status</span>
              <strong>Live on Arc Testnet</strong>
            </div>
            <div>
              <span>Tests</span>
              <strong>12 / 12 Foundry tests passing</strong>
            </div>
            <div>
              <span>Pools</span>
              <strong>5 protected pools</strong>
            </div>
            <div>
              <span>Focus</span>
              <strong>Stablecoin liquidity</strong>
            </div>
          </div>

          <div className="footerGrantAsk">
            <div>
              <h3>Seeking ecosystem support</h3>
              <p>
                ArcWave is looking for grant or ecosystem support to continue development,
                improve testnet adoption, expand analytics and harden the protocol toward a
                production-ready stablecoin liquidity product.
              </p>
            </div>

            <div className="footerGrantContact">
              <span>Builder</span>
              <strong>@SALAZAHRR / @KHAOZAL</strong>
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <p>© 2026 <strong>ARCWAVE®</strong>. ALL RIGHTS RESERVED.</p>
        <p>BUILT BY <strong>@SALAZAHRR</strong> AND <strong>@KHAOZAL</strong></p>
        <div className="footerLinks">
          <button type="button" onClick={() => setActiveTab("footerDocs")}>DOCS</button>
          <button type="button" onClick={() => setActiveTab("security")}>SECURITY</button>
          <button type="button" onClick={() => setActiveTab("footerGrant")}>GRANT</button>
          <a href="https://github.com/" target="_blank" rel="noreferrer">GITHUB</a>
        </div>
      </footer>
    </div>
  );
}
