// ================= v208: Kindlelight's arrival cinematic =================
// Owner (Nov 9 2026): "Add a cinematic for when you first enter kindlelight. The voice from the intro will be the same voice
// talking to you in this one … While this dialogue is going showcase the 3 different instances here - some enemies, quest
// objectives and then a menacing preview of Argus as the line about him is said."
// The first time a hero arrives in Kindlelight (any of its field instances) the game pauses and the camera tours the zone in
// the real world (every instance is part of the one world map, so the camera only has to fly there):
//   1. Kindlelight I  — the dark Lantern Road: its unlit lampposts, a pack of I's creatures crossing ahead (The Lantern Road)
//   2. Kindlelight II — the Glowmire Warren camp and its brood (The Glowmire Crystal)
//   3. Kindlelight III — a rune sigil in the Rotwood, lichen shamblers drifting past (The Three Sigils)
//   4. the Den — a slow creep through the fog toward Argus; his eyes open one by one, he lifts his head and howls
//   5. back on the hero, the camera swings in behind him and the game begins.
// The voice is the intro's voice: the same drifting, glitching subtitle lettering (IM Fell English SC) over the same low drone
// and far choir. Every frame is a pure function of the time t (kc208Seek), so tests render it frame by frame
// (test/v208_kindlelight.py). The creatures are stand-ins (models only, no AI) made for the shots and removed afterwards; the
// real creatures, Argus and the quest scenery are only posed and put back as they were.
// Local only: each player sees it on their own first arrival (co-op partners see the hero standing at the entrance meanwhile).
// Skip: the Skip button, Esc, Enter or Space. Not played under test automation unless window.KQ_KC208; SET.intro 0 turns it off.
var KC208={on:false,run:false,seen:0,S:null,live:null,len:37.6,lbA:36.0,lbB:37.4,
  lines:[{a:1.4,b:4.7,s:'Kindlelight is a cursed place.'},
    {a:8.0,b:11.8,s:'Rot and wrath manifested…'},
    {a:14.9,b:18.9,s:'…through caustic rivers and decaying flora.'},
    {a:22.2,b:25.9,s:'The Thousand-eyed wolf sulks in the shadows,'},
    {a:26.3,b:30.0,s:'stalking and preying upon all who enter.'},
    {a:31.8,b:35.7,s:'Find his den, slay him and bring me his essence.'}],
  // the shots (start, end)
  sh:[[0,7.4],[7.4,14.4],[14.4,21.4],[21.4,31.0],[31.0,37.6]],
  // name cards: [from, to, small line, name, line under it]
  cards:[[3.2,6.9,'Main Quest · Kindlelight I','The Lantern Road','Relight the lampposts with glowbulbs from the creatures you slay'],
    [10.2,14.0,'Main Quest · Kindlelight II','The Glowmire Crystal','Clear the Glowmire Warren — something seeps beneath it'],
    [17.2,21.0,'Main Quest · Kindlelight III','The Three Sigils','Attune the rune sigils to unseal the way to the den']]};
function kc208Want(){if(window.KQ_KC208)return true;if(window.AW_NOTITLE||navigator.webdriver)return false;try{if(typeof SET!='undefined'&&SET.intro===0)return false}catch(_){}return true}
// heroes who already know Kindlelight never see it (saves from before v208): a reached instance past I, the Lantern Road met,
// the outpost seen, Argus beaten
function kc208Known(){try{return insReach(0)>0||bossDone.has(0)||MQ143.st>0||!!MQ143.seen}catch(_){return false}}
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.kc208=KC208.seen?1:0}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{KC208.seen=s&&s.kc208?1:0;if(!KC208.seen&&kc208Known())KC208.seen=1}catch(_){}return r}}

// ---------------- the plan: where everything stands (from the map data) ----------------
function kc208Plan(){if(KC208.P)return KC208.P;const P={},I=INSL,A=a=>({x:a[0],z:a[1]});
  // I: from the entrance down the lantern line
  const R1=mq143Plan(),L=R1.lamps,E=I[0].en;P.en={x:E[0],z:E[1]};P.lamps=L.slice(0,7).map(o=>({x:o.x,z:o.z}));P.out={x:R1.center[0],z:R1.center[1]};
  {const a=L[1],b=L[5],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz)||1;P.road={x:dx/d,z:dz/d}}
  // II: the Glowmire Warren (the camp the hatch opens in); III: the first rune sigil; the Den: Argus
  {const C=mq144Camp();P.warren=C?{x:C.x,z:C.z}:A(I[1].ba)}
  {const s=mq145Plan().sig[0];P.sigil=s?{x:s.x,z:s.z,ry:s.ry||0}:A(I[2].ba)}
  P.den={x:BOSSES[0].x,z:BOSSES[0].y};P.denEn=A(I[3].en);
  KC208.P=P;return P}
