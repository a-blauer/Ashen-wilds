// ================= v109: the kingdom grows with every Sovereign · buildings turn on their lots · shop upgrades =================
// 1) The kingdom's size (KF109). Duskhold has six stages, s = Sovereigns defeated (first kills only), at most 5. The walls stand
//    at x = ±KF109.WX (20) from the north wall (z = -TS) to z = KF109.SZ[s] (11, 21, 29, 36, 44, 51), with the gate in the middle
//    of the south wall and a paved road from it to the old gate spot (z 51) and the Portal Road. Stage s opens the lots with
//    l.st <= s (LOT103 in 1860): 5 plots, then 3 more per stage, 20 at the end. kf109() = {s, WX, SZ}; kfIn109(x,z,m) = inside the walls.
//    An older save that already has more buildings than its stage allows starts at the stage that fits them (kfNeed109).
//    kfApply109 rebuilds everything that depends on the size when the stage changes: the map tiles inside the old 72x72 square
//    (paving inside, wall ring, open ground outside, the road), the wall ring (kdWalls keys by stage), the paving stones, the
//    lantern posts / benches / crates (TWN100_wardK), the market stalls, the old v83 dressing (shown only inside the walls and
//    off every lot), the wild outskirts (trees, rocks and bushes on the island outside the walls, KFWILD|s), decorations, the
//    citizens' walking grid, and the lots. The prestige buildings (granary, chapel, barracks, keep) stand outside the walls.
//    Empty open lots show a dim white outline on the ground; just-opened ones glow gold for a minute.
// 2) Turning buildings: SH.rot[key] = 1..3 quarter turns (saved as x2.krot), from the ⟳ button at the Steward. A turn (or a move)
//    that would leave any building's door unreachable on foot is refused (kfDoors109 floods the town from the spawn).
// 3) Shop upgrades (SHP109.lv[k] 0..3, saved as x2.shpu), bought at the Stronghold Steward next to each built shop
//    (and the Trading Post, which is always open). Every level gives 5% off everything that shop sells (shpP109).
//    Stock: Trading Post +2 pieces of gear per level with better rarities (shpGear109) and higher-tier eggs (shpEgg109);
//    Magic Shop +1 egg per level, higher-tier eggs; Curio Shop +1 ware per level (rune, egg, rune), higher-tier eggs;
//    Cooking Hearth / Alchemy Table: crops of one more tier per level in the market. Rune Sanctum, Beast Trainer, Stable: discount.
//    Price and stock hooks sit in the shop code itself (0140 Trading Post / Magic Shop, 0430 runes, 0490 market + mana
//    potion, 0860 training, 0170/0590 mounts); the Curio stock is wrapped here (visStock).

// ---------------- 1. the kingdom's size ----------------
var KF109={s:-1,WX:20,SZ:[11,21,29,36,44,51],base:null,leg:null,fresh:{},ft:0,wild:null,wcol:[],ward:null,wardCol:[],wardLamps:[],stalls:null,stallCol:[],cand:null};
var KF109_NOWILD=[[-28.6,-16.8,5],[-22.4,-17.4,2.8],[24.8,-16.4,5.2],[31.4,-16.2,2.8],[-28.5,35.5,4.2],[-27.5,44.5,5.2],[28.6,37.5,6],[0,63,19.5]]; // prestige buildings, the Portal Court
function kfNeed109(){let n=1;try{SHOPS.forEach(o=>{if(shopBuilt(o.k))n++});UPK103.forEach(k=>{if(kdLv(k)>0)n++});if(typeof HS103!='undefined'&&HS103)n+=HS103.h.length}catch(_){}
  let s=0;while(s<5&&5+3*s<n)s++;try{for(const k in SH.pos){const l=LOTM103[SH.pos[k]];if(l&&l.st>s)s=l.st}}catch(_){}return s}
function kfStage109(){const b=typeof bossDone!='undefined'?bossDone.size:0;return Math.min(5,Math.max(Math.min(5,b),kfNeed109()))}
function kf109(){if(typeof KF109=='undefined'||!KF109)return {s:-1,WX:TWN100_WX,SZ:TWN100_SZ};const s=KF109.s>=0?KF109.s:kfStage109();return {s,WX:KF109.WX,SZ:KF109.SZ[s]}}
function kfIn109(x,z,m){const F=kf109();m=m||0;return Math.abs(x)<F.WX-.5-m&&z>-TS+.5+m&&z<F.SZ-.5-m}
function lotN109(){return 5+3*Math.max(0,kf109().s)}
function lotOpen109(id){const l=LOTM103[id];return !!l&&(l.st<=kf109().s||!!lotKey103(id))}
lotFree103=function(id){const l=LOTM103[id];return !!l&&!lotKey103(id)&&l.st<=kf109().s};
// everything built gets a lot (houses too): its default lot when free, otherwise the first free lot from the fountain out
lotAuto103=function(){let ch=0;for(const k in SH.pos)if(!LOTM103[SH.pos[k]]||!lotBuilt103(k)){delete SH.pos[k];delete SH.rot[k];ch=1}
  const keys=['smith'].concat(SHOPS.map(o=>o.k),UPK103.map(k=>'u:'+k),typeof HS103!='undefined'&&HS103?HS103.h.map((_,i)=>'h:'+i):[]);
  keys.forEach(k=>{if(SH.pos[k]||!lotBuilt103(k))return;const d=DEF103[k],id=d&&lotFree103(d)?d:(LOT103.find(l=>lotFree103(l.id))||{}).id;if(id){SH.pos[k]=id;ch=1}});return ch};
