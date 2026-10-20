// ================= v91 fxB: Shockwave, Judgment, Hammer of Light, homing Arcane Missiles, class resource bar =================
// How it works (read this before changing it):
// - build/pN_fxB.py adds one hook in the old cast_base: `switch(fxbCast(...)?'_fxb':sk.k)`. Mana, cooldown, echo and the attack value
//   (incl. v90 ranks) are computed by cast_base exactly as before; fxbCast only replaces what the four casts DRAW and WHEN they hit.
//   Damage numbers are untouched: the same raw, the same hit shapes (beam: 0<along<9, side<1.1; meteor: area(p,Rr)), the same shots.
// - Shockwave (warrior, line): two-hand overhead slam (FXB_TR.sw); the ground is struck at the impact frame (.46 of 640 ms) and a wave
//   of bursting rock runs down the 9-tile line at 28 tiles/s with a dust wall and a crack decal; enemies are hit as the wave reaches them.
// - Judgment (paladin, line): the hand rises to the sky (glow in the hand), a golden sigil lights the line, a sword of light in a light
//   column falls onto the focus (target in the line, else 6 tiles ahead); impact at .56 of 760 ms hits the whole line at once.
// - Hammer of Light (paladin, ground circle): a gold sigil replaces the red warning; a giant spectral warhammer (octagonal beveled head,
//   runes, haft, grip, pommel gem) swings down from the sky with accelerating fall and lands exactly at sk.delay (.7 s): area damage,
//   shockwave ring, debris, dust, camera shake, crater cracks; it stays planted, then fades upward.
// - Arcane Missiles (mage): the same 3 shots (launch, same damage/speed/life) but with s.fxb: homeShot is wrapped so they steer
//   (turn-rate limited, faster with age) toward tgt (if valid) or the best enemy in front, retarget when it dies, weave around each other,
//   and stay alive up to 2.4 s while they have a target. Works on bosses and v89 proxy sub-targets (they are ordinary `enemies`).
// - Co-op: every cast is queued on MP.evq as ['fxB',code,x,z,dx,dz,px,pz]; partners replay the visuals only (no damage) at your hero,
//   with the same pose on your model (mpOnEV is wrapped).
// - Class resource bar (#resb): resUI() used b.querySelector('i') for the fill, but since v88 the emoji icon in .ri is rewritten into an
//   <i class="kqi"> mask that comes first in the DOM, so the width went onto the icon and the fill stayed at 0 for every class.
//   resUI is re-declared below and targets '.rbar > i'.
// Temporary effects run as KQS.objs entries (game time, cleaned up by kqsClear); shared geometries/materials/textures are cached in FXB.

var FXB={g:{},m:{},t:{},rk:null};
var FXB_SK={'Shockwave':'sw','Judgment':'jd','Hammer of Light':'hl','Arcane Missiles':'am'};
var FXB_SW={ms:640,hit:.46,L:9,sp:28};
var FXB_JD={ms:760,hit:.56,L:9};
var FXB_HL={ms:980};
// ---------------- small helpers ----------------
function fxbH(x,z){return GH(x,z)}
function fxbV(x,z){return new THREE.Vector3(x,0,z)}
function fxbS(o){o.userData.fxbS=1;return o}                       // shared: never disposed
function fxbG(k,mk){return FXB.g[k]||(FXB.g[k]=fxbS(mk()))}
function fxbMat(k,mk){return FXB.m[k]||(FXB.m[k]=fxbS(mk()))}
function fxbAdd(col,op,map){return new THREE.MeshBasicMaterial({color:col,map:map||null,transparent:true,opacity:op==null?1:op,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})}
function fxbMesh(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.userData.lpsSkip=1;m.frustumCulled=false;return m}
function fxbRm(o){if(!o)return;if(o.parent)o.parent.remove(o);o.traverse(q=>{if(q.geometry&&!q.geometry.userData.fxbS)q.geometry.dispose();
  if(q.material)(Array.isArray(q.material)?q.material:[q.material]).forEach(m=>{if(!m.userData.fxbS)m.dispose()})})}
function fxbSpr(col,sc,op){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:fxbTex('soft'),color:col,transparent:true,opacity:op==null?1:op,blending:THREE.AdditiveBlending,depthWrite:false}));s.scale.setScalar(sc||1);s.userData.lpsSkip=1;return s}
function fxbRnd(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function fxbClamp(x,a,b){return x<a?a:x>b?b:x}
function fxbOkT(e){return !!e&&!e.dead&&!e.hid&&!e._gone&&enemies.includes(e)}
function fxbLive(){return typeof MP!='undefined'&&MP&&MP.on&&MP.others>0}
// ---------------- procedural textures (canvas, made once) ----------------
function fxbCv(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);return new THREE.CanvasTexture(c)}
function fxbGlyph(g,x,y,s,r){const P=[[0,0],[.5,0],[1,0],[0,.5],[.5,.5],[1,.5],[0,1],[.5,1],[1,1]],n=2+Math.floor(r()*3);g.beginPath();
  let a=P[Math.floor(r()*9)];g.moveTo(x+(a[0]-.5)*s,y+(a[1]-.5)*s*1.4);for(let i=0;i<n;i++){a=P[Math.floor(r()*9)];g.lineTo(x+(a[0]-.5)*s,y+(a[1]-.5)*s*1.4)}g.stroke();
  if(r()<.5){g.beginPath();g.moveTo(x-s*.5,y+(r()-.5)*s);g.lineTo(x+s*.5,y+(r()-.5)*s);g.stroke()}}
function fxbCrackPts(){if(FXB.cp)return FXB.cp;const r=fxbRnd(91),pts=[],br=[];let x=64;for(let y=0;y<=1024;y+=22){x+=(r()-.5)*30;x=fxbClamp(x,26,102);pts.push([x,y])}
  for(let i=2;i<pts.length-1;i+=2){const s=r()<.5?-1:1,a=pts[i];let bx=a[0],by=a[1];const b=[[bx,by]];for(let k=0;k<3;k++){bx+=s*(8+r()*12);by+=(r()-.3)*22;b.push([fxbClamp(bx,4,124),by])}br.push(b)}
  return FXB.cp={pts,br}}
