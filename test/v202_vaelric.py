# v202: Lord Vaelric on the humanoid cage body, strikes that land where they are warned, a gait matched to his speed.
# FAIL lines on:
#  * model: not the v202 skinned body, body triangles over 14k, a missing joint his poses use, NaN, height outside 3.8-4.3 m,
#    hip joints outside 50-57% of his height (heroic legs), the knees not between hips and ankles
#  * strikes (in his den, the hero 3.2 m in front): at each sword hit of combo, combo5, lunge, batstep, spin, the blade (any
#    of 5 points from the guard to the tip) must cross the warned shape at a hero's height (0.3-2.4 m over the floor) in the
#    hit's frame or the frame either side
#  * gait: the lower foot's mean ground speed while walking at 2.8 m/s must stay under 3.0 m/s (v110: 7.3)
#  * crouches (kneel, crash, stag, dmCoil, tpPlunge, rLow): the lower ankle within 4 cm of its rest height
#  * every move runs to its end without errors; page errors
# PICS=1 writes out/v202_vaelric.png (front, side, 3/4, back) and out/v202_strikes.png is not drawn (see the comments in 3720).
import os,sys,json,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
fails=[]
def F(m):fails.append(m);print('FAIL',m)
SETUP=r"""()=>{window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;
  window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016)),pr=POST.render;POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){window.LERR=String(err&&err.stack||err).slice(0,400)}}POST.render=pr};
  window.__down=down;down=function(){hero.hp=heroMax()};return 1}"""
MODEL=r"""()=>{const R=svRig();SVB[5].build(R,null);svRest(R);svMerge(R);R.root.updateMatrixWorld(true);const V=new THREE.Vector3(),out={v202:!!R.v202,tris:VLR202.tris,ms:VLR202.ms};
  const need=new Set();for(const n in VLRP)for(const k in VLRP[n])need.add(k);out.missing=[...need].filter(k=>!R.J[k]);
  let nan=0,top=-9;R.root.traverse(o=>{if(!o.isMesh||o.material.transparent||!o.visible)return;const P=o.geometry.attributes.position;for(let i=0;i<P.count;i++){V.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);if(!isFinite(V.x+V.y+V.z))nan++;else if(V.y>top&&!o.parent.name.startsWith('wg')&&!o.parent.name.startsWith('wf'))top=V.y}});
  const y=k=>{R.J[k].getWorldPosition(V);return V.y};out.nan=nan;out.top=top;out.hip=y('thL');out.knee=y('knL');out.ankle=y('ftL');
  // crouches: the lower ankle back at its rest height (vlr202Plant)
  out.crouch={};['kneel','crash','stag','dmCoil','tpPlunge','rLow'].forEach(p=>{const P=VLRP[p];for(const k in R.J){const g=R.J[k],r0=g.userData.r0,p0=g.userData.p0,o=P[k]||[0,0,0,0,0,0];g.rotation.set(r0.x+(o[0]||0),r0.y+(o[1]||0),r0.z+(o[2]||0));g.position.set(p0.x+(o[3]||0),p0.y+(o[4]||0),p0.z+(o[5]||0))}
    vlr202Plant(R,P.hips?P.hips[4]:0,P.root&&P.root[4]);R.root.updateMatrixWorld(true);out.crouch[p]=Math.min(y('ftL'),y('ftR'))-R.ftY0});
  return out}"""
DEN=r"""()=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[5].ins[3]);return 1}"""
DEN2=r"""()=>{STEP(.5);enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const A=ARN[5];window.XA=A;toPos(A.cx,A.cz+9);STEP(.3);const e=bossEnt(5);window.BE=e;STEP(.4);
  window.__pick=svPick;svPick=()=>null;return {ok:!!(e&&e.sv&&e.sv.R.v202)}}"""
STRIKE=r"""(id)=>{const e=BE,S=e.sv,A=XA,D=S.B.M[id],dist=3.2,out=[];try{svEndMove(e,true)}catch(_){}S.gone=0;S.ghost=0;e.m.visible=true;S.ph=D.ph==2?2:1;
  e.m.position.set(A.cx,e.m.position.y,A.cz);e.m.rotation.y=0;toPos(A.cx,A.cz+dist);STEP(.05);e.m.position.set(A.cx,e.m.position.y,A.cz);e.m.rotation.y=0;svStart(e,id,7);const M0=S.mv,fr=[],hf={};
  // the blade (5 points, guard to tip) every frame, and the frame each hit landed in
  for(let f=0;f<Math.ceil((D.dur+.05)/.016);f++){toPos(A.cx,A.cz+dist);STEP(.016);if(S.mv!==M0)break;const fy=e.m.position.y;
    fr.push([.3,.9,1.5,2.0,2.42].map(z=>{const q=svWP(e,'swd',0,.06,z);return {x:q.x,z:q.z,h:q.y-fy}}));
    (D.hit||[]).forEach((h,i)=>{if(hf[i]==null&&M0.done.has('h'+i)&&!h.nohit)hf[i]=fr.length-1})}
  try{svEndMove(e,true)}catch(_){}
  // a hit is honest when the blade crosses the warned shape at a hero's height in the hit's frame or the one either side
  // (a 16 ms frame can fall just past the contact of a fast swing)
  for(const i in hf){const h=D.hit[i],an=M0.an['h'+i];if(!an)continue;let ok=false,low=9;for(let f=Math.max(0,hf[i]-1);f<=Math.min(fr.length-1,hf[i]+1);f++)fr[f].forEach(p=>{low=Math.min(low,p.h);if(p.h>.3&&p.h<2.4&&svIn(h.s,an,{x:p.x,z:p.z},.3))ok=true});
    out.push({i:+i,t:h.t,ok,low:+low.toFixed(2)})}
  return out}"""
