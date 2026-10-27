// ================= v151 co-op: Burningeye Summit's main quest is played together =================
// Owner: "make it truly co-op". The three chapters (3152 The Frozen Maw, 3160 The Frozen Gate, 3170 The Mountain Drill) were local to
// each player; playing together they are now one shared fight and one shared event per instance, on the v58 relay (MP, the 'ev'
// topic; entries are only taken from partners in the same instance, MP.rg):
//  · Gorthrak: one troll for everyone. The DRIVER (gb180Drv: the lowest peer id among the standing heroes in the cave who have him
//    there) runs his AI: every move it casts is relayed with its seed and his spot (['g1c', id, seed, x, z, ry, phase]), and his
//    health, phase, posture and shell go out every 120 ms (['g1s', …]). The others play the same moves on their own copy (each is hit
//    on their own screen) and glide to the synced spot between moves; their damage goes to the driver (['g1h', dmg]). The fight starts
//    when any hero comes close (['g1st']), pillars break for everyone (['g1p', i]), it is lost only when every hero in the cave is
//    down (['g1r']), and when he falls everyone there gets the kill, their own loot and XP (['g1k']). A partner whose own troll is
//    already slain sees a visiting copy (e.gbV) and fights alongside.
//  · The Frozen Gate: the region host runs the melt. Anyone may start it (a partner asks: ['f2rq']; the host starts and tells all:
//    ['f2st']). One hero carries the flamespitter at a time (a partner asks for it: ['f2c', 1]; drops it: ['f2c', 0, x, z, ry]); the
//    carrier's screen says when it sprays and whether it hits the gate (['f2f', fire, onGate]); the host keeps the heat, the melt and
//    the charge and sends them every 150 ms (['f2e', …]). Spiders are the host's shared monsters and hunt the nearest hero; a partner's
//    flame asks the host to burn one (['f2k', id], charge spent on the host). Wardens are the host's shared monsters too.
//  · The Mountain Drill: the region host runs it (start ['d3rq'] / ['d3st'], the drill's progress and the boxes every 150 ms
//    ['d3e', …]); anyone switches on or repairs any box (['d3o', i]); troll wreckers are the host's shared monsters and their
//    wind-up shows on every screen (['d3w', id, box]).
//  · An event is lost only when every hero in the instance is down (['f2x'] / ['d3x']); won for all (['f2w'] / ['d3v']).
//  · Credit: a slain Gorthrak, a part taken, the flamespitter assembled, the gate melted, the drill through: every player in the game
//    gets it wherever they are (['bq151', key], sent three times like the v148 boss credit), so the way opens for the whole group.
// Playing solo nothing changes (co151On() is false).
var CO151={rx:0,ap:0,rk:0,hq:0,tH:0,tS:0,tF:0,lf:'',cq:[],got:{},err:0};
function co151On(){try{return typeof MP!='undefined'&&MP.on&&!!MPX.be&&MP.others>0&&MP.rg>=0}catch(_){return false}}
function co151Host(){return !co151On()||MP.host===MP.me}
function co151Send(e){try{if(typeof MP!='undefined'&&MP.on&&MPX.be&&MP.rg>=0)MP.evq.push(e)}catch(_){}}
function co151Me(){return hero.hp>0&&!(typeof RV148!='undefined'&&RV148.down)}
// anyone still standing in my instance (me or a partner)
function co151Standing(){if(co151Me())return true;if(typeof MP=='undefined')return false;for(const k in MP.rh){const p=MP.rh[k].pr;if(p&&p.rg===MP.rg&&MP.rg>=0&&p.hp>0&&!p.dn)return true}return false}
function co151PartnerNear(x,z,d){if(!co151On())return false;for(const k in MP.rh){const p=MP.rh[k].pr;if(p&&p.rg===MP.rg&&Math.hypot(p.x-x,p.z-z)<d)return true}return false}
function co151Peer(msg){try{const r=MP.rh[msg.peer];return !!(r&&r.pr&&r.pr.rg===MP.rg&&MP.rg>=0)}catch(_){return false}}
function co151Rx(f){CO151.rx++;try{return f()}finally{CO151.rx--}}

