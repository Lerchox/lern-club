/*
 * Notenbild (SVG) und Klang (Web Audio) für das Musik-Modul.
 * Keine externen Dateien: alles wird im Browser gezeichnet bzw. erzeugt.
 */
(function () {
  "use strict";

  // ---------- Notenbild ----------
  // Tonhöhe als «Schritt» im Violinschlüssel: 0 = e' (unterste Linie), 1 = f', 2 = g' … -2 = c' (Hilfslinie)
  const INK = "#1b1b3a";

  function head(x, y, open, w = 7) {
    return `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="5" transform="rotate(-20 ${x} ${y})" fill="${open ? "#fff" : INK}" stroke="${INK}" stroke-width="2"/>`;
  }
  function stem(x, y, up, len = 32) {
    return up ? `<line x1="${x + 6}" y1="${y}" x2="${x + 6}" y2="${y - len}" stroke="${INK}" stroke-width="2"/>`
              : `<line x1="${x - 6}" y1="${y}" x2="${x - 6}" y2="${y + len}" stroke="${INK}" stroke-width="2"/>`;
  }

  /** Notensystem mit Violinschlüssel und einer oder mehreren Noten (nacheinander). notes: [{s, acc}] */
  function staffSvg(notes, opts = {}) {
    const top = 30, bottom = top + 40, W = opts.width || 240;
    const yOf = (s) => bottom - s * 5;
    let out = "";
    for (let i = 0; i < 5; i++) out += `<line x1="8" y1="${top + i * 10}" x2="${W - 8}" y2="${top + i * 10}" stroke="${INK}" stroke-width="1.4"/>`;
    const FONT = `'Noto Music','Segoe UI Symbol','Apple Symbols','Noto Sans Symbols 2',serif`;
    out += opts.clef === "bass"
      ? `<text x="12" y="${top + 31}" font-size="40" font-family="${FONT}" fill="${INK}">𝄢</text>`
      : `<text x="10" y="${bottom + 9}" font-size="62" font-family="${FONT}" fill="${INK}">𝄞</text>`;
    if (opts.time) out += `<text x="58" y="${top + 18}" font-size="20" font-weight="900" font-family="serif" fill="${INK}">${opts.time[0]}</text><text x="58" y="${top + 38}" font-size="20" font-weight="900" font-family="serif" fill="${INK}">${opts.time[1]}</text>`;
    const startX = opts.time ? 110 : 100, gap = notes.length > 1 ? Math.min(70, (W - startX - 20) / (notes.length - 1 || 1)) : 0;
    notes.forEach((n, i) => {
      const x = startX + i * gap + (notes.length === 1 ? 30 : 0), y = yOf(n.s);
      for (let l = -2; l >= n.s; l -= 2) out += `<line x1="${x - 12}" y1="${yOf(l)}" x2="${x + 12}" y2="${yOf(l)}" stroke="${INK}" stroke-width="1.4"/>`;
      for (let l = 10; l <= n.s; l += 2) out += `<line x1="${x - 12}" y1="${yOf(l)}" x2="${x + 12}" y2="${yOf(l)}" stroke="${INK}" stroke-width="1.4"/>`;
      if (n.acc) out += `<text x="${x - 24}" y="${y + 6}" font-size="20" font-family="serif" fill="${INK}">${{ sharp: "♯", flat: "♭", natural: "♮" }[n.acc]}</text>`;
      out += head(x, y, opts.open) + (opts.stems === false ? "" : stem(x, y, n.s < 4));
    });
    return `<svg class="staff" viewBox="0 0 ${W} 100" xmlns="http://www.w3.org/2000/svg" role="img">${out}</svg>`;
  }

  /** Einzelnes Notensymbol (Notenwert) */
  function valueSvg(kind) {
    const x = 40, y = 62;
    let s = "";
    switch (kind) {
      case "w": s = head(x, y, true, 9); break;
      case "h": s = head(x, y, true) + stem(x, y, true); break;
      case "dh": s = head(x, y, true) + stem(x, y, true) + `<circle cx="${x + 15}" cy="${y}" r="2.8" fill="${INK}"/>`; break;
      case "q": s = head(x, y, false) + stem(x, y, true); break;
      case "dq": s = head(x, y, false) + stem(x, y, true) + `<circle cx="${x + 15}" cy="${y}" r="2.8" fill="${INK}"/>`; break;
      case "e": s = head(x, y, false) + stem(x, y, true) + `<path d="M${x + 6} ${y - 32} q 14 8 10 24" stroke="${INK}" stroke-width="3" fill="none"/>`; break;
      case "s": s = head(x, y, false) + stem(x, y, true) + `<path d="M${x + 6} ${y - 32} q 14 8 10 22" stroke="${INK}" stroke-width="3" fill="none"/><path d="M${x + 6} ${y - 24} q 14 8 10 22" stroke="${INK}" stroke-width="3" fill="none"/>`; break;
      case "rw": s = `<line x1="10" y1="20" x2="70" y2="20" stroke="${INK}" stroke-width="1.4"/><line x1="10" y1="30" x2="70" y2="30" stroke="${INK}" stroke-width="1.4"/><line x1="10" y1="40" x2="70" y2="40" stroke="${INK}" stroke-width="1.4"/><line x1="10" y1="50" x2="70" y2="50" stroke="${INK}" stroke-width="1.4"/><line x1="10" y1="60" x2="70" y2="60" stroke="${INK}" stroke-width="1.4"/><rect x="30" y="30" width="20" height="7" fill="${INK}"/>`; break;
      case "rh": s = `<line x1="10" y1="20" x2="70" y2="20" stroke="${INK}" stroke-width="1.4"/><line x1="10" y1="30" x2="70" y2="30" stroke="${INK}" stroke-width="1.4"/><line x1="10" y1="40" x2="70" y2="40" stroke="${INK}" stroke-width="1.4"/><line x1="10" y1="50" x2="70" y2="50" stroke="${INK}" stroke-width="1.4"/><line x1="10" y1="60" x2="70" y2="60" stroke="${INK}" stroke-width="1.4"/><rect x="30" y="33" width="20" height="7" fill="${INK}"/>`; break;
    }
    return `<svg class="note-value" viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg" role="img">${s}</svg>`;
  }

  /*
   * Rhythmus-Bausteine: Dauer in Vierteln, Einsätze innerhalb des Bausteins
   */
  const RHY = {
    w: { len: 4, on: [0] }, h: { len: 2, on: [0] }, dh: { len: 3, on: [0] }, q: { len: 1, on: [0] },
    ee: { len: 1, on: [0, 0.5] }, ssss: { len: 1, on: [0, 0.25, 0.5, 0.75] },
    dqe: { len: 2, on: [0, 1.5] }, eqe: { len: 2, on: [0, 0.5, 1.5] },
    ess: { len: 1, on: [0, 0.5, 0.75] }, sse: { len: 1, on: [0, 0.25, 0.5] },
    des: { len: 1, on: [0, 0.75] }, trip: { len: 1, on: [0, 1 / 3, 2 / 3] },
  };

  /** Rhythmus als Notenbild auf einer Linie. Jeder Baustein hat eine eigene Breite, damit nichts überlappt. */
  const VW = { w: 80, h: 60, dh: 72, q: 44, ee: 64, ssss: 96, dqe: 96, eqe: 110, ess: 84, sse: 96, des: 76, trip: 84 };
  function rhythmSvg(tokens) {
    const y = 60;
    const totalW = 30 + tokens.reduce((a, k) => a + VW[k], 0) + 10;
    let x = 30, s = `<line x1="10" y1="${y}" x2="${totalW - 10}" y2="${y}" stroke="#999" stroke-width="1"/>`;
    const beam = (x1, x2, yy) => `<rect x="${x1 + 6}" y="${yy}" width="${x2 - x1}" height="5" fill="${INK}"/>`;
    const flag = (xx) => `<path d="M${xx + 6} ${y - 32} q 14 8 10 24" stroke="${INK}" stroke-width="3" fill="none"/>`;
    const dot = (xx) => `<circle cx="${xx + 15}" cy="${y}" r="2.8" fill="${INK}"/>`;
    for (const k of tokens) {
      const w = VW[k], len = RHY[k].len, u = (w - 20) / len;
      const at = (o) => x + o * u;
      const note = (o) => head(at(o), y) + stem(at(o), y, true);
      switch (k) {
        case "w": s += head(x, y, true, 9); break;
        case "h": s += head(x, y, true) + stem(x, y, true); break;
        case "dh": s += head(x, y, true) + stem(x, y, true) + dot(x); break;
        case "q": s += note(0); break;
        case "ee": s += note(0) + note(0.5) + beam(at(0), at(0.5), y - 32); break;
        case "ssss": s += [0, 0.25, 0.5, 0.75].map(note).join("") + beam(at(0), at(0.75), y - 32) + beam(at(0), at(0.75), y - 24); break;
        case "dqe": s += note(0) + dot(at(0)) + note(1.5) + flag(at(1.5)); break;
        case "eqe": s += note(0) + flag(at(0)) + note(0.5) + note(1.5) + flag(at(1.5)); break;
        case "ess": s += note(0) + note(0.5) + note(0.75) + beam(at(0), at(0.75), y - 32) + beam(at(0.5), at(0.75), y - 24); break;
        case "sse": s += note(0) + note(0.25) + note(0.5) + beam(at(0), at(0.5), y - 32) + beam(at(0), at(0.25), y - 24); break;
        case "des": s += note(0) + `<circle cx="${at(0) + 15}" cy="${y}" r="2.5" fill="${INK}"/>` + note(0.75) + beam(at(0), at(0.75), y - 32) + `<rect x="${at(0.75) - 4}" y="${y - 24}" width="10" height="5" fill="${INK}"/>`; break;
        case "trip": s += [0, 1 / 3, 2 / 3].map(note).join("") + beam(at(0), at(2 / 3), y - 32) + `<text x="${at(1 / 3) + 2}" y="${y - 38}" font-size="13" font-style="italic" font-weight="700" fill="${INK}">3</text>`; break;
      }
      x += w;
    }
    return `<svg class="rhythm" viewBox="0 0 ${totalW} 80" xmlns="http://www.w3.org/2000/svg" role="img">${s}</svg>`;
  }

  // ---------- Klang ----------
  let ctx = null;
  const ac = () => (ctx = ctx || new (window.AudioContext || window.webkitAudioContext)());
  const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  function tone(midi, start, dur, vol = 0.25) {
    const a = ac(), o = a.createOscillator(), g = a.createGain(), o2 = a.createOscillator(), g2 = a.createGain();
    o.type = "triangle"; o.frequency.value = freq(midi);
    o2.type = "sine"; o2.frequency.value = freq(midi) * 2; g2.gain.value = 0.15;
    o2.connect(g2).connect(g);
    o.connect(g).connect(a.destination);
    const t0 = a.currentTime + start;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(vol * 0.6, t0 + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    o.start(t0); o2.start(t0); o.stop(t0 + dur + 0.05); o2.stop(t0 + dur + 0.05);
  }
  function click(start, accent) {
    const a = ac(), o = a.createOscillator(), g = a.createGain();
    o.type = "square"; o.frequency.value = accent ? 1500 : 1000;
    o.connect(g).connect(a.destination);
    const t0 = a.currentTime + start;
    g.gain.setValueAtTime(0.25, t0); g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.06);
    o.start(t0); o.stop(t0 + 0.08);
  }
  function wood(start) {
    const a = ac(), o = a.createOscillator(), g = a.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(900, a.currentTime + start); o.frequency.exponentialRampToValueAtTime(400, a.currentTime + start + 0.08);
    o.connect(g).connect(a.destination);
    const t0 = a.currentTime + start;
    g.gain.setValueAtTime(0.6, t0); g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.12);
    o.start(t0); o.stop(t0 + 0.14);
  }

  const Sound = {
    unlock() { const a = ac(); if (a.state === "suspended") a.resume(); },
    /** Töne nacheinander, gibt Dauer in Sekunden zurück */
    melody(midis, beat = 0.7) { this.unlock(); midis.forEach((m, i) => tone(m, 0.05 + i * beat, beat * 0.95)); return midis.length * beat + 0.1; },
    chord(midis, arpeggio) { this.unlock(); midis.forEach((m, i) => tone(m, 0.05 + (arpeggio ? i * 0.45 : 0), arpeggio ? 1.6 - i * 0.3 : 1.6, 0.18)); return 1.8; },
    note(midi) { this.unlock(); tone(midi, 0.01, 0.6); },
    /** Zuerst der Bezugston (lang), kurze Pause, dann die Melodie */
    melodyWithReference(ref, midis, beat = 0.75) {
      this.unlock();
      tone(ref, 0.05, 1.3, 0.22);
      const start = 2.0;
      midis.forEach((m, i) => tone(m, start + i * beat, beat * 0.95));
      return start + midis.length * beat;
    },
    /** Rhythmus: Einzähler (4 Klicks) + Rhythmus. Gibt {startsAt, onsets(s), total} */
    rhythm(tokens, bpm = 80, countIn = true) {
      this.unlock();
      const beat = 60 / bpm, lead = countIn ? 4 * beat : 0;
      if (countIn) for (let i = 0; i < 4; i++) click(0.1 + i * beat, i === 0);
      const onsets = []; let pos = 0;
      tokens.forEach((k) => { RHY[k].on.forEach((o) => onsets.push(pos + o)); pos += RHY[k].len; });
      onsets.forEach((o) => wood(0.1 + lead + o * beat));
      return { onsetsBeats: onsets, beat, total: 0.1 + lead + pos * beat };
    },
    tap() { this.unlock(); wood(0); },
  };

  window.Notation = { staffSvg, valueSvg, rhythmSvg, RHY };
  window.Sound = Sound;
})();
