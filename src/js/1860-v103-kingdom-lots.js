// ================= v103 kingdom (1/5): building lots — you choose where every shop, upgrade and house stands =================
// The Grand Square is divided into 31 lots (LOT103, town-local tiles; ry = facing, local +z toward the street):
//   W1..W4 / E1..E4  the old market plots down the west and east sides          (x ±29.5)
//   NW NE NM         the north row gaps (old Treasury, Scholar's Tower, Magic Shop spots)
//   CW CE            either side of the fountain (CE = the old Training Grounds)
//   SW SE            north of the South Ward, facing the plaza (old Beast Den / Hatchery)
//   A1..A4 B1..B4    the South Ward avenue (old garden), facing the avenue from the west / east
//   C1..C4 D1..D4    the South Ward's outer rows, facing the side streets
// Each lot is a 7x7-tile square; buildings face its street side and keep a door spot 4.45 tiles in front of the centre.
// SH.pos[key] = lot id, key = shop key ('smith', 'magic', …), 'u:'+upgrade key, or 'h:'+house index. Saved in x2Save.
// Old saves: anything built without a lot goes to its old spot (DEF103), or the first free lot.
// Shops (the TWN100 market kits, the Magic Shop now one of them) and the upgrade structures (KDU) are rebuilt in place
// when their lot changes; shop footprints are solid tiles ('B'), upgrade structures keep their own colliders.
// Free lots showed four wooden stakes; since v109 (1960) only open lots exist and show a dim ground outline. The plan view in the Steward's window is drawn by lotPlan103.
var LOT103=(()=>{const H=Math.PI/2,L=[];
  [-9,2,13,24].forEach((z,i)=>{L.push({id:'W'+(i+1),x:-29.5,z,ry:H,a:'West side'});L.push({id:'E'+(i+1),x:29.5,z,ry:-H,a:'East side'})});
  L.push({id:'NW',x:-6.4,z:-17.4,ry:0,a:'North row'},{id:'NE',x:6.6,z:-17.4,ry:0,a:'North row'},{id:'NM',x:14.6,z:-17,ry:0,a:'North row'});
  L.push({id:'CW',x:-7.7,z:-7.1,ry:0,a:'By the fountain'},{id:'CE',x:7.7,z:-7.1,ry:0,a:'By the fountain'});
  L.push({id:'SW',x:-13.6,z:14.6,ry:Math.PI,a:'Plaza south'},{id:'SE',x:13.6,z:14.6,ry:Math.PI,a:'Plaza south'});
  [22.5,30,37.5,45].forEach((z,i)=>{L.push({id:'A'+(i+1),x:-7,z,ry:H,a:'South Ward'},{id:'B'+(i+1),x:7,z,ry:-H,a:'South Ward'},
    {id:'C'+(i+1),x:-17,z,ry:-H,a:'South Ward'},{id:'D'+(i+1),x:17,z,ry:H,a:'South Ward'})});
  return L})();
var LOTM103={};LOT103.forEach(l=>LOTM103[l.id]=l);
var DEF103={smith:'W1',alch:'W2',cook:'W3',bard:'W4',merchant:'E1',sage:'E2',trainer:'E3',stable:'E4',magic:'NM',
  'u:train':'CE','u:tower':'NE','u:treas':'NW','u:den':'SW','u:hatch':'SE'};
var UPK103=['train','tower','treas','den','hatch']; // placeable upgrades (Bastion Walls is the wall ring itself)
var KL103={tiles:new Map(),own:{},stakes:null,ver:0};
SH.pos=SH.pos||{};
// ---------- lot geometry ----------
function lotW103(l,lx,lz){const T=TOWNS[0],fx=Math.sin(l.ry),fz=Math.cos(l.ry);return [T.cx+l.x+lx*fz+lz*fx,T.cy+l.z-lx*fx+lz*fz]}
function lotDoor103(l){return lotW103(l,0,4.45)}
// tiles of a rectangle in lot space (same rounding as the v100 plots)
function lotTiles103(l,x0,x1,z0,z1){const T=TOWNS[0],f=[Math.sin(l.ry),Math.cos(l.ry)],a=[f[1],-f[0]],S=new Set();
  for(let lx=x0;lx<=x1+1e-6;lx+=.5)for(let lz=z0;lz<=z1+1e-6;lz+=.5){const x=Math.round(T.cx+l.x+lx*a[0]+lz*f[0]),y=Math.round(T.cy+l.z+lx*a[1]+lz*f[1]);S.add(y*W+x)}return [...S]}
