#!/usr/bin/env bash
# Richieste per la Pagina Facebook (in futuro anche Instagram) con la chiave META_TOKEN.
#
# Una richiesta è un file JSON in social/richieste/, aggiunto con un commit sul ramo main:
#   {"azione": "prova"}   lettura di verifica: non pubblica nulla
#   {"azione": "aggiorna-pagina", "approvata_da": "...", "campi": {"about": "..."}}
#                         aggiorna le informazioni della Pagina (about, description, website, phone, hours, impressum)
# Instagram, con accesso diretto all'account (chiave IG_TOKEN, senza passare dalla Pagina):
#   {"azione": "prova-instagram"}   lettura di verifica: account, ultimi post, limite di pubblicazione
#   {"azione": "pubblica-instagram", "approvata_da": "...", "file": "public/social/....jpg", "testo": "..."}
#                         pubblica una foto (JPEG raggiungibile online: "file" in public/ oppure "immagine": "https://...")
# Le azioni che modificano la Pagina o pubblicano si usano solo dopo l'ok esplicito di Fabio, riportato in approvata_da.
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
      about|description|website|phone|hours|impressum) ;;
      *) log "ERRORE: il campo «$k» non è tra quelli consentiti (about, description, website, phone, hours, impressum)"; return 1 ;;
    esac
  done
  pagina "$(jq -r '.pagina // empty' "$f")" || return 1
  log "== Aggiornamento delle informazioni della Pagina «$PAGE_NAME» (id $PAGE_ID) =="
  log "Approvazione: $(jq -r '.approvata_da // "non indicata"' "$f")"
  elenco=$(IFS=,; echo "${campi[*]}")
  prima=$(graph "$PAGE_TOKEN" GET "$PAGE_ID?fields=$elenco")
  local args=()
  for k in "${campi[@]}"; do
    # testo così com'è; oggetti (per esempio gli orari) in JSON compatto
    v=$(jq -r --arg k "$k" '.campi[$k] | if type == "string" then . else tojson end' "$f")
    args+=(--data-urlencode "$k=$v")
  done
  r=$(graph "$PAGE_TOKEN" POST "$PAGE_ID" "${args[@]}")
  e=$(printf '%s' "$r" | errore)
  if [ -n "$e" ]; then
    log "ERRORE: aggiornamento non riuscito: $e"
    return 1
  fi
  dopo=$(graph "$PAGE_TOKEN" GET "$PAGE_ID?fields=$elenco")
  local esito=0 voluto ora
  for k in "${campi[@]}"; do
    log "  $k, prima: $(jq -r --arg k "$k" '.[$k] // "-" | if type == "string" then . else tojson end' <<<"$prima")"
    log "  $k, adesso: $(jq -r --arg k "$k" '.[$k] // "-" | if type == "string" then . else tojson end' <<<"$dopo")"
    voluto=$(jq -cS --arg k "$k" '.campi[$k]' "$f")
    ora=$(jq -cS --arg k "$k" '.[$k] // null' <<<"$dopo")
    if [ "$ora" = "$voluto" ]; then
      log "  $k: aggiornato"
    else
      log "  ATTENZIONE: $k non corrisponde a quanto richiesto"
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
    whatsapp_number has_whatsapp_number has_whatsapp_business_number service_area temporary_status
    instagram_business_account connected_instagram_account
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

