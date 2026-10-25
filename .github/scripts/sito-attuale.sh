#!/usr/bin/env bash
# Manutenzione del sito attuale treart-evolution.com (WordPress su SiteGround) via SSH.
# Una richiesta è un file JSON in manutenzione/richieste/, aggiunto con un commit sul ramo main:
#   {"azione": "ispeziona"}
#   {"azione": "sostituisci", "approvata_da": "...", "sostituzioni": [["vecchio", "nuovo"], ...]}
#   {"azione": "rimuovi-link", "approvata_da": "...", "link": "linkedin.com/company/..."}
#   {"azione": "backup"}   backup completo (file e database), scaricabile dalla pagina dell'esecuzione su GitHub
#   {"azione": "elenca-indirizzi"}   sola lettura: indirizzi pubblici del sito, per i reindirizzamenti
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
    *)
      log "ERRORE: azione «$az» non riconosciuta"
      stato=1
      ;;
  esac
done
exit "$stato"
