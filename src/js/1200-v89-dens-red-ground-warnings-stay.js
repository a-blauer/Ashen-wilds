// ================= v89 dens: red ground warnings that stay visible for the whole wind-up =================
// Why warnings flickered or vanished:
//  1. The low-poly style pass (zzG_0style.js) swaps every Ring/Circle geometry with many segments for a fresh low-segment
//     copy ~0.1 s after it is added. tele() writes its rings straight into world space (draped over the terrain) and the
//     den warnings (dqWarn) use rings/discs that were rotated flat — the fresh copies sit at the world origin or stand up
//     on edge, so a circle warning showed for a split second and then disappeared. (Lines were plane geometry: unaffected.)
//     → lpsGeo now keeps a geometry whose shape no longer matches its parameters (moved/rotated/draped), and every
//       warning mesh opts out of the style pass.
//  2. Warnings used fog, so in thick fog (Kindlelight, Lights Out, Whiteout, Sandstorm) they faded to nothing. → fog off.
//  3. tele() ran on the real clock while the hit it announces runs on game time (den timers use dt, which is capped at
//     0.05 s per frame and slowed during hit-stop): on a slow frame rate the warning ended well before the hit. → tele()
//     and kqTimed() (meteors/globs that land on the warning) now advance with the game's dt, paused while menus are open.
//  4. Very faint: area 14%, edge 55% after the 35% dim. → a crisp edge (90%) that pulses in the last quarter, area/fill a
//     little stronger (still dimmed by KQ.dim).
// DTL.live lists the warnings on screen (used by test/v89_dens.py).
var DTL={live:[],n:0,log:[]};
function dtlLog(W,early){DTL.log.push({id:W.id,T:+W.T.toFixed(3),t:+W.t.toFixed(3),early:!!early,dq:!!W.dq});if(DTL.log.length>600)DTL.log.shift()}
// ---- 1. the style pass leaves transformed geometry alone ----
function lpsGeo(g){
  if(!g||g.userData&&g.userData.lps)return null;
  if(LPS.gc.has(g))return LPS.gc.get(g);
  const p=g.parameters,t=g.type;let r=null;
  try{
    if(p){
      if(t=='SphereGeometry'&&(p.widthSegments>8||p.heightSegments>6))r=new THREE.SphereGeometry(p.radius,Math.min(8,p.widthSegments),Math.min(6,p.heightSegments),p.phiStart,p.phiLength,p.thetaStart,p.thetaLength);
      else if(t=='CylinderGeometry'&&(p.radialSegments>8||p.heightSegments>1))r=new THREE.CylinderGeometry(p.radiusTop,p.radiusBottom,p.height,Math.min(8,p.radialSegments),1,p.openEnded,p.thetaStart,p.thetaLength);
      else if(t=='ConeGeometry'&&(p.radialSegments>8||p.heightSegments>1))r=new THREE.ConeGeometry(p.radius,p.height,Math.min(8,p.radialSegments),1,p.openEnded,p.thetaStart,p.thetaLength);
      else if(t=='TorusGeometry'&&(p.tubularSegments>12||p.radialSegments>4))r=new THREE.TorusGeometry(p.radius,p.tube,Math.min(4,p.radialSegments),Math.min(12,p.tubularSegments),p.arc);
      else if(t=='CircleGeometry'&&p.segments>10)r=new THREE.CircleGeometry(p.radius,10,p.thetaStart,p.thetaLength);
      else if(t=='RingGeometry'&&p.thetaSegments>12)r=new THREE.RingGeometry(p.innerRadius,p.outerRadius,12,1,p.thetaStart,p.thetaLength);
      else if(t=='LatheGeometry'&&p.segments>8)r=new THREE.LatheGeometry(p.points,8,p.phiStart,p.phiLength);
      else if((t=='IcosahedronGeometry'||t=='OctahedronGeometry'||t=='DodecahedronGeometry')&&p.detail>1)r=new THREE[t](p.radius,1);
    }
  }catch(e){r=null}
  if(r){r.userData.lps=1;if(g.attributes.color&&!r.attributes.color)r=null}
  // the copy must occupy the same box as the original; if the original was rotated, moved or rewritten, keep it
  if(r){try{g.computeBoundingBox();r.computeBoundingBox();const a=g.boundingBox,b=r.boundingBox,s=Math.max(.05,a.getSize(new THREE.Vector3()).length());
    if(a.min.distanceTo(b.min)>.2*s+.02||a.max.distanceTo(b.max)>.2*s+.02){r.dispose();r=null}}catch(e){r=null}}
  LPS.gc.set(g,r);return r}
