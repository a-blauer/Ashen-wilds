// v120 tail: run then stop, 10 minutes after load. The old tail (sin(now×speed)) whipped through many swings in a fraction of a
// second when the speed dropped; the spring tail must change smoothly. python3 probe.py v120_tail.js
// per race: biggest frame-to-frame change of any tail bone (rad) while stopping (old formula vs now), the tip's height change
// (running minus standing, + = lifted), and turnLag: how far the tip drags behind during a turn (should be > 0)
(()=>{const out={},H=pl,b=H.bones,cls0=hero.cls;
  const old=(D,t,w,i,n)=>{const ts=D.tailSway||[.06,.1,1.6,3.2],amp=ts[0]+ts[1]*w,sp=ts[2]+ts[3]*w;return amp*Math.sin(t*sp-i*.55)*(.4+i*.12*(11/Math.max(n,1)))};
  for(const id of Object.keys(BRD)){const D=BRD[id];if(!D.TB||!D.TB.length){out[id]='no tail';continue}
    brRig(H,+id);H._brT=null;const n=D.TB.length,tipB=b[D.TB[n-1]],P=new THREE.Vector3();
    // the tail's end: the last tail ring, offset from the last tail bone (v133: the raven's one bone is its whole fan, so the bone's own origin never moves)
    const TP=D.TP,lr=TP[TP.length-1],lb=TP[n-1],off=new THREE.Vector3(lr[0]-lb[0],lr[1]-lb[1],lr[2]-lb[2]),tip={getWorldPosition:v=>{tipB.updateMatrixWorld(true);return v.copy(off).applyMatrix4(tipB.matrixWorld)}};
    let now=6e5,mxNew=0,mxOld=0,prev=null,prevO=null,y0=0;H.rotation.y=0;
    const step=(w,ry)=>{now+=16.7;if(ry!=null)H.rotation.y=ry;brTailAnim(H,D,b,now,w);
      const cur=D.TB.map(k=>b[k].rotation.y);return cur};
    for(let i=0;i<120;i++)step(1);                          // run 2 s
    H.updateMatrixWorld(true);tip.getWorldPosition(P);const yRun=P.y;
    for(let i=0;i<90;i++){const w=Math.max(0,1-i/18);        // stop over 0.3 s, then stand 1.2 s
      const c=step(w),o=D.TB.map((k,j)=>old(D,now/1000,w,j,n));
      if(prev)for(let j=0;j<n;j++){mxNew=Math.max(mxNew,Math.abs(c[j]-prev[j]));mxOld=Math.max(mxOld,Math.abs(o[j]-prevO[j]))}prev=c;prevO=o}
    for(let i=0;i<240;i++)step(0);H.updateMatrixWorld(true);tip.getWorldPosition(P);const yStand=P.y;
    // turn (yaw increasing = heading toward +x) at 3 rad/s for 0.4 s while standing: a dragging tail shows up at +x in the model's frame
    const base=tip.getWorldPosition(new THREE.Vector3()).clone();H.worldToLocal(base);let sw=0,sx=0;
    for(let i=0;i<24;i++){step(0,H.rotation.y+3*.0167);H.updateMatrixWorld(true);const q=tip.getWorldPosition(new THREE.Vector3());H.worldToLocal(q);sw=Math.min(sw,q.x-base.x);sx=Math.max(sx,q.x-base.x)}
    H.rotation.y=0;
    out[id]={n,stopMaxStep:{old:+mxOld.toFixed(3),now:+mxNew.toFixed(3)},tipLift:+(yRun-yStand).toFixed(3),turnLag:+sx.toFixed(3)}}
  brRig(H,BR_CLS[cls0]||1);H._brT=null;return out})()
