"""Versione per l'hosting (SiteGround) del sito Treart Evolution.

Parte dalla build di anteprima e produce:
  index.html     pagina HTML completa e autonoma (doctype, head, body), con
                 Open Sans variabile incorporata (nessuna chiamata a Google Fonts),
                 favicon incorporate, meta per le anteprime dei link e noindex
  og-image.png   immagine 1200x630 per le anteprime su WhatsApp, LinkedIn, e-mail
"""
import base64
import io
import json
import os
import re
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.environ.get('TREART_KIT') or (
    os.path.join(HERE, 'kit') if os.path.isdir(os.path.join(HERE, 'kit'))
    else '/mnt/user-data/outputs/Treart-Evolution-corporate-identity')
# Open Sans variabile (assi wght 300-800 e wdth 75-100), sottoinsieme latino, da @fontsource-variable/open-sans
FONT = next(p for p in (
    os.path.join(KIT, '03-caratteri', 'web', 'open-sans-latin-wdth-normal.woff2'),
    os.path.join(HERE, '..', 'fontpkg', 'package', 'files', 'open-sans-latin-wdth-normal.woff2'),
) if os.path.exists(p))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'hosting')
# TREART_PRODUZIONE=1: versione per treart-evolution.com, visibile ai motori di ricerca
PROD = os.environ.get('TREART_PRODUZIONE') == '1'
SITE = 'https://treart-evolution.com/' if PROD else 'https://fabio.treart-evolution.com/'
os.makedirs(OUT, exist_ok=True)

# ---------- build di anteprima ----------
subprocess.run([sys.executable, os.path.join(HERE, 'build.py')], check=True)
with open(os.path.join(HERE, 'sito-treart-evolution.html'), encoding='utf-8') as f:
    art = f.read()
with open(os.path.join(HERE, 'head.html'), encoding='utf-8') as f:
    head = f.read()
assert art.startswith(head), 'la build non inizia con head.html'
rest = art[len(head):]
cut = rest.index('</style>') + len('</style>')
css_block, body = rest[:cut], rest[cut:].strip()

DESC = re.search(r'name="description" content="([^"]+)"', head).group(1)

# dati strutturati (schema.org) per i motori di ricerca: chi siamo, dove, orari e profili social
# (stessi dati dell'oggetto C di content.js, letti da lì)
_c = open(os.path.join(HERE, 'content.js'), encoding='utf-8').read()
_c = _c[_c.index('const C = {'):]
_c = _c[:_c.index('\n};')]


def cval(key):
    return re.search(r'\b' + key + r': "([^"]+)"', _c).group(1)


# I dati strutturati descrivono sempre il sito vero, anche nell'anteprima (così anteprima e produzione
# restano uguali e la pubblicazione non si ferma). Un'unica descrizione dell'azienda, la stessa della
# scheda Google e della Pagina Facebook: i motori di ricerca e gli assistenti AI confrontano le fonti
# e si fidano di più quando dicono tutte la stessa cosa.
SITO = 'https://treart-evolution.com/'
ORG_ID = SITO + '#azienda'
SITE_ID = SITO + '#sito'
GPLACE = re.search(r'const GPLACE = "([^"]+)"', open(os.path.join(HERE, 'content.js'), encoding='utf-8').read()).group(1)
MAPS = f'https://www.google.com/maps/search/?api=1&query=Treart+Evolution+Grosseto&query_place_id={GPLACE}'
DESC_AZIENDA = ('Treart Evolution è il partner IT delle aziende: un solo referente per computer, rete, sicurezza, telefonia e sito web. '
                'Abbiamo sede a Grosseto e seguiamo imprese, studi professionali, hotel e negozi in tutta Italia, da remoto e in sede. '
                'Ci occupiamo di assistenza informatica, installazione di PC e server, sicurezza informatica (firewall, backup e protezione dai ransomware), '
                'reti e Wi-Fi professionali, connettività in fibra, radio e satellite, centralini VoIP e telefonia aziendale, videosorveglianza e controllo accessi, '
                'siti web, email, domini e hosting. Siamo partner WatchGuard e 3CX. '
                'Interveniamo entro 8 ore lavorative dalla richiesta e proponiamo formule di assistenza su misura, con un check-up iniziale e preventivi chiari.')
