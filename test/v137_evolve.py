# v137 ability evolution. Checks (FAIL lines on a wrong result):
#  · every one of the 85 class abilities has an evolution (name, description, a real change: mods / post / run)
#  · the Evolve button only works at rank 5 and with enough ability points; it costs AP (apSpent), survives save + load,
#    "Reset abilities" removes it and refunds the points; the Abilities window shows the evolution box
#  · evolved casts really change the mechanic: more projectiles (Fan of Knives, Multishot, Fireball, Barrage, Shuriken,
#    Arcane Missiles), bigger radius (Frost Nova reaches an enemy the normal one can't), more chain jumps, 25% more damage
#  · every evolved ability of every class casts in the world with no errors, and leaves nothing behind in the scene
#  · the ability preview plays the evolved form; sheets of four frames per evolved ability → out/v137_evolve_<cls>.jpg
#   PART=checks,cast,sheets (default all)   CLS=mage,...   ONLY=<ability name>
import os,sys,json,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n+('' if ok else '  '+str(info)[:500]))
    if not ok:FAIL.append(n)
PART=os.environ.get('PART','checks,cast,sheets').split(',')
CL=os.environ.get('CLS','warrior,paladin,assassin,ranger,mage').split(',')
ONLY=os.environ.get('ONLY','')
RACE={'warrior':1,'assassin':2,'mage':3,'paladin':4,'ranger':5}
SETUP=r"""()=>{
 window.SETCLS=(c)=>{hero.cls=c;hero.lvl=50;eq={};const W=ITPL.findIndex(t=>t.sl=='weapon'&&t.cls==c&&t.t==0),Ch=ITPL.findIndex(t=>t.sl=='chest'&&t.arm==CLS[c].arm&&t.t==0);
   eq.weapon={id:1,tp:W,lv:1,req:1,r:0,up:0,aff:[]};eq.chest={id:2,tp:Ch,lv:1,req:1,r:0,up:0,aff:[]};if(c=='paladin')eq.offhand={id:3,tp:ITPL.findIndex(t=>t.sl=='offhand'&&t.t==0),lv:1,req:1,r:0,up:0,aff:[]};
   hero.tal={__ab:1};KQS.ck='';try{refreshGear()}catch(e){}hsDirty();hero.hp=heroMax();hero.mp=mpMax()};
 window.CLEARE=()=>{enemies.slice().forEach(e=>{try{removeE(e)}catch(_){}});enemies.length=0;tgt=null};
 window.FOE=(x,z)=>{const P=pl.position,e=spawnEnemy(EN.goo?'goo':Object.keys(EN)[0],P.x+x,P.z+z,50,{});e.__d=1;e.c.st.hp=1e9;e.c.h=6e8;e.agg=0;e.cd=99;e.m.position.set(P.x+x,GH(P.x+x,P.z+z),P.z+z);e.wx=e.m.position.x;e.wz=e.m.position.z;return e};
 // cast ability n in slot 0 (evolved or not); returns what happened over `sec` seconds
 window.CASTN=async(n,evo,sec,foes)=>{const c=hero.cls,s=kqsFind(c,n);hero.tal['ab:'+s.n]=5;if(evo)hero.tal['__ev:'+s.n]=1;else delete hero.tal['__ev:'+s.n];kqsSetLd([s.n]);KQS.ck='';
   hero.cd={};KQS.cdn={};hero.mp=1e6;hero.cr=100;hero.chan=null;if(KQS.ch)kqsChanEnd(true);hero.buffs=[];hsDirty();hero.dash=null;CLEARE();
   const F=(foes||[[0,3],[1.2,5],[-1.2,6.5]]).map(q=>FOE(q[0],q[1]));pl.rotation.y=0;tgt=F[0];face(kqsV(0,1));
   let nl=0;const fl=launch;launch=function(){nl++;return fl.apply(this,arguments)};const h0=F.map(e=>e.c.h);let err='';
   try{if(s.gt){KQS.gp=F[0].m.position.clone();KQS.fire=1}cast(0)}catch(e){err=String(e)}finally{KQS.gp=null;KQS.fire=0;launch=fl}
   const did=(hero.cd.s0||0)>0||!!hero.chan||!!KQS.ch;
   for(let t=0;t<(sec||2.5);t+=.05){STEP(.05);await new Promise(r=>setTimeout(r,50))}
   const hits=F.map((e,j)=>h0[j]-e.c.h);return {did,err,nl,hits,n:hits.filter(v=>v>20).length,dmg:hits.reduce((a,b)=>a+b,0)}};
 return 1}"""
