// ================= v219: the Sandskimmer rebuilt where it was broken, and a Sandstorm Run that plays well (owner, Nov 10 2026) =================
// Owner: "The wind turbine in the sandskimmer is malformed. Fix gun model on the sandskimmer- it has floating pieces. Do an overall
// check on the sandskimmer model. The enemies ran too fast and boarded too quickly- think of a better way for the pacing and combat
// so it feels engaging. Make it more obvious when the sandskimmer is getting damaged. Sandskimmers health is also being covered by
// the tab target ui. Shooting and aiming in the sandskimmer feels awful. Make the camera fixed and more zoomed in so it doesn't
// collide with terrain."
// ---------------- the model (3291 sk165Build) ----------------
//  * The Great Turbine: its cowl was an open, one-sided tube (with a second tube turned inside out for the lining), so from most
//    sides half of it was missing; it sat so low that its lower third cut through the stern deck; its two support struts and post
//    stood under where it used to be. Now the turbine is raised onto the deck (SKM218.up) and its duct is one solid turned shell
//    (thick lip at the intake, tapering to the exhaust), brass rims at both ends, a saddle and four struts from the deck to the
//    duct, the rear grille's spokes running from a hub ring to the duct's wall, fan blades that fit inside the duct.
//  * The Twin Cannons: the curved shield stood clear of the turret plate (a gap under it) and its brass rim hung in the air above
//    and to one side; the shield now stands on the plate, its rim follows its top edge.
//  * The pennant mast stood where the raised duct now is: it moves forward of the turbine and stands taller, the pennant above it.
//  * The rest was checked from eight sides (pictures: test/v219_skimmer.py): hull, ram, runners, helm, deck clutter and mast are
//    joined.
var SKM218={on:true,up:.55,keys:['skcowl','skcowli','skshld','skshld2','skblade']};
function skm218Strip(R){const G=SKM218.keys.map(k=>SVX.gc[k]).filter(Boolean);const rm=[];R.root.traverse(o=>{if(o.isMesh&&G.includes(o.geometry))rm.push(o)});
  // the turbine's old struts, post, grille bars, rims and side blocks: every mesh hung straight on the turbine's joint
  R.J.pTurb.children.forEach(o=>{if(o.isMesh)rm.push(o)});rm.forEach(o=>{if(o.parent)o.parent.remove(o)})}
{const f=sk165Build;sk165Build=function(R){f.apply(this,arguments);if(!SKM218.on)return;try{skm218Strip(R);skm218Turbine(R);skm218Shield(R);skm218Mast(R)}catch(e){console.warn('v219 skimmer model',e)}}}
function skm218Turbine(R){const up=SKM218.up,brass=svMat(R,0xc89a40,{roughness:.32,metalness:.8,side:THREE.DoubleSide}),iron=svMat(R,0x45454c,{roughness:.55,metalness:.6}),dark=svMat(R,0x24221f,{roughness:.7,metalness:.3,side:THREE.DoubleSide}),wood2=svMat(R,0x5e3e22,{roughness:.9});
  const Cy=1.95+up,Cz=-3.05,M=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz),G=(k,f)=>svG('sk218'+k,f);
  R.J.fan.position.y+=up;R.J.jet.position.y+=up;
  // the duct: one closed turned profile (r, z): intake lip, outer wall, exhaust, inner wall
  M('pTurb',G('duct',()=>{const P=[[.97,.8],[1.06,.86],[1.17,.8],[1.17,.62],[1.13,0],[1.08,-.7],[1.1,-.8],[.99,-.8],[.95,-.7],[.95,.6]].map(q=>new THREE.Vector2(q[0],q[1]));P.push(P[0].clone());
    const g=new THREE.LatheGeometry(P,22);g.rotateX(Math.PI/2);g.computeVertexNormals();return g}),brass,0,Cy,Cz);
  M('pTurb',G('lin',()=>{const g=new THREE.CylinderGeometry(.94,.94,1.4,22,1,true);g.rotateX(Math.PI/2);return g}),dark,0,Cy,Cz);
  [[.83,1.12,brass],[-.83,1.08,iron]].forEach(([dz,r,m],k)=>M('pTurb',G('rim'+k,()=>new THREE.TorusGeometry(r,.06,6,22)),m,0,Cy,Cz+dz));
  // the saddle on the deck and four struts up to the duct
  M('pTurb',G('sad',()=>new THREE.BoxGeometry(1.0,.26,1.3)),wood2,0,1.48,Cz+.05);M('pTurb',G('sad2',()=>new THREE.BoxGeometry(1.1,.06,1.4)),iron,0,1.62,Cz+.05);
  [-1,1].forEach(s=>[-2.6,-3.15].forEach(z=>{M('pTurb',svTube([[s*.62,1.42,z],[s*.9,1.75,z-.05],[s*1.08,Cy-.25,z-.08]],.055,5),iron);M('pTurb',G('bolt',()=>new THREE.SphereGeometry(.07,6,4)),brass,s*1.08,Cy-.25,z-.08)}));
  // the rear grille: a hub ring and spokes out to the duct's wall
  M('pTurb',G('hr',()=>new THREE.TorusGeometry(.2,.04,5,12)),iron,0,Cy,Cz-.8);
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2;M('pTurb',G('sp',()=>{const g=new THREE.BoxGeometry(.05,.76,.05);g.translate(0,.58,0);return g}),iron,0,Cy,Cz-.8,0,0,a)}
  // fan blades that fit inside the duct (hub .2 to tip .9)
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2;M('fan',G('bl',()=>{const g=new THREE.BoxGeometry(.2,.72,.035);g.translate(0,.54,0);return g}),k%2?brass:iron,0,0,0,0,.45,a)}}
function skm218Shield(R){const iron=svMat(R,0x45454c,{roughness:.55,metalness:.6,side:THREE.DoubleSide}),brass=svMat(R,0xc89a40,{roughness:.32,metalness:.8});
  // the curved shield: an arc in front of the guns, standing on the turret plate (its top .07), .95 tall
  svM(R,'turret',svG('sk218shd',()=>{const g=new THREE.CylinderGeometry(.85,.85,.95,10,1,true,-.75,1.5);g.scale(1,1,.7);return g}),iron,0,.545,.05);
  const pts=[];for(let i=0;i<=8;i++){const t=-.75+i/8*1.5;pts.push([.85*Math.sin(t),1.02,.05+.85*.7*Math.cos(t)])}svM(R,'turret',svTube(pts,.035,4),brass);
  [-1,1].forEach(s=>svM(R,'turret',svG('sk218sb',()=>new THREE.BoxGeometry(.08,.95,.08)),brass,.85*Math.sin(s*.75),.545,.05+.85*.7*Math.cos(.75)))}
