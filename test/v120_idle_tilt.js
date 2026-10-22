// v120: wandering enemies standing idle must not pitch their whole body (the old v42 "sniff" tilted the whole model ~18° forward
// with a fast wobble, worst on humanoids). python3 probe.py v120_idle_tilt.js → per model: largest whole-body pitch over 30 idle s.
(()=>{const out={},MR=Math.random;let hum=null,cr=null;
  for(const k of Object.keys(EN)){if(hum&&cr)break;let e;try{e=spawnEnemy(k,pl.position.x+6,pl.position.z+6,1,{})}catch(_){continue}
    if(!e||!e.m||!e.m.b)continue;if(e.m.isHum&&!hum)hum=e;else if(!e.m.isHum&&!cr)cr=e}
  for(const [nm,e] of [['hum',hum],['cr',cr]]){if(!e){out[nm]='none';continue}
    const m=e.m;e.agg=0;e.atk=null;e.idle=1;e.wt=1e9;e.lt=0;let mx=0,mn=0,now=1e5;
    try{for(let i=0;i<1800;i++){now+=16.7;Math.random=()=>.1;enemyWander(e,m,1/60,now);Math.random=MR;animC(m,now,false,0);
      const x=m.b.rotation.x;if(x>mx)mx=x;if(x<mn)mn=x}}finally{Math.random=MR}
    out[nm]={maxPitch:+mx.toFixed(3),minPitch:+mn.toFixed(3)}}
  return out})()
