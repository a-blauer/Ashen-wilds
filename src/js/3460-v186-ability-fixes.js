// ================= v186 round 2: the owner's ability review (Nov 1 2026) =================
// Owner: "Execute and headsman verdict just looks like a box falling from the sky", "During penance, the character un-kneels
// between beams", "During all charge spells/abilities … they kind of just drift forward", "Rain of arrows should have visible
// arrows raining down in the aoe", "Multishot and barrage are basically the same spell", "the spell casts while hes still drawing
// the arrow back", "The endless hunt has old ghost wolf models mixed in", "Blizzard needs better particle effects in the aoe",
// "meteor needs an actual meteor visible when it drops", "Disintegrate … he just kind of waves his arms around", "singularity
// looks too similar to the assassin ability eclipse".
// How it works (read this before changing it; the method is 3450's, read its header first):
// - Every new effect (sgHeadsman, sgArrowRain, sgBlizzard, sgMeteor, sgSingularity, sgDisBeam, sgBallista, sgBoltHit, sgHawkFly)
//   only draws, takes plain arguments and is relayed to co-op partners (sg2Reg: the MPV.FX pattern of 3450). lvl 1 = evolved: the
//   same effect, denser, bigger, brighter, the class's second colour. Each one frees its own materials and own geometry.
// - Timed poses (sg2Act): a pose that is a function of elapsed milliseconds, so it can hold for a whole channel (Penance,
//   Disintegrate) or a whole dash, and end when the move really ends (sg2Cut blends it out from wherever it is).
// - Charges (Bull Rush, Crusader's Charge, Shadow Rush): a real sprint while hero.dash runs (sg2Run: a coil, legs driving in a
//   run cycle, hips and shoulders counter-twisting, arms by style), then a planted follow-through when the dash ends. Phantom
//   Strike lands crouched and flares both blades; Thousand Cuts lunges on each flicker; Disengage vaults back; Leap Slam and
//   Titan's Fall play their leap over the whole flight; the Hawk Dive hawk climbs, then stoops on the prey.
// - Bow abilities fire on the release frame of the draw (Multishot: launches held until bowAnim's 53%; Rapid Fire each draw;
//   Aimed Shot's draw is as long as its 0.9 s channel). Ballista Bolt (was Barrage) replaces the second arrow fan.
// - Damage, ranges and timings are unchanged, except the redesigned Ballista Bolt (numbers below, balance tables renamed).
var SG2={BSPD:42,cuts:0,cn:0};
function sg2Rnd(s){let x=s|0||1;return ()=>{x=(x*1103515245+12345)&0x7fffffff;return x/0x7fffffff}}
// relay to co-op partners exactly like 3450 (a function replaced here keeps its MPV.FX index)
function sg2Reg(names){if(typeof MPV=='undefined'||!MPV.FX||typeof MPV_FX=='undefined')return;names.forEach(n=>{const f=window[n];if(typeof f!='function')return;
  if(MPV_FX[n]==null){MPV_FX[n]=MPV.FX.length;MPV.FX.push(n)}
  window[n]=function(){if(!MPV.cap||MPV.dep||MPV.rep||!mpvLive())return f.apply(this,arguments);
    let a=null;try{a=Array.prototype.map.call(arguments,x=>mpvSer(x,0))}catch(_){a=null}
    if(a)mpvPush(['V',MPV_FX[n],mpvR(pl.position.x),mpvR(pl.position.y),mpvR(pl.position.z),mpvR(pl.rotation.y),a]);
    MPV.dep++;try{return f.apply(this,arguments)}finally{MPV.dep--}}})}
// merge [geometry, colour] pairs into one non-indexed geometry with vertex colours (the source geometries are freed)
function sg2Merge(list){let n=0;const G=list.map(([g,c])=>{const q=g.index?g.toNonIndexed():g;if(q!==g)g.dispose();if(!q.attributes.normal)q.computeVertexNormals();n+=q.attributes.position.count;return [q,c]});
  const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3),cc=new THREE.Color();let o=0;
  G.forEach(([q,c])=>{const k=q.attributes.position.count;P.set(q.attributes.position.array,o*3);N.set(q.attributes.normal.array,o*3);cc.setHex(c);for(let i=0;i<k;i++){C[(o+i)*3]=cc.r;C[(o+i)*3+1]=cc.g;C[(o+i)*3+2]=cc.b}o+=k;q.dispose()});
  const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.BufferAttribute(P,3));out.setAttribute('normal',new THREE.BufferAttribute(N,3));out.setAttribute('color',new THREE.BufferAttribute(C,3));out.userData.lps=1;return out}
// a replaced ability handler keeps the evolved extras (2700 wraps every KQH handler at load: pre, run, post)
function sg2Ev(f){return function(c){const sk=c&&c.sk,E=sk&&sk.ev137&&typeof ev137Def=='function'&&ev137Def(sk);if(!E)return f.apply(this,arguments);
  if(E.pre)try{E.pre(c)}catch(err){console.error(err)}const r=E.run?E.run(c,f):f.apply(this,arguments);if(r!==false&&E.post&&!E.run)try{E.post(c)}catch(err){console.error('evolved '+sk.n,err)}return r}}
// remove an effect: sgRm, plus the instance buffers of instanced meshes
function sg2Rm(o){if(!o)return;o.traverse(q=>{if(q.isInstancedMesh&&q.dispose)try{q.dispose()}catch(_){}});sgRm(o)}
function sg2Std(o){const m=new THREE.MeshStandardMaterial(Object.assign({flatShading:true,roughness:.6,metalness:.2},o));return m}
// a per-frame driver on top of sgT: fn(k, dt seconds) (dt from k, so a pause never jumps)
function sg2T(ms,fn,done){let kp=0;sgT(ms,k=>{const dt=Math.max(0,(k-kp)*ms/1000);kp=k;fn(k,dt)},done)}
// a soft sprite (own material)
function sg2Spr(tex,col,op,ro){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:col,transparent:true,opacity:op==null?1:op,blending:THREE.AdditiveBlending,depthWrite:false}));s.userData.lpsSkip=1;s.renderOrder=ro||35;s.frustumCulled=false;return s}
// a ground decal draped on the terrain (own geometry and material, freed by sgRm)
function sg2Drape(p,R,tex,col,op,ro,lift,rot){const geo=new THREE.CircleGeometry(1,40);const m=kqsDrapeM(geo,sgMat(col,tex,op),ro||28);m.userData.sgOwnG=1;
  m.userData.dr=(a,r)=>{const c=Math.cos(a),s=Math.sin(a);kqsDrape(m,(u,v)=>[p.x+(u*c-v*s)*r,p.z-(u*s+v*c)*r],lift==null?.08:lift)};m.userData.dr(rot||0,R);return m}

