#!/usr/bin/env bash
# Carica public/ su SiteGround via SSH (usato dal workflow "Pubblica su SiteGround").
# Sul server non viene cancellato nessun file.
set -euo pipefail

log() { printf '%s\n' "$*" | tee -a "$REPORT"; }
: > "$REPORT"
log "Pubblicazione n. ${GITHUB_RUN_NUMBER:-?} del $(TZ=Europe/Rome date '+%d/%m/%Y %H:%M') - commit ${GITHUB_SHA:0:7}"

manca=()
[ -n "${SG_KEY:-}" ]  || manca+=(SITEGROUND_SSH_KEY)
[ -n "${SG_HOST:-}" ] || manca+=(SITEGROUND_HOST)
[ -n "${SG_USER:-}" ] || manca+=(SITEGROUND_USER)
if [ ${#manca[@]} -gt 0 ]; then
  log "ERRORE: mancano i segreti ${manca[*]}"
  exit 1
fi
PORT="${SG_PORT:-18765}"

# chiave privata: tolti eventuali ritorni a capo di Windows e, se c'è, la passphrase
install -m 700 -d ~/.ssh
printf '%s\n' "$SG_KEY" | tr -d '\r' > ~/.ssh/siteground
chmod 600 ~/.ssh/siteground
if [ -n "${SG_PASS:-}" ]; then
  if ! ssh-keygen -q -p -P "$SG_PASS" -N "" -f ~/.ssh/siteground >/dev/null 2>&1; then
    log "ERRORE: chiave privata o passphrase non valide (controlla SITEGROUND_SSH_KEY e SITEGROUND_SSH_PASSPHRASE)"
    exit 1
  fi
fi
if ! ssh-keygen -y -f ~/.ssh/siteground >/dev/null 2>&1; then
  log "ERRORE: la chiave privata non si apre: manca la passphrase o la chiave è stata copiata in modo incompleto"
  exit 1
fi

OPTS=(-i ~/.ssh/siteground -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=25)
ssh_sg() { ssh "${OPTS[@]}" -p "$PORT" "$SG_USER@$SG_HOST" "$@"; }

# 1. cartella del sito (e copia dell'eventuale pagina iniziale già presente)
if ! OUT=$(ssh_sg "bash -s -- '$SITE' '${SG_DIR:-}'" < .github/scripts/prepara-cartella.sh 2>&1); then
  log "ERRORE: collegamento SSH o cartella non riusciti:"
  log "$OUT"
  exit 1
fi
log "$OUT"
DEST=$(printf '%s\n' "$OUT" | sed -n 's/^CARTELLA=//p' | tail -n 1)
if [ -z "$DEST" ]; then
  log "ERRORE: cartella di destinazione non individuata"
  exit 1
fi

# 2. caricamento dei file
FILES=(public/index.html public/og-image.png)
if ! scp "${OPTS[@]}" -P "$PORT" -p "${FILES[@]}" "$SG_USER@$SG_HOST:$DEST/" 2>/dev/null; then
  scp -O "${OPTS[@]}" -P "$PORT" -p "${FILES[@]}" "$SG_USER@$SG_HOST:$DEST/"
fi
log "Caricati index.html e og-image.png in $DEST"
log "Contenuto della cartella:"
ssh_sg "cd '$DEST' && ls -lAgo" | tee -a "$REPORT"
