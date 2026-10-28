// v164: bigger, integrated camps (python3 probe.py v164_camps.js): every camp's site (radius before/after, moved), a build of
// each (draw calls, triangles, ms, lights, boxes), errors, and that the camp's heart, its chest spot, the garrison spots and most of
// its walkable ground are reachable from the instance entrance once every camp of the instance is built.
(()=>{const R={camps:[],err:[]};const w0=console.warn;console.warn=function(){R.err.push([...arguments].map(String).join(' ').slice(0,200));return w0.apply(this,arguments)};
  try{const S=cs164Sites();R.grow=cs164Grow.st;
    INSL.forEach(I=>{if(!I.fld)return;CAMPS.filter(C=>C.ig===I.g).forEach(C=>{if(!C.g)buildCamp(C)});
      delete LNR[I.g];const Rc=lnReach(I.g);
      CAMPS.filter(C=>C.ig===I.g).forEach(C=>{const o=C.site||{},st=CS164.st[C.key]||{},s2=cs164Stats(C);
        let n=0,ok=0;for(let y=Math.floor(C.z-C.r);y<=C.z+C.r;y++)for(let x=Math.floor(C.x-C.r);x<=C.x+C.r;x++){if(Math.hypot(x-C.x,y-C.z)>C.r-1)continue;const t=MAP[y]&&MAP[y][x];if(!t||t=='~'||solid(x,y))continue;n++;if(lnReachable(I.g,x,y))ok++}
        const ch=camp148Spot(C),slots=[];try{ROST.r=-2;rosterBuild(I.g);ROST.slots.forEach(s=>{if(s.camp===C)slots.push([s.x,s.z])})}catch(e){R.err.push('roster '+e)}
        R.camps.push({k:C.key,n:C.th&&C.th.n,r0:C.r0,r:C.r,rd:o.rd,rc:+(C.rc||0).toFixed(1),rf:+(C.rf||0).toFixed(1),moved:!!o.moved,fort:o.fk,gates:(o.gates||[]).length,trail:o.trail?o.trail.length:0,
          dc:s2.dc,tri:s2.tri,ms:st.ms,boxes:(C.boxes||[]).length,lights:CS164.lights.filter(q=>q.C===C).length,
          reach:n?+(ok/n).toFixed(3):0,walk:n,chest:lnReachable(I.g,ch[0],ch[1]),slotsBad:slots.filter(q=>solid(q[0],q[1])||!lnReachable(I.g,q[0],q[1])).length,slots:slots.length,sp:C.sp})})});
    // the hatch camp, minimum gaps between camps, distance to the gateway / entrance
    try{R.hatch=mq144Camp()&&mq144Camp().key;R.hatchN=mq144Camp().th.n}catch(e){R.hatch='err '+e}
    R.gaps=INSL.filter(I=>I.fld).map(I=>{const L=CAMPS.filter(C=>C.ig===I.g);let m=1e9;L.forEach(a=>L.forEach(b=>{if(a!==b)m=Math.min(m,Math.hypot(a.x-b.x,a.z-b.z)-a.r-b.r)}));
      const ga=Math.min(...L.map(C=>Math.hypot(C.x-I.ba[0],C.z-I.ba[1])-C.r)),en=Math.min(...L.map(C=>Math.hypot(C.x-I.en[0],C.z-I.en[1])-C.r)),ed=Math.min(...L.map(C=>Math.min(C.x-I.x0,I.x0+I.w-C.x,C.z-I.y0,I.y0+I.h-C.z)-C.r));
      return [I.g,Math.round(m),Math.round(ga),Math.round(en),Math.round(ed)]});
    R.pre=CAMPS_PRE(0).map(q=>q.join(','));R.lightsTotal=CS164.lights.length;R.mats=CS164.M.size;
  }catch(e){R.err.push('FATAL '+(e.stack||e))}
  console.warn=w0;return R})()
