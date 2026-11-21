/*
 * Eigene Avatar-Skins (selbst gezeichnet, keine Figuren aus anderen Spielen).
 * Werden mit Stufen freigeschaltet. 1 Stufe = 100 XP (Punkte).
 *
 * Teile: suit (Anzug), accent (Gürtel/Details), tone (Haut), head (Kopfbedeckung),
 *        hc (Farbe der Kopfbedeckung), eyes, extra (Zubehör), ec (Farbe Zubehör)
 */
window.SKINS = [
  { id: "rookie", level: 1, rarity: "common", name: { de: "Rookie", en: "Rookie", es: "Novato" },
    suit: "#3d7bd9", accent: "#1f2d4d", tone: "#f1c27d", head: "cap", hc: "#e74c3c", eyes: "#1b1b3a", extra: "none" },
  { id: "waldlaeufer", level: 1, rarity: "common", name: { de: "Waldläufer", en: "Ranger", es: "Explorador" },
    suit: "#3c8d40", accent: "#6b4f2a", tone: "#c68642", head: "hood", hc: "#2b6a2f", eyes: "#1b1b3a", extra: "backpack", ec: "#8d6e3f" },
  { id: "neonninja", level: 3, rarity: "uncommon", name: { de: "Neon-Ninja", en: "Neon Ninja", es: "Ninja Neón" },
    suit: "#1e1e2e", accent: "#39ff14", tone: "#e0ac69", head: "mask", hc: "#39ff14", eyes: "#ffffff", extra: "scarf", ec: "#39ff14" },
  { id: "kaktuskid", level: 5, rarity: "uncommon", name: { de: "Kaktus-Kid", en: "Cactus Kid", es: "Chamo Cactus" },
    suit: "#2ecc71", accent: "#ff6fb5", tone: "#ffdbac", head: "spikes", hc: "#27ae60", eyes: "#1b1b3a", extra: "flower", ec: "#ff6fb5" },
  { id: "pixelpirat", level: 8, rarity: "rare", name: { de: "Pixel-Pirat", en: "Pixel Pirate", es: "Pirata Píxel" },
    suit: "#7b2cbf", accent: "#f9c74f", tone: "#d4a373", head: "tricorn", hc: "#1b1b3a", eyes: "#1b1b3a", extra: "patch", ec: "#1b1b3a" },
  { id: "arktisagent", level: 11, rarity: "rare", name: { de: "Arktis-Agent", en: "Arctic Agent", es: "Agente Ártico" },
    suit: "#ecf0f1", accent: "#3498db", tone: "#f1c27d", head: "goggles", hc: "#3498db", eyes: "#1b1b3a", extra: "scarf", ec: "#e74c3c" },
  { id: "roboritter", level: 15, rarity: "epic", name: { de: "Robo-Ritter", en: "Robo Knight", es: "Caballero Robot" },
    suit: "#95a5a6", accent: "#e74c3c", tone: "#bdc3c7", head: "helmet", hc: "#7f8c8d", eyes: "#ff3b3b", extra: "antenna", ec: "#e74c3c" },
  { id: "sternenspaeher", level: 20, rarity: "epic", name: { de: "Sternen-Späher", en: "Star Scout", es: "Explorador Estelar" },
    suit: "#5f27cd", accent: "#feca57", tone: "#ffdbac", head: "bubble", hc: "#a29bfe", eyes: "#1b1b3a", extra: "stars", ec: "#feca57" },
  { id: "lavalord", level: 25, rarity: "epic", name: { de: "Lava-Lord", en: "Lava Lord", es: "Señor de la Lava" },
    suit: "#8e1b1b", accent: "#ff9f1a", tone: "#e0ac69", head: "horns", hc: "#ff9f1a", eyes: "#ffd23f", extra: "cape", ec: "#c0392b" },
  { id: "goldphantom", level: 30, rarity: "legendary", name: { de: "Gold-Phantom", en: "Gold Phantom", es: "Fantasma Dorado" },
    suit: "#d4a017", accent: "#1b1b3a", tone: "#2d3436", head: "hood", hc: "#1b1b3a", eyes: "#ffd23f", extra: "cape", ec: "#b8860b" },
  { id: "drachenhueter", level: 40, rarity: "legendary", name: { de: "Drachen-Hüter", en: "Dragon Keeper", es: "Guardián Dragón" },
    suit: "#16a085", accent: "#f1c40f", tone: "#ffdbac", head: "crownhorns", hc: "#f1c40f", eyes: "#1b1b3a", extra: "wings", ec: "#0e6655" },
  { id: "regenbogen", level: 50, rarity: "legendary", name: { de: "Regenbogen-Rakete", en: "Rainbow Rocket", es: "Cohete Arcoíris" },
    suit: "url(#rb)", accent: "#ffffff", tone: "#f1c27d", head: "helmet", hc: "#ffffff", eyes: "#1b1b3a", extra: "jetpack", ec: "#ff6b6b" },
];