// ---------- who stands where ----------
function lotKey103(id){for(const k in SH.pos)if(SH.pos[k]===id)return k;return null}
function lotOf103(key){const id=SH.pos[key];return id&&LOTM103[id]||null}
function lotFree103(id){return !lotKey103(id)}
function lotBuilt103(key){if(key.startsWith('u:'))return kdLv(key.slice(2))>0;if(key.startsWith('h:'))return typeof HS103!='undefined'&&!!HS103.h[+key.slice(2)];return key=='smith'||shopBuilt(key)}
// every built thing gets a lot; anything placed but not built (a cheat reset, a deleted house) gives its lot back
function lotAuto103(){let ch=0;for(const k in SH.pos)if(!LOTM103[SH.pos[k]]||!lotBuilt103(k)){delete SH.pos[k];ch=1}
  const keys=['smith'].concat(SHOPS.map(o=>o.k),UPK103.map(k=>'u:'+k));
  keys.forEach(k=>{if(SH.pos[k]||!lotBuilt103(k))return;const d=DEF103[k],id=d&&lotFree103(d)?d:(LOT103.find(l=>lotFree103(l.id))||{}).id;if(id){SH.pos[k]=id;ch=1}});return ch}
// ---------- solid tiles, shared between buildings (counted) ----------
function lotMark103(key,list){const T=KL103.tiles,old=KL103.own[key]||[];
  old.forEach(t=>{const n=(T.get(t)||1)-1;if(n<=0){T.delete(t);const x=t%W,y=(t/W)|0;if(MAP[y][x]=='B'){MAP[y][x]='P';mmPaint(x,y)}}else T.set(t,n)});
  KL103.own[key]=list||[];(list||[]).forEach(t=>{T.set(t,(T.get(t)||0)+1);const x=t%W,y=(t/W)|0;if(MAP[y][x]=='P'||MAP[y][x]=='B'){if(MAP[y][x]!='B'){MAP[y][x]='B';mmPaint(x,y)}}})}
// if the hero stands inside a new footprint, step out to the door
function lotEject103(l){try{const p=pl.position,X=Math.round(p.x),Z=Math.round(p.z);if(!solid(p.x,p.z)&&!tcHit(p.x,p.z))return;const d=lotDoor103(l);toPos(d[0],d[1])}catch(_){}}
// ---------- TANIM bookkeeping for things that get rebuilt ----------
function lotTanim103(fn){const n0=TANIM.length;const r=fn();return [r,TANIM.slice(n0)]}
function lotUnanim103(list,x,z){(list||[]).forEach(a=>{const i=TANIM.indexOf(a);if(i>=0)TANIM.splice(i,1)});
  if(x!=null)for(let i=TANIM.length-1;i>=0;i--){const a=TANIM[i];if(Math.abs(a.x-x)<1e-6&&Math.abs(a.z-z)<1e-6)TANIM.splice(i,1)}}