# coordinate della sede (scheda Google di Treart Evolution, 4 novembre 2026)
GEO = {'@type': 'GeoCoordinates', 'latitude': 42.7725726, 'longitude': 11.1052865}
AREA = [
    {'@type': 'City', 'name': 'Grosseto'},
    {'@type': 'AdministrativeArea', 'name': 'Provincia di Grosseto'},
    {'@type': 'AdministrativeArea', 'name': 'Provincia di Livorno'},
    {'@type': 'State', 'name': 'Toscana'},
    {'@type': 'Country', 'name': 'Italia'},
]
_feriali = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
ORARI = [
    {'@type': 'OpeningHoursSpecification', 'dayOfWeek': _feriali, 'opens': '08:30', 'closes': '13:00'},
    {'@type': 'OpeningHoursSpecification', 'dayOfWeek': _feriali, 'opens': '14:00', 'closes': '17:30'},
]
TEAM = [(m.group(1), m.group(2)) for m in re.finditer(r'\{ name: "([^"]+)", role: "([^"]+)" \}', open(os.path.join(HERE, 'content.js'), encoding='utf-8').read())]
assert TEAM and TEAM[0][0] == 'Fabio Di Cesare', 'squadra non letta da content.js'
ARGOMENTI = ['Assistenza informatica aziendale', 'Sicurezza informatica', 'Firewall', 'Backup e ripristino dei dati', 'Protezione dai ransomware',
             'VPN e lavoro da remoto', 'Reti aziendali e Wi-Fi professionale', 'Connettività Internet in fibra, radio e satellite',
             'Centralini VoIP e telefonia aziendale', 'Videosorveglianza e controllo accessi', 'Siti web ed e-commerce',
             'Email, domini e hosting', 'Direttiva NIS2', 'Incentivi per la digitalizzazione delle PMI']
TITLE = 'Treart Evolution | Assistenza IT, sicurezza, reti e web, da Grosseto in tutta Italia'