function lotCounts109(){const open=LOT103.filter(l=>lotOpen109(l.id)),used=open.filter(l=>lotKey103(l.id)).length;return {N:lotN109(),open:open.length,used,free:open.length-used}}
// ---- map tiles of the old Grand Square: paving inside the walls, the wall ring, open ground outside, the road to the old gate ----
function kfTiles109(F){const T=TOWNS[0],X=37,Z0=-22,Z1=52;
  if(!KF109.base){KF109.base=new Map();for(let dz=Z0;dz<=Z1;dz++)for(let dx=-X;dx<=X;dx++){const x=T.cx+dx,y=T.cy+dz,t=y*W+x;KF109.base.set(t,KL103.tiles.has(t)?'P':MAP[y][x])}}
  for(let dz=-21;dz<=51;dz++)for(let dx=-36;dx<=36;dx++){const x=T.cx+dx,y=T.cy+dz,t=y*W+x,b=KF109.base.get(t);if(!(b=='P'||b=='W'||b=='B'||b=='.'))continue;const ax=Math.abs(dx);let c;
    if(ax<F.WX&&dz>-21&&dz<F.SZ)c=b=='B'?'B':'P';
    else if(ax==F.WX&&dz<=F.SZ||dz==-21&&ax<=F.WX)c='W';
    else if(dz==F.SZ&&ax<F.WX)c=ax<=1?'P':'W';
    else if(ax<=1&&dz>F.SZ)c='P';
    else c='.';
    if(c=='P'&&KL103.tiles.has(t))c='B';
    if(MAP[y][x]!==c){MAP[y][x]=c;try{mmPaint(x,y)}catch(_){}}}}
// ---- paving stones over the paved tiles (the v83 flagstones, rebuilt for the current walls) ----
function kfPave109(){const T=TOWNS[0];if(T.pave){if(T.pave.parent)T.pave.parent.remove(T.pave);try{T.pave.material.dispose()}catch(_){}T.pave=null}
  const R=dkRng(77),L=[];for(let y=T.cy-34;y<=T.cy+(T.sz||TS)+13;y++)for(let x=Math.max(1,T.cx-TWN100_WX-4);x<=T.cx+TWN100_WX+4;x++){if(MAP[y]&&MAP[y][x]=='P')L.push([x,y])}
  if(!L.length)return;if(!KF109.pg){const g=new THREE.CircleGeometry(.5,6);g.rotateX(-Math.PI/2);const pa=g.attributes.position;for(let i=1;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),h=twH(Math.round(x*50),0,Math.round(z*50),5);pa.setX(i,x*(.86+h*.26));pa.setZ(i,z*(.86+h*.26))}
    const n=g.toNonIndexed();n.computeVertexNormals();n.userData.lps=1;KF109.pg=n}
  const m=new THREE.InstancedMesh(KF109.pg,new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),L.length*2),d=new THREE.Object3D(),c=new THREE.Color();m.material.userData.lps=1;
  let i=0;L.forEach(([x,y])=>{const two=R()<.4;for(let j=0;j<(two?2:1);j++){const ox=two?(j?.24:-.24):(R()-.5)*.12,oz=(R()-.5)*(two?.4:.12);d.position.set(x+ox,GH(x+ox,y+oz)+.025+j*.004,y+oz);d.rotation.set((R()-.5)*.05,R()*6.28,(R()-.5)*.05);
    const s=two?.55+R()*.18:.86+R()*.3;d.scale.set(s,1,s*(.8+R()*.3));d.updateMatrix();m.setMatrixAt(i,d.matrix);const v=.62+R()*.32,w=R();c.setRGB(.44*v*(1+w*.08),.42*v,.41*v*(1.06-w*.08));m.setColorAt(i,c);i++}});
  m.count=i;m.receiveShadow=true;m.castShadow=false;m.userData.lpsSkip=1;m.name='pave109';scene.add(m);T.pave=m}