PREV=r"""async(a)=>{const [c,rid,only,CAPS,noevo]=a;
  ren.render=()=>{};if(typeof POST!='undefined')POST.render=()=>{};
  if(xwMode=='abil'&&!$('xw').classList.contains('hide'))closeX();
  SETCLS(c);hero.look={race:rid,skin:BRD[rid].fur[0],eye:BRD[rid].eye[0]};try{refreshGear()}catch(e){}
  if(!noevo)kqsAll(c).forEach(s=>{hero.tal['__ev:'+s.n]=1});
  openAbil();await new Promise(r=>setTimeout(r,200));
  const all=kqsAll(c).filter(s=>!only||s.n==only),FW=240,FH=150,NC=CAPS.length,cv=document.createElement('canvas');cv.width=FW*NC*2;cv.height=FH*Math.ceil(all.length/2);const x=cv.getContext('2d');
  const out={info:[],fail:[],img:'',evo:[]};
  for(let i=0;i<all.length;i++){const s=all[i];KQS.sel=s.n;
    try{XR.abil()}catch(e){out.fail.push(s.n+': render '+e)}
    PV.run=false;if(ABX.on)abxCycle(performance.now());ABX.hits=0;let casted=false,err='',evo=false;
    if(!ABX.on){out.fail.push(s.n+': preview not running');continue}
    const t0=ABX.t0,caps=CAPS.map(v=>ABX.lead+v),shots=[];let last=performance.now();
    const fx0=EVX.lim.ring||0;
    while(true){await new Promise(r=>setTimeout(r,16));const now=performance.now();try{PV.upd(now,Math.min(.05,(now-last)/1000))}catch(e){err=String(e);break}last=now;
      if(ABX.cast&&!casted)casted=true;
      const t=ABX.gt;if(ABX.t0!==t0)break;
      while(shots.length<caps.length&&t>=caps[shots.length]){PV.r.setSize(FW,FH,false);PV.cam.aspect=FW/FH;PV.cam.updateProjectionMatrix();abxCam(1);PV.r.render(PV.sc,PV.cam);
        x.drawImage(PV.cv,((i%2)*NC+shots.length)*FW,Math.floor(i/2)*FH);shots.push(1)}
      if(shots.length>=caps.length)break;if(t>9)break}
    const lb=document.querySelector('#xw .abpvl span');evo=!!(lb&&/✦/.test(lb.textContent));
    x.fillStyle='rgba(0,0,0,.6)';x.fillRect((i%2)*NC*FW,Math.floor(i/2)*FH,FW*NC,16);x.fillStyle='#f5d0fe';x.font='11px sans-serif';x.fillText('✦ '+EVO137[s.n].en+'  ('+s.n+') · hits '+ABX.hits,(i%2)*NC*FW+4,Math.floor(i/2)*FH+12);
    out.info.push(s.n+':'+ABX.hits);if(err)out.fail.push(s.n+': '+err);if(!casted)out.fail.push(s.n+': no cast');if(!evo)out.evo.push(s.n)}
  out.img=cv.toDataURL('image/jpeg',.86);
  abxStop();closeX();await new Promise(r=>setTimeout(r,300));return out}"""
