// ================= v165 The Pilgrim's Stair: Mistmere's way up the mountain =================
// The owner: "For plains instance 2 we have steps leading to a mountain to leave the area. We need more detail on that piece of the
// map so it really feels like it's a place where you're leaving and going up a mountain. Right now it's just some stairs and rocks
// but it's not really integrated into the map and doesn't look very good."
// The v153 gateway (ch153GateModel: nine steps between two rock piles at the edge of Mistmere's gateway clearing) is replaced by
// a mountainside that is part of the map itself:
//  * The ground: behind the clearing the land rises into a real mountain face (th165Terrain, from 0045 after every other height
//    pass): a slope climbing ~0.44 per tile away from the clearing, a ring of higher crags round it (a cirque), and a gorge that
//    cuts up into the mountain at the top. A switchback trail is cut into the face as a ledge (uphill side a rock wall, downhill
//    side a drop with a stone parapet): three flights of stairs, three landings and a ramp into the gorge, ~13 units of climb.
//  * The tiles (th165Map, from 0045 after every other map pass): the trail is walkable ground, the rest of the mountain is rock
//    ('R', solid; its DW is the distance to the trail, so the v124 edge line and the bank scenery follow the trail's edges).
//    Only rim ground is reshaped (DW > -1.5 before): the clearing itself is untouched.
//  * The dressing (th165Build, the first time Mistmere is visited, as the gateway's build): carved serpent pillars and a signpost
//    at the foot, a hitching rail, trough and mounting block (a mount is needed up there), stone stairs with worn treads, parapets
//    and rope rails, a wayshrine with a lantern on the first landing, a cairn and prayer flags at the switchback, the ruined
//    Pilgrims' Gate (two towers and a broken arch with a serpent keystone, braziers) before the gorge, scree, boulders, pines on
//    the ledges, a waterfall down the crags into a rock pool, and behind it all a great snow-capped peak with clouds round it.
//  * The F prompt ("Ascend to the hilltops") is at the top of the trail in the gorge (G.spot), where the climb really begins.
// Everything is seeded (co-op partners build the same mountain). th165Plan is hoisted and pure: 0045 calls it during the world build.
var TH165={S:null,err:0,fl:[],wf:null,t:0};
function th165Walk(t){return t==='.'||t==='g'||t==='a'}
// the foot of the trail: the gateway clearing's far edge (as sp152GateSpot, from the tiles and DW only: the world is still being built)
function th165Spot(m,DW){const I=INSL[6],P=I.path,G=I.ba,q=P[Math.max(0,P.length-16)];let dx=G[0]-q[0],dz=G[1]-q[1];const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;
  const free=(x,z)=>{const X=Math.round(x),Z=Math.round(z),t=m[Z]&&m[Z][X];return th165Walk(t)&&DW[Z*W+X]<-.6};
  for(const d of [10.5,10,9.5,9,8.5,8,7,6])for(const a of [0,.25,-.25,.5,-.5,.8,-.8]){const c=Math.cos(a),s=Math.sin(a),ux=dx*c-dz*s,uz=dx*s+dz*c,x=G[0]+ux*d,z=G[1]+uz*d;
    if(free(x,z)&&free(x+ux*1.2,z+uz*1.2)&&free(x-uz*1.6,z+ux*1.6)&&free(x+uz*1.6,z-ux*1.6))return {x,z,ux,uz}}
  return {x:G[0]+dx*6,z:G[1]+dz*6,ux:dx,uz:dz}}
// the plan: the frame (f = up the mountain, l = across it, the side with room), the trail as a resampled polyline with heights
// (relative to the clearing) and half widths, the gorge beyond it. Local (a, b) → world: S + f·a + l·b.
function th165Plan(m,DW){if(th165Plan.c)return th165Plan.c;m=m||MAP;DW=DW||MAP.DW;const I=INSL[6],S=th165Spot(m,DW),fx=S.ux,fz=S.uz,lx=-fz,lz=fx;
  const W2=(a,b)=>[S.x+fx*a+lx*b,S.z+fz*a+lz*b],L2=(x,z)=>{const dx=x-S.x,dz=z-S.z;return [dx*fx+dz*fz,dx*lx+dz*lz]};
  // [a, b, height, half width, kind of the stretch that ends here: 'st' stairs, 'ld' landing, 'rp' ramp]. The rock band between
  // the clearing, the field to its north and the instance's east edge is where the mountain goes: flight 1 out of the clearing,
  // flight 2 east across the face, flight 3 back west, the ramp north into the gorge.
  const K=[[-2.5,0,0,1.9,'ld'],[1,0,0,1.75,'ld'],[10,-.3,3.0,1.6,'st'],[12.3,-.5,3.2,2.5,'ld'],[22.3,4.5,6.2,1.6,'st'],[25.1,4.6,6.4,2.5,'ld'],
    [21.8,-7.5,9.3,1.6,'st'],[22.2,-9.8,9.5,2.4,'ld'],[30.7,-14.1,12.2,1.65,'rp'],[33.6,-15.4,12.4,2.2,'ld']];
  const GZ=[[33.6,-15.4,12.4],[37.2,-17.4,14.4],[40.4,-19.2,16.8],[44,-21,20],[47.9,-23,23.5]];   // the gorge beyond the top: carved, not walkable
  const X=[],Z=[],A=[],B=[],H=[],HW=[],KD=[],SI=[];
  for(let i=0;i<K.length-1;i++){const p=K[i],q=K[i+1],n=Math.max(1,Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/.25));
    for(let j=(i?1:0);j<=n;j++){const t=j/n,a=p[0]+(q[0]-p[0])*t,b=p[1]+(q[1]-p[1])*t,[x,z]=W2(a,b);X.push(x);Z.push(z);A.push(a);B.push(b);H.push(p[2]+(q[2]-p[2])*t);
      // the width eases between stretches (no steps in the trail's edge)
      HW.push(p[3]+(q[3]-p[3])*Math.min(1,Math.max(0,(t-.15)/.7)));KD.push(q[4]);SI.push(i)}}
  const gz={X:[],Z:[],H:[]};for(let i=0;i<GZ.length-1;i++){const p=GZ[i],q=GZ[i+1],n=Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/.4);for(let j=1;j<=n;j++){const t=j/n,[x,z]=W2(p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t);gz.X.push(x);gz.Z.push(z);gz.H.push(p[2]+(q[2]-p[2])*t)}}
  const P={I,S,f:[fx,fz],l:[lx,lz],W2,L2,K,GZ,X,Z,A,B,H,HW,KD,SI,gz,N:X.length,bb:null,mask:null,h0:null};
  // the mountain's own frame: n up the strip (north, a little east), e across it (east)
  const gx=.2,gzz=-.98;P.NE=(x,z)=>{const dx=x-S.x,dz=z-S.z;return [dx*gx+dz*gzz,dx*-gzz+dz*gx]};
  // the nearest trail sample to (x, z): [index, distance beyond the edge (negative inside), distance to the centre line]
  P.near=(x,z)=>{let bi=0,bd=1e9;for(let i=0;i<P.N;i++){const d=(X[i]-x)*(X[i]-x)+(Z[i]-z)*(Z[i]-z);if(d<bd){bd=d;bi=i}}const c=Math.sqrt(bd);return [bi,c-HW[bi],c]};
  P.gnear=(x,z)=>{let bi=0,bd=1e9;for(let i=0;i<gz.X.length;i++){const d=(gz.X[i]-x)*(gz.X[i]-x)+(gz.Z[i]-z)*(gz.Z[i]-z);if(d<bd){bd=d;bi=i}}return [bi,Math.sqrt(bd)]};
  // the area that becomes mountain: a box in the local frame, inside the instance (to its last tile before the void border)
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;[[-4,-28],[-4,14],[54,-28],[54,14]].forEach(([a,b])=>{const [x,z]=W2(a,b);x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z)});
  P.bb=[Math.max(I.x0+2,Math.floor(x0)),Math.max(I.y0+2,Math.floor(z0)),Math.min(I.x0+I.w-2,Math.ceil(x1)),Math.min(I.y0+I.h-2,Math.ceil(z1))];
  P.inBox=(a,b)=>a>=-4&&a<=54&&b>=-28&&b<=14;
  return th165Plan.c=P}