// ---------------- textures ----------------
function sg2FrostTex(){return sgCv('sg2frost',256,256,(g,S)=>{const C=S/2,rnd=sg2Rnd(11);g.save();g.beginPath();g.arc(C,C,C*.97,0,6.283);g.clip();
  const r=g.createRadialGradient(C,C,0,C,C,C);r.addColorStop(0,'rgba(255,255,255,.42)');r.addColorStop(.7,'rgba(255,255,255,.3)');r.addColorStop(.9,'rgba(255,255,255,.62)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,S,S);
  g.strokeStyle='rgba(255,255,255,.9)';g.lineCap='round';const br=(x,y,a,L,w,d)=>{if(d>3||L<2)return;const x2=x+Math.cos(a)*L,y2=y+Math.sin(a)*L;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();
    [.4,.72].forEach(t=>{const px=x+(x2-x)*t,py=y+(y2-y)*t;br(px,py,a+.95,L*.42,w*.62,d+1);br(px,py,a-.95,L*.42,w*.62,d+1)})};
  for(let i=0;i<22;i++){const a=rnd()*6.283,d=C*(.08+rnd()*.82);br(C+Math.cos(a)*d,C+Math.sin(a)*d,rnd()*6.283,14+rnd()*24,1.8,0)}
  for(let i=0;i<40;i++){const a=rnd()*6.283,d=C*rnd()*.95,x=C+Math.cos(a)*d,y=C+Math.sin(a)*d,s=2+rnd()*3;g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.moveTo(x,y-s);g.lineTo(x+s*.5,y);g.lineTo(x,y+s);g.lineTo(x-s*.5,y);g.fill()}g.restore()})}
// the accretion disc: a hole, a white-hot inner edge, cyan → violet → magenta outward, spiral arms (coloured: the material stays white)
function sg2DiscTex(){return sgCv('sg2disc',256,256,(g,S)=>{const C=S/2;const r=g.createRadialGradient(C,C,C*.27,C,C,C);r.addColorStop(0,'rgba(255,255,255,0)');r.addColorStop(.02,'rgba(255,255,255,1)');r.addColorStop(.1,'rgba(170,245,255,.95)');
  r.addColorStop(.3,'rgba(110,140,255,.8)');r.addColorStop(.58,'rgba(180,80,255,.5)');r.addColorStop(.82,'rgba(255,70,210,.2)');r.addColorStop(1,'rgba(255,70,210,0)');g.fillStyle=r;g.fillRect(0,0,S,S);
  g.globalCompositeOperation='lighter';for(let k=0;k<6;k++){const a0=k/6*6.283;g.beginPath();for(let i=0;i<=64;i++){const t=i/64,rr=C*(.29+t*.66),a=a0+t*3.4;const x=C+Math.cos(a)*rr,y=C+Math.sin(a)*rr;i?g.lineTo(x,y):g.moveTo(x,y)}
    g.strokeStyle='rgba(255,255,255,'+(k%2?.22:.4)+')';g.lineWidth=k%2?3:6;g.stroke()}
  g.globalCompositeOperation='destination-out';g.beginPath();g.arc(C,C,C*.275,0,6.283);g.fill()})}
// a spiral swirl on the ground (white, tinted)
function sg2SpiralTex(){return sgCv('sg2spiral',256,256,(g,S)=>{const C=S/2;g.lineCap='round';for(let k=0;k<4;k++){const a0=k/4*6.283;for(let i=0;i<60;i++){const t=i/60,t2=(i+1)/60,ra=C*(.05+t*.92),rb=C*(.05+t2*.92),a=a0-t*4.2,b=a0-t2*4.2;
    g.strokeStyle='rgba(255,255,255,'+(.85*(1-t*.8))+')';g.lineWidth=2+7*(1-t);g.beginPath();g.moveTo(C+Math.cos(a)*ra,C+Math.sin(a)*ra);g.lineTo(C+Math.cos(b)*rb,C+Math.sin(b)*rb);g.stroke()}}
  const r=g.createRadialGradient(C,C,0,C,C,C);r.addColorStop(0,'rgba(255,255,255,.5)');r.addColorStop(.3,'rgba(255,255,255,.12)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,S,S)})}

// ======================= 1. Execute / Headsman's Verdict: a huge spectral executioner's axe =======================
// The axe: a long iron-banded haft and a bearded head (curved cutting edge, beard hook, back spike, a hole through the blade),
// extruded with a bevel; a blood-red edge strip. It swings from a pivot behind the hero (a giant unseen headsman) over the top
// and bites into the ground at the target, its swept edge leaving a blood-red slash; then it sinks and dissolves into red mist.
var SG2_AX={L:3.3,hy:3.0,eu:1.32,pi:112*Math.PI/180,p0:-38*Math.PI/180};
function sg2AxeGeo(){return sgG('sg2axe',()=>{
  const sh=new THREE.Shape();sh.moveTo(-.12,-.32);sh.lineTo(.16,-.32);sh.quadraticCurveTo(.36,-.52,.78,-1.08);sh.bezierCurveTo(1.25,-.7,1.38,.25,1.08,.78);sh.quadraticCurveTo(.6,.44,.16,.32);sh.lineTo(-.12,.32);
  sh.lineTo(-.12,.18);sh.lineTo(-.64,.02);sh.lineTo(-.12,-.14);sh.lineTo(-.12,-.32);const ho=new THREE.Path();ho.absarc(.5,.02,.13,0,6.283,true);sh.holes.push(ho);
  const head=new THREE.ExtrudeGeometry(sh,{depth:.07,bevelEnabled:true,bevelThickness:.035,bevelSize:.05,bevelSegments:1,curveSegments:10});head.translate(0,0,-.035);head.rotateY(-Math.PI/2);head.translate(0,SG2_AX.hy,0);
  const es=new THREE.Shape();es.moveTo(.8,-1.11);es.bezierCurveTo(1.29,-.71,1.43,.26,1.12,.82);es.lineTo(1.0,.71);es.bezierCurveTo(1.25,.22,1.13,-.6,.72,-.98);es.lineTo(.8,-1.11);
  const edge=new THREE.ExtrudeGeometry(es,{depth:.16,bevelEnabled:false,curveSegments:12});edge.translate(0,0,-.08);edge.rotateY(-Math.PI/2);edge.translate(0,SG2_AX.hy,0);
  const haft=new THREE.CylinderGeometry(.075,.09,SG2_AX.L,7);haft.translate(0,SG2_AX.L/2,0);
  const parts=[[haft,0x3a2418]];[.35,1.6,2.55,SG2_AX.L-.05].forEach((y,i)=>{const t=new THREE.CylinderGeometry(.11,.11,i==3?.16:.09,7);t.translate(0,y,0);parts.push([t,0x5a5258])});
  const pm=new THREE.ConeGeometry(.12,.32,6);pm.rotateX(Math.PI);pm.translate(0,-.14,0);parts.push([pm,0x5a5258]);
  return {head,edge,haft:sg2Merge(parts)}})}
function sgHeadsman(p,yaw,col,low,lvl,land){if(!p)return;lvl=lvl|0;land=Math.max(130,land||160);const A=SG2_AX,G=sg2AxeGeo(),s=1.05+lvl*.3,b=gY(p,0),c2=lvl?sgC2(col):sgLerp(col,0xffffff,.5);
  // where the pivot sits so the edge bites the ground at the target when the haft has swung to A.pi
  const cs=Math.cos(A.pi),sn=Math.sin(A.pi),ey=(A.hy*cs-A.eu*sn)*s,ez=(A.hy*sn+A.eu*cs)*s,fx=Math.sin(yaw),fz=Math.cos(yaw);
  const piv=new THREE.Group();piv.position.set(b.x-fx*ez,b.y-ey-.12*s,b.z-fz*ez);piv.rotation.y=yaw;scene.add(piv);
  const arm=new THREE.Group();arm.scale.setScalar(s);piv.add(arm);
  const iron=sg2Std({color:0x2e262a,metalness:.75,roughness:.38,emissive:0x3a0505,emissiveIntensity:.9,transparent:true,opacity:0,side:THREE.DoubleSide}),
    wood=sg2Std({vertexColors:true,roughness:.85,metalness:.15,emissive:0x1a0404,transparent:true,opacity:0}),
    em=sgMat(sgLerp(col,0xff0000,.35),null,0);
  const hd=sgMesh(G.head,iron,31),hf=sgMesh(G.haft,wood,31),ed=sgMesh(G.edge,em,33);arm.add(hf,hd,ed);
  const glow=sg2Spr(fx186Tex('soft'),col,0);glow.position.set(0,A.hy,1.05);glow.scale.setScalar(2.2);arm.add(glow);
  // the slash: a ribbon in the swing plane lit behind the edge as it sweeps (synced to the real swing, not eased on its own)
  const R1=Math.hypot(A.hy,A.eu+.08)*s,R0=R1*.66,a0=Math.PI/2-A.p0,a1=Math.PI/2-A.pi,n=40,rg=new THREE.RingGeometry(R0,R1,n,1,a1,a0-a1),N=rg.attributes.position.count,cl=new Float32Array(N*3);
  rg.setAttribute('color',new THREE.BufferAttribute(cl,3));const tm=sgMat(0xffffff,null,1);tm.vertexColors=true;const tr=sgMesh(rg,tm,34);tr.userData.sgOwnG=1;tr.rotation.y=-Math.PI/2;piv.add(tr);
  const cR=new THREE.Color(sgLerp(col,0xff0000,.25)),cH=new THREE.Color(0xfff0e0);
  const Tsw=Math.min(140,land*.62),t0=land-Tsw,ms=land+760;let hit=0,ph=A.p0,fade=0,pt=0;
  const paint=(ac,f)=>{for(let i=0;i<N;i++){const j=i%(n+1),rad=i>n?1:0,u=a1+(a0-a1)*j/n;let I=0,h=0;if(u>=ac-.02){const g=u-ac;I=Math.exp(-g*2.4)*(rad?1:.3)*f;h=Math.max(0,1-g*6)}
    cl[i*3]=(cR.r+(cH.r-cR.r)*h)*I;cl[i*3+1]=(cR.g+(cH.g-cR.g)*h)*I;cl[i*3+2]=(cR.b+(cH.b-cR.b)*h)*I}rg.attributes.color.needsUpdate=true};paint(a0+1,0);
  sg2T(ms,(k,dt)=>{const t=k*ms;
    if(t<t0){const u=t0>1?t/t0:1;ph=A.p0+(1-ATK_E.out(Math.min(1,u)))*.5;const op=Math.min(1,t/110);iron.opacity=.95*op;wood.opacity=.95*op;em.opacity=.55*op;glow.material.opacity=.12*op}
    else if(t<land){const u=(t-t0)/Tsw,e=u*u*(1.6-.6*u);ph=A.p0+(A.pi-A.p0)*e;iron.opacity=wood.opacity=.95;em.opacity=.9;glow.material.opacity=.28;paint(Math.PI/2-ph,1);
      piv.updateMatrixWorld(true);sgStreak(arm.localToWorld(new THREE.Vector3(0,A.hy,A.eu)),0,-2,0,0xff3020,5,.05,.2,0)}
    else{ph=A.pi+.05*Math.exp(-(t-land)/60)*Math.sin((t-land)/18);fade=t<land+300?0:Math.min(1,(t-land-300)/460);const f=1-fade;
      iron.opacity=.95*f;wood.opacity=.95*f;em.opacity=(.95-.5*Math.min(1,(t-land)/300))*f;glow.material.opacity=.25*f*Math.max(0,1-(t-land)/400);paint(a1,Math.max(0,1-(t-land)/260));
      arm.position.y=-.45*fade*fade;if(fade>0&&++pt%3==0)sgPuff(gY(p,.3+Math.random()*.8),{col:0x4a0608,geo:'dod',r0:.25,r1:.7,life:.8,op:.45,v:[(Math.random()-.5)*.6,.9,(Math.random()-.5)*.6],drag:1.2,fin:.1})}
    arm.rotation.x=ph;
    if(!hit&&t>=land){hit=1;const q=gY(p,1);fx186Flash(q,0xff1a10,2.8+lvl,280);sgBlood(q,18+lvl*12,3.2,null);sgBlood(gY(p,.4),10,2.4,yaw,1.2);sgSparks(gY(p,.3),0xffd0a0,10+lvl*6,6,2.5,yaw,2.4,6,.4);
      ring(p,0x8a0a0a,2.2+lvl,380);sgCrack(gY(p,0),yaw+Math.PI/2,col,1.7+lvl,.8,1300+lvl*400);sgCrack(gY(p,0),yaw-Math.PI/2,col,1.7+lvl,.8,1300+lvl*400);sgCrack(gY(p,0),yaw,col,1.2+lvl*.8,.6,1100);sgDust(gY(p,0),8+lvl*4,1.8);
      if(lvl)sgEmbers(gY(p,.3),c2,14,.8,2.6,1);
      if(low){sgBlood(gY(p,1.2),20,4,null);sgLater(90,()=>fx186Flash(gY(p,1.3),0xff0000,3.4+lvl,340))}}},()=>sgRm(piv))}
// Execute: the axe now swings with the hero's chop and lands on the hit (was: a guillotine slab dropped after it)
sgExec=function(p,yaw,col,low,lvl,land){if(!p)return;sgBusy(()=>sgHeadsman(p,yaw,col,low,lvl,land))};

// ======================= 4. Rain of Arrows / Arrowstorm: real arrows falling and sticking in the ground =======================
function sg2ArrowGeo(){return sgG('sg2arrow',()=>{const sh=new THREE.CylinderGeometry(.022,.022,.92,5);sh.rotateX(Math.PI/2);
  const hd=new THREE.ConeGeometry(.055,.17,4);hd.rotateX(Math.PI/2);hd.translate(0,0,.54);const parts=[[sh,0x8a6a44],[hd,0x9aa0a8]];
  [0,1,2].forEach(i=>{const f=new THREE.PlaneGeometry(.075,.2);f.rotateY(Math.PI/2);f.translate(0,.045,-.36);f.rotateZ(i*2.094);parts.push([f,i?0xe8e0d0:0xa83a2a])});return sg2Merge(parts)})}
function sgArrowRain(p,R,ms,lvl,col){if(!p)return;lvl=lvl|0;R=R||3;ms=Math.max(800,ms||2800);col=col||0xe8d8b0;const N=lvl?120:72,G=sg2ArrowGeo(),c2=lvl?sgC2(col):0xffffff;
  const mat=sg2Std({vertexColors:true,roughness:.7,metalness:.25,emissive:lvl?sgLerp(c2,0x000000,.45):0x000000,emissiveIntensity:lvl?.9:0,transparent:true,opacity:1});
  const im=new THREE.InstancedMesh(G,mat,N);im.userData.lpsSkip=1;im.frustumCulled=false;im.renderOrder=31;const g=new THREE.Group();g.add(im);
  // streaks behind each falling arrow
  const sp=new Float32Array(N*6),sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));const sl=new THREE.LineSegments(sg,new THREE.LineBasicMaterial({color:lvl?c2:0xfff4d8,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));
  sl.userData.sgOwnG=1;sl.userData.lpsSkip=1;sl.frustumCulled=false;sl.renderOrder=33;g.add(sl);scene.add(g);
  // where the volley comes from: high up, a little behind the caster
  const fromYaw=(typeof pl!='undefined'?pl.rotation.y:0)+Math.PI+(Math.random()-.5)*.6,ux=Math.sin(fromYaw),uz=Math.cos(fromYaw),Tf=.32;
  const A=[];for(let i=0;i<N;i++){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*R*.97,x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r,y=GH(x,z),off=3.2+Math.random()*1.4,h=10+Math.random()*3;
    const s=new THREE.Vector3(x+ux*off,y+h,z+uz*off),e=new THREE.Vector3(x,y,z),dd=e.clone().sub(s).normalize();A.push({ts:-.22+Math.random()*(ms/1000-Tf-.05),e:e.clone().addScaledVector(dd,-.38),g:e,s,land:0,tilt:(Math.random()-.5)*.25,sc:.95+Math.random()*.25})}
  const M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),S3=new THREE.Vector3(),Z=new THREE.Vector3(0,0,1),Dv=new THREE.Vector3(),Pv=new THREE.Vector3(),Z0=new THREE.Vector3(0,0,0);let el=0,dn=0;
  const end=ms/1000+.45;
  sg2T(end*1000,(k,dt)=>{el+=dt;const fo=el>ms/1000?Math.max(0,1-(el-ms/1000)/.45):1;
    for(let i=0;i<N;i++){const q=A[i],u=(el-q.ts)/Tf;sp[i*6]=sp[i*6+1]=sp[i*6+2]=sp[i*6+3]=sp[i*6+4]=sp[i*6+5]=0;
      if(u<0){M4.compose(Z0,Q.identity(),S3.set(0,0,0));im.setMatrixAt(i,M4);continue}
      Dv.copy(q.e).sub(q.s).normalize();
      if(u<1){Pv.lerpVectors(q.s,q.e,u);Q.setFromUnitVectors(Z,Dv);M4.compose(Pv,Q,S3.setScalar(1.15*q.sc));im.setMatrixAt(i,M4);
        sp[i*6]=Pv.x;sp[i*6+1]=Pv.y;sp[i*6+2]=Pv.z;sp[i*6+3]=Pv.x-Dv.x*1.8;sp[i*6+4]=Pv.y-Dv.y*1.8;sp[i*6+5]=Pv.z-Dv.z*1.8}
      else{if(!q.land){q.land=1;if(dn++%2==0){sgPuff(new THREE.Vector3(q.g.x,q.g.y+.08,q.g.z),{col:0x7a6650,geo:'dod',r0:.12,r1:.4,life:.5,op:.4,v:[(Math.random()-.5)*.8,.6,(Math.random()-.5)*.8],drag:2.4,fin:.08});
          sgStreak(new THREE.Vector3(q.g.x,q.g.y+.1,q.g.z),(Math.random()-.5)*2,2+Math.random()*1.5,(Math.random()-.5)*2,lvl&&Math.random()<.5?c2:0xfff0c8,3,.03,.18,6)}}
        // stuck: head buried, shaft quivering for a moment, then sunk away as the volley ends
        const qv=Math.max(0,1-(u-1)*Tf/.25)*Math.sin((u-1)*Tf*70)*.05;Dv.x+=qv;Dv.z+=q.tilt*.2;Dv.normalize();Q.setFromUnitVectors(Z,Dv);
        Pv.copy(q.e).addScaledVector(Dv,(1-fo)*.75);M4.compose(Pv,Q,S3.setScalar(1.15*q.sc*(fo>.02?1:0)));im.setMatrixAt(i,M4)}}
    im.instanceMatrix.needsUpdate=true;sg.attributes.position.needsUpdate=true;mat.opacity=fo;sl.material.opacity=.55*fo},()=>sg2Rm(g))}

// ======================= 8. Blizzard / Eternal Winter: a real ice storm over the whole area =======================
// Driving snow (streaks blown along the wind and round the eye of the storm), swirling wind bands, ice shards falling and
// shattering, frost spreading over the ground and a low mist. Evolved: denser, harder wind, bigger shards, violet frost-light.
function sgBlizzard(p,R,ms,lvl,col){if(!p)return;lvl=lvl|0;R=R||3.4;ms=Math.max(800,ms||4000);col=col||0x9fe3ff;const c2=lvl?sgC2(col):0xeaf8ff,b=gY(p,0),H=6.5;
  const g=new THREE.Group();scene.add(g);
  // frost on the ground
  const fr=sg2Drape(b,R*1.04,sg2FrostTex(),sgLerp(col,0xffffff,.45),0,27,.07,Math.random()*6);const fr2=lvl?sg2Drape(b,R*1.1,fx186Tex('ring'),c2,0,27,.09):null;
  // snow streaks (line segments) and flakes (points)
  const NS=lvl?520:330,NF=lvl?240:150,wy=Math.random()*6.283,wx=Math.sin(wy),wz=Math.cos(wy),W=lvl?7.5:5.5,SW=lvl?4.2:3;
  const S=[],sp=new Float32Array(NS*6),sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
  const sl=new THREE.LineSegments(sg,new THREE.LineBasicMaterial({color:0xf2fbff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));sl.userData.sgOwnG=1;sl.userData.lpsSkip=1;sl.frustumCulled=false;sl.renderOrder=34;g.add(sl);
  const fp=new Float32Array(NF*3),fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(fp,3));
  const pt=new THREE.Points(fg,new THREE.PointsMaterial({color:0xffffff,map:fx186Tex('soft'),size:lvl?.34:.28,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));pt.userData.sgOwnG=1;pt.userData.lpsSkip=1;pt.frustumCulled=false;pt.renderOrder=34;g.add(pt);
  const seed=(q,top)=>{const a=Math.random()*6.283,r=Math.sqrt(Math.random())*R*1.05;q.x=p.x+Math.cos(a)*r-wx*W*.25;q.z=p.z+Math.sin(a)*r-wz*W*.25;q.y=b.y+(top?H*(.75+Math.random()*.25):Math.random()*H);q.v=4+Math.random()*3};
  for(let i=0;i<NS+NF;i++){const q={};seed(q,0);S.push(q)}
  // wind bands swirling round the eye
  const V=sgVortexGeo(),bands=[];[[.55,.5,.1],[.85,1.3,-.08],[.7,2.3,.12]].concat(lvl?[[.95,.9,-.14],[.6,3.1,.06]]:[]).forEach(([r,y,t],j)=>{const m=sgMesh(V,sgMat(j%2?c2:0xeaf8ff,null,0),33);m.material.vertexColors=true;
    const h=new THREE.Group();h.position.set(b.x,b.y+y,b.z);h.rotation.x=t;m.rotation.x=-Math.PI/2;m.scale.setScalar(R*r);h.add(m);g.add(h);bands.push([h,m,j])});
  // ice shards: instanced, each falls, shatters and comes back
  const NI=lvl?40:24,IG=sgG('sg2shard',()=>{const q=new THREE.OctahedronGeometry(1,0);q.scale(.1,.42,.1);return q}),
    im=new THREE.InstancedMesh(IG,sg2Std({color:0xd8f6ff,emissive:lvl?sgLerp(c2,0x204060,.4):0x3a7090,emissiveIntensity:.7,roughness:.08,metalness:.35,transparent:true,opacity:0}),NI);
  im.userData.lpsSkip=1;im.frustumCulled=false;im.renderOrder=32;g.add(im);const I=[];for(let i=0;i<NI;i++)I.push({t:-Math.random()*1.2,p:new THREE.Vector3(),r:new THREE.Euler(),s:(lvl?1.5:1.1)*(.7+Math.random()*.6),T:.55+Math.random()*.25});
  const M4=new THREE.Matrix4(),Qt=new THREE.Quaternion(),S3=new THREE.Vector3(),P3=new THREE.Vector3();let el=0,mi=0;const end=ms/1000+.6;
  sg2T(end*1000,(k,dt)=>{el+=dt;const inn=Math.min(1,el/.35),fo=el>ms/1000?Math.max(0,1-(el-ms/1000)/.6):1,f=inn*fo;
    fr.material.opacity=.62*Math.min(1,el/(ms/1000*.35))*fo;if(fr2)fr2.material.opacity=.4*f*(.8+.2*Math.sin(el*3));
    // snow
    for(let i=0;i<NS+NF;i++){const q=S[i],dx=q.x-p.x,dz=q.z-p.z,rr=Math.hypot(dx,dz)||1,tx=-dz/rr*SW,tz=dx/rr*SW,vx=wx*W+tx-dx*.25,vz=wz*W+tz-dz*.25;
      q.x+=vx*dt;q.z+=vz*dt;q.y-=q.v*dt;if(q.y<b.y+.02||rr>R*1.25)seed(q,1);
      if(i<NS){const L=.05;sp[i*6]=q.x;sp[i*6+1]=q.y;sp[i*6+2]=q.z;sp[i*6+3]=q.x-vx*L;sp[i*6+4]=q.y+q.v*L;sp[i*6+5]=q.z-vz*L}else{const j=i-NS;fp[j*3]=q.x;fp[j*3+1]=q.y;fp[j*3+2]=q.z}}
    sg.attributes.position.needsUpdate=true;fg.attributes.position.needsUpdate=true;sl.material.opacity=.62*f;pt.material.opacity=.85*f;
    bands.forEach(([h,m,j])=>{h.rotation.y=-el*(4.2+j*1.3)*(lvl?1.3:1)+j;m.material.opacity=(.3+.08*Math.sin(el*5+j))*f;m.scale.setScalar(R*(.5+j*.12)*(1+.05*Math.sin(el*3+j)))});
    // shards
    for(let i=0;i<NI;i++){const q=I[i];q.t+=dt;if(q.t<0){M4.compose(P3.set(0,0,0),Qt.identity(),S3.set(0,0,0));im.setMatrixAt(i,M4);continue}
      if(q.t<dt+1e-4){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*R*.92;q.p.set(p.x+Math.cos(a)*r-wx*1.2,0,p.z+Math.sin(a)*r-wz*1.2);q.p.y=GH(q.p.x+wx*1.2,q.p.z+wz*1.2)+5+Math.random()*1.5;q.y0=q.p.y;q.g=GH(q.p.x+wx*1.2,q.p.z+wz*1.2);q.r.set(Math.random(),Math.random(),Math.random())}
      const u=q.t/q.T;if(u<1){const e=u*u;P3.set(q.p.x+wx*1.2*u,q.y0+(q.g-q.y0)*e,q.p.z+wz*1.2*u);q.r.x+=dt*3;Qt.setFromEuler(q.r);M4.compose(P3,Qt,S3.setScalar(q.s*fo));im.setMatrixAt(i,M4)}
      else{if(!q.hit){q.hit=1;const s=new THREE.Vector3(q.p.x+wx*1.2,q.g+.1,q.p.z+wz*1.2);if(fo>.3&&mi++%2==0){for(let j=0;j<3+lvl*2;j++){const a=Math.random()*6.283,v=1+Math.random()*1.6;sgPuff(s.clone(),{col:j%2?0xeaf8ff:c2,geo:'tet',r0:.05*q.s,r1:.02,life:.45,op:.95,v:[Math.cos(a)*v,1+Math.random()*1.4,Math.sin(a)*v],g:7,drag:1,spin:9,fin:.02})}
          sgPuff(s.clone(),{spr:1,col:c2,r0:.5*q.s,r1:0,life:.22,op:.8,fin:.02})}}
        M4.compose(P3.set(0,0,0),Qt.identity(),S3.set(0,0,0));im.setMatrixAt(i,M4);if(u>1.25&&el<ms/1000-.6){q.t=0;q.hit=0;q.T=.55+Math.random()*.25}}}
    im.instanceMatrix.needsUpdate=true;im.material.opacity=.92*f;
    // low mist dragged along the wind
    if(f>.3&&Math.random()<(lvl?.5:.32)){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*R;sgPuff(new THREE.Vector3(p.x+Math.cos(a)*r,b.y+.25+Math.random()*.4,p.z+Math.sin(a)*r),{col:0xc8e8f8,geo:'dod',r0:.4,r1:1+Math.random()*.6,life:1.2,op:.22,v:[wx*W*.4,.15,wz*W*.4],drag:.6,fin:.25})}
  },()=>{sg2Rm(g);sgRm(fr);if(fr2)sgRm(fr2)})}

// ======================= 9. Meteor / Cataclysm: a flaming rock with a fire trail and smoke, then the impact =======================
function sg2RockGeo(){return sgG('sg2rock',()=>{const q=new THREE.DodecahedronGeometry(1,1),P=q.attributes.position,rnd=sg2Rnd(5),C=new Float32Array(P.count*3),seen={};
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),k=(x*7.1+y*13.3+z*3.7).toFixed(2);let s=seen[k];if(s==null)s=seen[k]=.82+rnd()*.32;P.setXYZ(i,x*s,y*s*.9,z*s)}
  q.computeVertexNormals();for(let i=0;i<P.count;i+=3){const lava=rnd()<.22,c=lava?[1,.38,.08]:[.17+rnd()*.06,.11,.09];for(let j=0;j<3;j++)C.set(c,(i+j)*3)}q.setAttribute('color',new THREE.BufferAttribute(C,3));q.userData.lps=1;return q})}
// a cone with its wide end at the origin and its point toward +z (comet tails, wakes)
function sg2TailGeo(){return sgG('sg2tail',()=>{const q=new THREE.ConeGeometry(1,1,12,1,true);q.translate(0,.5,0);q.rotateX(Math.PI/2);return q})}
function sgMeteor(p,col,R,ms,lvl,from,sc){if(!p)return;lvl=lvl|0;col=col||0xff5a1a;R=R||3.5;ms=Math.max(400,ms||1100);sc=(sc||1)*(1+lvl*.3);const c2=lvl?sgC2(col):0xffd080,b=gY(p,0),Tf=Math.min(ms,900),t0=ms-Tf,rs=.85*sc*Math.max(.8,R/3.5);
  // falls from high up beyond the target and a little to the side (never from behind the caster: that is where the camera is)
  const fy=(from?Math.atan2(p.x-from.x,p.z-from.z):Math.random()*6.283)+(Math.random()<.5?-.5:.5),S0=new THREE.Vector3(b.x+Math.sin(fy)*8,b.y+19,b.z+Math.cos(fy)*8),Dv=new THREE.Vector3().subVectors(b,S0).normalize();
  const g=new THREE.Group();g.visible=false;scene.add(g);
  const rock=sgMesh(sg2RockGeo(),sg2Std({vertexColors:true,roughness:.9,metalness:.05,emissive:0x5a1404,emissiveIntensity:.8}),31),shell=sgMesh(sg2RockGeo(),sgMat(sgLerp(col,0xffa040,.4),null,.38),32);shell.scale.setScalar(1.12);shell.material.side=THREE.BackSide;
  const fire=sg2Spr(fx186Tex('soft'),sgLerp(col,0xffd060,.35),.95,34),core=sg2Spr(fx186Tex('soft'),0xfff0c0,.9,35);fire.scale.setScalar(rs*4.2);core.scale.setScalar(rs*2);
  const rk=new THREE.Group();rk.add(rock,shell);rk.scale.setScalar(rs);g.add(rk,fire,core);fire.position.copy(Dv).multiplyScalar(-rs*1.3);core.position.copy(Dv).multiplyScalar(-rs*.7);fire.material.opacity=.6;
  const tail=sgMesh(sg2TailGeo(),sgMat(sgLerp(col,0xffc060,.3),fx186Tex('vgrad'),.7),33);
  const tail2=sgMesh(sg2TailGeo(),sgMat(lvl?c2:0xfff0c0,fx186Tex('vgrad'),.5),34);g.add(tail,tail2);
  const gl=evxGround(new THREE.Vector3(p.x,0,p.z),'soft',col,0,R*.9,28);let pt=0,hit=0;
  sg2T(ms+120,(k,dt)=>{const t=k*(ms+120);if(t<t0)return;if(hit)return;g.visible=true;const u=Math.min(1,(t-t0)/Tf),e=u*(.55+.45*u);
    g.position.lerpVectors(S0,b,e);g.position.y+=rs*.4;rock.rotation.x+=dt*5;rock.rotation.y+=dt*3;shell.rotation.copy(rock.rotation);
    tail.position.set(0,0,0);tail.lookAt(S0);tail.scale.set(rs*1.05,rs*1.05,rs*(5+lvl*2));tail2.lookAt(S0);tail2.scale.set(rs*.5,rs*.5,rs*(3.5+lvl*1.5));
    fire.material.opacity=.6;core.scale.setScalar(rs*(1.8+.3*Math.sin(t/30)));
    gl.userData.dr(0,R*(.3+.65*u));gl.material.opacity=.55*u;
    if(++pt%1==0){const q=g.position.clone().addScaledVector(Dv,-rs*.6);sgPuff(q.clone(),{spr:1,col:Math.random()<.5?col:0xffc050,r0:rs*1.5,r1:0,life:.32,op:.9,v:[-Dv.x*3+(Math.random()-.5),-Dv.y*3+(Math.random()-.5),-Dv.z*3+(Math.random()-.5)],drag:2,fin:.02});
      if(pt%2==0)sgPuff(q.clone().addScaledVector(Dv,-rs),{col:Math.random()<.5?0x2a2224:0x3a3234,geo:'dod',r0:rs*.6,r1:rs*(1.4+Math.random()*.6),life:1.1+Math.random()*.5,op:.5,v:[(Math.random()-.5)*.8,.3,(Math.random()-.5)*.8],drag:1.4,fin:.1});
      if(pt%3==0)sgStreak(q.clone(),-Dv.x*6+(Math.random()-.5)*3,-Dv.y*6+Math.random()*2,-Dv.z*6+(Math.random()-.5)*3,Math.random()<.5?0xffd080:(lvl?c2:col),5,.04,.35,4);
      if(lvl&&pt%2==1)sgPuff(q.clone(),{spr:1,col:c2,r0:rs*.9,r1:0,life:.4,op:.8,v:[-Dv.x*2,-Dv.y*2,-Dv.z*2],drag:2,fin:.02})}
    if(u>=1&&!hit){hit=1;g.visible=false;const q=gY(p,.5);fx186Flash(gY(p,1.2),0xffc060,4+lvl*1.5+R*.3,360);fx186Flash(q,col,2.5+lvl,520);ring(p,col,R*2.3,460);ring(p,0xffe0a0,R*1.4,300);
      for(let i=0;i<22+lvl*14;i++){const a=Math.random()*6.283,v=R*(.6+Math.random()*1.2);sgPuff(gY(p,.4+Math.random()*.6),{spr:1,col:i%3?col:0xffd060,r0:.9+Math.random()*.6,r1:0,life:.5+Math.random()*.3,op:1,v:[Math.cos(a)*v,1.5+Math.random()*3,Math.sin(a)*v],drag:2.2,fin:.03})}
      sgCracks(gY(p,0),col,6+lvl*2,R*1.05,.9,1800+lvl*600);for(let i=0;i<10+lvl*8;i++)try{fxbChunk(gY(p,.4),R*1.4,7.5,.14+Math.random()*.14)}catch(_){}
      sgEmbers(gY(p,.3),c2,18+lvl*12,R*.6,4,1.3);sgSmoke(gY(p,.2),12+lvl*6,R*.6,0x2a2224,2,.55);sgDust(gY(p,0),12,R*1.2);try{if(typeof fxaScorch=='function')fxaScorch(p,R)}catch(_){}
      tw(500,kk=>{gl.material.opacity=.55*(1-kk);gl.userData.dr(0,R*(.95+.3*kk))},()=>evxRm(gl))}},()=>sgRm(g))}

// ======================= 11. Singularity / Event Horizon: a black hole, not a dark orb =======================
// A black core inside a white-hot photon ring, a bright tilted accretion disc (cyan → violet → magenta) spinning fast, lensing
// ripples contracting into it, rocks and light spiralling in from the ground, a swirl on the ground; at the end it collapses
// to a point and bursts. (Eclipse, the assassin's: a dark sun hung high over a shadowed field, no disc, nothing pulled in.)
function sgSingularity(p,R,ms,lvl){if(!p)return;lvl=lvl|0;R=R||5;ms=Math.max(600,ms||3000);const b=gY(p,0),cy=b.y+1.7,c2=lvl?sgC2(0x8a4aff):0xff6ae0,g=new THREE.Group();g.position.set(b.x,cy,b.z);scene.add(g);
  const core=sgMesh(sgG('sg2core',()=>new THREE.SphereGeometry(1,20,14)),new THREE.MeshBasicMaterial({color:0x000000}),30);
  const ph=sg2Spr(fx186Tex('thin'),0xe8fbff,0,37),ph2=sg2Spr(fx186Tex('ring'),0x8ae8ff,0,36),halo=sg2Spr(fx186Tex('soft'),0x6a7aff,0,29);
  const dg=sgG('sg2disk',()=>new THREE.RingGeometry(.3,1,72,2)),disc=sgMesh(dg,sgMat(0xffffff,sg2DiscTex(),0),34),disc2=sgMesh(dg,sgMat(0xffffff,sg2DiscTex(),0),35);
  const tilt=new THREE.Group();tilt.rotation.set(-Math.PI/2+.42,0,.18);tilt.add(disc,disc2);g.add(tilt,halo,ph2,core,ph);
  // lensing ripples: rings that contract into the core
  const lens=[0,1,2].concat(lvl?[3]:[]).map(j=>{const s=sg2Spr(fx186Tex('thin'),j%2?0xc8a8ff:0xbff4ff,0,33);g.add(s);return [s,j]});
  // the ground swirl
  const sw=sg2Drape(b,R*1.02,sg2SpiralTex(),0x7a6aff,0,28,.08),rim=sg2Drape(b,R,fx186Tex('ring'),0x6ad8ff,0,28,.1);
  // debris: rocks spiralling in, with arcane streaks
  const ND=lvl?56:36,RG=sgG('sg2deb',()=>{const q=new THREE.DodecahedronGeometry(1,0);q.scale(1,.75,.9);return q}),dm=sg2Std({color:0x4a4038,roughness:.95,emissive:0x1a1440,emissiveIntensity:.6,transparent:true,opacity:0});
  const im=new THREE.InstancedMesh(RG,dm,ND);im.userData.lpsSkip=1;im.frustumCulled=false;im.renderOrder=31;scene.add(im);
  const lp=new Float32Array(ND*6),lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(lp,3));const ln=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0xa8f0ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  ln.userData.sgOwnG=1;ln.userData.lpsSkip=1;ln.frustumCulled=false;ln.renderOrder=33;scene.add(ln);
  const D=[],spawn=(q,f)=>{q.r=R*(.75+Math.random()*.45)*(f?Math.random()*.7+.3:1);q.a=Math.random()*6.283;q.h=Math.random()*.3;q.s=(.06+Math.random()*.12)*(lvl?1.25:1);q.rx=Math.random()*6};
  for(let i=0;i<ND;i++){const q={};spawn(q,1);D.push(q)}
  const M4=new THREE.Matrix4(),Qt=new THREE.Quaternion(),E=new THREE.Euler(),S3=new THREE.Vector3(),P3=new THREE.Vector3();let el=0,coll=0,pt=0;const T=ms/1000,end=T+.9,cs0=.5+lvl*.12;
  sg2T(end*1000,(k,dt)=>{el+=dt;const inn=Math.min(1,el/.4),grow=Math.min(1,el/T),pre=el>T-.25&&el<T?(el-(T-.25))/.25:0,post=el>=T?el-T:-1,live=post<0;
    // core and rings
    const cs=live?cs0*(.85+.35*grow)*inn*(1-pre*.7):Math.max(0,cs0*.3*(1-post/.12));core.scale.setScalar(Math.max(.001,cs));
    ph.scale.setScalar(cs*2.6*(1+.04*Math.sin(el*24)));ph.material.opacity=live?.95*inn:Math.max(0,1-post/.15);ph2.scale.setScalar(cs*3.4);ph2.material.opacity=live?.5*inn:0;
    halo.scale.setScalar(R*1.1*(live?1:Math.max(0,1-post/.2)));halo.material.opacity=live?.22*inn:0;
    const dsc=live?R*.62*(.7+.3*grow)*inn*(1-pre*.85):0;disc.scale.setScalar(Math.max(.001,dsc));disc2.scale.setScalar(Math.max(.001,dsc*.62));disc.rotation.z-=dt*(3.2+grow*2+pre*14);disc2.rotation.z-=dt*(6+pre*20);
    disc.material.opacity=live?.95:0;disc2.material.opacity=live?.8:0;
    lens.forEach(([s,j])=>{const u=((el*1.25+j/lens.length)%1),r=R*.95*(1-u)+cs*2.4;s.scale.setScalar(r*2);s.material.opacity=live?inn*.36*Math.sin(u*Math.PI):0});
    sw.userData.dr(-el*2.2,R*1.02);sw.material.opacity=(live?.5*inn:Math.max(0,.5-post*1.2));rim.material.opacity=(live?.55*inn*(.8+.2*Math.sin(el*6)):Math.max(0,.55-post*1.5));
    // debris
    for(let i=0;i<ND;i++){const q=D[i];if(live){const w=1.6/Math.pow(Math.max(.5,q.r),1.2)*(1+grow);q.a+=w*dt*(lvl?1.25:1);q.r-=(1.2+1.8/Math.max(.6,q.r))*dt;q.h+=(1.7-q.h)*dt*.9/Math.max(.6,q.r);q.rx+=dt*4;if(q.r<cs*1.4)spawn(q,0)}
      else{q.r+=dt*(14+q.s*30);q.h+=dt*2}
      const x=b.x+Math.cos(q.a)*q.r,z=b.z+Math.sin(q.a)*q.r,y=live?b.y+q.h+.12:b.y+q.h;P3.set(x,y,z);E.set(q.rx,q.rx*.7,0);Qt.setFromEuler(E);const sc=q.s*(live?1:Math.max(0,1-post/.8));M4.compose(P3,Qt,S3.setScalar(sc));im.setMatrixAt(i,M4);
      const ta=q.a-.25,tr=q.r+.25;lp[i*6]=x;lp[i*6+1]=y;lp[i*6+2]=z;lp[i*6+3]=b.x+Math.cos(ta)*tr;lp[i*6+4]=y-.03;lp[i*6+5]=b.z+Math.sin(ta)*tr}
    im.instanceMatrix.needsUpdate=true;lg.attributes.position.needsUpdate=true;dm.opacity=live?inn:Math.max(0,1-post/.8);ln.material.opacity=live?.6*inn:Math.max(0,.6-post);
    if(live&&++pt%2==0){const a=Math.random()*6.283,r=R*(.6+Math.random()*.4);sgPuff(new THREE.Vector3(b.x+Math.cos(a)*r,b.y+.2,b.z+Math.sin(a)*r),{col:0x7a6a70,geo:'dod',r0:.2,r1:.5,life:.6,op:.3,v:[-Math.cos(a)*r*1.2-Math.sin(a)*2,.8,-Math.sin(a)*r*1.2+Math.cos(a)*2],drag:.5,fin:.1})}
    // the collapse: a white burst, light rays, a ring of force and sparks flung out
    if(!live&&!coll){coll=1;const q=new THREE.Vector3(b.x,cy,b.z);fx186Flash(q,0xffffff,4+lvl*1.5,320);fx186Flash(q,0x8a6aff,R*.9+lvl,600);sgRays(p,0xb8a0ff,R*1.2+lvl,700+lvl*300,.9);ring(p,0xb08aff,R*2,420);ring(p,0xffffff,R*1.2,300);
      sgWaves(p,0x9ae8ff,R*1.1,520,2+lvl,1.7,.7);sgSparks(q,0xe8f8ff,26+lvl*16,R*2.4,1,null,6.3,7,.5,1);sgSparks(q,c2,12+lvl*10,R*1.8,1.5,null,6.3,6,.45,1);sgDust(gY(p,0),12,R)}
  },()=>{sgRm(g);sgRm(sw);sgRm(rim);sg2Rm(im);sgRm(ln)})}

// ======================= 10. Disintegrate / Annihilation Ray: a held, steady beam =======================
// Layered shafts round a white core, two helix strands turning round it, a bright orb between the hands, a splash where it ends
// and motes streaming along it. Follows the hero's aim locally (co-op partners see it along the direction it started).
function sgDisBeam(col,L,ms,lvl){lvl=lvl|0;col=col||0xc890ff;L=L||10;ms=Math.max(300,ms||2400);const c2=lvl?sgC2(col):sgLerp(col,0xffffff,.55),w=lvl?1.4:1;
  const G=sgG('sg2bcyl',()=>{const q=new THREE.CylinderGeometry(1,1,1,14,1,true);q.translate(0,.5,0);return q}),g=new THREE.Group(),ax=new THREE.Group();g.add(ax);
  const o=sgMesh(G,sgMat(col,null,0),32),m=sgMesh(G,sgMat(sgLerp(col,0xffffff,.3),null,0),33),c=sgMesh(G,sgMat(0xffffff,null,0),34);ax.add(o,m,c);
  const hx=sgG('sg2helix',()=>{const P=[];for(let i=0;i<=120;i++){const t=i/120;P.push(new THREE.Vector3(Math.cos(t*6.283*7)*.32,t,Math.sin(t*6.283*7)*.32))}return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P),240,.028,4,false)});
  const h1=sgMesh(hx,sgMat(c2,null,0),34),h2=sgMesh(hx,sgMat(lvl?col:0xffffff,null,0),34);h2.rotation.y=Math.PI;const hg=new THREE.Group();hg.add(h1,h2);ax.add(hg);
  const orb=sg2Spr(fx186Tex('soft'),sgLerp(col,0xffffff,.5),0,36),rays=sg2Spr(sgTex('rays'),col,0,35),tip=sg2Spr(fx186Tex('soft'),col,0,36);g.add(orb,rays,tip);scene.add(g);
  const local=!(typeof MPV!='undefined'&&MPV.rep),yaw0=pl.rotation.y,p0=pl.position.clone();let el=0,pt=0,dead=0,ch0=null;const Y=new THREE.Vector3(0,1,0),Dv=new THREE.Vector3();
  sg2T(ms+300,(k,dt)=>{el+=dt;const yaw=local?pl.rotation.y:yaw0,P=local?pl.position:p0;Dv.set(Math.sin(yaw),0,Math.cos(yaw));
    if(local&&el>.15){const C=KQS.ch;if(!ch0&&C)ch0=C;if((!C||C!==ch0)&&!dead)dead=el}
    const e0=dead||(el>ms/1000?ms/1000:0),f=Math.min(1,el/.12)*(e0?Math.max(0,1-(el-e0)/.22):1),ext=Math.min(1,el/.12);
    g.position.copy(gY(P,1.15)).addScaledVector(Dv,.62);ax.quaternion.setFromUnitVectors(Y,Dv);const LL=L*ext,pul=1+.06*Math.sin(el*38)+.03*Math.sin(el*91);
    o.scale.set(.42*w*pul,LL,.42*w*pul);m.scale.set(.19*w*pul,LL,.19*w*pul);c.scale.set(.065*w,LL,.065*w);hg.scale.set(w,LL,w);hg.rotation.y=el*14;
    o.material.opacity=.2*f;m.material.opacity=.5*f;c.material.opacity=f;h1.material.opacity=h2.material.opacity=.75*f;
    orb.scale.setScalar((.8+.15*Math.sin(el*30))*w);orb.material.opacity=.95*f;rays.scale.setScalar(1.6*w);rays.material.rotation=el*3;rays.material.opacity=.6*f;
    tip.position.copy(Dv).multiplyScalar(LL);tip.scale.setScalar((1.3+.3*Math.sin(el*27))*w);tip.material.opacity=.85*f;
    if(f>.3&&++pt%2==0){const q=g.position.clone().addScaledVector(Dv,LL);sgStreak(q,(Math.random()-.5)*6-Dv.x*2,Math.random()*3,(Math.random()-.5)*6-Dv.z*2,Math.random()<.5?col:0xffffff,5,.035,.25,4);
      const t=Math.random()*LL,q2=g.position.clone().addScaledVector(Dv,t);sgPuff(q2.add(new THREE.Vector3((Math.random()-.5)*.4,(Math.random()-.5)*.4,(Math.random()-.5)*.4)),{spr:1,col:Math.random()<.5?c2:0xffffff,r0:.16*w,r1:0,life:.3,op:.9,v:[Dv.x*9,0,Dv.z*9],fin:.05});
      if(pt%6==0)sgSmoke(gY(kqsV(q.x,q.z),.3),1,.3,0x3a2a4a,.8,.35)}},()=>sgRm(g))}

