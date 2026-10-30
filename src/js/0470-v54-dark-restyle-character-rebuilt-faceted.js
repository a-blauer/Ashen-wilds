// ================= v54: dark restyle — every character rebuilt in a faceted, grim low-poly style =================
// Everything here is hoisted functions + lazily-created vars, because towns/heroes are built before this code runs.
var DKM,DKG,DKBK,DKT,DKC0;
function dkM(){if(DKM)return DKM;const f=o=>Object.assign({vertexColors:true,flatShading:true},o);
  DKM={c:new THREE.MeshStandardMaterial(f({roughness:.9,metalness:.04,skinning:true,side:THREE.DoubleSide})),m:new THREE.MeshStandardMaterial(f({roughness:.4,metalness:.62,skinning:true})),g:new THREE.MeshBasicMaterial({vertexColors:true,skinning:true}),
    sc:new THREE.MeshStandardMaterial(f({roughness:.9,metalness:.04,side:THREE.DoubleSide})),sm:new THREE.MeshStandardMaterial(f({roughness:.4,metalness:.62})),sg:new THREE.MeshBasicMaterial({vertexColors:true})};
  return DKM}
function dkG(){if(DKG)return DKG;
  const hood=(()=>{const p=[];for(let i=0;i<=8;i++){const t=i/8;p.push(new THREE.Vector2(Math.max(.02,Math.sin(t*Math.PI*.96)*(1-t*.32)),t))}return new THREE.LatheGeometry(p,10,.62,Math.PI*2-1.24)})();
  DKG={box:new THREE.BoxGeometry(1,1,1),sph:new THREE.SphereGeometry(1,7,5),sph2:new THREE.SphereGeometry(1,10,7),hem:new THREE.SphereGeometry(1,9,4,0,Math.PI*2,0,Math.PI/2),
    cone:new THREE.ConeGeometry(1,1,6),cone4:new THREE.ConeGeometry(1,1,4),cyl:new THREE.CylinderGeometry(1,1,1,8),oct:new THREE.OctahedronGeometry(1),ico:new THREE.IcosahedronGeometry(1,0),dod:new THREE.DodecahedronGeometry(1,0),
    tor:new THREE.CylinderGeometry(1,.82,1,8),skirt:new THREE.CylinderGeometry(.55,1,1,11,1,true),tube:new THREE.CylinderGeometry(1,1,1,9,1,true),
    ring:new THREE.TorusGeometry(1,.12,4,12).rotateX(Math.PI/2),hood:hood,plane:new THREE.PlaneGeometry(1,1)};
  return DKG}
function dkTaper(r1,r2,len,seg){DKT=DKT||{};const k=[r1,r2,len,seg].map(v=>Math.round(v*1000)).join('_');return DKT[k]||(DKT[k]=new THREE.CylinderGeometry(r2,r1,len,seg||6))}
function dkStrip(w,len,sd){DKT=DKT||{};const k='s'+Math.round(w*1000)+'_'+Math.round(len*1000)+'_'+(sd%7);if(DKT[k])return DKT[k];
  const g=new THREE.PlaneGeometry(w,len,2,3);g.translate(0,-len/2,0);const pa=g.attributes.position;
  for(let i=0;i<pa.count;i++){const y=pa.getY(i),x=pa.getX(i);if(y<-len*.95)pa.setY(i,y+((i*7+sd*3)%5)/5*len*.35);pa.setZ(i,-y*y*.6/len*.25)}
  g.computeVertexNormals();return DKT[k]=g}
function dkRng(s){let x=(s|0)%2147483646+1;return()=>(x=x*16807%2147483647)/2147483647}
function dkKit(){
  const P=[],E=new THREE.Euler(),Q=new THREE.Quaternion(),UP=new THREE.Vector3(0,1,0);
  const k={P,
    // part on bone bn: geometry, type c(cloth/skin) m(metal) g(glow), colour, position, scale, rotation
    p(bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz){E.set(rx||0,ry||0,rz||0);Q.setFromEuler(E);P.push({bn,geo:typeof geo=='string'?dkG()[geo]:geo,t,col,m:new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),Q.clone(),new THREE.Vector3(sx,sy==null?sx:sy,sz==null?sx:sz))});return k},
    // tapered limb between two points
    L(bn,t,col,a,b,r1,r2,seg){const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),len=d.length()||.001;Q.setFromUnitVectors(UP,d.normalize());
      P.push({bn,geo:dkTaper(r1,r2==null?r1:r2,len,seg),t,col,m:new THREE.Matrix4().compose(new THREE.Vector3((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),Q.clone(),new THREE.Vector3(1,1,1))});return k},
    // ragged cloth strip hanging from (x,y,z), turned ry, tilted rx
    S(bn,col,x,y,z,w,len,ry,rx,sd){E.set(rx||0,ry||0,0,'YXZ');Q.setFromEuler(E);P.push({bn,geo:dkStrip(w,len,sd||0),t:'c',col,m:new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),Q.clone(),new THREE.Vector3(1,1,1))});E.order='XYZ';return k}};
  return k}
// merge parts into 1-3 meshes (cloth / metal / glow); skinned when a bone list is given; cached by key
function dkBake(P,O,key){DKBK=DKBK||{};
  let gs=key&&DKBK[key];
  if(!gs){gs={};const by={};P.forEach(p=>(by[p.t]=by[p.t]||[]).push(p));
    const v=new THREE.Vector3(),c=new THREE.Color(),nm=new THREE.Matrix3();
    for(const t in by){const pos=[],nor=[],col=[],si=[],sw=[],idx=[];let off=0;
      by[t].forEach(p=>{const g=p.geo,pa=g.attributes.position,na=g.attributes.normal,n=pa.count,bi=O?Math.max(0,O.indexOf(p.bn)):0,PW=O&&p.w?p.w.slice(0,4).map(q=>[Math.max(0,O.indexOf(q[0])),q[1]]):null;c.set(p.col);nm.getNormalMatrix(p.m);
        for(let i=0;i<n;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);pos.push(v.x,v.y,v.z);v.fromBufferAttribute(na,i).applyMatrix3(nm).normalize();nor.push(v.x,v.y,v.z);col.push(c.r,c.g,c.b);if(O){if(PW){for(let j=0;j<4;j++){si.push(PW[j]?PW[j][0]:0);sw.push(PW[j]?PW[j][1]:0)}}else{si.push(bi,0,0,0);sw.push(1,0,0,0)}}}
        if(g.index){const ix=g.index.array;for(let i=0;i<ix.length;i++)idx.push(ix[i]+off)}else for(let i=0;i<n;i++)idx.push(i+off);off+=n});
      const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));G.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
      if(O){G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4))}
      G.setIndex(idx);G.computeBoundingSphere();gs[t]=G}
    if(key)DKBK[key]=gs}
  const M=dkM();return Object.keys(gs).map(t=>{const m=O?new THREE.SkinnedMesh(gs[t],M[t]):new THREE.Mesh(gs[t],M['s'+t]);m.castShadow=t!='g';if(O)m.frustumCulled=false;return m})}
function dkBind(body,meshes){meshes.forEach(m=>{body.parent.add(m);m.bind(body.skeleton,body.bindMatrix)});return meshes}
function dkHex(a){return (a[0]<<16)|(a[1]<<8)|a[2]}
function dkShade(hex,f){const c=new THREE.Color(hex);c.multiplyScalar(f);return c.getHex()}
var HBO=null;function hbo(){return HBO||(HBO=Object.keys(HB))}

