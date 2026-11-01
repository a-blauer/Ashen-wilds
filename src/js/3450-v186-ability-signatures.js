// ================= v186: every ability its own move and its own look =================
// Owner (Nov 1 2026): "Whirlwind's effect should be shown all around him", "Chain hook needs a better chain model", "Single target
// abilities and some aoe attacks that come from the character … seem too similar to a regular attack … Make sure each ability has
// its own unique animation and particle effects", "Evolved abilities reuse the same spike particle effect too much … not a big fan
// of the rune symbols flashing for every evolved ability. Reimagine each evolved ability to just be an upgraded, more intense
// feeling version of the base spell."
// How it works (read this before changing it):
// - Signature effects (sg*): themed shapes built from shared geometry / textures (SG.g, SG.t, fx186Tex, evxTex) with their own
//   materials freed when they end; particles come from the pooled fxA puffs (streaks = stretched boxes turned along their flight,
//   smoke, dust, blood, feathers, leaves, embers). Every sg* effect takes plain arguments and only draws (no damage), and is in
//   MPV.FX, so co-op partners see it. `lvl` 1 = the evolved cast: the same effect, bigger, brighter, more layers, the class's
//   second colour and a longer life. Callers pass lvl = sgEvo() (EV137.cur during an evolved cast).
// - The ability handlers (KQH in 1000) and the old kinds' cast (0130 cast_base: sgOld(sk…) returns true when the ability draws its
//   own signature, then the generic ring / burst / arc of its kind is skipped) call them. Damage, ranges and timings are unchanged.
// - Poses: new ATK tracks (SGP) built like the v85 ones (atkTrack: anticipation → strike → follow-through → recover), each
//   ability's `pose` names one (set below, SG_POSE); kqsPoseT knows them. Buffs / shields / heals play theirs after the cast.
// - Evolved casts: the generic layer is gone (2700's casting sigil + column + orbit on every evolved cast, the ground glyph
//   on every evolved area hit, the evolved pose swap, the glyph in the v186 scorch). Each evolution (2720-2740) draws its base
//   effect intensified (lvl 1) and its own themed follow-up. While an sg effect draws, EV137.busy is raised so the evolved
//   companions (ring → shockwave, burst → flare…) do not pile on top of it.
// - Whirlwind: one spinning vortex of blade trails all around the hero for the whole channel (sgVortex), dust and sparks thrown
//   outward (the channel tick in 0130 no longer draws a cone each 0.3 s). Chain Hook: a real chain of interlocking oval links with
//   a hook head that flies out along an arc and reels back in (sgChain).
var SG={t:{},g:{},V:[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],Q:new THREE.Quaternion(),Q2:new THREE.Quaternion(),
  X:new THREE.Vector3(1,0,0),Y:new THREE.Vector3(0,1,0),Z:new THREE.Vector3(0,0,1),W:new THREE.Color(0xffffff),C:new THREE.Color(),C2:new THREE.Color()};
function sgEvo(){return typeof EV137!='undefined'&&EV137.cur?1:0}
function sgC2(col){const E=typeof EV137!='undefined'&&EV137.cur;return E&&E.c2!=null?E.c2:new THREE.Color(col).lerp(SG.W,.55).getHex()}
function sgLerp(a,b,t){return new THREE.Color(a).lerp(new THREE.Color(b),t).getHex()}
function sgYaw(d){return Math.atan2(d.x,d.z)}
// run fn with the evolved companions held off (our own shapes are the evolved look)
function sgBusy(fn){const E=typeof EV137!='undefined'?EV137:null;if(E)E.busy++;try{return fn()}catch(err){console.warn('sg fx',err)}finally{if(E)E.busy--}}
function sgT(ms,fn,done){tw(ms,function(k){EV137.busy++;try{fn(k)}finally{EV137.busy--}},function(){EV137.busy++;try{done&&done()}finally{EV137.busy--}})}
function sgLater(ms,fn){setTimeout(()=>sgBusy(fn),ms)}
function sgG(k,mk){return SG.g[k]||(SG.g[k]=mk())}
function sgMat(col,map,op,blend){return new THREE.MeshBasicMaterial({color:col,map:map||null,transparent:true,opacity:op==null?1:op,blending:blend===0?THREE.NormalBlending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})}
function sgMesh(geo,mat,ro){const m=new THREE.Mesh(geo,mat);m.userData.lpsSkip=1;m.frustumCulled=false;m.renderOrder=ro||33;return m}
function sgRm(o){if(!o)return;if(o.parent)o.parent.remove(o);o.traverse(q=>{if(q.material&&!q.userData.sgKeepM)(Array.isArray(q.material)?q.material:[q.material]).forEach(m=>m.dispose());if(q.geometry&&q.userData.sgOwnG)q.geometry.dispose()})}
function sgCv(k,w,h,fn){if(SG.t[k])return SG.t[k];const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);const t=new THREE.CanvasTexture(c);t.userData={evxS:1};return SG.t[k]=t}
// ---------------- textures (white, tinted by the material) ----------------
function sgTex(k){
  if(k=='rays')return sgCv(k,256,256,(g,S)=>{const C=S/2;g.translate(C,C);for(let i=0;i<28;i++){const a=i/28*6.283+(i%2?.05:0),L=C*(i%2?.62:.98),w=i%2?.035:.06;const gr=g.createLinearGradient(0,0,Math.cos(a)*L,Math.sin(a)*L);
    gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a-w)*L,Math.sin(a-w)*L);g.lineTo(Math.cos(a+w)*L,Math.sin(a+w)*L);g.closePath();g.fill()}
    const r=g.createRadialGradient(0,0,0,0,0,C*.4);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(-C,-C,S,S)});
  if(k=='shield')return sgCv(k,128,160,(g)=>{const P=[[64,6],[118,22],[112,84],[64,154],[16,84],[10,22]],path=()=>{g.beginPath();P.forEach((p,i)=>g[i?'lineTo':'moveTo'](p[0],p[1]));g.closePath()};
    g.fillStyle='rgba(255,255,255,.22)';path();g.fill();g.shadowColor='#fff';g.shadowBlur=10;g.strokeStyle='rgba(255,255,255,1)';g.lineWidth=7;path();g.stroke();
    g.lineWidth=6;g.beginPath();g.moveTo(64,30);g.lineTo(64,128);g.moveTo(32,62);g.lineTo(96,62);g.stroke()});
  if(k=='mark')return sgCv(k,128,128,(g)=>{g.translate(64,64);g.shadowColor='#fff';g.shadowBlur=8;g.strokeStyle='#fff';g.lineCap='round';g.lineWidth=5;g.beginPath();g.arc(0,0,44,0,6.283);g.stroke();
    g.lineWidth=3;g.beginPath();g.arc(0,0,30,0,6.283);g.stroke();g.lineWidth=6;for(let i=0;i<4;i++){g.save();g.rotate(i*Math.PI/2);g.beginPath();g.moveTo(0,-58);g.lineTo(0,-34);g.stroke();g.restore()}
    g.fillStyle='#fff';g.beginPath();g.moveTo(0,-14);g.lineTo(10,0);g.lineTo(0,14);g.lineTo(-10,0);g.closePath();g.fill()});
  if(k=='slash')return sgCv(k,256,64,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.7,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,1)');
    const v=g.createLinearGradient(0,0,0,h);g.fillStyle=gr;g.beginPath();g.moveTo(0,h/2);g.quadraticCurveTo(w*.6,h*.05,w,h*.38);g.lineTo(w,h*.62);g.quadraticCurveTo(w*.6,h*.95,0,h/2);g.fill()});
  return fx186Tex('soft')}
// ---------------- particles (pooled fxA puffs) ----------------
function sgPuff(p,o){try{return typeof fxaPuff=='function'?fxaPuff(p,o):null}catch(_){return null}}
// a spark streak: a thin bar stretched along its flight
function sgStreak(p,vx,vy,vz,col,len,w,life,g){const m=sgPuff(p,{col,add:1,geo:'box',r0:w||.045,r1:(w||.045)*.3,life:life||.4,op:1,v:[vx,vy,vz],g:g||0,drag:1.4,spin:0,fin:.02,sx:len||7});
  if(m){SG.V[4].set(vx,vy,vz);if(SG.V[4].lengthSq()>1e-6){SG.V[4].normalize();m.quaternion.setFromUnitVectors(SG.X,SG.V[4])}}return m}
// n streaks from p, fanned around yaw (spread radians; 6.3 = all round), speed sp, lift up
function sgSparks(p,col,n,sp,up,yaw,spread,len,life,g){for(let i=0;i<n;i++){const a=(yaw==null?Math.random()*6.283:yaw+(Math.random()-.5)*(spread||1)),v=sp*(.5+Math.random()*.7);
  sgStreak(new THREE.Vector3(p.x,p.y,p.z),Math.sin(a)*v,(up||0)*(.3+Math.random()),Math.cos(a)*v,i%3?col:0xffffff,len,null,life,g==null?6:g)}}
function sgDust(p,n,R,col,up){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=(R||1.5)*(.5+Math.random());sgPuff(new THREE.Vector3(p.x+Math.cos(a)*.3,p.y+.15,p.z+Math.sin(a)*.3),
  {col:col||0x7a6650,geo:'dod',r0:.22,r1:.7+Math.random()*.4,life:.7+Math.random()*.5,op:.42,v:[Math.cos(a)*v,(up||.6)*Math.random(),Math.sin(a)*v],drag:2.2,fin:.08})}}
function sgSmoke(p,n,R,col,life,op){for(let i=0;i<n;i++){const a=Math.random()*6.283,r=Math.random()*R;sgPuff(new THREE.Vector3(p.x+Math.cos(a)*r,p.y+Math.random()*.8,p.z+Math.sin(a)*r),
  {col:col||0x2a2630,geo:'dod',r0:.3,r1:.6+Math.random()*.45,life:(life||1.4)*(.7+Math.random()*.5),op:op||.55,v:[Math.cos(a)*.6,.35+Math.random()*.5,Math.sin(a)*.6],drag:1.2,fin:.12})}}
function sgBlood(p,n,sp,yaw,spread){for(let i=0;i<n;i++){const a=yaw==null?Math.random()*6.283:yaw+(Math.random()-.5)*(spread||1.4),v=(sp||2.5)*(.4+Math.random());
  sgPuff(new THREE.Vector3(p.x,p.y,p.z),{col:i%3?0x6a0608:0x9a1010,geo:'ico',r0:.05+Math.random()*.05,r1:.03,life:.7+Math.random()*.3,op:.95,v:[Math.sin(a)*v,1+Math.random()*2.5,Math.cos(a)*v],g:10,drag:.4,bounce:.15,fin:.02})}}
function sgEmbers(p,col,n,R,up,life){for(let i=0;i<n;i++){const a=Math.random()*6.283,r=Math.random()*(R||.6);sgPuff(new THREE.Vector3(p.x+Math.cos(a)*r,p.y+Math.random()*.4,p.z+Math.sin(a)*r),
  {spr:1,col:i%3?col:0xffffff,r0:.14+Math.random()*.1,r1:0,life:(life||.9)*(.6+Math.random()*.6),op:1,v:[Math.cos(a)*.5,(up||2)*(.5+Math.random()),Math.sin(a)*.5],drag:1,fin:.05})}}
function sgFeathers(p,col,n,sp){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=(sp||1.6)*(.4+Math.random());sgPuff(new THREE.Vector3(p.x,p.y,p.z),
  {col:i%2?col:0xf4ead8,geo:'box',sx:3.2,r0:.06,r1:.05,life:1.4+Math.random()*.6,op:.95,v:[Math.cos(a)*v,.8+Math.random()*1.5,Math.sin(a)*v],g:1.4,drag:2.6,spin:7,fin:.03})}}
