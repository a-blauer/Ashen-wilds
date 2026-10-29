// ================= v169: see-through walls, the drawing passes (the shader half is 0061) =================
// What stands between the camera and the hero turns to glass: the surface at GH169.a opacity, what is behind it darkened to
// GH169.k (the inside of a house or a rock reads as black, not floors), characters behind it seen clearly. No dither anywhere.
// Each frame (POST.render, 0060):
//  1. the normal draw: every see-through material (userData.gh169, set by gh169Flag) leaves out its see-through pixels. While it
//     draws, each such mesh whose bounds reach the see-through zone joins layer GH169L (gh169Cand, from Mesh.onBeforeRender);
//     what is seen clearly through glass writes 1 into the stencil buffer: characters (hero, companions, monsters, partners, loot;
//     gh169Chars marks their materials), the ground and plants (0061 gh169Flag), water and the sky. Buildings and props stay 0.
//  2. POST.after: only the layer's meshes are drawn again (the rest of the scene is hidden for the walk): a depth pass (the nearest
//     see-through surface per pixel), then the colour pass twice: stencil != 1 with the dark inside (uGhK = GH169.k), stencil == 1
//     with k 1 (the hero, the ground round them, plants behind the glass show through at 1 - a). Blend: ONE, ONE_MINUS_SRC_ALPHA (premultiplied, 0061 tail).
//  3. Outside the instance you are in (its rectangle) the ground is black, and so is the cliff it drops off at the edge (0061,
//     3190 ghEdge); a black floor lies far under the instance (GH169C.vo) and the water stops at the edge, so the void past the
//     edge is black. With the camera out of the map (inside the rock or past the edge) the background fades to black too.
var GH169L=3,GH169C={live:0,pass:0,f:0,cand:[],top:new Set(),hid:[],mats:[],ct:0,vo:null,vk:null,st:{cand:0,passes:0,ms:0,skip:0}};
GH169.vy=-75;
// the mesh's bounds in the world (instanced meshes: all instances, cached; top = the highest instance's top, local y)
function gh169Sphere(o,out){const g=o.geometry;if(!g)return null;
  if(o.isInstancedMesh){let s=o.userData.gh169S;
    if(!s||s.n!==o.count){if(!g.boundingSphere)g.computeBoundingSphere();const a=o.instanceMatrix.array,n=o.count,c=new THREE.Vector3(),m=new THREE.Matrix4(),p=new THREE.Vector3();
      for(let i=0;i<n;i++){c.x+=a[i*16+12];c.y+=a[i*16+13];c.z+=a[i*16+14]}if(n)c.multiplyScalar(1/n);let r=0,top=-1e9;
      for(let i=0;i<n;i++){m.fromArray(a,i*16);p.copy(g.boundingSphere.center).applyMatrix4(m);const ri=g.boundingSphere.radius*m.getMaxScaleOnAxis();r=Math.max(r,p.distanceTo(c)+ri);top=Math.max(top,p.y+ri)}
      s=o.userData.gh169S={n,c,r,top}}
    out.c.copy(s.c).applyMatrix4(o.matrixWorld);const k=o.matrixWorld.getMaxScaleOnAxis();out.r=s.r*k;out.top=out.c.y+(s.top-s.c.y)*k;return out}
  if(!g.boundingSphere)g.computeBoundingSphere();out.c.copy(g.boundingSphere.center).applyMatrix4(o.matrixWorld);out.r=g.boundingSphere.radius*o.matrixWorld.getMaxScaleOnAxis();out.top=out.c.y+out.r;return out}
// can any pixel of this mesh be see-through? (a cone from the camera to the hero, GH169.R wide at the hero; a ball round the camera)
const GH169S={c:new THREE.Vector3(),r:0},GH169V=new THREE.Vector3(),GH169W=new THREE.Vector3();
function gh169Hit(o,fl){const s=gh169Sphere(o,GH169S);if(!s)return true;const C=FADE.cam.value,H=FADE.pl.value;
  if(fl!=null&&s.top<H.y+fl)return false;   // wholly below the material's floor rule (grass, paving): never see-through
  const ab=GH169V.copy(H).sub(C),L2=ab.lengthSq();if(L2<1e-4)return false;const L=Math.sqrt(L2),tc=GH169W.copy(s.c).sub(C).dot(ab)/L2,tr=s.r/L;
  if(s.c.distanceTo(C)-s.r<GH169.N[1])return true;
  if(tc+tr<=0||tc-tr>=.96)return false;
  const t=Math.min(1,Math.max(0,tc)),lat=GH169W.copy(C).addScaledVector(ab,t).distanceTo(s.c);
  return lat-s.r<GH169.R[1]*Math.min(1,tc+tr)+.5}
