/*
 * Mathe-Probetest «Proportionalität» im Stil der Schulprüfung (5. Klasse, Grössen und Daten).
 * Jeder Test wird neu erzeugt. Schwerpunkt: Sprünge, die KEIN einfaches Vielfaches sind
 * (3 → 2, 8 → 12, 4 → 6, 4 → 10): über 1 Stück oder über einen gemeinsamen Teiler rechnen.
 *
 * Aufbau eines Tests: { tasks: [ { n, pts, level, title, blocks, steps } ], fields: { id: {...} } }
 *   blocks: table | lines | strahl | offers | text   (Zellen: Text oder { f: "Feld-id" })
 *   Feld:   { ans, show, skill, kind?: "num" | "op" | "choice", options? }
 * Fertigkeiten (skill) für die Auswertung:
 *   mal (einfaches Vielfaches) · teiler (krummer Sprung) · einheit (über 1 Stück) · teilen (Preis pro Stück)
 *   pack (Packungen) · luecke (Tabelle mit Lücken) · vergleich (Preis pro kg) · rueckwaerts (Menge gesucht)
 *   strahl (doppelter Zahlenstrahl) · umgekehrt (umgekehrt proportional) · pfeil (Rechenschritte)
 */
(function () {
  "use strict";
  const R = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pickN = (a, n) => shuffle(a).slice(0, n);
  const r2 = (x) => Math.round(x * 100) / 100;
  const fr = (x) => r2(x).toFixed(2) + " Fr.";
  const nm = (x) => String(r2(x));
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);

  /** Rechenweg von a nach b, mit Werten: über einen gemeinsamen Teiler oder über 1 */
  function way(a, va, b, fmt) {
    if (b % a === 0) return `${a} → ${b}: ${fmt(va)} · ${b / a} = ${fmt(va * b / a)}`;
    if (a % b === 0) return `${a} → ${b}: ${fmt(va)} : ${a / b} = ${fmt(va * b / a)}`;
    const g = gcd(a, b), vg = va * g / a;
    return `${a} → ${g}: ${fmt(va)} : ${a / g} = ${fmt(vg)} · dann ${g} → ${b}: ${fmt(vg)} · ${b / g} = ${fmt(vg * b / g)}`;
  }

  function make() {
    const fields = {};
    let fid = 0;
    const F = (ans, skill, extra = {}) => { const id = "f" + ++fid; fields[id] = Object.assign({ ans, skill, kind: "num", show: typeof ans === "number" ? nm(ans) : ans }, extra); return { f: id }; };
    const tasks = [];

    // ---- 1. Rechenschritte (Pfeile) ----
    {
      const seq = R([[1, 3, 12, 4, 20], [1, 4, 12, 6, 18], [1, 2, 10, 5, 15], [1, 3, 18, 6, 24], [1, 5, 20, 4, 12]]);
      const u = R([12, 15, 18, 24, 36, 39, 45]);
      const steps = [];
      const rows = seq.map((q, i) => {
        if (!i) return [String(q), fr(q * u), ""];
        const a = seq[i - 1], op = q > a ? "*" + q / a : "/" + a / q, show = q > a ? "· " + q / a : ": " + a / q;
        steps.push(`${a} → ${q}: ${show}`);
        return [String(q), fr(q * u), F(op, "pfeil", { kind: "op", show })];
      });
      tasks.push({ n: 1, pts: 2, level: "G", title: "Schreibe die Rechenschritte auf: Mit welcher Zahl rechnest du von einer Zeile zur nächsten? Schreibe zum Beispiel «x 3» (mal 3) oder «: 2» (geteilt durch 2).",
        blocks: [{ kind: "table", head: ["Anzahl", "Preis", "Rechenschritt"], rows }],
        steps: steps.concat(["Links und rechts rechnest du immer genau gleich."]) });
    }

    // ---- 2. Werte im Satz ergänzen ----
    {
      const T = [
        { s: (a, va, b) => [`Wenn es in ${a} Schachteln ${va} Stifte hat, dann hat es in ${b} Schachteln`, "Stifte."], per: [6, 8, 9, 12], u: "Stifte" },
        { s: (a, va, b) => [`Wenn ${a} Hunde ${va} g Fleisch fressen, dann fressen ${b} Hunde`, "g Fleisch."], per: [110, 120, 150, 250], u: "g" },
        { s: (a, va, b) => [`Wenn es in ${a} Säcken ${va} Würfel hat, dann hat es in ${b} Säcken`, "Würfel."], per: [5, 6, 8, 15], u: "Würfel" },
        { s: (a, va, b) => [`Wenn ${a} Kinotickets ${va} Fr. kosten, dann kosten ${b} Kinotickets`, "Fr."], per: [12, 14, 15, 18], u: "Fr." },
        { s: (a, va, b) => [`Wenn ${a} Rollen ${va} m Schnur haben, dann haben ${b} Rollen`, "m Schnur."], per: [25, 30, 40, 74], u: "m" },
        { s: (a, va, b) => [`Wenn ${a} Kinder zusammen ${va} Kekse bekommen, dann bekommen ${b} Kinder`, "Kekse."], per: [4, 6, 7], u: "Kekse" },
        { rev: true, s: (a, va, vb) => [`Wenn sie in ${a} min ${va} m schwimmt, dann braucht sie für ${vb} m genau`, "min."], per: [20, 25, 40], u: "m" },
        { rev: true, s: (a, va, vb) => [`Wenn man in ${a} Stunden ${va} km wandert, dann wandert man ${vb} km in`, "Stunden."], per: [3, 4, 5], u: "km" },
      ];
      const hard = shuffle([[3, 2], [2, 3], [4, 6], [6, 4], [6, 9], [9, 6], [8, 12], [12, 8], [4, 10], [10, 4], [6, 10], [10, 6], [3, 5], [5, 3], [4, 3], [8, 6], [6, 8]]);
      const pairs = hard.slice(0, 5).concat([R([[2, 4], [3, 6], [4, 2]])]);
      const items = [], steps = [];
      pickN(T, 6).forEach((tp, i) => {
        const [a, b] = pairs[i], p = R(tp.per), va = a * p, vb = b * p;
        if (tp.rev) {
          const [l, r] = tp.s(a, va, vb);
          items.push([l, F(b, b % a && a % b ? "teiler" : "mal"), r]);
          steps.push(`${va} ${tp.u} in ${a} → in 1: ${va} : ${a} = ${p} ${tp.u} → ${vb} : ${p} = ${b}`);
        } else {
          const [l, r] = tp.s(a, va, b);
          items.push([l, F(vb, b % a && a % b ? "teiler" : "mal"), r]);
          steps.push(way(a, va, b, (x) => nm(x)) + " " + tp.u);
        }
      });
      tasks.push({ n: 2, pts: 4, level: "G", title: "Ergänze die Werte im Satz.", blocks: [{ kind: "lines", items: shuffle(items) }],
        steps: steps.concat(["Tipp bei krummen Sprüngen wie 3 → 2: zuerst auf 1 (oder einen gemeinsamen Teiler) zurückrechnen, dann wieder hinauf."]) });
    }

    // ---- 3. Packungen ----
    {
      const A = R([{ what: "Wasserflaschen", k: 6, p: R([1.8, 2.4, 3.6, 1.5]) }, { what: "Joghurts", k: 4, p: R([2.6, 3.2, 2.2]) }]);
      const B = R([{ what: "Peperoni", k: 3, p: R([1.65, 1.95, 2.1, 1.45]) }, { what: "Tennisbälle", k: 3, p: R([4.5, 5.85, 6.3]) }]);
      const blocks = [], steps = [];
      [A, B].forEach((X, i) => {
        const ms = pickN(i ? [5, 7, 9, 10, 11] : [2, 3, 5, 6, 7], 3).sort((a, b) => a - b);
        blocks.push({ kind: "text", text: `${i ? "b" : "a"}) ${X.what} werden in ${X.k}er-Packungen verkauft. Eine Packung kostet ${fr(X.p)} Wie viel kosten ${ms.map((m) => m * X.k).join(", ")} ${X.what}?` });
        blocks.push({ kind: "table", head: [`Anzahl ${X.what}`, "Preis"], rows: ms.map((m) => [String(m * X.k), F(r2(m * X.p), "pack", { show: fr(m * X.p) })]) });
        ms.forEach((m) => steps.push(`${m * X.k} ${X.what} = ${m * X.k} : ${X.k} = ${m} Packungen → ${m} · ${fr(X.p)} = ${fr(m * X.p)}`));
      });
      tasks.push({ n: 3, pts: 4, level: "G", title: "Berechne den Preis für die verschiedenen Mengen.", blocks, steps });
    }

    // ---- 4. Preis pro Stück ----
    {
      const P = [
        { t: (n, x) => `${n} Eier kosten ${fr(x)} Berechne den Preis pro Ei.`, n: R([6, 10, 12]), u: R([0.35, 0.45, 0.55, 0.65, 0.7, 0.85]) },
        { t: (n, x) => `${n} Schafe kosten ${x.toLocaleString("de-CH")} Fr. Berechne den Preis pro Schaf.`, n: R([5, 6, 8]), u: R([150, 175, 225, 240, 315]) },
        { t: (n, x) => `${n} kg Mehl kosten ${fr(x)} Berechne den Preis pro kg.`, n: R([4, 5, 12]), u: R([1.6, 1.85, 2.2, 2.45]) },
      ];
      const items = [], steps = [];
      P.forEach((p, i) => {
        const tot = r2(p.n * p.u);
        items.push([`${"abc"[i]}) ${p.t(p.n, tot)}`, F(p.u, "teilen", { show: fr(p.u) }), "Fr."]);
        steps.push(`${"abc"[i]}) ${fr(tot)} : ${p.n} = ${fr(p.u)} (Kontrolle: ${p.n} · ${fr(p.u)} = ${fr(tot)})`);
      });
      tasks.push({ n: 4, pts: 3, level: "G", title: "Berechne den Preis für 1 Stück.", blocks: [{ kind: "lines", items }],
        steps: steps.concat(["Tipp: Rechne in Rappen. 4.20 Fr. = 420 Rp., 420 : 6 = 70 Rp. = 0.70 Fr."]) });
    }

    // ---- 5. Tabellen mit Lücken ----
    {
      const u = R([1.3, 1.45, 2.15, 0.85, 1.75]);
      const qa = pickN([3, 4, 6, 7, 9, 10, 11], 4).sort((a, b) => a - b);
      const L = R([74, 65, 48, 36, 85]);
      const qb = pickN([5, 7, 8, 9, 11, 12], 3).sort((a, b) => a - b);
      const v = R([2.5, 3.5, 4.5, 4]), H = R([8, 12, 15]);
      const steps = [];
      qa.forEach((q) => steps.push(`${q} Packungen: ${q} · ${fr(u)} = ${fr(q * u)}`));
      steps.push("Achtung: Nicht einfach von Zeile zu Zeile gleich viel dazuzählen, die Abstände der Anzahl sind verschieden. Immer vom Preis für 1 ausgehen!");
      steps.push(`2 Rollen = ${2 * L} m → 1 Rolle = ${2 * L} : 2 = ${L} m`);
      qb.forEach((q) => steps.push(`${q} Rollen: ${q} · ${L} m = ${q * L} m`));
      steps.push(`1 h = ${nm(v)} km · ${nm(3 * v)} km in 3 h · ${nm(5 * v)} km : ${nm(v)} = 5 h · ${H} · ${nm(v)} = ${nm(H * v)} km`);
      tasks.push({ n: 5, pts: 6, level: "G", title: "Ergänze die Werte in den Tabellen.",
        blocks: [
          { kind: "table", head: ["Anzahl Packungen", "Preis"], rows: [["1", fr(u)]].concat(qa.map((q) => [String(q), F(r2(q * u), q === 2 ? "mal" : "luecke", { show: fr(q * u) })])) },
          { kind: "table", head: ["Anzahl Rollen", "Länge Schnur"], rows: [["1", F(L, "einheit", { show: L + " m" })], ["2", 2 * L + " m"]].concat(qb.map((q) => [String(q), F(q * L, "luecke", { show: q * L + " m" })])) },
          { kind: "table", cls: "wide", head: ["Zeit", F(1, "rueckwaerts", { show: "1 h" }), "2 h", "3 h", F(5, "rueckwaerts", { show: "5 h" }), H + " h"],
            rows: [["km", nm(v) + " km", nm(2 * v) + " km", F(r2(3 * v), "einheit", { show: nm(3 * v) + " km" }), nm(5 * v) + " km", F(r2(H * v), "einheit", { show: nm(H * v) + " km" })]] },
        ], steps });
    }

    // ---- 6. Rezept ----
    {
      const rec = R([
        { name: "einen Kartoffelgratin", b: 4, targets: R([[2, 6, 10], [6, 10, 12], [2, 10, 14]]),
          ing: [["Kartoffeln", 150, "g"], ["Rahm", 0.05, "l"], ["Reibkäse", 20, "g"], ["Knoblauch", 0.5, "Stück"]] },
        { name: "Pfannkuchen", b: 6, targets: R([[2, 4, 10], [4, 8, 10], [2, 8, 14]]),
          ing: [["Mehl", 50, "g"], ["Milch", 1, "dl"], ["Eier", 0.5, "Stück"], ["Zucker", 5, "g"]] },
      ]);
      const unit = (x, u) => nm(x) + (u === "Stück" ? " Stück" : " " + u);
      const rows = rec.ing.map(([n, per, u]) => [n, unit(per * rec.b, u)].concat(rec.targets.map((p) => F(r2(per * p), p % rec.b && rec.b % p ? "teiler" : "mal", { show: unit(per * p, u) }))));
      const steps = rec.targets.map((p) => `${rec.b} → ${p} Personen: ` + (p % rec.b === 0 ? `· ${p / rec.b}` : rec.b % p === 0 ? `: ${rec.b / p}` : `über ${gcd(rec.b, p)} Person${gcd(rec.b, p) > 1 ? "en" : ""}: : ${rec.b / gcd(rec.b, p)}, dann · ${p / gcd(rec.b, p)}`));
      steps.push(`Beispiel ${rec.ing[0][0]}: ` + way(rec.b, rec.ing[0][1] * rec.b, rec.targets[1], (x) => nm(x)) + " " + rec.ing[0][2]);
      tasks.push({ n: 6, pts: 4, level: "G", title: `Das Rezept für ${rec.name} ist für ${rec.b} Personen. Berechne die Mengen für die anderen Personenzahlen.`,
        blocks: [{ kind: "table", head: ["Personen", String(rec.b)].concat(rec.targets.map(String)), rows }], steps });
    }

    // ---- 7. Günstigste und teuerste Sorte ----
    {
      const names = pickN(["Gala", "Topaz", "Braeburn", "Boskoop", "Jazz", "Elstar"], 3);
      const qs = pickN([["500 g", 0.5], ["1 kg 500 g", 1.5], ["2 kg", 2], ["2 kg 500 g", 2.5], ["3 kg", 3], ["5 kg", 5]], 3);
      const per = pickN([1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.6, 2.8, 3.2], 3);
      const offers = names.map((nmx, i) => ({ name: nmx, q: qs[i], per: per[i], price: r2(qs[i][1] * per[i]) }));
      const cheap = offers.reduce((a, b) => (b.per < a.per ? b : a)), dear = offers.reduce((a, b) => (b.per > a.per ? b : a));
      tasks.push({ n: 7, pts: 3, level: "E", title: "Welche Apfelsorte ist am günstigsten, welche am teuersten? Berechne zuerst den Preis für 1 kg.",
        blocks: [
          { kind: "offers", items: offers.map((o) => ({ icon: "🍎", name: o.name, text: `${o.q[0]} für ${fr(o.price)}` })) },
          { kind: "table", head: ["Sorte", "Preis für 1 kg"], rows: offers.map((o) => [o.name, F(o.per, "vergleich", { show: fr(o.per) })]) },
          { kind: "lines", items: [["Am günstigsten ist", F(cheap.name, "vergleich", { kind: "choice", options: names }), ""], ["Am teuersten ist", F(dear.name, "vergleich", { kind: "choice", options: names }), ""]] },
        ],
        steps: offers.map((o) => `${o.name}: ${o.q[0]} = ${nm(o.q[1])} kg → ${fr(o.price)} : ${nm(o.q[1])} = ${fr(o.per)} pro kg` + (o.q[1] === 0.5 ? " (oder: 500 g · 2 = 1 kg, also Preis · 2)" : o.q[1] === 1.5 ? " (oder: 1 kg 500 g = 3 · 500 g → : 3 · 2)" : ""))
          .concat([`Günstigste: ${cheap.name}, teuerste: ${dear.name}. Vergleichen kann man nur gleiche Mengen!`]) });
    }

    // ---- 8. Bestellschein ----
    {
      const u1 = R([63.5, 48.5, 54.9, 72.5]), q1 = 2;
      const u2 = R([46, 39.9, 58.5, 44]), q2 = R([2, 3, 4]);
      const u3 = R([34.2, 29.9, 44.5, 27.8]), q3 = R([2, 3]);
      const P1 = r2(u1 * q1), P2 = r2(u2 * q2), P3 = r2(u3 * q3), tot = r2(P1 + P2 + P3);
      tasks.push({ n: 8, pts: 3, level: "E", title: "Ergänze den Bestellschein.",
        blocks: [{ kind: "table", head: ["Artikel", "Stückpreis", "Menge", "Preis"], rows: [
          ["Rucksack", F(u1, "teilen", { show: fr(u1) }), String(q1), fr(P1)],
          ["Jacke", fr(u2), F(q2, "rueckwaerts"), F(P2, "rueckwaerts", { show: fr(P2) })],
          ["Jeans", fr(u3), String(q3), F(P3, "mal", { show: fr(P3) })],
          ["", "", "Total", fr(tot)],
        ] }],
        steps: [`Rucksack: ${fr(P1)} : ${q1} = ${fr(u1)}`, `Jeans: ${q3} · ${fr(u3)} = ${fr(P3)}`,
          `Jacke: Total − Rucksack − Jeans = ${fr(tot)} − ${fr(P1)} − ${fr(P3)} = ${fr(P2)}`, `Menge Jacken: ${fr(P2)} : ${fr(u2)} = ${q2}`] });
    }

    // ---- 9. Doppelter Zahlenstrahl ----
    {
      const q = R([1.5, 1.2, 2.5]), s = R([20, 30, 40]);
      const e5 = 5 * s + 10 * R([1, 2, 3, 4]);
      const E = [0, s, 2 * s, 3 * s, 5 * s, e5], Fv = E.map((e) => r2(e * q));
      tasks.push({ n: 9, pts: 2, level: "E", title: "Ergänze die fehlenden Werte auf dem doppelten Zahlenstrahl.",
        blocks: [{ kind: "strahl",
          top: ["0 €", s + " €", 2 * s + " €", 3 * s + " €", F(5 * s, "strahl", { show: 5 * s + " €" }), e5 + " €"],
          bottom: ["0 Fr.", F(Fv[1], "strahl", { show: nm(Fv[1]) + " Fr." }), nm(Fv[2]) + " Fr.", F(Fv[3], "strahl", { show: nm(Fv[3]) + " Fr." }), nm(Fv[4]) + " Fr.", F(Fv[5], "strahl", { show: nm(Fv[5]) + " Fr." })] }],
        steps: [`${2 * s} € = ${nm(Fv[2])} Fr. → 1 € = ${nm(Fv[2])} : ${2 * s} = ${nm(q)} Fr.`, `${s} € · ${nm(q)} = ${nm(Fv[1])} Fr. · ${3 * s} € · ${nm(q)} = ${nm(Fv[3])} Fr.`,
          `${nm(Fv[4])} Fr. : ${nm(q)} = ${5 * s} € · ${e5} € · ${nm(q)} = ${nm(Fv[5])} Fr.`] });
    }

    // ---- 10. Umgekehrt proportional ----
    {
      const N = R([24, 36, 30, 48]);
      const divs = [2, 3, 4, 5, 6, 8, 10, 12].filter((d) => N % d === 0 && N / d > 1);
      const [g1, g2, g3] = pickN(divs, 3);
      tasks.push({ n: 10, pts: 1.5, level: "E", title: `Eine Klasse hat ${N} Kinder. Für den Sport werden Gruppen gebildet. Wie viele Kinder sind in jeder Gruppe? Überlege genau, was du rechnest!`,
        blocks: [{ kind: "table", head: ["Anzahl Gruppen", "Kinder pro Gruppe"], rows: [[String(g1), F(N / g1, "umgekehrt")], [F(g2, "umgekehrt"), String(N / g2)], [String(g3), F(N / g3, "umgekehrt")]] }],
        steps: [`Hier gilt: Gruppen · Kinder pro Gruppe = ${N}. Mehr Gruppen → weniger Kinder pro Gruppe!`, `${N} : ${g1} = ${N / g1} · ${N} : ${N / g2} = ${g2} · ${N} : ${g3} = ${N / g3}`] });
    }

    return { tasks, fields, max: tasks.reduce((a, t) => a + t.pts, 0) };
  }

  /** Eingabe lesen: «3,90», «3.9 Fr.», «1'200», «· 4», ": 3» */
  function parse(f, raw) {
    const s = String(raw == null ? "" : raw).trim();
    if (!s) return null;
    if (f.kind === "choice") return s;
    const n = s.replace(/[’'\s]/g, "").replace(",", ".").match(/\d+(\.\d+)?/);
    if (f.kind === "op") {
      const m = s.replace(/\s/g, "").match(/^(·|\*|x|×|mal|:|\/|÷|durch)?(\d+)/i);
      if (!m || !m[1]) return null;
      return (/^(:|\/|÷|durch)$/i.test(m[1]) ? "/" : "*") + m[2];
    }
    return n ? Number(n[0]) : null;
  }
  function check(f, raw) {
    const v = parse(f, raw);
    if (v === null) return false;
    return typeof f.ans === "number" ? Math.abs(v - f.ans) < 0.005 : v === f.ans;
  }

  window.MATHE_TEST = { make, check };
})();
