// ================= v103 kingdom (2/5): houses and citizens =================
// Houses are built at the Stronghold Steward on any free lot (up to HS103_MAX). Two citizens move into each one.
// A citizen can be told to gather a material that grows in a zone you have completed (its Sovereign defeated):
// every trip takes HS103_TRIP ms and brings back a small load straight into your materials. Trips keep running while
// you are away (up to HS103_CAP of catch-up when the game is opened again).
// In Duskhold you can watch them: a gatherer walks from the house to the south gate with a tool, is away on the road,
// and comes back with a full sack; an idle citizen strolls between the streets and stops for a chat.
// Paths: A* on the town's own collision (solid / tcHit), one cell per tile, smoothed by line of sight.
// Saved in x2Save: khs (houses), kcit (citizens).
var HS103_MAX=6,HS103_TRIP=8*60000,HS103_CAP=4*3600000;
var HS103={h:[],cit:[],g:{},lastCatch:0};
var HS103_NM=['Ashcroft','Elmhollow','Bracken','Mossgate','Thornbury','Wrenfield','Cinderleigh','Stonemere','Rookwood','Fallowmere'];
var HS103_CN=['Mara','Tomas','Edda','Gorm','Ilse','Bram','Wenna','Osric','Hild','Corin','Ysolde','Aldo','Sabine','Fenn','Greta','Lorcan','Nell','Piet','Runa','Haldor'];
var HS103_LOAD={wood:2,stone:2,fiber:2,petals:2,glowcap:2,bone:2,clay:2,iron:1,crystal:1};
function hsCost103(n){return {g:300+200*n,m:[['wood',15+8*n],['stone',12+6*n]]}}
// ---------- which materials each zone gives (from its own nodes) ----------
var ZMAT103=null;
function zMat103(){if(ZMAT103)return ZMAT103;const Z=PMAP.map(()=>new Set());
  const kind={rock:'stone',grave:'stone',pillar:'stone',crystal:'crystal',bush:'fiber',flower:'petals',mush:'glowcap',bones:'bone'};
  MAP.props.forEach(q=>{const r=regionAt(q[0],q[1]);if(r<0)return;const m=kind[q[2]];if(m){Z[r].add(m);if(m=='stone')Z[r].add('iron')}});
  PMAP.forEach((p,i)=>{let tr=0,wt=0;for(let y=p.y0;y<p.y0+PMH&&!(tr&&wt);y+=2)for(let x=p.x0;x<p.x0+PMW;x+=2){const t=MAP[y][x];if(t=='#')tr=1;else if(t=='~'&&!BIOMES[MAP.bio[y][x]].lava)wt=1}
    if(tr)Z[i].add('wood');if(wt)Z[i].add('clay')});
  ZMAT103=Z;return Z}
// materials a citizen may gather now: [key, [zone names]]
function hsMats103(){const Z=zMat103(),o={};[...bossDone].forEach(i=>{if(!Z[i])return;Z[i].forEach(m=>{(o[m]=o[m]||[]).push(PMAP[i].n)})});
  return Object.keys(RES).filter(k=>o[k]).map(k=>[k,o[k]])}
