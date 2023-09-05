#!/bin/sh
set -euo pipefail

DEL_FILE=$(mktemp)
ROBOTS_FILE=$(mktemp)

echo "Removing all keys from Cloudflare KV"
npx wrangler kv:key list --binding=robots_files | jq -r '[.[] | .name]' > $DEL_FILE
npx wrangler kv:bulk delete --binding=robots_files $DEL_FILE -f

echo "== Adding robots.txt files =="

for file in $(find ./robots-files -type f); do
  echo "Processing $file"
  npx wrangler kv:key put --binding=robots_files $(basename $file) "$(cat $file)"
done
