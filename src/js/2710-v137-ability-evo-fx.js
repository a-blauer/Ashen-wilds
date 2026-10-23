// ================= v137 evolved abilities: the effect library =================
// Every evolved cast draws with these (on top of what the ability itself draws). All of them are visual only (no damage),
// take plain arguments (positions, colours, numbers) so co-op partners can replay them (they are added to MPV.FX at the
// end of this file), run on tweens (tw: game time, and the ability preview's own tween list), and free every material and
// geometry they make when they end. Shared shapes and textures live in EVX and are never disposed.
//   ev137Sigil(p,col,R,ms,kind)   a glowing rune circle draped on the ground, turning (kind 0 big casting circle, 1 quick glyph)
//   ev137Column(p,col,h,r,ms)     a pillar of light shooting up, with a white core and rising motes
//   ev137Shock(p,col,R,ms)        a shockwave: a bright torus racing out, a low wall of light and flying sparks
//   ev137Flare(p,col,s,ms)        a star-shaped flash (glow + 4-point star)
//   ev137Lance(a,b,col,w,ms)      a beam of light from a to b (white core in a coloured sheath) with sparks along it
//   ev137Fall(p,col,kind,ms)      a spectral weapon (sword, hammer, spear, axe, comet, star) falling from the sky onto p
//   ev137Crescent(p,d,col,L,ms)   a crescent blade of force flying from p along d for L tiles
//   ev137Shards(p,col,n,R,h,ms)   crystal spikes bursting up in a ring
//   ev137Orbit(p,col,r,ms)        sparks spiralling up around a point (buffs)
//   ev137Rift(a,b,col,ms)         a glowing tear in the ground from a to b
//   ev137Impact(p,col,s)          a projectile's impact (shock + flare + sparks)
// Projectile models (ev137Proj) are shared groups put on the shots of evolved casts; ev137Trail leaves their wake.
var EVX={g:{},t:{},m:{},lim:{}};
function evxG(k,mk){return EVX.g[k]||(EVX.g[k]=mk())}
function evxAdd(col,op,map){return new THREE.MeshBasicMaterial({color:col,map:map||null,transparent:true,opacity:op==null?1:op,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})}
function evxMesh(geo,mat){const m=new THREE.Mesh(geo,mat);m.userData.lpsSkip=1;m.frustumCulled=false;m.renderOrder=33;return m}
// remove an effect object: dispose its own materials (and geometries flagged evxOwn); shared ones stay
function evxRm(o){if(!o)return;if(o.parent)o.parent.remove(o);o.traverse(q=>{if(q.material&&!q.material.userData.evxS)(Array.isArray(q.material)?q.material:[q.material]).forEach(m=>m.dispose());
  if(q.geometry&&q.geometry.userData.evxOwn)q.geometry.dispose()})}