// ---------------- shapes ----------------
// a blade's swept trail: an arc ribbon from angle a0 to a1 (0 = forward, +PI/2 = up (vertical) / left (horizontal)), white-hot at the
// blade's edge as it moves, fading behind it. pl 0: horizontal around p; 1: vertical along yaw (an overhead chop), tilt leans that
// plane about the forward axis (diagonal cuts). R radius, w ribbon width share, ms life (the sweep takes the first 40%).
function sgTrail(p,yaw,col,R,ms,pl,a0,a1,w,tilt,sw){if(!p)return;R=R||1.6;ms=ms||320;w=w||.42;sw=sw||.4;const n=36,lo=Math.min(a0,a1),geo=new THREE.RingGeometry(1-w,1,n,1,lo,Math.abs(a1-a0)),N=geo.attributes.position.count,cl=new Float32Array(N*3);
  geo.setAttribute('color',new THREE.BufferAttribute(cl,3));const mat=sgMat(0xffffff,null,1);mat.vertexColors=true;const m=sgMesh(geo,mat,34);m.userData.sgOwnG=1;const g=new THREE.Group();g.add(m);
  g.position.set(p.x,p.y,p.z);g.rotation.y=yaw-Math.PI/2;if(!pl)m.rotation.x=-Math.PI/2;else m.rotation.x=tilt||0;g.scale.setScalar(R);scene.add(g);const c0=new THREE.Color(col),dec=a0>a1;
  sgT(ms,k=>{const h=k<sw?ATK_E.out(k/sw):1,f=k<sw?1:Math.pow(1-(k-sw)/(1-sw),1.4);
    for(let i=0;i<N;i++){const j=i%(n+1),rad=i>n?1:0,u0=j/n,u=dec?1-u0:u0;let I=0;if(u<=h+.001){const t=Math.exp(-(h-u)*3.2);I=t*(rad?1:.22)*f}
      const hot=Math.max(0,1-(h-u)*7)*.75;cl[i*3]=(c0.r+(1-c0.r)*hot)*I;cl[i*3+1]=(c0.g+(1-c0.g)*hot)*I;cl[i*3+2]=(c0.b+(1-c0.b)*hot)*I}
    geo.attributes.color.needsUpdate=true;g.scale.setScalar(R*(1+k*.08))},()=>sgRm(g))}
