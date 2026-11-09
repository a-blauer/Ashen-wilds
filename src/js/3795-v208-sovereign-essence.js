// ================= v208: a Sovereign's essence (owner, Nov 9 2026) =================
// "Instead of a portal opening after killing a sovereign, require the player to siphon the essence from its corpse. Once siphoned, a
// rift should open leading back to [Duskhold]. A player must deposit sovereign essence into the duskhold fountain, and only after that
// does duskhold upgrade and other unlocks for killing the sovereign unlock."
// Each Sovereign i goes through SE208.st[i]:
//   0  alive (or never met)
//   1  slain: the corpse stays where it fell (its fade is held back, see death135Fade below) with the essence rising from it as an
//      iridescent mist. F at it siphons the essence: ~3 s standing still (moving or F again stops it).
//      A player who was not there (a co-op partner's kill, 3086) or who reloaded before siphoning finds the essence lingering where
//      the Sovereign fell (SE208.p[i]) without the body.
//   2  carried: the body fades, the essence is held, and a rift tears open where the den's golden "Return home" portal used to stand
//      (that portal is never shown any more). F at the rift: straight to Duskhold, by the fountain.
//   3  poured: F at Duskhold's fountain pours the essence in, and only now does what the kill used to do happen (se208Claim, the old
//      first-kill block of bossDefeated): bossDone gets i, the Sovereign's power, "map cleared", the next portal and its entryway seal,
//      the kingdom's growth (kfGrow109), and everything else that counts bossDone (Steward upgrades, forge mastery, villagers' zones…).
//      se208St(i) reads 3 for every Sovereign in bossDone, so old saves and cheats are already "poured" (their dens show the rift).
// What still happens at the kill: the arena clears, loot, XP, the fanfare, Cheddar's boss counters and the Curio restock.
// A slain Sovereign does not come back while its essence waits (se208Gone, used by 3000's spawnBoss / sv141Clear).
// Saved as x2.se208 {st, p}. Co-op: each player siphons and pours their own essence (the progress it unlocks is the player's own, as
// bossDone always was); a partner's kill reaches you through 3086 as before and leaves the essence in the den for you. The siphon
// stream, the pour and the rift tearing open are relayed effects (MPV.FX), so a partner standing by sees them on your hero.
var SE208={v:208,st:{},p:{},mk:{},cor:{},rift:{},ch:null,T:3.0,sync:0,U:{t:{value:0},vh:{value:800}}};
function se208St(i){if(typeof bossDone!='undefined'&&bossDone.has(i))return 3;return (typeof SE208!='undefined'&&SE208.st[i])|0}
function se208Gone(i){return se208St(i)>=1}
function se208Col(i){const B=BOSSES[i];return B&&B.col!=null?B.col:0xc8b0ff}
// ---------------- the iridescent essence material (shared by the marker, the rift, the siphon and the fountain, 3796) ----------------
// thin-film colours that turn with the view angle and drift with a slow swirl, over a milky violet mist; `flow` scrolls a streaked
// pattern along the surface (falling sheets and streams), `op` its opacity, `glow` how much it brightens, `tint` a colour to lean to
var SE208_IRI={
  v:'uniform float t;varying vec3 vW;varying vec3 vN;varying vec2 vU;\n#include <fog_pars_vertex>\nvoid main(){vU=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
  f:'uniform float t,op,flow,glow,ax,strk;uniform vec3 tint;varying vec3 vW;varying vec3 vN;varying vec2 vU;\n#include <fog_pars_fragment>\n'+
    'vec3 pal(float h){return .55+.32*cos(6.2832*(h+vec3(0.,.33,.67)));}'+
    'float wv(vec3 p){return sin(p.x*1.7+t*.55)*sin(p.z*1.9-t*.47)+.5*sin((p.x+p.z)*3.1+p.y*1.3+t*1.25)+.25*sin(p.y*4.3-t*1.9);}'+
    'void main(){vec3 V=normalize(cameraPosition-vW);vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;float fr=1.-abs(dot(V,N));'+
    'float L=mix(vU.y,vU.x,ax),Wd=mix(vU.x,vU.y,ax);float n=wv(vW*.9);'+
    'float h=fr*.85+n*.16+t*.035+L*.6*strk;vec3 ir=pal(h);vec3 base=mix(vec3(.5,.47,.64),tint,.25);'+
    'vec3 c=mix(base,ir,.36+.34*fr)*(.76+.26*n)+ir*glow*.42+vec3(.95,.92,1.)*pow(fr,3.)*.22;'+
    'float a=op*(.62+.38*fr);'+
    'if(strk>0.){float q=L+t*flow;float s=.5+.5*sin(Wd*113.+sin(Wd*37.)*3.+sin(q*3.)*1.5);float m=.55+.45*sin(q*11.+Wd*41.);'+
    'a*=(.35+.65*smoothstep(.15,.95,s))*(.6+.4*m);c+=ir*.25*m;}'+
    'gl_FragColor=vec4(c,clamp(a,0.,1.));\n#include <fog_fragment>\n}'};