// fl: the lowest floor among the mesh's materials (null: one of them has none)
function gh169Cand(o){const C=GH169C,u=o.userData;if(u.gh169F===C.f)return;u.gh169F=C.f;const M=o.material;let g=0,all=0,fl;
  for(const m of Array.isArray(M)?M:[M])if(m&&m.userData.gh169){g=1;if(m.userData.gh169All)all=1;const f=m.userData.gh169Fl;
    fl=f==null||fl===null?null:fl===undefined?f:Math.min(fl,f)}
  if(fl===undefined)fl=null;
  if(!g||o.isSkinnedMesh){if(o.layers.mask&(1<<GH169L))o.layers.disable(GH169L);return}
  if(all||gh169Hit(o,fl)){o.layers.enable(GH169L);C.cand.push(o);let p=o;while(p.parent&&p.parent!==scene)p=p.parent;C.top.add(p)}
  else if(o.layers.mask&(1<<GH169L))o.layers.disable(GH169L)}
// in the ghost passes the see-through materials blend as premultiplied glass and write no stencil (a material that writes it
// would also reset the stencil test the colour passes rely on); put back after the passes
function gh169B1(m){if(!m||!m.userData.gh169||m.userData.gh169P===GH169C.f)return;m.userData.gh169P=GH169C.f;
  GH169C.mats.push([m,m.blending,m.blendSrc,m.blendDst,m.blendEquation,m.blendSrcAlpha,m.blendDstAlpha,m.blendEquationAlpha,m.stencilWrite]);
  m.blending=THREE.CustomBlending;m.blendSrc=THREE.OneFactor;m.blendDst=THREE.OneMinusSrcAlphaFactor;m.blendEquation=THREE.AddEquation;
  m.blendSrcAlpha=null;m.blendDstAlpha=null;m.blendEquationAlpha=null;m.stencilWrite=false}
THREE.Mesh.prototype.onBeforeRender=function(){const C=GH169C;if(C.live)gh169Cand(this);
  else if(C.pass){const M=this.material;if(Array.isArray(M))M.forEach(gh169B1);else gh169B1(M)}};
// characters, water and the sky write 1 into the stencil buffer wherever they are seen (every 0.25 s: new monsters, gear, mounts)
function gh169Mark1(o){if(!o.isMesh&&!o.isPoints&&!o.isLine&&!o.isSprite)return;const M=o.material;
  (Array.isArray(M)?M:[M]).forEach(m=>{if(m&&!m.userData.gh169)gh169Clear(m)})}
function gh169Chars(){const S=f135Skip();try{gh169Clear(SKY.material);gh169Clear(WTR.w.material);gh169Clear(WTR.l.material)}catch(_){}try{(typeof party!='undefined'?party:[]).forEach(c=>c&&c.m&&S.add(c.m))}catch(_){}
  try{(typeof comps!='undefined'?comps:[]).forEach(c=>c&&c.m&&S.add(c.m))}catch(_){}
  S.forEach(o=>{if(o&&o.traverse)o.traverse(gh169Mark1)})}
// the black floor under the instance you are in, and the rectangle past which the ground is black (the cliff it drops off at
// the edge is black too: 3190 ghEdge)
function gh169Void(){const C=GH169C,k=cvKey(),I=k>=0?INSL[k]:null,V=GH169.U.uGhV.value;
  if(k!==C.vk||!C.vo){C.vk=k;
    if(!C.vo){const o=C.vo=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0,fog:false}));
      o.name='gh169Void';o.userData.noFade135=1;o.userData.psNo=1;o.frustumCulled=false;o.castShadow=false;o.receiveShadow=false;scene.add(o)}
    const o=C.vo;o.visible=!!I;if(I){o.position.set(I.x0+I.w/2,GH169.vy,I.y0+I.h/2);o.scale.set(I.w+800,1,I.h+800)}
    o.updateMatrix();o.updateMatrixWorld(true)}
  if(!I){V.set(-1e6,-1e6,1e6,1e6);C.out=false;return}
  const c=FADE.cam.value;C.out=c.x<I.x0||c.z<I.y0||c.x>I.x0+I.w||c.z>I.y0+I.h;V.set(I.x0,I.y0,I.x0+I.w,I.y0+I.h)}
// The camera out of the map: inside the rock (below the ground under it: behind a wall step it stays where the player put it)
// or out past the instance's edge. Then the background (what shows under the map from in there) fades to black over
// GH169.fadeT s, and so does the glass (to fully clear, gh169K / uGhA), and back when the camera returns; the fade runs on the
// game's clock (homeTick).
GH169.fadeT=.35;
// with the camera out of the map what stands between it and the hero fades fully clear instead of turning to glass (from inside
// the wall the boulders lining it were stacked pale glass over the hero), and nothing behind is darkened
function gh169K(){const fd=GH169C.fade||0;return GH169.k+(1-GH169.k)*fd}
function gh169AwayTick(dt){const C=GH169C,c=FADE.cam.value;let u=false;try{u=c.y<GH(c.x,c.z)-.05}catch(_){}
  const away=GH169.on&&(u||!!C.out)&&!(typeof IC151!='undefined'&&IC151.on);C.under=u;
  C.fade=Math.max(0,Math.min(1,(C.fade||0)+(away?1:-1)*Math.min(.1,dt||0)/GH169.fadeT))}
{const f=homeTick;homeTick=function(dt){const r=f.apply(this,arguments);try{gh169AwayTick(dt)}catch(e){if(!GH169C.err3){GH169C.err3=1;console.warn('v169 fade',e)}}return r}}
// the water: never past the instance's edge (its sheet spans the void at sea level: from out there it was a pale sheet over all)
function gh169Water(){try{[WTR.w,WTR.l].forEach(o=>{const m=o&&o.material;if(!m||m.userData.gh169W)return;m.userData.gh169W=1;
  m.uniforms.uGhV=GH169.U.uGhV;m.uniforms.uGhOn=GH169.U.uGhOn;
  m.fragmentShader='uniform vec4 uGhV;uniform float uGhOn;\n'+m.fragmentShader.replace('void main(){','void main(){\n if(uGhOn>.5&&(vP.x<uGhV.x||vP.z<uGhV.y||vP.x>uGhV.z||vP.z>uGhV.w))discard;');m.needsUpdate=true})}catch(e){console.warn('v169 water',e)}}
