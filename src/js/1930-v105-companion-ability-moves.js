// ================= v105: every companion ability has its own move and its own effect =================
// Before: a companion spell was its kind's generic effect (bites lunged, bolts flew, novas rang) with no body motion.
// Now each of the 48 spells (CSP) has a recipe in SPX105: a keyframed body motion on the creature rig (MV105: pose
// channels the v85 overlay already understands — neck, head, jaw, chest, spine, pelvis, legs, tail, chest swell — plus
// the body group: forward reach, lift, spin, roll, pitch), timed so the spell lands at the motion's strike moment, and a
// unique effect built from the small toolkit below (claw marks, flame streams, sonic waves, rock spikes, orbiting stones,
// rising hearts, sigils, tornadoes, decorated projectiles, ...). Damage, ranges and cooldowns are the spell's own:
// compCast still does the work, it is only called at the strike moment (bites: the motion replaces the generic lunge).
// While a non-bite spell winds up the companion counts as busy (f.lk) so it never starts two casts at once.
var FX105={G:null,tex:{},on:true};
function g105(){if(FX105.G)return FX105.G;const G={box:new THREE.BoxGeometry(1,1,1),sph:new THREE.SphereGeometry(.5,10,8),ico:new THREE.IcosahedronGeometry(.5,0),dod:new THREE.DodecahedronGeometry(.5,0),
  cone:new THREE.ConeGeometry(.5,1,7),cyl:new THREE.CylinderGeometry(.5,.5,1,12,1,true),oct:new THREE.OctahedronGeometry(.5,0),ring:new THREE.RingGeometry(.42,.5,40),disc:new THREE.CircleGeometry(.5,32),
  plane:new THREE.PlaneGeometry(1,1),hex:new THREE.CircleGeometry(.16,6),blade:new THREE.RingGeometry(.3,.5,10,1,0,Math.PI*.8),bone:new THREE.CylinderGeometry(.04,.04,.42,5),hook:new THREE.TorusGeometry(.26,.05,4,10,Math.PI),jaw:new THREE.TorusGeometry(.5,.07,5,14,Math.PI),torus:new THREE.TorusGeometry(.5,.05,5,24,Math.PI*1.1),tri:new THREE.ConeGeometry(.5,1,3)};
  G.cone.translate(0,.5,0);G.cyl.translate(0,.5,0);G.tri.translate(0,.5,0);return FX105.G=G}
// a short-lived mesh: additive glow (add=1) or solid (add=0); fn(k, mesh) each frame; removed and freed at the end
function x5(geo,col,ms,fn,o){o=o||{};const G=g105(),mat=o.add===0?new THREE.MeshLambertMaterial({color:col,transparent:true}):addMat(col),m=new THREE.Mesh(G[geo]||geo,mat);m.userData.lpsSkip=1;
  if(o.p)m.position.copy(o.p);if(o.s!=null){if(typeof o.s=='number')m.scale.setScalar(o.s);else m.scale.set(o.s[0],o.s[1],o.s[2])}if(o.r)m.rotation.set(o.r[0],o.r[1],o.r[2]);(o.par||scene).add(m);
  tw(ms,k=>{try{fn&&fn(k,m)}catch(_){}},()=>{(o.par||scene).remove(m);mat.dispose()});return m}
// an emoji as a floating sprite
function x5emo(e,p,ms,fn,sz){let t=FX105.tex[e];if(!t){const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');c.font='48px serif';c.textAlign='center';c.textBaseline='middle';c.fillText(e,32,36);t=FX105.tex[e]=new THREE.CanvasTexture(cv)}
  const mt=new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}),s=new THREE.Sprite(mt);s.scale.setScalar(sz||.5);s.position.copy(p);scene.add(s);
  tw(ms,k=>{try{fn&&fn(k,s)}catch(_){}},()=>{scene.remove(s);mt.dispose()});return s}
const v5=(x,y,z)=>new THREE.Vector3(x,y,z);
function r5(a,b){return a+Math.random()*(b-a)}
function fwd5(d,a){const c=Math.cos(a),s=Math.sin(a);return v5(d.x*c+d.z*s,0,-d.x*s+d.z*c)}
// ---------- the effect toolkit ----------
// claw marks: n parallel arcs raking across p (facing d)
function fxClaw(p,d,col,n,sz,ms){const a=Math.atan2(d.x,d.z);for(let i=0;i<n;i++){const off=(i-(n-1)/2)*.16*sz;
  x5('torus',col,ms||260,(k,m)=>{m.material.opacity=1-k;m.scale.setScalar(sz*(.6+.4*k))},{p:v5(p.x+Math.cos(a)*off,p.y+.75,p.z-Math.sin(a)*off),s:sz,r:[0,a+Math.PI/2,-.6-k5(i)]})}}
function k5(i){return i*.18}
// a stream of glowing chunks along d from o (breath, spray); spread in radians, len in tiles
function fxStream(o,d,col,n,len,spread,ms,geo,sz){for(let i=0;i<n;i++){const dl=i/n*(ms*.5),dir=fwd5(d,r5(-spread,spread)),L=len*r5(.7,1.05),up=r5(-.05,.25),s0=sz||.22;
  setTimeout(()=>x5(geo||'ico',col,ms*.6,(k,m)=>{m.position.set(o.x+dir.x*L*k,o.y+up*k*L*.3,o.z+dir.z*L*k);m.scale.setScalar(s0*(.5+k*1.4));m.material.opacity=.9*(1-k);m.rotation.y+=.2},{p:o.clone()}),dl)}}
// sonic / shock waves: n arcs travelling out from o along d
function fxWaves(o,d,col,n,len,ms,width){const a=Math.atan2(-d.z,d.x);for(let i=0;i<n;i++)setTimeout(()=>{const g=new THREE.RingGeometry(.8,.95,24,1,-(width||.8),2*(width||.8));
  x5(g,col,ms,(k,m)=>{m.scale.setScalar(.4+k*len);m.material.opacity=.85*(1-k)},{p:v5(o.x,o.y,o.z),r:[-Math.PI/2,0,a]});setTimeout(()=>g.dispose(),ms+50)},i*ms*.25)}
// rock spikes (solid) bursting from the ground in a ring of radius R; waves>1 = rings travelling out
function fxSpikes(p,col,n,R,h,ms,waves){for(let w=0;w<(waves||1);w++)setTimeout(()=>{const RR=R*(w+1)/(waves||1);for(let i=0;i<n;i++){const a=i/n*6.283+w*.3,q=v5(p.x+Math.cos(a)*RR,p.y,p.z+Math.sin(a)*RR);
  x5('cone',col,ms,(k,m)=>{const u=k<.25?k/.25:k>.7?1-(k-.7)/.3:1;m.scale.set(.22,h*u*r5(.9,1),.22);m.material.opacity=Math.min(1,u*1.5)},{p:q,add:0,r:[r5(-.25,.25),a,r5(-.25,.25)]})}},w*160)}