// a glowing fissure running from p along yaw (L long, w wide): a molten crack that cools to a dark scar
function sgCrack(p,yaw,col,L,w,ms){if(!p||typeof fxbTex!='function')return;L=L||4;w=w||.7;ms=ms||1400;const d={x:Math.sin(yaw),z:Math.cos(yaw)},nx=Math.cos(yaw),nz=-Math.sin(yaw),seg=Math.max(4,Math.ceil(L*3));
  const D=kqsDrapeM(new THREE.PlaneGeometry(w,L,1,seg),new THREE.MeshBasicMaterial({map:fxbTex('crackD'),transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),27),
    G=kqsDrapeM(new THREE.PlaneGeometry(w*1.3,L,1,seg),sgMat(col,fxbTex('crackG'),0),28);
  const dr=(m,s,ww)=>kqsDrape(m,(u,v)=>{const t=(v/L+.5)*s;return [p.x+d.x*t+nx*u*ww,p.z+d.z*t+nz*u*ww]},.12);
  let grown=0;sgT(ms,k=>{const s=Math.min(1,k/.12);if(!grown){const e=ATK_E.out(s)*L;dr(D,e,1);dr(G,e,1);if(s>=1)grown=1}
    G.material.opacity=k<.12?1:Math.max(0,1-(k-.12)/.5);D.material.opacity=.85*(k<.7?1:1-(k-.7)/.3)},()=>{kqsRm(D);kqsRm(G)})}
// cracks radiating from p
function sgCracks(p,col,n,L,w,ms){const a0=Math.random()*6.283;for(let i=0;i<n;i++)sgCrack(p,a0+i/n*6.283+(Math.random()-.5)*.4,col,L*(.7+Math.random()*.5),w,ms)}
// a sunburst of light rays on the ground, turning slowly
function sgRays(p,col,R,ms,op){if(!p)return;if(!EVX.t.sgrays)EVX.t.sgrays=sgTex('rays');const m=evxGround(new THREE.Vector3(p.x,0,p.z),'sgrays',col,op==null?.9:op,R,29),a0=Math.random()*6.283;
  sgT(ms||700,k=>{const g=k<.15?ATK_E.out(k/.15):1,f=k<.4?1:1-(k-.4)/.6;m.userData.dr(a0+k*.6,R*(.5+.5*g));m.material.opacity=m.userData.op*f*(k<.15?g:1)},()=>evxRm(m))}
// a column of light falling from the sky onto p: the beam's bright tip drops in ~110 ms, then a radiant impact
function sgFall(p,col,h,w,ms,lvl){if(!p)return;h=h||10;w=w||.55;ms=ms||650;lvl=lvl|0;const b=gY(p,0),c2=sgLerp(col,0xffffff,.75),G=sgG('cyl',()=>{const q=new THREE.CylinderGeometry(1,1,1,18,1,true);q.translate(0,.5,0);return q});
  const g=new THREE.Group(),o=sgMesh(G,sgMat(col,fx186Tex('vgrad'),.8)),c=sgMesh(G,sgMat(c2,fx186Tex('vgrad'),1)),T=110/ms;g.add(o,c);let o2=null;if(lvl){o2=sgMesh(G,sgMat(sgC2(col),fx186Tex('vgrad'),.5));g.add(o2)}
  g.position.copy(b);scene.add(g);let hit=0;
  sgT(ms,k=>{const u=k<T?Math.pow(k/T,2):1,f=k<T?1:Math.pow(1-(k-T)/(1-T),1.5),ww=w*(1+(k>T?(k-T)*.8:0))*(1+lvl*.35);
    [o,c,o2].forEach((m,j)=>{if(!m)return;const s=j==1?.32:j==2?1.9:1;m.position.y=h*(1-u);m.scale.set(ww*s,h*u,ww*s);m.material.opacity=(j==1?.85:j==2?.3:.5)*f});
    if(!hit&&k>=T){hit=1;const q=gY(p,.4);fx186Flash(gY(p,1),col,2.2+lvl,240);burst(q,col,24+lvl*16,1.8+lvl,2.6,.7);ring(p,col,2.4+lvl*1.4,380);sgEmbers(q,c2,10+lvl*8,.8,3.5,.9)}},()=>sgRm(g))}
// sonic waves: bands of force racing out from p at chest height (shouts), n waves 90 ms apart
function sgWaves(p,col,R,ms,n,y,hgt){if(!p)return;R=R||5;ms=ms||520;n=n||3;y=y==null?1.2:y;const G=sgG('band',()=>new THREE.CylinderGeometry(1,1,1,40,1,true));
  for(let j=0;j<n;j++)sgLater(j*90,()=>{const m=sgMesh(G,sgMat(j%2?sgLerp(col,0xffffff,.4):col,fx186Tex('beam'),0)),b=gY(p,y-j*.18);m.position.copy(b);scene.add(m);
    sgT(ms,k=>{const e=ATK_E.out(k),r=.5+(R-.5)*e;m.scale.set(r,(hgt||.7)*(1-k*.5),r);m.material.opacity=.85*Math.pow(1-k,1.3)},()=>sgRm(m))})}
// a kite shield of light flying from p along yaw (shield bashes, thrown shields, wards)
function sgShieldFx(p,yaw,col,s,ms,dist){if(!p)return;s=s||1.2;ms=ms||320;dist=dist==null?1.2:dist;const G=sgG('pl',()=>new THREE.PlaneGeometry(1,1.25)),R=sgG('pl1',()=>new THREE.PlaneGeometry(2,2));
  const g=new THREE.Group(),a=sgMesh(G,sgMat(col,sgTex('shield'),0)),r=sgMesh(R,sgMat(sgLerp(col,0xffffff,.4),fx186Tex('ring'),0));g.add(a,r);g.position.set(p.x,p.y,p.z);g.rotation.y=yaw;scene.add(g);
  const sx=Math.sin(yaw),sz=Math.cos(yaw);
  sgT(ms,k=>{const e=ATK_E.out(k);g.position.set(p.x+sx*dist*e,p.y,p.z+sz*dist*e);a.scale.setScalar(s*(.7+.6*e));a.material.opacity=(k<.12?k/.12:1)*Math.pow(1-k,1.2);
    r.scale.setScalar(s*(.3+1.4*e));r.material.opacity=.9*Math.pow(1-k,1.6)},()=>sgRm(g))}
// a protective shell flashing round the hero: faceted dome + bright edges (kind 0 steel, 1 holy, 2 arcane, 3 stone)
function sgShell(p,col,r,ms,kind,lvl){if(!p)return;r=r||1.35;ms=ms||700;lvl=lvl|0;const G=sgG('ico',()=>new THREE.IcosahedronGeometry(1,1)),E=sgG('icoE',()=>new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1,1)));
  const g=new THREE.Group(),f=sgMesh(G,kind==3?new THREE.MeshStandardMaterial({color:0x8a8272,roughness:.95,flatShading:true,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}):sgMat(col,null,0)),l=new THREE.LineSegments(E,new THREE.LineBasicMaterial({color:sgLerp(col,0xffffff,.15),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  l.userData.lpsSkip=1;l.frustumCulled=false;l.renderOrder=34;g.add(f,l);g.position.copy(gY(p,1));scene.add(g);let l2=null;
  if(lvl){l2=new THREE.LineSegments(E,new THREE.LineBasicMaterial({color:sgC2(col),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));l2.userData.lpsSkip=1;l2.frustumCulled=false;g.add(l2)}
  const sp=kind==2?1.6:kind==1?.6:.25;
  sgT(ms,k=>{const u=k<.18?ATK_E.out(k/.18):1,fd=k<.5?1:1-(k-.5)/.5,pul=1+Math.sin(k*30)*.02*(1-k);g.scale.set(r*u*pul,r*1.08*u*pul,r*u*pul);g.rotation.y=k*sp;
    f.material.opacity=(kind==3?.5:.16)*fd*(kind==3?1:1+(k<.18?(1-k/.18)*2:0));l.material.opacity=(kind==3?.3:.75)*fd;if(l2){l2.material.opacity=.7*fd;l2.scale.setScalar(1.12+.05*Math.sin(k*20));l2.rotation.y=-k*sp*2}},()=>sgRm(g))}
// a halo / sun disc behind the hero's shoulders (holy and focus buffs)
function sgHalo(p,col,s,ms,lvl){if(!p)return;s=s||1.4;ms=ms||900;lvl=lvl|0;const a=new THREE.Sprite(new THREE.SpriteMaterial({map:sgTex('rays'),color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false})),
  b=new THREE.Sprite(new THREE.SpriteMaterial({map:fx186Tex('ring'),color:sgLerp(col,0xffffff,.5),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  a.userData.lpsSkip=b.userData.lpsSkip=1;a.renderOrder=b.renderOrder=35;const g=new THREE.Group();g.add(a,b);g.position.copy(gY(p,1.7));scene.add(g);
  sgT(ms,k=>{const u=k<.2?ATK_E.out(k/.2):1,f=k<.55?1:1-(k-.55)/.45;a.scale.setScalar(s*(2.2+lvl*.8)*u);a.material.rotation=k*1.2;a.material.opacity=.9*f;b.scale.setScalar(s*(1+lvl*.4)*(.6+.6*u));b.material.opacity=.8*f},()=>sgRm(g))}
// a crosshair locked onto a target (marks)
function sgMark(p,col,ms,lvl){if(!p)return;ms=ms||1000;const m=new THREE.Sprite(new THREE.SpriteMaterial({map:sgTex('mark'),color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  m.userData.lpsSkip=1;m.renderOrder=36;m.position.copy(gY(p,2.6));scene.add(m);const s=lvl?1.5:1.1;
  sgT(ms,k=>{const u=k<.25?ATK_E.out(k/.25):1;m.scale.setScalar(s*(2.6-1.6*u));m.material.rotation=(1-u)*1.6;m.material.opacity=(k<.25?u:k>.7?1-(k-.7)/.3:1)},()=>sgRm(m))}
// a falling blade of dark iron with a blood-red edge, slamming down onto p across yaw (Execute)
function sgGuillotine(p,yaw,col,ms,lvl){if(!p)return;ms=ms||520;lvl=lvl|0;const G=sgG('gblade',()=>{const s=new THREE.Shape();s.moveTo(-.75,-.42);s.lineTo(.75,.12);s.lineTo(.75,1.1);s.lineTo(-.75,1.1);s.closePath();return new THREE.ShapeGeometry(s)}),
  E=sgG('gedge',()=>{const s=new THREE.Shape();s.moveTo(-.8,-.5);s.lineTo(.8,.08);s.lineTo(.75,.24);s.lineTo(-.75,-.3);s.closePath();return new THREE.ShapeGeometry(s)});
  const g=new THREE.Group(),bl=sgMesh(G,new THREE.MeshBasicMaterial({color:0x1a0808,transparent:true,opacity:.92,side:THREE.DoubleSide,depthWrite:false}),33),ed=sgMesh(E,sgMat(col,null,1),34);
  g.add(bl,ed);const s=1+lvl*.45;g.scale.setScalar(s);g.rotation.y=yaw;const b=gY(p,0),y0=b.y+4.2*s,y1=b.y+.35;g.position.set(b.x,y0,b.z);scene.add(g);let hit=0;
  sgT(ms,k=>{const T=.24,u=k<T?Math.pow(k/T,2.2):1;g.position.y=y0+(y1-y0)*u;const f=k<.34?1:Math.max(0,1-(k-.34)/.3);bl.material.opacity=.92*f;ed.material.opacity=f;
    if(!hit&&k>=T){hit=1;const q=gY(p,1);fx186Flash(q,0xff1a10,2.4+lvl,260);sgBlood(q,14+lvl*10,3,null);sgSparks(q,col,10+lvl*6,6,2.5,null,6.3,6,.4);
      ring(p,0x8a0a0a,2+lvl,360);sgCrack(p,yaw+Math.PI/2,col,1.6+lvl,.8,1200);sgCrack(p,yaw-Math.PI/2,col,1.6+lvl,.8,1200)}},()=>sgRm(g))}
// a thin taut wire from a to b with a noose tightening round b (Garrote)
function sgWire(a,b,col,ms,lvl){if(!a||!b)return;ms=ms||600;const G=sgG('cyl',()=>{const q=new THREE.CylinderGeometry(1,1,1,18,1,true);q.translate(0,.5,0);return q}),T=sgG('noose',()=>new THREE.TorusGeometry(.32,.025,4,20));
  const w=sgMesh(G,sgMat(col,null,1)),n=sgMesh(T,sgMat(sgLerp(col,0xffffff,.3),null,1)),L=a.distanceTo(b);w.position.copy(a);w.quaternion.setFromUnitVectors(SG.Y,SG.V[0].copy(b).sub(a).normalize());
  n.position.copy(b);n.rotation.x=Math.PI/2;scene.add(w,n);const ww=lvl?.035:.022;
  sgT(ms,k=>{const u=k<.15?k/.15:1,f=k<.6?1:1-(k-.6)/.4;w.scale.set(ww,L*u,ww);w.material.opacity=f*(.7+.3*Math.sin(k*60));n.scale.setScalar((1.4-.75*Math.min(1,k/.3))*(1+lvl*.2));n.material.opacity=f;n.rotation.z+=.25},()=>{sgRm(w);sgRm(n)})}
// a chain of interlocking oval links (shared shapes), with a hook head at its end. mode 'out': the hook flies from a to b along
// an arc (first 40%), bites, then reels back to a; 'pull': the chain snaps taut a→b at once and reels in from b to a.
var SG_CH={V:[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],Q:new THREE.Quaternion(),R:new THREE.Quaternion()};
function sgChain(a,b,col,ms,mode,arch){if(!a||!b)return;ms=ms||600;const L=a.distanceTo(b);if(L<.2)return;const sp=.21,n=Math.min(70,Math.max(3,Math.ceil(L/sp))),out=mode!='pull',ah=arch==null?(out?Math.min(1.6,L*.14):.05):arch;
  const LG=sgG('link',()=>{const q=new THREE.TorusGeometry(.085,.026,5,12);q.scale(1,1.65,1);return q}),
    HK=sgG('hook',()=>{const parts=[];const sh=new THREE.CylinderGeometry(.045,.05,.42,6);sh.translate(0,.21,0);parts.push(sh);const cv=new THREE.TorusGeometry(.17,.045,5,12,Math.PI*1.15);cv.rotateZ(Math.PI*.95);cv.translate(.17,.42,0);parts.push(cv);
      const bb=new THREE.ConeGeometry(.06,.2,5);bb.rotateZ(-Math.PI*.15);bb.translate(.33,.26,0);parts.push(bb);const ey=new THREE.TorusGeometry(.06,.02,4,8);ey.translate(0,-.03,0);parts.push(ey);
      return parts.length&&THREE.BufferGeometryUtils?THREE.BufferGeometryUtils.mergeBufferGeometries(parts):parts});
  const mt=new THREE.MeshStandardMaterial({color:col,metalness:.85,roughness:.32,emissive:sgLerp(col,0x000000,.55),emissiveIntensity:.6,flatShading:true}),g=new THREE.Group(),links=[];
  for(let i=0;i<n;i++){const m=sgMesh(LG,mt,30);m.visible=false;g.add(m);links.push(m)}
  const hk=new THREE.Group();(Array.isArray(HK)?HK:[HK]).forEach(q=>{const m=sgMesh(q,mt,30);m.scale.setScalar(1.25);hk.add(m)});g.add(hk);scene.add(g);
  const V=SG_CH.V,pt=(t,o)=>{o.copy(a).lerp(b,t);o.y+=Math.sin(t*Math.PI)*ah;return o};let bit=0;
  sgT(ms,k=>{let s;if(out){s=k<.4?ATK_E.out(k/.4):k<.55?1:1-ATK_E.io((k-.55)/.45)}else s=1-ATK_E.io(Math.min(1,k/.9));
    const tip=s;for(let i=0;i<n;i++){const t=(i+.5)/n;const m=links[i];if(t>tip){m.visible=false;continue}m.visible=true;
      // links bunch toward the tip while it is pulled in (a chain reeled, not shortened in place)
      const tt=t;pt(tt,m.position);pt(Math.min(1,tt+.01),V[1]);V[2].copy(V[1]).sub(m.position);if(V[2].lengthSq()<1e-8)V[2].set(0,0,1);V[2].normalize();
      m.quaternion.setFromUnitVectors(SG.Y,V[2]);if(i%2){SG_CH.R.setFromAxisAngle(V[2],Math.PI/2);m.quaternion.premultiply(SG_CH.R)}}
    pt(tip,hk.position);pt(Math.max(0,tip-.02),V[1]);V[2].copy(hk.position).sub(V[1]);if(V[2].lengthSq()<1e-8)V[2].set(0,0,1);V[2].normalize();hk.quaternion.setFromUnitVectors(SG.Y,V[2]);hk.visible=tip>.02;
    if(out&&!bit&&k>=.4){bit=1;sgSparks(b,0xfff0c8,8,4,2,null,6.3,5,.3);sgDust(b,5,1.4)}
    const f=k>.92?(1-k)/.08:1;mt.opacity=f;mt.transparent=f<1},()=>{sgRm(g)})}
// whirlwind: blade trails spinning all round the hero for the whole channel, dust and sparks flung outward. Follows the hero
// locally and ends with his channel; lvl 1 (Bladestorm): more rings in two colours, a funnel of wind, embers.
var SG_VX={geo:null};
function sgVortexGeo(){if(SG_VX.geo)return SG_VX.geo;const n=48,g=new THREE.RingGeometry(.72,1,n,1,0,Math.PI*1.7),N=g.attributes.position.count,c=new Float32Array(N*3);
  for(let i=0;i<N;i++){const j=i%(n+1),rad=i>n?1:0,u=j/n,I=Math.pow(u,1.8)*(rad?1:.25),hot=Math.max(0,(u-.85)/.15)*.45;c[i*3]=c[i*3+1]=c[i*3+2]=I;if(hot){c[i*3]=I+hot;c[i*3+1]=I+hot;c[i*3+2]=I+hot}}
  g.setAttribute('color',new THREE.BufferAttribute(c,3));return SG_VX.geo=g}
function sgVortex(p,col,R,ms,lvl){if(!p)return;R=R||2.7;ms=ms||2400;lvl=lvl|0;const G=sgVortexGeo(),c2=lvl?sgC2(col):sgLerp(col,0xffffff,.5),g=new THREE.Group(),rings=[];
  const spec=[[.62,.55,0,col],[.95,.95,.12,c2],[.8,1.4,-.1,col]];if(lvl)spec.push([1.08,.7,.06,c2],[.7,1.9,.18,col]);
  spec.forEach(([r,y,t,c],j)=>{const m=sgMesh(G,sgMat(c,null,0),34);m.material.vertexColors=true;const h=new THREE.Group();h.position.y=y;h.rotation.x=t;m.rotation.x=-Math.PI/2;m.scale.setScalar(R*r);h.add(m);g.add(h);rings.push([h,m,j%2?-1:1,r])});
  const dsk=sgMesh(sgG('dsk',()=>{const q=new THREE.PlaneGeometry(2,2);q.rotateX(-Math.PI/2);return q}),sgMat(col,fx186Tex('ring'),0),30);dsk.position.y=.08;g.add(dsk);
  let fun=null;if(lvl){fun=sgMesh(sgG('fun',()=>{const q=new THREE.CylinderGeometry(1,.45,1,24,1,true);q.translate(0,.5,0);return q}),sgMat(c2,fx186Tex('vgrad'),0),31);fun.scale.set(R*.9,2.6,R*.9);g.add(fun)}
  g.position.copy(gY(p,0));scene.add(g);const local=!(typeof MPV!='undefined'&&MPV.rep);let pt=0,dead=0,ch0=null;
  sgT(ms+250,k=>{const t=k*(ms+250)/1000;if(local&&typeof pl!='undefined'){g.position.copy(pl.position);if(t>.12){const c=hero.chan;if(!ch0&&c)ch0=c;if((!c||c!==ch0)&&!dead)dead=t}}
    const end=dead?Math.max(0,1-(t-dead)/.22):(t>ms/1000?Math.max(0,1-(t-ms/1000)/.25):1),inn=Math.min(1,t/.12),f=inn*end;
    rings.forEach(([h,m,s,r],j)=>{h.rotation.y=-s*t*(11+j*1.5)*(1+lvl*.2)+j;m.material.opacity=(j>2?.5:.8)*(lvl?.8:1)*f;m.scale.setScalar(R*r*(1+.04*Math.sin(t*20+j)))});
    dsk.scale.setScalar(R*1.05*(1+.05*Math.sin(t*14)));dsk.material.opacity=.4*f;if(fun){fun.rotation.y=-t*8;fun.material.opacity=.22*f}
    if(f>.3&&++pt%3==0){const b=g.position,a=Math.random()*6.283,cs=Math.cos(a),sn=Math.sin(a),q=new THREE.Vector3(b.x+cs*R*.9,b.y+.15,b.z+sn*R*.9);
      sgPuff(q,{col:0x7a6650,geo:'dod',r0:.2,r1:.75,life:.6,op:.38,v:[-sn*4+cs*2,.5,cs*4+sn*2],drag:2.4,fin:.08});
      sgStreak(new THREE.Vector3(b.x+cs*R*.8,b.y+.6+Math.random()*.8,b.z+sn*R*.8),(-sn*5+cs*3),1+Math.random()*2,(cs*5+sn*3),Math.random()<.5?col:0xffffff,6,null,.32,5);
      if(lvl)sgPuff(new THREE.Vector3(b.x+cs*R*.6,b.y+.4,b.z+sn*R*.6),{spr:1,col:c2,r0:.16,r1:0,life:.6,op:1,v:[-sn*3,2.4,cs*3],drag:1,fin:.05})}},()=>sgRm(g))}
// a bow wave of force in front of a charging hero (kind 0 dust and rock, 1 holy light), following him for ms
function sgWedge(p,yaw,col,ms,kind,lvl){if(!p)return;ms=ms||500;lvl=lvl|0;const G=sgG('wedge',()=>{const q=new THREE.ConeGeometry(.95,1.5,20,1,true);q.rotateX(Math.PI/2);q.translate(0,0,.25);return q});
  const m=sgMesh(G,sgMat(col,null,0),32),m2=sgMesh(G,sgMat(sgLerp(col,0xffffff,.6),null,0),33),g=new THREE.Group();m2.scale.setScalar(.7);g.add(m,m2);g.scale.setScalar(1+lvl*.35);scene.add(g);
  const local=!(typeof MPV!='undefined'&&MPV.rep);let pt=0;g.position.copy(gY(p,1));g.rotation.y=yaw;
  sgT(ms,k=>{if(local&&typeof pl!='undefined'){g.position.copy(pl.position);g.position.y+=1;g.rotation.y=pl.rotation.y}const f=(k<.15?k/.15:1)*(k>.8?(1-k)/.2:1);m.material.opacity=.3*f;m2.material.opacity=.45*f;
    if(++pt%2==0){const b=g.position,ry=g.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry);
      if(kind)sgPuff(new THREE.Vector3(b.x-fx*.6+(Math.random()-.5)*.8,b.y-.3+Math.random()*.8,b.z-fz*.6+(Math.random()-.5)*.8),{spr:1,col:Math.random()<.5?col:0xffffff,r0:.3,r1:0,life:.45,op:.9,v:[-fx*3,.6,-fz*3],drag:1.5,fin:.04});
      else sgPuff(new THREE.Vector3(b.x-fx*.4,b.y-.9,b.z-fz*.4),{col:0x7a6650,geo:'dod',r0:.25,r1:.8,life:.6,op:.45,v:[-fx*2+(Math.random()-.5)*2,.4,-fz*2+(Math.random()-.5)*2],drag:2,fin:.08});
      sgStreak(new THREE.Vector3(b.x+fx*.9+(Math.random()-.5),b.y+(Math.random()-.5)*.8,b.z+fz*.9+(Math.random()-.5)),-fx*9,0,-fz*9,kind?col:0xe8d8c0,9,.03,.22,0)}},()=>sgRm(g))}

// ---------------- the signatures (each one call, relayed as one entry) ----------------
// Skull Splitter: an overhead chop (vertical trail), the skull-cracking fissure under the target, rock and blood
function sgSkull(p,yaw,col,lvl){if(!p)return;lvl=lvl|0;const b=gY(p,0);sgBusy(()=>{
  sgTrail(new THREE.Vector3(b.x-Math.sin(yaw)*1.1,b.y+1.4,b.z-Math.cos(yaw)*1.1),yaw,col,1.9+lvl*.4,340,1,2.5,-.6,.5,0,.3);sgTrail(new THREE.Vector3(b.x-Math.sin(yaw)*1.1,b.y+1.4,b.z-Math.cos(yaw)*1.1),yaw,0xffffff,1.75+lvl*.4,260,1,2.5,-.6,.18,0,.3);
  fx186Flash(gY(p,.9),0xfff0d8,1.6+lvl,200);sgCrack(gY(p,0),yaw,col,2.6+lvl*2,1+lvl*.5,1500+lvl*600);sgCrack(gY(p,0),yaw+Math.PI,col,1.2+lvl,.8,1300);
  for(let i=0;i<6+lvl*6;i++)try{fxbChunk(gY(p,.3),2.4+lvl,6+lvl*2,.13+Math.random()*.1)}catch(_){}
  sgDust(b,8+lvl*6,2.2);sgBlood(gY(p,1.2),10,2.4,yaw,1.6);sgSparks(gY(p,.6),col,8+lvl*6,5,2.5,null,6.3,6,.35);ring(p,col,1.8+lvl,300)})}
// Execute: a guillotine of dark iron falls on the target, a blood-red flash; low = it was a killing blow
function sgExec(p,yaw,col,low,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const b=gY(p,0);
  sgTrail(new THREE.Vector3(b.x,b.y+1.3,b.z),yaw,0xff2010,1.7+lvl*.3,280,1,2.4,-.7,.3,.55);sgGuillotine(p,yaw,col,520+lvl*120,lvl);
  if(low){sgLater(130,()=>{sgBlood(gY(p,1),18,3.5,null);fx186Flash(gY(p,1.2),0xff0000,3.2,320)})}})}
// Shield Bash: a shield of light slams forward from the hero, a vertical shock ring, sparks fanned ahead
function sgBash(p,yaw,col,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const q=gY(p,1.1);sgShieldFx(q,yaw,col,1.3+lvl*.5,340+lvl*80,1.3+lvl*.8);
  if(lvl)sgLater(70,()=>sgShieldFx(q,yaw,sgC2(col),1.9,360,2.4));fx186Flash(q,col,1.8+lvl,200);sgSparks(q,col,12+lvl*8,7,1.5,yaw,1.2,7,.35,4);sgDust(gY(p,0),5,1.6)})}
// Holy Smite: a column of light falls on the paladin, sunburst rays race over the ground, a radiant wave
function sgSmite(p,col,R,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{sgFall(p,col,12,.42+lvl*.12,560+lvl*160,lvl);
  sgLater(110,()=>{sgRays(p,col,R*1.15+lvl,700+lvl*300,.85);ring(p,col,R*2.1,420);ring(p,0xffffff,R*1.3,280);sgWaves(p,col,R*1.1,420,1+lvl,.4,.45);
    sgSparks(gY(p,.5),0xfff4c8,14+lvl*10,R*2.2,1.2,null,6.3,6,.45,2);if(lvl){sgEmbers(gY(p,.2),sgC2(col),16,R,2.5,1.2)}})})}
// Eviscerate: two crossing rips through the target, a magenta flash and a spray (pips = combo points spent)
function sgEvisc(p,yaw,col,pips,lvl){if(!p)return;lvl=lvl|0;pips=pips|0;sgBusy(()=>{const b=gY(p,1.1),bk=new THREE.Vector3(b.x-Math.sin(yaw)*.4,b.y,b.z-Math.cos(yaw)*.4);
  sgTrail(bk,yaw+.2,col,1.4+lvl*.3,300,1,-.9,1.9,.42,.75,.35);sgTrail(bk,yaw+.2,0xffffff,1.3+lvl*.3,220,1,-.9,1.9,.14,.75,.35);sgLater(70,()=>{sgTrail(bk,yaw-.2,sgLerp(col,0xffffff,.3),1.4+lvl*.3,300,1,-.9,1.9,.42,-.75,.35);sgTrail(bk,yaw-.2,0xffffff,1.3+lvl*.3,220,1,-.9,1.9,.14,-.75,.35)});
  fx186Flash(b,col,1.2+pips*.25+lvl,200);sgBlood(b,6+pips*3,2.6,yaw,1.4);sgSparks(b,col,6+pips*2,5,1.5,yaw,1.6,6,.3,3);
  if(pips>=5||lvl)sgLater(120,()=>{ring(p,col,1.6,280);sgEmbers(b,col,10,.4,2,.7)})})}
// Garrote: a wire from the hands to the throat, a noose tightening, blood
function sgGarrote(a,b,col,pips,lvl){if(!a||!b)return;lvl=lvl|0;sgBusy(()=>{sgWire(a,b,col,640+lvl*200,lvl);sgLater(140,()=>{sgBlood(b,8+(pips|0)*3,1.8,null);fx186Flash(b,col,1,180)})})}
// War Cry / Intimidating Shout: waves of sound tear outward, the ground dust blown away, embers torn up (kind 0 cry, 1 shout)
function sgRoar(p,col,R,kind,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{sgWaves(p,col,R,560+lvl*120,3+lvl*2,1.5,.8);sgWaves(p,sgLerp(col,0x200000,.4),R*.7,460,2,.3,.35);
  sgDust(gY(p,0),10+lvl*6,R*.9,0x6a5640,.2);sgEmbers(gY(p,.6),kind?0xff3a1a:col,12+lvl*10,1,3,1);fx186Flash(gY(p,1.6),col,1.6+lvl,240);if(lvl)ring(p,sgC2(col),R*1.5,520)})}
// Bloodrage: a red mist pours round the warrior and rises like steam
function sgBloodFx(p,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const b=gY(p,0);sgSmoke(gY(p,.3),10+lvl*6,1.1,0x5a0608,1.4,.5);sgEmbers(gY(p,.4),0xff2020,18+lvl*10,.7,3.5,1.2);
  sgBlood(gY(p,1.2),12,2.2,null);sgWaves(p,0xc0101a,3,520,2+lvl,1.2,.6);fx186Flash(gY(p,1.4),0xff1010,1.8,260)})}
