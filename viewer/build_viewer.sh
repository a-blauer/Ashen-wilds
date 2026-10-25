#!/usr/bin/env bash
# Build the animation viewer: the game build (dist/ashen-wilds.html) + viewer/pre.js (virtual clock, before the game)
# + viewer/viewer.css + viewer/viewer.js (after the game)  ->  dist/kq-anim-viewer.html (one file, what the tests load)
# and dist/viewer/index.html + dist/viewer/game.js (what is published)
set -e
cd "$(dirname "$0")/.."
./build.sh >/dev/null
python3 - <<'PY'
h=open('dist/ashen-wilds.html',encoding='utf-8').read()
pre=open('viewer/pre.js',encoding='utf-8').read();css=open('viewer/viewer.css',encoding='utf-8').read();js=open('viewer/viewer.js',encoding='utf-8').read()
h=h.replace('<title>Kill Quest</title>','<title>Kill Quest Animation Viewer</title>',1)
i=h.index('<link rel="stylesheet"');h=h[:i]+'<script>'+pre+'</script>\n'+h[i:]
h=h.replace('</head>','<style>'+css+'</style></head>',1)
h=h.replace('<body>','<body><div id="kvBoot">Kill Quest · Animation Viewer<small>Loading the game models…</small></div>',1)
j=h.rindex('</body>');h=h[:j]+'<script>'+js+'</script>'+h[j:]
open('dist/kq-anim-viewer.html','w',encoding='utf-8').write(h)
# the publish build: a small page (markup, styles, the clock and the viewer) that loads the game script as game.js,
# so a later session can re-read the live page before republishing (the script goes up as a supporting file)
import os
k=h.index('<script>'+js);g0=h.rindex('<script>',0,k);g1=h.index('</script>',g0)
os.makedirs('dist/viewer',exist_ok=True)
page=h[:g0]+'<script src="game.js"></script>'+h[g1+9:]
open('dist/viewer/index.html','w',encoding='utf-8').write(page);open('dist/viewer/game.js','w',encoding='utf-8').write(h[g0+8:g1])
print('VIEWER_SPLIT dist/viewer index.html',len(page),'· game.js',g1-g0-8)
PY
T=$(mktemp -d);python3 -c "import re,sys;t=open('viewer/viewer.js').read();open(sys.argv[1],'w').write(t)" "$T/v.js";node --check "$T/v.js";node --check viewer/pre.js
echo "VIEWER_OK dist/kq-anim-viewer.html ($(wc -c <dist/kq-anim-viewer.html) bytes)"
