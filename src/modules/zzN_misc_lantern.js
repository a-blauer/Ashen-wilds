// ================= v89 misc: a magic lantern that floats beside the hero =================
// The v71 belt lantern (LANT, zz7_v71.js) is taken off the hero and stays hidden; its "should it show" flag (set by the
// zone atmosphere in atmos) now drives FLAN, a small enchanted lantern that hovers over the hero's left shoulder, a little
// behind. It follows with a damped spring (lags and sways when you run, dash, turn or ride, snaps on teleports/recall),
// bobs, glows, sheds a few sparkle motes, and the hero's light (torch) is moved onto it. The light's colour, intensity and
// reach are untouched (gameplay radius unchanged). Co-op partners shown in the world get their own floating lantern
// (glow only, no extra light) in lantern zones.
var FLAN_OFF={side:-.95,up:1.85,back:-.5};          // left of the hero, slightly behind (hero-local x, y, z)
var FLAN_HALO=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.22,'rgba(255,255,255,.55)');r.addColorStop(.55,'rgba(255,255,255,.14)');r.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=r;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);return t})();
function flanMake(withMotes){
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);root.userData.lpsSkip=1;
  const iron=new THREE.MeshStandardMaterial({color:0x2a2430,metalness:.65,roughness:.4}),gild=new THREE.MeshStandardMaterial({color:0xd8b25a,metalness:.8,roughness:.3,emissive:0x4a3010,emissiveIntensity:.6});
  const glass=new THREE.MeshBasicMaterial({color:0xffd890,transparent:true,opacity:.32,depthWrite:false,blending:THREE.AdditiveBlending});
  const coreM=new THREE.MeshBasicMaterial({color:0xfff2c0}),add=(geo,m,x,y,z,s)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);if(s)o.scale.set(s[0],s[1],s[2]);o.castShadow=false;o.receiveShadow=false;o.userData.lpsSkip=1;body.add(o);return o};
  add(new THREE.CylinderGeometry(.13,.15,.04,6),gild,0,-.13,0);                                  // base plate
  add(new THREE.ConeGeometry(.08,.07,6),iron,0,-.18,0,[1,-1,1]);                                  // drip point
  add(new THREE.CylinderGeometry(.1,.1,.22,6,1,true),glass,0,0,0);                                // glass
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;add(new THREE.BoxGeometry(.016,.24,.016),iron,Math.cos(a)*.105,0,Math.sin(a)*.105)}
  add(new THREE.CylinderGeometry(.15,.13,.035,6),gild,0,.125,0);                                 // top plate
  add(new THREE.ConeGeometry(.14,.13,6),iron,0,.205,0);                                          // roof
  add(new THREE.TorusGeometry(.045,.012,6,12),gild,0,.3,0);                                       // ring
  const core=add(new THREE.OctahedronGeometry(.055,0),coreM,0,0,0,[1,1.45,1]);                     // floating crystal flame
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:FLAN_HALO,color:0xffc070,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending}));
  halo.scale.set(1.25,1.25,1);halo.userData.lpsSkip=1;root.add(halo);
  const o={root,body,core,halo,glass,coreM,pos:new THREE.Vector3(),vel:new THREE.Vector3(),tilt:new THREE.Vector2(),on:false,ph:Math.random()*6.28,yaw:0};
  if(withMotes){const N=10,p=new Float32Array(N*3),col=new Float32Array(N*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(p,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
    const pts=new THREE.Points(geo,new THREE.PointsMaterial({size:.09,map:FLAN_HALO,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));pts.frustumCulled=false;root.add(pts);
    o.motes={pts,p,col,N,life:new Float32Array(N).map(()=>Math.random()),sp:new Float32Array(N).map(()=>.35+Math.random()*.5),a:new Float32Array(N).map(()=>Math.random()*6.28),r:new Float32Array(N).map(()=>.12+Math.random()*.2),
      hue:new Float32Array(N).map((_,i)=>i%3==0?1:0)}}
  root.visible=false;root.frustumCulled=false;scene.add(root);return o}
var FLAN=flanMake(true),FLANR=new Map(),FLAN_T=0;
try{if(LANT.parent)LANT.parent.remove(LANT);LANT.visible=false}catch(_){}
// where the lantern wants to be for a hero group m (riding raises the hero by the saddle height)
function flanTarget(m,lift,now,ph,out){const a=m.rotation.y,s=Math.sin(a),c=Math.cos(a),o=FLAN_OFF;
  out.set(m.position.x+c*o.side+s*o.back,m.position.y+o.up+lift+Math.sin(now/620+ph)*.09+Math.sin(now/1730+ph)*.04,m.position.z-s*o.side+c*o.back);return out}
var FLAN_V=new THREE.Vector3(),FLAN_A=new THREE.Vector3();
function flanStep(L,m,lift,dt,now){const T=flanTarget(m,lift,now,L.ph,FLAN_V);
  if(!L.on||L.pos.distanceTo(T)>9){L.pos.copy(T);L.vel.set(0,0,0);L.on=true}                     // first show, teleports, recall, portals
  else{const k=38,c=8.2;FLAN_A.copy(T).sub(L.pos).multiplyScalar(k).addScaledVector(L.vel,-c);L.vel.addScaledVector(FLAN_A,dt);L.pos.addScaledVector(L.vel,dt);
    const d=L.pos.distanceTo(T);if(d>2.6)L.pos.lerp(T,1-2.6/d)}                                  // never trail too far behind (mounts, dashes)
  L.root.position.copy(L.pos);
  // sway: lean against the motion, plus a slow idle rock
  const tx=Math.max(-.5,Math.min(.5,L.vel.z*.11))+Math.sin(now/900+L.ph)*.06,tz=Math.max(-.5,Math.min(.5,-L.vel.x*.11))+Math.cos(now/1100+L.ph)*.06;
  L.tilt.x+=(tx-L.tilt.x)*Math.min(1,dt*5);L.tilt.y+=(tz-L.tilt.y)*Math.min(1,dt*5);L.body.rotation.set(L.tilt.x,(L.yaw+=dt*.6),L.tilt.y,'YXZ');
  const q=1+Math.sin(now/110+L.ph)*.08+Math.sin(now/47+L.ph)*.03;L.core.scale.set(q,1.45*q,q);L.core.rotation.y=now/400;
  L.halo.material.opacity=.62+.12*Math.sin(now/260+L.ph);const hs=1.15+.08*Math.sin(now/330+L.ph);L.halo.scale.set(hs,hs,1)}
function flanTint(L,col){L.halo.material.color.copy(col);L.coreM.color.copy(col).lerp(FLAN_W,.6);L.glass.color.copy(col)}
var FLAN_W=new THREE.Color(0xffffff),FLAN_C=new THREE.Color(),FLAN_G=new THREE.Color(0xffd27a),FLAN_M=new THREE.Color(0xc8b4ff);
function flanMotes(L,dt){const M=L.motes;if(!M)return;const {p,col,N}=M;
  for(let i=0;i<N;i++){M.life[i]+=dt*M.sp[i]*.55;if(M.life[i]>1){M.life[i]-=1;M.a[i]=Math.random()*6.28;M.r[i]=.1+Math.random()*.22}
    const t=M.life[i],a=M.a[i]+t*2.2,r=M.r[i]*(1+t*.6);p[i*3]=Math.cos(a)*r;p[i*3+1]=-.12+t*.65;p[i*3+2]=Math.sin(a)*r;
    const b=Math.sin(t*Math.PI),c=M.hue[i]?FLAN_M:FLAN_G;col[i*3]=c.r*b;col[i*3+1]=c.g*b;col[i*3+2]=c.b*b}
  M.pts.geometry.attributes.position.needsUpdate=true;M.pts.geometry.attributes.color.needsUpdate=true}
function flanLift(){try{return riding&&mModel&&mModel.seat?mModel.seat[0]-.5:0}catch(_){return 0}}
{const f=atmos;atmos=function(dt,now){f.apply(this,arguments);try{
  const want=!!(typeof LANT!='undefined'&&LANT.visible)&&!inRealm&&!inDun;if(typeof LANT!='undefined')LANT.visible=false;
  const d=Math.min(.05,Math.max(0,dt||.016));FLAN.root.visible=want;
  if(!want){FLAN.on=false}else{flanTint(FLAN,ZALC);flanStep(FLAN,pl,flanLift(),d,now);flanMotes(FLAN,d);torch.position.copy(FLAN.pos)}
  flanPeers(d,now)}catch(err){if(!FLAN.err){FLAN.err=1;console.warn('floating lantern',err)}}}}
// co-op: other heroes in lantern zones get one too (no extra light, to keep the frame cheap)
function flanPeers(dt,now){const live=new Set();
  try{if(typeof MP!='undefined'&&MP.rh&&!inRealm&&!inDun)for(const k in MP.rh){const r=MP.rh[k],m=r&&r.m;if(!m||!m.parent)continue;
    const reg=regionAt(Math.round(m.position.x),Math.round(m.position.z)),Z=typeof ZATM!='undefined'&&ZATM[reg<0?'town':reg];if(!Z||!Z.lan)continue;
    let L=FLANR.get(m);if(!L){L=flanMake(false);FLANR.set(m,L)}live.add(m);L.root.visible=true;flanTint(L,FLAN_C.setHex(Z.lc||0xffc070));flanStep(L,m,0,dt,now)}}catch(_){}
  FLANR.forEach((L,m)=>{if(!live.has(m)){if(!m.parent){scene.remove(L.root);FLANR.delete(m)}else{L.root.visible=false;L.on=false}}})}
