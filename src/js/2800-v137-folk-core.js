// ================= v137: animal townsfolk — core =================
// Every Duskhold townsperson is a warm-blooded animal now: keepers each have their own species and a costume of their trade
// (2820), citizens get a species and clothes picked from their name, trade and look (2830). The bodies are built with the
// v114 beast engine (the `BR` hooks scale the town-folk torso / arm / leg / foot rings; skulls, eyes, noses, jaws, toes and
// the tail hole in clothes all come from there) on the town-folk skeleton `idlNB` + tail bones (tl0…), ear bones (erL, erR)
// and cape bones (cp0…cp2, for the swing of robes), so the v93 idle, the v103 work stations, the citizens' walk and every
// held tool keep working unchanged. Heads come from one parametric skull (2805), species from 2810.
//  * npc() is re-declared here (hoisted, the towns are built before this file runs) only to remember each figure and its
//    options; when this file runs, the figures built so far are rebuilt as animals (fkRebuild).
//  * idlNpcBody(o) → the animal model (one cached geometry per species + costume + fur), marked mesh.userData.fk.
//  * fk137Anim: tails sway (more when walking), ears flick now and then; layered on idlNpc and czWalkPose103, absolute
//    from the rest pose every frame (no drift).
function npc(p,x,z,o){DKBK=DKBK||{};
  tc(p,x,z,.38);const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=o.ry||0;p.add(g);
  let rig=null;try{rig=idlNpcBody(o)}catch(e){console.error('town folk rig',e)}
  if(rig){rig.meshes.forEach(m=>g.add(m));g.bones=rig.bones}else huNpcBody(o).forEach(m=>g.add(m));
  g.userData.npcO=o;const L=npc.all||(npc.all=[]);L.push(g);if(L.length>64)L.shift();
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:txTex([{t:o.label,f:'700 30px'}],256,56,'rgba(10,14,20,.78)','#f4e9c8','rgba(255,214,120,.7)'),transparent:true,depthWrite:false}));
  sp.scale.set(1.5,.33,1);sp.position.set(0,2.05,0);g.add(sp);
  const wb=wbase(p,T_cur);
  TANIM.push({x:wb[0]+x,z:wb[1]+z,f:rig?now=>idlNpc(g,now):now=>{g.position.y=Math.sin(now/700+x)*.012;g.rotation.y=(o.ry||0)+Math.sin(now/2300+z)*.12}});
  return g}
var FK137={sp:{},out:{},err:0};
// ---------------- the skeleton of a species: town folk bones + cape + tail + ears ----------------
function fkNB(D){if(D.NBX)return D.NBX;const N=Object.assign({},idlNB());
  N.cp0=['chest',0,.95,-.13];N.cp1=['cp0',0,.68,-.2];N.cp2=['cp1',0,.42,-.24];
  const TP=D.TP||[],nb=Math.max(0,TP.length-2);D.TB=[];for(let i=0;i<nb;i++){const n='tl'+i;D.TB.push(n);N[n]=[i?'tl'+(i-1):'pelvis',TP[i][0],TP[i][1],TP[i][2]]}
  const E=fkEarBase(D);if(E){N.erR=['head',E[0],E[1],E[2]];N.erL=['head',-E[0],E[1],E[2]]}
  return D.NBX=N}
// ---------------- palette ----------------
function fkPal(fur,o){const f=mdC(fur);return Object.assign({FUR:f,FURD:mdSh(f,.62),FURL:mdMix(f,0xeae2d6,.3),BELLY:mdMix(f,0xe0d6c6,.45),PINK:0xb88a86,PINKD:0x8a6460,
  TOOTH:0xe0d8c0,CLAW:0x1e1a16,EYE:0x2a1a10,MOUTH:0x2a2220,NOSE:0x1e1818,HORN:0xb8a888,HOOF:0x2a2420},o||{})}
