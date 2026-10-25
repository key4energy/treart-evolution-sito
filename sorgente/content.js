/* ================= CONTENUTI =================
   Testi dal documento «Contenuti dei servizi e approfondimenti».
   [testo] = segnaposto da completare; {{testo|nota}} = dato da confermare. */

const C = {
  tel: "0564 176 8249", telIntl: "+39 0564 176 8249", telHref: "tel:+3905641768249",
  wa: "3905641768249",
  facebook: "https://www.facebook.com/treartevolution/",
  instagram: "https://www.instagram.com/treart_evolution/",
  email: "info@treart-evolution.com",
  pec: "pec@pec.treart-evolution.com",
  addr1: "Via Aurelia Nord 76/1", addr2: "58100 Grosseto (GR)",
  hours: "Lun–ven 8:30–13:00 e 14:00–17:30",
  maps: "https://www.google.com/maps/search/?api=1&query=Via+Aurelia+Nord+76%2F1+58100+Grosseto",
  founded: 2015,
  piva: "01575220536", rea: "136469", cap: "€ 10.000,00",
  reply: "8 ore lavorative",
  site: "treart-evolution.com",
  // ID di misurazione di Google Analytics 4 (per esempio "G-ABC123XYZ"): finché è vuoto non si carica nulla e non compare il banner dei cookie
  ga: "",
  // scheda Google: voto e numero di recensioni (aggiornati al 25 ottobre 2026) e indirizzo per leggerle
  google: { rating: "4,8", count: 5, quote: "", author: "", url: "https://www.google.com/maps/search/?api=1&query=Treart%20Evolution&query_place_id=ChIJGQCWuPawKRMR8biuNijPz9s" },
};

const AREAS = [
  { id: "it", name: "Assistenza IT", icon: "monitor", ga: "it", line: "Il reparto IT esterno della tua azienda, da remoto e in sede.", status: "Monitoraggio attivo", services: ["assistenza-informatica", "installazioni"] },
  { id: "sec", name: "Sicurezza", icon: "shield", ga: "sec", line: "Dati, locali e accessi protetti prima che succeda qualcosa.", status: "Backup completato", services: ["cybersecurity", "backup", "vpn", "videosorveglianza"] },
  { id: "net", name: "Reti e connettività", icon: "wifi", ga: "net", line: "Internet stabile e Wi-Fi senza buchi, anche lontano dalla città.", status: "Tutto online", services: ["rete-wifi", "connettivita"] },
  { id: "tel", name: "Telefonia", icon: "phone", ga: "tel", line: "Il numero dell’ufficio ovunque tu sia, con costi più bassi.", status: "Centralino attivo", services: ["centralini-voip"] },
  { id: "web", name: "Web", icon: "globe", ga: "web", line: "Siti, email e hosting che portano clienti, non solo visite.", status: "Sito online", services: ["siti-web", "email-domini", "hosting"] },
];

/* Partner ufficiali dei produttori (confermati dall’assistenza tecnica Treart, ottobre 2026).
   «badge»: badge ufficiale scaricato dal portale partner del produttore, da salvare in
   public/img/partner/ (per esempio "img/partner/3cx-bronze-partner.png"); finché è vuoto
   il sito mostra nome e livello in testo. «levelNote»: livello ancora da confermare. */
const PARTNERS = [
  { id: "3cx", name: "3CX", level: "Bronze Partner", levelNote: "", badge: "", service: "centralini-voip", icon: "phone", area: "Centralini VoIP",
    line: "Progettiamo, installiamo e seguiamo centralini 3CX in cloud o in sede, come partner ufficiale del produttore.",
    gives: ["Licenze originali e rinnovi gestiti da noi, senza scadenze dimenticate", "Centralino configurato secondo gli standard 3CX, su misura per la tua organizzazione", "Aggiornamenti, modifiche e assistenza da tecnici certificati 3CX"] },
  { id: "watchguard", name: "WatchGuard", level: "Partner", levelNote: "", badge: "", service: "cybersecurity", icon: "shield", area: "Sicurezza della rete",
    line: "Proteggiamo la rete delle aziende con i firewall WatchGuard, configurati su misura e gestiti da noi ogni giorno.",
    gives: ["Firewall e licenze di sicurezza originali, rinnovate per tempo", "Configurazione cucita sulla tua rete, non lasciata alle impostazioni di fabbrica", "Aggiornamenti e controlli continui, con un referente che conosce i tuoi sistemi"] },
];

/* Le persone di Treart Evolution (ottobre 2026). Quando ci saranno le foto, si aggiungono con «foto» (slug di foto.json). */
const TEAM = [
  { name: "Fabio Di Cesare", role: "Amministratore" },
  { name: "Melissa Pericci", role: "Responsabile amministrativa" },
  { name: "Niccolò Maffei", role: "Responsabile reparto web" },
  { name: "Emanuele Crolli", role: "Responsabile assistenza tecnica e networking" },
];
/* La storia, dalla lettera di presentazione di Treart Evolution e dalle indicazioni di Fabio Di Cesare (ottobre 2026). */
const STORY = [
  "Treart Evolution nasce a Grosseto nel 2015, fondata da Fabio Di Cesare insieme all’amico e socio Luca Guelfi. Porta con sé l’esperienza di Treart Srl, attiva dal 2006: le competenze tecnologiche, una parte dei clienti e l’abitudine a seguire progetti di medie e grandi dimensioni.",
  "Negli anni abbiamo affiancato aziende, studi professionali, fondazioni e associazioni in tutta Italia, e collaboriamo con partner anche all’estero. I valori sono rimasti gli stessi: concretezza, creatività e attenzione alle novità, perché la tecnologia serve solo se fa lavorare meglio chi la usa.",
];

const INCENTIVE_NOTE = {
  voucher: "Questo servizio può rientrare nel Voucher Cloud & Cybersecurity del Ministero: contributo del 50% della spesa, fino a 20.000 €. Domande dal 10 novembre 2026, in ordine di arrivo.",
  cciaa: "Oppure nel Bando Doppia Transizione della Camera di commercio: 60% fino a 5.000 €, per imprese di Grosseto e Livorno. Le spese vanno pagate prima della domanda, entro il 10 novembre 2026.",
};

