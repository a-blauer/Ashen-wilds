// ================= v152 Abeksi — the level: getting in, sneaking through, getting out =================
// Hillside Crest I's gateway to II is gone: in its place, at the edge of the gateway clearing, a cleft in the rocks leads down into
// Abeksi (F · "Sneak through Abeksi city"). The city is the main quest's first chapter, played once: when the hero slips out through
// the drain under the south wall they arrive in Hillside Crest II, and from then on the cleft simply leads on to II.
//  * State AB152Q.st: 0 never entered · 1 inside / started · 2 escaped (done also when II was reached, ab152Done). AB152Q.cp is the
//    last checkpoint (0..5, one per district, reached by crossing into it). Saved as x2.ab152 {st,cp}.
//  * Crouch: Ctrl (a tap: Ctrl+W would close the browser tab if Ctrl had to be held while walking) or C toggles it; the 🐍 button
//    on touch screens. Crouched = half speed, silent, low (hidden by low cover), seen at 70% of the range.
//  * Caught: the snake's "!", a hiss, a red flash, then back to the last checkpoint with every snake back on its routine.
//  * Inside: companions wait outside, no mount, no fighting (it is a stealth level), no recall (the breach is the way back out).
//  * HUD: #ab152h (eye: hidden / lit / seen, crouch state, the highest suspicion as a bar) and the #mqt152 tracker lines.
var AB152Q={st:0,cp:0};
function ab152Done(){return AB152Q.st>=2||insReach(1)>=1}
function ab152In(){return sp152Here('abeksi')}
// ---------------- the world, built the first time the hero is in the city ----------------
function ab152Build(){if(AB152.S)return AB152.S;const I=sp152I('abeksi'),P=ab152Plan(),G=ab152Grid(P,I),root=new THREE.Group();root.name='Abeksi';scene.add(root);
  const S={I,P,G,root,acts:[],lights:[],anim:[],rats:[],pens:[],t:0};AB152.S=S;
  const at=(u,v)=>[I.x0+u,I.y0+v],put=(o,u,v,ry,y)=>{const [x,z]=at(u,v);o.position.set(x,y==null?GH(x,z):y,z);o.rotation.y=ry||0;root.add(o);return o};
  // buildings, one baked group per district; the wall and the skyline
  P.D.forEach(([a,b],i)=>{const R=ab152R(3100+i*977);root.add(lgGroup('AB152|bld'+i,k=>{P.B.forEach(B=>{const cv=(B[1]+B[3])/2;if(cv>=a-4&&cv<(P.D[i+1]?P.D[i+1][0]-4:999))ab152House(k,B,R,I)})},0))});
  root.add(lgGroup('AB152|walls',k=>ab152Walls(k,P,I),0));root.add(lgGroup('AB152|sky',k=>ab152Skyline(k,I),0));
  root.children.forEach(m=>m.traverse(o=>{if(o.isMesh)o.castShadow=false}));
  root.add(ab152Streets(P,I,G));
  // props, their colliders (CBLK), the animated ones
  // static props are baked into one mesh set per district; the moving ones (fires, spits, cloth) stay objects of their own
  const bake=P.D.map(()=>[]),dOf=v=>{let i=0;P.D.forEach(([a],j)=>{if(v>=a-4)i=j});return i};
  P.C.forEach(([k,u,v,r])=>{const kk=k=='crate'?'crate0':k,[x,z]=at(u,v);
    if(k=='hearth'||k=='spit'||k=='laundry'||AB152KM[kk]){const m=ab152Kit(k);if(!m)return;put(m,u,v,r);if(m.userData.flame)S.anim.push({k:'flame',m:m.userData.flame,ph:Math.random()*6});if(m.userData.bar)S.anim.push({k:'bar',m:m.userData.bar});return}
    bake[dOf(v)].push([kk,x,GH(x,z),z,r])});
  bake.forEach((L,i)=>{if(L.length)root.add(lgGroup('AB152|props'+i,k=>ab152BakeProps(k,L),0))});
  G.fp.forEach(i=>{const u=i%G.W,v=Math.floor(i/G.W);CBLK.add((I.y0+v)*W+I.x0+u)});S.blk=G.fp.length;
  // lights: a flame, a pooled light, a pool of light on the ground
  P.L.forEach(([k,u,v])=>{const D=AB152L[k]||AB152L.torch;let m=null;if(k=='brazier')m=mqm143Brazier();else if(k=='torch')m=ab152Torch();else if(k=='lantern')m=ab152Lantern();
    if(m){put(m,u,v,0);if(m.userData.flame)S.anim.push({k:'flame',m:m.userData.flame,ph:Math.random()*6})}
    const [x,z]=at(u,v),lt=new THREE.PointLight(D[2],D[1],D[0]*1.6,1.5);lt.position.set(x,GH(x,z)+(k=='hearth'?1.2:k=='lantern'?2.1:k=='torch'?2.5:1.3),z);scene.add(lt);
    const pool=ab152Pool(D[0]*.95,D[2]);pool.position.set(x+(k=='lantern'?.6:0),GH(x,z)+.04,z);root.add(pool);S.lights.push({u,v,r:D[0],lt,i0:D[1],pool,ph:Math.random()*6})});
  // rats: a herd in each pen, a few in each cage
  P.PEN.forEach(([u0,v0,u1,v1],i)=>{const a=at(u0+1,v0+1),b=at(u1-1,v1-1);const H=ab152Rats(22,[a[0],a[1],b[0],b[1]],700+i*37,root);S.rats.push(H);S.pens.push([u0,v0,u1,v1,H])});
  P.C.forEach(([k,u,v])=>{if(k!='cage')return;const [x,z]=at(u,v),H=ab152Rats(3,[x-.22,z-.18,x+.22,z+.18],900+u*7+v,root);H.y=GH(x,z)+.1;H.list.forEach(r=>r.sz=.55);S.rats.push(H)});
  // the snakes
  P.N.forEach(sp=>{let a;try{a=ab152MakeActor(sp,I)}catch(e){console.error('v152 actor',sp[0],e);return}root.add(a.g);a.cone=ab152ConeMake();root.add(a.cone);S.acts.push(a);
    if(a.o.seat){const st=ab152Kit('stool');put(st,a.u-Math.sin(a.yaw)*.12,a.v-Math.cos(a.yaw)*.12,0)}
    if(a.o.lift&&!a.o.sweep){put(ab152Kit('platform'),a.u,a.v,a.yaw,null);a.o.lift=.72}
    if(a.lamp){const L=new THREE.PointLight(0xffc070,a.o.sweep?2.2:1.1,a.o.sweep?16:7,1.4);scene.add(L);a.lt=L}});
  // the tower lamp's beam
  const tw=S.acts.find(a=>a.o.sweep);if(tw){const m=new THREE.Mesh(new THREE.ConeGeometry(2.6,15,18,1,true).translate(0,-7.5,0).rotateX(-Math.PI/2+.22),new THREE.MeshBasicMaterial({color:0xffe0a0,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
    m.userData.psNo=1;root.add(m);S.beam=m}
  S.drain=at(P.EXIT[0],P.EXIT[1]);S.breach=at(P.CP[0][0],P.CP[0][1]);
  return S}
function ab152WorldTick(dt,now){const S=AB152.S,t=now/1000,P=pl.position;
  S.anim.forEach(q=>{if(q.k=='flame'){const s=1+.12*Math.sin(t*11+q.ph)*Math.sin(t*4.3+q.ph);q.m.scale.set(1+.06*Math.sin(t*9+q.ph),s,1+.06*Math.cos(t*8+q.ph))}else if(q.k=='bar')q.m.rotation.x+=dt*1.4});
  S.lights.forEach(L=>{L.lt.intensity=L.i0*(.86+.14*Math.sin(t*7.3+L.ph)*Math.sin(t*3.1+L.ph))});
  S.rats.forEach(H=>{const r=H.list[0];if(Math.hypot(r.x-P.x,r.z-P.z)<45)ab152RatsTick(H,dt,now)})}
// ---------------- the hero: crouch, light, noise ----------------
var AB152H={u:0,v:0,cr:0,lit:1,live:false,crK:0,nT:0,frz:0,cau:null,U:[],btn:null,ctrl:0,ctrlX:0,chk:0,maxS:0,hint:0};
function ab152SetCrouch(on){on=!!on;if(on===!!AB152H.cr)return;AB152H.cr=on?1:0;try{hero.buffs=hero.buffs.filter(b=>!b.ab152);if(on)hero.buffs.push({s:{mspd:-.5},t:1e15,n:'Crouching',i:'🐾',perm:true,ab152:1});hsDirty()}catch(_){}
  try{if(AB152H.btn)AB152H.btn.classList.toggle('on',on)}catch(_){}}
// keys: C toggles (in the city C is crouch, not the talents window); a tap of Ctrl toggles too (a Ctrl+key combination does not)
addEventListener('keydown',e=>{if(!ab152In()||!AB152.S)return;const k=(e.key||'').toLowerCase(),tg=e.target&&e.target.tagName;if(tg=='INPUT'||tg=='TEXTAREA')return;
  if(k=='control'){if(!e.repeat){AB152H.ctrl=1;AB152H.ctrlX=0}return}if(AB152H.ctrl)AB152H.ctrlX=1;
  if(k=='c'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!(typeof uiOpen=='function'&&uiOpen())){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)ab152SetCrouch(!AB152H.cr)}},{capture:true});
addEventListener('keyup',e=>{const k=(e.key||'').toLowerCase();if(k!='control')return;const tap=AB152H.ctrl&&!AB152H.ctrlX;AB152H.ctrl=0;
  if(tap&&ab152In()&&AB152.S&&!(typeof uiOpen=='function'&&uiOpen()))ab152SetCrouch(!AB152H.cr)},{capture:true});
addEventListener('blur',()=>{AB152H.ctrl=0});
// the hero's crouch pose: hips and knees bent, the body low and leaning forward (exact undo each frame, like 2100's layer)
function ab152CrAdd(b,ax,v){if(!b||!v)return;const R=b.rotation,p=R[ax];R[ax]=p+v;AB152H.U.push([R,ax,p,R[ax]])}
function ab152CrUndo(){const U=AB152H.U;for(let i=U.length-1;i>=0;i--){const u=U[i];if(u[0][u[1]]===u[3])u[0][u[1]]=u[2]}U.length=0}
{const f=animHero;animHero=function(now,mv,h){const H=h||pl;if(H!==pl)return f.apply(this,arguments);ab152CrUndo();const r=f.apply(this,arguments);
  try{const k=AB152H.crK;if(k>.005&&!(typeof riding!='undefined'&&riding)){const B=pl.bones;if(B){const w=mv?1:0;
    [['lh0',-.95],['rh0',-.95],['lh1',1.35],['rh1',1.35],['lh2',-.42],['rh2',-.42],['spine',.38],['chest',.14],['head',-.3],['aL0',-.3],['aR0',-.3],['aL1',-.35],['aR1',-.35]].forEach(([n,v])=>ab152CrAdd(B[n],'x',v*k));
    if(B.pelvis)B.pelvis.position.y-=.2*k}}}catch(_){}return r}}
// frozen while caught or fading
{const f=walk;walk=function(o,dx,dz){if(o===pl&&AB152H.frz&&ab152In())return;return f.apply(this,arguments)}}
// ---------------- the HUD ----------------
(function(){const st=document.createElement('style');st.textContent=`
#ab152h{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:6;pointer-events:none;display:flex;align-items:center;gap:10px;padding:6px 12px 6px 8px;border-radius:20px;
  background:linear-gradient(180deg,rgba(10,10,16,.78),rgba(6,6,10,.62));border:1px solid rgba(216,192,96,.35);color:#e8e2cc;font:600 12px system-ui,sans-serif;text-shadow:0 1px 2px #000}
#ab152h.hide{display:none}
#ab152h .eye{width:30px;height:20px;border-radius:50%;background:radial-gradient(circle at 50% 50%,#111 0 28%,var(--ec,#5a6a5a) 30% 62%,#101010 64%);box-shadow:0 0 var(--eg,0px) var(--ec,#5a6a5a);transition:box-shadow .25s}
#ab152h .tx{min-width:112px;text-align:left;line-height:1.15}#ab152h .tx small{display:block;font-weight:500;color:#b8b098;font-size:10.5px}
#ab152h .bar{width:90px;height:6px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden}#ab152h .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffe060,#ff9a30,#ff3a20)}
#ab152cv{position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0;transition:opacity .25s;box-shadow:inset 0 0 140px 40px rgba(255,140,40,.55)}
body.mob #ab152h{top:8px;transform:translateX(-50%) scale(.9)}
#mbtn button.ab152cr{grid-area:auto}#mbtn button.ab152cr.on{background:#5a4a1a;border-color:#ffd060}`;document.head.appendChild(st);
  const d=document.createElement('div');d.id='ab152h';d.className='hide';d.innerHTML='<div class="eye"></div><div class="tx"><span class="s">Hidden</span><small class="c">Standing · Ctrl or C to crouch</small></div><div class="bar"><i></i></div>';document.body.appendChild(d);
  const v=document.createElement('div');v.id='ab152cv';document.body.appendChild(v)})();
function ab152Hud(){const el=$('ab152h');if(!el)return;const on=ab152In()&&!!AB152.S&&!(typeof uiOpen=='function'&&uiOpen());el.classList.toggle('hide',!on);$('ab152cv').style.opacity=0;
  try{const mb=$('mbtn');if(on&&mb&&!AB152H.btn){const b=document.createElement('button');b.className='ab152cr';b.textContent='🐍';b.title='Crouch';mb.appendChild(b);AB152H.btn=b;
      b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();ab152SetCrouch(!AB152H.cr)})}
    if(AB152H.btn)AB152H.btn.style.display=on?'':'none'}catch(_){}
  if(!on)return;const H=AB152H,m=H.maxS,seen=H.cau||m>=AB152V.look,lit=H.lit;
  const ec=H.cau?'#ff3a20':m>=AB152V.go?'#ff9a30':m>=AB152V.look?'#ffe060':lit>.5?'#d8c890':'#4a5a4a';
  el.querySelector('.eye').style.setProperty('--ec',ec);el.querySelector('.eye').style.setProperty('--eg',(seen?14:lit>.5?8:0)+'px');
  el.querySelector('.s').textContent=H.cau?'Seen!':m>=AB152V.go?'They are coming to look':m>=AB152V.look?'Something heard you…':m>3?'Watched…':lit>.5?'In the light':'Hidden in shadow';
  el.querySelector('.c').textContent=H.cr?'Crouching · silent':'Standing · Ctrl or C to crouch';el.querySelector('.bar i').style.width=Math.min(100,m)+'%';
  $('ab152cv').style.opacity=H.cau?1:m>=AB152V.go?.55:m>=AB152V.look?.25:0}