// ======================= 5. Ballista Bolt (was Barrage): one heavy piercing bolt that hurls enemies back =======================
function sg2BoltGeo(){return sgG('sg2bolt',()=>{const sh=new THREE.CylinderGeometry(.06,.07,1.7,6);sh.rotateX(Math.PI/2);
  const hd=new THREE.ConeGeometry(.2,.5,4);hd.rotateX(Math.PI/2);hd.rotateZ(Math.PI/4);hd.translate(0,0,1.08);const nk=new THREE.CylinderGeometry(.1,.08,.16,6);nk.rotateX(Math.PI/2);nk.translate(0,0,.8);
  const parts=[[sh,0x6a4a2a],[hd,0x8a9098],[nk,0x4a4a52]];[-.3,.25].forEach(z=>{const b=new THREE.CylinderGeometry(.085,.085,.07,6);b.rotateX(Math.PI/2);b.translate(0,0,z);parts.push([b,0x4a4a52])});
  [0,1,2].forEach(i=>{const f=new THREE.PlaneGeometry(.16,.42);f.rotateY(Math.PI/2);f.translate(0,.12,-.62);f.rotateZ(i*2.094);parts.push([f,i?0xd8d0c0:0x8a2a1a])});return sg2Merge(parts)})}
function sgBallista(o,d,L,col,lvl){if(!o||!d)return;lvl=lvl|0;L=L||16;col=col||0xf0e0b0;const c2=lvl?sgC2(col):sgLerp(col,0xffffff,.5),D=new THREE.Vector3(d.x,0,d.z).normalize(),s0=1.25+lvl*.35;
  const g=new THREE.Group(),bolt=sgMesh(sg2BoltGeo(),sg2Std({vertexColors:true,roughness:.6,metalness:.35,emissive:lvl?sgLerp(c2,0x000000,.5):0x000000,emissiveIntensity:lvl?1:0,transparent:true,opacity:1}),31);bolt.scale.setScalar(s0);g.add(bolt);
  const sh=lvl?sgMesh(sg2BoltGeo(),sgMat(c2,null,.35),32):null;if(sh){sh.scale.setScalar(s0*1.18);g.add(sh)}
  const wake=sgMesh(sg2TailGeo(),sgMat(col,fx186Tex('vgrad'),.6),33),wake2=sgMesh(sg2TailGeo(),sgMat(0xffffff,fx186Tex('vgrad'),.7),34);g.add(wake,wake2);
  g.position.copy(o);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),D);scene.add(g);
  const R=sgG('pl1',()=>new THREE.PlaneGeometry(2,2)),yaw=Math.atan2(D.x,D.z);let s=0,stuck=0,pt=0,nr=0,el=0;const fl=L/SG2.BSPD;
  fx186Flash(o,col,2+lvl,180);sgSparks(o,0xfff0c8,8,5,1,yaw,1,6,.25,2);
  sg2T((fl+1.3)*1000,(k,dt)=>{el+=dt;
    if(!stuck){s=Math.min(L,el*SG2.BSPD);g.position.copy(o).addScaledVector(D,s);const wl=Math.min(s,5+lvl*2);wake.rotation.set(0,Math.PI,0);wake2.rotation.set(0,Math.PI,0);wake.scale.set(.3*s0,.3*s0,wl);wake2.scale.set(.1*s0,.1*s0,wl*.8);
      bolt.rotation.z+=dt*9;if(sh)sh.rotation.z=bolt.rotation.z;
      // a ring of shoved air every few tiles, dust kicked off the ground under it
      while(nr*2.4<s){const q=o.clone().addScaledVector(D,nr*2.4+1);nr++;const m=sgMesh(R,sgMat(nr%2?col:0xffffff,fx186Tex('ring'),0));m.position.copy(q);m.rotation.y=yaw;scene.add(m);
        sgT(320,kk=>{m.scale.setScalar((.35+kk*1.2)*s0);m.material.opacity=.75*(1-kk)},()=>sgRm(m));if(nr%2)sgDust(gY(kqsV(q.x,q.z),0),2,1.2)}
      if(++pt%2==0)sgStreak(g.position.clone().add(new THREE.Vector3((Math.random()-.5)*.5,(Math.random()-.5)*.5,(Math.random()-.5)*.5)),-D.x*12,0,-D.z*12,Math.random()<.5?col:0xffffff,8,.03,.2,0);
      if(lvl&&pt%2==1)sgPuff(g.position.clone(),{spr:1,col:c2,r0:.45,r1:0,life:.3,op:.9,v:[-D.x*4,0,-D.z*4],fin:.03});
      if(s>=L){stuck=el;const q=gY(kqsV(g.position.x,g.position.z),0);g.position.set(q.x,q.y+.35*s0,q.z);g.rotateX(.38);wake.visible=wake2.visible=false;sgDust(q,8,1.8);sgSparks(gY(q,.3),0xfff0c8,10,4,2,yaw,1.6,5,.3);fx186Flash(gY(q,.5),col,1.4,200)}}
    else{const u=el-stuck,f=u<.8?1:Math.max(0,1-(u-.8)/.4);bolt.material.opacity=f;if(sh)sh.material.opacity=.35*f*(.6+.4*Math.sin(u*12));bolt.rotation.z=0;
      bolt.position.x=Math.sin(u*60)*.02*Math.max(0,1-u*3)}},()=>sgRm(g))}