// ---------- the Magic Shop joins the market kits (the north-row hall is retired) ----------
TWN100_KIT.magic=function(k,S){const o={w:4.4,d:4.0,h:2.7,zc:-1.3,st:'stone',wc:0x5a5668,pc:0x2c2150};TWN100_body(k,o);TWN100_roof(k,o,0x2e2848,1.6,'x',0x2c2150);
  // the wizard's tower at the back corner, with a ring of crenels and a tall slate cone
  twStoneRing(k,0x4e4a5c,-1.55,-2.75,.95,0,5.4,.32);for(let i=0;i<10;i++){const a=i/10*6.283;k.L('c',0x2c2150,[-1.55+Math.cos(a)*.85,5.2,-2.75+Math.sin(a)*.85],[-1.55+Math.cos(a)*1.12,5.5,-2.75+Math.sin(a)*1.12],.06,'box')}
  k.p('c',0x2c2150,'cyl8',-1.55,5.55,-2.75,1.16,.14,1.16,0,0,0,.04);twCone(k,0x2e2060,-1.55,5.6,-2.75,1.3,2.3);k.p('g',0xffe08a,'oct',-1.55,8.1,-2.75,.14,.2,.14);
  [0,1].forEach(i=>twWindow(k,-1.55+(i?.6:-.3),3.2+i*.9,-2.75+.92,.24,.46,(i?.5:-.2),0xaee6ff));
  twDoor(k,.9,.36,.72,.95,1.7,0);for(let i=0;i<7;i++){const a=Math.PI*i/6;k.p('c',0x4e4a5c,'box',.9+Math.cos(a)*.56,1.95+Math.sin(a)*.5,.78,.18,.2,.14,0,0,a+Math.PI/2,.08)}
  twWindow(k,-1.1,1.55,.74,1.0,.8,0,0xaee6ff);
  // the yard: a crystal pedestal, a lectern with an open tome, a rune circle, shelves of scrolls under a little awning
  k.as('stone',()=>{k.p('c',0x6a6678,'cyl8',1.35,.4,2.25,.3,.8,.3,0,0,0,.08);k.p('c',0x4e4a5c,'cyl8',1.35,.04,2.25,.5,.08,.5,0,0,0,.04)});k.p('m',0xd8b44a,'box',1.35,.82,2.25,.42,.04,.42,0,.4,0,0);
  k.p('g',0x9ae0ff,'oct',1.35,1.25,2.25,.2,.32,.2);
  k.as('wood',()=>{k.L('c',TWC.woodD,[-1.25,0,2.2],[-1.25,1.0,2.15],.06,'box');k.p('c',0x4a3020,'box',-1.25,1.05,2.12,.55,.06,.42,.45,0,0,.02)});
  k.p('c',0x6a2a3a,'box',-1.25,1.1,2.1,.5,.05,.36,.45,0,0,0);k.p('c',0xe8dcc0,'box',-1.38,1.15,2.08,.22,.02,.32,.45,0,-.08,0).p('c',0xe8dcc0,'box',-1.12,1.15,2.08,.22,.02,.32,.45,0,.08,0);
  for(let i=0;i<14;i++){const a=i/14*6.283;k.p('g',i%2?0x9a6aff:0x6a8aff,'box',Math.cos(a)*1.05+.05,.03,2.45+Math.sin(a)*.7,.28,.02,.05,0,-a+Math.PI/2,0)}
  TWN100_awning(k,-2.3,-.2,.75,1.7,2.4,2.0,[0x2c2150,0xd8ccb0]);
  k.as('wood',()=>[.5,.95,1.4].forEach(y=>k.p('c',0x5a3c24,'box',-2.0,y,1.2,.36,.05,.8,0,0,0,.02)));
  [.5,.95,1.4].forEach((y,j)=>{for(let i=0;i<3;i++)k.p('c',[0xe8dcc0,0xd8c8a0,0xc8b890][(i+j)%3],'cyl6',-2.0,y+.08,.95+i*.25,.05,.26,.05,Math.PI/2,0,0,0)});
  S.push([-1.55,8.3,-2.75])};