function fxbTex(k){if(FXB.t[k])return FXB.t[k];let t;
  if(k=='soft')t=fxbCv(64,64,(g)=>{const q=g.createRadialGradient(32,32,0,32,32,32);q.addColorStop(0,'rgba(255,255,255,1)');q.addColorStop(.35,'rgba(255,255,255,.55)');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.fillRect(0,0,64,64)});
  else if(k=='crackD'||k=='crackG')t=fxbCv(128,1024,(g)=>{const C=fxbCrackPts(),line=(L,lw,col,bl)=>{g.strokeStyle=col;g.lineWidth=lw;g.shadowColor=col;g.shadowBlur=bl;g.lineJoin='round';g.lineCap='round';g.beginPath();L.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
    if(k=='crackG'){line(C.pts,20,'rgba(255,120,30,.55)',22);line(C.pts,8,'rgba(255,190,90,.95)',8);C.br.forEach(b=>line(b,5,'rgba(255,150,60,.7)',8))}
    else{line(C.pts,13,'rgba(40,26,14,.55)',6);line(C.pts,6,'rgba(12,7,3,.95)',0);C.br.forEach(b=>line(b,3.5,'rgba(14,8,4,.9)',0))}});
  else if(k=='sigil')t=fxbCv(512,512,(g)=>{const r=fxbRnd(17),gd='rgba(255,226,150,';g.translate(256,256);g.shadowColor='rgba(255,200,90,1)';g.shadowBlur=10;g.strokeStyle=gd+'1)';
    [[246,7],[232,2.5],[176,3.5],[166,1.5],[96,3],[40,2]].forEach(([R,w])=>{g.lineWidth=w;g.beginPath();g.arc(0,0,R,0,6.283);g.stroke()});
    g.lineWidth=3;g.beginPath();for(let i=0;i<=8;i++){const a=i*3/8*6.283-1.5708;g[i?'lineTo':'moveTo'](Math.cos(a)*166,Math.sin(a)*166)}g.stroke();
    g.lineWidth=2;g.beginPath();for(let i=0;i<=6;i++){const a=i/6*6.283;g[i?'lineTo':'moveTo'](Math.cos(a)*96,Math.sin(a)*96)}g.stroke();
    g.lineWidth=3.2;for(let i=0;i<20;i++){const a=i/20*6.283;g.save();g.rotate(a);fxbGlyph(g,0,-204,20,r);g.restore()}
    for(let i=0;i<8;i++){const a=i/8*6.283;g.beginPath();g.arc(Math.cos(a)*136,Math.sin(a)*136,7,0,6.283);g.stroke()}
    g.lineWidth=5;g.beginPath();g.moveTo(0,-34);g.lineTo(0,34);g.moveTo(-22,-8);g.lineTo(22,-8);g.stroke()});
  else if(k=='runeLine')t=fxbCv(128,1024,(g)=>{const r=fxbRnd(5);g.shadowColor='rgba(255,200,90,1)';g.shadowBlur=8;g.strokeStyle='rgba(255,226,150,1)';
    g.lineWidth=5;[12,116].forEach(x=>{g.beginPath();g.moveTo(x,0);g.lineTo(x,1024);g.stroke()});g.lineWidth=2;[24,104].forEach(x=>{g.beginPath();g.moveTo(x,0);g.lineTo(x,1024);g.stroke()});
    g.lineWidth=3.5;for(let y=50;y<1000;y+=78){fxbGlyph(g,64,y,30,r);g.beginPath();g.moveTo(54,y+38);g.lineTo(64,y+30);g.lineTo(74,y+38);g.lineTo(64,y+46);g.closePath();g.stroke()}});
  else if(k=='runes')t=fxbCv(256,64,(g)=>{const r=fxbRnd(33);g.shadowColor='rgba(255,210,110,1)';g.shadowBlur=6;g.strokeStyle='rgba(255,240,200,1)';g.lineWidth=4;
    for(let i=0;i<6;i++)fxbGlyph(g,26+i*41,32,22,r);g.lineWidth=2;g.beginPath();g.moveTo(4,6);g.lineTo(252,6);g.moveTo(4,58);g.lineTo(252,58);g.stroke()});
  else if(k=='beam')t=fxbCv(8,128,(g)=>{const q=g.createLinearGradient(0,0,0,128);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(.55,'rgba(255,255,255,.35)');q.addColorStop(.92,'rgba(255,255,255,1)');q.addColorStop(1,'rgba(255,255,255,.6)');g.fillStyle=q;g.fillRect(0,0,8,128)});
  return FXB.t[k]=t}
// a decal draped over the terrain (plane in its XY plane; fn(u,v) → [x,z])
function fxbDecal(geo,mat,ro){const m=fxbMesh(geo,mat);m.renderOrder=ro||28;m.userData.b=geo.attributes.position.array.slice();scene.add(m);return m}
function fxbDrape(m,fn,lift){const P=m.geometry.attributes.position,b=m.userData.b,y0=lift==null?.14:lift;for(let i=0;i<P.count;i++){const w=fn(b[i*3],b[i*3+1]);P.setXYZ(i,w[0],fxbH(w[0],w[1])+y0,w[1])}P.needsUpdate=true;m.geometry.computeBoundingSphere()}
function fxbLineFn(P,d,L){const px=d.z,pz=-d.x;return (u,v)=>{const s=L/2-v;return [P.x+d.x*s+px*u,P.z+d.z*s+pz*u]}}
function fxbCircFn(p,R,a){const c=Math.cos(a),s=Math.sin(a);return (u,v)=>[p.x+(u*c-v*s)*R,p.z-(u*s+v*c)*R]}
// ---------------- rock debris (shared geometry and material; pieces sink or fall away, nothing to dispose) ----------------
function fxbRockMat(k){return fxbMat('rock'+k,()=>new THREE.MeshStandardMaterial({color:[0x4e4034,0x3e3329,0x63523f][k],flatShading:true,roughness:.95,metalness:0}))}
function fxbRockGeo(k){return fxbG('rock'+k,()=>k?new THREE.DodecahedronGeometry(1,0):new THREE.IcosahedronGeometry(1,0))}
var FXB_DEB=[];   // flying chunks: {m,vx,vy,vz,rx,rz,t}
function fxbChunk(p,sp,up,sc){const m=fxbMesh(fxbRockGeo(Math.random()<.5?1:0),fxbRockMat(Math.floor(Math.random()*3)));m.position.copy(p);m.scale.set(sc*(.7+Math.random()*.6),sc*(.6+Math.random()*.7),sc*(.7+Math.random()*.6));
  m.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);scene.add(m);const a=Math.random()*6.283,r=sp*(.4+Math.random()*.6);
  FXB_DEB.push({m,vx:Math.cos(a)*r,vy:up*(.6+Math.random()*.6),vz:Math.sin(a)*r,rx:(Math.random()-.5)*14,rz:(Math.random()-.5)*14,t:0})}
function fxbDebTick(dt){for(let i=FXB_DEB.length-1;i>=0;i--){const q=FXB_DEB[i],m=q.m;q.t+=dt;q.vy-=22*dt;m.position.x+=q.vx*dt;m.position.y+=q.vy*dt;m.position.z+=q.vz*dt;m.rotation.x+=q.rx*dt;m.rotation.z+=q.rz*dt;
  const gy=fxbH(m.position.x,m.position.z);if(m.position.y<gy+m.scale.y*.3&&q.vy<0){if(q.b){m.scale.multiplyScalar(Math.max(0,1-dt*5))}else{q.b=1;q.vy*=-.25;q.vx*=.4;q.vz*=.4;m.position.y=gy+m.scale.y*.3}}
  if(q.t>1.6||m.scale.x<.02){if(m.parent)m.parent.remove(m);FXB_DEB.splice(i,1)}}}
// a jagged spike of rock that bursts out of the ground, holds, then sinks back
function fxbSpike(o,p,h,w,tilt,ang){const m=fxbMesh(fxbRockGeo(0),fxbRockMat(Math.floor(Math.random()*2)));m.scale.set(w,h,w*.8);m.rotation.set(Math.cos(ang)*tilt,Math.random()*6,Math.sin(ang)*tilt);
  const y0=fxbH(p.x,p.z);m.position.set(p.x,y0-h,p.z);scene.add(m);o.sp.push({m,y0,h,t:0,life:.75+Math.random()*.3})}
