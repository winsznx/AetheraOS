#!/bin/sh
set -e

echo "📋 Environment Check..."
echo "NODE_ENV: ${NODE_ENV}"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..." # Show first 30 chars only

if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set!"
  exit 1
fi

echo "🔄 Running database migrations..."
npx prisma db push --accept-data-loss --skip-generate

echo "🚀 Starting AetheraOS Backend..."
node src/index.js