TWN100_SIGN.magic=['ARCANE SHOP','✦ spells · scrolls · wonders','#1c1236','#cdb6ff'];TWN100_SY.magic=2.85;TWN100_SZZ.magic=.78;
TWN100_NPCO.magic={robe:0x5a3aa0,trim:0xd8b44a,hat:'wiz',hatC:0x2e2078,label:'Magic Vendor'};
TWN100_ACT.magic=()=>openShop('x');TWN100_LBL.magic='F · Magic Shop';
if(!TWN100_SH.some(q=>q.k=='magic'))TWN100_SH.push({k:'magic',s:1,x:14.6,z:-17,ry:0});
// the north-row hall stays hidden for good; its tiles and colliders go
{const T=TOWNS[0];try{if(T.mvG){T.mvG.visible=false;(T.mvCol||[]).forEach(c=>{const i=T.col.indexOf(c);if(i>=0)T.col.splice(i,1)});T.mvCol=[]}
  for(let y=-18;y<=-14;y++)for(let x=12;x<=17;x++){const X=T.cx+x,Y=T.cy+y;if(MAP[Y][X]=='B'){MAP[Y][X]='P';mmPaint(X,Y)}}
  // the eight v100 plot footprints were baked into the map at load: hand them back, lots mark their own
  TWN100_SH.forEach(q=>{if(q.k=='magic')return;lotTiles103({x:q.x,z:q.z,ry:q.ry},-2.5,2.5,-3.5,3.5).forEach(t=>{const x=t%W,y=(t/W)|0;if(MAP[y][x]=='B'){MAP[y][x]='P';mmPaint(x,y)}})});
  // the construction plots are gone (an unbuilt shop has no lot yet)
  for(const k in TWN100_S.site){scene.remove(TWN100_S.site[k]);delete TWN100_S.site[k]}
  for(const k in (SHM.sites||{})){scene.remove(SHM.sites[k]);delete SHM.sites[k]}
  // shops the v100 sync already built stand on their default lots
  TWN100_SH.forEach(q=>{if(TWN100_S.b[q.k])q._lot=DEF103[q.k]})}catch(e){console.warn('v103 lots setup',e)}}
// ---------- shops: build / move / take down by lot ----------
var FP103={shop:[-2.5,2.5,-3.5,3.5]};
{const f=TWN100_build;TWN100_build=function(q){const [g,an]=lotTanim103(()=>f.apply(this,arguments));if(g)g.userData.tan=an;return g}}
{const f=TWN100_keeper;TWN100_keeper=function(q){const [g,an]=lotTanim103(()=>f.apply(this,arguments));if(g)g.userData.tan=an;return g}}
function lotDropShop103(q){const T=TOWNS[0],k=q.k,b=TWN100_S.b[k],n=TWN100_S.npc[k];
  if(b){scene.remove(b);lotUnanim103(b.userData.tan,b.position.x,b.position.z);delete TWN100_S.b[k]}
  if(n){scene.remove(n);const p=n.position,c=n.children[0];lotUnanim103(n.userData.tan,c?c.position.x:p.x,c?c.position.z:p.z);delete TWN100_S.npc[k]}
  (TWN100_S.col[k]||[]).forEach(c=>{const i=T.col.indexOf(c);if(i>=0)T.col.splice(i,1)});delete TWN100_S.col[k];
  lotMark103(k,[])}
var FAR103=[-9999,-9999];
function TWN100_shopSync(){const T=TOWNS[0];if(!T||!TWN100_S||!TWN100_SIGN||typeof LOT103=='undefined')return;
  TWN100_SH.forEach(q=>{const l=TWN100_built(q.k)?lotOf103(q.k):null,id=l?l.id:null;
    if(q._lot!==id){lotDropShop103(q);q._lot=id;if(l){q.x=l.x;q.z=l.z;q.ry=l.ry}}
    if(!l)return;
    if(!TWN100_S.b[q.k]){TWN100_build(q);lotMark103(q.k,lotTiles103(l,...FP103.shop));lotEject103(l)}
    else if(!KL103.own[q.k]||!KL103.own[q.k].length)lotMark103(q.k,lotTiles103(l,...FP103.shop));
    TWN100_S.b[q.k].visible=true;
    if(TWN100_NPCO[q.k]&&!TWN100_S.npc[q.k])TWN100_keeper(q);
    (TWN100_S.col[q.k]||[]).forEach(c=>{if(T.col.indexOf(c)<0)T.col.push(c)})});
  try{TWN100_smokeSync()}catch(e){console.warn('v103 smoke',e)}
  lotSpots103();try{lotStakes103()}catch(e){console.warn('v103 stakes',e)}
  KL103.ver++;try{if(typeof wk103Sync=='function')wk103Sync()}catch(e){console.warn('v103 keepers',e)}}
