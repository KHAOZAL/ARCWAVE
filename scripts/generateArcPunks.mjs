import fs from "fs";
import path from "path";

const SUPPLY = 1111;

const outDir = "public/nfts/arcpunks";
const imageDir = path.join(outDir, "images");
const metadataDir = path.join(outDir, "metadata");

fs.mkdirSync(imageDir, { recursive: true });
fs.mkdirSync(metadataDir, { recursive: true });

const collection = {
  name: "ArcPunks Genesis",
  symbol: "ARCPUNK",
  description:
    "ArcPunks Genesis is a limited collection of 1,111 cyberpunk identities built for ArcWave Labs, focused on access, reputation, experimental DeFi, NFT vaults and future protocol features.",
  image: "/nfts/arcpunks/images/1.svg",
  external_url: "https://arcwave-labs.pages.dev",
  seller_fee_basis_points: 500,
};

fs.writeFileSync(
  path.join(outDir, "collection.json"),
  JSON.stringify(collection, null, 2)
);

const backgrounds = [
  ["Arc Blue", "#030819", "#0b3f91"],
  ["Magenta Void", "#12051f", "#9d145f"],
  ["Deep Space", "#020511", "#111b46"],
  ["Liquidity Storm", "#031827", "#075a82"],
  ["Neon Grid", "#08031c", "#4a1477"],
  ["Solar Breach", "#16090d", "#a74722"],
];

const skins = [
  ["Human", "#f0b38c"],
  ["Cyber", "#9dc6ff"],
  ["Plasma", "#c756ff"],
  ["Ghost", "#e8f6ff"],
  ["Alien", "#55ffc8"],
  ["Golden", "#ffca54"],
];

const eyes = [
  ["Blue Core", "#4f8cff"],
  ["Pink Core", "#ff4fd8"],
  ["Laser", "#ff3333"],
  ["Void", "#111827"],
  ["Aqua", "#25f3ff"],
  ["Gold", "#ffbd4a"],
];

const hair = [
  ["None", "none"],
  ["Cyber Mohawk", "#ff4fd8"],
  ["Arc Flames", "#4f8cff"],
  ["White Spikes", "#ffffff"],
  ["Neon Dreads", "#25f3ff"],
  ["Gold Crown Hair", "#ffbd4a"],
];

const clothes = [
  ["Trader Jacket", "#15224d"],
  ["Lab Coat", "#e8f6ff"],
  ["Samurai Coat", "#25113f"],
  ["Arc Hoodie", "#1d2f78"],
  ["Armor", "#263452"],
  ["Protocol Robe", "#3c145e"],
];

const accessories = [
  ["None", "none"],
  ["Neural Visor", "#4f8cff"],
  ["Gas Mask", "#9ca3af"],
  ["Ledger Necklace", "#25f3ff"],
  ["Crown", "#ffbd4a"],
  ["Headphones", "#ff4fd8"],
  ["Wave Halo", "#ffffff"],
];

const auras = [
  ["None", "none"],
  ["Blue Wave", "#4f8cff"],
  ["Pink Wave", "#ff4fd8"],
  ["Aqua Wave", "#25f3ff"],
  ["Gold Flame", "#ffbd4a"],
  ["Mythic Arc", "#ffffff"],
];

const badges = [
  ["Arc", "#4f8cff"],
  ["ETH", "#9dc6ff"],
  ["SOL", "#8b5cf6"],
  ["BTC", "#ffbd4a"],
  ["SUI", "#25f3ff"],
  ["zk", "#ff4fd8"],
];

function rarityFor(id) {
  if (id === 1) return "Founder 1/1";
  if (id <= 11) return "Mythic";
  if (id <= 61) return "Legendary";
  if (id <= 211) return "Epic";
  if (id <= 511) return "Rare";
  return "Common";
}

function powerFor(rarity, id) {
  if (rarity === "Founder 1/1") return 111;
  if (rarity === "Mythic") return 100 + (id % 11);
  if (rarity === "Legendary") return 88 + (id % 10);
  if (rarity === "Epic") return 70 + (id % 15);
  if (rarity === "Rare") return 45 + (id % 20);
  return 15 + (id % 30);
}

