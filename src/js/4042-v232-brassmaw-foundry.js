// ================= v232 Brassmaw — the Sunken Foundry (arena), Heat, the quench pools, the hot floor, the record =================
// The third Warden's arena is the Dirge's unused Wave Trial instance (insG(4,4)), dressed as a foundry sunk in the earth: a floor
// of black iron plates with fire in the seams round a great grate, a ring of furnace stacks with glowing mouths, gears, chains,
// slag heaps, anvils and moulds, a crucible on a gantry — and two stone quench pools sunk in the floor, east and west.
//  * Heat (e.sv.heat 0..1, on the boss bar): climbs all the time (a full bar in ~75 s; ~48 s in Phase II), not while he is staggered.
//  * Quench pools (BM.S.pools): a pool with water in it and Brassmaw within 1.9 of its middle (Heat ≥ 30%): steam, Heat to nothing,
//    he is wounded 4% and 'broken' (QUENCHED, a long stagger); the pool is dry for 45 s.
//  * Meltdown (Heat full → the 'meltdown' move): 4.5 s of warning, then a blast across the whole foundry (2.4). Standing within 2.0
//    of a pool with water in it spares you; that pool boils dry too. He heals 5%, Heat starts again at 30%.
//  * The hot floor (Phase II; BM.S.fl): the four quarters heat in turn: 2 s glowing, 3.5 s burning (damage, Seared), then cool.
var BM232D=wk232Reg({key:'kiln',zi:4,name:'Brassmaw',title:'the Kiln Colossus',icon:'⚒',lv:54,place:'The Sunken Foundry',base:'akorror',hpK:1.28,dmK:1.16,
  card:['third Warden of the Balance','The gate drops behind you'],restTxt:'the great grate',riftCol:0xffc890,
  B:{name:'Brassmaw',col:BM232.col,body:2.0,ph2:.55,poise:.1,headJ:'head',turnA:2.8,edge:2.0,
    ai:{pref:3.3,walk:2.0,run:3.4,turn:2.2,rest:[.8,1.4],ph2r:.68,strafe:.3,near:2.2},
    build:bm232Build,loco:bm232Loco,post:bm232Post,P:BM232P,M:BM232M,
    stag:[[.25,'stag','o'],[2.2,'stag','l',.025],[2.75,'cRec','io']],stagT:2.75,die:[[.5,'stag','o'],[1.6,'dead','i'],[2.1,'dead','l']]},
  done:()=>FN232.n>2,
  S:{pools:[],fl:0,q:0,qT:0,qS:0,zT:0},
  build(D,root,LS){const L=D.L,S=D.S,rn=svRng(2342),y=(x,z)=>GH(x,z),MB=bm232Mats();
    const M={iron:new THREE.MeshStandardMaterial({color:0x26282d,roughness:.6,metalness:.55,flatShading:true}),iron2:new THREE.MeshStandardMaterial({color:0x383b42,roughness:.65,metalness:.5,flatShading:true}),soot:new THREE.MeshStandardMaterial({color:0x121214,roughness:.95,flatShading:true}),
      brass:new THREE.MeshStandardMaterial({color:0xa8822e,roughness:.45,metalness:.7,flatShading:true}),brick:new THREE.MeshStandardMaterial({color:0x4a2a20,roughness:.95,flatShading:true}),stone:new THREE.MeshStandardMaterial({color:0x4a4a4c,roughness:.9,flatShading:true}),
      glow:new THREE.MeshBasicMaterial({color:0xff8a2a}),water:new THREE.MeshStandardMaterial({color:0x1c4a5a,emissive:0x2a8ab0,emissiveIntensity:.55,roughness:.1,metalness:.2,transparent:true,opacity:.9,polygonOffset:true,polygonOffsetFactor:-3})};LS.M=M;M.water.userData.noFade135=1;
    // the floor: iron plates, rivets, fire in the seams, the grate in the middle
    LS.floorM=wk232Floor(D,root,{base:'#1b1c20',seed:2343,spk:[[44,46,52],[26,26,30]],spkN:260,spkR:9,spkA:.4,rough:.55,metal:.5,em:0xff6a1a,emI:.5,
      paint(c,r,Sz){const N=11,w=Sz/N;c.strokeStyle='rgba(0,0,0,.8)';c.lineWidth=3;for(let i=0;i<=N;i++){c.beginPath();c.moveTo(i*w,0);c.lineTo(i*w,Sz);c.stroke();c.beginPath();c.moveTo(0,i*w);c.lineTo(Sz,i*w);c.stroke()}
        c.fillStyle='rgba(150,120,60,.8)';for(let i=0;i<N;i++)for(let j=0;j<N;j++)[[.12,.12],[.88,.12],[.12,.88],[.88,.88]].forEach(([u,v])=>{c.beginPath();c.arc((i+u)*w,(j+v)*w,2.2,0,6.283);c.fill()});
        c.strokeStyle='rgba(120,96,48,.9)';c.lineWidth=5;c.beginPath();c.arc(Sz/2,Sz/2,Sz*.115,0,6.283);c.stroke();c.fillStyle='rgba(8,8,10,.9)';c.beginPath();c.arc(Sz/2,Sz/2,Sz*.105,0,6.283);c.fill();
        c.strokeStyle='rgba(70,72,80,1)';c.lineWidth=4;for(let k=-5;k<=5;k++){c.beginPath();c.moveTo(Sz/2+k*9,Sz/2-Math.sqrt(Math.max(0,(Sz*.105)**2-(k*9)**2)));c.lineTo(Sz/2+k*9,Sz/2+Math.sqrt(Math.max(0,(Sz*.105)**2-(k*9)**2)));c.stroke()}},
      glow(c,r,Sz){const N=11,w=Sz/N;c.strokeStyle='rgba(255,120,30,.55)';c.lineWidth=1.6;for(let i=0;i<=N;i++){c.beginPath();c.moveTo(i*w,0);c.lineTo(i*w,Sz);c.stroke();c.beginPath();c.moveTo(0,i*w);c.lineTo(Sz,i*w);c.stroke()}
        const gr=c.createRadialGradient(Sz/2,Sz/2,0,Sz/2,Sz/2,Sz*.105);gr.addColorStop(0,'rgba(255,150,50,.9)');gr.addColorStop(1,'rgba(255,90,20,.25)');c.fillStyle=gr;c.beginPath();c.arc(Sz/2,Sz/2,Sz*.105,0,6.283);c.fill()}});
    // furnace stacks round the wall: brick drums with a glowing mouth, iron bands, a chimney
    wk232Around(D,root,12,14.4,15.4,(i,a,x,z,yy,r)=>{const g=new THREE.Group(),s=1+r()*.3;const dr=new THREE.Mesh(svG('bm_fd',()=>svLoft([[0,1.7,1.7],[2.4,1.6,1.6],[3.6,1.1,1.1],[8.5,.7,.7]],10)),i%2?M.brick:M.soot);dr.scale.set(s,1,s);dr.castShadow=true;g.add(dr);
      [.9,2.2].forEach(h=>{const b=new THREE.Mesh(svG('bm_fb',()=>svLoft([[-.1,1.72,1.72],[.1,1.72,1.72]],10,{cap:false})),M.iron);b.position.y=h;b.scale.set(s,1,s);g.add(b)});
      const mo=new THREE.Mesh(svG('bm_fm',()=>{const q=new THREE.CircleGeometry(.75,10,0,Math.PI);q.scale(1,1.5,1);return q}),M.glow);mo.position.set(0,.35,1.62*s);g.add(mo);const gl=kqSpr(0xff7a2a,2.6);gl.position.set(0,.9,1.8*s);g.add(gl);
      g.position.set(x,yy-.1,z);g.rotation.y=a+Math.PI;return g},2344,.2);
    // gears, slag heaps, anvils, moulds between them
    wk232Around(D,root,20,12.6,13.8,(i,a,x,z,yy,r)=>{const k=i%4,g=new THREE.Group();
      if(k==0){const gr=new THREE.Mesh(svG('bm_gr',()=>{const s=new THREE.Shape();for(let q=0;q<24;q++){const aa=q/24*6.283,rr=q%2?1:.82;q?s.lineTo(Math.cos(aa)*rr,Math.sin(aa)*rr):s.moveTo(rr,0)}const h=new THREE.Path();h.absarc(0,0,.3,0,6.283,true);s.holes.push(h);return new THREE.ExtrudeGeometry(s,{depth:.22,bevelEnabled:false})}),r()<.5?M.brass:M.iron2);gr.scale.setScalar(1.3+r());gr.rotation.set(-.3-r()*.5,r()*6,0);gr.position.y=.5;g.add(gr)}
      else if(k==1){for(let q=0;q<4;q++){const o=new THREE.Mesh(wk232Lump(20+q,1,1,.4),q%2?MB.rock:M.soot);o.position.set((r()-.5)*1.2,.2+q*.12,(r()-.5)*1.2);o.scale.set(.8-q*.12,.4,.7-q*.1);g.add(o)}const e2=new THREE.Mesh(wk232Lump(24,1,1,.4),MB.slag);e2.position.y=.5;e2.scale.set(.3,.16,.28);g.add(e2)}
      else if(k==2){const b=new THREE.Mesh(svG('bm_an',()=>svLoft([[0,.5,.34],[.3,.3,.22],[.6,.26,.2],[.72,.62,.3],[.95,.66,.3]],4,{rot:.785})),M.iron);b.castShadow=true;g.add(b);const st=new THREE.Mesh(svG('bm_as',()=>new THREE.CylinderGeometry(.42,.48,.5,7).toNonIndexed()),M.stone);st.position.y=-.05;g.add(st)}
      else{for(let q=0;q<3;q++){const o=new THREE.Mesh(svG('bm_ig',()=>new THREE.BoxGeometry(.7,.16,.3).toNonIndexed()),q==1?MB.slag:M.brass);o.position.set(0,.1+q*.17,(q%2)*.1);o.rotation.y=q*.5;g.add(o)}}
      g.position.set(x,yy,z);g.rotation.y=r()*6;return g},2345,.22);
    // chains hanging from the dark, and the crucible on its gantry at the back
    for(let i=0;i<10;i++){const a=rn()*6.283,r=11.5+rn()*2.5,x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r,o=new THREE.Mesh(svG('bm_cn',()=>new THREE.CylinderGeometry(.05,.05,1,4).toNonIndexed()),M.iron2),l=5+rn()*4;o.position.set(x,y(x,z)+10-l/2,z);o.scale.set(1,l,1);root.add(o);
      const hk=new THREE.Mesh(svG('bm_hk',()=>new THREE.TorusGeometry(.22,.05,4,8,4.2)),M.iron);hk.position.set(x,y(x,z)+10-l-.2,z);root.add(hk)}
    {const x=L.cx,z=L.cz-12.2,yy=y(x,z),g=new THREE.Group();g.position.set(x,yy,z);[-2.2,2.2].forEach(ox=>{const p=new THREE.Mesh(svG('bm_gp',()=>new THREE.BoxGeometry(.4,6,.4).toNonIndexed()),M.iron);p.position.set(ox,3,0);g.add(p)});
      const bm=new THREE.Mesh(svG('bm_gb',()=>new THREE.BoxGeometry(5,.4,.5).toNonIndexed()),M.iron2);bm.position.y=6;g.add(bm);const cr=new THREE.Mesh(svG('bm_cr',()=>svLoft([[0,.6,.6],[.5,1.1,1.1],[1.6,1.2,1.2]],10,{cap:false})),M.soot);cr.position.y=3.4;cr.rotation.x=.25;g.add(cr);
      const mt=new THREE.Mesh(svG('bm_cm',()=>new THREE.CircleGeometry(1.1,10).rotateX(-Math.PI/2)),M.glow);mt.position.set(0,4.85,.35);mt.rotation.x=.25;g.add(mt);const gl=kqSpr(0xff8a2a,5);gl.position.y=5.2;g.add(gl);root.add(g);LS.cruc=gl}
    wk232Light(D,LS,0xff8a3a,1.5,24,L.cx,L.y+5,L.cz);wk232Light(D,LS,0xff6a1a,1.2,14,L.cx,L.y+4,L.cz-10);
    // the two quench pools
    S.pools=[-1,1].map(s=>{const x=L.cx+s*6.6,z=L.cz+.4,yy=y(x,z),g=new THREE.Group();g.position.set(x,yy,z);
      for(let k=0;k<12;k++){const a=k/12*6.283,o=new THREE.Mesh(wk232Lump(30+k%4,1,1,.25),k%3?M.stone:M.iron2);o.position.set(Math.sin(a)*2.2,.1,Math.cos(a)*2.2);o.scale.set(.46,.26,.36);o.rotation.y=a;g.add(o)}
      const bed=new THREE.Mesh(svG('bm_pb',()=>new THREE.CircleGeometry(2.05,24).rotateX(-Math.PI/2)),M.soot);bed.position.y=.05;g.add(bed);
      const wm=M.water.clone();wm.userData.noFade135=1;const w=new THREE.Mesh(svG('bm_pw',()=>new THREE.CircleGeometry(2.0,24).rotateX(-Math.PI/2)),wm);w.position.y=.1;w.userData.noFade135=1;g.add(w);const gl=kqSpr(0x6ad0ff,2.6);gl.position.y=.6;g.add(gl);
      const ring=wk232Disc(root,1.9,2.15,0x8ae0ff,yy+.14);ring.position.set(x,yy+.14,z);root.add(g);return {x,z,y:yy,g,w,gl,ring,wet:1,t:0}});
    // the hot floor: four quarter overlays
    LS.q=[0,1,2,3].map(k=>{const g=new THREE.CircleGeometry(13.2,20,k*Math.PI/2+Math.PI/4,Math.PI/2);g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xff6a1a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-4}));
      m.material.userData.noFade135=1;m.userData.lpsSkip=1;m.position.set(L.cx,L.y+.11,L.cz);m.visible=false;root.add(m);return m});
    D.sync(D)},
  sync(D){},
  start(D,e){e.sv.heat=0},
  reset(D,won){const S=D.S;bm232Floor(D,0);S.pools.forEach(p=>{p.wet=1;p.t=0});if(D.e&&D.e.sv)D.e.sv.heat=0;bm232MeltEnd(D)},
  hud(D,e){return ' · Heat '+Math.round(Math.max(0,Math.min(1,e.sv.heat||0))*100)+'%'},
  phase(D,e){return (e.sv.heat||0)>=1?'meltdown':null},
  won(D,e){setTimeout(()=>{try{fn232WardenDown(2)}catch(err){console.error('fn232 warden',err)}},1900)},
  tick(D,dt,now,t){const LS=D.LS,S=D.S,L=D.L,e=D.e,h=e&&e.sv?(e.sv.heat||0):0;LS.floorM.emissiveIntensity=.35+.1*Math.sin(t*1.1)+h*.35+(S.fl?.2:0);LS.cruc.scale.setScalar(5+.5*Math.sin(t*3));
    S.pools.forEach((p,i)=>{if(!p.wet){p.t-=dt;if(p.t<=0&&!(D.A&&D.A.f&&S.melt)){p.wet=1;burst(new THREE.Vector3(p.x,p.y+.3,p.z),0x8ae0ff,24,2,2,.7);if(D.A&&D.A.f)say('💧 A quench pool has filled again.')}}
      p.w.visible=!!p.wet;p.gl.visible=!!p.wet;p.w.material.emissiveIntensity=.5+.15*Math.sin(t*2+i);p.ring.visible=!!p.wet&&!!(D.A&&D.A.f);if(p.ring.visible)p.ring.material.opacity=(S.melt?.75:.3)+.2*Math.sin(t*(S.melt?10:3)+i);
      if(Math.random()<dt*(p.wet?2:5))burst(new THREE.Vector3(p.x+(Math.random()-.5)*2.5,p.y+.3,p.z+(Math.random()-.5)*2.5),p.wet?0xbfe9ff:0x8a8a8a,1,.2,1.2,1.2)});
    // quarters: glow while warming, bright while burning
    LS.q.forEach((m,k)=>{const st=S.fl&&S.q===k?S.qS:0,tg=st==1?.16+.1*Math.sin(t*9):st==2?.5+.1*Math.sin(t*14):0;m.material.opacity+=(tg-m.material.opacity)*Math.min(1,dt*5);m.visible=m.material.opacity>.01;
      if(st==2&&Math.random()<dt*20){const a=k*Math.PI/2+Math.PI/4+Math.random()*Math.PI/2,r=Math.random()*12.5;burst(new THREE.Vector3(L.cx+Math.cos(a)*r,L.y+.2,L.cz-Math.sin(a)*r),0xff8a2a,1,.4,2,.6)}})},
  fight(D,e,dt,now){const S=D.S,A=D.A,V=e.sv,mid=V.mv&&V.mv.id,busy=mid==='meltdown'||mid==='broken'||mid==='intro'||mid==='awaken'||mid==='stagger';
    if(!busy&&!(V.stg>0))V.heat=Math.min(1,(V.heat||0)+dt/(V.ph>1?48:75));
    // quench: he walked (or ran) into water
    if(!busy&&(V.heat||0)>=.3)for(const p of S.pools){if(!p.wet||Math.hypot(e.m.position.x-p.x,e.m.position.z-p.z)>1.9)continue;p.wet=0;p.t=45;V.heat=0;const q=new THREE.Vector3(p.x,0,p.z);
      burst(gY(q,.6),0xdfe9f0,120,6,6,1.6);svShock(q,0xbfe9ff,6,.5);shake(.5);svSnd('hiss',1.4,.4);svSnd('splash',1.2,.7);try{sk146Wall(q,0xdfe9f0,3,5,1.4)}catch(_){}svEndMove(e,true);wk232Wound(e,.04,'#bfe9ff');svCast(e,'broken');return}
    // the hot floor (Phase II)
    if(S.fl){S.qT-=dt;if(S.qT<=0){if(S.qS==0){S.qS=1;S.qT=2}else if(S.qS==1){S.qS=2;S.qT=3.5;svSnd('hiss',.6,.5)}else{S.qS=1;S.qT=2;S.q=(S.q+1+((Math.random()*2)|0))%4}}
      if(S.qS==2&&hero.hp>0){const dx=pl.position.x-A.cx,dz=pl.position.z-A.cz,ang=Math.atan2(-dz,dx),k=Math.floor((((ang-Math.PI/4)%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/(Math.PI/2));S.zT-=dt;
        const inPool=S.pools.some(p=>p.wet&&Math.hypot(pl.position.x-p.x,pl.position.z-p.z)<2);
        if(k===S.q&&!inPool&&S.zT<=0){S.zT=.6;if(wk232Zap(e,.22,'m')){bm232Sear(1500);burst(gY(pl.position,.3),0xff8a2a,8,.8,1.4,.5)}}}}}});
