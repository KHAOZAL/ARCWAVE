import fs from "fs";
import path from "path";

const outDir = "public/nfts/arcwave-genesis";
const imageDir = path.join(outDir, "images");
const metadataDir = path.join(outDir, "metadata");

fs.mkdirSync(imageDir, { recursive: true });
fs.mkdirSync(metadataDir, { recursive: true });

const collection = {
  name: "ArcWave Genesis Vaults",
  symbol: "AWGV",
  description:
    "A 100-piece experimental NFT collection created for ArcWave DEX, NFT vaults, liquidity experiments and future community utility.",
  image: "/nfts/arcwave-genesis/images/1.svg",
  external_url: "https://arcwave-labs.pages.dev",
};

fs.writeFileSync(
  path.join(outDir, "collection.json"),
  JSON.stringify(collection, null, 2)
);

const backgrounds = [
  ["Deep Space", "#030617", "#061943"],
  ["Nebula Pink", "#13051f", "#9d145f"],
  ["Ocean Core", "#031224", "#064f7a"],
  ["Purple Void", "#09031c", "#42136b"],
  ["Blue Singularity", "#020b1d", "#123f9e"],
];

const cores = [
  ["Plasma Core", "#ff4fd8"],
  ["Arc Core", "#4f8cff"],
  ["Aqua Core", "#25f3ff"],
  ["Solar Core", "#ffae42"],
  ["Ghost Core", "#ffffff"],
];

const waves = [
  ["Soft Wave", 0.35],
  ["Bright Wave", 0.55],
  ["Heavy Wave", 0.75],
  ["Quantum Wave", 0.9],
];

const frames = [
  ["None", "transparent"],
  ["Blue Frame", "#438bff"],
  ["Pink Frame", "#ff4fd8"],
  ["Gold Frame", "#ffbd4a"],
  ["Mythic Frame", "#ffffff"],
];

function rarityFor(id) {
  if (id === 1) return "Mythic";
  if (id <= 5) return "Legendary";
  if (id <= 18) return "Epic";
  if (id <= 45) return "Rare";
  return "Common";
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function svgFor(id) {
  const bg = pick(backgrounds, id * 3);
  const core = pick(cores, id * 5);
  const wave = pick(waves, id * 7);
  const frame = pick(frames, id * 11);
  const rarity = rarityFor(id);

  const power =
    rarity === "Mythic"
      ? 100
      : rarity === "Legendary"
      ? 88 + (id % 10)
      : rarity === "Epic"
      ? 72 + (id % 12)
      : rarity === "Rare"
      ? 50 + (id % 18)
      : 20 + (id % 30);

  const starCount =
    rarity === "Mythic" ? 42 : rarity === "Legendary" ? 32 : rarity === "Epic" ? 24 : 16;

  const stars = Array.from({ length: starCount })
    .map((_, i) => {
      const x = (id * 47 + i * 71) % 1000;
      const y = (id * 83 + i * 37) % 1000;
      const r = 1 + ((id + i) % 3);
      const op = 0.25 + (((id + i) % 6) / 10);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${op}" />`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="1000" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="${bg[2]}"/>
      <stop offset="100%" stop-color="${bg[1]}"/>
    </radialGradient>

    <radialGradient id="core" cx="45%" cy="35%" r="55%">
      <stop offset="0%" stop-color="white"/>
      <stop offset="22%" stop-color="${core[1]}"/>
      <stop offset="68%" stop-color="#4f8cff"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>

    <linearGradient id="wave" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff4fd8"/>
      <stop offset="50%" stop-color="#8d5cff"/>
      <stop offset="100%" stop-color="#25d8ff"/>
    </linearGradient>

    <filter id="glow">
      <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1000" height="1000" fill="url(#bg)"/>
  ${stars}

  <circle cx="500" cy="500" r="310" fill="url(#core)" opacity="0.42" filter="url(#glow)"/>

  <path
    d="M170 580 C300 360, 450 310, 610 410 C760 505, 755 670, 610 735 C455 805, 255 760, 170 580 Z"
    fill="url(#wave)"
    opacity="${wave[1]}"
    filter="url(#glow)"
  />

  <ellipse cx="500" cy="500" rx="130" ry="210" fill="url(#wave)" opacity="0.75" transform="rotate(-18 500 500)" filter="url(#glow)"/>
  <circle cx="500" cy="500" r="56" fill="#25d8ff" opacity="0.85"/>
  <circle cx="500" cy="500" r="18" fill="#ff4fd8"/>
  <circle cx="465" cy="330" r="38" fill="white" opacity="0.78"/>

  <path d="M260 230 L295 300 L365 335 L295 370 L260 440 L225 370 L155 335 L225 300 Z"
    fill="white" opacity="0.55" filter="url(#glow)"/>

  <rect x="34" y="34" width="932" height="932" rx="48" fill="none" stroke="${frame[1]}" stroke-width="${frame[0] === "None" ? 0 : 8}" opacity="0.95"/>

  <text x="64" y="875" fill="white" font-size="42" font-family="Inter, Arial" font-weight="900">ArcWave Genesis</text>
  <text x="64" y="925" fill="#9cc7ff" font-size="30" font-family="Inter, Arial" font-weight="800">#${String(id).padStart(3, "0")} · ${rarity}</text>

  <text x="936" y="925" text-anchor="end" fill="#ff78e6" font-size="26" font-family="Inter, Arial" font-weight="900">PWR ${power}</text>
</svg>`;
}

for (let id = 1; id <= 100; id++) {
  const bg = pick(backgrounds, id * 3);
  const core = pick(cores, id * 5);
  const wave = pick(waves, id * 7);
  const frame = pick(frames, id * 11);
  const rarity = rarityFor(id);

  const power =
    rarity === "Mythic"
      ? 100
      : rarity === "Legendary"
      ? 88 + (id % 10)
      : rarity === "Epic"
      ? 72 + (id % 12)
      : rarity === "Rare"
      ? 50 + (id % 18)
      : 20 + (id % 30);

  const imageFile = `${id}.svg`;

  fs.writeFileSync(path.join(imageDir, imageFile), svgFor(id));

  const metadata = {
    name: `ArcWave Genesis #${String(id).padStart(3, "0")}`,
    description:
      "A generative ArcWave NFT designed for DEX experiments, NFT vaults, fractional liquidity and future community utility.",
    image: `/nfts/arcwave-genesis/images/${imageFile}`,
    external_url: "https://arcwave-labs.pages.dev",
    attributes: [
      { trait_type: "Background", value: bg[0] },
      { trait_type: "Core", value: core[0] },
      { trait_type: "Wave", value: wave[0] },
      { trait_type: "Frame", value: frame[0] },
      { trait_type: "Rarity", value: rarity },
      { trait_type: "Power Level", value: power },
    ],
  };

  fs.writeFileSync(
    path.join(metadataDir, `${id}.json`),
    JSON.stringify(metadata, null, 2)
  );
}

console.log("Generated 100 ArcWave Genesis NFTs.");
console.log(`Images: ${imageDir}`);
console.log(`Metadata: ${metadataDir}`);
