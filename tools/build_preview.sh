#!/usr/bin/env bash
# Build the intro preview page (owner's request, v159): the game build with the preview switched on (src/js/3083).
#   tools/build_preview.sh        (runs ./build.sh first; AW_NOBUILD=1 to reuse dist/ as it is)
# Output: dist/preview/index.html + game.js (published as its own private artifact, never over the game) and
# dist/preview.html (one file). Not committed (.gitignore): build it when publishing.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
if [ -z "${AW_NOBUILD:-}" ]; then out=$(./build.sh 2>&1) || true; case "$out" in *BUILD_OK*) ;; *) echo "$out" | tail -8; echo "build failed"; exit 1;; esac; fi
mkdir -p dist/preview
python3 tools/preview_page.py dist/artifact/index.html dist/preview/index.html
cp dist/artifact/game.js dist/preview/game.js
python3 tools/preview_page.py dist/ashen-wilds.html dist/preview.html
echo "PREVIEW_OK dist/preview (index.html $(wc -c <dist/preview/index.html) bytes, game.js $(wc -c <dist/preview/game.js) bytes) + dist/preview.html"
