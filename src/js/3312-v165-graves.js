// ================= v165 The Dirge I — the Keeper's Grave =================
// The Dirge I's gateway to II is gone. Where it stood, a weeping angel watches over the road's end, a gravedigger's spade stuck in the
// earth at its feet and an inscription on its plinth: the Keeper sleeps where the stone is broken, a raven keeps watch and the candles
// never die. Fourteen graves stand along the road (dg165GravePlan, 3310), each with its own headstone, emblem and offering.
//  * F at a grave reads it (name, dates, epitaph, what you see on it). Once you have the spade, F again digs it up (3 s of digging,
//    walking away or a hit stops it).
//  * A wrong grave: the coffin bursts and its dead climb out (two or three of the Dirge's dead, local to you); the grave stays open.
//  * The Keeper's grave: the earth caves in on a stone stair. F · Descend into the Hidden Sanctum (3313). Once the Sanctum is behind
//    you, the stair (and the angel) lead straight on to the Drowned Crypts.
// The graves are built the first time you are in the Dirge I, hidden elsewhere. Their tiles are solid (CBLK) except the stair.
var DG165GR={S:null,dig:null,err:0,col:{st:0x5c5c60,st2:0x4a4a50,st3:0x6c6a64,moss:0x3a4a34,soil:0x2a241e,soil2:0x3a3026,wax:0xd0c4a2,iron:0x2a2c30,rust:0x5a3a24,bone:0xc8c0a8,lily:0xd8d4c8,stem:0x3a4a2a,rose:0x4a1214,raven:0x1c1c22}};
function dg165GIn(){return dg165InG(20)}
// ---------------- models ----------------
// v168 (owner: "the angel graves look way too low detail"): sculpted, bevelled and weathered (3345's kit), each part sitting on the
// ground under it. Local frame: the headstone at z -.95, the mound round z .38, +z toward the road; the group is scaled 1.3.
// the ground under a grave's local spot, relative to its centre (the headstone is sunk or lifted to it)
function dg165GY(o,lx,lz){const s=1.3,ca=Math.cos(o.ry),sa=Math.sin(o.ry);try{return (GH(o.x+(ca*lx+sa*lz)*s,o.z+(-sa*lx+ca*lz)*s)-GH(o.x,o.z))/s}catch(_){return 0}}
// the mound's surface height, and the candles on it: [x, base y, z, height]
function dg165MoundY(x,z){const u=x/.72,v=(z-.38)/1.18;return .3*Math.sqrt(Math.max(0,1-u*u-v*v))-.03}
function dg165CandleQ(){return [[-.33,.25,.24],[.28,0,.18],[-.1,-.3,.27],[.36,.66,.14]].map(([x,z,h])=>[x,dg165MoundY(x,z),z,h])}
// v168: the soil is kind 's' (the same stone-like material, weathered without moss)
function dg165Berm(){return dt168Geo('berm',()=>{const g=new THREE.TorusGeometry(1,.16,8,48),P=g.attributes.position;g.rotateX(Math.PI/2);
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),n=dt168Fbm(x*3,y*3,z*3,61);P.setXYZ(i,x*(1+(n-.5)*.1),Math.max(-.02,y*(.7+n*.8)),z*(1+(n-.5)*.1))}g.computeVertexNormals();return g})}
var DG165WX={s:{g:[.3,.25],n:.3,sd:8},c:{g:[.55,.4],n:.16,s:.3,m:[0x2e3a26,.7,.45],l:[0x9a9878,.7],sd:5},m:{n:.25,sd:9}};
// a raven perched at (x, y, z) facing +z (turned ry)
function dg165Raven(k,x,y,z,ry,col){const i0=k.P.length,c=col||DG165GR.col.raven,c2=lgCol(c,0x3a3a48,.35),fth=dt168Feather(),V3=THREE.Vector3;
  dt168P(k,dt168Lathe([[0,-1],[.6,-.8],[.95,-.3],[1,.1],[.8,.6],[.4,.9],[0,1]],12),'c',c,dt168Mx(0,.15,0,.85,0,0,.085,.16,.095));
  dt168P(k,dt168Lathe([[0,-1],[.7,-.7],[1,0],[.75,.65],[0,1]],12),'c',c,dt168Mx(0,.29,.09,0,0,0,.058,.06,.07));
  dt168P(k,dt168Lathe([[0,0],[.5,.05],[.4,.5],[.15,.85],[0,1]],8),'c',0x0e0e10,dt168Mx(0,.28,.15,1.45,0,0,.024,.11,.03));
  [-1,1].forEach(s=>{dt168P(k,fth,'c',c2,dt168Basis(new V3(s*.07,.22,.05),new V3(s*.04,-.45,-1),new V3(s,0,0),.26,.12,1));
    dt168P(k,fth,'c',c,dt168Basis(new V3(s*.075,.2,.02),new V3(s*.03,-.6,-1),new V3(s,0,0),.2,.09,1));
    dt168P(k,dt168Lathe([[0,-1],[1,0],[0,1]],6),'g',0xb0ff90,dt168Mx(s*.04,.305,.135,0,0,0,.011,.011,.008));
    k.L('','c',0x101012,[s*.03,.07,.02],[s*.03,-.005,.04],.008,.006,5);k.L('','c',0x101012,[s*.03,0,.04],[s*.03,0,.08],.005,.004,4)});
  for(let i=0;i<3;i++)dt168P(k,fth,'c',lgCol(c,0x000000,.2),dt168Basis(new V3((i-1)*.025,.09,-.08),new V3((i-1)*.15,-.55,-1),new V3(0,1,-.4).normalize(),.2,.07,1));
  dt168Xf(k,i0,dt168Mx(x,y,z,0,ry||0,0))}