function evxCol(c){return typeof c=='number'?c:(c&&c.getHex?c.getHex():0xffffff)}
function evxLerp(a,b,t){return new THREE.Color(evxCol(a)).lerp(new THREE.Color(evxCol(b)),t).getHex()}
function evxGY(p,y){return new THREE.Vector3(p.x,GH(p.x,p.z)+(y||0),p.z)}
function evxRand(a,b){return a+Math.random()*(b-a)}
// a puff from the shared fxA pool (does nothing if fxA is missing)
function evxPuff(p,o){try{if(typeof fxaPuff=='function')return fxaPuff(p,o)}catch(_){}return null}
// ---------------- textures (drawn once, white, tinted by the material colour) ----------------
function evxTex(k){if(EVX.t[k])return EVX.t[k];const S=256,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),C=S/2;g.translate(C,C);g.strokeStyle='#fff';g.fillStyle='#fff';g.lineCap='round';
  const R=(n=>{let s=n;return ()=>{s=(s*16807)%2147483647;return s/2147483647}})(k.length*977+13);
  const circ=(r,w)=>{g.lineWidth=w;g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.stroke()};
  const rune=(x,y,s,a)=>{g.save();g.translate(x,y);g.rotate(a);g.lineWidth=s*.16;g.beginPath();const n=2+Math.floor(R()*3);for(let i=0;i<n;i++){const x0=(R()-.5)*s,y0=(R()-.5)*s,x1=(R()-.5)*s,y1=(R()-.5)*s;g.moveTo(x0,y0);if(R()<.4)g.quadraticCurveTo(0,0,x1,y1);else g.lineTo(x1,y1)}g.stroke();g.restore()};
  if(k=='sigil'){g.shadowColor='#fff';g.shadowBlur=6;circ(122,5);circ(112,2);circ(78,4);circ(70,1.5);circ(30,3);
    for(let i=0;i<24;i++){const a=i/24*Math.PI*2;rune(Math.cos(a)*95,Math.sin(a)*95,14,a+Math.PI/2)}
    for(let i=0;i<48;i++){const a=i/48*Math.PI*2;g.lineWidth=i%4?1.5:3;g.beginPath();g.moveTo(Math.cos(a)*112,Math.sin(a)*112);g.lineTo(Math.cos(a)*(i%4?117:122),Math.sin(a)*(i%4?117:122));g.stroke()}
    g.lineWidth=3;for(let t=0;t<2;t++){g.beginPath();for(let i=0;i<=3;i++){const a=i/3*Math.PI*2+t*Math.PI/3-Math.PI/2;const x=Math.cos(a)*78,y=Math.sin(a)*78;if(i)g.lineTo(x,y);else g.moveTo(x,y)}g.stroke()}
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2+Math.PI/6-Math.PI/2;g.beginPath();g.arc(Math.cos(a)*50,Math.sin(a)*50,7,0,Math.PI*2);g.stroke()}}
  else if(k=='glyph'){g.shadowColor='#fff';g.shadowBlur=8;circ(118,6);circ(96,2);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;g.lineWidth=3;g.beginPath();g.moveTo(Math.cos(a)*96,Math.sin(a)*96);g.lineTo(Math.cos(a+Math.PI*.75)*96,Math.sin(a+Math.PI*.75)*96);g.stroke()}
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;rune(Math.cos(a)*107,Math.sin(a)*107,10,a)}}
  else if(k=='star'){const gr=g.createRadialGradient(0,0,0,0,0,C);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.12,'rgba(255,255,255,.8)');gr.addColorStop(.35,'rgba(255,255,255,.18)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(-C,-C,S,S);
    for(let i=0;i<4;i++){g.save();g.rotate(i*Math.PI/2);const l=g.createLinearGradient(0,0,C,0);l.addColorStop(0,'rgba(255,255,255,1)');l.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=l;g.beginPath();g.moveTo(0,-7);g.lineTo(C,0);g.lineTo(0,7);g.closePath();g.fill();g.restore()}}
  else if(k=='soft'){const gr=g.createRadialGradient(0,0,0,0,0,C);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(-C,-C,S,S)}
  else if(k=='beam'){g.setTransform(1,0,0,1,0,0);const l=g.createLinearGradient(0,0,S,0);l.addColorStop(0,'rgba(255,255,255,0)');l.addColorStop(.5,'rgba(255,255,255,1)');l.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=l;g.fillRect(0,0,S,S)}
  else if(k=='vgrad'){g.setTransform(1,0,0,1,0,0);const l=g.createLinearGradient(0,S,0,0);l.addColorStop(0,'rgba(255,255,255,1)');l.addColorStop(.35,'rgba(255,255,255,.55)');l.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=l;g.fillRect(0,0,S,S)}
  else if(k=='rift'){g.setTransform(1,0,0,1,0,0);for(let y=0;y<S;y+=2){const w=S*(.08+.1*Math.abs(Math.sin(y*.09))*Math.abs(Math.sin(y*.031)));const l=g.createLinearGradient(C-w,0,C+w,0);l.addColorStop(0,'rgba(255,255,255,0)');l.addColorStop(.5,'rgba(255,255,255,1)');l.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=l;g.fillRect(C-w,y,w*2,2)}}
  const t=new THREE.CanvasTexture(c);t.userData={evxS:1};return EVX.t[k]=t}