function fxbSpikeTick(o,dt){for(let i=o.sp.length-1;i>=0;i--){const q=o.sp[i];q.t+=dt;const u=q.t<.09?1-Math.pow(1-q.t/.09,3):q.t<q.life-.35?1:Math.max(0,(q.life-q.t)/.35);q.m.position.y=q.y0-q.h*(1-u*.85);
  if(q.t>=q.life){if(q.m.parent)q.m.parent.remove(q.m);o.sp.splice(i,1)}}}
// ---------------- hero poses (local: v81 action system; co-op: tween on the remote model) ----------------
var FXB_TR=null;
function fxbTracks(){if(FXB_TR)return FXB_TR;if(typeof atkTrack!='function')return null;const E=typeof atkEyes=='function'?atkEyes:(p=>p);
  // Shockwave: crouch to load, both hands drive the weapon high overhead (rising onto the toes), whip down into the ground, hold the low impact, recover
  const swL=E({sx:.18,ax:-.75,ex:-1.3,lx:-.75,le:-1.3,az:.1,lz:-.1,lk:.45,rk:.45,lh:-.1,rh:-.1,dy:-.09,hx:.1});
  const swW=E({sy:.12,sx:-.38,hx:-.28,ax:-3.12,az:.06,ex:-.55,lx:-3.02,lz:-.06,le:-.55,rw:-.3,lh:.08,rh:.08,lk:.05,rk:.08,dy:.03});
  const swW2=Object.assign({},swW,{sx:-.44,ax:-3.2,lx:-3.1,ex:-.65,le:-.65,dy:.04});
  const swS=E({sy:0,sx:.72,ax:-.5,ex:-.04,lx:-.5,le:-.04,rw:.5,hx:.24,lh:-.52,rh:.42,lk:.95,rk:.62,dy:-.19});
  const swO=E({sy:0,sx:.78,ax:-.42,ex:-.08,lx:-.42,le:-.08,rw:.55,hx:.26,lh:-.55,rh:.44,lk:1.0,rk:.66,dy:-.21});
  const sw=atkTrack([[0,ATK_REST],[.14,swL,'out'],[.33,swW,'io'],[.41,swW2,'out'],[.46,swS,'in'],[.56,swO,'out'],[.74,atkMix(swO,ATK_REST,.3),'io'],[1,ATK_REST,'io']]);
  // Judgment: right hand thrust up to the sky (weapon high), body arches, hold while the light gathers, then bring the arm down hard on impact
  const jdU=E({sy:.18,py:.06,sx:-.26,hx:-.45,ax:-3.05,az:.22,ex:-.06,rw:.25,lx:-.55,lz:.35,le:-1.0,lh:.04,rh:.1,lk:.08,rk:.18,dy:.02});
  const jdU2=Object.assign({},jdU,{sx:-.3,ax:-3.15,hx:-.5,dy:.03});
  const jdD=E({sy:-.25,py:-.12,sx:.38,hx:.12,ax:-1.15,az:-.12,ex:-.04,rw:.55,lx:-.45,lz:.25,le:-.9,lh:-.34,rh:.24,lk:.46,rk:.12,dy:-.08});
  const jdO=atkAdd(jdD,{sx:.04,ax:.12,dy:-.01});
  const jd=atkTrack([[0,ATK_REST],[.3,jdU,'out'],[.48,jdU2,'io'],[.56,jdD,'in'],[.68,jdO,'out'],[1,ATK_REST,'io']]);
  // Hammer of Light: both arms raised wide to call the hammer, hold, then both fists pulled down as it lands (impact at .7 s of .98 s)
  const hlU=E({sx:-.22,hx:-.4,ax:-2.85,az:.45,ex:-.2,lx:-2.85,lz:-.45,le:-.2,rw:.2,lw:.2,lk:.06,rk:.06,dy:.02});
  const hlU2=Object.assign({},hlU,{ax:-2.95,lx:-2.95,az:.35,lz:-.35,sx:-.26});
  const hlD=E({sx:.42,hx:.15,ax:-.95,az:.15,ex:-1.45,lx:-.95,lz:-.15,le:-1.45,lh:-.35,rh:.25,lk:.55,rk:.4,dy:-.12});
  const hl=atkTrack([[0,ATK_REST],[.24,hlU,'out'],[.6,hlU2,'io'],[.715,hlD,'in'],[.8,atkAdd(hlD,{sx:.03,dy:-.01}),'out'],[1,ATK_REST,'io']]);
  return FXB_TR={sw:[sw,FXB_SW.ms],jd:[jd,FXB_JD.ms],hl:[hl,FXB_HL.ms]}}
function fxbPose(code,h){const T=(fxbTracks()||{})[code];if(!T)return;
  if(!h||h===pl){try{haPlay(T[1],T[0],2,null,.12);if(HA.cur){HA.cur.legFull=1;HA.cur.fxb=code}}catch(_){}return}
  if(!h.bones)return;const b=h.bones;h.sw=1;h._fxbP=(h._fxbP|0)+1;const id=h._fxbP;
  tw(T[1],k=>{if(h._fxbP!==id)return;const P=T[0](k);for(const c in P){if(typeof HA_LEGS!='undefined'&&HA_LEGS[c]&&c!='dy')continue;const ch=HACH[c];if(ch&&b[ch[0]])b[ch[0]].rotation[ch[1]]=P[c]}},()=>{if(h._fxbP===id)h.sw=0})}