// a candle's flame spot for 3311's flame sprites
function dg165Flames(){return dg165CandleQ().map(q=>[q[0],q[1]+q[3]+.06,q[2]])}
// the headstone and its emblem (also left standing beside an open grave)
function dg165Head(k,o){const C=DG165GR.col,R=svRng(4100+o.i*37),st=[C.st,C.st2,C.st3][o.i%3],z0=-.95,i0=k.P.length,dk=lgCol(st,0x0c0c0e,.6),T=.17,ft=lgCol(st,0x1a1a1c,.25),V3=THREE.Vector3;
  let ey=.95,ez=z0+T/2,rv=null,bl=null;
  if(o.stone=='slab'){dt168P(k,dt168Ext('slab',dt168ArchPts(.92,-.45,1.0,.55),T,.028),'c',st,dt168Mx(0,0,z0));
    dt168P(k,dt168Ext('slabp',dt168ArchPts(.7,.2,.86,.5),.016,.004,1),'c',ft,dt168Mx(0,0,z0+T/2-.003));
    for(let i=0;i<4;i++)dt168P(k,dt168BBox(.44-i*.08,.026,.012,.004),'c',dk,dt168Mx(0,.66-i*.09,z0+T/2+.006));
    dt168P(k,dt168BBox(1.14,.22,.4,.035),'c',lgCol(st,0x202020,.2),dt168Mx(0,.0,z0+.02));rv=[0,1.25,z0];bl=[.34,1.0]}
  else if(o.stone=='cross'){const pts=[[-.07,-.45],[.07,-.45],[.07,.98],[.1,1.02],[.34,1.0],[.4,1.05],[.4,1.19],[.34,1.24],[.1,1.22],[.07,1.26],[.07,1.5],[.1,1.55],[.06,1.62],[-.06,1.62],[-.1,1.55],[-.07,1.5],[-.07,1.26],[-.1,1.22],[-.34,1.24],[-.4,1.19],[-.4,1.05],[-.34,1.0],[-.1,1.02],[-.07,.98]];
    dt168P(k,dt168Ext('cross',pts,.15,.02),'c',st,dt168Mx(0,0,z0));dt168P(k,dt168Geo('xring',()=>new THREE.TorusGeometry(.25,.034,8,40)),'c',lgCol(st,C.moss,.2),dt168Mx(0,1.12,z0));
    dt168P(k,dt168BBox(.66,.22,.46,.035),'c',lgCol(st,0x202020,.2),dt168Mx(0,0,z0));dt168P(k,dt168BBox(.46,.14,.32,.03),'c',st,dt168Mx(0,.17,z0));
    for(let i=0;i<3;i++)dt168P(k,dt168BBox(.2-i*.04,.02,.01,.003),'c',dk,dt168Mx(0,.82-i*.07,z0+.081));ey=1.12;ez=z0+.08;rv=[0,1.62,z0];bl=[.33,1.0]}
  else if(o.stone=='obelisk'){dt168P(k,dt168Lathe([[0,-.4],[.44,-.4],[.44,.14],[.42,.18],[.36,.2],[.36,.28],[.33,.32],[.28,.34],[.27,.4],[.24,.44],[.22,.48],[.17,1.62],[.2,1.64],[.2,1.69],[.17,1.71],[0,1.98]],4),'c',st,dt168Mx(0,0,z0));
    dt168P(k,dt168BBox(.27,.4,.012,.004),'c',ft,dt168Mx(0,.82,z0+.205,-.045,0,0));for(let i=0;i<3;i++)dt168P(k,dt168BBox(.18-i*.03,.02,.01,.003),'c',dk,dt168Mx(0,.92-i*.07,z0+.212,-.045,0,0));
    ey=1.22;ez=z0+.19;rv=[0,.34,z0+.33];bl=[.2,1.42]}
  else{// broken: the stump stands, its top a jagged break; the top half lies on its back in the grass beside it
    const lo=[[-.46,-.45],[.46,-.45],[.46,.55],[.37,.64],[.27,.57],[.15,.72],[.05,.6],[-.07,.68],[-.2,.58],[-.3,.66],[-.46,.6]];
    dt168P(k,dt168Ext('brk',lo,T,.02),'c',st,dt168Mx(0,0,z0));
    const up=[[.46,.55],[.46,1.0]].concat(dt168ArchPts(.92,0,1.0,.55,12).slice(3),[[-.46,.6],[-.3,.66],[-.2,.58],[-.07,.68],[.05,.6],[.15,.72],[.27,.57],[.37,.64]]);
    dt168P(k,dt168Ext('brku',up,T,.02),'c',lgCol(st,C.moss,.18),dt168Mx(.98,.05,z0+.22,0,-Math.PI/2+.25,0).multiply(dt168Mx(0,0,0,-Math.PI/2+.07,0,.04)).multiply(dt168Mx(0,-.9,0)));
    for(let i=0;i<6;i++)dt168P(k,dt168Rock(60+i,1,.6),'c',st,dt168Mx(-.5+R()*1.1,.01,z0+.18+R()*.5,R()*3,R()*3,0,.04+R()*.04,.025+R()*.02,.04+R()*.03));
    dt168P(k,dt168BBox(.6,.24,.012,.004),'c',ft,dt168Mx(0,.3,z0+T/2-.002));for(let i=0;i<2;i++)dt168P(k,dt168BBox(.36-i*.08,.024,.01,.003),'c',dk,dt168Mx(0,.34-i*.08,z0+T/2+.006));
    ey=.18;rv=[.15,.71,z0];bl=[.3,.5]}
  // the emblem: a raven perched on the stone, or carved in relief on its face, or a bell on an iron bracket
  if(o.emb=='raven')dg165Raven(k,rv[0],rv[1],rv[2],o.stone=='obelisk'?0:.25);
  else if(o.emb=='skull'){const y=ey,z=ez,b=C.bone;dt168P(k,dt168Lathe([[0,-1],[.6,-.8],[.95,-.3],[1,.2],[.8,.7],[.4,.95],[0,1]],14),'c',b,dt168Mx(0,y+.02,z,0,0,0,.1,.105,.055));
    dt168P(k,dt168BBox(.085,.05,.05,.012),'c',b,dt168Mx(0,y-.08,z+.012));[-1,1].forEach(s=>dt168P(k,dt168Lathe([[0,-1],[1,0],[0,1]],8),'c',0x0a0a0a,dt168Mx(s*.038,y+.005,z+.045,0,0,0,.027,.025,.02)));
    dt168P(k,dt168Lathe([[0,0],[1,0],[0,1]],3),'c',0x0a0a0a,dt168Mx(0,y-.04,z+.05,Math.PI,0,0,.014,.025,.01));
    [-1,1].forEach(s=>{k.L('','c',b,[s*-.17,y-.2,z],[s*.17,y-.11,z],.016,.016,8);[[-.17,-.2],[.17,-.11]].forEach(([dx,dy])=>dt168P(k,dt168Lathe([[0,-1],[1,0],[0,1]],8),'c',b,dt168Mx(s*dx,y+dy,z,0,0,0,.025,.025,.02)))})}
  else if(o.emb=='rose'){const y=ey,z=ez,rc=lgCol(st,C.rose,.5);for(let r=0;r<2;r++)for(let i=0;i<(r?5:6);i++){const a=i/(r?5:6)*6.283+r*.4,d=r?.03:.055;
      dt168P(k,dt168Lathe([[0,-1],[.7,-.7],[1,0],[.7,.7],[0,1]],8),'c',lgCol(rc,0x1a0606,r*.25),dt168Mx(Math.cos(a)*d,y+Math.sin(a)*d,z+.008+r*.012,0,0,a,.042-r*.01,.03-r*.006,.016))}
    dt168P(k,dt168Lathe([[0,-1],[.8,-.5],[1,.2],[0,1]],8),'c',lgCol(rc,0x1a0606,.4),dt168Mx(0,y,z+.03,Math.PI/2,0,0,.022,.02,.022));
    k.L('','c',lgCol(st,C.stem,.4),[0,y-.06,z],[.02,y-.42,z],.01,.008,6);[-1,1].forEach(s=>dt168P(k,dt168Feather(),'c',lgCol(st,C.stem,.45),dt168Basis(new V3(.01,y-.2-s*.06,z+.004),new V3(s,-.4,0),new V3(0,0,1),.13,.06,.6)))}
  else if(o.emb=='hourglass'){const y=ey,z=ez,c=lgCol(st,0x101010,.35);dt168P(k,dt168Lathe([[0,-.5],[.42,-.47],[.4,-.38],[.12,-.06],[.06,0],[.12,.06],[.4,.38],[.42,.47],[0,.5]],12),'c',c,dt168Mx(0,y,z,0,0,0,.13,.34,.045));
    [-1,1].forEach(s=>{dt168P(k,dt168BBox(.26,.03,.05,.008),'c',lgCol(st,0x101010,.25),dt168Mx(0,y+s*.185,z));k.L('','c',lgCol(st,0,.2),[s*.11,y-.17,z+.01],[s*.11,y+.17,z+.01],.01,.01,6)})}
  else if(o.emb=='bell'){const x=bl[0],y=bl[1],z=z0,ir=C.iron;k.L('','m',ir,[x-.12,y,z],[x+.2,y+.03,z],.013,.011,8);k.L('','m',ir,[x+.19,y+.03,z],[x+.2,y-.06,z],.007,.007,6);
    dt168P(k,dt168Lathe([[0,0],[.055,-.01],[.07,-.05],[.075,-.11],[.1,-.15],[.105,-.17],[0,-.165]],12),'m',lgCol(ir,C.rust,.5),dt168Mx(x+.2,y-.06,z));dt168P(k,dt168Lathe([[0,-1],[1,0],[0,1]],8),'m',C.rust,dt168Mx(x+.2,y-.22,z,0,0,0,.02));
    dt168T(k,'bcord'+o.stone,'c',0x3a3026,[[x+.2,y-.2,z],[x+.16,y-.5,z+.25],[x+.12,.05,z+.55]],.005,4)}
  // lean (seeded), then sink or lift it to the ground at its foot
  const tilt=(R()-.5)*.1,roll=(R()-.5)*.06,gy=dg165GY(o,0,z0);dt168Xf(k,i0,dt168Mx(0,gy-.02,z0).multiply(dt168Mx(0,0,0,tilt,0,roll)).multiply(dt168Mx(0,0,-z0)))}
