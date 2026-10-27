// ================= v152 Special instances: mini levels outside the zone grid =================
// Hillside Crest's main quest puts two one-time levels between its field instances: Abeksi, the serpent city (a stealth level
// between I and II, 3151–3154) and the Hilltop Ascent (a mounted chase between II and III, 3160–). They live in the free map space
// below the zone grid (rows y ≥ 1448), each with its own instance record (INSL[30], INSL[31]) so everything that asks "where am I"
// (curIns, chunk visibility, the clip shader, atmosphere, the co-op region, the minimap fog) treats them as places of their own.
//  * Records: sp152Defs() (hoisted, pure). k is 0 for the city and 1 for the ascent: never more than the field instance the level
//    follows (1940's load bump raises INSR to I.k), and openWMap names p.ins[k+1] as "the way on" (II, III), which is right.
//  * insAt (0045) asks spIns(x,y) for rows below the grid; spIns answers only once this file has registered the records (SPI.on),
//    so nothing during the world build (0045–2999) ever sees them: no harvest nodes, decorations, rosters or rims are made there.
//  * Ground: sp152Map (called from 0045 after every seeded step) lets each level paint its tiles, DW and biome; sp152Terrain (0045,
//    after the heights) lets a level write its own heights. Each level's painter is a hoisted function of plain numbers.
//  * Rules while inside (SP152.R[key]): park (companions wait outside: hidden, no AI, no spells), noMount / forceMount, noFight
//    (no attacks, abilities or potions), noRecall (T is refused with the level's message), onLoad (where a save made inside loads).
//  * Gateways: a level replaces the RPORT 'next' gateway of the field instance before it (hidden; its record stays for Cheddar and
//    old code) with its own entrance and F prompt (sp152GateSpot finds a spot at the gateway clearing's far edge).
//  * The tracker #mqt152 (Hillside Crest main quest) sits where Kindlelight's #mqt143 does; each chapter adds its lines (SP152.trk).
var SPI;
function sp152Defs(){if(sp152Defs.c)return sp152Defs.c;return sp152Defs.c=[
  {key:'abeksi',g:30,z:1,k:0,x0:116,y0:1452,w:150,h:200,n:'Abeksi',rn:'Abeksi',lv:[11,11],
    bio:{n:'Abeksi',sp:'Foxlet',x:0,y:0,t:2,gnd:[96,84,66],grs:[70,84,54],acc:[104,98,90],frs:[40,34,28],wat:[40,70,90],tree:['dead'],pr:['rock'],den:[0,0,0,0],tc:[0x3a2a20,0x3a4a2a,0x4a5a34],amp:.1}},
  {key:'ascent',g:31,z:1,k:1,x0:280,y0:1452,w:420,h:380,n:'The Hilltop Ascent',rn:'Ascent',lv:[14,14],
    bio:{n:'Hilltop Ascent',sp:'Foxlet',x:0,y:0,t:2,gnd:[84,80,68],grs:[70,92,52],acc:[104,96,82],frs:[40,52,36],wat:[60,110,150],tree:['pine'],pr:['rock'],den:[0,0,0,0],tc:[0x4a3a28,0x3a6a3a,0x4a7a44],amp:1}}]}
// 0045: paint each level's ground (tiles, DW, biome) — after every seeded step of the world, so nothing else moves
function sp152Map(m,bio,DW){try{sp152Defs().forEach(I=>{const bi=BIOMES.push(Object.assign({},I.bio))-1;I.bi=bi;
    const f=I.key=='abeksi'?(typeof ab152Map=='function'?ab152Map:null):I.key=='ascent'?(typeof ch153Map=='function'?ch153Map:null):null;if(f)f(m,bio,DW,I,bi)})}catch(e){console.warn('v152 map',e)}}
// 0045: a level's own heights (after every other height pass)
function sp152Terrain(){try{sp152Defs().forEach(I=>{if(I.key=='ascent'&&typeof ch153Terrain=='function')ch153Terrain(I)})}catch(e){console.warn('v152 terrain',e)}}
// 0070: trees inside a level are scenery, not harvest nodes (hoisted: 0070 runs long before this file)
function sp152NoNode(x,y){try{return sp152Defs().some(I=>x>=I.x0&&y>=I.y0&&x<I.x0+I.w&&y<I.y0+I.h)}catch(_){return false}}
function spIns(x,y){if(!SPI||!SPI.on)return null;const L=SPI.L;for(let i=0;i<L.length;i++){const I=L[i];if(x>=I.x0&&y>=I.y0&&x<I.x0+I.w&&y<I.y0+I.h)return I}return null}

// ---------------- the records (registered here, after every load-time INSL loop) ----------------
var SP152={R:{},trk:{},gates:{},err:0,park:0,parkN:0};
SPI={L:[],on:false,by:{}};
try{sp152Defs().forEach(D=>{const I={z:D.z,k:D.k,g:D.g,x0:D.x0,y0:D.y0,w:D.w,h:D.h,fld:false,den:false,tri:false,sp:D.key,lv:D.lv.slice(),n:D.n,rn:D.rn,
    cl:[],br:[],fd:[],wp:[],wa:null,bi:D.bi};
    const c=[D.x0+Math.round(D.w/2),D.y0+Math.round(D.h/2)];I.en=c.slice();I.ba=c.slice();I.path=[c.slice(),c.slice()];
    INSL[D.g]=I;SPI.L.push(I);SPI.by[D.key]=I});SPI.on=true}catch(e){console.error('v152 records',e)}