// a bolt punching through an enemy: splinters, sparks thrown along its flight, a burst of shoved air
function sgBoltHit(p,yaw,col,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{fx186Flash(p,col,1.5+lvl,180);sgSparks(p,0xfff0c8,10+lvl*6,7,1.6,yaw,1.1,6,.32,3);sgBlood(p,6,3,yaw,.9);
  for(let i=0;i<6;i++){const a=yaw+(Math.random()-.5)*1.4,v=3+Math.random()*3;sgPuff(p.clone(),{col:i%2?0x8a6a44:0xc8a878,geo:'box',sx:3,r0:.04,r1:.03,life:.6,op:.95,v:[Math.sin(a)*v,1+Math.random()*2,Math.cos(a)*v],g:9,drag:.6,spin:10,fin:.02})}
  sgWaves(p,sgLerp(col,0xffffff,.3),1.6+lvl*.6,260,1,0,.4);if(lvl)sgEmbers(p,sgC2(col),8,.4,1.5,.6)})}
KQH.r_ballista=sg2Ev(function(c){const sk=c.sk,L=sk.L||16,w=sk.w||1.7,kb=sk.kb||7,rel=(sk.pms||700)*.53/1000,lvl=sgEvo();kqsSnd('draw');
  kqsObj({life:rel,tick:()=>{if(party.length&&!hero.dash)face(aimDir())},end:o=>{if(o.abort||!party.length)return;const d=aimDir().clone().setY(0).normalize();face(d);const P=pl.position.clone(),org=gY(P,1.15).addScaledVector(d,.7);
    sgBallista(org,d,L,sk.col,lvl);kqsSnd('snipe');shake(.14+lvl*.06);
    const Q=kqsLine(P,d,L,w).map(e=>[e,(e.m.position.x-P.x)*d.x+(e.m.position.z-P.z)*d.z]).sort((a,b)=>a[1]-b[1]);let s=0;
    kqsObj({life:L/SG2.BSPD+.15,tick:dt=>{s+=SG2.BSPD*Math.max(0,dt);while(Q.length&&Q[0][1]<=s){const e=Q.shift()[0];if(e.dead)continue;kqsHit(e,c.raw,c);if(sk.stun)eStatus(e,{stun:sk.stun},0);
      if(!e.boss){e.vx=(e.vx||0)+d.x*kb;e.vz=(e.vz||0)+d.z*kb}sgBoltHit(gY(e.m.position,1.1),sgYaw(d),sk.col,lvl);hstop=.04}}})}})});
