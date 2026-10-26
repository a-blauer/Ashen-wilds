// ================= v151: the intro, part two: Duskhold =================
// After the rat becomes an upright, the light clears on the real Duskhold. The game loop stays paused (IC151.on) while
// ic151Dusk(S,t) drives the game scene itself: the hero walks a precomputed path (spawn → Stronghold Steward →
// Blacksmith → Innkeeper → Merchant → out of the south gate → down Portal Road to a Cheddar waiting at the crossroads),
// then a mysterious voice (text only) speaks over the town and over each of the six portals (a faint picture of that
// zone's Sovereign, the zone's name in its title-card lettering), and the camera settles behind the hero: the game
// begins at the crossroads, looking down Portal Road. Every frame is a function of t (tests render it like part one).
// The game's own canvas is shown full-screen with the HUD hidden (body.ic151d) and handed back afterwards.
Object.assign(IC151,{len:130.2,skipT:128.4,dEnd:129.8,lbA:128.4,lbB:129.8});
IC151.lines=IC151.lines.concat([
  {a:95.2,b:98.8,s:'Greetings, Upright. You’ve been sent here for a purpose.'},
  {a:99.2,b:102.8,s:'Rebuild this town… and kill your way to glory.'},
  {a:103.2,b:115.9,s:'Through each portal lies a great beast, harnessing immense amounts of essence.'},
  {a:116.6,b:119.6,s:'It is your duty to claim that essence.'},
  {a:120.2,b:125.2,s:'Succeed, and the bounty is eternal — as well as the mountains of treasure you’ll gain along the way.'},
  {a:125.8,b:129,s:'Go forth, Upright… your quest starts now.'}]);
// the shot list (start times); the portal shots are 6 × 2.1 s from 103.2
var IC151D={arr:[55.9,60.2],meets:[[63.6,66.2],[70.2,72.8],[76.0,78.6],[81.6,84.2]],walks:[[60.2,63.6],[66.2,70.2],[72.8,76.0],[78.6,81.6],[84.2,87.8],[87.8,91.2]],ched:[91.2,95],
  v1:[95,99.1],v2:[99.1,103.2],v3:103.2,v3d:2.1,v4:[115.8,120],v5:[120,125.7],v6:[125.7,129.8],
  npc:[{k:'steward',n:'The Stronghold Steward',r:'Builds and grows Duskhold'},{k:'inn',n:'The Innkeeper',r:'Rest and a hot meal at The Last Lantern'},
    {k:'smith',n:'The Blacksmith',r:'Forges and upgrades your gear'},{k:'merchant',n:'The Merchant',r:'Buys and sells at the Trading Post'}],
  ched:[91.2,95]};

function ic151DCss(){if(document.getElementById('ic151dcss'))return;const s=document.createElement('style');s.id='ic151dcss';s.textContent=
  'body.ic151d #stage{position:fixed!important;inset:0!important;width:auto!important;height:auto!important;margin:0!important;border:0!important;border-radius:0!important;z-index:2147482000!important;max-width:none!important;max-height:none!important;aspect-ratio:auto!important}'+
  'body.ic151d #stage>*:not(#gl){visibility:hidden!important}'+
  '#ic151 .nc{position:absolute;left:5vw;bottom:calc(11vh + 4vh);z-index:5;pointer-events:none;opacity:0;font-family:"Cinzel",Georgia,serif;color:#f6e7c4;text-shadow:0 2px 8px #000,0 0 18px rgba(0,0,0,.8)}'+
  '#ic151 .nc b{display:block;font:700 clamp(18px,2.4vw,30px)/1.1 "Cinzel",Georgia,serif;letter-spacing:.06em}#ic151 .nc i{display:block;margin-top:4px;font:italic clamp(13px,1.4vw,18px)/1.2 Georgia,serif;color:#e8dcc4}'+
  '#ic151 .nc:before{content:"";display:block;width:52px;height:2px;margin-bottom:8px;background:linear-gradient(90deg,#fb923c,transparent)}'+
  '#ic151 .zc{position:absolute;left:0;right:0;top:calc(11vh + 3vh);z-index:5;text-align:center;pointer-events:none;opacity:0}'+
  '#ic151 .zc .zk{font:600 clamp(11px,1.1vw,14px)/1 "Cinzel",Georgia,serif;letter-spacing:.32em;text-transform:uppercase;color:#f4ecdc;opacity:.85;text-shadow:0 2px 6px #000}'+
  '#ic151 .zc .zt{margin-top:8px;font-size:clamp(28px,4.8vw,62px);line-height:1.05;letter-spacing:.04em}'+
  '#ic151 .zc .zs{margin-top:8px;font:italic clamp(13px,1.4vw,18px)/1.2 Georgia,serif;color:#f4ecdc;text-shadow:0 2px 6px #000}'+
  '#ic151 .sov{position:absolute;left:50%;top:50%;width:min(62vh,52vw);height:min(62vh,52vw);transform:translate(-50%,-46%);z-index:4;pointer-events:none;opacity:0;mix-blend-mode:screen;filter:blur(.6px) saturate(1.2)}'+
  '#ic151 .sov img{width:100%;height:100%;object-fit:contain;-webkit-mask-image:radial-gradient(circle at 50% 46%,#000 32%,transparent 70%);mask-image:radial-gradient(circle at 50% 46%,#000 32%,transparent 70%)}';document.head.appendChild(s)}

