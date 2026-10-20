// =============== shared: prompts, ticks, kills, map markers, saving ===============
function worldPrompt(){
  if(fishing)return null;const P=pl.position;
  for(const c of CHESTS)if(Math.hypot(P.x-c.x,P.z-c.z)<2.2)return {label:'F · Open '+c.label,fn:()=>openChest(c)};
  for(const m of tmaps)if(Math.hypot(P.x-m.x,P.z-m.z)<2)return {label:'F · Dig for treasure',fn:()=>digTreasure(m)};
  for(const S of SECRETS)if(S.k=='boulder'&&!S.broken&&S.g&&Math.hypot(P.x-S.x,P.z-S.z)<2.6)return {label:'Attack the cracked boulder to break it',fn:()=>say('Hit it with an attack or skill to break it open.')};
  const w=!riding&&nearWater();if(w)return {label:'F · Fish',fn:()=>fishStart(w)};
  return null}
// break boulders with attacks: extend the box-breaking hook
const _brkNear=brkNear;brkNear=function(p,r,dir,half){_brkNear(p,r,dir,half);SECRETS.forEach(S=>{if(S.k=='boulder'&&!S.broken&&S.g&&Math.hypot(S.x-p.x,S.z-p.z)<r+1.4){S.hits=(S.hits||0)+1;burst(gY(V(S.x,0,S.z),1),0x8a8478,12,2,2,.4);sfx('blunt',.6);if(S.hits>=3)breakBoulder(S);else dn(V(S.x,0,S.z),'Crack!','#e7e5e4',-20,600)}})};
function onKillX(e){
  if(!e)return;const p=e.m.position;
  if(e.ar!=null){drop('sup',{k:RUNEK[R(0,RUNEK.length-1)],n:1},p,3);if(Math.random()<.35){const it=genItem(e.c.l,{minR:Math.random()<.3?4:3,cls:hero.cls});drop('gear',it,p,it.r)}return}
  if(e.boss)return;
  if(e.c.al&&Math.random()<.05)drop('sup',{k:RUNEK[R(0,RUNEK.length-1)],n:1},p,2);
  if(e.c.al&&Math.random()<.04)giveMap(p);
}
let wTick=0;
function worldTick(dt,now){
  fishTick(dt);runeTick(dt);
  if(now-wTick<250)return;wTick=now;
  SECRETS.forEach(S=>{const d=Math.hypot(S.x-pl.position.x,S.z-pl.position.z);if(d<95&&!S.g&&!(S.k=='boulder'&&S.broken))buildSecret(S);if(S.g)S.g.visible=d<100});
  visTick();dexScan();
}
// Stormheart legendary: some hits zap nearby enemies
{const _hh=heroHit;heroHit=function(e,raw,mt,o){const d=_hh(e,raw,mt,o);if(d&&e&&lpHas('storm')&&Math.random()<.12){let n=0;enemies.forEach(q=>{if(n>=2||q.dead||q===e||d2(q.m.position,e.m.position)>5)return;n++;zapLine(e.m.position,q.m.position);heroHit_base(q,raw*.5,heroMt(),{proc:false,s:{col:0xfff06a}})})}
  if(d&&e&&!e.dead&&o&&o.s&&o.s.basic&&HS().setStorm&&Math.random()<.15){zapLine(V(e.m.position.x,6,e.m.position.z),e.m.position);heroHit_base(e,raw*.8,'m',{proc:false,s:{col:0xfff06a}});applyEl(e,'shock',raw,'h')}
  return d}}
// set bonuses that tweak the combat systems
{const _rg=resGain;resGain=function(v){return _rg(HS().setArc?v*1.3:v)}}
function miniMarks(w,h,vw,vh,cx,cy){const P=(x,z)=>[(x-(cx-vw/2)+.5)*w/vw,(z-(cy-vh/2)+.5)*h/vh],inV=(x,y)=>x>-6&&y>-6&&x<w+6&&y<h+6;
  const star=(x,y,c)=>{mmX.fillStyle=c;mmX.beginPath();for(let i=0;i<10;i++){const r=i%2?2.6:6,a=i*Math.PI/5-Math.PI/2;mmX.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}mmX.closePath();mmX.fill();mmX.strokeStyle='#000';mmX.lineWidth=1;mmX.stroke()};
  tmaps.forEach(m=>{const [x,y]=P(m.x,m.z);if(!inV(x,y))return;mmX.strokeStyle='#ef4444';mmX.lineWidth=2.5;mmX.beginPath();mmX.moveTo(x-4,y-4);mmX.lineTo(x+4,y+4);mmX.moveTo(x+4,y-4);mmX.lineTo(x-4,y+4);mmX.stroke()});
  CHESTS.forEach(c=>{const [x,y]=P(c.x,c.z);if(inV(x,y)){mmX.fillStyle='#fbbf24';mmX.fillRect(x-2.5,y-2.5,5,5)}});
}
function x2Save(){return {own:[...dex.own],egg:[...dex.egg],claim:[...dex.claim],sec:[...secOpen],tmaps,fish:fishLog}}
function x2Load(s){(s.own||[]).forEach(k=>dex.own.add(k));(s.egg||[]).forEach(k=>dex.egg.add(k));(s.claim||[]).forEach(k=>dex.claim.add(k));tmaps=s.tmaps||[];Object.assign(fishLog,s.fish||{});
  (s.sec||[]).forEach(k=>{secOpen.add(k);const S=SECRETS[+String(k).slice(1)];if(S&&S.k=='boulder'){S.broken=1;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)CBLK.delete((S.z+j)*W+S.x+i)}})}

