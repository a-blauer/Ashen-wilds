// ================= v157 The Hilltop Ascent: the boost, speed and danger =================
// The owner: "the player can get a boost by dashing; improve the sense of danger and speed; the snake did not show at all when it
// was supposed to emerge behind the player."
//  * Boost (ch157Boost): the dash input (Shift, the 💨 dash button on touch screens, the dash slot of the action bar) spurs the
//    mount: ×CH157.mul speed for CH157.T s. CH157.n charges (the 💨 pips under the gap bar), each refilling in CH157.refill s
//    (not while boosting). A boost also shakes off a crash's stumble (recover after a hit). The jump works as before; a boost
//    carries on through a jump (a longer leap). Skarrith's rubber band (CH153V.band) is unchanged: a boost buys ~4 tiles, which
//    it wins back over ~5–10 s, and a long lead (past CH153V.strike[0]) keeps its strikes away meanwhile.
//  * Speed: the field of view widens with speed and more while boosting (ch157Fov), wind streaks at the screen's edges
//    (#ch157c), dust kicked up at the hooves (partners' too in co-op when they boost).
//  * Danger: a red edge vignette that pulses like a heartbeat as Skarrith closes in (#ch157e), a heavy thud and a little camera
//    shake with each of its surges when it is close, its rumble and hiss growing louder with closeness (ch157Snd, a looping noise
//    on the game's sound bus), a ⚠ on the side a strike comes from, a VENOM warning while it rears to spit.
//  * The emergence (3162 poses the serpent; this file adds the rest): the ground trembles and cracks open behind you (a crack
//    decal tilted to the slope, dust, cracking sounds), then Skarrith bursts out with flying rock debris, a shock ring, a roar
//    and a big shake; the camera looks back at it from in front of you (3162's CH153CAM).
//  * Settings: screen shake follows the game's Screen shake option (shake()); with it off, or with the system's reduced motion
//    on (ch157Calm), the field of view and the streaks are toned down. Sounds follow the sound volume.
var CH157={err:0,mul:1.55,T:.9,n:2,refill:5,fov0:null,fov:null,fovOn:0,calm:null,deb:[],crack:null,snd:null,sndT:0,lines:[],cv:null,thT:0,dT:0,el:{}};
function ch157Calm(){try{if(CH157.calm==null)CH157.calm=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){CH157.calm=false}return CH157.calm||SET.shake===false}
function ch157Mul(R){return R&&R.bst>0?CH157.mul:1}
function ch157Init(R){if(R.bc==null){R.bc=CH157.n;R.bst=0;R.bk=0}}
// the boost: from the dash key / button (3162 hands them here)
function ch157Boost(){const R=CH153.R;if(!R||R.ph!='run')return false;ch157Init(R);
  if(R.bst>0)return false;
  if(R.bc<1){CH157.deny=performance.now();return false}
  R.bc-=1;R.bst=CH157.T;R.bn=(R.bn||0)+1;if(R.stum>0)R.stum=0;
  try{svSnd('whoosh',1.3,.8);mSfx('whoosh')}catch(_){}
  try{const p=pl.position;ring(p,0xffe8b0,2.2,380);burst(gY(p,.3),0xd8c8a0,16,2.4,1.2,.5)}catch(_){}
  return true}
