# v96 pace: Sovereign health ×1.5, slower / more readable boss specials, staggered ranged openers.
#   PART=hp,fight,open      pick parts          DL=0,3   pick dens for the fight part      PHS=75  seconds per phase
#   SRC=<old build> TAG=before     writes out/v96_<TAG>.json
#   REF=out/v96_before.json        compares this run with it (tables + PASS/FAIL checks); CMP=out/v96_after.json skips the run
# The fight part runs a simulated Sovereign fight per den on a virtual clock: the hero (god mode) circles the boss at
# ~7 tiles, the boss health is pinned at 100% / 55% / 25% for PHS seconds each (phases I-III). Every Sovereign move the boss
# driver starts (top-level BMV call inside the boss AI or a den scheduler) and every red warning (tele / dqWarn, tagged
# with the move that made it) is recorded by wrappers installed here, so the same numbers come from an old build.
import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from playwright.sync_api import Page as _Pg
_go=_Pg.goto;_Pg.goto=lambda self,url,**k:_go(self,url,**dict(k,timeout=max(k.get('timeout',0),900000)))
TAG=os.environ.get('TAG','after');PART=os.environ.get('PART','hp,fight,open').split(',')
DL=[int(x) for x in os.environ.get('DL','0,1,2,3,4,5').split(',')];PHS=float(os.environ.get('PHS','75'))
REF=os.environ.get('REF');FAIL=[];RES={'tag':TAG}
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+(' · '+str(info)[:600] if info!='' else ''),flush=True)
    if not ok:FAIL.append(name)
JS=r"""()=>{
 window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;window.__pr=POST.render;window.__rr=ren.render.bind(ren);
 window.PL={mv:[],tl:[],ban:[],cur:null,dep:0,t:0,hook:null,st:[],ui:0};CHEAT.god=true;
 // setTimeout runs on the virtual clock too (boss sequences — rain, triple charges, quakes, banners — are chained with it)
 window.VQ=[];window.VQn=0;window.__sto=window.setTimeout;window.__cto=window.clearTimeout;
 window.setTimeout=function(f,ms){if(typeof f!='function')return __sto.apply(window,arguments);const a=[].slice.call(arguments,2),id=1e7+(++VQn);VQ.push({t:PL.t+(+ms||0)/1000,f,a,id});return id};
 window.clearTimeout=function(id){const i=VQ.findIndex(q=>q.id===id);if(i>=0)VQ.splice(i,1);else __cto(id)};
 window.VQRUN=()=>{for(let g=0;g<50;g++){const i=VQ.findIndex(q=>q.t<=PL.t+1e-9);if(i<0)break;const q=VQ.splice(i,1)[0];try{q.f.apply(window,q.a)}catch(err){window.LERR=window.LERR||[];if(LERR.length<6)LERR.push('timeout '+String(err&&err.stack||err).slice(0,300))}}};
 // every Sovereign move started by the boss driver (inside the boss AI or a den scheduler; not nested, not replayed)
 Object.keys(BMV).forEach(k=>{const f=BMV[k];if(typeof f!='function')return;BMV[k]=function(e,A,en){const top=typeof MP!='undefined'&&MP.inAI&&!PL.dep;
   const c0=PL.cur;if(top){PL.mv.push({k,t:+PL.t.toFixed(3),i:A?A.i:-1});PL.cur=k}PL.dep++;try{return f.apply(this,arguments)}finally{PL.dep--;if(top)PL.cur=c0}}});
 {const f=tele;tele=function(pos,r,delay,fn,line){PL.tl.push({k:PL.cur,T:+(+delay).toFixed(3),t:+PL.t.toFixed(3)});return f.apply(this,arguments)}}
 {const f=dqWarn;dqWarn=function(S,o){PL.tl.push({k:PL.cur,T:+(+o.t).toFixed(3),t:+PL.t.toFixed(3),dq:1});return f.apply(this,arguments)}}
 {const f=banner;banner=function(a){PL.ban.push(String(a));return f.apply(this,arguments)}}
 {const f=mStart;mStart=function(e,tg,n){const a0=e&&e.atk;const r=f.apply(this,arguments);if(e&&e.atk&&e.atk!==a0&&e.atk.n===n)PL.st.push({t:+PL.t.toFixed(3),id:e._tid,n,r:!!(KQR[n]||n=='rainfire')});return r}}
 window.STEP=(sec)=>{const n=Math.max(1,Math.round(sec/.016));ren.render=()=>{};POST.render=()=>{};for(let i=0;i<n;i++){VT+=16;PL.t+=.016;hero.hp=heroMax();
   try{loop(VT)}catch(err){window.LERR=window.LERR||[];if(LERR.length<6)LERR.push(String(err&&err.stack||err).slice(0,400))}VQRUN();if(uiOpen())PL.ui++;if(PL.hook)try{PL.hook()}catch(err){}}
   ren.render=__rr;POST.render=__pr;return PL.t};
 window.ENT=i=>[AR.ent,HY.ent,ARN[2].dn&&ARN[2].dn.ea,ARN[3].dn&&ARN[3].dn.ea,ARN[4].dqA,ARN[5].dqA][i];
 return 1}"""
