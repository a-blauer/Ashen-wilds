# v165: The Dirge main quest — I the Keeper's grave and the Hidden Sanctum, II the raft down the Black Channel, III the five prisms.
#   graves: 14 stand in the Dirge I on open ground, apart; the gateway portal is hidden behind the weeping angel; no digging before the
#     spade; a wrong grave lets out its dead; the Keeper's grave opens a stair into the Sanctum
#   sanctum: every hall's trap hurts; the plate lifts the gate for a while; slabs crumble and a fall goes back to the chasm's edge; the
#     closing walls start, the knights stop them, the walls crush when time runs out (a death: back at the checkpoint); out to II
#   raft: the quay boards it; the drowned swim up, cling and tear planks off; a dead one sinks; too few planks break the raft (death,
#     a fresh raft); the channel's end leads to III
#   prisms: siphon one, the dead rise round you, the matching rune takes it, dying gives it back, five runes open the Den; saves
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  let T=performance.now();const tick=sec=>{for(let i=0;i<Math.round(sec*30);i++){T+=33;homeTick(1/30,T);enemies.slice().forEach(e=>{if(e.dg165w&&!e.dead&&!e.mir)eTick(e,1/30,T)});kqFxTick(1/30)}};
  const lab=()=>(worldPrompt()||{}).label||'';hero.hp=heroMax();const tough=()=>{hero.hp=heroMax()*400};
  // ---------------- I: the graves ----------------
  const I=INSL[20];toPos(I.ba[0],I.ba[1]);tick(.3);const Pl=dg165GravePlan(),G=Pl.G;out.nG=G.length;out.gIns=G.every(o=>(insAt(Math.round(o.x),Math.round(o.z))||{}).g===20);out.gFb=G.filter(o=>o.fb).length;
  out.gMin=99;G.forEach((a,i)=>G.forEach((b,j)=>{if(j>i)out.gMin=Math.min(out.gMin,Math.round(Math.hypot(a.x-b.x,a.z-b.z)))}));
  const r=RPORT.find(q=>q.k=='next'&&q.ig===20);out.portalHidden=!r||!r.g.visible;out.angel=!!SP152.gates.sanctum.g;
  const stand=o=>{toPos(o.x+Math.sin(o.ry)*2.4,o.z+Math.cos(o.ry)*2.4);tick(.05)};
  stand(G[3]);out.l0=lab();worldPrompt().fn();out.l1=lab();
  {const s=SP152.gates.sanctum.spot;toPos(s.x-s.ux*2.2,s.z-s.uz*2.2);tick(.05);out.la=lab();worldPrompt().fn();out.spade=DG165Q.g.st}
  // a wrong grave
  stand(G[3]);if(!/Dig/.test(lab())){worldPrompt().fn()}out.l2=lab();const nE0=enemies.filter(e=>e.dg165r).length;worldPrompt().fn();tick(3.6);await wait(1500);tick(.1);out.bad=DG165Q.g.bad[3];out.risen=enemies.filter(e=>e.dg165r).length-nE0;
  enemies.slice().forEach(e=>{if(e.dg165r)removeE(e)});
  // the Keeper's grave
  const K=G[DG165G.K];out.keep=[K.stone,K.emb,K.ext].join(',');out.unique=G.filter(o=>o.stone=='broken'&&o.emb=='raven'&&o.ext=='candles').length;
  stand(K);worldPrompt().fn();worldPrompt().fn();tick(3.6);out.gst=DG165Q.g.st;out.lk=lab();
  // ---------------- the Sanctum ----------------
  worldPrompt().fn();await wait(900);tick(.2);out.inS=dg165SIn();out.sst=DG165Q.s.st;const S=DG165S.S,SP=dg165SanPlan();
  // on foot from the arrival to the flooded stair: the walkable tiles (bridge slabs included) join up
  {const I=dg165SI(),[sx,sz]=dg165SW(SP.spawn[0],SP.spawn[1]),[ex,ez]=dg165SW(SP.exit[0],SP.exit[1]),ok=(x,z)=>{const t=MAP[z]&&MAP[z][x];return !!t&&'.ag'.includes(t)},seen=new Set(),q=[[Math.round(sx),Math.round(sz)]];seen.add(q[0][1]*W+q[0][0]);
    while(q.length){const [x,z]=q.pop();for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Z=z+dz,k=Z*W+X;if(!seen.has(k)&&ok(X,Z)&&insAt(X,Z)===I){seen.add(k);q.push([X,Z])}}}
    out.walk=seen.has(Math.round(ez)*W+Math.round(ex))}
  const goS=(u,v)=>{const [x,z]=dg165SW(u,v);toPos(x,z,0);tick(.03)};
  // pendulums: stand in a blade's path long enough to be cut
  tough();goS(80,SP.pend[1].v);let hp=hero.hp;hero.iv=0;for(let i=0;i<120&&hero.hp>=hp;i++){goS(80,SP.pend[1].v);hero.iv=0;tick(.05)}out.pend=hero.hp<hp;
  // spikes
  tough();goS(81,95);hp=hero.hp;for(let i=0;i<120&&hero.hp>=hp;i++){hero.iv=0;goS(81,95);tick(.05)}out.spike=hero.hp<hp;
  // the plate and the gate
  goS(64,111);tick(.1);const gk=dg165SW(64,158.5),gk2=Math.round(gk[1])*W+Math.round(gk[0]);out.gateShut=CBLK.has(gk2);goS(SP.plate[0],SP.plate[1]);tick(.1);out.gateOpen=!!(DG165S.gate&&DG165S.gate.open)&&!CBLK.has(gk2);
  goS(64,120);tick(DG165SP.gateT+.5);out.gateFell=!DG165S.gate.open&&CBLK.has(gk2);
  // fire
  tough();hp=hero.hp;for(let i=0;i<120&&hero.hp>=hp;i++){hero.iv=0;goS(64,SP.jets[0].v);tick(.05)}out.fire=hero.hp<hp;
  // the chasm: a slab crumbles under you, and you fall
  DG165Q.s.cp=3;goS(64,162.6);tick(.1);const sl=S.slabs[3];hp=hero.hp;goS(sl.u,sl.v);tick(.2);out.crack=sl.st;tick(DG165SP.slabT+.2);out.slabFell=sl.st>=2;tick(DG165SP.fallT+.4);await wait(900);tick(.2);
  const [cu,cv]=dg165SL(pl.position.x,pl.position.z);out.afterFall=[Math.round(cu),Math.round(cv),hero.hp<hp];out.slabsBack=S.slabs.every(s=>s.st==0);
  // the closing walls: start, solve with the knights
  DG165Q.s.cp=4;goS(92,216.5);goS(92,219);tick(.2);out.cwRun=!!(DG165S.cw&&DG165S.cw.ph=='run');out.doorN=S.shutN;
  for(let i=0;i<4;i++){const s=S.statues[i];goS(s.u+(i<2?0:(i==2?-1.6:1.6)),s.v+(i==0?-1.6:i==1?1.6:0));let n=0;while(s.f!==[0,2,1,3][s.want]&&n<5){const p=worldPrompt();if(!p||!/knight/i.test(p.label))break;p.fn();tick(.7);n++}}
  tick(.3);out.cwSolved=DG165Q.s.cw;out.doorS=S.shutS;tick(4.5);
  // the walls crush when time runs out (a fresh try: forget the solve)
  DG165Q.s.cw=0;dg165SCwReset();goS(92,219);tick(.2);DG165S.cw.t=DG165SP.cwT-.05;hero.hp=heroMax();tick(1.2);out.crushed=typeof AWD!='undefined'&&AWD.dead;
  if(AWD.dead&&AWD.res){const f=AWD.res;AWD.res=null;f();AWD.dead=0;document.body.classList.remove('awdead');$('dth').classList.add('hide')}tick(.1);{const [u,v]=dg165SL(pl.position.x,pl.position.z);out.rise=[Math.round(u),Math.round(v),Math.round(hero.hp/heroMax()*100)]}
  DG165Q.s.cw=1;dg165SCwReset();
  // out through the flooded stair
  goS(SP.exit[0],SP.exit[1]-.6);tick(.05);out.lx=lab();worldPrompt().fn();await wait(900);tick(.2);out.ii=(curIns()||{}).g;out.sst2=DG165Q.s.st;
  // ---------------- II: the raft ----------------
  const J=INSL[21];toPos(J.ba[0],J.ba[1]);tick(.3);const Q=SP152.gates.channel;out.quay=!!Q.g;const r2=RPORT.find(q=>q.k=='next'&&q.ig===21);out.portal2Hidden=!r2||!r2.g.visible;
  toPos(Q.spot.x-Q.spot.ux*2.2,Q.spot.z-Q.spot.uz*2.2);tick(.05);out.lq=lab();worldPrompt().fn();await wait(900);tick(.2);out.inC=rt165In()&&!!RT165R;
  const R=RT165R,P=dg165ChPath();out.cells=R.cells.length;
  // walking stays on the deck
  for(let i=0;i<40;i++)walk(pl,.3,0);const [lu]=rt165L(R,pl.position.x,pl.position.z);out.edge=+lu.toFixed(2);
  tough();R.s=P.S*.3;R.ph='run';tick(14);out.W=R.W.length;out.clung=R.W.some(w=>w.st=='cling');tick(16);out.lost=Math.round(R.cells.reduce((a,C)=>a+(RT165.hp-Math.max(0,C.hp)),0));
  // kill a clinging drowned: it sinks and goes
  {const w=R.W.find(q=>q.st=='cling'&&!q.e.dead);if(w){hurt(w.e,M(w.e.c)*3,{col:0xffffff},false);out.dead=!!w.e.dead;await wait(3500);tick(.1);out.gone=!enemies.includes(w.e)}}
  // too few planks: the raft breaks and drags you under
  R.cells.forEach(C=>{if(C.alive&&rt165Alive(R)>RT165.min+1)rt165Break(R,C,true)});out.alive=rt165Alive(R);rt165Break(R,R.cells.find(C=>C.alive),true);out.broken=R.ph;hero.hp=heroMax();tick(2.6);out.raftDeath=AWD.dead;
  if(AWD.dead&&AWD.res){const f=AWD.res;AWD.res=null;f();AWD.dead=0;document.body.classList.remove('awdead');$('dth').classList.add('hide')}tick(.1);out.fresh=[RT165R&&RT165R.id!==R.id,RT165R&&rt165Alive(RT165R)];
  // the end of the channel
  enemies.slice().forEach(e=>{if(e.dg165w)removeE(e)});RT165R.s=P.S-2;RT165R.ph='run';tick(3.5);await wait(900);tick(.2);out.iii=(curIns()||{}).g;out.rst=DG165Q.r.st;
  // ---------------- III: the prisms ----------------
  const K3=INSL[22];toPos(K3.ba[0],K3.ba[1]);tick(.3);const O=dg165PrismPlan();out.prIns=O.pr.every(o=>(insAt(Math.round(o.x),Math.round(o.z))||{}).g===22)&&!O.pr.some(o=>o.fb);out.ctr=[(insAt(O.ctr.x,O.ctr.z)||{}).g,!!O.ctr.fb];
  out.prMin=99;O.pr.forEach((a,i)=>O.pr.forEach((b,j)=>{if(j>i)out.prMin=Math.min(out.prMin,Math.round(Math.hypot(a.x-b.x,a.z-b.z)))}));
  const r3=RPORT.find(q=>q.k=='next'&&q.ig===22);toPos(r3.x,r3.z+1);tick(.05);out.sealed=(portalPrompt()||{}).label||'';
  const atPr=i=>{const o=O.pr[i];toPos(o.x+2,o.z);if(solid(o.x+2,o.z))toPos(o.x-2,o.z);if(solid(pl.position.x,pl.position.z))toPos(o.x,o.z+2);tick(.05)};
  const atRune=i=>{const q=OS165.S.R.runes[i],c=O.ctr,dx=c.x-q.x,dz=c.z-q.z,l=Math.hypot(dx,dz);toPos(q.x+dx/l*1.8,q.z+dz/l*1.8);tick(.05)};
  tough();atPr(0);out.lp=lab();worldPrompt().fn();tick(OS165.sip+.3);out.carry=OS165.carry&&OS165.carry.i;tick(4);await wait(1200);tick(.1);out.risen3=enemies.filter(e=>e.os165&&!e.dead).length;
  atRune(1);out.wrongRune=lab();atRune(0);out.lr=lab();worldPrompt().fn();tick(.1);out.lit0=DG165Q.o.lit[0];out.carryAfter=!!OS165.carry;
  // fall with a charge: it goes back
  atPr(1);worldPrompt().fn();tick(OS165.sip+.3);out.carry1=OS165.carry&&OS165.carry.i;hero.hp=1;hero.iv=0;down();tick(.1);out.back=!OS165.carry&&os165Full(1);
  if(AWD.dead&&AWD.res){AWD.res=null;AWD.dead=0;document.body.classList.remove('awdead');$('dth').classList.add('hide')}
  enemies.slice().forEach(e=>{if(e.os165)removeE(e)});toPos(K3.ba[0],K3.ba[1]);tick(.1);
  for(let i=1;i<5;i++){tough();atPr(i);worldPrompt().fn();tick(OS165.sip+.3);atRune(i);worldPrompt().fn();tick(.1);enemies.slice().forEach(e=>{if(e.os165)removeE(e)})}
  await wait(1600);tick(.2);out.ost=DG165Q.o.st;out.lit=DG165Q.o.lit.join('');toPos(r3.x,r3.z+1);tick(.05);out.open=(portalPrompt()||{}).label||'';
  // saves
  const sv=x2Save();out.saved=JSON.stringify(sv.dg165);const old=JSON.parse(JSON.stringify(sv));delete old.dg165;x2Load(old);out.oldQ=JSON.stringify(DG165Q);x2Load(sv);out.reQ=JSON.stringify(DG165Q);
  out.errs=errs.filter(e=>!/fishing|audio/i.test(e)).slice(0,6);return out}"""
def s(pg):
    pg.set_default_timeout(1800000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:4000])
    e=lambda c,m:(None if c else F(m))
    e(r['nG']==14 and r['gIns'] and r['gFb']==0 and r['gMin']>=7,'I: 14 graves on open ground in the Dirge I, apart (%s %s %s)'%(r['gFb'],r['gMin'],r['gIns']))
    e(r['portalHidden'] and r['angel'],'I: the gateway portal is hidden, the weeping angel stands there')
    e('Read' in r['l0'] and 'nothing to dig' in r['l1'],'I: a grave is read first; no digging without the spade (%s | %s)'%(r['l0'],r['l1']))
    e('angel' in r['la'] and r['spade']==1,'I: the angel gives the clue and the spade (%s)'%r['la'])
    e('Dig' in r['l2'] and r['bad']==1 and r['risen']>=2,'I: digging a wrong grave lets its dead out (%s %s %s)'%(r['l2'],r['bad'],r['risen']))
    e(r['unique']==1 and r['keep']=='broken,raven,candles','I: only the Keeper\'s grave has all three marks (%s)'%r['unique'])
    e(r['gst']==2 and 'Sanctum' in r['lk'],'I: the Keeper\'s grave opens on the stair (%s %s)'%(r['gst'],r['lk']))
    e(r['inS'] and r['sst']==1,'Sanctum: the stair leads into it')
    e(r['walk'],'Sanctum: the way from the arrival to the flooded stair is walkable end to end')
    e(r['pend'] and r['spike'] and r['fire'],'Sanctum: blades, spikes and fire hurt (%s %s %s)'%(r['pend'],r['spike'],r['fire']))
    e(r['gateShut'] and r['gateOpen'] and r['gateFell'],'Sanctum: the plate lifts the gate and it falls again (%s %s %s)'%(r['gateShut'],r['gateOpen'],r['gateFell']))
    e(r['crack']==1 and r['slabFell'] and r['afterFall'][2] and r['afterFall'][1]<166 and r['slabsBack'],'Sanctum: a slab crumbles, the fall costs health and goes back to the edge (%s %s %s %s)'%(r['crack'],r['slabFell'],r['afterFall'],r['slabsBack']))
    e(r['cwRun'] and r['doorN'] and r['cwSolved']==1 and not r['doorS'],'Sanctum: the walls close, the knights stop them and the far door opens (%s %s %s %s)'%(r['cwRun'],r['doorN'],r['cwSolved'],r['doorS']))
    e(r['crushed'] and r['rise'][1] in (216,217) and r['rise'][2]>=99,'Sanctum: the walls crush you when time runs out; you rise at the checkpoint (%s %s)'%(r['crushed'],r['rise']))
    e('Drowned' in r['lx'] or 'Dirge II' in r['lx'],'Sanctum: the flooded stair prompt (%s)'%r['lx'])
    e(r['ii']==21 and r['sst2']==2,'Sanctum: out into the Dirge II (%s %s)'%(r['ii'],r['sst2']))
    e(r['quay'] and r['portal2Hidden'] and 'raft' in r['lq'],'II: the quay with the raft replaces the gateway (%s)'%r['lq'])
    e(r['inC'] and r['cells']==35 and abs(r['edge'])<2.95,'raft: aboard; you cannot walk off the deck (%s %s)'%(r['cells'],r['edge']))
    e(r['W']>=2 and r['clung'] and r['lost']>=1,'raft: the drowned come, cling and tear planks away (%s %s %s)'%(r['W'],r['clung'],r['lost']))
    e(r.get('dead') and r.get('gone'),'raft: a killed drowned sinks and is gone (%s %s)'%(r.get('dead'),r.get('gone')))
    e(r['broken']=='broken' and r['raftDeath'] and r['fresh'][0] and r['fresh'][1]==35,'raft: too few planks break the raft and kill; you wake on a fresh raft (%s %s %s)'%(r['broken'],r['raftDeath'],r['fresh']))
    e(r['iii']==22 and r['rst']==2,'raft: the channel\'s end leads to III (%s %s)'%(r['iii'],r['rst']))
    e(r['prIns'] and r['ctr'][0]==22 and not r['ctr'][1] and r['prMin']>=18,'III: five prisms and the Reliquary on open ground (%s %s %s)'%(r['prIns'],r['ctr'],r['prMin']))
    e('sealed' in r['sealed'],'III: the Den gateway is sealed (%s)'%r['sealed'])
    e('Siphon' in r['lp'] and r['carry']==0 and r['risen3']>=2,'III: siphoning gives the charge and the dead rise round you (%s %s %s)'%(r['lp'],r['carry'],r['risen3']))
    e('cold' in r['wrongRune'] and 'Pour' in r['lr'] and r['lit0']==1 and not r['carryAfter'],'III: only the matching rune takes it (%s | %s)'%(r['wrongRune'],r['lr']))
    e(r['carry1']==1 and r['back'],'III: falling with a charge gives it back to its prism')
    e(r['ost']==1 and r['lit']=='11111' and 'sealed' not in r['open'],'III: five runes open the Den (%s %s %s)'%(r['ost'],r['lit'],r['open']))
    e(r['oldQ'].count('"st":0')>=4 and '"lit":[1,1,1,1,1]' in r['reQ'],'saves: old saves start fresh, progress is kept (%s)'%r['reQ'])
    e(not r['errs'] and not errs,'no errors (%s %s)'%(r['errs'],errs[:3]))
    print('CHECKS OK' if not fails else 'CHECKS FAILED: %s'%fails)
play.run(s)