// ---------------- weapons (grip at origin, blade pointing down -y, same footprint as before) ----------------
function mkWpn(type,col,r){DKBK=DKBK||{};
  const g=new THREE.Group(),key='W|'+type+'|'+col+'|'+(r||0);
  if(!DKBK[key]){const k=dkKit(),iron=0x34363c,iron2=0x5a5e66,wood=0x3a2616,wrap=0x24160e,gold=0x8a6a2a,bone=0xb8ad90,B=dkShade(col,1),gl=r>=3?col:null;
    const grip=(len)=>{k.p('','cyl','c',wood,0,0,0,.032,len||.16,.032);for(let i=0;i<4;i++)k.p('','ring','c',wrap,0,-.05+i*.033,0,.036,.25,.036)};
    if(type=='sword'){grip();k.p('','oct','m',iron2,0,.11,0,.035,.045,.035);k.p('','box','m',iron,0,-.095,0,.2,.035,.06);[-1,1].forEach(s=>k.p('','cone4','m',iron,s*.12,-.075,0,.022,.07,.022,0,0,-s*1.1));
      k.p('','box','m',B,0,-.47,0,.06,.72,.016);k.p('','box','m',dkShade(col,.45),0,-.42,0,.016,.56,.02);k.p('','cone4','m',B,0,-.88,0,.043,.12,.011,Math.PI,Math.PI/4);if(gl)k.p('','oct','g',gl,0,-.095,.035,.022)}
    else if(type=='gs'){k.p('','cyl','c',wood,0,.05,0,.04,.32,.04);for(let i=0;i<7;i++)k.p('','ring','c',wrap,0,-.08+i*.04,0,.044,.25,.044);k.p('','oct','m',iron2,0,.24,0,.05,.06,.05);
      k.p('','box','m',iron,0,-.14,0,.34,.05,.08);[-1,1].forEach(s=>{k.p('','cone4','m',iron,s*.2,-.11,0,.03,.12,.03,0,0,-s*1.0);k.p('','cone4','m',iron2,s*.06,-.2,0,.02,.1,.02,Math.PI,0,s*.4)});
      k.p('','box','m',iron2,0,-.24,0,.11,.12,.026);k.p('','box','m',B,0,-.72,0,.1,.96,.02);k.p('','box','m',dkShade(col,.4),0,-.66,0,.022,.72,.026);k.p('','cone4','m',B,0,-1.26,0,.071,.16,.014,Math.PI,Math.PI/4);
      [-1,1].forEach(s=>[0,1].forEach(i=>k.p('','cone4','m',B,s*.055,-.42-i*.12,0,.012,.05,.008,0,0,-s*1.9)));if(gl)k.p('','oct','g',gl,0,-.14,.045,.03)}
    else if(type=='ga'||type=='axe'){const big=type=='ga',y=big?-.78:-.62;k.p('','cyl','c',wood,0,-.35,0,.034,big?1.0:.8,.034);[-.1,-.02,.06].forEach(q=>k.p('','ring','m',iron,0,q,0,.04,.3,.04));k.p('','oct','m',iron,0,y-.04*(big?1:0)-.12,0,.04,.07,.04);
      const sh=new THREE.Shape();sh.moveTo(0,.07);sh.quadraticCurveTo(.16,.1,.3,.24);sh.quadraticCurveTo(.22,0,.3,-.24);sh.quadraticCurveTo(.16,-.1,0,-.07);sh.lineTo(0,.07);
      const ag=new THREE.ExtrudeGeometry(sh,{depth:.03,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1,curveSegments:4});ag.translate(0,0,-.015);
      const sc=big?1:.82;k.p('',ag,'m',B,.02,y,0,sc,sc,1);k.p('','box','m',iron,0,y,0,.07,.16*sc,.05);
      if(big)k.p('',ag,'m',B,-.02,y,0,-sc,sc,1);else k.p('','cone4','m',iron,-.1,y,0,.03,.16,.03,0,0,Math.PI/2);if(gl)k.p('','oct','g',gl,0,y,.035,.025)}
    else if(type=='mace'){k.p('','cyl','c',wood,0,-.3,0,.03,.7,.03);for(let i=0;i<4;i++)k.p('','ring','c',wrap,0,-.04+i*.035,0,.034,.25,.034);k.p('','oct','m',iron,0,.05,0,.04);
      k.p('','sph','m',iron,0,-.72,0,.09,.12,.09);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.p('','box','m',B,Math.cos(a)*.08,-.72,Math.sin(a)*.08,.1,.2,.02,0,-a,0)}k.p('','cone4','m',B,0,-.88,0,.03,.12,.03,Math.PI);if(gl)k.p('','ico','g',gl,0,-.72,0,.05)}
    else if(type=='club'){const R=dkRng(5);let p=[0,.05,0];for(let i=0;i<4;i++){const q=[(R()-.5)*.03,-.15-i*.17,(R()-.5)*.03];k.L('','c',0x4a3420,p,q,.035+i*.02,.045+i*.022);p=q}
      for(let i=0;i<9;i++){const a=R()*6.28,y=-.4-R()*.3;k.p('','cone4','m',0x6a6a70,Math.cos(a)*.09,y,Math.sin(a)*.09,.012,.08,.012,Math.sin(a)*1.4,0,-Math.cos(a)*1.4)}k.p('','ring','m',iron,0,-.3,0,.07,.3,.07)}
    else if(type=='hammer'){k.p('','cyl','c',wood,0,-.3,0,.035,.75,.035);[0,-.18].forEach(q=>k.p('','ring','m',iron,0,q,0,.042,.3,.042));k.p('','box','m',dkShade(col,.55),0,-.74,0,.4,.22,.22);k.p('','box','m',iron2,0,-.74,0,.42,.07,.24);
      [-1,1].forEach(s=>k.p('','cone4','m',iron2,s*.24,-.74,0,.07,.1,.07,0,0,-s*Math.PI/2));k.p('','box','g',col,0,-.74,.112,.18,.03,.01);k.p('','box','g',col,0,-.74,-.112,.18,.03,.01)}
    else if(type=='dagger'){k.p('','cyl','c',wrap,0,0,0,.026,.12,.026);k.p('','oct','m',iron2,0,.075,0,.025);k.p('','box','m',iron,0,-.075,0,.13,.025,.045);[-1,1].forEach(s=>k.p('','cone4','m',iron,s*.075,-.06,0,.015,.05,.015,0,0,-s*1.2));
      k.p('','box','m',B,0,-.25,0,.045,.32,.012);k.p('','box','m',dkShade(col,.45),0,-.22,0,.01,.22,.016);k.p('','cone4','m',B,0,-.45,0,.032,.1,.008,Math.PI,Math.PI/4);if(gl)k.p('','oct','g',gl,0,-.075,.03,.016)}
    else if(type=='staff'){const R=dkRng(11);let p=[0,.55,0];for(let i=0;i<5;i++){const q=[(R()-.5)*.05,.55-(i+1)*.29,(R()-.5)*.05];k.L('','c',0x2e2014,p,q,.03,.034);if(i%2)k.p('','sph','c',0x2e2014,q[0],q[1],q[2],.04);p=q}
      for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4,c=[Math.cos(a)*.03,-.92,Math.sin(a)*.03],t=[Math.cos(a)*.1,-1.06,Math.sin(a)*.1],tt=[Math.cos(a)*.04,-1.16,Math.sin(a)*.04];k.L('','c',0x2e2014,c,t,.022,.016);k.L('','c',bone,t,tt,.014,.003)}
      [0,1,2].forEach(i=>k.p('','ring','m',gold,0,-.7-i*.04,0,.04,.25,.04));k.p('','oct','g',col,0,-1.06,0,.06,.1,.06);k.p('','ring','g',col,0,-1.06,0,.12,.12,.12,.5,0,.3)}
    else if(type=='bow'){const pts=[];for(let i=0;i<=10;i++){const a=Math.PI*(.55+i*.09),rr=.55+(i==0||i==10?.03:0);pts.push([Math.cos(a)*rr,Math.sin(a)*rr*1.02,0])}
      for(let i=0;i<10;i++)k.L('','c',i>3&&i<6?wrap:0x3a2414,pts[i],pts[i+1],i==0||i==9?.012:.022,i==0||i==9?.012:.022,5);
      [pts[0],pts[10]].forEach((q,i)=>k.L('','c',bone,q,[q[0]+.05,q[1]+(i?-.08:.08),0],.014,.003,4));k.p('','box','m',iron2,-.55,0,0,.03,.12,.03);
      k.L('','c',0xd8d0b8,[pts[0][0]+.004,pts[0][1],0],[-.08,0,0],.004,.004,3);k.L('','c',0xd8d0b8,[-.08,0,0],[pts[10][0]+.004,pts[10][1],0],.004,.004,3)}
    else if(type=='sling'){k.L('','c',0x5a4a32,[0,0,0],[0,-.4,0],.01,.01,4);k.p('','sph','c',0x4a3a2a,0,-.42,0,.055);k.p('','ico','c',0x6a6a66,0,-.42,.02,.035)}
    else if(type=='shield'){const sh=new THREE.Shape();sh.moveTo(0,.5);sh.quadraticCurveTo(.44,.48,.42,.12);sh.quadraticCurveTo(.36,-.34,0,-.62);sh.quadraticCurveTo(-.36,-.34,-.42,.12);sh.quadraticCurveTo(-.44,.48,0,.5);
      const eg=new THREE.ExtrudeGeometry(sh,{depth:.045,bevelEnabled:true,bevelThickness:.02,bevelSize:.025,bevelSegments:1,curveSegments:5});eg.translate(0,.05,-.0225);
      const ig=new THREE.ShapeGeometry(new THREE.Shape(sh.getPoints(5).map(p=>p.clone().multiplyScalar(.8))));
      k.p('',eg,'m',iron,0,0,0,1,1,1);[-1,1].forEach(s=>{k.p('',ig,'c',dkShade(col,.75),0,.06,s*.048,1,1,1,0,s<0?Math.PI:0,0);k.p('','box','m',gold,0,.0,s*.052,.06,.72,.012);k.p('','box','m',gold,0,.2,s*.052,.46,.06,.012);k.p('','sph','m',iron2,0,.2,s*.055,.06,.06,.03)});
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.p('','sph','m',iron2,Math.cos(a)*.34,.1+Math.sin(a)*.38,-.05,.018)}if(gl)k.p('','oct','g',gl,0,.2,-.075,.035)}
    else{k.p('','box','m',B,0,-.3,0,.05,.6,.02)}
    DKBK[key]=dkBake(k.P,null,key+'#')&&DKBK[key+'#']}
  dkBake([],null,key+'#').forEach(m=>g.add(m));return g}

