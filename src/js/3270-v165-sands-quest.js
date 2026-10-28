// ================= v165 Searing Sands main quest: the road to Ssith'ra =================
// The owner's design, one chapter per field instance (none of its gateways is a portal any more):
//  I   The Buried Temple (3271–3275): the gateway portal is gone; the entrance of the Sunken Temple lies buried under a dune at the
//      end of the road. Dig it out bit by bit (F, a spade, the sand slumps and piles up). When it is clear, the dug sand rises as
//      Qarsul, the Living Dune (a mini boss to the Vorraxis standard); once he has risen nobody leaves the yard or recalls: kill
//      him or die. Die, and he rises again from the heaps when you come back. Slain, the temple doors open: the way to II.
//  II  The Courtyard of the Warden (3280–3284): a great temple courtyard. Urns hold the remains of Kheprit, the Last Warden (an
//      ant-headed, six-legged guardian with a sand-coloured carapace); break them, lay the eleven pieces on the altar and he wakes.
//      Ask him to open a rift to III: he channels for a minute while hordes of cultists charge him and you. Hold, then run through
//      the rift before you are overwhelmed. Come back later: his body lies by the rift, among heaps of dead cultists.
//  III The Sandskimmer (3290–3293): machine parts are locked in salt columns round the Salt Wastes; mine them out and build the
//      Sandskimmer (cannons, a great turbine for boost) at the old salt-cutters' yard, where the land ends over a vast desert.
//  The Sandstorm Run (3300–3304): a one-time level (special instance, like the Hilltop Ascent) between III and the Den: drive the
//      Sandskimmer through a sandstorm while worms, scarabs and scorpions attack. Solo, Cheddar drives and you man the turret; two
//      players drive and shoot; more players take more machines. It ends at the cave of the Den.
// This file: the shared state (SS165), each chapter's frame at its gateway clearing, the tracker, the saves.
// Every chapter is also done when the next instance has been reached (insReach), so heroes who are further on are never blocked.
var SS165={z:3,
  c1:{st:0,dig:[],seen:0},           // 0 not found · 1 digging · 2 uncovered (Qarsul rises) · 3 Qarsul slain (doors open) · 4 through
  c2:{st:0,urn:0,got:0,lay:0},       // urns broken / parts carried / parts laid (bit masks, 11 parts); 0 · 1 waking · 2 awake · 3 rift open · 4 through
  c3:{st:0,col:0,got:0,built:0},     // salt columns mined / parts taken (masks, 5 parts); built: 1 when the Sandskimmer stands in the yard
  run:{st:0},                        // the Sandstorm Run: 1 finished (the Den reached)
  trkK:'',err:0,t:0};
function ss165I(k){return INSL[insG(3,k)]}
function ss165Here(k){try{const I=curIns();return !!I&&I.g===insG(3,k)}catch(_){return false}}
function ss165Done(c){const r=insReach(3);return c===1?(SS165.c1.st>=3||r>=1):c===2?(SS165.c2.st>=3||r>=2):c===3?(SS165.c3.built>=1||r>=3):r>=3||SS165.run.st>=1}
// a chapter's frame at the end of its instance: G the gateway clearing's centre, f away from where the road comes in, l across
// (to the right looking along f), y0 the ground there. Local (a, b) → world: G + f·a + l·b.
function ss165F(k,DW0){const c=ss165F.c||(ss165F.c={});if(c[k])return c[k];const DWm=DW0||MAP.DW;const I=ss165I(k),P=I.path,q=P[Math.max(0,P.length-14)],G=I.ba;let fx=G[0]-q[0],fz=G[1]-q[1];const L=Math.hypot(fx,fz)||1;fx/=L;fz/=L;
  const lx=-fz,lz=fx,F={I,k,x:G[0],z:G[1],fx,fz,lx,lz,W2:(a,b)=>[G[0]+fx*a+lx*b,G[1]+fz*a+lz*b],L2:(x,z)=>{const dx=x-G[0],dz=z-G[1];return [dx*fx+dz*fz,dx*lx+dz*lz]},yaw:Math.atan2(fx,fz)};
  // how far the clearing reaches along f (the first rim tile)
  F.reach=(()=>{for(let a=4;a<40;a+=.5){const [x,z]=F.W2(a,0),X=Math.round(x),Z=Math.round(z);if(DWm[Z*W+X]>-1.2)return a}return 20})();
  return c[k]=F}