function sp152I(key){return SPI&&SPI.by[key]||null}
function sp152Here(key){try{const I=curIns();return !!I&&I.sp===key}catch(_){return false}}
function sp152Cur(){try{const I=curIns();return I&&I.sp?I.sp:null}catch(_){return null}}
function sp152Rule(n){const k=sp152Cur();if(!k)return null;const R=SP152.R[k];return R&&R[n]!=null?(typeof R[n]=='function'?R[n]():R[n]):null}

// ---------------- the atmosphere of each level (on top of the zone's, 1981 ia112) ----------------
function sp152Theme(key,t){try{if(!TH112||!TH112.byG)return;const I=sp152I(key);if(I)TH112.byG[I.g]=Object.assign({g:I.g,z:I.z,k:I.k},t)}catch(e){console.warn('v152 theme',e)}}

// ---------------- gateways: replace a field instance's 'next' portal with a level's own entrance ----------------
// the spot at the gateway clearing's far edge (away from where the road comes in), on open ground, facing the clearing
function sp152GateSpot(ig,out){const I=INSL[ig];if(!I||!I.path)return null;const P=I.path,G=I.ba,q=P[Math.max(0,P.length-16)];let dx=G[0]-q[0],dz=G[1]-q[1];const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;
  const free=(x,z)=>{const X=Math.round(x),Z=Math.round(z),t=MAP[Z]&&MAP[Z][X];return !!t&&!solid(X,Z)&&MAP.DW[Z*W+X]<-.6};
  for(const d of [out||10.5,10,9.5,9,8.5,8,7,6])for(const a of [0,.25,-.25,.5,-.5,.8,-.8]){const c=Math.cos(a),s=Math.sin(a),ux=dx*c-dz*s,uz=dx*s+dz*c,x=G[0]+ux*d,z=G[1]+uz*d;
    if(free(x,z)&&free(x+ux*1.2,z+uz*1.2)&&free(x-uz*1.6,z+ux*1.6)&&free(x+uz*1.6,z-ux*1.6))return {x,z,ry:Math.atan2(-ux,-uz),ux,uz}}
  return {x:G[0]+dx*6,z:G[1]+dz*6,ry:Math.atan2(-dx,-dz),ux:dx,uz:dz}}
// hide the old portal arch (the record stays: Cheddar's gateway spot and older code read it)
function sp152HidePortal(ig){try{const r=RPORT.find(q=>q.k=='next'&&q.ig===ig);if(r){r.g.visible=false;r.sp152=1}return r}catch(_){return null}}
// a gateway record: {ig, spot, build(spot) → group, prompt(spot) → {label, fn} | null, r (reach)}
function sp152Gate(key,G){SP152.gates[key]=G}
{const f=worldPrompt;worldPrompt=function(){try{const P=pl.position;for(const k in SP152.gates){const G=SP152.gates[k];if(!G.spot)continue;
      const I=curIns();if(!I||I.g!==G.ig)continue;if(Math.hypot(P.x-G.spot.x,P.z-G.spot.z)<(G.r||3.2)){const r=G.prompt(G.spot);if(r)return r}}}catch(e){if(!SP152.err++)console.warn('v152 gate prompt',e)}
  return f.apply(this,arguments)}}
// build each gateway once, the first time its instance is visited (the portal arch is hidden right away)
function sp152GateTick(){const I=curIns();for(const k in SP152.gates){const G=SP152.gates[k];
    if(!G.hid){G.hid=1;sp152HidePortal(G.ig)}
    if(!G.spot&&I&&I.g===G.ig){try{G.spot=G.where?G.where():sp152GateSpot(G.ig);G.g=G.build(G.spot);G.spot.built=1}catch(e){console.error('v152 gate build',k,e);G.spot=G.spot||{x:0,z:0};G.err=1}}
    if(G.g)G.g.visible=!!I&&I.g===G.ig;if(G.tick&&G.g&&G.g.visible)try{G.tick(G.spot)}catch(_){}}}

// ---------------- rules while inside a level ----------------
// companions wait outside: hidden, no follow, no AI, no spells; they come back beside the hero when the level is left
{const f=compTick;compTick=function(dt,now){if(sp152Rule('park')){SP152.park=1;try{fols.forEach(m=>{if(m){m.visible=false;m.position.set(pl.position.x,-60,pl.position.z)}})}catch(_){}return}
  if(SP152.park){SP152.park=0;try{fols.forEach((m,k)=>{if(m){m.position.set(pl.position.x+(k?1.4:-1.4),GH(pl.position.x,pl.position.z),pl.position.z+1)}})}catch(_){}}
  return f.apply(this,arguments)}}
{const f=compSpells;compSpells=function(){if(sp152Rule('park'))return;return f.apply(this,arguments)}}
// mounts: refused (the city) or held (the ascent)
{const f=toggleMount;toggleMount=function(){const no=sp152Rule('noMount'),hold=sp152Rule('forceMount');
  if(no&&!riding)return say(no);if(hold&&riding)return say(hold);return f.apply(this,arguments)}}
