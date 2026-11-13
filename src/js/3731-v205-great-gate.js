// ================= v205 The Citadel I · the Great Gate: the gatehouse that replaces I's gateway, its blood seal, its doors =================
// The owner: "change the portal to a large gate (make it good looking) that leads to the next instance". Where I's road ends, the
// castle wall round the gateway clearing opens on a gatehouse of the vampire court (cq205Gatehouse, also used for II's rampart gate
// and III's Eclipse Door with other options):
//  * a front wall of dark ashlar (bevelled plinth, string courses, pilasters) with a pointed arch: voussoirs, a horned keystone,
//    a carved bat-winged crest with ruby eyes over it; two round towers (battered plinths, arrow slits glowing red, corbelled
//    parapets with merlons, slate cones with iron finials); a machicolated gallery between them; crimson banners; gargoyles
//    crouched on the flanking plinths; three wide steps.
//  * two iron-bound doors (hinged leaves of black oak: straps, studs, ring knockers) and, while sealed, the BLOOD SEAL across them:
//    a sigil burnt into the air (a canvas sigil, additive), four seal rings turning at different speeds, and two chains of blood
//    crossed over the doors, staked into the towers. Each quarter of Cheddar's unbinding (3733) breaks a ring; the last one breaks
//    the chains and the sigil, the doors grind open on a passage full of red light: F there goes to II.
// The gatehouse stands at the clearing's far edge (a = reach + .5 along the frame, local +z toward the road); its walls are solid
// (CBLK), the doorway too while sealed; the castle-wall blocks and decorations inside its footprint are hidden (cq205ClearFoot).
var GG205={S:null,err:0,F:null};
function gg205Spot(){const F=cq205F(0),a=F.reach+.5,[x,z]=F.W2(a,0);return {F,a,x,z,ry:Math.atan2(-F.fx,-F.fz),y:F.y0}}
// local (gate) → world, for a spot: x across (local +x), z toward the road
function cq205GW(S,lx,lz){const c=Math.cos(S.ry),s=Math.sin(S.ry);return [S.x+lx*c+lz*s,S.z-lx*s+lz*c]}
// ---------------- shapes ----------------
// a pointed (two-centred) arch: half width w2, spring height hs, rise d above the spring line; points up the right side and over
function cq205ArchArc(w2,hs,d,n){const R=(w2*w2+d*d)/(2*w2),cx=w2-R,th=Math.atan2(d,-cx),P=[];for(let i=0;i<=n;i++){const a=th*i/n;P.push([cx+R*Math.cos(a),hs+R*Math.sin(a)])}return P}   // from (w2,hs) to (0,hs+d)
// the front wall: a slab W x Ht with the arch cut out of its foot (one outline, no holes)
function cq205WallPts(W,Ht,w2,hs,d){const A=cq205ArchArc(w2,hs,d,10);
  return [[-W/2,0],[-w2,0]].concat(A.map(p=>[-p[0],p[1]])).concat(A.slice(0,-1).reverse()).concat([[w2,0],[W/2,0],[W/2,Ht],[-W/2,Ht]])}