// cracks radiating along the ground
function fxCracks(p,col,n,len,ms){for(let i=0;i<n;i++){const a=i/n*6.283+r5(0,.4),L=len*r5(.6,1);
  x5('box',col,ms,(k,m)=>{const u=Math.min(1,k*4);m.scale.set(L*u,.02,.09);m.position.set(p.x+Math.cos(a)*L*u/2,p.y+.05,p.z-Math.sin(a)*L*u/2);m.material.opacity=1-k},{p:p.clone(),r:[0,a,0]})}}
// a column of light / fire
function fxPillar(p,col,r,h,ms){x5('cyl',col,ms,(k,m)=>{const u=k<.2?k/.2:1;m.scale.set(r*(1+k*.4),h*u,r*(1+k*.4));m.material.opacity=.7*(1-k)},{p:p.clone()})}
// things circling a (moving) centre: getP() → Vector3; make(i) → mesh/sprite factory options
function fxOrbit(getP,n,r,y,ms,spd,make){for(let i=0;i<n;i++){const a0=i/n*6.283;make(i,(k,o)=>{const P=getP(),a=a0+k*spd;o.position.set(P.x+Math.cos(a)*r,P.y+y+Math.sin(k*9+i)*.08,P.z+Math.sin(a)*r)})}}
// things drifting up (sprites or glow meshes) around p
function fxRise(p,n,R,h,ms,make){for(let i=0;i<n;i++){const a=r5(0,6.283),rr=r5(0,R),q=v5(p.x+Math.cos(a)*rr,p.y+r5(.2,.8),p.z+Math.sin(a)*rr),dl=r5(0,ms*.3);
  setTimeout(()=>make(i,q,(k,o)=>{o.position.set(q.x+Math.sin(k*5+i)*.15,q.y+k*h,q.z);if(o.material)o.material.opacity=k<.2?k*5:1-(k-.2)/.8}),dl)}}
// things falling from the sky onto an area
function fxFall(p,n,R,h,ms,make){for(let i=0;i<n;i++){const a=r5(0,6.283),rr=r5(0,R),q=v5(p.x+Math.cos(a)*rr,p.y,p.z+Math.sin(a)*rr),dl=r5(0,ms*.6);
  setTimeout(()=>make(i,q,(k,o)=>{o.position.set(q.x+Math.sin(k*4+i)*.3,q.y+h*(1-k),q.z);if(o.material)o.material.opacity=k>.85?(1-k)/.15:1}),dl)}}
// a rotating ground sigil: ring + a star of n points
function fxSigil(p,col,r,ms,n){const g=new THREE.Group();g.position.copy(gY(p,.06));scene.add(g);const mats=[];
  const rg=new THREE.Mesh(g105().ring,addMat(col));rg.rotation.x=-Math.PI/2;rg.scale.setScalar(r*2);g.add(rg);mats.push(rg.material);
  const pts=[],st=n%2?2:1;for(let i=0;i<=n;i++){const a=i*st/n*6.283;pts.push(v5(Math.cos(a)*r*.9,0,Math.sin(a)*r*.9))}
  const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));g.add(ln);mats.push(ln.material);
  tw(ms,k=>{g.rotation.y=k*2.5;const o=k<.15?k/.15:1-Math.max(0,(k-.7)/.3);mats.forEach(m=>m.opacity=o)},()=>{scene.remove(g);mats.forEach(m=>m.dispose());ln.geometry.dispose()});return g}
// a tornado on a (moving) centre
function fxTornado(getP,col,h,r,ms){for(let i=0;i<7;i++){const y=i/7*h;x5('ring',col,ms,(k,m)=>{const P=getP();m.position.set(P.x+Math.sin(k*20+i)*.12*i/7,P.y+y+.1,P.z+Math.cos(k*20+i)*.12*i/7);m.rotation.set(-Math.PI/2,0,k*30+i);
  m.scale.setScalar((r*.4+r*1.6*i/7)*(k<.15?k/.15:1));m.material.opacity=.7*(1-Math.max(0,(k-.6)/.4))},{p:getP().clone()})}}
// a beam between two (moving) points with a spiral of motes
function fxBeam(getA,getB,col,w,ms,mote){const L0=()=>{const a=getA(),b=getB();return [a,b,a.distanceTo(b)]};
  x5('cyl',col,ms,(k,m)=>{const [a,b,L]=L0();m.position.copy(a);m.lookAt(b);m.rotateX(Math.PI/2);m.scale.set(w*(1+.3*Math.sin(k*40)),L,w*(1+.3*Math.sin(k*40)));m.material.opacity=.6*(1-k*k)},{p:getA().clone()});
  if(mote)for(let i=0;i<8;i++)setTimeout(()=>x5('oct',mote,ms*.5,(k,m)=>{const [a,b]=L0(),q=b.clone().lerp(a,k);q.x+=Math.cos(k*14+i)*.25;q.y+=Math.sin(k*14+i)*.25;m.position.copy(q);m.scale.setScalar(.14);m.material.opacity=1-k*.6},{p:getB().clone()}),i*ms*.06)}
// jaws snapping shut on p (seen from the side of the biter)
function fxJaws(p,col,sz,ms,yaw){const g=new THREE.Group();g.position.copy(p);g.rotation.y=(yaw||0)+Math.PI/2;g.scale.setScalar(sz);scene.add(g);const mats=[];
  [1,-1].forEach(s=>{const j=new THREE.Group();g.add(j);const ma=addMat(col);mats.push(ma);const arc=new THREE.Mesh(g105().jaw,ma);if(s<0)arc.rotation.z=Math.PI;j.add(arc);
    for(let i=0;i<5;i++){const a=.35+i/4*2.45,t=new THREE.Mesh(g105().cone,ma);t.position.set(Math.cos(a)*.5,s*Math.sin(a)*.5,0);t.scale.set(.09,.2,.09);if(s>0)t.rotation.z=Math.PI;j.add(t)}j.userData.s=s});
  tw(ms,k=>{const u=Math.min(1,k/.45),o=k<.6?1:1-(k-.6)/.4;g.children.forEach(j=>{j.position.y=.7/sz+j.userData.s*(.42*(1-u))});mats.forEach(m=>m.opacity=o)},()=>{scene.remove(g);mats.forEach(m=>m.dispose())})}
// a web on the ground
function fxWeb(p,col,r,ms){const pts=[];for(let i=0;i<8;i++){const a=i/8*6.283;pts.push(v5(0,0,0),v5(Math.cos(a)*r,0,Math.sin(a)*r))}
  for(let j=1;j<=3;j++)for(let i=0;i<8;i++){const a=i/8*6.283,b=(i+1)/8*6.283,q=r*j/3*.95;pts.push(v5(Math.cos(a)*q,0,Math.sin(a)*q),v5(Math.cos(b)*q,0,Math.sin(b)*q))}
  const l=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col,transparent:true}));l.position.copy(gY(p,.07));scene.add(l);
  tw(ms,k=>{l.material.opacity=k<.1?k*10:k>.8?(1-k)/.2:1;l.scale.setScalar(k<.1?.3+7*k:1)},()=>{scene.remove(l);l.geometry.dispose();l.material.dispose()})}
