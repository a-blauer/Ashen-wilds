// ================= v153 The Hilltop Ascent — the chase =================
// Mistmere's (Hillside Crest II) gateway to III is gone: at the far edge of its gateway clearing a worn road climbs away into the
// hills (F · "Ascend to the hilltops"; a mount is needed). Riding up it starts the main quest's second chapter, played once:
// Skarrith, the Mountain Coil, comes down the mountain behind you and you race it up the trail to a crack in the summit rock too
// narrow for it. Through the crack lies The Galecliffs (III); from then on the road leads straight there.
//  * Riding: the mount runs on by itself at one speed for everyone (CH153V.spd: no mount bonuses here); A / D (← →, the stick)
//    steer, Space jumps (the 🦘 button on touch screens). The camera rides behind, along the trail.
//  * v164 (3250): the chase itself — broken trail to jump, Skarrith's venom (slows you), its own speed, the chomp, the distance
//    meter. The v153 obstacles, rockslides, plank bridge, strikes, hits and rubber band are gone; their code was removed here.
//  * Losing: chomped or fallen through the trail → a short scene, then the chase starts again at the foot of the trail.
//  * Inside: companions wait, you stay mounted, no fighting, no recall (a 🏳 button gives up and rides back down to Mistmere).
var CH153Q={st:0};
var CH153V={hole:1,spd:8.2,lat:6.6,jumpT:.74,jumpH:2.05,slow0:6.4};
var CH153={S:null,R:null,err:0,jumpQ:0,btn:null};
function ch153Done(){return CH153Q.st>=2||insReach(1)>=2}
function ch153In(){return sp152Here('ascent')}
function ch153Run(){return ch153In()&&!!CH153.R}
// (v164: ch153Build, ch153Reset are 3250's)
// mount the active mount whatever the usual checks say (the chase is mounted only)
function ch153Mount(){if(riding||!mounts.length)return;const m=mOf(mActive)||mounts[0];mActive=m.id;riding=m;mModel=mountModel(m.k);mModel.position.copy(pl.position);mModel.rotation.y=pl.rotation.y;scene.add(mModel);hud()}
function ch153Place(){const R=CH153.R,P=CH153.S.P;const [x,z,h]=P.at(R.s,R.o);pl.position.set(x,h+R.y,z);pl.rotation.y=P.yaw(R.s)-(R.steer||0)*.35;
  if(typeof mModel!='undefined'&&mModel){mModel.position.copy(pl.position);mModel.rotation.y=pl.rotation.y}}
function ch153Win(){const R=CH153.R;if(R.ph!='run')return;R.ph='win';R.win={t:0};try{zt116Show(ZT116.Z[1],'Hillside Crest · Main Quest','Through!','Skarrith slams into the rock behind you','The Galecliffs lie beyond','z1');svSnd('roar',1.2,.75)}catch(_){}}
// (v164: ch153SnakeTick, ch153Die are 3250's)
// when Skarrith erupts in the intro (s of R.t): a restart (t starts at 1.4) gets a quicker version
function ch153EmT(R){return R&&R.t0>0?R.t0+.3:.75}
// a spot on the trail, or (s < 0) on the ground of the run-off below its foot, straight on along the trail's first heading
function ch153Ext(P,s,o){if(s>=0)return P.at(s,o);const [x0,z0]=P.at(0,o),d=-s,x=x0-P.TX[0]*d,z=z0-P.TZ[0]*d;return [x,z,GH(x,z)]}
// (v164: ch153SnakeAnim, the venom (ch153Spit, ch153SpitPlan, ch153SpitSpawn) and ch153FxTick are 3250's)
// (v164: ch153Tick is 3250's)
function K_a(){return !!(K.a||K.arrowleft)}function K_d(){return !!(K.d||K.arrowright)}
// ---------------- getting in and out ----------------
function ch153Enter(){if(AF)return;if(!mounts.length)return say('🐎 You need a mount to ride the hill path. Build the Stable at the Stronghold Steward in Duskhold and buy one.');
  CH153Q.st=Math.max(1,CH153Q.st);CH153.lv=0;fadeTo(()=>{const S=ch153Build();const [x,z]=S.P.at(S.K.start,0);toPos(x,z,S.P.yaw(S.K.start)+Math.PI);ch153Reset(true);
    setTimeout(()=>{try{zt116Show(ZT116.Z[1],'Hillside Crest · Main Quest','The Hilltop Ascent','A narrow trail up the mountain','','z1')}catch(_){}},200)})}