// ---------------- 0045: the tiles ----------------
// mask per tile of the box: 0 untouched · 1 mountain (rock) · 2 trail. DW: the trail inside (negative), the distance to it outside.
function th165Map(m,bio,DW){try{const P=th165Plan(m,DW),[bx0,bz0,bx1,bz1]=P.bb,bw=bx1-bx0+1,mk=new Uint8Array(bw*(bz1-bz0+1)),dd=new Float32Array(bw*(bz1-bz0+1)),d0s=new Float32Array(bw*(bz1-bz0+1));P.mask=mk;P.dd=dd;P.dw0=d0s;P.bw=bw;
  for(let z=bz0;z<=bz1;z++)for(let x=bx0;x<=bx1;x++){const [a,b]=P.L2(x,z),k=(z-bz0)*bw+(x-bx0),K=z*W+x;dd[k]=99;if(!P.inBox(a,b)||!m[z])continue;
    const [i,d]=P.near(x,z);dd[k]=d;const d0=DW[K];d0s[k]=d0;
    if(d<=0&&a<40){m[z][x]=P.KD[i]=='ld'&&(x*7+z*13)%5==0?'a':'.';DW[K]=Math.min(d0,d);mk[k]=2;continue}
    if(d0<=-1.5)continue;   // the clearing (and any other walkable ground) stays as it was
    {const [n,e]=P.NE(x,z);if(e<-7||n<-3)continue}   // only the rock band east of the field: the field's own rim and the void beyond stay
    // DW 9.5 on the mountain: none of the zone's edge stones, back-row oaks or bank scenery grow on it (3260 dresses it itself)
    m[z][x]='R';DW[K]=9.5;mk[k]=1}
  }catch(e){console.warn('v165 trail map',e)}}
// ---------------- 0045: the heights ----------------
function th165Hs(P,x,z){const h0=P.h0,[n,e]=P.NE(x,z);// the mountain face: a slope up the strip, crags on its east side, a cliff over the field to its west, the high wall above the gorge
  const q=(fbm2(x*.11+31,z*.11+7,3)-.5);let h=h0+.44*Math.max(-2,n)+q*1.6;
  h+=(8*smt(21,27,e)+6*smt(26,34,e)+q*3)*smt(-2,6,n);
  h+=(5*smt(-1,-6,e)+q*2.5)*smt(5,14,n);
  // the stair's foot is a cleft: cliffs rise close on both sides of the first flight
  {const c=Math.abs(e-.65*Math.max(0,n)-.6);h+=(9*smt(3.6,8,c)+q*2)*(1-smt(8,14,n))*smt(-3,0,n)}
  h+=17*smt(31,47,n)+(fbm2(x*.07,z*.07+50,3)-.5)*6*smt(26,40,n);
  return h}
function th165Terrain(){try{const P=th165Plan();if(!P.mask)return;const [bx0,bz0,bx1,bz1]=P.bb,bw=P.bw,HI=(i,j)=>(j+HPD)*HW+i+HPD;
  if(P.h0==null){const S=P.S;P.h0=HF[HI(Math.round(S.x),Math.round(S.z))]}
  const out=[];for(let j=bz0-1;j<=bz1+1;j++)for(let i=bx0-1;i<=bx1+1;i++){const [a,b]=P.L2(i,j);if(!P.inBox(a,b))continue;
    const X=Math.min(bx1,Math.max(bx0,i)),Z=Math.min(bz1,Math.max(bz0,j)),mk=P.mask[(Z-bz0)*bw+(X-bx0)];
    const [ti,d,c]=P.near(i,j),th=P.h0+P.H[ti],hs=th165Hs(P,i,j);let h;
    // a ledge cut into the face: flat to ~.7 past the walkable edge, then up to the slope (a wall) or down to it (a drop)
    if(d<.7)h=th;else{const k=smt(.7,2.3,d);h=th+(hs-th)*k;if(hs<th)h=th+(hs-th)*smt(.7,1.6,d)}
    // the gorge: a notch cut up into the wall above the top of the trail
    const [gi,gd]=P.gnear(i,j);if(P.gz.H.length&&gd<5){const gh=P.h0+P.gz.H[gi];h=Math.min(h,gh+Math.max(0,gd-1.2)*2.6)}
    const H0=HF[HI(i,j)];
    // rock near the edges of the box falls back to the ground that was there (no wall where the mountain stops)
    if(mk===1){const [n,e]=P.NE(i,j),ed=Math.min(a+4,54-a,b+28,14-b,(e+7)*1.4,n+3),w=smt(0,8,ed);h=H0+(h-H0)*w}
    // untouched ground (the clearing, the field, the field's own rim) keeps its height
    if(mk===0)h=H0;
    out.push([HI(i,j),h])}
  out.forEach(([k,h])=>{HF[k]=h})}catch(e){console.warn('v165 trail terrain',e)}}
// ---------------- the dressing ----------------
// the trail at sample i: world spot, height, the across direction and which side drops away (+1 / -1 of that direction)
function th165At(P,i){i=Math.max(0,Math.min(P.N-1,i));const a=Math.max(0,i-2),b=Math.min(P.N-1,i+2);let dx=P.X[b]-P.X[a],dz=P.Z[b]-P.Z[a];const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;
  const nx=-dz,nz=dx,hw=P.HW[i],x=P.X[i],z=P.Z[i],y=P.h0+P.H[i],o=hw+2.6,hp=GH(x+nx*o,z+nz*o),hm=GH(x-nx*o,z-nz*o);return {x,z,y,dx,dz,nx,nz,hw,yaw:Math.atan2(dx,dz),down:hp<hm?1:-1,drop:Math.max(y-hp,y-hm)}}
