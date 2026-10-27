// ================= v151 Gorthrak the Glacierback — the model, poses and procedural animation =================
// The mini boss of Burningeye Summit I's main quest (the cave and the fight are in 3152, the moves in 3151). A towering
// warlord troll who has lived so long in the Frozen Maw that a glacier has grown out of his back. He is built to read as a
// different beast from the zone's blue Frost Trolls: dark umber hide with frostbitten grey patches and red-ochre war paint,
// a hunched gorilla frame (huge shoulders and forearms, short bowed legs), a white mane, and on his back a mountain of blue
// glacial crystals with rock and snow caught in it.
//  * Head: a low heavy brow over small pale eyes, a broken flat nose, an underbite jaw with two great tusks (the left one broken
//    and bound with iron), long torn ears with iron rings, a beard of icicles.
//  * Gear: a mammoth-skull pauldron on the left shoulder, layered iron plates with spikes on the right, an iron chain wrapped
//    round the chest, a belt with a skull buckle and trophies, a fur and leather loincloth, iron bracers, wrapped shins.
//  * Weapons: the Glacier Maul (a gnarled tree trunk with a block of glacier ice bound in iron for a head) in the right hand,
//    and the Rime Fist: the left hand crusted in ice crystals.
//  * The Rampage shell (gb151Shell): ice plates over chest, shoulders, arms and thighs that grow when he armours himself
//    (hidden otherwise; its material cracks as pillars break it).
//  * About twice the triangles of the zone's Frost Troll (GB151.tris is measured on the first build).
// Joints (L = +x, the model's left): root · hips · spine · chest · neck · head · jaw · earL/R · hump · shL/R · elL/R · wrL/R · maul ·
// thL/R · knL/R · ftL/R · loinF · loinB. Poses (GB151P) are offsets from the rest pose, mirrored with '~' (svPose).
var GB151={col:0x8ad8ff,ice:0x9ad8ff,frost:0xd8f4ff,tris:0,sheet:{}};
// a smooth sculpted blob (no cracks): a sphere pushed out by a hash of the direction, scaled
function gb151Blob(k,seed,j,ws){return svG('gbB'+k,()=>{const g=new THREE.SphereGeometry(1,ws||12,Math.max(6,((ws||12)*.7)|0)),P=g.attributes.position,s=seed||1;
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),n=Math.sin(x*3.1+s)*Math.cos(y*2.7+s*1.3)*Math.sin(z*3.3+s*.7)+.5*Math.sin(x*6.2+y*5.1+s*2.1);const q=1+(j==null?.12:j)*n;P.setXYZ(i,x*q,y*q,z*q)}
  g.computeVertexNormals();return g})}
// a crystal: a hexagonal prism with a pointed top (base at 0, tip at 1)
function gb151Crys(k,n,sh){return svG('gbC'+k,()=>new THREE.LatheGeometry([new THREE.Vector2(0,0),new THREE.Vector2(.82,.02),new THREE.Vector2(1,.12),new THREE.Vector2(.92,sh||.68),new THREE.Vector2(0,1)],n||6))}
// a fur tuft: a long narrow tapered blade, curved, +y along it (tip at -y), +z the surface normal
function gb151Tuft(){return svG('gb_tf',()=>{const o=[[0,.5],[.22,.32],[.26,0],[.16,-.45],[0,-.9],[-.16,-.45],[-.26,0],[-.22,.32]],pos=[];
  const top=o.map(([x,y])=>[x,y,.08*(1-Math.abs(x)*3)+(y<-.4?.06:0)]),bot=o.map(([x,y])=>[x*.8,y*.9,-.04]),c=[0,-.1,.1],cb=[0,0,-.04];
  const T=(a,b,d)=>pos.push(a[0],a[1],a[2],b[0],b[1],b[2],d[0],d[1],d[2]);
  for(let i=0;i<o.length;i++){const j=(i+1)%o.length;T(c,top[i],top[j]);T(cb,bot[j],bot[i]);T(top[i],bot[i],bot[j]);T(top[i],bot[j],top[j])}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g})}
// cover a loft (rings [y, rx, rz, ox, oz] along the joint's +Y) with shingled pieces (fur tufts, ice plates): like mb144Cover, with
// o.geo (the piece), o.n per row, o.rows, o.size, o.lift (tip tilt out), o.skip(t,u), o.mat(t,u,r,k), o.dir (+1 tips toward ring 0)
function gb151Cover(R,j,rings,o){const V3=THREE.Vector3,n=o.n||10,rows=o.rows||5,sz=o.size||.2,lift=o.lift==null?.3:o.lift,dir=o.dir||1,y0=rings[0][0],y1=rings[rings.length-1][0];
  const at=y=>{let i=0;const up=y1>y0;while(i<rings.length-2&&(up?y>rings[i+1][0]:y<rings[i+1][0]))i++;const a=rings[i],b=rings[i+1],k=Math.max(0,Math.min(1,(y-a[0])/((b[0]-a[0])||1))),L=(p,q)=>(p||0)+((q||0)-(p||0))*k;return [L(a[1],b[1]),L(a[2],b[2]),L(a[3],b[3]),L(a[4],b[4])]};
  const geo=o.geo||gb151Tuft(),rn=svRng(o.seed||7),M=new THREE.Matrix4(),X=new V3(),Y=new V3(),Z=new V3(),out=[];
  for(let r=0;r<rows;r++){const u=rows>1?r/(rows-1):.5,y=y0+(y1-y0)*(.06+.88*u),[rx,rz,ox,oz]=at(y);
    for(let k=0;k<n;k++){const t=(k+(r%2?.5:0))/n*Math.PI*2+(o.rot||0);if(o.skip&&o.skip(t,u,r,k))continue;
      const s=Math.sin(t),c=Math.cos(t),px=(ox||0)+s*rx,pz=(oz||0)+c*rz;
      Z.set(s/Math.max(.01,rx),0,c/Math.max(.01,rz)).normalize();Y.set(0,dir,0);Y.addScaledVector(Z,-Y.dot(Z)).normalize();X.crossVectors(Y,Z).normalize();
      M.makeBasis(X,Y,Z);const q=new THREE.Quaternion().setFromRotationMatrix(M).multiply(new THREE.Quaternion().setFromAxisAngle(new V3(1,0,0),-lift-(rn()-.5)*(o.jit||.2)));
      const w=sz*(o.w||1)*(.85+rn()*.3),l=sz*(.85+rn()*.3)*(o.lk?o.lk(t,u):1),off=(o.out||0)+sz*.04;
      const m=new THREE.Mesh(geo,o.mat(t,u,r,k));m.position.set(px+Z.x*off,y+Z.y*off,pz+Z.z*off);m.quaternion.copy(q);m.scale.set(w,l,sz*(o.th||.9));
      (typeof j=='string'?R.J[j]:j).add(m);m.userData.lpsSkip=1;out.push(m)}}
  return out}
