// ================= v232 Seraphel — the Sunward Court (arena), the sun, the obelisks' shadows, the sundial's hand, the record =================
// The last Warden's arena is the Citadel's unused Wave Trial instance (insG(5,4)), dressed as a temple court open to the sky: pale
// veined marble inlaid with a sundial the width of the court in gold, a broken colonnade round it, braziers of white fire, long
// banners, a low sun — and four gold-banded obelisks with crystal tips standing on the dial, whose shadows are the answer to her
// Verdict (4051).
//  * The sun (SR.S.sun, an angle): it creeps round the sky all the time; each obelisk's shadow lies on the floor away from it
//    (6.5 long; 4.2 at High Noon). During a Verdict it moves four times as fast, so the shadows swing while she counts.
//  * Verdict: when the light comes, a hero inside a standing obelisk's shadow is spared and that obelisk's crystal turns the light
//    back: she is wounded 4% and 'broken'. Each obelisk can do it twice, then it shatters. Otherwise: the blow (2.4), Judged, she heals 4%.
//  * The sundial's hand (Phase II; SR.S.hand): a ray from the middle of the court to its edge, sweeping round (it changes direction
//    after every Verdict). Touching it burns (once a second) and marks you Judged; a dodge carries you through.
var SR232D=wk232Reg({key:'dawn',zi:5,name:'Seraphel',title:'the Dawn Arbiter',icon:'☀',lv:55,place:'The Sunward Court',base:'akorror',hpK:1.45,dmK:1.25,
  card:['last Warden of the Balance','The light closes the way behind you'],restTxt:'the heart of the dial',riftCol:0xfff2c8,
  B:{name:'Seraphel',col:SR232.col,body:1.3,ph2:.55,poise:.1,headJ:'head',turnA:4.2,edge:1.4,
    ai:{pref:3.6,walk:2.7,run:5.0,turn:3.2,rest:[.65,1.2],ph2r:.64,strafe:.6,near:1.9},
    build:sr232Build,loco:sr232Loco,post:sr232Post,P:SR232P,M:SR232M,
    stag:[[.3,'stag','o'],[2.2,'stag','l',.02],[2.75,'cRec','io']],stagT:2.75,die:[[.5,'stag','o'],[1.6,'dead','i'],[2.1,'dead','l']]},
  done:()=>FN232.n>3,
  S:{ob:[],sun:.6,noon:0,hand:0,hd:1,hT:0,ver:0,vk:0,len:6.5},
  build(D,root,LS){const L=D.L,S=D.S,rn=svRng(2352),y=(x,z)=>GH(x,z);
    const M={marble:new THREE.MeshStandardMaterial({color:0xd9d2c2,roughness:.5,metalness:.05,flatShading:true}),marble2:new THREE.MeshStandardMaterial({color:0xb9b09c,roughness:.6,flatShading:true}),gold:new THREE.MeshStandardMaterial({color:0xcfa43a,roughness:.3,metalness:.8,flatShading:true}),
      dark:new THREE.MeshStandardMaterial({color:0x6a6458,roughness:.8,flatShading:true}),cloth:new THREE.MeshStandardMaterial({color:0xe9e2d0,roughness:.9,flatShading:true,side:THREE.DoubleSide}),cloth2:new THREE.MeshStandardMaterial({color:0xb0862a,roughness:.8,flatShading:true,side:THREE.DoubleSide}),
      fire:new THREE.MeshBasicMaterial({color:0xfff2c8}),crys:new THREE.MeshStandardMaterial({color:0xfff6d8,emissive:0xffe9a0,emissiveIntensity:1.0,roughness:.15,flatShading:true,transparent:true,opacity:.95})};LS.M=M;
    // the floor: marble, and the sundial in gold (rings, hour marks, rays); the gold holds light and blazes at High Noon
    const dial=(c,Sz,glow)=>{const C=Sz/2,R=Sz*.39;c.strokeStyle=glow?'rgba(255,225,150,.9)':'rgba(176,134,42,.95)';c.lineWidth=glow?3:4;[1,.86,.5,.16].forEach(k=>{c.beginPath();c.arc(C,C,R*k,0,6.283);c.stroke()});
        for(let i=0;i<24;i++){const a=i/24*6.283,r0=i%2?.86:.5;c.lineWidth=i%6==0?(glow?4:6):2;c.beginPath();c.moveTo(C+Math.sin(a)*R*r0,C+Math.cos(a)*R*r0);c.lineTo(C+Math.sin(a)*R,C+Math.cos(a)*R);c.stroke()}
        for(let i=0;i<12;i++){const a=i/12*6.283+.26;c.lineWidth=2;c.beginPath();c.moveTo(C+Math.sin(a)*R*.16,C+Math.cos(a)*R*.16);c.lineTo(C+Math.sin(a+.12)*R*.5,C+Math.cos(a+.12)*R*.5);c.lineTo(C+Math.sin(a+.26)*R*.16,C+Math.cos(a+.26)*R*.16);c.stroke()}
        c.fillStyle=glow?'rgba(255,235,170,.9)':'rgba(176,134,42,.95)';for(let i=0;i<12;i++){const a=i/12*6.283;c.save();c.translate(C+Math.sin(a)*R*.93,C+Math.cos(a)*R*.93);c.rotate(-a);c.fillRect(-2,-9,4,18);if(i%3==0){c.fillRect(-8,-9,4,18);c.fillRect(4,-9,4,18)}c.restore()}};
    LS.floorM=wk232Floor(D,root,{base:'#cfc8b8',seed:2353,spk:[[232,226,212],[190,182,166]],spkN:340,spkR:16,spkA:.35,crack:'rgba(120,112,98,.35)',crackN:50,rough:.45,metal:.08,em:0xffe9a0,emI:.3,paint:(c,r,Sz)=>dial(c,Sz,0),glow:(c,r,Sz)=>dial(c,Sz,1)});
    // the colonnade: fluted columns on plinths, some broken, lintels across a few pairs
    const colG=svG('sr_col',()=>svLoft([[0,.62,.62],[.3,.62,.62],[.42,.46,.46],[5.6,.4,.4],[5.75,.56,.56],[6.0,.6,.6]],10)),brkG=svG('sr_cbk',()=>svLoft([[0,.62,.62],[.3,.62,.62],[.42,.46,.46],[2.2,.44,.44],[2.6,.3,.38,.1,.05]],10));
    const tops=[];wk232Around(D,root,16,14.4,14.9,(i,a,x,z,yy,r)=>{const br=i%5==2,o=new THREE.Mesh(br?brkG:colG,i%2?M.marble:M.marble2);o.position.set(x,yy-.1,z);o.rotation.y=r()*6;o.castShadow=true;if(!br)tops.push([x,yy+5.9,z,i]);
      else for(let k=0;k<3;k++){const d=new THREE.Mesh(wk232Lump(40+k,1,1,.2),M.marble2);d.position.set(x+(r()-.5)*2.4,yy+.2,z+(r()-.5)*2.4);d.scale.set(.5,.36,.44);d.rotation.set(r(),r()*6,r());root.add(d)}return o},2354,.17);
    for(let k=0;k<tops.length-1;k++){const a=tops[k],b=tops[k+1];if(b[3]-a[3]!==1||k%3==2)continue;const dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz),o=new THREE.Mesh(svG('sr_lin',()=>new THREE.BoxGeometry(1,.6,1.1).toNonIndexed()),M.marble);o.position.set((a[0]+b[0])/2,a[1]+.3,(a[2]+b[2])/2);o.scale.x=l+1.2;o.rotation.y=-Math.atan2(dz,dx);root.add(o);
      const bn=new THREE.Mesh(svG('sr_bn',()=>{const s=new THREE.Shape();s.moveTo(-.6,0);s.lineTo(.6,0);s.lineTo(.6,-3.2);s.lineTo(0,-3.9);s.lineTo(-.6,-3.2);s.lineTo(-.6,0);return new THREE.ShapeGeometry(s,1)}),k%2?M.cloth:M.cloth2);bn.position.set((a[0]+b[0])/2,a[1],(a[2]+b[2])/2);bn.rotation.y=-Math.atan2(dz,dx);root.add(bn)}
    // braziers of white fire between the columns
    LS.fires=[];wk232Around(D,root,8,12.9,13.2,(i,a,x,z,yy,r)=>{const g=new THREE.Group();const st=new THREE.Mesh(svG('sr_bz',()=>svLoft([[0,.34,.34],[.2,.14,.14],[1.0,.12,.12],[1.2,.4,.4],[1.36,.46,.46]],8,{cap:false})),M.gold);g.add(st);
      const f=new THREE.Mesh(svG('sr_bf',()=>svHorn(.3,.9,0,.1,6,3)),M.fire);f.position.y=1.3;f.rotation.x=-Math.PI/2;g.add(f);const gl=kqSpr(0xfff2c8,2.4);gl.position.y=1.7;g.add(gl);LS.fires.push(f);g.position.set(x,yy,z);return g},2355,.3);
    wk232Light(D,LS,0xfff0c8,1.3,28,L.cx,L.y+8,L.cz);LS.sunL=wk232Light(D,LS,0xffe9a0,0,40,L.cx,L.y+10,L.cz);
    // the sun: a low disc far out, where the light comes from
    {const g=kqSpr(0xfff2c8,16);g.material=g.material.clone();g.material.fog=false;root.add(g);LS.sun=g;const c=kqSpr(0xffffff,6);c.material=c.material.clone();c.material.fog=false;root.add(c);LS.sunC=c}
    // the four obelisks and their shadows
    S.ob=[0,1,2,3].map(k=>{const a=Math.PI/4+k*Math.PI/2,x=L.cx+Math.sin(a)*5.6,z=L.cz+Math.cos(a)*5.6,yy=y(x,z),g=new THREE.Group(),gb=new THREE.Group();g.position.set(x,yy,z);gb.position.set(x,yy,z);
      const sh=new THREE.Mesh(svG('sr_ob',()=>svLoft([[0,.62,.62],[.35,.62,.62],[.45,.44,.44],[4.0,.26,.26],[4.3,.02,.02]],4,{rot:Math.PI/4})),M.marble);sh.castShadow=true;g.add(sh);
      [.9,2.2,3.5].forEach((h,i)=>{const b=new THREE.Mesh(svG('sr_obb',()=>svLoft([[-.06,1,1],[.06,1,1]],4,{rot:Math.PI/4,cap:false})),M.gold);b.position.y=h;b.scale.set(.43-i*.06,1,.43-i*.06);g.add(b)});
      const cr=new THREE.Mesh(svG('sr_obc',()=>{const q=new THREE.OctahedronGeometry(.26,0);q.scale(1,1.7,1);return q}),M.crys.clone());cr.position.y=4.75;g.add(cr);const gl=kqSpr(0xffe9a0,1.6);gl.position.y=4.75;g.add(gl);
      const st=new THREE.Mesh(svG('sr_obs',()=>svLoft([[0,.62,.62],[.35,.62,.62],[.45,.44,.44],[1.0,.4,.4],[1.3,.2,.3,.1,.05]],4,{rot:Math.PI/4})),M.marble2);gb.add(st);
      for(let q=0;q<5;q++){const o=new THREE.Mesh(wk232Lump(40+q%3,1,1,.2),M.marble2),ra=q*1.3;o.position.set(Math.sin(ra)*(1+q*.2),.15,Math.cos(ra)*(.9+q*.15));o.scale.set(.34,.22,.3);o.rotation.set(q,q*2,q);gb.add(o)}gb.visible=false;
      const shd=new THREE.Mesh(svG('sr_shd',()=>{const q=new THREE.PlaneGeometry(1,1);q.rotateX(-Math.PI/2);q.translate(0,0,.5);return q}),new THREE.MeshBasicMaterial({color:0x06070c,transparent:true,opacity:.5,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3}));
      shd.material.userData.noFade135=1;shd.userData.lpsSkip=1;shd.position.set(x,yy+.09,z);root.add(shd);root.add(g,gb);return {x,z,y:yy,g,gb,cr,gl,shd,uses:2,alive:1,k:W*Math.round(z)+Math.round(x)}});
    // the sundial's hand (Phase II)
    {const g=new THREE.Group();g.position.set(L.cx,L.y,L.cz);const fl=new THREE.Mesh(svG('sr_hf',()=>{const q=new THREE.PlaneGeometry(1,1);q.rotateX(-Math.PI/2);q.translate(0,0,.5);return q}),new THREE.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-5}));
      fl.scale.set(1.0,1,12.6);fl.position.y=.15;const wl=new THREE.Mesh(svG('sr_hw',()=>{const q=new THREE.PlaneGeometry(1,1);q.rotateY(Math.PI/2);q.translate(0,.5,.5);return q}),new THREE.MeshBasicMaterial({color:0xffe9a0,map:SPR,transparent:true,opacity:.34,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));
      wl.scale.set(1,2.6,12.6);[fl,wl].forEach(m=>{m.userData.lpsSkip=1;m.material.userData.noFade135=1;g.add(m)});g.visible=false;root.add(g);LS.hand=g}
    LS.glare=wk232Disc(root,0,13.4,0xfff2c8,L.y+.16);LS.glare.position.set(L.cx,L.y+.16,L.cz);
    D.sync(D)},
  sync(D){const S=D.S;S.ob.forEach(o=>{o.g.visible=!!o.alive;o.gb.visible=!o.alive;o.shd.visible=!!o.alive;if(o.alive)CBLK.add(o.k);else CBLK.delete(o.k)})},
  reset(D,won){const S=D.S;sr232Noon(D,0);sr232VerdictEnd(D);S.ob.forEach(o=>{o.alive=1;o.uses=2});D.sync(D)},
  hud(D,e){return e.sv.ph>1?' · obelisks '+D.S.ob.filter(o=>o.alive).length:''},
  won(D,e){setTimeout(()=>{try{fn232WardenDown(3)}catch(err){console.error('fn232 warden',err)}},1900)},
  tick(D,dt,now,t){const LS=D.LS,S=D.S,L=D.L;S.sun+=dt*(S.ver?.42:.1)*S.hd;const sx=Math.sin(S.sun),sz=Math.cos(S.sun);
    // the sun sits opposite the shadows; the shadows lie along (sx, sz)
    const up=S.noon?16:9;LS.sun.position.set(L.cx-sx*30,L.y+up,L.cz-sz*30);LS.sunC.position.copy(LS.sun.position);LS.sun.scale.setScalar((S.ver?22:16)+Math.sin(t*2));LS.sunL.position.set(L.cx-sx*9,L.y+9,L.cz-sz*9);LS.sunL.intensity=(S.noon?.9:.4)+(S.ver?1.4*S.vk:0);
    S.len+=((S.noon?4.2:6.5)-S.len)*Math.min(1,dt*.8);S.ob.forEach((o,i)=>{if(!o.alive)return;o.shd.rotation.y=S.sun;o.shd.scale.set(2.5,1,S.len);o.shd.material.opacity=S.ver?.62+.1*Math.sin(t*8):.42;o.cr.rotation.y+=dt*(S.ver?5:1);o.gl.scale.setScalar((S.ver?2.6:1.6)+.2*Math.sin(t*5+i));
      o.cr.material.emissiveIntensity=o.uses>1?1.1:.45});
    LS.fires.forEach((f,i)=>{f.scale.set(1+.15*Math.sin(t*11+i),1+.2*Math.sin(t*13+i*2),1)});LS.floorM.emissiveIntensity=.25+(S.noon?.45:0)+.06*Math.sin(t*1.2)+(S.ver?1.2*S.vk:0);
    // Verdict: the glare builds on the open floor
    if(S.ver){S.vk=Math.min(1,S.vk+dt/6.2);LS.glare.visible=true;LS.glare.material.opacity=.05+.3*S.vk*S.vk}else if(LS.glare.visible){LS.glare.material.opacity-=dt*.9;if(LS.glare.material.opacity<=0)LS.glare.visible=false}
    LS.hand.visible=!!S.noon&&!S.ver;if(LS.hand.visible){LS.hand.rotation.y=S.hand;if(Math.random()<dt*20){const r=Math.random()*12;burst(new THREE.Vector3(L.cx+Math.sin(S.hand)*r,L.y+.4,L.cz+Math.cos(S.hand)*r),0xfff2c8,1,.4,1.2,.4)}}},
  fight(D,e,dt,now){const S=D.S,A=D.A;if(!S.noon||S.ver||hero.hp<=0)return;S.hand+=dt*.55*S.hd;S.hT-=dt;
    if(S.hT<=0&&svIn({k:'l',w:1.0,l:12.6,b:0},{x:A.cx,z:A.cz,a:S.hand},pl.position,.1)){if(wk232Zap(e,.6,'m')){S.hT=1;sr232Judge(3000);burst(gY(pl.position,.8),0xfff2c8,16,2,2,.5);svSnd('bell',.5,1.8)}}}});
