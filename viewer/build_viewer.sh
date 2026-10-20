#!/usr/bin/env bash
# Build the animation viewer: the game build (dist/ashen-wilds.html) + viewer/pre.js (virtual clock, before the game)
# + viewer/viewer.css + viewer/viewer.js (after the game)  ->  dist/kq-anim-viewer.html
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
PY
T=$(mktemp -d);python3 -c "import re,sys;t=open('viewer/viewer.js').read();open(sys.argv[1],'w').write(t)" "$T/v.js";node --check "$T/v.js";node --check viewer/pre.js
echo "VIEWER_OK dist/kq-anim-viewer.html ($(wc -c <dist/kq-anim-viewer.html) bytes)"