function gb151Build(R,e){
  const hide=svMat(R,0x564e40,{roughness:.88}),hide2=svMat(R,0x3c362c,{roughness:.9}),frostb=svMat(R,0x8e989a,{roughness:.8}),belly=svMat(R,0x6a5f4c,{roughness:.85}),
    paint=svMat(R,0x8a2618,{roughness:.7}),nail=svMat(R,0x221e1a,{roughness:.5,metalness:.15}),tusk=svMat(R,0xd6cbaa,{roughness:.55}),bone=svMat(R,0xc8bd9c,{roughness:.65}),
    iron=svMat(R,0x3a3d44,{roughness:.42,metalness:.65}),rust=svMat(R,0x5c3a24,{roughness:.75,metalness:.3}),leath=svMat(R,0x3a2a1c,{roughness:.85}),leath2=svMat(R,0x56402a,{roughness:.8}),
    fur=svMat(R,0xb0aca2,{roughness:.95}),fur2=svMat(R,0x75706a,{roughness:.95}),wood=svMat(R,0x4a3624,{roughness:.9}),rock=svMat(R,0x4a4e56,{roughness:.9}),snow=svMat(R,0xe8f0f4,{roughness:.95}),
    ice=svMat(R,0x9ad8ff,{roughness:.12,metalness:.12,emissive:0x1a5a8a,emissiveIntensity:.5,transparent:true,opacity:.9}),
    ice2=svMat(R,0x5a9ad0,{roughness:.18,metalness:.1,emissive:0x0e3a6a,emissiveIntensity:.5,transparent:true,opacity:.92}),
    shell=svMat(R,0xbfe8ff,{roughness:.08,metalness:.18,emissive:0x3a8ac8,emissiveIntensity:.6,transparent:true,opacity:.82}),
    eye=svGlowMat(R,0xcff4ff),gl=svGlowMat(R,0x7ad8ff,.85);
  ice.userData.e0=0x1a5a8a;ice2.userData.e0=0x0e3a6a;shell.userData.e0=0x3a8ac8;R.ice=ice;R.ice2=ice2;R.shellM=shell;R.eyeM=eye;R.glM=gl;shell.visible=false;
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz),G=(k,f)=>svG('gb'+k,f);
  const B=(j,k,m,x,y,z,sx,sy,sz,rx,ry,rz,jt)=>Mm(j,gb151Blob(k,k*1.7+3,jt),m,x,y,z,rx||0,ry||0,rz||0,sx,sy,sz);
  const horn=(k,r,l,bx,by,n,seg)=>G('h'+k,()=>svHorn(r,l,bx,by,n||5,seg||4)),cry=(j,k,m,x,y,z,rx,ry,rz,w,h)=>Mm(j,gb151Crys(k%3,6,[.6,.7,.8][k%3]),m,x,y,z,rx,ry,rz,w,h,w);
  // ---------------- the skeleton: a hunched brute (the chest leans ~.7 rad forward, the arms hang long in front) ----------------
  J('root',null,0,0,0);J('hips','root',0,1.95,0,.12);J('spine','hips',0,.3,-.04,.36);J('chest','spine',0,.55,0,.22);
  J('neck','chest',0,.8,.3,-.6);J('head','neck',0,.26,.12,-.28);R.J.head.scale.setScalar(1.12);J('jaw','head',0,-.1,.04);J('hump','chest',0,.66,-.48,-.3);
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('sh'+L,'chest',s*1.0,.5,.04,-.86,0,s*-.1);J('el'+L,'sh'+L,0,-.95,0,-.38);J('wr'+L,'el'+L,0,-.88,.02,.24);
    J('th'+L,'hips',s*.5,-.16,0,-.26,0,s*-.07);J('kn'+L,'th'+L,0,-.85,0,.42);J('ft'+L,'kn'+L,0,-.82,0,-.28);J('ear'+L,'head',s*.3,.1,-.06,0,s*.15,0)});
  J('maul','wrR',0,-.12,.04,-.5,0,.12);J('loinF','hips',0,-.18,.52,-.05);J('loinB','hips',0,-.12,-.5,.05);
  // ---------------- hips, belly, belt, loincloth ----------------
  const hipR=[[-.36,.56,.46],[-.06,.68,.56],[.2,.7,.58],[.34,.66,.54]];Mm('hips',G('hp',()=>svLoft(hipR,14)),hide);
  B('hips',1,belly,0,.04,.3,.62,.5,.4);
  const belt=G('bt',()=>svLoft([[.14,.72,.61],[.3,.71,.6]],18,{cap:false}));Mm('hips',belt,leath);Mm('hips',G('bt2',()=>svLoft([[.17,.735,.625],[.2,.735,.625]],18,{cap:false})),leath2);
  // the skull buckle, iron studs, trophies (small skulls, bones) hanging off the belt
  B('hips',2,bone,0,.22,.66,.15,.14,.1);[-1,1].forEach(s=>{Mm('hips',G('sk_e',()=>new THREE.IcosahedronGeometry(.035,0)),hide2,s*.05,.24,.75);});Mm('hips',G('sk_j',()=>new THREE.BoxGeometry(.12,.04,.05)),bone,0,.15,.71);
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2;Mm('hips',G('stud',()=>new THREE.IcosahedronGeometry(.03,0)),iron,Math.sin(a)*.74,.22,Math.cos(a)*.63)}
  [[-.62,0],[.6,.5],[.45,-2.4],[-.4,-2.6]].forEach(([x,ry],i)=>{const z=Math.sqrt(Math.max(0,1-x*x/.53))*.6*(i<2?1:-1);
    if(i%2==0){B('hips',3+i,bone,x,.06,z,.11,.12,.1);Mm('hips',G('tr_e',()=>new THREE.IcosahedronGeometry(.025,0)),hide2,x+.03,.08,z+.08);Mm('hips',G('rope',()=>new THREE.CylinderGeometry(.012,.012,.18,4)),leath2,x,.15,z)}
    else for(let q=0;q<2;q++)Mm('hips',G('tbn',()=>new THREE.CylinderGeometry(.025,.03,.36,5)),bone,x+q*.06,.0,z,0,ry,.2-q*.4)});
  // loincloth: a fur-trimmed leather flap front and back on their own joints (springs), fur tufts round the hips under the belt
  const flap=(j,sgn)=>{Mm(j,G('lf',()=>{const g=svLoft([[0,.34,.06],[-.38,.36,.05],[-.74,.32,.04]],8);return g}),leath,0,0,0);Mm(j,G('lft',()=>svLoft([[-.68,.35,.07],[-.8,.32,.07]],8)),fur2,0,0,0);
    for(let k=0;k<5;k++)Mm(j,gb151Tuft(),fur,(k-2)*.13,-.82,.02*sgn,0,0,0,.2,.26,.12);Mm(j,G('lfb',()=>new THREE.TorusGeometry(.07,.015,4,10)),bone,0,-.3,.07*sgn)};
  flap('loinF',1);flap('loinB',-1);
  gb151Cover(R,'hips',[[-.05,.7,.6],[-.38,.74,.64]],{n:18,rows:2,size:.32,seed:11,lift:.08,w:1.5,skip:t=>Math.abs(Math.cos(t))>.86,mat:(t,u,r,k)=>(k+r)%3?fur2:leath2});
  // ---------------- spine / waist and the chest: a barrel chest, pecs, traps, a belly of muscle; war paint and frostbite ----------------
  const spR=[[-.08,.66,.54,0,0],[.25,.72,.56,0,-.02],[.56,.84,.62,0,-.04]];Mm('spine',G('sp',()=>svLoft(spR,14)),hide);
  for(let k=0;k<3;k++)[-1,1].forEach(s=>B('spine',10+k,belly,s*.17,.02+k*.17,.5+k*.03,.17,.12,.1));
  const chR=[[-.04,.84,.62,0,0],[.22,1.02,.72,0,-.04],[.48,1.06,.74,0,-.1],[.7,.9,.62,0,-.14],[.88,.52,.42,0,-.08]];Mm('chest',G('ch',()=>svLoft(chR,16)),hide);
  [-1,1].forEach(s=>{B('chest',20,hide,s*.4,.42,.56,.44,.34,.26,-.2,s*.2,0);B('chest',21,hide2,s*.44,.82,-.06,.42,.3,.5,0,0,s*.4);B('chest',22,hide,s*.75,.55,-.3,.38,.42,.36);
    // war paint: three red stripes across each pec, a handprint-like smear on the belly
    for(let k=0;k<3;k++)Mm('chest',G('pt',()=>new THREE.BoxGeometry(.4,.05,.03)),paint,s*(.38+k*.02),.3+k*.11,.74-k*.01,-.18,s*.45,s*(.5-k*.05));
    // frostbitten patches (grey, cracked) on the shoulders and flanks
    B('chest',23+(s>0?0:1),frostb,s*.86,.36,.22,.24,.2,.12,0,s*1.2,0)});
  for(let k=0;k<4;k++)Mm('spine',G('bpt',()=>new THREE.BoxGeometry(.06,.26,.03)),paint,-.18+k*.12,.3,.62,.1,0,.2);
  // the chain wrapped round the chest: iron links along a tilted ring
  for(let i=0;i<30;i++){const a=i/30*Math.PI*2,x=Math.sin(a)*1.07,z=Math.cos(a)*.79-.06,y=.44+x*.32,l=Mm('chest',G('cl',()=>new THREE.TorusGeometry(.075,.022,4,8)),i%7==3?rust:iron,x,y,z);
    l.rotation.set(0,a+Math.PI/2,i%2?Math.PI/2:0);l.rotation.z+=.3}
  // ---------------- the mane: shaggy white fur over the neck, the shoulders and the upper back ----------------
  gb151Cover(R,'chest',[[.34,1.07,.75,0,-.12],[.62,.95,.66,0,-.14],[.86,.56,.45,0,-.08]],{n:20,rows:5,size:.38,seed:13,lift:.22,w:1.6,dir:-1,skip:t=>Math.cos(t)>.15,mat:(t,u,r,k)=>(k*7+r)%5==0?fur2:fur});
  // ---------------- neck and head ----------------
  const nkR=[[-.06,.46,.42],[.14,.42,.38],[.3,.36,.33]];Mm('neck',G('nk',()=>svLoft(nkR,12)),hide);
  gb151Cover(R,'neck',nkR,{n:12,rows:3,size:.32,seed:14,lift:.25,w:1.5,dir:-1,skip:t=>Math.cos(t)>-.1,mat:(t,u,r,k)=>k%3?fur:fur2});
  const hdR=[[-.2,.3,.3,0,.02],[-.02,.37,.36,0,.04],[.16,.35,.32,0,.0],[.3,.27,.23,0,-.04],[.38,.18,.15,0,-.08]];Mm('head',G('hd',()=>svLoftZ(hdR,14)),hide);
  B('head',30,hide2,0,.15,.2,.4,.12,.18);   // the brow ridge
  [-1,1].forEach(s=>{B('head',31,hide,s*.22,-.02,.22,.13,.11,.12);   // cheekbones
    Mm('head',G('sock',()=>new THREE.IcosahedronGeometry(.07,1)),nail,s*.13,.06,.32,0,0,0,1.2,.7,.8);Mm('head',G('eye',()=>new THREE.IcosahedronGeometry(.04,1)),eye,s*.13,.065,.345);svSpr(R,'head',GB151.col,.22,s*.13,.07,.36);
    Mm('head',G('nos',()=>new THREE.IcosahedronGeometry(.025,0)),nail,s*.04,-.04,.47);
    // war paint: a band across the eyes, a stripe down each cheek
    Mm('head',G('pb',()=>new THREE.BoxGeometry(.2,.06,.02)),paint,s*.16,.06,.335,0,s*.5,0);Mm('head',G('pc',()=>new THREE.BoxGeometry(.035,.18,.02)),paint,s*.25,-.08,.25,.1,s*.9,0)});
  B('head',32,hide2,0,-.02,.42,.1,.09,.1,0,0,.2);   // a broken flat nose, bent to one side
  // matted white hair on the crown and down the back of the skull
  {const tf=gb151Tuft(),Mx=new THREE.Matrix4(),X=new THREE.Vector3(),Y=new THREE.Vector3(0,0,1),Z=new THREE.Vector3(),rn=svRng(15);
    for(let r=0;r<4;r++)for(let k=0;k<7;k++){const z=-.2+r*.12,a=(k-3)*.38+(r%2?.19:0),rx=.36-r*.02,ry=.37-r*.03,n=Z.set(Math.sin(a),Math.cos(a),0);
      X.crossVectors(Y,n);Mx.makeBasis(X,Y,n);const q=new THREE.Quaternion().setFromRotationMatrix(Mx).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-.45-rn()*.25));
      const t=Mm('head',tf,(k+r)%4?fur:fur2,Math.sin(a)*rx,.02+Math.cos(a)*ry,z);t.quaternion.copy(q);t.scale.set(.22,.26+rn()*.1,.16)}}
  // ears: long, torn, pointing out and back, with iron rings
  [-1,1].forEach(s=>{const L=s>0?'L':'R';Mm('ear'+L,G('ea',()=>svHorn(.09,.5,0,.12,5,4)),hide,0,0,0,0,s*(Math.PI/2+.45),0,.6,1,1);Mm('ear'+L,G('ei',()=>svHorn(.05,.4,0,.1,5,3)),hide2,s*.01,0,0,0,s*(Math.PI/2+.45),0,.4,.8,1);
    for(let k=0;k<2;k++)Mm('ear'+L,G('er',()=>new THREE.TorusGeometry(.05,.012,4,10)),iron,s*(.14+k*.09),.0,-.06-k*.04,0,s*.4,0);
    Mm('ear'+L,G('ent',()=>new THREE.BoxGeometry(.06,.08,.03)),nail,s*.32,.04,-.18,0,s*.4,0)});
  // the jaw: a heavy underbite, lower teeth, two great tusks (the left broken and bound with iron), a beard of icicles
  Mm('jaw',G('jw',()=>svLoftZ([[-.12,.29,.12,0,-.04],[.12,.31,.14,0,-.06],[.3,.24,.11,0,-.04],[.4,.16,.07,0,-.02]],12)),hide);
  for(let k=0;k<6;k++)Mm('jaw',horn('lt',.025,1,0,0,4,2),tusk,(k-2.5)*.06,-.0,.36-Math.abs(k-2.5)*.03,-Math.PI/2,0,0,1,1,.08);
  [-1,1].forEach(s=>{const br=s>0;Mm('jaw',horn('tk',.065,1,s*.06,-.1,6,5),tusk,s*.17,-.02,.32,-Math.PI/2+.3,s*.3,0,1,1,br?.26:.48);
    if(br){Mm('jaw',G('tkb',()=>new THREE.CylinderGeometry(.06,.06,.05,8)),iron,s*.18,.12,.36,.25,0,0);Mm('jaw',G('tkc',()=>new THREE.CylinderGeometry(.055,.065,.03,6)),tusk,s*.19,.2,.37,.3,0,.3)}});
  for(let k=0;k<7;k++){const x=(k-3)*.07;Mm('jaw',horn('ic',.03,1,0,0,5,2),k%2?ice:ice2,x,-.1,.22-Math.abs(x)*.6,Math.PI/2,0,0,1,1,.16+(k%3)*.06)}
  // ---------------- the glacier on his back: rock, snow and a mountain of blue crystals; icicles under its rim ----------------
  B('hump',40,rock,0,0,0,.72,.36,.52,.2,0,0,.25);B('hump',41,rock,.5,-.08,.1,.38,.26,.34,0,0,.4,.3);B('hump',42,rock,-.48,-.06,.14,.36,.24,.32,0,0,-.3,.3);B('hump',45,ice2,.1,.1,-.2,.5,.22,.36,0,0,.1,.3);
  B('hump',43,snow,0,.22,.06,.5,.16,.38,.1,0,0,.3);B('hump',44,snow,-.36,.12,.2,.24,.08,.2,0,0,-.4);
  {const SR=svRng(1513),U=new THREE.Vector3(0,1,0),D=new THREE.Vector3(),Q=new THREE.Quaternion();
    const put=(i,x,y,z,dx,dy,dz,w,h,m)=>{D.set(dx,dy,dz).normalize();Q.setFromUnitVectors(U,D);const o=Mm('hump',gb151Crys(i%3,6,[.6,.7,.8][i%3]),m,x,y,z,0,0,0,w,h,w);o.quaternion.copy(Q)};
    // three rings of crystals over the dome: tall in the middle, low and splayed at the rim; all lean back (−z) and away from the spine
    for(let i=0;i<30;i++){const ring=i<6?0:i<16?1:2,n=[6,10,14][ring],j=i-[0,6,16][ring],a=(j/n)*Math.PI*2+SR()*.35+ring*.3,r=[.14,.36,.58][ring]+SR()*.06;
      const x=Math.sin(a)*r*1.2,z=Math.cos(a)*r*.75-.04,y=.22-ring*.1+SR()*.05,out=[.25,.7,1.25][ring];
      const h=[.95,.66,.4][ring]*(.75+SR()*.5),w=[.13,.1,.075][ring]*(.8+SR()*.4);put(i,x,y,z,Math.sin(a)*out,1,Math.cos(a)*out*.7-.45,w,h,(i+ring)%3==1?ice2:ice)}}
  [[.66,.02,.3,1.4,.5,.2,.07,.42],[-.64,0,.36,-1.4,.5,.3,.07,.4],[.3,.0,-.42,.4,.4,-1.2,.06,.36],[-.26,.02,-.44,-.4,.4,-1.2,.06,.34]].forEach(([x,y,z,dx,dy,dz,w,h],i)=>{const o=Mm('hump',gb151Crys(i%3,6,.7),ice,x,y,z,0,0,0,w,h,w);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx,dy,dz).normalize())});
  for(let k=0;k<9;k++){const a=Math.PI*.55+k*.24;Mm('hump',horn('hi',.035,1,0,0,5,2),k%2?ice:ice2,Math.sin(a)*.62,-.24,Math.cos(a)*.44+.05,Math.PI/2+.2,0,0,1,1,.14+(k%3)*.07)}
  svSpr(R,'hump',0x5ac8ff,1.2,0,.45,0);svSpr(R,'hump',0x7ad8ff,.7,.3,.3,-.1);
  // ---------------- arms ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',sh='sh'+L,el='el'+L,wr='wr'+L;
    B(sh,50,hide,s*.08,-.04,0,.4,.38,.38);   // the deltoid
    const uaR=[[.02,.3,.3],[-.42,.33,.31],[-.88,.25,.25]];Mm(sh,G('ua',()=>svLoft(uaR,12)),hide);B(sh,51,hide,0,-.42,.12,.25,.3,.2);   // biceps
    gb151Cover(R,sh,uaR.slice(0,2),{n:9,rows:2,size:.26,seed:20+s,lift:.2,w:1.4,skip:t=>Math.sin(t)*s<.25,mat:(t,u,r,k)=>(k+r)%3?fur:fur2});
    B(el,52,hide2,0,0,-.04,.24,.24,.26);
    const faR=[[.04,.27,.27],[-.36,.33,.31],[-.8,.24,.22]];Mm(el,G('fa',()=>svLoft(faR,12)),hide);B(el,53,hide,0,-.25,.12,.24,.3,.18);
    // iron bracer with rivets; fur on the back of the forearm
    Mm(el,G('br',()=>svLoft([[-.44,.35,.33],[-.74,.27,.25]],12,{cap:false})),iron);Mm(el,G('br2',()=>svLoft([[-.44,.36,.34],[-.49,.36,.34]],12,{cap:false})),rust);
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2;Mm(el,G('rv',()=>new THREE.IcosahedronGeometry(.025,0)),bone,Math.sin(a)*.33,-.6,Math.cos(a)*.31)}
    gb151Cover(R,el,[[-.05,.28,.28],[-.38,.33,.31]],{n:9,rows:2,size:.24,seed:24+s,lift:.18,w:1.4,skip:t=>Math.cos(t)>-.3,mat:(t,u,r,k)=>k%2?fur:fur2});
    // the fist: a heavy palm, four thick curled fingers with black nails, the thumb
    B(wr,54,hide,0,-.14,.04,.24,.22,.26);
    for(let f=0;f<4;f++){const x=(f-1.5)*.1;Mm(wr,G('fg',()=>svTube([[0,0,0],[0,-.12,.06],[0,-.2,.16],[0,-.17,.24]],[.06,.058,.05,.04],6)),hide,x,-.24,.02);Mm(wr,horn('nl',.035,.09,0,-.02,4,2),nail,x,-.42,.25,.6,0,0)}
    Mm(wr,G('th',()=>svTube([[0,0,0],[s*-.06,-.08,.08],[s*-.08,-.14,.14]],[.06,.05,.04],6)),hide,s*-.16,-.12,.08)});
  // the left shoulder: a mammoth skull pauldron with two curling tusks, strapped on with leather
  B('shL',60,bone,.12,.16,0,.42,.3,.44,0,0,-.3,.18);B('shL',61,bone,.3,.08,.3,.2,.18,.22,0,0,-.4);
  [-1,1].forEach(q=>{Mm('shL',G('msk',()=>new THREE.IcosahedronGeometry(.07,1)),hide2,.34,.12,.3+q*.12);Mm('shL',horn('mt',.07,1,0,.5,6,6),tusk,.36,.0,.38+q*.14,.6,q*.4,-.6,1,1,.85)});
  Mm('shL',G('mst',()=>svLoft([[-.06,.44,.4],[.04,.44,.4]],12,{cap:false})),leath,.02,-.22,0,0,0,.5);
  // the right shoulder: layered iron plates with spikes
  for(let k=0;k<3;k++){B('shR',62+k,k==1?rust:iron,-.1-k*.05,.14-k*.15,0,.44-k*.05,.14,.44-k*.04,0,0,.35+k*.2,.06);
    for(let q=0;q<3;q++)Mm('shR',horn('sp',.06,1,0,.05,5,3),iron,-.18-k*.08,.22-k*.13,-.22+q*.22,-Math.PI/2,0,.6+k*.2,1,1,.36-k*.07)}
  // the Rime Fist: the left hand crusted in ice crystals
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2;cry('wrL',50+i,i%2?ice:ice2,Math.sin(a)*.2,-.2-(i%3)*.06,Math.cos(a)*.2+.08,Math.cos(a)*1.0,0,-Math.sin(a)*1.0,.06,.2+(i%4)*.06)}
  for(let i=0;i<5;i++)cry('wrL',60+i,ice,(i-2)*.09,-.42,.24,1.2,0,0,.05,.16);B('elL',70,frostb,0,-.75,0,.28,.12,.27);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;cry('elL',70+i,ice2,Math.sin(a)*.25,-.78,Math.cos(a)*.24,Math.cos(a)*1.3,0,-Math.sin(a)*1.3,.05,.18)}
  // ---------------- the Glacier Maul: a gnarled trunk, a leather grip, a block of glacier ice bound in iron and spiked ----------------
  Mm('maul',G('mh',()=>svTube([[0,.42,0],[.02,.1,.01],[-.03,-.5,.03],[.03,-1.1,-.02],[-.02,-1.7,.02],[0,-2.0,0]],[.1,.11,.12,.115,.13,.15],7)),wood);
  for(let k=0;k<4;k++)Mm('maul',G('mg',()=>new THREE.CylinderGeometry(.13,.13,.07,8)),k%2?leath:leath2,0,.1-k*.09,0,0,k*.5,.1);
  for(let k=0;k<5;k++)Mm('maul',G('kn'+(k%2),()=>svLump(.07,0,.3,80+k)),wood,Math.sin(k*2.1)*.11,-.4-k*.32,Math.cos(k*2.1)*.11);
  Mm('maul',G('mi',()=>svLump(.5,1,.18,151)),ice,0,-2.32,0,0,0,0,1.2,.9,.9);Mm('maul',G('mi2',()=>svLump(.36,1,.25,152)),ice2,.05,-2.3,.06,0,.5,0,1.3,1,1);
  [[.34,-2.12,.24],[-.38,-2.48,-.16],[.16,-2.68,-.28],[-.26,-2.04,.28]].forEach((q,i)=>Mm('maul',G('mr'+i,()=>svLump(.17,0,.4,160+i)),rock,q[0],q[1],q[2]));
  [-1,1].forEach(q=>{Mm('maul',G('mb',()=>new THREE.TorusGeometry(.54,.045,4,14)),iron,0,-2.32+q*.24,0,Math.PI/2,0,0,1.15,1,1);
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2+(q>0?0:.5);Mm('maul',horn('ms',.055,1,0,0,5,2),iron,Math.cos(a)*.62,-2.32+q*.24,Math.sin(a)*.54,0,-a+Math.PI/2,0,1,1,.28)}});
  Mm('maul',G('mc',()=>svTube([[.0,-1.95,.13],[.12,-1.85,.0],[0,-1.75,-.13],[-.12,-1.85,0],[0,-1.95,.13]],.03,5)),iron);
  svSpr(R,'maul',0x7ad8ff,.9,0,-2.32,0);
  // ---------------- legs: thick thighs, knees, wrapped shins, broad feet with three toes ----------------
  [-1,1].forEach(s=>{const L=s>0?'L':'R',th='th'+L,kn='kn'+L,ft='ft'+L;
    const tR=[[.06,.44,.42],[-.4,.45,.43],[-.86,.32,.32]];Mm(th,G('tc',()=>svLoft(tR,12)),hide);B(th,80,hide,0,-.35,.16,.3,.36,.24);
    gb151Cover(R,th,[[.0,.46,.44],[-.35,.46,.44]],{n:10,rows:2,size:.3,seed:30+s,lift:.12,w:1.4,skip:t=>Math.sin(t)*s<-.2,mat:(t,u,r,k)=>k%2?fur:fur2});
    B(kn,81,hide2,0,.0,.06,.28,.26,.28);
    const sR=[[0,.3,.3],[-.42,.27,.27],[-.82,.22,.22]];Mm(kn,G('sc',()=>svLoft(sR,12)),hide);B(kn,82,hide,0,-.25,-.12,.22,.28,.2);
    for(let k=0;k<4;k++)Mm(kn,G('wr'+(k%2),()=>svLoft([[-.3-k*.13,.29-k*.012,.29-k*.012],[-.37-k*.13,.285-k*.012,.285-k*.012]],12,{cap:false})),k%2?leath:leath2,0,0,0,0,k*.7,.08*(k%2?1:-1));
    Mm(ft,G('fo',()=>svLump(.3,1,.12,90)),hide,0,-.08,.14,0,0,0,1.0,.42,1.3);B(ft,83,frostb,0,-.04,-.14,.2,.12,.18);
    for(let f=0;f<3;f++){const a=(f-1)*.36;Mm(ft,G('to',()=>svTube([[0,0,0],[0,-.03,.12],[0,-.06,.2]],[.07,.06,.05],6)),hide,Math.sin(a)*.18,-.06,.42+Math.cos(a)*.02-Math.abs(f-1)*.05,0,a,0);Mm(ft,horn('tn',.04,.1,0,-.04,4,2),nail,Math.sin(a)*.18+Math.sin(a)*.2,-.1,.62-Math.abs(f-1)*.05,.3,a,0)}
    Mm(ft,G('fw',()=>svLoft([[.0,.25,.3],[.12,.24,.28]],10,{cap:false})),fur2,0,-.02,.05)});
  // ---------------- the Rampage shell: ice plates that grow over him (hidden until the Rampage) ----------------
  gb151Shell(R,shell,Mm,cry);
  if(!GB151.tris){let n=0;R.root.traverse(o=>{if(o.isMesh){const g=o.geometry;n+=g.index?g.index.count/3:g.attributes.position.count/3}});GB151.tris=Math.round(n)}
  R.headJ='head'}