// ---------------- credit for the whole group ----------------
function co151Credit(key){if(typeof MP=='undefined'||!MP.on||!MPX.be||CO151.rx)return;CO151.got[key]=1;CO151.cq.push({key,n:3,t:0})}
function co151Flush(now){if(!CO151.cq.length)return;const l=[];CO151.cq.forEach(q=>{if(now-q.t>700){q.t=now;q.n--;l.push(['bq151',q.key,String(hero.name||'Hero').slice(0,20)])}});
  CO151.cq=CO151.cq.filter(q=>q.n>0);if(l.length)try{MP.room.emit('ev',{r:MP.rg,l}).catch(()=>{})}catch(_){}}
function co151Apply(key,by){const who=mpEsc(String(by||'A partner').slice(0,20));
  co151Rx(()=>{
  if(key==='maw'){if(MQ151.st<2){MQ151.st=2;MQ151.trkK='';const e=MQ151.e;if(e&&!e.dead&&!(GB151A&&GB151A.f)){try{removeE(e)}catch(_){}MQ151.e=null}gb151LairSync();say('🧌 '+who+' slew Gorthrak the Glacierback: the frozen passage is open for you too.')}}
  else if(/^p[012]$/.test(key)){const i=+key[1];if(!MQ160.p[i]){MQ160.p[i]=1;MQ160.gk[i]=1;MQ160.fd[i]=1;MQ160.trkK='';if(mq160N()>=3&&MQ160.st<1)MQ160.st=1;mq160Sync();say('🔧 '+who+' recovered the '+MQ160.parts[i].n+' ('+mq160N()+'/3).')}}
  else if(key==='asm'){if(MQ160.st<2){MQ160.p=[1,1,1];MQ160.gk=[1,1,1];MQ160.st=2;MQ160.trkK='';mq160Sync();say('🔥 '+who+' assembled the flamespitter at the workbench.')}}
  else if(key==='gate'){if(MQ160.st<3){if(MQ160.E)mq160Win();else{MQ160.st=3;MQ160.trkK='';mq160Sync();say('🔥 '+who+' melted the frozen gate: the road to '+mq160Next()+' is open for you too.')}}}
  else if(key==='drill'){if(MQ170.st<1){if(MQ170.E)mq170Win();else{MQ170.st=1;MQ170.trkK='';mq170Sync();say('⚙️ '+who+' drilled through the mountain: the tunnel to '+mq170Den()+' is open for you too.')}}}})}
// a visiting copy (my own Gorthrak was already slain) falls quietly: no second "the passage opens"
{const f=gb151Won;gb151Won=function(e){if(e&&e.gbV){if(GB151A)GB151A.f=false;gb151Quake(false);gb151ShelterClear();gb151FbSet(0);gb151LairSync();MQ151.e=null;say('🧌 Gorthrak falls again: well fought, together.');try{hud()}catch(_){}return}
  const r=f.apply(this,arguments);try{co151Credit('maw')}catch(_){}return r}}
{const f=mq160Take;mq160Take=function(i){const r=f.apply(this,arguments);try{if(MQ160.p[i])co151Credit('p'+i)}catch(_){}return r}}
{const f=mq160Assemble;mq160Assemble=function(){const r=f.apply(this,arguments);try{if(MQ160.st>=2)co151Credit('asm')}catch(_){}return r}}

// ---------------- Gorthrak: one driver, everyone fights the same troll ----------------
function gb180Has(){const e=MQ151.e;return !!(e&&!e.dead&&e.sv&&mq151InCave())}
function gb180Drv(){if(!co151On())return typeof MP!='undefined'?MP.me:'';let h=gb180Has()&&co151Me()?MP.me:null;
  for(const k in MP.rh){const p=MP.rh[k].pr;if(p&&p.rg===MP.rg&&p.g1&&p.hp>0&&!p.dn&&(h===null||k<h))h=k}return h}
