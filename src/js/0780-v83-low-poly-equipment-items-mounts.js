// ================= v83: low-poly equipment, items and mounts (Valheim style) =================
// Weapons, shields, projectiles, loot drops, treasure chests and the ten mounts are rebuilt with the same
// chunky, flat-shaded, hand-painted look as the low-poly companions: few big facets, colours painted per vertex
// with a little random mottling, worn iron, dark wood and leather wraps; rarity shows as brass fittings and glowing runes.
// Every builder keeps its old API (mkWpn, shotMesh, drop, makeChest, mkMountRig, mountModel), so gameplay is unchanged.

// ---------------- shared baking: rigid parts → 1-3 vertex-coloured meshes (cloth/wood, metal, glow), mottled ----------------
var LGB={},LGM=null;
function lgMats(){if(LGM)return LGM;const f=o=>Object.assign({vertexColors:true,flatShading:true},o);
  LGM={c:new THREE.MeshStandardMaterial(f({roughness:.92,metalness:0,side:THREE.DoubleSide})),
    m:new THREE.MeshStandardMaterial(f({roughness:.5,metalness:.55,envMapIntensity:.7})),
    g:new THREE.MeshBasicMaterial({vertexColors:true}),
    cs:new THREE.MeshStandardMaterial(f({roughness:.92,metalness:0,skinning:true,side:THREE.DoubleSide})),
    ms:new THREE.MeshStandardMaterial(f({roughness:.5,metalness:.55,skinning:true}))};
  [LGM.c,LGM.m,LGM.g,LGM.cs,LGM.ms].forEach(m=>m.userData.lps=1);return LGM}
// P = dkKit parts; mot = mottling strength (0 = flat colour); returns fresh meshes over cached geometry
function lgBake(P,key,mot){
  let gs=LGB[key];
  if(!gs){gs={};const by={},R=dkRng(key.length*131+7),v=new THREE.Vector3(),c=new THREE.Color(),nm=new THREE.Matrix3();mot=mot==null?.16:mot;
    P.forEach(p=>(by[p.t]=by[p.t]||[]).push(p));
    for(const t in by){const pos=[],nor=[],col=[],idx=[];let off=0;
      by[t].forEach(p=>{const g=p.geo,pa=g.attributes.position,na=g.attributes.normal,n=pa.count;c.set(p.col);nm.getNormalMatrix(p.m);
        for(let i=0;i<n;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);pos.push(v.x,v.y,v.z);const px=v.x,py=v.y,pz=v.z;
          if(na){v.fromBufferAttribute(na,i).applyMatrix3(nm).normalize();nor.push(v.x,v.y,v.z)}else nor.push(0,1,0);v.set(px,py,pz);
          const hh=Math.sin(Math.round(v.x*500)*12.9898+Math.round(v.y*500)*78.233+Math.round(v.z*500)*37.719+key.length)*43758.5453,f=t=='g'?1:1-mot/2+(hh-Math.floor(hh))*mot;col.push(c.r*f,c.g*f,c.b*f)}
        if(g.index){const ix=g.index.array;for(let i=0;i<ix.length;i++)idx.push(ix[i]+off)}else for(let i=0;i<n;i++)idx.push(i+off);off+=n});
      const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
      G.setAttribute('color',new THREE.Float32BufferAttribute(col,3));G.setIndex(idx);G.computeBoundingSphere();G.userData.lps=1;gs[t]=G}
    LGB[key]=gs}
  const M=lgMats();return Object.keys(gs).map(t=>{const m=new THREE.Mesh(gs[t],M[t]);m.castShadow=t!='g';m.receiveShadow=t!='g';return m})}
function lgGroup(key,build,mot){const g=new THREE.Group();lgBake(LGB[key]?[]:(()=>{const k=dkKit();build(k);return k.P})(),key,mot).forEach(m=>g.add(m));return g}
const lgCol=(a,b,t)=>new THREE.Color(a).lerp(new THREE.Color(b),t).getHex();

// ---------------- custom low-poly shapes ----------------
var LGG={};
function lgGeoC(k,f){return LGG[k]||(LGG[k]=f())}
function lgIdx(P,I){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);const n=g.toNonIndexed();n.computeVertexNormals();return n}
// diamond-section blade hanging down from y=0: widths at base / middle / end, then a point; tx shifts the point (single-edged seax)
function lgBlade(len,w0,wm,w1,tip,th,tx){return lgGeoC(['bl',len,w0,wm,w1,tip,th,tx||0].join('_'),()=>{
  const P=[],I=[],ys=[0,-len*.45,-len],ws=[w0,wm,w1];ys.forEach((y,i)=>{const w=ws[i],o=(tx||0)*i/2*.5;P.push(-w+o,y,0,o,y,th,w+o,y,0,o,y,-th)});P.push(tx||0,-len-tip,0);
  for(let i=0;i<2;i++)for(let k=0;k<4;k++){const a=i*4+k,b=i*4+(k+1)%4;I.push(a,a+4,b,b,a+4,b+4)}
  for(let k=0;k<4;k++)I.push(8+k,12,8+(k+1)%4);I.push(0,1,2,0,2,3);return lgIdx(P,I)})}
