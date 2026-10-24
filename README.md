# Sito Treart Evolution

Anteprima del nuovo sito di Treart Evolution, pubblicata su https://fabio.treart-evolution.com.

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
```

`build.py` genera anche la versione di anteprima, `sito-treart-evolution.html`.

## Partner e badge ufficiali

I partner confermati (3CX Bronze Partner e WatchGuard) sono nell'elenco `PARTNERS` di `sorgente/content.js`. Compaiono nella home (sezione «Sicurezza gestita»), in Chi siamo (sezione «Partner ufficiali», raggiungibile da `#chi-siamo` con il pulsante «Cosa significa per te») e in cima alle pagine Centralini VoIP e Cybersecurity.

Per mostrare i badge ufficiali al posto del nome in testo: scaricali dai portali partner dei produttori, salvali in `public/img/partner/`, scrivi il percorso nel campo `badge` (per esempio `"img/partner/3cx-bronze-partner.png"`) e rigenera il sito. Il livello di partnership WatchGuard e la certificazione 3CX dei tecnici sono segnati come dati da confermare.

## Pagine dell'app social

Per pubblicare su Facebook e Instagram si usa un'app Meta interna, «Treart Evolution Social». Meta chiede, per metterla in modalità Live, un'informativa privacy e delle condizioni d'uso raggiungibili online:

- https://fabio.treart-evolution.com/privacy-app.html (istruzioni per la cancellazione dei dati: `privacy-app.html#cancellazione-dati`)
- https://fabio.treart-evolution.com/condizioni-app.html

Si rigenerano con `python3 sorgente/pagine_app.py public`, che copia anche il carattere in `public/font/`.

## Prima della pubblicazione definitiva

La pagina contiene `<meta name="robots" content="noindex, nofollow">`, perché è un'anteprima con dati ancora da confermare. Va tolta in `build_hosting.py` quando il sito andrà su treart-evolution.com.
