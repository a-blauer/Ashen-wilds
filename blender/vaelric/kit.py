# Low-poly modelling kit for building Kill Quest models in Blender (used by build_vaelric.py).
# Everything is written in GAME coordinates (x = his left, y = up, z = forward, metres) and converted to Blender
# (x, -z, y) when the meshes are made. Colours are the game's hex values (what you see on screen); they are converted
# to linear for Blender when written. Faces are flat shaded and carry one colour per corner (the game's vertex colour).
# Three layers, like the game: c = cloth / skin, m = metal, g = glow.
import math
from mathutils import Vector as V3

PI = math.pi
parts = {}          # name -> {'v':[], 'key':{}, 'w':[], 'f':[]}
_cur = [None]
SX = [1]            # 1 = as written (his left, +x), -1 = mirrored to his right


def hx(h):
    return V3((((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255))


def cl(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def sh(c, k):
    return V3((cl(c[0] * k), cl(c[1] * k), cl(c[2] * k)))


def mix(a, b, t):
    return a.lerp(b, cl(t))


def smooth(t):
    t = cl(t)
    return t * t * (3 - 2 * t)


def s2l(c):
    return tuple(((x + .055) / 1.055) ** 2.4 if x > .04045 else x / 12.92 for x in c)


def part(name):
    _cur[0] = parts.setdefault(name, {'v': [], 'key': {}, 'w': [], 'f': []})


def _bn(b):
    if SX[0] < 0 and b[-1] in 'LR' and b not in ('tab',):
        return b[:-1] + ('R' if b[-1] == 'L' else 'L')
    return b


def addv(p, w):
    P = _cur[0]
    q = (round(p[0] * SX[0], 4), round(p[1], 4), round(p[2], 4))
    i = P['key'].get(q)
    if i is None:
        i = P['key'][q] = len(P['v'])
        P['v'].append(q)
        P['w'].append({_bn(k): v for k, v in w.items()})
    return i


def nrm(pts):
    n = V3((0, 0, 0))
    for i in range(len(pts)):
        a, b = pts[i], pts[(i + 1) % len(pts)]
        n += V3(((a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])))
    return n.normalized() if n.length > 1e-12 else V3((0, 1, 0))


def mean(pts):
    s = V3((0, 0, 0))
    for p in pts:
        s += V3(p)
    return s / len(pts)


def face(pts, col, w, layer='m'):
    """pts: 3 or 4 points (counter-clockwise seen from outside); col: one colour or one per corner; w: weights or one per corner"""
    n = len(pts)
    cols = list(col) if isinstance(col, (list, tuple)) and len(col) == n and isinstance(col[0], V3) else [col] * n
    ws = w if isinstance(w, list) else [w] * n
    idx, cc = [], []
    for i in range(n):
        k = addv(pts[i], ws[i])
        if k in idx:
            continue
        idx.append(k)
        cc.append(cols[i])
    if len(idx) < 3:
        return
    if SX[0] < 0:
        idx.reverse()
        cc.reverse()
    _cur[0]['f'].append((idx, layer, cc))


def _wof(w, ri, p):
    if callable(w):
        return w(p)
    if isinstance(w, list):
        return w[ri]
    return w


def _quad(cor, col, w, layer, crisp, i, j, out):
    """cor: [(point, ring index, column index)] in order; out: a point inside (faces turn away from it) or a direction"""
    pts = [c[0] for c in cor]
    n = nrm(pts)
    fc = mean(pts)
    d = out(fc) if callable(out) else out
    if n.dot(d) < 0:
        cor = cor[::-1]
        pts = pts[::-1]
        n = -n
    if callable(col):
        cc = col(fc, n, i, j) if crisp else [col(c[0], n, c[1], c[2]) for c in cor]
    else:
        cc = col
    face(pts, cc, [_wof(w, c[1], c[0]) for c in cor], layer)


def loft(rings, col, w, layer='m', close=True, crisp=True, cap0=None, cap1=None):
    """skin a stack of rings (lists of points, same count). col(p, normal, ring, side) or a colour."""
    n = len(rings[0])
    for i in range(len(rings) - 1):
        A, B = rings[i], rings[i + 1]
        cen = mean(A + B)
        for j in range(n if close else n - 1):
            k = (j + 1) % n
            _quad([(A[j], i, j), (A[k], i, k), (B[k], i + 1, k), (B[j], i + 1, j)], col, w, layer, crisp, i, j,
                  lambda fc, cen=cen: fc - cen)
    allc = mean([p for r in rings for p in r])
    for rg, cc, ri in ((rings[0], cap0, 0), (rings[-1], cap1, len(rings) - 1)):
        if cc is None:
            continue
        c = mean(rg)
        for j in range(n):
            k = (j + 1) % n
            _quad([(rg[j], ri, j), (rg[k], ri, k), (c, ri, j)], cc, w, layer, True, ri, j, c - allc)


def ring(c, rx, rf, rb=None, n=8, angs=None, pw=1.0, keel=0.0, dy=None):
    """a flat ring round c: angle 0 = front (+z), turning to his left (+x). rf / rb = depth to the front / back."""
    rb = rf if rb is None else rb
    angs = angs or [2 * PI * k / n for k in range(n)]
    out = []
    for a in angs:
        s, co = math.sin(a), math.cos(a)
        s2 = math.copysign(abs(s) ** pw, s)
        c2 = math.copysign(abs(co) ** pw, co)
        front = abs(math.atan2(s, co)) < .3
        out.append(V3((c[0] + rx * s2, c[1] + (dy(a) if dy else 0), c[2] + (rf if co >= 0 else rb) * c2 + (keel if front else 0))))
    return out


def frame(axis, ref):
    axis = V3(axis).normalized()
    ref = V3(ref)
    u = ref - axis * ref.dot(axis)
    if u.length < 1e-5:
        u = V3((1, 0, 0)) - axis * axis[0]
    u.normalize()
    return axis, u, axis.cross(u)


def ringax(c, axis, ref, ra, rb, n=8, a0=0.0):
    """a ring round c in the plane across `axis`: ra along `ref`, rb across it"""
    axis, u, v = frame(axis, ref)
    return [V3(c) + u * (ra * math.cos(a0 + 2 * PI * k / n)) + v * (rb * math.sin(a0 + 2 * PI * k / n)) for k in range(n)]


def tube(path, radii, n, col, w, layer='m', ref=(0, 0, 1), crisp=True, cap0=None, cap1=None, a0=0.0):
    """rings along a path; a radius of 0 at an end makes a point. radii: number or (ra, rb)."""
    path = [V3(p) for p in path]
    rings, tips = [], {}
    for k, p in enumerate(path):
        t = (path[min(k + 1, len(path) - 1)] - path[max(k - 1, 0)])
        r = radii[k]
        ra, rb = r if isinstance(r, tuple) else (r, r)
        if ra == 0:
            tips[k] = p
            continue
        rings.append((k, ringax(p, t, ref, ra, rb, n, a0)))
    rr = [r for _, r in rings]
    ks = [k for k, _ in rings]
    wl = [w[k] for k in ks] if isinstance(w, list) else w
    if len(rr) > 1:
        loft(rr, col, wl, layer, True, crisp, cap0 if 0 not in tips else None, cap1 if len(path) - 1 not in tips else None)
    cen = mean(path)
    for k, p in tips.items():
        rg = rr[0] if k == 0 else rr[-1]
        ri = 0 if k == 0 else len(rr) - 1
        c0 = mean(rg)
        for j in range(n):
            q = (j + 1) % n
            wt = w[k] if isinstance(w, list) else w
            _quad([(rg[j], ri, j), (rg[q], ri, q), (p, ri, j)], col, wt, layer, crisp, ri, j,
                  lambda fc, c0=c0: fc - c0)


def spike(p0, p1, r, n, col, w, layer='m'):
    tube([p0, p1], [r, 0], n, col, w, layer, ref=(0.3, 0.2, 1))


def ball(c, r, n, m, col, w, layer='m', axis=(0, 1, 0), ref=(0, 0, 1), crisp=True):
    """a faceted ball: n sides, m bands from pole to pole along `axis`. r: number or (along ref, along axis, across)."""
    rr = r if isinstance(r, tuple) else (r, r, r)
    axis, u, v = frame(axis, ref)
    c = V3(c)
    path, rad = [], []
    for k in range(m + 1):
        ph = PI * k / m
        path.append(c + axis * (rr[1] * math.cos(ph)))
        s = math.sin(ph)
        rad.append(0 if k in (0, m) else (rr[0] * s, rr[2] * s))
    tube(path[::-1], rad[::-1], n, col, w, layer, ref=u, crisp=crisp)


def sheet(grid, col_out, col_in, w, out, thick=.012, layer='c', crisp=False, layer_in=None):
    """a cloth / plate sheet from a grid of points [row][column], two sided. out: a direction (or f(p)) its outer side faces."""
    R, Cn = len(grid), len(grid[0])
    N = [[V3((0, 0, 0)) for _ in range(Cn)] for _ in range(R)]
    for i in range(R - 1):
        for j in range(Cn - 1):
            pts = [grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]]
            n = nrm(pts)
            d = out(mean(pts)) if callable(out) else out
            if n.dot(d) < 0:
                n = -n
            for a, b in ((i, j), (i, j + 1), (i + 1, j + 1), (i + 1, j)):
                N[a][b] += n
    inner = [[V3(grid[i][j]) - (N[i][j].normalized() * thick if N[i][j].length > 1e-9 else V3((0, 0, 0))) for j in range(Cn)] for i in range(R)]
    for i in range(R - 1):
        for j in range(Cn - 1):
            cs = ((i, j), (i, j + 1), (i + 1, j + 1), (i + 1, j))
            _quad([(grid[a][b], a, b) for a, b in cs], col_out, w, layer, crisp, i, j, out)
            if col_in is not None:
                _quad([(inner[a][b], a, b) for a, b in cs], col_in, w, layer_in or layer, crisp, i, j,
                      (lambda p: -out(p)) if callable(out) else -V3(out))


def strip(pts, width, col, w, out, layer='g', lift=.004):
    """a thin flat ribbon through points lying on a surface (glowing lines, trims). out(p) = the surface's outward direction."""
    pts = [V3(p) for p in pts]
    L, Rr = [], []
    for k, p in enumerate(pts):
        t = (pts[min(k + 1, len(pts) - 1)] - pts[max(k - 1, 0)]).normalized()
        o = (out(p) if callable(out) else V3(out)).normalized()
        s = t.cross(o).normalized()
        wd = width[k] if isinstance(width, list) else width
        L.append(p + o * lift - s * wd / 2)
        Rr.append(p + o * lift + s * wd / 2)
    for k in range(len(pts) - 1):
        _quad([(L[k], k, 0), (Rr[k], k, 1), (Rr[k + 1], k + 1, 1), (L[k + 1], k + 1, 0)], col, w, layer, True, k, 0,
              (lambda p: out(p)) if callable(out) else V3(out))


class side:
    """with side(-1): … builds the mirrored (his right) copy; bone names ending in L / R swap"""

    def __init__(self, s):
        self.s = s

    def __enter__(self):
        self.o = SX[0]
        SX[0] = self.s

    def __exit__(self, *a):
        SX[0] = self.o