// flat polygon (xy) extruded to thickness d, centred on z
function lgSlab(key,pts,d){return lgGeoC('sl'+key,()=>{const sh=new THREE.Shape();sh.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(p=>sh.lineTo(p[0],p[1]));sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false,curveSegments:1});g.translate(0,0,-d/2);g.computeVertexNormals();return g})}
// chunky lumpy rock / crystal from an icosahedron with jittered corners
function lgLump(key,r,j,seed){return lgGeoC('lu'+key,()=>{const g=new THREE.IcosahedronGeometry(r,0),pa=g.attributes.position,R=dkRng(seed||3),mp={};
  for(let i=0;i<pa.count;i++){const k=[pa.getX(i),pa.getY(i),pa.getZ(i)].map(v=>v.toFixed(3)).join();const f=mp[k]||(mp[k]=1+(R()-.5)*j);pa.setXYZ(i,pa.getX(i)*f,pa.getY(i)*f,pa.getZ(i)*f)}
  g.computeVertexNormals();return g})}

// ---------------- weapons (grip at origin, blade/head pointing down -y, same footprint as before) ----------------
var LGW={iron:0x4a4e56,iron2:0x6c7078,dark:0x23252a,wood:0x5c3f27,woodD:0x3b2919,leather:0x4f3120,wrap:0x2c1b11,brass:0x9a7838,bone:0xc6b998,steel:0x8a9099};
function lgWpnKit(k,type,col,r){
  const W=LGW,steel=col==0x9aa2ae?W.steel:lgCol(W.steel,col,.42),edge=lgCol(steel,0xffffff,.28),fit=r>=2?W.brass:W.iron,fit2=r>=2?0x6a5428:W.dark,gl=r>=3?col:null;
  const wrapGrip=(y0,len,r0)=>{k.p('','cyl','c',W.woodD,0,y0-len/2,0,r0,len,r0);const n=Math.max(3,Math.round(len/.035));for(let i=0;i<n;i++)k.p('','cyl','c',i%2?W.wrap:W.leather,0,y0-.012-i*len/n,0,r0+.006,len/n*.62,r0+.006,0,i*.3)};
  const runes=(y0,y1,z)=>{if(!gl)return;const n=r>=4?4:3;for(let i=0;i<n;i++){const y=y0+(y1-y0)*(i+.5)/n;[-1,1].forEach(s=>k.p('','box','g',gl,0,y,s*z,.012,.04,.006,0,0,i%2?.5:-.5))}};
  const pommel=(y,s)=>{k.p('','oct','m',fit,0,y,0,s,s*1.15,s);if(r>=4)k.p('','oct','g',col,0,y+s*.9,0,s*.45)};
  const haft=(y0,y1,rad,dark)=>{const R=dkRng(Math.round(y0*100)+9);let p=[0,y0,0];const n=Math.max(2,Math.round((y0-y1)/.3));for(let i=1;i<=n;i++){const q=[(R()-.5)*.012,y0+(y1-y0)*i/n,(R()-.5)*.012];k.L('','c',dark?W.woodD:W.wood,p,q,rad*(1+(R()-.5)*.15),rad*(1+(R()-.5)*.15),6);p=q}};
  if(type=='sword'){wrapGrip(.08,.17,.03);pommel(.11,.038);
    k.p('','box','m',fit,0,-.095,0,.18,.034,.05);[-1,1].forEach(s=>k.p('','cone4','m',fit,s*.105,-.085,0,.026,.06,.02,0,0,-s*1.25));
    k.p('',lgBlade(.66,.04,.052,.034,.15,.012),'m',steel,0,-.11,0,1,1,1);k.p('','box','m',lgCol(steel,0x000000,.45),0,-.38,0,.012,.42,.026);runes(-.18,-.55,.014)}
  else if(type=='gs'){wrapGrip(.21,.32,.036);pommel(.245,.05);
    k.p('','box','m',fit,0,-.14,0,.36,.05,.07);[-1,1].forEach(s=>{k.p('','cone4','m',fit,s*.21,-.12,0,.034,.1,.026,0,0,-s*1.15);k.p('','cone4','m',fit2,s*.07,-.19,0,.02,.08,.02,Math.PI,0,s*.35)});
    k.p('','box','m',fit2,0,-.21,0,.1,.09,.03);k.p('',lgBlade(.9,.062,.078,.05,.2,.016),'m',steel,0,-.2,0,1,1,1);k.p('','box','m',lgCol(steel,0x000000,.5),0,-.6,0,.016,.66,.034);
    [-1,1].forEach(s=>k.p('','cone4','m',edge,s*.074,-.36,0,.012,.05,.01,0,0,-s*1.9));runes(-.3,-.85,.018)}
  else if(type=='axe'||type=='ga'){const big=type=='ga',y=big?-.78:-.62,top=big?.15:.05,bot=big?-.88:-.74;haft(top,bot,.032);
    for(let i=0;i<3;i++)k.p('','cyl','c',i%2?W.wrap:W.leather,0,top-.04-i*.04,0,.037,.03,.037);k.p('','oct','m',W.iron,0,bot-.02,0,.04,.05,.04);
    const hd=lgSlab('axe',[[0,.07],[.1,.075],[.235,.19],[.29,.03],[.27,-.21],[.13,-.13],[.04,-.085],[0,-.07]],.032),sc=big?1.05:.86;
    k.p('',hd,'m',lgCol(W.iron,steel,.5),.025,y,0,sc,sc,1);k.p('',lgSlab('axeE',[[.235,.19],[.29,.03],[.27,-.21],[.245,-.19],[.262,.03],[.215,.16]],.036),'m',edge,.025,y,0,sc,sc,1);
    k.p('','box','m',W.iron,0,y,0,.075,.17*sc,.055);k.p('','box','m',fit,0,y+.09*sc,0,.08,.025,.06);if(gl)k.p('','box','g',gl,.12*sc,y,0,.04,.04,.04,0,0,.78);
    if(big){k.p('',hd,'m',lgCol(W.iron,steel,.5),-.025,y,0,-sc,sc,1);k.p('',lgSlab('axeE',null,.036),'m',edge,-.025,y,0,-sc,sc,1);if(gl)k.p('','box','g',gl,-.12*sc,y,0,.04,.04,.04,0,0,.78)}
    else k.p('','cone4','m',W.iron,-.09,y,0,.032,.13,.032,0,0,Math.PI/2)}
  else if(type=='mace'){haft(.05,-.62,.03);for(let i=0;i<4;i++)k.p('','cyl','c',i%2?W.wrap:W.leather,0,.0-i*.035,0,.035,.028,.035,0,i*.4);pommel(.06,.036);
    k.p('','cyl','m',W.iron,0,-.6,0,.045,.08,.045);k.p('','oct','m',W.iron2,0,-.73,0,.07,.13,.07);
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.p('',lgSlab('flange',[[0,.1],[.05,.07],[.07,-.02],[.03,-.1],[0,-.11]],.022),'m',i%2?steel:lgCol(steel,0,.2),Math.cos(a)*.045,-.73,Math.sin(a)*.045,1,1,1,0,-a,0)}
    k.p('','cone4','m',W.iron2,0,-.88,0,.026,.09,.026,Math.PI);if(gl)k.p('','oct','g',gl,0,-.73,0,.04,.075,.04)}
  else if(type=='club'){const R=dkRng(5);let p=[0,.06,0];for(let i=0;i<4;i++){const q=[(R()-.5)*.03,-.15-i*.17,(R()-.5)*.03];k.L('','c',i<1?W.woodD:0x4a3420,p,q,.034+i*.02,.044+i*.022,6);p=q}
    for(let i=0;i<5;i++)k.p('','dod','c',0x3a2a1a,(R()-.5)*.12,-.35-R()*.3,(R()-.5)*.12,.035);
    for(let i=0;i<9;i++){const a=R()*6.28,y=-.4-R()*.3;k.p('','cone4','m',W.iron2,Math.cos(a)*.09,y,Math.sin(a)*.09,.014,.08,.014,Math.sin(a)*1.4,0,-Math.cos(a)*1.4)}
    k.p('','cyl','m',W.iron,0,-.3,0,.07,.04,.07);k.p('','cyl','c',W.wrap,0,0,0,.036,.12,.036)}
  else if(type=='hammer'){haft(.08,-.6,.035,true);[.0,-.18].forEach(q=>k.p('','cyl','m',W.iron,0,q,0,.043,.03,.043));for(let i=0;i<3;i++)k.p('','cyl','c',W.leather,0,.06-i*.03,0,.04,.02,.04);
    const H=lgCol(W.iron,col==0x9aa2ae?W.iron:col,.25);k.p('','box','m',H,0,-.74,0,.36,.2,.2);[-1,1].forEach(s=>{k.p('','box','m',lgCol(H,0,.25),s*.2,-.74,0,.05,.24,.24);k.p('','box','m',W.iron2,s*.2,-.74,0,.058,.08,.25)});
    k.p('','box','m',fit,0,-.74,0,.16,.22,.215);k.p('','cone4','m',W.iron2,0,-.88,0,.04,.1,.04,Math.PI,Math.PI/4);
    if(gl)[-1,1].forEach(s=>k.p('','box','g',gl,0,-.74,s*.11,.1,.03,.008));else[-1,1].forEach(s=>k.p('','box','c',W.dark,0,-.74,s*.109,.1,.02,.006))}
  else if(type=='dagger'){wrapGrip(.06,.12,.024);pommel(.075,.026);k.p('','box','m',fit,0,-.075,0,.11,.026,.04);
    k.p('',lgBlade(.3,.03,.036,.026,.09,.009,.022),'m',steel,0,-.085,0,1,1,1);k.p('','box','m',lgCol(steel,0,.45),-.006,-.2,0,.008,.18,.02);if(gl)k.p('','box','g',gl,-.006,-.2,0,.01,.06,.022)}
  else if(type=='claws'){k.p('','box','c',W.leather,0,.02,0,.1,.15,.085);[-.04,.04].forEach(y=>k.p('','box','c',W.wrap,0,.02+y,0,.108,.02,.092));k.p('','box','m',W.iron,0,-.06,0,.115,.05,.095);
    [-.035,0,.035].forEach((x,i)=>{const d=i==1?.03:0;k.L('','m',steel,[x,-.07,0],[x*1.4,-.3-d,.035],.014,.008,4);k.L('','m',edge,[x*1.4,-.3-d,.035],[x*1.6,-.43-d,.1],.008,.002,4)});if(gl)k.p('','box','g',gl,0,-.06,.05,.05,.02,.006)}
  else if(type=='halberd'){haft(.3,-1.4,.03,true);[.12,-.2,-1.1].forEach(q=>k.p('','cyl','m',W.iron,0,q,0,.037,.04,.037));for(let i=0;i<4;i++)k.p('','cyl','c',W.leather,0,.04-i*.035,0,.036,.025,.036);
    k.p('',lgSlab('halb',[[0,.12],[.14,.14],[.3,.27],[.27,0],[.31,-.2],[.13,-.1],[0,-.1]],.026),'m',lgCol(W.iron,steel,.5),.02,-1.28,0,1,1,1);
    k.p('',lgSlab('halbE',[[.3,.27],[.27,0],[.31,-.2],[.285,-.18],[.25,0],[.275,.23]],.03),'m',edge,.02,-1.28,0,1,1,1);
    k.p('','cone4','m',W.iron2,-.11,-1.28,0,.03,.18,.03,0,0,Math.PI/2);k.p('',lgBlade(.08,.03,.04,.03,.24,.012),'m',steel,0,-1.38,0,1,1,1);k.p('','box','m',W.iron,0,-1.33,0,.065,.18,.05);if(gl)k.p('','box','g',gl,.14,-1.28,0,.035,.035,.034,0,0,.78)}
  else if(type=='flail'){haft(.08,-.28,.032,true);for(let i=0;i<4;i++)k.p('','cyl','c',i%2?W.wrap:W.leather,0,.04-i*.04,0,.037,.03,.037,0,i*.4);k.p('','oct','m',W.iron2,0,-.29,0,.04);
    for(let i=0;i<5;i++)k.p('','ring','m',W.iron,0,-.34-i*.07,0,.028,.6,.028,0,i%2?Math.PI/2:0,Math.PI/2);
    k.p('',lgLump('flb',.1,.12,4),'m',lgCol(W.iron,col==0x9aa2ae?W.iron:col,.3),0,-.76,0,1,1,1);
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2,y=i%2?.05:-.05;k.p('','cone4','m',W.iron2,Math.cos(a)*.1,-.76+y,Math.sin(a)*.1,.022,.09,.022,Math.sin(a)*1.57,0,-Math.cos(a)*1.57)}
    k.p('','cone4','m',W.iron2,0,-.88,0,.022,.09,.022,Math.PI);if(gl)k.p('','ring','g',gl,0,-.76,0,.105,.15,.105)}
  else if(type=='staff'){const R=dkRng(11);let p=[0,.55,0];for(let i=0;i<5;i++){const q=[(R()-.5)*.05,.55-(i+1)*.29,(R()-.5)*.05];k.L('','c',i%2?W.woodD:0x33251a,p,q,.03,.035,6);if(i%2)k.p('','dod','c',W.woodD,q[0],q[1],q[2],.042);p=q}
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4,c=[Math.cos(a)*.03,-.92,Math.sin(a)*.03],t=[Math.cos(a)*.1,-1.05,Math.sin(a)*.1],tt=[Math.cos(a)*.035,-1.17,Math.sin(a)*.035];k.L('','c',0x33251a,c,t,.022,.016,5);k.L('','c',W.bone,t,tt,.015,.003,4)}
    [0,1,2].forEach(i=>k.p('','cyl','m',W.brass,0,-.7-i*.045,0,.04,.022,.04));for(let i=0;i<3;i++)k.L('','c',W.leather,[0,-.2-i*.05,0],[.06,-.32-i*.07,.02],.012,.006,4);
    k.p('','oct','g',col,0,-1.06,0,.06,.11,.06);k.p('','oct','g',lgCol(col,0xffffff,.5),0,-1.06,0,.03,.06,.03)}
  else if(type=='wand'){k.L('','c',W.bone,[0,.12,0],[0,-.1,0],.02,.016,6);k.L('','c',lgCol(W.bone,0x5a4a30,.4),[0,-.1,0],[0,-.36,0],.016,.01,6);[.02,-.06,-.14].forEach(q=>k.p('','cyl','m',W.brass,0,q,0,.023,.018,.023));
    for(let i=0;i<3;i++){const a=i/3*Math.PI*2;k.L('','m',W.brass,[0,-.33,0],[Math.cos(a)*.03,-.4,Math.sin(a)*.03],.006,.004,4)}k.p('','oct','g',col==0x9aa2ae?0x7ae0ff:col,0,-.42,0,.032,.055,.032)}
  else if(type=='orb'){const gc=col==0x9aa2ae?0x9a7aff:col;k.p('',lgLump('orb',.12,.06,7),'g',gc,0,0,0,1,1,1);k.p('','oct','g',lgCol(gc,0xffffff,.6),0,0,0,.05);
    [0,1,2].forEach(i=>{const a=i/3*Math.PI*2;k.L('','m',W.brass,[Math.cos(a)*.05,-.15,Math.sin(a)*.05],[Math.cos(a)*.13,0,Math.sin(a)*.13],.014,.009,4);k.L('','m',W.brass,[Math.cos(a)*.13,0,Math.sin(a)*.13],[Math.cos(a)*.07,.1,Math.sin(a)*.07],.009,.003,4)});
    k.p('','cyl','m',W.brass,0,-.14,0,.065,.04,.065);k.p('','cone4','c',W.woodD,0,-.2,0,.05,.08,.05,Math.PI)}
  else if(type=='bow'){const pts=[];for(let i=0;i<=10;i++){const a=Math.PI*(.55+i*.09),rr=.55+(i==0||i==10?.04:0),rc=(i==0||i==10)?.03:0;pts.push([Math.cos(a)*rr+rc,Math.sin(a)*rr*1.02,0])}
    for(let i=0;i<10;i++){const g=i>3&&i<6,w=i==0||i==9?.013:i==1||i==8?.019:.024;k.L('',g?'c':'c',g?W.leather:(i%2?0x4a3018:0x3e2814),pts[i],pts[i+1],w,w,5)}
    [pts[0],pts[10]].forEach((q,i)=>k.L('','c',W.bone,q,[q[0]+.06,q[1]+(i?-.07:.07),0],.015,.003,4));k.p('','box','m',fit,-.555,0,0,.035,.04,.035);
    k.L('','c',0xd8d0b8,[pts[0][0]+.004,pts[0][1],0],[-.08,0,0],.004,.004,3);k.L('','c',0xd8d0b8,[-.08,0,0],[pts[10][0]+.004,pts[10][1],0],.004,.004,3);if(gl)[-1,1].forEach(s=>k.p('','box','g',gl,-.54,s*.2,0,.01,.05,.03,0,0,s*.3))}
  else if(type=='crossbow'){k.p('','box','c',W.wood,0,-.22,0,.065,.62,.055);k.p('','box','c',W.woodD,0,.1,0,.055,.14,.085);k.p('','box','c',W.woodD,0,-.06,0,.07,.06,.06);k.p('','box','m',W.iron,0,-.06,.04,.025,.1,.02);
    k.p('','box','m',fit,0,-.5,0,.14,.06,.07);[-1,1].forEach(s=>{k.L('','m',lgCol(W.iron,steel,.4),[s*.05,-.5,0],[s*.33,-.44,0],.022,.014,4);k.p('','cone4','m',W.iron2,s*.335,-.44,0,.012,.03,.012,0,0,-s*1.4)});
    k.L('','c',0xd8d0b8,[-.33,-.44,0],[0,-.28,0],.004,.004,3);k.L('','c',0xd8d0b8,[.33,-.44,0],[0,-.28,0],.004,.004,3);
    k.L('','c',W.woodD,[0,-.26,.03],[0,-.62,.03],.008,.008,4);k.p('','cone4','m',W.iron2,0,-.66,.03,.018,.07,.018,Math.PI);if(gl)k.p('','box','g',gl,0,-.22,.03,.02,.12,.006)}
  else if(type=='sling'){k.L('','c',0x5a4a32,[0,0,0],[.02,-.4,0],.01,.01,4);k.L('','c',0x5a4a32,[-.02,0,0],[-.02,-.4,0],.008,.008,4);k.p('','box','c',W.leather,0,.01,0,.04,.05,.03);
    k.p('','hem','c',W.leather,0,-.4,0,.06,.05,.045,Math.PI);k.p('',lgLump('stone',.04,.25,2),'c',0x6a6a66,0,-.41,.0,1,1,1)}
  else if(type=='shield'){// round, banded wooden shield with an iron rim and boss
    const Rr=.47,n=6,paint=col==0x7a6a50||col==0x8a8a96?0x6a1a1a:col;
    for(let i=0;i<n;i++){const x0=-Rr+i*2*Rr/n,x1=x0+2*Rr/n,xm=(x0+x1)/2,hh=Math.sqrt(Math.max(0,Rr*Rr-Math.max(x0*x0,x1*x1)))+.012,c=(i+1)%3==0?W.woodD:i%2?0x6a4a2c:W.wood;
      k.p('','box','c',c,xm,.0,0,2*Rr/n-.006,hh*2,.04);if(i>=n/2)k.p('','box','c',lgCol(paint,0x000000,.12),xm,0,.021,2*Rr/n-.004,hh*2-.03,.004);else k.p('','box','c',lgCol(paint,0x000000,.12),xm,0,-.021,2*Rr/n-.004,hh*2-.03,.004)}
    k.p('',lgGeoC('srim',()=>new THREE.TorusGeometry(Rr,.036,4,14)),'m',fit,0,0,0,1,1,1.3);
    [-1,1].forEach(s=>{k.p('','hem','m',W.iron2,0,0,s*.02,.12,.08,.12,s*Math.PI/2);k.p('','cyl','m',fit,0,0,s*.024,.135,.012,.135,Math.PI/2);
      [-1,1].forEach(q=>k.p('','box','m',W.iron,q*.27,0,s*.024,.22,.045,.01))});
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2;[-1,1].forEach(s=>k.p('','oct','m',W.iron2,Math.cos(a)*(Rr-.035),Math.sin(a)*(Rr-.035),s*.026,.014))}
    k.p('','box','c',W.leather,0,0,-.05,.06,.3,.02);if(gl)[-1,1].forEach(s=>k.p('','ring','g',gl,0,0,s*.04,.17,.12,.17,Math.PI/2))}
  else k.p('',lgBlade(.6,.04,.05,.03,.1,.012),'m',steel,0,-.05,0,1,1,1);
}
mkWpn=function(type,col,r){
  const t=type=='axes'?'axe':type=='knives'?'dagger':type;r=r||0;
  const g=lgGroup('LW|'+t+'|'+col+'|'+r,k=>lgWpnKit(k,t,col,r),.18);g.userData.wt=type;return g};

