// ================= v56: Duskhold, the floating stronghold — portals, map progression and wave trials =================
// ---- the old open-world systems that no longer fit ----

DUNS.length=0;
{const b=$('mntBtn');if(b)b.style.setProperty('display','none','important')}
BOSSES.forEach((b,i)=>{b.zone=i+1;b.guard=false;b.ult=i>=1?2:0});
// ---- levels rise along each map's road ----
function pmProg(p,x,z){let bi=0,bd=1e9;const P=p.path;for(let i=0;i<P.length;i+=2){const d=(P[i][0]-x)**2+(P[i][1]-z)**2;if(d<bd){bd=d;bi=i}}return bi/(P.length-1)}
// v106: along the road of the instance you are in, within that instance's share of the zone's levels
function zoneLv(x,y){const I=insAt(Math.round(x),Math.round(y));if(!I)return 1;if(!I.fld)return I.lv[0];const q=pmProg(I,x,y);return Math.max(1,Math.min(MAXLV,Math.round(I.lv[0]+(I.lv[1]-I.lv[0])*q)))}
const curMap=()=>regionAt(Math.round(pl.position.x),Math.round(pl.position.z));
const curIns=()=>insAt(Math.round(pl.position.x),Math.round(pl.position.z));
function areaName(){
  if(townAt(pl.position.x,pl.position.z,0)>=0)return '🏰 Duskhold · Safe haven';
  const r=curMap();if(r<0)return '🌀 Duskhold · Outer roads';
  const p=PMAP[r];if(WV&&WV.pi==r)return '⚔️ '+p.n+' · Wave Trial '+Math.min(WV.n,WV.w)+'/'+WV.n;
  const I=curIns(),C=campAt(pl.position.x,pl.position.z,CAMP_R);if(!I.fld)return p.ic+' '+I.n;return (C?'⛺ '+C.th.n+' · ':p.ic+' ')+I.n+' · Lv '+zoneLv(pl.position.x,pl.position.z)+' ('+I.lv[0]+'–'+I.lv[1]+')';
}
function townWatch(){const ti=townAt(pl.position.x,pl.position.z,0);if(ti==curTown)return;curTown=ti;if(ti>=0){const T=TOWNS[ti];home=T;if(!T.seen){T.seen=1;banner('🏰 DUSKHOLD','The last stronghold, adrift above the void','The Grand Square · shops, tavern and the South Ward · the Portal Road leads south')}}}
// zone recommendations follow the maps now
var MREC=['D','C','C','B','A','A'];
function zoneRec(){const r=curMap();if(r<1)return null;const p=PMAP[r];return {b:{n:p.n},g:MREC[r],p:recPower(p.lv[0])}}
// ---- the Portal Court ----
const pUnlocked=i=>i==0||bossDone.has(i-1)||(typeof CHEAT!='undefined'&&CHEAT.portals),pDone=i=>bossDone.has(i);
var PORT=[];
{const C=PCOURT,stone=sm(0x6a6470),dark=sm(0x3a3640);
  // court floor ring and a central rune stone
  const fl=new THREE.Mesh(new THREE.RingGeometry(3,17.5,48,2),new THREE.MeshStandardMaterial({color:0x4a4652,roughness:.95}));fl.rotation.x=-Math.PI/2;fl.position.set(C[0],GH(C[0],C[1])+.04,C[1]);fl.receiveShadow=true;scene.add(fl);
  {const g=new THREE.Group();g.position.set(C[0],GH(C[0],C[1]),C[1]);scene.add(g);TQ(g,G_CYL,dark,0,.3,0,1.6,.6,1.6);TQ(g,G_OCT,gmat(0xb89aff),0,1.6,0,.5,.8,.5).castShadow=false;CBLK.add(C[1]*W+C[0])}
  PMAP.forEach((p,i)=>{const a=-2.35+i*(4.7/5),x=C[0]+Math.cos(a)*13,z=C[1]+Math.sin(a)*13,g=new THREE.Group(),y=GH(x,z),ry=Math.atan2(C[0]-x,C[1]-z);
    g.position.set(x,y,z);g.rotation.y=ry;scene.add(g);
    TQ(g,G_BOX,stone,-1.25,1.6,0,.5,3.2,.5);TQ(g,G_BOX,stone,1.25,1.6,0,.5,3.2,.5);TQ(g,G_BOX,dark,0,3.35,0,3.2,.4,.6);TQ(g,G_BOX,sm(0x5a5662),0,.1,0,3.4,.2,1.4);
    [-1.25,1.25].forEach(px=>TQ(g,G_OCT,gmat(p.col),px,3.35,.34,.16,.2,.08).castShadow=false);
    const disc=new THREE.Mesh(new THREE.CircleGeometry(1.1,32),new THREE.MeshBasicMaterial({color:p.col,transparent:true,opacity:.75,side:THREE.DoubleSide}));disc.position.set(0,1.62,0);disc.scale.y=1.35;g.add(disc);
    const sw=new THREE.Mesh(new THREE.RingGeometry(.35,1.08,24,1,0,4),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.4,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));sw.position.set(0,1.62,.02);sw.scale.y=1.35;g.add(sw);
    const ch=new THREE.Group();[-.6,.6].forEach(r=>{const b=new THREE.Mesh(new THREE.BoxGeometry(2.6,.08,.08),sm(0x2a2a30));b.rotation.z=r;b.position.set(0,1.62,.12);ch.add(b)});g.add(ch);
    sign(g,[{t:p.ic+' '+p.n,f:'700 40px'},{t:'Lv '+p.lv[0]+'–'+p.lv[1],f:'600 26px'}],2.4,.62,'#1a1424','#efe6ff',null,0,4.34,.0,0,512,140);
    [-1.25,1.25].forEach(lx=>{const wx=x+Math.cos(ry)*lx,wz=z-Math.sin(ry)*lx;CBLK.add(Math.round(wz)*W+Math.round(wx))});
    PORT.push({i,x,z,g,disc,sw,ch})});
}
function portalRefresh(){PORT.forEach(P=>{const u=pUnlocked(P.i),d=pDone(P.i);P.ch.visible=!u;P.disc.material.color.setHex(u?PMAP[P.i].col:0x2a2a34);P.disc.material.opacity=u?.78:.5;P.sw.visible=u})}
portalRefresh();
TANIM.push({x:PCOURT[0],z:PCOURT[1],f:now=>{PORT.forEach((P,k)=>{if(P.sw.visible){P.sw.rotation.z=now*.0018+k;P.disc.material.opacity=.66+.12*Math.sin(now*.003+k)}})}});
// ---- return portals at each map's start, and a way home in each boss arena once it is cleared ----
INSL.forEach(I=>{if(!I.tri)I.en=I.path[16].slice()});PMAP.forEach(p=>{p.en=p.ins[0].en});
var RPORT=[];
function smallPortal(x,z,col,label){const g=new THREE.Group(),y=GH(x,z);g.position.set(x,y,z);scene.add(g);const st=sm(0x5a5662);
  TQ(g,G_BOX,st,-.9,1.2,0,.36,2.4,.36);TQ(g,G_BOX,st,.9,1.2,0,.36,2.4,.36);TQ(g,G_BOX,st,0,2.5,0,2.3,.3,.42);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(.8,28),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.75,side:THREE.DoubleSide}));disc.position.set(0,1.2,0);disc.scale.y=1.3;g.add(disc);
  sign(g,[{t:label,f:'700 36px'}],1.8,.36,'#1a1424','#efe6ff',null,0,3.32,0,0);return {g,x,z,disc}}