// ---------------- set-up (at build): where everyone stands, the hero's path, Cheddar, the light, the Sovereigns ----------------
function ic151DuskInit(S){if(typeof TOWNS=='undefined'||typeof pl=='undefined')return null;const V=THREE.Vector3,D={on:false},T0=TOWNS[0];
  // the town folk: Steward and Blacksmith have handles; the Merchant and the Innkeeper are the town-folk rigs nearest their counters
  const folk=[];T0.g.traverse(o=>{if(o.bones&&o.children&&o.children.some(c=>c.isSprite))folk.push(o)});T0.g.updateMatrixWorld(true);
  const near=(x,z)=>{let b=null,bd=1e9;folk.forEach(g=>{const p=g.getWorldPosition(new V()),d=Math.hypot(p.x-x,p.z-z);if(d<bd){bd=d;b=g}});return bd<6?b:null};
  const G={steward:typeof SHM!='undefined'&&SHM.st&&SHM.st.g,smith:typeof TWN100_S!='undefined'&&TWN100_S.npc&&TWN100_S.npc.smith,inn:near(27.2,271),merchant:near(40,270.95)};
  const C=new V(40,0,286);D.npc=IC151D.npc.map((n,i)=>{const g=G[n.k];if(!g)return null;g.updateMatrixWorld(true);let rig=g;if(!g.bones){g.traverse(o=>{if(o.bones&&rig===g)rig=o})}const w=rig.getWorldPosition(new V());
    const u=C.clone().sub(w).setY(0).normalize(),st=n.k==='inn'?w.clone().add(new V(-.3,0,2.6)):w.clone().addScaledVector(u,n.k==='smith'?2.3:1.95);return Object.assign({},n,{g:rig,w,st:[st.x,st.z],ry0:rig.rotation.y,mt:IC151D.meets[i]})});
  if(D.npc.some(n=>!n))D.npc=D.npc.filter(n=>n);
  // the path: walk legs between the stops (eased in and out), a cut from outside the south gate to Portal Road
  const sp=[START[0],START[1]],npcSt=D.npc.map(n=>n.st),M=D.npc,W=IC151D.walks,legs=[];
  const route=[[sp,[33.5,291.6],npcSt[0]],[npcSt[0],[28.2,284],[27.6,278.2],npcSt[1]],[npcSt[1],[28.0,278.4],[28.6,281.2],[31.0,282.3],npcSt[2]],[npcSt[2],[35.9,281.0],[36.4,276.4],npcSt[3]],[npcSt[3],[43.6,277.4],[43.65,288.4],[41.3,294.8],[40.2,301.5]],[[40,334],[40,349.4]]];
  for(let i=0;i<W.length&&i<route.length;i++)legs.push({a:W[i][0],b:W[i][1],pts:route[i]});D.legs=legs;D.ched=[40,353.5];D.end=[40,349.4];
  // the hero's track at 60 Hz: position, heading (spring-damped, snapped at the cut), moving or not
  const look=(t)=>{for(const n of M)if(t>=n.mt[0]-.2&&t<n.mt[1])return Math.atan2(n.w.x-ic151DPos(D,t)[0],n.w.z-ic151DPos(D,t)[1]);if(t>=IC151D.walks[5][1]-.3)return 0;return null};
  const DT=1/60,TA=IC151D.arr[0],TB=IC151.dEnd+.2,N=Math.ceil((TB-TA)/DT)+1,A=new Float32Array(N*4);let yaw=Math.PI,yv=0,lp=ic151DPos(D,TA),ad=a=>Math.atan2(Math.sin(a),Math.cos(a));
  for(let i=0;i<N;i++){const t=TA+i*DT,p=ic151DPos(D,t),vx=(p[0]-lp[0])/DT,vz=(p[1]-lp[1])/DT,spd=i?Math.hypot(vx,vz):0;lp=p;let tg=look(t);
    if(tg==null)tg=spd>.15?Math.atan2(vx,vz):(t<IC151D.walks[0][0]?Math.PI+.35*Math.sin((t-TA)*.9)*ic151Sm(ic151K(t,57,58.5)):yaw);
    if(Math.abs(t-IC151D.walks[5][0])<DT*.6){yaw=0;yv=0}
    yv+=(81*ad(tg-yaw)-2*.95*9*yv)*DT;yaw+=yv*DT;A.set([p[0],p[1],yaw,spd>.12?1:0],i*4)}
  D.trk={TA,DT,N,A};
  // a Cheddar for the crossroads (the game's own two stay in the field instances)
  try{const ch=chd132Model({game:true});ch.root.scale.setScalar(typeof CHQ132_SC!='undefined'?CHQ132_SC:1.1);ch.root.userData.psNo=1;ch.root.userData.noFarCull=1;ch.root.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;o.frustumCulled=false}});
    ch.root.position.set(D.ched[0],GH(D.ched[0],D.ched[1]),D.ched[1]);ch.root.rotation.y=Math.PI;D.ch=ch}catch(e){console.warn('intro cheddar',e)}
  // the pillar of light he arrives in
  {const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{uA:{value:0},uT:{value:0}},
      vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform float uA,uT;varying vec2 vU;void main(){float f=smoothstep(1.,.0,vU.y)*smoothstep(0.,.08,vU.y),s=.75+.25*sin(vU.x*40.+uT*3.);gl_FragColor=vec4(vec3(.8,.88,1.)*f*s*uA,1.);}'});
    D.pil=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.4,26,32,1,true),m);D.pil.geometry.translate(0,13,0);D.pil.userData.psNo=1;D.pil.userData.noFarCull=1;D.pil.frustumCulled=false}
  // the portals and their Sovereigns
  D.gates=(typeof TWN100_PG!='undefined'?TWN100_PG:[]).map((g,i)=>({i,x:g.x,z:g.y,a:g.a,Z:typeof ZT116!='undefined'&&ZT116.Z?ZT116.Z[i]:null,boss:typeof BOSSES!='undefined'&&BOSSES[i]?BOSSES[i]:null,zone:typeof PMAP!='undefined'&&PMAP[i]?PMAP[i].n:''}));
  if(IC151.cap)ic151SovFaces();
  S.D=D;return D}
