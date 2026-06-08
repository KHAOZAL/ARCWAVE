import { useMemo, useState } from "react";
import "./premium-waveagent.css";

const QUICK_ACTIONS = [
  "Explain swap",
  "Analyze pool",
  "Suggest slippage",
  "Add liquidity help",
  "Risk signals",
  "Compare pools",
];

const POOL_DATA = {
  USDC_TARC: {
    label: "USDC / tARC",
    tvl: "$196.83K",
    tvlChange: "+2.34% (24h)",
    volume: "$60.16K",
    volumeChange: "+18.74% (24h)",
    fees: "$180.27",
    feesChange: "+21.18% (24h)",
    score: 82,
    scoreLabel: "Very Good",
    poolHealth: "93/100",
    poolHealthLabel: "Excellent",
    priceImpact: "0.21%",
    impactLabel: "Low",
    liquidityDepth: "$98.21K",
    depthLabel: "High",
    lpOpportunity: "High",
    lpLabel: "Attractive",
    liquidityDepthStatus: "High",
    priceImpactStatus: "Low",
    volumeTrend: "Growing",
    reserveBalance: "Balanced",
    recommendedSlippage: "0.30%",
    tip: "For this pool, setting slippage to 0.30% provides a good balance between execution success and price efficiency for most stablecoin swaps.",
    chat: "USDC / tARC looks healthy for testnet usage, with low price impact, balanced reserves and enough depth for small to medium swaps.",
    risk: ["Healthy", "Live", "Depth OK", "Impact OK", "No Alerts"],
  },

  TUSDC_TARC: {
    label: "tUSDC / tARC",
    tvl: "$184.42K",
    tvlChange: "+1.92% (24h)",
    volume: "$48.73K",
    volumeChange: "+12.40% (24h)",
    fees: "$146.19",
    feesChange: "+12.40% (24h)",
    score: 79,
    scoreLabel: "Good",
    poolHealth: "89/100",
    poolHealthLabel: "Strong",
    priceImpact: "0.28%",
    impactLabel: "Low",
    liquidityDepth: "$84.60K",
    depthLabel: "Good",
    lpOpportunity: "Medium",
    lpLabel: "Balanced",
    liquidityDepthStatus: "Good",
    priceImpactStatus: "Low",
    volumeTrend: "Stable",
    reserveBalance: "Balanced",
    recommendedSlippage: "0.35%",
    tip: "This pool is stable, but slightly less deep than USDC / tARC. For larger swaps, keep slippage a bit higher.",
    chat: "tUSDC / tARC is stable and balanced, but has slightly less depth than the main USDC route.",
    risk: ["Healthy", "Live", "Depth OK", "Impact OK", "No Alerts"],
  },

  USDC_TUSDT: {
    label: "USDC / tUSDT",
    tvl: "$232.10K",
    tvlChange: "+3.10% (24h)",
    volume: "$91.44K",
    volumeChange: "+24.81% (24h)",
    fees: "$274.32",
    feesChange: "+24.81% (24h)",
    score: 88,
    scoreLabel: "Excellent",
    poolHealth: "96/100",
    poolHealthLabel: "Excellent",
    priceImpact: "0.12%",
    impactLabel: "Very Low",
    liquidityDepth: "$122.40K",
    depthLabel: "Very High",
    lpOpportunity: "High",
    lpLabel: "Attractive",
    liquidityDepthStatus: "Very High",
    priceImpactStatus: "Very Low",
    volumeTrend: "Growing",
    reserveBalance: "Balanced",
    recommendedSlippage: "0.20%",
    tip: "USDC / tUSDT is the strongest stable route right now. Low slippage is usually enough for normal testnet swaps.",
    chat: "USDC / tUSDT has the best current depth and the lowest expected impact among the stablecoin routes.",
    risk: ["Healthy", "Live", "Depth Strong", "Impact Low", "No Alerts"],
  },

  USDC_TDAI: {
    label: "USDC / tDAI",
    tvl: "$121.72K",
    tvlChange: "+0.84% (24h)",
    volume: "$22.19K",
    volumeChange: "+4.22% (24h)",
    fees: "$66.57",
    feesChange: "+4.22% (24h)",
    score: 71,
    scoreLabel: "Good",
    poolHealth: "82/100",
    poolHealthLabel: "Good",
    priceImpact: "0.44%",
    impactLabel: "Moderate",
    liquidityDepth: "$54.18K",
    depthLabel: "Medium",
    lpOpportunity: "Medium",
    lpLabel: "Selective",
    liquidityDepthStatus: "Medium",
    priceImpactStatus: "Moderate",
    volumeTrend: "Stable",
    reserveBalance: "Balanced",
    recommendedSlippage: "0.50%",
    tip: "USDC / tDAI has moderate depth. It is fine for small trades, but larger orders may need higher slippage.",
    chat: "USDC / tDAI is usable, but its lower depth can create more impact for larger swaps.",
    risk: ["Healthy", "Live", "Depth Medium", "Impact Medium", "No Alerts"],
  },

  USDC_TUSDE: {
    label: "USDC / tUSDe",
    tvl: "$76.40K",
    tvlChange: "-1.12% (24h)",
    volume: "$14.92K",
    volumeChange: "-3.20% (24h)",
    fees: "$44.76",
    feesChange: "-3.20% (24h)",
    score: 64,
    scoreLabel: "Watch",
    poolHealth: "74/100",
    poolHealthLabel: "Fair",
    priceImpact: "0.72%",
    impactLabel: "Elevated",
    liquidityDepth: "$33.80K",
    depthLabel: "Low",
    lpOpportunity: "Medium",
    lpLabel: "Risk/Reward",
    liquidityDepthStatus: "Low",
    priceImpactStatus: "Elevated",
    volumeTrend: "Cooling",
    reserveBalance: "Slightly uneven",
    recommendedSlippage: "0.75%",
    tip: "This pool has thinner liquidity. Use smaller trade sizes or higher slippage tolerance.",
    chat: "USDC / tUSDe is thinner and should be treated with more caution for larger swaps.",
    risk: ["Live", "Depth Low", "Impact Watch", "Monitor", "No Critical Alerts"],
  },

  USDC_TPYUSD: {
    label: "USDC / tPYUSD",
    tvl: "$95.28K",
    tvlChange: "+0.43% (24h)",
    volume: "$18.52K",
    volumeChange: "+2.70% (24h)",
    fees: "$55.56",
    feesChange: "+2.70% (24h)",
    score: 69,
    scoreLabel: "Good",
    poolHealth: "78/100",
    poolHealthLabel: "Good",
    priceImpact: "0.58%",
    impactLabel: "Moderate",
    liquidityDepth: "$42.70K",
    depthLabel: "Medium",
    lpOpportunity: "Medium",
    lpLabel: "Balanced",
    liquidityDepthStatus: "Medium",
    priceImpactStatus: "Moderate",
    volumeTrend: "Stable",
    reserveBalance: "Balanced",
    recommendedSlippage: "0.60%",
    tip: "USDC / tPYUSD is balanced but not as deep as the main USDC routes. Keep swap sizes moderate.",
    chat: "USDC / tPYUSD is balanced, but not deep enough for aggressive routing yet.",
    risk: ["Healthy", "Live", "Depth Medium", "Impact Medium", "No Alerts"],
  },
};

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function buildAgentReply(question, pool) {
  const q = String(question || "").toLowerCase();

  if (q.includes("slippage") || q.includes("slip")) {
    return `For ${pool.label}, I would start with ${pool.recommendedSlippage}. Current estimated price impact is ${pool.priceImpact}, liquidity depth is ${pool.liquidityDepth}, and pool score is ${pool.score}/100.`;
  }

  if (q.includes("risk") || q.includes("seguro") || q.includes("alert")) {
    return `${pool.label} risk status: ${pool.risk.join(", ")}. Main thing to watch is price impact: ${pool.priceImpactStatus}.`;
  }

  if (q.includes("liquidity") || q.includes("lp") || q.includes("add")) {
    return `LP view for ${pool.label}: liquidity depth is ${pool.liquidityDepth}, LP opportunity is ${pool.lpOpportunity} (${pool.lpLabel}), and 24h fees are ${pool.fees}.`;
  }

  if (q.includes("compare") || q.includes("best") || q.includes("melhor")) {
    const best = Object.values(POOL_DATA).sort((a, b) => b.score - a.score)[0];
    return `The strongest pool right now is ${best.label}, with score ${best.score}/100, TVL ${best.tvl}, price impact ${best.priceImpact}, and recommended slippage ${best.recommendedSlippage}.`;
  }

  if (q.includes("swap") || q.includes("trade") || q.includes("route")) {
    return `For swaps on ${pool.label}, the route has ${pool.impactLabel.toLowerCase()} impact. Suggested slippage is ${pool.recommendedSlippage}. Depth is ${pool.liquidityDepth}, so smaller trades should execute more efficiently.`;
  }

  if (q.includes("volume") || q.includes("fee") || q.includes("fees")) {
    return `${pool.label} has 24h volume of ${pool.volume} (${pool.volumeChange}) and estimated 24h fees of ${pool.fees}. Volume trend is ${pool.volumeTrend}.`;
  }

  return `${pool.label}: score ${pool.score}/100, TVL ${pool.tvl}, volume ${pool.volume}, price impact ${pool.priceImpact}, and recommended slippage ${pool.recommendedSlippage}. ${pool.tip}`;
}