// v106: a Duskhold portal at every instance's entrance; at the end of instances I and II a gateway to the next instance
INSL.forEach(I=>{if(I.tri)return;const n=I.path[26],e=I.en,dx=n[0]-e[0],dz=n[1]-e[1],L=Math.hypot(dx,dz)||1,x=e[0]-dx/L*5,z=e[1]-dz/L*5;
  const a=smallPortal(x-dz/L*4,z+dx/L*4,0x9a6aff,'🌀 Duskhold');a.g.rotation.y=Math.atan2(dx,dz);a.pi=I.z;a.ig=I.g;a.k='home';RPORT.push(a);
  if(I.fld){const N=PMAP[I.z].ins[I.k+1],P=I.path,q=P[Math.max(0,P.length-14)],gx=I.ba[0],gz=I.ba[1],t=smallPortal(gx,gz,PMAP[I.z].col,'🌀 '+N.n);
    t.g.rotation.y=Math.atan2(q[0]-gx,q[1]-gz);t.g.scale.setScalar(1.35);t.pi=I.z;t.ig=I.g;t.k='next';t.to=N;RPORT.push(t)}});
PMAP.forEach((p,i)=>{
  const b=smallPortal(p.ba[0],p.ba[1]+10,0xffd060,'🌀 Return home');b.pi=i;b.k='exit';b.g.visible=pDone(i);RPORT.push(b);
  const w=smallPortal(p.wa[0],p.wa[1]+11,0xff6a40,'🚪 Leave trial');w.pi=i;w.k='wave';RPORT.push(w)});
