// ================= v152 Abeksi — the city's models =================
// Built once, the first time the hero is in the city (ab152Build), and hidden everywhere else. Static pieces are baked with lgGroup
// (merged by material: plaster/wood 'c', iron 'm', glow 'g'), one group per district for the buildings and one per prop kind; the
// moving pieces (flames, spits, laundry, rats, the fountain's water) are animated by ab152WorldTick.
//  * Buildings (plan B): sandstone houses with plaster bands, parapets, protruding roof beams, arched doors, shuttered or lit
//    windows, awnings, roof clutter and a carved serpent frieze; styles barracks / ruin / barn / hall / tower.
//  * The outer wall (with the breach, the gate and the drain) and a skyline of tall houses, domes and the Serpent Temple beyond it.
//  * Props (plan C): every kind in AB152_K; rats are instanced (pens, cages, the carrier's cage) and scurry on their own.
//  * Lights (plan L): flames + a pooled PointLight each + a soft light pool on the ground, so the lit areas the snakes see you in
//    are the lit areas you see.
//  * Streets: a cobble texture on the open ground; yards keep the packed earth.
var AB152C={plaster:[0xb89a6e,0xa8885c,0xc2a676,0x9a7a52,0xb08a60,0xa07a58],trim:0x6e5638,trimD:0x4e3c26,roof:0x7a6448,beam:0x3e2c1a,dark:0x120c08,
  glow:0xffb860,glowD:0xd88a3a,cloth:[0x2a6a64,0x8a2a24,0xb8862a,0x4a3a6a,0x2a4a6a],stone:0x8a8070,stoneD:0x5e564a,stoneL:0xa89c88,wood:0x5a4028,woodL:0x7a5a38,woodD:0x3a2818,
  iron:0x3a3a40,ironL:0x6a6a70,brass:0xb8923a,jade:0x3ac890,rat:0x5a4a40,ratD:0x3a2e28,ratP:0xc89a8a,meat:0x9a4a32,meatD:0x6a2a1a,fire:0xff7a28,fireL:0xffd080};
var AB152={S:null,err:0};
function ab152R(seed){let s=seed%2147483647;if(s<=0)s+=2147483646;return ()=>(s=s*16807%2147483647)/2147483647}
// plan (u, v) → world (x, z)
function ab152W(u,v){const I=sp152I('abeksi');return [I.x0+u,I.y0+v]}

// ---------------- buildings ----------------
// one face of a house: windows per storey, a door on the ground floor, a frieze; n = outward normal (unit, in x/z), t = along
function ab152Face(k,R,cx,cz,len,H,n,t,door,st){const C=AB152C,S=Math.max(1,Math.round(H/2.3)),y0=1.6;
  const at=(a,y,o)=>[cx+t[0]*a+n[0]*(o||0),y,cz+t[1]*a+n[1]*(o||0)],ry=Math.atan2(n[0],n[1]);
  // the carved frieze below the parapet: a band with a zig-zag serpent
  {const p=at(0,y0+H-.32,.02);k.p('','box','c',C.trim,p[0],p[1],p[2],len,.22,.06,0,ry,0);
    for(let a=-len/2+.4;a<len/2-.3;a+=.6){const q=at(a,y0+H-.32,.05);k.p('','box','c',C.trimD,q[0],q[1],q[2],.32,.05,.03,0,ry,(Math.floor(a/.6)%2?.6:-.6))}}
  for(let s=0;s<S;s++){const fy=y0+s*2.3;
    if(s>0){const p=at(0,fy-.06,.02);k.p('','box','c',C.trim,p[0],p[1],p[2],len,.1,.05,0,ry,0)}   // a plaster band between floors
    const nW=Math.max(1,Math.floor(len/2.6));for(let i=0;i<nW;i++){const a=-len/2+(i+.5)*len/nW;if(s==0&&door&&Math.abs(a)<1.3)continue;
      const lit=R()<(st=='barracks'?.35:.28),p=at(a,fy+1.25,.03);
      k.p('',lit?'box':'box',lit?'g':'c',lit?(R()<.5?C.glow:C.glowD):C.dark,p[0],p[1],p[2],.5,.7,.04,0,ry,0);
      const q=at(a,fy+.86,.07);k.p('','box','c',C.trimD,q[0],q[1],q[2],.66,.07,.1,0,ry,0);                  // sill
      if(!lit&&R()<.5){[-1,1].forEach(sd=>{const w=at(a+sd*.42,fy+1.25,.05);k.p('','box','c',C.wood,w[0],w[1],w[2],.26,.72,.04,0,ry+sd*.35,0)})}  // open shutters
      if(R()<.12){const b=at(a,fy+.95,.18);k.p('','cyl','c',0x7a4a2a,b[0],b[1],b[2],.12,.16,.12);k.p('','sph','c',0x3a5a2a,b[0],b[1]+.14,b[2],.14,.1,.14)}}}   // a pot on the sill
  if(door){const p=at(0,y0+.85,.02);k.p('','box','c',C.dark,p[0],p[1],p[2],1.0,1.7,.05,0,ry,0);
    const a=at(0,y0+1.7,.0);k.p('','cyl','c',C.dark,a[0],a[1],a[2],.5,.05,.5,Math.PI/2,ry,0);
    const f=at(0,y0+1.72,.04);k.p('','cyl','c',C.trim,f[0],f[1],f[2],.62,.06,.62,Math.PI/2,ry,0);
    if(R()<.5){const c=at(0,y0+1.0,.08);k.S('',C.cloth[(R()*5)|0],c[0]-n[0]*.02,y0+1.68,c[2],.95,1.55,ry,0,(R()*9)|0)}             // a door curtain
    if(R()<.35){const s=at(.9,y0+.3,.45);k.p('','box','c',C.stoneD,s[0],s[1],s[2],.55,.3,.4,0,ry,0)}}}                     // a step / bench
