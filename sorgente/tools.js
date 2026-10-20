/* ================= STRUMENTI INTERATTIVI ================= */

const segR = (name, v, l, on) => `<label><input type="radio" name="${name}" value="${v}"${on ? " checked" : ""}><span>${l}</span></label>`;
const radioVal = (f, n) => { const r = $(`input[name="${n}"]:checked`, f); return r ? r.value : ""; };
const checkedVals = (f, n) => $$(`input[name="${n}"]:checked`, f).map((i) => i.value);
const goWith = (to, opts = {}) => { if (opts.notes != null) S.notes = opts.notes; if (opts.checkup) S.checkup = opts.checkup; if (opts.prefill) S.prefill = opts.prefill; go(to); };

function gaugeSvg(score, color, big, aria) {
  const L = Math.PI * 100;
  const v = Math.max(0, Math.min(100, score));
  return `<svg class="gauge" viewBox="0 0 240 152" role="img" aria-label="${esc(aria)}">
    <path class="track" d="M20 125 A100 100 0 0 1 220 125" fill="none" stroke-width="18" stroke-linecap="round"/>
    ${v > 0 ? `<path d="M20 125 A100 100 0 0 1 220 125" fill="none" stroke="${color}" stroke-width="18" stroke-linecap="round" stroke-dasharray="${(L * v / 100).toFixed(1)} ${L.toFixed(1)}"/>` : ""}
    <text x="120" y="110" text-anchor="middle" font-size="46" font-weight="800" fill="#FFFFFF">${big}</text>
    <text x="120" y="134" text-anchor="middle" font-size="13" fill="#BDBFB8">su 100</text>
    <text x="20" y="150" text-anchor="middle" font-size="11" fill="#BDBFB8">0</text>
    <text x="220" y="150" text-anchor="middle" font-size="11" fill="#BDBFB8">100</text>
  </svg>`;
}
const linkFor = (id) => SERVICES[id] ? `<a href="#${id}">${SERVICES[id].short}</a>` : GUIDES[id] ? `<a href="#${id}">${GUIDES[id].short}</a>` : "";

/* ---------- test di sicurezza ---------- */
function toolQuiz() {
  return `<div class="toolwrap" id="quiz">
    <form class="panel" id="quiz-form" aria-label="Domande del test">
      ${QUIZ.map((q, i) => `<fieldset class="q field"><legend class="q__t"><span class="q__n">${String(i + 1).padStart(2, "0")}</span><span>${esc(q[0])}</span></legend>
        <div class="seg">${segR("q" + i, "si", "Sì")}${segR("q" + i, "no", "No")}${segR("q" + i, "nonso", "Non so")}</div></fieldset>`).join("")}
      <div class="row"><button class="linkbtn" type="reset">Ricomincia il test</button></div>
    </form>
    <aside class="result" id="quiz-res" aria-live="polite"></aside>
  </div>`;
}
function initQuiz(root) {
  const f = $("#quiz-form", root), out = $("#quiz-res", root);
  if (!f) return;
  let summary = "";
  const upd = () => {
    const ans = QUIZ.map((q, i) => radioVal(f, "q" + i));
    const done = ans.filter(Boolean).length;
    const yes = ans.filter((a) => a === "si").length;
    const score = yes * 10;
    if (!done) {
      out.innerHTML = `<span class="eyebrow">Il tuo risultato</span>${gaugeSvg(0, "#B3D670", "–", "Nessuna risposta")}
        <span class="level level--idle">Rispondi alle domande</span>
        <p>Il punteggio si aggiorna mentre rispondi. Le risposte restano su questo dispositivo: non le inviamo a nessuno.</p>`;
      return;
    }
    const lv = score < 40 ? ["Esposta", "bad", "#E06A55"] : score < 70 ? ["Da rinforzare", "warn", "#E9B44C"] : score < 90 ? ["Buona base", "good", "#B3D670"] : ["Ben protetta", "good", "#B3D670"];
    const weak = QUIZ.map((q, i) => ({ q, a: ans[i] })).filter((x) => x.a === "no" || x.a === "nonso");
    summary = `Test di sicurezza: ${score}/100 (${done} risposte su 10).` + (weak.length ? ` Punti da migliorare: ${weak.map((x) => x.q[1].split(":")[0].toLowerCase().replace(/\.$/, "")).join("; ")}.` : "");
    out.innerHTML = `<span class="eyebrow">Il tuo risultato</span>${gaugeSvg(score, lv[2], score, `Punteggio ${score} su 100`)}
      <span class="level level--${lv[1]}">${lv[0]}${done < 10 ? ` · ${done} risposte su 10` : ""}</span>
      ${weak.length ? `<h3>Da sistemare per primo</h3><ul class="prio">${weak.slice(0, 5).map((x) => `<li>${ic("alert")}<span>${esc(x.q[1])}${x.a === "nonso" ? " Se non lo sai, è il primo controllo da fare." : ""} ${linkFor(x.q[2])}</span></li>`).join("")}</ul>${weak.length > 5 ? `<p>E altri ${weak.length - 5} punti che vediamo insieme nel check-up.</p>` : ""}`
        : `<p>Ottimo lavoro: le basi ci sono. Nel check-up controlliamo i dettagli che un test non vede.</p>`}
      <div class="row"><a class="btn btn--primary" href="#check-up" data-go-notes>Prenota il check-up gratuito</a></div>
      <p class="fine" style="color:var(--on-dark-2)">Il risultato è indicativo: misura le abitudini, non la tecnologia installata.</p>`;
  };
  f.addEventListener("change", upd);
  f.addEventListener("reset", () => setTimeout(upd, 0));
  out.addEventListener("click", (e) => { if (e.target.closest("[data-go-notes]")) { e.preventDefault(); goWith("check-up", { notes: summary, checkup: "sicurezza" }); } });
  upd();
}

