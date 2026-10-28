// ================= v165 The Dirge main quest — saves, the cheat, co-op =================
// Saves: x2.dg165 {g:{st,ex,bad}, s:{st,cp,cw}, r:{st}, o:{lit,st}}; old saves start at nothing done (heroes already past an instance
// are never blocked: each chapter is also done when the next instance has been reached, 3311).
// Co-op (played together, like Hillside Crest v155): messages ['dg', kind, …] on the 'ev' topic (cl155Send, 3180).
//  · The Keeper's grave: digging it open opens it for everyone ('dig'); wrong graves are your own.
//  · The Sanctum: F at the stair takes every partner in the Dirge I down with you ('enter'); the party's checkpoint is the furthest
//    reached ('scp'); a partner on the plate lifts everyone's gate ('gate'); the closing walls start and stop for all and the knights
//    turn for all ('cw', 'turn'); the flooded stair takes everyone out ('sout').
//  · The raft: F at the quay takes every partner in the Dirge II aboard ('renter'). One raft: the map's host drifts it ('rs': where,
//    which run), runs the drowned (shared monsters: partners see them through the host's monster list and get their states in 'rw'),
//    and decides every plank ('rd' damage, 'rb' torn away, 'rc' the whole deck every second, 'rx' the raft breaks: everyone goes down,
//    'rout' through). A drowned lunging at a partner: 'lg'. A partner who falls and rises again rejoins the host's raft.
//  · The prisms: one charge each; a prism someone carries is empty for everyone ('take', 'ret'), a rune lit by anyone is lit for all
//    ('lit', 'ofin'). The host raises the dead round every carrier (presence oc = the prism carried + 1).
//  · Every 3 s partners swap their whole quest state and keep the most progress ('st').
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{const Q=DG165Q;o.dg165={v:165,g:{st:Q.g.st,ex:Q.g.ex.map(v=>v?1:0),bad:Q.g.bad.map(v=>v?1:0)},s:{st:Q.s.st,cp:Q.s.cp,cw:Q.s.cw?1:0},r:{st:Q.r.st},o:{lit:Q.o.lit.map(v=>v?1:0),st:Q.o.st}}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.dg165,c=(v,a,b)=>Math.max(a,Math.min(b,v|0)),arr=(a,n)=>Array.from({length:n},(_,i)=>Array.isArray(a)&&a[i]?1:0);
  DG165Q.g={st:0,ex:[],bad:[]};DG165Q.s={st:0,cp:0,cw:0};DG165Q.r={st:0};DG165Q.o={lit:[0,0,0,0,0],st:0};
  if(q&&typeof q=='object'){if(q.g){DG165Q.g.st=c(q.g.st,0,2);DG165Q.g.ex=arr(q.g.ex,14);DG165Q.g.bad=arr(q.g.bad,14)}if(q.s){DG165Q.s.st=c(q.s.st,0,2);DG165Q.s.cp=c(q.s.cp,0,5);DG165Q.s.cw=q.s.cw?1:0}
    if(q.r)DG165Q.r.st=c(q.r.st,0,2);if(q.o){DG165Q.o.lit=arr(q.o.lit,5);DG165Q.o.st=q.o.st?1:0}}
  OS165.carry=null;OS165.sipping=null;OS165.net={};try{os165Aura(false)}catch(_){}DG165S.cw=null;DG165S.gate=null;DG165S.fall=null;RT165R=null;DG165GR.dig=null;
  try{dg165GSync()}catch(_){}try{os165GateSync()}catch(_){}}catch(e){console.warn('v165 load',e)}return r}}
// the cheat "All quests complete" (3060) finishes the Dirge's chapters too
{const f=cheatQuests147;cheatQuests147=function(){try{const Q=DG165Q;Q.g.st=2;Q.s.st=2;Q.s.cw=1;Q.r.st=2;Q.o.lit=[1,1,1,1,1];Q.o.st=1;dg165GSync();os165GateSync()}catch(e){console.warn('v165 cheat',e)}return f.apply(this,arguments)}}
// ---------------- co-op ----------------
var DG165C={tS:0,tR:0,tW:0,tC:0,oc:{},err:0};
function dg165CoOn(){try{return typeof cl155Co=='function'&&cl155Co()}catch(_){return false}}
function dg165Co(k,a,b){try{if(!dg165CoOn())return;if(k=='take')(OS165.mine=OS165.mine||{})[a]=1;cl155Send(['dg',k,a==null?0:a,b==null?0:b])}catch(_){}}
function dg165Me(){try{return MP.me}catch(_){return ''}}
{const f=MP.room.presence;MP.room.presence=function(p){if(p&&typeof p=='object'){try{p.oc=OS165.carry?OS165.carry.i+1:0}catch(_){}}return f.apply(this,arguments)}}
{const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(dg165CoOn()||(typeof cl155On=='function'&&cl155On())){if(!msg.sameTab&&d&&Array.isArray(d.l)&&MP.rh[msg.peer])for(const q of d.l.slice(0,60))if(Array.isArray(q)&&q[0]==='dg')dg165On(q,msg.peer)}}
  catch(err){if(!DG165C.err++)console.warn('v165 coop',err)}return f.apply(this,arguments)}}