function dg165GraveKit(k,o){const C=DG165GR.col,R=svRng(4100+o.i*37+5),st=[C.st,C.st2,C.st3][o.i%3],gm=dg165GY(o,0,.38);
  dg165Head(k,o);const i0=k.P.length;
  // the mound: heaped earth, a kerb of half-sunk stones (a stone surround for a slab or an obelisk), grass tufts
  dt168P(k,dt168Mound(o.i%5+1),'c',C.soil,dt168Mx(0,0,.38,0,0,0,.72,.3,1.18));
  if(o.stone=='slab'||o.stone=='obelisk'){[[0,-.42,1.5,.2],[0,1.92,1.5,.2],[-.83,.75,.2,2.34],[.83,.75,.2,2.34]].forEach(([x,z,w,d],i)=>dt168P(k,dt168BBox(w,.2,d,.035),'c',lgCol(st,C.moss,.15+i*.05),dt168Mx(x,.02,z,(R()-.5)*.03,(R()-.5)*.04,(R()-.5)*.05)))}
  else for(let i=0;i<12;i++){const a=i/12*6.283+R()*.3,x=Math.cos(a)*.78,z=.38+Math.sin(a)*1.28;dt168P(k,dt168Rock(i%6+40,1,.5),'c',lgCol(st,C.moss,R()*.5),dt168Mx(x,.0,z,R()*3,R()*3,R()*3,.07+R()*.05,.05+R()*.03,.07+R()*.05))}
  for(let i=0;i<10;i++){const a=R()*6.283,r=R()*.8,x=Math.cos(a)*r*.62,z=.38+Math.sin(a)*r*1.05;dt168P(k,dt168Rock(170+i%6,1,.6),'s',lgCol(C.soil,C.soil2,R()),dt168Mx(x,dg165MoundY(x,z)-.01,z,R()*3,R()*3,0,.05+R()*.05,.03+R()*.02,.05+R()*.04))}
  for(let i=0;i<14;i++){const a=R()*6.283,r=.4+R()*.65,x=Math.cos(a)*r*.9,z=.38+Math.sin(a)*r*1.4;dt168P(k,dt168Tuft(i%4+1,7,.32),'c',lgCol(0x2e3a2a,0x5a6440,R()),dt168Mx(x,dg165MoundY(x,z)-.01,z,0,R()*6,0,1,.8+R()*.5,1))}
  // what lies on the grave
  if(o.ext=='candles')dg165CandleQ().forEach(q=>dt168Candle(k,q[0],q[1],q[2],q[3],C.wax));
  else if(o.ext=='lilies'){for(let i=0;i<5;i++){const x=(R()-.5)*.36,z=.1+(R()-.5)*.3,a=R()*6.28,y=dg165MoundY(x,z),ex=x+Math.cos(a)*.32,ez=z+Math.sin(a)*.32;
      dt168T(k,'lily'+o.i+i,'c',C.stem,[[x,y,z],[(x+ex)/2,y+.06,(z+ez)/2],[ex,dg165MoundY(ex,ez)+.03,ez]],.008,5);
      dt168P(k,dt168Lathe([[0,0],[.008,0],[.012,.04],[.03,.08],[.055,.1],[.06,.104]],9),'c',lgCol(C.lily,0x8a7a5a,.35+R()*.3),dt168Mx(ex,dg165MoundY(ex,ez)+.03,ez,0,0,0).multiply(dt168Mx(0,0,0,Math.PI/2+.5,a+Math.PI/2,0,1,1,1,'YXZ')));
      dt168P(k,dt168Feather(),'c',lgCol(C.stem,0x6a6a3a,.3),dt168Basis(new THREE.Vector3(x,y+.01,z),new THREE.Vector3(Math.cos(a+.7),.05,Math.sin(a+.7)),new THREE.Vector3(0,1,0),.18,.05,.5))}
    dt168P(k,dt168BBox(.1,.03,.06,.008),'c',0x4a1a1a,dt168Mx(0,dg165MoundY(0,.1)+.01,.1,0,.4,0))}
  else if(o.ext=='cage'){const ir=C.iron,rs=C.rust;// a mortsafe: hoops of iron bars over the grave, spear tips, rails at the foot
    for(let i=0;i<8;i++){const x=-.7+i*.2,c=i%3?ir:lgCol(ir,rs,.5);k.L('','m',c,[x,-.1,-.62],[x,.62,-.62],.016,.016,8);k.L('','m',c,[x,.62,-.62],[x,.62,1.32],.016,.016,8);k.L('','m',c,[x,-.1,1.32],[x,.62,1.32],.016,.016,8);
      dt168P(k,dt168Lathe([[0,0],[.025,0],[.03,.04],[.012,.08],[0,.12]],6),'m',rs,dt168Mx(x,.62,1.32));dt168P(k,dt168Lathe([[0,0],[.025,0],[.03,.04],[.012,.08],[0,.12]],6),'m',rs,dt168Mx(x,.62,-.62))}
    [-.62,1.32].forEach(z=>{dt168P(k,dt168BBox(1.56,.05,.05,.01),'m',rs,dt168Mx(0,.6,z));dt168P(k,dt168BBox(1.56,.05,.05,.01),'m',ir,dt168Mx(0,.04,z))});
    [0,.35,.7,1.0].forEach(z=>dt168P(k,dt168BBox(1.56,.035,.035,.008),'m',rs,dt168Mx(0,.6,z)))}
  else if(o.ext=='chains'){const L=dt168Geo('link',()=>new THREE.TorusGeometry(1,.26,4,10));
    for(let i=0;i<22;i++){const t=i/21,x=-.82+t*1.64,y=Math.max(dg165MoundY(x,.4),0)+.03;dt168P(k,L,'m',i%2?C.iron:lgCol(C.iron,C.rust,.6),dt168Mx(x,y,.4,i%2?Math.PI/2:0,0,0,.045,.03,.045).multiply(dt168Mx(0,0,0,0,Math.PI/2,0)))}
    for(let i=0;i<16;i++){const a=i/16*6.283,x=Math.cos(a)*.53,z=-.95+Math.sin(a)*.15;dt168P(k,L,'m',i%2?C.iron:C.rust,dt168Mx(x,.5+dg165GY(o,0,-.95),z,0,-a,i%2?Math.PI/2:0,.045,.03,.045))}
    [-.85,.85].forEach(x=>{k.L('','m',C.iron,[x,-.2,.4],[x,.12,.4],.025,.02,8);dt168P(k,L,'m',C.rust,dt168Mx(x,.14,.4,0,Math.PI/2,0,.05,.04,.05))})}
  else if(o.ext=='lantern'){dt168T(k,'crook','c',0x2a2018,[[.76,-.3,.9],[.76,.6,.9],[.75,1.3,.9],[.73,1.5,.9],[.66,1.6,.9],[.56,1.6,.9],[.5,1.53,.9]],.032,8);
    k.L('','m',C.iron,[.49,1.53,.9],[.48,1.44,.9],.006,.006,4);dt168Lantern(k,.48,1.12,.9,1,0x9affd0,C.iron)}
  dt168Xf(k,i0,dt168Mx(0,gm,0))}
