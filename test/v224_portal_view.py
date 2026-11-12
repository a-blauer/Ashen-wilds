# v224 (owner, Nov 12 2026): in the intro's portal shots (part two, 103.2 s + 6 x 2.1 s) nothing may stand between the camera and
# the portal: the faint Sovereign face is drawn over the picture, so a tree or a bank of ground in front of the portal looked wrong.
# Rays from the camera to a grid over each portal (and to the shot's look point) every 0.1 s must not hit any visible mesh
# (trees, ground, rocks, props). Stills: test/out/v224_portal_<i>.jpg (mid-shot). SHOTS=0 skips the stills.
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP;W=int(os.environ.get('W','960'));H=int(os.environ.get('H','540'))
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,info)
    if not ok:FAIL.append(n)
RAYS=r"""()=>{const D=IC151.S.D,V=THREE.Vector3,rc=new THREE.Raycaster(),I=IC151D,out=[];
  const list=()=>{const L=[];scene.updateMatrixWorld(true);scene.traverse(o=>{if(!(o.isMesh||o.isInstancedMesh)||!o.geometry||o.isSprite)return;let v=true,q=o;while(q){if(q.visible===false)v=false;q=q.parent}if(!v)return;
      if(pl.getObjectById(o.id)||PORT.some(P=>P&&P.g.getObjectById(o.id)))return;/* the portals themselves */const m=Array.isArray(o.material)?o.material[0]:o.material;if(m&&(m.transparent&&m.opacity<.35||m.blending===THREE.AdditiveBlending||m.colorWrite===false))return;L.push(o)});return L};
  for(let i=0;i<6;i++){const G=D.gates[i];if(!G)continue;const P=new V(G.x,GH(G.x,G.z),G.z),hits=[];let n=0,first=null,off=0;
    for(let u=.05;u<I.v3d-.04;u+=.1){const t=I.v3+i*I.v3d+u;ic151Seek(t);cam.updateMatrixWorld();{const X=TWN101.x[i];if(!(X&&X.g&&X.g.visible&&PORT[i].g.visible))off++}const M=list(),c=cam.position.clone(),d0=c.distanceTo(P);
      const dr=c.clone().sub(P).setY(0).normalize(),sv=new V(dr.z,0,-dr.x),pts=[look.clone()];
      for(const h of [1.4,2.4,3.4])for(const s of [-1.2,0,1.2])pts.push(P.clone().addScaledVector(sv,s).add(new V(0,h,0)));
      for(const q of pts){const d=q.clone().sub(c),L=d.length();rc.set(c,d.normalize());rc.near=.05;rc.far=Math.max(.1,L-1.6);n++;   // stop 1.6 short: the portal's dais
        const r=rc.intersectObjects(M,false);if(r.length){const o=r[0].object;let nm=o.name;let p=o.parent;while(!nm&&p){nm=p.name;p=p.parent}hits.push([+u.toFixed(2),+q.y.toFixed(1),nm||o.type,+r[0].distance.toFixed(1)]);if(!first)first=hits[hits.length-1]}}}
    out.push({i,n,off,nh:hits.length,first,eg:hits.slice(0,4),cam:[+cam.position.x.toFixed(1),+cam.position.y.toFixed(1),+cam.position.z.toFixed(1)]})}
  return out}"""
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    info=ev("([w,h])=>ic151Cap(w,h)",[W,H]);print('cap',{k:info[k] for k in ('split','hero') if k in info})
    ev("()=>ic151Seek(100)");pg.wait_for_timeout(1500);ev("()=>ic151Seek(100.05)")
    r=ev(RAYS)
    for g in r:print('portal',g)
    chk('six portal shots measured',len(r)==6,len(r))
    for g in r:chk('portal %s\'s room is drawn for its whole shot'%['I','II','III','IV','V','VI'][g['i']],g['off']==0,g['off'])
    for g in r:chk('nothing blocks the view of portal %s'%['I','II','III','IV','V','VI'][g['i']],g['nh']==0,(g['nh'],'of',g['n'],g['eg']))
    if os.environ.get('SHOTS','1')!='0':
        for i in range(6):
            for u in (.25,1.05,1.85):
                t=103.2+i*2.1+u;ev("t=>ic151Seek(t)",t);pg.wait_for_timeout(250);ev("t=>ic151Seek(t)",t+.01)
                pg.screenshot(path=O+'/v224_portal_%d_%.2f.jpg'%(i,u),type='jpeg',quality=85)
        print('stills',O+'/v224_portal_*.jpg')
    chk('no frame errors',not ev("()=>IC151.err||null"),ev("()=>IC151.err||''")[:300])
play.run(s,w=W,hh=H)
if FAIL:print('FAILED',FAIL)