function skm218Mast(R){const g=SVX.gc.skcy6;R.J.body.children.forEach(o=>{if(o.isMesh&&o.geometry===g&&Math.abs(o.position.z+2.2)<.01&&Math.abs(o.position.y-2.3)<.01){o.position.set(0,2.75,-1.72);o.scale.y=2.8}});
  R.J.sail.position.set(0,4.05,-1.72)}
// ---------------- the Run (3301 / 3302) ----------------
//  * Scarabs (SKR218): they used to sprint at the hull ~5 faster than the Skimmer (up to 20) and cling the moment they touched it,
//    6 at a time. Now a swarm runs up at a little over the Skimmer's cruising pace (SKR218.run: so boosting leaves them behind),
//    then each one paces alongside the hull for 1.4–2.3 s, glowing red over its back (the warning, and the moment to shoot it),
//    before it leaps aboard in a short arc; at most two pace on each side and four cling at once; a third fewer are sent.
//  * Damage you can see and feel: a red flash round the screen's edge with every hit (stronger for bigger ones) and a steady red
//    pulse while scarabs gnaw the hull; the hull flashes red; the hull bar shakes and flashes, says how many cling on; the machine
//    smokes below half its hull and burns below a quarter.
//  * The hull bar: the target frame (tab target) sat over it; it is hidden while riding (the guns aim on their own).
//  * The camera (SKR218.cam): fixed behind and above the Skimmer, closer than before, following its heading with no lag and no mouse
//    turning; it never dips into the ground (a floor over the terrain under it).
//  * Aiming: the cursor is traced to the real ground (it hit a flat plane at deck height, so on dunes the shells flew short or
//    long); a ring on the sand shows where the guns point, red when locked on a creature (the lock reaches a little further).
// Co-op: the scarabs are the host's (their positions reach partners as before); the red warning glow is worked out on every screen
// from where a scarab runs (beside a machine, not clinging), so partners see it too; camera, aim ring and damage flashes are each
// player's own view of their own machine.
var SKR218={on:true,run:2.5,runMax:17,paceMax:18,side:4.2,pace:[1.4,2.3],leap:.45,cling:4,perSide:2,skip:3,n:0,
  cam:{d:7.4,h:4.1,ahead:6,ly:1.4,floor:1.6},fl:0,shk:0,lastHp:null,dom:null,ret:null,glow:new Map(),err:0};