// an open grave: the headstone stays; a black pit ringed with spilled earth, the spoil heap, the smashed coffin
function dg165GraveHole(k,o){const C=DG165GR.col,R=svRng(4200+o.i*13),gm=dg165GY(o,0,.38);dg165Head(k,o);const i0=k.P.length;
  const pit=[];for(let i=0;i<20;i++){const a=i/20*6.283;pit.push([Math.cos(a)*(.5+R()*.05),-(.35+Math.sin(a)*(.98+R()*.05))])}
  dt168P(k,dt168Ext('pit'+o.i,pit,.04,0),'g',0x030202,dt168Mx(0,.012,0,-Math.PI/2,0,0));   // unlit: the dark of the pit
  dt168P(k,dg165Berm(),'s',C.soil2,dt168Mx(0,0,.35,0,0,0,.62,.55,1.12));
  dt168P(k,dt168Mound(9),'s',C.soil2,dt168Mx(1.3,0,.3,0,.4,0,.62,.5,.9));dt168P(k,dt168Mound(10),'s',lgCol(C.soil,C.soil2,.5),dt168Mx(1.05,0,1.0,0,1,0,.4,.25,.45));
  // the lid, split, thrown on the heap; boards and bones at the pit's edge
  [[-.14,.0],[.14,.08]].forEach(([dx,dr],i)=>dt168P(k,dt168BBox(.26,.04,1.5,.01),'c',lgCol(0x4a3020,0x2a1a10,i*.4),dt168Mx(1.15+dx,.42,-.15,.42,.9+dr,.25)));
  for(let i=0;i<4;i++)dt168P(k,dt168BBox(.12,.03,.5+R()*.3,.008),'c',lgCol(0x4a3020,0x2a1a10,R()),dt168Mx(-.6+R()*.3,.04,R()*1.2-.1,R()*.3,R()*3,R()*.3));
  for(let i=0;i<3;i++){const x=-.7+R()*.3,z=.6+R()*.6,a=R()*3;k.L('','c',C.bone,[x,.03,z],[x+Math.cos(a)*.22,.04,z+Math.sin(a)*.22],.014,.012,6)}
  dt168P(k,dt168Lathe([[0,-1],[.6,-.8],[.95,-.3],[1,.2],[.8,.7],[.4,.95],[0,1]],12),'c',C.bone,dt168Mx(-.62,.06,1.05,.4,.6,0,.07,.075,.085));
  dt168Xf(k,i0,dt168Mx(0,gm,0))}
