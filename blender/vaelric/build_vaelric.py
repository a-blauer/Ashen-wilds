# Lord Vaelric (the Citadel Sovereign, the final boss) rebuilt in Blender.
#   python3 build_vaelric.py        -> vaelric.blend, vaelric.glb   (needs `pip install bpy`)
# Same character, skeleton and size as the game model (src/js/3725-v204-vaelric-cage.js): his joints are read from
# ref/game_model.json (exported from the game), so the Blender model fits the game's rig and animations.
# Style rules kept (docs/MODEL_DETAIL_RECIPE.md): low poly, flat shaded facets, vertex colour paint, glow as its own layer.
import bpy, bmesh, json, math, os, sys
from mathutils import Vector as V3, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import kit
from kit import *

REF = json.load(open(HERE + '/ref/game_model.json'))
J = {j['n']: V3(j['w']) for j in REF['joints']}
PAR = {j['n']: j['p'] for j in REF['joints']}
X, Y, Z = V3((1, 0, 0)), V3((0, 1, 0)), V3((0, 0, 1))

# the game's palette (3725, VLR202C) plus a few steps of it
C = dict(pl=hx(0x1e1418), pl2=hx(0x4a0c18), ed=hx(0x6a1420), gd=hx(0x8a6a32), gd2=hx(0x5a4422), lt=hx(0x24140f), ml=hx(0x2c2a30),
         cl=hx(0x420812), cl2=hx(0x2a0510), cin=hx(0x160810), sk=hx(0x9a8e9c), hr=hx(0xc4c0cc), hr2=hx(0x8a8694), glow=hx(0xff3050),
         bone=hx(0xc8bca8), steel=hx(0x8a1424))
C['gdh'] = hx(0xb08a3a)      # the bright gold of the game's sword guard
C['plh'] = hx(0x30222a)      # black plate catching light
C['dk'] = hx(0x0c0709)


def lerp(a, b, t):
    return a + (b - a) * t


def along(pts, y):
    """the point at height y on a chain of joints (hip-knee-ankle, shoulder-elbow-wrist)"""
    for a, b in zip(pts, pts[1:]):
        if y >= b[1]:
            t = cl((a[1] - y) / (a[1] - b[1]), -1, 2)
            return V3((lerp(a[0], b[0], t), y, lerp(a[2], b[2], t)))
    a, b = pts[-2], pts[-1]
    t = (a[1] - y) / (a[1] - b[1])
    return V3((lerp(a[0], b[0], t), y, lerp(a[2], b[2], t)))


# eight sides with a narrow strip down the front (the gilded ridge of a plate)
A8 = [.17, .95, 1.75, 2.55, 2 * PI - 2.55, 2 * PI - 1.75, 2 * PI - .95, 2 * PI - .17]
A16 = [.1, .45, .85, 1.25, 1.65, 2.1, 2.55, 2.95]
A16 = A16 + [2 * PI - a for a in A16[::-1]]


def banded(cols, ridge=None, back=None):
    """a plate's paint: one colour per band down the loft; the front strip gilded; the back half darker"""

    def f(p, n, i, j):
        c = cols[min(i, len(cols) - 1)]
        if ridge is not None and n[2] > .93 and c is not C['gd'] and c is not C['gdh']:
            return ridge
        if back is not None and n[2] < -.2 and c is not C['gd']:
            return mix(c, back, .75)
        return c

    return f


# ------------------------------------------------------------------------------------------------ legs
def legs():
    th, kn, ft = J['thL'], J['knL'], J['ftL']
    ch = [V3((th[0], 2.6, 0)), th, kn, ft]
    R = lambda y, rx, rf, rb=None, **k: ring(along(ch, y), rx, rf, rb, **k)
    part('Undersuit')
    loft([R(2.34, .19, .2), R(2.05, .19, .2), R(1.45, .15, .155), R(1.2, .14, .145), R(.95, .125, .13), R(.2, .09, .1)], sh(C['ml'], .8),
         [{'hips': .6, 'thL': .4}, {'thL': 1}, {'thL': 1}, {'thL': .5, 'knL': .5}, {'knL': 1}, {'knL': .5, 'ftL': .5}], 'c')
    # cuisse: the thigh plate, two lames at the top, a gilded ridge, a gold rim over the knee
    part('Cuisse')
    loft([R(2.1, .2, .205, .2, angs=A8), R(2.06, .222, .232, .215, angs=A8), R(1.9, .215, .228, .205, angs=A8), R(1.88, .228, .24, .215, angs=A8),
          R(1.86, .212, .224, .2, angs=A8), R(1.56, .182, .196, .172, angs=A8), R(1.5, .176, .19, .166, angs=A8), R(1.46, .19, .204, .178, angs=A8)],
         banded([C['pl'], C['pl2'], C['gd'], C['pl'], C['pl2'], C['pl'], C['gd']], ridge=C['gd'], back=C['pl']), {'thL': 1})
    # poleyn: a pointed knee cop with a short spike and a fan on the outside
    part('Poleyn')
    k = kn + V3((0, 0, .09))
    loft([ringax(k + V3((0, 0, -.05)), Z, X, .175, .2, 8, PI / 8), ringax(k + V3((0, 0, .06)), Z, X, .15, .17, 8, PI / 8),
          ringax(k + V3((0, .01, .13)), Z, X, .075, .085, 8, PI / 8)],
         banded([C['pl'], C['pl2']]), {'knL': 1}, cap1=C['gd'])
    loft([ringax(k + V3((0, 0, .058)), Z, X, .158, .178, 8, PI / 8), ringax(k + V3((0, 0, .075)), Z, X, .15, .17, 8, PI / 8)], C['gd'], {'knL': 1})
    spike(k + V3((0, .01, .12)), k + V3((0, .07, .27)), .05, 4, lambda p, n, i, j: mix(C['gd2'], C['gdh'], (p[2] - k[2] - .12) / .15), {'knL': 1})
    o = V3((kn[0] + .13, kn[1], kn[2] + .04))
    tube([o, o + V3((.1, .02, -.03)), o + V3((.2, .07, -.09))], [(.045, .12), (.03, .1), 0], 4, lambda p, n, i, j: mix(C['pl2'], C['gd'], (p[0] - o[0]) / .2),
         {'knL': 1}, ref=Z, crisp=False)
    # greave: a shaped shin plate, a calf bulge at the back, a gilded ridge, a flared gold cuff over the foot
    part('Greave')
    loft([R(1.1, .168, .18, .165, angs=A8), R(1.04, .15, .165, .17, angs=A8), R(.82, .142, .15, .182, angs=A8), R(.5, .116, .125, .13, angs=A8),
          R(.33, .106, .115, .115, angs=A8), R(.27, .13, .14, .135, angs=A8)],
         banded([C['gd'], C['pl2'], C['pl2'], C['pl2'], C['gd']], ridge=C['gd'], back=C['pl']), {'knL': 1})
    # sabaton: a pointed, keeled plate shoe in lames, a spur at the heel
    part('Sabaton')
    a = V3((ft[0], 0, ft[2]))

    def prof(z, w, h, y0=0.0):
        return [a + V3((-w, y0, z)), a + V3((-w * .96, y0 + h * .55, z)), a + V3((0, y0 + h, z)), a + V3((w * .96, y0 + h * .55, z)), a + V3((w, y0, z))]

    st = [(-.17, .075, .16), (-.1, .115, .27), (.03, .126, .24), (.16, .128, .15), (.17, .134, .16), (.31, .116, .11), (.32, .12, .12), (.46, .08, .08)]
    rr = [prof(*s) for s in st]
    tip = a + V3((0, .03, .74))
    sc = [C['pl'], C['pl'], C['pl2'], C['gd'], C['pl'], C['gd'], C['pl2']]
    loft(rr, lambda p, n, i, j: sh(C['pl'], .6) if n[1] < -.8 else sc[i], {'ftL': 1}, cap0=C['pl'])
    for j in range(5):
        q = (j + 1) % 5
        pts = [rr[-1][j], rr[-1][q], tip]
        if nrm(pts).dot(mean(pts) - (a + V3((0, .04, .4)))) < 0:
            pts.reverse()
        face(pts, [C['gd2'], C['gd2'], C['gdh']] if pts[2] is tip else C['gd'], {'ftL': 1})
    spike(a + V3((0, .13, -.16)), a + V3((0, .2, -.34)), .03, 4, C['gd'], {'ftL': 1})