// ---------------- projectiles: low-poly arrows and glowing shards ----------------
var LGSH={};
function shotMesh(col,arrow){
  if(!arrow){const g=LGSH['o'+col]||(LGSH['o'+col]=lgLump('shot',.13,.2,5));const m=new THREE.Mesh(g,addMat(col));m.userData.lpsSkip=1;return m}
  return lgGroup('LSA',k=>{k.L('','c',0xb89a6a,[0,0,-.4],[0,0,.38],.016,.016,4);k.p('','cone4','m',0x6c7078,0,0,.44,.034,.11,.012,Math.PI/2,0,0);
    [0,1,2].forEach(i=>{const a=i/3*Math.PI*2;k.p('',lgSlab('flt',[[0,0],[.05,.04],[.05,.14],[0,.17]],.002),'c',i?0xd8d0c0:0x8a2a1a,Math.cos(a)*.012,Math.sin(a)*.012,-.36,1,1,1,Math.PI/2,0,a+Math.PI/2)})},.1)}

// ---------------- loot drops: the actual thing lies there, slowly turning ----------------
function lgDropKit(k,kind,data,r){
  const rc=parseInt(RAR[Math.max(0,Math.min(RAR.length-1,r|0))][1].slice(1),16);
  if(kind=='egg'||kind=='megg'){k.p('',lgGeoC('egg',()=>{const g=new THREE.SphereGeometry(1,7,6);const pa=g.attributes.position;for(let i=0;i<pa.count;i++){const y=pa.getY(i);pa.setY(i,y*(y>0?1.35:1.05))}g.computeVertexNormals();return g}),'c',lgCol(0xd8ccb0,rc,.45),0,0,0,.14,.14,.14);
    const R=dkRng(9);for(let i=0;i<9;i++){const a=R()*6.28,y=(R()-.4)*.25;k.p('','box','c',lgCol(rc,0,.35),Math.cos(a)*.14*(1-Math.abs(y)*1.4),y,Math.sin(a)*.14*(1-Math.abs(y)*1.4),.035,.03,.035,0,-a,0)}}
  else if(kind=='potion'){k.p('',lgGeoC('flask',()=>new THREE.CylinderGeometry(.07,.11,.17,6)),'c',0x8a1a1e,0,-.04,0,1,1,1);k.p('','sph','c',0xc02a2a,0,.0,0,.1,.08,.1);k.p('','cyl','c',0x9ab0b0,0,.09,0,.035,.08,.035);
    k.p('','cyl','c',0x7a5a3a,0,.14,0,.04,.04,.04);k.p('','cyl','c',W2().leather,0,.075,0,.045,.015,.045)}
  else if(kind=='mat'){k.p('',lgGeoC('sack',()=>{const g=new THREE.SphereGeometry(1,7,5);const pa=g.attributes.position,R=dkRng(4);for(let i=0;i<pa.count;i++){const y=pa.getY(i);pa.setXYZ(i,pa.getX(i)*(1+(R()-.5)*.15),y*(y>0?.8:.7),pa.getZ(i)*(1+(R()-.5)*.15))}g.computeVertexNormals();return g}),'c',0x7a6248,0,-.04,0,.15,.15,.15);
    k.p('','cyl','c',0x4a3a26,0,.09,0,.05,.05,.05);k.p('','cone','c',0x7a6248,0,.15,0,.07,.08,.07,Math.PI);k.p('','ring','c',0x3a2a1a,0,.09,0,.055,.3,.055)}
  else if(kind=='item'){k.p('','box','c',0x7a5a3a,0,0,0,.24,.18,.2);k.p('','box','c',0x4a3420,0,0,0,.25,.04,.21);k.p('','box','c',0xb8a070,0,0,0,.035,.19,.215);k.p('','box','c',0xb8a070,0,0,0,.245,.19,.035);k.p('','oct','g',rc,0,.11,0,.04)}
  else if(kind=='sup'){k.p('',lgLump('rune',.13,.18,11),'c',0x5a5a62,0,0,0,1,.75,.55);k.p('','box','g',rc,0,.0,.07,.02,.12,.01);k.p('','box','g',rc,0,.03,.072,.08,.02,.01,0,0,.6)}
  else if(kind=='gear'){let t=null;try{t=itT(data)}catch(e){}const sl=(t&&t.sl)||(data&&data.sl)||'weapon',iron=0x5a5e66,trim=r>=2?0x9a7838:0x3a3c42;
    if(sl=='helm'){k.p('','hem','m',iron,0,0,0,.14,.13,.15);k.p('','cyl','m',trim,0,0,0,.15,.03,.16);k.p('','box','m',trim,0,-.05,.14,.025,.13,.02);[-1,1].forEach(s=>k.p('','box','m',iron,s*.1,-.06,.03,.025,.1,.12))}
    else if(sl=='chest'||sl=='armor'){k.p('','tor','m',iron,0,0,0,.2,.26,.14);k.p('','box','m',trim,0,.02,.13,.03,.22,.02);[-1,1].forEach(s=>k.p('','hem','m',trim,s*.19,.1,0,.08,.06,.09,0,0,s*.4));k.p('','box','c',0x4a3020,0,-.13,0,.2,.04,.14)}
    else if(sl=='boots'){[-1,1].forEach(s=>{k.p('','box','c',0x4a3020,s*.07,-.08,.03,.08,.06,.16);k.L('','c',0x4a3020,[s*.07,-.06,0],[s*.07,.08,-.01],.05,.055,6);k.p('','cyl','m',trim,s*.07,.08,-.01,.06,.025,.06)})}
    else if(sl=='amulet'||sl=='charm'){k.p('','ring','m',0x9a7838,0,.05,0,.12,.4,.12,Math.PI/2);k.p('','oct','g',rc,0,-.08,0,.05,.07,.04);k.p('','box','m',0x9a7838,0,-.08,0,.07,.03,.02)}
    else if(sl=='ring'){k.p('','ring','m',0x9a7838,0,0,0,.08,.9,.08,Math.PI/2);k.p('','oct','g',rc,0,.085,0,.035)}
    else if(sl=='offhand'){lgWpnKit(k,'shield',rc,r)}
    else{const wt=(t&&t.wt)||'sword';lgWpnKit(k,wt=='axes'?'axe':wt=='knives'?'dagger':wt,r>=2?rc:0x9aa2ae,r)}}
  else k.p('','oct','g',rc,0,0,0,.16,.18,.16);
}
function W2(){return LGW}
function lgDropModel(kind,data,r){
  let t=null;try{t=kind=='gear'?itT(data):null}catch(e){}
  const key='LD|'+kind+'|'+(kind=='gear'?((t&&(t.sl+'.'+(t.wt||'')))||(data&&data.sl)||'w'):'')+'|'+(r|0),g=new THREE.Group();
  const inner=lgGroup(key,k=>lgDropKit(k,kind,data,r),.14);g.add(inner);
  // weapons and shields lie tilted so they read at a glance; sizes are normalised to about the old gem
  inner.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(inner),sz=bb.getSize(new THREE.Vector3()),mx=Math.max(sz.x,sz.y,sz.z)||1,tgt=kind=='gear'?.62:kind=='megg'?.55:.4;
  if(mx>tgt)inner.scale.setScalar(tgt/mx);const c=bb.getCenter(new THREE.Vector3()).multiplyScalar(inner.scale.x);inner.position.sub(c);
  if(kind=='gear'&&sz.y>sz.x*1.6)g.rotation.z=.75;return g}
{const f=drop;drop=function(kind,data,p,r){const n=drops.length,res=f.apply(this,arguments);
  try{for(let i=n;i<drops.length;i++){const d=drops[i];if(d.lg)continue;d.lg=1;const m=lgDropModel(d.kind,d.data,r);m.position.copy(d.gem.position);d.g.remove(d.gem);d.g.add(m);d.gem=m;
    d.g.children.forEach(o=>{if(o!==m&&o.geometry&&o.geometry.type=='CylinderGeometry'){o.scale.set(.75,1,.75)}})}}catch(e){console.warn('lp drop',e)}
  return res}}

