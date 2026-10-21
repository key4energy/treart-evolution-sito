/* ================= NUCLEO: utilità, icone, struttura, moduli ================= */

const ICONS = {
  phone: "M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  chat: "M20.5 11.5a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1.4-4.6A8.5 8.5 0 1 1 20.5 11.5z M8.5 11.5h.01 M12 11.5h.01 M15.5 11.5h.01",
  mail: "M3 5.5h18v13H3z M3 6.5l9 6.5 9-6.5",
  pin: "M12 21s-7-6.2-7-11.2a7 7 0 0 1 14 0C19 14.8 12 21 12 21z M12 7.3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5z",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18z M12 7v5l3.5 2",
  shield: "M12 3l8 3v5.5c0 5-3.4 8.4-8 9.5-4.6-1.1-8-4.5-8-9.5V6z",
  lock: "M5.5 11h13v10h-13z M8 11V8a4 4 0 0 1 8 0v3 M12 15v2.5",
  key: "M8 11a4 4 0 1 0 0 8 4 4 0 1 0 0-8z M10.8 12.2L20 3 M16.5 6.5l2.5 2.5 M13.8 9.2l2 2",
  monitor: "M3 4.5h18v12H3z M8.5 20.5h7 M12 16.5v4",
  laptop: "M5 5h14v10H5z M2.5 18.5h19",
  server: "M4 4h16v6H4z M4 14h16v6H4z M7.5 7h.01 M7.5 17h.01 M11 7h5 M11 17h5",
  database: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  cloud: "M7 18.5a4.5 4.5 0 1 1 .8-8.9A6 6 0 0 1 19.2 11a3.8 3.8 0 0 1-1 7.5z",
  refresh: "M20 11a8 8 0 0 0-14.3-4.9L4 8 M4 3.5V8h4.5 M4 13a8 8 0 0 0 14.3 4.9L20 16 M20 20.5V16h-4.5",
  wifi: "M2.5 8.8a14 14 0 0 1 19 0 M5.5 12.2a9.5 9.5 0 0 1 13 0 M8.7 15.5a5 5 0 0 1 6.6 0 M12 19h.01",
  router: "M3 13.5h18v6H3z M7 16.5h.01 M10.5 16.5h.01 M17 13.5V6 M14 8.5a4.2 4.2 0 0 1 6 0",
  network: "M9 3h6v5H9z M12 8v4 M5 16v-4h14v4 M2.5 16h5v5h-5z M9.5 16h5v5h-5z M16.5 16h5v5h-5z",
  antenna: "M12 12v9 M8.5 21h7 M12 10.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 1 0 0-3.4z M8.2 8.2a5.4 5.4 0 0 0 0 7.6 M15.8 8.2a5.4 5.4 0 0 1 0 7.6 M5.4 5.4a9.3 9.3 0 0 0 0 13.2 M18.6 5.4a9.3 9.3 0 0 1 0 13.2",
  satellite: "M4 10a10 10 0 0 0 10 10z M9 15l4.5-4.5 M14 9.5h.01 M14.5 5a4.5 4.5 0 0 1 4.5 4.5 M14.5 1.5a8 8 0 0 1 8 8",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18z M3 12h18 M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z",
  search: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 1 0 0-13z M20 20l-4.8-4.8",
  cursor: "M5 3.5l5.5 16 2.4-6.6 6.6-2.4z",
  chart: "M4 20V11 M9.5 20V5 M15 20v-7 M20.5 20V8 M2.5 20.5h19",
  at: "M16 12a4 4 0 1 1-1.2-2.9 M16 8.5V13a2.5 2.5 0 0 0 5 0v-1a9 9 0 1 0-3.6 7.2",
  stamp: "M12 3l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 21l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z M9 12l2 2 4-4",
  inbox: "M3 13l3-8h12l3 8v6H3z M3 13h5l1.2 3h5.6L16 13h5",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6z",
  camera: "M2.5 8.5l13-3.5 2.2 6.5-13 3.5z M17.2 9.7l4.3-1.2v5l-3.6-.4 M7 14v6 M4 20.5h6",
  users: "M9 11a3.8 3.8 0 1 0 0-7.6A3.8 3.8 0 0 0 9 11z M2.5 20.5v-1A5.5 5.5 0 0 1 8 14h2a5.5 5.5 0 0 1 5.5 5.5v1 M16 3.6a3.8 3.8 0 0 1 0 7.3 M21.5 20.5v-1a5.5 5.5 0 0 0-3.5-5.1",
  user: "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4.5 21v-1A6.5 6.5 0 0 1 11 13.5h2a6.5 6.5 0 0 1 6.5 6.5v1",
  home: "M3 11l9-7.5 9 7.5 M5.5 9.5V20h13V9.5 M10 20v-5.5h4V20",
  folder: "M3 6.5h6l2 2.5h10v10.5H3z",
  smartphone: "M7 2.5h10v19H7z M11 18.5h2",
  file: "M6 3h8.5L19 7.5V21H6z M14 3v5h5 M9 12.5h6 M9 16.5h6",
  clipboard: "M9 3.5h6v3H9z M7.5 5H5v16h14V5h-2.5 M8.5 11h7 M8.5 15h7",
  box: "M3 7.5l9-4.5 9 4.5v9l-9 4.5-9-4.5z M3 7.5l9 4.5 9-4.5 M12 12v9",
  plug: "M9 2.5v5 M15 2.5v5 M6 7.5h12v3a6 6 0 0 1-12 0z M12 16.5v5",
  check: "M5 12.5l4.5 4.5L19 7.5",
  "check-circle": "M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18z M8 12.3l2.8 2.8L16.2 9.5",
  x: "M6 6l12 12 M18 6L6 18",
  bell: "M6 16.5V11a6 6 0 0 1 12 0v5.5l1.8 2H4.2z M10 20.5a2 2 0 0 0 4 0",
  alert: "M12 3.5l9.5 16.5h-19z M12 10v4.5 M12 17.5h.01",
  gauge: "M3.5 16a8.5 8.5 0 0 1 17 0 M12 16l4.2-5.2 M12 16h.01 M6.2 10.2l1.2 1.1 M12 7.5v1.6",
  wrench: "M14.7 6.3a4 4 0 0 0-5.3 5.3L3.5 17.5l3 3 5.9-5.9a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.4-.6-.6-2.4z",
  calendar: "M4 5h16v15.5H4z M4 10h16 M8.5 3v4 M15.5 3v4",
  euro: "M17.5 6.5A6.5 6.5 0 1 0 17.5 17.5 M4 10h9.5 M4 14h9.5",
  building: "M4 21V4h10v17 M14 9h6v12 M2.5 21h19 M7.5 8h3 M7.5 12h3 M7.5 16h3 M17 13h.01 M17 17h.01",
  bed: "M3 19V6.5 M3 15h18v4 M21 15v-2.5a3 3 0 0 0-3-3h-7.5V15 M6.8 12.5a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8z",
  briefcase: "M3 8h18v12H3z M9 8V5h6v3 M3 13.5h18 M11 13.5v2h2v-2",
  store: "M4 10.5V20h16v-9.5 M3 4h18l-1 6.5H4z M9.5 20v-5.5h5V20",
  leaf: "M5 19.5C5 10 11 5.5 20.5 4c-.8 9.5-5.5 15.5-15.5 15.5z M5 19.5l7.5-7.5",
  factory: "M3 21V11l5.5 3.5V11l5.5 3.5V7h7v14z M2 21h20 M7 17.5h2 M12 17.5h2 M17 17.5h1.5",
  star: "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9 6.7 19.7l1.1-5.9-4.3-4.1 5.9-.8z",
  "arrow-right": "M5 12h14 M13.5 6.5L19 12l-5.5 5.5",
  "arrow-left": "M19 12H5 M10.5 6.5L5 12l5.5 5.5",
  "chevron-down": "M6 9.5l6 6 6-6",
  "chevron-right": "M9.5 6l6 6-6 6",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  copy: "M8.5 8.5h11v11h-11z M15.5 8.5v-4h-11v11h4",
  external: "M14 4h6v6 M20 4l-8.5 8.5 M18 14v6H4V6h6",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z",
  calc: "M5.5 3h13v18h-13z M8.5 6.5h7v3h-7z M8.5 13.5h.01 M12 13.5h.01 M15.5 13.5h.01 M8.5 17.5h.01 M12 17.5h.01 M15.5 17.5h.01",
  send: "M3.5 11.5L20.5 4l-7.5 17-2.2-7.3z M10.8 13.7L20.5 4",
  headset: "M4 14.5V12a8 8 0 0 1 16 0v2.5 M4 14h3.5v6H5.5A1.5 1.5 0 0 1 4 18.5z M20 14h-3.5v6h2a1.5 1.5 0 0 0 1.5-1.5z M16.5 20c0 1-1.5 1.5-3.5 1.5",
  printer: "M6.5 9V3.5h11V9 M4 9h16v8H4z M7 14h10v7H7z",
  siren: "M6.5 17.5V12a5.5 5.5 0 0 1 11 0v5.5 M4 17.5h16v3H4z M12 3v1.5 M4.6 5.6l1.1 1.1 M19.4 5.6l-1.1 1.1 M12 12v3",
  card: "M3 6h18v12H3z M3 10h18 M6.5 14.5h4",
  elevator: "M5 3h14v18H5z M9 9.5l3-3 3 3 M9 14.5l3 3 3-3",
  plus: "M12 5v14 M5 12h14",
  dots: "M6 12h.01 M12 12h.01 M18 12h.01",
  map: "M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z M9 4v13.5 M15 6.5V20",
  qr: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h2.5v2.5H14z M18.5 14H20 M14 18.5V20 M17.5 17.5H20V20h-2.5z",
  dot: "M12 12h.01",
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
/* testo con segnaposto: [x] diventa un dato da completare, {{x|nota}} un dato da confermare */
function t(s) {
  let out = esc(s);
  out = out.replace(/\{\{([^|}]+)\|([^}]+)\}\}/g, (m, a, b) => `<span class="tbc tbc--soft" data-note="${b}">${a}</span>`);
  out = out.replace(/\[([^\]]+)\]/g, '<span class="tbc">[$1]</span>');
  return out;
}
const plain = (s) => String(s).replace(/\{\{([^|}]+)\|[^}]+\}\}/g, "$1");
const soft = (text, note) => `<span class="tbc tbc--soft" data-note="${esc(note)}">${esc(text)}</span>`;
const ic = (n, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${ICONS[n] || ICONS.dot}"/></svg>`;
const icDot = (n, cls = "") => `<span class="ic-dot ${cls}">${ic(n)}</span>`;
const logo = (v = "pos", label = "Treart Evolution") => `<svg class="logo logo--${v}" viewBox="${ASSET.logoVB}" role="img" aria-label="${label}"><use href="#logo"/></svg>`;
const bigE = (cls) => `<svg class="${cls}" viewBox="${ASSET.eVB}" aria-hidden="true" focusable="false"><use href="#bige"/></svg>`;
const circleE = (cls) => `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="50" fill="#B3D670"/><svg x="18" y="17" width="64" height="66" viewBox="${ASSET.eVB}" style="color:#FFFFFF"><use href="#bige"/></svg></svg>`;
const waHref = (text) => `https://wa.me/${C.wa}?text=${encodeURIComponent(text)}`;
const mailHref = (subj, body) => `mailto:${C.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
const euro = (n) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.round(n));
const num = (n) => new Intl.NumberFormat("it-IT").format(n);
const reduceMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem("treart:" + k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem("treart:" + k, JSON.stringify(v)); } catch (e) { /* memoria del browser non disponibile */ } },
};

/* ---------- link standard ---------- */
const waBtn = (text, label = "Scrivici su WhatsApp", cls = "btn btn--wa") => `<a class="${cls}" href="${waHref(text)}" target="_blank" rel="noopener">${ic("chat")}${label}</a>`;
const telLink = (cls = "") => `<a class="${cls}" href="${C.telHref}">${C.tel}</a>`;
function ctaHref(cta) { return "#" + cta.to; }
function ctaAttrs(cta, extra = {}) {
  let a = "";
  if (cta.type) a += ` data-checkup="${cta.type}"`;
  if (extra.prefill) a += ` data-prefill="${extra.prefill}"`;
  return a;
}

/* ---------- scadenze ---------- */
function daysTo(iso) { return Math.ceil((new Date(iso) - new Date()) / 86400000); }
function dlState(d) {
  const now = new Date();
  if (now > new Date(d.end)) return "past";
  if (d.start && now < new Date(d.start)) return "soon";
  return "open";
}
function dlBadge(d) {
  const st = dlState(d);
  if (st === "past") return { txt: d.after || "Chiuso", soft: true };
  if (d.noCount) return { txt: "", soft: false };
  if (st === "soon") { const n = daysTo(d.start); return { txt: n <= 1 ? "si apre domani" : `si apre tra ${n} giorni`, soft: false }; }
  const n = daysTo(d.end);
  return { txt: n <= 0 ? "ultimo giorno" : n === 1 ? "manca 1 giorno" : `mancano ${n} giorni`, soft: false };
}

/* ---------- stato condiviso tra le pagine ---------- */
const S = { prefill: null, scrollTo: null, checkup: null, notes: "", first: true };
const ROUTES = {};
const route = (tok, def) => { ROUTES[tok] = def; };
function current() {
  let h = location.hash.replace(/^#/, "");
  try { h = decodeURIComponent(h); } catch (e) { /* hash non valido */ }
  return h || "home";
}
function go(tok) {
  if (current() === tok) render(); else location.hash = tok;
}

/* ---------- struttura: barra scadenze ---------- */
let tickIdx = 0, tickTimer = null, tickHold = false;
function tickItems() { return DEADLINES.filter((d) => dlState(d) !== "past"); }
function renderTick() {
  const items = tickItems();
  const el = $("#tick-msg");
  if (!items.length || !el) { $("#tick") && ($("#tick").hidden = true); return; }
  tickIdx = tickIdx % items.length;
  const d = items[tickIdx];
  const b = dlBadge(d);
  el.setAttribute("href", "#" + d.to);
  el.innerHTML = `<span class="l">${d.tick}${b.txt ? ` · <em>${b.txt}</em>` : ""}</span><span class="s">${d.short}${b.txt ? ` · <em>${b.txt}</em>` : ""}</span>`;
  const nx = $("#tick-next");
  if (nx) { nx.textContent = `${tickIdx + 1}/${items.length} ›`; nx.hidden = items.length < 2; }
}
function renderUtil() {
  $("#util").innerHTML = `<div class="wrap">
    <div class="tick" id="tick">
      <span class="tick__dot" aria-hidden="true"></span>
      <a class="tick__msg" id="tick-msg" href="#incentivi"></a>
      <button class="tick__next" id="tick-next" type="button" aria-label="Mostra la scadenza successiva"></button>
    </div>
    <div class="util__links">
      <span>${C.hours}</span>
      <a href="${C.telHref}">${ic("phone")}${C.tel}</a>
      <a href="mailto:${C.email}">${ic("mail")}${C.email}</a>
      <a href="#assistenza">${ic("headset")}Assistenza clienti</a>
    </div>
  </div>`;
  renderTick();
  $("#tick-next").addEventListener("click", () => { tickIdx++; renderTick(); });
  const tick = $("#tick");
  ["mouseenter", "focusin"].forEach((ev) => tick.addEventListener(ev, () => { tickHold = true; }));
  ["mouseleave", "focusout"].forEach((ev) => tick.addEventListener(ev, () => { tickHold = false; }));
  if (!reduceMotion()) tickTimer = setInterval(() => { if (!tickHold && !document.hidden) { tickIdx++; renderTick(); } }, 6500);
}

/* ---------- struttura: intestazione, menu, cassetto ---------- */
const NAV = [["settori", "Settori"], ["formule", "Formule"], ["strumenti", "Strumenti"], ["risorse", "Risorse"], ["chi-siamo", "Chi siamo"], ["contatti", "Contatti"]];
function renderHeader() {
  $("#hdr").innerHTML = `<div class="wrap">
    <a class="brand" href="#home" aria-label="Treart Evolution, vai alla home">${logo("pos", "Treart Evolution")}</a>
    <nav class="nav" aria-label="Menu principale">
      <button class="nav__link" id="nav-servizi" type="button" aria-expanded="false" aria-controls="mega" data-nav="servizi">Servizi ${ic("chevron-down")}</button>
      ${NAV.map(([k, l]) => `<a class="nav__link" href="#${k}" data-nav="${k}">${l}</a>`).join("")}
    </nav>
    <div class="hdr__actions">
      <button class="icon-btn hdr__search" type="button" data-open="search" aria-label="Cerca nel sito">${ic("search")}</button>
      <a class="icon-btn hdr__tel" href="${C.telHref}" aria-label="Chiama lo ${C.tel}">${ic("phone")}</a>
      <a class="btn btn--primary hdr__cta" href="#preventivo">Richiedi preventivo</a>
      <button class="icon-btn hdr__burger" id="burger" type="button" aria-expanded="false" aria-controls="drawer" aria-label="Apri il menu">${ic("menu")}</button>
    </div>
  </div>
  <div class="mega" id="mega" hidden>
    <div class="wrap">
      ${AREAS.map((a) => `<div class="mega__area"><h3>${icDot(a.icon)}<a href="#servizi" data-scroll="area-${a.id}">${a.name}</a></h3>${a.services.map((id) => `<a href="#${id}"><b>${SERVICES[id].short}</b><span>${SERVICES[id].menu}</span></a>`).join("")}</div>`).join("")}
      <div class="mega__foot"><span><b>Non sai da dove iniziare?</b> Con il check-up gratuito ti diciamo in un’ora dove la tua azienda è scoperta.</span>
        <span class="row"><a class="btn btn--primary btn--sm" href="#check-up">Prenota il check-up gratuito</a><a class="more" href="${C.telHref}">${ic("phone")}${C.tel}</a></span></div>
    </div>
  </div>`;
  const btn = $("#nav-servizi"), mega = $("#mega");
  let hoverT = null;
  const open = (v) => { mega.hidden = !v; btn.setAttribute("aria-expanded", String(v)); };
  btn.addEventListener("click", () => open(mega.hidden));
  const canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
  if (canHover) {
    btn.addEventListener("mouseenter", () => { clearTimeout(hoverT); open(true); });
    $("#hdr").addEventListener("mouseleave", () => { hoverT = setTimeout(() => open(false), 180); });
    mega.addEventListener("mouseenter", () => clearTimeout(hoverT));
    $$(".nav__link:not(#nav-servizi)", $("#hdr")).forEach((l) => l.addEventListener("mouseenter", () => open(false)));
  }
  $("#burger").addEventListener("click", openDrawer);
}
function renderDrawer() {
  $("#drawer").innerHTML = `<div class="wrap">
    <div class="drawer__top"><a class="brand" href="#home" aria-label="Treart Evolution, vai alla home">${logo("pos")}</a>
      <button class="icon-btn" type="button" data-close-drawer aria-label="Chiudi il menu">${ic("x")}</button></div>
    <nav class="drawer__nav" aria-label="Menu">
      <details><summary>Servizi ${ic("chevron-down")}</summary><div class="drawer__sub">
        ${AREAS.map((a) => `<div class="drawer__area">${a.name}</div>${a.services.map((id) => `<a href="#${id}">${SERVICES[id].short}</a>`).join("")}`).join("")}
        <a href="#servizi"><b>Tutti i servizi</b></a></div></details>
      ${[["settori", "Settori"], ["formule", "Formule a canone"], ["strumenti", "Strumenti gratuiti"], ["risorse", "Guide e risorse"], ["chi-siamo", "Chi siamo"], ["progetti", "Progetti"], ["contatti", "Contatti"], ["assistenza", "Assistenza clienti"]].map(([k, l]) => `<a class="drawer__link" href="#${k}">${l} ${ic("chevron-right")}</a>`).join("")}
    </nav>
    <div class="drawer__contact">
      <a class="btn btn--primary btn--lg" href="#preventivo">Richiedi preventivo</a>
      ${waBtn("Ciao, vorrei informazioni sui vostri servizi.", "Scrivici su WhatsApp", "btn btn--wa btn--lg")}
      <a class="btn btn--ghost btn--lg" href="${C.telHref}">${ic("phone")}Chiama lo ${C.tel}</a>
      <button class="btn btn--ghost btn--lg" type="button" data-open="search">${ic("search")}Cerca nel sito</button>
      <p class="muted">${C.hours}</p>
    </div>
  </div>`;
}
let lastFocus = null;
function openDrawer() {
  const d = $("#drawer");
  lastFocus = document.activeElement;
  d.hidden = false;
  document.body.style.overflow = "hidden";
  $("#burger").setAttribute("aria-expanded", "true");
  const b = $("[data-close-drawer]", d); b && b.focus();
}
function closeDrawer() {
  const d = $("#drawer");
  if (d.hidden) return;
  d.hidden = true;
  document.body.style.overflow = "";
  $("#burger").setAttribute("aria-expanded", "false");
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
}
function closeOverlays() {
  const mega = $("#mega");
  if (mega && !mega.hidden) { mega.hidden = true; $("#nav-servizi").setAttribute("aria-expanded", "false"); }
  closeDrawer();
  closeFab();
  $$("dialog[open]").forEach((d) => d.close());
}
function markNav(group) {
  $$("[data-nav]").forEach((l) => { if (l.dataset.nav === group) l.setAttribute("aria-current", "page"); else l.removeAttribute("aria-current"); });
}

/* ---------- struttura: piè di pagina ---------- */
function renderFooter() {
  const y = new Date().getFullYear();
  $("#ftr").innerHTML = `<div class="wrap">
    <div class="ftr__top">
      <div class="ftr__brand"><a class="brand" href="#home" aria-label="Treart Evolution, vai alla home">${logo("neg")}</a>
        <p>Il tuo business, gestito. Partner IT con sede a Grosseto, al fianco delle aziende in tutta Italia: assistenza informatica, sicurezza, reti, telefonia e web.</p>
        <p class="small">Seguici su <a href="${C.facebook}" target="_blank" rel="noopener">Facebook</a></p></div>
      <div><h3>Servizi</h3><ul>${AREAS.map((a) => `<li><a href="#servizi" data-scroll="area-${a.id}">${a.name}</a></li>`).join("")}<li><a href="#formule">Formule a canone</a></li><li><a href="#settori">Settori</a></li></ul></div>
      <div><h3>Strumenti e guide</h3><ul>${TOOLS.map((x) => `<li><a href="#${x.id}"${x.anchor ? ` data-scroll="${x.anchor}"` : ""}>${x.name}</a></li>`).join("")}<li><a href="#risorse">Tutte le guide</a></li></ul></div>
      <div><h3>Azienda</h3><ul><li><a href="#chi-siamo">Chi siamo</a></li><li><a href="#progetti">Progetti</a></li><li><a href="#check-up">Check-up gratuito</a></li><li><a href="#preventivo">Richiedi preventivo</a></li><li><a href="#assistenza">Assistenza clienti</a></li><li><a href="#contatti">Contatti</a></li></ul></div>
      <div><h3>Contatti</h3><address>
        <span>${C.addr1}<br>${C.addr2}</span>
        <a href="${C.telHref}">${C.tel}</a>
        <a href="${waHref(WA_GENERIC)}" target="_blank" rel="noopener">WhatsApp ${C.tel}</a>
        <a href="mailto:${C.email}">${C.email}</a>
        <span>PEC ${soft(C.pec, "PEC dal biglietto 2015: da confermare")}</span>
        <span>${C.hours}</span></address></div>
    </div>
    <div class="ftr__bottom">
      <span>© ${y} Treart Evolution Srl · P.IVA ${C.piva} · REA ${C.rea} · Cap. soc. ${C.cap}<br>Tutti i prezzi indicati sono IVA esclusa.</span>
      <nav aria-label="Note legali"><a href="#privacy">Privacy</a><a href="#cookie">Cookie</a><a href="#crediti">Crediti foto</a>
        <button class="tbc-toggle" type="button" aria-pressed="false" data-tbc-toggle>${ic("eye")}Anteprima: evidenzia i dati da confermare</button></nav>
    </div>
  </div>`;
}

/* ---------- contatto flottante e barra smartphone ---------- */
function quickActions() {
  return `
    <a class="qa" href="${C.telHref}">${icDot("phone")}<span><b>Chiama lo ${C.tel}</b><span>${C.hours}</span></span></a>
    <a class="qa" href="${waHref("Ciao, vorrei informazioni sui vostri servizi.")}" target="_blank" rel="noopener">${icDot("chat")}<span><b>Scrivici su WhatsApp</b><span>Anche con foto e documenti</span></span></a>
    <button class="qa" type="button" data-copy="${C.email}">${icDot("mail")}<span><b data-label>${C.email}</b><span>Tocca per copiare l’indirizzo</span></span></button>
    <button class="qa" type="button" data-open="callback">${icDot("clock")}<span><b>Richiamami</b><span>Lasciaci il numero, ti chiamiamo noi</span></span></button>
    <a class="qa" href="#check-up">${icDot("calendar")}<span><b>Prenota il check-up gratuito</b><span>In azienda o da remoto</span></span></a>
    <a class="qa" href="#assistenza">${icDot("headset")}<span><b>Sei già cliente?</b><span>Apri una richiesta di assistenza</span></span></a>`;
}
function renderFab() {
  $("#fab").innerHTML = `<div class="fab__panel" id="fab-panel" hidden role="dialog" aria-label="Contatti rapidi">
      <div class="fab__head"><b>Come preferisci contattarci?</b>Rispondiamo entro ${t(C.reply)}.</div>${quickActions()}</div>
    <button class="fab__btn" id="fab-btn" type="button" aria-expanded="false" aria-controls="fab-panel">${ic("chat")}Contattaci</button>`;
  $("#fab-btn").addEventListener("click", () => {
    const p = $("#fab-panel");
    p.hidden = !p.hidden;
    $("#fab-btn").setAttribute("aria-expanded", String(!p.hidden));
  });
  $("#mbar").innerHTML = `
    <a href="${C.telHref}">${ic("phone")}Chiama</a>
    <a href="${waHref("Ciao, vorrei informazioni sui vostri servizi.")}" target="_blank" rel="noopener">${ic("chat")}WhatsApp</a>
    <a class="mbar__main" href="#preventivo">${ic("file")}Preventivo</a>
    <button type="button" data-open="contact">${ic("dots")}Altro</button>`;
}
function closeFab() {
  const p = $("#fab-panel");
  if (p && !p.hidden) { p.hidden = true; $("#fab-btn").setAttribute("aria-expanded", "false"); }
}

/* ---------- finestre: richiamata, contatti, ricerca ---------- */
function dlgWrap(title, body) {
  return `<div class="dlg__head"><h2 id="dlg-callback-t">${title}</h2><button class="icon-btn" type="button" data-close-dlg aria-label="Chiudi">${ic("x")}</button></div><div class="dlg__body">${body}</div>`;
}
function openDialog(kind) {
  if (kind === "search") return openSearch();
  closeDrawer(); closeFab();
  const d = $("#dlg-callback");
  if (kind === "callback") d.innerHTML = dlgWrap("Ti richiamiamo noi", callbackForm());
  else d.innerHTML = dlgWrap("Contattaci", `<div style="display:grid;gap:2px">${quickActions()}</div>`);
  if (!d.open) { try { d.showModal(); } catch (e) { d.setAttribute("open", ""); } }
  const f = $("input, a, button:not([data-close-dlg])", d); f && f.focus();
}

let INDEX = null;
const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[«»“”"’'.,:;()]/g, " ");
function buildIndex() {
  const it = [];
  SERVICE_ORDER.forEach((id) => { const s = SERVICES[id]; const a = AREAS.find((x) => x.id === s.area); it.push({ g: "Servizi", t: s.name, s: a.name + " · " + s.menu, r: id, i: s.icon, k: [s.title, s.sub, a.name, ...s.does, ...s.pains].join(" ") }); });
  GUIDE_ORDER.forEach((id) => { const g = GUIDES[id]; it.push({ g: "Guide", t: g.title, s: g.cat + " · " + g.min + " minuti di lettura", r: id, i: g.icon, k: [g.lead, ...g.body, ...g.todo, ...(g.blocks || []).flat()].join(" ") }); });
  TOOLS.forEach((x) => it.push({ g: "Strumenti", t: x.name, s: x.line, r: x.id, i: x.icon, k: x.line, scroll: x.anchor }));
  SECTORS.forEach((x) => it.push({ g: "Settori", t: x.name, s: x.line, r: "settori", i: x.icon, k: x.pains.join(" "), scroll: "settore-" + x.id }));
  [["contatti", "Contatti", "Telefono, WhatsApp, email, PEC e sede", "phone", "telefono numero indirizzo sede orari pec mail whatsapp"],
    ["preventivo", "Richiedi un preventivo", "Tre passi, risposta entro 8 ore lavorative", "file", "preventivo prezzo costo offerta"],
    ["check-up", "Prenota il check-up gratuito", "In azienda o da remoto", "calendar", "sopralluogo check up verifica gratuita appuntamento"],
    ["assistenza", "Assistenza clienti", "Apri una richiesta, urgenze al telefono", "headset", "guasto problema ticket assistenza remota urgenza"],
    ["formule", "Formule a canone", "Essenziale, Business, Completa", "calc", "canone prezzi abbonamento contratto"],
    ["chi-siamo", "Chi siamo", "Sede a Grosseto, clienti in tutta Italia", "users", "azienda storia team partner italia"],
    ["progetti", "Progetti", "Alcuni lavori realizzati", "folder", "casi studio lavori clienti hotel firewall centralino"],
    ["privacy", "Informativa privacy", "Come trattiamo i tuoi dati", "lock", "privacy dati gdpr"]].forEach(([r, tt, s, i, k]) => it.push({ g: "Pagine", t: tt, s, r, i, k }));
  it.forEach((x) => { x.n = norm(x.t); x.nk = norm(x.k + " " + x.s); });
  return it;
}
function searchFor(q) {
  INDEX = INDEX || buildIndex();
  const terms = norm(q).split(/\s+/).filter((w) => w.length > 1);
  if (!terms.length) return [];
  return INDEX.map((x) => {
    let sc = 0;
    for (const w of terms) {
      const inT = x.n.includes(w), inK = x.nk.includes(w);
      if (!inT && !inK) return null;
      sc += (inT ? 6 : 0) + (inK ? 1 : 0) + (x.n.startsWith(w) ? 2 : 0);
    }
    return { x, sc };
  }).filter(Boolean).sort((a, b) => b.sc - a.sc).slice(0, 12).map((r) => r.x);
}
function resultLink(x) {
  return `<a href="#${x.r}"${x.scroll ? ` data-scroll="${x.scroll}"` : ""}>${icDot(x.i)}<span><b>${esc(x.t)}</b><span>${t(x.s)}</span></span></a>`;
}
function openSearch() {
  closeDrawer(); closeFab();
  const d = $("#dlg-search");
  d.innerHTML = `<form class="search__box" role="search" id="search-form">${ic("search")}<label class="vh" for="q">Cerca nel sito</label>
      <input id="q" type="search" autocomplete="off" placeholder="Cerca un servizio, una guida, uno strumento">
      <button class="icon-btn" type="button" data-close-dlg aria-label="Chiudi la ricerca">${ic("x")}</button></form>
    <div class="search__res" id="search-res"></div>`;
  const input = $("#q", d), res = $("#search-res", d);
  const sugg = () => {
    INDEX = INDEX || buildIndex();
    const pick = ["centralini-voip", "backup", "rete-wifi", "incentivi", "test-sicurezza", "contatti"];
    res.innerHTML = `<div class="search__grp">Più cercati</div>` + pick.map((r) => resultLink(INDEX.find((x) => x.r === r))).join("");
  };
  const upd = () => {
    const q = input.value.trim();
    if (!q) return sugg();
    const found = searchFor(q);
    if (!found.length) { res.innerHTML = `<p class="search__empty">Nessun risultato per «${esc(q)}». Prova con una parola più semplice, oppure <a href="#contatti">chiedilo a noi</a>.</p>`; return; }
    let html = "", grp = "";
    found.forEach((x) => { if (x.g !== grp) { grp = x.g; html += `<div class="search__grp">${grp}</div>`; } html += resultLink(x); });
    res.innerHTML = html;
  };
  input.addEventListener("input", upd);
  $("#search-form", d).addEventListener("submit", (e) => { e.preventDefault(); const a = $("a", res); a && a.click(); });
  sugg();
  if (!d.open) { try { d.showModal(); } catch (e) { d.setAttribute("open", ""); } }
  input.focus();
}

/* ---------- copia negli appunti ---------- */
function copyText(text, btn) {
  const done = (ok) => {
    const lab = $("[data-label]", btn) || btn;
    const old = lab.textContent;
    lab.textContent = ok ? "Copiato" : "Seleziona e copia";
    setTimeout(() => { lab.textContent = old; }, 1800);
    if (!ok && btn.dataset.target) {
      const tg = document.getElementById(btn.dataset.target);
      if (tg) { const r = document.createRange(); r.selectNodeContents(tg); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    }
  };
  const fallback = () => {
    let ok = false;
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "-1000px";
      document.body.appendChild(ta); ta.select(); ok = document.execCommand("copy"); ta.remove();
    } catch (e) { ok = false; }
    done(ok);
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), fallback);
    else fallback();
  } catch (e) { fallback(); }
}

/* ---------- moduli ---------- */
function field(o) {
  const { id, label, type = "text", req = false, opt = false, ac, ph, val = "", rows = 4, options, err, im } = o;
  const lab = `<label for="${id}">${label}${opt ? ' <span class="opt">(facoltativo)</span>' : ""}</label>`;
  const common = `class="input" id="${id}" name="${id}" ${req ? "required" : ""} ${err ? `data-err="${esc(err)}"` : ""} aria-describedby="${id}-err"`;
  let ctl;
  if (type === "textarea") ctl = `<textarea ${common} rows="${rows}" ${ph ? `placeholder="${esc(ph)}"` : ""}>${esc(val)}</textarea>`;
  else if (type === "select") ctl = `<select ${common}>${options.map((op) => `<option value="${esc(op[0])}"${op[0] === val ? " selected" : ""}>${esc(op[1])}</option>`).join("")}</select>`;
  else ctl = `<input ${common} type="${type}" ${ac ? `autocomplete="${ac}"` : ""} ${im ? `inputmode="${im}"` : ""} ${ph ? `placeholder="${esc(ph)}"` : ""} value="${esc(val)}">`;
  return `<div class="field">${lab}${ctl}<span class="err" id="${id}-err" hidden></span></div>`;
}
function chips(o) {
  const { name, legend, items, type = "checkbox", checked = [], req = false, err, cls = "" } = o;
  return `<fieldset class="field"${req ? ` data-req-group="${name}"` : ""}${err ? ` data-err="${esc(err)}"` : ""}><legend>${legend}</legend>
    <div class="chips">${items.map(([v, l]) => `<label class="chip ${cls}"><input type="${type}" name="${name}" value="${esc(v)}"${checked.includes(v) ? " checked" : ""}><span>${l}</span></label>`).join("")}</div>
    <span class="err" hidden></span></fieldset>`;
}
const consent = (id) => `<div class="field"><label class="check"><input type="checkbox" id="${id}" name="${id}" required data-err="Per ricontattarti ci serve il tuo consenso." aria-describedby="${id}-err"><span>Ho letto l’<a href="#privacy">informativa privacy</a> e acconsento a essere ricontattato.</span></label><span class="err" id="${id}-err" hidden></span></div>`;
const oneOf = (ids, msg) => `<div data-oneof="${ids}" data-err="${esc(msg)}"><span class="err" hidden></span></div>`;
const fv = (f, n) => { const el = f.elements[n]; return el && "value" in el ? String(el.value || "").trim() : ""; };
const checkedLabels = (f, n) => $$(`input[name="${n}"]:checked`, f).map((i) => i.nextElementSibling.textContent.trim());

function validate(scope) {
  let first = null;
  $$(".err", scope).forEach((e) => { e.hidden = true; e.textContent = ""; });
  $$("[aria-invalid]", scope).forEach((e) => e.removeAttribute("aria-invalid"));
  const fail = (el, msg, errEl) => {
    if (errEl) { errEl.textContent = msg; errEl.hidden = false; }
    if (el) el.setAttribute("aria-invalid", "true");
    if (!first) first = el;
  };
  const errFor = (el) => document.getElementById(el.id + "-err") || (el.closest(".field") && $(".err", el.closest(".field")));
  $$("input, select, textarea", scope).forEach((el) => {
    if (el.closest("[hidden]") || el.type === "hidden" || el.type === "radio") return;
    if (el.type === "checkbox") { if (el.required && !el.checked) fail(el, el.dataset.err || "Seleziona questa casella.", errFor(el)); return; }
    const v = el.value.trim();
    if (el.required && !v) return fail(el, el.dataset.err || "Compila questo campo.", errFor(el));
    if (v && el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return fail(el, "Controlla l’indirizzo email: deve essere come nome@azienda.it.", errFor(el));
    if (v && el.type === "tel" && v.replace(/\D/g, "").length < 8) return fail(el, "Scrivi un numero completo, con almeno 8 cifre.", errFor(el));
  });
  $$("[data-req-group]", scope).forEach((fs) => {
    if (fs.closest("[hidden]")) return;
    if (!$$("input", fs).some((i) => i.checked)) fail($("input", fs), fs.dataset.err || "Scegli un’opzione.", $(".err", fs));
  });
  $$("[data-oneof]", scope).forEach((box) => {
    if (box.closest("[hidden]")) return;
    const els = box.dataset.oneof.split(",").map((id) => document.getElementById(id)).filter(Boolean);
    if (els.length && els.every((e) => !e.value.trim())) { fail(els[0], box.dataset.err, $(".err", box)); els.forEach((e) => e.setAttribute("aria-invalid", "true")); }
  });
  if (first) first.focus();
  return !first;
}

function handoff(form, subject, lines) {
  const body = lines.filter(Boolean).join("\n");
  const full = subject + "\n\n" + body;
  const id = "ho-" + form.id;
  $$(`#${id}`).forEach((n) => n.remove());
  const box = document.createElement("div");
  box.className = "handoff"; box.id = id; box.tabIndex = -1; box.setAttribute("role", "status");
  box.innerHTML = `<h3>${ic("check-circle")}Richiesta pronta</h3>
    <p>Scegli come inviarcela: ti rispondiamo entro ${t(C.reply)}.</p>
    <pre id="${id}-text">${esc(full)}</pre>
    <div class="row">
      <a class="btn btn--primary" href="${waHref(full)}" target="_blank" rel="noopener">${ic("chat")}Invia su WhatsApp</a>
      <a class="btn btn--ghost" href="${mailHref(subject, body)}">${ic("mail")}Invia per email</a>
      <button class="btn btn--ghost" type="button" data-copy="${esc(full)}" data-target="${id}-text">${ic("copy")}<span data-label>Copia il testo</span></button>
    </div>
    <p class="fine">Se l’email non si apre, copia il testo e scrivi a ${C.email}. In questa anteprima del sito la richiesta parte dal tuo WhatsApp o dalla tua email.</p>
    <button class="linkbtn" type="button" data-edit="${form.id}">Modifica la richiesta</button>`;
  form.hidden = true;
  form.after(box);
  box.focus();
}

