// ================= v119 ability preview (Abilities window): the real ability on a training stage =================
// v117 drew a stand-in: a copy of the hero struck a borrowed pose and a generic effect of the ability's "kind" played (rings,
// balls, beams), so most previews showed the wrong move and the wrong effect. Now the preview runs the ability itself:
// your own hero (the real `pl`, in your gear and race) is lent to the preview stage while the Abilities window is open, the
// real cast() runs against a straw training dummy, and every animation, projectile, decal, summon and particle you see is
// the one the game plays in a fight. It loops; ↻ replays.
//
// How it stays harmless (solo play; the world is paused while the window is open):
//  · Sandbox: everything the ability code runs happens inside abxIn()/abxOut(). In there the hero's fields, the ability
//    state (KQS), the target, the effect lists (tweens, enemies, shots, zones, traps, debris, fxA particles) are swapped for
//    the preview's own copies, sounds are muted, and messages, damage numbers and HUD redraws are skipped. Callbacks made
//    in there (tweens, timers, ability objects) run in there again. scene.add() puts new objects on the stage, burst()
//    draws into the stage's own particles. Hits never deal damage: they make the dummy flinch.
//  · The hero model, the hero action system (HA), the riding state and the ground heights under the stage (flattened)
//    belong to the preview while it runs, and are given back when it stops (window closed, another tab, another preview).
//  · During co-op the world keeps running, so the preview only shows a note there.
var ABX={on:false,ctx:0,s:null,cyc:0,t0:0,cast:0,root:null,fx:null,sb:null,msg:'',D:4.5,lead:.45};

// ---------- the sandbox switch ----------
function abxSwapArr(a,S,n){const x=a.splice(0,a.length),y=S[n];for(let i=0;i<y.length;i++)a.push(y[i]);S[n]=x}
function abxSwapHero(){const S=ABX.sb,v=S.hero,K=S.hk;for(const k in hero)K[k]=1;for(const k in v)K[k]=1;for(const k in K){const a=hero[k];hero[k]=v[k];v[k]=a}}
function abxSwap(){const S=ABX.sb;abxSwapHero();{const k=KQS;KQS=S.KQS;S.KQS=k}
  abxSwapArr(tws,S,'tws');abxSwapArr(enemies,S,'en');abxSwapArr(shots,S,'sh');abxSwapArr(zones,S,'zo');abxSwapArr(traps,S,'tr');
  if(typeof FXB_DEB!='undefined'){const d=FXB_DEB;FXB_DEB=S.deb;S.deb=d}
  if(typeof FXA!='undefined'&&FXA.live){const l=FXA.live;FXA.live=S.fxa;S.fxa=l}
  if(typeof KQ!='undefined'&&KQ.fx){const l=KQ.fx;KQ.fx=S.kqfx;S.kqfx=l}
  if(typeof DTL!='undefined'&&DTL.live){const l=DTL.live;DTL.live=S.dtl;S.dtl=l}
  {const t=tgt;tgt=S.tgt;S.tgt=t}{const a=hAgro;hAgro=S.hAgro;S.hAgro=a}
  try{hsDirty()}catch(_){}}
function abxIn(){if(!ABX.on||!ABX.sb)return false;if(ABX.ctx++>0)return true;abxSwap();ABX.sfx=SET.sfx;SET.sfx=false;ABX.uio=UIO_EL;UIO_EL=[];return true}
function abxOut(){if(ABX.ctx<=0)return;if(--ABX.ctx>0)return;SET.sfx=ABX.sfx;UIO_EL=ABX.uio;abxSwap()}
function abxRun(fn){if(!abxIn())return;try{return fn()}catch(e){console.warn('ability preview',e)}finally{abxOut()}}
// a callback made inside the sandbox runs inside it again (and is dropped once its loop is over or the preview stopped)
function abxCb(f,tm){if(!ABX.ctx||typeof f!='function'||f.abxW)return f;const id=ABX.cyc;if(tm)ABX.tm++;
  const w=function(){if(!ABX.on||ABX.cyc!==id)return;if(tm)ABX.tm=Math.max(0,ABX.tm-1);const self=this,args=arguments;return abxRun(()=>f.apply(self,args))};w.abxW=1;return w}
