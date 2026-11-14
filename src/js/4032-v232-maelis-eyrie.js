// ================= v232 Maelis — the Stormcrown (arena), the storm, the copper rods, the record =================
// The second Warden's arena is the Searing Sands' unused Wave Trial instance (insG(3,4)), dressed as a mesa top under a thunderhead:
// wind-scoured sandstone scarred with fulgurite, a ring of carved hoodoos and arches, the wreck of a nest the size of a house,
// a ceiling of turning black cloud that flickers — and three tall copper rods, bound in bone and rope, which answer her Static Charge.
//  * The storm (Phase II; ML.S.storm): rain; a wind that drags you sideways round the eyrie (it turns about every 12 s); every ~2.4 s
//    a bolt falls near you, marked on the ground .9 s before (Shocked).
//  * Static Charge (ML.S.st, 4031 'static'): three charges in a row, 5.2 s each. A ring closes on you; when it bursts, a live rod
//    within 2.6 takes it (the rod is spent until she lands) and she is wounded 4%; otherwise you take the blow. Three grounded: she
//    is struck from the sky ('broken'). Each one missed heals her 4%.
var ML232D=wk232Reg({key:'roc',zi:3,name:'Maelis',title:'the Tempest Roc',icon:'🦅',lv:53,place:'The Stormcrown',base:'akorror',hpK:1.12,dmK:1.08,
  card:['second Warden of the Balance','The wind closes the pass behind you'],restTxt:'her broken nest',riftCol:0xcfeeff,
  B:{name:'Maelis',col:ML232.col,body:1.7,ph2:.55,poise:.1,headJ:'head',turnA:3.8,edge:1.7,
    ai:{pref:3.8,walk:2.6,run:4.6,turn:3.0,rest:[.7,1.25],ph2r:.66,strafe:.55,near:2.0},
    build:ml232Build,loco:ml232Loco,post:ml232Post,P:ML232P,M:ML232M,
    stag:[[.25,'stag','o'],[2.2,'stag','l',.025],[2.75,'cRec','io']],stagT:2.75,die:[[.4,'stag','o'],[1.4,'dead','i'],[2.1,'dead','l']]},
  done:()=>FN232.n>1,
  S:{rods:[],storm:0,st:null,bT:2,wind:1,wT:12},
  build(D,root,LS){const L=D.L,S=D.S,rn=svRng(2332),y=(x,z)=>GH(x,z);
    const M={sand:new THREE.MeshStandardMaterial({color:0x9a7a52,roughness:.95,flatShading:true}),sand2:new THREE.MeshStandardMaterial({color:0x7d6040,roughness:.95,flatShading:true}),dark:new THREE.MeshStandardMaterial({color:0x4a3a2c,roughness:.95,flatShading:true}),
      copper:new THREE.MeshStandardMaterial({color:0xb87333,roughness:.35,metalness:.75,flatShading:true}),verd:new THREE.MeshStandardMaterial({color:0x4f8a78,roughness:.7,metalness:.3,flatShading:true}),bone:new THREE.MeshStandardMaterial({color:0xd8ccb0,roughness:.7,flatShading:true}),
      wood:new THREE.MeshStandardMaterial({color:0x3e3026,roughness:.9,flatShading:true}),egg:new THREE.MeshStandardMaterial({color:0xd9dfe6,roughness:.5,flatShading:true})};LS.M=M;
    // the floor: sandstone slabs, drifted sand, glassy fulgurite scars that hold a little light
    LS.floorM=wk232Floor(D,root,{base:'#7a6144',seed:2333,spk:[[150,120,84],[104,82,56],[170,140,100]],spkN:520,spkR:14,spkA:.45,crack:'rgba(40,28,18,.6)',crackN:60,
      vein:['rgba(120,220,255,.75)','rgba(200,240,255,.5)'],veinN:7,blob:['rgba(120,220,255,.7)'],blobN:6,em:0x7ad8ff,emI:.35,rough:.85});
    // hoodoos: stacks of wind-cut rock round the edge, a few leaning arches
    wk232Around(D,root,26,13.6,16.2,(i,a,x,z,yy,r)=>{const g=new THREE.Group(),n=3+(i%3),s=1.1+r()*.9;let h=0;for(let k=0;k<n;k++){const w=(1.5-k*.28)*s*(.85+r()*.3),ht=(.9+r()*.9)*s,o=new THREE.Mesh(wk232Lump(10+((i+k)%5),1,1,.3),k%2?M.sand2:M.sand);
        o.position.set((r()-.5)*.3,h+ht*.5,(r()-.5)*.3);o.scale.set(w,ht*.62,w*.9);o.rotation.y=r()*6;o.castShadow=true;g.add(o);h+=ht*.82}
      const cap=new THREE.Mesh(wk232Lump(15,1,1,.25),M.dark);cap.position.y=h+.2;cap.scale.set(1.2*s,.3,1.1*s);g.add(cap);g.position.set(x,yy-.2,z);return g},2334,.16);
    [[1.1,14.0],[3.4,14.3],[5.0,14.1]].forEach(([a,r],i)=>{const x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r,o=new THREE.Mesh(svG('ml_ar',()=>svTube([[-2.4,0,0],[-2.0,2.6,0],[-.8,4.2,0],[.8,4.3,0],[2.1,2.8,0],[2.5,0,0]],[.9,.75,.6,.6,.72,.95],6)),i%2?M.sand:M.sand2);
      o.position.set(x,y(x,z)-.2,z);o.rotation.y=a+Math.PI/2;o.castShadow=true;root.add(o)});
    // loose rocks and bones inside the ring
    for(let i=0;i<26;i++){const a=rn()*6.283,r=10.8+rn()*2.6,x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r;if(Math.hypot(x-L.exit.x,z-L.exit.z)<2.6)continue;const b=i%4==0,o=new THREE.Mesh(b?svG('ml_bn',()=>svTube([[-.6,0,0],[0,.08,0],[.6,0,0]],[.07,.045,.07],5)):wk232Lump(10+i%5,1,1,.3),b?M.bone:i%2?M.sand2:M.dark);
      o.position.set(x,y(x,z)+.1,z);if(!b)o.scale.set(.3+rn()*.5,.2+rn()*.3,.3+rn()*.5);o.rotation.set(rn()*.4,rn()*6,rn()*.4);root.add(o)}
    // the nest at the back: a ring of great timbers and ribs, broken shell
    {const x=L.cx,z=L.cz-11.2,yy=y(x,z),g=new THREE.Group();g.position.set(x,yy,z);for(let k=0;k<22;k++){const a=k/22*6.283,l=2.2+rn()*1.6,o=new THREE.Mesh(svG('ml_tm',()=>new THREE.CylinderGeometry(.1,.14,1,5).toNonIndexed()),k%4?M.wood:M.bone);
        o.position.set(Math.sin(a)*2.5,.35+rn()*.5,Math.cos(a)*1.9);o.scale.set(1+rn(),l,1+rn());o.rotation.set(Math.PI/2+(rn()-.5)*.5,a+1.2+(rn()-.5)*.6,(rn()-.5)*.4);g.add(o)}
      for(let k=0;k<3;k++){const o=new THREE.Mesh(svG('ml_eg',()=>new THREE.SphereGeometry(.5,7,5,0,6.283,0,1.9).toNonIndexed()),M.egg);o.position.set(-.8+k*.8,.3,(k%2)*.5-.2);o.rotation.set(Math.PI+(k-1)*.5,k,0);o.scale.set(1,1.25,1);g.add(o)}root.add(g)}
    // the cloud: a dark turning ceiling with a bright eye, lumps of cloud round its rim
    {const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d'),gr=c.createRadialGradient(128,128,6,128,128,128);gr.addColorStop(0,'rgba(190,225,255,.95)');gr.addColorStop(.12,'rgba(70,90,120,.9)');gr.addColorStop(.5,'rgba(22,26,36,.95)');gr.addColorStop(1,'rgba(10,12,18,0)');c.fillStyle=gr;c.fillRect(0,0,256,256);
      c.globalCompositeOperation='source-atop';for(let i=0;i<70;i++){const a=i*.4,r=14+i*1.6;c.strokeStyle=`rgba(${120+rn()*80|0},${150+rn()*60|0},${190+rn()*50|0},${.08+rn()*.1})`;c.lineWidth=3+rn()*6;c.beginPath();c.arc(128,128,r,a,a+1.4+rn());c.stroke()}
      const m=new THREE.Mesh(svG('ml_cl',()=>new THREE.CircleGeometry(30,40).rotateX(Math.PI/2)),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,opacity:.92,depthWrite:false,fog:false,side:THREE.DoubleSide}));
      m.position.set(L.cx,L.y+17,L.cz);m.userData.lpsSkip=1;root.add(m);LS.cloud=m}
    wk232Light(D,LS,0x9fd8ff,1.0,26,L.cx,L.y+9,L.cz);LS.flashL=wk232Light(D,LS,0xdff6ff,0,40,L.cx,L.y+12,L.cz);
    // rain (Phase II): streaks falling through the eyrie
    {const N=420,pos=new Float32Array(N*6),g=new THREE.BufferGeometry();LS.rainP=[];for(let i=0;i<N;i++){const a=rn()*6.283,r=Math.sqrt(rn())*15;LS.rainP.push([L.cx+Math.cos(a)*r,L.y+rn()*14,L.cz+Math.sin(a)*r,9+rn()*6])}
      g.setAttribute('position',new THREE.BufferAttribute(pos,3));const ln=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xb8d8f0,transparent:true,opacity:.45,fog:false}));ln.frustumCulled=false;ln.userData.lpsSkip=1;ln.visible=false;root.add(ln);LS.rain=ln}
    // the three copper rods
    S.rods=[0,1,2].map(k=>{const a=Math.PI/3+k*Math.PI*2/3,x=L.cx+Math.sin(a)*8.2,z=L.cz+Math.cos(a)*8.2,yy=y(x,z),g=new THREE.Group();g.position.set(x,yy,z);
      for(let q=0;q<5;q++){const o=new THREE.Mesh(wk232Lump(10+q,1,1,.3),q%2?M.sand2:M.dark),ra=q*1.26;o.position.set(Math.sin(ra)*.5,.2,Math.cos(ra)*.5);o.scale.set(.45,.32,.4);g.add(o)}
      const pole=new THREE.Mesh(svG('ml_rp',()=>svLoft([[0,.16,.16],[2.2,.11,.11],[4.6,.06,.06],[5.4,.02,.02]],6)),M.copper);pole.castShadow=true;g.add(pole);
      for(let q=0;q<4;q++){const c=new THREE.Mesh(svG('ml_rc',()=>new THREE.TorusGeometry(1,.16,5,10).rotateX(Math.PI/2)),q%2?M.verd:M.copper);c.position.y=1.5+q*.8;c.scale.setScalar(.34-q*.05);g.add(c)}
      [[.9,.5],[1.3,-.6],[2.4,.3]].forEach(([h,rz],q)=>{const b=new THREE.Mesh(svG('ml_rb',()=>svTube([[-.5,0,0],[0,.06,0],[.5,0,0]],[.06,.04,.06],5)),M.bone);b.position.y=h;b.rotation.set(0,q*1.1,rz);g.add(b)});
      const tip=new THREE.Mesh(svG('ml_rt',()=>{const q=new THREE.OctahedronGeometry(.2,0);q.scale(1,2,1);return q}),ml232Mats().glass);tip.position.y=5.5;g.add(tip);const gl=kqSpr(ML232.col,1.6);gl.position.y=5.5;g.add(gl);
      const ring=wk232Disc(root,2.3,2.6,0x7ad8ff,yy+.12);ring.position.set(x,yy+.12,z);root.add(g);return {x,z,y:yy,g,tip,gl,ring,spent:0,k:W*Math.round(z)+Math.round(x)}});
    // the mark that follows you in a Static Charge
    LS.mark=wk232Disc(root,0,1,0x7ad8ff,L.y+.14);LS.markR=wk232Disc(root,.92,1,0xdff6ff,L.y+.15);
    D.sync(D)},
  sync(D){const S=D.S;S.rods.forEach(r=>CBLK.add(r.k))},
  reset(D,won){const S=D.S;ml232Storm(D,0);ml232StaticEnd(D,D.e,true);S.rods.forEach(r=>{r.spent=0})},
  hud(D,e){const st=D.S.st;return st?' · grounded '+st.ok+'/3':''},
  won(D,e){setTimeout(()=>{try{fn232WardenDown(1)}catch(err){console.error('fn232 warden',err)}},1900)},
  tick(D,dt,now,t){const LS=D.LS,S=D.S,L=D.L,on=S.storm;LS.cloud.rotation.y+=dt*(on?.5:.12);LS.floorM.emissiveIntensity=.3+.08*Math.sin(t*1.7)+(on?.15:0);
    // sheet lightning in the cloud
    S.fT=(S.fT||0)-dt;if(S.fT<=0){S.fT=(on?.6:2.5)+Math.random()*(on?1.6:5);S.fl=1;if(Math.random()<.5)try{svSnd('heavy',.25,.5)}catch(_){}}S.fl=Math.max(0,(S.fl||0)-dt*4);LS.flashL.intensity=S.fl*(on?2.4:1.2);LS.cloud.material.opacity=.86+.14*S.fl;
    // rain
    LS.rain.visible=!!on;if(on){const P=LS.rain.geometry.attributes.position,wx=S.wind*-Math.sin(t*.1)*.0;for(let i=0;i<LS.rainP.length;i++){const q=LS.rainP[i];q[1]-=q[3]*dt*2.2;if(q[1]<L.y){q[1]=L.y+14}P.setXYZ(i*2,q[0],q[1],q[2]);P.setXYZ(i*2+1,q[0]+.12*S.wind,q[1]+.7,q[2])}P.needsUpdate=true}
    // rods: a soft pulse; spent rods crackle
    S.rods.forEach((r,i)=>{const live=!!S.st&&!r.spent;r.gl.scale.setScalar(r.spent?2.6+.6*Math.sin(t*31):live?1.8+.4*Math.sin(t*6+i):on?1.2:.7);r.tip.rotation.y+=dt*(r.spent?9:1.5);
      r.ring.visible=live;if(live)r.ring.material.opacity=.4+.25*Math.sin(t*6+i);if(r.spent&&Math.random()<dt*14)burst(new THREE.Vector3(r.x,r.y+1+Math.random()*4.5,r.z),ML232.bolt,1,.8,.3,.3)})},
  fight(D,e,dt,now){const S=D.S,A=D.A;if(!S.storm||hero.hp<=0)return;
    // the wind drags you round the eyrie
    S.wT-=dt;if(S.wT<=0){S.wT=10+Math.random()*5;S.wind=-S.wind;say('💨 The wind turns.')}
    {const p=pl.position,dx=p.x-A.cx,dz=p.z-A.cz,d=Math.hypot(dx,dz)||1,k=.95*dt*S.wind;p.x+=-dz/d*k;p.z+=dx/d*k;wk232HeroIn(D,p)}
    // bolts walk the ground near you
    S.bT-=dt;if(S.bT<=0){S.bT=S.st?1.9:2.4;const a=Math.random()*6.283,r=Math.random()*4.5,q=wk232Clamp(D,new THREE.Vector3(pl.position.x+Math.cos(a)*r,0,pl.position.z+Math.sin(a)*r),.5),an={x:q.x,z:q.z,a:0},sh={k:'c',r:1.9};
      svWarn(sh,an,.9,{col:0x7ad8ff});setTimeout(()=>{if(!D.A||!D.A.f||e.dead)return;ml232Bolt(q);wk232HitNow(e,sh,an,.85,{flash:false,on:ml232Shock})},900)}}});
