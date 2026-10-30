# v176: enemy models — no unattached pieces. Builds every enemy (zone rosters, camps, instance rosters and the quest-only
# foes), poses it (rest, idle, two walk phases, an attack) and
#  * checks (FAIL lines): build errors, NaN, floating pieces (any separate piece of mesh more than FLOAT_MM (scaled with the
#    model's size) from the rest of the model; glow / effect meshes (additive or see-through basic materials) are skipped),
#    feet on the ground in idle (walkers only: lowest point within -3..+4 % of the height)
#  * sheets: out/v176_en<n>.jpg — front, 3/4, side, back, and the attack pose
# BOSSES=1: the Sovereigns and quest bosses instead (rest pose: argus,hydra,rimewraith,bloated,vaelric,vorraxis,gorthrak,qarsul,kheprit,skimmer;
#   not Ssith'ra: its segments are laid out live along its path)
# ONLY=orc,scarab  NOSHEET=1  POSES=rest,idle  FLOAT_MM=4 (per 1.7 m of height)
import os,sys,base64,io
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import play
from PIL import Image,ImageDraw
from float_lib import floating
O=play.TMP
FLOAT_MM=float(os.environ.get('FLOAT_MM','4'));FOCUS=bool(os.environ.get('FOCUS'))
# things meant to hang inside a see-through body (the goo's bubbles and half-dissolved trophies): only their middle must be enclosed
SUSPEND={'goo','spitter'}
FLY={'cavebat','bloodbat','banshee','wraith'}
JS=r"""(a)=>{const [list,poses,nosheet]=a,V=THREE.Vector3,FW=300,FH=300,out={items:[]};
  if(!window.RT6){const rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);const sc=new THREE.Scene();sc.background=new THREE.Color(0x2c3036);
    sc.add(new THREE.HemisphereLight(0xc8d0dc,0x3a3028,.9));const dl=new THREE.DirectionalLight(0xfff0d8,1.1);dl.position.set(2,4,4);sc.add(dl);const d2=new THREE.DirectionalLight(0x8090c0,.55);d2.position.set(-4,1,-2);sc.add(d2);
    const gr=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshLambertMaterial({color:0x3a4234}));gr.rotation.x=-Math.PI/2;sc.add(gr);window.RT6={rd,sc,pc:new THREE.PerspectiveCamera(30,1,.02,200)}}
  const {rd,sc,pc}=RT6;
  const fx=m=>{const M=Array.isArray(m.material)?m.material[0]:m.material;if(!M)return true;if(M.blending==THREE.AdditiveBlending)return true;if(M.isMeshBasicMaterial&&M.transparent&&M.opacity<.95)return true;if(M.visible===false)return true;return false};
  const GC=(a,j,q)=>q==0?a.getX(j):q==1?a.getY(j):q==2?a.getZ(j):a.getW(j);
  const vis=o=>{let p=o;while(p){if(!p.visible)return false;p=p.parent}return true};
  const geo=g=>{g.updateMatrixWorld(true);const P=[],F=[],TG=[],NM=[],v=new V();let mi_=0;g.traverse(m=>{if(!m.isMesh||!m.geometry||!m.geometry.attributes.position||!vis(m))return;const isfx=fx(m);
      const mid=mi_++;const M0=Array.isArray(m.material)?m.material[0]:m.material;NM.push((m.name||'mesh')+'#'+(M0&&M0.color?M0.color.getHexString():'')+(m.parent&&m.parent.isBone?'@'+m.parent.name:''));const BN=m.isSkinnedMesh?m.skeleton.bones.map(b=>b.name):[],sk=m.isSkinnedMesh&&m.geometry.attributes.skinIndex,sw=m.isSkinnedMesh&&m.geometry.attributes.skinWeight;if(m.isSkinnedMesh)m.skeleton.update();const pa=m.geometry.attributes.position,ix=m.geometry.index,n=ix?ix.count:pa.count;
      const cnt=m.isInstancedMesh?m.count:1,mi=new THREE.Matrix4();
      for(let c=0;c<cnt;c++){if(m.isInstancedMesh)m.getMatrixAt(c,mi);
        for(let i=0;i<n;i++){const j=ix?ix.getX(i):i;v.fromBufferAttribute(pa,j);if(m.isSkinnedMesh)m.boneTransform(j,v);if(m.isInstancedMesh)v.applyMatrix4(mi);v.applyMatrix4(m.matrixWorld);if(isfx)F.push(v.x,v.y,v.z);else{P.push(v.x,v.y,v.z);let bn='';if(sk){let bw=-1;for(let q=0;q<4;q++){const w=GC(sw,j,q);if(w>bw){bw=w;bn=BN[GC(sk,j,q)]||''}}}TG.push(NM.length-1+'|'+bn)}}}});
    const f=new Float32Array(P),u=new Uint8Array(f.buffer);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));
    const TU=[...new Set(TG)],ti=new Map(TU.map((x,i)=>[x,i])),tg=new Uint16Array(TG.map(x=>ti.get(x))),u2=new Uint8Array(tg.buffer);let s2='';for(let i=0;i<u2.length;i+=8192)s2+=String.fromCharCode.apply(null,u2.subarray(i,i+8192));
    return [btoa(s),btoa(s2),TU.map(x=>{const [a,b]=x.split('|');return NM[+a]+(b?' bone '+b:'')})]};
  list.forEach(k=>{const it={k,n:(EN[k]&&EN[k].n)||k,poses:{},shots:[],err:null,fly:false};out.items.push(it);let g,T=5000;
    const err=[];const ce=console.error;console.error=function(){err.push([].map.call(arguments,String).join(' '));return ce.apply(console,arguments)};
    const SV=i=>()=>{const R=svRig();SVB[i].build(R,null);svRest(R);svMerge(R);return R.root};
    const BLD={argus:SV(0),hydra:SV(1),rimewraith:SV(2),ssithra:SV(3),bloated:SV(4),vaelric:SV(5),vorraxis:()=>MB144.sheet.boss(),gorthrak:()=>GB151.sheet.gorthrak(),
      qarsul:()=>QS165M.sheet.qarsul(),kheprit:()=>KH165.sheet.kheprit(),skimmer:()=>SK165.sheet.skimmer()};const boss=!!BLD[k];if(boss)it.n=k;
    try{if(boss)g=BLD[k]();else{const c=enemyC(k,20,{});g=cr(c)}g.position.set(0,0,0);g.rotation.y=0;sc.add(g)}catch(e){it.err='build error '+String(e).slice(0,200);console.error=ce;return}
    const tick=(ms,mv,sp)=>{if(!boss)for(let t=0;t<ms;t+=16){T+=16;try{animC(g,T,mv,sp||0)}catch(e){it.err='anim error '+String(e).slice(0,200)}}g.position.set(0,g.position.y,0);g.updateMatrixWorld(true)};
    it.fly=boss||!!(EN[k]&&(EN[k].fly||EN[k].hover));
    try{g.updateMatrixWorld(true);if(poses.includes('rest'))it.poses.rest=geo(g);
      tick(600,false);if(poses.includes('idle'))it.poses.idle=geo(g);
      const bb=new THREE.Box3().setFromObject(g),sz=bb.getSize(new V()),ctr=bb.getCenter(new V());it.h=sz.y;it.sz=sz.toArray();it.lo=bb.min.y;
      const shot=(dir,l)=>{const R=Math.max(sz.x,sz.y,sz.z)*.5,d=new V(...dir).normalize().multiplyScalar(R/Math.tan(15*Math.PI/180)*1.15);pc.position.copy(ctr).add(d);pc.lookAt(ctr);rd.render(sc,pc);it.shots.push([l,rd.domElement.toDataURL('image/jpeg',.88)])};
      if(!nosheet){shot([0,.15,1],'front');shot([.75,.25,.75],'3/4');shot([1,.1,0],'side');shot([-.4,.25,-1],'back')}
      if(poses.includes('walk')&&!boss){tick(250,true,4);it.poses.walkA=geo(g);tick(170,true,4);it.poses.walkB=geo(g)}
      if(poses.includes('atk')&&!boss){tick(400,false);const mv=(EN[k].moves||[])[0];g.ak={n:mv||'bite',ph:1,k:.6};tick(120,false);it.poses.atk=geo(g);if(!nosheet)shot([.9,.2,.5],'attack '+(mv||''))}}
    catch(e){it.err=(it.err||'')+' pose error '+String(e).slice(0,200)}
    if(err.length)it.err=(it.err||'')+' console: '+err[0].slice(0,160);console.error=ce;
    sc.remove(g)});
  return out}"""
