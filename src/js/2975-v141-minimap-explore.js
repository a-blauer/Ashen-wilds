// ================= v141: minimap and N map are revealed as you explore; found gathering spots; facing arrow =================
// Fog: the zone instances start dark; everything within MF141.R tiles of the hero is revealed, in cells of MF141.C tiles.
// Duskhold and the void between instances are never fogged. The fog is a canvas (mmFog, world size, 1 px per tile) that is
// drawn right after the terrain image (mmB) on both maps, so enemies and markers drawn later still sit on top where revealed.
// Saved per hero as x2.fog141 (run-length coded cells). Gathering spots (trees, rocks, ore, crystal, plants, bones, mounds)
// show as small dots once their cell is revealed; a spot that is used up hides until it grows back.
var MF141={C:4,R:10,cw:0,ch:0,cells:null,fog:null,fx:null,dirty:false,nodes:{},last:-1};
function mf141Init(){if(MF141.cells)return;MF141.cw=Math.ceil(W/MF141.C);MF141.ch=Math.ceil(H/MF141.C);MF141.cells=new Uint8Array(MF141.cw*MF141.ch);
  const c=document.createElement('canvas');c.width=W;c.height=H;MF141.fog=c;MF141.fx=c.getContext('2d');mf141Paint()}
// which cells can be fogged at all: those inside a zone instance
function mf141Zone(cx,cy){const x=cx*MF141.C+MF141.C/2,y=cy*MF141.C+MF141.C/2;if(typeof INSL=='undefined')return false;
  for(const I of INSL){if(x>=I.x0&&x<I.x0+I.w&&y>=I.y0&&y<I.y0+I.h)return true}return false}
function mf141Paint(){const g=MF141.fx,C=MF141.C;g.clearRect(0,0,W,H);g.fillStyle='rgb(9,11,15)';
  if(typeof INSL!='undefined')INSL.forEach(I=>g.fillRect(I.x0,I.y0,I.w,I.h));
  for(let cy=0;cy<MF141.ch;cy++)for(let cx=0;cx<MF141.cw;cx++)if(MF141.cells[cy*MF141.cw+cx])g.clearRect(cx*C,cy*C,C,C)}
function mf141Seen(x,y){if(!MF141.cells)return true;const cx=Math.floor(x/MF141.C),cy=Math.floor(y/MF141.C);if(cx<0||cy<0||cx>=MF141.cw||cy>=MF141.ch)return true;
  return !!MF141.cells[cy*MF141.cw+cx]||!mf141Zone(cx,cy)}
// reveal around the hero (called with the minimap, every 200 ms)
function mf141Reveal(){mf141Init();if(typeof curMap=='function'&&curMap()<0)return;const C=MF141.C,R=MF141.R,px=pl.position.x,pz=pl.position.z;
  const c0x=Math.floor((px-R)/C),c1x=Math.floor((px+R)/C),c0y=Math.floor((pz-R)/C),c1y=Math.floor((pz+R)/C);let n=0;
  for(let cy=Math.max(0,c0y);cy<=Math.min(MF141.ch-1,c1y);cy++)for(let cx=Math.max(0,c0x);cx<=Math.min(MF141.cw-1,c1x);cx++){const i=cy*MF141.cw+cx;if(MF141.cells[i])continue;
    const dx=Math.max(0,Math.abs(cx*C+C/2-px)-C/2),dy=Math.max(0,Math.abs(cy*C+C/2-pz)-C/2);if(dx*dx+dy*dy>R*R)continue;MF141.cells[i]=1;MF141.fx.clearRect(cx*C,cy*C,C,C);n++}
  if(n)MF141.dirty=true}
