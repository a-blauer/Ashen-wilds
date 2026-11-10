// ================= v212: Space dashes; Shift is each class's own defence =================
// Owner (Nov 9 2026): "Let's make spacebar dash, and have shift do different things depending on class." · Warrior: hold the weapon up
// and try to block a normal attack (not spells); timed right, half the hit's damage and half of it back as a shield that decays over
// 5 s and stacks · Paladin: hold the shield up, a basic attack is fully blocked for 1 stamina, no timing, not spells · Assassin: a
// timed parry takes the whole hit, not spells · Mage: toggle a magical shield that turns damage into mana spent, spells too ·
// Ranger: the pet shouts a taunt that pulls every enemy targeting the hero onto it for 3 s · "custom animations and effects for each".
//  * Keys (0005 KB161): Dash's default key is Space (' '), the new 'guard' action is Shift ('shift'). 0108 dashes on ' ' (Space no
//    longer swings; Left click attacks). Special levels keep their own keys (the Ascent: Space jumps, Shift boosts; the sand rig).
//  * What counts as a spell (gd212Spell): magic damage from a tick, pool or hazard (direct hitHero(…,'m')), a magic projectile, a move
//    that names magic itself (hitTarget(…,'m'): Rain of Fire, magic signature moves), or anything that lands while the attacker is
//    out of melee reach (ranged ground blasts, Sovereign spells cast from afar). Everything else is a normal attack, whatever the
//    attacker's damage type (a Spirit's claw is still a claw).
//  * Timing: a press opens the window (GD212.win s: warrior .32, assassin .22); a new attempt needs GD212.gap s since the last press,
//    so mashing Shift does not keep the window open. Holding guard slows you (Guarding, −45% move) and stops basic attacks.
//  * Shields stay out of hero.sh between hits: the warrior's stacks (GD212.wsh) and the mage's mana are lent to hero.sh only while a
//    hit is worked out, own layers first, then other shields; what they absorbed is taken from the stacks / mana.
//  * Co-op: the guard poses go through haPlay ('P'); the effects through gd212Fx and the auras through gd212St (relayed, plain
//    arguments; the partner draws them on the sender's hero model). A guest's taunt also reaches the region host (gd212Fx 'taunt'
//    on the host turns its monsters onto the guest's companion copy, which 3091 relays back as an attack on that companion).
var GD212={win:{warrior:.32,assassin:.22},gap:.5,slow:-.45,wshT:5000,wsh:[],mana:false,mr:1,tCd:12,tT:3000,tR:16,
  hold:false,t0:-1e9,last:-1e9,A:null,poseT:0,cdT:0,inShot:0,stT:0,stK:'',mk:[],err:0};
var GD212C=null;   // the hit being worked out: {k:'t'|'b', mt0, shot}
function gd212Can(){try{return party.length>0&&hero.hp>0&&!uiOpen()&&!riding&&!hero.chan&&!(typeof AWD!='undefined'&&AWD.dead)&&!(typeof RV148!='undefined'&&RV148.down)
  &&!(typeof SR165!='undefined'&&SR165.on)&&!(typeof ch153Run=='function'&&ch153Run())&&!(typeof fishing!='undefined'&&fishing)}catch(_){return false}}
function gd212Holds(c){return c==='warrior'||c==='paladin'||c==='assassin'}
// ---------------- poses (haPlay channels; the partner gets them as 'P') ----------------
var GD212P={
  warrior:{ax:-1.45,lx:-1.45,ex:-.95,le:-.95,az:-.25,lz:.25,sy:.28,sx:.08,hx:.08},     // the blade lifted across the face
  paladin:{lx:-1.18,lz:.32,le:.45,ax:-.35,ex:-.5,sx:.14,hx:.06},                         // the shield up before the chest
  assassin:{ax:-1.3,lx:-1.3,ex:-1.3,le:-1.3,az:-.5,lz:.5,sx:.25,hx:.1}};               // both blades crossed before the face
function gd212Mix(P,s){const o={};for(const k in P)o[k]=P[k]*s;return o}
function gd212Raise(cls,fromUp){const P=GD212P[cls];if(!P)return;const ms=4000,up=fromUp?0:160/ms;
  haPlay(ms,k=>{const s=up?Math.min(1,k/up):1;return gd212Mix(P,up?haOut(s):1)},2,null,fromUp?.02:.06);GD212.A=HA.cur;GD212.poseT=nowP()}
function gd212Lower(cls){const P=GD212P[cls];if(!P)return;if(HA.cur!==GD212.A){GD212.A=null;return}haPlay(200,k=>gd212Mix(P,1-haIO(Math.min(1,k))),2,null,.02);GD212.A=null}
// one-shot gestures: the mage's ward cast, the ranger's command
function gd212Gesture(k){if(k==='mage')haPlay(520,k=>{const s=k<.35?haOut(k/.35):1-haIO((k-.35)/.65);return {ax:-1.5*s,az:-.9*s,lx:-1.5*s,lz:.9*s,ex:-.5*s,le:-.5*s,sx:-.12*s,hx:-.15*s}},2,null,.08);
  else haPlay(560,k=>{const s=k<.3?haOut(k/.3):1-haIO((k-.3)/.7);return {ax:-1.55*s,ex:-.15*s,az:-.15*s,sy:-.35*s,sx:.1*s,lx:.25*s,hx:-.1*s}},2,null,.08)}
