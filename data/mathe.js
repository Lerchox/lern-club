/*
 * Mathe-Modul «Item-Shop»: Proportionalität / Dreisatz («Pro Portion», Grössen und Daten, 5. Klasse).
 * Die Aufgaben werden zufällig erzeugt, nach den Aufgabentypen des Lehrmittels:
 *   A  mehr:     1 Stück kostet p → Preis für grössere Mengen (Tabelle)
 *   B  weniger:  n Stück kosten X → Preis für kleinere Mengen (halbieren bis 1)
 *   C  bundle:   k Stück im Bundle → Preis für mehrere Bundles
 *   D  einzel:   n Stück kosten X → Preis für 1 Stück
 *   E  budget:   1 Stück kostet p → wie viele bekommst du für X?
 *   F  mix:      n Stück kosten X → beliebige Mengen (über den Preis für 1 Stück)
 *   G  zwei:     Mega-Pack mit a Paketen à b Stück → Preis für 1 Stück (zwei Schritte)
 * Alle Ergebnisse sind ganze Zahlen (V-Bucks haben keine Rappen).
 *
 * NEUE ITEMS: einfach in ITEMS ergänzen (id nie ändern). lo/hi = Preisspanne für 1 Stück.
 */
(function () {
  "use strict";
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rnd = (lo, hi, step) => lo + step * Math.floor(Math.random() * (Math.floor((hi - lo) / step) + 1));

  const ITEMS = [
    { id: "kappe", icon: "🧢", lo: 100, hi: 800, de: ["Kappe", "Kappen"], en: ["cap", "caps"], es: ["gorra", "gorras"] },
    { id: "jacke", icon: "🧥", lo: 600, hi: 1500, de: ["Jacke", "Jacken"], en: ["jacket", "jackets"], es: ["chaqueta", "chaquetas"] },
    { id: "shirt", icon: "👕", lo: 200, hi: 800, de: ["T-Shirt", "T-Shirts"], en: ["T-shirt", "T-shirts"], es: ["camiseta", "camisetas"] },
    { id: "sneaker", icon: "👟", lo: 300, hi: 1000, de: ["Sneaker", "Sneakers"], en: ["sneaker", "sneakers"], es: ["zapatilla", "zapatillas"] },
    { id: "rucksack", icon: "🎒", lo: 200, hi: 800, de: ["Rucksack", "Rucksäcke"], en: ["backpack", "backpacks"], es: ["mochila", "mochilas"] },
    { id: "emote", icon: "💃", lo: 100, hi: 500, de: ["Tanz-Emote", "Tanz-Emotes"], en: ["dance emote", "dance emotes"], es: ["baile", "bailes"] },
    { id: "hacke", icon: "⛏️", lo: 500, hi: 1200, de: ["Spitzhacke", "Spitzhacken"], en: ["pickaxe", "pickaxes"], es: ["pico", "picos"] },
    { id: "gleiter", icon: "🪂", lo: 500, hi: 1500, de: ["Gleiter", "Gleiter"], en: ["glider", "gliders"], es: ["planeador", "planeadores"] },
    { id: "spray", icon: "🎨", lo: 50, hi: 300, de: ["Spray", "Sprays"], en: ["spray", "sprays"], es: ["grafiti", "grafitis"] },
    { id: "krone", icon: "👑", lo: 400, hi: 1200, de: ["Krone", "Kronen"], en: ["crown", "crowns"], es: ["corona", "coronas"] },
    { id: "maske", icon: "🎭", lo: 200, hi: 900, de: ["Maske", "Masken"], en: ["mask", "masks"], es: ["máscara", "máscaras"] },
    { id: "helm", icon: "🪖", lo: 300, hi: 1000, de: ["Helm", "Helme"], en: ["helmet", "helmets"], es: ["casco", "cascos"] },
  ];

  // Stückpreis: Rookie in 50er-Schritten, Profi in 5er-Schritten (krumme Zahlen)
  const unitPrice = (it, lv) => (lv === 1 ? rnd(Math.max(50, Math.ceil(it.lo / 50) * 50), it.hi, 50) : rnd(it.lo + 5, it.hi, 5));
  const distinct = (pool, n, not = []) => shuffle(pool.filter((x) => !not.includes(x))).slice(0, n);

  /** Zeile: q = Anzahl, v = V-Bucks, ask = "v" | "q" | null (gegeben) */
  const row = (q, v, ask = null) => ({ q, v, ask });

  const GEN = {
    A(it, lv) {
      const p = unitPrice(it, lv);
      const qs = distinct(lv === 1 ? [2, 3, 4, 5, 10] : [3, 6, 7, 9, 12, 15, 20], 4).sort((a, b) => a - b);
      return { vars: { p }, rows: [row(1, p), ...qs.map((q) => row(q, q * p, "v"))], steps: qs.map((q) => `${q} × ${p} = ${q * p}`) };
    },
    B(it, lv) {
      const p = unitPrice(it, lv), n = pick(lv === 1 ? [4, 8, 10] : [6, 12, 16, 24]);
      const chain = [n];
      while (chain[chain.length - 1] % 2 === 0 && chain[chain.length - 1] > 2) chain.push(chain[chain.length - 1] / 2);
      if (chain[chain.length - 1] !== 1) chain.push(1);
      const qs = chain.slice(1);
      return { vars: { n, X: n * p }, rows: [row(n, n * p), ...qs.map((q) => row(q, q * p, "v"))],
        steps: qs.map((q, i) => { const prev = chain[i], d = prev / q; return `${prev} → ${q}: ${prev * p} : ${d} = ${q * p}`; }) };
    },
    C(it, lv) {
      const k = pick(lv === 1 ? [2, 3, 4, 5] : [3, 4, 6, 8]);
      const B = lv === 1 ? rnd(300, 2000, 100) : rnd(455, 2995, 5);
      const ms = distinct(lv === 1 ? [2, 3, 4, 5] : [3, 5, 7, 9, 10], 3).sort((a, b) => a - b);
      return { vars: { k, X: B }, rows: [row(k, B), ...ms.map((m) => row(m * k, m * B, "v"))],
        steps: ms.map((m) => `${m * k} = ${m} × ${k} → ${m} × ${B} = ${m * B}`) };
    },
    D(it, lv) {
      const p = unitPrice(it, lv), n = pick(lv === 1 ? [2, 3, 4, 5, 10] : [6, 7, 8, 9, 12]);
      return { vars: { n, X: n * p }, rows: [row(n, n * p), row(1, p, "v")], steps: [`${n * p} : ${n} = ${p}`] };
    },
    E(it, lv) {
      const p = unitPrice(it, lv);
      const ms = distinct(lv === 1 ? [2, 3, 4, 5, 6, 10] : [7, 8, 9, 11, 12, 15, 20], 3).sort((a, b) => a - b);
      return { vars: { p }, rows: [row(1, p), ...ms.map((m) => row(m, m * p, "q"))], steps: ms.map((m) => `${m * p} : ${p} = ${m}`) };
    },
    F(it, lv) {
      const p = unitPrice(it, lv), n = pick(lv === 1 ? [2, 4, 5] : [3, 4, 6, 8]);
      const qs = [1, ...distinct(lv === 1 ? [2, 3, 6, 8, 10] : [2, 5, 9, 10, 16, 20], 3, [n, 1]).sort((a, b) => a - b)];
      return { vars: { n, X: n * p }, rows: [row(n, n * p), ...qs.map((q) => row(q, q * p, "v"))],
        steps: [`1: ${n * p} : ${n} = ${p}`, ...qs.slice(1).map((q) => `${q} × ${p} = ${q * p}`)] };
    },
    G(it, lv) {
      const a = pick(lv === 1 ? [2, 3, 4] : [4, 5, 6, 8]), b = pick(lv === 1 ? [3, 4, 5] : [6, 8, 9, 12]);
      const p = lv === 1 ? rnd(10, 100, 10) : rnd(15, 95, 5);
      const N = a * b;
      return { vars: { a, b, X: N * p }, rows: [row(N, N * p, "q"), row(1, p, "v")], steps: [`${a} × ${b} = ${N}`, `${N * p} : ${N} = ${p}`] };
    },
  };

  const ORDER = { 1: ["A", "B", "D", "C", "E", "F"], 2: ["B", "C", "D", "E", "F", "G"] };

  /** Eine Runde: 6 Aufgaben, jede mit einem anderen Item */
  function makeRound(lv) {
    const items = shuffle(ITEMS);
    return ORDER[lv].map((type, i) => Object.assign({ type, item: items[i % items.length] }, GEN[type](items[i % items.length], lv)));
  }

  window.MATHE = { ITEMS, makeRound, TYPES: Object.keys(GEN) };
})();