// the shell: shingled ice plates over the chest and back, crystals on the shoulders, plates down the arms and thighs, a crown
function gb151Shell(R,m,Mm,cry){const pg=svG('gb_pl',()=>{const o=[[0,.5],[.44,.24],[.48,-.16],[.3,-.44],[0,-.6],[-.3,-.44],[-.48,-.16],[-.44,.24]],pos=[];
    const top=o.map(([x,y])=>[x,y,.1*(1-Math.hypot(x*1.3,y))]),bot=o.map(([x,y])=>[x*.9,y*.9,-.05]),c=[0,-.04,.14],cb=[0,0,-.05],T=(a,b,d)=>pos.push(a[0],a[1],a[2],b[0],b[1],b[2],d[0],d[1],d[2]);
    for(let i=0;i<o.length;i++){const j=(i+1)%o.length;T(c,top[i],top[j]);T(cb,bot[j],bot[i]);T(top[i],bot[i],bot[j]);T(top[i],bot[j],top[j])}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g});
  gb151Cover(R,'chest',[[.0,.9,.68,0,0],[.3,1.1,.8,0,-.06],[.58,1.06,.76,0,-.12],[.8,.8,.58,0,-.12]],{geo:pg,n:14,rows:4,size:.42,seed:51,lift:.1,mat:()=>m,out:.04});
  gb151Cover(R,'spine',[[-.04,.7,.58],[.5,.88,.66]],{geo:pg,n:12,rows:2,size:.4,seed:52,lift:.1,mat:()=>m,out:.04});
  [-1,1].forEach(s=>{const L=s>0?'L':'R';gb151Cover(R,'sh'+L,[[.1,.4,.4],[-.8,.28,.28]],{geo:pg,n:7,rows:3,size:.34,seed:53+s,lift:.15,mat:()=>m,out:.05});
    gb151Cover(R,'el'+L,[[.0,.33,.33],[-.7,.28,.26]],{geo:pg,n:7,rows:3,size:.3,seed:55+s,lift:.15,mat:()=>m,out:.05});
    gb151Cover(R,'th'+L,[[.0,.5,.48],[-.8,.36,.36]],{geo:pg,n:8,rows:3,size:.34,seed:57+s,lift:.12,mat:()=>m,out:.05});
    for(let k=0;k<4;k++)cry('sh'+L,80+k,m,s*(.1+k*.06),.3,-.15+k*.12,-.3,0,s*(-.4-k*.15),.08,.4+k*.08)});
  for(let k=0;k<7;k++){const a=(k-3)*.42;cry('head',90+k,m,Math.sin(a)*.3,.3,Math.cos(a)*.22-.04,-.3*Math.cos(a)-.2,0,-Math.sin(a)*.5,.05,.22+(k==3?.16:0)+.04*(3-Math.abs(k-3)))}}