// a building from the plan: B = [u0,v0,u1,v1,storeys,style]
function ab152House(k,Bk,R,I){const C=AB152C,[u0,v0,u1,v1,s,st]=Bk,x0=I.x0+u0-.5,z0=I.y0+v0-.5,x1=I.x0+u1-.5,z1=I.y0+v1-.5,cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0,y0=1.6;
  const H=st=='tower'?2.3*s+.8:st=='hall'?3.4:st=='barn'?3.0:2.3*s,col=C.plaster[(R()*C.plaster.length)|0];
  if(st=='ruin'){ // a collapsed guardhouse: broken walls of uneven height, fallen blocks, a burnt beam
    [[0,-1],[0,1],[-1,0],[1,0]].forEach(([a,b],i)=>{const L=a?d:w;for(let j=0;j<5;j++){const t=(j+.5)/5-.5,h=.6+R()*2.4;if(R()<.25)continue;
      const x=cx+(a?a*w/2:t*L),z=cz+(b?b*d/2:t*L);k.p('','box','c',lgCol(col,0x6a5a48,.3),x,y0+h/2,z,a?.5:L/5+.05,h,a?L/5+.05:.5)}});
    for(let j=0;j<7;j++)k.p('','dod','c',C.stoneD,cx+(R()-.5)*w*.8,y0+.2,cz+(R()-.5)*d*.8,.35+R()*.3,.25,.35+R()*.3,R(),R(),R());
    k.L('','c',0x1e1610,[cx-w*.3,y0+.2,cz-d*.2],[cx+w*.25,y0+1.6,cz+d*.1],.12,.1,5);return}
  const bw=st=='barn'?C.wood:col;
  k.p('','box','c',bw,cx,y0+H/2,cz,w,H,d);                                                              // the body
  if(st=='barn'){ // planks, a pitched roof, a big door on the yard side
    for(let i=0;i<Math.floor(w/.5);i++)k.p('','box','c',i%2?C.woodD:C.woodL,x0+.25+i*.5,y0+H/2,z1+.02,.04,H,.02);
    const rs=Math.atan2(1.4,d/2);[-1,1].forEach(sd=>k.p('','box','c',C.roof,cx,y0+H+.7,cz+sd*d/4,w+.4,.12,Math.hypot(d/2,1.4)+.2,-sd*rs,0,0));
    k.p('','box','c',C.dark,cx,y0+1.2,z1+.03,2.4,2.4,.04);k.p('','box','c',C.woodD,cx,y0+1.2,z1+.06,.1,2.4,.04);
    [-1,1].forEach(sd=>k.p('','box','c',C.woodD,cx+sd*1.25,y0+1.2,z1+.06,.1,2.5,.06));return}
  // parapet with crenels, the flat roof, roof beams sticking out under it
  k.p('','box','c',lgCol(col,0x000000,.12),cx,y0+H+.05,cz,w-.3,.1,d-.3);
  [[w,0,0,-d/2],[w,0,0,d/2],[d,1,-w/2,0],[d,1,w/2,0]].forEach(([L,rot,ox,oz])=>{const n=Math.round(L/.8);for(let i=0;i<n;i++){if(st!='barracks'&&st!='tower'&&i%2)continue;const a=-L/2+(i+.5)*L/n;
    k.p('','box','c',col,cx+(rot?ox:a),y0+H+.25,cz+(rot?a:oz),rot?.3:L/n*(st=='barracks'||st=='tower'?.55:1.02),.5,rot?L/n*(st=='barracks'||st=='tower'?.55:1.02):.3)}});
  for(let a=-w/2+.5;a<w/2;a+=1.1)[-1,1].forEach(sd=>k.p('','box','c',C.beam,cx+a,y0+H-.6,cz+sd*(d/2+.18),.12,.12,.4));
  // the faces (doors on the long sides)
  const fz=(sd)=>ab152Face(k,R,cx,cz+sd*d/2,w,H,[0,sd],[1,0],w>=3&&R()<.8,st),fx=(sd)=>ab152Face(k,R,cx+sd*w/2,cz,d,H,[sd,0],[0,-sd],d>=6&&R()<.4,st);
  fz(-1);fz(1);fx(-1);fx(1);
  // awnings, roof clutter (water jars, a ladder, a little roof hut), a hanging serpent banner on big buildings
  if(R()<.45&&st=='house'){const sd=R()<.5?-1:1,aw=Math.min(3,w-.8),c=C.cloth[(R()*5)|0];k.p('','box','c',c,cx+(R()-.5)*(w-aw),y0+2.05,cz+sd*(d/2+.55),aw,.04,1.1,sd*.35,0,0);
    for(let i=0;i<4;i++)k.p('','box','c',i%2?c:lgCol(c,0xffffff,.35),cx-aw/2+(i+.5)*aw/4,y0+2.05,cz+sd*(d/2+.56),aw/4*.98,.05,1.05,sd*.35,0,0)}
  for(let i=0;i<Math.floor(w*d/14);i++){const x=cx+(R()-.5)*(w-1.2),z=cz+(R()-.5)*(d-1.2);const r=R();
    if(r<.4){k.p('','cyl','c',0x8a5a32,x,y0+H+.35,z,.22,.5,.22);k.p('','cyl','c',0x6a4222,x,y0+H+.62,z,.12,.06,.12)}
    else if(r<.55){k.p('','box','c',col,x,y0+H+.55,z,1.2,1.0,1.1);k.p('','box','c',C.dark,x,y0+H+.45,z+.56,.4,.7,.02)}
    else if(r<.7)k.S('',C.cloth[(R()*5)|0],x,y0+H+1.0,z,.9,.8,R()*6,0,(R()*9)|0)}
  if(st=='barracks'||st=='tower'){for(let a=-w/2+2;a<w/2-1;a+=5){const x=cx+a,z=cz+d/2+.06;k.S('',C.cloth[0],x,y0+H-.1,z,.8,2.2,0,0,(a*3)|0);
      k.p('','box','m',C.brass,x,y0+H-.95,z+.04,.4,.4,.02,0,0,Math.PI/4);k.p('','box','c',C.jade,x,y0+H-.95,z+.05,.24,.24,.02,0,0,Math.PI/4)}}
  if(st=='hall'){ // the kitchen's back wall: smoke hoods over the hearths and a row of hanging pots
    [52,76].forEach(u=>{const x=I.x0+u+7.5,z=z1;k.p('','box','c',C.stoneD,x,y0+H-.2,z+.9,14,.5,1.9);k.p('','box','c',0x2a2420,x,y0+H+1.2,z+.4,3,2.4,1.2)});
    for(let u=44;u<110;u+=3){const x=I.x0+u,z=z1+.12;k.p('','cyl','m',C.iron,x,y0+2.2,z,.16,.2,.16);k.L('','m',C.iron,[x,y0+2.3,z],[x,y0+2.7,z],.01,.01,3)}}}
