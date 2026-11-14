// ================= v232 ending B: "the crown" (the side-with-him ending; plan 'crown' on 4069's player) =================
// Owner (Nov 13 2026): "When the whole roster is cleared he crowns you as markes you as devoted to him. The camera cuts to a gilded
// palace where he sits on a large thrown with you at his side, with a outrageously elaborate fountain of essence in the middle of
// the room."
//   0  Duskhold's fountain: the hero kneels before him; a crown comes down in a shaft of light and settles; his mark lights
//   1  a hard cut to the palace (a set of its own, built high over the town and freed at the end; the world is hidden for it):
//      a round gilded hall under a painted dome, twelve columns and banners with his mark, braziers of essence; in the middle the
//      fountain (four tiers, six serpent spouts, six lesser fountains feeding the great one through the air and through channels in
//      the floor, a crystal at its head and a column of essence rising to the oculus); at the far end the dais and the throne,
//      Ythrael seated, the crowned hero standing at his right hand. The camera walks in, climbs round the fountain and comes to rest
//      on the two of them; the title card.
var EK232={cut0:9.2,Y:620,R:27};
function ek232Tex(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}t.anisotropy=4;return t}
function ek232Hex(c){return '#'+('00000'+c.toString(16)).slice(-6)}
function ek232Eye(x,cx,cy,s,col){x.strokeStyle=col;x.fillStyle=col;x.lineWidth=s*.09;x.lineCap='round';x.beginPath();x.moveTo(cx-s,cy);x.quadraticCurveTo(cx,cy-s*.85,cx+s,cy);x.quadraticCurveTo(cx,cy+s*.85,cx-s,cy);x.stroke();x.beginPath();x.arc(cx,cy,s*.24,0,6.2832);x.fill();
  [[0,-1.1,0,-.8],[0,.8,0,1.1]].forEach(q=>{x.beginPath();x.moveTo(cx+q[0]*s,cy+q[1]*s);x.lineTo(cx+q[2]*s,cy+q[3]*s);x.stroke()})}