// ---------------- treasure chests: iron-banded wooden chest with a domed lid ----------------
function lgChestKit(k,lidOnly,baseOnly){const wd=0x5e3e22,wd2=0x6e4a2a,dk=0x3a2616,ir=0x3e4048,ir2=0x5c6068,gd=0xc8a038;
  if(!lidOnly){for(let i=0;i<4;i++)k.p('','box','c',i%2?wd:wd2,0,.0825+i*.165,0,1.08,.16,.7);[-1,1].forEach(s=>{k.p('','box','c',dk,s*.54,.32,0,.04,.64,.72);[-1,1].forEach(q=>k.p('','box','m',ir,s*.5,.32,q*.34,.08,.66,.05))});
    [-.3,.3].forEach(x=>k.p('','box','m',ir2,x,.32,0,.07,.66,.73));k.p('','box','m',gd,0,.52,.37,.16,.18,.04);k.p('','box','c',0x0a0806,0,.5,.39,.03,.06,.01);
    [-1,1].forEach(s=>k.p('','ring','m',ir2,s*.56,.42,0,.07,.4,.07,0,0,Math.PI/2))}
  if(!baseOnly){const y=lidOnly?0:.66,cyl=lgGeoC('lid',()=>{const g=new THREE.CylinderGeometry(.36,.36,1.1,6,1,false,0,Math.PI);g.rotateZ(Math.PI/2);return g});
    k.p('',cyl,'c',wd2,0,y,0,1,.55,1);[-.3,.3,-.54,.54].forEach(x=>k.p('',lgGeoC('lidb',()=>{const g=new THREE.CylinderGeometry(.375,.375,.07,6,1,false,0,Math.PI);g.rotateZ(Math.PI/2);return g}),'m',ir2,x,y,0,1,.56,1));
    k.p('','box','m',gd,0,y+.02,.37,.12,.1,.03)}}
{const f=makeChest;makeChest=function(){const c=f.apply(this,arguments);try{const g=c.g;g.children.slice().forEach(o=>{if(!(o.material&&o.material.transparent))g.remove(o)});
  const m=lgGroup('LCH',k=>lgChestKit(k),.14);g.add(m);g.children.forEach(o=>{if(o.material&&o.material.transparent&&o.geometry.type=='CylinderGeometry')o.scale.set(.85,1,.85)})}catch(e){console.warn('lp chest',e)}return c}}
// dungeon chest: children[0] body, children[1] lid (the open animation turns children[1])