// the icon: a heavy bolt with a broad head (KQI, engraved like the rest; '🔩' is used nowhere else)
(function(){try{if(typeof KQI=='undefined'||typeof KQE=='undefined')return;const m=[.7071,-.7071,.7071,.7071,-6.6274,16];
  KQI.ballista=['iron',['f','M3 13.8h17.6v4.4H3Z',0,[m]],['f','M30.4 16l-10-7.2v14.4Z',0,[m]],['f','M2.2 16l4.6-6.2h4.2L8.4 16Z',0,[m]],['f','M2.2 16l4.6 6.2h4.2L8.4 16Z',0,[m]],['cs','M13 13.8v4.4M16.4 13.8v4.4',1.1,[m]],['s','M4 25.5h6.5M6 29h5.5M2 22h4',1.3]];
  KQE['🔩']=['ballista','iron']}catch(_){}})();

// ======================= 7. The Endless Hunt: every wolf is the current spirit wolf =======================
// The two extra wolves were built with kqsWolf (the old box wolf) outside Wild Hunt's model swap; now they are the same ghost
// wolf rig as the other three, with the same summon hook (gait, bite, wisps, dissolve).
if(typeof EVO137!='undefined'&&EVO137['Wild Hunt'])EVO137['Wild Hunt'].post=function(c){const P=c.P;[0,1].forEach(j=>{const a=pl.rotation.y+Math.PI+(j?1.5:-1.5);
  let m=typeof cbwWolf=='function'?cbwWolf(1.05):null;const ghost=!!m;if(!m)m=kqsWolf(0xc0f0ff,1.05);m.position.set(P.x+Math.sin(a)*2.2,0,P.z+Math.cos(a)*2.2);m.position.y=GH(m.position.x,m.position.z);
  const q=gY(m.position,.6);sgSmoke(q,6,.5,0x6ad8e8,1,.3);sgEmbers(gY(m.position,.2),0xa0e0ff,10,.6,2,.9);
  const o={mesh:m,life:c.sk.dur,spd:7.8,reach:1.6,iv:.75,dmg:c.raw,c,col:0xa0e0ff,wolf:ghost?0:1,off:3+j};const S=kqsSummon(o);if(ghost&&typeof fxaSumHook=='function')fxaSumHook(S,o,'wolf')})};