function dg165On(q,peer){const k=q[1],a=q[2],b=q[3],I=curIns(),g=I?I.g:-1;
  if(k=='dig'){if(!dg165GDone()){DG165Q.g.st=2;dg165GSync();say('🕯 '+mpEsc(mpName(peer))+' dug open the Keeper’s grave: a stair leads down.')}return}
  // the Sanctum
  if(k=='enter'){if(g===20&&!dg165SIn()&&!dg165SDone()){say('🕯 '+mpEsc(mpName(peer))+' takes the party down into the Hidden Sanctum.');dg165SEnter()}return}
  if(k=='scp'){if((a|0)>DG165Q.s.cp&&(a|0)<=5)DG165Q.s.cp=a|0;return}
  if(k=='gate'){if(dg165SIn()&&DG165S.S&&!(DG165S.gate&&DG165S.gate.open)&&DG165Q.s.cp<3){DG165S.gate={open:1,t:DG165SP.gateT,y:0};dg165SDoors();say('⚙ '+mpEsc(mpName(peer))+' stands on the plate: the portcullis is rising!')}return}
  if(k=='cw'){if(a==2){if(!DG165Q.s.cw){DG165Q.s.cw=1;if(DG165S.cw)DG165S.cw.ph='done';dg165SDoors()}}else if(a==1&&dg165SIn()&&DG165S.S&&!DG165S.cw&&!DG165Q.s.cw){const [hu,hv]=dg165SL(pl.position.x,pl.position.z);if(dg165SanFloor(hu,hv)=='walls'||DG165Q.s.cp>=4){dg165SCwStart(DG165S.S)}}return}
  if(k=='turn'){const S=DG165S.S,s=S&&S.statues[a|0];if(s&&DG165S.cw&&DG165S.cw.ph=='run'&&s.f!==(b&3)&&!s.anim){const a0=s.g.rotation.y;s.f=b&3;s.anim={t:0,a:a0,b:a0+Math.PI/2};dg165Snd('grind',.4,1.4)}return}
  if(k=='sout'){if(dg165SIn())dg165SFinish();else DG165Q.s.st=Math.max(DG165Q.s.st,1);return}
  // the raft
  if(k=='renter'){if(g===21&&!rt165In()&&!dg165RDone()){say('🌊 '+mpEsc(mpName(peer))+' takes the party aboard the raft.');rt165Enter()}return}
  if(k=='rs'){const R=RT165R;if(!R||!rt165In()||peer!==MP.host)return;if((b|0)&&(b|0)!==R.id){rt165Reset();RT165R.id=b|0}const R2=RT165R;R2.hs=+a;if(R2.ph=='moor'&&+a>2.3){R2.ph='run';R2.t=0}return}
  if(k=='rd'){const R=RT165R,C=R&&R.cells[a|0];if(C&&C.alive&&peer===MP.host){C.hp=Math.min(C.hp,+b);C.shk=1}return}
  if(k=='rb'){const R=RT165R,C=R&&R.cells[a|0];if(C&&C.alive&&peer===MP.host)rt165Break(R,C,false);return}
  if(k=='rc'){const R=RT165R;if(!R||peer!==MP.host||typeof a!='string')return;for(let i=0;i<R.cells.length&&i<a.length;i++){const C=R.cells[i];if(a[i]==='0'&&C.alive)rt165Break(R,C,false)}return}
  if(k=='rx'){const R=RT165R;if(R&&peer===MP.host)rt165Shatter(R,false);return}
  if(k=='rw'){const R=RT165R;if(!R||typeof a!='string')return;a.split(';').forEach(s=>{const [id,st]=s.split(':'),e=MP.emap&&MP.emap[id];if(e&&e.dg165w)e.dg165w.net=DG165CST[st|0]||null});return}
  if(k=='lg'){if(b===dg165Me()){const e=MP.emap&&MP.emap[a];if(e&&!e.dead&&Math.hypot(pl.position.x-e.m.position.x,pl.position.z-e.m.position.z)<2.8)try{hitHero(e,.85)}catch(_){}}return}
  if(k=='rout'){if(rt165In()&&RT165R&&!RT165R.fin){RT165R.fin=1;rt165Finish()}return}
  // the prisms
  if(k=='take'){OS165.net=OS165.net||{};OS165.net[a|0]=peer;OS165.trkK='';return}
  if(k=='ret'){if(OS165.net)delete OS165.net[a|0];return}
  if(k=='lit'){if(OS165.net)delete OS165.net[a|0];if(!DG165Q.o.lit[a|0]){os165Give(a|0,false);say('◆ '+mpEsc(mpName(peer))+' lit the '+OS165.nm[a|0]+' rune.')}return}
  if(k=='ofin'){if(!DG165Q.o.st){DG165Q.o.lit=[1,1,1,1,1];os165Finish()}return}
  // everything at once: keep the most progress
  if(k=='st'&&typeof a=='string'){try{const o=JSON.parse(a);if(o.g>=2&&!dg165GDone()){DG165Q.g.st=2;dg165GSync()}if(o.cp>DG165Q.s.cp&&o.cp<=5)DG165Q.s.cp=o.cp;if(o.cw&&!DG165Q.s.cw)DG165Q.s.cw=1;
    if(Array.isArray(o.lit))o.lit.forEach((v,i)=>{if(v&&!DG165Q.o.lit[i])os165Give(i,false)})}catch(_){}}}