// the stand-in creatures of each shot: kind, level, where (x,z offsets from the shot's anchor), walk direction and speed
function kc208Cast(P){const r=P.road,s={x:r.z,z:-r.x},on=(o,f,x)=>({x:o.x+r.x*f+s.x*x,z:o.z+r.z*f+s.z*x});
  const at=(o,dx,dz)=>({x:o.x+dx,z:o.z+dz});
  return [
    // I: a pack crossing the road two lamps ahead
    {sh:0,k:'goo',lv:2,p:on(P.lamps[0],4.0,-6.0),d:[s.x,s.z],v:1.35,t0:3.0},
    {sh:0,k:'spitter',lv:3,p:on(P.lamps[0],2.0,-8.0),d:[s.x,s.z],v:1.35,t0:3.0},
    {sh:0,k:'maggot',lv:2,p:on(P.lamps[0],6.2,-9.0),d:[s.x,s.z],v:1.35,t0:3.0},
    // II: the Warren's brood, prowling round its fire
    {sh:1,k:'amalgam',lv:5,p:at(P.warren,-3.2,1.6),d:[.8,-.6],v:.55,t0:7.6},
    {sh:1,k:'akidon',lv:4,p:at(P.warren,2.6,-2.4),d:[-.7,-.7],v:.7,t0:7.6},
    {sh:1,k:'akidon',lv:5,p:at(P.warren,4.6,2.8),d:[-.9,.4],v:.6,t0:7.6},
    // III: lichen shamblers drifting past the sigil
    {sh:2,k:'lichen',lv:7,p:at(P.sigil,-7.5,4.5),d:[.85,-.5],v:.5,t0:14.6},
    {sh:2,k:'lichen',lv:6,p:at(P.sigil,-9.5,1.5),d:[.9,-.3],v:.5,t0:14.6},
    {sh:2,k:'akorror',lv:7,p:at(P.sigil,6.5,-6.5),d:[-.5,.85],v:.6,t0:14.6}]}

// ---------------- set-up ----------------
function kc208Build(){const S={P:kc208Plan(),cast:[],lt:null,sv:{}};
  try{if(typeof mq143Build=='function'&&!MQ143.S)mq143Build()}catch(e){console.warn('kc208 lantern road',e)}
  try{if(typeof mq145Build=='function'&&!MQ145.S)mq145Build()}catch(e){console.warn('kc208 sigils',e)}
  kc208Cast(S.P).forEach(c=>{try{const C=enemyC(c.k,c.lv,{});if(!C)return;const m=cr(C);if(!m)return;m.userData.psNo=1;m.userData.noFarCull=1;m.visible=false;
      m.traverse(o=>{if(o.isMesh)o.frustumCulled=false});scene.add(m);S.cast.push(Object.assign({m},c))}catch(e){console.warn('kc208 cast',c.k,e)}});
  // a cold light that follows the camera's subject (Kindlelight is dark; the hero's lantern stays with the hero)
  S.lt=new THREE.PointLight(0xb8d0ff,0,26,1.5);scene.add(S.lt);S.lt2=new THREE.PointLight(0x7a9ab8,0,30,1.5);scene.add(S.lt2);
  S.boss=enemies.find(e=>e.boss&&e.bi===0&&e.sv)||null;
  if(S.boss){const e=S.boss,Q=e.sv;S.sv={ph:Q.ph,eyeF:Q.eyeF,ry:e.m.rotation.y,vis:e.m.visible,hb:e.hb&&e.hb.visible,trk:Q.trk,tt:Q.tt,aw:Q.aw}}
  return S}

