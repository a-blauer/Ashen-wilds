// ================= v201: painted icon art (owner, Nov 5 2026: "the symbols for spells, items, eggs, resources look too much
// like cartoon emojis — redo them with original artworks in the game's dark fantasy style") =================
// The v88 set (0020/0030) drew every icon as one flat silhouette with a two-colour gradient. v201 paints each icon from layers
// with muted dark-fantasy materials, form shading, rim light, an ink outline and (for magic) a glow. Gear pictures (v89 rendered
// models) are untouched.
//  KQA[name] = [layer, ...]      64×64 units. Names are the v88 icon names, so every emoji in KQE gets its painting.
//  layer:
//    [d, paint, mode, M]       fill an SVG path. paint: 't' (the icon's tint: KQE's tint, e.g. 🩸 = drop+blood), a material
//                              ('iron'), a tone ('iron.d', 't.h': h light-most, l, m, d, p darkest), 'ink', or a CSS colour.
//                              mode letters: f flat (no shading) · r round (sphere light) · m metal (bright rim) · g glow halo
//                              · n no rim · a 55% alpha. A material with no mode gets form shading + rim light.
//                              M: optional transform [a,b,c,d,e,f] (or a list of them)
//    ['s', d, w, paint, mode, M] stroke a path (round caps), w in units; mode g = glow
//    ['i', d, paint, mode, M]  fill only over what is already painted (details inside a shape)
//    ['is', d, w, paint, mode, M] stroke only over what is already painted (engraved lines, cracks, grain)
//    ['x', d, M] / ['xs', d, w, M] cut a hole / a stroke out of what is painted
//  KQA[name].M = a transform for the whole icon (e.g. KQG.RT(-30) to lay a key on the diagonal).
//  kqArtBmp(name, tint, px) -> cached canvas; kqArtUrl(name, tint) -> PNG data URL for the DOM layer (0040).
var KQA={},KQAP,KQA_C={},KQA_U={},KQA_BB={},KQA_P2={},KQAS={n:0,ms:0};
// palettes: [highlight, light, mid, dark, deepest] — muted, weathered, for the dark-fantasy UI
KQAP={gold:['#f7e6a6','#d4a54c','#9a6c26','#5c3c14','#261606'],steel:['#eef2f5','#aab3bd','#6c747f','#3a4049','#171a20'],
 iron:['#d6d0c6','#948d82','#5e5850','#35312c','#161310'],bronze:['#f2c897','#bb7c45','#7f4c27','#4a2a12','#200e04'],
 silver:['#f5f5f9','#bfc2ce','#828598','#474a5c','#1c1e2c'],fire:['#fff3b8','#ffae34','#d9521a','#861c0b','#360904'],
 ember:['#ffd6a0','#e47f38','#a83e18','#5e1d0b','#280b03'],spark:['#fff7cc','#efc852','#b9861d','#6a470d','#2c1b04'],
 ice:['#f2fcff','#a6d9ec','#5897bf','#2a567c','#0f243a'],water:['#cdeeff','#5ba3d2','#2a669e','#153a62','#08192e'],
 blood:['#ff9f8c','#c2362b','#841519','#48080c','#1c0204'],heal:['#f7b2a8','#c24a50','#8a2232','#4c0f1c','#1e0508'],
 poison:['#e8ffa2','#9ac93e','#58861f','#2d4a10','#0f1d04'],nature:['#dcefa6','#86aa4c','#52762b','#2c4617','#101d07'],
 bloom:['#ffd8e5','#c97595','#893c60','#4b1b34','#1d0813'],wood:['#e2b47c','#a46c3a','#6c4220','#3f240e','#1a0d04'],
 leather:['#dcae82','#996240','#633a21','#381f0e','#170a04'],stone:['#d9d4ca','#999387','#635e56','#3a3631','#181613'],
 bone:['#fbf3dc','#d6c6a0','#a1916d','#62573e','#2a2517'],arcane:['#f1d6ff','#a566dc','#6932a4','#381560','#150626'],
 shadow:['#cdbde6','#7a64a2','#4c3a72','#281c42','#0d091b'],holy:['#fffbe0','#f0d084','#c1923a','#775217','#2f1f09'],
 spirit:['#e9fcff','#99ddee','#4ba1c2','#205d7a','#092330'],earth:['#e6c597','#ab8150','#73522d','#422e15','#1b1106'],
 slime:['#d9ffb2','#79c94a','#3c882b','#1d4815','#091d06'],mist:['#eef2f6','#b2bdca','#7a8696','#444e5e','#1b212b'],
 sand:['#fbe9b2','#d2ad68','#997739','#5a4217','#231906'],crystal:['#e3fbff','#80cbea','#388bc1','#1b4c78','#071d33'],
 clay:['#f4b99c','#bd6d58','#874031','#4c1f17','#1f0905'],parch:['#f8eed8','#d6c29a','#a18b63','#635236','#292113'],
 dark:['#a9a5b1','#6a6672','#45414d','#25222b','#0d0b11'],green:['#c9f19f','#69aa46','#3a772b','#1d4215','#0a1906'],
 white:['#ffffff','#e0e2e8','#a5a9b6','#666a78','#282a33'],cloth:['#e8a490','#a6443a','#6b2422','#3a1012','#170406'],
 flesh:['#f6d2b8','#cf9a7c','#946250','#57362a','#231410'],ink:['#5a4c40','#2c231c','#1a140f','#0e0a07','#060403']};