// ---- lantern posts, crates, benches (1820's TWN100_wardK) ----
function kfColSet109(list,add){const T=TOWNS[0];list.forEach(c=>{const i=T.col.indexOf(c);if(i>=0)T.col.splice(i,1)});list.length=0;(add||[]).forEach(c=>{T.col.push(c);list.push(c)})}
function kfWard109(F){const T=TOWNS[0];if(KF109.ward){T.g.remove(KF109.ward);KF109.ward=null}
  KF109.wardLamps.forEach(l=>{const i=TLAMP.indexOf(l);if(i>=0)TLAMP.splice(i,1)});KF109.wardLamps=[];
  TWN100_LP=TWN100_lpFor(F);const key='TWNWARD109|'+F.s;let k=null;if(!twHas(key)){k=twKit(951+F.s);TWN100_wardK(k,F)}const g=twGroup(k,key);g.name='wardDress';T.g.add(g);KF109.ward=g;
  const cols=[];TWN100_LP.forEach(([x,z])=>{const lx=x+(x<0?.32:-.32),l=[T.cx+lx,T.ph+2.0,T.cy+z];TLAMP.push(l);KF109.wardLamps.push(l);cols.push({x:T.cx+x,z:T.cy+z,r:.2})});
  TWN100_WD.crate.forEach(([x,z,b])=>cols.push({x:T.cx+x,z:T.cy+z,r:b?.36:.45}));TWN100_WD.bench.forEach(x=>cols.push({x:T.cx+x,z:T.cy+TWN100_WD.benchZ,hx:.78,hz:.26}));kfColSet109(KF109.wardCol,cols)}
// ---- two market stalls on the east side of the plaza (always there, so the small first town is not bare) ----
var KF109_STALL=[[16.4,-8.8,0x7a3a2a],[16.4,-4.0,0x2a3a7a]];
function kfStalls109(){const T=TOWNS[0];if(KF109.stalls)return;const g=new THREE.Group();g.name='stalls109';
  KF109_STALL.forEach(([x,z,c])=>{const st=new THREE.Group();st.position.set(x,0,z);st.rotation.y=-Math.PI/2;twStall(st,c);g.add(st)});
  {let k=null;if(!twHas('STALL109X')){k=twKit(977);TWN100_crate(k,18.5,-10.6,.55,.3);TWN100_crate(k,18.6,-9.9,.4,.9);TWN100_barrel(k,18.4,-6.4,.9);TWN100_crate(k,13.3,-4.2,.45,.4)}g.add(twGroup(k,'STALL109X'))}
  T.g.add(g);KF109.stalls=g;kfColSet109(KF109.stallCol,KF109_STALL.map(([x,z])=>({x:T.cx+x+.15,z:T.cy+z,hx:.65,hz:.92})).concat([{x:T.cx+18.5,z:T.cy-10.3,r:.55},{x:T.cx+18.4,z:T.cy-6.4,r:.3},{x:T.cx+13.3,z:T.cy-4.2,r:.35}]))}
// ---- the old (v83) dressing of the square: shown only inside the walls and never on a lot ----
function kfLotHit109(x,z,p){return LOT103.some(l=>Math.abs(x-l.x)<3.5+p&&Math.abs(z-l.z)<3.5+p)}
function kfLegacy109(F){const T=TOWNS[0];
  if(!KF109.leg){const K=typeof KGD!='undefined'&&KGD||{},own=new Set([].concat(K.wcol||[],K.pcol||[],...Object.values(K.up||{}).map(u=>u.col||[]),...Object.values(DC103.col||{}),
      ...Object.values(typeof HS103!='undefined'&&HS103?HS103.g:{}).map(o=>o.c||[]),...Object.values(TWN100_S.col||{}),KF109.wardCol,KF109.stallCol,KF109.wcol));
    const skip=new Set([K.wg,KF109.ward,KF109.stalls,K.pg].filter(Boolean));Object.values(K.up||{}).forEach(u=>{if(u.g)skip.add(u.g)});
    const inSq=(x,z)=>Math.abs(x)<37&&z>-22&&z<52;
    KF109.leg={g:T.g.children.filter(o=>!skip.has(o)&&(Math.abs(o.position.x)+Math.abs(o.position.z)>.5)&&inSq(o.position.x,o.position.z)&&!/^kd|^deco|^house|^wardDress|^stalls109|^kfwild/.test(o.name||'')).map(o=>({o,v:o.visible})),
      c:T.col.filter(c=>!own.has(c)&&inSq(c.x-T.cx,c.z-T.cy)).map(c=>({c}))}}
  const ok=(x,z,p)=>kfIn109(x,z,-.4)&&!kfLotHit109(x,z,p);
  KF109.leg.g.forEach(q=>{q.o.visible=q.v&&ok(q.o.position.x,q.o.position.z,.7)});
  KF109.leg.c.forEach(q=>{const c=q.c,on=ok(c.x-T.cx,c.z-T.cy,.15+(c.r!=null?c.r:Math.max(c.hx,c.hz))),i=T.col.indexOf(c);if(on&&i<0)T.col.push(q.c);else if(!on&&i>=0)T.col.splice(i,1)})}