def ld_json(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


# segnaposto: ogni pagina riceve il suo grafo di dati strutturati (ld_pagina) dopo il prerender
LD_JSON = '{}'


def b64(data):
    return base64.b64encode(data).decode()


def png_b64(path):
    im = Image.open(path).convert('RGBA')
    buf = io.BytesIO()
    im.save(buf, 'PNG', optimize=True)
    return b64(buf.getvalue())


with open(FONT, 'rb') as f:
    font64 = b64(f.read())
fav32 = png_b64(f'{KIT}/01-logo/png/favicon-32.png')
fav180 = png_b64(f'{KIT}/01-logo/png/favicon-180.png')

# su treart-evolution.com resta il codice di verifica del dominio per Pinterest già presente nel sito precedente
ROBOTS = (f'<link rel="canonical" href="{SITE}">\n<meta name="p:domain_verify" content="6cf26ab217996b7dae280488dadd4746">' if PROD else
          '<!-- Anteprima: esclusa dai motori di ricerca (la versione di produzione si genera con TREART_PRODUZIONE=1) -->\n<meta name="robots" content="noindex, nofollow">')

page = f'''<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{TITLE}</title>
<meta name="description" content="{DESC}">
{ROBOTS}
<meta name="theme-color" content="#FFFFFF">
<link rel="icon" type="image/png" sizes="32x32" href="data:image/png;base64,{fav32}">
<link rel="apple-touch-icon" sizes="180x180" href="data:image/png;base64,{fav180}">
<meta property="og:type" content="website">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="Treart Evolution">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{DESC}">
<meta property="og:url" content="{SITE}">
<meta property="og:image" content="{SITE}og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Treart Evolution, Grosseto">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="IT-GR">
<meta name="geo.placename" content="Grosseto">
<meta name="geo.position" content="{GEO['latitude']};{GEO['longitude']}">
<meta name="ICBM" content="{GEO['latitude']}, {GEO['longitude']}">
<script type="application/ld+json">{LD_JSON}</script>
<style>
@font-face{{font-family:"Open Sans";font-style:normal;font-weight:300 800;font-stretch:75% 100%;font-display:swap;src:url(data:font/woff2;base64,{font64}) format("woff2")}}
:root{{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}
body{{margin:0;font:14px system-ui}}
img{{max-width:100%}}
[hidden]{{display:none!important}}
</style>
{css_block}
</head>
<body>
{body}
</body>
</html>
'''
with open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(page)


# ---------- immagine per le anteprime dei link ----------
def og_image(path):
    W, H = 1200, 630
    im = Image.new('RGB', (W, H), '#F5F6F2')
    # grande «e» Gelasio tagliata dal bordo, come nel sito
    fe = ImageFont.truetype(f'{KIT}/03-caratteri/Gelasio-Bold.ttf', 1000)
    layer = Image.new('L', (1600, 1600), 0)
    ImageDraw.Draw(layer).text((150, 0), 'e', font=fe, fill=255)
    mask = layer.crop(layer.getbbox())
    th = 660
    mask = mask.resize((round(mask.width * th / mask.height), th), Image.LANCZOS)
    im.paste(Image.new('RGB', mask.size, '#E5EFCF'), (W - round(mask.width * 0.64), H - round(th * 0.78)), mask)
    # logo
    logo = Image.open(f'{KIT}/01-logo/png/logo-treart-evolution-colori-2400px.png').convert('RGBA')
    lw = 690
    lh = round(logo.height * lw / logo.width)
    logo = logo.resize((lw, lh), Image.LANCZOS)
    top = 150
    im.paste(logo, (78, top), logo)
    d = ImageDraw.Draw(im)
    f1 = ImageFont.truetype(f'{KIT}/03-caratteri/OpenSans-SemiBold.ttf', 31)
    f2 = ImageFont.truetype(f'{KIT}/03-caratteri/OpenSans-Bold.ttf', 27)
    d.text((88, top + lh + 44), 'Assistenza IT · Sicurezza · Reti · Telefonia · Web', font=f1, fill='#58585A')
    d.text((88, top + lh + 96), 'Sede a Grosseto, in tutta Italia', font=f2, fill='#5A7722')
    d.rectangle((0, H - 12, W, H), fill='#B3D670')
    im.save(path, optimize=True)


og_image(os.path.join(OUT, 'og-image.png'))


# ---------- una pagina HTML per ogni indirizzo del sito (/contatti/, /cybersecurity/...) ----------
# Ogni pagina ha già nel file titolo, descrizione, indirizzo canonico e contenuto (letti dal sito stesso con
# prerender.cjs), così i motori di ricerca e le anteprime dei link la vedono anche senza eseguire il JavaScript.
# Aprendosi, il sito ridisegna tutto da sé e poi passa da una pagina all'altra senza ricaricare.
import html as _html
import shutil
import tempfile

PARTI = {
    'util': '<div class="util" id="util"></div>',
    'hdr': '<header class="hdr" id="hdr"></header>',
    'drawer': '<div class="drawer" id="drawer" hidden></div>',
    'main': '<main id="main" tabindex="-1"></main>',
    'ftr': '<footer class="ftr" id="ftr"></footer>',
    'fab': '<div class="fab" id="fab"></div>',
}
# pagine di servizio, raggiungibili ma fuori dalla ricerca e dalla mappa del sito
FUORI_DALLA_RICERCA = {'interno'}
# cartelle del sito che non sono pagine
CARTELLE_FISSE = {'img', 'font', 'social'}

with tempfile.TemporaryDirectory() as tmp:
    js = os.path.join(tmp, 'pagine.json')
    subprocess.run(['node', os.path.join(HERE, 'prerender.cjs'), os.path.abspath(OUT), js], check=True)
    with open(js, encoding='utf-8') as f:
        PAGINE = json.load(f)
assert 'home' in PAGINE and len(PAGINE) > 20, 'pagine non generate'


def indirizzo(tok):
    return SITE if tok == 'home' else f'{SITE}{tok}/'


def indirizzo_vero(tok):
    """Indirizzo su treart-evolution.com, usato nei dati strutturati anche dall'anteprima."""
    return SITO if tok == 'home' else f'{SITO}{tok}/'


# ---------- dati strutturati (schema.org, JSON-LD) ----------
# Un grafo per pagina: l'azienda (LocalBusiness, con sede, orari, zona servita, servizi, formule, partner, squadra),
# il sito, la pagina con il suo percorso e, dove ci sono, il servizio, le domande frequenti (FAQPage) e la guida (Article).
# È ciò che leggono Google, Bing e gli assistenti AI (ChatGPT, Gemini, Claude, Perplexity, Copilot) per capire chi siamo.
import datetime

OGGI = datetime.date.today().isoformat()
SERVIZI = {tok: d['svc'] for tok, d in PAGINE.items() if d.get('svc')}
PLANS = PAGINE['home']['plans']
PARTNERS = PAGINE['home']['partners']
assert len(SERVIZI) >= 12 and len(PLANS) == 3 and len(PARTNERS) == 2, 'servizi, formule o partner non letti dal sito'


def id_servizio(tok):
    return indirizzo_vero(tok) + '#servizio'


def nodo_azienda():
    return {
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': ORG_ID,
        'name': 'Treart Evolution',
        'alternateName': ['Treart', 'Treart Evolution S.r.l.'],
        'legalName': 'Treart Evolution S.r.l. con socio unico',
        'slogan': 'Il tuo business, gestito.',
        'description': DESC_AZIENDA,
        'url': SITO,
        'logo': {'@type': 'ImageObject', 'url': SITO + 'apple-touch-icon.png', 'width': 180, 'height': 180},
        'image': SITO + 'og-image.png',
        'telephone': cval('telIntl'),
        'email': cval('email'),
        'vatID': 'IT' + cval('piva'),
        'taxID': cval('piva'),
        'identifier': [{'@type': 'PropertyValue', 'propertyID': 'REA', 'value': 'GR-' + cval('rea')},
                       {'@type': 'PropertyValue', 'propertyID': 'Partita IVA', 'value': cval('piva')}],
        'foundingDate': '2015-07-15',
        'foundingLocation': {'@type': 'Place', 'name': 'Grosseto, Italia'},
        'founder': [{'@type': 'Person', 'name': 'Fabio Di Cesare', 'jobTitle': 'Amministratore Unico'},
                    {'@type': 'Person', 'name': 'Luca Guelfi'}],
        'employee': [{'@type': 'Person', 'name': n, 'jobTitle': r} for n, r in TEAM],
        'address': {'@type': 'PostalAddress', 'streetAddress': cval('addr1'), 'postalCode': '58100',
                    'addressLocality': 'Grosseto', 'addressRegion': 'Toscana', 'addressCountry': 'IT'},
        'geo': GEO,
        'hasMap': MAPS,
        'areaServed': AREA,
        'openingHoursSpecification': ORARI,
        'contactPoint': [
            {'@type': 'ContactPoint', 'contactType': 'customer service', 'telephone': cval('telIntl'), 'email': cval('email'),
             'availableLanguage': ['Italian'], 'areaServed': 'IT', 'hoursAvailable': ORARI},
            {'@type': 'ContactPoint', 'contactType': 'sales', 'telephone': cval('telIntl'), 'url': 'https://wa.me/' + cval('wa'),
             'availableLanguage': ['Italian'], 'areaServed': 'IT'},
        ],
        'sameAs': [cval('facebook'), cval('instagram'), cval('linkedin'), MAPS],
        'priceRange': '€€',
        'currenciesAccepted': 'EUR',
        'knowsLanguage': 'it',
        'knowsAbout': ARGOMENTI,
        'memberOf': [{'@type': 'ProgramMembership', 'programName': f'{p["name"]} {p["level"]}',
                      'hostingOrganization': {'@type': 'Organization', 'name': p['name']}} for p in PARTNERS],
        'hasOfferCatalog': {
            '@type': 'OfferCatalog', 'name': 'Servizi di Treart Evolution',
            'itemListElement': [{'@type': 'Offer', 'itemOffered': {'@type': 'Service', '@id': id_servizio(tok), 'name': s['name'], 'url': indirizzo_vero(tok)}}
                                for tok, s in SERVIZI.items()],
        },
        'makesOffer': [{
            '@type': 'Offer', 'name': f'Formula {p["name"]}', 'url': SITO + 'formule/',
            'description': f'{p["for"]}, fino a {p["max"]} postazioni. Include: ' + '; '.join(x.lstrip('+') for x in p['inc']) + '.',
            'priceSpecification': {'@type': 'UnitPriceSpecification', 'price': p['price'], 'priceCurrency': 'EUR',
                                   'valueAddedTaxIncluded': False, 'unitText': 'al mese', 'billingDuration': 1, 'billingIncrement': 1, 'unitCode': 'MON'},
            'availability': 'https://schema.org/InStock', 'areaServed': AREA,
        } for p in PLANS],
    }


def nodo_sito():
    return {'@type': 'WebSite', '@id': SITE_ID, 'url': SITO, 'name': 'Treart Evolution', 'inLanguage': 'it-IT',
            'publisher': {'@id': ORG_ID}, 'description': DESC}


TIPO_PAGINA = {'home': 'WebPage', 'chi-siamo': 'AboutPage', 'contatti': 'ContactPage', 'progetti': 'CollectionPage',
               'servizi': 'CollectionPage', 'risorse': 'CollectionPage', 'strumenti': 'CollectionPage', 'settori': 'CollectionPage'}


def ld_pagina(tok, d):
    url = indirizzo_vero(tok)
    nodi = [nodo_azienda(), nodo_sito()]
    pagina = {'@type': TIPO_PAGINA.get(tok, 'WebPage'), '@id': url, 'url': url, 'name': d['title'], 'description': d['desc'],
              'inLanguage': 'it-IT', 'isPartOf': {'@id': SITE_ID}, 'about': {'@id': ORG_ID}, 'dateModified': OGGI,
              'primaryImageOfPage': {'@type': 'ImageObject', 'url': SITO + 'og-image.png'}}
    if tok == 'home':
        pagina['mainEntity'] = {'@id': ORG_ID}
    if d['crumbs']:
        voci = [{'@type': 'ListItem', 'position': i + 1, 'name': c['name'], 'item': indirizzo_vero(c['tok'] or tok)}
                for i, c in enumerate(d['crumbs'])]
        nodi.append({'@type': 'BreadcrumbList', '@id': url + '#percorso', 'itemListElement': voci})
        pagina['breadcrumb'] = {'@id': url + '#percorso'}
    if d.get('svc'):
        s = d['svc']
        nodi.append({'@type': 'Service', '@id': id_servizio(tok), 'name': s['name'], 'serviceType': s['short'], 'description': s['sub'],
                     'url': url, 'provider': {'@id': ORG_ID}, 'areaServed': AREA, 'availableLanguage': 'it',
                     'hasOfferCatalog': {'@type': 'OfferCatalog', 'name': f'Cosa comprende: {s["name"]}',
                                         'itemListElement': [{'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': x}} for x in s['does']]}})
        pagina['mainEntity'] = {'@id': id_servizio(tok)}
    if d.get('guide'):
        g = d['guide']
        nodi.append({'@type': 'Article', '@id': url + '#guida', 'headline': g['title'], 'description': g['lead'], 'articleSection': g['cat'],
                     'inLanguage': 'it-IT', 'author': {'@id': ORG_ID}, 'publisher': {'@id': ORG_ID}, 'mainEntityOfPage': {'@id': url},
                     'datePublished': '2026-10-28', 'dateModified': OGGI, 'image': SITO + 'og-image.png', 'isAccessibleForFree': True})
        pagina['mainEntity'] = {'@id': url + '#guida'}
    if d['faq']:
        nodi.append({'@type': 'FAQPage', '@id': url + '#faq', 'inLanguage': 'it-IT',
                     'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': r}} for q, r in d['faq']]})
    nodi.insert(2, pagina)
    return ld_json({'@context': 'https://schema.org', '@graph': nodi})


