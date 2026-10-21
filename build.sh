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
# v116: the standalone web version (any browser, no Claude account): the same two files, ready to upload to a static
# host such as itch.io (HTML game, upload the zip) or Netlify Drop. Its saves live on that site, separate from claude.ai.
WEB="$(dirname "$OUT")/web"; mkdir -p "$WEB"; cp "$(dirname "$OUT")/artifact/index.html" "$(dirname "$OUT")/artifact/game.js" "$WEB/"
(cd "$WEB" && rm -f ../kill-quest-web.zip && python3 -c "import zipfile;z=zipfile.ZipFile('../kill-quest-web.zip','w',zipfile.ZIP_DEFLATED);[z.write(f) for f in ('index.html','game.js')];z.close()") && echo "WEB_OK $WEB + $(dirname "$OUT")/kill-quest-web.zip"