// ---------------- the cameras ----------------
function kc208Cam(S,t){const V=THREE.Vector3,K=ic151K,Sm=ic151Sm,Io=ic151Io,P=S.P,G=(x,z,y)=>new V(x,GH(x,z)+(y||0),z),T=KC208.sh;let p,l,fov=48,F,sh=0,hero=false;
  if(t<T[0][1]){// I: over the Lantern Wardens' outpost (the Portal Ripper, the captain), drifting on to the dark lantern line
    const k=Io(K(t,0,T[0][1])),q=Sm(K(t,2.4,6.6)),r=P.road,s={x:r.z,z:-r.x},o=P.out;
    p=G(o.x+r.x*(-11+13*k)+s.x*(9-3*k),o.z+r.z*(-11+13*k)+s.z*(9-3*k),6.2-2.6*k);
    const L0=P.lamps[0];l=G(o.x,o.z,1.3).lerp(G(L0.x+r.x*5,L0.z+r.z*5,.8),q);F=G(o.x,o.z).lerp(G(L0.x+r.x*4,L0.z+r.z*4),q);fov=50}
  else if(t<T[1][1]){sh=1;// II: a slow arc round the Glowmire Warren, closing in
    const k=Sm(K(t,T[1][0],T[1][1])),c=P.warren,a=2.3-.9*k,R=15-4*k;p=G(c.x+Math.sin(a)*R,c.z+Math.cos(a)*R,5.2-1.6*k);l=G(c.x,c.z,1.0);F=G(c.x,c.z);fov=46}
  else if(t<T[2][1]){sh=2;// III: low between the standing stones, rising as the glyph turns
    const k=Io(K(t,T[2][0],T[2][1])),c=P.sigil,a=c.ry+.6+.7*k,R=11.5-2.5*k;p=G(c.x+Math.sin(a)*R,c.z+Math.cos(a)*R,1.0+3.4*k);l=G(c.x,c.z,1.6+.6*k);F=G(c.x,c.z);fov=48}
  else if(t<T[3][1]){sh=3;// the Den: creeping through the fog toward him, then pushed in as he howls
    const m=S.boss?S.boss.m.position:G(P.den.x,P.den.z),f0=Math.atan2(P.denEn.x-m.x,P.denEn.z-m.z);
    const k=Sm(K(t,T[3][0],28.6)),q=Io(K(t,28.7,30.4)),R=21-10.5*k+3.5*q,a=f0+.25+.5*k,hd=S.head||G(m.x,m.z,2);
    p=G(m.x+Math.sin(a)*R,m.z+Math.cos(a)*R,1.5+.9*k+.9*q);l=new V(m.x,0,m.z).lerp(hd,.75-.25*q);l.y=hd.y+.4-1.4*q;F=G(m.x,m.z);fov=46+4*q}
  else{sh=4;hero=true;// back on the hero: in front of him, then round behind him to the game camera
    const H=pl.position,yaw=pl.rotation.y,fw=new V(Math.sin(yaw),0,Math.cos(yaw)),sd=new V(fw.z,0,-fw.x),k=Io(K(t,T[4][0]+.3,KC208.lbB));
    const p0=H.clone().addScaledVector(fw,3.3).addScaledVector(sd,-1.1).add(new V(0,1.0,0)),l0=H.clone().add(new V(0,1.15,0));
    const cy=yaw+Math.PI,cp=typeof camPitch!='undefined'?camPitch:.3,cd=typeof camDist!='undefined'?camDist:9.5,p1=new V(H.x+Math.sin(cy)*Math.cos(cp)*cd,H.y+1.1+Math.sin(cp)*cd,H.z+Math.cos(cy)*Math.cos(cp)*cd),l1=H.clone().add(new V(0,1,0));
    // swing round the hero's left side (an arc, not a straight line through him)
    const a0=Math.atan2(p0.x-H.x,p0.z-H.z),a1=Math.atan2(p1.x-H.x,p1.z-H.z);let da=a1-a0;da=Math.atan2(Math.sin(da),Math.cos(da));if(da>0)da-=Math.PI*2;
    const r0=Math.hypot(p0.x-H.x,p0.z-H.z),r1=Math.hypot(p1.x-H.x,p1.z-H.z),a=a0+da*k,rr=r0+(r1-r0)*k;
    p=new V(H.x+Math.sin(a)*rr,p0.y+(p1.y-p0.y)*k,H.z+Math.cos(a)*rr);l=l0.lerp(l1,k);F=H.clone();fov=46+(58-46)*k}
  if(sh===3){const a=.22*Sm(K(t,28.95,29.15))*(1-Sm(K(t,29.4,30.6)));p.x+=Math.sin(t*61)*a;p.y+=Math.sin(t*53+1)*a*.7;l.x+=Math.sin(t*47+2)*a*.5}
  p.y=Math.max(p.y,GH(p.x,p.z)+.6);return {p,l,fov,F,sh,hero}}
function kc208Shot(t){const T=KC208.sh;for(let i=0;i<T.length;i++)if(t<T[i][1])return i;return T.length-1}

// ---------------- each frame ----------------
function kc208Frame(S,t){const now=3e6+t*1000,dt=Math.max(0,Math.min(.1,S.lt0==null?0:t-S.lt0)),K=ic151K,Sm=ic151Sm,sh=kc208Shot(t);const cut=S.sh0!==sh;S.lt0=t;
  // Argus first: the den's camera looks at his head
  kc208Argus(S,t,now,dt,sh===3);
  const c=kc208Cam(S,t);S.sh0=c.sh;
  // the hero waits at the entrance, idling; while the camera is elsewhere he is hidden and the game's "hero" point is the shot's
  // subject (chunks, the instance clip, zone light, the see-through rules and culling all key on it)
  if(c.hero){pl.position.copy(S.home);pl.visible=true}else{pl.position.copy(c.F);pl.visible=false}
  try{pl.position.y=GH(pl.position.x,pl.position.z);animHero(now,false)}catch(_){}
  // stand-ins: only in their own shot; they walk (pure function of t)
  S.cast.forEach(C=>{const on=C.sh===c.sh;C.m.visible=on;if(!on)return;const u=Math.max(0,t-C.t0),x=C.p.x+C.d[0]*C.v*u,z=C.p.z+C.d[1]*C.v*u;
    C.m.position.set(x,GH(x,z),z);C.m.rotation.y=Math.atan2(C.d[0],C.d[1]);try{animC(C.m,now,true,C.v)}catch(_){}});
  // the quest scenery of the other instances shows while the camera is there
  try{if(MQ145.S){const on=c.sh===2;MQ145.S.sig.forEach((M,i)=>{M.g.visible=on||(S.sig0&&S.sig0[i]);if(on&&i===0){M.gly.position.y=2.1+.12*Math.sin(t*1.4);M.gly.rotation.y=t*.8;M.halo.rotation.z=t*.4}});
    MQ145.S.lights.forEach((l,i)=>{l.intensity=on&&i===0?1.4:0})}}catch(_){}
  try{if(MQ143.S)MQ143.S.root.visible=c.sh===0||c.sh===4}catch(_){}
  cam.position.copy(c.p);cam.up.set(0,1,0);cam.lookAt(c.l);cam.fov=c.fov;cam.updateProjectionMatrix();if(typeof look!='undefined')look.copy(c.l);
  if(c.hero)try{compTick(dt,now)}catch(_){}
  // the world around the subject: chunks, instance clip, zone light (settled at once on a cut)
  const F=c.F;try{chunkVis();if(cut||S.fresh){for(let i=0;i<3;i++)atmos(1,now)}else atmos(dt,now)}catch(e){if(!S.ae){S.ae=1;console.warn('kc208 atmos',e)}}
  // the hero's floating lantern stays with the hero: hidden elsewhere, settled beside him again on the cut back
  try{if(typeof FLAN!='undefined'&&FLAN.root){if(!c.hero)FLAN.root.visible=false;else if((cut||S.fresh)&&FLAN.root.visible){for(let i=0;i<80;i++)flanStep(FLAN,pl,flanLift(),.05,now);torch.position.copy(FLAN.pos)}}}catch(_){}
  S.fresh=false;if(c.sh===3)try{scene.fog.density=Math.min(scene.fog.density,.03)}catch(_){}
  try{if(c.hero){torch.position.set(pl.position.x,pl.position.y+2.2,pl.position.z+.3)}else{torch.position.set(F.x,F.y+2.4,F.z);torch.intensity*=.55}pln.constant=-pl.position.y}catch(_){}
  // the subject's light: none on the hero (his lantern), a cold glow elsewhere, a dim amber pool on Argus
  {const L=S.lt,L2=S.lt2,e=S.boss;if(c.sh===3){const ek=Sm(K(t,22.8,27.6)),hk=Sm(K(t,28.8,29.4));L.color.setHex(0xd89a40);L.intensity=.5+1.6*ek+1.6*hk;L.distance=22;L.position.set(F.x+(c.p.x-F.x)*.3,F.y+1.2,F.z+(c.p.z-F.z)*.3);
      L2.color.setHex(0x7a9ab8);L2.intensity=1.8;L2.distance=34;L2.position.set(F.x-(c.p.x-F.x)*.5,F.y+12,F.z-(c.p.z-F.z)*.5)}
    else if(c.hero){L.intensity=0;L2.intensity=0}else{L2.intensity=0;L.color.setHex(0xb8d0ff);L.intensity=c.sh===0?1.8:1.6;L.distance=30;L.position.set(F.x+(c.p.x-F.x)*.4,F.y+6,F.z+(c.p.z-F.z)*.4)}}
  WIND.t.value=now/1000;FADE.cam.value.copy(cam.position);if(c.hero)FADE.pl.value.set(pl.position.x,pl.position.y+1.1,pl.position.z);else FADE.pl.value.copy(cam.position);
  try{fxStep(dt)}catch(_){}
  kc208Dom(S,t,c);try{if(!KC208.noDraw)POST.render()}finally{pl.position.copy(S.home)}}   // between frames the hero is home again (timers, co-op, the roster read it)
