#!/usr/bin/env bash
# Manutenzione del sito attuale treart-evolution.com (WordPress su SiteGround) via SSH.
# Una richiesta è un file JSON in manutenzione/richieste/, aggiunto con un commit sul ramo main:
#   {"azione": "ispeziona"}
#   {"azione": "sostituisci", "approvata_da": "...", "sostituzioni": [["vecchio", "nuovo"], ...]}
#   {"azione": "rimuovi-link", "approvata_da": "...", "link": "linkedin.com/company/..."}
#   {"azione": "backup"}   backup completo (file e database), scaricabile dalla pagina dell'esecuzione su GitHub
#   {"azione": "elenca-indirizzi"}   sola lettura: indirizzi pubblici del sito, per i reindirizzamenti
# Passaggio al nuovo sito (cartella produzione/, generata da sorgente/build_produzione.py):
#   {"azione": "prova-pubblicazione"}   sola lettura: controlli sulla versione di produzione e sul server
#   {"azione": "pubblica-produzione", "approvata_da": "..."}   mette online il nuovo sito su treart-evolution.com;
#       la prima volta archivia i file di WordPress fuori da public_html (database intatto)
#   {"azione": "ripristina-wordpress", "approvata_da": "...", "archivio": "wordpress-archiviato-..."}
#       rimette online WordPress (archivio facoltativo: senza, l'ultimo)
# Le modifiche si fanno solo dopo l'ok esplicito di Fabio, riportato in approvata_da;
# prima di ogni modifica viene salvata una copia del database sul server.
set -uo pipefail

stato=0
log() { printf '%s\n' "$*" | tee -a "$REPORT"; }
: > "$REPORT"
log "Sito attuale: esecuzione n. ${GITHUB_RUN_NUMBER:-?} del $(TZ=Europe/Rome date '+%d/%m/%Y %H:%M') - commit ${GITHUB_SHA:0:7}"
DOM=${DOMINIO:-treart-evolution.com}

source .github/scripts/ssh-siteground.sh

# ---------- passaggio al nuovo sito ----------
ARRIVO_REL="www/$DOM/nuovo-sito-in-arrivo"
remoto_produzione() { ssh_sg "bash -s -- $*" < .github/scripts/sito-produzione-remoto.sh 2>&1 | grep -v '^Warning: Permanently added' | tee -a "$REPORT"; return "${PIPESTATUS[0]}"; }

# righe che distinguono la pagina di produzione da quella di anteprima
normalizza() { sed -e 's/const PROD = \(true\|false\);//' -e '/<link rel="canonical"/d' -e '/p:domain_verify/d' -e '/<meta name="robots"/d' -e '/<!-- Anteprima:/d' -e '/og:url/d' -e '/og:image" content/d' "$1"; }

controlla_produzione() {  # controlli sulla cartella produzione/ del repository
  local ok=0
  if [ ! -f produzione/index.html ] || [ ! -f produzione/.htaccess ]; then
    log "ERRORE: manca la versione di produzione (cartella produzione/): va generata con sorgente/build_produzione.py"
    return 1
  fi
  grep -q 'const PROD = true;' produzione/index.html || { log "ERRORE: produzione/index.html non è la versione di produzione"; ok=1; }
  grep -qF "<link rel=\"canonical\" href=\"https://$DOM/\">" produzione/index.html || { log "ERRORE: manca l'indirizzo canonico https://$DOM/"; ok=1; }
  if grep -q 'noindex' produzione/index.html; then log "ERRORE: la versione di produzione contiene noindex"; ok=1; fi
  if cmp -s <(normalizza public/index.html) <(normalizza produzione/index.html) \
     && diff -rq public/img produzione/img >/dev/null && diff -rq public/font produzione/font >/dev/null \
     && cmp -s public/og-image.png produzione/og-image.png \
     && cmp -s public/privacy-app.html produzione/privacy-app.html && cmp -s public/condizioni-app.html produzione/condizioni-app.html; then
    log "Versione di produzione allineata all'anteprima (stessi testi, foto e pagine)"
  else
    log "ERRORE: la versione di produzione non è allineata all'anteprima: rigenerarla con sorgente/build_produzione.py"
    ok=1
  fi
  log "Versione di produzione: $(find produzione -type f | wc -l) file, $(du -sh produzione | cut -f1), $(grep -c '^RewriteRule \^[a-z]' produzione/.htaccess) reindirizzamenti dai vecchi indirizzi di WordPress"
  return $ok
}

