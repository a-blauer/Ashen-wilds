// ================= v229: the fountain's finale, part 3 of 3 — the cinematic (owner, Nov 13 2026) =================
// "Lets make a cinematic for when a player deposits the last boss' essence into the fountain. As they press the button to deposit
// have the cinematic start. It shows their character depositing the essence and then follows the essence down inside the fountain
// underneath the duskhold ... The gangly creature sips from the pool of essence and euphoria washes over him. His limbs and body
// contort into a more human version and he clothes himself in an elegant crimson robe with gold thread patterns. He then breaks an
// opening out of his den and ivory gangly wings emerge out of his back as he flies through the opening, arriving in duskhold. The
// cinematic will end and the man will be standing next to the fountain ... no terrain clipping into the camera and a focus on
// artistic camera work and detail."
// F at the fountain with the last Sovereign's essence (se208Pour of the last index) plays it instead of the plain pour; the essence
// is claimed (se208Claim) when the game is handed back, so nothing is lost if the page closes mid-way. Built like the arrival
// cinematics (3810): the main loop waits (IC151.on), fn229Frame(S,t) draws every frame from t, Skip / Esc / Enter / Space ends it.
//   a1 a2   Duskhold: the hero lifts the essence, it streams into the fountain, the camera follows it down into the basin
//   b1 b2   the fountain's throat (falling with the essence), then the den opens out below
//   c1-c3   the pool: a hand over the rim, eyes in the dark; he leans down and drinks; euphoria
//   d1-d3   he rears up in black fire and contorts into a man; nails and jaw draw in, hair comes; the crimson robe weaves itself on
//   e1-e3   he breaks the roof with a lance of black fire; ivory wings tear out of his back; he flies up into the light
//   f1-f4   Duskhold: the ground north of the fountain bursts, he climbs over the town, comes down beside the fountain, looks at you
// Afterwards he stands by the fountain for good (fn229Npc: whenever the last Sovereign is in bossDone). Seen flag x2.fn229.
// Local to each player, like the other cinematics (the partner sees the plain pour stream, and the man once their own last essence
// is poured). Off under test automation unless window.KQ_FN229; SET.intro 0 turns it off too. Settings → Cinematics can replay it.
Object.assign(FN229,{len:71.6,cut:69.2,skipT:69.2,npc:null,
  N:['a1','a2','b1','b2','c1','c2','c3','d1','d2','d3','e1','e2','e3','f1','f2','f3','f4'],
  T:{a1:0,a2:3.4,b1:7.8,b2:11.4,c1:16.2,c2:20.6,c3:25.4,d1:29.6,d2:35.8,d3:39.6,e1:45.0,e2:49.0,e3:52.0,f1:54.8,f2:58.4,f3:61.8,f4:65.8},
  // the Voice (the intro's subtitles). The owner will add more; these are short on purpose.
  lines:[{a:12.4,b:15.4,s:'The last of them…'},{a:17.4,b:20.2,s:'At long last.'},{a:27.0,b:29.2,s:'Yes…'},{a:41.6,b:44.6,s:'A thousand years of thirst… ended.'},{a:66.4,b:69.0,s:'You have done well, Upright.'}],
  mark:[0,3.4],man:[4.4,.2]});
function fn229Last(){return BOSSES.length-1}
function fn229Want(){try{if(FN229.run)return false;if(typeof IC151!='undefined'&&(IC151.run||IC151.on))return false;if(window.KQ_FN229)return true;if(window.AW_NOTITLE||navigator.webdriver)return false;
  if(typeof SET!='undefined'&&SET.intro===0)return false;return true}catch(_){return false}}

// ---------------- key poses (model units of the body that shows; 4000 explains the fields) ----------------
var FN229POSE={
  // the creature (his pelvis stands 1.63 high, his shoulders 2.16, his arms are 1.26 long)
  lurk:{pos:[0,-.98,-.8],pr:[.55,0,0],sp:[.42,0,0],ch:[.36,0,0],nk:[-.35,0,0],hd:[-.32,0,0],jaw:.1,fL:[-.36,0,-.35],fR:[.36,0,-.35],kL:[-.9,.5,.5],kR:[.9,.5,.5],hL:[-.56,0,.4],hR:[.5,.02,.3],eL:[-1,.7,-.3],eR:[1,.7,-.3]},
  crouch:{pos:[0,-1.0,-.35],pr:[.6,0,0],sp:[.42,0,0],ch:[.34,0,0],nk:[-.4,0,0],hd:[-.35,0,0],jaw:.2,fL:[-.36,0,.05],fR:[.36,0,.05],kL:[-.9,.5,.5],kR:[.9,.5,.5],hL:[-.58,0,.95],hR:[.58,0,.95],eL:[-1,.7,-.3],eR:[1,.7,-.3]},
  drink:{pos:[0,-1.27,.58],pr:[1.15,0,0],sp:[.5,0,0],ch:[.4,0,0],nk:[.3,0,0],hd:[-.45,0,0],jaw:.5,fL:[-.44,0,-.1],fR:[.44,0,-.1],kL:[-1,.5,.2],kR:[1,.5,.2],hL:[-.78,0,1.03],hR:[.78,0,1.03],eL:[-1,.9,-.2],eR:[1,.9,-.2]},
  bliss:{pos:[0,-.9,-.15],pr:[.1,0,0],sp:[-.12,0,0],ch:[-.3,0,0],nk:[-.3,0,.1],hd:[-.22,0,.08],jaw:1,fL:[-.38,0,.05],fR:[.38,0,.05],kL:[-.9,.5,.5],kR:[.9,.5,.5],hL:[-.9,.02,.6],hR:[.9,.02,.6],eL:[-1,.5,-.5],eR:[1,.5,-.5]},
  rear:{pos:[0,-.06,0],pr:[-.1,0,0],sp:[-.2,0,0],ch:[-.3,0,0],nk:[-.4,0,0],hd:[-.35,0,0],jaw:1,fL:[-.34,0,0],fR:[.34,0,0],kL:[-.3,0,1],kR:[.3,0,1],hL:[-1.5,3.0,-.1],hR:[1.5,3.0,-.1],eL:[-1,-.3,-.6],eR:[1,-.3,-.6]},
  clutch:{pos:[0,-.5,0],pr:[.2,0,0],sp:[.55,0,0],ch:[.5,0,0],nk:[.3,0,0],hd:[.3,0,0],jaw:.7,fL:[-.25,0,0],fR:[.25,0,0],kL:[-.3,0,1],kR:[.3,0,1],hL:[-.14,1.9,.55],hR:[.14,1.96,.55],eL:[-1,-.2,.1],eR:[1,-.2,.1]},
  // the man (pelvis 1.03, shoulders 1.45, wrists .88, the top of his head 1.82)
  clutchM:{pos:[0,-.3,0],pr:[.2,0,0],sp:[.5,0,0],ch:[.45,0,0],nk:[.3,0,0],hd:[.3,0,0],fL:[-.12,0,0],fR:[.12,0,0],hL:[-.08,1.1,.3],hR:[.08,1.14,.3],eL:[-1,-.2,.1],eR:[1,-.2,.1]},
  gaze:{pos:[0,-.02,0],sp:[.1,0,0],ch:[.08,.1,0],nk:[.2,.12,0],hd:[.1,.1,0],hR:[.2,1.44,.3],eR:[1,-.5,.1],wR:[-.3,2.6,0],hL:[-.28,.92,.06]},
  stand:{nk:[.06,0,0]},
  robe:{hL:[-.5,1.04,.12],hR:[.5,1.04,.12],eL:[-.6,0,-1],eR:[.6,0,-1],ch:[-.08,0,0],nk:[-.12,0,0]},
  cast:{hR:[.2,2.25,.16],eR:[1,0,.4],hL:[-.3,.93,0],ch:[-.18,0,-.05],nk:[-.4,0,0],hd:[-.25,0,0]},
  wings:{hL:[-.5,1.02,.16],hR:[.5,1.02,.16],eL:[-.6,0,-1],eR:[.6,0,-1],sp:[-.1,0,0],ch:[-.3,0,0],nk:[-.3,0,0],hd:[-.2,0,0]},
  coil:{pos:[0,-.2,0],sp:[.2,0,0],ch:[.1,0,0],fL:[-.12,0,.02],fR:[.12,0,-.02],kL:[-.2,0,1],kR:[.2,0,1],hL:[-.3,.78,.1],hR:[.3,.78,.1],nk:[-.5,0,0],hd:[-.3,0,0]},
  fly:{fL:[-.08,-.02,-.2],fR:[.09,-.04,-.3],ftL:.95,ftR:1.0,kL:[-.1,0,1],kR:[.1,0,1],hL:[-.44,.96,-.02],hR:[.44,.96,-.02],eL:[-.6,0,-1],eR:[.6,0,-1],ch:[-.15,0,0],nk:[-.1,0,0]},
  idle:{hL:[-.07,1.06,.2],hR:[.07,1.03,.21],eL:[-1,-.2,-.2],eR:[1,-.2,-.2],nk:[.04,0,0]}};

