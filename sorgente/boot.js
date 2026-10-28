/* ================= AVVIO E NAVIGAZIONE ================= */

function setDesc(text) {
  let m = document.querySelector('meta[name="description"]');
  if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
  m.content = plain(text);
}
function render() {
  const tok = current();
  const r = ROUTES[tok] || ROUTES["404"];
  closeOverlays();
  const main = $("#main");
  main.innerHTML = r.render(tok);
  document.title = r.title ? r.title(tok) : "Treart Evolution";
  setDesc(r.desc ? r.desc(tok) : "");
  markNav(r.nav ? r.nav(tok) : "");
  if (r.after) r.after(main, tok);
  linkify(main);
  enhance(main);
  updateTbc();
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  const target = S.scrollTo && document.getElementById(S.scrollTo);
  S.scrollTo = null;
  if (target) target.scrollIntoView({ block: "start" }); else window.scrollTo(0, 0);
  root.style.scrollBehavior = prev;
  if (!S.first) {
    const h1 = $("h1", main);
    if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
  }
  S.first = false;
  trackPage(tok);
}

function onClick(e) {
  const el0 = e.target;
  const ck = el0.closest("[data-cookie]");
  if (ck) { setConsent(ck.dataset.cookie); return; }
  if (el0.closest("[data-cookie-prefs]")) { cookieBanner(true); return; }
  if (el0.closest("[data-interno-off]")) {
    store.set("dispositivo-interno", false);
    // con Analytics già caricato si ricarica la pagina, così nessun evento successivo resta marcato come interno
    if (gaLoaded) { store.set("interno-avviso", true); location.reload(); return; }
    S.internoOff = true; render(); return;
  }
  const mega = $("#mega");
  if (mega && !mega.hidden && !el0.closest("#hdr")) { mega.hidden = true; $("#nav-servizi").setAttribute("aria-expanded", "false"); }
  const fp = $("#fab-panel");
  if (fp && !fp.hidden && !el0.closest("#fab")) closeFab();
  if (el0.closest("[data-close-drawer]")) { closeDrawer(); return; }
  if (el0.closest("[data-close-dlg]")) { const d = el0.closest("dialog"); if (d) d.close(); return; }
  const edit = el0.closest("[data-edit]");
  if (edit) {
    const f = document.getElementById(edit.dataset.edit), box = edit.closest(".handoff");
    if (f) { f.hidden = false; if (box) box.remove(); const first = $("input:not([type=hidden]), textarea, select", f); if (first) first.focus(); }
    return;
  }
  if (el0.closest("[data-tbc-toggle]")) { document.documentElement.classList.toggle("show-tbc"); updateTbc(); return; }
  const el = el0.closest("a, button");
  if (!el) return;
  trackContact(el);
  if (el.dataset.planReq) { const p = PLANS.find((x) => x.id === el.dataset.planReq); S.notes = `Formula di interesse: ${p.name}.`; S.prefill = ["assistenza-informatica"]; }
  if (el.dataset.prefill !== undefined) S.prefill = el.dataset.prefill.split(",").filter(Boolean);
  if (el.dataset.checkup) S.checkup = el.dataset.checkup;
  if (el.dataset.copy !== undefined) { e.preventDefault(); copyText(el.dataset.copy, el); return; }
  if (el.dataset.open) { e.preventDefault(); openDialog(el.dataset.open); return; }
  if (el.matches("[data-skip]")) { const m = $("#main"); m.focus(); return; }
  const href = el.tagName === "A" ? el.getAttribute("href") || "" : "";
  // con Ctrl, Cmd, Maiuscolo o il tasto centrale il link si apre in una nuova scheda, come in ogni sito
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || (e.button && e.button !== 0)) return;
  const tok = linkTok(el, href);
  if (tok !== null) {
    if (el.dataset.scroll) {
      if (tok === current()) {
        e.preventDefault(); closeOverlays();
        const tg = document.getElementById(el.dataset.scroll);
        if (tg) tg.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
        return;
      }
      S.scrollTo = el.dataset.scroll;
    }
    if (tok === current()) { e.preventDefault(); render(); return; }
    // indirizzi veri: la pagina si apre senza ricaricare il sito
    if (PATHS) { e.preventDefault(); navigate(tok); }
  }
}
function onSubmit(e) {
  const f = e.target;
  e.preventDefault();
  if (!f.matches("form[data-kind]")) return;
  if (!validate(f)) return;
  const h = HANDLERS[f.dataset.kind];
  if (h) h(f);
}
function onKey(e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); openSearch(); return; }
  if (e.key === "Escape") {
    const mega = $("#mega");
    if (mega && !mega.hidden) { mega.hidden = true; const b = $("#nav-servizi"); b.setAttribute("aria-expanded", "false"); b.focus(); }
    if (!$("#drawer").hidden) closeDrawer();
    const fp = $("#fab-panel");
    if (fp && !fp.hidden) { closeFab(); $("#fab-btn").focus(); }
  }
}

(function boot() {
  renderUtil();
  renderHeader();
  renderDrawer();
  renderFooter();
  renderFab();
  linkify(document.body);
  document.addEventListener("click", onClick);
  document.addEventListener("submit", onSubmit);
  document.addEventListener("keydown", onKey);
  if (PATHS) {
    // indietro/avanti del browser e vecchi link con # aperti dentro il sito
    window.addEventListener("popstate", () => { fixHash(); render(); });
    fixHash();
  } else {
    window.addEventListener("hashchange", render);
  }
  ["#dlg-callback", "#dlg-search"].forEach((s) => {
    const d = $(s);
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  });
  initConsent();
  render();
})();
