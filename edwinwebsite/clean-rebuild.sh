#!/usr/bin/env bash
set -euo pipefail

# Ensure the script runs from the project root directory
cd "$(dirname "$0")"

echo "🧹 [1/5] Removing existing build artifacts, caches, and node_modules..."
rm -rf node_modules \
       package-lock.json \
       dist \
       build \
       .vite \
       .next \
       .cache \
       .turbo

echo "🧼 [2/5] Forcing npm cache clean..."
npm cache clean --force

echo "📦 [3/5] Performing clean dependency install..."
npm install

echo "⚙️  [4/5] Running fresh production build..."
npm run build

echo "🚀 [5/5] Launching production preview server..."
npm run preview -- --open
