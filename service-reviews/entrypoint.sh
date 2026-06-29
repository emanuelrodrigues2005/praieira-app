#!/bin/sh
set -e

echo "==> Aguardando PostgreSQL ficar pronto..."
attempt=0
until npx prisma migrate deploy 2>/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "Could not apply migrations after $attempt attempts. Exiting."
    exit 1
  fi
  echo "   PostgreSQL ainda não está pronto — aguardando 2s..."
  sleep 2
done

echo "==> Iniciando aplicação..."
exec node dist/main