// ---------------- the overlays: speed streaks, the danger vignette, side warnings, the boost pips ----------------
(function(){const st=document.createElement('style');st.textContent=`
#ch157c{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;display:none}
#ch157e{position:absolute;inset:0;pointer-events:none;z-index:4;opacity:0;box-shadow:inset 0 0 70px 14px rgba(210,16,0,.8),inset 0 0 160px 20px rgba(120,0,0,.35)}
.ch157s{position:absolute;top:60%;z-index:9;pointer-events:none;font:900 46px Cinzel,Georgia,serif;color:#ff4a2a;text-shadow:0 0 12px #000,0 0 22px rgba(255,40,0,.8);opacity:0;transition:opacity .08s}
#ch157sL{left:3%}#ch157sR{right:3%}
#ch153h .bst{display:flex;align-items:center;gap:5px;font-size:12px}#ch153h .bst i{display:block;width:34px;height:8px;border-radius:4px;background:rgba(0,0,0,.6);border:1px solid rgba(180,220,255,.5);overflow:hidden;position:relative}
#ch153h .bst i b{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#7ac8ff,#e0f6ff)}#ch153h .bst.on i b{background:linear-gradient(90deg,#ffd060,#fff4c0)}#ch153h .bst.no{animation:ch157no .3s}
@keyframes ch157no{0%,100%{transform:none}30%{transform:translateX(-4px)}70%{transform:translateX(4px)}}
#ch153h .vw{font:800 14px Cinzel,Georgia,serif;letter-spacing:.1em;color:#9aff40;opacity:0;transition:opacity .1s;text-shadow:0 0 6px #000}`;document.head.appendChild(st);
  const host=$('stage')||document.body,cv=document.createElement('canvas');cv.id='ch157c';host.appendChild(cv);CH157.cv=cv;
  const e=document.createElement('div');e.id='ch157e';host.appendChild(e);
  ['L','R'].forEach(s=>{const d=document.createElement('div');d.id='ch157s'+s;d.className='ch157s';d.textContent=s=='L'?'⚠ ⟪':'⟫ ⚠';host.appendChild(d)});
  const h=$('ch153h');if(h){const b=document.createElement('div');b.className='bst';b.innerHTML='<span>💨</span><i><b></b></i><i><b></b></i>';
    const g=h.querySelector('.gap');if(g&&g.nextSibling)h.insertBefore(b,g.nextSibling);else h.appendChild(b);const v=document.createElement('div');v.className='vw';v.textContent='☣ VENOM — mind the rings';h.appendChild(v)}})();
// wind streaks at the screen's edges, rushing outward from the point the trail runs to
function ch157Lines(dt,k,boost){const cv=CH157.cv;if(!cv)return;const on=k>.02;if(!on){if(cv.style.display!='none'){cv.style.display='none'}return}
  const w=cv.clientWidth||cv.parentNode.clientWidth,h=cv.clientHeight||cv.parentNode.clientHeight;if(!w||!h)return;if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
  cv.style.display='block';const c=cv.getContext('2d'),L=CH157.lines,N=Math.round(18+30*k),cx=w*.5,cy=h*.43,D=Math.hypot(w,h)*.5;
  while(L.length<N)L.push({a:Math.random()*6.283,r:.3+Math.random()*.7,s:.6+Math.random()*.8,w:.6+Math.random()*1.4});L.length=Math.min(L.length,N);
  c.clearRect(0,0,w,h);c.lineCap='round';const col=boost?'255,236,190':'235,240,255';
  for(const q of L){q.r+=dt*q.s*(1.2+2.6*k);if(q.r>1.15){q.a=Math.random()*6.283;q.r=.34+Math.random()*.25;q.s=.6+Math.random()*.8}
    const ca=Math.cos(q.a),sa=Math.sin(q.a),r0=q.r*D,len=D*(.05+.16*k)*q.s,a=Math.min(1,(q.r-.34)*3)*(.1+.32*k);if(a<=.01)continue;
    c.strokeStyle='rgba('+col+','+a.toFixed(3)+')';c.lineWidth=q.w*(1+k);c.beginPath();c.moveTo(cx+ca*r0,cy+sa*r0*.8);c.lineTo(cx+ca*(r0+len),cy+sa*(r0+len)*.8);c.stroke()}}