// a third fewer scarabs
{const f=sr165Foe;sr165Foe=function(k,x,z,kind){if(SKR218.on&&kind==='sc'&&(++SKR218.n%SKR218.skip)===0)return null;return f.apply(this,arguments)}}
function skr218Near(p){return sr165Near(p)}
function skr218Scarab(e,dt,now){const m=e.m,[V]=skr218Near(m.position);if(!V)return false;const fx=Math.sin(V.h),fz=Math.cos(V.h),lx=fz,lz=-fx;
  if(!e.k218){const rx=m.position.x-V.x,rz=m.position.z-V.z;e.k218={st:'run',t:0,side:(rx*lx+rz*lz)>=0?1:-1,f:(Math.random()*2-1)*1.8}}
  const K=e.k218;K.t+=dt;
  const pacing=s=>enemies.filter(o=>o!==e&&o.k218&&o.k218.st!=='run'&&o.k218.side===s&&!o.dead).length;
  const tx=V.x+fx*(K.f+Math.max(0,V.v)*.08)+lx*K.side*SKR218.side,tz=V.z+fz*(K.f+Math.max(0,V.v)*.08)+lz*K.side*SKR218.side,dx=tx-m.position.x,dz=tz-m.position.z,L=Math.hypot(dx,dz)||1;
  if(K.st==='run'||K.st==='pace'){const lim=K.st==='pace'?SKR218.paceMax:Math.min(SKR218.runMax,Math.max(6,Math.max(0,V.v)+SKR218.run)),st=Math.min(L,lim*dt);
    m.position.x+=dx/L*st+(e.vx||0)*dt;m.position.z+=dz/L*st+(e.vz||0)*dt;e.vx=(e.vx||0)*.9;e.vz=(e.vz||0)*.9;m.position.y=GH(m.position.x,m.position.z);
    m.rotation.y=L>.3?Math.atan2(dx,dz):V.h;animC(m,now,true,Math.max(4,lim)*.4);
    if(K.st==='run'&&L<1.8){if(pacing(K.side)<SKR218.perSide){K.st='pace';K.t=0;K.T=SKR218.pace[0]+Math.random()*(SKR218.pace[1]-SKR218.pace[0])}else if(pacing(-K.side)<SKR218.perSide)K.side=-K.side}
    else if(K.st==='pace'){if(L>3.2){K.st='run';K.t=0}else if(K.t>=K.T){if(V.cling.length<SKR218.cling){K.st='leap';K.t=0;K.a=m.position.clone()}else K.t=K.T*.6}}
    return true}
  if(K.st==='leap'){const k=Math.min(1,K.t/SKR218.leap),bx=V.x+fx*K.f+lx*K.side*1.35,bz=V.z+fz*K.f+lz*K.side*1.35,by=V.y+.9;
    m.position.set(K.a.x+(bx-K.a.x)*k,K.a.y+(by-K.a.y)*k+Math.sin(k*Math.PI)*1.6,K.a.z+(bz-K.a.z)*k);m.rotation.y=Math.atan2(bx-K.a.x,bz-K.a.z);animC(m,now,true,6);
    if(k>=1){e.k218=null;if(V.cling.length>=SKR218.cling)return true;e.cl={V,f:Math.max(-2.6,Math.min(2.6,K.f)),l:K.side*1.35};V.cling.push(e);svSnd('thud',.4,1.4);
      if(V===SR165.me&&!(performance.now()-(SKR218.saidT||0)<12000)){SKR218.saidT=performance.now();say('🪲 A scarab leaps aboard! Shoot it off — or boost!')}}
    return true}
  return false}
{const f=sr165FoeAI;sr165FoeAI=function(e,dt,now){if(SKR218.on&&e&&e.sr165==='sc'&&!e.cl&&SR165.on&&SR165.ph==='run'){
    const [V,d]=sr165Near(e.m.position),P=sr165Path(),q=P.near(e.m.position.x,e.m.position.z);if(V&&(q.s<V.s-30||d>90)){removeE(e);return}
    try{if(skr218Scarab(e,dt,now))return}catch(err){if(!SKR218.err++)console.warn('v219 scarab',err)}}
  return f.apply(this,arguments)}}
