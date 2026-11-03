# v192 camera (3570-v192-camera.js; owner, Nov 2 2026: "I want the camera to not be able to pass through the edge of an instance (the
# walls that surround each map). If it collides with the edge, the camera should zoom in. When the camera collides with all other
# objects in the game the object should fade and become semi transparent so you can still see your character."):
#   python3 fast.py v192_camera.py        (pictures: <AW_TMP>/v192_<name>.png)
# 1. the edge: in a field instance, a cave instance, a den, Duskhold's island and Abeksi's outer wall the hero stands 2.5-5.5 tiles
#    from the edge with the camera (12 back) on the edge's side. FAIL when the camera ends up in the edge's rock, over the void or
#    past the instance's rectangle (checked along the whole line from the hero's chest to the lens), when it was not pulled in,
#    when it jumps (a frame-to-frame step over 2.5), or when it does not glide back out once turned away from the edge.
# 2. objects: every plain scenery material is set up to fade (the v183 paint hook had made the fade skip them); a Duskhold
#    building and an Abeksi house between the camera and the hero are faded whole (a see-through box on them) and the camera
#    keeps the distance the player set (no zoom for objects).
import play,os,json
F=[]
def fail(*a):F.append(' '.join(str(x) for x in a));print('FAIL',*a,flush=True)
# a walkable spot 2.5-5.5 tiles from the edge (the first tile past the walkable ground, DW > 0), and the yaw toward it
FIND=r"""(a)=>{const I=a.gk==null?null:INSL[a.gk];
  if(I){if(I.en&&I.path&&I.path[30])insArrive(I);else{const c=I.wa||I.ba;toPos(c[0],c[1])}}else{const T=TOWNS[0];toPos(T.cx,T.cy+40)}
  const DW=MAP.DW,dw=(x,z)=>{const X=Math.round(x),Z=Math.round(z);return X<0||Z<0||X>=W||Z>=H?99:DW[Z*W+X]};
  let b=I?[I.x0+3,I.y0+3,I.x0+I.w-3,I.y0+I.h-3]:[TOWNS[0].cx-90,TOWNS[0].cy-70,TOWNS[0].cx+90,TOWNS[0].cy+130];if(a.box)b=a.box;
  let best=null;for(let z=b[1];z<b[3];z+=2)for(let x=b[0];x<b[2];x+=2){if(dw(x,z)>-1.5||solid(x,z))continue;if(I&&I.den&&Math.hypot(x-I.ba[0],z-I.ba[1])<PM_DENR+16)continue;   // a den: away from the boss's arena
    for(let k=0;k<16;k++){const yw=k/16*6.2832,ox=Math.sin(yw),oz=Math.cos(yw);let s=0,bk=99;for(let q=.5;q<=8;q+=.5)if(dw(x+ox*q,z+oz*q)>0){s=q;break}
      if(s<2.5||s>5.5)continue;for(let q=.5;q<=16;q+=.5)if(dw(x-ox*q,z-oz*q)>0){bk=q;break}
      const sc=Math.abs(s-4)+(bk<14?5:0);if(!best||sc<best.sc)best={x,z,yaw:yw,s,bk,sc}}}
  return best}"""
WATCH=r"""async(n)=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));if(window.__lf==null){window.__lf=0;const f=loop;loop=function(){window.__lf++;return f.apply(this,arguments)}}
  let f0=window.__lf,last=cam.position.clone(),mx=0,t0=performance.now();while(window.__lf<f0+n&&performance.now()-t0<60000){await sl(15);const d=cam.position.distanceTo(last);if(window.__lf>f0+3)mx=Math.max(mx,d);last.copy(cam.position)}
  const c=cam.position,P=pl.position,y0=P.y+1.1;let I=null;const k=cvKey();if(k>=0)I=INSL[k];
  // the whole line from the chest to the lens: in the edge's rock (past the walkable ground and under the ground there), over the void, past the rectangle
  const DW=MAP.DW,dw=(x,z)=>{const X=Math.round(x),Z=Math.round(z);return X<0||Z<0||X>=W||Z>=H?99:DW[Z*W+X]};
  const L=Math.hypot(c.x-P.x,c.y-y0,c.z-P.z);let bad='';
  for(let s=.6;s<=L+1e-6&&!bad;s+=.2){const f=s/L,x=P.x+(c.x-P.x)*f,y=y0+(c.y-y0)*f,z=P.z+(c.z-P.z)*f;
    if(I&&(x<I.x0+.5||z<I.y0+.5||x>I.x0+I.w-.5||z>I.y0+I.h-.5))bad='past the rectangle';
    else if(GH(x,z)<-6)bad='over the void';
    else if(dw(x,z)>0&&y<GH(x,z)+.05)bad='in the edge rock';
    if(bad)bad+=' at '+s.toFixed(2)}
  return {cam:[c.x,c.y,c.z].map(v=>+v.toFixed(2)),dist:+L.toFixed(2),bad,step:+mx.toFixed(2),dd:+camDD.toFixed(2),ok:cam172Ok(c.x,c.y,c.z,I)}}"""
