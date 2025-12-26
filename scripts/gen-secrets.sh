#!/usr/bin/env bash
set -euo pipefail

hex32() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
  else
    python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
  fi
}

echo "N8N_ENCRYPTION_KEY=$(hex32)"
echo "N8N_JWT_SECRET=$(hex32)"
echo "JWT_SECRET=$(hex32)"
echo "INTERNAL_API_KEY=$(hex32)"