// ---------------- entering, restarting, getting out ----------------
function ab152Spot(i){const P=ab152Plan(),I=sp152I('abeksi'),c=P.CP[Math.max(0,Math.min(P.CP.length-1,i|0))];return {x:I.x0+c[0],z:I.y0+c[1],ry:c[2],name:c[3]}}
function ab152Restart(first){const S=ab152Build();S.acts.forEach(ab152ResetActor);const c=ab152Spot(AB152Q.cp);toPos(c.x,c.z,c.ry+Math.PI);try{pl.rotation.y=c.ry}catch(_){}
  AB152H.cau=null;AB152H.frz=0;ab152SetCrouch(true);AB152H.crK=1;AB152H.maxS=0;try{if(riding)dismount(true)}catch(_){}hud()}
function ab152Enter(){if(AF)return;try{if(riding)dismount(true)}catch(_){}const first=AB152Q.st<1;AB152Q.st=Math.max(1,AB152Q.st);
  fadeTo(()=>{ab152Restart(first);setTimeout(()=>{try{zt116Show(ZT116.Z[1],'Hillside Crest · Main Quest','Abeksi','The serpent city · cross it unseen',first?'Ctrl or C to crouch · stay in the shadows':'Checkpoint · '+ab152Spot(AB152Q.cp).name,'z1')}catch(_){}},350);
    if(first)setTimeout(()=>{say('🐍 <b>Crouch</b> (a tap of <b>Ctrl</b>, or <b>C</b>): slow and silent, and low cover hides you. Standing, your steps can be heard.');
      setTimeout(()=>say('👁 Every snake sees in a cone on the ground. Stay out of the cones and the light; if one turns towards you, get behind something.'),5200)},1400)})}
