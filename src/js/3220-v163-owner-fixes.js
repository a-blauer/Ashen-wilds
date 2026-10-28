// ================= v163 owner's list (Oct 27 2026) =================
// 1. Attributes: the Reset button sits at the bottom of the attributes list (it was in the bar above it).
// 2. Quest trackers on desktop stopped jumping. ui161Desk (v161) cleared every tracker's top/right each 0.4 s while the older
//    tracker code (chqTrkPos132, mq143TrkPos, sp152TrkPos) set them again whenever a tracker's text changed: the tracker
//    jumped between two places (and Cheddar's sat on top of the main quest's). Now the layout stacks the trackers itself on
//    desktop too (under the minimap column, main quest first) and the older functions just ask the layout to run.
// 3. "Welcome back" and a zone title card no longer show on top of each other: whichever comes second waits for the first.
// 4. Melee attacks aim when they land: the swing re-aims at its hit moment (and the hero keeps turning during the wind-up) to a
//    locked target if there is one in reach, otherwise where the camera looks (mouse-look on, or on a phone) or at the mouse
//    pointer (desktop without mouse-look). Before, the direction was fixed when the attack was pressed.
// 5. Sovereign signature mechanics (v146: Hundred Eyes, Blood Covenant, Frozen Heart, Sever and Sear, Rune Scars, The Feast)
//    come half as often (60 s instead of 30 s between casts, less likely to be picked again). Argus' Hundred Eyes gives twice as
//    long to shut the eyes (the move's clock runs at half speed while eyes are open: ~19 s instead of ~9.5 s) and the four eyes
//    open ~10 m from the centre (like the other bosses' props) instead of on the walls 27 m out, ~38 m apart, which no hero
//    could reach in time. Vorraxis (Crystal Siphon) and Gorthrak (Glacial Rampage) were checked: props close by, unchanged.

// ---------- 1. Reset at the bottom of the attributes ----------
{const f=atr139Bar;atr139Bar=function(compact){const h=f.apply(this,arguments);return compact?h:h.replace(/<button data-at139x="reset"[^>]*>[^<]*<\/button>/,'')}}
{const f=ch139Render;ch139Render=function(){const r=f.apply(this,arguments);try{const at=$('ch139At');let d=$('ch163Rs');
    if(!d&&at){d=document.createElement('div');d.id='ch163Rs';at.after(d)}
    if(d)d.innerHTML=atr139Spent()&&!atr139PendN()?`<button data-at139x="reset" title="Take back every attribute point to spend again">Reset attributes (🪙 ${atr139ResetCost()})</button>`:''}catch(e){console.warn('v163 reset',e)}return r}}
document.head.insertAdjacentHTML('beforeend','<style id="v163css">#ch163Rs{display:flex;justify-content:flex-end;margin-top:6px}#ch163Rs:empty{display:none}</style>');

// ---------- 2. quest trackers: one layout owns them, desktop included ----------
var UI163_TRK=['mqt143','mqt152','fs160','dr170h','chqt132'];
UI161_TRK=UI163_TRK.filter(id=>UI161_TRK.indexOf(id)>=0).concat(UI161_TRK.filter(id=>UI163_TRK.indexOf(id)<0));   // main quest first
function ui163TrkDesk(pr,S,g,top){const m=$('mini');if(!m)return;const mr=m.getBoundingClientRect(),bb=$('bbar'),br=bb&&bb.offsetWidth?bb.getBoundingClientRect():null;
  const floor=Math.min(pr.bottom,br?br.top:pr.bottom)-g;let ty=top;
  UI161_TRK.forEach(id=>{const e=$(id);if(!e||!ui161Vis(e))return;const fx=getComputedStyle(e).position=='fixed';
    ui161Pos(e,{right:fx?innerWidth-mr.right:pr.right-mr.right,top:fx?ty:ty-pr.top,left:'auto',maxHeight:Math.max(40,floor-ty),overflow:'hidden'});
    ty=e.getBoundingClientRect().bottom+g})}
