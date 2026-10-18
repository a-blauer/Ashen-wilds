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

// ---------- 2. signs ----------
// two posts beside a board of width w hung at height yc (board top at yc+h/2), crossbar on top
function twSignPost(k,w,yc,h,top){const x=w/2+.14,t=top||yc+h/2+.36;
  k.as('bark',()=>{[-1,1].forEach(s=>k.L('c',TWC.woodD,[s*x,-.05,0],[s*x,t+.08,0],.075,'log'))});
  k.as('wood',()=>{k.L('c',TWC.woodD,[-x-.22,t-.04,0],[x+.22,t-.04,0],.065,'box');[-1,1].forEach(s=>k.L('c',TWC.woodD,[s*x,t-.42,0],[s*(x-.3),t-.06,0],.035,'box'))});
  [-1,1].forEach(s=>{k.p('c',TWC.stoneD,'dod',s*x,.08,0,.2,.13,.2);k.L('m',TWC.iron,[s*w*.32,yc+h/2+.06,0],[s*w*.32,t-.08,0],.016,'box',0)})}
// board: planks in the sign's colour, iron corner straps both sides, two hanging eyes on top
function twSignBoard(w,h,bc){const key='SGB|'+w.toFixed(2)+'|'+h.toFixed(2)+'|'+bc;let k=null;
  if(!twHas(key)){k=twKit(Math.round(w*131+h*71));const n=Math.max(1,Math.round(h/.22)),ph=h/n;
    k.as('wood',()=>{for(let i=0;i<n;i++)k.p('c',dkShade(bc,.9+.2*k.R()),'box',(k.R()-.5)*.02,-h/2+ph*(i+.5),0,w+.05,ph-.012,.05,0,0,(k.R()-.5)*.012,.02)});
    const a=Math.min(.2,w*.12,h*.35),I=0x46464e;
    k.as('iron',()=>{[-1,1].forEach(z=>[-1,1].forEach(sx=>[-1,1].forEach(sy=>{const X=sx*(w/2-a/2+.01),Y=sy*(h/2-.02);k.p('c',I,'box',X,Y,z*.03,a,.035,.012,0,0,0,0);
      k.p('c',I,'box',sx*(w/2-.0),sy*(h/2-a/2+.01),z*.03,.035,a,.012,0,0,0,0);k.p('c',0x6a6a72,'oct',sx*(w/2-a*.55),sy*(h/2-.05),z*.036,.014,.014,.008)})));
      [-1,1].forEach(s=>{k.p('c',I,'box',s*w*.32,h/2+.035,0,.05,.08,.02,0,0,0,0);k.p('c',I,'box',s*w*.32,h/2+.075,0,.02,.02,.06,0,0,0,0)})})}
  return twBake(k?k.P:[],key,false)}
function signFit(lines,w){const g=(signFit.c=signFit.c||document.createElement('canvas').getContext('2d'));
  return lines.map(l=>{let f=l.f+' Cinzel,Georgia,serif,';g.font=f+' Inter,system-ui,sans-serif';const m=g.measureText(l.t).width,px=+(l.f.match(/(\d+)px/)||[0,30])[1];
    if(m>w*.9&&px)f=f.replace(px+'px',Math.floor(px*w*.9/m)+'px');return {t:l.t,f}})}
// paints wood planks, a worn painted border and carved, painted text (text itself comes from txTex)
function signPaint(c,lines,bg,fg,bd,np){const g=c.getContext('2d'),w=c.width,h=c.height,R=dkRng(w*7+h*13+String(lines.map(l=>l.t).join()).length*31);np=np||1;
  g.globalCompositeOperation='source-over';g.globalAlpha=1;g.fillStyle=bg;g.fillRect(0,0,w,h);const ph=h/np;
  for(let i=0;i<w*h/700;i++){const y=R()*h,x=R()*w,l=20+R()*90,dk=R()<.6;g.strokeStyle=dk?'rgba(0,0,0,'+(.1+R()*.18)+')':'rgba(255,230,190,'+(.04+R()*.08)+')';g.lineWidth=.8+R()*1.6;
    g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+l/2,y+(R()-.5)*4,x+l,y+(R()-.5)*3);g.stroke()}
  for(let i=0;i<np;i++){const s=R();g.fillStyle=s<.5?'rgba(0,0,0,'+(s*.22)+')':'rgba(255,235,200,'+((s-.5)*.12)+')';g.fillRect(0,i*ph,w,ph)}
  for(let i=1;i<np;i++){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,i*ph-2,w,3);g.fillStyle='rgba(255,230,190,.16)';g.fillRect(0,i*ph+1,w,1)}
  for(let i=0;i<2;i++){const kx=R()*w,ky=R()*h;g.strokeStyle='rgba(20,10,4,.45)';g.lineWidth=1.2;for(let r=1;r<4;r++){g.beginPath();g.ellipse(kx,ky,r*5,r*2,0,0,6.283);g.stroke()}}
  const vg=g.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.62);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,4,0,.5)');g.fillStyle=vg;g.fillRect(0,0,w,h);
  if(bd){const lw=Math.max(3,h/22),m=lw*2.2;g.strokeStyle=bd;g.globalAlpha=.8;g.lineWidth=lw;g.strokeRect(m,m,w-m*2,h-m*2);g.globalAlpha=.35;g.lineWidth=1;g.strokeStyle='#000';g.strokeRect(m+lw/2+1,m+lw/2+1,w-m*2-lw-2,h-m*2-lw-2);g.globalAlpha=1}
  // text layer (txTex = the one text renderer, so a hook on txTex also styles sign text)
  const tt=txTex(signFit(lines,w),w,h,'rgba(0,0,0,0)',fg,null),ti=tt.image;tt.dispose();
  const L=document.createElement('canvas');L.width=w;L.height=h;const lg=L.getContext('2d');lg.drawImage(ti,0,0);
  lg.globalCompositeOperation='destination-out';for(let i=0;i<w*h/260;i++){lg.fillStyle='rgba(0,0,0,'+(.2+R()*.5)+')';lg.fillRect(R()*w,R()*h,1+R()*2.5,1+R()*1.5)}
  const M=document.createElement('canvas');M.width=w;M.height=h;const mg=M.getContext('2d');mg.drawImage(ti,0,0);mg.globalCompositeOperation='source-in';mg.fillStyle='#0c0602';mg.fillRect(0,0,w,h);
  g.globalAlpha=.85;g.drawImage(M,2,3);g.globalAlpha=.5;g.drawImage(M,-1,-1);g.globalAlpha=1;g.drawImage(L,0,0)}
function signTex(lines,pw,ph,bg,fg,bd,np){const c=document.createElement('canvas');c.width=pw||512;c.height=ph||128;signPaint(c,lines,bg,fg,bd,np);
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;(SGNR=SGNR||[]).push({t,c,a:[lines,bg,fg,bd,np]});return t}
// sign(p,lines,w,h,bg,fg,bd,x,y,z,ry,pw,ph): same arguments as before; returns the front text plane
function sign(p,lines,w,h,bg,fg,bd,x,y,z,ry,pw,ph){twInit();const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry||0;g.userData.sign=1;
  let bc=0x3a2a1c;try{bc=new THREE.Color(bg).getHex()}catch(_){}
  twSignBoard(w,h,bc).forEach(m=>{m.castShadow=false;g.add(m)});const np=Math.max(1,Math.round(h/.22));
  const m=signMat(signTex(lines,pw||512,ph||128,bg,fg,bd,np));m.userData.lps=1;
  const f=TQ(g,signQuad(),m,0,0,0,w,h,1);f.castShadow=false;f.userData.lpsSkip=1;
  p.add(g);return f}
// one mesh for both faces of a sign: front quad at +z, back quad at -z (its u is flipped so the text reads correctly)
function signQuad(){if(signQuad.g)return signQuad.g;const z=.0262/1,P=[],U=[];
  const q=(s)=>{const v=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,-.5],[.5,.5],[-.5,.5]];if(s<0)v.reverse();v.forEach(([x,y])=>{P.push(x,y,s*z);U.push(s>0?x+.5:.5-x,y+.5)})};q(1);q(-1);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.computeVertexNormals();g.userData.lps=1;return signQuad.g=g}