function ab152Leave(){const G=SP152.gates.abeksi;fadeTo(()=>{ab152SetCrouch(false);AB152H.crK=0;const s=G&&G.spot;if(s){toPos(s.x+s.ux*-2.2,s.z+s.uz*-2.2,s.ry)}else insArrive(INSL[5])})}
function ab152Finish(how){if(AB152H.cau)return;const gate=how==='gate';AB152Q.st=2;AB152H.frz=1;try{svSnd(gate?'heavy':'splash',1,1)}catch(_){}
  fadeTo(()=>{ab152SetCrouch(false);AB152H.crK=0;AB152H.frz=0;const N=INSL[6];insArrive(N);insMark(N);
    setTimeout(()=>{try{zt116Show(ZT116.Z[1],'Hillside Crest · Main Quest',gate?'Abeksi Has Fallen':'Abeksi Escaped',gate?'The great gate grinds open on a silent city':'You crawl out of the drain into the mists beyond the city','Onward through '+N.n,'z1');mSfx('victory')}catch(_){}},400);
    say(gate?'⚔ Not one serpent is left to stop you. You walk out through the city gate; <b>'+N.n+'</b> lies ahead.':'🐍 You slipped through Abeksi unseen. <b>'+N.n+'</b> lies ahead.')})}
function ab152Caught(a){if(AB152H.cau)return;AB152H.cau={a,t:0};AB152H.frz=1;a.st='caught';
  try{const p=a.g.position,P=pl.position;a.yaw=Math.atan2(P.x-p.x,P.z-p.z);svSnd('hiss',1.1,1);flash('rgba(255,40,20,.8)');shake(.25)}catch(_){}
  ab152AfterCaught(a)}