// ---------------- set-up ----------------
function fn229Build(o){o=o||{};const V=THREE.Vector3,T=TOWNS[0],S={o,ev:{},lt:null,den:null,hid:[],kids:null,t:0},y0=GH(T.cx,T.cy);S.T=T;S.y0=y0;
  S.save={p:pl.position.clone(),ry:pl.rotation.y,fov:cam.fov,near:cam.near,far:cam.far,yaw:typeof camYaw!='undefined'?camYaw:0,fogD:scene.fog.density,ex:POST.u.ex.value};
  // the side the cameras of the pour work from: whichever has the clearer view (buildings, decorations)
  S.sg=fn229Side(T,y0);
  // the hero steps to his mark before the fountain, facing it
  S.H=new V(T.cx+FN229.mark[0],y0,T.cy+FN229.mark[1]);pl.position.copy(S.H);pl.rotation.y=Math.PI;
  S.E=new V(T.cx-S.sg*3.2,y0,T.cy-7.2);S.M=new V(T.cx+FN229.man[0],y0,T.cy+FN229.man[1]);S.col=se208Col(fn229Last());
  // no words in the world, no companions or strollers in the way
  try{scene.traverse(q=>{if(q.isSprite&&q.visible&&q.material&&q.material.map&&q.material.map.isCanvasTexture){S.hid.push(q);q.visible=false}})}catch(_){}
  try{fols.forEach(f=>{if(f&&f.visible){S.hid.push(f);f.visible=false}})}catch(_){}
  try{CZ103.live.forEach(c=>{const g=c.g;if(!g||!g.visible)return;const d=Math.hypot(g.position.x-T.cx,g.position.z-T.cy);if(d>3&&d<14){S.hid.push(g);g.visible=false}})}catch(_){}
  if(FN229.npc&&FN229.npc.F.root.visible){S.hid.push(FN229.npc.F.root);FN229.npc.F.root.visible=false;if(FN229.npc.sh){S.hid.push(FN229.npc.sh);FN229.npc.sh.visible=false}}
  // the den and the figure
  const D=S.D=fn229Den();scene.add(D.g);const F=S.F=fn229Figure();D.g.add(F.root);S.at=new V(FN229D.at[0],fn229DenFloor(FN229D.at[0],FN229D.at[2]),FN229D.at[2]);F.root.position.copy(S.at);
  // the essence in the hero's hands, and the bead that sinks through the fountain and falls down the throat
  const orb=S.orb=new THREE.Group();orb.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.2,2),se208Iri({op:.95,glow:1.3,tint:S.col})));orb.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.36,1),se208Iri({op:.25,glow:.8,tint:S.col,add:1})));
  const om=se208Mist(30,{r:.3,h:.9,sz:.2,op:.9,spd:.3,seed:2296,add:1,up:.3});orb.add(om);se208Skip(orb);orb.visible=false;scene.add(orb);
  const bead=S.bead=new THREE.Group();bead.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.3,2),se208Iri({op:.96,glow:1.6,tint:S.col})));bead.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.62,1),se208Iri({op:.22,glow:1,tint:S.col,add:1})));
  const bt=se208Mist(40,{r:.25,h:5,sz:.34,op:.9,spd:.5,seed:2297,add:1,up:.2});bead.add(bt);se208Skip(bead);bead.visible=false;D.g.add(bead);
  // Duskhold's broken ground: the hole, the rock thrown up, the dust
  const hg=S.holeG=new THREE.Group();hg.position.copy(S.E);hg.visible=false;scene.add(hg);
  {const B=fn229Buf(),C=FN229DC;const disc=new THREE.Mesh(new THREE.CircleGeometry(2.3,11).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x020104}));disc.position.y=.05;disc.userData.lpsSkip=1;hg.add(disc);
    for(let i=0;i<15;i++){const a=i/15*6.2832,r=2.2*(.86+.3*fn229H(i,1,9));fn229Cone(B,[Math.sin(a)*(r+.5),.0,Math.cos(a)*(r+.5)],[-Math.sin(a)*.5,1,-Math.cos(a)*.5],.5+1.0*fn229H(i,2,9),.7,4,[.24,.22,.27],[.14,.13,.17])}
    const m=new THREE.Mesh(fn229Geo(B),D.mRock);m.userData.lpsSkip=1;hg.add(m);S.erR=[];const rng=fn229Rng(31);
    for(let i=0;i<26;i++){const a=rng()*6.2832,r=Math.sqrt(rng())*1.8,q=new THREE.Mesh(D.rockG,D.mRock),s=.16+rng()*rng()*.75;q.scale.set(s,s*(.5+rng()*.6),s*(.7+rng()*.5));q.userData.lpsSkip=1;q.visible=false;
      q.userData.p0=new V(S.E.x+Math.sin(a)*r,y0+.1,S.E.z+Math.cos(a)*r);q.userData.v=new V(Math.sin(a)*(1.5+rng()*5),7+rng()*11,Math.cos(a)*(1.5+rng()*5));q.userData.w=new V(rng()*6-3,rng()*6-3,rng()*6-3);scene.add(q);S.erR.push(q)}
    S.erS=fn229Smoke(70,{r:2.4,h:11,sz:3.4,op:0,spd:.22,seed:91,col:0x15121a});S.erS.position.copy(S.E);scene.add(S.erS);
    S.erP=fn229Smoke(60,{r:1.6,h:9,sz:.4,op:0,spd:.5,seed:92,add:1,col:0xd060ff});S.erP.position.copy(S.E);scene.add(S.erP)}
  // a soft shadow under him in the town; the wings' last motes
  S.sh=fn229Blob();S.sh.visible=false;scene.add(S.sh);
  S.mote=se208Mist(80,{r:1.6,h:3.4,sz:.18,op:0,spd:.3,seed:2298,add:1,up:.9});scene.add(S.mote);
  return S}
function fn229Blob(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(0,0,0,.6)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(1.7,1.7).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));m.userData.lpsSkip=1;m.renderOrder=2;return m}
// +1 (east) or -1 (west): the side whose pour cameras see the hero and the fountain without anything in the way
function fn229Side(T,y0){try{const V=THREE.Vector3,rc=new THREE.Raycaster();rc.camera=cam;const sc=s=>{let n=0;[[[s*5.2,1.35,2.6],[0,1.3,3.4]],[[s*4.4,1.5,2.4],[0,1.5,1.2]],[[s*3.4,1.1,7.6],[0,2.6,0]],[[s*.9,2,5.4],[0,2.8,0]]].forEach(([a,b])=>{
      const p=new V(T.cx+a[0],y0+a[1],T.cy+a[2]),l=new V(T.cx+b[0],y0+b[1],T.cy+b[2]),d=l.clone().sub(p),L=d.length();rc.set(p,d.normalize());rc.far=L-1.2;
      n+=rc.intersectObjects(scene.children,true).filter(h=>h.object.visible&&h.object.isMesh&&!fn229Own(h.object)).length?1:0});return n};
    return sc(-1)<=sc(1)?-1:1}catch(_){return -1}}
function fn229Own(q){for(let p=q;p;p=p.parent){if(p===pl||p.userData&&(p.userData.fn229||p.name=='fn229den'||p.name=='fn229figure'))return true;if(p.material&&p.material.transparent&&p.material.depthWrite===false)return true}return false}

// ---------------- lights ----------------
function fn229Lt(i,x,y,z,r,g,b,rad){const L=FN229.L;L.lp.value[i].set(x,y,z);L.lc.value[i].set(r,g,b);L.lr.value[i]=rad}
function fn229LightTown(S,k){const L=FN229.L,T=S.T,y=S.y0;k=k==null?.6:k;L.hemiS.value.setRGB(.36*k,.33*k,.56*k);L.hemiG.value.setRGB(.2*k,.17*k,.24*k);L.keyD.value.set(-.35,.75,.45).normalize();L.keyC.value.setRGB(.5*k,.47*k,.74*k);
  L.rimC.value.setRGB(.34,.28,.6);L.rimP.value=3;fn229Lt(0,T.cx,y+2.6,T.cy,.7,.63,1.0,13);fn229Lt(1,T.cx+4.6,y+1.5,T.cy+4.6,1.0,.48,.2,8);fn229Lt(2,T.cx+4.6,y+1.5,T.cy-4.6,1.0,.48,.2,8);fn229Lt(3,T.cx-4.6,y+1.5,T.cy+4.6,1.0,.48,.2,8)}

// ---------------- each frame ----------------
function fn229Shot(t){const N=FN229.N,T=FN229.T;let i=0;while(i<N.length-1&&t>=T[N[i+1]])i++;const a=T[N[i]],b=i<N.length-1?T[N[i+1]]:FN229.cut;return {n:N[i],i,k:Math.max(0,Math.min(1,(t-a)/(b-a))),a,b,u:t-a}}
function fn229Vis(S,den){if(S.den===den)return;if(den){S.kids=[];scene.children.forEach(q=>{if(q.isLight||q===S.D.g)return;S.kids.push([q,q.visible]);q.visible=false});S.D.g.visible=true}
  else{if(S.kids)S.kids.forEach(([q,v])=>{q.visible=v});S.kids=null;S.D.g.visible=false}S.den=den;S.sw=1}
