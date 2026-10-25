#!/usr/bin/env bash
# Eseguito su SiteGround via SSH, sul sito attuale (WordPress) di treart-evolution.com.
#   ispeziona DOMINIO
#       sola lettura: cartelle, WordPress, tema, plugin e dove compare «key4energy»
#   rimuovi-link DOMINIO TESTO
#       copia del database, poi toglie dai dati degli articoli (modelli Bricks) le voci con un link che contiene TESTO
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

  elenca-indirizzi)
    # sola lettura: tutti gli indirizzi pubblici del sito WordPress, per preparare i reindirizzamenti
    echo "== Contenuti pubblicati (tipo, indirizzo, titolo) =="
    wp eval '
      $tipi = array_diff(get_post_types(["public" => true]), ["attachment"]);
      foreach (get_posts(["post_type" => array_values($tipi), "post_status" => "publish", "numberposts" => -1, "orderby" => "type"]) as $p) {
        echo $p->post_type, "\t", get_permalink($p), "\t", $p->post_title, "\n";
      }
      foreach (get_taxonomies(["public" => true]) as $tx) {
        foreach (get_terms(["taxonomy" => $tx, "hide_empty" => true]) as $t) { $l = get_term_link($t); if (is_wp_error($l)) { continue; } echo "tassonomia:$tx\t", $l, "\t", $t->name, "\n"; }
      }
    ' 2>&1 | head -n 300
    echo
    echo "== Mappa del sito (sitemap) =="
    for sm in $(curl -sS -m 30 -L "https://$DOM/sitemap_index.xml" 2>/dev/null | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g'); do
      echo "# $sm"
      curl -sS -m 30 -L "$sm" 2>/dev/null | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' | head -n 200
    done
    ;;

  backup)
    # backup completo: tutti i file della cartella del sito + database + istruzioni, in un unico archivio
    B="$HOME/backup-sito-attuale"
    mkdir -p "$B" && chmod 700 "$B"
    T=$(TZ=Europe/Rome date +%Y%m%d-%H%M)
    NOME="backup-completo-$DOM-$T"
    W=$(mktemp -d "$HOME/tmp-backup-XXXXXX")
    mkdir -p "$W/$NOME/database"
    echo "Cartella del sito: $HOME/www/$DOM ($(du -sh "$HOME/www/$DOM" 2>/dev/null | cut -f1), $(find "$HOME/www/$DOM" -type f 2>/dev/null | wc -l) file)"
    if ! wp db export "$W/$NOME/database/$DOM.sql" --quiet 2>/dev/null; then
      echo "ERRORE: esportazione del database non riuscita"
      rm -rf "$W"
      exit 2
    fi
    echo "Database esportato: $(du -h "$W/$NOME/database/$DOM.sql" | cut -f1), $(grep -c '^CREATE TABLE' "$W/$NOME/database/$DOM.sql") tabelle"
    cat > "$W/$NOME/LEGGIMI.txt" <<EOF
Backup completo del sito $DOM
Creato il $(TZ=Europe/Rome date '+%d/%m/%Y alle %H:%M') dal server SiteGround.

Contenuto
- sito/            tutti i file della cartella $HOME/www/$DOM (public_html compresa):
                   WordPress $(wp core version 2>/dev/null), tema $(wp theme list --status=active --field=name 2>/dev/null), plugin, immagini caricate, wp-config.php, .htaccess
- database/$DOM.sql   copia completa del database di WordPress (tutte le tabelle)

Attenzione: wp-config.php contiene le credenziali del database e il database contiene
gli utenti del sito. Conserva questo archivio in un posto sicuro.