// Argus: deep in the fog, eyes shut; they open in a wave over his body as the voice speaks of him, then he lifts his head and howls
var KC208A=[[22.4,'low','io'],[27.8,'low','l',.006],[28.9,'howl','o'],[30.4,'howl','l',.02],[31.0,'howl','l']];
function kc208Argus(S,t,now,dt,on){const e=S.boss;if(!e||!e.sv)return;const Q=e.sv,R=Q.R,m=e.m;m.visible=on;if(e.hb)e.hb.visible=false;if(!on)return;const K=ic151K,Sm=ic151Sm;
  // he faces the way in (where the camera creeps from)
  const P=S.P;m.rotation.y=Math.atan2(P.denEn.x-m.position.x,P.denEn.z-m.position.z);
  Q.ph=1;Q.eyeF=1.4*Sm(K(t,28.8,29.3))*(1-Sm(K(t,30.2,31)));Q.trk=KC208A;Q.tt=t;Q.aw=1;
  // the pose: the base layer (breathing), then this track (svApply only blends a track during a move; this does it always)
  const B=Q.B,O=Q.O;for(const k in O){const o=O[k];o[0]=o[1]=o[2]=o[3]=o[4]=o[5]=0}
  try{B.loco&&B.loco(e,Q,O,dt,now)}catch(_){}
  if(t>=KC208A[0][0]-.01){const Pz=svSample(B,{snap:{}},KC208A,t,Q.P,now),w=Sm(K(t,21.4,22.6));for(const k in Pz){const p=Pz[k],o=O[k];if(!p||!o)continue;for(let q=0;q<6;q++)o[q]+=(p[q]-o[q])*w}}
  for(const k in O){const g=R.J[k],o=O[k],r0=g.userData.r0,p0=g.userData.p0;g.rotation.set(r0.x+o[0],r0.y+o[1],r0.z+o[2]);g.position.set(p0.x+o[3],p0.y+o[4],p0.z+o[5])}
  try{B.post&&B.post(e,Q,0,now)}catch(_){}
  // the eyes: shut until the voice names him, then open one by one (a wave from the tail to the head), the brow eye last
  Q.bigC=.45*Sm(K(t,28.9,29.3))*(1-Sm(K(t,30.3,31)));try{R.bigSpr.scale.setScalar(.05+Q.bigC*2.2)}catch(_){}
  try{const ek=Sm(K(t,22.9,27.3));R.iris.color.setHex(0x3a2a08).lerp(new THREE.Color(ARG.col),ek).lerp(new THREE.Color(0xffffff),Math.min(.7,Q.eyeF*.5))}catch(_){}
  try{m.updateMatrixWorld(true);S.head=(S.head||new THREE.Vector3());R.J.head.getWorldPosition(S.head)}catch(_){}
  if(R.eyes){const n=R.eyes.length;
    // a soft glow on each eye, only for the cinematic, so they read as points of light in the dark before his body does
    if(!S.eg){S.eg=R.eyes.map(E=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:SPR,color:0xffc040,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
      sp.position.copy(E.ir.position);sp.userData.psNo=1;sp.renderOrder=4;E.ir.parent.add(sp);return sp})}
    R.eyes.forEach((E,i)=>{const o=Sm(K(t,22.9+i/n*4.4,23.4+i/n*4.4)),bl=(t*1.3+E.b)%3.1<.12?.25:1,k=Math.max(.04,o*bl*(1+Q.eyeF*.3));E.ir.scale.y=E.s*.62*k;E.ir.scale.x=E.s*.82*(.35+.65*o)*(1+Q.eyeF*.3);
      const g=S.eg[i];g.material.opacity=Math.min(1,o*bl*(.6+.2*Math.sin(t*3+i))*(1+Q.eyeF*.4));g.scale.setScalar(E.s*(1.7+1.0*Q.eyeF))})}}