# nuova copertina: {"azione": "copertina", "approvata_da": "...", "file": "public/social/....png", "offset_y": 50}
# Carica la foto senza pubblicarla nel diario, la imposta come copertina e la rilegge.
copertina() {
  local f=$1 file oy r e foto out="${ESITO_DIR:-.}"
  file=$(jq -r '.file // empty' "$f")
  oy=$(jq -r '.offset_y // 50' "$f")
  if [ ! -f "$file" ]; then
    log "ERRORE: immagine «$file» non trovata nel repository"
    return 1
  fi
  pagina "$(jq -r '.pagina // empty' "$f")" || return 1
  log "== Copertina della Pagina «$PAGE_NAME» (id $PAGE_ID) =="
  log "Approvazione: $(jq -r '.approvata_da // "non indicata"' "$f")"
  local prima
  prima=$(graph "$PAGE_TOKEN" GET "$PAGE_ID?fields=cover{id}" | jq -r '.cover.id // ""' 2>/dev/null)
  r=$(curl -sS -m 180 -X POST -H "Authorization: Bearer $PAGE_TOKEN" -F "source=@$file" -F "published=false" "$G/$PAGE_ID/photos")
  e=$(printf '%s' "$r" | errore)
  foto=$(jq -r '.id // empty' <<<"$r" 2>/dev/null)
  if [ -n "$e" ] || [ -z "$foto" ]; then
    log "ERRORE: caricamento della foto non riuscito: ${e:-risposta senza id}"
    return 1
  fi
  log "  foto caricata, non pubblicata nel diario (id $foto)"
  r=$(graph "$PAGE_TOKEN" POST "$PAGE_ID" --data-urlencode "cover=$foto" --data-urlencode "offset_y=$oy" --data-urlencode "no_feed_story=true")
  e=$(printf '%s' "$r" | errore)
  if [ -n "$e" ]; then
    log "ERRORE: la foto non è stata impostata come copertina: $e"
    return 1
  fi
  r=$(graph "$PAGE_TOKEN" GET "$PAGE_ID?fields=cover{id,source,offset_y}")
  log "  copertina attuale: id $(jq -r '.cover.id // "-"' <<<"$r"), spostamento verticale $(jq -r '.cover.offset_y // "-"' <<<"$r")"
  local u
  u=$(jq -r '.cover.source // empty' <<<"$r")
  if [ -n "$u" ]; then
    mkdir -p "$out"
    curl -sSL -m 60 -o "$out/copertina-attuale.jpg" "$u" && log "  copertina attuale salvata per il controllo"
  fi
  # Meta salva la copertina come una nuova foto: basta che l'id sia cambiato rispetto a prima
  local ora
  ora=$(jq -r '.cover.id // ""' <<<"$r")
  if [ -n "$ora" ] && [ "$ora" != "$prima" ]; then
    log "  copertina: aggiornata"
  else
    log "  ATTENZIONE: Meta mostra ancora la copertina di prima"
    return 1
  fi
}

# elenco delle categorie di Meta che contengono certe parole (sola lettura):
# {"azione": "cerca-categorie", "parole": ["informatic", "telecomunic"]}
cerca_categorie() {
  local f=$1 r e out="${ESITO_DIR:-.}" re
  pagina "$(jq -r '.pagina // empty' "$f")" || return 1
  log "== Ricerca delle categorie di Meta =="
  r=$(graph "$PAGE_TOKEN" GET "fb_page_categories?locale=it_IT")
  e=$(printf '%s' "$r" | errore)
  if [ -n "$e" ]; then
    log "ERRORE: elenco delle categorie non disponibile: $e"
    return 1
  fi
  mkdir -p "$out"
  printf '%s' "$r" > "$out/categorie.json"
  re=$(jq -r '(.parole // []) | join("|")' "$f")
  log "  categorie trovate in tutto: $(jq '[.. | objects | select(has("id") and has("name"))] | unique_by(.id) | length' <<<"$r")"
  jq -r --arg re "$re" '[.. | objects | select(has("id") and has("name"))] | unique_by(.id) | .[] | select(.name | test($re; "i")) | "   - \(.name) (id \(.id))"' <<<"$r" | sort | tee -a "$REPORT"
}

# categorie della Pagina: {"azione": "categorie", "approvata_da": "...", "categorie": ["id1", "id2", "id3"]}
categorie() {
  local f=$1 r e lista
  pagina "$(jq -r '.pagina // empty' "$f")" || return 1
  log "== Categorie della Pagina «$PAGE_NAME» (id $PAGE_ID) =="
  log "Approvazione: $(jq -r '.approvata_da // "non indicata"' "$f")"
  lista=$(jq -c '.categorie' "$f")
  r=$(graph "$PAGE_TOKEN" GET "$PAGE_ID?fields=category_list")
  log "  prima: $(jq -r '[.category_list[]?.name] | join(", ")' <<<"$r")"
  r=$(graph "$PAGE_TOKEN" POST "$PAGE_ID" --data-urlencode "category_list=$lista")
  e=$(printf '%s' "$r" | errore)
  if [ -n "$e" ]; then
    log "ERRORE: categorie non aggiornate: $e"
    return 1
  fi
  r=$(graph "$PAGE_TOKEN" GET "$PAGE_ID?fields=category_list")
  log "  adesso: $(jq -r '[.category_list[]?.name] | join(", ")' <<<"$r")"
  if [ "$(jq -cS '[.category_list[]?.id] | sort' <<<"$r")" = "$(jq -cS '.categorie | sort' "$f")" ]; then
    log "  categorie: aggiornate"
  else
    log "  ATTENZIONE: le categorie lette non corrispondono a quelle richieste"
    return 1
  fi
}