// ---------------- shared humanoid pieces (coordinates are the rest pose of the HB skeleton) ----------------
function DKL(s){return s<0?'l':'r'}function DKA(s){return s<0?'aL':'aR'}
function dkFace(k,o){ // o:{skin,hair,beard,brow,eye,glow,hairStyle}
  const sk=o.skin,sd=dkShade(sk,.72);
  [-1,1].forEach(s=>{k.p('head','box','c',0x0b0807,s*.038,1.143,.103,.03,.011,.012);if(o.glow)k.p('head','box','g',o.glow,s*.038,1.143,.11,.018,.007,.006);
    k.p('head','box','c',o.brow||o.hair,s*.04,1.162,.104,.044,.013,.016,0,0,s*.28);k.p('head','box','c',sd,s*.07,1.12,.09,.02,.04,.02,0,s*.5,0)});
  k.p('head','box','c',sd,0,1.122,.112,.018,.04,.022,-.15);k.p('head','box','c',0x2a1410,0,1.093,.104,.034,.006,.008);
  if(o.hair!=null){const st=o.hairStyle||'short';
    k.p('head','hem','c',o.hair,0,1.15,-.014,.122,.135,.13,-.3);
    if(st=='long'){k.p('head','box','c',o.hair,0,1.07,-.07,.17,.16,.06,.15);[-1,1].forEach(s=>k.p('head','box','c',o.hair,s*.09,1.08,-.02,.03,.14,.08))}
    if(st=='spiky')for(let i=0;i<6;i++){const a=-1.1+i*.44;k.p('head','cone4','c',o.hair,Math.sin(a)*.07,1.22,-.03+Math.cos(a)*.02-.03,.03,.09,.03,-.6,0,-Math.sin(a)*.5)}
    if(st=='topknot'){k.p('head','sph','c',o.hair,0,1.27,-.05,.035);k.L('head','c',o.hair,[0,1.26,-.07],[0,1.12,-.15],.02,.01)}}
  if(o.beard){k.p('head','cone4','c',o.beard,0,1.06,.075,.055,.09,.045,Math.PI+.25);k.p('head','box','c',o.beard,0,1.1,.108,.06,.012,.015);[-1,1].forEach(s=>k.p('head','box','c',o.beard,s*.07,1.1,.06,.02,.07,.06))}
}
function dkBoots(k,col,cuff,metal){[-1,1].forEach(s=>{const x=s*.1,l=DKL(s)+'h';
  k.p(l+'2','box',metal?'m':'c',col,x,.035,.05,.105,.07,.2);k.p(l+'2','cone4',metal?'m':'c',dkShade(col,.8),x,.035,.16,.05,.06,.035,Math.PI/2,Math.PI/4);
  k.L(l+'1',metal?'m':'c',col,[x,.06,0],[x,.24,.015],.064,.07,7);k.p(l+'1','cyl','c',cuff,x,.245,.015,.078,.04,.078)})}
function dkGloves(k,col,cuff){[-1,1].forEach(s=>{const a=DKA(s);k.L(a+'1','c',col,[s*.245,.69,0],[s*.252,.6,0],.05,.056);k.p(a+'1','ring','c',cuff,s*.245,.69,0,.058,.35,.058);k.p(a+'2','box','c',col,s*.255,.555,.012,.06,.075,.065);k.p(a+'2','box','c',dkShade(col,.8),s*.255,.513,.03,.055,.03,.045)})}
function dkBelt(k,col,buckle,y){y=y||.58;k.p('spine','ring','c',col,0,y,0,.172,.45,.128);k.p('spine','box','m',buckle,0,y,.128,.045,.04,.016);k.p('pelvis','box','c',dkShade(col,1.2),.14,y-.06,.09,.05,.06,.035,0,.6,0)}
function dkCollar(k,col,n){for(let i=0;i<(n||13);i++){const a=i/(n||13)*Math.PI*2;if(Math.sin(a)>.45)continue;k.p('chest','cone4','c',i%3?col:dkShade(col,1.35),Math.cos(a)*.17,.965,Math.sin(a)*.115-.015,.04,.12,.04,Math.sin(a)*.8,0,-Math.cos(a)*1.15)}}
function dkCapeEnds(k,col,n){for(let i=0;i<(n||8);i++){const x=-.18+i*(.36/((n||8)-1));k.S('cp2',col,x,.34,-.25-Math.abs(x)*.03,.055,.09+((i*5)%4)*.035,0,.1,i)}}
function dkPauldron(k,s,M1,M2,spikes,lay){const a=DKA(s);for(let i=0;i<(lay||3);i++)k.p(a+'0','hem','m',i?M1:M2,s*(.25+i*.014),.99-i*.042,0,.12-i*.014,.085,.125-i*.012,0,0,s*(.38+i*.2));
  if(spikes){k.p(a+'0','cone4','m',M2,s*.29,1.07,.0,.024,.14,.024,0,0,-s*.45);k.p(a+'0','cone4','m',M2,s*.25,1.08,-.05,.02,.11,.02,-.2,0,-s*.2)}}
function dkPlateArms(k,M1,M2){[-1,1].forEach(s=>{const a=DKA(s);k.L(a+'0','m',M1,[s*.225,.93,0],[s*.24,.8,0],.06,.054);k.p(a+'1','sph','m',M2,s*.243,.78,-.008,.052);k.p(a+'1','cone4','m',M2,s*.246,.78,-.06,.016,.06,.016,-Math.PI/2);
  k.L(a+'1','m',M1,[s*.243,.76,0],[s*.252,.6,0],.052,.058);k.p(a+'2','box','m',M1,s*.255,.555,.014,.066,.08,.072);k.p(a+'2','box','m',M2,s*.255,.512,.032,.06,.03,.052)})}
function dkPlateLegs(k,M1,M2){[-1,1].forEach(s=>{const x=s*.1,l=DKL(s)+'h';k.L(l+'0','m',M1,[x,.5,0],[x,.33,.02],.082,.07);k.p(l+'1','sph','m',M2,x,.3,.055,.047,.052,.04);k.p(l+'1','cone4','m',M2,x,.3,.1,.016,.05,.016,Math.PI/2);
  k.L(l+'1','m',M1,[x,.28,.012],[x,.09,0],.064,.056);k.p(l+'2','box','m',M1,x,.035,.05,.105,.068,.2);k.p(l+'2','cone4','m',M2,x,.04,.17,.045,.07,.03,Math.PI/2,Math.PI/4)})}
function dkCuirass(k,M1,M2,trim){k.p('chest','tor','m',M1,0,.83,.008,.218,.31,.152);k.p('chest','box','m',M2,0,.84,.148,.032,.27,.02,-.07);
  for(let i=0;i<3;i++)k.p('spine','tor','m',i%2?M1:M2,0,.705-i*.045,0,.19-i*.008,.05,.138-i*.006);k.p('neck','cyl','m',M2,0,.995,0,.1,.06,.085);
  if(trim)k.p('chest','ring','m',trim,0,.975,0,.205,.3,.14)}
function dkHood(k,col,face,glow,tip){k.p('head','hem','c',dkShade(col,.5),0,1.15,-.014,.122,.135,.13,-.3);k.p('head','hood','c',col,0,1.025,-.012,.14,.31,.145);k.p('head','cone4','c',col,0,1.31,-.1,.05,.16,.05,-1.1);
  if(face){k.p('head','sph','c',0x040406,0,1.13,.045,.092,.1,.074);if(glow)[-1,1].forEach(s=>k.p('head','box','g',glow,s*.034,1.145,.118,.024,.011,.01))}
  if(tip)k.L('head','c',col,[0,1.3,-.12],[0,1.36,-.26],.035,.008)}
function dkSkirt(k,col,y0,len,rb,n,sd){k.p('pelvis','skirt','c',col,0,y0-len/2,0,rb,len,rb*.8);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;k.S('pelvis',dkShade(col,.85),Math.sin(a)*rb*.96,y0-len+.01,Math.cos(a)*rb*.77,.075,.05+((i*3+sd)%4)*.025,a,-.28,i+sd)}}