// prompt spots that older code keeps in its own fields follow the lots
function lotSpots103(){const T=TOWNS[0],sp=k=>{const q=TWN100_SH.find(s=>s.k==k),l=q&&q._lot&&LOTM103[q._lot];return l?lotDoor103(l):FAR103.slice()};
  try{T.mv=sp('magic')}catch(_){}
  try{if(T.st2){T.st2.c=sp('cook');T.st2.a=sp('alch')}}catch(_){}
  try{const n=sp('stable');STB.x=n[0]-T.cx;STB.z=n[1]-T.cy-1.4;STB.n=n;STB.g=TWN100_S.b.stable||null;STB.npc=TWN100_S.npc.stable||null;STB.col=TWN100_S.col.stable||[]}catch(_){}
  try{const v=VIS.map(q=>sp(q.k));if(!T.vsp||v.some((p,i)=>!T.vsp[i]||T.vsp[i][0]!==p[0]||T.vsp[i][1]!==p[1])){T.vsp=v;VIS.forEach(q=>{if(q.g){scene.remove(q.g);q.g=null}})}}catch(_){}}
function stableBuild(){lotSpots103()}
function stableSync(){TWN100_shopSync()}
function shSites(){const T=TOWNS[0];if(!T)return;SHM.vsite=[];for(const k in (SHM.sites||{})){scene.remove(SHM.sites[k]);delete SHM.sites[k]}if(T.mvG)T.mvG.visible=false;try{TWN100_shopSync()}catch(e){console.warn('v103 shops',e)}}
// walk-up prompts: only built shops that stand on a lot
function TWN100_prompt(){const p=pl.position;if(townAt(p.x,p.z,0)!==0)return null;
  for(const q of TWN100_SH){if(!q._lot||!TWN100_built(q.k))continue;const [x,z]=lotDoor103(LOTM103[q._lot]);if(Math.hypot(p.x-x,p.z-z)<2.4)return {label:TWN100_LBL[q.k],fn:TWN100_ACT[q.k]}}return null}
// ---------- upgrade structures: placed on their lot (box colliders turn with a 90° lot) ----------
{const f=kdUp;kdUp=function(T,key,l){const U=KDU[key];if(U&&UPK103.includes(key)){const lt=lotOf103('u:'+key);if(lt&&(U.x!==lt.x||U.z!==lt.z||U.ry!==lt.ry)){U.x=lt.x;U.z=lt.z;U.ry=lt.ry;const st=kdState().up[key];if(st)st.l=-9}}
  const st0=kdState().up[key],l0=st0?st0.l:null;const r=f.apply(this,arguments);const st=kdState().up[key];
  if(st&&st.l!==l0&&U&&Math.abs(Math.sin(U.ry||0))>.5)st.col.forEach(c=>{if(c.hx!=null&&!c._t103){const h=c.hx;c.hx=c.hz;c.hz=h;c._t103=1}});
  if(st&&st.l!==l0&&st.l>0){const lt=lotOf103('u:'+key);if(lt)lotEject103(lt)}return r}}