/* ---------- costo del fermo ---------- */
const DT = [["df-p", "Persone che si fermano", 1, 100, 1, 8, ""], ["df-c", "Costo di un’ora di lavoro, per persona", 10, 80, 1, 25, "€"], ["df-f", "Fatturato che perdi in un’ora di fermo", 0, 3000, 10, 150, "€"], ["df-h", "Ore di fermo", 1, 80, 1, 8, ""]];
const rangeField = ([id, label, min, max, step, val, unit]) => `<div class="range">
    <div class="range__top"><label for="${id}-n">${label}${unit ? ` (${unit})` : ""}</label><input class="input range__num" type="number" id="${id}-n" min="${min}" max="${max}" step="${step}" value="${val}" inputmode="numeric"></div>
    <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${esc(label)}"></div>`;
function bindRange(root, id, onChange) {
  const r = $("#" + id, root), n = $("#" + id + "-n", root);
  r.addEventListener("input", () => { n.value = r.value; onChange(); });
  n.addEventListener("input", () => { const v = Number(n.value); if (!isNaN(v)) { r.value = Math.max(Number(r.min), Math.min(Number(r.max), v)); onChange(); } });
  n.addEventListener("blur", () => { n.value = r.value; });
}
const rv = (root, id) => Number($("#" + id, root).value);
function toolDowntime() {
  return `<div class="toolwrap" id="dt">
    <form class="panel" id="dt-form" aria-label="Dati del calcolo">
      <p class="fine">Valori di esempio: sostituiscili con quelli della tua azienda.</p>
      ${DT.map(rangeField).join("")}
    </form>
    <aside class="result" id="dt-res" aria-live="polite"></aside>
  </div>`;
}
function initDowntime(root) {
  const out = $("#dt-res", root);
  if (!out) return;
  let summary = "";
  const upd = () => {
    const p = rv(root, "df-p"), c = rv(root, "df-c"), f = rv(root, "df-f"), h = rv(root, "df-h");
    const pers = p * c * h, fatt = f * h, tot = pers + fatt, perH = p * c + f;
    summary = `Calcolo del fermo: ${p} persone, ${h} ore, costo stimato ${euro(tot)}.`;
    out.innerHTML = `<span class="eyebrow">Quanto ti costa il fermo</span>
      <div><div class="big">${euro(tot)}</div><p>per ${h} ${h === 1 ? "ora" : "ore"} con computer e gestionale bloccati</p></div>
      <div class="bars"><div class="bar" role="img" aria-label="Personale fermo ${euro(pers)}, fatturato perso ${euro(fatt)}"><i style="width:${tot ? (pers / tot) * 100 : 0}%"></i><i style="width:${tot ? (fatt / tot) * 100 : 0}%"></i></div>
        <div class="legend"><span style="--c:#B3D670">Personale fermo ${euro(pers)}</span><span style="--c:#E9B44C">Fatturato perso ${euro(fatt)}</span></div></div>
      <div class="kv"><span>Un giorno lavorativo (8 ore)</span><b>${euro(perH * 8)}</b><span>Una settimana (40 ore)</span><b>${euro(perH * 40)}</b></div>
      <p>Con un backup provato e un piano di ripartenza, il fermo si misura in ore, non in giorni.</p>
      <div class="row"><a class="btn btn--primary" href="#check-up" data-go-notes>Verifica gratis il tuo backup</a><a class="more" href="#backup" style="color:var(--green)">Il servizio di backup ${ic("arrow-right")}</a></div>`;
  };
  DT.forEach(([id]) => bindRange(root, id, upd));
  out.addEventListener("click", (e) => { if (e.target.closest("[data-go-notes]")) { e.preventDefault(); goWith("check-up", { notes: summary, checkup: "sicurezza" }); } });
  upd();
}