function fxbHand(h,side){const b=(h||pl).bones,n=b&&(b[side=='l'?'aL2':'aR2']||b[side=='l'?'aL1':'aR1']);const v=new THREE.Vector3();if(n){n.updateWorldMatrix(true,false);n.getWorldPosition(v)}else v.copy(gY((h||pl).position,1.8));return v}
// ---------------- the cast hook (called from cast_base after mana/cooldown/attack value) ----------------
function fxbCast(sk,P,d,raw,mt,fx,s,Rr){const code=sk&&FXB_SK[sk.n];if(!code)return false;
  try{if(!(typeof THREE!='undefined'&&scene))return false}catch(_){return false}
  const P0=P.clone(),d0=d.clone().setY(0);if(d0.lengthSq()<1e-6)d0.set(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y));d0.normalize();
  if(code=='am'){fxbMissiles(sk,d0,raw,mt,s);fxbSend(code,P0,d0,P0);return true}
  const hitLine=(e,len)=>{const vx=e.m.position.x-P0.x,vz=e.m.position.z-P0.z,a=vx*d0.x+vz*d0.z,w=Math.abs(vx*d0.z-vz*d0.x);return a>0&&a<len&&w<1.1?a:-1};
  if(code=='sw'){const hit=new Set();
    fxbShock({P:P0,d:d0,h:pl,dmg:front=>{if(!party.length)return;enemies.slice().forEach(e=>{if(e.dead||hit.has(e))return;const a=hitLine(e,9);if(a>=0&&a<=front+.35){hit.add(e);heroHit(e,raw,mt,{s:fx});burst(gY(e.m.position,.5),0xc8a070,14,2,2.5,.5)}})}});
    fxbSend(code,P0,d0,P0);return true}
  if(code=='jd'){let F=null,fa=1e9;if(fxbOkT(tgt)&&hitLine(tgt,9)>=0)F=tgt;else enemies.forEach(e=>{if(e.dead)return;const a=hitLine(e,9);if(a>=0&&a<fa){fa=a;F=e}});
    const fp=F?F.m.position.clone().setY(0):fxbV(P0.x+d0.x*6,P0.z+d0.z*6);
    fxbJudg({P:P0,d:d0,fp,h:pl,dmg:()=>{if(!party.length)return;enemies.slice().forEach(e=>{if(e.dead)return;if(hitLine(e,9)>=0)heroHit(e,raw,mt,{s:fx})})}});
    fxbSend(code,P0,d0,fp);return true}
  if(code=='hl'){const p=aimPoint(10).setY(0),col=sk.col;
    fxbHammer({P:P0,d:d0,p,R:Rr,delay:Math.max(.2,+sk.delay||.7),h:pl,dmg:()=>{ring(p,col,Rr*2,420);burst(gY(p,.4),col,70,Rr*1.6,4,.9);shake(.3);area(p,Rr,raw,fx,null,0)}});
    fxbSend(code,P0,d0,p,Rr);return true}
  return false}
