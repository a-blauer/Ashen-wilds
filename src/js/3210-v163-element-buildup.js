// ================= v163: element buildup → primed → reaction (replaces the v45 instant reactions) =================
// Before (v45 `applyEl` in 0320): the first element hit marked an enemy for 5 s and the next hit of a different element
// reacted at once (×1.2–×2 on that hit). A hero + companion of different elements set off a reaction every couple of hits.
// Now:
// 1. Buildup. Each element hit fills a meter on the enemy (`e.eb` = {k, v 0..1, t last fill}). How much depends on the
//    source (`EB163.F`): a hero hit fills by its size (raw ÷ the hero's attack, clamped), a companion hit and a status
//    (burn / poison) a fixed amount. Elites fill at ×.75, bosses at ×.5. No fill for 3 s → it drains at .3 per second.
//    A different element while building pushes the meter back (tug of war); if it empties, the new element takes over.
// 2. Primed. A full meter primes the enemy for `EB163.pT` (6 s, no refresh): its health bar glows and shimmers in the
//    element's colour with the element's icon beside it, and the ground ring (`elRing`) shows. While building, only the
//    bar's border takes on the colour, stronger as it fills. Bosses: the same on the top boss bar (`#boss`).
// 3. Reaction. A hit of a different element on a primed enemy sets off the reaction for that pair (`EB163.R`, bigger than
//    v45 since they come less often) with a short hit-stop and shake; the enemy is unprimed. Pairs with no reaction
//    (frost+poison, poison+shock) and the primed element itself do nothing. A companion cannot react with the element it
//    primed itself (the v127 rule, `CH127`). Frozen's Shatter (next non-element hit ×1.7, in `heroHit`) is unchanged.
// `e.el` keeps its old meaning for the rest of the code (the element an enemy carries) but now only while primed, so
// 0340's expiry and `eStatus`'s guard still work. This definition replaces 0320's `applyEl` and 2300's wrapper.
var EB163={pT:6000,hold:3000,drain:.3,F:{h:.24,c:.13,s:.1},hMin:.4,hMax:2.5,al:.75,boss:.5,
  // reaction: m = damage multiplier on the hit that set it off (v45 value in the comment)
  R:{'fire+frost':{m:2.5},          // Melt, was ×2
     'frost+water':{m:1,stun:2.2},  // Frozen (stun, then Shatter), unchanged
     'shock+water':{m:1.6,ch:.9},   // Conduct, was ×1.3, chains .7
     'fire+poison':{m:2,sp:1.1},    // Combust, was ×1.6, splash .9
     'fire+shock':{m:1.8,sp:.9},    // Overload, was ×1.4, splash .7
     'frost+shock':{m:1.5,wk:8},    // Brittle, was ×1.25
     'fire+water':{m:1.5,stun:1},   // Steam, was ×1.2
     'poison+water':{m:1.5}},       // Spread, was ×1.2
  calm:null};