// the hero's position on the path at time t
function ic151DPos(D,t){const L=D.legs;if(!L.length)return [START[0],START[1]];if(t<L[0].a)return L[0].pts[0].slice();
  for(let i=0;i<L.length;i++){const g=L[i];if(t<g.a)return L[i-1].pts[L[i-1].pts.length-1].slice();if(t<=g.b){const P=g.pts;let tot=0;const sl=[];for(let j=1;j<P.length;j++){const l=Math.hypot(P[j][0]-P[j-1][0],P[j][1]-P[j-1][1]);sl.push(l);tot+=l}
      const u=ic151K(t,g.a,g.b),r=.22,e=u<r?u*u/(2*r*(1-r)):u>1-r?1-(1-u)*(1-u)/(2*r*(1-r)):(u-r/2)/(1-r);let s=e*tot;
      // corners are rounded: walk a Catmull-Rom through the points
      for(let j=0;j<sl.length;j++){if(s<=sl[j]||j==sl.length-1){const k=sl[j]?Math.min(1,s/sl[j]):1,p0=P[Math.max(0,j-1)],p1=P[j],p2=P[j+1],p3=P[Math.min(P.length-1,j+2)],k2=k*k,k3=k2*k;
          const cr=c=>.5*((2*p1[c])+(-p0[c]+p2[c])*k+(2*p0[c]-5*p1[c]+4*p2[c]-p3[c])*k2+(-p0[c]+3*p1[c]-3*p2[c]+p3[c])*k3);return [cr(0),cr(1)]}s-=sl[j]}}}
  const P=L[L.length-1].pts;return P[P.length-1].slice()}
function ic151DHero(D,t){const T=D.trk,f=Math.max(0,Math.min(T.N-1.001,(t-T.TA)/T.DT)),i=f|0,u=f-i,A=T.A,g=c=>A[i*4+c]*(1-u)+A[(i+1)*4+c]*u;
  let y0=A[i*4+2],y1=A[(i+1)*4+2];if(y1-y0>Math.PI)y1-=Math.PI*2;if(y0-y1>Math.PI)y1+=Math.PI*2;return {x:g(0),z:g(1),yaw:y0+(y1-y0)*u,mv:A[i*4+3]>.5||A[(i+1)*4+3]>.5}}
