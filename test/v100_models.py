# v100 models track: mount anatomy + tack, proportion audit of every model family.
#   python3 v100_models.py                         -> every part, this build (TAG=after)
#   SRC=<old.html> TAG=before python3 v100_models.py   -> the same sheets for another build (comparison; checks skipped)
#   PART=mounts,ride,lineup,checks (default all)   MNT=pony,drake (mount subset)
# Sheets (AW_TMP, default test/out):
#   v100_<TAG>_mount_<k>.jpg   row 1: the mount alone (side, front, 3/4, top, 3/4 back); row 2: ridden (side, front, 3/4,
#                              walk, gallop); row 3: walk + gallop strides (side, 4 frames each)
#   v100_<TAG>_mounts.jpg      every mount side view, ridden, in one sheet
#   v100_<TAG>_lineup_<n>.jpg  creatures / companions / tiers / bosses / foes next to the hero for scale
# Checks (TAG=after): rider hips on the saddle and feet / knees / shins outside the body for every mount, no NaN in any
# mount pose, gaits run (legs move, body bobs), triangle counts per mount, page errors.
import os,sys,json,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from playwright.sync_api import sync_playwright
TAG=os.environ.get('TAG','after');PART=os.environ.get('PART','mounts,ride,lineup,grid,checks').split(',')
MNT=os.environ.get('MNT','pony,boar,stag,ram,charger,raptor,panther,destrier,direwolf,drake').split(',')
O=play.TMP;FAIL=[]
def chk(name,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+name,info if info else '')
    if not ok:FAIL.append(name)

COMMON=r"""
window.requestAnimationFrame=()=>0;
window.V100T=window.V100T||{};
V100T.mk=(FW,FH)=>{const rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x40464e);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.8));
  const dl=new THREE.DirectionalLight(0xfff0d8,1.2);dl.position.set(3,6,4);sc.add(dl);const d2=new THREE.DirectionalLight(0x8090b0,.35);d2.position.set(-4,2,-3);sc.add(d2);
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshLambertMaterial({color:0x4a5640}));gr.rotation.x=-Math.PI/2;sc.add(gr);
  const grid=new THREE.GridHelper(40,40,0x6a7660,0x56624c);grid.position.y=.002;sc.add(grid);
  const cam=new THREE.PerspectiveCamera(28,FW/FH,.05,300);return {rd,sc,cam,gr,grid}};
V100T.lbl=(c,t,x,y)=>{c.fillStyle='rgba(0,0,0,.45)';c.fillRect(x,y,Math.min(260,t.length*7+8),17);c.fillStyle='#fff';c.font='12px sans-serif';c.fillText(t,x+4,y+13)};
"""

