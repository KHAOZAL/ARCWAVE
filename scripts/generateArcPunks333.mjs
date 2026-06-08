import fs from "fs";
import path from "path";

const SUPPLY = 333;

const outDir = "public/nfts/arcpunks";
const imageDir = path.join(outDir, "images");
const metadataDir = path.join(outDir, "metadata");

fs.rmSync(imageDir, { recursive: true, force: true });
fs.rmSync(metadataDir, { recursive: true, force: true });

fs.mkdirSync(imageDir, { recursive: true });
fs.mkdirSync(metadataDir, { recursive: true });

const collection = {
  name: "ArcPunks Genesis",
  symbol: "ARCPUNK",
  description:
    "ArcPunks Genesis is a limited collection of 333 cyberpunk identities built for ArcWave Labs, designed for community access, NFT vaults, experimental DeFi features and future protocol reputation.",
  image: "/nfts/arcpunks/images/1.svg",
  external_url: "https://arcwave-labs.pages.dev",
  seller_fee_basis_points: 500,
  supply: SUPPLY
};

fs.writeFileSync(
  path.join(outDir, "collection.json"),
  JSON.stringify(collection, null, 2)
);

const backgrounds = [
  ["Arc Blue City", "#040817", "#0b4fa8"],
  ["Magenta District", "#10051d", "#a9136a"],
  ["Deep Cyber Void", "#020511", "#111a46"],
  ["Liquidity Rain", "#031827", "#075a82"],
  ["Neon Grid", "#07031b", "#4d147a"],
  ["Protocol Night", "#06081d", "#33104e"]
];

const skins = [
  ["Human", "#d58b62"],
  ["Light Human", "#f2b38b"],
  ["Dark Human", "#8d523d"],
  ["Cyber Blue", "#87bfff"],
  ["Plasma Violet", "#c456ff"],
  ["Ghost", "#eaf7ff"],
  ["Alien Aqua", "#50ffd2"],
  ["Golden", "#ffca54"]
];

const hair = [
  ["Aqua Mohawk", "#22d3ee"],
  ["Pink Mohawk", "#ff4fd8"],
  ["White Spikes", "#f8fafc"],
  ["Purple Dreads", "#8b5cf6"],
  ["Black Dreads", "#111827"],
  ["Blue Braids", "#38bdf8"],
  ["Cyber Cap", "#0f172a"],
  ["No Hair", "none"]
];

const eyes = [
  ["Blue Core", "#4f8cff"],
  ["Pink Core", "#ff4fd8"],
  ["Aqua Glow", "#25f3ff"],
  ["Laser Red", "#ff3333"],
  ["Void", "#111827"],
  ["Gold", "#ffbd4a"]
];

const clothes = [
  ["Arc Hoodie", "#1d2f78"],
  ["Trader Jacket", "#151f48"],
  ["Cyber Armor", "#263452"],
  ["Lab Coat", "#e8f6ff"],
  ["Samurai Coat", "#25113f"],
  ["Protocol Robe", "#3c145e"],
  ["Street Drip", "#0f172a"]
];

const accessories = [
  ["None", "none"],
  ["Neural Visor", "#4f8cff"],
  ["Pink Visor", "#ff4fd8"],
  ["Gas Mask", "#9ca3af"],
  ["Headphones", "#25f3ff"],
  ["Gold Earring", "#ffbd4a"],
  ["Ledger Necklace", "#25f3ff"],
  ["Wave Halo", "#ffffff"],
  ["Crown", "#ffbd4a"],
  ["Pipe", "#9ca3af"]
];

const badges = [
  ["ARC", "#a855f7"],
  ["DEX", "#4f8cff"],
  ["LP", "#25f3ff"],
  ["PAY", "#ff4fd8"],
  ["NFT", "#ffbd4a"],
  ["DAO", "#8b5cf6"],
  ["ETH", "#9dc6ff"],
  ["SOL", "#14f195"],
  ["BTC", "#ffbd4a"],
  ["zk", "#ff4fd8"]
];

function rarityFor(id) {
  if (id === 1) return "Founder 1/1";
  if (id <= 3) return "Mythic";
  if (id <= 18) return "Legendary";
  if (id <= 68) return "Epic";
  if (id <= 168) return "Rare";
  return "Common";
}

