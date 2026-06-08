import React, { useMemo, useState } from "react";

export default function ArcWaveVaults() {
  const [activeVaultTab, setActiveVaultTab] = useState("mint");
  const [percent, setPercent] = useState("100");
  const [vaultStatus, setVaultStatus] = useState("Ready");
  const [nftContract, setNftContract] = useState("0xf87a...b3c9");
  const [tokenId, setTokenId] = useState("408");

  const totalFractions = 12650;

  const mintAmount = useMemo(() => {
    const amount = (Number(percent) / 100) * totalFractions;
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [percent]);

  const handleDeposit = () => {
    setVaultStatus("NFT deposit simulated");
    setActiveVaultTab("mint");
  };

  const handleMint = () => {
    setVaultStatus(`${mintAmount} fCDR minted`);
  };

  const handleRedeem = () => {
    setVaultStatus("Redeem preview opened");
  };

  const handleAddLiquidity = () => {
    setVaultStatus("Liquidity route prepared");
  };

  const handleOpenSea = () => {
    window.open("https://opensea.io/", "_blank", "noopener,noreferrer");
  };

  return (
    <section className="vaultImageExactPage">
      <div className="vaultImageExactBox">
        <div className="vaultImageTopbar">
          <div className="vaultImageTopTitle">
            <span>4</span>
            <strong>Vaults (Experimental)</strong>
            <em>Prototype</em>
          </div>

          <div className="vaultLiveStatus">
            Status: <b>{vaultStatus}</b>
          </div>
        </div>

        <div className="vaultImageInner">
          <div className="vaultImageHeader">
            <h1>NFT Fraction Vault</h1>
            <p>Turn high-value NFTs into liquid, tradeable fractions.</p>
          </div>

          <div className="vaultImageGrid">
            <article className="vaultImageNftCard">
              <div className="vaultImageArt">
                <div className="vaultImageArtNebula" />
                <div className="vaultImageArtPerson" />
                <div className="vaultImageArtSpark" />
              </div>

              <h2>Cosmic Drift #408</h2>
              <p>0xf87a...b3c9</p>

              <div className="vaultImageInfoRows">
                <div><span>Collection</span><b>Cosmic Drift</b></div>
                <div><span>Network</span><b>Ethereum</b></div>
                <div><span>Token ID</span><b>#{tokenId}</b></div>
                <div><span>Floor Price</span><b>12.65 ETH</b></div>
              </div>

              <button type="button" className="vaultImageSecondary" onClick={handleOpenSea}>
                View on OpenSea
              </button>
            </article>

            <article className="vaultImageMintCard">
              <div className="vaultImageTabs">
                <button
                  type="button"
                  className={activeVaultTab === "deposit" ? "active" : ""}
                  onClick={() => setActiveVaultTab("deposit")}
                >
                  Deposit
                </button>

                <button
                  type="button"
                  className={activeVaultTab === "mint" ? "active" : ""}
                  onClick={() => setActiveVaultTab("mint")}
                >
                  Mint Fractions
                </button>

                <button
                  type="button"
                  className={activeVaultTab === "redeem" ? "active" : ""}
                  onClick={() => setActiveVaultTab("redeem")}
                >
                  Redeem
                </button>
              </div>

              {activeVaultTab === "deposit" && (
                <div className="vaultTabContent">
                  <h3>Deposit NFT</h3>
                  <p>Lock an NFT into the vault before minting fractions.</p>

                  <label>NFT Contract</label>
                  <input
                    value={nftContract}
                    onChange={(event) => setNftContract(event.target.value)}
                  />

                  <label>Token ID</label>
                  <input
                    value={tokenId}
                    onChange={(event) => setTokenId(event.target.value)}
                  />

                  <div className="vaultImageLine">
                    <span>Vault Type</span>
                    <strong>ERC721 Fraction Vault</strong>
                  </div>

                  <button type="button" className="vaultImagePrimary" onClick={handleDeposit}>
                    Simulate Deposit
                  </button>
                </div>
              )}

              {activeVaultTab === "mint" && (
                <>
                  <div className="vaultImageForm">
                    <div className="vaultImageValuation">
                      <span>Total Valuation</span>
                      <strong>12.65 ETH</strong>
                      <small>≈ $24,580.22</small>
                    </div>

                    <label>
                      <span>Fractions to Mint</span>
                      <div className="vaultImageInputWrap">
                        <input value={mintAmount} readOnly />
                        <b>of 12,650.00</b>
                      </div>
                    </label>

                    <div className="vaultImageSliderBlock">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={percent}
                        onChange={(event) => setPercent(event.target.value)}
                      />

                      <div>
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="vaultImageLine">
                      <span>Price per Fraction</span>
                      <strong>0.001 ETH</strong>
                    </div>

                    <div className="vaultImageLine receive">
                      <span>You Will Receive</span>
                      <strong>{mintAmount} fCDR</strong>
                    </div>
                  </div>

                  <button type="button" className="vaultImagePrimary" onClick={handleMint}>
                    Mint Fractions
                  </button>
                </>
              )}

              {activeVaultTab === "redeem" && (
                <div className="vaultTabContent">
                  <h3>Redeem NFT</h3>
                  <p>Redeem requires collecting 100% of the fraction supply.</p>

                  <div className="vaultRedeemBox">
                    <strong>Required</strong>
                    <span>12,650.00 fCDR</span>
                  </div>

                  <div className="vaultRedeemBox">
                    <strong>Your Balance</strong>
                    <span>{mintAmount} fCDR</span>
                  </div>

                  <div className="vaultImageLine">
                    <span>Redeem Status</span>
                    <strong>{Number(percent) >= 100 ? "Eligible" : "Not enough fractions"}</strong>
                  </div>

                  <button type="button" className="vaultImagePrimary" onClick={handleRedeem}>
                    Preview Redeem
                  </button>
                </div>
              )}
            </article>

            <aside className="vaultImageSide">
              <div className="vaultImageSideCard">
                <h3>Vault Stats</h3>

                <div className="vaultImageSideRows">
                  <div><span>Total Fractions</span><b>12,650.00 fCDR</b></div>
                  <div><span>Supply</span><b>{percent}%</b></div>
                  <div><span>Holders</span><b>132</b></div>
                  <div><span>Vault TVL</span><b>9.92 ETH</b></div>
                </div>
              </div>

              <div className="vaultImageSideCard">
                <h3>Liquidity Pool (fCDR / tUSDC)</h3>

                <div className="vaultImageSideRows">
                  <div><span>TVL</span><b>$18,432.11</b></div>
                  <div><span>24h Volume</span><b>$2,145.22</b></div>
                  <div><span>APR</span><b>23.41%</b></div>
                </div>

                <button type="button" className="vaultImageLiquidity" onClick={handleAddLiquidity}>
                  Add Liquidity
                </button>
              </div>
            </aside>
          </div>

          <p className="vaultImageWarning">Experimental feature. Use at your own risk.</p>
        </div>
      </div>
    </section>
  );
}
