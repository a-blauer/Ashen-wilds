# v148: Cheddar's quest board in Duskhold (v148.1: difficulties open in order, pay cut by 65%, no Sovereign quests). Checks: no Cheddar, burrow or collider left in the zone instances; the board and
#   Cheddar stand in the Grand Square on free ground (clear of lots, the avenue and every decoration); F prompt at the board;
#   the window has a tab per open zone (Hillside Crest locked until its portal opens); quests count in every instance of their
#   zone and not elsewhere, "anywhere" kinds count in town; "every camp" counts the zone's 9 camps by camp; a finished quest is
#   turned in only at the board; rewards grow with difficulty (XP and items); saves keep it; a v132 save restarts "every camp".
#   SHOT=1: out/v148_board.png (the board in the square) and out/v148_board_win.png (the window).
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=r"""async()=>{const out={err:null},w=ms=>new Promise(r=>setTimeout(r,ms)),T=TOWNS[0];
 try{
  // --- town: the board
  for(let i=0;i<5;i++){homeTick(.05,performance.now(),0);await w(60)}
  const s=chq148Spot();out.board=!!CHQ148.board&&!!(CHQ148.P&&CHQ148.P.ch);out.at=[+(s.bx-T.cx).toFixed(1),+(s.bz-T.cy).toFixed(1)];
  out.onLot=kfLotHit109(s.bx-T.cx,s.bz-T.cy,1.2)||kfLotHit109(s.cx-T.cx,s.cz-T.cy,.8);out.inWalls=kfIn109(s.bx-T.cx,s.bz-T.cy,1)&&kfIn109(s.cx-T.cx,s.cz-T.cy,.5);
  DECO103.forEach(D=>SH.deco[D.k]=1);dc103Sync();const dc=[].concat(...Object.values(DC103.col));
  out.decoHit=dc.filter(c=>[[s.bx,s.bz,1.4],[s.cx,s.cz,.6]].some(([x,z,r])=>c.r!=null?Math.hypot(c.x-x,c.z-z)<c.r+r:Math.abs(c.x-x)<c.hx+r&&Math.abs(c.z-z)<c.hz+r)).length;
  DECO103.forEach(D=>delete SH.deco[D.k]);dc103Sync();
  out.cols=CHQ148.col.filter(c=>T.col.includes(c)).length;
  toPos(s.fx,s.fz);await w(100);promptTick();out.prompt=PR&&PR.label;
  // --- the window
  openX('chq132');await w(100);out.tabs=[...document.querySelectorAll('#xw .cq148t button')].map(b=>(b.disabled?'L:':'')+b.textContent.replace(/[!?]$/,'').trim());
  out.cards=document.querySelectorAll('#xw .cq132').length;closeX&&closeX();try{$('xw').classList.add('hide')}catch(_){}
  // --- accept a kill quest, a camp quest, an anywhere quest
  // v148.1: tiers open in order: a Hard quest is locked until every Easy and Medium quest of the zone is turned in
  chqAccept132('c0b');out.hardLocked=!CHQ132.st.c0b;out.easyOpen=chq148Open(CHQ132_ID.k1a);out.medLocked=!chq148Open(CHQ132_ID.k2a);
  CHQD148[0].filter(q=>q.df==1&&q.id!='k1a').forEach(q=>CHQ132.st[q.id]={s:3,p:q.o.map(o=>o[1])});out.medLockedBy1=!chq148Open(CHQ132_ID.k2a);
  CHQ132.st.k1a={s:3,p:[1]};out.medOpen=chq148Open(CHQ132_ID.k2a)&&!chq148Open(CHQ132_ID.c0b);
  CHQD148[0].filter(q=>q.df==2).forEach(q=>CHQ132.st[q.id]={s:3,p:q.o.map(o=>o[1])});out.hardOpen=chq148Open(CHQ132_ID.c0b);chqAccept132('c0b');chqAccept132('c0c');delete CHQ132.st.k1a;delete CHQ132.st.k3b;
  out.noBoss=Object.values(CHQD148).every(L=>L.every(q=>!q.o.some(o=>o[0]=='boss')));
  out.pay=[chq148XP(CHQ132_ID.k1a),chq148Gold(CHQ132_ID.k1a)];
  ['c0b','c0c','k3b','k1a'].forEach(id=>chqAccept132(id));out.acc=['c0b','c0c','k3b','k1a'].map(id=>!!CHQ132.st[id]);
  // anywhere kind counts in town
  chqEv132('feed',1);out.feedTown=CHQ132.st.k3b.p[0];
  // a kill in town does not count
  chqEv132('kill',1);out.killTown=CHQ132.st.c0b.p[0];
  // --- instances: no Cheddar
  enterMap(0,0);await w(3000);for(let i=0;i<4;i++){homeTick(.05,performance.now(),0);await w(60)}
  const vis=[CHQ132.ch&&CHQ132.ch.root,CHQ132.bur,CHQ132.e&&CHQ132.e.ch&&CHQ132.e.ch.root].filter(o=>o&&o.visible).length;out.instVis=vis;out.posts=chqPosts135().length;
  const I0=PMAP[0].ins[0];const sp=chqSpot132(I0);out.oldCol=CBLK.has(Math.round(sp.z)*W+Math.round(sp.x));
  // kills in field I and II both count; a camp in each counts for "every camp"
  const killIn=async(k,n)=>{const I=PMAP[0].ins[k];if(curIns()!==I){enterMap(0,k);await w(3000)}const q=I.path[40];toPos(q[0],q[1]);await w(150);
    for(let i=0;i<n;i++){const e=spawnEnemy((BIOEN[PMAP[0].n]||['hobgoblin'])[0],q[0]+2,q[1],3,{});e.hp=0;kill(e)}};
  await killIn(0,3);const a=CHQ132.st.c0b.p[0];await killIn(1,2);out.kills=[a,CHQ132.st.c0b.p[0]];
  const clearCamp=async C=>{const I=INSL[C.ig];if(curIns()!==I){enterMap(I.z,I.k);await w(3000)}toPos(C.x+3,C.z+3);await w(300);for(let i=0;i<10&&!ROST.slots.some(s=>s.camp===C&&s.on);i++){rosterTick();await w(250)}
    for(let n=0;n<40;n++){const L=enemies.filter(e=>e.camp===C&&!e.dead);if(!L.length){if(!ROST.slots.some(s=>s.camp===C&&!s.dead))break;rosterTick();await w(100);continue}L.forEach(e=>{e.hp=0;kill(e)});await w(50)}};
  const cams=CAMPS.filter(C=>INSL[C.ig].z===0);out.zoneCamps=cams.length;
  await clearCamp(cams.find(C=>INSL[C.ig].k===0));await clearCamp(cams.find(C=>INSL[C.ig].k===1));out.allCamps=CHQ132.st.c0c.p[0];out.camp1=CHQ132.st.k1a.s;
  // --- turning in: k1a is ready; not away from the board, yes at it
  const xp0=hero.xp,g0=gold,lv0=hero.lvl;chqTurnIn132('k1a');out.awayTurnIn=CHQ132.st.k1a.s;
  recallTown&&recallTown();await w(2500);toPos(s.fx,s.fz);await w(150);const n0=gear.length;chqTurnIn132('k1a');out.turnIn=CHQ132.st.k1a.s;out.gotGold=gold>g0;out.gotXP=hero.lvl>lv0||hero.xp>xp0;out.items1=gear.length-n0;
  // a Hard quest gives two pieces of gear
  CHQ132.st.c0c={s:2,p:[9],cj:[]};const n1=gear.length;chqTurnIn132('c0c');out.items3=gear.length-n1;
  out.xpByDf=[1,2,3,4].map(df=>chq148XP({z:0,df}));
  // --- a new zone joins the board when its portal opens
  bossDone.add(0);out.z1=chq148Zones().includes(1);
  // --- saves
  const sv=x2Save(),kb=CHQ132.st.c0b.p[0];out.v=sv.chq&&sv.chq.v;CHQ132.st={};x2Load(sv);out.reload=!!CHQ132.st.c0b&&CHQ132.st.c0b.p[0]===kb&&CHQ132.st.k1a.s===3;
  const old=JSON.parse(JSON.stringify(sv));old.chq.v=132;old.chq.st.h1a={s:1,p:[2],cj:[0,1]};x2Load(old);out.oldCamps=CHQ132.st.h1a&&CHQ132.st.h1a.p[0];
  x2Load(sv);
 }catch(e){out.err=String(e&&e.stack||e)}return out}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    if os.environ.get('SHOT'):
        pg.evaluate("""async()=>{for(let i=0;i<5;i++){homeTick(.05,performance.now(),0);await new Promise(r=>setTimeout(r,60))}const s=chq148Spot();toPos(s.fx+1.6,s.fz+2.6);
          camYaw=Math.atan2(s.fx-s.bx,s.fz-s.bz)+.5;camPitch=.32;camDist=6.5;try{snapCam()}catch(_){}await new Promise(r=>setTimeout(r,1500))}""")
        pg.screenshot(path=play.TMP+'/v148_board.png',timeout=600000)
        pg.evaluate("()=>{const s=chq148Spot();toPos(s.fx,s.fz);CHQ132.st.k1a={s:2,p:[1]};CHQ132.st.k1b={s:1,p:[6]};openX('chq132')}");pg.wait_for_timeout(800)
        pg.screenshot(path=play.TMP+'/v148_board_win.png',timeout=600000)
        pg.evaluate("()=>{CHQ132.st={};$('xw').classList.add('hide')}")
    r=pg.evaluate(JS);print(json.dumps(r))
    F=lambda m:print('FAIL',m)
    if r['err']:F(r['err'][:500]);return
    c=lambda ok,m:None if ok else F(m)
    c(r['board'],'no board / Cheddar in town');c(not r['onLot'] and r['inWalls'],'board on a lot or outside the walls');c(r['decoHit']==0,'board overlaps a decoration (%s)'%r['decoHit'])
    c(r['cols']==4,'board colliders (%s)'%r['cols']);c(r['prompt'] and 'Quest Board' in r['prompt'],'prompt at the board: %s'%r['prompt'])
    c(any('Kindlelight' in t and not t.startswith('L:') for t in r['tabs']),'Kindlelight tab open: %s'%r['tabs']);c(any(t.startswith('L:') for t in r['tabs']),'locked zones shown locked')
    c(r['cards']>=10,'Kindlelight quests on the board (%s)'%r['cards']);c(all(r['acc']),'quests accepted')
    c(r['feedTown']==1,'an anywhere quest counts in town');c(r['killTown']==0,'a kill in town counted')
    c(r['instVis']==0 and r['posts']==0,'Cheddar still in an instance');c(not r['oldCol'],'old Cheddar collider still there')
    c(r['kills'][0]==3 and r['kills'][1]==5,'kills in field I and II count (%s)'%r['kills'])
    c(r['zoneCamps']==9,'9 camps in the zone (%s)'%r['zoneCamps']);c(r['allCamps']==2,'every-camp counts camps of both fields (%s)'%r['allCamps']);c(r['camp1']==2,'camp quest ready')
    c(r['awayTurnIn']==2,'turned in away from the board');c(r['turnIn']==3 and r['gotGold'] and r['gotXP'],'turn in at the board gives XP and gold')
    c(r['hardLocked'] and r['easyOpen'] and r['medLocked'],'only Easy quests open at first')
    c(r['medLockedBy1'] and r['medOpen'],'Medium opens only once every Easy quest is done (and Hard stays shut)')
    c(r['hardOpen'],'Hard opens once every Medium quest is done');c(r['noBoss'],'no Sovereign quests left')
    c(r['pay'][0]<=round(230*.35)+1 and r['pay'][1]<=round(266*.35)+1,'quest XP and gold cut by 65%% (%s)'%r['pay'])
    c(r['items1']==1,'Easy gives one item (%s)'%r['items1']);c(r['items3']==2,'Hard gives two items (%s)'%r['items3'])
    x=r['xpByDf'];c(x[0]<x[1]<x[2]<x[3],'XP grows with difficulty %s'%x)
    c(r['z1'],'Hillside Crest joins when its portal opens');c(r['v']==148 and r['reload'],'save round trip');c(r['oldCamps']==0,'a v132 every-camp quest restarts (%s)'%r['oldCamps'])
    print('cheddar board: checked')
play.run(s)
