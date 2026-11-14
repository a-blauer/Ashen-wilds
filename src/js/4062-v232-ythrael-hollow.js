// ================= v232 Ythrael — the Hollow Beneath (the finale's arena), Thirst, the brink, the falling rim, the record =================
// The fight-him ending. The arena is a place of its own (special instance 'apex', g 35, registered in 3150; its ground is painted
// by ap232Map / ap232Terrain below, which the world build calls): the den of the cinematic, under Duskhold's fountain — a great
// disc of black stone standing out of a sea of essence, the six Sovereigns' stones round its rim, roots and stalagmites in the
// dark beyond, the fountain's throat a point of light far overhead with essence still falling from it.
//  * Thirst (YT.S.motes, YT.S.stolen): motes of essence spilled by his blows lie on the stone for 30 s (nine at most). Walking over
//    one takes it: +3% health and a stack of Stolen Essence (+6% attack each). The sixth tears the essence back out of him: he
//    is wounded 6% and 'broken' (RUPTURED). When three or more lie about he may kneel and drink: the motes fly to him (5 a second;
//    you can still snatch them); each he swallows heals him 2.5% and makes his blows 8% heavier for 20 s (Sated).
//  * The brink (Phase II; YT.S.brink): the outer 2.2 of the stone burns with essence-fire (damage, Withered).
//  * The falling rim (Phase III; YT.S.rim): the stone's rim breaks away: the arena shrinks from 17.6 to 13.2 (the brink moves in).
// Ground: ap232Map paints a round floor (radius 20.5) in the middle of the 96 × 96 instance and solid rock round it; ap232Terrain
// makes the floor flat at height 20 and drops everything outside it 40 down, so the stone stands like a pillar in the dark.
function ap232Cfg(){return {F0:20,R:20.5,cx:48,cz:48}}
function ap232Map(m,bio,DW,I,bi){const C=ap232Cfg();for(let v=0;v<I.h;v++)for(let u=0;u<I.w;u++){const x=I.x0+u,y=I.y0+v;if(!m[y])continue;bio[y][x]=bi;const d=Math.hypot(u+.5-C.cx,v+.5-C.cz);
    if(d<C.R){m[y][x]='.';DW[y*W+x]=-Math.max(1,C.R-d)}else{m[y][x]='';DW[y*W+x]=Math.max(1,d-C.R)}}}
function ap232Terrain(I){const C=ap232Cfg();for(let j=I.y0-2;j<I.y0+I.h+2;j++)for(let i=I.x0-2;i<I.x0+I.w+2;i++){const d=Math.hypot(i-I.x0-C.cx,j-I.y0-C.cz),k=Math.max(0,Math.min(1,(d-C.R)/2.5));
    HF[(j+HPD)*HW+i+HPD]=C.F0-40*k*k*(3-2*k)+(d<C.R?(fbm2(i*.3,j*.3,2)-.5)*.05:0)}}
