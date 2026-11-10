// ================= v196: the intro's walk through the round town =================
// The v151 intro walked a path drawn by hand through the old square (spawn → Steward → Innkeeper → Blacksmith → Merchant → Cheddar →
// the south gate → Portal Road). The town is round now and its buildings stand elsewhere, so each leg is found on the townsfolk's
// walking grid (czPath103) between the same stops, the Inn's leg runs in through its door to the bar (and back out), and the last
// two legs lead to the north gate and out toward Portal I's entryway, where the game begins (D.ref ahead, D.endYaw facing it).
function dm196IntroInn(){const l=DM196I.l;return l?lotW103(l,-3.5+DM196I.bar[0]+.9,.2+DM196I.bar[1]):TOWNS[0].tv}
function dm196IntroRef(){return dm196Ent(0,DM196.RM-1)}
function dm196IntroRoute(sp,npcSt,CS){const T=TOWNS[0],R=kf109().R,simp=P=>{if(!P||P.length<3)return P;const o=[P[0]];for(let i=1;i<P.length-1;i++){const a=o[o.length-1],b=P[i],c=P[i+1];
      const cr=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);if(Math.abs(cr)>.05||Math.hypot(b[0]-a[0],b[1]-a[1])>4)o.push(b)}o.push(P[P.length-1]);return o};
  const go=(a,b)=>{const P=czPath103(a[0],a[1],b[0],b[1]);return simp(P&&P.length>1?P:[a,b])};
  const l=DM196I.l,door=l?lotW103(l,0,DM196I.D2+1.4):null,inD=l?lotW103(l,0,DM196I.D2-1.6):null;
  const legs=[];
  legs.push(go(sp,npcSt[0]));
  // the Innkeeper: in through the door to the bar
  legs.push(door?go(npcSt[0],door).concat([inD,npcSt[1]]):go(npcSt[0],npcSt[1]));
  legs.push(door?[npcSt[1],inD].concat(go(door,npcSt[2])):go(npcSt[1],npcSt[2]));
  legs.push(go(npcSt[2],npcSt[3]));
  legs.push(go(npcSt[3],CS));
  const gin=[T.cx+.4,T.cy-10.6],a0=dm196ExA()[0],gout=[T.cx+Math.sin(a0)*(R+1.8),T.cy-Math.cos(a0)*(R+1.8)];legs.push(go(CS,gin).concat([[T.cx,T.cy-12.4]])); // up the plaza toward the north gate (the cut picks him up outside it)
  // v198: the cut lands outside Portal I's own exit (v196: the north gate)
  // the cut: outside Portal I's exit in the walls, a few steps on toward its entry (on the exit's cleared way)
  const e=dm196Ent(0,DM196.RM-1),d=Math.hypot(e[0]-gout[0],e[1]-gout[1]),k=Math.min(1,6.5/d);legs.push([gout,[gout[0]+(e[0]-gout[0])*k*.5,gout[1]+(e[1]-gout[1])*k*.5],[gout[0]+(e[0]-gout[0])*k,gout[1]+(e[1]-gout[1])*k]]);
  return legs.map(L=>L.map(p=>[+p[0],+p[1]]))}
// the town part is replayed exactly by the intro preview (v159): its random choices (a companion sniffing about while the hero
// talks, the town folk's errands) come from a generator seeded by the intro's clock, and the preview's reset puts back the
// companions' whole follow state, not only where they stand
{const f=ic151Dusk;ic151Dusk=function(S,t){const r=Math.random;let s=(Math.round(t*240)*2654435761)>>>0;
  Math.random=()=>{s=(s+0x6D2B79F5)>>>0;let z=s;z=Math.imul(z^z>>>15,z|1);z^=z+Math.imul(z^z>>>7,z|61);return((z^z>>>14)>>>0)/4294967296};
  try{return f.apply(this,arguments)}finally{Math.random=r}}}
if(typeof kqpvFols=='function'){kqpvFols=function(save){try{const K=['fol','idleT','look','lk','cdA'];
  if(save)KQPV.fs=(typeof fols!='undefined'?fols:[]).map(f=>f?[f,f.position.clone(),f.rotation.y,f.vel?f.vel.clone():null,f.sniff?f.sniff.clone():null,K.map(k=>f[k])]:null);
  else(KQPV.fs||[]).forEach(x=>{if(!x)return;const f=x[0];f.position.copy(x[1]);f.rotation.y=x[2];if(x[3]){f.vel=f.vel||x[3].clone();f.vel.copy(x[3])}else if(f.vel)f.vel.set(0,0,0);f.sniff=x[4]?x[4].clone():null;
    if(x[5])K.forEach((k,i)=>f[k]=x[5][i])})}catch(_){}}}