function fn229Frame(S,t){const V=THREE.Vector3,K=fn229K,Sm=fn229Sm,Lp=fn229Lerp,Io=ic151Io,Oc=ic151Oc,D=S.D,F=S.F,T=S.T,y0=S.y0,L=FN229.L,PO=FN229POSE,TT=FN229.T,sh=fn229Shot(t),n=sh.n,k=sh.k,u=sh.u;
  const dt=Math.max(0,Math.min(.1,S.lt==null?0:t-S.lt));S.lt=t;const den=sh.i>=2&&sh.i<=12;fn229Vis(S,den);
  L.t.value=t;SE208.U.t.value=t;try{SE208.U.vh.value=ren.domElement.height}catch(_){}
  const ev=(key,a,fn)=>{if(!S.ev[key]&&t>=a){S.ev[key]=1;if(t<a+.6)try{fn()}catch(e){console.warn('fn229 ev',key,e)}}};
  const O=D.g.position,dw=(x,y,z)=>new V(O.x+x,O.y+y,O.z+z);let p,l,fov=46,roll=0,shake=0;
  const st=F.st,mk=P=>Object.assign(fn229PoseDef(F),P),mix=(A,B,q)=>fn229PoseMix(mk(A),mk(B),q);let P=null,wing={open:0,flap:0};
  if(!den){
    // ============ Duskhold ============
    const now=performance.now(),sg=S.sg,g=(x,y,z)=>new V(T.cx+x,y0+y,T.cy+z),first=sh.i<2;
    pl.visible=true;pl.position.copy(S.H);
    if(first){pl.rotation.y=Math.PI;F.root.visible=false;S.sh.visible=false;S.holeG.visible=false;S.erR.forEach(q=>{q.visible=false});S.erS.material.uniforms.op.value=S.erP.material.uniforms.op.value=S.mote.material.uniforms.op.value=0}
    try{animHero(now,false)}catch(_){}
    if(first){
      // the hero lifts the essence between his hands, then lets it go to the fountain
      ev('raise',.15,()=>kqsPose('raise',3300));ev('cast',TT.a2+.05,()=>kqsPose('cast',1500));
      const grow=Sm(K(t,.5,2.6))*(1-Sm(K(t,TT.a2+.2,TT.a2+1.5))),hp=g(0,1.72+.1*Math.sin(t*2.2),FN229.mark[1]-.5);S.orb.visible=grow>.01;S.orb.position.copy(hp);S.orb.scale.setScalar(Math.max(.01,grow));S.orb.rotation.y=t*1.3;
      ev('stream',TT.a2+.2,()=>{se208FxRun(se208Stream,[hp.x,hp.y,hp.z,T.cx,y0+2.95,T.cy,S.col,1.7,1])});
      ev('flare',TT.a2+1.95,()=>{if(typeof ftn208Flare=='function')ftn208Flare(S.col)});
      if(n=='a1'){const q=Sm(k);p=g(sg*(5.7-.8*q),1.5,4.3-.3*q);l=g(sg*.5,1.22,2.9-.2*q);fov=40-3*q}
      else{const q1=Io(K(u,0,2.6)),q2=Sm(K(u,2.2,4.4));p=g(sg*(1.5-1.2*q1),2.0+3.4*q1-1.3*q2,5.6-2.0*q1-1.3*q2);l=g(0,2.9-2.3*q2,0+.9*q2);fov=50-18*q2}
      fn229LightTown(S)}
    else{
      // ---- he comes up out of the ground and down beside the fountain ----
      F.root.visible=true;if(F.root.parent!==scene)scene.add(F.root);st.robe=1;st.eye=1;st.vein=0;st.thread=0;st.spasm=0;fn229Shape(F,1);fn229LightTown(S);
      const E=S.E,M=S.M,top=new V(E.x,y0+12.2,E.z+2.2),tE=TT.f1+.9,rise=Oc(K(t,tE+.35,TT.f2-.2));let pos=new V(),yaw=0,pit=0;st.lit=1;
      // the burst
      ev('burst',tE,()=>{try{burst(gY(E,.4),0x2a2430,90,7,9,1.3);burst(gY(E,.6),0xc060ff,50,5,8,1);ring(E,0xb060ff,6,700);kqFlash(gY(E,1.5),0xd8b0ff,7,380);if(typeof svShock=='function')svShock(E,0x9a50e0,9,.8)}catch(_){}});
      const eu=t-tE;S.holeG.visible=eu>=0;S.erR.forEach(q=>{const d=q.userData,v=eu;if(v<0){q.visible=false;return}const y=d.p0.y+d.v.y*v-11*v*v;q.visible=y>y0-.2||v<.2;q.position.set(d.p0.x+d.v.x*v,Math.max(y0+.05,y),d.p0.z+d.v.z*v);if(y>y0)q.rotation.set(d.w.x*v,d.w.y*v,d.w.z*v)});
      S.erS.material.uniforms.op.value=.75*Sm(K(eu,0,.4))*(1-Sm(K(eu,3,7)));S.erP.material.uniforms.op.value=.9*Sm(K(eu,0,.3))*(1-Sm(K(eu,1.2,3)));
      if(t<TT.f2){pos.set(E.x,y0-3+rise*(top.y-y0+3),E.z+rise*rise*2.2);yaw=0;pit=-.25*(1-rise);wing.open=Sm(K(rise,.12,.5));wing.flap=rise<.75?-.6+1.5*rise:Math.sin((t-TT.f1)*5)*.5;P=mix(PO.coil,PO.fly,Sm(K(rise,.05,.4)));F.root.visible=eu>.3}
      else if(t<TT.f3){pos.copy(top);pos.y+=Math.sin((t-TT.f2)*2.6)*.35;yaw=.25*Math.sin((t-TT.f2)*.5);wing.open=1;wing.flap=Math.sin((t-TT.f2)*2.6+1.2)*.75;P=mk(PO.fly);P.nk=[.35,0,0];P.hd=[.3,0,0]}
      else{const q=Io(K(t,TT.f3,TT.f3+3.0)),ld=Sm(K(t,TT.f3+2.5,TT.f3+3.3));pos.lerpVectors(top,M,q);pos.y=Lp(top.y,M.y,Sm(Math.pow(q,.85)))+.0;const toH=Math.atan2(S.H.x-M.x,S.H.z-M.z);yaw=Lp(0,toH,Sm(K(q,.2,.9)));
        wing.open=1-.985*Sm(K(t,TT.f3+3.3,TT.f3+4.3));wing.flap=q<1?(.35+.5*Math.sin((t-TT.f3)*3.4)):.2*(1-Sm(K(t,TT.f3+3,TT.f3+3.6)));pit=.12*Math.sin(q*Math.PI);
        P=mix(PO.fly,PO.stand,ld);const dip=Math.sin(Sm(K(t,TT.f3+2.9,TT.f3+3.9))*Math.PI)*.1;P.pos=[0,-dip,0];
        if(n=='f4'){const q4=Sm(K(u,.4,1.5));P=mix(PO.stand,PO.idle,q4);P.hd=[.02,0,0];P.nk=[.06,.1*Math.sin(t*.4),0];st.wing=1-Sm(K(u,.5,1.9));wing.open=.015;
          S.mote.position.set(M.x,y0+1,M.z);S.mote.material.uniforms.op.value=Math.sin(Sm(K(u,.4,2.6))*Math.PI)*.9}}
      if(n!='f4')st.wing=1;st.flut=n=='f4'?.15:(t<TT.f3+3?1:.3);F.root.position.copy(pos);F.root.rotation.set(pit,yaw,0,'YXZ');
      fn229Shape(F,1);fn229Pose(F,P);fn229WingSet(F,wing);
      S.sh.visible=pos.y-y0<3;S.sh.position.set(pos.x,y0+.04,pos.z);S.sh.material.opacity=Math.max(0,1-(pos.y-y0)/3);
      // the hero watches him
      {const w=Sm(K(t,TT.f1+1.4,TT.f1+2.2)),a=Math.atan2(pos.x-S.H.x,pos.z-S.H.z);let d=a-Math.PI;d=Math.atan2(Math.sin(d),Math.cos(d));pl.rotation.y=Math.PI+d*w;try{const b=pl.bones;if(b&&b.head){const up=Math.atan2(pos.y+1.5-(y0+1.5),Math.hypot(pos.x-S.H.x,pos.z-S.H.z));b.head.rotation.x-=Math.min(.6,up*.6)*w;if(b.neck)b.neck.rotation.x-=Math.min(.4,up*.35)*w}}catch(_){}}
      const hd=F.J.head.getWorldPosition(new V());
      if(n=='f1'){const q=Sm(K(u,1.0,3.4));p=g(sg*3.3,1.05+.25*q,7.7);l=g(-sg*1.2,2.4,-3).lerp(new V(E.x,pos.y+1,E.z),q);fov=50+6*q;shake=.3*Math.max(0,1-Math.abs(t-tE-.15)/.9)+.08*Math.max(0,1-Math.abs(t-TT.f1-.5)/.6)}
      else if(n=='f2'){const q=Sm(k),a=(.6-.95*q)*sg;p=new V(top.x+Math.sin(a)*6.2,top.y-3.0+5.4*q,top.z+Math.cos(a)*6.2);l=new V(pos.x,pos.y+1.0,pos.z);fov=48}
      else if(n=='f3'){const q=Sm(K(u,0,3.2));p=g(.6,1.5+.1*q,7.2-.4*q);l=new V(pos.x,pos.y+1.25,pos.z);fov=30+14*q}
      else{const q=Sm(k);p=g(1.35+.25*q,1.56,2.75-.2*q);l=hd.clone().add(new V(0,-.05,0));fov=31-4*q}}
    // the town round the camera
    cam.near=.1;const Fc=S.H;try{townTick(now,Fc);townLights(Fc)}catch(_){}WIND.t.value=now/1000;
    try{chunkVis();if(S.sw){for(let q=0;q<40;q++)atmos(.05,now)}else atmos(dt,now)}catch(_){}S.sw=0;
    try{torch.position.set(pl.position.x,pl.position.y+2.2,pl.position.z+.3)}catch(_){}try{fxStep(dt);if(typeof kqFxTick=='function')kqFxTick(dt)}catch(_){}
    try{const fa=T.ftnA;if(fa&&fa.f)fa.f(now)}catch(_){}}
  else{
    // ============ the den ============
    S.sw=0;F.root.visible=true;if(F.root.parent!==D.g){D.g.add(F.root)}S.orb.visible=false;S.holeG.visible=false;S.sh.visible=false;
    scene.fog.color.setRGB(.016,.022,.05);scene.background=scene.fog.color;scene.fog.density=.0125;
    L.hemiS.value.setRGB(.028,.032,.055);L.hemiG.value.setRGB(.045,.05,.085);L.keyC.value.setRGB(0,0,0);L.rimC.value.setRGB(.15,.14,.26);L.rimP.value=3;
    const at=S.at,A=(x,y,z)=>dw(at.x+x,at.y+y,at.z+z);
    // --- the figure's state over the whole den sequence ---
    // v231: the creature only draws in during d1 (to .6); the man's body takes over on the cut to d2 (.64 →), behind the black dip, never in a shot
    const kk=t<TT.d2?Sm(K(t,TT.d1+2.0,TT.d2))*.6:.64+.36*Sm(K(t,TT.d2+.2,TT.d2+2.6));st.robe=K(t,TT.d3+.5,TT.d3+3.9);st.thread=Math.sin(Sm(K(t,TT.d3+3.4,TT.d3+5.2))*Math.PI);
    st.vein=1.5*Sm(K(t,TT.c3+.6,TT.c3+2.4))*(1-.6*Sm(K(t,TT.d1+3.6,TT.d2))-.4*Sm(K(t,TT.d2,TT.d2+2.2)));st.eye=Sm(K(t,TT.c1+1.3,TT.c1+1.6))*(1+.6*Sm(K(t,TT.c3+.9,TT.c3+1.6))*(1-Sm(K(t,TT.d2,TT.d2+2))));
    st.wing=Oc(K(t,TT.e2+.55,TT.e2+1.3));st.lit=t<TT.c1?.16:Lp(.05,1,Sm(K(t,TT.c1+1.9,TT.c1+3.9)));st.flut=t>TT.e3?1:.12+.5*Sm(K(t,TT.e1+1.8,TT.e1+2.4));
    const tw=(a)=>(fn229Nz(t*1.15+a*3.71,a*1.93,.5)-.5)*.9,cv=Sm(K(t,TT.d1+1.6,TT.d1+2.4))*(1-Sm(K(t,TT.d2+1.6,TT.d2+2.6)));let rootY=0,rootYaw=0;st.spasm=cv;fn229Shape(F,kk);const isMan=fn229Act(F)===F.man,CL=isMan?PO.clutchM:PO.clutch;
    if(t<TT.c2){const q=Sm(K(t,TT.c1+2.0,TT.c1+3.6));P=mix(PO.lurk,PO.crouch,q);const lift=Math.sin(K(t,TT.c1+2.0,TT.c1+3.3)*Math.PI);P.hR[1]+=.4*lift;P.hd[1]=.1*Math.sin(t*.7)}
    else if(t<TT.c3){const q=Io(K(u,.3,2.6)),bob=Math.sin(Math.max(0,u-2.6)*4.2)*.03;P=mix(PO.crouch,PO.drink,q);P.pos[1]+=bob;P.jaw=Lp(.25,.55,q)+.2*Math.sin(Math.max(0,u-2.6)*8.4)*q}
    else if(t<TT.d1){const q=Io(K(u,.4,1.9));P=mix(PO.drink,PO.bliss,q);const br=Math.sin(u*2.3)*.03;P.ch[0]+=br;P.nk[2]=.12*Math.sin(u*1.3)*q;P.hd[2]=.1*Math.sin(u*1.7+1)*q}
    else if(t<TT.d2){const q=Io(K(u,0,1.7)),q2=Sm(K(u,2.3,4.6));P=isMan?mk(CL):mix(mix(PO.bliss,PO.rear,q),CL,q2);
      [['sp',.16],['ch',.2],['nk',.25]].forEach(([b,a],i)=>{P[b][0]+=tw(i)*a*cv;P[b][2]+=tw(i+7)*a*cv});['hL','hR'].forEach((b,i)=>{P[b][0]+=tw(20+i)*.2*cv;P[b][1]+=tw(30+i)*.2*cv});P.jaw=Math.max(P.jaw*(1-.4*q2),.5+.5*Math.abs(tw(40))*cv)}
    else if(t<TT.d3){const q=Sm(K(u,0,1.3)),q3=Sm(K(u,2.6,3.6));P=mix(mix(PO.clutchM,PO.gaze,q),PO.stand,q3);[['sp',.1],['ch',.12]].forEach(([b,a],i)=>{P[b][0]+=tw(i)*a*cv;P[b][2]+=tw(i+7)*a*cv});}
    else if(t<TT.e1){const q=Sm(K(u,.3,1.6)),q2=Sm(K(u,4.3,5.3));P=mix(mix(PO.stand,PO.robe,q),PO.stand,q2);P.nk[0]+=.18*(1-Sm(K(u,2.6,4.4)))}
    else if(t<TT.e2){const q=Io(K(u,.2,1.3)),q2=Sm(K(u,3.3,4));P=mix(mix(PO.stand,PO.cast,q),PO.stand,q2*.5)}
    else if(t<TT.e3){const q=Sm(K(u,.1,.7)),sn=Math.sin(K(u,.5,1.2)*Math.PI);P=mix(PO.stand,PO.wings,q);P.pos=[0,-.1*sn,0];P.ch[0]-=.15*sn}
    else{const q=Sm(K(u,0,.55)),go=K(u,.6,2.6);P=mix(mix(PO.wings,PO.coil,q),PO.fly,Sm(K(u,.6,.95)));rootY=go*go*(D.holeY+8);if(go>0)P.nk=[-.5,0,0]}
    wing.open=t<TT.e3?Oc(K(t,TT.e2+.8,TT.e2+2.0)):1;wing.flap=t<TT.e3?.35*Sm(K(t,TT.e2+1.2,TT.e2+2.2))+.1*Math.sin(t*1.7):(u<.6?.9*Sm(K(u,.1,.55)):-.95+1.9*Math.abs(Math.sin((u-.6)*3.3)));
    F.root.position.set(at.x,at.y+rootY,at.z);F.root.rotation.set(0,rootYaw,0);fn229Pose(F,P);fn229WingSet(F,wing);
    const hd=F.J.head.getWorldPosition(new V()),sc=F.size,hR=F.J.aR2.getWorldPosition(new V());
    // --- the den's own life ---
    fn229DenTick(D,t);const tB=TT.e1+2.25;fn229DenBreak(D,t-tB);
    // lights: 0 the pool, 1 the thread / the bead, 2 his black fire, 3 the sky through the roof
    const I0=1.2*(1-.42*Sm(K(t,TT.d2-.6,TT.d2+.4)));fn229Lt(0,O.x,O.y+1.3,O.z,1.2*I0,1.4*I0,1.7*I0,52);fn229Lt(1,O.x,O.y+19,O.z,.7,.72,1.15,72);
    const fire=Sm(K(t,TT.c1+1.6,TT.c1+3.5))*.5+.9*Sm(K(t,TT.d1,TT.d1+1.5))*(1-.6*Sm(K(t,TT.d3,TT.d3+3)))+1.4*Math.max(0,1-Math.abs(t-(TT.e1+1.9))/.6);
    if(n=='e2')fn229Lt(2,O.x+at.x+1,O.y+at.y+3.2,O.z+at.z-6.5,1.15,1.05,.95,17);else fn229Lt(2,O.x+at.x,O.y+at.y+3.5*sc*.5+1,O.z+at.z-2.5,.62*fire,.14*fire,.85*fire,26);
    const skyL=Sm(K(t,tB,tB+1.2));fn229Lt(3,O.x+FN229D.hole[0],O.y+D.holeY-2,O.z+FN229D.hole[2],1.5*skyL,1.4*skyL,1.9*skyL,80);
    if(skyL>0){L.keyD.value.set(.05,1,.12).normalize();L.keyC.value.setRGB(.55*skyL,.5*skyL,.75*skyL)}
    D.mObs.uniforms.emK.value=.35+1.6*Sm(K(t,TT.c2+2,TT.d1+2))*(.8+.2*Math.sin(t*3));D.mRock.uniforms.emK.value=0;
    // the black coils round him (the change), the gold sparks of the weaving robe
    const cu=D.coil.material.uniforms,su=D.spark.material.uniforms,ck=Sm(K(t,TT.d1+.2,TT.d1+1.6))*(1-Sm(K(t,TT.d2+2.4,TT.d2+3.6))),rk=Sm(K(t,TT.d3+.3,TT.d3+1))*(1-Sm(K(t,TT.d3+3.6,TT.d3+4.6)));
    cu.c.value.set(at.x,at.y,at.z);cu.hr.value=Lp(1.2,.55,kk)*sc*1.1;cu.hh.value=Lp(2.9,2.1,kk)*sc;cu.tw.value=2.5;cu.op.value=.8*Math.max(ck,rk*.18);cu.sz.value=Lp(4.2,1.3,kk);
    su.c.value.copy(cu.c.value);su.hr.value=cu.hr.value*(rk>ck?.8:1.15);su.hh.value=cu.hh.value;su.tw.value=3.5;su.op.value=Math.max(ck*.6,rk*.9);su.sz.value=rk>ck?.07:Lp(.26,.1,kk);su.col.value.setRGB(rk>ck?1.0:.9,rk>ck?.7:.3,rk>ck?.25:1);
    // the lance
    {const a=K(t,TT.e1+1.45,TT.e1+2.25),b=1-Sm(K(t,TT.e1+2.3,TT.e1+2.75)),on=a>0&&b>0;D.lance.visible=D.lanceG.visible=on;if(on){const h0=hR.clone().sub(O),len=(D.holeY+2-h0.y)*Oc(a);[D.lance,D.lanceG].forEach((m,i)=>{const w=(i?.2:.3)*(1+.2*Math.sin(t*40+i));m.position.copy(h0);m.scale.set(w,len,w)});D.lance.material.uniforms.op.value=b;D.lanceG.material.opacity=.4*b}}
    // the bead of essence falling down the throat and into the pool
    {const yT=D.shaftY[1]-2,by=n=='b1'?Lp(yT-9,D.shaftY[0]-6,Math.pow(k,1.6)):n=='b2'?Lp(D.shaftY[0]-6,-.1,Math.pow(K(u,0,2.4),1.4)):-5;S.bead.visible=(n=='b1'||n=='b2')&&by>0;S.bead.position.set(0,by,0);
      if(S.bead.visible)fn229Lt(1,O.x,O.y+by,O.z,1.5,1.25,2.0,n=='b1'?22:50)}
    // (v231: no stock game sounds in the film; fn229Score voices the landing, the lance and the roof itself)
    // --- cameras ---
    if(n=='b1'){const y=Lp(D.shaftY[1]-5,D.shaftY[0]+2.5,Math.pow(k,1.6)),a=t*.55;p=dw(Math.sin(a)*.95,y,Math.cos(a)*.95);l=dw(0,y-10,0);fov=62;roll=a+1.2;shake=.03}
    else if(n=='b2'){const q=Io(K(u,0,4.6));p=dw(Lp(3.6,11.5,q),Lp(31.5,7.5,q),Lp(6.4,25,q));l=dw(0,Lp(22,4.2,Sm(K(u,0,3.6))),Lp(0,-5,q));fov=56-4*q}
    else if(n=='c1'){const q=Sm(k);p=dw(4.7-.8*q,.6+.12*q,7.7-.6*q);l=dw(-.5,1.9+1.5*q,-8.5);fov=42}
    else if(n=='c2'){const q=Sm(k);p=dw(13.6-1.4*q,2.9-.7*q,-3.2-.6*q);l=dw(0,2.5-.5*q,-6.8);fov=38}
    else if(n=='c3'){const q=Sm(K(u,.3,2.4)),cb=F.J.chest.getWorldPosition(new V());p=cb.clone().add(new V(3.2-.6*q,1.2+.9*q,5.2-.6*q));l=hd.clone().add(new V(0,.1,.2));fov=34;shake=.02*st.vein}
    else if(n=='d1'){const q=Sm(k),a=.75-1.35*q,r=Lp(6.7,3.5,Math.min(1,kk/.6));p=A(Math.sin(a)*r,1.0+.7*q,Math.cos(a)*r);const hy=Lp(4.2,(hd.y-O.y-at.y)*.66,Sm(K(u,0,1.5)));l=A(0,hy,0);fov=62-6*q;shake=.06*cv}
    else if(n=='d2'){const q=Sm(k),q3=Sm(K(u,2.2,3.4));p=hd.clone().add(new V(.5*sc,(-.12+.1*q)*sc,(1.55-.3*q)*sc));l=hd.clone().add(new V(.03*sc,-.09*sc*(1-q3),0));fov=34;shake=.012*cv}
    else if(n=='d3'){const q=Sm(K(u,.3,5.2));p=A(Lp(-2.3,-.75,q),Lp(.85,1.56,q),Lp(4.4,1.9,q));l=A(0,Lp(.95,1.62,q),0);fov=42-6*q}
    else if(n=='e1'){const q=Sm(K(t,tB-.1,tB+.6));p=A(.95,.32,2.6);l=A(0,Lp(1.55,9,q),0);fov=60+8*q;shake=.28*Math.max(0,1-Math.abs(t-tB-.25)/1.1)}
    else if(n=='e2'){const q=Io(K(u,.5,2.6));p=A(Lp(.6,1.7,q),Lp(1.75,2.3,q),Lp(-2.6,-7.6,q));l=A(0,Lp(1.45,1.7,q),0);fov=44+4*q;shake=.05*Math.max(0,1-Math.abs(u-.8)/.5)}
    else{const q=Sm(K(u,.5,2.6));p=A(2.3,.75,2.9);l=A(0,Lp(1.5,rootY+1.3,.97),0);fov=60+4*q;shake=.1*Math.max(0,1-Math.abs(u-.7)/.5)}}
  // the camera: shake, roll, never under the ground
  if(shake>0){p.x+=(ic151H(t*41)-.5)*shake;p.y+=(ic151H(t*43+1)-.5)*shake;l.x+=(ic151H(t*37+2)-.5)*shake*1.4;l.y+=(ic151H(t*39+3)-.5)*shake}
  if(den){const lx=p.x-O.x,lz=p.z-O.z,fy=O.y+(Math.hypot(lx,lz)<FN229D.pool+.2?-.22:fn229DenFloor(lx,lz));if(n!='b1')p.y=Math.max(p.y,fy+.45)}else p.y=Math.max(p.y,GH(p.x,p.z)+.45);
  cam.position.copy(p);if(roll)cam.up.set(Math.sin(roll),0,Math.cos(roll));else cam.up.set(0,1,0);cam.lookAt(l);cam.fov=fov;cam.far=Math.max(S.save.far,320);cam.updateProjectionMatrix();if(typeof look!='undefined')look.copy(l);
  try{FADE.cam.value.copy(cam.position);FADE.pl.value.copy(cam.position)}catch(_){}
  S.cam={p,l,fov,n,den};if(!FN229.noDraw)POST.render()}

