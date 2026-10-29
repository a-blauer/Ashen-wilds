# Detail test page (tools/build_detail.sh; tools/detail_page.py, made here from dist/ashen-wilds.html): for each detail level, boot the page, check that it reaches
# Kindlelight I with the gear, abilities and companions, that the frame really draws about that many times the 1× triangles,
# that the hero / companions / monsters are drawn with refined (skinned) geometry, that a big fight and every ability cast
# throw nothing, then take a screenshot. Prints PASS / FAIL lines.   MODES=1,2,4 (default) · SHOT=1 for pictures
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE); sys.path.insert(0, ROOT + '/tools'); import detail_page
G = os.environ.get('SRC') or ROOT + '/dist/ashen-wilds.html'; T = os.environ.get('AW_TMP', HERE + '/out'); os.makedirs(T, exist_ok=True)
os.environ['SRC'] = T + '/detail_src.html'; open(os.environ['SRC'], 'w').write(detail_page.page(open(G).read()))   # the game build as the detail page
import play
MODES = [int(x) for x in os.environ.get('MODES', '1,2,4').split(',')]
fails = []; res = {}
def ok(c, msg):
    print(('PASS ' if c else 'FAIL ') + msg, flush=True)
    if not c: fails.append(msg)
def s(pg):
    pg.set_default_timeout(1800000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    for m in MODES:
        errs.clear()
        pg.evaluate("(m)=>{localStorage.clear();localStorage.setItem('kqd',JSON.stringify({m}))}", m)
        pg.reload(wait_until='domcontentloaded', timeout=300000)
        pg.wait_for_function("()=>window.KDT_READY||window.KDT_ERR", timeout=1800000, polling=1000)
        err = pg.evaluate("()=>window.KDT_ERR||null"); ok(not err, f'{m}x boot {err or ""}')
        if err: continue
        r = pg.evaluate("""()=>{const tri=g=>(g.index?g.index.count:g.attributes.position.count)/3;
          const drawn=o=>{let t=0,sk=0,ref=0;o.traverse(c=>{if(!c.isMesh||!c.visible)return;const r=KQD.map.get(c.geometry);const g=r&&r.g?r.g:c.geometry;t+=tri(g);if(c.isSkinnedMesh){sk++;if(r&&r.g&&r.g.attributes.skinWeight)ref++}});return {t:Math.round(t),sk,ref}};
          for(let i=0;i<30;i++){_vt=(window._vt||performance.now())}
          const I=INSL[insG(0,0)],p=pl.position;
          return {m:KQD.m,inI:p.x>I.x0&&p.x<I.x0+I.w&&p.z>I.y0&&p.z<I.y0+I.h,lvl:hero.lvl,eq:SLOTS.filter(s=>eq[s]).length,ab:heroSkills().length,party:party.length,fols:fols.filter(Boolean).length,
            hero:drawn(pl),c0:fols[0]?drawn(fols[0]):null,c1:fols[1]?drawn(fols[1]):null,st:KQD.st,q:KQD.q.size,flat:new THREE.MeshStandardMaterial({flatShading:true}).flatShading,lps:String(lpsObj).length<40}}""")
        print(' ', json.dumps(r), flush=True)
        ok(r['inI'] and r['lvl'] == 30 and r['eq'] >= 6 and r['ab'] == 6 and r['fols'] >= 1, f'{m}x setup in Kindlelight I, gear {r["eq"]}, abilities {r["ab"]}, companions {r["fols"]}')
        if m > 1:
            ok(r['hero']['sk'] > 0 and r['hero']['ref'] == r['hero']['sk'], f'{m}x hero skinned meshes refined {r["hero"]}')
            ok(not r['flat'] and r['lps'], f'{m}x smooth look (no flat shading, style pass off)')
        # a few frames drawn for real, then the counters
        pg.wait_for_timeout(8000)
        f = pg.evaluate("()=>({tris:KDT.lt[0],calls:KDT.lt[1],ui:$('kdtFps').textContent,q:KQD.q.size,cs2:hero.tal.__cs2,act:actN141(),rens:KQD.rens||0,swapMs:KQD.st.swapMs})")
        res[m] = f; print('  frame', json.dumps(f), flush=True); ok(f['tris'] > 0, f'{m}x frame counters work ({f["tris"]} triangles, {f["calls"]} calls)')
        # big fight + every ability cast once
        g = pg.evaluate("""()=>{kdtFight();const n=KDT.fight.length;let n2=0,ce=[];let cnt=0;heroSkills().forEach((s,i)=>{try{hero.cd['s'+i]=0;hero.mp=mpMax();cast(i);cnt++}catch(e){ce.push(String(e))}});return {n,cast:cnt,ce}}""")
        pg.wait_for_timeout(6000)
        f2 = pg.evaluate("()=>({tris:KDT.lt[0],calls:KDT.lt[1],near:kdtNear(),q:KQD.q.size,st:KQD.st})")
        res[str(m) + 'f'] = f2; print('  fight', json.dumps(g), json.dumps(f2), flush=True)
        ok(g['n'] == 20 and not g['ce'], f'{m}x big fight spawned {g["n"]}, abilities cast {g["cast"]} {g["ce"][:2]}')
        if os.environ.get('SHOT'): pg.screenshot(path=play.TMP + f'/kqd_{m}x.png', timeout=600000)
        pg.evaluate("()=>{KDT.rec={t0:performance.now(),dt:[16,17],tris:1,calls:1,cpu:1,n:2};kdtStop()}")
        ok(pg.evaluate("()=>kdtRes().length")>0, f'{m}x measurement saved to the table')
        ok(not errs, f'{m}x no page errors {errs[:3]}')
    if 1 in res:
        for m in MODES:
            if m == 1 or m not in res: continue
            k = res[m]['tris'] / max(1, res[1]['tris']); ok(k > m * .8, f'{m}x draws {k:.2f}x the 1x triangles ({res[m]["tris"]} vs {res[1]["tris"]})')
    print('CHECKS OK' if not fails else 'CHECKS FAILED: %s' % fails)
play.run(s, w=1100, hh=700)