const SERVICES = {
  "assistenza-informatica": {
    area: "it", icon: "monitor", name: "Assistenza informatica aziendale", short: "Assistenza informatica", menu: "Help desk, monitoraggio e interventi in sede",
    title: "Il reparto IT della tua azienda, senza doverlo assumere.",
    sub: "Help desk, monitoraggio e interventi in sede per le aziende, da Grosseto in tutta Italia. Un referente che conosce i tuoi sistemi e li tiene in ordine prima che si rompano.",
    pains: ["«Quando si blocca un PC perdiamo mezza giornata a cercare qualcuno.»", "«Ogni fornitore dà la colpa a un altro.»", "«Non sappiamo quali computer sono aggiornati e quali no.»", "«Il collega bravo col computer fa il tecnico al posto del suo lavoro.»"],
    does: ["Help desk al telefono, su WhatsApp e da remoto, in orario d’ufficio", "Interventi in sede in tutta la provincia", "Monitoraggio continuo di PC, server e rete: gli avvisi arrivano a noi prima che a te", "Aggiornamenti di sicurezza e antivirus gestiti", "Inventario di computer, licenze e scadenze (garanzie, domini, certificati)", "Consulenza sugli acquisti: compri solo quello che serve"],
    steps: [["Check-up gratuito", "In un’ora fotografiamo PC, rete, backup e sicurezza."], ["Proposta chiara", "Canone mensile fisso e cosa include, nero su bianco."], ["Presa in carico", "Attiviamo il monitoraggio e mettiamo in ordine il pregresso."], ["Assistenza continua", "Un referente, un numero, un report ogni mese."]],
    why: [["users", "Un solo interlocutore", "Per PC, rete, telefoni, telecamere e sito."], ["pin", "In azienda quando serve", "Sede a Grosseto, interventi in tutta Italia."], ["gauge", "Prevenzione invece di emergenza", "Il monitoraggio intercetta i problemi prima del fermo."]],
    faq: [["Quanto costa?", "Dipende da postazioni e servizi. Dopo il check-up ricevi un canone mensile fisso, senza sorprese."], ["Lavorate anche da remoto?", "Sì: molti problemi si risolvono in pochi minuti da remoto, sempre con il tuo permesso. Per il resto veniamo in sede."], ["Possiamo tenere il nostro gestionale e i nostri fornitori?", "Sì. Ci coordiniamo noi con loro, così tu hai un solo numero da chiamare."], ["E se il «vostro» tecnico non c’è?", "I tuoi sistemi sono documentati: chiunque della squadra interviene sapendo già dove mettere le mani."]],
    cta: { label: "Prenota il check-up gratuito", to: "check-up", type: "it" },
    wa: "Ciao, vorrei un check-up gratuito dei computer della mia azienda.",
    seo: ["Assistenza informatica aziende Grosseto | Treart Evolution", "Help desk, monitoraggio e interventi in sede per le PMI di tutta Italia. Un referente unico e un canone fisso. Check-up gratuito."],
    flow: [["gauge", "Monitoraggio", "PC, server e rete sotto controllo"], ["bell", "Avviso", "arriva a noi prima che a te"], ["wrench", "Intervento", "da remoto in pochi minuti o in sede"], ["file", "Report mensile", "cosa abbiamo fatto, in parole semplici"]],
    notes: [{ icon: "shield", text: "Vuoi sapere a che punto è la tua azienda? Fai il test di sicurezza: 10 domande, 2 minuti.", to: "test-sicurezza", label: "Fai il test" }],
    guide: "ransomware", tool: "test-sicurezza", related: ["installazioni", "backup", "cybersecurity"],
  },
  "installazioni": {
    area: "it", icon: "laptop", name: "Installazioni e configurazioni", short: "Installazioni e configurazioni", menu: "PC, server e stampanti pronti al primo giorno",
    title: "PC, server e stampanti pronti dal primo minuto.",
    sub: "Prepariamo e configuriamo tutto in laboratorio e lo installiamo quando ti è più comodo, così l’ufficio non si ferma.",
    pains: ["«Il PC nuovo è arrivato, ma serve una settimana per farlo funzionare come il vecchio.»", "«La stampante di rete sparisce ogni lunedì.»", "«Il server ha dieci anni e nessuno osa toccarlo.»"],
    does: ["PC e portatili già pronti: programmi, posta, stampanti e accessi", "Trasferimento dei dati dal vecchio computer, verificato prima di spegnerlo", "Server e NAS: cartelle condivise e permessi per reparto", "Stampanti e multifunzione di rete configurate per tutti", "Sostituzione dei sistemi che non ricevono più aggiornamenti di sicurezza", "Documentazione finale: cosa c’è, dove sta, chi può accedere"],
    steps: [["Elenco", "Cosa serve a ogni persona."], ["Preparazione in laboratorio", "Arriva tutto già configurato."], ["Installazione in sede", "Nel momento meno disturbante."], ["Verifica e consegna", "Controlliamo insieme e ti lasciamo la documentazione."]],
    why: [["box", "Arriva tutto pronto", "Nessuna giornata persa a configurare."], ["clock", "Quando conviene a te", "Organizziamo il passaggio anche fuori orario, con condizioni da concordare insieme."], ["file", "Documentazione chiara", "La tua azienda resta padrona dei suoi sistemi."]],
    faq: [["Fornite anche l’hardware?", "Sì: ti consigliamo e forniamo il più adatto, oppure configuriamo quello che hai già comprato."], ["Si perdono i dati nel passaggio?", "No: li copiamo e li verifichiamo prima di spegnere il vecchio computer."], ["Quanto tempo serve?", "Per un PC poche ore. Per un ufficio intero organizziamo il passaggio in una giornata."]],
    cta: { label: "Richiedi un preventivo per il tuo ufficio", to: "preventivo" },
    wa: "Ciao, devo installare nuovi PC in azienda.",
    seo: ["Installazione PC e server per aziende a Grosseto | Treart Evolution", "PC, server, NAS e stampanti configurati senza fermare l’ufficio. Trasferimento dati e documentazione inclusi."],
    flow: [["clipboard", "Elenco", "programmi e accessi di ogni persona"], ["box", "Laboratorio", "tutto preparato e provato prima"], ["plug", "Installazione", "quando ti è più comodo"], ["check-circle", "Consegna", "verifica e documentazione"]],
    notes: [{ icon: "alert", text: "Hai ancora PC con Windows 10? Dal 14 ottobre 2025 non ricevono più aggiornamenti di sicurezza gratuiti: li aggiorniamo o li sostituiamo senza fermarti.", to: "preventivo", label: "Chiedi un preventivo" }],
    guide: "ransomware", tool: "costo-fermo", related: ["assistenza-informatica", "backup", "rete-wifi"],
  },
  "cybersecurity": {
    area: "sec", icon: "shield", name: "Cybersecurity", short: "Cybersecurity", menu: "Firewall, protezione dei PC e della posta",
    title: "Proteggi dati, clienti e reputazione. Senza pensieri.",
    sub: "Firewall, protezione dei computer e della posta, monitoraggio e formazione: una difesa su misura per la tua azienda, gestita da noi ogni giorno.",
    pains: ["«Abbiamo l’antivirus, quindi siamo tranquilli.»", "«Ci arrivano email di fornitori che chiedono di cambiare l’IBAN.»", "«Un nostro cliente grande ci ha chiesto come gestiamo la sicurezza.»", "«Se domani ci bloccano i file, non sappiamo da dove ripartire.»"],
    does: ["Analisi dei rischi: dove la tua azienda è scoperta, spiegato in parole semplici", "Firewall WatchGuard gestito: la porta d’ingresso della rete, sorvegliata e aggiornata", "Protezione avanzata dei computer (EDR): riconosce i comportamenti sospetti, non solo i virus noti", "Protezione della posta da truffe, allegati e link pericolosi", "Accessi sicuri: password robuste e doppia verifica sugli account importanti", "Formazione del personale con simulazioni di email truffa", "Supporto per le richieste di sicurezza dei clienti e per la NIS2"],
    stat: { n: "507", text: "attacchi informatici gravi in Italia nel 2025: il 42% in più dell’anno prima e il 9,6% di tutti quelli registrati nel mondo.", src: ["Rapporto Clusit 2026", "https://www.01net.it/rapporto-clusit-2026-cybersecurity-ai-ransomware/"] },
    steps: [["Check-up di sicurezza gratuito", "Un rapporto chiaro su cosa sistemare prima."], ["Piano di intervento", "In ordine di priorità e di costo."], ["Attivazione delle protezioni", "Senza fermare il lavoro."], ["Monitoraggio continuo", "Aggiornamenti e un rapporto periodico."]],
    why: [["network", "Sicurezza integrata", "Con rete, backup e PC che già gestiamo: nessuna falla tra un fornitore e l’altro."], ["chat", "Linguaggio chiaro", "Sai sempre cosa stai comprando e perché."], ["file", "Pronti per la NIS2", "Per i requisiti che le aziende grandi chiedono ai loro fornitori."]],
    faq: [["Siamo piccoli, a chi interessiamo?", "Molti attacchi colpiscono a caso migliaia di aziende insieme: i piccoli sono i più esposti perché meno protetti."], ["L’antivirus non basta?", "Non più: le truffe via email e i furti di password passano dove l’antivirus non guarda."], ["Cos’è la NIS2 e ci riguarda?", "È la direttiva europea sulla sicurezza informatica. Anche se non sei obbligato, lo sono molti tuoi clienti, che chiederanno garanzie a chi li fornisce."], ["Quanto costa?", "Dipende da quanti PC e servizi proteggere. Dopo il check-up ricevi un canone chiaro."]],
    cta: { label: "Fai il check-up di sicurezza gratuito", to: "check-up", type: "sicurezza" },
    wa: "Ciao, vorrei sapere quanto è protetta la mia azienda.",
    seo: ["Sicurezza informatica per aziende a Grosseto | Treart Evolution", "Firewall WatchGuard, protezione dei PC e della posta, formazione e supporto NIS2 per le PMI di tutta Italia. Check-up di sicurezza gratuito."],
    flow: [["mail", "Posta e web", "filtri contro truffe e link pericolosi"], ["shield", "Firewall gestito", "la porta della rete, sorvegliata"], ["monitor", "Protezione dei PC", "riconosce i comportamenti sospetti"], ["users", "Persone", "formazione e doppia verifica"]],
    notes: [{ icon: "file", text: "NIS2: le aziende obbligate stanno chiedendo garanzie di sicurezza ai fornitori. Arriva preparato.", to: "nis2", label: "Leggi la guida" }],
    incentives: ["voucher", "cciaa"],
    guide: "nis2", tool: "test-sicurezza", related: ["backup", "vpn", "email-domini"],
  },
  "backup": {
    area: "sec", icon: "database", name: "Backup e ripristino", short: "Backup e ripristino", menu: "NAS e copia esterna, ripristino provato",
    title: "I tuoi dati sempre recuperabili. Anche dopo il giorno peggiore.",
    sub: "Backup automatici in sede e fuori sede, controllati ogni giorno e provati davvero. Perché un backup vale solo se si riesce a ripristinarlo.",
    pains: ["«Il backup lo fa un collega su un disco esterno, quando se ne ricorda.»", "«Non abbiamo mai provato a recuperare i file.»", "«Se si rompe il server perdiamo anni di lavoro.»"],
    does: ["Backup automatico di PC, server, posta e gestionale", "Regola 3-2-1: tre copie, su due supporti diversi, una fuori dall’azienda", "Copia protetta che un virus non può cancellare né criptare", "Controllo quotidiano: se un backup fallisce, lo sappiamo noi per primi", "Prova di ripristino programmata, con verbale", "Piano di ripartenza: cosa si recupera per primo e in quanto tempo"],
    steps: [["Mappa dei dati", "Quali sono importanti e dove si trovano."], ["Progetto su misura", "NAS in sede e copia esterna."], ["Prima copia completa", "Attivata e verificata."], ["Controllo continuo", "Ogni giorno, con prove di ripristino regolari."]],
    why: [["refresh", "Dati che tornano indietro", "Non vendiamo un disco: garantiamo il ripristino, e lo dimostriamo."], ["cloud", "Una copia sempre fuori", "Furti, incendi e allagamenti non cancellano il lavoro."], ["users", "Un solo responsabile", "Backup integrato con sicurezza e assistenza."]],
    faq: [["Abbiamo già un disco esterno, non basta?", "Se è sempre collegato, un virus lo cripta insieme al resto. Serve una copia separata e protetta."], ["Il cloud è sicuro?", "Sì, se è usato come seconda copia, cifrata e con accessi controllati."], ["Quanto tempo serve per ripartire?", "Lo definiamo insieme prima, in base ai dati: è la parte più importante del progetto."]],
    cta: { label: "Verifica gratis il tuo backup", to: "check-up", type: "sicurezza" },
    wa: "Ciao, vorrei controllare se il nostro backup funziona davvero.",
    seo: ["Backup aziendale e ripristino dati a Grosseto | Treart Evolution", "Backup automatico in sede e fuori sede, protetto dai ransomware e provato con ripristini reali. Verifica gratuita."],
    flow: [["server", "PC, server e posta", "copiati in automatico"], ["database", "NAS in sede", "per ripristinare in fretta"], ["cloud", "Copia fuori sede", "protetta da modifiche e virus"], ["refresh", "Prova di ripristino", "periodica, con verbale"]],
    notes: [{ icon: "euro", text: "Quanto ti costa un giorno con computer e gestionale fermi? Calcolalo in un minuto.", to: "costo-fermo", label: "Calcola" }],
    incentives: ["voucher", "cciaa"],
    guide: "ransomware", tool: "costo-fermo", related: ["cybersecurity", "assistenza-informatica", "hosting"],
  },
  "vpn": {
    area: "sec", icon: "lock", name: "VPN e lavoro da remoto", short: "VPN e lavoro da remoto", menu: "Accesso sicuro da casa e tra le sedi",
    title: "Lavora ovunque come se fossi in ufficio. In sicurezza.",
    sub: "Accesso protetto a file, gestionale e telefono aziendale da casa, dal cantiere o in viaggio. E sedi collegate tra loro come se fossero una sola.",
    pains: ["«Da casa non riusciamo ad aprire il gestionale.»", "«Ci passiamo i file su chiavette e app personali.»", "«Le due sedi non vedono le stesse cartelle.»"],
    does: ["VPN aziendale con accesso solo per chi ne ha bisogno", "Doppia verifica dell’identità a ogni accesso", "Collegamento sicuro tra sedi, magazzini e cantieri", "Accesso al gestionale e alle cartelle condivise da PC e portatili", "Regole chiare: chi può vedere cosa, e da dove"],
    steps: [["Chi lavora fuori sede", "Verifichiamo chi e di cosa ha bisogno."], ["Firewall e accessi", "Configurati persona per persona."], ["Installazione e prova", "Sui dispositivi, insieme a te."], ["Gestione nel tempo", "Nuovi utenti, uscite e modifiche."]],
    why: [["key", "Un accesso solo", "Semplice da usare: niente programmi diversi per ogni servizio."], ["shield", "Sicurezza vera", "La VPN è progettata insieme al firewall, non aggiunta dopo."], ["headset", "Assistenza ovunque", "Anche per chi lavora fuori sede."]],
    faq: [["Rallenta il lavoro?", "Con una connessione adeguata no. La verifichiamo nel sopralluogo."], ["Possiamo togliere l’accesso a chi lascia l’azienda?", "Sì, in un minuto e in modo definitivo."], ["Serve anche per il telefono?", "Con il centralino VoIP l’app sul cellulare funziona già ovunque, in modo protetto."]],
    cta: { label: "Richiedi un preventivo per il lavoro da remoto", to: "preventivo" },
    wa: "Ciao, vorrei far lavorare i miei collaboratori da remoto in sicurezza.",
    seo: ["VPN aziendale e smart working sicuro a Grosseto | Treart Evolution", "Accesso protetto a file e gestionale da casa e dai cantieri, sedi collegate in sicurezza. Configurazione e assistenza."],
    flow: [["home", "Casa, cantiere, viaggio", "dal PC o dal portatile"], ["key", "Doppia verifica", "entra solo chi è autorizzato"], ["lock", "Collegamento cifrato", "attraverso il firewall aziendale"], ["folder", "Gestionale e cartelle", "come se fossi in ufficio"]],
    notes: [],
    incentives: ["voucher", "cciaa"],
    guide: "incentivi", tool: "trova-incentivo", related: ["cybersecurity", "centralini-voip", "connettivita"],
  },
  "videosorveglianza": {
    area: "sec", icon: "camera", name: "Videosorveglianza e controllo accessi", short: "Videosorveglianza e accessi", menu: "Telecamere e controllo dallo smartphone",
    title: "La tua azienda sotto controllo, dallo smartphone, giorno e notte.",
    sub: "Telecamere ad alta definizione, registrazione protetta e avvisi intelligenti. Progettate, installate e gestite nel rispetto della privacy e delle regole sul lavoro.",
    pains: ["«Abbiamo avuto un furto e le immagini erano inutilizzabili.»", "«Di notte non sappiamo cosa succede in cantiere o in magazzino.»", "«Le chiavi girano tra troppe persone.»"],
    does: ["Progetto della copertura: quali punti riprendere e con quale qualità", "Telecamere giorno e notte, anche per esterni e grandi aree", "Visione da smartphone e avvisi su movimenti sospetti", "Registrazione protetta, conservata per i tempi previsti dalla legge", "Controllo accessi con badge, codici o smartphone, con registro degli ingressi", "Supporto per cartelli, informative e, se ci sono dipendenti, per l’accordo sindacale o l’autorizzazione dell’Ispettorato del lavoro"],
    steps: [["Sopralluogo e progetto", "Con le inquadrature proposte."], ["Preventivo chiaro", "E indicazioni sugli adempimenti privacy."], ["Installazione", "E configurazione dell’app."], ["Assistenza", "E manutenzione nel tempo."]],
    why: [["network", "Protette come un computer", "Telecamere integrate nella rete aziendale: non diventano una porta d’ingresso per gli hacker."], ["eye", "Progettate per riconoscere", "Persone e targhe, non solo per «vedere qualcosa»."], ["file", "Adempimenti seguiti", "Così l’impianto è utilizzabile quando serve."]],
    faq: [["Posso vedere le telecamere dal telefono?", "Sì, in diretta e in registrazione, con accesso protetto."], ["Ho dei dipendenti: cosa devo fare?", "Le telecamere che possono riprenderli richiedono un accordo sindacale o l’autorizzazione dell’Ispettorato del lavoro. Ti accompagniamo nella pratica."], ["Funziona anche dove la connessione è debole?", "Sì: registra in loco e, se serve, portiamo la connessione con radio o satellite."]],
    cta: { label: "Prenota il sopralluogo gratuito", to: "check-up", type: "video" },
    wa: "Ciao, vorrei un sopralluogo per la videosorveglianza.",
    seo: ["Videosorveglianza per aziende a Grosseto | Treart Evolution", "Telecamere professionali, controllo da smartphone e controllo accessi per aziende, negozi e cantieri in tutta Italia. Sopralluogo gratuito."],
    flow: [["camera", "Telecamere", "giorno e notte, anche all’esterno"], ["server", "Registratore protetto", "su una rete separata"], ["smartphone", "App sullo smartphone", "diretta, registrazioni e avvisi"], ["file", "Regole rispettate", "cartelli, informativa, accordi"]],
    notes: [{ icon: "eye", text: "Le telecamere servono solo se le immagini si possono usare: le regole da rispettare, in breve.", to: "telecamere-regole", label: "Leggi la guida" }],
    guide: "telecamere-regole", tool: "test-sicurezza", related: ["rete-wifi", "connettivita", "cybersecurity"],
  },
  "rete-wifi": {
    area: "net", icon: "wifi", name: "Rete aziendale e Wi-Fi", short: "Rete aziendale e Wi-Fi", menu: "Copertura completa, anche in hotel e capannoni",
    title: "Wi-Fi senza buchi, dalla reception all’ultimo capannone.",
    sub: "Progettiamo la rete partendo da come la usi: copertura misurata stanza per stanza, rete ospiti separata e gestione centralizzata.",
    pains: ["«In alcune camere il Wi-Fi non arriva e gli ospiti lo scrivono nelle recensioni.»", "«Abbiamo aggiunto ripetitori su ripetitori e va peggio di prima.»", "«I clienti si collegano alla stessa rete dei nostri computer.»", "«Il magazzino è una zona morta: i terminali perdono il segnale.»"],
    does: ["Sopralluogo con misura della copertura e progetto dei punti di accesso", "Access point professionali di ultima generazione, gestiti da un’unica piattaforma", "Reti separate per dipendenti, ospiti, telecamere e telefoni", "Accesso ospiti con pagina di benvenuto e limiti di banda", "Cablaggio strutturato, armadi di rete ordinati ed etichettati", "Collegamenti senza fili tra edifici vicini (ponti radio)", "Monitoraggio: se un apparato si spegne, lo sappiamo subito"],
    steps: [["Sopralluogo", "E misura del segnale esistente."], ["Progetto", "Con la mappa dei punti di accesso e il preventivo."], ["Installazione", "Possibilmente in bassa stagione o fuori orario."], ["Verifica finale", "Della copertura, poi assistenza continua."]],
    why: [["gauge", "Misuriamo, non andiamo a occhio", "Ogni punto di accesso ha una ragione."], ["network", "Tutto pensato insieme", "Rete, sicurezza, telefoni e telecamere."], ["bed", "Esperienza sul campo", "Strutture ricettive, capannoni e aziende agricole."]],
    faq: [["Perché i ripetitori non bastano?", "Dividono la velocità e si disturbano tra loro. Una rete progettata usa punti di accesso collegati via cavo e coordinati."], ["Possiamo dare il Wi-Fi ai clienti in sicurezza?", "Sì, con una rete ospiti separata che non vede mai i tuoi computer."], ["Bisogna rompere i muri?", "Quasi mai: dove il cavo è difficile usiamo canaline discrete o collegamenti radio."]],
    cta: { label: "Prenota la misura gratuita del tuo Wi-Fi", to: "check-up", type: "wifi" },
    wa: "Ciao, il Wi-Fi in azienda non copre tutto. Possiamo fissare un sopralluogo?",
    seo: ["Wi-Fi e rete aziendale per hotel e aziende a Grosseto | Treart Evolution", "Copertura Wi-Fi progettata e misurata per hotel, agriturismi, uffici e capannoni in tutta Italia. Rete ospiti separata e gestione centralizzata."],
    flow: [["globe", "Linea Internet", "fibra, radio o satellite"], ["shield", "Firewall", "controlla cosa entra ed esce"], ["network", "Switch e cavi", "armadio ordinato ed etichettato"], ["wifi", "Access point", "reti separate per ospiti, staff e telecamere"]],
    notes: [{ icon: "bed", text: "Hotel e agriturismi: i lavori sulla rete si fanno in bassa stagione. È il momento di programmarli.", to: "wifi-hotel", label: "Leggi la guida" }],
    incentives: ["voucher"],
    guide: "wifi-hotel", tool: "test-sicurezza", related: ["connettivita", "videosorveglianza", "centralini-voip"],
  },
  "connettivita": {
    area: "net", icon: "antenna", name: "Connettività Internet", short: "Connettività Internet", menu: "Fibra, radio e satellite, anche in campagna",
    title: "Internet veloce e stabile, anche dove la fibra non arriva.",
    sub: "Fibra, connessione radio o satellitare: scegliamo la tecnologia giusta per la tua sede e aggiungiamo una linea di riserva, così non resti mai fermo.",
    pains: ["«In campagna abbiamo una connessione lentissima.»", "«Quando cade Internet si ferma tutto: casse, telefoni, gestionale.»", "«Paghiamo una linea che non mantiene mai la velocità promessa.»"],
    does: ["Analisi delle tecnologie disponibili all’indirizzo della tua sede", "Fibra, collegamenti radio e satellitari con operatori partner (Fastweb, Eolo, Starlink per le imprese)", "Linea di riserva che entra in funzione da sola se la principale cade", "Router e firewall configurati e gestiti da noi", "Gestione dei rapporti con l’operatore: i guasti li segnaliamo e seguiamo noi"],
    steps: [["Verifica della copertura", "All’indirizzo reale, non solo sulla mappa."], ["Proposta", "Con una o due tecnologie e i costi a confronto."], ["Attivazione", "Configurazione coordinata con l’operatore."], ["Monitoraggio", "Della linea, e assistenza."]],
    why: [["antenna", "Liberi dagli operatori", "Proponiamo la soluzione che funziona meglio da te."], ["phone", "Un solo referente", "Anche per i guasti di linea."], ["network", "Pensata con il resto", "Connessione progettata insieme a rete, telefoni e telecamere."]],
    faq: [["Il satellite è affidabile per un’azienda?", "Sì, nelle zone senza fibra è spesso la scelta migliore, anche come linea di riserva."], ["Cosa succede se la linea cade?", "Con la doppia linea il passaggio è automatico: telefoni e casse continuano a funzionare."], ["Posso tenere il mio operatore?", "Sì: valutiamo la linea attuale e interveniamo solo dove serve."]],
    cta: { label: "Verifica gratis la copertura della tua sede", to: "check-up", type: "linea" },
    wa: "Ciao, vorrei sapere che connessione posso avere all’indirizzo della mia azienda.",
    seo: ["Internet per aziende: fibra, radio e satellite | Treart Evolution", "Connessioni per aziende anche in zone rurali, con linea di riserva automatica. Verifica gratuita della copertura all’indirizzo della tua azienda."],
    flow: [["globe", "Linea principale", "fibra o radio"], ["satellite", "Linea di riserva", "satellite o rete mobile"], ["router", "Router con doppia linea", "passa da solo alla riserva"], ["building", "Azienda sempre online", "casse, telefoni, gestionale"]],
    notes: [{ icon: "euro", text: "Per chiedere il Voucher Cloud & Cybersecurity serve una connessione di almeno 30 Mbps in download. Verifichiamo la tua.", to: "incentivi", label: "Scopri il voucher" }],
    guide: "spegnimento-rame", tool: "verifica-rame", related: ["rete-wifi", "centralini-voip", "vpn"],
  },
  "centralini-voip": {
    area: "tel", icon: "phone", name: "Centralini VoIP", short: "Centralini VoIP", menu: "Il numero dell’ufficio sul tuo smartphone",
    title: "Il numero dell’ufficio sul tuo smartphone. Ovunque tu sia.",
    sub: "Centralini VoIP professionali installati e gestiti da noi: chiamate smistate al posto giusto, nessun cliente perso, costi più bassi delle linee tradizionali.",
    pains: ["«I clienti chiamano e il telefono squilla a vuoto.»", "«Quando sono fuori ufficio perdo le chiamate.»", "«Il vecchio centralino si guasta e nessuno lo ripara più.»", "«La bolletta del telefono è sempre troppo alta.»"],
    does: ["Analisi delle linee, dei numeri e di come arrivano le chiamate", "Centralino 3CX in cloud o in sede, su misura per la tua organizzazione", "Portabilità dei numeri che hai già: i clienti continuano a chiamarti come prima", "App per smartphone e computer: chiami e ricevi con il numero aziendale", "Risponditore automatico, code di attesa e orari di apertura", "Messaggi vocali via email e inoltro automatico sui cellulari", "Telefoni da scrivania configurati, formazione e assistenza", "Verifica di allarmi, POS e fax collegati alla vecchia linea"],
    steps: [["Sopralluogo", "Verifica della linea e degli apparati collegati."], ["Progetto", "Interni, smistamento e messaggi pensati sul tuo modo di lavorare."], ["Attivazione", "Con portabilità dei numeri, senza interrompere il servizio."], ["Assistenza e modifiche", "Quando servono: nuovi colleghi, orari, ferie."]],
    why: [["users", "Un solo referente", "Centralino, linea Internet e rete: se qualcosa non va, sai chi chiamare."], ["wrench", "Su misura", "Configurazione pensata per te, non un pacchetto uguale per tutti."], ["phone", "Linee professionali", "Linee VoIP professionali di VoipVoice e Messagenet."]],
    faq: [["Posso tenere il mio numero?", "Sì, con la portabilità il numero passa sul nuovo centralino."], ["Serve la fibra?", "Serve una connessione stabile. La verifichiamo e, se non basta, proponiamo fibra, radio o satellite."], ["Cosa succede se manca Internet o la corrente?", "Le chiamate si deviano in automatico sui cellulari; per gli apparati in ufficio consigliamo un gruppo di continuità."], ["Quanto costa?", "Dipende da utenti, linee e funzioni. Dopo il sopralluogo ricevi canone e costi una tantum separati."]],
    cta: { label: "Verifica gratis linea e centralino", to: "check-up", type: "linea" },
    wa: "Ciao, vorrei informazioni su un centralino VoIP per la mia azienda.",
    seo: ["Centralino VoIP per aziende a Grosseto | Treart Evolution", "Centralini 3CX in cloud o in sede da partner ufficiale, numero aziendale sullo smartphone e portabilità dei numeri. Pronti per lo spegnimento del rame."],
    flow: [["phone", "Il cliente chiama", "il tuo numero di sempre"], ["server", "Centralino", "risponditore, code e orari"], ["smartphone", "Risponde chi è libero", "in ufficio o sullo smartphone"], ["mail", "Nessuna chiamata persa", "messaggi vocali via email"]],
    notes: [{ icon: "alert", text: "Entro il 2028 si spengono circa 6.800 centrali in rame: centralini, allarmi e POS analogici vanno verificati.", to: "verifica-rame", label: "Fai la verifica" }],
    incentives: ["voucher"],
    guide: "spegnimento-rame", tool: "verifica-rame", related: ["connettivita", "vpn", "rete-wifi"],
  },
  "siti-web": {
    area: "web", icon: "globe", name: "Siti web ed e-commerce", short: "Siti web ed e-commerce", menu: "Siti veloci che portano richieste",
    title: "Un sito che ti porta richieste, non solo visite.",
    sub: "Siti e negozi online veloci, facili da usare da smartphone, trovabili su Google e accessibili a tutti. Pensati per far contattare la tua azienda in un clic.",
    pains: ["«Il sito è vecchio e ci vergogniamo a darlo ai clienti.»", "«Su Google ci trovano solo se scrivono il nostro nome.»", "«Dal telefono il sito non si legge.»", "«Nessuno ci contatta mai dal sito.»"],
    does: ["Progetto dei contenuti: cosa dire, a chi, per far chiamare", "Grafica su misura, coerente con il tuo marchio", "Siti veloci e perfetti da smartphone", "Pulsanti di contatto ovunque: telefono, WhatsApp, preventivo", "Ottimizzazione per Google e per la ricerca locale", "E-commerce con pagamenti sicuri e gestione semplice dei prodotti", "Accessibilità secondo le regole europee, con dichiarazione pubblicata", "Misurazione delle richieste: sai quante arrivano e da dove"],
    steps: [["Incontro", "Obiettivi, clienti, concorrenti."], ["Struttura e testi", "Che approvi prima della grafica."], ["Grafica e sviluppo", "Con una versione di prova da vedere."], ["Pubblicazione", "Formazione e assistenza; aggiornamenti e sicurezza inclusi."]],
    why: [["cursor", "Costruito per vendere", "Ogni pagina ha uno scopo e un invito all’azione."], ["users", "Un solo referente", "Sito, dominio, posta e hosting: niente rimpalli."], ["key", "Ti lasciamo autonomo", "Aggiorni testi e foto da solo, quando vuoi."]],
    faq: [["Quanto tempo serve?", "Un sito aziendale di solito poche settimane; un e-commerce dipende dal numero di prodotti. Lo definiamo nel preventivo."], ["Posso modificarlo da solo?", "Sì, ti formiamo e restiamo a disposizione per tutto il resto."], ["L’accessibilità mi riguarda?", "Se vendi online e non sei una microimpresa, sì. In ogni caso un sito accessibile è più facile per tutti e piace anche a Google."]],
    cta: { label: "Richiedi un’analisi gratuita del tuo sito", to: "check-up", type: "sito" },
    wa: "Ciao, vorrei rifare il sito della mia azienda.",
    seo: ["Realizzazione siti web ed e-commerce a Grosseto | Treart Evolution", "Siti veloci, trovabili su Google e accessibili, pensati per portare richieste. E-commerce, SEO locale e assistenza in tutta Italia."],
    flow: [["search", "Ricerca su Google", "chi cerca il tuo servizio in zona"], ["monitor", "Pagina chiara", "risposte, prove, contatti"], ["cursor", "Contatto in un clic", "telefono, WhatsApp, modulo"], ["chart", "Richieste misurate", "sai quante arrivano e da dove"]],
    notes: [{ icon: "eye", text: "Vendi online? Dal 28 giugno 2025 gli e-commerce di molte imprese devono essere accessibili, con sanzioni fino a 40.000 €.", to: "accessibilita", label: "Leggi la guida" }],
    incentives: ["voucher"],
    guide: "accessibilita", tool: "trova-incentivo", related: ["email-domini", "hosting", "cybersecurity"],
  },
  "email-domini": {
    area: "web", icon: "at", name: "Domini e mail professionali", short: "Domini e mail professionali", menu: "Email credibili con il tuo nome",
    title: "Email con il nome della tua azienda. Credibili e protette.",
    sub: "Registriamo il dominio, configuriamo le caselle e le proteggiamo, così i tuoi messaggi arrivano a destinazione e nessuno può spacciarsi per te.",
    pains: ["«Usiamo ancora un indirizzo Gmail o Libero per lavoro.»", "«Le nostre email finiscono nello spam dei clienti.»", "«Qualcuno ha mandato email false a nome nostro.»"],
    does: ["Registrazione e rinnovo del dominio, intestato alla tua azienda", "Caselle di posta professionali per tutto il personale, su PC e smartphone", "Configurazione anti-falsificazione (SPF, DKIM e DMARC)", "Trasferimento delle vecchie email senza perdere nulla", "Protezione da spam, virus e truffe", "PEC e firme email coordinate con l’immagine aziendale"],
    steps: [["Verifica", "Controlliamo dominio e posta attuali."], ["Configurazione", "Caselle, timbri anti-falsificazione e filtri."], ["Trasferimento", "Spostiamo le vecchie email senza perdite."], ["Assistenza", "Nuove caselle e modifiche quando servono."]],
    why: [["key", "Il dominio resta tuo", "Niente sorprese se un giorno cambi fornitore."], ["inbox", "Posta che arriva", "Configurata per finire in posta, non nello spam."], ["users", "Un solo referente", "Per dominio, posta, sito e sicurezza."]],
    faq: [["Perdo le vecchie email nel passaggio?", "No, le trasferiamo tutte."], ["Cosa sono SPF, DKIM e DMARC?", "Sono i «timbri» che provano che un’email viene davvero da te."]],
    cta: { label: "Verifica gratis la tua posta", to: "check-up", type: "posta" },
    wa: "Ciao, vorrei email professionali per la mia azienda.",
    seo: ["Email aziendali con dominio e PEC a Grosseto | Treart Evolution", "Caselle professionali con il tuo dominio, protette da spam e falsificazioni. Trasferimento delle vecchie email incluso."],
    flow: [["at", "La tua email", "con il dominio della tua azienda"], ["stamp", "Timbri SPF, DKIM e DMARC", "provano che sei davvero tu"], ["inbox", "Casella del cliente", "arriva in posta, non nello spam"]],
    notes: [{ icon: "mail", text: "Le email truffa scritte con l’intelligenza artificiale sono sempre più credibili: come riconoscerle.", to: "email-truffa", label: "Leggi la guida" }],
    guide: "email-truffa", tool: "test-sicurezza", related: ["siti-web", "cybersecurity", "hosting"],
  },
  "hosting": {
    area: "web", icon: "server", name: "Hosting", short: "Hosting", menu: "WordPress ed e-commerce sempre online",
    title: "Il tuo sito sempre online, veloce e al sicuro.",
    sub: "Ospitiamo e curiamo siti WordPress ed e-commerce: aggiornamenti, backup, certificato di sicurezza e controllo continuo, senza che tu debba pensarci.",
    pains: ["«Il sito ogni tanto non si apre e ce lo dicono i clienti.»", "«Nessuno aggiorna i plugin da anni.»", "«Non sappiamo dove sia il backup del sito.»"],
    does: ["Hosting professionale per WordPress ed e-commerce", "Aggiornamenti di sicurezza di sito, tema e plugin", "Backup quotidiani e ripristino rapido", "Certificato HTTPS e protezione dagli attacchi", "Controllo che il sito sia online, con avviso immediato se si ferma", "Piccole modifiche di testi e immagini incluse; quelle più impegnative si quotano a parte, prima di iniziare"],
    steps: [["Analisi", "Controlliamo il sito e dove si trova oggi."], ["Messa in sicurezza", "Aggiornamenti, certificato e protezioni."], ["Trasferimento", "Spostiamo il sito senza interruzioni."], ["Cura continua", "Backup, controlli e piccole modifiche."]],
    why: [["wrench", "Curato da chi lo conosce", "Il sito è seguito da chi lo ha costruito, o da chi lo conosce davvero."], ["shield", "Prevenzione", "Aggiorniamo prima che una falla diventi un problema."], ["euro", "Un canone chiaro", "Senza costi a sorpresa."]],
    faq: [["Posso portare da voi un sito fatto da altri?", "Sì: lo analizziamo, lo mettiamo in sicurezza e lo spostiamo senza interruzioni."], ["Cosa succede se il sito viene attaccato?", "Lo ripristiniamo dal backup e chiudiamo la falla."]],
    cta: { label: "Fai il check-up gratuito del tuo sito", to: "check-up", type: "sito" },
    wa: "Ciao, vorrei far gestire a voi il nostro sito.",
    seo: ["Hosting e manutenzione siti WordPress | Treart Evolution", "Hosting gestito con aggiornamenti, backup quotidiani e monitoraggio. Il tuo sito sempre online e sicuro."],
    flow: [["globe", "Il tuo sito", "WordPress o e-commerce"], ["refresh", "Aggiornamenti e backup", "ogni giorno"], ["gauge", "Controllo continuo", "avviso immediato se si ferma"], ["check-circle", "Ripristino", "rapido, dal backup"]],
    notes: [],
    incentives: ["voucher"],
    guide: "accessibilita", tool: "test-sicurezza", related: ["siti-web", "email-domini", "backup"],
  },
};
const SERVICE_ORDER = AREAS.flatMap(a => a.services);

