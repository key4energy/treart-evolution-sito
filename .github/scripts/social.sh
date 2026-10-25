#!/usr/bin/env bash
# Richieste per la Pagina Facebook (in futuro anche Instagram) con la chiave META_TOKEN.
#
# Una richiesta è un file JSON in social/richieste/, aggiunto con un commit sul ramo main:
#   {"azione": "prova"}   lettura di verifica: non pubblica nulla
#
# L'esito va nel ramo esito-social (file esito-social.txt). Le chiavi non vengono mai stampate:
# quella dell'utente di sistema è un segreto di GitHub, quella della Pagina viene mascherata.
set -uo pipefail

G="https://graph.facebook.com"
stato=0
log() { printf '%s\n' "$*" | tee -a "$REPORT"; }
: > "$REPORT"
log "Social: esecuzione n. ${GITHUB_RUN_NUMBER:-?} del $(TZ=Europe/Rome date '+%d/%m/%Y %H:%M') - commit ${GITHUB_SHA:0:7}"

if [ -z "${META_TOKEN:-}" ]; then
  log "ERRORE: manca il segreto META_TOKEN (Settings > Secrets and variables > Actions)"
  exit 1
fi

# chiamata alle API di Meta: la chiave va nell'intestazione, mai nell'indirizzo
graph() { # graph CHIAVE METODO PERCORSO [altri argomenti di curl]
  local tok=$1 met=$2 path=$3
  shift 3
  curl -sS -m 60 -X "$met" -H "Authorization: Bearer $tok" "$G/$path" "$@"
}
# messaggio d'errore di Meta, se c'è
errore() {
  jq -r 'if type == "object" and .error then "\(.error.message) (codice \(.error.code)\(if .error.error_subcode then "/\(.error.error_subcode)" else "" end))" else empty end' 2>/dev/null \
    || echo "risposta non leggibile"
}

