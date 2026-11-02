// v188 co-op look (owner, Nov 2 2026: "confirm that all the changes we've made are visible and working in co-op"; then "fix these").
// What a partner saw differently from the player's own screen, and the fixes:
// 1. The raven's wand / orb hold (v186 WA186, v141 orb float) only ran for the player's own hero: a partner saw the old wand
//    tumble. Now a partner's hero runs the same hold. The pose message ('P', 2170) carries which attack it is (e[5]: 'w' wand
//    basic, 'o' orb basic, '' anything else) and its progress is tracked on the partner (H._mpvA {pose, k}); wa188A(H) gives the
//    attack the hold reads (HA.cur for the player's own hero), wa188Mine(H) says the hold may run for H.
// 2. An evolved cast's second colour: a partner's replay had no EV137.cur, so the v186 extras fell back to a white blend and the
//    evolved second lightning bolt (3440) was missing. The effect message ('V') carries the caster's second colour (e[8]); while
//    it is replayed ev188Rep() returns {c2}, which ev186C2 / sgC2 / the 3440 bolt read. (The v137 extras on ring / burst / area
//    are already relayed as their own effects, so EV137.cur itself stays unset on the partner: no doubled extras.)
// 3. A partner's companion bolt: the little hop of the cast's wind-up (0860) now plays on the partner's copy too.
// 4. The thrown knife's ghost has the knife's size (launch option mpSc, read by the 'L' message in 2170).
// 5. fxOrbit / fxRise / fxFall replayed without their particle maker (a function cannot be sent; the particles they make are
//    relayed on their own) threw on the partner: now they do nothing without one. A replayed companion move gets an empty
//    strike callback (2170) instead of null.
// Old partners ignore the extra message fields; a partner on an older version still sees the old look.
var WA188={on:true},EV188={cur:null};
function ev188Rep(){return EV188.cur}
function wa188Mine(H){if(!H)return false;if(H===pl)return true;if(!WA188.on)return false;
  if(H._mp188)return true;let ok=false;try{if(typeof MP!='undefined'&&MP.rh)for(const k in MP.rh){if(MP.rh[k]&&MP.rh[k].m===H){ok=true;break}}}catch(_){}
  if(ok)H._mp188=1;return ok}
function wa188A(H){if(!H||H===pl)return typeof HA!='undefined'?HA.cur:null;const A=H._mpvA;return A&&H._mpvP===A.id?A:null}
// recording: tag the pose and the evolved colour onto the outgoing messages (mpvPush puts the time in at index 1)
MPV.pTag=null;
{const f=haPlay;haPlay=function(ms,pose){const o=MPV.pTag;
  MPV.pTag=typeof ATK!='undefined'&&pose&&pose===ATK.wand?'w':typeof ATK!='undefined'&&pose&&pose===ATK.orb?'o':'';
  try{return f.apply(this,arguments)}finally{MPV.pTag=o}}}
{const f=mpvPush;mpvPush=function(e){try{
  if(Array.isArray(e)&&e[0]==='P'&&MPV.pTag!=null)e.push(MPV.pTag);
  else if(Array.isArray(e)&&e[0]==='V'&&e.length===7){const C=typeof EV137!='undefined'&&EV137.cur;if(C&&C.c2!=null)e.push(new THREE.Color(C.c2).getHex())}
  }catch(_){}return f.apply(this,arguments)}}
// replay on the partner
{const f=mpvPlay;mpvPlay=function(r,e){const T=Array.isArray(e)?e[0]:null;
  if(T==='V'&&typeof e[8]=='number'&&isFinite(e[8])){const o=EV188.cur;EV188.cur={c2:e[8]&0xffffff};try{return f.apply(this,arguments)}finally{EV188.cur=o}}
  if(T==='B'){try{const g=r&&r.fl&&r.fl[e[2]|0],b=g&&g.visible&&g.b;
    if(b&&!b._hop188){b._hop188=1;tw(220,k=>{b.position.y=Math.sin(k*Math.PI)*.12;b.rotation.x=-Math.sin(k*Math.PI)*.25},()=>{b._hop188=0;b.position.y=0;b.rotation.x=0})}}catch(_){}}
  const h=T==='P'&&r&&r.m,id0=h?h._mpvP:0,res=f.apply(this,arguments);
  if(h&&h._mpvP!==id0){const tg=typeof e[5]=='string'?e[5]:null;
    if(tg==null||typeof ATK=='undefined')h._mpvA=null;
    else{const A={pose:tg=='w'?ATK.wand:tg=='o'?ATK.orb:{},k:0,id:h._mpvP};h._mpvA=A;const ms=Math.max(60,Math.min(4000,+e[2]||300));
      tw(ms,k=>{A.k=Math.max(0,Math.min(1,k))},()=>{A.k=1;if(h._mpvA===A)h._mpvA=null})}}
  return res}}
// particle makers that cannot be sent
[['fxOrbit',6],['fxRise',5],['fxFall',5]].forEach(([n,j])=>{const f=window[n];if(typeof f!='function')return;
  window[n]=function(){if(typeof arguments[j]!='function')return;return f.apply(this,arguments)}});
