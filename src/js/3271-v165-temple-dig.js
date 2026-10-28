// ================= v165 Searing Sands I · The Buried Temple: the dig =================
// The road ends at a dune heaped against the face of the canyon. A sandstone lintel and the heads of two kneeling guardians stick
// out of it: the entrance of the Sunken Temple. The dune is a real heightfield over the temple's sunken forecourt (a stair down
// into a pit before the doors, carved into the ground at load: ss165T1Terrain from 0045):
//  * F at the sand starts digging: the hero takes a spade and digs stroke after stroke (the v141 dig motion) until they move,
//    attack, press F again or no sand is in reach. Each stroke takes a scoop where the hero aims (the deepest sand in reach, in
//    front first), the sand slumps into the hole (slopes steeper than the sand's rest angle slide), and the scoop is thrown onto
//    one of three spoil heaps round the yard, which grow as the dune shrinks. Fresh cut faces are darker.
//  * The hero walks on the sand's surface (y = the dune where it is above the ground), so you can stand on the dune and dig down.
//  * Progress = sand cleared from over the forecourt and the stair (SD165.core): at SD165.done the rest slides away, the doors'
//    sun disc wakes, and the heaps begin to stir (3274: Qarsul, the Living Dune, rises from them).
//  * Saves keep every stroke (SS165.c1.dig, a list of packed local spots) and replay them on load, so the dune looks as you left it.
//  * Co-op (3275): strokes are relayed (['sd1', packed]) and replayed by partners; the uncovering is shared.
var SD165={g:null,M:null,on:0,sw:0,err:0,core:0,done:.8,last:null,prev:null,tT:0,heaps:[],rep:.8,br:1.7,dep:1.7};
// ---------------- the plan (hoisted, pure: 0045 carves the forecourt from it) ----------------
function ss165T1(){if(ss165T1.c)return ss165T1.c;const F=ss165F(0),aF=Math.max(10,Math.min(16,F.reach-1.2)),y0=HF[(Math.round(F.z)+HPD)*HW+Math.round(F.x)+HPD];
  const T={F,aF,y0,yP:y0-2.4,pit:{a0:aF-5.5,a1:aF,b:6.2},st:{a0:aF-9.5,a1:aF-5.5,b:3.2},
    mound:{a0:aF-14.2,a1:aF+.6,b:9.4,s:.36},arena:{a:aF-17.5,r:11.6},heaps:[[aF-16.5,-10.2],[aF-16.5,10.2],[aF-25.5,.5]]};
  T.ac=F.W2(T.arena.a,0);return ss165T1.c=T}
// the ground height of the forecourt at local (a, b), or null outside it
function ss165T1Floor(T,a,b){const P=T.pit,S=T.st;if(a>=P.a0&&a<=P.a1+.4&&Math.abs(b)<=P.b)return T.yP;if(a>=S.a0&&a<P.a0&&Math.abs(b)<=S.b){const k=(a-S.a0)/(S.a1-S.a0);return T.y0-(T.y0-T.yP)*k}return null}
// 0045: carve the forecourt (pit + stair) into the yard
function ss165T1Terrain(){const T=ss165T1(),F=T.F,HI=(i,j)=>(j+HPD)*HW+i+HPD;let n=0;
  for(let j=Math.floor(F.z-30);j<=F.z+30;j++)for(let i=Math.floor(F.x-30);i<=F.x+30;i++){const [a,b]=F.L2(i,j);if(a<T.st.a0-1||a>T.aF+1.5||Math.abs(b)>T.pit.b+1.5)continue;
    let h=ss165T1Floor(T,a,b);if(h==null){// the rim just round it slopes into the cut (the retaining walls cover it)
      const P=T.pit,S=T.st,inP=a>=P.a0-1&&a<=P.a1&&Math.abs(b)<=P.b+1,inS=a>=S.a0-1&&a<P.a0&&Math.abs(b)<=S.b+1;if(!inP&&!inS)continue;h=null}
    if(h!=null){HF[HI(i,j)]=h;n++}}
  T.cut=n}
// ---------------- materials ----------------
function sd165Mats(){if(SD165.M)return SD165.M;const M={},S=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.92,flatShading:true},o||{}));
  M.sand=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97,flatShading:false});
  M.heap=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97,flatShading:true});M.dark=new THREE.MeshBasicMaterial({color:0x080402});M.glow=new THREE.MeshBasicMaterial({color:0xffb040,transparent:true,opacity:.0,fog:false});
  M.door=S(0xa47c52,{roughness:.8});M.bronze=S(0x8a6a34,{roughness:.45,metalness:.6});
  return SD165.M=M}
