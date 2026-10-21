/* ================= PAGINE ================= */

const CASES = [
  ["[Agriturismo], [Comune]", "Wi-Fi in tutta la struttura", "[es. camere senza copertura]", "[es. access point gestiti]", "[es. zero reclami degli ospiti]"],
  ["[Studio professionale], Grosseto", "Backup e sicurezza dei dati", "[es. backup mai verificato]", "[es. NAS e copia esterna]", "[es. ripristino provato ogni mese]"],
  ["[Azienda], [Comune]", "Centralino VoIP e smartphone", "[es. chiamate perse fuori ufficio]", "[es. centralino con app]", "[es. nessuna chiamata persa]"],
];
const WA_GENERIC = "Ciao, vorrei informazioni sui vostri servizi.";

/* ---------- fotografie (img/<nome>-800.webp e -1600.webp, rapporto 3:2) ---------- */
function foto(slug, sizes) {
  const f = FOTO[slug];
  if (!f) return "";
  const q = f.v ? `?v=${f.v}` : "";
  return `<img src="img/${slug}-800.webp${q}" srcset="img/${slug}-800.webp${q} 800w, img/${slug}-1600.webp${q} 1600w" sizes="${sizes}" width="1600" height="1067" alt="${esc(f.alt)}" loading="lazy" decoding="async">`;
}
const fotoFig = (slug, sizes, cls = "") => FOTO[slug] ? `<figure class="photo${cls ? " " + cls : ""}">${foto(slug, sizes)}</figure>` : "";
const firstSentence = (s) => { const m = String(s).match(/^(.+?[.!?])\s+(?=[A-ZÀÈÉÌÒÙ«])/); return m ? m[1] : s; };

/* ---------- blocchi ricorrenti ---------- */
function crumbs(list) {
  return `<nav class="crumbs" aria-label="Percorso"><a href="#home">Home</a>${list.map(([l, tok]) => `${ic("chevron-right")}${tok ? `<a href="#${tok}">${l}</a>` : `<span aria-current="page">${l}</span>`}`).join("")}</nav>`;
}
function ph(o) {
  const { cr, eyebrow, title, lead, ctas = "", side = "", light = false, e = false } = o;
  return `<section class="ph${light ? " ph--light" : ""}">${e ? circleE("ph__e") : ""}<div class="wrap">${cr ? crumbs(cr) : ""}
    <div class="ph__grid${side ? "" : " ph__grid--one"}"><div>${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}<h1>${title}</h1>${lead ? `<p class="ph__lead">${lead}</p>` : ""}${ctas ? `<div class="ph__ctas">${ctas}</div>` : ""}</div>${side ? `<div>${side}</div>` : ""}</div></div></section>`;
}
function secHead(eyebrow, title, text, link) {
  if (link) return `<div class="sec-head sec-head--row"><div>${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}<h2>${title}</h2>${text ? `<p class="lead">${text}</p>` : ""}</div>${link}</div>`;
  return `<div class="sec-head">${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}<h2>${title}</h2>${text ? `<p>${text}</p>` : ""}</div>`;
}
function band(title, text, ctas) {
  return `<section class="band">${bigE("band__e")}<div class="wrap"><h2>${title}</h2><p>${text}</p><div class="row">${ctas}</div></div></section>`;
}
const defaultBand = () => band("Un solo partner. Un solo numero.", "Assistenza IT, sicurezza, reti, telefonia e web per le aziende di Grosseto e della Maremma, con tecnici in zona e un referente che conosce la tua azienda.",
  `<a class="btn btn--dark btn--lg" href="#check-up">Prenota il check-up gratuito</a><a class="btn btn--ghost btn--lg" href="${C.telHref}">${ic("phone")}Chiama lo ${C.tel}</a>`);
const waSoft = (label = "Scrivici su WhatsApp") => label;

function contactSection(o = {}) {
  const { title = "Parliamo del tuo progetto.", text, service, p = "cs" } = o;
  const svc = service ? SERVICES[service] : null;
  return `<section class="sec sec--dark" id="contatto"><div class="wrap contact">
    <div>
      <span class="eyebrow">Contatti</span>
      <h2>${title}</h2>
      <p class="lead">${text || `Raccontaci cosa ti serve: ti rispondiamo entro ${t(C.reply)} con un preventivo o una data per il sopralluogo.`}</p>
      <div class="channels">
        <a class="channel" href="${C.telHref}">${icDot("phone")}<span><b>${C.tel}</b><span>${C.hours}</span></span></a>
        <a class="channel" href="${waHref(svc ? svc.wa : WA_GENERIC)}" target="_blank" rel="noopener">${icDot("chat")}<span><b>${waSoft()}</b><span>${C.tel} · anche con foto e documenti</span></span></a>
        <a class="channel" href="mailto:${C.email}">${icDot("mail")}<span><b>${C.email}</b><span>Per capitolati e richieste dettagliate</span></span></a>
        <a class="channel" href="${C.maps}" target="_blank" rel="noopener">${icDot("pin")}<span><b>${C.addr1}</b><span>${C.addr2} · apri in Google Maps</span></span></a>
      </div>
      <div class="qr-box">${QR.wa}<span>Inquadra il codice con la fotocamera del telefono per scriverci su WhatsApp.</span></div>
    </div>
    <div class="card-form"><h3>${svc ? `Richiedi un preventivo: ${svc.short.toLowerCase()}` : "Scrivici qui"}</h3><p>Un minuto per compilare: prepariamo noi il testo della richiesta.</p>${contactForm(p, { service })}</div>
  </div></section>`;
}
function guideCard(id) {
  const g = GUIDES[id], img = FOTO["guida-" + id];
  return `<a class="gcard${img ? " gcard--img" : ""}" href="#${id}" data-cat="${g.cat}">${img ? `<span class="gcard__img">${foto("guida-" + id, "(max-width: 700px) 92vw, 400px")}</span>` : ""}<span class="pill">${ic(g.icon)}${g.cat}</span><h3>${g.short}</h3><p>${esc(firstSentence(g.lead))}</p><span class="gcard__foot"><span>${g.min} minuti di lettura</span>${ic("arrow-right")}</span></a>`;
}
function serviceCard(id) {
  const s = SERVICES[id], a = AREAS.find((x) => x.id === s.area);
  return `<a class="gcard" href="#${id}"><span class="pill">${ic(a.icon)}${a.name}</span><h3>${s.short}</h3><p>${s.menu}.</p><span class="gcard__foot"><span>Scopri il servizio</span>${ic("arrow-right")}</span></a>`;
}
function toolCardLight(x) {
  return `<a class="gcard" href="#${x.id}"${x.anchor ? ` data-scroll="${x.anchor}"` : ""}><span class="ic-dot ic-dot--lg">${ic(x.icon)}</span><h3>${x.name}</h3><p>${x.line}</p><span class="gcard__foot"><span>Apri lo strumento</span>${ic("arrow-right")}</span></a>`;
}
function moreGuides(ids, title = "Approfondisci") {
  return `<section class="sec sec--paper"><div class="wrap">${secHead("Guide", title, "", `<a class="more" href="#risorse">Tutte le guide ${ic("arrow-right")}</a>`)}<div class="guides">${ids.map(guideCard).join("")}</div></div></section>`;
}
function steps(list, cls = "") {
  return `<ol class="steps ${cls}">${list.map(([h, p], i) => `<li class="step"><span class="step__n" aria-hidden="true">${i + 1}</span><h3>${h}</h3><p>${t(p)}</p></li>`).join("")}</ol>`;
}
function bento() {
  return `<div class="bento">${AREAS.map((a) => `<section class="area" id="area-${a.id}" style="grid-area:${a.ga}" aria-labelledby="area-${a.id}-t">
    <div class="area__head">${icDot(a.icon, "ic-dot--lg")}<div><h3 id="area-${a.id}-t">${a.name}</h3><p>${a.line}</p></div></div>
    <div>${a.services.map((id) => `<a class="svc-link" href="#${id}"><span><b>${SERVICES[id].short}</b><span>${SERVICES[id].menu}</span></span>${ic("arrow-right")}</a>`).join("")}</div></section>`).join("")}</div>`;
}
function compareSection() {
  return `<section class="sec"><div class="wrap compare"><div><span class="eyebrow">Perché un solo partner</span><h2>Perché un solo partner conviene.</h2>
    <p class="lead">Quando rete, telefoni, sicurezza e sito li segue la stessa squadra, i problemi si risolvono prima e nessuno rimbalza la colpa a qualcun altro.</p>
    <div class="row"><a class="btn btn--dark" href="#contatti">${ic("chat")}Parla con un tecnico</a></div></div>
    <div class="vs-wrap"><table class="vs"><thead><tr><th scope="col">Con tanti fornitori</th><th scope="col">Con Treart</th></tr></thead>
    <tbody>${COMPARE.map(([a, b]) => `<tr><td>${ic("x")}${a}</td><td>${ic("check")}${b}</td></tr>`).join("")}</tbody></table></div></div></section>`;
}
function plansHtml() {
  return `<div class="plans">${PLANS.map((p) => `<article class="plan${p.id === "business" ? " plan--hi" : ""}" data-plan="${p.id}">
    <div class="plan__top"><h3>${p.name}</h3>${p.badge ? `<span class="plan__badge">${p.badge}</span>` : ""}</div>
    <p class="plan__for">${p.for}</p><p class="plan__price">${p.price} € <small>al mese</small></p>
    <ul>${p.inc.map((x) => x.startsWith("+") ? `<li class="plus">${esc(x.slice(1))}</li>` : `<li>${ic("check")}<span>${esc(x)}</span></li>`).join("")}</ul>
    <a class="btn ${p.id === "business" ? "btn--primary" : "btn--ghost"}" href="#preventivo" data-plan-req="${p.id}">Chiedi questa formula</a></article>`).join("")}</div>`;
}
function sectorCards() {
  return `<div class="sectors">${SECTORS.map((s) => `<a class="sector" href="#settori" data-scroll="settore-${s.id}">${FOTO["settore-" + s.id]
    ? `<span class="sector__art sector__art--photo">${foto("settore-" + s.id, "(max-width: 600px) 92vw, 260px")}<span class="sector__ic">${ic(s.icon)}</span></span>`
    : `<span class="sector__art">${ic(s.icon)}</span>`}<span class="sector__body"><b>${s.name}</b><span>${s.line}</span></span></a>`).join("")}</div>`;
}
function casesHtml() {
  return `<div class="cases">${CASES.map((c) => `<article class="case"><div class="case__img">${t("[Foto dell’impianto da inserire]")}</div><div class="case__body"><span class="pill">${t(c[0])}</span><h3>${c[1]}</h3>
    <dl><dt>Problema</dt><dd>${t(c[2])}</dd><dt>Soluzione</dt><dd>${t(c[3])}</dd><dt>Risultato</dt><dd>${t(c[4])}</dd></dl></div></article>`).join("")}</div>`;
}
const partnersHtml = () => `<div class="partners" aria-label="Tecnologie e partner">${["Fastweb", "Eolo", "Starlink", "3CX"].map((p) => `<span>${soft(p, "Partner da confermare")}</span>`).join("")}<span>${t("[altri partner]")}</span></div>`;
const numsHtml = () => `<div class="nums"><div class="num"><b>${t("[N]")}</b><span>anni di attività</span></div><div class="num"><b>${t("[N]")}</b><span>aziende seguite</span></div><div class="num"><b>${t("[N]")}</b><span>impianti realizzati</span></div></div>`;