// ---------- houses ----------
function hsKit103(k,v){const st=['plaster','stone','log'][v],wc=[0xd8ccb0,0x7a746a,0x6a4a30][v],o={w:4.4,d:3.8,h:2.3,zc:-1.4,st,wc};TWN100_body(k,o);
  const roof=[TWC.thatch,0x45403e,0x6a4a32][v];
  if(v==2){// a timber upper floor jettied over the logs
    k.at(0,0,-1.4,()=>{const U=2.35,V=2.05;k.as('wood',()=>k.p('c',TWC.woodD,'box',0,2.36,0,U*2+.1,.1,V*2+.1,0,0,0,.02));
      twPlanks(k,0x7a5a3a,-U,V,U,V,2.4,3.6,.24);twPlanks(k,0x7a5a3a,-U,-V,U,-V,2.4,3.6,.24);twPlanks(k,0x7a5a3a,-U,-V,-U,V,2.4,3.6,.24);twPlanks(k,0x7a5a3a,U,-V,U,V,2.4,3.6,.24);
      twWindow(k,-1.1,3.0,V+.04,.5,.5,0,0xffd27a);twWindow(k,1.1,3.0,V+.04,.5,.5,0,0xffd27a);twGable(k,roof,4.8,4.2,1.4,.32,3.6)})}
  else TWN100_roof(k,o,roof,v?1.5:1.8,v?'z':'x',v?0x2e2a2a:0);
  TWN100_chim(k,v==1?-1.2:1.4,-2.6,1.2,v==2?4.6:4.0,v==1?TWC.stoneD:0x7a6a5a);
  twDoor(k,-.9,.36,.52,.95,1.65,0);twWindow(k,1.0,1.35,.54,.8,.6,0,0xffd27a);
  // flower box under the window, a bench by the door, a lantern, a little vegetable patch with a low fence, firewood
  k.as('wood',()=>k.p('c',0x5a3c24,'box',1.0,.95,.68,.9,.16,.2,0,0,0,.02));[0,1,2,3].forEach(i=>k.p('c',[0xc83a5a,0xe8c84a,0xb070ff,0xe8e0d0][(i+v)%4],'sph',.7+i*.2,1.08,.68,.08,.07,.08,0,i,0,.04));
  k.as('board',()=>k.p('c',0x6a4a2e,'box',.2,.45,.85,.9,.07,.3,0,0,0,.05));[-.2,.6].forEach(x=>k.as('wood',()=>k.L('c',TWC.woodD,[x,0,.85],[x,.42,.85],.05,'box')));
  TWN100_lantern(k,-.25,1.85,.7);
  k.as('dirt',()=>k.p('c',0x4a3a28,'box',1.35,.04,2.15,1.6,.08,1.0,0,0,0,.02));
  for(let i=0;i<6;i++)k.p('c',[0x4a7a3a,0x5a8a44,0x3e6a34][i%3],'ico',.85+(i%3)*.5,.18,1.85+(i>2?.55:0),.16,.14,.16,0,i,0,.08);
  const fp=[[.45,1.55],[2.25,1.55],[2.25,2.75],[.45,2.75]];for(let i=0;i<4;i++){const a=fp[i],b=fp[(i+1)%4];if(i==3)continue;k.as('bark',()=>{k.L('c',TWC.woodD,[a[0],0,a[1]],[a[0],.55,a[1]],.04,'log')});k.as('wood',()=>k.L('c',TWC.wood,[a[0],.4,a[1]],[b[0],.4,b[1]],.03,'cyl6'))}
  for(let i=0;i<6;i++)k.as('bark',()=>k.L('c',[0x5a3a22,0x6a4a2a][i%2],[-2.0,.1+Math.floor(i/3)*.19,.95+(i%3)*.2],[-1.2,.1+Math.floor(i/3)*.19,.95+(i%3)*.2],.09,'log'))}
var FP103H=[-2.5,2.5,-3.5,.9];
function hsBuild103(i){const h=HS103.h[i],l=lotOf103('h:'+i);if(!h||!l)return;const T=TOWNS[0],key='HOUSE103|'+h.v;let k=null;if(!twHas(key)){k=twKit(1031+h.v*13);hsKit103(k,h.v)}
  const g=twGroup(k,key),[x,z]=lotW103(l,0,0);g.position.set(x,T.ph,z);g.rotation.y=l.ry;g.name='house_'+i;
  sign(g,[{t:h.nm,f:'700 46px'},{t:'🏠 home of '+hsWho103(i),f:'600 24px'}],1.9,.46,'#2a1c12','#f4e2c0','#c9a24a',1.0,2.05,.6,0,512,128);scene.add(g);
  const c=[];const box=(lx,lz,hx,hz)=>{const [X,Z]=lotW103(l,lx,lz),s=Math.abs(Math.sin(l.ry))>.5;c.push(s?{x:X,z:Z,hx:hz,hz:hx}:{x:X,z:Z,hx,hz})};
  box(1.35,2.15,.85,.6);box(-1.6,1.15,.45,.35);c.forEach(q=>T.col.push(q));
  HS103.g[i]={g,c,lot:l.id};lotMark103('h:'+i,lotTiles103(l,...FP103H));lotEject103(l)}