// Earthshatter: cracks race out all round, rock spikes and debris burst up
function sgQuake(p,col,R,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const b=gY(p,0);sgCracks(b,col,6+lvl*2,R*1.05,.9,1700+lvl*600);ring(p,col,R*2.1,420);
  for(let j=0;j<7+lvl*4;j++){const a=j/(7+lvl*4)*6.283+Math.random()*.3,r=R*(.45+Math.random()*.45);try{kqsSpike(kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r),0x7a5a3a,.9+Math.random()*.6+lvl*.4)}catch(_){}}
  for(let i=0;i<10+lvl*8;i++)try{fxbChunk(gY(p,.3),R*1.3,7,.14+Math.random()*.12)}catch(_){}sgDust(b,14+lvl*6,R*1.2);fx186Flash(gY(p,.6),col,2.4+lvl,240)})}
// Leap Slam / Titan's Fall landings: a crater of cracks, debris, dust
function sgCrater(p,col,R,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const b=gY(p,0);sgCracks(b,col,5+lvl*2,R*.9,.8,1500+lvl*500);for(let i=0;i<8+lvl*6;i++)try{fxbChunk(gY(p,.3),R*1.1,6.5,.13+Math.random()*.1)}catch(_){}
  sgDust(b,12+lvl*6,R);sgSparks(gY(p,.3),col,8+lvl*6,R*2,1.5,null,6.3,6,.4)})}
// Iron Skin / Unbreakable / Divine Barrier / Mana Shield / Aegis: a shell round the hero
function sgWard(p,col,kind,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{sgShell(p,col,1.35+lvl*.25,820+lvl*300,kind,lvl);const q=gY(p,1);
  if(kind==0){sgSparks(q,0xe8f0ff,14+lvl*8,4,1.5,null,6.3,5,.35,3);fx186Flash(q,0xc8d8ff,1.6,200)}
  else if(kind==1){sgEmbers(gY(p,.1),col,14+lvl*8,.9,2.5,1);ring(p,col,2.4,600);fx186Flash(q,col,1.8,260)}
  else if(kind==2){for(let i=0;i<10+lvl*6;i++){const a=i/10*6.283;sgPuff(new THREE.Vector3(p.x+Math.cos(a)*1.4,q.y+Math.sin(a*3)*.5,p.z+Math.sin(a)*1.4),{spr:1,col:i%2?col:0xffffff,r0:.22,r1:0,life:.7,op:1,v:[-Math.cos(a)*1.6,.2,-Math.sin(a)*1.6],drag:1.2,fin:.05})}ring(p,col,2.2,500)}
  else{sgDust(gY(p,0),12,1.8,0x6a6258);for(let i=0;i<8;i++)try{fxbChunk(gY(p,.5),1.2,4,.1+Math.random()*.08)}catch(_){}fx186Flash(q,0xd8d0c0,1.6,220)}})}
// Lay on Hands: soft light rains down on the paladin, green-gold motes rise from the ground
function sgPray(p,col,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const b=gY(p,0);for(let i=0;i<16+lvl*10;i++){const a=Math.random()*6.283,r=Math.random()*1.2;
    sgPuff(new THREE.Vector3(b.x+Math.cos(a)*r,b.y+3.5+Math.random()*1.5,b.z+Math.sin(a)*r),{spr:1,col:i%2?0xfff4c0:col,r0:.2,r1:.05,life:.9+Math.random()*.4,op:1,v:[0,-3.5,0],drag:.4,fin:.15})}
  sgEmbers(gY(p,.1),col,14+lvl*8,.9,2,1.2);ring(p,col,2.6,700);sgHalo(p,0xfff0b0,1,900+lvl*400,lvl)})}
