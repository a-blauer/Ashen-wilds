// ================= v155: the Hillside Crest main quest together (co-op) =================
// Owner: "When playing co-op I want the quests to be a shared experience, not separate." Playing together (partners in the same
// map), the three Hillside chapters are played as one party:
//  · Abeksi (3150–3155): F at the cleft takes every partner in Hillside Crest I into the city with you. One world (the map's host,
//    MP.host) runs the snakes for everyone: their eyes watch every hero (partners' spots and crouch come from presence), partners'
//    footsteps and the rats they scare are heard by the host's snakes (['ab','n',…]), and the host sends the snakes' state to the
//    others (['ab','s',…], 6 a second, the snakes near each partner), who show them as they are. Whoever is spotted, the whole
//    party goes back to the party's checkpoint (['ab','c',snake,peer]); the checkpoint is the furthest any of you reached
//    (['ab','cp',i]). Slipping through the drain takes the whole party out together (['ab','out']).
//  · The Hilltop Ascent (3160–3162): F at the hill road takes every partner in Hillside Crest II up with you (everyone needs a
//    mount; no joining a chase already under way). Each rider rides their own mount, but there is one Skarrith: the host's world
//    runs it after the rearmost rider still riding (['cs','n',s,v] 10 a second), aims every venom volley and strike at a rider
//    (['cs','v',…], ['cs','k',peer,lane]) and each rider's own world checks its own hits. Riders tell each other where they are
//    (['cs','p',…]: partners are drawn exactly on the trail, jumps too). A rider who falls (three hits or swallowed) watches the
//    others ride on (spectating: the camera follows the leading rider, their hero hidden). If a rider gets through the crack
//    (['cs','w']) the fallen arrive in Hillside Crest III too, lying downed beside the entrance (3085's revive, with a long
//    timer) for their partner to revive. If everyone falls, the chase starts again for all (['cs','re']).
//  · The Gate of the Hydra (3170): the Wind Stones' serpents, the song's verses and the opening are shared (['hd',…]); partners
//    also swap their whole state every few seconds and keep the most progress, so a partner who arrives later catches up.
// Presence carries cr (crouching in Abeksi), af (frozen: caught), hm (owns a mount), cs (chase: 1 intro · 2 riding · 3 fallen /
// watching · 4 through). Solo play is unchanged.
var CL155={q:[],tF:0,err:0,tM:0};
function cl155On(){return typeof MP!='undefined'&&MP.on&&typeof MPX!='undefined'&&!!MPX.be}
function cl155Mates(rg){const out=[];if(!cl155On())return out;for(const k in MP.rh){const r=MP.rh[k];if(r&&r.pr&&r.pr.rg===rg&&rg>-2)out.push(r)}return out}
function cl155Co(){return cl155On()&&MP.rg>=0&&cl155Mates(MP.rg).length>0}
function cl155Send(e){if(cl155On())CL155.q.push(e)}
function cl155Flush(now){if(!CL155.q.length||now-CL155.tF<90)return;CL155.tF=now;if(!cl155On()){CL155.q.length=0;return}
  while(CL155.q.length){const l=[];let n=2;while(CL155.q.length&&l.length<40){const s=JSON.stringify(CL155.q[0]).length;if(l.length&&n+s>3600)break;l.push(CL155.q.shift());n+=s+1}
    try{MP.room.emit('ev',{r:MP.rg,l}).catch(()=>{})}catch(_){}}}
const cl155R1=v=>Math.round(v*10)/10,cl155R2=v=>Math.round(v*100)/100;
// presence: crouch, frozen, a mount, the chase
{const f=MP.room.presence;MP.room.presence=function(p){if(p&&typeof p=='object'){try{p.cr=ab152In()&&AB152H.cr?1:0;p.af=ab152In()&&(AB152H.frz||AB152H.cau)?1:0;p.hm=mounts.length?1:0;
    const R=CH153.R;p.cs=ch153In()&&R?(R.ph=='intro'?1:R.ph=='run'?2:R.ph=='win'?4:3):0}catch(_){}}return f.apply(this,arguments)}}
// messages
{const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(cl155On()&&!msg.sameTab&&d&&Array.isArray(d.l)&&MP.rh[msg.peer])for(const q of d.l.slice(0,60)){
    if(!Array.isArray(q))continue;const t=q[0];if(t==='ab')ab155On(q,msg.peer);else if(t==='cs')cs155On(q,msg.peer);else if(t==='hd')hd155On(q,msg.peer)}}
  catch(err){if(!CL155.err++)console.warn('v155 coop',err)}return f.apply(this,arguments)}}

