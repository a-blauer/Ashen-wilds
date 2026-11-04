// ================= v196: the Steward's decorations in the round town =================
// v190's decorations keep their models; their places move to the round layout (town-local, angles clockwise from north):
//  * ring A gaps (r ~17.5, between the first lots, the Trading Post and the Inn): obelisk 127°, Hero's Statue -153°, candle shrine
//    89.5°, well -108.5°, two planters 52.5° / -69.5° (two more flank the north avenue at the plaza's edge);
//  * ring B gaps (r ~27.5, between the outer lots): carts and harvest piles ±61.5°, trophies 90° (one per Sovereign), groves ±147.5°,
//    firewood -118.5°, the Elder Oak 118.5°, the Lantern Pavilion -90°, the Moonflower Gardens -32.5°, the Great Beacon 32.5°;
//    stone benches face the first ring street at ±32.5° / 180°±40°. Until the walls reach them they stand in the meadow outside.
//  * the walls: banners and ivy follow the round wall's inner face (found by rays), braziers, standards and garlands keep to the
//    south gate and its avenue, bone totems stand outside it; ravens perch along the wall tops, cats on the rim, the well and a bench.
// Co-op: all from SH.deco and fixed numbers (as v190).
function dm196A(d,r){const a=d*Math.PI/180;return [+(r*Math.sin(a)).toFixed(2),+(-r*Math.cos(a)).toFixed(2)]}
function dm196Face(d){const p=dm196A(d,1);return Math.atan2(-p[0],-p[1])} // a local +z front turned toward the fountain
DC190_SET.length=0;dc190WallClear=function(){return true};
// the inner face of the round wall at angle d (degrees) and height y: a ray out from the town
var DM196W={rc:null};
function dm196WallAt(d,y){const T=TOWNS[0],K=kdState(),G=K.wg,R=kf109().R;if(!G)return null;G.updateMatrixWorld(true);const rc=DM196W.rc||(DM196W.rc=new THREE.Raycaster()),a=d*Math.PI/180,dir=new THREE.Vector3(Math.sin(a),0,-Math.cos(a));
  rc.set(new THREE.Vector3(T.cx+dir.x*(R-6),T.ph+y,T.cy+dir.z*(R-6)),dir);rc.far=9;const h=rc.intersectObject(G,true)[0];return h?Math.hypot(h.point.x-T.cx,h.point.z-T.cy):null}
function dm196WallTopP(d){const R=kf109().R,W=typeof dcWall104=='function'?dcWall104():null;if(!W)return null;let best=null;for(const o of [0,.25,-.25])for(const e of [0,.35,-.35,.7,-.7]){const [a,b]=dm196A(d+e/R*57.3,R+o),t=W.top(a,b);if(t!=null&&(!best||t>best[2]))best=[a,b,t]}return best}
function dm196WallTop(d){const R=kf109().R;let best=null;const W=typeof dcWall104=='function'?dcWall104():null;if(!W)return null;for(const o of [0,.25,-.25])for(const e of [0,.35,-.35,.7,-.7]){const [a,b]=dm196A(d+e/R*57.3,R+o),t=W.top(a,b);if(t!=null&&(best==null||t>best))best=t}return best} // palisade logs have gaps: sample along the wall too
// the wall ring must be the current stage's before anything is placed along it (a stage change can rebuild the decorations first)
function dm196WallsNow(){try{const K=kdState(),T=TOWNS[0],lv=kdLv('walls');if(!K.wg||K.wst!==kf109().s||K.wl!==lv)K.wlamps=kdWalls(T,lv)||[]}catch(e){console.warn('v196 walls',e)}}
// wall angles kept clear of the gates (|x| < 4.5 at the wall)
function dm196WallAngles(step,off){const R=kf109().R,L=[];for(let d=off;d<360;d+=step){const a=d*Math.PI/180;if(Math.abs(Math.sin(a))*R<4.6)continue;L.push(d)}return L}
// ---------------- spots ----------------
dc190Def('obelisk',{sp:[dm196A(127,17.4)]});
dc190Def('statue',{sp:[dm196A(-153,17.4)]});
dc190Def('planter',{sp:[dm196A(52.5,17.2),dm196A(-69.5,17.6),[5.6,-1.0],[-5.6,-1.0]],col(D){return D.sp.map(([x,z])=>[x,z,.62])}});
dc190Def('trophy',{spf:F=>{const L=[];for(let i=0;i<6;i++){const r=i<3?26.6:28.4,d=86+(i%3)*4.2;L.push(dm196A(d,r))}return L}});
dc190Def('carts',{sp:[dm196A(61.5,28.0),dm196A(-61.5,28.0)]});
dc190Def('pumpkins',{sp:[dm196A(61.5,25.4),dm196A(-61.5,25.4)]});
dc190Def('woodpile',{sp:[dm196A(-115.5,26.8),dm196A(-121.5,26.8),dm196A(-115.5,28.6),dm196A(-121.5,28.6)]});
dc190Def('brazier',{spf:F=>[[-4.9,-(F.R-3.4)],[4.9,-(F.R-3.4)]]}); // by the north gate (the way to the first portals)
dc190Def('trees',{spf:F=>[dm196A(145.5,26.6),dm196A(148.5,29.2),dm196A(142.5,29.4),dm196A(-145.5,26.6),dm196A(-148.5,29.2),dm196A(-142.5,29.4)]});
dc190Def('gatepoles',{spf:F=>[[-4.3,F.R-1.9],[4.3,F.R-1.9]]});
dc190Def('totems',{spf:F=>{const L=[];[3.2,6.6].forEach(dz=>{if(F.R+dz<DM196.RM-1.5)[-2.7,2.7].forEach(x=>L.push([x,F.R+dz]))});return L}});
dc190Def('garland',{spf:F=>[14.2,24.5,34.5].filter(z=>z<F.R-3).map(z=>[z])});
dc190Def('pavilion',{spf:F=>[dm196A(-90,27.6)]});
dc190Def('oak',{spf:F=>[dm196A(118.5,27.6)]});
dc190Def('garden',{spf:F=>[dm196A(-32.5,27.6)]});
dc190Def('beacon',{spf:F=>[dm196A(32.5,27.6)]});
{const D=DECO103.find(q=>q.k=='cats');if(D){const w=dm196A(-108.5,17.3),b=TWN100_WD.bench[0];D.sp=[[0,-2.66,.72],[2.66,.1,.72],[w[0],w[1]+.9,.88],[b[0],b[1],.52],[-2.4,1.4,.72]]}}
// stone benches along the first ring street, each facing it
{const D=DECO103.find(q=>q.k=='benches');if(D){D.sp=[[...dm196A(32.5,23.0),dm196Face(32.5)],[...dm196A(-32.5,23.0),dm196Face(-32.5)],[...dm196A(-147.5,23.2),dm196Face(-147.5)]];
  D.b=function(k,D){D.sp.forEach(([x,z,ry])=>k.at(x,0,z,()=>{dc190B(k,'c',0x77737c,1.55,.1,.46,0,.47,0,0,'ashlar',.02);
    [-1,1].forEach(s=>dc190Ext(k,'c',0x5c5862,'benchleg',[[-.2,0],[.2,0],[.16,.06],[.12,.32],[.18,.42],[-.18,.42],[-.12,.32],[-.16,.06]],.14,dt168Mx(s*.56,0,0,0,Math.PI/2,0),'ashlar',.012))},ry))};
  D.col=function(D){return D.sp.map(([x,z])=>[x,z,.7])}}}