function ch153Leave(){CH153.R=null;CH153.lv=1;fadeTo(()=>{const G=SP152.gates.ascent,s=G&&G.spot;if(s)toPos(s.x+s.ux*-2.5,s.z+s.uz*-2.5,s.ry);else insArrive(INSL[6])})}
function ch153Finish(){CH153Q.st=2;CH153.lv=1;fadeTo(()=>{CH153.R=null;const N=INSL[7];insArrive(N);insMark(N);
  setTimeout(()=>{try{zt116Show(ZT116.Z[1],'Hillside Crest · Main Quest','The Hilltops','You squeeze through the crack and out onto the high plains','Onward through '+N.n,'z1');mSfx('victory')}catch(_){}},400);
  say('🐍 You escaped Skarrith. <b>'+N.n+'</b> lies ahead.')})}
// ---------------- input: Space jumps (and nothing else does) ----------------
addEventListener('keydown',e=>{if(!ch153Run())return;const k=(e.key||'').toLowerCase(),tg=e.target&&e.target.tagName;if(tg=='INPUT'||tg=='TEXTAREA')return;
  if(k==' '){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)CH153.jumpQ=.18}
  else if(k=='shift'){e.stopImmediatePropagation();e.preventDefault();if(!e.repeat&&typeof ch157Boost=='function')ch157Boost()}   // v157: Shift (the dash key) boosts
  else if(k=='v'||k=='t'){e.stopImmediatePropagation();e.preventDefault()}},{capture:true});
{const f=walk;walk=function(o,dx,dz){if(o===pl&&ch153Run())return;return f.apply(this,arguments)}}
{const f=dodge;dodge=function(){if(ch153Run()){if(typeof ch157Boost=='function')ch157Boost();return}return f.apply(this,arguments)}}   // v157: the dash button boosts
// the mount gallops whatever the keys (it runs on its own) at one pace for everyone
{const f=mountTick;mountTick=function(dt,now,al){if(ch153Run()&&riding){const R=CH153.R,s0=riding.spd;riding.spd=45;try{return f.call(this,dt,now,R.v>.5?1:0)}finally{riding.spd=s0;if(mModel){mModel.position.copy(pl.position);mModel.rotation.y=pl.rotation.y}}}return f.apply(this,arguments)}}
// the camera rides behind along the trail (a look back at the snake during the intro: CH153CAM, v157)
var CH153CAM={yaw:.38,pitch:.26,dist:13,near:15,side:.42,sw:0};
{const f=loop;loop=function(now){let keep=null;try{if(ch153Run()&&CH153.S){const R=CH153.R,P=CH153.S.P,yw=P.yaw(R.s);keep=[camPitch,camDist];
    const intro=R.ph=='intro'&&R.t<2.75,dead=R.ph=='dead',fall=dead&&R.dead.why=='fall',g0=R.s-R.sn.s,n0=R.ph=='run'?Math.max(0,Math.min(1,(CH153CAM.near-g0)/8)):0;CH153CAM.sw+=(n0*n0*(3-2*n0)-CH153CAM.sw)*.05;
    const want=intro?yw-CH153CAM.yaw*P.sgn:dead&&!fall?yw+.9:yw+Math.PI-(R.ph=='run'?CH153CAM.side*P.sgn*CH153CAM.sw:0);let d=want-camYaw;d=Math.atan2(Math.sin(d),Math.cos(d));camYaw+=d*Math.min(1,(intro?.08:.12)+0*(R.v));
    // v157: the intro starts with the camera already in front of you, looking back down the trail where Skarrith bursts out
    if(intro&&!R.camSnap){R.camSnap=1;camYaw=want;camPitch=CH153CAM.pitch;camDist=CH153CAM.dist;snapCam();camK=camPitch;camDD=camDist}
    // when the snake is close the camera rises over its head, so its jaws loom at the bottom of the screen
    // as the snake closes in, the camera comes in close behind you, staying in front of its head (it bursts into view when it strikes)
    // v157: closer than ~10 tiles the camera climbs over its head (the following camera lags ~2 tiles behind, so at a short
    // distance it used to sit inside Skarrith's head)
    // v164: closer than CH153CAM.near tiles the camera pulls back, climbs and swings a little out over the drop, so Skarrith's
    // head looms behind the rider in view (the danger is seen, not only felt), ending over its head when it is right on you
    const gap=R.s-R.sn.s,dh=Math.max(3.8,Math.min(8.8,gap-5.6)),near=R.ph=='run'?Math.max(0,Math.min(1,(CH153CAM.near-gap)/8)):0,ns=near*near*(3-2*near);
    camPitch=intro?CH153CAM.pitch:fall?1.0:dead?.45:.34+.34*ns;camDist=intro?CH153CAM.dist:fall?12:dead?8:(dh/Math.cos(.34))*(1-ns)+Math.max(7,gap+4.5)*ns}}catch(_){}
  try{return f.apply(this,arguments)}finally{if(keep){camPitch=keep[0];camDist=keep[1]}}}}