carica_produzione() {  # copia produzione/ sul server, fuori da public_html, e la verifica
  log "Caricamento del nuovo sito in ~/$ARRIVO_REL (fuori da public_html, quindi ancora non visibile)"
  if ! tar -C produzione -czf - . | ssh_sg "cd ~ && rm -rf '$ARRIVO_REL' && mkdir -p '$ARRIVO_REL' && tar -xzf - -C '$ARRIVO_REL'"; then
    log "ERRORE: caricamento non riuscito: nessuna modifica fatta al sito"
    return 1
  fi
  local attesi sul_server
  attesi=$(cd produzione && find . -type f | LC_ALL=C sort | xargs -d '\n' sha256sum)
  sul_server=$(ssh_sg "cd ~/'$ARRIVO_REL' && find . -type f | LC_ALL=C sort | xargs -d '\n' sha256sum" 2>/dev/null)
  if [ "$attesi" != "$sul_server" ]; then
    log "ERRORE: i file caricati non corrispondono a quelli del repository: nessuna modifica fatta al sito"
    diff <(printf '%s\n' "$attesi") <(printf '%s\n' "$sul_server") | head -n 10 | tee -a "$REPORT"
    return 1
  fi
  log "Caricati e verificati $(printf '%s\n' "$attesi" | wc -l) file, identici a quelli del repository"
}

controlla_da_fuori() {  # come risponde il sito visto da GitHub (solo informativo)
  local code atteso pagina
  atteso=$(sha256sum < produzione/index.html | cut -d' ' -f1)
  pagina=$(mktemp)
  code=$(curl -sS -m 30 -o "$pagina" -w '%{http_code}' "https://$DOM/" 2>/dev/null)
  case "${code:-000}" in
    200) if [ "$(sha256sum < "$pagina" | cut -d' ' -f1)" = "$atteso" ]; then log "Visto da fuori (GitHub): online il nuovo sito"
         else log "Visto da fuori (GitHub): risponde un'altra pagina (cache o versione precedente)"; fi ;;
    202) log "Visto da fuori (GitHub): HTTP 202, verifica anti-bot di SiteGround per i server automatici (i visitatori vedono il sito normalmente)" ;;
    *) log "Visto da fuori (GitHub): HTTP ${code:-000}" ;;
  esac
  rm -f "$pagina"
}

approvazione() {  # le azioni che cambiano il sito pubblico richiedono approvata_da
  local a
  a=$(jq -r '.approvata_da // empty' "$1")
  if [ -z "$a" ]; then
    log "ERRORE: manca approvata_da: questa azione si esegue solo con il via esplicito di Fabio"
    return 1
  fi
  log "Approvazione: $a"
}

RICHIESTE=()
if [ -n "${BEFORE:-}" ] && ! [[ "$BEFORE" =~ ^0+$ ]] && git cat-file -e "$BEFORE^{commit}" 2>/dev/null; then
  mapfile -t RICHIESTE < <(git diff --name-only --diff-filter=A "$BEFORE" "$GITHUB_SHA" -- manutenzione/richieste/)
