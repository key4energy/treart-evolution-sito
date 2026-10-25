#!/usr/bin/env bash
# Manutenzione del sito attuale treart-evolution.com (WordPress su SiteGround) via SSH.
# Una richiesta è un file JSON in manutenzione/richieste/, aggiunto con un commit sul ramo main:
#   {"azione": "ispeziona"}
#   {"azione": "sostituisci", "approvata_da": "...", "sostituzioni": [["vecchio", "nuovo"], ...]}
# Le modifiche si fanno solo dopo l'ok esplicito di Fabio, riportato in approvata_da;
# prima di ogni modifica viene salvata una copia del database sul server.
set -uo pipefail

stato=0
log() { printf '%s\n' "$*" | tee -a "$REPORT"; }
: > "$REPORT"
log "Sito attuale: esecuzione n. ${GITHUB_RUN_NUMBER:-?} del $(TZ=Europe/Rome date '+%d/%m/%Y %H:%M') - commit ${GITHUB_SHA:0:7}"
DOM=${DOMINIO:-treart-evolution.com}

source .github/scripts/ssh-siteground.sh

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
    *)
      log "ERRORE: azione «$az» non riconosciuta"
      stato=1
      ;;
  esac
done
exit "$stato"