// the outer wall round the city: a tall crenellated wall, towers at the corners and along it, the breach, the gate, the drain
function ab152Walls(k,P,I){const C=AB152C,[a0,b0,a1,b1]=P.IN,y0=1.6,H=5.2,X=I.x0,Y=I.y0,R=ab152R(1527);
  const seg=(x0,z0,x1,z1,th)=>{const L=Math.hypot(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2,ry=Math.atan2(x1-x0,z1-z0);
    k.p('','box','c',C.stone,cx,y0+H/2,cz,th,H,L,0,ry,0);const n=Math.floor(L/1.1);
    for(let i=0;i<n;i+=2){const t=(i+.5)/n-.5;k.p('','box','c',C.stoneL,cx+Math.sin(ry)*t*L,y0+H+.3,cz+Math.cos(ry)*t*L,th+.1,.6,L/n,0,ry,0)}
    for(let t=-L/2+1;t<L/2;t+=2.2+R()*2)k.p('','box','c',C.stoneD,cx+Math.sin(ry)*t,y0+.4+R()*H*.8,cz+Math.cos(ry)*t,th+.06,.18,.5+R()*.8,0,ry,0)};   // patched blocks
  const xA=X+a0-1.2,xB=X+a1+1.2,zA=Y+b0-1.2,zB=Y+b1+1.2;
  // north wall with the breach at u 11..17
  seg(xA,zA,X+10.5,zA,1.6);seg(X+17.5,zA,xB,zA,1.6);
  for(let j=0;j<9;j++)k.p('','dod','c',j%2?C.stone:C.stoneD,X+11+R()*6,y0+.3+R()*.8,zA+(R()-.3)*2.4,.5+R()*.5,.4+R()*.3,.5+R()*.4,R()*3,R()*3,0);
  [[10.5,0],[17.5,0]].forEach(([u])=>k.p('','box','c',C.stoneD,X+u,y0+H*.55,zA,1.0,H*1.1,1.8));
  // south wall: the gatehouse (plan B) stands in it; the drain at u 128..130
  seg(xA,zB,X+66,zB,1.6);seg(X+84,zB,xB,zB,1.6);
  k.p('','box','c',C.dark,X+129,y0+.55,zB-.82,2.0,1.1,.05);for(let i=0;i<6;i++)k.p('','box','m',C.iron,X+128.2+i*.32,y0+.55,zB-.86,.05,1.1,.05);k.p('','box','m',C.iron,X+129,y0+.85,zB-.86,2.0,.06,.06);
  seg(xA,zA,xA,zB,1.6);seg(xB,zA,xB,zB,1.6);
  [[xA,zA],[xB,zA],[xA,zB],[xB,zB],[xA,(zA+zB)/2],[xB,(zA+zB)/2],[(xA+xB)/2,zA]].forEach(([x,z])=>{k.p('','box','c',C.stoneL,x,y0+(H+1.6)/2,z,3,H+1.6,3);
    for(let i=0;i<4;i++){const a=i*Math.PI/2;k.p('','box','c',C.stone,x+Math.sin(a)*1.3,y0+H+1.9,z+Math.cos(a)*1.3,1.0,.7,.5,0,a,0)}})}
// beyond the wall: tall houses, domes, towers and the Serpent Temple (a stepped pyramid with a great coiled serpent on top)
function ab152Skyline(k,I){const C=AB152C,R=ab152R(9157),y0=1.6,X=I.x0,Y=I.y0,W0=I.w,H0=I.h;
  const blk=(x,z,w,d,h,col)=>{k.p('','box','c',col,x,y0+h/2,z,w,h,d);for(let i=0;i<Math.floor(h/2.3);i++)if(R()<.5)k.p('','box','g',R()<.5?C.glow:C.glowD,x+(R()-.5)*w*.6,y0+1.3+i*2.3,z+d/2+.02,.45,.6,.03)};
  for(let i=0;i<70;i++){const side=i%4;let x,z;if(side==0){x=X+4+R()*(W0-8);z=Y+R()*3}else if(side==1){x=X+4+R()*(W0-8);z=Y+H0-R()*3}else if(side==2){x=X+R()*4;z=Y+6+R()*(H0-12)}else{x=X+W0-R()*4;z=Y+6+R()*(H0-12)}
    const h=6+R()*7,col=C.plaster[(R()*6)|0];blk(x,z,2.5+R()*3,2.5+R()*3,h,lgCol(col,0x2a2020,.25));
    if(R()<.25){k.p('','hem','c',lgCol(col,0x3a5a5a,.3),x,y0+h,z,1.4,1.2,1.4);k.p('','cone','m',C.brass,x,y0+h+1.3,z,.12,.6,.12)}}
  // the temple north-east, outside the wall corner
  const tx=X+W0-3,tz=Y+2;for(let i=0;i<5;i++){const s=12-i*2.2;k.p('','box','c',lgCol(C.stoneL,0x2a2018,i*.08),tx,y0+3+i*2.6,tz,s,2.6,s)}
  k.p('','tor','c',C.jade,tx,y0+17.2,tz,2.4,.8,2.4);k.p('','tor','c',lgCol(C.jade,0,.2),tx,y0+18,tz,1.8,.8,1.8);k.L('','c',C.jade,[tx,y0+18,tz],[tx+.3,y0+21.5,tz+.6],.6,.4,7);
  k.p('','sph','c',C.jade,tx+.35,y0+21.8,tz+.9,.75,.55,1.1);k.p('','box','g',0xff4020,tx+.1,y0+21.9,tz+1.8,.12,.08,.06);k.p('','box','g',0xff4020,tx+.6,y0+21.9,tz+1.8,.12,.08,.06);
  k.p('','hood','c',lgCol(C.jade,0,.25),tx+.3,y0+21.3,tz+.5,1.9,2.2,1,0,0,0)}

// ---------------- props (plan C), each kind baked once, origin on the ground, +z = front ----------------
function ab152Kit(kind){const C=AB152C;
  switch(kind){
  case 'crate':return mqm143Crate(0);case 'barrel':return mqm143Barrel();
  case 'cstack':return lgGroup('AB152|cstack',k=>{[[0,0,0,.72],[.05,.72,.04,.6]].forEach(([x,y,z,s],i)=>{k.p('','box','c',i?C.woodL:C.wood,x,y+s/2,z,s,s,s,0,i*.3,0);k.p('','box','m',C.ironL,x,y+s/2,z,s*1.02,.04,s*1.02,0,i*.3,0)});k.p('','box','c',0xc8b890,.04,1.34,.04,.4,.04,.3)},0);
  case 'barrels':return lgGroup('AB152|barrels',k=>{[-.38,.38].forEach((x,i)=>{k.p('','cyl','c',C.wood,x,.45,0,.32,.9,.32);[.12,.78].forEach(y=>k.p('','ring','m',C.ironL,x,y,0,.33,.4,.33))});k.p('','cyl','c',C.wood,0,1.08,-.05,.28,.7,.28,Math.PI/2,.3,0)},0);
  case 'cart':return lgGroup('AB152|cart',k=>{k.p('','box','c',C.woodL,0,.65,0,2.4,.1,1.4);[-1,1].forEach(s=>{k.p('','box','c',C.wood,0,.85,s*.68,2.4,.35,.06);k.p('','cyl','c',C.woodD,-.4,.42,s*.78,.42,.08,.42,Math.PI/2,0,0);k.p('','cyl','m',C.iron,-.4,.42,s*.81,.1,.06,.1,Math.PI/2,0,0)});
      k.L('','c',C.wood,[1.2,.7,-.4],[2.2,.5,-.45],.04,.04,4);k.L('','c',C.wood,[1.2,.7,.4],[2.2,.5,.45],.04,.04,4);
      for(let i=0;i<5;i++)k.p('','sph','c',[0xc8b480,0xa8905a][i%2],-.8+i*.4,.95,(i%2-.5)*.4,.3,.28,.3);k.p('','cyl','c',0x9a5a32,.5,1.05,.2,.18,.36,.18);k.p('','cyl','c',0x8a4a2a,.85,1.0,-.25,.16,.3,.16)},0);
  case 'wagon':return lgGroup('AB152|wagon',k=>{k.p('','box','c',C.wood,0,.8,0,3.6,.12,1.6);[-1,1].forEach(s=>[-1.1,1.1].forEach(x=>{k.p('','cyl','c',C.woodD,x,.55,s*.88,.55,.1,.55,Math.PI/2,0,0)}));
      for(let i=0;i<5;i++){const x=-1.5+i*.75;k.p('','tor','c',C.woodD,x,1.5,0,.85,.05,.85,0,0,Math.PI/2)}k.p('','cyl','c',0xc8b89a,0,1.45,0,.86,3.4,.86,0,0,Math.PI/2);k.p('','box','c',0xb8a888,0,.95,0,3.4,.3,1.6)},0);
  case 'stall':return lgGroup('AB152|stall',k=>{k.p('','box','c',C.woodL,0,.5,0,3.4,.9,1.1);k.p('','box','c',C.woodD,0,.97,0,3.6,.06,1.25);
      [-1.7,1.7].forEach(x=>[-.55,.55].forEach(z=>k.p('','box','c',C.woodD,x,1.3,z,.1,2.6,.1)));
      // goods: pottery, cloth bolts, baskets of eggs, a cage with rats, hanging dried rats
      for(let i=0;i<6;i++){const x=-1.4+i*.55,r=i%3;if(r==0){k.p('','cyl','c',0x9a5a32,x,1.18,.1,.16,.38,.16);k.p('','cyl','c',0x7a4222,x,1.4,.1,.09,.06,.09)}
        else if(r==1){k.p('','cyl','c',C.cloth[i%5],x,1.1,-.1,.14,.5,.14,0,0,Math.PI/2)}else{k.p('','cyl','c',0x8a6a3a,x,1.08,.05,.22,.16,.22);for(let j=0;j<4;j++)k.p('','sph','c',0xe8e0c8,x+(j%2-.5)*.12,1.18,.05+(j>1?.08:-.08),.06,.075,.06)}}
      for(let i=0;i<4;i++){const x=-1.2+i*.8;k.L('','c',0x8a7a5a,[x,2.45,.55],[x,2.1,.55],.006,.006,3);k.p('','sph','c',C.meatD,x,2.0,.55,.07,.13,.06);k.L('','c',C.meatD,[x,1.88,.55],[x+.02,1.7,.56],.012,.004,3)}},0);
  case 'awning':return lgGroup('AB152|awning',k=>{const c=C.cloth[1],c2=C.cloth[2];for(let i=0;i<6;i++)k.p('','box','c',i%2?c:c2,-1.75+(i+.5)*3.5/6,2.62,0,3.5/6*.99,.04,2.0,.12,0,0);k.p('','box','c',C.woodD,0,2.6,1.0,3.5,.05,.05,.12,0,0)},.1);
  case 'rubble':return lgGroup('AB152|rubble',k=>{const R=ab152R(77);for(let i=0;i<9;i++)k.p('','dod','c',[C.stone,C.stoneD,C.stoneL][i%3],(R()-.5)*1.6,.2+R()*.5,(R()-.5)*1.6,.35+R()*.35,.3+R()*.3,.35+R()*.3,R()*3,R()*3,R()*3);
      k.p('','box','c',C.stoneL,.2,.7,-.2,1.2,.3,.5,.2,.6,.15);k.L('','c',C.woodD,[-.8,.1,.5],[.7,.9,-.4],.08,.07,5)},0);
  case 'hay':return lgGroup('AB152|hay',k=>{k.p('','box','c',0xb8a058,0,.42,0,1.8,.84,.9);[-.5,.5].forEach(x=>k.p('','box','c',0x6a5a2a,x,.42,0,.04,.86,.92));k.p('','box','c',0xc8b068,0,.86,0,1.7,.04,.8)},0);
  case 'pillar':return lgGroup('AB152|pillar',k=>{k.p('','box','c',C.stoneL,0,.2,0,.9,.4,.9);k.p('','cyl','c',C.stone,0,2.0,0,.34,3.3,.34);k.p('','box','c',C.stoneL,0,3.75,0,.9,.3,.9);
      k.L('','c',C.jade,[0,3.5,.32],[0,1.2,.35],.07,.05,5);k.p('','sph','c',C.jade,0,3.55,.4,.11,.08,.14)},0);
  case 'fountain':return lgGroup('AB152|fountain',k=>{k.p('','cyl','c',C.stoneL,0,.35,0,2.4,.7,2.4);k.p('','cyl','c',0x2a4a5a,0,.66,0,2.15,.04,2.15);k.p('','cyl','c',C.stone,0,1.3,0,.6,1.9,.6);
      // a cobra rearing from a coil, its hood spread, water from its mouth (the water moves: ab152WorldTick)
      k.p('','tor','c',C.jade,0,2.3,0,.8,.4,.8);k.p('','tor','c',C.jade,0,2.65,0,.55,.4,.55);k.L('','c',C.jade,[0,2.7,0],[0,4.4,.25],.28,.2,7);k.p('','hood','c',lgCol(C.jade,0,.2),0,4.1,.05,1.1,1.4,.6);
      k.p('','sph','c',C.jade,0,4.55,.45,.26,.2,.36);k.p('','box','g',0xff5030,-.1,4.62,.74,.05,.04,.03);k.p('','box','g',0xff5030,.1,4.62,.74,.05,.04,.03)},0);
  case 'table':return lgGroup('AB152|table',k=>{k.p('','box','c',C.woodL,0,.74,0,2.8,.08,.9);[-1.25,1.25].forEach(x=>k.p('','box','c',C.woodD,x,.36,0,.12,.72,.75));
      for(let i=0;i<4;i++){const x=-1.05+i*.7;[-1,1].forEach(s=>{k.p('','cyl','c',0x8a6a4a,x,.8,s*.25,.18,.03,.18);k.p('','sph','c',C.meat,x,.86,s*.25,.12,.06,.07);k.L('','c',C.meatD,[x+.1,.86,s*.25],[x+.22,.83,s*.27],.015,.004,3)});
        k.p('','cyl','c',0x6a4a2a,x+.3,.84,0,.05,.12,.05)}k.p('','cyl','c',0x9a5a32,0,.92,0,.14,.3,.14)},0);
  case 'trough':return lgGroup('AB152|trough',k=>{k.p('','box','c',C.wood,0,.25,0,1.8,.5,.6);k.p('','box','c',0x8a7a4a,0,.48,0,1.6,.04,.45)},0);
  case 'hearth':return ab152Hearth();
  case 'cauldron':return lgGroup('AB152|cauldron',k=>{for(let i=0;i<3;i++){const a=i/3*Math.PI*2;k.L('','m',C.iron,[Math.sin(a)*.8,0,Math.cos(a)*.8],[0,1.6,0],.03,.03,4)}
      k.p('','sph','m',C.iron,0,.62,0,.62,.5,.62);k.p('','ring','m',C.ironL,0,.95,0,.6,.4,.6);k.p('','cyl','c',0x6a4a22,0,.98,0,.52,.02,.52);for(let i=0;i<5;i++)k.p('','dod','g',0xff6a20,(Math.random()-.5)*.7,.1,(Math.random()-.5)*.7,.12)},0);
  case 'block':return lgGroup('AB152|block',k=>{k.p('','cyl','c',C.woodL,0,.4,0,.55,.8,.55);k.p('','cyl','c',0x6a2a1a,0,.81,0,.5,.02,.5);
      for(let i=0;i<3;i++){k.p('','sph','c',C.ratP,(i-1)*.25,.88,0,.08,.06,.16,0,i,0);k.L('','c',C.ratP,[(i-1)*.25,.86,-.14],[(i-1)*.25+.05,.83,-.34],.012,.004,3)}
      k.p('','box','m',C.ironL,.3,.95,.2,.2,.02,.12,0,.4,.5);k.p('','box','c',C.woodD,.42,1.0,.28,.03,.03,.14,0,.4,.5)},0);
  case 'laundry':return ab152Laundry();
  case 'planter':return lgGroup('AB152|planter',k=>{k.p('','cyl','c',0x8a4a2a,0,.3,0,.32,.6,.28);for(let i=0;i<6;i++)k.L('','c',0x3a6a2a,[0,.55,0],[Math.sin(i)*.4,1.1+(i%2)*.2,Math.cos(i)*.4],.05,.01,3)},.25);
  case 'statue':return lgGroup('AB152|statue',k=>{k.p('','box','c',C.stoneL,0,.5,0,1.6,1,1.6);k.L('','c',C.jade,[0,1,0],[0,3.2,.2],.32,.22,7);k.p('','hood','c',C.jade,0,2.9,.05,.9,1.1,.5);k.p('','sph','c',C.jade,0,3.3,.35,.22,.18,.3)},0);
  case 'sacks':return lgGroup('AB152|sacks',k=>{for(let i=0;i<4;i++)k.p('','sph','c',[0xc8b480,0xa8905a,0xb8a070][i%3],(i%2-.5)*.7,.3+(i>1?.42:0),(i>1?0:(i-.5)*.1),.38,.33,.32)},0);
  case 'hutch':return lgGroup('AB152|hutch',k=>{for(let r=0;r<2;r++)for(let i=0;i<3;i++){const x=-1+i,y=.45+r*.7;k.p('','box','c',C.wood,x,y,0,.92,.62,.7);k.p('','box','c',C.dark,x,y,.355,.7,.45,.02);
      for(let j=0;j<4;j++)k.p('','box','m',C.ironL,x-.27+j*.18,y,.37,.02,.45,.02)}k.p('','box','c',C.woodD,0,1.48,0,3.1,.08,.8)},0);
  case 'cage':return lgGroup('AB152|cage',k=>{k.p('','box','c',C.woodD,0,.05,0,.7,.1,.6);k.p('','box','c',C.woodD,0,.7,0,.72,.06,.62);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.p('','box','m',C.ironL,Math.sin(a)*.32,.38,Math.cos(a)*.27,.02,.62,.02)}
      k.L('','m',C.iron,[-.2,.75,0],[0,.95,0],.01,.01,3);k.L('','m',C.iron,[.2,.75,0],[0,.95,0],.01,.01,3)},0);
  case 'spit':return ab152Spit();
  case 'rack':return lgGroup('AB152|rack',k=>{[-1.3,1.3].forEach(x=>k.p('','box','c',C.woodD,x,1.1,0,.1,2.2,.1));k.p('','box','c',C.wood,0,2.1,0,2.8,.08,.08);
      for(let i=0;i<8;i++){const x=-1.15+i*.33;k.L('','c',0x8a7a5a,[x,2.08,0],[x,1.8,0],.005,.005,3);k.p('','sph','c',i%2?C.ratP:C.meat,x,1.68,0,.07,.14,.06);k.L('','c',C.ratP,[x,1.54,0],[x+.02,1.3,.01],.012,.004,3)}},.05);
  case 'well':return lgGroup('AB152|well',k=>{k.p('','cyl','c',C.stone,0,.45,0,.9,.9,.9);k.p('','cyl','c',C.dark,0,.91,0,.72,.02,.72);[-1,1].forEach(s=>k.p('','box','c',C.woodD,s*.85,1.2,0,.1,1.6,.1));
      k.p('','box','c',C.roof,0,2.05,0,2.0,.08,1.2,0,0,0);k.p('','cyl','c',C.wood,0,1.65,0,.08,1.6,.08,0,0,Math.PI/2);k.L('','c',0x8a7a5a,[0,1.6,0],[0,1.0,0],.008,.008,3);k.p('','cyl','c',C.wood,0,.95,0,.14,.18,.14)},0);
  case 'bench':return lgGroup('AB152|bench',k=>{k.p('','box','c',C.woodL,0,.45,0,1.8,.08,.45);[-.75,.75].forEach(x=>k.p('','box','c',C.woodD,x,.22,0,.1,.44,.4))},0);
  case 'stool':return lgGroup('AB152|stool',k=>{k.p('','cyl','c',C.woodL,0,.44,0,.22,.06,.22);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;k.L('','c',C.woodD,[Math.sin(a)*.16,0,Math.cos(a)*.16],[Math.sin(a)*.08,.42,Math.cos(a)*.08],.025,.02,4)}},0);
  case 'platform':return lgGroup('AB152|platform',k=>{k.p('','box','c',C.woodL,0,.6,0,2.6,.12,2.6);[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>k.p('','box','c',C.woodD,a*1.2,.3,b*1.2,.14,.6,.14));
      for(let i=0;i<3;i++)k.p('','box','c',C.wood,0,.1+i*.18,1.45+i*.15,1,.06,.3)},0);
  case 'gate':return lgGroup('AB152|gate',k=>{k.p('','box','c',C.woodD,0,1.8,0,5.4,3.6,.3);k.p('','box','c',C.stoneL,0,3.75,.5,6.2,.3,1.6);for(let i=0;i<7;i++)k.p('','box','c',C.stone,-2.9+i*.97,4.1,1.25,.5,.45,.18);for(let i=0;i<9;i++)k.p('','box','c',i%2?C.wood:C.woodL,-2.4+i*.6,1.8,.17,.5,3.5,.04);
      [.6,1.8,3.0].forEach(y=>k.p('','box','m',C.iron,0,y,.2,5.4,.16,.05));for(let i=0;i<14;i++)k.p('','sph','m',C.ironL,-2.6+i*.4,1.8+(i%2?1.2:-1.2),.24,.05);k.p('','cyl','m',C.brass,0,1.8,.25,.35,.05,.35,Math.PI/2,0,0)},0);
  case 'drain':return lgGroup('AB152|drain',k=>{k.p('','box','g',0x1a2a1a,0,.04,0,1.2,.02,.6)},0);
  case 'fence':return lgGroup('AB152|fence',k=>{[-.95,.95].forEach(x=>k.p('','box','c',C.woodD,x,.5,0,.1,1.0,.1));[.35,.75].forEach(y=>k.p('','box','c',C.wood,0,y,0,2.0,.08,.05))},0);
  case 'fenceV':return lgGroup('AB152|fenceV',k=>{[-.95,.95].forEach(z=>k.p('','box','c',C.woodD,0,.5,z,.1,1.0,.1));[.35,.75].forEach(y=>k.p('','box','c',C.wood,0,y,0,.05,.08,2.0))},0)}
  return null}