// shared shapes
function evxCyl(){return evxG('cyl',()=>{const g=new THREE.CylinderGeometry(1,1,1,20,1,true);g.translate(0,.5,0);return g})}
function evxTor(){return evxG('tor',()=>{const g=new THREE.TorusGeometry(1,.05,6,64);g.rotateX(Math.PI/2);return g})}
function evxDisk(){return evxG('disk',()=>{const g=new THREE.CircleGeometry(1,40);g.rotateX(-Math.PI/2);return g})}
function evxLimit(k,ms){const t=performance.now();if((EVX.lim[k]||0)>t)return false;EVX.lim[k]=t+ms;return true}
// a draped, turning textured disc on the ground (radius R at full size)
function evxGround(p,tex,col,op,R,ro){const geo=new THREE.PlaneGeometry(1,1,10,10);geo.userData.evxOwn=1;const m=kqsDrapeM(geo,evxAdd(col,0,evxTex(tex)),ro||29);
  m.userData.dr=(a,r)=>{const c=Math.cos(a),s=Math.sin(a);kqsDrape(m,(u,v)=>{const x=(u*c-v*s)*2*r,z=(u*s+v*c)*2*r;return [p.x+x,p.z-z]},.1)};m.userData.op=op;return m}

// ---------------- the effects ----------------
function ev137Sigil(p,col,R,ms,kind,op){if(!p)return;op=op==null?1:op;R=Math.max(.6,Math.min(12,R||2.5));ms=ms||700;col=evxCol(col);const pp=new THREE.Vector3(p.x,0,p.z);
  const big=!kind,A=evxGround(pp,big?'sigil':'glyph',col,(big?.95:.85)*op,R,29),B=big?evxGround(pp,'glyph',evxLerp(col,0xffffff,.45),.55*op,R*.62,30):null,a0=Math.random()*6.28,sp=big?.9:2.2;
  tw(ms,k=>{const g=k<.18?ATK_E.out(k/.18):1,f=k>.62?1-(k-.62)/.38:1,r=R*(.55+.45*g);A.userData.dr(a0+k*sp*ms/1000,r);A.material.opacity=A.userData.op*f*(k<.18?g:1);
    if(B){B.userData.dr(-a0-k*sp*1.6*ms/1000,r*.62);B.material.opacity=B.userData.op*f*(k<.25?k/.25:1)}},()=>{evxRm(A);evxRm(B)})}
