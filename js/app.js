/* Lern-Club – App-Logik (ohne Framework, ohne Server). Alle Daten bleiben im localStorage. */
(function () {
  "use strict";

  const STORE_KEY = "lernclub.v1";
  const DAILY_GOAL = 20;
  const EN_BONUS = 1.5;
  const MASCOTS = ["🦘", "🦊", "🐉", "🦉", "🐼", "🤖", "🐙", "🦁", "🐢", "🦄"];
  const COLORS = ["#6c5ce7", "#0984e3", "#00b894", "#e17055", "#d63031", "#e84393", "#fdcb6e", "#2d3436"];
  const LETTERS = ["A", "B", "C", "D", "E"];

  // ---------- Zustand ----------
  const fresh = () => ({
    v: 1,
    onboarded: false,
    profile: { name: "", mascot: "🦘", color: COLORS[0], appName: "Lern-Club", skin: "rookie" },
    school: { weeks: {} },
    music: { level: 1, stats: {}, instrument: "piano" },
    myWhyHistory: [],
    lastBackup: null,
    lang: "de",
    points: 0,
    days: {},
    streak: { count: 0, best: 0, last: null, jokers: 0 },
    kg: {},
    pz: {},
    warum: {},
    club: {},
    journal: [],
    myWhy: "",
    swap: [],
    ideas: [],
    badges: {},
    counters: { en: 0, es: 0, second: 0 },
    es: { words: {}, rules: {}, accent: { ok: 0, total: 0 } },
    idioms: {},
    log: [],
    pin: null,
    missions: null,
    seen: {},
    modLast: {},
    focus: "",
    geo: {},
  });

  let S = load();
  let parentUnlocked = false;

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return fresh();
      return deepMerge(fresh(), JSON.parse(raw));
    } catch (e) {
      return fresh();
    }
  }
  function save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(S));
  }
  function deepMerge(base, add) {
    for (const k of Object.keys(add || {})) {
      if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k]) && add[k] && typeof add[k] === "object" && !Array.isArray(add[k])) {
        base[k] = deepMerge(base[k], add[k]);
      } else {
        base[k] = add[k];
      }
    }
    return base;
  }

  // ---------- Hilfen ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const view = $("#view");

  function t(key, vars) {
    let s = (I18N[S.lang] && I18N[S.lang][key]) || I18N.de[key] || key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split("{" + k + "}").join(v);
    return s;
  }
  const L = (obj) => (obj && typeof obj === "object" && !Array.isArray(obj) ? obj[S.lang] || obj.de : obj);
  const opts = (o) => (Array.isArray(o) ? o : o[S.lang] || o.de);

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function dayKey(d = new Date()) {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }
  function daysBetween(a, b) {
    const pa = a.split("-").map(Number), pb = b.split("-").map(Number);
    return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
  }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function burst(emoji = "⭐") {
    const n = 14;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "burst";
      s.textContent = i % 3 === 0 ? S.profile.mascot : emoji;
      s.style.left = 50 + (Math.random() * 40 - 20) + "vw";
      s.style.setProperty("--dx", Math.random() * 300 - 150 + "px");
      s.style.setProperty("--dy", -(Math.random() * 300 + 150) + "px");
      s.style.animationDelay = Math.random() * 0.15 + "s";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1400);
    }
  }

  // ---------- Punkte, Serie, Abzeichen ----------
  function updateStreak() {
    const today = dayKey();
    const st = S.streak;
    if (st.last === today) return;
    if (!st.last) {
      st.count = 1;
    } else {
      const gap = daysBetween(st.last, today) - 1;
      if (gap <= 0) st.count += 1;
      else if (gap <= st.jokers) {
        st.jokers -= gap;
        st.count += 1;
        setTimeout(() => toast(t("joker.used")), 2700);
      } else st.count = 1;
    }
    st.last = today;
    st.best = Math.max(st.best, st.count);
    if (st.count % 7 === 0) st.jokers = Math.min(2, st.jokers + 1);
  }

  function displayStreak() {
    const st = S.streak;
    if (!st.last) return 0;
    const gap = daysBetween(st.last, dayKey()) - 1;
    if (gap <= 0) return st.count;
    return gap <= st.jokers ? st.count : 0;
  }

  // ---------- Stufen & Skins ----------
  const XP_PER_LEVEL = 100;
  const levelOf = (pts) => Math.floor(pts / XP_PER_LEVEL) + 1;
  const currentSkin = () => SKINS.find((k) => k.id === S.profile.skin && k.level <= levelOf(S.points)) || SKINS[0];
  const avatar = (skin = currentSkin(), o) => avatarSvg(skin, o);
  /** Siegerbildschirm am Ende einer Runde */
  function victoryHtml(line, buttons, ratio = 1) {
    return `<section class="card center victory"><div class="victory-av">${avatar()}</div>
      <h1 class="victory-title">${ratio >= 0.5 ? t("game.victory") : t("game.goodFight")}</h1><p class="punch">${line}</p>${buttons}</section>`;
  }

  // ---------- Module, Tagesmissionen, Fokus der Woche ----------
  /** need = so viele richtige Antworten braucht die Tagesmission */
  const MODULES = [
    { id: "kg", icon: "🦘", tile: "tile.kaenguru", need: 2 },
    { id: "pz", icon: "🧩", tile: "tile.puzzles", need: 1 },
    { id: "warum", icon: "💡", tile: "tile.warum", need: 1 },
    { id: "club", icon: "🏛️", tile: "tile.club", need: 2 },
    { id: "es", icon: "🇪🇸", tile: "tile.es", need: 6 },
    { id: "musik", icon: "🎵", tile: "tile.music", need: 4 },
    { id: "sprueche", icon: "💬", tile: "tile.idioms", need: 3 },
    { id: "karten", icon: "🗺️", tile: "tile.maps", need: 8 },
  ];
  const CHEST = 15;

  /** Inhalte pro Modul: Liste mit festen ids + «erledigt». Grundlage für Fortschritt und das NEU!-Abzeichen.
      (Musik hat keine feste Liste, die Fragen werden erzeugt.) */
  const CONTENT = {
    warum: { items: () => WARUM, done: (x) => !!S.warum[x.id] },
    kg: { items: () => KAENGURU, done: (k) => kgDone(k) === k.answers.length },
    pz: { items: () => PUZZLES, done: (p) => !!(S.pz[p.id] && S.pz[p.id].done) },
    club: { items: () => CLUB, done: (x) => !!S.club[x.id] },
    sprueche: { items: () => IDIOMS, done: (x) => ((S.idioms[x.id] || {}).ok || 0) >= 3 },
    es: {
      items: () => ES_VOCAB.map((th) => ({ id: "v:" + th.id, th })).concat(ES_RULES.map((r) => ({ id: "r:" + r.id, r }))),
      done: (x) => (x.th ? x.th.words.every((w, i) => (S.es.words[x.th.id + ":" + i] || {}).box >= 3) : !!(S.es.rules[x.r.id] && S.es.rules[x.r.id].done)),
    },
    karten: { items: () => Object.keys(MAPS).map((id) => ({ id })), done: (x) => !!(S.geo[x.id] && S.geo[x.id].best) },
  };
  /** Beim allerersten Start gilt alles Vorhandene als «gesehen» – NEU! erscheint nur für später ergänzte Inhalte. */
  function initSeen() {
    let changed = false;
    for (const [mod, c] of Object.entries(CONTENT)) {
      if (!S.seen[mod]) { S.seen[mod] = {}; c.items().forEach((x) => (S.seen[mod][x.id] = 1)); changed = true; }
    }
    if (changed) save();
  }
  const isNew = (mod, id) => !(S.seen[mod] && S.seen[mod][id]);
  const newIds = (mod, pre = "") => CONTENT[mod].items().filter((x) => x.id.startsWith(pre) && isNew(mod, x.id) && !CONTENT[mod].done(x)).map((x) => x.id);
  /** Für Listen-Seiten: gibt die neuen ids zurück und merkt sie als gesehen (NEU! steht also beim ersten Besuch dran). */
  function takeNew(mod, pre = "") {
    const ids = newIds(mod, pre);
    if (ids.length) { ids.forEach((id) => (S.seen[mod][id] = 1)); save(); }
    return new Set(ids);
  }
  const newTag = (set, id) => (set.has(id) ? `<span class="new-tag">${t("new.tag")}</span>` : "");
  function progressOf(mod) {
    const c = CONTENT[mod]; if (!c) return null;
    const items = c.items();
    return { done: items.filter(c.done).length, total: items.length };
  }
  const modById = (id) => MODULES.find((m) => m.id === id);
  const currentModule = () => { const top = location.hash.replace(/^#/, "").split("/")[1] || ""; return modById(top) ? top : null; };

  /** Drei Missionen pro Tag: die zwei am längsten nicht geübten Module + eines per Zufall. Der Wochenfokus ist immer dabei. */
  function todayMissions() {
    const today = dayKey();
    if (!S.missions || S.missions.day !== today) {
      const order = shuffle(MODULES.slice()).sort((a, b) => (S.modLast[a.id] || "").localeCompare(S.modLast[b.id] || ""));
      const pick = order.slice(0, 2);
      const rest = order.slice(2);
      pick.push(rest[Math.floor(Math.random() * rest.length)]);
      if (S.focus && modById(S.focus) && !pick.some((m) => m.id === S.focus)) pick[2] = modById(S.focus);
      S.missions = { day: today, list: pick.map((m) => ({ mod: m.id, need: m.need, have: 0 })), chest: false };
      save();
    }
    return S.missions;
  }

  function trackMission(mod) {
    const ms = todayMissions();
    const m = ms.list.find((x) => x.mod === mod);
    if (!m || m.have >= m.need) return;
    m.have += 1;
    if (m.have === m.need) setTimeout(() => { toast(t("mis.done", { mod: t(modById(mod).tile) })); burst("🎯"); }, 1800);
    if (!ms.chest && ms.list.every((x) => x.have >= x.need)) {
      ms.chest = true;
      setTimeout(() => { award(CHEST, false, true); toast(t("mis.chestOpen", { n: CHEST })); burst("🎁"); }, 3400);
    }
  }

  /** Vergibt Punkte. quiz=true → Sprachen-Bonus (Englisch/Spanisch) möglich. raw=true → kein Fokus, zählt nicht für Missionen. */
  function award(base, quiz, raw = false) {
    let pts = base;
    if (quiz && S.lang !== "de") {
      pts = Math.round(base * EN_BONUS);
      S.counters[S.lang] = (S.counters[S.lang] || 0) + 1;
    }
    const mod = raw ? null : currentModule();
    if (mod && S.focus === mod) pts *= 2;
    if (mod) { S.modLast[mod] = dayKey(); trackMission(mod); }
    const today = dayKey();
    const before = S.days[today] || 0;
    const lvlBefore = levelOf(S.points);
    S.points += pts;
    const lvlAfter = levelOf(S.points);
    if (lvlAfter > lvlBefore) {
      const newSkins = SKINS.filter((k) => k.level > lvlBefore && k.level <= lvlAfter);
      setTimeout(() => {
        toast(t("game.levelUp", { n: lvlAfter }) + (newSkins.length ? " " + t("game.newSkin", { s: L(newSkins[0].name) }) : ""));
        burst("⚡");
      }, 1500);
    }
    S.days[today] = before + pts;
    updateStreak();
    if (before < DAILY_GOAL && S.days[today] >= DAILY_GOAL) {
      setTimeout(() => { toast(t("home.goalDone")); burst("🎉"); }, 1200);
    }
    checkBadges();
    save();
    updateHeader();
    return pts;
  }

  const BADGES = [
    { id: "first", icon: "👣", test: () => S.points > 0 },
    { id: "streak3", icon: "🔥", test: () => S.streak.best >= 3 },
    { id: "streak7", icon: "🏆", test: () => S.streak.best >= 7 },
    { id: "writer", icon: "✍️", test: () => S.journal.length >= 5 },
    { id: "english", icon: "🇬🇧", test: () => S.counters.en >= 10 },
    { id: "spanish", icon: "🇪🇸", test: () => (S.counters.es || 0) >= 10 },
    { id: "vocab", icon: "📚", test: () => Object.values(S.es.words).filter((w) => w.box >= 3).length >= 50 },
    { id: "club5", icon: "🏛️", test: () => Object.keys(S.club).length >= 5 },
    { id: "kgFull", icon: "🦘", test: () => KAENGURU.some((k) => kgDone(k) === k.answers.length) },
    { id: "teacher", icon: "🧑‍🏫", test: () => S.swap.length >= 5 },
    { id: "persist", icon: "💪", test: () => S.counters.second >= 10 },
  ];
  function checkBadges() {
    for (const b of BADGES) {
      if (!S.badges[b.id] && b.test()) {
        S.badges[b.id] = dayKey();
        setTimeout(() => { toast(t("badge.new", { b: b.icon + " " + t("badge." + b.id) })); burst(b.icon); }, 900);
      }
    }
  }

  function updateHeader() {
    $("#stat-points").textContent = "⭐ " + S.points;
    $("#stat-level").textContent = "⚡ " + levelOf(S.points);
    $("#stat-streak").textContent = "🔥 " + displayStreak();
    $("#lang-toggle").textContent = S.lang.toUpperCase();
    $("#brand-mascot").textContent = S.profile.mascot;
    $("#brand-name").textContent = S.profile.appName || "Lern-Club";
    document.title = S.profile.appName || "Lern-Club";
    document.documentElement.lang = S.lang;
    document.documentElement.style.setProperty("--accent", S.profile.color);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", S.profile.color);
    $$("[data-t]").forEach((el) => (el.textContent = t(el.dataset.t)));
  }

  // ---------- Gemeinsamer Antwort-Mechanismus ----------
  /** rec: {tries, ok, done}. Gibt {result, pts} zurück. */
  function answer(rec, correct, base, bonus = true) {
    rec.tries = (rec.tries || 0) + 1;
    if (correct) {
      const pts = award(rec.tries === 1 ? base : Math.ceil(base / 2), bonus);
      if (rec.tries === 2) S.counters.second += 1;
      rec.ok = true; rec.done = true; rec.pts = pts; rec.lang = S.lang;
      save();
      return { result: rec.tries === 1 ? "right" : "rightSecond", pts };
    }
    if (rec.tries >= 2) {
      rec.ok = false; rec.done = true;
      save();
      return { result: "wrongFinal", pts: 0 };
    }
    save();
    return { result: "wrong", pts: 0 };
  }

  /** Merkt sich Fehler für den Entwicklungsbericht (max. 500 Einträge). */
  function logMistake(area, item, expected, given) {
    S.log.push({ d: new Date().toISOString().slice(0, 16), lang: S.lang, area, item, expected: String(expected), given: String(given) });
    if (S.log.length > 500) S.log.splice(0, S.log.length - 500);
    save();
  }

  function cheer() {
    const c = { en: ["Awesome!", "Brain power!", "Nailed it!", "Yes!"], es: ["¡Genial!", "¡Crack!", "¡Exacto!", "¡Bravo!"], de: ["Stark!", "Hirn an!", "Genau!", "Super!"] }[S.lang];
    return c[Math.floor(Math.random() * c.length)];
  }

  // ---------- Router ----------
  const routes = [];
  const route = (pattern, fn) => routes.push({ re: new RegExp("^" + pattern.replace(/:(\w+)/g, "([^/]+)") + "$"), fn });

  function render() {
    initSeen();
    updateHeader();
    const hash = location.hash.replace(/^#/, "") || "/";
    if (!S.onboarded) return renderOnboarding();
    for (const r of routes) {
      const m = hash.match(r.re);
      if (m) {
        r.fn(...m.slice(1).map(decodeURIComponent));
        const top = hash.split("/")[1] || "home";
        const navMap = { "": "home", learn: "learn", kg: "learn", pz: "learn", warum: "learn", journal: "learn", swap: "learn", ideas: "learn", es: "learn", sprueche: "learn", musik: "learn", karten: "learn", woche: "learn", archiv: "learn", club: "club", me: "me", locker: "me", parents: "me" };
        $$("#bottomnav a").forEach((a) => a.classList.toggle("active", a.dataset.nav === (navMap[top] || "home")));
        view.focus({ preventScroll: true });
        window.scrollTo(0, 0);
        return;
      }
    }
    location.hash = "#/";
  }

  // ---------- Onboarding ----------
  function renderOnboarding() {
    $("#bottomnav").hidden = true;
    let mascot = S.profile.mascot, color = S.profile.color;
    view.innerHTML = `
      <section class="card center">
        <div class="big-mascot" id="onb-m">${mascot}</div>
        <h1>${t("onb.title")}</h1>
        <p>${t("onb.text")}</p>
        <label class="field">${t("me.nickname")}<input id="onb-name" maxlength="20" autocomplete="off" value="${esc(S.profile.name)}"></label>
        <p class="label">${t("me.mascot")}</p>
        <div class="choices" id="onb-mascots">${MASCOTS.map((m) => `<button class="choice ${m === mascot ? "sel" : ""}" data-m="${m}">${m}</button>`).join("")}</div>
        <p class="label">${t("me.color")}</p>
        <div class="choices" id="onb-colors">${COLORS.map((c) => `<button class="swatch ${c === color ? "sel" : ""}" data-c="${c}" style="background:${c}" aria-label="${c}"></button>`).join("")}</div>
        <button class="btn primary big" id="onb-go">${t("onb.start")}</button>
      </section>`;
    $("#onb-mascots").onclick = (e) => {
      const b = e.target.closest("[data-m]"); if (!b) return;
      mascot = b.dataset.m; $$("#onb-mascots .choice").forEach((x) => x.classList.toggle("sel", x === b)); $("#onb-m").textContent = mascot;
    };
    $("#onb-colors").onclick = (e) => {
      const b = e.target.closest("[data-c]"); if (!b) return;
      color = b.dataset.c; $$("#onb-colors .swatch").forEach((x) => x.classList.toggle("sel", x === b));
      document.documentElement.style.setProperty("--accent", color);
    };
    $("#onb-go").onclick = () => {
      S.profile.name = $("#onb-name").value.trim() || "Champ";
      S.profile.mascot = mascot; S.profile.color = color; S.onboarded = true;
      save(); $("#bottomnav").hidden = false; location.hash = "#/"; render();
    };
  }

  // ---------- Start ----------
  route("/", () => {
    const today = S.days[dayKey()] || 0;
    const pct = Math.min(100, Math.round((today / DAILY_GOAL) * 100));
    const favs = IDIOMS.filter((x) => S.idioms[x.id] && S.idioms[x.id].fav).map((x) => x[S.lang]);
    const list = PUNCHLINES[S.lang].concat(favs, favs);
    const idx = daysBetween("2026-01-01", dayKey()) % list.length;
    const line = list[(idx + list.length) % list.length];
    view.innerHTML = `
      <section class="hero">
        <div class="mascot-bubble"><a class="hero-av" href="#/locker">${avatar()}</a>
          <div class="bubble"><small>${t("home.today")}</small><p>«${esc(line)}»</p></div></div>
        <h1>${t("hello", { name: esc(S.profile.name) })}</h1>
        ${levelBarHtml()}
        ${weekBannerHtml()}
        <div class="goal"><div class="goal-head"><span>${t("home.goal")}</span><span>${Math.min(today, DAILY_GOAL)} / ${DAILY_GOAL} ⭐</span></div>
          <div class="bar"><div style="width:${pct}%"></div></div>
          <small>🔥 ${t("home.streak", { n: displayStreak() })} · 🃏 ${t("home.jokers", { n: S.streak.jokers })}</small></div>
      </section>
      ${openHomeworkHtml()}
      ${focusBannerHtml()}
      ${missionsHtml()}
      ${S.lang !== "de" ? `<p class="note en">${t("enBonusActive")}</p>` : ""}
      <div class="tiles">
        ${tile("#/warum", "💡", "tile.warum")}
        ${tile("#/woche", "🗓️", "tile.week")}
        ${tile("#/kg", "🦘", "tile.kaenguru")}
        ${tile("#/pz", "🧩", "tile.puzzles")}
        ${tile("#/club", "🏛️", "tile.club")}
        ${tile("#/es", "🇪🇸", "tile.es")}
        ${tile("#/musik", "🎵", "tile.music")}
        ${tile("#/sprueche", "💬", "tile.idioms")}
        ${tile("#/karten", "🗺️", "tile.maps")}
        ${tile("#/archiv", "⏳", "tile.archive")}
      </div>`;
    bindHomework();
  });

  function tile(href, icon, key, extra = "") {
    const mod = href.split("/")[1];
    const isModTile = /^#\/[a-z]+$/.test(href);
    const focus = S.focus && href === "#/" + S.focus;
    const fresh = isModTile && CONTENT[mod] && newIds(mod).length > 0;
    const pr = isModTile ? progressOf(mod) : null;
    const prog = pr && pr.total ? `<span class="tile-prog ${pr.done === pr.total ? "full" : ""}">${pr.done === pr.total ? "🏁 " + t("new.allDone") : `✅ ${pr.done}/${pr.total}`}</span>` : "";
    return `<a class="tile ${focus ? "focus" : ""} ${fresh ? "fresh" : ""}" href="${href}">${focus ? `<span class="ribbon">${t("focus.badge")}</span>` : ""}${fresh ? `<span class="ribbon new">${t("new.badge")}</span>` : ""}<span class="tile-icon">${icon}</span><span><b>${t(key)}</b><small>${t(key + ".sub")}</small>${prog}${extra}</span></a>`;
  }

  function focusBannerHtml() {
    const m = S.focus && modById(S.focus);
    return m ? `<a class="focus-banner" href="#/${m.id}">🎯 ${t("focus.banner", { mod: m.icon + " " + t(m.tile) })}</a>` : "";
  }

  function missionsHtml() {
    const ms = todayMissions();
    const all = ms.list.every((x) => x.have >= x.need);
    return `<section class="card missions"><div class="row"><h2>🎯 ${t("mis.title")}</h2><span class="chest ${all ? "open" : ""}">${all ? "🎉" : "🎁"}</span></div>
      ${ms.list.map((x) => {
        const m = modById(x.mod), ok = x.have >= x.need;
        return `<a class="mission ${ok ? "done" : ""}" href="#/${m.id}"><span class="m-icon">${ok ? "✅" : m.icon}</span>
          <span class="m-body"><b>${t("mis.do", { n: x.need, mod: t(m.tile) })}</b><span class="bar small"><span style="width:${Math.round((Math.min(x.have, x.need) / x.need) * 100)}%"></span></span></span>
          <span class="m-count">${Math.min(x.have, x.need)}/${x.need}</span></a>`;
      }).join("")}
      <small class="fine">${all ? t("mis.chestOpen", { n: CHEST }) : t("mis.chest", { n: CHEST })}</small></section>`;
  }

  route("/learn", () => {
    view.innerHTML = `
      <h1>${t("learn.title")}</h1>
      <p class="note en">${S.lang !== "de" ? t("enBonusActive") : t("enBonus")}</p>
      <div class="tiles">
        ${tile("#/warum", "💡", "tile.warum")}
        ${tile("#/kg", "🦘", "tile.kaenguru")}
        ${tile("#/pz", "🧩", "tile.puzzles")}
        ${tile("#/es", "🇪🇸", "tile.es")}
        ${tile("#/musik", "🎵", "tile.music")}
        ${tile("#/sprueche", "💬", "tile.idioms")}
        ${tile("#/karten", "🗺️", "tile.maps")}
        ${tile("#/woche", "🗓️", "tile.week")}
        ${tile("#/journal", "📓", "tile.journal")}
        ${tile("#/archiv", "⏳", "tile.archive")}
        ${tile("#/swap", "🔄", "tile.swap")}
        ${tile("#/ideas", "📮", "tile.ideas")}
      </div>`;
  });

  // ---------- Känguru ----------
  const kgRec = (id) => (S.kg[id] = S.kg[id] || {});
  const kgDone = (k) => Object.values(S.kg[k.id] || {}).filter((r) => r.done).length;

  route("/kg", () => {
    const nw = takeNew("kg");
    const group = (lvl) => KAENGURU.filter((k) => k.level === lvl).map((k) => {
      const d = kgDone(k), n = k.answers.length;
      return `<a class="tile slim" href="#/kg/${k.id}"><span class="tile-icon">${d === n ? "🏅" : "🦘"}</span>
        <span><b>Känguru ${k.year} · ${k.level}${newTag(nw, k.id)}</b><small>${t("kg.solved", { a: d, b: n })}</small>
        <span class="bar small"><span style="width:${Math.round((d / n) * 100)}%"></span></span></span></a>`;
    }).join("");
    view.innerHTML = `
      <a class="back" href="#/learn">← ${t("back")}</a>
      <h1>🦘 ${t("kg.title")}</h1>
      <p>${t("kg.intro")}</p>
      <p class="note en">${S.lang !== "de" ? t("enBonusActive") : t("enBonus")}</p>
      <h2>${t("kg.warmup")}</h2><div class="tiles one">${group("3/4")}</div>
      <h2>${t("kg.main")}</h2><div class="tiles one">${group("5/6")}</div>
      <p class="fine">${t("kg.copyright")}</p>`;
  });

  route("/kg/:id", (id) => {
    const k = KAENGURU.find((x) => x.id === id);
    if (!k) return (location.hash = "#/kg");
    const rec = kgRec(id);
    let open = null;

    function draw() {
      const d = kgDone(k), n = k.answers.length;
      view.innerHTML = `
        <a class="back" href="#/kg">← ${t("back")}</a>
        <h1>Känguru ${k.year} · ${k.level}</h1>
        <a class="btn primary big" href="${k.pdf[S.lang] || k.pdf.de}" target="_blank" rel="noopener">${t("kg.open")} (${k.pdf[S.lang] ? S.lang.toUpperCase() : "DE"})</a>
        ${S.lang === "en" ? `<p class="note en">${t("enBonusActive")}</p>` : S.lang === "es" ? `<p class="note">${t("kg.noEs")}</p>` : ""}
        <div class="goal"><div class="goal-head"><span>${t("kg.solved", { a: d, b: n })}</span></div>
          <div class="bar"><div style="width:${Math.round((d / n) * 100)}%"></div></div></div>
        <div class="kg-grid">
          ${k.labels.map((lab, i) => {
            const r = rec[i] || {};
            const cls = r.done ? (r.ok ? "ok" : "fail") : r.tries ? "try" : "";
            return `<button class="kg-cell ${cls} ${open === i ? "open" : ""}" data-i="${i}"><b>${lab}</b><small>${t("kg.pts", { n: k.points[i] })}</small>${r.done ? `<span>${k.answers[i]}</span>` : ""}</button>`;
          }).join("")}
        </div>
        <div id="kg-panel"></div>
        <p class="fine">${t("kg.copyright")}</p>
        <button class="btn ghost" id="kg-reset">${t("kg.reset")}</button>`;

      $$(".kg-cell").forEach((b) => (b.onclick = () => { open = Number(b.dataset.i); draw(); $("#kg-panel").scrollIntoView({ behavior: "smooth", block: "nearest" }); }));
      $("#kg-reset").onclick = () => { if (confirm(t("kg.resetConfirm"))) { S.kg[id] = {}; save(); draw(); } };
      if (open !== null) drawPanel(open);
    }

    function drawPanel(i) {
      const r = (rec[i] = rec[i] || {});
      const panel = $("#kg-panel");
      const head = `<h2>${t("kg.task", { n: k.labels[i] })} · ${t("kg.pts", { n: k.points[i] })}</h2>`;
      if (r.done) {
        panel.innerHTML = `<div class="card">${head}<p class="${r.ok ? "good" : "bad"}">${r.ok ? "✅ " + k.answers[i] : t("wrongFinal", { x: k.answers[i] })}</p></div>`;
        return;
      }
      panel.innerHTML = `<div class="card">${head}
        <div class="letters">${LETTERS.map((l) => `<button class="letter ${r.wrong === l ? "wrong" : ""}" data-l="${l}" ${r.wrong === l ? "disabled" : ""}>${l}</button>`).join("")}</div>
        <p id="kg-msg" class="msg">${r.tries ? t("wrong") : ""}</p></div>`;
      $$(".letter", panel).forEach((b) => (b.onclick = () => {
        const l = b.dataset.l;
        const res = answer(r, l === k.answers[i], k.points[i], S.lang === "en");
        if (!res.pts && res.result === "wrong") r.wrong = l;
        save();
        if (res.result === "right" || res.result === "rightSecond") {
          toast(cheer() + " " + t(res.result, { n: res.pts })); burst();
          const nextOpen = k.answers.findIndex((_, j) => !(rec[j] && rec[j].done));
          open = nextOpen >= 0 ? nextOpen : null;
        } else if (res.result === "wrongFinal") toast(t("wrongFinal", { x: k.answers[i] }));
        if (!res.pts) logMistake("kaenguru", `${k.id} Aufgabe ${k.labels[i]} (${k.points[i]} P.)`, k.answers[i], l);
        draw();
      }));
    }
    draw();
  });

  // ---------- Knobel-Werkstatt ----------
  route("/pz", () => {
    const nw = takeNew("pz");
    view.innerHTML = `
      <a class="back" href="#/learn">← ${t("back")}</a>
      <h1>🧩 ${t("pz.title")}</h1><p>${t("pz.intro")}</p>
      <p class="note en">${S.lang !== "de" ? t("enBonusActive") : t("enBonus")}</p>
      <div class="kg-grid">${PUZZLES.map((p, i) => {
        const r = S.pz[p.id] || {};
        const cls = r.done ? (r.ok ? "ok" : "fail") : r.tries ? "try" : "";
        return `<a class="kg-cell ${cls} ${nw.has(p.id) ? "fresh" : ""}" href="#/pz/${i}"><b>${i + 1}</b><small>${t("kg.pts", { n: p.pts })}</small></a>`;
      }).join("")}</div>`;
  });

  route("/pz/:i", (iStr) => {
    const i = Number(iStr), p = PUZZLES[i];
    if (!p) return (location.hash = "#/pz");
    const r = (S.pz[p.id] = S.pz[p.id] || {});
    const o = opts(p.opts);
    function draw(msg) {
      view.innerHTML = `
        <a class="back" href="#/pz">← ${t("back")}</a>
        <div class="card">
          <div class="row"><b>${i + 1} / ${PUZZLES.length}</b><span class="pill">${t("kg.pts", { n: p.pts })}</span></div>
          <p class="question">${esc(L(p.q))}</p>
          <div class="options">${o.map((txt, j) => {
            let cls = "";
            if (r.done && j === p.answer) cls = "right";
            else if (r.wrong === j) cls = "wrong";
            return `<button class="option ${cls}" data-j="${j}" ${r.done || r.wrong === j ? "disabled" : ""}><b>${LETTERS[j]}</b> ${esc(txt)}</button>`;
          }).join("")}</div>
          <p class="msg">${msg || (r.tries && !r.done ? t("wrong") : "")}</p>
          ${r.done ? `<details open class="explain"><summary>${t("explain")}</summary><p>${esc(L(p.explain))}</p></details>` : ""}
        </div>
        <div class="row">
          ${i > 0 ? `<a class="btn ghost" href="#/pz/${i - 1}">← ${t("back")}</a>` : "<span></span>"}
          ${i < PUZZLES.length - 1 ? `<a class="btn primary" href="#/pz/${i + 1}">${t("next")} →</a>` : `<a class="btn primary" href="#/pz">${t("done")}</a>`}
        </div>`;
      $$(".option").forEach((b) => (b.onclick = () => {
        const j = Number(b.dataset.j);
        const res = answer(r, j === p.answer, p.pts);
        if (res.result === "wrong") { r.wrong = j; save(); }
        if (!res.pts) logMistake("knobeln", p.id, LETTERS[p.answer], LETTERS[j]);
        if (res.pts) { burst(); toast(cheer() + " " + t(res.result, { n: res.pts })); }
        draw(res.result === "wrongFinal" ? t("wrongFinal", { x: LETTERS[p.answer] }) : res.pts ? t(res.result, { n: res.pts }) : "");
      }));
    }
    draw();
  });

  // ---------- Warum Schule ----------
  route("/warum", () => {
    const nw = takeNew("warum");
    view.innerHTML = `
      <a class="back" href="#/learn">← ${t("back")}</a>
      <h1>💡 ${t("warum.title")}</h1><p>${t("warum.intro")}</p>
      <div class="tiles one">${WARUM.map((w) => `
        <a class="tile slim" href="#/warum/${w.id}"><span class="tile-icon">${w.icon}</span>
          <span><b>${esc(L(w.title))}${newTag(nw, w.id)}</b><small>${S.warum[w.id] ? "✅ " + t("warum.read") : esc(L(w.punch))}</small></span></a>`).join("")}
      </div>`;
  });

  route("/warum/:id", (id) => {
    const idx = WARUM.findIndex((x) => x.id === id);
    const w = WARUM[idx];
    if (!w) return (location.hash = "#/warum");
    const prev = S.journal.filter((j) => j.ref === id);
    const next = WARUM[idx + 1];
    view.innerHTML = `
      <a class="back" href="#/warum">← ${t("back")}</a>
      <article class="card warum">
        <div class="warum-icon">${w.icon}</div>
        <h1>${esc(L(w.title))}</h1>
        <p class="punch">«${esc(L(w.punch))}»</p>
        <p>${esc(L(w.story))}</p>
        <p class="fine">${t("warum.source")}: ${esc(w.source)}</p>
      </article>
      <section class="card">
        <h2>✍️ ${t("warum.yourTurn")}</h2>
        <p><b>${esc(L(w.prompt))}</b></p>
        <textarea id="w-text" rows="4" placeholder="${t("warum.placeholder")}"></textarea>
        <button class="btn primary" id="w-save">${t("save")}</button>
        ${prev.length ? `<div class="entries">${prev.map(entryHtml).join("")}</div>` : ""}
      </section>
      ${next ? `<a class="btn ghost" href="#/warum/${next.id}">${next.icon} ${esc(L(next.title))} →</a>` : ""}`;
    $("#w-save").onclick = () => {
      const text = $("#w-text").value.trim();
      if (!text) return;
      const first = !S.warum[id];
      S.journal.unshift({ id: Date.now(), date: new Date().toISOString(), kind: "warum", ref: id, prompt: L(w.prompt), text });
      S.warum[id] = true;
      const pts = first ? award(5, false) : 0;
      checkBadges(); save();
      toast(first ? t("warum.saved", { n: pts }) : "✅");
      if (first) burst("💡");
      location.hash = "#/warum/" + id; render();
    };
  });

  function entryHtml(e) {
    const d = new Date(e.date);
    return `<div class="entry"><small>${d.toLocaleDateString({ en: "en-GB", es: "es-VE" }[S.lang] || "de-CH")}${e.prompt ? " · " + esc(e.prompt) : ""}</small><p>${esc(e.text)}</p></div>`;
  }
  function words(s) { return (s.match(/\S+/g) || []).length; }

  // ---------- Tagebuch / Mein Warum ----------
  route("/journal", () => {
    view.innerHTML = `
      <a class="back" href="#/learn">← ${t("back")}</a>
      <h1>📓 ${t("journal.title")}</h1>
      <p>${t("journal.intro")}</p>
      <section class="card">
        <h2>⭐ ${t("journal.my")}</h2>
        <textarea id="j-why" rows="3" placeholder="${t("journal.myPlaceholder")}">${esc(S.myWhy)}</textarea>
        <button class="btn primary" id="j-why-save">${t("save")}</button>
      </section>
      <section class="card">
        <h2>✍️ ${t("journal.free")}</h2>
        <textarea id="j-text" rows="5" placeholder="${t("journal.freePlaceholder")}"></textarea>
        <button class="btn primary" id="j-save">${t("save")}</button>
        <p class="fine">🔒 ${t("journal.parentsNote")}</p>
      </section>
      <h2>${t("journal.entries")}</h2>
      <div class="entries">${S.journal.length ? S.journal.map(entryHtml).join("") : `<p>${t("journal.none")}</p>`}</div>`;
    $("#j-why-save").onclick = () => {
      const v = $("#j-why").value.trim();
      const first = !S.myWhy && v;
      if (v && v !== S.myWhy) S.myWhyHistory.push({ date: new Date().toISOString(), text: v });
      S.myWhy = v; save();
      if (first) { const pts = award(10, false); toast(t("warum.saved", { n: pts })); burst("⭐"); } else toast("✅");
    };
    $("#j-save").onclick = () => {
      const text = $("#j-text").value.trim();
      if (!text) return;
      const today = dayKey();
      const firstToday = !S.journal.some((e) => e.kind === "free" && dayKey(new Date(e.date)) === today);
      S.journal.unshift({ id: Date.now(), date: new Date().toISOString(), kind: "free", text });
      const pts = firstToday ? award(5, false) : 0;
      checkBadges(); save();
      toast(pts ? t("warum.saved", { n: pts }) : "✅");
      render();
    };
  });

  // ---------- Club ----------
  function rankInfo() {
    const n = Object.keys(S.club).length;
    let cur = CLUB_RANKS[0], nxt = null;
    for (const r of CLUB_RANKS) { if (n >= r.min) cur = r; else { nxt = r; break; } }
    return { n, cur, nxt };
  }

  route("/club", () => {
    const { n, cur, nxt } = rankInfo();
    const nw = takeNew("club");
    const cats = Object.keys(CLUB_CATEGORIES);
    view.innerHTML = `
      <h1>🏛️ ${t("club.title")}</h1>
      <p>${t("club.intro")}</p>
      <section class="card member">
        <div class="member-card" style="--accent:${S.profile.color}">
          <div><small>${t("club.rank")}</small><h2>${cur.icon} ${esc(L(cur))}</h2>
          <p>${esc(S.profile.name)} ${S.profile.mascot}</p></div>
          <div class="member-count">${t("club.cards", { a: n, b: CLUB.length })}</div>
        </div>
        ${nxt ? `<small>${t("club.next", { n: nxt.min - n, r: L(nxt) })}</small>` : ""}
      </section>
      ${cats.map((c) => {
        const cards = CLUB.filter((x) => x.cat === c);
        return `<h2>${CLUB_CATEGORIES[c].icon} ${esc(L(CLUB_CATEGORIES[c]))}</h2>
        <div class="album">${cards.map((x) => `<a class="club-card ${S.club[x.id] ? "got" : ""} ${nw.has(x.id) ? "fresh" : ""}" href="#/club/${x.id}">
          <span class="cc-icon">${S.club[x.id] ? x.icon : "❔"}</span><small>${esc(L(x.title))}</small></a>`).join("")}</div>`;
      }).join("")}`;
  });

  route("/club/:id", (id) => {
    const x = CLUB.find((c) => c.id === id);
    if (!x) return (location.hash = "#/club");
    const got = !!S.club[id];
    const rec = { tries: 0 };
    const o = opts(x.opts);
    function draw(msg, wrongJ) {
      view.innerHTML = `
        <a class="back" href="#/club">← ${t("back")}</a>
        <article class="card club-detail">
          <div class="warum-icon">${x.icon}</div>
          <small>${CLUB_CATEGORIES[x.cat].icon} ${esc(L(CLUB_CATEGORIES[x.cat]))}</small>
          <h1>${esc(L(x.title))}</h1>
          <p>${esc(L(x.text))}</p>
          <div class="seen"><b>👀 ${t("club.seen")}</b><p>${esc(L(x.seen))}</p></div>
        </article>
        <section class="card">
          <h2>🎟️ ${t("club.question")}</h2>
          <p class="question">${esc(L(x.q))}</p>
          <div class="options">${o.map((txt, j) => `<button class="option ${(S.club[id] && j === x.answer) ? "right" : ""} ${wrongJ === j ? "wrong" : ""}" data-j="${j}" ${S.club[id] ? "disabled" : ""}><b>${LETTERS[j]}</b> ${esc(txt)}</button>`).join("")}</div>
          <p class="msg">${msg || (got ? "✅" : "")}</p>
        </section>`;
      $$(".option").forEach((b) => (b.onclick = () => {
        const j = Number(b.dataset.j);
        if (j === x.answer) {
          S.club[id] = dayKey();
          const pts = award(rec.tries === 0 ? 5 : 3, true);
          toast(t("club.unlocked", { n: pts })); burst(x.icon);
          draw(t("club.unlocked", { n: pts }));
        } else {
          rec.tries++;
          logMistake("club", id, o[x.answer], o[j]);
          draw(t("wrong"), j);
        }
      }));
    }
    draw();
  });

  // ---------- Rollentausch-Quiz ----------
  route("/swap", () => {
    view.innerHTML = `
      <a class="back" href="#/learn">← ${t("back")}</a>
      <h1>🔄 ${t("swap.title")}</h1><p>${t("swap.intro")}</p>
      <section class="card">
        <label class="field">${t("swap.q")}<input id="s-q" maxlength="200"></label>
        <label class="field">${t("swap.a")}<input id="s-a" maxlength="200"></label>
        <button class="btn primary" id="s-add">${t("swap.add")}</button>
      </section>
      ${S.swap.length ? `<a class="btn primary big" href="#/swap/play">${t("swap.play")}</a>` : ""}
      <h2>${t("swap.list")}</h2>
      <div class="entries">${S.swap.length ? S.swap.map((q, i) => `<div class="entry row"><span><b>${esc(q.q)}</b><br><small>→ ${esc(q.a)}</small></span><button class="btn ghost small" data-del="${i}" aria-label="${t("delete")}">🗑️</button></div>`).join("") : `<p>${t("swap.none")}</p>`}</div>`;
    $("#s-add").onclick = () => {
      const q = $("#s-q").value.trim(), a = $("#s-a").value.trim();
      if (!q || !a) return;
      S.swap.push({ q, a, date: new Date().toISOString() });
      const pts = award(3, false);
      checkBadges(); save();
      toast(t("swap.added", { n: pts }));
      render();
    };
    $$("[data-del]").forEach((b) => (b.onclick = () => { S.swap.splice(Number(b.dataset.del), 1); save(); render(); }));
  });

  route("/swap/play", () => {
    if (!S.swap.length) return (location.hash = "#/swap");
    const qs = S.swap.slice().sort(() => Math.random() - 0.5);
    let i = 0, ok = 0, shown = false;
    function draw() {
      if (i >= qs.length) {
        view.innerHTML = victoryHtml(t("swap.result", { a: ok, b: qs.length }), `<a class="btn primary" href="#/swap">${t("done")}</a>`);
        burst("🧑‍🏫");
        return;
      }
      const q = qs[i];
      view.innerHTML = `
        <a class="back" href="#/swap">← ${t("back")}</a>
        <section class="card center">
          <small>${i + 1} / ${qs.length}</small>
          <p class="question">${esc(q.q)}</p>
          ${shown ? `<p class="punch">${esc(q.a)}</p>
            <div class="row"><button class="btn good" id="sp-ok">${t("swap.gotIt")}</button><button class="btn bad" id="sp-no">${t("swap.missed")}</button></div>`
            : `<button class="btn primary big" id="sp-show">${t("swap.show")}</button>`}
        </section>`;
      if (!shown) $("#sp-show").onclick = () => { shown = true; draw(); };
      else {
        $("#sp-ok").onclick = () => { ok++; i++; shown = false; draw(); };
        $("#sp-no").onclick = () => { i++; shown = false; draw(); };
      }
    }
    draw();
  });

  // ---------- Ideen-Box ----------
  route("/ideas", () => {
    view.innerHTML = `
      <a class="back" href="#/learn">← ${t("back")}</a>
      <h1>📮 ${t("ideas.title")}</h1><p>${t("ideas.intro")}</p>
      <section class="card">
        <textarea id="i-text" rows="4" placeholder="${t("ideas.placeholder")}"></textarea>
        <button class="btn primary" id="i-send">${t("ideas.send")}</button>
      </section>
      <div class="entries">${S.ideas.map(entryHtml).join("")}</div>`;
    $("#i-send").onclick = () => {
      const text = $("#i-text").value.trim();
      if (!text) return;
      S.ideas.unshift({ id: Date.now(), date: new Date().toISOString(), text });
      save(); toast(t("ideas.thanks")); burst("💡"); render();
    };
  });

  // ---------- Spanisch ----------
  const ES_INTERVAL = [0, 0, 1, 3, 7, 14]; // Tage bis zur nächsten Wiederholung je Kiste
  const ES_KEYS = ["á", "é", "í", "ó", "ú", "ü", "ñ", "¿", "¡"];
  const ARTICLE = /^(el|la|los|las|un|una) /;
  const esNorm = (s) => String(s).normalize("NFC").toLowerCase().replace(/[¿?¡!.,;:]/g, "").replace(/\s+/g, " ").trim();
  const esStrip = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const esShow = (w) => w[0].split("|")[0];
  const esMeaning = (w) => (S.lang === "en" ? w[2] : w[1]);
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return dayKey(d); };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /** Prüft eine geschriebene Antwort: ok | accent | article | wrong */
  function esCheck(input, answer) {
    const u = esNorm(input), alts = answer.split("|").map(esNorm);
    if (!u) return { res: "wrong", a: alts[0] };
    if (alts.includes(u)) return { res: "ok", a: u };
    for (const a of alts) if (esStrip(a) === esStrip(u)) return { res: "accent", a };
    for (const a of alts) if (ARTICLE.test(a) && esStrip(a.replace(ARTICLE, "")) === esStrip(u)) return { res: "article", a };
    return { res: "wrong", a: alts[0] };
  }

  function esPool(themeId) {
    const pool = [];
    for (const th of ES_VOCAB) {
      if (themeId !== "all" && th.id !== themeId) continue;
      th.words.forEach((w, i) => pool.push({ key: th.id + ":" + i, w, th }));
    }
    return pool;
  }
  function esStats(themeId) {
    const pool = esPool(themeId), today = dayKey();
    let due = 0, sure = 0;
    for (const p of pool) { const r = S.es.words[p.key]; if (r && r.due <= today) due++; if (r && r.box >= 3) sure++; }
    return { total: pool.length, due, sure };
  }

  function keyboardHtml() {
    return `<div class="es-keys" aria-label="${t("es.keyboard")}">${ES_KEYS.map((k) => `<button type="button" class="es-key" data-k="${k}">${k}</button>`).join("")}</div>`;
  }
  function bindKeyboard(input) {
    $$(".es-key").forEach((b) => {
      b.onmousedown = (e) => e.preventDefault();
      b.onclick = () => {
        const s = input.selectionStart ?? input.value.length, e = input.selectionEnd ?? s;
        input.value = input.value.slice(0, s) + b.dataset.k + input.value.slice(e);
        input.focus(); input.setSelectionRange(s + 1, s + 1);
      };
    });
  }

  route("/es", () => {
    const st = esStats("all");
    const rulesDone = ES_RULES.filter((r) => S.es.rules[r.id] && S.es.rules[r.id].done).length;
    view.innerHTML = `
      <a class="back" href="#/learn">← ${t("back")}</a>
      <h1>🇪🇸 ${t("es.title")}</h1><p>${t("es.intro")}</p>
      <div class="tiles one">
        <a class="tile" href="#/es/vocab"><span class="tile-icon">📚</span><span><b>${t("es.vocab")}${newIds("es", "v:").length ? `<span class="new-tag">${t("new.tag")}</span>` : ""}</b><small>${t("es.vocab.sub")}</small>
          <small>${t("es.learned", { a: st.sure, b: st.total })} · ${t("es.due", { n: st.due })}</small>
          <span class="bar small"><span style="width:${Math.round((st.sure / st.total) * 100)}%"></span></span></span></a>
        <a class="tile" href="#/es/rules"><span class="tile-icon">✍️</span><span><b>${t("es.rules")}${newIds("es", "r:").length ? `<span class="new-tag">${t("new.tag")}</span>` : ""}</b><small>${t("es.rules.sub")}</small>
          <small>✅ ${rulesDone} / ${ES_RULES.length}</small></span></a>
        <a class="tile" href="#/es/accent"><span class="tile-icon">🕵️</span><span><b>${t("es.accent")}</b><small>${t("es.accent.sub")}</small>
          ${S.es.accent.total ? `<small>🎯 ${S.es.accent.ok} / ${S.es.accent.total}</small>` : ""}</span></a>
      </div>`;
  });

  // --- Vokabeltrainer ---
  let esMode = "mix";
  route("/es/vocab", () => {
    const all = esStats("all");
    const nw = takeNew("es", "v:");
    view.innerHTML = `
      <a class="back" href="#/es">← ${t("back")}</a>
      <h1>📚 ${t("es.vocab")}</h1>
      <p class="fine">${t("es.boxes")}</p>
      <div class="seg" id="es-mode">
        ${["mix", "write", "recognize"].map((m) => `<button class="${esMode === m ? "sel" : ""}" data-m="${m}">${m === "mix" ? "🔀 Mix" : t("es." + m)}</button>`).join("")}
      </div>
      <a class="btn primary big" href="#/es/play/all">▶ ${t("es.all")} · ${t("es.start")}</a>
      <p class="fine center">${t("es.due", { n: all.due })} · ${t("es.learned", { a: all.sure, b: all.total })}</p>
      <h2>${t("es.themes")}</h2>
      <div class="tiles">${ES_VOCAB.map((th) => {
        const st = esStats(th.id);
        return `<a class="tile slim" href="#/es/play/${th.id}"><span class="tile-icon">${th.icon}</span><span><b>${esc(L(th.title))}${newTag(nw, "v:" + th.id)}</b>
          <small>${t("es.learned", { a: st.sure, b: st.total })}${st.due ? " · ⏰ " + st.due : ""}</small>
          <span class="bar small"><span style="width:${Math.round((st.sure / st.total) * 100)}%"></span></span></span></a>`;
      }).join("")}</div>`;
    $("#es-mode").onclick = (e) => { const b = e.target.closest("[data-m]"); if (b) { esMode = b.dataset.m; render(); } };
  });

  route("/es/play/:theme", (themeId) => {
    const pool = esPool(themeId);
    if (!pool.length) return (location.hash = "#/es/vocab");
    const today = dayKey();
    const rec = (p) => S.es.words[p.key];
    const due = pool.filter((p) => rec(p) && rec(p).due <= today).sort((a, b) => rec(a).box - rec(b).box);
    const fresh = shuffle(pool.filter((p) => !rec(p)));
    const rest = shuffle(pool.filter((p) => rec(p) && rec(p).due > today)).sort((a, b) => rec(a).box - rec(b).box);
    const session = [...due, ...fresh, ...rest].slice(0, 10);
    let i = 0, right = 0, state = null;

    function modeFor(p) {
      if (esMode !== "mix") return esMode;
      return ((rec(p) && rec(p).box) || 0) >= 2 ? "write" : "recognize";
    }
    function update(p, kind, how) {
      const r = (S.es.words[p.key] = S.es.words[p.key] || { box: 0, due: today });
      if (how === "ok") {
        r.box = kind === "write" ? Math.min(5, r.box + 1) : r.box < 2 ? r.box + 1 : r.box;
        r.due = addDays(ES_INTERVAL[r.box]);
      } else if (how === "almost") {
        r.box = Math.max(1, r.box); r.due = today;
      } else { r.box = 1; r.due = today; }
      save();
    }

    function draw() {
      if (i >= session.length) {
        view.innerHTML = victoryHtml(t("es.sessionDone", { a: right, b: session.length }),
          `<a class="btn primary" href="#/es/play/${themeId}" id="voc-again">🔁 ${t("es.start")}</a>
          <a class="btn ghost" href="#/es/vocab">${t("done")}</a>`, right / session.length);
        $("#voc-again").onclick = (e) => { e.preventDefault(); render(); };
        if (right >= session.length * 0.8) burst("🇪🇸");
        return;
      }
      const p = session[i];
      if (!state) state = { mode: modeFor(p), box: (rec(p) && rec(p).box) || 0 }; // Modus pro Frage festhalten
      const mode = state.mode, box = state.box;
      const head = `<a class="back" href="#/es/vocab">← ${t("back")}</a>
        <div class="row"><b>${i + 1} / ${session.length}</b><span class="pill">${p.th.icon} 📦 ${box}</span></div>
        <div class="bar"><div style="width:${Math.round((i / session.length) * 100)}%"></div></div>`;

      if (mode === "recognize") {
        if (!state.opts) {
          const others = shuffle(pool.filter((o) => o.key !== p.key && esMeaning(o.w) !== esMeaning(p.w))).slice(0, 3);
          state.opts = shuffle([p, ...others]); state.picked = null;
        }
        view.innerHTML = `${head}
          <section class="card center">
            <small>${t("es.recognizePrompt")}</small>
            <p class="es-word" lang="es">${esc(esShow(p.w))}</p>
            <div class="options">${state.opts.map((o, j) => {
              let cls = "";
              if (state.picked !== null && o.key === p.key) cls = "right";
              else if (state.picked === j) cls = "wrong";
              return `<button class="option ${cls}" data-j="${j}" ${state.picked !== null ? "disabled" : ""}>${esc(esMeaning(o.w))}</button>`;
            }).join("")}</div>
            ${state.picked !== null ? `<button class="btn primary big" id="es-next">${t("next")} →</button>` : ""}
          </section>`;
        $$(".option").forEach((b) => (b.onclick = () => {
          const j = Number(b.dataset.j); state.picked = j;
          if (state.opts[j].key === p.key) { right++; update(p, "recognize", "ok"); toast(cheer() + " +" + award(1, false) + " ⭐"); }
          else { update(p, "recognize", "wrong"); logMistake("es-erkennen", p.key, esShow(p.w), esShow(state.opts[j].w)); }
          draw();
        }));
      } else {
        if (state.checked === undefined) { state.checked = null; state.value = ""; }
        const c = state.checked;
        let fb = "";
        if (c) {
          const shown = p.w[0].split("|").join(" / ");
          if (c.res === "ok") fb = `<p class="good">✅ ${esc(c.a)}</p>`;
          else if (c.res === "accent") fb = `<p class="msg">${t("es.almostAccent", { x: esc(c.a) })}</p>`;
          else if (c.res === "article") fb = `<p class="msg">${t("es.almostArticle", { x: esc(c.a) })}</p>`;
          else fb = `<p class="bad">${t("es.wrongWord", { x: esc(shown) })}</p>`;
        }
        view.innerHTML = `${head}
          <section class="card center">
            <small>${t("es.writePrompt")}</small>
            <p class="es-word">${esc(esMeaning(p.w))}</p>
            <input id="es-in" class="es-input ${c ? (c.res === "ok" ? "ok" : c.res === "wrong" ? "bad" : "almost") : ""}" lang="es"
              autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
              placeholder="${t("es.typeHere")}" value="${esc(state.value)}" ${c ? "readonly" : ""}>
            ${c ? "" : keyboardHtml()}
            ${fb}
            ${c ? `<button class="btn primary big" id="es-next">${t("next")} →</button>` : `<button class="btn primary big" id="es-check">${t("es.check")}</button>`}
          </section>`;
        const input = $("#es-in");
        if (!c) {
          bindKeyboard(input);
          input.focus();
          const go = () => {
            state.value = input.value;
            if (!input.value.trim()) return;
            const r = esCheck(input.value, p.w[0]);
            state.checked = r;
            if (r.res === "ok") { right++; update(p, "write", "ok"); toast(cheer() + " +" + award(2, false) + " ⭐"); burst(); }
            else if (r.res === "accent" || r.res === "article") { update(p, "write", "almost"); award(1, false); logMistake("es-schreiben-" + (r.res === "accent" ? "akzent" : "artikel"), p.key, p.w[0], input.value); }
            else { update(p, "write", "wrong"); logMistake("es-schreiben", p.key, p.w[0], input.value); }
            draw();
          };
          $("#es-check").onclick = go;
          input.onkeydown = (e) => { if (e.key === "Enter") go(); };
        }
      }
      const nx = $("#es-next");
      if (nx) { nx.onclick = () => { i++; state = null; draw(); }; nx.focus(); }
    }
    draw();
  });

  // --- Schreibregeln ---
  route("/es/rules", () => {
    const nw = takeNew("es", "r:");
    view.innerHTML = `
      <a class="back" href="#/es">← ${t("back")}</a>
      <h1>✍️ ${t("es.rules")}</h1>
      <div class="tiles one">${ES_RULES.map((r) => {
        const d = S.es.rules[r.id] && S.es.rules[r.id].done;
        return `<a class="tile slim" href="#/es/rules/${r.id}"><span class="tile-icon">${r.icon}</span>
          <span><b>${esc(L(r.title))}${newTag(nw, "r:" + r.id)}</b><small>${d ? "✅" : esc(r.examples.slice(0, 3).join(" · "))}</small></span></a>`;
      }).join("")}</div>`;
  });

  route("/es/rules/:id", (id) => {
    const idx = ES_RULES.findIndex((r) => r.id === id), r = ES_RULES[idx];
    if (!r) return (location.hash = "#/es/rules");
    const st = (S.es.rules[id] = S.es.rules[id] || { done: false, ok: {} });
    const wrong = {};
    function draw() {
      const next = ES_RULES[idx + 1];
      view.innerHTML = `
        <a class="back" href="#/es/rules">← ${t("back")}</a>
        <article class="card">
          <div class="warum-icon">${r.icon}</div>
          <h1>${esc(L(r.title))}</h1>
          <p>${esc(L(r.text))}</p>
          <p class="label">${t("es.examples")}</p>
          <div class="chips" lang="es">${r.examples.map((e) => `<span class="chip">${esc(e)}</span>`).join("")}</div>
        </article>
        <h2>🎯 ${t("es.practice")}</h2>
        ${r.drill.map((d, k) => {
          const o = opts(d.opts), done = st.ok[k];
          return `<section class="card">
            <p class="question">${esc(L(d.q))}</p>
            <div class="options" lang="es">${o.map((txt, j) => {
              let cls = "";
              if (done && j === d.answer) cls = "right";
              else if (wrong[k] && wrong[k].includes(j)) cls = "wrong";
              return `<button class="option ${cls}" data-k="${k}" data-j="${j}" ${done || (wrong[k] && wrong[k].includes(j)) ? "disabled" : ""}>${esc(txt)}</button>`;
            }).join("")}</div></section>`;
        }).join("")}
        ${st.done ? `<p class="good center">✅ ${esc(L(r.title))}</p>` : ""}
        ${next ? `<a class="btn ghost big" href="#/es/rules/${next.id}">${next.icon} ${esc(L(next.title))} →</a>` : `<a class="btn ghost big" href="#/es/accent">🕵️ ${t("es.accent")} →</a>`}`;
      $$(".option[data-k]").forEach((b) => (b.onclick = () => {
        const k = Number(b.dataset.k), j = Number(b.dataset.j), d = r.drill[k];
        if (j === d.answer) {
          st.ok[k] = true;
          const pts = wrong[k] ? 0 : award(1, true);
          if (pts) toast(cheer() + " +" + pts + " ⭐");
          if (!st.done && r.drill.every((_, x) => st.ok[x])) {
            st.done = true;
            const bonus = award(5, false);
            setTimeout(() => { toast(t("es.ruleDone", { n: bonus })); burst("✍️"); }, 600);
          }
        } else { (wrong[k] = wrong[k] || []).push(j); logMistake("es-regel", `${id} #${k + 1}`, opts(d.opts)[d.answer], opts(d.opts)[j]); }
        save();
        const y = window.scrollY; draw(); window.scrollTo(0, y);
      }));
    }
    draw();
  });

  // --- Akzent-Detektiv ---
  route("/es/accent", () => {
    const words = shuffle(ES_ACCENT.slice()).slice(0, 10);
    let i = 0, right = 0, picked = null;
    const target = (w) => { for (let k = 0; k < w[0].length; k++) if (w[0][k] !== w[1][k]) return k; return -1; };
    function draw() {
      if (i >= words.length) {
        view.innerHTML = victoryHtml(t("es.sessionDone", { a: right, b: words.length }),
          `<a class="btn primary" href="#/es/accent" id="acc-again">🔁 ${t("es.accent")}</a>
          <a class="btn ghost" href="#/es">${t("done")}</a>`, right / words.length);
        $("#acc-again").onclick = (e) => { e.preventDefault(); render(); };
        if (right >= 8) burst("🕵️");
        return;
      }
      const w = words[i], tg = target(w), done = picked !== null;
      const ok = done && picked === tg;
      view.innerHTML = `
        <a class="back" href="#/es">← ${t("back")}</a>
        <div class="row"><b>${i + 1} / ${words.length}</b><span class="pill">🎯 ${right}</span></div>
        <div class="bar"><div style="width:${Math.round((i / words.length) * 100)}%"></div></div>
        <section class="card center">
          <p>${t("es.accentQ")}</p>
          <div class="acc-word" lang="es">${w[0].split("").map((ch, k) => {
            const vowel = "aeiou".includes(ch);
            let cls = vowel ? "v" : "c";
            if (done && k === tg) cls += " right";
            else if (done && k === picked) cls += " wrong";
            const shown = done && k === tg ? w[1][k] : ch;
            return `<button class="acc ${cls}" data-k="${k}" ${!vowel || done ? "disabled" : ""}>${shown}</button>`;
          }).join("")}</div>
          <button class="btn ${done && tg === -1 ? "good" : done && picked === -1 ? "bad" : "ghost"}" id="acc-none" ${done ? "disabled" : ""}>${t("es.noTilde")}</button>
          ${done ? `<p class="${ok ? "good" : "bad"}">${ok ? "✅" : "❌"} <span lang="es">${esc(w[1])}</span></p>
            <p class="fine">${esc(L(ES_ACCENT_RULES[w[2]]))}</p>
            <button class="btn primary big" id="acc-next">${t("next")} →</button>` : ""}
        </section>`;
      const choose = (k) => {
        picked = k;
        S.es.accent.total++;
        if (k === tg) { right++; S.es.accent.ok++; toast(cheer() + " +" + award(2, true) + " ⭐"); }
        else logMistake("es-akzent", w[1] + " [" + w[2] + "]", w[1], k === -1 ? "keine Tilde" : w[0].slice(0, k) + "´" + w[0].slice(k));
        save(); draw();
      };
      if (!done) {
        $$(".acc.v").forEach((b) => (b.onclick = () => choose(Number(b.dataset.k))));
        $("#acc-none").onclick = () => choose(-1);
      } else $("#acc-next").onclick = () => { i++; picked = null; draw(); };
    }
    draw();
  });

  // ---------- Sprüche & Redewendungen ----------
  const LANGS = ["de", "en", "es"];
  const FLAG = { de: "🇩🇪", en: "🇬🇧", es: "🇻🇪" };
  const idRec = (id) => (S.idioms[id] = S.idioms[id] || { ok: 0, wrong: 0, fav: false });
  const idMastered = () => IDIOMS.filter((x) => S.idioms[x.id] && S.idioms[x.id].ok >= 3).length;
  const stars = (n) => "★".repeat(Math.min(3, n)) + "☆".repeat(Math.max(0, 3 - n));

  route("/sprueche", () => {
    const nw = takeNew("sprueche");
    view.innerHTML = `
      <a class="back" href="#/learn">← ${t("back")}</a>
      <h1>💬 ${t("id.title")}</h1>
      <p>${t("id.intro")}</p>
      <a class="btn primary big" href="#/sprueche/quiz">▶ ${t("id.quiz")}</a>
      <p class="fine center">${t("id.mastered", { a: idMastered(), b: IDIOMS.length })}</p>
      <h2>${t("id.collection")}</h2>
      <div class="tiles one">${IDIOMS.map((x) => {
        const r = S.idioms[x.id] || {};
        return `<a class="tile slim" href="#/sprueche/${x.id}"><span class="tile-icon">${x.icon}</span>
          <span><b>${esc(x[S.lang])}${newTag(nw, x.id)}</b><small class="stars">${stars(r.ok || 0)} ${r.fav ? "❤️" : ""}</small></span></a>`;
      }).join("")}</div>`;
  });

  route("/sprueche/quiz", () => {
    // Schwächste zuerst, etwas Zufall dazu
    const order = shuffle(IDIOMS.slice()).sort((a, b) => ((S.idioms[a.id] || {}).ok || 0) - ((S.idioms[b.id] || {}).ok || 0));
    const qs = order.slice(0, 8).map((x) => {
      const kind = ["meaning", "twin", "gap"][Math.floor(Math.random() * 3)];
      const from = LANGS[Math.floor(Math.random() * 3)];
      const others = shuffle(IDIOMS.filter((o) => o.id !== x.id)).slice(0, 3);
      if (kind === "meaning") {
        const opts = shuffle([x, ...others]);
        return { x, kind, from, prompt: x[from], opts: opts.map((o) => L(o.meaning)), answer: opts.indexOf(x) };
      }
      if (kind === "twin") {
        const to = LANGS.filter((l) => l !== from)[Math.floor(Math.random() * 2)];
        const opts = shuffle([x, ...others]);
        return { x, kind, from, to, prompt: x[from], opts: opts.map((o) => o[to]), answer: opts.indexOf(x) };
      }
      // Lücke: ein längeres Wort fehlt
      const words = x[from].split(" ");
      const cand = words.map((w, i) => [w.replace(/[^\p{L}]/gu, ""), i]).filter(([w]) => w.length >= 4);
      const [gapWord, gi] = cand[Math.floor(Math.random() * cand.length)] || [words[0], 0];
      const pool = shuffle(IDIOMS.filter((o) => o.id !== x.id).flatMap((o) => o[from].split(" ").map((w) => w.replace(/[^\p{L}]/gu, "")))
        .filter((w) => w.length >= 4 && w.toLowerCase() !== gapWord.toLowerCase()));
      const distract = [...new Set(pool)].slice(0, 3);
      const opts = shuffle([gapWord, ...distract]);
      const shown = words.map((w, i) => (i === gi ? w.replace(gapWord, "____") : w)).join(" ");
      return { x, kind, from, prompt: shown, opts, answer: opts.indexOf(gapWord) };
    });
    let i = 0, right = 0, picked = null;
    function draw() {
      if (i >= qs.length) {
        view.innerHTML = victoryHtml(t("es.sessionDone", { a: right, b: qs.length }),
          `<a class="btn primary" href="#/sprueche/quiz" id="id-again">🔁 ${t("id.quiz")}</a>
          <a class="btn ghost" href="#/sprueche">${t("done")}</a>`, right / qs.length);
        $("#id-again").onclick = (e) => { e.preventDefault(); render(); };
        if (right >= 6) burst("💬");
        return;
      }
      const q = qs[i], done = picked !== null;
      const title = q.kind === "meaning" ? t("id.qMeaning") : q.kind === "twin" ? t("id.qTwin", { lang: FLAG[q.to] + " " + t("lang." + q.to) }) : t("id.qGap");
      view.innerHTML = `
        <a class="back" href="#/sprueche">← ${t("back")}</a>
        <div class="row"><b>${i + 1} / ${qs.length}</b><span class="pill">🎯 ${right}</span></div>
        <div class="bar"><div style="width:${Math.round((i / qs.length) * 100)}%"></div></div>
        <section class="card">
          <small>${title}</small>
          <p class="idiom-quote" lang="${q.from}">${FLAG[q.from]} «${esc(q.prompt)}»</p>
          <div class="options">${q.opts.map((o, j) => {
            let cls = "";
            if (done && j === q.answer) cls = "right"; else if (done && j === picked) cls = "wrong";
            return `<button class="option ${cls}" data-j="${j}" ${done ? "disabled" : ""}>${q.kind === "twin" ? FLAG[q.to] + " " : ""}${esc(o)}</button>`;
          }).join("")}</div>
          ${done ? idiomCardInner(q.x) + `<button class="btn primary big" id="id-next">${t("next")} →</button>` : ""}
        </section>`;
      if (!done) $$(".option").forEach((b) => (b.onclick = () => {
        picked = Number(b.dataset.j);
        const r = idRec(q.x.id);
        if (picked === q.answer) { right++; r.ok++; toast(cheer() + " +" + award(3, true) + " ⭐"); }
        else { r.wrong++; logMistake("spruch-" + q.kind, q.x.id + " (" + q.from + (q.to ? "→" + q.to : "") + ")", q.opts[q.answer], q.opts[picked]); }
        save(); draw();
      }));
      else $("#id-next").onclick = () => { i++; picked = null; draw(); };
    }
    draw();
  });

  function idiomCardInner(x) {
    return `<div class="idiom-card">
      ${LANGS.map((l) => `<div class="idiom-line" lang="${l}"><span>${FLAG[l]}</span><div><b>${esc(x[l])}</b>
        ${S.lang === "de" && x.lit && x.lit[l] ? `<small>${t("id.literal")}: «${esc(x.lit[l])}»</small>` : ""}</div></div>`).join("")}
      <div class="seen"><b>💡 ${t("id.meaning")}</b><p>${esc(L(x.meaning))}</p></div>
    </div>`;
  }

  route("/sprueche/:id", (id) => {
    const idx = IDIOMS.findIndex((x) => x.id === id), x = IDIOMS[idx];
    if (!x) return (location.hash = "#/sprueche");
    const r = idRec(id);
    const prev = S.journal.filter((j) => j.ref === "spruch:" + id);
    const next = IDIOMS[idx + 1];
    view.innerHTML = `
      <a class="back" href="#/sprueche">← ${t("back")}</a>
      <article class="card">
        <div class="row"><span class="warum-icon">${x.icon}</span>
          <button class="btn ${r.fav ? "primary" : "ghost"}" id="id-fav">${r.fav ? "❤️" : "🤍"} ${t("id.fav")}</button></div>
        ${idiomCardInner(x)}
        <p class="stars center">${stars(r.ok)}</p>
      </article>
      <section class="card">
        <h2>✍️ ${t("warum.yourTurn")}</h2>
        <p><b>${t("id.think")}</b></p>
        <textarea id="id-text" rows="3" placeholder="${t("warum.placeholder")}"></textarea>
        <button class="btn primary" id="id-save">${t("save")}</button>
        ${prev.length ? `<div class="entries">${prev.map(entryHtml).join("")}</div>` : ""}
      </section>
      ${next ? `<a class="btn ghost big" href="#/sprueche/${next.id}">${next.icon} ${esc(next[S.lang])} →</a>` : ""}`;
    $("#id-fav").onclick = () => { r.fav = !r.fav; save(); render(); };
    $("#id-save").onclick = () => {
      const text = $("#id-text").value.trim();
      if (!text) return;
      const first = !prev.length;
      S.journal.unshift({ id: Date.now(), date: new Date().toISOString(), kind: "spruch", ref: "spruch:" + id, prompt: x[S.lang], text });
      const pts = first ? award(5, false) : 0;
      checkBadges(); save();
      toast(pts ? t("warum.saved", { n: pts }) : "✅");
      render();
    };
  });

  // ---------- Entwicklungsbericht (für Eltern → Claude) ----------
  function buildReport(withJournal) {
    const today = dayKey();
    const lines = [];
    const P = (s = "") => lines.push(s);
    const cnt = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
    const top = (m, n = 15) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n);

    P(`# Lern-Club: Entwicklungsbericht (${today})`);
    P();
    P("> Automatisch erzeugt im Elternbereich. Enthält keinen Namen. Nicht ins öffentliche Repository legen.");
    P();
    P("## Überblick");
    const active = Object.keys(S.days).filter((d) => daysBetween(d, today) < 30);
    P(`- Punkte gesamt: ${S.points} · aktive Tage (letzte 30): ${active.length} · Serie: ${displayStreak()} (Rekord ${S.streak.best})`);
    P(`- Lieblingssprache der Oberfläche: ${S.lang} · Aufgaben auf Englisch: ${S.counters.en || 0} · auf Spanisch: ${S.counters.es || 0}`);
    P(`- Abzeichen: ${Object.keys(S.badges).join(", ") || "–"}`);
    P(`- Punkte pro Tag (letzte 14): ${Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); return S.days[dayKey(d)] || 0; }).join(" · ")}`);
    P();

    P("## Känguru");
    const kgUsed = KAENGURU.filter((k) => S.kg[k.id] && Object.keys(S.kg[k.id]).length);
    if (!kgUsed.length) P("- noch nichts bearbeitet");
    const byPts = { 3: [0, 0], 4: [0, 0], 5: [0, 0] };
    kgUsed.forEach((k) => {
      const r = S.kg[k.id];
      const v = Object.values(r);
      P(`- ${k.year} · ${k.level}: ${v.filter((x) => x.ok && x.tries === 1).length}× sofort richtig, ${v.filter((x) => x.ok && x.tries === 2).length}× im 2. Versuch, ${v.filter((x) => x.done && !x.ok).length}× nicht gelöst (von ${k.answers.length})`);
      Object.entries(r).forEach(([i, x]) => { if (x.done) { byPts[k.points[i]][1]++; if (x.ok && x.tries === 1) byPts[k.points[i]][0]++; } });
    });
    if (kgUsed.length) P(`- Trefferquote beim 1. Versuch nach Schwierigkeit: ${[3, 4, 5].map((p) => `${p} P. ${byPts[p][1] ? Math.round((byPts[p][0] / byPts[p][1]) * 100) + "%" : "–"} (n=${byPts[p][1]})`).join(" · ")}`);
    P();

    P("## Knobel-Werkstatt");
    const pzOk = PUZZLES.filter((p) => S.pz[p.id] && S.pz[p.id].ok), pzFail = PUZZLES.filter((p) => S.pz[p.id] && S.pz[p.id].done && !S.pz[p.id].ok);
    P(`- gelöst: ${pzOk.length}/${PUZZLES.length} · nicht gelöst: ${pzFail.map((p) => p.id).join(", ") || "–"}`);
    P();

    P("## Spanisch");
    const boxes = [0, 0, 0, 0, 0, 0];
    Object.values(S.es.words).forEach((w) => boxes[w.box || 0]++);
    P(`- Wörter begonnen: ${Object.keys(S.es.words).length}/${ES_VOCAB.reduce((a, th) => a + th.words.length, 0)} · Kisten 1–5: ${boxes.slice(1).join(" / ")}`);
    P(`- Schreibregeln gemeistert: ${ES_RULES.filter((r) => S.es.rules[r.id] && S.es.rules[r.id].done).map((r) => r.id).join(", ") || "–"}`);
    P(`- Akzent-Detektiv: ${S.es.accent.ok}/${S.es.accent.total} richtig`);
    const esLog = S.log.filter((l) => l.area.startsWith("es-"));
    if (esLog.length) {
      P(`- Fehlerarten: ${top(cnt(esLog, (l) => l.area)).map(([k, v]) => `${k} ${v}×`).join(" · ")}`);
      P("- Häufigste Problemwörter:");
      top(cnt(esLog.filter((l) => l.area.startsWith("es-schreiben") || l.area === "es-erkennen"), (l) => l.expected.split("|")[0])).forEach(([w, n]) => P(`  - ${w} (${n}×)`));
      const acc = esLog.filter((l) => l.area === "es-akzent");
      if (acc.length) P(`- Akzent-Fehler nach Regeltyp (a=aguda, l=llana, e=esdrújula, h=Hiatus, n=keine Tilde): ${top(cnt(acc, (l) => (l.item.match(/\[(\w)\]/) || [])[1])).map(([k, v]) => `${k} ${v}×`).join(" · ")}`);
    }
    P();

    P("## Musik (mCheck)");
    P(`- gewählte Stufe: ${S.music.level} · ${Object.entries(S.music.stats).map(([k, v]) => `${k} ${v.ok}/${v.total}`).join(" · ") || "noch nichts geübt"}`);
    const muLog = S.log.filter((l) => l.area.startsWith("musik-"));
    if (muLog.length) P(`- Fehler nach Bereich: ${top(cnt(muLog, (l) => l.area)).map(([k, v]) => `${k} ${v}×`).join(" · ")}`);
    P();

    P("## Karten-Quiz (NMG)");
    for (const mk of Object.keys(MAPS)) {
      const g = S.geo[mk];
      P(`- ${MAPS[mk].title.de}: ${g ? `${g.ok}/${g.total} richtig · ${g.rounds} Runden · Bestzeit ${g.best ? fmtTime(g.best) : "–"}` : "noch nicht geübt"}`);
    }
    const geoLog = S.log.filter((l) => l.area.startsWith("karte-"));
    if (geoLog.length) P(`- Häufig verwechselt: ${top(cnt(geoLog, (l) => l.expected + "→" + l.given)).map(([k, v]) => `${k} ${v}×`).join(" · ")}`);
    P();

    P("## Abwechslung (Missionen & Fokus)");
    P(`- Fokus der Woche: ${S.focus ? t(modById(S.focus).tile) : "keiner"}`);
    P(`- Zuletzt geübt: ${MODULES.map((m) => `${m.id} ${S.modLast[m.id] || "nie"}`).join(" · ")}`);
    P(`- Inhalte erledigt (Nachschub nötig bei 100 %): ${Object.keys(CONTENT).map((m) => { const p = progressOf(m); return `${m} ${p.done}/${p.total}`; }).join(" · ")}`);
    P();

    P("## Sprüche & Redewendungen");
    P(`- gemeistert (3★): ${idMastered()}/${IDIOMS.length}`);
    const favs = IDIOMS.filter((x) => S.idioms[x.id] && S.idioms[x.id].fav);
    P(`- Lieblingssprüche: ${favs.map((x) => x.de).join(" · ") || "–"}`);
    const idLog = S.log.filter((l) => l.area.startsWith("spruch-"));
    if (idLog.length) P(`- Fehler nach Fragetyp: ${top(cnt(idLog, (l) => l.area)).map(([k, v]) => `${k} ${v}×`).join(" · ")}`);
    P();

    P("## Warum Schule & Club");
    P(`- Warum-Karten beantwortet: ${WARUM.filter((w) => S.warum[w.id]).map((w) => w.id + " " + w.title.de).join(" · ") || "–"}`);
    P(`- Club-Karten: ${Object.keys(S.club).length}/${CLUB.length}`);
    P(`- Rollentausch-Fragen erfunden: ${S.swap.length}`);
    P();

    P("## Schulwoche (Hausaufgaben zeigen, was gerade im Unterricht läuft)");
    const wkKeys = Object.keys(S.school.weeks).sort().slice(-8);
    if (!wkKeys.length) P("- –");
    wkKeys.forEach((k) => {
      const w = S.school.weeks[k];
      const items = (w.hw && w.hw.items) || [];
      P(`- Woche ${k}: ${items.length ? items.map((it) => `${t("subj." + it.subj)}: ${it.text}${it.done ? " ✓" : ""}`).join(" · ") : "keine Hausaufgaben gemeldet"}${w.recap ? " · Rückblick geschrieben (" + recapWords(w.recap) + " Wörter)" : ""}`);
    });
    P();

    P("## Ideen-Box (seine Wünsche an die App)");
    if (S.ideas.length) S.ideas.forEach((e) => P(`- ${e.date.slice(0, 10)}: ${e.text.replace(/\n/g, " ")}`)); else P("- –");
    P();

    if (withJournal) {
      P("## Mein Warum");
      P(S.myWhy ? `> ${S.myWhy.replace(/\n/g, " ")}` : "- –");
      P();
      P("## Wochenrückblicke");
      const recaps = Object.keys(S.school.weeks).sort().filter((k) => S.school.weeks[k].recap);
      if (recaps.length) recaps.forEach((k) => P(`- ${k}: ${recapText(S.school.weeks[k].recap).replace(/\n/g, " ")}`)); else P("- –");
      P();
      P("## Tagebuch & Antworten");
      if (S.journal.length) S.journal.forEach((e) => P(`- ${e.date.slice(0, 10)} · ${e.kind}${e.prompt ? " · «" + e.prompt + "»" : ""}: ${e.text.replace(/\n/g, " ")}`));
      else P("- –");
      P();
    } else {
      P("## Tagebuch");
      P(`- nicht eingeschlossen (${S.journal.length} Einträge, ${S.journal.reduce((a, e) => a + words(e.text), 0)} Wörter)`);
      P();
    }

    P("## Fehler-Log (letzte 100)");
    P("| Zeit | Sprache | Bereich | Aufgabe | Richtig | Eingabe |");
    P("|---|---|---|---|---|---|");
    S.log.slice(-100).forEach((l) => P(`| ${l.d.replace("T", " ")} | ${l.lang} | ${l.area} | ${l.item} | ${l.expected.replace(/\|/g, " / ")} | ${l.given.replace(/\|/g, "/")} |`));
    return lines.join("\n");
  }

  // ---------- Stufen-Anzeige ----------
  function levelBarHtml(compact) {
    const lvl = levelOf(S.points), xp = S.points % XP_PER_LEVEL;
    const next = SKINS.find((k) => k.level > lvl);
    return `<div class="lvl ${compact ? "compact" : ""}">
      <div class="lvl-head"><b>⚡ ${t("game.level", { n: lvl })}</b><span>${t("game.xp", { a: xp, b: XP_PER_LEVEL })}</span></div>
      <div class="bar lvl-bar"><div style="width:${xp}%"></div></div>
      ${!compact && next ? `<a class="lvl-next" href="#/locker"><span class="mini-av">${avatar(next, { locked: true })}</span><small>${t("game.nextSkin", { n: next.level })}</small></a>` : ""}
    </div>`;
  }

  // ---------- Spind (Skins) ----------
  route("/locker", () => {
    const lvl = levelOf(S.points), cur = currentSkin();
    view.innerHTML = `
      <a class="back" href="#/me">← ${t("back")}</a>
      <h1>🎒 ${t("game.locker")}</h1>
      ${levelBarHtml(true)}
      <div class="locker">${SKINS.map((k) => {
        const open = k.level <= lvl, c = RARITY_COLORS[k.rarity];
        return `<button class="skin-card ${open ? "" : "is-locked"} ${k.id === cur.id ? "equipped" : ""}" data-id="${k.id}" ${open ? "" : "disabled"}
            style="--r1:${c[0]};--r2:${c[1]}">
          <span class="skin-av">${avatar(k, { locked: !open })}</span>
          <b>${esc(L(k.name))}</b>
          <small>${t("rarity." + k.rarity)}</small>
          <span class="skin-state">${k.id === cur.id ? "✓ " + t("game.equipped") : open ? t("game.equip") : "🔒 " + t("game.locked", { n: k.level })}</span>
        </button>`;
      }).join("")}</div>`;
    $$(".skin-card:not([disabled])").forEach((b) => (b.onclick = () => { S.profile.skin = b.dataset.id; save(); burst("✨"); render(); }));
  });

  // ---------- Schulwoche ----------
  const SUBJECTS = ["de", "ma", "fr", "en", "nmg", "bg", "ttg", "mu", "sp", "mi", "x"];
  function mondayKey(d = new Date()) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return dayKey(x);
  }
  const weekGet = (k) => S.school.weeks[k];
  const weekRec = (k) => (S.school.weeks[k] = S.school.weeks[k] || { hw: null, recap: null });
  const recapText = (r) => [["week.qNew", r.new], ["week.qHard", r.hard], ["week.qBest", r.best], ["week.qMore", r.more]]
    .filter(([, v]) => v).map(([q, v]) => `${t(q)} ${v}`).join("\n");
  const recapWords = (r) => words([r.new, r.hard, r.best, r.more].filter(Boolean).join(" "));
  const fmtDate = (k) => new Date(k + "T12:00:00").toLocaleDateString({ en: "en-GB", es: "es-VE" }[S.lang] || "de-CH");

  function weekBannerHtml() {
    const dow = new Date().getDay(), w = weekGet(mondayKey());
    if (dow >= 1 && dow <= 3 && !(w && w.hw)) return `<a class="banner mon" href="#/woche">📋 ${t("week.bannerMon")} →</a>`;
    if ((dow === 5 || dow === 6 || dow === 0) && !(w && w.recap)) return `<a class="banner fri" href="#/woche">🔭 ${t("week.bannerFri")} →</a>`;
    return "";
  }

  function openItems() {
    const keys = [mondayKey(), mondayKey(new Date(Date.now() - 7 * 86400000))];
    const out = [];
    keys.forEach((k) => { const w = weekGet(k); if (w && w.hw) w.hw.items.forEach((it, i) => { if (!it.done) out.push({ k, i, it }); }); });
    return out;
  }
  function hwItemHtml(k, i, it) {
    return `<label class="hw-item ${it.done ? "done" : ""}"><input type="checkbox" class="hw-check" data-k="${k}" data-i="${i}" ${it.done ? "checked disabled" : ""}>
      <span><b>${t("subj." + it.subj)}</b> ${esc(it.text)}${it.due ? ` <small>· ${t("week.due")} ${t("day." + it.due)}</small>` : ""}</span></label>`;
  }
  function openHomeworkHtml() {
    const items = openItems();
    if (!items.length) return "";
    return `<section class="card"><h2>📋 ${t("week.open")}</h2>${items.map((o) => hwItemHtml(o.k, o.i, o.it)).join("")}</section>`;
  }
  function bindHomework() {
    $$(".hw-check:not([disabled])").forEach((c) => (c.onchange = () => {
      const it = S.school.weeks[c.dataset.k].hw.items[Number(c.dataset.i)];
      it.done = true; it.doneDate = new Date().toISOString();
      const pts = award(2, false); save();
      toast(t("week.hwDone", { n: pts })); burst("✅");
      setTimeout(render, 400);
    }));
  }

  let hwEditing = false;
  route("/woche", () => {
    const k = mondayKey(), w = weekGet(k) || { hw: null, recap: null };
    const editHw = hwEditing || !w.hw;
    const rows = (w.hw && w.hw.items.length ? w.hw.items : [{ subj: "de", text: "", due: "" }]);
    const rowHtml = (it) => `<div class="hw-row">
      <select class="hw-subj">${SUBJECTS.map((sj) => `<option value="${sj}" ${sj === it.subj ? "selected" : ""}>${t("subj." + sj)}</option>`).join("")}</select>
      <input class="hw-text" maxlength="200" placeholder="${t("week.task")}" value="${esc(it.text)}">
      <select class="hw-due"><option value="">${t("week.due")} …</option>${[1, 2, 3, 4, 5].map((d) => `<option value="${d}" ${String(d) === String(it.due) ? "selected" : ""}>${t("day." + d)}</option>`).join("")}</select>
    </div>`;
    const r = w.recap || {};
    const past = Object.keys(S.school.weeks).filter((x) => x !== k).sort().reverse();
    view.innerHTML = `
      <a class="back" href="#/learn">← ${t("back")}</a>
      <h1>🗓️ ${t("week.title")}</h1>
      <p class="sub">${t("week.weekOf", { d: fmtDate(k) })}</p>
      <section class="card">
        <h2>${t("week.hwTitle")}</h2>
        ${editHw ? `<p>${t("week.hwIntro")}</p>
          <div id="hw-rows">${rows.map(rowHtml).join("")}</div>
          <button class="btn ghost" id="hw-add">${t("week.addRow")}</button>
          <button class="btn primary" id="hw-save">${t("week.saveHw")}</button>`
        : `${w.hw.items.map((it, i) => hwItemHtml(k, i, it)).join("")}
          <button class="btn ghost small" id="hw-edit">✏️ ${t("week.edit")}</button>`}
      </section>
      <section class="card">
        <h2>${t("week.recapTitle")}</h2>
        <p>${t("week.recapIntro")}</p>
        <label class="field">${t("week.qNew")}<textarea id="rc-new" rows="3">${esc(r.new || "")}</textarea></label>
        <label class="field">${t("week.qHard")}<textarea id="rc-hard" rows="2">${esc(r.hard || "")}</textarea></label>
        <label class="field">${t("week.qBest")}<textarea id="rc-best" rows="2">${esc(r.best || "")}</textarea></label>
        <label class="field">${t("week.qMore")}<textarea id="rc-more" rows="2">${esc(r.more || "")}</textarea></label>
        <button class="btn primary" id="rc-save">${t("week.saveRecap")}</button>
        <p class="fine">🔒 ${t("journal.parentsNote")}</p>
      </section>
      <h2>${t("week.history")}</h2>
      <div class="entries">${past.length ? past.map((pk) => {
        const pw = S.school.weeks[pk];
        return `<div class="entry"><small>${t("week.weekOf", { d: fmtDate(pk) })}</small>
          ${pw.hw ? pw.hw.items.map((it) => `<p>${it.done ? "✅" : "⬜"} <b>${t("subj." + it.subj)}</b> ${esc(it.text)}</p>`).join("") : ""}
          ${pw.recap ? `<p>${esc(recapText(pw.recap))}</p>` : ""}</div>`;
      }).join("") : `<p class="sub">${t("week.none")}</p>`}</div>`;

    bindHomework();
    if ($("#hw-edit")) $("#hw-edit").onclick = () => { hwEditing = true; render(); };
    if ($("#hw-add")) $("#hw-add").onclick = () => {
      $("#hw-rows").insertAdjacentHTML("beforeend", rowHtml({ subj: "de", text: "", due: "" }));
      $$(".hw-text").slice(-1)[0].focus();
    };
    if ($("#hw-save")) $("#hw-save").onclick = () => {
      const old = (w.hw && w.hw.items) || [];
      const items = $$(".hw-row").map((row) => ({
        subj: $(".hw-subj", row).value, text: $(".hw-text", row).value.trim(), due: $(".hw-due", row).value,
      })).filter((it) => it.text).map((it) => {
        const prev = old.find((o) => o.text === it.text && o.subj === it.subj);
        return prev ? { ...it, done: prev.done, doneDate: prev.doneDate } : { ...it, done: false };
      });
      if (!items.length) return;
      const first = !(w.hw);
      weekRec(k).hw = { date: new Date().toISOString(), items };
      hwEditing = false;
      const pts = first ? award(10, false) : 0;
      save(); toast(pts ? t("week.saved", { n: pts }) : "✅"); if (pts) burst("📋");
      render();
    };
    $("#rc-save").onclick = () => {
      const rec = { new: $("#rc-new").value.trim(), hard: $("#rc-hard").value.trim(), best: $("#rc-best").value.trim(), more: $("#rc-more").value.trim() };
      if (!rec.new && !rec.hard && !rec.best && !rec.more) return;
      const first = !(w.recap);
      weekRec(k).recap = { date: (w.recap && w.recap.date) || new Date().toISOString(), edited: new Date().toISOString(), ...rec };
      const pts = first ? award(10, false) : 0;
      save(); toast(pts ? t("week.saved", { n: pts }) : "✅"); if (pts) burst("🔭");
      render();
    };
  });

  // ---------- Schreib-Zeitreise ----------
  function allWriting() {
    const out = [];
    S.journal.forEach((e) => out.push({ date: e.date, kind: e.kind === "spruch" ? "spruch" : e.kind === "warum" ? "warum" : "free", title: e.prompt || "", text: e.text }));
    S.ideas.forEach((e) => out.push({ date: e.date, kind: "idea", title: "", text: e.text }));
    (S.myWhyHistory || []).forEach((e) => out.push({ date: e.date, kind: "why", title: "", text: e.text }));
    Object.entries(S.school.weeks).forEach(([k, w]) => {
      if (w.recap) out.push({ date: w.recap.date, kind: "recap", title: t("week.weekOf", { d: fmtDate(k) }), text: recapText(w.recap) });
      if (w.hw) out.push({ date: w.hw.date, kind: "hw", title: t("week.weekOf", { d: fmtDate(k) }), text: w.hw.items.map((it) => `${t("subj." + it.subj)}: ${it.text}`).join("\n") });
    });
    return out.filter((x) => x.text).sort((a, b) => a.date.localeCompare(b.date));
  }
  const monthLabel = (ym) => new Date(ym + "-15").toLocaleDateString({ en: "en-GB", es: "es-VE" }[S.lang] || "de-CH", { month: "long", year: "numeric" });

  route("/archiv", () => {
    const all = allWriting();
    const prose = all.filter((x) => x.kind !== "hw");
    const total = all.reduce((a, x) => a + words(x.text), 0);
    const byMonth = {};
    all.forEach((x) => { const m = x.date.slice(0, 7); byMonth[m] = (byMonth[m] || 0) + words(x.text); });
    const months = Object.keys(byMonth).sort();
    const max = Math.max(1, ...Object.values(byMonth));
    const longest = prose.slice().sort((a, b) => words(b.text) - words(a.text))[0];
    const card = (label, x) => x ? `<div class="entry"><small>${label} · ${new Date(x.date).toLocaleDateString("de-CH")} · ${t("kind." + x.kind)} · ${words(x.text)} ${t("arc.total")}</small><p>${esc(x.text)}</p></div>` : "";
    view.innerHTML = `
      <a class="back" href="#/learn">← ${t("back")}</a>
      <h1>⏳ ${t("arc.title")}</h1>
      <p class="sub">${t("arc.intro")}</p>
      <section class="card">
        <div class="stat-grid">${stat("✍️", total, "arc.total")}${stat("📄", all.length, "arc.texts")}${stat("🗓️", months.length, "arc.months")}</div>
      </section>
      ${months.length ? `<section class="card"><h2>${t("arc.perMonth")}</h2>
        <div class="chart">${months.slice(-12).map((m) => `<div class="col" title="${m}: ${byMonth[m]}"><div style="height:${Math.round((byMonth[m] / max) * 100)}%"></div><small>${m.slice(5)}</small></div>`).join("")}</div></section>` : ""}
      ${prose.length ? `<section class="card">
        ${card("🌱 " + t("arc.first"), prose[0])}
        ${prose.length > 1 ? card("🚀 " + t("arc.latest"), prose[prose.length - 1]) : ""}
        ${longest && prose.length > 2 ? card("🏆 " + t("arc.longest"), longest) : ""}
      </section>` : ""}
      <h2>${t("arc.all")}</h2>
      ${months.slice().reverse().map((m) => `<h3 class="month">${monthLabel(m)}</h3>
        <div class="entries">${all.filter((x) => x.date.startsWith(m)).reverse().map((x) =>
          `<div class="entry"><small>${new Date(x.date).toLocaleDateString("de-CH")} · ${t("kind." + x.kind)}${x.title ? " · " + esc(x.title) : ""}</small><p>${esc(x.text)}</p></div>`).join("")}</div>`).join("") || `<p class="sub">${t("journal.none")}</p>`}`;
  });

  function downloadArchive() {
    const all = allWriting();
    const L2 = [`# Schreib-Archiv (${dayKey()})`, "", `${all.length} Texte · ${all.reduce((a, x) => a + words(x.text), 0)} Wörter`, ""];
    let cur = "";
    all.forEach((x) => {
      const m = x.date.slice(0, 7);
      if (m !== cur) { cur = m; L2.push(`## ${m}`, ""); }
      L2.push(`### ${x.date.slice(0, 10)} · ${t("kind." + x.kind)}${x.title ? " · " + x.title : ""}`, "", x.text, "");
    });
    const blob = new Blob([L2.join("\n")], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lernclub-schreibarchiv-${dayKey()}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const backupOverdue = () => !S.lastBackup || daysBetween(S.lastBackup.slice(0, 10), dayKey()) > 30;

  // ---------- Musik (mCheck) ----------
  window.__lang = () => S.lang;
  window.__instrument = () => S.music.instrument || "piano";
  const muStat = (k, ok) => { const st = (S.music.stats[k] = S.music.stats[k] || { ok: 0, total: 0 }); st.total++; if (ok) st.ok++; save(); };
  const MU_LINK = "https://vam-ag.ch/mcheck/basiswissen/";

  route("/musik", () => {
    const lv = S.music.level;
    const st = (k) => S.music.stats[k] ? `<small>🎯 ${S.music.stats[k].ok} / ${S.music.stats[k].total}</small>` : "";
    const mtile = (href, icon, key, k) => `<a class="tile" href="${href}"><span class="tile-icon">${icon}</span><span><b>${t(key)}</b><small>${t(key + ".sub")}</small>${st(k)}</span></a>`;
    view.innerHTML = `
      <a class="back" href="#/learn">← ${t("back")}</a>
      <h1>🎵 ${t("mu.title")}</h1>
      <p class="sub">${t("mu.intro")}</p>
      <h2>${t("mu.level")}</h2>
      <div class="seg" id="mu-level">${[1, 2, 3].map((n) => `<button class="${lv === n ? "sel" : ""}" data-l="${n}">${t("mu.stufe", { n })}</button>`).join("")}</div>
      <p class="fine">${t("mu.more")}</p>
      <h2>${t("mu.instrument")}</h2>
      <div class="seg" id="mu-instr">${["piano", "treble"].map((x) => `<button class="${S.music.instrument === x ? "sel" : ""}" data-i="${x}">${t("mu.instr." + x)}</button>`).join("")}</div>
      <div class="tiles one">
        ${mtile("#/musik/quiz", "📝", "mu.quiz", "quiz")}
        ${mtile("#/musik/melody", "🎹", "mu.melody", "melody")}
        ${mtile("#/musik/rhythm", "🥁", "mu.rhythm", "rhythm")}
        ${lv >= 3 ? mtile("#/musik/interval", "📏", "mu.interval", "interval") + mtile("#/musik/triad", "🎶", "mu.triad", "triad") : ""}
        ${mtile("#/musik/terms", "📖", "mu.terms", "")}
      </div>
      <p class="sub">🔊 ${t("mu.sound")}</p>
      <a class="btn ghost big" href="${MU_LINK}" target="_blank" rel="noopener">📄 ${t("mu.official")}</a>
      <p class="fine">${t("mu.disclaimer")}</p>`;
    $("#mu-instr").onclick = (e) => { const b = e.target.closest("[data-i]"); if (b) { S.music.instrument = b.dataset.i; save(); render(); } };
    $("#mu-level").onclick = (e) => { const b = e.target.closest("[data-l]"); if (b) { S.music.level = Number(b.dataset.l); save(); render(); } };
  });

  route("/musik/terms", () => {
    const lv = S.music.level;
    view.innerHTML = `
      <a class="back" href="#/musik">← ${t("back")}</a>
      <h1>📖 ${t("mu.terms")}</h1>
      ${[1, 2, 3].filter((n) => n <= lv).map((n) => `<h2>${t("mu.stufe", { n })}</h2>
        <section class="card"><table class="table terms">${MUSIK.TERMS.filter((x) => x.st === n).map((x) =>
          `<tr><td><b>${esc(x.t)}</b></td><td>${esc(L(x))}</td></tr>`).join("")}</table></section>`).join("")}`;
  });

  route("/musik/quiz", () => {
    const lv = S.music.level, qs = MUSIK.makeQuiz(lv);
    let i = 0, right = 0, picked = null;
    function draw() {
      if (i >= qs.length) {
        view.innerHTML = victoryHtml(t("es.sessionDone", { a: right, b: qs.length }),
          `<a class="btn primary" href="#/musik/quiz" id="mq-again">🔁 ${t("mu.quiz")}</a><a class="btn ghost" href="#/musik">${t("done")}</a>`, right / qs.length);
        $("#mq-again").onclick = (e) => { e.preventDefault(); render(); };
        return;
      }
      const q = qs[i], done = picked !== null;
      const sound = q.midi || q.midis || q.rhythm;
      view.innerHTML = `
        <a class="back" href="#/musik">← ${t("back")}</a>
        <div class="row"><b>${i + 1} / ${qs.length}</b><span class="pill">🎵 ${t("mu.stufe", { n: q.level })}</span></div>
        <div class="bar"><div style="width:${Math.round((i / qs.length) * 100)}%"></div></div>
        <section class="card center mu-q">
          ${q.html}
          ${sound && done ? `<button class="btn ghost small" id="mq-sound">${t("mu.hearIt")}</button>` : ""}
          <div class="options">${q.opts.map((o, j) => {
            let cls = ""; if (done && j === q.answer) cls = "right"; else if (done && j === picked) cls = "wrong";
            return `<button class="option ${cls}" data-j="${j}" ${done ? "disabled" : ""}>${esc(o)}</button>`;
          }).join("")}</div>
          ${done && q.explain ? `<div class="explain"><p>💡 ${esc(q.explain)}</p></div>` : ""}
          ${done ? `<button class="btn primary big" id="mq-next">${t("next")} →</button>` : ""}
        </section>`;
      if (!done) $$(".option").forEach((b) => (b.onclick = () => {
        picked = Number(b.dataset.j);
        const ok = picked === q.answer;
        muStat("quiz", ok);
        if (ok) { right++; toast(cheer() + " +" + award(2, true) + " ⭐"); }
        else logMistake("musik-" + q.gen, "Stufe " + q.level, q.opts[q.answer], q.opts[picked]);
        draw();
      }));
      else {
        $("#mq-next").onclick = () => { i++; picked = null; draw(); };
        if ($("#mq-sound")) $("#mq-sound").onclick = () => {
          if (q.rhythm) Sound.rhythm(q.rhythm, 80, true);
          else if (q.midis) Sound.melody(q.midis, 0.8);
          else Sound.note(q.midi);
        };
      }
    }
    draw();
  });

  // Melodie nachspielen
  route("/musik/melody", () => {
    const lv = S.music.level, rounds = 6, REF = 60; // Referenz: Grundton C
    let i = 0, right = 0, cur, input, result, heard;
    const nameOf = (m) => cur.keys.find((k) => k.midi === m).name;
    function newRound() { cur = MUSIK.makeMelody(lv); input = [cur.seq[0]]; result = null; heard = false; }
    function play() { heard = true; Sound.melodyWithReference(REF, cur.seq, 0.75); }
    newRound();
    function keyboardHtml(disabled) {
      // Weisse Tasten aus dem Tonraum, schwarze Tasten dazwischen (nur zur Orientierung)
      const whites = cur.keys;
      const blackAfter = new Set([60, 62, 65, 67, 69]); // nach C, D, F, G, A folgt eine schwarze Taste
      return `<div class="piano">${whites.map((k, idx) => `
        <button class="key" data-m="${k.midi}" ${disabled ? "disabled" : ""}><b>${esc(k.name)}</b></button>
        ${idx < whites.length - 1 && blackAfter.has(k.midi) ? `<span class="black" style="left:calc(${((idx + 1) / whites.length) * 100}% - 14px)"></span>` : ""}`).join("")}</div>`;
    }
    function draw() {
      if (i >= rounds) {
        view.innerHTML = victoryHtml(t("es.sessionDone", { a: right, b: rounds }),
          `<a class="btn primary" href="#/musik/melody" id="mm-again">🔁 ${t("mu.melody")}</a><a class="btn ghost" href="#/musik">${t("done")}</a>`, right / rounds);
        $("#mm-again").onclick = (e) => { e.preventDefault(); render(); };
        return;
      }
      const solution = cur.seq.map((m) => esc(nameOf(m))).join(" – ");
      view.innerHTML = `
        <a class="back" href="#/musik">← ${t("back")}</a>
        <div class="row"><b>${i + 1} / ${rounds}</b><span class="pill">🎯 ${right}</span></div>
        <section class="card center">
          <h2>🎹 ${t("mu.melody")}</h2>
          <p class="fine">${t("mu.refTone", { n: esc(MUSIK.noteName(0)) })}</p>
          <button class="btn primary big" id="mm-play">${heard ? t("mu.again") : t("mu.play")}</button>
          <button class="btn ghost small" id="mm-ref">🎯 ${t("mu.refOnly", { n: esc(MUSIK.noteName(0)) })}</button>
          <p><b>${t("mu.startsOn", { n: esc(nameOf(cur.seq[0])) })}</b></p>
          <div class="dots">${cur.seq.map((m, k) => `<span class="dot ${k < input.length ? "on" : ""}">${k === 0 || result ? esc(nameOf(k < input.length && !result ? input[k] : m)) : k < input.length ? "•" : ""}</span>`).join("")}</div>
          ${keyboardHtml(!heard || result)}
          ${result ? (result.ok ? `<p class="good">✅ ${solution}</p>` : `<p class="bad">${t("mu.wrongMelody")} ${solution}</p>`) +
            `<button class="btn primary big" id="mm-next">${t("next")} →</button>` : `<p class="fine">${heard ? t("mu.yourTurn") : ""}</p>`}
        </section>`;
      $("#mm-play").onclick = () => { play(); draw(); };
      $("#mm-ref").onclick = () => Sound.note(REF);
      $$(".piano .key:not([disabled])").forEach((b) => (b.onclick = () => {
        const m = Number(b.dataset.m); Sound.note(m); input.push(m);
        if (input.length === cur.seq.length) {
          const ok = input.every((x, k) => x === cur.seq[k]);
          result = { ok }; muStat("melody", ok);
          if (ok) { right++; toast(cheer() + " +" + award(3, false) + " ⭐"); }
          else { logMistake("musik-melodie", "Stufe " + lv, cur.seq.map(nameOf).join("-"), input.map(nameOf).join("-")); setTimeout(() => Sound.melodyWithReference(REF, cur.seq, 0.75), 500); }
        }
        draw();
      }));
      if ($("#mm-next")) $("#mm-next").onclick = () => { i++; newRound(); if (i < rounds) play(); draw(); };
    }
    draw();
  });

  // Rhythmus nachklopfen
  route("/musik/rhythm", () => {
    const lv = S.music.level, rounds = 5, BPM = 80;
    let i = 0, right = 0, toks = MUSIK.makeRhythm(lv), taps = [], result = null, playing = false, timer = null, expected = null;
    function evaluate() {
      clearTimeout(timer);
      const on = expected.onsetsBeats, beat = expected.beat;
      let ok = false, msg = "";
      if (taps.length !== on.length) msg = t("mu.rhythmCount", { a: taps.length, b: on.length });
      else if (on.length === 1) ok = true;
      else {
        const m = taps.slice(1).map((x, k) => (x - taps[k]) / 1000), e = on.slice(1).map((x, k) => (x - on[k]) * beat);
        const scale = m.reduce((a, b) => a + b, 0) / e.reduce((a, b) => a + b, 0);
        ok = scale > 0.6 && scale < 1.6 && m.every((x, k) => Math.abs(x / scale - e[k]) / beat <= 0.22);
        if (!ok) msg = t("mu.rhythmTiming");
      }
      result = { ok, msg }; muStat("rhythm", ok);
      if (ok) { right++; toast(cheer() + " +" + award(3, false) + " ⭐"); burst("🥁"); }
      else logMistake("musik-rhythmus", "Stufe " + lv, toks.join(" "), taps.length + " Taps");
      draw();
    }
    function draw() {
      if (i >= rounds) {
        view.innerHTML = victoryHtml(t("es.sessionDone", { a: right, b: rounds }),
          `<a class="btn primary" href="#/musik/rhythm" id="mr-again">🔁 ${t("mu.rhythm")}</a><a class="btn ghost" href="#/musik">${t("done")}</a>`, right / rounds);
        $("#mr-again").onclick = (e) => { e.preventDefault(); render(); };
        return;
      }
      view.innerHTML = `
        <a class="back" href="#/musik">← ${t("back")}</a>
        <div class="row"><b>${i + 1} / ${rounds}</b><span class="pill">🎯 ${right}</span></div>
        <section class="card center">
          <h2>🥁 ${t("mu.rhythm")}</h2>
          <p class="fine">${t("mu.tapHint")}</p>
          <button class="btn primary big" id="mr-play" ${playing ? "disabled" : ""}>${expected ? t("mu.again") : t("mu.play")}</button>
          <button class="tap-pad" id="mr-tap" ${!expected || playing || result ? "disabled" : ""}>${t("mu.tap")}<small>${taps.length ? "× " + taps.length : ""}</small></button>
          ${result ? `<p class="${result.ok ? "good" : "bad"}">${result.ok ? "✅" : "❌ " + esc(result.msg)}</p>${Notation.rhythmSvg(toks)}
            <button class="btn ghost small" id="mr-show">${t("mu.hearIt")}</button>
            <button class="btn primary big" id="mr-next">${t("next")} →</button>` : ""}
        </section>`;
      $("#mr-play").onclick = () => {
        taps = []; result = null; playing = true;
        expected = Sound.rhythm(toks, BPM, true);
        draw();
        setTimeout(() => { playing = false; draw(); }, expected.total * 1000);
      };
      const tap = $("#mr-tap");
      if (tap && !tap.disabled) tap.onpointerdown = (e) => {
        e.preventDefault();
        Sound.tap(); taps.push(performance.now());
        tap.querySelector("small").textContent = "× " + taps.length;
        tap.classList.remove("hit"); void tap.offsetWidth; tap.classList.add("hit");
        clearTimeout(timer);
        if (taps.length >= expected.onsetsBeats.length) timer = setTimeout(evaluate, 900);
        else timer = setTimeout(evaluate, 2500);
      };
      if ($("#mr-show")) $("#mr-show").onclick = () => Sound.rhythm(toks, BPM, false);
      if ($("#mr-next")) $("#mr-next").onclick = () => { i++; toks = MUSIK.makeRhythm(lv); taps = []; result = null; expected = null; draw(); };
    }
    draw();
  });

  // Intervalle / Dur-Moll hören (gemeinsamer Ablauf)
  function earRoute(kind, make, playFn, labelFn) {
    return () => {
      const rounds = 8;
      let i = 0, right = 0, cur = make(), picked = null;
      function draw() {
        if (i >= rounds) {
          view.innerHTML = victoryHtml(t("es.sessionDone", { a: right, b: rounds }),
            `<a class="btn primary" href="#/musik/${kind}" id="me-again">🔁 ${t("mu." + kind)}</a><a class="btn ghost" href="#/musik">${t("done")}</a>`, right / rounds);
          $("#me-again").onclick = (e) => { e.preventDefault(); render(); };
          return;
        }
        const done = picked !== null;
        view.innerHTML = `
          <a class="back" href="#/musik">← ${t("back")}</a>
          <div class="row"><b>${i + 1} / ${rounds}</b><span class="pill">🎯 ${right}</span></div>
          <section class="card center">
            <h2>${kind === "interval" ? "📏" : "🎶"} ${t("mu." + kind)}</h2>
            <button class="btn primary big" id="me-play">${t("mu.play")}</button>
            ${labelFn ? `<p class="fine">${labelFn(cur)}</p>` : ""}
            <div class="options">${cur.opts.map((o, j) => {
              let cls = ""; if (done && j === cur.answer) cls = "right"; else if (done && j === picked) cls = "wrong";
              return `<button class="option ${cls}" data-j="${j}" ${done ? "disabled" : ""}>${esc(o)}</button>`;
            }).join("")}</div>
            ${done ? `<button class="btn primary big" id="me-next">${t("next")} →</button>` : ""}
          </section>`;
        $("#me-play").onclick = () => playFn(cur);
        if (!done) $$(".option").forEach((b) => (b.onclick = () => {
          picked = Number(b.dataset.j);
          const ok = picked === cur.answer;
          muStat(kind, ok);
          if (ok) { right++; toast(cheer() + " +" + award(3, false) + " ⭐"); }
          else { logMistake("musik-" + kind, cur.midis.join(","), cur.opts[cur.answer], cur.opts[picked]); playFn(cur); }
          draw();
        }));
        else $("#me-next").onclick = () => { i++; cur = make(); picked = null; if (i < rounds) playFn(cur); draw(); };
      }
      draw();
    };
  }
  route("/musik/interval", earRoute("interval", () => MUSIK.makeIntervalEar(), (c) => Sound.melody(c.midis, 0.9), (c) => (c.up ? "⬆️ " + t("mu.up") : "⬇️ " + t("mu.down"))));
  route("/musik/triad", earRoute("triad", () => MUSIK.makeTriadEar(), (c) => Sound.chord(c.midis, c.arpeggio)));

  // ---------- Karten-Quiz (NMG): Bezirke Aargau, Kantone CH ----------
  const MAP_KEYS = Object.keys(MAPS); // neue Karten: tools/build_karten.py
  const geoRec = (mk) => (S.geo[mk] = S.geo[mk] || { ok: 0, total: 0, rounds: 0, best: null });
  function fmtTime(sec) { return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); }
  const regName = (mk, r) => (r.ab ? `${r.name} (${r.ab})` : r.name);

  function mapSvg(mk) {
    const M = MAPS[mk];
    return `<svg class="map ${M.small ? "map-small" : ""}" viewBox="0 0 ${M.w} ${M.h}" role="img" aria-label="${esc(L(M.title))}">
      ${M.outline ? `<defs><clipPath id="clip-${mk}"><path d="${M.outline}"/></clipPath></defs>` : ""}
      ${M.regions.map((r) => `<path class="reg" data-id="${r.id}" d="${r.d}"></path>`).join("")}
      <path class="lake" d="${M.lakes}" ${M.outline ? `clip-path="url(#clip-${mk})"` : ""}/>
      ${M.regions.map((r) => `<text class="lbl" data-l="${r.id}" x="${r.lx}" y="${r.ly}">${esc(r.ab || r.name)}</text>`).join("")}
    </svg>`;
  }
  function mapWrap(mk) {
    return `<div class="map-wrap" id="map-wrap">${mapSvg(mk)}</div>
      <div class="row map-tools"><button class="btn ghost small" id="map-zoom">🔍 ${t("map.zoom")}</button><small class="fine">${t("map.source")}</small></div>`;
  }
  function bindZoom() {
    $("#map-zoom").onclick = () => $("#map-wrap").classList.toggle("zoom");
  }

  route("/karten", () => {
    const nw = takeNew("karten");
    view.innerHTML = `
      <a class="back" href="#/">← ${t("back")}</a>
      <h1>🗺️ ${t("map.title")}</h1>
      <p class="intro">${t("map.intro")}</p>
      ${MAP_KEYS.map((mk) => {
        const g = S.geo[mk];
        return `<section class="card"><h2>${esc(L(MAPS[mk].title))}${newTag(nw, mk)}</h2>
          <p class="fine">${MAPS[mk].regions.length} ${t("map.regions")}${g && g.best ? " · ⏱️ " + t("map.best", { t: fmtTime(g.best) }) : ""}${g && g.total ? ` · 🎯 ${Math.round((g.ok / g.total) * 100)}%` : ""}</p>
          <div class="tiles one">
            ${tile(`#/karten/${mk}/explore`, "👀", "map.explore")}
            ${tile(`#/karten/${mk}/find`, "👆", "map.find")}
            ${tile(`#/karten/${mk}/name`, "🏷️", "map.name")}
          </div></section>`;
      }).join("")}`;
  });

  route("/karten/:map/explore", (mk) => {
    if (!MAPS[mk]) return (location.hash = "#/karten");
    view.innerHTML = `
      <a class="back" href="#/karten">← ${t("back")}</a>
      <h1>👀 ${esc(L(MAPS[mk].title))}</h1>
      <p>${t("map.exploreHint")}</p>
      <label class="check"><input type="checkbox" id="map-all"> ${t("map.labels")}</label>
      <p class="map-say" id="map-say">&nbsp;</p>
      ${mapWrap(mk)}
      <a class="btn primary big" href="#/karten/${mk}/find">👆 ${t("map.ready")}</a>`;
    bindZoom();
    const svg = $(".map");
    $("#map-all").onchange = (e) => svg.classList.toggle("labels", e.target.checked);
    svg.onclick = (e) => {
      const p = e.target.closest(".reg"); if (!p) return;
      const r = MAPS[mk].regions.find((x) => x.id === p.dataset.id);
      $$(".reg.sel", svg).forEach((x) => x.classList.remove("sel"));
      $$(".lbl.show", svg).forEach((x) => x.classList.remove("show"));
      p.classList.add("sel");
      $(`[data-l="${r.id}"]`, svg).classList.add("show");
      $("#map-say").textContent = "📍 " + regName(mk, r);
    };
  });

  route("/karten/:map/:mode", (mk, mode) => {
    if (!MAPS[mk] || !["find", "name"].includes(mode)) return (location.hash = "#/karten");
    const regs = MAPS[mk].regions;
    const order = shuffle(regs.slice());
    const g = geoRec(mk);
    let i = 0, tries = 0, right = 0, busy = false;
    const t0 = Date.now();
    view.innerHTML = `
      <a class="back" href="#/karten">← ${t("back")}</a>
      <div class="row"><b id="map-n"></b><span class="pill">🎯 <span id="map-right">0</span></span><span class="pill">⏱️ <span id="map-time">0:00</span></span></div>
      <div class="bar"><div id="map-bar" style="width:0%"></div></div>
      <p class="map-ask" id="map-ask"></p>
      <div class="options" id="map-opts"></div>
      ${mapWrap(mk)}
      <p class="map-say" id="map-say">&nbsp;</p>`;
    bindZoom();
    const svg = $(".map");
    const regEl = (id) => $(`.reg[data-id="${id}"]`, svg);
    const showLbl = (id) => $(`[data-l="${id}"]`, svg).classList.add("show");
    const timer = setInterval(() => {
      const el = $("#map-time");
      if (!el) return clearInterval(timer);
      el.textContent = fmtTime(Math.round((Date.now() - t0) / 1000));
    }, 500);

    function ask() {
      if (i >= order.length) return finish();
      tries = 0; busy = false;
      const r = order[i];
      $("#map-n").textContent = `${i + 1} / ${order.length}`;
      $("#map-bar").style.width = Math.round((i / order.length) * 100) + "%";
      $("#map-say").innerHTML = "&nbsp;";
      if (mode === "find") {
        $("#map-ask").innerHTML = t("map.where", { n: `<b>${esc(regName(mk, r))}</b>` });
        return;
      }
      // Benennen: Gebiet leuchtet, 4 Namen zur Auswahl
      $$(".reg.target", svg).forEach((x) => x.classList.remove("target"));
      regEl(r.id).classList.add("target");
      $("#map-ask").textContent = t("map.which");
      const choices = shuffle([r, ...shuffle(regs.filter((x) => x.id !== r.id)).slice(0, 3)]);
      $("#map-opts").innerHTML = choices.map((c) => `<button class="option" data-id="${c.id}">${esc(regName(mk, c))}</button>`).join("");
      $$("#map-opts .option").forEach((b) => (b.onclick = () => {
        if (busy) return; busy = true;
        const ok = b.dataset.id === r.id;
        $$("#map-opts .option").forEach((x) => { x.disabled = true; if (x.dataset.id === r.id) x.classList.add("right"); });
        regEl(r.id).classList.remove("target");
        if (ok) hit(r, 1); else { b.classList.add("wrong"); miss(r, regs.find((x) => x.id === b.dataset.id)); }
      }));
    }

    function hit(r, nTry) {
      right++; g.ok++; g.total++;
      regEl(r.id).classList.add(nTry === 1 ? "ok1" : "ok2"); showLbl(r.id);
      const pts = award(nTry === 1 ? 2 : 1, false);
      $("#map-right").textContent = right;
      $("#map-say").textContent = `✅ ${cheer()} ${regName(mk, r)} +${pts} ⭐`;
      save(); i++; setTimeout(ask, 900);
    }
    function miss(r, given) {
      g.total++;
      regEl(r.id).classList.add("miss"); showLbl(r.id);
      logMistake("karte-" + mk, r.id, r.name, given ? given.name : "?");
      $("#map-say").textContent = `❌ ${t("map.itWas", { n: regName(mk, r) })}`;
      save(); i++; setTimeout(ask, 1800);
    }

    svg.onclick = (e) => {
      if (mode !== "find" || busy || i >= order.length) return;
      const p = e.target.closest(".reg"); if (!p) return;
      const r = order[i];
      if (p.dataset.id === r.id) { busy = true; return hit(r, tries + 1); }
      tries++;
      const wrong = regs.find((x) => x.id === p.dataset.id);
      p.classList.add("bad"); setTimeout(() => p.classList.remove("bad"), 700);
      if (tries >= 2) { busy = true; return miss(r, wrong); }
      $("#map-say").textContent = `🤔 ${t("map.thatWas", { n: regName(mk, wrong) })}`;
    };

    function finish() {
      clearInterval(timer);
      const sec = Math.round((Date.now() - t0) / 1000);
      g.rounds++;
      let best = "";
      if (right === order.length && (!g.best || sec < g.best)) { g.best = sec; best = `<p><b>🏆 ${t("map.newBest")}</b></p>`; burst("🗺️"); }
      save();
      $("#map-bar").style.width = "100%";
      $("#map-ask").innerHTML = ""; $("#map-opts").innerHTML = "";
      const box = document.createElement("div");
      box.innerHTML = victoryHtml(t("map.result", { a: right, b: order.length, t: fmtTime(sec) }) + best,
        `<a class="btn primary" href="#/karten/${mk}/${mode}" id="map-again">🔁 ${t("map.again")}</a>
         <a class="btn ghost" href="#/karten">${t("done")}</a>`, right / order.length);
      view.prepend(box.firstElementChild);
      $("#map-again").onclick = (e) => { e.preventDefault(); render(); };
      window.scrollTo(0, 0);
    }
    ask();
  });

  // ---------- Ich ----------
  route("/me", () => {
    const totalWords = S.journal.reduce((a, e) => a + words(e.text), 0) + words(S.myWhy || "");
    const kgSolved = Object.values(S.kg).reduce((a, r) => a + Object.values(r).filter((x) => x.ok).length, 0);
    const pzSolved = Object.values(S.pz).filter((x) => x.ok).length;
    view.innerHTML = `
      <h1>${t("me.title")}</h1>
      <a class="card locker-teaser" href="#/locker"><div class="hero-av">${avatar()}</div>
        <div><b>${esc(L(currentSkin().name))}</b><small>${t("game.level", { n: levelOf(S.points) })} · ${t("game.locker")} →</small>${levelBarHtml(true)}</div></a>
      <section class="card">
        <h2>${t("me.stats")}</h2>
        <div class="stat-grid">
          ${stat("⭐", S.points, "stats.points")}
          ${stat("🔥", S.streak.best, "stats.best")}
          ${stat("🦘", kgSolved, "stats.kg")}
          ${stat("🧩", pzSolved, "stats.pz")}
          ${stat("🏛️", Object.keys(S.club).length, "stats.club")}
          ${stat("✍️", totalWords, "stats.words")}
          ${stat("🇪🇸", Object.values(S.es.words).filter((w) => w.box >= 3).length, "stats.es")}
        </div>
      </section>
      <section class="card">
        <h2>${t("me.badges")}</h2>
        <div class="badges">${BADGES.map((b) => `<div class="badge ${S.badges[b.id] ? "got" : ""}"><span>${b.icon}</span><b>${t("badge." + b.id)}</b><small>${t("badge." + b.id + ".d")}</small></div>`).join("")}</div>
      </section>
      <section class="card">
        <h2>${t("me.profile")}</h2>
        <label class="field">${t("me.nickname")}<input id="p-name" maxlength="20" value="${esc(S.profile.name)}"></label>
        <label class="field">${t("me.appName")}<input id="p-app" maxlength="24" value="${esc(S.profile.appName)}"></label>
        <p class="label">${t("me.mascot")}</p>
        <div class="choices" id="p-mascots">${MASCOTS.map((m) => `<button class="choice ${m === S.profile.mascot ? "sel" : ""}" data-m="${m}">${m}</button>`).join("")}</div>
        <p class="label">${t("me.color")}</p>
        <div class="choices" id="p-colors">${COLORS.map((c) => `<button class="swatch ${c === S.profile.color ? "sel" : ""}" data-c="${c}" style="background:${c}" aria-label="${c}"></button>`).join("")}</div>
        <button class="btn primary" id="p-save">${t("save")}</button>
      </section>
      <a class="btn ghost big" href="#/parents">🔒 ${t("me.parents")}</a>`;
    $("#p-mascots").onclick = (e) => { const b = e.target.closest("[data-m]"); if (b) { S.profile.mascot = b.dataset.m; save(); render(); } };
    $("#p-colors").onclick = (e) => { const b = e.target.closest("[data-c]"); if (b) { S.profile.color = b.dataset.c; save(); render(); } };
    $("#p-save").onclick = () => {
      S.profile.name = $("#p-name").value.trim() || S.profile.name;
      S.profile.appName = $("#p-app").value.trim() || "Lern-Club";
      save(); toast("✅"); render();
    };
  });
  function stat(icon, n, key) { return `<div class="stat"><span>${icon}</span><b>${n}</b><small>${t(key)}</small></div>`; }

  // ---------- Elternbereich ----------
  async function hashPin(pin) {
    const data = "lernclub:" + pin;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
      return "s:" + Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    let h = 2166136261;
    for (let i = 0; i < data.length; i++) { h ^= data.charCodeAt(i); h = Math.imul(h, 16777619); }
    return "f:" + (h >>> 0).toString(16);
  }

  route("/parents", () => {
    if (!parentUnlocked) {
      const setting = !S.pin;
      view.innerHTML = `
        <a class="back" href="#/me">← ${t("back")}</a>
        <section class="card center">
          <h1>🔒 ${t("parent.title")}</h1>
          <p>${setting ? t("parent.setPin") : t("parent.enterPin")}</p>
          <input id="pin" class="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off">
          <button class="btn primary" id="pin-go">OK</button>
          <p class="msg" id="pin-msg"></p>
        </section>`;
      const go = async () => {
        const v = $("#pin").value;
        if (!/^\d{4}$/.test(v)) return;
        const h = await hashPin(v);
        if (setting) { S.pin = h; save(); parentUnlocked = true; render(); }
        else if (h === S.pin) { parentUnlocked = true; render(); }
        else { $("#pin-msg").textContent = t("parent.wrongPin"); $("#pin").value = ""; }
      };
      $("#pin-go").onclick = go;
      $("#pin").onkeyup = (e) => { if (e.key === "Enter" || e.target.value.length === 4) go(); };
      $("#pin").focus();
      return;
    }

    const days = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(dayKey(d)); }
    const max = Math.max(DAILY_GOAL, ...days.map((d) => S.days[d] || 0));
    const kgRows = KAENGURU.filter((k) => S.kg[k.id] && Object.keys(S.kg[k.id]).length).map((k) => {
      const r = Object.values(S.kg[k.id]);
      const ok1 = r.filter((x) => x.ok && x.tries === 1).length, ok2 = r.filter((x) => x.ok && x.tries === 2).length, fail = r.filter((x) => x.done && !x.ok).length;
      return `<tr><td>${k.year} · ${k.level}</td><td>${ok1}</td><td>${ok2}</td><td>${fail}</td><td>${k.answers.length}</td></tr>`;
    }).join("");

    view.innerHTML = `
      <a class="back" href="#/me">← ${t("back")}</a>
      <h1>🔒 ${t("parent.title")}</h1>
      <p class="fine">${t("parent.privacy")}</p>
      <section class="card ${backupOverdue() ? "warn" : ""}">
        <p><b>💾 ${t("parent.lastBackup", { d: S.lastBackup ? new Date(S.lastBackup).toLocaleDateString("de-CH") : t("parent.never") })}</b></p>
        ${backupOverdue() ? `<p>${t("parent.backupWarn")}</p>` : ""}
        <button class="btn primary" id="par-export2">⬇️ ${t("parent.export")}</button>
        <button class="btn ghost" id="par-archive">📜 ${t("arc.export")}</button>
      </section>
      <section class="card">
        <h2>🎯 ${t("parent.focus")}</h2>
        <p class="fine">${t("parent.focusHint")}</p>
        <select id="par-focus" class="select">
          <option value="">${t("parent.focusNone")}</option>
          ${MODULES.map((m) => `<option value="${m.id}" ${S.focus === m.id ? "selected" : ""}>${m.icon} ${t(m.tile)}</option>`).join("")}
        </select>
        <h3>${t("parent.lastUsed")}</h3>
        <table class="table"><tbody>${MODULES.map((m) => {
          const d = S.modLast[m.id], ago = d ? daysBetween(d, dayKey()) : null;
          return `<tr class="${ago === null || ago > 7 ? "stale" : ""}"><td>${m.icon} ${t(m.tile)}</td><td>${d ? new Date(d).toLocaleDateString("de-CH") + (ago ? ` (${t("parent.daysAgo", { n: ago })})` : ` (${t("parent.today")})`) : t("parent.never")}</td></tr>`;
        }).join("")}</tbody></table>
      </section>
      <section class="card">
        <h2>${t("parent.activity")}</h2>
        <div class="chart">${days.map((d) => `<div class="col" title="${d}: ${S.days[d] || 0}"><div style="height:${Math.round(((S.days[d] || 0) / max) * 100)}%"></div><small>${d.slice(8)}</small></div>`).join("")}</div>
        <p>⭐ ${S.points} · 🔥 ${displayStreak()} (max ${S.streak.best}) · 🃏 ${S.streak.jokers}</p>
      </section>
      <section class="card">
        <h2>📓 ${t("parent.journal")}</h2>
        ${S.myWhy ? `<div class="entry mywhy"><small>⭐ ${t("journal.my")}</small><p>${esc(S.myWhy)}</p></div>` : ""}
        <div class="entries">${S.journal.length ? S.journal.map(entryHtml).join("") : `<p>${t("journal.none")}</p>`}</div>
      </section>
      <section class="card">
        <h2>🇪🇸 ${t("parent.es")}</h2>
        ${(() => {
          const boxes = [0, 0, 0, 0, 0, 0];
          Object.values(S.es.words).forEach((w) => boxes[w.box || 0]++);
          const total = ES_VOCAB.reduce((a, th) => a + th.words.length, 0);
          const rulesDone = ES_RULES.filter((r) => S.es.rules[r.id] && S.es.rules[r.id].done).length;
          return `<table class="table"><thead><tr><th></th>${[1, 2, 3, 4, 5].map((b) => `<th>📦 ${b}</th>`).join("")}</tr></thead>
            <tbody><tr><td>${Object.keys(S.es.words).length} / ${total}</td>${[1, 2, 3, 4, 5].map((b) => `<td>${boxes[b]}</td>`).join("")}</tr></tbody></table>
            <p>✍️ ${t("es.rules")}: ${rulesDone} / ${ES_RULES.length} · 🕵️ ${t("es.accent")}: ${S.es.accent.ok} / ${S.es.accent.total}</p>`;
        })()}
      </section>
      <section class="card">
        <h2>📮 ${t("parent.ideas")}</h2>
        <div class="entries">${S.ideas.length ? S.ideas.map(entryHtml).join("") : "<p>–</p>"}</div>
      </section>
      <section class="card">
        <h2>🦘 ${t("parent.kg")}</h2>
        ${kgRows ? `<table class="table"><thead><tr><th></th><th>✅ 1.</th><th>✅ 2.</th><th>❌</th><th>Σ</th></tr></thead><tbody>${kgRows}</tbody></table>` : "<p>–</p>"}
      </section>
      <section class="card">
        <h2>🛠️ ${t("parent.report")}</h2>
        <p class="fine">${t("parent.reportHint")}</p>
        <label class="check"><input type="checkbox" id="rep-journal"> ${t("parent.reportJournal")}</label>
        <button class="btn primary" id="par-report">📄 ${t("parent.report")}</button>
      </section>
      <section class="card">
        <button class="btn primary" id="par-export">⬇️ ${t("parent.export")}</button>
        <label class="btn ghost">⬆️ ${t("parent.import")}<input type="file" id="par-import" accept="application/json" hidden></label>
        <button class="btn bad" id="par-reset">🗑️ ${t("parent.reset")}</button>
        <button class="btn ghost" id="par-lock">🔒 ${t("parent.lock")}</button>
      </section>`;

    $("#par-report").onclick = () => {
      const md = buildReport($("#rep-journal").checked);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `lernclub-bericht-${dayKey()}.md`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    $("#par-export").onclick = () => {
      const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `lernclub-backup-${dayKey()}.json`;
      a.click();
      S.lastBackup = new Date().toISOString(); save();
      setTimeout(() => render(), 300);
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    $("#par-focus").onchange = (e) => {
      S.focus = e.target.value;
      // heutige Missionen neu würfeln, damit der Fokus sofort drin ist (Fortschritt bleibt erhalten, wo möglich)
      if (S.focus && S.missions && !S.missions.list.some((x) => x.mod === S.focus) && !S.missions.chest) {
        S.missions.list[2] = { mod: S.focus, need: modById(S.focus).need, have: 0 };
      }
      save(); toast("✅ " + t("parent.focus"));
    };
    $("#par-export2").onclick = () => $("#par-export").click();
    $("#par-archive").onclick = () => downloadArchive();
    $("#par-import").onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { S = deepMerge(fresh(), JSON.parse(await f.text())); save(); toast("✅"); render(); }
      catch (err) { toast("❌ " + err.message); }
    };
    $("#par-reset").onclick = () => {
      if (confirm(t("parent.resetConfirm"))) { localStorage.removeItem(STORE_KEY); S = fresh(); parentUnlocked = false; location.hash = "#/"; render(); }
    };
    $("#par-lock").onclick = () => { parentUnlocked = false; location.hash = "#/me"; };
  });

  // ---------- Start ----------
  $("#lang-toggle").onclick = () => { S.lang = { de: "en", en: "es", es: "de" }[S.lang] || "de"; save(); render(); };
  window.addEventListener("hashchange", () => { if (!location.hash.startsWith("#/parents")) parentUnlocked = false; render(); });
  render();

  // Browser bitten, die Daten dauerhaft zu behalten (nicht automatisch aufräumen)
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