// ---------------- the temple gate (built once, the first time Searing Sands I is visited) ----------------
function sd165Build(){if(SD165.g)return SD165.g;const T=ss165T1(),F=T.F,g=new THREE.Group();g.name='SunkenTempleGate';g.userData.psNo=1;scene.add(g);SD165.g=g;const R=dkRng(16511),M=sd165Mats();
  const [fx0,fz0]=F.W2(T.aF,0),root=new THREE.Group();root.position.set(fx0,T.yP,fz0);root.rotation.y=Math.atan2(-F.fx,-F.fz);g.add(root);SD165.root=root;
  const sd=[0xc8a070,0xbc9464,0xd2ac7c,0xb08858],sdD=0x8a6a44,gl=0x2a1a0e,gold=0xd8a840,pick=a=>a[Math.floor(R()*a.length)];
  root.add(lgGroup('SD165|facade',q=>{// local: +z toward the yard, y up from the forecourt floor, x across
    const blk=(x,y,z,w,h,d,c)=>q.p('','box','c',c||pick(sd),x,y,z,w,h,d,(R()-.5)*.01,(R()-.5)*.01,(R()-.5)*.01);
    // the wall in courses of dressed blocks, a deep doorway in the middle
    for(let y=0,k=0;y<9.4;y+=.62,k++)for(let x=-7.5+(k%2)*.55;x<7.5;x+=1.1){if(Math.abs(x)<2.2&&y<5.6)continue;blk(Math.max(-7.4,Math.min(7.4,x)),y+.31,-1.6,1.08,.6,3.2)}
    blk(0,-.4,.25,15.8,.8,1.2,sdD);
    // the cornice (a cavetto: a lip and a roll), a hieroglyph frieze under it, the stepped crown
    blk(0,9.55,-1.3,15.9,.3,3.6,sdD);blk(0,9.95,-1.0,16.4,.55,4.2);blk(0,10.38,-1.0,16.8,.3,4.4,sdD);
    for(let i=0;i<34;i++){const x=-7.3+i*.44;q.p('','box','c',gl,x,9.1,.02,.22,.32,.05)}
    [[11,0],[8,1],[5,2]].forEach(([w,k])=>{blk(0,10.95+k*.8,-1.0-k*.3,w,.8,3.6-k*.6)});
    // the doorway: deep and dark; the frame of two papyrus columns with lotus capitals and a lintel with the winged sun
    q.p('','box','c',0x1a120a,0,2.8,-.9,3.6,5.6,.2);
    [-1,1].forEach(s=>{const x=s*2.65;q.p('','box','c',sdD,x,.25,.4,1.4,.5,1.4);for(let k=0;k<6;k++){const a=k/6*Math.PI*2;q.p('','cyl','c',pick(sd),x+Math.cos(a)*.22,3.25,.4+Math.sin(a)*.22,.2,5.6,.2)}
      q.p('','cyl','c',sd[2],x,3.25,.4,.42,5.6,.42).p('','cone','c',sd[0],x,6.45,.4,.75,.8,.75,Math.PI,0,0).p('','box','c',sdD,x,6.95,.4,1.3,.25,1.3);
      for(let k=0;k<5;k++)q.p('','box','c',gl,x+s*.0,1.2+k*.9,.85,.06,.4,.04)});
    blk(0,7.45,.25,7.4,1.0,1.6);blk(0,8.1,.25,7.8,.3,1.7,sdD);
    // the winged sun on the lintel: a disc between two great fanned wings of carved feathers
    q.p('','cyl','m',gold,0,7.45,1.08,.48,.12,.48,Math.PI/2,0,0);[-1,1].forEach(s=>{for(let k=0;k<7;k++){const L=1.0+k*.28;q.p('','box','c',k%2?sd[2]:sd[0],s*(.6+L/2),7.62-k*.07,1.08,L,.13,.06,0,0,s*(.05+k*.012))}
      q.p('','sph','c',0x4a6a3a,s*.42,7.32,1.12,.14,.2,.08)});
    // hieroglyph columns either side of the door: carved signs in rows (eyes, ankhs, birds, waves, beetles)
    [-1,1].forEach(s=>{for(let c=0;c<3;c++)for(let r=0;r<9;r++){const x=s*(3.7+c*1.05),y=.9+r*.82,t=(c*9+r*7+(s>0?3:0))%5;q.p('','box','c',gl,x,y,.02,.6,.04,.03);
      if(t==0){q.p('','sph','c',gl,x,y+.32,.03,.22,.12,.03).p('','sph','m',gold,x,y+.32,.05,.07)}else if(t==1){q.p('','box','c',gl,x,y+.3,.03,.06,.42,.03).p('','tor','c',gl,x,y+.6,.03,.12,.04,.12,Math.PI/2,0,0)}
      else if(t==2){q.p('','box','c',gl,x-.05,y+.28,.03,.34,.12,.03,0,0,.4).p('','sph','c',gl,x+.14,y+.42,.03,.07)}else if(t==3)for(let w=0;w<3;w++)q.p('','box','c',gl,x-.18+w*.18,y+.28+(w%2)*.06,.03,.16,.05,.03,0,0,w%2?.4:-.4);
      else{q.p('','sph','c',gl,x,y+.3,.03,.18,.14,.03).p('','box','c',gl,x,y+.48,.03,.04,.12,.03)}}});
    // cracks and drifts of sand on the ledges
    for(let k=0;k<8;k++)q.p('','box','c',0x5a4028,-6+R()*12,2+R()*6,.01,.05,1.2+R()*1.6,.02,0,0,(R()-.5)*.8);
    [-1,1].forEach(s=>{for(let k=0;k<3;k++)q.p('','sph','c',0xdcb880,s*(3+k*1.6),9.7+k*.2,1.2,.9,.25,.8)});
  },0));
  // the doors: two great stone leaves banded in bronze (they slide apart into the walls when the temple opens)
  const door=new THREE.Group();root.add(door);SD165.door=door;SD165.leaves=[];
  [-1,1].forEach(s=>{const L=lgGroup('SD165|leaf',q=>{q.p('','box','c',0xa47c52,0,2.75,0,1.78,5.5,.4);for(let k=0;k<4;k++)q.p('','box','m',0x8a6a34,0,.8+k*1.4,.22,1.8,.12,.05);q.p('','sph','m',0xd8a840,.55,2.8,.24,.12);
      for(let k=0;k<3;k++)q.p('','box','c',0x2a1a0e,-.3,1.4+k*1.4,.21,.4,.5,.02)},0);L.position.set(s*.9,0,-.55);L.scale.x=s;door.add(L);SD165.leaves.push(L)});
  // the passage behind (a faint fire glow deep inside once open) and the sun disc's glow
  const pas=new THREE.Mesh(new THREE.BoxGeometry(3.5,5.4,6),M.dark);pas.position.set(0,2.7,-3.8);root.add(pas);
  const glo=new THREE.Mesh(new THREE.PlaneGeometry(3.3,5.2),M.glow.clone());glo.position.set(0,2.7,-6.7);root.add(glo);SD165.pglow=glo;
  const sun=new THREE.Mesh(new THREE.CircleGeometry(.52,20),new THREE.MeshBasicMaterial({color:0xffc040,transparent:true,opacity:0,fog:false,blending:THREE.AdditiveBlending,depthWrite:false}));sun.position.set(0,7.45,1.16);root.add(sun);SD165.sun=sun;
  // the two kneeling guardians with scarab heads (khopesh across the knees), on plinths at the forecourt's sides
  [-1,1].forEach(s=>{const G=lgGroup('SD165|guard',q=>{const c=0xc49a68,c2=0xb08858,c3=0x8a6a44;
      q.p('','box','c',c3,0,-.36,0,2.3,.8,2.7).p('','box','c',c3,0,.55,0,2.2,1.1,2.6).p('','box','c',c2,0,1.15,0,2.4,.12,2.8);
      q.p('','box','c',c,0,1.6,-.35,1.5,.9,1.5).p('','box','c',c,-.42,1.45,.55,.5,.6,1.3).p('','box','c',c,.42,1.45,.55,.5,.6,1.3);   // folded legs, knees forward
      q.p('','box','c',c,0,2.9,-.4,1.3,1.9,.9).p('','box','c',c2,0,2.25,-.38,1.36,.18,.95);   // torso, belt
      [-1,1].forEach(e=>{q.p('','box','c',c,e*.82,3.1,-.35,.42,1.4,.45,0,0,e*.12).p('','box','c',c,e*.6,2.35,.3,.36,.36,1.1)});
      q.L('','m',0x9a7a3a,[-.7,2.3,.75],[.6,2.25,.85],.05,.05,4).p('','box','m',0xb08a40,.75,2.3,.82,.55,.1,.22,0,0,.5);   // the khopesh
      // the nemes: striped cloth falling over the shoulders
      for(let k=0;k<5;k++)[-1,1].forEach(e=>q.p('','box','c',k%2?0x3a5a8a:0xd8b070,e*(.42+k*.0),3.7-k*.18,-.05,.42,.18,.62));
      // the scarab head: a domed beetle head, a horn, mandibles, compound eyes
      q.p('','sph','c',0x6a5a3a,0,4.35,-.25,.58,.48,.62).p('','sph','c',0x7a6a44,0,4.1,.25,.4,.32,.4).p('','cone','c',0x5a4a30,0,4.85,.05,.14,.6,.14,-.45,0,0);
      [-1,1].forEach(e=>{q.p('','cone','c',0x5a4a30,e*.2,3.88,.62,.07,.42,.07,1.9,0,e*.5).p('','sph','g',0x40e0c0,e*.33,4.45,.18,.09,.12,.09)})},0);
    const [x,z]=F.W2(T.aF-1.6,s*4.75);G.position.set(x,T.yP+.75,z);G.rotation.y=Math.atan2(-F.fx,-F.fz);g.add(G)});
  // the forecourt: a stair down, flagstones, retaining walls of sandstone with a balustrade, two beetle finials at the top of the stair
  g.add(lgGroup('SD165|court',q=>{const P=T.pit,S=T.st,yw=Math.atan2(F.fx,F.fz),W=(a,b)=>F.W2(a,b);
    const n=8;for(let k=0;k<n;k++){const a=S.a0+(k+.5)*(S.a1-S.a0)/n,top=T.y0-(T.y0-T.yP)*(k+.75)/n,[x,z]=W(a,0);q.p('','box','c',pick(sd),x,top-.35,z,S.b*2,.7,(S.a1-S.a0)/n*1.02,0,yw,0).p('','box','c',sdD,x+F.fx*.2,top-.02,z+F.fz*.2,S.b*2+.05,.05,.07,0,yw,0)}
    for(let a=P.a0+.5;a<P.a1;a+=1.1)for(let b=-P.b+.55;b<P.b;b+=1.1){const [x,z]=W(a+(R()-.5)*.1,b+(R()-.5)*.1);q.p('','box','c',R()<.15?sdD:pick(sd),x,T.yP+.03,z,1.04,.08,1.04,0,yw+(R()-.5)*.05,0)}
    const wall=(a0,a1,b0,b1,h0,h1)=>{const L=Math.hypot(a1-a0,b1-b0),m=Math.max(1,Math.round(L/1.1));for(let k=0;k<m;k++){const t=(k+.5)/m,a=a0+(a1-a0)*t,b=b0+(b1-b0)*t,[x,z]=W(a,b),hb=h0+(h1-h0)*t,top=T.y0+.35,yw2=Math.atan2((a1-a0)*F.fx+(b1-b0)*F.lx,(a1-a0)*F.fz+(b1-b0)*F.lz);
        for(let y=hb;y<top;y+=.6)q.p('','box','c',pick(sd),x,Math.min(y+.3,top-.3),z,.55,.6,L/m*1.02,0,yw2,0);q.p('','box','c',sdD,x,top+.05,z,.7,.14,L/m*1.04,0,yw2,0);if(k%2==0)q.p('','box','c',pick(sd),x,top+.45,z,.38,.7,.38,0,yw2,0)}};
    [-1,1].forEach(s=>{wall(P.a0,P.a1,s*(P.b+.3),s*(P.b+.3),T.yP,T.yP);wall(P.a0-.3,P.a0-.3,s*(S.b+.3),s*(P.b+.3),T.yP,T.yP);wall(S.a0,S.a1,s*(S.b+.3),s*(S.b+.3),T.y0,T.yP)});
    // the beetle finials at the stair head
    [-1,1].forEach(s=>{const [x,z]=W(S.a0-.4,s*(S.b+.3));q.p('','box','c',sdD,x,T.y0+.4,z,.9,.8,1.2,0,yw,0).p('','sph','c',0x8a7048,x,T.y0+1.05,z,.38,.3,.55,0,yw,0).p('','sph','c',0x7a6040,x,T.y0+1.05,z+F.fz*0,.22,.2,.2)});
    // braziers by the doors (lit when the temple opens)
    SD165.fires=[];[-1,1].forEach(s=>{const [x,z]=W(P.a1-1.2,s*2.6);q.p('','cyl','m',0x5a4020,x,T.yP+.5,z,.16,1.0,.16).p('','cyl','m',0x6a4a24,x,T.yP+1.05,z,.38,.22,.38);SD165.fires.push([x,T.yP+1.2,z])});
  },0));
  // the spoil heaps: each is a lumpy dune mesh scaled by the sand thrown on it
  SD165.heaps=T.heaps.map((h,i)=>{const [x,z]=F.W2(h[0],h[1]),m=new THREE.Mesh(svG('sd165heap'+i,()=>{const q=new THREE.SphereGeometry(1,20,9,0,Math.PI*2,0,Math.PI/2),P=q.attributes.position,rn=svRng(1651+i),col=[],c=new THREE.Color();
      for(let j=0;j<P.count;j++){const X=P.getX(j),Y=P.getY(j),Z=P.getZ(j),a=Math.atan2(Z,X),k=1+.18*Math.sin(a*3+i)+.1*Math.sin(a*7+i*2)+(rn()-.5)*.08,y=Math.pow(Math.max(0,Y),1.25)*(.92+.12*Math.sin(a*2)+(rn()-.5)*.1);P.setXYZ(j,X*k*(1-.25*Y),y,Z*k*(1-.25*Y));
        const s=.5+.5*Math.sin(a*9+Y*7+i);c.setRGB(.78-.12*s+(rn()-.5)*.04,.6-.1*s,.38-.08*s);col.push(c.r,c.g,c.b)}q.setAttribute('color',new THREE.Float32BufferAttribute(col,3));q.computeVertexNormals();return q}),M.heap);
    m.position.set(x,GH(x,z)-.05,z);m.scale.set(.01,.01,.01);m.userData.lpsSkip=1;g.add(m);return {m,x,z,v:0}});
  // what stands is solid: the facade and the guardians (the forecourt's walls once the sand is gone: sd165Walls)
  for(let a=T.aF-.3;a<T.aF+6;a+=.5)for(let b=-8.2;b<=8.2;b+=.5){const [x,z]=F.W2(a,b);CBLK.add(Math.round(z)*W+Math.round(x))}
  [-1,1].forEach(s=>{for(let a=-1.2;a<=1.2;a+=.5)for(let b=-1.1;b<=1.1;b+=.5){const [x,z]=F.W2(T.aF-1.6+a,s*4.75+b);CBLK.add(Math.round(z)*W+Math.round(x))}});
  sd165Mound();sd165Replay();sd165Sync(true);return g}