function ev137Column(p,col,h,r,ms,op){if(!p)return;op=op==null?1:op;h=h||7;r=r||.7;ms=ms||600;col=evxCol(col);const g=new THREE.Group(),b=evxGY(p,0);g.position.copy(b);
  const o=evxMesh(evxCyl(),evxAdd(col,.55,evxTex('vgrad'))),c=evxMesh(evxCyl(),evxAdd(evxLerp(col,0xffffff,.75),.9,evxTex('vgrad'))),cap=new THREE.Sprite(new THREE.SpriteMaterial({map:evxTex('soft'),color:col,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));
  cap.userData.lpsSkip=1;g.add(o,c,cap);scene.add(g);
  for(let i=0;i<10;i++){const a=Math.random()*6.28,rr=Math.random()*r;evxPuff(new THREE.Vector3(b.x+Math.cos(a)*rr,b.y+Math.random()*1.5,b.z+Math.sin(a)*rr),{spr:1,col:i%2?col:0xffffff,r0:.22,r1:0,life:.5+Math.random()*.5,op:.95,v:[Math.cos(a)*.4,4+Math.random()*5,Math.sin(a)*.4],drag:1.2,fin:.05})}
  tw(ms,k=>{const u=k<.16?ATK_E.out(k/.16):1,f=k>.45?1-(k-.45)/.55:1,w=r*(1+k*.5)*(k>.45?f*.7+.3:1);o.scale.set(w,h*u,w);c.scale.set(w*.32,h*u*1.05,w*.32);o.material.opacity=.55*f*op;c.material.opacity=.95*f*op;
    cap.position.y=h*u;cap.scale.setScalar(r*3*(1-k*.4));cap.material.opacity=.9*f*op},()=>evxRm(g))}
function ev137Shock(p,col,R,ms){if(!p)return;R=Math.max(.8,Math.min(14,R||3));ms=ms||520;col=evxCol(col);const g=new THREE.Group(),b=evxGY(p,.12);g.position.copy(b);
  const t1=evxMesh(evxTor(),evxAdd(evxLerp(col,0xffffff,.55),1)),t2=evxMesh(evxTor(),evxAdd(col,.8)),w=evxMesh(evxCyl(),evxAdd(col,.5,evxTex('vgrad'))),d=evxMesh(evxDisk(),evxAdd(col,.35,evxTex('soft')));
  g.add(t1,t2,w,d);scene.add(g);
  for(let i=0;i<14;i++){const a=i/14*6.28+Math.random()*.3,v=R*evxRand(2.2,3.6);evxPuff(new THREE.Vector3(b.x+Math.cos(a)*.4,b.y+.2,b.z+Math.sin(a)*.4),{col:i%3?col:0xffffff,add:1,geo:'tet',r0:.09,r1:.02,life:.45+Math.random()*.25,op:1,v:[Math.cos(a)*v,1.5+Math.random()*3,Math.sin(a)*v],g:9,drag:2.2,spin:10,fin:.02})}
  tw(ms,k=>{const e=ATK_E.out(k),r=R*(.15+.85*e),f=1-k;t1.scale.set(r,1+2*(1-k),r);t2.scale.set(r*.86,1.6,r*.86);t1.material.opacity=f;t2.material.opacity=.8*f*f;
    w.scale.set(r,.7*(1-e)+.05,r);w.material.opacity=.32*f;d.scale.setScalar(r*1.05);d.material.opacity=.4*f*f},()=>evxRm(g))}
function ev137Flare(p,col,s,ms){if(!p)return;s=s||1.5;ms=ms||360;col=evxCol(col);const g=new THREE.Group();g.position.set(p.x,p.y,p.z);
  const a=new THREE.Sprite(new THREE.SpriteMaterial({map:evxTex('soft'),color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})),b=new THREE.Sprite(new THREE.SpriteMaterial({map:evxTex('star'),color:evxLerp(col,0xffffff,.6),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
  a.userData.lpsSkip=b.userData.lpsSkip=1;a.renderOrder=b.renderOrder=34;g.add(a,b);scene.add(g);const r0=Math.random()*6.28;
  tw(ms,k=>{const u=k<.12?k/.12:1,f=Math.pow(1-k,1.4);a.scale.setScalar(s*2.2*(.6+.4*u));a.material.opacity=.8*f;b.scale.setScalar(s*3*(.4+.6*u)*(1-k*.3));b.material.rotation=r0+k*1.2;b.material.opacity=f},()=>evxRm(g))}
function ev137Lance(a,b,col,w,ms){if(!a||!b)return;w=w||.12;ms=ms||300;col=evxCol(col);const L=a.distanceTo(b);if(L<.05)return;const g=new THREE.Group(),dir=b.clone().sub(a).normalize();
  g.position.copy(a);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);const o=evxMesh(evxCyl(),evxAdd(col,.6)),c=evxMesh(evxCyl(),evxAdd(evxLerp(col,0xffffff,.8),1));g.add(o,c);scene.add(g);
  for(let i=0;i<Math.min(16,Math.ceil(L*1.5));i++){const q=a.clone().lerp(b,Math.random());evxPuff(q,{spr:1,col:i%2?col:0xffffff,r0:.25,r1:0,life:.3+Math.random()*.3,op:.9,v:[(Math.random()-.5)*2,Math.random()*2,(Math.random()-.5)*2],drag:2,fin:.05})}
  tw(ms,k=>{const u=k<.15?ATK_E.out(k/.15):1,f=1-k,ww=w*(k<.15?1+(1-u)*2:1)*(1-k*.7);o.scale.set(ww*1.5,L*u,ww*1.5);c.scale.set(ww*.55,L*u,ww*.55);o.material.opacity=.5*f;c.material.opacity=f},()=>evxRm(g))}
// spectral weapons (built from shared shapes, in model space: tip / impact point at y=0, pointing down)
function evxWeapon(kind,col){const g=new THREE.Group(),m1=evxAdd(col,.85),m2=evxAdd(evxLerp(col,0xffffff,.7),.95),add=(geo,m,x,y,z,sx,sy,sz,rx,ry,rz)=>{const q=evxMesh(geo,m);q.position.set(x,y,z);q.scale.set(sx,sy,sz);q.rotation.set(rx||0,ry||0,rz||0);g.add(q);return q};
  const box=evxG('box',()=>new THREE.BoxGeometry(1,1,1)),oct=evxG('oct',()=>new THREE.OctahedronGeometry(1,0)),ico=evxG('ico',()=>new THREE.IcosahedronGeometry(1,1)),cone=evxG('cone',()=>{const q=new THREE.ConeGeometry(1,1,4);q.rotateX(Math.PI);q.translate(0,.5,0);return q}),cyl=evxG('cyl6',()=>new THREE.CylinderGeometry(1,1,1,6));
  if(kind=='sword'){add(cone,m2,0,0,0,.18,.9,.05);add(box,m1,0,1.9,0,.34,2.0,.07);add(box,m2,0,1.9,0,.12,2.0,.1);add(box,m1,0,2.98,0,1.1,.16,.2);add(cyl,m1,0,3.4,0,.07,.75,.07);add(oct,m2,0,3.9,0,.17,.2,.17)}
  else if(kind=='hammer'){add(box,m1,0,.55,0,1.3,1.1,.75);add(box,m2,0,.55,0,1.36,.3,.8);add(oct,m2,0,.55,.42,.2,.2,.08);add(cyl,m1,0,2.3,0,.09,2.6,.09);add(oct,m2,0,3.7,0,.16,.2,.16)}
  else if(kind=='axe'){add(box,m1,.45,.75,0,.9,1.2,.08);add(box,m2,.92,.75,0,.1,1.3,.12);add(cyl,m1,0,1.6,0,.08,3.2,.08);add(cone,m2,0,0,0,.12,.4,.12)}
  else if(kind=='spear'){add(cone,m2,0,0,0,.2,1.1,.2);add(oct,m1,0,1.15,0,.17,.3,.17);add(cyl,m1,0,2.9,0,.06,3.4,.06);for(let i=0;i<3;i++)add(box,m2,0,4.3+i*.22,0,.4-.1*i,.04,.04,0,i,0)}
  else if(kind=='star'){add(oct,m2,0,.6,0,.5,.9,.5);add(oct,m1,0,.6,0,.85,.35,.85,0,Math.PI/4,0)}
  else{add(ico,m2,0,.6,0,.55,.55,.55);add(ico,m1,0,.6,0,.85,.85,.85)}
  return g}
function ev137Fall(p,col,kind,ms){if(!p)return;ms=ms||520;col=evxCol(col);const b=evxGY(p,0),w=evxWeapon(kind||'sword',col),h=11,yaw=Math.random()*6.28,tilt=kind=='comet'||kind=='star'?.6:.18;
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:evxTex('soft'),color:col,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));glow.userData.lpsSkip=1;glow.scale.setScalar(2.4);glow.position.y=1;w.add(glow);
  w.rotation.set(tilt,yaw,0);scene.add(w);const s0=new THREE.Vector3(b.x-Math.sin(yaw)*h*tilt,b.y+h,b.z-Math.cos(yaw)*h*tilt);let pt=0;
  tw(ms,k=>{const e=k*k*(1.3-.3*k);w.position.lerpVectors(s0,b,Math.min(1,e));if(kind=='comet'||kind=='star')w.rotation.y+=.25;pt++;if(pt%2==0)evxPuff(w.position.clone().add(new THREE.Vector3(0,1,0)),{spr:1,col,r0:.6,r1:0,life:.35,op:.8,fin:.02})},
   ()=>{ev137Shock(b,col,3.2,520);ev137Flare(evxGY(b,1),col,2.2,320);ev137Shards(b,col,7,1.4,1.1,700);
    if(kind=='comet'||kind=='star'){evxRm(w);return}const m=[];w.traverse(q=>{if(q.material&&q.material.opacity!=null)m.push([q.material,q.material.opacity])});
    tw(650,k=>{w.position.y=b.y-k*.4+(k>.6?(k-.6)*4:0);m.forEach(([q,o])=>q.opacity=o*(k<.5?1:1-(k-.5)/.5))},()=>evxRm(w))})}
function ev137Crescent(p,d,col,L,ms){if(!p||!d)return;L=L||7;ms=ms||420;col=evxCol(col);const g=new THREE.Group(),geo=evxG('cres',()=>{const q=new THREE.RingGeometry(.75,1.15,28,1,-1.15,2.3);q.rotateX(-Math.PI/2);return q});
  const a=evxMesh(geo,evxAdd(col,.9)),b=evxMesh(geo,evxAdd(evxLerp(col,0xffffff,.7),1));b.scale.set(.92,1,.6);b.position.y=.02;g.add(a,b);const yaw=Math.atan2(d.x,d.z);g.rotation.y=yaw-Math.PI/2;
  const s=evxGY(p,.7);g.position.copy(s);scene.add(g);let pt=0;
  tw(ms,k=>{const e=ATK_E.out(k);const x=s.x+d.x*L*e,z=s.z+d.z*L*e;g.position.set(x,GH(x,z)+.7,z);const sc=1.2+k*1.3;g.scale.set(sc,1,sc);a.material.opacity=.9*(1-k*k);b.material.opacity=1-k;
    if(++pt%2==0)evxPuff(g.position.clone(),{spr:1,col,r0:.7,r1:0,life:.3,op:.6,fin:.02})},()=>evxRm(g))}
function ev137Shards(p,col,n,R,h,ms){if(!p)return;n=Math.min(24,n||8);R=R||2;h=h||1.2;ms=ms||800;col=evxCol(col);const g=new THREE.Group(),b=evxGY(p,0);g.position.copy(b);
  const geo=evxG('shard',()=>{const q=new THREE.OctahedronGeometry(1,0);q.scale(.22,1,.22);q.translate(0,.4,0);return q}),m=new THREE.MeshStandardMaterial({color:evxLerp(col,0xffffff,.35),emissive:col,emissiveIntensity:.9,flatShading:true,transparent:true,opacity:.92,roughness:.3});
  const L=[];for(let i=0;i<n;i++){const a=i/n*6.28+Math.random()*.35,r=R*evxRand(.75,1.05),q=new THREE.Mesh(geo,m);q.userData.lpsSkip=1;const x=Math.cos(a)*r,z=Math.sin(a)*r;q.position.set(x,GH(b.x+x,b.z+z)-b.y-.1,z);
    q.rotation.set(Math.sin(a)*.45,Math.random()*3,-Math.cos(a)*.45);q.userData.h=h*evxRand(.6,1.25);q.scale.set(1,.01,1);g.add(q);L.push(q)}scene.add(g);
  tw(ms,k=>{const u=k<.15?ATK_E.out(k/.15):1,f=k>.6?1-(k-.6)/.4:1;L.forEach(q=>q.scale.set(f*.9+.1,q.userData.h*u*(k>.6?f:1),f*.9+.1));m.opacity=.92*f},()=>evxRm(g))}
function ev137Orbit(p,col,r,ms){if(!p)return;r=r||1;ms=ms||900;col=evxCol(col);const g=new THREE.Group(),b=evxGY(p,0);g.position.copy(b);const S=[];
  for(let i=0;i<8;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:evxTex(i%2?'star':'soft'),color:i%2?0xffffff:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));s.userData.lpsSkip=1;s.renderOrder=34;g.add(s);S.push(s)}scene.add(g);
  tw(ms,k=>{S.forEach((s,i)=>{const a=k*9+i/8*6.28,y=.2+k*2.4+Math.sin(i)*.2,rr=r*(1-k*.35);s.position.set(Math.cos(a)*rr,y,Math.sin(a)*rr);s.scale.setScalar((i%2?.55:.4)*(1-k*.5));s.material.opacity=(k<.15?k/.15:1)*(1-k)})},()=>evxRm(g))}