// ---------------- poses (offsets from rest: [rx, ry, rz, px, py, pz]) ----------------
var GB151P={
  idle:{},
  // Skullbreaker: the maul raised over the right shoulder, the diagonal smash; the Rime Fist backhand; both hands up, the overhead slam
  smUp:{hips:[-.05,-.3,0],spine:[-.15,-.25,0],chest:[-.2,-.35,0],shR:[-2.55,0,-.1],elR:[-.9,0,0],wrR:[1.0,0,0],shL:[-.5,0,-.25],elL:[-.3,0,0],head:[.1,.25,0],thR:[.15,0,0],thL:[-.25,0,0],knL:[.25,0,0],earL:[0,.2,0],earR:[0,.2,0]},
  smHit:{hips:[.15,.35,0,0,-.18,.3],spine:[.25,.25,0],chest:[.3,.4,0],shR:[.25,0,.45],elR:[-.15,0,0],wrR:[-.2,0,0],shL:[-.2,0,.2],elL:[-.4,0,0],head:[.05,-.3,0],thL:[-.65,0,0],knL:[.6,0,0],ftL:[.1,0,0],thR:[.35,0,0],knR:[.1,0,0],jaw:[.25,0,0]},
  fUp:{hips:[0,.25,0],spine:[0,.3,0],chest:[-.05,.55,0],shL:[-1.4,0,-1.05],elL:[-1.3,0,0],shR:[-.4,0,.15],head:[0,-.4,0],thR:[-.3,0,0],knR:[.3,0,0]},
  fHit:{hips:[.05,-.35,0,0,-.08,.2],spine:[.1,-.35,0],chest:[.1,-.65,0],shL:[-1.3,0,.95],elL:[-.15,0,0],wrL:[.2,0,0],shR:[-.2,0,-.1],head:[0,.35,0],thL:[-.45,0,0],knL:[.45,0,0],jaw:[.3,0,0]},
  xUp:{hips:[-.15,0,0,0,.1,-.15],spine:[-.3,0,0],chest:[-.35,0,0],neck:[-.15,0,0],head:[-.3,0,0],shR:[-2.9,0,.05],elR:[-.8,0,0],shL:[-2.9,0,-.05],elL:[-.8,0,0],wrR:[1.0,0,0],thL:[-.25,0,0],knL:[.3,0,0],thR:[.1,0,0],jaw:[.4,0,0]},
  xHit:{hips:[.25,0,0,0,-.45,.45],spine:[.4,0,0],chest:[.38,0,0],neck:[.1,0,0],head:[.2,0,0],shR:[-.45,0,.15],elR:[-.1,0,0],shL:[-.45,0,-.15],elL:[-.1,0,0],wrR:[-.3,0,0],thL:[-.85,0,0],knL:[.95,0,0],ftL:[-.1,0,0],thR:[-.45,0,0],knR:[.85,0,0],ftR:[-.4,0,0],jaw:[.5,0,0]},
  rec:{hips:[0,0,0,0,-.04,0],shL:[-.15,0,-.05],shR:[-.15,0,.05]},
  // Glacier Charge: the shoulder dropped and the head down; the run; the crash into a pillar
  chLow:{hips:[.18,-.2,0,0,-.4,-.25],spine:[.16,-.2,0],chest:[.06,-.35,0],head:[-.25,.2,0],neck:[-.15,0,0],shL:[.5,0,.2],elL:[-.6,0,0],shR:[.6,0,-.2],elR:[-.4,0,0],thL:[-.75,0,0],knL:[1.05,0,0],ftL:[-.3,0,0],thR:[-.25,0,0],knR:[.75,0,0],ftR:[-.5,0,0],jaw:[.5,0,0]},
  chGo:{hips:[.24,-.3,0,0,-.2,.35],spine:[.16,-.25,0],chest:[.02,-.45,0],head:[-.28,.25,0],shL:[-.5,0,.4],elL:[-.8,0,0],shR:[.8,0,-.3],elR:[-.3,0,0],thL:[-1.1,0,0],knL:[.55,0,0],thR:[.65,0,0],knR:[.6,0,0],ftR:[.3,0,0],jaw:[.6,0,0],earL:[.5,0,0],earR:[.5,0,0]},
  crash:{hips:[-.3,.2,.15,0,-.25,-.35],spine:[-.35,0,.1],chest:[-.3,.2,0],neck:[-.3,0,0],head:[-.5,.3,.2],shL:[-1.4,0,1.2],elL:[-.5,0,0],shR:[-1.0,0,-1.0],elR:[-.4,0,0],thL:[-.2,0,0],knL:[.5,0,0],thR:[.3,0,0],jaw:[.7,0,0]},
  daze:{hips:[.25,0,.12,0,-.45,0],spine:[.35,0,.1],chest:[.25,0,.1],neck:[.25,0,0],head:[.5,.3,.25],shL:[.3,0,.4],elL:[-.3,0,0],shR:[.4,0,-.3],thL:[-.9,0,0],knL:[1.1,0,0],thR:[-.4,0,0],knR:[.9,0,0],jaw:[.5,0,0]},
  // Wrecking Whirl: wound up with the maul out behind, then the full turn (the root spins; this is the end pose)
  spW:{hips:[0,.7,0,0,-.2,0],spine:[0,.45,0],chest:[0,.55,0],head:[0,-.6,0],shR:[-1.45,0,1.45],elR:[-.15,0,0],shL:[-.4,0,-.7],elL:[-.4,0,0],thL:[-.35,0,0],knL:[.5,0,0],thR:[-.15,0,0],knR:[.45,0,0]},
  spGo:{hips:[0,-.5,0,0,-.25,0],spine:[0,-.4,0],chest:[0,-.5,0],head:[0,.4,0],shR:[-1.5,0,1.4],elR:[-.05,0,0],wrR:[.3,0,0],shL:[-.5,0,-.9],thL:[-.25,0,0],knL:[.5,0,0],thR:[-.4,0,0],knR:[.5,0,0],jaw:[.4,0,0]},
  // the roar (Cave-in Roar, Phase II): arms flung wide, the head thrown back; the chest beat
  roar:{hips:[-.15,0,0,0,.08,0],spine:[-.35,0,0],chest:[-.45,0,0],neck:[-.4,0,0],head:[-.6,0,0],jaw:[.85,0,0],shL:[-.9,0,1.35],elL:[-.5,0,0],shR:[-.9,0,-1.35],elR:[-.5,0,0],earL:[0,-.4,0],earR:[0,.4,0]},
  beat:{hips:[-.05,0,0],spine:[-.2,0,0],chest:[-.3,0,0],head:[-.25,0,0],jaw:[.5,0,0],shL:[-1.55,0,-.75],elL:[-1.6,0,0],shR:[-1.55,0,.75],elR:[-1.6,0,0]},
  // Glacier Hurl: the Rime Fist tears a boulder out of the floor, lifts it overhead, throws
  tear:{hips:[.4,.3,0,0,-.55,0],spine:[.45,.2,0],chest:[.35,.2,0],head:[.3,0,0],shL:[-.25,0,.1],elL:[-.1,0,0],shR:[-.3,0,.2],thL:[-.8,0,0],knL:[1.0,0,0],ftL:[-.2,0,0],thR:[-.8,0,0],knR:[1.0,0,0],ftR:[-.2,0,0]},
  lift:{hips:[-.15,-.2,0,0,.05,0],spine:[-.25,-.1,0],chest:[-.25,-.35,0],head:[-.3,.2,0],shL:[-3.0,0,-.15],elL:[-.75,0,0],shR:[-.6,0,.4],thL:[.1,0,0],thR:[-.35,0,0],knR:[.35,0,0]},
  throw:{hips:[.2,.35,0,0,-.15,.25],spine:[.3,.3,0],chest:[.3,.5,0],head:[0,-.35,0],shL:[-.2,0,-.3],elL:[-.05,0,0],shR:[.2,0,.2],thL:[-.6,0,0],knL:[.55,0,0],thR:[.4,0,0],jaw:[.5,0,0]},
  // Permafrost Slam: both fists raised, then driven into the floor
  stUp:{hips:[-.15,0,0,0,.12,-.1],spine:[-.3,0,0],chest:[-.35,0,0],head:[-.35,0,0],jaw:[.55,0,0],shL:[-2.8,0,-.35],elL:[-.95,0,0],shR:[-2.8,0,.35],elR:[-.95,0,0],thL:[-.15,0,0],thR:[-.15,0,0]},
  stHit:{hips:[.45,0,0,0,-.75,.25],spine:[.5,0,0],chest:[.4,0,0],neck:[.15,0,0],head:[.25,0,0],jaw:[.4,0,0],shL:[-.75,0,-.05],elL:[-.25,0,0],shR:[-.75,0,.05],elR:[-.25,0,0],thL:[-.85,0,0],knL:[1.1,0,0],ftL:[-.25,0,0],thR:[-.85,0,0],knR:[1.1,0,0],ftR:[-.25,0,0]},
  // Phase II: the uppercut (Warlord's Fury), the leap, the armoured stance (Glacial Rampage)
  upUp:{hips:[.25,.3,0,0,-.4,0],spine:[.3,.25,0],chest:[.2,.35,0],shL:[.3,0,.3],elL:[-1.7,0,0],thL:[-.6,0,0],knL:[.8,0,0],thR:[-.4,0,0],knR:[.7,0,0]},
  upHit:{hips:[-.25,-.35,0,0,.15,.2],spine:[-.35,-.25,0],chest:[-.4,-.4,0],head:[-.3,.2,0],shL:[-2.9,0,-.1],elL:[-.3,0,0],thL:[-.2,0,0],thR:[.1,0,0],jaw:[.5,0,0]},
  leap:{hips:[-.25,0,0,0,1.5,0],spine:[-.2,0,0],chest:[-.25,0,0],shR:[-3.0,0,.25],elR:[-.5,0,0],shL:[-3.0,0,-.25],elL:[-.5,0,0],thL:[-1.0,0,0],knL:[1.4,0,0],thR:[-1.0,0,0],knR:[1.4,0,0]},
  armor:{hips:[-.05,0,0,0,-.15,0],spine:[-.25,0,0],chest:[-.3,0,0],head:[-.4,0,0],jaw:[.7,0,0],shL:[-1.1,0,1.0],elL:[-1.5,0,0],shR:[-1.1,0,-1.0],elR:[-1.5,0,0],thL:[-.3,0,0],knL:[.45,0,0],thR:[-.3,0,0],knR:[.45,0,0]},
  stag:{hips:[.2,.2,.15,0,-.55,0],spine:[.35,0,.1],chest:[.3,0,.1],neck:[.3,0,0],head:[.55,.3,.3],shL:[.4,0,.5],elL:[-.3,0,0],shR:[.6,0,-.3],elR:[-.2,0,0],thL:[-1.1,0,0],knL:[1.3,0,0],thR:[-.4,0,0],knR:[1.0,0,0],jaw:[.5,0,0]},
  dead:{root:[0,0,0,0,-1.35,0],hips:[-.5,0,.45,0,0,-.3],spine:[-.3,0,.2],chest:[-.3,0,.15],neck:[-.3,0,0],head:[-.5,.6,0],shL:[-.6,0,1.3],shR:[.2,0,-1.0],thL:[-1.3,0,0],knL:[1.5,0,0],thR:[-1.1,0,0],knR:[1.6,0,0],jaw:[.7,0,0]}};