function gb180Auth(){if(!co151On())return true;return gb180Drv()===MP.me}
function gb180Near(e,r){if(!co151On())return false;const m=e.m;for(const k in MP.rh){const p=MP.rh[k].pr;if(p&&p.rg===MP.rg&&p.hp>0&&!p.dn&&Math.hypot(p.x-m.position.x,p.z-m.position.z)<r)return true}return false}
function gb180End(){if(!co151On())return hero.hp<=0||!mq151InCave()||(typeof AWD!='undefined'&&AWD.dead);if(!mq151InCave())return true;if(!gb180Auth())return false;return !co151Standing()}
function gb180Ended(){if(co151On()&&gb180Auth())co151Send(['g1r'])}
// a follower's copy between moves: the driver's facing and spot
function gb180Glide(e,dt){const m=e.m,S=e.sv;if(e.nry!=null){const da=svAng(e.nry-m.rotation.y),t=5*dt;m.rotation.y+=Math.max(-t,Math.min(t,da))}
  if(e.nx!=null&&dt>0){const dx=e.nx-m.position.x,dz=e.nz-m.position.z,l=Math.hypot(dx,dz);if(l>10){m.position.x=e.nx;m.position.z=e.nz}else{const k=Math.min(1,dt*6);m.position.x+=dx*k;m.position.z+=dz*k}S.walkSp=l>.3?2:0}}
// only the driver casts; each cast goes out with its seed and his spot
{const f=svCast;svCast=function(e,id,seed){if(e&&e.gb151&&co151On()&&!gb180Auth()&&!CO151.rx)return;const r=f.apply(this,arguments);
  try{if(e&&e.gb151&&co151On()&&!CO151.rx&&e.sv&&e.sv.mv&&e.sv.mv.id===id){const m=e.m;co151Send(['g1c',id,e.sv.mv.seed,mpR2(m.position.x),mpR2(m.position.z),mpR2(m.rotation.y),e.sv.ph|0])}}catch(_){}return r}}
{const f=gb151Start;gb151Start=function(e){const was=!!(GB151A&&GB151A.f);const r=f.apply(this,arguments);try{if(!was&&GB151A&&GB151A.f&&co151On()&&gb180Auth()&&!CO151.rx)co151Send(['g1st'])}catch(_){}return r}}
{const f=gb151PillarBreak;gb151PillarBreak=function(P){const ok=P&&P.ok;const r=f.apply(this,arguments);try{if(ok&&co151On()&&gb180Auth()&&!CO151.rx)co151Send(['g1p',P.i])}catch(_){}return r}}
// a follower's hits go to the driver (shown here, applied there)
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.gb151&&!e.dead&&co151On()&&!gb180Auth()&&!CO151.ap){d=Math.max(0,Math.round(d));if(!isFinite(d)||!d)return;
    CO151.hq+=d;e.lhT=performance.now();e.c.h+=1e9;try{return f(e,d,s,crit,dot)}finally{e.c.h=Math.max(1,e.c.h-1e9)}}
  return f.apply(this,arguments)}}
// the driver's kill is everyone's kill
{const f=kill;kill=function(e){const r=f.apply(this,arguments);try{if(e&&e.gb151){CO151.kT=performance.now();if(co151On()&&!CO151.rk){co151Send(['g1k']);co151Send(['g1k'])}}}catch(_){}return r}}
function gb180Visit(){const e=gb151Spawn(true);if(e)e.gbV=1;return e}
function gb180Sync(now){const e=MQ151.e;if(!co151On()||!gb180Auth()||!gb180Has()||now-CO151.tS<120||now-(CO151.kT||-1e9)<10000)return;CO151.tS=now;const S=e.sv,m=e.m;
  co151Send(['g1s',Math.round(e.c.h),S.ph|0,mpR2(m.position.x),mpR2(m.position.z),mpR2(m.rotation.y),Math.round((S.po||0)*100),Math.round((S.shell||0)*100),S.crk|0,GB151A&&GB151A.f?1:0,Math.round((S.stg||0)*10),MQ151.quake|0,S.mv?S.mv.id:'',S.mv?S.mv.seed|0:0,S.mv?Math.round(S.mv.t*100):0])}