// the forecourt's retaining walls block only once the dune is gone (while it stands you walk over them on the sand)
function sd165Walls(on){const T=ss165T1(),F=T.F,P=T.pit,S=T.st,ks=SD165.wk||(SD165.wk=(()=>{const L=new Set(),add=(a,b)=>{const [x,z]=F.W2(a,b);L.add(Math.round(z)*W+Math.round(x))};
    [-1,1].forEach(s=>{for(let a=P.a0-.4;a<=P.a1;a+=.4)add(a,s*(P.b+.6));for(let b=S.b+.4;b<=P.b+.6;b+=.4)add(P.a0-.7,s*b);for(let a=S.a0;a<=S.a1;a+=.4)add(a,s*(S.b+.6))});return [...L]})());
  if(on===SD165.wOn)return;SD165.wOn=on;ks.forEach(k=>{if(on)CBLK.add(k);else CBLK.delete(k)})}
// ---------------- the dune ----------------
// a grid over the forecourt: F the ground (with the cut), S the sand's surface (≥ F), S0 the dune as it was; core marks the cells over
// the pit and the stair (their sand is what has to go)
function sd165Mound(){const T=ss165T1(),F=T.F,Mo=T.mound,s=Mo.s,na=Math.round((Mo.a1-Mo.a0)/s)+1,nb=Math.round(Mo.b*2/s)+1,N=na*nb;
  const D={na,nb,s,Fl:new Float32Array(N),S:new Float32Array(N),S0:new Float32Array(N),core:new Uint8Array(N),V0:0,cut:new Float32Array(N)};SD165.D=D;
  for(let i=0;i<na;i++)for(let j=0;j<nb;j++){const a=Mo.a0+i*s,b=-Mo.b+j*s,k=i*nb+j,[x,z]=F.W2(a,b),fl=GH(x,z);D.Fl[k]=fl;
    // the dune: low at the yard, piled against the facade, falling off at its sides, with ripples
    const u=Math.max(0,Math.min(1,(a-Mo.a0)/(T.aF-Mo.a0))),side=1-smt(5.2,Mo.b,Math.abs(b)),rip=.12*Math.sin(a*1.7+b*.6)+.08*Math.sin(b*2.3-a*.4)+.1*(fbm2(a*.3+11,b*.3,2)-.5);
    const ol=1.2*Math.sin(a*.55+1.3)+.8*Math.sin(a*1.3+b*.2),sideW=1-smt(4.6+ol*.6,Mo.b-.4+ol*.3,Math.abs(b)),lump=.35*(fbm2(a*.18+3,b*.18+9,3)-.5)+.18*Math.sin(a*.9-b*.7);
    let h=T.y0+.2+2.65*Math.pow(u,1.35)*(.5+.5*sideW)+(rip+lump)*(.4+u);h=T.y0+(h-T.y0)*Math.max(sideW,.2+.8*(1-Math.pow(1-u,3))*sideW);
    const e=Math.min(1,(a-Mo.a0-Math.max(0,ol*.7))/1.8,(Mo.b-Math.abs(b))/1.8);h=fl+(Math.max(fl,h)-fl)*Math.max(0,Math.min(1,e));
    D.S[k]=D.S0[k]=Math.max(fl,h);if(ss165T1Floor(T,a,b)!=null)D.core[k]=1;if(D.core[k])D.V0+=(D.S[k]-fl)*s*s}
  // the mesh: one vertex per cell
  const pos=new Float32Array(N*3),col=new Float32Array(N*3),idx=[];for(let i=0;i<na-1;i++)for(let j=0;j<nb-1;j++){const a=i*nb+j,b=a+1,c=a+nb,d=c+1;idx.push(a,b,c,b,d,c)}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));G.setAttribute('color',new THREE.BufferAttribute(col,3));G.setIndex(idx);
  const m=new THREE.Mesh(G,sd165Mats().sand);m.receiveShadow=true;m.castShadow=false;m.frustumCulled=false;m.userData.lpsSkip=1;SD165.g.add(m);D.m=m;sd165Mesh(0,0,na-1,nb-1)}