// the angel at the road's end (local +z faces the clearing): a weathered plinth, the angel kneeling on it with its face in its hands
function dg165AngelModel(s){const g=new THREE.Group();g.userData.psNo=1;const C=DG165GR.col,sA=0x7c7a72,sB=0x605e58,sC=0x8e8c84;
  g.add(dt168Group('DG165|angel168',k=>{const R=svRng(4321),Y0=1.27;
    // the plinth: a stepped, moulded base, a die with the inscription panel, a cornice
    dt168P(k,dt168Lathe([[0,-.45],[1.12,-.45],[1.12,.22],[1.09,.26],[.92,.27],[.9,.34],[.86,.38],[.78,.41],[.76,.45],[.73,.49],[.7,.52],[.7,1.0],[.73,1.02],[.77,1.05],[.83,1.09],[.88,1.15],[.9,1.21],[.9,1.25],[.86,Y0],[0,Y0]],4),'c',sB,new THREE.Matrix4());
    dt168P(k,dt168BBox(1.04,.4,.02,.006),'c',lgCol(sB,0x1a1a1a,.45),dt168Mx(0,.76,.705));[[0,.98,1.12,.04],[0,.54,1.12,.04]].forEach(q=>dt168P(k,dt168BBox(q[2],q[3],.03,.01),'c',sA,dt168Mx(q[0],q[1],.71)));
    [-.56,.56].forEach(x=>dt168P(k,dt168BBox(.04,.48,.03,.01),'c',sA,dt168Mx(x,.76,.71)));
    for(let i=0;i<5;i++)for(let j=0;j<6;j++)if(R()<.85)dt168P(k,dt168BBox(.1+R()*.06,.022,.012,.004),'c',lgCol(sB,0x080808,.7),dt168Mx(-.4+j*.16,.9-i*.072,.716));
    dt168Angel(k,{pose:'kneel',y0:Y0,s:sA,s2:sB,s3:sC,key:'dgA'});
    // a crack across the die, a chipped corner
    k.L('','c',0x2a2a28,[.42,.55,.705],[.55,.86,.705],.006,.004,4);k.L('','c',0x2a2a28,[.55,.86,.705],[.62,.99,.705],.005,.003,4);
    // the gravedigger's spade stuck in a heap of earth, an iron lantern hung from a crook
    dt168P(k,dt168Mound(4),'s',C.soil,dt168Mx(1.58,0,.8,0,.5,0,.48,.26,.44));for(let i=0;i<3;i++)dt168P(k,dt168Rock(70+i,1,.5),'s',C.soil2,dt168Mx(1.3+R()*.5,.03,.5+R()*.6,R()*3,R()*3,0,.05,.03,.05));
    {const i0=k.P.length,ir=0x3a3c40,wd=0x4a3420;dt168P(k,dt168Ext('spade',[[-.11,0],[.11,0],[.12,-.18],[.09,-.28],[0,-.33],[-.09,-.28],[-.12,-.18]],.02,.006,1),'m',ir,new THREE.Matrix4());
      dt168P(k,dt168Lathe([[0,-.02],[.045,-.02],[.03,.12],[0,.12]],8),'m',ir,new THREE.Matrix4());k.L('','c',wd,[0,.1,0],[0,1.1,0],.022,.02,8);
      dt168P(k,dt168Geo('dgrip',()=>new THREE.TorusGeometry(.08,.016,6,14,Math.PI)),'c',wd,dt168Mx(0,1.12,0));k.L('','c',wd,[-.08,1.12,0],[.08,1.12,0],.016,.016,6);
      dt168Xf(k,i0,dt168Mx(1.55,.16,.82,-.12,.3,-.14))}
    dt168T(k,'dgcrook','c',0x2a2018,[[-1.42,-.3,.7],[-1.43,.8,.7],[-1.45,1.7,.7],[-1.42,1.92,.7],[-1.32,2.0,.7],[-1.2,1.97,.7],[-1.15,1.9,.7]],.034,8);
    k.L('','m',C.iron,[-1.15,1.9,.7],[-1.15,1.82,.7],.006,.006,4);dt168Lantern(k,-1.15,1.42,.7,1,0x9affd0,C.iron);
    // offerings: candles on the base step
    DG165AF.forEach(q=>dt168Candle(k,q[0],.27,q[2],.18,C.wax))},{c:{g:[.9,.35],n:.16,s:.28,m:[C.moss,1,.32],l:[0x9a9a78,.7],sd:11},m:DG165WX.m,s:DG165WX.s},0));
  g.position.set(s.x,GH(s.x,s.z),s.z);g.rotation.y=s.ry;g.scale.setScalar(1.35);scene.add(g);
  g.userData.fl=DG165AF.map(q=>dg165Flame(g,q[0],.27+.18+.05,q[2],.16));
  const ca=Math.cos(s.ry),sa=Math.sin(s.ry);for(let o=-1.6;o<=1.6;o+=.5)for(let d=-1.6;d<=1.6;d+=.5){const x=s.x+ca*o+sa*d,z=s.z-sa*o+ca*d;CBLK.add(Math.round(z)*W+Math.round(x))}
  return g}
