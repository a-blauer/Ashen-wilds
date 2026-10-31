# v183: the world painted, not built (3410-v183-env-paint.js). Visits an instance of every zone and draws it, then checks:
#   - the bake ran over the decoration kinds (EP183.kinds >= 150) and over scenery geometry (EP183.geos), no triangles added
#     (every WD kind's triangle count is the same as before the bake would have it: the bake only changes colours)
#   - scenery materials opted in (EP183.mats >= 150), the ground (GTX) is in with ENVDET_G
#   - after drawing, every opted-in material that was drawn has its shared uniforms (uEdT, uEdS, uEdA) on its program
#   - no material of a character (a skinned mesh, anything on a bone, or in a group that holds a skinned body: heroes,
#     monsters, companions, mounts, gear) has ENVDET
#   - no shader compile errors and no console errors; the scan stays cheap (a light scan under 25 ms here)
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m,flush=True)
JS=r"""async()=>{const out={zones:[]};const W=ms=>new Promise(r=>setTimeout(r,ms));
  const tri={};for(const k in WD.T)tri[k]=WD.T[k].parts.reduce((a,p)=>a+(p.g.index?p.g.index.count:p.g.attributes.position.count)/3,0);
  for(const g of [0,6,12,15,22,25,3]){const I=INSL.find(i=>i.g==g);const p=I.wp?I.wp[Math.floor(I.wp.length/2)]:I.ba;toPos(p[0],p[1],0);
    for(let i=0;i<4;i++){await W(400);try{rosterTick()}catch(e){}}ep183Scan();
    try{ren.render(scene,cam)}catch(e){out.err=(out.err||'')+String(e).slice(0,200)}
    let n=0,nu=0;scene.traverse(o=>{if(!o.isMesh||!o.visible)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!m||!m.defines||m.defines.ENVDET===undefined)return;
      const P=ren.properties.get(m);if(!P||!P.uniforms)return;n++;if(!(P.uniforms.uEdT&&P.uniforms.uEdS&&P.uniforms.uEdA))nu++})});
    out.zones.push({n:I.n,drawn:n,noUni:nu})}
  for(let i=0;i<9;i++)ep183Scan();
  const bad=[];scene.traverse(o=>{if(!o.isMesh)return;let a=o,ch=o.isSkinnedMesh;while(a&&a!==scene){if(a.isBone||a.children.some(c=>c.isSkinnedMesh))ch=true;a=a.parent}
    if(!ch)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m&&m.defines&&m.defines.ENVDET!==undefined)bad.push((o.name||o.type)+':'+m.type)})});
  const prog=(ren.info.programs||[]).filter(p=>p.diagnostics&&!p.diagnostics.runnable).map(p=>(p.name||'?')+' '+String(p.diagnostics.fragmentShader&&p.diagnostics.fragmentShader.log||'').slice(0,200));
  const tri2={};for(const k in WD.T)tri2[k]=WD.T[k].parts.reduce((a,p)=>a+(p.g.index?p.g.index.count:p.g.attributes.position.count)/3,0);
  const t0=performance.now();ep183Scan();const scanMs=performance.now()-t0;
  const gm=GTX.list.map(T=>T.mat&&T.mat.defines&&T.mat.defines.ENVDET!==undefined&&T.mat.defines.ENVDET_G!==undefined);
  return Object.assign(out,{kinds:EP183.kinds,geos:EP183.geos,mats:EP183.mats,bad:bad.slice(0,10),nbad:bad.length,prog,scanMs,ground:gm,
    triSame:Object.keys(tri).every(k=>tri[k]===tri2[k]),errs:window.__e183||[]})}"""
def s(pg):
    pg.set_default_timeout(2400000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{window.__e183=[];const oe=console.error;console.error=(...a)=>{window.__e183.push(a.map(String).join(' ').slice(0,200));oe(...a)};return 1}")
    r=pg.evaluate(JS)
    print('kinds',r['kinds'],'geos',r['geos'],'mats',r['mats'],'scan ms %.1f'%r['scanMs'],flush=True)
    for z in r['zones']:print('  %-40s drawn %d, without uniforms %d'%(z['n'],z['drawn'],z['noUni']),flush=True)
    if r['kinds']<150:F('the bake ran over only %d decoration kinds'%r['kinds'])
    if r['geos']<150:F('only %d scenery geometries baked'%r['geos'])
    if r['mats']<150:F('only %d scenery materials have the detail paint'%r['mats'])
    if not r['ground'] or not all(r['ground']):F('the ground materials are not all in (ENVDET + ENVDET_G): %s'%r['ground'])
    if not r['triSame']:F('the bake changed a decoration kind\'s triangle count')
    for z in r['zones']:
        if z['drawn']<5:F('%s: only %d painted materials drawn'%(z['n'],z['drawn']))
        if z['noUni']:F('%s: %d painted materials drawn without the shared uniforms'%(z['n'],z['noUni']))
    if r['nbad']:F('%d character materials have the scenery paint: %s'%(r['nbad'],r['bad']))
    if r['prog']:F('shader programs failed: %s'%r['prog'][:3])
    if r.get('err'):F('render threw: %s'%r['err'])
    errs=[e for e in r['errs'] if 'WebGL' in e or 'THREE' in e or 'shader' in e.lower()]
    if errs:F('console errors: %s'%errs[:3])
    if r['scanMs']>25:F('a light scan took %.1f ms'%r['scanMs'])
    print('FAILS',len(fails))
    print('V183_OK' if not fails else 'V183_FAIL',flush=True)
play.run(s)