// the arch opening itself (for the passage behind the doors)
function cq205OpenPts(w2,hs,d){const A=cq205ArchArc(w2,hs,d,10);return [[-w2,0],[w2,0]].concat(A).concat(A.slice(0,-1).reverse().map(p=>[-p[0],p[1]]))}
// one door leaf, its hinge at x 0, reaching toward the middle (sgn +1: to +x, -1: to -x): the half arch
function cq205LeafPts(w2,hs,d,sgn){const A=cq205ArchArc(w2,hs,d,8);return [[0,0],[w2,0]].concat(A.slice().reverse().map(p=>[w2-p[0],p[1]])).map(p=>[sgn<0?-p[0]:p[0],p[1]])}
// the blood sigil (canvas): rings of runes, eight spokes, a winged crest at the heart
function cq205SigilTex(kind){const key='sig_'+(kind||'blood');GG205.tex=GG205.tex||{};if(GG205.tex[key])return GG205.tex[key];const N=512,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),C=N/2,rn=svRng(kind==='eclipse'?2053:2051);
  x.clearRect(0,0,N,N);x.lineCap='round';x.lineJoin='round';const glow=(w,a)=>{x.lineWidth=w;x.strokeStyle='rgba(255,255,255,'+a+')'};
  const circ=(r,w,a)=>{glow(w,a);x.beginPath();x.arc(C,C,r,0,Math.PI*2);x.stroke()};
  circ(246,5,.9);circ(232,2,.6);circ(176,4,.85);circ(160,2,.5);circ(96,3,.8);
  // runes between the outer rings
  for(let i=0;i<36;i++){const a=i/36*Math.PI*2,r=204;x.save();x.translate(C+Math.cos(a)*r,C+Math.sin(a)*r);x.rotate(a+Math.PI/2);glow(3,.85);x.beginPath();
    const k=Math.floor(rn()*5);if(k==0){x.moveTo(-7,-9);x.lineTo(0,9);x.lineTo(7,-9)}else if(k==1){x.moveTo(0,-10);x.lineTo(0,10);x.moveTo(-7,-3);x.lineTo(7,3)}else if(k==2){x.arc(0,0,7,.4,Math.PI*1.6);x.moveTo(0,-10);x.lineTo(0,10)}else if(k==3){x.moveTo(-7,9);x.lineTo(0,-9);x.lineTo(7,9);x.moveTo(-4,2);x.lineTo(4,2)}else{x.moveTo(-6,-8);x.lineTo(6,8);x.moveTo(6,-8);x.lineTo(-6,8);x.moveTo(0,-10);x.lineTo(0,-4)}
    x.stroke();x.restore()}
  // the spokes and a star between the inner rings
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;glow(3,.7);x.beginPath();x.moveTo(C+Math.cos(a)*100,C+Math.sin(a)*100);x.lineTo(C+Math.cos(a)*172,C+Math.sin(a)*172);x.stroke()}
  glow(3,.75);x.beginPath();for(let i=0;i<=7;i++){const a=(i*3/7)*Math.PI*2-Math.PI/2;const px=C+Math.cos(a)*170,py=C+Math.sin(a)*170;i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();
  // the crest: a bat (blood) or a black sun with a corona (eclipse)
  if(kind==='eclipse'){x.fillStyle='rgba(255,255,255,.95)';x.beginPath();x.arc(C,C,70,0,Math.PI*2);x.fill();x.globalCompositeOperation='destination-out';x.beginPath();x.arc(C+14,C-6,62,0,Math.PI*2);x.fill();x.globalCompositeOperation='source-over';
    for(let i=0;i<24;i++){const a=i/24*Math.PI*2;glow(2,.6);x.beginPath();x.moveTo(C+Math.cos(a)*76,C+Math.sin(a)*76);x.lineTo(C+Math.cos(a)*(88+(i%2)*8),C+Math.sin(a)*(88+(i%2)*8));x.stroke()}}
  else{x.fillStyle='rgba(255,255,255,.95)';x.beginPath();const b=[[0,-26],[8,-38],[12,-18],[30,-30],[58,-36],[84,-12],[66,-10],[60,4],[44,-2],[34,14],[20,4],[8,22],[0,34]];
    x.moveTo(C,C+b[0][1]);b.forEach(p=>x.lineTo(C+p[0],C+p[1]));b.slice().reverse().forEach(p=>x.lineTo(C-p[0],C+p[1]));x.closePath();x.fill();
    x.globalCompositeOperation='destination-out';[[-9,-14],[9,-14]].forEach(p=>{x.beginPath();x.arc(C+p[0],C+p[1],3.5,0,Math.PI*2);x.fill()});x.globalCompositeOperation='source-over'}
  const t=new THREE.CanvasTexture(c);t.anisotropy=2;return GG205.tex[key]=t}
// one ring of the seal (a thin band with notches, canvas), for the four turning rings
function cq205RingTex(){if(GG205.rtex)return GG205.rtex;const N=512,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),C=N/2;x.strokeStyle='#fff';
  x.lineWidth=10;x.beginPath();x.arc(C,C,236,0,Math.PI*2);x.stroke();x.lineWidth=3;x.beginPath();x.arc(C,C,218,0,Math.PI*2);x.stroke();
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2;x.lineWidth=i%3?3:7;x.beginPath();x.moveTo(C+Math.cos(a)*218,C+Math.sin(a)*218);x.lineTo(C+Math.cos(a)*(i%3?236:250),C+Math.sin(a)*(i%3?236:250));x.stroke()}
  const t=new THREE.CanvasTexture(c);return GG205.rtex=t}
