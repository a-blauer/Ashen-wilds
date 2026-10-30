// ================= v164: camps (3/3): the dressing round each camp's core =================
// cs164Dress(C,K) runs inside cs123Build (3241) with the v123 kit K, after the camp's own v123 design has been built on its core
// (radius C.rc). It adds, from the recipe cs164Rec(C.key) (3240) and the zone's palette cs164Pal:
//   1. the heart of the settlement: a bonfire (the camp's main light) with log seats, a cooking spit or a cauldron;
//   2. dwellings (d) round the ring between the core and the fence, doors toward the middle; rope lines with pennants;
//   3. works (w): stores, racks, forges, bedrolls, altars, totems, cages, carts, graves...; wet camps get boardwalks;
//   4. the fence (f) on the earth bank (3240 raises it): palisade, stake lines, dry-stone, ruined walls, ice, iron, bone, hedge,
//      roots or reeds, with breaches, and a gate at every way in (where the road crosses, or toward the road with a trail);
//   5. outskirts (o) beyond the fence and along the trail: watchtowers, lantern posts, banners, cairns, dead trees, giant fungus,
//      ruins, bones, ice, cacti...; and ground clutter (c) through the settlement.
// Everything stays off the road through the camp and off the trail, blocks only the tiles under solid pieces, and is seeded from
// the camp (K.rn), so co-op partners build the same camp.
function cs164Pal(z,k){const P=[
  {wood:0x3e3022,woodD:0x2a2016,hide:[0x4a3a2a,0x3e3626,0x52422e],cloth:[0x3a4a30,0x4a3e2a,0x2e3a2e],thatch:0x3a3a26,stone:0x4a4a40,stoneD:0x34342c,metal:0x3a3a36,bone:0xb8b8a0,acc:0x3a5a2a,trim:0xa07a3a,lant:0xffb050,fire:0xff8a2a,caps:[0x8aff6a,0x4ad8a0,0x6ad8ff],gnd:0x1e1a12},
  {wood:0x5a3e24,woodD:0x3e2a18,hide:[0x4a6a3a,0x6a5a3a,0x5a6a3a],cloth:[0x2a6a5a,0x8a6a3a,0x6a3a2a],thatch:0x8a7a4a,stone:0x8a8a7a,stoneD:0x6a6a5a,metal:0x5a5a60,bone:0xd8d0b0,acc:0x2a6a5a,trim:0xa07a3a,lant:0xffc060,fire:0xff8a3a,caps:[0xc8a060,0x8a6a3a],gnd:0x4a3c28},
  {wood:0x4a3626,woodD:0x2e2218,hide:[0x7a6a5a,0x5a4a3a,0x8a7a66],cloth:[0x3a4a6a,0x5a4a3a,0x6a6a7a],thatch:0x6a5a46,stone:0x5a5e6a,stoneD:0x44484f,metal:0x4a4e56,bone:0xe0dccc,acc:0x3a4a6a,trim:0xa0a0b0,lant:0x9ad8ff,fire:0xff7a2a,caps:[0x9ad8ff,0xbfe6ff],gnd:0x8a8e96,snow:1},
  {wood:0x6a5038,woodD:0x4a3626,hide:[0xb8844a,0x9a6a3a,0xc8a46a],cloth:[0x8a3a2a,0xd8c8a0,0x3a5a7a],thatch:0xb8945a,stone:0xc8a46a,stoneD:0xa0804a,metal:0x8a6a3a,bone:0xf0e6cc,acc:0x8a3a2a,trim:0xd8a830,lant:0xffa030,fire:0xffa030,caps:[0xd8b86a],gnd:0x9a7a4a},
  {wood:0x2e2a26,woodD:0x1e1c1a,hide:[0x3a3e44,0x2e2e2a,0x4a4a44],cloth:[0x2a3a3a,0x3a3e44,0x4a4a44],thatch:0x3a3a34,stone:0x7a7e86,stoneD:0x5a5e66,metal:0x2a2a2e,bone:0xd8d4c4,acc:0x2a3a3a,trim:0x9ab0a8,lant:0x9affe8,fire:0x7affd0,caps:[0x9affe8,0x6ad8c8],gnd:0x2a2c30},
  {wood:0x2a2018,woodD:0x1a1410,hide:[0x3a1418,0x2a2228,0x4a2028],cloth:[0x6a1018,0x3a1418,0x2a2228],thatch:0x3a2a28,stone:0x4a424a,stoneD:0x3a3238,metal:0x2a2a2e,bone:0xd8d0c0,acc:0x6a1018,trim:0xb08a3a,lant:0xff6a40,fire:0xff5a2a,caps:[0xb01020],gnd:0x2a2020}][z]||null;
  const p=Object.assign({},P);
  if(z===0&&k===1){p.stone=0x3a4a44;p.stoneD=0x2a3430;p.lant=0x5affb0;p.caps=[0x5affb0,0x6ad8ff,0x8aff5a]}
  if(z===1&&k===2){p.stone=0x7a7a72;p.stoneD=0x5a5a52}
  if(z===2&&k===1){p.stone=0x6a7a8e;p.lant=0x6ad0ff}
  if(z===3&&k===2){p.stone=0xe0d8c8;p.stoneD=0xb8b0a0}
  if(z===5&&k===2){p.cloth=[0x7a0a14,0x2a1418,0x4a3a3a]}
  return p}
