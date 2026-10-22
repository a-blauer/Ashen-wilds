// ================= v117 character creator: the class step shows the hero as they will start, in a heroic pose =================
// The old class-step preview (0140 ccPreview) built one model once, framed it on the first class, read the look from the wrong field
// and dressed it in a temporary tier-1 armour set. Now every class gets its own model built the way the game builds the hero: the
// class's animal (current beast rig) wearing exactly the starting gear (ccBegin: tier-0 weapon and chest, paladin shield) and the look
// chosen so far, framed on its own body. Each class holds a heroic pose with effects of its own on a lit pedestal.
// The pose is put back before every frame (like the v117 frog hold), so the beast layer's exact-value undo never sees it.
var CC116={h:null,cache:{},tex:null,
  // arm channels set outright (the v2 creator's values were tuned the same way), others added to the idle pose
  P:{warrior:{set:{'aR0.x':-2.75,'aR0.z':-.18,'aR1.x':-.25,'aL0.x':-.45,'aL0.z':.42,'aL1.x':-1.15},add:{'chest.x':-.08,'head.x':-.1}},
     paladin:{set:{'aL0.x':-.35,'aL0.z':.55,'aL1.x':-.5,'aR0.x':-2.45,'aR0.z':-.22,'aR1.x':-.45},add:{'chest.x':-.06,'head.x':-.06}},
     assassin:{set:{'aR0.x':-.95,'aR0.z':.85,'aR1.x':-.55,'aL0.x':-.7,'aL0.z':-.95,'aL1.x':-.7},add:{'spine.x':.22,'head.x':-.18,'spine.y':.12}},
     mage:{set:{'aR0.x':-2.6,'aR0.z':-.3,'aR1.x':-.2,'aL0.x':-1.3,'aL0.z':-.6,'aL1.x':-.25},add:{'head.x':-.12,'chest.x':-.05}},
     ranger:{set:{'aL0.x':-1.55,'aL0.z':.05,'aL1.x':-.05,'aR0.x':-1.45,'aR0.z':-.1,'aR1.x':-2.1},add:{'spine.y':-.45,'head.y':.4}}},
  // effect colours per class
  FX:{warrior:{a:0xff6a2a,b:0xffc060,kind:'embers'},paladin:{a:0xffe08a,b:0xfff6d0,kind:'holy'},assassin:{a:0x6a2a9a,b:0x7cff6a,kind:'shadow'},
      mage:{a:0x7a8cff,b:0xd08aff,kind:'arcane'},ranger:{a:0x7ac050,b:0xd8e070,kind:'leaves'}}};
function cc116Tex(){if(CC116.tex)return CC116.tex;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return CC116.tex=new THREE.CanvasTexture(c)}
function cc116Pts(n,col,size,blend,op){const g=new THREE.BufferGeometry(),P=new Float32Array(n*3),S=new Float32Array(n*4);for(let i=0;i<n;i++){S[i*4]=Math.random();S[i*4+1]=Math.random();S[i*4+2]=Math.random();S[i*4+3]=Math.random()}
  g.setAttribute('position',new THREE.BufferAttribute(P,3));const m=new THREE.PointsMaterial({color:col,size,map:cc116Tex(),transparent:true,opacity:op==null?.9:op,depthWrite:false,blending:blend==null?THREE.AdditiveBlending:blend,sizeAttenuation:true});
  const o=new THREE.Points(g,m);o.userData.seed=S;o.frustumCulled=false;return o}
