#!/usr/bin/env bash
# Drives the running SEAL Hackathon stack end-to-end over its real HTTP API
# (same calls the React app makes) — no browser required. Verified against
# a `docker compose up -d --build` stack; see SKILL.md for full context.
#
# Usage:
#   ./driver.sh healthcheck   # wait for backend+bff+frontend to report healthy
#   ./driver.sh smoke         # healthcheck + login + create event + verify (default)
#   ./driver.sh login         # login only, prints cookie jar path
#
# Env overrides: BFF_URL (default http://localhost:4001)
#                 FRONTEND_URL (default http://localhost:3000)
#                 BACKEND_URL (default http://localhost:8080)
#                 COORD_EMAIL / COORD_PASSWORD (default seeded coordinator)

set -euo pipefail

BFF_URL="${BFF_URL:-http://localhost:4001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"
COORD_EMAIL="${COORD_EMAIL:-coordinator@seal.edu.vn}"
COORD_PASSWORD="${COORD_PASSWORD:-Coordinator@123}"
JAR="$(mktemp -t seal-cookies.XXXXXX)"
trap 'rm -f "$JAR"' EXIT

log() { echo "[driver] $*" >&2; }

healthcheck() {
  log "waiting for backend, bff, frontend..."
  for i in $(seq 1 60); do
    if curl -sf "$BACKEND_URL/actuator/health" >/dev/null 2>&1 \
      && curl -sf "$BFF_URL/health" >/dev/null 2>&1 \
      && curl -sf "$FRONTEND_URL/" >/dev/null 2>&1; then
      log "all healthy"
      return 0
    fi
    sleep 2
  done
  log "ERROR: services did not become healthy within 120s"
  return 1
}

login() {
  log "logging in as $COORD_EMAIL"
  local resp
  resp="$(curl -sf -c "$JAR" -b "$JAR" -X POST "$BFF_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$COORD_EMAIL\",\"password\":\"$COORD_PASSWORD\"}")"
  echo "$resp" | grep -q '"roles":\["COORDINATOR"\]' || {
    log "ERROR: login response missing COORDINATOR role: $resp"
    return 1
  }
  log "login OK: $resp"
}

csrf_token() {
  grep XSRF-TOKEN "$JAR" | awk '{print $NF}'
}

create_event() {
  local name="Driver smoke $(date +%s)"
  local token
  token="$(csrf_token)"
  log "creating event \"$name\" (csrf=${token:0:8}...)"
  local resp
  resp="$(curl -sf -c "$JAR" -b "$JAR" -X POST "$BFF_URL/api/events" \
    -H "Content-Type: application/json" \
    -H "x-xsrf-token: $token" \
    -d "{\"name\":\"$name\",\"description\":\"created by driver.sh\",\"startDate\":\"2026-09-01\",\"endDate\":\"2026-09-30\",\"rblEnabled\":false}")"
  echo "$resp" | grep -q '"status":"DRAFT"' || {
    log "ERROR: create-event response unexpected: $resp"
    return 1
  }
  log "created OK: $resp"
  echo "$name"
}

verify_listed() {
  local name="$1"
  log "verifying \"$name\" appears in GET /api/events"
  curl -sf -b "$JAR" "$BFF_URL/api/events" | grep -q "$name" || {
    log "ERROR: created event not found in listing"
    return 1
  }
  log "verified: event is persisted and listed"
}

smoke() {
  healthcheck
  login
  local name
  name="$(create_event)"
  verify_listed "$name"
  log "SMOKE TEST PASSED"
}

case "${1:-smoke}" in
  healthcheck) healthcheck ;;
  login) login; log "cookie jar: $JAR"; cat "$JAR" >&2 ;;
  smoke) smoke ;;
  *) echo "unknown command: $1" >&2; exit 1 ;;
esac
