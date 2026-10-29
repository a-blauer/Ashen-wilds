// ================= v165 Searing Sands II · The Last Warden: the urns, the altar, the waking =================
// Fourteen sealed urns stand round the courtyard (3280's plan, ss165T2().urns). Eleven hold a piece of Kheprit (T.part[urn] = 0..10),
// two hold a nest of Sun Scarabs, one only dust and bones.
//  * An urn is a target with no AI (an add with a hidden body and the urn's own model, like Vorraxis's sacs); three blows break it
//    (each one cracks it further). Its piece then lies where it stood, glowing, under a shaft of light: walk over it (or F) to take it.
//  * F at the altar lays every piece you carry in its place on the carved figure (each flies to its spot and settles with a flash):
//    the remains on the altar are one Kheprit rig in its 'laid' pose with its parts shown one by one (kh165PartShow).
//  * With all eleven laid, he wakes (KH165W.wake, ~9 s): light runs over the slab, the pieces knit, he stirs, pushes himself up,
//    stands and steps down off the dais. F · Speak with Kheprit opens his window (XR.kh165): who he is, what broke him, the way
//    on, and the choice to open the rift (3283 runs the rift and the defence).
//  * State (SS165.c2): urn (broken urns), got (pieces found), lay (pieces laid), st 0 gathering · 1 waking · 2 awake · 3 rift opened ·
//    4 through. Co-op (3285): urns, pieces and the laying are shared.
var KH165W={urns:[],picks:[],e:null,lay:null,err:0,rq:0};
function kh165Mats(){if(KH165W.M)return KH165W.M;const M={};M.urnG=new THREE.MeshBasicMaterial({color:0xffd070,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,side:THREE.DoubleSide});return KH165W.M=M}
// ---------------- the urns ----------------
function kh165UrnModel(i){return lgGroup('KH165|urn'+(i%3),q=>{const c=[0xa86a3c,0x9a5a34,0xb8784a][i%3],d=0x5a3420,p=0xd8c090,b=0x2a4a6a;
  // v168: one turned jar (foot, belly, shoulder, neck, rim) with painted bands, a lid, glyph tiles round the belly
  dt168P(q,dt168Lathe([[0,0],[.3,0],[.33,.04],[.3,.1],[.36,.2],[.46,.4],[.5,.6],[.47,.82],[.38,.98],[.26,1.08],[.22,1.14],[.25,1.18],[.3,1.22],[.31,1.28],[0,1.28]],28),'c',c,new THREE.Matrix4());
  dt168P(q,dt168Lathe([[0,1.26],[.3,1.26],[.31,1.3],[.24,1.36],[.1,1.42],[.07,1.48],[.1,1.52],[0,1.55]],24),'c',p,new THREE.Matrix4());
  [[.45,.485,d],[.72,.495,b]].forEach(([y,r,cc])=>dt168P(q,dt168Geo('urnb'+y,()=>new THREE.TorusGeometry(r,.022,6,48).rotateX(Math.PI/2)),'c',cc,dt168Mx(0,y,0)));
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2;q.p('','box','c',p,Math.cos(a)*.5,.6,Math.sin(a)*.5,.08,.12,.03,0,-a+Math.PI/2,0)}
  // the seal: wax and cord over the lid, a glyph of the Warden pressed in it
  q.p('','sph','c',0x8a1a14,0,1.5,0,.12,.05,.12).L('','c',0x6a5a3a,[-.28,1.3,0],[.28,1.3,0],.012,.012,3)},0)}
