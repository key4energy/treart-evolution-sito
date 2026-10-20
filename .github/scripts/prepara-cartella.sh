# Eseguito sul server SiteGround: individua la cartella pubblica del sito.
# Argomenti: dominio del sito, cartella indicata a mano (facoltativa).
SITE="$1"
WANT="$2"
cd ~ || exit 1
DEST=""
for d in "$WANT" "www/$SITE/public_html"; do
  if [ -n "$d" ] && [ -d "$d" ]; then DEST="$d"; break; fi
done
if [ -z "$DEST" ]; then
  echo "Cartella del sito non trovata. Cartelle disponibili:"
  ls -d www/*/public_html 2>/dev/null || ls -A
  exit 3
fi
cd "$DEST" || exit 1
if [ -e index.php ]; then
  echo "ATTENZIONE: nella cartella c'è index.php (WordPress o un'altra applicazione): index.html potrebbe non essere la pagina iniziale."
fi
if [ -f index.html ] && ! grep -q 'content="Treart Evolution"' index.html && [ ! -e index.html.originale ]; then
  cp -p index.html index.html.originale && echo "La pagina iniziale che c'era prima è stata salvata come index.html.originale"
fi
echo "CARTELLA=$DEST"
