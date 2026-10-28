#!/usr/bin/env bash
# Eseguito su SiteGround via SSH: passaggio di treart-evolution.com dal sito WordPress al nuovo sito.
#   controlla DOMINIO
#       sola lettura: cosa c'è oggi nella cartella del sito, cosa verrebbe conservato, come risponde il sito
#   pubblica DOMINIO
#       mette online il nuovo sito, già caricato e verificato in ~/www/DOMINIO/nuovo-sito-in-arrivo.
#       La prima volta sposta tutti i file di WordPress in ~/www/DOMINIO/wordpress-archiviato-DATA
#       (fuori da public_html, quindi non raggiungibili dal web); il database di WordPress non viene toccato.
#       Le volte successive aggiorna i file del nuovo sito (la versione precedente resta in sito-statico-precedente).
#       Se dopo il passaggio la pagina iniziale non risponde, rimette subito online WordPress.
#   ripristina DOMINIO [wordpress-archiviato-DATA]
#       rimette online il sito WordPress archiviato (il nuovo sito va in ~/www/DOMINIO/sito-statico-ritirato-DATA)
set -uo pipefail
AZ=${1:-controlla}
DOM=${2:-treart-evolution.com}
BASE="$HOME/www/$DOM"
D="$BASE/public_html"
ARRIVO="$BASE/nuovo-sito-in-arrivo"
STATO="$BASE/STATO-SITO.txt"
T=$(TZ=Europe/Rome date +%Y%m%d-%H%M%S)
QUANDO=$(TZ=Europe/Rome date '+%d/%m/%Y alle %H:%M')
# da conservare nella cartella pubblica anche con il nuovo sito: verifiche di Google e Bing, certificati
TIENI=(.well-known 'google*.html' 'BingSiteAuth.xml' 'yandex_*.html')
shopt -s nullglob

if [ ! -d "$D" ]; then
  echo "ERRORE: cartella $D non trovata"
  exit 2
fi

tipo_sito() {
  if [ -f "$D/wp-config.php" ]; then echo wordpress
  elif [ -f "$D/index.html" ] && grep -q 'const PROD = true;' "$D/index.html"; then echo nuovo-sito
  elif [ -z "$(ls -A "$D")" ]; then echo vuota
  else echo altro
  fi
}