// ---------------- the HUD ----------------
(function(){const st=document.createElement('style');st.textContent=`
#ch153h{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:7;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:5px;color:#f0ead2;font:600 12px system-ui,sans-serif;text-shadow:0 1px 2px #000}
#ch153h.hide{display:none}#ch153h .hp{display:flex;gap:6px;font-size:22px;filter:drop-shadow(0 1px 2px #000)}#ch153h .hp span.off{opacity:.22;filter:grayscale(1)}
#ch153h .gap{position:relative;width:300px;height:12px;border-radius:7px;background:rgba(0,0,0,.55);border:1px solid rgba(255,220,140,.4);overflow:hidden}
#ch153h .gap i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#ff3a20,#ffb040 55%,#6adf60);transition:width .15s}
#ch153h .gap b{position:absolute;top:-6px;font-size:18px;line-height:1}#ch153h .gap b.sn{left:-2px}#ch153h .k{font-size:11px;color:#d8d0b0}
#ch153h .warn{font:800 15px Cinzel,Georgia,serif;letter-spacing:.12em;color:#ff5a3a;opacity:0;transition:opacity .1s}
#ch153v{position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0;box-shadow:inset 0 -120px 160px -40px rgba(255,30,10,.75)}
#ch153g{position:fixed;right:14px;top:92px;z-index:7;pointer-events:auto;padding:5px 10px;border-radius:8px;border:1px solid rgba(255,220,140,.35);background:rgba(10,8,6,.7);color:#e8e0c8;font:600 12px system-ui,sans-serif;cursor:pointer}
#ch153g.hide{display:none}#mbtn button.ch153j{font-size:20px}`;document.head.appendChild(st);
  const d=document.createElement('div');d.id='ch153h';d.className='hide';d.innerHTML='<div class="hp"></div><div class="gap"><i></i><b class="sn">🐍</b></div><div class="k">Space · jump &nbsp; A / D · steer</div><div class="warn">⚠ BROKEN TRAIL — JUMP!</div>';document.body.appendChild(d);
  const v=document.createElement('div');v.id='ch153v';document.body.appendChild(v);
  const g=document.createElement('button');g.id='ch153g';g.className='hide';g.textContent='🏳 Ride back down';g.addEventListener('click',()=>{if(ch153Run())ch153Leave()});document.body.appendChild(g)})();
// (v164: ch153Hud is 3250's)
// ---------------- wiring ----------------
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{
    if(ch153In()){const S=ch153Build();S.root.visible=true;if(!CH153.R&&!CH153.lv)ch153Reset(true);ch153Tick(dt,now);if(now-(CH153.hT||0)>100){CH153.hT=now;ch153Hud()}}
    else{CH153.lv=0;if(CH153.S)CH153.S.root.visible=false;if(CH153.R)CH153.R=null;if(!CH153.off){CH153.off=1;try{ch153Hud()}catch(_){}}}
    if(ch153In())CH153.off=0}catch(e){if(!CH153.err++)console.error('v153 ascent',e)}return r}}
{const f=atmos;atmos=function(dt,now){const r=f.apply(this,arguments);try{if(ch153Run()&&CH153.R.dark>.01){const k=1-.72*CH153.R.dark;sun.intensity*=k;hemi.intensity*=k}}catch(_){}return r}}
SP152.R.ascent={park:1,forceMount:'🐎 Not now — it is right behind you!',noFight:'🐍 No time to fight — ride!',noRecall:'🐍 No time — ride for the summit (or 🏳 ride back down).',
  onLoad(){CH153.R=null;const G=SP152.gates.ascent;setTimeout(()=>{try{const I=INSL[6];toPos(I.ba[0],I.ba[1])}catch(_){}},0)}};