// the six Sovereigns' faces, rendered once off-screen (transparent PNGs)
function ic151SovFaces(){if(IC151.SF)return IC151.SF;const out=[];let rd=null;
  try{rd=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});rd.setPixelRatio(1);rd.setSize(360,360);rd.setClearColor(0,0);
    const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xc8d0ff,0x201028,.85));const k=new THREE.DirectionalLight(0xfff0e0,1.5);k.position.set(2,3,4);sc.add(k);const r2=new THREE.DirectionalLight(0x9a7aff,1.3);r2.position.set(-4,1.5,-2);sc.add(r2);
    const cam=new THREE.PerspectiveCamera(30,1,.05,800);
    for(let i=0;i<6;i++){let url=null;try{const B=SVB[i],R=svRig();B.build(R,null);svRest(R);svMerge(R);sc.add(R.root);R.root.updateMatrixWorld(true);
        const hj=R.J[B.headJ||'head']||R.root,hb=new THREE.Box3().setFromObject(hj),hp=hb.getCenter(new THREE.Vector3()),hs=Math.max(.3,hb.getSize(new THREE.Vector3()).length());
        const d=Math.max(1.2,hs*.62/Math.tan(15*Math.PI/180));cam.position.set(hp.x+d*.12,hp.y+d*.1,hp.z+d);cam.lookAt(hp);rd.render(sc,cam);url=rd.domElement.toDataURL('image/png');sc.remove(R.root)}catch(e){console.warn('intro sovereign face',i,e)}out.push(url)}}
  catch(e){console.warn('intro faces',e)}finally{try{if(rd){rd.dispose();rd.forceContextLoss()}}catch(_){}}IC151.SF=out;return out}

// ---------------- each frame ----------------
function ic151DStart(S){const D=S.D;if(!D||D.on)return D;D.on=true;ic151DCss();document.body.classList.add('ic151d');D.fov0=cam.fov;
  if(D.ch)scene.add(D.ch.root);if(D.pil){D.pil.position.set(START[0],GH(START[0],START[1]),START[1]);scene.add(D.pil)}
  if(!IC151.SF)ic151SovFaces();
  const el=S.dom&&S.dom.el;if(el&&!S.dom.nc){el.insertAdjacentHTML('beforeend','<div class="nc"><b></b><i></i></div><div class="sov"><img alt=""></div><div class="zc"><div class="zk"></div><div class="zt"></div><div class="zs"></div></div>');
    S.dom.nc=el.querySelector('.nc');S.dom.sov=el.querySelector('.sov');S.dom.zc=el.querySelector('.zc')}
  return D}