// ---------------- the page layer: letterbox, the Voice's subtitles, white-outs, fades, skip ----------------
function fn229Css(){if(document.getElementById('fn229css'))return;ic151Css();ic151DCss();const s=document.createElement('style');s.id='fn229css';s.textContent=
  '#fn229{position:fixed;inset:0;z-index:2147483000;overflow:hidden;cursor:none;user-select:none;pointer-events:auto;background:transparent}'+
  '#fn229 .lb{position:absolute;left:0;right:0;height:11vh;background:#000;z-index:3;pointer-events:none}#fn229 .lb.t{top:0}#fn229 .lb.b{bottom:0}'+
  '#fn229 .fk{position:absolute;inset:0;background:#000;z-index:4;pointer-events:none}'+
  '#fn229 .fl{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 50%,#fff 0%,#efe6ff 45%,#c9b6ff 100%)}'+
  '#fn229 .vg{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 34%,rgba(6,2,14,.5) 72%,rgba(2,0,6,.9) 100%)}'+
  '#fn229 .sub{position:absolute;left:6%;right:6%;bottom:17vh;text-align:center;z-index:5;pointer-events:none;font-family:"IM Fell English SC","Cinzel Decorative",Georgia,serif;font-size:clamp(20px,3.2vw,44px);letter-spacing:.06em;color:#fff;line-height:1.2}'+
  '#fn229 .sub span{display:inline-block;white-space:pre;text-shadow:0 0 3px rgba(10,16,50,.95),0 0 14px rgba(14,24,70,.85),-2px 0 rgba(90,200,255,.6),2px 0 rgba(255,120,220,.5)}'+
  '#fn229 .skip{position:absolute;right:22px;bottom:calc(11vh + 14px);z-index:6;cursor:pointer;background:rgba(10,8,16,.45);color:#e8e0d0;border:1px solid rgba(232,224,208,.35);border-radius:4px;font:600 13px/1 "Cinzel Decorative",Georgia,serif;letter-spacing:.08em;padding:8px 14px;opacity:.7}'+
  '#fn229 .skip:hover{opacity:1;background:rgba(30,24,40,.7)}';document.head.appendChild(s)}
