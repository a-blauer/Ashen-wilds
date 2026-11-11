// ================= v219: living flames in campfires and braziers (owner, Nov 10 2026) =================
// Owner: "Make fires in campires and braziers flicker instead of being a static orange cone."
// The camps' fires (0250, 2270: campfires, braziers, torches, candles: the flame cones in CFL) were solid cones of glow colour, only
// stretched up and down ±12% (campTick); the themed braziers (s2_brazier in Searing Sands II, c_brazier in the Citadel: instanced
// decorations) and the baked fires of Searing Sands II's court and the Pilgrim's Stair (CY165.fires, TH165.fire) did not move at all.
// Now each of them burns with soft flame sprites (FL218): a tall licking outer flame in the fire's own colour and a bright core,
// each stretching, narrowing and leaning on its own uneven rhythm (a few sines at unrelated speeds per flame), the glow pulsing with
// it. A camp's cone is hidden and its flame takes its place (same colour, base and size); the others get a flame over the coals.
// Only flames near the camera move (FL218.near), and decoration flames show only near the camera and in the hero's own instance
// (sprites are not clipped to the instance like the world's materials). Purely visual: every screen draws its own, nothing to relay.
var FL218={on:true,L:[],near:55,far:70,ci:0,mats:{},tex:null,deco:null,t:0,err:0};
// a flame: a soft teardrop, white (the material tints it), brightest low in the middle
function fl218Tex(){if(FL218.tex)return FL218.tex;const Wd=48,Ht=96,c=document.createElement('canvas');c.width=Wd;c.height=Ht;const g=c.getContext('2d'),im=g.createImageData(Wd,Ht),D=im.data;
  const ss=(a,b,x)=>{x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)};
  for(let y=0;y<Ht;y++)for(let x=0;x<Wd;x++){const v=1-(y+.5)/Ht,u=((x+.5)/Wd-.5)*2,hw=v<.22?.5+2.2*v:Math.max(.001,(1-v)*1.24),r=Math.abs(u)/hw;
    const a=(1-ss(.35,1,r))*ss(0,.1,v)*(1-Math.pow(v,4))*(1-.35*v),i=(y*Wd+x)*4;D[i]=D[i+1]=D[i+2]=255;D[i+3]=Math.round(255*Math.max(0,Math.min(1,a)))}
  g.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);return FL218.tex=t}
function fl218Mat(col,op){const k=col+'|'+op;if(FL218.mats[k])return FL218.mats[k];
  const m=new THREE.SpriteMaterial({map:fl218Tex(),color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false});m.userData.evxS=1;m.userData.fxbS=1;return FL218.mats[k]=m}
// a flame of height h and width w with its base at (x,y,z) in parent p; col = its colour; returns its record
function fl218Add(p,x,y,z,h,w,col,o){o=o||{};const g=new THREE.Group();g.position.set(x,y,z);g.userData.lpsSkip=1;g.userData.fl218=1;
  const out=new THREE.Sprite(fl218Mat(col,.9)),core=new THREE.Sprite(fl218Mat(new THREE.Color(col).lerp(new THREE.Color(0xfff2c0),.65).getHex(),.95));
  [out,core].forEach(s=>{s.center.set(.5,.06);s.userData.lpsSkip=1;s.userData.kqsKeep=1;s.renderOrder=33;g.add(s)});
  out.scale.set(w,h,1);core.scale.set(w*.5,h*.55,1);p.add(g);
  const R={g,out,core,h,w,ph:Math.random()*100,sp:.85+Math.random()*.4,deco:!!o.deco,ins:o.ins,wx:o.wx,wz:o.wz};FL218.L.push(R);return R}
// the camps' cones: hidden, a flame in their place (their base, height and width, their colour)
function fl218Cones(){if(typeof CFL=='undefined')return;for(;FL218.ci<CFL.length;FL218.ci++){const f=CFL[FL218.ci];try{
    if(!f||!f.isMesh||!f.geometry||f.geometry.type!=='ConeGeometry'||f.userData.fl218)continue;
    if(!f.parent){fl218Orphan(f);continue}f.userData.fl218=1;f.userData.keep=1;
    const sy=f.userData.sy||f.scale.y,col=f.material&&f.material.color?f.material.color.getHex():0xff7a1a,h=sy*1.0*(f.geometry.parameters.height||1),w=f.scale.x*2*(f.geometry.parameters.radius||1);
    if(f.rotation.x||f.rotation.z)continue;   // a cone laid sideways is no flame
    const R=fl218Add(f.parent,f.position.x,f.position.y-h/2,f.position.z,h*1.55,w*1.9,col);R.cone=f;f.visible=false}catch(e){if(!FL218.err++)console.warn('v219 flame',e)}}}
// a cone already merged into its camp (camps built while the page loaded, before this file): it kept the world matrix it had when
// it was merged; the flame goes into the camp group it stood in, at that spot
function fl218Orphan(f){f.userData.fl218=1;const e=f.matrixWorld.elements;if(e[12]===0&&e[14]===0)return;const p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();f.matrixWorld.decompose(p,q,s);
  let C=null,bd=1e9;for(const c of (typeof CAMPS!='undefined'?CAMPS:[])){if(!c.g)continue;const d=Math.hypot(c.x-p.x,c.z-p.z);if(d<(c.r||14)+6&&d<bd){bd=d;C=c}}if(!C)return;
  const P=f.geometry.parameters||{},h=s.y*(P.height||1),w=s.x*2*(P.radius||1);C.g.updateMatrixWorld(true);const L=C.g.worldToLocal(new THREE.Vector3(p.x,p.y-h/2,p.z));
  fl218Add(C.g,L.x,L.y,L.z,h*1.55,w*1.9,f.material&&f.material.color?f.material.color.getHex():0xff7a1a)}
