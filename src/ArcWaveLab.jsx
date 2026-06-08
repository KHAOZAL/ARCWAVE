import React, { useMemo, useState } from "react";

function shortAddress(address) {
  if (!address || typeof address !== "string") return "Not set";
  if (!address.startsWith("0x")) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function fmt(value, digits = 4) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString(undefined, {
    maximumFractionDigits: digits,
  });
}

function getAmountOut(amountIn, reserveIn, reserveOut, fee = 0.003) {
  const amount = Number(amountIn || 0);
  const rIn = Number(reserveIn || 0);
  const rOut = Number(reserveOut || 0);

  if (!amount || !rIn || !rOut) return 0;

  const amountInWithFee = amount * (1 - fee);
  return (amountInWithFee * rOut) / (rIn + amountInWithFee);
}

function getPriceImpact(amountIn, reserveIn, reserveOut, amountOut) {
  const amount = Number(amountIn || 0);
  const rIn = Number(reserveIn || 0);
  const rOut = Number(reserveOut || 0);
  const out = Number(amountOut || 0);

  if (!amount || !rIn || !rOut || !out) return 0;

  const spotPrice = rOut / rIn;
  const executionPrice = out / amount;
  const impact = ((spotPrice - executionPrice) / spotPrice) * 100;

  return Math.max(0, impact);
}

function impactStatus(impact) {
  if (impact < 0.5) return "Low impact";
  if (impact < 2) return "Medium impact";
  if (impact < 8) return "High impact";
  return "Pool pressure";
}

function copyText(text) {
  if (!text) return;
  navigator.clipboard?.writeText(text);
}