ui161Desk=function(pr,S,g){const m=$('mini'),lb=$('locBox'),sy=$('sysBtn'),fs=$('fsBtn'),sm=$('sysmenu'),ev=$('evtk');
  const P=(e,o)=>ui161Pos(e,o),X=x=>x-pr.left,Y=y=>y-pr.top;
  // clear anything the phone layout set (the trackers are placed below, so they are left alone)
  [['topl',['left','top']],['mini',['right','top']],['joy',['left','right','bottom']],['mbtn',['left','right','bottom']],['prompt',['bottom']],['glog',['left','bottom','width']],
   ['tgt',['left','top','width','transform']],['boss',['left','top','width','transform']]].forEach(([id,ks])=>{const e=$(id);if(e)ks.forEach(k=>{if(e.style[k])e.style[k]=''})});
  const mr=m.getBoundingClientRect(),kq=document.body.classList.contains('kq')?4*S.map:0;
  if(lb){P(lb,{left:X(mr.left-kq),top:Y(mr.bottom+kq+g),width:mr.width+2*kq,right:'auto',transform:'none'});try{v90Fit()}catch(_){}}
  const lr=lb&&ui161Vis(lb)?lb.getBoundingClientRect():null,rt=(lr?lr.bottom:mr.bottom+kq)+g;
  let x=pr.right-10*S.hud;[sy,fs].forEach(e=>{if(!e)return;const w=e.getBoundingClientRect().width||42*S.hud;P(e,{top:Y(rt),right:pr.right-x});x-=w+6*S.hud});
  const rowB=rt+(sy?sy.getBoundingClientRect().height:42*S.hud);
  if(sm)P(sm,{top:Y(rowB+g),right:10*S.hud,maxHeight:null});
  if(ev)P(ev,{top:Y(rowB+g),right:null});
  const er=ev&&ui161Vis(ev)?ev.getBoundingClientRect():null;
  try{ui163TrkDesk(pr,S,g,(er?er.bottom:rowB)+g*1.5)}catch(_){}};
// the older per-tracker placement now just runs the layout (it placed them in screen px, ignoring the HUD zoom)
{const lay=function(){try{ui161Lay(true)}catch(_){}};chqTrkPos132=lay;mq143TrkPos=lay;sp152TrkPos=lay}

// ---------- 3. one title card at a time ----------
var TC163={zT:0,wT:0};
{const f=zt116Show;zt116Show=function(){const a=arguments,s=this,w=TC163.wT-nowP();
  if(w>0){clearTimeout(TC163.zq);TC163.zq=setTimeout(()=>{TC163.zT=nowP()+5200;f.apply(s,a)},w);return}
  TC163.zT=nowP()+5200;return f.apply(this,arguments)}}
{const f=banner;banner=function(t){if(typeof t=='string'&&/^Welcome back/.test(t)){const a=arguments,s=this,w=TC163.zT-nowP();
    if(w>0){setTimeout(()=>{TC163.wT=nowP()+3400;f.apply(s,a)},w+150);return}TC163.wT=nowP()+3400}
  return f.apply(this,arguments)}}

// ---------- 4. attacks aim when they land ----------
// For 1.5 s after an attack is pressed, aimDir answers with aim163 (ranged weapons call it again when the shot leaves); a melee
// swing's direction vector is updated in place every frame of its wind-up and once more at its hit moment.
var SW163={A:null,d:null,until:0,cap:0,got:null,base:null};
function aim163(base){const t=tgt;
  if(t&&!t.dead&&enemies.indexOf(t)>=0&&d2(t.m.position,pl.position)<9)return base();          // locked on: the target
  if(typeof KQS!='undefined'&&KQS.gp)return base();                                                // an aimed ground point
  if((typeof orb!='undefined'&&orb)||document.body.classList.contains('mob'))return camFwd();     // where the camera looks
  return base()}                                                                                    // desktop: the mouse pointer
{const a0=aimDir;SW163.base=a0;aimDir=function(){if(nowP()<SW163.until){const v=aim163(a0);if(SW163.cap&&!SW163.got)SW163.got=v;return v}return a0.apply(this,arguments)}}
function sw163Live(){const v=aim163(SW163.base);return v&&v.lengthSq()>.01?v:null}
{const f=swing;swing=function(){const A0=HA.cur;SW163.until=nowP()+1500;SW163.cap=1;SW163.got=null;let r;
  try{r=f.apply(this,arguments)}finally{SW163.cap=0}
  try{const A=HA.cur,got=SW163.got;if(got&&A&&A!==A0&&A.onHit&&!A.hit){SW163.A=A;SW163.d=got;const cb=A.onHit;
      A.onHit=function(){if(SW163.A===A){const v=sw163Live();if(v){SW163.d.copy(v);face(v)}SW163.A=null}return cb.apply(this,arguments)}}}catch(_){}
  return r}}
{const f=loop;loop=function(now){const r=f.apply(this,arguments);try{const A=SW163.A;
    if(A&&HA.cur===A&&!A.hit&&SW163.d){const v=sw163Live();if(v){SW163.d.copy(v);face(v)}}else if(A&&HA.cur!==A)SW163.A=null}catch(_){}return r}}