// ---------------- the gatehouse (o: kind 'blood' | 'rampart' | 'eclipse'; returns {g, doors:[L,R], port, seal, light, pass}) ----------------
function cq205Gatehouse(o){o=o||{};const kind=o.kind||'blood',RAM=kind==='rampart',ECL=kind==='eclipse';
  const W0=RAM?12.5:14.5,Ht=RAM?10.5:13,w2=RAM?2.9:3.25,hs=RAM?4.6:5.6,dA=RAM?2.6:3.6,tr=RAM?2.6:3.1,tx=RAM?7.5:8.7,tH=RAM?13.5:16.5,dep=3.0,fz=.6;
  const C=ECL?{st:0x2a2630,st2:0x1c1a22,st3:0x3e3846,trim:0x524a5a,roof:0x18161c,iron:0x26262c,wood:0x1c1416,gold:0x7a6a3a,ban:0x1a1020,ban2:0x6a5a2a,glow:0xffc070}
    :RAM?{st:0x4a4246,st2:0x352f34,st3:0x5c5458,trim:0x6e6468,roof:0x2a2426,iron:0x2c2c32,wood:0x2e2018,gold:0x7a6234,ban:0x5a0c14,ban2:0x8a6a30,glow:0xff2a30}
    :{st:0x524852,st2:0x342c33,st3:0x645a64,trim:0x7c6e76,roof:0x231d24,iron:0x2a2a30,wood:0x2a1a14,gold:0x8a6a34,ban:0x5e0a16,ban2:0x9a7a3a,glow:0xff2030};
  const key='CQ205|gate|'+kind,BB=dt168BBox,P=(k,geo,t,col,x,y,z,rx,ry,rz,sx,sy,sz)=>dt168P(k,geo,t,col,dt168Mx(x,y,z,rx,ry,rz,sx,sy,sz));
  const W={c:{g:[3.2,.32],n:.12,s:.22,m:[0x2a3a24,.35,.62],l:[0x6a6a60,.4],sd:205},m:{g:[2,.2],n:.1,sd:206}};
  const g=new THREE.Group();g.name='CQ205Gate_'+kind;
  g.add(dt168Group(key,k=>{const rn=dkRng(2050+(RAM?1:ECL?2:0));
    // ---- the front wall with the arch, its plinth, string courses, pilasters, the gallery above ----
    P(k,dt168Ext('cqw'+kind,cq205WallPts(W0,Ht,w2,hs,dA),dep,.06),'c',C.st,0,0,fz-dep/2);
    P(k,BB(W0+.6,1.1,dep+.6,.08),'c',C.st2,0,.55,fz-dep/2);                                 // the battered plinth
    [-1,1].forEach(s=>{const wd=W0/2-w2;P(k,BB(wd+.15,.28,dep+.3,.05),'c',C.trim,s*(w2+wd/2+.07),3.4,fz-dep/2)});
    [-1,1].forEach(s=>{P(k,BB(.9,Ht-.6,.5,.06),'c',C.st3,s*(w2+1.55),Ht/2,fz+.15);P(k,BB(1.05,.5,.65,.06),'c',C.trim,s*(w2+1.55),Ht-.2,fz+.18)});   // pilasters
    // the voussoirs round the arch and the horned keystone
    {const A=cq205ArchArc(w2,hs,dA,9),R=(w2*w2+dA*dA)/(2*w2),cx=w2-R;for(let i=0;i<A.length-1;i++){const p=A[i],q=A[i+1],mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;let nx=mx-cx,ny=my-hs;const nl=Math.hypot(nx,ny)||1;nx/=nl;ny/=nl;
      const ang=Math.atan2(q[1]-p[1],q[0]-p[0]),L=Math.hypot(q[0]-p[0],q[1]-p[1]);[-1,1].forEach(s=>P(k,BB(L*.94,.95,dep+.2,.07),'c',i%2?C.st3:C.trim,s*(mx+nx*.47),my+ny*.47,fz-dep/2+.05,0,0,s>0?ang:Math.PI-ang))}}
    P(k,BB(1.0,1.5,dep+.5,.1),'c',C.trim,0,hs+dA+.35,fz-dep/2+.12);
    [-1,1].forEach(s=>P(k,dt168Geo('cq_kh',()=>svHorn(.16,.9,0,.5,6,5)),'c',C.st2,s*.32,hs+dA+.9,fz+.4,-1.1,s*.5,0));
    // the carved crest over the arch: wings of stone, ruby eyes (blood / rampart), or the black sun (eclipse)
    if(!ECL){const wing=[[0,0],[1.1,.5],[1.9,1.6],[2.9,1.9],[4.2,1.6],[3.6,1.1],[3.4,.4],[2.7,.75],[2.3,0],[1.6,.4],[1.1,-.5],[.4,-.2]];
      [-1,1].forEach(s=>P(k,dt168Ext('cqwing',wing,.32,.05),'c',C.st3,s*.35,hs+dA+1.6,fz+.32,0,s>0?0:Math.PI,0,.62,.62,1));
      P(k,dt168Geo('cq_bh',()=>svLump(.55,1,.18,2061)),'c',C.st3,0,hs+dA+1.75,fz+.3,0,0,0,.9,1,.7);
      [-1,1].forEach(s=>{P(k,dt168Geo('cq_be',()=>new THREE.OctahedronGeometry(.11,0)),'g',C.glow,s*.2,hs+dA+1.85,fz+.72);P(k,dt168Geo('cq_bear',()=>svHorn(.12,.55,0,.15,5,4)),'c',C.st3,s*.35,hs+dA+2.15,fz+.3,-1.4,s*.35,0)})}
    else{P(k,dt168Geo('cq_sun',()=>new THREE.CylinderGeometry(1.25,1.25,.3,20)),'c',0x0c0a10,0,hs+dA+2.0,fz+.3,Math.PI/2,0,0);P(k,dt168Geo('cq_sunr',()=>new THREE.TorusGeometry(1.4,.12,4,24)),'m',C.gold,0,hs+dA+2.0,fz+.36);
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2;P(k,dt168Geo('cq_ray',()=>new THREE.ConeGeometry(.14,.7,4)),'m',C.gold,Math.cos(a)*1.85,hs+dA+2.0+Math.sin(a)*1.85,fz+.33,0,0,a-Math.PI/2)}}
    // ---- the machicolated gallery across the top: corbels, a parapet, merlons ----
    for(let i=0;i<13;i++){const x=-W0/2+.8+i*(W0-1.6)/12;P(k,BB(.4,.8,.6,.05),'c',C.st2,x,Ht-.1,fz+.25)}
    P(k,BB(W0+.2,1.0,.55,.06),'c',C.st,0,Ht+.6,fz+.35);P(k,BB(W0+.2,.25,dep+.6,.05),'c',C.trim,0,Ht+.05,fz-dep/2+.1);
    for(let i=0;i<9;i++){const x=-W0/2+.6+i*(W0-1.2)/8;P(k,BB(.75,.9,.6,.06),'c',i%2?C.st:C.st3,x,Ht+1.55,fz+.33)}
    // ---- the towers: battered plinths, shafts, slits, corbelled parapets, slate cones ----
    [-1,1].forEach(s=>{const X=s*tx,Z=-.5;
      P(k,dt168Lathe([[0,-6],[tr+.7,-6],[tr+.7,.2],[tr+.5,1.4],[tr+.05,1.9],[tr,tH-1.2],[tr+.35,tH-.6],[tr+.35,tH],[0,tH]],12),'c',C.st,X,0,Z);
      P(k,dt168Lathe([[tr+.08,0],[tr+.12,.25],[tr+.12,.5],[tr+.08,.75]],12),'c',C.trim,X,5.2,Z);P(k,dt168Lathe([[tr+.08,0],[tr+.12,.25],[tr+.12,.5],[tr+.08,.75]],12),'c',C.trim,X,10.4,Z);
      for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.31;P(k,BB(.85,1.0,.55,.06),'c',i%2?C.st:C.st3,X+Math.sin(a)*(tr+.2),tH+.45,Z+Math.cos(a)*(tr+.2),0,a,0)}
      P(k,dt168Lathe([[tr+.2,0],[tr-.2,.6],[.12,(RAM?4.2:5.6)],[0,(RAM?4.3:5.7)]],12),'c',C.roof,X,tH+.6,Z);
      P(k,dt168Geo('cq_fin',()=>new THREE.ConeGeometry(.09,1.6,5)),'m',C.iron,X,tH+.6+(RAM?4.9:6.4),Z);P(k,dt168Geo('cq_fb',()=>new THREE.SphereGeometry(.16,6,4)),'m',C.gold,X,tH+.6+(RAM?4.25:5.65),Z);
      // arrow slits facing the clearing, faintly lit from inside
      [[3.4,0],[7.8,.35],[12,-.3]].forEach(([y,da])=>{if(y>tH-1.6)return;const a=da+(s>0?-.45:.45);const px=X+Math.sin(a)*(tr+.02),pz=Z+Math.cos(a)*(tr+.02);
        P(k,BB(.42,1.5,.3,.03),'c',0x0c080a,px,y,pz,0,a,0);P(k,BB(.14,1.0,.04,.01),'g',kind==='eclipse'?0x7a5a2a:0x8a1018,px+Math.sin(a)*.13,y,pz+Math.cos(a)*.13,0,a,0)});
      // the gargoyle on the plinth beside the steps (blood / eclipse) or a war-drum and spears (rampart)
      if(!RAM){const gx=s*(w2+2.6),gz=fz+1.6,gy=1.35;P(k,BB(1.5,1.3,1.5,.08),'c',C.st2,gx,.65,gz);P(k,BB(1.7,.2,1.7,.05),'c',C.trim,gx,1.32,gz);
        P(k,dt168Geo('cq_gb',()=>svLump(.55,1,.22,2071)),'c',C.st3,gx,gy+.5,gz,.5,0,0,1,1.15,.9);P(k,dt168Geo('cq_gh',()=>svLump(.32,1,.2,2072)),'c',C.st3,gx,gy+1.12,gz+.32,0,0,0,1,.9,1.1);
        [-1,1].forEach(q=>{P(k,dt168Geo('cq_gw',()=>svBlade([[0,0],[.5,.5],[.95,1.25],[1.2,1.0],[1.0,.55],[1.25,.35],[.9,.2],[.8,-.15]],.06)),'c',C.st2,gx+q*.35,gy+.75,gz-.2,0,q>0?-.4:Math.PI+.4,q*.2);
          P(k,dt168Geo('cq_ghn',()=>svHorn(.07,.45,0,.25,5,4)),'c',C.st2,gx+q*.15,gy+1.35,gz+.25,-1.2,q*.4,0);P(k,dt168Geo('cq_ge',()=>new THREE.OctahedronGeometry(.05,0)),'g',C.glow,gx+q*.11,gy+1.18,gz+.6)});
        [-1,1].forEach(q=>P(k,BB(.16,.55,.16,.03),'c',C.st2,gx+q*.3,gy+.05,gz+.45,.25,0,0))}
      else{const gx=s*(w2+2.4),gz=fz+1.8;P(k,dt168Lathe([[0,0],[.75,0],[.85,.2],[.85,1.1],[.75,1.3],[0,1.3]],10),'c',0x5a2a1a,gx,0,gz);P(k,dt168Lathe([[0,0],[.86,0],[.86,.12],[0,.12]],10),'c',0xb8a080,gx,1.3,gz);
        for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;P(k,dt168Geo('cq_sp',()=>new THREE.CylinderGeometry(.04,.04,3.2,5)),'c',C.wood,gx+Math.sin(a)*.95,1.5,gz+Math.cos(a)*.95,.12*Math.cos(a),0,-.12*Math.sin(a));P(k,dt168Geo('cq_spt',()=>new THREE.ConeGeometry(.08,.4,4)),'m',0x8a8a90,gx+Math.sin(a)*1.14,3.2,gz+Math.cos(a)*1.14)}}});
    // ---- iron sconces on the pilasters (their flames are sprites, their light pooled) ----
    if(!ECL)[-1,1].forEach(s=>{const x=s*(w2+1.55),y=hs*.72,z=fz+.45;P(k,BB(.16,.5,.16,.02),'m',C.iron,x,y,z+.12);P(k,dt168Geo('cq_sc',()=>new THREE.CylinderGeometry(.2,.1,.32,6)),'m',C.iron,x,y+.35,z+.32);P(k,dt168Geo('cq_scc',()=>svLump(.13,0,.4,2089)),'g',0xff7a2a,x,y+.52,z+.32)});
    // ---- the steps up to the doors ----
    [[0,.15,W0-1.0,3.4],[1,.3,W0-2.6,2.5],[2,.45,2*w2+2.2,1.6]].forEach(([i,y,w,d])=>P(k,BB(w,.15,d,.04),'c',i%2?C.st3:C.st2,0,y-.075,fz+d/2-.05));
    // the deep reveal behind the arch (the jambs' inner faces are the wall's own cut)
    P(k,BB(2*w2+.4,.2,dep,.04),'c',C.st2,0,.1,fz-dep/2);
    // banners hanging from the gallery (cloth strips) with the court's colours
    [-1,1].forEach(s=>{const bx=s*(w2+3.4);k.S('',C.ban,bx,Ht+.95,fz+.62,1.25,RAM?4.6:6.2,0,0,3+(s>0?1:0));P(k,BB(1.5,.12,.12,.02),'m',C.gold,bx,Ht+.95,fz+.66);
      P(k,dt168Geo('cq_bs',()=>new THREE.OctahedronGeometry(.32,0)),'c',C.ban2,bx,Ht-.9,fz+.7,0,0,0,1,1.3,.2)})},W));
  // ---- the doors (two hinged leaves) or the portcullis ----
  const leafKey='CQ205|leaf|'+kind,doors=[];let port=null;
  if(!RAM){[-1,1].forEach(s=>{const piv=new THREE.Group();piv.position.set(s*w2,0,fz-dep/2-.25);g.add(piv);
      piv.add(dt168Group(leafKey+s,k=>{const L=cq205LeafPts(w2,hs,dA,-s).map(p=>[p[0],p[1]]);P(k,dt168Ext('cqleaf'+kind+s,L,.34,.04),'c',C.wood,0,0,0);
        for(let i=0;i<5;i++){const y=.8+i*(hs+dA*.4-.8)/4.5,len=w2*(i<4?.96:.7);P(k,BB(len,.2,.42,.03),'m',C.iron,-s*len/2,y,0);for(let j=0;j<4;j++)P(k,dt168Geo('cq_st',()=>new THREE.ConeGeometry(.07,.12,4)),'m',C.iron,-s*(.35+j*len/4.2),y,.23,Math.PI/2,0,0)}
        P(k,dt168Geo('cq_rg',()=>new THREE.TorusGeometry(.32,.06,4,10)),'m',C.gold,-s*(w2-.55),hs*.55,.3);P(k,dt168Geo('cq_rgb',()=>new THREE.CylinderGeometry(.18,.18,.1,6)),'m',C.iron,-s*(w2-.55),hs*.55+.3,.22,Math.PI/2,0,0)},{c:{g:[2,.25],n:.18,sd:207},m:{n:.1,sd:208}}));
      doors.push(piv)})}
  else{port=new THREE.Group();g.add(port);port.add(dt168Group('CQ205|port',k=>{for(let i=0;i<9;i++){const x=-w2+.35+i*(2*w2-.7)/8;P(k,BB(.16,hs+dA-.3,.16,.02),'m',C.iron,x,(hs+dA-.3)/2,0);P(k,dt168Geo('cq_pt',()=>new THREE.ConeGeometry(.13,.45,4)),'m',C.iron,x,-.2,0,Math.PI,0,0)}
      for(let j=0;j<6;j++){const y=.6+j*(hs+dA-1.2)/5;P(k,BB(2*w2,.14,.2,.02),'m',C.iron,0,y,0)}},{m:{n:.15,g:[3,.3],sd:209}}));port.position.z=fz-dep/2+.3}
  // ---- the passage beyond: black until the way opens, then a haze of light ----
  const pass=new THREE.Mesh(dt168Geo('cq_pass'+kind,()=>new THREE.ShapeGeometry(new THREE.Shape(cq205OpenPts(w2,hs,dA).map(p=>new THREE.Vector2(p[0],p[1]))),8)),
    new THREE.MeshBasicMaterial({color:0x050203,fog:false}));pass.position.set(0,0,fz-dep+.15);g.add(pass);
  const haze=kqSpr(ECL?0xffd890:0xff3a2a,11);haze.material=haze.material.clone();haze.material.opacity=0;haze.position.set(0,hs*.75,fz-dep+.4);g.add(haze);
  // ---- the seal: sigil, four rings, two chains of blood (blood / eclipse) ----
  let seal=null;if(!RAM){seal={g:new THREE.Group(),rings:[],chains:[]};seal.g.position.set(0,hs*.78,fz+.78);g.add(seal.g);const col=ECL?0xffb040:0xff1a2a;
    const sm=new THREE.MeshBasicMaterial({map:cq205SigilTex(ECL?'eclipse':'blood'),color:col,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});
    seal.sig=new THREE.Mesh(new THREE.PlaneGeometry(6.2,6.2),sm);seal.sig.renderOrder=4;seal.g.add(seal.sig);
    for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:cq205RingTex(),color:col,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));
      const r=3.35+i*.5;m.scale.set(r*2,r*2,1);m.position.z=.06+i*.02;m.renderOrder=4;seal.g.add(m);seal.rings.push({m,sp:(i%2?-1:1)*(.18+i*.07),r,on:1})}
    // the chains: two diagonals of glowing links from tower to tower over the doors
    const lm=new THREE.MeshBasicMaterial({color:ECL?0xd09040:0xc8101e,fog:false}),lg=new THREE.TorusGeometry(.2,.055,4,8);
    [[-1,1],[1,1]].forEach(([s],ci)=>{const ch=new THREE.Group(),a=new THREE.Vector3(-s*(tx-tr-.2),hs+dA+.6,fz+.62),b=new THREE.Vector3(s*(tx-tr-.2),.9,fz+.62),N=34;
      for(let i=0;i<N;i++){const t=i/(N-1),p=a.clone().lerp(b,t);p.y-=Math.sin(t*Math.PI)*.5;p.sub(seal.g.position);const l=new THREE.Mesh(lg,lm);l.position.copy(p);l.lookAt(p.clone().add(b.clone().sub(a)));l.rotateX(Math.PI/2);if(i%2)l.rotateY(Math.PI/2);ch.add(l)}
      seal.g.add(ch);seal.chains.push(ch)});
    seal.light=new THREE.PointLight(col,1.6,16,1.6);seal.light.userData.lp=new THREE.Vector3(0,hs*.8,fz+2.6)}
  // the light that pours out once the way is open
  const light=new THREE.PointLight(ECL?0xffd080:0xff4030,0,18,1.4);light.userData.lp=new THREE.Vector3(0,hs*.7,fz+1.5);
  const sc=ECL?[]:[-1,1].map(s=>{const f=kqSpr(0xff8a3a,1.1);f.position.set(s*(w2+1.55),hs*.72+.75,fz+.77);g.add(f);const l=new THREE.PointLight(0xff7a30,.9,9,1.7);l.userData.lp=new THREE.Vector3(s*(w2+1.55),hs*.72+.9,fz+1.3);return {f,l}});
  g.userData.psNo=1;g.traverse(q=>{if(q.isMesh)q.userData.lpsSkip=q.material&&q.material.blending===THREE.AdditiveBlending?1:q.userData.lpsSkip});
  return {g,doors,port,seal,light,pass,haze,sc,dims:{W0,Ht,w2,hs,dA,tr,tx,tH,dep,fz}}}