TURN=r"""async(a)=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const [y0,y1,n,fr]=a;let mx=0,last=cam.position.clone();
  for(let i=1;i<=n;i++){camYaw=y0+(y1-y0)*i/n;const f0=window.__lf,t0=performance.now();while(window.__lf<f0+fr&&performance.now()-t0<20000){await sl(15);mx=Math.max(mx,cam.position.distanceTo(last));last.copy(cam.position)}}
  return {step:+mx.toFixed(2)}}"""
PLACE="(a)=>{const q=a[0];toPos(q.x,q.z,q.yaw);camYaw=q.yaw;camPitch=a[2];camDist=a[1];camDD=null;try{snapCam()}catch(_){}return 1}"
# a building between the camera and the hero in Duskhold (as v135_fade_shot / v169_ghost_look)
HOUSE=r"""()=>{const T=TOWNS[0],rc=new THREE.Raycaster(),V3=THREE.Vector3;let best=null;const M=[];scene.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&!o.isInstancedMesh&&o.visible)M.push(o)});
  for(let z=T.cy-20;z<T.cy+30&&!best;z+=2)for(let x=T.cx-24;x<T.cx+24&&!best;x+=2){if(solid(x,z))continue;
    for(let a=0;a<8&&!best;a++){const yaw=a/8*Math.PI*2,y=GH(x,z),h=new V3(x,y+1.1,z),c=new V3(x+Math.sin(yaw)*Math.cos(.35)*8,y+1.1+Math.sin(.35)*8,z+Math.cos(yaw)*Math.cos(.35)*8);
      const dir=h.clone().sub(c),L=dir.length();rc.set(c,dir.normalize());rc.far=L-1.5;rc.camera=cam;let I=[];try{I=rc.intersectObjects(M,false)}catch(e){I=[]}
      I=I.filter(q=>q.distance>1.5);const hit=I.find(q=>{const b=new THREE.Box3().setFromObject(q.object);return b.max.y-b.min.y>2.5&&q.point.y>y+1});
      if(hit)best={x,z,yaw,pt:[hit.point.x,hit.point.y,hit.point.z],uuid:hit.object.uuid}}}
  return best}"""
# an Abeksi house (its walls two-sided) between the camera and the hero
ABHOUSE=r"""()=>{const I=INSL[30],rc=new THREE.Raycaster(),V3=THREE.Vector3;const M=[];AB152.S.root.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&!o.isInstancedMesh&&o.material&&o.material.side===2)M.push(o)});
  let best=null;for(let v=20;v<I.h-20;v+=4)for(let u=20;u<I.w-20;u+=4){const x=I.x0+u,z=I.y0+v;if(solid(x,z))continue;
    for(let a=0;a<12;a++){const yaw=a/12*Math.PI*2,y=GH(x,z),h=new V3(x,y+1.1,z),c=new V3(x+Math.sin(yaw)*Math.cos(.3)*9.5,y+1.1+Math.sin(.3)*9.5,z+Math.cos(yaw)*Math.cos(.3)*9.5);
      if(GH(c.x,c.z)>c.y-.5)continue;const dir=h.clone().sub(c),L=dir.length();rc.set(c,dir.normalize());rc.far=L-1.2;rc.near=1.5;
      const I2=rc.intersectObjects(M,false).filter(q=>q.point.y>y+1.4);if(I2.length>=1){const sc=I2.length;if(!best||sc>best.n)best={x,z,yaw,n:sc,pt:[I2[0].point.x,I2[0].point.y,I2[0].point.z]}}}}
  return best}"""