// ---------------- the overlay: letterbox, the voice's subtitles, quest cards, fades, skip ----------------
function kc208Css(){if(document.getElementById('kc208css'))return;const s=document.createElement('style');s.id='kc208css';s.textContent=
  '#kc208{position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden;cursor:none}'+
  '#kc208 .lb{position:absolute;left:0;right:0;height:11vh;background:#000;z-index:3}#kc208 .lb.t{top:0}#kc208 .lb.b{bottom:0}'+
  '#kc208 .fk{position:absolute;inset:0;background:#000;z-index:4;opacity:1}'+
  '#kc208 .sub{position:absolute;left:6%;right:6%;bottom:17vh;text-align:center;z-index:5;font-family:"IM Fell English SC","Cinzel Decorative",Georgia,serif;font-size:clamp(20px,3.2vw,44px);letter-spacing:.06em;color:#fff;line-height:1.2}'+
  '#kc208 .sub span{display:inline-block;white-space:pre;text-shadow:0 0 3px rgba(10,16,50,.95),0 0 14px rgba(14,24,70,.85),-2px 0 rgba(90,200,255,.6),2px 0 rgba(255,120,220,.5)}'+
  '#kc208 .nc{position:absolute;left:5vw;top:calc(11vh + 4vh);z-index:5;opacity:0;font-family:"Cinzel",Georgia,serif;color:#f6e7c4;text-shadow:0 2px 8px #000,0 0 18px rgba(0,0,0,.8);max-width:46vw}'+
  '#kc208 .nc s{display:block;text-decoration:none;font:600 clamp(10px,1vw,13px)/1.2 "Cinzel",Georgia,serif;letter-spacing:.22em;text-transform:uppercase;color:#cfe89a;margin-bottom:5px}'+
  '#kc208 .nc b{display:block;font:700 clamp(18px,2.4vw,30px)/1.1 "Cinzel",Georgia,serif;letter-spacing:.06em}#kc208 .nc i{display:block;margin-top:4px;font:italic clamp(13px,1.4vw,18px)/1.25 Georgia,serif;color:#e8dcc4}'+
  '#kc208 .nc:before{content:"";display:block;width:52px;height:2px;margin-bottom:8px;background:linear-gradient(90deg,#b8ff7a,transparent)}'+
  '#kc208 .bt{position:absolute;left:0;right:0;top:calc(11vh + 3vh);text-align:center;z-index:5;opacity:0;color:#ffd890;text-shadow:0 0 12px rgba(255,170,40,.75),0 0 40px rgba(120,40,0,.8),0 2px 6px #000}'+
  '#kc208 .bt b{display:block;font:700 clamp(30px,5.2vw,74px)/1 "Cinzel Decorative","Cinzel",Georgia,serif;letter-spacing:.16em}#kc208 .bt i{display:block;margin-top:10px;font:italic clamp(13px,1.5vw,20px)/1.2 Georgia,serif;letter-spacing:.12em;color:#e8c890}'+
  '#kc208 .skip{position:absolute;right:22px;bottom:calc(11vh + 14px);z-index:6;pointer-events:auto;cursor:pointer;background:rgba(10,8,16,.45);color:#e8e0d0;border:1px solid rgba(232,224,208,.35);border-radius:4px;font:600 13px/1 "Cinzel Decorative",Georgia,serif;letter-spacing:.08em;padding:8px 14px;opacity:.7}'+
  '#kc208 .skip:hover{opacity:1;background:rgba(30,24,40,.7)}';document.head.appendChild(s)}
function kc208Layer(S){kc208Css();const el=document.createElement('div');el.id='kc208';
  el.innerHTML='<div class="lb t"></div><div class="lb b"></div><div class="sub"></div><div class="nc"><s></s><b></b><i></i></div><div class="bt"><b></b><i></i></div><div class="fk"></div><button class="skip">Skip ›</button>';
  document.body.appendChild(el);S.dom={el,lt:el.querySelector('.lb.t'),lb:el.querySelector('.lb.b'),sub:el.querySelector('.sub'),nc:el.querySelector('.nc'),bt:el.querySelector('.bt'),fk:el.querySelector('.fk'),skip:el.querySelector('.skip'),cur:null,sp:[]};
  try{const b=BOSSES[0];S.dom.bt.querySelector('b').textContent=String(b.name).split(',')[0].toUpperCase();S.dom.bt.querySelector('i').textContent=b.title||''}catch(_){}}