// ================= Abeksi together =================
var AB155={rx:0,tS:0,tC:0,cpS:0,entering:0,U:{}};
function ab155Co(){return ab152In()&&cl155Co()}
function ab155Lead(){return !ab155Co()||MP.host===MP.me||!MP.host}
// every hero the host's snakes can see: me (AB152H itself, live values) and each partner in the city
function ab155Heroes(){const S=AB152.S,I=S.I,L=[AB152H];
  for(const r of cl155Mates(MP.rg)){const p=r.pr;if(!(p.hp>0))continue;const u=p.x-I.x0,v=p.z-I.y0;L.push({u,v,cr:p.cr?1:0,lit:ab152Light(u,v),live:!p.af,peer:r.peer})}return L}
// the host's snakes look at every hero (the one each sees best); the others' snakes follow the host's
{const f=ab152ActTick;ab152ActTick=function(a,dt,now,H){if(!ab155Co())return f.apply(this,arguments);
  if(!ab155Lead()){ab155Follow(a,dt);return null}
  const L=AB155.hs||[H];let best=null,br=0,nb=null,nd=1e9;
  for(const h of L){if(!h.live)continue;const r=ab152Sees(a,h.u,h.v,h.cr,h.lit);if(r>br){br=r;best=h}const d=Math.hypot(h.u-a.u,h.v-a.v);if(d<nd){nd=d;nb=h}}
  const tg=best||nb||H,r=f.call(this,a,dt,now,tg);if(r=='caught')a.cBy=tg.peer||MP.me;return r}}
function ab155Follow(a,dt){a.t+=dt;const T=a.net;if(!T)return;const k=Math.min(1,dt*8);
  if(Math.hypot(T.u-a.u,T.v-a.v)>4){a.u=T.u;a.v=T.v}else{a.u+=(T.u-a.u)*k;a.v+=(T.v-a.v)*k}
  let dy=T.yaw-a.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));a.yaw+=dy*k;a.hy+=(T.hy-a.hy)*k;a.ht=a.hy/.6;
  a.st=T.st;a.sus=T.sus;a.mv=T.mv;a.pi=T.pi;a.seen=T.sus>0&&T.st!='routine'?1:0}
{const f=ab152ResetActor;ab152ResetActor=function(a){a.net=null;return f.apply(this,arguments)}}
const AB155ST=['routine','look','investigate','return','caught'];
{const f=ab152Tick;ab152Tick=function(dt,now){const co=ab155Co();AB155.hs=co&&ab155Lead()&&AB152.S?ab155Heroes():null;const r=f.apply(this,arguments);
  try{if(ab152In()&&AB152.S){const S=AB152.S;
    // the host: the snakes near each partner, 6 a second
    if(co&&ab155Lead()&&now-AB155.tS>160){AB155.tS=now;const I=S.I,ps=cl155Mates(MP.rg).map(r=>[r.pr.x-I.x0,r.pr.z-I.y0]);let flat=[],n=0;
      S.acts.forEach((a,i)=>{if(!ps.some(p=>Math.hypot(p[0]-a.u,p[1]-a.v)<44))return;flat.push(i,cl155R1(a.u),cl155R1(a.v),cl155R2(a.yaw),cl155R2(a.hy),Math.max(0,AB155ST.indexOf(a.st)),Math.round(a.sus),cl155R1(a.mv||0),a.pi|0);
        if(++n>=40){cl155Send(['ab','s',flat]);flat=[];n=0}});if(flat.length)cl155Send(['ab','s',flat])}
    // the party's checkpoint
    if(co&&(AB152Q.cp>AB155.cpS||now-AB155.tC>3000)){AB155.tC=now;AB155.cpS=AB152Q.cp;cl155Send(['ab','cp',AB152Q.cp])}}}catch(e){if(!CL155.err++)console.warn('v155 abeksi',e)}
  return r}}