// ---------------- model: species + costume + fur variant ----------------
function fkHash(s){s=String(s);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
// which species and costume an npc options object gets: keepers by label (2820), citizens by o.fkSp (2830), else from the look
function fkPick(o){const K=FK137.out[o.label];if(K)return {sp:K.sp,fur:K.fur||0,out:o.label,keeper:1};
  if(o.fkSp&&FK137.sp[o.fkSp])return {sp:o.fkSp,fur:o.fkFur|0,out:o.fkOut||'cit'};
  const L=Object.keys(FK137.sp).filter(k=>FK137.sp[k].cit),h=fkHash((o.robe|0)+'|'+(o.trim|0)+'|'+(o.hat||'')+'|'+(o.hatC|0));
  return {sp:L[h%L.length],fur:(h>>>8)%3,out:'cit'}}
function fkKey(o,pk){return 'FK|'+pk.sp+'|'+pk.fur+'|'+pk.out+'|'+(o.robe|0)+'|'+(o.trim|0)+'|'+(o.hat||'')+'|'+(o.hatC|0)+'|'+(o.apron?1:0)+'|'+(o.fkV|0)}
// build the geometry: body (fur, the costume's painted layers), head, paws, toes / hooves, tail, then the costume's cloth
function fkBuild(D,pk,o){const NB=fkNB(D),bo={on:BR.on,R:BR.R,C:BR.C,feet:BR.feet,P:BR.P,mask:BR.mask,bare:BR.bare};
  const C=D.cols(pk.fur),OUT=fkOutfit(pk.out,o,D,C);
  BR.on=true;BR.R=D;BR.C=C;BR.feet=!OUT.boots;BR.mask=false;BR.bare=false;
  try{const B=mdB(NB),pb=D.body||{};
    const P=mdP({bones:NB,sex:0,build:pb.build==null?1:pb.build,wf:pb.wf||1,af:pb.af||1,lf:pb.lf||1,belly:pb.belly||0,look:{hair:C.FUR,hairStyle:5,face:0,eye:C.EYE,sex:0},
      col:{skin:C.FUR,torso:C.FUR,torsoLo:C.FUR,sleeve:C.FUR,fore:C.FUR,hand:D.handCol?D.handCol(C):C.FUR,pants:C.FUR,shin:C.FUR,neck:C.FUR,belt:null,boot:D.hoof?C.HOOF:(D.toeCol?D.toeCol(C):C.FUR),sole:mdSh(D.hoof?C.HOOF:C.FUR,.7)}});
    // bare fur: belly lighter, back darker
    P.paint.torso=m=>m.s>.45&&m.y>.5?C.BELLY:m.s<-.6&&m.y>.8?C.FURD:C.FUR;P.paint.torsoLo=m=>m.s>.5&&m.y>.47?C.BELLY:C.FUR;
    P.paint.leg=(m,s)=>m.r.part=='ankle'&&m.i>5.5&&D.hoof?mdMix(C.FUR,C.HOOF,.35):m.s>.5&&m.r.part=='thigh'?mdMix(C.FUR,C.BELLY,.35):C.FUR;
    if(D.paint)D.paint(P,C);
    if(OUT.paint)OUT.paint(P,C);
    P._T=mdTorso(P);mdBody(B,P);
    mdHead(B,P,{});
    BR_BODY++;try{fkPaws(B,P,D,C);if(D.hoof)fkHooves(B,P,D,C);else if(!OUT.boots)brToes(B,P);brTail(B);if(D.tailKit){const k=dkKit();D.tailKit(k,D,C);mdKit(B,k)}}finally{BR_BODY--}
    if(OUT.boots)OUT.boots(B,P,C);
    if(OUT.build)OUT.build(B,P,C);
    return B}
  finally{Object.assign(BR,bo)}}
function fkBody(o){const pk=fkPick(o),D=FK137.sp[pk.sp];if(!D)throw new Error('folk: no species '+pk.sp);
  const NB=fkNB(D),key=fkKey(o,pk),G=mdGeo(key,()=>fkBuild(D,pk,o)),M=mdMats();
  const mb=mkBones({bones:NB}),mesh=new THREE.SkinnedMesh(G.c,M.c);mesh.castShadow=true;mesh.add(mb.bones.pelvis);mesh.updateMatrixWorld(true);mesh.bind(new THREE.Skeleton(mb.arr));
  const sc=(FK137.out[o.label]&&FK137.out[o.label].sc)||D.sc||1;if(sc!==1){mb.bones.pelvis.position.multiplyScalar(sc);mb.bones.pelvis.scale.setScalar(sc)}
  mesh.userData.fk=D.key;mesh.userData.fkKey=key;
  const out=[mesh];['m','g'].forEach(t=>{if(!G[t])return;const m=new THREE.SkinnedMesh(G[t],M[t]);m.castShadow=t!='g';m.bind(mesh.skeleton,mesh.bindMatrix);m.userData.fk=D.key;out.push(m)});
  mb.bones.pelvis.userData.fkA={D,seed:fkHash(key+Math.random())%9973,TB:D.TB.map(n=>mb.bones[n]).filter(Boolean),er:[mb.bones.erL,mb.bones.erR].filter(Boolean)};
  return {meshes:out,bones:mb.bones,fk:D}}
// the town folk (keepers, visitors, citizens) all come through here
{const f=idlNpcBody;idlNpcBody=function(o){try{if(Object.keys(FK137.sp).length)return fkBody(o)}catch(e){if(!FK137.err++)console.error('v137 folk',e)}return f.apply(this,arguments)}}
// ---------------- animation layer: tails and ears ----------------
// walk: 0 standing (idle / work), 1 walking (czWalkPose103 phase in g.userData.fkPh)
function fk137Anim(g,now,walk){const b=g&&g.bones,A=b&&b.pelvis&&b.pelvis.userData.fkA;if(!A)return;const D=A.D,T=D.tail||{},t=now/1000+A.seed*.37,n=A.TB.length;
  if(n){const sw=(T.sway==null?.16:T.sway)*(walk?1.6:1),fr=(T.freq||1.1)*(walk?1.5:1),lag=T.lag==null?.55:T.lag,lift=T.lift||0,stiff=T.stiff||0;
    const ph=walk&&g.userData.fkPh!=null?g.userData.fkPh:t*fr*2;
    for(let i=0;i<n;i++){const bn=A.TB[i],u=(i+1)/n,k=(1-stiff*(1-u)),a=Math.sin(ph-i*lag)*sw*k*(.45+u*.7),p=Math.sin(ph*.5-i*lag*.7+1.3)*sw*.35*k;
      bn.rotation.set(-lift*(1-u)+p*(walk?.6:.3),a,a*.3)}}
  // ears: a quick flick every few seconds (one ear or both), a little swivel toward sounds
  if(A.er.length){const E=D.earAnim||{},cyc=E.cyc||4.7,u=((t+A.seed%5)/cyc)%1,fl=u<.08?Math.sin(u/.08*Math.PI):0,side=Math.floor((t+A.seed%5)/cyc)%3;
    const sv=Math.sin(t*.31+A.seed)*(E.sv==null?.12:E.sv),amp=E.amp==null?.35:E.amp;
    A.er.forEach((bn,i)=>{const s=i?1:-1,on=side==2||side==i?1:0;bn.rotation.set(-fl*amp*on*.6,s*sv,s*fl*amp*on)})}}
{const f=idlNpc;idlNpc=function(g,now){const r=f.apply(this,arguments);try{if(g&&g.bones&&g.visible)fk137Anim(g,now,0)}catch(e){}return r}}
{const f=czWalkPose103;czWalkPose103=function(g,ph,amp){const r=f.apply(this,arguments);try{if(g&&g.bones){g.userData.fkPh=ph;fk137Anim(g,performance.now(),1)}}catch(e){}return r}}
// ---------------- figures built before this file: rebuild them as animals ----------------
function fkRebuild(g){if(!g||!g.userData||!g.userData.npcO||!g.bones)return false;const o=g.userData.npcO;let rig;try{rig=idlNpcBody(o)}catch(e){console.warn('v137 rebuild',e);return false}
  if(!rig.fk)return false;g.children.filter(m=>m.isSkinnedMesh).forEach(m=>g.remove(m));rig.meshes.forEach(m=>g.add(m));g.bones=rig.bones;g._idl=null;
  if(g._wk)g._wk.rest=czRest103(g);g.userData.rest=czRest103(g);return true}
function fkRebuildAll(){let n=0;(npc.all||[]).forEach(g=>{const m=g.children.find(c=>c.isSkinnedMesh);if(m&&!m.userData.fk&&fkRebuild(g))n++});return n}