function fn229Layer(S){fn229Css();const el=document.createElement('div');el.id='fn229';
  el.innerHTML='<div class="vg"></div><div class="fl"></div><div class="lb t"></div><div class="lb b"></div><div class="sub"></div><div class="fk"></div><button class="skip">Skip ›</button>';
  document.body.appendChild(el);S.dom={el,lt:el.querySelector('.lb.t'),lb:el.querySelector('.lb.b'),sub:el.querySelector('.sub'),vg:el.querySelector('.vg'),fl:el.querySelector('.fl'),fk:el.querySelector('.fk'),skip:el.querySelector('.skip'),cur:null,sp:[]}}
function fn229Dom(S,t){const D=S.dom;if(!D)return;const K=ic151K,Sm=ic151Sm,T=FN229.T,C=FN229.cut;
  const lb=(11*Sm(K(t,0,1))*(1-Sm(K(t,C+.5,FN229.len-.3))))+'vh';D.lt.style.height=lb;D.lb.style.height=lb;
  // black: short dips on the hard cuts inside the den, a hard cut at the end, then the game fades back in
  let bk=0;[T.c1,T.c2,T.d2,T.e2].forEach(a=>{bk=Math.max(bk,1-Math.abs(t-a)/.22)});bk=Math.max(bk,0);if(t>=C)bk=1-K(t,C+.3,C+1.7);D.fk.style.opacity=bk.toFixed(3);
  // white: into the basin, out of the throat's light; into the sky through the roof, out over Duskhold
  const fl=Math.max(Sm(K(t,T.b1-.75,T.b1-.05))*(1-Sm(K(t,T.b1,T.b1+.8))),Sm(K(t,T.f1-.9,T.f1-.1))*(1-Sm(K(t,T.f1,T.f1+.7))),.8*Math.max(0,1-Math.abs(t-(T.e1+2.3))/.3));D.fl.style.opacity=fl.toFixed(3);
  D.vg.style.opacity=(t>=T.b1&&t<T.f1?1:0).toFixed(2);
  const L=FN229.lines.find(x=>t>=x.a-.1&&t<x.b+.6);if(L!==D.cur){D.cur=L;D.sub.innerHTML='';if(L){D.sp=[];L.s.split(/( )/).forEach(w=>{if(!w)return;let box=D.sub;if(w!==' '){box=document.createElement('span');box.className='w';D.sub.appendChild(box)}for(const ch of w){const e=document.createElement('span');e.textContent=ch;box.appendChild(e);D.sp.push(e)}})}}
  if(L){const out=K(t,L.b,L.b+.6);D.sp.forEach((e,i)=>{const k=K(t,L.a+i*.045,L.a+i*.045+.55),fr=Math.floor(t*14),gl=ic151H(fr*1.7+i*3.1)>.93?1:0,jx=(ic151H(fr+i*.7)-.5)*2.4*(1+gl*3),jy=(ic151H(fr*1.3+i)-.5)*1.6;
    e.style.opacity=(k*(1-out)*(.85+.15*Math.sin(t*7+i))).toFixed(3);e.style.filter='blur('+((1-k)*7+out*6+gl*1.5).toFixed(2)+'px)';e.style.transform='translate('+jx.toFixed(2)+'px,'+(jy+(1-k)*8).toFixed(2)+'px) scale('+(1+(1-k)*.25).toFixed(3)+')'})}
  D.skip.style.visibility=t<FN229.skipT?'':'hidden'}