// once the Cinzel web font has loaded, repaint every sign with it
try{if(document.fonts&&document.fonts.load)document.fonts.load('700 40px Cinzel').then(()=>{if(!document.fonts.check('700 40px Cinzel'))return;(SGNR||[]).forEach(r=>{signPaint(r.c,...r.a);r.t.needsUpdate=true})}).catch(()=>{})}catch(_){}

// construction site: sign between two posts, lumber stack, stones, a half-raised frame
function shSite(x,z,label){const g=new THREE.Group();g.position.set(x,GH(x,z),z);const T=TOWNS[0];g.rotation.y=Math.atan2(T.sp[0]-x,T.sp[1]-z);
  let k=null;if(!twHas('SITE2')){k=twKit(111);twSignPost(k,1.05,1.3,.44);
    for(let i=0;i<5;i++)k.L('c',[TWC.wood,TWC.woodL,TWC.wood][i%3],[-1.55,.1+(i>2?.17:0),-.6+(i%3)*.17+(i>2?.08:0)],[-.45,.1+(i>2?.17:0),-.6+(i%3)*.17+(i>2?.08:0)],.085,'log');
    [[1.0,.12,-.4,.2],[1.3,.1,-.1,.16],[1.15,.28,-.25,.15],[.85,.09,-.05,.13]].forEach(q=>k.p('c',TWC.stone,'dod',q[0],q[1],q[2],q[3],q[3]*.8,q[3],q[0],q[1],0,.2));
    k.as('wood',()=>{[-1,1].forEach(s=>k.L('c',TWC.woodL,[s*.9,0,-1.0],[s*.9,1.5,-1.0],.06,'box'));k.L('c',TWC.woodL,[-1.0,1.45,-1.0],[1.0,1.45,-1.0],.05,'box');k.L('c',TWC.woodL,[-.9,.1,-1.0],[.9,1.4,-1.0],.04,'box')});
    k.L('m',TWC.iron,[.25,0,-.3],[.42,.55,-.25],.02,'cyl6',0);k.p('m',TWC.iron,'box',.44,.58,-.25,.16,.07,.05,0,0,.3,0)}
  twBake(k?k.P:[],'SITE2',true).forEach(m=>g.add(m));
  sign(g,[{t:label,f:'700 30px'},{t:'🔨 build at the Steward',f:'600 20px'}],1.05,.44,'#3a2614','#ffe6c0',null,0,1.3,0,0);scene.add(g);return g}
// a ready-made two-post sign frame (for signs built outside a kit: zone camps, the courtyard)
function twPostG(w,yc,h){const key='SPOST|'+w+'|'+yc+'|'+h;let k=null;if(!twHas(key)){k=twKit(Math.round(w*50+yc*9));twSignPost(k,w,yc,h)}return twGroup(k,key)}
// portal frames: iron rods on the lintel hold the portal's sign above the gable cap
function twPortalRods(k,w,h){const big=w>2,sw=big?2.4:1.8,sy=big?4.34:3.32,sh=big?.62:.36,x=sw/2+.09,t=sy+sh/2+.24;
  [-1,1].forEach(s=>{k.L('m',TWC.iron,[s*x,h+.38,0],[s*x,t+.05,0],.032,'cyl6',0);k.p('m',TWC.iron,'oct',s*x,t+.1,0,.07,.1,.07)});
  k.L('m',TWC.iron,[-x-.12,t,0],[x+.12,t,0],.028,'box',0);[-1,1].forEach(s=>k.L('m',TWC.iron,[s*sw*.32,sy+sh/2+.04,0],[s*sw*.32,t,0],.012,'box',0))}

// ---------- 3. the kingdom: stronghold upgrades you can see ----------
// KGD: wl = wall level built, wg = wall group, old = the v83 wall pieces (hidden/shown per level),
// up[k] = {l, g, col:[colliders]} for each upgrade structure, pr = prestige level built, lamps = TLAMP entries we added
function kdLv(k){try{return Math.max(0,Math.min(3,SH.lv[k]|0))}catch(_){return 0}}
function kdState(){KGD=KGD||{wl:-1,wg:null,old:null,up:{},pr:-1,pg:null,lamps:[]};return KGD}
// the v83 gate, towers and wall banners, plus the town's share of the instanced palisade (hidden once: kdWalls replaces them)
function kdOld(T){const K=kdState();if(K.old)return K.old;const o={gate:[],tw:[],ban:[]};
  T.g.children.forEach(ch=>{if(!ch.isGroup)return;const m=ch.children.find(c=>c.isMesh);if(!m)return;
    for(const key in TWBK){const B=TWBK[key];if(B&&(B.c===m.geometry||B.m===m.geometry)){if(key=='GATE')o.gate.push(ch);else if(key.indexOf('TWR|')==0)o.tw.push(ch);else if(key.indexOf('BAN|')==0)o.ban.push(ch);break}}});
  if(KDPAL&&KDPAL.lg){const Z=new THREE.Matrix4().makeScale(0,0,0);KDPAL.Wt.forEach(([x,y],i)=>{if(townAt(x,y,0)!==0)return;for(let j=0;j<4;j++){KDPAL.lg.setMatrixAt(i*4+j,Z);KDPAL.lt.setMatrixAt(i*4+j,Z)}});
    KDPAL.lg.instanceMatrix.needsUpdate=KDPAL.lt.instanceMatrix.needsUpdate=true}
  if(KDRAIL)KDRAIL.visible=false;return K.old=o}
// colliders and lights owned by one rebuilt piece
function kdCol(T,list,add){list.forEach(c=>{const i=T.col.indexOf(c);if(i>=0)T.col.splice(i,1)});list.length=0;(add||[]).forEach(c=>{T.col.push(c);list.push(c)})}
function kdLamps(add){const K=kdState();K.lamps.forEach(l=>{const i=TLAMP.indexOf(l);if(i>=0)TLAMP.splice(i,1)});K.lamps=add||[];K.lamps.forEach(l=>TLAMP.push(l))}
// glowing flames for braziers and torches
function kdFlame(k,x,y,z,s){k.p('g',0xff7a20,'cone4',x,y+.18*s,z,.2*s,.42*s,.2*s,0,.3,0).p('g',0xffc848,'cone4',x,y+.13*s,z,.12*s,.3*s,.12*s,0,1.1,0)}
function kdBrazier(k,x,z,y0,s){y0=y0||0;s=s||1;[0,1,2].forEach(i=>{const a=i/3*6.283+.4;k.L('m',TWC.iron,[x+Math.cos(a)*.28*s,y0,z+Math.sin(a)*.28*s],[x+Math.cos(a)*.12*s,y0+.72*s,z+Math.sin(a)*.12*s],.025*s,'cyl6',0)});
  k.p('m',TWC.iron,'frus8',x,y0+.8*s,z,.3*s,.18*s,.3*s,Math.PI,0,0,0);k.p('c',0x2a1a10,'cyl8',x,y0+.86*s,z,.24*s,.04*s,.24*s,0,0,0,0);kdFlame(k,x,y0+.88*s,z,s)}
// a cloth banner hanging from a short iron rod (front faces +z)
function kdBanner(k,x,y,z,ry,col,w,h){const c=Math.cos(ry),s=Math.sin(ry),P=(lx,ly,lz)=>[x+lx*c+lz*s,y+ly,z-lx*s+lz*c];w=w||.7;h=h||1.3;
  let q=P(0,0,0);const a=P(-w/2-.08,0,0),b=P(w/2+.08,0,0);k.L('m',TWC.iron,a,b,.025,'cyl6',0);
  k.as('cloth',()=>{q=P(0,-h/2,.02);k.p('c',col,'box',q[0],q[1],q[2],w,h,.025,0,ry,0,.04);[-1,1].forEach(sd=>{q=P(sd*w/4,-h-.1,.02);k.p('c',col,'tri',q[0],q[1],q[2],w/2,.2,.025,0,ry,Math.PI,.03)});
    q=P(0,-.1,.035);k.p('c',TWC.gold,'box',q[0],q[1],q[2],w*1.02,.06,.01,0,ry,0,0);q=P(0,-h*.48,.036);k.p('c',TWC.gold,'oct',q[0],q[1],q[2],w*.18,w*.24,.01,0,ry,0,0)})}

