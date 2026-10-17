// ================= v83: low-poly mounts (Valheim style) — uses the bakers in zzG_gear.js =================
// One skinned, vertex-painted body per mount, driven by the same simple gait as before.
// The rig keeps the old shape of mkMountRig: r.b (body, bobbed and pitched), legs [{hip,kn,ph,front}], neck, tail, wings, flame, r.seat.
// hip/kn/neck/head/tail are now Bones, so one seamless mesh bends with them.
var LGMS={
 pony:{L:1.35,H:.48,W:.36,leg:.58,lr:.066,nl:.55,na:.55,hl:.42,hw:.14,hh:.18,c:0x7a5434,c2:0x45301f,bel:0xa88a68,m:0x1e1510,hoof:0x1e1812,eye:0x0e0a08,tl:.55,tr:-2.55,ear:'horse',tail:'hair',mane:1,feath:1},
 boar:{L:1.3,H:.6,W:.46,leg:.38,lr:.08,nl:.22,na:1.2,hl:.44,hw:.22,hh:.26,c:0x4e3e32,c2:0x2e241c,bel:0x6e5c4a,m:0x1a1410,hoof:0x16110e,eye:0xff6a2a,tl:.22,tr:-2.4,ear:'boar',tail:'stub',
   bp:[[-.53,.3,.2,.18,0],[-.45,.78,.38,.38,0],[-.3,.96,.44,.46,0],[-.1,.98,.5,.52,.04],[.12,1.04,.6,.54,.1],[.3,1.08,.62,.52,.12],[.44,.9,.5,.44,.08],[.53,.5,.3,.3,.05]]},
 stag:{L:1.3,H:.42,W:.3,leg:.72,lr:.05,nl:.6,na:.42,hl:.38,hw:.12,hh:.15,c:0xb3a690,c2:0x6e6656,bel:0xe8e0d0,m:0x8a8270,hoof:0x2a2620,eye:0x9ad8ff,tl:.16,tr:-2.1,ear:'deer',tail:'flash'},
 ram:{L:1.2,H:.55,W:.44,leg:.48,lr:.062,nl:.28,na:.8,hl:.34,hw:.14,hh:.17,c:0xcfc3a6,c2:0x2e2824,bel:0xbcb096,m:0xcfc3a6,hoof:0x161210,eye:0xe8c060,tl:.16,tr:-2.4,ear:'droop',tail:'stub',wool:1,face:0x3a322c},
 charger:{L:1.55,H:.55,W:.4,leg:.66,lr:.075,nl:.62,na:.5,hl:.46,hw:.155,hh:.2,c:0x2c1e18,c2:0x1a1210,bel:0x3e2e24,m:0xff6a1a,hoof:0x111111,eye:0xffa040,tl:.6,tr:-2.5,ear:'horse',tail:'fire',fire:1,barding:1},
 raptor:{L:1.1,H:.5,W:.34,leg:.78,lr:.08,nl:.68,na:.45,hl:.56,hw:.12,hh:.16,c:0xc49658,c2:0x7a5228,bel:0xe8d2a6,m:0xc8402e,hoof:0x2a2018,eye:0xffd040,tl:.95,tr:-1.75,biped:1,tail:'thick',stripes:1},
 panther:{L:1.5,H:.42,W:.32,leg:.55,lr:.07,nl:.32,na:.95,hl:.32,hw:.16,hh:.15,c:0x1e1c24,c2:0x131117,bel:0x2c2832,m:0x1e1c24,hoof:0x0e0c12,eye:0x8aff6a,tl:.9,tr:-1.9,ear:'cat',paw:1,tail:'thin',
   bp:[[-.53,.3,.2,.16,0],[-.45,.78,.4,.34,.02],[-.3,.95,.46,.4,.02],[-.1,.8,.4,.4,-.02],[.12,.88,.44,.48,0],[.3,1.02,.5,.5,.04],[.44,.86,.44,.42,.06],[.53,.5,.28,.28,.08]]},
 destrier:{L:1.5,H:.52,W:.36,leg:.68,lr:.04,nl:.6,na:.5,hl:.46,hw:.13,hh:.18,c:0xd8d0b8,c2:0xa89e84,bel:0xd8d0b8,m:0x6affc8,hoof:0x3a3a3a,eye:0x6affc8,tl:.5,tr:-2.5,skel:1,ear:'none',tail:'ghost'},
 direwolf:{L:1.55,H:.56,W:.4,leg:.66,lr:.08,nl:.42,na:.85,hl:.48,hw:.17,hh:.19,c:0x423d3c,c2:0x262222,bel:0x7a7270,m:0x2a2626,hoof:0x141212,eye:0xff2a1a,tl:.6,tr:-2.2,ear:'wolf',paw:1,ruff:1,tail:'bushy'},
 drake:{L:1.6,H:.56,W:.42,leg:.6,lr:.09,nl:.7,na:.6,hl:.48,hw:.15,hh:.17,c:0x4e1e2a,c2:0x2a0e16,bel:0xb8683a,m:0x5a2030,hoof:0x18080e,eye:0xffb03a,tl:1.1,tr:-1.9,paw:1,wings:1,tail:'thick',spikes:1}
};
var LGSK={};
// skinned loft geometry in model space; bones are given by name (bn = names in skeleton order)
function lgSkinGeo(key,bn,lofts,seed){
  if(LGSK[key])return LGSK[key];
  const P=[],Cc=[],SI=[],SW=[],IX=[],R=dkRng(seed||77),V=THREE.Vector3,tmp=new THREE.Color();
  const bi=b=>{const i=bn.indexOf(b);if(i<0)throw new Error('mount: no bone '+b);return i};
  lofts.forEach(Lf=>{
    const rings=Lf.rings,seg=Lf.seg||8,ref=Lf.ref.clone(),base=P.length/3,pts=rings.map(r=>new V(r.p[0],r.p[1],r.p[2]));
    rings.forEach((r,i)=>{
      const tg=pts[Math.min(i+1,pts.length-1)].clone().sub(pts[Math.max(i-1,0)]).normalize(),U=ref.clone().sub(tg.clone().multiplyScalar(ref.dot(tg))).normalize(),Sd=new V().crossVectors(U,tg);
      for(let k=0;k<seg;k++){
        const a=Math.PI/2+k/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a),ry=s>0?(r.ryT==null?r.rx:r.ryT):(r.ryB==null?r.rx:r.ryB),j=r.j?1+(R()-.5)*r.j:1;
        P.push(pts[i].x+(Sd.x*c*r.rx+U.x*s*ry)*j,pts[i].y+(Sd.y*c*r.rx+U.y*s*ry)*j,pts[i].z+(Sd.z*c*r.rx+U.z*s*ry)*j);
        Lf.paint(tmp,r,s,c,i);tmp.multiplyScalar(.88+R()*.17);Cc.push(tmp.r,tmp.g,tmp.b);
        SI.push(bi(r.b[0]),bi(r.b[1]),0,0);SW.push(1-(r.b[2]||0),r.b[2]||0,0,0)}});
    for(let i=0;i<rings.length-1;i++)for(let k=0;k<seg;k++){const a=base+i*seg+k,a1=base+i*seg+(k+1)%seg,b2=a+seg,b3=a1+seg;IX.push(a,a1,b2,b2,a1,b3)}
    [[Lf.capA,0],[Lf.capB,rings.length-1]].forEach(q=>{if(!q[0])return;const r=rings[q[1]],ci=P.length/3;P.push(pts[q[1]].x,pts[q[1]].y,pts[q[1]].z);
      const o=base+q[1]*seg;Lf.paint(tmp,r,q[1]?1:-1,0,q[1]);Cc.push(tmp.r,tmp.g,tmp.b);SI.push(bi(r.b[0]),bi(r.b[1]),0,0);SW.push(1-(r.b[2]||0),r.b[2]||0,0,0);
      for(let k=0;k<seg;k++){const a=o+k,a1=o+(k+1)%seg;if(q[1])IX.push(ci,a,a1);else IX.push(ci,a1,a)}})});
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
  G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(SW,4));G.setIndex(IX);G.computeVertexNormals();G.computeBoundingSphere();G.userData.lps=1;return LGSK[key]=G}

