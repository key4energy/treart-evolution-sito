"""Pagine statiche per l'app Meta «Treart Evolution Social».

Meta chiede l'indirizzo di un'informativa privacy e delle condizioni d'uso
per mettere l'app in modalità Live (senza, i post pubblicati dall'app restano
visibili solo a chi gestisce l'app). Genera:
  privacy-app.html       informativa privacy dell'app (con le istruzioni per
                         la cancellazione dei dati: privacy-app.html#cancellazione-dati)
  condizioni-app.html    condizioni d'uso dell'app
  font/open-sans.woff2   Open Sans, condiviso dalle due pagine

Uso: python3 pagine_app.py [CARTELLA_USCITA]   (di solito ../public)
"""
import base64
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.environ.get('TREART_KIT') or (
    os.path.join(HERE, 'kit') if os.path.isdir(os.path.join(HERE, 'kit'))
    else '/mnt/user-data/outputs/Treart-Evolution-corporate-identity')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'public')
AGGIORNATA = '22 ottobre 2026'
APP = 'Treart Evolution Social'
MAIL = 'info@treart-evolution.com'

# ---------- logo (stessi tracciati del kit, senza metadati) ----------
src = open(os.path.join(KIT, '01-logo', 'svg', 'logo-treart-evolution-colori.svg'), encoding='utf-8').read()
vb = re.search(r'viewBox="([^"]+)"', src).group(1)
paths = re.findall(r'<path fill="([^"]+)"[^>]*? d="([^"]+)"', src)
circles = re.findall(r'<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)" fill="([^"]+)"', src)
def corto(d):
    """Coordinate a due decimali: stesso disegno, file molto più leggero."""
    return re.sub(r'-?\d+\.\d+', lambda m: f'{float(m.group()):.2f}'.rstrip('0').rstrip('.'), d)


by_fill = {}
for fill, d in paths:
    by_fill.setdefault(fill.upper(), []).append(corto(d))
(cx, cy, cr, _), (dx, dy, dr, _) = circles
LOGO = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="Treart Evolution">'
        f'<path fill="#58585A" d="{by_fill["#58585A"][0]}"/>'
        f'<path fill="#B3D670" d="{by_fill["#B3D670"][0]}"/>'
        f'<circle cx="{cx}" cy="{cy}" r="{cr}" fill="#B3D670"/>'
        f'<path fill="#FFFFFF" d="{by_fill["#FFFFFF"][0]}"/>'
        f'<circle cx="{dx}" cy="{dy}" r="{dr}" fill="#FFFFFF"/>'
        f'<path fill="#5A7722" d="{by_fill["#5A7722"][0]}"/></svg>')
FAVICON = base64.b64encode(open(os.path.join(KIT, '01-logo', 'png', 'favicon-32.png'), 'rb').read()).decode()