// ======================= the cast hooks =======================
var SG_OLD2={
  'Rain of Arrows':(sk,P,d,R,l)=>{sgArrowRain(aimPoint(10).clone(),R,(sk.ticks||8)*(sk.iv||.35)*1000,l,sk.col)},
  'Blizzard':(sk,P,d,R,l)=>{sgBlizzard(aimPoint(10).clone(),R,(sk.ticks||10)*(sk.iv||.4)*1000,l,sk.col)},
  'Meteor':(sk,P,d,R,l)=>{sgMeteor(aimPoint(10).clone(),sk.col,R,(sk.delay||1.1)*1000,l,P.clone(),1)}};
Object.assign(SG_OLD,SG_OLD2);
// the evolved forms are their base effect at lvl 1 (no thin lance streaks / generic shard bursts / columns on top)
if(typeof EVO137!='undefined'){
  if(EVO137['Rain of Arrows'])delete EVO137['Rain of Arrows'].post;
  if(EVO137['Blizzard'])delete EVO137['Blizzard'].post;
  if(EVO137['Singularity'])delete EVO137['Singularity'].post;
  // Cataclysm: two more real meteors (same timing, area and damage as before)
  if(EVO137['Meteor'])EVO137['Meteor'].post=function(c){const p=(c.gp||aimPoint(10)).clone(),P=pl.position.clone();[0,1].forEach(j=>{const a=Math.random()*6.283,q=kqsV(p.x+Math.cos(a)*2.8,p.z+Math.sin(a)*2.8),dl=1.35+j*.3;
    sgMeteor(q,0xff7a2a,2.4,dl*1000,1,P,.7);tele(q,2.4,dl,()=>{evArea(c,q,2.4,c.raw*.55,{burn:1});shake(.2)})})};
  // Headsman's Verdict: the axe falls on up to 2 more enemies (same rule, timing and damage as before)
  if(EVO137['Execute'])EVO137['Execute'].post=function(c){const not=new Set([c.evT]);evNearest(pl.position,8,not).slice(0,2).forEach((e,j)=>{setTimeout(()=>{if(e.dead||!e.m)return;
    const low=e.c.h/M(e.c)<.3;sgExec(e.m.position.clone(),sgYaw(kqsDir(pl.position,e.m.position)),0xff3020,low?1:0,1,480);
    setTimeout(()=>{if(e.dead)return;const lw=e.c.h/M(e.c)<.3;evHit(c,e,c.raw*(lw?2.4:.8));if(e.dead)popT(e.m.position,'EXECUTED','#ff4a3a',true)},480)},120+j*160)})};
}
// Execute: the axe is drawn with the swing and lands on the hit (damage, timing and the kill refund as before)
KQH.w_exec=sg2Ev(function(c){const t=kqsNear(5.2);if(!t)return false;const yaw=sgYaw(kqsDir(pl.position,t.m.position)),lg=kqsLunge(t);const low=t.c.h/M(t.c)<.3,k=(low?3:1)*(1+Math.min(100,c.cr)/100*.8),land=150+lg;
  try{sgExec(t.m.position.clone(),yaw,c.sk.col,low?1:0,sgEvo(),land)}catch(_){}
  setTimeout(()=>{if(t.dead)return;kqsHit(t,c.raw*k,c);hstop=low?.12:.06;shake(low?.35:.18);kqsSnd('thud');
    if(t.dead){hero.cd[c.key]=(hero.cd[c.key]||0)*.3;popT(t.m.position,'EXECUTED','#ff4a3a',true)}},land)});
