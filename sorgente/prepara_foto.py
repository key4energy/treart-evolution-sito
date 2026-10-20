"""Prepara le foto del sito a partire dagli originali scaricati da Unsplash.

Uso: python3 prepara_foto.py CARTELLA_ORIGINALI CARTELLA_USCITA
  CARTELLA_ORIGINALI  le foto candidate (ramo foto-candidate, cartella foto/candidate)
  CARTELLA_USCITA     di solito ../public/img

Per ogni voce di foto.json: ritaglio 3:2 attorno al punto di fuoco, leggera
correzione verso toni caldi (colore un po' più morbido, rossi appena più caldi),
due misure WebP (1600 e 800 px di larghezza).
"""
import json
import os
import sys

from PIL import Image, ImageEnhance, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
FOTO = json.load(open(os.path.join(HERE, 'foto.json'), encoding='utf-8'))
SIZES = ((1600, 76), (800, 74))
RATIO = 3 / 2


def crop_32(im, fx, fy):
    w, h = im.size
    if w / h > RATIO:
        nw, nh = round(h * RATIO), h
    else:
        nw, nh = w, round(w / RATIO)
    x = min(max(round(fx * w - nw / 2), 0), w - nw)
    y = min(max(round(fy * h - nh / 2), 0), h - nh)
    return im.crop((x, y, x + nw, y + nh))


def warm(im, colore):
    im = ImageEnhance.Color(im).enhance(colore)
    r, g, b = im.split()
    r = r.point(lambda v: min(255, round(v * 1.018 + 1)))
    b = b.point(lambda v: round(v * 0.972))
    im = Image.merge('RGB', (r, g, b))
    return ImageEnhance.Contrast(im).enhance(1.03)


totale = 0
for slug, f in FOTO.items():
    im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, f['codice'] + '.jpg'))).convert('RGB')
    im = warm(crop_32(im, *f['fuoco']), f.get('colore', 0.93))
    for w, q in SIZES:
        out = os.path.join(OUT, f'{slug}-{w}.webp')
        im.resize((w, round(w / RATIO)), Image.LANCZOS).save(out, 'WEBP', quality=q, method=6)
        totale += os.path.getsize(out)
print(f'{len(FOTO)} foto, {len(FOTO) * len(SIZES)} file, {totale / 1024 / 1024:.1f} MB')
