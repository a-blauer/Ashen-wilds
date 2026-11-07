// ================= v205 The Citadel main quest: the road to Lord Vaelric =================
// The owner's design (Nov 7 2026), one chapter per field instance; none of the three gateway portals is used any more:
//  I   The Unsealing (3731–3734): the gateway of The Citadel I is gone; in its place a great gatehouse closes the road, its doors
//      held by a blood seal. Cheddar is there, studying it. A seal woven in the court's blood unwinds only with the court's own:
//      four ingredients, one from each kind of creature of I (Grave Ash · Vampire Thrall, Nightwing Heart · Blood Bat, Crimson
//      Signet · Blood Knight, Sanguine Ink · Blood Magister). Bring them to him and he casts the unbinding: two minutes in which
//      the court swarms the gate to kill him and you (blood siphons, mist stalkers, diving bats, a gate-breaker; the light dies, the
//      blood moon rises). Hold, and the seal shatters: the doors open on the way to II.
//  II  The Bloodgorged (3740–3743): a great iron gate in the rampart wall, and chained before it the court's war-beast Vharog:
//      bipedal, built like a man, but it runs on all fours; a mini boss to the Vorraxis standard (docs/BOSS_RECIPE.md). Slay it and
//      the portcullis rises.
//  III The Dawn Mirrors (3750–3752): the Den's door is the Eclipse Door; only sunlight burns its seal. Cheddar finds the old Sun
//      Court before it: a sunwell lens and three empty mirror stands. The court tore the three Dawn Mirrors down and hid them in
//      blood shrines round III, each kept by a warden. Take them back, mount them, turn them until the sunbeam runs from the lens
//      over all three mirrors onto the door: the dawn breaks over the Citadel for the first time in an age, and Vaelric answers.
// This file: the shared state (CQ205), each chapter's frame at its gateway clearing, the tracker, the saves, the old portals.
// Every chapter is also done when the next instance has been reached (insReach), so heroes who are further on are never blocked.
var CQ205={z:5,
  c1:{st:0,ing:0,fd:0},         // 0 not met · 1 met (gathering) · 2 ingredients given · 3 the seal broken · 4 through. ing: carried bits (4)
  c2:{st:0},                    // 0 · 1 Vharog slain (the gate stands open) · 2 through
  c3:{st:0,fd:0,cl:0,got:0,mnt:0,rot:[0,0,0]},   // 0 not met · 1 met · 2 all mounted · 3 the dawn (the door open) · 4 through; masks of 3
  trkK:'',err:0};
function cq205I(k){return INSL[insG(5,k)]}
function cq205Here(k){try{const I=curIns();return !!I&&I.g===insG(5,k)}catch(_){return false}}
function cq205Done(c){const r=insReach(5);return c===1?(CQ205.c1.st>=3||r>=1):c===2?(CQ205.c2.st>=1||r>=2):(CQ205.c3.st>=3||r>=3)}
function cq205Bits(m){let n=0;for(let i=0;i<8;i++)if(m&(1<<i))n++;return n}
// a chapter's frame at the end of its instance: G the gateway clearing's centre, f away from where the road comes in, l across
// (to the right looking along f). W2(a,b) local → world; L2(x,z) world → local; reach: how far the clearing goes along f.
function cq205F(k){const c=cq205F.c||(cq205F.c={});if(c[k])return c[k];const DWm=MAP.DW,I=cq205I(k),P=I.path,q=P[Math.max(0,P.length-14)],G=I.ba;let fx=G[0]-q[0],fz=G[1]-q[1];const L=Math.hypot(fx,fz)||1;fx/=L;fz/=L;
  const lx=-fz,lz=fx,F={I,k,x:G[0],z:G[1],fx,fz,lx,lz,W2:(a,b)=>[G[0]+fx*a+lx*b,G[1]+fz*a+lz*b],L2:(x,z)=>{const dx=x-G[0],dz=z-G[1];return [dx*fx+dz*fz,dx*lx+dz*lz]},yaw:Math.atan2(fx,fz)};
  const open=(a,b)=>{const [x,z]=F.W2(a,b),X=Math.round(x),Z=Math.round(z);if(X<1||Z<1||X>=W-1||Z>=H-1)return false;const J=insAt(X,Z);return !!J&&J.g===I.g&&DWm[Z*W+X]<-1.2};
  F.reach=(()=>{for(let a=2;a<40;a+=.5)if(!open(a,0))return a;return 20})();
  // how wide the clearing is across, a few tiles before the far edge
  F.half=(()=>{const a=Math.max(0,F.reach-6);let b=0;while(b<30&&open(a,b+.5)&&open(a,-b-.5))b+=.5;return b})();
  F.y0=GH(G[0],G[1]);return c[k]=F}
