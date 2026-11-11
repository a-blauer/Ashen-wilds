// ================= v219: The Dirge I — the angel at the start, graves on the map, digging that holds (owner, Nov 10 2026) =================
// Owner: "In the dirge 1, have the weeping angel at the beginning so you can get the spade and search tombs while you explore instead
// of backtracking. Make graves both undug and dug marked on the map. When digging up a grave in the dirge- your players gets shifted
// away from the grave if youre slightly on top of it and it cancels the digging. Enemies also spawn on top of the open hole and its
// hard to reach them and they get stuck. Also the grave and grave elements shrink while digging"
//  * The weeping angel (3312, the 'sanctum' gateway record) stands beside the road a little way in from the entrance (DG218.at of the
//    road, DG218.side off it, facing it) instead of at the road's end: read it on the way in, take the spade, and every grave along
//    the road can be dug as you pass. Its other prompt (travel on to II once the Sanctum is done) is unchanged; the Keeper's stair
//    still leads down too.
//  * The map: every grave of the quest is drawn on the minimap and the world map (M) from the start: a pale cross for one not dug
//    yet (brighter once read), a dark open pit for one dug and found empty, the green stair for the Keeper's once it is open.
//  * Digging: the dig prompt's spot (1.3 from the grave's middle) lay on the grave's own blocked tiles, so the hero was pushed off it
//    and the dig stopped (it stops if you move more than .6). F now steps the hero to the foot of the grave, just clear of its tiles,
//    facing it, and only a real step away (DG218.leave) stops the dig. The grave no longer squashes down while you dig (the spade's
//    dirt flies as before).
//  * The dead of a wrong grave climb out onto open ground beside it (the nearest free spots 2.6–4 from the grave, never on its
//    blocked tiles), so they can be reached and do not stick in the pit.
// Co-op: the angel's spot is computed the same on every screen; a dig and its risen dead go through 3312's own messages as before.
var DG218={on:true,at:12,side:5.5,foot:2.65,leave:1.4,risen:null,err:0};
// ---------- the angel near the start ----------
function dg218AngelSpot(){const I=INSL[20],P=I.path,N=P.length,props=new Set();try{MAP.props.forEach(q=>props.add(q[1]*W+q[0]))}catch(_){}
  const free=(x,z)=>{const X=Math.round(x),Z=Math.round(z),t=MAP[Z]&&MAP[Z][X];if(!t||t=='#'||t=='r'||t=='~'||t=='R'||props.has(Z*W+X)||solid(X,Z))return false;const J=insAt(X,Z);return !!J&&J.g===20&&MAP.DW[Z*W+X]<-.8};
  const G=dg165GravePlan().G,far=(x,z)=>G.every(o=>Math.hypot(x-o.x,z-o.z)>6)&&Math.hypot(x-I.en[0],z-I.en[1])>6;
  let i0=0;for(let i=0;i<N;i++)if(Math.hypot(P[i][0]-I.en[0],P[i][1]-I.en[1])>=DG218.at){i0=i;break}
  for(const di of [0,4,8,-3,12,16,20])for(const sd of [1,-1])for(const b of [DG218.side,DG218.side+1.5,DG218.side-1,DG218.side+3]){const k=Math.max(2,Math.min(N-3,i0+di)),q=P[k],a=P[k-2],c=P[k+2];
    let tx=c[0]-a[0],tz=c[1]-a[1];const L=Math.hypot(tx,tz)||1;tx/=L;tz/=L;const x=q[0]-tz*b*sd,z=q[1]+tx*b*sd;
    if(!free(x,z)||!far(x,z))continue;let ok=true;for(const [ox,oz] of [[1.4,0],[-1.4,0],[0,1.4],[0,-1.4],[1,1],[-1,-1],[1,-1],[-1,1]])if(!free(x+ox,z+oz)){ok=false;break}if(!ok)continue;
    const ux=(x-q[0])/b,uz=(z-q[1])/b;return {x,z,ry:Math.atan2(-ux,-uz),ux,uz,v219:1}}
  return null}
try{const Gt=SP152.gates.sanctum;if(Gt&&DG218.on){const w0=Gt.where;Gt.where=function(){let s=null;try{s=dg218AngelSpot()}catch(e){console.warn('v219 angel spot',e)}return s||(w0?w0.apply(this,arguments):sp152GateSpot(Gt.ig))}}}catch(e){console.warn('v219 angel',e)}
// the tracker's first step says where it is now
{const f=SP152.trk.dirgeI;if(f)SP152.trk.dirgeI=function(I){const r=f.apply(this,arguments);try{if(r&&r.lines&&DG165Q.g.st<1&&r.lines[0]&&r.lines[0][0]==='Follow the road to its end')r.lines[0]=['The weeping angel by the road, near the entrance']}catch(_){}return r}}
// ---------- digging that holds ----------
function dg218Foot(o){return [o.x+Math.sin(o.ry)*DG218.foot,o.z+Math.cos(o.ry)*DG218.foot]}
{const f=dg165DigStart;dg165DigStart=function(G){f.apply(this,arguments);try{const D=DG165GR.dig;if(DG218.on&&D&&D.G===G){const o=G.o,[x,z]=dg218Foot(o);
    if(!solid(Math.round(x),Math.round(z))){pl.position.x=x;pl.position.z=z;pl.position.y=GH(x,z);pl.rotation.y=Math.atan2(o.x-x,o.z-z)}D.x=pl.position.x;D.z=pl.position.z}}catch(e){if(!DG218.err++)console.warn('v219 dig start',e)}}}
{const f=dg165DigTick;dg165DigTick=function(dt,now){const D=DG165GR.dig;if(DG218.on&&D){const P=pl.position,d=Math.hypot(P.x-D.x,P.z-D.z);
    // a nudge from the ground or a partner is no reason to stop: only a real step away is
    if(d>.55&&d<DG218.leave){D.x=P.x;D.z=P.z}}
  const r=f.apply(this,arguments);try{if(D&&D.G&&D.G.body)D.G.body.children.forEach(m=>{m.scale.y=1})}catch(_){}return r}}
