# v202: Lord Vaelric's form (longer legs, shorter torso, refitted armour). Builds the boss model and checks (FAIL lines):
#  * the frame: hip joints at 46-53% of his height (crown included; v201: 41%), knees at 24-28%, neck and head where they were (3.35 / 3.52), wrists near
#    the crotch, the height unchanged (top of the crown 4.0-4.2)
#  * the refit: no NaN, the tabard ends above the knee, the breastplate band is narrower at the waist than at the chest
#  * crouching poses (kneel, crash, stag, coil, plunge, low rise, wave): feet and knees that touch the floor (under 15 cm in the
#    v201 frame) stay within 5 cm of it, and none sinks 5 cm deeper under the floor than it did (the post wrapper lowers the hips by the same share of the longer legs)
#  * the boss spawns in his den and runs a few seconds without errors (the real build + post path)
# PICS=1 writes out/v202_vaelric.png (front, side, 3/4, back).
import os,sys,json,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""()=>{const out={};const V=THREE.Vector3;
  const build=(on,pose,hk)=>{VLR202.on=on;const R=svRig();SVB[5].build(R,null);svRest(R);VLR202.on=1;
    const P=pose?VLRP[pose]:null;if(P)for(const k in P){const g=R.J[k];if(!g)continue;const p=P[k],r0=g.userData.r0,p0=g.userData.p0;
      g.rotation.set(r0.x+(p[0]||0),r0.y+(p[1]||0),r0.z+(p[2]||0));g.position.set(p0.x+(p[3]||0),p0.y+(p[4]||0),p0.z+(p[5]||0))}
    // the v202 post: a lowered hip drops by the same share of the longer legs
    if(on&&P&&P.hips&&P.hips[4]<0)R.J.hips.position.y+=P.hips[4]*(VLR202.kl-1);
    svMerge(R);R.root.updateMatrixWorld(true);const J={};for(const k in R.J){const p=new V();R.J[k].getWorldPosition(p);J[k]=p.toArray()}
    let nan=0,top=-9,tabLo=9;const v=new V();R.root.traverse(o=>{if(!o.isMesh||o.material.transparent)return;const A=o.geometry.attributes.position;
      for(let i=0;i<A.count;i++){v.fromBufferAttribute(A,i).applyMatrix4(o.matrixWorld);if(!isFinite(v.x+v.y+v.z))nan++;if(v.y>top)top=v.y;if(o.parent===R.J.tab&&v.y<tabLo)tabLo=v.y}});
    return {R,J,nan,top,tabLo}};
  const a=build(1),b=build(0);out.J=a.J;out.J0=b.J;out.nan=a.nan;out.top=a.top;out.top0=b.top;out.tabLo=a.tabLo;
  // waist vs chest width of the bent armour (spine + chest meshes, x extent in bands)
  const wid=(R,y0,y1)=>{let m=0;const v=new V();['spine','chest'].forEach(k=>R.J[k].children.forEach(o=>{if(!o.isMesh)return;const A=o.geometry.attributes.position;for(let i=0;i<A.count;i++){v.fromBufferAttribute(A,i).applyMatrix4(o.matrixWorld);if(v.y>y0&&v.y<y1&&Math.abs(v.z)<.5)m=Math.max(m,Math.abs(v.x))}}));return m};
  out.waist=wid(a.R,2.4,2.55);out.chestW=wid(a.R,2.9,3.05);
  out.poses={};['kneel','crash','stag','dmCoil','tpPlunge','rLow','wDn'].forEach(p=>{const n=build(1,p),o=build(0,p);out.poses[p]=['ftL','ftR','knL','knR'].map(k=>[n.J[k][1],o.J[k][1]])});
  return out}"""
LIVE=r"""()=>{try{if(AF)arenaFail()}catch(_){}insArrive(PMAP[5].ins[3]);return 1}"""
LIVE2=r"""()=>{const A=ARN[5];toPos(A.cx+6,A.cz+6);const e=bossEnt(5);if(!e||!e.sv)return {err:'no boss'};
  window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;const pr=POST.render;POST.render=()=>{};
  for(let i=0;i<240;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){POST.render=pr;return {err:String(err).slice(0,300)}}}POST.render=pr;
  return {v202:!!e.sv.R.v202,hips:e.sv.R.J.hips.position.y}}"""
def s(pg):
    pg.set_default_timeout(1800000);ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=ev(JS);J=r['J'];H=r['top']
    print('height %.2f (v201 %.2f)  hips %.2f  thigh %.2f  knee %.2f  neck %.2f  shoulder %.2f  wrist %.2f'%(H,r['top0'],J['hips'][1],J['thL'][1],J['knL'][1],J['neck'][1],J['shL'][1],J['hdL'][1]))
    if r['nan']:F('NaN vertices: %d'%r['nan'])
    if not 4.0<=H<=4.2:F('height %.2f (expected 4.0-4.2)'%H)
    if not .46<=J['thL'][1]/H<=.53:F('hip joints at %.0f%% of his height'%(J['thL'][1]/H*100))
    if not .24<=J['knL'][1]/H<=.28:F('knees at %.0f%% of his height'%(J['knL'][1]/H*100))
    for k,want in (('neck',3.35),('head',3.52)):
        if abs(J[k][1]-want)>.03:F('%s at %.2f (was %.2f)'%(k,J[k][1],want))
    if abs(J['hdL'][1]-(J['thL'][1]-.05))>.2:F('wrist %.2f far from the crotch %.2f'%(J['hdL'][1],J['thL'][1]-.05))
    if not r['tabLo']>J['knL'][1]+.1:F('tabard hem %.2f not above the knee %.2f'%(r['tabLo'],J['knL'][1]))
    if not r['waist']<r['chestW']-.05:F('waist %.2f not narrower than the chest %.2f'%(r['waist'],r['chestW']))
    for p,L in r['poses'].items():
        for k,(n,o) in zip(['ftL','ftR','knL','knR'],L):
            if (o<.15 and abs(n-o)>.05) or n<min(o,0)-.05:F('%s: %s at %.2f, v201 frame %.2f'%(p,k,n,o))
    ev(LIVE);pg.wait_for_timeout(1500);q=ev(LIVE2);print('live',json.dumps(q))
    if q.get('err'):F('live: '+q['err'])
    elif not q.get('v202'):F('live boss built without the v202 form')
    for e in errs[:5]:F('page error: '+e)
    if os.environ.get('PICS'):
        im=ev(r"""()=>{const rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(1200,600);const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a3f48);
          sc.add(new THREE.HemisphereLight(0xdde6ff,0x403530,.9));const dl=new THREE.DirectionalLight(0xffffff,1.1);dl.position.set(3,6,5);sc.add(dl);
          const R=svRig();SVB[5].build(R,null);svRest(R);svMerge(R);sc.add(R.root);const pc=new THREE.PerspectiveCamera(22,.5,.1,100);rd.setScissorTest(true);
          [[0,.1,1],[1,.08,0],[.7,.15,.7],[-.4,.15,-1]].forEach((d,i)=>{rd.setViewport(i*300,0,300,600);rd.setScissor(i*300,0,300,600);pc.position.set(...d).normalize().multiplyScalar(14).add(new THREE.Vector3(0,2,0));pc.lookAt(0,2,0);rd.render(sc,pc)});
          return rd.domElement.toDataURL('image/png')}""")
        open(play.TMP+'/v202_vaelric.png','wb').write(base64.b64decode(im.split(',')[1]));print('wrote out/v202_vaelric.png')
    print('==== v202_vaelric_form: %d fails'%len(fails))
play.run(s)
