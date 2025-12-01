#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma db push --accept-data-loss

echo "🚀 Starting AetheraOS Backend..."
node src/index.js
