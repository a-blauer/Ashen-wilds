# v92 combat: ghost wolves for Wild Hunt / Stampede, poise (harder to interrupt enemy attacks), wave-trial XP and drops.
#   PART=wolf,poise,wave   pick parts          NOSHOT=1  no frame sheets
#   SRC=<old build> TAG=before   writes out/v92_<TAG>.json (damage, interrupt table, XP, drops, chest) for a comparison;
#   REF=out/v92_before.json      compares this run with it (same wolf damage, XP ×0.6, wave drops ×0.5, identical end chest)
# Frame sheets: out/v92_<TAG>_hunt.jpg, out/v92_<TAG>_stamp.jpg
import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__));LIB=open(HERE+'/v90_abil_lib.js').read()
TAG=os.environ.get('TAG','after');PART=os.environ.get('PART','wolf,poise,wave').split(',');NOSHOT=os.environ.get('NOSHOT')
FAIL=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+(' · '+str(info)[:500] if info!='' else ''),flush=True)
    if not ok:FAIL.append(name)
JS=r"""()=>{
 window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;window.__rr=ren.render.bind(ren);
 window.F={dum:[],keep:[],dmg:[],gt:0,ht:[],cx:[],mob:null,forceD:null};
 {const f=hurt;hurt=function(e,d,s,crit,dot){const h0=e&&e.c?e.c.h:0;const r=f.apply(this,arguments);const i=F.dum.indexOf(e);if(i>=0)F.dmg.push({i,d:h0-e.c.h,t:+F.gt.toFixed(3)});return r}}
 {const f=rollHero;rollHero=function(e,raw,mt,o){if(F.forceD!=null&&e===F.mob)return {d:F.forceD,crit:false};if(!F.dum.includes(e))return f.apply(this,arguments);const s=HS(),c0=s.crit,R=Math.random;s.crit=-1;Math.random=()=>.5;try{return f.apply(this,arguments)}finally{s.crit=c0;Math.random=R}}}
 {const f=hitTarget;hitTarget=function(e,tg,mult,mt){if(e===F.mob)F.ht.push({n:e.atk?e.atk.n:null,id:e.atk&&e.atk.__id});return f.apply(this,arguments)}}
 {const f=mCancel;mCancel=function(e){if(e===F.mob&&e.atk)F.cx.push({ph:e.atk.ph,id:e.atk.__id});return f.apply(this,arguments)}}
 {const f=heroTick;heroTick=function(dt,now){F.gt+=dt>0?dt:0;F.dum.forEach((e,i)=>{if(e.dead)e.dead=0;e.c.h=Math.max(e.c.h,1e8);e.stun=5;e.agg=0;e.m.position.x=e._p[0];e.m.position.z=e._p[1];e.vx=e.vz=0;if(e.atk)mCancel(e)});
   enemies.slice().forEach(q=>{if(!F.dum.includes(q)&&!F.keep.includes(q)&&!q.boss)removeE(q)});hero.hp=heroMax();hero.mp=mpMax();hero.iv=0;party.forEach(c=>{if(c)c.h=0});return f.apply(this,arguments)}}
 window.STEP=(sec,draw)=>{const n=Math.max(1,Math.round(sec/.016));ren.render=()=>{};POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;if(F.tod!=null)TOD=F.tod;loop(VT);F.cam&&F.cam()}
   ren.render=__rr;POST.render=__pr;if(draw){F.cam&&F.cam();POST.render()}return F.gt};
 // seeded random (same sequence in both builds)
 window.SEED=(s)=>{let a=s>>>0;window.__R0=window.__R0||Math.random;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
 window.UNSEED=()=>{if(window.__R0)Math.random=window.__R0};
 window.CLRDROPS=()=>{drops.forEach(d=>{scene.remove(d.g);d.g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()})});drops.length=0};
 return 1}"""
