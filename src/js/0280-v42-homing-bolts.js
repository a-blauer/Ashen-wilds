// ================= v42 =================
// ---------- homing magic bolts ----------
function homeShot(sh,dt){
  sh.age=(sh.age||0)+dt;let e=sh.htg;
  if(!e||e.dead||!enemies.includes(e)){e=null;
    if(tgt&&!tgt.dead&&enemies.includes(tgt)&&d2(tgt.m.position,sh.m.position)<18)e=tgt;
    else{const sp=sh.v.length()||1;let bd=1e9;enemies.forEach(q=>{if(q.dead||sh.hit.has(q))return;const dx=q.m.position.x-sh.m.position.x,dz=q.m.position.z-sh.m.position.z,L=Math.hypot(dx,dz);if(L>14)return;const c=(dx*sh.v.x+dz*sh.v.z)/(L*sp||1);if(c<.35)return;const sc=L*(1.6-c);if(sc<bd){bd=sc;e=q}})}
    sh.htg=e}
  if(!e)return;
  const sp=sh.v.length(),dx=e.m.position.x-sh.m.position.x,dz=e.m.position.z-sh.m.position.z,L=Math.hypot(dx,dz)||1;
  const k=Math.min(1,dt*(7+8*Math.max(0,1-L/6)));sh.v.x+=(dx/L*sp-sh.v.x)*k;sh.v.z+=(dz/L*sp-sh.v.z)*k;sh.v.setLength(sp);
  if(sh.age<1.6)sh.t=Math.max(sh.t,.15);
  sh.m.lookAt(sh.m.position.clone().add(sh.v));
}
// ---------- calmer roaming with idle animations ----------
function enemyWander(e,m,dt,now){
  if(e.hx==null){e.hx=m.position.x;e.hz=m.position.z}
  e.wt-=dt;
  if(e.wt<=0){
    if(!e.idle){e.idle=1;e.wt=R(5,11);e.look=m.rotation.y;e.lt=R(.5,1.5)}
    else{e.idle=0;e.wt=R(3,5);const a=Math.random()*6.283,r=R(.8,3);e.wx=e.hx+Math.cos(a)*r;e.wz=e.hz+Math.sin(a)*r}
  }
  if(!e.idle){
    const wx=e.wx-m.position.x,wz=e.wz-m.position.z,wl=Math.hypot(wx,wz);
    if(e.ip){m.pose=null;e.ip=0}
    if(wl>.35)return [wx/wl,wz/wl,.65];e.wt=0;return [0,0,0];
  }
  // idle: look around now and then with a slow body sway.
  // v120: the old whole-body gestures are gone — the "sniff" pitched the entire model ~18° forward from the feet with a fast
  // shake (a stiff plank-like tilt, worst on humanoids) and the others twisted/lifted it. The v93 idle layer (1280/1290) gives
  // every humanoid and creature its own sniffs, glances and fidgets on the bones.
  e.lt-=dt;if(e.lt<=0){e.lt=R(1.8,4);e.look=m.rotation.y+R(-1.3,1.3)}
  let dr=((e.look-m.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;m.rotation.y+=dr*Math.min(1,dt*1.6);
  if(!e.atk){m.pose={rx:0,ry:Math.sin(now/1300+e.hx)*.12,y:0};e.ip=1}
  return [0,0,0];
}
// ---------- minimap facing arrow ----------
function miniArrow(qx,qy){
  const a=pl.rotation.y,fx=Math.sin(a),fz=Math.cos(a),ca=camYaw,vx=-Math.sin(ca),vz=-Math.cos(ca);
  // camera view cone
  mmX.save();mmX.fillStyle='rgba(255,255,255,.13)';mmX.beginPath();mmX.moveTo(qx,qy);const sp=.55,R2=26,base=Math.atan2(vz,vx);mmX.arc(qx,qy,R2,base-sp,base+sp);mmX.closePath();mmX.fill();
  // facing arrow
  mmX.translate(qx,qy);mmX.rotate(Math.atan2(fz,fx));mmX.fillStyle='#4ade80';mmX.strokeStyle='#0b1a10';mmX.lineWidth=1.5;
  mmX.beginPath();mmX.moveTo(8,0);mmX.lineTo(-5,-5);mmX.lineTo(-2.5,0);mmX.lineTo(-5,5);mmX.closePath();mmX.stroke();mmX.fill();mmX.restore();
}