// point lights go into the scene itself (0620's pool takes them as sources), at their spot in the placed gatehouse
function cq205PlaceLights(G){G.g.updateMatrixWorld(true);[G.light,G.seal&&G.seal.light].concat((G.sc||[]).map(q=>q.l)).forEach(l=>{if(!l)return;l.position.copy(l.userData.lp);G.g.localToWorld(l.position);scene.add(l)})}
// ---------------- the ground it stands on: solid tiles, and the castle wall / decorations it replaces ----------------
// tiles of a gatehouse spot S (cq205GW frame) that are solid; open: the doorway too
function cq205FootTiles(S,dims){const T=[],D=new Set(),add=(lx,lz,door)=>{const [x,z]=cq205GW(S,lx,lz),k=Math.round(z)*W+Math.round(x);if(T.indexOf(k)<0){T.push(k);if(door)D.add(k)}};
  for(let lz=-dims.dep-1;lz<=dims.fz+.3;lz+=.5)for(let lx=-dims.W0/2;lx<=dims.W0/2;lx+=.5)add(lx,lz,Math.abs(lx)<dims.w2-.2&&lz>-dims.dep+.4);
  [-1,1].forEach(s=>{for(let a=0;a<6.3;a+=.2)for(let r=0;r<=dims.tr+.5;r+=.5)add(s*dims.tx+Math.sin(a)*r,-.5+Math.cos(a)*r,false)});
  return {T,D}}