// Singularity: the same pull, ticks and collapse; the look is sgSingularity
KQH.m_sing=sg2Ev(function(c){const p=c.gp.clone(),R=c.R;kqsSnd('portal');let ti=0;sgSingularity(p,R,c.sk.dur*1000,sgEvo());
  kqsObj({life:c.sk.dur,tick:(dt,now,o)=>{kqsFoes(p,R+1).forEach(e=>{if(e.boss)return;const v=kqsV(p.x-e.m.position.x,p.z-e.m.position.z),L=v.length();if(L>.6)walkM(e.m,v.x/L*Math.min(L,3.6*dt),v.z/L*Math.min(L,3.6*dt));e.vx=e.vz=0});
    ti-=dt;if(ti>0)return;ti=.25;kqsArea(p,R,c.raw,c,{proc:false})},
   end:o=>{if(o.abort)return;kqsArea(p,R*.7,c.A*2.5,c,{stun:.6});shake(.3);kqsSnd('boom')}})});

// ======================= 2, 3, 10: timed poses =======================
function sg2Act(ms,fn,legs,bi){const S={ms:ms,end:null,A:null};haPlay(ms,k=>fn(k*S.ms,S),2,null,bi==null?.08:bi);const A=HA.cur;if(A){if(legs)A.legFull=1;S.A=A}return S}
// end it now: blend out over `rest` ms from wherever it is
function sg2Cut(S,rest){const A=S&&S.A;if(!A||HA.cur!==A||S.end!=null)return;const t=A.k*S.ms;S.end=t;S.ms=t+rest;A.ms=S.ms;A.k=t/S.ms}
// Penance: kneel once and stay down for the whole prayer (it used to restart the kneel on every pulse)
var SG2K={sx:.2,hx:.5,ax:-1.2,az:-.55,ex:-1.8,lx:-1.2,lz:.55,le:-1.8,lh:-1.0,lk:1.2,rh:.55,rk:1.6,dy:-.43};
function sg2Kneel(ms){return sg2Act(ms+320,(t,S)=>{const e=S.end!=null?S.end:S.ms-320;let P;
  if(t<230)P=atkMix(ATK_REST,SG2K,ATK_E.io(t/230));
  else P=Object.assign({},SG2K,{hx:SG2K.hx+.05*Math.sin(t/420),sx:SG2K.sx+.025*Math.sin(t/650),ax:SG2K.ax+.04*Math.sin(t/530),lx:SG2K.lx+.04*Math.sin(t/530)});
  if(t>e)P=atkMix(P,ATK_REST,ATK_E.io(Math.min(1,(t-e)/Math.max(1,S.ms-e))));return P},1,.04)}
KQH.p_penance=sg2Ev(function(c){kqsSnd('holy');const K=sg2Kneel(c.sk.dur*1000);
  kqsChan({t:c.sk.dur,iv:.5,slow:.65,tick:()=>{healHero(heroMax()*.03*c.rk);sgPenance(pl.position.clone(),c.sk.col,c.R,sgEvo());kqsArea(pl.position,c.R,c.raw,c,{proc:false})},end:()=>sg2Cut(K,300)})});
// Disintegrate: hands drawn to the chest, then both thrust forward and braced, the body leaning into a held beam
function sg2DisPose(t,S){const e=S.end!=null?S.end:S.ms-260,
    C={sx:-.12,hx:-.05,ax:-.95,az:-.45,ex:-2.0,lx:-.95,lz:.45,le:-2.0,rw:.3,lw:.3,lh:-.15,rh:.12,lk:.25,rk:.3,dy:-.06},
    H={sx:.3,hx:-.28,sy:0,ax:-1.55,az:-.3,ex:-.06,rw:-.6,lx:-1.55,lz:.3,le:-.06,lw:-.6,lh:-.55,lk:.6,rh:.42,rk:.28,dy:-.15};
  let P;if(t<150)P=atkMix(ATK_REST,C,ATK_E.out(t/150));else if(t<250)P=atkMix(C,H,ATK_E.in2((t-150)/100));
  else{const j=Math.sin(t*.075)*.03+Math.sin(t*.031)*.02;P=Object.assign({},H,{ex:H.ex+j,le:H.le-j,sx:H.sx+.025*Math.sin(t*.012),ax:H.ax+.02*Math.sin(t*.05),lx:H.lx+.02*Math.sin(t*.05+1)})}
  if(t>e)P=atkMix(P,ATK_REST,ATK_E.io(Math.min(1,(t-e)/Math.max(1,S.ms-e))));return P}
function sg2Disint(c,L,w,run){kqsSnd('beam');const lvl=sgEvo(),K=sg2Act(c.sk.dur*1000+260,sg2DisPose,1,.05);sgDisBeam(c.sk.col,L,c.sk.dur*1000,lvl);const C=lvl?evC():null;
  kqsChan({t:c.sk.dur,iv:.2,slow:.6,upd:()=>{if(party.length)face(aimDir())},tick:()=>{const d=aimDir();face(d);
    kqsLine(pl.position,d,L,w).forEach(q=>{kqsHit(q,c.raw,c,{proc:false});burst(gY(q.m.position,1),lvl?C.c2:0xc890ff,4,1,1,.3)})},end:()=>sg2Cut(K,240)});return run?true:undefined}
KQH.m_disint=sg2Ev(function(c){return sg2Disint(c,10,1.3,0)});
if(typeof EVO137!='undefined'&&EVO137['Disintegrate'])EVO137['Disintegrate'].run=function(c){return sg2Disint(c,14,1.9,1)};

// ---------------- charges: a real sprint while the dash runs, a planted follow-through when it ends ----------------
// legs: [hip, knee] for a run phase s (hip < 0 = thigh forward; the knee folds most just before the leg passes under the body)
function sg2Leg(s){const a=6.2832*s;return [-.92*Math.sin(a)-.08,.28+1.4*Math.pow(Math.max(0,Math.cos(a+.35)),1.4)]}
var SG2_RUN={
  // Bull Rush: shoulder lowered like a ram, head down, arms tucked
  tackle:{lean:.5,dy:-.12,P:250,pump:.16,arm:{sy:.42,py:.18,hx:-.42,ax:-.4,az:.28,ex:-1.75,lx:-.8,lz:-.5,le:-1.65},
    hit:{sx:.7,sy:.68,py:.3,hx:-.5,ax:-.25,az:.35,ex:-1.6,lx:-.9,lz:-.45,le:-1.6,lh:-.85,lk:.62,rh:.6,rk:.25,dy:-.22}},
  // Crusader's Charge: shield thrust ahead, the weapon held high like a lance about to fall; it falls on the follow-through
  lance:{lean:.36,dy:-.09,P:270,pump:.07,arm:{hx:-.22,lx:-1.55,lz:.1,le:-.2,ax:-2.7,az:.3,ex:-.7,rw:-.3},
    hit:{sx:.62,hx:-.28,lx:-1.65,lz:.05,le:-.1,ax:-1.15,az:.1,ex:-.1,rw:.5,lh:-.85,lk:.62,rh:.55,rk:.3,dy:-.2}},
  // Shadow Rush: a low sprint with both blades swept back, then a cross-cut at the end
  blades:{lean:.62,dy:-.17,P:230,pump:.1,arm:{hx:-.55,ax:.85,az:.25,ex:-.3,lx:.85,lz:-.25,le:-.3,rw:.4,lw:.4},
    hit:{sx:.7,hx:-.45,ax:-1.5,az:-.6,ex:-.1,lx:-1.5,lz:.6,le:-.1,lh:-.9,lk:.75,rh:.6,rk:.35,dy:-.26}}};
var SG2_RUNS={'Bull Rush':'tackle',"Crusader's Charge":'lance','Shadow Rush':'blades'};
function sg2RunPose(st){const Y=SG2_RUN[st],ar=Y.arm,hx0=ar.hx!=null?ar.hx:-Y.lean*.5,
    coil=Object.assign({},ar,{sx:Y.lean*.55,dy:Y.dy-.1,lh:-.55,lk:.95,rh:.45,rk:.6,hx:hx0});
  return (t,S)=>{const s=Math.max(0,t-45)/Y.P,L=sg2Leg(s),R=sg2Leg(s+.5),ph=6.2832*s;
    const run=Object.assign({},ar,{sx:Y.lean+.04*Math.cos(2*ph),hx:hx0,lh:L[0],lk:L[1],rh:R[0],rk:R[1],dy:Y.dy-.05*Math.abs(Math.cos(ph)),py:(ar.py||0)+.14*Math.sin(ph),sy:(ar.sy||0)-.1*Math.sin(ph),
      ax:(ar.ax||0)+Y.pump*Math.sin(ph),lx:(ar.lx||0)-Y.pump*Math.sin(ph)});
    let P=t<95?atkMix(coil,run,ATK_E.io(t/95)):run;const e=S.end;
    if(e!=null&&t>e){const q=t-e;P=q<100?atkMix(P,Y.hit,ATK_E.out(q/100)):atkMix(Y.hit,ATK_REST,ATK_E.io(Math.min(1,(q-100)/Math.max(1,S.ms-e-100))))}
    return P}}
function sg2Run(st){if(!hero.dash||!SG2_RUN[st])return null;const S=sg2Act(hero.dash.t*1000+400,sg2RunPose(st),1,.06),A=S.A;
  if(A)A.tick=()=>{const t=A.k*S.ms;if(S.end!=null)return;if(!hero.dash&&t>50){sg2Cut(S,340);return}if(hero.dash&&t>S.ms-380){S.ms+=250;A.ms=S.ms;A.k=t/S.ms}};return S}
{const f=cast_base;cast_base=function(i){let sk=null;try{sk=heroSkills()[i]}catch(_){}const st=sk&&SG2_RUNS[sk.n],d0=hero.dash;const r=f.apply(this,arguments);
  try{if(st&&hero.dash&&hero.dash!==d0)sg2Run(st)}catch(err){console.warn('sg2 run',err)}return r}}

// ---------------- 6. bows: the arrows leave on the release frame of the draw ----------------
// Multishot (and its evolution): the cast's launches are held and fired at bowAnim's release (53% of the draw), turned with the aim.
{const f=cast_base;cast_base=function(i){let sk=null;try{sk=heroSkills()[i]}catch(_){}
  if(!sk||sk.k!='shot'||!sk.arrow||sk.pose!='bow')return f.apply(this,arguments);
  const cd0=hero.cd['s'+i]||0,cap=[],ll=launch;
  launch=function(pos,dd,spd,s,dm,life){if(typeof BAL138!='undefined'&&BAL138.vol&&s&&typeof s=='object'&&!s.basic&&!s.cc&&!s.vol)s=Object.assign({},s,{vol:BAL138.vol});cap.push([dd.clone(),spd,s,dm,life])};
  let r;try{r=f.apply(this,arguments)}finally{launch=ll}
  if(!cap.length)return r;
  if((hero.cd['s'+i]||0)<=cd0){cap.forEach(q=>ll(pl.position,q[0],q[1],q[2],q[3],q[4]));return r}
  const d0=aimDir().clone(),y0=Math.atan2(d0.x,d0.z),rel=(sk.pms||420)*.53/1000;
  kqsObj({life:rel,tick:()=>{if(party.length&&!hero.dash)face(aimDir())},end:o=>{if(o.abort||!party.length)return;const d=aimDir(),a=Math.atan2(d.x,d.z)-y0,co=Math.cos(a),sn=Math.sin(a);face(d);
    cap.forEach(q=>{const v=q[0];ll(pl.position,V(v.x*co+v.z*sn,0,-v.x*sn+v.z*co),q[1],q[2],q[3],q[4])})}});return r}}