// ---------------- hero ----------------
function dkC(){return DKC0||(DKC0={
 warrior:{M1:0x343944,M2:0x5a606c,trim:0x6a2a1e,cl:0x4a0e10,lt:0x2a1d14,fur:0x2a2420,glow:0xff6a20,hair:0x2a1a12,hs:'short',beard:0x2a1a12},
 paladin:{M1:0x5c6068,M2:0x80848c,trim:0x8a6a2a,cl:0x8a8270,lt:0x3a2a1c,fur:0x8a8070,glow:0xffd070,hair:0x6a5a40,hs:'short',beard:0x6a5a40},
 assassin:{M1:0x2e2e36,M2:0x4a4a56,trim:0x5a3a7a,cl:0x24142e,lt:0x1a181e,fur:0x1a1a1e,glow:0xb070ff,hair:0x121014,hs:'topknot'},
 ranger:{M1:0x46484e,M2:0x6a6c72,trim:0x6a5a30,cl:0x22301c,lt:0x3a2818,fur:0x4a3c2c,glow:0x8aff9a,hair:0x3a2414,hs:'long'},
 mage:{M1:0x3a3a46,M2:0x8a6a2a,trim:0x8a6a2a,cl:0x161e3c,cl2:0x22183e,lt:0x2a1c12,fur:0x2a2a32,glow:0x7cc8ff,hair:0x8a8a90,hs:'long',beard:0x8a8a90}})}
// ---------------- humanoid enemies ----------------
function dkGoblinHead(k,sk,eye,o){o=o||{};const sd=dkShade(sk,.7);
  [-1,1].forEach(s=>{k.p('head','cone4','c',sk,s*.15,1.17,-.01,.035,.17,.022,0,0,-s*1.3);k.p('head','cone4','c',sd,s*.13,1.165,0,.02,.1,.012,0,0,-s*1.3);
    k.p('head','sph','c',0x050404,s*.042,1.145,.098,.03,.022,.02);k.p('head','box','g',eye,s*.042,1.145,.112,.022,.009,.006);k.p('head','box','c',sd,s*.045,1.168,.105,.05,.016,.02,0,0,s*.38)});
  k.p('head','cone4','c',sk,0,1.12,.14,.022,.08,.02,Math.PI/2+.4);k.p('head','box','c',0x1a0a08,0,1.085,.1,.06,.014,.012);
  for(let i=-2;i<=2;i++)k.p('head','cone4','c',0xd8d0b0,i*.016,1.085,.11,.007,.028,.007,i%2?Math.PI:0);
  if(o.warts)[[.05,1.2,.08],[-.06,1.1,.09]].forEach(q=>k.p('head','sph','c',sd,q[0],q[1],q[2],.012))}
function dkTeethNeck(k,col){for(let i=0;i<9;i++){const a=-1.3+i*.32;k.p('chest','cone4','c',i%2?col:0x8a1a1a,Math.sin(a)*.14,.94-Math.cos(a)*.04,Math.cos(a)*.11,.01,.04,.01,Math.PI)}k.p('chest','ring','c',0x2a1a10,0,.97,.0,.14,.15,.11)}
function dkLoin(k,col,n,sd){for(let i=0;i<n;i++){const a=-1.1+i*(2.2/(n-1));k.S('pelvis',i%2?col:dkShade(col,.75),Math.sin(a)*.17,.52,Math.cos(a)*.12,.08,.14+((i*7+sd)%3)*.05,a,-.15,i+sd)}
  for(let i=0;i<n-1;i++){const a=Math.PI-1+i*(2/(n-2));k.S('pelvis',dkShade(col,.85),Math.sin(a)*.17,.52,Math.cos(a)*.12,.08,.12+((i*5)%3)*.04,a,-.15,i)}}
function dkClawFeet(k,sk){[-1,1].forEach(s=>{const x=s*.1,l=DKL(s)+'h2';k.p(l,'box','c',sk,x,.03,.05,.09,.06,.17);for(let i=-1;i<=1;i++)k.p(l,'cone4','c',0x2a2420,x+i*.03,.02,.15,.012,.05,.012,Math.PI/2)})}
function dkSkeleton(k,bone,o){o=o||{};bone=dkShade(bone,.8);const bd=dkShade(bone,.7);
  k.p('head','sph','c',bone,0,1.16,0,.096,.1,.108);k.p('head','box','c',bd,0,1.175,.088,.12,.025,.03);k.p('head','box','c',bone,0,1.09,.04,.11,.05,.1);k.p('head','box','c',bd,0,1.065,.06,.08,.025,.07);
  [-1,1].forEach(s=>{k.p('head','oct','c',0x050505,s*.038,1.15,.09,.03,.022,.025,0,0,s*.35);k.p('head','box','g',o.eye||0x6aff9a,s*.038,1.15,.11,.016,.006,.004,0,0,s*.3)});k.p('head','cone4','c',0x050505,0,1.115,.105,.016,.03,.012,Math.PI);
  for(let i=-3;i<=3;i++)k.p('head','box','c',0xe8e0c8,i*.013,1.078,.106,.008,.016,.006);
  k.L('neck','c',bone,[0,.97,-.01],[0,1.06,0],.022,.022,5);for(let i=0;i<6;i++)k.p(i<3?'spine':'chest','box','c',bone,0,.58+i*.065,-.03,.035,.035,.035,0,.78);
  for(let i=0;i<5;i++)k.p('chest','ring','c',i%2?bone:bd,0,.74+i*.045,-.005,.15-Math.abs(i-2.5)*.012,.3,.11);k.p('chest','box','c',bone,0,.82,.11,.025,.2,.015);
  k.p('pelvis','tor','c',bone,0,.53,0,.15,.08,.1);[-1,1].forEach(s=>k.p('pelvis','sph','c',bd,s*.1,.54,0,.06,.04,.05));
  [-1,1].forEach(s=>{const a=DKA(s),l=DKL(s)+'h',x=s*.1;k.p('chest','box','c',bone,s*.12,.96,0,.13,.02,.03,0,0,-s*.1);
    k.L(a+'0','c',bone,[s*.222,.95,0],[s*.24,.79,0],.022,.018,5);k.p(a+'1','sph','c',bd,s*.24,.78,0,.028);k.L(a+'1','c',bone,[s*.24,.77,0],[s*.25,.61,0],.016,.014,5);k.L(a+'1','c',bd,[s*.236,.77,.015],[s*.247,.61,.015],.01,.01,4);
    k.p(a+'2','box','c',bone,s*.252,.575,.01,.045,.035,.035);for(let f=0;f<3;f++)k.L(a+'2','c',bone,[s*.252+(f-1)*.014,.56,.02],[s*.252+(f-1)*.016,.5,.03],.006,.004,4);
    k.L(l+'0','c',bone,[x,.53,0],[x,.32,.02],.028,.022,5);k.p(l+'1','sph','c',bd,x,.3,.02,.035);k.L(l+'1','c',bone,[x,.28,.02],[x,.08,0],.022,.018,5);k.p(l+'2','box','c',bone,x,.03,.05,.06,.03,.14)})}
