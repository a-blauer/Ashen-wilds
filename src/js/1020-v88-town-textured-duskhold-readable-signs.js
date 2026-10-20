// ================= v88: town — textured Duskhold, readable signs, a kingdom that visibly grows =================
// Duskhold is built at load (long before this file runs), so everything the first build needs is a hoisted
// function declaration that replaces the v83 one of the same name, plus lazily created vars.
//
// 1. TEXTURES  · one procedural atlas (txaInit) painted at load: wood grain, boards, end grain, bark, rough stone,
//    cut stone, slate, shakes, thatch, iron, brass, plaster, cloth, straw, leaves, leaded glass, soil.
//    twBake (the v83 merger) now also writes world-scaled UVs per face and an atlas tile per vertex (aTl), so planks,
//    stones and shingles keep their real size on any box/cylinder. The texture multiplies the old vertex colours,
//    so the palette, per-face shading and ground AO stay. Far away the texture fades to its average (no shimmer).
//    The tile is picked from the helper that made the part (k.mt, set by the twStones/twGable/... wrappers
//    — pV10 renames the v83 helpers to *_0) or, failing that, from the part's colour and shape (twClass).
// 2. SIGNS     · sign() builds a plank board with iron corner straps and hanging eyes, painted text on both faces
//    (text comes from txTex, so any txTex hook also styles sign text). Posts now stand beside the board
//    (twSignPost) instead of in front of the text.
// 3. KINGDOM   · kdSync() (called from shApply) rebuilds the walls and the upgrade structures from SH.lv:
//    walls 0 palisade → 1 stone-footed palisade → 2 stone curtain wall with crenellations → 3 fortified bastion
//    with mid-wall towers, braziers and an iron portcullis; Training Grounds, Scholar's Tower, Beast Den,
//    Hatchery and Treasury each grow a structure in town, and the total level raises banners and braziers.

var TXA,SGNR,KGD,TWHC,KDPAL,KDRAIL; // no initialisers: the town is built (and fills these) before this file runs
// ---------- 1. the texture atlas ----------
// tileable value noise on the 120px tile
function txN(R,nx,ny){ny=ny||nx;const g=new Float32Array(nx*ny);for(let i=0;i<g.length;i++)g[i]=R();
  return (x,y)=>{const fx=x/120*nx,fy=y/120*ny,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),
    x0=((ix%nx)+nx)%nx,x1=(x0+1)%nx,y0=((iy%ny)+ny)%ny,y1=(y0+1)%ny,a=g[y0*nx+x0],b=g[y0*nx+x1],c=g[y1*nx+x0],d=g[y1*nx+x1];
    return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}}
function txFbm(R){const o=[txN(R,4),txN(R,8),txN(R,16),txN(R,40)];return (x,y)=>o[0](x,y)*.45+o[1](x,y)*.27+o[2](x,y)*.17+o[3](x,y)*.11}
// draw something 9 times so it wraps across the tile edges
function txW(c,f){for(let oy=-120;oy<=120;oy+=120)for(let ox=-120;ox<=120;ox+=120){c.save();c.translate(ox,oy);f();c.restore()}}
// multiply every pixel by f(x,y) (a number or [r,g,b])
function txPx(c,f){const id=c.getImageData(0,0,120,120),d=id.data;for(let y=0;y<120;y++)for(let x=0;x<120;x++){const k=(y*120+x)*4,m=f(x,y);
  if(typeof m=='number'){d[k]*=m;d[k+1]*=m;d[k+2]*=m}else{d[k]*=m[0];d[k+1]*=m[1];d[k+2]*=m[2]}}c.putImageData(id,0,0)}
function txLine(c,pts,st,w){c.strokeStyle=st;c.lineWidth=w;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke()}
function txCrack(c,R,x,y,len,a){const P=[[x,y]];for(let i=0;i<len/3;i++){a+=(R()-.5)*.9;x+=Math.cos(a)*3;y+=Math.sin(a)*3;P.push([x,y])}
  txW(c,()=>{txLine(c,P,'rgba(30,26,22,.55)',1.1);c.translate(.8,.9);txLine(c,P,'rgba(255,250,240,.16)',.8)})}
// widths that add up to 120 (for blocks, shingles, planks)
function txRow(R,a,b){const w=[];let s=0;while(120-s>a+b){const q=a+R()*(b-a);w.push(q);s+=q}w.push(120-s);return w}
function txWoodBase(c,R,base,lines){c.fillStyle=base;c.fillRect(0,0,120,120);const n1=txN(R,3,14),n2=txN(R,6,40);txPx(c,(x,y)=>.84+.18*n1(x,y)+.08*n2(x,y));
  for(let i=0;i<lines;i++){const y0=R()*120,a=.8+R()*2.6,k=1+(R()*2|0),ph=R()*6.28,dk=R()<.72,P=[];for(let x=-4;x<=124;x+=4)P.push([x,y0+a*Math.sin(x/120*6.283*k+ph)]);
    txW(c,()=>txLine(c,P,dk?'rgba(64,42,26,'+(.16+R()*.3)+')':'rgba(255,244,222,'+(.1+R()*.14)+')',.5+R()*1.3))}}