var DG165AF=[[-.8,0,1.0],[.85,0,1.0],[-.42,0,1.04],[.5,0,1.02]];
// the opened Keeper's grave: the earth has fallen through onto a stone stair going down into green light; its broken stone still stands
function dg165StairKit(k,o){const C=DG165GR.col,R=svRng(4444),sA=0x4a4a4e,sB=0x3a3a3e;if(o)dg165Head(k,o);const i0=k.P.length;
  dt168P(k,dt168BBox(1.3,.04,2.4,.01),'g',0x010201,dt168Mx(0,-.005,.2));
  // the stairwell's kerb: bevelled stones round the opening, worn and shifted
  for(let i=0;i<5;i++)[-1,1].forEach(s=>dt168P(k,dt168BBox(.24,.24,.48,.04),'c',lgCol(sA,sB,R()),dt168Mx(s*.77,.04+R()*.03,-.78+i*.49,(R()-.5)*.05,(R()-.5)*.08,(R()-.5)*.05)));
  [-1.12,1.52].forEach(z=>dt168P(k,dt168BBox(1.78,.24,.26,.04),'c',sB,dt168Mx(0,.05,z,0,(R()-.5)*.05,0)));
  // the top steps showing at the lip
  for(let i=0;i<2;i++)dt168P(k,dt168BBox(1.2,.06,.3,.02),'c',lgCol(sA,0x101010,.3+i*.3),dt168Mx(0,-.02-i*.008,1.25-i*.3));
  // the caved-in earth, heaped round the opening
  dt168P(k,dt168Mound(12),'s',C.soil2,dt168Mx(1.4,0,-.3,0,.4,0,.6,.42,.75));dt168P(k,dt168Mound(13),'s',C.soil,dt168Mx(-1.2,0,.7,0,1.2,0,.45,.25,.5));
  for(let i=0;i<8;i++)dt168P(k,dt168Rock(80+i%5,1,.5),'c',lgCol(C.st,C.moss,R()*.5),dt168Mx((R()-.5)*2.8,.02,(R()-.5)*2.9,R()*3,R()*3,0,.06+R()*.06,.04+R()*.03,.06+R()*.05));
  dt168Xf(k,i0,dt168Mx(0,o?dg165GY(o,0,.2):0,0))}
// ---------------- the world: built the first time you are in the Dirge I ----------------
function dg165GBuild(){if(DG165GR.S)return DG165GR.S;const Pl=dg165GravePlan(),S={gr:[],fl:[],spots:[],root:new THREE.Group()};S.root.name='DirgeGraves';scene.add(S.root);DG165GR.S=S;
  Pl.G.forEach(o=>{const g=new THREE.Group();g.position.set(o.x,GH(o.x,o.z),o.z);g.rotation.y=o.ry;S.root.add(g);
    const body=dt168Group('DG165|grave168|'+o.i,k=>dg165GraveKit(k,o),DG165WX,.04);g.add(body);
    const hole=dt168Group('DG165|hole168|'+o.i,k=>dg165GraveHole(k,o),DG165WX,.04);hole.visible=false;g.add(hole);
    g.scale.setScalar(1.3);const G={o,g,body,hole,stair:null,fl:[],mark:null};
    // a pale grave-light hangs over every grave of the quest (all alike: it does not give the Keeper away)
    {const w=kqSpr(0xa8d8ff,.55);w.material=w.material.clone();w.material.opacity=.45;w.position.set(0,2.3,-.95);g.add(w);G.wisp=w}
    const gm=dg165GY(o,0,.38);if(o.ext=='candles')dg165Flames().forEach(q=>G.fl.push(dg165Flame(g,q[0],q[1]+gm,q[2],.15)));
    if(o.ext=='lantern'){const f=dg165Flame(g,.48,1.2+gm,.9,.35,0x9affd0);G.fl.push(f)}
    S.fl.push(...G.fl);
    // a faint lantern-glow on the Keeper's candles (the candles that never die: still, no flicker, a soft green-white)
    if(o.i===DG165G.K)G.fl.forEach(f=>{f.material=f.material.clone();f.material.color.setHex(0xe8fff0);f.userData.still=1});
    // tiles: the headstone and the mound block the way (the stair stays open when the Keeper's grave is dug)
    const ca=Math.cos(o.ry),sa=Math.sin(o.ry);G.blk=[];for(let lx=-1;lx<=1;lx+=.5)for(let lz=-1.4;lz<=1.8;lz+=.5){const x=o.x+ca*lx+sa*lz,z=o.z-sa*lx+ca*lz,key=Math.round(z)*W+Math.round(x);if(G.blk.indexOf(key)<0)G.blk.push(key)}
    G.blk.forEach(q=>CBLK.add(q));S.gr.push(G);
    S.spots.push({x:o.x+Math.sin(o.ry)*1.2,y:GH(o.x,o.z)+.7,z:o.z+Math.cos(o.ry)*1.2,c:o.i===DG165G.K?0xd8ffe8:0xffb060,i:o.ext=='candles'?.9:o.ext=='lantern'?1:0,r:6,fq:o.i===DG165G.K?0:9})});
  S.pool=dg165LPool(4,7);dg165GSync();return S}
// match the graves to the state: dug wrong ones open, the Keeper's opened onto the stair
function dg165GSync(){const S=DG165GR.S;if(!S)return;S.gr.forEach(G=>{const i=G.o.i,keep=i===DG165G.K,open=keep?dg165GDone():!!DG165Q.g.bad[i];
  G.body.visible=!open||(!keep&&false);G.hole.visible=open&&!keep;if(keep&&open&&!G.stair){G.stair=dt168Group('DG165|stair168|'+i,k=>dg165StairKit(k,G.o),DG165WX,.04);G.g.add(G.stair);
    const gl=new THREE.PointLight(0x7affb0,1.4,6,1.6);gl.position.set(0,-.8,.4);G.g.add(gl);G.lt=gl;const b=kqSpr(0x5affa0,2.2);b.material=b.material.clone();b.material.opacity=.35;b.position.set(0,-.2,.2);G.g.add(b);G.glow=b}
  if(G.stair)G.stair.visible=keep&&open;if(keep&&open)G.fl.forEach(f=>f.visible=false);
  // the open stair is walkable: its tiles come off the block list
  if(keep&&open&&!G.unb){G.unb=1;G.blk.forEach(q=>CBLK.delete(q))}})}
