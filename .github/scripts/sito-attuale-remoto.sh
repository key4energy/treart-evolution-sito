#!/usr/bin/env bash
# Eseguito su SiteGround via SSH, sul sito attuale (WordPress) di treart-evolution.com.
#   ispeziona DOMINIO
#       sola lettura: cartelle, WordPress, tema, plugin e dove compare «key4energy»
#   sostituisci DOMINIO VECCHIO1 NUOVO1 [VECCHIO2 NUOVO2 ...]
#       copia del database in ~/backup-sito-attuale, poi sostituzione dei testi
#       (anche nella forma con le barre protette, come le salva Elementor) e svuotamento delle cache
set -uo pipefail
AZ=${1:-ispeziona}
DOM=${2:-treart-evolution.com}
shift 2 2>/dev/null || true

D=~/www/$DOM/public_html
echo "Siti presenti in ~/www: $(ls -1 ~/www 2>/dev/null | tr '\n' ' ')"
if [ ! -d "$D" ]; then
  echo "ERRORE: cartella $D non trovata"
  exit 2
fi
cd "$D" || exit 2
echo "Cartella: $D"

if [ ! -f wp-config.php ]; then
  echo "WordPress: non trovato (nessun wp-config.php)"
  echo "File che contengono key4energy:"
  grep -rIl 'key4energy' . 2>/dev/null | head -n 30
  exit 0
fi
if ! command -v wp >/dev/null 2>&1; then
  echo "ERRORE: wp-cli non disponibile"
  exit 2
fi
WP=(wp --skip-themes --skip-plugins --quiet)

case "$AZ" in
  ispeziona)
    echo "WordPress $(wp core version 2>/dev/null) · indirizzo $(wp option get home 2>/dev/null)"
    echo "Tema attivo: $(wp theme list --status=active --field=name 2>/dev/null)"
    echo "Plugin attivi: $(wp plugin list --status=active --field=name 2>/dev/null | tr '\n' ' ')"
    echo
    echo "== key4energy nel database (riepilogo) =="
    wp db search 'key4energy' --all-tables-with-prefix --stats 2>&1 | tail -n 40
    echo
    echo "== key4energy nel database (contesto) =="
    wp db search 'key4energy' --all-tables-with-prefix --before_context=70 --after_context=50 2>&1 | head -n 60
    echo
    echo "== Collegamenti nei menu =="
    for m in $(wp menu list --field=term_id 2>/dev/null); do
      wp menu item list "$m" --fields=db_id,title,link --format=csv 2>/dev/null | grep -i -E 'key4energy|instagram|linkedin|facebook'
    done
    echo
    echo "== File del sito che contengono key4energy (escluse le immagini) =="
    grep -rIl 'key4energy' wp-content/themes wp-content/plugins wp-content/uploads 2>/dev/null | grep -v -E '\.(jpg|jpeg|png|webp|gif|svg)$' | head -n 30
    echo
    echo "== Pagina iniziale: link ai social =="
    curl -sS -m 30 -L "https://$DOM/" 2>/dev/null | grep -o -E 'https?://(www\.)?(instagram|linkedin|facebook)\.com/[^"'"'"' <>]*' | sort | uniq -c
    ;;

  sostituisci)
    if [ $(( $# % 2 )) -ne 0 ] || [ $# -eq 0 ]; then
      echo "ERRORE: servono coppie VECCHIO NUOVO"
      exit 2
    fi
    B=~/backup-sito-attuale
    mkdir -p "$B" && chmod 700 "$B"
    F="$B/db-$(date +%Y%m%d-%H%M%S).sql"
    if ! wp db export "$F" --quiet 2>/dev/null; then
      echo "ERRORE: copia del database non riuscita: nessuna modifica fatta"
      exit 2
    fi
    chmod 600 "$F"
    echo "Copia del database salvata in $F ($(du -h "$F" | cut -f1))"
    while [ $# -gt 0 ]; do
      VECCHIO=$1 NUOVO=$2
      shift 2
      for forma in semplice protetta; do
        if [ "$forma" = protetta ]; then
          V=${VECCHIO//\//\\/}; N=${NUOVO//\//\\/}
        else
          V=$VECCHIO; N=$NUOVO
        fi
        [ "$forma" = protetta ] && [ "$V" = "$VECCHIO" ] && continue
        echo "-- «$V» → «$N»"
        wp search-replace "$V" "$N" --all-tables-with-prefix --precise --report-changed-only 2>&1 | tail -n 15
      done
    done
    wp cache flush 2>/dev/null && echo "Cache di WordPress svuotata"
    if wp plugin is-active elementor 2>/dev/null; then
      wp elementor flush-css 2>/dev/null && echo "CSS di Elementor rigenerato"
    fi
    if wp plugin is-active sg-cachepress 2>/dev/null; then
      wp sg purge 2>/dev/null && echo "Cache di SiteGround svuotata"
    fi
    echo
    echo "== Verifica: key4energy ancora presente nel database =="
    wp db search 'key4energy' --all-tables-with-prefix --stats 2>&1 | tail -n 20
    echo
    echo "== Pagina iniziale: link ai social =="
    curl -sS -m 30 -L "https://$DOM/" 2>/dev/null | grep -o -E 'https?://(www\.)?(instagram|linkedin|facebook)\.com/[^"'"'"' <>]*' | sort | uniq -c
    ;;

  *)
    echo "ERRORE: azione «$AZ» sconosciuta"
    exit 2
    ;;
esac
