#!/usr/bin/env bash
# Build dist/ashen-wilds.html: src/page.html + src/style.css + src/js/*.js (file-name order), then syntax-check.
set -e
cd "$(dirname "$0")"
OUT="${AW_OUT:-$PWD/dist/ashen-wilds.html}"
python3 build/assemble.py src "$OUT"
T=$(mktemp -d)
python3 -c "import sys;t=open(sys.argv[1]).read();open(sys.argv[2],'w').write(t[t.rindex('<script>')+8:t.rindex('</script>')])" "$OUT" "$T/game.js"
node --check "$T/game.js" && echo "BUILD_OK  $OUT ($(wc -c <"$OUT") bytes)"
python3 build/split.py "$OUT" "$(dirname "$OUT")/artifact"
