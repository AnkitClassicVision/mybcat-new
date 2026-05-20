#!/usr/bin/env bash
# aac-emit.sh — soft-fail event emitter for AAC v2 ingest.
# Usage: aac-emit.sh <node_id> <event_type> [payload_json]
# Reads env: AAC_HMAC_KEY, AAC_INGEST_ENDPOINT, AAC_AGENT_ID, AAC_TRACE_ID (optional)
# Never exits non-zero. Never blocks a cron.

set -u

node_id="${1:-}"
event_type="${2:-}"
payload="${3:-{\}}"

if [ -z "${AAC_HMAC_KEY:-}" ] || [ -z "${AAC_INGEST_ENDPOINT:-}" ] || [ -z "${AAC_AGENT_ID:-}" ] || [ -z "$node_id" ] || [ -z "$event_type" ]; then
  echo "aac-emit: missing required env or args (agent=${AAC_AGENT_ID:-unset} node=$node_id type=$event_type); skipping" >&2
  exit 0
fi

trace_id="${AAC_TRACE_ID:-$(cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "no-trace-$$-$RANDOM")}"
event_id="$(cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "no-event-$$-$RANDOM")"
ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

if command -v python3 >/dev/null 2>&1; then
  body=$(python3 -c 'import json,sys
event = {
  "event_id": sys.argv[1],
  "trace_id": sys.argv[2],
  "parent_trace_id": None,
  "agent_id": sys.argv[3],
  "node_id": sys.argv[4],
  "event_type": sys.argv[5],
  "timestamp": sys.argv[6],
  "payload": json.loads(sys.argv[7] or "{}"),
}
print(json.dumps(event, separators=(",", ":")))' "$event_id" "$trace_id" "$AAC_AGENT_ID" "$node_id" "$event_type" "$ts" "$payload" 2>/dev/null) || body=""
fi

if [ -z "${body:-}" ]; then
  body="{\"event_id\":\"$event_id\",\"trace_id\":\"$trace_id\",\"parent_trace_id\":null,\"agent_id\":\"$AAC_AGENT_ID\",\"node_id\":\"$node_id\",\"event_type\":\"$event_type\",\"timestamp\":\"$ts\",\"payload\":$payload}"
fi

sig=$(printf '%s' "$body" | openssl dgst -sha256 -hmac "$AAC_HMAC_KEY" 2>/dev/null | awk '{print $NF}')

if [ -z "$sig" ]; then
  echo "aac-emit: openssl unavailable; skipping" >&2
  exit 0
fi

curl -sS --max-time 5 -X POST "$AAC_INGEST_ENDPOINT/events" \
  -H "content-type: application/json" \
  -H "x-aac-agent-id: $AAC_AGENT_ID" \
  -H "x-aac-hmac: $sig" \
  -d "$body" >/dev/null 2>&1 || true

exit 0