// ---------------- the road out of Mistmere ----------------
sp152Gate('ascent',{ig:6,r:3.6,build:ch153GateModel,
  prompt(s){if(ch153Done()){const N=INSL[7];return {label:'F · Ride up to '+N.n+' ('+rpTxt139(N.lv[0])+')',fn:()=>insGo(N)}}
    if(!mounts.length)return {label:'🐎 Ascend to the hilltops · you need a mount for the hill path',fn:()=>say('🐎 The hill path is too long and steep on foot. Build the Stable at the Stronghold Steward in Duskhold and buy a mount.')};
    return {label:'F · Ascend to the hilltops',fn:()=>ch153Enter()}}});
// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.ch153={v:153,st:CH153Q.st}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.ch153;CH153Q.st=q&&typeof q=='object'?Math.max(0,Math.min(2,q.st|0)):0;CH153.R=null}catch(e){console.warn('v153 load',e)}return r}}
// ---------------- the tracker ----------------
SP152.trk.ascent=I=>{if(I.g===6&&!ch153Done())return {name:'The Hilltop Ascent',lines:[['Find the hill road at the end of '+INSL[6].n],[mounts.length?'Ascend to the hilltops (mounted)':'You will need a mount',null,!mounts.length]]};
  if(I.sp==='ascent'&&CH153.R){const R=CH153.R,P=CH153.S.P;return {name:'The Hilltop Ascent',lines:[['Reach the crack in the summit'],['Climbed',Math.round(Math.max(0,R.s)/P.S*100)+'%']]}}
  return null};
// ---------------- the atmosphere: late sun and wind on the heights ----------------
sp152Theme('ascent',{nm:'Serpent’s Spine',sub:'A trail up the mountain to the hilltops',a:{fog:.0055,fc:0xc8a888,fcA:.35,sun:1.0,hemi:.85,ex:1.0,sat:1.1,vig:1.35,sky:1,pt:'gust',pc:0xffffff,po:.45}});
// ---------------- the terrain's snow line ----------------
// The ground shader (0060) paints snow on flat ground above ~10–14 (the zones never climb higher). The trail climbs to ~90, so
// inside the ascent's rectangle the snow line is raised by CH153SN.up: only the summit keeps a dusting.
var CH153SN={r:{value:new THREE.Vector4()},up:{value:66}};
try{const I=sp152I('ascent');CH153SN.r.value.set(I.x0,I.y0,I.x0+I.w,I.y0+I.h);
  GTX.list.forEach(T=>{const m=T.mat;if(!m)return;const ob=m.onBeforeCompile;m.onBeforeCompile=(sh,rn)=>{if(ob)ob.call(m,sh,rn);
      if(sh.fragmentShader.indexOf('float sn=smoothstep(9.5,14.,yc')<0)return;sh.uniforms.uSnR=CH153SN.r;sh.uniforms.uSnU=CH153SN.up;
      sh.fragmentShader=sh.fragmentShader.replace('void main() {','uniform vec4 uSnR;uniform float uSnU;\nvoid main() {')
        .replace('float sn=smoothstep(9.5,14.,yc','float inA=step(uSnR.x,vWP.x)*step(vWP.x,uSnR.z)*step(uSnR.y,vWP.z)*step(vWP.z,uSnR.w),sLo=9.5+inA*uSnU;float sn=smoothstep(sLo,sLo+4.5,yc')};
    const k0=m.customProgramCacheKey===THREE.Material.prototype.customProgramCacheKey?'':m.customProgramCacheKey();m.customProgramCacheKey=()=>k0+'sn153';m.needsUpdate=true})}catch(e){console.warn('v153 snow line',e)}