// rewrite the mesh in a window of cells (positions, colours: dry sand, darker damp sand on fresh cut faces), then its normals
function sd165Mesh(i0,j0,i1,j1){const D=SD165.D,T=ss165T1(),F=T.F,Mo=T.mound,P=D.m.geometry.attributes.position.array,C=D.m.geometry.attributes.color.array,nb=D.nb;
  i0=Math.max(0,i0);j0=Math.max(0,j0);i1=Math.min(D.na-1,i1);j1=Math.min(nb-1,j1);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=i*nb+j,a=Mo.a0+i*D.s,b=-Mo.b+j*D.s,[x,z]=F.W2(a,b),dep=D.S[k]-D.Fl[k],cut=Math.max(0,D.S0[k]-D.S[k]);
    P[k*3]=x;P[k*3+1]=dep<.03?D.Fl[k]-.12:D.S[k];P[k*3+2]=z;
    const w=Math.min(1,cut/1.6),r=.86-.2*w+.03*Math.sin(a*3.1+b*2.3),gg=.7-.2*w,bb=.46-.15*w;C[k*3]=r;C[k*3+1]=gg;C[k*3+2]=bb}
  D.m.geometry.attributes.position.needsUpdate=true;D.m.geometry.attributes.color.needsUpdate=true;D.m.geometry.computeVertexNormals();D.m.geometry.computeBoundingSphere()}