// ---------- 5. Sovereign signatures ----------
var SIG163={K:.5,cd:60,again:4,
  W:{hundred:[.8,10.3],covenant:[.9,10.3],heart:[.7,10.1],sever:[1.25,10.3],scars:[1.0,10.0],feast:null},  // [eyes open, gaze ends] = the stretched part
  argR:10};
try{SVB.forEach(B=>{if(!B||!B.M)return;for(const id in SIG163.W){const D=B.M[id];if(!D||D.sig163s)continue;D.sig163s=1;D.cd=SIG163.cd;
  const w=D.wt;D.wt=function(e,L){const v=typeof w=='function'?w.apply(this,arguments):(+w||0);return v>=30?v:Math.min(v,SIG163.again)}}
  const H=B.M.hundred;if(H)H.sig163=SIG163.W.hundred})}catch(e){console.warn('v163 sig',e)}
// Argus: the move's clock runs at half speed while any eye is still open (the eyes keep firing on their own clock)
{const f=svTickMove;svTickMove=function(e,dt,now){try{const S=e&&e.sv,M=S&&S.mv,W=M&&M.D&&M.D.sig163;
    if(W&&M.t>W[0]&&M.t<W[1]&&M.an&&M.an.props&&!M.an.done2&&sk146Alive(M.an.props).length)dt*=SIG163.K}catch(_){}return f.call(this,e,dt,now)}}
// Argus: the four Watcher Eyes open SIG163.argR from the centre (was ARENA_R-1.2 = 26.8, on the walls of the doubled den)
arg146EyesStart=function(c){const e=c.e,S=c.S,A=c.A;if(!A)return;S.dr=.2;const D=sk146Den(A),a0=Math.random()*6.283,R0=SIG163.argR;
  S.gone146=1;S.ghost=1;c.M.an.ghost=kqSpr(0xffd040,2.2);c.M.an.ghost.position.copy(gY(e.m.position,2.6));sk146DenAdd(A,c.M.an.ghost);
  for(let k=0;k<20;k++)burst(gY(e.m.position,1+Math.random()*2),0x8a9a7a,3,2,1.5,1);
  const L=[0,1,2,3].map(k=>{const a=a0+k/4*6.283,x=A.cx+Math.cos(a)*R0,z=A.cz+Math.sin(a)*R0,W=arg146Watcher();W.g.rotation.y=Math.atan2(A.cx-x,A.cz-z);W.g.scale.setScalar(.01);let t=0,ft=1.2+k*.45;
    return {x,z,n:'Watcher Eye',frac:.016,mesh:W.g,hbY:3.6,hbS:.8,cupY:1.9,
      tick(pe,dt,now){t+=dt;W.g.scale.setScalar(Math.min(1,t/.6));const P=pl.position,p=pe.m.position;W.ir.lookAt(P.x,GH(P.x,P.z)+1.2,P.z);W.gl.scale.setScalar(1.6+.4*Math.sin(now/120+k));
        W.g.userData.lids.forEach(l=>{l.position.y=1.9+l.userData.s*(.62+.06*Math.sin(now/300+k))});
        ft-=dt;if(ft<=0&&AF&&!e.dead){ft=2.2;const from=gY(p,1.9),q=new THREE.Vector3(P.x,0,P.z),S2={k:'c',r:1.6},an={x:q.x,z:q.z,a:0};c.M.warn.push(svWarn(S2,an,.8));
          svShot(from,new THREE.Vector3(q.x,GH(q.x,q.z)+.3,q.z),.8,ARG.col,1.2,2.5,Pp=>{if(e.dead||!AF)return;burst(Pp,ARG.col,16,2.4,2,.5);sk146Crack(Pp,0xffb030,1.2,1.8);svHitNow(e,S2,an,.7,{})});svSnd('crack',.5,1.7)}},
      die(pe,killed){if(killed){const p=gY(pe.m.position,1.9);sk146Drops(p,0xd8ccb0,16,3.5,3,{splats:4,dc:0x3a2a08});sk146Drops(p,0x6a1c24,14,3,3,{splats:4});burst(p,ARG.col,40,3,3,.7);sk146Flash(p,ARG.col,3.5,10,500);popT(pe.m.position,'👁 SHUT','#ffe08a');svSnd('squelch',1.2,1);svSnd('stag',.5,1.4)}W.mats.forEach(m=>m.dispose())}}});
  const P=sk146Props(A,L);c.M.an.props=P;D.props=(D.props||[]).concat(P);svSnd('roar',.9,.6);
  try{banner('👁 THE HUNDRED EYES','Argus sinks into the fog — four great eyes open around the hollow','Shut all four before the gaze completes!')}catch(_){}say('👁 Argus hides in the fog: shut the four Watcher Eyes around the hollow!')};
