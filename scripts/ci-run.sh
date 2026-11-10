#!/usr/bin/env bash
# What CI runs, inside `firebase emulators:exec` (which starts empty Firestore and
# Storage emulators and exports their addresses): build the site, start it, then
# run the smoke test and the end-to-end test against it.
#
#   npx firebase emulators:exec --only firestore,storage --project demo-fquad "bash scripts/ci-run.sh"
set -euo pipefail

export NODE_ENV=production
export SESSION_SECRET="${SESSION_SECRET:-ci-only-secret-0123456789-abcdefghijklmnopqrstuvwxyz}"
PORT="${PORT:-3002}"

# Never test whatever else happens to be listening on the port.
if curl -s -o /dev/null -m 2 "http://localhost:$PORT"; then
  echo "Port $PORT is already in use; set PORT to a free port." >&2
  exit 1
fi

npm run build

npx next start -p "$PORT" > server.log 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT

for _ in $(seq 1 40); do
  curl -sf "http://localhost:$PORT/api/health" > /dev/null && break
  sleep 2
done

bash scripts/smoke-test.sh "http://localhost:$PORT"
node scripts/e2e-setup.mjs
bash scripts/e2e-test.sh "http://localhost:$PORT"