# ---------- Instagram con accesso diretto (API di Instagram con accesso Instagram) ----------
IGG="https://graph.instagram.com"
ig() { # ig METODO PERCORSO [altri argomenti di curl]: la chiave va nell'intestazione, mai nell'indirizzo
  local met=$1 path=$2
  shift 2
  curl -sS -g -m 60 -X "$met" -H "Authorization: Bearer $IG_TOKEN" "$IGG/$path" "$@"
}
serve_ig() {
  if [ -z "${IG_TOKEN:-}" ]; then
    log "ERRORE: manca il segreto IG_TOKEN (chiave generata in developers.facebook.com › app Treart Evolution Social › Casi d'uso › Instagram › Genera token)"
    return 1
  fi
  echo "::add-mask::$IG_TOKEN"
}
account_ig() { # imposta IG_ID e IG_USER
  local r e
  r=$(ig GET "me?fields=user_id,username")
  e=$(printf '%s' "$r" | errore)
  if [ -n "$e" ]; then
    log "ERRORE: la chiave di Instagram non funziona: $e"
    return 1
  fi
  IG_ID=$(jq -r '.user_id // .id' <<<"$r")
  IG_USER=$(jq -r '.username // "?"' <<<"$r")
}

prova_instagram() {
  log ""
  log "== Prova Instagram in sola lettura =="
  serve_ig || return 1
  account_ig || return 1
  local r e
  r=$(ig GET "me?fields=user_id,username,name,account_type,followers_count,follows_count,media_count")
  log "Account: @$IG_USER (id $IG_ID), nome «$(jq -r '.name // "-"' <<<"$r")», tipo $(jq -r '.account_type // "?"' <<<"$r")"
  log "  follower: $(jq -r '.followers_count // "-"' <<<"$r") · seguiti: $(jq -r '.follows_count // "-"' <<<"$r") · post: $(jq -r '.media_count // "-"' <<<"$r")"
  local c u
  for c in biography website; do
    r=$(ig GET "me?fields=$c")
    e=$(printf '%s' "$r" | errore)
    if [ -z "$e" ]; then
      log "  $c: $(jq -r --arg c "$c" '(.[$c] // "(vuoto)") | gsub("\n"; " ⏎ ")' <<<"$r")"
    else
      log "  $c: non leggibile ($e)"
    fi
  done
  u=$(ig GET "me?fields=profile_picture_url" | jq -r '.profile_picture_url // empty' 2>/dev/null)
  if [ -n "$u" ]; then
    mkdir -p "${ESITO_DIR:-.}"
    curl -sSL -m 60 -o "${ESITO_DIR:-.}/instagram-foto-profilo.jpg" "$u" && log "  foto profilo salvata in dettagli/instagram-foto-profilo.jpg"
  fi
  r=$(ig GET "me/media?fields=id,caption,media_type,timestamp,permalink&limit=5")
  e=$(printf '%s' "$r" | errore)
  if [ -z "$e" ]; then
    log "  ultimi post letti: $(jq '.data | length' <<<"$r")"
    jq -r '.data[] | "   - \(.timestamp[0:10])  \(.media_type)  \((.caption // "(senza testo)") | gsub("\n"; " ") | .[0:70])  \(.permalink // "")"' <<<"$r" | tee -a "$REPORT"
  else
    log "  ultimi post: non leggibili ($e)"
  fi
  r=$(ig GET "$IG_ID/content_publishing_limit?fields=config,quota_usage")
  e=$(printf '%s' "$r" | errore)
  if [ -z "$e" ]; then
    log "  pubblicazioni nelle ultime 24 ore: $(jq -r '.data[0].quota_usage // "-"' <<<"$r") su $(jq -r '.data[0].config.quota_total // "-"' <<<"$r")"
  else
    log "  limite di pubblicazione: non leggibile ($e)"
  fi
  log ""
  log "Prova completata: nessuna pubblicazione effettuata."
}