function powerFor(rarity, id) {
  if (rarity === "Founder 1/1") return 111;
  if (rarity === "Mythic") return 100 + (id % 10);
  if (rarity === "Legendary") return 88 + (id % 10);
  if (rarity === "Epic") return 70 + (id % 15);
  if (rarity === "Rare") return 45 + (id % 20);
  return 15 + (id % 30);
}

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

function frameColor(rarity) {
  if (rarity === "Founder 1/1") return "#ffffff";
  if (rarity === "Mythic") return "#ffbd4a";
  if (rarity === "Legendary") return "#ff4fd8";
  if (rarity === "Epic") return "#8b5cf6";
  if (rarity === "Rare") return "#4f8cff";
  return "#1f3b73";
}

function rect(x, y, w, h, fill, opacity = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" opacity="${opacity}"/>`;
}

function svgFor(id) {
  const rarity = rarityFor(id);
  const power = powerFor(rarity, id);

  const bg = pick(backgrounds, id * 3);
  const skin = pick(skins, id * 5);
  const hairTrait = pick(hair, id * 7);
  const eye = pick(eyes, id * 11);
  const cloth = pick(clothes, id * 13);
  const accessory = pick(accessories, id * 17);
  const badge = pick(badges, id * 19);
  const frame = frameColor(rarity);

  const city = Array.from({ length: 26 }).map((_, i) => {
    const x = 40 + i * 38;
    const h = 90 + ((id * 17 + i * 31) % 260);
    const y = 760 - h;
    const color = i % 3 === 0 ? "#172554" : i % 3 === 1 ? "#312e81" : "#581c87";
    return rect(x, y, 26, h, color, 0.52);
  }).join("");

  const stars = Array.from({ length: 36 }).map((_, i) => {
    const x = (id * 47 + i * 71) % 960 + 20;
    const y = (id * 83 + i * 37) % 420 + 30;
    return rect(x, y, 4, 4, "white", 0.25 + ((id + i) % 6) / 10);
  }).join("");

  const hairSvg =
    hairTrait[1] === "none"
      ? ""
      : hairTrait[0] === "Cyber Cap"
      ? `${rect(315, 250, 370, 62, hairTrait[1])}${rect(585, 300, 145, 34, hairTrait[1])}${rect(440, 265, 78, 42, "#25f3ff", 0.9)}`
      : `${rect(310, 250, 70, 120, hairTrait[1])}${rect(380, 220, 70, 150, hairTrait[1])}${rect(450, 205, 70, 165, hairTrait[1])}${rect(520, 220, 70, 150, hairTrait[1])}${rect(590, 250, 70, 120, hairTrait[1])}`;

  const accessorySvg =
    accessory[0] === "None"
      ? ""
      : accessory[0].includes("Visor")
      ? `${rect(340, 420, 320, 52, accessory[1], 0.86)}${rect(365, 435, 270, 14, "#ffffff", 0.34)}`
      : accessory[0] === "Gas Mask"
      ? `${rect(425, 535, 150, 110, accessory[1], 0.76)}${rect(390, 590, 220, 60, "#111827", 0.8)}`
      : accessory[0] === "Headphones"
      ? `${rect(270, 410, 60, 140, accessory[1])}${rect(670, 410, 60, 140, accessory[1])}${rect(320, 325, 360, 34, accessory[1])}`
      : accessory[0] === "Crown"
      ? `${rect(385, 220, 230, 54, accessory[1])}${rect(410, 175, 42, 65, accessory[1])}${rect(485, 155, 42, 85, accessory[1])}${rect(560, 175, 42, 65, accessory[1])}`
      : accessory[0] === "Wave Halo"
      ? `<circle cx="500" cy="240" r="110" fill="none" stroke="${accessory[1]}" stroke-width="16" opacity="0.75"/>`
      : accessory[0] === "Ledger Necklace"
      ? `${rect(460, 700, 80, 48, accessory[1])}${rect(480, 712, 40, 12, "#020617")}`
      : accessory[0] === "Gold Earring"
      ? `${rect(655, 505, 36, 70, accessory[1])}`
      : `${rect(560, 590, 120, 28, accessory[1])}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="1000" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
  <rect width="1000" height="1000" fill="${bg[0]}"/>
  <rect width="1000" height="1000" fill="${bg[1]}"/>
  <circle cx="700" cy="220" r="340" fill="${bg[2]}" opacity="0.35"/>
  <circle cx="310" cy="380" r="260" fill="#0ea5e9" opacity="0.14"/>
  ${city}
  ${stars}

  <rect x="70" y="70" width="860" height="860" rx="0" fill="none" stroke="${frame}" stroke-width="10"/>
  <rect x="85" y="85" width="830" height="830" fill="none" stroke="#0f2b5e" stroke-width="4"/>

  <rect x="250" y="705" width="500" height="190" fill="${cloth[1]}"/>
  <rect x="315" y="650" width="370" height="110" fill="${cloth[1]}" opacity="0.92"/>
  <rect x="250" y="810" width="500" height="85" fill="#020617" opacity="0.35"/>

  <rect x="330" y="310" width="340" height="330" fill="${skin[1]}"/>
  <rect x="355" y="275" width="290" height="80" fill="${skin[1]}"/>
  <rect x="370" y="640" width="260" height="70" fill="${skin[1]}"/>
  <rect x="630" y="350" width="60" height="160" fill="${skin[1]}"/>
  <rect x="310" y="350" width="60" height="160" fill="${skin[1]}"/>

  ${hairSvg}

  <rect x="395" y="425" width="58" height="58" fill="${eye[1]}"/>
  <rect x="547" y="425" width="58" height="58" fill="${eye[1]}"/>
  <rect x="412" y="442" width="18" height="18" fill="#ffffff" opacity="0.85"/>
  <rect x="564" y="442" width="18" height="18" fill="#ffffff" opacity="0.85"/>

  <rect x="480" y="505" width="40" height="64" fill="#0f172a" opacity="0.45"/>
  <rect x="430" y="595" width="140" height="24" fill="#0f172a" opacity="0.55"/>

  ${accessorySvg}

  <rect x="750" y="760" width="120" height="96" fill="#020617" stroke="${badge[1]}" stroke-width="8"/>
  <text x="810" y="820" text-anchor="middle" fill="${badge[1]}" font-size="34" font-family="monospace" font-weight="900">${badge[0]}</text>

  <text x="90" y="880" fill="#ffffff" font-size="42" font-family="monospace" font-weight="900">ArcPunks</text>
  <text x="90" y="925" fill="#9cc7ff" font-size="28" font-family="monospace" font-weight="800">#${String(id).padStart(3, "0")} · ${rarity}</text>
  <text x="910" y="925" text-anchor="end" fill="#ff78e6" font-size="28" font-family="monospace" font-weight="900">PWR ${power}</text>
</svg>`;
}