function kc208Dom(S,t,c){const D=S.dom;if(!D)return;const K=ic151K,Sm=ic151Sm,T=KC208.sh;
  const lb=(11*(1-Sm(K(t,KC208.lbA,KC208.lbB))))+'vh';D.lt.style.height=lb;D.lb.style.height=lb;
  // black: out of the portal's fade, a short dip at each cut, a longer one into the den and out of it
  let fk=1-K(t,.2,1.6);for(let i=1;i<T.length;i++){const a=T[i][0],w=i===3||i===4?.55:.28;fk=Math.max(fk,K(t,a-w,a)*(1-K(t,a,a+w*1.4)))}
  if(KC208.skipT!=null)fk=Math.max(fk,1-K(t,KC208.skipT,KC208.skipT+.7));
  D.fk.style.opacity=fk.toFixed(3);
  // the voice: letters drift in out of a blur, the line breathes and glitches like a voice through deep water (the intro's)
  const L=KC208.lines.find(x=>t>=x.a-.1&&t<x.b+.6);if(L!==D.cur){D.cur=L;D.sub.innerHTML='';D.sp=[];if(L){L.s.split(/( )/).forEach(w=>{if(!w)return;let box=D.sub;if(w!==' '){box=document.createElement('span');box.className='w';D.sub.appendChild(box)}for(const ch of w){const e=document.createElement('span');e.textContent=ch;box.appendChild(e);D.sp.push(e)}})}}
  if(L){const out=K(t,L.b,L.b+.6);D.sp.forEach((e,i)=>{const k=K(t,L.a+i*.045,L.a+i*.045+.55),fr=Math.floor(t*14),gl=ic151H(fr*1.7+i*3.1)>.93?1:0,jx=(ic151H(fr+i*.7)-.5)*2.4*(1+gl*3),jy=(ic151H(fr*1.3+i)-.5)*1.6;
    e.style.opacity=(k*(1-out)*(.85+.15*Math.sin(t*7+i))).toFixed(3);e.style.filter='blur('+((1-k)*7+out*6+gl*1.5).toFixed(2)+'px)';e.style.transform='translate('+jx.toFixed(2)+'px,'+(jy+(1-k)*8).toFixed(2)+'px) scale('+(1+(1-k)*.25).toFixed(3)+')'})}
  // the quest cards
  let ck=0,cc=null;KC208.cards.forEach(q=>{const k=Sm(K(t,q[0],q[0]+.6))*(1-Sm(K(t,q[1]-.6,q[1])));if(k>ck){ck=k;cc=q}});
  if(cc&&D.nc.dataset.n!==cc[3]){D.nc.dataset.n=cc[3];D.nc.querySelector('s').textContent=cc[2];D.nc.querySelector('b').textContent=cc[3];D.nc.querySelector('i').textContent=cc[4]}
  D.nc.style.opacity=ck.toFixed(3);D.nc.style.transform='translateX('+((1-ck)*-14).toFixed(1)+'px)';
  // his name, as he howls
  const bk=Sm(K(t,29.0,29.5))*(1-Sm(K(t,30.4,30.95)));D.bt.style.opacity=bk.toFixed(3);D.bt.style.transform='scale('+(1.06-.06*Sm(K(t,29,30.9))).toFixed(3)+')';
  D.bt.style.filter='blur('+((1-Sm(K(t,29.0,29.4)))*6).toFixed(2)+'px)'}