const GUIDES = {
  "nis2": {
    cat: "Normative", min: 4, icon: "file",
    title: "NIS2: perché riguarda anche le piccole aziende che lavorano per le grandi",
    short: "NIS2: cosa chiederanno ai fornitori le aziende obbligate",
    lead: "Le aziende nell’elenco NIS devono avere operative le misure di sicurezza di base entro ottobre 2026; da lì l’Agenzia per la cybersicurezza nazionale passa ai controlli. Dovranno anche verificare i propri fornitori: se lavori per loro, ti chiederanno garanzie.",
    body: ["La NIS2 è la direttiva europea che alza il livello di sicurezza informatica di migliaia di aziende: energia, trasporti, sanità, manifattura, alimentare, servizi digitali e altri settori. Molte piccole imprese non sono obbligate direttamente, ma vendono a chi lo è.", "Il punto decisivo è la catena di fornitura. Le aziende obbligate devono censire i fornitori rilevanti e valutarne i rischi: arriveranno questionari, clausole nei contratti e richieste di prove concrete.", "Cosa chiederanno più spesso: un elenco aggiornato di computer e programmi, backup separati e provati, accessi con doppia verifica, una procedura per gli incidenti e la formazione del personale."],
    todo: ["Chiedi ai tuoi clienti principali se sono soggetti alla NIS2.", "Fai un check-up di sicurezza per sapere dove sei scoperto.", "Prepara una scheda «come proteggiamo i dati» da allegare alle offerte.", "Attiva subito doppia verifica sugli account e un backup fuori sede."],
    cta: { label: "Verifica gratis se la NIS2 ti riguarda", to: "check-up", type: "sicurezza" }, service: "cybersecurity", tool: "test-sicurezza",
    sources: [["NIS2: adempimenti e scadenze, ICT Security Magazine", "https://www.ictsecuritymagazine.com/notizie/nis2-adempimenti/"]],
  },
  "ransomware": {
    cat: "Sicurezza", min: 4, icon: "database",
    title: "Ransomware: perché il backup è l’unica assicurazione che funziona",
    short: "Ransomware: perché il backup è l’unica assicurazione che funziona",
    lead: "Un ransomware blocca i file e chiede un riscatto, e pagare non garantisce di riaverli. Chi ha un backup separato e provato riparte in poche ore; gli altri rischiano settimane di fermo.",
    body: ["Nel mondo un attacco grave su quattro nel 2025 è stato causato da software malevolo, e lo sfruttamento di falle non aggiornate è cresciuto del 65%. Le porte d’ingresso sono quasi sempre le stesse: un’email, una password rubata, un programma non aggiornato.", "Il disco esterno sempre collegato non basta: il ransomware cripta anche quello. Serve la regola 3-2-1: tre copie dei dati, su due supporti diversi, di cui una fuori dall’azienda e protetta da modifiche.", "E serve provarlo. Un backup mai ripristinato è una speranza, non una garanzia."],
    todo: ["Chiediti: quando abbiamo ripristinato un file l’ultima volta?", "Verifica che esista una copia scollegata o non modificabile.", "Decidi cosa deve ripartire per primo: gestionale, posta, cartelle.", "Programma una prova di ripristino ogni mese."],
    cta: { label: "Verifica gratis il tuo backup", to: "check-up", type: "sicurezza" }, service: "backup", tool: "costo-fermo",
    sources: [["Rapporto Clusit 2026, sintesi di 01net", "https://www.01net.it/rapporto-clusit-2026-cybersecurity-ai-ransomware/"]],
  },
  "email-truffa": {
    cat: "Sicurezza", min: 3, icon: "mail",
    title: "Email truffa nell’era dell’intelligenza artificiale: come riconoscerle",
    short: "Email truffa con l’intelligenza artificiale: come riconoscerle",
    lead: "In Italia phishing e ingegneria sociale hanno causato il 12,4% degli attacchi gravi del 2025, il 66% in più dell’anno prima. L’intelligenza artificiale scrive messaggi perfetti, anche vocali.",
    body: ["La truffa più costosa per le piccole aziende è il cambio di IBAN: un «fornitore» scrive che le coordinate bancarie sono cambiate, con logo e firma identici. Oggi arriva anche come messaggio vocale con una voce che sembra quella vera.", "I segnali d’allarme restano tre: urgenza, una richiesta di denaro o di credenziali, un canale insolito. Nessuno di questi basta da solo, quindi servono regole semplici e uguali per tutti."],
    todo: ["Regola d’oro: ogni cambio di IBAN si conferma telefonando a un numero già noto.", "Doppia verifica su posta e banca.", "Filtri anti-truffa sulla posta aziendale.", "Una breve formazione con simulazioni, due volte l’anno."],
    cta: { label: "Prenota la formazione anti-truffa per il tuo team", to: "preventivo" }, service: "cybersecurity", tool: "test-sicurezza",
    sources: [["Rapporto Clusit 2026, sintesi di 01net", "https://www.01net.it/rapporto-clusit-2026-cybersecurity-ai-ransomware/"]],
  },
  "telecamere-regole": {
    cat: "Normative", min: 3, icon: "camera",
    title: "Telecamere in azienda: le regole per non avere immagini inutilizzabili",
    short: "Telecamere in azienda: le regole da rispettare",
    lead: "Le telecamere proteggono solo se sono in regola e ben progettate. Servono cartelli informativi, tempi di conservazione limitati e, se possono riprendere dipendenti, accordo sindacale o autorizzazione dell’Ispettorato del lavoro (Statuto dei lavoratori, art. 4).",
    body: ["Un impianto non in regola rischia sanzioni e, soprattutto, di produrre immagini che non si possono usare. Il cartello va messo prima del campo ripreso; l’informativa completa deve essere disponibile; le immagini si conservano solo per il tempo strettamente necessario.", "Conta anche la qualità: per riconoscere un volto o una targa servono la telecamera giusta, nel punto giusto, con la luce giusta. E le telecamere sono computer collegati alla rete: vanno protette con password, aggiornamenti e una rete separata."],
    todo: ["Verifica cartelli e informativa.", "Se hai dipendenti, controlla di avere l’accordo o l’autorizzazione.", "Cambia le password di fabbrica di telecamere e registratore.", "Fai una prova: riesci a riconoscere chi entra di notte?"],
    cta: { label: "Sopralluogo gratuito per il tuo impianto", to: "check-up", type: "video" }, service: "videosorveglianza", tool: "test-sicurezza",
    sources: [],
  },
  "incentivi": {
    cat: "Incentivi", min: 5, icon: "euro",
    title: "Incentivi 2026: come far pagare allo Stato una parte della tecnologia",
    short: "Incentivi 2026: voucher, bando camerale e iperammortamento",
    lead: "Tra ottobre 2026 e gennaio 2027 si aprono o scadono tre opportunità per chi investe in sicurezza, cloud e digitale. Le regole cambiano molto dall’una all’altra: conviene preparare subito il piano di spesa.",
    blocks: [
      ["Voucher Cloud & Cybersecurity", "Contributo del Ministero delle imprese per PMI e lavoratori autonomi: copre il 50% della spesa, fino a 20.000 € (piano da 40.000 €); il piano minimo è di 4.000 €. Finanzia firewall, antivirus avanzati, backup e VPN in cloud, centralini virtuali, gestionali, CRM ed e-commerce in cloud; configurazione e assistenza fino al 30% del piano. Servono una connessione di almeno 30 Mbps, PEC e firma digitale, e i fornitori devono essere iscritti nell’elenco del Ministero. Domande precompilabili dal 20 ottobre 2026 e da inviare dal 10 novembre 2026 al 20 gennaio 2027, in ordine di arrivo fino a esaurimento dei 150 milioni."],
      ["Bando Doppia Transizione 2026, Camera di commercio della Maremma e del Tirreno", "Per micro, piccole e medie imprese con sede o unità locale nelle province di Grosseto o Livorno: 60% delle spese al netto dell’IVA, fino a 5.000 € per le tecnologie (cybersecurity, continuità operativa, cloud, software gestionali) e fino a 2.000 € per consulenza e formazione. Investimento minimo 2.000 €. Le spese devono essere già fatturate e pagate quando presenti la domanda, entro il 10 novembre 2026 alle 23:59. Esclusi PC e telefoni, siti aziendali e pubblicità online; non si cumula con altri aiuti pubblici."],
      ["Iperammortamento", "Per gli investimenti dal 1° gennaio 2026 al 30 settembre 2028 in beni 4.0, tra cui software di cybersecurity, il costo si ammortizza con una maggiorazione del 180% fino a 2,5 milioni. Vale per chi ha reddito d’impresa (esclusi forfettari e professionisti) e serve una comunicazione preventiva al GSE prima dell’acquisto."],
    ],
    body: [],
    todo: ["Elenca cosa vuoi migliorare: sicurezza, backup, centralino, sito.", "Usa lo strumento qui sotto per capire quale incentivo fa per te.", "Fai preparare un piano di spesa con le voci ammissibili.", "Verifica con il commercialista e prepara SPID, firma digitale e PEC."],
    cta: { label: "Prepariamo noi il piano di spesa", to: "preventivo" }, service: "cybersecurity", tool: "trova-incentivo", embed: "trova-incentivo",
    sources: [["Voucher Cloud & Cybersecurity, PartitaIva.it", "https://www.partitaiva.it/voucher-cloud-cybersecurity-professionisti/"], ["Voucher Cloud PMI: domande dal 20 ottobre, FiscoeTasse", "https://www.fiscoetasse.com/new-rassegna-stampa/3765-voucher-cloud-pmi-domande-da-precompilae-dal-20-ottobre.html"], ["Bando Doppia Transizione 2026, Camera di commercio della Maremma e del Tirreno", "https://lg.camcom.gov.it/sites/default/files/contenuto_redazione/bandi/allegati/2026-07-08/Bando%20Doppia%20Transizione%202026%20CCIAA%20MarTir.pdf"], ["Iperammortamento 2026, FiscoeTasse", "https://www.fiscoetasse.com/approfondimenti/17252-iperammortamento-2026-caso-pratico-con-il-foglio-excel-per-il-calcolo.html"]],
  },
  "spegnimento-rame": {
    cat: "Telefonia", min: 3, icon: "phone",
    title: "Spegnimento del rame: cosa succede al tuo telefono, all’allarme e al POS",
    short: "Spegnimento del rame: centralino, allarmi e POS funzioneranno ancora?",
    lead: "Entro il 2028 è previsto lo spegnimento di circa 6.800 centrali in rame. Le linee passano a fibra o radio: centralini analogici, combinatori degli allarmi, fax e vecchi POS possono smettere di funzionare.",
    body: ["Il passaggio viene comunicato dall’operatore, ma spesso con poco preavviso. Il rischio vero non è il telefono della scrivania: è l’allarme che non chiama più la vigilanza, o il POS che si blocca il sabato.", "È anche l’occasione per passare a un centralino VoIP: numero aziendale sullo smartphone, chiamate smistate e costi più bassi."],
    todo: ["Fai l’elenco di tutto ciò che è collegato alla linea telefonica.", "Chiedi al tuo operatore se la tua centrale è tra quelle in dismissione.", "Verifica con l’installatore dell’allarme come comunicherà dopo il passaggio.", "Valuta il centralino VoIP prima di essere costretto a cambiare in fretta."],
    cta: { label: "Verifica gratis linea e apparati", to: "check-up", type: "linea" }, service: "centralini-voip", tool: "verifica-rame", embed: "verifica-rame",
    sources: [["Spegnimento della rete in rame, ComparaSemplice", "https://www.comparasemplice.it/informazioni/news/switch-off-rete-rame-2026"]],
  },
  "wifi-hotel": {
    cat: "Reti", min: 3, icon: "bed",
    title: "Wi-Fi per hotel e agriturismi: il servizio che gli ospiti provano per primo",
    short: "Wi-Fi per hotel e agriturismi: il servizio che gli ospiti provano per primo",
    lead: "Il Wi-Fi è la prima cosa che un ospite prova e una delle prime che recensisce. In strutture grandi, con muri spessi o edifici separati, i ripetitori non bastano: serve un progetto.",
    body: ["Molte strutture ricettive hanno casali in pietra, dependance e spazi esterni: è qui che il segnale si perde. Una rete professionale usa punti di accesso collegati via cavo, che passano l’ospite dall’uno all’altro senza interruzioni.", "La rete ospiti va separata da quella di cassa, telecamere e computer: è una regola di sicurezza, non un dettaglio. E va misurata dopo l’installazione, stanza per stanza."],
    todo: ["Rileggi le recensioni: quante parlano del Wi-Fi?", "Prova il segnale nelle camere più lontane e all’esterno.", "Verifica che ospiti e gestionale non siano sulla stessa rete.", "Pianifica i lavori in bassa stagione."],
    cta: { label: "Prenota la misura gratuita del tuo Wi-Fi", to: "check-up", type: "wifi" }, service: "rete-wifi", tool: "test-sicurezza",
    sources: [],
  },
  "accessibilita": {
    cat: "Web", min: 3, icon: "eye",
    title: "Sito ed e-commerce accessibili: obbligo per molti, vantaggio per tutti",
    short: "Sito ed e-commerce accessibili: obbligo per molti, vantaggio per tutti",
    lead: "Dal 28 giugno 2025 i servizi di commercio elettronico devono essere accessibili anche a chi ha una disabilità. Sono escluse le microimprese, con meno di 10 addetti e fatturato fino a 2 milioni; le sanzioni dell’AGCM arrivano a 40.000 euro.",
    body: ["Accessibile significa che il sito si usa anche da tastiera, con un lettore vocale, con testi ben contrastati e moduli chiari. Serve anche una dichiarazione di accessibilità pubblicata sul sito.", "I siti online prima di quella data hanno tempo fino al 2030 solo se non vengono modificati in modo rilevante: un rifacimento, un nuovo carrello o un cambio di piattaforma fanno scattare l’obbligo. E un sito accessibile è più facile per tutti: si vende di più."],
    todo: ["Verifica se la tua azienda supera le soglie delle microimprese.", "Prova a completare un acquisto sul tuo sito usando solo la tastiera.", "Controlla che ci sia la dichiarazione di accessibilità.", "Se rifai il sito, chiedi l’accessibilità nel preventivo."],
    cta: { label: "Analisi gratuita di accessibilità del tuo sito", to: "check-up", type: "sito" }, service: "siti-web", tool: "trova-incentivo",
    sources: [["Accessibility Act: guida giuridico-operativa, Diritto.it", "https://www.diritto.it/accessibility-act-guida-giuridico-operativa/"]],
  },
};
const GUIDE_ORDER = ["incentivi", "nis2", "spegnimento-rame", "ransomware", "email-truffa", "wifi-hotel", "telecamere-regole", "accessibilita"];