function kh165UrnSpot(i){const T=ss165T2(),u=T.urns[i],[x,z]=T.F.W2(u.a,u.b);return {x,z,ry:u.ry,s:u.s}}
function kh165Urns(){const C=SS165.c2,T=ss165T2();KH165W.urns.forEach(s=>{try{if(!s.dead)removeE(s)}catch(_){}});KH165W.urns=[];if(ss165Done(2)||C.st>=1)return;
  T.urns.forEach((u,i)=>{if(C.urn&(1<<i))return;const p=kh165UrnSpot(i);let s=null;try{s=spawnEnemy('goo',p.x,p.z,ss165I(1).lv[0],{minion:1})}catch(e){console.error('v165 urn',e)}if(!s)return;
    s.kh165u=i;s.agg=0;s.c.n='Sealed Urn';s.c.h=s.c.st.hp=999999;s.uHits=0;s.m.children.forEach(o=>{o.visible=false});const bs=s.m.bs||s.m.scale.x||1,g=kh165UrnModel(i);g.scale.setScalar(p.s/bs);g.rotation.y=p.ry;s.m.add(g);s.uG=g;
    try{s.m.scale.setScalar(bs)}catch(_){}s.m.position.set(p.x,0,p.z);KH165W.urns.push(s)})}
// a blow cracks it; the third breaks it
function kh165UrnHit(s){if(s.uBroke)return;s.uHits++;const p=s.m.position;burst(gY(p,.8),0xb8784a,8,1,1.2,.4);svSnd('crack',.5,1.6+s.uHits*.15);
  if(s.uG){const k=1-s.uHits*.06;s.uG.scale.multiplyScalar(k>0?1:1);s.uG.rotation.z=(Math.random()-.5)*.12*s.uHits}if(s.uHits>=3)kh165UrnBreak(s.kh165u,true)}
function kh165UrnBreak(i,own){const C=SS165.c2;if(C.urn&(1<<i))return;C.urn|=1<<i;SS165.trkK='';const p=kh165UrnSpot(i),s=KH165W.urns.find(q=>q.kh165u===i);
  if(s){s.uBroke=1;s.dead=1;try{s.hb.visible=false}catch(_){}if(typeof tgt!='undefined'&&tgt===s)try{setTarget(null)}catch(_){}setTimeout(()=>{try{removeE(s)}catch(_){}},40);KH165W.urns.splice(KH165W.urns.indexOf(s),1)}
  const q=new THREE.Vector3(p.x,0,p.z);burst(gY(q,.8),0xb8784a,40,2.2,2.2,.7);try{sk146Debris(gY(q,.8),new THREE.MeshStandardMaterial({color:0xa86a3c,roughness:.85,flatShading:true}),10,.14,4,5,1.4)}catch(_){}svSnd('crack',1,1.1);
  const T=ss165T2(),part=T.part[i];
  if(part>=0){if(!(C.got&(1<<part))&&!(C.lay&(1<<part)))kh165Drop(part,p.x,p.z,true);if(own)say('🏺 The urn shatters: inside lies the Warden’s '+KH165.parts[part]+'.')}
  else{const ex=T.ex.indexOf(i);if(ex<2){if(typeof co151Host!='function'||co151Host()){for(let k=0;k<3;k++){const a=k/3*Math.PI*2;try{const e=spawnEnemy('scarab',p.x+Math.cos(a)*1.2,p.z+Math.sin(a)*1.2,ss165I(1).lv[0],{agg:1});e.agg=1}catch(_){}}}if(own)say('🪲 A nest of Sun Scarabs bursts out of the urn!')}
    else{burst(gY(q,.6),0xd8ccb0,30,1.6,1.4,.8);if(own)say('🏺 Only dust and old bones.')}}
  if(own&&typeof co165Urn=='function')co165Urn(i)}
// ---------------- the pieces lying free ----------------
function kh165Drop(p,x,z,fresh){if(KH165W.picks.some(q=>q.p===p))return;const g=new THREE.Group(),m=kh165PartMesh(p);m.rotation.set(p>=5?1.2:p==1?.0:-.2,0,p>=5?.4:0);m.scale.setScalar(p===1||p===2?.85:1);g.add(m);
  const beam=new THREE.Mesh(svG('kh_beam',()=>{const q=new THREE.CylinderGeometry(.35,.55,7,10,1,true);q.translate(0,3.5,0);return q}),kh165Mats().urnG);g.add(beam);
  g.position.set(x,GH(x,z)+.4,z);g.userData.lpsSkip=1;scene.add(g);KH165W.picks.push({p,g,m,x,z,t:Math.random()*6});if(fresh)burst(gY(new THREE.Vector3(x,0,z),1),0xffd070,30,1.2,2,.8)}