function callbackForm() {
  return `<form class="form" id="f-cb" novalidate data-kind="callback">
    <p class="muted">Lasciaci nome e numero: ti richiamiamo in orario d’ufficio.</p>
    ${field({ id: "cb-nome", label: "Nome e cognome", req: true, ac: "name", err: "Scrivi il tuo nome." })}
    ${field({ id: "cb-tel", label: "Telefono", type: "tel", req: true, ac: "tel", im: "tel", err: "Scrivi il numero da richiamare." })}
    <div class="form__row">
      ${field({ id: "cb-quando", label: "Quando preferisci", type: "select", options: [["Appena possibile", "Appena possibile"], ["Mattina", "Mattina (8:30–13:00)"], ["Pomeriggio", "Pomeriggio (14:00–17:30)"]] })}
      ${field({ id: "cb-tema", label: "Argomento", type: "select", options: [["Informazioni generali", "Informazioni generali"], ...AREAS.map((a) => [a.name, a.name]), ["Incentivi", "Incentivi e bandi"], ["Assistenza", "Sono già cliente"]] })}
    </div>
    ${consent("cb-ok")}
    <div class="form__foot"><button class="btn btn--primary btn--lg" type="submit">${ic("phone")}Prepara la richiesta</button><span class="fine">Risposta entro ${t(C.reply)}</span></div>
  </form>`;
}

