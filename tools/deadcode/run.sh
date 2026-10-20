#!/usr/bin/env bash
# Find and remove top-level code nothing can reach (needs node + the typescript package: npm i -g typescript).
#   tools/deadcode/run.sh            report only: writes /tmp/kq_stripped.html and lists what it would remove
# Names used by tests (inside their JavaScript strings) and the few looked up dynamically (window[name]) are kept.
# Always rebuild, run the tests and check the game loads before keeping anything this finds.
set -e
cd "$(dirname "$0")"
python3 - <<'PY'
import re,glob,io,tokenize
w=set()
for f in glob.glob('../../test/*.py'):
    for t in tokenize.generate_tokens(io.StringIO(open(f,errors='ignore').read()).readline):
        if t.type==tokenize.STRING or t.type==getattr(tokenize,'FSTRING_MIDDLE',-1): w|=set(re.findall(r'[A-Za-z_$][\w$]*',t.string))
for f in glob.glob('../../test/*.js'):
    if 'vendor' not in f: w|=set(re.findall(r'[A-Za-z_$][\w$]*',open(f,errors='ignore').read()))
w|={'kqsWolf','kqsShade','fxbHammerModel','fxaBombModel','fxaPierceModel'}
open('keep.txt','w').write('\n'.join(sorted(w)))
PY
(cd ../.. && ./build.sh >/dev/null)
node strip.js ../../dist/ashen-wilds.html /tmp/kq_stripped.html
echo "removed names: /tmp/kq_stripped.html.removed.txt"
node undecl.js ../../dist/ashen-wilds.html /tmp/kq_stripped.html
node domcheck.js ../../dist/ashen-wilds.html /tmp/kq_stripped.html