// a translucent dome around the hero (wire = faceted shell)
function fxDome(getP,col,r,ms,wire){const mat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.3,wireframe:!!wire,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),mat);m.userData.lpsSkip=1;scene.add(m);tw(ms,k=>{const P=getP();m.position.set(P.x,P.y+.9,P.z);m.scale.setScalar(k<.2?k/.2:1);m.rotation.y=k*2;mat.opacity=.32*(1-Math.max(0,(k-.6)/.4))},()=>{scene.remove(m);m.geometry.dispose();mat.dispose()})}
// a projectile's look: hide the default lump, ride along a custom mesh + a trail
function fxShot(sh,make,trail){if(!sh||!sh.m)return;try{sh.m.material.opacity=.25}catch(_){}const o=make();o.userData.lpsSkip=1;sh.m.add(o);
  if(trail){let t=0;const tick=()=>{if(!sh.m.parent)return;t++;if(t%2==0)burst(sh.m.position.clone(),trail,2,.3,.2,.35);setTimeout(tick,40)};tick()}}
// ---------- motions: keys [k, channels]; z/zL forward (tiles / × lunge reach), y lift (× body height), ry spin, rz roll, rx pitch ----------
var MV105={
 snap:{D:360,h:.55,K:[[0,{}],[.33,{nk:-.25,hd:-.2,fh:-.3,hk:.4,by:-.1,tl:-.3,z:-.12,rx:-.12}],[.55,{nk:.55,hd:.45,jw:.9,fh:-.55,hh:.3,by:-.14,zL:1,rx:.42}],[.66,{nk:.5,hd:.4,jw:.2,zL:1,rx:.35,by:-.1}],[1,{}]]},
 pounce:{D:560,h:.62,K:[[0,{}],[.28,{fh:-.15,fk:.6,hh:-.25,hk:.8,by:-.18,tl:-.2,rx:.1,z:-.1}],[.45,{fh:-.9,hh:.75,nk:-.2,jw:.5,y:.7,zL:.6,rx:-.35}],[.62,{fh:-.4,fk:.3,hh:-.3,hk:.5,jw:.9,nk:.3,zL:1,y:0,rx:.3}],[.75,{by:-.08,zL:1,rx:.1}],[1,{}]]},
 frenzy:{D:640,h:.3,K:[[0,{}],[.2,{nk:-.2,hd:-.2,z:-.08,by:-.06}],[.3,{nk:.5,hd:.4,jw:.9,zL:.9,rx:.3,sp:.35}],[.4,{nk:.2,jw:.2,zL:.85,rx:.1,sp:-.1}],[.5,{nk:.5,hd:.4,jw:.9,zL:.95,rx:.32,sp:-.4}],[.6,{nk:.2,jw:.2,zL:.85,rx:.1,sp:.1}],[.7,{nk:.55,hd:.45,jw:.95,zL:1,rx:.36,sp:.3}],[.82,{zL:.6,jw:.1}],[1,{}]]},
 gulp:{D:620,h:.42,K:[[0,{}],[.25,{nk:-.35,hd:-.3,jw:.4,ex:.1,z:-.1,rx:-.15}],[.42,{nk:.5,hd:.4,jw:1.2,zL:1,rx:.4,by:-.08}],[.6,{nk:-.45,hd:-.5,jw:.1,zL:.7,rx:-.3,ex:.15}],[.75,{nk:-.3,hd:-.3,jw:0,ex:.12,rx:-.15}],[1,{}]]},
 coil:{D:500,h:.62,K:[[0,{}],[.4,{nk:-.5,hd:-.35,ch:-.15,z:-.2,rx:-.3,sp:.2,tl:.3}],[.5,{nk:-.55,hd:-.4,z:-.24,rx:-.34,sp:-.15}],[.62,{nk:.6,hd:.5,jw:.95,zL:1.05,rx:.45}],[.74,{nk:.4,jw:.3,zL:.9,rx:.3}],[1,{}]]},
 maul:{D:680,h:.62,K:[[0,{}],[.35,{fh:-1.1,fk:.9,hk:.4,nk:-.3,jw:.5,rx:-.7,y:.15,z:-.1}],[.48,{fh:-1.2,fk:1,rx:-.85,y:.35,zL:.4,jw:.7}],[.62,{fh:.3,fk:.2,nk:.4,hd:.3,jw:.9,rx:.25,zL:1,by:-.12}],[.76,{by:-.08,zL:1,rx:.1}],[1,{}]]},
 devour:{D:820,h:.4,osc:['rz',.35,5,.42,.72],K:[[0,{}],[.28,{nk:-.3,hd:-.3,jw:.6,z:-.15,rx:-.2,by:-.05}],[.4,{nk:.55,hd:.45,jw:1.1,zL:1,rx:.4}],[.72,{nk:.45,hd:.3,jw:.5,zL:.9,rx:.3}],[.85,{nk:-.3,hd:-.3,jw:.1,zL:.4,rx:-.15,ex:.1}],[1,{}]]},
 kiss:{D:600,h:.72,K:[[0,{}],[.4,{nk:-.1,hd:.2,sp:.25,zL:.5,by:-.04}],[.6,{nk:-.2,hd:-.1,sp:-.2,zL:.6}],[.72,{nk:.5,hd:.45,jw:.8,zL:1,rx:.35}],[.84,{zL:.8,jw:.1}],[1,{}]]},
 howl:{D:950,h:.45,osc:['nk',.05,8,.35,.8],K:[[0,{}],[.3,{pv:-.35,hh:.4,hk:.7,fh:-.25,nk:-.75,hd:-.45,jw:.2,by:-.08,rx:-.25,tl:-.2}],[.45,{pv:-.35,hh:.4,hk:.7,fh:-.25,nk:-.85,hd:-.5,jw:.95,by:-.08,rx:-.3,ex:.12}],[.8,{pv:-.3,hh:.35,hk:.6,nk:-.8,hd:-.45,jw:.9,by:-.06,rx:-.28}],[1,{}]]},
 roar:{D:760,h:.5,K:[[0,{}],[.35,{nk:-.6,hd:-.45,jw:.3,ex:.14,pv:-.12,rx:-.3,z:-.15,tl:-.3}],[.5,{nk:.45,hd:.35,jw:1.2,ex:.06,fh:-.2,rx:.2,z:.25}],[.75,{nk:.35,hd:.3,jw:1.0,rx:.15,z:.2}],[1,{}]]},
 stomp:{D:680,h:.6,K:[[0,{}],[.4,{fh:-1.05,fk:.9,hk:.35,nk:-.3,jw:.4,rx:-.6,y:.2}],[.6,{fh:.35,fk:.1,nk:.35,hd:.3,jw:.7,rx:.18,by:-.14}],[.7,{by:-.12,rx:.12}],[1,{}]]},
 spit:{D:440,h:.55,K:[[0,{}],[.38,{nk:-.5,hd:-.4,ch:-.1,ex:.1,rx:-.18,z:-.08,tl:-.2}],[.55,{nk:.45,hd:.35,jw:1.0,ch:.08,rx:.12,z:.1}],[.7,{nk:.3,jw:.6,rx:.06}],[1,{}]]},
 breath:{D:820,h:.32,osc:['sp',.4,2,.32,.85],K:[[0,{}],[.25,{nk:-.45,hd:-.35,ex:.16,rx:-.22,tl:-.3}],[.32,{nk:.35,hd:.25,jw:1.1,rx:.1,z:.1}],[.85,{nk:.3,hd:.2,jw:1.05,rx:.08,z:.1}],[1,{}]]},
 spin:{D:600,h:.5,K:[[0,{}],[.2,{by:-.08,ry:-.6,sp:.3}],[.75,{ry:6.283,sp:-.3,jw:.6,nk:.2}],[1,{ry:6.283}]]},
 shell:{D:760,h:.5,K:[[0,{}],[.3,{by:-.22,nk:.45,hd:.3,fh:.3,hk:.5,rx:.15,tl:-.4}],[.5,{by:-.26,nk:.5,hd:.35,fh:.35,hk:.55,rx:.18,ex:.1}],[.8,{by:-.2,nk:.4,rx:.12}],[1,{}]]},
 rise:{D:900,h:.5,wing:1.2,K:[[0,{}],[.3,{y:.55,nk:-.4,hd:-.3,jw:.3,rx:-.25,tl:.3}],[.5,{y:.7,nk:-.5,hd:-.35,jw:.8,rx:-.3}],[.8,{y:.55,nk:-.3,rx:-.15}],[1,{}]]},
 dive:{D:680,h:.62,wing:1.3,K:[[0,{}],[.35,{y:.9,rx:-.35,nk:-.3,z:-.2}],[.62,{y:.1,rx:.5,nk:.4,jw:.7,zL:1.1}],[.78,{y:0,rx:.15,zL:.8}],[1,{}]]},
 channel:{D:860,h:.4,K:[[0,{}],[.25,{y:.2,nk:-.35,hd:-.25,ex:.08,rx:-.15}],[.4,{y:.25,nk:.25,hd:.2,jw:.7,rx:.08,z:.1}],[.85,{y:.22,nk:.22,jw:.6,rx:.06,z:.1}],[1,{}]]},
 toss:{D:640,h:.55,K:[[0,{}],[.35,{nk:.6,hd:.5,jw:.4,rx:.35,by:-.1,z:.1}],[.55,{nk:-.7,hd:-.5,jw:.9,rx:-.35,y:.15}],[.7,{nk:-.4,rx:-.15}],[1,{}]]},
 shake:{D:540,h:.5,osc:['rz',.28,6,.15,.55],K:[[0,{}],[.15,{ex:.15,by:-.05}],[.5,{ex:.1,nk:.2,jw:.6}],[1,{}]]},
 bow:{D:860,h:.5,K:[[0,{}],[.35,{nk:.55,hd:.4,fh:-.2,fk:.4,by:-.12,rx:.25}],[.55,{nk:-.45,hd:-.35,jw:.3,y:.1,rx:-.2,ex:.1}],[.85,{nk:-.3,rx:-.1}],[1,{}]]},
 puff:{D:760,h:.55,K:[[0,{}],[.4,{ex:.28,nk:-.2,hd:-.2,rx:-.1,by:.02}],[.55,{ex:-.05,nk:.35,hd:.3,jw:1.0,rx:.12}],[.85,{nk:.2,jw:.5}],[1,{}]]},
 hop:{D:520,h:.55,K:[[0,{}],[.25,{by:-.12,fk:.4,hk:.5}],[.45,{y:.45,nk:-.2,jw:.4}],[.6,{y:0,nk:.3,jw:.8,rx:.1}],[1,{}]]}};