function gb180OnSync(q){if(!mq151InCave()||gb180Auth())return;let e=MQ151.e;if(!e||e.dead||!enemies.includes(e)){
    // just after a shared kill a late word from a partner's dying copy must not bring him back
    if(performance.now()-(CO151.kT||-1e9)<10000||!(+q[1]>0))return;if(MQ151.st>=2||!e)e=gb180Visit();if(!e)return}
  const S=e.sv,now=performance.now(),[_,h,ph,x,z,ry,po,sh,crk,on,stg,qk]=q;if(!isFinite(x)||!isFinite(z))return;
  e.nx=+x;e.nz=+z;e.nry=+ry||0;const hh=Math.max(1,Math.min(M(e.c),+h||1));e.c.h=now-(e.lhT||0)<600?Math.min(e.c.h,hh):hh;
  if((ph|0)===2&&S.ph!==2&&!(S.mv&&S.mv.id==='awaken')){S.ph=2;e.bs.ph=2}S.po=Math.max(0,Math.min(1,(po|0)/100));S.shell=Math.max(0,Math.min(1,(sh|0)/100));S.crk=crk|0;
  if(!S.mv)S.stg=Math.max(0,(stg|0)/10);if(qk&&!MQ151.quake)gb151Quake(true);
  if(on&&!(GB151A&&GB151A.f)){co151Rx(()=>gb151Start(e));S.on=true}
  // a move whose start message was lost: catch it while it is young
  {const id=q[12],sd=q[13]|0,mt=(q[14]|0)/100;if(typeof id==='string'&&GB151M[id]&&sd&&mt<.6&&e.g1sd!==sd&&!(S.mv&&S.mv.seed===sd)){e.g1sd=sd;co151Rx(()=>{svEndMove(e,true);svStart(e,id,sd)})}}
  if(Math.hypot(e.m.position.x-x,e.m.position.z-z)>14){e.m.position.x=+x;e.m.position.z=+z}}
function gb180OnCast(q){if(!mq151InCave())return;const e=MQ151.e;if(!e||e.dead||!e.sv)return;const [_,id,seed,x,z,ry,ph]=q;if(typeof id!=='string'||!GB151M[id])return;
  const m=e.m;if(isFinite(x)&&isFinite(z)&&Math.hypot(m.position.x-x,m.position.z-z)<14){m.position.x=+x;m.position.z=+z;if(isFinite(ry))m.rotation.y=+ry}
  e.nx=+x;e.nz=+z;e.nry=+ry||0;if(ph===2&&e.sv.ph!==2&&id!=='awaken'){e.sv.ph=2;e.bs.ph=2}
  if(!(GB151A&&GB151A.f))co151Rx(()=>gb151Start(e));e.sv.on=true;
  if(e.g1sd===(seed|0)&&e.sv.mv&&e.sv.mv.id===id)return;e.g1sd=seed|0;
  co151Rx(()=>{svEndMove(e,true);svStart(e,id,Math.max(1,seed|0))})}
function gb180OnKill(){const e=MQ151.e;if(!e||e.dead||!mq151InCave())return;CO151.rk=1;MP.rk=1;try{e.c.h=0;e.dead=1;if(e.hb)e.hb.visible=false;kill(e)}finally{CO151.rk=0;MP.rk=0}}
// presence: whether I have Gorthrak here (the driver is chosen among those who do)
{const f=MP.room.presence;MP.room.presence=function(p){if(p&&typeof p=='object'){try{p.g1=gb180Has()?1:0}catch(_){}}return f.apply(this,arguments)}}

