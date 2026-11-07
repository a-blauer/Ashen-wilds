// ================= v205 co-op: the Citadel main quest played together =================
// Playing together (partners in the same instance, the v58 relay: MP 'ev', entries only from partners in my region MP.rg), every
// chapter is shared (the v165 Searing Sands pattern, 3305):
//  · I  The Unsealing: the keys are everyone's (['c5i', i]); handing them over is everyone's (['c5g']). The region host runs the
//    unbinding: anyone may begin it (a partner asks ['c5a']; the host starts it and tells all ['c5u', 'start']); Cheddar's health,
//    the seal and the siphons' places go out every 150 ms (['c5ue', t, hp, go, siphon x/z…]); the specials' states (['c5us', nid,
//    kind, state]: a Mist Stalker hidden in its mist, the Gate-Breaker's wind-up) so partners see what the host's world does; the
//    Nightwing Dives (['c5dv', id, lanes…]): each player checks their own hero in a lane and tells the host (['c5sh', id]); the host
//    hurts Cheddar a moment later only if nobody shielded him. The court is the host's shared monsters. Its end: ['c5u', why].
//  · II Vharog: one beast for everyone. The DRIVER (the lowest peer id among the standing heroes in the clearing who have him)
//    runs his AI; each move goes out with its seed and his spot (['v1c', …]), his health, phase and posture every 120 ms
//    (['v1s', …]); the others play the same moves and glide between them; their damage goes to the driver (['v1h', dmg]). He wakes
//    for everyone (['v1w']); he is put back to sleep only when every hero in the clearing is down (['v1r']); his fall is everyone's
//    (['v1k']). A ballista loosed by anyone (['v1b', i]) is shown everywhere and counted by the driver.
//  · III The Dawn Mirrors: the cocoons broken, the mirrors taken, mounted and turned, the dawn (['c5m', k, i, rot]). The wardens are
//    the host's shared monsters.
//  · Credit for the whole group, wherever they are (['bq205', key], three times): the seal broken, Vharog slain, the dawn.
// Playing solo nothing changes (co151On() is false).
var CO205={rx:0,ap:0,rk:0,hq:0,tH:0,tS:0,tU:0,got:{},cq:[],err:0,shd:{}};
function co205Rx(f){CO205.rx++;try{return f()}finally{CO205.rx--}}
function co205Send(e){if(!CO205.rx)co151Send(e)}
const co205R=v=>Math.round(v*100)/100;
// ---------------- credit ----------------
function co205Credit(key){if(typeof MP=='undefined'||!MP.on||!MPX.be||CO205.rx||CO205.got[key])return;CO205.got[key]=1;CO205.cq.push({key,n:3,t:0})}
function co205Flush(now){if(!CO205.cq.length)return;const l=[];CO205.cq.forEach(q=>{if(now-q.t>700){q.t=now;q.n--;l.push(['bq205',q.key,String(hero.name||'Hero').slice(0,20)])}});
  CO205.cq=CO205.cq.filter(q=>q.n>0);if(l.length)try{MP.room.emit('ev',{r:MP.rg,l}).catch(()=>{})}catch(_){}}
function co205Apply(key,by){const who=mpEsc(String(by||'A partner').slice(0,20));co205Rx(()=>{
  if(key==='c1'){if(CQ205.c1.st<3&&!US205.E){CQ205.c1.st=3;CQ205.c1.ing=0;CQ205.trkK='';try{gg205Sync();ch205Sync()}catch(_){}say('🩸 '+who+' broke the blood seal with Cheddar: the Great Gate stands open for you too.')}}
  else if(key==='c2'){if(CQ205.c2.st<1){CQ205.c2.st=1;CQ205.trkK='';if(VH205.e&&!VH205.e.dead&&!(VH205A&&VH205A.f))vh205Reset(false);try{vh205GateSync()}catch(_){}say('🦇 '+who+' slew Vharog, the Bloodgorged: the rampart gate stands open for you too.')}}
  else if(key==='c3'){if(CQ205.c3.st<3){CQ205.c3.st=3;CQ205.c3.mnt=7;CQ205.c3.got=0;CQ205.trkK='';try{dm205Sync()}catch(_){}say('🌞 '+who+' brought the dawn to the Citadel: the Eclipse Door stands open for you too.')}}})}