function ic151DCam(D,t,h){const V=THREE.Vector3,K=ic151K,Sm=ic151Sm,Io=ic151Io,gy=(x,z)=>GH(x,z),H=new V(h.x,gy(h.x,h.z),h.z),fw=new V(Math.sin(h.yaw),0,Math.cos(h.yaw)),sd=new V(fw.z,0,-fw.x),up=y=>new V(0,y,0);
  let p,l,fov=50,F=H.clone(),z=-1;const IV=IC151D;
  if(t<IV.arr[1]){const k=Io(K(t,IV.arr[0],IV.arr[1]));p=H.clone().addScaledVector(fw,2.4+4.2*k).addScaledVector(sd,.3+1.6*k).add(up(1.2+1.9*k));l=H.clone().add(up(1.15+.25*k));fov=46}
  else if(t>=IV.v1[0]){if(t<IV.v1[1]){const k=Io(K(t,IV.v1[0],IV.v1[1]));p=H.clone().add(new V(1.2+2*k,2.2+11*k,-4.5-9*k));l=H.clone().add(up(1.2)).lerp(H.clone().add(new V(0,0,38)),k);fov=52}
    else if(t<IV.v2[1]){const k=Sm(K(t,IV.v2[0],IV.v2[1]));p=new V(64-26*k,46+4*k,326-8*k);l=new V(40,2,288-4*k);F=new V(40,0,300);fov=50}
    else if(t<IV.v3+6*IV.v3d){const i=Math.min(5,Math.floor((t-IV.v3)/IV.v3d)),k=Sm(K(t-IV.v3-i*IV.v3d,0,IV.v3d)),G=D.gates[i];z=i;
      if(G){const P=new V(G.x,gy(G.x,G.z),G.z),a=new V(G.a[0],0,G.a[1]),dr=a.clone().sub(P).setY(0).normalize(),sv=new V(dr.z,0,-dr.x);p=P.clone().addScaledVector(dr,10.5-1.8*k).addScaledVector(sv,(i%2?-1:1)*2.6).add(up(3.0+.5*k));l=P.clone().add(up(2.5));F=P.clone().addScaledVector(dr,4)}
      else{p=H.clone().add(up(5));l=H.clone()}fov=48}
    else if(t<IV.v4[1]){const k=Sm(K(t,IV.v4[0],IV.v4[1]));p=H.clone().add(new V(.9+.4*k,.75+.15*k,2.9-.4*k));l=H.clone().add(up(1.35));fov=46}
    else if(t<IV.v5[1]){const k=Sm(K(t,IV.v5[0],IV.v5[1])),a=.95-1.6*k,c=H.clone().lerp(new V(D.ched[0],H.y,D.ched[1]),.35);p=c.clone().add(new V(Math.sin(a)*5.4,2.0+.4*k,Math.cos(a)*5.4));l=c.add(up(.9));fov=48}
    else{const k=Io(K(t,IV.v6[0],IV.v6[1]-.8)),a=.95-1.6,c=H.clone().lerp(new V(D.ched[0],H.y,D.ched[1]),.35),p0=c.clone().add(new V(Math.sin(a)*5.4,2.4,Math.cos(a)*5.4)),l0=c.clone().add(up(.9));
      const cy=Math.PI,cp=typeof camPitch!='undefined'?camPitch:.3,cd=typeof camDist!='undefined'?camDist:9.5,p1=new V(H.x+Math.sin(cy)*Math.cos(cp)*cd,H.y+1.1+Math.sin(cp)*cd,H.z+Math.cos(cy)*Math.cos(cp)*cd),l1=H.clone().add(up(1));
      p=p0.lerp(p1,k);l=l0.lerp(l1,k);fov=50+(58-50)*k}}
  else if(t>=IV.ched[0]){const C=new V(D.ched[0],gy(D.ched[0],D.ched[1]),D.ched[1]),dr=C.clone().sub(H).setY(0).normalize(),sv=new V(dr.z,0,-dr.x),k=Sm(K(t,IV.ched[0],IV.ched[1]));
    p=H.clone().addScaledVector(dr,-1.7+.35*k).addScaledVector(sv,1.0).add(up(1.35-.1*k));l=C.clone().add(up(.6));fov=44}
  else{let done=false;for(let i=0;i<D.npc.length;i++){const n=D.npc[i];if(t>=IV.walks[i][0]&&t<n.mt[0]){const N=n.w.clone(),dr=N.clone().sub(H).setY(0),dd=dr.length();dr.normalize();const sv=new V(dr.z,0,-dr.x),k=Sm(K(dd,1.9,6));
        if(i<2){p=H.clone().addScaledVector(dr,-1.9-1.4*k).addScaledVector(sv,-1.15).add(up(1.75+.5*k));l=N.clone().add(up(1.45)).lerp(H.clone().add(up(1.2)),.25*k);fov=44+4*k}
        else{// locked-off cameras on open ground that pan with him: the tavern corner → the smithy front, the lane → the Trading Post
          const P=i===2?[26.0,283.6,2.3]:[43.7,274.7,2.0];p=new V(P[0],gy(P[0],P[1])+P[2],P[1]);l=H.clone().add(up(1.15));fov=i===2?40:46}
        done=true;break}
      if(t>=n.mt[0]&&t<n.mt[1]){const N=n.w.clone(),dr=N.clone().sub(H).setY(0).normalize(),sv=new V(dr.z,0,-dr.x),k=Sm(K(t,n.mt[0],n.mt[1]));
        p=H.clone().addScaledVector(dr,-1.9+.3*k).addScaledVector(sv,(i%2?-1:1)*1.15).add(up(1.75));l=N.clone().add(up(1.45));fov=44;done=true;break}}
    if(!done){const w=IV.walks;if(t>=w[4][0]+2.1&&t<w[4][1]){p=new V(44.6,gy(44.6,309)+2.4,309);l=H.clone().add(up(1.1));fov=48}
      else if(t>=w[5][0]&&t<w[5][1]){p=new V(41.4,gy(41.4,356.5)+1.0,356.5);l=H.clone().add(up(1.05));fov=46}
      else{p=H.clone().addScaledVector(fw,-3.4).addScaledVector(sd,.9).add(up(2.0));l=H.clone().addScaledVector(fw,3).add(up(1.1));fov=50}}}
  p.y=Math.max(p.y,gy(p.x,p.z)+.5);return {p,l,fov,F,z,nf:z>=0||(t>=IV.v2[0]&&t<IV.v2[1])}}
