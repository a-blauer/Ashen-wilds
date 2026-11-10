# Pictures of vaelric.blend:  python3 render_vaelric.py [sheet names…]   -> renders/*.png
# Sheets: turn (4 views), head, torso, sword, phase2, compare (the game's own model next to the new one), hero (a dark, moody shot)
import bpy, math, os, sys
from mathutils import Vector as V3
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = HERE + '/renders'
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=HERE + '/vaelric.blend')
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = int(os.environ.get('SAMPLES', 40))
sc.cycles.use_denoising = True
sc.view_settings.view_transform = 'Standard'
sc.render.film_transparent = False
sc.render.threads_mode = 'AUTO'
cam = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam'))
sc.collection.objects.link(cam)
sc.camera = cam
world = bpy.data.worlds.new('W')
sc.world = world
world.use_nodes = True
bg = world.node_tree.nodes['Background']


def light(name, kind, energy, color, rot=None, loc=None, size=None):
    L = bpy.data.lights.new(name, kind)
    L.energy = energy
    L.color = color
    if size and kind == 'AREA':
        L.size = size
    if kind == 'SUN':
        L.angle = .2
    o = bpy.data.objects.new(name, L)
    sc.collection.objects.link(o)
    if rot:
        o.rotation_euler = rot
    if loc:
        o.location = loc
    return o


def look(o, at):
    d = V3(at) - o.location
    o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def studio():
    for o in [o for o in bpy.data.objects if o.type == 'LIGHT']:
        bpy.data.objects.remove(o)
    bg.inputs[0].default_value = (.045, .052, .068, 1)      # the game test sheet's grey-blue
    bg.inputs[1].default_value = 1.0
    k = light('Key', 'SUN', 3.2, (1, .97, .92))
    k.location = (3, -5, 6)
    look(k, (0, 0, 2))
    f = light('Fill', 'SUN', 1.1, (.75, .82, 1))
    f.location = (-5, -2, 3)
    look(f, (0, 0, 2))
    r = light('Rim', 'SUN', 1.6, (1, .8, .8))
    r.location = (-2, 6, 5)
    look(r, (0, 0, 2))


def moody():
    for o in [o for o in bpy.data.objects if o.type == 'LIGHT']:
        bpy.data.objects.remove(o)
    bg.inputs[0].default_value = (.012, .008, .012, 1)
    k = light('Key', 'SUN', 3.0, (1, .9, .82))
    k.location = (4, -5, 7)
    look(k, (0, 0, 2))
    r = light('Rim', 'SUN', 5, (1, .12, .16))
    r.location = (-4, 5, 4)
    look(r, (0, 0, 2.5))
    f = light('Fill', 'SUN', .5, (.5, .6, 1))
    f.location = (-5, -3, 2)
    look(f, (0, 0, 2))


def shot(name, views, w, h, cy, dist, fov=22, cx=0.0):
    """views: directions the camera sits in (game style: x, up, forward)"""
    from PIL import Image
    ims = []
    cam.data.angle = math.radians(fov)
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.resolution_percentage = 100
    for i, d in enumerate(views):
        v = V3((d[0], -d[2], d[1])).normalized() * dist
        cam.location = V3((cx, 0, cy)) + v
        look(cam, (cx, 0, cy))
        sc.render.filepath = '%s/_%s_%d.png' % (OUT, name, i)
        bpy.ops.render.render(write_still=True)
        ims.append(Image.open(sc.render.filepath).convert('RGB'))
    sheet = Image.new('RGB', (w * len(ims), h))
    for i, im in enumerate(ims):
        sheet.paste(im, (i * w, 0))
        os.remove('%s/_%s_%d.png' % (OUT, name, i))
    sheet.save('%s/%s.png' % (OUT, name))
    print('wrote', name)


def show(colls):
    for c in bpy.data.collections:
        c.hide_render = c.name not in colls


S = float(os.environ.get('SCALE', 1))
px = lambda v: int(v * S)
want = sys.argv[1:] or ['turn', 'head', 'torso']
V4 = [[0, .1, 1], [1, .08, 0], [.7, .15, .7], [-.4, .15, -1]]
studio()
show(['Vaelric'])
if 'turn' in want:
    shot('turn', V4, px(500), px(1000), 2.05, 14.5)
if 'head' in want:
    shot('head', [[0, .05, 1], [.8, .05, .6], [1, 0, 0], [-.5, .1, -1]], px(600), px(600), 3.75, 3.6)
if 'torso' in want:
    shot('torso', [[0, .1, 1], [.7, .15, .7], [-.7, .15, .7]], px(700), px(700), 2.9, 6.5)
if 'legs' in want:
    shot('legs', [[0, .1, 1], [.7, .15, .7], [1, .1, 0]], px(600), px(700), 1.1, 7)
if 'sword' in want:
    shot('sword', [[-1, .2, .5], [-.6, .3, 1]], px(800), px(700), 1.3, 7, cx=-.6)
if 'phase2' in want:
    show(['Vaelric', 'PhaseII'])
    shot('phase2', [[0, .1, 1], [.7, .15, .7], [-.4, .15, -1]], px(800), px(900), 2.4, 20)
if 'compare' in want:
    show(['GameReference'])
    shot('_old', [V4[0], V4[2], V4[3]], px(500), px(1000), 2.05, 14.5)
    show(['Vaelric'])
    shot('_new', [V4[0], V4[2], V4[3]], px(500), px(1000), 2.05, 14.5)
    from PIL import Image
    a, b = Image.open(OUT + '/_old.png'), Image.open(OUT + '/_new.png')
    s = Image.new('RGB', (a.width, a.height * 2))
    s.paste(a, (0, 0)); s.paste(b, (0, a.height)); s.save(OUT + '/compare.png')
    os.remove(OUT + '/_old.png'); os.remove(OUT + '/_new.png')
if 'pose' in want:
    # a bend check: a stride with the sword raised and the head turned (are the joints and plates holding together?)
    rig = bpy.data.objects['Vaelric_Rig']
    P = {'thL': (-.6, 0, 0), 'knL': (.7, 0, 0), 'thR': (.45, 0, 0), 'knR': (.3, 0, 0), 'shR': (-1.2, 0, -.5), 'elR': (-.9, 0, 0), 'shL': (.3, 0, .5), 'elL': (-.6, 0, 0),
         'head': (0, .5, 0), 'chest': (.1, -.25, 0), 'cp0': (.3, 0, 0), 'cp1': (.2, 0, 0), 'tab': (-.2, 0, 0)}
    from mathutils import Euler, Matrix
    for n, (rx, ry, rz) in P.items():
        pb = rig.pose.bones[n]
        g = Matrix.Rotation(rx, 4, 'X') @ Matrix.Rotation(-rz, 4, 'Y') @ Matrix.Rotation(ry, 4, 'Z')   # the game's x / y / z turns in Blender's axes
        rest = pb.bone.matrix_local.to_3x3().to_4x4()
        pb.matrix_basis = rest.inverted() @ g @ rest
    shot('pose', [[.4, .1, 1], [1, .1, .2], [-.6, .15, -.8]], px(700), px(1000), 2.2, 15.5)
    for pb in rig.pose.bones:
        pb.matrix_basis = Matrix()
if 'hero' in want:
    moody()
    show(['Vaelric', 'PhaseII'] if os.environ.get('P2') else ['Vaelric'])
    shot('hero', [[.55, .0, 1]], px(1000), px(1300), 2.2, 13.5, fov=24)