var DG165CST=['swim','rise','cling','rake','lunge','flinch','drop','sink','tread'];
// each frame: the host sends the raft, the drowned, the deck; partners' copies of the drowned get their looks; the whole state now and then
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{if(dg165CoOn())dg165CoTick(dt,now)}catch(e){if(!DG165C.err++)console.warn('v165 coop tick',e)}return r}}
function dg165CoTick(dt,now){const host=rt165Host();
  if(rt165In()&&RT165R){const R=RT165R;
    if(host){if(now-DG165C.tR>240){DG165C.tR=now;cl155Send(['dg','rs',Math.round(R.s*100)/100,R.id])}
      if(now-DG165C.tW>320){DG165C.tW=now;const L=[];R.W.forEach(w=>{if(w.e.nid&&!w.e.dead){const st=w.st=='cling'&&w.act?w.act.k:w.st;L.push(w.e.nid+':'+Math.max(0,DG165CST.indexOf(st)))}});if(L.length)cl155Send(['dg','rw',L.join(';').slice(0,3000),0])}
      if(now-DG165C.tC>1000){DG165C.tC=now;cl155Send(['dg','rc',R.cells.map(C=>C.alive?'1':'0').join(''),0])}}
    else{// follow the host's raft: ease toward where it says
      if(R.hs!=null){const d=R.hs-R.s;if(Math.abs(d)>12)R.s=R.hs;else R.s+=d*Math.min(1,dt*2.5);R.v=Math.max(0,R.v)}}
    // partners' copies of the host's drowned
    enemies.forEach(e=>{if(e.mir&&!e.dg165w&&e.c&&(e.c.en=='dgwretch'||e.c.en=='drowned')&&!e.dead){e.dg165w={st:'swim',ph:Math.random()*6,hulk:e.c.en=='drowned',rid:R.id,t:0};e.hid=1;e.m.children.forEach(c=>{if(c.isMesh&&c.geometry&&c.geometry.type=='RingGeometry')c.visible=false})}})}
  // the host raises the dead round partners who carry a prism's essence
  if(host&&os165In()){try{for(const r of cl155Mates(MP.rg)){const p=r.pr,oc=p&&p.oc|0;if(!oc||!r.m)continue;const T=DG165C.oc[r.peer]=DG165C.oc[r.peer]||{sp:OS165.first,n:0,live:[]};T.live=T.live.filter(e=>!e.dead&&enemies.includes(e));T.sp-=dt;
      if(T.sp<=0){T.sp=OS165.gap*(.8+Math.random()*.4);T.n++;if(T.live.length<OS165.cap)os165Rise(r.m.position.x,r.m.position.z,T.n%5==0?3:2,T,r.peer)}}}catch(_){}}
  if(now-DG165C.tS>3000){DG165C.tS=now;cl155Send(['dg','st',JSON.stringify({g:DG165Q.g.st,cp:DG165Q.s.cp,cw:DG165Q.s.cw,lit:DG165Q.o.lit}),0])}}
// the raft breaking takes everyone down (no revive: the water has them)
{const f=rv148CanDown;rv148CanDown=function(){try{if(rt165In()&&RT165R&&RT165R.ph=='broken')return false}catch(_){}return f.apply(this,arguments)}}
// a partner who rises again while the party is still on the channel rejoins the host's raft instead of starting over
{const f=rt165Rise;rt165Rise=function(){if(dg165CoOn()&&!rt165Host()){hero.hp=heroMax();hero.mp=mpMax();try{party.forEach(c=>c.h=M(c))}catch(_){}const P=rt165P(),[x,z]=P.at(2,0);toPos(x,z,0);const id=RT165R?RT165R.id:0;rt165Reset();RT165R.id=id;say('🌊 You haul yourself back onto the raft.');return}return f.apply(this,arguments)}}
// the death screen says where you will really wake
{const f=awDie;awDie=function(){const r=f.apply(this,arguments);try{const el=document.querySelector('#dth .dw');if(el){if(dg165SIn())el.textContent='You will wake at the last checkpoint of the Sanctum ('+dg165SSpot(DG165Q.s.cp).name+'), healed.';
  else if(rt165In())el.textContent='You will wake on a fresh raft at the mouth of the Black Channel.'}}catch(_){}return r}}