// the warning glow: any scarab running beside a machine (within the pacing band, not clinging), on every screen
function skr218Glow(now){const M=SKR218.glow,seen=new Set();if(SR165.on)for(const e of enemies){if(e.dead||!e.m||!e.m.visible)continue;const sc=e.sr165==='sc'||(e.mir&&e.c&&e.c.en==='scarab');if(!sc||e.cl)continue;
    let near=false;for(const V of SR165.V){if(V.wreck)continue;const fx=Math.sin(V.h),fz=Math.cos(V.h),rx=e.m.position.x-V.x,rz=e.m.position.z-V.z,a=rx*fx+rz*fz,b=Math.abs(rx*fz-rz*fx);if(Math.abs(a)<3.6&&b>2&&b<6.2){near=true;break}}
    if(!near)continue;seen.add(e);let s=M.get(e);if(!s){s=kqSpr(0xff3020,1.1);s.material=s.material.clone();s.userData.lpsSkip=1;scene.add(s);M.set(e,s)}
    s.position.set(e.m.position.x,e.m.position.y+1.2,e.m.position.z);s.material.opacity=.55+.35*Math.sin(now/70);s.scale.setScalar(1+.25*Math.sin(now/90))}
  M.forEach((s,e)=>{if(!seen.has(e)){scene.remove(s);s.material.dispose();M.delete(e)}})}
// ---------------- seeing the damage ----------------
function skr218Dom(){if(SKR218.dom)return SKR218.dom;const v=document.createElement('div');v.id='sk218V';
  v.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:29;opacity:0;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 52%,rgba(150,10,0,.55) 82%,rgba(190,0,0,.85) 100%)';
  ($('stage')||document.body).appendChild(v);const st=document.createElement('style');st.textContent='body.sk218 #tgt{display:none!important}#sr165H.sk218hit{animation:sk218sh .28s}@keyframes sk218sh{0%{transform:translateX(-50%)}25%{transform:translateX(calc(-50% - 7px))}50%{transform:translateX(calc(-50% + 6px))}75%{transform:translateX(calc(-50% - 3px))}100%{transform:translateX(-50%)}}#sr165H.sk218hit #sr165B{filter:brightness(2.2) saturate(.4)}#sk218C{color:#ff8a70;font-size:12px;margin-top:2px}';document.head.appendChild(st);
  return SKR218.dom=v}
{const f=sr165Hurt;sr165Hurt=function(V,d,why){const h0=V&&V.hp;const r=f.apply(this,arguments);try{if(SKR218.on&&V===SR165.me&&V.hp<h0){const dd=h0-V.hp;
    SKR218.fl=Math.min(1,SKR218.fl+(dd>=1?.35+dd*.04:dd*.25));if(dd>=1){SKR218.shk=Math.min(.5,.12+dd*.02);const H=$('sr165H');if(H){H.classList.remove('sk218hit');void H.offsetWidth;H.classList.add('sk218hit')}}
    SKR218.hit=performance.now()}}catch(_){}return r}}