function ev137Rift(a,b,col,ms){if(!a||!b)return;ms=ms||700;col=evxCol(col);const L=Math.hypot(b.x-a.x,b.z-a.z);if(L<.2)return;const d={x:(b.x-a.x)/L,z:(b.z-a.z)/L},n={x:-d.z,z:d.x};
  const mk=(w,c,op,ro)=>{const geo=new THREE.PlaneGeometry(1,1,1,Math.max(2,Math.ceil(L*2)));geo.userData.evxOwn=1;const m=kqsDrapeM(geo,evxAdd(c,op,evxTex('rift')),ro);kqsDrape(m,(u,v)=>{const t=v+.5;return [a.x+d.x*L*t+n.x*u*w,a.z+d.z*L*t+n.z*u*w]},.09);return m};
  const A=mk(1.4,col,.9,29),B=mk(.45,0xffffff,.9,30);for(let i=0;i<Math.min(14,L*2);i++){const t=Math.random();evxPuff(evxGY({x:a.x+d.x*L*t,z:a.z+d.z*L*t},.2),{spr:1,col,r0:.4,r1:0,life:.6,op:.8,v:[0,2+Math.random()*2,0],drag:1,fin:.05})}
  tw(ms,k=>{const f=k<.12?k/.12:Math.pow(1-(k-.12)/.88,1.3);A.material.opacity=.9*f;B.material.opacity=.9*f},()=>{evxRm(A);evxRm(B)})}
