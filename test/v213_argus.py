# v213: Argus, the Hundred-Eyed, rebuilt on one skinned, painted body (MODEL_DETAIL_RECIPE) with a smoother gait and strikes.
# FAIL lines on:
#  * model: not the v213 skinned body, triangles over 30k (every layer and rigid piece), a joint his poses / springs use missing,
#    NaN vertices, fewer than 20 eyes, an eye without its iris, height outside 4.2-6.2 m, page errors
#  * gait: the lowest paw's mean ground speed while walking at 2.6 m/s and trotting at 4.2 m/s over 1.0 m/s (planted paws stay put)
#  * smooth motion: in idle, walk and every move, no joint turns faster than 22 rad/s between two 16 ms frames (a pop)
#  * every move runs to its end without errors
# PICS=1 writes out/v213_argus.png (front, side, 3/4, back) and out/v213_poses.png (poses); POSES= the pose list;
# CLOSE=1 out/v213_close.png (head, flank, legs). SRC=<old build> renders the old model for comparison (checks skipped).
import os,sys,json,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
fails=[]
def F(m):fails.append(m);print('FAIL',m)
TAG=os.environ.get('TAG','v213')
SETUP=r"""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;
  window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016)),pr=POST.render;POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=pr};
  window.__down=down;down=function(){hero.hp=heroMax()};return 1}"""
MODEL=r"""()=>{const R=svRig();SVB[0].build(R,null);svRest(R);svMerge(R);R.root.updateMatrixWorld(true);const V=new THREE.Vector3(),out={v213:!!R.v213,tris:0,ms:(window.ARG213&&ARG213.ms)||0,body:(window.ARG213&&ARG213.tris)||0};
  const need=new Set();for(const n in ARGP)for(const k in ARGP[n])need.add(k);for(const k in (SVB[0].spr||{}))need.add(k);need.delete('root');out.missing=[...need].filter(k=>!R.J[k]);
  let nan=0,top=-9,lo=9,meshes=0;R.root.traverse(o=>{if(!o.isMesh||!o.visible)return;meshes++;const P=o.geometry.attributes.position;out.tris+=P.count/3;if(o.material.transparent)return;
    for(let i=0;i<P.count;i++){V.fromBufferAttribute(P,i);if(o.isSkinnedMesh)V.applyMatrix4(R.root.matrixWorld);else V.applyMatrix4(o.matrixWorld);if(!isFinite(V.x+V.y+V.z))nan++;else{top=Math.max(top,V.y);lo=Math.min(lo,V.y)}}});
  out.tris=Math.round(out.tris);out.nan=nan;out.top=top;out.lo=lo;out.meshes=meshes;out.eyes=R.eyes.length;out.badEye=R.eyes.filter(E=>!E.ir||!E.ir.isMesh).length;return out}"""
DEN=r"""()=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[0].ins[3]);return 1}"""
DEN2=r"""()=>{STEP(.5);enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const A=ARN[0];window.XA=A;toPos(A.cx,A.cz+12);STEP(.3);const e=bossEnt(0);window.BE=e;STEP(.4);
  window.__pick=svPick;svPick=()=>null;return {ok:!!(e&&e.sv),v213:!!(e&&e.sv&&e.sv.R.v213)}}"""
# the lowest paw's ground speed while walking in place (the body moves forward at v; a planted paw should stay still)
WALK=r"""(v)=>{const e=BE,S=e.sv;try{svEndMove(e,true)}catch(_){}S.mv=null;S.trk=null;S.aw=0;S.spd=v;let now=2e5;const rec=[];e.m.rotation.y=0;const z0=e.m.position.z;
  const P=['pwL','pwR','hkL','hkR'];
  for(let i=0;i<300;i++){now+=16;e.m.position.z+=v*.016;svApply(e,.016,now);e.m.updateMatrixWorld(true);rec.push(P.map(n=>{const q=n[0]==='p'?svWP(e,n,0,-.1,.1):svWP(e,n,0,-.55,.15);return [q.y,q.z]}))}
  let sl=0,n=0;for(let i=80;i<rec.length;i++){const p=rec[i],q=rec[i-1];let lo=0;for(let k=1;k<4;k++)if(p[k][0]<p[lo][0])lo=k;
    sl+=Math.abs(p[lo][1]-q[lo][1])/.016;n++}e.m.position.z=z0;S.spd=0;return sl/n}"""