MOUNTS_JS=COMMON+r"""(a)=>{const [keys]=a;
  const FW=260,FH=240,E=V100T.mk(FW,FH),{rd,sc,cam}=E,out={},info={};let T=400000;const home=pl.parent;
  mounts=keys.map((k,i)=>({id:900+i,k,n:MOUNTS[k].n,spd:60,cap:90,dist:0}));
  const V=THREE.Vector3;
  for(const k of keys){try{
    const cnv=document.createElement('canvas');cnv.width=FW*5;cnv.height=FH*3;const ctx=cnv.getContext('2d');
    // --- row 0: the mount alone
    const m=mountModel(k);sc.add(m);m.position.set(0,0,0);m.rotation.y=0;for(let t=0;t<800;t+=16){T+=16;m.r.rig(T,false,0)}
    m.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(m),sz=bx.getSize(new V()),ct=bx.getCenter(new V());
    const R=Math.max(sz.x,sz.y,sz.z)*1.05;
    const shot=(col,row,dir,label,tgt,dist)=>{const c=tgt||ct,d=dist||R*2.15,v=new V(...dir).normalize();cam.position.set(c.x+v.x*d,c.y+v.y*d,c.z+v.z*d);cam.up.set(0,1,0);if(Math.abs(v.y)>.98)cam.up.set(0,0,-1);cam.lookAt(c);rd.render(sc,cam);ctx.drawImage(rd.domElement,col*FW,row*FH);if(label)V100T.lbl(ctx,label,col*FW,row*FH)};
    shot(0,0,[1,.12,0],k+' side');shot(1,0,[0,.15,1],'front');shot(2,0,[.75,.35,.75],'3/4');shot(3,0,[0,1,0.001],'top');shot(4,0,[-.7,.3,-.7],'3/4 back');
    let tris=0,draws=0;m.traverse(o=>{if(o.isMesh&&o.visible){draws++;const g=o.geometry;tris+=(g.index?g.index.count:g.attributes.position.count)/3}});
    info[k]={v100:!!(m.r.userData&&m.r.userData.mdl),tris:Math.round(tris),draws,size:sz.toArray().map(v=>+v.toFixed(2)),seat:m.seat.map(v=>+v.toFixed(3))};
    sc.remove(m);
    // --- rows 1-2: ridden
    if(riding)dismount();hero.lastHit=-1e9;enemies.forEach(e=>{e.agg=0});mActive=mounts.find(q=>q.k==k).id;pl.position.set(0,0,0);pl.rotation.y=0;toggleMount();
    if(!riding){info[k].err='no ride';continue}
    sc.add(pl);sc.add(mModel);
    const step=(ms,v)=>{for(let t=0;t<ms;t+=16){T+=16;const dt=.016;if(v)pl.position.z+=v*dt;animHero(T,v>0);mountTick(dt,T,v>0?1:0)}};
    step(1500,0);pl.updateMatrixWorld(true);
    const rb=new THREE.Box3().setFromObject(mModel).union(new THREE.Box3().setFromObject(pl)),rs=rb.getSize(new V()),rc=rb.getCenter(new V());const RR=Math.max(rs.x,rs.y,rs.z)*1.05;
    const fol=(col,row,dir,label)=>{const p=pl.position,c=new V(p.x,rc.y,p.z);shot(col,row,dir,label,c,RR*2.1)};
    fol(0,1,[1,.12,0],'ridden side');fol(1,1,[0,.12,1],'front');fol(2,1,[.75,.3,.75],'3/4');fol(3,1,[-1,.12,0],'other side');fol(4,1,[-.7,.3,-.7],'3/4 back');
    // contact data while standing
    const b=pl.bones,W=o=>o.getWorldPosition(new V());pl.updateMatrixWorld(true);mModel.updateMatrixWorld(true);
    const hip=W(b.pelvis),sd=W(mModel.sd);
    // the saddle's seat surface under the hips: highest point of the mount (not the rider) in a small column at the hips
    const rcs=new THREE.Raycaster(new V(hip.x,hip.y+1,hip.z),new V(0,-1,0),0,3),hits=rcs.intersectObject(mModel,true).filter(h=>h.object.visible);
    info[k].hipY=+hip.y.toFixed(3);info[k].saddleY=+(sd.y).toFixed(3);info[k].seatTop=hits.length?+hits[0].point.y.toFixed(3):null;info[k].L=mModel._lkL?{p:+mModel._lkL.p.toFixed(2),s:+mModel._lkL.s.toFixed(2),y:+mModel._lkL.y.toFixed(2),k:+mModel._lkL.k.toFixed(2),pen:+mModel._lkL.pen.toFixed(4)}:null;
    info[k].feet=[W(b.lh2),W(b.rh2)].map(p=>[p.x,p.y,p.z].map(v=>+v.toFixed(2)));
    // walk + gallop strides
    step(900,2.2);let by=[],hx=[];for(let i=0;i<5;i++){step(90,2.2);if(i)fol(i-1+0,2,[1,.1,0],i==1?'walk':'');}
    step(900,7.5);
    const legR=[];for(let i=0;i<4;i++){step(70,7.5);legR.push(mModel.r.children.filter(c=>c.isBone&&c!==mModel.r.b).map(h=>+h.rotation.x.toFixed(2)));by.push(+mModel.r.b.position.y.toFixed(3))}
    fol(4,2,[1,.1,0],'gallop');
    info[k].gal={legR,by};
    let nan=false;mModel.traverse(o=>{if(o.isBone||o.isMesh){const e=o.matrixWorld.elements;for(let i=0;i<16;i++)if(!isFinite(e[i]))nan=true}});pl.traverse(o=>{if(o.isBone){const e=o.matrixWorld.elements;for(let i=0;i<16;i++)if(!isFinite(e[i]))nan=true}});info[k].nan=nan;
    out[k]=cnv.toDataURL('image/jpeg',.86);
    // one ridden side view for the overview sheet
    step(1500,0);const c2=document.createElement('canvas');c2.width=FW;c2.height=FH;fol(0,0,[1,.12,0],'');c2.getContext('2d').drawImage(rd.domElement,0,0);V100T.lbl(c2.getContext('2d'),k,0,0);out[k+'_ov']=c2.toDataURL('image/jpeg',.86);
    {const mm=mModel;if(riding)dismount();if(mm)sc.remove(mm)}home.add(pl);
  }catch(e){info[k]={err:String(e)+' '+(e.stack||'').slice(0,600)};try{home.add(pl)}catch(_){}}}
  return {out,info}}"""