// the sand's surface at a world spot (or null off the dune / where no sand is)
function sd165At(x,z){const D=SD165.D;if(!D)return null;const T=ss165T1(),[a,b]=T.F.L2(x,z),Mo=T.mound,u=(a-Mo.a0)/D.s,v=(b+Mo.b)/D.s;if(u<0||v<0||u>=D.na-1||v>=D.nb-1)return null;
  const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,nb=D.nb,k=i*nb+j,S=D.S,Fl=D.Fl;
  const s=S[k]*(1-fu)*(1-fv)+S[k+nb]*fu*(1-fv)+S[k+1]*(1-fu)*fv+S[k+nb+1]*fu*fv,f=Fl[k]*(1-fu)*(1-fv)+Fl[k+nb]*fu*(1-fv)+Fl[k+1]*(1-fu)*fv+Fl[k+nb+1]*fu*fv;return s-f>.04?s:null}
// how much of the forecourt's sand is gone (0..1)
function ss165DigP(){const D=SD165.D;if(SS165.c1.st>=2)return 1;if(!D){return Math.min(.99,(SS165.c1.dig.length||0)/70)}let v=0;for(let k=0;k<D.S.length;k++)if(D.core[k])v+=(D.S[k]-D.Fl[k])*D.s*D.s;return Math.max(0,Math.min(1,1-v/(D.V0||1)))}
// one stroke of the spade at local (a, b): the scoop, then the sand slumps; returns the volume taken
function sd165Stroke(a,b,fx){const D=SD165.D,T=ss165T1(),Mo=T.mound;if(!D)return 0;const ci=(a-Mo.a0)/D.s,cj=(b+Mo.b)/D.s,r=SD165.br/D.s,nb=D.nb;let took=0;
  const i0=Math.floor(ci-r-1),i1=Math.ceil(ci+r+1),j0=Math.floor(cj-r-1),j1=Math.ceil(cj+r+1);
  for(let i=Math.max(0,i0);i<=Math.min(D.na-1,i1);i++)for(let j=Math.max(0,j0);j<=Math.min(nb-1,j1);j++){const d=Math.hypot(i-ci,j-cj)/r;if(d>=1)continue;const k=i*nb+j,q=SD165.dep*Math.pow(1-d*d,1.5),nv=Math.max(D.Fl[k],D.S[k]-q);took+=(D.S[k]-nv)*D.s*D.s;D.S[k]=nv}
  // the sand slides: slopes steeper than its rest angle shed into their lower neighbour (a few passes round the hole)
  const W0=Math.ceil(r+5),rep=SD165.rep*D.s;for(let it=0;it<5;it++)for(let i=Math.max(1,Math.floor(ci-W0));i<Math.min(D.na-1,ci+W0);i++)for(let j=Math.max(1,Math.floor(cj-W0));j<Math.min(nb-1,cj+W0);j++){const k=i*nb+j;
    for(const o of [nb,-nb,1,-1]){const q=k+o,df=D.S[k]-D.S[q];if(df>rep){let mv=(df-rep)*.3;mv=Math.min(mv,D.S[k]-D.Fl[k]);if(mv<=0)continue;D.S[k]-=mv;D.S[q]+=mv}}}
  if(!fx)return took;sd165Mesh(Math.floor(ci-W0),Math.floor(cj-W0),Math.ceil(ci+W0),Math.ceil(cj+W0));return took}