// one straight stretch of town wall at level lv: along x from -len/2 to len/2, the town is on +z
function kdSegK(k,lv,len){
  {const L2=len/2,R=k.R;
    const logs=(y0,y1a,y1b,rows)=>{const n=Math.round(len/.4);for(let i=0;i<n;i++)rows.forEach((zz,r)=>{const x=-L2+(i+.5+(r?.5:0))*len/n;if(x>L2-.05)return;const hh=y1a+R()*(y1b-y1a)+(r?.2:0),
        col=R()<.25?TWC.woodD:R()<.2?TWC.woodL:TWC.wood,rr=.16+R()*.05,dx=(R()-.5)*.06,dz=zz+(R()-.5)*.06;
      k.as('bark',()=>k.L('c',col,[x,y0,dz],[x+dx,hh,dz],rr,'log',.1));k.as('wood',()=>k.p('c',col,'cone6',x+dx,hh+.27,dz,rr*1.05,.56,rr*1.05,(R()-.5)*.1,R()*3,0,.08))})};
    if(lv==0){logs(-.4,2.5,3.4,[.2,-.2]);
      k.as('wood',()=>[1.0,2.05].forEach(h=>k.L('c',TWC.woodD,[-L2,h,.42],[L2,h,.42],.065,'box')));
      for(let x=-L2+1.1;x<L2-.5;x+=2.2)[1.0,2.05].forEach(h=>k.L('c',0x8a7450,[x,h-.09,.43],[x,h+.09,.43],.085,'cyl6',.02))}
    else if(lv==1){twStones(k,TWC.stone,-L2,0,L2,0,-.45,.95,1.0,.7);k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',0,1.0,0,len,.1,1.08,0,0,0,.02));
      logs(.95,3.4,4.2,[.18,-.18]);
      [2.0,3.05].forEach(h=>[-1,1].forEach(s=>k.p('m',0x2e2e34,'box',0,h,s*.37,len,.12,.025,0,0,0,0)));
      for(let x=-L2+.9;x<L2-.3;x+=1.8)[2.0,3.05].forEach(h=>[-1,1].forEach(s=>k.p('m',TWC.iron,'oct',x,h,s*.4,.04,.04,.03)));
      k.as('wood',()=>k.L('c',TWC.woodD,[-L2,2.5,.4],[L2,2.5,.4],.06,'box'))}
    else{const top=lv==2?2.9:3.5;
      if(lv==3){twStones(k,TWC.stoneD,-L2,-.08,L2,-.08,-.45,.75,1.12,.95)}
      twStones(k,TWC.stone,-L2,0,L2,0,lv==3?.75:-.45,top,.95,lv==3?.95:.72);
      if(lv==3)k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',0,2.05,-.05,len,.16,1.04,0,0,0,.02));
      // coping, merlons with caps, arrow slits
      const py=lv==3?top+.02:top+.04,pz=lv==3?-.18:-.24,pw=lv==3?.62:.46;
      k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',0,top+.06,lv==3?-.1:0,len,.13,lv==3?1.3:1.08,0,0,0,.02));
      if(lv==3){for(let x=-L2+.35;x<L2;x+=.7)k.p('c',TWC.stoneD,'box',x,top-.18,-.6,.3,.3,.32,0,0,0,.1);}
      for(let x=-L2+.55;x<L2-.3;x+=1.45){const h=lv==3?.78:.66;k.p('c',R()<.3?TWC.stoneD:TWC.stone,'box',x,py+.1+h/2,pz,.8,h,pw,0,(R()-.5)*.04,0,.1);
        k.p('c',TWC.stoneL,'box',x,py+.15+h,pz,.9,.08,pw+.1,0,0,0,.04);k.p('c',0x16121a,'box',x,py+.1+h*.55,pz-pw/2-.003,.07,h*.5,.02,0,0,0,0)}
      // buttresses (outside) and torches (inside)
      for(let x=-L2+3.5;x<L2-1;x+=7){twStones(k,TWC.stoneD,x,-.46,x,-.86,-.45,lv==3?2.6:2.0,.75,.4);k.p('c',TWC.stone,'box',x,lv==3?2.72:2.12,-.66,.8,.18,.5,-.5,0,0,.05)}
      for(let x=-L2+5.25;x<L2-1;x+=10.5){k.L('m',TWC.iron,[x,1.7,.47],[x,1.95,.72],.025,'box',0);k.p('m',TWC.iron,'frus8',x,1.98,.72,.09,.12,.09,Math.PI,0,0,0);kdFlame(k,x,2.02,.72,.6)}
      if(lv==3){for(let x=-L2+4.2;x<L2-2;x+=8.4)kdBanner(k,x,top-.25,-.68,Math.PI,TOWNS[0].pal.ban||0x7a2230,.8,1.6);
        for(let x=-L2+2.6;x<L2-1;x+=10.5)kdBrazier(k,x,.15,top+.12,.8)}}}
}
// gatehouse across a 3-tile opening along z (the name boards sit on its faces at x=±.72); the town is on +x
function kdGateK(k,lv){
  {const R=k.R;
    const door=(s,iron)=>{const n=6;for(let i=0;i<n;i++){const x=.78+(i+.5)*1.42/n;k.as('wood',()=>k.p('c',R()<.3?TWC.woodD:0x4a3426,'box',x,1.12,s*1.58,1.42/n-.015,2.2-R()*.05,.08,0,0,0,.05))}
      [.45,1.12,1.8].forEach(h=>k.p('m',TWC.iron,'box',1.48,h,s*1.53,1.42,iron?.1:.06,.02,0,0,0,0));if(iron)for(let i=0;i<4;i++)[.45,1.12,1.8].forEach(h=>k.p('m',TWC.iron,'oct',.95+i*.35,h,s*1.515,.035,.035,.02))};
    if(lv<2){[-1,1].forEach(s=>[-.45,.45].forEach(x=>{k.as('bark',()=>k.L('c',TWC.woodD,[x,-.3,s*1.75],[x,4.0,s*1.75],.21,'log'));k.as('wood',()=>k.p('c',TWC.woodD,'cone6',x,4.25,s*1.75,.22,.5,.22,0,0,0,.05));
        if(lv==1)twStones(k,TWC.stone,x-.32,s*1.75,x+.32,s*1.75,-.3,.7,.6,.35)}));
      k.as('board',()=>k.p('c',TWC.wood,'box',0,2.75,0,1.36,.98,3.92,0,0,0,.02));
      k.as('wood',()=>{[-1,1].forEach(s=>k.L('c',TWC.woodD,[s*.7,2.24,-2.1],[s*.7,2.24,2.1],.08,'box'));[-1,1].forEach(s=>k.L('c',TWC.woodD,[s*.7,3.27,-2.1],[s*.7,3.27,2.1],.07,'box'))});
      for(let z=-1.65;z<=1.66;z+=.33){const hh=3.75+R()*.35;k.as('bark',()=>k.L('c',TWC.wood,[0,3.2,z],[0,hh,z],.15,'log'));k.as('wood',()=>k.p('c',TWC.wood,'cone6',0,hh+.22,z,.16,.45,.16,0,R()*3,0,.06))}
      if(lv==1)[-1,1].forEach(s=>[-1.6,0,1.6].forEach(z=>k.p('m',TWC.iron,'box',s*.69,2.75,z,.02,1.0,.1,0,0,0,0)));
      [-1,1].forEach(s=>door(s,lv==1))}
    else{// fortified stone gatehouse with a raised iron portcullis
      twStones(k,TWC.stone,0,-2.05,0,2.05,2.25,3.75,1.36,.6);twStones(k,TWC.stoneD,0,-2.2,0,-1.6,-.4,2.25,1.5,.4);twStones(k,TWC.stoneD,0,1.6,0,2.2,-.4,2.25,1.5,.4);
      k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',0,3.8,0,1.6,.12,4.5,0,0,0,.02));
      for(let z=-1.9;z<=1.91;z+=.76){[-1,1].forEach(s=>{k.p('c',TWC.stone,'box',s*.6,4.2,z,.36,.7,.5,0,0,0,.1);k.p('c',TWC.stoneL,'box',s*.6,4.58,z,.42,.07,.58,0,0,0,.04)})}
      for(let z=-1.36;z<=1.37;z+=.34){k.L('m',TWC.iron,[0,1.75,z],[0,2.3,z],.03,'box',0);k.p('m',TWC.iron,'cone4',0,1.68,z,.045,.14,.045,Math.PI,0,0,0)}
      [1.85,2.1].forEach(h=>k.L('m',TWC.iron,[0,h,-1.45],[0,h,1.45],.025,'box',0));
      [-1,1].forEach(s=>{k.L('m',TWC.iron,[.5,3.0,s*1.3],[.5,2.2,s*1.3],.02,'cyl6',0);door(s,1)});
      [-1,1].forEach(s=>kdBrazier(k,-1.25,s*2.75,0,1));
      [-1,1].forEach(s=>kdBanner(k,-.69,3.55,s*1.25,-Math.PI/2,TOWNS[0].pal.ban||0x7a2230,.6,1.0))}}
}
// wall towers: 0 timber watchtower · 1 stone base, timber top · 3 tall stone tower with battlements (level 2 = the v83 tower)
function kdTowerK(k,lv,r,h){const ban=TOWNS[0].pal.ban||0x7a2230;
  {const R=k.R,a=r*.72;
    if(lv==0){[-1,1].forEach(sx=>[-1,1].forEach(sz=>{k.as('bark',()=>k.L('c',TWC.woodD,[sx*a,-.3,sz*a],[sx*a*.92,h+1.2,sz*a*.92],.15,'log'));k.p('c',TWC.stoneD,'dod',sx*a,.05,sz*a,.26,.16,.26)}));
      k.as('wood',()=>{[[1,0],[0,1]].forEach(([dx,dz])=>[-1,1].forEach(s=>{const p0=dx?[-a,0,s*a]:[s*a,0,-a],p1=dx?[a,0,s*a]:[s*a,0,a];
          k.L('c',TWC.woodD,[p0[0],.4,p0[2]],[p1[0],h-.2,p1[2]],.05,'box');k.L('c',TWC.woodD,[p1[0],.4,p1[2]],[p0[0],h-.2,p0[2]],.05,'box');
          k.L('c',TWC.woodD,[p0[0]*1.15,h+.75,p0[2]*1.15],[p1[0]*1.15,h+.75,p1[2]*1.15],.05,'box')}))});
      k.as('board',()=>k.p('c',TWC.wood,'box',0,h,0,a*2.5,.14,a*2.5,0,0,0,.02));
      [-1,1].forEach(s=>{twPlanks(k,TWC.wood,-a*1.2,s*a*1.2,a*1.2,s*a*1.2,h,h+.55,.22);twPlanks(k,TWC.wood,s*a*1.2,-a*1.2,s*a*1.2,a*1.2,h,h+.55,.22)});
      k.as('shingle',()=>k.p('c',0x6a4a32,'cone4',0,h+1.75,0,r*1.35,1.15,r*1.35,0,Math.PI/4,0,.06));k.L('m',TWC.iron,[0,h+2.2,0],[0,h+2.7,0],.03,'cyl6',0)}
    else if(lv==1){twStoneRing(k,TWC.stone,0,0,r*.95,-.3,h*.5,.32);k.as('stone',()=>k.p('c',TWC.stoneL,'cyl8',0,h*.5+.05,0,r*1.05,.12,r*1.05,0,0,0,.03));
      const n=8;for(let i=0;i<n;i++){const an=i/n*6.283,x0=Math.cos(an)*r*1.02,z0=Math.sin(an)*r*1.02,an1=(i+1)/n*6.283;
        twPlanks(k,TWC.wood,x0,z0,Math.cos(an1)*r*1.02,Math.sin(an1)*r*1.02,h*.5+.1,h+.5,.2)}
      for(let i=0;i<4;i++){const an=i/4*6.283+.4;k.as('bark',()=>k.L('c',TWC.woodD,[Math.cos(an)*r*1.04,h*.5,Math.sin(an)*r*1.04],[Math.cos(an)*r*1.04,h+.55,Math.sin(an)*r*1.04],.09,'log'))}
      [.9,.1].forEach((f,i)=>k.p('c',0x18141a,'box',Math.cos(i*2.4)*(r*1.05),h*.5+(h*.5)*f*.6+.4,Math.sin(i*2.4)*(r*1.05),.1,.4,.18,0,-i*2.4,0,0));
      twCone(k,0x6a4a32,0,h+.45,0,r*1.35,r*1.9)}
    else{const H=h+1.0;twStoneRing(k,TWC.stoneD,0,0,r*1.12,-.3,.6,.36);twStoneRing(k,TWC.stone,0,0,r,.6,H,.32);
      const n=Math.max(8,Math.round(r*8));for(let i=0;i<n;i++){const an=i/n*6.283;k.p('c',TWC.stoneD,'box',Math.cos(an)*r*1.08,H-.16,Math.sin(an)*r*1.08,.3,.28,.24,0,-an,0,.08)}
      k.as('stone',()=>k.p('c',TWC.stoneL,'cyl8',0,H+.04,0,r*1.24,.14,r*1.24,0,0,0,.02));
      for(let i=0;i<n;i++)if(i%2==0){const an=(i+.5)/n*6.283;k.p('c',TWC.stone,'box',Math.cos(an)*r*1.14,H+.42,Math.sin(an)*r*1.14,.24,.62,r*6.283/n*.95,0,-an,0,.1)}
      [0,2.1,4.2].forEach(an=>k.p('c',0x18141a,'box',Math.cos(an)*(r+.12),H*.55,Math.sin(an)*(r+.12),.08,.55,.16,0,-an,0,0));
      twCone(k,0x3e3a48,0,H+.3,0,r*.85,r*2);k.p('m',TWC.gold,'oct',0,H+.3+r*2+.2,0,.12,.2,.12);
      const top=H+.3+r*2;k.L('c',TWC.woodD,[0,top,0],[0,top+1.3,0],.035,'cyl6',0);k.as('cloth',()=>{k.p('c',ban,'box',.42,top+1.0,0,.78,.44,.03,0,0,0,.06);k.p('c',ban,'tri',.92,top+1.0,0,.44,.24,.03,0,0,-Math.PI/2,.05)});
      kdBrazier(k,r*.55,r*.55,H+.1,.6)}}
}
// the whole ring (walls, towers, gates) is baked into one kit per level, so it costs only a few draw calls
function kdWalls(T,lv){const K=kdState(),o=kdOld(T);if(K.wg){T.g.remove(K.wg);K.wg=null}
  const R=TS,gz=1.75,LH=R-gz,key='KDRING|'+lv;o.gate.forEach(q=>q.visible=lv==2);o.tw.forEach(q=>q.visible=lv==2);o.ban.forEach(q=>q.visible=false);
  const mids=[[-10.5,-R],[10.5,-R],[-10.5,R],[10.5,R],[-R,-11.5],[R,-11.5],[-R,11.5],[R,11.5]];let k=null;
  if(!twHas(key)){k=twKit(601+lv);const at=(x,z,ry,f)=>k.at(x,0,z,f,ry);
    at(0,-R,0,()=>kdSegK(k,lv,2*R));at(0,R,Math.PI,()=>kdSegK(k,lv,2*R));
    [-1,1].forEach(sz=>{at(-R,sz*(gz+LH/2),Math.PI/2,()=>kdSegK(k,lv,LH));at(R,sz*(gz+LH/2),-Math.PI/2,()=>kdSegK(k,lv,LH))});
    if(lv!=2){[-1,1].forEach(s=>{[-2.3,2.3].forEach(z=>at(s*R,z,(s*7+z)%6,()=>kdTowerK(k,lv,.95,3.1)));[-1,1].forEach(sz=>at(s*R,sz*R,(s+sz)*1.3,()=>kdTowerK(k,lv,1.45,4.2)))});
      [-1,1].forEach(s=>at(s*R,0,s>0?Math.PI:0,()=>kdGateK(k,lv)))}
    if(lv>=3)mids.forEach(([x,z],i)=>at(x,z,i*1.7,()=>kdTowerK(k,3,1.15,3.6)))}
  const g=twGroup(k,key);g.name='kdWalls';K.wg=g;T.g.add(g);
  const cols=[],lamps=[];
  if(lv>=3){mids.forEach(([x,z])=>cols.push({x:T.cx+x,z:T.cy+z,r:1.15}));[-1,1].forEach(s=>[-1,1].forEach(q=>lamps.push([T.cx+s*(R+1.25),T.ph+1.2,T.cy+q*2.75])))}
  kdCol(T,K.wcol=K.wcol||[],cols);K.wl=lv;return lamps}

