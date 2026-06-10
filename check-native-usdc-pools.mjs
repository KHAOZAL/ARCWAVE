import { createPublicClient, http } from "viem";

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

const FACTORY = "0xEd62670DB50E6e1C312F086B3230168D7E1521AA";
const USDC = "0x3600000000000000000000000000000000000000";

const TOKENS = [
  ["tARC", "0x605cF46994C1fc75c04D2386d88E2529DC1C3C77"],
  ["tUSDT", "0x211aabF85b0162b07DdCB88AE076E8485d1fe5Cc"],
  ["tDAI", "0x1f74243d2b360a848BC1833dEF27d2bBA7fC19A5"],
  ["tUSDe", "0xCD7eC626C79573a5aC5CD79b45b9274fB896E128"],
  ["tPYUSD", "0x1Ee284FA2252f1521d31AC6FAC912EcaCC52e72D"],
];

const FACTORY_ABI = [
  {
    type: "function",
    name: "getPool",
    stateMutability: "view",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
    ],
    outputs: [{ name: "", type: "address" }],
  },
];

console.log("Factory:", FACTORY);
console.log("Native USDC:", USDC);
console.log("");

for (const [symbol, token] of TOKENS) {
  const pool = await client.readContract({
    address: FACTORY,
    abi: FACTORY_ABI,
    functionName: "getPool",
    args: [USDC, token],
  });

  console.log(`USDC / ${symbol}: ${pool}`);
}