function dkEnemyKit(key,L){
  const k=dkKit(),sk=dkShade(dkHex(L.skin),.82),M1=0x3a3c44,M2=0x5e626c,lt=0x2a1d14,fur=0x3a3026,rust=0x5a3a24;
  if(key=='hob'||key=='sling'||key=='shaman'){
    dkGoblinHead(k,sk,key=='shaman'?0x7aff6a:0xffc020,{warts:1});dkClawFeet(k,sk);dkLoin(k,key=='shaman'?0x3a4a2a:0x4a3a22,5,key.length);
    k.p('chest','box','c',lt,0,.84,.14,.035,.34,.012,0,0,.6);k.p('spine','ring','c',lt,0,.6,0,.168,.5,.124);[-1,1].forEach(s=>{const a=DKA(s);k.p(a+'1','ring','c',0x5a4a32,s*.245,.66,0,.054,.4,.054);k.p(a+'2','box','c',sk,s*.255,.555,.012,.05,.065,.055);for(let f=0;f<3;f++)k.p(a+'2','cone4','c',0x2a2420,s*.255+(f-1)*.016,.5,.03,.008,.04,.008,Math.PI)});
    if(key=='hob'){k.p('aL0','hem','c',0x4a3420,-.25,.99,0,.12,.08,.12,0,0,-.4);for(let i=0;i<3;i++)k.p('aL0','cone4','m',0x6a6a70,-.25-i*.02,1.06,-.04+i*.04,.014,.07,.014,0,0,.5);dkTeethNeck(k,0xd8d0b0)}
    if(key=='sling'){dkHood(k,0x4a3a26,false);k.p('pelvis','sph','c',0x3a2a1a,.16,.5,.06,.05,.06,.045);k.S('chest',0x4a3a26,0,.98,-.13,.18,.24,Math.PI,.1,3)}
    if(key=='shaman'){k.p('head','sph','c',0xa89e86,0,1.17,.07,.1,.09,.08);k.p('head','box','c',0x6a604e,0,1.19,.14,.12,.02,.02);[-1,1].forEach(s=>{k.p('head','oct','c',0x050505,s*.04,1.17,.13,.026,.018,.02,0,0,s*.35);k.p('head','box','g',0x7aff6a,s*.04,1.17,.148,.014,.005,.004,0,0,s*.3);
        k.L('head','c',0x8a7a5a,[s*.08,1.24,0],[s*.16,1.36,-.03],.016,.012).L('head','c',0x8a7a5a,[s*.16,1.36,-.03],[s*.2,1.46,-.02],.012,.004).L('head','c',0x8a7a5a,[s*.15,1.34,-.03],[s*.22,1.37,.0],.008,.003)});
      for(let i=0;i<5;i++)k.p('head','cone4','c',[0x8a2a1a,0x2a6a8a,0xa88a2a,0x2a2a2a,0x8a2a1a][i],-.08+i*.04,1.27,-.08,.022,.14,.008,-.5,0,(i-2)*.2);dkTeethNeck(k,0xe8e0c8);dkCollar(k,0x3a3a2a,11)}}
  else if(key=='bandit'){dkHood(k,0x2a2a30,true,0xc8b890);k.p('head','cyl','c',0x3a1a1a,0,1.085,.03,.1,.06,.095);k.p('chest','tor','c',0x2a262a,0,.83,.006,.212,.3,.148);
    [-1,1].forEach(s=>k.p('chest','box','c',0x121014,0,.83,.148,.035,.36,.012,0,0,s*.6));for(let i=0;i<2;i++)k.p('chest','box','m',0x8a8e96,.05+i*.05,.81-i*.035,.156,.012,.06,.006,0,0,.6+Math.PI/2);
    dkGloves(k,lt,0x3a1a1a);dkBoots(k,lt,0x3a1a1a);dkBelt(k,lt,0x6a6a6a);k.S('pelvis',0x3a1a1a,0,.6,.13,.1,.26,0,-.06,2);k.p('neck','cyl','c',0x3a1a1a,0,1.0,0,.11,.07,.1);dkCapeEnds(k,0x24181a,7)}
  else if(key=='brigand'){dkFace(k,{skin:sk,hair:null,beard:0x3a2414,brow:0x3a2414});k.p('head','hem','m',M1,0,1.17,0,.115,.11,.122).p('head','box','m',M2,0,1.13,.12,.018,.07,.012).p('head','tube','m',0x2c2e34,0,1.06,-.01,.115,.08,.11);
    k.p('chest','tor','c',0x5a1a16,0,.83,.006,.214,.3,.15);for(let r=0;r<4;r++)for(let c=0;c<5;c++)k.p('chest','sph','m',M2,-.12+c*.06,.72+r*.075,.152-Math.abs(c-2)*.01,.01);
    dkPauldron(k,-1,M1,M2,true,2);dkCollar(k,fur);dkGloves(k,lt,fur);dkBoots(k,lt,fur);dkBelt(k,lt,0x8a6a2a);k.S('pelvis',0x5a1a16,0,.6,.135,.12,.32,0,-.06,1).S('pelvis',0x5a1a16,0,.6,-.13,.12,.3,Math.PI,.06,2);dkCapeEnds(k,0x3a1210)}
  else if(key=='cultist'){dkHood(k,0x4a0c0a,true,0xff6a20,false);[-1,1].forEach(s=>k.L('head','c',0x2a2420,[s*.08,1.24,-.01],[s*.15,1.33,-.03],.025,.012).L('head','c',0x2a2420,[s*.15,1.33,-.03],[s*.14,1.42,-.06],.012,.002));
    k.p('chest','tor','c',0x3a0a08,0,.83,.006,.212,.3,.148);dkSkirt(k,0x4a0c0a,.6,.5,.3,13,3);k.p('chest','hem','c',0x2a0806,0,.93,0,.25,.1,.17);
    k.p('spine','ring','c',0x1a1210,0,.6,0,.176,.7,.13);k.p('chest','ring','m',0x6a5a40,0,.92,.05,.12,.3,.11,.5);k.p('chest','oct','g',0xff6a20,0,.78,.16,.03,.045,.02);
    [-1,1].forEach(s=>{const a=DKA(s);k.L(a+'1','c',0x4a0c0a,[s*.243,.77,0],[s*.255,.6,0],.055,.09,8);k.p(a+'2','box','c',dkShade(sk,.8),s*.255,.555,.012,.045,.06,.05)});dkBoots(k,0x1a1210,0x1a1210)}
  else if(key=='orc'){const sd=dkShade(sk,.7);k.p('head','box','c',sd,0,1.17,.09,.2,.035,.05,.2);[-1,1].forEach(s=>{k.p('head','sph','c',0x050404,s*.042,1.145,.098,.028,.02,.02);k.p('head','box','g',0xff3a1a,s*.042,1.145,.111,.022,.009,.006);
      k.p('head','cone4','c',0xe8e0c8,s*.05,1.1,.11,.016,.07,.016,0,0,-s*.2);k.p('head','cone4','c',sk,s*.12,1.15,-.01,.025,.07,.02,0,0,-s*1.4)});k.p('head','box','c',sd,0,1.11,.115,.04,.035,.03);k.p('head','box','c',0x200a08,0,1.08,.1,.08,.04,.03);
    for(let i=0;i<6;i++)k.p('head','cone4','c',0x1a120c,0,1.24-i*.005,.06-i*.04,.012,.09,.03,-.3+i*.12);
    [-1,1].forEach(s=>{dkPauldron(k,s,0x4a3a2a,0x6a6a70,true,2);const a=DKA(s);k.p(a+'1','ring','c',lt,s*.245,.68,0,.058,.5,.058);k.p(a+'1','ring','m',M2,s*.247,.63,0,.058,.4,.058);k.p(a+'2','box','c',sk,s*.255,.555,.012,.06,.075,.065)});
    k.p('chest','box','c',lt,0,.84,.142,.04,.36,.012,0,0,.55).p('chest','box','c',lt,0,.84,.142,.04,.36,.012,0,0,-.55);k.p('spine','ring','c',lt,0,.6,0,.172,.7,.128);
    k.p('spine','sph','c',0xd8d0b0,0,.6,.135,.04,.04,.035).p('spine','sph','c',0x050505,-.014,.605,.165,.01).p('spine','sph','c',0x050505,.014,.605,.165,.01);dkLoin(k,0x3a2a1a,4,2);dkBoots(k,0x2a1d14,fur);dkTeethNeck(k,0xd8d0b0)}
  else if(key=='skel'||key=='archer'){const bone=0xc8bea4;dkSkeleton(k,bone,{eye:key=='skel'?0x6aff9a:0x7ad8ff});
    if(key=='skel'){k.p('head','hem','m',rust,0,1.19,0,.112,.08,.12).p('head','box','m',rust,0,1.15,.115,.016,.07,.01);dkPauldron(k,-1,rust,0x6a5040,false,2);k.p('chest','tor','m',rust,0,.86,.0,.17,.12,.12);dkLoin(k,0x3a3a34,4,1)}
    else{dkHood(k,0x2a2a24,false);k.S('chest',0x2a2a24,0,.98,-.12,.24,.5,Math.PI,.12,1);k.L('chest','c',0x3a2414,[-.05,.66,-.12],[.12,1.04,-.16],.05,.055,7);
      for(let i=0;i<3;i++){const x=.09+i*.025;k.L('chest','c',0x6a5030,[x,1.0,-.16],[x+.07,1.14,-.19],.006,.006,4);k.p('chest','cone4','c',0xd8d0b8,x+.07,1.14,-.19,.02,.06,.006,0,0,-.4)}dkLoin(k,0x2a2a24,4,3)}}
  else if(key=='knight'){const K1=0x26282e,K2=0x40434c;k.p('head','cyl','m',K1,0,1.15,.004,.116,.17,.124).p('head','hem','m',K1,0,1.235,.004,.116,.06,.124).p('head','box','g',0xff2a1a,0,1.152,.126,.13,.013,.01).p('head','box','m',K2,0,1.14,.128,.018,.12,.012);
    [-1,1].forEach(s=>{k.L('head','c',0x8a8270,[s*.1,1.22,-.02],[s*.13,1.32,-.06],.028,.016).L('head','c',0x8a8270,[s*.13,1.32,-.06],[s*.12,1.42,-.12],.016,.002);dkPauldron(k,s,K1,K2,true,3)});
    dkCuirass(k,K1,K2);dkPlateArms(k,K1,K2);dkPlateLegs(k,K1,K2);k.p('pelvis','skirt','m',0x1c1e22,0,.47,0,.22,.18,.158);dkCollar(k,0x1a1a1e,13);
    for(let i=0;i<9;i++){const x=-.2+i*.05;k.S('chest',i%2?0x1a1420:0x120e18,x,.97,-.15-Math.abs(x)*.1,.06,.55+((i*5)%4)*.08,0,.12,i)}k.S('pelvis',0x1a1420,0,.6,.14,.1,.34,0,-.06,4)}
  else if(key=='giant'){const ice=0xc8e8ff,rune=0x6ac8ff,sd=dkShade(sk,.7);[-1,1].forEach(s=>{k.p('head','sph','c',0x050505,s*.04,1.15,.1,.026,.02,.02);k.p('head','box','g',rune,s*.04,1.15,.112,.024,.01,.006);k.p('head','box','c',sd,s*.042,1.17,.106,.05,.018,.02,0,0,s*.3)});
    for(let i=0;i<7;i++){const x=-.06+i*.02;k.p('head','cone4','m',ice,x,1.0-Math.abs(i-3)*-.01,.08,.018,.16-Math.abs(i-3)*.025,.018,Math.PI+.2,0,(i-3)*.08)}k.p('head','box','c',sd,0,1.12,.115,.025,.04,.025);
    k.p('head','ring','g',rune,0,1.2,0,.108,.15,.118);[0,1,2].forEach(i=>k.p('chest','box','g',rune,-.05+i*.05,.85-Math.abs(i-1)*.04,.13,.012,.1,.006,0,0,(i-1)*.5));k.p('chest','box','g',rune,0,.92,.125,.13,.012,.006);
    [-1,1].forEach(s=>{const a=DKA(s);k.L(a+'1','m',0x5a6070,[s*.243,.75,0],[s*.253,.6,0],.06,.068,6);k.p(a+'1','ring','g',rune,s*.248,.68,0,.068,.2,.068);k.p(a+'2','box','c',sk,s*.255,.555,.012,.065,.08,.07);k.p(a+'0','dod','m',0x6a7080,s*.27,.98,0,.08)});
    dkLoin(k,0x5a5040,5,4);dkCollar(k,0x6a5e4e,13);dkBelt(k,0x3a2a1a,0x6a7080);dkBoots(k,0x3a3026,0x6a5e4e)}
  else if(key=='revenant'){const wrap=0xa89878,wd=0x7a6a50,gold=0x9a7a30;
    for(let i=0;i<4;i++)k.p('head','ring','c',i%2?wrap:wd,0,1.06+i*.055,0,.1+(i==1||i==2?.012:0),.6,.112,(i-1.5)*.15);[-1,1].forEach(s=>{k.p('head','sph','c',0x050404,s*.04,1.15,.1,.026,.02,.02);k.p('head','box','g',0xffc040,s*.04,1.15,.112,.022,.01,.006)});
    k.p('head','box','m',gold,0,1.22,.03,.24,.035,.2).p('head','cone4','c',0x2a3a6a,0,1.12,-.1,.12,.25,.06,.3);[-1,1].forEach(s=>k.p('head','box','c',0x2a3a6a,s*.12,1.06,.02,.04,.2,.1));
    k.p('chest','ring','m',gold,0,.98,0,.16,.9,.12);for(let i=0;i<5;i++)k.p('chest','ring','c',i%2?wrap:wd,0,.68+i*.06,0,.205-Math.abs(i-2)*.008,.6,.142,0,0,(i%2?.15:-.15));
    [-1,1].forEach(s=>{const a=DKA(s),l=DKL(s)+'h';for(let i=0;i<4;i++){k.p(a+(i<2?'0':'1'),'ring','c',i%2?wrap:wd,s*(.228+i*.008),.92-i*.08,0,.06,.4,.06,0,0,s*.3);k.p(l+(i<2?'0':'1'),'ring','c',i%2?wrap:wd,s*.1,.5-i*.11,.01,.09-i*.006,.4,.09,.2)}});
    for(let i=0;i<6;i++)k.S(i<3?'pelvis':'chest',i%2?wrap:wd,-.12+i*.05,i<3?.5:.75,i<3?.12:.14,.035,.18+((i*3)%3)*.08,0,-.1,i);dkSkirt(k,0x6a5a3a,.58,.32,.24,9,2)}
  return k}