// ---------- the upgrade structures (one spot each, rebuilt when its level changes) ----------
// x,z = town-local spot, ry = facing; b(k,l) fills a kit for level l and returns its colliders as [lx,lz,r] or [lx,lz,hx,hz]
var KDU={
 // Training Grounds: dummies and a weapon rack → archery target and a roped sparring ring → a covered armoury with a forge
 train:{x:7.2,z:-6.9,ry:0,b(k,l){const c=[];k.as('dirt',()=>k.p('c',0x6a5844,'box',0,.012,0,6.2,.024,3.8,0,0,0,0));
   const dummy=(x,z,a)=>{k.as('bark',()=>k.L('c',TWC.woodD,[x,-.2,z],[x,1.75,z],.07,'log'));k.as('wood',()=>k.L('c',TWC.woodD,[x-.55*Math.cos(a),1.3,z+.55*Math.sin(a)],[x+.55*Math.cos(a),1.3,z-.55*Math.sin(a)],.045,'box'));
     k.as('straw',()=>{k.p('c',0xc8a850,'cyl8',x,1.15,z,.26,.7,.26,0,a,0,.1);k.p('c',0xb89a50,'dod',x,1.72,z,.19,.2,.19,0,a,0,.08)});
     [.95,1.35].forEach(h=>k.p('c',0x6a5030,'cyl8',x,h,z,.27,.04,.27,0,0,0,0));k.as('cloth',()=>k.p('c',0x8a2a2a,'box',x+.05,1.15,z+.25,.18,.16,.02,0,a,0,0));c.push([x,z,.32])};
   dummy(-2.2,.2,.3);dummy(-.7,-.2,-.2);
   // weapon rack
   k.as('wood',()=>{[-1,1].forEach(s=>{k.L('c',TWC.woodD,[1.4+s*.7,0,-1.0],[1.4+s*.7,1.3,-1.25],.05,'box');k.L('c',TWC.woodD,[1.4+s*.7,0,-1.5],[1.4+s*.7,1.3,-1.25],.05,'box')});k.L('c',TWC.woodD,[.6,1.2,-1.25],[2.2,1.2,-1.25],.04,'box')});
   [0,1,2,3].forEach(i=>{const x=.9+i*.34;k.L('m',0x9a9aa4,[x,.15,-1.0],[x,1.25,-1.18],.025,'box',0);k.p('m',TWC.iron,'box',x,1.0,-1.13,.16,.03,.05,0,0,0,0);k.as('wood',()=>k.L('c',0x4a3020,[x,1.05,-1.15],[x,1.32,-1.2],.025,'cyl6'))});c.push([1.4,-1.25,.85,.35]);
   if(l>=2){// archery target and the sparring ring
     {const tx=2.6,ty=1.05,tz=.7,th=Math.PI/2-.2,ay=Math.cos(th),az=Math.sin(th);
      k.as('wood',()=>[-1,1].forEach(s=>{k.L('c',TWC.woodD,[tx+s*.42,0,tz+.25],[tx+s*.2,1.55,tz-.05],.04,'box');k.L('c',TWC.woodD,[tx,0,tz-.6],[tx,1.4,tz-.12],.04,'box')}));
      k.as('straw',()=>k.p('c',0xc8a850,'cyl8',tx,ty,tz,.55,.24,.55,th,0,0,.04));
      [[.46,0xe8e0d0],[.34,0x2a3a6a],[.22,0xb83a2a],[.1,0xe0c040]].forEach(([r,col],i)=>{const o=.125+i*.006;k.as('cloth',()=>k.p('c',col,'cyl8',tx,ty+ay*o,tz+az*o,r,.012,r,th,0,0,0))});
      k.L('m',0x9a9aa4,[tx+.15,ty+.1,tz+.1],[tx+.25,ty+.18,tz+.6],.012,'box',0);c.push([tx,tz,.5])}
     for(let i=0;i<10;i++){const a=i/10*6.283,x=-1.45+Math.cos(a)*2.0,z=.05+Math.sin(a)*1.35;if(Math.sin(a)>.75)continue;k.as('bark',()=>k.L('c',TWC.woodD,[x,-.1,z],[x,.95,z],.06,'log'))
       const a2=(i+1)/10*6.283,x2=-1.45+Math.cos(a2)*2.0,z2=.05+Math.sin(a2)*1.35;if(Math.sin(a2)<=.75)k.L('c',0x9a8458,[x,.8,z],[x2,.8,z2],.022,'cyl6',0)}
     [-1,1].forEach(s=>{k.as('wood',()=>k.p('c',0x8a2a2a,'cyl8',.75+s*.3,1.0,-.98,.24,.05,.24,Math.PI/2-.2,0,0,.02));k.p('m',TWC.iron,'oct',.75+s*.3,1.0,-.94,.06,.06,.03)})}
   if(l>=3){// armoury lean-to with an anvil and a glowing forge
     const ax=-1.2,az=-1.7;[-1,1].forEach(s=>{k.as('bark',()=>{k.L('c',TWC.woodD,[ax+s*1.6,0,az-.45],[ax+s*1.6,2.35,az-.45],.09,'log');k.L('c',TWC.woodD,[ax+s*1.6,0,az+.55],[ax+s*1.6,1.95,az+.55],.08,'log')})});
     k.as('shingle',()=>k.p('c',0x6a4a32,'box',ax,2.2,az+.05,3.6,.1,1.5,.28,0,0,.04));twPlanks(k,TWC.wood,ax-1.6,az-.5,ax+1.6,az-.5,0,2.2,.24);
     twStones(k,TWC.stoneD,ax+.9,az-.15,ax+1.5,az-.15,0,.75,.6,.3);k.p('c',0x1e1a18,'box',ax+1.2,.77,az-.15,.5,.04,.4,0,0,0,0);kdFlame(k,ax+1.2,.78,az-.15,.7);
     k.p('m',0x3a3a40,'box',ax-.2,.55,az+.1,.6,.2,.26,0,0,0,0);k.p('m',0x3a3a40,'box',ax-.2,.3,az+.1,.26,.4,.2,0,0,0,0);k.p('m',0x3a3a40,'cone4',ax+.16,.58,az+.1,.1,.24,.08,0,0,-Math.PI/2,0);
     k.as('wood',()=>k.p('c',0x4a3020,'cyl8',ax-.2,.1,az+.1,.3,.2,.3,0,0,0,.05));kdBanner(k,ax,2.0,az+.62,0,SHU[0].col,.6,1.0);c.push([ax,az,1.7,.6])}
   return c}},
 // Scholar's Tower: stone tower with glowing windows → a jettied study and a library annex → a brass observatory with orbiting runes
 tower:{x:6.6,z:-17.4,ry:0,b(k,l){const c=[],r=1.3,H=l>=2?6.6:5.0,gl=0xaee6ff;twStoneRing(k,0x5a5668,0,0,r*1.08,-.3,.5,.34);twStoneRing(k,0x6a6678,0,0,r,.5,H,.3);
   twDoor(k,0,.5,r+.06,.75,1.35,0);[0,1].forEach(i=>k.p('c',0x8a8698,'box',0,1.95+i*.02,r+.08,1.0-i*.15,.16,.14,0,0,0,.06));
   [[2.9,0],[3.9,.5],[2.9,-.5],[4.4,-1.0]].forEach(([y,a])=>{if(y<H-.5)twWindow(k,Math.sin(a)*(r+.04),y,Math.cos(a)*(r+.04),.32,.6,a,gl)});
   if(l>=2){// timber-framed study jettied out over the stone
     const y0=H-1.7,n=8;for(let i=0;i<n;i++){const a=i/n*6.283,a1=(i+1)/n*6.283,R1=r+.28,x0=Math.cos(a)*R1,z0=Math.sin(a)*R1,x1=Math.cos(a1)*R1,z1=Math.sin(a1)*R1;
       k.as('plaster',()=>k.p('c',0xb8a88c,'box',(x0+x1)/2,y0+.8,(z0+z1)/2,Math.hypot(x1-x0,z1-z0)+.02,1.5,.12,0,-Math.atan2(z1-z0,x1-x0),0,.02));
       k.as('wood',()=>{k.L('c',TWC.woodD,[x0,y0,z0],[x0,y0+1.6,z0],.07,'box');k.L('c',TWC.woodD,[x0,y0+.05,z0],[x1,y0+1.55,z1],.04,'box')});
       k.L('c',TWC.woodD,[Math.cos(a)*(r-.1),y0-.35,Math.sin(a)*(r-.1)],[Math.cos(a)*(R1+.05),y0,Math.sin(a)*(R1+.05)],.06,'box')}
     k.as('wood',()=>{k.p('c',TWC.woodD,'cyl8',0,y0,0,r+.36,.1,r+.36,0,Math.PI/8,0,.02);k.p('c',TWC.woodD,'cyl8',0,y0+1.62,0,r+.4,.1,r+.4,0,Math.PI/8,0,.02)});
     [0,2.3,4.1].forEach(a=>twWindow(k,Math.sin(a)*(r+.36),y0+.85,Math.cos(a)*(r+.36),.4,.55,a,gl));
     // library annex
     const ax=2.25,az=.3;k.at(ax,0,az,()=>{twHall(k,{w:2.2,d:2.4,h:2.1,stoneWalls:1,wc:0x5a5668,pc:0x2c2150});twGable(k,0x2e2848,2.2,2.4,1.0,.3,2.1,0x2c2150);twWindow(k,0,1.3,1.22,.5,.5,0,gl)});
     c.push([ax,az,1.25,1.35])}
   const rt=H+(l>=2?.08:0);if(l<3){k.as('stone',()=>k.p('c',0x4e4a5c,'cyl8',0,rt,0,r+.42,.14,r+.42,0,0,0,.03));twCone(k,0x2e2848,0,rt+.05,0,r+.55,2.3);k.p('g',0xffe08a,'oct',0,rt+2.6,0,.14,.2,.14)}
   else{// observatory: open gallery, brass dome with a slot, telescope
     k.as('stone',()=>k.p('c',0x4e4a5c,'cyl8',0,rt,0,r+.5,.14,r+.5,0,0,0,.03));for(let i=0;i<10;i++){const a=i/10*6.283;k.L('m',TWC.iron,[Math.cos(a)*(r+.42),rt,Math.sin(a)*(r+.42)],[Math.cos(a)*(r+.42),rt+.8,Math.sin(a)*(r+.42)],.025,'cyl6',0)}
     for(let i=0;i<10;i++){const a=i/10*6.283,a1=(i+1)/10*6.283;k.L('m',TWC.iron,[Math.cos(a)*(r+.42),rt+.8,Math.sin(a)*(r+.42)],[Math.cos(a1)*(r+.42),rt+.8,Math.sin(a1)*(r+.42)],.02,'box',0)}
     k.as('ashlar',()=>k.p('c',0x8a8698,'cyl8',0,rt+.55,0,r*.86,1.0,r*.86,0,0,0,.02));k.as('brass',()=>k.p('m',0xc9a24a,'sph',0,rt+1.05,0,r*.95,r*.9,r*.95,0,0,0,0));
     for(let i=0;i<8;i++){const a=i/8*6.283;k.p('m',0x8a6a2a,'box',Math.cos(a)*r*.6,rt+1.6,Math.sin(a)*r*.6,.05,.75,.05,Math.sin(a)*.9,0,-Math.cos(a)*.9,0)}
     k.p('c',0x1a1424,'box',0,rt+1.5,r*.45,.32,.9,.9,-.5,0,0,0);k.as('brass',()=>{k.L('m',0xb08a3a,[0,rt+1.35,.2],[0,rt+2.55,1.65],.13,'cyl8',0);k.L('m',0xb08a3a,[0,rt+2.5,1.6],[0,rt+2.62,1.75],.16,'cyl8',0)});
     k.p('g',0xc8b0ff,'oct',0,rt+2.2,0,.16,.26,.16)}
   c.push([0,0,r+.35]);return c},
  anim(g,l){if(l<3)return null;const rs=[0,1,2].map(i=>{const m=new THREE.Mesh(new THREE.OctahedronGeometry(.16,0),new THREE.MeshBasicMaterial({color:[0x9ad8ff,0xc8b0ff,0xffe08a][i]}));m.userData.lpsSkip=1;g.add(m);return m});
    return now=>rs.forEach((m,i)=>{const a=now/1600+i*2.094;m.position.set(Math.cos(a)*2.3,8.6+Math.sin(now/700+i)*.3,Math.sin(a)*2.3);m.rotation.y=now/500})}},
 // Treasury: a log counting-house with an iron chest → a stone vault with an iron door → gilded dome, braziers and gold
 treas:{x:-6.4,z:-17.4,ry:0,b(k,l){const c=[],W1=3.2,D=2.6,col=SHU.find(u=>u.k=='treas').col;
   if(l==1){twHall(k,{w:W1,d:D,h:2.2});twGable(k,0x6a4a32,W1,D,1.1,.3,2.2)}
   else{twHall(k,{w:W1,d:D,h:2.5,stoneWalls:1,wc:0x7a7468,pc:0x3a3a40});
     if(l==2)twGable(k,0x45403e,W1,D,1.1,.3,2.5);
     else{k.as('ashlar',()=>k.p('c',TWC.stoneL,'box',0,2.6,0,W1+.3,.2,D+.3,0,0,0,.02));for(let i=0;i<4;i++)[-1,1].forEach(s=>{k.p('c',TWC.stone,'box',-W1/2+.2+i*(W1-.4)/3,2.9,s*(D/2+.05),.36,.42,.3,0,0,0,.1)});
       k.as('stone',()=>k.p('c',0x6a6458,'cyl8',0,2.8,0,1.05,.3,1.05,0,0,0,.03));k.as('brass',()=>k.p('m',0xd8b040,'sph',0,2.95,0,1.0,.85,1.0,0,0,0,0));k.p('m',0xd8b040,'oct',0,3.95,0,.18,.3,.18);
       [-1,1].forEach(s=>kdBrazier(k,s*(W1/2+.35),D/2+.55,0,.9))}}
   const dz=D/2+.02;
   if(l==1){twDoor(k,0,.36,dz,.85,1.5,0);k.p('m',TWC.iron,'box',1.0,.25,dz+.4,.62,.4,.4,0,.1,0,0);k.as('wood',()=>k.p('c',0x5a3c24,'box',1.0,.28,dz+.4,.56,.42,.36,0,.1,0,.02));c.push([1.0,dz+.4,.35,.25])}
   else{k.as('iron',()=>{k.p('m',0x4a4a52,'box',0,1.2,dz+.02,1.0,1.7,.08,0,0,0,0)});for(let i=0;i<4;i++)k.p('m',TWC.iron,'box',0,.55+i*.42,dz+.07,1.02,.06,.02,0,0,0,0);k.p('m',0xd8b040,'cyl8',.32,1.15,dz+.09,.07,.04,.07,Math.PI/2,0,0,0);
     [0,1].forEach(i=>k.p('c',0x8a8678,'box',0,2.14+i*.02,dz+.06,1.4-i*.2,.2,.18,0,0,0,.06));kdBanner(k,-1.15,2.3,dz+.05,0,col,.5,1.0);kdBanner(k,1.15,2.3,dz+.05,0,col,.5,1.0)}
   if(l>=2)[[-.9,.5],[.95,.6],[1.25,.25]].forEach(([x,s],i)=>{if(l<3&&i>0)return;k.as('brass',()=>{for(let j=0;j<4;j++)k.p('m',0xe0c040,'cyl8',x+(j%2)*.08,.03+j*.05,dz+.55+(j>>1)*.06,.11*s+.06,.05,.11*s+.06,0,0,0,0)})});
   c.push([0,0,W1/2+.1,D/2+.1]);return c}},
 // Beast Den: a log-fenced pen with straw and a trough → a thatched kennel → a great lodge with a skull over the door and torches
 den:{x:-13.6,z:14.6,ry:0,b(k,l){const c=[],W1=4.6,D=3.6,col=SHU.find(u=>u.k=='den').col;
   k.as('straw',()=>{k.p('c',0xb89a50,'box',0,.02,0,W1-.2,.04,D-.2,0,0,0,0);for(let i=0;i<12;i++)k.p('c',0xc8a850,'box',(k.R()-.5)*(W1-.6),.05,(k.R()-.5)*(D-.6),.4,.03,.08,0,k.R()*3,0,0)});
   const fence=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/1.1));for(let i=0;i<=n;i++){const t=i/n;k.as('bark',()=>k.L('c',TWC.woodD,[x0+(x1-x0)*t,-.1,z0+(z1-z0)*t],[x0+(x1-x0)*t,1.05,z0+(z1-z0)*t],.07,'log'))}
     [.45,.85].forEach(h=>k.as('wood',()=>k.L('c',TWC.wood,[x0,h,z0],[x1,h,z1],.045,'cyl6')))};
   fence(-W1/2,-D/2,W1/2,-D/2);fence(-W1/2,-D/2,-W1/2,D/2);fence(W1/2,-D/2,W1/2,D/2);fence(-W1/2,D/2,-.7,D/2);fence(.7,D/2,W1/2,D/2);
   c.push([0,-D/2,W1/2,.1],[-W1/2,0,.1,D/2],[W1/2,0,.1,D/2],[-(W1/2+.7)/2,D/2,(W1/2-.7)/2,.1],[(W1/2+.7)/2,D/2,(W1/2-.7)/2,.1]);
   k.as('wood',()=>{k.p('c',0x5a3c24,'box',1.5,.25,1.0,1.1,.3,.42,0,.2,0,.03);k.p('c',0x3a6a90,'box',1.5,.4,1.0,.95,.03,.3,0,.2,0,0)});
   k.as('plain',()=>[[-.4,.9],[.3,1.2],[-1.0,.6]].forEach(([x,z],i)=>k.L('c',0xe8e0c8,[x-.2,.06,z],[x+.2,.08,z+.1*i],.035,'cyl6')));
   if(l>=2){// kennel against the back fence
     const kx=-1.0,kz=-.75,kw=l>=3?2.6:1.9,kd=l>=3?1.5:1.2,kh=l>=3?1.5:1.1;twLogs(k,TWC.wood,kx-kw/2,kz-kd/2,kx+kw/2,kz-kd/2,0,kh,.12,.15);twLogs(k,TWC.wood,kx-kw/2,kz-kd/2,kx-kw/2,kz+kd/2,.1,kh,.12,.15);twLogs(k,TWC.wood,kx+kw/2,kz-kd/2,kx+kw/2,kz+kd/2,.1,kh,.12,.15);
     twLogs(k,TWC.wood,kx-kw/2,kz+kd/2,kx-.45,kz+kd/2,0,kh,.12,.1);twLogs(k,TWC.wood,kx+.45,kz+kd/2,kx+kw/2,kz+kd/2,0,kh,.12,.1);k.as('wood',()=>k.L('c',TWC.woodD,[kx-.55,kh*.82,kz+kd/2+.05],[kx+.55,kh*.82,kz+kd/2+.05],.07,'box'));
     k.p('c',0x120e0c,'box',kx,kh*.4,kz+kd/2-.02,.84,kh*.8,.05,0,0,0,0);
     k.at(kx,0,kz,()=>twGable(k,TWC.thatch,kw,kd,.8,.25,kh));
     c.push([kx,kz,kw/2+.1,kd/2+.1]);
     if(l>=3){k.as('plain',()=>{k.p('c',0xe8e0c8,'dod',kx,kh+.15,kz+kd/2+.3,.24,.2,.22);[-1,1].forEach(s=>k.L('c',0xe8e0c8,[kx+s*.15,kh+.25,kz+kd/2+.3],[kx+s*.65,kh+.75,kz+kd/2+.2],.05,'cone6'))});
       [-1,1].forEach(s=>{k.L('m',TWC.iron,[kx+s*(kw/2+.05),kh*.75,kz+kd/2+.05],[kx+s*(kw/2+.05),kh*.75+.25,kz+kd/2+.3],.02,'box',0);kdFlame(k,kx+s*(kw/2+.05),kh*.75+.28,kz+kd/2+.3,.5)});
       kdBanner(k,1.3,1.6,-D/2+.08,0,col,.5,1.0);k.as('bark',()=>k.L('c',TWC.woodD,[1.3,-.1,-D/2+.02],[1.3,1.7,-D/2+.02],.06,'log'))}}
   return c}},
 // Hatchery: a straw nest with eggs and a warming brazier → a thatched shelter → glowing crystal incubator and a rune ring
 hatch:{x:13.2,z:16.9,ry:0,b(k,l){const c=[],col=SHU.find(u=>u.k=='hatch').col;
   k.as('straw',()=>{for(let i=0;i<14;i++){const a=i/14*6.283;k.p('c',i%2?0xc8a850:0xa88a48,'box',Math.cos(a)*.75,.18,Math.sin(a)*.75,.5,.32,.22,0,-a,(k.R()-.5)*.4,.1)}k.p('c',0xb89a50,'cyl8',0,.08,0,.85,.14,.85,0,0,0,.05)});
   [[0,0,0xe8dcc0],[.32,.2,0xd8a84a],[-.28,.25,0x9ad8c0],[.05,-.34,0xc87a5a]].forEach(([x,z,ec],i)=>{if(i>=1+l)return;k.as('plain',()=>k.p('c',ec,'sph',x,.32,z,.17,.24,.17,(k.R()-.5)*.3,0,(k.R()-.5)*.3,0))});
   kdBrazier(k,1.25,-.6,0,.75);c.push([0,0,.95],[1.25,-.6,.3]);
   if(l>=2){[-1,1].forEach(sx=>[-1,1].forEach(sz=>k.as('bark',()=>k.L('c',TWC.woodD,[sx*1.5,-.1,sz*1.2],[sx*1.5,2.2,sz*1.2],.08,'log'))));
     twGable(k,TWC.thatch,3.0,2.4,1.0,.3,2.2);
     for(let i=0;i<3;i++){k.p('c',0x7a5a3a,'box',-1.15,.22+i*.0,1.05-i*.5,.42,.42,.42,0,i*.3,0,.05);k.as('straw',()=>k.p('c',0xc8a850,'box',-1.15,.44,1.05-i*.5,.36,.04,.36,0,i*.3,0,0))}}
   if(l>=3){for(let i=0;i<6;i++){const a=i/6*6.283+.3;k.p('g',[0xaee6ff,0xc8b0ff,0x9affd8][i%3],'oct',Math.cos(a)*1.15,.35,Math.sin(a)*1.15,.12,.38,.12,.15*Math.sin(a),a,0)}
     k.L('m',TWC.iron,[0,2.15,0],[0,1.6,0],.012,'cyl6',0);k.p('m',TWC.iron,'cone4',0,1.6,0,.16,.12,.16,0,Math.PI/4,0,0);k.as('glass',()=>k.p('g',0xffe2a0,'box',0,1.38,0,.2,.32,.2));
     kdBanner(k,0,2.05,1.25,0,col,.5,.9)}
   return c},
  ring(g,l){if(l<3)return;const m=new THREE.Mesh(new THREE.RingGeometry(1.35,1.55,12),new THREE.MeshBasicMaterial({color:0x9a7aff,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.y=.04;m.userData.lpsSkip=1;g.add(m);return m}}};
// build (or rebuild) one upgrade structure
function kdUp(T,key,l){const K=kdState(),U=KDU[key],st=K.up[key]=K.up[key]||{l:-1,g:null,col:[],an:null};if(!U||st.l===l)return;
  if(st.g){T.g.remove(st.g);st.g=null}if(st.an){const i=TANIM.indexOf(st.an);if(i>=0)TANIM.splice(i,1);st.an=null}
  st.l=l;let cols=[];
  if(l>0){const bk='KDU|'+key+'|'+l;let k=null,cl=null;if(!twHas(bk)){k=twKit(401+l*7+key.length);cl=U.b(k,l);(K.ucol=K.ucol||{})[bk]=cl}else cl=K.ucol[bk];
    const g=twGroup(k,bk);g.position.set(U.x,0,U.z);g.rotation.y=U.ry||0;g.name='kd_'+key;T.g.add(g);st.g=g;
    if(U.ring)U.ring(g,l);const f=U.anim&&U.anim(g,l);if(f){st.an={x:T.cx+U.x,z:T.cy+U.z,f};TANIM.push(st.an)}
    const c=Math.cos(U.ry||0),s=Math.sin(U.ry||0);cols=(cl||[]).map(q=>{const x=T.cx+U.x+q[0]*c+q[1]*s,z=T.cy+U.z-q[0]*s+q[1]*c;return q.length==3?{x,z,r:q[2]}:{x,z,hx:q[2],hz:q[3]}})}
  kdCol(T,st.col,cols)}

// ---------- prestige: the more you have built, the prouder Duskhold looks ----------
// total upgrade levels 0..18: ≥1 wall banners · ≥4 braziers round the fountain · ≥8 banners on the shopfronts · ≥12 pennant lines over the plaza
function kdPrestige(T,P){const K=kdState(),o=kdOld(T),lv=P>=12?3:P>=8?2:P>=4?1:0;o.ban.forEach(q=>q.visible=P>=1&&K.wl!=3);if(K.pr===lv)return [];K.pr=lv;
  if(K.pg){T.g.remove(K.pg);K.pg=null}const lamps=[];if(!lv){kdCol(T,K.pcol=K.pcol||[],[]);return lamps}
  const key='KDP|'+lv,ban=T.pal.ban||0x7a2230;let k=null;
  if(!twHas(key)){k=twKit(501+lv);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{const x=sx*4.6,z=sz*4.6;twStones(k,TWC.stone,x-.35,z,x+.35,z,0,.45,.7,.35);kdBrazier(k,x,z,.45,.9)});
    // shopfront banners: [x, top, z, width, height] (clear of doors, windows and signs)
    if(lv>=2)[[-2.1,1.84,-12.3,.4,.62],[2.1,1.84,-12.3,.4,.62],[-16.9,2.5,-13.62,.38,.9],[-11.6,2.5,-13.62,.38,.9],[13.65,2.3,-13.62,.4,.9],[15.9,2.3,-13.62,.4,.9]].forEach(([x,y,z,w,h])=>kdBanner(k,x,y,z,0,ban,w,h));
    if(lv>=3){const pts=[[-9.75,14.7],[9.75,14.7],[12.6*1.5,-3.6*1.5],[-12.6*1.5,-3.6*1.5]],cols=[ban,0xc9a24a,0x2a3a6a,0xe8dcc0];
      [[0,1],[1,2],[3,0]].forEach(([a,b])=>{const A=pts[a],B=pts[b],n=Math.round(Math.hypot(B[0]-A[0],B[1]-A[1])/.7);for(let i=0;i<n;i++){const t=(i+.5)/n,x=A[0]+(B[0]-A[0])*t,z=A[1]+(B[1]-A[1])*t,y=3.0-Math.sin(Math.PI*t)*.9,ry=-Math.atan2(B[1]-A[1],B[0]-A[0]);
        k.as('cloth',()=>k.p('c',cols[i%4],'tri',x,y-.22,z,.32,.3,.015,0,ry,Math.PI,.02))}
        k.L('c',0x8a7450,[A[0],3.05,A[1]],[(A[0]+B[0])/2,2.15,(A[1]+B[1])/2],.012,'cyl6',0);k.L('c',0x8a7450,[(A[0]+B[0])/2,2.15,(A[1]+B[1])/2],[B[0],3.05,B[1]],.012,'cyl6',0)})}}
  const g=twGroup(k,key);g.name='kdPrestige';T.g.add(g);K.pg=g;
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>lamps.push([T.cx+sx*4.6,T.ph+1.5,T.cy+sz*4.6]));
  kdCol(T,K.pcol=K.pcol||[],[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sz])=>({x:T.cx+sx*4.6,z:T.cy+sz*4.6,r:.42})));return lamps}