function ek232Set(S){const V=THREE.Vector3,g=new THREE.Group(),R=EK232.R,ess=YT232.ess,P={g,spin:[],falls:[],jets:[],drops:[],sat:[],flames:[],feed:[],motes:[],mist:[]};g.name='ek232palace';
  const std=(col,em,ei,o)=>new THREE.MeshStandardMaterial(Object.assign({color:col,roughness:.36,metalness:.55,emissive:em,emissiveIntensity:ei,flatShading:true},o||{}));
  const gold=std(0xc29232,0x4a2c06,.32),gold2=std(0x8a6220,0x2a1804,.3),dark=new THREE.MeshBasicMaterial({color:0x221630}),velvet=new THREE.MeshBasicMaterial({color:0x35103c}),crimson=std(0x6a0c1c,0x2a0408,.7,{metalness:0,roughness:.9});
  const add=(geo,m,x,y,z,par)=>{const o=new THREE.Mesh(geo,m);o.position.set(x||0,y||0,z||0);(par||g).add(o);return o},glowM=(col,op)=>new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op==null?.7:op,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  const sprM={},spr=(col,s,x,y,z,op)=>{const k=col+'|'+(op||1),m=sprM[k]||(sprM[k]=eb232SprMat(col,op==null?.9:op)),o=new THREE.Sprite(m);o.scale.setScalar(s);o.position.set(x,y,z);g.add(o);return o};
  // ---- the shell: floor, wall, dome (painted) ----
  const floorT=ek232Tex(1024,1024,(x,w)=>{const C=w/2,u=C/R;let gr=x.createRadialGradient(C,C,0,C,C,C);gr.addColorStop(0,'#3a2440');gr.addColorStop(.45,'#1c1024');gr.addColorStop(1,'#0c0612');x.fillStyle=gr;x.fillRect(0,0,w,w);
      for(let i=0;i<1400;i++){x.fillStyle='rgba(255,220,160,'+(.02+eb232H(i)*.05)+')';x.fillRect(eb232H(i*3)*w,eb232H(i*7)*w,1+eb232H(i*5)*3,1)}
      x.strokeStyle='#d9a53a';[7.6,8.2,11,14.2,18.5,19.1,24,25.4].forEach((r,i)=>{x.lineWidth=i%2?2:5;x.beginPath();x.arc(C,C,r*u,0,6.2832);x.stroke()});
      for(let i=0;i<48;i++){const a=i/48*6.2832;x.lineWidth=i%4?1.2:3;x.globalAlpha=i%4?.5:.9;x.beginPath();x.moveTo(C+Math.sin(a)*8.2*u,C+Math.cos(a)*8.2*u);x.lineTo(C+Math.sin(a)*(i%2?18.5:24)*u,C+Math.cos(a)*(i%2?18.5:24)*u);x.stroke()}x.globalAlpha=1;
      for(let i=0;i<72;i++){const a=i/72*6.2832,a2=(i+1)/72*6.2832;if(i%2)continue;x.fillStyle='rgba(217,165,58,.5)';x.beginPath();x.moveTo(C+Math.sin(a)*24*u,C+Math.cos(a)*24*u);x.lineTo(C+Math.sin(a2)*24*u,C+Math.cos(a2)*24*u);x.lineTo(C+Math.sin(a2)*25.4*u,C+Math.cos(a2)*25.4*u);x.lineTo(C+Math.sin(a)*25.4*u,C+Math.cos(a)*25.4*u);x.fill()}
      // the six channels: the lesser fountains feed the great one
      ess.forEach((col,i)=>{const a=i/6*6.2832+.5236,x0=C+Math.sin(a)*6.8*u,y0=C-Math.cos(a)*6.8*u,x1=C+Math.sin(a)*12.6*u,y1=C-Math.cos(a)*12.6*u;x.lineCap='round';x.strokeStyle=ek232Hex(col);x.globalAlpha=.25;x.lineWidth=26;x.beginPath();x.moveTo(x0,y0);x.lineTo(x1,y1);x.stroke();x.globalAlpha=1;x.lineWidth=7;x.beginPath();x.moveTo(x0,y0);x.lineTo(x1,y1);x.stroke();
        x.strokeStyle='#d9a53a';x.lineWidth=3;x.beginPath();x.arc(x1,y1,2.4*u,0,6.2832);x.stroke()})});
  add(new THREE.CircleGeometry(R+.5,64).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:floorT}),0,0,0);
  const wallT=ek232Tex(512,1024,(x,w,h)=>{let gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#3a2250');gr.addColorStop(.6,'#24122e');gr.addColorStop(1,'#140a1a');x.fillStyle=gr;x.fillRect(0,0,w,h);
      x.fillStyle='#c8963a';x.fillRect(0,0,w,60);x.fillRect(0,h-90,w,90);x.fillStyle='#8a6220';for(let i=0;i<8;i++){x.fillRect(i*64+8,14,48,10);x.fillRect(i*64+8,36,48,10);x.fillRect(i*64+20,h-66,24,44)}
      x.strokeStyle='#d9a53a';x.lineWidth=10;x.beginPath();x.moveTo(70,h-90);x.lineTo(70,360);x.quadraticCurveTo(70,150,256,120);x.quadraticCurveTo(442,150,442,360);x.lineTo(442,h-90);x.stroke();
      gr=x.createLinearGradient(0,120,0,h);gr.addColorStop(0,'#16081c');gr.addColorStop(1,'#080410');x.fillStyle=gr;x.beginPath();x.moveTo(84,h-90);x.lineTo(84,360);x.quadraticCurveTo(84,170,256,138);x.quadraticCurveTo(428,170,428,360);x.lineTo(428,h-90);x.fill();
      for(let i=0;i<60;i++){x.fillStyle='rgba(255,220,150,'+(.1+eb232H(i*9)*.3)+')';x.beginPath();x.arc(100+eb232H(i)*312,190+eb232H(i*5)*640,1+eb232H(i*3)*1.6,0,6.2832);x.fill()}},[12,1]);
  add(new THREE.CylinderGeometry(R,R,17,48,1,true),new THREE.MeshBasicMaterial({map:wallT,side:THREE.BackSide}),0,8.5,0);
  const domeT=ek232Tex(1024,1024,(x,w)=>{const C=w/2;let gr=x.createRadialGradient(C,C,0,C,C,C);gr.addColorStop(0,'#f6e6ff');gr.addColorStop(.07,'#b88aff');gr.addColorStop(.2,'#3a2060');gr.addColorStop(.7,'#1c1034');gr.addColorStop(1,'#3a2250');x.fillStyle=gr;x.fillRect(0,0,w,w);
      x.strokeStyle='#d9a53a';for(let i=0;i<24;i++){const a=i/24*6.2832;x.lineWidth=i%2?2:5;x.beginPath();x.moveTo(C+Math.sin(a)*40,C+Math.cos(a)*40);x.lineTo(C+Math.sin(a)*C,C+Math.cos(a)*C);x.stroke()}[60,150,270,400,500].forEach(r=>{x.lineWidth=4;x.beginPath();x.arc(C,C,r,0,6.2832);x.stroke()});
      for(let i=0;i<500;i++){const a=eb232H(i)*6.2832,r=70+eb232H(i*3)*430;x.fillStyle='rgba(255,236,190,'+(.3+eb232H(i*7)*.7)+')';x.beginPath();x.arc(C+Math.sin(a)*r,C+Math.cos(a)*r,.8+eb232H(i*5)*2,0,6.2832);x.fill()}
      for(let i=0;i<12;i++){const a=(i+.5)/12*6.2832;ek232Eye(x,C+Math.sin(a)*335,C+Math.cos(a)*335,26,'#d9a53a')}});
  {const q=new THREE.SphereGeometry(R,48,12,0,6.2832,0,Math.PI/2);q.scale(1,.62,1);const uv=q.attributes.uv,ps=q.attributes.position;for(let i=0;i<uv.count;i++){uv.setXY(i,.5+ps.getX(i)/R*.5,.5+ps.getZ(i)/R*.5)}add(q,new THREE.MeshBasicMaterial({map:domeT,side:THREE.BackSide}),0,17,0)}
  // ---- columns, arches, banners ----
  const banT=ek232Tex(128,384,(x,w,h)=>{let gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#7a1030');gr.addColorStop(1,'#3a0828');x.fillStyle=gr;x.fillRect(0,0,w,h);x.fillStyle='#d9a53a';x.fillRect(0,0,w,10);x.fillRect(0,0,7,h);x.fillRect(w-7,0,7,h);for(let i=0;i<8;i++){x.beginPath();x.moveTo(i*16,h-26);x.lineTo(i*16+8,h);x.lineTo(i*16+16,h-26);x.fill()}ek232Eye(x,64,150,38,'#f0c860');x.strokeStyle='#f0c860';x.lineWidth=3;x.beginPath();x.arc(64,150,52,0,6.2832);x.stroke()}),banM=new THREE.MeshBasicMaterial({map:banT,side:THREE.DoubleSide});
  const colG=new THREE.CylinderGeometry(.72,.86,12.6,8),baseG=new THREE.BoxGeometry(2.2,1,2.2),capG=new THREE.BoxGeometry(2.3,.9,2.3),ringG=new THREE.TorusGeometry(.9,.14,4,10).rotateX(Math.PI/2),archG=new THREE.TorusGeometry(6.35,.42,4,12,Math.PI),banG=new THREE.PlaneGeometry(3.6,10.4);
  for(let i=0;i<12;i++){const a=(i+.5)/12*6.2832,x=Math.sin(a)*24.7,z=Math.cos(a)*24.7;add(baseG,gold2,x,.5,z).rotation.y=a;add(colG,i%2?gold:gold2,x,7.3,z);add(capG,gold,x,14.05,z).rotation.y=a;add(ringG,gold,x,1.3,z);add(ringG,gold,x,13.3,z);
    const am=i/12*6.2832,ar=add(archG,gold,Math.sin(am)*23.9,14.4,Math.cos(am)*23.9);ar.rotation.y=am;
    if(i!==6){const b=add(banG,banM,Math.sin(am)*26.2,8.2,Math.cos(am)*26.2);b.rotation.y=am+Math.PI}}
  // ---- braziers of essence ----
  for(let i=0;i<6;i++){const a=i/6*6.2832,x=Math.sin(a)*17.2,z=Math.cos(a)*17.2;add(new THREE.CylinderGeometry(.16,.5,2.2,6),gold2,x,1.1,z);add(new THREE.CylinderGeometry(.85,.3,.6,8),gold,x,2.5,z);
    for(let j=0;j<3;j++)P.flames.push({s:spr(ess[(i+3)%6],1.6-j*.35,x,3.1+j*.55,z,.85),y:3.1+j*.55,i,j})}
  // ---- the carpet, the dais, the throne ----
  const carT=ek232Tex(64,256,(x,w,h)=>{x.fillStyle='#5a0a1c';x.fillRect(0,0,w,h);x.fillStyle='#d9a53a';x.fillRect(0,0,5,h);x.fillRect(w-5,0,5,h);x.fillStyle='rgba(217,165,58,.35)';for(let i=0;i<8;i++){x.beginPath();x.moveTo(32,i*32+4);x.lineTo(44,i*32+16);x.lineTo(32,i*32+28);x.lineTo(20,i*32+16);x.fill()}},[1,6]),carM=new THREE.MeshBasicMaterial({map:carT});
  add(new THREE.PlaneGeometry(3.6,17).rotateX(-Math.PI/2),carM,0,.03,16.6);add(new THREE.PlaneGeometry(3.6,5).rotateX(-Math.PI/2),carM,0,.03,-10.2);
  [[8.8,.45],[7.6,.9],[6.4,1.35]].forEach(([r,h],i)=>{add(new THREE.CylinderGeometry(r,r+.15,.45,40),i===2?dark:gold2,0,h-.225,-19.5);add(new THREE.TorusGeometry(r,.09,4,48).rotateX(Math.PI/2),gold,0,h,-19.5)});
  add(new THREE.PlaneGeometry(3.2,5.4).rotateX(-Math.PI/2),carM,0,1.37,-17.2);
  const TH=new THREE.Group();TH.position.set(0,1.35,-21.4);g.add(TH);P.TH=TH;
  add(new THREE.BoxGeometry(3.1,.72,2.8),gold,0,.36,0,TH);add(new THREE.BoxGeometry(2.1,.16,2.2),velvet,0,.8,.12,TH);
  [-1,1].forEach(s=>{add(new THREE.BoxGeometry(.5,.6,2.6),gold2,s*1.3,1.02,.05,TH);add(new THREE.SphereGeometry(.34,6,5),gold,s*1.3,1.42,1.3,TH);add(new THREE.OctahedronGeometry(.14,0),new THREE.MeshBasicMaterial({color:ess[s>0?5:1]}),s*1.3,1.42,1.62,TH);
    const fin=new THREE.Shape();fin.moveTo(0,0);fin.lineTo(1.5,0);fin.lineTo(.5,6.6);fin.lineTo(0,5.2);const fg=new THREE.ExtrudeGeometry(fin,{depth:.3,bevelEnabled:false});const f=add(fg,gold2,s*2.15,0,-1.5,TH);f.scale.x=s});
  {const sh=new THREE.Shape();sh.moveTo(-1.95,0);sh.lineTo(1.95,0);sh.lineTo(1.95,6.1);sh.quadraticCurveTo(1.6,8.6,0,9.9);sh.quadraticCurveTo(-1.6,8.6,-1.95,6.1);add(new THREE.ExtrudeGeometry(sh,{depth:.55,bevelEnabled:false}),gold,0,0,-1.55,TH);
    const s2=new THREE.Shape();s2.moveTo(-1.4,.9);s2.lineTo(1.4,.9);s2.lineTo(1.4,5.8);s2.quadraticCurveTo(1.1,7.6,0,8.5);s2.quadraticCurveTo(-1.1,7.6,-1.4,5.8);add(new THREE.ExtrudeGeometry(s2,{depth:.12,bevelEnabled:false}),velvet,0,0,-1.02,TH);
    const em=add(new THREE.PlaneGeometry(1.5,1.5),new THREE.MeshBasicMaterial({map:fn232Mark(),color:0xf0c860,transparent:true,side:THREE.DoubleSide}),0,7.0,-.86,TH);P.thMark=em}
  for(let i=0;i<9;i++){const a=(i-4)/4*1.25,l=3.2+(i%2?0:1.5)+(i===4?1.2:0),c=new THREE.ConeGeometry(.3,l,4);c.translate(0,l/2,0);const o=add(c,gold,Math.sin(a)*1.7,7.6+Math.cos(a)*1.9,-1.3,TH);o.rotation.z=-a;
    const tip=new V(Math.sin(a)*(1.7+l),7.6+Math.cos(a)*(1.9+l),-1.3);add(new THREE.OctahedronGeometry(.2,0),new THREE.MeshBasicMaterial({color:ess[i%6]}),tip.x,tip.y,tip.z,TH);const sg=spr(ess[i%6],1.5,0,0,0,.8);TH.add(sg);sg.position.copy(tip)}
  {const halo=add(new THREE.TorusGeometry(5.4,.2,5,48),gold,0,7.4,-2.4,TH);const h2=new THREE.Group();h2.position.set(0,7.4,-2.2);TH.add(h2);P.spin.push([h2,'z',.25]);add(new THREE.TorusGeometry(4.6,.1,4,48),gold2,0,0,0,h2);
    ess.forEach((c,i)=>{const a=i/6*6.2832;add(new THREE.OctahedronGeometry(.3,0),new THREE.MeshBasicMaterial({color:c}),Math.sin(a)*4.6,Math.cos(a)*4.6,0,h2);const s=spr(c,2,0,0,0,.7);h2.add(s);s.position.set(Math.sin(a)*4.6,Math.cos(a)*4.6,0)})}
  // ---- the great fountain ----
  const lathe=(pts,m,seg)=>add(new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg||24),m,0,0,0);
  lathe([[6.3,0],[6.95,0],[7.1,.3],[6.9,.95],[6.5,1.05],[6.3,.8],[6.3,0]],gold);lathe([[1.7,0],[1.3,.7],[.85,1.5],[1.15,2.3],[.75,2.75]],gold2,12);
  lathe([[.7,2.6],[2.6,2.95],[4.3,3.35],[4.45,3.6],[4.1,3.52],[2.4,3.15],[.7,2.9]],gold);lathe([[.95,3.4],[.62,4.3],[.95,5.1]],gold2,12);
  lathe([[.6,4.95],[1.8,5.25],[2.9,5.6],[3.0,5.82],[2.7,5.75],[1.6,5.45],[.6,5.2]],gold);lathe([[.7,5.6],[.45,6.4],[.7,7.1]],gold2,12);
  lathe([[.45,7.0],[1.1,7.2],[1.75,7.5],[1.82,7.68],[1.6,7.62],[1.0,7.4],[.45,7.25]],gold);lathe([[.5,7.5],[.3,8.3],[.62,8.9],[.2,9.2]],gold2,10);
  for(let i=0;i<24;i++){const a=i/24*6.2832;add(new THREE.ConeGeometry(.16,.5,4),gold,Math.sin(a)*6.72,1.28,Math.cos(a)*6.72);if(i%4===0)add(new THREE.OctahedronGeometry(.16,0),new THREE.MeshBasicMaterial({color:ess[(i/4)%6]}),Math.sin(a)*6.72,1.66,Math.cos(a)*6.72)}
  for(let i=0;i<6;i++){const a=i/6*6.2832;add(new THREE.ConeGeometry(.12,.7,4),gold,Math.sin(a)*.62,9.1,Math.cos(a)*.62).rotation.set(Math.cos(a)*.5,0,-Math.sin(a)*.5)}
  const seaT=ek232Tex(256,256,(x,w)=>{x.fillStyle='#1a0c26';x.fillRect(0,0,w,w);const cols=['154,255,90','90,216,255','191,233,255','255,194,74','184,255,58','255,74,90','200,154,255'];for(let i=0;i<70;i++){const px=eb232H(i)*w,py=eb232H(i*3)*w,r=14+eb232H(i*7)*36,gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,'rgba('+cols[i%7]+','+(.4+eb232H(i*5)*.4)+')');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.beginPath();x.arc(px,py,r,0,6.2832);x.fill()}});
  [[6.35,.82],[4.15,3.5],[2.75,5.72],[1.62,7.6]].forEach(([r,y],i)=>{const m=add(new THREE.CircleGeometry(r,32).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:seaT,color:0xffffff}),0,y,0);P.spin.push([m,'y',(i%2?-1:1)*(.12+.05*i)])});
  // falls between the tiers (strands of each essence)
  const strand=new THREE.PlaneGeometry(1,1);strand.translate(0,-.5,0);[[4.3,3.5,.85,20],[2.9,5.75,3.55,14],[1.75,7.62,5.8,10]].forEach(([r,y0,y1,n],ti)=>{for(let j=0;j<n;j++){const a=(j+ti*.5)/n*6.2832,m=glowM(ess[j%6],.6),o=add(strand,m,Math.sin(a)*r,y0,Math.cos(a)*r);o.scale.set(.42-.06*ti,y0-y1,1);o.rotation.y=a;P.falls.push({o,m,j})}});
  // six serpent spouts on the pool's rim, each arcing its own essence into the first bowl
  ess.forEach((c,i)=>{const a=i/6*6.2832,sn=Math.sin(a),cs=Math.cos(a),G=new THREE.Group();G.position.set(sn*6.7,1.0,cs*6.7);G.rotation.y=a;g.add(G);
    add(svTube([[0,0,0],[0,.9,.35],[0,1.7,.1],[0,2.3,-.45],[0,2.6,-.95]],[.34,.3,.26,.24,.3],6),gold,0,0,0,G);add(new THREE.ConeGeometry(.34,.7,5).rotateX(-Math.PI/2-.35),gold2,0,2.66,-1.2,G);add(new THREE.OctahedronGeometry(.1,0),new THREE.MeshBasicMaterial({color:c}),.2,2.82,-1.0,G);add(new THREE.OctahedronGeometry(.1,0),new THREE.MeshBasicMaterial({color:c}),-.2,2.82,-1.0,G);
    const A=new V(sn*5.3,3.55,cs*5.3),C=new V(sn*3.4,3.6,cs*3.4),B=new V(sn*4.4,5.4,cs*4.4),pts=[];for(let k=0;k<=10;k++){const u=k/10,w=1-u;pts.push([w*w*A.x+2*w*u*B.x+u*u*C.x,w*w*A.y+2*w*u*B.y+u*u*C.y,w*w*A.z+2*w*u*B.z+u*u*C.z])}
    const jm=glowM(c,.75);add(svTube(pts,pts.map((_,k)=>.1+.05*Math.sin(k/10*Math.PI)),5),jm,0,0,0);P.jets.push({m:jm,i});for(let k=0;k<4;k++)P.drops.push({s:spr(c,.5,0,0,0,.95),A,B,C,ph:k/4+i*.13})});
  // six lesser fountains round it, one per essence, feeding the crystal through the air
  ess.forEach((c,i)=>{const a=i/6*6.2832+.5236,x=Math.sin(a)*12.6,z=Math.cos(a)*12.6;const G=new THREE.Group();G.position.set(x,0,z);g.add(G);
    add(new THREE.LatheGeometry([[1.7,0],[2.05,0],[2.15,.5],[1.9,.62],[1.75,.4],[1.7,0]].map(p=>new THREE.Vector2(p[0],p[1])),14),gold,0,0,0,G);add(new THREE.CircleGeometry(1.76,18).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:c}),0,.46,0,G).material.color.multiplyScalar(.75);
    add(new THREE.LatheGeometry([[.5,0],[.3,.8],[.22,1.6],[.9,1.95],[1.0,2.1],[.8,2.05],[.2,1.8]].map(p=>new THREE.Vector2(p[0],p[1])),10),gold2,0,0,0,G);add(new THREE.OctahedronGeometry(.26,0),new THREE.MeshBasicMaterial({color:c}),0,2.75,0,G);
    const jet=add(new THREE.CylinderGeometry(.09,.2,2.4,6,1,true),glowM(c,.7),0,3.3,0,G),gl=spr(c,3.2,x,2.8,z,.6);P.sat.push({jet,gl,i});
    const A=new V(x,3.0,z),C=new V(0,9.9,0),B=new V(x*.62,14.5,z*.62),sp=[];for(let k=0;k<12;k++)sp.push(spr(c,.6,0,0,0,.95));P.feed.push({sp,A,B,C,i})});
  // the crystal at its head and the column to the oculus
  const cry=add(new THREE.OctahedronGeometry(.62,0),new THREE.MeshBasicMaterial({color:0xffffff}),0,9.95,0);cry.scale.set(1,1.7,1);P.cry=cry;P.cryG=spr(0xffffff,6.5,0,9.95,0,.75);P.cryM=P.cryG.material=P.cryG.material.clone();
  P.col=add(new THREE.CylinderGeometry(1.5,.45,22,12,1,true),glowM(0xd8b8ff,.3),0,21,0);P.col2=add(new THREE.CylinderGeometry(.5,.2,22,8,1,true),glowM(0xffffff,.45),0,21,0);
  for(let i=0;i<46;i++)P.motes.push({s:spr(ess[i%6],.4,0,0,0,.95),ph:eb232H(i*3),r:.5+eb232H(i*7)*1.5,a:eb232H(i*11)*6.28});
  for(let i=0;i<12;i++){const a=i/12*6.2832;P.mist.push({s:spr(ess[i%6],7.5,Math.sin(a)*6.2,1.4,Math.cos(a)*6.2,.12),a})}
  g.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=false;o.receiveShadow=false}});return P}