// every placed upgrade keeps its old spot until a lot says otherwise; positions come from the lot table from now on
UPK103.forEach(k=>{const L=LOTM103[DEF103['u:'+k]];if(L){KDU[k].x=L.x;KDU[k].z=L.z;KDU[k].ry=L.ry}});
// ---------- free lots: four stakes and a rope each (one InstancedMesh) ----------
function lotStakes103(){const T=TOWNS[0];if(!T||!T.g)return;const free=LOT103.filter(l=>lotFree103(l.id)),N=free.length*4;
  if(!KL103.stakes){const g=new THREE.CylinderGeometry(.07,.09,.9,5);g.translate(0,.45,0);const m=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:0x8a6a44}),LOT103.length*4);
    m.castShadow=false;m.frustumCulled=false;m.userData.lpsSkip=1;m.name='lotStakes';scene.add(m);KL103.stakes=m;
    const fg=new THREE.PlaneGeometry(.34,.22);fg.translate(.19,.78,0);const fl=new THREE.InstancedMesh(fg,new THREE.MeshLambertMaterial({color:0xc9a24a,side:THREE.DoubleSide}),LOT103.length*4);
    fl.castShadow=false;fl.frustumCulled=false;fl.userData.lpsSkip=1;fl.name='lotFlags';scene.add(fl);KL103.flags=fl}
  const m=KL103.stakes,fl=KL103.flags,d=new THREE.Object3D();let i=0;
  free.forEach(l=>{[[-3,-3],[3,-3],[3,3],[-3,3]].forEach(([a,b])=>{const [x,z]=lotW103(l,a,b);d.position.set(x,T.ph-.02,z);d.rotation.set(0,l.ry+(a+b)*.2,(a*.013));d.updateMatrix();m.setMatrixAt(i,d.matrix);fl.setMatrixAt(i,d.matrix);i++})});
  m.count=fl.count=N;m.instanceMatrix.needsUpdate=fl.instanceMatrix.needsUpdate=true;m.visible=fl.visible=N>0}
// ---------- placing, moving ----------
// what a key is called and its icon (menu, plan, messages)
function lotName103(key){if(!key)return '';if(key.startsWith('u:')){const u=SHU.find(q=>q.k==key.slice(2));return u?[u.i,u.n]:['🏗️',key]}
  if(key.startsWith('h:')){const h=typeof HS103!='undefined'&&HS103.h[+key.slice(2)];return ['🏠',h&&h.nm||'House']}
  if(key=='smith')return ['⚒️','Blacksmith'];const o=SHOPS.find(q=>q.k==key);return o?[o.i,o.n]:['🏗️',key]}
// put (or move) a built thing on a free lot; returns true when it moved
function lotPut103(key,id){const l=LOTM103[id];if(!l||!lotFree103(id)&&lotKey103(id)!==key)return false;SH.pos[key]=id;lotSync103();return true}
function lotSync103(){try{lotAuto103()}catch(e){console.warn('v103 auto',e)}
  try{TWN100_shopSync()}catch(e){console.warn('v103 shops',e)}
  try{kdSync()}catch(e){console.warn('v103 kingdom',e)}
  try{if(typeof hs103Sync=='function')hs103Sync()}catch(e){console.warn('v103 houses',e)}
  try{lotStakes103()}catch(_){}}
{const f=shApply;shApply=function(){try{lotAuto103()}catch(e){console.warn('v103 auto',e)}const r=f.apply(this,arguments);try{if(typeof hs103Sync=='function')hs103Sync();lotStakes103()}catch(e){console.warn('v103 lots',e)}return r}}
// saves: SH.pos rides with the stronghold levels
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.kpos=Object.assign({},SH.pos);return o}}
{const f=x2Load;x2Load=function(s){SH.pos={};if(s&&s.kpos&&typeof s.kpos=='object')for(const k in s.kpos){const v=s.kpos[k];if(typeof v=='string'&&LOTM103[v]&&!Object.values(SH.pos).includes(v))SH.pos[k]=v}
  const r=f.apply(this,arguments);lotSync103();return r}}
try{lotSync103()}catch(e){console.warn('v103 lots',e)}