// rebuild everything that depends on the stronghold levels (called from shApply, i.e. on load and after every purchase)
function kdSync(){const T=TOWNS[0];if(!T||!T.g)return;const K=kdState();let lamps=[];
  const wl=kdLv('walls');if(K.wl!==wl)K.wlamps=kdWalls(T,wl)||[];lamps=lamps.concat(K.wlamps||[]);
  ['train','tower','treas','den','hatch'].forEach(k=>kdUp(T,k,kdLv(k)));
  const P=SHU.reduce((a,u)=>a+kdLv(u.k),0);const pl=kdPrestige(T,P);if(pl.length||K.pr===0)K.plamps=pl;lamps=lamps.concat(K.plamps||[]);
  kdLamps(lamps)}
{const f=shApply;shApply=function(){const r=f.apply(this,arguments);try{kdSync()}catch(e){console.warn('kingdom',e)}return r}}

// the upgrade banners by the fountain: the cloth hangs in front of its pole (it used to cut through it)
function shBuild(){const T=TOWNS[0];if(!T)return;
  if(!SHM.st){const x=T.cx-14,z=T.cy+7,g=new THREE.Group(),prev=T_cur;T_cur={col:[],cx:0,cy:0};
    npc(g,x,z,{robe:0x2a3550,trim:0xd8b44a,hat:'cap',hatC:0x1a2236,label:'Stronghold Steward',ry:Math.atan2(T.cx-x,T.cy-z)});T_cur=prev;
    let k=null;if(!twHas('DESK')){k=twKit(121);k.p('c',0x4a3020,'box',0,.86,0,.92,.08,.62,0,0,0,.04);[-1,1].forEach(s=>[-1,1].forEach(q=>k.L('c',TWC.woodD,[s*.4,0,q*.25],[s*.4,.84,q*.25],.04,'box')));
      k.as('cloth',()=>k.p('c',0xe8dcc0,'box',0,.92,0,.6,.02,.4,0,.1,0,0)).p('c',0x2a2a30,'cyl6',.3,.95,.15,.04,.08,.04,0,0,0,0).p('c',0xe8e0d0,'box',.32,1.02,.15,.01,.12,.04,0,0,.4,0);
      k.p('c',0x5a3c24,'box',-.25,.95,-.12,.24,.1,.2,0,0,0,.03)}
    const tb=twGroup(k,'DESK');tb.position.set(x+1.1,0,z+.2);g.add(tb);
    g.position.y=GH(x,z);scene.add(g);SHM.st={g,x,z}}
  const sp=SHU.map((u,i)=>{const an=i/SHU.length*6.283+Math.PI/6;return [T.cx+Math.cos(an)*6.6,T.cy+Math.sin(an)*6.6]});
  SHU.forEach((u,i)=>{const l=shL(u.k),o=SHM.pil[u.k];if(o&&o.l===l)return;if(o)scene.remove(o.g);if(!l){delete SHM.pil[u.k];return}
    const [x,z]=sp[i],g=new THREE.Group();g.position.set(x,GH(x,z),z);g.rotation.y=Math.atan2(T.cx-x,T.cy-z);
    const key='SHP2|'+u.col;let k=null;if(!twHas(key)){k=twKit(131);
      [[0,0,.42,.2],[.3,.3,.22,.16],[-.32,-.25,.24,.15],[.28,-.3,.2,.13],[-.3,.3,.2,.14]].forEach(q=>k.p('c',k.R()<.4?TWC.stoneD:TWC.stone,'dod',q[0],q[3]*.6,q[1],q[2],q[3],q[2],q[0],q[1],0,.2));
      k.as('bark',()=>k.L('c',TWC.woodD,[0,.1,-.1],[0,3.05,-.1],.075,'log'));k.as('wood',()=>k.L('c',TWC.woodD,[-.52,2.95,0],[.52,2.95,0],.05,'box'));k.L('m',TWC.iron,[0,2.95,-.1],[0,2.95,0],.03,'box',0);
      kdBanner(k,0,2.95,.04,0,u.col,.85,1.45)}
    twBake(k?k.P:[],key,true).forEach(m=>{m.castShadow=m.material===twMat().c;g.add(m)});
    for(let q=0;q<l;q++){const r=new THREE.Mesh(new THREE.TorusGeometry(.18,.035,4,10),new THREE.MeshBasicMaterial({color:0xffd870}));r.position.set(0,2.62-q*.46,.1);r.userData.lpsSkip=1;g.add(r)}
    const lb=document.createElement('canvas');lb.width=128;lb.height=128;const c2=lb.getContext('2d');c2.font='80px serif';c2.textAlign='center';c2.textBaseline='middle';c2.fillText(u.i,64,70);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(lb),transparent:true,depthWrite:false}));s.scale.set(.7,.7,1);s.position.set(0,3.4,0);g.add(s);
    scene.add(g);SHM.pil[u.k]={g,l}})}
// the Trading Post's coin emblem
function twCoin(){let k=null;if(!twHas('COIN')){k=twKit(9);k.as('brass',()=>{k.p('m',0xe0b83a,'cyl8',0,0,0,.5,.07,.5,Math.PI/2,0,Math.PI/8,0);k.p('m',0xb08a2a,'cyl8',0,0,.04,.36,.02,.36,Math.PI/2,0,Math.PI/8,0);k.p('m',0xe8c84a,'oct',0,0,.06,.14,.2,.02)});
  k.L('m',TWC.iron,[0,.5,-.05],[0,.62,-.05],.02,'box',0)}const g=twGroup(k,'COIN');g.children.forEach(m=>m.castShadow=false);return g}
