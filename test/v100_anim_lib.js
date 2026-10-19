// v100 anim test library (evaluated in the page). Plays the hero's real basic attacks with the main loop frozen, steps
// animHero with a fixed 16 ms clock, records the weapon tip / hands / torso in the hero's own frame (hero at the origin,
// facing +z, its weapon hand "aR" on the +x side) and renders frame sheets with the tip's motion trail.
window.V100T=(function(){
  const V3=THREE.Vector3;let CW=180,CH=230;
  let rd=null,sc=null,cam=null,trail=null,trailN=0;
  function size(w,h){CW=w;CH=h;if(rd){rd.setSize(CW,CH);cam.aspect=CW/CH;cam.updateProjectionMatrix()}}
  function setup(){
    if(rd)return;
    rd=window._v100rd||(window._v100rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true}));rd.setSize(CW,CH);
    sc=new THREE.Scene();sc.background=new THREE.Color(0x4a5058);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.85));
    const d=new THREE.DirectionalLight(0xfff0d8,1.2);d.position.set(3,5,4);sc.add(d);const d2=new THREE.DirectionalLight(0x9ab0ff,.5);d2.position.set(-3,2,-4);sc.add(d2);
    const gr=new THREE.Mesh(new THREE.CircleGeometry(1.6,24),new THREE.MeshStandardMaterial({color:0x5a5a4a,roughness:1}));gr.rotation.x=-Math.PI/2;sc.add(gr);
    // a target marker 1.4 in front
    const tg=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.6,6),new THREE.MeshBasicMaterial({color:0x8a3a3a}));tg.position.set(0,.8,1.5);sc.add(tg);
    cam=new THREE.PerspectiveCamera(34,CW/CH,.05,80);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(3*400),3));g.setDrawRange(0,0);
    trail=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xffe040}));trail.frustumCulled=false;sc.add(trail)}
  function shot(cx,x,y,dir,lab,o){o=o||{};
    const c=new V3(0,o.cy||.85,o.cz||.25);cam.position.copy(c).add(new V3(...dir).normalize().multiplyScalar(o.dist||3.6));cam.lookAt(c);
    rd.render(sc,cam);cx.drawImage(rd.domElement,x,y);cx.fillStyle=o.col||'#fff';cx.font='12px sans-serif';cx.fillText(lab,x+4,y+14)}
  const r3=v=>[+v.x.toFixed(3),+v.y.toFixed(3),+v.z.toFixed(3)];
  // equip a weapon type on the hero (class from the template)
  function equip(wt){
    const idx=ITPL.findIndex(t=>t.sl=='weapon'&&t.wt==wt);if(idx<0)throw 'no template '+wt;
    const t=ITPL[idx];hero.cls=t.cls||hero.cls;hero.lvl=Math.max(hero.lvl,60);eq.weapon={id:910000,tp:idx,r:2,req:1,up:0,n:t.n};
    if(hero.cls=='paladin')eq.offhand=null;
    refreshGear(pl,hero.cls,eq);return idx}
  function weapons(){return (pl.gearG||[]).filter(o=>o.userData&&o.userData.wt&&o.userData.wt!='shield'&&o.parent)}
  // the tip of a weapon in its model frame: the lowest point along -y (blade/head end)
  function tipOf(W){if(W.userData._v100tip)return W.userData._v100tip;let mn=0;W.traverse(m=>{if(m.isMesh&&m.geometry){m.geometry.computeBoundingBox();const bb=m.geometry.boundingBox;mn=Math.min(mn,bb.min.y+m.position.y)}});
    return W.userData._v100tip=new V3(0,mn*.92,0)}
  function local(v){return pl.worldToLocal(v)}
  function sample(){
    pl.updateMatrixWorld(true);const b=pl.bones,o={};
    const Ws=weapons();o.tips=Ws.map(W=>{const s=W.parent===b.aL2?'L':'R';return {s,p:r3(local(tipOf(W).clone().applyMatrix4(W.matrixWorld))),g:r3(local(new V3().applyMatrix4(W.matrixWorld)))}});
    o.hR=r3(local(new V3(0,-.03,.02).applyMatrix4(b.aR2.matrixWorld)));o.hL=r3(local(new V3(0,-.03,.02).applyMatrix4(b.aL2.matrixWorld)));
    o.chest=r3(local(new V3(0,0,.3).applyMatrix4(b.chest.matrixWorld)).sub(local(new V3().applyMatrix4(b.chest.matrixWorld))));
    o.pel=r3(local(new V3(0,0,.3).applyMatrix4(b.pelvis.matrixWorld)).sub(local(new V3().applyMatrix4(b.pelvis.matrixWorld))));
    o.head=r3(local(new V3(0,0,.3).applyMatrix4(b.head.matrixWorld)).sub(local(new V3().applyMatrix4(b.head.matrixWorld))));
    o.pv=r3(local(new V3().applyMatrix4(b.pelvis.matrixWorld)));
    o.fL=r3(local(new V3().applyMatrix4(b.lh2.matrixWorld)));o.fR=r3(local(new V3().applyMatrix4(b.rh2.matrixWorld)));
    // NaN check over every bone rotation
    let nan=0;for(const k in b){const r=b[k].rotation;if(!isFinite(r.x)||!isFinite(r.y)||!isFinite(r.z))nan++}o.nan=nan;
    return o}
  function park(){const P0=pl.position.clone(),par=pl.parent,ry=pl.rotation.y;par&&par.remove(pl);sc.add(pl);pl.position.set(0,0,0);pl.rotation.y=0;
    return ()=>{sc.remove(pl);par&&par.add(pl);pl.position.copy(P0);pl.rotation.y=ry}}
  // play basic attack #step of weapon wt. frames: k values to render (sheet row). Returns the per-frame record.
  // opts: {views:[[dir,label],...], cx, row, settle}
  function play(wt,step,ks,opt){
    setup();opt=opt||{};const unpark=park();const out={wt,step,rec:[],hitF:-1,ms:0,errs:[]};
    try{
      equip(wt);HA.cur=null;HA.snap=null;HA.sb=0;atkCd=0;pl.sw=0;hero.chan=0;HA.buf=0;
      let now=1e6+Math.random()*1000;pl._at=now;pl._ga=null;if(pl._idl)pl._idl=null;
      // settle into idle (and optionally the previous combo step's end pose)
      for(let i=0;i<30;i++){now+=16;animHero(now,false,pl);pl.rotation.y=0}
      if(opt.prev!=null){combo=opt.prev;comboT=performance.now();atkCd=0;swing();pl.rotation.y=0;const A0=HA.cur;let n=0;while(HA.cur===A0&&A0&&n++<200){now+=16;animHero(now,false,pl);pl.rotation.y=0}}
      combo=step;comboT=performance.now();atkCd=0;HA.buf=0;
      let hit=-1;const t0=now;swing();pl.rotation.y=0;const A=HA.cur;if(!A){out.errs.push('no action');return out}
      out.ms=A.ms;out.hitAt=A.hitAt;const oh=A.onHit;A.onHit=function(){hit=out.rec.length;return oh&&oh.apply(this,arguments)};
      const tg=trail.geometry.attributes.position;trailN=0;trail.geometry.setDrawRange(0,0);
      let ki=0;const cv=opt.cx;
      const DT=opt.dt||16;for(let f=0;f<2000;f++){
        now+=DT;animHero(now,false,pl);pl.rotation.y=0;const s=sample();s.k=+A.k.toFixed(4);s.f=f;out.rec.push(s);
        const tp=s.tips[0];if(tp&&trailN<400&&(DT>=16||f%2==0)){tg.setXYZ(trailN++,tp.p[0],tp.p[1],tp.p[2]);tg.needsUpdate=true;trail.geometry.setDrawRange(0,trailN)}
        while(cv&&ki<ks.length&&A.k>=ks[ki]-1e-6){
          (opt.views||[[[1,.15,.1],'side']]).forEach((vw,j)=>shot(cv,ki*CW,(opt.row*(opt.views||[1]).length+j)*CH,vw[0],(j==0?wt+' #'+step+' ':'')+vw[1]+' '+ks[ki].toFixed(2)+(Math.abs(ks[ki]-A.hitAt)<.005?' HIT':''),{col:Math.abs(ks[ki]-A.hitAt)<.005?'#ff8':'#fff'}));
          ki++}
        if(HA.cur!==A)break}
      out.hitF=hit;if(A.end)try{A.end()}catch(e){}
    }catch(e){out.errs.push(String(e)+' '+(e.stack||'').slice(0,400))}
    finally{HA.cur=null;HA.snap=null;HA.sb=0;atkCd=0;pl.sw=0;trail.geometry.setDrawRange(0,0);unpark()}
    return out}
  function canvas(cols,rows){const c=document.createElement('canvas');c.width=CW*cols;c.height=CH*rows;const cx=c.getContext('2d');cx.fillStyle='#333';cx.fillRect(0,0,c.width,c.height);return {c,cx}}
  return {setup,size,play,canvas,equip,sample,park,shot,get CW(){return CW},get CH(){return CH},get sc(){return sc},get trail(){return trail},tipOf,weapons,r3}})();