function mkHumanoid(key){DKBK=DKBK||{};
  const L=HUMLOOK[key],g=new THREE.Group(),b=new THREE.Group();g.add(b);g.b=b;g.legs=[];g.wings=[];g.tails=[];
  const h=new THREE.Group();b.add(h);const dk=a=>a.map(v=>Math.round(v*.66));
  const spec=Object.assign({},HSPEC,{id:'HX_'+key,pal:Object.assign({},HSPEC.pal,{skin:L.skin.map(v=>Math.round(v*.82)),cape:dk(L.cape),pants:dk(L.pants),boot:[20,16,14],dk:[18,14,12],bel:[60,48,36]})});
  const mb=mkBones(HSPEC),bones=mb.bones,mesh=new THREE.SkinnedMesh(rigGeo(HSPEC),rigMat(spec,dkShade(L.tunic,.66),''));
  mesh.castShadow=!L.bone;mesh.frustumCulled=false;mesh.add(bones.pelvis);h.add(mesh);mesh.updateMatrixWorld(true);mesh.bind(new THREE.Skeleton(mb.arr));
  h.bones=bones;h.ax=mkAx(HSPEC,bones);h.legs=[bones.lh0,bones.rh0];h.arms=[bones.aL0,bones.aR0];h.torso=bones.spine;h.gearG=[];
  if(L.bone)mesh.material=dkM().g.clone(),mesh.material.visible=false;
  const kk='E|'+key,kit=DKBK[kk]?null:((typeof dkNewKit=='function'&&dkNewKit(key,L))||dkEnemyKit(key,L));dkBind(mesh,dkBake(kit?kit.P:[],hbo(),kk));
  const wp=L.wpn=='none'?new THREE.Group():mkWpn(L.wpn,L.wcol,0);
  if(L.wpn=='bow'){wp.rotation.set(0,Math.PI/2,0);wp.position.set(-.05,-.02,.05);bones.aL2.add(wp)}else{wp.rotation.x=-1.0;wp.position.set(0,-.03,.02);bones.aR2.add(wp)}
  if(key=='nagaw'||key=='vampk'&&0){const sh=mkWpn('shield',0x3a5a2a,0);sh.position.set(-.06,0,.06);sh.rotation.y=Math.PI/2;sh.scale.setScalar(.75);bones.aL2.add(sh)}
  if(key=='skel'){const sh=mkWpn('shield',0x3a3a40,0);sh.position.set(-.06,0,.06);sh.rotation.y=Math.PI/2;sh.scale.setScalar(.8);bones.aL2.add(sh)}
  g.h=h;g.isHum=1;g.rig=(now,mv,sp)=>humAnim(g,now,mv,sp);g.bs=(L.sc||1)*1.05;g.scale.setScalar(g.bs);
  return g}

// ---------------- creatures (companions, wild beasts, bosses and mounts all share these rigs) ----------------
function rigMat(S,hex,v){
  const k=S.id+hex+'_'+v+'_dk2';if(RM[k])return RM[k];const t=rigTex(S,hex),gh=S.st=='ghost',hu=S.st=='hero';
  return RM[k]=new THREE.MeshStandardMaterial({map:t.map,normalMap:t.nm,normalScale:new THREE.Vector2(S.ns||.8,S.ns||.8),roughness:gh?.4:(S.rough||.88),metalness:0,skinning:true,envMapIntensity:.6,flatShading:true,color:hu?0xd8d0c8:gh?0x7a8898:0xc4bcb4,
    emissive:gh?0x0c2436:v=='Golden'?0x3a2a00:v=='Ember'?0x331000:0,transparent:gh,opacity:gh?.78:1,depthWrite:!gh})}