// the stretches as index ranges [i0, i1] with their kind
function th165Runs(P){if(P.runs)return P.runs;const R=[];let s=0;for(let i=1;i<=P.N;i++){if(i==P.N||P.SI[i]!==P.SI[s]){R.push({i0:s,i1:i-1,k:P.KD[s],si:P.SI[s]});s=i}}return P.runs=R}
function th165Build(){const P=th165Plan(),S=P.S,g=new THREE.Group();g.name='PilgrimsStair';g.userData.psNo=1;scene.add(g);const R=dkRng(16501),C=TH165C;
  const st=[0x8a8270,0x7e7664,0x948a76,0x736c5c],stD=0x5e574a,moss=[0x4a6a34,0x3e5a2c],wood=0x5a4028,woodD=0x3a2818,rope=0x9a8a5a,iron=0x3a3c42;
  const pick=a=>a[Math.floor(R()*a.length)];
  // ---- stairs, cheek walls, paving, parapets, rope rails (one baked group) ----
  g.add(lgGroup('TH165|trail',q=>{const runs=th165Runs(P);
    runs.forEach((r,ri)=>{const A=th165At(P,r.i0),B=th165At(P,r.i1),dx=P.X[r.i1]-P.X[r.i0],dz=P.Z[r.i1]-P.Z[r.i0],L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,yaw=Math.atan2(ux,uz),nx=-uz,nz=ux;
      if(r.k=='st'){const dh=B.y-A.y,n=Math.max(4,Math.round(dh/.26)),dep=L/n;
        for(let k=0;k<n;k++){const t=(k+.5)/n,cx=A.x+dx*t,cz=A.z+dz*t,top=A.y+dh*(k+.82)/n,hw=A.hw+(B.hw-A.hw)*t;
          // each tread is two or three blocks, a little uneven; a worn darker nosing at the front
          const nb=hw>1.7?3:2,bw=(hw*2+.15)/nb;for(let j=0;j<nb;j++){const o=-hw-.07+bw*(j+.5),jx=(R()-.5)*.04,col=pick(st);
            q.p('','box','c',col,cx+nx*o+ux*jx,top-.42+(R()-.5)*.025,cz+nz*o+uz*jx,bw-.05,.84,dep*1.03,(R()-.5)*.02,yaw+(R()-.5)*.03,(R()-.5)*.02)}
          q.p('','box','c',stD,cx+ux*(dep*.47),top-.035,cz+uz*(dep*.47),hw*2+.1,.07,.06,0,yaw,0)}
        // cheek walls up both sides of the flight
        [-1,1].forEach(sd=>{const m=Math.max(2,Math.round(L/1.15));for(let k=0;k<m;k++){const t=(k+.5)/m,hw=A.hw+(B.hw-A.hw)*t,cx=A.x+dx*t+nx*sd*(hw+.2),cz=A.z+dz*t+nz*sd*(hw+.2),y=A.y+dh*t;
          q.p('','box','c',pick(st),cx,y+.05,cz,.42,.85,L/m*1.02,Math.atan2(-dh,L)*0,yaw,0).p('','box','c',stD,cx,y+.5,cz,.46,.08,L/m*1.02,0,yaw,0);
          if(R()<.35)q.p('','sph','c',pick(moss),cx+(R()-.5)*.2,y+.52,cz,.18,.06,.3,0,R()*3,0)}})}
      else{// landings and the ramp: irregular flagstones (the ramp has smaller cobbles)
        const cob=r.k=='rp',sp=cob?.62:.92;for(let i=r.i0;i<=r.i1;i+=Math.max(1,Math.round(sp/.25))){const T=th165At(P,i);for(let o=-T.hw+sp*.5;o<T.hw-sp*.3;o+=sp){const j=(R()-.5)*.18,x=T.x+T.nx*o+T.dx*j,z=T.z+T.nz*o+T.dz*j;
            q.p('','cyl','c',R()<.15?stD:pick(st),x,T.y+.02,z,sp*.52*(.85+R()*.25),.07,sp*.5*(.85+R()*.25),0,R()*3,0)}}}
      // the side that drops away: a parapet of fitted stones; rope rails on wooden posts along the flights and the ramp
      for(let i=r.i0;i<=r.i1;i+=4){const T=th165At(P,i);if(T.drop<1.1)continue;const o=T.hw+.28,x=T.x+T.nx*o*T.down,z=T.z+T.nz*o*T.down;
        q.p('','box','c',pick(st),x,T.y+.22,z,.4,.5,1.05,0,T.yaw+(R()-.5)*.08,0);if(R()<.75)q.p('','box','c',pick(st),x,T.y+.6,z,.34,.28,.9,0,T.yaw+(R()-.5)*.12,0)}
      if(r.k=='st'||r.k=='rp'){let last=null;for(let i=r.i0;i<=r.i1;i+=9){const T=th165At(P,i);if(T.drop<1.6){last=null;continue}const o=T.hw+.32,x=T.x+T.nx*o*T.down,z=T.z+T.nz*o*T.down,top=[x,T.y+1.25,z];
          q.L('','c',woodD,[x,T.y+.4,z],top,.06,.05,5);if(last){const m=[(last[0]+top[0])/2,(last[1]+top[1])/2-.18,(last[2]+top[2])/2];q.L('','c',rope,last,m,.025,.025,4).L('','c',rope,m,top,.025,.025,4)}last=top}}});
  },0));
  // ---- the foot: carved serpent pillars, a signpost, a hitching rail, trough and mounting block ----
  const F0=th165At(P,Math.round(3.5/.25)),yawF=F0.yaw;
  g.add(lgGroup('TH165|foot',q=>{[-1,1].forEach(sd=>{const x=F0.x+F0.nx*sd*2.55,z=F0.z+F0.nz*sd*2.55,y=GH(x,z);
      q.p('','box','c',st[1],x,y+.3,z,1.15,.6,1.15,0,yawF,0).p('','box','c',stD,x,y+.66,z,.95,.14,.95,0,yawF,0);
      q.p('','cyl','c',st[0],x,y+2.2,z,.36,3.2,.36,0,yawF,0).p('','box','c',st[2],x,y+3.9,z,.7,.22,.7,0,yawF,0);
      // the serpent coiling up the shaft to a rearing head that looks down the stair at the clearing
      let prev=null;for(let k=0;k<=26;k++){const t=k/26,a=t*Math.PI*2*2.2+sd,r0=.42,px=x+Math.cos(a)*r0,pz=z+Math.sin(a)*r0,py=y+.85+t*2.85,cur=[px,py,pz];if(prev)q.L('','c',k%3?0x4a5a3a:0x3a4a2e,prev,cur,.11-.04*t,.11-.04*t,5);prev=cur}
      const hx=x-F0.dx*.55,hz=z-F0.dz*.55;q.L('','c',0x3a4a2e,prev,[hx,y+4.35,hz],.08,.1,5).p('','cone','c',0x4a5a3a,hx-F0.dx*.18,y+4.4,hz-F0.dz*.18,.17,.42,.13,Math.PI/2,yawF+Math.PI,0);
      [-1,1].forEach(e=>q.p('','sph','g',0xd8ff60,hx-F0.dx*.12+F0.nx*e*.08,y+4.46,hz-F0.dz*.12+F0.nz*e*.08,.035));
      for(let k=0;k<4;k++)q.p('','sph','c',pick(moss),x+(R()-.5)*1.0,y+.62+R()*.1,z+(R()-.5)*1.0,.22,.07,.3,0,R()*3,0)});
    // hitching rail (with a saddle thrown over it), a water trough and a stone mounting block on the clearing side of the foot
    const hb=F0.x-F0.dx*5.2+F0.nx*3.6,hzb=F0.z-F0.dz*5.2+F0.nz*3.6,hy=GH(hb,hzb);
    [-1,1].forEach(e=>q.L('','c',woodD,[hb+F0.dx*e*1.3,hy,hzb+F0.dz*e*1.3],[hb+F0.dx*e*1.3,hy+1.15,hzb+F0.dz*e*1.3],.07,.06,5));
    q.L('','c',wood,[hb-F0.dx*1.5,hy+1.05,hzb-F0.dz*1.5],[hb+F0.dx*1.5,hy+1.05,hzb+F0.dz*1.5],.055,.055,5).p('','box','c',0x4a2a18,hb,hy+.98,hzb,.5,.28,.62,0,yawF,0).p('','box','c',0x6a3a20,hb,hy+1.16,hzb,.42,.08,.5,0,yawF,0);
    const tx=hb-F0.nx*1.1,tz=hzb-F0.nz*1.1,ty=GH(tx,tz);q.p('','box','c',woodD,tx,ty+.28,tz,1.6,.56,.6,0,yawF+Math.PI/2*0,0).p('','box','g',0x2a4a5a,tx,ty+.5,tz,1.45,.04,.46,0,yawF,0);
    const mx=F0.x-F0.dx*3.2-F0.nx*3.3,mz=F0.z-F0.dz*3.2-F0.nz*3.3,my=GH(mx,mz);q.p('','box','c',st[3],mx,my+.2,mz,1.0,.4,1.0,0,yawF+.3,0).p('','box','c',st[0],mx+F0.dx*.25,my+.55,mz+F0.dz*.25,.9,.3,.5,0,yawF+.3,0);
    // a pilgrims' cairn of little stones by the first step
    const cx=F0.x-F0.dx*2.2-F0.nx*2.6,cz=F0.z-F0.dz*2.2-F0.nz*2.6,cy=GH(cx,cz);for(let k=0;k<7;k++)q.p('','dod','c',pick(st),cx,cy+.12+k*.2,cz,.34-k*.035,.14,.3-k*.03,R(),R()*3,R())},0));
  // the signpost
  try{const sx=F0.x-F0.dx*1.6+F0.nx*2.9,sz=F0.z-F0.dz*1.6+F0.nz*2.9,sy=GH(sx,sz);g.add(lgGroup('TH165|post',q=>{q.L('','c',woodD,[sx,sy-.2,sz],[sx,sy+2.35,sz],.08,.07,6).p('','box','c',woodD,sx,sy+2.4,sz,.2,.1,.2)},0));
    sign(g,[{t:'⛰ The Pilgrim’s Stair',f:'700 34px'},{t:'to the Hilltops',f:'italic 28px'}],1.7,.5,'#2a1e14','#efe2c0',null,sx,sy+1.9,sz,yawF+Math.PI)}catch(err){console.warn('v165 sign',err)}
  // ---- the wayshrine on the first landing ----
  const L1=th165At(P,th165Runs(P)[2].i0+3);
  g.add(lgGroup('TH165|shrine',q=>{const T=L1,up=-T.down,x=T.x+T.nx*up*(T.hw+1.0),z=T.z+T.nz*up*(T.hw+1.0),y=T.y,yw=Math.atan2(-T.nx*up,-T.nz*up),fx=Math.sin(yw),fz=Math.cos(yw),rx=Math.cos(yw),rz=-Math.sin(yw);
    const at=(r,f)=>[x+rx*r+fx*f,z+rz*r+fz*f];
    q.p('','box','c',st[3],x,y+.18,z,2.2,.36,1.6,0,yw,0);let [bx,bz]=at(0,-.62);q.p('','box','c',st[1],bx,y+1.3,bz,2.0,2.2,.3,0,yw,0);
    [-1,1].forEach(s=>{const [px,pz]=at(s*.82,.42);q.p('','cyl','c',st[0],px,y+1.25,pz,.14,2.1,.14,0,yw,0).p('','box','c',st[2],px,y+2.33,pz,.3,.12,.3,0,yw,0);
      const [rx2,rz2]=at(s*.57,0);q.p('','box','c',0x4a4438,rx2,y+2.74,rz2,1.3,.12,1.9,0,yw,-s*.5)});
    {const [kx,kz]=at(0,0);q.p('','box','c',0x3a352c,kx,y+3.04,kz,.16,.14,1.95,0,yw,0)}
    [bx,bz]=at(0,-.2);q.p('','box','c',st[2],bx,y+.6,bz,.7,.46,.5,0,yw,0);
    // the pilgrim's statue: a hooded figure leaning on a staff, weathered
    q.p('','cone','c',0x8a8678,bx,y+1.4,bz,.32,1.15,.26,0,yw,0).p('','sph','c',0x7e7a6c,bx,y+2.05,bz,.17,.2,.17).p('','hood','c',0x8a8678,bx,y+2.1,bz,.22,.32,.24,0,yw+Math.PI,0);
    {const [sx2,sz2]=at(.3,.1);q.L('','c',0x6a665a,[sx2,y+.85,sz2],[sx2,y+2.3,sz2],.03,.03,4)}
    // offerings: a bowl of glowing coals, candles, a few flowers, a string of beads
    {const [ox,oz]=at(0,.45);q.p('','cyl','m',0x6a4a2a,ox,y+.42,oz,.22,.1,.22).p('','sph','g',0xff8a3a,ox,y+.48,oz,.15,.05,.15)}
    for(let k=0;k<5;k++){const [cx,cz]=at(-.75+k*.37,.6+(k%2)*.12);q.p('','cyl','c',0xe8dcc0,cx,y+.42+k%2*.03,cz,.04,.16+R()*.1,.04).p('','sph','g',0xffd080,cx,y+.55+k%2*.05,cz,.035,.06,.035)}
    for(let k=0;k<4;k++){const [fx2,fz2]=at(.6+R()*.4,.7);q.p('','sph','c',[0xc04050,0xe0c040,0x9060c0][k%3],fx2,y+.42,fz2,.06)}
    // a lantern on an iron bracket
    {const [lx,lz]=at(.95,.5);q.L('','m',iron,[lx,y+2.3,lz],[lx+fx*.3,y+2.3,lz+fz*.3],.02,.02,4).p('','box','m',iron,lx+fx*.3,y+1.98,lz+fz*.3,.16,.26,.16).p('','box','g',0xffc070,lx+fx*.3,y+1.98,lz+fz*.3,.11,.18,.11)}
    q.p('','box','c',woodD,...at(-1.6,.9).flatMap((v,i)=>i?[v]:[v,y+.35]),1.4,.12,.36,0,yw+.15,0)},0));
  // ---- the switchback: a cairn, prayer flags strung over the drop, a log bench ----
  const L2=th165At(P,th165Runs(P)[4].i0+Math.round((th165Runs(P)[4].i1-th165Runs(P)[4].i0)/2));
  g.add(lgGroup('TH165|turn',q=>{const T=L2,o=T.hw+.9,cx=T.x+T.nx*T.down*o+T.dx*1.2,cz=T.z+T.nz*T.down*o+T.dz*1.2,cy=GH(cx,cz)>T.y-1?GH(cx,cz):T.y;
    for(let k=0;k<9;k++)q.p('','dod','c',pick(st),cx+(R()-.5)*.1,T.y+.15+k*.21,cz+(R()-.5)*.1,.42-k*.035,.16,.38-k*.032,R(),R()*3,R());
    [-1,1].forEach(e=>{const px=T.x+T.nx*T.down*(T.hw+.55)+T.dx*e*2.6,pz=T.z+T.nz*T.down*(T.hw+.55)+T.dz*e*2.6;q.L('','c',woodD,[px,T.y,pz],[px,T.y+3.1,pz],.06,.045,5).p('','sph','m',0x8a6a3a,px,T.y+3.15,pz,.07)});
    const bx=T.x-T.nx*T.down*(T.hw+.1),bz=T.z-T.nz*T.down*(T.hw+.1);q.L('','c',wood,[bx-T.dx*.9,T.y+.42,bz-T.dz*.9],[bx+T.dx*.9,T.y+.42,bz+T.dz*.9],.16,.16,6).p('','box','c',woodD,bx-T.dx*.7,T.y+.18,bz-T.dz*.7,.3,.36,.3).p('','box','c',woodD,bx+T.dx*.7,T.y+.18,bz+T.dz*.7,.3,.36,.3)},0));
  {const T=L2,a=[T.x+T.nx*T.down*(T.hw+.55)-T.dx*2.6,T.y+3.0,T.z+T.nz*T.down*(T.hw+.55)-T.dz*2.6],b=[T.x+T.nx*T.down*(T.hw+.55)+T.dx*2.6,T.y+3.0,T.z+T.nz*T.down*(T.hw+.55)+T.dz*2.6];TH165.fl=th165Flags(g,a,b,11)}
  // ---- the Pilgrims' Gate: two towers, a broken arch with a fallen serpent keystone, braziers ----
  const rr=th165Runs(P),gi=rr[7].i0+5,G3=th165At(P,gi);TH165.gate={x:G3.x,z:G3.z,y:G3.y};
  g.add(lgGroup('TH165|gate',q=>{const T=G3,yw=T.yaw,o=T.hw+1.05,ash=(x,y,z,w,h,d,c)=>q.p('','box','c',c||pick(st),x,y,z,w,h,d,(R()-.5)*.03,yw+(R()-.5)*.05,(R()-.5)*.03);
    [-1,1].forEach(sd=>{const bx=T.x+T.nx*sd*o,bz=T.z+T.nz*sd*o,gy=Math.min(T.y,GH(bx,bz)),top=sd<0?6.3:5.7;
      for(let y=gy-.4,k=0;y<T.y+top;y+=.46,k++){const w=1.5-(k%2)*.06;ash(bx,y+.23,bz,w,.44,1.5-(k%3)*.05)}
      // a cap with merlons (the right tower's are broken off), moss in the joints
      ash(bx,T.y+top+.15,bz,1.75,.3,1.75,st[3]);for(let k=0;k<4;k++){if(sd>0&&k%2)continue;q.p('','box','c',st[2],bx+T.nx*(-.6+k*.4)+T.dx*.72,T.y+top+.5,bz+T.nz*(-.6+k*.4)+T.dz*.72,.24,sd>0?.22:.4,.2,0,yw,0)}
      for(let k=0;k<5;k++)q.p('','sph','c',pick(moss),bx+(R()-.5)*1.4,T.y+R()*top,bz+(R()-.5)*1.4,.16,.1,.22,0,R()*3,0);
      if(sd>0)for(let k=0;k<6;k++){const rx=bx+(R()-.5)*2.6,rz=bz+(R()-.5)*2.6;q.p('','box','c',pick(st),rx,GH(rx,rz)+.2,rz,.6,.4,.5,R()*.6,R()*3,R()*.6)}
      // torn banners down the tower faces, braziers on iron tripods before them
      const fx=bx-T.dx*.8,fz=bz-T.dz*.8;q.S('',sd<0?0x5a1a14:0x4a1a12,fx-T.nx*.3,T.y+top-.4,fz-T.nz*.3,.7,3.0,yw+Math.PI,0,2+sd).S('',0x3a2a1a,fx+T.nx*.3,T.y+top-.6,fz+T.nz*.3,.5,2.2,yw+Math.PI,0,4);
      const brx=T.x+T.nx*sd*(T.hw+.35)-T.dx*1.4,brz=T.z+T.nz*sd*(T.hw+.35)-T.dz*1.4;[0,1,2].forEach(k=>{const a=k*2.09;q.L('','m',iron,[brx+Math.cos(a)*.3,T.y,brz+Math.sin(a)*.3],[brx,T.y+.95,brz],.025,.025,4)});
      q.p('','cyl','m',iron,brx,T.y+1.0,brz,.3,.18,.3).p('','sph','g',0xff7a2a,brx,T.y+1.12,brz,.24,.1,.24);TH165.fire=(TH165.fire||[]).concat([[brx,T.y+1.25,brz]])});
    // the arch between the towers: eleven voussoirs (two have slipped, one is gone), a keystone with a coiled serpent
    const Rr=o-.75+.22,ay=T.y+3.55,NV=15;for(let k=0;k<=NV;k++){if(k==4)continue;const a=Math.PI-k/NV*Math.PI,px=T.x+T.nx*Math.cos(a)*Rr,pz=T.z+T.nz*Math.cos(a)*Rr,py=ay+Math.sin(a)*Rr,slip=k==10?-.1:k==11?-.05:0,key=k==Math.round(NV/2);
      q.p('','box','c',key?st[2]:pick(st),px,py+slip,pz,key?.58:.5,key?.86:.7,key?1.6:1.46,0,yw,Math.PI/2-a+(slip?.07:0))}
    // the wall over the arch (spandrels) up to a lintel course between the towers: the gate reads as one structure
    for(let y=ay-.1;y<T.y+5.5;y+=.46)for(let c=-(o-.75)+.25;c<o-.75-.2;c+=.5){if(Math.hypot(c,y+.23-ay)<Rr+.38)continue;ash(T.x+T.nx*c,y+.23,T.z+T.nz*c,.5,.44,1.36)}
    for(let c=-(o-.75)-.1;c<o-.75+.15;c+=.62)ash(T.x+T.nx*c,T.y+5.62,T.z+T.nz*c,.62,.3,1.55,st[3]);
    {const kx=T.x,kz=T.z,ky=ay+Rr+.1;for(let k=0;k<12;k++){const a=k/12*Math.PI*2*1.4,r0=.24-k*.012;q.p('','sph','c',0x4a5a3a,kx-T.dx*.8+T.nx*Math.cos(a)*r0,ky+Math.sin(a)*r0,kz-T.dz*.8+T.nz*Math.cos(a)*r0,.06)}
      [-1,1].forEach(e=>q.p('','sph','g',0xc8ff40,kx-T.dx*.82+T.nx*e*.06,ky+.06,kz-T.dz*.82+T.nz*e*.06,.03))}
    // the stone that fell out of the arch, cracked on the cobbles, and ivy down the left tower
    {const kx=T.x-T.dx*2.4+T.nx*.9,kz=T.z-T.dz*2.4+T.nz*.9;q.p('','box','c',st[1],kx,T.y+.24,kz,.5,.5,1.3,.25,yw+.7,.2)}
    for(let k=0;k<9;k++){const bx=T.x-T.nx*o-T.dx*.78,bz=T.z-T.nz*o-T.dz*.78;q.p('','sph','c',pick(moss),bx+T.nx*(R()-.5)*1.2,T.y+.5+k*.6,bz+T.nz*(R()-.5)*1.2,.28,.22,.1,0,yw,0)}},0));
  // ---- the gorge and the top: boulders along the walls, the warning stone, old bones and a broken saddle ----
  const TOP=th165At(P,P.N-6);TH165.top=TOP;
  g.add(lgGroup('TH165|gorge',q=>{const rg=th165Runs(P)[7];for(let i=rg.i0;i<=P.N-1;i+=3){const T=th165At(P,i);[-1,1].forEach(sd=>{if(R()<.35)return;const o=T.hw+.7+R()*1.2,x=T.x+T.nx*sd*o,z=T.z+T.nz*sd*o,y=Math.max(T.y,GH(x,z)-.4),s=.6+R()*1.1;
      q.p('','dod','c',pick(st),x,y+s*.4,z,s,s*.8,s*1.1,R()*3,R()*3,R()*3)})}
    const T=TOP,wx=T.x-T.nx*T.down*(T.hw+.3),wz=T.z-T.nz*T.down*(T.hw+.3);q.p('','box','c',0x6a645a,wx,T.y+1.3,wz,.95,2.6,.4,0,T.yaw+Math.PI/2,(R()-.5)*.12);
    for(let k=0;k<16;k++){const a=k/16*Math.PI*2*1.6,r0=.38-k*.016;q.p('','sph','c',0x3e4a30,wx-T.nx*T.down*.22+T.dx*Math.cos(a)*r0,T.y+1.5+Math.sin(a)*r0,wz-T.nz*T.down*.22+T.dz*Math.cos(a)*r0,.07)}
    [-1,1].forEach(e=>q.p('','sph','g',0xc8ff40,wx-T.nx*T.down*.24+T.dx*.12*e,T.y+2.25,wz-T.nz*T.down*.24+T.dz*.12*e,.04));
    for(let k=0;k<5;k++)q.p('','sph','c',0xd8ccb0,wx+(R()-.5)*1.2-T.nx*T.down*.6,T.y+.15+(k>2?.2:0),wz+(R()-.5)*1.2-T.nz*T.down*.6,.16,.14,.17);
    // a horse's ribcage and skull, and the broken saddle (what got caught on the mountain before)
    const bx=T.x+T.nx*T.down*(T.hw-.4)-T.dx*1.5,bz=T.z+T.nz*T.down*(T.hw-.4)-T.dz*1.5;for(let k=0;k<6;k++){const off=(k-2.5)*.22;q.p('','tor','c',0xd8ccb0,bx+T.dx*off,T.y+.3,bz+T.dz*off,.34,.05,.34,Math.PI/2,T.yaw,0)}
    q.L('','c',0xd0c4a8,[bx-T.dx*.8,T.y+.32,bz-T.dz*.8],[bx+T.dx*.8,T.y+.32,bz+T.dz*.8],.05,.05,5).p('','box','c',0xd8ccb0,bx+T.dx*1.3,T.y+.15,bz+T.dz*1.3,.24,.2,.5,0,T.yaw+.4,0);
    q.p('','box','c',0x4a2a18,bx-T.dx*1.6+T.nx*.5,T.y+.12,bz-T.dz*1.6+T.nz*.5,.5,.2,.6,.3,T.yaw+1.2,.2)},0));
  // ---- the mountain: pines on the ledges, scree, boulders ----
  g.add(lgGroup('TH165|slopes',q=>{const [x0,z0,x1,z1]=P.bb;let n=0,sc=0;const fr=[];
    for(let t=0;t<2600&&(n<70||sc<160);t++){const x=x0+R()*(x1-x0),z=z0+R()*(z1-z0),X=Math.round(x),Z=Math.round(z);if(P.mask[(Z-z0)*P.bw+(X-x0)]!==1)continue;
      const [,d]=P.near(x,z);if(d<1.4)continue;const [,gd]=P.gnear(x,z);if(gd<2.2)continue;const y=GH(x,z),sl=Math.max(Math.abs(GH(x+1,z)-GH(x-1,z)),Math.abs(GH(x,z+1)-GH(x,z-1)))/2;
      if(n<70&&sl<1.0&&d>2.4&&fr.every(f=>Math.hypot(f[0]-x,f[1]-z)>2.2)){const s=.7+R()*.75;fr.push([x,z]);n++;q.L('','c',0x4a3424,[x,y-.3,z],[x,y+1.0*s,z],.1*s,.07*s,5);
        for(let k=0;k<3;k++)q.p('','cone','c',k%2?0x2c4a30:0x34563a,x,y+(1.0+k*.75)*s,z,(1.05-k*.27)*s,1.35*s,(1.05-k*.27)*s,0,R()*3,0)}
      else if(sc<160&&sl<1.3){sc++;const foot=P.dw0[(Z-z0)*P.bw+(X-x0)]<3,s=foot?.6+R()*1.0:.18+R()*.5;q.p('','dod','c',R()<.2?stD:pick(st),x,y+s*.25,z,s,s*.6,s*.9,R()*3,R()*3,R()*3)}}
    // boulders along the foot of the cliffs where the mountain meets the clearing and the field
    let nb=0;for(let t=0;t<3000&&nb<46;t++){const x=x0+R()*(x1-x0),z=z0+R()*(z1-z0),X=Math.round(x),Z=Math.round(z),k=(Z-z0)*P.bw+(X-x0);if(P.mask[k]!==1||!(P.dw0[k]<2.2))continue;const [,d]=P.near(x,z);if(d<1.2)continue;
      nb++;const s=.7+R()*1.2;q.p('','dod','c',pick(st),x,GH(x,z)+s*.3,z,s,s*.75,s*1.05,R()*3,R()*3,R()*3);if(R()<.4)q.p('','sph','c',pick(moss),x,GH(x,z)+s*.75,z,s*.6,s*.15,s*.6,0,R()*3,0)}},0));
  // ---- the waterfall over the field's tarn and the great peak behind the mountain ----
  try{th165Falls(g,P)}catch(err){console.warn('v165 falls',err)}
  try{TH165.peak=th165Peak(P)}catch(err){console.warn('v165 peak',err)}
  // what stands on walkable ground blocks it (pillars, the rail, trough, block, cairn, the gate's towers)
  try{const blk=(x,z,r)=>{for(let j=Math.floor(z-r);j<=Math.ceil(z+r);j++)for(let i=Math.floor(x-r);i<=Math.ceil(x+r);i++)if(Math.hypot(i-x,j-z)<=r+.2)CBLK.add(j*W+i)};
    [-1,1].forEach(sd=>blk(F0.x+F0.nx*sd*2.55,F0.z+F0.nz*sd*2.55,.6));blk(F0.x-F0.dx*5.2+F0.nx*3.6,F0.z-F0.dz*5.2+F0.nz*3.6,.8)}catch(_){}
  TH165.g=g;return g}