// ---------------- the sound: Skarrith's rumble and hiss, louder the closer it is ----------------
function ch157Snd(k,on){try{const a=AUD;if(!a||a.state!='running'||!NOISE||!a.out){return}
    if(!on||SET.sfx===false||document.hidden||(typeof uiOpen=='function'&&uiOpen())){if(CH157.snd){const S=CH157.snd;S.g.gain.setTargetAtTime(0,a.currentTime,.15);if(performance.now()-CH157.sndT>1500){try{S.src.forEach(s=>s.stop())}catch(_){}CH157.snd=null}}return}
    CH157.sndT=performance.now();
    if(!CH157.snd){const g=a.createGain();g.gain.value=0;g.connect(a.out);
      const s1=a.createBufferSource();s1.buffer=NOISE;s1.loop=true;const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=140;lp.Q.value=1.2;const g1=a.createGain();g1.gain.value=1.6;s1.connect(lp);lp.connect(g1);g1.connect(g);
      const s2=a.createBufferSource();s2.buffer=NOISE;s2.loop=true;s2.playbackRate.value=.93;const bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.value=3600;bp.Q.value=1.4;const g2=a.createGain();g2.gain.value=0;s2.connect(bp);bp.connect(g2);g2.connect(g);
      s1.start();s2.start();CH157.snd={g,g1,g2,bp,src:[s1,s2]}}
    const S=CH157.snd,t=a.currentTime;S.g.gain.setTargetAtTime(.05+.5*k*k,t,.12);S.g2.gain.setTargetAtTime(.08+.55*k*(.6+.4*Math.sin(t*5.3)),t,.08);S.bp.frequency.setTargetAtTime(3000+1400*k,t,.2)}catch(_){}}
// ---------------- the emergence: cracks, dust, debris ----------------
function ch157CrackTex(){if(ch157CrackTex.t)return ch157CrackTex.t;const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),R=ab152R(15707);
  const g=x.createRadialGradient(128,128,4,128,128,70);g.addColorStop(0,'rgba(6,3,2,.98)');g.addColorStop(.55,'rgba(18,10,6,.9)');g.addColorStop(1,'rgba(30,20,12,0)');x.fillStyle=g;x.beginPath();x.arc(128,128,72,0,7);x.fill();
  x.strokeStyle='rgba(14,8,5,.92)';x.lineCap='round';
  const crack=(px,py,a,len,w,d)=>{let X=px,Y=py;for(let i=0;i<len;i++){a+=(R()-.5)*.7;const nx=X+Math.cos(a)*9,ny=Y+Math.sin(a)*9;x.lineWidth=Math.max(.6,w*(1-i/len));x.beginPath();x.moveTo(X,Y);x.lineTo(nx,ny);x.stroke();X=nx;Y=ny;
      if(d<2&&R()<.22)crack(X,Y,a+(R()<.5?-1:1)*(.5+R()*.6),Math.floor(len*.5),w*.6,d+1)}};
  for(let i=0;i<11;i++){const a=i/11*6.283+R()*.4;crack(128+Math.cos(a)*30,128+Math.sin(a)*30,a,8+Math.floor(R()*6),5,0)}
  for(let i=0;i<60;i++){const a=R()*6.283,r=40+R()*70;x.fillStyle='rgba('+(60+R()*40|0)+','+(48+R()*30|0)+','+(36+R()*20|0)+','+(.5+R()*.4).toFixed(2)+')';x.beginPath();x.arc(128+Math.cos(a)*r,128+Math.sin(a)*r,1+R()*3.5,0,7);x.fill()}
  const t=new THREE.CanvasTexture(c);return ch157CrackTex.t=t}
function ch157Hole(){const S=CH153.S,P=S.P,[x,z,h]=ch153Ext(P,CH153V.hole,0);return new THREE.Vector3(x,h,z)}
function ch157CrackMesh(){if(CH157.crack&&CH157.crack.parent===CH153.S.root)return CH157.crack;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(6.4,6.4).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:ch157CrackTex(),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,opacity:0}));
  m.material.userData.noFade135=1;m.userData.noFade135=1;m.userData.psNo=1;m.renderOrder=2;CH153.S.root.add(m);
  const p=ch157Hole(),P=CH153.S.P;m.rotation.y=P.yaw(Math.max(0,CH153V.hole));m.position.set(p.x,(CH153V.hole>=0?P.at(CH153V.hole,0)[2]:p.y)+.07,p.z);   // the trail is a flat ledge: lie on it
  return CH157.crack=m}