function cc116Fx(cls,piv){const F=CC116.FX[cls]||CC116.FX.warrior,G=new THREE.Group(),L=[];piv.add(G);
  const glow=new THREE.Mesh(new THREE.CircleGeometry(.95,40),new THREE.MeshBasicMaterial({color:F.a,map:cc116Tex(),transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending}));glow.rotation.x=-Math.PI/2;glow.position.y=.012;G.add(glow);
  if(F.kind=='embers'){const a=cc116Pts(70,F.a,.07),b=cc116Pts(30,F.b,.05);G.add(a,b);L.push((t)=>[a,b].forEach((p,j)=>{const P=p.geometry.attributes.position,S=p.userData.seed;for(let i=0;i<P.count;i++){const u=(S[i*4]+t*(.18+S[i*4+1]*.25))%1,r=.25+S[i*4+2]*.55,an=S[i*4+3]*6.28+t*.4;P.setXYZ(i,Math.cos(an)*r,u*2.1,Math.sin(an)*r)}P.needsUpdate=true;p.material.opacity=.9}))}
  if(F.kind=='holy'){const col=new THREE.Mesh(new THREE.CylinderGeometry(.55,.75,3.2,24,1,true),new THREE.MeshBasicMaterial({color:F.a,transparent:true,opacity:.1,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));col.position.y=1.6;G.add(col);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(.34,.02,6,40),new THREE.MeshBasicMaterial({color:F.b,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false}));halo.rotation.x=Math.PI/2;halo.position.y=1.98;G.add(halo);
    const m=cc116Pts(50,F.b,.05);G.add(m);L.push(t=>{col.material.opacity=.08+.04*Math.sin(t*1.8);halo.position.y=1.98+.03*Math.sin(t*1.3);halo.rotation.z=t*.4;
      const P=m.geometry.attributes.position,S=m.userData.seed;for(let i=0;i<P.count;i++){const u=(S[i*4]+t*.08*(1+S[i*4+1]))%1,r=.15+S[i*4+2]*.5,an=S[i*4+3]*6.28;P.setXYZ(i,Math.cos(an)*r,u*2.4,Math.sin(an)*r)}P.needsUpdate=true})}
  if(F.kind=='shadow'){const s=cc116Pts(46,F.a,.42,THREE.NormalBlending,.35),g2=cc116Pts(16,F.b,.05);G.add(s,g2);L.push(t=>{[s,g2].forEach((p,j)=>{const P=p.geometry.attributes.position,S=p.userData.seed;
      for(let i=0;i<P.count;i++){const u=(S[i*4]+t*(j?.25:.07))%1,an=S[i*4+3]*6.28+t*(j?1.6:.5)*(S[i*4+1]>.5?1:-1),r=(j?.35:.45)+S[i*4+2]*(j?.3:.45);P.setXYZ(i,Math.cos(an)*r,(j?.3:0)+u*(j?1.4:.9),Math.sin(an)*r)}P.needsUpdate=true})})}
  if(F.kind=='arcane'){const r1=cc116Pts(40,F.a,.07),r2=cc116Pts(40,F.b,.06),sp=cc116Pts(24,0xffffff,.04);G.add(r1,r2,sp);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.7,.76,48),new THREE.MeshBasicMaterial({color:F.b,transparent:true,opacity:.55,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.02;G.add(ring);
    L.push(t=>{[r1,r2].forEach((p,j)=>{const P=p.geometry.attributes.position,S=p.userData.seed,tl=j?.5:-.4;for(let i=0;i<P.count;i++){const an=i/P.count*6.28+t*(j?.9:-.7),r=.62+.05*Math.sin(t*2+i),y=.95+(j?.35:.1);
        const x=Math.cos(an)*r,z=Math.sin(an)*r;P.setXYZ(i,x,y+z*Math.sin(tl),z*Math.cos(tl))}P.needsUpdate=true});
      const P=sp.geometry.attributes.position,S=sp.userData.seed;for(let i=0;i<P.count;i++){const u=(S[i*4]+t*.3)%1;P.setXYZ(i,(S[i*4+1]-.5)*.9,.3+u*1.9,(S[i*4+2]-.5)*.9)}P.needsUpdate=true;ring.rotation.z=t*.3;ring.material.opacity=.4+.2*Math.sin(t*2.2)})}
  if(F.kind=='leaves'){const lv=cc116Pts(40,F.a,.08,THREE.NormalBlending,.95),l2=cc116Pts(20,F.b,.07,THREE.NormalBlending,.9),wd=cc116Pts(30,0xffffff,.035);G.add(lv,l2,wd);
    L.push(t=>{[lv,l2,wd].forEach((p,j)=>{const P=p.geometry.attributes.position,S=p.userData.seed;for(let i=0;i<P.count;i++){const u=(S[i*4]+t*(j==2?.5:.12))%1,an=S[i*4+3]*6.28+u*(j==2?7:4),r=.45+S[i*4+2]*.45;
        P.setXYZ(i,Math.cos(an)*r,.1+u*1.9+.05*Math.sin(t*3+i),Math.sin(an)*r)}P.needsUpdate=true})})}
  return {G,glow,tick:t=>{glow.material.opacity=.35+.15*Math.sin(t*1.7);L.forEach(f=>f(t))}}}
function cc116Pose(h,cls,t){const P=CC116.P[cls];if(!P||!h.bones)return;const b=h.bones,rec=[];const touch=bn=>{const o=b[bn];if(o&&!rec.some(r=>r.o===o))rec.push({o,q0:o.quaternion.clone()});return o};
  const br=Math.sin(t*1.6)*.03;
  for(const k in P.set){const [bn,ax]=k.split('.'),o=touch(bn);if(o)o.rotation[ax]=P.set[k]+(ax=='x'?br*(bn[1]=='R'?1:-1):0)}
  for(const k in P.add){const [bn,ax]=k.split('.'),o=touch(bn);if(o)o.rotation[ax]+=P.add[k]}
  rec.forEach(r=>r.set=r.o.quaternion.clone());h._cc116=rec;h.updateMatrixWorld(true)}
function cc116Undo(h){const R=h._cc116;if(!R)return;h._cc116=null;R.forEach(r=>{if(r.o.quaternion.equals(r.set))r.o.quaternion.copy(r.q0)})}
function cc116Model(cls){let look=null;try{look=lkFull(cls,LK.look)}catch(_){}const sig=cls+'|'+JSON.stringify(look||{});let M=CC116.cache[cls];if(M&&M.sig===sig)return M;
  const h=buildHero();h.mdLook=Object.assign({},look||{});const E={},w=ITPL.findIndex(t=>t.sl=='weapon'&&t.cls==cls&&t.t==0),ch=ITPL.findIndex(t=>t.sl=='chest'&&t.arm==CLS[cls].arm&&t.t==0);
  if(w>=0)E.weapon={id:-1,tp:w,lv:1,req:1,r:0,up:0,aff:[]};if(ch>=0)E.chest={id:-2,tp:ch,lv:1,req:1,r:0,up:0,aff:[]};
  if(cls=='paladin'){const o=ITPL.findIndex(t=>t.sl=='offhand'&&t.t==0);if(o>=0)E.offhand={id:-3,tp:o,lv:1,req:1,r:0,up:0,aff:[]}}
  refreshGear(h,cls,E);h.position.set(0,0,0);h.rotation.set(0,0,0);h.sw=1;
  for(let t=0;t<400;t+=16)animHero(9e5+t,false,h);h.updateMatrixWorld(true);
  // frame on the body itself (not the weapon), feet on the pedestal
  const B=new THREE.Box3(),v=new THREE.Vector3();h.traverse(o=>{if(!o.isSkinnedMesh||!o.visible)return;const P=o.geometry.attributes.position;for(let i=0;i<P.count;i+=3){v.fromBufferAttribute(P,i);o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld);B.expandByPoint(v)}});
  const inner=new THREE.Group(),piv=new THREE.Group();inner.add(h);piv.add(inner);const sz=B.getSize(new THREE.Vector3()),k=1.45/Math.max(.3,sz.y);inner.scale.setScalar(k);inner.position.set(-(B.min.x+B.max.x)/2*k,-B.min.y*k,-(B.min.z+B.max.z)/2*k);
  const ped=new THREE.Mesh(new THREE.CylinderGeometry(.82,.92,.12,40),new THREE.MeshStandardMaterial({color:0x2e2418,roughness:.85,metalness:.1}));ped.position.y=-.06;piv.add(ped);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.86,.018,6,56),new THREE.MeshBasicMaterial({color:CLS[cls].col||0xffd060}));rim.rotation.x=Math.PI/2;rim.position.y=.002;piv.add(rim);
  const fx=cc116Fx(cls,piv);M=CC116.cache[cls]={sig,h,piv,fx,cls};return M}
{const f=ccPreview;ccPreview=function(){if(ccStep!=0)return f.apply(this,arguments);let M;try{M=cc116Model(ccCls)}catch(e){console.warn('v117 creator',e);return f.apply(this,arguments)}
  CC116.h=M.h;const t0=performance.now();
  pvShow($('ccPV'),M.piv,now=>{const t=(now-t0)/1000;M.piv.rotation.y=CC116.rot!=null?CC116.rot:.35+Math.sin(t*.45)*.45;cc116Undo(M.h);M.h.sw=1;animHero(now,false,M.h);cc116Pose(M.h,M.cls,t);M.fx.tick(t)})}}