mkMountRig=function(k){
  if(!LGMS[k])k='pony';const S=LGMS[k],r=new THREE.Group(),V=THREE.Vector3,C=c=>new THREE.Color(c);
  const L=S.L,H=S.H,Wd=S.W,leg=S.leg,top=leg+H*.95,mid=leg+H*.5,biped=!!S.biped,skel=!!S.skel;
  const b=new THREE.Bone();r.add(b);r.b=b;const bones=[b],names=['b'],legs=[],flame=[];let wings=null;
  const bone=(nm,par,x,y,z,rx)=>{const o=new THREE.Bone();o.position.set(x,y,z);if(rx)o.rotation.x=rx;par.add(o);bones.push(o);names.push(nm);return o};
  const neck=bone('neck',b,0,biped?mid+H*.1:top-H*.2,biped?L*.38:L*.44,S.na),head=bone('head',neck,0,S.nl,0,-S.na+.32),tail=bone('tail',b,0,biped?mid:top-H*.15,-L*.48,S.tr);
  const legAt=biped?[[-Wd*.55,-.02,0],[Wd*.55,-.02,Math.PI]]:[[-Wd*.62,L*.33,0],[Wd*.62,L*.33,Math.PI],[-Wd*.62,-L*.33,Math.PI],[Wd*.62,-L*.33,0]];
  const hipY=leg+H*.18,u=hipY*.52,l=hipY-u;
  legAt.forEach(([x,z,ph],i)=>{const hip=bone('h'+i,r,x,hipY,z),kn=bone('k'+i,hip,0,-u,0);legs.push({hip,kn,ph,front:biped?i==0:i<2,x,z})});
  r.updateMatrixWorld(true);
  const W=(o,p)=>o.localToWorld(new V(p[0],p[1],p[2])).toArray(),D=(o,p)=>new V(p[0],p[1],p[2]).transformDirection(o.matrixWorld);
  const cM=C(S.c),c2=C(S.c2),bel=C(S.bel),mn=C(S.m),hf=C(S.hoof),back=cM.clone().lerp(c2,.45),face=S.face!=null?C(S.face):null;
  // ---- skinned body ----
  const geo=lgSkinGeo('LMB|'+k,names,(()=>{const lofts=[];
    if(!skel){const BP=S.bp||[[-.53,.3,.22,.18,.02],[-.45,.78,.42,.38,.03],[-.3,1,.5,.46,.03],[-.1,.94,.47,.5,0],[.12,.96,.48,.52,0],[.3,1.04,.52,.5,.03],[.44,.86,.46,.44,.06],[.53,.5,.3,.3,.1]];
      lofts.push({seg:9,ref:new V(0,1,0),capA:1,capB:1,rings:BP.map(q=>({p:[0,mid+q[4]*H,q[0]*L],rx:Wd*q[1],ryT:H*q[2],ryB:H*q[3],b:['b','b',0],j:S.wool?.3:.05,z:q[0]})),
        paint:(o,rg,s)=>{o.copy(cM);if(s>.55)o.lerp(back,.6);if(s<-.45)o.lerp(bel,Math.min(1,(-s-.45)*2.2));if(S.stripes&&s>-.2&&Math.sin(rg.z*28)>.35)o.lerp(c2,.6);if(S.wool)o.lerp(C(0xe8e0cc),.15*(s+1))}})}
    else lofts.push({seg:6,ref:new V(0,1,0),capA:1,capB:1,rings:[[-.5,.04],[-.25,.05],[0,.045],[.25,.05],[.5,.04]].map(q=>({p:[0,top-.04,q[0]*L],rx:q[1],ryT:q[1]*1.2,ryB:q[1],b:['b','b',0]})),paint:(o)=>o.copy(cM)});
    // neck
    {const n=5,ref=D(neck,[0,0,1]);lofts.push({seg:skel?6:8,ref,rings:Array.from({length:n},(_,i)=>{const t=i/(n-1),y=-.1+(S.nl+.14)*t,th=skel?.05:S.hw*(1.25-.4*t)*(i==0?1.35:1);
      return {p:W(neck,[0,y,0]),rx:skel?.045:th*.82,ryT:skel?.055:th*1.05,ryB:skel?.05:th*.9,b:i==0?['b','neck',.55]:i==n-1?['neck','head',.5]:['neck','neck',0]}}),
      paint:(o,rg,s)=>{o.copy(cM);if(!skel&&s>.3)o.lerp(bel,.35);if(!skel&&s<-.5)o.lerp(back,.5)}})}
    // head: skull to snout along head +z
    {const ref=D(head,[0,1,0]),hl=S.hl,hw=S.hw,hh=S.hh,HP=[[-.14,.55,.42,.42,.06],[0,.95,.6,.52,.05],[.25,1,.56,.55,0],[.55,.74,.42,.46,-.12],[.85,.6,.34,.38,-.2],[1,.44,.25,.26,-.22]];
      lofts.push({seg:8,ref,capA:1,capB:1,rings:HP.map((q,i)=>({p:W(head,[0,q[4]*hh,q[0]*hl]),rx:hw*q[1],ryT:hh*q[2],ryB:hh*q[3],b:['head','head',0],i})),
        paint:(o,rg,s)=>{o.copy(cM);if(face&&rg.i>0)o.copy(face);if(!skel&&s<-.4&&!face)o.lerp(bel,.5);if(rg.i>=5&&!skel)o.lerp(C(k=='boar'?0x8a5a5a:0x141010),k=='boar'?.6:.75);if(skel&&rg.i>=4)o.lerp(c2,.4)}})}
    // tail
    {const tp={hair:[.05,.085,.1,.085,.03],fire:[.05,.07,.06,.04,.015],ghost:[.03,.03,.025,.02,.01],stub:[.05,.06,.045,.02],flash:[.045,.06,.05,.02],thick:[.12,.09,.065,.04,.012],thin:[.045,.04,.035,.028,.014],bushy:[.065,.11,.12,.09,.02]}[S.tail]||[.05,.04,.02],
      ref=D(tail,[0,0,1]),n=tp.length;
      lofts.push({seg:S.tail=='bushy'||S.tail=='hair'?7:6,ref,capB:1,rings:tp.map((t,i)=>({p:W(tail,[0,-.08+(S.tl+.08)*i/(n-1),0]),rx:t,ryT:t,ryB:t,b:i==0?['b','tail',.6]:['tail','tail',0],j:S.tail=='bushy'||S.tail=='hair'?.3:0,i})),
        paint:(o,rg,s)=>{o.copy(S.tail=='hair'?mn:cM);if(S.tail=='flash'&&s<0)o.copy(C(0xf0ece4));if(S.tail=='bushy'&&rg.i>=3)o.lerp(c2,.6);if(S.spikes&&rg.i>=3)o.lerp(c2,.4)}})}
    // legs: one loft per leg, hip→knee→hoof/paw
    legs.forEach((q,i)=>{const x=q.x,z=q.z,h='h'+i,kn='k'+i,lr=S.lr,hind=!q.front,paw=S.paw||biped,th=hind?1.18:1;
      const R=skel?[[hipY+.05,1.6,[h,h,0]],[hipY-u*.4,1.1,[h,h,0]],[hipY-u+.02,1.6,[h,kn,.5]],[hipY-u-.04,1.1,[kn,kn,0]],[.12,1,[kn,kn,0]],[.07,1.5,[kn,kn,0],1],[0,1.6,[kn,kn,0],1]]
        :biped?[[hipY+H*.25,2.1,['b',h,.7]],[hipY-u*.3,1.9,[h,h,0]],[hipY-u+.03,1.15,[h,kn,.5]],[hipY-u-l*.45,.8,[kn,kn,0]],[.1,.75,[kn,kn,0]],[.05,1.1,[kn,kn,0],1],[0,1.2,[kn,kn,0],1]]
        :[[hipY+H*.22,1.95*th,['b',h,.72]],[hipY-u*.35,1.5*th,[h,h,0]],[hipY-u+.02,1.0,[h,kn,.5]],[hipY-u-l*.45,.78,[kn,kn,0]],[.11,.8,[kn,kn,0]],[.065,paw?1.1:1.05,[kn,kn,0],1],[0,paw?1.2:1.12,[kn,kn,0],1]];
      lofts.push({seg:skel?5:8,ref:new V(0,0,1),capB:1,rings:R.map((w,j)=>({p:[x,w[0],z+(j>=5?(paw?.035:.015):0)+(hind&&j==1?-.03:0)],rx:lr*w[1],ryT:lr*w[1]*(paw&&j>=5?1.25:1),ryB:lr*w[1],b:w[2],ft:w[3],ix:j})),
        paint:(o,rg,s)=>{if(rg.ft&&!paw){o.copy(hf);return}o.copy(cM);if(rg.ix>=3)o.lerp(c2,skel?.2:.55);if(rg.ft)o.lerp(c2,.4);if(S.feath&&rg.ix>=4&&!rg.ft)o.copy(C(0xc8b8a0));if(S.wool&&rg.ix<=1)o.lerp(C(0xe8e0cc),.3);if(S.wool&&rg.ix>=2)o.copy(c2)}})});
    return lofts})(),k.length*31+5);
  const mesh=new THREE.SkinnedMesh(geo,lpMat('',1));mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.userData.lps=1;r.add(mesh);
  r.updateMatrixWorld(true);mesh.bind(new THREE.Skeleton(bones));
  // ---- rigid details on bones (coordinates in that bone's local frame) ----
  const att=(o,key,build,mot)=>{const g=lgGroup('LM|'+k+'|'+key,build,mot);o.add(g);return g};
  const hl=S.hl,hw=S.hw,hh=S.hh,eyeG=S.eye!=0x0e0a08;
  att(head,'head',kk=>{
    [-1,1].forEach(s=>{kk.p('','box',eyeG?'g':'c',S.eye,s*hw*.9,hh*.14,hl*.3,.024,.022,.05,0,s*.25,0);kk.p('','box','c',dkShade(S.c,.55),s*hw*.86,hh*.27,hl*.3,.03,.016,.08,0,s*.3,-s*.25);
      if(!skel)kk.p('','box','c',0x0c0808,s*hw*.24,-hh*.13,hl*1.0,.022,.02,.02);
      const er=S.ear,ec=dkShade(S.c,.8),ei=0xc8b4a0;
      if(er=='horse'){kk.p('','cone4','c',ec,s*hw*.55,hh*.62,hl*.0,.035,.14,.026,-.25,0,-s*.2)}
      else if(er=='deer'){kk.p('','cone4','c',ec,s*hw*.85,hh*.42,-hl*.02,.05,.16,.022,-.2,0,-s*.95);kk.p('','cone4','c',ei,s*hw*.86,hh*.42,-hl*.0,.035,.12,.012,-.2,0,-s*.95)}
      else if(er=='wolf'){kk.p('','cone4','c',dkShade(S.c,.7),s*hw*.6,hh*.65,-hl*.06,.06,.16,.03,-.25,0,-s*.28)}
      else if(er=='cat'){kk.p('','cone4','c',S.c,s*hw*.66,hh*.55,-hl*.04,.05,.1,.025,-.2,0,-s*.4)}
      else if(er=='boar'){kk.p('','cone4','c',dkShade(S.c,.8),s*hw*.7,hh*.55,-hl*.05,.065,.14,.03,.35,0,-s*.85)}
      else if(er=='droop'){kk.p('','cone4','c',S.face||S.c,s*hw*1.05,hh*.15,hl*.02,.04,.12,.02,0,0,-s*1.9)}});
    if(S.mane||S.fire)kk.p('','cone4','c',S.fire?0x1a1210:S.m,0,hh*.55,hl*.02,.05,.12,.03,.6);
    if(k=='boar'){[-1,1].forEach(s=>{kk.L('','c',0xe8e0c8,[s*hw*.5,-hh*.18,hl*.9],[s*hw*.85,hh*.15,hl*.86],.026,.008,5)});kk.p('','cyl','c',0x8a5a5a,0,-hh*.06,hl*1.02,hw*.42,.03,hh*.24,Math.PI/2)}
    if(k=='stag'){const ant=0xc8bca4;[-1,1].forEach(s=>{const a=[s*hw*.45,hh*.5,hl*.02],b2=[s*hw*2.0,hh*2.0,-hl*.15],c=[s*hw*3.6,hh*3.2,-hl*.4];kk.L('','c',ant,a,b2,.034,.028,5).L('','c',ant,b2,c,.028,.012,5);
      kk.L('','c',ant,b2,[s*hw*1.7,hh*3.3,hl*.2],.018,.006,4).L('','c',ant,[s*hw*2.8,hh*2.6,-hl*.27],[s*hw*2.9,hh*3.9,-hl*.15],.015,.005,4).L('','c',ant,c,[s*hw*4.6,hh*3.7,-hl*.6],.014,.004,4).L('','c',ant,c,[s*hw*3.9,hh*4.3,-hl*.3],.013,.004,4).L('','c',ant,[s*hw*1.2,hh*1.3,-hl*.06],[s*hw*.9,hh*2.0,hl*.4],.016,.005,4)})}
    if(k=='ram'){[-1,1].forEach(s=>{let p=[s*hw*.6,hh*.55,-hl*.02];for(let i=1;i<=9;i++){const a=i/9*Math.PI*1.75,rr=.16-i*.008,q=[s*(hw*.75+.02+i*.009),hh*.25+Math.cos(a)*rr,-hl*.12-Math.sin(a)*rr+.03];kk.L('','c',i%2?0x6a6058:0x5a5048,p,q,.06-i*.004,.056-i*.004,6);p=q}})}
    if(k=='charger'){kk.p('','box','m',0x4a4e56,0,hh*.5,hl*.5,hw*1.1,.03,hl*.7,.2);kk.p('','cone4','m',0x9a7838,0,hh*.62,hl*.4,.022,.14,.022,-.3);[-1,1].forEach(s=>kk.p('','box','m',0x5c6068,s*hw*.88,hh*.15,hl*.12,.016,hh*.55,hl*.3))}
    if(k=='raptor'){for(let i=0;i<5;i++)kk.p('','cone4','c',S.m,0,hh*.5,hl*.25-i*.07,.025,.12+(i==1||i==2?.07:0),.02,-.55);for(let i=0;i<6;i++)[-1,1].forEach(s=>kk.p('','cone4','c',0xe8e0d0,s*hw*.5,-hh*.28,hl*(.45+i*.09),.008,.03,.008,Math.PI))}
    if(k=='panther'||k=='direwolf'){[-1,1].forEach(s=>kk.p('','cone4','c',0xe8e0d0,s*hw*.3,-hh*.32,hl*.85,.012,.07,.012,Math.PI))}
    if(k=='drake'){[-1,1].forEach(s=>{kk.L('','c',0x1a0a10,[s*hw*.55,hh*.45,hl*.0],[s*hw*.8,hh*1.1,-hl*.55],.035,.006,5);kk.L('','c',0x1a0a10,[s*hw*.95,hh*.05,-hl*.0],[s*hw*1.4,hh*.25,-hl*.45],.025,.004,4);kk.p('','cone4','c',0xe8e0d0,s*hw*.35,-hh*.25,hl*.82,.012,.05,.012,Math.PI)});kk.p('','cone4','c',0x1a0a10,0,hh*.15,hl*.95,.02,.08,.02,.4)}
    if(skel){[-1,1].forEach(s=>kk.p('','box','c',0x0a0806,s*hw*.7,hh*.1,hl*.25,.05,.05,.08));for(let i=0;i<5;i++)kk.p('','box','c',0xe8e0c8,(i-2)*hw*.18,-hh*.22,hl*.9,.018,.03,.015)}},.12);
  // neck details: manes, hackles, vertebrae, armour
  att(neck,'neck',kk=>{
    if(S.mane)for(let i=0;i<8;i++){const t=i/7;kk.p('','cone4','c',i%2?S.m:dkShade(S.m,1.4),0,.04+t*S.nl,-S.hw*.75,.05,.17+(i%3)*.04,.03,-.9-t*.3)}
    if(S.ruff)for(let i=0;i<11;i++){const a=-1.7+i*.34;kk.p('','cone4','c',i%2?S.c2:dkShade(S.c,1.15),Math.sin(a)*S.hw*1.2,.02+(i%3)*.04,-Math.cos(a)*S.hw*1.1,.06,.2,.04,-Math.cos(a)*.9-.3,0,Math.sin(a)*1.1)}
    if(S.spikes)for(let i=0;i<5;i++)kk.p('','cone4','c',0x1a0a10,0,.05+i*S.nl*.2,-S.hw*.85,.035,.12,.03,-1.2);
    if(skel)for(let i=0;i<5;i++)kk.p('','box','c',S.c2,0,.02+i*S.nl*.2,0,.11,.04,.11);
    if(S.barding)for(let i=0;i<4;i++)kk.p('','box','m',i%2?0x4a4e56:0x5c6068,0,.06+i*S.nl*.2,S.hw*.35,S.hw*1.9,.07,S.hw*1.2,.15)},.14);
  // body details: barding, bristles, spikes, ribs, wool, arms
  att(b,'body',kk=>{
    if(k=='boar')for(let i=0;i<10;i++)kk.p('','cone4','c',i%2?0x1a1410:0x2e241c,0,top+.04+H*.08*Math.sin(i/9*Math.PI),L*.36-i*L*.08,.06,.2+(i%2)*.07,.04,-.35);
    if(k=='direwolf')for(let i=0;i<7;i++)kk.p('','cone4','c',S.c2,0,top-.02,L*.3-i*.12,.06,.16,.04,-.75);
    if(S.spikes)for(let i=0;i<9;i++)kk.p('','cone4','c',0x1a0a10,0,top+.02,L*.4-i*L*.1,.05,.14+(i%2)*.06,.04,-.35);
    if(S.wool){const R=dkRng(3);for(let i=0;i<7;i++){const z=-L*.36+i*L*.12;kk.p('','ico','c',i%2?0xc8bca0:0xbcb094,(R()-.5)*.06,top-.06+R()*.03,z,.13+R()*.03,.1,.13)}}
    if(S.barding){kk.p('','box','m',0x5c6068,0,mid,L*.48,Wd*1.7,H*.62,.05,.25);kk.p('','box','m',0x9a7838,0,mid+.05,L*.47,Wd*.5,H*.3,.04);
      [-1,1].forEach(s=>{for(let i=0;i<6;i++)kk.p('','box','c',i%2?0x6a1414:0x7e1a1a,s*Wd*1.02,mid-H*.08,-L*.3+i*L*.11,.03,H*.55,L*.11);kk.p('','box','c',0xb8962e,s*Wd*1.04,mid+H*.2,0,.034,.05,L*.66)})}
    if(skel){for(let i=0;i<6;i++){const z=-L*.28+i*L*.11,s=1-Math.abs(i-2.5)*.08;kk.p('',lgGeoC('rib',()=>new THREE.TorusGeometry(1,.09,4,8,Math.PI)),'c',S.c,0,mid+H*.12,z,Wd*.95*s,H*.48*s,1,0,0,Math.PI)}
      kk.p('','box','c',S.c2,0,mid+.06,-L*.4,Wd*1.4,H*.4,.2);kk.p('','box','c',S.c2,0,mid+.1,L*.36,Wd*1.3,H*.45,.14);for(let i=0;i<9;i++)kk.p('','box','c',S.c2,0,top-.02,-L*.45+i*L*.11,.06,.07,.06)}
    if(biped)[-1,1].forEach(s=>{kk.L('','c',S.c,[s*Wd*.75,mid,L*.3],[s*Wd*.85,mid-.14,L*.42],.035,.03,5);kk.L('','c',S.c2,[s*Wd*.85,mid-.14,L*.42],[s*Wd*.85,mid-.2,L*.52],.028,.01,4)});
    if(S.stripes)for(let i=0;i<4;i++)kk.p('','cone4','c',S.m,0,top-.02,L*.2-i*.12,.035,.1,.025,-.6)},.12);
  // tail details
  att(tail,'tail',kk=>{
    if(S.spikes)for(let i=0;i<5;i++)kk.p('','cone4','c',0x1a0a10,0,.15+i*S.tl*.18,-.06,.03,.1,.025,Math.PI/2+.4);
    if(k=='drake')kk.p('','cone4','c',S.c2,0,S.tl+.05,0,.09,.16,.02);
    if(k=='raptor')for(let i=0;i<3;i++)kk.p('','cone4','c',S.m,0,S.tl*.6+i*.1,-.04,.025,.12,.02,-.5)},.12);
  // claws, toes
  legs.forEach(q=>{if(S.paw||biped)att(q.kn,'paw'+(biped?'b':''),kk=>{for(let j=-1;j<=1;j++)kk.p('','cone4','c',0x0e0c0a,j*S.lr*.5,-l+.02,S.lr*(biped?2.2:1.6),.012,biped?.08:.045,.012,Math.PI/2)},0)});
  // glowing flames (each one flickers on its own)
  const fl=(o,key,x,y,z,s,rx,col)=>{const g=att(o,'f'+key,kk=>kk.p('','cone4','g',col||S.m,0,.5*s,0,.35*s,s,.2*s),0);g.position.set(x,y,z);g.rotation.x=rx||0;flame.push(g)};
  if(S.fire){for(let i=0;i<7;i++)fl(neck,'m'+i,0,.06+i*S.nl*.14,-S.hw*.7,.14+(i%2)*.05,-.9,i%2?0xffb040:S.m);for(let i=0;i<4;i++)fl(tail,'t'+i,0,S.tl*(i+.5)/4,0,.16,0,i%2?0xffb040:S.m)}
  if(skel){for(let i=0;i<7;i++)fl(neck,'gm'+i,0,.06+i*S.nl*.14,-.06,.13+(i%2)*.05,-.9,i%2?0xbaffe8:S.m);for(let i=0;i<4;i++)fl(tail,'gt'+i,0,S.tl*(i+.5)/4,0,.15,0,S.m);
    const core=att(b,'core',kk=>kk.p('','oct','g',S.m,0,0,0,.12,.17,.12),0);core.position.set(0,mid,0);flame.push(core)}
  if(k=='drake'){const bl=att(b,'belly',kk=>kk.p('',lgLump('belly',1,.1,6),'g',0xff7a2a,0,0,0,Wd*.62,H*.1,L*.34),0);bl.position.set(0,mid-H*.38,0);flame.push(bl);
    wings=[-1,1].map(s=>{const w=new THREE.Group();w.position.set(s*Wd*.75,top-.05,L*.18);b.add(w);
      const m=lgGroup('LM|drake|wing'+s,kk=>{const pts=[[0,0],[1.1,.35],[1.25,-.05],[.85,-.35],[.5,-.55],[0,-.45]].map(p=>[s*p[0],0,-p[1]]);
        const g=lgGeoC('wing'+s,()=>{const P=[];for(let i=1;i<pts.length-1;i++){const tri=s>0?[pts[0],pts[i],pts[i+1]]:[pts[0],pts[i+1],pts[i]];tri.forEach(p=>P.push(p[0],p[1],p[2]))}const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.computeVertexNormals();return G});
        kk.p('',g,'c',0x6a2232,0,0,0,1,1,1);[[1.1,.35],[1.25,-.05],[.85,-.35],[.5,-.55]].forEach(([x,z])=>kk.L('','c',0x2a0e16,[0,.01,0],[s*x,.01,-z],.025,.008,4));kk.p('','cone4','c',0xd8d0b8,s*1.1,.01,-.35,.015,.08,.015,0,0,-s*1.57)},.18);
      w.add(m);w.side=s;return w})}
  r.rig=(now,mv,sp)=>{const t=now/1000,ph=t*(sp||3)*2.3;
    legs.forEach(q=>{const a=mv?Math.sin(ph+q.ph+(q.front?0:.5)):0;q.hip.rotation.x=a*(biped?.7:.55);q.kn.rotation.x=mv?Math.max(0,-Math.cos(ph+q.ph))*(q.front?-.9:.9)*(biped?-1:1):0});
    b.position.y=mv?Math.abs(Math.sin(ph))*(biped?.06:.04):Math.sin(t*1.6)*.008;b.rotation.x=mv?Math.sin(ph*2)*.02:0;
    neck.rotation.x=S.na+(mv?Math.sin(ph*2)*.06:Math.sin(t*1.1)*.04);
    tail.rotation.z=Math.sin(t*(mv?6:2.2))*(mv?.18:.12);
    flame.forEach((m,i)=>{const f=.85+.25*Math.sin(t*9+i*1.7);m.scale.y=Math.abs(m.scale.y)/(m.userData.f||1)*f;m.userData.f=f});
    if(wings)wings.forEach(w=>{w.rotation.z=w.side*(mv?.25+Math.sin(ph)*.35:.55+Math.sin(t*1.4)*.05)})};
  r.seat=[top+(skel?.04:0),biped?-.05:-L*.04];
  return r};