function rigGeo(S){
  if(RG[S.id])return RG[S.id];
  const O=Object.keys(S.bones),P=[],UV=[],SI=[],SW=[],IX=[];let base=0;
  S.lofts.forEach(o=>{
    const ctrl=o.c,rad=o.r,bn=o.b,seg=Math.max(5,Math.round(o.seg*.72)),N=Math.max(6,Math.round(o.N*.85)),vb=o.v[0],vs=o.v[1],rf=o.ref||[1,0,0],cur=new THREE.CatmullRomCurve3(ctrl.map(q=>new THREE.Vector3(q[0],q[1],q[2]))),m=ctrl.length-1;
    for(let i=0;i<N;i++){
      const t=i/(N-1),pt=cur.getPoint(t),tg=cur.getTangent(t).normalize(),f=t*m,j=Math.min(m-1,Math.floor(f)),fr=f-j,sm=fr*fr*(3-2*fr);
      const U=new THREE.Vector3().crossVectors(tg,new THREE.Vector3(rf[0],rf[1],rf[2])).normalize(),Sd=new THREE.Vector3().crossVectors(U,tg).normalize();
      const rx=rad[j][0]*(1-sm)+rad[j+1][0]*sm,ry=rad[j][1]*(1-sm)+rad[j+1][1]*sm;
      for(let k=0;k<=seg;k++){const a=k/seg*Math.PI*2,c=Math.cos(a)*rx,s=Math.sin(a)*ry;
        P.push(pt.x+Sd.x*c+U.x*s,pt.y+Sd.y*c+U.y*s,pt.z+Sd.z*c+U.z*s);UV.push(k/seg,vb+t*vs);SI.push(O.indexOf(bn[j]),O.indexOf(bn[j+1]),0,0);SW.push(1-fr,fr,0,0)}}
    for(let i=0;i<N-1;i++)for(let k=0;k<seg;k++){const a=base+i*(seg+1)+k,b2=a+seg+1;IX.push(a,a+1,b2,b2,a+1,b2+1)}
    base+=N*(seg+1)});
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));
  G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(SW,4));G.setIndex(IX);G.computeVertexNormals();return RG[S.id]=G}
// menacing faces: dark sockets, glowing slit eyes, angry brow plates, bigger fangs
function qface(x,o){
  const ec=x.red?0xff2a2a:o.eye,e=o.es||1;
  [-1,1].forEach(s=>{
    x.ax('head',RS,0x050404,s*.088,.594,.572,.042*e,.032*e,.03*e);
    x.ax('head',RS,ec,s*.092,.594,.596,.027*e,o.slit?.009*e:.013*e,.008,0,s*-.22,true);
    x.ax('head',RB,0x141010,s*.084,.628,.585,.066*e,.02,.05,0,s*.42);
    if(o.fang){x.ax('head',RC,0xe8e0c8,s*.032,.505,.71,.015*o.fang,.055*o.fang,.015*o.fang,Math.PI);x.ax('jaw',RC,0xe8e0c8,s*.04,.53,.69,.011*o.fang,.04*o.fang,.011*o.fang)}
    if(o.wh)[0,1].forEach(i=>x.ax('head',RY,0x2a2420,s*.13,.548+i*.014,.67-i*.015,.004,.14,.004,0,-s*(Math.PI/2-.18+i*.2)));
  });
  x.ax('head',RS,o.nose||0x0c0c0c,0,.541,.772,.024,.02,.024);
  x.ax('jaw',RS,o.jaw?dkShade(o.jaw,.55):0x2a2020,0,.505,.665,.042,.022,.085);
}
function earsF(x,C,k,h){
  k=k||1;h=h||1;
  [-1,1].forEach(s=>{
    const e=x.axm('head',RC,C,s*.08,.65+.12*h,.47,.13*k,.27*h,.06,-.18,-s*.22);e.userData={rz:-s*.22,sd:s};
    const i=new THREE.Mesh(RC,new THREE.MeshStandardMaterial({color:0x2a1414,roughness:.9,flatShading:true}));i.position.set(0,-.05,.3);i.scale.set(.6,.82,.7);e.add(i);x.ears.push(e);
  });
}
var DKCX={
  Foxlet:(x,C)=>{const d=dkShade(C,.42);[['neck',.6,.4],['chest',.63,.25],['chest',.64,.12],['spine',.63,0],['spine',.62,-.11],['pelvis',.6,-.22]].forEach((a,i)=>x.ax(a[0],RC,d,0,a[1],a[2],.035,.1+(i<3?.03:0),.035,-.6));
    [-1,1].forEach(s=>{x.ax('head',RC,d,s*.12,.53,.5,.03,.11,.03,-.3,-s*1.1);x.ax('head',RB,0x1a0c08,s*.06,.6,.62,.012,.06,.01,0,s*.5)})},
  Ashwolf:(x,C)=>{const b=0xb8ad90;x.ax('head',RB,b,0,.64,.55,.12,.03,.17,.12);[-1,1].forEach(s=>{x.ax('head',RB,b,s*.07,.6,.62,.03,.03,.12,0,s*.2);x.ax('head',RC,b,s*.07,.67,.42,.03,.16,.03,-.9,-s*.4);
      [-.06,.04,.14].forEach(z=>x.ax('spine',RB,b,s*.17,.43,z,.012,.13,.016,0,s*.25))});
    [['neck',.64,.4],['chest',.66,.27],['chest',.67,.15],['chest',.66,.05],['spine',.65,-.06],['spine',.64,-.16],['pelvis',.62,-.27]].forEach((a,i)=>x.ax(a[0],RC,b,0,a[1],a[2],.04-i*.002,.17-i*.012,.04,-.55));
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2;x.ax('neck',RC,dkShade(C,.6),Math.cos(a)*.13,.52+Math.sin(a)*.09,.36,.04,.16,.04,-1.2,-Math.cos(a)*.6)}},
  Drakelet:(x,C)=>{const b=0xd8c8a0;[-1,1].forEach(s=>{x.ax('head',RC,b,s*.1,.66,.4,.035,.26,.035,-1.25,-s*.35);x.ax('jaw',RC,b,s*.06,.48,.62,.02,.08,.02,Math.PI*.8,-s*.4);x.ax('head',RC,b,s*.11,.6,.52,.02,.08,.02,-.4,-s*1.2)});
    [['tail0',.5,-.45],['tail1',.54,-.66],['tail1',.56,-.78],['tail2',.6,-.9]].forEach(a=>x.ax(a[0],RC,b,0,a[1],a[2],.04,.12,.04,-.5))},
  Stoneshell:(x,C)=>{const R=dkRng(3),dy=(a,b)=>.264+.3*Math.sqrt(Math.max(0,1-(a/.36)**2-(b/.5)**2));
    for(let i=0;i<9;i++){const a=(R()-.5)*.5,b=(R()-.5)*.7;x.axw('spine',RC,i%3?0x3a3a34:0x55554a,a,dy(a,b)+.05,b-.017,.04+R()*.03,.16+R()*.12,.04,(R()-.5)*.6,(R()-.5)*.6)}
    for(let i=0;i<3;i++){const a=(R()-.5)*.4,b=(R()-.5)*.5;x.axw('spine',RC,0x5ae8d0,a,dy(a,b)+.06,b-.017,.025,.13,.025,(R()-.5)*.5,(R()-.5)*.5,true)}},
  Mossfrog:(x,C)=>{for(let i=0;i<6;i++)x.ax(i<3?'spine':'chest',RC,0xb8ad90,(i%2?.06:-.06),.6,-.12+i*.07,.02,.08,.02,-.3);[[.1,.58,-.05],[-.12,.57,.08],[.04,.6,.16]].forEach(q=>x.ax('spine',RS,0x7aff4a,q[0],q[1],q[2],.025,.025,.025,0,0,true));
    for(let i=0;i<5;i++)x.ax('jaw',RC,0x1c2a14,-.06+i*.03,.44,.6,.012,.08,.012,Math.PI)},
  Boneling:(x,C)=>{[-1,1].forEach(s=>{x.ax('head',RC,0xe8e0c8,s*.08,.68,.44,.03,.2,.03,-.8,-s*.5);x.ax('head',RC,0xe8e0c8,s*.11,.72,.36,.015,.08,.015,-1.6,-s*.5)});
    [['chest',.6,.2],['spine',.6,0],['pelvis',.58,-.2]].forEach(a=>x.ax(a[0],RC,0xe8e0c8,0,a[1],a[2],.03,.12,.03,-.4))},
  Batwing:(x,C)=>{[['neck',.62,.38],['chest',.62,.22],['spine',.6,.02],['pelvis',.58,-.2]].forEach(a=>x.ax(a[0],RC,0x1a1420,0,a[1],a[2],.03,.1,.03,-.5));[-1,1].forEach(s=>x.ax('head',RC,0x1a1420,s*.11,.62,.44,.02,.1,.02,-.3,-s*1.2))},
  Skyhawk:(x,C)=>{[-1,0,1].forEach(i=>x.axw('head',RC,0xd8d0b8,i*.03,.95,.32,.018,.13,.018,-1.1,i*.3));for(let i=0;i<9;i++){const a=i/9*Math.PI*2;x.axw('neck',RC,dkShade(C,.45),Math.cos(a)*.08,.78+Math.sin(a)*.05,.29,.03,.12,.03,-1.3,-Math.cos(a)*.6)}},
  Cryptspider:(x,C)=>{for(let i=0;i<7;i++){const a=i/7*Math.PI*2;x.axw('pelvis',RC,0x2a2030,Math.cos(a)*.18,.5+Math.abs(Math.sin(a))*.08,-.18+Math.sin(a)*.12,.025,.12,.025,Math.sin(a)*.5,-Math.cos(a)*.7)}
    x.axw('pelvis',RB,0xff2a20,0,.64,-.18,.05,.01,.1,0,0,true);x.axw('pelvis',RB,0xff2a20,0,.645,-.18,.09,.01,.03,0,0,true);[-1,1].forEach(s=>x.axw('jaw',RC,0xe8e0d0,s*.045,.32,.52,.02,.1,.02,Math.PI*.8,s*.3))},
  Gloomcap:(x,C)=>{for(let i=0;i<9;i++){const a=i*.7;x.axw('head',RS,0xa8ff7a,Math.cos(a)*(.12+(i%3)*.05),.97+((i*3)%4)*.012,Math.sin(a)*(.12+(i%3)*.05),.014,.014,.014,0,0,true)}
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2;x.axw('head',RC,dkShade(C,.5),Math.cos(a)*.26,.75,Math.sin(a)*.26,.02,.1,.02,Math.PI,0)}},
  Wispling:(x,C)=>{for(let i=0;i<5;i++)x.axw('head',RC,0x05080c,-.04+i*.02,.905,.13,.007,.025,.007,i%2?Math.PI:0);[-1,1].forEach(s=>x.axw('fl2',RC,0xbfeaff,s*.22,.56,.09,.01,.07,.01,Math.PI))},
  Gravewyrm:(x,C)=>{for(let i=0;i<7;i++){const a=-1.2+i*.4;x.axw('head',RC,0xd8d0b8,Math.sin(a)*.12,.45+Math.cos(a)*.05,.42,.02,.18,.02,-.8,-Math.sin(a)*.8)}}};