// ---------------- input ----------------
function gd212Down(){const c=hero&&hero.cls;if(!c||!gd212Can())return;const now=nowP();
  if(gd212Holds(c)){if(GD212.hold)return;GD212.hold=true;if(now-GD212.last>=GD212.gap*1000)GD212.t0=now;GD212.last=now;
    try{gd212Raise(c)}catch(_){}gd212Fx('raise',c,0,0);return}
  if(c==='mage'){gd212Mana(!GD212.mana);return}
  if(c==='ranger')gd212Taunt()}
function gd212Up(){if(!GD212.hold)return;GD212.hold=false;try{gd212Lower(hero.cls)}catch(_){}}
addEventListener('keydown',e=>{if(e.key!=='Shift'||e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;const t=e.target;if(t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'||t.isContentEditable))return;gd212Down()});
addEventListener('keyup',e=>{if(e.key==='Shift')gd212Up()});
addEventListener('blur',()=>gd212Up());
// guarding stops basic attacks; an ability or a dash lowers the guard first
{const f=swing;swing=function(){if(GD212.hold&&gd212Holds(hero.cls))return;return f.apply(this,arguments)}}
{const f=cast;cast=function(){if(GD212.hold)gd212Up();return f.apply(this,arguments)}}
{const f=dodge;dodge=function(){if(GD212.hold){GD212.hold=false;GD212.A=null}return f.apply(this,arguments)}}
// ---------------- what a hit is ----------------
{const f=hitTarget;hitTarget=function(e,tg,mult,mt0){if(tg!==pl)return f.apply(this,arguments);const c0=GD212C;GD212C={k:'t',mt0,shot:GD212.inShot>0};try{return f.apply(this,arguments)}finally{GD212C=c0}}}
{const f=bossHit;bossHit=function(){const c0=GD212C;GD212C={k:'b'};try{return f.apply(this,arguments)}finally{GD212C=c0}}}
{const f=eshotTick;eshotTick=function(){GD212.inShot++;try{return f.apply(this,arguments)}finally{GD212.inShot--}}}
{const f=kqFxTick;kqFxTick=function(){const s=GD212.inShot;GD212.inShot=0;try{return f.apply(this,arguments)}finally{GD212.inShot=s}}}
function gd212Spell(e,mt){const C=GD212C;
  if(!C)return mt==='m';                 // called straight: ticks, pools, hazards — the magic ones are spells
  if(C.shot)return mt==='m';             // projectiles: arrows, rocks and spit are attacks, bolts of magic are spells
  if(C.mt0==='m')return true;            // a move that names magic itself
  if(!e||!e.m||!e.m.position)return true;
  const boss=C.k==='b'||e.boss||e.sv,r=boss?9:3.6+(e.c&&e.c.al?1.2:0)+Math.max(0,(e.m.bs||1)-1);
  return Math.hypot(e.m.position.x-pl.position.x,e.m.position.z-pl.position.z)>r}
// ---------------- shields lent to hero.sh for one hit ----------------
function gd212WshSum(now){let s=0;GD212.wsh=GD212.wsh.filter(q=>{const k=1-(now-q.t0)/GD212.wshT;if(k<=0||q.a0<=.01)return false;s+=q.a0*k;return true});return s}
function gd212WshUse(x,now){for(const q of GD212.wsh){if(x<=0)break;const k=Math.max(0,1-(now-q.t0)/GD212.wshT),r=q.a0*k;if(r<=0)continue;const u=Math.min(r,x);q.a0*=(r-u)/r;x-=u}}
function gd212Absorb(f,self,args){const now=nowP(),ws=gd212WshSum(now),mg=GD212.mana&&hero.cls==='mage',mc=mg?Math.max(0,hero.mp)/GD212.mr:0,ex=ws+mc,hp0=hero.hp,sh0=hero.sh||0;
  if(ex>0)hero.sh=sh0+ex;let r,used=0;
  try{r=f.apply(self,args)}finally{const sh1=hero.sh||0;used=Math.max(0,sh0+ex-sh1);
    if(ex>0){const mine=Math.min(ex,used);hero.sh=Math.max(0,sh1-(ex-mine));let left=mine;const w=Math.min(ws,left);if(w>0)gd212WshUse(w,now);left-=w;
      if(mg&&left>0){const pay=left*GD212.mr;hero.mp=Math.max(0,hero.mp-pay);gd212Fx('mHit',Math.round(pay),0,0);if(hero.mp<1){GD212.mana=false;gd212Fx('mShatter',0,0,0);try{say('🔮 Your mana ward shatters — out of mana.')}catch(_){}}}
      if(w>0)gd212Fx('wHit',Math.round(w),0,0)}}
  return {r,dealt:Math.max(0,hp0-hero.hp)+used}}
{const f=hitHero;hitHero=function(e,mult,mt){
  let ok=false;try{ok=hero.hp>0&&!(hero.iv>0)&&townAt(pl.position.x,pl.position.z,.5)<0&&!(typeof AWD!='undefined'&&AWD.dead)&&!(typeof RV148!='undefined'&&RV148.down)}catch(_){}
  if(!ok)return f.apply(this,arguments);
  const c=hero.cls;let spell=true;try{spell=gd212Spell(e,mt||(e&&e.c&&e.c.mt))}catch(_){}
  try{if(GD212.hold&&!spell&&gd212Holds(c)){const now=nowP(),dt=(now-GD212.t0)/1000,ang=e&&e.m?Math.atan2(e.m.position.x-pl.position.x,e.m.position.z-pl.position.z):pl.rotation.y;
    if(c==='paladin'){if((hero.dc||0)>=1){hero.dc-=1;GD212.stamT=now;gd212Fx('pblock',ang,Math.floor(hero.dc),0);try{if(typeof AWD!='undefined'&&e){AWD.src=e;AWD.srcT=performance.now()}}catch(_){}return}
      gd212Fx('break',ang,0,0)}
    else if(c==='assassin'){if(dt<=GD212.win.assassin){gd212Fx('parry',ang,0,0);try{if(e&&!e.dead&&!e.boss&&!e.sv&&!e.mir){if(e.atk)mCancel(e);e.stun=Math.max(e.stun||0,.7)}}catch(_){}
        hero.pcrit=now+2500;slowT=Math.max(slowT,.4);return}
      gd212Fx('miss',ang,0,0)}
    else if(c==='warrior'){if(dt<=GD212.win.warrior){const a=Array.prototype.slice.call(arguments);a[1]=(mult==null?1:mult)*.5;const o=gd212Absorb(f,this,a);
        if(o.dealt>0)GD212.wsh.push({a0:o.dealt,t0:now});gd212Fx('block',ang,Math.round(o.dealt),0);return o.r}
      gd212Fx('miss',ang,0,0)}}}catch(err){if(!GD212.err++)console.warn('v212 guard',err)}
  return gd212Absorb(f,this,arguments).r}}
// ---------------- mage: the mana ward ----------------
function gd212Mana(on){if(on===GD212.mana)return;if(on&&hero.mp<Math.max(5,mpMax()*.05)){try{dn(pl.position,'Not enough mana','#9ab8ff',-20,900)}catch(_){}return}
  GD212.mana=on;try{gd212Gesture('mage')}catch(_){}gd212Fx(on?'mOn':'mOff',0,0,0);try{say(on?'🔮 Mana ward up: damage drains your mana instead of your health (Shift again to drop it).':'🔮 Mana ward down.')}catch(_){}try{hud()}catch(_){}}
// ---------------- ranger: the pet's taunt ----------------
function gd212Pet(){const n=typeof actN141=='function'?actN141():1;let best=-1,bd=1e9;for(let i=0;i<Math.min(2,n);i++){const c=party[i],f=fols[i];if(!c||c.h<=0||!f||!f.visible)continue;
    const d=f.position.distanceTo(pl.position);if(d<bd){bd=d;best=i}}return best}
function gd212Taunt(){const now=nowP();if(now<GD212.cdT){try{dn(pl.position,'Taunt ready in '+Math.ceil((GD212.cdT-now)/1000)+'s','#e8c8a0',-20,700)}catch(_){}return}
  const i=gd212Pet();if(i<0){try{dn(pl.position,'No companion to taunt','#e8c8a0',-20,900)}catch(_){}return}
  const fo=fols[i];let n=0;
  enemies.forEach(e=>{if(e.dead||!e.m||e.boss||e.sv||e.mir||e._tg212!==pl||!e.agg)return;if(e.m.position.distanceTo(fo.position)>GD212.tR&&e.m.position.distanceTo(pl.position)>GD212.tR)return;
    e.tz212={g:fo,k:i,t:now+GD212.tT};if(e.atk&&e.atk.ph===0)try{mCancel(e)}catch(_){}n++;GD212.mk.push({e,t:now+GD212.tT})});
  GD212.cdT=now+(n?GD212.tCd:3)*1000;try{gd212Gesture('ranger')}catch(_){}
  gd212Fx('taunt',i,n,0);try{hud()}catch(_){}}
{const f=eTarget;eTarget=function(e,m,dpl){
  // a taunt that ran out lets go of the companion (the v43 rule would keep the monster on it while it stays close)
  try{const z=e.tz212;if(z&&(e.dead||nowP()>z.t)){e.tz212=null;if(z.k!=null&&e.tgI===z.k)e.tgI=null;if(z.of&&e.tg150===z.g)e.tg150=null}}catch(_){}
  let tg=f.apply(this,arguments);
  try{const z=e.tz212;if(z){{const g=z.g;if(g&&g.parent&&g.visible){if(z.k!=null){const c=party[z.k];if(c&&c.h>0){e.tgI=z.k;tg=g}else e.tz212=null}else{if(z.of)g.mpFolOf=z.of;e.tg150=g;tg=g}}else e.tz212=null}}}catch(_){}
  e._tg212=tg;return tg}}
// ---------------- effects (relayed: the partner plays them on the sender's hero) ----------------
function gd212Who(){if(typeof MPV!='undefined'&&MPV.rep&&typeof MP!='undefined'&&MP.rh){let b=null,bd=3;for(const k in MP.rh){const r=MP.rh[k];if(!r||!r.m||!r.m.visible)continue;const d=r.m.position.distanceTo(pl.position);if(d<bd){bd=d;b=k}}return b?{H:MP.rh[b].m,r:MP.rh[b],k:b}:null}
  return {H:pl,r:null,k:null}}
function gd212Tex(k){GD212.tx=GD212.tx||{};if(GD212.tx[k])return GD212.tx[k];const S=256,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),C=S/2;
  if(k==='hex'){// the warrior's bulwark: a lattice of steel hexes, brightest at the seams
    g.fillStyle='rgba(255,255,255,.05)';g.fillRect(0,0,S,S);g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=3;const R=S/8,h=R*Math.sqrt(3)/2;
    for(let y=-1;y<10;y++)for(let x=-1;x<6;x++){const cx=x*R*3+(y%2?R*1.5:0),cy=y*h;g.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;g[i?'lineTo':'moveTo'](cx+Math.cos(a)*R*.92,cy+Math.sin(a)*R*.92)}g.closePath();g.stroke()}}
  else if(k==='rune'){// the mage's ward: drifting circles and angular runes
    g.fillStyle='rgba(255,255,255,.04)';g.fillRect(0,0,S,S);g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=2.5;let s=7;const R=()=>{s=(s*16807)%2147483647;return s/2147483647};
    for(let i=0;i<14;i++){const x=R()*S,y=R()*S,r=8+R()*14;g.beginPath();g.arc(x,y,r,0,6.283);g.stroke();g.beginPath();for(let j=0;j<4;j++){const a=R()*6.283;g[j?'lineTo':'moveTo'](x+Math.cos(a)*r*.7,y+Math.sin(a)*r*.7)}g.stroke()}
    for(let i=0;i<5;i++){g.beginPath();g.moveTo(0,i*S/5+R()*10);g.bezierCurveTo(S*.3,R()*S,S*.7,R()*S,S,i*S/5);g.globalAlpha=.4;g.stroke();g.globalAlpha=1}}
  else if(k==='circle'){// a rune circle on the ground
    g.strokeStyle='#fff';g.lineWidth=5;g.beginPath();g.arc(C,C,C*.92,0,6.283);g.stroke();g.lineWidth=2;g.beginPath();g.arc(C,C,C*.74,0,6.283);g.stroke();
    for(let i=0;i<12;i++){const a=i/12*6.283;g.save();g.translate(C+Math.cos(a)*C*.83,C+Math.sin(a)*C*.83);g.rotate(a+1.57);g.beginPath();g.moveTo(-7,6);g.lineTo(0,-8);g.lineTo(7,6);g.moveTo(-4,0);g.lineTo(4,0);g.stroke();g.restore()}
    g.beginPath();for(let i=0;i<7;i++){const a=i/6*6.283*3/1;g[i?'lineTo':'moveTo'](C+Math.cos(a/3)*C*.7,C+Math.sin(a/3)*C*.7)}g.stroke()}
  else if(k==='sigil'){// the paladin's aegis: a sunburst behind a cross
    const gr=g.createRadialGradient(C,C,0,C,C,C);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.35,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,S,S);
    g.strokeStyle='#fff';g.lineWidth=6;g.beginPath();g.arc(C,C,C*.8,0,6.283);g.stroke();g.lineWidth=3;for(let i=0;i<16;i++){const a=i/16*6.283,r0=C*.5,r1=C*(i%2?.72:.8);g.beginPath();g.moveTo(C+Math.cos(a)*r0,C+Math.sin(a)*r0);g.lineTo(C+Math.cos(a)*r1,C+Math.sin(a)*r1);g.stroke()}
    g.fillStyle='#fff';g.fillRect(C-9,C-C*.5,18,C);g.fillRect(C-C*.36,C-C*.16,C*.72,18)}
  else if(k==='slash'){// the assassin's parry: a thin crescent, hot in the middle
    const gr=g.createLinearGradient(0,0,S,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');
    g.strokeStyle=gr;g.lineCap='round';for(let i=0;i<3;i++){g.lineWidth=14-i*5;g.globalAlpha=.35+i*.3;g.beginPath();g.arc(C,S*1.15,S*.95,Math.PI*1.25,Math.PI*1.75);g.stroke()}g.globalAlpha=1}
  else if(k==='shout'){// the taunt: a jagged ring
    g.strokeStyle='#fff';g.lineWidth=7;g.beginPath();for(let i=0;i<=48;i++){const a=i/48*6.283,r=C*(.84+(i%2?.08:0));g[i?'lineTo':'moveTo'](C+Math.cos(a)*r,C+Math.sin(a)*r)}g.stroke()}
  const t=new THREE.CanvasTexture(c);if(k==='hex'||k==='rune'){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(k==='hex'?3:2,k==='hex'?2:1)}return GD212.tx[k]=t}
function gd212Geo(k){GD212.ge=GD212.ge||{};if(GD212.ge[k])return GD212.ge[k];let g;
  if(k==='shell')g=new THREE.SphereGeometry(1,28,18);else if(k==='plane')g=new THREE.PlaneGeometry(1,1);else if(k==='crys')g=new THREE.TetrahedronGeometry(.09,0);return GD212.ge[k]=g}
function gd212Mat(tex,col,op){const m=new THREE.MeshBasicMaterial({color:col,map:tex?gd212Tex(tex):null,transparent:true,opacity:op==null?1:op,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});m.userData.noFade135=1;return m}
// a short-lived mesh driven by fn(k, mesh) over ms; freed when done (shared geometry is kept)
function gd212Fade(geo,mat,ms,fn){const m=new THREE.Mesh(gd212Geo(geo),mat);m.userData.lpsSkip=1;m.renderOrder=34;m.frustumCulled=false;scene.add(m);let t=0;
  kqFx({tick(dt){t+=dt*1000;const k=Math.min(1,t/ms);try{fn(k,m)}catch(_){return false}return k<1},end(){scene.remove(m);mat.dispose()}});return m}
function gd212Front(H,ang,d,y){const a=ang==null?H.rotation.y:ang;return new THREE.Vector3(H.position.x+Math.sin(a)*d,H.position.y+y,H.position.z+Math.cos(a)*d)}
function gd212Fx(kind,a,b,c){try{const W=gd212Who();if(!W)return;const H=W.H,P=H.position,rep=typeof MPV!='undefined'&&MPV.rep>0,vol=rep?.5:1,cls=W.r?(W.r.pr&&W.r.pr.cls)||'':hero.cls;
  if(kind==='raise'){const cl=a,col=cl==='paladin'?0xffd47a:cl==='assassin'?0xc9a8ff:0xdfe8ff,p=gd212Front(H,null,.45,1.05);kqFlash(p,col,cl==='paladin'?1.1:.7,220);burst(p,col,cl==='assassin'?6:8,.9,.6,.3);snd212('raise',vol*.8)}
  else if(kind==='block'){// warrior: sparks off the steel, a shockwave, the bulwark wakes
    const p=gd212Front(H,a,.6,1.05);kqFlash(p,0xfff0c8,2.2,260);burst(p,0xffb04a,26,3.2,1.6,.45);burst(p,0xffffff,12,2.4,1.2,.3);ring(P,0xffc870,2.6,360);
    gd212Fade('plane',gd212Mat('hex',0xffc870,.9),420,(k,m)=>{m.position.copy(p);m.rotation.set(0,a,0);m.scale.setScalar(.6+k*1.4);m.material.opacity=.9*(1-k)});
    if(!rep){popT(P,'BLOCKED','#ffd890',true);if(b>0)dn(P,'+'+b+' shield','#ffe0a0',12,1100);try{if(SET.shake!==false)shake(.12)}catch(_){}}snd212('block',vol)}
  else if(kind==='pblock'){// paladin: the aegis flares on the shield
    const p=gd212Front(H,a,.55,1.0);kqFlash(p,0xffe6a0,2.6,300);burst(p,0xffd060,22,2.4,1.4,.5);burst(p,0xfff8e0,10,1.4,2,.6);ring(P,0xffd47a,2.2,380);
    gd212Fade('plane',gd212Mat('sigil',0xffd880,1),520,(k,m)=>{m.position.copy(p);m.rotation.set(0,a,0);const s=k<.25?.4+2.4*k:1+.3*(k-.25);m.scale.setScalar(s*1.25);m.material.opacity=k<.25?1:1-(k-.25)/.75});
    if(!rep){popT(P,'BLOCKED','#ffe8a8',true);dn(P,'−1 stamina'+(b>=0?' ('+b+' left)':''),'#bfd0e8',14,1100)}snd212('pblock',vol)}
  else if(kind==='break'){const p=gd212Front(H,a,.5,1.0);burst(p,0x9a8a7a,14,2,1,.4);burst(p,0xffd060,5,1.4,.6,.3);if(!rep)dn(P,'Out of stamina — guard broken','#e8b090',-24,1000);snd212('break',vol)}
  else if(kind==='parry'){// assassin: a crescent cut across the blow, a ring of violet sparks, a heartbeat of slow time
    const p=gd212Front(H,a,.55,1.05);kqFlash(p,0xffffff,2,200);burst(p,0xd8b8ff,20,3.6,1,.35);burst(p,0xffffff,10,2.8,.6,.25);
    for(let i=0;i<2;i++)gd212Fade('plane',gd212Mat('slash',i?0xb48cff:0xffffff,1),300+i*80,(k,m)=>{m.position.copy(p);m.rotation.set(0,a,(i?-.9:.9)+(i?1:-1)*k*1.4);m.scale.setScalar(1.6+k*.6);m.material.opacity=1-k*k});
    if(!rep){popT(P,'PARRY','#e2d0ff',true);dn(P,'Riposte ready','#c9b0ff',14,1100);try{flash('rgba(190,160,255,.25)')}catch(_){}}snd212('parry',vol)}
  else if(kind==='miss'){if(!rep)dn(P,cls==='assassin'?'Too slow':'Mistimed','#a8a0b0',-24,700);burst(gY(P,1),0x8a8a96,5,1,.5,.25)}
  else if(kind==='mOn'||kind==='mOff'){const on=kind==='mOn',p=new THREE.Vector3(P.x,P.y+.05,P.z);
    gd212Fade('plane',gd212Mat('circle',0x7aa8ff,1),on?700:500,(k,m)=>{m.position.copy(p);m.rotation.set(-Math.PI/2,0,k*2);const s=on?.3+2.2*haOut(k):2.4-1.8*k;m.scale.setScalar(s);m.material.opacity=on?(k<.7?1:1-(k-.7)/.3):1-k});
    burst(new THREE.Vector3(P.x,P.y+1,P.z),on?0x8ab8ff:0x5a6aa8,on?26:16,on?1.8:2.4,on?2.2:.4,.6);if(on)kqFlash(new THREE.Vector3(P.x,P.y+1,P.z),0x9ac8ff,2,300);snd212(on?'mOn':'mOff',vol)}
  else if(kind==='mHit'){const p=new THREE.Vector3(P.x,P.y+.95,P.z);gd212Fade('shell',gd212Mat('rune',0xb8d8ff,.7),360,(k,m)=>{m.position.copy(p);m.scale.set(.9+.35*k,1.05+.4*k,.9+.35*k);m.material.opacity=.7*(1-k)});
    burst(p,0x8ab8ff,8,1.2,.4,.4);if(!rep&&a>0)dn(P,'−'+a+' mana','#8ab8ff',8,800);snd212('mHit',vol*.7)}
  else if(kind==='mShatter'){const p=new THREE.Vector3(P.x,P.y+.95,P.z);burst(p,0xb8d8ff,40,4,1.2,.7);burst(p,0xffffff,14,3,1,.4);kqFlash(p,0xb8d8ff,2.4,260);snd212('shatter',vol)}
  else if(kind==='wHit'){const p=new THREE.Vector3(P.x,P.y+.95,P.z);burst(p,0xffd890,7,1.4,.5,.3);if(!rep&&a>0)dn(P,'('+a+')','#ffe0a0',10,700)}
  else if(kind==='taunt'){// ranger: the companion roars; rings of sound roll out from it
    let fo=null;if(!rep)fo=fols[a];else if(W.r&&W.r.fl)fo=W.r.fl[a];if(!fo)return;try{mvPlay105(fo,{m:'roar'},null,()=>{})}catch(_){}
    const q=fo.position;for(let i=0;i<3;i++)setTimeout(()=>{try{const p=new THREE.Vector3(q.x,q.y+.15,q.z);gd212Fade('plane',gd212Mat('shout',0xff7a3a,1),620,(k,m)=>{m.position.copy(p);m.rotation.set(-Math.PI/2,0,k);m.scale.setScalar(.8+k*GD212.tR*.55);m.material.opacity=1-k})}catch(_){}},180+i*170);
    setTimeout(()=>{try{burst(new THREE.Vector3(q.x,q.y+.9,q.z),0xff9a5a,14,1.6,1.4,.4);popT(q,'TAUNT!','#ffb070',true)}catch(_){}},180);
    if(!rep&&b===0)dn(P,'No enemy is after you','#e8c8a0',-22,900);snd212('taunt',vol);
    // the region host turns its monsters off the guest's hero onto the guest's companion copy
    if(rep&&W.r&&typeof MP!='undefined'&&MP.host===MP.me&&fo){const now=nowP();enemies.forEach(e=>{if(e.dead||!e.m||e.boss||e.sv||e.mir||e._tg212!==W.r.m)return;
      if(e.m.position.distanceTo(fo.position)>GD212.tR)return;e.tz212={g:fo,of:W.k+'#'+a,t:now+GD212.tT};if(e.atk&&e.atk.ph===0)try{mCancel(e)}catch(_){}})}}
}catch(err){if(!GD212.err++)console.warn('v212 fx',err)}}
// the partner's auras: the warrior's bulwark (its size) and the mage's ward (on / off), sent while they change
function gd212St(w,m){try{const W=gd212Who();if(!W||!W.r)return;W.r._gd212={w:+w||0,m:m?1:0,t:nowP()}}catch(_){}}
(function(){if(typeof MPV=='undefined'||!MPV.FX||typeof MPV_FX=='undefined')return;
  ['gd212Fx','gd212St'].forEach(n=>{const f=window[n];if(typeof f!='function')return;if(MPV_FX[n]==null){MPV_FX[n]=MPV.FX.length;MPV.FX.push(n)}
    window[n]=function(){if(MPV.dep||MPV.rep||!mpvLive())return f.apply(this,arguments);
      let a=null;try{a=Array.prototype.map.call(arguments,x=>mpvSer(x,0))}catch(_){a=null}
      if(a)mpvPush(['V',MPV_FX[n],mpvR(pl.position.x),mpvR(pl.position.y),mpvR(pl.position.z),mpvR(pl.rotation.y),a]);
      MPV.dep++;try{return f.apply(this,arguments)}finally{MPV.dep--}}})})();
// ---------------- auras (own hero and partners), drawn every frame ----------------
function gd212Aura(H,w,mOn,now,dt){const U=H.userData.gd212||(H.userData.gd212={w:null,m:null,c:null,wv:0,mv:0});
  const wt=Math.min(1,w/Math.max(1,(H===pl?heroMax():400)*.25)),mt=mOn?1:0;U.wv+=(wt-U.wv)*Math.min(1,dt*8);U.mv+=(mt-U.mv)*Math.min(1,dt*(mOn?5:8));
  const P=H.position,y=P.y+.92,on=H.visible!==false;
  if(U.wv>.01&&on){if(!U.w){U.w=new THREE.Mesh(gd212Geo('shell'),gd212Mat('hex',0xffc060,.3));U.w.userData.lpsSkip=1;U.w.renderOrder=33;scene.add(U.w)}
    const s=1+.04*Math.sin(now/120);U.w.position.set(P.x,y,P.z);U.w.scale.set(.82*s,1.02*s,.82*s);U.w.rotation.y+=dt*.6;U.w.material.opacity=.08+.32*U.wv+.06*Math.sin(now/90);U.w.visible=true;
    if(Math.random()<dt*14*U.wv)burst(new THREE.Vector3(P.x+(Math.random()-.5)*1.1,P.y+.2+Math.random()*1.2,P.z+(Math.random()-.5)*1.1),0xffd890,1,.2,.9,.5)}
  else if(U.w){scene.remove(U.w);U.w.material.dispose();U.w=null}
  if(U.mv>.01&&on){if(!U.m){U.m=new THREE.Mesh(gd212Geo('shell'),gd212Mat('rune',0x6a98ff,.35));U.m.userData.lpsSkip=1;U.m.renderOrder=33;scene.add(U.m);
      U.c=new THREE.Mesh(gd212Geo('plane'),gd212Mat('circle',0x5a88ff,.6));U.c.userData.lpsSkip=1;U.c.renderOrder=32;U.c.rotation.x=-Math.PI/2;scene.add(U.c)}
    const s=U.mv*(1+.03*Math.sin(now/200));U.m.position.set(P.x,y,P.z);U.m.scale.set(.95*s,1.12*s,.95*s);U.m.rotation.y-=dt*.35;U.m.material.map.offset.y=(now/4000)%1;U.m.material.opacity=.22+.08*Math.sin(now/260);
    U.c.position.set(P.x,P.y+.04,P.z);U.c.scale.setScalar(2.1*U.mv);U.c.rotation.z+=dt*.5;U.c.material.opacity=.45*U.mv;
    if(Math.random()<dt*6)burst(new THREE.Vector3(P.x+(Math.random()-.5)*1.4,P.y+.1,P.z+(Math.random()-.5)*1.4),0x8ab8ff,1,.15,1.2,.7)}
  else if(U.m){scene.remove(U.m);U.m.material.dispose();U.m=null;scene.remove(U.c);U.c.material.dispose();U.c=null}}
function gd212AuraDrop(H){const U=H&&H.userData&&H.userData.gd212;if(!U)return;['w','m','c'].forEach(k=>{if(U[k]){scene.remove(U[k]);U[k].material.dispose();U[k]=null}});U.wv=U.mv=0}
// taunted enemies: a red brand over each for the 3 s
function gd212Marks(now){GD212.mk=GD212.mk.filter(q=>{const e=q.e,alive=now<q.t&&e&&!e.dead&&e.m&&e.tz212;
  if(!alive){if(q.s){scene.remove(q.s);q.s.material.dispose()}return false}
  if(!q.s){q.s=new THREE.Sprite(new THREE.SpriteMaterial({map:gd212Tex('shout'),color:0xff5a2a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));q.s.userData.lpsSkip=1;scene.add(q.s)}
  const P=e.m.position,h=e.boss?5:e.c&&e.c.al?2.6:m212H(e);q.s.position.set(P.x,P.y+h,P.z);const k=(q.t-now)/GD212.tT;q.s.scale.setScalar(.55+.08*Math.sin(now/90));q.s.material.opacity=Math.min(1,k*4);return true})}
function m212H(e){return e.m.isHum?Math.max(1.9,(e.m.bs||1)*1.9):1.9}
// ---------------- per frame ----------------
{const f=heroTick;heroTick=function(dt,now){const r=f.apply(this,arguments);
  try{const c=hero.cls,n=nowP();
    if(GD212.hold){if(!gd212Can()||!gd212Holds(c)){gd212Up()}else{dqDebuff('Guarding',c==='paladin'?'🛡️':c==='assassin'?'🗡️':'⚔️',{mspd:GD212.slow},180,'Guard raised: slower, no basic attacks');
        if(HA.cur!==GD212.A||n-GD212.poseT>3600)gd212Raise(c,true)}}
    if(GD212.mana&&(c!=='mage'||hero.hp<=0)){GD212.mana=false;gd212Fx('mOff',0,0,0)}
    const w=gd212WshSum(n);gd212Aura(pl,w,GD212.mana&&c==='mage',n,dt);gd212Marks(n);
    // tell partners how the auras look (on change, then every 0.4 s while one shows)
    const key=(w>0?1:0)+'|'+(GD212.mana?1:0);if(key!==GD212.stK||(key!=='0|0'&&n-GD212.stT>400)){GD212.stK=key;GD212.stT=n;gd212St(Math.round(w),GD212.mana?1:0)}
    if(typeof MP!='undefined'&&MP.rh)for(const k in MP.rh){const R=MP.rh[k];if(!R||!R.m)continue;const S=R._gd212,live=S&&n-S.t<1500&&R.m.visible;
      if(live||R.m.userData.gd212)gd212Aura(R.m,live?S.w*Math.max(0,1-(n-S.t)/GD212.wshT):0,live&&S.m,n,dt)}}catch(err){if(!GD212.err++)console.warn('v212 tick',err)}
  return r}}
{const f=mpDropRH;mpDropRH=function(k){try{const r=MP.rh[k];if(r&&r.m)gd212AuraDrop(r.m)}catch(_){}return f.apply(this,arguments)}}
// ---------------- the hotbar: the class defence slot after Dash; Space on Dash's key cap ----------------
var GD212I={warrior:['⚔️','Block (hold Shift): time it as the blow lands to halve it and keep half as a shield'],paladin:['🛡️','Shield up (hold Shift): blocks basic attacks for 1 stamina each'],
  assassin:['🗡️','Parry (Shift): time it as the blow lands to turn the whole hit aside'],mage:['🔮','Mana ward (Shift on / off): damage drains mana instead of health, spells too'],ranger:['📯','Taunt (Shift): your companion roars and pulls the enemies after you for 3 s']};
function gd212Slot(){const c=hero.cls,I=GD212I[c];if(!I)return '';const now=nowP();let cd=0,mx=1,sub='',dim=0,on=0;
  if(c==='ranger'){cd=Math.max(0,(GD212.cdT-now)/1000);mx=GD212.tCd;sub=cd>0?Math.ceil(cd)+'s':''}
  else if(c==='mage'){on=GD212.mana;sub=on?'ON':'off'}
  else if(c==='warrior'){const w=gd212WshSum(now);sub=w>0?Math.round(w)+'':''}
  else if(c==='paladin'){sub='×'+Math.floor(hero.dc||0);dim=(hero.dc||0)<1}
  const kb=typeof kb161Lbl=='function'&&KB161.on?(kb161Lbl('shift')||'Shift'):'Shift';
  return `<button class="hs gd212${on||GD212.hold?' gd212on':''}" data-x="g" title="${I[1]}" ${dim?'style="opacity:.5"':''}><span class="ic">${I[0]}</span><span class="kb">${kb}</span><span class="sb">${sub}</span><span class="cdv" style="height:${mx&&cd>0?Math.min(100,100*cd/mx):0}%"></span></button>`}
{const f=hud;hud=function(){const r=f.apply(this,arguments);try{const A=$('acts');if(A&&party.length&&!A.querySelector('[data-x="g"]')){const d=A.querySelector('[data-x="d"]'),h=gd212Slot();if(h){if(d)d.insertAdjacentHTML('afterend',h);else A.insertAdjacentHTML('beforeend',h)}}}catch(_){}return r}}
{const A=$('acts');if(A){A.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-x="g"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();gd212Down();
    const up=()=>{gd212Up();removeEventListener('pointerup',up);removeEventListener('pointercancel',up)};addEventListener('pointerup',up);addEventListener('pointercancel',up)},true)}}
// phones: a defence button next to Dash
{const M=$('mbtn');if(M&&!M.querySelector('[data-m="guard"]')){const d=M.querySelector('[data-m="dash"]'),b=document.createElement('button');b.dataset.m='guard';b.title='Class defence';b.textContent='🛡️';
  if(d)d.insertAdjacentElement('afterend',b);else M.appendChild(b);
  b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopImmediatePropagation();gd212Down();b.classList.add('on');const up=()=>{gd212Up();b.classList.remove('on');removeEventListener('pointerup',up);removeEventListener('pointercancel',up)};addEventListener('pointerup',up);addEventListener('pointercancel',up)},true)}}