function ch157Rock(){if(!ch157Rock.g){ch157Rock.g=new THREE.DodecahedronGeometry(.42,0);ch157Rock.m=[0x6a645a,0x5a554c,0x7a7266].map(c=>{const m=new THREE.MeshLambertMaterial({color:c,flatShading:true});m.userData.noFade135=1;return m})}
  const m=new THREE.Mesh(ch157Rock.g,ch157Rock.m[(Math.random()*3)|0]);m.castShadow=true;m.userData.psNo=1;m.userData.noFade135=1;return m}
function ch157Erupt(){const S=CH153.S,p=ch157Hole();
  try{svSnd('roar',1.5,.78);svSnd('heavy',1.5,.55);svSnd('crack',1.4,.55);setTimeout(()=>{try{svSnd('roar',1.1,.95)}catch(_){}},420)}catch(_){}
  try{shake(.75)}catch(_){}try{flash('rgba(160,120,80,.35)')}catch(_){}
  try{burst(p.clone().add(new THREE.Vector3(0,.6,0)),0xa89878,70,4.5,4.5,1.8);burst(p.clone().add(new THREE.Vector3(0,1.5,0)),0x6a5a48,40,2.5,6,1.4);ring(p,0xc8a878,7,700)}catch(_){}
  for(let i=0;i<18;i++){const m=ch157Rock(),a=Math.random()*6.283,sp=2+Math.random()*5.5,sc=.5+Math.random()*1.3;m.scale.setScalar(sc);m.position.set(p.x+Math.cos(a)*.8,p.y+.6,p.z+Math.sin(a)*.8);S.root.add(m);
    CH157.deb.push({m,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:7+Math.random()*8,rx:(Math.random()-.5)*12,rz:(Math.random()-.5)*12,t:0,b:0,sc})}}
function ch157DebTick(dt){const L=CH157.deb;for(let i=L.length-1;i>=0;i--){const d=L[i],m=d.m;d.t+=dt;d.vy-=24*dt;m.position.x+=d.vx*dt;m.position.y+=d.vy*dt;m.position.z+=d.vz*dt;m.rotation.x+=d.rx*dt;m.rotation.z+=d.rz*dt;
    const g=GH(m.position.x,m.position.z)+.3*d.sc;if(m.position.y<g&&d.vy<0){m.position.y=g;if(d.b<2){d.b++;d.vy=-d.vy*.32;d.vx*=.55;d.vz*=.55;d.rx*=.5;d.rz*=.5}else{d.vy=0;d.vx*=.8;d.vz*=.8}}
    if(d.t>2.4)m.scale.setScalar(d.sc*Math.max(0,1-(d.t-2.4)/.8));if(d.t>3.2||!m.parent){if(m.parent)m.parent.remove(m);L.splice(i,1)}}}
function ch157ClearDeb(){CH157.deb.forEach(d=>{if(d.m.parent)d.m.parent.remove(d.m)});CH157.deb.length=0}
// the intro, each frame: a tremor, the ground cracking open, the eruption
function ch157Intro(dt,R){const te=R.t-ch153EmT(R),p=ch157Hole(),cm=ch157CrackMesh();
  if(R.emR!==R.t0){R.emR=R.t0;R.emK=0;R.emD=0;R.emB=0}
  if(te<0){const k=Math.max(0,Math.min(1,1+te/.7));cm.material.opacity=.25+.75*k;cm.scale.setScalar(.35+.65*k);
    R.emD-=dt;if(R.emD<=0&&k>0){R.emD=.12;try{burst(p.clone().add(new THREE.Vector3((Math.random()-.5)*2,.3,(Math.random()-.5)*2)),0x9a8a6a,5,1.2,1.6,.8);shake(.05+.12*k)}catch(_){}}
    if(k>.05&&!R.emK){R.emK=1;try{svSnd('crack',1.1,.7);svSnd('heavy',.8,.6)}catch(_){}}
    if(k>.6&&R.emK==1){R.emK=2;try{svSnd('crack',1.3,.55)}catch(_){}}}
  else{cm.material.opacity=1;cm.scale.setScalar(1);if(!R.emB){R.emB=1;ch157Erupt()}
    if(te<1.4){R.emD-=dt;if(R.emD<=0){R.emD=.07;try{burst(p.clone().add(new THREE.Vector3(0,.4,0)),0x8a7a62,4,2,2.8,1)}catch(_){}}}}}