function se208Iri(o){o=o||{};const U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{op:{value:o.op==null?.8:o.op},flow:{value:o.flow||0},glow:{value:o.glow||0},
    ax:{value:o.ax||0},strk:{value:o.strk||0},tint:{value:new THREE.Color(o.tint==null?0xb8a8ff:o.tint)}}]);U.t=SE208.U.t;
  const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:SE208_IRI.v,fragmentShader:SE208_IRI.f,transparent:true,depthWrite:false,fog:true,side:o.side==null?THREE.DoubleSide:o.side,
    blending:o.add?THREE.AdditiveBlending:THREE.NormalBlending});m.userData.se208=1;m.userData.lps=1;m.userData.lpsSkip=1;return m}
// a rising iridescent mist (a points cloud animated wholly in the shader): N motes in a column of radius r, height h
var SE208_MIST={
  v:'uniform float t,vh,sz,h,r,up;attribute vec4 sd;varying float vA;varying vec3 vC;\n#include <fog_pars_vertex>\n'+
    'vec3 pal(float q){return .6+.4*cos(6.2832*(q+vec3(0.,.33,.67)));}'+
    'void main(){float l=fract(sd.z+t*sd.w);float a=sd.x+l*1.9*(sd.y>.5?1.:-1.);float rr=r*(.25+.75*sd.y)*(1.+l*up);'+
    'vec3 p=position+vec3(cos(a)*rr,l*h,sin(a)*rr);vec4 mvPosition=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mvPosition;'+
    'gl_PointSize=clamp(sz*(.55+l*.9)*projectionMatrix[1][1]*vh*.5/max(.1,-mvPosition.z),1.,90.);vA=sin(l*3.1416)*(.5+.5*sd.y);vC=pal(sd.x*.16+l*.5+t*.05);\n#include <fog_vertex>\n}',
  f:'uniform float op;varying float vA;varying vec3 vC;\n#include <fog_pars_fragment>\nvoid main(){vec2 q=gl_PointCoord-.5;float d=length(q);if(d>.5)discard;float s=smoothstep(.5,0.,d);'+
    'gl_FragColor=vec4(mix(vec3(.9,.88,1.),vC,.6+.3*s),op*vA*s*s);\n#include <fog_fragment>\n}'};
function se208Mist(n,o){o=o||{};const g=new THREE.BufferGeometry(),P=new Float32Array(n*3),S=new Float32Array(n*4),R=dkRng(o.seed||208);
  for(let i=0;i<n;i++){S[i*4]=R()*6.283;S[i*4+1]=R();S[i*4+2]=R();S[i*4+3]=(o.spd||.12)*(.6+.8*R());if(o.y)P[i*3+1]=o.y}
  g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('sd',new THREE.BufferAttribute(S,4));
  const U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{sz:{value:o.sz||.45},h:{value:o.h||2.5},r:{value:o.r||.8},up:{value:o.up==null?.6:o.up},op:{value:o.op||.5}}]);U.t=SE208.U.t;U.vh=SE208.U.vh;
  const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:SE208_MIST.v,fragmentShader:SE208_MIST.f,transparent:true,depthWrite:false,fog:true,blending:o.add?THREE.AdditiveBlending:THREE.NormalBlending});
  const p=new THREE.Points(g,m);p.frustumCulled=false;p.renderOrder=4;return p}
// a soft glowing disc on the ground
var SE208_GLOW=null;function se208GlowTex(){if(SE208_GLOW)return SE208_GLOW;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return SE208_GLOW=new THREE.CanvasTexture(c)}
function se208Disc(r,col,op){const m=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*2),new THREE.MeshBasicMaterial({map:se208GlowTex(),color:col,transparent:true,opacity:op==null?.5:op,depthWrite:false,blending:THREE.AdditiveBlending}));
  m.rotation.x=-Math.PI/2;m.renderOrder=3;return m}