// ---------------- sound: the Voice's drone and choir, the fall, his hunger, the change, the breaking roof, the arrival ----------------
function fn229Score(ac,out,T0){const T=x=>T0+x,G=v=>{const g=ac.createGain();g.gain.value=v||0;return g},X=FN229.T,E=FN229.cut;
  const rv=ac.createConvolver(),IR=ac.createBuffer(2,ac.sampleRate*3.6,ac.sampleRate),R=fn229Rng(5);for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(R()*2-1)*Math.pow(1-i/d.length,2.3)}rv.buffer=IR;const wet=G(.5);rv.connect(wet);wet.connect(out);
  const nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=R()*2-1;
  const osc=(type,f,a,dur,pk,at,rel,o)=>{if(T(a)<ac.currentTime-.01)return;o=o||{};const s=ac.createOscillator();s.type=type;s.frequency.setValueAtTime(f,T(a));if(o.f2)s.frequency.exponentialRampToValueAtTime(o.f2,T(a+(o.ft||dur)));if(o.det)s.detune.value=o.det;
    const g=G(0);g.gain.setValueAtTime(0,T(a));g.gain.linearRampToValueAtTime(pk,T(a+at));g.gain.setValueAtTime(pk,T(a+Math.max(at,dur-rel)));g.gain.linearRampToValueAtTime(0,T(a+dur));let n=g;s.connect(g);
    if(o.lp){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;g.connect(fl);n=fl}const d=G(o.dry==null?1:o.dry);n.connect(d);d.connect(out);if(o.wet){const w=G(o.wet);n.connect(w);w.connect(rv)}s.start(T(a));s.stop(T(a+dur+.05))};
  const noise=(a,dur,pk,at,rel,o)=>{if(T(a)<ac.currentTime-.01)return;o=o||{};const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=o.type||'bandpass';fl.frequency.setValueAtTime(o.f||800,T(a));if(o.f2)fl.frequency.exponentialRampToValueAtTime(o.f2,T(a+dur));fl.Q.value=o.q||1;
    const g=G(0);g.gain.setValueAtTime(0,T(a));g.gain.linearRampToValueAtTime(pk,T(a+at));g.gain.setValueAtTime(pk,T(a+Math.max(at,dur-rel)));g.gain.linearRampToValueAtTime(0,T(a+dur));s.connect(fl);fl.connect(g);g.connect(out);if(o.wet){const w=G(o.wet);g.connect(w);w.connect(rv)}s.start(T(a));s.stop(T(a+dur+.05))};
  const hit=(a,f,pk)=>{osc('sine',f,a,2.6,pk,.01,2.5,{wet:.7});osc('triangle',f*2,a,1.2,pk*.35,.005,1.1,{lp:600,wet:.4});noise(a,.5,pk*.5,.005,.45,{type:'lowpass',f:220,wet:.5})};
  // v231 (owner: "Some sound effects used sound cheesy- make it a serious tone"): no chimes, pings, rising sweeps or arcade sounds
  // (the film also plays none of the game's stock effects now). Low strings in D minor, sub hits, a tolling bell, wind and stone.
  const toll=(a,f,pk)=>{[[1,1,5.2],[2,.5,3.8],[2.76,.3,2.8],[5.4,.08,1.5]].forEach(q=>osc('sine',f*q[0],a,q[2],pk*q[1],.006,q[2]-.01,{wet:1.1,dry:.6}))};
  const pad=(fs,a,dur,pk,at,rel,lp)=>fs.forEach((f,i)=>[-6,7].forEach(d=>osc('sawtooth',f,a+i*.12,dur,pk,at,rel,{lp:lp||420,wet:.9,dry:.7,det:d})));
  // Duskhold: a low pedal under the lifted essence, the pour as a breath of air, one soft bell as the basin takes it
  osc('sine',73.42,.2,X.b1,.07,2.4,1.2,{wet:.6});pad([73.42,110,146.83],.6,X.b1-.6,.012,2.6,1.4,360);
  noise(X.a2+.2,4.2,.045,1.4,1.8,{type:'lowpass',f:1300,f2:300,wet:.8});toll(X.a2+1.95,146.83,.045);
  // the fall: wind in the throat, the dark opening under it
  noise(X.b1-.5,4.6,.17,.9,1.3,{f:420,f2:140,q:.6,wet:.5});osc('sine',55,X.b1-.3,4.4,.1,2.6,1.2,{f2:36.71,wet:.5});hit(X.b1,55,.2);
  // the den: the Voice's drone (D, as in the intro), low strings far off, the essence landing
  [36.71,55,73.42].forEach((f,i)=>osc('sawtooth',f,X.b2-.2,X.e3-X.b2+2,.034-i*.006,3,2,{lp:260,wet:.5,det:i*6}));
  [146.83,174.61,220].forEach((f,i)=>osc('sine',f,X.b2+.5+i*.6,X.d1-X.b2,.012,3.5,2,{wet:1.4,dry:.35,det:i%2?7:-7}));hit(X.b2+2.4,49,.14);toll(X.b2+2.4,73.42,.07);
  // his hand, his eyes: a sub hit, a close cold cluster in the low strings
  hit(X.c1+2.0,41.2,.16);pad([138.59,146.83],X.c1+1.3,2.0,.016,.08,1.7,620);
  // drinking: dull swallows; the heart, faster and faster through the euphoria; the strings tighten a half step
  for(let i=0;i<4;i++){const a=X.c2+2.7+i*.95;noise(a,.3,.11,.05,.22,{type:'lowpass',f:150,wet:.4});osc('sine',62,a,.26,.12,.03,.22,{f2:44,wet:.3})}
  {let a=X.c3+.3,gap=.95;while(a<X.d1+2.2){osc('sine',52,a,.22,.3,.008,.2,{f2:38,wet:.25});osc('sine',48,a+.16,.2,.2,.008,.18,{f2:36,wet:.25});a+=gap;gap=Math.max(.36,gap*.86)}}
  pad([77.78,116.54,155.56],X.c3+.5,X.d1-X.c3+1.5,.014,1.8,1.3,520);
  // the change: a grinding swell, bone (dry cracks, no tone), the black fire, a bell as the man stands in his place
  [58.27,61.74,87.31,92.5].forEach((f,i)=>osc('sawtooth',f,X.d1,X.d2-X.d1+2.2,.036,2,1.6,{lp:380+70*i,wet:.7,det:i*9,f2:f*.84}));noise(X.d1,6,.09,1.8,2.2,{type:'lowpass',f:160,f2:700,wet:.6});
  for(let i=0;i<10;i++){const a=X.d1+2.0+i*.4+.14*R();noise(a,.06,.15,.004,.052,{f:500+800*R(),q:5,wet:.3})}
  hit(X.d1+1.5,36.7,.26);hit(X.d2,43.6,.16);toll(X.d2+.1,73.42,.08);
  // the robe: the low strings settle on D minor, a breath of air as the gold takes
  pad([73.42,110,146.83,174.61],X.d3+.4,5.4,.013,1.8,2.2,480);noise(X.d3+3.2,2.4,.022,1,1.3,{type:'highpass',f:2600,wet:1.2});toll(X.d3+3.5,110,.05);
  // the lance and the roof: pressure building, a dull crack, stone
  noise(X.e1+.4,1.9,.16,1.7,.12,{type:'lowpass',f:110,f2:520,wet:.5});osc('sine',41.2,X.e1+.4,1.9,.2,1.7,.1,{wet:.4});
  noise(X.e1+1.45,.7,.2,.01,.6,{type:'lowpass',f:700,f2:160,wet:.6});osc('sine',58,X.e1+1.45,.6,.26,.008,.55,{f2:34,wet:.4});
  hit(X.e1+2.25,32.7,.4);noise(X.e1+2.25,2.8,.28,.01,2.6,{type:'lowpass',f:900,f2:90,wet:.7});
  for(let i=0;i<8;i++)noise(X.e1+2.7+i*.28+.1*R(),.22,.12,.005,.2,{type:'lowpass',f:260,wet:.5});
  // wings: sinew tearing (low, dry), then two great beats; the leap
  noise(X.e2+.5,.8,.15,.03,.6,{f:420,f2:1100,q:1.6,wet:.5});hit(X.e2+.6,49,.2);[1.2,2.1].forEach(d=>noise(X.e2+d,.7,.14,.2,.45,{type:'lowpass',f:380,wet:.4}));
  noise(X.e3+.55,2.2,.2,.25,1.4,{type:'lowpass',f:300,f2:1000,wet:.5});pad([55,82.41,110],X.e3+.3,2.8,.02,1.9,.3,560);hit(X.e3+.6,41.2,.2);
  // Duskhold: rumble, the burst, D minor low and wide while he hangs over the town, wing beats, the landing, the last word
  noise(X.f1,1.2,.14,.7,.3,{type:'lowpass',f:90,wet:.3});hit(X.f1+.9,32.7,.42);noise(X.f1+.9,2.4,.26,.01,2.2,{type:'lowpass',f:1100,f2:120,wet:.6});toll(X.f1+1.0,73.42,.1);
  [73.42,110,146.83,174.61,220].forEach((f,i)=>osc('sawtooth',f,X.f1+1.4,X.f4-X.f1,.03,1.4,2.4,{lp:560,wet:.9,det:i*5}));[293.66,349.23].forEach((f,i)=>osc('sine',f,X.f2+i*.2,X.f4-X.f2+1,.008,1.8,2.2,{wet:1.5,dry:.4}));
  for(let a=X.f2+.3;a<X.f3+2.6;a+=1.2)noise(a,.75,.1,.22,.45,{type:'lowpass',f:340,wet:.4});hit(X.f3+3.0,49,.18);toll(X.f3+3.05,73.42,.07);
  [36.71,73.42].forEach(f=>osc('sine',f,X.f4,E-X.f4,.12,1.2,.05,{wet:.5}));osc('sine',36.7,E,2.8,.34,.01,2.7,{wet:.6});osc('sine',73.4,E+.02,2.3,.05,.01,2.2,{wet:1})}