function ic151Dusk(S,t){const D=ic151DStart(S);if(!D)return;const now=2e6+t*1000,dt=Math.max(0,Math.min(.1,D.lt==null?0:t-D.lt)),K=ic151K,Sm=ic151Sm;D.lt=t;
  const h=ic151DHero(D,t);pl.position.set(h.x,GH(h.x,h.z),h.z);pl.rotation.y=h.yaw;pl.visible=true;try{animHero(now,h.mv)}catch(e){}
  // the town folk turn to greet him
  D.npc.forEach(n=>{const k=Sm(K(t,n.mt[0]-.5,n.mt[0]+.4))*(1-Sm(K(t,n.mt[1]-.1,n.mt[1]+.7)));let a=Math.atan2(h.x-n.w.x,h.z-n.w.z)-n.ry0;a=Math.atan2(Math.sin(a),Math.cos(a));n.g.rotation.y=n.ry0+a*k});
  // Cheddar: pops up as the hero comes down the road, waves while they meet
  if(D.ch){const C=D.ch,ps=t>=IC151D.ched[0]&&t<IC151D.ched[0]+2.6?'wave':t>=IC151D.walks[5][0]+1.8&&t<IC151D.ched[0]?'alert':'idle';if(ps!==D.chp){try{C.setPose(ps)}catch(_){}D.chp=ps}
    const y=GH(D.ched[0],D.ched[1]),hop=Math.max(0,Math.sin(ic151K(t,IC151D.walks[5][0]+1.6,IC151D.walks[5][0]+2.1)*Math.PI))*.25;C.root.position.y=y+hop;C.root.rotation.y=Math.atan2(h.x-D.ched[0],h.z-D.ched[1]);try{C.update(t,dt)}catch(_){}}
  const c=ic151DCam(D,t,h);cam.position.copy(c.p);cam.up.set(0,1,0);cam.lookAt(c.l);cam.fov=c.fov;cam.updateProjectionMatrix();if(typeof look!='undefined')look.copy(c.l);
  try{compTick(dt,now)}catch(_){}
  const F=c.F;try{townTick(now,F);townLights(F)}catch(_){}ic151DTags(D,false);WIND.t.value=now/1000;
  const sv=pl.position.clone();try{pl.position.set(F.x,GH(F.x,F.z),F.z);chunkVis();atmos(dt,now)}catch(_){}finally{pl.position.copy(sv)}
  try{torch.position.set(pl.position.x,pl.position.y+2.2,pl.position.z+.3);pln.constant=-pl.position.y}catch(_){}
  FADE.cam.value.copy(cam.position);if(c.nf)FADE.pl.value.copy(cam.position);else FADE.pl.value.set(h.x,GH(h.x,h.z)+1.1,h.z);try{fxStep(dt)}catch(_){}
  if(D.pil){const a=(1-Sm(K(t,56.4,59.2)));D.pil.visible=a>.01;D.pil.material.uniforms.uA.value=a*.85;D.pil.material.uniforms.uT.value=t}
  ic151DDom(S,D,t,c);POST.render()}