// own casts never play the generic cast pose (fxbCast plays the proper one; the generic one also told co-op peers to wave an arm)
{const f=castAnim;castAnim=function(){const sk=typeof ATK_SK!='undefined'?ATK_SK:null,c=sk&&FXB_SK[sk.n];if(c&&c!='am'&&!sk.pose)return;return f.apply(this,arguments)}}
// ---------------- Shockwave ----------------
function fxbShock(c){const P=c.P,d=c.d,L=FXB_SW.L,loc=!!c.dmg,T0=FXB_SW.ms*FXB_SW.hit/1000;fxbPose('sw',c.h);if(loc)kqsSnd('charge');
  const px=d.z,pz=-d.x,crD=fxbDecal(new THREE.PlaneGeometry(1.5,L,1,36),new THREE.MeshBasicMaterial({map:fxbTex('crackD'),transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide}),27),
    crG=fxbDecal(new THREE.PlaneGeometry(1.5,L,1,36),fxbAdd(0xffffff,1,fxbTex('crackG')),28),fn=fxbLineFn(fxbV(P.x+d.x*.5,P.z+d.z*.5),d,L);
  fxbDrape(crD,fn,.12);fxbDrape(crG,fn,.13);crD.geometry.setDrawRange(0,0);crG.geometry.setDrawRange(0,0);
  const fr=fxbMesh(new THREE.RingGeometry(.7,1.25,18,1,0,Math.PI),fxbAdd(0xffc890,0)),wall=fxbMesh(new THREE.PlaneGeometry(2.8,1.6),new THREE.MeshBasicMaterial({map:fxbTex('soft'),color:0xb89a78,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));
  fr.rotation.x=-Math.PI/2;const frG=new THREE.Group();frG.add(fr);frG.add(wall);wall.position.y=.7;frG.rotation.y=Math.atan2(d.x,d.z);fr.rotation.z=Math.PI;scene.add(frG);frG.visible=false;
  const o={sp:[],step:0,imp:0};
  kqsObj({life:T0+L/FXB_SW.sp+1.9,tick:(dt,now,ob)=>{const t=ob.age;fxbSpikeTick(o,dt);
    if(t<T0){if(Math.random()<.5)burst(gY(c.h.position||P,.15),0xa08a6a,2,1.2,.6,.4);return}
    if(!o.imp){o.imp=1;const q=fxbV(P.x+d.x*1.1,P.z+d.z*1.1);burst(gY(q,.2),0xb09070,36,3,3.2,.7);burst(gY(q,.3),0xffc890,20,2,2,.4);
      for(let k=0;k<6;k++)fxbChunk(gY(q,.2),3.5,7,.12+Math.random()*.1);fxbSpike(o,q,.9,.45,.5,Math.random()*6);ring(q,0xffc890,2.4,320);
      if(loc){shake(.28);hstop=Math.max(hstop||0,.06);kqsSnd('thud');kqsSnd('quake')}frG.visible=true}
    const f=Math.min(L,(t-T0)*FXB_SW.sp);
    // wave front: crescent + dust wall riding the line; ground breaks open behind it
    if(f<L){const k=f/L;frG.position.set(P.x+d.x*(f+.6),fxbH(P.x+d.x*(f+.6),P.z+d.z*(f+.6))+.12,P.z+d.z*(f+.6));fr.material.opacity=.85*(1-k*.5);wall.material.opacity=.55*(1-k*.6);frG.scale.setScalar(1+k*.25)}
    else if(frG.visible){fr.material.opacity*=Math.max(0,1-dt*8);wall.material.opacity*=Math.max(0,1-dt*6);if(wall.material.opacity<.02)frG.visible=false}
    const rows=Math.min(36,Math.floor((f+.6)/L*36));crD.geometry.setDrawRange(0,rows*6);crG.geometry.setDrawRange(0,rows*6);
    while(o.step*.6<f&&o.step*.6<L){const s=o.step*.6+.9,q=fxbV(P.x+d.x*s,P.z+d.z*s);o.step++;
      for(const side of [-1,1]){const off=side*(.35+Math.random()*.45),qq=fxbV(q.x+px*off,q.z+pz*off);fxbSpike(o,qq,.55+Math.random()*.6,.22+Math.random()*.18,.45,Math.atan2(pz*side,px*side))}
      if(o.step%2==0)fxbSpike(o,q,.8+Math.random()*.5,.3,.15,0);
      for(let k=0;k<2;k++)fxbChunk(gY(q,.15),2.2,6.5,.07+Math.random()*.09);
      burst(gY(q,.2),0xa08a6a,8,1.5,2.2,.6);if(o.step%3==0)burst(gY(q,.3),0xffb070,5,1,1.5,.35)}
    if(c.dmg)c.dmg(f);
    // crack: glow cools after the wave, dark crack fades last
    const tc=t-T0-L/FXB_SW.sp;if(tc>0){crG.material.opacity=Math.max(0,1-tc/.9);crD.material.opacity=.9*Math.max(0,Math.min(1,(1.8-tc)/.7))}},
   end:()=>{o.sp.forEach(q=>{if(q.m.parent)q.m.parent.remove(q.m)});o.sp.length=0;fxbRm(crD);fxbRm(crG);fxbRm(frG)}})}
// ---------------- Judgment ----------------
function fxbSword(){const g=new THREE.Group(),gold=new THREE.MeshBasicMaterial({color:0xf0b030,transparent:true,opacity:.95,side:THREE.DoubleSide}),core=fxbAdd(0xffe6a0,.35);
  const blade=fxbMesh(fxbG('jdBlade',()=>{const q=new THREE.CylinderGeometry(.34,0,4.4,4,1);q.scale(1,1,.32);q.translate(0,-2.2,0);return q}),gold);
  const edge=fxbMesh(fxbG('jdCore',()=>{const q=new THREE.CylinderGeometry(.5,0,4.8,4,1);q.scale(1,1,.4);q.translate(0,-2.3,0);return q}),core);
  const guard=fxbMesh(fxbG('jdGuard',()=>new THREE.BoxGeometry(1.7,.18,.26)),gold,0,.08,0);
  const gL=fxbMesh(fxbG('jdGE',()=>new THREE.OctahedronGeometry(.18,0)),gold,-.92,.08,0),gR=fxbMesh(FXB.g.jdGE,gold,.92,.08,0);
  const grip=fxbMesh(fxbG('jdGrip',()=>new THREE.CylinderGeometry(.075,.075,.85,6)),gold,0,.6,0),pom=fxbMesh(fxbG('jdPom',()=>new THREE.OctahedronGeometry(.17,0)),gold,0,1.12,0);
  const halo=fxbSpr(0xffd88a,1,.3);halo.position.y=-1.6;halo.scale.set(1.4,4.6,1);
  g.add(blade,edge,guard,gL,gR,grip,pom,halo);g.userData.mats=[gold,core,halo.material];return g}
function fxbJudg(c){const P=c.P,d=c.d,L=FXB_JD.L,fp=c.fp,loc=!!c.dmg,T0=FXB_JD.ms*FXB_JD.hit/1000;fxbPose('jd',c.h);if(loc)kqsSnd('holy');
  const line=fxbDecal(new THREE.PlaneGeometry(2.2,L,1,24),fxbAdd(0xffe6a0,0,fxbTex('runeLine')),29);fxbDrape(line,fxbLineFn(fxbV(P.x+d.x*.4,P.z+d.z*.4),d,L),.15);
  const sig=fxbDecal(new THREE.PlaneGeometry(2,2,10,10),fxbAdd(0xffe6a0,0,fxbTex('sigil')),30),SR=1.9;fxbDrape(sig,fxbCircFn(fp,SR,0),.16);
  const sw=fxbSword();sw.scale.setScalar(1.25);scene.add(sw);FXB.lastSw=sw;sw.traverse(q=>q.renderOrder=40);const gy=fxbH(fp.x,fp.z),y0=gy+10.5,yI=gy+4.4*1.25-.35;sw.position.set(fp.x,y0,fp.z);sw.rotation.y=Math.atan2(d.x,d.z)+Math.PI/2;
  const col=fxbMesh(fxbG('jdCol',()=>{const q=new THREE.CylinderGeometry(1,1,16,16,1,true);q.translate(0,8,0);return q}),fxbAdd(0xffe8a8,0,fxbTex('beam')));col.position.set(fp.x,gy,fp.z);col.renderOrder=33;scene.add(col);
  const hand=fxbSpr(0xfff0c0,.2,0),fl=fxbSpr(0xfff2c8,1,0);scene.add(hand,fl);fl.position.set(fp.x,gy+1.2,fp.z);
  const ob={imp:0,pil:[]};
  kqsObj({life:T0+1.6,tick:(dt,now,o)=>{const t=o.age;try{sw.rotation.y=Math.atan2(cam.position.x-fp.x,cam.position.z-fp.z)}catch(_){}
    // gathering light in the raised hand
    if(t<T0){const k=t/T0;hand.position.copy(fxbHand(c.h));hand.material.opacity=Math.min(1,k*1.6);hand.scale.setScalar(.35+k*.9);if(Math.random()<.6)burst(hand.position,0xfff0b0,1,.3,1.5,.4)}
    else hand.material.opacity=Math.max(0,hand.material.opacity-dt*5);
    // sigils
    const a=Math.min(1,t/.25),fade=t>T0+.7?Math.max(0,1-(t-T0-.7)/.8):1;line.material.opacity=.75*a*fade*(t>T0&&t<T0+.25?1.3:1);sig.material.opacity=.95*a*fade;fxbDrape(sig,fxbCircFn(fp,SR*(t<T0?1:1+.15*Math.min(1,(t-T0)/.2)),t*.9),.16);
    // the sword falls (accelerating) inside a brightening column of light
    if(t<T0){const k=fxbClamp((t-.03)/(T0-.03),0,1);sw.position.y=y0-(y0-yI)*Math.pow(k,1.8);const m=sw.userData.mats;m[0].opacity=.92*Math.min(1,k*4);m[1].opacity=.35*Math.min(1,k*4);m[2].opacity=.3*Math.min(1,k*4);col.material.opacity=.06+.18*k;col.scale.set(.5+.3*k,1,.5+.3*k);
      if(k>0&&Math.random()<.7)burst(fxbV(fp.x+(Math.random()-.5)*1.6,fp.z+(Math.random()-.5)*1.6).setY(gy+Math.random()*6),0xfff0b0,1,.2,-2,.5)}
    else{if(!ob.imp){ob.imp=1;sw.position.y=yI;fl.material.opacity=.8;fl.scale.setScalar(4);ring(fp,0xffe8a0,3.2,420);burst(gY(fp,.5),0xfff2a0,60,3.2,4.5,.9);burst(gY(fp,.3),0xffffff,20,1.5,2,.4);
        for(let k=0;k<5;k++)fxbChunk(gY(fp,.2),3,6,.08+Math.random()*.08);
        if(loc){shake(.16);hstop=Math.max(hstop||0,.05);kqsSnd('boom')}if(c.dmg)c.dmg()}
      const u=t-T0;fl.material.opacity=Math.max(0,.8*(1-u/.3));fl.scale.setScalar(4+u*7);col.material.opacity=Math.max(0,.35*(1-u/.35));col.scale.set(.7+u*.6,1,.7+u*.6);
      // lance of light: pillars ripple from the hero along the line
      while(ob.pil.length<10&&ob.pil.length*.03<u){const s=.8+ob.pil.length*.85,q=fxbV(P.x+d.x*s,P.z+d.z*s),m=fxbMesh(FXB.g.jdCol,fxbAdd(0xfff0b8,.5,fxbTex('beam')));m.position.set(q.x,fxbH(q.x,q.z),q.z);m.scale.set(.32,.22,.32);scene.add(m);ob.pil.push({m,t:0});burst(gY(q,.3),0xfff0b0,6,1,3,.5)}
      ob.pil.forEach(p=>{p.t+=dt;p.m.material.opacity=Math.max(0,.5*(1-p.t/.4));p.m.scale.set(.32+p.t*.4,.22+p.t*.15,.32+p.t*.4)});
      // the planted sword dissolves upward
      if(u>.4){const k=Math.min(1,(u-.4)/.6),m=sw.userData.mats;m[0].opacity=.92*(1-k);m[1].opacity=.35*(1-k);m[2].opacity=.3*(1-k);sw.position.y=yI+k*1.2;if(Math.random()<.5)burst(gY(fp,1+Math.random()*4),0xfff0b0,1,.4,2,.6)}}},
   end:()=>{[line,sig,col,hand,fl].forEach(fxbRm);fxbRm(sw);ob.pil.forEach(p=>fxbRm(p.m))}})}
// ---------------- Hammer of Light: the giant spectral warhammer ----------------
function fxbHammerModel(){const g=new THREE.Group(),piv=new THREE.Group();g.add(piv);
  const gold=new THREE.MeshStandardMaterial({color:0xe0a030,emissive:0x7a4a0a,emissiveIntensity:.55,metalness:.45,roughness:.38,flatShading:true,transparent:true,opacity:1}),
    dark=new THREE.MeshStandardMaterial({color:0x6a4214,emissive:0x2a1604,emissiveIntensity:.5,metalness:.5,roughness:.45,flatShading:true,transparent:true,opacity:1}),
    grip=new THREE.MeshStandardMaterial({color:0x5a2a18,emissive:0x2a0e06,emissiveIntensity:.5,roughness:.9,flatShading:true,transparent:true,opacity:1}),
    glow=fxbAdd(0xffc860,.2),rune=fxbAdd(0xfff2c0,.95,fxbTex('runes')),gem=fxbAdd(0xfff6dc,1);glow.side=THREE.BackSide;
  const oct=(r,len)=>{const q=new THREE.CylinderGeometry(r,r,len,8,1);q.rotateY(Math.PI/8);q.rotateZ(Math.PI/2);return q};
  const head=fxbMesh(fxbG('hlHead',()=>oct(.5,1.5)),gold),
    bandL=fxbMesh(fxbG('hlBand',()=>oct(.56,.14)),dark,-.6,0,0),bandR=fxbMesh(FXB.g.hlBand,dark,.6,0,0),
    faceL=fxbMesh(fxbG('hlFace',()=>{const q=new THREE.CylinderGeometry(.44,.52,.16,8,1);q.rotateY(Math.PI/8);q.rotateZ(Math.PI/2);return q}),gold,-.83,0,0),
    faceR=fxbMesh(FXB.g.hlFace,gold,.83,0,0),collar=fxbMesh(fxbG('hlCollar',()=>oct(.6,.34)),dark),
    shell=fxbMesh(fxbG('hlShell',()=>oct(.62,1.95)),glow);
  faceR.rotation.y=Math.PI;
  const haft=fxbMesh(fxbG('hlHaft',()=>new THREE.CylinderGeometry(.085,.105,3.0,6)),dark,0,1.95,0),
    lang=fxbMesh(fxbG('hlLang',()=>new THREE.BoxGeometry(.05,.75,.24)),gold,0,.85,0),
    r1=fxbMesh(fxbG('hlRing',()=>{const q=new THREE.TorusGeometry(.12,.035,4,8);q.rotateX(Math.PI/2);return q}),gold,0,1.3,0),r2=fxbMesh(FXB.g.hlRing,gold,0,2.62,0),
    wrap=fxbMesh(fxbG('hlWrap',()=>new THREE.CylinderGeometry(.12,.12,.82,6)),grip,0,3.05,0),
    pom=fxbMesh(fxbG('hlPom',()=>new THREE.OctahedronGeometry(.22,0)),gold,0,3.62,0),pg=fxbMesh(fxbG('hlGem',()=>new THREE.OctahedronGeometry(.11,0)),gem,0,3.62,0),
    spike=fxbMesh(fxbG('hlSpike',()=>new THREE.ConeGeometry(.14,.42,4)),gold,0,-.66,0);
  spike.rotation.z=Math.PI;lang.rotation.y=Math.PI/2;
  const runeF=fxbMesh(fxbG('hlRune',()=>new THREE.PlaneGeometry(1.0,.3)),rune,0,0,.475),runeB=fxbMesh(FXB.g.hlRune,rune,0,0,-.475);runeB.rotation.y=Math.PI;
  const runeT=fxbMesh(FXB.g.hlRune,rune,0,.475,0);runeT.rotation.x=-Math.PI/2;
  [head,bandL,bandR,faceL,faceR,collar,shell,haft,lang,r1,r2,wrap,pom,pg,spike,runeF,runeB,runeT].forEach(m=>piv.add(m));
  const halo=fxbSpr(0xffd88a,4.5,.35);piv.add(halo);
  g.userData={piv,mats:[gold,dark,grip],add:[glow,rune,gem],halo};return g}
function fxbHammer(c){const p=c.p,R=c.R||3,D=c.delay,loc=!!c.dmg,gy=fxbH(p.x,p.z),sc=1.25,yI=gy+.5*sc+.02,y0=gy+7;fxbPose('hl',c.h);if(loc)kqsSnd('holy');
  const sig=fxbDecal(new THREE.PlaneGeometry(2,2,12,12),fxbAdd(0xffe0a0,0,fxbTex('sigil')),30),edge=fxbDecal(new THREE.RingGeometry(.94,1,48,1),fxbAdd(0xffd070,0),31);
  fxbDrape(sig,fxbCircFn(p,R,0),.15);fxbDrape(edge,fxbCircFn(p,R,0),.16);
  const H=fxbHammerModel(),U=H.userData,piv=U.piv;H.scale.setScalar(sc);H.position.set(p.x,y0,p.z);H.rotation.y=Math.atan2(c.d.x,c.d.z)+Math.PI/2;scene.add(H);
  const cr=[];const ob={imp:0};
  const setOp=k=>{U.mats.forEach(m=>m.opacity=k);U.add[0].opacity=.2*k;U.add[1].opacity=.95*k;U.add[2].opacity=k;U.halo.material.opacity=.35*k};setOp(0);
  kqsObj({life:D+1.5,tick:(dt,now,o)=>{const t=o.age;
    if(c.h&&t<D&&Math.random()<.5){burst(fxbHand(c.h,'r'),0xfff0b0,1,.3,1.2,.4);burst(fxbHand(c.h,'l'),0xfff0b0,1,.3,1.2,.4)}
    const a=Math.min(1,t/.2);sig.material.opacity=.9*a*(t>D+.6?Math.max(0,1-(t-D-.6)/.7):1);edge.material.opacity=.7*a*(t<D?.6+.4*Math.sin(t*22):1)*(t>D+.6?Math.max(0,1-(t-D-.6)/.7):1);
    fxbDrape(sig,fxbCircFn(p,R,-t*1.2),.15);
    if(t<D){// appear, wind back, swing down with accelerating fall
      setOp(Math.min(1,t/.14));H.scale.setScalar(sc*(.55+.45*Math.min(1,t/.16)));const k=fxbClamp((t-.1)/(D-.1),0,1),e=Math.pow(k,2.3);
      H.position.y=y0-(y0-yI)*e;piv.rotation.x=-1.75*(1-Math.pow(k,1.6))+.18*Math.sin(Math.min(1,t/.1)*Math.PI)*(1-k);piv.rotation.y=.6*(1-k);
      if(k>.15)for(let j=0;j<2;j++)burst(fxbV(p.x+(Math.random()-.5)*1.4,p.z+(Math.random()-.5)*1.4).setY(H.position.y+Math.random()*2),0xffe0a0,1,.3,1.5,.35);
      return}
    if(!ob.imp){ob.imp=1;H.position.y=yI;piv.rotation.set(0,0,0);if(c.dmg)c.dmg();else{ring(p,0xfff0a0,R*2,420);burst(gY(p,.4),0xfff0a0,70,R*1.6,4,.9)}
      const fl=fxbSpr(0xfff4d0,R*2.6,1);fl.position.set(p.x,gy+.8,p.z);scene.add(fl);cr.push({m:fl,k:'fl'});
      const sh=fxbDecal(new THREE.RingGeometry(.82,1,40,1),fxbAdd(0xffe6a0,.95),32);cr.push({m:sh,k:'sh'});
      for(let j=0;j<5;j++){const a2=j/5*6.283+Math.random()*.6,m=fxbDecal(new THREE.PlaneGeometry(.9,R*.9,1,8),new THREE.MeshBasicMaterial({map:fxbTex('crackD'),transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide}),27);
        const dd=fxbV(Math.sin(a2),Math.cos(a2));fxbDrape(m,fxbLineFn(fxbV(p.x+dd.x*.5,p.z+dd.z*.5),dd,R*.9),.13);cr.push({m,k:'cr'})}
      const sp={sp:[]};ob.sp=sp;for(let j=0;j<8;j++){const a2=j/8*6.283,q=fxbV(p.x+Math.cos(a2)*1.6,p.z+Math.sin(a2)*1.6);fxbSpike(sp,q,.5+Math.random()*.4,.3,.6,a2)}
      for(let j=0;j<14;j++)fxbChunk(gY(p,.3),4.5,8,.1+Math.random()*.12);burst(gY(p,.3),0xa08a6a,40,R*1.2,2.5,.8);burst(gY(p,1.5),0xffffff,24,2,3,.5);
      if(loc){hstop=Math.max(hstop||0,.07);kqsSnd('thud')}}
    const u=t-D;if(ob.sp)fxbSpikeTick(ob.sp,dt);
    H.position.y=yI+(u<.12?Math.sin(u/.12*Math.PI)*.18:0);
    cr.forEach(q=>{if(q.k=='fl'){q.m.material.opacity=Math.max(0,1-u/.3);q.m.scale.setScalar(R*2.6+u*10)}
      else if(q.k=='sh'){const r=.5+R*1.35*Math.min(1,u/.35);fxbDrape(q.m,fxbCircFn(p,r,0),.17);q.m.material.opacity=.95*Math.max(0,1-u/.45)}
      else q.m.material.opacity=.85*Math.max(0,Math.min(1,(1.4-u)/.6))});
    if(u>.45){const k=Math.min(1,(u-.45)/.55);setOp(1-k);H.position.y=yI+k*1.6;if(Math.random()<.6)burst(gY(p,.5+Math.random()*3),0xfff0b0,1,.4,2,.6)}},
   end:()=>{fxbRm(sig);fxbRm(edge);fxbRm(H);cr.forEach(q=>fxbRm(q.m));if(ob.sp)ob.sp.sp.forEach(q=>{if(q.m.parent)q.m.parent.remove(q.m)})}})}
// ---------------- Arcane Missiles: homing ----------------
function fxbMisMesh(col){const g=new THREE.Group();
  g.add(fxbMesh(fxbG('amCore',()=>new THREE.OctahedronGeometry(.1,0)),fxbMat('amCore',()=>fxbAdd(0xe8dcff,1))));
  g.add(fxbMesh(fxbG('amHalo',()=>new THREE.SphereGeometry(.22,8,6)),fxbMat('amHaloN',()=>new THREE.MeshBasicMaterial({color:0x7a3cff,transparent:true,opacity:.6,depthWrite:false}))));
  const tl=fxbMesh(fxbG('amTail',()=>{const q=new THREE.ConeGeometry(.13,.9,6,1,true);q.rotateX(-Math.PI/2);q.translate(0,0,-.5);return q}),fxbMat('amTailN',()=>new THREE.MeshBasicMaterial({color:0x9a6aff,transparent:true,opacity:.45,depthWrite:false,side:THREE.DoubleSide})));g.add(tl);
  const s=new THREE.Sprite(fxbMat('amSpr'+col,()=>new THREE.SpriteMaterial({map:fxbTex('soft'),color:col,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false})));s.scale.setScalar(.7);g.add(s);
  g.userData.fxbM=1;return g}
function fxbPick(p,hx,hz,cmin,maxD){if(fxbOkT(tgt)&&d2(tgt.m.position,p)<20)return tgt;let best=null,bs=1e9;
  enemies.forEach(q=>{if(!fxbOkT(q))return;const dx=q.m.position.x-p.x,dz=q.m.position.z-p.z,L=Math.hypot(dx,dz);if(L>maxD)return;const cc=L>.01?(dx*hx+dz*hz)/L:1;if(cc<cmin)return;const sc=L*(1.6-cc);if(sc<bs){bs=sc;best=q}});return best}
function fxbMissiles(sk,d,raw,mt,s){const P=pl.position,n=sk.n2||1,T0=fxbPick(P,d.x,d.z,.1,15),fan=T0?.55:.2,spd=sk.arrow?22:13;
  for(let j=0;j<n;j++){const a=(j-(n-1)/2)*fan,co=Math.cos(a),sn=Math.sin(a),dd=fxbV(d.x*co+d.z*sn,-d.x*sn+d.z*co),n0=shots.length;
    launch(P,dd,spd,{col:sk.col,mt,arrow:sk.arrow,big:sk.big,burn:sk.burn,pierce:sk.arrow?s.pierce:0},raw,sk.arrow?.65:1.1);
    if(shots.length<=n0)continue;const sh=shots[shots.length-1];sh.s=Object.assign({},sh.s,{home:1,fxb:1});sh.htg=T0;sh.bfxH=0;
    if(!sh.s.arrow){const old=sh.m,m=fxbMisMesh(sk.col);m.position.copy(old.position);scene.remove(old);if(old.geometry)old.geometry.dispose();if(old.material&&old.material.dispose)old.material.dispose();scene.add(m);sh.m=m}
    sh.fb={ph:j*2.2+Math.random()*.6,sd:j-(n-1)/2,ox:0,oy:0,oz:0,sp:spd,age:0}}}
function fxbSteer(sh,dt){const F=sh.fb||(sh.fb={ph:Math.random()*6,sd:0,ox:0,oy:0,oz:0,sp:sh.v.length()||13,age:0});F.age+=dt;const m=sh.m,sp=F.sp;
  // undo last frame's weave offset → the missile's true path
  m.position.x-=F.ox;m.position.y-=F.oy;m.position.z-=F.oz;
  let e=sh.htg;if(!fxbOkT(e)||(sh.hit&&sh.hit.has(e))){const hx=sh.v.x/sp,hz=sh.v.z/sp;e=fxbPick(m.position,hx,hz,-.25,16);sh.htg=e}
  let hd=Math.atan2(sh.v.x,sh.v.z),L=3;
  if(e){const dx=e.m.position.x-m.position.x,dz=e.m.position.z-m.position.z;L=Math.hypot(dx,dz);let df=Math.atan2(dx,dz)-hd;df=Math.atan2(Math.sin(df),Math.cos(df));
    const w=(3.5+10*F.age)*(L<2.5?2:1)*dt;hd+=fxbClamp(df,-w,w);if(F.age<2.4)sh.t=Math.max(sh.t,.12);
    const ty=fxbH(e.m.position.x,e.m.position.z)+(e.boss?1.4:.9);m.position.y+=(ty-m.position.y)*Math.min(1,dt*4)}
  else m.position.y+=(fxbH(m.position.x,m.position.z)+1-m.position.y)*Math.min(1,dt*4);
  sh.v.set(Math.sin(hd)*sp,0,Math.cos(hd)*sp);
  // weave: each missile spirals around its own path, calmer close to the target so it still strikes
  const fade=Math.min(1,F.age*4)*fxbClamp((L-.9)/2.5,0,1),w1=Math.sin(F.ph+F.age*13)*.34*fade,w2=Math.cos(F.ph*1.3+F.age*10)*.22*fade;
  F.ox=Math.cos(hd)*w1;F.oz=-Math.sin(hd)*w1;F.oy=w2;m.position.x+=F.ox;m.position.y+=F.oy;m.position.z+=F.oz;
  m.lookAt(m.position.x+sh.v.x,m.position.y,m.position.z+sh.v.z);if(Math.random()<.5)burst(m.position,0xa070ff,1,.15,.2,.3)}
{const f=homeShot;homeShot=function(sh,dt){if(sh&&sh.s&&sh.s.fxb)return fxbSteer(sh,dt);return f.apply(this,arguments)}}
// a small arcane pop where a missile strikes
function fxbPop(p,col){const s=fxbSpr(col||0xc8a8ff,1.4,1);s.position.copy(p);scene.add(s);burst(p,0xf0e6ff,8,1.6,1.5,.35);tw(260,k=>{s.material.opacity=1-k;s.scale.setScalar(1.4+k*1.6)},()=>fxbRm(s))}
{const f=shotTick;shotTick=function(dt){let A=null;for(const sh of shots)if(sh.s&&sh.s.fxb)(A||(A=[])).push(sh);const r=f.apply(this,arguments);
  if(A)A.forEach(sh=>{if(!shots.includes(sh)&&sh.hit&&sh.hit.size)fxbPop(sh.m.position,sh.s.col)});return r}}
// co-op: visual-only missiles from a partner (no damage)
function fxbGhostMissiles(h,d){const P=h.position,n=3,T0=fxbPick(P,d.x,d.z,.1,15);
  for(let j=0;j<n;j++){const a=(j-1)*(T0?.55:.2),co=Math.cos(a),sn=Math.sin(a),m=fxbMisMesh(0xb08aff),sh={m,v:fxbV(d.x*co+d.z*sn,-d.x*sn+d.z*co).multiplyScalar(13),s:{fxb:1},htg:T0,hit:new Set(),t:1.1,fb:{ph:j*2.2,sd:j-1,ox:0,oy:0,oz:0,sp:13,age:0}};
    m.position.copy(gY(P,1)).addScaledVector(sh.v,.7/13);scene.add(m);
    kqsObj({life:2.6,tick:(dt,now,o)=>{fxbSteer(sh,dt);m.position.addScaledVector(sh.v,dt);sh.t-=dt;const e=sh.htg;
      if(e&&Math.hypot(e.m.position.x-m.position.x,e.m.position.z-m.position.z)<.75+(e.boss?1.2:0)){fxbPop(m.position);return false}if(sh.t<=0||solid(m.position.x,m.position.z))return false},end:()=>{if(m.parent)m.parent.remove(m)}})}}
// ---------------- co-op relay ----------------
function fxbSend(code,P,d,p,R){try{if(!fxbLive()||!MP.evq)return;const r=v=>Math.round(v*100)/100;MP.evq.push(['fxB',code,r(P.x),r(P.z),r(d.x),r(d.z),r(p.x),r(p.z),r(R||0)])}catch(_){}}
function fxbOnEV(msg){if(!MP.on||msg.sameTab)return;const dd=msg.data;if(!dd||!Array.isArray(dd.l))return;const rh=MP.rh[msg.peer];if(!rh||!rh.m)return;
  for(const q of dd.l.slice(0,60)){if(!Array.isArray(q)||q[0]!=='fxB'||typeof q[1]!=='string'||!/^(sw|jd|hl|am)$/.test(q[1]))continue;const n=q.slice(2,9).map(Number);if(n.some(v=>!isFinite(v)))continue;
    const P=fxbV(n[0],n[1]),d=fxbV(n[2],n[3]),p=fxbV(n[4],n[5]);if(d.lengthSq()<1e-4)continue;d.normalize();if(d2(P,pl.position)>70)continue;
    try{if(q[1]=='sw')fxbShock({P,d,h:rh.m});else if(q[1]=='jd')fxbJudg({P,d,fp:p,h:rh.m});else if(q[1]=='hl')fxbHammer({P,d,p,R:fxbClamp(n[6]||3,1,8),delay:.7,h:rh.m});else{try{if(typeof mpSwingRH=='function')mpSwingRH(rh.m)}catch(_){}fxbGhostMissiles(rh.m,d)}}catch(err){console.warn('fxB relay',err)}}}
{const f=mpOnEV;mpOnEV=function(msg){const r=f.apply(this,arguments);try{fxbOnEV(msg)}catch(err){console.warn(err)}return r}}
// debris ticks with the game
{const f=heroTick;heroTick=function(dt,now){const r=f.apply(this,arguments);try{if(dt>0&&FXB_DEB.length)fxbDebTick(dt)}catch(err){console.error(err)}return r}}
// ---------------- class resource bar ----------------
function resUI(){const R=CRES[hero.cls],b=$('resb');if(!R||!b)return;const v=Math.max(0,Math.min(100,+hero.cr||0));
  if(b._fxbC!==hero.cls){b._fxbC=hero.cls;b.style.setProperty('--rc',R.col);const ri=b.querySelector('.ri');if(ri)ri.textContent=R.i;
    b.title=R.n+': fills from basic attacks'+(R.hurt?' and taking hits':'')+'. At 50+ your next skill is empowered (up to ×1.5 damage and bigger area at 100).'}
  const fi=b.querySelector('.rbar > i');if(fi){const w=v.toFixed(1)+'%';if(fi.style.width!==w)fi.style.width=w}
  b.classList.toggle('rdy',v>=50);b.classList.toggle('full',v>=100);
  const rt=b.querySelector('.rt'),tx=R.pips?'●'.repeat(Math.floor(v/20))+'○'.repeat(5-Math.floor(v/20)):R.n+' '+Math.round(v);if(rt&&rt.textContent!==tx)rt.textContent=tx}
(function(){try{const st=document.createElement('style');st.id='fxbCss';st.textContent=
  '#resb .rbar>i{transition:width .22s ease-out;background:linear-gradient(180deg,color-mix(in srgb,var(--rc) 55%,#fff),var(--rc) 45%,color-mix(in srgb,var(--rc) 70%,#000));box-shadow:0 0 6px var(--rc)}';document.head.appendChild(st);
  const b=document.getElementById('resb');if(b){b.querySelectorAll('.ri i').forEach(i=>i.style.width='')}}catch(_){}})();