function rportRefresh(){RPORT.forEach(r=>{if(r.k=='exit')r.g.visible=pDone(r.pi)})}
// ---- travel ----
function toPos(x,z,face){pl.position.set(x,0,z);if(face!=null)camYaw=face;fols.forEach((f,k)=>{if(f)f.position.set(x+(k?1.4:-1.4),0,z+1)});snapCam();curTown=-2}
// v106: k = the instance (0 = I); every instance starts at its own entrance
function enterMap(i,k){if(AF)return;const p=PMAP[i],I=p.ins[k|0]||p.ins[0];fadeTo(()=>{insArrive(I)})}
function insArrive(I){const p=PMAP[I.z],n=I.path[30];toPos(I.en[0],I.en[1],Math.atan2(I.en[0]-n[0],I.en[1]-n[1]));
  banner(p.ic+' '+I.n.toUpperCase(),p.sub,I.den?BOSSES[I.z].name+' · '+BOSSES[I.z].title:'Enemy levels '+I.lv[0]+'–'+I.lv[1]+' · '+(I.k==PMF-1?'the way to '+BOSSES[I.z].name+'’s den waits at the end of the road':'a gateway to '+p.ins[I.k+1].n+' waits at the end of the road'))}
function goHome(){if(WV)waveEnd(false,true);fadeTo(()=>{TWN100_home();say('🏰 Back in Duskhold.')})}
function recallTown(){if(WV)waveEnd(false,true);const T=TOWNS[0];home=T;toPos(T.sp[0],T.sp[1]);hud();say('🌀 You recall to Duskhold.')}
function portalPrompt(){
  const P=pl.position;
  for(const Q of PORT){if(Math.hypot(P.x-Q.x,P.z-Q.z)<2.6){const p=PMAP[Q.i];if(!pUnlocked(Q.i))return {label:'🔒 Sealed · defeat '+BOSSES[Q.i-1].name+' in '+PMAP[Q.i-1].n,fn:()=>openX('bosses')};
    if(pDone(Q.i)||insReach(Q.i)>0)return {label:'F · '+p.n+' (choose where to go)',fn:()=>openX('portal',Q.i)};return {label:'F · Enter '+p.ins[0].n+' (Lv '+p.ins[0].lv[0]+'–'+p.ins[0].lv[1]+')',fn:()=>enterMap(Q.i,0)}}}
  for(const r of RPORT){if(r.g.visible&&Math.hypot(P.x-r.x,P.z-r.z)<(r.k=='next'?2.8:2.2)){if(r.k=='wave')return {label:'F · Leave the Wave Trial',fn:()=>goHome()};
    if(r.k=='next'){const N=r.to;return {label:'F · Step through to '+N.n+(N.den?' ('+BOSSES[N.z].name+')':' (Lv '+N.lv[0]+'–'+N.lv[1]+')'),fn:()=>insGo(N)}}
    return {label:'F · Return to Duskhold',fn:()=>goHome()}}}
  return null}
{const f=worldPrompt;worldPrompt=function(){return portalPrompt()||f()}}
// v106: the portal lists every instance of the zone you have reached, and the Wave Trial once the zone is cleared
XR.portal=()=>{const i=xwArg|0,p=PMAP[i],b=BOSSES[i],d=pDone(i),R=insReach(i);$('xwT').textContent=p.ic+' '+p.n;$('xwS').textContent=p.sub+' · Lv '+p.lv[0]+'–'+p.lv[1]+(d?' · cleared ✓':'');
  const row=I=>{const ok=I.k<=R,txt=I.den?b.name+', '+b.title+(d?' (back 5 minutes after each defeat).':'.'):I.k==PMF-1?'Its road ends at the gateway to '+b.name+'’s den.':'Its road ends at a gateway to '+p.ins[I.k+1].n+'.';
    return `<div class="rw" style="${ok?'':'opacity:.55'}"><span class="rn">${I.den?'👑':'🗺️'} <b>${I.n}</b> <span class="mut">Lv ${I.den?b.lvl:I.lv[0]+'–'+I.lv[1]}</span><small>${txt}${ok?'':'<br>🔒 Reach it through the gateway at the end of '+p.ins[I.k-1].n+'.'}</small></span><span class="ra">${ok?`<button class="pri" data-pgo="map" data-pk="${I.k}">Enter</button>`:'🔒'}</span></div>`};
  const wave=d?`<div class="rw"><span class="rn">⚔️ <b>Wave Trial</b><small>${WV_N} waves of ${p.n} monsters at level ${p.lv[1]}+, ending with elites. Clear them all for a chest of Tier ${p.t} materials, gold and a chance at eggs. Leaving or falling forfeits the chest.${(waveBest[i]||0)?'<br>Best: '+(waveBest[i]>=WV_N?'all waves cleared ✓':'wave '+waveBest[i]):''}</small></span><span class="ra"><button class="pri" data-pgo="wave">Start</button></span></div>`:'';
  $('xwB').innerHTML='<div class="rows">'+p.ins.map(row).join('')+wave+'</div>';
  $('xwF').innerHTML='<span class="mut dtl">Recall (T) brings you home to Duskhold; press T again in Duskhold to go back to the spot you left.</span>'};