# ------------------------------------------------------------------------------------------------ hips
SK = [(2.56, .37, .265, .295), (2.3, .43, .31, .34), (1.74, .5, .34, .38)]      # the skirt's rings: y, half width, front, back


def skirt_pt(a, y, off=0.0):
    """a point on the skirt's surface at angle a (0 = front) and height y"""
    for (y0, x0, f0, b0), (y1, x1, f1, b1) in zip(SK, SK[1:]):
        if y >= y1:
            t = cl((y0 - y) / (y0 - y1))
            rx, rf, rb = lerp(x0, x1, t), lerp(f0, f1, t), lerp(b0, b1, t)
            s, co = math.sin(a), math.cos(a)
            p = V3((rx * s, y, (rf if co >= 0 else rb) * co))
            n = V3((s / rx, 0, co / (rf if co >= 0 else rb))).normalized()
            return p + n * off, n
    return skirt_pt(a, SK[-1][0], off)


def hips():
    wh = {'hips': 1}
    part('Undersuit')
    loft([ring((0, 2.56, 0), .33, .23, .26, 10), ring((0, 2.3, 0), .38, .25, .28, 10), ring((0, 2.02, 0), .3, .2, .22, 10)], sh(C['ml'], .7), wh, 'c', cap1=sh(C['ml'], .5))
    # the mail skirt, a dagged hem
    part('MailSkirt')
    n = 20
    g = []
    for y in (2.54, 2.3, 2.02, 1.78):
        g.append([skirt_pt(2 * PI * k / n, y - (.1 if y < 1.8 and k % 2 else 0))[0] for k in range(n)])
    loft(g, lambda p, nn, i, j: sh(C['ml'], (.72, 1, .8)[i]), wh, 'c')
    # the fauld: two hoops of plate under the belt
    part('Fauld')
    f = lambda y, o: [skirt_pt(a, y, o)[0] for a in A16]
    loft([f(2.56, .012), f(2.44, .03), f(2.42, .042), f(2.415, .02), f(2.3, .04), f(2.28, .052)],
         banded([C['pl2'], C['gd'], C['pl'], C['pl'], C['gd']], back=C['pl']), wh)
    # tassets: pointed plates over each thigh (front and side), gilded edges
    part('Tassets')

    def tasset(a0, hw, y0, y1, o):
        us = [-1, -.8, 0, .8, 1]
        rows = [(0, 1), (.42, 1), (.74, .8), (1, 0.02)]
        g = [[skirt_pt(a0 + hw * u * wk, lerp(y0, y1, t) + (.0 if t < 1 else 0) - .05 * t * (1 - abs(u)) * 0, o + .02 * t)[0] for u in us] for t, wk in rows]
        col = lambda p, nn, i, j: C['gd'] if j in (0, 3) or i == 2 and False else (C['pl2'] if i < 2 else C['ed'])
        sheet(g, col, sh(C['pl'], .6), wh, lambda p: V3((p[0], 0, p[2])), thick=.02, layer='m', crisp=True)

    def both():
        tasset(.78, .36, 2.3, 1.72, .055)
        tasset(1.62, .42, 2.32, 1.8, .06)

    for s in (1, -1):
        with side(s):
            both()
    # the belt: leather, gold studs, a gold buckle with a blood ruby
    part('Belt')
    bl = lambda y, o: [skirt_pt(2 * PI * k / 16, y, o)[0] for k in range(16)]
    loft([bl(2.535, .03), bl(2.55, .045), bl(2.63, .045), bl(2.645, .03)], lambda p, nn, i, j: C['lt'] if i == 1 else sh(C['lt'], .6), wh)
    for k in range(16):
        a = 2 * PI * (k + .5) / 16
        if math.cos(a) > .9:
            continue
        p, nn = skirt_pt(a, 2.59, .045)
        spike(p - nn * .005, p + nn * .028, .022, 4, C['gd'], wh)
    p, nn = skirt_pt(0, 2.59, .05)
    ball(p, (.075, .03, .085), 6, 2, C['gd'], wh, axis=Z, ref=X)
    ball(p + Z * .02, (.03, .025, .045), 4, 2, C['glow'], wh, 'g', axis=Z, ref=X)
    # the tabard: crimson, gold borders, a swallow tail, his sigil
    part('Tabard')
    xs = [-.16, -.128, 0, .128, .16]
    ys = [2.55, 2.3, 2.0, 1.72, 1.5]
    tz = lambda y: .33 + .12 * ((2.55 - y) / 1.05) + .05 * ((2.55 - y) / 1.05) ** 2
    g = [[V3((x * (1 + .12 * (2.55 - y)), y - (.16 if i == 4 and x != 0 else 0), tz(y) - .01 * abs(x) / .16)) for x in xs] for i, y in enumerate(ys)]
    wf = lambda p: (lambda t: {'hips': 1} if t <= 0 else {'hips': 1 - t, 'tab': t})(cl((2.5 - p[1]) / .9))
    sheet(g, lambda p, nn, i, j: C['gd'] if j in (0, 3) else (C['gd2'] if i == 3 else mix(C['cl'], C['pl2'], .5)), C['cl2'], wf, Z, thick=.014, crisp=True)
    e = V3((0, 2.2, tz(2.2) + .012))
    ball(e, (.06, .012, .085), 4, 2, C['gd'], wf(e), axis=Z, ref=X)
    ball(e + Z * .008, (.026, .012, .04), 4, 2, C['glow'], wf(e), 'g', axis=Z, ref=X)