// ---------------- The Frozen Gate: the host runs the melt ----------------
{const f=mq160Start;mq160Start=function(){
  if(co151On()&&!co151Host()&&!CO151.rx){if(MQ160.E||MQ160.st!==2)return;if(nowP()-(CO151.tRq||0)>800){CO151.tRq=nowP();co151Send(['f2rq'])}return}
  const was=!!MQ160.E;const r=f.apply(this,arguments);try{if(!was&&MQ160.E&&co151On()&&co151Host()&&!CO151.rx){MQ160.E.carrier='';co151Send(['f2st'])}}catch(_){}return r}}
{const f=mq160Fail;mq160Fail=function(why){const had=!!MQ160.E;const r=f.apply(this,arguments);try{if(had&&why==='dead'&&co151On()&&co151Host()&&!CO151.rx)co151Send(['f2x'])}catch(_){}return r}}
{const f=mq160Win;mq160Win=function(){const had=!!MQ160.E;const r=f.apply(this,arguments);try{if(had&&co151On()&&co151Host()&&!CO151.rx)co151Send(['f2w']);co151Credit('gate')}catch(_){}return r}}
function co160Input(fire,onGate,now){const k=(fire?1:0)+'|'+(onGate?1:0);if(k===CO151.lf&&(!fire||now-CO151.tF<150))return;CO151.lf=k;CO151.tF=now;co151Send(['f2f',fire?1:0,onGate?1:0])}
function co160Sync(now){const E=MQ160.E;if(!E||now-CO151.tS<150)return;CO151.tS=now;
  // a carrier who left the yard drops it where they were
  if(E.carrier&&E.carrier!==MP.me){const r=MP.rh[E.carrier],p=r&&r.pr;if(!p||p.rg!==MP.rg||p.hp<=0){E.carrier='';E.rfire=0;E.gp=new THREE.Vector3(p?p.x:pl.position.x,GH(p?p.x:pl.position.x,p?p.z:pl.position.z)+.18,p?p.z:pl.position.z);mq160Sync()}
    else if(now-(E.rT||0)>1500)E.rfire=0}
  co151Send(['f2e',Math.round(E.melt*10),Math.round(E.heat*100),E.ovh|0,Math.round(E.charge),E.carrier||'',E.gp?mpR2(E.gp.x):null,E.gp?mpR2(E.gp.z):null,mpR2(E.gry||0),E.fire|0,E.spent|0])}
function co160Apply(q){if(!mq160In2()||co151Host())return;const R=mq160Plan();let E=MQ160.E;
  if(!E){if(Math.hypot(pl.position.x-R.yard.x,pl.position.z-R.yard.z)>MQ160.leash+12)return;if(MQ160.st<2){MQ160.st=2;MQ160.p=[1,1,1];MQ160.gk=[1,1,1]}co151Rx(()=>mq160Start());E=MQ160.E;if(!E)return}
  const [_,melt,heat,ovh,charge,carrier,gx,gz,gry,fire,spent]=q;E.melt=Math.max(0,Math.min(MQ160.melt,(melt|0)/10));E.heat=Math.max(0,Math.min(1,(heat|0)/100));E.ovh=ovh?1:0;E.charge=Math.max(0,charge|0);E.spent=spent|0;MQ160.trkK='';
  const c=typeof carrier==='string'?carrier:'',was=E.carrier||'';E.carrier=c;
  if(c===MP.me&&!E.carry){E.carry=1;E.gp=null;E.want=0;svSnd('heavy',.6,1.5)}else if(c)E.want=0;else if(c!==MP.me&&E.carry&&c){E.carry=0}
  if(!c&&isFinite(gx)&&isFinite(gz)&&gx!==null){E.gp=new THREE.Vector3(+gx,GH(+gx,+gz)+.18,+gz);E.gry=+gry||0}
  if(!E.carry)E.fire=fire?1:0;if(c!==was||!c)mq160Sync()}