// the shrine and the well were built at fixed places: their builders are moved whole to their new spot
function dm196Move(key,from,to,rot){const D=DECO103.find(q=>q.k==key);if(!D||!D.b||D.b.v196)return;const b0=D.b;
  D.b=function(k){const at=k.at;let dep=0;k.at=function(x,y,z,fn,ry){if(dep==0&&Math.abs(x-from[0])<.05&&Math.abs(z-from[1])<.05){dep++;try{return at.call(k,to[0],y,to[1],fn,rot)}finally{dep--}}dep++;try{return at.call(k,x,y,z,fn,ry)}finally{dep--}};
    try{return b0.apply(this,arguments)}finally{k.at=at}};D.b.v196=1;D.col=function(){return [[to[0],to[1],1.0]]}}
dm196Move('shrine',[14.6,6.4],dm196A(89.5,17.4),dm196Face(89.5));
dm196Move('well',[-17.4,2.0],dm196A(-108.5,17.3),dm196Face(-108.5));
// ---------------- along the round walls ----------------
dc190Def('banner',{b(k,D,W){dm196WallsNow();const ban=TOWNS[0].pal.ban||0x8a2a3a,C=DC190C;dm196WallAngles(30,15).forEach((d,i)=>{const t=dm196WallTop(d);if(t==null||t<1.9)return;const y=Math.min(2.7,t-.2),h=Math.min(1.25,y-.5),r=dm196WallAt(d,y-.5);if(r==null)return;
    const [x,z]=dm196A(d,r-.06);dc190Banner(k,x,y,z,dm196Face(d),i%2?ban:C.blk,.62,h,i%2?C.brass:C.bone,1)})}});
dc190Def('ivy',{b(k,D,W){dm196WallsNow();const L=[0x24402a,0x2e4a30,0x35602e,0x1e3626];dm196WallAngles(20,7).forEach((d,i)=>{const t=dm196WallTop(d);if(t==null)return;const P=[];
    for(let j=0;j<7;j++){const y=.05+j*.42;if(y>t-.35)break;const dd=d+.5*Math.sin(j*1.3+i),r=dm196WallAt(dd,y);if(r==null)continue;const [x,z]=dm196A(dd,r-.04);P.push([x,y,z])}
    if(P.length<2)return;dc190Tube(k,'c',0x3a2e20,P,P.map((_,j)=>.028-j*.003),5,'bark');const a=d*Math.PI/180,ox=-Math.sin(a),oz=Math.cos(a);
    P.forEach((p,j)=>{dc190Clump(k,L[(i+j)%4],p[0]+ox*.05,p[1]+.05,p[2]+oz*.05,.22,.24,.22,i+j,'leaf',0);if(j%2==0)dc190Clump(k,L[(i+j+1)%4],p[0]+ox*.04,p[1]-.15,p[2]+oz*.04,.18,.17,.18,i+j+3,'leaf',0)})})}});
