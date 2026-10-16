// ================= v33: companions join your fights and follow loosely =================
let hAgro=null;
function heroHit(e,raw,mt,o){if(e&&!e.dead)hAgro={e,t:performance.now()};return heroHit_base(e,raw,mt,o)}
// what the team should be fighting: your target, whatever you just hit, or anything attacking you
function teamFoe(){
  if(townAt(pl.position.x,pl.position.z,0)>=0||inRealm)return null;
  const now=performance.now(),ok=e=>e&&!e.dead&&d2(e.m.position,pl.position)<16;
  if(AF){const b=bossEnt(AF.i);if(ok(b))return b}
  if(ok(tgt)&&(tgt.agg||(hAgro&&hAgro.e===tgt&&now-hAgro.t<8000)))return tgt;
  if(hAgro&&now-hAgro.t<6000&&ok(hAgro.e))return hAgro.e;
  let best=null,bd=9;enemies.forEach(e=>{if(e.dead||!e.agg)return;const d=d2(e.m.position,pl.position);if(d<bd){bd=d;best=e}});return best;
}
function compMove(f,dx,dz){if(!dx&&!dz)return;const p=f.position,ox=p.x,oz=p.z;walk(f,dx,dz);const m=Math.hypot(p.x-ox,p.z-oz),w=Math.hypot(dx,dz);if(m<w*.5&&!tcHit(ox+dx,oz+dz)){p.x=ox+dx*.8;p.z=oz+dz*.8}}
function compTick(dt,now){
  const foe=teamFoe();
  fols.forEach((f,i)=>{
    const c=party[i];if(!f||!c)return;
    f.visible=c.h>0&&!c.emp;f.position.y=inRealm?rGY(f.position.x,f.position.z):GH(f.position.x,f.position.z);
    f.vel=f.vel||V();f.idleT=f.idleT||0;
    const P=pl.position,dpl=d2(f.position,P);
    if(dpl>28){f.position.set(P.x-Math.sin(pl.rotation.y)*2+(i?-1:1),0,P.z-Math.cos(pl.rotation.y)*2);f.vel.set(0,0,0)}
    f.cdA=(f.cdA||0)-dt;
    if(!f.visible||dt<=0){animC(f,now,false);return}
    const spdK=FAMD[famOf(c.g[0])].spd*((c.mods||[]).includes('Swift')?1.18:1);
    let goal=null,want=0,face=null;
    if(foe&&!c.emp){
      const fp=foe.m.position,reach=1.5+(foe.boss?2.2:foe.c.al?.6:0),dv=V(fp.x-f.position.x,0,fp.z-f.position.z),L=dv.length();
      // spread out around the foe instead of stacking on the hero
      const ang=Math.atan2(f.position.x-fp.x,f.position.z-fp.z)+(i?.5:-.5)*dt,slot=V(fp.x+Math.sin(ang)*reach*.9,0,fp.z+Math.cos(ang)*reach*.9);
      face=dv;
      if(L>reach){goal=slot;want=Math.min(7,3.2+L)*spdK}
      else if(!f.lk&&f.cdA<=0){f.cdA=1.15/spdK;f.lk=1;f.rotation.y=Math.atan2(dv.x,dv.z);lunge(f,fp,()=>{f.lk=0;if(!foe.dead)compHit(c,foe,1)})}
    }else{
      // loose follow: hang back at a comfortable spot and only move when the hero drifts away
      const fy=pl.rotation.y,sd=i?-1:1,home=V(P.x-Math.sin(fy)*2.2+Math.cos(fy)*1.6*sd,0,P.z-Math.cos(fy)*2.2-Math.sin(fy)*1.6*sd),dh=d2(f.position,home);
      if(f.fol){if(dh<1.1)f.fol=0}else if(dh>3.4||dpl>4.6)f.fol=1;
      if(f.fol){goal=home;want=Math.min(12,1.2+dh*1.9)*(riding?1.6:1)}
      else{f.idleT-=dt;if(f.idleT<=0){f.idleT=2.5+Math.random()*4;f.look=Math.random()<.5?null:fy+(Math.random()-.5)*2.4;f.sniff=Math.random()<.3?V(f.position.x+(Math.random()-.5)*2.4,0,f.position.z+(Math.random()-.5)*2.4):null}
        if(f.sniff&&d2(f.sniff,P)<4.5){goal=f.sniff;want=1.1;if(d2(f.position,f.sniff)<.3)f.sniff=null}}
    }
    // smooth acceleration toward the wanted velocity
    const tv=V();if(goal){const g=V(goal.x-f.position.x,0,goal.z-f.position.z),gl=g.length();if(gl>.15)tv.copy(g).multiplyScalar(Math.min(want,gl*4)/gl)}
    if(f.lk)tv.set(0,0,0);
    f.vel.lerp(tv,Math.min(1,dt*(tv.lengthSq()>f.vel.lengthSq()?5:7)));
    const sp=f.vel.length();if(sp>.05)compMove(f,f.vel.x*dt,f.vel.z*dt);
    let ty=null;if(face&&(f.lk||sp<1.5))ty=Math.atan2(face.x,face.z);else if(sp>.3)ty=Math.atan2(f.vel.x,f.vel.z);else if(f.look!=null)ty=f.look;
    if(ty!=null&&!f.lk){let da=ty-f.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));f.rotation.y+=da*Math.min(1,dt*(sp>.3?8:2.5))}
    animC(f,now,sp>.25,sp);
  });
}