# with the view drawn (fast mode off for a while): wait for the scan, then is a see-through box on the blocking object, how far is the camera
FADE=r"""async(a)=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));if(window.__fast)window.__fast.draw++;
  try{const s0=OB176.st.scans,t0=performance.now();let hit=null;const P=new THREE.Vector3(a.pt[0],a.pt[1],a.pt[2]);
    while(performance.now()-t0<90000){await sl(100);if(OB176.st.scans<s0+3)continue;
      hit=OB176.box.find(b=>b.w>.8&&P.x>b.mn.x-.3&&P.y>b.mn.y-.3&&P.z>b.mn.z-.3&&P.x<b.mx.x+.3&&P.y<b.mx.y+.3&&P.z<b.mx.z+.3);if(hit)break}
    const c=cam.position,p=pl.position;
    return {box:!!hit,boxes:OB176.box.map(b=>+b.w.toFixed(2)),scans:OB176.st.scans-s0,dist:+c.distanceTo(new THREE.Vector3(p.x,p.y+1.1,p.z)).toFixed(2),dd:+camDD.toFixed(2),k:OB176.k,
      a2c:OB176.U.uOb192A?1:0}}
  finally{if(window.__fast)window.__fast.draw--}}"""
# every plain scenery material (default shader or the town atlas, with or without the v183 paint) is set up to fade
MATS=r"""()=>{f135Scan();const S=f135Skip(),P=String(THREE.Material.prototype.onBeforeCompile),PK=THREE.Material.prototype.customProgramCacheKey;let n=0;const bad=[];
  scene.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||!o.visible)return;let a=o;while(a){if(S.has(a)||(a.userData&&a.userData.noFade135)||a.isBone)return;a=a.parent}
    (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!m||m.transparent||m.skinning||m.userData.noFade135)return;
      if(!(m.isMeshStandardMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshBasicMaterial))return;
      const k=m.customProgramCacheKey===PK?'':String(m.customProgramCacheKey()),kb=k.replace('f135','').replace(/(\|ep183)+$/,'').replace(/^\|ep183/,'');
      if(!(kb===''||kb===P||kb==='txa1'))return;n++;if(!m.userData.ob176)bad.push((o.name||o.parent&&o.parent.name||o.type)+' '+m.type+' key '+k.slice(0,30))})});
  return {n,bad:bad.length,ex:bad.slice(0,4)}}"""