var MVCH105=['nk','hd','jw','ch','sp','pv','ex','fh','fk','hh','hk','by','tl','ty','paw'];
function mvEval105(M,k,A,L){const K=M.K;let i=0;while(i<K.length-2&&k>K[i+1][0])i++;const a=K[i],b=K[i+1],t0=(k-a[0])/((b[0]-a[0])||1),t=t0<=0?0:t0>=1?1:t0*t0*(3-2*t0),o={},B={z:0,y:0,ry:0,rz:0,rx:0};
  const ch=new Set(Object.keys(a[1]).concat(Object.keys(b[1])));ch.forEach(c=>{const v=(a[1][c]||0)+((b[1][c]||0)-(a[1][c]||0))*t;if(c=='zL')B.z+=v*L;else if(c in B)B[c]+=c=='ry'?v:v*A;else o[c]=v*A});
  if(M.osc){const [c,amp,f,f0,f1]=M.osc;if(k>f0&&k<f1){const e=Math.sin((k-f0)/(f1-f0)*Math.PI),v=Math.sin((k-f0)/(f1-f0)*f*6.283)*amp*e*A;if(c in B)B[c]+=v;else o[c]=(o[c]||0)+v}}
  return [o,B]}
// play a motion on a follower model; onHit fires once at the strike moment
function mvPlay105(a,R,to,onHit){const M=MV105[R.m]||MV105.snap,D=M.D*(R.d||1),A=R.a||1,L=to?Math.max(0,V().subVectors(to,a.position).setY(0).length()-1.1):0;let hit=0;
  const S={M,k:0,A,L:Math.min(4,L)*(R.zr||1),sgn:R.sg||1};a._m105=S;
  tw(D,k=>{S.k=k;if(!hit&&k>=M.h){hit=1;try{onHit()}catch(e){console.warn('v105 cast',e)}}},()=>{if(!hit){hit=1;try{onHit()}catch(e){console.warn('v105 cast',e)}}a._m105=null;try{a.b.position.z=0;a.b.rotation.set(0,0,0)}catch(_){}})}
{const f=rigAnim;rigAnim=function(x,now,mv,sp){f.apply(this,arguments);try{const g=x.g,S=g&&g._m105;if(!S)return;const [o,B]=mvEval105(S.M,S.k,S.A,S.L);const Lm=gaLegLen(x.spec);
    crApply(x,o,Lm);x.b.position.z=B.z;x.b.position.y+=B.y*Lm*2.2;x.b.rotation.set(B.rx,B.ry*S.sgn,B.rz);
    if(S.M.wing&&x.wings)x.wings.forEach(w=>{if(w.p)w.p.rotation.z+=Math.sin(now/45)*.5*w.s*S.M.wing})}catch(e){}}}