const SECTORS = [
  { id: "hotel", icon: "bed", name: "Hotel, agriturismi e campeggi", line: "Wi-Fi per gli ospiti, telecamere, centralino con smistamento.",
    pains: ["«Gli ospiti si lamentano del Wi-Fi nelle recensioni.»", "«In campagna la connessione va e viene.»", "«Quando la reception è occupata, al telefono non risponde nessuno.»"],
    services: ["rete-wifi", "connettivita", "centralini-voip", "videosorveglianza", "siti-web"], guide: "wifi-hotel",
    wa: "Ciao, ho una struttura ricettiva e vorrei migliorare Wi-Fi e telefoni." },
  { id: "studi", icon: "briefcase", name: "Studi professionali", line: "Dati riservati al sicuro, accesso da remoto, assistenza rapida.",
    pains: ["«Abbiamo dati dei clienti che non possiamo perdere.»", "«Da casa non riusciamo ad aprire il gestionale.»", "«Riceviamo email truffa sempre più credibili.»"],
    services: ["backup", "cybersecurity", "vpn", "email-domini", "assistenza-informatica"], guide: "email-truffa",
    wa: "Ciao, ho uno studio professionale e vorrei mettere al sicuro dati e computer." },
  { id: "negozi", icon: "store", name: "Negozi e ristorazione", line: "Videosorveglianza, rete stabile per cassa e POS, Wi-Fi clienti.",
    pains: ["«Se cade la linea si bloccano cassa e POS.»", "«Di notte non sappiamo cosa succede nel locale.»", "«I clienti usano il Wi-Fi sulla stessa rete della cassa.»"],
    services: ["connettivita", "rete-wifi", "videosorveglianza", "centralini-voip", "siti-web"], guide: "spegnimento-rame",
    wa: "Ciao, ho un negozio e vorrei una connessione stabile e le telecamere." },
  { id: "agri", icon: "leaf", name: "Aziende agricole e cantine", line: "Connessione dove la fibra non arriva, telecamere perimetrali.",
    pains: ["«La fibra non arriva e la connessione è lentissima.»", "«Mezzi e attrezzi restano fuori, lontano dagli occhi.»", "«Vendiamo vino e prodotti, ma il sito non porta ordini.»"],
    services: ["connettivita", "videosorveglianza", "rete-wifi", "siti-web", "backup"], guide: "incentivi",
    wa: "Ciao, ho un’azienda agricola e mi servono connessione e telecamere." },
  { id: "industria", icon: "factory", name: "Industria, logistica e cantieri", line: "Reti per capannoni, collegamenti tra sedi, sicurezza NIS2.",
    pains: ["«Un nostro cliente grande ci ha chiesto come gestiamo la sicurezza.»", "«Nei capannoni i terminali perdono il segnale.»", "«I cantieri devono accedere ai file dell’ufficio.»"],
    services: ["cybersecurity", "rete-wifi", "vpn", "backup", "videosorveglianza"], guide: "nis2",
    wa: "Ciao, abbiamo capannoni e cantieri e vorremmo mettere in sicurezza rete e dati." },
];