// ---------------- digging ----------------
function sd165Pack(a,b){return Math.round((a+40)*10)*1000+Math.round((b+40)*10)}
function sd165Unpack(p){return [Math.floor(p/1000)/10-40,(p%1000)/10-40]}
// the spot to dig: the deepest core sand within reach, in front of the hero first (the whole dune counts too)
function sd165Aim(){const D=SD165.D;if(!D)return null;const T=ss165T1(),F=T.F,Mo=T.mound,p=pl.position,fwx=Math.sin(pl.rotation.y),fwz=Math.cos(pl.rotation.y);let best=null,bs=0;
  for(let i=0;i<D.na;i+=1)for(let j=0;j<D.nb;j+=1){const k=i*D.nb+j,dep=D.S[k]-D.Fl[k];if(dep<.12)continue;const a=Mo.a0+i*D.s,b=-Mo.b+j*D.s,[x,z]=F.W2(a,b),dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d>2.5||d<.35)continue;
    const fr=(dx*fwx+dz*fwz)/d,sc=dep*(D.core[k]?1.6:1)*(1.2+fr)*(1.3-d/2.5);if(sc>bs){bs=sc;best={a,b,x,z,dep}}}return best}
function sd165Can(){if(!ss165Here(0)||SS165.c1.st>=2||!SD165.D)return false;return !!sd165Aim()}
function sd165Start(){if(SD165.on)return sd165Stop('again');if(riding)try{dismount()}catch(_){}if(SS165.c1.st<1){SS165.c1.st=1;SS165.trkK=''}SD165.on=1;SD165.sw=0;SD165.p0=pl.position.clone();sd165Next()}
function sd165Stop(why){if(!SD165.on)return;SD165.on=0;SD165.pend=null;SD165.tool=0;try{sk141Hide()}catch(_){}if(why==='none')say('🏜️ No sand within reach here. Move closer to the dune.')}
// the next stroke: turn to the sand, the dig motion, the scoop lands at the bottom of the push (~45% through the motion)
function sd165Next(){const t=sd165Aim();if(!t)return sd165Stop('none');const M=SK141_T.dig;pl.rotation.y=Math.atan2(t.x-pl.position.x,t.z-pl.position.z);
  SD165.tool=1;try{sk141Show('spade')}catch(_){}try{haPlay(M.ms,M.t,2,null,.2)}catch(_){}SD165.pend={t:M.ms/1000*.45,a:t.a,b:t.b,x:t.x,z:t.z};SD165.sw=M.ms/1000}