// the long hearth: a stone base, a bed of coals, a row of fires (animated flame cones), iron fire dogs
function ab152Hearth(){const C=AB152C,g=new THREE.Group();g.add(lgGroup('AB152|hearth',k=>{k.p('','box','c',C.stone,0,.35,0,14,.7,1.8);k.p('','box','c',0x2a1410,0,.71,0,13.2,.04,1.3);
  for(let i=0;i<28;i++)k.p('','dod','g',i%3?0xff5a18:0xffa040,-6.4+i*.47,.76,(i%2-.5)*.6,.14,.07,.14);for(let i=0;i<7;i++)k.p('','box','m',C.iron,-6+i*2,.9,0,.06,.3,1.5)},0));
  const fl=lgGroup('AB152|hearthFlame',k=>{for(let i=0;i<9;i++){const x=-6+i*1.5;k.p('','cone','g',0xff8a30,x,1.05,0,.32,.65,.32);k.p('','cone','g',0xffe08a,x,.98,.05,.16,.4,.16)}},0);g.add(fl);g.userData.flame=fl;return g}
// a spit of rats over coals: the bar turns (animated), the rats roast on it
function ab152Spit(){const C=AB152C,g=new THREE.Group();g.add(lgGroup('AB152|spitBase',k=>{[-1.2,1.2].forEach(x=>{k.L('','m',C.iron,[x,0,-.3],[x,1.05,0],.03,.03,4);k.L('','m',C.iron,[x,0,.3],[x,1.05,0],.03,.03,4)});
  k.p('','box','c',0x2a1410,0,.06,0,2.2,.1,.8);for(let i=0;i<10;i++)k.p('','dod','g',i%2?0xff5a18:0xffa040,-.9+i*.2,.14,(i%2-.5)*.3,.12,.06,.12);
  k.L('','m',C.iron,[1.2,1.05,0],[1.4,.8,0],.02,.02,3);k.L('','m',C.iron,[1.4,.8,0],[1.4,.8,.25],.02,.02,3)},0));
  const bar=lgGroup('AB152|spitBar',k=>{k.p('','cyl','m',C.ironL,0,0,0,.025,2.5,.025,0,0,Math.PI/2);for(let i=0;i<4;i++){const x=-.8+i*.53;
    k.p('','sph','c',i%2?C.meat:0x8a5a3a,x,0,0,.24,.12,.13);k.p('','sph','c',C.meatD,x+.2,0,0,.08,.07,.07);k.L('','c',C.meatD,[x-.22,0,0],[x-.5,-.04,0],.02,.005,3);
    [-1,1].forEach(s=>k.L('','c',C.meatD,[x+.05,-.06,s*.08],[x+.08,-.16,s*.1],.015,.008,3))}},0);
  bar.position.y=1.0;g.add(bar);g.userData.bar=bar;return g}