// Consecration / War Banner / Beacon: planted into the ground: a cross of light and rays
function sgPlant(p,col,R,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{sgRays(p,col,R,900+lvl*400,.75);fx186Flash(gY(p,.5),col,2,260);sgCrack(gY(p,0),0,col,R*.8,.5,1000);sgCrack(gY(p,0),Math.PI,col,R*.8,.5,1000);
  sgCrack(gY(p,0),Math.PI/2,col,R*.6,.5,1000);sgCrack(gY(p,0),-Math.PI/2,col,R*.6,.5,1000);sgEmbers(gY(p,.1),col,10+lvl*8,R*.6,2.4,1)})}
// Seal of Light: a sun disc rises behind the paladin
function sgSeal(p,col,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{sgHalo(p,col,1.3+lvl*.3,1200+lvl*500,lvl);sgEmbers(gY(p,.6),col,12+lvl*8,.7,2.6,1);fx186Flash(gY(p,1.7),col,1.6,260)})}
// Penance tick: thin shafts of light strike down in a ring round the kneeling paladin
function sgPenance(p,col,R,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const n=4+lvl*2,a0=Math.random()*6.283;for(let j=0;j<n;j++){const a=a0+j/n*6.283,r=R*(.45+Math.random()*.4);
    sgFall(kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r),col,7,.18+lvl*.06,380,0)}ring(p,col,R*1.9,420);sgEmbers(gY(p,.2),0xfff0b0,6+lvl*4,R*.6,1.6,.8)})}
// Smoke Bomb: a flash at the feet, then a thick bank of smoke rolling outward
function sgSmokeBomb(p,col,R,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const b=gY(p,0);fx186Flash(gY(p,.4),0xffffff,2.2,140);ring(p,col,R*1.8,360);
  for(let i=0;i<18+lvl*10;i++){const a=Math.random()*6.283,v=R*(.8+Math.random()*.8);sgPuff(new THREE.Vector3(b.x,b.y+.3+Math.random()*.6,b.z),
    {col:i%3?0x3a3442:0x5a5068,geo:'dod',r0:.3,r1:.75+Math.random()*.45+lvl*.2,life:1.3+Math.random()*.8+lvl*.6,op:.5,v:[Math.cos(a)*v,.3+Math.random()*.6,Math.sin(a)*v],drag:2.2,fin:.06})}
  sgSparks(gY(p,.4),0xd8c8ff,8,5,1,null,6.3,4,.25)})}
// Vanish: a swirl of dark wisps folding in on the assassin
function sgVanish(p,col,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const b=gY(p,0);for(let i=0;i<18+lvl*10;i++){const a=i/18*6.283,r=1.4+Math.random()*.4;
    sgPuff(new THREE.Vector3(b.x+Math.cos(a)*r,b.y+.2+Math.random()*1.6,b.z+Math.sin(a)*r),{col:0x1a1224,geo:'dod',r0:.35,r1:.05,life:.6+Math.random()*.3,op:.7,v:[-Math.cos(a)*2.4-Math.sin(a)*1.5,.3,-Math.sin(a)*2.4+Math.cos(a)*1.5],drag:.6,fin:.1})}
  sgSmoke(gY(p,0),8+lvl*6,.6,0x241a30,1.2,.55);fx186Flash(gY(p,1),col,1.4,200)})}
// Poison Blades: venom drips from both blades, a green haze rises
function sgVenom(p,col,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const b=gY(p,1);for(let i=0;i<14+lvl*8;i++){const s=i%2?1:-1;sgPuff(new THREE.Vector3(b.x+s*.4+(Math.random()-.5)*.3,b.y+Math.random()*.4,b.z+(Math.random()-.5)*.3),
    {col:i%3?0x4ab02a:0x8aff5a,geo:'ico',r0:.06,r1:.03,life:.8,op:.95,v:[0,-.5,0],g:6,drag:.4,bounce:.1,fin:.02})}
  sgEmbers(gY(p,.2),col,12+lvl*8,.6,1.4,1.1);sgSmoke(gY(p,0),5,.5,0x2a5a1a,1,.35)})}
// Shadow Dance: shadow afterimages whirl round the assassin
function sgDance(p,col,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{sgTrail(gY(p,.9),0,col,1.3,420,0,0,6.2,.3,0,.6);sgTrail(gY(p,1.5),0,sgLerp(col,0xffffff,.3),1.1,420,0,6.2,0,.3,0,.6);
  for(let i=0;i<12+lvl*8;i++){const a=i/12*6.283;sgPuff(new THREE.Vector3(p.x+Math.cos(a)*1.1,gY(p,0).y+.3+Math.random()*1.4,p.z+Math.sin(a)*1.1),{col:0x1a1224,geo:'dod',r0:.3,r1:.6,life:.6,op:.5,v:[-Math.sin(a)*3,.2,Math.cos(a)*3],drag:1.5,fin:.1})}
  sgEmbers(gY(p,.5),col,8+lvl*6,.8,1.8,.8)})}
// Hunter's Focus: rings of green light close in on the ranger's eyes, leaves swirl
function sgFocus(p,col,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const b=gY(p,1.6);for(let i=0;i<12+lvl*8;i++){const a=i/12*6.283,r=1.6;
    sgPuff(new THREE.Vector3(b.x+Math.cos(a)*r,b.y+(Math.random()-.5)*.6,b.z+Math.sin(a)*r),{spr:1,col:i%2?col:0xffffff,r0:.2,r1:.03,life:.45,op:1,v:[-Math.cos(a)*3.4,0,-Math.sin(a)*3.4],fin:.05})}
  for(let i=0;i<8+lvl*6;i++){const a=Math.random()*6.283;sgPuff(new THREE.Vector3(p.x+Math.cos(a)*.8,b.y-1.2,p.z+Math.sin(a)*.8),{col:i%2?0x6aa03a:0xa8c060,geo:'box',sx:2.2,r0:.08,r1:.07,life:1.3,op:.95,v:[-Math.sin(a)*2,1.6,Math.cos(a)*2],g:1,drag:1.6,spin:5,fin:.03})}
  fx186Flash(b,col,1.2+lvl,240);if(lvl)sgHalo(p,sgC2(col),.9,900,0)})}
// Hawk Dive impact: three talon rakes, a burst of feathers
function sgTalons(p,yaw,col,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const b=gY(p,1.2),nx=Math.cos(yaw),nz=-Math.sin(yaw);
  [-1,0,1].forEach(o=>sgTrail(new THREE.Vector3(b.x+nx*o*.22,b.y,b.z+nz*o*.22),yaw,col,.9+lvl*.25,260,1,2.2,-.9,.18,o*.15,.35));
  sgFeathers(b,0xb08850,12+lvl*8,2);fx186Flash(b,col,1.4+lvl,200);sgSparks(b,col,8,4,1.5,yaw,1.4,5,.3,3)})}
// Death Mark: a crosshair locks on, a thin crimson thread links it to the assassin
function sgMarkFx(a,b,col,lvl){if(!b)return;lvl=lvl|0;sgBusy(()=>{sgMark(b,col,1100+lvl*400,lvl);if(a){const q=gY(b,1.2);try{fx186Bolt(gY(a,1.2),q,col,.4,220)}catch(_){}}fx186Flash(gY(b,1.2),col,1.2,200)})}
// Aimed Shot release: a sonic boom of rings along the line, wind streaks peeling off it
function sgSnipe(o,d,col,L,lvl){if(!o||!d)return;lvl=lvl|0;sgBusy(()=>{const yaw=Math.atan2(d.x,d.z),R=sgG('pl1',()=>new THREE.PlaneGeometry(2,2));
  for(let j=0;j<4+lvl*2;j++){const t=1+j*(L/(5+lvl*2)),q=new THREE.Vector3(o.x+d.x*t,o.y,o.z+d.z*t);sgLater(j*25,()=>{const m=sgMesh(R,sgMat(j%2?col:0xffffff,fx186Tex('ring'),0));m.position.copy(q);m.rotation.y=yaw;scene.add(m);
    sgT(300,k=>{m.scale.setScalar((.4+k*1.1)*(1+lvl*.3)*(j?1:1.4));m.material.opacity=.9*(1-k)},()=>sgRm(m))})}
  for(let i=0;i<14+lvl*8;i++){const t=Math.random()*L,q=new THREE.Vector3(o.x+d.x*t,o.y+(Math.random()-.5)*.5,o.z+d.z*t);sgStreak(q,d.x*14,0,d.z*14,i%2?col:0xffffff,10,.03,.25,0)}
  fx186Flash(o,col,2.2+lvl,200)})}
// Avenger's Shield: a golden wake behind the flying shield (called per leg) and a ringing impact
function sgShieldHit(p,yaw,col,lvl){if(!p)return;sgBusy(()=>{sgShieldFx(p,yaw,col,.9+(lvl|0)*.3,240,.5);sgSparks(p,col,8,5,1.8,null,6.3,5,.3,3);fx186Flash(p,col,1.2,160)})}
// Frost Nova: the ground frosts over in a snap, ice crystals jut up, snow is flung out
function sgFrost(p,col,R,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const b=gY(p,0);sgRays(p,0xdff6ff,R*1.05,900+lvl*500,.6);ring(p,col,R*2.2,380);ring(p,0xffffff,R*1.5,260);
  for(let j=0;j<9+lvl*4;j++){const a=j/(9+lvl*4)*6.283,r=R*(.55+Math.random()*.35);try{kqsSpike(kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r),0x9fe3ff,.7+Math.random()*.5,1)}catch(_){}}
  for(let i=0;i<20+lvl*10;i++){const a=Math.random()*6.283,v=R*(1+Math.random());sgPuff(new THREE.Vector3(b.x,b.y+.4,b.z),{col:0xeaf8ff,geo:'tet',r0:.06,r1:.02,life:.7,op:.9,v:[Math.cos(a)*v,Math.random()*1.5,Math.sin(a)*v],g:3,drag:1.8,spin:8,fin:.02})}
  sgSmoke(gY(p,0),8,R*.7,0xc8e8f8,1.2,.3);fx186Flash(gY(p,.6),col,2+lvl,240)})}
// Envenom: every poisoned enemy erupts in a toxic spray
function sgToxic(p,col,lvl){if(!p)return;sgBusy(()=>{const b=gY(p,1);for(let i=0;i<10+(lvl|0)*6;i++){const a=Math.random()*6.283,v=1+Math.random()*2;
  sgPuff(new THREE.Vector3(b.x,b.y,b.z),{col:i%2?0x5ac02a:0x9aff6a,geo:'ico',r0:.08,r1:.03,life:.7,op:.9,v:[Math.cos(a)*v,2+Math.random()*2,Math.sin(a)*v],g:8,drag:.5,fin:.02})}
  sgSmoke(gY(p,.4),4,.4,0x3a6a1a,.9,.4);fx186Flash(b,col,1.1,180)})}
// Cleave: one wide horizontal sweep of the blade, dust and sparks thrown along the arc
function sgCleave(p,yaw,col,R,lvl){if(!p)return;lvl=lvl|0;sgBusy(()=>{const b=gY(p,.95);sgTrail(b,yaw,col,R*1.02,360+lvl*80,0,-1.45,1.45,.48,0,.45);if(lvl)sgLater(50,()=>sgTrail(gY(p,1.25),yaw,sgC2(col),R*.85,340,0,-1.3,1.3,.3,0,.45));
  for(let j=0;j<5;j++){const a=yaw+(j-2)*.55;sgDust(new THREE.Vector3(p.x+Math.sin(a)*R*.8,b.y-.9,p.z+Math.cos(a)*R*.8),2,1.2)}sgSparks(b,col,10+lvl*6,6,1.2,yaw,2.6,6,.35,4)})}
// Phantom Strike landing: a full ring of shadow-steel cuts round the assassin
function sgPhantom(o,p,col,R,lvl){sgBusy(()=>{if(o){sgSmoke(gY(o,0),8,.5,0x241a30,1,.6)}if(p){sgTrail(gY(p,1),Math.random()*6.283,col,R*1.05,340,0,0,6.2,.4,0,.5);sgTrail(gY(p,.6),Math.random()*6.283,sgLerp(col,0xffffff,.4),R*.8,320,0,6.2,0,.3,0,.5);
  sgSmoke(gY(p,0),6,R*.5,0x241a30,.8,.45);sgSparks(gY(p,1),col,10+(lvl|0)*6,R*2,1,null,6.3,6,.3,3)}})}