function co160OnAsk(q,peer){const E=MQ160.E;if(!E||!co151Host())return;const r=MP.rh[peer],p=r&&r.pr;if(!p)return;
  if(q[1]===1){if(E.carrier||E.carry)return;const sp=E.gp||mq160BenchSpot();if(Math.hypot(p.x-sp.x,p.z-sp.z)>4.5)return;E.carrier=peer;E.gp=null;E.rfire=0;mq160Sync();CO151.tS=0}
  else if(E.carrier===peer){E.carrier='';E.rfire=0;const x=+q[2],z=+q[3];E.gp=new THREE.Vector3(isFinite(x)?x:p.x,GH(isFinite(x)?x:p.x,isFinite(z)?z:p.z)+.18,isFinite(z)?z:p.z);E.gry=+q[4]||0;mq160Sync();CO151.tS=0}}
function co160OnBurn(id){const E=MQ160.E;if(!E||!co151Host())return;const e=enemies.find(q=>q.nid===id&&!q.mir&&!q.dead);if(!e||!(e.fs160sp||e.c.en==='icespider'))return;
  if(E.charge<MQ160.kc)return;E.charge-=MQ160.kc;E.burned++;burst(gY(e.m.position,.4),0xff8a2a,24,1.8,2,.6);try{hurt(e,1e9,{col:'#ff9a3a'},false)}catch(_){}if(!e.dead)try{removeE(e)}catch(_){}}
// spiders hunt the nearest standing hero
{const f=eTarget;eTarget=function(e,m,dpl){if(e&&!e.dead&&(e.fs160sp||e.dr170t&&e.angry)&&co151On()){let tg=co151Me()?pl:null,bd=tg?dpl:1e9;
    for(const k in MP.rh){const r=MP.rh[k];if(!r.act||!r.m||r.pr&&r.pr.dn)continue;const d=m.position.distanceTo(r.m.position);if(d<bd){bd=d;tg=r.m}}return tg||pl}
  return f.apply(this,arguments)}}

// ---------------- The Mountain Drill: the host runs the drill ----------------
{const f=mq170Start;mq170Start=function(){
  if(co151On()&&!co151Host()&&!CO151.rx){if(MQ170.E||mq170Done())return;if(nowP()-(CO151.tRq||0)>800){CO151.tRq=nowP();co151Send(['d3rq'])}return}
  const was=!!MQ170.E;const r=f.apply(this,arguments);try{if(!was&&MQ170.E&&co151On()&&co151Host()&&!CO151.rx)co151Send(['d3st'])}catch(_){}return r}}
{const f=mq170Fail;mq170Fail=function(why){const had=!!MQ170.E;const r=f.apply(this,arguments);try{if(had&&why==='dead'&&co151On()&&co151Host()&&!CO151.rx)co151Send(['d3x'])}catch(_){}return r}}
{const f=mq170Win;mq170Win=function(){const had=!!MQ170.E;const r=f.apply(this,arguments);try{if(had&&co151On()&&co151Host()&&!CO151.rx)co151Send(['d3v']);co151Credit('drill')}catch(_){}return r}}
const CO170_ST={off:'o',on:'n',frozen:'f',fault:'m',smashed:'s'},CO170_SR={o:'off',n:'on',f:'frozen',m:'fault',s:'smashed'};
function co170Sync(now){const E=MQ170.E;if(!E||now-CO151.tS<150)return;CO151.tS=now;co151Send(['d3e',Math.round(E.prog*10),E.box.map(b=>CO170_ST[b.s]||'o').join('')])}
function co170Apply(q){if(!mq170In3()||co151Host())return;const R=mq170Plan();let E=MQ170.E;
  if(!E){if(Math.hypot(pl.position.x-R.yard.x,pl.position.z-R.yard.z)>MQ170.leash+12)return;co151Rx(()=>mq170Start());E=MQ170.E;if(!E)return;E.trT=1e9}
  E.prog=Math.max(0,Math.min(MQ170.need,(q[1]|0)/10));const st=String(q[2]||''),fq=E.fq||{},t=nowP();
  for(let i=0;i<4;i++){const s=CO170_SR[st[i]];if(s==='on'&&fq[i])delete fq[i];
    // a repair of mine the host has not heard yet: keep it lit and ask again
    if(fq[i]&&fq[i]>t){if(t-(E.fT||0)>500){E.fT=t;co151Send(['d3o',i])}continue}
    if(s&&E.box[i].s!==s)co151Rx(()=>dr170Set(i,s))}MQ170.trkK=''}
