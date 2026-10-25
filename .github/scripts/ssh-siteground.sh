#!/usr/bin/env bash
# Da includere con «source»: prepara la chiave SSH di SiteGround e definisce ssh_sg.
# Richiede SG_KEY, SG_HOST, SG_USER (e facoltativi SG_PASS, SG_PORT) e la funzione log.

manca=()
[ -n "${SG_KEY:-}" ]  || manca+=(SITEGROUND_SSH_KEY)
[ -n "${SG_HOST:-}" ] || manca+=(SITEGROUND_HOST)
[ -n "${SG_USER:-}" ] || manca+=(SITEGROUND_USER)
if [ ${#manca[@]} -gt 0 ]; then
  log "ERRORE: mancano i segreti ${manca[*]}"
  exit 1
fi
PORT="${SG_PORT:-18765}"

install -m 700 -d ~/.ssh
printf '%s\n' "$SG_KEY" | tr -d '\r' > ~/.ssh/siteground
chmod 600 ~/.ssh/siteground
if [ -n "${SG_PASS:-}" ]; then
  if ! ssh-keygen -q -p -P "$SG_PASS" -N "" -f ~/.ssh/siteground >/dev/null 2>&1; then
    log "ERRORE: chiave privata o passphrase non valide"
    exit 1
  fi
fi

OPTS=(-i ~/.ssh/siteground -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=25)
ssh_sg() { ssh "${OPTS[@]}" -p "$PORT" "$SG_USER@$SG_HOST" "$@"; }