function ml232Storm(D,on){const S=D.S;S.storm=on?1:0;S.bT=2;S.wT=8}
function ml232StaticStart(D,e){const S=D.S;S.rods.forEach(r=>{r.spent=0});S.st={i:0,t:0,ok:0,T:5.2,n:-1};
  say('⚡ Maelis climbs into the storm. <b>The charge is on you: reach a copper rod before it bursts!</b>');try{banner('⚠ STATIC CHARGE','Stand by a copper rod when the ring closes · a fresh rod each time','')}catch(_){}}
function ml232StaticTick(D,e,dt,t){const S=D.S,st=S.st,LS=D.LS;if(!st||st.i>=3)return;st.t+=dt;const k=Math.min(1,st.t/st.T),p=pl.position,y=GH(p.x,p.z)+.14;
  LS.mark.visible=LS.markR.visible=true;LS.mark.position.set(p.x,y,p.z);LS.markR.position.set(p.x,y+.01,p.z);const r=3.2*(1-k)+.5;LS.mark.scale.set(r,1,r);LS.mark.material.opacity=.12+.3*k;LS.markR.scale.set(3.7,1,3.7);LS.markR.material.opacity=.5+.3*Math.sin(st.t*10);
  if(Math.random()<dt*(6+20*k))burst(gY(p,.5+Math.random()*1.5),ML232.bolt,1,.8,.4,.3);
  const left=Math.ceil(st.T-st.t);if(left!==st.n&&left<=3&&left>0){st.n=left;popT(p,String(left),'#cfeeff',true);svSnd('charge',.5,1.2+.2*(3-left))}
  if(st.t<st.T)return;
  // it bursts: a live rod close by takes it, or you do
  let rod=null,bd=2.6;S.rods.forEach(q=>{if(q.spent)return;const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<bd){bd=d;rod=q}});
  if(rod){rod.spent=1;st.ok++;const a=new THREE.Vector3(rod.x,rod.y+5.5,rod.z);try{const p0=gY(p,1.2),p1=svWP(e,'chest',0,0,0);sk146Beam(()=>p0,()=>a,0xbfeaff,.14,.35);sk146Beam(()=>a,()=>p1,0xdff6ff,.2,.45)}catch(_){}
    burst(a,ML232.bolt,50,5,2,.6);svSnd('crack',1.2,1.6);svSnd('bell',.6,1.6);shake(.3);wk232Wound(e,.04,'#cfeeff');popT(p,'GROUNDED '+st.ok+'/3','#cfeeff',true);burst(svWP(e,'chest',0,0,0),ML232.bolt,40,5,2,.6)}
  else{ml232Bolt(p.clone(),true);if(wk232Zap(e,2.0,'m'))ml232Shock();popT(p,'STRUCK','#ff9a8a',true)}
  st.i++;st.t=0;st.n=-1;
  if(st.i>=3){LS.mark.visible=LS.markR.visible=false;if(st.ok>=3){S.st=null;svEndMove(e,true);svCast(e,'broken')}}}
function ml232StaticEnd(D,e,silent){const S=D.S,LS=D.LS,st=S.st;if(LS&&LS.mark){LS.mark.visible=false;LS.markR.visible=false}S.st=null;S.rods.forEach(r=>{r.spent=0});
  if(st&&!silent&&e&&!e.dead){const miss=3-st.ok;if(miss>0){wk232Heal(e,.04*miss,0xbfeaff);say('⚡ The storm feeds her: '+miss+' charge'+(miss>1?'s':'')+' went ungrounded.')}}}