function hsDrop103(i){const o=HS103.g[i],T=TOWNS[0];if(!o)return;scene.remove(o.g);o.c.forEach(q=>{const j=T.col.indexOf(q);if(j>=0)T.col.splice(j,1)});lotMark103('h:'+i,[]);delete HS103.g[i]}
function hsWho103(i){const L=HS103.cit.filter(c=>c.h===i).map(c=>c.n);return L.length?L.join(' & '):'nobody yet'}
function hs103Sync(){if(typeof HS103=="undefined"||!HS103)return;HS103.h.forEach((h,i)=>{const l=lotOf103('h:'+i),o=HS103.g[i];if(o&&(!l||o.lot!==l.id||o.who!==hsWho103(i)))hsDrop103(i);if(l&&!HS103.g[i]){hsBuild103(i);HS103.g[i].who=hsWho103(i)}});
  for(const i in HS103.g)if(!HS103.h[+i])hsDrop103(+i);CZ103.ver=-1}
function hsCan103(){const n=HS103.h.length,c=hsCost103(n);if(n>=HS103_MAX)return [false,'Every house is built'];if(gold<c.g)return [false,'Not enough gold'];if(!shHas(c.m))return [false,'Not enough materials'];return [true,'']}
// build a house on lot id: pay, raise it, two citizens move in
function hsBuy103(id){const ok=hsCan103();if(!ok[0]){say(ok[1]+'.');return false}if(!lotFree103(id))return false;const n=HS103.h.length,c=hsCost103(n);shPay(c.g,c.m);
  const used=new Set(HS103.h.map(h=>h.nm)),nm=(HS103_NM.find(q=>!used.has(q+' House'))||'New')+' House';HS103.h.push({nm,v:n%3});SH.pos['h:'+n]=id;
  const taken=new Set(HS103.cit.map(c=>c.n)),pool=HS103_CN.filter(q=>!taken.has(q));for(let j=0;j<2;j++){const k=pool.splice(Math.floor(Math.random()*pool.length),1)[0]||('Citizen '+(HS103.cit.length+1));
    HS103.cit.push({n:k,h:n,task:'',t0:0,lk:Math.floor(Math.random()*1e6)})}
  lotSync103();const who=hsWho103(n);banner('🏠 '+nm.toUpperCase(),who+' move in','Give them work at the Stronghold Steward');sfx('power');hud();ui();try{saveGame(true)}catch(_){}return true}
// ---------- gathering trips ----------
function czTask103(c,m){if(m&&!hsMats103().some(q=>q[0]==m))return;c.task=m||'';c.t0=m?Date.now():0;c.vt=null;try{saveGame(true)}catch(_){}}
function czLeft103(c){return c.task&&c.t0?Math.max(0,HS103_TRIP-(Date.now()-c.t0)):0}
function czTick103(){const now=Date.now(),av=new Set(hsMats103().map(q=>q[0])),got={};let trips=0;
  HS103.cit.forEach(c=>{if(!c.task)return;if(!av.has(c.task)){c.task='';c.t0=0;return}if(!c.t0)c.t0=now;if(now-c.t0>HS103_CAP)c.t0=now-HS103_CAP;
    while(now-c.t0>=HS103_TRIP){c.t0+=HS103_TRIP;const n=HS103_LOAD[c.task]||1;mats[c.task]=(mats[c.task]||0)+n;got[c.task]=(got[c.task]||0)+n;trips++;c.vt=null;
      if(trips<=3)HS103.lastMsg=c}});
  if(!trips)return;const line=Object.keys(got).map(k=>matInfo(k)[1]+' '+got[k]+' '+matInfo(k)[0]).join(' · ');
  if(trips==1&&HS103.lastMsg)say('🏘️ '+HS103.lastMsg.n+' brought back '+line);else say('🏘️ Your citizens brought back '+line);hsDirty&&hsDirty();try{if(typeof xwMode!='undefined'&&xwMode=='hold'&&!$('xw').classList.contains('hide'))rX()}catch(_){}}