def s(pg):
    ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    pg.on('console',lambda m:errs.append(m.text[:300]) if m.type=='error' else None)
    L.start(pg);ev(SETUP);ev("(o)=>{window.ONLY_=o||''}",ONLY)
    ev("()=>{const p=PMAP[0].path[60];toPos(p[0],p[1]);hero.lvl=50;TOD=.35;STEP(.5)}")
    if 'checks' in PART:
        r=ev("()=>{const miss=[],bad=[];Object.keys(CLS).forEach(c=>kqsAll(c).forEach(s=>{const E=EVO137[s.n];if(!E){miss.push(s.n);return}if(!E.en||!E.d||!(E.mod||E.post||E.run))bad.push(s.n)}));"
               "const names=new Set();Object.values(EVO137).forEach(E=>names.add(E.en));return {miss,bad,n:Object.keys(EVO137).length,uniq:names.size}}")
        chk('every class ability (85) has an evolution with a name, a description and a real change',not r['miss'] and not r['bad'] and r['n']==85,r)
        chk('every evolved name is unique',r['uniq']==85,r)
        # evolve flow
        r=ev("""()=>{SETCLS('warrior');hero.tal.__apB=200;const s=kqsFind('warrior','Cleave'),o={};hero.tal['ab:Cleave']=4;
          o.w4=ev137Why(s);o.e4=ev137Evolve('Cleave');hero.tal['ab:Cleave']=5;const a0=apFree(),sp0=apSpent();o.w5=ev137Why(s);o.e5=ev137Evolve('Cleave');
          o.key=hero.tal['__ev:Cleave'];o.cost=ev137Cost(s);o.paid=a0-apFree();o.spent=apSpent()-sp0;o.again=ev137Evolve('Cleave');
          openAbil();KQS.sel='Cleave';XR.abil();o.box=!!document.querySelector('#xw .ev137-box.on');o.tag=!!document.querySelector('#xw .ev137-tag');
          KQS.sel='Leap Slam';hero.tal['ab:Leap Slam']=5;XR.abil();o.btn=!!document.querySelector('#xw [data-ev137="Leap Slam"]:not([disabled])');o.pvb=!!document.querySelector('#xw [data-ev137pv="Leap Slam"]');closeX();
          saveGame(true);hero.tal={};loadGame();o.load=hero.tal['__ev:Cleave']===1;o.ld=heroSkills().map(q=>q.n);
          gold=1e6;const a1=apFree();kqsReset();o.reset=!hero.tal['__ev:Cleave'];o.refund=apFree()-a1;return o}""")
        print(json.dumps(r))
        chk('below rank 5 it cannot evolve',r['w4']!='' and r['e4']==False,r)
        chk('at rank 5 the Evolve works and costs ability points',r['w5']=='' and r['e5']==True and r['key']==1 and r['paid']==r['cost'] and r['spent']==r['cost'] and 12<=r['cost']<=16,r)
        chk('an evolved ability cannot evolve twice',r['again']==False,r)
        chk('the Abilities window shows the evolution (box, ✦ tag) and an Evolve + Preview button at rank 5',r['box'] and r['tag'] and r['btn'] and r['pvb'],r)
        chk('the evolution survives save + load',r['load'],r)
        chk('Reset abilities removes the evolution and refunds its points',r['reset'] and r['refund']>=r['cost'],r)
        # mechanics: count projectiles, radius, jumps, damage
        def cmp(cls,n,sec=2.5,foes=None):
            ev("(c)=>SETCLS(c)",cls)
            a=ev("async([n,s,f])=>await CASTN(n,false,s,f)",[n,sec,foes]);b=ev("async([n,s,f])=>await CASTN(n,true,s,f)",[n,sec,foes]);return a,b
        for cls,n,lo in [('assassin','Fan of Knives',18),('ranger','Multishot',9),('mage','Fireball',3),('ranger','Barrage',15),('assassin','Shuriken Volley',7),('mage','Arcane Missiles',7)]:
            a,b=cmp(cls,n,1.2)
            chk('%s: evolved form fires more projectiles (%d → %d, want ≥%d)'%(n,a['nl'],b['nl'],lo),b['did'] and b['nl']>=lo and b['nl']>a['nl'],(a,b))
        a,b=cmp('mage','Frost Nova',1.2,[[0,4.3]])
        chk('Frost Nova: the evolved nova reaches an enemy 4.3 tiles away, the normal one does not',a['n']==0 and b['n']==1,(a,b))
        ring=[[0,3]]+[[round(2.2*__import__('math').cos(k*.7),2),round(3+2.2*__import__('math').sin(k*.7),2)] for k in range(1,9)]
        a,b=cmp('mage','Chain Lightning',2.5,ring)
        chk('Chain Lightning: the evolved bolt jumps between more enemies (%d → %d)'%(a['n'],b['n']),b['n']>a['n'] and b['n']>=7,(a,b))
        a,b=cmp('warrior','Cleave',1.5,[[0,2]])
        # v138: each evolution has its own damage factor (BAL138_EVO): Rending Crescent is a large area now, so it hits less per enemy than
        # +25%; it must still out-hit the normal Cleave (the crescent adds a second hit)
        chk('Cleave: the evolved cast still hits harder than the normal one (the crescent adds a second hit)',b['dmg']>a['dmg'],(a,b))
        a,b=cmp('warrior','Cleave',1.5,[[0,6.5]])
        chk('Cleave: the evolved crescent reaches an enemy 6.5 tiles ahead',a['n']==0 and b['n']==1,(a,b))
        r=ev("()=>{SETCLS('mage');const s=kqsFind('mage','Meteor'),e=ev137Sk(s);hero.tal['ab:Meteor']=5;const w=EV137.dmg*(typeof BAL138_EVO!='undefined'&&BAL138_EVO.Meteor!=null?BAL138_EVO.Meteor:1)*(typeof BAL138_EVOC!='undefined'?BAL138_EVOC.mage:1);return {p:kqrP(e)/kqrP(s),want:w,r:e.r/s.r,same:e.n==s.n,ev:e.ev137}}")
        chk('the evolved copy keeps the name (ranks, cooldowns) and hits 25% harder × its v138 factor',abs(r['p']-r['want'])<1e-6 and r['same'] and r['ev']==1,r)
    if 'cast' in PART:
        for c in CL:
            r=ev("""async(c)=>{SETCLS(c);const sc0=scene.children.length,out=[];
              for(const s of kqsAll(c)){if(window.ONLY_&&s.n!=ONLY_)continue;const o=await CASTN(s.n,true,3.2);out.push([s.n,o.did,o.err,o.n])}
              CLEARE();hero.chan=null;if(KQS.ch)kqsChanEnd(true);for(let t=0;t<14;t+=.1){STEP(.1);await new Promise(r=>setTimeout(r,25))}kqsClear&&kqsClear();STEP(1);
              return {out,sc0,sc1:scene.children.length,kids:scene.children.slice(sc0).map(o=>o.type+':'+(o.name||'')+':'+o.children.length).slice(0,12)}}""",c)
            bad=[o for o in r['out'] if not o[1] or o[2]]
            chk(c+': every evolved ability casts without errors',not bad,bad)
            chk(c+': evolved effects clean up after themselves (scene objects %d → %d)'%(r['sc0'],r['sc1']),r['sc1']<=r['sc0']+2,r['kids'])
            print(c,[(o[0],o[3]) for o in r['out']])
        chk('no console errors while casting',not errs,errs[:4])
    if 'sheets' in PART:
        ev("()=>{performance.now=RN;requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}")
        caps=[float(v) for v in os.environ.get('CAPS','.08,.22,.45,.8').split(',')]
        for c in CL:
            r=ev(PREV,[c,RACE[c],ONLY,caps,bool(os.environ.get('NOEVO'))])
            print(c,r['info'])
            open(play.TMP+'/v137_evolve_%s%s.jpg'%(c,os.environ.get('TAG','')),'wb').write(base64.b64decode(r['img'].split(',')[1]))
            chk(c+': every evolved ability plays in the preview (cast, no errors)',not r['fail'],r['fail'])
            chk(c+': the preview names the evolved form',not r['evo'],r['evo'])
        chk('no page errors',not errs,errs[:4])
play.run(s,w=1100,hh=760)
print('FAILURES:',FAIL if FAIL else 'none')