// ---------------- sound: the voice's drone and choir, a toll for each reach, the den, the resolve ----------------
function kc208Score(ac,out,T0){const T=x=>T0+x,G=v=>{const g=ac.createGain();g.gain.value=v||0;return g};
  const NB=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  const rv=ac.createConvolver(),IR=ac.createBuffer(2,ac.sampleRate*3.4,ac.sampleRate);for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.4)}rv.buffer=IR;const wet=G(.5);rv.connect(wet);wet.connect(out);
  const route=(n,o)=>{const d=G(o.dry==null?1:o.dry);n.connect(d);d.connect(out);if(o.wet){const w=G(o.wet);n.connect(w);w.connect(rv)}};
  const env=(g,a,dur,pk,at,rel)=>{g.gain.setValueAtTime(0,T(a));g.gain.linearRampToValueAtTime(pk,T(a+at));g.gain.setValueAtTime(pk,T(a+Math.max(at,dur-rel)));g.gain.linearRampToValueAtTime(0,T(a+dur))};
  const osc=(type,f,a,dur,pk,at,rel,o)=>{if(T(a+dur)<ac.currentTime-.01)return;o=o||{};const s=ac.createOscillator();s.type=type;s.frequency.setValueAtTime(f,T(a));if(o.f2)s.frequency.exponentialRampToValueAtTime(o.f2,T(a+(o.ft||dur)));if(o.det)s.detune.value=o.det;
    const g=G(0);env(g,a,dur,pk,at,rel);let n=g;s.connect(g);if(o.lp){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(o.lp,T(a));if(o.lp2)fl.frequency.linearRampToValueAtTime(o.lp2,T(a+dur));g.connect(fl);n=fl}route(n,o);s.start(T(a));s.stop(T(a+dur+.05))};
  const noise=(a,dur,pk,at,rel,ft,f,q,o)=>{if(T(a+dur)<ac.currentTime-.01)return;o=o||{};const s=ac.createBufferSource();s.buffer=NB;s.loop=true;const fl=ac.createBiquadFilter();fl.type=ft;fl.frequency.setValueAtTime(f,T(a));if(o.f2)fl.frequency.exponentialRampToValueAtTime(o.f2,T(a+dur));fl.Q.value=q||1;
    const g=G(0);env(g,a,dur,pk,at,rel);s.connect(fl);fl.connect(g);route(g,o);s.start(T(a),Math.random());s.stop(T(a+dur+.05))};
  // the bog: wind and a low wet murmur under everything
  noise(0,37.5,.035,2,3,'bandpass',420,.6,{wet:.4});noise(0,37.5,.05,2,3,'lowpass',120,.8,{wet:.2});
  // the voice: the intro's low drone and far choir (D minor), under every line
  [73.42,110,146.83].forEach((f,i)=>osc('sawtooth',f,.6,36.4,.03-i*.006,4,4,{lp:320,wet:.5,det:i*5}));
  [293.66,349.23,440,523.25].forEach((f,i)=>osc('sine',f,1.0+i*.4,20.2,.012,4,4,{wet:1.3,dry:.4,det:(i%2?6:-6)}));
  // a toll for each reach of Kindlelight
  [[.05,98],[7.45,92.5],[14.45,87.3]].forEach(([a,f])=>{osc('sine',f,a,2.6,.2,.01,2.5,{wet:.8});osc('sine',f*4,a,2.2,.028,.02,2.1,{wet:1})});
  // the den: the choir drops away, a dark cluster swells, a slow heartbeat; a chime for each wave of eyes; the howl
  [55,58.27,82.41].forEach((f,i)=>osc('sawtooth',f,21.4,9.4,.05-i*.01,3.5,1.2,{lp:180,lp2:420,wet:.5,det:i*7}));
  [21.9,23.2,24.4,25.5,26.5,27.4,28.15].forEach(a=>{osc('sine',52,a,.32,.42,.005,.3,{f2:36,ft:.28});osc('sine',50,a+.24,.26,.28,.005,.24,{f2:35,ft:.22})});
  for(let i=0;i<9;i++){const a=23.0+i*.5;osc('sine',[1244.5,1174.7,1046.5,987.8,932.3,880,830.6,783.99,698.5][i],a,1.6,.012,.01,1.5,{wet:1.4,dry:.3})}
  noise(27.6,1.3,.05,1.2,.1,'bandpass',300,2,{f2:900,wet:.4});   // the breath in
  osc('sawtooth',92,28.85,2.1,.12,.12,1.6,{f2:150,ft:.6,lp:900,wet:.7});osc('sawtooth',138,28.85,2.0,.08,.1,1.5,{f2:240,ft:.7,lp:1400,wet:.8,det:-12});
  osc('square',184,28.9,1.8,.03,.1,1.4,{f2:330,ft:.8,lp:2200,wet:.9});noise(28.85,2.0,.18,.06,1.6,'bandpass',600,1.1,{f2:1500,wet:.7});
  osc('sine',44,28.95,2.4,.6,.01,2.3,{f2:28,ft:2});noise(28.95,2.2,.3,.01,2.1,'lowpass',260,.8,{wet:.5});
  // the resolve: "bring me his essence"
  [146.83,220,293.66,349.23,440,587.33].forEach((f,i)=>osc('triangle',f,31.6+i*.12,5.4,.022,1.4,3,{lp:2200,wet:1,dry:.6}));
  [293.66,349.23,440].forEach((f,i)=>osc('sine',f,31.2+i*.3,6,.01,2,3,{wet:1.3,dry:.4,det:(i%2?5:-5)}))}

// ---------------- play / skip / finish ----------------
function kc208Start(cap){if(KC208.run)return false;let S;try{S=kc208Build()}catch(e){console.warn('kc208 build',e);return false}
  KC208.S=S;KC208.run=true;KC208.on=true;KC208.seen=1;KC208.skipT=null;S.fresh=true;S.fov0=cam.fov;S.home=pl.position.clone();S.home.y=GH(S.home.x,S.home.z);
  try{if(MQ145.S)S.sig0=MQ145.S.sig.map(M=>M.g.visible)}catch(_){}
  try{ic151DCss();document.body.classList.add('ic151d');dispatchEvent(new Event('resize'))}catch(_){}
  kc208Layer(S);if(cap)S.dom.skip.style.display='none';return true}
function kc208Play(){if(!kc208Start(false))return;const S=KC208.S,L=KC208.live={t0:performance.now(),off:0,raf:0,ac:null};
  try{const AC=window.AudioContext||window.webkitAudioContext,ac=L.ac=new AC(),out=ac.createGain(),cp=ac.createDynamicsCompressor();out.gain.value=.9;out.connect(cp);cp.connect(ac.destination);L.out=out;if(ac.resume)ac.resume();kc208Score(ac,out,ac.currentTime+.05)}catch(e){console.warn('kc208 sound',e)}
  try{if(typeof MU!='undefined'&&MU.g&&MU.a){L.mu=1;MU.g.gain.setTargetAtTime(0,MU.a.currentTime,.1)}}catch(_){}
  const onKey=e=>{if(!KC208.run)return;e.stopImmediatePropagation();e.preventDefault();if(e.type=='keydown'&&/^(Escape|Enter| |Spacebar)$/.test(e.key))kc208Skip()};L.onKey=onKey;
  addEventListener('keydown',onKey,true);addEventListener('keyup',onKey,true);S.dom.skip.onclick=e=>{e.stopPropagation();kc208Skip()};
  S.dom.el.addEventListener('pointermove',()=>{S.dom.el.style.cursor='default';clearTimeout(L.cur);L.cur=setTimeout(()=>{if(S.dom)S.dom.el.style.cursor=''},1500)});
  const tick=now=>{if(!KC208.run)return;L.raf=requestAnimationFrame(tick);kc208Seek((now-L.t0)/1000+L.off)};L.raf=requestAnimationFrame(tick)}
