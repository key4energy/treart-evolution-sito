# Sito Treart Evolution

Anteprima del nuovo sito di Treart Evolution, pubblicata su https://fabio.treart-evolution.com.

La versione per https://treart-evolution.com è nella cartella `produzione/` e va online solo con il via di Fabio (vedi «Passaggio al nuovo sito»).

## Come si pubblica

A ogni modifica di `public/` sul ramo `main`, il workflow **Pubblica su SiteGround** si collega a SiteGround via SSH e carica tutti i file di `public/` (sottocartelle comprese) nella cartella del sottodominio. Sul server non viene cancellato nessun file: se c'era già una pagina iniziale, viene conservata come `index.html.originale`.

L'esito di ogni pubblicazione si legge nella scheda **Actions** e nel file `esito-pubblicazione.txt` del ramo `esito-pubblicazione`.

Per ripubblicare senza modifiche: **Actions › Pubblica su SiteGround › Run workflow**.

### Segreti

Si impostano in **Settings › Secrets and variables › Actions › New repository secret**.

| Nome | Valore |
|---|---|
| `SITEGROUND_SSH_KEY` | chiave privata creata in SiteGround (Site Tools › Devs › SSH Keys Manager › Private Key) |
| `SITEGROUND_SSH_PASSPHRASE` | passphrase scelta quando è stata creata la chiave |
| `SITEGROUND_HOST` | hostname indicato in SSH Credentials |
| `SITEGROUND_USER` | username indicato in SSH Credentials |

Facoltativi: il segreto `SITEGROUND_PORT`, se la porta non è 18765, e la variabile `SITEGROUND_DIR`, se la cartella del sito non è `www/fabio.treart-evolution.com/public_html`.

## Struttura