// a wrecker's wind-up on a partner's screen: the fists rise over the box, the ring shows
function co170Wind(id,b){const e=MP.emap&&MP.emap[id],S=MQ170.S;if(!e||e.dead||!S||!S.box[b])return;e.d3w={t:1.5,b};const B=S.box[b];
  try{svWarn({k:'c',r:1.3},{x:B.x,z:B.z,a:0},1.5,{col:0xff6a2a})}catch(_){}popT(gY(B.g.position,2.4),'⚠ A TROLL IS SMASHING A BOX','#ff9a5a')}
function co170WindTick(dt){if(typeof MP=='undefined'||!MP.on)return;for(const id in MP.emap){const e=MP.emap[id];if(!e||!e.d3w)continue;const w=e.d3w;w.t-=dt;
  if(e.dead||w.t<-.9){e.d3w=null;e.m.ak=null;continue}e.m.ak=w.t>0?{n:'slam',ph:0,k:Math.min(1,1-w.t/1.5)}:w.t>-.25?{n:'slam',ph:1,k:Math.min(1,-w.t/.25)}:{n:'slam',ph:2,k:Math.max(0,1+(w.t+.25)/.65)}}}

// ---------------- the messages ----------------
{const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(MP.on&&!msg.sameTab&&d&&Array.isArray(d.l)){
    for(const q of d.l.slice(0,60)){if(!Array.isArray(q)||typeof q[0]!=='string')continue;const t=q[0];
      if(t==='bq151'){if(typeof q[1]==='string'&&/^(maw|gate|drill|asm|p[012])$/.test(q[1])&&!CO151.got[q[1]]){CO151.got[q[1]]=1;co151Apply(q[1],q[2]||mpName(msg.peer))}continue}
      if(!/^(g1|f2|d3)/.test(t)||d.r!==MP.rg||!co151Peer(msg))continue;
      const fromHost=msg.peer===MP.host,iHost=MP.host===MP.me;
      // Gorthrak
      if(t==='g1h'){if(gb180Auth()&&MQ151.e&&!MQ151.e.dead){const dm=Math.max(0,Math.min(1e6,+q[1]||0));if(dm){CO151.ap=1;try{hurt(MQ151.e,dm,{col:0xc8d0ff},false,true)}finally{CO151.ap=0}MQ151.e.agg=1}}}
      else if(t==='g1k')gb180OnKill();
      // the driver's word: from whoever drives while I do not (presence can lag a moment on who that is; when two drive, the lower id wins)
      else if(msg.peer===gb180Drv()||!gb180Auth()&&(gb180Has()||t==='g1s')||(t==='g1s'&&!gb180Has())){
        if(t==='g1c')gb180OnCast(q);else if(t==='g1s')gb180OnSync(q);
        else if(t==='g1st'){const e=MQ151.e;if(e&&!e.dead&&!(GB151A&&GB151A.f))co151Rx(()=>gb151Start(e))}
        else if(t==='g1r'){if(GB151A&&GB151A.f)co151Rx(()=>gb151Reset(true))}
        else if(t==='g1p'){const P=MQ151.pil[q[1]|0];if(P&&P.ok)co151Rx(()=>gb151PillarBreak(P))}}
      // the Frozen Gate
      else if(t==='f2rq'){if(iHost&&MQ160.st>=2&&!MQ160.E&&mq160In2()&&!mq160Done())co151Rx(()=>{const e0=MQ160.E;mq160Start();if(!e0&&MQ160.E){MQ160.E.carrier='';co151Send(['f2st'])}})}
      else if(t==='f2st'){if(fromHost&&mq160In2()&&!MQ160.E){if(MQ160.st<2){MQ160.st=2;MQ160.p=[1,1,1];MQ160.gk=[1,1,1]}co151Rx(()=>mq160Start())}}
      else if(t==='f2e'){if(fromHost)co160Apply(q)}
      else if(t==='f2c'){if(iHost)co160OnAsk(q,msg.peer)}
      else if(t==='f2f'){const E=MQ160.E;if(iHost&&E&&E.carrier===msg.peer){E.rfire=q[1]?1:0;E.rgate=q[2]?1:0;E.rT=performance.now()}}
      else if(t==='f2k'){if(iHost&&typeof q[1]==='string')co160OnBurn(q[1])}
      else if(t==='f2x'){if(fromHost&&MQ160.E)co151Rx(()=>mq160Fail('dead'))}
      else if(t==='f2w'){if(fromHost&&MQ160.E)co151Rx(()=>mq160Win())}
      else if(t==='f2g'){const i=q[1]|0;if(i>=0&&i<3&&!MQ160.gk[i]){MQ160.gk[i]=1;MQ160.trkK=''}}
      // the Mountain Drill
      else if(t==='d3rq'){if(iHost&&!MQ170.E&&mq170In3()&&!mq170Done())co151Rx(()=>{const e0=MQ170.E;mq170Start();if(!e0&&MQ170.E)co151Send(['d3st'])})}
      else if(t==='d3st'){if(fromHost&&mq170In3()&&!MQ170.E){co151Rx(()=>mq170Start());if(MQ170.E)MQ170.E.trT=1e9}}
      else if(t==='d3e'){if(fromHost)co170Apply(q)}
      else if(t==='d3o'){const i=q[1]|0,E=MQ170.E;if(iHost&&E&&i>=0&&i<4&&E.box[i].s!=='on')dr170Set(i,'on')}
      else if(t==='d3w'){if(fromHost&&typeof q[1]==='string')co170Wind(q[1],q[2]|0)}
      else if(t==='d3x'){if(fromHost&&MQ170.E)co151Rx(()=>mq170Fail('dead'))}
      else if(t==='d3v'){if(fromHost&&MQ170.E)co151Rx(()=>mq170Win())}}}}catch(err){if(!CO151.err++)console.warn('v151 co-op',err)}
  return f.apply(this,arguments)}}