// the v83 low-poly pass (0750) swaps round shapes for coarse ones: the essence's sheets, pools and orbs keep theirs
function se208Skip(g){g.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData.se208)o.userData.lpsSkip=1});return g}
function se208Free(g){if(!g)return;if(g.parent)g.parent.remove(g);g.traverse(o=>{if(o.geometry&&!o.geometry.userData.lps)o.geometry.dispose();if(o.material&&(o.material.userData.se208||o.material.isMeshBasicMaterial||o.material.isShaderMaterial))o.material.dispose()})}
// ---------------- 1. the kill: the corpse stays ----------------
function se208Slain(i,e){if(!BOSSES[i]||se208St(i)>=1)return;const A=ARN[i],B=BOSSES[i],m=e&&e.m;
  SE208.st[i]=1;SE208.p[i]=m?[m.position.x,m.position.z]:[A.cx,A.cz];if(m){m.userData.se208=i;SE208.cor[i]={e,g:m,done:null,held:0}}
  se208Mark(i);
  banner('👑 '+B.name.toUpperCase()+' IS SLAIN',m?'Siphon its essence from the corpse':'Its essence lingers in its den, where it fell','Then pour it into the fountain of Duskhold to claim the zone');
  setTimeout(()=>say('✨ '+B.name+'’s essence rises from '+(m?'its corpse':'where it fell')+'. Stand by it and press F to siphon it.'),2600);
  try{hud()}catch(_){}try{saveGame(true)}catch(_){}}
// the corpse's fade waits for the siphon (kill_base calls death135Fade ~1.5 s after the fall)
{const f=death135Fade;death135Fade=function(g,done){const i=g&&g.userData?g.userData.se208:null;
  if(i!=null&&se208St(i)===1){const C=SE208.cor[i];if(C&&C.g===g&&!C.held){C.done=done;C.held=1;return}}
  return f.apply(this,arguments)}}
function se208Fade(i){const C=SE208.cor[i];delete SE208.cor[i];if(!C)return;try{if(C.held&&C.g&&C.g.parent)death135Fade(C.g,C.done);else if(C.held&&C.done)C.done()}catch(err){console.warn('v208 fade',err)}}
// ---------------- the essence over the corpse ----------------
function se208Mark(i){if(SE208.mk[i]||se208St(i)!==1)return;const p=SE208.p[i];if(!p)return;const x=p[0],z=p[1],y=GH(x,z),col=se208Col(i),g=new THREE.Group();
  g.position.set(x,y,z);g.name='se208mark';g.userData.psNo=1;
  const d=se208Disc(3.2,col,.32);d.position.y=.08;g.add(d);
  const d2=se208Disc(1.6,0xe8e0ff,.4);d2.position.y=.1;g.add(d2);
  const ms=se208Mist(70,{r:1.5,h:4.2,sz:.55,op:.55,spd:.1,seed:31+i,up:.4});g.add(ms);
  const sp=se208Mist(26,{r:.9,h:5.2,sz:.22,op:.9,spd:.2,seed:57+i,add:1,up:.1});g.add(sp);
  const w=new THREE.Mesh(new THREE.IcosahedronGeometry(.32,2),se208Iri({op:.9,glow:1.1,tint:col}));w.position.y=2.4;g.add(w);
  const w2=new THREE.Mesh(new THREE.IcosahedronGeometry(.55,1),se208Iri({op:.25,glow:.6,tint:col,add:1}));w2.position.y=2.4;g.add(w2);
  scene.add(se208Skip(g));SE208.mk[i]={g,w,w2,x,z,y}}
function se208Unmark(i){const M=SE208.mk[i];if(!M)return;delete SE208.mk[i];se208Free(M.g)}
// ---------------- 2. the siphon ----------------
function se208Near(i,r){const M=SE208.mk[i];if(!M)return false;return Math.hypot(pl.position.x-M.x,pl.position.z-M.z)<(r||4.6)}
function se208Begin(i){if(SE208.ch||se208St(i)!==1||(typeof AF!='undefined'&&AF))return;const M=SE208.mk[i];if(!M)return;
  if(typeof riding!='undefined'&&riding)try{dismount()}catch(_){}
  SE208.ch={i,t:0,x:pl.position.x,z:pl.position.z};try{face(new THREE.Vector3(M.x-pl.position.x,0,M.z-pl.position.z).normalize())}catch(_){}
  try{kqsPose('raise',SE208.T*1000)}catch(_){}try{sfx('siphon')}catch(_){}
  try{se208FxRun(se208Stream,[M.x,M.y+2.4,M.z,pl.position.x,GH(pl.position.x,pl.position.z)+1.2,pl.position.z,se208Col(i),SE208.T,0])}catch(err){console.warn('v208 stream',err)}}
