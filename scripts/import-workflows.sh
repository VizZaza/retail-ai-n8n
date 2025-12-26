#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "⏳ Waiting for n8n container..."
for i in $(seq 1 60); do
  if docker ps --format '{{.Names}}' | grep -q '^retail-n8n$'; then
    break
  fi
  sleep 1
done

echo "📥 Importing workflows from /files/workflows..."
docker exec -u node retail-n8n n8n import:workflow --separate --input=/files/workflows

echo "✅ Imported. Now open n8n UI, create SMTP credential and assign it to Send Email nodes, then Activate workflows."
