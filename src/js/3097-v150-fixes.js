// ================= v150: small fixes from the owner's list =================
// 1) Tab finds what a boss fight spawns. In a den fight Tab only cycled through what stood within the v31 arena radius
//    of the den's centre, and in the Seeping Lair (Vorraxis, which is not a v31 arena) only through what stood in front of
//    you within 20 tiles: pustules, chalices, totems, ooze and the like spawned off to the side or further out could not be
//    picked. Now in any boss fight Tab cycles through every live, visible target within 34 tiles (nearest first, a short
//    memory so repeated presses walk the list), and outside fights, when nothing is in front of you, the nearest enemy within
//    20 tiles is picked instead of "No enemy in front of you".
// 2) Kindlelight II: nothing lands on the hatch. A chest (the camp-clear chest of the Glowmire Warren, a cache, a buried
//    treasure) that would stand within FX150.hatchR tiles of the hatch is moved to free ground just beyond it.
var FX150={hatchR:2.8,cyc:null,cycT:0};
function fx150Fight(){try{return !!((typeof AF!='undefined'&&AF&&AF.f)||(typeof MB144A!='undefined'&&MB144A&&MB144A.f))}catch(_){return false}}
function fx150Ok(e){return e&&!e.dead&&!e._gone&&!e.hid&&e.m&&e.m.visible!==false&&!e.mpGhost}
{const f=selectTarget;selectTarget=function(){const p=pl.position;
  if(fx150Fight()){const C=enemies.filter(e=>fx150Ok(e)&&d2(e.m.position,p)<34),now=nowP(),byD=(a,b)=>d2(a.m.position,p)-d2(b.m.position,p);
    if(!C.length){if(tgt)setTarget(null);return}
    let L=FX150.cyc;if(!L||now-FX150.cycT>3000)L=C.slice().sort(byD);else{L=L.filter(e=>C.includes(e));L=L.concat(C.filter(e=>!L.includes(e)).sort(byD))}
    FX150.cyc=L;FX150.cycT=now;const i=L.indexOf(tgt);setTarget(L[(i+1)%L.length]);return}
  const fw=camFwd(),front=enemies.some(e=>{if(!fx150Ok(e))return false;const v=V(e.m.position.x-p.x,0,e.m.position.z-p.z),L=v.length()||.01;return L<20&&(L<3||Math.acos(Math.max(-1,Math.min(1,v.dot(fw)/L)))<1.3)});
  if(front)return f.apply(this,arguments);
  const C=enemies.filter(e=>fx150Ok(e)&&d2(e.m.position,p)<20).sort((a,b)=>d2(a.m.position,p)-d2(b.m.position,p));
  if(!C.length)return f.apply(this,arguments);const i=C.indexOf(tgt);setTarget(C[(i+1)%C.length])}}

// ---------- 2) the hatch stays clear ----------
function fx150Hatch(x,z){try{const I=insAt(Math.round(x),Math.round(z));if(!I||I.g!==1)return null;const h=mq144HatchSpot();if(!h)return null;
    if(Math.hypot(x-h.x,z-h.z)>=FX150.hatchR)return null;const a0=Math.atan2(z-h.z,x-h.x)||0;
    for(let r=FX150.hatchR+.4;r<FX150.hatchR+5;r+=.5)for(let k=0;k<12;k++){const a=a0+(k%2?1:-1)*Math.ceil(k/2)*.52,qx=h.x+Math.cos(a)*r,qz=h.z+Math.sin(a)*r;
      if(!solid(Math.round(qx),Math.round(qz))&&!(typeof CBLK!='undefined'&&CBLK.has(Math.round(qz)*W+Math.round(qx))))return [Math.round(qx),Math.round(qz)]}}catch(_){}return null}
{const f=makeChest;makeChest=function(x,z){const q=fx150Hatch(x,z);if(q){const a=Array.prototype.slice.call(arguments);a[0]=q[0];a[1]=q[1];return f.apply(this,a)}return f.apply(this,arguments)}}

// ---------- 3) the raven's legs stay inside his robes ----------
// A robe's skirt (gkSkirt, 2505) hangs from the hips and follows each thigh (lh0 / rh0) toward the hem. The raven (race 3)
// walks on long bird legs whose shank swings well forward of the thigh at every step, so below the knee his shins and
// boots came through the front of the skirt (and out of its sides in the dagged robes). For the raven, the skirt below the
// knee now follows the shin (lh1 / rh1, which carries the thigh too) more and more toward the hem (RV150.shin at the hem),
// and above the knee it takes the whole swing of the thigh by the knee (RV150.thigh) instead of easing in down to y .32.
var RV150={knee:.354,band:.2,shin:.7,thigh:.95};
{const f=gkSkW;gkSkW=function(y0,lw){if(!(typeof BR!='undefined'&&BR.on&&BR.R&&BR.R===BRD[3]))return f.apply(this,arguments);
  // the raven: the cloth takes the thigh's swing fully by the knee (his thighs swing far), then more and more of the shin
  return (x,y)=>{const d=Math.max(0,Math.min(1,(y0-y)/Math.max(.05,y0-RV150.knee)))*RV150.thigh,l=Math.max(0,Math.min(1,.5-x/.16));if(d<=0)return [['pelvis',1]];
    const k=y>RV150.knee+.08?0:Math.min(1,(RV150.knee+.08-y)/RV150.band)*RV150.shin;
    return [['pelvis',1-d],['lh0',d*l*(1-k)],['lh1',d*l*k],['rh0',d*(1-l)*(1-k)],['rh1',d*(1-l)*k]].filter(q=>q[1]>0)}}}