def pagina_html(tok, d):
    assert d['title'] and d['desc'] and d['h1'], f'pagina {tok} senza titolo, descrizione o h1'
    url = indirizzo(tok)
    sost = [
        (f'<title>{TITLE}</title>', f'<title>{_html.escape(d["title"], quote=False)}</title>'),
        (f'<meta name="description" content="{DESC}">', f'<meta name="description" content="{_html.escape(d["desc"])}">'),
        (f'<meta property="og:title" content="{TITLE}">', f'<meta property="og:title" content="{_html.escape(d["title"])}">'),
        (f'<meta property="og:description" content="{DESC}">', f'<meta property="og:description" content="{_html.escape(d["desc"])}">'),
        (f'<meta property="og:url" content="{SITE}">', f'<meta property="og:url" content="{url}">'),
        (f'<script type="application/ld+json">{LD_JSON}</script>', f'<script type="application/ld+json">{ld_pagina(tok, d)}</script>'),
    ]
    if PROD:
        sost.append((f'<link rel="canonical" href="{SITE}">', f'<link rel="canonical" href="{url}">'
                     + ('\n<meta name="robots" content="noindex">' if tok in FUORI_DALLA_RICERCA else '')))
    for k, vuoto in PARTI.items():
        sost.append((vuoto, vuoto.replace('></', '>' + d['parti'][k] + '</', 1)))
    h = page
    for old, new in sost:
        assert h.count(old) == 1, f'pagina {tok}: «{old[:50]}» trovato {h.count(old)} volte'
        h = h.replace(old, new)
    return h