function se208Stop(why){const C=SE208.ch;if(!C)return;SE208.ch=null;if(why)say(why);try{SE208.fx&&SE208.fx.forEach(o=>o.stop=1)}catch(_){}}
function se208Tick(dt){const C=SE208.ch;if(!C)return;
  if(Math.hypot(pl.position.x-C.x,pl.position.z-C.z)>.55||!(hero.hp>0)||(typeof AF!='undefined'&&AF)){se208Stop('✨ The essence slips back into the corpse. Stand still to siphon it.');return}
  C.t+=dt;if(C.t>=SE208.T){SE208.ch=null;se208Done(C.i)}}
function se208Done(i){if(se208St(i)!==1)return;const M=SE208.mk[i],B=BOSSES[i];SE208.st[i]=2;se208Fade(i);
  if(M)try{burst(new THREE.Vector3(M.x,M.y+2.4,M.z),se208Col(i),40,2.4,2,.8);burst(gY(pl.position,1.2),0xe8e0ff,30,1.6,1.6,.7)}catch(_){}
  se208Unmark(i);try{sfx('essence')}catch(_){}
  setTimeout(()=>{const R=se208RiftSpot(i);if(R)try{se208FxRun(se208RiftFx,[R.x,R.y,R.z,se208Col(i)]);sfx('rift')}catch(_){}se208Rift(i);SE208.rift[i]&&(SE208.rift[i].k=0)},900);
  banner('✨ ESSENCE SIPHONED',B.name+'’s essence is yours','A rift tears open: it leads home to Duskhold');
  setTimeout(()=>say('🌀 Step through the rift and pour the essence into the fountain of Duskhold to claim '+PMAP[i].n+'.'),2400);
  try{hud()}catch(_){}try{saveGame(true)}catch(_){}}
// ---------------- the rift (where the den's golden portal home used to stand) ----------------
function se208RiftSpot(i){const r=typeof RPORT!='undefined'&&RPORT.find(q=>q.k=='exit'&&q.pi===i);const A=ARN[i];let x,z;if(r){x=r.x;z=r.z}else{const p=PMAP[i];x=p.ba[0];z=p.ba[1]+10}
  return {x,z,y:GH(x,z),ry:A?Math.atan2(A.cx-x,A.cz-z):0}}
var SE208_RIFT={
  v:'varying vec2 vU;\n#include <fog_pars_vertex>\nvoid main(){vU=uv;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
  f:'uniform float t,k;uniform vec3 tint;varying vec2 vU;\n#include <fog_pars_fragment>\n'+
    'vec3 pal(float h){return .56+.44*cos(6.2832*(h+vec3(0.,.33,.67)));}'+
    'void main(){float y=vU.y,x=vU.x*2.-1.;if(k<.002)discard;'+
    // the tear: widest a little below the middle, jagged edges that flicker
    'float w=pow(max(0.,sin(3.1416*clamp((y-.5)/max(.05,k)+.5,0.,1.))),.75)*.62*k;'+
    'w*=.78+.22*abs(fract(y*6.3+sin(y*17.+t*.7)*.25)-.5)*2.+.06*sin(y*40.+t*5.);'+
    'float d=abs(x+.06*sin(y*9.+t*.8))/max(.001,w);if(d>1.25)discard;'+
    'float sw=sin(y*14.-t*2.4+x*6.)*.5+.5,s2=sin(y*31.+t*1.7-x*11.)*.5+.5;vec3 ir=pal(y*.8+t*.06+x*.3+sw*.2);'+
    'vec3 c=mix(vec3(.03,.02,.06),ir*.75,smoothstep(.2,.95,d)*.6+sw*s2*.35*(1.-d));c=mix(c,tint,.12);'+
    'float rim=smoothstep(.72,1.,d)*smoothstep(1.25,1.,d);c+=mix(vec3(1.,.95,1.),ir,.4)*rim*1.6;'+
    'float a=d<1.?.94:rim;gl_FragColor=vec4(c,a);\n#include <fog_fragment>\n}'};