// ---------------- the tracker (#mqt152, the main-quest box) ----------------
SP152.trk.citadel=I=>{if(!I||I.z!==5||I.den||I.sp||!I.fld)return null;const k=I.k;
  if(k===0){const C=CQ205.c1;if(C.st>=4||cq205Done(1)&&!(typeof US205!='undefined'&&US205.E))return null;const nm='The Unsealing';
    if(C.st<1)return {name:nm,lines:[['Follow the road to the sealed gate'],['Someone waits there']]};
    if(C.st===1){const n=cq205Bits(C.ing),L=[['Take the court’s own blood from its creatures'],['Ingredients',n+' / 4']];
      CH205.ING.forEach((g,i)=>{if(!(C.ing&(1<<i)))L.push(['· '+g.n+' ('+g.from+')'])});if(n>=4)L.push(['Bring them to Cheddar at the gate',null,true]);return {name:nm,lines:L}}
    if(C.st===2){const E=typeof US205!='undefined'&&US205.E;if(E)return {name:nm,lines:[['Protect Cheddar while he breaks the seal'],['Seal',Math.min(100,Math.round(E.t/US205.T*100))+'%'],['Cheddar',Math.max(0,Math.round(E.hp/US205.hpM*100))+'%']]};
      return {name:nm,lines:[['Speak with Cheddar to begin the unbinding',null,true]]}}
    return {name:nm,lines:[['The seal is broken: go through the gate',null,true]]}}
  if(k===1){const C=CQ205.c2;if(C.st>=2||cq205Done(2)&&C.st>=1)return null;const nm='The Bloodgorged';
    if(C.st<1){const on=typeof VH205!='undefined'&&VH205.A&&VH205.A.f;return {name:nm,lines:[[on?'Slay Vharog, the Bloodgorged':'Follow the road to the rampart gate'],[on?'':'Something huge is chained there']].filter(q=>q[0])}}
    return {name:nm,lines:[['The portcullis is up: go through the gate',null,true]]}}
  if(k===2){const C=CQ205.c3;if(C.st>=4||cq205Done(3)&&C.st>=3)return null;const nm='The Dawn Mirrors';
    if(C.st<1)return {name:nm,lines:[['Follow the road to the door of the Den']]};
    if(C.st<2){const n=cq205Bits(C.got|C.mnt),m=cq205Bits(C.mnt);return {name:nm,lines:[['Take back the three Dawn Mirrors'],['Mirrors found',n+' / 3'],[C.got&~C.mnt?'Mount them on the stands of the Sun Court':'',null,!!(C.got&~C.mnt)],['Mounted',m+' / 3']].filter(q=>q[0])}}
    if(C.st<3)return {name:nm,lines:[['Turn the mirrors: lead the sunbeam to the Eclipse Door'],['Mirrors in the light',(typeof DM205!='undefined'&&DM205.lit|0)+' / 3']]};
    return {name:nm,lines:[['The Eclipse Door is open',null,true],['Lord Vaelric waits in his den']]}}
  return null};
// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{const S=CQ205;o.cq205={v:205,c1:{st:S.c1.st|0,ing:S.c1.ing|0,fd:S.c1.fd|0},c2:{st:S.c2.st|0},
      c3:{st:S.c3.st|0,fd:S.c3.fd|0,cl:S.c3.cl|0,got:S.c3.got|0,mnt:S.c3.mnt|0,rot:S.c3.rot.slice(0,3).map(v=>v|0)}}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.cq205,S=CQ205,cl=(v,a,b)=>Math.max(a,Math.min(b,v|0));
    S.c1={st:0,ing:0,fd:0};S.c2={st:0};S.c3={st:0,fd:0,cl:0,got:0,mnt:0,rot:[0,0,0]};
    if(q&&typeof q=='object'){if(q.c1){S.c1.st=cl(q.c1.st,0,4);S.c1.ing=q.c1.ing&15;S.c1.fd=q.c1.fd|0}
      if(q.c2)S.c2.st=cl(q.c2.st,0,2);
      if(q.c3){S.c3.st=cl(q.c3.st,0,4);S.c3.fd=q.c3.fd&7;S.c3.cl=q.c3.cl&7;S.c3.got=q.c3.got&7;S.c3.mnt=q.c3.mnt&7;if(Array.isArray(q.c3.rot))S.c3.rot=[0,1,2].map(i=>cl(q.c3.rot[i],0,7))}}
    S.trkK='';cq205OnLoad()}catch(e){console.warn('v205 load',e)}return r}}
// chapters hook in here after a load (their scenes rebuild their state from CQ205)
var CQ205L=[];function cq205OnLoad(){CQ205L.forEach(f=>{try{f()}catch(e){console.warn('v205 load',e)}})}
// the old gateway portals of the three field instances are hidden (their records stay for older code)
function cq205HidePortals(){try{RPORT.forEach(r=>{if(r.k=='next'&&r.pi===5&&r.ig>=insG(5,0)&&r.ig<=insG(5,2)){r.g.visible=false;r.cq205=1}})}catch(_){}}
cq205HidePortals();
// run fn after sec seconds of game time (follows the game clock, so tests and pauses agree)
function cq205After(sec,fn){let t=0;kqFx({tick(dt){t+=dt||0;if(t>=sec){try{fn()}catch(err){console.error('v205 after',err)}return false}return true},end(){}})}
function cq205Card(kick,title,sub,foot){try{zt116Show(ZT116.Z[5],kick,title,sub,foot||'','z5')}catch(_){}}
// the cheat "All quests complete" finishes the Citadel's chapters too
{const f=typeof cheatQuests147=='function'?cheatQuests147:null;if(f)cheatQuests147=function(){const r=f.apply(this,arguments);try{CQ205.c1.st=4;CQ205.c1.ing=0;CQ205.c2.st=2;CQ205.c3.st=4;CQ205.c3.mnt=7;CQ205.c3.got=0;CQ205.trkK='';cq205OnLoad()}catch(_){}return r}}