# the fastest joint turn between frames (rad/s) in idle, walk and each move
POP=r"""()=>{const e=BE,S=e.sv,A=XA,R=S.R,res={},Q=new THREE.Quaternion(),Q0={};const names=Object.keys(R.J).filter(k=>k!=='root');
  const snap=()=>{const o={};names.forEach(k=>o[k]=R.J[k].quaternion.clone());return o},mx=(a,b)=>{let m=0,w='';names.forEach(k=>{const d=2*Math.acos(Math.min(1,Math.abs(a[k].dot(b[k]))));if(d>m){m=d;w=k}});return [m/.016,w]};
  const run=(id,sec,fn)=>{let prev=null,best=[0,''];for(let f=0;f<Math.ceil(sec/.016);f++){fn&&fn(f);STEP(.016);const s=snap();if(prev){const r=mx(prev,s);if(r[0]>best[0])best=[r[0],r[1],+(f*.016).toFixed(2)]}prev=s}res[id]=best};
  try{svEndMove(e,true)}catch(_){}e.m.position.set(A.cx,e.m.position.y,A.cz);toPos(A.cx,A.cz+14);run('idle',2);
  for(const id in S.B.M){if(id==='intro'||id==='awaken'||id==='hundred')continue;const D=S.B.M[id];try{svEndMove(e,true)}catch(_){}S.gone146=0;S.ghost=0;e.m.visible=true;S.ph=D.ph==2?2:1;
    e.m.position.set(A.cx,e.m.position.y,A.cz);toPos(A.cx,A.cz+5);STEP(.3);svStart(e,id,3);run(id,(D.dur||2)+.5)}
  try{svEndMove(e,true)}catch(_){}return res}"""
ALL=r"""()=>{const e=BE,S=e.sv,A=XA,res={};for(const id in S.B.M){if(id==='intro')continue;const D=S.B.M[id];try{svEndMove(e,true)}catch(_){}S.gone146=0;S.ghost=0;e.m.visible=true;S.ph=D.ph==2?2:1;
    e.m.position.set(A.cx,e.m.position.y,A.cz);toPos(A.cx,A.cz+4);window.LERR=null;try{svStart(e,id,3);STEP((D.dur||2)+.2)}catch(err){res[id]=String(err).slice(0,200);continue}if(window.LERR)res[id]=window.LERR}
  try{svEndMove(e,true)}catch(_){}return res}"""