// a guest's noises are heard by the host's snakes
{const f=ab152Hear;ab152Hear=function(u,v,r,why){if(!AB155.rx&&ab155Co()&&!ab155Lead()){cl155Send(['ab','n',cl155R1(u),cl155R1(v),cl155R1(r),String(why||'noise').slice(0,8)]);return}return f.apply(this,arguments)}}
// spotted: the whole party goes back
{const f=ab152Caught;ab152Caught=function(a){const co=ab155Co(),was=!!AB152H.cau;const r=f.apply(this,arguments);
  try{if(!was&&co&&ab155Lead()&&!AB155.rx){const S=AB152.S;cl155Send(['ab','c',S.acts.indexOf(a),a.cBy||MP.me]);if(a.cBy&&a.cBy!==MP.me)say('👁 '+mpEsc(mpName(a.cBy))+' was seen! The whole party goes back.')}}catch(_){}return r}}
// entering together (the leader's checkpoint), side by side
{const f=ab152Enter;ab152Enter=function(){const co=cl155Co()&&!AB155.rx;AB155.entering=1;const r=f.apply(this,arguments);if(co)cl155Send(['ab','go',AB152Q.cp]);setTimeout(()=>{AB155.entering=0},1500);return r}}
{const f=ab152Restart;ab152Restart=function(first){if(!ab152In()&&!AB155.entering&&AB152Q.st>=2)return;const r=f.apply(this,arguments);
  // partners stand side by side across the checkpoint (sorted by peer id: everyone works out the same order)
  try{if(cl155On()&&Object.keys(MP.rh).length){const ids=[MP.me].concat(Object.keys(MP.rh)).sort(),k=ids.indexOf(MP.me);if(k>0){const c=ab152Spot(AB152Q.cp),S=AB152.S,G=S.G,I=S.I,o0=Math.ceil(k/2)*(k%2?1:-1)*.95;
      for(const off of [o0,-o0,o0*.5]){const x=c.x+Math.cos(c.ry)*off,z=c.z-Math.sin(c.ry)*off,u=Math.round(x-I.x0),v=Math.round(z-I.y0);
        if(u>=0&&v>=0&&u<G.W&&v<G.H&&!G.sol[v*G.W+u]&&G.cls[v*G.W+u]<2){pl.position.x=x;pl.position.z=z;pl.position.y=GH(x,z);break}}}}}catch(_){}return r}}
// out through the drain together
{const f=ab152Finish;ab152Finish=function(){const co=ab155Co()&&!AB155.rx;if(co&&!AB152H.cau)cl155Send(['ab','out']);return f.apply(this,arguments)}}
function ab155On(q,peer){const k=q[1],S=AB152.S,nm=mpEsc(mpName(peer));
  if(k==='go'){let g=-1;try{g=curIns().g}catch(_){}if(g!==5||ab152In()||AF||hero.hp<=0||(typeof RV148!='undefined'&&RV148.down))return;
    AB152Q.cp=Math.max(0,Math.min(5,q[2]|0));say('👥 '+nm+' leads the way into Abeksi — you follow.');AB155.rx=1;try{ab152Enter()}finally{AB155.rx=0}}
  else if(k==='cp'&&Number.isInteger(q[2])){const i=Math.max(0,Math.min(5,q[2]));if(i>AB152Q.cp&&AB152Q.st>=1&&AB152Q.st<2){AB152Q.cp=i;AB155.cpS=i;if(ab152In())try{pickup({ic:'✦',t:'Checkpoint',col:'#ffe07a',sub:ab152Plan().CP[i][3]+' · '+mpName(peer)})}catch(_){}}}
  else if(!ab152In()||!S)return;
  else if(k==='s'&&Array.isArray(q[2])&&!ab155Lead()&&peer===MP.host){const F=q[2];for(let j=0;j+8<F.length;j+=9){const a=S.acts[F[j]];if(!a)continue;
      a.net={u:+F[j+1],v:+F[j+2],yaw:+F[j+3],hy:+F[j+4],st:AB155ST[F[j+5]]||'routine',sus:+F[j+6]||0,mv:+F[j+7]||0,pi:F[j+8]|0};if(a.path&&a.net.pi>=a.path.length)a.net.pi=0}}
  else if(k==='n'&&ab155Lead()){AB155.rx=1;try{ab152Hear(+q[2],+q[3],Math.min(12,+q[4]||0),String(q[5]||'noise'))}finally{AB155.rx=0}}
  else if(k==='c'&&peer===MP.host){const a=S.acts[q[2]|0];if(!a||AB152H.cau)return;AB155.rx=1;try{ab152Caught(a)}finally{AB155.rx=0}
    if(q[3]&&q[3]!==MP.me)say('👁 '+mpEsc(mpName(q[3]))+' was seen! The whole party goes back.')}
  else if(k==='out'){AB155.rx=1;try{if(AB152H.cau){AB152H.cau=null;AB152H.frz=0}say('👥 '+nm+' found the drain — you slip out together.');ab152Finish()}finally{AB155.rx=0}}}