setInterval(()=>{try{czTick103()}catch(e){console.warn('v103 citizens',e)}},1000);
// ---------- saves ----------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.khs=HS103.h.map(h=>({nm:h.nm,v:h.v}));o.kcit=HS103.cit.map(c=>({n:c.n,h:c.h,task:c.task,t0:c.t0,lk:c.lk}));return o}}
{const f=x2Load;x2Load=function(s){for(const i in HS103.g)hsDrop103(+i);HS103.h=[];HS103.cit=[];czClear103();
  if(s&&Array.isArray(s.khs))s.khs.slice(0,HS103_MAX).forEach(h=>{if(h&&typeof h.nm=='string')HS103.h.push({nm:h.nm.slice(0,40),v:Math.max(0,Math.min(2,h.v|0))})});
  if(s&&Array.isArray(s.kcit))s.kcit.forEach(c=>{if(c&&typeof c.n=='string'&&HS103.h[c.h|0]&&HS103.cit.length<HS103_MAX*2)HS103.cit.push({n:c.n.slice(0,24),h:c.h|0,task:RES[c.task]?c.task:'',t0:+c.t0||0,lk:c.lk|0})});
  return f.apply(this,arguments)}}
// a house is solid and lot-bound: the lot table must know it is built
// (lotBuilt103 reads HS103.h; lotAuto103 drops any 'h:' key whose house is gone)

// ---------- walking the streets: grid A* on the town's collision ----------
var CZ103={ver:-1,grid:null,x0:-37,z0:-22,nx:75,nz:84,cols:0,live:[],on:false,last:0};
function czWalk103(X,Z){return !solid(X,Z)&&!tcHit(X,Z)}
function czGrid103(){const T=TOWNS[0],sig=KL103.ver+'|'+T.col.length;if(CZ103.grid&&CZ103.ver===sig)return CZ103.grid;const G=new Uint8Array(CZ103.nx*CZ103.nz);
  for(let j=0;j<CZ103.nz;j++)for(let i=0;i<CZ103.nx;i++){const X=T.cx+CZ103.x0+i,Z=T.cy+CZ103.z0+j;G[j*CZ103.nx+i]=czWalk103(X,Z)?1:0}
  CZ103.grid=G;CZ103.ver=sig;CZ103.live.forEach(c=>c.path=null);return G}