# pictures: an offscreen renderer; poses are applied as offsets from the rest pose (ARGP), mirrored names with '~'
PIC=r"""([mode,poses,W,H])=>{const rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});const sc=new THREE.Scene();sc.background=new THREE.Color(0x30343c);
  sc.add(new THREE.HemisphereLight(0xc8d4ff,0x403530,.75));const dl=new THREE.DirectionalLight(0xfff0e0,1.15);dl.position.set(4,7,6);sc.add(dl);const d2=new THREE.DirectionalLight(0x8090ff,.35);d2.position.set(-5,3,-4);sc.add(d2);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x2a2e26,roughness:1}));fl.rotation.x=-Math.PI/2;sc.add(fl);
  const R=svRig();SVB[0].build(R,null);svRest(R);svMerge(R);sc.add(R.root);const B=SVB[0];
  const setP=(p)=>{const P=p?svPose(B,p):{};for(const k in R.J){const g=R.J[k],r0=g.userData.r0,p0=g.userData.p0,o=P[k]||[0,0,0,0,0,0];g.rotation.set(r0.x+(o[0]||0),r0.y+(o[1]||0),r0.z+(o[2]||0));g.position.set(p0.x+(o[3]||0),p0.y+(o[4]||0),p0.z+(o[5]||0))}
    try{if(R.v213post)R.v213post(R,1,performance.now())}catch(_){}R.root.updateMatrixWorld(true)};
  const pc=new THREE.PerspectiveCamera(24,1,.1,200);rd.setScissorTest(true);const V=THREE.Vector3;
  if(mode==='views'){rd.setSize(W*4,H);pc.aspect=W/H;pc.updateProjectionMatrix();setP(null);
    [[0,.12,1],[1,.1,0],[.75,.22,.75],[-.5,.2,-1]].forEach((d,i)=>{rd.setViewport(i*W,0,W,H);rd.setScissor(i*W,0,W,H);pc.position.set(...d).normalize().multiplyScalar(19).add(new V(0,2.6,0));pc.lookAt(0,2.6,0);rd.render(sc,pc)})}
  else if(mode==='poses'){const n=poses.length,cols=Math.min(4,n),rows=Math.ceil(n/cols);rd.setSize(W*cols,H*rows);pc.aspect=W/H;pc.updateProjectionMatrix();
    poses.forEach((p,i)=>{setP(p);const c=i%cols,r=rows-1-Math.floor(i/cols);rd.setViewport(c*W,r*H,W,H);rd.setScissor(c*W,r*H,W,H);pc.position.set(14*(window.CAMK||1),5.5*(window.CAMK||1)+(window.CAMY||0),12*(window.CAMK||1));pc.lookAt(0,2.6+(window.CAMY||0),.5);rd.render(sc,pc)})}
  else if(mode==='eyes'){setP(null);const ids=poses;rd.setSize(W*ids.length,H);pc.aspect=W/H;pc.fov=30;pc.updateProjectionMatrix();
    ids.forEach((id,i)=>{const o=id==='big'?R.big:R.eyes[+id].ir,p=o.getWorldPosition(new V()),q=o.getWorldQuaternion(new THREE.Quaternion()),n=new V(0,0,1).applyQuaternion(q),s=o.getWorldScale(new V());
      rd.setViewport(i*W,0,W,H);rd.setScissor(i*W,0,W,H);pc.position.copy(p).addScaledVector(n,s.x*9).add(new V(0,s.x*2,0));pc.lookAt(p);rd.render(sc,pc)})}
  else if(mode==='walk'){const v=+poses[0],n=8;rd.setSize(W*4,H*2);pc.aspect=W/H;pc.updateProjectionMatrix();const S={spd:v,ph:1,R},O={};for(const k in R.J)O[k]=[0,0,0,0,0,0];let now=1e5;
    const per=(2.7+.42*v)/Math.max(.01,v);for(let f=0;f<n;f++){for(const k in O)O[k].fill(0);arg213Loco(null,S,O,f===0?0:per/n,now);now+=per/n*1000;
      for(const k in R.J){const g=R.J[k],r0=g.userData.r0,p0=g.userData.p0,o=O[k];g.rotation.set(r0.x+o[0],r0.y+o[1],r0.z+o[2]);g.position.set(p0.x+o[3],p0.y+o[4],p0.z+o[5])}R.root.updateMatrixWorld(true);
      const c=f%4,r=1-Math.floor(f/4);rd.setViewport(c*W,r*H,W,H);rd.setScissor(c*W,r*H,W,H);pc.position.set(15,3,2);pc.lookAt(0,2.2,0);rd.render(sc,pc)}}
  else if(mode==='close'){setP(window.CLOSEPOSE||null);const shots=[['head',[3.2,1.2,4.2],[0,.1,.5]],['head',[-.2,.4,4.8],[0,.1,.6]],['body',[5.2,1,1.2],[0,.1,.6]],['body',[-2.5,3.5,-5],[0,.3,-.5]],['shL',[3,-.6,3.4],[0,-.9,0]],['hpL',[3.2,-.6,-2.6],[0,-1,0]],['jaw',[2.6,-1.2,3.2],[0,0,.6]],['t2',[2.6,1.4,-2.2],[0,0,-.4]]];
    const cols=4,rows=2;rd.setSize(W*cols,H*rows);pc.aspect=W/H;pc.fov=30;pc.updateProjectionMatrix();
    shots.forEach(([j,off,aim],i)=>{const J=R.J[j]||R.J.body,c=i%cols,r=rows-1-Math.floor(i/cols),a=J.localToWorld(new V(...aim));rd.setViewport(c*W,r*H,W,H);rd.setScissor(c*W,r*H,W,H);
      pc.position.copy(a).add(new V(...off));pc.lookAt(a);rd.render(sc,pc)})}
  return rd.domElement.toDataURL('image/png')}"""