# ------------------------------------------------------------------------------------------------ torso
# the cuirass rings: y, half width, front, back, squareness, keel
TR = [(2.56, .357, .252, .283, 1, 0), (2.7, .34, .245, .27, 1, .0), (2.86, .378, .285, .29, 1, .01), (3.02, .435, .345, .33, .85, .02),
      (3.18, .468, .375, .35, .8, .03), (3.32, .472, .35, .35, .82, .02), (3.44, .43, .285, .32, .9, .0), (3.53, .29, .21, .235, 1, 0)]


def torso_ring(y, off=0.0, angs=A16):
    for a, b in zip(TR, TR[1:]):
        if y <= b[0] or b is TR[-1]:
            t = cl((y - a[0]) / (b[0] - a[0]))
            v = [lerp(a[k], b[k], t) for k in range(1, 6)]
            return ring((0, y, 0), v[0] + off, v[1] + off, v[2] + off, angs=angs, pw=v[3], keel=v[4])


def torso_pt(a, y, off=0.0):
    r = torso_ring(y, off, [a - .02, a, a + .02])
    n = (r[2] - r[0]).cross(Y).normalized()
    if n.dot(V3((r[1][0], 0, r[1][2]))) < 0:
        n = -n
    return r[1], n


def torso():
    wy = lambda p: {'hips': .5, 'spine': .5} if p[1] < 2.6 else {'spine': 1} if p[1] < 2.8 else {'spine': .5, 'chest': .5} if p[1] < 2.95 else {'chest': 1}
    part('Cuirass')
    ys = [2.56, 2.7, 2.86, 3.02, 3.18, 3.32, 3.44, 3.5, 3.53]

    def col(p, n, i, j):
        if i >= 7:
            return C['gd']
        if n[2] > .96 and p[1] > 2.9 and abs(p[0]) < .12:
            return C['gd']
        if p[1] < 2.86:
            return C['pl']
        f = cl(n[2] * 1.5) * cl(1.25 - abs(p[0]) / .36)
        return mix(C['pl'], C['pl2'], .9 * f) if n[2] > -.1 else sh(C['pl'], .85)

    loft([torso_ring(y) for y in ys], col, wy, crisp=False, cap1=C['pl'])
    # the plackart: the belly plate laid over the breastplate, rising to a point under the ruby, gilded along its top
    part('Plackart')
    top = lambda a: 2.9 + .2 * max(0, 1 - abs(math.atan2(math.sin(a), math.cos(a))) / .55) ** 1.3
    g0 = torso_ring(2.57, .016)
    g1 = torso_ring(2.72, .02)
    g2 = [torso_pt(a, top(a) - .035, .024)[0] for a in A16]
    g3 = [torso_pt(a, top(a), .024)[0] for a in A16]
    g4 = [torso_pt(a, top(a) + .004, .004)[0] for a in A16]
    loft([g0, g1, g2, g3, g4], lambda p, n, i, j: C['gd'] if i >= 2 else (sh(C['pl'], .9) if n[2] < 0 else mix(C['pl'], C['pl2'], .5 * i)), wy)
    loft([torso_ring(2.72, .03), torso_ring(2.735, .03)], C['gd2'], wy)
    # the blood ruby at the sternum in a gold sigil ring, blood veins running out over the breastplate (glow)
    part('Sigil')
    p, n = torso_pt(0, 3.2, .0)
    wc = {'chest': 1}
    loft([ringax(p + n * .004, n, Y, .07, .095, 6), ringax(p + n * .028, n, Y, .085, .11, 6), ringax(p + n * .03, n, Y, .05, .07, 6)], C['gd'], wc, cap0=None)
    ball(p + n * .03, (.07, .03, .05), 6, 2, C['glow'], wc, 'g', axis=n, ref=Y)
    # the gorget: rings of plate up the neck, lower under the chin
    part('Gorget')
    dy = lambda a: -.075 * (.5 + .5 * math.cos(a))
    c = V3((0, 0, .01))
    wn = lambda p: {'chest': 1} if p[1] < 3.55 else {'chest': .5, 'neck': .5}
    loft([ring(c + Y * 3.5, .27, .2, .225, 12), ring(c + Y * 3.57, .215, .175, .19, 12), ring(c + Y * 3.67, .175, .162, .165, 12, dy=dy),
          ring(c + Y * 3.7, .19, .178, .178, 12, dy=dy)], banded([C['pl2'], C['pl'], C['gd']]), wn)
    loft([ring(c + Y * 3.56, .225, .185, .2, 12), ring(c + Y * 3.575, .225, .185, .2, 12)], C['gd'], wn)


def collar():
    """the vampire lord's high collar: rises behind the head to two swept points, open at the front, crimson inside"""
    part('Collar')
    cols, rows = 17, 4
    g = []
    for i in range(rows):
        v = i / (rows - 1)
        row = []
        for j in range(cols):
            a = lerp(-2.5, 2.5, j / (cols - 1))                 # 0 = the back
            aa = abs(a)
            peak = math.exp(-((aa - 1.15) / .45) ** 2)
            h = (.4 + .2 * peak) * smooth((2.45 - aa) / 1.0) + .04
            R1 = .33 + .1 * peak + .05 * smooth((aa - 1.9) / .6)
            r = lerp(.25, R1, v ** 1.5)
            row.append(V3((math.sin(a) * r * 1.05, 3.49 + h * v, -math.cos(a) * r * (.95 if math.cos(a) > 0 else .8) - .03 * v)))
        g.append(row)
    out = lambda p: V3((p[0], -.1, p[2] + .02))
    sheet(g, lambda p, n, i, j: mix(C['pl'], C['pl2'], .2 + .25 * i), lambda p, n, i, j: mix(C['cl'], C['ed'], .2 + .4 * i), {'chest': 1}, out,
          thick=.016, layer='m', layer_in='c', crisp=True)
    e = g[-1]
    for j in range(cols - 1):
        tube([e[j], e[j + 1]], [.016, .016], 4, C['gd'], {'chest': 1}, ref=Y)


# ------------------------------------------------------------------------------------------------ arms
def skull(c, s, w, fwd=Z, up=Y):
    """a small trophy skull facing fwd: cranium, cheeks and jaw, dark sockets, burning eyes"""
    fwd, up = V3(fwd).normalized(), V3(up).normalized()
    rt = up.cross(fwd).normalized()
    P = lambda x, y, z: V3(c) + rt * (x * s) + up * (y * s) + fwd * (z * s)
    bc = lambda p, n, i, j: sh(C['bone'], .75 + .3 * cl(n.dot(up) * .5 + .5))
    ball(P(0, .15, -.1), (s * .95, s * .9, s * 1.1), 6, 4, bc, w, 'c', axis=up, ref=fwd)
    loft([[P(-.55, -.35, .55), P(.55, -.35, .55), P(.6, -.35, -.3), P(-.6, -.35, -.3)], [P(-.4, -1.05, .6), P(.4, -1.05, .6), P(.45, -.95, -.1), P(-.45, -.95, -.1)]],
         lambda p, n, i, j: sh(C['bone'], .62 + .2 * cl(n.dot(fwd))), w, 'c', cap1=sh(C['bone'], .5))
    for q in (-1, 1):
        e = P(q * .4, .05, .9)
        face([P(q * .4 - .26, .1, .9), P(q * .4, -.2, .86), P(q * .4 + .26, .12, .82), P(q * .4, .3, .88)][::q], C['dk'], w, 'c')
        ball(e + fwd * (s * .04), s * .11, 4, 2, C['glow'], w, 'g', axis=fwd, ref=up)
    face([P(-.1, -.3, .9), P(0, -.5, .88), P(.1, -.3, .9), P(0, -.12, .93)], C['dk'], w, 'c')
    for k in range(4):
        x = -.3 + k * .2
        face([P(x - .015, -.72, .62), P(x + .015, -.72, .62), P(x + .015, -1.0, .62), P(x - .015, -1.0, .62)], C['dk'], w, 'c')