// ---- bow hold sheet: hero idle (front/side/3-4), walk, combat stance, riding, bag/preview models, archer foes ----
// returns {sheet, chk:{case:{riser,hand,strM,up,dz(chest→string), inBody}}}
V100T.bowSheet=function(builds){
  const T=V100T;T.setup();const V3=THREE.Vector3,sc=T.sc,CW=T.CW,CH=T.CH;
  const cols=8,rows=2+(builds||[]).length;const C=T.canvas(cols,rows),cx=C.cx,chk={};
  const wpt=(W,v)=>new V3(...v).applyMatrix4(W.matrixWorld);
  const meas=(h,lab,root)=>{root=root||h;root.updateMatrixWorld(true);const W=(h.gearG||[]).find(o=>o.userData&&o.userData.wt=='bow'&&o.parent)||(h.bones.aL2.children.find(o=>o.userData&&o.userData.wt=='bow'));
    if(!W){chk[lab]={err:'no bow'};return}
    const b=h.bones,loc=v=>h.worldToLocal(v.clone()),hand=loc(new V3(0,-.035,.01).applyMatrix4(b.aL2.matrixWorld)),riser=loc(wpt(W,[-.555,0,0])),strM=loc(wpt(W,[-.08,0,0]));
    const tT=loc(wpt(W,[-.062,.594,0])),tB=loc(wpt(W,[-.062,-.594,0])),ax=tT.clone().sub(tB).normalize();
    // body capsule: vertical axis x=0,z=0 (chest/pelvis), radius ~ .16 → how far bow points are inside it
    let inBody=0;for(let i=0;i<=10;i++){const a=Math.PI*(.55+i*.09),p=loc(wpt(W,[Math.cos(a)*.55,Math.sin(a)*.56,0]));if(p.y>.55&&p.y<1.35){const r=Math.hypot(p.x/1.0,p.z/0.75);inBody=Math.max(inBody,.17-r)}}
    for(let i=0;i<=6;i++){const p=loc(wpt(W,[-.062+(-.08+.062)*(1-Math.abs(i-3)/3),-.594+i*.198,0]));if(p.y>.55&&p.y<1.35){const r=Math.hypot(p.x,p.z/0.75);inBody=Math.max(inBody,.17-r)}}
    // leg check: lowest limb tip vs ground
    chk[lab]={riser:T.r3(riser),hand:T.r3(hand),dGrip:+riser.distanceTo(hand).toFixed(3),dStr:+strM.distanceTo(hand).toFixed(3),up:+ax.y.toFixed(2),
      strOut:+(strM.clone().sub(riser).x).toFixed(3),tipLow:+Math.min(tT.y,tB.y).toFixed(3),inBody:+inBody.toFixed(3),nan:Object.values(b).some(x=>!isFinite(x.rotation.x+x.rotation.y+x.rotation.z))?1:0}};
  const unpark=T.park();
  try{
    T.equip('bow');HA.cur=null;HA.snap=null;HA.sb=0;pl.sw=0;hero.chan=0;let now=2e6;pl._at=now;pl._ga=null;
    const run=(n,mv,dz)=>{for(let i=0;i<n;i++){now+=16;if(dz)pl.position.z+=dz;animHero(now,mv,pl);pl.rotation.y=0}};
    IDL.combat=0;run(80,false);meas(pl,'idle');
    T.shot(cx,0,0,[0,.12,1],'bow idle front');T.shot(cx,CW,0,[1,.12,0],'idle side (L)');T.shot(cx,2*CW,0,[-1,.12,0],'idle side (R)');T.shot(cx,3*CW,0,[.75,.3,.9],'idle 3/4');T.shot(cx,4*CW,0,[-.6,.3,.9],'idle 3/4 L');
    pl._ga=null;run(25,true,.05);{const z=pl.position.z;pl.position.z=0;meas(pl,'walk');T.shot(cx,5*CW,0,[-1,.12,.2],'walk side');pl.position.z=z}
    run(9,true,.05);{const z=pl.position.z;pl.position.z=0;meas(pl,'walk2');T.shot(cx,6*CW,0,[-.6,.2,.8],'walk +150ms 3/4');pl.position.z=z}pl.position.set(0,0,0);
    IDL.combat=1;run(90,false);meas(pl,'combat');T.shot(cx,7*CW,0,[-.6,.25,.9],'combat stance');
    T.shot(cx,0,CH,[0,.15,1],'combat front');T.shot(cx,CW,CH,[-1,.12,0],'combat side');IDL.combat=null;
    // riding
    try{if(typeof MOUNTS!='undefined'){const k=Object.keys(MOUNTS)[0];mounts=[{id:990,k,n:'t',spd:60,cap:90,dist:0}];mActive=990;hero.lastHit=-1e9;enemies.forEach(e=>{e.agg=0});
      toggleMount();if(riding){sc.add(mModel);mModel.position.set(0,0,0);mModel.rotation.y=0;for(let i=0;i<90;i++){now+=16;animHero(now,false,pl);mountTick(.016,now,0);pl.rotation.y=0;mModel.position.set(0,0,0)}
        meas(pl,'ride');T.shot(cx,2*CW,CH,[-1,.2,.1],'riding L side',{cy:1.3,dist:4.5});T.shot(cx,3*CW,CH,[0,.2,1],'riding front',{cy:1.3,dist:4.5});
        for(let i=0;i<40;i++){now+=16;pl.position.z+=.08;animHero(now,true,pl);mountTick(.016,now,1);pl.rotation.y=0;mModel.position.copy(pl.position)}
        const pz=pl.position.z;pl.position.z=0;mModel.position.z=0;meas(pl,'rideMove');T.shot(cx,4*CW,CH,[-1,.2,.1],'riding moving',{cy:1.3,dist:4.5});
        sc.remove(mModel);dismount()}}}catch(e){chk.rideErr=String(e)}
    pl.position.set(0,0,0);
  }finally{unpark()}
  // previews: bag (HP) and creator preview (heroBuildPreview), co-op style other hero
  const previews=[];
  try{const r=heroBuildPreview(hero.look||{},'ranger');const h=r.userData&&r.userData.hero?r.userData.hero:r;previews.push(['creator',r,h])}catch(e){chk.pvErr=String(e)}
  previews.forEach(([lab,r,h],i)=>{sc.add(r);r.position.set(0,0,0);let t=3e6;for(let j=0;j<60;j++){t+=16;if(r.userData&&r.userData.anim)r.userData.anim(t);else animHero(t,false,h)}
    meas(h,lab,r);T.shot(cx,(5+i)*CW,CH,[-.7,.15,.8],lab+' preview');sc.remove(r)});
  // archer foes
  (builds||[]).forEach((key,ri)=>{try{const g=mkHumanoid(key);sc.add(g);const s=g.bs||1;let t=4e6;for(let j=0;j<60;j++){t+=16;g.ak=null;g.rig(t,false,3)}
    meas(g.h,key+'_idle',g);T.shot(cx,0,(2+ri)*CH,[0,.12,1],key+' idle front',{cy:.75*s,dist:3.6*s});T.shot(cx,CW,(2+ri)*CH,[-1,.12,0],'idle side',{cy:.75*s,dist:3.6*s});T.shot(cx,2*CW,(2+ri)*CH,[-.6,.3,.9],'idle 3/4',{cy:.75*s,dist:3.6*s});
    for(let j=0;j<30;j++){t+=16;g.position.z+=.05;g.rig(t,true,3)}g.position.z=0;g.updateMatrixWorld(true);meas(g.h,key+'_walk',g);T.shot(cx,3*CW,(2+ri)*CH,[-1,.12,.2],'walk',{cy:.75*s,dist:3.6*s});
    // its shot: wind-up, act, recover
    [[0,.6],[0,1],[1,.5],[2,.5]].forEach(([ph,k],j)=>{g.ak={n:'throw',ph,k};t+=16;g.rig(t,false,3);if(g.bowFx&&g.bowFx.g.visible)sc.add(g.bowFx.g);T.shot(cx,(4+j)*CW,(2+ri)*CH,[-.8,.25,.6],'shot ph'+ph+' k'+k,{cy:.85*s,dist:3.6*s});if(g.bowFx&&g.bowFx.g.parent===sc)sc.remove(g.bowFx.g)});
    g.ak=null;for(let j=0;j<40;j++){t+=16;g.rig(t,false,3)}meas(g.h,key+'_after',g);
    if(g.bowFx&&g.bowFx.g.parent)g.bowFx.g.parent.remove(g.bowFx.g);sc.remove(g)}catch(e){chk[key+'Err']=String(e)}});
  return {sheet:C.c.toDataURL('image/png'),chk}};