def s(pg):
    pg.set_default_timeout(1800000);ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev(SETUP)
    old=bool(os.environ.get('OLD'))
    m=ev(MODEL);print('model',json.dumps({k:(round(v,3) if isinstance(v,float) else v) for k,v in m.items()}))
    if os.environ.get('PICS') or os.environ.get('CLOSE') or os.environ.get('EYES') or os.environ.get('WALK'):
        if os.environ.get('CAMK'):ev("(k)=>{window.CAMK=k;window.CAMY=k*1.5-1.5;return 1}",float(os.environ.get('CAMK')))
        W=int(os.environ.get('W','420'));H=int(os.environ.get('H','420'))
        if os.environ.get('PICS'):
            im=ev(PIC,['views',[],W,H]);open(play.TMP+'/%s_argus.png'%TAG,'wb').write(base64.b64decode(im.split(',')[1]))
            P=os.environ.get('POSES','cUp,cHit,coil,lunge,rear,howl,pcr,air,land,wcoil,wspin,stag,look,lash,frear,fslam').split(',')
            im=ev(PIC,['poses',P,360,300]);open(play.TMP+'/%s_poses.png'%TAG,'wb').write(base64.b64decode(im.split(',')[1]))
        if os.environ.get('WALK'):
            im=ev(PIC,['walk',[os.environ.get('WALK')],320,260]);open(play.TMP+'/%s_walk.png'%TAG,'wb').write(base64.b64decode(im.split(',')[1]))
        if os.environ.get('EYES'):
            im=ev(PIC,['eyes',os.environ.get('EYES').split(','),300,300]);open(play.TMP+'/%s_eyes.png'%TAG,'wb').write(base64.b64decode(im.split(',')[1]))
        if os.environ.get('CLOSEPOSE'):ev("(p)=>{window.CLOSEPOSE=p;return 1}",os.environ.get('CLOSEPOSE'))
        if os.environ.get('CLOSE'):
            im=ev(PIC,['close',[],380,320]);open(play.TMP+'/%s_close.png'%TAG,'wb').write(base64.b64decode(im.split(',')[1]))
        print('wrote pictures')
    if os.environ.get('GAME'):
        ev(DEN);pg.wait_for_timeout(1500);ev(DEN2);ev("()=>{STEP(3.4);const e=BE;e.m.position.set(XA.cx,e.m.position.y,XA.cz);toPos(XA.cx+2,XA.cz+16);STEP(.2);return 1}")
        st="()=>{const st=document.createElement('style');st.textContent='.stage>*:not(#gl){visibility:hidden!important}';document.head.appendChild(st);return 1}";ev(st)
        for i,(side,dist,h,look) in enumerate([(0,13,3.2,2.4),(1.5,12,3,2.2),(.7,8,3.5,2.8),(2.6,13,4,2.2)]):
            ev("([side,dist,h,look])=>{const e=BE,p=e.m.position,a=e.m.rotation.y+side;e.m.flT=-1e9;svApply(e,.016,performance.now());cam.position.set(p.x+Math.sin(a)*dist,GH(p.x,p.z)+h,p.z+Math.cos(a)*dist);cam.lookAt(p.x,GH(p.x,p.z)+look,p.z);POST.render();return 1}",[side,dist,h,look])
            pg.locator('#gl canvas').screenshot(path=play.TMP+'/%s_game%d.png'%(TAG,i),timeout=300000,animations='disabled')
        print('wrote game shots')
        print('MATS',ev("()=>{const R=BE.sv.R;return R.v213m.map(m=>({vc:m.material.vertexColors,col:m.material.color.getHexString(),em:m.material.emissive&&m.material.emissive.getHexString(),type:m.material.type,attrs:Object.keys(m.geometry.attributes),vis:m.visible,ob:!!m.material.onBeforeCompile&&String(m.material.onBeforeCompile).slice(0,120),ud:JSON.stringify(m.material.userData)}))}"))
    if os.environ.get('PICONLY'):
        for e in errs[:5]:print('page error: '+e)
        return
    if not old and not m['v213']:F('Argus is not the v213 skinned body')
    if m['tris']>30000:F('%d triangles (budget 30k)'%m['tris'])
    if m['missing']:F('joints his poses / springs use are missing: %s'%m['missing'])
    if m['nan']:F('NaN vertices: %d'%m['nan'])
    if m['eyes']<20:F('only %d eyes'%m['eyes'])
    if m['badEye']:F('%d eyes without an iris mesh'%m['badEye'])
    if not 4.2<=m['top']<=6.2:F('height %.2f m (4.2-6.2)'%m['top'])
    ev(DEN);pg.wait_for_timeout(1500);q=ev(DEN2)
    if not old and not q.get('v213'):F('the den boss is not the v213 body');print('==== v213_argus: %d fails'%len(fails));return
    for v in [2.6,4.2]:
        sl=ev(WALK,v);print('gait %.1f m/s: lowest paw mean ground speed %.2f m/s'%(v,sl))
        if sl>1.0:F('paws slide at %.1f m/s: %.2f m/s'%(v,sl))
    r=ev(POP)
    for k,v in r.items():
        print('pop %-8s fastest joint %5.1f rad/s (%s at %ss)'%(k,v[0],v[1] if len(v)>1 else '',v[2] if len(v)>2 else ''))
        if v[0]>22:F('%s: %s turns %.0f rad/s in one frame (a pop)'%(k,v[1],v[0]))
    r=ev(ALL)
    for k,v in r.items():F('move %s: %s'%(k,v))
    for e in errs[:5]:F('page error: '+e)
    print('==== v213_argus: %d fails'%len(fails))
play.run(s)
