#!/usr/bin/env bash
# Push .env.local vars to Vercel (run from mediconnect-lite/)
set -euo pipefail
if [[ ! -f .env.local ]]; then
  echo "Missing .env.local"
  exit 1
fi
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^#.*$ ]] && continue
  [[ -z "$line" ]] && continue
  key="${line%%=*}"
  val="${line#*=}"
  echo "Setting $key..."
  printf '%s' "$val" | npx vercel env add "$key" production --force 2>/dev/null || \
    printf '%s' "$val" | npx vercel env add "$key" production
done < .env.local
echo "Done. Redeploy with: npx vercel --prod"