function stage() {
  const pos = [-90, -18, 54, 126, 198], R = 232;
  const pt = (deg, r) => [300 + r * Math.cos(deg * Math.PI / 180), 300 + r * Math.sin(deg * Math.PI / 180)];
  const orbs = AREAS.map((a, i) => { const [x, y] = pt(pos[i], R); return `<a class="orb" href="#servizi" data-scroll="area-${a.id}" style="left:${(x / 6).toFixed(2)}%;top:${(y / 6).toFixed(2)}%;--d:${(i * 0.5).toFixed(1)}s">${icDot(a.icon)}<span><b>${a.name}</b><small>${a.status}</small></span></a>`; }).join("");
  return `<div class="stage">
    <svg class="stage__svg" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
      <circle class="ring ring--dots ring--outer" cx="300" cy="300" r="${R}"/>
      <circle class="ring" cx="300" cy="300" r="150"/>
      ${pos.map((p) => { const [x1, y1] = pt(p, 150), [x2, y2] = pt(p, R); return `<line class="spoke ring--outer" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`; }).join("")}
      <g class="orbit"><circle cx="300" cy="${300 - R}" r="7" fill="#5A7722"/></g>
      <g class="hub-arc"><use href="#arc" x="178" y="178" width="244" height="244"/></g>
      <svg x="212" y="212" width="176" height="176"><use href="#sym"/></svg>
    </svg>
    <div class="orbs">${orbs}</div>
  </div>
  <p class="stage__cap">Esempio del quadro che teniamo sotto controllo per ogni cliente.</p>`;
}
function dlCard(d) {
  const b = dlBadge(d);
  return `<article class="dl"><div class="dl__date"><span>${d.label}</span>${b.txt ? `<span class="dl__left${b.soft ? " dl__left--soft" : ""}">${b.txt}</span>` : ""}</div>
    <div class="dl__body"><h3>${d.title}</h3><p>${d.text}</p><a class="more" href="#${d.to}">${d.cta} ${ic("arrow-right")}</a></div></article>`;
}

/* ---------- home ---------- */
route("home", {
  title: () => "Treart Evolution | Assistenza IT, sicurezza, reti e web a Grosseto",
  desc: () => "Assistenza informatica, sicurezza, reti e Wi-Fi, centralini VoIP e siti web per le aziende di Grosseto e della Maremma. Un solo partner, un solo numero.",
  nav: () => "",
  render: () => `
  <section class="hero"><div class="wrap">
    <div>
      <span class="eyebrow">Partner IT per le aziende della Maremma</span>
      <h1>Il tuo business, <span class="swash-word">gestito.<svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true" focusable="false"><use href="#swash"/></svg></span></h1>
      <p class="hero__lead">Rete, sicurezza, telefonia, web e assistenza per le aziende di Grosseto e della Maremma. Un solo partner, un solo numero da chiamare.</p>
      <div class="hero__ctas"><a class="btn btn--primary btn--lg" href="#check-up">Prenota il check-up gratuito</a>${waBtn(WA_GENERIC, "Scrivici su WhatsApp", "btn btn--wa btn--lg")}</div>
      <p class="hero__call mt-s">Oppure chiama lo <a href="${C.telHref}">${C.tel}</a></p>
      <ul class="trust"><li>${ic("pin")}Tecnici in sede a Grosseto</li><li>${ic("monitor")}Assistenza da remoto e in loco</li><li>${ic("clock")}Intervento entro ${t(C.reply)}</li></ul>
    </div>
    <div>${stage()}</div>
  </div></section>

  <section class="sec sec--tight" aria-labelledby="st-t"><div class="wrap">
    ${secHead("Per chi lavoriamo", `<span id="st-t">Soluzioni pensate per il tuo settore.</span>`, "", `<a class="more" href="#settori">Tutti i settori ${ic("arrow-right")}</a>`)}
    ${sectorCards()}</div></section>

  <section class="sec sec--paper sec--tight" aria-labelledby="dl-t"><div class="wrap">
    ${secHead("Scadenze da non perdere", `<span id="dl-t">Quattro date che riguardano la tua azienda.</span>`, "", `<a class="more" href="#incentivi">La guida agli incentivi ${ic("arrow-right")}</a>`)}
    <div class="dl-grid">${DEADLINES.map(dlCard).join("")}</div></div></section>

  <section class="sec"><div class="wrap">
    ${secHead("Ti riconosci?", "Ti riconosci in uno di questi problemi?", "Sono le richieste che riceviamo più spesso. Per ognuna c’è una soluzione concreta.")}
    <div class="pains">${PROBLEMS.map(([q, id]) => `<a class="pain" href="#${id}"><p>${q}</p><span class="pain__tag">${SERVICES[id].short}${ic("arrow-right")}</span></a>`).join("")}</div>
  </div></section>

  <section class="sec sec--paper"><div class="wrap">
    ${secHead("Servizi", "Cinque aree, un solo referente.", "", `<a class="more" href="#servizi">Vedi tutti i servizi ${ic("arrow-right")}</a>`)}
    ${bento()}</div></section>

  ${compareSection()}

  <section class="sec sec--dark"><div class="wrap">
    ${secHead("Strumenti gratuiti", "Scopri in due minuti dove la tua azienda è scoperta.", "Strumenti semplici e senza registrazione: le risposte restano sul tuo dispositivo.")}
    <div class="tools">
      <a class="tool-hero" href="#test-sicurezza">${icDot("shield")}<h3>Test di sicurezza</h3><p>Dieci domande sì o no su backup, password, aggiornamenti e truffe. Alla fine sai cosa sistemare per primo.</p>
        ${gaugeSvg(60, "#E9B44C", 60, "Esempio di risultato: 60 su 100")}<span class="more" style="color:var(--green)">Inizia il test ${ic("arrow-right")}</span></a>
      <div class="tool-cards">${TOOLS.filter((x) => x.id !== "test-sicurezza").map((x) => `<a class="tool-card" href="#${x.id}"${x.anchor ? ` data-scroll="${x.anchor}"` : ""}>${icDot(x.icon)}<b>${x.name}</b><p>${x.line}</p><span class="more">Apri ${ic("arrow-right")}</span></a>`).join("")}</div>
    </div></div></section>

  <section class="sec sec--paper"><div class="wrap">
    ${secHead("Formule a canone", "Un costo fisso al mese, senza sorprese.", "Scegli la formula o chiedici di comporla su misura.", `<a class="more" href="#formule" data-scroll="configuratore">Quale fa per te? ${ic("arrow-right")}</a>`)}
    ${plansHtml()}</div></section>

  <section class="sec"><div class="wrap">
    ${secHead("Come lavoriamo", "Dal primo contatto all’assistenza, in quattro passi.")}
    ${steps(STEPS4)}
    <div class="row mt-l"><a class="btn btn--primary btn--lg" href="#check-up">Prenota il sopralluogo gratuito</a><span class="muted">oppure chiama lo <a href="${C.telHref}"><b>${C.tel}</b></a></span></div>
  </div></section>

  <section class="sec sec--paper"><div class="wrap">
    ${secHead("Progetti", "Lavori realizzati in Maremma.", "", `<a class="more" href="#progetti">Vedi tutti i progetti ${ic("arrow-right")}</a>`)}
    ${casesHtml()}</div></section>

  <section class="sec"><div class="wrap trust-grid">
    <div class="review-photo">
    <figure class="review"><span class="eyebrow">Recensioni Google</span><blockquote>${t("«[Testo di una recensione Google di un cliente soddisfatto.]»")}</blockquote>
      <figcaption class="muted small">${t("[Nome e cognome], [Azienda]. Valutazione [media] su [N] recensioni")}</figcaption></figure>
    ${fotoFig("maremma-pascolo", "(max-width: 860px) 92vw, 600px", "photo--wide")}</div>
    <div><span class="eyebrow">Chi siamo</span><h2 class="mt-s" style="font-size:clamp(26px,3vw,38px)">Lavoriamo con le aziende della Maremma, da vicino.</h2>
      <div class="mt-m">${numsHtml()}</div><p class="small muted mt-m">Tecnologie e partner</p>${partnersHtml()}</div>
  </div></section>

  <section class="sec sec--paper"><div class="wrap">
    ${secHead("Risorse", "Guide utili, scritte per chi non è un tecnico.", "", `<a class="more" href="#risorse">Tutte le guide ${ic("arrow-right")}</a>`)}
    <div class="guides">${GUIDE_ORDER.slice(0, 3).map(guideCard).join("")}</div></div></section>

  ${defaultBand()}
  ${contactSection({ p: "hm" })}`,
});