function czNear103(G,i,j){const nx=CZ103.nx,nz=CZ103.nz;for(let r=0;r<5;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){const a=i+di,b=j+dj;if(a>=0&&b>=0&&a<nx&&b<nz&&G[b*nx+a])return [a,b]}return null}
// line of sight on the cached grid (a few samples across the body width)
function czG103(x,z){const T=TOWNS[0],G=CZ103.grid,i=Math.round(x-T.cx-CZ103.x0),j=Math.round(z-T.cy-CZ103.z0);return i>=0&&j>=0&&i<CZ103.nx&&j<CZ103.nz&&G[j*CZ103.nx+i]===1}
function czLos103(a,b){const d=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(d/.3);for(let k=1;k<n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(!czG103(x,z)||!czG103(x+.3,z)||!czG103(x-.3,z)||!czG103(x,z+.3)||!czG103(x,z-.3))return false}return true}
// world points → smoothed world path (null when there is none)
function czPath103(ax,az,bx,bz){const T=TOWNS[0],G=czGrid103(),nx=CZ103.nx,nz=CZ103.nz,toI=(x,z)=>[Math.round(x-T.cx-CZ103.x0),Math.round(z-T.cy-CZ103.z0)];
  let s=toI(ax,az),e=toI(bx,bz);if(s[0]<0||s[1]<0||s[0]>=nx||s[1]>=nz||e[0]<0||e[1]<0||e[0]>=nx||e[1]>=nz)return null;s=czNear103(G,s[0],s[1]);e=czNear103(G,e[0],e[1]);if(!s||!e)return null;
  const N=nx*nz,gS=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),cl=new Uint8Array(N),H=[],si=s[1]*nx+s[0],ei=e[1]*nx+e[0];
  const h=k=>{const dx=Math.abs(k%nx-e[0]),dz=Math.abs(((k/nx)|0)-e[1]);return Math.max(dx,dz)+.414*Math.min(dx,dz)};
  const push=(k,f)=>{H.push([f,k]);let i=H.length-1;while(i>0){const p=(i-1)>>1;if(H[p][0]<=H[i][0])break;[H[p],H[i]]=[H[i],H[p]];i=p}};
  const pop=()=>{const t=H[0],l=H.pop();if(H.length){H[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let m=i;if(a<H.length&&H[a][0]<H[m][0])m=a;if(b<H.length&&H[b][0]<H[m][0])m=b;if(m==i)break;[H[m],H[i]]=[H[i],H[m]];i=m}}return t};
  gS[si]=0;push(si,h(si));let it=0;
  while(H.length&&it++<N*2){const [,k]=pop();if(cl[k])continue;cl[k]=1;if(k===ei)break;const i=k%nx,j=(k/nx)|0;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=nz)continue;const q=b*nx+a;if(!G[q]||cl[q])continue;
      if(di&&dj&&(!G[j*nx+a]||!G[b*nx+i]))continue;const g=gS[k]+(di&&dj?1.414:1);if(g<gS[q]){gS[q]=g;from[q]=k;push(q,g+h(q))}}}
  if(from[ei]<0&&ei!==si)return null;const L=[];for(let k=ei;k>=0;k=from[k]){L.push([T.cx+CZ103.x0+k%nx,T.cy+CZ103.z0+((k/nx)|0)]);if(k===si)break}L.reverse();
  L[0]=[ax,az];L.push([bx,bz]);
  const out=[L[0]];let a=0;while(a<L.length-1){let b=Math.min(L.length-1,a+40);while(b>a+1&&!czLos103(L[a],L[b]))b--;out.push(L[b]);a=b}return out}
function czLen103(P){let s=0;for(let i=1;i<P.length;i++)s+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return s}
function czAt103(P,d){for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=l||i==P.length-1){const t=l?Math.min(1,d/l):1;return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[0]-a[0],b[1]-a[1])]}d-=l}const q=P[P.length-1];return [q[0],q[1],0]}
// ---------- citizen models ----------
var CZ103_ROBE=[0x5a4a3a,0x3a4a5a,0x4a3a2a,0x5a3a3a,0x3a5040,0x6a5a40,0x4a4a52,0x5a4060],CZ103_HAT=['','cap','','','cap',''];
function czLook103(c){const r=n=>(c.lk>>n)&7;return {robe:CZ103_ROBE[r(0)],trim:[0x2a1a12,0x8a6a2a,0x3a2a1a,0xc9a24a,0x1a2a3a,0x6a3a2a,0x2a2a30,0x5a4a2a][r(3)],hat:CZ103_HAT[r(6)%6],hatC:[0x3a2a1a,0x5a4a2a,0x2a3a2a,0x4a2a2a][r(9)&3],apron:r(11)<2?1:0}}
function czModel103(c){const o=czLook103(c),rig=idlNpcBody(o),g=new THREE.Group();rig.meshes.forEach(m=>g.add(m));g.bones=rig.bones;g.userData.psNo=1;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:txTex([{t:c.n,f:'700 30px'}],256,56,'rgba(10,14,20,.7)','#f4e9c8','rgba(255,214,120,.5)'),transparent:true,depthWrite:false}));
  sp.scale.set(1.1,.24,1);sp.position.set(0,2.0,0);g.add(sp);g.userData.lab=sp;
  // a sack on the back (coming home) and a tool in the hand (going out)
  const sk=new THREE.Mesh(new THREE.IcosahedronGeometry(.15,0),new THREE.MeshLambertMaterial({color:0x8a6a44}));sk.scale.set(1,1.2,.75);sk.position.set(0,.06,-.15);sk.visible=false;
  (g.bones.chest||g).add(sk);g.userData.sack=sk;
  const tl=new THREE.Group(),hd=new THREE.Mesh(new THREE.CylinderGeometry(.02,.022,.62,5),new THREE.MeshLambertMaterial({color:0x5a3a22}));tl.add(hd);
  const bl=new THREE.Mesh(new THREE.BoxGeometry(.05,.12,.2),new THREE.MeshLambertMaterial({color:0x6a6a72}));bl.position.set(0,.27,.08);tl.add(bl);tl.position.set(0,-.05,.05);tl.rotation.x=1.2;tl.visible=false;
  (g.bones.aR2||g).add(tl);g.userData.tool=tl;
  g.userData.rest=czRest103(g);return g}