window.RARITY_COLORS = {
  common: ["#b2bec3", "#636e72"],
  uncommon: ["#55efc4", "#00a86b"],
  rare: ["#74b9ff", "#0062d6"],
  epic: ["#d6a2ff", "#8e2de2"],
  legendary: ["#ffd26f", "#e67e22"],
};

/** Zeichnet einen Skin als SVG. locked = Silhouette. */
window.avatarSvg = function (skin, opts = {}) {
  const s = skin, uid = "a" + Math.random().toString(36).slice(2, 8);
  const locked = !!opts.locked;
  const F = (c) => (locked ? "#e8e6ff" : c);
  const suit = locked ? "#e8e6ff" : s.suit.replace("#rb", "#" + uid + "rb");
  let back = "", headgear = "", face = "", front = "";

  // Zubehör hinter dem Körper
  if (s.extra === "cape") back += `<path d="M30 58 L22 112 L78 112 L70 58 Z" fill="${F(s.ec)}"/>`;
  if (s.extra === "wings") back += `<path d="M32 62 L4 44 L10 70 L2 82 L30 80 Z" fill="${F(s.ec)}"/><path d="M68 62 L96 44 L90 70 L98 82 L70 80 Z" fill="${F(s.ec)}"/>`;
  if (s.extra === "backpack") back += `<rect x="26" y="60" width="48" height="36" rx="8" fill="${F(s.ec)}"/>`;
  if (s.extra === "jetpack") back += `<rect x="24" y="60" width="14" height="34" rx="6" fill="${F("#dfe6e9")}"/><rect x="62" y="60" width="14" height="34" rx="6" fill="${F("#dfe6e9")}"/>${locked ? "" : `<path d="M26 94 L31 110 L36 94 Z" fill="#ff9f1a"/><path d="M64 94 L69 110 L74 94 Z" fill="#ff9f1a"/>`}`;

  // Kopfbedeckung (über dem Kopf)
  const hc = F(s.hc);
  switch (s.head) {
    case "cap": headgear = `<path d="M30 36 Q50 10 70 36 Z" fill="${hc}"/><rect x="48" y="31" width="30" height="6" rx="3" fill="${hc}"/>`; break;
    case "hood": back += `<path d="M26 44 Q26 12 50 12 Q74 12 74 44 L74 62 L26 62 Z" fill="${hc}"/>`; break;
    case "mask": headgear = `<rect x="29" y="34" width="42" height="9" rx="4" fill="${hc}"/><path d="M70 37 L84 32 L82 42 Z" fill="${hc}"/>`; break;
    case "spikes": headgear = `<path d="M30 32 L34 14 L40 28 L46 10 L52 27 L58 11 L62 28 L68 16 L70 34 Z" fill="${hc}"/>`; break;
    case "tricorn": headgear = `<path d="M22 30 Q50 4 78 30 Q50 22 22 30 Z" fill="${hc}"/><circle cx="50" cy="20" r="3" fill="${F("#f9c74f")}"/>`; break;
    case "goggles": headgear = `<path d="M30 30 Q50 8 70 30 Z" fill="${F("#ffffff")}"/><rect x="31" y="32" width="38" height="10" rx="5" fill="${hc}"/>`; break;
    case "helmet": headgear = `<path d="M28 42 Q28 14 50 14 Q72 14 72 42 Z" fill="${hc}"/><rect x="34" y="32" width="32" height="10" rx="4" fill="${F(s.eyes)}"/>`; break;
    case "bubble": front += `<circle cx="50" cy="38" r="25" fill="${locked ? "#e8e6ff" : "rgba(162,155,254,0.35)"}" stroke="${hc}" stroke-width="3"/>`; break;
    case "horns": headgear = `<path d="M33 26 Q24 12 30 4 Q34 16 40 22 Z" fill="${hc}"/><path d="M67 26 Q76 12 70 4 Q66 16 60 22 Z" fill="${hc}"/>`; break;
    case "crownhorns": headgear = `<path d="M33 26 Q24 12 30 4 Q34 16 40 22 Z" fill="${F(s.ec)}"/><path d="M67 26 Q76 12 70 4 Q66 16 60 22 Z" fill="${F(s.ec)}"/><path d="M38 22 L42 12 L46 20 L50 9 L54 20 L58 12 L62 22 Z" fill="${hc}"/>`; break;
  }

  // Gesicht
  if (!locked && !["helmet", "goggles"].includes(s.head)) {
    face = `<ellipse cx="43" cy="39" rx="3" ry="${s.head === "mask" ? 2 : 3.5}" fill="${s.eyes}"/><ellipse cx="57" cy="39" rx="3" ry="${s.head === "mask" ? 2 : 3.5}" fill="${s.eyes}"/>`;
    if (s.head !== "mask") face += `<path d="M44 48 Q50 53 56 48" stroke="#1b1b3a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  }
  if (!locked && s.extra === "patch") face += `<rect x="52" y="34" width="10" height="9" rx="3" fill="#1b1b3a"/><line x1="40" y1="31" x2="66" y2="36" stroke="#1b1b3a" stroke-width="1.5"/>`;

  // Zubehör vorne
  if (s.extra === "scarf") front += `<rect x="34" y="56" width="32" height="8" rx="4" fill="${F(s.ec)}"/><rect x="58" y="60" width="8" height="16" rx="3" fill="${F(s.ec)}"/>`;
  if (s.extra === "flower") front += `<circle cx="64" cy="20" r="5" fill="${F(s.ec)}"/><circle cx="64" cy="20" r="2" fill="${F("#fff")}"/>`;
  if (s.extra === "antenna") front += `<line x1="50" y1="14" x2="50" y2="3" stroke="${F("#7f8c8d")}" stroke-width="2"/><circle cx="50" cy="3" r="3" fill="${F(s.ec)}"/>`;
  if (s.extra === "stars" && !locked) front += `<path d="M42 78 l2 4 4 1 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -1 Z" fill="${s.ec}"/><path d="M58 88 l1.5 3 3 .5 -2 2 .5 3 -3 -1.5 -3 1.5 .5 -3 -2 -2 3 -.5 Z" fill="${s.ec}"/>`;

  return `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" class="avatar${locked ? " locked" : ""}" role="img" aria-label="${(s.name && (s.name.de || "")) || ""}">
    <defs><linearGradient id="${uid}rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset=".35" stop-color="#feca57"/><stop offset=".65" stop-color="#48dbfb"/><stop offset="1" stop-color="#a55eea"/></linearGradient></defs>
    ${back}
    <rect x="36" y="96" width="11" height="20" rx="4" fill="${F("#2d3436")}"/><rect x="53" y="96" width="11" height="20" rx="4" fill="${F("#2d3436")}"/>
    <rect x="18" y="62" width="12" height="30" rx="6" fill="${suit}"/><rect x="70" y="62" width="12" height="30" rx="6" fill="${suit}"/>
    <rect x="28" y="56" width="44" height="44" rx="12" fill="${suit}"/>
    <rect x="28" y="82" width="44" height="7" fill="${F(s.accent)}"/>
    <circle cx="50" cy="38" r="20" fill="${F(s.tone)}"/>
    ${headgear}${face}${front}
  </svg>`;
};