function kh165Take(p,own){const C=SS165.c2;const i=KH165W.picks.findIndex(q=>q.p===p);if(i>=0){const P=KH165W.picks[i];scene.remove(P.g);KH165W.picks.splice(i,1);burst(gY(new THREE.Vector3(P.x,0,P.z),1),0xffd070,24,1,2,.6)}
  if(C.got&(1<<p)||C.lay&(1<<p))return;C.got|=1<<p;SS165.trkK='';if(own){svSnd('bell',.6,1.4);const n=ss165Bits(C.got|C.lay);popT(pl.position,'🐜 '+KH165.parts[p]+' ('+n+'/11)','#ffe0a0',true);
    say('🐜 You take the Warden’s <b>'+KH165.parts[p]+'</b> ('+n+'/11).'+(n>=11?' Lay them on the altar.':''));if(typeof co165Take=='function')co165Take(p)}}
// ---------------- the remains on the altar (one rig, laid out) ----------------
function kh165Make(){const R=svRig();kh165Build(R);svRest(R);try{svMerge(R)}catch(e){console.error('kh merge',e)}const m=new THREE.Group();m.add(R.root);scene.add(m);const O={};for(const k in R.J)O[k]=[0,0,0,0,0,0];
  const e={m,sv:{i:'kh',B:KH165B,R,O,P:{},snap:{},aw:0,trk:null,tt:0,mv:null,ph:1,rest:1,last:[],cd:{},spd:0,lp:m.position.clone(),alive:0,chg:0},hp:100,dead:0};return e}
function kh165AltarAt(){const T=ss165T2(),[x,z]=T.F.W2(T.altar.a-.15,T.altar.b);return {x,z,y:T.y0+1.88,ry:T.F.yaw}}
function kh165Laid(){if(KH165W.e)return KH165W.e;const e=kh165Make(),A=kh165AltarAt();e.m.position.set(A.x,A.y,A.z);e.m.rotation.y=A.ry;svStart(e,'laid',1);e.sv.aw=1;KH165W.e=e;
  for(let i=0;i<11;i++)kh165PartShow(e.sv.R,i,!!(SS165.c2.lay&(1<<i)));return e}
// lay every carried piece (they fly from you to their places)
function kh165LayAll(own){const C=SS165.c2,give=C.got&~C.lay;if(!give)return 0;const e=kh165Laid();let n=0;
  for(let i=0;i<11;i++){if(!(give&(1<<i)))continue;n++;const J=i===1?e.sv.R.J.torso:e.sv.R.part[i],to=new THREE.Vector3();(J||e.m).getWorldPosition(to);const m=kh165PartMesh(i);m.userData.lpsSkip=1;
    const from=own?gY(pl.position,1.2):to.clone().add(new THREE.Vector3(0,3,0));svShot(from,to,.55+n*.09,0xffd070,1,1.6,()=>{kh165PartShow(e.sv.R,i,true);burst(to,0xffd070,24,1,1.4,.6);svSnd('bell',.45,1.2+i*.05)},m)}
  C.lay|=give;C.got&=~give;SS165.trkK='';if(own){say('🐜 You lay '+n+' of the Warden’s remains on the altar ('+ss165Bits(C.lay)+'/11).');if(typeof co165Lay=='function')co165Lay(C.lay)}
  if(C.lay===2047&&C.st<1)qs165After(1.4,()=>kh165Wake(own));return n}
