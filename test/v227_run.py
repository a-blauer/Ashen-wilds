# v227 the Sandstorm Run, reinvented (owner, Nov 13 2026): you steer and shoot (A / D slide the machine, no autopilot), the faster
# rail ride (cruise, boost, brake, the dune walls, boulders, spires, traps), the jumps off the dune crests, the storm behind (it
# creeps up, hurts inside, the boost opens the gap), the autocannon (rate, tracers that kill, heat), the heavy shell, shells to
# kill, no XP and no loot from the Run's creatures, scorpions that run alongside and spit, elites without random traits, the
# camera (wider with speed, put back after), the HUD, the new sounds (louder and brighter than the old gun, every voice renders,
# the engine loop builds and stops).  python3 v227_run.py
import play,json
fails=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c:fails.append(m)
JS=r"""async()=>{const o={},errs=[];const oe=console.error,ow=console.warn;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};console.warn=(...a)=>{const s=a.map(String).join(' ');if(/v227|v226|v219|v165/.test(s))errs.push(s.slice(0,300));ow(...a)};
  window.__T=performance.now();const wait=ms=>new Promise(r=>setTimeout(r,ms));try{POST.render=()=>{}}catch(_){}
  const fx=sec=>{for(let i=0;i<Math.round(sec*60);i++){try{kqFxTick(1/60)}catch(_){}}};
  hero.lvl=35;INSR[3]=2;SS165.c3.built=1;CHEAT.god=false;hero.hp=heroMax();const fov0=cam.fov;
  sr165Go([{id:'v0',drv:'chd',gun:'me'}]);await wait(2600);const V=SR165.me,P=sr165Path(),hw=SR165C.hw;o.run=!!(SR165.on&&V);if(!V){o.errs=errs;return o}
  SR165.ph='run';mOn=false;const drive=(sec,f)=>{for(let i=0;i<Math.round(sec*30);i++){if(f)f(i);V.fT=Math.max(0,V.fT-1/30);sr165Auto(V,1/30);sr165Drive(V,1/30)}},road=on=>SR165.obs.forEach(q=>{q.gone=on?0:1;q.hT=0;if(q.mesh)q.mesh.visible=!!on}),clear=()=>{sr165FoesReset();SR165.obs.forEach(q=>{q.hT=0});V.hp=100;V.wreck=0;V.trap=0;V.bst=1;SR165.ph='run'};
  // the course
  const RM=sr165Ramps();o.course={S:Math.round(P.S),ramps:RM.length,obs:SR165.obs.length,inRamp:SR165.obs.filter(q=>RM.some(r=>q.s>r.s-20&&q.s<r.s+50)).length};
  // a straight, clear stretch to test on
  // a stretch without a crest to test on, the hazards taken away (put back for their own test)
  let s0=260;while(s0<P.S-400&&RM.some(r=>r.s>s0-70&&r.s<s0+130))s0+=10;o.s0=s0;road(false);
  // 1 you steer: D slides right, A left; the dune wall stops and scrapes
  sr165Place(V,s0,0);V.v=20;K.d=1;drive(.6);o.right=+V.o.toFixed(2);o.autoOff=SKR227.auto===false;K.d=0;K.a=1;drive(1.2);o.left=+V.o.toFixed(2);drive(2.2);o.edge=+V.o.toFixed(2);o.edgeHp=+V.hp.toFixed(1);K.a=0;clear();
  // 2 speeds: cruise, boost, brake; it only ever goes forward
  sr165Place(V,s0,0);drive(4);o.cruise=+V.v.toFixed(1);sr165Place(V,s0,0);V.v=20;K.shift=1;drive(2);o.boost=+V.v.toFixed(1);o.bst=+V.bst.toFixed(2);K.shift=0;sr165Place(V,s0,0);V.v=20;K.s=1;const sB=V.s;drive(2);o.brake=+V.v.toFixed(1);o.fwd=V.s>sB+20;K.s=0;clear();
  // 3 a boulder knocks it aside, a spire shatters, a trap drags
  {const hit=k=>{const q=SR165.obs.find(x=>x.k===k&&x.s>150&&Math.abs(x.o)<hw-4);if(!q)return null;road(false);q.gone=0;q.hT=0;clear();sr165Place(V,q.s-14,q.o);V.v=20;const h0=V.hp;let vm=99;drive(1.6,()=>{vm=Math.min(vm,V.v)});return {dmg:+(h0-V.hp).toFixed(1),vmin:+vm.toFixed(1),side:+Math.abs(V.o-q.o).toFixed(2),r:+q.r.toFixed(2),gone:!!q.gone,past:V.s>q.s}};
    o.rock=hit('rock');o.spire=hit('spire');o.trap=hit('trap');road(false);clear()}
  // 4 the crests: off the lip into the air, further with the boost
  {const R=RM[1]||RM[0],jump=b=>{clear();sr165Place(V,R.s-45,0);V.v=b?31:20;V.bst=1;let air=0,top=0;if(b)K.shift=1;drive(4.5,()=>{if(V.air>0){air+=1/30;top=Math.max(top,V.y-GH(V.x,V.z))}});K.shift=0;return {air:+air.toFixed(2),top:+top.toFixed(2),down:!(V.air>0),s:Math.round(V.s-R.s)}};o.jump=jump(0);o.jumpB=jump(1);o.ramp=[R.s,+R.H.toFixed(2)]}
  // 5 the storm: it creeps up at cruise, closes when you slow, the boost opens it, inside it tears the hull
  {clear();sr165Place(V,s0,0);V.v=20;V.gap=30;drive(3);o.creep=+(30-V.gap).toFixed(2);V.gap=30;sr165Place(V,s0,0);V.gap=30;V.v=20;K.s=1;drive(2);K.s=0;o.slow=+(30-V.gap).toFixed(2);sr165Place(V,s0,0);V.gap=30;V.v=20;K.shift=1;drive(2.5);K.shift=0;o.open=+(V.gap-30).toFixed(2);
    sr165Place(V,s0,0);V.v=20;V.gap=-2;const h0=V.hp;drive(1,()=>{V.gap=-2});o.inside=+(h0-V.hp).toFixed(1);V.gap=999;drive(.1);o.cap=[+V.gap.toFixed(1),SKR227.gapMax];clear()}
  // 6 the guns: the rate, a tracer that kills, heat, the heavy shell
  {clear();sr165Place(V,s0,0);V.v=20;const fwd=(d,x)=>P.at(V.s+d,x),xp0=hero.xp,g0=gold,d0=drops.length,k0=JSON.stringify(kills),cx0=party.map(c=>c&&c.x).join(',');
    V.m.updateMatrixWorld(true);SKR226.heat=0;SKR226.hot=0;let n=0;for(let i=0;i<60;i++){V.fT=Math.max(0,V.fT-1/60);const b=V.fT;V.aim=new THREE.Vector3(...[fwd(30,0)[0],V.y+1,fwd(30,0)[1]]);sr165Fire(V,true);if(b<=0&&V.fT>0)n++}o.rate=n;fx(.6);
    const mk=(k,d,x)=>{const [px,pz]=fwd(d,x);return k==='sb'||k==='gs'?skr226Spawn(k,px,pz):sr165Foe(k=='sc'?'scarab':'scorp',px,pz,k)};
    {const e=mk('sc',16,0);V.fT=0;SKR226.hot=0;SKR226.heat=0;V.aim=gY(e.m.position,.6);sr165Fire(V,true);fx(.5);o.tracer=!!e.dead&&!enemies.includes(e)}
    {SKR226.heat=0;SKR226.hot=0;let t=0,hotAt=-1;while(t<12&&hotAt<0){V.fT=Math.max(0,V.fT-1/30);skr226Heat(V,1/30);sr165Fire(V,true);t+=1/30;if(SKR226.hot)hotAt=t}o.hotAt=+hotAt.toFixed(1);fx(.6);SKR226.heat=0;SKR226.hot=0}
    {const L=[[18,-1.6],[18,1.6],[20,0],[21,-1.2],[21,1.4]].map(([d,x])=>mk('sc',d,x));const [ax,az]=fwd(20,0);V.aim=new THREE.Vector3(ax,GH(ax,az)+.6,az);SKR227.hv=0;sr165Fire(V,true,1);const cd=SKR227.hv;fx(.7);o.heavy={dead:L.filter(e=>e.dead).length,cd:+cd.toFixed(1)};
      const e2=mk('sc',16,0);V.aim=gY(e2.m.position,.6);sr165Fire(V,true,1);fx(.6);o.heavy.again=!!e2.dead;if(!e2.dead)removeE(e2)}
    // shells to kill, and what a kill gives
    o.shots={};o.trait=[];for(const k of ['sc','sp','sb','gs']){const e=mk(k,14,4);if(!e){o.shots[k]=-1;continue}if(k==='sb'||k==='gs')o.trait.push(e.trait||'');let m=0;while(!e.dead&&m<90){const f=sr165FoeList().find(q=>q.e===e);if(!f)break;f.hit(1);m++}o.shots[k]=m;if(!e.dead)removeE(e)}
    o.loot={xp:hero.xp-xp0,gold:gold-g0,drops:drops.length-d0,kills:JSON.stringify(kills)===k0,comp:party.map(c=>c&&c.x).join(',')===cx0,count:SKR227.kills};
    {const W=sr165Worm(V.s+40,-5,5,true);o.worm=W?W.hp:null;sr165FoesReset()}}
  // 7 a scorpion keeps beside the Skimmer and spits where it is heading
  {clear();sr165Place(V,s0-60,0);V.v=20;const [x,z]=P.at(V.s+50,hw-2);const e=sr165Foe('scorp',x,z,'sp');let near=0,stings=0,n=0,last=SR165F.st.length;for(let i=0;i<150;i++){__T+=33;sr165Auto(V,1/30);sr165Drive(V,1/30);if(!e.dead&&enemies.includes(e))eTick(e,1/30,__T);sr165StingTick(1/30);
      if(i>75){n++;const al=skr226Along(V,e.m.position);if(al>-6&&al<32)near++}if(SR165F.st.length>last)stings++;last=SR165F.st.length}o.scorp={near:+(near/n).toFixed(2),stings};clear()}
  // 8 the camera: wider with speed and boost, put back when the run ends; the HUD
  {sr165Place(V,s0,0);V.v=20;SR165.ph='run';for(let i=0;i<60;i++){SKR227.camDt=1/30;skr218Cam()}o.fovC=+(cam.fov-fov0).toFixed(1);V.boost=1;for(let i=0;i<60;i++){SKR227.camDt=1/30;skr218Cam()}o.fovB=+(cam.fov-fov0).toFixed(1);V.boost=0;
    const fx2=Math.sin(sr227Yaw(V.s)),fz2=Math.cos(sr227Yaw(V.s));o.behind=+(((V.x-cam.position.x)*fx2+(V.z-cam.position.z)*fz2)).toFixed(1);
    sr165Hud();const g=$('sk227G'),hv=$('sk227V');o.hud={storm:!!g&&/storm/i.test(g.textContent),heavy:!!hv&&/Heavy shell/.test(hv.textContent),n:$('sr165N').textContent}}
  // 9 the sounds: every voice renders; the gun is louder and brighter than the old one
  {const real=AUD,meas=async fn=>{const sr=44100,oc=new OfflineAudioContext(1,sr,sr*3);Object.defineProperty(oc,'state',{get:()=>'running'});const g=oc.createGain();g.gain.value=1;g.connect(oc.destination);oc.out=g;AUD=oc;SND227.last={};try{fn(oc)}finally{AUD=real}
      const b=await oc.startRendering(),d=b.getChannelData(0);let pk=0,e=0,hi=0,late=0,p1=0;for(let i=0;i<d.length;i++){const x=d[i];pk=Math.max(pk,Math.abs(x));e+=x*x;const h=x-p1;hi+=h*h;p1=x;if(i>sr*.6)late+=x*x}return {pk:+pk.toFixed(3),rms:+Math.sqrt(e/sr).toFixed(4),hi:+Math.sqrt(hi/sr).toFixed(4),late:+Math.sqrt(late/sr).toFixed(4)}};
    if(!real){try{audio()}catch(_){}}o.snd={};const e0=SND227.err;for(const k of Object.keys(SND227.V))o.snd[k]=(await meas(()=>snd227(k,1,1))).pk;o.sndErr=SND227.err-e0;
    o.gun=await meas(()=>snd227('gun',1,1));o.old=await meas(()=>svSnd('heavy',.35,1.7));
    o.loop=await meas(oc=>{const L=snd227Build(oc);L.g.gain.value=1;L.eg.gain.value=.2;L.wg.gain.value=.2;L.sg.gain.value=.5})}
  {const a=AUD;o.loopLive=null;if(a&&a.state==='running'){snd227Loop(V,1/30);o.loopLive=!!SND227.L;snd227Stop();o.loopStop=!SND227.L}}
  // 10 the end of the run puts everything back
  sr165End();o.fovBack=Math.abs(cam.fov-fov0)<.01;homeTick(1/30,performance.now());o.overlay=$('sk227S')&&$('sk227S').style.display!=='none'?1:0;o.err7=SKR227.err;o.errs=errs;return o}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:4000])
    ok(r.get('run'),'the Run starts')
    if not r.get('run'):return
    c=r['course'];ok(2400<=c['S']<=3000 and c['ramps']>=4 and c['obs']>=40 and c['inRamp']==0,'the course: ~2700 long, crests, hazards, none at a crest %s'%c)
    ok(r['autoOff'] and r['right']>2.5 and r['left']<r['right']-5,'solo you steer: D slides right (%s), A back left (%s)'%(r['right'],r['left']))
    ok(abs(abs(r['edge'])-(10.5-2.3))<.05 and r['edgeHp']<100,'the dune wall stops the slide (%s) and scrapes the hull (%s)'%(r['edge'],r['edgeHp']))
    ok(abs(r['cruise']-20)<.6 and 29<=r['boost']<=31.5 and r['bst']<1 and abs(r['brake']-13)<.6 and r['fwd'],'cruise %s, boost %s (tank %s), brake %s, always forward'%(r['cruise'],r['boost'],r['bst'],r['brake']))
    k=r['rock'];ok(k and 12<=k['dmg']<=16 and k['vmin']<12 and k['side']>=k['r']+1.3 and k['past'],'a boulder costs hull and speed and knocks the machine aside %s'%k)
    k=r['spire'];ok(k and 6<=k['dmg']<=10 and k['gone'],'a spire shatters %s'%k)
    k=r['trap'];ok(k and k['dmg']>0 and k['vmin']<12 and k['past'],'a sand trap drags but never stops the machine %s'%k)
    j,b=r['jump'],r['jumpB'];ok(j['air']>.5 and j['top']>1 and j['down'] and b['air']>j['air'] and b['top']>j['top'] and b['down'],'the crest throws the Skimmer into the air (%s), further with the boost (%s)'%(j,b))
    ok(1<r['creep']<3.5 and r['slow']>10 and r['open']>12 and 6<=r['inside']<=12 and r['cap'][0]<=r['cap'][1],'the storm: creeps up %s in 3 s, closes %s when braking, the boost opens %s, inside it costs %s hull, the gap is capped %s'%(r['creep'],r['slow'],r['open'],r['inside'],r['cap']))
    ok(9<=r['rate']<=11,'the autocannon fires %s shells a second'%r['rate'])
    ok(r['tracer'],'a tracer kills a scarab ahead and it is gone at once')
    ok(4<=r['hotAt']<=8,'the barrels overheat after %s s of holding the trigger'%r['hotAt'])
    h=r['heavy'];ok(h['dead']==5 and h['cd']>4 and not h['again'],'the heavy shell kills a cluster of five and then needs its cooldown %s'%h)
    ok(r['shots']=={'sc':1,'sp':5,'sb':9,'gs':55},'shells to kill %s'%r['shots'])
    ok(all(t=='' for t in r['trait']) and len(r['trait'])==2,'the elites carry no random trait %s'%r['trait'])
    l=r['loot'];ok(l['xp']==0 and l['gold']==0 and l['drops']==0 and l['kills'] and l['comp'] and l['count']>=9,'the Run\'s creatures give no XP, gold, loot or kill credit %s'%l)
    ok(r['worm']==12,'worms take 12 shells (%s)'%r['worm'])
    ok(r['scorp']['near']>.8 and r['scorp']['stings']>=1,'a scorpion keeps beside the Skimmer and spits %s'%r['scorp'])
    ok(r['fovC']>6 and r['fovB']>r['fovC']+8 and 6<r['behind']<16 and r['fovBack'],'the camera rides behind (%s), widens with speed (+%s) and boost (+%s) and is put back'%(r['behind'],r['fovC'],r['fovB']))
    ok(r['hud']['storm'] and r['hud']['heavy'],'the bar shows the storm and the heavy shell %s'%r['hud'])
    ok(r['sndErr']==0 and all(v>.02 for v in r['snd'].values()) and len(r['snd'])>=14,'every sound of the Run renders %s'%r['snd'])
    g,o=r['gun'],r['old'];ok(g['pk']>o['pk']*2 and g['rms']>o['rms']*.7 and g['hi']>o['hi']*3 and g['late']<g['rms']*.1,'the gun cracks harder (peak) and brighter than the old one and is short (new %s, old %s)'%(g,o))
    ok(r['loop']['rms']>.01,'the engine loop sounds %s'%r['loop'])
    ok(r['loopLive'] in (None,True) and (r['loopLive'] is None or r['loopStop']),'the engine loop starts and stops (%s)'%r['loopLive'])
    ok(r['overlay']==0,'the storm\'s dark is gone after the run')
    ok(r['err7']==0 and not r['errs'],'no errors %s %s'%(r['err7'],r['errs'][:3]))
    print('RESULT','PASS' if not fails else 'FAIL %d'%len(fails))
play.run(s)
