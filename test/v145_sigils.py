# v145: The Three Sigils (Kindlelight III main quest): the plan (three sigils on open ground of III, decorations kept off), the sealed
# Den gateway, the ghost wolf look, finding a sigil, the ritual (waves of 7/6/6/6 = 25, levels 4/5/6 by order, wave timing, the charge,
# attuning), a failed ritual (wandering off), all three attuned opens the gateway, the tracker, saves. NOSHOT=1 skips the pictures.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
SHOT=not os.environ.get('NOSHOT')
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms));let clk=performance.now();
  const god=()=>{hero.hp=heroMax();hero.iv=99};
  const tick=sec=>{for(let i=0;i<Math.round(sec*30);i++){clk+=33;god();mq145Tick(1/30,clk)}};
  const R=mq145Plan(),I=INSL[2];out.sig=R.sig.length;out.fb=R.sig.filter(o=>o.fb).length;
  out.badSpots=R.sig.filter(o=>{const J=insAt(Math.round(o.x),Math.round(o.z));return !J||J.g!==2||!R.ok(o.x,o.z,1)}).length;
  out.sep=Math.min(...R.sig.map((a,i)=>Math.min(...R.sig.filter((b,j)=>j!==i).map(b=>Math.hypot(a.x-b.x,a.z-b.z)))));
  out.decoIn=WD.list.filter(d=>mq145Keep(2,d.x,d.z)&&!/^e_/.test(d.k)&&R.ok(d.x,d.z,.5)).length;
  out.propsIn=R.sig.reduce((n,o)=>n+(MAP.props||[]).filter(q=>Math.hypot(q[0]-o.x,q[1]-o.z)<4.6).length,0);
  out.per=[0,1,2,3].map(mq145Per).join(',');
  // the ghost wolf
  const gm=cr(enemyC('ghostwolf',4,{}));let mats=0,gw=0;gm.traverse(o=>{if(o.isMesh){mats++;if(o.material.userData.gw145)gw++}});out.ghostLook=mats>0&&gw===mats&&!!gm.eyes145;
  // fresh: nothing attuned, the gateway sealed
  out.done0=mq145Done();const G=RPORT.find(r=>r.k=='next'&&r.ig===2);toPos(G.x+1.2,G.z);await wait(150);tick(.2);out.gate0=((worldPrompt()||{}).label||'');
  // finding a sigil
  const s0=R.sig[0];toPos(s0.x+12,s0.z);await wait(200);tick(.3);out.scene=!!MQ145.S;out.found0=MQ145.fd[0];
  // a full ritual: waves on time, wolf levels, the charge, attuning
  const run=async(i,stopAt)=>{const s=R.sig[i];toPos(s.x+1.8,s.z+1.2);tick(.2);const pr=((worldPrompt()||{}).label||'');(worldPrompt()||{fn(){}}).fn();const Rr=MQ145.R;
    const info={pr,lv:Rr?Rr.lv:0,waves:[],lvls:[],look:1};if(!Rr)return info;
    for(let w=0;w<4;w++){while(MQ145.R===Rr&&Rr.w<=w)tick(.25);await wait(900);tick(.1);
      info.waves.push(Rr.live.length);Rr.live.forEach(e=>{info.lvls.push(e.c.l);if(!e.gw145||!e.m.eyes145)info.look=0});
      if(stopAt===w)return info;
      Rr.live.slice().forEach(e=>hurt(e,1e8,null,false));tick(.2)}
    tick(1.5);info.tot=Rr.tot;info.dead=Rr.dead;info.after=MQ145.R;info.at=MQ145.at[i];return info};
  const r0=await run(0);out.r0={pr:r0.pr,lv:r0.lv,waves:r0.waves.join(','),lv0:[...new Set(r0.lvls)].join(','),look:r0.look,tot:r0.tot,dead:r0.dead,at:r0.at,cleared:r0.after===null};
  MQ145.trkK='';mq143Trk();out.trkA=$('mqt143').textContent;
  // a failed ritual: start sigil 1, wander off
  const r1=await run(1,0);out.lv1=r1.lv;MQ145.trkK='';mq143Trk();out.trkR=$('mqt143').textContent;
  const s1=R.sig[1];toPos(s1.x+40,s1.z);tick(.3);out.failed=MQ145.R===null&&!MQ145.at[1];await wait(200);out.leftover=enemies.filter(e=>e.gw145&&!e.dead).length;
  // attune sigils 1 and 2 (levels 5 then 6)
  const r1b=await run(1);out.lv1b=r1b.lv;out.lvs1=[...new Set(r1b.lvls)].join(',');const r2=await run(2);out.lv2=r2.lv;out.lvs2=[...new Set(r2.lvls)].join(',');
  out.n=mq145N();out.done=mq145Done();await wait(2600);tick(.2);
  toPos(G.x+1.2,G.z);await wait(150);tick(.3);out.gate1=((worldPrompt()||{}).label||'');MQ145.trkK='';mq143Trk();out.trkD=$('mqt143').textContent;
  // saves
  const sv=x2Save();out.saved=JSON.stringify(sv.mq145);MQ145.at=[0,0,0];x2Load(sv);out.reload=MQ145.at.join(',');
  const old=JSON.parse(JSON.stringify(sv));delete old.mq145;old.insr=[2,0,0,0,0,0];x2Load(old);out.oldAt=MQ145.at.join(',');out.oldDone=mq145Done();
  old.insr=[3,0,0,0,0,0];x2Load(old);out.oldReached=mq145Done();x2Load(sv);
  return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    cons=[];pg.on('console',lambda m:cons.append(m.text) if m.type in ('error','warning') else None)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r,indent=0)[:5000])
    exp=lambda c,m:(None if c else F(m))
    exp(r['sig']==3 and r['fb']==0,'three sigils planned without fallbacks (%s, %s fallback)'%(r['sig'],r['fb']))
    exp(r['badSpots']==0,'sigils on open ground of III (%s bad)'%r['badSpots']);exp(r['sep']>=12,'sigils spread out (closest %.1f)'%r['sep'])
    exp(r['propsIn']==0,'no map props on the sigils (%s)'%r['propsIn']);exp(r['decoIn']==0,'no decorations on the sigils (%s)'%r['decoIn']);exp(r['per']=='7,6,6,6','25 wolves over 4 waves (%s)'%r['per'])
    exp(r['ghostLook'],'ghost wolves get the shadow look')
    exp(not r['done0'] and 'sealed' in r['gate0'],'the Den gateway is sealed at first (%s)'%r['gate0'])
    exp(r['scene'] and r['found0']==1,'coming near finds a sigil')
    a=r['r0'];exp('Begin the essence' in a['pr'],'ritual prompt (%s)'%a['pr'])
    exp(a['waves']=='7,6,6,6','waves of 7/6/6/6 (%s)'%a['waves']);exp(a['lv']==4 and a['lv0']=='4','first sigil: level 4 wolves (%s / %s)'%(a['lv'],a['lv0']))
    exp(a['look']==1,'spawned wolves are ghost wolves');exp(a['tot']==25 and a['dead']==25,'25 wolves slain (%s/%s)'%(a['dead'],a['tot']))
    exp(a['at']==1 and a['cleared'],'the sigil is attuned when all are slain')
    exp('1/3' in r['trkA'],'tracker counts attuned sigils (%s)'%r['trkA']);exp('Essence charging' in r['trkR'],'tracker during a ritual (%s)'%r['trkR'])
    exp(r['lv1']==5,'second sigil: level 5 (%s)'%r['lv1']);exp(r['failed'] and r['leftover']==0,'wandering off fails the ritual and clears the wolves (%s left)'%r['leftover'])
    exp(r['lv1b']==5 and r['lvs1']=='5','a retried second sigil is still level 5 (%s / %s)'%(r['lv1b'],r['lvs1']))
    exp(r['lv2']==6 and r['lvs2']=='6','third sigil: level 6 (%s / %s)'%(r['lv2'],r['lvs2']))
    exp(r['n']==3 and r['done'],'all three attuned');exp('Step through' in r['gate1'] and 'sealed' not in r['gate1'],'the gateway opens to the Den (%s)'%r['gate1'])
    exp('Step through' in r['trkD'],'tracker points to the Den (%s)'%r['trkD'])
    exp(r['reload']=='1,1,1','save round trip (%s)'%r['reload'])
    exp(r['oldAt']=='0,0,0' and not r['oldDone'],'an old save without the field starts fresh');exp(r['oldReached'],'a save that reached the Den counts it done')
    if SHOT:
        pg.evaluate("""async()=>{const s=mq145Plan().sig[0];toPos(s.x+1,s.z+7);camYaw=Math.PI;camPitch=.45;camDist=11;snapCam();await new Promise(r=>setTimeout(r,2500))}""")
        pg.screenshot(path=play.TMP+'/v145_sigil.png',timeout=600000)
    for e in cons[:8]:
        if 'v145' in e:F('console '+e)
    for e in errs[:5]:F('page error '+e)
    print('v145 sigils:',len(fails),'fails')
play.run(s)
