// ================= v106: every zone is three instances (I → II → III) =================
// The layout is in 0045 (PMI, insAt / rgAt / regionAt, pmLvSplit): each instance is half the area of a v97 zone, levels
// rise through I, II and III, and III holds the Sovereign's den and the wave arena. This file:
//  1. which instances you have reached (INSR[zone] = the furthest one, 0..2), saved as x2.insr. Standing in an instance
//     reaches it, however you got there (gateway, recall, joining a co-op partner). A cleared zone counts as fully reached.
//     Saves from before v106 reach every instance of every zone that was open to them (they could walk the whole zone).
//  2. the gateway at the end of I and II (0510 RPORT k:'next') takes you to the next instance's entrance
//  3. the portal at the zone's gate lists the reached instances (0510 XR.portal); recall (T) and T again in Duskhold
//     return you to the very spot (0860 INST)
//  4. creatures come back 30 s after they die (0550 RESP_T); the "zone falls quiet" banner is gone with that
//  5. chunk visibility only draws the instance you are in (1690 chunkVis, cvOK)
// v108: four reachable instances per zone (I, II, III, the Den; INSR 0..3) plus the Wave Trial (p.tri, entered from the portal)
var INSR=[0,0,0,0,0,0];
function insReach(i){if(bossDone.has(i)||(typeof CHEAT!='undefined'&&CHEAT.portals))return PMI-1;return Math.max(0,Math.min(PMI-1,INSR[i]|0))}
function insGo(N){if(AF||!N)return;if(typeof WV!='undefined'&&WV)return;fadeTo(()=>{insArrive(N);insMark(N)})}
function insMark(I){if(!I||I.k>=PMI||I.k<=(INSR[I.z]|0))return;INSR[I.z]=I.k;
  setTimeout(()=>say((I.den?'👑 ':'🌀 ')+I.n+' reached · you can now travel here straight from the '+PMAP[I.z].n+' portal in Duskhold.'),1200)}
var INSW={g:-2,t:0};
{const f=homeTick;homeTick=function(dt,now,al){f.apply(this,arguments);try{if(now-INSW.t<400)return;INSW.t=now;const I=curIns(),g=I?I.g:-1;
  if(g!==INSW.g){INSW.g=g;if(I)insMark(I)}}catch(_){}}}
{const f=x2Save;x2Save=function(){const s=f.apply(this,arguments)||{};try{s.insr=INSR.slice()}catch(_){}return s}}
{const f=x2Load;x2Load=function(s){try{INSR=PMAP.map((p,i)=>s&&Array.isArray(s.insr)?Math.max(0,Math.min(PMI-1,s.insr[i]|0)):0)}catch(_){INSR=[0,0,0,0,0,0]}return f.apply(this,arguments)}}
{const f=loadGame;loadGame=function(){const sv=typeof saveInfo=='function'?saveInfo():null,old=!!sv&&!(sv.x2&&Array.isArray(sv.x2.insr));const r=f.apply(this,arguments);try{if(old)PMAP.forEach((p,i)=>{if(pUnlocked(i))INSR[i]=PMI-1});
  // v108: a v106/v107 save that reached instance III could walk on to the den, which is now an instance of its own
  if(sv&&sv.x2&&sv.x2.wl!==WD_WL)INSR.forEach((v,i)=>{if(v>=PMF-1)INSR[i]=PMI-1});
  const I=curIns();INSW.g=I?I.g:-1;if(I&&I.k>INSR[I.z])INSR[I.z]=I.k}catch(err){console.warn('v106 load',err)}return r}}
// the J window: how far into each zone you are
{const f=XR.bosses;XR.bosses=function(){f.apply(this,arguments);try{const rows=$('xwB').querySelectorAll('.rw');PMAP.forEach((p,i)=>{const rw=rows[i];if(!rw||!pUnlocked(i))return;const sm=rw.querySelector('small');
  if(sm)sm.insertAdjacentHTML('beforeend','<br>Instances: '+p.ins.map(I=>(I.k<=insReach(i)?'✓ ':'🔒 ')+(I.den?'Den':I.rn+' (Lv '+I.lv[0]+'–'+I.lv[1]+')')).join(' · '))})}catch(_){}}}