def sheet(files,out,cols=4):
    ims=[Image.open(f) for f in files];w,h=ims[0].size;rows=(len(ims)+cols-1)//cols
    S=Image.new('RGB',(w*cols,h*rows),(0,0,0))
    for i,im in enumerate(ims):S.paste(im,((i%cols)*w,(i//cols)*h))
    S.save(out,quality=86);[os.remove(f) for f in files]
RES={}
def s(pg):
    ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]+' '+(e.stack or '')[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="ranger"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{const q=PMAP[0];toPos(q.path[40][0],q.path[40][1])}");pg.wait_for_timeout(2500)
    ev("(L)=>{eval(L)}",LIB);ev(JS)
    Z,I=[int(x) for x in os.environ.get('SPOT','1,60').split(',')]
    ev("""([Z,I])=>{const q=PMAP[Z];const [x,z]=q.path[I],n=q.path[Math.min(q.path.length-1,I+6)];window.F.P0=[x,z];F.a=Math.atan2(n[0]-x,n[1]-z);F.W=(lx,lz)=>[lx*Math.cos(F.a)+lz*Math.sin(F.a),-lx*Math.sin(F.a)+lz*Math.cos(F.a)];F.tod=.25;toPos(x,z);
      [...$('stage').children].forEach(c=>{if(c!==ren.domElement&&!c.contains(ren.domElement))c.style.visibility='hidden'});return [x,z]}""",[Z,I])
    def setup(cls,lv,names,dums,cam):
        return ev("""([cls,lv,names,dums,camv])=>{kqsClear();F.dum.forEach(e=>removeE(e));F.dum=[];hero.cls=cls;cheatLevel(Math.max(0,lv-hero.lvl));hero.tal={__ab:1};
          kqsAll(cls).forEach(s=>{if(s.lv<=lv)hero.tal['ab:'+s.n]=1});hero.tal.__ld=names.join('|');V90.gear(lv);hero.buffs=[];hero.cd={};hero.cr=0;KQS.cdn={};hsDirty();try{refreshGear()}catch(_){}
          const [x,z]=F.P0;toPos(x,z);pl.rotation.y=F.a;STEP(.3);
          dums.forEach(([lx,lz])=>{const [dx,dz]=F.W(lx,lz);const e=spawnEnemy(V90.mobKey(lv),x+dx,z+dz,lv,{});e.c.st.hp=1e9;e.c.h=6e8;e._p=[x+dx,z+dz];e.m.position.set(x+dx,0,z+dz);F.dum.push(e)});
          tgt=F.dum[0]||null;F.c0=camv;F.cam=()=>{const c=F.c0,X=F.P0[0],Z=F.P0[1],Y=GH(X,Z),a=F.W(c[0],c[2]),b=F.W(c[3],c[5]);cam.position.set(X+a[0],Y+c[1],Z+a[1]);cam.lookAt(X+b[0],Y+c[4],Z+b[1])};
          STEP(.5);F.dmg=[];hud();return {sk:heroSkills().map(s=>s.n),lv:hero.lvl}}""",[cls,lv,names,dums,cam])
    def run(key,cls,lv,name,dums,cam,times,gt=None,wait_end=3):
        print('\n==',key,name,setup(cls,lv,[name],dums,cam))
        base=ev("()=>{STEP(.2);window.__kids=new Set(scene.children);return {n:scene.children.length,all:(()=>{let n=0;scene.children.forEach(c=>{if(!window.FXA||c!==FXA.root)c.traverse(()=>n++)});return n})(),o:KQS.objs.length,made:window.CBW?CBW.made:0}}")
        r=ev("([gt])=>{F.dmg=[];F.gt0=F.gt;tgt=F.dum[0];cast(0);if(gt&&KQS.tg){const [dx,dz]=F.W(gt[0],gt[1]);KQS.tg.p=V(F.P0[0]+dx,0,F.P0[1]+dz);kqsTgFire()}return {cd:+(hero.cd.s0||0).toFixed(2)}}",[gt])
        chk(key+': cast went off',r['cd']>0,r)
        files=[];t0=0;info=[]
        for i,t in enumerate(times):
            st=ev("""([dt,draw])=>{STEP(dt,draw);let gw=0,box=0;scene.traverse(o=>{if(o.userData&&o.userData.cbw)gw++});KQS.objs.forEach(o=>{});
              scene.children.forEach(c=>{if(c.userData&&c.userData.legs&&c.userData.legs.length)box++});return {t:+(F.gt-F.gt0).toFixed(2),n:scene.children.length,o:KQS.objs.length,ghost:gw,box}}""",[t-t0,not NOSHOT]);t0=t
            info.append(st)
            if not NOSHOT:
                f=play.TMP+'/_v92_%s_%d.png'%(key,i);pg.locator('#stage').screenshot(path=f,timeout=240000);files.append(f)
        for st in info:print('  ',st)
        if files:sheet(files,play.TMP+'/v92_%s_%s.jpg'%(TAG,key))
        end=ev("([w])=>{STEP(w);return {n:scene.children.length,all:(()=>{let n=0;scene.children.forEach(c=>{if(!window.FXA||c!==FXA.root)c.traverse(()=>n++)});return n})(),o:KQS.objs.length,new:scene.children.filter(c=>!__kids.has(c)).map(c=>c.type+':'+c.name+':'+c.children.length).slice(0,6)}}",[wait_end])
        dm=ev("()=>F.dmg");tot=sum(d['d'] for d in dm)
        RES[key]={'dmg':round(tot),'hits':len(dm),'per':[round(sum(d['d'] for d in dm if d['i']==i)) for i in range(len(dums))],'t':[d['t'] for d in dm][:14],'ghost':max(x['ghost'] for x in info),'box':max(x['box'] for x in info)}
        print('  damage',RES[key],'| scene',base,'->',end)
        chk(key+': scene children back to baseline',end['n']<=base['n'] and end['o']==0,(base,end))
        chk(key+': no leftover objects in the scene graph',end['all']<=base['all']+2,(base['all'],end['all']))
    if 'wolf' in PART:
        # Wild Hunt: three wolves, two dummies ahead
        run('hunt','ranger',50,'Wild Hunt',[[1.5,4.5],[-1.5,5]],[4.6,1.8,1.4,.4,.7,3.4],[.1,.3,.6,1.0,1.4,1.8,2.4,3.0,4.0,6.0,12.1,12.4],wait_end=2)
        # Stampede: four dummies along the line, ground target 10 ahead
        run('stamp','ranger',50,'Stampede',[[0,3],[.8,5.5],[-.8,7.5],[0,9.5]],[7.5,2.6,1.0,-.5,.6,5.5],[.05,.12,.2,.28,.36,.44,.52,.6,.7,.8,.92,1.05],gt=[0,10],wait_end=2)
    if 'poise' in PART:
        ev("()=>{F.dum.forEach(e=>removeE(e));F.dum=[];kqsClear();hero.cls='warrior';cheatLevel(Math.max(0,30-hero.lvl));const [x,z]=F.P0;toPos(x,z);pl.rotation.y=F.a;STEP(.3)}")
        # each case: fresh mob 1.6 ahead, it starts `mv` at the hero; hits are fractions of max health (b: basic attack, s: ability hit)
        T=ev("""()=>{const out=[];let id=0;
          const CASE=(name,al,mv,hits,extra)=>{F.keep.forEach(q=>{if(enemies.includes(q))removeE(q)});F.keep=[];F.ht=[];F.cx=[];
            const [dx,dz]=F.W(0,1.6),e=spawnEnemy(V90.mobKey(30),F.P0[0]+dx,F.P0[1]+dz,30,{al:!!al});e.agg=1;e.cd=0;e.c.h=M(e.c);e.sh=0;F.keep.push(e);F.mob=e;STEP(.02);
            if(e.atk)mCancel(e);F.cx=[];mStart(e,pl,mv);const a=e.atk;a.__id=++id;let pct=0;const tel0=!!(a.tel&&a.tel.parent),hp0=e.c.h;
            hits.forEach(h=>{F.forceD=Math.round(M(e.c)*h.f);pct+=h.f;heroHit(e,1,'p',{s:h.b?{basic:1}:{col:0xffffff},proc:false});F.forceD=null;STEP(.02)});
            if(extra=='fin'){if(typeof cbHeavy=='function')cbHeavy(e);else if(!e.boss&&!e.dead&&!e.c.al){mCancel(e);e.cd=Math.max(e.cd,1)}}
            if(extra=='stun')eStatus(e,{stun:1},0,'h');
            const lost=Math.round((hp0-e.c.h)/M(e.c)*100),pz=Math.round((a.pz||0)/M(e.c)*100),sh=Math.round(e.sh||0),tr=e.trait||'';STEP(a.M.wind+a.M.act+.3);
            const hit=F.ht.some(q=>q.id==a.__id),cx=F.cx.some(q=>q.id==a.__id);
            out.push({name,al:!!al,mv,dmgPct:Math.round(pct*100),cancelled:cx,finished_and_hit:hit,tel:tel0,lost,pz,sh,tr});F.mob=null};
          const B=(f,n)=>Array.from({length:n},()=>({f,b:1})),S=(f,n)=>Array.from({length:n},()=>({f,b:0}));
          CASE('1 basic hit 8%',0,'slam',B(.08,1));CASE('1 ability hit 5%',0,'slam',S(.05,1));CASE('3 basic hits 8% (24%)',0,'slam',B(.08,3));
          CASE('4 basic hits 8% (32%)',0,'slam',B(.08,4));CASE('2 ability hits 15% (30%)',0,'charge',S(.15,2));CASE('basic bite: 3 hits 10% (30%)',0,'bite',B(.1,3));
          CASE('combo finisher',0,'slam',[],'fin');CASE('stun ability',0,'slam',[],'stun');
          CASE('elite: 1 ability hit 10%',1,'slam',S(.1,1));CASE('elite: 4 hits 8% (32%)',1,'slam',B(.08,4));CASE('elite: 6 hits 8% (48%)',1,'slam',B(.08,6));
          CASE('elite: combo finisher',1,'slam',[],'fin');CASE('elite: finisher after 3 hits 10%',1,'slam',B(.1,3),'fin');CASE('elite: stun ability',1,'slam',[],'stun');
          F.keep.forEach(q=>{if(enemies.includes(q))removeE(q)});F.keep=[];
          // boss: stun twice in a row
          const bo=bossEnt(1)||bossEnt(0);let bs=null;if(bo){bo.stun=0;bo.cbImm=0;eStatus(bo,{stun:2},0,'h');const s1=+(bo.stun||0).toFixed(2);eStatus(bo,{stun:2},0,'h');const s2=+(bo.stun||0).toFixed(2);bo.stun=0;bs={first:s1,second_resisted:s2<=s1&&!!bo.cbImm}}
          return {cases:out,boss:bs}}""")
        RES['poise']=T
        print('\n  %-36s %-6s %-7s %-10s %s'%('case','move','dmg%','cancelled','finished+hit'))
        for c in T['cases']:print('  %-36s %-6s %-7s %-10s %s'%(c['name'],c['mv'],c['dmgPct'],c['cancelled'],c['finished_and_hit']))
        print('  boss',T['boss'])
        if TAG!='before':
            want={'1 basic hit 8%':0,'1 ability hit 5%':0,'3 basic hits 8% (24%)':0,'4 basic hits 8% (32%)':1,'2 ability hits 15% (30%)':1,'basic bite: 3 hits 10% (30%)':1,'combo finisher':1,'stun ability':1,
                  'elite: 1 ability hit 10%':0,'elite: 4 hits 8% (32%)':0,'elite: 6 hits 8% (48%)':1,'elite: combo finisher':0,'elite: finisher after 3 hits 10%':1,'elite: stun ability':1}
            for c in T['cases']:
                w=want[c['name']];chk('poise: %s -> %s'%(c['name'],'interrupted' if w else 'not interrupted'),c['cancelled']==bool(w) and (c['finished_and_hit']!=bool(w)),c)
            chk('poise: red warning was up during the wind-up',all(c['tel'] for c in T['cases']))
            chk('poise: a boss resists a second stun right after the first',T['boss'] and T['boss']['second_resisted'],T['boss'])
    if 'wave' in PART:
        ev("()=>{F.dum.forEach(e=>removeE(e));F.dum=[];F.keep=[];kqsClear();CLRDROPS()}")
        W=ev("""()=>{const out={};const [x,z]=F.P0;
          // XP per kill (hero level 20, mob level 20, gap 0, no rest bonus)
          const XP=(wv,al)=>{let t=0,n=12;for(let i=0;i<n;i++){hero.lvl=20;hero.xp=0;hero.buffs=[];hsDirty();const e=spawnEnemy(V90.mobKey(20),x+3,z+3,20,{al:!!al});if(wv)e.wv=1;e.lvl=20;e.c.l=20;F.keep.push(e);try{rest={t:0,m:0}}catch(_){}
            const x0=hero.xp,l0=hero.lvl,sx=HS().xp;hurt(e,1e9,null);t+=hero.xp-x0;if(i<3)(out.xpdbg=out.xpdbg||[]).push([wv,al,l0,hero.lvl,e.c.l,+sx.toFixed(3),hero.xp-x0]);F.keep=[]}STEP(.4);enemies.slice().forEach(q=>{if(!q.boss)removeE(q)});CLRDROPS();return +(t/n).toFixed(2)};
          SEED(7);out.xp={normal:XP(0,0),wave:XP(1,0),elite:XP(0,1),wave_elite:XP(1,1)};
          // drops: real kills (kill() → lootE → drop), seeded
          const KILLS=(wv,n)=>{const K={};let tot=0,g0=gold;for(let i=0;i<n;i++){const e=spawnEnemy(V90.mobKey(20),x+3,z+3,20,{al:i%10==0});if(wv)e.wv=1;F.keep.push(e);const d0=drops.length;hurt(e,1e9,null);F.keep=[];
              for(let j=d0;j<drops.length;j++){K[drops[j].kind]=(K[drops[j].kind]||0)+1;tot++}if(drops.length>40)CLRDROPS();if(i%25==24){STEP(.4);enemies.slice().forEach(q=>{if(!q.boss)removeE(q)})}}
            STEP(.4);enemies.slice().forEach(q=>{if(!q.boss)removeE(q)});CLRDROPS();return {kills:n,drops:tot,per_kill:+(tot/n).toFixed(3),kinds:K,gold:gold-g0}};
          SEED(11);out.kills={normal:KILLS(0,400),wave:KILLS(1,400)};
          // drops: many lootE() calls on one mob (statistics, eggs included)
          const LOOT=(wv,n)=>{const e=spawnEnemy(V90.mobKey(20),x+3,z+3,20,{});if(wv)e.wv=1;F.keep.push(e);const K={};let tot=0;
            for(let i=0;i<n;i++){e.c.al=i%10==0?1:0;const d0=drops.length;lootE(e);for(let j=d0;j<drops.length;j++){K[drops[j].kind]=(K[drops[j].kind]||0)+1;tot++}if(drops.length>40)CLRDROPS()}
            F.keep=[];removeE(e);CLRDROPS();return {n,drops:tot,per_kill:+(tot/n).toFixed(4),kinds:K}};
          SEED(13);out.loot={normal:LOOT(0,8000),wave:LOOT(1,8000)};
          // end-of-trial reward chest: waveEnd(true) 300 times, seeded
          SEED(17);const C={kinds:{},n:0,list:[]};let g0=gold;
          for(let i=0;i<300;i++){WV={pi:0,w:10,n:10,foes:[],brk:0,lv:PMAP[0].lv[1],go:1,nt:0};const d0=drops.length;waveEnd(true);
            const L=drops.slice(d0).map(d=>d.kind+(d.kind=='mat'?':'+d.data.k+'x'+d.data.n:d.kind=='gear'?':r'+d.data.r:d.kind=='egg'?':t'+d.data.tier:''));C.n+=L.length;L.forEach(k=>{const kk=k.split(':')[0];C.kinds[kk]=(C.kinds[kk]||0)+1});if(i<5)C.list.push(L);CLRDROPS()}
          C.gold=gold-g0;C.per_chest=+(C.n/300).toFixed(3);out.chest=C;WV=null;UNSEED();return out}""")
        RES['wave']=W
        print('\n  XP per kill',W['xp'],W.get('xpdbg'))
        print('  real kills',json.dumps(W['kills']))
        print('  lootE x8000',json.dumps(W['loot']))
        print('  end chest',json.dumps({k:W['chest'][k] for k in ('n','per_chest','kinds','gold')}),W['chest']['list'][:2])
    print('\nRESULT',json.dumps(RES)[:3000])
    open(play.TMP+'/v92_%s.json'%TAG,'w').write(json.dumps(RES))
    if os.environ.get('REF'):
        B=json.load(open(os.environ['REF']))
        for k in ('hunt','stamp'):
            if k in RES and k in B:
                chk(k+': same damage as the old wolves (%s vs %s)'%(RES[k]['dmg'],B[k]['dmg']),abs(RES[k]['dmg']-B[k]['dmg'])<=max(2,.03*B[k]['dmg']),(RES[k],B[k]))
                chk(k+': same hit count and timing (%s vs %s)'%(RES[k]['hits'],B[k]['hits']),RES[k]['hits']==B[k]['hits'] and all(abs(a-b)<.1 for a,b in zip(RES[k]['t'],B[k]['t'])),(RES[k]['t'],B[k]['t']))
                chk(k+': ghost wolves, no box wolves',RES[k]['ghost']==(3 if k=='hunt' else 4) and RES[k]['box']==0,RES[k])
        if 'wave' in RES and 'wave' in B:
            a,b=RES['wave'],B['wave']
            for kk in ('normal','elite'):chk('xp: %s kill unchanged (%s vs %s)'%(kk,a['xp'][kk],b['xp'][kk]),a['xp'][kk]==b['xp'][kk])
            for kk in ('wave','wave_elite'):chk('xp: %s kill ×0.6 (%s vs %s → %.3f)'%(kk,a['xp'][kk],b['xp'][kk],a['xp'][kk]/b['xp'][kk]),abs(a['xp'][kk]/b['xp'][kk]-.6)<.06)
            r=a['loot']['wave']['drops']/b['loot']['wave']['drops'];chk('drops: wave lootE drops ×0.5 (%s vs %s → %.3f)'%(a['loot']['wave']['drops'],b['loot']['wave']['drops'],r),abs(r-.5)<.06)
            r2=a['loot']['normal']['drops']/b['loot']['normal']['drops'];chk('drops: normal lootE drops unchanged (%.3f)'%r2,abs(r2-1)<.06)
            r3=a['kills']['wave']['drops']/max(1,b['kills']['wave']['drops']);chk('drops: wave real kills ×0.5 (%s vs %s → %.3f)'%(a['kills']['wave']['drops'],b['kills']['wave']['drops'],r3),abs(r3-.5)<.15)
            ea,eb=a['loot']['wave']['kinds'].get('egg',0),b['loot']['wave']['kinds'].get('egg',0);print('  wave eggs (lootE x8000): before %s after %s'%(eb,ea))
            chk('chest: identical end-of-trial chest (count, kinds, items, gold)',a['chest']==b['chest'],(a['chest']['kinds'],b['chest']['kinds']))
    chk('no page errors',not errs,errs[:4])
play.run(s,w=900,hh=560)
print('FAILS',FAIL)