function se208Rift(i){if(SE208.rift[i]||se208St(i)<2)return SE208.rift[i];const R=se208RiftSpot(i),col=se208Col(i),g=new THREE.Group();g.name='se208rift';g.userData.psNo=1;
  g.position.set(R.x,R.y,R.z);g.rotation.y=R.ry;
  const U=THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{k:{value:1},tint:{value:new THREE.Color(col)}}]);U.t=SE208.U.t;
  const M=new THREE.ShaderMaterial({uniforms:U,vertexShader:SE208_RIFT.v,fragmentShader:SE208_RIFT.f,transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:true});M.userData.se208=M.userData.lps=M.userData.lpsSkip=1;
  const pl0=new THREE.Mesh(new THREE.PlaneGeometry(3.2,5),M);pl0.position.y=2.65;pl0.renderOrder=4;g.add(pl0);
  const d=se208Disc(2.6,col,.35);d.position.y=.08;g.add(d);const d2=se208Disc(1.4,0xe8e0ff,.35);d2.position.y=.1;g.add(d2);
  const ms=se208Mist(40,{r:1.1,h:4.6,sz:.4,op:.45,spd:.09,seed:91+i,up:.8});g.add(ms);
  // shards of the torn world drifting round the tear
  const sg=new THREE.OctahedronGeometry(1,0),sm=new THREE.MeshStandardMaterial({color:0x2a2434,roughness:.6,metalness:.2,emissive:col,emissiveIntensity:.25,flatShading:true}),sh=[],r=dkRng(400+i);
  for(let q=0;q<9;q++){const o=new THREE.Mesh(sg,sm);const s=.07+r()*.13;o.scale.set(s,s*(1.2+r()),s);o.userData.a=r()*6.283;o.userData.r=1.1+r()*.9;o.userData.y=.8+r()*3.6;o.userData.sp=(.25+r()*.35)*(r()<.5?-1:1);g.add(o);sh.push(o)}
  scene.add(se208Skip(g));return SE208.rift[i]={g,M,U,sh,sm,sg,k:1,x:R.x,z:R.z,y:R.y}}
function se208Unrift(i){const Q=SE208.rift[i];if(!Q)return;delete SE208.rift[i];try{Q.sg.dispose();Q.sm.dispose()}catch(_){}se208Free(Q.g)}
function se208RiftAt(){for(const k in SE208.rift){const Q=SE208.rift[k];if(Q.g.visible&&Math.hypot(pl.position.x-Q.x,pl.position.z-Q.z)<2.6)return +k}return -1}
function se208Home(){if(typeof WV!='undefined'&&WV)try{waveEnd(false,true)}catch(_){}const T=TOWNS[0],a=T.sp,face=Math.atan2(T.cx-a[0],T.cy-a[1])+Math.PI;
  fadeTo(()=>{toPos(a[0],a[1],face);try{home=T}catch(_){}const n=Object.keys(SE208.st).filter(k=>SE208.st[k]===2).length;
    say(n?'🌀 The rift sets you down in Duskhold. Pour the essence into the fountain (F at the fountain).':'🌀 The rift sets you down in Duskhold.')})}
// no golden portal home in the dens any more: the rift takes its place
rportRefresh=function(){try{RPORT.forEach(r=>{if(r.k=='exit')r.g.visible=false})}catch(_){}try{se208Sync(true)}catch(_){}};
try{RPORT.forEach(r=>{if(r.k=='exit')r.g.visible=false})}catch(_){}
// ---------------- 3. the fountain ----------------
function se208Held(){const L=[];for(const k in SE208.st)if(SE208.st[k]===2&&!bossDone.has(+k))L.push(+k);return L.sort((a,b)=>a-b)}
function se208AtFountain(){const T=TOWNS[0];return Math.hypot(pl.position.x-T.cx,pl.position.z-T.cy)<3.9}
function se208Pour(i){if(se208St(i)!==2||SE208.pour)return;const T=TOWNS[0],B=BOSSES[i];SE208.pour=1;
  try{face(new THREE.Vector3(T.cx-pl.position.x,0,T.cy-pl.position.z).normalize())}catch(_){}try{kqsPose('cast',900)}catch(_){}try{sfx('pour')}catch(_){}
  try{se208FxRun(se208Stream,[pl.position.x,GH(pl.position.x,pl.position.z)+1.3,pl.position.z,T.cx,GH(T.cx,T.cy)+2.95,T.cy,se208Col(i),1.1,1])}catch(err){console.warn('v208 pour',err)}
  setTimeout(()=>{SE208.pour=0;try{if(typeof ftn208Flare=='function')ftn208Flare(se208Col(i))}catch(_){}se208Claim(i)},1150)}
