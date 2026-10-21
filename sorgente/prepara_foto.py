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


def crop_ratio(im, ratio, fx, fy):
    w, h = im.size
    if w / h > ratio:
        nw, nh = round(h * ratio), h
    else:
        nw, nh = w, round(w / ratio)
    x = min(max(round(fx * w - nw / 2), 0), w - nw)
    y = min(max(round(fy * h - nh / 2), 0), h - nh)
    return im.crop((x, y, x + nw, y + nh))


def apri(codice):
    return ImageOps.exif_transpose(Image.open(os.path.join(SRC, codice + '.jpg'))).convert('RGB')


def dittico(codici, fuochi, W=2000, gap=12):
    """Due foto affiancate in un'unica immagine 3:2 (es. centralino e smartphone)."""
    H = round(W / RATIO)
    half = (W - gap) // 2
    out = Image.new('RGB', (W, H), '#FFFFFF')
    for i, (c, (fx, fy)) in enumerate(zip(codici, fuochi)):
        part = crop_ratio(apri(c), half / H, fx, fy).resize((half, H), Image.LANCZOS)
        out.paste(part, (0 if i == 0 else W - half, 0))
    return out


totale = 0
for slug, f in FOTO.items():
    if isinstance(f['codice'], list):
        im = warm(dittico(f['codice'], f['fuoco']), f.get('colore', 0.93))
    else:
        im = warm(crop_32(apri(f['codice']), *f['fuoco']), f.get('colore', 0.93))
    for w, q in SIZES:
        out = os.path.join(OUT, f'{slug}-{w}.webp')
        im.resize((w, round(w / RATIO)), Image.LANCZOS).save(out, 'WEBP', quality=q, method=6)
        totale += os.path.getsize(out)
print(f'{len(FOTO)} foto, {len(FOTO) * len(SIZES)} file, {totale / 1024 / 1024:.1f} MB')
