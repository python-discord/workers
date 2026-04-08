#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAGES_DIR="$SCRIPT_DIR/html_files"

for file in "$PAGES_DIR"/*; do
    key=$(basename "$file")
    echo "Uploading $key..."
    npx wrangler kv key put --binding=error_pages --remote "$key" --path "$file"
done

echo "Done."