ultimo_archivio() {  # cartella dell'ultimo sito WordPress archiviato (vuoto se non ce n'è)
  local a=("$BASE"/wordpress-archiviato-*)
  [ ${#a[@]} -gt 0 ] && printf '%s\n' "${a[@]}" | LC_ALL=C sort | tail -n 1
}

sposta_tutto() {  # sposta tutto il contenuto (file nascosti compresi) dalla cartella $1 alla cartella $2
  find "$1" -mindepth 1 -maxdepth 1 -exec mv -t "$2" -- {} +
  [ -z "$(ls -A "$1")" ]
}

svuota_cache() {  # $1: cartella di WordPress (attiva o archiviata) da cui usare il plugin di SiteGround
  if [ -f "$1/wp-config.php" ] && command -v wp >/dev/null 2>&1 \
     && wp --path="$1" --skip-plugins --skip-themes plugin is-active sg-cachepress >/dev/null 2>&1 \
     && wp --path="$1" sg purge >/dev/null 2>&1; then
    echo "Cache di SiteGround svuotata"
  else
    echo "Cache di SiteGround: svuotamento automatico non disponibile (plugin Speed Optimizer non attivo); la verifica qui sotto dice se serve farlo da Site Tools"
  fi
}

risposta() {  # codice HTTP e impronta della pagina $1 vista dal server; $2 = file dove salvarla
  local code
  for _ in 1 2 3; do
    code=$(curl -sS -m 30 -o "$2" -w '%{http_code}' "$1" 2>/dev/null)
    [ "${code:-000}" != 000 ] && break
    sleep 5
  done
  echo "${code:-000}"
}

reindirizzamento() {  # stato e destinazione di un indirizzo, senza seguirlo
  local r
  r=$(curl -sS -m 30 -o /dev/null -w '%{http_code} %{redirect_url}' "$1" 2>/dev/null)
  echo "${r:-000}"
}

scrivi_stato() {
  { echo "Aggiornato il $QUANDO"; printf '%s\n' "$@"; } > "$STATO"
  chmod 600 "$STATO"
}

case "$AZ" in
  controlla)
    echo "Cartella del sito: $D"
    echo "Contenuto attuale: $(tipo_sito) ($(du -sh "$D" 2>/dev/null | cut -f1), $(find "$D" -type f | wc -l) file)"
    echo
    echo "== File e cartelle in public_html =="
    ls -lAgo "$D" | head -n 80
    echo
    if [ -f "$D/.htaccess" ]; then
      echo "== .htaccess attuale, $(wc -l < "$D/.htaccess") righe (resterà nell'archivio di WordPress) =="
      sed -n '1,400p' "$D/.htaccess"
      echo
    fi
    if [ -f "$D/.user.ini" ]; then
      echo "== .user.ini attuale =="
      cat "$D/.user.ini"
      echo
    fi
    echo "== Da conservare nella cartella pubblica anche con il nuovo sito =="
    trovati=0
    for p in "${TIENI[@]}"; do
      for x in "$D"/$p; do [ -e "$x" ] && { echo "- $(basename "$x")"; trovati=1; }; done
    done
    [ "$trovati" = 1 ] || echo "(niente)"
    echo
    if [ "$(tipo_sito)" = wordpress ] && command -v wp >/dev/null 2>&1; then
      W=(wp --path="$D" --skip-plugins --skip-themes)
      echo "WordPress $("${W[@]}" core version 2>/dev/null) · plugin attivi: $("${W[@]}" plugin list --status=active --field=name 2>/dev/null | tr '\n' ' ')"
      if "${W[@]}" plugin is-active sg-cachepress >/dev/null 2>&1; then
        echo "Plugin Speed Optimizer di SiteGround attivo: la cache si potrà svuotare in automatico"
      else
        echo "Plugin Speed Optimizer di SiteGround non attivo: la cache andrà svuotata da Site Tools se serve"
      fi
    fi
    a=("$BASE"/wordpress-archiviato-*)
    echo "Archivi di WordPress già presenti: ${#a[@]}$([ ${#a[@]} -gt 0 ] && printf ' (%s)' "$(printf '%s ' "${a[@]##*/}")")"
    echo "Altre cartelle in $BASE: $(ls -A "$BASE" | tr '\n' ' ')"
    [ -f "$STATO" ] && { echo; echo "== Stato registrato =="; cat "$STATO"; }
    echo
    echo "== Come risponde oggi il sito (visto dal server, senza seguire i reindirizzamenti) =="
    for u in "https://$DOM/" "http://$DOM/" "https://www.$DOM/" "http://www.$DOM/" \
             "https://$DOM/contatti/" "https://$DOM/wp-includes/js/jquery/jquery.min.js" "http://$DOM/wp-includes/js/jquery/jquery.min.js"; do
      h=$(curl -sS -m 30 -o /dev/null -D - "$u" 2>&1 | tr -d '\r' | grep -i -E '^(HTTP/|location:|x-proxy-cache:|curl:)' | tr '\n' ' ')
      echo "$u -> ${h:-nessuna risposta}"
    done
    echo
    echo "== Codici di verifica e statistiche nella pagina iniziale attuale (da portare nel nuovo sito se servono) =="
    curl -sS -m 30 "https://$DOM/" 2>/dev/null | grep -o -i -E '<meta[^>]*(google-site-verification|msvalidate\.01|yandex-verification|p:domain_verify|facebook-domain-verification)[^>]*>|googletagmanager\.com/[a-z/.]*\?id=[A-Z0-9-]+|G-[A-Z0-9]{6,12}|GTM-[A-Z0-9]{4,10}|UA-[0-9]+-[0-9]+' | sort -u | head -n 20
    echo "(fine elenco)"
    echo
    echo "== Per confronto: una pagina statica sullo stesso server (anteprima) =="
    for u in "https://fabio.$DOM/" "https://fabio.$DOM/robots.txt" "https://fabio.$DOM/inesistente/"; do
      h=$(curl -sS -m 30 -o /dev/null -D - "$u" 2>&1 | tr -d '\r' | grep -i -E '^(HTTP/|location:|x-proxy-cache:|cache-control:|expires:|curl:)' | tr '\n' ' ')
      echo "$u -> ${h:-nessuna risposta}"
    done
    ;;

  pubblica)
    if [ ! -f "$ARRIVO/index.html" ] || ! grep -q 'const PROD = true;' "$ARRIVO/index.html" || [ ! -f "$ARRIVO/.htaccess" ]; then
      echo "ERRORE: in $ARRIVO non c'è la versione di produzione completa del nuovo sito: nessuna modifica fatta"
      exit 2
    fi
    tipo=$(tipo_sito)
    echo "Contenuto attuale di public_html: $tipo"
    case "$tipo" in
      wordpress)
        ARCH="$BASE/wordpress-archiviato-$T"
        B="$HOME/backup-sito-attuale"
        mkdir -p "$B" && chmod 700 "$B"
        F="$B/db-prima-del-nuovo-sito-$T.sql"
        if ! wp --path="$D" --skip-plugins --skip-themes db export "$F" --quiet 2>/dev/null; then
          echo "ERRORE: copia del database non riuscita: nessuna modifica fatta"
          exit 2
        fi
        chmod 600 "$F"
        echo "Copia di sicurezza del database: $F ($(du -h "$F" | cut -f1)); il database non viene modificato"
        mkdir "$ARCH" || exit 2
        if ! sposta_tutto "$D" "$ARCH"; then
          sposta_tutto "$ARCH" "$D"; rmdir "$ARCH"
          echo "ERRORE: non è stato possibile spostare tutti i file di WordPress: sito lasciato com'era"
          exit 2
        fi
        echo "Sito WordPress (tutti i file) archiviato in $ARCH, fuori da public_html"
        if ! cp -a "$ARRIVO"/. "$D"/; then
          S="$BASE/scarto-$T"; mkdir -p "$S"; sposta_tutto "$D" "$S"; sposta_tutto "$ARCH" "$D"; rmdir "$ARCH"
          echo "ERRORE: copia del nuovo sito non riuscita: WordPress rimesso online com'era (file parziali in $S)"
          exit 2
        fi
        for p in "${TIENI[@]}"; do
          for x in "$ARCH"/$p; do
            [ -e "$x" ] || continue
            [ -e "$D/$(basename "$x")" ] || { cp -a "$x" "$D"/ && echo "Conservato nella cartella pubblica: $(basename "$x")"; }
          done
        done
        scrivi_stato "Online: nuovo sito (pubblicato il $QUANDO)" \
          "File di WordPress archiviati in: $ARCH" \
          "Copia del database di WordPress: $F (il database è rimasto com'era)" \
          "Per tornare a WordPress: workflow «Sito attuale», azione ripristina-wordpress"
        CACHE_DA="$ARCH"
        ;;
      nuovo-sito)
        P="$BASE/sito-statico-precedente"
        rm -rf "$P" && cp -a "$D" "$P"
        if ! cp -a "$ARRIVO"/. "$D"/; then
          echo "ERRORE: aggiornamento non riuscito; la versione precedente è in $P"
          exit 2
        fi
        echo "Nuovo sito aggiornato (la versione precedente resta in $P)"
        # file pubblicati la volta prima e non più nel sito (pagine tolte, file vecchi): si tolgono anche online.
        # Elenco in $BASE/file-pubblicati.txt, fuori da public_html; verifiche di Google/Bing e .well-known restano.
        ELENCO="$BASE/file-pubblicati.txt"
        NUOVO_ELENCO=$(cd "$ARRIVO" && find . -type f | sed 's|^\./||' | LC_ALL=C sort)
        # immagini di prova finite online per errore il 28 ottobre 2026, prima che esistesse l'elenco
        VECCHI=$( { [ -f "$ELENCO" ] && cat "$ELENCO"; printf '%s\n' d-cybersecurity.png d-formule.png m-cybersecurity.png m-formule.png; } | LC_ALL=C sort -u)
        tolti=0
        while IFS= read -r f; do
          [ -n "$f" ] || continue
          case "$f" in .well-known/*|google*.html|BingSiteAuth.xml|yandex_*.html) continue ;; esac
          if ! grep -qxF -- "$f" <<<"$NUOVO_ELENCO" && [ -f "$D/$f" ]; then
            rm -f -- "$D/$f" && tolti=$((tolti + 1))
            d=$(dirname -- "$f")
            [ "$d" != "." ] && ( cd "$D" && rmdir -p --ignore-fail-on-non-empty -- "$d" 2>/dev/null )
          fi
        done <<<"$VECCHI"
        printf '%s\n' "$NUOVO_ELENCO" > "$ELENCO"
        echo "File non più nel sito tolti dalla cartella pubblica: $tolti"
        CACHE_DA=$(ultimo_archivio)
        ;;
      *)
        echo "ERRORE: in public_html non c'è né WordPress né il nuovo sito: nessuna modifica fatta"
        ls -lAgo "$D" | head -n 30
        exit 2
        ;;
    esac
    rm -rf "$ARRIVO"
    svuota_cache "${CACHE_DA:-}"

    echo
    echo "== Verifica dal server =="
    tmp=$(mktemp)
    atteso=$(sha256sum < "$D/index.html" | cut -d' ' -f1)
    code=$(risposta "https://$DOM/?verifica=$T" "$tmp")
    if [ "$code" = 200 ] && [ "$(sha256sum < "$tmp" | cut -d' ' -f1)" = "$atteso" ]; then
      echo "Pagina iniziale: online il nuovo sito (HTTP 200)"
    elif [ "$code" = 000 ]; then
      echo "ATTENZIONE: il server non riesce a leggere https://$DOM/ (nessuna risposta): verifica da un browser"
    elif [ "$code" -ge 500 ] || [ "$code" = 403 ] || [ "$code" = 404 ]; then
      S="$BASE/scarto-$T"; mkdir -p "$S"; sposta_tutto "$D" "$S"
      if [ "$tipo" = wordpress ]; then
        echo "ERRORE: la pagina iniziale risponde HTTP $code: rimetto online WordPress"
        sposta_tutto "$ARCH" "$D"; rmdir "$ARCH"
        svuota_cache "$D"
        scrivi_stato "Online: WordPress (la pubblicazione del $QUANDO non è riuscita: HTTP $code)" \
          "File del nuovo sito spostati in: $S" "Copia del database: $F"
        echo "WordPress di nuovo online, com'era prima; file del nuovo sito in $S"
      else
        echo "ERRORE: la pagina iniziale risponde HTTP $code: rimetto online la versione precedente del nuovo sito"
        cp -a "$P"/. "$D"/
        svuota_cache "${CACHE_DA:-}"
        echo "Versione precedente di nuovo online; file non riusciti in $S"
      fi
      rm -f "$tmp"
      exit 2
    else
      echo "ATTENZIONE: la pagina iniziale risponde HTTP $code ma non è quella appena pubblicata"
    fi
    code=$(risposta "https://$DOM/" "$tmp")
    if [ "$code" = 200 ] && [ "$(sha256sum < "$tmp" | cut -d' ' -f1)" = "$atteso" ]; then
      echo "Indirizzo normale (con la cache di SiteGround): nuovo sito"
    else
      echo "ATTENZIONE: all'indirizzo normale risponde ancora la pagina precedente (HTTP $code), probabilmente dalla cache di SiteGround: svuotala in Site Tools > Speed > Caching > Dynamic Cache"
    fi
    rm -f "$tmp"
    for p in robots.txt sitemap.xml og-image.png privacy-app.html; do
      echo "/$p: HTTP $(curl -sS -m 30 -o /dev/null -w '%{http_code}' "https://$DOM/$p" 2>/dev/null || echo 000)"
    done
    for p in contatti/ backup-il-vero-salvavita-dei-tuoi-dati/ category/reti-e-connettivita/ wp-login.php sitemap_index.xml; do
      echo "/$p -> $(reindirizzamento "https://$DOM/$p")"
    done
    echo "http://$DOM/ -> $(reindirizzamento "http://$DOM/")"
    echo "https://www.$DOM/ -> $(reindirizzamento "https://www.$DOM/")"
    ;;

  ripristina)
    NOME=${3:-}
    if [ -n "$NOME" ]; then
      [[ "$NOME" =~ ^wordpress-archiviato-[0-9-]+$ ]] || { echo "ERRORE: nome di archivio non valido: $NOME"; exit 2; }
      ARCH="$BASE/$NOME"
    else
      ARCH=$(ultimo_archivio)
    fi
    if [ -z "$ARCH" ] || [ ! -f "$ARCH/wp-config.php" ]; then
      echo "ERRORE: nessun sito WordPress archiviato da rimettere online: nessuna modifica fatta"
      exit 2
    fi
    tipo=$(tipo_sito)
    if [ "$tipo" != nuovo-sito ] && [ "$tipo" != vuota ]; then
      echo "ERRORE: in public_html c'è «$tipo», non il nuovo sito: nessuna modifica fatta"
      exit 2
    fi
    R="$BASE/sito-statico-ritirato-$T"
    mkdir "$R" || exit 2
    if ! sposta_tutto "$D" "$R"; then
      sposta_tutto "$R" "$D"; rmdir "$R"
      echo "ERRORE: non è stato possibile spostare i file del nuovo sito: nessuna modifica fatta"
      exit 2
    fi
    if ! sposta_tutto "$ARCH" "$D"; then
      echo "ERRORE: WordPress non rimesso del tutto in public_html: controlla $ARCH e $D"
      exit 2
    fi
    rmdir "$ARCH"
    echo "WordPress rimesso online da $ARCH; il nuovo sito è in $R"
    scrivi_stato "Online: WordPress (rimesso online il $QUANDO)" "File del nuovo sito ritirato: $R"
    svuota_cache "$D"
    tmp=$(mktemp)
    code=$(risposta "https://$DOM/?verifica=$T" "$tmp")
    if [ "$code" = 200 ] && grep -q 'wp-content' "$tmp"; then
      echo "Verifica: la pagina iniziale è di nuovo quella di WordPress (HTTP 200)"
    else
      echo "ATTENZIONE: la pagina iniziale risponde HTTP $code: verifica da un browser"
    fi
    rm -f "$tmp"
    ;;

  *)
    echo "ERRORE: azione «$AZ» sconosciuta"
    exit 2
    ;;
esac