$('xw').addEventListener('click',e=>{if(xwMode!='portal')return;const b=e.target.closest('[data-pgo]');if(!b)return;const i=xwArg|0;closeX();if(b.dataset.pgo=='map')enterMap(i,+b.dataset.pk||0);else waveStart(i)});
// the J window lists the portals and their bosses
XR.bosses=()=>{$('xwT').textContent='🌀 The Portals';$('xwS').textContent=bossDone.size+' of '+PMAP.length+' maps cleared';
  $('xwB').innerHTML='<div class="rows">'+PMAP.map((p,i)=>{const b=BOSSES[i],u=pUnlocked(i),d=pDone(i);
    return `<div class="rw" style="--rc:${d?'#6ee7b7':u?'#c9a24a':'#555'};${u?'':'opacity:.6'}"><span class="rn">${p.ic} <b>${p.n}</b> <span class="mut">Lv ${p.lv[0]}–${p.lv[1]}</span><small>${p.sub}<br>Boss: ${b.name}, ${b.title} · ${d?'✓ Cleared · power gained: '+b.pw.i+' '+b.pw.n:u?'Reward: '+b.pw.i+' '+b.pw.n+' ('+b.pw.d+')':'🔒 Defeat '+BOSSES[i-1].name+' to open'}</small></span><span class="ra">${d?'✓':u?'Open':'🔒'}</span></div>`}).join('')+'</div>';
  $('xwF').innerHTML='<span class="mut dtl">Each portal has its own gate on an island round Duskhold; roads lead there from the east, west and south gates.</span>'};
