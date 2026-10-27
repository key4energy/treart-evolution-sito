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


_feriali = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
LD = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://treart-evolution.com/#azienda',
    'name': 'Treart Evolution',
    'legalName': 'Treart Evolution S.r.l. con socio unico',
    'slogan': 'Il tuo business, gestito.',
    'description': DESC,
    'url': 'https://treart-evolution.com/',
    'logo': 'https://treart-evolution.com/apple-touch-icon.png',
    'image': 'https://treart-evolution.com/og-image.png',
    'telephone': cval('telIntl'),
    'email': cval('email'),
    'vatID': 'IT' + cval('piva'),
    'foundingDate': '2015-07-15',
    'address': {'@type': 'PostalAddress', 'streetAddress': cval('addr1'), 'postalCode': '58100',
                'addressLocality': 'Grosseto', 'addressRegion': 'GR', 'addressCountry': 'IT'},
    'areaServed': {'@type': 'Country', 'name': 'Italia'},
    'openingHoursSpecification': [
        {'@type': 'OpeningHoursSpecification', 'dayOfWeek': _feriali, 'opens': '08:30', 'closes': '13:00'},
        {'@type': 'OpeningHoursSpecification', 'dayOfWeek': _feriali, 'opens': '14:00', 'closes': '17:30'},
    ],
    'sameAs': [cval('facebook'), cval('instagram'), cval('linkedin')],
}
LD_JSON = json.dumps(LD, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
TITLE = 'Treart Evolution | Assistenza IT, sicurezza, reti e web, da Grosseto in tutta Italia'


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
files = ['index.html', 'og-image.png']
if PROD:
    with open(os.path.join(OUT, 'robots.txt'), 'w', encoding='utf-8') as f:
        f.write(f'User-agent: *\nAllow: /\n\nSitemap: {SITE}sitemap.xml\n')
    import datetime
    oggi = datetime.date.today().isoformat()
    with open(os.path.join(OUT, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                f'  <url><loc>{SITE}</loc><lastmod>{oggi}</lastmod></url>\n</urlset>\n')
    files += ['robots.txt', 'sitemap.xml']
for n in files:
    print(n, f'{os.path.getsize(os.path.join(OUT, n)) / 1024:.0f} KB')
