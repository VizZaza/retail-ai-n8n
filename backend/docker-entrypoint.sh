#!/usr/bin/env sh
set -e

echo "Waiting for postgres..."
until node -e "require('net').connect(5432,'postgres').on('error',()=>process.exit(1)).on('connect',()=>process.exit(0))"; do
  sleep 1
done

echo "Running migrations..."
npx prisma migrate deploy

echo "Seeding (idempotent)..."
node dist/seed.js || true

echo "Starting API..."
exec node dist/index.js