# se l'utente di sistema non vede Pagine: dove sta la Pagina e cosa gli è assegnato
diagnosi() {
  local r e bid nome
  log ""
  log "Diagnosi:"
  r=$(graph "$META_TOKEN" GET "me/assigned_pages?fields=id,name,tasks")
  e=$(printf '%s' "$r" | errore)
  if [ -z "$e" ]; then
    log "  Pagine assegnate (elenco diretto): $(jq -r '[.data[] | "\(.name) [\((.tasks // []) | join(","))]"] | if length == 0 then "nessuna" else join("; ") end' <<<"$r")"
  else
    log "  Pagine assegnate (elenco diretto): non leggibile ($e)"
  fi
  r=$(graph "$META_TOKEN" GET "me/businesses?fields=id,name")
  e=$(printf '%s' "$r" | errore)
  if [ -n "$e" ]; then
    log "  portfolio dell'utente di sistema: non leggibile ($e)"
    return 0
  fi
  if [ "$(jq '.data | length' <<<"$r")" -eq 0 ]; then
    log "  portfolio dell'utente di sistema: nessuno"
    return 0
  fi
  for bid in $(jq -r '.data[].id' <<<"$r"); do
    nome=$(jq -r --arg id "$bid" '.data[] | select(.id == $id) | .name' <<<"$r")
    log "  portfolio «$nome» (id $bid)"
    local op cp
    op=$(graph "$META_TOKEN" GET "$bid/owned_pages?fields=id,name")
    e=$(printf '%s' "$op" | errore)
    if [ -z "$e" ]; then
      log "    Pagine di proprietà del portfolio: $(jq -r '[.data[] | "\(.name) (id \(.id))"] | if length == 0 then "nessuna" else join("; ") end' <<<"$op")"
    else
      log "    Pagine di proprietà del portfolio: non leggibili ($e)"
    fi
    cp=$(graph "$META_TOKEN" GET "$bid/client_pages?fields=id,name")
    e=$(printf '%s' "$cp" | errore)
    if [ -z "$e" ]; then
      log "    Pagine condivise con il portfolio: $(jq -r '[.data[] | "\(.name) (id \(.id))"] | if length == 0 then "nessuna" else join("; ") end' <<<"$cp")"
    else
      log "    Pagine condivise con il portfolio: non leggibili ($e)"
    fi
  done
}

prova() {
  log ""
  log "== Prova in sola lettura =="
  local r e
  r=$(graph "$META_TOKEN" GET "me?fields=id,name")
  e=$(printf '%s' "$r" | errore)
  if [ -n "$e" ]; then
    log "ERRORE: la chiave non funziona: $e"
    return 1
  fi
  log "Chiave valida: utente di sistema «$(jq -r .name <<<"$r")» (id $(jq -r .id <<<"$r"))"

  r=$(graph "$META_TOKEN" GET "me/permissions")
  e=$(printf '%s' "$r" | errore)
  if [ -z "$e" ]; then
    log "Permessi concessi: $(jq -r '[.data[] | select(.status == "granted") | .permission] | join(", ")' <<<"$r")"
  else
    log "Permessi: non leggibili ($e)"
  fi

  r=$(graph "$META_TOKEN" GET "me/accounts?fields=id,name,tasks,link,category,followers_count,fan_count,access_token")
  e=$(printf '%s' "$r" | errore)
  if [ -n "$e" ]; then
    log "ERRORE: elenco delle Pagine non leggibile: $e"
    return 1
  fi
  local n i
  n=$(jq '.data | length' <<<"$r")
  log "Pagine assegnate all'utente di sistema: $n"
  if [ "$n" -eq 0 ]; then
    log "ERRORE: nessuna Pagina assegnata (Impostazioni > Utenti di sistema > Assegna risorse > Pagine)"
    diagnosi
    return 1
  fi

  for i in $(seq 0 $((n - 1))); do
    local p pid nome pt info posts ig
    p=$(jq -c ".data[$i]" <<<"$r")
    pid=$(jq -r .id <<<"$p")
    nome=$(jq -r .name <<<"$p")
    pt=$(jq -r '.access_token // empty' <<<"$p")
    [ -n "$pt" ] && echo "::add-mask::$pt"
    log ""
    log "Pagina «$nome» (id $pid)"
    log "  indirizzo: $(jq -r '.link // "-"' <<<"$p")"
    log "  categoria: $(jq -r '.category // "-"' <<<"$p")"
    log "  follower: $(jq -r '.followers_count // "-"' <<<"$p") · «mi piace»: $(jq -r '.fan_count // "-"' <<<"$p")"
    log "  attività consentite: $(jq -r '(.tasks // []) | join(", ")' <<<"$p")"
    if jq -e '(.tasks // []) | index("CREATE_CONTENT")' >/dev/null <<<"$p"; then
      log "  pubblicazione dei post: CONSENTITA"
    else
      log "  pubblicazione dei post: NON consentita (manca il permesso sui contenuti della Pagina)"
      stato=1
    fi
    if jq -e '(.tasks // []) | index("MANAGE")' >/dev/null <<<"$p"; then
      log "  modifica delle informazioni della Pagina: CONSENTITA"
    else
      log "  modifica delle informazioni della Pagina: non consentita"
    fi
    if [ -z "$pt" ]; then
      log "  chiave della Pagina non disponibile: non posso leggere altro"
      stato=1
      continue
    fi

    info=$(graph "$pt" GET "$pid?fields=about,description,website,phone,emails,single_line_address")
    e=$(printf '%s' "$info" | errore)
    if [ -z "$e" ]; then
      log "  descrizione breve: $(jq -r '.about // "-"' <<<"$info")"
      log "  descrizione: $(jq -r '(.description // "-") | gsub("\n"; " ") | .[0:160]' <<<"$info")"
      log "  sito: $(jq -r '.website // "-"' <<<"$info") · telefono: $(jq -r '.phone // "-"' <<<"$info")"
      log "  e-mail: $(jq -r '(.emails // []) | if length == 0 then "-" else join(", ") end' <<<"$info") · indirizzo: $(jq -r '.single_line_address // "-"' <<<"$info")"
    else
      log "  informazioni della Pagina: non leggibili ($e)"
    fi

    ig=$(graph "$pt" GET "$pid?fields=instagram_business_account")
    e=$(printf '%s' "$ig" | errore)
    if [ -z "$e" ]; then
      log "  Instagram collegato alla Pagina: $(jq -r 'if .instagram_business_account then "sì (id \(.instagram_business_account.id))" else "no" end' <<<"$ig")"
    else
      log "  Instagram collegato alla Pagina: non verificabile ($e)"
    fi

    posts=$(graph "$pt" GET "$pid/posts?limit=3&fields=created_time,message,permalink_url")
    e=$(printf '%s' "$posts" | errore)
    if [ -z "$e" ]; then
      log "  ultimi post letti: $(jq '.data | length' <<<"$posts")"
      jq -r '.data[] | "   - \(.created_time[0:10])  \((.message // "(senza testo)") | gsub("\n"; " ") | .[0:70])  \(.permalink_url // "")"' <<<"$posts" | tee -a "$REPORT"
    else
      log "  ultimi post: non leggibili ($e)"
    fi
  done
  log ""
  log "Prova completata: nessuna pubblicazione effettuata."
}

# richieste aggiunte con questo push (se non ce ne sono, per esempio da «Run workflow», si fa la prova)
RICHIESTE=()
if [ -n "${BEFORE:-}" ] && ! [[ "$BEFORE" =~ ^0+$ ]] && git cat-file -e "$BEFORE^{commit}" 2>/dev/null; then
  mapfile -t RICHIESTE < <(git diff --name-only --diff-filter=A "$BEFORE" "$GITHUB_SHA" -- social/richieste/)
fi
if [ ${#RICHIESTE[@]} -eq 0 ]; then
  log "Nessuna nuova richiesta: eseguo la prova in sola lettura"
  prova || stato=1
fi
for f in "${RICHIESTE[@]}"; do
  log ""
  log "Richiesta: $f"
  az=$(jq -r '.azione // empty' "$f" 2>/dev/null || true)
  case "$az" in
    prova) prova || stato=1 ;;
    *) log "ERRORE: azione «$az» non riconosciuta"; stato=1 ;;
  esac
done
exit "$stato"