// laundry: two posts, a line, sheets that sway (k.S strips, cloth material)
function ab152Laundry(){const C=AB152C;return lgGroup('AB152|laundry',k=>{[-1.9,1.9].forEach(x=>k.p('','box','c',C.woodD,x,1.2,0,.08,2.4,.08));k.L('','c',0x8a7a5a,[-1.9,2.3,0],[1.9,2.25,0],.006,.006,3);
  [[-1.4,0xd8d0b8],[-.6,C.cloth[0]],[.2,0xc8b898],[1.0,C.cloth[2]],[1.5,0xe0d8c8]].forEach(([x,c],i)=>k.S('',c,x,2.26,0,.7,1.55-(i%2)*.3,0,0,i))},.6)}

// ---------------- rats (instanced) ----------------
function ab152RatGeo(){if(ab152RatGeo.g)return ab152RatGeo.g;const C=AB152C,k=dkKit();
  k.p('','sph2','c',C.rat,0,.11,0,.11,.09,.19);k.p('','sph2','c',C.rat,0,.13,.17,.07,.065,.09);k.p('','cone','c',C.ratP,0,.12,.27,.03,.07,.03,Math.PI/2,0,0);
  [-1,1].forEach(s=>{k.p('','sph','c',C.ratP,s*.05,.2,.16,.03,.035,.012);k.p('','sph','c',0x080606,s*.035,.15,.235,.012);k.p('','box','c',C.ratD,s*.07,.03,.08,.03,.06,.04);k.p('','box','c',C.ratD,s*.07,.03,-.1,.03,.06,.05)});
  k.L('','c',C.ratP,[0,.1,-.17],[0,.05,-.48],.02,.006,4);k.p('','sph','c',C.ratD,0,.16,-.05,.09,.05,.12);
  const gs=lgBake(k.P,'AB152|ratGeo',0);ab152RatGeo.g=gs;return gs}