// partners crouch on screen (an exact undo each frame, like the hero's own crouch layer)
function ab155CrPose(r,on){const U=AB155.U[r.peer]||(AB155.U[r.peer]=[]);for(let i=U.length-1;i>=0;i--){const u=U[i];if(u[0][u[1]]===u[3])u[0][u[1]]=u[2]}U.length=0;
  if(!on||!r.m||!r.m.bones)return;const B=r.m.bones,add=(b,ax,v)=>{if(!b)return;const R=ax=='py'?b.position:b.rotation,a=ax=='py'?'y':ax,p=R[a];R[a]=p+v;U.push([R,a,p,R[a]])};
  [['lh0',-.95],['rh0',-.95],['lh1',1.35],['rh1',1.35],['lh2',-.42],['rh2',-.42],['spine',.38],['chest',.14],['head',-.3],['aL0',-.3],['aR0',-.3],['aL1',-.35],['aR1',-.35]].forEach(([n,v])=>add(B[n],'x',v));add(B.pelvis,'py',-.2)}

// ================= the Hilltop Ascent together =================
var CS155={p:{},won:{},n:null,tP:0,tN:0,rx:0,out:0,reT:0};
function cs155Co(){return ch153In()&&cl155Co()}
function cs155Rider(peer){const q=CS155.p[peer];if(!q)return null;const age=Math.min(.35,(nowP()-q.t)/1000);return {peer,s:q.s+(q.ph==2?q.v*age:0),o:q.o,y:q.y,v:q.v,ph:q.ph,hp:q.hp}}
// partners still riding (in this chase, heard from in the last 2.5 s)
function cs155Alive(){const out=[];for(const r of cl155Mates(MP.rg)){const q=CS155.p[r.peer];if(!q||nowP()-q.t>2500)continue;if(q.ph==1||q.ph==2)out.push(cs155Rider(r.peer))}return out}
function cs155Riders(){const R=CH153.R,L=cs155Alive();if(R&&(R.ph=='run'||R.ph=='intro'))L.push({peer:MP.me,s:R.s,o:R.o,y:R.y,v:R.v,ph:R.ph=='run'?2:1,me:1});return L}
function cs155Won(){return Object.keys(CS155.won).length>0}
// the one Skarrith: the host's world drives it, the others follow; everyone animates it and checks their own hits
{const f=ch153SnakeTick;ch153SnakeTick=function(dt,now){const R=CH153.R;if(!R||!cs155Co()||R.ph=='intro'||R.ph=='win')return f.apply(this,arguments);return cs155Snake(dt,now)}}
function cs155Snake(dt,now){const S=CH153.S,K=S.K,R=CH153.R,N=R.sn,lead=MP.host===MP.me||!MP.host;N.st='run';
  const run=cs155Riders().filter(q=>q.ph==2),tg=run.length?run.reduce((a,b)=>b.s<a.s?b:a):null;
  if(lead){
    if(tg){const gap=tg.s-N.s,B=CH153V.band;let v=CH153V.spd*.93+Math.max(B[2],Math.min(B[3],(gap-B[0])*B[1]));if(R.ph=='run'&&R.t<3)v=Math.min(v,CH153V.slow0);N.v+=(v-N.v)*Math.min(1,dt*2);N.s+=N.v*dt;
      const ph=K.venom.filter(q=>tg.s>=q[0]).pop();if(ph&&!N.strike){N.spit-=dt;if(N.spit<=0){N.spit=ph[1]*(.85+Math.random()*.3);N.rear=1;N.spitAt=.42;N.spitN=ph[2];N.spitTg=tg.peer}}
      if(N.spitAt!=null){N.spitAt-=dt;if(N.spitAt<=0){N.spitAt=null;const t2=run.find(q=>q.peer===N.spitTg)||tg,L=ch153SpitPlan(N.spitN,t2.s,t2.o,t2.v);
        cl155Send(['cs','v',N.spitN,L.map(q=>[cl155R1(q[0]),cl155R2(q[1])])]);ch153SpitSpawn(L,N.spitN)}}
      const sk=CH153V.strike;N.next-=dt;const busy=S.obs.some(q=>q.k!='gap'&&q.k!='log'&&q.s>tg.s-2&&q.s<tg.s+tg.v*1.1+5);
      if(!N.strike&&N.next<=0&&gap<sk[0]&&tg.s>110&&!busy){N.next=tg.s>600?sk[2]:sk[1];N.strike={t:0,o:tg.o,s0:N.s,tg:tg.peer};cl155Send(['cs','k',tg.peer,cl155R2(tg.o)]);try{svSnd('hiss',1.2,.8)}catch(_){}}}
    else{N.v*=Math.max(0,1-dt*2);N.s+=N.v*dt}
    if(now-CS155.tN>100){CS155.tN=now;cl155Send(['cs','n',cl155R1(N.s),cl155R1(N.v)])}}
  else{const n=CS155.n;if(n){const want=n.s+n.v*Math.min(.4,(nowP()-n.t)/1000);N.v=n.v;N.s+=N.v*dt;if(Math.abs(want-N.s)>8)N.s=want;else N.s+=(want-N.s)*Math.min(1,dt*5)}}
  // the strike: it tracks its rider while it draws back; that rider's own world checks the hit
  if(N.strike){const T=N.strike,me=T.tg===MP.me,tr=me?(R.ph=='run'?R:null):cs155Rider(T.tg);T.t+=dt;if(T.t<.75&&tr)T.o+=(tr.o-T.o)*Math.min(1,dt*3.2);
    if(T.t>=1.05&&!T.hit){T.hit=1;if(me&&R.ph=='run'){if(Math.abs(R.o-T.o)<1.25&&R.y<1.2)ch153Hit('strike');else try{pickup({ic:'💨',t:'Dodged!',col:'#c8ff90'})}catch(_){}}}
    if(T.t>1.6)N.strike=null}
  if(R.ph=='run'&&R.s-N.s<CH153V.catch)ch153Die('swallow');
  N.rear=Math.max(0,N.rear-dt*1.6);N.o+=((tg?tg.o*.5:0)-N.o)*Math.min(1,dt*1.5);
  // a strike at a partner is drawn round that partner
  const T=N.strike;let keep=null;if(T&&T.tg!==MP.me){const q=cs155Rider(T.tg);if(q){keep=[R.s,R.o];R.s=q.s;R.o=q.o}}
  try{ch153SnakeAnim(now)}finally{if(keep){R.s=keep[0];R.o=keep[1]}}}