// (timers count as "still playing", so a delayed impact such as Meteor lands before the loop restarts)
{const st=window.setTimeout;window.setTimeout=function(f,ms){if(ABX.ctx&&typeof f=='function'){const a=Array.prototype.slice.call(arguments);a[0]=abxCb(f,(+ms||0)<4000);return st.apply(window,a)}return st.apply(window,arguments)}}

// ---------- what the sandbox redirects ----------
{const add=scene.add,rem=scene.remove;
  scene.add=function(){if(ABX.ctx&&ABX.fx){for(let i=0;i<arguments.length;i++){const o=arguments[i];if(o&&o!==pl)ABX.fx.add(o)}return this}return add.apply(this,arguments)};
  scene.remove=function(){if(ABX.fx)for(let i=0;i<arguments.length;i++){const o=arguments[i];if(o&&o.parent&&o.parent!==this&&abxOnStage(o))o.parent.remove(o)}return rem.apply(this,arguments)}}
function abxOnStage(o){const R=ABX.root;for(let p=o.parent;p;p=p.parent)if(p===R)return true;return false}
{const f=burst;burst=function(p,col,n,sp,up,life){if(ABX.ctx&&ABX.pts)return abxBurst(p,col,n,sp,up,life);return f.apply(this,arguments)}}
// hits: the dummy flinches, nothing takes damage, no procs, no aggro
{const f=heroHit;heroHit=function(e){if(ABX.ctx){abxFlinch();return 1}return f.apply(this,arguments)}}
{const f=hurt;hurt=function(e){if(ABX.ctx){abxFlinch();return}return f.apply(this,arguments)}}
{const f=compHit;compHit=function(){if(ABX.ctx)return 0;return f.apply(this,arguments)}}
{const f=eStatus;eStatus=function(){if(ABX.ctx)return;return f.apply(this,arguments)}}
{const f=brkShot;brkShot=function(){if(ABX.ctx)return false;return f.apply(this,arguments)}}
{const f=solid;solid=function(){if(ABX.ctx)return false;return f.apply(this,arguments)}}
{const f=tcHit;tcHit=function(){if(ABX.ctx)return false;return f.apply(this,arguments)}}
// words and HUD stay with the world
{const f=say;say=function(){if(ABX.ctx)return;return f.apply(this,arguments)}}
{const f=dn;dn=function(){if(ABX.ctx)return;return f.apply(this,arguments)}}
{const f=popT;popT=function(){if(ABX.ctx)return;return f.apply(this,arguments)}}
{const f=hud;hud=function(){if(ABX.ctx)return;return f.apply(this,arguments)}}
{const f=resUI;resUI=function(){if(ABX.ctx)return;return f.apply(this,arguments)}}
// the window pauses the game; inside the sandbox it doesn't (actions advance, hits land, reticles stay): uiOpen() looks at
// no windows in there (abxIn empties its element list UIO_EL)
// the main loop leaves the hero's pose to the preview while it runs
{const f=animHero;animHero=function(now,mv,h){if(ABX.on&&!ABX.ctx&&(!h||h===pl))return;return f.apply(this,arguments)}}
// another preview (companion, gear, creator) takes the renderer: give the hero back first
{const f=pvShow;pvShow=function(host,obj){if(ABX.on&&obj!==ABX.root)abxStop();return f.apply(this,arguments)}}
// a save made while the preview runs stores the world's hero, not the stage's
{const f=saveGame;saveGame=function(){if(!ABX.on)return f.apply(this,arguments);const Wd=ABX.w,p=pl.position.clone(),ry=pl.rotation.y,rd=riding;
  pl.position.copy(Wd.pos);pl.rotation.y=Wd.ry;riding=Wd.riding;try{return f.apply(this,arguments)}finally{pl.position.copy(p);pl.rotation.y=ry;riding=rd}}}