// what being seen leads to (v157: the city's alarm, 3192; this was the v152 rule: back to the last checkpoint)
function ab152AfterCaught(a){say('👁 <b>Spotted!</b> Back to the last checkpoint.');
  setTimeout(()=>{fadeTo(()=>{ab152Restart(false);try{say('✦ Checkpoint · '+ab152Spot(AB152Q.cp).name)}catch(_){}})},1500)}
// ---------------- each frame in the city ----------------
function ab152Tick(dt,now){if(!ab152In()){if(AB152.S){AB152.S.root.visible=false;AB152.S.lights.forEach(L=>L.lt.intensity=0);AB152.S.acts.forEach(a=>{if(a.lt)a.lt.intensity=0})}
    if(AB152H.cr)ab152SetCrouch(false);AB152H.crK=Math.max(0,AB152H.crK-dt*4);if(!AB152H.off){AB152H.off=1;try{ab152Hud()}catch(_){}}return}
  AB152H.off=0;
  const S=ab152Build(),I=S.I,P=pl.position,H=AB152H;S.root.visible=true;
  H.u=P.x-I.x0;H.v=P.z-I.y0;H.crK+=((H.cr?1:0)-H.crK)*Math.min(1,dt*7);H.lit=ab152Light(H.u,H.v);H.live=!H.cau&&!H.frz&&dt>0;
  if(riding)try{dismount(true)}catch(_){}
  // checkpoints: crossing into a district
  const D=S.P.D;for(let i=D.length-1;i>AB152Q.cp;i--)if(H.v>=D[i][0]&&H.v<=D[i][1]+1){AB152Q.cp=i;try{pickup({ic:'✦',t:'Checkpoint',col:'#ffe07a',sub:S.P.CP[i][3]})}catch(_){}break}
  // noise: walking upright, dashing, and the rats when you walk upright past their pen
  const mov=pl.mvd&&now-pl.mvd.t<120;H.nT-=dt;
  if(H.live&&H.nT<=0&&(hero.dash||(mov&&!H.cr))){H.nT=.45;const r=hero.dash?AB152V.noise.dash:AB152V.noise.walk;ab152Hear(H.u,H.v,r,'steps');try{ring(new THREE.Vector3(P.x,GH(P.x,P.z),P.z),0xffe8c0,r*.5,450)}catch(_){}}
  if(H.live&&mov&&!H.cr)S.pens.forEach(q=>{if(H.u>q[0]-2.2&&H.u<q[2]+2.2&&H.v>q[1]-2.2&&H.v<q[3]+2.2&&!(q.t>now)){q.t=now+3500;q[4].panic=2.5;ab152Hear((q[0]+q[2])/2,(q[1]+q[3])/2,AB152V.noise.rats,'rats');say('🐀 The rats squeal and scatter!')}});
  // the snakes
  let mx=0;for(const a of S.acts){const d=Math.hypot(a.u-H.u,a.v-H.v),near=d<40;
    if(ab152ActTick(a,dt,now,H)=='caught'&&!H.cau)ab152Caught(a);
    if(a.sus>mx&&a.st!='caught')mx=a.sus;
    ab152ActPose(a,now,dt,near);if(a.cone){a.cone.visible=near&&d<24;if(a.cone.visible)ab152ConeTick(a,I,S.G,!!H.cr)}ab152MarkTick(a,now);
    if(a.lt){const x=I.x0+a.u,z=I.y0+a.v,fy=a.yaw+a.hy;a.lt.position.set(x+Math.sin(fy)*(a.o.sweep?6:1.2),GH(x,z)+(a.o.sweep?1.5:2.0),z+Math.cos(fy)*(a.o.sweep?6:1.2));a.lt.intensity=a.o.sweep?2.2:1.1}}
  if(H.cau)mx=100;H.maxS=mx;
  if(S.beam){const a=S.acts.find(q=>q.o.sweep),x=I.x0+a.u,z=I.y0+a.v;S.beam.position.set(x,GH(x,z)+(a.o.lift||0)+2.2,z);S.beam.rotation.y=a.yaw+a.hy;S.beam.material.color.setHex(a.sus>=AB152V.look?0xffa040:0xffe0a0)}
  ab152WorldTick(dt,now);
  if(now-(H.hT||0)>150){H.hT=now;ab152Hud()}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{ab152Tick(dt,now)}catch(e){if(!AB152.err++)console.error('v152 abeksi',e)}return r}}
{const f=atmos;atmos=function(dt,now){const r=f.apply(this,arguments);try{if(ab152In()){torch.intensity*=.3;if(typeof LANT!='undefined'&&LANT)LANT.visible=false}}catch(_){}return r}}
// ---------------- the camera in the streets ----------------
// Houses stand close on every side, so a camera behind the hero would often sit inside one (and the scenery fade would fill the
// screen with see-through wall). Each frame in the city the camera first tilts up over the roofs (a stealth view from above), and
// only if that is not enough comes in closer. The player's own zoom and tilt are kept and put back right after the frame.
function ab152CamFit(){const S=AB152.S;if(!S)return null;const G=S.G,I=S.I,P=pl.position,yw=camYaw,ox=Math.sin(yw),oz=Math.cos(yw),hy=P.y+1.1;
  const clear=(p,d)=>{const hc=Math.cos(p),sp=Math.sin(p);for(let s=1.0;s<=d;s+=.35){const u=Math.round(P.x+ox*hc*s-I.x0),v=Math.round(P.z+oz*hc*s-I.y0);if(u<0||v<0||u>=G.W||v>=G.H)return s;const t=G.top[v*G.W+u];if(t&&hy+sp*s<t+.6)return s}return 0};
  const d0=camDist,p0=camPitch;if(!clear(p0,d0))return null;
  for(let p=p0+.08;p<=1.22;p+=.08)if(!clear(p,d0))return [p,d0];
  const s=clear(1.22,d0);return [1.22,Math.max(3.2,s-.4)]}
{const f=loop;loop=function(now){let keep=null;try{if(ab152In()&&AB152.S&&!(typeof uiOpen=='function'&&uiOpen())){const r=ab152CamFit();if(r){keep=[camPitch,camDist];camPitch=r[0];camDist=r[1]}}}catch(_){}
  try{return f.apply(this,arguments)}finally{if(keep){camPitch=keep[0];camDist=keep[1]}}}}