function contactForm(p, opts = {}) {
  const svc = opts.service ? SERVICES[opts.service] : null;
  return `<form class="form" id="f-${p}" novalidate data-kind="contact"${svc ? ` data-service="${opts.service}"` : ""}>
    <div class="form__row">${field({ id: `${p}-nome`, label: "Nome e cognome", req: true, ac: "name", err: "Scrivi il tuo nome." })}${field({ id: `${p}-az`, label: "Azienda", ac: "organization", opt: true })}</div>
    <div class="form__row">${field({ id: `${p}-tel`, label: "Telefono", type: "tel", ac: "tel", im: "tel", opt: true })}${field({ id: `${p}-mail`, label: "Email", type: "email", ac: "email", opt: true })}</div>
    ${oneOf(`${p}-tel,${p}-mail`, "Lasciaci almeno un telefono o un’email per risponderti.")}
    ${svc ? "" : chips({ name: `${p}-svc`, legend: "Di cosa hai bisogno?", items: FORM_SERVICES, req: true, err: "Scegli almeno un argomento, anche «Non lo so ancora»." })}
    ${field({ id: `${p}-msg`, label: "Raccontaci in breve", type: "textarea", opt: true, rows: 3, val: opts.msg || "", ph: svc ? "Per esempio: quante persone, quale sede, che problema avete oggi" : "Cosa ti serve, in poche righe" })}
    ${consent(`${p}-ok`)}
    <div class="form__foot"><button class="btn btn--primary btn--lg" type="submit">${ic("send")}Prepara la richiesta</button><span class="fine">Risposta entro ${t(C.reply)}</span></div>
  </form>`;
}