// no fighting: attacks, abilities and potions do nothing (a short reminder at most every 4 s)
function sp152NoFight(){const m=sp152Rule('noFight');if(!m)return false;const t=performance.now();if(!(t-(SP152.nfT||0)<4000)){SP152.nfT=t;say(m)}return true}
{const f=swing;swing=function(){if(sp152NoFight())return;return f.apply(this,arguments)}}
{const f=cast;cast=function(){if(sp152NoFight())return;return f.apply(this,arguments)}}
{const f=drink;drink=function(){if(sp152NoFight())return;return f.apply(this,arguments)}}
{const f=drinkMana;drinkMana=function(){if(sp152NoFight())return;return f.apply(this,arguments)}}
// recall: refused with the level's message
{const f=doRecall;doRecall=function(){const m=sp152Rule('noRecall');if(m)return say(m);return f.apply(this,arguments)}}
// a save made inside a level: the level decides where it loads (its checkpoint, or back outside)
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);try{const k=sp152Cur();if(k&&SP152.R[k]&&SP152.R[k].onLoad)SP152.R[k].onLoad()}catch(e){console.warn('v152 load',e)}return r}}

// ---------------- the Hillside Crest main quest tracker (#mqt152) ----------------
(function(){const st=document.createElement('style');st.textContent=`
#mqt152{position:fixed;right:12px;top:300px;z-index:6;width:224px;max-width:44vw;pointer-events:none;font-size:12px;line-height:1.35;color:#ece6d2;
  background:linear-gradient(270deg,rgba(14,12,6,.85),rgba(14,12,6,.4));border-right:2px solid #d8c060;border-radius:4px 0 0 4px;text-align:right;padding:6px 9px 7px;text-shadow:0 1px 2px #000}
#mqt152.hide{display:none}
#mqt152 .k{font-family:Cinzel,Georgia,serif;font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:#c8a860}
#mqt152 .h{font-family:'IM Fell English SC',Georgia,serif;color:#ffe9a0;font-size:13px;letter-spacing:.03em;margin-bottom:2px}
#mqt152 .o{display:flex;justify-content:flex-end;gap:8px;color:#d0c8b0;font-size:11.5px}
#mqt152 .o b{color:#fff4c8;font-weight:600}
#mqt152 .d{color:#ffe07a}
body.mob #mqt152{width:180px;font-size:11px}`;document.head.appendChild(st);
  const d=document.createElement('div');d.id='mqt152';d.className='hide';document.body.appendChild(d)})();
SP152.tk='';SP152.tt=0;
function sp152Trk(){const el=$('mqt152');if(!el)return;let I=null;try{I=curIns()}catch(_){}
  let out=null;if(I&&!(typeof uiOpen=='function'&&uiOpen()))for(const k in SP152.trk){try{const r=SP152.trk[k](I);if(r){out=r;break}}catch(_){}}
  const key=out?JSON.stringify(out):'h';if(key===SP152.tk)return;SP152.tk=key;
  if(!out){el.classList.add('hide');sp152TrkPos();return}
  let h='<div class="k">⚜ Main quest</div><div class="h">'+out.name+'</div>';(out.lines||[]).forEach(q=>{h+=q[2]?'<div class="o d"><span>'+q[0]+'</span></div>':'<div class="o"><span>'+q[0]+'</span>'+(q[1]!=null?'<b>'+q[1]+'</b>':'')+'</div>'});
  el.innerHTML=h;el.classList.remove('hide');sp152TrkPos()}
function sp152TrkPos(){const el=$('mqt152'),m=$('mini'),c=$('chqt132');if(!el||!m||!m.offsetParent)return;const mr=m.getBoundingClientRect();let b=mr.bottom;
  ['locBox','fsBtn','sysBtn','sysmenu','mbtn'].forEach(id=>{const e=$(id);if(!e||!e.offsetParent)return;const r=e.getBoundingClientRect();if(r.width&&r.right>mr.left-40&&r.left<mr.right+40)b=Math.max(b,r.bottom)});
  if(b+140>innerHeight)b=Math.max(mr.bottom,innerHeight*.35);const top=Math.round(b+10),right=Math.max(8,Math.round(innerWidth-mr.right))+'px';
  const on=!el.classList.contains('hide');if(on){el.style.top=top+'px';el.style.right=right}
  if(on&&c&&!c.classList.contains('hide'))c.style.top=(top+el.offsetHeight+8)+'px'}
{const f=chqTrkPos132;chqTrkPos132=function(){const r=f.apply(this,arguments);try{sp152TrkPos()}catch(_){}return r}}
addEventListener('resize',()=>{try{sp152TrkPos()}catch(_){}});
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{sp152GateTick()}catch(e){if(!SP152.err++)console.warn('v152 gates',e)}
  try{if(now-SP152.tt>400){SP152.tt=now;sp152Trk()}}catch(_){}return r}}