// the themed braziers (instanced decorations): a flame over each bowl, made the first time the hero is near
function fl218Deco(){if(FL218.deco)return;FL218.deco=[];try{const H={s2_brazier:[1.2,.6],c_brazier:[1.2,.55]};(WD&&WD.list||[]).forEach(d=>{const q=H[d.k];if(!q)return;const s=d.s||1;
    FL218.deco.push({x:d.x,z:d.z,y:GH(d.x,d.z)+q[0]*s,h:q[1]*s*1.7,w:.5*s*1.5,col:d.k==='c_brazier'?0xff8a3a:0xff7a2a,R:null})})}catch(e){console.warn('v219 deco flames',e)}}
function fl218Places(){const P=pl.position,I=insAt(Math.round(P.x),Math.round(P.z)),g=I?I.g:-1;
  (FL218.deco||[]).forEach(q=>{const near=Math.hypot(q.x-P.x,q.z-P.z)<FL218.far;if(near&&!q.R){q.R=fl218Add(scene,q.x,q.y,q.z,q.h,q.w,q.col,{deco:1});const J=insAt(Math.round(q.x),Math.round(q.z));q.R.ins=J?J.g:-2}
    if(q.R)q.R.g.visible=near&&q.R.ins===g});
  // Searing Sands II's court and the Pilgrim's Stair: their baked bowls (made with their scenery)
  try{if(typeof CY165!='undefined'&&CY165.g&&CY165.fires&&!CY165.fl218){CY165.fl218=1;CY165.fires.forEach(f=>fl218Add(CY165.g,f[0],f[1]-.12,f[2],.75,.5,0xff7a2a))}}catch(_){}
  try{if(typeof TH165!='undefined'&&TH165.fire&&TH165.g&&!TH165.fl218){TH165.fl218=1;TH165.fire.forEach(f=>fl218Add(TH165.g,f[0],f[1]-.12,f[2],.75,.5,0xff7a2a))}}catch(_){}}
// the flicker: a few sines at unrelated speeds per flame (stretch, narrow, lean); the core follows a little behind
function fl218Tick(dt,now){const t=now/1000,C=cam.position,N=FL218.near*FL218.near,v=FL218.v||(FL218.v=new THREE.Vector3());
  for(const R of FL218.L){const g=R.g;if(!g.parent||!g.visible)continue;g.getWorldPosition(v);if(v.distanceToSquared(C)>N)continue;
    const a=(t+R.ph)*R.sp,s1=Math.sin(a*7.3)*.5+Math.sin(a*11.9+1.3)*.3+Math.sin(a*17.7+2.1)*.2,s2=Math.sin(a*5.1+.7)*.6+Math.sin(a*13.3)*.4,s3=Math.sin(a*3.7+2)*.7+Math.sin(a*9.1)*.3;
    R.out.scale.set(R.w*(1-.12*s1),R.h*(1+.22*s2+.06*s1),1);R.out.position.x=R.w*.08*s3;
    R.core.scale.set(R.w*.5*(1-.1*s2),R.h*.55*(1+.16*s1),1);R.core.position.x=R.w*.04*s3}}
{const f=campTick;campTick=function(dt,now){const r=f.apply(this,arguments);if(!FL218.on)return r;try{fl218Cones();if(!FL218.deco&&typeof WD!='undefined'&&WD)fl218Deco();
    if((FL218.t+=dt)>.4){FL218.t=0;fl218Places()}fl218Tick(dt,now)}catch(e){if(!FL218.err++)console.warn('v219 flames',e)}return r}}
// The camp sites (2270 cs123Build, the v164 camps) merge every static mesh of a camp into one per colour (cs123Merge, cs164Merge), the flame
// cones included: that is why their fires stood still. Before the merge each flame cone of the camp is taken out of it (kept,
// hidden) and a living flame is put in its place.
function fl218Merge(f){return function(g){const L=[];try{if(FL218.on&&typeof CFL!='undefined'&&CFL.length){const S=new Set(CFL);g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),M=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();
    g.traverse(c=>{if(!c.isMesh||!S.has(c)||c.userData.fl218||!c.geometry||c.geometry.type!=='ConeGeometry')return;M.multiplyMatrices(inv,c.matrixWorld);M.decompose(p,q,s);
      const P=c.geometry.parameters||{},h=s.y*(P.height||1),w=s.x*2*(P.radius||1);L.push([p.x,p.y-h/2,p.z,h,w,c.material&&c.material.color?c.material.color.getHex():0xff7a1a]);c.userData.keep=1;c.userData.fl218=1;c.visible=false})}}catch(e){if(!FL218.err++)console.warn('v219 camp flames',e)}
  const r=f.apply(this,arguments);try{L.forEach(([x,y,z,h,w,col])=>fl218Add(g,x,y,z,h*1.55,w*1.9,col))}catch(e){if(!FL218.err++)console.warn('v219 camp flames',e)}return r}}
cs123Merge=fl218Merge(cs123Merge);if(typeof cs164Merge=='function')cs164Merge=fl218Merge(cs164Merge);