try{const T=DSTXT[0].atk.find(a=>/Hundred Eyes/.test(a[0]));if(T)T[1]=T[1].replace('on the walls','around the hollow')}catch(_){}

// ---------- 6. weapons never spin in the hand ----------
// Measured before (every class and weapon, every frame of three attacks; the weapon's turn against its hand): the halberd's
// edge roll went 90° → -166° → 75° → 121° in four frames at the start of each blow (a full spin), the twin axes' roll jumped
// 40-72° in one frame, and the melee weapons and the bow whipped 60-104° in a frame from the carry hold to the strike hold as
// each attack started (the two holds are 104-120° apart).
// Causes: gripEdge (1270) turned the edge at once (exp(-120 dt)) to the tip's velocity on every fast frame, and in the first
// frames of a blow that velocity points all over the place; and between attacks the hands went back to the carry hold.
// Now, for the hero:
//  (a) the edge roll a swing needs is worked out before the swing moves: edge163Plan poses the arm at points through the blow
//      from the swing's own animation curve (A.pose, the same channels animHero writes), finds where the blade moves fastest
//      across the handle, and puts the bones back (nothing is drawn in between). Cached per swing animation and hand;
//  (b) the roll turns toward it from the first frame of the swing: at once while the hand is still coming from the carry hold
//      (it is part of that turn), otherwise at most EDGE163.wind rad/s through the wind-up and EDGE163.rate through the blow
//      (where it also follows the blade's motion, ignoring readings more than EDGE163.jump away), always the short way round
//      (never a wrap), and it keeps that roll through the follow-through;
//  (c) for EDGE163.hold s after an attack, and while a fight is on (a locked target, a monster hunting the hero within
//      EDGE163.near), the hands keep the strike hold, coming up into it over EDGE163.raise s instead of in two frames.
// Others (co-op partners, humanoid foes) keep v148's rule but pick their roll once per blow and turn at the capped rate.
var EDGE163={rate:22,wind:10,jump:1.75,hold:2,raise:.35,near:10,last:-1e9,cache:new WeakMap(),fT:0,fV:false};
function edge163Fight(){const t=nowP();if(t-EDGE163.fT<150)return EDGE163.fV;EDGE163.fT=t;let v=t-EDGE163.last<EDGE163.hold*1000;
  if(!v&&typeof tgt!='undefined'&&tgt&&!tgt.dead&&d2(tgt.m.position,pl.position)<EDGE163.near+2)v=true;
  if(!v)for(const e of enemies){if(!e.dead&&e.agg&&!e.minion&&d2(e.m.position,pl.position)<EDGE163.near){v=true;break}}
  return EDGE163.fV=v}
function edge163Step(e,tg,dt,rate){if(tg==null||!(dt>0))return;const d=gripWrap(tg-e.psi),m=(rate||EDGE163.rate)*dt;e.psi=gripWrap(e.psi+Math.max(-m,Math.min(m,d)))}
function edge163Key(e){return (e.side||'R')+'|'+((e.W&&e.W.userData&&e.W.userData.wt)||'')}
function edge163Win(A){return A.k>=.22&&A.k<=Math.min(.58,(A.hitAt<=1?A.hitAt:.42)+.1)}
// the roll the blow needs, from the swing's own pose curve (null if it cannot tell)
function edge163Plan(h,e,A){const b=h.bones,W=e.W,bn=W&&W.parent;if(!b||!bn||typeof A.pose!='function'||!e.S)return null;
  const saved=[];for(const c in HACH){const [n,ax]=HACH[c];if(b[n])saved.push([b[n],ax,b[n].rotation[ax]])}
  const k0=.22,k1=Math.min(.58,(A.hitAt<=1?A.hitAt:.42)+.1),tipL=new THREE.Vector3(0,-.6,0).applyQuaternion(e.S.q).add(new THREE.Vector3(...e.S.p));
  let prev=null,best=null,bs=0;
  try{for(let k=k0;k<=k1+1e-6;k+=.02){const P=A.pose(k);for(const c in P){if(HA_LEGS[c])continue;const ch=HACH[c];if(ch&&b[ch[0]])b[ch[0]].rotation[ch[1]]=P[c]}
      h.updateMatrixWorld(true);const tip=tipL.clone().applyMatrix4(bn.matrixWorld);h.worldToLocal(tip);
      if(prev){const v=tip.clone().sub(prev);h.getWorldQuaternion(GRIP_TQ);bn.getWorldQuaternion(GRIP_TQ2);GRIP_TQ.invert().multiply(GRIP_TQ2).multiply(e.S.q).invert();v.applyQuaternion(GRIP_TQ);
        const sp=Math.hypot(v.x,v.z);if(sp>bs&&sp>=Math.abs(v.y)*.35){bs=sp;best=Math.atan2(-v.z,v.x)}}
      prev=tip}}
  catch(err){best=null}
  finally{saved.forEach(([o,ax,v])=>{o.rotation[ax]=v});h.updateMatrixWorld(true)}
  return best}