// ---------------- prompts inside: the drain out, the breach back ----------------
{const f=worldPrompt;worldPrompt=function(){try{if(ab152In()&&AB152.S&&!AB152H.cau){const P=pl.position,S=AB152.S;
    if(Math.hypot(P.x-S.drain[0],P.z-S.drain[1])<2.4)return {label:'F · Slip through the drain (leave Abeksi for '+INSL[6].n+')',fn:()=>ab152Finish()};
    if(Math.hypot(P.x-S.breach[0],P.z-S.breach[1])<2.6)return {label:'F · Climb back out through the breach ('+INSL[5].n+')',fn:()=>ab152Leave()}}}catch(_){}return f.apply(this,arguments)}}
// ---------------- the rules while inside ----------------
SP152.R.abeksi={park:1,noMount:'🐍 No mount in Abeksi: hooves on the cobbles would wake the whole city.',noFight:'🐍 Not here: one blow and the whole city would be on you. Stay hidden.',
  noRecall:'🐍 The serpent wards block your recall. Find the drain under the south wall, or climb back out at the breach.',onLoad(){AB152Q.st=Math.max(1,AB152Q.st);ab152Restart(false)}};
// ---------------- the cleft in Hillside Crest I ----------------
function ab152GateModel(s){const C=AB152C,g=new THREE.Group();g.userData.psNo=1;
  g.add(lgGroup('AB152|cleft3',k=>{const R=ab152R(5511),rock=[0x4e4a44,0x5a554c,0x46423c,0x615a50];
    // a rock outcrop with a carved archway set into it; stairs go down into the dark between the posts
    [-1,1].forEach(sd=>{for(let i=0;i<7;i++){const s0=.8+R()*1.0,x=sd*(2.0+s0+R()*1.6),z=-1.3-R()*2.4;k.p('','dod','c',rock[i%4],x,s0*.7+R()*1.5,z,s0,s0*1.25,s0,R()*3,R()*3,R()*3)}});
    for(let i=0;i<6;i++)k.p('','dod','c',rock[i%4],(R()-.5)*4.4,4.0+R()*1.2,-2.0-R()*1.6,1.1+R()*.6,.8+R()*.4,1.1,R()*3,R()*3,R()*3);
    k.p('','box','c',rock[2],0,2.0,-2.4,4.8,4.4,1.6);
    // the posts and the lintel, sandstone of the city, a serpent carved across the top
    [-1,1].forEach(sd=>{k.p('','box','c',C.stoneL,sd*1.25,1.45,-.2,.55,2.9,.7);k.p('','box','c',C.stone,sd*1.25,.12,-.2,.75,.24,.9);
      for(let y=.5;y<2.7;y+=.42)k.p('','box','c',C.trimD,sd*1.25,y,.02,.36,.06,.04,0,0,sd*.5)});
    k.p('','box','c',C.stoneL,0,3.05,-.35,3.3,.5,.85);k.p('','box','c',C.trim,0,2.78,-.35,3.1,.08,.9);
    for(let i=0;i<9;i++){const x=-1.4+i*.35;k.p('','sph','c',C.jade,x,3.06+Math.sin(i*1.1)*.12,.12,.14,.12,.1)}k.p('','sph','c',C.jade,1.62,3.1,.14,.2,.16,.16);k.p('','box','g',0xff4020,1.7,3.14,.28,.05,.04,.02);
    // the dark way down: a black opening, stairs sinking into it
    k.p('','box','c',0x040303,0,1.35,-.75,2.0,2.7,.1);for(let i=0;i<6;i++)k.p('','box','c',lgCol(0x6a6458,0x0a0806,i/6),0,.06-i*.16,-.05-i*.32,1.9,.12,.36);
    // a toppled serpent statue beside the way down, the city's banner on a spear stuck in the rock
    k.L('','c',C.jade,[-2.6,.25,1.1],[-1.6,.35,2.0],.28,.2,7);k.p('','hood','c',lgCol(C.jade,0x3a3a30,.4),-1.5,.5,2.2,.8,.9,.4,1.3,0,.2);k.p('','tor','c',C.jade,-2.9,.3,.6,.7,.35,.7);
    k.L('','c',C.woodD,[2.4,0,.6],[2.5,2.9,.4],.04,.035,5);k.S('',C.cloth[0],2.48,2.8,.42,.5,1.2,0,0,3);k.p('','box','m',C.brass,2.5,2.3,.46,.2,.2,.02,0,0,Math.PI/4);
    for(let i=0;i<4;i++)k.p('','dod','c',rock[i],(R()-.5)*5,.2,.6+R()*1.2,.3+R()*.3,.22,.3)},0));
  const gl=ab152Pool(1.3,0xff9a40);gl.position.set(0,.05,-.4);g.add(gl);
  g.position.set(s.x,GH(s.x,s.z),s.z);g.rotation.y=s.ry;scene.add(g);   // local +z faces the clearing
  // block the rock (the archway's steps stay open in front: the F prompt is there)
  const ca=Math.cos(s.ry),sa=Math.sin(s.ry);for(let o=-4.2;o<=4.2;o+=.6)for(let d=-3.6;d<=-.4;d+=.6){if(Math.abs(o)<1.0&&d>-1.2)continue;
    const x=s.x+ca*o+sa*d,z=s.z-sa*o+ca*d;CBLK.add(Math.round(z)*W+Math.round(x))}
  return g}