function czRest103(g){const R={};for(const k in g.bones){const b=g.bones[k];R[k]=[b.rotation.x,b.rotation.y,b.rotation.z,b.position.x,b.position.y,b.position.z]}return R}
function czReset103(g){const R=g.userData.rest;for(const k in R){const b=g.bones[k],r=R[k];b.rotation.set(r[0],r[1],r[2]);b.position.set(r[3],r[4],r[5])}}
// procedural walk on the town-folk skeleton (absolute from the rest pose): legs, knees, ankles, arm swing, a bob
function czWalkPose103(g,ph,amp){const B=g.bones,R=g.userData.rest;czReset103(g);const s=Math.sin(ph),c=Math.cos(ph),a=amp||1;
  const r=(k,x,y,z)=>{const b=B[k];if(!b)return;b.rotation.x+=x||0;b.rotation.y+=y||0;b.rotation.z+=z||0};
  r('lh0',-.42*s*a);r('rh0',.42*s*a);r('lh1',.55*Math.max(0,-c)*a+.08);r('rh1',.55*Math.max(0,c)*a+.08);r('lh2',.2*s*a);r('rh2',-.2*s*a);
  // arms hang (unfolded) and swing against the legs
  r('aL0',.3*s*a,0,.03);r('aR0',-.3*s*a,0,-.03);r('aL1',-.3-.12*Math.max(0,-s)*a,0,-.62);r('aR1',-.3-.12*Math.max(0,s)*a,0,.62);
  r('spine',0,.06*s*a,0);r('chest',.04,-.1*s*a,0);r('head',.02,.05*s*a,0);
  if(B.pelvis)B.pelvis.position.y=R.pelvis[4]+Math.abs(c)*.025*a-.012}
// ---------- citizens in town ----------
function czClear103(){CZ103.live.forEach(o=>scene.remove(o.g));CZ103.live=[];CZ103.on=false}
function czDoor103(c){const l=lotOf103('h:'+c.h);return l?lotDoor103(l):null}
function czGate103(){const T=TOWNS[0];return [T.cx,T.cy+(T.sz||TS)+3.5]}
function czSpawn103(){const T=TOWNS[0];czClear103();CZ103.on=true;HS103.cit.forEach((c,i)=>{const d=czDoor103(c);if(!d)return;const g=czModel103(c);g.position.set(d[0],T.ph,d[1]);scene.add(g);
    CZ103.live.push({c,g,i,mode:'',path:null,d:0,wait:1+Math.random()*4,ph:Math.random()*6,ry:0,seed:i*7+3})})}
