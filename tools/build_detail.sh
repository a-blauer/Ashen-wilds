#!/usr/bin/env bash
# Build the detail test page (owner's request, Oct 29 2026): Kindlelight I at 1× / 2× / 4× detail with a frame counter.
#   tools/build_detail.sh        (runs ./build.sh first; AW_NOBUILD=1 to reuse dist/ as it is)
# Output: dist/detail/index.html + game.js (published as its own private artifact, never over the game) and dist/detail.html
# (one file, for the tests). Not committed (.gitignore): build it when publishing.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
if [ -z "${AW_NOBUILD:-}" ]; then out=$(./build.sh 2>&1) || true; case "$out" in *BUILD_OK*) ;; *) echo "$out" | tail -8; echo "build failed"; exit 1;; esac; fi
python3 tools/detail_page.py dist/ashen-wilds.html dist/detail.html
python3 -c "import sys;t=open(sys.argv[1]).read();open(sys.argv[2],'w').write(t[t.rindex('<script>')+8:t.rindex('</script>')])" dist/detail.html dist/detail.check.js
node --check dist/detail.check.js; rm dist/detail.check.js
python3 build/split.py dist/detail.html dist/detail >/dev/null
echo "DETAIL_OK dist/detail (index.html $(wc -c <dist/detail/index.html) bytes, game.js $(wc -c <dist/detail/game.js) bytes) + dist/detail.html"