// ================= I: the keys, the unbinding =================
function co205Ing(i){if(co151On())co205Send(['c5i',i|0])}
function co205Give(){if(co151On())co205Send(['c5g'])}
function co205Ask(){if(nowP()-(CO205.tA||0)>800){CO205.tA=nowP();co205Send(['c5a'])}}
function co205Ev(k){if(co151On())co205Send(['c5u',k])}
function co205USync(now){const E=US205.E;if(!E||!co151On()||!co151Host()||now-CO205.tU<150)return;CO205.tU=now;const sl=[];(E.sl||[]).forEach(p=>sl.push(co205R(p.x),co205R(p.z)));
  co205Send(['c5ue',Math.round(E.t*10),Math.round(E.hp),E.go|0].concat(sl));
  // the specials' states, for partners' copies
  enemies.forEach(e=>{if(!e.us205||e.dead||!e.nid)return;const st=e.us205==='mist'?(e.usM&&e.usM.st||''):e.us205==='brk'?(e.usB&&e.usB.st||''):'';if(!st)return;const k=e.nid+':'+st;if(e.co205k===k)return;e.co205k=k;co205Send(['c5us',e.nid,e.us205,st])})}
function co205OnU(q){if(co151Host()||!cq205Here(0)||hero.hp<=0||(typeof RV148!='undefined'&&RV148.down))return;let E=US205.E;if(!E){if(CQ205.c1.st!==2||!CH205.C)return;co205Rx(()=>us205Start(false));E=US205.E;if(!E)return}
  E.t=Math.max(0,(q[1]|0)/10);E.hp=Math.max(0,Math.min(US205.hpM,q[2]|0));if(q[3]&&!E.go&&!CH205.to){E.go=1;CH205.pose='cast'}const sl=[];for(let i=4;i+1<q.length;i+=2)if(isFinite(q[i])&&isFinite(q[i+1]))sl.push({x:+q[i],z:+q[i+1]});E.sl=sl}
function co205OnUS(q){const e=MP.emap&&MP.emap[q[1]];if(!e)return;e.co205us=q[2]+':'+q[3];
  if(q[2]==='mist'&&q[3]==='form'){svWarn({k:'c',r:1.6},{x:e.m.position.x,z:e.m.position.z,a:0},.9,{col:0xb01020})}
  if(q[2]==='brk'&&q[3]==='wind'){const c=us205C();if(c)svWarn({k:'c',r:2.4},{x:c.x,z:c.z,a:0},2.2,{col:0xd01808})}}
// a partner's copy of a Mist Stalker hides while the host's is mist
{const f=eTick;eTick=function(e,dt,now){if(e&&e.mir&&e.co205us){if(e.co205us==='mist:mist'||e.co205us==='mist:form'){e.m.visible=false;if(e.hb)e.hb.visible=false;if(Math.random()<.6)burst(gY(e.m.position,.4),0x7a0a16,1,.6,.6,.6)}}return f.apply(this,arguments)}}
// the dives: lanes go out from the host; whoever stands in one takes the swarm and says so; the host hurts Cheddar only if no one did
function co205Dive(lanes){if(!co151On()||!co151Host())return;const E=US205.E;if(!E||!E.dive)return;E.dive.id=(CO205.dvN=(CO205.dvN||0)+1);const l=['c5dv',E.dive.id];lanes.forEach(L=>l.push(co205R(L.x),co205R(L.z),co205R(L.a),co205R(L.len)));co205Send(l)}
function co205OnDive(q){if(co151Host()||!US205.E)return;const lanes=[];for(let i=2;i+3<q.length;i+=4)lanes.push({x:+q[i],z:+q[i+1],a:+q[i+2],len:+q[i+3]});const id=q[1]|0;
  lanes.forEach(L=>svWarn({k:'l',w:2.2,l:L.len,b:0},{x:L.x,z:L.z,a:L.a},1.7,{col:0xb01020}));
  cq205After(1.7,()=>{lanes.forEach(L=>{const P=pl.position,dx=P.x-L.x,dz=P.z-L.z,f=dx*Math.sin(L.a)+dz*Math.cos(L.a),s=Math.abs(dx*Math.cos(L.a)-dz*Math.sin(L.a));
    try{sk146Swarm(new THREE.Vector3(L.x,GH(L.x,L.z)+1,L.z),new THREE.Vector3(L.x+Math.sin(L.a)*L.len,GH(L.x,L.z)+1,L.z+Math.cos(L.a)*L.len),20,0x1a0a10,'bat',.5,{spread:1})}catch(_){}
    if(hero.hp>0&&f>-.4&&f<L.len-1.2&&s<1.3){const src=enemies.find(e=>!e.dead)||{c:{mt:'p',l:US205.lv},m:{position:P}};try{hitTarget(src,pl,.9)}catch(_){}popT(P,'SHIELDED HIM','#ffe0a0',true);co205Send(['c5sh',id])}})})}