function ek232SetTick(P,t){const ess=YT232.ess,c0=new THREE.Color(),c1=new THREE.Color();P.spin.forEach(([o,ax,v])=>{o.rotation[ax]=t*v});
  P.falls.forEach(({m,j})=>{m.opacity=.38+.3*Math.abs(Math.sin(t*3.1+j*1.9))});P.jets.forEach(({m,i})=>{m.opacity=.55+.25*Math.sin(t*4+i)});
  P.drops.forEach(D=>{const u=(t*.9+D.ph)%1,w=1-u;D.s.position.set(w*w*D.A.x+2*w*u*D.B.x+u*u*D.C.x,w*w*D.A.y+2*w*u*D.B.y+u*u*D.C.y,w*w*D.A.z+2*w*u*D.B.z+u*u*D.C.z)});
  P.sat.forEach(({jet,gl,i})=>{jet.scale.y=.85+.2*Math.sin(t*5+i*1.3);gl.scale.setScalar(3+.5*Math.sin(t*3+i))});
  P.feed.forEach(F=>{F.sp.forEach((s,k)=>{const u=(t*.3+k/F.sp.length+F.i*.11)%1,w=1-u;s.position.set(w*w*F.A.x+2*w*u*F.B.x+u*u*F.C.x,w*w*F.A.y+2*w*u*F.B.y+u*u*F.C.y,w*w*F.A.z+2*w*u*F.B.z+u*u*F.C.z);s.scale.setScalar(.3+.5*Math.sin(u*Math.PI))})});
  const ci=Math.floor(t*.7)%6;c0.setHex(ess[ci]);c1.setHex(ess[(ci+1)%6]);c0.lerp(c1,(t*.7)%1);P.cry.material.color.copy(c0).lerp(c1.setRGB(1,1,1),.35);P.cry.rotation.y=t*.9;P.cry.position.y=9.95+.18*Math.sin(t*1.4);P.cryM.color.copy(c0);P.cryG.position.y=P.cry.position.y;
  P.col.material.color.copy(c0);P.col.material.opacity=.24+.08*Math.sin(t*2.3);P.col.rotation.y=t*.3;
  P.motes.forEach(M=>{const u=(t*.16+M.ph)%1,a=M.a+t*1.2+u*5;M.s.position.set(Math.sin(a)*M.r*(1-.5*u),10+u*20,Math.cos(a)*M.r*(1-.5*u));M.s.scale.setScalar(.25+.3*Math.sin(u*Math.PI))});
  P.mist.forEach((M,i)=>{M.s.position.set(Math.sin(M.a+t*.05)*6.2,1.4+.4*Math.sin(t*.6+i),Math.cos(M.a+t*.05)*6.2)});
  P.flames.forEach(F=>{F.s.position.y=F.y+.12*Math.sin(t*9+F.i*2+F.j);F.s.scale.setScalar((1.6-F.j*.35)*(.85+.25*Math.sin(t*11+F.i+F.j*2)))})}
