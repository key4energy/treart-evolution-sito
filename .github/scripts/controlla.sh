#!/usr/bin/env bash
# Controlla che il sito pubblicato risponda con la nuova versione (non blocca il workflow).
set -uo pipefail

log() { printf '%s\n' "$*" | tee -a "$REPORT"; }
IP=$(getent hosts "$SITE" | awk '{print $1}' | head -n 1)
log "Indirizzo IP di $SITE: ${IP:-non risolto}"

nuovo=0
for p in https http; do
  res=$(curl -sS -L -m 25 -o /tmp/pagina.html -w '%{http_code} %{url_effective}' "$p://$SITE/" 2>/tmp/errore-curl || true)
  code=${res%% *}
  [ -n "$code" ] || code=000
  if [ "$code" = 200 ] && grep -q 'content="Treart Evolution"' /tmp/pagina.html; then
    log "$p://$SITE/ -> ${res#* } risponde con la nuova versione (HTTP 200)"
    nuovo=1
  else
    log "$p://$SITE/ -> HTTP $code $(head -c 160 /tmp/errore-curl 2>/dev/null | tr '\n' ' ')"
  fi
done
og=$(curl -sS -L -m 25 -o /dev/null -w '%{http_code}' "http://$SITE/og-image.png" 2>/dev/null || true)
log "og-image.png -> HTTP ${og:-000}"
if [ "$nuovo" != 1 ]; then
  log "ATTENZIONE: il sito non risponde ancora con la nuova versione (DNS, certificato o cache da controllare)."
fi
exit 0