// what the first kill used to do (0510 bossDefeated before v208)
function se208Claim(i){if(!BOSSES[i]||bossDone.has(i))return;const B=BOSSES[i],A=ARN[i],P=B.pw;delete SE208.st[i];delete SE208.p[i];
  bossDone.add(i);hero.buffs=hero.buffs.filter(b=>!(b.perm&&b.n==P.n));hero.buffs.push({s:P.s,t:Infinity,n:P.n,i:P.i,d:P.d,perm:1});hsDirty();
  banner('👑 MAP CLEARED',B.name+'’s essence joins the fountain','Power gained: '+P.i+' '+P.n+' ('+P.d+')');portalRefresh();rportRefresh();
  try{MU.hold=nowP()+7000}catch(_){}try{sfx('essence')}catch(_){}
  setTimeout(()=>{if(i<PMAP.length-1)banner('🌀 A NEW PORTAL OPENS',PMAP[i+1].n+' awaits beyond its entryway','The seal on its portal room has broken');else banner('🏆 THE CITADEL HAS FALLEN','Every portal is cleared','Thank you for playing!')},2800);
  try{kfGrow109()}catch(err){console.warn('v208 grow',err)}
  try{if(typeof ftn208Sync=='function')ftn208Sync()}catch(_){}
  try{hud();ui()}catch(_){}try{saveGame(true)}catch(_){}}
// effects started from a prompt (not a cast) are recorded for partners only inside mpvRun (2170: MPV.cap)
function se208FxRun(f,a){return typeof mpvRun=='function'?mpvRun(f,null,a):f.apply(null,a)}
// ---------------- relayed effects (co-op partners replay them with the same plain arguments) ----------------
// a stream of iridescent motes from a to b over `dur` s (rev: a quick pour that ends in a splash at b)
var SE208_DOT=null;
function se208Stream(ax,ay,az,bx,by,bz,col,dur,rev){dur=Math.max(.3,Math.min(4,+dur||1));const N=48,G=new THREE.BufferGeometry(),P=new Float32Array(N*3),Cc=new Float32Array(N*3);
  G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('color',new THREE.BufferAttribute(Cc,3));
  const M=new THREE.PointsMaterial({size:.32,map:se208GlowTex(),vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.95});
  const pt=new THREE.Points(G,M);pt.frustumCulled=false;pt.renderOrder=6;scene.add(pt);
  const a=new THREE.Vector3(ax,ay,az),b=new THREE.Vector3(bx,by,bz),mid=a.clone().lerp(b,.5);mid.y+=Math.min(2.4,a.distanceTo(b)*.35+.6);
  const R=dkRng(Math.floor((ax+az)*13)&1023),sd=[];for(let q=0;q<N;q++)sd.push([R(),R()*6.283,.15+R()*.4]);const c=new THREE.Color(),c0=new THREE.Color(col);let t=0;
  const o={stop:0,tick(dt){t+=dt||0;const k=t/dur;
      for(let q=0;q<N;q++){const s=sd[q],u=((rev?k*1.6:k*1.3)+s[0])%1,live=rev?(s[0]<k*1.4&&s[0]>k*1.4-1):(k<1.05),w=1-u;
        const x=w*w*a.x+2*w*u*mid.x+u*u*b.x,y=w*w*a.y+2*w*u*mid.y+u*u*b.y,z=w*w*a.z+2*w*u*mid.z+u*u*b.z,sw=Math.sin(u*Math.PI)*s[2];
        P[q*3]=x+Math.cos(s[1]+t*4)*sw;P[q*3+1]=live&&!o.stop?y+Math.sin(s[1]+t*3)*sw*.6:-9999;P[q*3+2]=z+Math.sin(s[1]+t*4)*sw;
        c.setHSL((s[0]*.6+u*.4+t*.15)%1,.55,.78).lerp(c0,.25);Cc[q*3]=c.r;Cc[q*3+1]=c.g;Cc[q*3+2]=c.b}
      G.attributes.position.needsUpdate=true;G.attributes.color.needsUpdate=true;M.opacity=.95*Math.min(1,(dur+.35-t)/.35);
      return t<dur+.35&&!(o.stop&&t>.1)},
    end(){scene.remove(pt);G.dispose();M.dispose();if(rev)try{burst(b,col,46,2.2,2.6,.9);burst(b,0xe8e0ff,30,1.6,2,.7);ring(new THREE.Vector3(bx,by-2.3,bz),col,4,500)}catch(_){}
      const j=(SE208.fx||[]).indexOf(o);if(j>=0)SE208.fx.splice(j,1)}};
  (SE208.fx=SE208.fx||[]).push(o);kqFx(o)}