// the host defers Cheddar's hurt from a dive by a moment, and skips it if a partner shielded him
{const f=us205DiveTick;us205DiveTick=function(dt){const E=US205.E;if(!co151On()||!co151Host()||!E||!E.dive)return f.apply(this,arguments);const D=E.dive,hp0=E.hp,fired0=D.fired;const r=f.apply(this,arguments);
  if(!fired0&&D.fired&&E.hp<hp0){const lost=hp0-E.hp;E.hp=hp0;const id=D.id;cq205After(.35,()=>{const X=US205.E;if(!X)return;if(CO205.shd[id]){X.hp=Math.min(US205.hpM,X.hp+1);return}X.hp-=lost;CH205.hit=.5})}return r}}
// a partner's copy of the unbinding does not spawn, hurt Cheddar or run the specials (the host's world does)
{const f=us205Spawn;us205Spawn=function(){if(co151On()&&!co151Host())return null;return f.apply(this,arguments)}}
// ================= II: Vharog, one beast for everyone =================
function vh180Has(){const e=VH205.e;return !!(e&&!e.dead&&e.sv&&vh205Here())}
function vh180Drv(){if(!co151On())return typeof MP!='undefined'?MP.me:'';let h=vh180Has()&&co151Me()?MP.me:null;
  for(const k in MP.rh){const p=MP.rh[k].pr;if(p&&p.rg===MP.rg&&p.v1&&p.hp>0&&!p.dn&&(h===null||k<h))h=k}return h}
vh180Auth=function(){if(!co151On())return true;const d=vh180Drv();return d===null||d===MP.me};
vh180Glide=function(e,dt){const m=e.m,S=e.sv;if(e.nry!=null){const da=svAng(e.nry-m.rotation.y),t=5*dt;m.rotation.y+=Math.max(-t,Math.min(t,da))}
  if(e.nx!=null&&dt>0){const dx=e.nx-m.position.x,dz=e.nz-m.position.z,l=Math.hypot(dx,dz);if(l>10){m.position.x=e.nx;m.position.z=e.nz}else{const k=Math.min(1,dt*6);m.position.x+=dx*k;m.position.z+=dz*k}S.walkSp=l>.3?2:0}};
function vh180End(){if(!co151On())return hero.hp<=0||!vh205Here()||(typeof AWD!='undefined'&&AWD.dead);if(!vh205Here())return true;if(!vh180Auth())return false;return !co151Standing()}
function vh180Ended(){if(co151On()&&vh180Auth())co205Send(['v1r'])}
function co205Wake(){if(co151On())co205Send(['v1w'])}
{const f=svCast;svCast=function(e,id,seed){if(e&&e.vh205&&co151On()&&!vh180Auth()&&!CO205.rx)return;const r=f.apply(this,arguments);
  try{if(e&&e.vh205&&co151On()&&!CO205.rx&&e.sv&&e.sv.mv&&e.sv.mv.id===id){const m=e.m;co205Send(['v1c',id,e.sv.mv.seed,co205R(m.position.x),co205R(m.position.z),co205R(m.rotation.y),e.sv.ph|0])}}catch(_){}return r}}
// a follower's hits go to the driver (shown here, applied there)
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.vh205&&!e.dead&&co151On()&&!vh180Auth()&&!CO205.ap&&VH205A&&VH205A.f){d=Math.max(0,Math.round(d));if(!isFinite(d)||!d)return;
    CO205.hq+=d;e.lhT=performance.now();e.c.h+=1e9;try{return f(e,d,s,crit,dot)}finally{e.c.h=Math.max(1,e.c.h-1e9)}}return f.apply(this,arguments)}}
{const f=kill;kill=function(e){const r=f.apply(this,arguments);try{if(e&&e.vh205){CO205.kT=performance.now();if(co151On()&&!CO205.rk){co205Send(['v1k']);co205Send(['v1k'])}}}catch(_){}return r}}
function vh180Sync(now){const e=VH205.e;if(!co151On()||!vh180Auth()||!vh180Has()||!(VH205A&&VH205A.f)||now-CO205.tS<120||now-(CO205.kT||-1e9)<10000)return;CO205.tS=now;const S=e.sv,m=e.m;
  co205Send(['v1s',Math.round(e.c.h),S.ph|0,co205R(m.position.x),co205R(m.position.z),co205R(m.rotation.y),Math.round((S.po||0)*100),1,S.mv?S.mv.id:'',S.mv?S.mv.seed|0:0,S.mv?Math.round(S.mv.t*100):0])}