export default function PremiumWaveAgent() {
  const [selectedPoolId, setSelectedPoolId] = useState("USDC_TARC");
  const [input, setInput] = useState("");

  const selectedPool = useMemo(() => {
    return POOL_DATA[selectedPoolId] || POOL_DATA.USDC_TARC;
  }, [selectedPoolId]);

  const [messages, setMessages] = useState([
    {
      role: "agent",
      text: "Hello, I'm WaveAgent. I can explain pools, estimate swap impact, suggest slippage, compare pools and guide liquidity actions.",
      time: getTime(),
    },
    {
      role: "user",
      text: "Which pool is best for a stablecoin swap right now?",
      time: getTime(),
    },
    {
      role: "agent",
      text: POOL_DATA.USDC_TARC.chat,
      time: getTime(),
    },
  ]);

  function sendQuestion(text) {
    const clean = String(text || "").trim();
    if (!clean) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: clean,
        time: getTime(),
      },
      {
        role: "agent",
        text: buildAgentReply(clean, selectedPool),
        time: getTime(),
      },
    ]);

    setInput("");
  }

  function handleQuickAction(action) {
    const prompts = {
      "Explain swap": `Explain the best swap route for ${selectedPool.label}.`,
      "Analyze pool": `Analyze the current health of ${selectedPool.label}.`,
      "Suggest slippage": `Suggest slippage for ${selectedPool.label}.`,
      "Add liquidity help": `Should I add liquidity to ${selectedPool.label}?`,
      "Risk signals": `Show risk signals for ${selectedPool.label}.`,
      "Compare pools": "Which pool is best right now?",
    };

    sendQuestion(prompts[action] || action);
  }

  function handlePoolChange(e) {
    const next = e.target.value;
    const nextPool = POOL_DATA[next] || POOL_DATA.USDC_TARC;

    setSelectedPoolId(next);

    setMessages((prev) => [
      ...prev,
      {
        role: "agent",
        text: `Pool switched to ${nextPool.label}. ${nextPool.chat} Recommended slippage: ${nextPool.recommendedSlippage}.`,
        time: getTime(),
      },
    ]);
  }

  return (
    <section className="awV2" onDoubleClick={(event) => { event.preventDefault(); event.stopPropagation(); }}>
      <div className="awV2Card awV2ChatCard">
        <div className="awV2Badge">AI INTELLIGENCE LAYER</div>

        <div className="awV2Hero">
          <div>
            <h1>WaveAgent</h1>
            <p>
              Your AI copilot for smarter DeFi decisions. Understand swaps, liquidity,
              pools, slippage and LP actions — all in natural language.
            </p>
          </div>

          <div className="awV2Orb">✦</div>
        </div>

        <div className="awV2Chat">
          <h2>Chat with WaveAgent</h2>

          <div className="awV2Messages">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={msg.role === "user" ? "awV2Msg awV2User" : "awV2Msg awV2Agent"}
              >
                {msg.role === "agent" && <div className="awV2Avatar">AW</div>}

                <div className="awV2Bubble">
                  <p>{msg.text}</p>
                  <span>{msg.time}</span>
                </div>

                {msg.role === "user" && <div className="awV2UserIcon">⌾</div>}
              </div>
            ))}
          </div>

          <div className="awV2InputRow">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendQuestion(input);
              }}
              placeholder={`Ask about ${selectedPool.label}, slippage, LP risk or swap routes...`}
            />

            <button type="button" onClick={() => sendQuestion(input)}>
              Send
            </button>
          </div>

          <div className="awV2Actions">
            {QUICK_ACTIONS.map((action) => (
              <button key={action} type="button" onClick={() => handleQuickAction(action)}>
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="awV2Card awV2IntelCard">
        <div className="awV2Top">
          <div>
            <h2>Pool Intelligence Overview</h2>

            <select
              className="awV2PoolSelect awV2PoolSelectReal"
              value={selectedPoolId}
              onChange={handlePoolChange}
              aria-label="Select pool for WaveAgent analysis"
            >
              {Object.entries(POOL_DATA).map(([id, pool]) => (
                <option key={id} value={id}>
                  {pool.label}
                </option>
              ))}
            </select>
          </div>

          <div className="awV2Refresh">
            <span>Last updated · {getTime()}</span>
            <button type="button" onClick={() => sendQuestion(`Refresh analysis for ${selectedPool.label}`)}>
              ↻ Refresh
            </button>
          </div>
        </div>

        <div className="awV2Stats">
          <div className="awV2Stat">
            <span>Current Pool TVL</span>
            <strong>{selectedPool.tvl}</strong>
            <em>{selectedPool.tvlChange}</em>
          </div>

          <div className="awV2Stat">
            <span>Volume 24h</span>
            <strong>{selectedPool.volume}</strong>
            <em>{selectedPool.volumeChange}</em>
          </div>

          <div className="awV2Stat">
            <span>Fees 24h</span>
            <strong>{selectedPool.fees}</strong>
            <em>{selectedPool.feesChange}</em>
          </div>

          <div className="awV2ScoreBox">
            <div className="awV2Ring">
              <strong>{selectedPool.score}</strong>
              <span>/100</span>
            </div>
            <b>Pool Score</b>
            <small>{selectedPool.scoreLabel}</small>
          </div>
        </div>

        <div className="awV2Middle">
          <div className="awV2Insights">
            <h3>AI Insights</h3>
            <p><span>Liquidity Depth</span><strong>{selectedPool.liquidityDepthStatus}</strong></p>
            <p><span>Price Impact</span><strong>{selectedPool.priceImpactStatus}</strong></p>
            <p><span>Volume Trend</span><strong>{selectedPool.volumeTrend}</strong></p>
            <p><span>Reserve Balance</span><strong>{selectedPool.reserveBalance}</strong></p>
          </div>

          <div className="awV2Metric">
            <span>♡</span>
            <p>Pool Health</p>
            <strong>{selectedPool.poolHealth}</strong>
            <em>{selectedPool.poolHealthLabel}</em>
          </div>

          <div className="awV2Metric">
            <span>◎</span>
            <p>Price Impact</p>
            <strong>{selectedPool.priceImpact}</strong>
            <em>{selectedPool.impactLabel}</em>
          </div>

          <div className="awV2Metric">
            <span>♢</span>
            <p>Liquidity Depth</p>
            <strong>{selectedPool.liquidityDepth}</strong>
            <em>{selectedPool.depthLabel}</em>
          </div>

          <div className="awV2Metric">
            <span>☆</span>
            <p>LP Opportunity</p>
            <strong>{selectedPool.lpOpportunity}</strong>
            <em>{selectedPool.lpLabel}</em>
          </div>
        </div>

        <div className="awV2Tip">
          <div className="awV2TipIcon">✦</div>

          <div>
            <strong>Tip from WaveAgent</strong>
            <p>{selectedPool.tip}</p>
          </div>

          <div className="awV2Slip">
            <span>Recommended</span>
            <strong>Slippage: {selectedPool.recommendedSlippage}</strong>
          </div>
        </div>

        <div className="awV2Risk">
          <h3>Risk &amp; Status</h3>

          <div>
            {selectedPool.risk.map((item) => (
              <span key={item}>● {item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
