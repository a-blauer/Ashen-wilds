// ================= v232 Oakenhart — the Elderglade (arena), the runestones, the briars, the record =================
// The first Warden's arena is Hillside Crest's unused Wave Trial instance (insG(1,4)), dressed as an old grove in autumn: leaf litter
// over moss and dark earth, a ring of huge trunks with flaring roots and lantern fungus, mossy boulders, ferns, shafts of late
// light, falling leaves — and four carved runestones standing in the open, which are the answer to his Rampage (4021).
//  * Runestones (OK.S.st): tall carved stones at the four diagonals; they block walking (CBLK). In a Rampage their runes burn.
//    A charge that reaches a standing stone shatters it: his antlers lodge (the 'broken' stagger), he is wounded 6%, the stone is
//    gone for the rest of the fight (a stump and rubble stay). A wipe or leaving puts all four back.
//  * Briars (Phase II; OK.S.briR): a wall of thorned coils grows up round the edge; beyond it you are torn (damage, Snared). Each
//    Rampage that finds no stone lets him heal 6% and the wall grows 1.2 further in (at most twice).
var OK232D=wk232Reg({key:'oak',zi:1,name:'Oakenhart',title:'the Rootbound Stag',icon:'🦌',lv:52,place:'The Elderglade',base:'akorror',hpK:1.0,dmK:1.0,
  card:['first Warden of the Balance','The grove closes behind you'],restTxt:'the heart of the grove',riftCol:0xffe2a8,
  B:{name:'Oakenhart',col:OK232.col,body:1.9,ph2:.55,poise:.1,headJ:'head',turnA:3.2,edge:1.9,
    ai:{pref:4.2,walk:2.4,run:4.4,turn:2.4,rest:[.8,1.4],ph2r:.68,strafe:.45,near:2.4},
    build:ok232Build,loco:ok232Loco,post:ok232Post,P:OK232P,M:OK232M,
    stag:[[.25,'stag','o'],[2.2,'stag','l',.025],[2.75,'cRec','io']],stagT:2.75,die:[[.5,'stag','o'],[1.5,'dead','i'],[2.1,'dead','l']]},
  done:()=>FN232.n>0,
  S:{st:[],bri:0,briR:10.4,briT:0,ramp:0},
  build(D,root,LS){const L=D.L,S=D.S,rn=svRng(2322),MT=ok232Mats(),y=(x,z)=>GH(x,z);
    const M={bark:new THREE.MeshStandardMaterial({color:0x2a1f16,roughness:.95,flatShading:true}),bark2:new THREE.MeshStandardMaterial({color:0x3b2c1e,roughness:.92,flatShading:true}),
      moss:new THREE.MeshStandardMaterial({color:0x48582a,roughness:.95,flatShading:true}),rock:new THREE.MeshStandardMaterial({color:0x4a4a44,roughness:.9,flatShading:true}),
      stone:new THREE.MeshStandardMaterial({color:0x6a685e,roughness:.85,flatShading:true}),fern:new THREE.MeshStandardMaterial({color:0x5a6a26,roughness:.9,flatShading:true,side:THREE.DoubleSide}),
      fung:new THREE.MeshBasicMaterial({color:0xffc86a}),leafA:new THREE.MeshStandardMaterial({color:0xb8521a,roughness:.85,flatShading:true,side:THREE.DoubleSide}),leafB:new THREE.MeshStandardMaterial({color:0xd89a26,roughness:.85,flatShading:true,side:THREE.DoubleSide})};LS.M=M;
    // the floor: dark earth and moss under a litter of leaves; faint amber where sap has soaked in
    LS.floorM=wk232Floor(D,root,{base:'#2c2418',seed:2323,spk:[[56,70,34],[70,52,30],[36,30,22]],spkN:420,spkR:12,spkA:.5,crack:'rgba(10,8,4,.5)',crackN:26,
      paint(c,r,Sz){const cols=['#b8521a','#d88a1e','#8a3414','#e0b030','#6a3a16'];for(let i=0;i<2600;i++){const x=r()*Sz,z=r()*Sz,a=r()*6.28,l=3+r()*5;c.save();c.translate(x,z);c.rotate(a);c.fillStyle=cols[(r()*5)|0];c.globalAlpha=.55+r()*.4;
          c.beginPath();c.moveTo(0,-l);c.quadraticCurveTo(l*.6,0,0,l);c.quadraticCurveTo(-l*.6,0,0,-l);c.fill();c.restore()}c.globalAlpha=1},
      vein:['rgba(255,170,60,.5)'],veinN:9,blob:['rgba(255,190,90,.7)'],blobN:10,em:0xffb43a,emI:.4,rough:.9});
    // the trunks: a ring of old boles, roots flaring into the grove, moss, lantern fungus; higher up they are lost in the dark
    const trunkG=k=>svG('ok_tr'+k,()=>{const h=11+k*1.5,g=svLoft([[0,1.5,1.5],[.5,1.15,1.1],[1.6,.9,.86],[h*.5,.74,.72],[h,.55,.56]],8,{rot:k*.4});return g});
    wk232Around(D,root,18,14.3,16.4,(i,a,x,z,yy,r)=>{const g=new THREE.Group(),s=.95+r()*.7,t=new THREE.Mesh(trunkG(i%3),i%2?M.bark:M.bark2);t.scale.set(s,1,s);t.castShadow=true;g.add(t);
      for(let k=0;k<4;k++){const ra=r()*6.28,rl=1.6+r()*1.8;const rt=new THREE.Mesh(svG('ok_rt'+(k%2),()=>svTube([[0,.9,0],[.5,.5,0],[1.0,.2,0],[1.6,0,0]],[.32,.26,.18,.06],5)),k%2?M.bark:M.bark2);rt.rotation.y=ra;rt.scale.set(rl/1.6*s,s,s);g.add(rt)}
      const ms=new THREE.Mesh(wk232Lump(1,1,1,.3),M.moss);ms.position.set(Math.sin(a+3.14)*s*.9,.9+r()*1.5,Math.cos(a+3.14)*s*.9);ms.scale.set(.6,.35,.6);g.add(ms);
      if(i%2==0)for(let k=0;k<3;k++){const f=new THREE.Mesh(svG('ok_fg',()=>{const q=new THREE.CylinderGeometry(1,.7,.25,7,1).toNonIndexed();return q}),M.fung),ia=a+Math.PI+(k-1)*.35;f.position.set(Math.sin(ia)*s*1.02,1.4+k*.5,Math.cos(ia)*s*1.02);f.scale.set(.26,.3,.2);f.rotation.y=ia;g.add(f)}
      g.position.set(x,yy-.1,z);g.rotation.y=r()*.3;return g},2324,.12);
    // boulders and smaller trunks between them, ferns and toadstools inside the ring
    wk232Around(D,root,22,13.0,14.6,(i,a,x,z,yy,r)=>{const s=.9+r()*1.3,o=new THREE.Mesh(wk232Lump(2+i%4,1,1),i%3?M.rock:M.moss);o.position.set(x,yy+s*.25,z);o.scale.set(s*1.3,s*(.8+r()*.6),s*1.2);o.rotation.set(r()*.5,r()*6.28,r()*.5);o.castShadow=true;return o},2325,.2);
    const fernG=svG('ok_fn',()=>{const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(.3,.5,.05,1.2);s.quadraticCurveTo(-.25,.5,0,0);const g=new THREE.ShapeGeometry(s,4);g.rotateX(-1.0);return g});
    for(let i=0;i<46;i++){const a=rn()*6.283,r=10.6+rn()*3.2,x=L.cx+Math.sin(a)*r,z=L.cz+Math.cos(a)*r;if(Math.hypot(x-L.exit.x,z-L.exit.z)<2.6)continue;const g=new THREE.Group();
      if(i%3){for(let k=0;k<6;k++){const f=new THREE.Mesh(fernG,M.fern);f.rotation.y=k/6*6.283+rn();f.scale.setScalar(.7+rn()*.6);g.add(f)}}
      else for(let k=0;k<3;k++){const st=new THREE.Mesh(svG('ok_ts',()=>new THREE.CylinderGeometry(.03,.04,.3,5).toNonIndexed()),M.stone),cp=new THREE.Mesh(svG('ok_tc',()=>{const q=new THREE.SphereGeometry(.14,7,4,0,6.283,0,1.5);return q}),M.fung);
        st.position.set(k*.2-.2,.15,(k%2)*.14);cp.position.set(k*.2-.2,.28,(k%2)*.14);g.add(st,cp)}
      g.position.set(x,y(x,z),z);root.add(g)}
    // an old antlered skull on a cairn at the back of the grove (where he waits), drifts of leaves against the roots
    {const x=L.cx,z=L.cz-11.4,yy=y(x,z);for(let k=0;k<7;k++){const o=new THREE.Mesh(wk232Lump(6+k%3,1,1),k%2?M.rock:M.stone),a=k*.9;o.position.set(x+Math.sin(a)*(1.1-k*.1),yy+.2+k*.16,z+Math.cos(a)*(.8-k*.08));o.scale.set(.7-k*.05,.4,.6-k*.04);o.rotation.y=a;root.add(o)}
      const sk=new THREE.Mesh(svG('ok_sk',()=>svLoftZ([[-.3,.3,.24],[0,.32,.26],[.4,.22,.16],[.8,.12,.08]],8)),new THREE.MeshStandardMaterial({color:0xcfc4a0,roughness:.7,flatShading:true}));sk.position.set(x,yy+1.5,z);sk.rotation.x=.5;root.add(sk);
      [-1,1].forEach(s=>{const an=new THREE.Mesh(svG('ok_ska',()=>svTube([[0,0,0],[.3,.5,-.1],[.7,1.0,-.2],[.9,1.6,0],[.8,2.1,.2]],[.07,.06,.05,.035,.012],5)),M.bark2);an.position.set(x+s*.2,yy+1.75,z-.1);an.scale.x=s;root.add(an)})}
    // shafts of late light through the canopy
    LS.shafts=[];[[3,-2,.5],[-5,3,-.4],[-2,-7,.3]].forEach(([ox,oz,tl],i)=>{const m=new THREE.Mesh(svG('ok_sh',()=>{const g=new THREE.CylinderGeometry(.3,1.3,15,10,1,true);g.translate(0,7.5,0);return g}),
        new THREE.MeshBasicMaterial({color:0xffc880,transparent:true,opacity:.04,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
      m.position.set(L.cx+ox,L.y,L.cz+oz);m.rotation.z=tl;m.userData.lpsSkip=1;root.add(m);LS.shafts.push(m)});
    wk232Light(D,LS,0xffb860,1.3,20,L.cx,L.y+6,L.cz);wk232Light(D,LS,0xff9a40,1.1,12,L.cx,L.y+2.5,L.cz-9);
    // the four runestones
    S.st=[0,1,2,3].map(k=>{const a=Math.PI/4+k*Math.PI/2,x=L.cx+Math.sin(a)*6.6,z=L.cz+Math.cos(a)*6.6,yy=y(x,z),g=new THREE.Group(),gb=new THREE.Group();g.position.set(x,yy,z);gb.position.set(x,yy,z);g.rotation.y=a+Math.PI;
      const st=new THREE.Mesh(svG('ok_rs',()=>svLoft([[-.2,.62,.44],[.6,.58,.4],[1.9,.5,.34],[2.7,.36,.26],[3.0,.16,.12]],6,{rot:.5})),M.stone);st.castShadow=true;g.add(st);
      const cap=new THREE.Mesh(wk232Lump(1,1,1,.3),M.moss);cap.position.set(.1,2.7,0);cap.scale.set(.42,.2,.34);g.add(cap);
      // the rune: three strokes, burning in a Rampage
      const rm=new THREE.MeshBasicMaterial({color:0xffb43a,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});rm.userData.noFade135=1;
      [[0,1.9,.9,.08,0],[-.14,1.55,.5,.07,.6],[.14,1.55,.5,.07,-.6],[0,1.05,.36,.07,1.57]].forEach(([ox,oy,l,w,rz])=>{[1,-1].forEach(sd=>{const p=new THREE.Mesh(svG('ok_rn',()=>new THREE.PlaneGeometry(1,1)),rm);p.position.set(ox,oy,sd*.385*(1-oy*.07));p.scale.set(w,l,1);p.rotation.z=rz;p.userData.lpsSkip=1;g.add(p)})});
      const gl=kqSpr(0xffb43a,1.2);gl.position.y=1.6;gl.visible=false;g.add(gl);
      // broken: a stump and rubble
      const stump=new THREE.Mesh(svG('ok_rsb',()=>svLoft([[-.2,.62,.44],[.5,.56,.4],[.8,.3,.36,.1,.05]],6,{rot:.5})),M.stone);gb.add(stump);
      for(let q=0;q<5;q++){const o=new THREE.Mesh(wk232Lump(6+q%3,1,1),M.stone),ra=q*1.3;o.position.set(Math.sin(ra)*(.9+q*.2),.15,Math.cos(ra)*(.8+q*.15));o.scale.set(.3,.22,.26);o.rotation.set(q,q*2,q);gb.add(o)}
      gb.visible=false;root.add(g,gb);return {x,z,g,gb,rm,gl,alive:1,k:W*Math.round(z)+Math.round(x)}});
    // the briar wall (hidden until Phase II): coils of thorned vine round the edge, built at radius 1 and scaled out
    {const g=new THREE.Group();g.position.set(L.cx,L.y,L.cz);const coil=svG('ok_bc',()=>svTube([[-.5,0,0],[-.3,.8,.15],[0,1.25,-.1],[.3,.7,.2],[.5,0,0]],[.09,.08,.07,.08,.09],5)),th=svG('ok_bt',()=>{const q=new THREE.ConeGeometry(.05,.34,4);q.translate(0,.17,0);return q.toNonIndexed()});
      for(let i=0;i<44;i++){const a=i/44*6.283,c=new THREE.Group();c.position.set(Math.sin(a),0,Math.cos(a));c.rotation.y=a+Math.PI/2+(rn()-.5)*.5;const s=1.5+rn()*.9;
        const v=new THREE.Mesh(coil,i%3?MT.thorn:MT.root);v.scale.set(s,s*(.8+rn()*.6),s);c.add(v);for(let k=0;k<5;k++){const t=new THREE.Mesh(th,MT.thorn);t.position.set((k-2)*.2*s,(.5+Math.sin(k*1.3)*.5)*s,.05);t.rotation.set(rn()*2-1,0,rn()*2-1);t.scale.setScalar(1.4);c.add(t)}
        if(i%4==0){const lf=new THREE.Mesh(wk232Lump(1,1,1,.4),i%8?M.leafA:M.leafB);lf.position.set(0,1.1*s,0);lf.scale.set(.5,.3,.4);c.add(lf)}
        c.userData.inv=1;g.add(c)}
      g.visible=false;root.add(g);LS.bri=g;LS.briRing=wk232Disc(root,10.4,15.5,0x6a3a10,L.y+.1);LS.briRing.position.set(L.cx,L.y+.1,L.cz)}
    D.sync(D)},
  sync(D){const S=D.S,LS=D.LS;if(!LS)return;S.st.forEach(s=>{s.g.visible=!!s.alive;s.gb.visible=!s.alive;if(s.alive)CBLK.add(s.k);else CBLK.delete(s.k)})},
  reset(D,won){const S=D.S;S.st.forEach(s=>{s.alive=1});S.ramp=0;ok232Briars(D,0);S.briR=10.4;D.sync(D)},
  hud(D,e){const n=D.S.st.filter(s=>s.alive).length;return e.sv.ph>1?' · runestones '+n:''},
  won(D,e){setTimeout(()=>{try{fn232WardenDown(0)}catch(err){console.error('fn232 warden',err)}},1900)},
  tick(D,dt,now,t){const LS=D.LS,S=D.S,L=D.L;LS.shafts.forEach((m,i)=>{m.material.opacity=.035+.015*Math.sin(t*.5+i*1.7)});LS.floorM.emissiveIntensity=.35+.08*Math.sin(t*.8)+(S.bri?.12:0);
    // leaves fall all the time (a storm of them in Phase II)
    if(Math.random()<dt*(S.bri?26:6)){const a=Math.random()*6.283,r=Math.random()*13;burst(new THREE.Vector3(L.cx+Math.cos(a)*r,L.y+5+Math.random()*3,L.cz+Math.sin(a)*r),OK232.leaf[(Math.random()*4)|0],1,S.bri?1.6:.4,-1.2,2.4)}
    // the briars grow / wither toward their target
    if(LS.bri.visible){const k=S.briT=(S.briT||0)+((S.bri?1:0)-(S.briT||0))*Math.min(1,dt*1.4),r=S.briR+.9;LS.bri.scale.set(r,Math.max(.01,k),r);LS.bri.rotation.y=Math.sin(t*.3)*.02;if(!S.bri&&k<.02)LS.bri.visible=false;
      LS.briRing.visible=k>.02;LS.briRing.material.opacity=.28*k;const q=S.briR/10.4;LS.briRing.scale.set(q,1,q)}
    // runes: dim, burning in a Rampage
    S.st.forEach((s,i)=>{if(!s.alive)return;const on=S.ramp;s.rm.opacity=on?.75+.25*Math.sin(t*9+i):.3+.08*Math.sin(t*1.3+i);s.gl.visible=!!on;if(on&&Math.random()<dt*6)burst(new THREE.Vector3(s.x,L.y+1+Math.random()*2,s.z),0xffc86a,1,.4,.8,.6)})},
  fight(D,e,dt,now){const S=D.S,A=D.A;if(S.bri&&hero.hp>0){const d=Math.hypot(pl.position.x-A.cx,pl.position.z-A.cz);S.zT=(S.zT||0)-dt;if(d>S.briR&&S.zT<=0){S.zT=.6;if(wk232Zap(e,.2,'p')){dqDebuff(OK232_DEB[0],OK232_DEB[1],OK232_DEB[2],1500,OK232_DEB[3]);burst(gY(pl.position,.5),0x3a2a1a,8,.8,1,.5)}}}}});
function ok232Briars(D,on){const S=D.S,LS=D.LS;S.bri=on?1:0;if(LS&&on)LS.bri.visible=true;if(!on)S.briT=Math.min(S.briT||0,.5)}
function ok232RampStart(D,e){const S=D.S;S.ramp=1;const n=S.st.filter(s=>s.alive).length;
  say(n?'🦌 Oakenhart’s eyes blaze white. <b>Put a runestone between you and his charge!</b>':'🦌 Oakenhart’s eyes blaze white. No stone is left standing: run!');try{banner('⚠ RAMPAGE',n?'Lure his charge into a runestone':'No runestone is left: dodge every charge','')}catch(_){}}
function ok232RampEnd(D){D.S.ramp=0}
// during a charge: a standing runestone ahead of him and within reach stops him dead
function ok232RampHit(D,e){const S=D.S,m=e.m,a=m.rotation.y,fx=Math.sin(a),fz=Math.cos(a);for(const s of S.st){if(!s.alive)continue;const dx=s.x-m.position.x,dz=s.z-m.position.z,d=Math.hypot(dx,dz);if(d>2.3||(dx*fx+dz*fz)/Math.max(.01,d)<.35)continue;
    s.alive=0;S.ramp=0;D.sync(D);const p=new THREE.Vector3(s.x,0,s.z);burst(gY(p,1.5),0xb0aa98,70,5,4,1);burst(gY(p,1.5),0xffc86a,40,4,3,.8);svShock(p,0xffe08a,5,.5);shake(.6);svSnd('crack',1.3,.5);svSnd('heavy',1.2,.7);
    try{sk146Debris(p,D.LS.M.stone,14,.3,5,5,1.6)}catch(_){}try{sk146Flash(gY(p,1.5),0xffc86a,3,14,300)}catch(_){}
    svEndMove(e,true);e.sv.dr=0;wk232Wound(e,.06,'#ffe08a');svCast(e,'broken');return true}return false}
// the Rampage ran its course: he heals and the briars grow in
function ok232RampFail(D,e){const S=D.S;S.ramp=0;wk232Heal(e,.06,0xffc86a);svSnd('roar',1,.7);shake(.3);ok232Leaves(gY(e.m.position,3),60,6,2);
  if(S.briR>8.2){S.briR-=1.2;say('🌿 The briars grow further into the grove.')}}