- `public/`: i file pubblicati. `index.html` è una pagina unica e autonoma, con caratteri e icone incorporati; `og-image.png` è l'immagine delle anteprime dei link.
- `produzione/`: la stessa pagina nella versione per treart-evolution.com (visibile ai motori di ricerca, senza gli strumenti dell'anteprima), con `robots.txt`, `sitemap.xml`, icone e `.htaccess` con i reindirizzamenti dai vecchi indirizzi di WordPress.
- `sorgente/`: testi, stili e script del sito, più gli script che generano `public/`.
- `sorgente/kit/`: logo e caratteri della corporate identity usati dagli script. Open Sans e Gelasio sono distribuiti con licenza SIL Open Font License.

## Fotografie

Le foto vengono da Unsplash e sono usate secondo la [licenza Unsplash](https://unsplash.com/license), che consente l'uso commerciale senza obbligo di citazione; i crediti sono comunque nella pagina «Crediti foto» del sito.

- `sorgente/foto.json`: quale foto va dove, punto di fuoco del ritaglio, testo alternativo e autore.
- `public/img/`: le foto pronte, in WebP da 1600 e 800 px di larghezza (rapporto 3:2), con toni leggermente scaldati.
- Ramo `foto-candidate`, cartella `foto/candidate/`: gli originali di tutte le foto valutate, utili per sostituirne qualcuna.

Per rigenerare le foto dagli originali:

```
git archive foto-candidate foto/candidate | tar -x -C /tmp
cd sorgente
python3 prepara_foto.py /tmp/foto/candidate ../public/img
```

Le foto con persone sono immagini d'archivio: vanno sostituite, appena possibile, con foto reali di persone, sede e impianti Treart.

## Rigenerare il sito

```
pip install segno fonttools brotli pillow
cd sorgente
python3 build_hosting.py ../public
python3 build_produzione.py
```

`build.py` genera anche la versione di anteprima, `sito-treart-evolution.html`. `build_produzione.py` va eseguito dopo ogni modifica, così `produzione/` resta allineata all'anteprima: la pubblicazione su treart-evolution.com controlla che lo sia e altrimenti si ferma.

## Partner e badge ufficiali

I partner confermati (3CX Bronze Partner e WatchGuard) sono nell'elenco `PARTNERS` di `sorgente/content.js`. Compaiono nella home (sezione «Sicurezza gestita»), in Chi siamo (sezione «Partner ufficiali», raggiungibile da `#chi-siamo` con il pulsante «Cosa significa per te») e in cima alle pagine Centralini VoIP e Cybersecurity.

Per mostrare i badge ufficiali al posto del nome in testo: scaricali dai portali partner dei produttori, salvali in `public/img/partner/`, scrivi il percorso nel campo `badge` (per esempio `"img/partner/3cx-bronze-partner.png"`) e rigenera il sito. Il livello di partnership WatchGuard (Silver) non è indicato, per scelta di Fabio; i tecnici sono certificati 3CX.

## Pagine dell'app social

Per pubblicare su Facebook e Instagram si usa un'app Meta interna, «Treart Evolution Social». Meta chiede, per metterla in modalità Live, un'informativa privacy e delle condizioni d'uso raggiungibili online:

- https://fabio.treart-evolution.com/privacy-app.html (istruzioni per la cancellazione dei dati: `privacy-app.html#cancellazione-dati`)
- https://fabio.treart-evolution.com/condizioni-app.html

Si rigenerano con `python3 sorgente/pagine_app.py public`, che copia anche il carattere in `public/font/`.

## Social (Pagina Facebook)

Il workflow **Social** usa la chiave `META_TOKEN` (segreto del repository: token senza scadenza dell'utente di sistema «pubblicazioni» del portfolio Treart Evolution, app «Treart Evolution Social»). Si avvia aggiungendo sul ramo `main` un file JSON in `social/richieste/`:

- `{"azione": "prova"}`: lettura di verifica della chiave, della Pagina e degli ultimi post, senza pubblicare nulla.
- `{"azione": "aggiorna-pagina", "approvata_da": "...", "campi": {"about": "..."}}`: aggiorna le informazioni della Pagina (`about`, `description`, `website`, `phone`, `hours`, `impressum`) e le rilegge per conferma.
- `{"azione": "controlla-pagina"}`: controllo completo in sola lettura (informazioni, foto profilo, copertina, post, statistiche); i dettagli vanno nella cartella `dettagli/` del ramo `esito-social`.
- `{"azione": "copertina", "approvata_da": "...", "file": "public/social/....png", "offset_y": 50}`: nuova copertina, senza post nel diario.
- `{"azione": "cerca-categorie", "parole": ["informatic"]}` e `{"azione": "categorie", "approvata_da": "...", "categorie": ["id", ...]}`: ricerca e scelta delle categorie (massimo 3).
- `{"azione": "diagnosi-instagram"}`: sola lettura, perché il collegamento di Instagram alla Pagina non riesce (portfolio della Pagina, account Instagram già collegati).

Instagram, con accesso diretto all'account (senza passare dalla Pagina), con la chiave `IG_TOKEN` (segreto del repository, generata in developers.facebook.com › app Treart Evolution Social › Casi d'uso › «Gestisci i messaggi e i contenuti su Instagram» › Configurazione dell'API con Instagram Login › Genera token; dura 60 giorni):

- `{"azione": "prova-instagram"}`: lettura di verifica (account, ultimi post, limite di pubblicazione);
- `{"azione": "pubblica-instagram", "approvata_da": "...", "file": "public/social/....jpg", "testo": "..."}`: pubblica una foto. L'immagine deve essere un JPEG raggiungibile online: un file in `public/` (pubblicato sull'anteprima) oppure `"immagine": "https://..."`.

L'esito si legge nel ramo `esito-social` (file `esito-social.txt`). Le chiavi non vengono mai stampate. Ogni pubblicazione avviene solo dopo l'ok esplicito di Fabio.

## Sito attuale (treart-evolution.com)

Il sito attuale è un WordPress (tema Bricks) sullo stesso account SiteGround. Il workflow **Sito attuale** vi accede via SSH con le stesse chiavi della pubblicazione e si avvia aggiungendo un file JSON in `manutenzione/richieste/`:

- `{"azione": "ispeziona"}`: sola lettura (WordPress, tema, plugin, dove compare «key4energy», link ai social della pagina iniziale);
- `{"azione": "sostituisci", "approvata_da": "...", "sostituzioni": [["vecchio", "nuovo"]]}`: sostituzione con `wp search-replace`;
- `{"azione": "rimuovi-link", "approvata_da": "...", "link": "..."}`: toglie dai modelli Bricks le voci con quel link;
- `{"azione": "backup"}`: backup completo (tutti i file e il database) in `~/backup-sito-attuale/` sul server, scaricabile per 7 giorni dalla pagina dell'esecuzione su GitHub (sezione Artifacts);
- `{"azione": "elenca-indirizzi"}`: sola lettura, tutti gli indirizzi pubblici del sito (servono per i reindirizzamenti).

Prima di ogni modifica viene salvata una copia del database in `~/backup-sito-attuale/` sul server. L'esito si legge nel ramo `esito-sito-attuale`.

## Passaggio al nuovo sito (treart-evolution.com)

Si fa con lo stesso workflow **Sito attuale**, solo dopo il via esplicito di Fabio:

- `{"azione": "prova-pubblicazione"}`: sola lettura. Controlla che `produzione/` sia allineata all'anteprima e mostra cosa c'è oggi sul server (file, `.htaccess`, plugin, come risponde il sito).
- `{"azione": "pubblica-produzione", "approvata_da": "..."}`: carica `produzione/` sul server in `~/www/treart-evolution.com/nuovo-sito-in-arrivo`, la verifica file per file e poi la mette online. La prima volta salva una copia del database e sposta **tutti** i file di WordPress in `~/www/treart-evolution.com/wordpress-archiviato-DATA`, fuori da `public_html` (non più raggiungibili dal web); il database di WordPress non viene toccato. Restano nella cartella pubblica i file di verifica (`.well-known`, `google*.html`, `BingSiteAuth.xml`). Poi svuota la cache di SiteGround e controlla dal server pagina iniziale, file e reindirizzamenti: se la pagina iniziale non risponde, rimette subito online WordPress. Le volte successive aggiorna i file del nuovo sito (la versione precedente resta in `sito-statico-precedente`).
- `{"azione": "ripristina-wordpress", "approvata_da": "...", "archivio": "wordpress-archiviato-DATA"}`: rimette online WordPress (senza `archivio`, l'ultimo archiviato); il nuovo sito va in `sito-statico-ritirato-DATA`.

Lo stato attuale è scritto sul server in `~/www/treart-evolution.com/STATO-SITO.txt`.

I reindirizzamenti permanenti (301) dai vecchi indirizzi di WordPress sono in `sorgente/build_produzione.py`: pagine e articoli vanno alla pagina del servizio corrispondente (per esempio `/backup-il-vero-salvavita-dei-tuoi-dati/` → `/#backup`), le vecchie mappe del sito a `/sitemap.xml`, tutto il resto che non esiste più alla home.

Dopo il passaggio: inviare `https://treart-evolution.com/sitemap.xml` in Google Search Console.
