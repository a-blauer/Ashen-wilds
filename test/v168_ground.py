# v168: the quest set pieces sit on the ground (owner: "make them look correct physically") and stay within a triangle budget.
#   For each piece it is built where it stands, then rays are cast straight up from under the ground at points of its footprint
#   (a headstone's foot, a mound, a plinth's edge, a column's foot, a canal wall, a statue's plinth): the first surface a ray meets
#   is the piece's underside, so it must be at or below the ground there (FAIL: floating, by how much). Points where nothing of the
#   piece is overhead are skipped. Also: no console errors, triangles under each piece's budget (FAIL: over budget).
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms)),errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  let T=performance.now();const tick=n=>{for(let i=0;i<n;i++){T+=33;homeTick(1/30,T)}};const go=async i=>{const I=INSL[i];toPos(I.ba[0],I.ba[1]);await wait(300);tick(6)};
  const RC=new THREE.Raycaster(),UP=new THREE.Vector3(0,1,0),out=[];
  const tris=g=>{let n=0;g.traverse(o=>{if(o.isMesh&&o.geometry&&!o.isInstancedMesh){const G=o.geometry;n+=(G.index?G.index.count:G.attributes.position.count)/3}});return Math.round(n)};
  // pts: [[x,z],...] world; the first hit of a ray up from under the ground must not be above the ground
  const check=(name,g,pts,budget)=>{const r={name,tris:0,float:[],hits:0,n:pts.length,budget};if(!g){r.missing=1;out.push(r);return}g.updateMatrixWorld(true);r.tris=tris(g);
    const ms=[];g.traverse(o=>{if(o.isMesh&&o.visible!==false&&!o.isSprite&&o.material&&!o.material.transparent)ms.push(o)});
    for(const [x,z] of pts){const gh=GH(x,z);RC.set(new THREE.Vector3(x,gh-4,z),UP);RC.far=40;const h=RC.intersectObjects(ms,false)[0];if(!h)continue;r.hits++;const d=h.point.y-gh;if(d>.06){const lp=g.worldToLocal(h.point.clone());r.float.push([+x.toFixed(1),+z.toFixed(1),+d.toFixed(2)].concat(window.GDBG?[+lp.x.toFixed(2),+lp.y.toFixed(2),+lp.z.toFixed(2),h.object.material.type,h.face&&+h.face.normal.y.toFixed(2),RC.intersectObjects(ms,false).length]:[]))}}
    out.push(r)};
  const W=(s,sc,lx,lz)=>{const ca=Math.cos(s.ry),sa=Math.sin(s.ry);return [s.x+(ca*lx+sa*lz)*sc,s.z+(-sa*lx+ca*lz)*sc]};
  const ring=(cx,cz,r,n,a0)=>{const L=[];for(let i=0;i<n;i++){const a=(a0||0)+i/n*6.283;L.push([cx+Math.sin(a)*r,cz+Math.cos(a)*r])}return L};
  // ---- The Dirge I: the weeping angel and the fourteen graves (and an open grave, the Keeper's stair)
  await go(20);tick(4);{const G=SP152.gates.sanctum,s=G.spot;check('angel',G.g,[[-1,-1],[1,-1],[-1,1],[1,1],[0,1.05],[1.05,0],[-1.05,0],[1.58,.8],[1.4,.6]].map(([a,b])=>W(s,1.35,a,b)),9000)}
  {const S=DG165GR.S;S.gr.forEach((Gr,i)=>{const o=Gr.o,p=[[0,-.95],[.25,-.95],[-.25,-.95],[0,.38],[.4,.2],[-.4,.6],[0,1.2],[0,-.4]];check('grave'+i+'('+o.stone+','+o.ext+')',Gr.body,p.map(([a,b])=>W(o,1.3,a,b)),9000)});
    const o=S.gr[2].o;DG165Q.g.bad[2]=1;dg165GSync();tick(2);check('open grave',S.gr[2].hole,[[0,-.95],[.6,.35],[-.6,.35],[1.3,.3],[0,1.45]].map(([a,b])=>W(o,1.3,a,b)),9000);DG165Q.g.bad[2]=0;dg165GSync();
    const K=S.gr[DG165G.K],st=DG165Q.g.st;DG165Q.g.st=2;dg165GSync();tick(2);check('keeper stair',K.stair,[[.77,-.78],[-.77,.7],[0,-1.12],[0,1.52],[1.4,-.3]].map(([a,b])=>W(K.o,1.3,a,b)),9000);DG165Q.g.st=st;dg165GSync()}
  // ---- The Dirge II: the quay
  await go(21);tick(4);{const G=SP152.gates.channel,s=G.spot;check('quay',G.g,[[3.15,-1],[-3.15,-3],[3.15,-5.5],[0,.2],[2.5,.6],[0,1.45],[-3.45,-6.2],[3.45,-6.2]].map(([a,b])=>W(s,1,a,b)),40000)}
  // ---- The Dirge III: the prisms' plinths, the Reliquary (rim, columns)
  await go(22);tick(4);{const S=OS165.S;S.pr.forEach((M,i)=>check('prism'+i,M.g.children[0],ring(M.x,M.z,1.35,8),12000));
    const c=dg165PrismPlan().ctr,R=S.R;check('reliquary',R.g.children[0],ring(c.x,c.z,9.3,16).concat(ring(c.x,c.z,9.85,10,.31-.17+c.ry),ring(c.x,c.z,9.85,10,.31+.17+c.ry)),70000)}
  // ---- Searing Sands II: the court (the Warden's kin on their plinths, the column bases)
  await go(INSL.indexOf(ss165I(1)));tick(6);{const T=ss165T2(),F=T.F,p=[];for(let k=0;k<6;k++){const ang=Math.PI/6+k*Math.PI/3;p.push(F.W2(Math.cos(ang)*13.9,Math.sin(ang)*13.9))}
    check('court',CY165.g,p,140000)}
  // ---- Hillside Crest I: Abeksi's cleft; II: the hydra door's wind stones
  await go(5);tick(4);{const G=SP152.gates.abeksi,s=G.spot;check('abeksi cleft',G.g,[[1.25,-.2],[-1.25,-.2]].map(([a,b])=>W(s,1,a,b)),26000)}
  await go(7);tick(6);{const Pl=hd154Plan(),S=HD154.S;if(S&&S.stones)S.stones.forEach((g,i)=>{const o=Pl.st[i];check('wind stone'+i,g.g||g,ring(o.x,o.z,1.2,8),9000)})}
  return {out,errs:errs.slice(0,8)}}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if os.environ.get('GDBG'):pg.evaluate('()=>{window.GDBG=1}')
    r=pg.evaluate(JS)
    for q in r['out']:
        print(q['name'],'tris',q['tris'],'hits',q.get('hits'),'/',q['n'],'float',q.get('float'))
        if q.get('missing'):F('%s was not built'%q['name']);continue
        if q['float']:F('%s floats above the ground at %s (x, z, gap)'%(q['name'],q['float']))
        if q['tris']>q['budget']:F('%s has %d triangles (budget %d)'%(q['name'],q['tris'],q['budget']))
        if q['hits']==0:F('%s: no footprint point met the piece (sample points wrong?)'%q['name'])
    for e in r['errs']:F('console error: '+e)
play.run(s)
print('RESULT',('FAIL %d'%len(fails)) if fails else 'PASS')