# rider contact check: sample the mount's skinned surface and test points along the rider's thighs / shins / feet
RIDECHK_JS=r"""(keys)=>{
  window.requestAnimationFrame=()=>0;const V=THREE.Vector3,res={};let T=900000;const home=pl.parent;
  mounts=keys.map((k,i)=>({id:950+i,k,n:MOUNTS[k].n,spd:60,cap:90,dist:0}));
  for(const k of keys){try{
    if(riding)dismount();hero.lastHit=-1e9;mActive=mounts.find(q=>q.k==k).id;pl.position.set(0,0,0);pl.rotation.y=0;toggleMount();
    const step=(ms,v)=>{for(let t=0;t<ms;t+=16){T+=16;if(v)pl.position.z+=v*.016;animHero(T,v>0);mountTick(.016,T,v>0?1:0)}};
    const one=(label)=>{
      pl.updateMatrixWorld(true);mModel.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(mModel.matrixWorld).invert();
      // body cross-section: for the skinned body mesh only (not the saddle), half width per (y,z) cell, 2 cm cells
      const cells=new Map(),A=new V(),B=new V(),C=new V(),P=new V();
      const onlyBody=(()=>{let f=0;mModel.r.traverse(o=>{if(o.userData&&o.userData.mdlBody)f=1});return f})();mModel.r.traverse(o=>{if(!o.isSkinnedMesh||(onlyBody&&!o.userData.mdlBody))return;const g=o.geometry,pa=g.attributes.position,ix=g.index?g.index.array:null,n=ix?ix.length:pa.count;
        const Wm=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld),get=(i,out)=>{out.fromBufferAttribute(pa,i);o.boneTransform(i,out);return out.applyMatrix4(Wm)};
        for(let t=0;t+2<n;t+=3){get(ix?ix[t]:t,A);get(ix?ix[t+1]:t+1,B);get(ix?ix[t+2]:t+2,C);const N=Math.min(10,1+Math.ceil(Math.max(A.distanceTo(B),B.distanceTo(C),C.distanceTo(A))/.03));
          for(let i=0;i<=N;i++)for(let j=0;j<=N-i;j++){const u=i/N,w=j/N,r=1-u-w;P.set(A.x*r+B.x*u+C.x*w,A.y*r+B.y*u+C.y*w,A.z*r+B.z*u+C.z*w);const key=Math.round(P.y/.02)*1000+Math.round(P.z/.02);const q=cells.get(key)||0;if(Math.abs(P.x)>q)cells.set(key,Math.abs(P.x))}}});
      const hw=(y,z)=>{let m=0;for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){const q=cells.get((Math.round(y/.02)+dy)*1000+Math.round(z/.02)+dz)||0;if(q>m)m=q}return m};
      const b=pl.bones,W=o=>o.getWorldPosition(new V()).applyMatrix4(inv);let worst=0,wh='';
      ['l','r'].forEach(s=>{const H=W(b[s+'h0']),K=W(b[s+'h1']),F=W(b[s+'h2']);
        const seg=(a,c,n,from,rad)=>{for(let i=0;i<=n;i++){const t=from+(1-from)*i/n,p=a.clone().lerp(c,t),w=hw(p.y,p.z),d=w+rad-Math.abs(p.x);if(w>0&&d>worst){worst=d;wh=s+(c===K?'thigh':c===F?'shin':'')+' t='+t.toFixed(2)}}};
        seg(H,K,8,.55,.02);seg(K,F,8,0,.03);
        const toe=F.clone().add(new V(0,-.02,.1));const w=hw(toe.y,toe.z),d=w+.03-Math.abs(toe.x);if(w>0&&d>worst){worst=d;wh=s+'toe'}});
      const hip=W(b.pelvis),sd=mModel.sd.position;
      return {pen:+worst.toFixed(3),wh,hipAbove:+(hip.y-(sd.y+.06)).toFixed(3)}};
    step(1500,0);const st=one('stand');step(900,2.2);const wk=one('walk');step(1200,7.5);const ga=one('gallop');
    res[k]={stand:st,walk:wk,gallop:ga};if(riding)dismount();home.add(pl);
  }catch(e){res[k]={err:String(e)+' '+(e.stack||'').slice(0,500)};try{home.add(pl)}catch(_){}}}
  return res}"""