function kc208Seek(t){const S=KC208.S;if(!S)return;if(t>=KC208.len){kc208End();return}KC208.on=true;KC208.t=t;try{kc208Frame(S,t)}catch(e){console.warn('kc208 frame',e);KC208.err=String(e&&e.stack||e);kc208End()}}
// skip: a quick fade to black, then straight to the hero (the last shot's end)
function kc208Skip(){const L=KC208.live;if(!L||!KC208.run||KC208.skipT!=null)return;const t=(performance.now()-L.t0)/1000+L.off;if(t>=KC208.sh[4][0])return;
  KC208.skipT=KC208.lbB-.4;L.off+=KC208.skipT-t;try{if(L.out){L.out.gain.cancelScheduledValues(L.ac.currentTime);L.out.gain.setTargetAtTime(0,L.ac.currentTime,.12)}}catch(_){}}
function kc208End(){if(!KC208.run)return;KC208.run=false;KC208.on=false;const S=KC208.S,L=KC208.live;KC208.S=null;KC208.live=null;
  try{if(L){cancelAnimationFrame(L.raf);removeEventListener('keydown',L.onKey,true);removeEventListener('keyup',L.onKey,true);
    if(L.ac){const ac=L.ac;try{L.out.gain.setTargetAtTime(0,ac.currentTime,.3)}catch(_){}setTimeout(()=>{try{ac.close()}catch(_){}},1500)}if(L.mu&&typeof muVol=='function')muVol()}}catch(_){}
  try{if(S){S.cast.forEach(C=>{if(C.m.parent)C.m.parent.remove(C.m)});   // models only: their kits may be shared, so nothing is disposed (as removeE)
    [S.lt,S.lt2].forEach(l=>{if(l&&l.parent)l.parent.remove(l)});
    (S.eg||[]).forEach(g=>{if(g.parent)g.parent.remove(g);g.material.dispose()});
    const e=S.boss;if(e&&e.sv){const Q=e.sv,o=S.sv;Q.ph=o.ph;Q.eyeF=o.eyeF;Q.bigC=0;Q.R._ic=null;Q.trk=o.trk;Q.tt=o.tt;Q.aw=o.aw;e.m.rotation.y=o.ry;e.m.visible=o.vis;if(e.hb)e.hb.visible=!!o.hb;try{svApply(e,0,performance.now())}catch(_){}}
    try{if(MQ145.S){MQ145.S.sig.forEach((M,i)=>{M.g.visible=!!(S.sig0&&S.sig0[i])});MQ145.S.lights.forEach(l=>l.intensity=0)}if(MQ143.S)MQ143.S.root.visible=true}catch(_){}
    pl.position.copy(S.home);pl.position.y=GH(S.home.x,S.home.z);pl.visible=true;try{chunkVis()}catch(_){}
    // the camera behind the hero, as the game has it
    camYaw=pl.rotation.y+Math.PI;cam.fov=S.fov0||58;cam.updateProjectionMatrix();if(typeof camK!='undefined'&&typeof camPitch!='undefined')camK=camPitch;try{snapCam()}catch(_){}
    if(S.dom)S.dom.el.remove()}}catch(e){console.warn('kc208 end',e)}
  try{document.body.classList.remove('ic151d');dispatchEvent(new Event('resize'))}catch(_){}
  try{if(typeof K!='undefined')for(const k in K)K[k]=false}catch(_){}
  const q=KC208.q||[];KC208.q=[];q.forEach(f=>{try{f()}catch(_){}})}
// capture mode for tests: no sound, no clock; then kc208Seek(t) per frame
function kc208Cap(){if(!kc208Start(true))return null;const S=KC208.S;return {cast:S.cast.map(C=>C.k),boss:!!S.boss,eyes:S.boss&&S.boss.sv.R.eyes?S.boss.sv.R.eyes.length:0,sig:!!MQ145.S,road:!!MQ143.S,plan:S.P}}

// ---------------- hooks ----------------
// the first arrival in Kindlelight (any of its field instances) plays it
{const f=insArrive;insArrive=function(I){const go=!!I&&I.z===0&&I.fld&&!KC208.seen&&!KC208.run&&kc208Want();if(go)KC208.pend=1;
  let r;try{r=f.apply(this,arguments)}finally{KC208.pend=0}if(go)try{kc208Play()}catch(e){console.warn('kc208',e);kc208End()}return r}}
// the zone's title card waits until the cinematic is over
{const f=banner;banner=function(){if(KC208.run||KC208.pend){const a=arguments,s=this;(KC208.q=KC208.q||[]).push(()=>f.apply(s,a));return}return f.apply(this,arguments)}}
if(typeof zt116Show=='function'){const f=zt116Show;zt116Show=function(){if(KC208.run||KC208.pend){const a=arguments,s=this;(KC208.q=KC208.q||[]).push(()=>f.apply(s,a));return}return f.apply(this,arguments)}}
// the main loop waits while it plays
{const f=loop;loop=function(now){if(KC208.on){requestAnimationFrame(loop);last=now;return}return f.apply(this,arguments)}}
