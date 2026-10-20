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

# 2. caricamento dei file (sul server non viene cancellato nulla)
mapfile -t FILES < <(cd public && find . -type f ! -name '.*' | sed 's|^\./||' | sort)
up() { scp "$@" 2>/dev/null || scp -O "$@"; }
up "${OPTS[@]}" -P "$PORT" -p public/index.html public/og-image.png "$SG_USER@$SG_HOST:$DEST/"
if [ -d public/img ]; then
  ssh_sg "mkdir -p '$DEST/img'"
  up "${OPTS[@]}" -P "$PORT" -p public/img/* "$SG_USER@$SG_HOST:$DEST/img/"
fi
log "Caricati ${#FILES[@]} file in $DEST (pagina, immagine di anteprima e foto)"
log "$(ssh_sg "bash -s -- '$DEST'" < .github/scripts/htaccess.sh 2>&1)"

# 3. verifica: i file sul server devono essere identici a quelli del repository
ATTESI=$(cd public && sha256sum "${FILES[@]}")
SUL_SERVER=$(ssh_sg "cd '$DEST' && sha256sum ${FILES[*]}" 2>/dev/null || true)
if [ -z "$SUL_SERVER" ]; then
  log "Verifica dei file non disponibile sul server"
elif [ "$SUL_SERVER" = "$ATTESI" ]; then
  log "Verifica: i ${#FILES[@]} file sul server sono identici a quelli del repository"
else
  log "ERRORE: alcuni file sul server sono diversi da quelli caricati"
  diff <(printf '%s\n' "$ATTESI") <(printf '%s\n' "$SUL_SERVER") | head -n 20 | tee -a "$REPORT"
  exit 1
fi
log "Contenuto della cartella:"
ssh_sg "cd '$DEST' && ls -lAgo && echo && echo \"Foto in img/: \$(ls img 2>/dev/null | wc -l)\"" | tee -a "$REPORT"