// draw the fog right after the terrain image on a map context
function mf141Hook(g){if(!g||g.__mf141)return;const d=g.drawImage;g.__mf141=1;g.drawImage=function(img){const r=d.apply(this,arguments);
  if(img===mmB&&MF141.fog&&arguments.length===9){const a=[...arguments];a[0]=MF141.fog;const sm=this.imageSmoothingEnabled;this.imageSmoothingEnabled=false;d.apply(this,a);this.imageSmoothingEnabled=sm}return r}}
{const f=mini;mini=function(){try{mf141Reveal();mf141Hook(mmX)}catch(e){}return f.apply(this,arguments)}}
{const f=openWMap;openWMap=function(){const hid=[];try{mf141Init();mf141Reveal();mf141Hook($('wmc').getContext('2d'));
  // camps not seen yet stay hidden: their instance id is swapped out while the map draws, then put back
  if(typeof CAMPS!='undefined')CAMPS.forEach(C=>{if(!mf141Seen(C.x,C.z)){hid.push([C,C.ig]);C.ig=-99}})}catch(e){}let r;try{r=f.apply(this,arguments)}finally{hid.forEach(([C,g])=>C.ig=g)}try{mf141WmapNodes()}catch(e){console.warn('fog wmap',e)}return r}}

// ---------------- gathering spots ----------------
var MF141_COL={tree:'#5fbf5a',stone:'#b8b4ac',iron:'#d9824a',crystal:'#7fe3ff',fiber:'#b6d36a',berry:'#c870e0',flower:'#f39ad0',mush:'#a8f0a0',bones:'#efe8d8',mound:'#a77a4c'};
var MF141_LAB={tree:'tree',stone:'stone',iron:'iron ore',crystal:'crystal',fiber:'fiber',berry:'berries',flower:'petals',mush:'glow caps',bones:'bones',mound:'soil mound'};
function mf141Kind(x,y){const t=MAP[y][x],k=y*W+x,pk=PROPK[k];if(!NODE[k])return null;
  if(t=='#')return 'tree';if(t=='r'&&(pk=='rock'||pk=='grave'||pk=='pillar'))return 'rock';
  return ['crystal','bush','flower','mush','bones','mound'].includes(pk)?pk:null}
// every gathering spot of an instance (cached; the tile under a used-up spot turns to '.', so the scan runs once per instance)
function mf141Nodes(I){if(!I)return [];if(MF141.nodes[I.g])return MF141.nodes[I.g];const L=[];
  for(let y=Math.max(2,I.y0);y<Math.min(H-2,I.y0+I.h);y++)for(let x=Math.max(2,I.x0);x<Math.min(W-2,I.x0+I.w);x++){const kind=mf141Kind(x,y);if(!kind)continue;
    let v=kind;try{v=typeof lnV=='function'?lnV({kind,x,y}):kind}catch(_){}L.push({x,y,k:y*W+x,v})}
  return MF141.nodes[I.g]=L}
function mf141Here(){if(typeof curMap!='function'||curMap()<0)return null;return curIns()}
function mf141Dot(g,x,y,col,s){g.fillStyle='rgba(0,0,0,.7)';g.fillRect(x-s/2-1,y-s/2-1,s+2,s+2);g.fillStyle=col;g.fillRect(x-s/2,y-s/2,s,s)}
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){try{const I=mf141Here();if(I){const kx=w/vw,ky=h/vh;
  mf141Nodes(I).forEach(n=>{if(gdep[n.k])return;const x=(n.x-(cx-vw/2)+.5)*kx,y=(n.y-(cy-vh/2)+.5)*ky;if(x<-3||y<-3||x>w+3||y>h+3)return;if(!mf141Seen(n.x,n.y))return;
    mf141Dot(mmX,x,y,MF141_COL[n.v]||'#ddd',n.v=='tree'?2:3)})}}catch(e){}return f.apply(this,arguments)}}
function mf141WmapNodes(){const I=mf141Here();if(!I)return;const c=$('wmc'),g=c.getContext('2d'),s=Math.min(1060/I.w,640/I.h),seen={};
  mf141Nodes(I).forEach(n=>{if(gdep[n.k]||!mf141Seen(n.x,n.y))return;seen[n.v]=1;mf141Dot(g,(n.x-I.x0+.5)*s,(n.y-I.y0+.5)*s,MF141_COL[n.v]||'#ddd',n.v=='tree'?3:5)});
  // legend of the kinds found here, top right under the title bar
  const ks=Object.keys(seen);if(!ks.length)return;g.font='600 11px system-ui,sans-serif';g.textAlign='left';g.textBaseline='middle';
  const wd=ks.reduce((a,k)=>a+g.measureText(MF141_LAB[k]||k).width+20,8);let x=c.width-wd-8;const y=54;
  g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x-4,y-10,wd+4,20);ks.forEach(k=>{mf141Dot(g,x+5,y,MF141_COL[k]||'#ddd',6);g.fillStyle='#ddd';g.fillText(MF141_LAB[k]||k,x+12,y);x+=g.measureText(MF141_LAB[k]||k).width+20})}