// Dragon's Breath: a gout of flame with smoke curling off it
function sgBreathFx(p,d,col,R,lvl){if(!p)return;sgBusy(()=>{const yaw=Math.atan2(d.x,d.z);for(let i=0;i<16+(lvl|0)*10;i++){const a=yaw+(Math.random()-.5)*1.2,v=R*(2+Math.random()*2);
  sgPuff(gY(kqsV(p.x+d.x*.8,p.z+d.z*.8),1.2),{spr:1,col:i%3?col:0xffd060,r0:.5,r1:1.4,life:.45+Math.random()*.2,op:.9,v:[Math.sin(a)*v,.3,Math.cos(a)*v],drag:2.5,fin:.05})}
  sgSmoke(gY(kqsV(p.x+d.x*R*.8,p.z+d.z*R*.8),.6),6+(lvl|0)*4,R*.4,0x2a2220,1.3,.4)})}

// ---------------- co-op: partners replay these like the other effect functions (2170) ----------------
(function(){if(typeof MPV=='undefined'||!MPV.FX)return;
  ['sgTrail','sgCrack','sgCracks','sgRays','sgFall','sgWaves','sgShieldFx','sgShell','sgHalo','sgMark','sgGuillotine','sgWire','sgChain','sgVortex','sgWedge',
   'sgSkull','sgExec','sgBash','sgSmite','sgEvisc','sgGarrote','sgRoar','sgBloodFx','sgQuake','sgCrater','sgWard','sgPray','sgPlant','sgSeal','sgPenance','sgSmokeBomb','sgVanish',
   'sgVenom','sgDance','sgFocus','sgTalons','sgMarkFx','sgSnipe','sgShieldHit','sgFrost','sgToxic','sgCleave','sgPhantom','sgBreathFx'].forEach(n=>{
    const f=window[n];if(typeof f!='function'||MPV_FX[n]!=null)return;MPV_FX[n]=MPV.FX.length;MPV.FX.push(n);
    window[n]=function(){
      if(!MPV.cap||MPV.dep||MPV.rep||!mpvLive())return f.apply(this,arguments);
      let a=null;try{a=Array.prototype.map.call(arguments,x=>mpvSer(x,0))}catch(_){a=null}
      if(a)mpvPush(['V',MPV_FX[n],mpvR(pl.position.x),mpvR(pl.position.y),mpvR(pl.position.z),mpvR(pl.rotation.y),a]);
      MPV.dep++;try{return f.apply(this,arguments)}finally{MPV.dep--}}})})();

// ---------------- the old kinds (0130 cast_base): which ability draws its own signature ----------------
var SG_OLD={
  'Cleave':(sk,P,d,R,l)=>{sgCleave(P,sgYaw(d),sk.col,R,l)},
  'Holy Smite':(sk,P,d,R,l)=>{sgSmite(P,sk.col,R,l)},
  'Frost Nova':(sk,P,d,R,l)=>{sgFrost(P,sk.col,R,l)},
  'Earthshatter':(sk,P,d,R,l)=>{sgQuake(P,sk.col,R,l)},
  'Smoke Bomb':(sk,P,d,R,l)=>{sgSmokeBomb(P,sk.col,R,l)},
  'War Cry':(sk,P,d,R,l)=>{sgRoar(P,sk.col,4.5,0,l)},
  'Poison Blades':(sk,P,d,R,l)=>{sgVenom(P,sk.col,l)},
  'Shadow Dance':(sk,P,d,R,l)=>{sgDance(P,sk.col,l)},
  'Aegis':(sk,P,d,R,l)=>{sgWard(P,sk.col,1,l);const y=pl.rotation.y;[0,2.094,4.189].forEach((a,j)=>sgShieldFx(gY(kqsV(P.x+Math.sin(y+a)*.6,P.z+Math.cos(y+a)*.6),1.1),y+a,sk.col,1.1+l*.3,520+l*200,.8))},
  "Hunter’s Focus":(sk,P,d,R,l)=>{sgFocus(P,sk.col,l)},
  'Divine Barrier':(sk,P,d,R,l)=>{sgWard(P,sk.col,1,l)},
  'Iron Skin':(sk,P,d,R,l)=>{sgWard(P,sk.col,0,l)},
  'Mana Shield':(sk,P,d,R,l)=>{sgWard(P,sk.col,2,l)},
  'Lay on Hands':(sk,P,d,R,l)=>{sgPray(P,sk.col,l)},
  'Whirlwind':(sk,P,d,R,l)=>{sgVortex(P,sk.col,R,(sk.dur||2.4)*1000,l)},
  'Consecration':(sk,P,d,R,l)=>{sgPlant(P,sk.col,R,l);return false}};
function sgOld(sk,P,d,Rr){const f=sk&&SG_OLD[sk.n];if(!f)return false;try{return f(sk,P.clone(),d.clone(),Rr||sk.r||2,sgEvo())!==false}catch(err){console.warn('sg '+sk.n,err);return false}}
// Leap Slam's landing (0130 'leap' case)
function sgLeapLand(sk,P,R){try{if(sk&&sk.n=='Leap Slam')sgCrater(P.clone(),sk.col,R,sgEvo())}catch(_){}}