Come ripristinare
1. Carica il contenuto di sito/public_html nella cartella pubblica del sito.
2. Crea un database vuoto e importa database/$DOM.sql (per esempio con phpMyAdmin).
3. Se nome, utente o password del database cambiano, aggiornali in wp-config.php.
EOF
    if ! tar -czf "$B/$NOME.tar.gz" -C "$HOME/www" --transform "s|^$DOM|$NOME/sito|" "$DOM" -C "$W" "$NOME" 2>"$W/tar.err"; then
      echo "ERRORE: creazione dell'archivio non riuscita: $(head -c 300 "$W/tar.err")"
      rm -rf "$W" "$B/$NOME.tar.gz"
      exit 2
    fi
    rm -rf "$W"
    chmod 600 "$B/$NOME.tar.gz"
    if tar -tzf "$B/$NOME.tar.gz" > /dev/null 2>&1; then
      echo "Archivio verificato: $(tar -tzf "$B/$NOME.tar.gz" | wc -l) elementi"
    else
      echo "ERRORE: l'archivio creato non si legge correttamente"
      exit 2
    fi
    echo "Dimensione: $(du -h "$B/$NOME.tar.gz" | cut -f1)"
    echo "SHA256=$(sha256sum "$B/$NOME.tar.gz" | cut -d' ' -f1)"
    echo "ARCHIVIO=$B/$NOME.tar.gz"
    ;;

  rimuovi-link)
    # toglie dai modelli di Bricks (e da ogni altro dato salvato negli articoli) le voci con un link che contiene il testo indicato
    AGO=${1:-}
    if [ -z "$AGO" ]; then
      echo "ERRORE: manca il testo del link da togliere"
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
    AGO="$AGO" wp eval '
      global $wpdb;
      $ago = getenv("AGO");
      $righe = $wpdb->get_results($wpdb->prepare("SELECT meta_id, post_id, meta_key FROM {$wpdb->postmeta} WHERE meta_value LIKE %s", "%" . $wpdb->esc_like($ago) . "%"));
      $tolte = 0;
      foreach ($righe as $r) {
        $m = get_metadata_by_mid("post", $r->meta_id);
        if (!$m) { continue; }
        $cambiato = false;
        $pulisci = function ($a) use (&$pulisci, $ago, &$cambiato, &$tolte) {
          if (!is_array($a)) { return $a; }
          $lista = $a === [] || array_keys($a) === range(0, count($a) - 1);
          $out = [];
          foreach ($a as $k => $v) {
            if (is_array($v) && isset($v["link"]["url"]) && is_string($v["link"]["url"]) && stripos($v["link"]["url"], $ago) !== false) {
              $cambiato = true; $tolte++; continue;
            }
            $out[$k] = $pulisci($v);
          }
          return $lista ? array_values($out) : $out;
        };
        $nuovo = $pulisci($m->meta_value);
        if ($cambiato) {
          $wpdb->update($wpdb->postmeta, ["meta_value" => maybe_serialize($nuovo)], ["meta_id" => (int) $r->meta_id], ["%s"], ["%d"]);
          wp_cache_delete((int) $r->post_id, "post_meta");
          echo "Tolto da meta_id {$r->meta_id} (articolo {$r->post_id}, {$r->meta_key})\n";
        } else {
          echo "Nessuna voce con link da togliere in meta_id {$r->meta_id} (articolo {$r->post_id}, {$r->meta_key})\n";
        }
      }
      echo "Voci tolte: $tolte\n";
    ' 2>&1 | tail -n 30
    wp cache flush 2>/dev/null && echo "Cache di WordPress svuotata"
    echo
    echo "== Verifica: «$AGO» ancora presente negli articoli =="
    wp db search "$AGO" --all-tables-with-prefix --stats 2>&1 | tail -n 10
    echo
    echo "== Pagina iniziale: link ai social =="
    curl -sS -m 30 -L "https://$DOM/" 2>/dev/null | grep -o -E 'https?://(www\.)?(instagram|linkedin|facebook)\.com/[^"'"'"' <>]*' | sort | uniq -c
    ;;

  *)
    echo "ERRORE: azione «$AZ» sconosciuta"
    exit 2
    ;;
esac