FIGHT=r"""(a)=>{const [i,PHS]=a,A=ARN[i],EA=ENT(i);enemies.slice().forEach(e=>{if(!e.boss&&!e.dprop)removeE(e)});party.forEach(c=>{if(c)c.h=0});
  toPos(A.cx+Math.cos(EA)*(ARENA_R-4),A.cz+Math.sin(EA)*(ARENA_R-4));STEP(.5);const BE=bossEnt(i);if(!AF||!BE)return {err:'no fight',af:!!AF};
  const out={i,hpMax:M(BE.c),ph:[]};PL.mv.length=0;PL.tl.length=0;PL.ban.length=0;let ang=EA,frac=1;
  PL.hook=()=>{if(!BE.dead)BE.c.h=Math.max(1,M(BE.c)*frac);ang+=.016*.32;const tx=A.cx+Math.cos(ang)*7,tz=A.cz+Math.sin(ang)*7,dx=tx-pl.position.x,dz=tz-pl.position.z,l=Math.hypot(dx,dz);
    if(l>.2)walk(pl,dx/l*4.2*.016,dz/l*4.2*.016);party.forEach(c=>{if(c)c.h=0})};
  const t0=PL.t;
  [1,.55,.25].forEach((f,q)=>{frac=f;const a0=PL.t;STEP(PHS);out.ph.push({a:+(a0-t0).toFixed(2),b:+(PL.t-t0).toFixed(2),bph:BE.bs.ph})});
  PL.hook=null;
  // the top boss bar shows the (bigger) health correctly
  BE.c.h=M(BE.c)*.5;bossHudX();const bw=parseFloat($('bossB').style.width);
  out.bar=bw;out.mv=PL.mv.filter(m=>m.i===i).map(m=>[m.k,+(m.t-t0).toFixed(2)]);out.tl=PL.tl.map(w=>[w.k,w.T,+(w.t-t0).toFixed(2)]);out.ban=PL.ban.slice();
  out.ui=PL.ui;out.pace=typeof PACE!='undefined'?PACE.st:null;out.ok=!!AF;
  arenaFail();const sg=DSIGN[i];toPos(sg.x,sg.z);STEP(1);if(AF){arenaFail();toPos(sg.x,sg.z);STEP(1)}out.left=!AF;enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});return out}"""