// a herd of n rats inside a rectangle [x0,z0,x1,z1] (world): they wander, stop to sniff, sometimes bolt
function ab152Rats(n,box,seed,parent){const meshes=ab152RatGeo(),R=ab152R(seed),list=[];
  const im=meshes.map(m=>{const q=new THREE.InstancedMesh(m.geometry,m.material,n);q.castShadow=false;q.frustumCulled=false;q.userData.psNo=1;parent.add(q);return q});
  for(let i=0;i<n;i++){const x=box[0]+R()*(box[2]-box[0]),z=box[1]+R()*(box[3]-box[1]);list.push({x,z,a:R()*6.28,t:R()*3,s:0,ph:R()*6,sz:.8+R()*.45})}
  return {im,list,box,y:1.6,m:new THREE.Matrix4(),q:new THREE.Quaternion(),e:new THREE.Euler(),p:new THREE.Vector3(),sc:new THREE.Vector3(),panic:0}}
function ab152RatsTick(H,dt,now){const B=H.box,y=H.y;for(let i=0;i<H.list.length;i++){const r=H.list[i];r.t-=dt;
    if(r.t<=0){if(H.panic>0||Math.random()<.35){r.s=H.panic>0?2.2+Math.random():.9+Math.random()*.8;r.a+=(Math.random()-.5)*2.4;r.t=.5+Math.random()*1.4}else{r.s=0;r.t=.6+Math.random()*2.2}}
    if(r.s>0){let nx=r.x+Math.sin(r.a)*r.s*dt,nz=r.z+Math.cos(r.a)*r.s*dt;if(nx<B[0]||nx>B[2]){r.a=-r.a;nx=r.x}if(nz<B[1]||nz>B[3]){r.a=Math.PI-r.a;nz=r.z}r.x=nx;r.z=nz}
    const bob=r.s>0?Math.abs(Math.sin(now/55+r.ph))*.02:0,sn=r.s>0?0:Math.sin(now/180+r.ph)*.12;
    H.e.set(sn*.5,r.a+(r.s>0?0:Math.sin(now/700+r.ph)*.4),0);H.q.setFromEuler(H.e);H.p.set(r.x,y+bob,r.z);H.sc.setScalar(r.sz);H.m.compose(H.p,H.q,H.sc);H.im.forEach(m=>m.setMatrixAt(i,H.m))}
  H.im.forEach(m=>m.instanceMatrix.needsUpdate=true);if(H.panic>0)H.panic-=dt}

