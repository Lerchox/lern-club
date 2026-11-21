/*
 * Musik-Modul: Vorbereitung auf den mCheck (Stufentest der Aargauer Musikschulen, VAM).
 * Themen nach «mCheck Basiswissen 2024» und der «Fachausdrucksliste» des VAM:
 *   https://vam-ag.ch/mcheck/basiswissen/
 * Die Fragen und Erklärungen sind selbst formuliert (keine Kopien der VAM-Unterlagen).
 * Aktuell: Stufe 1–3. Stufe 4–6 lassen sich hier ergänzen.
 */
(function () {
  "use strict";
  const N = () => window.Notation;
  const lang = () => (window.__lang && window.__lang()) || "de";
  const T = (o) => (typeof o === "string" ? o : o[lang()] || o.de);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---------- Notennamen ----------
  const LETTERS = {
    de: ["C", "D", "E", "F", "G", "A", "H"],
    en: ["C", "D", "E", "F", "G", "A", "B"],
    es: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"],
  };
  const DE_SHARP = ["Cis", "Dis", "Eis", "Fis", "Gis", "Ais", "His"];
  const DE_FLAT = ["Ces", "Des", "Es", "Fes", "Ges", "As", "B"];
  /** Name eines Tons: letter 0–6 (C–H), acc: 0 / 1 (♯) / -1 (♭) */
  function noteName(letter, acc = 0) {
    const l = lang();
    if (l === "de") return acc === 1 ? DE_SHARP[letter] : acc === -1 ? DE_FLAT[letter] : LETTERS.de[letter];
    return LETTERS[l][letter] + (acc === 1 ? "♯" : acc === -1 ? "♭" : "");
  }
  const letterOfStep = (s) => (((s + 2) % 7) + 7) % 7;
  const midiOfStep = (s) => 60 + 12 * Math.floor((s + 2) / 7) + [0, 2, 4, 5, 7, 9, 11][letterOfStep(s)];

  const INTERVALS = {
    de: ["Prim", "Sekunde", "Terz", "Quarte", "Quinte", "Sexte", "Septime", "Oktave"],
    en: ["unison", "second", "third", "fourth", "fifth", "sixth", "seventh", "octave"],
    es: ["unísono", "segunda", "tercera", "cuarta", "quinta", "sexta", "séptima", "octava"],
  };
  // Qualität der Intervalle der Dur-Tonleiter vom Grundton aus
  const QUAL = {
    de: ["reine", "grosse", "grosse", "reine", "reine", "grosse", "grosse", "reine"],
    en: ["perfect", "major", "major", "perfect", "perfect", "major", "major", "perfect"],
    es: ["justo", "mayor", "mayor", "justa", "justa", "mayor", "mayor", "justa"],
  };
  const intervalName = (d, withQual = true) => {
    const l = lang();
    const q = withQual ? QUAL[l][d] + " " : "";
    return `${l === "es" && d === 0 ? "unísono justo" : q + INTERVALS[l][d]} (${d + 1})`;
  };

  // ---------- Fachausdrücke ----------
  const TERMS = [
    // Stufe 1
    { st: 1, t: "piano (p)", de: "leise", en: "quiet", es: "suave" },
    { st: 1, t: "mezzoforte (mf)", de: "mittellaut", en: "moderately loud", es: "medio fuerte" },
    { st: 1, t: "forte (f)", de: "laut", en: "loud", es: "fuerte" },
    { st: 1, t: "crescendo (cresc.)", de: "lauter werden", en: "getting louder", es: "cada vez más fuerte" },
    { st: 1, t: "decrescendo / diminuendo", de: "leiser werden", en: "getting quieter", es: "cada vez más suave" },
    { st: 1, t: "legato", de: "gebunden, ohne Lücke", en: "smoothly connected", es: "ligado, sin cortar" },
    { st: 1, t: "staccato", de: "kurz, abgestossen", en: "short and detached", es: "corto y separado" },
    { st: 1, t: "Fermate 𝄐", de: "Haltezeichen: Ton länger aushalten", en: "fermata: hold the note longer", es: "calderón: sostener la nota más tiempo" },
    // Stufe 2
    { st: 2, t: "pianissimo (pp)", de: "sehr leise", en: "very quiet", es: "muy suave" },
    { st: 2, t: "mezzopiano (mp)", de: "mittelleise", en: "moderately quiet", es: "medio suave" },
    { st: 2, t: "fortissimo (ff)", de: "sehr laut", en: "very loud", es: "muy fuerte" },
    { st: 2, t: "Largo", de: "breit, sehr langsam", en: "broad, very slow", es: "amplio, muy lento" },
    { st: 2, t: "Lento", de: "langsam", en: "slow", es: "lento" },
    { st: 2, t: "Adagio", de: "langsam, ruhig", en: "slow and calm", es: "lento y tranquilo" },
    { st: 2, t: "Andante", de: "gehend, ruhig fliessend", en: "at a walking pace", es: "al paso, fluido" },
    { st: 2, t: "Moderato", de: "mässig schnell", en: "moderate speed", es: "moderado" },
    { st: 2, t: "Allegro", de: "schnell, fröhlich", en: "fast and cheerful", es: "rápido y alegre" },
    { st: 2, t: "Vivace", de: "lebhaft", en: "lively", es: "vivo, animado" },
    { st: 2, t: "Presto", de: "sehr schnell", en: "very fast", es: "muy rápido" },
    { st: 2, t: "ritardando (rit.)", de: "langsamer werden", en: "slowing down", es: "cada vez más lento" },
    { st: 2, t: "accelerando (accel.)", de: "schneller werden", en: "speeding up", es: "cada vez más rápido" },
    { st: 2, t: "a tempo", de: "wieder im ursprünglichen Tempo", en: "back to the original speed", es: "volver al tempo original" },
    { st: 2, t: "meno mosso", de: "weniger bewegt, langsamer", en: "less movement, slower", es: "menos movido, más lento" },
    { st: 2, t: "più mosso", de: "bewegter, schneller", en: "more movement, faster", es: "más movido, más rápido" },
    { st: 2, t: "tenuto", de: "Ton voll aushalten", en: "hold the note for its full length", es: "sostener la nota todo su valor" },
    // Stufe 3
    { st: 3, t: "pianissimo possibile (ppp)", de: "so leise wie möglich", en: "as quiet as possible", es: "lo más suave posible" },
    { st: 3, t: "fortissimo possibile (fff)", de: "so laut wie möglich", en: "as loud as possible", es: "lo más fuerte posible" },
    { st: 3, t: "fortepiano (fp)", de: "laut und sofort leise", en: "loud, then immediately quiet", es: "fuerte y enseguida suave" },
    { st: 3, t: "sforzato (sfz)", de: "plötzlich stark betont", en: "suddenly strongly accented", es: "acento repentino y fuerte" },
    { st: 3, t: "Akzent >", de: "betont", en: "accented", es: "acentuado" },
    { st: 3, t: "marcato", de: "markiert, deutlich betont", en: "marked, clearly accented", es: "marcado, muy acentuado" },
    { st: 3, t: "Andantino", de: "etwas fliessender als Andante", en: "a little more flowing than Andante", es: "un poco más fluido que Andante" },
    { st: 3, t: "Allegretto", de: "etwas bewegt, ruhiger als Allegro", en: "fairly lively, calmer than Allegro", es: "algo movido, más tranquilo que Allegro" },
    { st: 3, t: "portato", de: "getragen, leicht getrennt", en: "carried, slightly separated", es: "portato, ligeramente separado" },
  ];

  // ---------- Fragen-Generatoren ----------
  // Jeder Generator liefert { html, opts, answer, explain }
  const Q = {};

  // Stufe 1 --------------------------------------------------
  // Bassschlüssel: Schritt 0 = G (unterste Linie), Schritt 10 = c' (Hilfslinie oben)
  const letterOfStepBass = (s) => (((s + 4) % 7) + 7) % 7;
  const midiOfStepBass = (s) => 36 + 12 * Math.floor((s + 4) / 7) + [0, 2, 4, 5, 7, 9, 11][letterOfStepBass(s)];
  Q.noteName = (st) => {
    const piano = !window.__instrument || window.__instrument() === "piano";
    if (piano && Math.random() < 0.45) {
      const s = pick([-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const l = letterOfStepBass(s), correct = noteName(l);
      const opts = shuffle([correct, ...shuffle([0, 1, 2, 3, 4, 5, 6].filter((x) => x !== l)).slice(0, 3).map((x) => noteName(x))]);
      return { html: `<p>${T({ de: "Wie heisst diese Note im Bassschlüssel?", en: "What is this note in the bass clef?", es: "¿Cómo se llama esta nota en clave de fa?" })}</p>${N().staffSvg([{ s }], { clef: "bass" })}`,
        opts, answer: opts.indexOf(correct), midi: midiOfStepBass(s), clef: "bass",
        explain: T({ de: "Merkhilfe Bassschlüssel: Die unterste Linie ist G, die zweitoberste Linie ist F (dort sitzt der Schlüssel).", en: "Bass clef tip: the bottom line is G, the second line from the top is F (where the clef sits).", es: "Truco clave de fa: la línea de abajo es Sol, la cuarta línea es Fa (donde está la clave)." }) };
    }
    const s = pick(st >= 2 ? [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const correct = noteName(letterOfStep(s));
    const opts = shuffle([correct, ...shuffle([0, 1, 2, 3, 4, 5, 6].filter((l) => l !== letterOfStep(s))).slice(0, 3).map((l) => noteName(l))]);
    return { html: `<p>${T({ de: "Wie heisst diese Note?", en: "What is this note called?", es: "¿Cómo se llama esta nota?" })}</p>${N().staffSvg([{ s }])}`,
      opts, answer: opts.indexOf(correct), midi: midiOfStep(s),
      explain: T({ de: "Merkhilfe: Die unterste Linie ist E, die mittlere Linie ist H.", en: "Tip: the bottom line is E, the middle line is B.", es: "Truco: la línea de abajo es Mi, la del medio es Si." }) };
  };

  const VALUES = [
    { k: "w", de: "Ganze Note", en: "whole note", es: "redonda", beats: 4 },
    { k: "h", de: "Halbe Note", en: "half note", es: "blanca", beats: 2 },
    { k: "dh", de: "Punktierte Halbe", en: "dotted half note", es: "blanca con puntillo", beats: 3 },
    { k: "q", de: "Viertelnote", en: "quarter note", es: "negra", beats: 1 },
    { k: "e", de: "Achtelnote", en: "eighth note", es: "corchea", beats: 0.5 },
  ];
  Q.noteValue = () => {
    const v = pick(VALUES);
    const opts = shuffle([v, ...shuffle(VALUES.filter((x) => x !== v)).slice(0, 3)]);
    return { html: `<p>${T({ de: "Welcher Notenwert ist das?", en: "Which note value is this?", es: "¿Qué figura es esta?" })}</p>${N().valueSvg(v.k)}`,
      opts: opts.map(T), answer: opts.indexOf(v) };
  };
  Q.beats = () => {
    const v = pick(VALUES);
    const fmt = (b) => (b === 0.5 ? "½" : String(b));
    const all = ["½", "1", "2", "3", "4"];
    const opts = shuffle([fmt(v.beats), ...shuffle(all.filter((x) => x !== fmt(v.beats))).slice(0, 3)]);
    return { html: `<p>${T({ de: "Wie viele Viertel dauert diese Note?", en: "How many quarter notes long is this note?", es: "¿Cuántas negras dura esta figura?" })}</p>${N().valueSvg(v.k)}`,
      opts, answer: opts.indexOf(fmt(v.beats)), explain: `${T(v)} = ${fmt(v.beats)} ${T({ de: "Viertel", en: "quarter(s)", es: "negra(s)" })}` };
  };
  Q.rest = () => {
    const whole = Math.random() < 0.5;
    const opts = [T({ de: "Ganze Pause", en: "whole rest", es: "silencio de redonda" }), T({ de: "Halbe Pause", en: "half rest", es: "silencio de blanca" })];
    return { html: `<p>${T({ de: "Welche Pause ist das?", en: "Which rest is this?", es: "¿Qué silencio es este?" })}</p>${N().valueSvg(whole ? "rw" : "rh")}`,
      opts, answer: whole ? 0 : 1,
      explain: T({ de: "Die Ganze Pause hängt unter der Linie, die Halbe Pause sitzt auf der Linie.", en: "The whole rest hangs below the line, the half rest sits on it.", es: "El silencio de redonda cuelga de la línea; el de blanca se apoya encima." }) };
  };
  Q.timeSig = () => {
    const items = [
      { q: { de: "Wie viele Viertel hat ein 3/4-Takt?", en: "How many quarter notes are in a 3/4 bar?", es: "¿Cuántas negras tiene un compás de 3/4?" }, a: "3", o: ["2", "3", "4", "6"] },
      { q: { de: "Wie viele Viertel hat ein 2/4-Takt?", en: "How many quarter notes are in a 2/4 bar?", es: "¿Cuántas negras tiene un compás de 2/4?" }, a: "2", o: ["2", "3", "4", "8"] },
      { q: { de: "Das Zeichen C als Taktangabe bedeutet …", en: "The sign C as a time signature means …", es: "El signo C como compás significa …" }, a: "4/4", o: ["2/4", "3/4", "4/4", "6/8"] },
      { q: { de: "Ein Auftakt ist …", en: "An upbeat (anacrusis) is …", es: "Una anacrusa es …" },
        a: T({ de: "ein unvollständiger Takt vor dem ersten ganzen Takt", en: "an incomplete bar before the first full bar", es: "un compás incompleto antes del primer compás completo" }),
        o: [T({ de: "ein unvollständiger Takt vor dem ersten ganzen Takt", en: "an incomplete bar before the first full bar", es: "un compás incompleto antes del primer compás completo" }),
            T({ de: "eine Pause am Ende", en: "a rest at the end", es: "un silencio al final" }),
            T({ de: "ein sehr lauter Ton", en: "a very loud note", es: "una nota muy fuerte" }),
            T({ de: "das Zeichen für Wiederholung", en: "the repeat sign", es: "el signo de repetición" })] },
    ];
    const it = pick(items), opts = shuffle(it.o);
    return { html: `<p>${T(it.q)}</p>`, opts, answer: opts.indexOf(it.a) };
  };
  Q.accidental = () => {
    const items = [
      { sym: "♯", de: "erhöht den Ton um einen Halbton (Kreuz)", en: "raises the note by a semitone (sharp)", es: "sube la nota un semitono (sostenido)" },
      { sym: "♭", de: "erniedrigt den Ton um einen Halbton (b)", en: "lowers the note by a semitone (flat)", es: "baja la nota un semitono (bemol)" },
      { sym: "♮", de: "hebt ♯ oder ♭ wieder auf (Auflösungszeichen)", en: "cancels a sharp or flat (natural)", es: "anula el sostenido o bemol (becuadro)" },
    ];
    const it = pick(items), opts = shuffle(items);
    return { html: `<p>${T({ de: "Was bewirkt dieses Zeichen?", en: "What does this sign do?", es: "¿Qué hace este signo?" })}</p><p class="big-sym">${it.sym}</p>`,
      opts: opts.map(T), answer: opts.indexOf(it) };
  };
  Q.term = (st) => {
    const pool = TERMS.filter((x) => x.st <= st);
    const prefer = TERMS.filter((x) => x.st === st);
    const it = Math.random() < 0.6 && prefer.length ? pick(prefer) : pick(pool);
    const others = shuffle(pool.filter((x) => x !== it && T(x) !== T(it))).slice(0, 3);
    if (Math.random() < 0.5) {
      const opts = shuffle([it, ...others]);
      return { html: `<p>${T({ de: "Was bedeutet …", en: "What does this mean?", es: "¿Qué significa …" })}</p><p class="big-term">${it.t}</p>`, opts: opts.map(T), answer: opts.indexOf(it) };
    }
    const opts = shuffle([it, ...others]);
    return { html: `<p>${T({ de: "Wie heisst der Fachausdruck für …", en: "What is the musical term for …", es: "¿Cuál es el término para …" })}</p><p class="big-term">«${T(it)}»</p>`, opts: opts.map((x) => x.t), answer: opts.indexOf(it) };
  };

  // Stufe 2 --------------------------------------------------
  Q.scaleSteps = () => {
    const opts = ["1–2 & 5–6", "3–4 & 7–8", "2–3 & 5–6", "4–5 & 6–7"];
    return { html: `<p>${T({ de: "Zwischen welchen Stufen der Dur-Tonleiter liegen die Halbtonschritte?", en: "Between which steps of the major scale are the semitones?", es: "¿Entre qué grados de la escala mayor están los semitonos?" })}</p>${N().staffSvg([-2, -1, 0, 1, 2, 3, 4, 5].map((s) => ({ s })), { width: 320, stems: false })}`,
      opts, answer: 1, explain: T({ de: "In C-Dur: E–F (3–4) und H–C (7–8).", en: "In C major: E–F (3–4) and B–C (7–8).", es: "En Do mayor: Mi–Fa (3–4) y Si–Do (7–8)." }) };
  };
  Q.halfWhole = () => {
    const pairs = [[2, 3, true], [6, 0, true], [0, 1, false], [3, 4, false], [4, 5, false], [5, 6, false]];
    const [a, b, half] = pick(pairs);
    const opts = [T({ de: "Halbtonschritt", en: "semitone", es: "semitono" }), T({ de: "Ganztonschritt", en: "whole tone", es: "tono" })];
    return { html: `<p>${T({ de: "Was liegt zwischen diesen Tönen?", en: "What is the step between these notes?", es: "¿Qué distancia hay entre estas notas?" })}</p><p class="big-term">${noteName(a)} – ${noteName(b)}</p>`,
      opts, answer: half ? 0 : 1, explain: T({ de: "Halbtöne ohne Vorzeichen: E–F und H–C. Alle anderen Nachbartöne sind Ganztöne.", en: "Natural semitones: E–F and B–C. All other neighbours are whole tones.", es: "Semitonos naturales: Mi–Fa y Si–Do. Los demás son tonos." }) };
  };
  const KEYS = [
    { name: [0, 0], lead: [6, 0], sig: { de: "keine Vorzeichen", en: "no sharps or flats", es: "sin alteraciones" } },
    { name: [4, 0], lead: [3, 1], sig: { de: "1 ♯ (Fis)", en: "1 ♯ (F♯)", es: "1 ♯ (Fa♯)" } },
    { name: [1, 0], lead: [0, 1], sig: { de: "2 ♯ (Fis, Cis)", en: "2 ♯ (F♯, C♯)", es: "2 ♯ (Fa♯, Do♯)" } },
    { name: [3, 0], lead: [2, 0], sig: { de: "1 ♭ (B)", en: "1 ♭ (B♭)", es: "1 ♭ (Si♭)" } },
  ];
  const major = (k) => noteName(k.name[0]) + T({ de: "-Dur", en: " major", es: " mayor" });
  Q.leadingTone = () => {
    const k = pick(KEYS), correct = noteName(k.lead[0], k.lead[1]);
    const cands = shuffle([[6, 0], [3, 1], [0, 1], [2, 0], [3, 0], [4, 0], [5, 0]].map(([l, a]) => noteName(l, a)).filter((x) => x !== correct)).slice(0, 3);
    const opts = shuffle([correct, ...cands]);
    return { html: `<p>${T({ de: "Welcher Ton ist der Leitton in", en: "Which note is the leading tone in", es: "¿Cuál es la sensible en" })} <b>${major(k)}</b>?</p>`,
      opts, answer: opts.indexOf(correct), explain: T({ de: "Der Leitton ist die 7. Stufe, einen Halbton unter dem Grundton.", en: "The leading tone is the 7th step, a semitone below the tonic.", es: "La sensible es el 7.º grado, un semitono por debajo de la tónica." }) };
  };
  Q.keySig = () => {
    const k = pick(KEYS), opts = shuffle(KEYS);
    return { html: `<p>${T({ de: "Welche Vorzeichen hat", en: "Which key signature does", es: "¿Qué alteraciones tiene" })} <b>${major(k)}</b>${T({ de: "?", en: " have?", es: "?" })}</p>`,
      opts: opts.map((x) => T(x.sig)), answer: opts.indexOf(k) };
  };
  Q.rhythm2 = () => {
    const items = [
      { q: { de: "Eine punktierte Viertel dauert so lang wie …", en: "A dotted quarter note lasts as long as …", es: "Una negra con puntillo dura lo mismo que …" }, o: ["2", "3", "4", "6"], a: "3", suf: { de: " Achtel", en: " eighth notes", es: " corcheas" } },
      { q: { de: "Wie viele Sechzehntel passen in eine Viertel?", en: "How many sixteenth notes fit into a quarter note?", es: "¿Cuántas semicorcheas caben en una negra?" }, o: ["2", "3", "4", "8"], a: "4", suf: { de: "", en: "", es: "" } },
      { q: { de: "Wie viele Achtel hat ein 6/8-Takt?", en: "How many eighth notes are in a 6/8 bar?", es: "¿Cuántas corcheas tiene un compás de 6/8?" }, o: ["3", "4", "6", "8"], a: "6", suf: { de: "", en: "", es: "" } },
      { q: { de: "Wie viele Achtel hat ein 3/8-Takt?", en: "How many eighth notes are in a 3/8 bar?", es: "¿Cuántas corcheas tiene un compás de 3/8?" }, o: ["2", "3", "6", "8"], a: "3", suf: { de: "", en: "", es: "" } },
    ];
    const it = pick(items), opts = shuffle(it.o);
    return { html: `<p>${T(it.q)}</p>`, opts: opts.map((x) => x + T(it.suf)), answer: opts.indexOf(it.a) };
  };
  Q.rhythmRead = (st) => {
    const sets = st >= 3 ? [["q", "ee", "h"], ["dqe", "ee"], ["eqe", "q", "q"], ["ess", "sse", "h"], ["trip", "q", "h"], ["des", "q", "h"]] :
      [["q", "q", "h"], ["ee", "q", "h"], ["dqe", "h"], ["ssss", "q", "h"], ["eqe", "h"]];
    const toks = pick(sets);
    const cnt = toks.reduce((a, k) => a + N().RHY[k].on.length, 0);
    const all = [cnt - 1, cnt, cnt + 1, cnt + 2].filter((x) => x > 0).map(String);
    const opts = shuffle(all);
    return { html: `<p>${T({ de: "Wie viele Töne klatschst du in diesem Takt?", en: "How many notes do you clap in this bar?", es: "¿Cuántas notas palmeas en este compás?" })}</p>${N().rhythmSvg(toks)}`,
      opts, answer: opts.indexOf(String(cnt)), rhythm: toks };
  };

  // Stufe 3 --------------------------------------------------
  Q.interval = () => {
    const d = pick([1, 2, 3, 4, 5, 6, 7]);
    const correct = intervalName(d);
    const others = shuffle([0, 1, 2, 3, 4, 5, 6, 7].filter((x) => x !== d)).slice(0, 3).map((x) => intervalName(x));
    const opts = shuffle([correct, ...others]);
    return { html: `<p>${T({ de: "Welches Intervall ist das (vom Grundton C aus)?", en: "Which interval is this (from C)?", es: "¿Qué intervalo es (desde Do)?" })}</p>${N().staffSvg([{ s: -2 }, { s: -2 + d }], { stems: false })}`,
      opts, answer: opts.indexOf(correct), midis: [60, midiOfStep(-2 + d)] };
  };
  const TRIADS = [
    { r: 0, minor: false, n: [[0, 0], [2, 0], [4, 0]] }, { r: 4, minor: false, n: [[4, 0], [6, 0], [1, 0]] }, { r: 3, minor: false, n: [[3, 0], [5, 0], [0, 0]] },
    { r: 5, minor: true, n: [[5, 0], [0, 0], [2, 0]] }, { r: 1, minor: true, n: [[1, 0], [3, 0], [5, 0]] }, { r: 2, minor: true, n: [[2, 0], [4, 0], [6, 0]] },
  ];
  const triadLabel = (x) => (x.minor ? (lang() === "de" ? noteName(x.r).toLowerCase() : noteName(x.r)) + T({ de: "-Moll", en: " minor", es: " menor" }) : noteName(x.r) + T({ de: "-Dur", en: " major", es: " mayor" }));
  const triadNotes = (x) => x.n.map(([l, a]) => noteName(l, a)).join(" – ");
  Q.triad = () => {
    const x = pick(TRIADS), opts = shuffle([x, ...shuffle(TRIADS.filter((y) => y !== x)).slice(0, 3)]);
    return { html: `<p>${T({ de: "Welche Töne hat der Dreiklang", en: "Which notes are in the triad", es: "¿Qué notas tiene el acorde de" })} <b>${triadLabel(x)}</b>?</p>`,
      opts: opts.map(triadNotes), answer: opts.indexOf(x),
      explain: T({ de: "Dur: grosse Terz + kleine Terz. Moll: kleine Terz + grosse Terz.", en: "Major: major third + minor third. Minor: minor third + major third.", es: "Mayor: tercera mayor + tercera menor. Menor: tercera menor + tercera mayor." }) };
  };
  Q.minorScale = () => {
    const opts = ["2–3 & 5–6", "3–4 & 7–8", "1–2 & 4–5", "2–3 & 7–8"];
    return { html: `<p>${T({ de: "Wo liegen in der reinen (natürlichen) Moll-Tonleiter die Halbtonschritte?", en: "Where are the semitones in the natural minor scale?", es: "¿Dónde están los semitonos en la escala menor natural?" })}</p>`,
      opts, answer: 0, explain: T({ de: "In a-Moll: H–C (2–3) und E–F (5–6).", en: "In A minor: B–C (2–3) and E–F (5–6).", es: "En La menor: Si–Do (2–3) y Mi–Fa (5–6)." }) };
  };
  Q.enharmonic = () => {
    const pairs = [[[0, 1], [1, -1]], [[1, 1], [2, -1]], [[3, 1], [4, -1]], [[4, 1], [5, -1]], [[5, 1], [6, -1]]];
    const [a, b] = pick(pairs);
    const correct = noteName(b[0], b[1]);
    const cands = shuffle([[0, -1], [1, -1], [2, -1], [4, -1], [5, -1], [6, -1], [3, 0], [6, 0]].map(([l, x]) => noteName(l, x)).filter((x) => x !== correct)).slice(0, 3);
    const opts = shuffle([correct, ...cands]);
    return { html: `<p>${T({ de: "Welcher Ton klingt genau gleich wie", en: "Which note sounds exactly the same as", es: "¿Qué nota suena exactamente igual que" })} <b>${noteName(a[0], a[1])}</b>?</p>`,
      opts, answer: opts.indexOf(correct), explain: T({ de: "Das nennt man enharmonische Verwechslung: gleicher Ton, anderer Name.", en: "This is called an enharmonic equivalent: same sound, different name.", es: "Se llama enarmonía: mismo sonido, distinto nombre." }) };
  };
  Q.theory3 = () => {
    const items = [
      { q: { de: "Eine chromatische Tonleiter besteht aus …", en: "A chromatic scale consists of …", es: "Una escala cromática está formada por …" },
        o: [{ de: "lauter Halbtonschritten", en: "only semitones", es: "solo semitonos" }, { de: "lauter Ganztonschritten", en: "only whole tones", es: "solo tonos" }, { de: "fünf Tönen", en: "five notes", es: "cinco notas" }, { de: "Dur und Moll gemischt", en: "major and minor mixed", es: "mayor y menor mezclados" }], a: 0 },
      { q: { de: "Wie viele Achtel spielst du bei einer Achteltriole auf einen Viertelschlag?", en: "How many eighth notes are in an eighth-note triplet on one beat?", es: "¿Cuántas corcheas tiene un tresillo de corcheas en un pulso?" },
        o: ["2", "3", "4", "6"], a: 1 },
      { q: { de: "Im Alla-breve-Takt (₵) zählt man in …", en: "In alla breve (₵) you count in …", es: "En alla breve (₵) se cuenta en …" },
        o: [{ de: "Halben (2 Schläge)", en: "half notes (2 beats)", es: "blancas (2 pulsos)" }, { de: "Vierteln (4 Schläge)", en: "quarter notes (4 beats)", es: "negras (4 pulsos)" }, { de: "Achteln", en: "eighth notes", es: "corcheas" }, { de: "Ganzen", en: "whole notes", es: "redondas" }], a: 0 },
      { q: { de: "Eine punktierte Achtel dauert so lang wie …", en: "A dotted eighth note lasts as long as …", es: "Una corchea con puntillo dura lo mismo que …" },
        o: [{ de: "3 Sechzehntel", en: "3 sixteenths", es: "3 semicorcheas" }, { de: "2 Sechzehntel", en: "2 sixteenths", es: "2 semicorcheas" }, { de: "1 Viertel", en: "1 quarter", es: "1 negra" }, { de: "3 Achtel", en: "3 eighths", es: "3 corcheas" }], a: 0 },
    ];
    const it = pick(items);
    const opts = it.o.map((x, i) => ({ x, i }));
    const sh = shuffle(opts);
    return { html: `<p>${T(it.q)}</p>`, opts: sh.map((o) => T(o.x)), answer: sh.findIndex((o) => o.i === it.a) };
  };

  const BY_STUFE = {
    1: ["noteName", "noteName", "noteValue", "beats", "rest", "timeSig", "accidental", "term", "term"],
    2: ["scaleSteps", "halfWhole", "leadingTone", "keySig", "rhythm2", "rhythmRead", "term", "term", "noteName"],
    3: ["interval", "interval", "triad", "minorScale", "enharmonic", "theory3", "rhythmRead", "term", "term"],
  };

  /** 10 Fragen: 70 % aus der gewählten Stufe, 30 % Wiederholung aus tieferen Stufen */
  function makeQuiz(st, n = 10) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const level = st > 1 && Math.random() < 0.3 ? 1 + Math.floor(Math.random() * (st - 1)) : st;
      const g = pick(BY_STUFE[level]);
      const q = Q[g](level);
      q.gen = g; q.level = level;
      out.push(q);
    }
    return out;
  }

  // ---------- Hören ----------
  /** Melodie nachspielen: Stufe 1 = Dreitonraum (C D E), Stufe 2+ = Fünftonraum (C–G) */
  function makeMelody(st) {
    const steps = st >= 2 ? [-2, -1, 0, 1, 2] : [-2, -1, 0];
    const len = st >= 2 ? 5 : 4;
    let seq;
    do {
      seq = [pick(steps)];
      while (seq.length < len) {
        const prev = steps.indexOf(seq[seq.length - 1]);
        const nxt = Math.max(0, Math.min(steps.length - 1, prev + pick([-2, -1, -1, 0, 1, 1, 2])));
        seq.push(steps[nxt]);
      }
      // nicht zu langweilig: mindestens 3 verschiedene Töne (Stufe 1: 2), höchstens eine direkte Wiederholung
    } while (new Set(seq).size < (st >= 2 ? 3 : 2) || seq.filter((x, k) => k && x === seq[k - 1]).length > 1);
    return { keys: steps.map((s) => ({ s, midi: midiOfStep(s), name: noteName(letterOfStep(s)) })), seq: seq.map(midiOfStep) };
  }
  /** Rhythmus (ein 4/4-Takt) */
  function makeRhythm(st) {
    const pool = st >= 3 ? ["q", "ee", "h", "dqe", "ssss", "eqe", "ess", "sse", "trip"] : st >= 2 ? ["q", "ee", "h", "dqe", "ssss", "eqe"] : ["q", "ee", "h", "q", "ee"];
    const R = N().RHY;
    let left = 4; const toks = [];
    while (left > 0) {
      const fit = pool.filter((k) => R[k].len <= left);
      const k = pick(fit); toks.push(k); left -= R[k].len;
    }
    return toks;
  }
  /** Intervall hören (Stufe 3): Dur-Intervalle bis zur Quinte, auf- oder abwärts */
  function makeIntervalEar() {
    const root = pick([60, 62, 65, 67]);
    const d = pick([1, 2, 3, 4]);
    const semis = [0, 2, 4, 5, 7][d];
    const up = Math.random() < 0.5;
    const opts = [1, 2, 3, 4].map((x) => intervalName(x));
    return { midis: up ? [root, root + semis] : [root + semis, root], answer: d - 1, opts, up };
  }
  /** Dur oder Moll hören (Stufe 3) */
  function makeTriadEar() {
    const root = pick([57, 60, 62, 64, 65, 67]);
    const minor = Math.random() < 0.5;
    return { midis: [root, root + (minor ? 3 : 4), root + 7], minor, arpeggio: Math.random() < 0.5,
      opts: [T({ de: "Dur", en: "major", es: "mayor" }), T({ de: "Moll", en: "minor", es: "menor" })], answer: minor ? 1 : 0 };
  }

  window.MUSIK = { TERMS, makeQuiz, makeMelody, makeRhythm, makeIntervalEar, makeTriadEar, noteName };
})();
