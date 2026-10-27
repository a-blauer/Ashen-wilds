# v143: The Lantern Road (Kindlelight I main quest; v151: the outpost by the entrance, ~47 lamps along the whole road at 1 bulb, the entrance camp moved; v158: 34 lamps along the smoothed lantern line): the outpost plan, decorations and roaming creatures kept clear, the scene
# (lampposts, Ripper, wardens), glowbulb drops (only in Kindlelight I, only while needed), pickup, the bag, lighting lampposts,
# prompts (captain, lamppost, the dormant gateway), the captain's window, the roll and the fire-up to done, saves (round trip,
# mid-roll, old saves without the field, saves that already reached II), the tracker. NOSHOT=1 skips the pictures.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
SHOT=not os.environ.get('NOSHOT')
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),tick=(sec)=>{for(let i=0;i<Math.round(sec*30);i++)mq143Tick(1/30,performance.now()+i*33)};
  const R=mq143Plan(),I=INSL[0];out.N=R.lamps.length;out.props=R.props.length;out.stakes=R.stakes.length;out.war=Object.keys(R.war).filter(k=>R.war[k]).length;
  // every planned spot is walkable ground of Kindlelight I
  const spots=[].concat(R.lamps,R.props,R.stakes,Object.values(R.war).filter(Boolean),[R.park]);out.badSpots=spots.filter(o=>{const J=insAt(Math.round(o.x),Math.round(o.z));return !J||J.g!==0||!R.ok(o.x,o.z,.3)}).length;
  // no decoration in the keep-out rings; the route ends at the parking spot beside the gateway
  out.decoIn=WD.list.filter(d=>mq143Keep(0,d.x,d.z)&&!/^e_/.test(d.k)&&R.ok(d.x,d.z,.5)).length;   // rim scenery on the edge slope is not in the way
  out.parkGate=Math.hypot(R.park.x-I.ba[0],R.park.z-I.ba[1]);
  // v151: the outpost near the entrance, no camp on it, lamps along the whole road a little further apart
  out.entD=Math.hypot(R.C[0]-I.en[0],R.C[1]-I.en[1]);out.campNear=CAMPS.filter(C=>C.ig===0&&Math.hypot(C.x-R.C[0],C.z-R.C[1])<30).length;out.camps0=CAMPS.filter(C=>C.ig===0).length;
  out.lampSpan=R.lamps.length?R.lamps[R.lamps.length-1].i-R.lamps[0].i:0;out.lampStep=R.lamps.length>1?out.lampSpan/(R.lamps.length-1):0;out.roadN=I.path.length;out.lineLen=R.lineLen;
  // v158: the lantern line: no two lamps crowd each other, the route has no switchbacks and is shorter than the raw road
  {let m=1e9;R.lamps.forEach((a,i)=>R.lamps.forEach((b,j)=>{if(i<j)m=Math.min(m,Math.hypot(a.x-b.x,a.z-b.z))}));out.lampMin=m;
   const rt=R.route;let sh=0,len=0;for(let i=1;i<rt.length;i++)len+=Math.hypot(rt[i][0]-rt[i-1][0],rt[i][1]-rt[i-1][1]);
   for(let i=3;i<rt.length-6;i+=1){const a=rt[i-3],b=rt[i],c=rt[i+3];const u=Math.atan2(b[1]-a[1],b[0]-a[0]),v=Math.atan2(c[1]-b[1],c[0]-b[0]);let d=Math.abs(v-u);if(d>Math.PI)d=2*Math.PI-d;if(d>Math.PI/3)sh++}
   let raw=0;for(let i=R.start+1;i<=I.path.length-13;i++)raw+=Math.hypot(I.path[i][0]-I.path[i-1][0],I.path[i][1]-I.path[i-1][1]);out.routeLen=len;out.rawLen=raw;out.sharp=sh;
   out.lineOff=R.line.filter(q=>!R.ok(q[0],q[1],3)).length}
  // a fresh hero: state 0, gateway locked
  out.st0=MQ143.st;out.done0=mq143Done();
  // drops: none outside Kindlelight I, some inside, none once enough are carried
  const fake=(x,z)=>({m:{position:new THREE.Vector3(x,0,z)},c:{l:1,g:['Mossfrog'],al:0,boss:0,zt:1,en:'goo'},boss:false});
  const d0=drops.length;MQ143.drop=1;const P2=PMAP[1].ins[0].en;lootE(fake(P2[0],P2[1]));out.dropOther=drops.filter(d=>d.kind=='mq143').length;
  const rp=R.lamps[0];for(let i=0;i<5;i++)lootE(fake(rp.x,rp.z));out.dropHere=drops.filter(d=>d.kind=='mq143').length;
  // take them all (walk-over pickup goes through take)
  drops.filter(d=>d.kind=='mq143').forEach(d=>{take(d);scene.remove(d.g);drops.splice(drops.indexOf(d),1)});out.b1=MQ143.b;
  MQ143.b=mq143N()*3;out.need=mq143Need();lootE(fake(rp.x,rp.z));out.dropFull=drops.filter(d=>d.kind=='mq143').length;MQ143.drop=1;MQ143.b=0;
  // the bag shows the bulbs
  MQ143.b=4;bagTab2=1;out.bag=/Quest items[\s\S]*Glowbulb/.test(kqmMatTab());MQ143.b=0;
  // the scene builds when the hero is in Kindlelight I
  toPos(R.C[0],R.C[1]-7);await wait(300);tick(.5);const S=MQ143.S;out.scene=!!S;out.lampsBuilt=S?S.lamps.length:0;out.wardens=S?Object.keys(S.war).length:0;
  out.wardenAnimal=S?Object.values(S.war).every(w=>w.g.children.some(m=>m.isSkinnedMesh&&m.userData.fk)):false;
  out.wardenWpn=S?Object.values(S.war).filter(w=>w.g.userData.mq.wpn).length:0;
  // the dormant gateway: the F prompt is locked until done
  toPos(I.ba[0]+R.gate.dx*1.2,I.ba[1]+R.gate.dz*1.2);await wait(100);tick(.2);out.gateLocked=((worldPrompt()||{}).label||'');
  // the captain's prompt and window
  const c=S.war.captain.g.position;toPos(c.x+1.2,c.z);await wait(100);tick(.2);out.capPrompt=((worldPrompt()||{}).label||'');openX('mq143');out.win=$('xwB').textContent.includes('Lantern Wardens');
  const go=$('xwF').querySelector('[data-mq143="go"]');if(go)go.click();out.st1=MQ143.st;closeX();
  // a lamppost: locked without bulbs, lit with three
  const L=S.lamps[2];toPos(L.x+.8,L.z);tick(.2);out.lampNo=((worldPrompt()||{}).label||'');MQ143.b=4;out.lampYes=((worldPrompt()||{}).label||'');(worldPrompt()||{fn(){}}).fn();
  await wait(700);tick(.3);out.lit1=mq143Lit();out.b2=MQ143.b;out.lampOn=L.on.visible;
  // tracker
  toPos(R.C[0],R.C[1]);tick(.5);MQ143.trkK='';mq143Trk();out.trk=$('mqt143').textContent;out.trkVis=!$('mqt143').classList.contains('hide');
  // save mid-quest, load it back
  const s1=x2Save();out.saved=JSON.stringify(s1.mq143);MQ143.lit=MQ143.lit.map(()=>0);MQ143.b=0;x2Load(s1);out.reload=[MQ143.st,MQ143.b,mq143Lit()].join(',');
  // light the rest: the Ripper rolls, parks, fires up; the gateway opens
  MQ143.b=99;S.lamps.forEach((l,i)=>{if(!MQ143.lit[i])mq143Light(i)});await wait(2200);out.st2=MQ143.st;const p0=S.rip.g.position.clone();tick(5);out.moved=S.rip.g.position.distanceTo(p0);
  const s2=x2Save();out.midSave=s2.mq143.st;
  tick(Math.ceil(S.len/MQ143.speed)+3);out.len=S.len;out.fire=!!MQ143.fire||MQ143.st==3;tick(9);out.st3=MQ143.st;out.parked=Math.hypot(S.rip.g.position.x-R.park.x,S.rip.g.position.z-R.park.z);out.swirl=S.swirl&&S.swirl.visible;
  toPos(I.ba[0]+R.gate.dx*1.2,I.ba[1]+R.gate.dz*1.2);tick(.2);out.gateOpen=((worldPrompt()||{}).label||'');
  out.needDone=mq143Need();
  // v151: a save from the 8-lamp road gets 3 bulbs back for each lamp it had lit and starts the new road dark
  const pre=JSON.parse(JSON.stringify(s1));pre.mq143={v:143,st:1,b:2,lit:[1,1,0,0,0,0,0,0],seen:1};x2Load(pre);out.preB=MQ143.b;out.preLit=mq143Lit();out.preSt=MQ143.st;
  // v158: a save from the ~47-lamp road gets one bulb back for each lamp it had lit and starts the lantern line dark
  const p151=JSON.parse(JSON.stringify(s1));p151.mq143={v:151,st:1,b:4,lit:new Array(47).fill(0).map((_,i)=>i<5?1:0),seen:1};x2Load(p151);out.p151B=MQ143.b;out.p151Lit=mq143Lit();out.p151St=MQ143.st;
  const p158=JSON.parse(JSON.stringify(s1));p158.mq143={v:158,st:1,b:2,lit:new Array(mq143N()).fill(0).map((_,i)=>i<3?1:0),seen:1};x2Load(p158);out.p158B=MQ143.b;out.p158Lit=mq143Lit();
  // a save made mid-roll loads as done; an old save without the field starts at 0 (II not reached) or done (II reached)
  x2Load(s2);out.midLoad=MQ143.st;
  const old=JSON.parse(JSON.stringify(s2));delete old.mq143;old.insr=[0,0,0,0,0,0];x2Load(old);out.oldSt=MQ143.st;out.oldDone=mq143Done();
  old.insr=[1,0,0,0,0,0];x2Load(old);out.oldReached=mq143Done();
  // roaming creatures keep out of the outpost
  rosterBuild(0);const cc=R.center;out.rosterIn=ROST.slots.filter(s=>s.wild&&Math.hypot(s.x-cc[0],s.z-cc[1])<10).length;
  return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r,indent=0)[:4000])
    exp=lambda c,m:(None if c else F(m))
    exp(r['N']>=30,'lampposts along the whole road (%s)'%r['N']);exp(r['props']>=10,'outpost props planned (%s)'%r['props']);exp(r['war']==7,'7 warden spots (%s)'%r['war'])
    exp(r['badSpots']==0,'planned spots on walkable ground of Kindlelight I (%s bad)'%r['badSpots']);exp(r['decoIn']==0,'no decoration in the keep-out rings (%s)'%r['decoIn'])
    exp(r['parkGate']<7,'the Ripper parks beside the gateway (%.1f)'%r['parkGate'])
    exp(r['entD']<45,'the outpost is near the entrance (%.1f)'%r['entD']);exp(r['campNear']==0 and r['camps0']==3,'no camp on the outpost, still 3 camps (%s near, %s)'%(r['campNear'],r['camps0']))
    exp(r['lampSpan']>r['lineLen']*.85 and 6<=r['lampStep']<=8,'lamps span the lantern line about 7 apart (span %.0f of %.0f, step %.1f)'%(r['lampSpan'],r['lineLen'],r['lampStep']))
    exp(r['lampMin']>=6,'no two lampposts side by side (closest %.1f)'%r['lampMin'])
    exp(r['sharp']==0,'the Ripper route has no switchbacks (%s sharp turns)'%r['sharp']);exp(r['routeLen']<r['rawLen']*.9,'the route is shorter than the raw road (%.0f vs %.0f)'%(r['routeLen'],r['rawLen']))
    exp(r['lineOff']==0,'the lantern line stays well inside open ground (%s points near the edge)'%r['lineOff'])
    exp(r['st0']==0 and not r['done0'],'fresh hero: quest not started, gateway not open')
    exp(r['dropOther']==0,'no glowbulbs outside Kindlelight I');exp(r['dropHere']==5,'glowbulbs drop in Kindlelight I (%s/5)'%r['dropHere'])
    exp(r['b1']==5,'picking up adds the bulbs (%s)'%r['b1']);exp(r['need']==0 and r['dropFull']==0,'no drops once enough bulbs are carried')
    exp(r['bag'],'the bag shows glowbulbs under Quest items')
    exp(r['scene'] and r['lampsBuilt']==r['N'] and r['wardens']==7,'the scene builds (lamps %s, wardens %s)'%(r['lampsBuilt'],r['wardens']))
    exp(r['wardenAnimal'],'wardens are animal folk bodies');exp(r['wardenWpn']==7,'every warden holds a weapon (%s)'%r['wardenWpn'])
    exp('dormant' in r['gateLocked'],'the gateway prompt is locked before the quest (%s)'%r['gateLocked'])
    exp('Talk to' in r['capPrompt'],'captain prompt (%s)'%r['capPrompt']);exp(r['win'],'the captain window opens');exp(r['st1']==1,'accepting the quest sets state 1')
    exp('needs 1 glowbulb' in r['lampNo'],'lamppost locked without bulbs (%s)'%r['lampNo']);exp('Light the lamppost' in r['lampYes'],'lamppost prompt with bulbs (%s)'%r['lampYes'])
    exp(r['lit1']==1 and r['b2']==3 and r['lampOn'],'lighting uses 1 bulb and lights the lamp (%s left)'%r['b2'])
    exp(r['trkVis'] and ('1/%d'%r['N']) in r['trk'],'tracker shows the lamps (%s)'%r['trk'])
    exp(r['reload']=='1,3,1','save round trip keeps state, bulbs, lamps (%s)'%r['reload'])
    exp(r['st2']==2 and r['moved']>3,'the last lamp starts the roll (st %s, moved %.1f)'%(r['st2'],r['moved']))
    exp(r['st3']==3 and r['parked']<.5 and r['swirl'],'the Ripper parks and the gateway opens (st %s, %.2f from park)'%(r['st3'],r['parked']))
    exp('Step through' in r['gateOpen'],'the gateway works once open (%s)'%r['gateOpen']);exp(r['needDone']==0,'no more drops once done')
    exp(r['midSave']==2 and r['midLoad']==3,'a mid-roll save loads as done')
    exp(r['preB']==8 and r['preLit']==0 and r['preSt']==1,'an 8-lamp save gets its bulbs back and starts the new road dark (b %s, lit %s)'%(r['preB'],r['preLit']))
    exp(r['p151B']==9 and r['p151Lit']==0 and r['p151St']==1,'a ~47-lamp save gets a bulb back per lit lamp and starts the lantern line dark (b %s, lit %s)'%(r['p151B'],r['p151Lit']))
    exp(r['p158B']==2 and r['p158Lit']==3,'a v158 save keeps its lit lamps (b %s, lit %s)'%(r['p158B'],r['p158Lit']))
    exp(r['oldSt']==0 and not r['oldDone'],'an old save without the field starts the quest fresh');exp(r['oldReached'],'a save that reached II counts the quest as done')
    exp(r['rosterIn']==0,'no roaming creatures in the outpost (%s)'%r['rosterIn'])
    if SHOT:
        pg.evaluate("""async()=>{const R=mq143Plan();TOD=.35;toPos(R.C[0]-1,R.C[1]-9);camYaw=Math.PI*.95;camPitch=.55;camDist=13;snapCam();await new Promise(r=>setTimeout(r,2500))}""")
        pg.screenshot(path=play.TMP+'/v143_outpost.png',timeout=600000)
        pg.evaluate("""async()=>{const S=MQ143.S,g=S.gate;toPos(g.x-3,g.z-6);camYaw=Math.PI*1.15;camPitch=.4;camDist=10;snapCam();await new Promise(r=>setTimeout(r,2500))}""")
        pg.screenshot(path=play.TMP+'/v143_gateway.png',timeout=600000)
    for e in errs[:5]:F('page error '+e)
    print('v143 lantern road:',len(fails),'fails')
play.run(s)
