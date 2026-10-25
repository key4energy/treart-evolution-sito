"""Versione di produzione del nuovo sito, per https://treart-evolution.com.

Genera la cartella ../produzione/ (da tenere nel repository, accanto a ../public/):
  index.html, og-image.png   come l'anteprima, ma visibili ai motori di ricerca, con indirizzo
                             canonico treart-evolution.com e senza gli strumenti dell'anteprima
  robots.txt, sitemap.xml    per i motori di ricerca
  favicon.ico, apple-touch-icon.png   icone cercate dai browser nella radice del sito
  .htaccess                  https e indirizzo senza www, reindirizzamenti permanenti dai vecchi
                             indirizzi del sito WordPress alle pagine del nuovo sito, pagine sempre aggiornate
  img/, font/, privacy-app.html, condizioni-app.html   copiati da ../public/

Uso (dopo ogni modifica del sito, insieme a «python3 build_hosting.py ../public»):
  python3 build_produzione.py
La pubblicazione su treart-evolution.com si fa solo con il workflow «Sito attuale»,
azione «pubblica-produzione», e solo dopo il via di Fabio.
"""
import os
import re
import shutil
import subprocess
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PUB = os.path.join(ROOT, 'public')
OUT = os.path.join(ROOT, 'produzione')
SITO = 'https://treart-evolution.com'
KIT = os.path.join(HERE, 'kit')

# vecchi indirizzi del sito WordPress (elenco letto dal sito il 25 ottobre 2026) → pagina del nuovo sito
REINDIRIZZI = {
    # pagine
    'contatti': 'contatti',
    'servizi': 'servizi',
    # articoli del blog → il servizio di cui parlano
    'il-valore-di-avere-un-referente-unico-per-tutta-la-tua-tecnologia': 'assistenza-informatica',
    'configurazioni-personalizzate-ogni-azienda-e-diversa': 'installazioni',
    'assistenza-informatica-quanto-tempo-ti-fa-risparmiare-davvero': 'assistenza-informatica',
    'perche-la-tecnologia-non-va-lasciata-al-caso': 'assistenza-informatica',
    'come-un-sito-ben-fatto-porta-nuovi-clienti': 'siti-web',
    'hosting-cosa-ce-dietro-la-velocita-di-un-sito': 'hosting',
    'domini-e-mail-professionali-credibilita-che-fa-la-differenza': 'email-domini',
    'il-sito-web-e-la-nuova-sede-della-tua-azienda': 'siti-web',
    'starlink-e-alternative-internet-ovunque-anche-dove-gli-altri-non-arrivano': 'connettivita',
    'centralino-voip-perche-conviene-rispetto-alla-linea-tradizionale': 'centralini-voip',
    'wi-fi-aziendale-non-basta-il-router-di-casa': 'rete-wifi',
    'connessione-lenta-ecco-quanto-costa-davvero-alla-tua-azienda': 'connettivita',
    'videosorveglianza-intelligente-protezione-h24-per-la-tua-azienda': 'videosorveglianza',
    'vpn-aziendale-lavorare-da-remoto-in-totale-sicurezza': 'vpn',
    'backup-il-vero-salvavita-dei-tuoi-dati': 'backup',
    'perche-un-antivirus-non-basta-piu': 'cybersecurity',
    # categorie del blog → il servizio o l'area corrispondente
    'category/assistenza-e-installazioni/configurazioni-personalizzate': 'installazioni',
    'category/assistenza-e-installazioni/consulenza': 'assistenza-informatica',
    'category/assistenza-e-installazioni/installazioni': 'installazioni',
    'category/assistenza-e-installazioni/supporto-tecnico': 'assistenza-informatica',
    'category/assistenza-e-installazioni': 'assistenza-informatica',
    'category/sicurezza-e-protezione/backup-nas': 'backup',
    'category/sicurezza-e-protezione/cybersecurity': 'cybersecurity',
    'category/sicurezza-e-protezione/videosorveglianza': 'videosorveglianza',
    'category/sicurezza-e-protezione/vpn-per-accesso-remoto': 'vpn',
    'category/sicurezza-e-protezione': 'cybersecurity',
    'category/reti-e-connettivita/centralini-telefonici': 'centralini-voip',
    'category/reti-e-connettivita/impianti-wi-fi': 'rete-wifi',
    'category/reti-e-connettivita/reti-internet': 'connettivita',
    'category/reti-e-connettivita': 'connettivita',
    'category/web-e-digital-solutions/creazione-siti-web': 'siti-web',
    'category/web-e-digital-solutions/gestione-domini': 'email-domini',
    'category/web-e-digital-solutions/gestione-hosting': 'hosting',
    'category/web-e-digital-solutions/servizi-mail': 'email-domini',
    'category/web-e-digital-solutions': 'siti-web',
}