// ---- humanoid foe strikes: each foe through wind-up → act → recover (the real humAnim with g.ak set by hand) ----
V100T.foeSheet=function(keys,moves,cols){
  const T=V100T;T.setup();const CW=T.CW,CH=T.CH,ph=[[0,.5],[0,1],[1,.2],[1,.45],[1,.7],[1,1],[2,.6],[2,.2]];
  const C=T.canvas(ph.length,keys.length),cx=C.cx,chk={};
  keys.forEach((key,row)=>{try{const g=mkHumanoid(key);T.sc.add(g);const s=g.bs||1;let t=8e6;const mv=(moves&&moves[key])||'strike';
    for(let j=0;j<30;j++){t+=16;g.ak=null;g.rig(t,false,3)}
    const tips=[];
    ph.forEach(([p,k],j)=>{// approach each sample through a few frames so smoothing settles
      for(let q=0;q<4;q++){t+=16;g.ak={n:mv,ph:p,k};g.rig(t,false,3)}
      g.updateMatrixWorld(true);const W=g.h.bones.aR2.children.find(o=>o.userData&&o.userData.wt);if(W){const tp=T.tipOf(W).clone().applyMatrix4(W.matrixWorld);g.worldToLocal(tp);tips.push(T.r3(tp))}
      T.shot(cx,j*CW,row*CH,[.9,.25,.6],(j==0?key+' '+mv+' ':'')+'ph'+p+' k'+k,{cy:.8*s,dist:3.4*s,cz:.2*s});
      if(g.bowFx&&g.bowFx.g.parent)g.bowFx.g.parent.remove(g.bowFx.g)});
    chk[key]={mv,tips,n:g._v100n,wt:g._v100wt};g.ak=null;T.sc.remove(g)}catch(e){chk[key+'Err']=String(e)+e.stack}});
  return {sheet:C.c.toDataURL('image/png'),chk}};
