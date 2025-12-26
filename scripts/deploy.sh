#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "❌ Missing .env. Run: cp .env.example .env"
  exit 1
fi

echo "🚀 Deploying containers..."
docker compose pull || true
docker compose up -d --build

echo "⏳ Waiting for API /health through Caddy..."
BASE_DOMAIN_VAL=$(grep -E '^BASE_DOMAIN=' .env | cut -d= -f2)
for i in $(seq 1 60); do
  if curl -fsS -H "Host: api.${BASE_DOMAIN_VAL}" "http://127.0.0.1/health" >/dev/null 2>&1; then
    echo "✅ API is ready"
    break
  fi
  sleep 1
done

echo "✅ Deploy finished."
echo "Open:"
echo "  App:  https://app.$(grep -E '^BASE_DOMAIN=' .env | cut -d= -f2)"
echo "  API:  https://api.$(grep -E '^BASE_DOMAIN=' .env | cut -d= -f2)/health"
echo "  n8n:  https://n8n.$(grep -E '^BASE_DOMAIN=' .env | cut -d= -f2)"