// ---- bosses ----
function spawnBoss(i){
  const d=BOSSES[i],key='boss'+i;
  EN[key]={n:d.name,e:d.i||'👑',rig:d.hum?null:d.sp,hum:d.hum||null,col:d.bc||d.col||0x888888,w:{hp:.8,pa:1,ma:1,pd:1.05,md:1.05},mt:FAMD[famOf(d.sp)]?FAMD[famOf(d.sp)].mt:'p',moves:[],fam:famOf(d.sp)};S[key]=S[key]||{e:d.i||'👑',c:d.col||0x888888};MSET[key]=[];
  const c=enemyC(key,d.lvl,{boss:1});c.n=d.name;const m=cr(c);m.bs*=d.hum?2.5:d.sp=='Centipede'?3.8:d.sp=='Hydra'?4.4:3;m.scale.setScalar(m.bs);m.position.set(d.x,0,d.y);
  const r=new THREE.Mesh(new THREE.RingGeometry(.9,1.1,32),addMat(d.col||0xff3a2a));r.rotation.x=-Math.PI/2;r.position.y=.06;m.add(r);scene.add(m);
  const hb=bar(true);hb.scale.setScalar(3);
  const e={c,m,hb,boss:1,bi:i,ar:i,tier:4,home:[d.x,d.y],cd:1,ch:0,vx:0,vz:0,agg:0,bs:{t:2,lock:0,ph:1,last:'',ult:12},wx:d.x,wz:d.y,wt:0,dots:[]};enemies.push(e);return e}
Object.assign(BOSSES[0],{i:'👁️',col:0xffd040,bc:0x2e2834});Object.assign(BOSSES[1],{i:'🐉',col:0x7ac850,bc:0x3e6a3a});Object.assign(BOSSES[2],{i:'❄️',col:0x9ad8ff,bc:0xbfe8ff});Object.assign(BOSSES[3],{i:'🐛',col:0xff7a30,bc:0x6a2a18});Object.assign(BOSSES[4],{i:'🤢',col:0x9aff6a});Object.assign(BOSSES[5],{i:'🧛',col:0xff2040});
BSTY.length=0;BSTY.push(
 {m:'circle',r:6.5,sp:3.0,pool:[['pounce','charge','beam'],['adds','rain'],['triple','cross']]},
 {m:'root',sp:0,pool:[['bonelines','spit','tongue'],['beam','mines'],['spores','wave']]},
 {m:'drift',sp:1.3,fly:.45,pool:[['orbs','fade','prison'],['clones','beam'],['mines','wave']]},
 {m:'burrow',sp:1.9,pool:[['submerge','tailsweep','charge'],['spit','mines'],['submerge','triple']]},
 {m:'slow',sp:1.0,pool:[['slam','spit','pounce'],['spores','adds'],['quake','sporering']]},
 {m:'blink',sp:1.8,pool:[['bonelines','dive','adds'],['prison','beam'],['clones','lightning']]});
function bossDefeated(e){
  const A=arenaOf(e);if(!A)return;arenaClear(A);const i=A.i,first=!bossDone.has(i);
  if(!first){banner('👑 '+A.b.name+' falls again','Its loot is yours','It returns after 5 minutes');return}
  bossDone.add(i);const P=A.b.pw;hero.buffs.push({s:P.s,t:Infinity,n:P.n,i:P.i,d:P.d,perm:1});hsDirty();
  banner('👑 MAP CLEARED',A.b.name+' is slain','Power gained: '+P.i+' '+P.n+' ('+P.d+')');portalRefresh();rportRefresh();
  setTimeout(()=>{if(i<PMAP.length-1)banner('🌀 A NEW PORTAL OPENS',PMAP[i+1].n+' awaits at its gate outside Duskhold','The Wave Trial of '+PMAP[i].n+' is now open too');else banner('🏆 THE CITADEL HAS FALLEN','Every portal is cleared','Thank you for playing!');
    say('🌀 A golden portal home has opened in the arena.')},2800);
}
// ---- Wave Trials ----
var WV=null,WV_N=10,waveBest={};
function waveStart(i){if(AF||WV)return;const p=PMAP[i];WV={pi:i,w:0,n:WV_N,foes:[],brk:3,lv:p.lv[1],go:0,nt:0};
  fadeTo(()=>{toPos(p.wa[0],p.wa[1]+6,0);WV.go=1;banner('⚔️ WAVE TRIAL',p.n,WV_N+' waves, one every '+WV_GAP+' seconds — they don’t wait for you. Clear them all for the reward chest.')})}