try{sp152Theme('apex',{nm:'The Hollow Beneath',sub:'Under the fountain of Duskhold',a:{fog:.02,fc:0x0a0614,fcA:.95,sun:.14,hemi:.42,env:'dark',ex:1.0,sat:1.05,vig:1.75,sky:0,pt:'mote',pc:0xc8a0ff,po:.5}})}catch(e){console.warn('v232 theme',e)}
try{SP152.R.apex={onLoad(){setTimeout(()=>{try{TWN100_home()}catch(_){}},0)}}}catch(_){}
var YT232D=(()=>{const I=sp152I('apex');if(!I){console.error('v232: the apex instance is missing');return null}const C=ap232Cfg(),cx=I.x0+C.cx,cz=I.y0+C.cz;
 return wk232Reg({key:'voice',T:I,center:[cx,cz],Lx:{r:17.6,hr:18.6,ent:{x:cx,z:cz+15.2},exit:{x:cx,z:cz+17.4},home:{x:cx,z:cz-3}},name:'Ythrael',title:'the Voice Below',icon:'👁',lv:56,place:'The Hollow Beneath',base:'akorror',hpK:1.9,dmK:1.3,wake:11,
  card:['he who drank six Sovereigns','There is no way back up'],restTxt:'the middle of the stone',riftCol:0xe8d0ff,
  B:{name:'Ythrael',col:YT232.col,body:1.6,ph2:.66,poise:.1,headJ:'head',turnA:3.6,edge:1.6,
    ai:{pref:4.0,walk:2.5,run:4.6,turn:2.7,rest:[.7,1.25],ph2r:.64,strafe:.5,near:2.2},
    build:yt232Build,loco:yt232Loco,post:yt232Post,P:YT232P,M:YT232M,
    stag:[[.3,'stag','o'],[2.2,'stag','l',.025],[2.75,'cRec','io']],stagT:2.75,die:[[.6,'stag','o'],[1.6,'dead','i'],[2.1,'dead','l']]},
  done:()=>FN232.won>0,
  S:{motes:[],stolen:0,drink:0,brink:0,rim:0,zT:0,sat:0,satT:0,dm0:1.3},
  build(D,root,LS){const L=D.L,S=D.S,rn=svRng(2362),y=(x,z)=>GH(x,z),MY=yt232Mats();
    const M={stone:new THREE.MeshStandardMaterial({color:0x14121a,roughness:.7,metalness:.15,flatShading:true}),stone2:new THREE.MeshStandardMaterial({color:0x1e1a28,roughness:.8,flatShading:true}),root:new THREE.MeshStandardMaterial({color:0x100c12,roughness:.9,flatShading:true})};LS.M=M;
    // the floor: black stone, violet veins, a great ring with the six Sovereigns' marks cut into it
    const sig=(c,Sz,glow)=>{const C=Sz/2,R=Sz*.36;c.lineWidth=glow?2.5:3.5;c.strokeStyle=glow?'rgba(200,154,255,.85)':'rgba(70,56,96,.9)';[1,.92,.3].forEach(k=>{c.beginPath();c.arc(C,C,R*k,0,6.283);c.stroke()});
        c.beginPath();for(let i=0;i<=6;i++){const a=i/6*6.283+.5236;c[i?'lineTo':'moveTo'](C+Math.sin(a)*R*.92,C+Math.cos(a)*R*.92)}c.stroke();c.beginPath();for(let i=0;i<=6;i++){const a=(i*2%6)/6*6.283+.5236+(i>=3?1.0472:0);c[i%3?'lineTo':'moveTo'](C+Math.sin(a)*R*.92,C+Math.cos(a)*R*.92)}c.stroke();
        if(glow)YT232.ess.forEach((col,i)=>{const a=i/6*6.283+.5236,x=C+Math.sin(a)*R*.92,z=C+Math.cos(a)*R*.92,gr=c.createRadialGradient(x,z,0,x,z,20);gr.addColorStop(0,'#'+col.toString(16).padStart(6,'0'));gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.beginPath();c.arc(x,z,20,0,6.283);c.fill()})};
    LS.floorM=wk232Floor(D,root,{base:'#121018',seed:2363,R0:22,soft:58,spk:[[30,26,40],[18,16,24]],spkN:420,spkR:12,spkA:.5,crack:'rgba(0,0,0,.6)',crackN:50,rough:.6,metal:.2,em:0xffffff,emI:.5,
      vein:['rgba(150,90,255,.5)'],veinN:12,paint:(c,r,Sz)=>sig(c,Sz,0),glow:(c,r,Sz)=>sig(c,Sz,1)});
    // the sea of essence far below, two layers turning against each other
    {const cv=document.createElement('canvas');cv.width=cv.height=256;const c=cv.getContext('2d');c.fillStyle='#0a0614';c.fillRect(0,0,256,256);const cols=['154,255,90','90,216,255','191,233,255','255,194,74','184,255,58','255,74,90','200,154,255'];
      for(let i=0;i<90;i++){const x=rn()*256,z=rn()*256,r=14+rn()*40,gr=c.createRadialGradient(x,z,0,x,z,r);gr.addColorStop(0,'rgba('+cols[(rn()*7)|0]+','+(.25+rn()*.3)+')');gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.beginPath();c.arc(x,z,r,0,6.283);c.fill()}
      const tx=new THREE.CanvasTexture(cv);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(3,3);LS.sea=[0,1].map(k=>{const m=new THREE.Mesh(svG('yt_sea',()=>new THREE.CircleGeometry(70,48).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({map:tx,color:k?0xb090ff:0xffffff,transparent:true,opacity:k?.5:.95,blending:k?THREE.AdditiveBlending:THREE.NormalBlending,depthWrite:!k,fog:false}));
        m.position.set(L.cx,L.y-10-k*.4,L.cz);m.userData.lpsSkip=1;m.material.userData.noFade135=1;root.add(m);return m})}
    // the stone's flank: a ragged skirt of rock under the rim, so it reads as a pillar
    for(let i=0;i<40;i++){const a=i/40*6.283,r=20.4+rn()*.8,o=new THREE.Mesh(wk232Lump(50+i%5,1,1,.4),i%2?M.stone:M.stone2);o.position.set(L.cx+Math.sin(a)*r,L.y-2.6-rn()*2,L.cz+Math.cos(a)*r);o.scale.set(2.6+rn(),3.5+rn()*2.5,2.2+rn());o.rotation.set(rn()*.3,a,rn()*.3);root.add(o)}
    // stalagmites and roots out in the dark, a few great roots arching over
    for(let i=0;i<34;i++){const a=rn()*6.283,r=27+rn()*26,h=10+rn()*20,o=new THREE.Mesh(svG('yt_sg'+(i%3),()=>svLoft([[0,2.4,2.4],[.5,1.3,1.2],[1,.02,.02]],6,{rot:i})),i%3?M.stone:M.stone2);o.position.set(L.cx+Math.sin(a)*r,L.y-11,L.cz+Math.cos(a)*r);o.scale.set(1+rn(),h,1+rn());o.rotation.set((rn()-.5)*.15,rn()*6,(rn()-.5)*.15);root.add(o)}
    for(let i=0;i<7;i++){const a=i/7*6.283+rn()*.5,r0=24+rn()*4,o=new THREE.Mesh(svG('yt_rt'+(i%2),()=>svTube([[0,-12,0],[1.5,2,-.5],[-.5,11,-3],[-4,17,-9],[-9,20,-17]],[1.5,1.2,1.0,.8,.5],6)),M.root);o.position.set(L.cx+Math.sin(a)*r0,L.y,L.cz+Math.cos(a)*r0);o.rotation.y=a+Math.PI/2+rn();o.scale.setScalar(1+rn()*.5);root.add(o)}
    // the throat far overhead: a point of light, essence falling from it into the sea at the back
    {const sp=kqSpr(0xe8d0ff,26);sp.material=sp.material.clone();sp.material.fog=false;sp.position.set(L.cx,L.y+46,L.cz-10);root.add(sp);
      const fall=new THREE.Mesh(svG('yt_fl',()=>{const q=new THREE.CylinderGeometry(.5,1.6,56,10,1,true);return q}),new THREE.MeshBasicMaterial({color:0xd8b8ff,map:SPR,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
      fall.position.set(L.cx,L.y+18,L.cz-30);fall.userData.lpsSkip=1;root.add(fall);LS.fall=fall}
    // the six Sovereigns' stones round the rim
    LS.sov=YT232.ess.map((col,i)=>{const a=i/6*6.283+.5236,x=L.cx+Math.sin(a)*16.6,z=L.cz+Math.cos(a)*16.6,yy=y(x,z),g=new THREE.Group();g.position.set(x,yy,z);g.rotation.y=a+Math.PI;
      const st=new THREE.Mesh(svG('yt_ss',()=>svLoft([[-.3,.8,.5],[1.2,.74,.46],[3.6,.6,.36],[5.0,.34,.22],[5.5,.08,.06]],5,{rot:.6})),M.stone);st.castShadow=true;g.add(st);
      const rm=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});rm.userData.noFade135=1;
      [[0,3.4,1.5,.07,0],[0,2.2,.6,.07,1.57],[-.15,4.2,.5,.06,.7],[.15,4.2,.5,.06,-.7]].forEach(([ox,oy,l,w,rz])=>{const p=new THREE.Mesh(svG('yt_rn',()=>new THREE.PlaneGeometry(1,1)),rm);p.position.set(ox,oy,.47-oy*.045);p.scale.set(w,l,1);p.rotation.z=rz;p.userData.lpsSkip=1;g.add(p)});
      const sh=new THREE.Mesh(svG('yt_sd',()=>{const q=new THREE.OctahedronGeometry(.3,0);q.scale(1,1.8,1);return q}),new THREE.MeshBasicMaterial({color:col}));sh.position.y=6.6;g.add(sh);const gl=kqSpr(col,2.6);gl.position.y=6.6;g.add(gl);root.add(g);
      CBLK.add(W*Math.round(z)+Math.round(x));return {g,sh,gl,rm,x,z,y0:yy}});
    wk232Light(D,LS,0xa070ff,1.3,30,L.cx,L.y+7,L.cz);LS.essL=wk232Light(D,LS,0xffffff,1.0,22,L.cx,L.y+3,L.cz-6);
    // the brink (Phase II) and the fallen rim (Phase III)
    LS.brink=wk232Disc(root,15.4,17.9,0xb070ff,L.y+.13);LS.brink.position.set(L.cx,L.y+.13,L.cz);
    {const m=new THREE.Mesh(svG('yt_rim',()=>new THREE.RingGeometry(13.4,23,64,1).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({color:0x020104,transparent:true,opacity:0,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-6}));m.material.userData.noFade135=1;m.userData.lpsSkip=1;m.position.set(L.cx,L.y+.17,L.cz);m.visible=false;root.add(m);LS.rim=m;
      LS.rimE=wk232Disc(root,13.0,13.5,0xe8d0ff,L.y+.19);LS.rimE.position.set(L.cx,L.y+.19,L.cz)}
    },
  start(D,e){D.S.stolen=0;yt232Buff(D)},
  reset(D,won){const S=D.S;yt232MotesClear(D);S.stolen=0;S.drink=0;S.sat=0;D.dmK=S.dm0;yt232Buff(D);yt232Brink(D,0);yt232Crumble(D,0);if(D.A){D.A.r=D.L.r;D.A.hr=D.L.hr}},
  hud(D,e){return ' · Stolen essence '+D.S.stolen+'/6'},
  phase(D,e){const S=e.sv;return S.ph===2&&e.c.h/M(e.c)<=.33?'awaken2':null},
  won(D,e){try{fn232Slain(e)}catch(err){console.error('fn232 slain',err)}},
  tick(D,dt,now,t){const LS=D.LS,S=D.S,L=D.L,e=D.e;LS.sea[0].rotation.y+=dt*.02;LS.sea[1].rotation.y-=dt*.035;LS.fall.material.opacity=.4+.15*Math.sin(t*3);LS.floorM.emissiveIntensity=.42+.1*Math.sin(t*.8)+(S.brink?.12:0)+(S.rim?.15:0);
    {const ci=Math.floor(t*.5)%6,c0=new THREE.Color(YT232.ess[ci]),c1=new THREE.Color(YT232.ess[(ci+1)%6]);c0.lerp(c1,(t*.5)%1);LS.essL.color.copy(c0)}
    LS.sov.forEach((s,i)=>{s.sh.rotation.y+=dt*1.2;s.sh.position.y=6.6+.25*Math.sin(t*1.3+i);s.gl.position.y=s.sh.position.y;s.rm.opacity=.6+.25*Math.sin(t*2+i*1.05);if(S.rim){s.g.position.y+=(s.y0+1.6+.3*Math.sin(t*.9+i)-s.g.position.y)*Math.min(1,dt)}else s.g.position.y+=(s.y0-s.g.position.y)*Math.min(1,dt*2)});
    if(Math.random()<dt*5){const a=Math.random()*6.283,r=20+Math.random()*20;burst(new THREE.Vector3(L.cx+Math.cos(a)*r,L.y-9,L.cz+Math.sin(a)*r),YT232.ess[(Math.random()*6)|0],1,.3,2.5,2.5)}
    // brink and rim visuals
    {const bk=LS.brink,tg=S.brink?.3+.12*Math.sin(t*7):0;bk.material.opacity+=(tg-bk.material.opacity)*Math.min(1,dt*3);bk.visible=bk.material.opacity>.01;const q=S.rim?13.2/17.6:1;bk.scale.set(q,1,q);
      const rm=LS.rim,rt=S.rim?.96:0;rm.material.opacity+=(rt-rm.material.opacity)*Math.min(1,dt*1.5);rm.visible=rm.material.opacity>.01;LS.rimE.visible=!!S.rim;if(S.rim)LS.rimE.material.opacity=.5+.3*Math.sin(t*5)}
    // motes: bob, fade at the end of their time, fly to him while he drinks; the hero takes one by touching it
    for(let i=S.motes.length-1;i>=0;i--){const m=S.motes[i];m.t+=dt;const fl=S.drink&&e&&!e.dead;if(fl){const hp=svWP(e,'head',0,0,.3),dx=hp.x-m.x,dz=hp.z-m.z,d=Math.hypot(dx,dz)||1;m.x+=dx/d*5*dt;m.z+=dz/d*5*dt;m.h+=(Math.min(3.2,3.6-d*.4)-m.h)*Math.min(1,dt*2);
        if(d<1.1){yt232MoteDrunk(D,e,m);S.motes.splice(i,1);continue}}
      m.g.position.set(m.x,GH(m.x,m.z)+(fl?Math.max(.7,m.h):.7+.15*Math.sin(t*3+m.ph)),m.z);m.g.rotation.y+=dt*2;const k=m.t>26?Math.max(0,(30-m.t)/4):1;m.g.scale.setScalar(.6+.4*k);
      if(Math.random()<dt*4)burst(m.g.position,YT232.ess[m.i],1,.25,.5,.5);
      if(hero.hp>0&&Math.hypot(pl.position.x-m.x,pl.position.z-m.z)<1.15&&(!fl||m.h<2)){yt232MoteTaken(D,e,m);S.motes.splice(i,1);continue}
      if(m.t>30){yt232MoteFree(m);S.motes.splice(i,1)}}
    if(S.sat>0){S.satT-=dt;if(S.satT<=0){S.sat=0;D.dmK=S.dm0}}if(e&&e.sv)e.sv.sat=S.sat},
  fight(D,e,dt,now){const S=D.S,A=D.A;if(S.brink&&hero.hp>0){const d=Math.hypot(pl.position.x-A.cx,pl.position.z-A.cz),lim=(S.rim?13.2:17.6)-2.2;S.zT-=dt;if(d>lim&&S.zT<=0){S.zT=.6;if(wk232Zap(e,.22,'m')){yt232Wither(1500);burst(gY(pl.position,.4),0xb070ff,8,.8,1.2,.5)}}}}})})();
// ---------------- Thirst ----------------
function yt232Mote(D,p,i){const S=D.S,A=D.A;if(!A||!A.f||S.motes.length>=9)return;const q=wk232Clamp(D,p.clone(),2.6+(S.brink?2.2:0));if(S.motes.some(m=>Math.hypot(m.x-q.x,m.z-q.z)<1.6))return;
  i=i==null?(Math.random()*6)|0:i%6;const col=YT232.ess[i],g=new THREE.Group(),o=new THREE.Mesh(svG('yt_mt',()=>new THREE.OctahedronGeometry(.2,0)),new THREE.MeshBasicMaterial({color:col})),gl=kqSpr(col,1.5);g.add(o,gl);g.userData.lpsSkip=1;scene.add(g);
  S.motes.push({x:q.x,z:q.z,i,g,t:0,h:.7,ph:Math.random()*6});burst(gY(q,.7),col,14,1.6,2,.6)}
function yt232MoteFree(m){try{scene.remove(m.g);m.g.children[0].material.dispose()}catch(_){}}
function yt232MotesClear(D){D.S.motes.forEach(yt232MoteFree);D.S.motes=[]}
function yt232Buff(D){const n=D.S.stolen,i=hero.buffs.findIndex(b=>b.n=='Stolen Essence');if(i>=0)hero.buffs.splice(i,1);if(n>0)hero.buffs.push({n:'Stolen Essence',i:'✨',s:{paP:.06*n,maP:.06*n},t:nowP()+90000,d:'Essence taken back from him: +'+(6*n)+'% attack ('+n+'/6)'});try{hsDirty()}catch(_){}}
function yt232MoteTaken(D,e,m){const S=D.S,p=m.g.position.clone();yt232MoteFree(m);S.stolen++;burst(p,YT232.ess[m.i],30,2.5,2,.6);try{sfx('chime')}catch(_){}try{const h=Math.round(heroMax()*.03);hero.hp=Math.min(heroMax(),hero.hp+h);dn(pl.position,'+'+h,'#9aff6a',-10,900)}catch(_){}
  popT(pl.position,'Essence '+S.stolen+'/6','#e8d0ff');yt232Buff(D);
  if(S.stolen>=6&&e&&!e.dead){S.stolen=0;yt232Buff(D);S.drink=0;const hp=svWP(e,'heart',0,0,.2);try{sk146Beam(()=>gY(pl.position,1.2),()=>hp,0xffffff,.3,.6)}catch(_){}shake(.6);try{flash('rgba(232,208,255,.4)')}catch(_){}svEndMove(e,true);wk232Wound(e,.06,'#e8d0ff');svCast(e,'broken')}}
function yt232MoteDrunk(D,e,m){const S=D.S;yt232MoteFree(m);wk232Heal(e,.025,YT232.ess[m.i]);S.sat=Math.min(5,S.sat+1);S.satT=20;D.dmK=S.dm0*(1+.08*S.sat);svSnd('squelch',.6,1.4)}
function yt232DrinkStart(D,e){const S=D.S;S.drink=1;say('👁 Ythrael kneels to drink. <b>Take the motes before he does!</b>');try{banner('⚠ THIRST','Snatch the motes of essence before they reach him','')}catch(_){}}
function yt232DrinkEnd(D,e,silent){const S=D.S;if(!S.drink)return;S.drink=0;if(silent||!e||e.dead)return;if(S.sat>0)say('👁 He has drunk: his blows are heavier for a while.')}
function yt232Brink(D,on){D.S.brink=on?1:0}
function yt232Crumble(D,on){const S=D.S,A=D.A,L=D.L;S.rim=on?1:0;if(!A)return;if(on){A.r=13.2;A.hr=14.0;const c=new THREE.Vector3(L.cx,0,L.cz);for(let i=0;i<60;i++){const a=Math.random()*6.283,r=14+Math.random()*4,p=new THREE.Vector3(L.cx+Math.cos(a)*r,0,L.cz+Math.sin(a)*r);burst(gY(p,.3),0x2a2434,4,3,-2,1.2)}
    try{sk146Debris(c,D.LS.M.stone,24,.5,9,3,2)}catch(_){}svSnd('crack',1.4,.4);svSnd('heavy',1.4,.4);S.motes=S.motes.filter(m=>{if(Math.hypot(m.x-L.cx,m.z-L.cz)>12.4){yt232MoteFree(m);return false}return true});
    // anyone standing on the rim is thrown inward
    const P=pl.position,d=Math.hypot(P.x-L.cx,P.z-L.cz);if(d>13.4){P.x=L.cx+(P.x-L.cx)/d*13.2;P.z=L.cz+(P.z-L.cz)/d*13.2}}else{A.r=L.r;A.hr=L.hr}}