var KQA_INK='#0b0705';
// every canvas the painter uses is a small CPU canvas (willReadFrequently): on a GPU canvas each read-back (getImageData,
// toDataURL, canvas-to-canvas copies) waits for the GPU — ~200 ms a painting on a busy software-GL machine instead of ~1 ms
function kqaCv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h==null?w:h;c.getContext('2d',{willReadFrequently:true});return c}
// pull every palette a little toward grey: weathered, not candy-bright
(function(){const ds=(h,k)=>{const n=parseInt(h.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,l=.3*r+.59*g+.11*b,m=v=>Math.round(v+(l-v)*k);
  return '#'+((1<<24)|(m(r)<<16)|(m(g)<<8)|m(b)).toString(16).slice(1)};for(const k in KQAP)KQAP[k]=KQAP[k].map(h=>ds(h,.12))})();
function kqaTone(p,tint){
  if(p=='ink')return [KQA_INK,KQA_INK,KQA_INK,KQA_INK,KQA_INK];
  if(p[0]=='#'||p.slice(0,3)=='rgb')return null;
  const k=p.split('.'),m=k[0]=='t'?(tint||'parch'):k[0];return KQAP[m]||KQAP[tint]||KQAP.parch}
function kqaCol(p,tint){ // one CSS colour for a paint
  if(p=='ink')return KQA_INK;if(p[0]=='#'||p.slice(0,3)=='rgb')return p;
  const P=kqaTone(p,tint),t=p.split('.')[1];return P['hlmdp'.indexOf(t||'m')]||P[2]}
function kqaPath(key,d){let p=KQA_P2[key];if(!p)p=KQA_P2[key]=new Path2D(d);return p}
function kqaXf(g,M){if(!M)return;const L=typeof M[0]=='number'?[M]:M;for(const m of L)g.transform(m[0],m[1],m[2],m[3],m[4],m[5])}
var KQA_BXC=null;
// bounding box of a layer in 64-unit space (rasterised once)
function kqaBox(key,p,M,w){let b=KQA_BB[key];if(b)return b;
  const c=KQA_BXC||(KQA_BXC=kqaCv(80)),g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,80,80);g.translate(8,8);kqaXf(g,M);
  if(w){g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.stroke(p)}else g.fill(p);
  const D=g.getImageData(0,0,80,80).data;let x0=80,y0=80,x1=-1,y1=-1;
  for(let y=0;y<80;y++)for(let x=0;x<80;x++)if(D[(y*80+x)*4+3]>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<0)b=[0,0,64,64];else b=[x0-8,y0-8,x1-x0+1,y1-y0+1];return KQA_BB[key]=b}
var KQA_NOISE=null;
function kqaNoise(){if(KQA_NOISE)return KQA_NOISE;const c=kqaCv(64),g=c.getContext('2d'),im=g.createImageData(64,64);
  let s=1234567;const r=()=>(s=(s*16807)%2147483647)/2147483647;
  for(let i=0;i<64*64;i++){const v=r()<.5?0:255,a=Math.floor(r()*r()*150);im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v;im.data[i*4+3]=a}
  g.putImageData(im,0,0);return KQA_NOISE=c}