# toglie le pagine di indirizzi che il sito non ha più
for nome in os.listdir(OUT):
    p = os.path.join(OUT, nome)
    if os.path.isdir(p) and nome not in CARTELLE_FISSE and nome not in PAGINE and os.path.exists(os.path.join(p, 'index.html')):
        shutil.rmtree(p)
for tok, d in PAGINE.items():
    dest = os.path.join(OUT, 'index.html') if tok == 'home' else os.path.join(OUT, tok, 'index.html')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w', encoding='utf-8') as f:
        f.write(pagina_html(tok, d))

# ---------- robots.txt, mappa del sito, llms.txt ----------
# Crawler dei motori di ricerca e degli assistenti AI, tutti ammessi in modo esplicito: così chi chiede a ChatGPT,
# Gemini, Claude, Copilot o Perplexity «un'azienda informatica a Grosseto» può trovare e citare il sito.
CRAWLER_AI = [
    ('OpenAI (ChatGPT)', ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User']),
    ('Anthropic (Claude)', ['ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai']),
    ('Google (Gemini, AI Overview)', ['Googlebot', 'Google-Extended']),
    ('Microsoft (Bing, Copilot)', ['Bingbot', 'msnbot']),
    ('Perplexity', ['PerplexityBot', 'Perplexity-User']),
    ('Apple (Siri, Spotlight)', ['Applebot', 'Applebot-Extended']),
    ('Meta AI', ['meta-externalagent', 'Meta-ExternalFetcher', 'FacebookBot']),
    ('Amazon (Alexa)', ['Amazonbot']),
    ('Mistral', ['MistralAI-User']),
    ('DuckDuckGo (DuckAssist)', ['DuckAssistBot', 'DuckDuckBot']),
    ('You.com', ['YouBot']),
    ('Cohere', ['cohere-ai']),
    ('Common Crawl (archivio usato da molti modelli)', ['CCBot']),
    ('Yandex, Seznam, Qwant', ['YandexBot', 'SeznamBot', 'Qwantify']),
]


def robots_txt():
    r = ['# treart-evolution.com: il sito può essere letto, indicizzato e citato dai motori di ricerca',
         '# e dagli assistenti AI. Una sintesi per gli assistenti AI è in /llms.txt (e /llms-full.txt per i testi completi).',
         '', 'User-agent: *', 'Allow: /',
         '# Content Signals (Cloudflare): ricerca, risposte AI e addestramento consentiti',
         'Content-Signal: search=yes, ai-input=yes, ai-train=yes', '']
    for nome, agenti in CRAWLER_AI:
        r.append(f'# {nome}')
        r += [f'User-agent: {a}' for a in agenti]
        r += ['Allow: /', '']
    r.append(f'Sitemap: {SITE}sitemap.xml')
    return '\n'.join(r) + '\n'


def testo_md(html_main):
    """Il contenuto principale di una pagina in Markdown semplice (titoli, paragrafi, elenchi, domande e risposte),
    senza menu, pulsanti, moduli e strumenti interattivi."""
    from bs4 import BeautifulSoup, NavigableString, Tag
    soup = BeautifulSoup(html_main, 'html.parser')
    for sel in ['svg', 'script', 'style', 'form', 'button', 'input', 'select', 'textarea', 'nav.crumbs', 'figure', 'img',
                '.tool', '.quiz', '.calc', '[aria-hidden="true"]', '.ph__ctas', '.row', '.hero__ctas', '.hero__call']:
        for el in soup.select(sel):
            el.decompose()
    righe = []

    def testo(el):
        return re.sub(r'\s+', ' ', el.get_text(' ', strip=True)).strip()

    def visita(el):
        if isinstance(el, NavigableString):
            return
        if not isinstance(el, Tag):
            return
        nome = el.name
        if nome in ('h1', 'h2', 'h3', 'h4'):
            t = testo(el)
            if t:
                righe.append('')
                righe.append('#' * int(nome[1]) + ' ' + t)
            return
        if nome == 'details':
            q = el.find('summary')
            r = [p for p in el.find_all(['p', 'li']) if testo(p)]
            if q and r:
                righe.append(f'**{testo(q)}** {" ".join(testo(p) for p in r)}')
            return
        if nome == 'li':
            t = testo(el)
            if t:
                righe.append('- ' + t)
            return
        if nome in ('p', 'blockquote', 'figcaption', 'dd', 'dt'):
            t = testo(el)
            if t:
                righe.append(t)
            return
        if nome == 'a' and not el.find_parent(['p', 'li', 'h1', 'h2', 'h3', 'h4', 'details']):
            t = testo(el)
            if t and len(t) > 25:
                righe.append(t)
            return
        # scheda «etichetta: valore» (dati societari) e simili
        if nome == 'div' and 'facts' in (el.get('class') or []):
            for riga in el.find_all('div', recursive=False):
                k, v = riga.find('span'), riga.find('b')
                if k and v:
                    righe.append(f'- {testo(k)}: {testo(v)}')
            return
        for c in el.children:
            visita(c)

    visita(soup)
    out, vuota = [], True
    for r in righe:
        if r == '':
            if not vuota:
                out.append('')
            vuota = True
        else:
            out.append(r)
            vuota = False
    return '\n'.join(out).strip()


def llms_txt():
    """Indice per gli assistenti AI (formato llms.txt): chi siamo in breve e l'elenco delle pagine con una riga ciascuna."""
    def riga(tok):
        d = PAGINE[tok]
        nome = d['svc']['name'] if d.get('svc') else d['guide']['title'] if d.get('guide') else d['title'].split(' | ')[0]
        return f'- [{_html.unescape(nome)}]({indirizzo(tok)}): {d["desc"]}'
    servizi = [t for t in PAGINE if t in SERVIZI]
    guide = [t for t in PAGINE if PAGINE[t].get('guide')]
    strumenti = [t for t in ('test-sicurezza', 'costo-fermo', 'trova-incentivo', 'verifica-rame') if t in PAGINE]
    azienda = [t for t in ('chi-siamo', 'progetti', 'settori', 'formule', 'servizi', 'contatti', 'check-up', 'preventivo', 'assistenza') if t in PAGINE]
    altre = [t for t in PAGINE if t not in servizi + guide + strumenti + azienda + ['home'] and t not in FUORI_DALLA_RICERCA]
    formule = '; '.join(f'{p["name"]} {p["price"]} € al mese (fino a {p["max"]} postazioni)' for p in PLANS)
    partner = ', '.join(f'{p["name"]} ({p["level"]})' for p in PARTNERS)
    team = ', '.join(f'{n} ({r})' for n, r in TEAM)
    return f'''# Treart Evolution

> Treart Evolution S.r.l. è un'azienda informatica di Grosseto (Toscana), attiva dal 2015, che segue la tecnologia delle piccole e medie imprese: assistenza informatica, sicurezza informatica, backup, reti e Wi-Fi, connettività, centralini VoIP, videosorveglianza, siti web, email e hosting. Un solo referente per tutto, con sede a Grosseto e clienti in tutta Italia.

{DESC_AZIENDA}

## Dati essenziali

- Ragione sociale: Treart Evolution S.r.l. con socio unico · Partita IVA {cval('piva')} · REA GR-{cval('rea')} · fondata a Grosseto nel 2015
- Sede: {cval('addr1')}, {cval('addr2')} · coordinate {GEO['latitude']}, {GEO['longitude']}
- Telefono e WhatsApp: {cval('telIntl')} · Email: {cval('email')} · PEC: {cval('pec')}
- Orari: lunedì–venerdì 8:30–13:00 e 14:00–17:30
- Zona servita: Grosseto e provincia, Livorno e provincia, Toscana; assistenza da remoto e interventi in sede in tutta Italia
- Tempo di intervento: entro {cval('reply')} dalla richiesta
- Formule di assistenza a canone (IVA esclusa): {formule}; interventi singoli 50 € l'ora presso la sede del cliente, 36 € l'ora nella sede di Treart Evolution
- Partner ufficiali: {partner}
- Squadra: {team}
- Clienti e lavori: {PAGINE['progetti']['desc'] if 'progetti' in PAGINE else ''}
- Sito: {SITE} · Facebook: {cval('facebook')} · Instagram: {cval('instagram')} · LinkedIn: {cval('linkedin')} · Google Maps: {MAPS}
- Testi completi di tutte le pagine: {SITE}llms-full.txt

## Servizi

{chr(10).join(riga(t) for t in servizi)}

## Azienda, formule e contatti

{chr(10).join(riga(t) for t in azienda)}

## Guide (normative, incentivi, sicurezza)

{chr(10).join(riga(t) for t in guide)}

## Strumenti gratuiti

{chr(10).join(riga(t) for t in strumenti)}

## Optional

{chr(10).join(riga(t) for t in altre)}
'''


def llms_full_txt():
    parti = [llms_txt().split('\n## Servizi')[0].strip(), '']
    for tok, d in PAGINE.items():
        if tok in FUORI_DALLA_RICERCA:
            continue
        parti += ['', '---', '', f'# {_html.unescape(d["title"])}', '', f'Indirizzo: {indirizzo(tok)}', '', testo_md(d['parti']['main'])]
    return '\n'.join(parti).strip() + '\n'


files = ['index.html', 'og-image.png']
if PROD:
    with open(os.path.join(OUT, 'robots.txt'), 'w', encoding='utf-8') as f:
        f.write(robots_txt())
    # prima la home, poi le pagine nell'ordine del sito
    voci = ''.join(f'  <url><loc>{indirizzo(tok)}</loc><lastmod>{OGGI}</lastmod></url>\n'
                   for tok in PAGINE if tok not in FUORI_DALLA_RICERCA)
    with open(os.path.join(OUT, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                + voci + '</urlset>\n')
    with open(os.path.join(OUT, 'llms.txt'), 'w', encoding='utf-8') as f:
        f.write(llms_txt())
    with open(os.path.join(OUT, 'llms-full.txt'), 'w', encoding='utf-8') as f:
        f.write(llms_full_txt())
    files += ['robots.txt', 'sitemap.xml', 'llms.txt', 'llms-full.txt']
for n in files:
    print(n, f'{os.path.getsize(os.path.join(OUT, n)) / 1024:.0f} KB')
print(f'pagine con indirizzo proprio: {len(PAGINE)}')