// ---- the outskirts: trees, rocks and bushes on the island outside the walls (one baked kit per stage) ----
function kfWildCand109(){if(KF109.cand)return KF109.cand;const T=TOWNS[0],R=dkRng(4242),L=[];
  for(let z=-27;z<=57;z+=2.6)for(let x=-42;x<=42;x+=2.6){const px=x+(R()-.5)*2.2,pz=z+(R()-.5)*2.2,u=R(),s=.75+R()*.6,ry=R()*6.28;
    const X=Math.round(T.cx+px),Z=Math.round(T.cy+pz);if(!(MAP.DW[Z*W+X]<-3))continue;if(KF109_NOWILD.some(([a,b,r])=>Math.hypot(px-a,pz-b)<r))continue;
    L.push({x:px,z:pz,t:u<.3?(u<.12?'dead':'pine'):u<.52?'rock':u<.86?'bush':'grass',s,ry})}
  return KF109.cand=L}
function kfWild109(F){const T=TOWNS[0];if(KF109.wild){T.g.remove(KF109.wild);KF109.wild=null}
  const fixed=T.col.filter(c=>KF109.wcol.indexOf(c)<0&&!(KF109.leg&&KF109.leg.c.some(q=>q.c===c)));
  const keep=KF109.cand&&KF109.wsel&&KF109.wsel.s===F.s?KF109.wsel.L:kfWildCand109().filter(p=>{const ax=Math.abs(p.x);
    if(ax<F.WX+2.4&&p.z>-TS-2.4&&p.z<F.SZ+2.4)return false;if(ax<4.6&&p.z>F.SZ-1)return false;
    return !fixed.some(c=>{const dx=T.cx+p.x-c.x,dz=T.cy+p.z-c.z;return c.r!=null?dx*dx+dz*dz<(c.r+1.4)*(c.r+1.4):Math.abs(dx)<c.hx+1.4&&Math.abs(dz)<c.hz+1.4})});
  KF109.wsel={s:F.s,L:keep};const key='KFWILD|'+F.s;let k=null;
  if(!twHas(key)){k=twKit(4243+F.s);keep.forEach(p=>{const {x,z,s,ry}=p;
    if(p.t=='pine'){k.as('bark',()=>k.L('c',0x3a2a1c,[x,0,z],[x,1.2*s,z],.14*s,'log'));[[1.0,1.15,1.5],[1.6,.9,1.25],[2.2,.62,1.0]].forEach(([y,r,h],j)=>k.p('c',[0x1e3626,0x24402a,0x2a4a30][j],'cone6',x,y*s,z,r*s,h*s,r*s,0,ry+j,0,.08))}
    else if(p.t=='dead'){k.as('bark',()=>{k.L('c',0x2e2620,[x,0,z],[x+.1*s,2.4*s,z+.05],.15*s,'log');k.L('c',0x2e2620,[x+.05,1.5*s,z],[x+.8*s*Math.cos(ry),2.2*s,z+.8*s*Math.sin(ry)],.06*s,'log');k.L('c',0x2e2620,[x+.05,1.9*s,z],[x-.6*s*Math.cos(ry),2.6*s,z-.6*s*Math.sin(ry)],.05*s,'log')})}
    else if(p.t=='rock'){k.as('stone',()=>{k.p('c',[0x5a5662,0x4e4a54,0x66626c][Math.floor(s*7)%3],'dod',x,.22*s,z,.55*s,.42*s,.5*s,0,ry,0,.18);if(s>1)k.p('c',0x4e4a54,'dod',x+.5*s,.12*s,z+.3*s,.3*s,.24*s,.3*s,0,ry*2,0,.2)})}
    else if(p.t=='bush'){[[0,0],[.35,.2],[-.3,.25]].forEach(([a,b],j)=>k.p('c',[0x24402a,0x2e4a30,0x35502e][j],'ico',x+a*s,.3*s,z+b*s,.42*s,.34*s,.42*s,0,ry+j,0,.12))}
    else{for(let j=0;j<3;j++)k.p('c',[0x4a5a34,0x3e5030][j%2],'cone4',x+(j-1)*.15,.18*s,z+(j%2)*.12,.07,.36*s,.07,0,j,(j-1)*.2,.1)}})}
  const g=twGroup(k,key);g.name='kfwild';T.g.add(g);KF109.wild=g;g.traverse(o=>{if(o.isMesh)o.castShadow=false});
  kfColSet109(KF109.wcol,keep.filter(p=>p.t=='pine'||p.t=='dead'||p.t=='rock').map(p=>({x:T.cx+p.x,z:T.cy+p.z,r:p.t=='rock'?.4*p.s:.3})))}