// ---------------- waking ----------------
var KH165B={name:'Kheprit',col:KH165.col,P:KH165P,loco:kh165Loco,post:kh165Post,M:{
  laid:{dur:1e9,trk:[[0,'laid','l']]},
  // light runs over the slab, the pieces knit, he stirs, pushes up and stands (on the altar), then steps down off the dais
  wake:{dur:9.2,trk:[[0,'laid','l'],[2.6,'laid','l',.03],[3.6,'stir','io'],[4.4,'stir','l',.04],[5.4,'push','io'],[6.2,'push','l',.02],[7.2,'stand','io'],[9.2,'stand','l']],
    ev:[[.1,c=>{svSnd('charge',.7,.6);c.S.chg=1}],[1.4,c=>{svSnd('bell',.8,.7);shake(.15)}],[3.6,c=>{c.S.alive=1;svSnd('hiss',.7,.8)}],[6.2,c=>{svSnd('heavy',.6,1.2)}],[7.2,c=>{c.S.chg=0;svSnd('bell',.7,1.0)}]],
    tk(c,dt){if(c.t<3&&Math.random()<dt*40){const p=c.e.m.position;burst(new THREE.Vector3(p.x+(Math.random()-.5)*3,p.y+.2,p.z+(Math.random()-.5)*3),0xffd070,1,.4,1.2,.8)}}},
  talk:{dur:3.0,trk:[[.4,'talk','io'],[2.4,'talk','l',.01],[3.0,'stand','io']],go(c){c.S.say=1},end(c){c.S.say=0}},
  point:{dur:2.6,trk:[[.5,'point','io'],[2.0,'point','l'],[2.6,'stand','io']],go(c){c.S.say=1},end(c){c.S.say=0}},
  chan:{dur:1e9,trk:[[.8,'chan','io'],[1e9,'chan','l',.015]]},
  hurt:{dur:.6,trk:[[.12,'hurt','o'],[.6,'chan','io']]},
  fall:{dur:2.2,trk:[[.4,'hurt','o'],[1.6,'dead','i'],[2.2,'dead','l']],go(c){c.S.alive=0;c.S.chg=0}},
  dead:{dur:1e9,trk:[[0,'dead','l']],go(c){c.S.alive=0;c.S.chg=0}},
  rise:{dur:3.4,trk:[[0,'dead','l'],[1.2,'stir','io'],[2.2,'push','io'],[3.4,'stand','io']],go(c){c.S.alive=1}}}};
function kh165Wake(own){const C=SS165.c2;if(C.st>=1&&KH165W.e&&(KH165W.e.wk||KH165W.e.sv.alive))return;C.st=Math.max(C.st,1);SS165.trkK='';const e=kh165Laid();for(let i=0;i<11;i++)kh165PartShow(e.sv.R,i,true);
  svStart(e,'wake',1);e.wk={t:0};try{zt116Show(ZT116.Z[3],'Searing Sands · Main Quest','Kheprit Wakes','The Last Warden of the Sunken Temple','','z3')}catch(_){}
  say('🐜 The pieces on the altar knit together… and the Warden stirs.');if(own!==false&&typeof co165Wake=='function')co165Wake()}
// the waking's last steps: off the altar, down the dais, to stand before it facing the court
function kh165WakeTick(e,dt){const W=e.wk;if(!W)return;W.t+=dt;const A=kh165AltarAt(),T=ss165T2(),[sx,sz]=T.F.W2(T.altar.a-3.9,T.altar.b+.8);
  if(W.t>7.3){const k=Math.min(1,(W.t-7.3)/1.9),x=A.x+(sx-A.x)*k,z=A.z+(sz-A.z)*k,yFloor=T.y0,yTop=A.y;e.m.position.set(x,yTop+(yFloor-yTop)*svEase.io(k)+Math.sin(k*Math.PI)*.4,z);e.sv.spd=k<1?1.6:0;
    e.m.rotation.y=A.ry+Math.PI*svEase.io(k);if(k>=1){e.wk=null;SS165.c2.st=Math.max(SS165.c2.st,2);SS165.trkK='';e.sv.spd=0;say('🐜 Kheprit stands before the altar. Speak with him (F).')}}}
// ---------------- speaking with him ----------------
var KH165T={who:['I am Kheprit, the last Warden of this house. For three thousand years I kept its doors.','The priests of the Endless One came with fire and salt. They broke me, piece from piece, and sealed me in their jars, so that no one would ever open the old ways again.'],
  why:['The Endless One — the great worm you call Ssith’ra — sleeps beneath the Salt Wastes. Its priests feed it, and it feeds them in turn.','They feared me because I can open the ways between places. Every Warden could. I am the last.'],
  way:['The road to the Salt Wastes is sealed. But I can open a rift, from here to there, if you give me time.','A minute. Perhaps less. The cult will feel it the moment I begin: they will come for me, and for you. All of them.'],
  go:['Then hold them, little ones, while I call the way. When it opens, run through. Do not wait for me — the way will not stay open for long, and I will hold it shut behind you.']};
