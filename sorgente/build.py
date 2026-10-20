"""Assembla il sito Treart Evolution in un unico file HTML.

Genera gli asset vettoriali (logo, simbolo, grande «e», arco, tratto, QR code)
e li unisce a stili, contenuti e script.
"""
import io
import json
import math
import os
import re
import sys

import segno
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
# risorse della corporate identity: cartella kit/ accanto agli script (repository)
# oppure il kit completo, se presente
KIT = os.environ.get('TREART_KIT') or (
    os.path.join(HERE, 'kit') if os.path.isdir(os.path.join(HERE, 'kit'))
    else '/mnt/user-data/outputs/Treart-Evolution-corporate-identity')


def read(name):
    with open(os.path.join(HERE, name), encoding='utf-8') as f:
        return f.read()


# ---------- logo I5 (dal kit) ----------
logo_src = open(f'{KIT}/01-logo/svg/logo-treart-evolution-colori.svg', encoding='utf-8').read()
vb = re.search(r'viewBox="([^"]+)"', logo_src).group(1)
paths = re.findall(r'<path fill="([^"]+)"[^>]*? d="([^"]+)"', logo_src)
circles = re.findall(r'<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)" fill="([^"]+)"', logo_src)
by_fill = {}
for fill, d in paths:
    by_fill.setdefault(fill.upper(), []).append(d)
WORD = by_fill['#58585A'][0]
STROKE = by_fill['#B3D670'][0]
WHITE = by_fill['#FFFFFF'][0]
FIRMA = by_fill['#5A7722'][0]
(cx, cy, cr, _), (dx, dy, dr, _) = circles
CX, CY, CR = float(cx), float(cy), float(cr)

logo_symbol = (
    f'<symbol id="logo" viewBox="{vb}">'
    f'<path style="fill:var(--lw,#58585A)" d="{WORD}"/>'
    f'<path style="fill:var(--ls,#B3D670)" d="{STROKE}"/>'
    f'<circle cx="{cx}" cy="{cy}" r="{cr}" style="fill:var(--lc,#B3D670)"/>'
    f'<path style="fill:var(--le,#FFFFFF)" d="{WHITE}"/>'
    f'<circle cx="{dx}" cy="{dy}" r="{dr}" style="fill:var(--le,#FFFFFF)"/>'
    f'<path style="fill:var(--lf,#5A7722)" d="{FIRMA}"/>'
    '</symbol>'
)
sym_symbol = (
    f'<symbol id="sym" viewBox="{CX-CR:.3f} {CY-CR:.3f} {2*CR:.3f} {2*CR:.3f}">'
    f'<circle cx="{cx}" cy="{cy}" r="{cr}" style="fill:var(--sc,#B3D670)"/>'
    f'<path style="fill:var(--se,#FFFFFF)" d="{WHITE}"/>'
    f'<circle cx="{dx}" cy="{dy}" r="{dr}" style="fill:var(--se,#FFFFFF)"/>'
    '</symbol>'
)

# ---------- grande «e» (Gelasio Bold) ----------
font = TTFont(f'{KIT}/03-caratteri/Gelasio-Bold.ttf')
gs = font.getGlyphSet()
glyph = gs[font.getBestCmap()[ord('e')]]
bp = BoundsPen(gs)
glyph.draw(bp)
x0, y0, x1, y1 = bp.bounds
pen = SVGPathPen(gs)
glyph.draw(TransformPen(pen, (1, 0, 0, -1, -x0, y1)))
e_symbol = f'<symbol id="bige" viewBox="0 0 {x1-x0} {y1-y0}"><path fill="currentColor" d="{pen.getCommands()}"/></symbol>'


# ---------- forme a pennello (stesso tratto del logo) ----------
def taper_points(pts, wmax, ps=0.12, pe=0.85, wend=0.0):
    n = len(pts)
    seg = [0.0]
    for i in range(1, n):
        seg.append(seg[-1] + math.dist(pts[i], pts[i - 1]))
    total = seg[-1]
    left, right = [], []
    for i, (x, y) in enumerate(pts):
        a = pts[max(i - 1, 0)]
        b = pts[min(i + 1, n - 1)]
        tx, ty = b[0] - a[0], b[1] - a[1]
        ln = math.hypot(tx, ty) or 1
        nx, ny = -ty / ln, tx / ln
        t = seg[i] / total
        up = min(t / ps, 1) if ps > 0 else 1
        down = min((1 - t) / (1 - pe), 1) if pe < 1 else 1
        w = (wend + (wmax - wend) * max(min(up, down), 0) ** 0.85) / 2
        left.append((x + nx * w, y + ny * w))
        right.append((x - nx * w, y - ny * w))
    poly = left + right[::-1]
    return 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in poly) + ' Z'