// ---- apply the current stage ----
function kfEject109(){try{const p=pl.position;if(townAt(p.x,p.z,0)!==0)return;if(solid(p.x,p.z)||tcHit(p.x,p.z))TWN100_fixPos()}catch(_){}}
function kfApply109(force){const s=kfStage109();if(s===KF109.s&&!force)return false;const s0=KF109.s;KF109.s=s;const F=kf109();
  const step=(n,f)=>{try{f()}catch(e){console.warn('v109 '+n,e)}};
  step('tiles',()=>kfTiles109(F));step('walls',()=>{if(typeof KGD!='undefined'&&KGD){KGD.wl=-1;kdSync()}});step('pave',kfPave109);
  step('ward',()=>kfWard109(F));step('stalls',kfStalls109);step('legacy',()=>kfLegacy109(F));step('wild',()=>kfWild109(F));
  KL103.ver++;step('cz',()=>{CZ103.ver=-1});step('lots',lotSync103);step('deco',dc103Sync);step('eject',kfEject109);
  return s0>=0&&s>s0}
// ---- the ground: a dim white outline round every empty open lot (gold for a minute when it has just opened) ----
{const f=lotPlan103;lotPlan103=function(cv,opt){const info=f.apply(this,arguments);try{const c=cv.getContext('2d'),s=info.s;
  LOT103.forEach(l=>{if(lotOpen109(l.id))return;const r=info.R[l.id];if(!r)return;const [ax,az,w]=r;
    c.fillStyle='#0d0b09';c.fillRect(ax,az,w,w);c.fillStyle='rgba(60,52,44,.55)';c.fillRect(ax+2,az+2,w-4,w-4);
    c.strokeStyle='rgba(120,104,84,.35)';c.lineWidth=1;c.strokeRect(ax+2,az+2,w-4,w-4);
    c.globalAlpha=.55;c.font=Math.round(s*2.4)+'px serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🔒',ax+w/2,az+w/2);c.globalAlpha=1})}catch(e){console.warn('v109 plan',e)}return info}}
function lotRingGeo109(){const h=3.42,t=.12,P=[],I=[];let n=0;
  const quad=(x0,z0,x1,z1)=>{P.push(x0,0,z0, x1,0,z0, x1,0,z1, x0,0,z1);I.push(n,n+2,n+1, n,n+3,n+2);n+=4};
  quad(-h,-h,h,-h+t);quad(-h,h-t,h,h);quad(-h,-h+t,-h+t,h-t);quad(h-t,-h+t,h,h-t);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeBoundingSphere();return g}
function lotRingMesh109(col,op,name){const m=new THREE.InstancedMesh(KL103.rgeo||(KL103.rgeo=lotRingGeo109()),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false,
    polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),LOT103.length);
  m.castShadow=false;m.receiveShadow=false;m.frustumCulled=false;m.renderOrder=2;m.userData.lpsSkip=1;m.userData.psNo=1;m.name=name;m.count=0;scene.add(m);return m}
lotStakes103=function(){const T=TOWNS[0];if(!T||!T.g)return;
  [KL103.stakes,KL103.flags].forEach(m=>{if(m){scene.remove(m);m.visible=false}});KL103.stakes=KL103.flags=null;
  if(!KL103.ring){KL103.ring=lotRingMesh109(0xffffff,.5,'lotOutline');KL103.ringN=lotRingMesh109(0xf0cc72,.75,'lotOutlineNew');
    const mt=KL103.ringN.material;KL103.ringN.onBeforeRender=()=>{mt.opacity=.45+.35*Math.sin(performance.now()/260)}}
  const now=Date.now(),d=new THREE.Object3D();let a=0,b=0;
  LOT103.forEach(l=>{if(!lotFree103(l.id))return;const [x,z]=lotW103(l,0,0);d.position.set(x,T.ph+.045,z);d.rotation.set(0,l.ry,0);d.updateMatrix();
    if((KF109.fresh[l.id]||0)>now)KL103.ringN.setMatrixAt(b++,d.matrix);else KL103.ring.setMatrixAt(a++,d.matrix)});
  KL103.ring.count=a;KL103.ringN.count=b;KL103.ring.instanceMatrix.needsUpdate=KL103.ringN.instanceMatrix.needsUpdate=true;KL103.ring.visible=a>0;KL103.ringN.visible=b>0};
// ---- a Sovereign falls for the first time: the walls move out and 3 more lots open ----
function kfGrowMsg109(s){const ids=LOT103.filter(l=>l.st===s).map(l=>l.id),c=lotCounts109();
  banner('🏰 THE KINGDOM EXPANDS','The walls of Duskhold move out · '+ids.length+' new building plots in Row '+s,c.open+' of '+LOT103.length+' plots are now yours');
  say('🏗️ Duskhold grows: the south wall moves out and plots '+ids.join(', ')+' can now be built on. Build at the Stronghold Steward.');try{sfx('power')}catch(_){}}
{const f=bossDefeated;bossDefeated=function(e){const r=f.apply(this,arguments);try{const s0=KF109.s;if(kfApply109()){const s=KF109.s,t=Date.now()+60000;
    LOT103.forEach(l=>{if(l.st>s0&&l.st<=s)KF109.fresh[l.id]=t});lotStakes103();clearTimeout(KF109.ft);KF109.ft=setTimeout(()=>{try{lotStakes103()}catch(_){}},60500);
    setTimeout(()=>kfGrowMsg109(s),6200);try{saveGame(true)}catch(_){}}}catch(err){console.warn('v109 grow',err)}return r}}