LINEUP_JS=COMMON+r"""(groups)=>{
  const FW=1500,FH=520,E=V100T.mk(FW,FH),{rd,sc,cam}=E,out={},info={};const V=THREE.Vector3;let T=500000;
  const hero=()=>{const h=buildHero();try{refreshGear(h,'warrior',{})}catch(_){}for(let t=0;t<200;t+=16)animHero(T+t,false,h);return h};
  const mkOne=s=>{const q=s.split(':');let g,anim;
    if(q[0]=='HERO'){g=hero();anim=t=>animHero(t,false,g);return {g,anim,n:'hero'}}
    if(q[0]=='M'){g=mountModel(q[1]);anim=t=>g.r.rig(t,false,0);return {g,anim,n:q[1]}}
    if(q[0]=='C'){const c=mkC(q[1],10,0,q[2]||'');c.z=1;if(q[3])c.evo=+q[3];g=cr(c);anim=t=>animC(g,t,false,0);return {g,anim,n:q[1]+(q[2]?' '+q[2]:'')}}
    if(q[0]=='E'){const c=mk(q[1],12,0,'');g=cr(c);anim=t=>animC(g,t,false,0);return {g,anim,n:q[1]}}
    if(q[0]=='B'){const i=+q[1];const c=mk('boss'+i,30,0,'');g=cr(c);const d=BOSSES[i]||{};
      const sp=(d.sp)||'';g.bs*=d.hum?2.5:sp=='Centipede'?3.8:sp=='Hydra'?4.4:3;g.scale.setScalar(g.bs);anim=t=>animC(g,t,false,0);return {g,anim,n:'boss'+i+' '+sp}}
    if(q[0]=='EGG'){const ec=parseInt(RAR[+q[1]][1].slice(1),16),s=q[2]?1.5:1;g=new THREE.Group();const m=new THREE.Mesh(bzEggGeo(ec,0),bzEggMat(ec,.35));m.scale.set(.16*s,.205*s,.16*s);m.position.y=.205*s;g.add(m);anim=()=>{};return {g,anim,n:'egg'+(q[2]?' mount':'')}}
    if(q[0]=='CH'){g=makeChest?makeChest(+q[1]||0):null;if(g&&g.isObject3D===undefined&&g.m)g=g.m;anim=()=>{};return {g,anim,n:'chest'}}
    return null};
  for(const gk in groups){try{const L=groups[gk].map(mkOne).filter(x=>x&&x.g);let x=0;const items=[];
      for(const it of L){sc.add(it.g);for(let t=0;t<600;t+=16){T+=16;try{it.anim(T)}catch(_){}}it.g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(it.g),s=b.getSize(new V());
        const w=Math.max(s.x,.4);it.g.position.x+=x+w/2-(b.min.x+b.max.x)/2;it.g.position.z-=(b.min.z+b.max.z)/2;x+=w+.35;items.push({n:it.n,h:+s.y.toFixed(2),l:+s.z.toFixed(2),w:+s.x.toFixed(2),x:it.g.position.x})}
      const tw=x,th=Math.max(...items.map(i=>i.h),2.4);const cx=tw/2,cy=th*.45,d=Math.max(tw/2/Math.tan(14*Math.PI/180)/(FW/FH)*1.05,th*2.4);
      cam.position.set(cx,cy+th*.15,d);cam.lookAt(cx,cy,0);rd.render(sc,cam);
      const cnv=document.createElement('canvas');cnv.width=FW;cnv.height=FH+40;const ctx=cnv.getContext('2d');ctx.fillStyle='#222';ctx.fillRect(0,0,FW,FH+40);ctx.drawImage(rd.domElement,0,0);
      // labels under each model (project its x)
      ctx.font='11px sans-serif';ctx.fillStyle='#fff';items.forEach(i=>{const p=new V(i.x,0,0).project(cam);ctx.fillText(i.n+' '+i.h,(p.x+1)/2*FW-30,FH+14)});
      // 1 m ruler lines
      out[gk]=cnv.toDataURL('image/jpeg',.86);info[gk]=items;
      L.forEach(it=>sc.remove(it.g));
    }catch(e){info[gk]={err:String(e)+' '+(e.stack||'').slice(0,400)}}}
  return {out,info}}"""