// falling with partners still riding: watch them; when nobody rides any more, either follow the winners to III or start again
{const f=ch153Tick;ch153Tick=function(dt,now){const R=CH153.R;if(!R)return f.apply(this,arguments);const co=cs155Co();
  try{if(co){let m=null;cs155Alive().forEach(q=>{if(q.ph==2&&(m==null||q.s>m))m=q.s});CH153.lead=m}else CH153.lead=null}catch(_){}
  if(co&&R.ph=='dead'&&R.dead.t+Math.max(0,dt)>=2.0&&!R.dead.fade&&!R.dead.co){R.dead.co=1;const al=cs155Alive();
    if(al.length){R.ph='spec';R.spec={t:0,wait:0};const n=al.map(q=>mpName(q.peer)).join(', ');say('👁 You fell. Watch '+mpEsc(n)+' ride on — if they get through, they can revive you on the other side.')}
    else if(cs155Won()){cs155Out();return}
    else{CS155.reT=nowP();cl155Send(['cs','re']);[500,1100].forEach(t=>setTimeout(()=>cl155Send(['cs','re']),t))}}
  if(R.ph=='spec'){cs155Spec(dt,now);cs155Tell(now);return}
  const r=f.apply(this,arguments);if(co)cs155Tell(now);return r}}
function cs155Tell(now){const R=CH153.R;if(!R||now-CS155.tP<100)return;CS155.tP=now;const ph=R.ph=='intro'?1:R.ph=='run'?2:R.ph=='win'?4:3;
  cl155Send(['cs','p',cl155R1(R.ph=='spec'?-99:R.s),cl155R2(R.o),cl155R2(R.y||0),ph,R.hp|0,cl155R1(R.v||0)])}