// ---------- the recipes ----------
// ctx: c companion, f its model, sp spell, t target (may be null), P companion position, d facing, tp target position, hp hero position
const HP5=()=>pl.position;
var SPX105={
 'Hamstring Bite':{m:'snap',a:.9,fx(x){if(!x.tp)return;fxClaw(x.tp,x.d,0xe8833a,2,.8,280);x5('ring',0x9ad8ff,900,(k,m)=>{const p=x.t&&x.t.m?x.t.m.position:x.tp;m.position.set(p.x,p.y+.15,p.z);m.scale.setScalar(.9+.15*Math.sin(k*20));m.material.opacity=.8*(1-k)},{p:x.tp.clone(),r:[-Math.PI/2,0,0]})}},
 'Howling Rend':{m:'spin',a:.6,d:.8,zr:0,fx(x){for(let i=-1;i<=1;i++){const d=fwd5(x.d,i*.45);fxClaw(x.P.clone().addScaledVector(d,1.6),d,0xd04a4a,3,1.1,320)}fxWaves(gY(x.P,.6),x.d,0xd04a4a,2,2.6,320,.9)}},
 'Cinder Pounce':{m:'pounce',a:1.15,start(x){let n=0;const tick=()=>{if(n++>10)return;burst(gY(x.f.position,.5),0xff7a2a,4,.4,.6,.35);setTimeout(tick,45)};tick()},fx(x){if(!x.tp)return;fxPillar(x.tp,0xff7a2a,.7,2.2,420);ring(x.tp,0xffb040,2.4,400);burst(gY(x.tp,.4),0xff5a1a,26,2,2.2,.6)}},
 'Rending Frenzy':{m:'frenzy',fx(x){if(!x.tp)return;[0,1,2].forEach(i=>setTimeout(()=>{if(!x.t||!x.t.m)return;fxClaw(x.t.m.position,fwd5(x.d,(i-1)*.6),0xe04a4a,3,.7+.15*i,200)},i*160))}},
 'Moon Devour':{m:'howl',a:.85,d:.9,start(x){x5('disc',0x9a7aff,950,(k,m)=>{const p=x.f.position;m.position.set(p.x,p.y+2.3+k*.4,p.z);m.scale.setScalar(.2+Math.min(1,k*3)*.9);m.material.opacity=.85*(1-Math.max(0,(k-.7)/.3));m.lookAt(cam.position)},{p:x.P.clone()})},
  fx(x){ring(x.P,0x9a7aff,6,520);enemies.forEach(e=>{if(e.dead||d2(e.m.position,x.P)>3.2)return;const q=gY(e.m.position,.8);for(let i=0;i<4;i++)setTimeout(()=>x5('oct',0xc8a0ff,420,(k,m)=>{const p=gY(x.f.position,.6);m.position.copy(q.clone().lerp(p,k));m.position.y+=Math.sin(k*Math.PI)*.6;m.scale.setScalar(.14);m.material.opacity=1-k*.5},{p:q}),i*70)})}},
 'Stone Ward':{m:'shell',fx(x){fxOrbit(HP5,7,1.15,.9,800,6,(i,fn)=>x5('dod',0x9a8a70,800,(k,m)=>{fn(k,m);m.scale.setScalar(.22*(1-Math.max(0,(k-.7)/.3)));m.rotation.x+=.1},{add:0}));setTimeout(()=>fxDome(HP5,0xc0b090,1.2,1400,1),600)}},
 'Bog Spit':{m:'spit',shot(sh){fxShot(sh,()=>{const g=new THREE.Mesh(g105().dod,new THREE.MeshLambertMaterial({color:0x5a8a3a}));g.scale.setScalar(.36);return g},0x7acc5a)},fx(x){burst(gY(x.f.position,.7).addScaledVector(x.d,.6),0x7acc5a,10,1,.6,.4)}},
 'Quake Stomp':{m:'stomp',fx(x){fxCracks(gY(x.P,0),0xc8a070,9,3,700);ring(x.P,0xc8a070,5.6,420);burst(gY(x.P,.2),0x8a7050,30,3,1.4,.6);shake(.12)}},
 'Swallow':{m:'gulp',fx(x){if(!x.tp)return;fxJaws(x.tp,0x6a9a3a,1.3,420,Math.atan2(x.d.x,x.d.z));setTimeout(()=>{const p=x.f.position;burst(gY(p,.9),0x9aff7a,12,.6,1.2,.6)},300)}},
 "Mountain's Embrace":{m:'shell',a:1.25,d:1.15,fx(x){const p=pl.position.clone();for(let i=0;i<8;i++){const a=i/8*6.283;x5('box',0x8a8070,1600,(k,m)=>{const u=k<.2?k/.2:k>.8?(1-k)/.2:1;m.scale.set(.5,2.2*u,.5);m.position.set(p.x+Math.cos(a)*1.5,p.y+1.1*u,p.z+Math.sin(a)*1.5)},{p:p.clone(),add:0,r:[0,a,0]})}fxDome(HP5,0xb0a080,1.35,1600,0)}},
 'Sonic Screech':{m:'roar',a:.75,d:.85,fx(x){fxWaves(gY(x.P,.8),x.d,0xc0a0ff,5,3.4,380,.8);burst(gY(x.P,.9).addScaledVector(x.d,.5),0xe0d0ff,10,1.5,.5,.3)}},
 'Gale Dive':{m:'dive',fx(x){const a=gY(x.P,.6),b=a.clone().addScaledVector(x.d,8);for(let i=0;i<3;i++)x5('box',0xbfe8d0,360,(k,m)=>{m.position.copy(a.clone().lerp(b,.5));m.lookAt(b);m.scale.set(.06,.06,8*Math.min(1,k*3));m.position.y+=(i-1)*.25;m.material.opacity=.8*(1-k)},{p:a.clone()});
  fxRise(b.clone().lerp(a,.5),8,1.5,.8,700,(i,q,fn)=>x5emo('🪶',q,700,(k,s)=>fn(k,s),.35))}},
 'Night Drain':{m:'spit',a:.8,d:1.1,shot(sh){fxShot(sh,()=>{const g=new THREE.Group(),m=new THREE.Mesh(g105().sph,addMat(0x5a2aa0));m.scale.setScalar(.45);g.add(m);const c=new THREE.Mesh(g105().hook,addMat(0xc8a0ff));g.add(c);
    tw(1200,k=>{c.rotation.z=k*20},()=>{});return g},0x8a4aff)}},
 'Thunder Talon':{m:'rise',a:.6,d:.7,fx(x){if(!x.tp)return;const p=x.tp.clone();bolt(gY(p,9),gY(p,.4),0xfff06a);bolt(gY(p,9),gY(p,.4),0xffffff);ring(p,0xfff06a,2.6,300);burst(gY(p,.5),0xfff06a,20,2,2,.4)}},
 'Tempest':{m:'rise',a:1.1,d:1.15,zone(z,x){const T=(z.n||6)*(z.iv||.4)*1000;for(let i=0;i<5;i++){const a0=i/5*6.283;x5('blade',0xa0e0ff,T,(k,m)=>{const a=a0+k*14;m.position.set(z.p.x+Math.cos(a)*z.R*.7,z.p.y+.6+Math.sin(k*12+i)*.3,z.p.z+Math.sin(a)*z.R*.7);m.rotation.set(-Math.PI/2,0,-a);m.material.opacity=.85*(k<.1?k*10:k>.9?(1-k)*10:1)},{p:z.p.clone()})}}},
 'Ember Breath':{m:'breath',fx(x){fxStream(gY(x.f.position,.7).addScaledVector(x.d,.4),x.d,0xff7a2a,22,2.8,.5,620,'ico',.24)}},
 'Venom Fang':{m:'coil',fx(x){if(!x.tp)return;[-1,1].forEach(s=>x5('cone',0x8ad84a,360,(k,m)=>{m.position.set(x.tp.x+s*.15,x.tp.y+1.2-k*.6,x.tp.z);m.rotation.set(Math.PI,0,0);m.scale.set(.1,.4,.1);m.material.opacity=1-k},{p:x.tp.clone()}));
  for(let i=0;i<6;i++)setTimeout(()=>{if(x.t&&x.t.m)burst(gY(x.t.m.position,.9),0x8ad84a,2,.2,-.5,.6)},i*120)}},
 'Flame Burst':{m:'spit',a:1.2,d:1.2,start(x){x5('sph',0xff5a1a,400,(k,m)=>{const p=x.f.position;m.position.set(p.x+x.d.x*.5,p.y+.7,p.z+x.d.z*.5);m.scale.setScalar(.2+k*.35);m.material.opacity=.9},{p:x.P.clone()})},
  shot(sh){fxShot(sh,()=>{const g=new THREE.Group(),a=new THREE.Mesh(g105().ico,addMat(0xff5a1a)),b=new THREE.Mesh(g105().ico,addMat(0xffd060));a.scale.setScalar(.6);b.scale.setScalar(.32);g.add(a,b);tw(1300,k=>{a.rotation.y=k*12;b.rotation.x=k*15},()=>{});return g},0xff7a2a)}},
 'Toxic Cloud':{m:'puff',zone(z,x){const T=(z.n||8)*(z.iv||.5)*1000;for(let i=0;i<9;i++){const a=r5(0,6.283),r=r5(0,z.R*.8);x5('sph',0x9ad84a,T,(k,m)=>{m.position.set(z.p.x+Math.cos(a+k)*r,z.p.y+.35+Math.sin(k*6+i)*.15,z.p.z+Math.sin(a+k)*r);m.scale.setScalar(.9+.3*Math.sin(k*8+i));m.material.opacity=.32*(k<.1?k*10:k>.85?(1-k)/.15:1)},{p:z.p.clone()})}}},
 'Dragonfire':{m:'breath',a:1.3,d:1.15,start(x){x5('ring',0xff4a1a,600,(k,m)=>{const p=x.f.position;m.position.set(p.x,p.y+.05,p.z);m.rotation.x=-Math.PI/2;m.scale.setScalar(1+k*2);m.material.opacity=.7*(1-k)},{p:x.P.clone()})},
  fx(x){fxStream(gY(x.f.position,.8).addScaledVector(x.d,.4),x.d,0xff4a1a,34,3.6,.55,760,'ico',.34);fxStream(gY(x.f.position,.8).addScaledVector(x.d,.4),x.d,0xffd060,14,3.2,.4,700,'oct',.2);setTimeout(()=>fxRise(gY(x.P,0).addScaledVector(x.d,2.4),10,1.4,1.6,900,(i,q,fn)=>x5('oct',0xffb040,900,(k,m)=>{fn(k,m);m.scale.setScalar(.08)},{p:q})),300)}},
 'Wisp Bolt':{m:'hop',a:.7,shot(sh){fxShot(sh,()=>{const g=new THREE.Group();for(let i=0;i<3;i++){const m=new THREE.Mesh(g105().oct,addMat(0x9fe8ff));m.scale.setScalar(.18);g.add(m)}tw(1300,k=>g.children.forEach((m,i)=>{const a=k*25+i*2.1;m.position.set(Math.cos(a)*.22,Math.sin(a)*.22,0)}),()=>{});return g},0x9fe8ff)}},
 'Bone Shards':{m:'shake',shotAll:1,shot(sh){fxShot(sh,()=>{const g=new THREE.Group(),b=new THREE.Mesh(g105().bone,new THREE.MeshLambertMaterial({color:0xe8e0c8}));b.rotation.x=Math.PI/2;g.add(b);
    [-1,1].forEach(s=>{const k=new THREE.Mesh(g105().sph,new THREE.MeshLambertMaterial({color:0xe8e0c8}));k.scale.setScalar(.1);k.position.z=s*.22;g.add(k)});tw(900,k=>{g.rotation.z=k*30},()=>{});return g})}},
 'Radiance':{m:'bow',fx(x){fxPillar(pl.position,0xffe08a,.6,4,900);for(let i=0;i<6;i++){const a=i/6*6.283;x5('box',0xffe08a,700,(k,m)=>{const p=pl.position;m.position.set(p.x+Math.cos(a)*.6,p.y+1.5,p.z+Math.sin(a)*.6);m.rotation.set(0,-a,0);m.scale.set(.04,3*Math.min(1,k*3),.04);m.material.opacity=1-k},{p:pl.position.clone()})}
  fxRise(pl.position.clone(),10,.9,2,1000,(i,q,fn)=>x5emo('✨',q,1000,fn,.35))}},
 'Soul Siphon':{m:'channel',fx(x){if(!x.t)return;const T=x.t;fxBeam(()=>gY(x.f.position,.7),()=>gY(T.m?T.m.position:x.tp,.9),0xb07aff,.14,700,0xe0c8ff);
  fxRise(gY(x.tp,.6),3,.4,.8,700,(i,q,fn)=>x5emo('👻',q,700,fn,.4))}},
 'Spectral Ward':{m:'howl',a:.55,d:.8,fx(x){fxOrbit(HP5,6,1.1,1.1,1400,4,(i,fn)=>x5('cone',0xb0a0ff,1400,(k,m)=>{fn(k,m);m.scale.set(.1,.32,.1);m.material.opacity=.9*(1-Math.max(0,(k-.8)/.2))},{}));ring(pl.position,0xb0a0ff,4,500)}},
 'Spore Puff':{m:'shake',a:1.2,d:1.1,fx(x){fxRise(gY(x.P,0),14,1.6,1.4,900,(i,q,fn)=>x5('sph',[0xc08aff,0xe0b0ff][i%2],900,(k,m)=>{fn(k,m);m.scale.setScalar(.18+k*.25)},{p:q}));x5emo('🍄',gY(x.P,1.4),700,(k,s)=>{s.position.y+=.01;s.material.opacity=1-k},.55)}},
 'Web Snare':{m:'spit',a:.7,d:.9,shot(sh,x){fxShot(sh,()=>{const g=new THREE.Mesh(g105().sph,addMat(0xe8e8ff));g.scale.setScalar(.3);return g});if(x.tp){const tt=Math.min(1.1,x.P.distanceTo(x.tp)/12)*1000;setTimeout(()=>{const p=x.t&&x.t.m?x.t.m.position.clone():x.tp;fxWeb(p,0xe8e8ff,1.1,2100)},tt)}}},
 'Choking Spores':{m:'puff',a:1.2,d:1.1,zone(z,x){const T=(z.n||8)*(z.iv||.5)*1000;fxFall(z.p,26,z.R*.85,2.6,T,(i,q,fn)=>x5('oct',[0x7ad8a0,0xa0e8c0][i%2],T*.45,(k,m)=>{fn(k,m);m.scale.setScalar(.1)},{p:q}))}},
 "Widow's Kiss":{m:'kiss',fx(x){if(!x.tp)return;x5emo('💋',gY(x.tp,1.6),700,(k,s)=>{s.position.y+=.008;s.material.opacity=1-k;s.scale.setScalar(.5+k*.3)},.5);burst(gY(x.tp,.9),0xd02a4a,16,1.2,1,.5);
  for(let i=0;i<5;i++)setTimeout(()=>{if(x.t&&x.t.m)burst(gY(x.t.m.position,.9),0xd02a4a,2,.2,-.4,.7)},200+i*140)}},
 'Brood Swarm':{m:'channel',a:1.1,d:.9,zone(z,x){const T=(z.n||8)*(z.iv||.4)*1000;for(let i=0;i<10;i++){const a0=r5(0,6.283),rr=r5(.4,z.R*.9);x5emo('🐝',z.p.clone(),T,(k,s)=>{const a=a0+k*18*(i%2?1:-1);s.position.set(z.p.x+Math.cos(a)*rr,z.p.y+.6+Math.sin(k*30+i)*.25,z.p.z+Math.sin(a)*rr);s.material.opacity=k>.9?(1-k)*10:1},.32)}}},
 'Pack Howl':{m:'howl',a:1.1,d:1.1,fx(x){for(let i=0;i<4;i++)setTimeout(()=>x5('ring',0xffb060,700,(k,m)=>{const p=pl.position;m.position.set(p.x,p.y+.2+k*2,p.z);m.rotation.x=-Math.PI/2;m.scale.setScalar(1.6-k*.6);m.material.opacity=.9*(1-k)},{p:pl.position.clone()}),i*140);
  fxRise(pl.position.clone(),5,1,1.6,900,(i,q,fn)=>x5emo('🐾',q,900,fn,.4))}},
 'Savage Pounce':{m:'maul',fx(x){if(!x.tp)return;ring(x.tp,0xe8833a,3,320);burst(gY(x.tp,.4),0xe8c08a,24,2.4,1.5,.5);shake(.15);const T=x.t;fxOrbit(()=>T&&T.m?gY(T.m.position,1.6):x.tp,3,.35,0,1100,9,(i,fn)=>x5emo('💫',x.tp.clone(),1100,fn,.3))}},
 'Alpha Roar':{m:'roar',a:1.3,d:1.15,fx(x){x5('sph',0xffa040,620,(k,m)=>{m.position.copy(gY(x.P,.5));m.scale.setScalar(.5+k*6.5);m.material.opacity=.4*(1-k)},{p:x.P.clone()});fxWaves(gY(x.P,.7),x.d,0xffa040,3,3.8,420,1.6);burst(gY(x.P,.2),0xc8a070,30,3.6,.8,.6);shake(.2)}},
 'Earthen Bulwark':{m:'stomp',a:.6,d:.9,fx(x){const p=pl.position.clone();for(let i=0;i<12;i++){const a=i/12*6.283;x5('box',0xa09070,1500,(k,m)=>{const u=k<.25?k/.25:k>.8?(1-k)/.2:1;m.scale.set(.55,.9*u,.32);m.position.set(p.x+Math.cos(a)*1.25,p.y+.45*u+(i%2)*.0,p.z+Math.sin(a)*1.25)},{p:p.clone(),add:0,r:[0,-a+Math.PI/2,0]})}}},
 'Boulder Toss':{m:'toss',shot(sh){fxShot(sh,()=>{const g=new THREE.Mesh(g105().dod,new THREE.MeshLambertMaterial({color:0x8a8070}));g.scale.setScalar(.55);tw(1300,k=>{g.rotation.x=k*14;g.rotation.y=k*9},()=>{});return g},0xa09070)}},
 'Tectonic Slam':{m:'stomp',a:1.3,d:1.2,fx(x){fxSpikes(gY(x.P,0),0x8a7a60,12,3.4,1.4,900,3);fxCracks(gY(x.P,0),0xc08050,12,3.6,900);ring(x.P,0xc08050,7,500);shake(.28)}},
 'Tailwind':{m:'rise',a:.7,d:.9,fx(x){for(let i=0;i<3;i++){const ph=i*2.1;for(let j=0;j<10;j++)x5('box',0xbfe8ff,900,(k,m)=>{const p=pl.position,a=ph+k*12+j*.25,y=.2+j*.17;m.position.set(p.x+Math.cos(a)*(.7+j*.03),p.y+y,p.z+Math.sin(a)*(.7+j*.03));m.rotation.y=-a;m.scale.set(.25,.03,.03);m.material.opacity=.8*(1-k)},{p:pl.position.clone()})}}},
 'Cyclone':{m:'spin',a:1,d:1.5,sg:-1,fx(x){const f=x.f;fxTornado(()=>f.position,0xbfe8d0,2.6,1.6,900);burst(gY(x.P,.3),0xbfe8d0,20,3,.6,.5)}},
 'Skyfall':{m:'rise',a:1.25,d:1.05,zone(z,x){const T=(z.n||6)*(z.iv||.4)*1000;fxFall(z.p,18,z.R*.9,5,T,(i,q,fn)=>x5('oct',0xffe8a0,T*.35,(k,m)=>{fn(k,m);m.scale.set(.08,.3,.08)},{p:q}))}},
 'Scale Armor':{m:'shell',a:.7,d:.85,fx(x){fxOrbit(HP5,10,.9,1.0,900,7,(i,fn)=>x5('hex',0xd04a2a,900,(k,m)=>{fn(k,m);m.lookAt(cam.position);m.material.opacity=1-Math.max(0,(k-.7)/.3)},{}));setTimeout(()=>fxDome(HP5,0xd04a2a,1.05,1200,1),500)}},
 'Inferno':{m:'breath',a:1.15,d:1.3,fx(x){fxStream(gY(x.f.position,.8).addScaledVector(x.d,.4),x.d,0xff5a1a,40,3.6,.7,900,'ico',.3);setTimeout(()=>x5('disc',0x3a1a10,1600,(k,m)=>{m.material.opacity=.5*(1-k)},{p:gY(x.P,.04).addScaledVector(x.d,2),s:3,r:[-Math.PI/2,0,0],add:0}),400)}},
 'Cataclysm':{m:'roar',a:1.1,d:1.3,sg:1,fx(x){if(!x.tp)return;const p=x.tp.clone(),T=(x.sp.delay||1)*1000;x5('dod',0xff4a1a,T,(k,m)=>{m.position.set(p.x+6*(1-k),p.y+14*(1-k)+.3,p.z-3*(1-k));m.scale.setScalar(.9);m.rotation.x=k*10;if(Math.random()<.5)burst(m.position.clone(),0xff7a2a,2,.3,.3,.4)},{p:p.clone()})}},
 'Mend':{m:'bow',a:.8,d:1.05,fx(x){fxRise(pl.position.clone(),9,.9,1.8,1100,(i,q,fn)=>x5emo('💖',q,1100,fn,.38));ring(pl.position,0x9affb0,2.6,600)}},
 'Hex':{m:'coil',a:.7,d:1.2,fx(x){if(!x.t)return;const T=x.t;const g=fxSigil(x.tp,0xb07aff,1.0,1500,5);tw(1500,()=>{if(T.m)g.position.set(T.m.position.x,T.m.position.y+.06,T.m.position.z)},()=>{});x5emo('👁️',gY(x.tp,1.9),1200,(k,s)=>{if(T.m)s.position.copy(gY(T.m.position,1.9+Math.sin(k*6)*.1));s.material.opacity=1-Math.max(0,(k-.7)/.3)},.45)}},
 'Requiem':{m:'howl',a:1.2,d:1.3,fx(x){for(let i=0;i<3;i++)setTimeout(()=>ring(x.P,0x9a7aff,6.5,600),i*200);fxRise(gY(x.P,.4),9,2.6,1.8,1200,(i,q,fn)=>x5emo(['🎵','🎶'][i%2],q,1200,fn,.4))}},
 'Regrowth':{m:'bow',a:1.15,d:.95,fx(x){const p=pl.position.clone();for(let i=0;i<8;i++){const a=i/8*6.283;x5('cone',0x4a9a3a,1100,(k,m)=>{const u=k<.3?k/.3:k>.8?(1-k)/.2:1;m.position.set(p.x+Math.cos(a)*.9,p.y,p.z+Math.sin(a)*.9);m.scale.set(.1,1.1*u,.1);m.rotation.set(Math.sin(a)*.3,0,-Math.cos(a)*.3)},{p:p.clone(),add:0})}
  fxRise(p,8,1,1.6,1000,(i,q,fn)=>x5emo('🍃',q,1000,fn,.35))}},
 'Plague':{m:'puff',a:1.4,d:1.25,zone(z,x){const T=(z.n||8)*(z.iv||.5)*1000;for(let i=0;i<8;i++){const a0=i/8*6.283;x5('sph',0x4a6a2a,T,(k,m)=>{const a=a0+k*5;m.position.set(z.p.x+Math.cos(a)*z.R*.6,z.p.y+.4+Math.sin(k*7+i)*.2,z.p.z+Math.sin(a)*z.R*.6);m.scale.setScalar(1.1);m.material.opacity=.35*(k<.1?k*10:k>.85?(1-k)/.15:1)},{p:z.p.clone()})}
  for(let i=0;i<4;i++)x5emo('💀',z.p.clone(),T,(k,s)=>{const a=i*1.57-k*7;s.position.set(z.p.x+Math.cos(a)*z.R*.45,z.p.y+1+Math.sin(k*9+i)*.2,z.p.z+Math.sin(a)*z.R*.45);s.material.opacity=k>.9?(1-k)*10:.9},.38)}},
 'Devour':{m:'devour',fx(x){if(!x.tp)return;fxJaws(x.tp,0xc02a4a,1.8,520,Math.atan2(x.d.x,x.d.z));setTimeout(()=>{if(!x.t||!x.t.m)return;const q=gY(x.t.m.position,.8);for(let i=0;i<6;i++)setTimeout(()=>x5('oct',0xff6a8a,420,(k,m)=>{m.position.copy(q.clone().lerp(gY(x.f.position,.7),k));m.scale.setScalar(.13);m.material.opacity=1-k*.4},{p:q}),i*60)},280)}}
};
// which kinds need a live target at the strike moment
var SPXT105={bite:1,rain:1,chain:1,meteor:1};
{const orig=compCast;compCast=function(c,f,sp,t){const name=Object.keys(CSP).find(k=>CSP[k]===sp),R=name&&SPX105[name];
  if(!FX105.on||!R||!f||!f.b||f._bo)return orig.apply(this,arguments);
  const P=f.position.clone(),tp=t&&t.m?t.m.position.clone():null;if(tp){const w=V(tp.x-P.x,0,tp.z-P.z);if(w.lengthSq()>0)f.rotation.y=Math.atan2(w.x,w.z)}
  const d=tp?V(tp.x-P.x,0,tp.z-P.z).normalize():V(Math.sin(f.rotation.y),0,Math.cos(f.rotation.y)),x={c,f,sp,t,P,d,tp,col:sp.col};
  try{R.start&&R.start(x)}catch(e){console.warn('v105 fx',e)}
  const fire=()=>{const n0=shots.length,z0=zones.length;
    try{orig(c,f,sp,x.t)}catch(e){console.warn('v105 cast',e)}
    x.P=f.position.clone();if(x.t&&x.t.m)x.tp=x.t.m.position.clone();
    try{R.fx&&R.fx(x)}catch(e){console.warn('v105 fx',e)}
    try{if(R.shot)shots.slice(n0).forEach((sh,i)=>{if(i==0||R.shotAll)R.shot(sh,x)})}catch(e){console.warn('v105 fx',e)}
    try{if(R.zone&&zones.length>z0)R.zone(zones[zones.length-1],x)}catch(e){console.warn('v105 fx',e)}};
  if(sp.k=='bite'){const L0=lunge;lunge=function(a,to,done){mvPlay105(a,R,to,()=>{done&&done();x.P=f.position.clone();if(x.t&&x.t.m)x.tp=x.t.m.position.clone();try{R.fx&&R.fx(x)}catch(e){console.warn('v105 fx',e)}})};
    try{orig(c,f,sp,t)}finally{lunge=L0}return}
  f.lk=1;mvPlay105(f,R,tp,()=>{f.lk=0;if(x.t&&(x.t.dead||!enemies.includes(x.t))){const n=teamFoe();x.t=n&&!n.dead&&d2(n.m.position,f.position)<9?n:null}
    if(SPXT105[sp.k]&&!x.t)return;fire()})}}