// ---------------- each frame ----------------
function ch157Fx(dt,now){const R=CH153.R,S=CH153.S;if(!R||!S)return;ch157Init(R);const calm=ch157Calm();
  if(R.ph=='run'){if(R.bst>0)R.bst=Math.max(0,R.bst-dt);else R.bc=Math.min(CH157.n,R.bc+dt/CH157.refill)}
  R.bk+=((R.bst>0?1:0)-R.bk)*Math.min(1,dt*(R.bst>0?8:3));
  if(R.ph=='intro')ch157Intro(dt,R);else if(CH157.crack&&R.ph=='run'&&R.t>6)CH157.crack.material.opacity=Math.max(.0,CH157.crack.material.opacity-dt*.25);
  ch157DebTick(dt);
  const run=R.ph=='run',gap=R.s-R.sn.s,close=run?Math.max(0,Math.min(1,(13-gap)/9)):0,sp=run?Math.max(0,R.v/CH153V.spd):0;
  // the field of view
  if(CH157.fov0==null||!CH157.fovOn){CH157.fov0=cam.fov;CH157.fov=cam.fov;CH157.fovOn=1}
  const ex=(5*Math.min(1,sp)+10*R.bk+2*close)*(calm?.4:1),want=CH157.fov0+ex;CH157.fov+=(want-CH157.fov)*Math.min(1,dt*4);
  if(Math.abs(cam.fov-CH157.fov)>.01){cam.fov=CH157.fov;cam.updateProjectionMatrix()}
  // streaks
  ch157Lines(dt,run?Math.max(0,Math.min(1,(sp-.55)*1.2))*(calm?.45:.75)+R.bk*(calm?.3:.5):0,R.bk>.3);
  // dust at the hooves (more when boosting); partners boosting in co-op too
  CH157.dT-=dt;if(run&&CH157.dT<=0&&R.y<.1&&R.v>3){CH157.dT=R.bk>.3?.035:.07;try{const yw=pl.rotation.y,p=pl.position;burst(new THREE.Vector3(p.x-Math.sin(yw)*.9,p.y+.15,p.z-Math.cos(yw)*.9),0xb8a684,R.bk>.3?4:2,.9+R.bk,.7,.55)}catch(_){}
    try{if(typeof cs155Co=='function'&&cs155Co())cs155Alive().forEach(q=>{if(q.ph==2&&q.v>CH153V.spd*1.15&&q.y<.1){const [x,z,h]=S.P.at(q.s-.9,q.o);burst(new THREE.Vector3(x,h+.15,z),0xb8a684,3,1.4,.7,.55)}})}catch(_){}}
  // its surges when close: a thud and a little shake, faster the closer
  if(run&&gap<11){CH157.thT-=dt;if(CH157.thT<=0){CH157.thT=.32+.45*(1-close);try{shake(.03+.1*close);if(close>.25)svSnd('step',.5+.7*close,.7)}catch(_){}}}
  // a strike at me: shake as it lands
  const T=R.sn.strike,mine=T&&(!T.tg||typeof MP=='undefined'||T.tg===MP.me);if(mine&&T.t>=1.0&&!T.sh){T.sh=1;try{shake(.22)}catch(_){}}
  ch157Snd(run||R.ph=='intro'?(R.ph=='intro'?Math.min(1,Math.max(0,R.t-ch153EmT(R)+.6)):Math.max(0,Math.min(1,(26-gap)/20))):0,run||R.ph=='intro'||R.ph=='dead')}