// ---- 2-4. the warning itself ----
function teleMat(c,op){const m=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,depthWrite:false,depthTest:false,side:THREE.DoubleSide,fog:false});m.userData.lps=1;m.userData.lpsSkip=1;return m}
function teleMesh(g,m,ro){g.userData.lps=1;const o=new THREE.Mesh(g,m);o.renderOrder=ro;o.frustumCulled=false;o.userData.lpsSkip=1;return o}
function tele(pos,r,delay,fn,line){
  const D=(typeof KQ!='undefined'&&KQ.dim)||1,T=Math.max(.05,+delay||0);
  const geo=()=>line?new THREE.PlaneGeometry(line.w,line.l,3,Math.max(4,Math.round(line.l))):new THREE.RingGeometry(.001,1,Math.max(24,Math.round(r*10)),Math.max(3,Math.round(r*1.5)));
  const go=geo(),gf=geo(),base=go.attributes.position.array.slice(),ox=pos.x,oz=pos.z;
  let ca=1,sa=0;if(line){const a=Math.atan2(-line.d.x,-line.d.z);ca=Math.cos(a);sa=Math.sin(a)}
  // local (u,v) on the plane -> world x,z ; circles scale by radius, lines grow from the caster by k
  const drape=(g,k)=>{const P=g.attributes.position;for(let i=0;i<P.count;i++){const u=base[i*3],v=base[i*3+1];
      if(line){const lz=(-(v)-line.l/2)*k;const wx=ox+u*ca+lz*sa,wz=oz-u*sa+lz*ca;P.setXYZ(i,wx,GH(wx,wz)+.14,wz)}
      else{const wx=ox+u*r*k,wz=oz-v*r*k;P.setXYZ(i,wx,GH(wx,wz)+.14,wz)}}P.needsUpdate=true;g.computeBoundingSphere()};
  drape(go,1);drape(gf,.15);
  const mo=teleMat(0xd01808,(line?.34:.3)*D),mf=teleMat(0xff3010,.16*D),o=teleMesh(go,mo,20),f=teleMesh(gf,mf,20);
  let edge=null,me=null;
  if(!line){me=teleMat(0xff2a10,.9);const eg=new THREE.RingGeometry(.93,1,Math.max(24,Math.round(r*10)),1),P=eg.attributes.position,b2=P.array.slice();
    for(let i=0;i<P.count;i++){const wx=ox+b2[i*3]*r,wz=oz-b2[i*3+1]*r;P.setXYZ(i,wx,GH(wx,wz)+.15,wz)}eg.computeBoundingSphere();edge=teleMesh(eg,me,21)}
  scene.add(o,f);if(edge)scene.add(edge);
  const W={o,f,edge,r,line:!!line,T,t:0,pos:{x:ox,z:oz},id:++DTL.n,g0:go,e0:edge&&edge.geometry};DTL.live.push(W);
  let last=-1,done=false;
  const end=()=>{if(done)return;done=true;scene.remove(o,f);if(edge)scene.remove(edge);go.dispose();gf.dispose();mo.dispose();mf.dispose();if(edge){edge.geometry.dispose();me.dispose()}
    const j=DTL.live.indexOf(W);if(j>=0)DTL.live.splice(j,1);dtlLog(W,W.t<W.T-1e-6)};
  const step=dt=>{W.t+=dt;const k=Math.min(1,W.t/T);
    mf.opacity=(.16+(line?.4:.34)*k)*D;const q=Math.round((.15+.85*k)*20)/20;if(q!==last){last=q;drape(gf,q)}
    if(me)me.opacity=k<.75?.9:.75+.25*Math.abs(Math.sin(W.t*18));
    if(k>=1){end();try{fn&&fn()}catch(err){console.error('tele',err)}return false}return true};
  if(typeof kqFx=='function')kqFx({tick(dt){if(done)return false;return step(dt||0)},end});
  else tw(T*1000,k=>step(Math.max(0,k*T-W.t)),()=>{if(!done)step(T)});
}
// meteors, globs and lances that land on a warning use the same (game) clock as the warning
function kqTimed(dur,step,end,alive){let t=0;const T=Math.max(.01,dur);kqFx({tick(dt){t+=dt||0;const k=t/T;if(alive&&!alive()){end&&end(true);return false}if(k>=1){end&&end(false);return false}step(k);return true}})}
// den warnings (circles, lines, cones) from the dq toolkit: same look, no fog, never restyled
function dqWarn(S,o){
  const D=(typeof KQ!='undefined'&&KQ.dim)||1;
  const g=new THREE.Group(),y=(o.y!=null?o.y:GH(o.x,o.z))+.15;g.position.set(o.x,y,o.z);const mO=teleMat(o.col||0xd01808,.3*D),mF=teleMat(o.fc||0xff3010,.16*D),mats=[mO,mF];let fill,mE=null;
  if(o.d){g.rotation.y=Math.atan2(o.d.x,o.d.z);const a=new THREE.Mesh(dqG('line'),mO);a.scale.set(o.w,1,o.l);fill=new THREE.Mesh(dqG('line'),mF);fill.scale.set(o.w,1,.01);g.add(a,fill);fill.userData.ln=1}
  else if(o.half){g.rotation.y=o.a;const a=new THREE.Mesh(dqFan(o.half),mO);a.scale.setScalar(o.l);fill=new THREE.Mesh(dqFan(o.half),mF);fill.scale.setScalar(.01);g.add(a,fill)}
  else{const a=new THREE.Mesh(dqG('disc'),mO);a.scale.setScalar(o.r);fill=new THREE.Mesh(dqG('disc'),mF);fill.scale.setScalar(.01);mE=teleMat(o.col||0xff2a10,.9);mats.push(mE);const ed=new THREE.Mesh(dqG('edge'),mE);ed.scale.setScalar(o.r);ed.renderOrder=21;g.add(a,fill,ed)}
  g.children.forEach(c=>{if(!c.renderOrder)c.renderOrder=20;c.frustumCulled=false;c.userData.lpsSkip=1;if(c.geometry)c.geometry.userData.lps=1});scene.add(g);
  const w={t:0,dead:false,g,o,kill(){if(w.dead)return;w.dead=true;scene.remove(g);mats.forEach(m=>m.dispose());const j=DTL.live.indexOf(W);if(j>=0)DTL.live.splice(j,1);dtlLog(W,w.t<o.t-1e-6)}};
  const W={g,o:g.children[0],f:fill,edge:mE?g.children[2]:null,r:o.r||0,line:!!(o.d||o.half),T:o.t,get t(){return w.t},pos:{x:o.x,z:o.z},id:++DTL.n,dq:1,g0:g.children[0].geometry,e0:mE?g.children[2].geometry:null};DTL.live.push(W);
  S.fx.push({tick(dt){if(w.dead)return false;w.t+=dt;const k=Math.min(1,w.t/o.t);mF.opacity=(.16+.34*k)*D;if(mE)mE.opacity=k<.75?.9:.75+.25*Math.abs(Math.sin(w.t*18));
      if(fill.userData.ln)fill.scale.z=Math.max(.01,o.l*k);else fill.scale.setScalar(Math.max(.01,(o.half?o.l:o.r)*k));
      if(o.follow)o.follow(g);if(k>=1){w.kill();if(o.fn)o.fn();return false}return true},end(){w.kill()}});
  return w}
// the shared den glow material (gaze cones, beams, neck rings) ignores fog too, so Lights Out never hides a gaze
function d01Add(col,op,ro){const m=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide,fog:false});m.userData.lps=1;return m}
// the dq toolkit's unit shapes are rotated flat: never swap them for unrotated low-poly copies
try{['disc','edge','line'].forEach(k=>{const g=dqG(k);g.userData.lps=1;LPS.gc.set(g,null)})}catch(_){}