// Rapid Fire / Gatling Volley: every arrow leaves on its own draw's release
function sg2Rapid(c,n0,iv){let n=0;kqsSnd('arrow');const ms=Math.max(110,iv*1000*.95),C=sgEvo()?evC():null;
  kqsChan({t:c.sk.dur,iv:iv,slow:.4,tick:()=>{if(n>=n0)return;n++;const j=n;try{bowAnim(ms)}catch(_){}
    kqsObj({life:ms*.53/1000,end:o=>{if(o.abort||!party.length)return;const d=aimDir();face(d);launch(pl.position,d,C?26:24,{col:c.sk.col,mt:'p',arrow:1,pierce:c.s.pierce||0},c.raw,.7);
      if(C&&j%4==0)ev137Flare(gY(pl.position,1.2).addScaledVector(d,.9),C.c2,.8,180);sfx('arrow')}})}});return true}
KQH.r_rapid=sg2Ev(function(c){sg2Rapid(c,10,.2)});
if(typeof EVO137!='undefined'&&EVO137['Rapid Fire'])EVO137['Rapid Fire'].run=function(c){return sg2Rapid(c,16,.125)};
// Aimed Shot / Heartseeker: the draw lasts the whole 0.9 s channel, so the string is let go when the shot flies
{const wrap=f=>function(){const B=bowAnim;bowAnim=function(ms){return B.call(this,ms>=900&&ms<=1000?1700:ms)};try{return f.apply(this,arguments)}finally{bowAnim=B}};
  if(KQH.r_aimed)KQH.r_aimed=wrap(KQH.r_aimed);if(typeof EVO137!='undefined'&&EVO137['Aimed Shot']&&EVO137['Aimed Shot'].run)EVO137['Aimed Shot'].run=wrap(EVO137['Aimed Shot'].run)}

// ---------------- 3. the other movers ----------------
var SGP2={};
(function(){if(typeof ATK=='undefined'||typeof atkTrack!='function')return;const E=atkEyes,R=ATK_REST,T=(k,n)=>atkTrack(k,n);
  // Phantom Strike: lands from the shadows in a deep crouch, blades crossed, then flares both out in a ring cut and holds
  SGP2.sgBlinkCut=[T([[0,R],[.07,E({sx:.55,hx:-.3,ax:-1.1,az:-.95,ex:-1.6,lx:-1.1,lz:.95,le:-1.6,rw:.6,lw:.6,lh:-.65,lk:1.2,rh:.5,rk:.95,dy:-.34}),'out'],
    [.18,E({sx:.22,hx:-.12,sy:-.35,py:-.15,ax:-1.45,az:1.35,ex:-.1,lx:-1.45,lz:-1.35,le:-.1,rw:.9,lw:.9,lh:-.5,lk:.85,rh:.55,rk:.65,dy:-.24}),'in2'],
    [.5,E({sx:.2,sy:-.4,py:-.18,ax:-1.35,az:1.45,ex:-.15,lx:-1.35,lz:-1.45,le:-.15,lh:-.45,lk:.8,rh:.5,rk:.6,dy:-.22}),'out'],[1,R,'io']]),560];
  // Thousand Cuts: each flicker lands in a lunge with a thrust (alternate hands)
  const fl=E({sx:.6,hx:-.3,sy:-.35,py:-.2,ax:-1.6,az:-.1,ex:-.04,rw:.5,lx:-.3,lz:.4,le:-1.2,lh:-.8,lk:.75,rh:.6,rk:.3,dy:-.22});
  SGP2.sgFlick=[T([[0,atkMix(R,fl,.4)],[.3,fl,'out'],[.7,fl,'lin'],[1,atkMix(R,fl,.5),'io']]),180];
  SGP2.sgFlickL=[T([[0,atkMix(R,atkMirror(fl),.4)],[.3,atkMirror(fl),'out'],[.7,atkMirror(fl),'lin'],[1,atkMix(R,atkMirror(fl),.5),'io']]),180];
  // Disengage: a coil, a spring backwards with the bow held on the foe, knees tucked in the air, a crouched landing (land .73)
  const bw={lx:-1.45,lz:-.32,lw:1.42,le:-.04,ax:-.55,az:1.25,ex:-2.2,sy:.55,py:.15};
  SGP2.sgVault=[T([[0,R],[.08,E(Object.assign({sx:.38,dy:-.22,lk:.95,rk:.95,lh:-.45,rh:-.35},bw)),'out'],[.22,E(Object.assign({sx:-.38,hx:.25,dy:.03,lk:.2,rk:.35,lh:-.25,rh:.15},bw)),'out'],
    [.5,E(Object.assign({sx:-.22,hx:.18,lk:1.45,rk:1.35,lh:-1.05,rh:-.85,dy:.04},bw)),'io'],[.73,E(Object.assign({sx:.45,hx:-.1,lk:1.05,rk:.85,lh:-.6,rh:.35,dy:-.25},bw)),'in'],[1,R,'io']]),520];
  Object.assign(SGP,SGP2);
})();
Object.assign(SG_LEGS,{sgBlinkCut:1,sgFlick:1,sgFlickL:1,sgVault:1});
(function(){const P={'Phantom Strike':['sgBlinkCut'],Disengage:['sgVault'],'Leap Slam':['leap',540],"Titan's Fall":['leap',830]};
  const A=[SKB,typeof SKX!='undefined'?SKX:{},KQN];A.forEach(T=>Object.keys(T).forEach(c=>(T[c]||[]).forEach(s=>{const q=P[s.n];if(q){s.pose=q[0];if(q[1])s.pms=q[1]}})))})();
// Thousand Cuts: the flicker pose instead of a dash pose (kqsPose('dash') inside its timer chain)
{const f=KQH.a_cuts;if(f)KQH.a_cuts=function(c){SG2.cuts=nowP()+2400;SG2.cn=0;return f.apply(this,arguments)}}
{const f=kqsPose;kqsPose=function(p,ms){if(p=='dash'&&SG2.cuts>nowP()){p=SG2.cn++%2?'sgFlickL':'sgFlick';ms=180}return f.call(this,p,ms)}}

// ---------------- Hawk Dive: the spirit hawk climbs, then stoops on its prey ----------------
function sg2Hawk(){let g=null;try{const c={g:['Skyhawk'],cl:[0xe8c890],v:'',tr:'',f:0,z:1,evo:0,mods:[]};g=crRig(c,'Skyhawk');
    const body=fxaFres({col:0xf0d8a0,vc:1,skin:1,em:0x3a2a08,rim:0xfff0c0,k:2.2,p:1.8,a0:.3,base:0xb08840,mix:.45,op:.78,dw:true});
    g.traverse(o=>{if(!o.isMesh)return;o.castShadow=false;o.material=body;o.renderOrder=30;o.userData.lpsSkip=1});g.userData.rig=1}catch(err){g=null}
  return g}
function sgHawkFly(a,b,ms,col,lvl){if(!a||!b)return;lvl=lvl|0;ms=ms||440;col=col||0xe8c890;const c2=lvl?sgC2(col):0xfff0c8;let h=sg2Hawk(),rig=!!h;if(!h){h=kqsHawk(col);h.scale.setScalar(1.3)}else h.scale.multiplyScalar(1.15+lvl*.2);
  scene.add(h);const M=rig?fxaMats(h):null,ap=new THREE.Vector3().lerpVectors(a,b,.28);ap.y=Math.max(a.y,b.y)+3.8;const P=new THREE.Vector3(),N=new THREE.Vector3();let pt=0,out=0;
  const at=k=>{if(k<.38){const u=ATK_E.out(k/.38);return P.lerpVectors(a,ap,u).setY(a.y+(ap.y-a.y)*u)}const u=Math.pow((k-.38)/.62,1.8);return P.lerpVectors(ap,b,u)};
  sg2T(ms+520,(k,dt)=>{const t=k*(ms+520);
    if(t<=ms){const kk=t/ms;h.position.copy(at(kk));N.copy(at(Math.min(1,kk+.03)));if(N.distanceToSquared(h.position)>1e-6)h.lookAt(N);
      const st=kk>.38;if(rig){try{animC(h,performance.now(),true,st?2:9)}catch(_){}(h.wings||[]).forEach(w=>{if(w.p)w.p.rotation.z=st?w.s*-.25:w.p.rotation.z})}
      else h.userData.w.forEach((w,j)=>w.rotation.z=(j?-1:1)*(st?.85:Math.sin(kk*40)*.7));
      if(M)fxaOp(M,Math.min(1,t/90));
      if(++pt%2==0)sgPuff(h.position.clone(),{spr:1,col:st?c2:col,r0:st?.5:.3,r1:0,life:.3,op:.8,fin:.03});if(st&&pt%2==1)sgStreak(h.position.clone(),0,2,0,0xfff0c8,6,.03,.15,0);
      if(pt%5==0&&typeof sgPuff=='function')sgPuff(h.position.clone(),{col:0xc8a070,geo:'box',sx:3,r0:.05,r1:.05,life:1,op:.9,v:[0,-.3,0],g:1,drag:2,spin:6})}
    else{if(!out){out=1;sgFeathers(h.position.clone(),0xb08850,8+lvl*6,2)}const u=(t-ms)/520;h.position.y+=dt*7;h.position.x+=(b.x-a.x)*.25*dt;h.position.z+=(b.z-a.z)*.25*dt;h.rotateX(-dt*2.2);
      if(rig)try{animC(h,performance.now(),true,10)}catch(_){}if(M)fxaOp(M,Math.max(0,1-u));else h.traverse(o=>{if(o.material){o.material.transparent=true;o.material.opacity=1-u}})}},
   ()=>{if(rig)fxaRm(h);else kqsRm(h)})}
KQH.r_hawk=sg2Ev(function(c){const t=kqsNear(14);if(!t)return false;kqsSnd('beast');const lvl=sgEvo(),a=gY(pl.position,2.2).addScaledVector(kqsV(Math.cos(pl.rotation.y),-Math.sin(pl.rotation.y)),.5);
  sgHawkFly(a,gY(t.m.position,1),440,0xe8c890,lvl);
  setTimeout(()=>{if(!t.dead){kqsHit(t,c.raw,c);t.mark=Math.max(t.mark||0,6);t.markV=Math.max(t.markV||0,.2);dn(t.m.position,'Hunted','#fde68a',-36,900);sgTalons(t.m.position.clone(),sgYaw(kqsDir(pl.position,t.m.position)),0xe8c890,lvl);sfx('crit')}},440)});

// ---------------- 5. saves: the old ability name follows the new one ----------------
var SG2_RN={'Barrage':'Ballista Bolt'};
function sg2Rename(T){if(!T||typeof T!='object'||T.__rn186===SG2_RN)return;
  for(const o in SG2_RN){const n=SG2_RN[o];['ab:','sk:','__ev:'].forEach(p=>{if(T[p+o]!=null){if(T[p+n]==null)T[p+n]=T[p+o];delete T[p+o]}});
    if(T.__ld)T.__ld=String(T.__ld).split('|').map(q=>q===o?n:q).join('|')}
  try{Object.defineProperty(T,'__rn186',{value:SG2_RN,enumerable:false,configurable:true,writable:true})}catch(_){}}
{const f=kqsMig;kqsMig=function(){try{if(hero&&hero.tal)sg2Rename(hero.tal)}catch(_){}return f.apply(this,arguments)}}
{const f=KQS.cdn;try{for(const o in SG2_RN)if(f&&f[o]!=null){f[SG2_RN[o]]=f[o];delete f[o]}}catch(_){}}

sg2Reg(['sgHeadsman','sgExec','sgArrowRain','sgBlizzard','sgMeteor','sgSingularity','sgDisBeam','sgBallista','sgBoltHit','sgHawkFly']);