function se208RiftFx(x,y,z,col){const p=new THREE.Vector3(x,y,z);try{burst(gY(p,2.4),col,70,3.2,3,1);burst(gY(p,2.4),0xe8e0ff,40,2.4,2.4,.8);ring(p,col,5,520);kqFlash(gY(p,2.4),0xe8e0ff,5,320);shake(.18)}catch(_){}
  try{if(typeof svShock=='function')svShock(p,col,6,.6)}catch(_){}}
(function(){if(typeof MPV=='undefined'||!MPV.FX)return;
  ['se208Stream','se208RiftFx'].forEach(n=>{const f=window[n];if(typeof f!='function'||MPV_FX[n]!=null)return;MPV_FX[n]=MPV.FX.length;MPV.FX.push(n);
    window[n]=function(){if(!MPV.cap||MPV.dep||MPV.rep||!mpvLive())return f.apply(this,arguments);
      let a=null;try{a=Array.prototype.map.call(arguments,x=>mpvSer(x,0))}catch(_){a=null}
      if(a)mpvPush(['V',MPV_FX[n],mpvR(pl.position.x),mpvR(pl.position.y),mpvR(pl.position.z),mpvR(pl.rotation.y),a]);
      MPV.dep++;try{return f.apply(this,arguments)}finally{MPV.dep--}}})})();
// ---------------- prompts ----------------
{const f=worldPrompt;worldPrompt=function(){try{if(!SE208.ch)for(const k in SE208.mk){const i=+k;if(se208St(i)===1&&se208Near(i))return {label:'F · Siphon '+BOSSES[i].name+'’s essence',fn:()=>se208Begin(i)}}
    const r=se208RiftAt();if(r>=0)return {label:'F · Step through the rift to Duskhold',fn:()=>se208Home()}}catch(err){console.warn('v208 prompt',err)}return f.apply(this,arguments)}}
{const f=townPortalPrompt;townPortalPrompt=function(T){try{if(T&&T===TOWNS[0]&&!SE208.pour&&se208AtFountain()){const H=se208Held();
      if(H.length){const i=H[0];return {label:'F · Pour '+BOSSES[i].name+'’s essence into the fountain'+(H.length>1?' ('+H.length+' held)':''),fn:()=>se208Pour(i)}}}}catch(err){console.warn('v208 fountain prompt',err)}
  return f.apply(this,arguments)}}
// the siphon's progress takes the prompt while it runs (like gathering)
{const f=promptTick;promptTick=function(){const r=f.apply(this,arguments);try{const C=SE208.ch;if(C){PR={label:'✨ Siphoning '+BOSSES[C.i].name+'’s essence… '+Math.min(99,Math.round(100*C.t/SE208.T))+'%',fn:()=>se208Stop()};
      const b=$('prompt');if(b){b.classList.toggle('hide',uiOpen());b.textContent=PR.label}}}catch(_){}return r}}
// ---------------- tracker (the main-quest box under the map) ----------------
SP152.trk=Object.assign({se208:I=>{if(!I||!I.den)return null;const i=I.z,s=se208St(i);if(s===1)return {name:BOSSES[i].name+'’s Essence',lines:[['Siphon the essence from where it fell']]};
    if(s===2)return {name:BOSSES[i].name+'’s Essence',lines:[['Step through the rift to Duskhold'],['Pour the essence into the fountain']]};return null}},SP152.trk);
{const f=sp152Trk;sp152Trk=function(){let I=null;try{I=curIns()}catch(_){}const H=I?[]:se208Held();if(I||!H.length)return f.apply(this,arguments);
  const el=$('mqt152');if(!el)return;const out=uiOpen()?null:{name:H.length>1?'Sovereign Essences':BOSSES[H[0]].name+'’s Essence',lines:[[H.length>1?'Pour '+H.length+' essences into the fountain':'Pour the essence into the fountain of Duskhold']]};
  const key=out?JSON.stringify(out):'h';if(key===SP152.tk)return;SP152.tk=key;if(!out){el.classList.add('hide');sp152TrkPos();return}
  el.innerHTML='<div class="k">⚜ Main quest</div><div class="h">'+out.name+'</div>'+out.lines.map(q=>'<div class="o"><span>'+q[0]+'</span></div>').join('');el.classList.remove('hide');sp152TrkPos()}}