/* ---------- servizi ---------- */
route("servizi", {
  title: () => "Servizi IT per aziende a Grosseto | Treart Evolution",
  desc: () => "Assistenza IT, sicurezza, reti e connettività, telefonia e web: dodici servizi per le aziende della Maremma, seguiti da un solo referente.",
  nav: () => "servizi",
  render: () => ph({ cr: [["Servizi"]], eyebrow: "Servizi", title: "Cinque aree, un solo referente.", lead: "Dall’assistenza ai computer al sito web: tutta la tecnologia della tua azienda seguita dalla stessa squadra, a Grosseto e in tutta la Maremma.", light: true, e: true,
    ctas: `<a class="btn btn--primary btn--lg" href="#check-up">Prenota il check-up gratuito</a>${waBtn(WA_GENERIC, "Scrivici su WhatsApp", "btn btn--wa btn--lg")}` })
    + `<section class="sec"><div class="wrap">${bento()}</div></section>`
    + `<section class="sec sec--paper sec--tight"><div class="wrap"><div class="note">${icDot("calc")}<p><b>Preferisci un costo fisso?</b> Le formule a canone raccolgono assistenza, sicurezza e monitoraggio in un’unica cifra al mese.</p><a class="btn btn--ghost btn--sm" href="#formule">Vedi le formule</a></div></div></section>`
    + compareSection() + defaultBand() + contactSection({ p: "sv" }),
});