// hide the castle-wall blocks (CITW) and decorations (WD) inside the gatehouse's footprint (a box in its frame, plus its towers)
function cq205ClearFoot(S,dims){const inF=(x,z)=>{const dx=x-S.x,dz=z-S.z,c=Math.cos(S.ry),s=Math.sin(S.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;
    if(Math.abs(lx)<dims.W0/2+.8&&lz>-dims.dep-6&&lz<dims.fz+3.8)return true;return [-1,1].some(q=>Math.hypot(lx-q*dims.tx,lz+.5)<dims.tr+1.4)};
  let n=0;const M=new THREE.Matrix4(),Z=new THREE.Matrix4().makeScale(0,0,0);
  const sweep=m=>{if(!m||!m.isInstancedMesh)return;const a=m.instanceMatrix.array;let ch=false;for(let i=0;i<m.count;i++){const x=a[i*16+12],z=a[i*16+14];if(Math.abs(x-S.x)>30||Math.abs(z-S.z)>30)continue;if(inF(x,z)){m.setMatrixAt(i,Z);ch=true;n++}}if(ch)m.instanceMatrix.needsUpdate=true};
  try{(window.CITW||[]).forEach(sweep)}catch(e){console.warn('v205 clear walls',e)}
  try{if(typeof WD!='undefined'&&WD&&WD.ms)WD.ms.forEach(sweep)}catch(e){console.warn('v205 clear deco',e)}
  return n}
// ---------------- I's gate: build, state, prompt ----------------
function gg205Build(){if(GG205.S)return GG205.S;const S=gg205Spot(),G=cq205Gatehouse({kind:'blood'});G.g.position.set(S.x,S.y-.05,S.z);G.g.rotation.y=S.ry;scene.add(G.g);
  G.spot=S;G.open=0;G.k=0;GG205.S=G;cq205PlaceLights(G);try{G.cleared=cq205ClearFoot(S,G.dims)}catch(_){}
  // the seal's own torches: two braziers at the foot of the steps
  G.br=[-1,1].map(s=>{const [x,z]=cq205GW(S,s*(G.dims.w2+1.2),G.dims.fz+3.9);const b=gg205Brazier();b.position.set(x,GH(x,z),z);scene.add(b);const l=new THREE.PointLight(0xff5a28,1.3,10,1.6);l.position.set(x,GH(x,z)+1.6,z);scene.add(l);b.userData.l=l;return b});
  gg205Sync();return G}
function gg205Brazier(){const g=dt168Group('CQ205|brz',k=>{const P=(geo,t,col,x,y,z,rx,ry,rz,sx,sy,sz)=>dt168P(k,geo,t,col,dt168Mx(x,y,z,rx,ry,rz,sx,sy,sz));
    P(dt168Lathe([[0,0],[.42,0],[.36,.12],[.14,.3],[.11,1.0],[.2,1.08],[.5,1.3],[.56,1.42],[.5,1.45],[0,1.45]],8),'m',0x2a2628,0,0,0);
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2;P(dt168Geo('cq_bl',()=>svHorn(.05,.5,0,.18,4,3)),'m',0x2a2628,Math.sin(a)*.5,1.35,Math.cos(a)*.5,-.9,a,0)}
    P(dt168Geo('cq_coal',()=>svLump(.38,0,.4,2081)),'g',0xff6a2a,0,1.42,0,0,0,0,1,.35,1)},{m:{g:[1.2,.35],n:.12,sd:209}});
  const f=kqSpr(0xff7a30,1.8);f.position.y=1.9;g.add(f);g.userData.f=f;g.userData.psNo=1;return g}