var TH165C={};
// prayer flags: a sagging cord between a and b with n little cloth flags that flutter (their own small geometry, animated)
function th165Flags(g,a,b,n){const cols=[0xc03a2a,0xe0c040,0x3a7a4a,0x3a5aa8,0xe8e0d0],pos=[],col=[],F=[];const c=new THREE.Color();
  for(let i=0;i<n;i++){const t=(i+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t,y=a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*.45;F.push({x,y,z});c.setHex(cols[i%5]);for(let k=0;k<6;k++)col.push(c.r,c.g,c.b);for(let k=0;k<18;k++)pos.push(0)}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const m=new THREE.Mesh(G,new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.9,flatShading:true}));m.frustumCulled=false;g.add(m);
  const cord=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(...a),new THREE.Vector3((a[0]+b[0])/2,(a[1]+b[1])/2-.45,(a[2]+b[2])/2),new THREE.Vector3(...b)]),12,.012,3),new THREE.MeshStandardMaterial({color:0x9a8a5a,roughness:.9}));g.add(cord);
  const dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz)||1;return {m,F,ux:dx/L,uz:dz/L,w:L/n*.62}}
function th165FlagTick(t){const Fl=TH165.fl;if(!Fl||!Fl.m)return;const P=Fl.m.geometry.attributes.position,a=P.array;
  Fl.F.forEach((f,i)=>{const sw=Math.sin(t*3.1+i*.9)*.35+Math.sin(t*5.3+i*1.7)*.12,wx=-Fl.uz*sw,wz=Fl.ux*sw,h=.42,hw=Fl.w/2,o=i*18;
    const p=[[f.x-Fl.ux*hw,f.y,f.z-Fl.uz*hw],[f.x+Fl.ux*hw,f.y,f.z+Fl.uz*hw],[f.x+Fl.ux*hw+wx*h,f.y-h,f.z+Fl.uz*hw+wz*h],[f.x-Fl.ux*hw+wx*h,f.y-h,f.z-Fl.uz*hw+wz*h]];
    [0,1,2,0,2,3].forEach((v,k)=>{a[o+k*3]=p[v][0];a[o+k*3+1]=p[v][1];a[o+k*3+2]=p[v][2]})});P.needsUpdate=true;Fl.m.geometry.computeVertexNormals()}