setInterval(()=>{try{const b=document.querySelector('#mbtn [data-m="guard"]'),I=hero&&GD212I[hero.cls];if(b&&I&&b.textContent!==I[0])b.textContent=I[0];if(b&&I)b.title=I[1]}catch(_){}},1000);
{const s=document.createElement('style');s.textContent=`#acts .hs.gd212on{box-shadow:0 0 0 1px rgba(255,220,150,.9),0 0 12px rgba(255,190,90,.55)}`;document.head.appendChild(s)}
// ---------------- sounds ----------------
function snd212(k,vol){try{if(typeof SET!='undefined'&&(SET.sfx===false||SET.sfxV!=null&&!(+SET.sfxV>0)))return;const a=typeof snd208Bus=='function'?snd208Bus():null;if(!a||a.state!='running')return;
  const t0=a.currentTime;GD212.sl=GD212.sl||{};if(GD212.sl[k]&&t0-GD212.sl[k]<.05)return;GD212.sl[k]=t0;vol=vol||1;
  const T=(ty,f0,f1,at,dur,v,o)=>{o=Object.assign({},o||{},{dur,v});const t=t0+at,s=a.createOscillator();s.type=ty;s.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)s.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);if(o.det)s.detune.value=o.det;const e=snd208V(a,s,o,t,vol);s.start(t);s.stop(e)},
    N=(f0,f1,at,dur,v,o)=>{if(typeof NOISE=='undefined'||!NOISE)return;o=Object.assign({bp:f0},o||{},{dur,v,f1});if(o.lp){o.lp=f0;delete o.bp}if(o.hp){o.hp=f0;delete o.bp}const t=t0+at,s=a.createBufferSource();s.buffer=NOISE;s.loop=true;const e=snd208V(a,s,o,t,vol);s.start(t,Math.random()*.5);s.stop(e)},
    Mt=(f,at,dur,v,wet,P)=>{(P||[[1,1],[2.76,.55],[5.4,.3],[8.93,.16]]).forEach(([r,w],i)=>T('sine',f*r,f*r*.998,at,dur*(1-i*.16),v*w,{wet,atk:.002}))};
  ({raise:()=>{N(2600,1100,0,.12,.12,{q:1.6,atk:.01,wet:.1});Mt(1300,.02,.25,.012,.3)},
    block:()=>{T('sine',130,48,0,.3,.6,{atk:.002,wet:.3});N(900,140,0,.22,.4,{lp:1,atk:.002,wet:.25});N(3600,1500,0,.06,.3,{q:1.5,atk:.001});Mt(430,.002,1.1,.07,.6)},
    pblock:()=>{T('sine',110,44,0,.32,.6,{atk:.002,wet:.3});N(700,120,0,.25,.4,{lp:1,atk:.002,wet:.3});Mt(520,.002,1.2,.06,.7);[784,1046,1318].forEach((f,i)=>T('sine',f,f,.04+i*.05,.9,.03,{atk:.02,wet:.8}))},
    break:()=>{T('sine',90,40,0,.25,.4,{atk:.003});N(500,90,0,.2,.35,{lp:1,atk:.003,wet:.2})},
    parry:()=>{N(4600,2200,0,.05,.32,{q:2.2,atk:.001,wet:.2});Mt(1500,0,.75,.05,.6);T('sine',2400,2350,0,.4,.04,{atk:.002,wet:.6})},
    mOn:()=>{[294,392,523,659].forEach((f,i)=>T('sine',f,f*1.01,i*.06,.9,.04,{atk:.05,wet:.8}));N(600,3000,0,.6,.1,{q:2,atk:.2,wet:.6})},
    mOff:()=>{[659,523,392].forEach((f,i)=>T('sine',f,f*.98,i*.05,.5,.035,{atk:.02,wet:.6}));N(2400,500,0,.4,.07,{q:2,atk:.02,wet:.5})},
    mHit:()=>{Mt(1900,0,.35,.02,.6,[[1,1],[2.3,.5],[3.7,.25]]);N(3000,1600,0,.08,.08,{q:2,atk:.002})},
    shatter:()=>{N(5200,2600,0,.3,.3,{hp:1,atk:.001,wet:.4});[2200,2950,3700].forEach((f,i)=>Mt(f,i*.03,.5,.02,.6,[[1,1],[2.1,.4]]))},
    taunt:()=>{[-8,8].forEach(d=>T('sawtooth',96,72,0,.75,.07,{lp:420,f1:900,fd:.25,atk:.04,det:d,wet:.4}));N(520,260,0,.7,.25,{q:1.2,atk:.05,wet:.4});T('sine',62,48,0,.7,.3,{atk:.03,wet:.4})}})[k]?.()}catch(_){}}