# pubblica una foto su Instagram: {"azione": "pubblica-instagram", "approvata_da": "...", "file": "public/social/x.jpg", "testo": "..."}
pubblica_instagram() {
  local f=$1 appr url file testo ct r e cid st mid i
  log ""
  log "== Pubblicazione su Instagram =="
  appr=$(jq -r '.approvata_da // empty' "$f")
  if [ -z "$appr" ]; then
    log "ERRORE: manca approvata_da: su Instagram si pubblica solo con l'ok esplicito di Fabio"
    return 1
  fi
  log "Approvazione: $appr"
  serve_ig || return 1
  url=$(jq -r '.immagine // empty' "$f")
  file=$(jq -r '.file // empty' "$f")
  if [ -z "$url" ] && [ -n "$file" ]; then
    case "$file" in
      public/*) url="https://fabio.treart-evolution.com/${file#public/}" ;;
      *) log "ERRORE: «file» deve stare in public/ (viene pubblicato sull'anteprima)"; return 1 ;;
    esac
  fi
  if [ -z "$url" ]; then
    log "ERRORE: manca l'immagine («file» oppure «immagine»)"
    return 1
  fi
  testo=$(jq -r '.testo // ""' "$f")
  ct=$(curl -sSIL -m 30 "$url" 2>/dev/null | tr -d '\r' | grep -i '^content-type:' | tail -n 1 | cut -d' ' -f2)
  case "$ct" in
    image/jpeg*) ;;
    *) log "ERRORE: l'immagine deve essere un JPEG raggiungibile online ($url: ${ct:-non raggiungibile})"; return 1 ;;
  esac
  account_ig || return 1
  log "Account: @$IG_USER · immagine: $url"
  r=$(ig POST "$IG_ID/media" --data-urlencode "image_url=$url" --data-urlencode "caption=$testo")
  e=$(printf '%s' "$r" | errore)
  cid=$(jq -r '.id // empty' <<<"$r" 2>/dev/null)
  if [ -n "$e" ] || [ -z "$cid" ]; then
    log "ERRORE: preparazione del post non riuscita: ${e:-risposta senza id}"
    return 1
  fi
  for i in $(seq 1 24); do
    st=$(ig GET "$cid?fields=status_code" | jq -r '.status_code // empty' 2>/dev/null)
    [ "$st" = FINISHED ] && break
    if [ "$st" = ERROR ] || [ "$st" = EXPIRED ]; then
      log "ERRORE: Instagram non ha accettato l'immagine (stato $st)"
      return 1
    fi
    sleep 5
  done
  r=$(ig POST "$IG_ID/media_publish" --data-urlencode "creation_id=$cid")
  e=$(printf '%s' "$r" | errore)
  mid=$(jq -r '.id // empty' <<<"$r" 2>/dev/null)
  if [ -n "$e" ] || [ -z "$mid" ]; then
    log "ERRORE: pubblicazione non riuscita: ${e:-risposta senza id}"
    return 1
  fi
  r=$(ig GET "$mid?fields=permalink,timestamp")
  log "Pubblicato su Instagram: $(jq -r '.permalink // "(indirizzo non disponibile)"' <<<"$r")"
}

# sola lettura: perché il collegamento di Instagram alla Pagina non riesce
# (portfolio della Pagina e dell'app, Instagram già collegati, account Instagram dei portfolio)
diagnosi_instagram() {
  log ""
  log "== Diagnosi del collegamento con Instagram (sola lettura) =="
  pagina || return 1
  log "Pagina «$PAGE_NAME» (id $PAGE_ID)"
  local c r e bid bids=""
  for c in 'owner_business{id,name}' 'business{id,name}' 'instagram_business_account{id,username}' \
           'connected_instagram_account{id,username}' 'connected_page_backed_instagram_account{id,username}' \
           does_viewer_have_page_permission_link_ig has_transitioned_to_new_page_experience is_owned; do
    r=$(graph "$PAGE_TOKEN" GET "$PAGE_ID?fields=$c")
    e=$(printf '%s' "$r" | errore)
    if [ -z "$e" ]; then
      log "  ${c%%\{*}: $(jq -c 'del(.id) | if . == {} then "(vuoto)" else . end' <<<"$r")"
      bids="$bids $(jq -r '.owner_business.id // .business.id // empty' <<<"$r")"
    else
      log "  ${c%%\{*}: non leggibile ($e)"
    fi
  done
  diagnosi
  r=$(graph "$META_TOKEN" GET "me/businesses?fields=id")
  bids="$bids $(jq -r '.data[]?.id' <<<"$r" 2>/dev/null)"
  for bid in $(printf '%s\n' $bids | awk 'NF && !seen[$0]++'); do
    for c in owned_instagram_accounts instagram_accounts; do
      r=$(graph "$META_TOKEN" GET "$bid/$c?fields=id,username")
      e=$(printf '%s' "$r" | errore)
      if [ -z "$e" ]; then
        log "  portfolio $bid, $c: $(jq -r '[.data[]? | "@\(.username // "?") (id \(.id))"] | if length == 0 then "nessuno" else join("; ") end' <<<"$r")"
      else
        log "  portfolio $bid, $c: non leggibile ($e)"
      fi
    done
  done
  log ""
  log "Diagnosi completata: nessuna modifica effettuata."
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
    copertina) copertina "$f" || stato=1 ;;
    cerca-categorie) cerca_categorie "$f" || stato=1 ;;
    categorie) categorie "$f" || stato=1 ;;
    diagnosi-instagram) diagnosi_instagram || stato=1 ;;
    prova-instagram) prova_instagram || stato=1 ;;
    pubblica-instagram) pubblica_instagram "$f" || stato=1 ;;
    *) log "ERRORE: azione «$az» non riconosciuta"; stato=1 ;;
  esac
done
exit "$stato"
