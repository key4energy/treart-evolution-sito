#!/usr/bin/env bash
# Richieste per la Pagina Facebook (in futuro anche Instagram) con la chiave META_TOKEN.
#
# Una richiesta è un file JSON in social/richieste/, aggiunto con un commit sul ramo main:
#   {"azione": "prova"}   lettura di verifica: non pubblica nulla
#   {"azione": "aggiorna-pagina", "approvata_da": "...", "campi": {"about": "..."}}
#                         aggiorna le informazioni della Pagina (about, description, website, phone)
# Le azioni che modificano la Pagina si usano solo dopo l'ok esplicito di Fabio, riportato in approvata_da.
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
  curl -sS -g -m 60 -X "$met" -H "Authorization: Bearer $tok" "$G/$path" "$@"
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
  # app e portfolio a cui appartiene la chiave
  local app bids=""
  r=$(curl -sS -m 60 -G -H "Authorization: Bearer $META_TOKEN" --data-urlencode "input_token=$META_TOKEN" "$G/debug_token")
  e=$(printf '%s' "$r" | errore)
  if [ -z "$e" ]; then
    app=$(jq -r '.data.app_id // empty' <<<"$r")
    log "  chiave: tipo $(jq -r '.data.type // "?"' <<<"$r"), app $app, scadenza $(jq -r 'if (.data.expires_at // 0) == 0 then "mai" else (.data.expires_at | todate) end' <<<"$r")"
    jq -r '.data.granular_scopes[]? | "    \(.scope): \(if .target_ids then (.target_ids | join(", ")) else "tutte le risorse assegnate" end)"' <<<"$r" | tee -a "$REPORT"
  else
    log "  chiave: dettagli non leggibili ($e)"
  fi
  if [ -n "${app:-}" ]; then
    r=$(graph "$META_TOKEN" GET "$app?fields=name,owner_business")
    e=$(printf '%s' "$r" | errore)
    if [ -z "$e" ]; then
      log "  app «$(jq -r '.name // "?"' <<<"$r")», portfolio proprietario: $(jq -r 'if .owner_business then "\(.owner_business.name // "?") (id \(.owner_business.id))" else "-" end' <<<"$r")"
      bids=$(jq -r '.owner_business.id // empty' <<<"$r")
    else
      log "  app: non leggibile ($e)"
    fi
  fi
  r=$(graph "$META_TOKEN" GET "me/businesses?fields=id,name")
  e=$(printf '%s' "$r" | errore)
  if [ -z "$e" ]; then
    bids="$bids $(jq -r '.data[].id' <<<"$r")"
  fi
  bids=$(printf '%s\n' $bids | awk 'NF && !seen[$0]++')
  if [ -z "$bids" ]; then
    log "  portfolio: non individuato"
    return 0
  fi
  for bid in $bids; do
    nome=$(graph "$META_TOKEN" GET "$bid?fields=name" | jq -r '.name // "?"' 2>/dev/null)
    log "  portfolio «$nome» (id $bid)"
    local op cp
    op=$(graph "$META_TOKEN" GET "$bid/owned_pages?fields=id,name")
    e=$(printf '%s' "$op" | errore)
    if [ -z "$e" ]; then
      log "    Pagine di proprietà del portfolio: $(jq -r '[.data[] | "\(.name) (id \(.id))"] | if length == 0 then "nessuna" else join("; ") end' <<<"$op")"
      local pid au
      for pid in $(jq -r '.data[].id' <<<"$op"); do
        au=$(graph "$META_TOKEN" GET "$pid/assigned_users?business=$bid&fields=id,name,tasks")
        e=$(printf '%s' "$au" | errore)
        if [ -z "$e" ]; then
          log "    persone e utenti di sistema assegnati alla Pagina $pid: $(jq -r '[.data[] | "\(.name) [\((.tasks // []) | join(","))]"] | if length == 0 then "nessuno" else join("; ") end' <<<"$au")"
        else
          log "    assegnazioni della Pagina $pid: non leggibili ($e)"
        fi
      done
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

# chiave della Pagina (quella indicata nella richiesta, altrimenti la prima assegnata)
pagina() {
  local want=${1:-} r e p
  r=$(graph "$META_TOKEN" GET "me/accounts?fields=id,name,access_token,tasks")
  e=$(printf '%s' "$r" | errore)
  if [ -n "$e" ]; then
    log "ERRORE: elenco delle Pagine non leggibile: $e"
    return 1
  fi
  if [ -n "$want" ]; then
    p=$(jq -c --arg id "$want" '.data[] | select(.id == $id)' <<<"$r")
  else
    p=$(jq -c '.data[0] // empty' <<<"$r")
  fi
  if [ -z "$p" ]; then
    log "ERRORE: Pagina non assegnata all'utente di sistema"
    return 1
  fi
  PAGE_ID=$(jq -r .id <<<"$p")
  PAGE_NAME=$(jq -r .name <<<"$p")
  PAGE_TOKEN=$(jq -r '.access_token // empty' <<<"$p")
  [ -n "$PAGE_TOKEN" ] && echo "::add-mask::$PAGE_TOKEN"
  if [ -z "$PAGE_TOKEN" ]; then
    log "ERRORE: chiave della Pagina non disponibile"
    return 1
  fi
}

# aggiorna le informazioni della Pagina: {"azione": "aggiorna-pagina", "campi": {"about": "..."}}
aggiorna_pagina() {
  local f=$1 k v r e prima dopo elenco
  local campi=()
  mapfile -t campi < <(jq -r '.campi // {} | keys[]' "$f")
  if [ ${#campi[@]} -eq 0 ]; then
    log "ERRORE: nessun campo da aggiornare"
    return 1
  fi
  for k in "${campi[@]}"; do
    case "$k" in
      about|description|website|phone) ;;
      *) log "ERRORE: il campo «$k» non è tra quelli consentiti (about, description, website, phone)"; return 1 ;;
    esac
  done
  pagina "$(jq -r '.pagina // empty' "$f")" || return 1
  log "== Aggiornamento delle informazioni della Pagina «$PAGE_NAME» (id $PAGE_ID) =="
  log "Approvazione: $(jq -r '.approvata_da // "non indicata"' "$f")"
  elenco=$(IFS=,; echo "${campi[*]}")
  prima=$(graph "$PAGE_TOKEN" GET "$PAGE_ID?fields=$elenco")
  local args=()
  for k in "${campi[@]}"; do
    v=$(jq -r --arg k "$k" '.campi[$k]' "$f")
    args+=(--data-urlencode "$k=$v")
  done
  r=$(graph "$PAGE_TOKEN" POST "$PAGE_ID" "${args[@]}")
  e=$(printf '%s' "$r" | errore)
  if [ -n "$e" ]; then
    log "ERRORE: aggiornamento non riuscito: $e"
    return 1
  fi
  dopo=$(graph "$PAGE_TOKEN" GET "$PAGE_ID?fields=$elenco")
  local esito=0
  for k in "${campi[@]}"; do
    v=$(jq -r --arg k "$k" '.campi[$k]' "$f")
    log "  $k, prima: $(jq -r --arg k "$k" '.[$k] // "-"' <<<"$prima")"
    log "  $k, adesso: $(jq -r --arg k "$k" '.[$k] // "-"' <<<"$dopo")"
    if [ "$(jq -r --arg k "$k" '.[$k] // ""' <<<"$dopo")" = "$v" ]; then
      log "  $k: aggiornato"
    else
      log "  ATTENZIONE: $k non corrisponde al testo richiesto"
      esito=1
    fi
  done
  return $esito
}

# controllo completo delle informazioni della Pagina (sola lettura): {"azione": "controlla-pagina"}
# Scrive il riepilogo nell'esito e i dettagli in $ESITO_DIR (pagina.json, post.json, foto-profilo.jpg, copertina.jpg).
controlla_pagina() {
  local f=$1 campo r e out="${ESITO_DIR:-.}"
  mkdir -p "$out"
  pagina "$(jq -r '.pagina // empty' "$f")" || return 1
  log "== Controllo delle informazioni della Pagina «$PAGE_NAME» (id $PAGE_ID), sola lettura =="
  local campi=(name username link category category_list about description company_overview mission products
    general_info founded impressum website phone emails single_line_address location hours price_range
    is_published verification_status fan_count followers_count rating_count overall_star_rating checkins
    whatsapp_number instagram_business_account connected_instagram_account
    "picture.width(720).height(720){url,is_silhouette,width,height}" "cover{source,offset_x,offset_y}")
  echo '{}' > "$out/pagina.json"
  for campo in "${campi[@]}"; do
    r=$(graph "$PAGE_TOKEN" GET "$PAGE_ID?fields=$campo")
    e=$(printf '%s' "$r" | errore)
    local nome=${campo%%.*}
    nome=${nome%%\{*}
    if [ -n "$e" ]; then
      log "  $nome: non disponibile ($e)"
      jq --arg k "$nome" --arg e "$e" '.[$k] = {"errore": $e}' "$out/pagina.json" > "$out/t.json" && mv "$out/t.json" "$out/pagina.json"
    else
      local v
      v=$(jq -c --arg k "$nome" '.[$k] // null' <<<"$r")
      log "  $nome: $(jq -r 'if . == null then "(vuoto)" elif type == "string" then (gsub("\n"; " ⏎ ") | .[0:300]) else (tostring | .[0:300]) end' <<<"$v")"
      jq --arg k "$nome" --argjson v "$v" '.[$k] = $v' "$out/pagina.json" > "$out/t.json" && mv "$out/t.json" "$out/pagina.json"
    fi
  done

  # pulsante d'azione e schede (possono non essere disponibili per le Pagine nuove)
  r=$(graph "$PAGE_TOKEN" GET "$PAGE_ID/call_to_actions?fields=type,status,web_url,intl_number_with_plus,email_address")
  e=$(printf '%s' "$r" | errore)
  if [ -z "$e" ]; then
    log "  pulsante d'azione: $(jq -c '.data' <<<"$r")"
  else
    log "  pulsante d'azione: non leggibile ($e)"
  fi

  # immagini attuali
  local u
  u=$(jq -r '.picture.data.url // empty' "$out/pagina.json")
  [ -n "$u" ] && curl -sSL -m 60 -o "$out/foto-profilo.jpg" "$u" && log "  foto profilo salvata ($(wc -c < "$out/foto-profilo.jpg") byte)"
  u=$(jq -r '.cover.source // empty' "$out/pagina.json")
  [ -n "$u" ] && curl -sSL -m 60 -o "$out/copertina.jpg" "$u" && log "  copertina salvata ($(wc -c < "$out/copertina.jpg") byte)"

  # post: frequenza e ultimi contenuti
  r=$(graph "$PAGE_TOKEN" GET "$PAGE_ID/posts?limit=100&fields=created_time,message,permalink_url,full_picture,status_type")
  e=$(printf '%s' "$r" | errore)
  if [ -z "$e" ]; then
    jq '.data' <<<"$r" > "$out/post.json"
    log "  post letti: $(jq 'length' "$out/post.json") (ultimi 100 al massimo)"
    log "  post per anno: $(jq -r 'group_by(.created_time[0:4]) | map("\(.[0].created_time[0:4]): \(length)") | join(", ")' "$out/post.json")"
    jq -r '.[0:10][] | "   - \(.created_time[0:10])  \((.message // "(senza testo)") | gsub("\n"; " ") | .[0:90])"' "$out/post.json" | tee -a "$REPORT"
  else
    log "  post: non leggibili ($e)"
  fi

  # statistiche degli ultimi 28 giorni (alcune metriche possono non essere più disponibili)
  local m
  for m in page_impressions_unique page_post_engagements page_views_total page_follows page_daily_follows_unique; do
    r=$(graph "$PAGE_TOKEN" GET "$PAGE_ID/insights?metric=$m&period=days_28")
    e=$(printf '%s' "$r" | errore)
    if [ -z "$e" ]; then
      log "  statistica $m (28 giorni): $(jq -r '.data[0].values[-1].value // "-" | tostring' <<<"$r")"
    else
      log "  statistica $m: non disponibile"
    fi
  done
  log ""
  log "Controllo completato: nessuna modifica effettuata."
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
    aggiorna-pagina) aggiorna_pagina "$f" || stato=1 ;;
    controlla-pagina) controlla_pagina "$f" || stato=1 ;;
    *) log "ERRORE: azione «$az» non riconosciuta"; stato=1 ;;
  esac
done
exit "$stato"