function vh180OnSync(q){if(!vh205Here()||vh180Auth())return;const e=VH205.e;if(!e||e.dead||!enemies.includes(e))return;const S=e.sv,now=performance.now(),[_,h,ph,x,z,ry,po]=q;if(!isFinite(x)||!isFinite(z))return;
  if(!(VH205A&&VH205A.f))co205Rx(()=>vh205Wake());e.nx=+x;e.nz=+z;e.nry=+ry||0;const hh=Math.max(1,Math.min(M(e.c),+h||1));e.c.h=now-(e.lhT||0)<600?Math.min(e.c.h,hh):hh;
  if((ph|0)===2&&S.ph!==2&&!(S.mv&&S.mv.id==='awaken')){S.ph=2;e.bs.ph=2;try{vh205Storm(true)}catch(_){}}S.po=Math.max(0,Math.min(1,(po|0)/100));
  {const id=q[8],sd=q[9]|0,mt=(q[10]|0)/100;if(typeof id==='string'&&VH205MV[id]&&id!=='sleep'&&sd&&mt<.6&&e.v1sd!==sd&&!(S.mv&&S.mv.seed===sd)){e.v1sd=sd;co205Rx(()=>{svEndMove(e,true);svStart(e,id,sd)})}}
  if(Math.hypot(e.m.position.x-x,e.m.position.z-z)>14&&!(S.mv&&S.mv.id==='prowl')){e.m.position.x=+x;e.m.position.z=+z}}
function vh180OnCast(q){if(!vh205Here())return;const e=VH205.e;if(!e||e.dead||!e.sv)return;const [_,id,seed,x,z,ry,ph]=q;if(typeof id!=='string'||!VH205MV[id])return;
  const m=e.m;if(isFinite(x)&&isFinite(z)&&Math.hypot(m.position.x-x,m.position.z-z)<14){m.position.x=+x;m.position.z=+z;if(isFinite(ry))m.rotation.y=+ry}e.nx=+x;e.nz=+z;e.nry=+ry||0;
  if(ph===2&&e.sv.ph!==2&&id!=='awaken'){e.sv.ph=2;e.bs.ph=2}if(!(VH205A&&VH205A.f))co205Rx(()=>vh205Wake());e.sv.on=true;
  if(e.v1sd===(seed|0)&&e.sv.mv&&e.sv.mv.id===id)return;e.v1sd=seed|0;co205Rx(()=>{svEndMove(e,true);svStart(e,id,Math.max(1,seed|0))})}
function vh180OnKill(){const e=VH205.e;if(!e||e.dead||!vh205Here())return;CO205.rk=1;MP.rk=1;try{e.c.h=0;e.dead=1;if(e.hb)e.hb.visible=false;kill(e)}finally{CO205.rk=0;MP.rk=0}}
function co205Loose(i){if(co151On())co205Send(['v1b',i|0])}
// ================= III: the mirrors =================
function co205Mir(k,i,r){if(co151On())co205Send(['c5m',k,i|0,r|0])}
function co205OnMir(q){const k=q[1],i=q[2]|0,C=CQ205.c3;if(i<0||i>2)return;
  if(k==='c'){if(!(C.cl&(1<<i))){C.cl|=1<<i;CQ205.trkK='';try{dm205Sync()}catch(_){}}}
  else if(k==='t'){if(!((C.got|C.mnt)&(1<<i))){if(DM205.S)dm205Take(i,false);else{C.got|=1<<i;C.cl|=1<<i}}}
  else if(k==='m'){if(!(C.mnt&(1<<i))){C.got|=1<<i;if(DM205.S)dm205Mount(i,false);else{C.got&=~(1<<i);C.mnt|=1<<i;if(C.mnt===7&&C.st<2)C.st=2}}}
  else if(k==='r'){if(C.mnt&(1<<i)&&C.st<3){if(DM205.S)dm205Turn(i,false,q[3]|0);else C.rot[i]=q[3]&7}}
  else if(k==='d'){if(C.st<3){if(DM205.S)dm205Dawn(false);else C.st=3}}}
