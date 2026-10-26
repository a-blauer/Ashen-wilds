#!/usr/bin/env python3
# Plans a GitHub render of the intro video (used by .github/workflows/render.yml; tools/render.sh starts it).
# The video is cut into pieces of SEG frames (5 s at 24 fps). It draws the pieces that tools/render.sh asked for
# (.render-request: {"ranges": [[from_s, to_s or null = the end], ...]} or {"all": true}) plus every piece the last
# render did not leave (first run, Actions cache expired after 7 days unused, other size or fps, a longer video).
# Prints GitHub step outputs: segs (JSON list of piece numbers), n (frames), nseg (pieces).
import json, math, os, re, sys
fps = float(os.environ.get('FPS', '24')); seg = int(os.environ.get('SEG', '120'))
W, H = os.environ.get('W', '1280'), os.environ.get('H', '720')
src = open('src/js/3081-v151-intro-duskhold.js').read()
m = re.search(r'Object\.assign\(IC151,\{len:([\d.]+)', src)
if not m: sys.exit('render_plan: IC151.len not found in 3081 (renamed?)')
L = float(m.group(1)); n = int(round(L * fps)); nseg = math.ceil(n / seg)
req = json.load(open('.render-request')) if os.path.exists('.render-request') else {'all': True}
man = {}
if os.path.exists('segs/manifest.json'):
    try: man = json.load(open('segs/manifest.json'))
    except Exception: man = {}
same = man.get('fps') == fps and str(man.get('w')) == W and str(man.get('h')) == H and man.get('seg') == seg
have = {int(i) for i in man.get('have', []) if os.path.exists('segs/s%03d.mp4' % int(i))} if same else set()
if same and man.get('n') != n and man.get('n'):   # the length changed: the old last piece was short
    have.discard((man['n'] - 1) // seg)
want = set()
if req.get('all'): want = set(range(nseg))
for a, b in req.get('ranges', []):
    b = L if b is None else b
    f0 = max(0, int(math.floor(a * fps))); f1 = min(n, int(math.ceil(b * fps)))
    want |= set(range(f0 // seg, (max(f0, f1 - 1)) // seg + 1))
want |= set(range(nseg)) - have
want = sorted(i for i in want if 0 <= i < nseg)
print('segs=' + json.dumps(want)); print('n=%d' % n); print('nseg=%d' % nseg)
print('plan: %d frames, %d pieces; drawing %d %s; cache had %d' % (n, nseg, len(want), want, len(have)), file=sys.stderr)