// ---------------- play / skip / finish ----------------
function fn229Play(o){if(FN229.run)return false;let S;try{S=fn229Build(o)}catch(e){console.warn('fn229 build',e);FN229.err=String(e&&e.stack||e);return false}
  FN229.S=S;FN229.run=true;FN229.err=null;IC151.on=true;document.body.classList.add('ic151d');fn229Layer(S);
  // every shot is drawn once before the clock starts, so no shader is built at a cut
  if(!(navigator.webdriver&&!window.KQ_WARM229))try{fn229Warm(S)}catch(e){console.warn('fn229 warm',e)}
  const L=S.live={t0:performance.now(),off:0,raf:0,ac:null};
  try{const AC=window.AudioContext||window.webkitAudioContext,ac=L.ac=new AC(),out=ac.createGain(),cp=ac.createDynamicsCompressor();out.gain.value=.9*Math.max(.15,Math.min(1,typeof SET!='undefined'&&SET.sfxV!=null?+SET.sfxV*1.4:1));out.connect(cp);cp.connect(ac.destination);L.out=out;if(ac.resume)ac.resume();fn229Score(ac,out,ac.currentTime+.05)}catch(e){console.warn('fn229 sound',e)}
  try{if(typeof MU!='undefined'&&MU.g&&MU.a){L.mu=1;MU.g.gain.setTargetAtTime(0,MU.a.currentTime,.1)}}catch(_){}
  const onKey=e=>{if(!FN229.run)return;e.stopImmediatePropagation();e.preventDefault();if(e.type=='keydown'&&/^(Escape|Enter| |Spacebar)$/.test(e.key))fn229Skip()};L.onKey=onKey;
  addEventListener('keydown',onKey,true);addEventListener('keyup',onKey,true);S.dom.skip.onclick=e=>{e.stopPropagation();fn229Skip()};
  S.dom.el.addEventListener('mousemove',()=>{S.dom.el.style.cursor='default';clearTimeout(L.cur);L.cur=setTimeout(()=>{if(S.dom)S.dom.el.style.cursor=''},1500)});
  const tick=now=>{if(!FN229.run)return;L.raf=requestAnimationFrame(tick);fn229Seek(Math.max(L.off,(now-L.t0)/1000+L.off));
    try{if(MP&&MP.on&&party.length&&now-(L.pt||0)>500){L.pt=now;mpPresence(now)}}catch(_){}};
  L.raf=requestAnimationFrame(tick);return true}
function fn229Warm(S){const T0=performance.now(),ev=S.ev,nd=FN229.noDraw;S.ev=new Proxy({},{get:()=>1,set:()=>true});FN229.noDraw=0;
  try{[1,5,9,13,18,23,27,32,37,42,47.5,50.5,53,56.5,60,63,67].forEach(t=>{try{fn229Frame(S,t)}catch(e){console.warn('fn229 warm shot',t,e)}})}
  finally{S.ev=ev;S.lt=null;FN229.noDraw=nd;try{fn229Frame(S,0)}catch(_){}S.lt=null}FN229.warmMs=Math.round(performance.now()-T0)}
function fn229Seek(t){const S=FN229.S;if(!S)return;S.t=t;
  if(t<FN229.cut&&!S.back){IC151.on=true;try{fn229Frame(S,t)}catch(e){console.warn('fn229 frame',e);FN229.err=String(e&&e.stack||e);if(S.live)S.live.off+=FN229.cut-t;t=FN229.cut}}
  if(t>=FN229.cut&&!S.back)fn229Back(S);
  fn229Dom(S,t);if(t>=FN229.len)fn229End()}
function fn229Skip(){const S=FN229.S,L=S&&S.live;if(!L)return;const t=(performance.now()-L.t0)/1000+L.off;if(t>=FN229.skipT)return;L.off+=FN229.skipT-t;
  try{if(L.out){L.out.gain.cancelScheduledValues(L.ac.currentTime);L.out.gain.setTargetAtTime(0,L.ac.currentTime,.12)}}catch(_){}}