PC = V3((.7, 3.3, -.01))


def pauldron_pt(ph, th, k=1.0):
    """a point on the pauldron's dome: ph from its pole (up and out), th round it (0 = out and down, 90° = front)"""
    w = V3((math.sin(.42), math.cos(.42), 0))
    u = V3((math.cos(.42), -math.sin(.42), 0))
    return PC + (w * (.31 * math.cos(ph)) + (u * (.37 * math.cos(th)) + Z * (.41 * math.sin(th))) * math.sin(ph)) * k


def arms():
    shd, el, hd = J['shL'], J['elL'], J['hdL']
    ch = [shd + V3((-.02, .2, 0)), shd, el, hd]
    R = lambda y, r, **k: ring(along(ch, y), r, r * 1.05, **k)
    part('Undersuit')
    loft([R(3.36, .13), R(3.1, .125), R(2.8, .108), R(2.64, .1), R(2.5, .095), R(2.04, .07)], sh(C['ml'], .8),
         [{'chest': .5, 'shL': .5}, {'shL': 1}, {'shL': 1}, {'shL': .5, 'elL': .5}, {'elL': 1}, {'elL': .5, 'hdL': .5}], 'c')
    # pauldron: three lames, each with a gold rim, shingled down the shoulder; three horns curving up and back
    part('Pauldron')
    wp = {'shL': .7, 'chest': .3}
    n = 12
    for li, (p0, p1, k, c0, c1) in enumerate([(0, .95, 1.0, C['pl'], C['plh']), (.86, 1.36, .97, C['pl2'], C['ed']), (1.27, 1.74, .93, C['pl'], C['plh'])]):
        rings = []
        phs = [p0 + (p1 - p0) * t for t in ((.0, .5, 1) if li == 0 else (0, .55, 1))]
        for ph in phs + [p1 + .07, p1 + .075]:
            kk = k * (1.035 if ph > p1 else 1) * (.9 if ph > p1 + .072 else 1)
            sc = lambda th: .1 * math.cos(2 * th) * (ph / 1.7)
            rings.append([pauldron_pt(max(ph + sc(2 * PI * j / n), .001), 2 * PI * j / n, kk) for j in range(n)])
        if li == 0:
            rings = rings[1:]
            top = pauldron_pt(0, 0, k)
            for j in range(n):
                face([rings[0][j], rings[0][(j + 1) % n], top], c0, wp)
        nb = len(rings) - 1
        loft(rings, lambda p, nn, i, j, c0=c0, c1=c1, nb=nb: C['gd'] if i >= nb - 2 else mix(c0, c1, .2 + .6 * i / max(1, nb - 2)), wp)
    hc = lambda p, nn, i, j: mix(C['gd2'], C['gdh'], (i / 3) ** 1.5)
    for th, ph, L in ((1.75, .62, .24), (3.14, .5, .34), (4.5, .62, .2)):
        b = pauldron_pt(ph, th, .97)
        d = (b - PC).normalized()
        up = (d + Y * .9).normalized()
        tube([b - up * .03, b + up * (L * .4) + X * .04, b + up * (L * .75) + V3((.05, .05, -.07)), b + up * L + V3((-.02, .12, -.2))], [.05, .04, .024, 0], 5, hc, wp, ref=Z, crisp=False)
    # rerebrace: two lames on the upper arm
    part('Rerebrace')
    loft([R(3.02, .15, angs=A8), R(2.9, .152, angs=A8), R(2.875, .162, angs=A8), R(2.86, .146, angs=A8), R(2.76, .136, angs=A8), R(2.735, .147, angs=A8)],
         banded([C['pl2'], C['gd'], C['pl'], C['pl'], C['gd']], back=C['pl']), {'shL': 1})
    # couter: the elbow cop, a spike to the back
    part('Couter')
    e = el + V3((.01, 0, -.07))
    loft([ringax(e + Z * .08, -Z, X, .15, .15, 8, PI / 8), ringax(e - Z * .02, -Z, X, .13, .13, 8, PI / 8), ringax(e - Z * .07, -Z, X, .06, .06, 8, PI / 8)],
         banded([C['pl'], C['pl2']]), {'elL': 1})
    loft([ringax(e - Z * .018, -Z, X, .137, .137, 8, PI / 8), ringax(e - Z * .032, -Z, X, .13, .13, 8, PI / 8)], C['gd'], {'elL': 1})
    spike(e - Z * .06, e + V3((.03, .1, -.3)), .05, 4, lambda p, nn, i, j: mix(C['gd2'], C['gdh'], (e[2] - p[2]) / .3), {'elL': 1})
    # vambrace: flared at the elbow, a gold cuff at the wrist, a glowing rune line down the outside
    part('Vambrace')
    vy = [2.56, 2.52, 2.3, 2.15, 2.11, 2.06]
    vr = [.132, .12, .11, .094, .1, .114]
    loft([R(y, r, angs=A8) for y, r in zip(vy, vr)], lambda p, nn, i, j: C['gd'] if i in (0, 4) else (C['pl2'] if nn[0] > .25 else C['pl']), {'elL': 1})
    pts = [along(ch, y) + X * (lerp(.12, .094, (2.5 - y) / .35) + .0) for y in (2.5, 2.4, 2.3, 2.2, 2.15)]
    strip(pts, [.012, .02, .02, .02, .008], C['glow'], {'elL': 1}, X, 'g', .005)