// ---------- the risen climb out beside the grave ----------
{const f=dg165DigDone;dg165DigDone=function(G,mine){if(DG218.on&&G&&G.o&&G.o.i!==DG165G.K)DG218.risen={o:G.o,t:performance.now(),n:0};return f.apply(this,arguments)}}
function dg218Out(o,k){const ca=Math.cos(o.ry),sa=Math.sin(o.ry),C=[];for(const r of [2.7,3.2,3.8])for(let a=0;a<12;a++){const q=a/12*Math.PI*2+k*.9,x=o.x+Math.sin(q)*r*1.15,z=o.z+Math.cos(q)*r;
    if(solid(Math.round(x),Math.round(z))||solid(Math.round(x+.4),Math.round(z))||solid(Math.round(x),Math.round(z+.4)))continue;
    // not on the grave's own footprint (in the grave's frame: across lx, along lz)
    const dx=x-o.x,dz=z-o.z,lx=ca*dx-sa*dz,lz=sa*dx+ca*dz;if(Math.abs(lx)<1.7&&lz>-2.2&&lz<2.6)continue;C.push([x,z])}
  return C.length?C[0]:null}
{const f=spawnEnemy;spawnEnemy=function(k,x,z,lv,o){const R=DG218.risen;if(DG218.on&&R&&o&&o.minion&&(k==='ghoul'||k==='skeleton')&&performance.now()-R.t<4000&&Math.hypot(x-R.o.x,z-R.o.z)<2.5){
    const q=dg218Out(R.o,R.n++);if(q){x=q[0];z=q[1];try{burst(gY(new THREE.Vector3(R.o.x,0,R.o.z),.4),0x3a3026,12,1.6,2.2,.6)}catch(_){}}}
  return f.call(this,k,x,z,lv,o)}}
// ---------- every grave on the minimap and the world map ----------
function dg218Mark(g,X,Y,k,st){g.save();g.translate(X,Y);g.scale(k,k);
  if(st==='keep'){g.fillStyle='#0e2a1a';g.fillRect(-3.6,-4.6,7.2,9.2);g.strokeStyle='#7affb0';g.lineWidth=1.4/k;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-2.6+i*.6,-2.6+i*2);g.lineTo(2.6-i*.6,-2.6+i*2);g.stroke()}}
  else if(st==='dug'){g.fillStyle='#1a120c';g.beginPath();g.ellipse(0,0,3.2,4.2,0,0,Math.PI*2);g.fill();g.strokeStyle='#8a6a4a';g.lineWidth=1.2/k;g.stroke();
    g.strokeStyle='#5a4634';g.beginPath();g.moveTo(-1.6,-1.8);g.lineTo(1.6,1.8);g.moveTo(1.6,-1.8);g.lineTo(-1.6,1.8);g.stroke()}
  else{const c=st==='read'?'#e8ece4':'#9aa09a';g.fillStyle='#141618';g.fillRect(-3.4,-4.4,6.8,8.8);g.strokeStyle=c;g.lineWidth=1.4/k;g.beginPath();g.moveTo(0,-3.4);g.lineTo(0,3.4);g.moveTo(-2.2,-1.2);g.lineTo(2.2,-1.2);g.stroke()}
  g.restore()}
function dg218St(i){const keep=i===DG165G.K;if(keep&&dg165GDone())return 'keep';if(!keep&&DG165Q.g.bad[i])return 'dug';return DG165Q.g.ex[i]?'read':'new'}
dg165GMarks=function(g,P,k){if(!dg165GIn())return;dg165GravePlan().G.forEach((o,i)=>{const q=P(o.x,o.z);if(!q)return;dg218Mark(g,q[0],q[1],k,dg218St(i))})};
{const f=openWMap;openWMap=function(){const r0=f.apply(this,arguments);try{if(DG218.on&&dg165GIn()){const I=INSL[20],c=$('wmc'),g=c.getContext('2d'),k=Math.min(1060/I.w,640/I.h),T=(x,z)=>[(x-I.x0+.5)*k,(z-I.y0+.5)*k];
    dg165GravePlan().G.forEach((o,i)=>{const [X,Y]=T(o.x,o.z);dg218Mark(g,X,Y,1.6,dg218St(i))});
    const A=SP152.gates.sanctum;if(A&&A.spot){const [X,Y]=T(A.spot.x,A.spot.z);g.font='700 12px system-ui,sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText('Weeping Angel',X,Y-12);g.fillStyle='#cfe8dc';g.fillText('Weeping Angel',X,Y-12)}}}catch(e){console.warn('v219 dirge map',e)}return r0}}