sp152Gate('abeksi',{ig:5,r:3.4,build:ab152GateModel,
  prompt(s){if(!ab152Done())return {label:'F · Sneak through Abeksi city',fn:()=>ab152Enter()};const N=INSL[6];return {label:'F · Travel on to '+N.n+' ('+rpTxt139(N.lv[0])+')',fn:()=>insGo(N)}}});
// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.ab152={v:152,st:AB152Q.st,cp:AB152Q.cp}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.ab152;AB152Q.st=0;AB152Q.cp=0;if(q&&typeof q=='object'){AB152Q.st=Math.max(0,Math.min(2,q.st|0));AB152Q.cp=Math.max(0,Math.min(5,q.cp|0))}
  AB152H.cau=null;AB152H.frz=0}catch(e){console.warn('v152 load',e)}return r}}
// ---------------- the tracker ----------------
SP152.trk.abeksi=I=>{if(I.g===5&&!ab152Done())return {name:'The Serpent City',lines:[[AB152Q.st?'Return to the cleft at the end of the road':'Follow the road to its end'],['Sneak through Abeksi city']]};
  if(I.sp==='abeksi'){const P=ab152Plan(),c=AB152Q.cp;return {name:'The Serpent City',lines:[['District',P.CP[c][3]],['Checkpoint',(c+1)+' / '+P.CP.length],['Reach the drain under the south wall',null,1]]}}
  return null};
// ---------------- the atmosphere: night in the serpent city ----------------
sp152Theme('abeksi',{nm:'The Serpent City',sub:'Its streets belong to the serpent folk',a:{fog:.034,fc:0x141a2a,fcA:.9,sun:.24,hemi:.55,env:'dark',ex:1.0,sat:1.0,vig:1.6,sky:.35,pt:'ash',pc:0xffb070,po:.45}});