function kh165Talk(){if(!KH165W.e||!KH165W.e.sv.alive)return;const e=KH165W.e;try{e.m.rotation.y=Math.atan2(pl.position.x-e.m.position.x,pl.position.z-e.m.position.z)}catch(_){}svStart(e,'talk',1);KH165W.tab='hi';openX('kh165')}
XR.kh165=()=>{const t=KH165W.tab||'hi';$('xwT').textContent='🐜 Kheprit';$('xwS').textContent='The Last Warden · '+ss165I(1).n;const C=SS165.c2,ev=typeof RF165!='undefined'&&RF165.E;
  const L=t==='hi'?['Bones of my bones. You gathered me — every piece. I had forgotten how the light feels.','Ask, and I will answer. I owe you that much, and more.']:KH165T[t]||KH165T.who;
  $('xwB').innerHTML='<div class="cq132say"><span class="cq132who">Kheprit</span>'+L.map(s=>'“'+s+'”').join('<br><br>')+'</div>';
  const btn=(k,lab,pri)=>'<button class="'+(pri?'pri':'')+'" data-kh165="'+k+'">'+lab+'</button> ';
  $('xwF').innerHTML=ev||C.st>=3?'<span class="mut dtl">The rift is being called. Hold the cultists off!</span>':
    t==='way'?btn('go','Open the rift — we will hold them',1)+btn('hi','Not yet'):
    t==='go'?btn('begin','Begin',1)+btn('hi','Wait'):btn('who','Who are you?')+btn('why','Who broke you?')+btn('way','Can you open a way to the Salt Wastes?',1)};
$('xw').addEventListener('click',ev=>{if(xwMode!='kh165')return;const t=ev.target.closest('[data-kh165]');if(!t)return;const k=t.dataset.kh165;
  if(k==='begin'){closeX();try{if(typeof rf165Start=='function')rf165Start(true)}catch(err){console.error('v165 rift start',err)}return}
  KH165W.tab=k;try{const e=KH165W.e;if(e&&e.sv.alive&&!e.sv.mv)svStart(e,k==='way'?'point':'talk',1)}catch(_){}rX()});