// cards: the folk's names, the zone cards, the Sovereigns' faces
function ic151DDom(S,D,t,c){const M=S.dom;if(!M||!M.nc)return;const K=ic151K,Sm=ic151Sm;let nk=0,nn=null;
  D.npc.forEach(n=>{const k=Sm(K(t,n.mt[0]+.25,n.mt[0]+.8))*(1-Sm(K(t,n.mt[1]-.6,n.mt[1]-.1)));if(k>nk){nk=k;nn=n}});
  {const k=Sm(K(t,IC151D.ched[0]+.3,IC151D.ched[0]+.85))*(1-Sm(K(t,IC151D.ched[1]-.6,IC151D.ched[1]-.1)));if(k>nk){nk=k;nn={n:'Cheddar',r:'A curious mouse with work for brave paws'}}}
  if(nn&&M.nc.dataset.n!==nn.n){M.nc.dataset.n=nn.n;M.nc.querySelector('b').textContent=nn.n;M.nc.querySelector('i').textContent=nn.r}M.nc.style.opacity=nk.toFixed(3);M.nc.style.transform='translateX('+((1-nk)*-14).toFixed(1)+'px)';
  const z=c.z,G=z>=0?D.gates[z]:null;if(G){const u=t-IC151D.v3-z*IC151D.v3d,k=Sm(K(u,.15,.65))*(1-Sm(K(u,IC151D.v3d-.45,IC151D.v3d-.05)));
    if(M.zc.dataset.i!=z){M.zc.dataset.i=z;const Z=G.Z||{c1:'#f6dc98',c2:'#fb923c',c3:'#1a1008',f:'Cinzel Decorative'},tt=M.zc.querySelector('.zt');
      M.zc.querySelector('.zk').textContent='Gate '+['I','II','III','IV','V','VI'][z];tt.textContent=G.zone;tt.style.fontFamily="'"+Z.f+"','Cinzel',Georgia,serif";tt.style.color=Z.c1;
      tt.style.textShadow='0 0 18px '+Z.c2+',0 0 36px '+Z.c2+'88,0 3px 0 '+Z.c3+',0 5px 10px #000';M.zc.querySelector('.zs').textContent=G.boss?G.boss.name+' · '+G.boss.title:'';
      const img=M.sov.querySelector('img'),src=(IC151.SF||[])[z];if(src)img.src=src;else img.removeAttribute('src');M.sov.style.filter='blur(.6px) saturate(1.2) drop-shadow(0 0 40px '+Z.c2+')'}
    M.zc.style.opacity=k.toFixed(3);M.zc.style.letterSpacing=((1-k)*.12).toFixed(3)+'em';const fk=Sm(K(u,.1,.9))*(1-Sm(K(u,IC151D.v3d-.7,IC151D.v3d)));M.sov.style.opacity=(fk*.42).toFixed(3);M.sov.style.transform='translate(-50%,-46%) scale('+(1.04-.04*Sm(K(u,0,IC151D.v3d))).toFixed(3)+')'}
  else{M.zc.style.opacity='0';M.sov.style.opacity='0'}}
// hand the town back: the hero at the crossroads facing down Portal Road, the camera behind him, nothing of ours left
// the floating name tags and markers (text sprites) over the town folk: hidden while the cinematic runs, put back after
function ic151DTags(D,back){if(back){(D.tags||[]).forEach(x=>{x.o.visible=x.v});D.tags=null;return}
  if(!D.tags){D.tags=[];const V=THREE.Vector3,w=new V();scene.traverse(o=>{if(!o.isSprite||!o.material||!o.material.map||!o.material.map.isCanvasTexture)return;o.getWorldPosition(w);if(Math.hypot(w.x-40,w.z-305)<80)D.tags.push({o,v:o.visible})})}
  D.tags.forEach(x=>{x.o.visible=false})}
function ic151DuskDone(S){const D=S&&S.D;if(!D||D.done)return;D.done=true;try{document.body.classList.remove('ic151d');
    if(D.on){const P=D.end;pl.position.set(P[0],GH(P[0],P[1]),P[1]);pl.rotation.y=0;camYaw=Math.PI;cam.fov=D.fov0||58;cam.updateProjectionMatrix();if(typeof camK!='undefined')camK=camPitch;snapCam()}
    ic151DTags(D,true);D.npc.forEach(n=>{n.g.rotation.y=n.ry0});if(D.ch&&D.ch.root.parent)D.ch.root.parent.remove(D.ch.root);if(D.pil&&D.pil.parent){D.pil.parent.remove(D.pil);D.pil.geometry.dispose();D.pil.material.dispose()}
    if(D.ch)D.ch.root.traverse(o=>{if(o.isMesh&&o.geometry)o.geometry.dispose()})}catch(e){console.warn('intro town hand-back',e)}}