function gg205Sync(){const G=GG205.S;if(!G)return;const open=cq205Done(1),S=G.spot;G.tok=(G.tok||0)+1;
  if(!G.tiles){G.tiles=cq205FootTiles(S,G.dims)}G.tiles.T.forEach(k=>{if(open&&G.tiles.D.has(k))CBLK.delete(k);else CBLK.add(k)});
  // doorway tiles stay solid even open (the void is behind): the gate's prompt takes you through
  G.tiles.D.forEach(k=>CBLK.add(k));
  if(open){G.open=1;G.pass.material.color.setHex(0x4a0a0c);G.doors.forEach((d,i)=>d.rotation.y=(i?-1:1)*1.25);if(G.seal){G.seal.g.visible=false;G.seal.light.intensity=0}G.light.intensity=1.5;G.haze.material.opacity=.55}
  else{G.open=0;G.pass.material.color.setHex(0x050203);G.doors.forEach(d=>d.rotation.y=0);if(G.seal){G.seal.g.visible=true;G.seal.rings.forEach(r=>{r.on=1;r.m.visible=true;r.m.material.opacity=.85});G.seal.chains.forEach(c=>{c.visible=true;c.position.set(0,0,0)});G.seal.sig.material.opacity=.95;G.seal.light.intensity=1.6}
    G.light.intensity=0;G.haze.material.opacity=0}}