FOCJS=r"""(a)=>{const [k,pts,pose]=a,V=THREE.Vector3,{rd,sc,pc}=RT6,out=[];let T=5000;const SV=i=>()=>{const R=svRig();SVB[i].build(R,null);svRest(R);svMerge(R);return R.root};const BLD={argus:SV(0),hydra:SV(1),rimewraith:SV(2),ssithra:SV(3),bloated:SV(4),vaelric:SV(5),vorraxis:()=>MB144.sheet.boss(),gorthrak:()=>GB151.sheet.gorthrak(),qarsul:()=>QS165M.sheet.qarsul(),kheprit:()=>KH165.sheet.kheprit(),skimmer:()=>SK165.sheet.skimmer()};const boss=!!BLD[k];const g=boss?BLD[k]():cr(enemyC(k,20,{}));g.position.set(0,0,0);sc.add(g);
  const tick=(ms,mv,sp)=>{if(!boss)for(let t=0;t<ms;t+=16){T+=16;animC(g,T,mv,sp||0)}g.position.set(0,g.position.y,0);g.updateMatrixWorld(true)};
  if(pose!='rest')tick(600,false);
  const bb=new THREE.Box3().setFromObject(g),h=bb.getSize(new V()).y,mk=[];
  pts.forEach(p=>{const m=new THREE.Mesh(new THREE.SphereGeometry(Math.max(.015,p[3]*1.15),10,8),new THREE.MeshBasicMaterial({color:0xff2020,wireframe:true,depthTest:false,transparent:true}));m.renderOrder=9;m.position.set(p[0],p[1],p[2]);sc.add(m);mk.push(m)});
  const c=new V();pts.forEach(p=>c.add(new V(...p)));c.multiplyScalar(1/pts.length);let R=0;pts.forEach(p=>R=Math.max(R,c.distanceTo(new V(...p))));R=Math.max(R+h*.12,h*.3);
  [[0,.2,1],[1,.2,.3],[-1,.2,.3],[0,.3,-1]].forEach(d=>{pc.position.copy(c).add(new V(...d).normalize().multiplyScalar(R/Math.tan(15*Math.PI/180)));pc.lookAt(c);rd.render(sc,pc);out.push(rd.domElement.toDataURL('image/jpeg',.9))});
  mk.forEach(m=>{sc.remove(m);m.geometry.dispose()});sc.remove(g);return out}"""