// the Steward window: plots line under the plan
function lotInfo109(P){const c=lotCounts109(),s=kf109().s;
  return `<div class="kminfo kmplots">🏗️ <b>${c.used}</b> of <b>${c.open}</b> plots used${s<5?' · 👑 defeat a new Sovereign: the walls move out and 3 more plots open':' · the kingdom has reached its full size'}`+
    (P&&!c.free?'<br><span class="warn" style="display:inline">No free plot. Move something, or defeat a new Sovereign to grow the kingdom.</span>':'')+'</div>'}
// placing on a locked lot is refused (the plan never lights it, this covers any other path)
{const f=kmPlace103;kmPlace103=function(id){const p=KM103.pick;if(p&&LOTM103[id]&&!lotOpen109(id)){say('🔒 That plot is outside the walls. Every new Sovereign you defeat moves the walls out.');return}
  const r=f.apply(this,arguments);try{kfFixDoors109()}catch(e){console.warn('v109 doors',e)}return r}}
// ---------------- 2. turning buildings ----------------
// every built thing's door must be reachable on foot from the spawn: flood fill over the inside of the walls (half-tile grid)
function kfDoors109(){const T=TOWNS[0],F=kf109(),st=.5,x0=-F.WX+.5,z0=-TS+.5,nx=Math.floor((2*F.WX-1)/st)+1,nz=Math.floor((F.SZ+TS-1)/st)+1,seen=new Uint8Array(nx*nz),q=[];
  const free=(i,j)=>{const x=T.cx+x0+i*st,z=T.cy+z0+j*st;return !solid(x,z)&&!tcHit(x,z)};
  const at=(x,z)=>{const i=Math.round((x-T.cx-x0)/st),j=Math.round((z-T.cy-z0)/st);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i};
  let s0=at(T.sp[0],T.sp[1]);if(s0<0)return [];seen[s0]=1;q.push(s0);
  while(q.length){const c=q.pop(),i=c%nx,j=(c/nx)|0;for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const k=jj*nx+ii;if(seen[k])continue;seen[k]=free(ii,jj)?1:2;if(seen[k]==1)q.push(k)}}
  const reach=(x,z)=>{for(let dz=-1;dz<=1;dz+=st)for(let dx=-1;dx<=1;dx+=st){if(dx*dx+dz*dz>1.01)continue;const k=at(x+dx,z+dz);if(k>=0&&seen[k]==1)return true}return false};
  const bad=[];for(const k in SH.pos){if(!lotBuilt103(k))continue;const l=lotOf103(k);if(!l)continue;const [x,z]=lotDoor103(l);if(!reach(x,z))bad.push(k)}return bad}
// a new building can close off a turned neighbour's door: such neighbours turn back to face their street
function kfFixDoors109(){const bad=kfDoors109().filter(k=>SH.rot[k]);if(!bad.length)return;bad.forEach(k=>delete SH.rot[k]);lotSync103();
  say('⟳ '+bad.map(k=>lotName103(k).join(' ')).join(', ')+' turned back to face '+(bad.length>1?'their streets':'its street')+', so the door can be reached.')}
function kfFace109(ry){const x=Math.round(Math.sin(ry)),z=Math.round(Math.cos(ry));return z>0?'south':z<0?'north':x>0?'east':'west'}
function kfRotate109(key){if(!SH.pos[key]||!lotBuilt103(key))return false;const r0=SH.rot[key]|0,base=new Set(kfDoors109()),nm=lotName103(key);
  for(let t=1;t<=3;t++){const r=(r0+t)&3;if(r)SH.rot[key]=r;else delete SH.rot[key];lotSync103();if(kfDoors109().every(k=>base.has(k))){
      say('⟳ '+nm[0]+' '+nm[1]+' now faces '+kfFace109(lotOf103(key).ry)+(t>1?' (the other ways would block a door)':'')+'.');try{sfx('power')}catch(_){}try{saveGame(true)}catch(_){}return true}}
  if(r0)SH.rot[key]=r0;else delete SH.rot[key];lotSync103();say('⟳ '+nm[1]+' can only face this way here: turned any other way, a door could not be reached.');return false}
