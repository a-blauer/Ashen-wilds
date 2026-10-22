// v121: melee basic attacks only step into hitting range (python3 probe.py v121_step.js)
(async()=>{
  POST.render=()=>{};ren.render=()=>{};requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16);
  const R={},wait=ms=>new Promise(r=>setTimeout(r,ms));
  const key=Object.keys(EN).find(k=>EN[k].rig&&!k.startsWith('boss'));
  const C=CLS[hero.cls],w=eq.weapon&&canUse(eq.weapon)?eq.weapon:null,wt=w?itT(w).wt:null;
  const hh=heroHit;heroHit=function(e){if(e&&e._v121)return;return hh.apply(this,arguments)};
  R.cls=hero.cls;R.wt=wt;R.rng=C.rng;
  async function trial(gap,n,withEnemy){
    enemies.slice().forEach(e=>{try{removeE(e)}catch(_){}});
    pl.rotation.y=0;const x0=pl.position.x,z0=pl.position.z;
    let e=null;
    if(withEnemy){e=spawnEnemy(key,x0,z0+gap,5,{});e._v121=1;tgt=e}else tgt=null;
    const hold=()=>{if(e){e.m.position.x=x0;e.m.position.z=z0+gap;e.c.h=M(e.c);e.dead=false;if(!enemies.includes(e))enemies.push(e)}};
    const iv=setInterval(hold,5);
    const out=[];
    for(let i=0;i<n;i++){
      for(let k=0;k<200&&atkCd>0;k++)await wait(20);
      comboT=performance.now();swing();
      for(let k=0;k<80&&(HA.cur||pl.step);k++)await wait(20);
      await wait(60);
      out.push(+(pl.position.z-z0).toFixed(2)+(e&&!enemies.includes(e)?'(gone)':''));
    }
    clearInterval(iv);
    const res={moved:out,dist:e?+d2(pl.position,e.m.position).toFixed(2):null};
    if(e)try{removeE(e)}catch(_){}
    pl.position.x=x0;pl.position.z=z0;return res}
  try{R.inRange=await trial(1.4,4,1)}catch(e){R.inRange='threw '+e.message}
  try{R.touching=await trial(.7,3,1)}catch(e){R.touching='threw '+e.message}
  try{R.outOfRange=await trial(3.6,5,1)}catch(e){R.outOfRange='threw '+e.message}
  try{R.air=await trial(0,3,0)}catch(e){R.air='threw '+e.message}
  heroHit=hh;return R})()
