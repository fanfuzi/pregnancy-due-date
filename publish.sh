#!/bin/bash
# Pregnancy Calculator Hub - One-click publish script
# Usage: bash publish.sh "commit message"

set -e

SITE_DIR="/Users/linjiongyu/mypro/claudePro/stations/tools/pregnancy-due-date"
cd "$SITE_DIR"

COMMIT_MSG="${1:-feat: new content update}"

echo "🎨 Building Tailwind CSS..."
if [ -f node_modules/.bin/tailwindcss ]; then
    npm run build:css
else
    echo "⚠️  node_modules missing — run 'npm install' once to enable CSS builds."
fi

echo "🔍 Running SEO consistency check..."
npm run check

echo "📝 Adding all changes..."
git add -A

echo "💾 Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG" || {
    echo "⚠️  Nothing to commit or commit failed."
}

echo "🚀 Pushing to GitHub..."
git push origin main

echo "☁️  Deploying to Cloudflare Pages..."
wrangler pages deploy "$SITE_DIR" --project-name=pregnancy-due-date

echo "✅ Done! Don't forget to request indexing in Google Search Console."