// a streak texture for falling water (made once)
function th165WaterTex(){if(TH165C.wt)return TH165C.wt;const c=document.createElement('canvas');c.width=64;c.height=256;const x=c.getContext('2d');x.fillStyle='rgba(180,210,230,.55)';x.fillRect(0,0,64,256);
  for(let i=0;i<70;i++){const px=Math.random()*64,py=Math.random()*256,l=20+Math.random()*60;x.fillStyle='rgba(255,255,255,'+(.25+Math.random()*.5)+')';x.fillRect(px,py,1+Math.random()*2.5,l);x.fillRect(px,py-256,1+Math.random()*2.5,l)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return TH165C.wt=t}
// the waterfall: off the mountain's west cliff where it stands highest over the field, down onto the field and in a stream to the tarn
function th165Falls(g,P){const [x0,z0,x1,z1]=P.bb;let best=null;
  for(let z=z0+2;z<=z1-2;z++)for(let x=x0+2;x<=x1-2;x++){if(P.mask[(z-z0)*P.bw+(x-x0)]!==1)continue;const [n,e]=P.NE(x,z);if(e>-1||n<14||n>30)continue;
    const [,d]=P.near(x,z);if(d<3)continue;const top=GH(x,z);for(const [ox,oz] of [[-1,0],[0,1],[-1,1],[-1,-1]]){const fx=x+ox*3,fz=z+oz*3,F=Math.round(fx),Z=Math.round(fz);const t=MAP[Z]&&MAP[Z][F];if(!th165Walk(t))continue;const drop=top-GH(fx,fz);if(drop>5&&(!best||drop>best.drop))best={x,z,fx,fz,drop,top}}}
  if(!best)return;const B=best,dx=B.fx-B.x,dz=B.fz-B.z,L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,nx=-uz,nz=ux,w=.9,pos=[],uv=[],N=14;
  for(let k=0;k<=N;k++){const t=k/N,ex=t<.25?t*4*.9:.9+(t-.25)*L*.4,x=B.x+ux*ex,z=B.z+uz*ex,y=B.top+.15-(B.top-GH(B.fx,B.fz))*Math.pow(t,1.15);[-1,1].forEach(s=>{pos.push(x+nx*s*w*(1+t*.4),y,z+nz*s*w*(1+t*.4));uv.push(s<0?0:1,t*3)})}
  const idx=[];for(let k=0;k<N;k++){const a=k*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));G.setIndex(idx);G.computeVertexNormals();
  const tex=th165WaterTex().clone();tex.needsUpdate=true;const M=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false});const fall=new THREE.Mesh(G,M);fall.renderOrder=2;g.add(fall);
  // the stream: from the foot of the fall along the ground to the nearest water (or a short way out onto the field)
  let tx=B.fx+ux*2,tz=B.fz+uz*2,tw=null;for(let r=2;r<16&&!tw;r++)for(let a=0;a<16;a++){const qx=Math.round(B.fx+Math.cos(a/16*6.283)*r),qz=Math.round(B.fz+Math.sin(a/16*6.283)*r);if(MAP[qz]&&MAP[qz][qx]=='~'){tw=[qx,qz];break}}if(tw){tx=tw[0];tz=tw[1]}
  const sp=[],su=[],sN=Math.max(3,Math.round(Math.hypot(tx-B.fx,tz-B.fz)/.8));const sx=tx-B.fx,sz=tz-B.fz,sl=Math.hypot(sx,sz)||1,snx=-sz/sl,snz=sx/sl;
  for(let k=0;k<=sN;k++){const t=k/sN,x=B.fx+sx*t+snx*Math.sin(t*5)*.4,z=B.fz+sz*t+snz*Math.sin(t*5)*.4,y=GH(x,z)+.06,ww=.55+.15*Math.sin(t*9);[-1,1].forEach(s=>{sp.push(x+snx*s*ww,y,z+snz*s*ww);su.push(s<0?0:1,t*4)})}
  const si=[];for(let k=0;k<sN;k++){const a=k*2;si.push(a,a+1,a+2,a+1,a+3,a+2)}const SG=new THREE.BufferGeometry();SG.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));SG.setAttribute('uv',new THREE.Float32BufferAttribute(su,2));SG.setIndex(si);
  const t2=th165WaterTex().clone();t2.needsUpdate=true;const SM=new THREE.MeshBasicMaterial({map:t2,transparent:true,opacity:.7,depthWrite:false,color:0xa8c8d8});const stream=new THREE.Mesh(SG,SM);stream.renderOrder=2;g.add(stream);
  const pool=new THREE.Mesh(new THREE.CircleGeometry(1.5,14),new THREE.MeshStandardMaterial({color:0x4a7a90,roughness:.2,metalness:.1,transparent:true,opacity:.8}));pool.rotation.x=-Math.PI/2;pool.position.set(B.fx,GH(B.fx,B.fz)+.05,B.fz);g.add(pool);
  TH165.wf={fall,stream,tex,t2,foot:[B.fx,GH(B.fx,B.fz),B.fz],top:[B.x,B.top,B.z]}}