// ---------------- prompts ----------------
function kh165Prompt(){if(!ss165Here(1)||!CY165.g)return null;const P=pl.position,C=SS165.c2,T=ss165T2();if(ss165Done(2)&&C.st>=3)return null;
  // a piece on the ground
  for(const q of KH165W.picks)if(Math.hypot(P.x-q.x,P.z-q.z)<1.9)return {label:'F · Take the Warden’s '+KH165.parts[q.p],fn:()=>kh165Take(q.p,true)};
  const A=kh165AltarAt();
  if(C.st<1&&Math.hypot(P.x-A.x,P.z-A.z)<3.6){const give=C.got&~C.lay;if(give)return {label:'F · Lay the Warden’s remains on the altar ('+ss165Bits(give)+' carried · '+ss165Bits(C.lay)+'/11 laid)',fn:()=>kh165LayAll(true)};
    return {label:'🐜 The altar: the carved outline of a figure ('+ss165Bits(C.lay)+'/11 of its pieces laid) · break the urns to find the rest',fn:()=>say('🏺 The Warden’s remains are sealed in the urns round the courtyard. Break them (attack), take what is inside, and lay it here.')}}
  const e=KH165W.e;if(e&&e.sv.alive&&!e.wk&&C.st>=2&&!(typeof RF165!='undefined'&&RF165.E)&&Math.hypot(P.x-e.m.position.x,P.z-e.m.position.z)<3.4)return {label:'F · Speak with Kheprit',fn:()=>kh165Talk()};
  return null}
{const f=worldPrompt;worldPrompt=function(){try{const r=kh165Prompt();if(r)return r}catch(e){if(!KH165W.err++)console.warn('v165 warden prompt',e)}return f.apply(this,arguments)}}
// ---------------- hooks: the urns take blows, not damage; they never fight ----------------
{const f=eTick;eTick=function(e,dt,now){if(e&&e.kh165u!=null){e.agg=0;return true}return f.apply(this,arguments)}}
{const f=hurt;hurt=function(e,d,s,crit,dot){if(e&&e.kh165u!=null){if(!dot)kh165UrnHit(e);return}return f.apply(this,arguments)}}
{const f=kill;kill=function(e){if(e&&e.kh165u!=null)return;return f.apply(this,arguments)}}
// ---------------- the tick ----------------
function kh165Tick(dt,now){const here=ss165Here(1),C=SS165.c2,t=now/1000;if(!CY165.g){if(!here)return}
  if(here&&!KH165W.built&&CY165.g){KH165W.built=1;kh165Sync()}
  KH165W.picks.forEach(q=>{q.g.visible=here;if(!here)return;q.t+=dt;q.m.rotation.y+=dt*.9;q.m.position.y=.25+Math.sin(q.t*2)*.12;if(hero.hp>0&&Math.hypot(pl.position.x-q.x,pl.position.z-q.z)<1.1)kh165Take(q.p,true)});
  const e=KH165W.e;if(e){e.m.visible=here;if(here){const dx=e.m.position.x-e.sv.lp.x,dz=e.m.position.z-e.sv.lp.z;e.sv.lp.copy(e.m.position);
    if(e.sv.mv){const M=e.sv.mv;M.t+=dt;e.sv.tt=M.t;const D=M.D;if(D.ev)D.ev.forEach((v,i)=>{if(!M.done.has('e'+i)&&M.t>=v[0]){M.done.add('e'+i);try{v[1]({e,S:e.sv,M,t:M.t,m:e.m})}catch(err){console.error('kh ev',err)}}});if(D.tk)try{D.tk({e,S:e.sv,M,t:M.t,m:e.m},dt)}catch(_){}
      if(M.t>=D.dur){try{D.end&&D.end({e,S:e.sv,M,m:e.m})}catch(_){}const keep=e.sv.mv;e.sv.mv=null;if(keep.id==='talk'||keep.id==='point'||keep.id==='rise'){e.sv.trk=null}if(keep.id==='fall')svStart(e,'dead',1)}}
    kh165WakeTick(e,dt);try{svApply(e,dt,now)}catch(err){if(!KH165W.err++)console.warn('v165 kh anim',err)}}}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{kh165Tick(dt,now)}catch(e){if(!KH165W.err++)console.warn('v165 warden tick',e)}return r}}
// the scene from the state (first visit, after a load): the urns still standing, pieces on the ground, the remains on the altar, Kheprit standing
function kh165Sync(){const C=SS165.c2,T=ss165T2(),done=ss165Done(2);KH165W.picks.slice().forEach(q=>scene.remove(q.g));KH165W.picks=[];
  if(KH165W.e){scene.remove(KH165W.e.m);KH165W.e=null}kh165Urns();
  if(done||C.st>=3){if(typeof rf165After=='function')rf165After();return}
  // pieces in broken urns that nobody took
  T.urns.forEach((u,i)=>{const p=T.part[i];if(p>=0&&(C.urn&(1<<i))&&!(C.got&(1<<p))&&!(C.lay&(1<<p))){const s=kh165UrnSpot(i);kh165Drop(p,s.x,s.z,false)}});
  const e=kh165Laid();if(C.st>=1||C.lay===2047){for(let i=0;i<11;i++)kh165PartShow(e.sv.R,i,true);C.st=Math.max(C.st,2);e.sv.alive=1;e.sv.mv=null;e.sv.trk=null;e.sv.aw=0;const [sx,sz]=T.F.W2(T.altar.a-3.9,T.altar.b+.8);e.m.position.set(sx,T.y0,sz);e.m.rotation.y=T.F.yaw+Math.PI}}
SS165L.push(()=>{if(KH165W.built)kh165Sync()});