// 0045: the chapters' own tiles (II's court, III's yard and overlook), after every other map pass (no seeded draws)
function ss165Map(m,bio,DW){try{if(typeof ss165T2Map=='function')ss165T2Map(m,bio,DW)}catch(e){console.warn('v165 map II',e)}try{if(typeof ss165T3Map=='function')ss165T3Map(m,bio,DW)}catch(e){console.warn('v165 map III',e)}}
// ---------------- the tracker (#mqt152, the main-quest box) ----------------
SP152.trk.sands=I=>{if(!I||I.z!==3||I.den||I.sp)return null;const k=I.k;
  if(k===0){const C=SS165.c1;if(ss165Done(1)&&C.st>=4)return null;const nm='The Buried Temple';
    if(C.st<1)return {name:nm,lines:[['Follow the road to the end of '+I.n]]};
    if(C.st===1)return {name:nm,lines:[['Dig out the buried temple entrance'],['Sand cleared',Math.round(ss165DigP()*100)+'%']]};
    if(C.st===2)return {name:nm,lines:[[typeof QS165!='undefined'&&QS165.A&&QS165.A.f?'Slay Qarsul, the Living Dune':'The sand stirs: face what guards the gate']]};
    return {name:nm,lines:[['Enter the Sunken Temple',null,true]]}}
  if(k===1){const C=SS165.c2;if(C.st>=4||ss165Done(2)&&C.st>=3)return null;const nm='The Last Warden';
    if(C.st<1){const n=ss165Bits(C.lay|C.got);return {name:nm,lines:[['Break the urns in the temple courtyard'],['Remains found',n+' / 11'],[C.got&~C.lay?'Lay them on the altar':'',null,!!(C.got&~C.lay)]].filter(q=>q[0])}}
    if(C.st<3)return {name:nm,lines:[[typeof RF165!='undefined'&&RF165.E?'Protect Kheprit while he opens the rift':'Speak with Kheprit'],typeof RF165!='undefined'&&RF165.E?['Rift',Math.min(100,Math.round(RF165.E.t/RF165.T*100))+'%']:['Ask him to open a way on']]};
    return {name:nm,lines:[['Escape through the rift!',null,true]]}}
  if(k===2){const C=SS165.c3;if(ss165Done(3)&&SS165.run.st>=1)return null;const nm='The Sandskimmer';
    if(!C.built){const n=ss165Bits(C.got);return {name:nm,lines:[['Mine the machine parts out of the salt columns'],['Parts',n+' / 5'],[n>=5?'Build the Sandskimmer at the salt-cutters’ yard':'',null,n>=5]].filter(q=>q[0])}}
    return {name:nm,lines:[['Ride the Sandskimmer into the desert',null,true],['To the den of Ssith’ra']]}}
  return null};
function ss165Bits(m){let n=0;for(let i=0;i<16;i++)if(m&(1<<i))n++;return n}
// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{const S=SS165;o.ss165={v:165,c1:{st:S.c1.st,dig:S.c1.dig.slice(0,600).join(','),seen:S.c1.seen|0},c2:{st:S.c2.st,urn:S.c2.urn|0,got:S.c2.got|0,lay:S.c2.lay|0},c3:{st:S.c3.st,col:S.c3.col|0,got:S.c3.got|0,built:S.c3.built|0},run:{st:S.run.st|0}}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.ss165,S=SS165,cl=(v,a,b)=>Math.max(a,Math.min(b,v|0));
    S.c1={st:0,dig:[],seen:0};S.c2={st:0,urn:0,got:0,lay:0};S.c3={st:0,col:0,got:0,built:0};S.run={st:0};
    if(q&&typeof q=='object'){if(q.c1){S.c1.st=cl(q.c1.st,0,4);S.c1.seen=q.c1.seen|0;S.c1.dig=typeof q.c1.dig=='string'&&q.c1.dig?q.c1.dig.split(',').map(v=>v|0).slice(0,600):[]}
      if(q.c2){S.c2.st=cl(q.c2.st,0,4);S.c2.urn=q.c2.urn&16383;S.c2.got=q.c2.got&2047;S.c2.lay=q.c2.lay&2047}
      if(q.c3){S.c3.st=cl(q.c3.st,0,3);S.c3.col=q.c3.col&31;S.c3.got=q.c3.got&31;S.c3.built=q.c3.built?1:0}
      if(q.run)S.run.st=q.run.st?1:0}
    S.trkK='';try{if(typeof ss165OnLoad=='function')ss165OnLoad()}catch(e){console.warn('v165 load hook',e)}}catch(e){console.warn('v165 load',e)}return r}}
// chapters hook in here after a load (their scenes rebuild their state from SS165)
var SS165L=[];function ss165OnLoad(){SS165L.forEach(f=>{try{f()}catch(e){console.warn('v165 load',e)}})}
// Cheddar's spot before each chapter's end (2350 picks one by the old gateway, which is now in the middle of a scene): further back down the road
{const f=chqSpotEnd135;chqSpotEnd135=function(I){try{if(I&&I.z===3&&I.fld&&I.k<3&&CHQ132.e.spots[I.g]===undefined){const F=ss165F(I.k),P=I.path;
      for(const back of [22,25,28,19,31]){const q=P[Math.max(0,P.length-14-back)];if(!q)continue;const sx=-F.fz,sz=F.fx;for(const o of [3.2,-3.2,4.4,-4.4]){const x=q[0]+sx*o,z=q[1]+sz*o,bx=x-F.fx*1.2,bz=z-F.fz*1.2;
          if(!solid(Math.round(x),Math.round(z))&&!solid(Math.round(bx),Math.round(bz))&&Math.abs(GH(x,z)-GH(bx,bz))<.6){const s={x,z,bx,bz};CHQ132.e.spots[I.g]=s;return s}}}}}catch(e){console.warn('v165 cheddar spot',e)}
  return f.apply(this,arguments)}}
// the old gateway portals of the three instances are hidden (their records stay for older code)
function ss165HidePortals(){try{RPORT.forEach(r=>{if(r.k=='next'&&r.pi===3&&r.ig>=insG(3,0)&&r.ig<=insG(3,2)){r.g.visible=false;r.ss165=1}})}catch(_){}}
ss165HidePortals();