def pagine_del_sito():
    """Pagine (indirizzi #...) che il nuovo sito sa mostrare."""
    with open(os.path.join(HERE, 'pages.js'), encoding='utf-8') as f:
        pages = f.read()
    with open(os.path.join(HERE, 'content.js'), encoding='utf-8') as f:
        content = f.read()
    ids = set(re.findall(r'route\("([a-z0-9-]+)"', pages))
    for lista in re.findall(r'services: \[([^\]]*)\]', content):
        ids.update(re.findall(r'"([a-z0-9-]+)"', lista))
    return ids


def htaccess():
    righe = []
    # prima gli indirizzi più lunghi, così le sottocategorie vengono prima delle categorie
    for vecchio, nuovo in sorted(REINDIRIZZI.items(), key=lambda kv: (-len(kv[0]), kv[0])):
        assert re.fullmatch(r'[a-z0-9/-]+', vecchio) and re.fullmatch(r'[a-z0-9-]+', nuovo), vecchio
        righe.append(f'RewriteRule ^{vecchio}/?$ {SITO}/#{nuovo} [R=301,L,NE,QSD]')
    return f'''# Treart Evolution: sito statico (il sito WordPress precedente è archiviato sul server, fuori da public_html)
# File generato da sorgente/build_produzione.py: le modifiche vanno fatte lì.

# pagine sempre aggiornate: la cache di SiteGround e dei browser non conserva le pagine HTML
<IfModule mod_headers.c>
  <FilesMatch "\\.(html|xml|txt)$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>

RewriteEngine On

# vecchi indirizzi del sito WordPress → pagine del nuovo sito (le pagine sono indirizzi con #),
# subito in https e senza www, con un solo reindirizzamento
{chr(10).join(righe)}

# vecchie mappe del sito → nuova mappa
RewriteRule ^(sitemap_index|page-sitemap|post-sitemap|category-sitemap|local-sitemap|wp-sitemap)\\.xml$ {SITO}/sitemap.xml [R=301,L,QSD]

# sempre https e indirizzo senza www
RewriteCond %{{HTTPS}} off
RewriteCond %{{HTTP:X-Forwarded-Proto}} !https
RewriteRule ^ {SITO}%{{REQUEST_URI}} [R=301,L]
RewriteCond %{{HTTP_HOST}} ^www\\. [NC]
RewriteRule ^ {SITO}%{{REQUEST_URI}} [R=301,L]

# tutto il resto che non esiste più (pagine di WordPress, wp-admin, wp-login.php, feed, cartelle...) → home
RewriteCond %{{REQUEST_FILENAME}} !-f
RewriteRule ^.+$ {SITO}/ [R=301,L,QSD]
'''


def main():
    pagine = pagine_del_sito()
    mancanti = sorted({p for p in REINDIRIZZI.values() if p not in pagine})
    if mancanti:
        sys.exit(f'ERRORE: reindirizzamenti verso pagine che il nuovo sito non ha: {", ".join(mancanti)}')

    shutil.rmtree(OUT, ignore_errors=True)
    os.makedirs(OUT)
    subprocess.run([sys.executable, os.path.join(HERE, 'build_hosting.py'), OUT], check=True,
                   env=dict(os.environ, TREART_PRODUZIONE='1'))
    for voce in ('img', 'font', 'privacy-app.html', 'condizioni-app.html'):
        src = os.path.join(PUB, voce)
        if os.path.isdir(src):
            shutil.copytree(src, os.path.join(OUT, voce))
        else:
            shutil.copy2(src, OUT)
    # icone cercate dai browser nella radice del sito (le pagine hanno già le icone incorporate)
    ico = Image.open(os.path.join(KIT, '01-logo', 'png', 'favicon-180.png')).convert('RGBA')
    ico.save(os.path.join(OUT, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
    shutil.copy2(os.path.join(KIT, '01-logo', 'png', 'favicon-180.png'), os.path.join(OUT, 'apple-touch-icon.png'))
    with open(os.path.join(OUT, '.htaccess'), 'w', encoding='utf-8') as f:
        f.write(htaccess())

    # controlli sulla pagina di produzione
    with open(os.path.join(OUT, 'index.html'), encoding='utf-8') as f:
        html = f.read()
    assert 'const PROD = true;' in html, 'manca const PROD = true'
    assert f'<link rel="canonical" href="{SITO}/">' in html, 'manca l\'indirizzo canonico'
    assert 'noindex' not in html, 'la pagina di produzione non deve avere noindex'
    assert 'fabio.treart-evolution.com' not in html, 'la pagina di produzione cita ancora l\'anteprima'

    n = sum(len(fs) for _, _, fs in os.walk(OUT))
    print(f'produzione pronta: {n} file in {OUT}, {len(REINDIRIZZI)} reindirizzamenti verso {len(set(REINDIRIZZI.values()))} pagine')


if __name__ == '__main__':
    main()