var WV_GAP=20;
function waveSpawn(){const W2=WV,p=PMAP[W2.pi],L=BIOEN[p.n]||['hobgoblin'],last=W2.w==W2.n,cnt=Math.min(26,4+2*W2.w+(last?4:0)),lv=Math.min(MAXLV,W2.lv+Math.floor((W2.w-1)/2));
  const ne=W2.w%3==0?Math.ceil(W2.w/4):0,nel=last?3:ne;
  for(let k=0;k<cnt;k++){const a=k/cnt*6.283+Math.random()*.5,r=9+Math.random()*4,x=p.wa[0]+Math.cos(a)*r,z=p.wa[1]+Math.sin(a)*r;const al=k<nel;
    const e=spawnEnemy(L[k%L.length],x,z,Math.min(MAXLV,lv+(al?1:0)),{agg:1,minion:1,al});if(e){e.ev=1;e.wv=1;e.agg=1;W2.foes.push(e);burst(gY(e.m.position,.5),0xff6a40,16,2,2,.5)}}
  banner('WAVE '+W2.w+' / '+W2.n,PMAP[W2.pi].n,cnt+' foes · level '+lv+(nel?' · '+nel+' elite'+(nel>1?'s':'')+'!':''));if(typeof sfx=='function')sfx('horn');shake(.15)}
// runs every frame: keeps its element, counts the live foes waveTick already filtered, and only writes when the text changes
var WVH={d:null,s:''};
function waveHud(){let d=WVH.d;if(!WV||!WV.go){if(d){d.remove();WVH.d=null;WVH.s=''}return}
  if(!d){document.body.insertAdjacentHTML('beforeend','<div id="wvHud" style="position:fixed;top:44px;left:50%;transform:translateX(-50%);z-index:25;background:rgba(20,10,10,.85);border:1px solid #b0402a;color:#ffd8c8;border-radius:10px;padding:5px 14px;font:700 13px system-ui,sans-serif;pointer-events:none;text-align:center"></div>');d=WVH.d=$('wvHud');WVH.s=''}
  const alive=WV.foes.reduce((n,e)=>n+(e.dead?0:1),0),nx=WV.w<WV.n?Math.max(0,Math.ceil(WV.w?WV.nt:WV.brk)):null;
  const h='⚔️ Wave '+Math.max(1,WV.w)+' / '+WV.n+' · '+alive+' foe'+(alive==1?'':'s')+' left'+(nx!=null?' · <span style="color:#ffb070">next wave in '+nx+'s</span>':' · <span style="color:#ffd060">final wave!</span>');
  if(h!==WVH.s){WVH.s=h;d.innerHTML=h}}
function waveTick(dt){const W2=WV;if(!W2){waveHud();return}if(!W2.go){return}if(curMap()!=W2.pi){waveEnd(false,true);waveHud();return}
  if(!W2.w){W2.brk-=dt;if(W2.brk<=0){W2.w=1;W2.nt=WV_GAP;waveSpawn()}waveHud();return}
  W2.foes=W2.foes.filter(e=>!e.dead&&enemies.includes(e));const alive=W2.foes.length;
  if(W2.w<W2.n){W2.nt-=dt;if(!alive&&W2.nt>3)W2.nt=3;if(W2.nt<=0&&alive<45){W2.w++;W2.nt=WV_GAP;waveSpawn()}}
  else if(!alive){waveBest[W2.pi]=Math.max(waveBest[W2.pi]||0,W2.w);waveEnd(true);waveHud();return}
  waveBest[W2.pi]=Math.max(waveBest[W2.pi]||0,W2.w-1);waveHud()}