const PROBLEMS = [
  ["«Internet va e viene, e in campagna la fibra non arriva.»", "connettivita"],
  ["«Il Wi-Fi non copre tutto l’hotel e gli ospiti si lamentano.»", "rete-wifi"],
  ["«I clienti chiamano e il telefono squilla a vuoto.»", "centralini-voip"],
  ["«Facciamo il backup, ma non l’abbiamo mai provato.»", "backup"],
  ["«Abbiamo paura di un ransomware o di una truffa via email.»", "cybersecurity"],
  ["«Ci sono stati furti e di notte non vediamo cosa succede.»", "videosorveglianza"],
  ["«Il sito è vecchio e non porta richieste.»", "siti-web"],
  ["«Abbiamo cinque fornitori e nessuno risponde.»", "assistenza-informatica"],
];

const DEADLINES = [
  { id: "cciaa", end: "2026-11-10T23:59:00", label: "10 novembre 2026", title: "Bando Doppia Transizione", text: "La Camera di commercio copre il 60% delle spese digitali, fino a 5.000 €. Le spese vanno pagate prima della domanda.", to: "incentivi", cta: "Scopri come",
    tick: "<b>Bando Camera di commercio</b>: 60% fino a 5.000 €, domande entro il 10 novembre", short: "<b>Bando CCIAA</b> entro il 10/11" },
  { id: "voucher", start: "2026-11-10T12:00:00", end: "2027-01-20T12:00:00", label: "Dal 10 novembre 2026", title: "Voucher Cloud & Cybersecurity", text: "Il Ministero copre il 50% della spesa, fino a 20.000 €. Le domande si inviano in ordine di arrivo.", to: "incentivi", cta: "Verifica se puoi",
    tick: "<b>Voucher Cloud & Cybersecurity</b>: 50% fino a 20.000 €, domande dal 10 novembre", short: "<b>Voucher cloud</b> dal 10/11" },
  { id: "nis2", end: "2026-10-31T23:59:00", label: "31 ottobre 2026", title: "NIS2", text: "Le aziende obbligate devono avere operative le misure di sicurezza, e chiederanno garanzie ai fornitori.", to: "nis2", cta: "Verifica se ti riguarda",
    tick: "<b>NIS2</b>: misure di sicurezza operative entro il 31 ottobre", short: "<b>NIS2</b> entro il 31/10", after: "Verifiche dell’ACN in corso" },
  { id: "rame", end: "2028-12-31T23:59:00", label: "Entro il 2028", title: "Spegnimento del rame", text: "Si spengono circa 6.800 centrali: centralini, allarmi e POS analogici vanno verificati.", to: "verifica-rame", cta: "Fai la verifica",
    tick: "<b>Spegnimento del rame</b>: centralini, allarmi e POS da verificare", short: "<b>Rame</b>: verifica la linea", noCount: true },
];