/* ---------- trova il tuo incentivo ---------- */
const INC_CATS = [["sicurezza", "Sicurezza informatica"], ["backup", "Backup e cloud"], ["centralino", "Centralino in cloud"], ["software", "Gestionale, CRM o software in cloud"], ["ecommerce", "E-commerce"], ["sito", "Sito aziendale"], ["pc", "PC, portatili e telefoni"], ["rete", "Rete e Wi-Fi"], ["video", "Videosorveglianza"]];
const catLabels = (arr) => arr.map((c) => (INC_CATS.find((x) => x[0] === c) || [c, c])[1].toLowerCase()).join(", ");
function toolIncentive() {
  const cciaaOpen = dlState(DEADLINES.find((d) => d.id === "cciaa")) !== "past";
  return `<div class="toolwrap" id="inc">
    <form class="panel" id="inc-form" aria-label="Dati della tua azienda">
      <fieldset class="field"><legend class="lbl">Chi sei</legend><div class="seg seg--full">${segR("inc-tipo", "soc", "Società", true)}${segR("inc-tipo", "ditta", "Ditta individuale")}${segR("inc-tipo", "prof", "Libero professionista")}</div>
        <label class="check mt-s"><input type="checkbox" id="inc-forf" name="inc-forf"><span>Sono in regime forfettario</span></label></fieldset>
      <fieldset class="field"><legend class="lbl">Quante persone lavorano in azienda</legend><div class="seg seg--full">${segR("inc-size", "micro", "Meno di 10", true)}${segR("inc-size", "piccola", "10–49")}${segR("inc-size", "media", "50–249")}${segR("inc-size", "grande", "250 o più")}</div></fieldset>
      <fieldset class="field"><legend class="lbl">Dove hai la sede o un’unità locale</legend><div class="seg seg--full">${segR("inc-prov", "gr", "Provincia di Grosseto o Livorno", true)}${segR("inc-prov", "altro", "Altra provincia")}</div></fieldset>
      ${chips({ name: "inc-cosa", legend: "Cosa vuoi realizzare", items: INC_CATS, checked: ["sicurezza", "backup"] })}
      ${rangeField(["inc-budget", "Quanto pensi di spendere", 1000, 60000, 500, 8000, "€"])}
      <fieldset class="field"><legend class="lbl">Hai una connessione da almeno 30 Mbps?</legend><div class="seg seg--full">${segR("inc-conn", "si", "Sì", true)}${segR("inc-conn", "no", "No")}${segR("inc-conn", "nonso", "Non lo so")}</div></fieldset>
      ${cciaaOpen ? `<fieldset class="field"><legend class="lbl">Puoi acquistare e pagare entro il 10 novembre 2026?</legend><div class="seg seg--full">${segR("inc-pay", "si", "Sì", true)}${segR("inc-pay", "no", "No")}</div></fieldset>` : ""}
    </form>
    <aside class="result" id="inc-res" aria-live="polite"></aside>
  </div>`;
}
function incCalc(o) {
  const res = [];
  { // voucher
    const d = DEADLINES.find((x) => x.id === "voucher"), st = dlState(d);
    const elig = ["sicurezza", "backup", "centralino", "software", "ecommerce", "rete"];
    const got = o.cosa.filter((c) => elig.includes(c)), other = o.cosa.filter((c) => !elig.includes(c));
    let status = "yes"; const why = [];
    if (o.size === "grande") { status = "no"; why.push([false, "Riservato a PMI e lavoratori autonomi."]); }
    if (!got.length) { status = "no"; why.push([false, "Le voci scelte non rientrano: il voucher copre sicurezza, backup e servizi in cloud."]); }
    else why.push([true, "Rientrano: " + catLabels(got) + "."]);
    if (o.cosa.includes("rete") && got.length) why.push([null, "Per la rete valgono firewall, router e switch."]);
    if (other.length && got.length) why.push([false, "Non rientrano: " + catLabels(other) + "."]);
    if (o.budget < 4000 && status !== "no") { status = "maybe"; why.push([false, "Il piano minimo è di 4.000 €."]); }
    if (o.conn === "no" && status !== "no") { status = "maybe"; why.push([false, "Serve una connessione da almeno 30 Mbps: possiamo attivarla noi."]); }
    if (o.conn === "nonso" && status === "yes") { status = "maybe"; why.push([false, "Verifichiamo noi la velocità della tua linea."]); }
    if (st === "past") { status = "no"; why.push([false, "Lo sportello è chiuso."]); }
    else if (status !== "no") why.push([true, st === "soon" ? "Domande dal 10 novembre 2026, in ordine di arrivo: conviene prepararsi ora." : "Sportello aperto fino al 20 gennaio 2027, in ordine di arrivo."]);
    if (status !== "no") why.push([null, "Il fornitore deve essere iscritto nell’elenco del Ministero."]);
    res.push({ id: "voucher", name: "Voucher Cloud & Cybersecurity", status, amt: status === "no" ? 0 : 0.5 * Math.min(o.budget, 40000), lab: "contributo fino a", why });
  }
  { // bando camerale
    const d = DEADLINES.find((x) => x.id === "cciaa"), st = dlState(d);
    const elig = ["sicurezza", "backup", "software", "centralino", "ecommerce"], excl = ["sito", "pc"];
    const got = o.cosa.filter((c) => elig.includes(c));
    let status = "yes"; const why = [];
    if (st === "past") { status = "no"; why.push([false, "Il bando si è chiuso il 10 novembre 2026."]); }
    if (o.tipo === "prof") { status = "no"; why.push([false, "Solo imprese iscritte alla Camera di commercio."]); }
    if (o.size === "grande") { status = "no"; why.push([false, "Solo micro, piccole e medie imprese."]); }
    if (o.prov === "altro") { status = "no"; why.push([false, "Solo imprese con sede o unità locale a Grosseto o Livorno."]); }
    if (!got.length) { status = "no"; why.push([false, "Le voci scelte sono escluse: PC, telefoni e siti aziendali non rientrano."]); }
    else {
      if (!got.some((c) => c !== "ecommerce")) { if (status === "yes") status = "maybe"; why.push([false, "L’e-commerce rientra solo insieme a un’altra tecnologia."]); }
      else why.push([true, "Rientrano: " + catLabels(got) + "."]);
      if (got.includes("centralino")) why.push([null, "Il centralino in cloud va verificato sul regolamento."]);
      const ex = o.cosa.filter((c) => excl.includes(c));
      if (ex.length) why.push([false, "Esclusi: " + catLabels(ex) + "."]);
    }
    if (o.budget < 2000 && status !== "no") { status = "maybe"; why.push([false, "L’investimento minimo è di 2.000 €."]); }
    if (o.pay === "no" && status !== "no") { status = "no"; why.push([false, "Le spese vanno fatturate e pagate prima di presentare la domanda."]); }
    if (st !== "past" && status !== "no") why.push([true, `Domande entro il 10 novembre 2026 alle 23:59 (${dlBadge(d).txt}).`]);
    if (status !== "no") why.push([null, "Non si cumula con altri aiuti pubblici sulle stesse spese."]);
    res.push({ id: "cciaa", name: "Bando Doppia Transizione, Camera di commercio", status, amt: status === "no" ? 0 : Math.min(0.6 * o.budget, 5000), lab: "contributo fino a", why });
  }
  { // iperammortamento
    let status = "maybe"; const why = [];
    if (new Date() > new Date("2028-09-30T23:59:00")) { status = "no"; why.push([false, "Il periodo agevolato si è chiuso il 30 settembre 2028."]); }
    if (o.tipo === "prof" || o.forf) { status = "no"; why.push([false, "Serve reddito d’impresa: esclusi forfettari e professionisti."]); }
    if (status !== "no" && !o.cosa.some((c) => ["sicurezza", "software"].includes(c))) { status = "no"; why.push([false, "Vale per beni 4.0, come software di cybersecurity o di gestione della produzione."]); }
    let amt = 0, lab = "";
    if (status !== "no") {
      why.push([true, "Il costo si ammortizza con una maggiorazione del 180%, per investimenti fino al 30 settembre 2028."]);
      why.push([false, "Serve una comunicazione preventiva al GSE prima dell’acquisto, e una perizia."]);
      if (o.tipo === "soc") { amt = 0.24 * 1.8 * o.budget; lab = "risparmio fiscale stimato"; why.push([null, "Stima con IRES al 24%, distribuita negli anni di ammortamento."]); }
      else lab = "Il risparmio dipende dalla tua aliquota IRPEF.";
    }
    res.push({ id: "iper", name: "Iperammortamento", status, amt, lab, why });
  }
  return res;
}
function initIncentive(root) {
  const f = $("#inc-form", root), out = $("#inc-res", root);
  if (!f) return;
  let summary = "";
  const upd = () => {
    const o = { tipo: radioVal(f, "inc-tipo"), forf: $("#inc-forf", f).checked, size: radioVal(f, "inc-size"), prov: radioVal(f, "inc-prov"), cosa: checkedVals(f, "inc-cosa"), budget: rv(root, "inc-budget"), conn: radioVal(f, "inc-conn"), pay: radioVal(f, "inc-pay") || "si" };
    const res = incCalc(o);
    const stLab = { yes: "Puoi usarlo", maybe: "Da verificare", no: "Non adatto" };
    summary = `Trova incentivo: spesa ${euro(o.budget)} per ${catLabels(o.cosa) || "nessuna voce"}. ` + res.map((r) => `${r.name}: ${stLab[r.status].toLowerCase()}${r.amt ? " (" + euro(r.amt) + ")" : ""}`).join("; ") + ".";
    const best = res.filter((r) => r.status !== "no" && r.amt).sort((a, b) => b.amt - a.amt)[0];
    out.innerHTML = `<span class="eyebrow">Cosa puoi usare</span>
      ${best ? `<div><p>Il contributo più alto per la tua spesa</p><div class="big">${euro(best.amt)}</div><p>con ${best.name}</p></div>` : `<p>Con questi dati nessun incentivo copre la spesa. Cambia le voci o parliamone: spesso si trova una strada.</p>`}
      ${res.map((r) => `<article class="inc"><div class="inc__top"><h3>${r.name}</h3><span class="st st--${r.status}">${stLab[r.status]}</span></div>
        ${r.amt ? `<div><span class="small" style="color:var(--on-dark-2)">${r.lab}</span><div class="inc__amt">${euro(r.amt)}</div></div>` : r.lab ? `<p class="small">${r.lab}</p>` : ""}
        <ul>${r.why.map(([ok, txt]) => `<li class="${ok === false ? "no" : ""}">${ic(ok === false ? "alert" : ok ? "check" : "dot")}<span>${esc(txt)}</span></li>`).join("")}</ul></article>`).join("")}
      <p class="fine" style="color:var(--on-dark-2)">Stima indicativa basata sui regolamenti pubblicati: verifica sempre con il commercialista. <a href="#incentivi">Leggi la guida agli incentivi</a>.</p>
      <div class="row"><a class="btn btn--primary" href="#preventivo" data-go-notes>Prepariamo noi il piano di spesa</a></div>`;
  };
  f.addEventListener("change", upd);
  bindRange(root, "inc-budget", upd);
  out.addEventListener("click", (e) => { if (e.target.closest("[data-go-notes]")) { e.preventDefault(); goWith("preventivo", { notes: summary }); } });
  upd();
}