// ---------------- the procedural base layer: breathing, a heavy plodding walk, the head tracking you, ears and jaw ----------------
function gb151Loco(e,S,O,dt,now){const t=now/1000,sp=S.spd||0,a=Math.min(1,sp/2.6);S.gp=(S.gp||0)+dt*(1.3+sp*1.55);const g=S.gp,br=Math.sin(t*1.05);
  O.hips[4]+=.04*br+.1*Math.abs(Math.sin(g))*a-.04*a;O.hips[0]+=.07*a;O.chest[0]+=.035*br;O.neck[0]+=-.03*br;O.jaw[0]+=.04+.04*br;
  ['L','R'].forEach((s,j)=>{const ph=g+j*Math.PI,sw=Math.sin(ph),lf=Math.max(0,Math.cos(ph));
    O['th'+s][0]+=-sw*.5*a;O['kn'+s][0]+=lf*.6*a;O['ft'+s][0]+=-lf*.2*a+sw*.12*a;
    // the arms swing heavily against the legs; the maul arm less (it drags the weight)
    O['sh'+s][0]+=(j?1:-1)*sw*(s==='R'?.14:.28)*a+.03*br;O['el'+s][0]+=-.05*br-.08*a});
  O.hips[2]+=Math.sin(g)*.07*a;O.hips[1]+=Math.sin(g)*.09*a;O.chest[1]+=-Math.sin(g)*.1*a;O.chest[2]+=-Math.sin(g)*.04*a;
  // the head follows the hero (out of moves); the ears flick
  const m=e.m,hx=pl.position.x-m.position.x,hz=pl.position.z-m.position.z,yaw=svAng(Math.atan2(hx,hz)-m.rotation.y),k=S.mv?0:(Math.abs(yaw)<1.6?1:0);
  S.hy=(S.hy||0)+((Math.max(-.7,Math.min(.7,yaw))*k)-(S.hy||0))*Math.min(1,dt*3);O.head[1]+=S.hy*.6;O.neck[1]+=S.hy*.35;
  const fl=Math.max(0,Math.sin(t*2.3)*Math.sin(t*.7))*.3;O.earL[1]+=fl;O.earR[1]-=Math.max(0,Math.sin(t*1.9+1)*Math.sin(t*.8))*.3}