OPEN=r"""(trials)=>{const keys=Object.keys(MSET).filter(k=>EN[k]&&!/^boss/.test(k)&&(MSET[k]||[]).some(n=>KQR[n]||n=='rainfire'));
  const pick=['shaman','cultist','bonearcher','nagaa','spitter','trollsh','vampm','revenant','nagas','wraith'].filter(k=>keys.includes(k)).concat(keys).filter((k,j,a)=>a.indexOf(k)===j).slice(0,6);
  const res=[];
  for(let tr=0;tr<trials;tr++){enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});party.forEach(c=>{if(c)c.h=0});STEP(.3);
    const P=pl.position.clone(),L=[];pick.forEach((k,j)=>{const a=j/pick.length*6.283+tr*.4,x=P.x+Math.cos(a)*6.5,z=P.z+Math.sin(a)*6.5;const e=spawnEnemy(k,x,z,Math.max(1,hero.lvl),{});if(e){e.agg=0;e.cd=1;e._tid=j;L.push(e)}});
    STEP(1.2);// idle a moment (their cooldowns run out, as in the world)
    L.forEach(e=>{e.agg=1;e.wt=0});PL.st.length=0;const t0=PL.t;PL.hook=()=>{party.forEach(c=>{if(c)c.h=0})};STEP(4);PL.hook=null;
    const S=PL.st.filter(s=>s.r&&s.id!=null).map(s=>({t:+(s.t-t0).toFixed(3),id:s.id,n:s.n}));
    const first={};S.forEach(s=>{if(first[s.id]==null)first[s.id]=s.t});const fs=Object.values(first);
    let win=0;S.forEach(s=>{const n=S.filter(q=>q.t>=s.t&&q.t<s.t+.6).length;win=Math.max(win,n)});
    res.push({n1:S.filter(s=>s.t<1).length,n06:S.filter(s=>s.t<.6).length,win,firsts:fs.map(v=>+v.toFixed(2)).sort((a,b)=>a-b),spread:fs.length?+(Math.max(...fs)-Math.min(...fs)).toFixed(2):0,total:S.length,mobs:L.length,dbg:L.map(e=>[e.agg,+(e.cd||0).toFixed(1),+d2(e.m.position,pl.position).toFixed(1),!!e.dead,enemies.includes(e)])})}
  enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});return {keys:pick,res}}"""