// a warden's death frees its part for everyone in the instance
{const f=kill;kill=function(e){const r=f.apply(this,arguments);try{if(e&&e.fs160g!=null&&co151On())co151Send(['f2g',e.fs160g])}catch(_){}return r}}
// ---------------- the tick: hits to the driver, the driver's sync, presence, credit, wind-ups ----------------
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{if(typeof MP!='undefined'&&MP.on){const t=performance.now();
    if(CO151.hq>0&&t-CO151.tH>150){CO151.tH=t;co151Send(['g1h',CO151.hq]);CO151.hq=0}
    gb180Sync(t);co151Flush(t);
    // a partner's pick-up request: asked again until the host answers (a message can be lost or arrive before my position)
    {const E=MQ160.E;if(E&&E.want>nowP()&&!E.carry&&!E.carrier&&co151On()&&!co151Host()&&nowP()-(E.rq||0)>500){E.rq=nowP();co151Send(['f2c',1])}}co170WindTick(Math.max(0,Math.min(.1,+dt||0)));
    const g=gb180Has()?1:0;if(g!==CO151.g1){CO151.g1=g;MP.lastPres=''}}}catch(err){if(!CO151.err++)console.warn('v151 co-op tick',err)}return r}}
{const f=mpSolo;mpSolo=function(){const r=f.apply(this,arguments);CO151.got={};CO151.cq=[];CO151.hq=0;return r}}
