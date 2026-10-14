#!/usr/bin/env bash
set -euo pipefail

API="${API:-http://localhost:8080}"
KEY="${IDEMGATE_API_KEY:-dev-secret-change-me}"
FP="${FP:-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855}"

echo "== Health =="
curl -sf "$API/actuator/health" | tee /tmp/idemgate-health.json
echo

echo "== Double-click: first claim =="
R1=$(curl -sf -X POST "$API/v1/operations/claim" \
  -H "Content-Type: application/json" -H "X-Api-Key: $KEY" \
  -d "{\"scope\":\"demo\",\"key\":\"script-double\",\"fingerprint\":\"$FP\",\"ttlSeconds\":300}")
echo "$R1"

echo "== Double-click: second claim =="
R2=$(curl -sf -X POST "$API/v1/operations/claim" \
  -H "Content-Type: application/json" -H "X-Api-Key: $KEY" \
  -d "{\"scope\":\"demo\",\"key\":\"script-double\",\"fingerprint\":\"$FP\",\"ttlSeconds\":300}")
echo "$R2"

OP=$(echo "$R1" | sed -n 's/.*"operationId":"\([^"]*\)".*/\1/p')
echo "== Complete $OP =="
curl -sf -X POST "$API/v1/operations/$OP/complete" \
  -H "Content-Type: application/json" -H "X-Api-Key: $KEY" \
  -d '{"status":"COMPLETED","responseStatus":200,"responseBody":"{\"ok\":true}"}'
echo

echo "== Replay after complete =="
curl -sf -X POST "$API/v1/operations/claim" \
  -H "Content-Type: application/json" -H "X-Api-Key: $KEY" \
  -d "{\"scope\":\"demo\",\"key\":\"script-double\",\"fingerprint\":\"$FP\"}"
echo

echo "== UNKNOWN crash path =="
R3=$(curl -sf -X POST "$API/v1/operations/claim" \
  -H "Content-Type: application/json" -H "X-Api-Key: $KEY" \
  -d "{\"scope\":\"demo\",\"key\":\"script-crash\",\"fingerprint\":\"$FP\"}")
echo "$R3"
OP3=$(echo "$R3" | sed -n 's/.*"operationId":"\([^"]*\)".*/\1/p')
curl -sf -X POST "$API/v1/operations/$OP3/complete" \
  -H "Content-Type: application/json" -H "X-Api-Key: $KEY" \
  -d '{"status":"UNKNOWN","responseStatus":500,"responseBody":"{\"reason\":\"crash\"}"}'
echo
echo "Demo finished."