PAGE = '''<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" type="image/png" sizes="32x32" href="data:image/png;base64,{favicon}">
<style>
@font-face{{font-family:"Open Sans"; src:url("font/open-sans.woff2") format("woff2"); font-weight:300 800; font-stretch:75% 100%; font-display:swap}}
:root{{color-scheme:light; --green:#B3D670; --green-ink:#5A7722; --green-deep:#465D1A; --anth:#2B2B2D; --grey:#58585A; --line:#DEE0D8; --paper:#F5F6F2; --white:#FFFFFF}}
*,*::before,*::after{{box-sizing:border-box}}
body{{margin:0; background:var(--white); color:var(--anth); font-family:"Open Sans","Segoe UI","Helvetica Neue",Arial,sans-serif; font-size:17px; line-height:1.65; -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility}}
.wrap{{max-width:760px; margin-inline:auto; padding-left:max(20px, env(safe-area-inset-left, 0px)); padding-right:max(20px, env(safe-area-inset-right, 0px))}}
header{{border-bottom:1px solid var(--line); padding-block:18px}}
header a{{display:inline-block}}
header svg{{display:block; height:46px; width:auto}}
main{{padding-block:44px 56px}}
.eyebrow{{margin:0; font-size:13px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--green-ink)}}
h1{{margin:8px 0 14px; font-size:clamp(30px, 5vw, 42px); line-height:1.12; letter-spacing:-.02em; font-weight:800; text-wrap:balance}}
.lead{{margin:0; font-size:19px; color:var(--grey)}}
h2{{margin:38px 0 10px; font-size:21px; line-height:1.3; font-weight:700; letter-spacing:-.01em; scroll-margin-top:16px}}
p,ul{{margin:0 0 12px}}
ul{{padding-left:22px}}
li{{margin-bottom:6px}}
.box{{margin:14px 0; padding:16px 20px; background:var(--paper); border-left:4px solid var(--green); border-radius:0 12px 12px 0}}
.box p{{margin:0}}
a{{color:var(--green-ink); text-decoration-thickness:1.5px; text-underline-offset:3px}}
a:hover{{color:var(--green-deep)}}
:focus-visible{{outline:3px solid var(--green-ink); outline-offset:2px; border-radius:4px}}
footer{{border-top:1px solid var(--line); padding-block:22px 32px; font-size:14.5px; color:var(--grey)}}
footer p{{margin:0 0 8px}}
footer nav{{display:flex; flex-wrap:wrap; gap:6px 18px; margin-bottom:8px}}
</style>
</head>
<body>
<header><div class="wrap"><a href="./" aria-label="Treart Evolution, vai al sito">{logo}</a></div></header>
<main class="wrap">
<p class="eyebrow">{eyebrow}</p>
<h1>{h1}</h1>
<p class="lead">{lead}</p>
{body}
</main>
<footer><div class="wrap">
<p>Treart Evolution Srl · Via Aurelia Nord 76/1, 58100 Grosseto (GR) · P. IVA 01575220536 · <a href="mailto:{mail}">{mail}</a> · 0564 1768249</p>
<nav aria-label="Pagine collegate"><a href="./">Sito</a><a href="privacy-app.html">Privacy dell’app</a><a href="condizioni-app.html">Condizioni d’uso dell’app</a><a href="./#privacy">Informativa privacy del sito</a></nav>
<p>Ultimo aggiornamento: {data}</p>
</div></footer>
</body>
</html>
'''

TITOLARE = f'''<p>Treart Evolution Srl, Via Aurelia Nord 76/1, 58100 Grosseto (GR), partita IVA 01575220536.<br>
E-mail <a href="mailto:{MAIL}">{MAIL}</a>, telefono 0564 1768249.</p>'''

PRIVACY = f'''<h2>Titolare del trattamento</h2>
{TITOLARE}

<h2>Che cos’è l’app</h2>
<p>«{APP}» è un’applicazione registrata sulla piattaforma per sviluppatori di Meta e usata soltanto da Treart Evolution. Serve a pubblicare i nostri contenuti, testi e immagini, sulla nostra Pagina Facebook e sul nostro account Instagram attraverso le API ufficiali di Meta, e a leggere le statistiche di questi contenuti.</p>
<p>L’app non è offerta al pubblico: nessuno può accedervi con il proprio account Facebook o Instagram né collegarvi i propri dati.</p>

<h2>Quali dati tratta</h2>
<ul>
<li>Gli identificativi della nostra Pagina Facebook e del nostro account Instagram, necessari per pubblicare.</li>
<li>I testi e le immagini dei nostri post e l’esito della pubblicazione.</li>
<li>Le statistiche aggregate dei nostri post, come copertura e interazioni, che non identificano le singole persone.</li>
</ul>
<div class="box"><p>L’app non raccoglie, non conserva e non condivide dati personali di altri utenti di Facebook o Instagram. I commenti e i messaggi che riceviamo restano su Facebook e Instagram e sono trattati secondo l’informativa di Meta.</p></div>

<h2>Perché li tratta</h2>
<p>Per far conoscere i servizi di Treart Evolution sui nostri canali social. La base giuridica è il legittimo interesse dell’azienda a promuovere la propria attività (articolo 6, paragrafo 1, lettera f del Regolamento UE 2016/679).</p>

<h2>Dove sono conservati e chi li vede</h2>
<p>La chiave di accesso dell’app è custodita in forma cifrata tra i segreti del nostro archivio privato su GitHub e non viene condivisa con nessuno. Nello stesso archivio privato conserviamo i testi e le immagini dei post.</p>
<p>Le pubblicazioni passano dai servizi di GitHub e di Meta Platforms, che trattano i dati secondo le proprie informative. Non vendiamo né cediamo dati a terzi.</p>

<h2>Per quanto tempo</h2>
<p>Per il tempo in cui l’app è in uso. Possiamo revocare la chiave di accesso in qualsiasi momento: da quel momento l’app non può più leggere né pubblicare nulla.</p>

<h2 id="cancellazione-dati">Come chiedere la cancellazione dei dati</h2>
<p>L’app non conserva dati personali di altre persone. Se ritieni che conservi dati che ti riguardano e vuoi che vengano cancellati, scrivi a <a href="mailto:{MAIL}?subject=Cancellazione%20dati%20app%20social">{MAIL}</a> con oggetto «Cancellazione dati app social». Ti rispondiamo entro 30 giorni e ti confermiamo la cancellazione.</p>

<h2>I tuoi diritti</h2>
<p>Puoi chiedere in ogni momento l’accesso, la rettifica, la cancellazione o la limitazione dei dati che ti riguardano, oppure opporti al loro trattamento, scrivendo a <a href="mailto:{MAIL}">{MAIL}</a>. Hai anche il diritto di presentare reclamo al Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it/">garanteprivacy.it</a>).</p>'''