// ---------------- poses ----------------
var SGP={};
(function(){if(typeof ATK=='undefined'||typeof atkTrack!='function')return;const E=atkEyes,R=ATK_REST,T=(k,n)=>atkTrack(k,n);
  // Skull Splitter: both hands haul the weapon up behind the head on tiptoe, then crash it down into a deep crouch (contact .32)
  SGP.sgChop=[T([[0,R],[.16,E({sx:-.42,hx:-.25,ax:-3.25,az:.12,ex:-1.25,lx:-3.15,lz:-.12,le:-1.2,dy:.04,lk:.05,rk:.15,lh:.05,rh:.1}),'out'],[.24,E({sx:-.46,hx:-.28,ax:-3.35,az:.12,ex:-1.4,lx:-3.25,lz:-.12,le:-1.35,dy:.05}),'io'],
    [.32,E({sx:.78,hx:.3,ax:-.38,az:.05,ex:-.02,rw:.4,lx:-.42,lz:-.05,le:-.05,lk:1.05,rk:.75,lh:-.6,rh:.45,dy:-.24}),'in'],[.5,E({sx:.84,hx:.32,ax:-.3,ex:-.05,rw:.45,lx:-.35,le:-.08,lk:1.1,rk:.8,lh:-.62,rh:.48,dy:-.26}),'out'],[.74,E({sx:.6,hx:.2,ax:-.4,lx:-.45,lk:.8,rk:.6,lh:-.45,rh:.35,dy:-.18}),'io'],[1,R,'io']]),560];
  // Execute: the weapon raised high to one side, a beat of stillness, then a fast diagonal chop across the body (contact .3)
  SGP.sgGuillo=[T([[0,R],[.14,E({sy:.7,py:.3,sx:-.2,hx:-.15,ax:-3.0,az:.55,ex:-.9,lx:-2.75,lz:.15,le:-1.1,dy:.02,rk:.2}),'out'],[.24,E({sy:.78,py:.34,sx:-.24,hx:-.18,ax:-3.1,az:.6,ex:-.95,lx:-2.85,lz:.15,le:-1.15,dy:.03}),'io'],
    [.3,E({sy:-.75,py:-.35,sx:.55,hx:.15,ax:-.75,az:-.6,ex:-.05,rw:.6,lx:-.8,lz:.3,le:-.3,lk:.75,rk:.3,lh:-.5,rh:.35,dy:-.17}),'in'],[.55,E({sy:-.85,py:-.38,sx:.6,ax:-.6,az:-.75,ex:-.1,rw:.6,lx:-.7,lz:.4,le:-.3,lk:.8,rk:.35,lh:-.5,rh:.35,dy:-.18}),'out'],[1,R,'io']]),520];
  // Shield Bash: shield tucked, weight back, then the shoulder and shield drive forward with a step (contact .28)
  SGP.sgBash=[T([[0,R],[.16,E({sy:-.55,py:-.25,sx:-.08,lx:-.95,lz:.35,le:-1.5,ax:-.5,az:-.2,ex:-1.0,lk:.25,rk:.35,dy:-.06}),'out'],
    [.28,E({sy:.7,py:.35,sx:.32,hx:.05,lx:-1.6,lz:.05,le:-.05,lw:.2,ax:-.3,az:.35,ex:-.9,lh:-.55,rh:.4,lk:.45,rk:.15,dy:-.09}),'in'],[.6,E({sy:.72,py:.36,sx:.34,lx:-1.55,le:-.08,ax:-.35,az:.35,ex:-.9,lh:-.55,rh:.4,lk:.45,dy:-.09}),'out'],[1,R,'io']]),440];
  // Holy Smite: the weapon thrust up to the sky on tiptoe, then hammered down to the earth (contact .34)
  SGP.sgSmite=[T([[0,R],[.18,E({sx:-.35,hx:-.45,ax:-3.15,az:.08,ex:-.08,lx:-3.05,lz:-.08,le:-.1,dy:.05,lk:0,rk:0}),'out'],[.26,E({sx:-.38,hx:-.5,ax:-3.2,ex:-.1,lx:-3.1,le:-.12,dy:.06}),'io'],
    [.34,E({sx:.68,hx:.15,ax:-.5,ex:-.05,lx:-.5,le:-.08,lk:.95,rk:.65,lh:-.55,rh:.4,dy:-.21}),'in'],[.66,E({sx:.65,hx:.12,ax:-.48,lx:-.48,lk:.9,rk:.62,lh:-.52,rh:.38,dy:-.2}),'out'],[1,R,'io']]),600];
  // Eviscerate: a coiled crouch with both daggers low at the hips, then they rip upward and apart (contact .26)
  SGP.sgRip=[T([[0,R],[.16,E({sx:.45,hx:-.2,ax:.25,az:.15,ex:-1.5,lx:.25,lz:-.15,le:-1.5,lk:.9,rk:.8,lh:-.45,rh:.3,dy:-.2,rw:.5,lw:.5}),'out'],
    [.26,E({sx:-.15,hx:-.1,ax:-2.4,az:.75,ex:-.15,lx:-2.4,lz:-.75,le:-.15,lk:.3,rk:.25,lh:-.3,rh:.25,dy:-.02,rw:.9,lw:.9}),'in'],[.55,E({sx:-.12,ax:-2.3,az:.85,ex:-.2,lx:-2.3,lz:-.85,le:-.2,dy:-.02,rw:.9,lw:.9}),'out'],[1,R,'io']]),400];
  // Garrote: both hands snap together round the throat, then wrench apart and back, leaning away (contact .3)
  SGP.sgGarrote=[T([[0,R],[.18,E({sx:.25,ax:-1.65,az:-.35,ex:-.5,lx:-1.65,lz:.35,le:-.5,lh:-.35,rh:.3,lk:.4,dy:-.06}),'out'],
    [.3,E({sx:-.25,hx:.1,ax:-1.35,az:.55,ex:-1.95,lx:-1.35,lz:-.55,le:-1.95,lk:.55,rk:.25,lh:-.2,rh:.35,dy:-.1,rw:.4,lw:.4}),'in'],[.75,E({sx:-.28,hx:.12,ax:-1.3,az:.62,ex:-2.0,lx:-1.3,lz:-.62,le:-2.0,lk:.55,rk:.25,lh:-.2,rh:.35,dy:-.1}),'lin'],[1,R,'io']]),600];
  // Penance: kneeling in prayer, hands together at the chest, head bowed
  SGP.sgKneel=[T([[0,R],[.3,E({sx:.18,hx:.45,ax:-1.15,az:-.55,ex:-1.75,lx:-1.15,lz:.55,le:-1.75,lh:-1.0,lk:1.2,rh:.55,rk:1.6,dy:-.42}),'out'],[.85,E({sx:.2,hx:.5,ax:-1.2,az:-.55,ex:-1.8,lx:-1.2,lz:.55,le:-1.8,lh:-1.0,lk:1.2,rh:.55,rk:1.6,dy:-.43}),'lin'],[1,E({sx:.18,hx:.45,ax:-1.15,az:-.55,ex:-1.75,lx:-1.15,lz:.55,le:-1.75,lh:-.95,lk:1.15,rh:.5,rk:1.5,dy:-.4}),'io']],true),560];
  // Avenger's Shield: the shield arm whips round across the chest, then flings out sidearm (release .3)
  SGP.sgDisc=[T([[0,R],[.18,E({sy:-.75,py:-.3,sx:.1,lx:-1.45,lz:.95,le:-1.45,lw:.4,ax:-.6,az:.3,ex:-1.0,rk:.3,dy:-.05}),'out'],
    [.3,E({sy:.7,py:.3,sx:.18,lx:-1.5,lz:-1.15,le:-.05,lw:-.3,ax:-.4,az:.4,ex:-.9,lh:-.4,rh:.3,lk:.4,dy:-.07}),'in'],[.56,E({sy:.8,py:.34,sx:.2,lx:-1.3,lz:-1.25,le:-.1,ax:-.4,az:.4,ex:-.9,lh:-.4,rh:.3,lk:.4,dy:-.07}),'out'],[1,R,'io']]),460];
  // Chain Hook: a whirl overhead, a hurl forward, then a hard yank back with the weight on the back foot
  const wh=a=>E({sy:.25,sx:-.1,ax:-2.7+Math.cos(a)*.3,az:.4+Math.sin(a)*.45,ex:-.45,lx:-1.0,lz:.1,le:-.6,rk:.2});
  SGP.sgHook=[T([[0,R],[.06,wh(0)],[.11,wh(3.1),'lin'],[.16,wh(6.28),'lin'],[.22,E({sy:-.5,py:-.3,sx:.35,ax:-1.45,az:-.05,ex:-.05,rw:.4,lx:-.6,le:-.8,lh:-.45,rh:.35,lk:.45,dy:-.07}),'in'],
    [.38,E({sy:.55,py:.25,sx:-.32,hx:-.05,ax:-1.0,az:.2,ex:-1.9,lx:-1.1,lz:.2,le:-1.7,lh:.2,rh:-.15,lk:.15,rk:.6,dy:-.08}),'out'],[.7,E({sy:.5,py:.22,sx:-.28,ax:-1.0,ex:-1.85,lx:-1.1,le:-1.7,lh:.2,rh:-.15,rk:.6,dy:-.08}),'io'],[1,R,'io']]),780];
  // Bull Rush: head down, shoulder lowered like a battering ram, arms tucked
  SGP.sgTackle=[T([[0,R],[.14,E({sx:.62,sy:.55,py:.25,hx:-.45,ax:-.35,az:.25,ex:-1.7,lx:-.75,lz:-.55,le:-1.7,lh:-.6,rh:.5,lk:.65,rk:.35,dy:-.12}),'out'],[.85,E({sx:.6,sy:.5,py:.22,hx:-.42,ax:-.35,az:.25,ex:-1.7,lx:-.75,lz:-.55,le:-1.7,lh:-.55,rh:.45,lk:.6,rk:.35,dy:-.11}),'lin'],[1,R,'io']]),560];
  // Crusader's Charge: shield thrust ahead, the weapon held high behind like a lance about to fall
  SGP.sgCrusade=[T([[0,R],[.14,E({sx:.4,hx:-.25,lx:-1.55,lz:.1,le:-.2,ax:-2.75,az:.3,ex:-.7,rw:-.3,lh:-.5,rh:.4,lk:.55,rk:.3,dy:-.09}),'out'],[.85,E({sx:.38,hx:-.22,lx:-1.5,le:-.2,ax:-2.7,az:.3,ex:-.7,lh:-.45,rh:.4,lk:.5,rk:.3,dy:-.08}),'lin'],[1,R,'io']]),620];
  // War Cry: fists gathered in a crouch, then flung wide and back, chest out, head thrown back
  SGP.sgRoar=[T([[0,R],[.2,E({sx:.4,hx:.15,ax:-.45,az:-.3,ex:-2.1,lx:-.45,lz:.3,le:-2.1,lk:.5,rk:.5,dy:-.12}),'out'],[.36,E({sx:-.38,hx:-.6,ax:-.5,az:1.35,ex:-.45,lx:-.5,lz:-1.35,le:-.45,lk:.15,rk:.15,dy:.01}),'in'],
    [.8,E({sx:-.35,hx:-.55,ax:-.5,az:1.3,ex:-.5,lx:-.5,lz:-1.3,le:-.5,dy:.01}),'out'],[1,R,'io']]),660];
  // Intimidating Shout: a forward-leaning bellow at the enemy, arms swept back and down
  SGP.sgBellow=[T([[0,R],[.18,E({sx:-.25,hx:-.3,ax:-.3,az:.2,ex:-.9,lx:-.3,lz:-.2,le:-.9,dy:.02}),'out'],[.32,E({sx:.5,hx:-.45,ax:.45,az:.55,ex:-.25,lx:.45,lz:-.55,le:-.25,lh:-.5,rh:.35,lk:.55,rk:.2,dy:-.1}),'in'],
    [.78,E({sx:.48,hx:-.42,ax:.4,az:.5,ex:-.3,lx:.4,lz:-.5,le:-.3,lh:-.45,rh:.35,lk:.5,rk:.2,dy:-.1}),'out'],[1,R,'io']]),620];
  // Bloodrage: two hard beats of the fists on the chest, then a roar to the sky
  const bt=(s)=>E({sx:.15,hx:.1,ax:-.95,az:-.45+s*.2,ex:-2.3+s*.5,lx:-.95,lz:.45-s*.2,le:-2.3+(1-s)*.5,dy:-.04});
  SGP.sgBeat=[T([[0,R],[.12,bt(1)],[.22,bt(0),'in'],[.32,bt(1),'out'],[.42,bt(0),'in'],[.56,E({sx:-.4,hx:-.65,ax:-2.6,az:.6,ex:-.6,lx:-2.6,lz:-.6,le:-.6,dy:.02}),'out'],[.85,E({sx:-.38,hx:-.6,ax:-2.55,az:.6,ex:-.65,lx:-2.55,lz:-.6,le:-.65}),'io'],[1,R,'io']]),760];
  // Iron Skin: forearms crossed before the face, a low braced stance
  SGP.sgBrace=[T([[0,R],[.22,E({sx:.22,hx:.25,ax:-1.45,az:-.95,ex:-1.7,lx:-1.45,lz:.95,le:-1.7,lk:.75,rk:.75,lh:-.35,rh:.3,dy:-.2}),'out'],[.66,E({sx:.24,hx:.28,ax:-1.5,az:-1.0,ex:-1.75,lx:-1.5,lz:1.0,le:-1.75,lk:.78,rk:.78,lh:-.35,rh:.3,dy:-.21}),'lin'],
    [.8,E({sx:-.1,hx:-.1,ax:-.6,az:.9,ex:-.9,lx:-.6,lz:-.9,le:-.9,lk:.35,rk:.35,dy:-.08}),'out'],[1,R,'io']]),700];
  // Unbreakable: a wide stance, fists clenched low at the sides, head down: the body turning to stone
  SGP.sgStone=[T([[0,R],[.25,E({sx:.12,hx:.35,ax:.15,az:.5,ex:-.5,lx:.15,lz:-.5,le:-.5,lh:-.25,rh:-.25,lk:.6,rk:.6,dy:-.18,rw:.6,lw:.6}),'out'],[.8,E({sx:.14,hx:.38,ax:.15,az:.55,ex:-.55,lx:.15,lz:-.55,le:-.55,lh:-.25,rh:-.25,lk:.62,rk:.62,dy:-.19}),'lin'],[1,R,'io']]),720];
  // Aegis: the shield raised high in front, the weapon drawn back, a guard stance
  SGP.sgShieldUp=[T([[0,R],[.24,E({sx:.12,hx:-.15,lx:-2.2,lz:.15,le:-.6,ax:-.4,az:.4,ex:-1.4,lh:-.4,rh:.35,lk:.5,rk:.25,dy:-.1}),'out'],[.75,E({sx:.14,hx:-.15,lx:-2.25,lz:.15,le:-.6,ax:-.4,az:.4,ex:-1.4,lh:-.4,rh:.35,lk:.5,rk:.25,dy:-.1}),'lin'],[1,R,'io']]),680];
  // Divine Barrier / Mana Shield / Blessed Hammers: both palms pushed up and out, opening the ward
  SGP.sgWard=[T([[0,R],[.2,E({sx:.1,ax:-1.0,az:-.2,ex:-1.9,lx:-1.0,lz:.2,le:-1.9,lk:.3,rk:.3,dy:-.06}),'out'],[.38,E({sx:-.18,hx:-.3,ax:-2.3,az:.75,ex:-.2,rw:-.6,lx:-2.3,lz:-.75,le:-.2,lw:-.6,dy:.02}),'in'],
    [.75,E({sx:-.15,hx:-.28,ax:-2.25,az:.8,ex:-.25,lx:-2.25,lz:-.8,le:-.25}),'out'],[1,R,'io']]),640];
  // Lay on Hands / Divine Intervention: hands together in prayer, head bowed, then opened up to the sky
  SGP.sgPray=[T([[0,R],[.22,E({sx:.15,hx:.4,ax:-1.2,az:-.55,ex:-1.8,lx:-1.2,lz:.55,le:-1.8,lk:.45,rk:.45,dy:-.1}),'out'],[.5,E({sx:.18,hx:.45,ax:-1.25,az:-.55,ex:-1.85,lx:-1.25,lz:.55,le:-1.85,lk:.5,rk:.5,dy:-.11}),'lin'],
    [.68,E({sx:-.25,hx:-.5,ax:-2.5,az:.85,ex:-.2,lx:-2.5,lz:-.85,le:-.2,dy:.02}),'in'],[.85,E({sx:-.22,hx:-.45,ax:-2.45,az:.85,ex:-.25,lx:-2.45,lz:-.85,le:-.25}),'out'],[1,R,'io']]),820];
  // Consecration / War Banner / Beacon: the weapon (or pole) driven point-first into the ground, one knee down
  SGP.sgPlant=[T([[0,R],[.18,E({sx:-.15,hx:-.15,ax:-2.6,ex:-.6,lx:-2.5,le:-.6,dy:.02}),'out'],[.34,E({sx:.55,hx:.2,ax:-.75,ex:-.1,lx:-.75,le:-.15,rw:-1.0,lw:-1.0,lh:-.9,lk:1.1,rh:.5,rk:1.3,dy:-.36}),'in'],
    [.75,E({sx:.52,hx:.15,ax:-.75,ex:-.12,lx:-.75,le:-.15,rw:-1.0,lw:-1.0,lh:-.9,lk:1.1,rh:.5,rk:1.3,dy:-.36}),'lin'],[1,R,'io']]),700];
  // Seal of Light: the blade raised upright before the face, the free hand on the heart
  SGP.sgSeal=[T([[0,R],[.26,E({sx:-.08,hx:-.12,ax:-1.95,az:-.35,ex:-1.35,rw:.9,lx:-.9,lz:.6,le:-1.9,dy:.01}),'out'],[.8,E({sx:-.1,hx:-.15,ax:-2.0,az:-.35,ex:-1.4,rw:.9,lx:-.9,lz:.6,le:-1.9,dy:.01}),'lin'],[1,R,'io']]),720];
  // Poison Blades: the daggers crossed before the chest, then drawn apart along each other's edges
  SGP.sgCoat=[T([[0,R],[.22,E({sx:.12,ax:-1.45,az:-.75,ex:-1.2,lx:-1.45,lz:.75,le:-1.2,rw:.5,lw:.5,dy:-.05}),'out'],[.48,E({sx:.08,ax:-1.35,az:.95,ex:-.4,lx:-1.35,lz:-.95,le:-.4,rw:.5,lw:.5,dy:-.05}),'io'],[.75,E({sx:.06,ax:-1.3,az:.95,ex:-.45,lx:-1.3,lz:-.95,le:-.45}),'out'],[1,R,'io']]),600];
  // Shadow Dance: a crouching pirouette with the daggers flourished out
  SGP.sgDance=k=>{const s=ATK.spin(k);return Object.assign({},s,{ax:-2.0*(s.ax?1:0)+(s.ax||0)*.2,lx:-2.0*(s.lx?1:0)+(s.lx||0)*.2,dy:(s.dy||0)-.08,lk:(s.lk||0)+.25,rk:(s.rk||0)+.25})};SGP.sgDance=[SGP.sgDance,480];
  // Vanish: the cloak arm swept across the face, crouched low
  SGP.sgCloak=[T([[0,R],[.2,E({sx:.35,hx:.3,ax:-1.6,az:-1.1,ex:-1.4,lx:-.4,lz:.3,le:-1.2,lk:.8,rk:.7,dy:-.2}),'out'],[.7,E({sx:.4,hx:.35,ax:-1.65,az:-1.15,ex:-1.45,lx:-.4,lz:.3,le:-1.2,lk:.85,rk:.75,dy:-.22}),'lin'],[1,R,'io']]),520];
  // Smoke Bomb: a snap crouch, the bomb dashed against the ground at the feet
  SGP.sgDrop=[T([[0,R],[.14,E({sx:-.1,ax:-2.4,ex:-1.2,rw:-.5,lx:-.6,le:-1.0}),'out'],[.26,E({sx:.6,hx:.1,ax:-.25,ex:-.1,rw:.6,lx:-.5,le:-1.1,lk:.9,rk:.8,lh:-.4,rh:.3,dy:-.22}),'in'],[.6,E({sx:.55,ax:-.3,ex:-.2,lx:-.5,le:-1.1,lk:.85,rk:.75,dy:-.2}),'out'],[1,R,'io']]),480];
  // Envenom: a fist drawn in and clenched, then wrenched open (the detonation)
  SGP.sgClench=[T([[0,R],[.2,E({sx:.15,ax:-1.6,az:-.2,ex:-2.1,rw:.8,lx:-.6,le:-1.2,dy:-.04}),'out'],[.36,E({sx:-.12,hx:-.15,ax:-1.7,az:.5,ex:-.15,rw:-.7,lx:-.5,lz:-.4,le:-.6,dy:.01}),'in'],[.75,E({sx:-.1,ax:-1.65,az:.55,ex:-.2,rw:-.7,lx:-.5,lz:-.4,le:-.6}),'out'],[1,R,'io']]),560];
  // Hawk Dive: the arm thrown up to the sky to loose the hawk, then swept down to point at the prey
  SGP.sgHawk=[T([[0,R],[.2,E({sx:-.3,hx:-.5,ax:-3.05,az:.2,ex:-.1,rw:-.4,lx:-.5,le:-.6,dy:.02}),'out'],[.5,E({sy:-.25,py:-.15,sx:.18,hx:-.05,ax:-1.6,az:-.05,ex:-.02,rw:.3,lx:-.4,le:-.9,lh:-.25,rh:.2,lk:.3,dy:-.04}),'in'],[.78,E({sy:-.25,sx:.16,ax:-1.55,ex:-.05,lx:-.4,le:-.9}),'out'],[1,R,'io']]),620];
  // Entangling Roots: a crouch and a palm slapped flat on the earth
  SGP.sgGround=[T([[0,R],[.2,E({sx:-.1,ax:-2.2,ex:-1.0,lx:-.5,le:-.8,dy:.01}),'out'],[.36,E({sx:.95,hx:-.35,ax:-.85,az:.1,ex:-.05,rw:-1.0,lx:-.4,lz:.3,le:-1.0,lk:1.25,rk:1.0,lh:-.7,rh:.4,dy:-.36}),'in'],[.75,E({sx:.92,hx:-.33,ax:-.85,ex:-.08,rw:-1.0,lx:-.4,le:-1.0,lk:1.2,rk:1.0,lh:-.7,rh:.4,dy:-.35}),'lin'],[1,R,'io']]),640];
  // Dragon's Breath: hands cupped at the mouth, then the breath pushed out with a lunge
  SGP.sgBreath=[T([[0,R],[.18,E({sx:-.22,hx:-.2,ax:-1.25,az:-.35,ex:-2.4,lx:-1.25,lz:.35,le:-2.4,dy:.01}),'out'],[.3,E({sx:.42,hx:-.2,ax:-1.6,az:.15,ex:-.05,lx:-1.6,lz:-.15,le:-.05,rw:-.4,lw:-.4,lh:-.55,rh:.4,lk:.55,dy:-.1}),'in'],
    [.75,E({sx:.45,hx:-.22,ax:-1.6,az:.18,ex:-.08,lx:-1.6,lz:-.18,le:-.08,lh:-.55,rh:.4,lk:.55,dy:-.1}),'lin'],[1,R,'io']]),640];
  // Hunter's Focus: two fingers to the temple, eyes narrowed
  SGP.sgFocus=[T([[0,R],[.25,E({sx:.05,hx:.1,ax:-.9,az:.75,ex:-2.4,rw:.3,lx:-.3,le:-.4}),'out'],[.75,E({sx:.02,hx:-.05,ax:-.95,az:.8,ex:-2.45,lx:-.3,le:-.4}),'lin'],[1,R,'io']]),640];
  // Earthshatter: the knee raised high, then a stamp that drives both arms down
  SGP.sgQuake=[T([[0,R],[.2,E({sx:-.2,hx:-.15,ax:-2.4,az:.6,ex:-.8,lx:-2.4,lz:-.6,le:-.8,rh:-1.25,rk:1.5,lh:.05,lk:.1,dy:.03}),'out'],[.32,E({sx:.6,hx:.15,ax:-.3,az:.4,ex:-.1,lx:-.3,lz:-.4,le:-.1,rh:-.15,rk:.4,lh:-.3,lk:.8,dy:-.22}),'in'],
    [.7,E({sx:.58,hx:.12,ax:-.3,az:.45,ex:-.12,lx:-.3,lz:-.45,le:-.12,rh:-.15,rk:.4,lh:-.3,lk:.8,dy:-.21}),'out'],[1,R,'io']]),620];
  // Cleave: a wound-up, full-body sweep from far right to far left (wider and lower than the basic attack)
  SGP.sgSweep=[T([[0,R],[.16,E({sy:-1.2,py:-.5,sx:.05,ax:-1.45,az:1.35,ex:-.35,lx:-1.3,lz:1.0,le:-.6,lh:.1,rh:-.2,lk:.3,rk:.45,dy:-.08}),'out'],
    [.32,E({sy:.25,py:.1,sx:.3,ax:-1.45,az:-.1,ex:-.05,rw:.9,lx:-1.4,lz:.05,le:-.3,lh:-.4,rh:.3,lk:.6,rk:.2,dy:-.15}),'in'],[.48,E({sy:1.15,py:.5,sx:.28,ax:-1.2,az:-1.05,ex:-.2,lx:-1.1,lz:-.9,le:-.4,lh:-.4,rh:.3,lk:.6,rk:.2,dy:-.15}),'out'],[1,R,'io']]),520];
})();
// which pose each ability plays (the ones not listed keep theirs: summons point, zones raise, dashes dash…)
var SG_POSE={'Skull Splitter':'sgChop',Execute:'sgGuillo','Shield Bash':'sgBash','Holy Smite':'sgSmite',Eviscerate:'sgRip',Garrote:'sgGarrote',Penance:'sgKneel',"Avenger's Shield":'sgDisc',
  'Chain Hook':'sgHook','Bull Rush':'sgTackle',"Crusader's Charge":'sgCrusade','War Cry':'sgRoar','Intimidating Shout':'sgBellow',Bloodrage:'sgBeat','Iron Skin':'sgBrace',Unbreakable:'sgStone',
  Aegis:'sgShieldUp','Divine Barrier':'sgWard','Mana Shield':'sgWard','Blessed Hammers':'sgWard','Lay on Hands':'sgPray','Divine Intervention':'sgPray',Consecration:'sgPlant','War Banner':'sgPlant',
  'Beacon of Light':'sgPlant','Seal of Light':'sgSeal','Poison Blades':'sgCoat','Shadow Dance':'sgDance',Vanish:'sgCloak','Smoke Bomb':'sgDrop',Envenom:'sgClench','Hawk Dive':'sgHawk',
  'Entangling Roots':'sgGround',"Dragon's Breath":'sgBreath',"Hunter’s Focus":'sgFocus',Earthshatter:'sgQuake',Cleave:'sgSweep','Seismic Rupture':'sgQuake','Death Mark':'point',
  Multishot:'bow','Ballista Bolt':'bow','Shuriken Volley':'throw','Snare Trap':'sgDrop'};