def claw_hand():
    """his left hand: an open, clawed gauntlet"""
    part('Hand_L')
    h = J['hdL']
    w = {'hdL': 1}
    r3 = lambda y, rx, rz, x=0, z=0: ring(V3((h[0] + x, y, h[2] + .01 + z)), rx, rz, n=6)
    loft([r3(2.07, .066, .08), r3(1.98, .058, .09, -.005), r3(1.88, .046, .095, -.012, .005), r3(1.83, .036, .085, -.016, .005)],
         lambda p, n, i, j: C['pl2'] if n[0] > .3 and i < 2 else C['pl'], w, cap1=C['pl'])
    base = V3((h[0] - .016, 1.84, h[2] + .015))
    for k in range(4):
        z = -.066 + k * .044
        L = (.95, 1.08, 1.0, .82)[k]
        p0 = base + V3((0, 0, z))
        fan = V3((0, 0, (k - 1.5) * .022))
        p1 = p0 + (V3((-.012, -.1, 0)) + fan) * L
        p2 = p1 + (V3((-.045, -.085, 0)) + fan) * L
        p3 = p2 + (V3((-.07, -.07, 0)) + fan * .6) * L
        tube([p0, p1, p2, p3], [.023, .021, .017, 0], 4, lambda p, n, i, j: (C['pl'], C['pl'], C['gd2'])[min(i, 2)] if i < 2 else C['gd'], w, ref=X)
    p0 = V3((h[0] - .01, 1.97, h[2] + .085))
    tube([p0, p0 + V3((-.02, -.07, .06)), p0 + V3((-.05, -.13, .08)), p0 + V3((-.1, -.18, .07))], [.027, .024, .018, 0], 4,
         lambda p, n, i, j: C['pl'] if i < 2 else C['gd'], w, ref=X)


SW_T = .7                                                  # the sword's tilt in the fist (VLR202.tilt)
SW_M = Matrix.Translation(J['swd']) @ Matrix.Rotation(SW_T, 4, 'X')


def fist_hand():
    """his right hand: closed round the sword's grip"""
    part('Hand_R')
    h = J['hdR']
    w = {'hdR': 1}
    g = J['swd']
    d = (SW_M.to_3x3() @ Z).normalized()
    c = g - d * .11 + V3((-.0, .0, 0))
    loft([ring(V3((h[0], 2.07, h[2] + .01)), .066, .08, n=6), ring(V3((h[0] + .01, 1.98, h[2] + .012)), .06, .085, n=6), ring(lerp(V3(h), c, .75) + V3((0, .03, 0)), .062, .09, n=6)],
         lambda p, n, i, j: C['pl2'] if n[0] < -.3 and i < 1 else C['pl'], w)
    ball(c, (.1, .085, .078), 6, 3, lambda p, n, i, j: C['pl2'] if n[0] < -.5 else (C['pl'] if (j + i) % 2 else C['plh']), w, axis=X, ref=d)
    tube([c + V3((.05, .03, .05)), c + d * .09 + V3((.04, -.0, .0)), c + d * .12 + V3((-.03, -.03, .0))], [.03, .027, .02], 4, C['pl'], w, cap1=C['pl'])


