import React from "react";

export default function ArcWaveActivity() {
  return (
    <section className="awActivityPremium">
      <div className="awActivityWave" />

      <div className="awActivityHero">
        <div className="awActivityBadge">USER ENGAGEMENT</div>
        <h1>ArcWave Activity</h1>
        <p>Track your testnet engagement, swaps, liquidity, payments and AI interactions across ArcWave.</p>
      </div>

      <div className="awMetricGrid">
        <div className="awMetricCard purple">
          <div className="awMetricIcon">↔</div>
          <span>Swaps Tested</span>
          <strong>128</strong>
          <b>↑ 18%</b>
          <small>vs last 30 days</small>
          <div className="awMiniBars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
        </div>

        <div className="awMetricCard blue">
          <div className="awMetricIcon">◈</div>
          <span>Liquidity Added</span>
          <strong>$24.6K</strong>
          <b>↑ 22%</b>
          <small>vs last 30 days</small>
          <div className="awMiniBars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
        </div>

        <div className="awMetricCard cyan">
          <div className="awMetricIcon">◎</div>
          <span>Pools Explored</span>
          <strong>43</strong>
          <b>↑ 12%</b>
          <small>vs last 30 days</small>
          <div className="awMiniBars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
        </div>

        <div className="awMetricCard pink">
          <div className="awMetricIcon">↗</div>
          <span>Pay Links Created</span>
          <strong>24</strong>
          <b>↑ 7%</b>
          <small>vs last 30 days</small>
          <div className="awMiniBars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
        </div>

        <div className="awMetricCard violet">
          <div className="awMetricIcon">▣</div>
          <span>WaveAgent Q&A</span>
          <strong>156</strong>
          <b>↑ 11%</b>
          <small>vs last 30 days</small>
          <div className="awMiniBars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
        </div>

        <div className="awMetricCard orange">
          <div className="awMetricIcon">⌬</div>
          <span>Simulations Run</span>
          <strong>87</strong>
          <b>↑ 27%</b>
          <small>vs last 30 days</small>
          <div className="awMiniBars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
        </div>
      </div>

      <div className="awActivityPanels">
        <div className="awScorePanel">
          <div className="awPanelTitle">
            <div>☄</div>
            <h2>Your Activity Score</h2>
          </div>

          <div className="awScoreBody">
            <div className="awScoreRing">
              <strong>725</strong>
              <span>/1000</span>
            </div>

            <div className="awScoreText">
              <h3>Advanced Explorer</h3>
              <p>You’re an advanced explorer pushing the limits of ArcWave. Keep engaging to reach legendary status.</p>
            </div>
          </div>

          <div className="awScoreProgress">
            <div><span /></div>
            <b>72.5%</b>
          </div>
        </div>

        <div className="awChartPanel">
          <div className="awChartTop">
            <div className="awPanelTitle">
              <div>◔</div>
              <h2>Activity Overview</h2>
            </div>
            <button type="button">30 Days⌄</button>
          </div>

          <div className="awChartLegend">
            <span className="legendPurple">Swaps</span>
            <span className="legendBlue">Liquidity</span>
            <span className="legendPink">Pay</span>
            <span className="legendCyan">WaveAgent</span>
          </div>

          <div className="awFakeChart">
            <div className="line line1" />
            <div className="line line2" />
            <div className="line line3" />
            <div className="line line4" />
          </div>

          <div className="awChartDates">
            <span>May 5</span>
            <span>May 12</span>
            <span>May 19</span>
            <span>May 26</span>
            <span>Jun 2</span>
          </div>
        </div>

        <div className="awTopPanel">
          <div className="awPanelTitle">
            <div>★</div>
            <h2>Top Actions</h2>
          </div>

          <div className="awTopRows">
            <div><em>1</em><span>Swap on tUSDC/tARC</span><b>28</b></div>
            <div><em>2</em><span>Add Liquidity</span><b>22</b></div>
            <div><em>3</em><span>Generate Payment Link</span><b>19</b></div>
            <div><em>4</em><span>WaveAgent Q&A</span><b>15</b></div>
            <div><em>5</em><span>Pool Analysis</span><b>11</b></div>
            <div><em>6</em><span>Run Simulation</span><b>8</b></div>
          </div>

          <button type="button">View Full Activity <span>→</span></button>
        </div>
      </div>
    </section>
  );
}