// moving keeps every door reachable too (the move is undone otherwise)
{const f=lotPut103;lotPut103=function(key,id){const old=SH.pos[key],base=new Set(kfDoors109()),r=f.apply(this,arguments);if(!r)return r;
  const bad=kfDoors109().filter(k=>!base.has(k));if(!bad.length)return r;
  if(bad.every(k=>k!==key&&SH.rot[k])){bad.forEach(k=>delete SH.rot[k]);lotSync103();return r}
  if(old)SH.pos[key]=old;else delete SH.pos[key];lotSync103();say('🚫 Not there: a door would be closed off. Try another plot, or turn a building first.');return false}}
$('xw').addEventListener('click',e=>{if(xwMode!='hold')return;const t=e.target.closest('[data-kmrot]');if(!t||t.disabled)return;kfRotate109(t.dataset.kmrot);rX()});
// saves: the stage follows the save (Sovereigns defeated and what is built)
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.kst=kf109().s;return o}}
{const f=x2Load;x2Load=function(s){KF109.s=-1;KF109.fresh={};let r;try{r=f.apply(this,arguments)}finally{try{kfApply109(true)}catch(e){console.warn('v109 load',e)}}return r}}
try{kfApply109(true)}catch(e){console.warn('v109 kingdom',e)}

// ---------------- 3. shop upgrades ----------------
var SHP109={lv:{}};
var SHPU109=[
  {k:'post',n:'Trading Post',i:'🪙',g:500,m:[['stone',10],['fiber',10]]},
  {k:'magic'},{k:'cook'},{k:'alch'},{k:'merchant'},{k:'trainer'},{k:'sage'},{k:'stable'}];
SHPU109.forEach(u=>{const o=SHOPS.find(q=>q.k==u.k);if(o){u.n=o.n;u.i=o.i;u.g=o.g;u.m=o.m}});
var SHP109_MAX=3,SHP109_G=[0,1.5,5,12],SHP109_X=[0,1,2.5,5],SHP109_B=[0,0,2,4];
function shpL109(k){return typeof SHP109!='undefined'&&SHP109&&SHP109.lv?Math.min(3,SHP109.lv[k]|0):0}
function shpOff109(k){return .05*shpL109(k)}
function shpP109(k,c){c=+c||0;const L=shpL109(k);return L&&c>0?Math.max(1,Math.round(c*(1-.05*L))):c}
function shpCost109(u,l){return {g:Math.round(u.g*SHP109_G[l]),m:u.m.map(([k,n])=>[k,Math.round(n*SHP109_X[l])]),b:SHP109_B[l]}}
function shpOpen109(k){return k=='post'||shopBuilt(k)}
function shpCan109(u){const l=shpL109(u.k);if(!shpOpen109(u.k))return [false,'Build the shop first'];if(l>=SHP109_MAX)return [false,'Fully upgraded'];const c=shpCost109(u,l+1);
  if(bossDone.size<c.b)return [false,'Needs '+c.b+' Sovereigns defeated'];if(gold<c.g)return [false,'Not enough gold'];if(!shHas(c.m))return [false,'Not enough materials'];return [true,'']}
// what a level does, per shop
function shpFx109(k,l){const off=5*l+'% off';
  if(k=='post')return shpGearN109(l)+' pieces of gear for sale'+(l?', better rarities, higher-tier eggs':'')+' · '+off;
  if(k=='magic')return (2+l)+' eggs for sale'+(l?', higher-tier eggs more often':'')+' · '+off;
  if(k=='merchant')return (3+l)+' wares'+(l?' (+'+CUR109.slice(0,l).map(x=>x=='egg'?'egg':'rune').join(', +')+'), higher-tier eggs more often':'')+' · '+off;
  if(k=='cook'||k=='alch')return (l?'crops '+l+' tier'+(l>1?'s':'')+' above your own in the market · ':'')+off;
  return off+' everything'}
// Steward rows (1880 calls this for the Trading Post and every built shop)
function shpUp109(k,P){const u=SHPU109.find(q=>q.k==k);if(!u||!u.g)return null;const l=shpL109(k),ok=shpCan109(u),c=l<SHP109_MAX?shpCost109(u,l+1):null;
  return {pips:'◆'.repeat(l)+'◇'.repeat(SHP109_MAX-l),d:'<br>'+(l?'Now: '+shpFx109(k,l):'Not upgraded yet'),
    cost:c?'Next: '+shpFx109(k,l+1)+'<br>Cost: '+costH(c.g,c.m)+(c.b?' · 👑 '+c.b+' Sovereigns':''):'<em style="color:#6ee7b7">✔ Fully upgraded</em>',
    btn:l<SHP109_MAX?[['⬆ Upgrade','data-shpu="'+k+'"','class="pri" '+(ok[0]&&!P?'':'disabled')+' title="'+ok[1]+'"']]:[]}}
function shpBuy109(k){const u=SHPU109.find(q=>q.k==k);if(!u)return;const ok=shpCan109(u);if(!ok[0])return say(ok[1]+'.');const l=shpL109(k)+1,c=shpCost109(u,l);
  shPay(c.g,c.m);SHP109.lv[k]=l;
  try{if(k=='post')stock2=null;if(k=='magic')mstock=null}catch(_){}
  banner('🏪 '+u.n.toUpperCase()+' · LEVEL '+l,shpFx109(k,l),'More wares, better wares, lower prices');try{sfx('power')}catch(_){}hud();ui();rX();try{saveGame(true)}catch(_){}}