GRID_JS=COMMON+r"""(subs)=>{
  const FW=window.V100GW||300,FH=Math.round(FW*.87),COLS=6,E=V100T.mk(FW,FH),{rd,sc,cam}=E,V=THREE.Vector3;let T=600000;const out=[];
  const hero=buildHero();try{refreshGear(hero,'warrior',{})}catch(_){}for(let t=0;t<200;t+=16)animHero(T+t,false,hero);
  hero.traverse(o=>{if(o.isMesh&&o.parent&&o.parent.isBone&&o.geometry&&o.geometry.boundingSphere&&o.geometry.boundingSphere.radius>.5)o.visible=false});
  const rows=Math.ceil(subs.length/COLS),cnv=document.createElement('canvas');cnv.width=FW*COLS;cnv.height=FH*rows;const ctx=cnv.getContext('2d');
  subs.forEach((s,i)=>{try{const q=s.split(':');let g,anim;
    if(q[0]=='M'){g=mountModel(q[1]);anim=t=>g.r.rig(t,false,0)}
    else if(q[0]=='C'){const c=mkC(q[1],10,0,q[2]||'');c.z=1;g=cr(c);anim=t=>animC(g,t,false,0)}
    else if(q[0]=='E'){const c=mk(q[1],12,0,'');g=cr(c);anim=t=>animC(g,t,false,0)}
    else if(q[0]=='B'){const c=mk('boss'+q[1],30,0,'');g=cr(c);const d=BOSSES[+q[1]]||{},sp=d.sp||'';g.bs*=d.hum?2.5:sp=='Centipede'?3.8:sp=='Hydra'?4.4:3;g.scale.setScalar(g.bs);anim=t=>animC(g,t,false,0)}
    sc.add(g);for(let t=0;t<500;t+=16){T+=16;try{anim(T)}catch(_){}}g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g),sz=b.getSize(new V());
    sc.add(hero);hero.position.set(b.min.x-.45,0,(b.min.z+b.max.z)/2);hero.rotation.y=.5;hero.updateMatrixWorld(true);
    const bb=b.clone().union(new THREE.Box3().setFromObject(hero)),c=bb.getCenter(new V()),s2=bb.getSize(new V()),R=Math.max(s2.x*.8,s2.y,s2.z*.6)*1.15;
    const dir=window.V100GD?new V(...window.V100GD).normalize():new V(.55,.28,1).normalize();cam.position.copy(c).addScaledVector(dir,R*2.2);cam.lookAt(c);rd.render(sc,cam);
    ctx.drawImage(rd.domElement,(i%COLS)*FW,Math.floor(i/COLS)*FH);V100T.lbl(ctx,s+' h'+sz.y.toFixed(2)+' l'+sz.z.toFixed(2),(i%COLS)*FW,Math.floor(i/COLS)*FH);
    sc.remove(g);sc.remove(hero)}catch(e){V100T.lbl(ctx,s+' ERR '+e,(i%COLS)*FW,Math.floor(i/COLS)*FH)}});
  return cnv.toDataURL('image/jpeg',.85)}"""