// the spade stays in hand while digging (2995 puts it away whenever the hero is not gathering)
{const f=sk141Hide;sk141Hide=function(){if(SD165.tool&&SD165.on)return;return f.apply(this,arguments)}}
function sd165Dig(a,b,own){const took=sd165Stroke(a,b,true);SS165.c1.dig.push(sd165Pack(a,b));if(SS165.c1.dig.length>600)SS165.c1.dig.shift();SS165.trkK='';
  // the scoop flies onto the nearest heap, which grows
  const T=ss165T1(),F=T.F,[x,z]=F.W2(a,b),H=SD165.heaps.reduce((m,h)=>!m||Math.hypot(h.x-x,h.z-z)<Math.hypot(m.x-x,m.z-z)?h:m,null);
  if(H){H.v+=took;const y=(sd165At(x,z)||GH(x,z))+.2;svShot(new THREE.Vector3(x,y,z),new THREE.Vector3(H.x,GH(H.x,H.z)+H.m.scale.y*.8,H.z),.55,0xd8b47a,.8,2.2,()=>{burst(new THREE.Vector3(H.x,GH(H.x,H.z)+H.m.scale.y,H.z),0xd8b47a,6,1.2,1,.5)},sd165Clod());sd165Heaps()}
  burst(new THREE.Vector3(x,(sd165At(x,z)||GH(x,z))+.1,z),0xe0c088,10,1.1,1.6,.5);if(own)svSnd('squelch',.35,1.6+Math.random()*.3);
  if(own&&typeof co165Dig=='function')co165Dig(a,b);
  if(SS165.c1.st<2&&ss165DigP()>=SD165.done)sd165Uncover(own)}
// a clod of thrown sand (shared geometry and material: svShot only removes it)
function sd165Clod(){const m=new THREE.Mesh(svG('sd_clod',()=>svLump(.28,0,.45,171)),qs165SandMat());m.scale.set(1.3,.8,1.1);m.userData.lpsSkip=1;return m}
// the heaps: each grows with the sand on it (a cube root, so it widens and rises), capped
function sd165Heaps(full){const V0=SD165.D?SD165.D.V0:120;SD165.heaps.forEach(h=>{const f=full?1:Math.min(1,h.v/(V0/3)),r=Math.max(.01,3.4*Math.cbrt(f));h.m.scale.set(r,r*.55,r);h.m.position.y=GH(h.x,h.z)-.1})}
// load / first build: replay the saved strokes (no effects), then the state
function sd165Replay(){const L=SS165.c1.dig;let n=0;for(const p of L){const [a,b]=sd165Unpack(p);const took=sd165Stroke(a,b,false);const T=ss165T1(),[x,z]=T.F.W2(a,b);const H=SD165.heaps.reduce((m,h)=>!m||Math.hypot(h.x-x,h.z-z)<Math.hypot(m.x-x,m.z-z)?h:m,null);if(H)H.v+=took;n++}
  if(SD165.D)sd165Mesh(0,0,SD165.D.na,SD165.D.nb);sd165Heaps();return n}
// all clear (or nearly): the rest of the sand slides away from the doors, the sun disc wakes; the heaps are full
function sd165Uncover(own){if(SS165.c1.st>=2)return;SS165.c1.st=2;SS165.trkK='';sd165Stop();const D=SD165.D;
  if(D){const S1=D.S.slice();let t=0;kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/1.6);for(let i=0;i<D.S.length;i++)D.S[i]=S1[i]+(Math.max(D.Fl[i],Math.min(S1[i],D.Fl[i]+(D.core[i]?0:Math.max(0,S1[i]-D.Fl[i])*.25)))-S1[i])*svEase.io(k);sd165Mesh(0,0,D.na,D.nb);
      if(Math.random()<.5){const T=ss165T1(),[x,z]=T.F.W2(T.pit.a0+Math.random()*5,(Math.random()-.5)*10);burst(new THREE.Vector3(x,T.yP+1,z),0xe0c088,6,2,1.2,.8)}return k<1},end(){}})}
  SD165.heaps.forEach(h=>h.v=Math.max(h.v,1));sd165Heaps(true);sd165Walls(true);svSnd('heavy',.9,.6);shake(.25);
  setTimeout(()=>{try{zt116Show(ZT116.Z[3],'Searing Sands · Main Quest','The Sunken Gate','The doors of the Sunken Temple stand uncovered','But the sand you moved is moving on its own…','z3')}catch(_){}say('🏜️ The temple entrance is uncovered. Behind you, the heaps of sand begin to stir…')},900);
  if(own&&typeof co165Uncover=='function')co165Uncover()}
// ---------------- the state of the scene ----------------
function sd165Sync(first){const st=SS165.c1.st,done=ss165Done(1),open=st>=3||done;if(!SD165.g)return;
  if((st>=2||done)&&SD165.D){const D=SD165.D;for(let i=0;i<D.S.length;i++)if(D.core[i])D.S[i]=D.Fl[i];sd165Mesh(0,0,D.na,D.nb)}
  sd165Walls(st>=2||done);SD165.open=open;if(open){SD165.leaves.forEach((L,i)=>L.position.x=(i?1:-1)*2.75);SD165.sun.material.opacity=.85;SD165.pglow.material.opacity=.5}
  const showHeaps=(st===2&&!done)||(typeof QS165!='undefined'&&QS165.e&&!QS165.e.dead);if(!open&&st>=2)sd165Heaps(true);if(open&&!showHeaps)SD165.heaps.forEach(h=>h.m.scale.set(.01,.01,.01))}
SS165L.push(()=>{if(SD165.g){if(SD165.D){const D=SD165.D;D.S.set(D.S0);SD165.heaps.forEach(h=>h.v=0);sd165Replay()}sd165Stop();sd165Sync()}});
// the doors slide open (Qarsul slain): the sun disc blazes, braziers catch, the passage glows
function sd165Open(){if(!SD165.g)return;SD165.open=1;const L=SD165.leaves;let t=0;svSnd('heavy',1.2,.45);shake(.35);
  kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/3.2);L.forEach((l,i)=>l.position.x=(i?1:-1)*(.9+1.85*svEase.io(k)));SD165.sun.material.opacity=.85*k;SD165.pglow.material.opacity=.5*k;
    if(Math.random()<.4){const T=ss165T1(),[x,z]=T.F.W2(T.aF-.4,(Math.random()-.5)*3.6);burst(new THREE.Vector3(x,T.yP+Math.random()*5,z),0xd8b47a,3,.6,-.4,1)}return k<1},end(){}})}