// after the pose: the glacier breathes light (brighter in Phase II and while charging), frost breath, the shell's cracks
function gb151Post(e,S,dt,now){const R=S.R,t=now/1000,ph2=S.ph>1,ch=S.chg||0;
  const k=(ph2?.95:.5)+.16*Math.sin(t*1.05)+ch*1.2;R.ice.emissiveIntensity=k;R.ice2.emissiveIntensity=k*.8;if(ph2){R.ice.emissive.setHex(0x2a7ac0)}
  R.eyeM.color.setHex(ch>.3?0xffffff:ph2?0x9ae8ff:0xcff4ff);
  // the shell (Glacial Rampage): grows in, glows, darkens and cracks as pillars break it
  const sh=S.shell||0;R.shellM.visible=sh>0;if(sh>0){R.shellM.opacity=.82*Math.min(1,sh);const c=S.crk||0;R.shellM.emissiveIntensity=.6+.25*Math.sin(t*4)-c*.18;R.shellM.color.setHex(c>=2?0x8ab8d8:c>=1?0xa8d4f0:0xbfe8ff)}
  if(!S.dieM&&Math.random()<dt*(ph2?5:2.5)){const p=svWP(e,'head',0,-.12,.5);burst(p,0xe8f6ff,2,.2,.3,.9)}
  if(!S.dieM&&ph2&&Math.random()<dt*6){const p=svWP(e,'hump',(Math.random()-.5)*.8,.4+Math.random()*.6,(Math.random()-.5)*.6);burst(p,0x9ad8ff,1,.1,-.4,.7)}}
// preview (v143_look PROPS=gorthrak / gbP:<pose>): the merged model, optionally in a pose
GB151.sheet.gorthrak=()=>{const R=svRig();gb151Build(R,null);svRest(R);svMerge(R);return R.root};
GB151.sheet.gorthrakShell=()=>{const R=svRig();gb151Build(R,null);R.shellM.visible=true;svRest(R);svMerge(R);return R.root};
GB151.pose=(root,R,name)=>{const P=svPose({P:GB151P},name);for(const k in P){const g=R.J[k],o=P[k];if(!g)continue;const r0=g.userData.r0,p0=g.userData.p0;g.rotation.set(r0.x+o[0],r0.y+o[1],r0.z+o[2]);g.position.set(p0.x+(o[3]||0),p0.y+(o[4]||0),p0.z+(o[5]||0))}};
// the picture sheets of every v151 model (test/v143_look.py PROPS=<key>; gbP:<pose> poses Gorthrak, a trailing + shows the shell)
var KQSH151=Object.assign(window.KQSH151||{},GB151.sheet);