// ---------------- facing: a bigger arrow on the minimap and on the N map ----------------
function mf141Face(){try{return typeof plFaceY=='function'?plFaceY():pl.rotation.y}catch(_){return pl.rotation.y}}
miniArrow=function(qx,qy){const a=mf141Face(),fx=Math.sin(a),fz=Math.cos(a),ca=camYaw,vx=-Math.sin(ca),vz=-Math.cos(ca);
  mmX.save();mmX.fillStyle='rgba(255,255,255,.13)';mmX.beginPath();mmX.moveTo(qx,qy);const sp=.55,base=Math.atan2(vz,vx);mmX.arc(qx,qy,30,base-sp,base+sp);mmX.closePath();mmX.fill();
  mmX.translate(qx,qy);mmX.rotate(Math.atan2(fz,fx));mmX.lineJoin='round';
  mmX.beginPath();mmX.moveTo(11,0);mmX.lineTo(-6,-7);mmX.lineTo(-2.5,0);mmX.lineTo(-6,7);mmX.closePath();mmX.lineWidth=3;mmX.strokeStyle='#08110b';mmX.stroke();mmX.lineWidth=1.4;mmX.strokeStyle='#f4fff6';mmX.stroke();mmX.fillStyle='#4ade80';mmX.fill();mmX.restore()};
{const f=openWMap;openWMap=function(){const r=f.apply(this,arguments);try{const I=mf141Here(),c=$('wmc'),g=c.getContext('2d');let x0,y0,s;
  if(I){x0=I.x0;y0=I.y0;s=Math.min(1060/I.w,640/I.h)}else{const T=TOWNS[0];x0=T.cx-60;y0=T.cy-30;const w=120,h=TWN100_PG[TWN100_PG.length-1].y+16-y0;s=Math.min(1060/w,640/h)}
  const x=(pl.position.x-x0+.5)*s,y=(pl.position.z-y0+.5)*s,a=mf141Face();g.save();g.translate(x,y);g.rotate(Math.atan2(Math.cos(a),Math.sin(a)));
  g.beginPath();g.moveTo(17,0);g.lineTo(5,-7);g.lineTo(5,7);g.closePath();g.fillStyle='#4ade80';g.fill();g.lineWidth=1.5;g.strokeStyle='#000';g.stroke();g.restore()}catch(e){}return r}}

// ---------------- save / load ----------------
function mf141Enc(){const a=MF141.cells;if(!a)return null;const out=[];let v=0,n=0;for(let i=0;i<a.length;i++){if(a[i]===v)n++;else{out.push(n.toString(36));v=a[i];n=1}}out.push(n.toString(36));return out.join('.')}
function mf141Dec(s){mf141Init();MF141.cells.fill(0);if(!s)return mf141Paint();let i=0,v=0;String(s).split('.').forEach(t=>{const n=parseInt(t,36)||0;if(v)MF141.cells.fill(1,i,Math.min(MF141.cells.length,i+n));i+=n;v^=1});mf141Paint()}
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{if(MF141.cells)o.fog141={c:MF141.C,w:MF141.cw,h:MF141.ch,r:mf141Enc()}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const F=s&&s.fog141;mf141Init();if(F&&F.c==MF141.C&&F.w==MF141.cw&&F.h==MF141.ch)mf141Dec(F.r);else mf141Dec(null);MF141.nodes={}}catch(e){console.warn('fog load',e)}return r}}
// (the game saves every 30 s, on hide and on leaving the page, so revealed cells are kept without anything extra here)