function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

function rarityFrame(rarity) {
  if (rarity === "Founder 1/1") return "#ffffff";
  if (rarity === "Mythic") return "#ffbd4a";
  if (rarity === "Legendary") return "#ff4fd8";
  if (rarity === "Epic") return "#8b5cf6";
  if (rarity === "Rare") return "#4f8cff";
  return "#1f3b73";
}

function svgFor(id) {
  const rarity = rarityFor(id);
  const power = powerFor(rarity, id);

  const bg = pick(backgrounds, id * 3);
  const skin = pick(skins, id * 5);
  const eye = pick(eyes, id * 7);
  const hairTrait = pick(hair, id * 11);
  const cloth = pick(clothes, id * 13);
  const accessory = pick(accessories, id * 17);
  const aura = pick(auras, id * 19);
  const badge = pick(badges, id * 23);
  const frame = rarityFrame(rarity);

  const starCount =
    rarity === "Founder 1/1" ? 70 :
    rarity === "Mythic" ? 52 :
    rarity === "Legendary" ? 42 :
    rarity === "Epic" ? 32 :
    rarity === "Rare" ? 22 : 14;

  const stars = Array.from({ length: starCount })
    .map((_, i) => {
      const x = (id * 47 + i * 71) % 1000;
      const y = (id * 83 + i * 37) % 1000;
      const r = 1 + ((id + i) % 3);
      const op = 0.25 + (((id + i) % 6) / 10);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${op}" />`;
    })
    .join("");

  const hairSvg =
    hairTrait[1] === "none"
      ? ""
      : `<path d="M345 315 C395 225, 555 220, 630 315 C560 280, 430 280, 345 315 Z" fill="${hairTrait[1]}" opacity="0.95" filter="url(#glow)" />`;

  const accessorySvg =
    accessory[0] === "None"
      ? ""
      : accessory[0] === "Neural Visor"
      ? `<rect x="355" y="415" width="290" height="54" rx="18" fill="${accessory[1]}" opacity="0.72" filter="url(#glow)" />`
      : accessory[0] === "Gas Mask"
      ? `<path d="M425 520 H575 L620 650 H380 Z" fill="${accessory[1]}" opacity="0.72" />`
      : accessory[0] === "Ledger Necklace"
      ? `<rect x="465" y="660" width="70" height="38" rx="8" fill="${accessory[1]}" opacity="0.9" />`
      : accessory[0] === "Crown"
      ? `<path d="M375 280 L425 215 L500 280 L575 215 L625 280 L610 325 H390 Z" fill="${accessory[1]}" opacity="0.94" filter="url(#glow)" />`
      : accessory[0] === "Headphones"
      ? `<path d="M315 440 C320 300, 680 300, 685 440" stroke="${accessory[1]}" stroke-width="28" fill="none" filter="url(#glow)" />
         <rect x="280" y="420" width="65" height="120" rx="22" fill="${accessory[1]}" />
         <rect x="655" y="420" width="65" height="120" rx="22" fill="${accessory[1]}" />`
      : `<circle cx="500" cy="255" r="105" fill="none" stroke="${accessory[1]}" stroke-width="14" opacity="0.85" filter="url(#glow)" />`;

  const auraSvg =
    aura[1] === "none"
      ? ""
      : `<ellipse cx="500" cy="505" rx="300" ry="360" fill="none" stroke="${aura[1]}" stroke-width="18" opacity="0.33" filter="url(#glow)" />`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="1000" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="${bg[2]}"/>
      <stop offset="100%" stop-color="${bg[1]}"/>
    </radialGradient>

    <linearGradient id="cloth" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${cloth[1]}"/>
      <stop offset="100%" stop-color="#050817"/>
    </linearGradient>

    <linearGradient id="faceShade" x1="20%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="${skin[1]}"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>

    <filter id="glow">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1000" height="1000" fill="url(#bg)"/>
  ${stars}

  <circle cx="500" cy="500" r="390" fill="${aura[1] === "none" ? "#4f8cff" : aura[1]}" opacity="0.10" filter="url(#glow)" />
  ${auraSvg}

  <path d="M250 865 C280 690, 370 610, 500 610 C630 610, 720 690, 750 865 Z" fill="url(#cloth)" stroke="#293b72" stroke-width="5"/>
  <path d="M360 630 C385 700, 615 700, 640 630 L690 865 H310 Z" fill="${cloth[1]}" opacity="0.38"/>

  <path d="M340 370 C345 275, 420 250, 500 250 C580 250, 655 275, 660 370 L650 535 C643 630, 585 680, 500 680 C415 680, 357 630, 350 535 Z"
    fill="url(#faceShade)" stroke="#1f2f5e" stroke-width="6"/>

  ${hairSvg}

  <circle cx="430" cy="445" r="38" fill="${eye[1]}" filter="url(#glow)"/>
  <circle cx="570" cy="445" r="38" fill="${eye[1]}" filter="url(#glow)"/>
  <circle cx="430" cy="445" r="13" fill="white" opacity="0.72"/>
  <circle cx="570" cy="445" r="13" fill="white" opacity="0.72"/>

  <path d="M470 510 L500 550 L530 510" fill="none" stroke="#0f172a" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
  <path d="M430 595 C470 625, 530 625, 570 595" fill="none" stroke="#0f172a" stroke-width="16" stroke-linecap="round" opacity="0.55"/>

  ${accessorySvg}

  <circle cx="790" cy="790" r="72" fill="#071227" stroke="${badge[1]}" stroke-width="8" filter="url(#glow)"/>
  <text x="790" y="802" text-anchor="middle" fill="${badge[1]}" font-size="34" font-family="Inter, Arial" font-weight="950">${badge[0]}</text>

  <rect x="34" y="34" width="932" height="932" rx="48" fill="none" stroke="${frame}" stroke-width="10" opacity="0.92"/>

  <text x="64" y="875" fill="white" font-size="44" font-family="Inter, Arial" font-weight="950">ArcPunks Genesis</text>
  <text x="64" y="925" fill="#9cc7ff" font-size="30" font-family="Inter, Arial" font-weight="850">#${String(id).padStart(4, "0")} · ${rarity}</text>
  <text x="936" y="925" text-anchor="end" fill="#ff78e6" font-size="27" font-family="Inter, Arial" font-weight="950">PWR ${power}</text>
</svg>`;
}

for (let id = 1; id <= SUPPLY; id++) {
  const rarity = rarityFor(id);
  const power = powerFor(rarity, id);

  const bg = pick(backgrounds, id * 3);
  const skin = pick(skins, id * 5);
  const eye = pick(eyes, id * 7);
  const hairTrait = pick(hair, id * 11);
  const cloth = pick(clothes, id * 13);
  const accessory = pick(accessories, id * 17);
  const aura = pick(auras, id * 19);
  const badge = pick(badges, id * 23);

  fs.writeFileSync(path.join(imageDir, `${id}.svg`), svgFor(id));

  const metadata = {
    name: `ArcPunks Genesis #${String(id).padStart(4, "0")}`,
    description:
      "A cyberpunk identity from ArcPunks Genesis, built for ArcWave Labs, NFT vaults, experimental DeFi access and future protocol features.",
    image: `/nfts/arcpunks/images/${id}.svg`,
    external_url: "https://arcwave-labs.pages.dev",
    attributes: [
      { trait_type: "Background", value: bg[0] },
      { trait_type: "Skin", value: skin[0] },
      { trait_type: "Eyes", value: eye[0] },
      { trait_type: "Hair", value: hairTrait[0] },
      { trait_type: "Clothes", value: cloth[0] },
      { trait_type: "Accessory", value: accessory[0] },
      { trait_type: "Aura", value: aura[0] },
      { trait_type: "Chain Badge", value: badge[0] },
      { trait_type: "Rarity", value: rarity },
      { trait_type: "Power Level", value: power },
    ],
  };

  fs.writeFileSync(
    path.join(metadataDir, `${id}.json`),
    JSON.stringify(metadata, null, 2)
  );
}

console.log(`Generated ${SUPPLY} ArcPunks Genesis NFTs.`);
console.log(`Images: ${imageDir}`);
console.log(`Metadata: ${metadataDir}`);