/* ---------- verifica dello spegnimento del rame ---------- */
function toolRame() {
  return `<div class="toolwrap" id="rame">
    <form class="panel" id="rame-form" aria-label="La tua linea">
      <fieldset class="field"><legend class="lbl">Che linea hai oggi?</legend><div class="seg seg--full">${RAME_LINES.map(([v, l], i) => segR("rame-line", v, l, v === "nonso")).join("")}</div></fieldset>
      <fieldset class="field"><legend class="lbl">Cosa è collegato alla linea telefonica?</legend><div class="chips">
        ${RAME_DEVICES.map(([v, i, l]) => `<label class="chip"><input type="checkbox" name="rame-dev" value="${v}"${v === "allarme" || v === "pos" ? " checked" : ""}><span>${ic(i)}${l}</span></label>`).join("")}
      </div></fieldset>
      <p class="fine">Se non sai che linea hai, guarda la bolletta o il modem: la parola «FTTH» indica la fibra fino in ufficio.</p>
    </form>
    <aside class="result" id="rame-res" aria-live="polite"></aside>
  </div>`;
}
function initRame(root) {
  const f = $("#rame-form", root), out = $("#rame-res", root);
  if (!f) return;
  let summary = "";
  const upd = () => {
    const line = radioVal(f, "rame-line"), devs = checkedVals(f, "rame-dev");
    let lv;
    if (!devs.length) lv = ["Basso", "good", line === "ftth" || line === "radio" ? "La tua linea è già sulle nuove reti e non hai apparati analogici da adattare." : "Non hai apparati analogici da adattare: il passaggio dovrebbe essere semplice."];
    else if (line === "ftth" || line === "radio") lv = ["Da verificare", "warn", "La linea è già nuova, ma gli apparati analogici collegati funzionano solo con un adattatore: vanno controllati."];
    else if (line === "fttc") lv = ["Medio", "warn", "Con la fibra misto rame la voce passa al digitale: gli apparati analogici vanno adattati o sostituiti."];
    else lv = ["Alto", "bad", line === "nonso" ? "Se non sai che linea hai, verifichiamola subito: gli apparati collegati potrebbero smettere di funzionare." : "La tua linea è tra quelle che verranno spente: gli apparati collegati vanno adattati prima del passaggio."];
    const lineLab = (RAME_LINES.find((x) => x[0] === line) || ["", ""])[1];
    const sel = RAME_DEVICES.filter((d) => devs.includes(d[0]));
    summary = `Verifica rame: linea «${lineLab}», apparati: ${sel.map((d) => d[2].toLowerCase()).join(", ") || "nessuno"}. Rischio ${lv[0].toLowerCase()}.`;
    out.innerHTML = `<span class="eyebrow">Il tuo rischio</span>
      <span class="level level--${lv[1]}">Rischio ${lv[0].toLowerCase()}</span>
      <p>${lv[2]}</p>
      ${sel.length ? `<ul class="risk">${sel.map((d) => `<li>${ic(d[1])}<span><b>${d[2]}</b>${d[3]}${d[4] ? ` ${linkFor(d[4])}` : ""}</span></li>`).join("")}</ul>` : ""}
      <div class="row"><a class="btn btn--primary" href="#check-up" data-go-notes>Verifica gratis linea e apparati</a></div>
      <p class="fine" style="color:var(--on-dark-2)">Entro il 2028 è previsto lo spegnimento di circa 6.800 centrali in rame.</p>`;
  };
  f.addEventListener("change", upd);
  out.addEventListener("click", (e) => { if (e.target.closest("[data-go-notes]")) { e.preventDefault(); goWith("check-up", { notes: summary, checkup: "linea" }); } });
  upd();
}

