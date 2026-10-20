# Eseguito sul server SiteGround: fa in modo che la cache dinamica di SiteGround
# non conservi le pagine HTML, così ogni pubblicazione si vede subito.
# Aggiunge un blocco in fondo a .htaccess solo se non c'è già; il resto del file non viene toccato.
# Argomento: cartella del sito.
cd "$1" || exit 1
MARK="# treart: pagine sempre aggiornate"
if [ -f .htaccess ] && grep -qF "$MARK" .htaccess; then
  echo "Regola anti-cache per le pagine già presente in .htaccess"
  exit 0
fi
if [ -f .htaccess ] && [ ! -e .htaccess.prima-di-treart ]; then
  cp -p .htaccess .htaccess.prima-di-treart
fi
cat >> .htaccess <<'EOF'

# treart: pagine sempre aggiornate
# La cache dinamica di SiteGround non conserva le pagine HTML: ogni pubblicazione si vede subito.
<IfModule mod_headers.c>
  <FilesMatch "\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
# fine treart
EOF
echo "Aggiunta a .htaccess la regola anti-cache per le pagine"