// how many rings stand (the unbinding breaks them, 3733)
function gg205RingsUp(){const G=GG205.S;return G&&G.seal?G.seal.rings.filter(r=>r.on).length:0}
function gg205BreakRing(i){const G=GG205.S;if(!G||!G.seal)return;const r=G.seal.rings[i];if(!r||!r.on)return;r.on=0;const p=new THREE.Vector3();G.seal.g.getWorldPosition(p);
  svSnd('crack',1.1,.7);svSnd('bell',.7,.5);shake(.25);for(let k=0;k<40;k++){const a=Math.random()*6.283,q=p.clone();q.x+=Math.cos(a)*r.r*Math.cos(G.spot.ry);q.z-=Math.cos(a)*r.r*Math.sin(G.spot.ry);q.y+=Math.sin(a)*r.r;burst(q,0xff2030,2,1.6,1.2,.7)}
  let t=0;const m=r.m;kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/.6);m.scale.setScalar(r.r*2*(1+k*.6));m.material.opacity=.85*(1-k);return t<.6},end(){m.visible=false;m.scale.setScalar(r.r*2)}})}
// the last ring: the chains snap, the sigil bursts, the doors grind open
function gg205Shatter(){const G=GG205.S;if(!G||G.open)return;G.open=.001;G.seal.rings.forEach((r,i)=>{if(r.on)gg205BreakRing(i)});const p=new THREE.Vector3();G.seal.g.getWorldPosition(p);
  shake(.7);svSnd('crack',1.4,.5);svSnd('roar',.7,.45);try{flash('rgba(255,40,50,.4)')}catch(_){}burst(p,0xff2a3a,140,6,3,1.2);burst(p,0xffe0c0,60,4,2,.9);try{svShock(gY(p,-p.y+GH(p.x,p.z)+.1),0xff3040,12,.9)}catch(_){}
  G.seal.chains.forEach((c,i)=>{const v=(i?1:-1);let t=0;kqFx({tick(dt){t+=dt||0;c.position.y-=dt*(2+t*9);c.position.x+=v*dt*.6;c.children.forEach((l,j)=>{l.material=l.material})
      return t<1.2},end(){c.visible=false}})});
  let t=0;const S=G.seal;kqFx({tick(dt){t+=dt||0;const k=Math.min(1,t/.9);S.sig.scale.setScalar(1+k*.8);S.sig.material.opacity=.95*(1-k);S.light.intensity=1.6+4*(1-k)*(k<.2?k*5:1);return t<.9},end(){S.g.visible=false;S.light.intensity=0}});
  // the doors swing in, slowly, with a groan
  const tok=G.tok=(G.tok||0)+1;cq205After(.9,()=>{if(G.tok!==tok)return;svSnd('heavy',1.1,.4);try{dg165Snd('grind',1,.5);dg165Snd('creak',.9,.45)}catch(_){}let u=0;kqFx({tick(dt){if(G.tok!==tok)return false;u+=dt||0;const k=svEase.io(Math.min(1,u/4.2));G.doors.forEach((d,i)=>d.rotation.y=(i?-1:1)*1.25*k);G.light.intensity=2.2*k;G.haze.material.opacity=.7*k;G.pass.material.color.setRGB(.29*k+.02,.04*k+.01,.05*k+.01);
      if(Math.random()<.4){const q=new THREE.Vector3();G.g.localToWorld(q.set((Math.random()-.5)*6,.2,G.dims.fz-.5));burst(q,0x6a5a5a,2,1,.6,.8)}return u<4.2},end(){if(G.tok===tok)G.open=1}})})}