/* ---------- configuratore della formula ---------- */
const CFG_NEEDS = [["sede", "Interventi in sede inclusi"], ["backup", "Backup gestito"], ["remoto", "Lavoro da remoto"], ["tel", "Centralino gestito"], ["rete", "Rete, Wi-Fi e telecamere"], ["nis2", "Clienti che chiedono la NIS2"]];
function toolConfig() {
  return `<div class="toolwrap" id="cfg">
    <form class="panel" id="cfg-form" aria-label="La tua azienda">
      ${rangeField(["cfg-n", "Postazioni da seguire (PC e portatili)", 1, 60, 1, 6, ""])}
      <label class="check"><input type="checkbox" id="cfg-server" name="cfg-server"><span>Abbiamo un server o un NAS</span></label>
      <fieldset class="field"><legend class="lbl">Sedi</legend><div class="seg seg--full">${segR("cfg-sedi", "1", "Una sede", true)}${segR("cfg-sedi", "2", "Due o più sedi")}</div></fieldset>
      ${chips({ name: "cfg-needs", legend: "Cosa ti serve", items: CFG_NEEDS })}
    </form>
    <aside class="result" id="cfg-res" aria-live="polite"></aside>
  </div>`;
}
function initConfig(root) {
  const f = $("#cfg-form", root), out = $("#cfg-res", root);
  if (!f) return;
  let summary = "";
  const upd = () => {
    const n = rv(root, "cfg-n"), server = $("#cfg-server", f).checked, sedi = radioVal(f, "cfg-sedi"), needs = checkedVals(f, "cfg-needs");
    const toBiz = [], toFull = [];
    if (n > 5) toBiz.push(`${n} postazioni`);
    if (server) toBiz.push("un server o un NAS da seguire");
    if (needs.includes("sede")) toBiz.push("interventi in sede");
    if (needs.includes("backup")) toBiz.push("il backup gestito");
    if (needs.includes("remoto")) toBiz.push("il lavoro da remoto");
    if (sedi === "2") toFull.push("più sedi");
    if (needs.includes("tel")) toFull.push("il centralino gestito");
    if (needs.includes("rete")) toFull.push("rete, Wi-Fi e telecamere");
    if (needs.includes("nis2")) toFull.push("clienti che chiedono la NIS2");
    if (n > 30) toFull.push("più di 30 postazioni");
    const id = toFull.length ? "completa" : toBiz.length ? "business" : "essenziale";
    const why = toFull.length ? toFull : toBiz.length ? toBiz : ["un ufficio piccolo, senza server"];
    const plan = PLANS.find((p) => p.id === id);
    summary = `Configuratore: formula ${plan.name} consigliata (${n} postazioni${server ? ", server o NAS" : ""}${sedi === "2" ? ", più sedi" : ""}${needs.length ? ", " + needs.map((x) => CFG_NEEDS.find((y) => y[0] === x)[1].toLowerCase()).join(", ") : ""}).`;
    out.innerHTML = `<span class="eyebrow">La formula giusta per te</span>
      <div><div class="big">${plan.name}</div><p>Perché hai ${why.join(", ")}.</p></div>
      <ul class="prio prio--ok">${plan.inc.map((x) => `<li>${ic(x.startsWith("+") ? "plus" : "check")}<span>${esc(x.replace(/^\+/, ""))}</span></li>`).join("")}</ul>
      <div class="kv"><span>Canone indicativo</span><b>${t("[da definire]")} €/mese</b></div>
      <div class="row"><a class="btn btn--primary" href="#preventivo" data-go-notes>Richiedi la formula ${plan.name}</a></div>`;
    $$(".plan").forEach((p) => p.classList.toggle("plan--rec", p.dataset.plan === id));
  };
  f.addEventListener("change", upd);
  bindRange(root, "cfg-n", upd);
  out.addEventListener("click", (e) => { if (e.target.closest("[data-go-notes]")) { e.preventDefault(); goWith("preventivo", { notes: summary, prefill: ["assistenza-informatica"] }); } });
  upd();
}