function skr218Feel(V,dt,now){const D=skr218Dom(),n=V.cling.length,low=V.hp/V.hpM;SKR218.fl=Math.max(0,SKR218.fl-dt*2.2);
  const pulse=n?(.18+.07*n)*(.6+.4*Math.sin(now/120)):0,lowp=low<.35?.15*(.5+.5*Math.sin(now/200)):0;D.style.opacity=Math.min(1,SKR218.fl+pulse+lowp).toFixed(3);
  // the hull flashes red with the hit
  const k=Math.max(0,1-(now-(SKR218.hit||0))/180);V.R.mats.forEach(m=>{if(!m.emissive)return;if(k>0){m.emissive.setRGB(.9*k,.06*k,0);m.emissiveIntensity=1}else if(m.userData.k218){m.emissive.setHex(m.userData.e0||0);m.emissiveIntensity=m.userData.ei0==null?1:m.userData.ei0}m.userData.k218=k>0});
  // smoke below half, fire below a quarter
  if(low<.5&&Math.random()<dt*(low<.25?22:9)){const fx=Math.sin(V.h),fz=Math.cos(V.h),p=new THREE.Vector3(V.x-fx*(Math.random()*3-1),V.y+1.6,V.z-fz*(Math.random()*3-1));burst(p,0x2a2622,2,.6,1.8,1.3);if(low<.25)burst(p,Math.random()<.5?0xff6a20:0xffb040,2,.8,1.6,.5)}
  // the count of scarabs on the hull, under the bar
  const H=$('sr165H');if(H){let c=$('sk218C');if(!c){c=document.createElement('div');c.id='sk218C';H.appendChild(c)}c.textContent=n?'🪲 ×'+n+' gnawing at the hull — shoot them off or boost!':'';c.style.display=n?'':'none'}}
// ---------------- the camera ----------------
function skr218Cam(){}
{const f=POST.render;POST.render=function(){try{if(SKR218.on&&typeof SR165!='undefined'&&SR165.on&&SR165.me&&sr165In())skr218Cam()}catch(e){if(!SKR218.err++)console.warn('v219 skimmer cam',e)}return f.apply(this,arguments)}}
// ---------------- aiming at the real ground ----------------
const SKR218RC=new THREE.Raycaster();
sr165Aim=function(V,dt){};
function skr218Ret(V,now){let R=SKR218.ret;const on=SR165.on&&V&&V.gun==='me'&&V.aim&&SR165.ph==='run';
  if(!R){if(!on)return;R=SKR218.ret=new THREE.Mesh(new THREE.RingGeometry(.7,.95,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffd070,transparent:true,opacity:.8,depthWrite:false,fog:false}));R.renderOrder=40;R.userData.lpsSkip=1;scene.add(R)}
  R.visible=!!on;if(!on)return;const A=V.aim;R.position.set(A.x,GH(A.x,A.z)+.12,A.z);R.material.color.setHex(V.lock218?0xff4030:0xffd070);R.scale.setScalar(V.lock218?1.3+.15*Math.sin(now/80):1)}
// ---------------- each frame of the Run ----------------
{const f=sr165Tick;sr165Tick=function(dt,now){const r=f.apply(this,arguments);try{const on=SKR218.on&&SR165.on;document.body.classList.toggle('sk218',!!on);
    if(on&&SR165.me){skr218Feel(SR165.me,dt,now);skr218Glow(now)}else{if(SKR218.dom)SKR218.dom.style.opacity=0;if(SKR218.glow.size)skr218Glow(now)}skr218Ret(SR165.me,now)}catch(e){if(!SKR218.err++)console.warn('v219 run',e)}return r}}