const TOOLS = [
  { id: "test-sicurezza", icon: "shield", name: "Test di sicurezza", line: "10 domande, 2 minuti: scopri dove la tua azienda è scoperta." },
  { id: "costo-fermo", icon: "euro", name: "Quanto costa un fermo", line: "Calcola cosa perdi se computer e gestionale si bloccano." },
  { id: "trova-incentivo", icon: "sparkle", name: "Trova il tuo incentivo", line: "Voucher, bando camerale o iperammortamento: cosa puoi usare." },
  { id: "verifica-rame", icon: "phone", name: "Verifica spegnimento del rame", line: "Cosa smette di funzionare quando si spegne la tua linea." },
  { id: "formule", icon: "calc", name: "Configura la tua formula", line: "Scegli l’assistenza a canone giusta per la tua azienda.", anchor: "configuratore" },
];

const PLANS = [
  { id: "essenziale", name: "Essenziale", price: 200, for: "Per piccoli uffici", inc: ["Help desk da remoto in orario d’ufficio", "Monitoraggio di PC e server", "Aggiornamenti di sicurezza e antivirus gestiti", "Report mensile"] },
  { id: "business", name: "Business", price: 500, for: "Per PMI e studi professionali", badge: "Consigliata", inc: ["+Tutto l’Essenziale, più:", "Interventi in sede inclusi", "Backup gestito con prova di ripristino", "Firewall gestito", "Referente dedicato"] },
  { id: "completa", name: "Completa", price: 800, for: "Per aziende con più sedi", inc: ["+Tutto il Business, più:", "Centralino VoIP gestito", "Rete, Wi-Fi e telecamere in assistenza", "Supporto per la NIS2"] },
];
const MATRIX = [
  ["Help desk da remoto in orario d’ufficio", 1, 1, 1], ["Monitoraggio di PC e server", 1, 1, 1], ["Aggiornamenti e antivirus gestiti", 1, 1, 1], ["Report mensile", 1, 1, 1],
  ["Interventi in sede inclusi", 0, 1, 1], ["Backup gestito con prova di ripristino", 0, 1, 1], ["Firewall gestito", 0, 1, 1], ["Referente dedicato", 0, 1, 1],
  ["Centralino VoIP gestito", 0, 0, 1], ["Rete, Wi-Fi e telecamere in assistenza", 0, 0, 1], ["Supporto per la NIS2", 0, 0, 1],
];
const PLAN_FAQ = [
  ["Cosa non è compreso nel canone?", "L’hardware nuovo, le licenze e i progetti, per esempio un nuovo impianto Wi-Fi, si quotano a parte e sempre prima di iniziare. Non sono compresi i danni all’hardware causati da un uso negligente né i ripristini dovuti a virus presi ripetutamente per negligenza."],
  ["I prezzi comprendono l’IVA?", "No: tutti i prezzi indicati sul sito sono IVA esclusa."],
  ["Posso cambiare formula?", "Sì: se l’azienda cresce, passi alla formula successiva."],
  ["E se non voglio un canone?", "Sì, facciamo anche interventi singoli: 50 € l’ora presso la tua sede e 36 € l’ora nella nostra sede, IVA esclusa."],
];