function eb163Calm(){if(EB163.calm==null){try{EB163.calm=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){EB163.calm=false}}return EB163.calm||SET.shake===false}
function eb163Fill(e,el,raw,src){
  let f;if(src=='h'){const U=Math.max(1,atkOf(heroMt()));f=EB163.F.h*Math.min(EB163.hMax,Math.max(EB163.hMin,(raw||U)/U))}
  else f=src=='c'?EB163.F.c:EB163.F.s;
  return f*(e.boss?EB163.boss:e.c&&e.c.al?EB163.al:1);
}
applyEl=function(e,el,raw,src){
  if(!el||!e||e.dead||!ELI[el])return 1;const t=nowP(),P=e.m.position,byC=CH127&&CH127.e===e?CH127.c:null;
  const cur=e.el&&e.el.t>t?e.el:null;
  if(cur){                                                     // primed: a different element reacts
    if(cur.k===el)return 1;const key=[cur.k,el].sort().join('+'),R=EB163.R[key];if(!R)return 1;
    if(byC&&cur.by===byC)return 1;                             // a companion never reacts with its own priming
    e.el=null;e.eb=null;elRing(e,null);return eb163React(e,key,R,raw,P);
  }
  if(e.el){e.el=null;elRing(e,null)}
  const add=eb163Fill(e,el,raw,src),B=e.eb;
  if(!B||B.v<=0)e.eb={k:el,v:add,t};
  else if(B.k===el){B.v+=add;B.t=t}
  else{B.v-=add;B.t=t;if(B.v<0)e.eb={k:el,v:-B.v,t}}
  const b=e.eb;if(b.v>=1){e.eb=null;e.el={k:el,t:t+EB163.pT,by:byC};elRing(e,el);ring(P,ELI[el][1],1.3,260)}
  return 1;
}
function eb163React(e,key,R,raw,P){
  const splash=(r,k,col,fx)=>enemies.forEach(o=>{if(o.dead||o===e||d2(o.m.position,P)>r)return;heroHit_base(o,raw*k,heroMt(),{proc:false,s:{col}});if(fx&&!o.dead)eStatus(o,fx,0)});
  hstop=Math.max(hstop,.07);shake(.22);
  switch(key){
    case 'fire+frost':popT(P,'MELT!','#fb923c',true);burst(gY(P,.9),0xff9a4a,40,2.6,2.4,.6);ring(P,0xffb070,2.2,320);sfx('brk',.8);break;
    case 'frost+water':e.stun=Math.max(e.stun||0,e.boss?.6:R.stun);e.frz=2.2;if(!e.boss)mCancel(e);popT(P,'FROZEN!','#93c5fd',true);burst(gY(P,.8),0xbfe8ff,40,1.6,1.6,.7);ring(P,0xbfe8ff,2,320);break;
    case 'shock+water':{popT(P,'CONDUCT!','#fde047',true);let n=0;enemies.slice().sort((a,b)=>d2(a.m.position,P)-d2(b.m.position,P)).forEach(o=>{if(n>=3||o.dead||o===e||d2(o.m.position,P)>6)return;n++;zapLine(P,o.m.position);heroHit_base(o,raw*R.ch,heroMt(),{proc:false,s:{col:0xfff06a}})});ring(P,0xfff06a,2,300);break}
    case 'fire+poison':popT(P,'COMBUST!','#f97316',true);ring(P,0xff7a2a,3.2,380);burst(gY(P,.6),0xff8a3a,70,4,3,.7);shake(.32);sfx('boom');splash(3.2,R.sp,0xff7a2a);break;
    case 'fire+shock':popT(P,'OVERLOAD!','#facc15',true);ring(P,0xfff06a,2.8,320);enemies.forEach(o=>{if(o.dead||d2(o.m.position,P)>2.8)return;const a=V().subVectors(o.m.position,P).setY(0).normalize();o.vx=a.x*9;o.vz=a.z*9});splash(2.8,R.sp,0xfff06a);sfx('boom',.6);break;
    case 'frost+shock':e.wk=Math.max(e.wk||0,R.wk);popT(P,'BRITTLE!','#a5f3fc',true);burst(gY(P,.9),0xa5f3fc,30,1.8,1.8,.5);ring(P,0xa5f3fc,1.8,300);break;
    case 'fire+water':e.stun=Math.max(e.stun||0,e.boss?.3:R.stun);if(!e.boss)mCancel(e);popT(P,'STEAM!','#e2e8f0',true);burst(gY(P,1),0xffffff,40,1.8,2.2,.9);break;
    case 'poison+water':popT(P,'SPREAD!','#a3e635',true);ring(P,0x8ad84a,5,380);enemies.forEach(o=>{if(o.dead||o===e||d2(o.m.position,P)>5)return;eStatus(o,{poison:5},atkOf(heroMt())*1.2)});break;
  }
  return R.m;
}
// ---------- the health bar: border tint while building, glow + shimmer + icon while primed ----------
var EB163T=null;
function eb163Tex(){
  if(EB163T)return EB163T;const mk=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);return t};
  EB163T={
    soft:mk(128,32,(g,w,h)=>{const y=g.createLinearGradient(0,0,0,h);y.addColorStop(0,'rgba(255,255,255,0)');y.addColorStop(.5,'rgba(255,255,255,1)');y.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=y;g.fillRect(0,0,w,h);
      g.globalCompositeOperation='destination-in';const x=g.createLinearGradient(0,0,w,0);x.addColorStop(0,'rgba(0,0,0,0)');x.addColorStop(.18,'rgba(0,0,0,1)');x.addColorStop(.82,'rgba(0,0,0,1)');x.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=x;g.fillRect(0,0,w,h)}),
    streak:mk(32,8,(g,w,h)=>{const x=g.createLinearGradient(0,0,w,0);x.addColorStop(0,'rgba(255,255,255,0)');x.addColorStop(.5,'rgba(255,255,255,1)');x.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=x;g.fillRect(0,0,w,h)}),
    ic:{}};
  for(const k in ELI)EB163T.ic[k]=mk(64,64,(g,w,h)=>{g.beginPath();g.arc(32,32,29,0,7);g.fillStyle='rgba(10,8,14,.85)';g.fill();g.lineWidth=3;g.strokeStyle='#'+ELI[k][1].toString(16).padStart(6,'0');g.stroke();
    g.font='34px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ELI[k][0],32,35)});
  return EB163T;
}
function eb163Vis(e){
  const g=e.hb;if(!g||g._free||!g.fill)return null;if(g.eb)return g.eb;const T=eb163Tex();
  // the bar's own back and fill join the transparent pass (opacity stays 1) so renderOrder puts the glow behind them
  g.children.forEach(o=>{if(o.material){o.material.transparent=true;o.material.depthWrite=false;o.material.needsUpdate=true}});
  const mb=(o)=>new THREE.MeshBasicMaterial(Object.assign({transparent:true,opacity:0,depthTest:false,depthWrite:false},o));
  const fr=new THREE.Mesh(G_BAR,mb({}));fr.scale.set(1.08,1.9,1);fr.position.z=-.001;fr.renderOrder=4;   // border (behind the dark back)
  const gl=new THREE.Mesh(G_BAR,mb({map:T.soft,blending:THREE.AdditiveBlending}));gl.scale.set(1.5,5,1);gl.position.z=-.002;gl.renderOrder=3;
  const sh=new THREE.Mesh(G_BAR,mb({map:T.streak,blending:THREE.AdditiveBlending}));sh.scale.set(.16,1,1);sh.position.z=.002;sh.renderOrder=7;
  const ic=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthTest:false,depthWrite:false}));ic.scale.set(.24,.24,1);ic.position.set(-.66,0,.003);ic.renderOrder=8;
  [fr,gl,sh,ic].forEach(o=>{o.visible=false;g.add(o)});return g.eb={fr,gl,sh,ic,k:null};
}
function eb163Off(V){if(V&&(V.fr.visible||V.ic.visible)){V.fr.visible=V.gl.visible=V.sh.visible=V.ic.visible=false;V.k=null}}
function eb163Frame(){
  if(typeof enemies=='undefined')return;const t=nowP(),calm=eb163Calm();let bossE=null,bossD=1e9;
  for(const e of enemies){
    if(e.dead){eb163Off(e.hb&&e.hb.eb);continue}
    const B=e.eb;if(B&&t-B.t>EB163.hold){B.v-=EB163.drain*Math.min(.1,(t-(B.dt||t))/1000);if(B.v<=0)e.eb=null}
    if(e.eb)e.eb.dt=t;
    const pr=e.el&&e.el.t>t?e.el:null,bd=e.eb;
    if(e.boss&&(pr||bd)){const d=pl.position.distanceTo(e.m.position);if(d<bossD){bossD=d;bossE=e}}
    if(!pr&&!bd){eb163Off(e.hb&&e.hb.eb);continue}
    const V=eb163Vis(e);if(!V)continue;const k=pr?pr.k:bd.k,col=ELI[k][1];
    if(V.k!==k){V.k=k;V.fr.material.color.setHex(col);V.gl.material.color.setHex(col);V.sh.material.color.setHex(col).lerp(new THREE.Color(0xffffff),.5);V.ic.material.map=EB163T.ic[k];V.ic.material.needsUpdate=true}
    V.fr.visible=true;
    if(pr){
      const w=calm?.5:.5+.5*Math.sin(t/1000*Math.PI*5),r=Math.max(.001,e.c.h/M(e.c));
      V.fr.material.opacity=.8+.2*w;V.gl.visible=true;V.gl.material.opacity=.3+.35*w;V.ic.visible=true;V.ic.scale.setScalar(.24*(1+.08*w));
      V.sh.visible=!calm;if(!calm){const u=(t%900)/900;V.sh.position.x=-.5+u*r;V.sh.material.opacity=.9*Math.sin(u*Math.PI)}
    }else{V.fr.material.opacity=.12+.6*Math.min(1,bd.v);V.gl.visible=V.sh.visible=V.ic.visible=false}
  }
  eb163Boss(bossE,t);
}
// the top boss bar (Sovereigns, mini bosses): same idea in CSS
var EB163B=null;
function eb163Boss(e,t){
  const box=$('boss');if(!box)return;const mt=box.querySelector('.meter');if(!mt)return;
  if(!EB163B){EB163B={ic:document.createElement('span'),k:null};EB163B.ic.id='eb163bi';box.appendChild(EB163B.ic)}
  const pr=e&&e.el&&e.el.t>t?e.el:null,bd=e&&e.eb,k=pr?pr.k:bd?bd.k:null,key=k?(pr?'p':'b')+k+(pr?'':Math.round(bd.v*10)):null;
  if(key===EB163B.k)return;EB163B.k=key;
  if(!k){mt.style.removeProperty('--eb163c');mt.style.removeProperty('--eb163a');mt.classList.remove('eb163b','eb163p');EB163B.ic.textContent='';return}
  const c='#'+ELI[k][1].toString(16).padStart(6,'0');mt.style.setProperty('--eb163c',c);
  mt.classList.toggle('eb163p',!!pr);mt.classList.toggle('eb163b',!pr);
  if(!pr)mt.style.setProperty('--eb163a',(.15+.6*Math.min(1,bd.v)).toFixed(2));
  EB163B.ic.textContent=pr?ELI[k][0]:'';EB163B.ic.style.color=c;
}
{const s=document.createElement('style');s.textContent=
 '#eb163bi{position:absolute;right:-6px;bottom:2px;font-size:1.05rem;filter:drop-shadow(0 0 4px currentColor);pointer-events:none}'+
 '#boss .meter.eb163b{box-shadow:inset 0 0 0 1px rgba(236,200,130,.18),0 0 0 2px color-mix(in srgb,var(--eb163c) calc(var(--eb163a)*100%),transparent)}'+
 '#boss .meter.eb163p{box-shadow:0 0 0 2px var(--eb163c),0 0 12px 2px var(--eb163c);animation:eb163g .4s ease-in-out infinite alternate}'+
 '#boss .meter.eb163p::after{content:"";position:absolute;top:0;bottom:0;width:18%;left:-20%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);animation:eb163s .9s linear infinite}'+
 '@keyframes eb163g{from{box-shadow:0 0 0 2px var(--eb163c),0 0 6px 1px var(--eb163c)}to{box-shadow:0 0 0 2px var(--eb163c),0 0 16px 4px var(--eb163c)}}'+
 '@keyframes eb163s{to{left:100%}}'+
 '@media (prefers-reduced-motion:reduce){#boss .meter.eb163p,#boss .meter.eb163p::after{animation:none}#boss .meter.eb163p::after{display:none}}';
 document.head.appendChild(s)}
{const f=loop;loop=function(now){const r=f.apply(this,arguments);try{eb163Frame()}catch(err){if(!EB163.err){EB163.err=1;console.error('eb163',err)}}return r}}
