// ================= v148: camps come back after 5 minutes; clearing one gives a little XP and a chest =================
// Camp creatures used to return RESP_T (50 s) after each died, like the roaming ones, so a camp refilled while you fought it.
// Now a camp's creatures wait CAMP148.resp (300 s) after they fall, and when the last one falls the whole camp is reset to
// come back together 5 minutes from that moment (still never while a hero stands within RESP_NEAR of a spot).
// Clearing a camp (the kill that takes its last living creature) gives a small XP reward (CAMP148.xp kills' worth at the
// camp's level, shared with the active companions like kill XP) and drops a treasure chest at its heart: F opens it for
// 2-3 different things from the loot table of that area's creatures (rolled at the camp's level and tier):
// a piece of gear (uncommon or better), the zone's upgrade material, a family part of one of the camp's creatures,
// a companion egg of the zone's tier, a health potion, or raw meat from a beast camp.
// Chests are local to each player (co-op: each player gets their own when a camp they are near is cleared) and are not saved.
var CAMP148={resp:300,xp:2.5,n:[2,3],chests:[]};
{const f=kill;kill=function(e){let C=null,was=true;try{C=e&&e.camp||null;was=C?campCleared(C):true}catch(_){}
  const r=f.apply(this,arguments);
  try{const now=nowP();if(e&&e.slot&&e.slot.camp)e.slot.rt=Math.max(e.slot.rt||0,now+CAMP148.resp*1000);
    if(C&&!C.raid&&!was&&campCleared(C)){
      if(typeof ROST!='undefined'&&ROST.slots)ROST.slots.forEach(s=>{if(s.camp===C&&s.dead)s.rt=now+CAMP148.resp*1000});
      camp148Clear(C)}}catch(err){console.warn('v148 camp',err)}
  return r}}
function camp148Lv(C){try{return Math.max(1,Math.min(MAXLV,zoneLv(C.x,C.z)))}catch(_){return hero.lvl||1}}
function camp148T(C){try{return Math.max(1,Math.min(5,(PMAP[INSL[C.ig].z].t)||tierAt(C.x,C.z)))}catch(_){return 1}}
function camp148XP(C){const L=camp148Lv(C),s=HS();return Math.max(1,Math.round((8+L*12)*.6375*(typeof ECON96!='undefined'?ECON96.xp:1)*(1+(s.xp||0))*CAMP148.xp))}
function camp148Give(xp){
  if(hero.lvl<MAXLV){hero.xp+=hxp164(xp);while(hero.lvl<MAXLV&&hero.xp>=needH(hero.lvl)){hero.xp-=needH(hero.lvl);heroLevelUp()}}else hero.xp=0;
  party.slice(0,actN141()).forEach(c2=>{if(!c2||c2.l>=MAXLV)return;c2.x+=xp;while(c2.l<MAXLV&&c2.x>=needH(c2.l)){c2.x-=needH(c2.l);c2.l++;c2.h=M(c2);say(nm(c2)+' reached Lv '+c2.l+'!')}})}
// the camp's creature families (from its garrison list)
function camp148Fams(C){const L=[];try{(C.th&&C.th.mem||[]).forEach(m=>{const E=EN[m[0]];const f=(E&&E.fam)||famOf(m[0]);if(FAMD[f]&&!L.includes(f))L.push(f)})}catch(_){}return L.length?L:['Beast']}
// 2-3 different kinds from the area's loot table, each with its own roll
function camp148Loot(C){const l=camp148Lv(C),T=camp148T(C),F=camp148Fams(C),beast=F.some(f=>['Beast','Sky','Dragon','Earth'].includes(f));
  const K=[['gear',3],['mat',3],['part',3],['egg',1.2],['potion',1.4]];if(beast)K.push(['meat',1]);
  const n=CAMP148.n[0]+Math.floor(Math.random()*(CAMP148.n[1]-CAMP148.n[0]+1)),out=[];
  while(out.length<n&&K.length){const t=K.reduce((s,q)=>s+q[1],0);let r=Math.random()*t,i=0;for(;i<K.length-1;i++){r-=K[i][1];if(r<0)break}
    const k=K.splice(i,1)[0][0];
    if(k=='gear'){const it=genItem(l,{minR:1,cls:hero.cls});if(it)out.push(['gear',it,it.r])}
    else if(k=='mat')out.push(['mat',{k:UPM[T-1][0],n:R(2,4)},T-1]);
    else if(k=='part'){const f=F[Math.floor(Math.random()*F.length)];out.push(['mat',{k:FAMD[f].mat,n:R(2,4)},1])}
    else if(k=='egg'){const eg=rollEgg(T);if(eg)out.push(['egg',eg,eg.tier])}
    else if(k=='potion')out.push(['potion',null,1]);
    else if(k=='meat')out.push(['sup',{k:'meat',n:R(1,3)},0])}
  return out}
// the chest goes on free ground near the camp's heart
function camp148Spot(C){for(let r=0;r<=6;r++)for(let a=0;a<12;a++){const x=Math.round(C.x+Math.cos(a/12*6.283)*r),z=Math.round(C.z+Math.sin(a/12*6.283)*r);
  if(!solid(x,z)&&!(typeof CBLK!='undefined'&&CBLK.has(z*W+x)))return [x,z];if(!r)break}return [C.x,C.z]}
function camp148Clear(C){
  const xp=camp148XP(C);camp148Give(xp);try{dn(pl.position,'+'+hxp164(xp)+' XP','#c4b5fd',0,1600)}catch(_){}
  if(C.ch148&&CHESTS.includes(C.ch148)){say('⛺ '+(C.th?C.th.n:'Camp')+' cleared! +'+xp+' XP');return}
  const [x,z]=camp148Spot(C),loot=camp148Loot(C);
  const ch=makeChest(x,z,'camp chest',p=>{loot.forEach(q=>drop(q[0],q[1],p,q[2]));C.ch148=null;const i=CAMP148.chests.indexOf(ch);if(i>=0)CAMP148.chests.splice(i,1)});
  ch.camp=C;ch.ig=C.ig;C.ch148=ch;CAMP148.chests.push(ch);
  try{burst(gY(ch.g.position,.6),0xffd060,30,2,2,.6)}catch(_){}try{sfx('chime')}catch(_){}
  say('⛺ '+(C.th?C.th.n:'Camp')+' cleared! +'+xp+' XP · a treasure chest waits at its heart (F). The camp returns in 5 minutes.')}