// ---------------- lights ----------------
var AB152L={brazier:[6,1.6,0xffa050],torch:[4.5,1.2,0xffa860],lantern:[4,1.0,0xffc070],hearth:[8,2.2,0xff8a40]};
function ab152Torch(){const C=AB152C,g=new THREE.Group();g.add(lgGroup('AB152|torch',k=>{k.L('','c',C.woodD,[0,0,0],[0,2.1,0],.05,.04,5);k.p('','cyl','m',C.iron,0,2.15,0,.09,.2,.09);k.p('','dod','c',0x2a1a10,0,2.28,0,.08)},0));
  const fl=lgGroup('AB152|torchFlame',k=>{k.p('','cone','g',0xffa040,0,2.5,0,.13,.4,.13);k.p('','cone','g',0xffe08a,0,2.44,0,.07,.25,.07)},0);g.add(fl);g.userData.flame=fl;return g}
function ab152Lantern(){const C=AB152C,g=new THREE.Group();g.add(lgGroup('AB152|lantern',k=>{k.L('','c',C.woodD,[0,0,0],[0,2.6,0],.05,.045,5);k.L('','c',C.woodD,[0,2.55,0],[.6,2.6,0],.03,.03,4);
  k.L('','m',C.iron,[.6,2.6,0],[.6,2.35,0],.006,.006,3);k.p('','box','m',C.brass,.6,2.13,0,.2,.04,.2);k.p('','box','g',C.glow,.6,2.0,0,.15,.22,.15);k.p('','cone4','m',C.brass,.6,2.29,0,.15,.12,.15,0,Math.PI/4,0)},0));
  g.userData.flame=null;return g}