// the camera's road through the hall (Catmull-Rom through the keys; set-local)
var EK232_CAM=[[9.2,[0,1.5,25.6],[0,4.2,0]],[13.5,[0,2.4,18.5],[0,5.2,0]],[17.2,[7.5,4.6,13.2],[0,6,0]],[20.6,[13.2,8.6,3.5],[0,6.2,0]],[23.8,[10.6,10.2,-6.5],[0,5.2,-8]],[27.2,[4.8,5.6,-7.5],[.8,3.4,-21]],[30.6,[2.7,3.35,-15.2],[1.15,2.85,-21]],[34.2,[2.4,3.25,-16.3],[1.2,2.8,-21]]];
function ek232Cam(t){const K=EK232_CAM,n=K.length;let i=0;while(i<n-2&&t>=K[i+1][0])i++;const a=K[Math.max(0,i-1)],b=K[i],c=K[i+1],d=K[Math.min(n-1,i+2)],u=Math.max(0,Math.min(1,(t-b[0])/(c[0]-b[0])));
  const cr=(j,q)=>{const p0=a[j][q],p1=b[j][q],p2=c[j][q],p3=d[j][q];return .5*((2*p1)+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u)};
  return {p:new THREE.Vector3(cr(1,0),cr(1,1),cr(1,2)),l:new THREE.Vector3(cr(2,0),cr(2,1),cr(2,2))}}