const STEPS4 = [
  ["Sopralluogo gratuito", "Veniamo in azienda, ascoltiamo e verifichiamo rete, linee e impianti."],
  ["Progetto e preventivo", "Ricevi una proposta chiara, con canone e costi una tantum separati."],
  ["Installazione", "Organizziamo i lavori in modo da non fermare la tua attività."],
  ["Assistenza e monitoraggio", "Teniamo d’occhio i sistemi e interveniamo da remoto o in sede."],
];

const COMPARE = [
  ["Un fornitore per la rete, uno per i telefoni, uno per il sito", "Un referente unico per tutta la tecnologia"],
  ["Si interviene quando qualcosa si è già rotto", "Monitoraggio continuo per prevenire i guasti"],
  ["Call center lontano, tempi incerti", "Un referente diretto e tecnici in azienda quando serve, in tutta Italia"],
  ["Preventivi difficili da confrontare", "Canone e costi una tantum separati e chiari"],
  ["Nessuno conosce l’insieme dei sistemi", "Un solo partner che vede e collega tutto"],
];

const QUIZ = [
  ["Il backup dei dati parte in automatico ogni giorno?", "Rendi automatico il backup quotidiano di PC, server e posta.", "backup"],
  ["C’è una copia dei dati fuori dall’azienda, o scollegata dalla rete?", "Aggiungi una copia esterna protetta: un virus non può cancellarla.", "backup"],
  ["Negli ultimi 6 mesi avete provato a recuperare dei file dal backup?", "Programma una prova di ripristino: è l’unico modo per sapere che funziona.", "backup"],
  ["Posta e banca online hanno la doppia verifica, con un codice sul telefono?", "Attiva la doppia verifica: ferma la maggior parte dei furti di password.", "cybersecurity"],
  ["Computer e programmi si aggiornano in automatico?", "Gestisci gli aggiornamenti in modo centralizzato, senza dipendere dai singoli.", "assistenza-informatica"],
  ["La rete è protetta da un firewall gestito, non solo dal modem dell’operatore?", "Metti un firewall gestito alla porta d’ingresso della rete.", "cybersecurity"],
  ["Il personale ha fatto una formazione sulle email truffa nell’ultimo anno?", "Organizza una formazione breve con simulazioni di email truffa.", "email-truffa"],
  ["Chi paga i fornitori conferma al telefono ogni cambio di IBAN?", "Introduci la regola: ogni cambio di IBAN si conferma telefonando a un numero già noto.", "email-truffa"],
  ["Il Wi-Fi degli ospiti è separato dalla rete dei computer aziendali?", "Separa la rete ospiti da quella di computer, cassa e telecamere.", "rete-wifi"],
  ["Sapete chi chiamare e cosa fare se domani i file vengono bloccati?", "Prepara un piano di ripartenza: chi chiamare, cosa ripristinare per primo.", "assistenza-informatica"],
];