function ev137Impact(p,col,s){if(!p)return;s=s||1;col=evxCol(col);ev137Shock(p,col,1.8*s,420);ev137Flare(p,col,1.3*s,300);
  for(let i=0;i<8;i++){const a=Math.random()*6.28,v=evxRand(2,5)*s;evxPuff(p.clone(),{col:i%2?col:0xffffff,add:1,geo:'tet',r0:.08*s,r1:0,life:.4+Math.random()*.2,op:1,v:[Math.cos(a)*v,evxRand(1,4),Math.sin(a)*v],g:8,drag:2,spin:12,fin:.02})}}

// ---------------- evolved projectiles ----------------
// one shared model per class + colour (materials are shared too, so nothing to free when the shot ends)
function evxSM(k,mk){const m=EVX.m[k]||(EVX.m[k]=mk());m.userData.evxS=1;return m}
function ev137Proj(cls,col){col=evxCol(col);const g=new THREE.Group(),K=cls+'|'+col,c2=evxLerp(col,0xffffff,.7),add=(geo,mk,x,y,z,sx,sy,sz)=>{const q=evxMesh(geo,mk);q.position.set(x||0,y||0,z||0);q.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);g.add(q);return q},
  M1=evxSM(K+'a',()=>evxAdd(col,.85)),M2=evxSM(K+'b',()=>evxAdd(c2,1)),SP=k=>{const s=new THREE.Sprite(evxSM(K+'s'+k,()=>new THREE.SpriteMaterial({map:evxTex(k),color:k=='star'?c2:col,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false})));s.userData.lpsSkip=1;s.renderOrder=34;g.add(s);return s};
  const ico=evxG('ico0',()=>new THREE.IcosahedronGeometry(1,0)),oct=evxG('oct',()=>new THREE.OctahedronGeometry(1,0)),cone=evxG('pcone',()=>{const q=new THREE.ConeGeometry(1,1,6,1,true);q.rotateX(-Math.PI/2);q.translate(0,0,-.5);return q});
  if(cls=='ranger'){add(oct,M2,0,0,.18,.07,.07,.3);add(cone,M1,0,0,-.1,.09,.09,1.6);add(evxG('fl',()=>new THREE.PlaneGeometry(.22,.5)),M1,0,0,-.42,1,1,1).rotation.x=Math.PI/2;
    const f2=add(evxG('fl',()=>new THREE.PlaneGeometry(.22,.5)),M1,0,0,-.42,1,1,1);f2.rotation.set(Math.PI/2,0,Math.PI/2);const s=SP('soft');s.scale.setScalar(.9);s.position.z=.12;g.userData.spin={o:null,a:0}}
  else if(cls=='assassin'){const st=new THREE.Group();g.add(st);for(let i=0;i<4;i++){const q=evxMesh(oct,M1);q.scale.set(.06,.03,.3);q.position.set(Math.sin(i*Math.PI/2)*.2,0,Math.cos(i*Math.PI/2)*.2);q.rotation.y=i*Math.PI/2;st.add(q)}
    const c=evxMesh(oct,M2);c.scale.setScalar(.09);st.add(c);const s=SP('star');s.scale.setScalar(.5);g.userData.spin={o:st,a:'y',v:26}}
  else{const core=add(ico,M2,0,0,0,.13);const sh=new THREE.Group();g.add(sh);const q=evxMesh(ico,M1);q.scale.setScalar(.24);sh.add(q);for(let i=0;i<3;i++){const o=evxMesh(oct,M2);o.scale.setScalar(.06);o.position.set(Math.cos(i*2.09)*.36,Math.sin(i*2.09)*.36,0);sh.add(o)}
    add(cone,M1,0,0,-.12,.2,.2,1.1);const s=SP('soft');s.scale.setScalar(1.2);const s2=SP('star');s2.scale.setScalar(.9);g.userData.spin={o:sh,a:'z',v:9}}
  return g}