LISTJS=r"""()=>{const keys=new Set();Object.keys(BIOEN).forEach(z=>(BIOEN[z]||[]).forEach(k=>keys.add(k)));
  CAMPS.forEach(C=>[C.th,C.th0].forEach(t=>t&&t.mem.forEach(m=>keys.add(m[0]))));
  Object.keys(N3.zone).forEach(z=>Object.keys(N3.zone[z]).forEach(k=>{const R=N3.zone[z][k];R.L.forEach(q=>keys.add(q));R.th.forEach(t=>t.mem.forEach(m=>keys.add(m[0])))}));
  Object.keys(EN).forEach(k=>{if(!/^boss/.test(k))keys.add(k)});return [...keys].filter(k=>EN[k]).sort()}"""
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(3600000)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    errs=[];pg.on('pageerror',lambda e: errs.append(str(e)))
    ev("()=>{window.requestAnimationFrame=()=>0}")   # stop the game loop: only the model renderer draws
    keys=[q for q in os.environ.get('ONLY','').split(',') if q] or ('argus,hydra,rimewraith,bloated,vaelric,vorraxis,gorthrak,qarsul,kheprit,skimmer'.split(',') if os.environ.get('BOSSES') else ev(LISTJS))
    poses=os.environ.get('POSES','rest,idle,walk,atk').split(',');nos=bool(os.environ.get('NOSHEET'))
    fails=[];cells=[]
    for i in range(0,len(keys),4):
        r=ev(JS,[keys[i:i+4],poses,nos])
        for it in r['items']:
            lab='%s (%s)'%(it['k'],it['n']);nf0=len(fails)
            if it['err']:fails.append(lab+': '+it['err'])
            h=it.get('h') or 1.7;thr=FLOAT_MM/1000*max(1,h/1.7);nb=0;PC={}
            for pn,(b64,t64,tnames) in it['poses'].items():
                V=np.frombuffer(base64.b64decode(b64),dtype=np.float32).astype(np.float64);TGv=np.frombuffer(base64.b64decode(t64),dtype=np.uint16)
                if not len(V):continue
                if not np.isfinite(V).all():fails.append('%s %s: NaN vertex'%(lab,pn));continue
                V=V.reshape(-1,3)
                if pn=='idle' and not (it['fly'] or it['k'] in FLY):
                    lo=V[:,1].min()
                    if lo<-.03*h or lo>.04*h:fails.append('%s idle: lowest point %.3f m of %.2f m (feet should touch the ground)'%(lab,lo,h))
                for c,n,cc,d,t0 in floating(V,thr,it['k'] in SUSPEND):
                    tg=TGv[t0*3:(t0+n)*3];where=tnames[int(np.bincount(tg).argmax())] if len(tg) else '?'
                    P=PC.setdefault(t0,{'n':n,'cc':cc,'d':0,'poses':[],'w':where,'r':float(np.linalg.norm(V[t0*3:(t0+n)*3]-cc,axis=1).max()) if pn==list(it['poses'])[0] else .02});P['d']=max(P['d'],d);P['poses'].append(pn)
            if FOCUS and PC:
                import collections
                groups=collections.OrderedDict()
                for t0,P in sorted(PC.items()):
                    key=P['w'];groups.setdefault(key,[]).append([float(x) for x in P['cc']]+[P['r']])
                ims=[]
                for key,pts in list(groups.items())[:4]:
                    for u in ev(FOCJS,[it['k'],pts[:12],'idle']):ims.append((key,u))
                if ims:
                    W=300;sh=Image.new('RGB',(W*4,W*((len(ims)+3)//4)),(38,42,48));d=ImageDraw.Draw(sh)
                    for j,(key,u) in enumerate(ims):
                        im=Image.open(io.BytesIO(base64.b64decode(u.split(',')[1])));sh.paste(im,((j%4)*W,(j//4)*W))
                        if j%4==0:t=it['k']+' '+key;d.rectangle([0,(j//4)*W,len(t)*7+8,(j//4)*W+16],fill=(0,0,0));d.text((4,(j//4)*W+2),t,fill=(255,255,255))
                    nm='%s/v176_focus_%s.jpg'%(O,it['k']);sh.save(nm,quality=88);print('wrote',nm,flush=True)
            for t0,P in sorted(PC.items()):
                nb+=1;cc=P['cc'];fails.append('%s: floating piece (%d tris) at (%.2f, %.2f, %.2f) [%s], up to %.0f mm off in %s'%(lab,P['n'],cc[0],cc[1],cc[2],P['w'],P['d']*1000,','.join(P['poses'])))
            print('checked',lab,'h %.2f'%h,'floating',nb,flush=True)
            for f in fails[nf0:]:print('  -',f,flush=True)
            if not nos:cells.append((lab,it['shots']))
    if not nos and cells:
        for si in range(0,len(cells),6):
            ch=cells[si:si+6];W=300;sh=Image.new('RGB',(W*max(len(c[1]) for c in ch),W*len(ch)),(38,42,48));d=ImageDraw.Draw(sh)
            for ri,(lab,shots) in enumerate(ch):
                for ci,(l,u) in enumerate(shots):
                    im=Image.open(io.BytesIO(base64.b64decode(u.split(',')[1])));sh.paste(im,(ci*W,ri*W));t=(lab+' · '+l) if ci==0 else l;d.rectangle([ci*W,ri*W,ci*W+len(t)*7+8,ri*W+16],fill=(0,0,0));d.text((ci*W+4,ri*W+2),t,fill=(255,255,255))
            nm='%s/v176_%s%d.jpg'%(O,'boss' if os.environ.get('BOSSES') else 'en',si//6);sh.save(nm,quality=86);print('wrote',nm,flush=True)
    for f in fails:print('FAIL',f)
    for e in errs[:6]:print('FAIL page error:',e[:300])
    print('==== v176_enemy_parts: %d enemies, %d fails'%(len(keys),len(fails)+len(errs[:6])))
play.run(s)