(function(){
  for(const n in DKCX){const S=SPEC[n];if(!S)continue;const o=S.dt;S.dt=(x,C,c)=>{if(o)o(x,C,c);try{DKCX[n](x,C,c)}catch(e){console.error('dk',n,e)}}}
  if(SPEC.Gloomcap){SPEC.Gloomcap.sig=()=>{};SPEC.Gloomcap.pal={bel:[150,138,116],dk:[70,58,48],tip:[176,164,140],nz:.6}}
  if(SPEC.Gloomcap)SPEC.Gloomcap.ex=x=>{[-1,1].forEach(s=>{x.ax('chest',RB,0x050404,s*.045,.6,.1,.05,.022,.02,0,s*.35);x.ax('chest',RB,x.red?0xff2a2a:0xb8ff6a,s*.046,.6,.111,.032,.007,.006,0,s*.35,true);x.ax('chest',RB,0x2a1a14,s*.045,.628,.105,.06,.016,.025,0,s*.5)});
    x.ax('chest',RS,0x120808,0,.535,.105,.045,.016,.015);for(let i=-2;i<=2;i++)x.ax('chest',RC,0xe8e0c8,i*.016,.545,.112,.006,.022,.006,Math.PI)};
  if(SPEC.Skyhawk){const o=SPEC.Skyhawk.ex;SPEC.Skyhawk.ex=x=>{o(x);[-1,1].forEach(s=>{x.ax('head',RS,0x050404,s*.072,.88,.41,.034,.03,.03);x.ax('head',RS,x.red?0xff2a2a:0xffb020,s*.076,.88,.43,.024,.009,.006,0,s*-.25,true);x.ax('head',RB,0x141010,s*.07,.905,.42,.05,.014,.04,0,s*.45)})}}
  if(SPEC.Mossfrog){SPEC.Mossfrog.ex=x=>{[-1,1].forEach(s=>{x.ax('head',RS,0x0a0a06,s*.09,.675,.54,.042,.04,.04);x.ax('head',RS,x.red?0xff2a2a:0xd8ff40,s*.095,.675,.578,.03,.01,.008,0,0,true)});x.ax('head',RY,0x0c140a,0,.535,.6,.004,.2,.004,0,Math.PI/2);x.ax('jaw',RS,0x6a7a4a,0,.49,.58,.06,.04,.07)}}
  if(typeof LMAT!='undefined'){LMAT.flatShading=true;LMAT.needsUpdate=true}
})();

// darker mouths and claws on the shared quadruped detail layer
function qdt(x,o){
  const C=x.C,t=o.tooth||0xe8e0c8,cw=o.claw||0x1a1614,cs=(o.cl||1)*1.3;
  TOE.forEach(f=>[-1,0,1].forEach(i=>{x.ax(f[0],RS,o.toe||C,f[1]+i*.02,.022,f[2]+.03+(i?0:.018),.021,.016,.026);if(!o.noclaw)x.ax(f[0],RC,cw,f[1]+i*.022,.02,f[2]+.075+(i?0:.018),.008*cs,.03*cs,.008*cs,Math.PI/2)}));
  [-1,1].forEach(s=>{x.ax('head',RS,0x050505,s*.011,.545,.793,.006,.006,.006);[0,1,2].forEach(i=>x.ax('head',RC,t,s*(.022+.004*i),.508,.64+.025*i,.008,.028,.008,Math.PI));
    if(o.tuft)x.ax('head',RC,o.tuft,s*.1,.54,.5,.03,.12,.03,-Math.PI/2,-s*.5);if(o.frill)x.ax('head',RC,o.frill,s*.12,.58,.44,.04,.18,.04,-Math.PI/2,-s*.7)});
  x.ax('jaw',RS,0x3a0e10,0,.5,.64,.03,.007,.07);
  if(o.ruff)[-2,-1,0,1,2].forEach(i=>x.ax('chest',RC,dkShade(o.ruff,.6),i*.035,.4,.36,.035,.12,.035,Math.PI));
  if(o.tuft)[['fl1',-.1,.2,.17],['fr1',.1,.2,.17],['hl1',-.11,.22,-.2],['hr1',.11,.22,-.2]].forEach(f=>x.ax(f[0],RC,o.tuft,f[1],f[2],f[3],.03,.1,.03,-Math.PI/2.2));
  if(o.ttuft)[-1,1].forEach(s=>[['tail1',.46,-.6],['tail2',.52,-.82]].forEach(f=>x.ax(f[0],RC,o.ttuft,s*.06,f[1],f[2],.04,.12,.04,-.5,-s*1.2)));
  if(o.ridge)[['neck',.6,.42],['neck',.6,.34],['chest',.63,.22],['chest',.62,.1],['spine',.6,-.02],['spine',.6,-.12],['pelvis',.58,-.25],['pelvis',.56,-.33]].forEach(a=>x.ax(a[0],RC,o.ridge,0,a[1],a[2],.03,.1,.03));
}
(function(){
  if(SPEC.Wispling)SPEC.Wispling.ex=x=>{x.axw('head',RS,0x0c121c,0,1.0,-.035,.15,.15,.14);x.axw('head',RC,0x0c121c,0,1.12,-.1,.06,.18,.06,-.9);
    [-1,1].forEach(s=>{x.axw('head',RS,0x020306,s*.05,.99,.12,.03,.05,.02,0,s*.35);x.axw('head',RS,x.red?0xff2a2a:0x9ff0ff,s*.052,.99,.137,.018,.008,.006,0,s*.3,true)});
    x.axw('head',RS,0x020306,0,.915,.125,.035,.05,.015);for(let i=-1;i<=1;i++)x.axw('head',RC,0xc8d8e0,i*.018,.945,.135,.006,.025,.006,Math.PI)};
  if(SPEC.Mossfrog){const o=SPEC.Mossfrog.dt;SPEC.Mossfrog.dt=(x,C,c)=>{o(x,C,c);[-1,1].forEach(s=>{x.ax('head',RB,0x1a2410,s*.09,.715,.53,.07,.02,.06,0,s*.35);x.ax('head',RC,0xb8ad90,s*.12,.72,.48,.02,.09,.02,-.6,-s*.6)});
    for(let i=-3;i<=3;i++)x.ax('head',RC,0xe8e0c8,i*.02,.53,.6,.006,.025,.006,Math.PI);for(let i=0;i<5;i++)x.ax(i<2?'pelvis':i<4?'spine':'chest',RC,0x8a8270,(i%2?-.04:.05),.62,-.25+i*.1,.03,.14,.03,-.4)}}
})();

