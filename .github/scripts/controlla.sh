#!/usr/bin/env bash
# Controlla dall'esterno che il sito risponda con la pagina appena pubblicata (non blocca il workflow).
set -uo pipefail

log() { printf '%s\n' "$*" | tee -a "$REPORT"; }
IP=$(getent hosts "$SITE" | awk '{print $1}' | head -n 1)
log "Indirizzo IP di $SITE: ${IP:-non risolto}"
ATTESO=$(sha256sum public/index.html | cut -d' ' -f1)

for p in https http; do
  code=$(curl -sS -L -m 25 -D /tmp/intestazioni -o /tmp/pagina.html -w '%{http_code}' "$p://$SITE/" 2>/tmp/errore-curl || true)
  code=${code:-000}
  err=$(head -c 300 /tmp/errore-curl 2>/dev/null | tr '\n' ' ')
  cache=$(grep -i '^x-proxy-cache:' /tmp/intestazioni 2>/dev/null | tail -n 1 | cut -d' ' -f2 | tr -d '\r')
  if [ "$code" = 200 ] && [ "$(sha256sum /tmp/pagina.html | cut -d' ' -f1)" = "$ATTESO" ]; then
    log "$p: risponde la pagina appena pubblicata (HTTP 200${cache:+, cache SiteGround $cache})"
  elif [ "$code" = 200 ]; then
    log "ATTENZIONE $p: risponde una versione precedente della pagina (cache SiteGround ${cache:-?}): svuotala in Site Tools > Speed > Caching > Dynamic Cache"
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

# altre pagine statiche (es. privacy e condizioni dell'app social richieste da Meta)
for f in public/*.html; do
  pg=$(basename "$f")
  [ "$pg" = index.html ] && continue
  code=$(curl -sS -L -m 25 -o /tmp/altra.html -w '%{http_code}' "https://$SITE/$pg" 2>/dev/null || true)
  if [ "$code" = 200 ] && cmp -s /tmp/altra.html "$f"; then
    log "https://$SITE/$pg: online, aggiornata"
  else
    log "https://$SITE/$pg: HTTP ${code:-000}"
  fi
done
exit 0