def s(pg):
    pg.set_default_timeout(1800000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#mqt152,#glog,#pk,#chqt132,#locBox,.dn,#ab152h,#hint,#orbs,#bar,#topl,#tr,#qt,.qt{display:none!important}')
    pg.evaluate("()=>{window.__god=1;return 1}")
    def shot(n):pg.screenshot(path=play.TMP+'/v192_'+n+'.png',timeout=600000)
    # ---- 1. the edge ----
    cave=pg.evaluate("()=>{const I=INSL.find(I=>I.fld&&typeof TH112!='undefined'&&TH112.byG[I.g]&&TH112.byG[I.g].sh&&TH112.byG[I.g].sh.k=='cave');return I?I.g:null}")
    den=pg.evaluate("()=>{const I=INSL.find(I=>I.den);return I?I.g:null}")
    views=[('field',0,None),('cave',cave,None),('den',den,None),('duskhold',None,None)]
    for name,gk,box in views:
        q=pg.evaluate(FIND,{'gk':gk,'box':box});pg.wait_for_timeout(2500)
        if not q:fail(name,': no spot near the edge');continue
        for dist,pt in [(12,.3),(12,.75)]:
            pg.evaluate(PLACE,[q,dist,pt]);r=pg.evaluate(WATCH,90)
            if r['bad']:r=pg.evaluate(WATCH,30)   # a late arrival snap can still be settling
            print('edge',name,gk,dist,pt,json.dumps(q),json.dumps(r),flush=True)
            if r['bad'] and r['dist']>1.35:fail(name,'pitch',pt,': the camera passes the edge:',r['bad'],r['cam'])
            if r['dist']>dist-.5:fail(name,'pitch',pt,': the camera was not pulled in (distance',r['dist'],')')
            if r['step']>2.5:fail(name,'pitch',pt,': the camera jumped',r['step'])
            if pt==.3:shot('edge_'+name)
        # turning toward the edge from the open side: smooth, and inside all the way
        pg.evaluate(PLACE,[dict(q,yaw=q['yaw']+3.14159),12,.3]);pg.evaluate(WATCH,40)
        # turned like a player does (a half turn over ~1 s of frames), not in one frame
        r=pg.evaluate(TURN,[q['yaw']+3.14159,q['yaw'],16,4]);r2=pg.evaluate(WATCH,60);r['bad']=r2['bad'];r['dist']=r2['dist'];r['step']=max(r['step'],r2['step'])
        print('edge',name,'turn in',json.dumps(r),flush=True)
        if r['bad'] and r['dist']>1.35:fail(name,'turning toward the edge: the camera passes the edge:',r['bad'])
        if r['step']>2.5:fail(name,'turning toward the edge: the camera jumped',r['step'])
        # and back out when turned away again
        pg.evaluate("(y)=>{camYaw=y;return 1}",q['yaw']+3.14159);r=pg.evaluate(WATCH,150)
        print('edge',name,'turn out',json.dumps(r),flush=True)
        if q['bk']>=14 and r['dd']<10.5:fail(name,'turned away from the edge: the camera did not glide back out (distance',r['dd'],')')
    # Abeksi: the city's outer wall is its edge
    pg.evaluate("()=>{AB152Q.st=1;ab152Enter();AB152H.frz=1;window.__k192=setInterval(()=>{AB152H.frz=1},100);return 1}");pg.wait_for_timeout(5000)
    q=pg.evaluate(FIND,{'gk':30,'box':pg.evaluate("()=>{const I=INSL[30],N=ab152Plan().IN;return [I.x0+N[0]+2,I.y0+N[1]+2,I.x0+N[2]-2,I.y0+N[3]-2]}")})
    if not q:fail('abeksi: no spot near the outer wall')
    else:
        pg.evaluate(PLACE,[q,12,.3]);r=pg.evaluate(WATCH,90);print('edge abeksi wall',json.dumps(q),json.dumps(r),flush=True)
        if not r['ok'] and r['dist']>1.35:fail('abeksi wall: the camera is out of the map',r['cam'])
        if r['bad'] and r['dist']>1.35:fail('abeksi wall: the camera passes the edge:',r['bad'])
        if r['dist']>11.5:fail('abeksi wall: the camera was not pulled in (distance',r['dist'],')')
        shot('edge_abeksi')
    # ---- 2. objects fade, the camera keeps its distance ----
    m=pg.evaluate(MATS);print('materials',json.dumps(m),flush=True)
    if m['bad']:fail(m['bad'],'of',m['n'],'scenery materials in Abeksi cannot fade, e.g.',m['ex'])
    q=pg.evaluate(ABHOUSE)
    if not q:fail('abeksi: no house between camera and hero')
    else:
        pg.evaluate(PLACE,[q,9.5,.3]);pg.evaluate(WATCH,40);r=pg.evaluate(FADE,q);print('fade abeksi',json.dumps(q),json.dumps(r),flush=True)
        if not r['box']:fail('abeksi: the house between the camera and the hero is not faded',r['boxes'])
        if r['dist']<9.5-.6 or r['dd']<9.5-.3:fail('abeksi: the camera zoomed in for a house (distance',r['dist'],r['dd'],')')
        shot('fade_abeksi')
    pg.evaluate("()=>{clearInterval(window.__k192);const T=TOWNS[0];toPos(T.cx,T.cy+6);return 1}");pg.wait_for_timeout(4000)
    m=pg.evaluate(MATS);print('materials duskhold',json.dumps(m),flush=True)
    if m['bad']:fail(m['bad'],'of',m['n'],'scenery materials in Duskhold cannot fade, e.g.',m['ex'])
    q=pg.evaluate(HOUSE)
    if not q:fail('duskhold: no building between camera and hero')
    else:
        pg.evaluate(PLACE,[q,8,.35]);pg.evaluate(WATCH,40);r=pg.evaluate(FADE,q);print('fade duskhold',json.dumps(q),json.dumps(r),flush=True)
        if not r['box']:fail('duskhold: the building between the camera and the hero is not faded',r['boxes'])
        if r['dist']<8-.6 or r['dd']<8-.3:fail('duskhold: the camera zoomed in for a building (distance',r['dist'],r['dd'],')')
        shot('fade_duskhold')
    print('DONE' if not F else 'FAILED '+str(len(F)),flush=True)
play.run(s,w=900,hh=560)