def s(pg):
    pg.set_default_timeout(900000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev(JS)
    if 'hp' in PART:
        RES['hp']=ev("()=>{STEP(.2);return BOSSES.map((b,i)=>{const e=bossEnt(i);return e?{n:b.name,lv:e.c.l,hp:M(e.c),h:e.c.h}:null})}")
        print('hp =>',json.dumps(RES['hp']),flush=True)
    if 'fight' in PART:
        RES['fight']={}
        for i in DL:
            # enterMap finishes on timers/tweens, which run on the virtual clock here: step until the hero is in zone i
            ev("(i)=>{enterMap(i)}",i);pg.wait_for_timeout(1500)
            print('enter%d =>'%i,ev("(i)=>{let n=0;while(n++<40&&(regionAt(Math.round(pl.position.x),Math.round(pl.position.z))!==i||AF)){STEP(.5)}STEP(1);return [n,regionAt(Math.round(pl.position.x),Math.round(pl.position.z)),!!AF]}",i),flush=True)
            r=ev(FIGHT,[i,PHS]);RES['fight'][str(i)]=r
            print('fight%d =>'%i,json.dumps({k:r.get(k) for k in ('hpMax','ph','bar','ok','pace','err','ui')}),'moves',len(r.get('mv',[])),'warnings',len(r.get('tl',[])),flush=True)
    if 'open' in PART:
        ev("()=>{enterMap(0)}");pg.wait_for_timeout(1500);ev("()=>{let n=0;while(n++<40&&regionAt(Math.round(pl.position.x),Math.round(pl.position.z))!==0)STEP(.5);const p=PMAP[0].en;toPos(p[0],p[1]);STEP(.5)}")
        RES['open']=ev(OPEN,int(os.environ.get('TRIALS','12')))
        print('open =>',json.dumps(RES['open'])[:1500],flush=True)
    RES['errs']=errs[:5];RES['lerr']=ev("()=>window.LERR||[]")
    print('ERRS',errs[:5],'LOOPERR',RES['lerr'],flush=True)
if os.environ.get('CMP'):RES=json.load(open(os.environ['CMP']))   # CMP=out/v96_after.json: only print the comparison
else:
    play.run(s,w=900,hh=560)
    json.dump(RES,open(play.TMP+'/v96_%s.json'%TAG,'w'))
# ---------------- analysis ----------------
BAS={'pbasic','pbolt'}
KEEP={'corpsecall','whiteout','bloodmoon','rottide','chalices','rite','riteend'}   # wind-ups deliberately unchanged (already long)
def isDen(k):return k and (k.startswith('arEye') or k.startswith('hyNeck'))
def stats(F):
    """per phase: specials (count, mean start-to-start interval), wind-ups of their warnings; basics; den events"""
    out={'ph':[]};mv=F.get('mv',[]);tl=F.get('tl',[])
    for q,P in enumerate(F.get('ph',[])):
        a,b=P['a'],P['b'];sp=[t for k,t in mv if a<=t<b and k not in BAS and not isDen(k)]
        iv=(sp[-1]-sp[0])/(len(sp)-1) if len(sp)>1 else None
        out['ph'].append({'n':len(sp),'iv':iv,'basic':len([1 for k,t in mv if a<=t<b and k in BAS]),'den':len([1 for k,t in mv if a<=t<b and isDen(k)])})
    sp=[t for k,t in mv if k not in BAS and not isDen(k)]
    ivs=[p['iv'] for p in out['ph'] if p['iv']]
    out['iv']=sum(ivs)/len(ivs) if ivs else None
    W=[T for k,T,t in tl if k and k not in BAS and not isDen(k) and k!='ult']       # warnings made by a special as it is cast
    O=[T for k,T,t in tl if not k]                                                  # warnings made later (sequences, den timers, neck attacks…)
    out['wu']=(sum(W)/len(W),min(W)) if W else (None,None)
    out['wo']=(sum(O)/len(O),min(O)) if O else (None,None)
    out['moves']=sorted(set(k for k,t in mv if k not in BAS and not isDen(k)))
    pm={}
    for k,T,t in tl:
        if k and k not in BAS and not isDen(k) and k!='ult':pm.setdefault(k,[]).append(T)
    out['pm']={k:sum(v)/len(v) for k,v in pm.items()}
    out['ban']=F.get('ban',[])
    return out
def f2(v,n=2):return '—' if v is None else ('%.'+str(n)+'f')%v
if 'fight' in RES:
    for i,F in RES['fight'].items():
        if F.get('err'):chk('fight %s runs'%i,False,F);continue
        S=stats(F);print('boss',i,'specials/phase',[p['n'] for p in S['ph']],'interval',[f2(p['iv']) for p in S['ph']],'basics',[p['basic'] for p in S['ph']],'wind-up mean/min',f2(S['wu'][0]),f2(S['wu'][1]),'later warnings',f2(S['wo'][0]),f2(S['wo'][1]))
        print('   moves',S['moves']);print('   banners',S['ban'])
if REF:
    R0=json.load(open(REF));NAMES=["Argus","Crest Hydra","Rime Wraith","Ssith'ra","Bloated One","Vaelric"]
    if 'hp' in RES and 'hp' in R0:
        print('\n| Sovereign | Lv | max HP before | after | × |\n|---|---|---|---|---|')
        for a,b in zip(R0['hp'],RES['hp']):
            print('| %s | %d | %d | %d | %.3f |'%(b['n'],b['lv'],a['hp'],b['hp'],b['hp']/a['hp']))
            chk('hp ×1.5 %s'%b['n'],abs(b['hp']/a['hp']-1.5)<.01 and b['h']==b['hp'],(a['hp'],b['hp'],b['h']))
    if 'fight' in RES and 'fight' in R0:
        print('\n| Sovereign | specials/min before → after | avg time between specials (s) before → after (×) | phase I / II / III after | wind-up mean (min) before → after (s) | later warnings mean (min) before → after | basics/min after |\n|---|---|---|---|---|---|---|')
        for i,F in RES['fight'].items():
            if i not in R0['fight'] or F.get('err'):continue
            A=stats(R0['fight'][i]);B=stats(F);dur=sum(p['b']-p['a'] for p in F['ph'])/60
            nA=sum(p['n'] for p in A['ph']);nB=sum(p['n'] for p in B['ph']);bas=sum(p['basic'] for p in B['ph'])
            x=B['iv']/A['iv'] if A['iv'] and B['iv'] else None
            print('| %s | %.1f → %.1f | %s → %s (×%s) | %s | %s (%s) → %s (%s) | %s (%s) → %s (%s) | %.1f |'%(NAMES[int(i)],nA/dur,nB/dur,f2(A['iv']),f2(B['iv']),f2(x),' / '.join(f2(p['iv'],1) for p in B['ph']),
                f2(A['wu'][0]),f2(A['wu'][1]),f2(B['wu'][0]),f2(B['wu'][1]),f2(A['wo'][0]),f2(A['wo'][1]),f2(B['wo'][0]),f2(B['wo'][1]),bas/dur))
            chk('interval ×≈2 boss %s'%i,x is not None and 1.6<=x<=2.6,f2(x))
            com=[k for k in A['pm'] if k in B['pm'] and k not in KEEP];rr=[B['pm'][k]/A['pm'][k] for k in com];wr=sum(rr)/len(rr) if rr else None
            print('   wind-up per move (s, before → after):',', '.join('%s %.2f→%.2f'%(k,A['pm'][k],B['pm'][k]) for k in com))
            chk('wind-ups ×≈1.5 per move boss %s'%i,wr is not None and wr>=1.4,f2(wr))
            chk('dodgeable wind-ups ≥0.9 s boss %s'%i,B['wu'][1] is not None and B['wu'][1]>=.9,f2(B['wu'][1]))
            chk('keeps pressure between specials boss %s'%i,bas/dur>=6,'%.1f basics/min'%(bas/dur))
            chk('phase III reached boss %s'%i,F['ph'][-1]['bph']==3,F['ph'][-1])
            chk('boss bar shows health boss %s'%i,abs(F['bar']-50)<1,F['bar'])
            sig={'0':'LIGHTS OUT','1':'TIDAL SURGE','2':'WHITEOUT','3':'SANDSTORM','4':'THE PIT FLOODS','5':'THE CRIMSON RITE'}[i]
            chk('phase mechanic %s boss %s'%(sig,i),any(sig in b for b in B['ban']),B['ban'][:12])
            gone=set(A['moves'])-set(B['moves']);chk('same move set boss %s'%i,len(gone)<=2,sorted(gone))
    if 'open' in RES and 'open' in R0:
        def agg(O):
            r=O['res'];n=len(r);return {k:sum(x[k] for x in r)/n for k in ('n06','n1','win','spread','total')}
        a=agg(R0['open']);b=agg(RES['open'])
        print('\nPack of %d ranged/caster mobs (%s) aggroing on the same frame, %d trials:'%(RES['open']['res'][0]['mobs'],', '.join(RES['open']['keys']),len(RES['open']['res'])))
        print('| | before | after |\n|---|---|---|')
        for k,lab in (('n06','ranged attacks started in the first 0.6 s'),('n1','… in the first 1 s'),('win','most in any 0.6 s window (first 4 s)'),('spread','spread of first shots (s)'),('total','ranged attacks in 4 s')):
            print('| %s | %.2f | %.2f |'%(lab,a[k],b[k]))
        print('first shots before',[x['firsts'] for x in R0['open']['res'][:3]],'\nfirst shots after ',[x['firsts'] for x in RES['open']['res'][:3]])
        chk('opener: ≤2 ranged attacks in the first second',b['n1']<=2.0,b['n1'])
        chk('token: ≤2 per 0.6 s window',max(x['win'] for x in RES['open']['res'])<=2,[x['win'] for x in RES['open']['res']])
        chk('first shots spread ≥1.5 s',b['spread']>=1.5,b['spread'])
chk('no page errors',not RES.get('errs') and not RES.get('lerr'),(RES.get('errs'),RES.get('lerr')))
print('CHECKS', 'OK' if not FAIL else 'FAILED: '+', '.join(FAIL))