fi
if [ ${#RICHIESTE[@]} -eq 0 ]; then
  log "Nessuna nuova richiesta"
  exit 0
fi

for f in "${RICHIESTE[@]}"; do
  log ""
  log "Richiesta: $f"
  az=$(jq -r '.azione // empty' "$f" 2>/dev/null || true)
  case "$az" in
    ispeziona)
      log "== Ispezione di $DOM (sola lettura) =="
      ssh_sg "bash -s -- ispeziona '$DOM'" < .github/scripts/sito-attuale-remoto.sh 2>&1 | tee -a "$REPORT"
      [ "${PIPESTATUS[0]}" -eq 0 ] || stato=1
      ;;
    sostituisci)
      log "== Sostituzione di testi in $DOM =="
      log "Approvazione: $(jq -r '.approvata_da // "non indicata"' "$f")"
      args=()
      while IFS= read -r riga; do
        args+=("$(printf '%q' "$riga")")
      done < <(jq -r '.sostituzioni[][]' "$f")
      ssh_sg "bash -s -- sostituisci '$DOM' ${args[*]}" < .github/scripts/sito-attuale-remoto.sh 2>&1 | tee -a "$REPORT"
      [ "${PIPESTATUS[0]}" -eq 0 ] || stato=1
      ;;
    elenca-indirizzi)
      log "== Indirizzi pubblici di $DOM (sola lettura) =="
      ssh_sg "bash -s -- elenca-indirizzi '$DOM'" < .github/scripts/sito-attuale-remoto.sh 2>&1 | grep -v '^Warning: Permanently added' | tee -a "$REPORT"
      [ "${PIPESTATUS[0]}" -eq 0 ] || stato=1
      ;;
    backup)
      log "== Backup completo di $DOM (file e database) =="
      out=$(ssh_sg "bash -s -- backup '$DOM'" < .github/scripts/sito-attuale-remoto.sh 2>&1)
      rc=$?
      printf '%s\n' "$out" | grep -v -E '^(Warning: Permanently added)' | tee -a "$REPORT"
      arch=$(printf '%s\n' "$out" | sed -n 's/^ARCHIVIO=//p' | tail -n 1)
      sha=$(printf '%s\n' "$out" | sed -n 's/^SHA256=//p' | tail -n 1)
      if [ $rc -ne 0 ] || [ -z "$arch" ]; then
        log "ERRORE: backup non riuscito"
        stato=1
        continue
      fi
      mkdir -p backup
      if scp "${OPTS[@]}" -P "$PORT" "$SG_USER@$SG_HOST:$arch" backup/ 2>/dev/null || scp -O "${OPTS[@]}" -P "$PORT" "$SG_USER@$SG_HOST:$arch" backup/; then
        locale="backup/$(basename "$arch")"
        if [ "$(sha256sum "$locale" | cut -d' ' -f1)" = "$sha" ]; then
          log "Copia scaricata da SiteGround e verificata (identica a quella sul server): $(basename "$arch")"
          echo "BACKUP_NOME=$(basename "$arch" .tar.gz)" >> "$GITHUB_ENV"
        else
          log "ERRORE: la copia scaricata non corrisponde a quella sul server"
          rm -f "$locale"
          stato=1
        fi
      else
        log "ATTENZIONE: copia non scaricata da SiteGround; il backup resta comunque sul server in $arch"
        stato=1
      fi
      log "Download da GitHub: https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID} (sezione Artifacts)"
      ;;
    rimuovi-link)
      log "== Rimozione di link da $DOM =="
      log "Approvazione: $(jq -r '.approvata_da // "non indicata"' "$f")"
      ago=$(jq -r '.link // empty' "$f")
      ssh_sg "bash -s -- rimuovi-link '$DOM' $(printf '%q' "$ago")" < .github/scripts/sito-attuale-remoto.sh 2>&1 | tee -a "$REPORT"
      [ "${PIPESTATUS[0]}" -eq 0 ] || stato=1
      ;;
    prova-pubblicazione)
      log "== Prova del passaggio di $DOM al nuovo sito (sola lettura, nessuna modifica) =="
      controlla_produzione || stato=1
      log ""
      remoto_produzione controlla "'$DOM'" || stato=1
      ;;
    pubblica-produzione)
      log "== Pubblicazione del nuovo sito su $DOM =="
      approvazione "$f" || { stato=1; continue; }
      controlla_produzione || { stato=1; log "Pubblicazione annullata: nessuna modifica fatta al sito"; continue; }
      carica_produzione || { stato=1; continue; }
      remoto_produzione pubblica "'$DOM'" || stato=1
      controlla_da_fuori
      ;;
    ripristina-wordpress)
      log "== Ritorno al sito WordPress su $DOM =="
      approvazione "$f" || { stato=1; continue; }
      arch=$(jq -r '.archivio // empty' "$f")
      if [ -n "$arch" ] && ! [[ "$arch" =~ ^wordpress-archiviato-[0-9-]+$ ]]; then
        log "ERRORE: nome di archivio non valido: $arch"
        stato=1
        continue
      fi
      remoto_produzione ripristina "'$DOM'" "'$arch'" || stato=1
      ;;
    *)
      log "ERRORE: azione «$az» non riconosciuta"
      stato=1
      ;;
  esac
done
exit "$stato"