# ------------------------------------------------------------------------------------------------ head
def head():
    """his head from the game (the sculpted face keeps his identity), its colours kept; the hair, crown and eyes are new"""
    m = [m for m in REF['meshes'] if m['skinned']][0]
    P, Cc, B = m['pos'], m['col'], m['bones']
    n = len(P) // 3
    dom = [B[m['si'][i * 4 + max(range(4), key=lambda k: m['sw'][i * 4 + k])]] for i in range(n)]
    par = {}

    def f(a):
        while par[a] != a:
            par[a] = par[par[a]]
            a = par[a]
        return a

    tris = []
    for t in range(n // 3):
        if not all(dom[t * 3 + k] in ('head', 'neck') for k in range(3)):
            continue
        ids = [tuple(round(P[(t * 3 + k) * 3 + q], 3) for q in range(3)) for k in range(3)]
        for q in ids:
            par.setdefault(q, q)
        par[f(ids[0])] = f(ids[1])
        par[f(ids[1])] = f(ids[2])
        tris.append((t, ids))
    isl = {}
    for t, ids in tris:
        isl.setdefault(f(ids[0]), []).append(t)
    part('Head')
    for ts in isl.values():
        if len(ts) not in (1660, 16, 12):
            continue
        for t in ts:
            pts, cols, ws = [], [], []
            for k in range(3):
                i = t * 3 + k
                pts.append(V3(P[i * 3:i * 3 + 3]))
                cols.append(V3(Cc[i * 3:i * 3 + 3]))
                ws.append({B[m['si'][i * 4 + q]]: m['sw'][i * 4 + q] for q in range(4) if m['sw'][i * 4 + q] > .01})
            face(pts, cols, ws, 'c')


def hair_crown():
    """white hair swept back from a widow's peak in thick locks, down inside the collar; the thorned crown; burning eyes"""
    part('Hair')
    N = 9
    for k in range(N):
        u = lerp(-1, 1, k / (N - 1))
        au = u * 1.45
        x, z = .158 * math.sin(au), .17 * math.cos(au) + .02
        y0 = 3.985 - .1 * u * u + (.0 if k != N // 2 else -.035)
        path = [V3((x, y0, z)), V3((x * 1.08, 4.125 - .07 * u * u, z * .25 - .04)), V3((x * 1.0, 4.03 - .1 * u * u, -.235 + .07 * u * u)),
                V3((x * .9, 3.8, -.245 + .06 * u * u)), V3((x * .75, 3.6 - .03 * (k % 2), -.2))]
        tone = .6 + .18 * (k % 2) + .1 * abs(u)
        tube(path, [(.034, .006), (.052, .03), (.055, .034), (.045, .028), 0], 5, lambda p, n, i, j, tone=tone: mix(C['hr2'], C['hr'], cl(tone - .12 * i + .25 * n[1])),
             [{'head': 1}, {'head': 1}, {'head': 1}, {'head': .6, 'hr0': .4}, {'hr0': 1}], 'c', ref=X, cap0=C['hr2'])
    part('Crown')
    wh = {'head': 1}
    dy = lambda a: -.035 * (.5 - .5 * math.cos(a))
    cr = lambda y, o: ring((0, y, -.01), .2 + o, .215 + o, .255 + o, 12, dy=dy)
    loft([cr(4.0, 0), cr(4.0, .012), cr(4.045, .012), cr(4.045, 0)], lambda p, n, i, j: C['gd'] if i == 1 else C['gd2'], wh)
    rg = cr(4.04, .004)
    for k in range(12):
        if k in (6,):
            continue
        b = rg[k]
        o = V3((b[0], 0, b[2] + .01)).normalized()
        L = (.24, .1, .17, .09, .15, .1, 0, .1, .15, .09, .17, .1)[k]
        tube([b - Y * .02, b + Y * (L * .55) + o * (.02 + L * .1), b + Y * L + o * (L * .32)], [.022, .014, 0], 4,
             lambda p, n, i, j: mix(C['gd2'], C['gdh'], .3 + .7 * i), wh, ref=X)
    ball(rg[0] + Z * .012, (.022, .014, .032), 4, 2, C['glow'], wh, 'g', axis=Z, ref=X)
    part('Eyes')
    for q in (-1, 1):
        e = V3((q * .075, 3.832, .176))
        pts = [e + V3((-q * .03, -.007, .0)), e + V3((0, -.011, .004)), e + V3((q * .03, .009, -.006)), e + V3((0, .011, .004))]
        face(pts if nrm(pts)[2] > 0 else pts[::-1], C['glow'], wh, 'g')


def wings():
    """Phase II: bat wings (an arm, a thumb claw, four fingers, scalloped membranes) and the halo of blood over the crown"""
    part('Wings')
    th = .35
    W0 = J['wgL']
    T = lambda p: W0 + V3((p[0] * math.cos(th) + p[2] * math.sin(th), p[1], -p[0] * math.sin(th) + p[2] * math.cos(th)))
    E = V3((1.15, .55, 0))
    tips = [E + V3(t) for t in ((1.25, .35, -.04), (1.0, -.55, -.04), (.55, -1.1, -.02), (0, -1.3, 0))]
    wa, wf = {'wgL': 1}, {'wfL': 1}
    bone = lambda p, n, i, j: mix(C['lt'], hx(0x3a2420), .4 + .3 * n[1])
    tube([T(V3((0, 0, 0))), T(V3((.6, .4, -.04))), T(E)], [.08, .062, .05], 5, bone, wa, cap0=C['lt'])
    ball(T(E), .075, 5, 3, bone, wa)
    tube([T(E), T(E + V3((.02, .14, .0))), T(E + V3((-.06, .27, .0)))], [.034, .024, 0], 4, lambda p, n, i, j: mix(C['hr2'], C['hr'], i), wa)
    for k, t in enumerate(tips):
        mid = E + (t - E) * .5 + V3((.04, .07, 0))
        tube([T(E), T(mid), T(t), T(t + (t - mid).normalized() * .16)], [.042, .03, .016, 0], 4,
             lambda p, n, i, j: bone(p, n, i, j) if i < 2 else C['hr'], wf)

    def mem(a, b, c, w, sag=.2, n=5):
        """a membrane panel between two bones meeting at a: its free edge b → c sags toward a"""
        edge = []
        for q in range(n + 1):
            t = q / n
            p = b.lerp(c, t)
            edge.append(p + (a - p) * (sag * math.sin(PI * t)))
        mids = [a.lerp(p, .55) for p in edge]
        co = lambda k: (C['cin'], mix(C['cl2'], C['cl'], .7), sh(C['cl2'], .8))[k]
        for q in range(n):
            face([T(a), T(mids[q]), T(mids[q + 1])], [co(0), co(1), co(1)], w, 'c')
            face([T(mids[q]), T(edge[q]), T(edge[q + 1]), T(mids[q + 1])], [co(1), co(2), co(2), co(1)], w, 'c')

    for a, b in zip(tips, tips[1:]):
        mem(E, a, b, wf)
    O = V3((0, 0, 0))
    mem(O, tips[3], V3((.1, -.75, 0)), wa, .15)
    for q in range(3):
        a, b = O.lerp(E, q / 3), O.lerp(E, (q + 1) / 3)
        face([T(a), T(b), T(tips[3])], [C['cin'], C['cin'], sh(C['cl2'], .9)], wa, 'c')


def halo():
    part('Halo')
    c = V3((0, 4.5, -.02))
    n = 20
    P = [c + V3((.27 * math.sin(2 * PI * k / n), 0, .27 * math.cos(2 * PI * k / n))) for k in range(n)]
    for k in range(n):
        tube([P[k], P[(k + 1) % n]], [.018, .018], 4, C['glow'], {'head': 1}, 'g', ref=Y)


# ------------------------------------------------------------------------------------------------ cape
def cape():
    """a heavy cape hung from the shoulders: deep folds that open toward a torn hem"""
    part('Cape')
    cols, rows = 25, 9
    tat = [.0, .1, .02, .22, .04, .0, .14, .3, .05, .0, .18, .03, .26, .02, .12, .0, .2, .06, .0, .28, .04, .15, .0, .1, .02]
    g = []
    for i in range(rows):
        v = i / (rows - 1)
        row = []
        for j in range(cols):
            u = lerp(-1, 1, j / (cols - 1))
            ztop = -.06 - .27 * math.cos(u * PI / 2)
            k = smooth(v / .16)
            x = u * lerp(.5, .52 + .5 * v ** .9, k)
            zh = -.4 - .2 * v + .2 * v * u * u
            z = lerp(ztop, zh, k) + (.012 + .07 * v) * math.cos(u * PI * 6) * k
            y = 3.5 - 2.72 * v - (tat[j] * .9 if i == rows - 1 else 0) + .06 * abs(u) * (1 - v)
            row.append(V3((x, y, z)))
        g.append(row)

    def wf(p):
        y = p[1]
        a, b, c = J['cp0'][1], J['cp1'][1], J['cp2'][1]
        if y > a + .1:
            return {'chest': 1}
        if y > a - .3:
            t = (a + .1 - y) / .4
            return {'chest': 1 - t, 'cp0': t}
        if y > b:
            t = cl((y - b) / .5)
            return {'cp0': .5 + .5 * t, 'cp1': .5 - .5 * t} if t < 1 else {'cp0': 1}
        if y > c:
            t = cl((y - c) / .5)
            return {'cp1': .5 + .5 * t, 'cp2': .5 - .5 * t} if t < 1 else {'cp1': 1}
        t = cl((c - y) / .4)
        return {'cp1': .5 - .5 * t, 'cp2': .5 + .5 * t} if t < 1 else {'cp2': 1}

    def co(p, n, i, j):
        u = lerp(-1, 1, j / (cols - 1))
        v = i / (rows - 1)
        fold = .5 + .5 * math.cos(u * PI * 6)          # 1 on a fold's crest (toward the back), 0 in its valley
        c = mix(C['cl2'], C['cl'], .25 + .75 * fold * smooth(v * 3 + .3))
        c = mix(c, C['cin'], .55 * smooth((v - .72) / .28))
        return sh(c, 1.08 - .2 * v)

    sheet(g, co, lambda p, n, i, j: mix(C['cin'], C['cl2'], .4 * i / rows), wf, lambda p: V3((p[0] * .3, 0, -1)), thick=.02)
    # gold clasp plates where the cape leaves the shoulders
    for s in (1, -1):
        with side(s):
            ball(V3((.33, 3.49, .2)), (.055, .02, .07), 6, 2, C['gd'], {'chest': 1}, 'm', axis=V3((0, .5, 1)), ref=X)


# ------------------------------------------------------------------------------------------------ sword
def sword():
    """the flamberge: a wave-edged blade of blood steel, a glowing fuller, a bat-winged gold guard, a ruby pommel"""
    part('Sword')
    w = {'swd': 1}
    T = lambda x, y, z: (SW_M @ V3((x, y + .0, z)).to_4d()).to_3d()
    # blade: a diamond section, both edges waving together
    st = []
    N = 26
    for k in range(N + 1):
        t = k / N
        z = .12 + 2.2 * t
        hw = .062 if t < .06 else lerp(.092, .05, t) * (1 if t < .93 else lerp(1, .45, (t - .93) / .07))
        off = .017 * math.sin((t - .08) * PI * 2 * 5.5) * smooth((t - .06) / .06) * (1 - smooth((t - .9) / .1))
        st.append((z, hw, off, .034 * (1 - .55 * t)))
    for a, b in zip(st, st[1:]):
        for sy in (1, -1):
            for sx in (1, -1):
                q = [T(a[2], sy * a[3], a[0]), T(a[2] + sx * a[1], 0, a[0]), T(b[2] + sx * b[1], 0, b[0]), T(b[2], sy * b[3], b[0])]
                ctr = T(0, 0, (a[0] + b[0]) / 2)
                if nrm(q).dot(mean(q) - ctr) < 0:
                    q.reverse()
                    cc = [C['edge'], C['bl0'], C['bl0'], C['edge']]
                else:
                    cc = [C['bl0'], C['edge'], C['edge'], C['bl0']]
                face(q, cc, w)
    z1, hw1, of1, th1 = st[-1]
    tip = T(of1 * 0, 0, 2.44)
    for sy in (1, -1):
        for sx in (1, -1):
            q = [T(of1, sy * th1, z1), T(of1 + sx * hw1, 0, z1), tip]
            if nrm(q).dot(mean(q) - T(0, 0, z1)) < 0:
                q.reverse()
            face(q, C['edge'], w)
    # the fuller: a channel of light down both faces, rune marks beside it
    for sy in (1, -1):
        pts = [T(0, sy * (.034 * (1 - .55 * ((z - .12) / 2.2))), z) for z in (.2, .5, .9, 1.3, 1.62)]
        strip(pts, [.014, .016, .014, .012, .003], C['glow'], w, (SW_M.to_3x3() @ V3((0, sy, 0))), 'g', .003)
        for k in range(5):
            z = .42 + k * .26
            p = T(0, sy * (.036 * (1 - .55 * ((z - .12) / 2.2))) + sy * .004, z)
            face([p + (T(.0, 0, .04) - T(0, 0, 0)), p + (T(.026, 0, 0) - T(0, 0, 0)), p - (T(0, 0, .04) - T(0, 0, 0)), p - (T(.026, 0, 0) - T(0, 0, 0))][::sy], C['glow'], w, 'g')
    # the guard: a block, two wings sweeping out and forward to points, a barb under each, a ruby on both faces
    D = lambda x, y, z: SW_M.to_3x3() @ V3((x, y, z))
    gc = lambda p, n, i, j: mix(C['gd2'], C['gdh'], .35 + .65 * cl(n.dot(D(0, 1, 0)) * .5 + .5))
    ball(T(0, 0, .06), (.075, .1, .06), 6, 2, gc, w, axis=D(0, 0, 1), ref=D(1, 0, 0))
    for sx in (1, -1):
        tube([T(0, 0, .05), T(sx * .17, 0, .03), T(sx * .31, 0, .08), T(sx * .39, 0, .19), T(sx * .4, 0, .34)], [(.05, .045), (.05, .04), (.042, .032), (.03, .024), 0], 5,
             lambda p, n, i, j: mix(C['gd2'], C['gdh'], .3 + .2 * i), w, ref=D(0, 1, 0))
        tube([T(sx * .2, 0, .04), T(sx * .27, 0, -.04), T(sx * .3, 0, -.13)], [(.035, .028), (.026, .02), 0], 4, C['gd'], w, ref=D(0, 1, 0))
        tube([T(sx * .07, 0, .1), T(sx * .12, 0, .22), T(sx * .1, 0, .33)], [(.04, .03), (.028, .02), 0], 4, C['gd'], w, ref=D(0, 1, 0))
    for sy in (1, -1):
        ball(T(0, sy * .05, .06), (.035, .02, .05), 4, 2, C['glow'], w, 'g', axis=D(0, sy, 0), ref=D(0, 0, 1))
    # the grip: leather, three gold wire bands; a faceted gold pommel with a ruby
    tube([T(0, 0, -.31), T(0, 0, .02)], [.036, .04], 6, C['lt'], w, ref=D(1, 0, 0))
    for z in (-.25, -.16, -.07):
        tube([T(0, 0, z - .014), T(0, 0, z + .014)], [.046, .046], 6, C['gd'], w, ref=D(1, 0, 0), cap0=C['gd2'], cap1=C['gd2'])
    ball(T(0, 0, -.37), (.07, .075, .07), 6, 3, gc, w, axis=D(0, 0, 1), ref=D(1, 0, 0))
    ball(T(0, 0, -.455), (.035, .045, .035), 4, 2, C['glow'], w, 'g', axis=D(0, 0, 1), ref=D(1, 0, 0))


C['bl0'] = hx(0x3a0812)       # the blade at its ridge
C['edge'] = hx(0x9a2034)      # the blade's edge, catching light


def build_model():
    for s in (1, -1):
        with side(s):
            legs()
            arms()
    hips()
    torso()
    collar()
    claw_hand()
    fist_hand()
    head()
    hair_crown()
    cape()
    for s in (1, -1):
        with side(s):
            wings()
    halo()
    sword()
    part('Trophies')
    skull(pauldron_pt(1.25, 1.35, 1.04), .085, {'shL': .7, 'chest': .3}, fwd=V3((.25, -.1, 1)), up=V3((.1, 1, .1)))
    p, n = skirt_pt(1.2, 2.3, .09)
    skull(p + V3((0, -.02, 0)), .06, {'hips': 1}, fwd=n + V3((0, 0, .3)))
    tube([skirt_pt(1.2, 2.56, .05)[0], p + V3((0, .06, 0))], [.01, .01], 4, C['gd2'], {'hips': 1})


# ================================================================================================ Blender side
LAY = ['c', 'm', 'g']


def to_bl(p):
    return (p[0], -p[2], p[1])


def materials():
    mats = {}
    for k, name, rough, metal in (('c', 'Vaelric_Cloth', .9, .04), ('m', 'Vaelric_Metal', .5, .55), ('g', 'Vaelric_Glow', 1, 0)):
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        nt = m.node_tree
        nt.nodes.clear()
        out = nt.nodes.new('ShaderNodeOutputMaterial')
        at = nt.nodes.new('ShaderNodeVertexColor')
        at.layer_name = 'Col'
        if k == 'g':
            em = nt.nodes.new('ShaderNodeEmission')
            em.inputs['Strength'].default_value = 2.2
            nt.links.new(at.outputs['Color'], em.inputs['Color'])
            nt.links.new(em.outputs[0], out.inputs['Surface'])
        else:
            b = nt.nodes.new('ShaderNodeBsdfPrincipled')
            b.inputs['Roughness'].default_value = rough
            b.inputs['Metallic'].default_value = metal
            nt.links.new(at.outputs['Color'], b.inputs['Base Color'])
            nt.links.new(b.outputs[0], out.inputs['Surface'])
        mats[k] = m
    return mats


def shade(col, n, y):
    """the baked light every md model gets: a top light, darker toward the feet, cool in the shade"""
    k = (.84 + .2 * (n[1] * .5 + .5)) * (.8 + .2 * smooth(y / 3.4))
    c = sh(col, k)
    return mix(c, V3((c[0] * .82, c[1] * .86, c[2] * 1.12)), .3 * max(0, -n[1]))


def make_armature(col):
    arm = bpy.data.armatures.new('Vaelric_Rig')
    ob = bpy.data.objects.new('Vaelric_Rig', arm)
    col.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode='EDIT')
    kids = {}
    for n, p in PAR.items():
        kids.setdefault(p, []).append(n)
    eb = {}
    for n in J:
        b = arm.edit_bones.new(n)
        b.head = to_bl(J[n])
        ks = kids.get(n, [])
        main = {'hips': 'spine', 'spine': 'chest', 'chest': 'neck', 'neck': 'head', 'hdR': None, 'head': None}.get(n, ks[0] if ks else None)
        t = V3(to_bl(J[main])) if main else V3(b.head) + V3((0, 0, .15 if n in ('head', 'root') else -.15))
        if n == 'swd':
            t = V3(to_bl(SW_M @ V3((0, 0, 1))))
        if (t - V3(b.head)).length < .02:
            t = V3(b.head) + V3((0, 0, .1))
        b.tail = t
        eb[n] = b
    for n, p in PAR.items():
        if p:
            eb[n].parent = eb[p]
    bpy.ops.object.mode_set(mode='OBJECT')
    ob.show_in_front = True
    arm.display_type = 'STICK'
    return ob


def make_objects(col, rig, mats, names, skip=False):
    obs = []
    for name, P in kit.parts.items():
        if (name in names) == skip:
            continue
        if not P['f']:
            continue
        me = bpy.data.meshes.new(name)
        me.from_pydata([to_bl(v) for v in P['v']], [], [f[0] for f in P['f']])
        used = [k for k in LAY if any(f[1] == k for f in P['f'])]
        for k in used:
            me.materials.append(mats[k])
        ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER')
        pa = me.color_attributes.new('Paint', 'FLOAT_COLOR', 'CORNER')
        for pi, poly in enumerate(me.polygons):
            idx, lay, cc = P['f'][pi]
            poly.material_index = used.index(lay)
            n = V3((poly.normal[0], poly.normal[2], -poly.normal[1]))
            for q, li in enumerate(poly.loop_indices):
                vi = me.loops[li].vertex_index
                k = idx.index(vi)
                c = cc[k]
                pa.data[li].color = (*s2l(c), 1)
                c2 = c if lay == 'g' else shade(c, n, P['v'][vi][1])
                ca.data[li].color = (*s2l(c2), 1)
        me.color_attributes.active_color = ca
        me.color_attributes.render_color_index = 0
        ob = bpy.data.objects.new(name, me)
        col.objects.link(ob)
        for vi, w in enumerate(P['w']):
            tot = sum(w.values()) or 1
            for b, x in w.items():
                vg = ob.vertex_groups.get(b) or ob.vertex_groups.new(name=b)
                vg.add([vi], x / tot, 'REPLACE')
        ob.parent = rig
        md = ob.modifiers.new('Armature', 'ARMATURE')
        md.object = rig
        obs.append(ob)
    return obs


def reference(col):
    """the game's own model, as exported, in a hidden collection for comparing"""
    vs, fs, cs, ms = [], [], [], []
    for m in REF['meshes']:
        if m['mat']['tr'] or not m['vis'] or (m['joint'] or '')[:2] in ('wg', 'wf'):
            continue
        P = m['pos']
        b = len(vs)
        n = len(P) // 3
        vs += [to_bl(P[i * 3:i * 3 + 3]) for i in range(n)]
        idx = m['idx'] or list(range(n))
        mc = hx(m['mat']['c'])
        lay = 2 if m['mat']['basic'] else (1 if (m['mat']['m'] or 0) > .2 else 0)
        for t in range(len(idx) // 3):
            tri = [idx[t * 3 + k] for k in range(3)]
            fs.append([b + i for i in tri])
            cs.append([V3(m['col'][i * 3:i * 3 + 3]) if m['col'] else mc for i in tri])
            ms.append(lay)
    me = bpy.data.meshes.new('GameModel_v204')
    me.from_pydata(vs, [], fs)
    for k in LAY:
        me.materials.append(bpy.data.materials['Vaelric_' + {'c': 'Cloth', 'm': 'Metal', 'g': 'Glow'}[k]])
    ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER')
    for pi, poly in enumerate(me.polygons):
        poly.material_index = ms[pi]
        for q, li in enumerate(poly.loop_indices):
            ca.data[li].color = (*s2l(cs[pi][q]), 1)
    ob = bpy.data.objects.new('GameModel_v204', me)
    col.objects.link(ob)
    return ob


def bake_ao(obs):
    """real ambient occlusion from Cycles, baked into the vertex colours (creases, under plates, inside the cape)"""
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = 24
    sc.cycles.device = 'CPU'
    if not sc.world:
        sc.world = bpy.data.worlds.new('World')
    sc.world.light_settings.distance = .45
    for ob in obs:
        me = ob.data
        ao = me.color_attributes.new('AO', 'FLOAT_COLOR', 'CORNER')
        me.color_attributes.active_color = ao
        bpy.ops.object.select_all(action='DESELECT')
        ob.select_set(True)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.bake(type='AO', target='VERTEX_COLORS')
        ca = me.color_attributes['Col']
        glow = [i for i, m in enumerate(me.materials) if m.name.endswith('Glow')]
        for poly in me.polygons:
            if poly.material_index in glow:
                continue
            for li in poly.loop_indices:
                a = ao.data[li].color[0]
                k = .5 + .5 * min(1, a * 1.1) ** 1.2
                c = ca.data[li].color
                ca.data[li].color = (c[0] * k, c[1] * k, c[2] * k * (1 + .12 * (1 - k)), 1)
        me.color_attributes.active_color = ca
        me.color_attributes.render_color_index = list(me.color_attributes).index(ca)


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    build_model()
    col = bpy.data.collections.new('Vaelric')
    sc.collection.children.link(col)
    mats = materials()
    rig = make_armature(col)
    PH2 = ('Wings', 'Halo')
    obs = make_objects(col, rig, mats, PH2, True)
    c2 = bpy.data.collections.new('PhaseII')
    sc.collection.children.link(c2)
    ob2 = make_objects(c2, rig, mats, PH2)
    tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in obs)
    print('parts', len(obs), 'triangles', tris)
    for o in obs:
        print('  %-12s %5d' % (o.name, sum(len(p.vertices) - 2 for p in o.data.polygons)))
    if not os.environ.get('NOAO'):
        for o in ob2:
            o.hide_render = True
        bake_ao([o for o in obs if o.name != 'Head'])      # the head keeps the game's own baked face shading
        for o in ob2:
            o.hide_render = False
        bake_ao([o for o in ob2 if o.name == 'Wings'])
    try:
        bpy.ops.export_scene.gltf(filepath=HERE + '/vaelric.glb', export_format='GLB', export_yup=True)
        print('saved vaelric.glb')
    except Exception as e:
        print('glb export failed:', e)
    rc = bpy.data.collections.new('GameReference')
    sc.collection.children.link(rc)
    reference(rc)
    rc.hide_render = True
    rc.hide_viewport = True
    bpy.ops.wm.save_as_mainfile(filepath=HERE + '/vaelric.blend')
    print('saved vaelric.blend')


if __name__ == '__main__':
    main()