// the wake of an evolved shot (called every frame for it from the shotTick wrapper in 2700)
function ev137Trail(sh,dt){const m=sh.m;if(!m||!m.parent)return;sh.evT=(sh.evT||0)-dt;const sp=m.userData.ev137S;if(sp&&sp.o){sp.o.rotation[sp.a]+=dt*sp.v}if(sh.evT>0)return;sh.evT=.03;
  const p=m.getWorldPosition(new THREE.Vector3()),col=sh.evC||0xffffff;evxPuff(p,{spr:1,col,r0:sh.evCls=='assassin'?.35:.45,r1:0,life:.35,op:.75,fin:.02});
  if(Math.random()<.5)evxPuff(p.clone(),{spr:1,col:0xffffff,r0:.14,r1:0,life:.4,op:.9,v:[(Math.random()-.5)*1.4,(Math.random()-.2)*1.4,(Math.random()-.5)*1.4],drag:1.5,fin:.02});
  if(sh.evCls=='assassin'&&Math.random()<.5)evxPuff(p.clone(),{col:0x1a0a2a,r0:.12,r1:.4,life:.6,op:.45,v:[0,.4,0],drag:1,geo:'dod',fin:.1})}

// ---------------- co-op: partners replay these like the other effect functions (2170) ----------------
(function(){if(typeof MPV=='undefined'||!MPV.FX)return;
  ['ev137Sigil','ev137Column','ev137Shock','ev137Flare','ev137Lance','ev137Fall','ev137Crescent','ev137Shards','ev137Orbit','ev137Rift','ev137Impact'].forEach(n=>{
    const f=window[n];if(typeof f!='function'||MPV_FX[n]!=null)return;MPV_FX[n]=MPV.FX.length;MPV.FX.push(n);
    window[n]=function(){
      if(!MPV.cap||MPV.dep||MPV.rep||!mpvLive())return f.apply(this,arguments);
      let a=null;try{a=Array.prototype.map.call(arguments,x=>mpvSer(x,0))}catch(_){a=null}
      if(a)mpvPush(['V',MPV_FX[n],mpvR(pl.position.x),mpvR(pl.position.y),mpvR(pl.position.z),mpvR(pl.rotation.y),a]);
      MPV.dep++;try{return f.apply(this,arguments)}finally{MPV.dep--}}})})();