$('xw').addEventListener('click',e=>{if(xwMode!='hold')return;const t=e.target.closest('[data-shpu]');if(!t||t.disabled)return;shpBuy109(t.dataset.shpu)});
// a line at the top of each shop's wares
function shpNote109(k){const l=shpL109(k),u=SHPU109.find(q=>q.k==k);if(!u)return '';
  return `<div class="shpnote${l?' on':''}">${l?`🏪 <b>Shop level ${l}</b> <span class="shpip">${'◆'.repeat(l)}${'◇'.repeat(SHP109_MAX-l)}</span> · <b>${5*l}% off</b>`+(l<SHP109_MAX?' · upgrade it further at the Stronghold Steward':''):'🏪 Upgrade this shop at the Stronghold Steward: more wares, better wares, 5% off per level.'}</div>`}
// better rarities: the shop rolls its own rarity (weights shift toward rare with each level) and genItem keeps at least that
var SHP109_RW=[62,26,9,2.6,.4];
function shpGearN109(L){return 6+2*(L|0)}
function shpGear109(lv,L){if(!L)return genItem(lv,{cls:hero.cls});const w=SHP109_RW.map((v,i)=>v*(i==0?Math.max(.1,1-.2*L):1+[0,.15,.5,.8,1][i]*L));
  let r=Math.random()*w.reduce((a,b)=>a+b,0),q=0;for(let i=0;i<w.length;i++){r-=w[i];if(r<0){q=i;break}}return genItem(lv,{cls:hero.cls,minR:q})}
function shpEgg109(T,L){const t=T<5&&Math.random()<.12*(L|0)?T+1:T;return rollEgg(t)}
// the Curio Shop: discounted prices, one extra ware per level, higher-tier eggs
var CUR109=['rune','egg','rune'];
{const f=visStock;visStock=function(){const st=f.apply(this,arguments);if(!st)return st;try{const L=shpL109('merchant'),T=Math.max(1,Math.min(5,tierOfLv(hero.lvl)));
  if(!st._b109){st._b109=1;st.forEach(s=>{if(s.k=='egg'&&!s.x109&&s.t<5&&Math.random()<.12*L){s.t++;s.p=150+s.t*120;s.p0=null}})}
  for(let j=0;j<L;j++){if(st.some(s=>s.x109==j+1))continue;const k=CUR109[j];
    if(k=='egg'){const t=T<5&&Math.random()<.12*L?T+1:T;st.push({k:'egg',t,p:150+t*120,r:RUNEK[0],x109:j+1})}
    else{const have=st.filter(s=>s.k=='rune').map(s=>s.r),pool=RUNEK.filter(r=>!have.includes(r));st.push({k:'rune',r:(pool.length?pool:RUNEK)[R(0,(pool.length?pool:RUNEK).length-1)],p:450,x109:j+1})}}
  st.forEach(s=>{if(s.p0==null)s.p0=s.p;s.p=shpP109('merchant',s.p0)})}catch(e){console.warn('v109 curio',e)}return st}}
// shop notes in the windows the shop code doesn't draw itself (Curio, Rune Sanctum, Beast Trainer; the Stable draws its own)
{const f=XR.visitor;XR.visitor=function(){const r=f.apply(this,arguments);try{const k=xwArg;if(k=='merchant'||k=='sage'||k=='trainer'){const B=$('xwB');if(B&&!B.querySelector('.shpnote'))B.insertAdjacentHTML('afterbegin',shpNote109(k))}}catch(e){console.warn('v109 note',e)}return r}}
// saves
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.shpu=Object.assign({},SHP109.lv);return o}}
{const f=x2Load;x2Load=function(s){SHP109.lv={};if(s&&s.shpu&&typeof s.shpu=='object')SHPU109.forEach(u=>{const v=s.shpu[u.k]|0;if(v>0)SHP109.lv[u.k]=Math.min(SHP109_MAX,v)});
  try{stock2=null;mstock=null}catch(_){}return f.apply(this,arguments)}}
document.head.insertAdjacentHTML('beforeend',`<style>
.shpnote{font-size:.74rem;color:var(--mut);padding:5px 8px;margin:0 0 6px;border:1px dashed rgba(201,162,74,.3);border-radius:5px}
.shpnote.on{color:var(--ink);border-style:solid;border-color:rgba(201,162,74,.45);background:rgba(201,162,74,.08)}.shpnote .shpip{color:#f0cc72;letter-spacing:2px}
#xw .kmplots{font-size:.74rem;color:var(--mut)}#xw .kmplots b{color:var(--ink)}
</style>`);