function cs164Dress(C,K){const o=C.site,I=INSL[C.ig];if(!o||!I)return;const rec=cs164Rec(C.key),pal=cs164Pal(I.z,I.k);if(!pal)return;
  const {rn,rr,pk,gy,S,G,T,put,putY,sub,blk,take,free,flame,halo,fire,brazier,torch,candles,rock,slab,pillar,fallen,arch,wall,rubble,obelisk,crate,barrel,urn,stake,banner,
    tent,aTent,table,rack,dummy,drum,cauldron,sack,skull,skullPole,bones,bonePile,ribcage,femur,grave,coffin,carcass,reeds,shroom,crystals,deadTree,log,stump,web,cocoon,eggs,nest,
    hole,mound,figure,cage,chainPost,roseBush,catapult,mausoleum,palm,leanTo,ice,shell,meatRack,antlers,husk,burrowMouth,steam,ladder,Q}=K;
  const TAU=6.2832,P2=Math.PI/2,r=o.r,rc=o.rc,rf=o.rf,fk=rec.f,DW=MAP.DW,big=r>=rc+5,Lc=rec.l&&rec.l.length?rec.l:[pal.fire];
  const WOOD=S(pal.wood),WD=S(pal.woodD),BONE=S(pal.bone),STN=S(pal.stone),STD=S(pal.stoneD),MET=S(pal.metal,{metalness:.6,roughness:.45}),DARK=G(0x080606);
  // world checks in camp space
  const tile=(x,z)=>{const X=Math.round(C.x+x),Z=Math.round(C.z+z);return MAP[Z]&&MAP[Z][X]};
  const ground=(x,z,m)=>{const X=Math.round(C.x+x),Z=Math.round(C.z+z),t=MAP[Z]&&MAP[Z][X];if(!t||t=='~'||insAt(X,Z)!==I)return false;return DW[Z*W+X]<-(m==null?.6:m)};
  const RP=[];cs164Road(I).forEach(q=>{const x=q[0]-C.x,z=q[1]-C.z;if(Math.abs(x)<r+10&&Math.abs(z)<r+10)RP.push([x,z])});
  const kept=(x,z)=>{const X=C.x+x,Z=C.z+z,g=I.g;try{return (typeof mq143Keep=='function'&&mq143Keep(g,X,Z))||(typeof mq145Keep=='function'&&mq145Keep(g,X,Z))||(typeof mq151Keep=='function'&&mq151Keep(g,X,Z))||(typeof mq160Keep=='function'&&mq160Keep(g,X,Z))||(typeof mq170Keep=='function'&&mq170Keep(g,X,Z))||(typeof dg165Keep=='function'&&dg165Keep(g,X,Z))}catch(_){return false}};
  const TR=o.trail?o.trail.map(q=>[q[0]-C.x,q[1]-C.z]):[];
  const roadD=(x,z)=>{let b=1e9;for(const q of RP){const v=(q[0]-x)*(q[0]-x)+(q[1]-z)*(q[1]-z);if(v<b)b=v}for(const q of TR){const v=(q[0]-x)*(q[0]-x)+(q[1]-z)*(q[1]-z)+1.5;if(v<b)b=v}return Math.sqrt(b)};
  const GW=o.gates.map(a=>[a,2.6]).concat(o.gaps.map(([a0,a1])=>[(a0+a1)/2,(a1-a0)/2*rf+1.2]));
  const adiff=(a,b)=>Math.abs(((a-b)%TAU+TAU*1.5)%TAU-Math.PI);
  const inGate=(a,R0,pad)=>GW.some(([g,hw])=>adiff(a,g)<(hw+(pad||0))/Math.max(R0,1));
  // a free spot in the ring r0..r1 (optionally near angle a0 ± aw): off the road, off what is already there, on walkable ground
  const find=(r0,r1,rad,a0,aw,m)=>{for(let t=0;t<30;t++){const a=a0==null?rn()*TAU:a0+rr(-aw,aw),d=Math.sqrt(rr(r0*r0,r1*r1)),x=Math.cos(a)*d,z=Math.sin(a)*d;
    if(!free(x,z,rad)||roadD(x,z)<rad+2.8||!ground(x,z,m==null?Math.min(rad*.6,1.5):m)||kept(x,z))continue;if(d>rf-rad-2&&d<rf+rad+2&&inGate(a,rf,rad+1))continue;take(x,z,rad);return [x,z,a]}return null};
  const face=(x,z)=>Math.atan2(-z,-x);
  // a mesh between two points (ropes, beams) in camp space with absolute heights
  const UP=new THREE.Vector3(0,1,0),RG=sub(0,0,0,0);RG.position.y=0;
  const seg=(x1,y1,z1,x2,y2,z2,rad,mat,geo)=>{const m=new THREE.Mesh(geo||Q.cyl4,mat),d=new THREE.Vector3(x2-x1,y2-y1,z2-z1),L=d.length()||.01;m.position.set((x1+x2)/2,(y1+y2)/2,(z1+z2)/2);
    m.quaternion.setFromUnitVectors(UP,d.normalize());m.scale.set(rad,L,rad);m.castShadow=rad>.06;m.receiveShadow=true;RG.add(m);return m};
  const bRect=(x,z,a,L,Wd)=>{const ca=Math.cos(a),sa=Math.sin(a);for(let u=-L/2+.3;u<=L/2-.3+1e-6;u+=.6)for(let v=-Wd/2+.3;v<=Wd/2-.3+1e-6;v+=.6)blk(x+u*ca-v*sa,z+u*sa+v*ca,0)};
  const light=(x,y,z,c,i,d)=>{(CS164.pend||[]).push({x,y,z,c,i,d})};
  // ---------------- dwellings (a = facing: the door looks along a) ----------------
  const D={
    hall(x,z,a,k){k=k||1;const L=6.4*k,Wd=3.8*k,h=1.7*k,rh=1.5*k,sg=sub(x,z,a,-.15),Rf=S(pal.thatch);
      TQ(sg,Q.box,STD,0,-.12,0,L+.5,.65,Wd+.5);[-1,1].forEach(s=>TQ(sg,Q.box,WOOD,0,h/2+.2,s*Wd/2,L,h,.2));TQ(sg,Q.box,WOOD,-L/2,h/2+.2,0,.2,h,Wd);
      [-1,1].forEach(s=>TQ(sg,Q.box,WOOD,L/2,h/2+.2,s*(Wd/4+.33),.2,h,Wd/2-.66));TQ(sg,Q.box,DARK,L/2+.03,.85*k,0,.04,1.3*k,1.1*k);TQ(sg,Q.box,WD,L/2+.1,1.55*k,0,.18,.18,1.5*k);
      for(const u of [-L/2,-L/6,L/6,L/2])[-1,1].forEach(s=>TQ(sg,Q.cyl,WD,u,h/2+.25,s*(Wd/2+.08),.13*k,h+.3,.13*k));
      const pit=Math.atan2(rh,Wd/2),sl=Math.hypot(rh,Wd/2)+.4;[-1,1].forEach(s=>TQ(sg,Q.box,Rf,0,h+.2+rh/2-.05,s*Wd/4,L+.8,.16,sl,s*pit,0,0));
      [-1,1].forEach(s=>TQ(sg,Q.box,WOOD,s*L/2,h+.2,0,.18,rh*1.42,rh*1.42,Math.PI/4,0,0));TQ(sg,Q.cyl,WD,0,h+.25+rh,0,.1,L+1.1,.1,0,0,P2);
      [-1,1].forEach(e=>[-1,1].forEach(s=>TQ(sg,Q.cone,BONE,e*(L/2+.45),h+rh+.55,s*.22,.07,.9,.07,s*.55,0,-e*.5)));
      TQ(sg,Q.ico,BONE,L/2+.16,2.05*k,0,.2,.18,.2);for(let i=0;i<3;i++)TQ(sg,Q.disc,S(pk(pal.cloth)),(i-1)*L/3.2,1.1*k,Wd/2+.13,.4,.4,1,0,0,0);
      bRect(x,z,a,L+.5,Wd+.5);take(x,z,L*.58)},
    hut(x,z,a,k){k=(k||1)*1.25;const sg=sub(x,z,a,-.1);TQ(sg,Q.cyl,S(pal.hide[1]),0,.66*k,0,1.4*k,1.32*k,1.4*k);TQ(sg,Q.cone,S(pal.thatch),0,1.32*k+.72*k,0,1.9*k,1.5*k,1.9*k);
      TQ(sg,Q.box,DARK,1.37*k,.52*k,0,.1,.95*k,.62*k);TQ(sg,Q.box,WD,1.42*k,1.05*k,0,.14,.12,.9*k);for(let i=0;i<4;i++)TQ(sg,Q.cyl4,WD,rr(-.15,.15),2.8*k,rr(-.15,.15),.03,.7*k,.03,rr(-.4,.4),0,rr(-.4,.4));
      TQ(sg,Q.ico,BONE,0,2.85*k,0,.17,.16,.17);for(let i=0;i<9;i++){const b=i/9*TAU;TQ(sg,Q.dod,STD,Math.cos(b)*1.45*k,.06,Math.sin(b)*1.45*k,.22,.14,.2,rr(0,3),rr(0,3),0)}
      blk(x,z,1.3*k);take(x,z,2*k)},
    yurt(x,z,a,k){k=(k||1)*1.2;const sg=sub(x,z,a,-.1);TQ(sg,Q.cyl,S(pk(pal.hide)),0,.55*k,0,1.7*k,1.1*k,1.7*k);TQ(sg,Q.cone,S(pal.hide[0]),0,1.1*k+.45*k,0,1.85*k,.95*k,1.85*k);
      if(pal.snow)TQ(sg,Q.hemi,S(0xeef4fa),0,1.35*k,0,1.4*k,.42*k,1.4*k);TQ(sg,Q.box,DARK,1.66*k,.45*k,0,.1,.85*k,.65*k);[-1,1].forEach(s=>TQ(sg,Q.box,S(pal.trim),1.7*k,.5*k,s*.38*k,.1,1*k,.08));
      for(let i=0;i<6;i++){const b=i/6*TAU;TQ(sg,Q.box,WD,Math.cos(b)*1.72*k,.6*k,Math.sin(b)*1.72*k,.06,.1,.06*k)}TQ(sg,Q.cyl,MET,-.5*k,1.9*k,0,.09,.8*k,.09);
      for(let i=0;i<4;i++){const b=i/4*TAU+.4;seg(x+Math.cos(a+b)*1.9*k,gy(x,z)+1.3*k,z+Math.sin(a+b)*1.9*k,x+Math.cos(a+b)*2.8*k,gy(x,z),z+Math.sin(a+b)*2.8*k,.018,S(0x8a7a50))}
      blk(x,z,1.5*k);take(x,z,2.4*k)},
    snowhut(x,z,a,k){k=(k||1)*1.25;const sg=sub(x,z,a,-.2),SN=S(0xe8f0f8);TQ(sg,Q.hemi,SN,0,0,0,1.8*k,1.6*k,1.8*k);TQ(sg,Q.hemi,SN,1.5*k,0,0,1*k,.95*k,.75*k,0,0,0);
      TQ(sg,Q.disc,DARK,2.42*k,.42*k,0,.42*k,.5*k,1,0,P2,0);for(let i=0;i<5;i++)TQ(sg,Q.box,S(0xd0e0ee),Math.cos(i)*1.2*k,1.1*k+i*.04,Math.sin(i)*1.2*k,.5,.05,.3,0,i,0);
      blk(x,z,1.6*k);take(x,z,2.6*k)},
    stilt(x,z,a,k){k=k||1;const y0=Math.max(gy(x,z),.02)-gy(x,z),H=1.3+y0,sg=sub(x,z,a,0);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([u,v])=>TQ(sg,Q.cyl,WD,u*1.1*k,H/2-.4,v*1.1*k,.09,H+.8,.09));
      TQ(sg,Q.box,WOOD,0,H,0,2.8*k,.14,2.8*k);[-1,1].forEach(s=>TQ(sg,Q.box,WOOD,0,H+.65*k,s*.95*k,1.9*k,1.1*k,.1));TQ(sg,Q.box,WOOD,-.95*k,H+.65*k,0,.1,1.1*k,1.9*k);
      TQ(sg,Q.box,DARK,.96*k,H+.55*k,0,.04,.9*k,.6*k);TQ(sg,CG.tent,S(pal.thatch),0,H+1.6*k,0,1.75*k,1.1*k,1.75*k,0,Math.PI/4,0);ladder(x+Math.cos(a)*1.6*k,z+Math.sin(a)*1.6*k,a+Math.PI,H+.2,pal.woodD);
      blk(x,z,1.1*k);take(x,z,2.2*k)},
    pavilion(x,z,a,k){k=(k||1)*1.2;const sg=sub(x,z,a,0),cl=S(pk(pal.cloth),{side:THREE.DoubleSide});[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([u,v])=>{TQ(sg,Q.cyl,WD,u*1.5*k,1.25*k,v*1.3*k,.08,2.5*k,.08);blk(x+Math.cos(a)*u*1.5*k-Math.sin(a)*v*1.3*k,z+Math.sin(a)*u*1.5*k+Math.cos(a)*v*1.3*k,0)});
      [-1,1].forEach(s=>TQ(sg,Q.box,cl,0,2.55*k,s*.7*k,3.4*k,.05,1.6*k,s*.32,0,0));for(let i=-3;i<=3;i++)[-1,1].forEach(s=>TQ(sg,Q.cone4,cl,i*.48*k,2.12*k,s*1.42*k,.12,.32,.04,Math.PI,0,0));
      TQ(sg,Q.disc,S(pk(pal.cloth)),0,.04,0,1.3*k,1,1.1*k,-P2,0,0);TQ(sg,Q.ring,S(pal.trim),0,.05,0,1.25*k,1.05*k,1,-P2,0,0);for(let i=0;i<3;i++)TQ(sg,Q.sph,S(pk(pal.cloth)),rr(-.8,.8),.12,rr(-.6,.6),.3,.12,.22);
      TQ(sg,Q.box,WD,0,.25,0,.8,.06,.5);[[.2,.1],[-.2,-.05]].forEach(([u,v])=>TQ(sg,Q.cyl,MET,u,.33,v,.06,.1,.06));take(x,z,2.2*k)},
    ctent(x,z,a,k){k=(k||1)*1.25;tent(x,z,a,pk(pal.hide),1.3*k);const y=gy(x,z);for(let i=0;i<4;i++){const b=a+Math.PI/4+i*P2,ex=x+Math.cos(b)*2.3*k,ez=z+Math.sin(b)*2.3*k;
        seg(x+Math.cos(b)*.9*k,y+1.6*k,z+Math.sin(b)*.9*k,ex,gy(ex,ez)+.1,ez,.016,S(0x8a7a50));putY(Q.cyl4,WD,ex,gy(ex,ez)+.12,ez,.04,.35,.04)}
      const [bx,bz]=[x+Math.cos(a)*2.1*k,z+Math.sin(a)*2.1*k];put(Q.cyl,S(pk(pal.cloth)),bx,.1,bz,.32,1.4,.2,0,-a,P2)},
    tent(x,z,a,k){k=(k||1)*1.35;aTent(x,z,a+P2,pk(pal.hide),2.6*k,k);const [px,pz]=[x+Math.cos(a+P2)*1.5*k,z+Math.sin(a+P2)*1.5*k];put(Q.cyl4,WD,px,1.1*k,pz,.03,2.2*k,.03);
      put(Q.cone4,S(pal.acc,{side:THREE.DoubleSide}),px+.25,2*k,pz,.05,.5,.22,0,0,P2)},
    lean(x,z,a,k){leanTo(x,z,a+Math.PI,1.2*(k||1),pal.hide[1]);fire(x+Math.cos(a)*2.4,z+Math.sin(a)*2.4,pal.fire,.6)},
    tomb(x,z,a,k){mausoleum(x,z,a,.85*(k||1),pal.stone,pal.stoneD)},
    kennel(x,z,a,k){k=k||1;const sg=sub(x,z,a,0);TQ(sg,Q.box,WOOD,0,.5*k,0,1.4*k,1*k,1.1*k);[-1,1].forEach(s=>TQ(sg,Q.box,S(pal.thatch),0,1.2*k,s*.36*k,1.6*k,.08,.85*k,s*.7,0,0));
      TQ(sg,Q.box,DARK,.71*k,.4*k,0,.04,.62*k,.5*k);bRect(x,z,a,1.4*k,1.1*k);take(x,z,1.2*k);chainPost(x+Math.cos(a)*1.5*k,z+Math.sin(a)*1.5*k,5,a);put(Q.cyl,MET,x+Math.cos(a+.7)*1.3,.06,z+Math.sin(a+.7)*1.3,.26,.12,.26)},
    burrow(x,z,a,k){k=k||1;mound(x,z,1.9*k,pal.gnd,.5);burrowMouth(x,z,a,k,pal.woodD);bones(x+Math.cos(a)*1.6,z+Math.sin(a)*1.6,3,.5,pal.bone)},
    carcass(x,z,a,k){carcass(x,z,a,1.5*(k||1),0x5a3a30,pal.bone);bones(x+1.4,z-.8,3,.6,pal.bone)},
    cocoon(x,z,a,k){const tips=[];deadTree(x,z,rr(3.2,4.2),pal.woodD,1,tips);tips.slice(0,3).forEach(t=>{putY(Q.sph,S(0xe8e4dc),t[0],t[1]-.7,t[2],.24,.5,.24);seg(t[0],t[1]-.25,t[2],t[0],t[1],t[2],.01,T(0xffffff,.5))})},
    resin(x,z,a,k){k=k||1;blk(x,z,.6);take(x,z,1.2);for(let i=0;i<4;i++){const h=rr(1.4,3)*k;put(Q.cyl,S(0xc88a2a,{emissive:0x6a3a08,emissiveIntensity:.4}),x+rr(-.5,.5),h/2,z+rr(-.5,.5),.22,h,.22,rr(-.12,.12),0,rr(-.12,.12))}},
    mudnest(x,z,a,k){k=k||1;mound(x,z,2*k,0x3a2a1a,.42);take(x,z,1.8*k);bones(x,z,5,1,pal.bone);log(x+Math.cos(a)*2,z+Math.sin(a)*2,a+P2,2.4,.3,pal.woodD,.1)},
    nest(x,z,a,k){nest(x,z,1.2*(k||1),pal.woodD,0,pal.bone)},
    shell(x,z,a,k){shell(x,z,1.8*(k||1),0x5a5a3a,a,0x3a3a26)}};
  // ---------------- works ----------------
  const fireRing=(x,z,k,col)=>{for(let i=0;i<8;i++){const b=i/8*TAU;put(Q.dod,STD,x+Math.cos(b)*.62*k,.06,z+Math.sin(b)*.62*k,.17*k,.12*k,.15*k,b,b,0)}put(Q.disc,S(0x1a1612),x,.04,z,.55*k,.55*k,1,-P2);flame(x,.05,z,col||pal.fire,.8*k)};
  const Wk={
    spit(x,z,a){fire(x,z,pal.fire,1.1);[-1,1].forEach(s=>{const px=x-Math.sin(a)*1.2*s,pz=z+Math.cos(a)*1.2*s;put(Q.cyl4,WD,px,.6,pz,.05,1.25,.05);put(Q.cyl4,WD,px,1.2,pz,.04,.4,.04,0,0,.6);put(Q.cyl4,WD,px,1.2,pz,.04,.4,.04,0,0,-.6)});
      put(Q.cyl,WD,x,1.25,z,.035,2.7,.035,0,-a+P2,P2);put(Q.sph,S(0x7a3a24),x,1.2,z,.36,.3,.75,0,-a+P2,0);for(let i=0;i<3;i++){const b=a+P2+(i-1)*.9,lx=x+Math.cos(b)*2.4,lz=z+Math.sin(b)*2.4;log(lx,lz,b+P2,1.8,.25,pal.wood,.08)}
      bones(x+Math.cos(a)*1.8,z+Math.sin(a)*1.8,3,.5,pal.bone)},
    rack(x,z,a){rack(x,z,a,0xa0a0aa);for(let i=0;i<2;i++)put(Q.disc,S(pk(pal.cloth)),x+Math.cos(a)*.5-Math.sin(a)*(i-.5)*1.2,.45,z+Math.sin(a)*.5+Math.cos(a)*(i-.5)*1.2,.4,.4,1,-.25,-a+P2,0)},
    forge(x,z,a){const sg=sub(x,z,a,0);TQ(sg,Q.box,STD,-.6,.45,0,1.3,.9,1.6);TQ(sg,Q.box,STD,-.95,1.6,0,.6,2.2,.7);const gl=TQ(sg,Q.disc,G(0xff6a1a),-.45,.92,0,.45,.6,1,-P2,0,0);gl.castShadow=false;
      TQ(sg,Q.cyl,WD,.9,.35,.2,.3,.7,.3);TQ(sg,Q.box,MET,.9,.78,.2,.6,.18,.28);TQ(sg,Q.cone,MET,1.28,.78,.2,.1,.25,.1,0,0,-P2);TQ(sg,Q.box,S(0x4a3020),-.3,.4,.95,.7,.25,.4,0,0,.2);
      halo(x,z,1.2,0xff6a1a,.15,.06);bRect(x,z,a,1.6,1.6);take(x,z,1.6);barrel(x+Math.cos(a+1.6)*1.3,z+Math.sin(a+1.6)*1.3,0x4a3a2a)},
    stores(x,z,a){const n=2+Math.floor(rn()*2);for(let i=0;i<n;i++){const b=a+i*1.4+rr(-.3,.3),d=rr(.4,1);crate(x+Math.cos(b)*d,z+Math.sin(b)*d)}
      if(rn()<.7)barrel(x+Math.cos(a+3)*1.2,z+Math.sin(a+3)*1.2);for(let i=0;i<3;i++)sack(x+rr(-1.2,1.2),z+rr(-1.2,1.2),pk([0x8a7a5a,0x6a5a3a,0x7a6a4a]));
      put(Q.box,S(pk(pal.hide)),x-Math.cos(a)*1.3,.45,z-Math.sin(a)*1.3,1.6,.04,1.2,0,-a,.9)},
    bedroll(x,z,a){fireRing(x,z,.9);for(let i=0;i<3;i++){const b=a+i*2.1+.4,bx=x+Math.cos(b)*1.55,bz=z+Math.sin(b)*1.55;put(Q.cyl,S(pk(pal.hide)),bx,.12,bz,.34,1.5,.14,0,-b,P2);put(Q.sph,S(pk(pal.cloth)),bx+Math.cos(b)*.75,.16,bz+Math.sin(b)*.75,.22,.14,.3,0,-b,0)}
      sack(x+Math.cos(a+1.1)*2.2,z+Math.sin(a+1.1)*2.2,0x6a5a3a)},
    woodpile(x,z,a){const sg=sub(x,z,a,0);for(let l=0;l<3;l++)for(let i=0;i<3-l;i++)TQ(sg,Q.cyl,S(pal.wood),0,.22+l*.38,(i-(2-l)/2)*.42,.2,1.8,.2,0,0,P2);bRect(x,z,a,1.8,1.3);take(x,z,1.3);
      stump(x+Math.cos(a+P2)*1.6,z+Math.sin(a+P2)*1.6,pal.woodD,.55,1.2);put(Q.box,MET,x+Math.cos(a+P2)*1.6,.75,z+Math.sin(a+P2)*1.6,.06,.22,.3,0,-a,.4)},
    target(x,z,a){const sg=sub(x,z,a,0);TQ(sg,Q.box,WD,0,.6,0,.08,1.2,.08);TQ(sg,Q.cyl,S(0xd8c8a0),0,1.25,0,.55,.1,.55,0,0,P2);TQ(sg,Q.cyl,S(0xa02a1a),.03,1.25,0,.36,.1,.36,0,0,P2);TQ(sg,Q.cyl,S(0xd8c8a0),.06,1.25,0,.16,.1,.16,0,0,P2);
      for(let i=0;i<3;i++)TQ(sg,Q.cyl4,S(0x8a6a40),.3,1.25+rr(-.3,.3),rr(-.3,.3),.012,.6,.012,0,0,P2);blk(x,z,0);take(x,z,.8)},
    drum(x,z){drum(x,z,pal.wood,1.1)},
    totem(x,z,a){const h=rr(3.2,4.4),sg=sub(x,z,a,0);blk(x,z,0);take(x,z,.7);let y=0;const cs=[pal.wood,pal.acc,pal.woodD,pal.trim];
      for(let i=0;i<4;i++){const hh=h/4,rd=.32-i*.03;TQ(sg,Q.cyl,S(cs[i%4]),0,y+hh/2,0,rd,hh,rd);TQ(sg,Q.box,S(pal.woodD),rd*.85,y+hh*.55,0,.1,hh*.4,rd*1.2);[-1,1].forEach(s=>TQ(sg,Q.box,G(i%2?0xffd060:0x0a0808),rd*.92,y+hh*.62,s*rd*.32,.04,.06,.08));y+=hh}
      TQ(sg,Q.ico,BONE,0,y+.18,0,.3,.28,.3);[-1,1].forEach(s=>TQ(sg,Q.cone,BONE,0,y+.55,s*.36,.07,.8,.07,s*.6,0,0));[-1,1].forEach(s=>TQ(sg,Q.box,S(pk(pal.cloth),{side:THREE.DoubleSide}),0,y-.9,s*.3,.04,.9,.18,s*.15,0,0))},   // v177: hung on the pole (they hung .1 off it)
    altar(x,z,a){const sg=sub(x,z,a,0);TQ(sg,Q.box,STN,0,.45,0,1.8,.9,1);TQ(sg,Q.box,STD,0,.93,0,2,.1,1.15);TQ(sg,Q.box,STD,0,.1,0,2.4,.2,1.5);const d=TQ(sg,Q.disc,G(Lc[0]),0,.99,0,.3,.3,1,-P2,0,0);d.castShadow=false;
      bRect(x,z,a,2.4,1.5);take(x,z,1.5);candles(x,z,6,1.2,pal.lant);halo(x,z,1.8,Lc[0],.14,.05);skull(x+Math.cos(a+P2)*.6,.98,z+Math.sin(a+P2)*.6,.9,pal.bone,a)},
    brazier(x,z){brazier(x,z,pal.fire,1.15)},
    table(x,z,a){table(x,z,a,pal.wood);for(let i=0;i<3;i++)put(Q.cyl,MET,x+rr(-.5,.5),.82,z+rr(-.25,.25),.06,.12,.06);[-1,1].forEach(s=>log(x-Math.sin(a)*s*1,z+Math.cos(a)*s*1,a,1.6,.18,pal.wood,.1))},
    dummy(x,z,a){dummy(x,z,a)},
    cage(x,z){cage(x,z,1.15,0x2a2a2e,0,rn()<.7)},
    meat(x,z,a){meatRack(x,z,a,0x7a2a24)},
    bonepile(x,z){bonePile(x,z,rr(.9,1.3),pal.bone)},
    eggs(x,z){eggs(x,z,6,.4,pal.caps[0],true)},
    web(x,z,a){web(x,z,a,1.1,0xe8e8e8)},
    crystals(x,z){crystals(x,z,4,1.1,pal.caps[0],.6)},
    nets(x,z,a){const sg=sub(x,z,a,0);[-1,1].forEach(s=>TQ(sg,Q.cyl4,WD,0,1.1,s*1.3,.05,2.2,.05));TQ(sg,Q.cyl4,WD,0,2.15,0,.03,2.8,.03,P2,0,0);
      const n=TQ(sg,Q.pln,T(0x2a2a20,.55),0,1.35,0,1,1.6,2.5,0,P2,0);n.castShadow=false;for(let i=0;i<4;i++)TQ(sg,Q.sph,S(0xc8b080),0,.6,(i-1.5)*.6,.08,.08,.08);take(x,z,1.5)},
    boat(x,z,a){const sg=sub(x,z,a,-.25);TQ(sg,Q.hemi,S(pal.wood,{side:THREE.DoubleSide}),0,0,0,2.2,.7,.8,Math.PI,0,0);TQ(sg,Q.box,WD,0,.05,0,4.2,.08,.14);for(let i=0;i<4;i++)TQ(sg,Q.arc,WD,(i-1.5)*.8,.1,0,.7,.75,.6,0,P2,0);
      TQ(sg,Q.cyl,WD,.8,.6,.2,.04,1.6,.04,0,0,.8);bRect(x,z,a,4,1.4);take(x,z,2.2)},
    cart(x,z,a){const sg=sub(x,z,a,0),br=rn()<.5;TQ(sg,Q.box,WOOD,0,.75,0,2.4,.12,1.3);[-1,1].forEach(s=>TQ(sg,Q.box,WOOD,0,1,s*.62,2.4,.45,.06));TQ(sg,Q.box,WOOD,-1.17,1,0,.06,.45,1.3);
      [-1,1].forEach(s=>TQ(sg,Q.cyl,WD,.5,.48,s*.75,.48,.08,.48,P2,0,0));if(!br)[-1,1].forEach(s=>TQ(sg,Q.cyl,WD,-.7,.48,s*.75,.48,.08,.48,P2,0,0));else TQ(sg,Q.cyl,WD,-1.6,.08,.9,.48,.08,.48,0,0,0);
      [-1,1].forEach(s=>TQ(sg,Q.cyl4,WD,1.9,.55,s*.4,.04,1.6,.04,0,0,P2-.2));if(br)sg.rotation.z=.12;TQ(sg,Q.sph,S(0x8a7a5a),.3,1,.1,.4,.35,.35);TQ(sg,Q.sph,S(0x7a6a4a),-.4,1,-.2,.35,.3,.35);bRect(x,z,a,2.6,1.5);take(x,z,1.8)},
    graves(x,z,a){for(let i=0;i<4;i++){const u=(i-1.5)*1.3;grave(x-Math.sin(a)*u,z+Math.cos(a)*u,a,pal.stone)}put(Q.box,S(0x2a2420),x+Math.cos(a)*-.8,.02,z+Math.sin(a)*-.8,1.1,.05,5,0,-a,0)},
    coffin(x,z,a){coffin(x,z,a,pal.woodD,rn()<.6)},
    pyre(x,z,a){const sg=sub(x,z,a,0);for(let l=0;l<4;l++)for(let i=-1;i<=1;i++){const q=i*.55;if(l%2)TQ(sg,Q.cyl,S(pal.woodD),q,.18+l*.3,0,.14,2,.14,P2,0,0);else TQ(sg,Q.cyl,S(pal.woodD),0,.18+l*.3,q,.14,2,.14,0,0,P2)}
      TQ(sg,Q.box,S(0xd8d0b8),0,1.4,0,1.6,.25,.5);TQ(sg,Q.sph,S(0xd8d0b8),.85,1.45,0,.2,.2,.2);flame(x,.9,z,Lc[0],.9);bRect(x,z,a,2.1,2.1);take(x,z,1.6);halo(x,z,1.6,Lc[0],.14,.05)},
    urns(x,z){for(let i=0;i<3;i++)urn(x+rr(-.8,.8),z+rr(-.8,.8),pk([0x9a6a3a,0x6a8a8a,0xb08a5a]),rr(.7,.95))},
    dung(x,z){for(let i=0;i<3;i++){const k=rr(.5,.9);put(Q.ico,S(0x5a3a1e),x+rr(-1,1),k*.85,z+rr(-1,1),k,k,k,rr(0,3),rr(0,3),0)}blk(x,z,.5);take(x,z,1.2)},
    husks(x,z,a){husk(x,z,a,1.2,0xd8c090)},
    statue(x,z,a){put(Q.box,STD,x,.2,z,.9,.5,.9);figure(x,z,a,1.2,pal.stone,pk(['stand','raise','kneel']),rn()<.5,.42)},
    bench(x,z,a){const sg=sub(x,z,a,0);TQ(sg,Q.box,STN,0,.45,0,.5,.12,1.6);[-1,1].forEach(s=>TQ(sg,Q.box,STN,0,.22,s*.6,.4,.45,.15));take(x,z,.9)},
    candles(x,z){candles(x,z,7,.9,pal.lant)},
    catapult(x,z,a){catapult(x,z,a,1.3,rn()<.5)},
    carcass(x,z,a){carcass(x,z,a,1.3,0x5a3a30,pal.bone)}};
  // ---------------- outskirts ----------------
  const lantern=(x,z,h)=>{h=h||2.4;blk(x,z,0);take(x,z,.5);const y=gy(x,z);put(Q.cyl4,WD,x,h/2,z,.06,h,.06);put(Q.box,WD,x+.3,h-.05,z,.62,.05,.05);
    putY(Q.box,G(pal.lant),x+.55,y+h-.4,z,.14,.22,.14);putY(Q.cone4,S(pal.metal),x+.55,y+h-.22,z,.13,.14,.13);putY(Q.cyl4,S(pal.metal),x+.55,y+h-.6,z,.1,.05,.1);halo(x+.55,z,1.4,pal.lant,.16,.06)};
  const tower=(x,z,a)=>{const H=4.2,sg=sub(x,z,a,0);blk(x,z,1);take(x,z,1.6);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([u,v])=>TQ(sg,Q.cyl,WD,u*.75,H/2,v*.75,.1,H+.2,.1,v*.04,0,-u*.04));
    TQ(sg,Q.box,WOOD,0,H,0,1.9,.14,1.9);[[0,-.9,0],[0,.9,0],[-.9,0,1],[.9,0,1]].forEach(([u,v,q])=>TQ(sg,Q.box,WOOD,u,H+.38,v,q?.08:1.9,.6,q?1.9:.08));
    [[-1,1],[1,-1]].forEach(([u,v])=>TQ(sg,Q.cyl4,WD,0,H*.45,v*.75,.04,2.4,.04,u*.6,0,0));TQ(sg,CG.tent,S(pal.thatch),0,H+1.5,0,1.5,1,1.5,0,Math.PI/4,0);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([u,v])=>TQ(sg,Q.cyl4,WD,u*.85,H+.85,v*.85,.04,1.1,.04));ladder(x-Math.cos(a)*1,z-Math.sin(a)*1,a+Math.PI,H,pal.woodD);
    banner(x+Math.cos(a+P2)*.95,z+Math.sin(a+P2)*.95,pal.acc,H+2.2,a,pal.trim)};
  const post=(x,z)=>{blk(x,z,0);take(x,z,.6);put(Q.cyl,WD,x,1.6,z,.1,3.2,.1);put(Q.box,WOOD,x,3.2,z,.9,.1,.9);torch(x+.35,z,pal.fire,3.6)};
  const cairn=(x,z,k)=>{k=k||1;blk(x,z,0);take(x,z,.7*k);let y=0;for(let i=0;i<4;i++){const s=(.55-i*.1)*k;put(Q.dod,STN,x+rr(-.05,.05),y+s*.6,z+rr(-.05,.05),s,s*.65,s,rr(0,3),rr(0,3),0);y+=s*1.05}};
  const fungus=(x,z)=>{const n=2+Math.floor(rn()*3),c=pk(pal.caps);take(x,z,1.1);for(let i=0;i<n;i++)shroom(x+rr(-.6,.6),z+rr(-.6,.6),rr(.6,1.8),c,true);halo(x,z,1.5,c,.12,.05)};
  const stalag=(x,z)=>{blk(x,z,0);take(x,z,.8);for(let i=0;i<3;i++){const h=rr(1,2.8);put(Q.cone,STN,x+rr(-.5,.5),h/2,z+rr(-.5,.5),rr(.25,.4),h,rr(.25,.4))}};
  const cactus=(x,z)=>{blk(x,z,0);take(x,z,.6);const h=rr(1.6,2.8),M=S(0x5a7a3a);put(Q.cyl,M,x,h/2,z,.2,h,.2);[-1,1].forEach(s=>{if(rn()<.7){const y=h*rr(.4,.7);put(Q.cyl,M,x+s*.35,y,z,.12,.4,.12,0,0,P2);put(Q.cyl,M,x+s*.5,y+.3,z,.12,.6,.12)}})};
  const ruincol=(x,z)=>{pillar(x,z,rr(1.4,3.4),pal.stone,.36,rn()<.7);if(rn()<.5)rubble(x+rr(-1,1),z+rr(-1,1),4,.6,pal.stone)};
  const salt=(x,z)=>{const h=rr(2,4.2);blk(x,z,.5);take(x,z,.9);put(Q.hex,S(0xf4f4ee,{roughness:.4}),x,h/2,z,rr(.45,.65),h,rr(.45,.65),rr(-.06,.06),rr(0,1),0)};
  const debris=(x,z)=>{take(x,z,1.2);for(let i=0;i<5;i++)put(Q.box,WOOD,x+rr(-1,1),.05,z+rr(-1,1),rr(.8,1.6),.06,.22,rr(-.1,.1),rr(0,3),0);put(Q.cyl,WD,x+rr(-.6,.6),.1,z+rr(-.6,.6),.45,.08,.45,rr(-.2,.2),0,0);if(rn()<.5)crate(x+rr(-.8,.8),z+rr(-.8,.8))};
  const snowdrift=(x,z)=>{mound(x,z,rr(1,1.8),0xe8f0f8,.38);take(x,z,1)};
  const feathers=(x,z)=>{for(let i=0;i<8;i++){const f=put(Q.pln,S(pk([0x5a6a8a,0x8a9ab0,0x3a3a4a]),{side:THREE.DoubleSide}),x+rr(-1.5,1.5),.05,z+rr(-1.5,1.5),.12,.5,1,-P2,0,rr(0,6));f.castShadow=false}};
  const roots=(x,z,a)=>{const sg=sub(x,z,a,-.3);take(x,z,1.4);for(let i=0;i<2;i++)TQ(sg,Q.arc,S(pal.woodD),i*.6-.3,0,0,rr(1.1,1.6),rr(.9,1.4),.9,0,P2+rr(-.3,.3),0)};
  const iceob=(x,z)=>{obelisk(x,z,rr(2.8,3.8),0xbfe6ff,0x6ad0ff)};
  const rod=(x,z)=>{blk(x,z,0);take(x,z,.6);put(Q.cyl,MET,x,2.2,z,.07,4.4,.07);for(let i=0;i<3;i++){const b=i/3*TAU;put(Q.cone,MET,x+Math.cos(b)*.15,4.6,z+Math.sin(b)*.15,.04,.5,.04,Math.sin(b)*.3,0,-Math.cos(b)*.3)}halo(x,z,1.2,0x2a2a30,.4,.04)};
  const hay=(x,z,a)=>{take(x,z,.9);blk(x,z,0);put(Q.cyl,S(0xa08a4a),x,.42,z,.45,1.1,.45,0,-a,P2)};
  const flowers=(x,z)=>{for(let i=0;i<6;i++){const o2=put(Q.oct,G(pk([0xf0e060,0xe86a9a,0x9a7aff])),x+rr(-.8,.8),.15,z+rr(-.8,.8),.06,.06,.06);o2.castShadow=false}};
  const shrub=(x,z)=>{take(x,z,.8);const c=pk([0x2f5a2a,0x3a6a30,0x2a4a26]);for(let i=0;i<3;i++)put(Q.ico,S(c),x+rr(-.4,.4),rr(.25,.5),z+rr(-.4,.4),rr(.35,.6),rr(.3,.5),rr(.35,.6),rr(0,3),rr(0,3),0)};
  const tree=(x,z)=>{blk(x,z,0);take(x,z,1.2);const h=rr(2.2,3.4);put(Q.tcyl,S(0x4a3424),x,h/2,z,.18,h,.18);const c=pk([0x2f6a2a,0x3a7a34,0x2a5a26]);
    for(let i=0;i<3;i++)put(Q.ico,S(c),x+rr(-.5,.5),h+rr(-.2,.6),z+rr(-.5,.5),rr(.9,1.3),rr(.8,1.1),rr(.9,1.3),rr(0,3),rr(0,3),0)};
  const pine=(x,z)=>{blk(x,z,0);take(x,z,1.1);const h=rr(3,4.6),c=pal.snow?0x2a4a4a:0x24402a;put(Q.cyl,S(0x3a2a20),x,.5,z,.15,1,.15);
    for(let i=0;i<3;i++){const y=1+i*h*.26,w=1.3-i*.33;put(Q.cone,S(c),x,y+h*.2,z,w,h*.42,w);if(pal.snow)put(Q.cone,S(0xe8f0f8),x,y+h*.3,z,w*.75,h*.2,w*.75)}};
  const dune=(x,z)=>{mound(x,z,rr(1.6,2.6),0xd8b47a,.3);take(x,z,1.6)};
  const Ou={shrub,tree,pine,dune,grave:(x,z,a)=>grave(x,z,a,pal.stone),rubble:(x,z)=>rubble(x,z,5,.8,pal.stone),tower,post,lantern:(x,z)=>lantern(x,z),stakes:(x,z,a)=>{for(let i=-1;i<=1;i++){const px=x-Math.sin(a)*i*.6,pz=z+Math.cos(a)*i*.6;put(Q.cyl4,WD,px,.6,pz,.06,1.4,.06,0,-a,.6);put(Q.cyl4,WD,px,.6,pz,.06,1.4,.06,0,-a,-.6);blk(px,pz,0)}take(x,z,1)},
    banner:(x,z,a)=>banner(x,z,pal.acc,rr(2.8,3.6),a+P2,pal.trim),hay,cairn:(x,z)=>cairn(x,z,rr(.9,1.3)),fungus,deadtree:(x,z)=>deadTree(x,z,rr(2.8,4.4),pal.woodD,rr(.9,1.2)),roots,
    log:(x,z,a)=>log(x,z,a+P2,rr(2.4,4),rr(.3,.5),pal.woodD,.12),stump:(x,z)=>stump(x,z,pal.woodD),reeds:(x,z)=>reeds(x,z,0x4a6a30,7),stalag,snowdrift,ice:(x,z)=>ice(x,z,rr(.8,1.8)),iceob,
    obelisk:(x,z)=>obelisk(x,z,rr(3,4.2),pal.stone,pal.lant),rocks:(x,z)=>rock(x,z,rr(.7,1.5),pal.stone),debris,ruincol,cactus,palm:(x,z)=>palm(x,z,rr(3,4.4),true),saltpillar:salt,
    bones:(x,z)=>bones(x,z,4,.8,pal.bone),ribs:(x,z,a)=>ribcage(x,z,a,1.2,pal.bone,7),skull:(x,z)=>skullPole(x,z,rr(1.6,2.4),pal.bone),antler:(x,z)=>antlers(x,z,rr(2.4,3)),rod,
    roses:(x,z)=>roseBush(x,z,rr(.8,1.1)),statue:(x,z,a)=>Wk.statue(x,z,a),flowers,feathers,totem:(x,z,a)=>Wk.totem(x,z,a)};
  // ---------------- clutter (small, never blocks) ----------------
  const Cl={bones:(x,z)=>bones(x,z,3,.5,pal.bone),goo:(x,z)=>halo(x,z,rr(.3,.6),pal.caps[0],.35,.06),planks:(x,z)=>put(Q.box,WOOD,x,.04,z,rr(.9,1.6),.05,.22,rr(-.08,.08),rr(0,3),0),
    grubs:(x,z)=>{for(let i=0;i<4;i++)put(Q.sph,S(0xe8dcc0),x+rr(-.4,.4),.08,z+rr(-.4,.4),.1,.08,.24,0,rr(0,3),0)},spears:(x,z)=>{put(Q.cyl4,WD,x,.8,z,.025,1.7,.025,rr(-.3,.3),0,rr(-.3,.3));put(Q.cone4,MET,x,1.7,z,.05,.25,.05)},
    arrows:(x,z)=>{for(let i=0;i<4;i++)put(Q.cyl4,S(0x8a6a40),x+rr(-.3,.3),.3,z+rr(-.3,.3),.012,.7,.012,rr(-.5,.5),0,rr(-.5,.5))},pots:(x,z)=>{put(Q.sph,S(pk([0x9a6a3a,0x6a5a4a])),x,.2,z,.22,.24,.22);put(Q.cyl,S(0x6a4a2a),x,.42,z,.1,.1,.1)},
    candles:(x,z)=>candles(x,z,3,.3,pal.lant),shells:(x,z)=>{for(let i=0;i<3;i++)put(Q.hemi,S(0xd8d4c4),x+rr(-.4,.4),0,z+rr(-.4,.4),.14,.1,.14)},snow:(x,z)=>mound(x,z,rr(.5,.9),0xe8f0f8,.35),
    shards:(x,z)=>{for(let i=0;i<3;i++)put(Q.oct,S(pal.caps[0],{emissive:pal.caps[0],emissiveIntensity:.5}),x+rr(-.4,.4),.12,z+rr(-.4,.4),.08,.2,.08,rr(-.4,.4),0,rr(-.4,.4))},
    runes:(x,z)=>{put(Q.dod,STD,x,.12,z,.3,.2,.3);const g2=put(Q.box,G(pal.lant),x,.32,z,.18,.02,.04,0,rr(0,3),0);g2.castShadow=false},husk:(x,z,a)=>husk(x,z,a,.6),chips:(x,z)=>{for(let i=0;i<5;i++)put(Q.box,S(0x8a5a2a),x+rr(-.5,.5),.03,z+rr(-.5,.5),.18,.04,.1,0,rr(0,3),0)},
    moss:(x,z)=>put(Q.hemi,S(0x5a7a3a),x,0,z,rr(.4,.8),.12,rr(.4,.8)),salt:(x,z)=>put(Q.disc,S(0xf4f4ee),x,.04,z,rr(.4,.8),rr(.4,.8),1,-P2),blood:(x,z)=>put(Q.disc,S(0x5a0a10,{roughness:.3}),x,.04,z,rr(.3,.7),rr(.3,.7),1,-P2),
    skulls:(x,z)=>skull(x,-.03,z,1,pal.bone),chains:(x,z)=>{for(let i=0;i<5;i++)put(Q.link,S(0x3a3a3e,{metalness:.7,roughness:.4}),x+i*.18,.05,z,.09,.09,.09,P2,0,i%2?P2:0)},
    petals:(x,z)=>{for(let i=0;i<5;i++)put(Q.oct,S(0xb01020),x+rr(-.5,.5),.03,z+rr(-.5,.5),.06,.02,.06)},rubble:(x,z)=>rubble(x,z,3,.5,pal.stone),pebbles:(x,z)=>{for(let i=0;i<4;i++)put(Q.dod,STD,x+rr(-.5,.5),.05,z+rr(-.5,.5),.12,.08,.1,rr(0,3),rr(0,3),0)},
    feathers:(x,z)=>{const f=put(Q.pln,S(pk([0x5a6a8a,0x8a9ab0]),{side:THREE.DoubleSide}),x,.05,z,.12,.5,1,-P2,0,rr(0,6));f.castShadow=false},guano:(x,z)=>put(Q.disc,S(0xc8c0b0),x,.04,z,rr(.4,.8),rr(.4,.8),1,-P2),
    fungi:(x,z)=>shroom(x,z,rr(.25,.5),pk(pal.caps),true),shields:(x,z,a)=>put(Q.disc,S(pk(pal.cloth)),x,.35,z,.38,.38,1,-.3,-a,0),spearsx:null};
  // ================= 1. the heart: the bonfire (main light) and its seats =================
  const g0=o.gates.length?o.gates[0]:C.ang,ringIn=rc+1,ringOut=big?Math.max(rc+2.5,rf-1.6):rc+2.5;
  {let p=find(ringIn,Math.min(ringOut,ringIn+3),1.6,g0+Math.PI*(rn()<.5?.25:-.25),.7)||find(ringIn,ringOut,1.6);
    if(p){const [x,z]=p,col=Lc[0];fire(x,z,pal.fire,1.5);halo(x,z,3.4,col,.12,.05);for(let i=0;i<4;i++){const b=i/4*TAU+rr(-.3,.3),lx=x+Math.cos(b)*2.6,lz=z+Math.sin(b)*2.6;if(free(lx,lz,.4)&&roadD(lx,lz)>2.6&&ground(lx,lz,.3))log(lx,lz,b+P2,1.8,.24,pal.wood,.08)}
      light(x,gy(x,z)+1.8,z,col,1.7,17);if(!pal.snow||rn()<.5)steam(x,z,0x6a6660,1)}}
  // ================= 2. dwellings =================
  const dw=[];if(big){const L=[];rec.d.forEach(([k,n])=>{for(let i=0;i<n;i++)L.push(k)});
    const n=L.length,a0=rn()*TAU,mid=(ringIn+ringOut)/2+.4;L.forEach((k,i)=>{const big2=k=='hall',rad=big2?3.6:k=='pavilion'||k=='yurt'||k=='snowhut'||k=='stilt'?2.8:k=='burrow'||k=='carcass'||k=='mudnest'?2:k=='tent'||k=='ctent'||k=='hut'?2.5:1.9;
      const ang=a0+i/Math.max(1,n)*TAU,p=find(Math.max(ringIn,mid-1.6),Math.min(ringOut+1.2,mid+2.2),rad,ang,TAU/Math.max(4,n)*.45)||find(ringIn,ringOut+1,rad);
      if(!p)return;const [x,z]=p,a=face(x,z)+rr(-.25,.25);try{(D[k]||D.ctent)(x,z,a,k=='hall'?Math.min(1,(ringOut-ringIn+3)/6.5):1)}catch(e){console.warn('v164 dwelling',k,e)}dw.push([x,z,a,rad])})}
  // ================= 3. works (wet camps: a boardwalk from the main gate in) =================
  if(C.des&&C.des.wet&&o.gates.length){const a=g0,PL=S(pal.wood),PS=WD;let prev=null;for(let d=rf+2;d>rc*.35;d-=.5){const x=Math.cos(a)*d+Math.sin(d*.3)*.6*Math.sin(a),z=Math.sin(a)*d-Math.sin(d*.3)*.6*Math.cos(a),y=Math.max(gy(x,z),.02)+.2;
      putY(Q.box,PL,x,y,z,.42,.08,1.5,0,-a,rr(-.04,.04));if(Math.round(d*2)%4==0)[-1,1].forEach(s=>putY(Q.cyl4,PS,x-Math.sin(a)*.7*s,y-.4,z+Math.cos(a)*.7*s,.06,1.2,.06));prev=[x,z]}}
  rec.w.forEach(([k,n])=>{if(k=='boardwalk')return;for(let i=0;i<n;i++){const rad=k=='cart'||k=='boat'||k=='catapult'||k=='altar'||k=='pyre'?2:k=='graves'?2.6:1.4;
    const p=big?find(ringIn,ringOut+.5,rad,null,0)||find(rc*.55,ringOut,rad):find(rc*.5,Math.max(rc*.55+1,r-1.5),rad);if(!p)continue;const [x,z]=p,a=face(x,z)+rr(-.4,.4);
    try{(Wk[k]||Wk.stores)(x,z,a)}catch(e){console.warn('v164 work',k,e)}}});
  // filler: the settlement ring is filled with more of the camp's everyday works until it is busy (about one piece per 17 tiles²)
  if(big){const F=rec.w.map(q=>q[0]).filter(k=>!/^(altar|forge|catapult|boat|pyre|boardwalk|graves|statue|bench)$/.test(k)).concat(['stores','stores']),
      want=Math.round(Math.PI*(ringOut*ringOut-ringIn*ringIn)/17)-dw.length-rec.w.reduce((n,q)=>n+q[1],0);
    for(let i=0;i<want&&F.length;i++){const k=F[i%F.length],p=find(ringIn,ringOut+.5,1.4,null,0);if(!p)continue;try{(Wk[k]||Wk.stores)(p[0],p[1],face(p[0],p[1])+rr(-.4,.4))}catch(e){}}}
  // rope lines with pennants between neighbouring dwellings (on poles beside them)
  if(dw.length>2)for(let i=0;i<dw.length;i++){if(rn()<.45)continue;const A=dw[i],B=dw[(i+1)%dw.length],dd=Math.hypot(A[0]-B[0],A[1]-B[1]);if(dd<4||dd>11)continue;
    const ends=[A,B].map(q=>{const b=Math.atan2(B[1]-A[1],B[0]-A[0])+(q===A?0:Math.PI),x=q[0]+Math.cos(b)*(q[3]*.75),z=q[1]+Math.sin(b)*(q[3]*.75);return [x,z]});
    if(ends.some(([x,z])=>roadD(x,z)<1.5))continue;const h=2.6,[p1,p2]=ends,y1=gy(p1[0],p1[1])+h,y2=gy(p2[0],p2[1])+h;ends.forEach(([x,z])=>{put(Q.cyl4,WD,x,h/2,z,.05,h,.05);blk(x,z,0)});
    const m=6,P=[];for(let j=0;j<=m;j++){const t=j/m;P.push([p1[0]+(p2[0]-p1[0])*t,y1+(y2-y1)*t-Math.sin(t*Math.PI)*.45,p1[1]+(p2[1]-p1[1])*t])}
    const RM=S(0x6a5a3a),FL=S(pk(pal.cloth),{side:THREE.DoubleSide}),yaw=Math.atan2(p2[1]-p1[1],p2[0]-p1[0]);
    for(let j=0;j<m;j++){seg(P[j][0],P[j][1],P[j][2],P[j+1][0],P[j+1][1],P[j+1][2],.015,RM);const f=putY(Q.cone4,FL,(P[j][0]+P[j+1][0])/2,(P[j][1]+P[j+1][1])/2-.2,(P[j][2]+P[j+1][2])/2,.14,.38,.03,Math.PI,-yaw,0);f.castShadow=false}}
  // ================= 4. the fence and the gates =================
  if(fk!='none'&&big){const bh=cs164Fort(fk)[1],R0=bh?rf+1.25:rf,stp={palis:.5,iron:.42,bone:.62,reed:1.1,root:2.4,hedge:1.5,stakes:1.7,ice:1.3,stone:1.15,ruin:3.1}[fk]||1.4,n=Math.floor(TAU*R0/stp);
    const keptA=a=>!inGate(a,R0,.3)&&cs123H(Math.round(Math.cos(a)*R0*.22+C.x*.5),Math.round(Math.sin(a)*R0*.22+C.z*.5))>.12;
    let run=[];const flush=()=>{if(run.length>2&&(fk=='palis'||fk=='iron')){for(let j=0;j+1<run.length;j+=3){const A=run[j],B=run[Math.min(run.length-1,j+3)];[.6,1.6].forEach(h=>seg(A[0],gy(A[0],A[1])+h,A[1],B[0],gy(B[0],B[1])+h,B[1],fk=='iron'?.03:.06,fk=='iron'?MET:WD))}}run=[]};
    for(let i=0;i<n;i++){const a=i/n*TAU,x=Math.cos(a)*R0,z=Math.sin(a)*R0;if(!keptA(a)||!ground(x,z,.2)||roadD(x,z)<3.4||!free(x,z,.15)||kept(x,z)){flush();continue}run.push([x,z]);take(x,z,.3);
      if(fk=='palis'){const h=rr(2.3,3);blk(x,z,0);put(Q.cyl4,WD,x,h/2-.2,z,.17,h+.4,.17,rr(-.05,.05),rr(0,1),rr(-.05,.05));put(Q.cone4,WD,x,h+.2,z,.17,.42,.17);if(i%11==0)skull(x,h-.5,z,.9,pal.bone,a)}
      else if(fk=='iron'){blk(x,z,0);put(Q.cyl4,MET,x,.9,z,.03,1.8,.03);if(i%3==0)put(Q.cone4,MET,x,1.9,z,.06,.22,.06);if(i%9==0){put(Q.box,STD,x,.25,z,.45,.6,.45);put(Q.sph,STD,x,.7,z,.18,.18,.18)}}
      else if(fk=='bone'){blk(x,z,0);put(Q.cyl4,BONE,x,.7,z,.07,1.4,.07,rr(-.15,.15),0,rr(-.15,.15));if(i%4==0){putY(Q.ico,BONE,x,gy(x,z)+1.5,z,.18,.16,.18);const e=putY(Q.box,G(0x0a0808),x+Math.cos(a)*.13,gy(x,z)+1.52,z+Math.sin(a)*.13,.06,.04,.22,0,-a+P2,0);e.castShadow=false}}
      else if(fk=='reed'){reeds(x,z,0x4a6a30,5);if(i%3==0){blk(x,z,0);put(Q.cyl4,WD,x,.8,z,.06,1.6,.06)}}
      else if(fk=='root'){roots(x,z,a+P2);if(rn()<.35)lantern(x-Math.cos(a)*1.4,z-Math.sin(a)*1.4,2)}
      else if(fk=='hedge'){blk(x,z,0);put(Q.box,S(0x1a261a),x,.6,z,stp+.1,1.5,.8,0,-a-P2,0);for(let j=0;j<3;j++)put(Q.oct,S(0xb01020,{emissive:0x500008,emissiveIntensity:.4}),x+rr(-.6,.6),rr(.3,1.2),z+rr(-.6,.6),.11,.11,.11)}
      else if(fk=='stakes'){for(const s of [-1,1]){put(Q.cyl4,WD,x,.55,z,.06,1.5,.06,s*.55,-a,.7);blk(x,z,0)}put(Q.cyl,WD,x,.25,z,.1,stp+.2,.1,0,-a-P2,P2)}
      else if(fk=='ice'){blk(x,z,0);for(let j=0;j<2;j++)put(Q.oct,S(0xbfe6ff,{roughness:.15,emissive:0x4a90c0,emissiveIntensity:.3}),x+rr(-.4,.4),rr(.6,1.1),z+rr(-.4,.4),rr(.3,.45),rr(.9,1.6),rr(.3,.45),rr(-.2,.2),rr(0,3),rr(-.2,.2))}
      else if(fk=='stone'){blk(x,z,0);for(let j=0;j<3;j++)put(Q.box,j%2?STN:STD,x+rr(-.15,.15),.2+j*.3,z+rr(-.15,.15),stp*.9,.32,.55,rr(-.08,.08),-a-P2+rr(-.15,.15),rr(-.06,.06))}
      else if(fk=='ruin'){if(rn()<.65)wall(x,z,a+P2,2.6,rr(1,2.6),pal.stone,rn()<.5,.6);else pillar(x,z,rr(1.6,3.2),pal.stone,.32,true)}}
    flush();
    // gates: posts and a lintel (or an arch), a light on the main one
    o.gates.forEach((ga,gi)=>{const x=Math.cos(ga)*R0,z=Math.sin(ga)*R0;if(!ground(x,z,0)&&!ground(x*.9,z*.9,0))return;const sx=-Math.sin(ga),sz=Math.cos(ga),hw=2.3;
      const P=[-1,1].map(s=>[x+sx*hw*s,z+sz*hw*s]);
      if(fk=='ruin'||fk=='stone')arch(x,z,ga,hw*2,3.4,pal.stone,.6);
      else if(fk=='hedge'){const sg=sub(x,z,ga+P2,0);TQ(sg,Q.arc,S(0x1a1416),0,0,0,hw,2.6,1.2,0,P2,0);P.forEach(([px,pz])=>blk(px,pz,0))}
      else{const M=fk=='iron'?MET:fk=='bone'||fk=='ice'?(fk=='ice'?S(0xbfe6ff,{emissive:0x4a90c0,emissiveIntensity:.3}):BONE):WD,H=3.4;P.forEach(([px,pz])=>{blk(px,pz,0);take(px,pz,.5);put(Q.cyl,M,px,H/2,pz,.2,H,.2);put(Q.ico,BONE,px,H+.14,pz,.2,.18,.2)});
        seg(P[0][0],gy(P[0][0],P[0][1])+H-.25,P[0][1],P[1][0],gy(P[1][0],P[1][1])+H-.25,P[1][1],.14,M,Q.cyl);
        const g0=gy(P[0][0],P[0][1]),g1=gy(P[1][0],P[1][1]);   // v177: the tusks grow out of the lintel (they stood ~.2 above it, in the air)
        [-1,1].forEach(s=>{const c=[x+sx*.9*s,z+sz*.9*s],yb=g0+(g1-g0)*(hw+.9*s)/(2*hw)+H-.25+.06;seg(c[0],yb,c[1],c[0]+Math.cos(ga)*.2+sx*.4*s,yb+.85,c[1]+Math.sin(ga)*.2+sz*.4*s,.05,BONE,Q.cone)})}
      // braziers / torches just inside, a banner outside
      const bi=[-1,1].map(s=>[x-Math.cos(ga)*1.3+sx*(hw+.7)*s,z-Math.sin(ga)*1.3+sz*(hw+.7)*s]);
      bi.forEach(([bx,bz])=>{if(!ground(bx,bz,.2))return;if(gi==0)brazier(bx,bz,pal.fire,1.2);else torch(bx,bz,pal.fire,2)});
      if(gi==0){const [lx,lz]=bi[0];light(lx,gy(lx,lz)+1.8,lz,Lc[1]||Lc[0],Lc[1]?1.3:.9,12)}
      if(gi==0&&(fk=='palis'||fk=='stakes'||fk=='bone'||fk=='iron'))[-1,1].forEach(s=>{const tx=x-Math.cos(ga)*1.6+sx*(hw+3.2)*s,tz=z-Math.sin(ga)*1.6+sz*(hw+3.2)*s;if(ground(tx,tz,.6)&&free(tx,tz,1.4)&&roadD(tx,tz)>3)tower(tx,tz,ga)});
      const bx=x+Math.cos(ga)*2.2+sx*(hw+1.1),bz=z+Math.sin(ga)*2.2+sz*(hw+1.1);if(ground(bx,bz,.2)&&free(bx,bz,.4))banner(bx,bz,pal.acc,3.4,ga,pal.trim)})}
  else if(o.gates.length&&big){// unfenced camps: a marker at the way in
    const ga=o.gates[0],x=Math.cos(ga)*(rf+1),z=Math.sin(ga)*(rf+1),sx=-Math.sin(ga),sz=Math.cos(ga);[-1,1].forEach(s=>{const px=x+sx*2.4*s,pz=z+sz*2.4*s;if(ground(px,pz,.2)&&free(px,pz,.4)&&roadD(px,pz)>1.6){
      if(I.z==4||I.z==1&&I.k==2)skullPole(px,pz,2.2,pal.bone);else if(I.z===0)lantern(px,pz,2.4);else torch(px,pz,pal.fire,2.2)}})}
  // ================= 5. outskirts, the trail and clutter =================
  if(big){const L=[];rec.o.forEach(([k,n])=>{const m=k=='tower'||k=='post'||k=='rod'?n:Math.round(n*1.5);for(let i=0;i<m;i++)L.push(k)});
    L.forEach(k=>{const rad=k=='tower'?1.8:k=='ribs'?2.6:k=='fungus'||k=='debris'?1.3:k=='deadtree'?1:.8;let p;
      if(k=='tower'){const ga=o.gates.length?o.gates[Math.floor(rn()*o.gates.length)]:rn()*TAU;p=find(rf-1.6,rf+.8,rad,ga+(rn()<.5?1:-1)*(4.2/rf),.35/rf*3,.8)||find(rf+2,r,rad,null,0,.8)}
      else p=find(Math.min(rf+2.4,r-1),r+(k=='deadtree'||k=='stalag'||k=='ice'||k=='rocks'||k=='skull'?3:1.2),rad,null,0,k=='deadtree'||k=='rocks'||k=='stalag'||k=='ice'?-.3:.2)||find(ringIn,ringOut+.6,rad);
      if(!p)return;const [x,z,a]=p;try{(Ou[k]||Ou.rocks)(x,z,face(x,z)+Math.PI,k)}catch(e){console.warn('v164 outskirt',k,e)}})}
  if(TR.length>2){let acc=0;for(let i=1;i<TR.length;i++){const A=TR[i-1],B=TR[i];acc+=Math.hypot(B[0]-A[0],B[1]-A[1]);if(acc<5.5&&i<TR.length-1)continue;acc=0;
    const t=Math.atan2(B[1]-A[1],B[0]-A[0]),sd=(i%2?1:-1),x=B[0]-Math.sin(t)*2.3*sd,z=B[1]+Math.cos(t)*2.3*sd;if(!ground(x,z,-.4)||!free(x,z,.4))continue;
    if(i>=TR.length-1){if(I.z==4||I.z==2&&I.k==1)skullPole(x,z,2.4,pal.bone);else cairn(x,z,1.1)}else if(I.z===0||I.z==4)lantern(x,z,2.2);else if(i%3==0)cairn(x,z,.8);else torch(x,z,pal.fire,1.9)}}
  // the land round the camp: the zone's own scenery, thick at the camp's edge and thinning out (the world's decorations keep out)
  {const NAT=[['deadtree','fungus','fungus','stump','roots','log','lantern'],['shrub','shrub','rocks','log','flowers','tree','tree'],['pine','pine','rocks','snowdrift','ice','deadtree'],
      ['rocks','rocks','cactus','bones','dune','palm'],['deadtree','deadtree','rocks','skull','grave','stump'],['rocks','ruincol','deadtree','deadtree','rubble']][I.z]||['rocks'];
    if(I.z===0&&I.k===1)NAT.push('stalag','stalag');if(I.z===2&&I.k===1){NAT.length=0;NAT.push('ice','stalag','rocks','snowdrift')}if(I.z===3&&I.k===2){NAT.push('saltpillar')}
    const n=Math.round(r*1.5);for(let i=0;i<n;i++){const k=NAT[Math.floor(rn()*NAT.length)],rad=k=='tree'||k=='pine'||k=='deadtree'?1.2:.8,p=find(rf+2.2,r+5,rad,null,0,-1.2);if(!p)continue;
      try{(Ou[k]||Ou.rocks)(p[0],p[1],face(p[0],p[1])+Math.PI,k)}catch(e){}}}
  if(rec.c.length){const n=Math.round(r*2.2);for(let i=0;i<n;i++){const k=rec.c[i%rec.c.length],f=Cl[k];if(!f)continue;const p=find(rc*.6,r+1,.25,null,0,-.3);if(p)try{f(p[0],p[1],p[2])}catch(e){}}}}