// a soft pool of light on the ground (additive), shared texture
function ab152Pool(r,col){const t=ab152Pool.t||(ab152Pool.t=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),gr=x.createRadialGradient(64,64,2,64,64,63);
    gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(.45,'rgba(255,255,255,.22)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})());
  const m=new THREE.Mesh(ab152Pool.g||(ab152Pool.g=new THREE.PlaneGeometry(2,2).rotateX(-Math.PI/2)),new THREE.MeshBasicMaterial({map:t,color:col,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));
  m.scale.set(r,1,r);m.renderOrder=1;m.userData.psNo=1;return m}

// ---------------- the streets: a cobble texture over the open ground ----------------
function ab152Cobble(){if(ab152Cobble.t)return ab152Cobble.t;const N=256,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),R=ab152R(4411);
  x.fillStyle='#3a342c';x.fillRect(0,0,N,N);
  for(let j=0;j<16;j++)for(let i=0;i<16;i++){const ox=(j%2)*8,px=i*16+ox+(R()-.5)*3,py=j*16+(R()-.5)*3,w=13+R()*2,h=13+R()*2,v=70+R()*36|0;
    x.fillStyle=`rgb(${v+18},${v+10},${v})`;x.beginPath();x.ellipse(px+8,py+8,w/2,h/2,R()*.5,0,Math.PI*2);x.fill();x.fillStyle='rgba(255,240,210,.08)';x.beginPath();x.ellipse(px+6,py+6,w/3,h/4,0,0,Math.PI*2);x.fill()}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return ab152Cobble.t=t}
// one cobble mesh over every open tile that is not a yard (tiles at least 1 from a building), built from quads per row run
function ab152Streets(P,I,G){const pos=[],uv=[],idx=[];let n=0;const y=1.62,[a0,b0,a1,b1]=P.IN;
  for(let v=b0;v<=b1;v++){let s=-1;for(let u=a0;u<=a1+1;u++){const ok=u<=a1&&G.cls[v*P.W+u]!==2&&!G.yard[v*P.W+u];
      if(ok&&s<0)s=u;if(!ok&&s>=0){const x0=I.x0+s-.5,x1=I.x0+u-.5,z0=I.y0+v-.5,z1=z0+1;pos.push(x0,y,z0,x1,y,z0,x1,y,z1,x0,y,z1);uv.push(x0/4,z0/4,x1/4,z0/4,x1/4,z1/4,x0/4,z1/4);idx.push(n,n+2,n+1,n,n+3,n+2);n+=4;s=-1}}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:ab152Cobble(),color:0xc8bca8}));m.receiveShadow=true;m.userData.psNo=1;return m}
