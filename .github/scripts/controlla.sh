#!/usr/bin/env bash
# Controlla dall'esterno come risponde il sito (non blocca il workflow).
set -uo pipefail

log() { printf '%s\n' "$*" | tee -a "$REPORT"; }
IP=$(getent hosts "$SITE" | awk '{print $1}' | head -n 1)
log "Indirizzo IP di $SITE: ${IP:-non risolto}"

for p in https http; do
  code=$(curl -sS -L -m 25 -o /tmp/pagina.html -w '%{http_code}' "$p://$SITE/" 2>/tmp/errore-curl || true)
  code=${code:-000}
  err=$(head -c 300 /tmp/errore-curl 2>/dev/null | tr '\n' ' ')
  if [ "$code" = 200 ] && grep -q 'content="Treart Evolution"' /tmp/pagina.html; then
    log "$p: risponde la nuova versione del sito (HTTP 200)"
  elif [ "$code" = 401 ]; then
    log "$p: HTTP 401, il sito è protetto da password (come previsto)"
  elif [ "$code" = 202 ]; then
    log "$p: HTTP 202, verifica anti-bot di SiteGround per i server automatici come GitHub (i visitatori vedono il sito normalmente)"
  elif printf '%s' "$err" | grep -q 'SSL certificate'; then
    log "$p: certificato non valido o provvisorio, da installare in Site Tools > Security > SSL Manager (Let's Encrypt)"
  else
    log "$p: HTTP $code $err"
  fi
done
exit 0