// the J window says where each essence is
{const f=XR.bosses;XR.bosses=function(){const r=f.apply(this,arguments);try{const L=BOSSES.map((B,i)=>{const s=se208St(i);return s===1?'✨ '+B.name+'’s essence waits in its den: siphon it.':s===2?'✨ You carry '+B.name+'’s essence: pour it into the fountain of Duskhold.':''}).filter(Boolean);
    if(L.length)$('xwF').insertAdjacentHTML('afterbegin','<div class="mut dtl" style="color:#d8c8ff;margin-bottom:4px">'+L.join('<br>')+'</div>')}catch(_){}return r}}
// ---------------- per frame ----------------
function se208Sync(force){for(const k in SE208.mk)if(se208St(+k)!==1)se208Unmark(+k);for(const k in SE208.rift)if(se208St(+k)<2)se208Unrift(+k);
  BOSSES.forEach((B,i)=>{const s=se208St(i);if(s===1&&!SE208.mk[i]&&SE208.p[i])se208Mark(i);
    if(s>=2&&!SE208.rift[i]){const R=se208RiftSpot(i);if(force===true&&s===2||Math.hypot(pl.position.x-R.x,pl.position.z-R.z)<80)se208Rift(i)}})}
{const f=homeTick;homeTick=function(dt,now){const r=f.apply(this,arguments);try{const t=performance.now()/1000;SE208.U.t.value=t%1000;
    try{SE208.U.vh.value=(typeof ren!='undefined'&&ren.domElement)?ren.domElement.height:innerHeight}catch(_){}
    se208Tick(dt||0);if((SE208.sync-=dt||0)<=0){SE208.sync=1;se208Sync()}
    for(const k in SE208.mk){const M=SE208.mk[k],b=Math.sin(t*1.6+(+k))*.14;M.w.position.y=M.w2.position.y=2.4+b;M.w.rotation.y=t*.7;M.w2.scale.setScalar(1+.12*Math.sin(t*2.3))}
    for(const k in SE208.rift){const Q=SE208.rift[k];if(Q.k<1){Q.k=Math.min(1,Q.k+(dt||0)*.8);}Q.U.k.value=Q.k*(.97+.03*Math.sin(t*3.1));
      if(Math.hypot(pl.position.x-Q.x,pl.position.z-Q.z)<60)Q.sh.forEach(o=>{const u=o.userData,a=u.a+t*u.sp;o.position.set(Math.cos(a)*u.r,u.y+Math.sin(t*.8+u.a)*.25,Math.sin(a)*u.r*.6);o.rotation.set(t*u.sp,t*.5+u.a,0)})}}
  catch(err){if(!SE208.err){SE208.err=1;console.warn('v208 tick',err)}}return r}}
// ---------------- save / load ----------------
function se208Reset(){SE208.ch=null;SE208.pour=0;Object.keys(SE208.mk).forEach(k=>se208Unmark(+k));Object.keys(SE208.rift).forEach(k=>se208Unrift(+k));SE208.cor={};SE208.st={};SE208.p={}}
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{const st={},p={};for(const k in SE208.st){const v=SE208.st[k]|0;if(v>=1&&v<=2&&!bossDone.has(+k)){st[k]=v;if(SE208.p[k])p[k]=SE208.p[k].map(q=>+(+q).toFixed(2))}}
    o.se208={v:208,st,p}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const C=SE208.cor;se208Reset();const q=s&&s.se208;
    if(q&&q.st&&typeof q.st=='object')for(const k in q.st){const i=+k,v=q.st[k]|0;if(!BOSSES[i]||bossDone.has(i)||v<1||v>2)continue;SE208.st[i]=v;const p=q.p&&q.p[k];
      SE208.p[i]=Array.isArray(p)&&isFinite(+p[0])&&isFinite(+p[1])?[+p[0],+p[1]]:[ARN[i].cx,ARN[i].cz]}
    for(const k in C){const c=C[k];if(c&&c.held&&c.done)try{c.done()}catch(_){}}   // a body held from before the load goes
    se208Sync()}catch(err){console.warn('v208 load',err)}return r}}