for (let id = 1; id <= SUPPLY; id++) {
  const rarity = rarityFor(id);
  const power = powerFor(rarity, id);

  const bg = pick(backgrounds, id * 3);
  const skin = pick(skins, id * 5);
  const hairTrait = pick(hair, id * 7);
  const eye = pick(eyes, id * 11);
  const cloth = pick(clothes, id * 13);
  const accessory = pick(accessories, id * 17);
  const badge = pick(badges, id * 19);

  fs.writeFileSync(path.join(imageDir, `${id}.svg`), svgFor(id));

  const metadata = {
    name: `ArcPunks Genesis #${String(id).padStart(3, "0")}`,
    description:
      "A cyberpunk PFP from ArcPunks Genesis, built for ArcWave Labs, NFT vaults, experimental DeFi access and future community utility.",
    image: `/nfts/arcpunks/images/${id}.svg`,
    external_url: "https://arcwave-labs.pages.dev",
    attributes: [
      { trait_type: "Background", value: bg[0] },
      { trait_type: "Skin", value: skin[0] },
      { trait_type: "Hair", value: hairTrait[0] },
      { trait_type: "Eyes", value: eye[0] },
      { trait_type: "Clothes", value: cloth[0] },
      { trait_type: "Accessory", value: accessory[0] },
      { trait_type: "Chain Badge", value: badge[0] },
      { trait_type: "Rarity", value: rarity },
      { trait_type: "Power Level", value: power }
    ]
  };

  fs.writeFileSync(
    path.join(metadataDir, `${id}.json`),
    JSON.stringify(metadata, null, 2)
  );
}

console.log(`Generated ${SUPPLY} ArcPunks Genesis NFTs.`);
console.log(`Images: ${imageDir}`);
console.log(`Metadata: ${metadataDir}`);