// ---------- the plan of the Grand Square (drawn into a canvas by the Steward's window) ----------
// opt: {pick:key|null, hover:lot id, sel:lot id}; returns the scale info used for hit tests
function lotPlan103(cv,opt){opt=opt||{};const T=TOWNS[0],x0=-37,z0=-22,nx=75,nz=75,c=cv.getContext('2d'),Wd=cv.width,Hd=cv.height,s=Math.min(Wd/nx,Hd/nz),ox=(Wd-nx*s)/2,oz=(Hd-nz*s)/2;
  const P=(x,z)=>[ox+(x-x0)*s,oz+(z-z0)*s];c.fillStyle='#0d0b09';c.fillRect(0,0,Wd,Hd);
  for(let z=z0;z<z0+nz;z++)for(let x=x0;x<x0+nx;x++){const t=MAP[T.cy+z]&&MAP[T.cy+z][T.cx+x];if(!t)continue;
    c.fillStyle=t=='W'?'#8a8070':t=='B'?'#4a3a2c':t=='P'?'#3a342c':t=='p'?'#4a3c2a':'#1c1a16';const [px,pz]=P(x-.5,z-.5);c.fillRect(px,pz,s+.6,s+.6)}
  // colliders of everything else (wells, carts, prestige halls, upgrade structures)
  c.fillStyle='rgba(120,104,84,.55)';T.col.forEach(q=>{const x=q.x-T.cx,z=q.z-T.cy;if(x<x0||x>x0+nx||z<z0||z>z0+nz)return;
    if(q.r!=null){const [px,pz]=P(x,z);c.beginPath();c.arc(px,pz,Math.max(1,q.r*s),0,6.283);c.fill()}else{const [px,pz]=P(x-q.hx,z-q.hz);c.fillRect(px,pz,q.hx*2*s,q.hz*2*s)}});
  // fixed landmarks
  const lab=(t,x,z,f)=>{const [px,pz]=P(x,z);c.font=f||(Math.round(s*2.2)+'px serif');c.textAlign='center';c.textBaseline='middle';c.fillText(t,px,pz)};
  lab('⛲',0,0);lab('🍺',-14,-16);lab('🪙',0,-16);lab('🏰',SHM.st?SHM.st.x-T.cx:-14,SHM.st?SHM.st.z-T.cy:7);
  // lots
  const R={};LOT103.forEach(l=>{const k=lotKey103(l.id),[ax,az]=P(l.x-3.5,l.z-3.5),w=7*s;R[l.id]=[ax,az,w];
    const pick=opt.pick!=null,ok=pick&&(!k||k===opt.pick),hov=opt.hover===l.id;
    if(k){c.fillStyle=k===opt.pick?'rgba(240,204,114,.35)':'rgba(90,70,44,.92)';c.fillRect(ax+1,az+1,w-2,w-2);c.strokeStyle=k===opt.pick?'#f0cc72':'#8a6a3a';c.lineWidth=1.5;c.strokeRect(ax+1,az+1,w-2,w-2);
      c.fillStyle='#fff';lab(lotName103(k)[0],l.x,l.z,Math.round(s*3.4)+'px serif')}
    else{c.setLineDash([3,3]);c.strokeStyle=ok?(hov?'#ffe08a':'#c9a24a'):'rgba(201,162,74,.35)';c.lineWidth=ok?2:1;c.strokeRect(ax+2,az+2,w-4,w-4);c.setLineDash([]);
      if(ok){c.fillStyle=hov?'rgba(255,224,138,.38)':'rgba(201,162,74,.14)';c.fillRect(ax+2,az+2,w-4,w-4)}}
    // the street side
    const [dx,dz]=[Math.sin(l.ry),Math.cos(l.ry)],[mx,mz]=P(l.x+dx*3.3,l.z+dz*3.3);c.fillStyle=k?'#d8b46a':'rgba(201,162,74,.5)';c.fillRect(mx-(dz?s*1.2:s*.35),mz-(dx?s*1.2:s*.35),dz?s*2.4:s*.7,dx?s*2.4:s*.7);
    if(hov){c.strokeStyle='#ffe08a';c.lineWidth=2.5;c.strokeRect(ax+1,az+1,w-2,w-2)}});
  // you
  try{const x=pl.position.x-T.cx,z=pl.position.z-T.cy;if(townAt(pl.position.x,pl.position.z,0)==0){const [px,pz]=P(x,z);c.fillStyle='#7ee8ff';c.beginPath();c.arc(px,pz,Math.max(2.5,s*.9),0,6.283);c.fill();c.strokeStyle='#000';c.lineWidth=1;c.stroke()}}catch(_){}
  return {s,ox,oz,x0,z0,R}}
function lotHit103(info,px,pz){for(const id in info.R){const [ax,az,w]=info.R[id];if(px>=ax&&px<=ax+w&&pz>=az&&pz<=az+w)return id}return null}
