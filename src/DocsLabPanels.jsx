export function DocsLeftPanel() {
  return (
    <section className="pageShowcase">
      <div className="pageShowcase__badge">ARCWAVE DOCS</div>

      <h1 className="pageShowcase__title">
        Documentation, guides and test flow.
      </h1>

      <p className="pageShowcase__text">
        ArcWave Docs centralizes the core information to test the protocol on Arc
        Testnet: wallet connection, test tokens, swaps, liquidity, removal and
        points exploration.
      </p>

      <div className="pageShowcase__grid pageShowcase__grid--2">
        <div className="pageShowcase__card">
          <div className="pageShowcase__kicker">01</div>
          <h3>Connect wallet</h3>
          <p>Use MetaMask or Rabby and switch to the Arc Testnet network.</p>
        </div>

        <div className="pageShowcase__card">
          <div className="pageShowcase__kicker">02</div>
          <h3>Get test tokens</h3>
          <p>Mint mock tokens for the selected pool and start testing instantly.</p>
        </div>

        <div className="pageShowcase__card">
          <div className="pageShowcase__kicker">03</div>
          <h3>Test swap</h3>
          <p>Choose a pool, define slippage and simulate the swap experience.</p>
        </div>

        <div className="pageShowcase__card">
          <div className="pageShowcase__kicker">04</div>
          <h3>Test liquidity</h3>
          <p>Add or remove liquidity and inspect LP behavior in the interface.</p>
        </div>
      </div>

      <div className="pageShowcase__wideCard">
        <div className="pageShowcase__miniTitle">Quick notes</div>
        <ul className="pageShowcase__list">
          <li>Use Docs to understand the testing flow.</li>
          <li>Use Swap, Liquidity and Remove for interaction testing.</li>
          <li>Use Points to frame reputation and incentive logic.</li>
          <li>Use Analytics to inspect pool state and test visibility.</li>
        </ul>
      </div>
    </section>
  );
}

export function LabLeftPanel() {
  return (
    <section className="pageShowcase">
      <div className="pageShowcase__badge">ARCWAVE LAB</div>

      <h1 className="pageShowcase__title">
        Stablecoin sandbox for experiments.
      </h1>

      <p className="pageShowcase__text">
        ArcWave Lab is the experimental zone of the protocol — focused on route
        simulation, pool creation logic, liquidity experiments and governance ideas
        for a future stablecoin-native DEX experience.
      </p>

      <div className="pageShowcase__grid pageShowcase__grid--2">
        <div className="pageShowcase__card">
          <div className="pageShowcase__kicker">01</div>
          <h3>Stable Route Scanner</h3>
          <p>Compare paths across stable pools and identify the best route to test.</p>
        </div>

        <div className="pageShowcase__card">
          <div className="pageShowcase__kicker">02</div>
          <h3>Pool Creator</h3>
          <p>Create and validate new pool ideas powered by the ArcWave factory flow.</p>
        </div>

        <div className="pageShowcase__card">
          <div className="pageShowcase__kicker">03</div>
          <h3>Liquidity Simulator</h3>
          <p>Test how deeper liquidity can reduce impact and improve execution.</p>
        </div>

        <div className="pageShowcase__card">
          <div className="pageShowcase__kicker">04</div>
          <h3>Governance Sandbox</h3>
          <p>Explore fee, incentive and points mechanics for future expansion.</p>
        </div>
      </div>

      <div className="pageShowcase__wideCard">
        <div className="pageShowcase__miniTitle">Lab focus</div>
        <ul className="pageShowcase__list">
          <li>Prototype-oriented environment.</li>
          <li>Stablecoin-first experimentation.</li>
          <li>Pool design and route logic exploration.</li>
          <li>Governance and incentive mechanics before production rollout.</li>
        </ul>
      </div>
    </section>
  );
}
export function PointsLeftPanel() {
  return (
    <section className="pageShowcase pointsShowcase">
      <div className="pageShowcase__badge">ARCWAVE POINTS</div>

      <h1 className="pageShowcase__title">
        Reputation for real testnet activity.
      </h1>

      <p className="pageShowcase__text">
        ArcWave Points track useful testnet participation across swaps, liquidity,
        stablecoin pools, bug testing and governance experiments. Points are reputation only,
        not a token and not a guaranteed airdrop.
      </p>

      <div className="pageShowcase__grid pageShowcase__grid--2">
        <div className="pageShowcase__card">
          <div className="pageShowcase__kicker">+10</div>
          <h3>Swap Tester</h3>
          <p>Earn local reputation by testing swaps across ArcWave pools.</p>
        </div>

        <div className="pageShowcase__card">
          <div className="pageShowcase__kicker">+50</div>
          <h3>Liquidity Tester</h3>
          <p>Add liquidity and help validate pool behavior on Arc Testnet.</p>
        </div>

        <div className="pageShowcase__card">
          <div className="pageShowcase__kicker">+20</div>
          <h3>Remove Tester</h3>
          <p>Remove liquidity and test LP withdrawal flows.</p>
        </div>

        <div className="pageShowcase__card">
          <div className="pageShowcase__kicker">BUG</div>
          <h3>Bug Hunter</h3>
          <p>Report useful bugs, edge cases and UX issues to improve ArcWave.</p>
        </div>
      </div>
    </section>
  );
}
