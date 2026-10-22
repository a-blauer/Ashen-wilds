// ================= v46: breakable camp boxes, Shadow Rush, level by distance from town =================
// ---------- breakable crates & barrels ----------
const BXMAT=[['wood','fiber','stone'],['iron','clay','wood'],['crystal','bone','clay'],['iron','crystal','bone'],['crystal','bone','iron']];
function brkBox(C,b){
  if(b.b)return;b.b=nowP();const p=V(b.x,0,b.z),T=tierAt(b.x,b.z),l=zoneLv(b.x,b.z);
  burst(gY(p,.5),0x8a5a30,26,2.6,2.4,.6);burst(gY(p,.4),0xc8a070,10,1.6,1.6,.5);sfx('blunt');sfx('slash',.5);
  b.g.matrixAutoUpdate=true;tw(260,k=>{b.g.scale.set(1+k*.4,1-k,1+k*.4);b.g.rotation.z=k*.4},()=>{b.g.visible=false;b.g.scale.set(1,1,1);b.g.rotation.z=0});
  const g=Math.max(1,Math.round((2+l*.8)*(.7+Math.random()*.6)));gold+=g;dn(p,'+'+g+' 🪙','#fbbf24',-26,1000);
  const mk=BXMAT[T-1][R(0,2)];if(RES[mk]||matInfo(mk))drop('mat',{k:mk,n:R(1,3)},p,0);
  const r=Math.random();if(r<.03){const eg=rollEgg(T);drop('egg',eg,p,eg.tier)}else if(r<.11)drop('potion',null,p,1);
  hud();
}
function brkNear(p,r,dir,half){
  CAMPS.forEach(C=>{if(!C.boxes||!C.g||!C.g.visible)return;const cr=C.r||CAMP_R;if(Math.abs(C.x-p.x)>cr+r+2||Math.abs(C.z-p.z)>cr+r+2)return;
    C.boxes.forEach(b=>{if(b.b)return;const dx=b.x-p.x,dz=b.z-p.z,L=Math.hypot(dx,dz);if(L>r+.45)return;
      if(dir&&L>.4&&Math.acos(Math.max(-1,Math.min(1,(dx*dir.x+dz*dir.z)/L)))>half+.25)return;brkBox(C,b)})});
}
function area(p,r,dm,s,dir,half){const out=area_base(p,r,dm,s,dir,half);if(!(s&&s.cc))brkNear(p,r,dir,half);return out}
function brkShot(p){let hit=false;CAMPS.forEach(C=>{if(hit||!C.boxes||!C.g||!C.g.visible)return;C.boxes.forEach(b=>{if(hit||b.b)return;if(Math.hypot(b.x-p.x,b.z-p.z)<.7){brkBox(C,b);hit=true}})});return hit}
// boxes come back after a few minutes, once you're away from the camp
setInterval(()=>{const t=nowP();CAMPS.forEach(C=>{if(!C.boxes)return;C.boxes.forEach(b=>{if(b.b&&t-b.b>300000&&Math.hypot(b.x-pl.position.x,b.z-pl.position.z)>40){b.b=0;b.g.visible=true}})})},5000);
// ---------- Shadow Rush (assassin skill 1): a collision-safe dash that slices through everything in its path ----------
function shadowRush(dist,raw,mt,fx,sk){
  const hit=new Set();let first=true;const ms=dist/14*1000+40;
  tw(ms,()=>{const P=pl.position;burst(gY(P,.9),0x5a3a8a,4,.6,.8,.45);burst(gY(P,.5),0x1a1028,3,.4,.5,.6);
    enemies.forEach(e=>{if(e.dead||hit.has(e))return;if(d2(e.m.position,P)<1.35+(e.c.al?.3:0)+(e.boss?1.2:0)){hit.add(e);heroHit(e,raw,mt,{crit:first,s:fx});if(typeof lpHas=='function'&&lpHas('venom')&&!e.dead)eStatus(e,{poison:6},atkOf(mt)*.9,'h');first=false;burst(gY(e.m.position,1),sk.col,24,2,2,.5);hstop=.035}});
    brkNear(P,1.2)},
   ()=>{ring(pl.position,0x9a6ae0,1.6,260);if(hit.size>1)popT(pl.position,'×'+hit.size+' RUSH','#c4b5fd')});
}
var camDD=null;
const fntN=(x,z)=>TOWNS.some(t=>Math.abs(x-t.cx)<3.2&&Math.abs(z-t.cy)<3.2);