function dg165GTick(dt,now){const inI=dg165GIn(),t=now/1000;if(inI&&!DG165GR.S)try{dg165GBuild()}catch(e){if(!DG165GR.err++)console.error('v165 graves',e)}
  const S=DG165GR.S;if(!S)return;S.root.visible=inI;dg165LPoolTick(S.pool,S.spots,pl.position,t,inI);if(!inI){DG165GR.dig=null;return}
  dg165FlTick(S.fl.filter(f=>!f.userData.still),t);S.gr.forEach((G,j)=>{if(G.wisp){const open=G.o.i===DG165G.K?dg165GDone():!!DG165Q.g.bad[G.o.i];G.wisp.visible=!open;G.wisp.position.y=2.3+.15*Math.sin(t*1.3+j);G.wisp.material.opacity=.32+.14*Math.sin(t*2.1+j*1.7)}if(G.glow)G.glow.material.opacity=.28+.1*Math.sin(t*2.2);if(G.lt)G.lt.intensity=1.2+.3*Math.sin(t*3.1)});
  const A=SP152.gates.sanctum;if(A&&A.g&&A.g.userData.fl)dg165FlTick(A.g.userData.fl,t);
  // the Keeper's candles: a thin wisp of pale smoke rises from them, straight up, never bending
  const K=S.gr[DG165G.K];if(K&&!dg165GDone()&&Math.random()<dt*3&&Math.hypot(pl.position.x-K.o.x,pl.position.z-K.o.z)<30){const f=K.fl[(Math.random()*K.fl.length)|0];if(f){const p=f.getWorldPosition(new THREE.Vector3());p.y+=.1;burst(p,0xd8ffe8,1,.02,.8,1.2)}}
  if(DG165GR.dig)dg165DigTick(dt,now)}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{dg165GTick(dt,now)}catch(e){if(!DG165GR.err++)console.error('v165 graves tick',e)}return r}}
// ---------------- reading a grave ----------------
var DG165OBS={stone:{slab:'The headstone is a plain, rounded slab',cross:'A stone cross stands at its head',obelisk:'A tall obelisk marks it',broken:'Its headstone is <b>broken in two</b>; the top half lies in the grass'},
  emb:{raven:'a <b>stone raven</b> perches on it, watching the road',skull:'a skull is carved on its face',rose:'a rose is carved on its face',hourglass:'an hourglass is carved on its face',bell:'a little iron bell hangs from it on a cord that runs into the earth'},
  ext:{candles:'<b>Candles</b> burn on the mound',lilies:'Wilted lilies lie on the mound',cage:'An iron cage is locked over the grave',chains:'Rusted chains bind the mound',lantern:'A lantern hangs over it on a crook'}};
function dg165GCard(G){const o=G.o,keep=o.i===DG165G.K;let ext=DG165OBS.ext[o.ext];if(o.ext=='candles')ext+=keep?' · their flames are perfectly still, though the wind blows':' · they gutter in the wind';
  const sp=DG165Q.g.st>=1,hint=sp?'F · Dig up this grave':'You would need a spade to open it — the gravedigger’s lies by the weeping angel at the road’s end';
  dg165CardShow(`<div class="kk">✝ Here lies</div><div class="nm">${o.name}</div><div class="dt">${o.date}</div><div class="ep">“${o.epi}”</div>
    <div class="ob">${DG165OBS.stone[o.stone]}; ${DG165OBS.emb[o.emb]}. ${ext}.</div><div class="hn">${hint}</div>`,o.x,o.z,3.6)}
function dg165AngelCard(s){dg165CardShow(`<div class="kk">🕯 Carved into the plinth</div><div class="ep">“Where the stone lies broken,<br>where the raven keeps its watch,<br>where the candles never die —<br>there the Keeper sleeps<br>above the door below.”</div>
  <div class="ob">A gravedigger’s spade stands in the heap of earth at the angel’s feet. You take it.</div><div class="hn">Find the Keeper’s grave among the graves along the road and dig it up</div>`,s.x,s.z,4.2)}
// ---------------- digging ----------------
function dg165DigStart(G){if(DG165GR.dig||AF)return;if(riding)try{dismount(true)}catch(_){}
  DG165GR.dig={G,t:0,need:3.2,sw:0,hp:hero.hp,x:pl.position.x,z:pl.position.z};dg165CardHide();say('⛏ You start to dig up the grave of '+G.o.name+'…')}
function dg165DigTick(dt,now){const D=DG165GR.dig,G=D.G,o=G.o,P=pl.position;
  if(Math.hypot(P.x-D.x,P.z-D.z)>.6||hero.hp<D.hp-1||Math.hypot(P.x-o.x,P.z-o.z)>3.4){dg165DigStop();say('⛏ You stop digging.');return}
  D.t+=dt;D.sw-=dt;try{face(V(o.x-P.x,0,o.z-P.z).normalize())}catch(_){}
  if(D.sw<=0){D.sw=.55;try{if(!pl.sw)swingAnim((D.n=(D.n||0)+1)%2,320)}catch(_){}setTimeout(()=>{try{dg165Snd('spade',.8,.9+Math.random()*.2);burst(gY(V(o.x+Math.sin(o.ry)*.4,0,o.z+Math.cos(o.ry)*.4),.3),0x3a3026,10,1.8,2.2,.5)}catch(_){}},180)}
  G.body.children.forEach(m=>{m.scale.y=Math.max(.5,1-D.t/D.need*.35)});
  if(D.t>=D.need){DG165GR.dig=null;G.body.children.forEach(m=>m.scale.y=1);dg165DigDone(G,true)}}
function dg165DigStop(){const D=DG165GR.dig;DG165GR.dig=null;if(D)D.G.body.children.forEach(m=>m.scale.y=1)}
function dg165DigDone(G,mine){const o=G.o,keep=o.i===DG165G.K;
  if(keep){if(DG165Q.g.st>=2)return;DG165Q.g.st=2;dg165GSync();dg165Snd('rumble',1,1);shake(.5);dg165Fear(.6);
    for(let i=0;i<40;i++)setTimeout(()=>{try{burst(gY(V(o.x+(Math.random()-.5)*1.6,0,o.z+(Math.random()-.5)*2.4),.2),0x2a241e,4,1.5,2,.6)}catch(_){}},i*40);
    setTimeout(()=>{dg165Snd('choir',.9,1);dg165Title('The Keeper’s Grave','The earth gives way onto a stair going down into the dark','F · Descend into the Hidden Sanctum')},900);
    say('🕯 The earth caves in under your spade: a stone stair leads down beneath the Keeper’s grave.');if(mine)try{dg165Co('dig',o.i)}catch(_){}return}
  if(DG165Q.g.bad[o.i])return;DG165Q.g.bad[o.i]=1;dg165GSync();if(!mine)return;
  // the wrong grave: the lid bursts and its dead climb out
  dg165Snd('splint',1,.8);dg165Snd('scream',.6,.7+Math.random()*.2);shake(.3);dg165Fear(.8);flash('rgba(40,90,60,.35)');
  const lv=dg165Lv(20),n=o.i>=7?3:2,keys=['ghoul','skeleton','ghoul'];
  for(let k=0;k<n;k++)setTimeout(()=>{try{const a=Math.random()*6.283,x=o.x+Math.sin(o.ry)*.3+Math.cos(a)*.8,z=o.z+Math.cos(o.ry)*.3+Math.sin(a)*.8;
    const e=spawnEnemy(keys[k],x,z,lv[1],{agg:1,minion:1});if(e){e.agg=1;e.hunt=1;e.dg165r=1;burst(gY(V(x,0,z),.3),0x3a3026,24,2,3,.8);dg165Snd('gasp',.6,.8)}}catch(err){console.warn('v165 risen',err)}},350+k*420);
  setTimeout(()=>say('☠ Not the Keeper. Something else was sleeping in '+o.name+'’s grave…'),500)}
