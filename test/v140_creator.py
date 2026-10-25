# v140 creator fixes: the raven Mage's hand stays put in his own frame while the preview turns (it reached the old way before);
# picking a companion never shows the material hint ("Stoneshell" matched "Stone"); ranger pose sheet. SHOT=1 for pictures.
import play,json,os
def BB(pg):
    return pg.evaluate("()=>{const r=document.querySelector('#ccPV').getBoundingClientRect();return {x:r.x,y:r.y,width:Math.max(1,r.width),height:Math.max(1,r.height)}}")
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(1200000);fails=[]
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(800)
    # --- the Mage turning ---
    pg.click('[data-c="mage"]',timeout=60000);pg.wait_for_timeout(2500)
    out=[]
    for r in [0,.8,1.6,2.4,3.2,-1.2]:
        ev("(r)=>{CC116.rot=r;return 1}",r);pg.wait_for_timeout(700)
        p=ev("""()=>{const H=CC116.h,V=THREE.Vector3;H.updateMatrixWorld(true);const g=n=>H.worldToLocal(H.bones[n].getWorldPosition(new V()));const a=g('aR2'),e=g('aR1'),sh=g('aR0');return [a.x,a.y,a.z,e.x,e.y,e.z,sh.x,sh.y,sh.z].map(v=>+v.toFixed(3))}""")
        out.append(p)
        if os.environ.get('SHOT'):pg.screenshot(path=play.TMP+'/v140_mage_rot%s.png'%str(r).replace('.','_').replace('-','m'),clip=BB(pg))
    import math
    spread=max(math.dist(out[0][:3],o[:3]) for o in out);espread=max(math.dist(out[0][3:6],o[3:6]) for o in out)
    ok=spread<.06 and espread<.06   # (breathing moves the hand a little)
    print(('PASS' if ok else 'FAIL'),'mage hand steady while turning',json.dumps({'hand':round(spread,3),'elbow':round(espread,3)}),flush=True)
    if not ok:fails.append('mage')
    ev("()=>{CC116.rot=null;return 1}")
    # --- the Look step / barber preview (drag to turn): the carry hold is active there; the hand must stay put in his own frame ---
    L=ev("""()=>{const root=heroBuildPreview({},'mage'),H=root.userData.hero,piv=new THREE.Group(),inner=new THREE.Group();inner.scale.setScalar(1.42);piv.add(inner);inner.add(root);
      const V=THREE.Vector3,out=[];let now=5e5;
      for(const r of [0,.9,1.8,2.7,3.6,4.5,-1]){piv.rotation.y=r;for(let i=0;i<10;i++){piv.updateMatrixWorld(true);root.userData.anim(now+=16)}piv.updateMatrixWorld(true);
        const g=n=>H.worldToLocal(H.bones[n].getWorldPosition(new V()));const a=g('aR2'),e=g('aR1');out.push([a.x,a.y,a.z,e.x,e.y,e.z])}
      const d=(p,q,o)=>Math.hypot(p[o]-q[o],p[o+1]-q[o+1],p[o+2]-q[o+2]);let mh=0,me=0;out.forEach(o=>{mh=Math.max(mh,d(o,out[0],0));me=Math.max(me,d(o,out[0],3))});
      return {hand:+mh.toFixed(3),elbow:+me.toFixed(3),held:!!H._fc116}}""")
    ok=L['hand']<.02 and L['elbow']<.02 and L['held']
    print(('PASS' if ok else 'FAIL'),'mage hold steady while dragged round (look step)',json.dumps(L),flush=True)
    if not ok:fails.append('look')
    # --- ranger pose picture ---
    pg.click('[data-c="ranger"]');pg.wait_for_timeout(2500)
    for r in [.35,1.2,-.6]:
        ev("(r)=>{CC116.rot=r;return 1}",r);pg.wait_for_timeout(600)
        if os.environ.get('SHOT'):pg.screenshot(path=play.TMP+'/v140_ranger_rot%s.png'%str(r).replace('.','_').replace('-','m'),clip=BB(pg))
    ev("()=>{CC116.rot=null;return 1}")
    # --- companions: no material hint ---
    pg.click('#ccNext');pg.wait_for_timeout(1500)
    names=ev("()=>[...document.querySelectorAll('#ccList [data-s]')].map(b=>b.dataset.s)")
    bad=[]
    for n in names:
        pg.click('#ccList [data-s="%s"]'%n);pg.wait_for_timeout(300)
        if ev("()=>{const d=document.getElementById('mhint');return !!d&&d.style.display!='none'}"):bad.append(n)
    print(('PASS' if not bad else 'FAIL'),'no material hint on companions',bad,flush=True)
    if bad:fails.append('hint')
    # the hint still works for real materials (whole words)
    w=ev("()=>{const b=document.createElement('button');b.textContent='Stone ×3';const d=document.createElement('div');d.className='win';d.appendChild(b);document.body.appendChild(d);const H=msrcFind(b),H2=(()=>{b.textContent='Stoneshell';return msrcFind(b)})();d.remove();return [!!H,!!H2]}")
    ok=w[0] and not w[1];print(('PASS' if ok else 'FAIL'),'hint matches whole words',w,flush=True)
    if not ok:fails.append('words')
    print('CHECKS OK' if not fails else 'CHECKS FAILED: %s'%fails)
play.run(s,w=1280,hh=800)