// ---------- stage particles (burst() inside the sandbox) ----------
function abxPtsBuild(){const N=500,P=new Float32Array(N*3),C=new Float32Array(N*3),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('color',new THREE.BufferAttribute(C,3));
  const o=new THREE.Points(g,new THREE.PointsMaterial({size:.4,map:SPR,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));o.frustumCulled=false;
  ABX.pts={o,N,P,C,V:new Float32Array(N*3),B:new Float32Array(N*3),L:new Float32Array(N),M:new Float32Array(N).fill(1),i:0};return o}
function abxBurst(p,col,n,sp,up,life){const Q=ABX.pts,c=new THREE.Color(col);n=Math.min(n|0,160);
  for(let i=0;i<n;i++){const j=Q.i++%Q.N,a=Math.random()*6.28,r=Math.random()*sp;Q.P.set([p.x,p.y,p.z],j*3);Q.V.set([Math.cos(a)*r,up*(.3+Math.random()),Math.sin(a)*r],j*3);Q.B.set([c.r,c.g,c.b],j*3);Q.L[j]=Q.M[j]=life*(.6+Math.random()*.4)}}
function abxPtsStep(dt){const Q=ABX.pts;if(!Q)return;for(let j=0;j<Q.N;j++){if(Q.L[j]<=0){Q.C[j*3]=Q.C[j*3+1]=Q.C[j*3+2]=0;continue}
    Q.L[j]-=dt;const k=Math.max(0,Q.L[j]/Q.M[j]);for(let a=0;a<3;a++){Q.P[j*3+a]+=Q.V[j*3+a]*dt;Q.C[j*3+a]=Q.B[j*3+a]*k}Q.V[j*3+1]-=1.5*dt}
  const g=Q.o.geometry;g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true}
function abxPtsClear(){const Q=ABX.pts;if(Q){Q.L.fill(0);Q.C.fill(0);Q.o.geometry.attributes.color.needsUpdate=true}}

// ---------- the stage: a dirt circle under the hero and a straw training dummy ----------
function abxStage(){if(ABX.root)return ABX.root;const root=new THREE.Group();
  const gnd=new THREE.Mesh(new THREE.CircleGeometry(1,64),new THREE.MeshStandardMaterial({color:0x2a2218,roughness:.95}));gnd.rotation.x=-Math.PI/2;
  const rim=new THREE.Mesh(new THREE.RingGeometry(.975,1,72),new THREE.MeshBasicMaterial({color:0x6a5434}));rim.rotation.x=-Math.PI/2;rim.position.y=.004;
  const ground=new THREE.Group();ground.add(gnd,rim);root.add(ground);
  const dm=new THREE.Group(),wood=new THREE.MeshStandardMaterial({color:0x6a4a2a,roughness:.9}),straw=new THREE.MeshStandardMaterial({color:0xc8a860,roughness:1}),B=new THREE.Group();
  const msh=(g,m,y)=>{const o=new THREE.Mesh(g,m);o.position.y=y;B.add(o);return o};
  msh(new THREE.CylinderGeometry(.05,.06,1.42,8),wood,.71);msh(new THREE.CylinderGeometry(.23,.19,.6,10),straw,.88);msh(new THREE.SphereGeometry(.15,10,8),straw,1.31);
  msh(new THREE.BoxGeometry(.86,.06,.06),wood,1.07);msh(new THREE.CylinderGeometry(.27,.31,.08,12),wood,.04);dm.add(B);root.add(dm);
  const fx=new THREE.Group();root.add(fx);root.add(abxPtsBuild());
  ABX.fx=fx;ABX.ground=ground;ABX.dm=dm;ABX.dmB=B;ABX.straw=straw;return ABX.root=root}
// the training dummy is a real enemy record (abilities find and aim at it) whose model is the straw figure
function abxDummy(){const key=EN.hobgoblin?'hobgoblin':Object.keys(EN)[0],c=enemyC(key,Math.max(1,hero.lvl|0),{});c.h=1e9;c.st.hp=1e9;const m=ABX.dm;m.isE=1;m.bs=1;
  return {c,m,hb:new THREE.Group(),cd:9,ch:0,vx:0,vz:0,tier:0,wx:m.position.x,wz:m.position.z,wt:0,agg:0,minion:0,dots:[],stun:999,__abx:1}}
function abxFlinch(){ABX.hitT=.35;ABX.hits=(ABX.hits|0)+1}

// ---------- which abilities need the dummy close ----------
function abxDist(s){const ty=(s.ty||(typeof KQS_TY!='undefined'&&KQS_TY[s.k])||'')+'';
  if(s.gt&&s.rng)return Math.min(5,Math.max(3,s.rng*.5));
  // shots, beams, throws, charges, teleports and summons need room; everything else works around the hero
  if(['shot','beam','chain','mark','blink'].includes(s.k)||['throw','point','bow','dash'].includes(s.pose)||/Projectile|Line|Chain|Bouncing|Teleport|charge|Mobility|Beast|Summon|Pull|piercing|volley|Portal/i.test(ty))return 4.5;
  return 2.2}

// ---------- start / stop ----------
function abxBlocked(){if(typeof mpLive=='function'&&mpLive())return 'Ability previews pause while you play together.';
  if(!party.length)return 'Hatch a companion first to use abilities.';if(hero.hp<=0)return '';return ''}
function abxShow(host,s){if(!host||!s)return;const why=abxBlocked();
  if(why){if(ABX.on)abxStop();host.innerHTML='<div class="abpvm">'+why+'</div>';return}
  const same=ABX.on&&ABX.s===s;ABX.s=s;
  if(!ABX.on&&!abxStart())return;
  pvShow(host,ABX.root,abxUpd);
  if(!same)abxCycle(performance.now())}
function abxStart(){try{
  const root=abxStage(),P0=pl.position.clone(),Wd=ABX.w={pos:P0.clone(),ry:pl.rotation.y,sw:pl.sw,HA,riding,vis:pl.visible,fxaPar:typeof FXA!='undefined'&&FXA.root?FXA.root.parent:null,
      cam:PV.cam?{p:PV.cam.position.clone(),q:PV.cam.quaternion.clone(),fov:PV.cam.fov,far:PV.cam.far}:null};
  // the ground under the stage is flat while it runs (effects land on the dirt circle, not on the hills behind it)
  const y0=GH(P0.x,P0.z),R=22,cx=Math.floor(P0.x),cz=Math.floor(P0.z),fl=[];
  for(let j=cz-R;j<=cz+R;j++)for(let i=cx-R;i<=cx+R;i++){if(i<-HPD||j<-HPD||i>W+HPD||j>H+HPD)continue;const k=(j+HPD)*HW+i+HPD;if(k<0||k>=HF.length)continue;fl.push(k,HF[k]);HF[k]=y0}
  Wd.hf=fl;ABX.P0=P0;ABX.y0=y0;
  // the hero (and the fxA particle root) move onto the stage
  if(riding){const h=pl.children[0];Wd.rideH=[h.position.y,h.position.z];h.position.y=0;h.position.z=0;riding=null}
  HA={cur:null,snap:null,sb:0,buf:0,flT:-1e9,press:-1e9};pl.sw=0;pl.visible=true;root.add(pl);
  if(Wd.fxaPar){Wd.fxaLive=FXA.live.filter(m=>m.visible);Wd.fxaLive.forEach(m=>m.visible=false);root.add(FXA.root)}
  ABX.sb={tws:[],en:[],sh:[],zo:[],tr:[],deb:[],fxa:[],kqfx:[],dtl:[],tgt:null,hAgro:null,hero:{},hk:{},KQS:null};ABX.dum=abxDummy();ABX.sb.en.push(ABX.dum);
  ABX.on=true;ABX.ctx=0;abxFresh();return true}catch(e){console.warn('ability preview start',e);try{abxStop()}catch(_){}return false}}
// a fresh copy of the hero and of the ability state for the next loop (the world's own are never touched)
function abxFresh(){const S=ABX.sb;let h={};try{h=JSON.parse(JSON.stringify(hero))}catch(_){h=Object.assign({},hero)}
  Object.assign(h,{chan:null,dash:null,buffs:[],cd:{},sh:0,shT:0,iv:0,lastHit:-1e9,mp:1e6,hp:heroMax()});
  for(const k in S.hero)if(!(k in h))h[k]=undefined;S.hero=h;
  const K=Object.assign({},KQS,{tg:null,gp:null,fire:0,cr0:0,ch:null,objs:[],cdn:{},hist:[],histT:0,stealth:0,unbrk:0,mIn:false,touch:null,eat:0,ret:null,ck:'',ca:null});S.KQS=K}
function abxStop(){if(!ABX.on)return;const W=ABX.w;
  try{abxRun(abxClean)}catch(_){}ABX.on=false;ABX.ctx=0;ABX.cyc++;
  try{const fl=W.hf||[];for(let i=0;i<fl.length;i+=2)HF[fl[i]]=fl[i+1]}catch(_){}
  try{if(ABX.fx){const L=ABX.fx.children.slice();L.forEach(o=>ABX.fx.remove(o))}}catch(_){}
  try{scene.add(pl);pl.position.copy(W.pos);pl.rotation.y=W.ry;pl.sw=W.sw;pl.visible=W.vis;HA=W.HA;
    if(W.rideH){const h=pl.children[0];h.position.y=W.rideH[0];h.position.z=W.rideH[1]}riding=W.riding;
    kqsStealthVis(false);if(KQS.stealth)kqsStealthVis(true)}catch(e){console.warn(e)}
  try{if(W.fxaPar){W.fxaPar.add(FXA.root);(W.fxaLive||[]).forEach(m=>m.visible=true)}}catch(_){}
  try{if(PV.obj===ABX.root){PV.sc.remove(ABX.root);PV.obj=null;PV.upd=null}if(W.cam){PV.cam.position.copy(W.cam.p);PV.cam.quaternion.copy(W.cam.q);PV.cam.fov=W.cam.fov;PV.cam.far=W.cam.far;PV.cam.updateProjectionMatrix()}}catch(_){}
  abxPtsClear();ABX.sb=null;ABX.dum=null;try{hsDirty()}catch(_){}}
function abxWatch(){if(!ABX.on||ABX.ctx)return;const x=$('xw');if(!PV.cv||!PV.cv.isConnected||PV.obj!==ABX.root||!x||x.classList.contains('hide')||xwMode!='abil'||(typeof mpLive=='function'&&mpLive()))abxStop()}
// closing the window, switching tab or opening another preview stops it before the next frame of the (unpaused) world
{const x=$('xw');if(x&&typeof MutationObserver!='undefined')new MutationObserver(()=>{try{abxWatch()}catch(_){}}).observe(x,{attributes:true,attributeFilter:['class'],childList:true,subtree:true})}
setInterval(()=>{try{abxWatch()}catch(_){}},300);

// ---------- one loop: reset, a short breath, cast, play it out ----------
function abxClean(){for(let n=0;n<6&&tws.length;n++){const L=tws.splice(0,tws.length);L.forEach(w=>{try{w.fn(1)}catch(_){}try{w.done&&w.done()}catch(_){}})}tws.length=0;
  try{kqsClear()}catch(_){}hero.chan=null;hero.dash=null;pl.step=null;
  shots.splice(0).forEach(s=>{try{scene.remove(s.m)}catch(_){}});zones.splice(0).forEach(z=>{try{if(z.mesh)scene.remove(z.mesh)}catch(_){}});traps.splice(0).forEach(t=>{try{scene.remove(t.mesh)}catch(_){}});
  if(typeof FXB_DEB!='undefined')FXB_DEB.splice(0).forEach(d=>{try{if(d.m)scene.remove(d.m)}catch(_){}});
  if(typeof FXA!='undefined'&&FXA.live)FXA.live.splice(0).forEach(m=>{m.visible=false;(m.isSprite?FXA.spool:FXA.pool).push(m)});
  if(typeof KQ!='undefined'&&KQ.fx)KQ.fx.splice(0).forEach(o=>{try{o.end&&o.end(true)}catch(_){}});if(typeof DTL!='undefined'&&DTL.live)DTL.live.length=0;
  if(ABX.fx)ABX.fx.children.slice().forEach(o=>ABX.fx.remove(o));abxPtsClear()}
function abxCycle(now){if(!ABX.on)return;abxRun(abxClean);ABX.cyc++;abxFresh();
  const s=ABX.s,P0=ABX.P0;ABX.D=abxDist(s);ABX.retry=0;
  pl.position.copy(P0);pl.position.y=ABX.y0;pl.rotation.y=Math.PI/2;pl.sw=0;HA.cur=null;HA.snap=null;HA.sb=0;HA.buf=0;
  abxPlaceDummy();ABX.t0=now;ABX.gt=0;ABX.tm=0;ABX.cast=0;ABX.quiet=0;ABX.hitT=0;ABX.camK=0}
function abxPlaceDummy(){const P0=ABX.P0;ABX.dm.position.set(P0.x+ABX.D,ABX.y0,P0.z);ABX.dm.rotation.set(0,-Math.PI/2,0);const e=ABX.dum;if(e){e.dead=false;e.dots=[];e.wx=ABX.dm.position.x;e.wz=ABX.dm.position.z}}
function abxCast(){const s=ABX.s,e=ABX.dum;
  hero.tal=Object.assign({},hero.tal||{},{__ld:s.n,['ab:'+s.n]:1});hero.lvl=Math.max(hero.lvl|0,s.lv|0);hero.mp=1e6;hero.cd={};KQS.cdn={};KQS.ck='';
  if(s.spend){hero.cr=100;hero.crT=nowP()}hero.hp=heroMax();tgt=e;face(kqsDir(pl.position,e.m.position));
  const sk=heroSkills()[0];if(!sk||sk.n!==s.n)return false;
  if(s.gt){KQS.gp=e.m.position.clone();KQS.fire=1}
  try{cast(0)}finally{KQS.gp=null;KQS.fire=0}
  return (hero.cd.s0||0)>0||!!KQS.ch||!!hero.chan}
function abxBusy(){return ABX.tm>0||tws.length||(typeof KQ!='undefined'&&KQ.fx&&KQ.fx.length)||KQS.objs.length||KQS.ch||hero.chan||hero.dash||shots.length||zones.length||traps.length||(typeof FXB_DEB!='undefined'&&FXB_DEB.length)||HA.cur}
// the per-frame step (the parts of the main loop an ability needs), inside the sandbox
function abxStep(now,dt){
  for(let i=tws.length-1;i>=0;i--){const w=tws[i];if(!w)continue;const k=Math.min(1,(now-w.t)/w.ms);try{w.fn(k)}catch(e){console.warn(e)}if(k>=1){const j=tws.indexOf(w);if(j>=0)tws.splice(j,1);try{w.done&&w.done()}catch(e){console.warn(e)}}}
  const t=ABX.gt;
  if(!ABX.cast&&t>=ABX.lead){ABX.cast=1;let ok=false;try{ok=abxCast()}catch(e){console.warn('ability preview cast',e)}
    if(!ok&&ABX.D>2.3){ABX.D=2.2;abxPlaceDummy();try{abxCast()}catch(_){}}}
  if(pl.step&&dt>0){walk(pl,pl.step.x*pl.step.sp*dt,pl.step.z*pl.step.sp*dt);pl.step.t-=dt;if(pl.step.t<=0)pl.step=null}
  if(hero.dash){walk(pl,hero.dash.x*14*dt,hero.dash.z*14*dt);hero.dash.t-=dt;burst(gY(pl.position,.3),0xbfd0ff,2,.3,.3,.3);if(hero.dash.t<=0)hero.dash=null}
  animHero(now,false);pl.position.y=GH(pl.position.x,pl.position.z);
  heroTick(dt,now);shotTick(dt);if(typeof kqFxTick=='function')kqFxTick(dt);
  const e=ABX.dum;if(e){e.dead=false;e.c.h=1e9;e.m.position.y=ABX.y0;e.vx=e.vz=0}
  // a loop ends once everything has played out (or after 6 s; long zones and channels are cut there)
  if(ABX.cast){ABX.quiet=abxBusy()?0:ABX.quiet+dt;if((t>ABX.lead+1.2&&ABX.quiet>.6)||t>ABX.lead+5.6)ABX.next=1}}
function abxUpd(now,dt){if(!ABX.on)return;dt=Math.min(.05,dt||.016);ABX.next=0;ABX.gt+=dt;
  abxRun(()=>abxStep(now,dt));if(!ABX.on)return;abxPtsStep(dt);
  // the dummy rocks and glows when hit
  const B=ABX.dmB;if(ABX.hitT>0){ABX.hitT-=dt;const a=Math.max(0,ABX.hitT/.35);B.rotation.z=.25*a*Math.sin(a*12);ABX.straw.emissive.set(ABX.s&&ABX.s.col||0xffd060).multiplyScalar(.6*a)}else{B.rotation.z=0;ABX.straw.emissive.setRGB(0,0,0)}
  abxCam(dt);if(ABX.next)abxCycle(now)}
// the camera keeps the hero and the dummy in frame (a leap back or a charge stays in view), seen a little from the front
function abxCam(dt){const c=PV.cam,P0=ABX.P0;if(!c)return;const hx=pl.position.x,dx=ABX.dm.position.x,a=Math.min(hx,dx,P0.x),b=Math.max(hx,dx,P0.x);
  const mid=(a+b)/2,half=Math.max(2.5,(b-a+2.4)/2),asp=c.aspect||1.6,fov=34,dist=half/(Math.tan(fov*Math.PI/360)*Math.max(1,asp));
  const k=ABX.camK?Math.min(1,dt*4):1;ABX.camK=1;ABX.cm=ABX.cm||{m:mid,d:dist};ABX.cm.m+=(mid-ABX.cm.m)*k;ABX.cm.d+=(dist-ABX.cm.d)*k;
  const yaw=.42,m=ABX.cm.m,d=ABX.cm.d,y=ABX.y0;c.fov=fov;c.far=Math.max(60,d*3);c.position.set(m+Math.sin(yaw)*d,y+.9+d*.3,P0.z+Math.cos(yaw)*d);c.lookAt(m,y+.75,P0.z);c.updateProjectionMatrix();
  const G=ABX.ground,r=Math.max(5,half+1.6);G.position.set(m,y,P0.z);G.scale.setScalar(r)}

// ---------- the panel ----------
{const f=XR.abil;XR.abil=function(){const r=f.apply(this,arguments);try{const det=document.querySelector('#xw .kqs-det');const s=kqsFind(hero.cls,KQS.sel)||heroSkills()[0];if(!det||!s)return r;
    det.insertAdjacentHTML('afterbegin',`<div class="abpv"><div class="abpvc" id="abPV"></div><div class="abpvl"><span>▶ Preview · ${s.i||''} ${s.n}</span><button data-abpv="1" title="Play it again">↻</button></div></div>`);
    abxShow($('abPV'),s)}catch(e){console.warn('v119 ability preview',e)}return r}}
$('xw').addEventListener('click',e=>{if(xwMode!='abil')return;const t=e.target.closest('[data-abpv]');if(!t)return;e.stopPropagation();if(ABX.on)abxCycle(performance.now())},true);
document.head.insertAdjacentHTML('beforeend',`<style>
#xw .abpv{margin:-2px -2px 10px;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:radial-gradient(ellipse at 50% 35%,#2c2418,#0e0b08 75%)}
#xw .abpvc{height:220px;position:relative}#xw .abpvc canvas{width:100%!important;height:100%!important;display:block}
#xw .abpvm{height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 18px;font-size:.8rem;color:var(--mut)}
#xw .abpvl{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 8px;font-size:.72rem;color:var(--mut);border-top:1px solid var(--line);background:rgba(0,0,0,.3)}
#xw .abpvl button{padding:1px 8px!important;font-size:.8rem!important}
@media (max-width:640px){#xw .abpvc{height:180px}}
</style>`);