// ---------------- prompts ----------------
function sd165Door(){const T=ss165T1(),[x,z]=T.F.W2(T.aF-1.2,0);return {x,z}}
function sd165Prompt(){if(!ss165Here(0)||!SD165.g)return null;const P=pl.position,st=SS165.c1.st,done=ss165Done(1);
  if(st>=3||done){const d=sd165Door();if(Math.hypot(P.x-d.x,P.z-d.z)<3.2){const N=ss165I(1);return {label:'F · Enter the Sunken Temple ('+N.n+', '+rpTxt139(N.lv[0])+')',fn:()=>sd165Enter()}}return null}
  if(st>=2)return null;
  if(SD165.on)return {label:'F · Stop digging · '+Math.round(ss165DigP()*100)+'% cleared',fn:()=>sd165Stop()};
  if(sd165Can())return {label:'F · Dig into the sand'+(st>=1?' · '+Math.round(ss165DigP()*100)+'% cleared':' · something is buried here'),fn:()=>sd165Start()};
  return null}
{const f=worldPrompt;worldPrompt=function(){try{const r=sd165Prompt();if(r)return r}catch(e){if(!SD165.err++)console.warn('v165 dig prompt',e)}return f.apply(this,arguments)}}
function sd165Enter(){SS165.c1.st=4;SS165.trkK='';try{insGo(ss165I(1))}catch(e){console.error('v165 enter temple',e)}
  setTimeout(()=>{try{zt116Show(ZT116.Z[3],'Searing Sands · Main Quest','The Sunken Temple','You descend into the dark beneath the dune','','z3')}catch(_){}},900)}
// ---------------- the world tick: building, digging strokes, the hero on the sand, the fires ----------------
function sd165Tick(dt,now){const here=ss165Here(0);if(here&&!SD165.g)try{sd165Build()}catch(e){console.error('v165 temple build',e);SD165.err++;SD165.g=SD165.g||new THREE.Group()}
  if(!SD165.g)return;SD165.g.visible=here;if(!here){if(SD165.on)sd165Stop();return}
  if(SS165.c1.st<1){const T=ss165T1(),p=pl.position;if(Math.hypot(p.x-T.ac[0],p.z-T.ac[1])<22){SS165.c1.st=1;SS165.c1.seen=1;SS165.trkK='';say('🏜️ A carved lintel and two stone heads stick out of the dune. Something great lies buried here: dig it out.')}}
  // the hero walks on the sand
  {const p=pl.position,s=sd165At(p.x,p.z);if(s!=null&&s>p.y)p.y=s}
  if(SD165.on){const p=pl.position,mv=Math.hypot(p.x-SD165.p0.x,p.z-SD165.p0.z);if(mv>.6||hero.hp<=0||riding)sd165Stop();
    else{if(SD165.pend){SD165.pend.t-=dt;if(SD165.pend.t<=0){const q=SD165.pend;SD165.pend=null;sd165Dig(q.a,q.b,true)}}
      SD165.sw-=dt;if(SD165.sw<=0&&SD165.on&&SS165.c1.st<2)sd165Next()}}
  if(SD165.open&&SD165.fires&&Math.random()<dt*12){const q=SD165.fires[Math.random()<.5?0:1];burst(new THREE.Vector3(q[0]+(Math.random()-.5)*.3,q[1],q[2]+(Math.random()-.5)*.3),Math.random()<.5?0xff8a2a:0xffc040,1,.15,1.4,.5)}
  if(SS165.c1.st===1&&now-SD165.tT>900){SD165.tT=now;SS165.trkK=''}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{sd165Tick(dt,now)}catch(e){if(!SD165.err++)console.warn('v165 dig tick',e)}return r}}
// an attack or ability stops the digging
{const f=swing;swing=function(){if(SD165.on)sd165Stop();return f.apply(this,arguments)}}
{const f=cast;cast=function(){if(SD165.on)sd165Stop();return f.apply(this,arguments)}}
// 1680: the zone's decorations stay off the yard, the forecourt and the dune (counted as placed)
function ss165Keep(g,x,z){try{if(g===insG(3,0)){const T=ss165T1(),[a,b]=T.F.L2(x,z);return a>T.arena.a-T.arena.r-2&&a<T.aF+6&&Math.abs(b)<Math.max(T.arena.r+2,T.mound.b+1.5)}
    if(typeof ss165Keep2=='function'&&ss165Keep2(g,x,z))return true;if(typeof ss165Keep3=='function'&&ss165Keep3(g,x,z))return true}catch(_){}return false}
// 0045: the chapters' own ground (I's forecourt; II and III add theirs)
function ss165Terrain(){try{ss165T1Terrain()}catch(e){console.warn('v165 forecourt',e)}try{if(typeof ss165T2Terrain=='function')ss165T2Terrain()}catch(e){console.warn('v165 courtyard ground',e)}try{if(typeof ss165T3Terrain=='function')ss165T3Terrain()}catch(e){console.warn('v165 overlook ground',e)}}