function ek232HeroBones(){let h=null;try{if(pl.bones&&pl.bones.head)h=pl;else pl.traverse(o=>{if(!h&&o.bones&&o.bones.head)h=o})}catch(_){}return h&&h.bones}
ec232Reg('crown',{len:37.2,cut:35.2,skipT:34,dips:[[9.2,.55]],
  lines:[{a:1.0,b:3.6,s:'All four. Broken.'},{a:4.4,b:7.4,s:'Wear what is mine. Be what is mine.'},{a:10.6,b:14.2,s:'Once, this was a hole under a town.'},{a:16.0,b:20.2,s:'Now every drop they hoarded runs for me.'},{a:23.2,b:26.6,s:'And for the one who knelt.'},{a:28.0,b:31.0,s:'Stand at my side. Always.'}],
  title:{a:31.4,b:35.2,h:'Devoted',s:'CROWNED BY THE VOICE BELOW',top:'15%'},
  build(S){const V=THREE.Vector3,T=TOWNS[0];S.T=T;S.y0=GH(T.cx,T.cy);let N=FN229.npc;if(!N)try{N=fn229Npc()}catch(_){}S.N=N;
    const nx=N?N.x:T.cx+4.4,nz=N?N.z:T.cy+.2,ry=N?N.F.ry0:Math.atan2(nx-T.cx,nz-T.cy);S.nx=nx;S.nz=nz;S.nry=ry;S.H=new V(nx+Math.sin(ry)*1.75,0,nz+Math.cos(ry)*1.75);S.H.y=GH(S.H.x,S.H.z);S.hry=ry+Math.PI;
    // the crown that comes down (shot 0)
    const cg=S.cg=new THREE.Group(),gold=new THREE.MeshStandardMaterial({color:0xe2b24a,roughness:.3,metalness:.8,emissive:0x8a5a10,emissiveIntensity:.9,flatShading:true,side:THREE.DoubleSide}),gm=YT232.ess.map(c=>new THREE.MeshBasicMaterial({color:c}));
    fn232CrownGeo().forEach(([geo,k])=>{geo.userData.keep=1;cg.add(new THREE.Mesh(geo,k=='gold'?gold:gm[+k.slice(1)]))});cg.scale.setScalar(.2);ec232Own(S,cg);
    S.cgl=new THREE.Sprite(eb232SprMat(0xe8d0ff,.9));ec232Own(S,S.cgl);S.shaft=new THREE.Mesh(new THREE.CylinderGeometry(.22,.5,14,10,1,true),new THREE.MeshBasicMaterial({color:0xc89aff,map:SPR,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));S.shaft.position.set(S.H.x,S.H.y+7,S.H.z);ec232Own(S,S.shaft);
    // the palace (shot 1) and the seated Ythrael
    S.O=new V(T.cx,EK232.Y,T.cy);S.set=ek232Set(S);S.set.g.position.copy(S.O);S.set.g.visible=false;ec232Own(S,S.set.g);
    try{const F=S.F=fn229Figure({only:'man'});F.st.robe=1;F.st.eye=1;F.st.flut=.04;fn229Shape(F,1);F.root.scale.setScalar(1.45);F.root.position.set(S.O.x,S.O.y+1.35,S.O.z-20.42);F.root.rotation.y=0;fn229WingSet(F,{open:0});F.root.visible=false;scene.add(F.root)}catch(e){console.warn('ek232 figure',e);S.F=null}
    S.hp=new V(S.O.x+2.75,S.O.y+1.35,S.O.z-19.9)},
  frame(S,t,dt,now){const V=THREE.Vector3,K=ic151K,Sm=ic151Sm,Io=ic151Io,T=S.T,y0=S.y0,pal=t>=EK232.cut0,L=FN229.L;let c;
    // the world is hidden while the palace is shown
    if(pal&&!S.kids){S.kids=[];scene.children.forEach(q=>{if(q.isLight||q===S.set.g||q===pl||(S.F&&q===S.F.root))return;S.kids.push([q,q.visible]);q.visible=false})}
    S.set.g.visible=pal;if(S.F)S.F.root.visible=pal;S.cg.visible=!pal;S.shaft.visible=!pal;S.cgl.visible=!pal;try{L.t.value=t}catch(_){}
    pl.visible=true;
    if(!pal){try{TOD=S.save.tod}catch(_){}
      const kn=Sm(K(t,.4,1.8)),land=6.6,dn=Io(K(t,2.4,land));pl.position.copy(S.H);pl.rotation.y=S.hry;try{animHero(now,false)}catch(_){}
      // the hero kneels: one knee down, the head bowed
      try{const B=ek232HeroBones();if(B){if(S.py0==null&&B.pelvis)S.py0=B.pelvis.position.y;if(B.pelvis)B.pelvis.position.y=S.py0*(1-.57*kn);if(B.lh0)B.lh0.rotation.x+=-1.3*kn;if(B.lh1)B.lh1.rotation.x+=1.45*kn;if(B.rh0)B.rh0.rotation.x+=.3*kn;if(B.rh1)B.rh1.rotation.x+=1.35*kn;if(B.spine)B.spine.rotation.x+=.22*kn;if(B.head)B.head.rotation.x+=.32*kn}}catch(_){}
      // he lifts a hand over the kneeling hero
      if(S.N){const F=S.N.F;F.root.visible=true;F.root.rotation.y=S.nry;const r=Sm(K(t,1.2,3)),br=Math.sin(t*1.3);
        try{fn229Pose(F,Object.assign({},FN229POSE.idle,{ch:[.06*r+.012*br,0,0],nk:[.2*r,0,0],hd:[.14*r,0,0],hR:[.07+.1*r,1.03+.55*r,.21+.42*r],eR:[1,-.2-.3*r,-.2+.4*r],hL:[-.07,1.06+.004*br,.2]}));fn229LightTown({T,y0})}catch(_){}}
      const hy=S.H.y+(S.hh||1.3)*(1-.3*kn),cy=hy+.2+(1-dn)*3.4;S.cg.position.set(S.H.x,cy,S.H.z);S.cg.rotation.y=t*1.6*(1-dn)+S.hry;S.cg.visible=t<land;S.cgl.position.set(S.H.x,cy+.1,S.H.z);S.cgl.scale.setScalar(t<land?1.6+.4*Math.sin(t*6):3.2*(1-K(t,land,land+1.4))+.01);
      S.shaft.material.opacity=.5*Sm(K(t,1.6,3))*(1-.6*K(t,land,land+2));S.shaft.rotation.y=t*.4;
      if(t>=land&&!S.reg){S.reg=1;try{fn232Regalia(pl,1)}catch(_){}}else if(t<land&&S.reg){S.reg=0;try{fn232Regalia(pl,FN232.crown)}catch(_){}}
      const e=Io(K(t,0,land)),e2=Sm(K(t,land-1.2,EK232.cut0)),mx=(S.nx+S.H.x)/2,mz=(S.nz+S.H.z)/2,sx=Math.cos(S.nry),sz=-Math.sin(S.nry);
      const dxn=(S.nx-S.H.x)/1.75,dzn=(S.nz-S.H.z)/1.75,pw=new V(mx+sx*(3.9-1.0*e),y0+1.55+.3*e,mz+sz*(3.9-1.0*e)),pc=new V(S.H.x+sx*2.1+dxn*.9,y0+1.3,S.H.z+sz*2.1+dzn*.9),p=pw.lerp(pc,e2),l=new V(mx,y0+1.3,mz).lerp(new V(S.H.x,y0+1.02,S.H.z),e2);
      const fl=t>=land?Math.max(0,1-(t-land)/.7):0;c={p,l,fov:44-8*e2,F:new V(T.cx,0,T.cy),i:0,grade:fl>0?'brightness('+(1+1.1*fl).toFixed(3)+')':''}}
    else{try{TOD=.2}catch(_){}ek232SetTick(S.set,t);if(!S.reg){S.reg=1;try{fn232Regalia(pl,1)}catch(_){}}
      pl.position.copy(S.hp);pl.rotation.y=-.18;try{animHero(now,false)}catch(_){}try{const B=ek232HeroBones();if(B&&B.pelvis&&S.py0!=null)B.pelvis.position.y=S.py0}catch(_){}
      if(S.F){const F=S.F,br=Math.sin(t*1.1);try{fn229Pose(F,Object.assign({},FN229POSE.idle,{pos:[0,-.4,0],pr:[-.1,0,0],sp:[-.04+.008*br,0,0],ch:[.02+.01*br,0,0],nk:[.1,.1*Math.sin(t*.3),0],hd:[.06,.12*Math.sin(t*.3),0],fL:[-.17,0,.6],fR:[.17,0,.56],kL:[-.25,0,1],kR:[.25,0,1],hL:[-.22,.68,.44],hR:[.22,.68,.44],eL:[-1,-.3,-.4],eR:[1,-.3,-.4]}))}catch(_){}
        try{const O=S.O;L.hemiS.value.setRGB(.62,.5,.46);L.hemiG.value.setRGB(.32,.2,.16);L.keyD.value.set(.25,.7,.65).normalize();L.keyC.value.setRGB(1.0,.82,.55);L.rimC.value.setRGB(.6,.4,.9);L.rimP.value=2.5;
          fn229Lt(0,O.x,O.y+9,O.z,.8,.6,1.0,34);fn229Lt(1,O.x+2,O.y+5,O.z-15,1.0,.75,.4,14);fn229Lt(2,O.x-4,O.y+6,O.z-19,.7,.4,.9,12);fn229Lt(3,O.x,O.y+9,O.z-23,1.0,.8,.4,10)}catch(_){}}
      const q=ek232Cam(Math.min(t,34.2));c={p:q.p.add(S.O),l:q.l.add(S.O),fov:50-9*Sm(K(t,26,31)),F:new V(S.O.x,S.O.y,S.O.z),set:true,i:1,grade:'saturate(1.12)'}}
    return c},
  after(S,t,c){if(!c.set)return;try{scene.fog.density=.0035;scene.fog.color.setRGB(.2,.12,.2)}catch(_){}
    try{const O=S.O;sun.color.setRGB(1,.86,.62);sun.intensity=1.7;sun.position.set(O.x+12,O.y+40,O.z+22);sun.target.position.set(O.x,O.y+3,O.z-8);sun.target.updateMatrixWorld();hemi.color.setRGB(1,.85,.7);hemi.groundColor.setRGB(.42,.26,.3);hemi.intensity=.62}catch(_){}
    try{ren.setClearColor(0x0a0610,1)}catch(_){}},
  back(S){try{if(S.kids)S.kids.forEach(([q,v])=>{q.visible=v});S.kids=null}catch(_){}
    try{if(S.F)fn229FigFree(S.F)}catch(_){}
    try{const B=ek232HeroBones();if(B&&B.pelvis&&S.py0!=null)B.pelvis.position.y=S.py0}catch(_){}
    try{fn232Regalia(pl,FN232.crown)}catch(_){}
    try{if(S.N){const N=S.N;N.F.root.rotation.y=N.ry=N.F.ry0;fn229Pose(N.F,FN229POSE.idle)}}catch(_){}},
  score(ac,out,T0,S){const C0=EK232.cut0;
    ec232Pad(ac,out,T0,C0+.6,[73.42,110,146.83],.3,'triangle',2.5,2);ec232Pad(ac,out,T0+2.4,5,[293.66,349.23,440],.14,'sine',2.5,1.5);ec232Air(ac,out,T0+2.4,4.4,300,2400,.1);
    ec232Bell(ac,out,T0+6.6,146.83,.3,6);ec232Bell(ac,out,T0+6.6,587.33,.16,5);ec232Bell(ac,out,T0+C0,73.42,.4,8);
    [[0,[73.42,146.83,174.61,220,293.66]],[6.2,[58.27,116.54,174.61,233.08,293.66]],[12.4,[49,98,146.83,196,233.08]],[18.6,[55,110,164.81,220,277.18,329.63]]].forEach(([d,f],i)=>{ec232Pad(ac,out,T0+C0+.2+d,i===3?9:7.2,f,.4+.03*i,'sawtooth'===0?'sine':'triangle',1.6,2.2);ec232Pad(ac,out,T0+C0+.2+d,i===3?9:7.2,f.slice(2).map(x=>x*2),.12,'sine',2.2,2.6)});
    [3,9.2,15.4,21.6].forEach((d,i)=>ec232Bell(ac,out,T0+C0+d,[293.66,233.08,196,440][i],.14,6));ec232Air(ac,out,T0+C0+.5,25,900,1800,.05)}});