function bm232Floor(D,on){const S=D.S;S.fl=on?1:0;S.q=(Math.random()*4)|0;S.qS=0;S.qT=1.5;if(D.LS&&!on)D.LS.q.forEach(m=>{m.material.opacity=0;m.visible=false})}
function bm232MeltWarn(D,e){D.S.melt=1;const wet=D.S.pools.some(p=>p.wet);say('⚒ Brassmaw’s core is going to burst! '+(wet?'<b>Get into a quench pool!</b>':'No pool has water left!'));try{banner('⚠ MELTDOWN',wet?'Stand in a quench pool that still has water':'No water is left: brace','')}catch(_){}}
function bm232MeltEnd(D){D.S.melt=0}
function bm232Melt(D,e){const S=D.S,A=D.A,P=pl.position,c=new THREE.Vector3(A.cx,0,A.cz),bp=e.m.position.clone();let pool=null;S.pools.forEach(p=>{if(p.wet&&Math.hypot(P.x-p.x,P.z-p.z)<2.0)pool=p});
  svShock(bp,0xffd27a,16,1);svShock(bp,BM232.col,12,.7);shake(.8);svSnd('heavy',1.6,.4);svSnd('roar',1.2,.5);try{flash('rgba(255,170,60,.5)')}catch(_){}try{sk146Flash(gY(bp,3),0xffb050,6,30,400)}catch(_){}
  for(let i=0;i<50;i++){const a=Math.random()*6.283,r=Math.random()*12.5;burst(gY(new THREE.Vector3(A.cx+Math.cos(a)*r,0,A.cz+Math.sin(a)*r),.3),0xff8a2a,3,2,4,.8)}
  if(pool){pool.wet=0;pool.t=45;const q=new THREE.Vector3(pool.x,0,pool.z);burst(gY(q,.6),0xdfe9f0,100,5,6,1.5);svSnd('hiss',1.3,.5);dn(P,'Safe!','#9ae8ff',-20,1400)}
  else if(hero.hp>0){if(wk232Zap(e,2.4,'m'))bm232Sear(5000)}
  e.sv.heat=.3;wk232Heal(e,.05,0xffa040)}