var SG_LEGS={sgChop:1,sgGuillo:1,sgBash:1,sgSmite:1,sgRip:1,sgKneel:1,sgTackle:1,sgCrusade:1,sgBrace:1,sgStone:1,sgPlant:1,sgDrop:1,sgGround:1,sgQuake:1,sgSweep:1,sgBreath:1,sgPray:1};
(function(){const A=[SKB,typeof SKX!='undefined'?SKX:{},KQN];A.forEach(T=>Object.keys(T).forEach(c=>(T[c]||[]).forEach(s=>{const p=SG_POSE[s.n];if(p)s.pose=p})))})();
{const f=kqsPoseT;kqsPoseT=function(p){const m=SGP[p];if(m&&m[0])return m;return f.apply(this,arguments)}}
// the legs follow these poses fully (kneels, crouches, stamps), even while running
{const f=castAnim;castAnim=function(){const r=f.apply(this,arguments);try{const sk=typeof ATK_SK!='undefined'?ATK_SK:null;if(sk&&SG_LEGS[sk.pose]&&HA.cur)HA.cur.legFull=1}catch(_){}return r}}
{const f=kqsPose;kqsPose=function(p,ms){const r=f.apply(this,arguments);try{if(SG_LEGS[p]&&HA.cur)HA.cur.legFull=1}catch(_){}return r}}
// buffs, shields and heals never went through castAnim: play their own pose once the cast went off
{const f=cast_base;cast_base=function(i){let sk=null;try{sk=heroSkills()[i]}catch(_){}const cd0=sk&&hero.cd?(hero.cd['s'+i]||0):0;const r=f.apply(this,arguments);
  try{if(sk&&(sk.k=='buff'||sk.k=='heal'||sk.k=='barrier')&&sk.pose&&(hero.cd['s'+i]||0)>cd0)kqsPose(sk.pose)}catch(_){}return r}}

// ---------------- evolved casts: no generic layer any more ----------------
// no casting sigil / light column / orbit on every evolved cast, no evolved pose swap (each keeps its own move)
ev137CastFx=function(){};
EV137.poseMap={};EV137.kindPose={};
ev137Fired=function(e,x){const E=ev137Def(e);if(e.k!='x'&&E.post)E.post(x);try{ev137Snd(e.k=='buff'||e.k=='heal'||e.k=='barrier'?'buff':'cast')}catch(_){}};
// no ground glyph under every evolved area hit (the area wrapper in 2700 adds one unless EV137.busy)
{const f=area;area=function(){if(typeof EV137!='undefined'&&EV137.cur){EV137.busy++;try{return f.apply(this,arguments)}finally{EV137.busy--}}return f.apply(this,arguments)}}
// the v186 scorch under evolved shockwaves: a glow and a dark burn, no glyph
ev186Scorch=function(p,col,R,ms){if(!p)return;const g=evxMesh(evxDisk(),evxAdd(col,0,evxTex('soft')));const b=evxGY(p,.06);g.position.copy(b);g.scale.setScalar(R);scene.add(g);
  tw(ms,k=>{const f=k<.1?k/.1:Math.pow(1-(k-.1)/.9,1.6);g.material.opacity=.4*f},()=>evxRm(g))};
// the shared evolved slam (several evolutions): a shockwave, a crater of cracks and debris (no crystal spikes)
evSlam=function(p,col,R){ev137Shock(p,col,R,520);sgCrater(p,col,R,1);ev137Flare(evxGY(p,.8),col,1.2+R*.25,300)};
// the rune circle stays only for the evolve ceremony itself
{const S=ev137Sigil;ev137Sigil=function(){};const f=ev137Ceremony;ev137Ceremony=function(){const o=ev137Sigil;ev137Sigil=S;try{return f.apply(this,arguments)}finally{ev137Sigil=o}}}