export default function ArcWaveLab({
  currentPool,
  tokenA,
  tokenB,
  reserveA,
  reserveB,
  dexAddress,
  factoryAddress,
  poolDepthLabel,
  poolBalanceLabel,
  priceImpact,
}) {
  const [amount, setAmount] = useState("100");
  const [depositA, setDepositA] = useState("500");
  const [depositB, setDepositB] = useState("300");
  const [direction, setDirection] = useState("A_TO_B");

  const fromToken = direction === "A_TO_B" ? tokenA : tokenB;
  const toToken = direction === "A_TO_B" ? tokenB : tokenA;

  const reserveIn = direction === "A_TO_B" ? reserveA : reserveB;
  const reserveOut = direction === "A_TO_B" ? reserveB : reserveA;

  const estimatedOutput = useMemo(() => {
    return getAmountOut(amount, reserveIn, reserveOut);
  }, [amount, reserveIn, reserveOut]);

  const simulatedImpact = useMemo(() => {
    return getPriceImpact(amount, reserveIn, reserveOut, estimatedOutput);
  }, [amount, reserveIn, reserveOut, estimatedOutput]);

  const simulatedLpTokens = useMemo(() => {
    const a = Number(depositA || 0);
    const b = Number(depositB || 0);
    if (!a || !b) return 0;
    return Math.sqrt(a * b) / 10;
  }, [depositA, depositB]);

  const impactReduction = useMemo(() => {
    const total = Number(depositA || 0) + Number(depositB || 0);
    if (!total) return 0;
    return Math.min(0.35, total / 250000);
  }, [depositA, depositB]);

  const stressRows = [100, 1000, 10000, 100000].map((size) => {
    const output = getAmountOut(size, reserveA, reserveB);
    const impact = getPriceImpact(size, reserveA, reserveB, output);

    return {
      size,
      output,
      impact,
      status: impactStatus(impact),
    };
  });

  return (
    <section className="arcLabPage">
      <div className="arcLabLeft">
        <div className="arcLabBadge">PROTOCOL SANDBOX</div>

        <h1>ArcWave Lab</h1>

        <p>
          Stablecoin liquidity sandbox for route testing, simulation and protocol experimentation.
        </p>

        <div className="arcLabTabs">
          <span>Simulators</span>
          <span>Pool Creator</span>
          <span>Risk Lab</span>
          <span>Dev Tools</span>
        </div>

        <div className="arcLabGrid">
          <div className="arcLabCard">
            <h3>Route Simulator</h3>
            <p>Simulate swaps and discover route quality before execution.</p>

            <label>Direction</label>
            <select value={direction} onChange={(event) => setDirection(event.target.value)}>
              <option value="A_TO_B">
                {tokenA?.symbol || "Token A"} → {tokenB?.symbol || "Token B"}
              </option>
              <option value="B_TO_A">
                {tokenB?.symbol || "Token B"} → {tokenA?.symbol || "Token A"}
              </option>
            </select>

            <label>Amount</label>
            <input value={amount} onChange={(event) => setAmount(event.target.value)} />

            <button type="button">Simulate Route</button>
          </div>

          <div className="arcLabCard">
            <h3>Simulation Result</h3>
            <p>Best route through the selected direct pool.</p>

            <div className="arcLabRows">
              <div>
                <span>Route</span>
                <b>{fromToken?.symbol} → {toToken?.symbol}</b>
              </div>

              <div>
                <span>Estimated Output</span>
                <b>{fmt(estimatedOutput, 6)} {toToken?.symbol}</b>
              </div>

              <div>
                <span>Price Impact</span>
                <b className={simulatedImpact > 2 ? "danger" : "good"}>
                  {simulatedImpact.toFixed(2)}%
                </b>
              </div>

              <div>
                <span>Route Quality</span>
                <b>{impactStatus(simulatedImpact)}</b>
              </div>
            </div>
          </div>

          <div className="arcLabCard">
            <h3>Liquidity Simulator</h3>
            <p>See how adding liquidity affects pool depth and price impact.</p>

            <label>Deposit {tokenA?.symbol}</label>
            <input value={depositA} onChange={(event) => setDepositA(event.target.value)} />

            <label>Deposit {tokenB?.symbol}</label>
            <input value={depositB} onChange={(event) => setDepositB(event.target.value)} />

            <div className="arcLabRows">
              <div>
                <span>LP Tokens</span>
                <b>{fmt(simulatedLpTokens, 4)}</b>
              </div>

              <div>
                <span>Impact Reduction</span>
                <b className="good">-{(impactReduction * 100).toFixed(2)}%</b>
              </div>
            </div>
          </div>

          <div className="arcLabWideCard">
            <h3>Stablecoin Stress Test</h3>

            <div className="arcLabStress">
              {stressRows.map((row) => (
                <div key={row.size}>
                  <span>${row.size.toLocaleString()}</span>
                  <b>{row.impact.toFixed(2)}%</b>
                  <small>{row.status}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="arcLabWideCard">
            <h3>Experimental Tools</h3>

            <div className="arcLabToolGrid">
              <div>
                <b>AI Pool Scanner</b>
                <span>Detect abnormal pool depth and reserve behavior.</span>
              </div>

              <div>
                <b>Liquidity Stress Test</b>
                <span>Measure pool pressure before execution.</span>
              </div>

              <div>
                <b>Auto LP Strategy</b>
                <span>Preview optimized LP allocation.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside className="arcLabRight">
        <div className="arcLabDevCard">
          <div className="arcLabDevTop">
            <h2>Developer Core</h2>
            <span>Arc Testnet</span>
          </div>

          <div className="arcLabDevRows">
            <div>
              <span>Factory</span>
              <b>{shortAddress(factoryAddress)}</b>
              <button type="button" onClick={() => copyText(factoryAddress)}>Copy</button>
            </div>

            <div>
              <span>Router / DEX</span>
              <b>{shortAddress(dexAddress)}</b>
              <button type="button" onClick={() => copyText(dexAddress)}>Copy</button>
            </div>

            <div>
              <span>Current Pool</span>
              <b>{currentPool?.label || "Unknown pool"}</b>
              <button type="button" onClick={() => copyText(currentPool?.address)}>Copy</button>
            </div>

            <div>
              <span>Pool Status</span>
              <b className="good">{reserveA > 0 && reserveB > 0 ? "Active" : "Empty"}</b>
            </div>

            <div>
              <span>Depth</span>
              <b>{poolDepthLabel}</b>
            </div>

            <div>
              <span>Current Impact</span>
              <b>{priceImpact}</b>
            </div>
          </div>
        </div>

        <div className="arcLabDevCard">
          <h2>Pool Snapshot</h2>

          <div className="arcLabRows">
            <div>
              <span>{tokenA?.symbol} Reserve</span>
              <b>{fmt(reserveA, 4)}</b>
            </div>

            <div>
              <span>{tokenB?.symbol} Reserve</span>
              <b>{fmt(reserveB, 4)}</b>
            </div>

            <div>
              <span>Pool Balance</span>
              <b>{poolBalanceLabel}</b>
            </div>

            <div>
              <span>Lab Status</span>
              <b className="good">Prototype Live</b>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