function cs155Spec(dt,now){const R=CH153.R,S=CH153.S,P=S.P,K=S.K;R.t+=dt;R.spec.t+=dt;
  const al=cs155Alive();
  // a partner back at the foot of the trail (the chase started again for them): start again with them
  if(al.some(q=>q.ph==1)&&!R.spec.fade&&R.spec.t>.5){R.spec.fade=1;CS155.won={};fadeTo(()=>{pl.visible=true;if(mModel)mModel.visible=true;ch153Reset(false)})}
  if(!al.length){if(cs155Won()){cs155Out();return}if(!R.spec.wait)R.spec.wait=nowP();
    if(nowP()-R.spec.wait>1600&&!R.spec.fade){R.spec.fade=1;fadeTo(()=>{pl.visible=true;if(mModel)mModel.visible=true;ch153Reset(false)})}}
  else R.spec.wait=0;
  const fo=al.length?al.reduce((a,b)=>b.s>a.s?b:a):null;
  // the rider I watch is suddenly far back down the trail: the chase started again for them, so it does for me
  if(fo&&R.spec.lastS!=null&&fo.s<R.spec.lastS-25&&!R.spec.fade){R.spec.fade=1;CS155.won={};fadeTo(()=>{pl.visible=true;if(mModel)mModel.visible=true;ch153Reset(false)})}
  if(fo){R.s=fo.s;R.o=fo.o;R.v=fo.v;R.spec.who=fo.peer;R.spec.lastS=fo.s}R.y=0;
  pl.visible=false;if(typeof mModel!='undefined'&&mModel)mModel.visible=false;
  const [x,z,h]=P.at(R.s,R.o);pl.position.set(x,h,z);pl.rotation.y=P.yaw(R.s);if(mModel)mModel.position.copy(pl.position);
  ch153SnakeTick(dt,now);ch153FxTick(dt,now);
  const tn=R.s>K.tunnel[0]-4&&R.s<K.tunnel[1]+4;R.dark=(R.dark||0)+((tn?1:0)-(R.dark||0))*Math.min(1,dt*2)}
// the fallen arrive in Hillside Crest III with the winners, lying there to be revived
function cs155Out(){if(CS155.out)return;CS155.out=1;CH153Q.st=2;CH153.lv=1;
  fadeTo(()=>{CH153.R=null;pl.visible=true;if(typeof mModel!='undefined'&&mModel)mModel.visible=true;const N=INSL[7];insArrive(N);insMark(N);
    setTimeout(()=>{CS155.out=0;cs155Downed()},900)})}
function cs155Downed(n){const rg=mpCurRg(),st=cl155Mates(rg).filter(r=>r.pr.hp>0&&!r.pr.dn);
  if(!st.length){if((n|0)<6){setTimeout(()=>cs155Downed((n|0)+1),700);return}say('🐍 Your partners got through — you come to on the hilltops.');return}
  if(MP.rg!==rg)try{mpRoles(performance.now())}catch(_){}
  try{rv148Fall();RV148.T=RV155.T;RV148.t=RV155.T;RV148.since=performance.now()+5000;RV148.long=1}catch(e){console.warn('v155 downed',e)}
  say('💀 You fell on the mountain — '+mpEsc(st.map(r=>mpName(r.peer)).join(', '))+' got through and carried on. They can revive you here (F beside you).');cl155Send(['cs','dn'])}
var RV155={T:180};
{const f=rv148Up;rv148Up=function(){const r=f.apply(this,arguments);if(RV148.long){RV148.long=0;RV148.T=30}return r}}
{const f=rv148Die;rv148Die=function(){const r=f.apply(this,arguments);if(RV148.long){RV148.long=0;RV148.T=30}return r}}
{const f=ch153Win;ch153Win=function(){const R=CH153.R,was=R&&R.ph;const r=f.apply(this,arguments);if(was=='run'&&CH153.R&&CH153.R.ph=='win'&&cs155Co())cl155Send(['cs','w']);return r}}
// riding up together: every partner in Mistmere comes too (they all need a mount)
{const f=ch153Enter;ch153Enter=function(){CS155.won={};CS155.p={};CS155.n=null;if(!CS155.rx&&cl155Co()&&!AF&&mounts.length){const lack=cl155Mates(MP.rg).filter(r=>!r.pr.hm).map(r=>mpName(r.peer));
    if(lack.length)return say('🐎 '+mpEsc(lack.join(', '))+(lack.length>1?' need':' needs')+' a mount first — the whole party rides up together.');
    cl155Send(['cs','go'])}
  return f.apply(this,arguments)}}
{const G=SP152.gates.ascent,f=G.prompt;G.prompt=function(s){if(!ch153Done()&&cl155On()){const up=cl155Mates(31);
    if(up.length)return {label:'🐍 '+up.map(r=>mpName(r.peer)).join(', ')+' '+(up.length>1?'are':'is')+' racing up the mountain — wait for them here',fn:()=>say('🐍 Your partners are on the mountain trail. Wait here; you can ride up together once they are back.')};
    const lack=cl155Mates(MP.rg).filter(r=>!r.pr.hm).map(r=>mpName(r.peer));if(mounts.length&&lack.length)return {label:'🐎 Ascend to the hilltops · '+lack.join(', ')+(lack.length>1?' need':' needs')+' a mount',fn:()=>ch153Enter()}}
  const r=f.apply(this,arguments);if(r&&r.label=='F · Ascend to the hilltops'&&cl155Co())r.label='F · Ascend to the hilltops (with your party)';return r}}