// the great peak beyond the instance's edge, snow on its shoulders, a belt of cloud round it (shown only in Mistmere)
function th165Peak(P){const S=P.S,I=P.I,g=new THREE.Group();g.name='PilgrimPeak';const cx=I.x0+I.w+34,cz=S.z-40,R0=46,Hh=92;
  const geo=new THREE.ConeGeometry(R0,Hh,18,10,true),pa=geo.attributes.position,col=[],c=new THREE.Color(),rn=dkRng(1650);
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),t=(y+Hh/2)/Hh,a=Math.atan2(z,x),n=1+.22*Math.sin(a*3+1.3)+.12*Math.sin(a*7+t*9)+.08*Math.sin(t*23+a*2);
    const k=t>.98?1:n*(1-.08*Math.sin(t*14));pa.setXYZ(i,x*k,y+(t<.98?Math.sin(a*5)*2.2*t:0),z*k);
    const snow=t>.62+.08*Math.sin(a*4)||(t>.45&&Math.sin(a*6+t*20)>.75);c.setHex(snow?0xe8eef2:t<.25?0x5a5e58:0x6e7070);if(!snow&&Math.sin(t*30+a)>.6)c.setHex(0x55585a);col.push(c.r,c.g,c.b)}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.95}));m.position.set(cx,P.h0+Hh/2-14,cz);g.add(m);
  // two shoulder peaks
  [[-30,22,.55],[26,-18,.48]].forEach(([ox,oz,s],j)=>{const q=m.clone();q.scale.set(s*1.1,s,s);q.position.set(cx+ox,P.h0+Hh*s/2-12,cz+oz);q.rotation.y=j*2.1;g.add(q)});
  // a ring of cloud: soft sprites drifting round the peak's waist
  const ct=(()=>{if(TH165C.ct)return TH165C.ct;const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d'),gr=x.createRadialGradient(64,64,8,64,64,62);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);return TH165C.ct=new THREE.CanvasTexture(cv)})();
  const cm=new THREE.SpriteMaterial({map:ct,color:0xdfe4e8,transparent:true,opacity:.55,depthWrite:false,fog:true});const cl=[];
  for(let i=0;i<14;i++){const s=new THREE.Sprite(cm);const a=i/14*Math.PI*2,r=R0*.72+rn()*10;s.position.set(cx+Math.cos(a)*r,P.h0+30+rn()*14,cz+Math.sin(a)*r);s.scale.set(40+rn()*20,14+rn()*6,1);s.userData.a=a;s.userData.r=r;g.add(s);cl.push(s)}
  g.userData.cl=cl;g.userData.c=[cx,cz];g.visible=false;scene.add(g);return g}
// ---------------- the gateway: the top of the trail is where the Ascent starts ----------------
try{const G=SP152.gates.ascent;if(G){G.build=s=>th165Build();G.where=()=>{const P=th165Plan(),T=th165At(P,P.N-10);return {x:T.x,z:T.z,ry:Math.atan2(-T.dx,-T.dz),ux:T.dx,uz:T.dz}};G.r=3.4}}catch(e){console.error('v165 gate',e)}
// the world tick: the flags, the water, the braziers, the peak (only in Mistmere)
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{const I=curIns(),on=!!I&&I.g===6,t=now/1000;
    if(TH165.peak)TH165.peak.visible=on;if(on&&TH165.g){th165FlagTick(t);const W=TH165.wf;if(W){W.tex.offset.y=-t*1.6;W.t2.offset.y=-t*.9;if(Math.random()<dt*10)burst(new THREE.Vector3(W.foot[0]+(Math.random()-.5)*1.2,W.foot[1]+.2,W.foot[2]+(Math.random()-.5)*1.2),0xe8f4ff,2,.6,1.2,.6)}
      if(TH165.fire&&Math.random()<dt*14){const q=TH165.fire[Math.random()<.5?0:1];if(q)burst(new THREE.Vector3(q[0]+(Math.random()-.5)*.25,q[1],q[2]+(Math.random()-.5)*.25),Math.random()<.5?0xff8a2a:0xffc040,1,.15,1.4,.5)}
      const p=TH165.peak;if(p&&p.userData.cl)p.userData.cl.forEach((s,i)=>{const a=s.userData.a+t*.006;s.position.x=p.userData.c[0]+Math.cos(a)*s.userData.r;s.position.z=p.userData.c[1]+Math.sin(a)*s.userData.r})}}catch(e){if(!TH165.err++)console.warn('v165 tick',e)}return r}}
// 1680: decorations stay off the trail and the gate (counted as placed: the seeded stream is unchanged)
function th165Keep(g,x,z){if(g!==6)return false;try{const P=th165Plan();if(!P.mask)return false;const [x0,z0,x1,z1]=P.bb,X=Math.round(x),Z=Math.round(z);if(X<x0-3||X>x1+3||Z<z0-3||Z>z1+3)return false;const [,d]=P.near(x,z);return d<1.6}catch(_){return false}}