function edge163Target(h,e,A){let C=EDGE163.cache.get(A.pose);if(!C){C={};EDGE163.cache.set(A.pose,C)}const k=edge163Key(e);
  if(!(k in C))C[k]=edge163Plan(h,e,A);let tg=C[k];if(tg==null)return null;
  if(e.edge==2&&Math.abs(gripWrap(tg-e.psi))>Math.PI/2)tg=gripWrap(tg+Math.PI);   // a double edge: whichever side is nearer
  return tg}
// through the blow the edge follows the blade's motion (v148), but never by a jump: a reading more than EDGE163.jump away from
// where the edge points is the noisy start of a blow or the swing reversing, and is ignored; the turn is capped at EDGE163.rate
gripEdge=function(h,e,dt){
  const hero=h===pl&&HA.cur&&e.pa163===HA.cur;
  const W=e.W,bn=W.parent;bn.updateWorldMatrix(true,false);
  const tip=new THREE.Vector3(0,-.6,0).applyQuaternion(e.S.q).add(new THREE.Vector3(...e.S.p)).applyMatrix4(bn.matrixWorld);h.worldToLocal(tip);
  const prev=e.tip;e.tip=tip;
  if(!prev){e.pk=0;e.lk=hero?e.pl163:null;if(e.lk!=null)edge163Step(e,e.lk,dt);return}
  const v=tip.clone().sub(prev).divideScalar(dt),vs=v.length();e.pk=Math.max(e.pk||0,vs);
  if(vs>=e.pk*.4){h.getWorldQuaternion(GRIP_TQ);bn.getWorldQuaternion(GRIP_TQ2);GRIP_TQ.invert().multiply(GRIP_TQ2).multiply(e.S.q).invert();v.applyQuaternion(GRIP_TQ);
    const sp=Math.hypot(v.x,v.z);if(sp>=1.6&&sp>=Math.abs(v.y)*.35){let tg=Math.atan2(-v.z,v.x);if(e.edge==2&&Math.abs(gripWrap(tg-e.psi))>Math.PI/2)tg=gripWrap(tg+Math.PI);
      if(e.lk==null||Math.abs(gripWrap(tg-e.psi))<=EDGE163.jump)e.lk=tg}}
  edge163Step(e,e.lk,dt)};
{const f=gripTick;gripTick=function(h,now,el,att){
  try{if(h===pl&&h._grip){const S=h._grip,A=HA.cur;
      if(A)EDGE163.last=nowP();
      if(att==null&&!A&&!pl.sw&&!hero.chan&&!(typeof riding!='undefined'&&riding)&&now!=null&&S.t!=null&&edge163Fight()){const dt=(now-S.t)/1000;
        if(dt>0&&dt<.5){S.w=Math.max(0,(S.w==null?1:S.w)-dt/EDGE163.raise);S.t=now}att=true}
      if(A&&now!=null){const dt=S.t!=null?(now-S.t)/1000:0,fromCarry=S.w==null||S.w>.3;
        S.L.forEach(e=>{if(!e.edge||!e.S||e.psi==null)return;
          if(e.pa163!==A){e.pa163=A;e.pl163=edge163Target(h,e,A);if(e.pl163!=null&&fromCarry)e.psi=e.pl163}
          else if(dt>0&&dt<.5&&!edge163Win(A)&&e.pl163!=null)edge163Step(e,e.pl163,dt,EDGE163.wind)})}}}catch(_){}
  return f.call(this,h,now,el,att)}}