// paint the layers of one icon into g (already scaled to 64 units); glow halos go into h
function kqaPaint(g,h,n,tint){
  const A=KQA[n];if(!A)return;
  if(A.M){kqaXf(g,A.M);if(h)kqaXf(h,A.M)}
  for(let i=0;i<A.length;i++){const L=A[i],key=n+'#'+i;let op=typeof L[0]=='string'&&L[0].length<=2&&!/^[Mm]/.test(L[0])?L[0]:'f';
    let d,w=0,paint,mode='',M;
    if(op=='f'){d=L[0];paint=L[1];mode=L[2]||'';M=L[3]}
    else if(op=='s'||op=='is'){d=L[1];w=L[2];paint=L[3];mode=L[4]||'';M=L[5]}
    else if(op=='i'){d=L[1];paint=L[2];mode=L[3]||'';M=L[4]}
    else if(op=='x'){d=L[1];M=L[2]}else if(op=='xs'){d=L[1];w=L[2];M=L[3]}
    const p=kqaPath(key,d);
    g.save();kqaXf(g,M);
    const stroke=op=='s'||op=='is'||op=='xs';
    const draw=st=>{if(stroke){g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.strokeStyle=st;g.stroke(p)}else{g.fillStyle=st;g.fill(p)}};
    if(op=='x'||op=='xs'){g.globalCompositeOperation='destination-out';draw('#000');g.restore();continue}
    if(op=='i'||op=='is')g.globalCompositeOperation='source-atop';
    if(mode.includes('a'))g.globalAlpha=.55;
    const P=paint&&kqaTone(paint,tint),tone=paint&&paint.split('.')[1],shaded=P&&!tone&&!mode.includes('f')&&paint!='ink';
    if(!shaded){draw(kqaCol(paint,tint))}
    else{
      const b=kqaBox(key,p,null,w),[x,y,bw,bh]=b;
      const lg=g.createLinearGradient(x+bw*.3,y,x+bw*.7,y+bh);
      if(mode.includes('v')){lg.addColorStop(0,P[1]);lg.addColorStop(1,P[3])}
      else{lg.addColorStop(0,P[1]);lg.addColorStop(.5,P[2]);lg.addColorStop(1,P[3])}
      draw(lg);
      if(!stroke){
        g.save();g.clip(p);const R=Math.max(bw,bh);
        const rnd=mode.includes('r'),cx=x+bw*(rnd?.34:.3),cy=y+bh*(rnd?.3:.22);
        const rg=g.createRadialGradient(cx,cy,0,cx,cy,R*(rnd?.62:.7));
        rg.addColorStop(0,P[0]+(rnd?'b0':'48'));rg.addColorStop(rnd?.35:.5,P[1]+(rnd?'38':'12'));rg.addColorStop(1,P[1]+'00');
        g.fillStyle=rg;g.fillRect(x-2,y-2,bw+4,bh+4);
        const ao=g.createLinearGradient(0,y+bh*.5,0,y+bh);ao.addColorStop(0,P[4]+'00');ao.addColorStop(1,P[4]+'70');g.fillStyle=ao;g.fillRect(x-2,y+bh*.5,bw+4,bh*.5+2);
        if(!mode.includes('n')){const met=mode.includes('m'),dd=met?1.1:.9;
          g.lineJoin='round';g.lineWidth=dd*2;
          g.save();g.translate(dd,dd*1.15);g.strokeStyle=P[0]+(met?'e0':'80');g.stroke(p);g.restore();
          g.save();g.translate(-dd,-dd*1.15);g.strokeStyle=P[4]+(met?'b0':'90');g.stroke(p);g.restore()}
        g.restore()}}
    if(mode.includes('g')&&h){h.save();kqaXf(h,M);const c=P?P[1]:kqaCol(paint,tint);h.shadowColor=c;h.shadowBlur=9;h.globalAlpha=.9;
      if(stroke){h.lineWidth=w;h.lineCap='round';h.strokeStyle=c;h.stroke(p)}else{h.fillStyle=c;h.fill(p)}h.restore()}
    g.restore()}
}
// a finished icon: shadow, ink outline, glow, the painting, a little grain (s px square, cached)
function kqArtBmp(n,tint,s){
  s=Math.max(8,Math.min(256,Math.round(s)));const key=n+'|'+tint+'|'+s;let c=KQA_C[key];if(c)return c;
  const t0=performance.now(),mk=()=>kqaCv(s);
  const k=s/64,pad=0;
  const a=mk(),ga=a.getContext('2d');ga.setTransform(k,0,0,k,0,0);
  const hc=mk(),gh=hc.getContext('2d');gh.setTransform(k,0,0,k,0,0);
  kqaPaint(ga,gh,n,tint);
  if(s>=28){ga.setTransform(1,0,0,1,0,0);ga.globalCompositeOperation='source-atop';ga.globalAlpha=s>=48?.2:.12;
    const pat=ga.createPattern(kqaNoise(),'repeat');ga.fillStyle=pat;ga.fillRect(0,0,s,s);ga.globalAlpha=1;ga.globalCompositeOperation='source-over'}
  const sh=mk(),gs=sh.getContext('2d');gs.drawImage(a,0,0);gs.globalCompositeOperation='source-in';gs.fillStyle=KQA_INK;gs.fillRect(0,0,s,s);
  c=mk();const g=c.getContext('2d'),o=Math.max(.8,s*.024);
  g.globalAlpha=.5;g.drawImage(sh,o*.4,o*1.9);g.globalAlpha=1;
  for(let i=0;i<8;i++){const an=i*Math.PI/4;g.drawImage(sh,Math.cos(an)*o,Math.sin(an)*o)}
  g.globalCompositeOperation='lighter';g.globalAlpha=.75;g.drawImage(hc,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
  g.drawImage(a,0,0);
  KQAS.n++;KQAS.ms+=performance.now()-t0;
  return KQA_C[key]=c}
function kqArtUrl(n,tint){const key=n+'|'+tint;let u=KQA_U[key];if(u)return u;
  try{u=kqArtBmp(n,tint,96).toDataURL('image/png')}catch(e){u=''}return KQA_U[key]=u}
// geometry helpers for the art files (64-unit space)
var KQG=(function(){const f=v=>+(+v).toFixed(2);
  const C=(x,y,r)=>`M${f(x-r)} ${f(y)}a${r} ${r} 0 1 0 ${f(2*r)} 0a${r} ${r} 0 1 0 ${f(-2*r)} 0Z`,
   E=(x,y,a,b)=>`M${f(x-a)} ${f(y)}a${a} ${b} 0 1 0 ${f(2*a)} 0a${a} ${b} 0 1 0 ${f(-2*a)} 0Z`,
   R=(x,y,w,h,r)=>r?`M${f(x+r)} ${f(y)}h${f(w-2*r)}a${r} ${r} 0 0 1 ${r} ${r}v${f(h-2*r)}a${r} ${r} 0 0 1 ${-r} ${r}h${f(-(w-2*r))}a${r} ${r} 0 0 1 ${-r} ${-r}v${f(-(h-2*r))}a${r} ${r} 0 0 1 ${r} ${-r}Z`:`M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`,
   ST=(cx,cy,ro,ri,n,a0=-90)=>{let s='';for(let i=0;i<2*n;i++){const a=(a0+i*180/n)*Math.PI/180,r=i%2?ri:ro;s+=(i?'L':'M')+f(cx+r*Math.cos(a))+' '+f(cy+r*Math.sin(a))}return s+'Z'},
   P=(...pts)=>'M'+pts.map(p=>f(p[0])+' '+f(p[1])).join('L')+'Z',
   RT=(deg,cx=32,cy=32)=>{const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [c,s,-s,c,cx-cx*c+cy*s,cy-cx*s-cy*c].map(v=>+v.toFixed(4))},
   SC=(kx,ky=kx,cx=32,cy=32)=>[kx,0,0,ky,cx-cx*kx,cy-cy*ky],TR=(x,y)=>[1,0,0,1,x,y],MX=[-1,0,0,1,64,0],
   // a seeded wobble: a jagged polygon around a centre (rocks, crystals, splashes)
   JAG=(cx,cy,r,n,j,seed=1,ry)=>{let s=seed*9301+49297;const rn=()=>(s=(s*9301+49297)%233280)/233280;const pts=[];
     for(let i=0;i<n;i++){const a=i/n*Math.PI*2-Math.PI/2,k=1-j+rn()*j*2;pts.push([cx+Math.cos(a)*r*k,cy+Math.sin(a)*(ry||r)*k])}return P(...pts)};
  return {C,E,R,ST,P,RT,SC,TR,MX,JAG,f}})();
// hook: the canvas layer (0030 kqBitmap) and the DOM layer (0040 kqUse) use the paintings where one exists
// sizes go in steps (callers draw the bitmap at their own size), so text that grows or shrinks every frame reuses a few paintings
var KQA_SZ=[12,16,20,24,28,32,40,48,56,64,80,96,128,160,192,256];
{const f=kqBitmap;kqBitmap=function(n,tint,s){if(!KQA[n])return f(n,tint,s);const z=KQA_SZ.find(v=>v>=s)||256;return kqArtBmp(n,tint,z)}}
// emoji the game uses that had no icon (they showed the fallback rune)
Object.assign(KQE,{'🧍':['figure'],'📤':['crate'],'📥':['crate']});