// ---------------- prompts at the graves ----------------
function dg165GPrompt(){if(!dg165GIn()||!DG165GR.S)return null;const P=pl.position;if(DG165GR.dig){const D=DG165GR.dig;return {label:'⛏ Digging… '+Math.round(D.t/D.need*100)+'%',fn:()=>dg165DigStop()}}
  let best=null,bd=2.7;for(const G of DG165GR.S.gr){const o=G.o,d=Math.hypot(P.x-o.x-Math.sin(o.ry)*1.3,P.z-o.z-Math.cos(o.ry)*1.3);if(d<bd){bd=d;best=G}}
  if(!best)return null;const G=best,o=G.o,keep=o.i===DG165G.K;
  if(keep&&dg165GDone()){if(dg165SDone()){const N=INSL[21];return {label:'F · Take the stair down to '+N.n+' ('+rpTxt139(N.lv[0])+')',fn:()=>insGo(N)}}
    return {label:'F · Descend into the Hidden Sanctum',fn:()=>{try{dg165SEnter()}catch(e){console.error('v165 sanctum enter',e)}}}}
  if(!keep&&DG165Q.g.bad[o.i])return {label:'🪦 The grave of '+o.name+' · dug open, empty now',fn:()=>dg165GCard(G)};
  const seen=DG165Q.g.ex[o.i],open=DG165.card&&Math.abs(DG165.card.x-o.x)<.01&&Math.abs(DG165.card.z-o.z)<.01;
  if(!seen||!open)return {label:'F · Read the grave'+(seen?' of '+o.name:''),fn:()=>{DG165Q.g.ex[o.i]=1;dg165GCard(G);dg165Snd('whisper',.4,.9+Math.random()*.2)}};
  if(DG165Q.g.st<1)return {label:'🪦 You have nothing to dig with · the gravedigger’s spade lies by the angel at the road’s end',fn:()=>dg165GCard(G)};
  return {label:'F · Dig up the grave of '+o.name,fn:()=>dg165DigStart(G)}}
{const f=worldPrompt;worldPrompt=function(){try{const r=dg165GPrompt();if(r)return r}catch(e){if(!DG165GR.err++)console.warn('v165 grave prompt',e)}return f.apply(this,arguments)}}
// ---------------- the angel at the road's end (it replaces the gateway to II) ----------------
sp152Gate('sanctum',{ig:20,r:3.4,build:dg165AngelModel,
  prompt(s){if(dg165SDone()){const N=INSL[21];return {label:'F · Travel on to '+N.n+' ('+rpTxt139(N.lv[0])+')',fn:()=>insGo(N)}}
    return {label:'F · Read the weeping angel',fn:()=>{const first=DG165Q.g.st<1;DG165Q.g.st=Math.max(1,DG165Q.g.st);dg165AngelCard(s);dg165Snd('choir',.6,.9);
      if(first){try{pickup({ic:'⛏',t:'Gravedigger’s Spade',col:'#cfe8dc',sub:'Dig up the Keeper’s grave'})}catch(_){}setTimeout(()=>say('🕯 Read the graves along the road. Only one has all three marks.'),3500)}}}}});
// a dead risen from a wrong grave gives little (the graves are not a farm)
{const f=gw150X;gw150X=function(e){const k=f.apply(this,arguments);return e&&e.dg165r?k*.35:k}}
{const f=lootE;lootE=function(e){if(e&&e.dg165r&&Math.random()>=.3)return;return f.apply(this,arguments)}}
// ---------------- the tracker ----------------
SP152.trk.dirgeI=I=>{if(I.g!==20||dg165SDone())return null;const n=DG165Q.g.ex.filter(Boolean).length,N=dg165GravePlan().G.length;
  if(dg165GDone())return {name:'The Keeper’s Grave',lines:[['The stair beneath the Keeper’s grave'],['Descend into the Hidden Sanctum']]};
  if(DG165Q.g.st<1)return {name:'The Keeper’s Grave',lines:[['Follow the road to its end'],['Read the weeping angel'],['Graves read',n+'/'+N]]};
  return {name:'The Keeper’s Grave',lines:[['Find the Keeper’s grave'],['A broken stone · a raven · undying candles',null,1],['Graves read',n+'/'+N]]}};
// ---------------- the minimap: graves you have read ----------------
function dg165GMarks(g,P,k){if(!dg165GIn())return;dg165GravePlan().G.forEach((o,i)=>{const seen=DG165Q.g.ex[i],keep=i===DG165G.K&&dg165GDone();if(!seen&&!keep)return;const q=P(o.x,o.z);if(!q)return;
  g.save();g.translate(q[0],q[1]);g.scale(k,k);const c=keep?'#7affb0':DG165Q.g.bad[i]?'#6a5a4a':'#c8ccc4';g.fillStyle='#141618';g.fillRect(-3.4,-4.4,6.8,8.8);g.strokeStyle=c;g.lineWidth=1.4/k;
  g.beginPath();g.moveTo(0,-3.4);g.lineTo(0,3.4);g.moveTo(-2.2,-1.2);g.lineTo(2.2,-1.2);g.stroke();g.restore()})}
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){f.apply(this,arguments);try{dg165GMarks(mmX,(x,z)=>{const X=(x-(cx-vw/2)+.5)*w/vw,Y=(z-(cy-vh/2)+.5)*h/vh;return X<-6||Y<-6||X>w+6||Y>h+6?null:[X,Y]},1)}catch(_){}}}