function txKnot(c,R,kx,ky){const rx=3.5+R()*4,ry=1.8+R()*1.6;txW(c,()=>{for(let r=1.6;r>.3;r-=.3){c.strokeStyle='rgba(58,36,20,'+(.55-r*.2)+')';c.lineWidth=1;c.beginPath();c.ellipse(kx,ky,rx*r,ry*r,0,0,6.283);c.stroke()}
  c.fillStyle='rgba(46,28,16,.8)';c.beginPath();c.ellipse(kx,ky,rx*.35,ry*.4,0,0,6.283);c.fill()})}
function txRivet(c,x,y,r){c.fillStyle='rgba(30,30,34,.85)';c.beginPath();c.arc(x+.6,y+.8,r,0,6.283);c.fill();c.fillStyle='rgba(150,150,156,1)';c.beginPath();c.arc(x,y,r*.8,0,6.283);c.fill();
  c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(x-r*.3,y-r*.3,r*.3,0,6.283);c.fill()}
// [name, metres per tile, target mean brightness, grain follows the part's long axis, painter]
function txTiles(){return [
 ['wood',1.1,.8,1,(c,R)=>{txWoodBase(c,R,'rgb(226,212,194)',36);for(let i=0;i<1+(R()*2|0);i++)txKnot(c,R,R()*120,R()*120);
   for(let i=0;i<9;i++){const x=R()*120,y=R()*120,w=12+R()*16;txW(c,()=>{const g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'rgba(0,0,0,.12)');g.addColorStop(.6,'rgba(255,255,255,.07)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x,y,w,8+R()*8)})}}],
 ['board',1.3,.8,1,(c,R)=>{txWoodBase(c,R,'rgb(222,206,186)',40);for(let r=0;r<4;r++){const y=r*30,j=R()*120,sh=R();
     txW(c,()=>{c.fillStyle=sh<.5?'rgba(0,0,0,'+(sh*.2)+')':'rgba(255,240,220,'+((sh-.5)*.14)+')';c.fillRect(0,y+2,120,28);c.fillStyle='rgba(34,22,12,.8)';c.fillRect(0,y,120,2);c.fillStyle='rgba(255,236,206,.22)';c.fillRect(0,y+2,120,1);
       c.fillStyle='rgba(34,22,12,.75)';c.fillRect(j,y,2,30)});[[j-5,y+8],[j-5,y+22],[j+7,y+8],[j+7,y+22]].forEach(q=>txW(c,()=>txRivet(c,q[0],q[1],1.5)))}
   txKnot(c,R,R()*120,R()*120)}],
 ['end',.4,.78,0,(c,R)=>{c.fillStyle='rgb(206,184,150)';c.fillRect(0,0,120,120);const n=txN(R,6);for(let r=3;r<54;r+=2.6+R()*2.4){c.strokeStyle='rgba(96,62,34,'+(.25+R()*.35)+')';c.lineWidth=.8+R();c.beginPath();
     for(let i=0;i<=40;i++){const a=i/40*6.283,rr=r+(n(60+Math.cos(a)*30,60+Math.sin(a)*30)-.5)*2.4;i?c.lineTo(60+Math.cos(a)*rr,60+Math.sin(a)*rr):c.moveTo(60+Math.cos(a)*rr,60+Math.sin(a)*rr)}c.stroke()}
   for(let i=0;i<3;i++){const a=R()*6.283;txLine(c,[[60+Math.cos(a)*4,60+Math.sin(a)*4],[60+Math.cos(a+.05)*24,60+Math.sin(a+.05)*24],[60+Math.cos(a-.04)*40,60+Math.sin(a-.04)*40]],'rgba(40,24,12,.7)',1.4)}
   c.strokeStyle='rgba(58,40,26,.95)';c.lineWidth=12;c.beginPath();c.arc(60,60,62,0,6.283);c.stroke();c.fillStyle='rgba(70,44,24,.8)';c.beginPath();c.arc(60,60,3,0,6.283);c.fill()}],
 ['bark',1.0,.72,1,(c,R)=>{c.fillStyle='rgb(196,180,162)';c.fillRect(0,0,120,120);const f=txFbm(R);txPx(c,(x,y)=>.75+.4*f(x,y));
   for(let i=0;i<16;i++){const y0=R()*120,P=[];let y=y0;for(let x=-4;x<=124;x+=6){y+=(R()-.5)*3;P.push([x,y])}P[P.length-1][1]=P[0][1];txW(c,()=>{txLine(c,P,'rgba(36,26,18,.7)',1.5+R()*2.5);c.translate(0,2);txLine(c,P,'rgba(255,240,220,.12)',1)})}
   for(let i=0;i<5;i++){const x=R()*120,y=R()*120;txW(c,()=>{c.fillStyle='rgba(90,120,60,.25)';c.beginPath();c.ellipse(x,y,6+R()*8,3+R()*3,0,0,6.283);c.fill()})}}],
 ['stone',.85,.8,0,(c,R)=>{c.fillStyle='rgb(214,212,206)';c.fillRect(0,0,120,120);const f=txFbm(R),g=txN(R,24);txPx(c,(x,y)=>{const v=.72+.42*f(x,y)+.1*g(x,y);return [v,v*.99,v*.97]});
   for(let i=0;i<420;i++){const x=R()*120,y=R()*120;c.fillStyle=R()<.5?'rgba(40,38,36,.35)':'rgba(255,255,250,.3)';c.fillRect(x,y,1+R(),1+R())}
   for(let i=0;i<3;i++)txCrack(c,R,R()*120,R()*120,30+R()*40,R()*6.28);
   for(let i=0;i<7;i++){const x=R()*120,y=R()*120,a=R()*3;for(let j=0;j<5;j++){const ox=Math.cos(a)*j*2.4,oy=Math.sin(a)*j*2.4;txW(c,()=>txLine(c,[[x+ox,y+oy],[x+ox+Math.cos(a+1.4)*6,y+oy+Math.sin(a+1.4)*6]],'rgba(40,38,34,.22)',.8))}}
   for(let i=0;i<4;i++){const x=R()*120,y=R()*120;txW(c,()=>{c.fillStyle='rgba(150,160,96,.2)';c.beginPath();c.ellipse(x,y,4+R()*7,3+R()*5,R()*3,0,6.283);c.fill()})}}],
 ['ashlar',1.7,.78,0,(c,R)=>{c.fillStyle='rgb(112,108,100)';c.fillRect(0,0,120,120);for(let r=0;r<4;r++){const ws=txRow(R,22,46),ox=R()*120;let x=ox;
     ws.forEach(w=>{const s=170+R()*60,y=r*30,X=x;txW(c,()=>{c.fillStyle='rgb('+(s|0)+','+(s*.98|0)+','+(s*.95|0)+')';c.fillRect(X+1.5,y+1.5,w-3,27);c.fillStyle='rgba(255,255,250,.28)';c.fillRect(X+1.5,y+1.5,w-3,2);c.fillRect(X+1.5,y+1.5,2,27);
       c.fillStyle='rgba(20,18,16,.38)';c.fillRect(X+1.5,y+26.5,w-3,2);c.fillRect(X+w-3.5,y+1.5,2,27)});x+=w})}
   const f=txFbm(R);txPx(c,(x,y)=>.82+.32*f(x,y));for(let i=0;i<300;i++){c.fillStyle=R()<.5?'rgba(40,38,36,.3)':'rgba(255,255,250,.25)';c.fillRect(R()*120,R()*120,1,1)}for(let i=0;i<3;i++)txCrack(c,R,R()*120,R()*120,20+R()*25,R()*6.28)}],
 ['slate',1.0,.76,0,(c,R)=>{c.fillStyle='rgb(54,56,62)';c.fillRect(0,0,120,120);for(let r=5;r>=0;r--){const ws=txRow(R,13,24),ox=(r%2)*9+R()*5;let x=ox;
     ws.forEach(w=>{const s=165+R()*65,y=r*20,X=x,b=[0,1,2].map(()=>R()*3);txW(c,()=>{c.fillStyle='rgba(0,0,0,.42)';c.fillRect(X+1,y+21,w-1,3);
       c.fillStyle='rgb('+(s*.97|0)+','+(s*.98|0)+','+(s|0)+')';c.beginPath();c.moveTo(X+.8,y-2);c.lineTo(X+w-.8,y-2);c.lineTo(X+w-.8,y+19+b[0]);c.lineTo(X+w/2,y+20.5+b[1]);c.lineTo(X+.8,y+19+b[2]);c.closePath();c.fill();
       c.fillStyle='rgba(255,255,255,.22)';c.fillRect(X+.8,y-2,w-1.6,1.5);c.fillStyle='rgba(0,0,0,.2)';c.fillRect(X+w-2,y-2,1.2,21)});x+=w})}
   const f=txFbm(R);txPx(c,(x,y)=>.84+.3*f(x,y));for(let i=0;i<160;i++){c.fillStyle=R()<.6?'rgba(255,255,255,.22)':'rgba(0,0,0,.25)';c.fillRect(R()*120,R()*120,1,1)}}],
 ['shingle',1.0,.78,0,(c,R)=>{c.fillStyle='rgb(60,44,32)';c.fillRect(0,0,120,120);for(let r=4;r>=0;r--){const ws=txRow(R,14,26),ox=(r%2)*10+R()*5;let x=ox;
     ws.forEach(w=>{const s=180+R()*55,y=r*24,X=x,ln=[0,1,2].map(()=>R()*w);txW(c,()=>{c.fillStyle='rgba(0,0,0,.45)';c.fillRect(X+1,y+25,w-1,3);c.fillStyle='rgb('+(s|0)+','+(s*.92|0)+','+(s*.84|0)+')';c.fillRect(X+.8,y-2,w-1.6,26.5+R()*1.5);
       ln.forEach(q=>{c.fillStyle='rgba(60,40,24,.35)';c.fillRect(X+q,y,.8,24)});c.fillStyle='rgba(255,240,220,.2)';c.fillRect(X+.8,y-2,1.2,26)});x+=w})}
   const f=txFbm(R);txPx(c,(x,y)=>.86+.26*f(x,y))}],
 ['thatch',1.2,.74,0,(c,R)=>{c.fillStyle='rgb(120,100,70)';c.fillRect(0,0,120,120);for(let r=3;r>=0;r--){const y0=r*30;
     for(let i=0;i<340;i++){const x=R()*120,y=y0-4+R()*32,l=10+R()*20,a=Math.PI/2+(R()-.5)*.35,q=R(),col=q<.35?'rgba(238,218,164,.75)':q<.75?'rgba(196,170,116,.8)':'rgba(104,84,56,.8)';
       txW(c,()=>txLine(c,[[x,y],[x+Math.cos(a)*l,y+Math.sin(a)*l]],col,.8+R()*.8))}
     txW(c,()=>{const g=c.createLinearGradient(0,y0+22,0,y0+31);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(20,12,4,.55)');c.fillStyle=g;c.fillRect(0,y0+22,120,9)})}}],
 ['iron',.7,.7,0,(c,R)=>{c.fillStyle='rgb(176,178,184)';c.fillRect(0,0,120,120);const f=txFbm(R);txPx(c,(x,y)=>.78+.36*f(x,y));
   for(let i=0;i<30;i++){const x=R()*120,y=R()*120,a=R()*6.28,l=5+R()*16;txW(c,()=>txLine(c,[[x,y],[x+Math.cos(a)*l,y+Math.sin(a)*l]],'rgba(255,255,255,.2)',.6))}
   for(let i=0;i<6;i++){const x=R()*120,y=R()*120;txW(c,()=>{c.fillStyle='rgba(150,80,36,.3)';c.beginPath();c.ellipse(x,y,3+R()*7,2+R()*5,R()*3,0,6.283);c.fill()})}
   txW(c,()=>{c.fillStyle='rgba(20,20,24,.7)';c.fillRect(0,0,120,2);c.fillRect(0,0,2,120);c.fillStyle='rgba(255,255,255,.18)';c.fillRect(0,2,120,1);c.fillRect(2,0,1,120)});
   for(let x=8;x<120;x+=16){txRivet(c,x,8,2.6);txRivet(c,x,68,2.6)}for(let y=24;y<120;y+=16)if(y!=72)txRivet(c,8,y,2.6)}],
 ['brass',.45,.8,0,(c,R)=>{c.fillStyle='rgb(228,216,188)';c.fillRect(0,0,120,120);const f=txFbm(R);txPx(c,(x,y)=>.85+.25*f(x,y));
   for(let i=0;i<110;i++){const x=R()*120,y=R()*120,r=2+R()*4;txW(c,()=>{const g=c.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);g.addColorStop(0,'rgba(255,255,240,.3)');g.addColorStop(1,'rgba(40,30,10,.18)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,6.283);c.fill()})}}],
 ['plaster',1.4,.84,0,(c,R)=>{c.fillStyle='rgb(236,230,216)';c.fillRect(0,0,120,120);const f=txFbm(R),g=txN(R,30);txPx(c,(x,y)=>.86+.22*f(x,y)+.06*g(x,y));
   for(let i=0;i<8;i++){const x=R()*120,w=3+R()*8;txW(c,()=>{const gr=c.createLinearGradient(0,0,0,120);gr.addColorStop(0,'rgba(70,60,50,.14)');gr.addColorStop(1,'rgba(70,60,50,0)');c.fillStyle=gr;c.fillRect(x,0,w,40+R()*80)})}
   for(let i=0;i<4;i++)txCrack(c,R,R()*120,R()*120,15+R()*25,R()*6.28);
   for(let i=0;i<2;i++){const x=R()*120,y=R()*120;txW(c,()=>{c.fillStyle='rgba(120,90,60,.5)';c.beginPath();c.ellipse(x,y,5+R()*5,3+R()*4,R()*3,0,6.283);c.fill();for(let j=-2;j<=2;j++)txLine(c,[[x-8,y+j*2.2],[x+8,y+j*2.2]],'rgba(70,50,30,.4)',.8)})}}],
 ['cloth',.7,.8,0,(c,R)=>{c.fillStyle='rgb(226,220,210)';c.fillRect(0,0,120,120);const f=txFbm(R),ph=R()*6.28;
   txPx(c,(x,y)=>((x+y)%2?.94:1)*(((x>>1)+(y>>1))%2?.97:1.02)*(.93+.1*Math.sin(x/120*6.283*3+ph))*(.92+.14*f(x,y)));
   for(let i=0;i<5;i++){const x=R()*120,y=R()*120;txW(c,()=>{c.fillStyle='rgba(60,40,30,.08)';c.beginPath();c.ellipse(x,y,6+R()*12,4+R()*8,R()*3,0,6.283);c.fill()})}}],
 ['straw',.6,.8,0,(c,R)=>{c.fillStyle='rgb(206,186,140)';c.fillRect(0,0,120,120);for(let i=0;i<520;i++){const x=R()*120,y=R()*120,l=5+R()*14,a=R()*6.28,q=R();
   txW(c,()=>txLine(c,[[x,y],[x+Math.cos(a)*l,y+Math.sin(a)*l]],q<.4?'rgba(246,230,180,.8)':q<.8?'rgba(190,164,110,.8)':'rgba(110,90,56,.8)',.8+R()*.7))}}],
 ['leaf',.9,.74,0,(c,R)=>{c.fillStyle='rgb(130,140,124)';c.fillRect(0,0,120,120);for(let i=0;i<260;i++){const x=R()*120,y=R()*120,a=R()*6.28,q=R();
   txW(c,()=>{c.fillStyle=q<.45?'rgba(236,244,224,.55)':q<.8?'rgba(176,190,166,.7)':'rgba(46,56,42,.6)';c.beginPath();c.ellipse(x,y,5.5,2.4,a,0,6.283);c.fill()})}}],
 ['glass',.4,.86,0,(c,R)=>{c.fillStyle='rgb(244,236,214)';c.fillRect(0,0,120,120);for(let i=-4;i<8;i++)for(let j=-4;j<8;j++){const cx=i*30+15*(j%2?1:0)+15,cy=j*15;
     c.fillStyle='rgba('+(R()<.5?'255,250,230':'210,190,150')+','+(.1+R()*.2)+')';c.beginPath();c.moveTo(cx,cy-15);c.lineTo(cx+15,cy);c.lineTo(cx,cy+15);c.lineTo(cx-15,cy);c.closePath();c.fill()}
   c.strokeStyle='rgba(40,32,26,.95)';c.lineWidth=3.2;for(let k=-120;k<=240;k+=30){c.beginPath();c.moveTo(k,0);c.lineTo(k+120,120);c.stroke();c.beginPath();c.moveTo(k,120);c.lineTo(k+120,0);c.stroke()}
   for(let i=0;i<30;i++){c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(R()*120,R()*120,.8+R()*1.2,0,6.283);c.fill()}}],
 ['dirt',.8,.74,0,(c,R)=>{c.fillStyle='rgb(176,156,130)';c.fillRect(0,0,120,120);const f=txFbm(R);txPx(c,(x,y)=>.74+.45*f(x,y));
   for(let i=0;i<60;i++){const x=R()*120,y=R()*120,r=1+R()*2.6;txW(c,()=>{c.fillStyle=R()<.5?'rgba(220,214,204,.7)':'rgba(40,30,20,.5)';c.beginPath();c.arc(x,y,r,0,6.283);c.fill()})}}],
 ['plain',1,.92,0,(c,R)=>{c.fillStyle='rgb(236,236,236)';c.fillRect(0,0,120,120);const f=txFbm(R);txPx(c,(x,y)=>.95+.08*f(x,y))}],
 ['flag',1.8,.78,0,(c,R)=>{const S=[];for(let i=0;i<9;i++)S.push([(i%3+.2+R()*.6)*40,((i/3|0)+.2+R()*.6)*40,175+R()*60]);const id=c.createImageData(120,120),d=id.data;
   for(let y=0;y<120;y++)for(let x=0;x<120;x++){let a=1e9,b=1e9,ai=0;S.forEach((s,i)=>{let dx=Math.abs(x-s[0]),dy=Math.abs(y-s[1]);dx=Math.min(dx,120-dx);dy=Math.min(dy,120-dy);const q=Math.hypot(dx,dy);if(q<a){b=a;a=q;ai=i}else if(q<b)b=q});
     const e=b-a,v=e<2.2?.42:S[ai][2]/255*(e<5?.86+.03*e:1),k=(y*120+x)*4;d[k]=v*255;d[k+1]=v*250;d[k+2]=v*242;d[k+3]=255}
   c.putImageData(id,0,0);const f=txFbm(R);txPx(c,(x,y)=>.84+.3*f(x,y))}]
]}
function txaInit(){if(TXA)return TXA;
  const GX=8,GY=4,CS=128,cv=document.createElement('canvas');cv.width=GX*CS;cv.height=GY*CS;const ac=cv.getContext('2d');
  const tc=document.createElement('canvas');tc.width=tc.height=120;const c=tc.getContext('2d',{willReadFrequently:true});TXA={t:{},cv};
  txTiles().forEach(([nm,sz,mean,gr,paint],i)=>{const col=i%GX,row=i/GX|0;c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.clearRect(0,0,120,120);
    try{paint(c,dkRng(1009+i*7919))}catch(e){console.warn('tile',nm,e);c.fillStyle='#ddd';c.fillRect(0,0,120,120)}
    const id=c.getImageData(0,0,120,120),d=id.data;let s=0;for(let k=0;k<d.length;k+=4)s+=d[k]*.3+d[k+1]*.59+d[k+2]*.11;s/=120*120*255;
    const f=mean/Math.max(.05,s);let s2=0;for(let k=0;k<d.length;k+=4){d[k]*=f;d[k+1]*=f;d[k+2]*=f;d[k+3]=255;s2+=d[k]*.3+d[k+1]*.59+d[k+2]*.11}c.putImageData(id,0,0);
    ac.save();ac.beginPath();ac.rect(col*CS,row*CS,CS,CS);ac.clip();for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++)ac.drawImage(tc,col*CS+4+ox*120,row*CS+4+oy*120);ac.restore();
    TXA.t[nm]={c:col,r:GY-1-row,s:sz,m:s2/(120*120*255),g:gr}});
  const t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.anisotropy=4;TXA.tex=t;return TXA}
// atlas sampling: aTl = (tile column, tile row from the bottom, tile mean); uv is in tile units and repeats inside the tile
function txaFrag(){return ['#ifdef USE_MAP',
 ' vec2 tsz=vec2(1024.,512.);vec2 au=(vTl.xy*128.+4.+fract(vUv)*120.)/tsz;',
 ' vec2 gx=dFdx(vUv)*(120./tsz),gy=dFdy(vUv)*(120./tsz);float pm=max(length(gx*tsz),length(gy*tsz));float sc=pm>4.?4./pm:1.;',
 ' #if __VERSION__>=300',' vec4 texelColor=textureGrad(map,au,gx*sc,gy*sc);',' #else',' vec4 texelColor=texture2D(map,au);',' #endif',
 ' texelColor.rgb=mix(texelColor.rgb,vec3(vTl.z),smoothstep(5.,20.,pm));',' texelColor=mapTexelToLinear(texelColor);diffuseColor*=texelColor;','#endif'].join('\n')}
function txaHook(m){m.onBeforeCompile=s=>{s.vertexShader='attribute vec3 aTl;\nvarying vec3 vTl;\n'+s.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n vTl=aTl;');
  s.fragmentShader='varying vec3 vTl;\n'+s.fragmentShader.replace('#include <map_fragment>',txaFrag())};m.customProgramCacheKey=()=>'txa1';return m}
// v83 materials, now with the atlas (the colour is lifted so texture × vertex colour keeps the old brightness)
function twMat(){if(TWM)return TWM;const A=txaInit();
  const f=o=>{const m=new THREE.MeshStandardMaterial(Object.assign({vertexColors:true,flatShading:true,roughness:.95,metalness:0,map:A.tex},o));m.color.setScalar(1.22);m.userData.lps=1;return txaHook(m)};
  TWM={c:f({}),m:f({roughness:.5,metalness:.5}),g:txaHook(new THREE.MeshBasicMaterial({vertexColors:true,map:A.tex}))};TWM.g.color.setScalar(1.12);TWM.g.userData.lps=1;return TWM}
// v83 kit, now remembering which helper (material) each part came from
function twKit(seed){twInit();const P=[],R=dkRng(seed||11),E=new THREE.Euler(),UP=new THREE.Vector3(0,1,0);
  const push=(t,col,geo,pos,q,s,j)=>{P.push({t,col,geo,m:new THREE.Matrix4().compose(pos,q,s),j:j==null?.08:j,f:.9+.18*R(),mt:k.mt})};
  const k={P,R,mt:null,
    p(t,col,geo,x,y,z,sx,sy,sz,rx,ry,rz,j){E.set(rx||0,ry||0,rz||0);push(t,col,typeof geo=='string'?twGeo()[geo]:geo,new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(E),new THREE.Vector3(sx,sy==null?sx:sy,sz==null?sx:sz),j);return k},
    L(t,col,a,b,r,geo,j){const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),len=d.length()||.001,q=new THREE.Quaternion().setFromUnitVectors(UP,d.normalize());
      q.multiply(new THREE.Quaternion().setFromAxisAngle(UP,R()*6.28));
      push(t,col,twGeo()[geo||'cyl6'],new THREE.Vector3((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),q,new THREE.Vector3(r,len,r),j==null?.12:j);return k},
    // run f with every part tagged as material mt
    as(mt,f){const o=k.mt;k.mt=mt;try{f()}finally{k.mt=o}return k},
    // run f, then move the parts it added by (x,y,z) and turn them by ry
    at(x,y,z,f,ry){const n=P.length;f();const M=new THREE.Matrix4().makeRotationY(ry||0).setPosition(x,y,z);for(let i=n;i<P.length;i++)P[i].m.premultiply(M);return k}};
  return k}
// helper wrappers: the v83 bodies are renamed *_0 by pV10
function twCtx(k,mt,f,a){if(!k||!k.P)return f.apply(null,a);const o=k.mt;k.mt=mt;try{return f.apply(null,a)}finally{k.mt=o}}
function twStones(k){return twCtx(k,k&&k.mt=='ashlar'?'ashlar':'stone',twStones_0,arguments)}
function twStoneRing(k){return twCtx(k,'stone',twStoneRing_0,arguments)}
function twLogs(k){return twCtx(k,'log',twLogs_0,arguments)}
function twPlanks(k){return twCtx(k,'plank',twPlanks_0,arguments)}
function twDoor(k){return twCtx(k,'plank',twDoor_0,arguments)}
function twWindow(k){return twCtx(k,'window',twWindow_0,arguments)}
function twGable(k,col,w,d,rise,over,y0,trim){twInit();return twCtx(k,{roof:twNear(col,TWC.thatch,.1)?'thatch':twHSL(col).s>.28&&twHSL(col).h<.12?'shingle':'slate',trim},twGable_0,arguments)}
function twCone(k,col){twInit();return twCtx(k,{roof:twHSL(col).s>.28&&twHSL(col).h<.12?'shingle':'slate'},twCone_0,arguments)}
function twHSL(hex){TWHC=TWHC||{};let r=TWHC[hex];if(!r){r={};new THREE.Color(hex).getHSL(r);TWHC[hex]=r}return r}
function twNear(a,b,t){const A=new THREE.Color(a),B=new THREE.Color(b);return Math.abs(A.r-B.r)<t&&Math.abs(A.g-B.g)<t&&Math.abs(A.b-B.b)<t}
// which atlas tile a part gets
function twClass(p,sc){const mt=p.mt,t=p.t,col=p.col,G=twGeo();
  if(t=='g')return mt=='window'||mt=='glass'?'glass':'plain';
  if(typeof mt=='string'&&mt!='stone'&&mt!='log'&&mt!='plank'&&mt!='window'&&TXA.t[mt])return mt;
  const h=twHSL(col);
  if(t=='m')return (h.h>.07&&h.h<.17&&h.s>.3)?'brass':'iron';
  if(col===TWC.gold)return 'brass';
  const S=[Math.abs(sc.x),Math.abs(sc.y),Math.abs(sc.z)].sort((a,b)=>b-a),el=S[0]/Math.max(1e-4,S[1]),wood=col===TWC.wood||col===TWC.woodD||col===TWC.woodL;
  if(mt&&typeof mt=='object')return wood||col===mt.trim||(p.geo===G.tri&&!mt.cone)?'wood':mt.roof;
  if(mt=='stone')return p.geo===G.cyl8&&S[2]>.6?'ashlar':'stone';
  if(mt=='log'||mt=='plank'||mt=='window')return 'wood';
  if(twNear(col,TWC.thatch,.1))return 'thatch';
  const gray=h.s<.16||(h.l<.2&&h.s<.3);
  if(gray)return S[1]>1.2&&S[0]>1.2?'ashlar':'stone';
  if(h.h>.2&&h.h<.47&&h.s>.12)return 'leaf';
  if(h.h>.09&&h.h<.17&&h.s>.35&&h.l>.36&&h.l<.7)return 'straw';
  if(h.h>.02&&h.h<.13&&h.s<.56&&h.l<.6){if(p.geo===G.log)return 'bark';return S[1]>.5&&el<3.2?'board':'wood'}
  if(el>4)return 'wood';
  return 'cloth'}
// v83 merger + world-scaled UVs and atlas tiles
function twBake(P,key,ao){twInit();let gs=key&&TWBK[key];
  if(!gs){gs={};const by={},A=txaInit();P.forEach((p,i)=>{p.i=i;(by[p.t]=by[p.t]||[]).push(p)});
    const v=new THREE.Vector3(),c=new THREE.Color(),sc=new THREE.Vector3(),q=new THREE.Quaternion(),tp=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0),
      a0=new THREE.Vector3(),a1=new THREE.Vector3(),a2=new THREE.Vector3(),e1=new THREE.Vector3(),e2=new THREE.Vector3(),n=new THREE.Vector3(),T=new THREE.Vector3(),B=new THREE.Vector3(),
      mr=new THREE.Matrix4(),ax=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
    for(const t in by){const pos=[],col=[],uv=[],tl=[];
      by[t].forEach(p=>{const pa=p.geo.attributes.position,cnt=pa.count,base=pos.length;p.m.decompose(tp,q,sc);
        const amp=(t=='g'?0:p.j)*Math.min(Math.abs(sc.x),Math.abs(sc.y),Math.abs(sc.z));c.set(p.col);
        for(let i=0;i<cnt;i++){v.fromBufferAttribute(pa,i).applyMatrix4(p.m);
          if(amp){const rx=Math.round(v.x*300)/300,ry=Math.round(v.y*300)/300,rz=Math.round(v.z*300)/300;v.x+=(twH(rx,ry,rz,1)-.5)*amp;v.y+=(twH(rx,ry,rz,2)-.5)*amp*.7;v.z+=(twH(rx,ry,rz,3)-.5)*amp}
          pos.push(v.x,v.y,v.z)}
        const ti=A.t[twClass(p,sc)]||A.t.plain,S=[Math.abs(sc.x),Math.abs(sc.y),Math.abs(sc.z)];let L=0;if(S[1]>S[L])L=1;if(S[2]>S[L])L=2;
        const s2=S.slice().sort((a,b)=>b-a),el=s2[0]/Math.max(1e-4,s2[1]);mr.makeRotationFromQuaternion(q);mr.extractBasis(ax[0],ax[1],ax[2]);
        const ou=twH(p.i,1,2,7)*7.3,ov=twH(p.i,3,4,8)*5.1;
        for(let i=0;i<cnt;i+=3){const k=base+i*3;a0.fromArray(pos,k);a1.fromArray(pos,k+3);a2.fromArray(pos,k+6);
          n.crossVectors(e1.subVectors(a1,a0),e2.subVectors(a2,a0));if(n.lengthSq()<1e-14)n.set(0,1,0);n.normalize();
          let tile=ti,sz=ti.s,cen=false;
          if(ti.g){const G=ax[L],d=Math.abs(n.dot(G));
            if(d>.72&&el>1.8){tile=A.t.end;cen=true;sz=Math.max(s2[1],.03)*2.15;T.copy(ax[(L+1)%3])}else T.copy(G);
            T.addScaledVector(n,-n.dot(T));if(T.lengthSq()<1e-6){T.set(1,0,0).addScaledVector(n,-n.x)}T.normalize()}
          else if(Math.abs(n.y)<.9)T.crossVectors(UP,n).normalize();
          else{T.copy(ax[0]).addScaledVector(n,-n.dot(ax[0]));if(T.lengthSq()<1e-6)T.set(1,0,0);T.normalize()}
          B.crossVectors(n,T);
          for(let r=0;r<3;r++){const px=pos[k+r*3],py=pos[k+r*3+1],pz=pos[k+r*3+2];
            if(cen)uv.push(((px-tp.x)*T.x+(py-tp.y)*T.y+(pz-tp.z)*T.z)/sz+.5,((px-tp.x)*B.x+(py-tp.y)*B.y+(pz-tp.z)*B.z)/sz+.5);
            else uv.push((px*T.x+py*T.y+pz*T.z)/sz+ou,(px*B.x+py*B.y+pz*B.z)/sz+ov);
            tl.push(tile.c,tile.r,tile.m)}}
        for(let i=0;i<cnt;i+=3){const k=base+i*3,cx=(pos[k]+pos[k+3]+pos[k+6])/3,cy=(pos[k+1]+pos[k+4]+pos[k+7])/3,cz=(pos[k+2]+pos[k+5]+pos[k+8])/3;
          let f=p.f*(t=='g'?1:.86+.22*twH(cx,cy,cz,9));if(ao&&t!='g')f*=.66+.34*Math.min(1,Math.max(0,cy/2));
          for(let r=0;r<3;r++)col.push(c.r*f,c.g*f,c.b*f)}});
      const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));G.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
      G.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));G.setAttribute('aTl',new THREE.Float32BufferAttribute(tl,3));
      G.computeVertexNormals();G.computeBoundingSphere();G.userData.lps=1;gs[t]=G}
    if(key)TWBK[key]=gs}
  const M=twMat();return Object.keys(gs).map(t=>{const m=new THREE.Mesh(gs[t],M[t]);m.castShadow=t!='g';m.receiveShadow=true;m.userData.lpsSkip=1;return m})}