function cs155On(q,peer){const k=q[1],R=CH153.R,nm=mpEsc(mpName(peer));
  if(k==='go'){let g=-1;try{g=curIns().g}catch(_){}if(g!==6||ch153In()||AF||hero.hp<=0||(typeof RV148!='undefined'&&RV148.down))return;
    if(!mounts.length)return say('🐎 '+nm+' rode up the hill path, but you have no mount to follow.');
    say('👥 '+nm+' rides up the hill path — you ride with them!');CS155.rx=1;try{ch153Enter()}finally{CS155.rx=0}return}
  if(k==='dn'){say('🤝 '+nm+' fell on the mountain — they lie here. Press F beside them to revive them.');return}
  if(!ch153In())return;
  if(k==='p'){CS155.p[peer]={s:+q[2]||0,o:+q[3]||0,y:+q[4]||0,ph:q[5]|0,hp:q[6]|0,v:+q[7]||0,t:nowP()}}
  else if(k==='n'&&peer===MP.host){CS155.n={s:+q[2]||0,v:+q[3]||0,t:nowP()}}
  else if(k==='w'){CS155.won[peer]=1;say('🐍 '+nm+' squeezed through the crack!')}
  else if(!R||!CH153.S)return;
  else if(k==='v'&&peer===MP.host&&Array.isArray(q[3])){const L=q[3].filter(a=>Array.isArray(a)).slice(0,5).map(a=>[+a[0]||0,+a[1]||0]);R.sn.rear=1;ch153SpitSpawn(L,q[2]|0)}
  else if(k==='k'&&peer===MP.host&&typeof q[2]=='string'){if(!R.sn.strike){R.sn.strike={t:0,o:+q[3]||0,s0:R.sn.s,tg:q[2]};try{svSnd('hiss',1.2,.8)}catch(_){}}}
  else if(k==='re'){if(R.ph=='run'||R.ph=='intro'||nowP()-CS155.reT<2500)return;CS155.reT=nowP();CS155.won={};
    if(R.ph=='dead'){R.dead.co=1;return}   // my own fall's fade restarts me anyway (ch153Tick)
    if(R.ph=='spec'&&!R.spec.fade){R.spec.fade=1;fadeTo(()=>{pl.visible=true;if(mModel)mModel.visible=true;ch153Reset(false)})}}}
// partners on the trail: drawn exactly where they ride (jumps too); fallen partners are hidden
{const f=mpTick;mpTick=function(){try{for(const k in AB155.U)ab155CrPose({peer:k},false)}catch(_){}const r=f.apply(this,arguments);
  try{if(!cl155On())return r;const inC=ch153In()&&CH153.S,inA=ab152In();
    for(const r2 of cl155Mates(MP.rg)){const m=r2.m;if(!m||!m.visible)continue;
      if(inA&&r2.pr.cr)ab155CrPose(r2,true);
      if(!inC)continue;const q=cs155Rider(r2.peer),g=r2.mt150&&r2.mt150.g;
      if(!q||nowP()-CS155.p[r2.peer].t>2500){if(g)g.visible=true;continue}
      if(q.ph==3||q.s<-50){m.visible=false;if(g)g.visible=false;continue}
      const P=CH153.S.P,[x,z,h]=P.at(q.s,q.o);m.position.set(x,h+q.y,z);m.rotation.y=P.yaw(q.s);if(g){g.visible=true;g.position.copy(m.position);g.rotation.y=m.rotation.y}}}catch(e){if(!CL155.err++)console.warn('v155 riders',e)}
  return r}}