function waveEnd(won,quiet){const W2=WV;if(!W2)return;WV=null;W2.foes.forEach(e=>{if(!e.dead&&enemies.includes(e))removeE(e)});
  if(!won){if(!quiet)say('The Wave Trial ends. No chest this time.');return}
  const p=PMAP[W2.pi],T=p.t,pos=V(p.wa[0],0,p.wa[1]),U=UPM[T-1][0],fm=FAMK.map(f=>FAMD[f].mat);
  banner('🏆 TRIAL COMPLETE',p.n+' · all '+W2.n+' waves','A reward chest appears!');ring(pos,0xffd060,6,600);burst(gY(pos,1),0xffd060,80,4,4,1);
  drop('mat',{k:U,n:3+T*2},pos,2);drop('mat',{k:fm[R(0,fm.length-1)],n:4+T*2},pos,2);drop('mat',{k:fm[R(0,fm.length-1)],n:3+T},pos,2);
  drop('gear',genItem(Math.min(MAXLV,p.lv[1]+1),{cls:hero.cls,minR:2}),pos,2);if(Math.random()<.5)drop('gear',genItem(Math.min(MAXLV,p.lv[1]),{cls:hero.cls}),pos,1);
  for(let k=0;k<2;k++)drop('potion',null,pos,0);if(Math.random()<.35+.05*T){const eg=rollEgg(Math.min(5,T));drop('egg',eg,pos,eg.tier)}
  const g=150*T+R(0,100);gold+=g;pickup({ic:'🪙',t:'+'+g+' gold',col:'#ffd24a'});hud()}
var prfT=0;{const f=homeTick;homeTick=function(dt,now,al){f(dt,now,al);if(dt>0)waveTick(dt);if(home!==TOWNS[0])home=TOWNS[0];if(now-prfT>1000){prfT=now;portalRefresh();rportRefresh()}}}
{const f=down;down=function(){if(WV&&!phxReady()){waveEnd(false,true);say('☠ You fell in the Wave Trial.')}return f.apply(this,arguments)}}
// ---- the Citadel is a castle: stone walls instead of cliffs ----
{const p=PMAP[5],L=[];for(const I of p.ins.concat(p.tri))for(let y=I.y0;y<I.y0+I.h;y++)for(let x=I.x0;x<I.x0+I.w;x++){if(MAP[y][x]!=='')continue;let adj=false;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const t=MAP[y+dy]&&MAP[y+dy][x+dx];if(t&&t!=='')adj=true}if(adj)L.push([x,y])}
  const mt=new THREE.MeshStandardMaterial({roughness:.92,flatShading:true}),wm=new THREE.InstancedMesh(new THREE.BoxGeometry(1.02,1,1.02),mt,L.length),cm=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.6,.5),mt,L.length),o=new THREE.Object3D(),cc=new THREE.Color();
  L.forEach(([x,y],i)=>{const h=7+((x*7+y*3)%3)*.4,g0=.3;o.position.set(x,g0+h/2,y);o.scale.set(1,h,1);o.updateMatrix();wm.setMatrixAt(i,o.matrix);cc.setHex((x+y)%2?0x3e363c:0x332c32);wm.setColorAt(i,cc);
    const on=(x+y)%2;o.position.set(x,g0+h+.3,y);o.scale.setScalar(on?1:.001);o.updateMatrix();cm.setMatrixAt(i,o.matrix);cm.setColorAt(i,cc)});
  [wm,cm].forEach(m=>{m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.instanceMatrix.needsUpdate=true;scene.add(m);(window.CITW=window.CITW||[]).push(m)});
  for(let k=0;k<L.length;k+=23){const [x,y]=L[k],g=new THREE.Group();g.position.set(x,0,y);scene.add(g);const b=new THREE.Mesh(new THREE.PlaneGeometry(.8,2.2),new THREE.MeshStandardMaterial({color:0x7a0c18,side:THREE.DoubleSide,roughness:.9}));b.position.y=4.2;g.add(b);
    const tl=new THREE.Mesh(new THREE.ConeGeometry(.12,.35,5),new THREE.MeshBasicMaterial({color:0xff8a40}));tl.position.set(0,2.6,0);g.add(tl);{const I=insAt(x,y)||p.ins[0];b.lookAt(I.x0+I.w/2,4.2,I.y0+I.h/2)}}}


