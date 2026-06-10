
import { createPublicClient, http, formatUnits } from "viem";

const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
};

const client = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
});

const ERC20_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint8" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "string" }] },
];

const DEX_ABI = [
  { type: "function", name: "tokenA", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "address" }] },
  { type: "function", name: "tokenB", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "address" }] },
  { type: "function", name: "reserveA", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "reserveB", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "totalLiquidity", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
];

const wallet = process.argv[2];

if (!wallet) {
  console.log("Uso: node check-pool.mjs SUA_WALLET");
  process.exit(1);
}

const pools = [
  ["USDC/tARC", "0x671199e3F5cc97170A70d0C47e32e5f8FfeE4cE7"],
  ["USDC/tUSDT", "0x2BD2D2935D02eBb49BeEDE9b32e5EF6F976DDF84"],
  ["USDC/tDAI", "0xA63bA3DF60Aed1D87d2f141d9aE1ed69fF1D07c4"],
  ["USDC/tUSDe", "0x05D8B17ea05b87514157037899C726985a7e70d7"],
  ["USDC/tPYUSD", "0x1958706756A77871b925194A92f3629db4956c51"],
];

for (const [label, pool] of pools) {
  console.log("\\n===", label, pool, "===");

  const [tokenA, tokenB, reserveA, reserveB, totalLiquidity] = await Promise.all([
    client.readContract({ address: pool, abi: DEX_ABI, functionName: "tokenA" }),
    client.readContract({ address: pool, abi: DEX_ABI, functionName: "tokenB" }),
    client.readContract({ address: pool, abi: DEX_ABI, functionName: "reserveA" }),
    client.readContract({ address: pool, abi: DEX_ABI, functionName: "reserveB" }),
    client.readContract({ address: pool, abi: DEX_ABI, functionName: "totalLiquidity" }),
  ]);

  console.log("tokenA:", tokenA);
  console.log("tokenB:", tokenB);
  console.log("reserveA raw:", reserveA.toString());
  console.log("reserveB raw:", reserveB.toString());
  console.log("totalLiquidity:", totalLiquidity.toString());

  for (const [name, token] of [["A", tokenA], ["B", tokenB]]) {
    let decimals = 18;
    let symbol = "?";

    try { decimals = await client.readContract({ address: token, abi: ERC20_ABI, functionName: "decimals" }); } catch {}
    try { symbol = await client.readContract({ address: token, abi: ERC20_ABI, functionName: "symbol" }); } catch {}

    const [balance, allowance] = await Promise.all([
      client.readContract({ address: token, abi: ERC20_ABI, functionName: "balanceOf", args: [wallet] }),
      client.readContract({ address: token, abi: ERC20_ABI, functionName: "allowance", args: [wallet, pool] }),
    ]);

    console.log(`token${name} symbol:`, symbol, "decimals:", decimals);
    console.log(`token${name} balance:`, formatUnits(balance, decimals));
    console.log(`token${name} allowance to pool:`, formatUnits(allowance, decimals));
  }
}