function gg205AtDoor(){const G=GG205.S;if(!G)return false;const P=pl.position,[x,z]=cq205GW(G.spot,0,G.dims.fz+2.2);return Math.hypot(P.x-x,P.z-z)<4.2}
function gg205Through(){const C=CQ205.c1;if(C.st<4){C.st=4;CQ205.trkK=''}svSnd('whoosh',1,.6);try{insGo(cq205I(1))}catch(e){console.error('v205 gate go',e)}}
// ---------------- the tick ----------------
function gg205Tick(dt,now){const here=cq205Here(0),t=now/1000;if(here&&!GG205.S){try{gg205Build()}catch(e){if(!GG205.err++)console.error('v205 gate build',e)}}const G=GG205.S;if(!G)return;
  G.g.visible=here;if((G.open===0||G.open>=1)&&cq205Done(1)!==(G.open>=1))gg205Sync();G.br.forEach(b=>{b.visible=here;b.userData.l.intensity=here?1.2+.25*Math.sin(t*9+b.position.x):0;b.userData.f.scale.setScalar(1.7+.25*Math.sin(t*11+b.position.z))});if(!here){if(G.seal)G.seal.light.intensity=0;G.light.intensity=0;(G.sc||[]).forEach(q=>q.l.intensity=0);return}
  if(G.seal&&G.seal.g.visible){G.seal.rings.forEach((r,i)=>{if(r.on)r.m.rotation.z+=dt*r.sp});const pu=.8+.2*Math.sin(t*2.2);G.seal.sig.material.opacity=Math.min(1,(typeof US205!='undefined'&&US205.E?1.05:.9)*pu);
    if(!G.open)G.seal.light.intensity=1.2+.5*Math.sin(t*2.2)+(typeof US205!='undefined'&&US205.E?1.2:0)}
  if(G.open>=1){G.haze.material.opacity=.6+.15*Math.sin(t*1.7);G.light.intensity=2+.4*Math.sin(t*2.3)}
  (G.sc||[]).forEach((q,i)=>{q.l.intensity=.8+.2*Math.sin(t*11+i*2);q.f.scale.setScalar(1+.15*Math.sin(t*13+i))})}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{gg205Tick(dt,now)}catch(e){if(!GG205.err++)console.warn('v205 gate tick',e)}return r}}
// ---------------- the prompt at the doors ----------------
function gg205Prompt(){if(!cq205Here(0)||!GG205.S||!gg205AtDoor())return null;const C=CQ205.c1;
  if(GG205.S.open>=1||cq205Done(1)&&GG205.S.open>=1){const N=cq205I(1);return {label:'F · Pass through the Great Gate to '+N.n+' ('+rpTxt139(N.lv[0])+')',fn:()=>gg205Through()}}
  if(typeof US205!='undefined'&&US205.E)return null;
  return {label:'🔒 The Great Gate · sealed in blood',fn:()=>say(C.st<1?'🩸 A seal of blood holds the doors: four rings of burning runes and two chains of it, staked into the towers. A small figure in a scarf is studying it.':'🩸 The seal holds. Cheddar says it unwinds only with the court’s own blood.')}}
{const f=worldPrompt;worldPrompt=function(){try{const r=gg205Prompt();if(r)return r}catch(e){if(!GG205.err++)console.warn('v205 gate prompt',e)}return f.apply(this,arguments)}}
CQ205L.push(()=>{if(GG205.S)gg205Sync()});
// the minimap and N map show the gate (2380's marks for Cheddar's gateway spot use the hidden portal's record)