// the HUD: who you are watching, how your partners are doing
{const f=ch153Hud;ch153Hud=function(){const r=f.apply(this,arguments);try{const el=$('ch153h'),R=CH153.R;if(!el||!R||el.classList.contains('hide'))return r;const k=el.querySelector('.k');
    if(R.ph=='spec'){k.textContent='👁 Watching '+(R.spec.who?mpName(R.spec.who):'…')+' · you fell';el.querySelector('.hp').innerHTML='<span>💀</span>'}
    else if(cs155Co()){const L=cl155Mates(MP.rg).map(m=>{const q=CS155.p[m.peer];return mpName(m.peer)+' '+(!q?'…':q.ph==3?'💀':q.ph==4?'✓':'💚'.repeat(Math.max(0,q.hp)))});k.textContent='Space · jump   A / D · steer   ·   '+L.join(' · ')}}catch(_){}return r}}

// ================= the Gate of the Hydra together =================
var HD155={rx:0,tS:0};
function hd155Co(){return cl155On()&&cl155Mates(7).length>0}
{const f=hd154Turn;hd154Turn=function(j){const r=f.apply(this,arguments);if(!HD155.rx&&hd155Co())cl155Send(['hd','t',j,HD154.vane[j]]);return r}}
{const f=hd154SongStart;hd154SongStart=function(){const had=!!HD154.song,r=f.apply(this,arguments);if(!had&&HD154.song&&!HD155.rx&&hd155Co())cl155Send(['hd','s',HD154.v]);return r}}
{const f=hd154Strike;hd154Strike=function(j){const G=HD154.song;if(!G||G.mode!='play')return f.apply(this,arguments);const v=HD154.v,i=G.in,r=f.apply(this,arguments);if(!HD155.rx&&hd155Co())cl155Send(['hd','k',j,v,i]);return r}}
{const f=hd154Open;hd154Open=function(){const was=HD154.st>=2||!!HD154.op,r=f.apply(this,arguments);if(!was&&!HD155.rx&&hd155Co())cl155Send(['hd','o']);return r}}
function hd155Want(j){try{return hd154Plan().st[j].want}catch(_){return -1}}
function hd155On(q,peer){const k=q[1],nm=mpEsc(mpName(peer)),here=hd154In()&&!!HD154.S;HD155.rx=1;try{
  if(k==='t'&&Number.isInteger(q[2])&&q[2]>=0&&q[2]<5){const j=q[2],v=((q[3]|0)%8+8)%8;if(hd154Done()||HD154.vane[j]===v)return;
    if(here){HD154.vane[j]=(v+7)%8;hd154Turn(j);say('👥 '+nm+' turned the serpent of '+HD154.nm[j]+'.')}else{HD154.vane[j]=v;HD154.on[j]=v===hd155Want(j)?1:0}}
  else if(k==='s'&&here&&!HD154.song&&HD154.v===(q[2]|0)&&!hd154Done()&&hd154N()>=5){say('👥 '+nm+' asks the Hydra to sing.');hd154SongStart()}
  else if(k==='k'&&here&&Number.isInteger(q[2])){const G=HD154.song;if(!G||HD154.v!==(q[3]|0)||G.in!==(q[4]|0)||(G.mode!='play'&&G.mode!='sing'))return;
    if(G.mode=='sing'){G.mode='play';G.in=0;G.last=null}hd154Strike(q[2])}
  else if(k==='o'){if(HD154.st>=2||HD154.op)return;if(here)hd154Open();else{HD154.st=2;HD154.song=null}}
  else if(k==='all'&&Array.isArray(q[2])){hd155Merge(q[2],q[3]|0,q[4]|0)}}finally{HD155.rx=0}}
// every few seconds partners in III swap their whole state and keep the most progress (a partner who comes later catches up)
function hd155Merge(vane,v,st){if(hd154Done())return;const here=hd154In()&&!!HD154.S;let ch=0;
  if(st>=2){if(here)hd154Open();else HD154.st=2;return}
  for(let j=0;j<5;j++){const w=hd155Want(j),t=((vane[j]|0)%8+8)%8;if(t===w&&HD154.vane[j]!==w){HD154.vane[j]=w;HD154.on[j]=1;ch=1}}
  if(v>HD154.v&&!HD154.song&&v<=3){HD154.v=v;ch=1}if(st>HD154.st)HD154.st=st;if(ch&&HD154.S)hd154Sync()}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{
    if(hd154In()&&hd155Co()&&now-HD155.tS>3000){HD155.tS=now;cl155Send(['hd','all',HD154.vane.slice(),HD154.v,HD154.st])}
    cl155Flush(now)}catch(e){if(!CL155.err++)console.warn('v155 coop',e)}return r}}