function sr232Noon(D,on){const S=D.S;S.noon=on?1:0;S.hand=S.sun+Math.PI;S.hT=1.5}
function sr232Shade(D,p){const S=D.S,sx=Math.sin(S.sun),sz=Math.cos(S.sun);let best=null;for(const o of S.ob){if(!o.alive)continue;const vx=p.x-o.x,vz=p.z-o.z,al=vx*sx+vz*sz,pe=Math.abs(vx*sz-vz*sx);if(al>.5&&al<S.len+.35&&pe<1.3){best=o;break}}return best}
function sr232VerdictStart(D,e){const S=D.S;S.ver=1;S.vk=0;const n=S.ob.filter(o=>o.alive).length;
  say('☀ Seraphel lifts her sword to the sun. '+(n?'<b>Get into an obelisk’s shadow — and stay in it as it swings!</b>':'No obelisk is left standing.'));try{banner('⚠ VERDICT',n?'Stand in an obelisk’s shadow when the light comes':'No shadow is left: brace','')}catch(_){}}
function sr232VerdictEnd(D){const S=D.S;if(S.ver){S.ver=0;S.hd=-S.hd}S.vk=0}
function sr232Verdict(D,e){const S=D.S,A=D.A,P=pl.position,o=sr232Shade(D,P);
  try{flash('rgba(255,246,216,.75)')}catch(_){}shake(.7);svSnd('bell',1.5,.5);svSnd('heavy',1.3,.6);try{sk146Flash(new THREE.Vector3(A.cx,A.y+6,A.cz),0xfff2c8,7,40,500)}catch(_){}
  for(let i=0;i<60;i++){const a=Math.random()*6.283,r=Math.random()*12.5,q=new THREE.Vector3(A.cx+Math.cos(a)*r,0,A.cz+Math.sin(a)*r);if(sr232Shade(D,q))continue;burst(gY(q,.3),0xfff2c8,3,1.5,4,.7)}
  if(o){o.uses--;const tip=new THREE.Vector3(o.x,o.y+4.75,o.z),ch=svWP(e,'chest',0,0,0);try{sk146Beam(()=>tip,()=>ch,0xfff6d8,.28,.6)}catch(_){}burst(tip,0xfff2c8,60,5,2,.7);burst(ch,0xfff2c8,60,5,2,.7);dn(P,'Spared','#fff2c8',-20,1400);
    if(o.uses<=0){o.alive=0;D.sync(D);const q=new THREE.Vector3(o.x,0,o.z);burst(gY(q,2),0xd9d2c2,70,5,4,1);svSnd('crack',1.2,.7);try{sk146Debris(q,D.LS.M.marble2,12,.3,5,5,1.6)}catch(_){}say('☀ The obelisk shatters.')}
    S.ver=0;S.hd=-S.hd;svEndMove(e,true);wk232Wound(e,.04,'#fff2c8');svCast(e,'broken')}
  else{if(hero.hp>0&&wk232Zap(e,2.4,'m'))sr232Judge(8000);wk232Heal(e,.04,0xfff2c8)}}