// hand the game back (at the cut to black): the den and every prop go, the town is as it was, the essence is claimed, he stands by the fountain
function fn229Back(S){if(S.back)return;S.back=1;const sv=S.save;
  try{fn229Vis(S,false)}catch(_){}
  try{[S.orb,S.bead,S.holeG,S.erS,S.erP,S.sh,S.mote].concat(S.erR||[]).forEach(q=>{if(!q)return;if(q.parent)q.parent.remove(q);
      q.traverse(m=>{if(m.geometry&&m.geometry!==S.D.rockG)m.geometry.dispose();if(m.material&&m.material!==S.D.mRock)m.material.dispose()})});S.sh.material.map.dispose()}catch(e){console.warn('fn229 props',e)}
  try{fn229FigFree(S.F)}catch(_){}try{fn229DenFree(S.D)}catch(_){}
  try{(S.hid||[]).forEach(q=>{q.visible=true});S.hid=[]}catch(_){}
  try{if(S.o&&S.o.rp){pl.position.copy(sv.p);pl.rotation.y=sv.ry;if(typeof camYaw!='undefined')camYaw=sv.yaw}else{pl.position.copy(S.H);pl.rotation.y=Math.atan2(S.M.x-S.H.x,S.M.z-S.H.z);if(typeof camYaw!='undefined')camYaw=pl.rotation.y+Math.PI}}catch(_){}
  try{document.body.classList.remove('ic151d');cam.fov=sv.fov||58;cam.near=sv.near||.1;cam.far=sv.far||260;cam.up.set(0,1,0);cam.updateProjectionMatrix();snapCam();chunkVis();for(let n=0;n<40;n++)atmos(.05,performance.now())}catch(e){console.warn('fn229 back',e)}
  IC151.on=false;try{if(S.live&&S.live.mu&&typeof muVol=='function')muVol()}catch(_){}try{if(typeof K!='undefined')for(const k in K)K[k]=false}catch(_){}
  // the pour itself: what the plain pour does when its stream lands
  if(S.o&&S.o.i!=null&&!S.o.rp){SE208.pour=0;FN229.seen=1;try{if(typeof ftn208Flare=='function')ftn208Flare(S.col)}catch(_){}try{se208Claim(S.o.i)}catch(e){console.warn('fn229 claim',e)}}
  try{fn229Npc()}catch(e){console.warn('fn229 npc',e)}}
function fn229End(){if(!FN229.run)return;const S=FN229.S,L=S&&S.live;FN229.run=false;
  try{if(S&&!S.back)fn229Back(S)}catch(_){}
  try{if(L){cancelAnimationFrame(L.raf);removeEventListener('keydown',L.onKey,true);removeEventListener('keyup',L.onKey,true);clearTimeout(L.cur);
    if(L.ac){const ac=L.ac;try{L.out.gain.setTargetAtTime(0,ac.currentTime,.3)}catch(_){}setTimeout(()=>{try{ac.close()}catch(_){}},1500)}}}catch(_){}
  try{if(S&&S.dom)S.dom.el.remove()}catch(_){}FN229.S=null}
// capture mode for tests and stills: build, no sound, no clock; then fn229Seek(t) per frame
function fn229Cap(o){if(FN229.run)return null;const T0=performance.now(),S=fn229Build(o||{rp:1});FN229.S=S;FN229.run=true;FN229.err=null;IC151.on=true;document.body.classList.add('ic151d');fn229Layer(S);S.dom.skip.style.display='none';
  return {ms:Math.round(performance.now()-T0),side:S.sg,den:S.D.g.children.length}}

// ---------------- he stands by the fountain from then on ----------------
function fn229NpcOwn(){try{return typeof bossDone!='undefined'&&bossDone.has(fn229Last())}catch(_){return false}}
// co-op: a partner who has poured the last essence tells the room every few seconds (['kv229'] on the 'ev' topic, beside 3094's
// Duskhold messages; older versions ignore it), so everyone there sees him by the fountain while they play together (not saved:
// your own pour is what keeps him)
function fn229NpcWant(){try{if(fn229NpcOwn())return true;return !!(FN229.peer&&typeof MP!='undefined'&&MP.on&&performance.now()-FN229.peer<30000)}catch(_){return false}}
function fn229Tell(){try{if(typeof MP!='undefined'&&MP.on&&MP.room&&Object.keys(MP.rh||{}).length&&fn229NpcOwn())MP.room.emit('ev',{r:-7,l:[['kv229']]}).catch(()=>{})}catch(_){}}
if(typeof mpOnEV=='function'){const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(MP.on&&!msg.sameTab&&d&&d.r===-7&&Array.isArray(d.l)&&d.l.some(q=>Array.isArray(q)&&q[0]==='kv229'))FN229.peer=performance.now()}catch(_){}return f.apply(this,arguments)}}
function fn229Npc(){const want=fn229NpcWant(),N=FN229.npc;if(!want){if(N){fn229FigFree(N.F);if(N.sh.parent)N.sh.parent.remove(N.sh);N.sh.material.map.dispose();N.sh.material.dispose();N.sh.geometry.dispose();FN229.npc=null}return null}
  if(N)return N;const T=TOWNS[0],y=GH(T.cx,T.cy),F=fn229Figure({only:'man'}),x=T.cx+FN229.man[0],z=T.cy+FN229.man[1];F.st.robe=1;F.st.eye=1;F.st.flut=.12;fn229Shape(F,1);
  F.root.position.set(x,y,z);F.ry0=Math.atan2(x-T.cx,z-T.cy);F.root.rotation.y=F.ry0;fn229Pose(F,FN229POSE.idle);fn229WingSet(F,{open:0});scene.add(F.root);
  const sh=fn229Blob();sh.position.set(x,y+.04,z);scene.add(sh);return FN229.npc={F,sh,x,z,y,ry:F.ry0,hy:0,t:0}}
function fn229NpcTick(dt){if(FN229.run)return;if((FN229.pt=(FN229.pt||0)-dt)<=0){FN229.pt=6;try{if(typeof MP!='undefined'&&MP.on){fn229Tell();fn229Npc()}}catch(_){}}
  const N=FN229.npc;if(!N)return;const F=N.F,d=Math.hypot(pl.position.x-N.x,pl.position.z-N.z),on=d<90&&(typeof curIns!='function'||!curIns());F.root.visible=on;N.sh.visible=on;if(!on||d>60)return;
  N.t+=dt;const t=N.t,L=FN229.L;L.t.value=t;fn229LightTown({T:TOWNS[0],y0:N.y});
  // he turns to whoever comes near: the body a little, the head the rest
  let a=Math.atan2(pl.position.x-N.x,pl.position.z-N.z)-N.ry0;a=Math.atan2(Math.sin(a),Math.cos(a));const near=d<11?1:0,tb=near*Math.max(-1.1,Math.min(1.1,a))*.55;N.ry+=(N.ry0+tb-N.ry)*Math.min(1,dt*1.6);F.root.rotation.y=N.ry;
  let h=Math.atan2(pl.position.x-N.x,pl.position.z-N.z)-N.ry;h=Math.atan2(Math.sin(h),Math.cos(h));N.hy+=(near*Math.max(-.9,Math.min(.9,h))-N.hy)*Math.min(1,dt*2.2);
  const P=Object.assign({},FN229POSE.idle),br=Math.sin(t*1.3);P.ch=[.012*br,0,0];P.sp=[.008*br,0,0];P.nk=[.04,N.hy*.4,0];P.hd=[.02*Math.sin(t*.37),N.hy*.6,0];P.hL=[-.07,1.06+.004*br,.2];P.hR=[.07,1.03+.004*br,.21];fn229Pose(F,P)}
{const f=homeTick;homeTick=function(dt,now){const r=f.apply(this,arguments);try{fn229NpcTick(dt||0)}catch(e){if(!FN229.nerr){FN229.nerr=1;console.warn('v229 npc',e)}}return r}}

// ---------------- when: F at the fountain with the last essence ----------------
{const f=se208Pour;se208Pour=function(i){try{if(i===fn229Last()&&se208St(i)===2&&!SE208.pour&&fn229Want()){SE208.pour=1;if(fn229Play({i}))return;SE208.pour=0}}catch(e){console.warn('v229 pour',e);SE208.pour=0}return f.apply(this,arguments)}}
{const f=se208Claim;se208Claim=function(){const r=f.apply(this,arguments);try{fn229Npc()}catch(_){}return r}}
// saved per character; he is there whenever the last Sovereign's essence is in the fountain (old saves, cheats)
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.fn229=FN229.seen?1:0}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{FN229.seen=s&&s.fn229?1:0}catch(_){}return r}}
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);try{fn229Npc()}catch(e){console.warn('v229 load',e)}return r}}
{const f=ccBegin;ccBegin=function(){FN229.seen=0;const r=f.apply(this,arguments);try{fn229Npc()}catch(_){}return r}}
// Settings → Cheats → Cinematics: always listed (v230: it is a cheat preview now, so it no longer waits for the pour)
(function(){if(typeof CV215=='undefined')return;const E={z:'fn229',n:'The Fountain',s:'The last essence · the Voice beneath Duskhold'};
  CV215.L.push(E);
  {const f=cv215Seen;cv215Seen=function(z){if(z==='fn229')return !!FN229.seen;return f.apply(this,arguments)}}
  {const f=cv215Play;cv215Play=function(z){if(z!=='fn229')return f.apply(this,arguments);const why=cv215Why();if(why){try{say('🎬 '+why)}catch(_){}return false}
    try{const T=TOWNS[0];if(typeof curIns=='function'&&curIns()||Math.hypot(pl.position.x-T.cx,pl.position.z-T.cy)>60){say('🎬 Watch this one from Duskhold.');return false}}catch(_){}
    const s=FN229.seen;const ok=fn229Play({rp:1});FN229.seen=s;return ok}}
  {const f=cv215Busy;cv215Busy=function(){return FN229.run||f.apply(this,arguments)}}})();