// pennant strings between poles at the plaza's edge, in the gaps between the first lots' doors
dc190Def('bunting',{b(k){const C=DC190C,PI2=Math.PI;[[52.5,90],[90,127],[-69.5,-108.5],[-108.5,-150]].forEach(([d0,d1],j)=>{const a=dm196A(d0,10.6),b=dm196A(d1,10.6),y=3.7;[a,b].forEach(([x,z])=>{dc190Rod(k,'c',C.woodD,[x,0,z],[x,3.85,z],.06,'wood',8,.8);dc190L(k,'m',C.iron,[[0,0],[.06,0],[.05,.06],[0,.12]],8,x,3.82,z,0,1,'iron')});
    const Y=t=>y-.22*Math.sin(t*PI2),P=[];for(let i=0;i<=8;i++)P.push([a[0]+(b[0]-a[0])*i/8,Y(i/8),a[1]+(b[1]-a[1])*i/8]);dc190Tube(k,'c',0x2a2420,P,.011,4,'plain');
    const ry=Math.atan2(-(b[1]-a[1]),b[0]-a[0]);for(let i=0;i<9;i++){const t=(i+.5)/9;dc190Ext(k,'c',[C.crim,C.blk,0xb8ac90,0x5a1820][(i+j)%4],'pen',[[-.15,0],[.15,0],[0,-.36]],.02,dt168Mx(a[0]+(b[0]-a[0])*t,Y(t)-.01,a[1]+(b[1]-a[1])*t,.08*Math.sin(i*2.1),ry,0),'cloth')}})},
  col(){const o=[];[52.5,90,127,-69.5,-108.5,-150].forEach(d=>{const [x,z]=dm196A(d,10.6);o.push([x,z,.1])});return o}});
// flower baskets on the lantern posts along the walls (the arm points toward the plaza)
dc190Def('baskets',{b(k){const C=DC190C,R=kf109().R;(typeof TWN100_LP!='undefined'?TWN100_LP:[]).filter(([x,z])=>Math.hypot(x,z)>=R-3).forEach(([x,z],i)=>{if(i%2)return;const a=Math.atan2(z,-x),ux=Math.cos(a),uz=-Math.sin(a),bx=x+ux*.27,bz=z+uz*.27;
    dc190Rod(k,'m',C.iron,[x+ux*.05,1.86,z+uz*.05],[bx,1.86,bz],.012,'iron',4);for(let j=0;j<3;j++){const q=j/3*6.283;dc190Rod(k,'m',C.iron,[bx,1.86,bz],[bx+Math.cos(q)*.15,1.5,bz+Math.sin(q)*.15],.004,'iron',3)}
    dc190L(k,'c',0x6a4e2e,[[0,0],[.08,0],[.17,.08],[.2,.17],[.18,.18],[.13,.06],[0,.05]],10,bx,1.33,bz,0,1,'straw');
    for(let j=0;j<5;j++){const q=j*1.26+i;dc190Clump(k,[0x2a4430,0x324e36][j%2],bx+Math.cos(q)*.1,1.52,bz+Math.sin(q)*.1,.1,.08,.1,i+j);dc190P(k,'c',[0xe8e0f0,0x8a5ac0,0x7a2a3a][(i+j)%3],dc190Ball(),dt168Mx(bx+Math.cos(q)*.13,1.58,bz+Math.sin(q)*.13,0,0,0,.04,.03,.04),'cloth')}})}});
// ravens along the wall tops, each looking into the town
{const D=DECO103.find(q=>q.k=='ravens');if(D&&D.an){const a0=D.an;D.an=function(g,D,W){const R=kf109().R,ang=dm196WallAngles(51,23).slice(0,Math.max(3,(D.sp||[]).length));
  const sp0=D.sp;D.sp=ang.map(d=>{const [x,z]=dm196A(d,R);return [x,z,0]});const W2=Object.assign({},W,{F:Object.assign({},W.F,{SZ:0}),top:(x,z)=>W.top(x,z)});
  let f=null;try{f=a0.call(this,g,D,W2)}finally{}try{g.children.forEach((r,i)=>{const d=ang[i];if(d==null||!r.isGroup)return;const P=dm196WallTopP(d);if(!P){r.visible=false;return}r.position.set(P[0],P[2]+.12,P[1]);r.userData.y0=r.position.y;r.rotation.y=dm196Face(d)})}catch(_){}
  D.sp=sp0;return f}}}
// the decorations standing now were placed by the old spots: build them again
try{if(typeof DC103!='undefined'&&DC103.g)Object.keys(DC103.g).forEach(k=>dcDrop104(k));dc103Sync()}catch(e){console.warn('v196 deco',e)}