CLOSE_JS=COMMON+r"""(keys)=>{
  const FW=640,FH=460,E=V100T.mk(FW,FH),{rd,sc,cam}=E,V=THREE.Vector3,out={};let T=700000;const home=pl.parent;
  mounts=keys.map((k,i)=>({id:990+i,k,n:MOUNTS[k].n,spd:60,cap:90,dist:0}));
  for(const k of keys){const cnv=document.createElement('canvas');cnv.width=FW*3;cnv.height=FH*2;const ctx=cnv.getContext('2d');
    const m=mountModel(k);sc.add(m);for(let t=0;t<600;t+=16){T+=16;m.r.rig(T,false,0)}m.updateMatrixWorld(true);
    const bx=new THREE.Box3().setFromObject(m),c=bx.getCenter(new V()),R=bx.getSize(new V()).length()*.5;
    const shot=(col,row,dir,lab,tg,d)=>{const v=new V(...dir).normalize(),cc=tg||c;cam.position.copy(cc).addScaledVector(v,(d||R)*3.3);cam.lookAt(cc);rd.render(sc,cam);ctx.drawImage(rd.domElement,col*FW,row*FH);V100T.lbl(ctx,lab,col*FW,row*FH)};
    shot(0,0,[1,.15,.12],k+' side');shot(1,0,[-.6,.35,.8],'front 3/4');
    // head close-up
    const hd=m.r.b.children.find(o=>o.isBone).children.find(o=>o.isBone);const hp=hd.getWorldPosition(new V());shot(0,1,[.8,.25,.7],'head',hp,R*.35);shot(2,0,[.05,.2,1],'head front',hp,R*.3);shot(2,1,[1,.1,0],'head side',hp,R*.3);
    sc.remove(m);
    if(riding)dismount();hero.lastHit=-1e9;mActive=mounts.find(q=>q.k==k).id;pl.position.set(0,0,0);pl.rotation.y=0;toggleMount();sc.add(pl);sc.add(mModel);
    for(let t=0;t<1500;t+=16){T+=16;animHero(T,false);mountTick(.016,T,0)}pl.updateMatrixWorld(true);
    const hp2=pl.bones.pelvis.getWorldPosition(new V());shot(1,1,[.85,.2,.5],'rider legs',hp2.clone().add(new V(0,-.15,0)),R*.42);
    out[k]=cnv.toDataURL('image/jpeg',.88);{const mm=mModel;if(riding)dismount();if(mm)sc.remove(mm)}home.add(pl)}
  return out}"""
GRIDS={
 'comp':['C:Foxlet','C:Emberlynx','C:Ashwolf','C:Direfang','C:Skollmaw','C:Stoneshell','C:Cragback','C:Titanshell','C:Mossfrog','C:Bogmaw','C:Batwing','C:Duskwing',
   'C:Skyhawk','C:Stormtalon','C:Rocsovereign','C:Drakelet','C:Pyrewing','C:Elderdrake','C:Gravewyrm','C:Venomcoil','C:Wispling','C:Lumenwisp','C:Soulwarden','C:Boneling',
   'C:Lichbone','C:Gloomcap','C:Sporelord','C:Cryptspider','C:Widowqueen','C:Hivemother'],
 'wild':['E:snowwolf','E:lurker','E:tortoise','E:cavebat','E:shambler','E:magmadrake','E:stalker','E:wraith','E:boghorror','E:harpy','E:sandwyrm','E:goo','E:spitter','E:maggot','E:scorp','E:bloodbat',
   'B:0','B:1','B:2','B:3','B:4','B:5'],
}
GROUPS={
 'mounts':['HERO']+['M:'+k for k in MNT],
 'beasts':['HERO','C:Foxlet','C:Emberlynx','C:Ashwolf','C:Direfang','C:Skollmaw','E:snowwolf','C:Stoneshell','C:Cragback','C:Titanshell','C:Mossfrog','C:Bogmaw'],
 'sky':['HERO','C:Batwing','C:Duskwing','C:Skyhawk','C:Stormtalon','C:Rocsovereign','C:Drakelet','C:Pyrewing','C:Elderdrake','C:Gravewyrm','C:Venomcoil'],
 'spirit':['HERO','C:Wispling','C:Lumenwisp','C:Soulwarden','C:Boneling','C:Lichbone','C:Gloomcap','C:Sporelord','C:Cryptspider','C:Widowqueen','C:Hivemother'],
 'wild':['HERO','E:lurker','E:tortoise','E:cavebat','E:shambler','E:magmadrake','E:stalker','E:wraith','E:boghorror','E:harpy','E:sandwyrm','E:goo','E:spitter','E:maggot','E:scorp','E:bloodbat'],
 'foes':['HERO','E:hobgoblin','E:slinger','E:bandit','E:brigand','E:shaman','E:cultist','E:orc','E:skeleton','E:bonearcher','E:hollowknight','E:giant','E:revenant','E:nagaw','E:troll','E:yeti','E:selem','E:ghoul','E:vamp','E:vampk'],
 'bosses':['HERO','B:0','B:1','B:2','B:3','B:4','B:5'],
 'props':['HERO','EGG:0','EGG:2','EGG:4','EGG:3:m','C:Foxlet','C:Wispling','C:Drakelet'],
}