function ch157Hud(){const R=CH153.R,on=!!R&&ch153Run()&&!(typeof uiOpen=='function'&&uiOpen()),e=$('ch157e'),sL=$('ch157sL'),sR=$('ch157sR');
  if(!on||R.ph=='spec'){if(e)e.style.opacity=0;if(sL)sL.style.opacity=0;if(sR)sR.style.opacity=0;return}
  const run=R.ph=='run',gap=R.s-R.sn.s,close=run?Math.max(0,Math.min(1,(12-gap)/8)):0,now=performance.now()/1000,hz=1.1+1.8*close;
  if(e)e.style.opacity=run?(close*(.55+.45*Math.max(0,Math.sin(now*hz*6.283)))).toFixed(3):R.ph=='dead'?.9:0;
  const T=R.sn.strike,mine=T&&(!T.tg||typeof MP=='undefined'||T.tg===MP.me)&&T.t<1.05,P=CH153.S.P,right=P.sgn>0;
  if(sL)sL.style.opacity=mine&&!right?(.6+.4*Math.sin(now*20)).toFixed(2):0;if(sR)sR.style.opacity=mine&&right?(.6+.4*Math.sin(now*20)).toFixed(2):0;
  const h=$('ch153h');if(!h)return;ch157Init(R);const b=h.querySelector('.bst');if(b){const f=b.querySelectorAll('i b');f.forEach((x,i)=>{x.style.width=Math.round(Math.max(0,Math.min(1,R.bc-i))*100)+'%'});b.classList.toggle('on',R.bst>0);
    if(CH157.deny&&performance.now()-CH157.deny<300){b.classList.remove('no');void b.offsetWidth;b.classList.add('no');CH157.deny=0}}
  const v=h.querySelector('.vw');if(v){const N=R.sn,inc=run&&(N.spitAt!=null||CH153.S.globs.length>0);v.style.opacity=inc?1:0}
  const k=h.querySelector('.k');if(k&&k.textContent.indexOf('boost')<0&&k.textContent.indexOf('steer')>=0)k.textContent=k.textContent.replace('A / D · steer','A / D · steer   '+(document.body.classList.contains('mob')?'💨':'Shift')+' · boost')}
// ---------------- wiring ----------------
{const f=ch153Tick;ch153Tick=function(dt,now){const r=f.apply(this,arguments);try{ch157Fx(dt,now)}catch(e){if(!CH157.err++)console.error('v157 fx',e)}return r}}
{const f=ch153Reset;ch153Reset=function(){ch157ClearDeb();const r=f.apply(this,arguments);try{if(CH157.crack){CH157.crack.material.opacity=0}}catch(_){}return r}}
{const f=ch153Hud;ch153Hud=function(){const r=f.apply(this,arguments);try{const v=$('ch153v'),R=CH153.R;if(v&&R&&R.ph=='run')v.style.opacity=0;ch157Hud()}catch(_){}return r}}
// leaving the chase: the field of view, the streaks and the sound go back to normal
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{if(!ch153Run()){
    if(CH157.fovOn){CH157.fovOn=0;if(CH157.fov0!=null){cam.fov=CH157.fov0;cam.updateProjectionMatrix()}ch157Lines(0,0,false);ch157ClearDeb();const e=$('ch157e');if(e)e.style.opacity=0;['ch157sL','ch157sR'].forEach(id=>{const x=$(id);if(x)x.style.opacity=0})}
    if(CH157.snd)ch157Snd(0,false)}}catch(_){}return r}}
// a hidden tab stops the game loop: hush the serpent's loop at once (it is faded back in by the next frame)
document.addEventListener('visibilitychange',()=>{try{if(document.hidden&&CH157.snd&&AUD)CH157.snd.g.gain.setValueAtTime(0,AUD.currentTime)}catch(_){}});