function gh169Restore(){const C=GH169C;for(const q of C.mats){const m=q[0];m.blending=q[1];m.blendSrc=q[2];m.blendDst=q[3];m.blendEquation=q[4];m.blendSrcAlpha=q[5];m.blendDstAlpha=q[6];m.blendEquationAlpha=q[7];m.stencilWrite=q[8]}
  C.mats.length=0;for(const o of C.hid)o.visible=true;C.hid.length=0}
POST.after=function(){const C=GH169C;C.live=0;const n=C.cand.length;C.st.cand=n;
  if(!n||!GH169.on||!FX135ON.value||(typeof IC151!='undefined'&&IC151.on)){C.st.skip++;return}
  const t0=performance.now(),B=ren.state.buffers,U=GH169.U,ch=scene.children;
  for(let i=0;i<ch.length;i++){const o=ch[i];if(o.isLight){o.layers.enable(GH169L);continue}if(o.visible&&!C.top.has(o)){o.visible=false;C.hid.push(o)}}
  const bg=scene.background,ac=ren.autoClear,sa=ren.shadowMap.autoUpdate,sn=ren.shadowMap.needsUpdate,lm=cam.layers.mask;
  scene.background=null;ren.autoClear=false;ren.shadowMap.autoUpdate=false;ren.shadowMap.needsUpdate=false;cam.layers.set(GH169L);
  try{
    // 1. depth only: the nearest see-through surface per pixel
    U.uGhM.value=1;C.pass=1;B.color.setMask(false);B.color.setLocked(true);B.depth.setMask(true);B.depth.setLocked(true);
    B.stencil.setTest(false);B.stencil.setLocked(true);
    ren.render(scene,cam);
    // 2. colour: the glass over the dark inside (no character there), then over the characters (k 1)
    B.color.setLocked(false);B.color.setMask(true);B.color.setLocked(true);B.depth.setLocked(false);B.depth.setMask(false);B.depth.setLocked(true);
    B.stencil.setLocked(false);B.stencil.setTest(true);B.stencil.setMask(0);B.stencil.setOp(THREE.KeepStencilOp,THREE.KeepStencilOp,THREE.KeepStencilOp);
    B.stencil.setFunc(THREE.NotEqualStencilFunc,1,0xff);B.stencil.setLocked(true);
    U.uGhM.value=2;C.pass=2;U.uGhK.value=gh169K();ren.render(scene,cam);
    B.stencil.setFunc(THREE.EqualStencilFunc,1,0xff);U.uGhK.value=1;ren.render(scene,cam);
    C.st.passes++}
  catch(e){if(!C.err){C.err=1;console.warn('v169 see-through',e)}}
  finally{U.uGhM.value=0;U.uGhK.value=gh169K();C.pass=0;
    B.color.setLocked(false);B.color.setMask(true);B.depth.setLocked(false);B.depth.setMask(true);B.stencil.setLocked(false);B.stencil.setTest(false);B.stencil.setMask(0xff);
    scene.background=bg;ren.autoClear=ac;ren.shadowMap.autoUpdate=sa;ren.shadowMap.needsUpdate=sn;cam.layers.mask=lm;gh169Restore();C.st.ms=+(performance.now()-t0).toFixed(2)}};
{const f=POST.render;POST.render=function(){const C=GH169C,U=GH169.U;C.f++;C.cand.length=0;C.top.clear();
  try{const fd=C.fade||0;U.uGhA.value=GH169.a*(1-fd);U.uGhK.value=gh169K();if(GH169.on){U.uGhR.value.set(GH169.R[0],GH169.R[1]);U.uGhN.value.set(GH169.N[0],GH169.N[1])}
    else{U.uGhR.value.set(-2,-1);U.uGhN.value.set(-2,-1)}
    gh169Void();gh169Water();const now=performance.now();if(now-C.ct>250){C.ct=now;gh169Chars()}}catch(e){if(!C.err2){C.err2=1;console.warn('v169 setup',e)}}
  // out of the map the background fades to black with the view
  let bg=null;if(C.fade>0&&scene.background&&scene.background.isColor){bg=scene.background;scene.background=(C.bgc||(C.bgc=new THREE.Color())).copy(bg).multiplyScalar(1-C.fade)}
  C.live=1;try{return f.apply(this,arguments)}finally{C.live=0;if(bg)scene.background=bg}}}