# arco che abbraccia il simbolo (centro 0,0 raggio 100)
arc_pts = [(100 * math.cos(math.radians(a)), 100 * math.sin(math.radians(a)))
           for a in [25 - i * (270 / 240) for i in range(241)]]
arc_symbol = f'<symbol id="arc" viewBox="-112 -112 224 224"><path fill="currentColor" d="{taper_points(arc_pts, 10, 0.18, 0.78)}"/></symbol>'

# tratto sotto una parola
sw_pts = []
for i in range(161):
    t = i / 160
    x = 4 + 292 * t
    y = 17 - 9 * t + 6 * math.sin(math.pi * t) * -0.6
    sw_pts.append((x, y))
swash_symbol = f'<symbol id="swash" viewBox="0 0 300 24" preserveAspectRatio="none"><path fill="currentColor" d="{taper_points(sw_pts, 7, 0.05, 0.62, 0.6)}"/></symbol>'


# ---------- QR code ----------
def qr_svg(data, label):
    q = segno.make(data, error='m')
    buf = io.BytesIO()
    q.save(buf, kind='svg', scale=1, border=2, dark='#2B2B2D', light='#FFFFFF', xmldecl=False, svgns=True, nl=False)
    s = buf.getvalue().decode()
    s = re.sub(r'<svg ', f'<svg role="img" aria-label="{label}" class="qr" ', s, count=1)
    w = re.search(r' width="(\d+)"', s).group(1)
    h = re.search(r' height="(\d+)"', s).group(1)
    s = s.replace(' class="segno"', '')
    s = re.sub(r' (width|height)="\d+"', '', s)
    if 'viewBox' not in s:
        s = s.replace('<svg ', f'<svg viewBox="0 0 {w} {h}" ', 1)
    return s


WA = '3905641768249'
VCARD = ('BEGIN:VCARD\nVERSION:3.0\nN:;;;;\nFN:Treart Evolution Srl\nORG:Treart Evolution Srl\n'
         'TEL;TYPE=WORK,VOICE:+39 0564 1768249\nEMAIL;TYPE=WORK:info@treart-evolution.com\n'
         'URL:https://treart-evolution.com\nADR;TYPE=WORK:;;Via Aurelia Nord 76/1;Grosseto;GR;58100;Italia\nEND:VCARD')
qr_wa = qr_svg(f'https://wa.me/{WA}', 'QR code per scriverci su WhatsApp')
qr_vc = qr_svg(VCARD, 'QR code per salvare il contatto di Treart Evolution')

sprite = ('<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">'
          + logo_symbol + sym_symbol + e_symbol + arc_symbol + swash_symbol + '</svg>')

qr_js = 'const QR = ' + repr({'wa': qr_wa, 'vcard': qr_vc}).replace("'", '"') + ';\n'
# repr con virgolette doppie: sicuro solo se le stringhe non contengono virgolette doppie non escapate
qr_js = 'const QR = {wa: %s, vcard: %s};\n' % (
    '`' + qr_wa.replace('`', '') + '`', '`' + qr_vc.replace('`', '') + '`')

head = read('head.html')
css = read('styles.css')
shell = read('shell.html')
asset_js = 'const ASSET = {logoVB: "%s", eVB: "0 0 %s %s"};\n' % (vb, x1 - x0, y1 - y0)
# fotografie (preparate con prepara_foto.py nella cartella img/ accanto alla pagina)
foto = json.load(open(os.path.join(HERE, 'foto.json'), encoding='utf-8'))
foto_js = 'const FOTO = %s;\n' % json.dumps(
    {k: {'alt': v['alt'], 'by': v['fotografo'], 'url': 'https://unsplash.com/photos/' + v['pagina']} for k, v in foto.items()},
    ensure_ascii=False)
js = asset_js + foto_js + qr_js + read('content.js') + '\n' + read('app.js') + '\n' + read('tools.js') + '\n' + read('pages.js') + '\n' + read('boot.js')

out = (head + '<style>\n' + css + '\n</style>\n' + sprite + '\n' + shell
       + '\n<script>\n"use strict";\n' + js + '\n</script>\n')

target = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'sito-treart-evolution.html')
with open(target, 'w', encoding='utf-8') as f:
    f.write(out)
print('ok', target, f'{len(out)/1024:.0f} KB')