def main():
    from PIL import Image
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
        pg=b.new_page(viewport={'width':1000,'height':640});errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)[:300]+' '+(e.stack or '')[:300].replace('\n',' ')))
        pg.add_init_script('window.AW_NOTITLE=1')
        pg.goto('file://'+O+'/live.html',wait_until='domcontentloaded',timeout=180000);pg.wait_for_function("()=>typeof hero!='undefined'&&!!document.getElementById('ccNext')",timeout=180000);pg.wait_for_timeout(1500)
        pg.evaluate("()=>localStorage.clear()")
        pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
        pg.evaluate("()=>{window.__rr=ren.render;ren.render=()=>{};if(window.POST)POST.render=()=>{}}")
        if 'mounts' in PART or 'ride' in PART:
            r=pg.evaluate(MOUNTS_JS,[MNT]);ov=[]
            for k,v in r['out'].items():
                if k.endswith('_ov'):ov.append(base64.b64decode(v.split(',')[1]));continue
                open(O+'/v100_%s_mount_%s.jpg'%(TAG,k),'wb').write(base64.b64decode(v.split(',')[1]))
            if ov:
                import io
                ims=[Image.open(io.BytesIO(x)) for x in ov];S=Image.new('RGB',(260*5,240*((len(ims)+4)//5)))
                for i,im in enumerate(ims):S.paste(im,((i%5)*260,(i//5)*240))
                S.save(O+'/v100_%s_mounts.jpg'%TAG,quality=86)
            for k,v in r['info'].items():print('MOUNT',TAG,k,json.dumps(v))
            if TAG=='after':
                for k,v in r['info'].items():
                    if 'err' in v:chk('mount %s builds and rides'%k,False,v['err']);continue
                    chk('mount %s no NaN'%k,not v['nan'])
                    chk('mount %s uses the v100 anatomical model'%k,v.get('v100'))
                    chk('mount %s triangles reasonable'%k,v['tris']<9000 and v['draws']<=10,'%d tris %d draws'%(v['tris'],v['draws']))
                    g=v['gal'];moves=max(max(q) for q in g['legR'])-min(min(q) for q in g['legR']);bob=max(g['by'])-min(g['by'])
                    chk('mount %s gallop runs'%k,moves>.3 and bob>.003,'leg range %.2f bob %.3f'%(moves,bob))
                    st=v.get('seatTop');chk('mount %s rider hips on the saddle'%k,st is not None and .0<=v['hipY']-st<=.13,'hip %.3f seat surface %s'%(v['hipY'],st))
        if 'checks' in PART or 'ride' in PART:
            rc=pg.evaluate(RIDECHK_JS,MNT)
            for k,v in rc.items():
                print('RIDE',TAG,k,json.dumps(v))
                if TAG=='after':
                    if 'err' in v:chk('ride %s'%k,False,v['err']);continue
                    worst=max(v[s]['pen'] for s in ('stand','walk','gallop'))
                    chk('ride %s legs outside the body'%k,worst<.03,json.dumps({s:v[s] for s in ('stand','walk','gallop')}))
        if 'close' in PART:
            r=pg.evaluate(CLOSE_JS,MNT)
            for k,v in r.items():open(O+'/v100_%s_close_%s.jpg'%(TAG,k),'wb').write(base64.b64decode(v.split(',')[1]))
        if 'grid' in PART:
            if os.environ.get('GW'):pg.evaluate("(a)=>{window.V100GW=a[0];window.V100GD=a[1]}",[int(os.environ['GW']),[1,.15,.05]])
            for k,v in GRIDS.items():
                if os.environ.get('GONLY') and k not in os.environ['GONLY'].split(','):continue
                u=pg.evaluate(GRID_JS,v);open(O+'/v100_%s_grid_%s.jpg'%(TAG,k),'wb').write(base64.b64decode(u.split(',')[1]))
        if 'lineup' in PART:
            r=pg.evaluate(LINEUP_JS,GROUPS)
            for k,v in r['out'].items():open(O+'/v100_%s_lineup_%s.jpg'%(TAG,k),'wb').write(base64.b64decode(v.split(',')[1]))
            for k,v in r['info'].items():print('LINEUP',TAG,k,json.dumps(v))
        print('PAGEERRORS',len(errs),errs[:5])
        if TAG=='after':chk('no page errors',not errs)
        b.close()
    print('CHECKS OK' if not FAIL else 'FAIL '+', '.join(FAIL))
main()
