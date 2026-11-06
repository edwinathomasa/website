#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "🧹 [1/5] Removing existing build artifacts, caches, and node_modules..."
rm -rf node_modules package-lock.json dist .vite

echo "🧼 [2/5] Verifying npm cache..."
npm cache verify

echo "📦 [3/5] Performing clean dependency install..."
npm install

echo "⚙️  [4/5] Running fresh production build..."
npm run build

echo "🚀 [5/5] Launching production preview server..."
npm run preview -- --open