CONDIZIONI = f'''<h2>Chi gestisce l’app</h2>
{TITOLARE}

<h2>A cosa serve</h2>
<p>«{APP}» è uno strumento interno di Treart Evolution Srl. Serve a pubblicare i contenuti dell’azienda sulla sua Pagina Facebook e sul suo account Instagram e a leggerne le statistiche.</p>
<p>Non è un servizio offerto a terzi: non prevede registrazione, accesso o collegamento di account di altre persone.</p>

<h2>Uso conforme alle regole di Meta</h2>
<p>L’app è usata nel rispetto dei <a href="https://developers.facebook.com/terms/">Termini della piattaforma Meta</a>, delle <a href="https://developers.facebook.com/devpolicy/">Normative per gli sviluppatori</a> e delle regole di Facebook e Instagram. Pubblica soltanto contenuti di Treart Evolution, approvati dall’azienda prima della pubblicazione.</p>

<h2>Contenuti</h2>
<p>Testi e immagini pubblicati appartengono a Treart Evolution o sono usati con regolare licenza. Se ritieni che un contenuto violi un tuo diritto, scrivi a <a href="mailto:{MAIL}">{MAIL}</a>: lo verifichiamo e, se serve, lo rimuoviamo.</p>

<h2>Dati personali</h2>
<p>Come l’app tratta i dati è descritto nell’<a href="privacy-app.html">informativa privacy dell’app</a>.</p>

<h2>Modifiche</h2>
<p>Queste condizioni possono essere aggiornate. La versione in vigore è sempre quella pubblicata su questa pagina, con la data dell’ultimo aggiornamento.</p>

<h2>Legge applicabile</h2>
<p>Queste condizioni sono regolate dalla legge italiana.</p>'''

PAGINE = {
    'privacy-app.html': dict(
        title='Privacy dell’app social | Treart Evolution',
        desc=f'Come l’app «{APP}», usata da Treart Evolution per pubblicare su Facebook e Instagram, tratta i dati.',
        eyebrow='Note legali · App social',
        h1=f'Informativa privacy dell’app «{APP}»',
        lead='Come l’app che usiamo per pubblicare sulla nostra Pagina Facebook e sul nostro account Instagram tratta i dati.',
        body=PRIVACY),
    'condizioni-app.html': dict(
        title='Condizioni d’uso dell’app social | Treart Evolution',
        desc=f'Condizioni d’uso dell’app «{APP}», strumento interno di Treart Evolution per pubblicare su Facebook e Instagram.',
        eyebrow='Note legali · App social',
        h1=f'Condizioni d’uso dell’app «{APP}»',
        lead='Le regole dello strumento interno che usiamo per pubblicare sulla nostra Pagina Facebook e sul nostro account Instagram.',
        body=CONDIZIONI),
}

os.makedirs(os.path.join(OUT, 'font'), exist_ok=True)
shutil.copyfile(os.path.join(KIT, '03-caratteri', 'web', 'open-sans-latin-wdth-normal.woff2'),
                os.path.join(OUT, 'font', 'open-sans.woff2'))
for nome, p in PAGINE.items():
    html = PAGE.format(logo=LOGO, favicon=FAVICON, mail=MAIL, data=AGGIORNATA, **p)
    with open(os.path.join(OUT, nome), 'w', encoding='utf-8') as f:
        f.write(html)
    print('ok', nome, f'{len(html) / 1024:.0f} KB')
