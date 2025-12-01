#!/bin/sh
set -ex

echo "======================================"
echo "📋 Environment Check"
echo "======================================"
echo "NODE_ENV: ${NODE_ENV:-not set}"
echo "DATABASE_URL: ${DATABASE_URL:0:40}..."
echo "FRONTEND_URL: ${FRONTEND_URL}"
echo "JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "======================================"

if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set!"
  exit 1
fi

echo ""
echo "======================================"
echo "🔄 Running database migrations"
echo "======================================"
npx prisma db push --accept-data-loss --skip-generate || {
  echo "❌ Migration failed!"
  exit 1
}

echo ""
echo "======================================"
echo "🚀 Starting AetheraOS Backend"
echo "======================================"
exec node src/index.js