// part one ends at IC151.cut; part two runs to IC151.dEnd, then the game resumes; the intro ends at IC151.len
ic151Seek=function(t){const S=IC151.S;if(!S)return;
  if(t<IC151.cut){IC151.on=true;try{ic151Frame(S,t)}catch(e){console.warn('intro frame',e);IC151.err=String(e&&e.stack||e);t=IC151.cut}}
  else if(t<IC151.dEnd&&S.D&&!S.D.done){IC151.on=true;try{ic151Dusk(S,t)}catch(e){console.warn('intro town',e);IC151.err=String(e&&e.stack||e);ic151DuskDone(S);t=Math.max(t,IC151.dEnd)}}
  if(t>=IC151.cut&&(t>=IC151.dEnd||!S.D||S.D.done)){if(IC151.on){IC151.on=false;try{ic151DuskDone(S)}catch(_){}try{if(IC151.live&&IC151.live.mu&&typeof muVol=='function')muVol()}catch(_){}try{if(typeof K!='undefined')for(const k in K)K[k]=false}catch(_){}}}
  ic151Dom(S,t);if(t>=IC151.len)ic151End()};
{const f=ic151Build;ic151Build=function(){const S=f.apply(this,arguments);try{ic151DuskInit(S)}catch(e){console.warn('intro town set-up',e);S.D=null}if(!S.D){IC151.len=59.4;IC151.dEnd=IC151.cut;IC151.skipT=55;IC151.lbA=56.6;IC151.lbB=58.4}return S}}
{const f=ic151End;ic151End=function(){try{if(IC151.S)ic151DuskDone(IC151.S)}catch(_){}return f.apply(this,arguments)}}
// the score goes on: a warm town theme for the walk, the voice's low drone and choir, a toll for every portal, the resolve
{const f=ic151Score;ic151Score=function(ac,out,T0){f.apply(this,arguments);try{ic151ScoreD(ac,out,T0)}catch(e){console.warn('intro score 2',e)}}}
function ic151ScoreD(ac,out,T0){const T=x=>T0+x,G=v=>{const g=ac.createGain();g.gain.value=v||0;return g};
  const rv=ac.createConvolver(),IR=ac.createBuffer(2,ac.sampleRate*3.2,ac.sampleRate);for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.4)}rv.buffer=IR;const wet=G(.5);rv.connect(wet);wet.connect(out);
  const osc=(type,f,a,dur,pk,at,rel,o)=>{o=o||{};const s=ac.createOscillator();s.type=type;s.frequency.setValueAtTime(f,T(a));if(o.f2)s.frequency.exponentialRampToValueAtTime(o.f2,T(a+(o.ft||dur)));if(o.det)s.detune.value=o.det;
    const g=G(0);g.gain.setValueAtTime(0,T(a));g.gain.linearRampToValueAtTime(pk,T(a+at));g.gain.setValueAtTime(pk,T(a+Math.max(at,dur-rel)));g.gain.linearRampToValueAtTime(0,T(a+dur));let n=g;s.connect(g);
    if(o.lp){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;g.connect(fl);n=fl}const d=G(o.dry==null?1:o.dry);n.connect(d);d.connect(out);if(o.wet){const w=G(o.wet);n.connect(w);w.connect(rv)}s.start(T(a));s.stop(T(a+dur+.05))};
  // arrival: a bright chord out of the light
  [523.25,659.25,783.99,1046.5].forEach((f,i)=>osc('sine',f,56,4.5,.03,.6,3.2,{wet:1.2,dry:.5}));
  // the town: a gentle lute-like figure over a warm drone (D major), the walk
  [146.83,220,293.66].forEach(f=>osc('triangle',f,57,37.4,.014,4,4,{lp:900,wet:.6}));
  const mel=[[0,587.33],[.45,659.25],[.9,739.99],[1.35,880],[2.4,739.99],[2.85,659.25],[3.3,587.33],[4.4,493.88],[4.85,554.37],[5.3,587.33],[6.6,659.25],[7.05,587.33],[7.5,554.37],[7.95,493.88]];
  for(let r=0;r<5;r++)mel.forEach(([d,f],j)=>{const a=59.5+r*8.6+d;if(a>92.4)return;osc('triangle',f,a,.6,.028,.008,.5,{lp:2600,wet:.5});if(j%3==0)osc('sine',f/2,a,.9,.02,.01,.8,{wet:.3})});
  // Cheddar's squeak
  osc('sine',3800,IC151D.ched[0]+.2,.14,.04,.01,.08,{f2:5200,wet:.4});osc('sine',4200,IC151D.ched[0]+.45,.12,.035,.01,.07,{f2:3600,wet:.4});
  // the voice: a low drone and a far choir under the words
  [73.42,110,146.83].forEach((f,i)=>osc('sawtooth',f,93.9,35,.03-i*.006,5,5,{lp:320,wet:.5,det:i*5}));
  [293.66,349.23,440,523.25].forEach((f,i)=>osc('sine',f,94.4+i*.4,34,.012,4,5,{wet:1.3,dry:.4,det:(i%2?6:-6)}));
  // a toll for every portal
  for(let i=0;i<6;i++){const a=IC151D.v3+i*IC151D.v3d+.05;osc('sine',[98,92.5,87.3,82.4,73.4,65.4][i],a,2.4,.22,.01,2.3,{wet:.8});osc('sine',[392,370,349,330,294,262][i],a,2,.03,.02,1.9,{wet:1})}
  // the resolve: "your quest starts now"
  [146.83,220,293.66,369.99,440,587.33].forEach((f,i)=>osc('triangle',f,125.8+i*.12,4.6,.024,1.2,2.6,{lp:2400,wet:1,dry:.6}))}