WALK=r"""()=>{const e=BE,S=e.sv;try{svEndMove(e,true)}catch(_){}S.mv=null;S.trk=null;S.aw=0;const v=2.8;S.spd=v;let now=1e5;const rec=[];e.m.rotation.y=0;const z0=e.m.position.z;
  for(let i=0;i<240;i++){now+=16;e.m.position.z+=v*.016;svApply(e,.016,now);e.m.updateMatrixWorld(true);const a=svWP(e,'ftL',0,0,0),b=svWP(e,'ftR',0,0,0);rec.push([a.y,a.z,b.y,b.z])}
  let sl=0,n=0;for(let i=60;i<rec.length;i++){const p=rec[i],q=rec[i-1],lo=p[0]<p[2]?0:2;sl+=Math.abs(p[lo+1]-q[lo+1])/.016;n++}e.m.position.z=z0;S.spd=0;return sl/n}"""
ALL=r"""()=>{const e=BE,S=e.sv,A=XA,res={};for(const id in S.B.M){if(id==='intro'||id==='awaken')continue;const D=S.B.M[id];try{svEndMove(e,true)}catch(_){}S.gone=0;S.ghost=0;e.m.visible=true;S.ph=D.ph==2?2:1;
    e.m.position.set(A.cx,e.m.position.y,A.cz);toPos(A.cx,A.cz+4);window.LERR=null;try{svStart(e,id,3);STEP((D.dur||2)+.2)}catch(err){res[id]=String(err).slice(0,200);continue}if(window.LERR)res[id]=window.LERR}
  try{svEndMove(e,true)}catch(_){}return res}"""
PIC=r"""()=>{const rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(1200,600);const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a3f48);
  sc.add(new THREE.HemisphereLight(0xdde6ff,0x403530,.9));const dl=new THREE.DirectionalLight(0xffffff,1.1);dl.position.set(3,6,5);sc.add(dl);
  const R=svRig();SVB[5].build(R,null);svRest(R);svMerge(R);sc.add(R.root);const pc=new THREE.PerspectiveCamera(22,.5,.1,100);rd.setScissorTest(true);
  [[0,.1,1],[1,.08,0],[.7,.15,.7],[-.4,.15,-1]].forEach((d,i)=>{rd.setViewport(i*300,0,300,600);rd.setScissor(i*300,0,300,600);pc.position.set(...d).normalize().multiplyScalar(14.5).add(new THREE.Vector3(0,2.05,0));pc.lookAt(0,2.05,0);rd.render(sc,pc)});
  return rd.domElement.toDataURL('image/png')}"""
def s(pg):
    pg.set_default_timeout(1800000);ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev(SETUP)
    m=ev(MODEL);H=m['top'];print('model',json.dumps({k:(round(v,3) if isinstance(v,float) else v) for k,v in m.items() if k!='crouch'}))
    if not m['v202']:F('Vaelric is not the v202 cage body')
    if m['tris']>14000:F('body %d triangles (budget 14k)'%m['tris'])
    if m['missing']:F('joints his poses use are missing: %s'%m['missing'])
    if m['nan']:F('NaN vertices: %d'%m['nan'])
    if not 3.8<=H<=4.3:F('height %.2f m (3.8-4.3)'%H)
    if not .5<=m['hip']/H<=.57:F('hip joints at %.0f%% of his height (50-57%%)'%(m['hip']/H*100))
    if not m['ankle']<m['knee']<m['hip']:F('knee %.2f not between ankle %.2f and hip %.2f'%(m['knee'],m['ankle'],m['hip']))
    for p,d in m['crouch'].items():
        print('crouch %-9s lower ankle %+.3f m from rest'%(p,d))
        if abs(d)>.04:F('%s: the lower ankle is %+.2f m from its rest height'%(p,d))
    ev(DEN);pg.wait_for_timeout(1500);q=ev(DEN2)
    if not q.get('ok'):F('the den boss is not the v202 body');print('==== v202_vaelric: %d fails'%len(fails));return
    for mv in ['combo','combo5','lunge','batstep','spin']:
        for h in ev(STRIKE,mv):
            print('strike %-8s hit %d t %.2f in=%s lowest blade point %.2f m'%(mv,h['i'],h['t'],h['ok'],h['low']))
            if not h['ok']:F('%s hit %d (t %.2f): the blade is not in the warned shape at a hero\'s height at the hit'%(mv,h['i'],h['t']))
    sl=ev(WALK);print('walk: lower foot mean ground speed %.2f m/s at 2.8 m/s'%sl)
    if sl>3.0:F('feet slide while walking: %.2f m/s'%sl)
    r=ev(ALL)
    for k,v in r.items():F('move %s: %s'%(k,v))
    if os.environ.get('PICS'):
        im=ev(PIC);open(play.TMP+'/v202_vaelric.png','wb').write(base64.b64decode(im.split(',')[1]));print('wrote out/v202_vaelric.png')
    for e in errs[:5]:F('page error: '+e)
    print('==== v202_vaelric: %d fails'%len(fails))
play.run(s)