const RAME_LINES = [["rame", "Telefono tradizionale o ADSL"], ["fttc", "Fibra misto rame (FTTC)"], ["ftth", "Fibra fino in ufficio (FTTH)"], ["radio", "Radio o satellite"], ["nonso", "Non lo so"]];
const RAME_DEVICES = [
  ["centralino", "server", "Centralino tradizionale", "Va sostituito o collegato a un’interfaccia VoIP: è il momento di passare al centralino VoIP.", "centralini-voip"],
  ["telefoni", "phone", "Telefoni analogici", "Funzionano con un adattatore del modem, ma perdi le funzioni moderne come l’inoltro sul cellulare.", "centralini-voip"],
  ["fax", "printer", "Fax", "Su una linea digitale il fax analogico diventa inaffidabile: si passa al fax via email.", "email-domini"],
  ["allarme", "siren", "Allarme con combinatore telefonico", "Fai verificare all’installatore: spesso serve un modulo GSM o IP, altrimenti l’allarme non chiama più.", null],
  ["pos", "card", "POS collegato alla linea telefonica", "I POS su linea telefonica vanno sostituiti con POS su rete o su rete mobile.", "connettivita"],
  ["ascensore", "elevator", "Ascensore con linea di emergenza", "La linea di emergenza va verificata dal manutentore: è un obbligo di sicurezza.", null],
];

const CHECKUP_TYPES = [
  ["it", "Check-up informatico"], ["sicurezza", "Check-up di sicurezza"], ["wifi", "Misura del Wi-Fi"], ["linea", "Verifica di linea e rame"],
  ["video", "Sopralluogo telecamere"], ["sito", "Analisi del sito"], ["posta", "Posta e dominio"],
];

const FORM_SERVICES = [["it", "Assistenza IT"], ["sec", "Sicurezza"], ["net", "Rete e Wi-Fi"], ["conn", "Connettività"], ["tel", "Telefonia"], ["web", "Web"], ["nonso", "Non lo so ancora"]];