// the saddle: blanket in the mount's tier colour, leather seat with a raised cantle, stirrups
mountModel=function(k){
  const r=mkMountRig(MOUNTS[k]?k:'pony'),g=new THREE.Group();g.add(r);g.r=r;g.seat=r.seat;
  const sd=new THREE.Group();sd.position.set(0,r.seat[0]-.06,r.seat[1]);g.add(sd);g.sd=sd;
  const T=(MOUNTS[k]&&MOUNTS[k].t)||1,blk=[0x6a1a1a,0x2a3a5a,0x3a4a2a,0x4a2a5a,0x1a1a1e][Math.max(0,Math.min(4,T-1))];
  sd.add(lgGroup('LSD|'+T,kk=>{const lea=0x5a3420,lea2=0x3a2214,brs=T>=3?0x9a7838:0x5c6068;
    kk.p('','box','c',blk,0,-.025,0,.66,.03,.74);[-1,1].forEach(s=>{kk.p('','box','c',blk,s*.33,-.12,0,.02,.2,.74);kk.p('','box','c',0xb8962e,s*.335,-.22,0,.022,.025,.74)});
    kk.p('','box','c',lea,0,.03,0,.44,.08,.56);kk.p('','box','c',lea2,0,.1,-.25,.42,.14,.08,-.25);kk.p('','box','c',lea2,0,.08,.25,.2,.1,.08,.3);kk.p('','cyl','m',brs,0,.15,.29,.035,.06,.035);
    [-1,1].forEach(s=>{kk.p('','box','c',lea2,s*.25,-.2,0,.025,.38,.05);kk.p('',lgGeoC('stir',()=>new THREE.TorusGeometry(.055,.012,4,6)),'m',brs,s*.26,-.42,0,1,1,1);kk.p('','box','m',brs,s*.26,-.47,0,.08,.015,.1);
      kk.p('','box','c',lea2,s*.24,-.02,-.08,.02,.18,.05)});kk.p('','box','c',lea2,0,-.06,.0,.7,.03,.06)},.14));
  g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g};