/* ---------- pagine servizio ---------- */
function servicePage(id) {
  const s = SERVICES[id], a = AREAS.find((x) => x.id === s.area);
  const flow = `<div class="flow" role="group" aria-label="Come funziona"><div class="flow__title"><b>Come funziona</b>${icDot(s.icon)}</div>
    <ol>${s.flow.map(([i, h, sub]) => `<li>${icDot(i)}<span><b>${h}</b><span>${sub}</span></span></li>`).join("")}</ol></div>`;
  let notes = (s.notes || []).map((n) => `<div class="note">${icDot(n.icon)}<p>${t(n.text)}</p><a class="btn btn--ghost btn--sm" href="#${n.to}">${n.label}</a></div>`).join("");
  const inc = (s.incentives || []).filter((k) => k !== "cciaa" || dlState(DEADLINES.find((d) => d.id === "cciaa")) !== "past").filter((k) => k !== "voucher" || dlState(DEADLINES.find((d) => d.id === "voucher")) !== "past");
  if (inc.length) notes += `<div class="note note--green">${icDot("euro")}<p><b>Incentivi.</b> ${inc.map((k) => INCENTIVE_NOTE[k]).join(" ")}</p><a class="btn btn--primary btn--sm" href="#trova-incentivo">Verifica in un minuto</a></div>`;
  const g = GUIDES[s.guide], tool = TOOLS.find((x) => x.id === s.tool);
  return ph({ cr: [["Servizi", "servizi"], [a.name, "servizi"], [s.short]], eyebrow: a.name, title: s.title, lead: s.sub,
    ctas: `<a class="btn btn--primary btn--lg" href="${ctaHref(s.cta)}"${ctaAttrs(s.cta, { prefill: id })}>${s.cta.label}</a>${waBtn(s.wa, "WhatsApp", "btn btn--light btn--lg")}<span class="ph__call">o chiama lo <a href="${C.telHref}">${C.tel}</a></span>`,
    side: FOTO[id] ? fotoFig(id, "(max-width: 860px) 92vw, 540px", "photo--layer photo--hero") : flow })
    + (notes ? `<section class="sec sec--paper sec--tight"><div class="wrap notes">${notes}</div></section>` : "")
    + `<section class="sec"><div class="wrap">${secHead("Ti riconosci?", "I problemi che risolviamo più spesso.")}
        <div class="pains pains--static">${s.pains.map((q) => `<div class="pain"><p>${q}</p></div>`).join("")}</div></div></section>`
    + `<section class="sec sec--paper"><div class="wrap split"><div class="split__head"><span class="eyebrow">Cosa facciamo</span><h2>Cosa comprende il servizio.</h2>
        <p class="lead">Tutto quello che serve, seguito da un solo referente che conosce la tua azienda.</p>
        <div class="row"><a class="btn btn--dark" href="#preventivo" data-prefill="${id}">Richiedi un preventivo</a></div></div>
        <div>${FOTO[id] ? flow : ""}<ul class="does">${s.does.map((d) => `<li>${ic("check")}<span>${t(d)}</span></li>`).join("")}</ul>
        ${s.stat ? `<div class="stat"><b>${s.stat.n}</b><p>${s.stat.text} Fonte: <a href="${s.stat.src[1]}" target="_blank" rel="noopener">${s.stat.src[0]}</a>.</p></div>` : ""}</div></div></section>`
    + `<section class="sec"><div class="wrap">${secHead("Come lavoriamo", "Quattro passi, nessuna sorpresa.")}${steps(s.steps)}</div></section>`
    + `<section class="sec sec--paper"><div class="wrap">${secHead("Perché Treart", "Perché sceglierci.")}
        <div class="why">${s.why.map(([i, h, p]) => `<div>${icDot(i)}<h3>${h}</h3><p>${t(p)}</p></div>`).join("")}</div></div></section>`
    + `<section class="sec"><div class="wrap split"><div class="split__head"><span class="eyebrow">Domande frequenti</span><h2>Le domande che ci fanno più spesso.</h2>
        <p class="lead">Non trovi la tua? Scrivici: rispondiamo entro ${t(C.reply)}.</p><div class="row">${waBtn(s.wa)}</div></div>
        <div class="faq">${s.faq.map(([q, r], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}${ic("chevron-down")}</summary><p>${t(r)}</p></details>`).join("")}</div></div></section>`
    + `<section class="sec sec--paper"><div class="wrap">${secHead("Approfondisci", "Guide, strumenti e servizi collegati.")}
        <div class="cards2">${guideCard(s.guide)}${tool ? toolCardLight(tool) : ""}${s.related.map(serviceCard).join("")}</div></div></section>`
    + contactSection({ title: `Parliamo di ${s.short.toLowerCase()}.`, service: id, p: "sp" });
}
SERVICE_ORDER.forEach((id) => route(id, {
  title: () => SERVICES[id].seo[0], desc: () => SERVICES[id].seo[1], nav: () => "servizi",
  render: () => servicePage(id),
}));

/* ---------- settori ---------- */
route("settori", {
  title: () => "Settori: hotel, studi, negozi, agricoltura, industria | Treart Evolution",
  desc: () => "Soluzioni IT pensate per hotel e agriturismi, studi professionali, negozi, aziende agricole e industria in Maremma.",
  nav: () => "settori",
  render: () => ph({ cr: [["Settori"]], eyebrow: "Settori", title: "Soluzioni pensate per il tuo settore.", lead: "Hotel, studi, negozi, aziende agricole, industria: ogni settore ha problemi diversi. Partiamo dai tuoi.", light: true, e: true })
    + `<section class="sec sec--tight"><div class="wrap">${sectorCards()}</div></section>`
    + `<section class="sec sec--paper"><div class="wrap">${SECTORS.map((s) => `<article class="sector-row" id="settore-${s.id}">
        <div><span class="eyebrow">${s.name}</span><h2>${s.line}</h2><div class="row mt-m">${waBtn(s.wa)}<a class="btn btn--ghost" href="#check-up">Check-up gratuito</a></div>${fotoFig("settore-" + s.id, "(max-width: 860px) 92vw, 520px", "photo--layer mt-m")}</div>
        <div><h3>I problemi che sentiamo più spesso</h3><ul class="quotes mt-s">${s.pains.map((q) => `<li>${q}</li>`).join("")}</ul>
          <h3 class="mt-m">Cosa ti proponiamo</h3><div class="chips-links mt-s">${s.services.map((id) => `<a class="chip-link" href="#${id}">${ic(SERVICES[id].icon)}${SERVICES[id].short}</a>`).join("")}</div>
          <p class="mt-m"><a class="more" href="#${s.guide}">Leggi la guida: ${GUIDES[s.guide].short} ${ic("arrow-right")}</a></p></div></article>`).join("")}</div></section>`
    + defaultBand() + contactSection({ p: "st" }),
});

/* ---------- formule ---------- */
route("formule", {
  title: () => "Formule di assistenza IT a canone | Treart Evolution",
  desc: () => "Assistenza informatica a canone mensile fisso, da 200 € al mese: formule Essenziale, Business e Completa per le aziende della Maremma.",
  nav: () => "formule",
  render: () => ph({ cr: [["Formule a canone"]], eyebrow: "Formule a canone", title: "Un costo fisso al mese, senza sorprese.", lead: "Scegli la formula o chiedici di comporla su misura. Il canone copre l’assistenza; hardware e progetti nuovi si quotano sempre prima di iniziare.", light: true, e: true })
    + `<section class="sec"><div class="wrap">${plansHtml()}</div></section>`
    + `<section class="sec sec--paper" id="configuratore" style="scroll-margin-top:calc(var(--hdr-h) + 8px)"><div class="wrap">${secHead("Configuratore", "Quale formula fa per te?", "Rispondi a qualche domanda: ti consigliamo la formula e prepariamo la richiesta.")}${toolConfig()}</div></section>`
    + `<section class="sec"><div class="wrap">${secHead("Confronto", "Cosa comprende ogni formula.")}
        <div class="matrix-wrap"><table class="matrix"><thead><tr><th scope="col">Servizio</th>${PLANS.map((p) => `<th scope="col">${p.name}</th>`).join("")}</tr></thead>
        <tbody>${MATRIX.map((r) => `<tr><td>${r[0]}</td>${[1, 2, 3].map((i) => `<td>${r[i] ? `${ic("check")}<span class="vh">incluso</span>` : `<span class="no" aria-hidden="true">–</span><span class="vh">non incluso</span>`}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div></section>`
    + `<section class="sec sec--paper"><div class="wrap split"><div class="split__head"><span class="eyebrow">Domande frequenti</span><h2>Come funziona il canone.</h2></div>
        <div class="faq">${PLAN_FAQ.map(([q, r], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}${ic("chevron-down")}</summary><p>${t(r)}</p></details>`).join("")}</div></div></section>`
    + defaultBand(),
  after: (m) => initConfig(m),
});

/* ---------- strumenti ---------- */
route("strumenti", {
  title: () => "Strumenti gratuiti per la tua azienda | Treart Evolution",
  desc: () => "Test di sicurezza, calcolo del costo di un fermo, trova incentivi, verifica dello spegnimento del rame e configuratore delle formule.",
  nav: () => "strumenti",
  render: () => ph({ cr: [["Strumenti gratuiti"]], eyebrow: "Strumenti gratuiti", title: "Capire prima di spendere.", lead: "Cinque strumenti per misurare rischi, costi e opportunità della tua azienda. Senza registrazione: le risposte restano sul tuo dispositivo.", light: true, e: true })
    + `<section class="sec"><div class="wrap"><div class="guides">${TOOLS.map(toolCardLight).join("")}</div></div></section>`
    + defaultBand(),
});
const toolRoutes = [
  ["test-sicurezza", "Test di sicurezza", "Quanto è protetta la tua azienda?", "Dieci domande, due minuti. Rispondi sinceramente: il risultato ti dice cosa sistemare per primo.", toolQuiz, initQuiz, ["ransomware", "email-truffa", "nis2"], "Test di sicurezza informatica gratuito per aziende | Treart Evolution"],
  ["costo-fermo", "Quanto costa un fermo", "Quanto ti costa un giorno con i computer fermi?", "Inserisci persone, costi e fatturato: vedi subito cosa perdi se computer e gestionale si bloccano.", toolDowntime, initDowntime, ["ransomware", "nis2", "email-truffa"], "Calcola il costo di un fermo informatico | Treart Evolution"],
  ["trova-incentivo", "Trova il tuo incentivo", "Quale incentivo puoi usare?", "Voucher del Ministero, bando della Camera di commercio, iperammortamento: rispondi a poche domande e scopri quanto puoi recuperare.", toolIncentive, initIncentive, ["incentivi", "nis2", "accessibilita"], "Trova incentivi per digitale e cybersecurity | Treart Evolution"],
  ["verifica-rame", "Verifica spegnimento del rame", "Cosa smette di funzionare quando si spegne il rame?", "Dicci che linea hai e cosa ci è collegato: ti diciamo cosa rischi e cosa fare prima del passaggio.", toolRame, initRame, ["spegnimento-rame", "incentivi", "wifi-hotel"], "Spegnimento della rete in rame: verifica gratuita | Treart Evolution"],
];
toolRoutes.forEach(([id, name, title, lead, html, init, guides, seo]) => route(id, {
  title: () => seo, desc: () => lead, nav: () => "strumenti",
  render: () => ph({ cr: [["Strumenti", "strumenti"], [name]], eyebrow: "Strumento gratuito", title, lead, light: true })
    + `<section class="sec sec--tight"><div class="wrap">${html()}</div></section>` + moreGuides(guides) + defaultBand(),
  after: (m) => init(m),
}));

/* ---------- risorse e guide ---------- */
route("risorse", {
  title: () => "Guide su sicurezza, incentivi e tecnologia per PMI | Treart Evolution",
  desc: () => "NIS2, incentivi 2026, spegnimento del rame, ransomware, email truffa, Wi-Fi per hotel e accessibilità: guide brevi per le aziende.",
  nav: () => "risorse",
  render: () => {
    const cats = ["Tutte", ...Array.from(new Set(GUIDE_ORDER.map((id) => GUIDES[id].cat)))];
    return ph({ cr: [["Risorse"]], eyebrow: "Guide e risorse", title: "Guide utili, scritte per chi non è un tecnico.", lead: "Normative, incentivi, sicurezza: cosa cambia per la tua azienda e cosa fare subito.", light: true, e: true })
      + `<section class="sec"><div class="wrap"><div class="filters chips" role="group" aria-label="Filtra per argomento">${cats.map((c, i) => `<label class="chip"><input type="radio" name="flt" value="${c}"${i === 0 ? " checked" : ""}><span>${c}</span></label>`).join("")}</div>
        <div class="guides" id="guide-list">${GUIDE_ORDER.map(guideCard).join("")}</div></div></section>`
      + `<section class="sec sec--paper"><div class="wrap">${secHead("Strumenti", "Dalla teoria ai numeri della tua azienda.")}<div class="guides">${TOOLS.map(toolCardLight).join("")}</div></div></section>`
      + defaultBand();
  },
  after: (m) => {
    const list = $("#guide-list", m);
    $$('input[name="flt"]', m).forEach((r) => r.addEventListener("change", () => {
      $$(".gcard", list).forEach((c) => { c.hidden = r.value !== "Tutte" && c.dataset.cat !== r.value; });
    }));
  },
});
function guidePage(id) {
  const g = GUIDES[id], svc = SERVICES[g.service], tool = TOOLS.find((x) => x.id === g.tool);
  const embed = g.embed === "trova-incentivo" ? toolIncentive() : g.embed === "verifica-rame" ? toolRame() : "";
  const others = GUIDE_ORDER.filter((x) => x !== id).slice(0, 3);
  return ph({ cr: [["Risorse", "risorse"], [g.cat]], eyebrow: g.cat, title: g.title, lead: `<span class="meta" style="margin:0">${ic("clock")}${g.min} minuti di lettura · aggiornata a ottobre 2026</span>`, light: true, e: true })
    + `<section class="sec sec--tight"><div class="wrap art"><article class="art__body">
        ${fotoFig("guida-" + id, "(max-width: 980px) 92vw, 760px", "photo--article")}
        <div class="brief"><b>In breve</b>${t(g.lead)}</div>
        ${(g.blocks || []).map(([h, p]) => `<div class="inc-block"><h3>${h}</h3><p>${t(p)}</p></div>`).join("")}
        ${g.body.map((p) => `<p>${t(p)}</p>`).join("")}
        <div><div class="todo__head"><h2>Cosa fare subito</h2><span class="todo__count small muted"></span></div>
          <div class="todo mt-s" data-key="${id}">${g.todo.map((x, i) => `<label><input type="checkbox" id="todo-${id}-${i}"><span>${t(x)}</span></label>`).join("")}</div>
          <p class="fine mt-s">Le spunte restano salvate su questo dispositivo.</p></div>
        ${g.sources.length ? `<div><h2>Fonti</h2><ul class="sources mt-s">${g.sources.map(([l, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${l}</a></li>`).join("")}</ul></div>` : ""}
      </article>
      <aside class="aside">
        <div class="aside-card">${icDot(svc.icon)}<h3>${svc.short}</h3><p>${svc.menu}.</p>
          <a class="btn btn--primary" href="${ctaHref(g.cta)}"${ctaAttrs(g.cta, { prefill: g.service })}>${g.cta.label}</a>${waBtn(svc.wa, "Scrivici su WhatsApp", "btn btn--light")}</div>
        ${tool && !embed ? `<a class="aside-card aside-card--light" href="#${tool.id}"${tool.anchor ? ` data-scroll="${tool.anchor}"` : ""} style="text-decoration:none;color:var(--anth)">${icDot(tool.icon)}<h3>${tool.name}</h3><p>${tool.line}</p><span class="more">Apri lo strumento ${ic("arrow-right")}</span></a>` : ""}
      </aside></div></section>`
    + (embed ? `<section class="sec sec--paper" id="strumento"><div class="wrap">${secHead("Strumento gratuito", tool.name, tool.line)}${embed}</div></section>` : "")
    + moreGuides(others, "Altre guide") + defaultBand();
}
GUIDE_ORDER.forEach((id) => route(id, {
  title: () => `${GUIDES[id].short} | Treart Evolution`, desc: () => firstSentence(GUIDES[id].lead), nav: () => "risorse",
  render: () => guidePage(id),
  after: (m) => { if (GUIDES[id].embed === "trova-incentivo") initIncentive(m); if (GUIDES[id].embed === "verifica-rame") initRame(m); },
}));

/* ---------- chi siamo e progetti ---------- */
route("chi-siamo", {
  title: () => "Chi siamo | Treart Evolution, Grosseto",
  desc: () => "Treart Evolution è il partner IT delle aziende di Grosseto e della Maremma: assistenza informatica, sicurezza, reti, telefonia e web.",
  nav: () => "chi-siamo",
  render: () => ph({ cr: [["Chi siamo"]], eyebrow: "Chi siamo", title: "La tecnologia della tua azienda, seguita da vicino.", lead: "Treart Evolution è una società di Grosseto che segue la tecnologia delle aziende della Maremma: assistenza informatica, sicurezza, reti, telefonia e web. Un solo partner, un solo numero da chiamare.", light: true, e: true })
    + (FOTO["maremma-costa"] ? `<section class="sec sec--tight"><div class="wrap"><figure class="photo photo--banner">${foto("maremma-costa", "(max-width: 1240px) 92vw, 1160px")}<figcaption>Siamo a Grosseto e seguiamo le aziende di tutta la Maremma, dalla costa all’entroterra.</figcaption></figure></div></section>` : "")
    + `<section class="sec"><div class="wrap">${secHead("Come lavoriamo", "Quattro principi, ogni giorno.")}
        <div class="why why--4">
          <div>${icDot("users")}<h3>Un solo referente</h3><p>Rete, telefoni, sicurezza e sito seguiti dalla stessa squadra. Nessuno rimbalza la colpa a qualcun altro.</p></div>
          <div>${icDot("gauge")}<h3>Prevenzione prima dell’emergenza</h3><p>Teniamo d’occhio i sistemi per intervenire prima del guasto, non dopo.</p></div>
          <div>${icDot("chat")}<h3>Parole semplici</h3><p>Preventivi chiari, con canone e costi una tantum separati. Ti spieghiamo cosa compri e perché.</p></div>
          <div>${icDot("pin")}<h3>Vicini davvero</h3><p>Siamo a Grosseto: quando serve, veniamo in azienda.</p></div>
        </div></div></section>`
    + `<section class="sec sec--paper"><div class="wrap split"><div class="split__head"><span class="eyebrow">La nostra storia</span><h2>Da dove veniamo.</h2></div>
        <div style="display:grid;gap:24px"><p class="lead">${t("[Breve storia dell’azienda: anno di fondazione, persone, primi clienti, come è cresciuta]")}</p>${numsHtml()}<div><p class="small muted">Tecnologie e partner</p>${partnersHtml()}</div></div></div></section>`
    + `<section class="sec"><div class="wrap">${secHead("Le persone", "Chi trovi dall’altra parte del telefono.")}
        <div class="cases">${[1, 2, 3].map(() => `<article class="case"><div class="case__img">${t("[Foto]")}</div><div class="case__body"><h3>${t("[Nome e cognome]")}</h3><p class="muted">${t("[Ruolo]")}</p></div></article>`).join("")}</div></div></section>`
    + `<section class="sec sec--paper sec--tight"><div class="wrap"><div class="facts">
        <div><span>Ragione sociale</span><b>Treart Evolution Srl</b></div><div><span>Sede</span><b>${C.addr1}, ${C.addr2}</b></div>
        <div><span>Partita IVA</span><b>${C.piva}</b></div><div><span>REA</span><b>${C.rea}</b></div><div><span>Capitale sociale</span><b>${C.cap}</b></div>
        <div><span>PEC</span><b>${soft(C.pec, "PEC dal biglietto 2015: da confermare")}</b></div></div></div></section>`
    + defaultBand() + contactSection({ p: "cs2" }),
});
route("progetti", {
  title: () => "Progetti realizzati in Maremma | Treart Evolution",
  desc: () => "Reti Wi-Fi, backup, centralini VoIP: i lavori realizzati da Treart Evolution per le aziende della Maremma.",
  nav: () => "chi-siamo",
  render: () => ph({ cr: [["Progetti"]], eyebrow: "Progetti", title: "Lavori realizzati in Maremma.", lead: "Ogni progetto parte da un problema concreto e finisce con un risultato misurabile. Qui raccontiamo come.", light: true, e: true })
    + `<section class="sec"><div class="wrap">${casesHtml()}<p class="fine mt-m">${t("[Schede di esempio: da sostituire con tre casi reali, con il permesso dei clienti]")}</p></div></section>`
    + defaultBand() + contactSection({ title: "Il prossimo progetto può essere il tuo.", p: "pj" }),
});

/* ---------- contatti ---------- */
function chCard(icon, title, value, text, actions, extra = "") {
  return `<article class="ch">${icDot(icon)}<h3>${title}</h3><div class="ch__val">${value}</div><p>${text}</p>${extra}<div class="row">${actions}</div></article>`;
}
const VCARD_TEXT = `Treart Evolution Srl\n${C.addr1}, ${C.addr2}\nTel. ${C.telIntl}\n${C.email}\n${C.site}`;
route("contatti", {
  title: () => "Contatti | Treart Evolution, Grosseto",
  desc: () => "Telefono 0564 176 8249, WhatsApp, email info@treart-evolution.com, sede in Via Aurelia Nord 76/1 a Grosseto.",
  nav: () => "contatti",
  render: () => ph({ cr: [["Contatti"]], eyebrow: "Contatti", title: "Parliamo del tuo progetto.", lead: `Scegli il canale che preferisci. Rispondiamo entro ${t(C.reply)}, dal lunedì al venerdì.`, light: true, e: true,
      ctas: `<a class="btn btn--primary btn--lg" href="${C.telHref}">${ic("phone")}Chiama lo ${C.tel}</a>${waBtn(WA_GENERIC, "Scrivici su WhatsApp", "btn btn--wa btn--lg")}` })
    + `<section class="sec sec--tight"><div class="wrap"><div class="actions4">
        <a class="action" href="#preventivo">${ic("file")}<b>Richiedi un preventivo</b><span>Tre passi, due minuti</span></a>
        <a class="action" href="#check-up">${ic("calendar")}<b>Prenota il check-up</b><span>Gratuito, in azienda o da remoto</span></a>
        <button class="action" type="button" data-open="callback">${ic("clock")}<b>Richiamami</b><span>Lasciaci il numero, ti chiamiamo noi</span></button>
        <a class="action" href="#assistenza">${ic("headset")}<b>Sono già cliente</b><span>Apri una richiesta di assistenza</span></a>
      </div></div></section>`
    + `<section class="sec sec--paper"><div class="wrap">${secHead("Tutti i canali", "Telefono, WhatsApp, email o di persona.")}<div class="ch-grid">
        ${chCard("phone", "Telefono", C.tel, C.hours + ".", `<a class="btn btn--primary btn--sm" href="${C.telHref}">Chiama</a><button class="btn btn--ghost btn--sm" type="button" data-copy="${C.telIntl}"><span data-label>Copia il numero</span></button>`)}
        ${chCard("chat", "WhatsApp", C.tel, "Scrivici quando vuoi: rispondiamo in orario d’ufficio. Puoi mandarci foto e documenti.", `<a class="btn btn--primary btn--sm" href="${waHref(WA_GENERIC)}" target="_blank" rel="noopener">Apri WhatsApp</a>`, QR.wa)}
        ${chCard("mail", "Email", C.email, "Per capitolati, documenti e richieste dettagliate.", `<a class="btn btn--primary btn--sm" href="mailto:${C.email}">Scrivi un’email</a><button class="btn btn--ghost btn--sm" type="button" data-copy="${C.email}"><span data-label>Copia l’indirizzo</span></button>`)}
        ${chCard("stamp", "PEC", soft(C.pec, "PEC dal biglietto 2015: da confermare"), "Per le comunicazioni ufficiali.", `<button class="btn btn--ghost btn--sm" type="button" data-copy="${C.pec}"><span data-label>Copia l’indirizzo</span></button>`)}
        ${chCard("pin", "Sede", `${C.addr1}<br>${C.addr2}`, C.hours + ".", `<a class="btn btn--primary btn--sm" href="${C.maps}" target="_blank" rel="noopener">Indicazioni stradali</a><button class="btn btn--ghost btn--sm" type="button" data-copy="${C.addr1}, ${C.addr2}"><span data-label>Copia l’indirizzo</span></button>`)}
        ${chCard("user", "Commerciale", C.fabio.name, `${soft(C.fabio.tel, "Cellulare dal biglietto 2015: da confermare")} · ${C.fabio.email}`, `<a class="btn btn--primary btn--sm" href="${C.fabio.telHref}">Chiama</a><a class="btn btn--ghost btn--sm" href="mailto:${C.fabio.email}">Scrivi</a>`)}
      </div></div></section>`
    + `<section class="sec sec--tight"><div class="wrap"><div class="note note--qr">${QR.vcard}<p><b>Salva il nostro contatto.</b> Inquadra il codice con la fotocamera del telefono: numero, email e indirizzo vanno in rubrica in un attimo.</p>
        <button class="btn btn--ghost btn--sm" type="button" data-copy="${esc(VCARD_TEXT)}">${ic("copy")}<span data-label>Copia tutti i contatti</span></button></div></div></section>`
    + contactSection({ title: "Scrivici qui.", p: "ct" })
    + `<section class="sec"><div class="wrap">${secHead("Dopo la richiesta", "Cosa succede dopo.")}${steps([["Ti ricontattiamo", `Entro ${C.reply}, sul canale che hai scelto.`], ["Sopralluogo gratuito", "Se serve, veniamo a vedere di persona rete, linee e impianti."], ["Preventivo chiaro", "Canone e costi una tantum separati, senza sorprese."]], "steps--3")}</div></section>`,
});

/* ---------- preventivo in tre passi ---------- */
function quoteForm() {
  const pre = S.prefill || [], notes = S.notes || "";
  return `<form class="form" id="f-pv" novalidate data-kind="quote">
    <ol class="stepper" aria-label="Passi della richiesta"><li aria-current="step" data-s="1"><span>1</span>Cosa ti serve</li><li data-s="2"><span>2</span>La tua azienda</li><li data-s="3"><span>3</span>I tuoi contatti</li></ol>
    <div data-step="1" class="form">
      <fieldset class="field" data-req-group="pv-svc" data-err="Scegli almeno un servizio, anche «Non lo so ancora»."><legend>Quali servizi ti interessano?</legend>
        ${AREAS.map((a) => `<p class="lbl mt-s" style="font-size:13px;color:var(--grey-2);font-weight:700">${a.name}</p><div class="chips">${a.services.map((id) => `<label class="chip"><input type="checkbox" name="pv-svc" value="${id}"${pre.includes(id) ? " checked" : ""}><span>${SERVICES[id].short}</span></label>`).join("")}</div>`).join("")}
        <div class="chips mt-s"><label class="chip"><input type="checkbox" name="pv-svc" value="nonso"><span>Non lo so ancora</span></label></div>
        <span class="err" hidden></span></fieldset>
      ${field({ id: "pv-msg", label: "Raccontaci in breve", type: "textarea", opt: true, rows: 4, val: notes, ph: "Che problema avete oggi, quante persone, quali sedi" })}
      <div class="form__foot"><span class="fine">Passo 1 di 3</span><button class="btn btn--primary btn--lg" type="button" data-next>Avanti ${ic("arrow-right")}</button></div>
    </div>
    <div data-step="2" class="form" hidden>
      <div class="form__row">${field({ id: "pv-az", label: "Azienda", req: true, ac: "organization", err: "Scrivi il nome dell’azienda." })}${field({ id: "pv-comune", label: "Comune", req: true, ac: "address-level2", err: "Scrivi il comune della sede." })}</div>
      <div class="form__row">${field({ id: "pv-settore", label: "Settore", type: "select", options: [["", "Scegli il settore"], ...SECTORS.map((s) => [s.name, s.name]), ["Altro", "Altro"]] })}${field({ id: "pv-pers", label: "Persone che usano un computer", type: "select", options: [["", "Scegli"], ["da 1 a 5", "Da 1 a 5"], ["da 6 a 15", "Da 6 a 15"], ["da 16 a 50", "Da 16 a 50"], ["più di 50", "Più di 50"]] })}</div>
      ${chips({ name: "pv-sedi", legend: "Sedi", items: [["Una sede", "Una sede"], ["Più sedi", "Più sedi"], ["Anche cantieri o sedi temporanee", "Anche cantieri o sedi temporanee"]], type: "radio", checked: ["Una sede"] })}
      <div class="form__foot"><button class="linkbtn" type="button" data-prev>Indietro</button><button class="btn btn--primary btn--lg" type="button" data-next>Avanti ${ic("arrow-right")}</button></div>
    </div>
    <div data-step="3" class="form" hidden>
      <div class="form__row">${field({ id: "pv-nome", label: "Nome e cognome", req: true, ac: "name", err: "Scrivi il tuo nome." })}${field({ id: "pv-ruolo", label: "Ruolo", opt: true, ac: "organization-title" })}</div>
      <div class="form__row">${field({ id: "pv-tel", label: "Telefono", type: "tel", req: true, ac: "tel", im: "tel", err: "Scrivi un numero a cui richiamarti." })}${field({ id: "pv-mail", label: "Email", type: "email", opt: true, ac: "email" })}</div>
      ${chips({ name: "pv-canale", legend: "Come preferisci essere ricontattato?", items: [["Telefono", "Telefono"], ["WhatsApp", "WhatsApp"], ["Email", "Email"]], type: "radio", checked: ["Telefono"] })}
      ${chips({ name: "pv-quando", legend: "Quando", items: [["Mattina", "Mattina"], ["Pomeriggio", "Pomeriggio"], ["Indifferente", "Indifferente"]], type: "radio", checked: ["Indifferente"] })}
      ${consent("pv-ok")}
      <div class="form__foot"><button class="linkbtn" type="button" data-prev>Indietro</button><button class="btn btn--primary btn--lg" type="submit">${ic("send")}Prepara la richiesta</button></div>
    </div>
  </form>`;
}
function initQuote(root) {
  const f = $("#f-pv", root);
  if (!f) return;
  let step = 1;
  const show = (n) => {
    step = n;
    $$("[data-step]", f).forEach((s) => { s.hidden = Number(s.dataset.step) !== n; });
    $$(".stepper li", f).forEach((li) => { const k = Number(li.dataset.s); if (k === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); li.classList.toggle("done", k < n); });
    f.scrollIntoView({ block: "start" });
    const first = $(`[data-step="${n}"] input:not([type=radio]):not([type=checkbox]), [data-step="${n}"] select, [data-step="${n}"] textarea`, f);
    first && first.focus({ preventScroll: true });
  };
  f.addEventListener("click", (e) => {
    if (e.target.closest("[data-next]")) { if (validate($(`[data-step="${step}"]`, f))) show(step + 1); }
    if (e.target.closest("[data-prev]")) show(step - 1);
  });
}
HANDLERS.quote = (f) => {
  if (radioVal(f, "pv-canale") === "Email" && !fv(f, "pv-mail")) {
    const el = $("#pv-mail", f), er = $("#pv-mail-err", f);
    er.textContent = "Hai scelto l’email: scrivi il tuo indirizzo."; er.hidden = false; el.setAttribute("aria-invalid", "true"); el.focus(); return;
  }
  const svcs = checkedVals(f, "pv-svc").map((v) => (v === "nonso" ? "Non lo so ancora" : SERVICES[v].name));
  handoff(f, "Richiesta di preventivo", [
    `Servizi: ${svcs.join(", ")}`, `Azienda: ${fv(f, "pv-az")}, ${fv(f, "pv-comune")}`, fv(f, "pv-settore") && `Settore: ${fv(f, "pv-settore")}`,
    fv(f, "pv-pers") && `Persone al computer: ${fv(f, "pv-pers")}`, `Sedi: ${radioVal(f, "pv-sedi")}`,
    `Referente: ${fv(f, "pv-nome")}${fv(f, "pv-ruolo") ? " (" + fv(f, "pv-ruolo") + ")" : ""}`, `Telefono: ${fv(f, "pv-tel")}`, fv(f, "pv-mail") && `Email: ${fv(f, "pv-mail")}`,
    `Preferenza: ${radioVal(f, "pv-canale")}, ${radioVal(f, "pv-quando").toLowerCase()}`, fv(f, "pv-msg") && `\n${fv(f, "pv-msg")}`]);
};
const sideHelp = () => `<aside class="aside">
  <div class="aside-card"><h3>Preferisci parlarne?</h3><p>${C.hours}.</p><a class="btn btn--primary" href="${C.telHref}">${ic("phone")}${C.tel}</a>${waBtn(WA_GENERIC, "Scrivici su WhatsApp", "btn btn--light")}<button class="btn btn--light" type="button" data-open="callback">${ic("clock")}Richiamami</button></div>
  <div class="aside-card aside-card--light"><h3>Cosa succede dopo</h3><ol class="mini-steps"><li><b>Ti ricontattiamo</b> entro ${t(C.reply)}.</li><li><b>Sopralluogo gratuito</b>, se serve.</li><li><b>Preventivo chiaro</b>, con canone e costi una tantum separati.</li></ol></div>
</aside>`;
route("preventivo", {
  title: () => "Richiedi un preventivo | Treart Evolution", desc: () => "Richiedi un preventivo per assistenza IT, sicurezza, reti, centralini e siti web. Risposta in tempi brevi.", nav: () => "contatti",
  render: () => ph({ cr: [["Contatti", "contatti"], ["Preventivo"]], eyebrow: "Preventivo gratuito", title: "Richiedi un preventivo.", lead: `Tre passi, due minuti. Ti rispondiamo entro ${t(C.reply)} con una proposta o una data per il sopralluogo.`, light: true })
    + `<section class="sec sec--tight"><div class="wrap art"><div class="panel">${quoteForm()}</div>${sideHelp()}</div></section>`,
  after: (m) => { initQuote(m); S.prefill = null; S.notes = ""; },
});

/* ---------- check-up ---------- */
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day, 12);
}
function isHoliday(d) {
  const md = `${d.getMonth() + 1}-${d.getDate()}`;
  if (["1-1", "1-6", "4-25", "5-1", "6-2", "8-10", "8-15", "11-1", "12-8", "12-25", "12-26"].includes(md)) return true;
  const e = easter(d.getFullYear()); e.setDate(e.getDate() + 1);
  return d.getMonth() === e.getMonth() && d.getDate() === e.getDate();
}
function nextWorkingDays(n) {
  const out = [], d = new Date();
  d.setHours(12, 0, 0, 0);
  const dows = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"], mons = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    const w = d.getDay();
    if (w === 0 || w === 6 || isHoliday(d)) continue;
    out.push({ value: `${dows[w]} ${d.getDate()} ${mons[d.getMonth()]}`, dow: dows[w], label: `${d.getDate()} ${mons[d.getMonth()]}` });
  }
  return out;
}
function checkupForm() {
  const type = S.checkup || "it";
  return `<form class="form" id="f-cu" novalidate data-kind="checkup">
    ${chips({ name: "cu-tipo", legend: "Cosa vuoi verificare?", items: CHECKUP_TYPES, type: "radio", checked: [type] })}
    ${chips({ name: "cu-modo", legend: "Dove", items: [["In azienda", "In azienda"], ["Da remoto", "Da remoto"], ["Decidete voi", "Decidete voi"]], type: "radio", checked: ["In azienda"] })}
    <fieldset class="field" data-req-group="cu-giorno" data-err="Scegli un giorno."><legend>Giorno preferito</legend><div class="chips">${nextWorkingDays(10).map((d) => `<label class="chip chip--day"><input type="radio" name="cu-giorno" value="${d.value}"><span><small>${d.dow}</small>${d.label}</span></label>`).join("")}</div><span class="err" hidden></span></fieldset>
    ${chips({ name: "cu-fascia", legend: "Fascia oraria", items: [["8:30–10:30", "8:30–10:30"], ["10:30–13:00", "10:30–13:00"], ["14:00–15:45", "14:00–15:45"], ["15:45–17:30", "15:45–17:30"]], type: "radio", req: true, err: "Scegli una fascia oraria." })}
    <p class="fine">Giorno e ora sono una preferenza: ti confermiamo noi l’appuntamento.</p>
    <div class="form__row">${field({ id: "cu-nome", label: "Nome e cognome", req: true, ac: "name", err: "Scrivi il tuo nome." })}${field({ id: "cu-az", label: "Azienda", req: true, ac: "organization", err: "Scrivi il nome dell’azienda." })}</div>
    <div class="form__row">${field({ id: "cu-comune", label: "Comune", req: true, ac: "address-level2", err: "Scrivi il comune della sede." })}${field({ id: "cu-tel", label: "Telefono", type: "tel", req: true, ac: "tel", im: "tel", err: "Scrivi un numero per confermare l’appuntamento." })}</div>
    ${field({ id: "cu-mail", label: "Email", type: "email", opt: true, ac: "email" })}
    ${field({ id: "cu-note", label: "Note", type: "textarea", opt: true, rows: 3, val: S.notes || "", ph: "Cosa ti preoccupa di più, quanti computer avete, se c’è un problema in corso" })}
    ${consent("cu-ok")}
    <div class="form__foot"><button class="btn btn--primary btn--lg" type="submit">${ic("calendar")}Prepara la prenotazione</button><span class="fine">Gratuito e senza impegno</span></div>
  </form>`;
}
HANDLERS.checkup = (f) => {
  handoff(f, "Prenotazione check-up gratuito", [
    `Verifica: ${checkedLabels(f, "cu-tipo")[0]}`, `Dove: ${radioVal(f, "cu-modo")}`, `Preferenza: ${radioVal(f, "cu-giorno")}, ${radioVal(f, "cu-fascia")}`,
    `Nome: ${fv(f, "cu-nome")}`, `Azienda: ${fv(f, "cu-az")}, ${fv(f, "cu-comune")}`, `Telefono: ${fv(f, "cu-tel")}`, fv(f, "cu-mail") && `Email: ${fv(f, "cu-mail")}`, fv(f, "cu-note") && `\n${fv(f, "cu-note")}`]);
};
route("check-up", {
  title: () => "Check-up informatico gratuito | Treart Evolution", desc: () => "In un’ora ti diciamo dove la tua azienda è scoperta: computer, backup, sicurezza, rete, linea e sito. In azienda o da remoto.", nav: () => "contatti",
  render: () => ph({ cr: [["Contatti", "contatti"], ["Check-up gratuito"]], eyebrow: "Check-up gratuito", title: "In un’ora ti diciamo dove la tua azienda è scoperta.", lead: "Scegli cosa verificare e quando: veniamo in azienda o ci colleghiamo da remoto. È gratuito e senza impegno.", light: true })
    + `<section class="sec sec--tight"><div class="wrap art"><div class="panel">${checkupForm()}</div><aside class="aside">
        <div class="aside-card aside-card--light"><h3>Cosa controlliamo</h3><ul class="does does--one">${["Computer, server e aggiornamenti", "Backup: c’è, funziona, si ripristina?", "Firewall, posta e accessi", "Rete, Wi-Fi e linea Internet", "Centralino, allarmi e POS sulla linea"].map((x) => `<li>${ic("check")}<span>${x}</span></li>`).join("")}</ul><p>Alla fine ricevi un rapporto in parole semplici, con le priorità.</p></div>
        <div class="aside-card"><h3>Preferisci telefonare?</h3><p>${C.hours}.</p><a class="btn btn--primary" href="${C.telHref}">${ic("phone")}${C.tel}</a></div></aside></div></section>`,
  after: () => { S.checkup = null; S.notes = ""; },
});

/* ---------- assistenza clienti ---------- */
function supportForm() {
  return `<form class="form" id="f-as" novalidate data-kind="support">
    <div class="form__row">${field({ id: "as-az", label: "Azienda", req: true, ac: "organization", err: "Scrivi il nome dell’azienda." })}${field({ id: "as-nome", label: "Nome e cognome", req: true, ac: "name", err: "Scrivi il tuo nome." })}</div>
    <div class="form__row">${field({ id: "as-tel", label: "Telefono", type: "tel", req: true, ac: "tel", im: "tel", err: "Scrivi un numero per richiamarti." })}${field({ id: "as-mail", label: "Email", type: "email", opt: true, ac: "email" })}</div>
    ${field({ id: "as-area", label: "Di cosa si tratta", type: "select", options: [["Computer e stampanti", "Computer e stampanti"], ["Posta e account", "Posta e account"], ["Rete, Wi-Fi e Internet", "Rete, Wi-Fi e Internet"], ["Telefoni e centralino", "Telefoni e centralino"], ["Telecamere e accessi", "Telecamere e accessi"], ["Sito web", "Sito web"], ["Backup e sicurezza", "Backup e sicurezza"], ["Altro", "Altro"]] })}
    ${chips({ name: "as-urg", legend: "Quanto è urgente?", items: [["Siamo fermi", "Siamo fermi"], ["Serio, ma si lavora", "Serio, ma si lavora"], ["Si può programmare", "Si può programmare"]], type: "radio", checked: ["Serio, ma si lavora"] })}
    <div class="alert" id="as-alert" hidden>${ic("alert")}<span>Se siete fermi, chiama subito lo <a href="${C.telHref}">${C.tel}</a>: è il modo più veloce.</span></div>
    ${field({ id: "as-desc", label: "Descrivi il problema", type: "textarea", req: true, rows: 5, err: "Descrivi il problema in poche parole.", ph: "Cosa succede, da quando, su quale computer o apparato. Se c’è un messaggio di errore, riportalo." })}
    ${chips({ name: "as-modo", legend: "Come preferisci l’intervento", items: [["Da remoto", "Da remoto"], ["In sede", "In sede"], ["Decidete voi", "Decidete voi"]], type: "radio", checked: ["Decidete voi"] })}
    ${consent("as-ok")}
    <div class="form__foot"><button class="btn btn--primary btn--lg" type="submit">${ic("send")}Prepara la richiesta</button><span class="fine">Urgenze: ${C.tel}</span></div>
  </form>`;
}
HANDLERS.support = (f) => {
  handoff(f, `Assistenza: ${fv(f, "as-area")} – ${radioVal(f, "as-urg")}`, [
    `Azienda: ${fv(f, "as-az")}`, `Nome: ${fv(f, "as-nome")}`, `Telefono: ${fv(f, "as-tel")}`, fv(f, "as-mail") && `Email: ${fv(f, "as-mail")}`,
    `Area: ${fv(f, "as-area")}`, `Urgenza: ${radioVal(f, "as-urg")}`, `Intervento: ${radioVal(f, "as-modo")}`, `\n${fv(f, "as-desc")}`]);
};
route("assistenza", {
  title: () => "Assistenza clienti | Treart Evolution", desc: () => "Sei già cliente Treart Evolution? Apri una richiesta di assistenza o chiamaci per le urgenze.", nav: () => "contatti",
  render: () => ph({ cr: [["Assistenza clienti"]], eyebrow: "Assistenza clienti", title: "Sei già nostro cliente? Ti aiutiamo subito.", lead: "Per un blocco totale chiamaci. Per tutto il resto apri una richiesta: arriva ai tecnici con le informazioni che servono.",
      ctas: `<a class="btn btn--primary btn--lg" href="${C.telHref}">${ic("phone")}Urgenze: ${C.tel}</a>${waBtn("Ciao, sono un vostro cliente e ho bisogno di assistenza.", "Assistenza su WhatsApp", "btn btn--light btn--lg")}` })
    + `<section class="sec sec--tight"><div class="wrap"><div class="why">
        <div>${icDot("alert")}<h3>Siamo fermi</h3><p>Computer, rete o telefoni bloccati per tutti: chiama subito lo <a href="${C.telHref}"><b>${C.tel}</b></a>.</p></div>
        <div>${icDot("wrench")}<h3>Problema da risolvere</h3><p>Qualcosa non funziona ma si lavora: apri una richiesta qui sotto, ti richiamiamo noi.</p></div>
        <div>${icDot("monitor")}<h3>Assistenza remota</h3><p>Durante la telefonata ti diciamo come avviare il collegamento con ${t("[programma di assistenza remota da confermare]")}, solo con il tuo consenso.</p></div>
      </div></div></section>`
    + `<section class="sec sec--paper sec--tight"><div class="wrap art"><div class="panel"><h2 style="font-size:clamp(22px,2.4vw,28px)">Apri una richiesta di assistenza</h2>${supportForm()}</div>
        <aside class="aside"><div class="aside-card"><h3>Orari dell’assistenza</h3><p>${C.hours}.</p><p><b>Intervento entro ${C.reply}</b> dalla richiesta.</p><p>Fuori orario: ${t("[reperibilità da definire]")}</p></div>
        <div class="aside-card aside-card--light"><h3>Per fare prima</h3><ul class="does does--one">${["Annota il messaggio di errore, o fai una foto dello schermo", "Indica quale computer o apparato ha il problema", "Se puoi, tieni a portata di mano il telefono vicino al PC"].map((x) => `<li>${ic("check")}<span>${x}</span></li>`).join("")}</ul></div></aside></div></section>`,
  after: (m) => {
    const f = $("#f-as", m), al = $("#as-alert", m);
    if (!f) return;
    const upd = () => { al.hidden = radioVal(f, "as-urg") !== "Siamo fermi"; };
    f.addEventListener("change", upd); upd();
  },
});

/* ---------- note legali e pagina non trovata ---------- */
route("privacy", {
  title: () => "Informativa privacy | Treart Evolution", desc: () => "Come Treart Evolution tratta i dati raccolti con moduli, telefono, WhatsApp ed email.", nav: () => "",
  render: () => ph({ cr: [["Privacy"]], eyebrow: "Note legali", title: "Informativa privacy", lead: "Come trattiamo i dati che ci lasci con i moduli, il telefono, WhatsApp e l’email.", light: true })
    + `<section class="sec sec--tight"><div class="wrap"><div class="art__body">
      <p class="brief"><b>Bozza</b>${t("[Testo da far verificare al consulente privacy prima della pubblicazione]")}</p>
      <h2>Titolare del trattamento</h2><p>Treart Evolution Srl, ${C.addr1}, ${C.addr2}. Email ${C.email}, PEC ${soft(C.pec, "PEC dal biglietto 2015: da confermare")}.</p>
      <h2>Quali dati raccogliamo</h2><p>I dati che ci lasci quando chiedi un preventivo, un check-up, una richiamata o assistenza: nome, azienda, comune, telefono, email e il testo della richiesta.</p>
      <h2>Perché li usiamo</h2><p>Per rispondere alla tua richiesta e, se diventi cliente, per fornirti il servizio. La base giuridica è la tua richiesta, cioè l’esecuzione di misure precontrattuali, e quando serve il tuo consenso.</p>
      <h2>Per quanto tempo</h2><p>${t("[Tempi di conservazione da definire]")}</p>
      <h2>Con chi li condividiamo</h2><p>Solo con i fornitori che ci aiutano a erogare il servizio, nominati responsabili del trattamento. ${t("[Elenco dei responsabili da definire]")}</p>
      <h2>I tuoi diritti</h2><p>Puoi chiedere accesso, rettifica, cancellazione, limitazione e portabilità dei tuoi dati, e opporti al trattamento, scrivendo a ${C.email}. Puoi anche presentare reclamo al Garante per la protezione dei dati personali.</p>
      <h2>Strumenti del sito</h2><p>Test, calcoli e liste di controllo funzionano nel tuo browser: le risposte non vengono inviate a nessuno.</p>
    </div></div></section>`,
});
route("cookie", {
  title: () => "Cookie | Treart Evolution", desc: () => "Quali cookie e quale memoria del browser usa il sito di Treart Evolution.", nav: () => "",
  render: () => ph({ cr: [["Cookie"]], eyebrow: "Note legali", title: "Cookie e memoria del browser", lead: "Cosa salva il sito sul tuo dispositivo, e perché.", light: true })
    + `<section class="sec sec--tight"><div class="wrap"><div class="art__body">
      <p class="brief"><b>Bozza</b>${t("[Testo da aggiornare se si aggiungono strumenti di statistica o pubblicità]")}</p>
      <h2>Memoria del browser</h2><p>Il sito ricorda solo le tue spunte nelle liste «Cosa fare subito», sul tuo dispositivo. Non usa cookie di profilazione.</p>
      <h2>Servizi esterni</h2><p>Caratteri tipografici e fotografie sono ospitati insieme al sito: mentre navighi non contatti servizi di altre aziende. I link a WhatsApp e a Google Maps aprono quei servizi solo se li scegli tu.</p>
    </div></div></section>`,
});
route("crediti", {
  title: () => "Crediti fotografici | Treart Evolution", desc: () => "Le fotografie usate nel sito e i loro autori.", nav: () => "",
  render: () => ph({ cr: [["Crediti fotografici"]], eyebrow: "Note legali", title: "Crediti fotografici", lead: "Le fotografie del sito vengono da Unsplash e sono usate secondo la licenza Unsplash. Grazie ai fotografi.", light: true })
    + `<section class="sec sec--tight"><div class="wrap"><ul class="credits">${Object.values(FOTO).map((f) => `<li><b>${esc(f.by)}</b><span>${esc(f.alt)}</span><a href="${f.url}" target="_blank" rel="noopener">Vedi su Unsplash</a></li>`).join("")}</ul></div></section>`,
});
route("404", {
  title: () => "Pagina non trovata | Treart Evolution", desc: () => "La pagina cercata non esiste.", nav: () => "",
  render: () => ph({ eyebrow: "Pagina non trovata", title: "Questa pagina non c’è.", lead: "Forse il link è cambiato. Torna alla home o cerca quello che ti serve.",
    ctas: `<a class="btn btn--primary btn--lg" href="#home">Torna alla home</a><button class="btn btn--light btn--lg" type="button" data-open="search">${ic("search")}Cerca nel sito</button>` }) + defaultBand(),
});