// ================= presence and the messages =================
{const f=MP.room.presence;MP.room.presence=function(p){if(p&&typeof p=='object'){try{p.v1=vh180Has()?1:0}catch(_){}}return f.apply(this,arguments)}}
{const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(MP.on&&!msg.sameTab&&d&&Array.isArray(d.l)){
    for(const q of d.l.slice(0,60)){if(!Array.isArray(q)||typeof q[0]!=='string')continue;const t=q[0];
      if(t==='bq205'){if(typeof q[1]==='string'&&/^(c1|c2|c3)$/.test(q[1])&&!CO205.got[q[1]]){CO205.got[q[1]]=1;co205Apply(q[1],q[2]||mpName(msg.peer))}continue}
      if(!/^(c5|v1)/.test(t)||d.r!==MP.rg||!co151Peer(msg))continue;const fromHost=msg.peer===MP.host,iHost=MP.host===MP.me;
      co205Rx(()=>{
      // I
      if(t==='c5i'){const i=q[1]|0;if(i>=0&&i<4&&CQ205.c1.st===1&&!(CQ205.c1.ing&(1<<i))){CQ205.c1.ing|=1<<i;CQ205.trkK='';const g=CH205.ING[i];say('🩸 A partner took the '+g.n+'.')}}
      else if(t==='c5g'){if(CQ205.c1.st===1){CQ205.c1.ing=15;ch205Give(false)}else if(CQ205.c1.st<1){CQ205.c1.st=2;CQ205.c1.ing=0;CQ205.trkK=''}}
      else if(t==='c5a'){if(iHost&&!US205.E&&CQ205.c1.st===2&&cq205Here(0))setTimeout(()=>{if(!US205.E)us205Start(true)},0)}
      else if(t==='c5u'){if(fromHost){const k=q[1];if(k==='start'&&!US205.E&&cq205Here(0)&&CQ205.c1.st===2)us205Start(false);else if(k==='fall'&&US205.E)us205Stop('fall');else if(k==='won'&&US205.E)us205Win();else if(k==='quiet'&&US205.E)us205Stop('quiet')}}
      else if(t==='c5ue'){if(fromHost)co205OnU(q)}
      else if(t==='c5us'){if(fromHost)co205OnUS(q)}
      else if(t==='c5dv'){if(fromHost)co205OnDive(q)}
      else if(t==='c5sh'){CO205.shd[q[1]|0]=1}
      // II
      else if(t==='v1h'){if(vh180Auth()&&VH205.e&&!VH205.e.dead){const dm=Math.max(0,Math.min(1e6,+q[1]||0));if(dm){CO205.ap=1;try{hurt(VH205.e,dm,{col:0xff6a6a},false,true)}finally{CO205.ap=0}}}}
      else if(t==='v1k')vh180OnKill();
      else if(t==='v1w'){if(vh205Here()&&VH205.e&&!VH205.e.dead&&!(VH205A&&VH205A.f))vh205Wake()}
      else if(t==='v1b'){const i=q[1]|0;if(VH205.H&&VH205.bal[i]&&!VH205.bal[i].used){vh205Loose(i,false);if(vh180Auth())co205Send(['v1b',i])}}
      else if(msg.peer===vh180Drv()||!vh180Auth()&&(vh180Has()||t==='v1s')){if(t==='v1c')vh180OnCast(q);else if(t==='v1s')vh180OnSync(q);else if(t==='v1r'){if(VH205A&&VH205A.f)vh205Reset(true)}}
      // III
      if(t==='c5m')co205OnMir(q)})}}}catch(err){if(!CO205.err++)console.warn('v205 co-op',err)}
  return f.apply(this,arguments)}}
// ================= the tick =================
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{if(typeof MP!='undefined'&&MP.on){const t=performance.now();
    if(CO205.hq>0&&t-CO205.tH>150){CO205.tH=t;co205Send(['v1h',CO205.hq]);CO205.hq=0}
    vh180Sync(t);co205USync(t);co205Flush(t);const g=vh180Has()?1:0;if(g!==CO205.v1){CO205.v1=g;MP.lastPres=''}}}catch(err){if(!CO205.err++)console.warn('v205 co-op tick',err)}return r}}
// leaving the group: what was sent or heard is forgotten (a new group gets it again)
{const f=mpSolo;mpSolo=function(){const r=f.apply(this,arguments);CO205.got={};CO205.cq=[];CO205.hq=0;CO205.shd={};return r}}