const HANDLERS = {
  callback(f) {
    handoff(f, "Richiesta di richiamata", [`Nome: ${fv(f, "cb-nome")}`, `Telefono: ${fv(f, "cb-tel")}`, `Quando: ${fv(f, "cb-quando")}`, `Argomento: ${fv(f, "cb-tema")}`]);
  },
  contact(f) {
    const p = f.id.replace(/^f-/, "");
    const svc = f.dataset.service ? SERVICES[f.dataset.service].name : checkedLabels(f, `${p}-svc`).join(", ");
    handoff(f, `Richiesta di informazioni${f.dataset.service ? " – " + svc : ""}`, [
      `Nome: ${fv(f, p + "-nome")}`, fv(f, p + "-az") && `Azienda: ${fv(f, p + "-az")}`, fv(f, p + "-tel") && `Telefono: ${fv(f, p + "-tel")}`,
      fv(f, p + "-mail") && `Email: ${fv(f, p + "-mail")}`, `Argomento: ${svc}`, fv(f, p + "-msg") && `\n${fv(f, p + "-msg")}`]);
  },
};

/* ---------- dati da confermare ---------- */
function updateTbc() {
  const on = document.documentElement.classList.contains("show-tbc");
  $$(".tbc--soft").forEach((el) => { if (on) el.title = "Da confermare: " + (el.dataset.note || ""); else el.removeAttribute("title"); });
  const n = $$("#main .tbc, #ftr .tbc").length;
  $("#tbc-note").textContent = on ? (n ? `${n} dati da completare o confermare in questa pagina` : "Nessun dato da confermare in questa pagina") : "";
  $$("[data-tbc-toggle]").forEach((b) => b.setAttribute("aria-pressed", String(on)));
}

/* ---------- liste «cosa fare subito» ricordate dal browser ---------- */
function enhance(root) {
  $$(".todo[data-key]", root).forEach((list) => {
    const key = "todo:" + list.dataset.key;
    const saved = store.get(key) || [];
    const boxes = $$("input", list);
    boxes.forEach((b, i) => { b.checked = !!saved[i]; });
    const count = $(".todo__count", list.parentElement);
    const upd = () => { const v = boxes.map((b) => b.checked); store.set(key, v); if (count) count.textContent = `${v.filter(Boolean).length} di ${v.length} fatti`; };
    boxes.forEach((b) => b.addEventListener("change", upd));
    upd();
  });
}