function czRand103(o){o.seed=(o.seed*16807+11)%2147483647;return o.seed/2147483647}
// a few street spots an idle citizen may stroll to (lot doors and the plaza)
function czSpots103(){const T=TOWNS[0],L=LOT103.map(l=>lotDoor103(l));[[-12,-2],[12,-2],[0,6],[-18,9],[18,9],[0,18],[-4,30],[4,40]].forEach(([x,z])=>L.push([T.cx+x,T.cy+z]));return L}
function czStep103(o,dt,now){const g=o.g,c=o.c,T=TOWNS[0],door=czDoor103(c);if(!door){g.visible=false;return}
  const sp=1.55,u=g.userData;let walk=false;
  if(c.task&&c.t0){// a trip: out to the gate, away, back home
    if(!o.pOut||o.pv!==CZ103.ver){const gt=czGate103();o.pOut=czPath103(door[0],door[1],gt[0],gt[1]);o.pv=CZ103.ver;o.lOut=o.pOut?czLen103(o.pOut):0}
    const el=(Date.now()-c.t0)/1000,dO=o.lOut/sp,tot=HS103_TRIP/1000;
    if(!o.pOut){g.visible=el<4;g.position.set(door[0],T.ph,door[1]);u.tool.visible=true;u.sack.visible=false}
    else if(el<dO){const p=czAt103(o.pOut,el*sp);g.visible=true;g.position.set(p[0],T.ph,p[1]);o.ry=p[2];walk=true;u.tool.visible=true;u.sack.visible=false;o.mode='out'}
    else if(el>tot-dO){const p=czAt103(o.pOut,Math.max(0,(tot-el)*sp));g.visible=true;g.position.set(p[0],T.ph,p[1]);o.ry=p[2]+Math.PI;walk=true;u.tool.visible=false;u.sack.visible=true;o.mode='back'}
    else{g.visible=false;o.mode='away'}}
  else{u.tool.visible=false;u.sack.visible=false;g.visible=true;
    if(o.mode=='walk'&&o.path){o.d+=sp*.8*dt;const L=o.len;const p=czAt103(o.path,Math.min(o.d,L));g.position.set(p[0],T.ph,p[1]);o.ry=p[2];walk=true;if(o.d>=L){o.mode='';o.wait=4+czRand103(o)*9;o.ry+=czRand103(o)*2-1}}
    else{o.wait-=dt;if(o.wait<=0){const S=czSpots103(),home=czRand103(o)<.35,t=home?door:S[Math.floor(czRand103(o)*S.length)];
        if(Math.hypot(t[0]-door[0],t[1]-door[1])<34){const P=czPath103(g.position.x,g.position.z,t[0],t[1]);if(P&&czLen103(P)>.5){o.path=P;o.len=czLen103(P);o.d=0;o.mode='walk'}else o.wait=3}else o.wait=1}}}
  // turn smoothly toward the heading
  let dr=o.ry-g.rotation.y;while(dr>Math.PI)dr-=6.283;while(dr<-Math.PI)dr+=6.283;g.rotation.y+=dr*Math.min(1,dt*8);
  if(!g.visible)return;const near=Math.hypot(g.position.x-pl.position.x,g.position.z-pl.position.z);u.lab.visible=near<9;
  if(near>40)return; // too far to bother animating
  if(walk){o.ph+=dt*sp*3.6;czWalkPose103(g,o.ph,1);o.idl=0}
  else{if(!o.idl){czReset103(g);o.idl=1}try{idlNpc(g,now)}catch(_){}}}
{const f=townTick;townTick=function(now,pp){f.apply(this,arguments);try{const inT=townAt(pp.x,pp.z,8)==0;
  if(!inT){if(CZ103.on)czClear103();return}
  if(!CZ103.on||CZ103.live.length!==HS103.cit.filter(c=>lotOf103("h:"+c.h)).length)czSpawn103();
  czGrid103();const dt=Math.min(.1,Math.max(0,(now-(CZ103.last||now))/1000));CZ103.last=now;CZ103.live.forEach(o=>czStep103(o,dt,now))}catch(e){if(!CZ103.err){CZ103.err=1;console.warn('v103 citizens',e)}}}}
// houses have a walk-up prompt at the door: open the Steward's window on the citizens
{const f=townPortalPrompt;townPortalPrompt=function(T){if(T===TOWNS[0]){const p=pl.position;for(let i=0;i<HS103.h.length;i++){const l=lotOf103('h:'+i);if(!l)continue;const d=lotDoor103(l);
    if(Math.hypot(p.x-d[0],p.z-d[1])<2.2)return {label:'F · '+HS103.h[i].nm+' · '+hsWho103(i),fn:()=>{KM103.focus='cit';KM103.house=i;openX('hold')}}}}return f.apply(this,arguments)}}
var KM103=KM103||{};
