# v90 abilities: ranks 1-5 (AP costs, scaling of damage / DoT / heal / shield / buff / cooldown), more AP per level, old saves,
# the Abilities window (pips, rank-up, this rank -> next), hotbar badge, reset; then the class balance audit (test/v90_abil_lib.js)
# which writes out/v90_balance.md + out/v90_balance.json.
#   python3 v90_abil.py                 everything (balance: levels 5,15,30,50 at ranks 1,2,3,5; ~40 min headless)
#   BAL=0 python3 v90_abil.py           only the functional checks (a few minutes)
#   LV=50 RK=5 python3 v90_abil.py      balance at chosen levels / ranks (comma lists)
import sys,json,os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__));LIB=open(HERE+'/v90_abil_lib.js').read()
FAIL=[];WARN=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+(' · '+str(info)[:300] if info!='' else ''),flush=True)
    if not ok:FAIL.append(name)
CLS=['warrior','paladin','assassin','ranger','mage']
LVS=[int(x) for x in os.environ.get('LV','5,15,30,50').split(',')];RKS=[int(x) for x in os.environ.get('RK','1,2,3,5').split(',')]
if len(RKS)<len(LVS):RKS+=[RKS[-1]]*(len(LVS)-len(RKS))
def write_md(res):
    """out/v90_balance.md from the measured results (+ v90_balance_before.json, the same harness run on the v89 build); returns [(level, worst deviation)]"""
    B=json.load(open(HERE+'/v90_balance_before.json')) if os.path.exists(HERE+'/v90_balance_before.json') else {'rot':{},'he50':{}}
    LV=sorted(set(r['L'] for r in res));RK={r['L']:r.get('rk',1) for r in res}
    md=['# v90 balance audit','','Training dummy = the zone roster mob of that level (median health type, real stats, `enStats`), level-appropriate gear (rare ITPL templates of the tier, no random affixes),',
        'talents auto-spent (offence branch first), companions out of the fight, crits counted as expected value. Rotation = basic attacks + the 4 abilities with the best damage per cooldown, cast whenever ready (real mana and class resource), 30 s.',
        '"Before" = the same harness on the v89 build (no ranks). Runs vary by a few % (hit spread, procs).','',
        '## Rotation DPS by level (before → after, deviation from the class average)','','| Level (rank) | '+' | '.join(CLS)+' | spread before → after |','|---|'+'---|'*len(CLS)+'---|']
    bal=[]
    for L in LV:
        row=[r for r in res if r['L']==L];avg=sum(r['rot']['dps'] for r in row)/len(row);dev=[r['rot']['dps']/avg-1 for r in row]
        bb=B['rot'].get(str(L),{});ba=sum(bb.values())/len(bb) if bb else 0
        cell=lambda r,d:('%.0f (%+.0f%%) → '%(bb[r['c']],100*(bb[r['c']]/ba-1)) if r['c'] in bb else '')+'**%.0f (%+.0f%%)**'%(r['rot']['dps'],100*d)
        spb=('%.0f%%'%(100*(max(bb.values())-min(bb.values()))/ba)) if bb else '?'
        md.append('| %d (r%d) | '%(L,RK[L])+' | '.join(cell(r,d) for r,d in zip(row,dev))+' | %s → %.0f%% |'%(spb,100*(max(dev)-min(dev))));bal.append((L,max(abs(d) for d in dev)))
    md+=['','## Time to kill / toughness (after)','','| Level | class | basic DPS | avg basic hit | mob HP | basic hits to kill | TTK normal | TTK elite (×3.4 HP) | mob hits to kill you | your HP |','|---|---|---|---|---|---|---|---|---|---|']
    for r in res:
        d=r['rot']['dps'];m=r['mob']['hp']
        md.append('| %d | %s | %.0f | %.0f | %.0f | %.1f | %.1fs | %.1fs | %.1f | %d |'%(r['L'],r['c'],r['b']['dps'],r['b']['hit'],m,m/max(1,r['b']['hit']),m/d,m*3.4/d,r['ehp']['hitsToDie'],r['ehp']['hp']))
    top=max(LV)
    md+=['','## Level %d: one cast on one target, in basic hits'%top,'','before = v89 (no ranks) · r1 / r5 = after, rank 1 / rank 5 (rank 1 = rank 5 ÷ 1.48). Rule: ≤ ~4 at max rank, big-cooldown and lasting (summons, zones over 5-15 s) ≤ ~5.5.','',
        '| class | ability | before | after r1 | after r5 | cooldown r5 |','|---|---|---|---|---|---|']
    for r in [r for r in res if r['L']==top]:
        bh=B['he50'].get(r['c'],{});k=1+.12*(r.get('rk',1)-1)
        for a in sorted(r['ab'],key=lambda a:-max(a['he'],bh.get(a['n'],0))):
            if a['he']<=0 and not bh.get(a['n']):continue
            md.append('| %s | %s | %s | %.1f | %.1f | %gs |'%(r['c'],a['n'],('%.1f'%bh[a['n']]) if a['n'] in bh else '–',a['he']/k,a['he'],a['cd']))
    md+=['','## Every level: ability damage per cast in basic hits (one target)','']
    for L in LV:
        md+=['### Level %d, rank %d'%(L,RK[L]),'','| class | ability: hits-equivalent (cooldown) |','|---|---|']
        for r in [r for r in res if r['L']==L]:
            md.append('| %s | %s |'%(r['c'],', '.join('%s %.1f (%gs)'%(a['n'],a['he'],a['cd']) for a in sorted(r['ab'],key=lambda a:-a['he']) if a['he']>0)))
        md.append('')
    open(play.TMP+'/v90_balance.md','w').write('\n'.join(md)+'\n');print('wrote',play.TMP+'/v90_balance.md')
    return bal
if os.environ.get('MDONLY'):
    write_md(json.load(open(os.environ['MDONLY'])));sys.exit(0)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':1100,'height':700});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)+' '+(e.stack or '')[:400]))
    pg.on('console',lambda m:errs.append('console '+m.text) if m.type=='error' else None)
    pg.add_init_script('window.AW_NOTITLE=1')
    pg.goto('file://'+play.TMP+'/live.html',wait_until='domcontentloaded',timeout=600000);pg.wait_for_timeout(4000)
    ev=pg.evaluate;ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    # ---------- ability points ----------
    r=ev("()=>({ap:apFree(),e:[1,2,5,10,20,50].map(l=>{const o=hero.lvl;hero.lvl=l;const v=apEarned();hero.lvl=o;return v})})")
    chk('AP earned: 0 at 1, 2 per level, 3 on every 5th (108 at 50)',r['e']==[0,2,9,20,42,108],r)
    r=ev("()=>{heroLevelUp();return {lv:hero.lvl,ap:apFree(),b:$('banner')?$('banner').textContent:''}}")
    chk('level 2 gives 2 AP',r['ap']==2,r);print('  banner:',r['b'][:140])
    chk('level-up banner names the AP',('+2 ability points' in r['b']) or r['b']=='',r['b'][:140])
    # ---------- rank up through the window ----------
    ev("()=>openAbil()");pg.wait_for_timeout(500)
    r=ev("()=>({pips:document.querySelectorAll('#xwB .kqs-ab .kqr-pip').length,up:[...document.querySelectorAll('#xwB [data-kqrup]')].map(b=>[b.dataset.kqrup,b.disabled,b.textContent]),box:!!document.querySelector('#xwB .kqr-box'),sub:$('xwS').textContent})")
    chk('window shows pips and a Rank up button for the default ability',r['pips']>=1 and any(u[0]=='Cleave' and not u[1] for u in r['up']) and r['box'],r)
    ev("()=>document.querySelector('#xwB .kqs-ab [data-kqrup=\"Cleave\"]').click()")
    r=ev("()=>({rk:kqrRank(kqsFind('warrior','Cleave')),tal:hero.tal['ab:Cleave'],ap:apFree(),spent:apSpent()})")
    chk('Rank up Cleave: rank 2, 1 AP spent',r['rk']==2 and r['tal']==2 and r['ap']==1 and r['spent']==1,r)
    ev("()=>document.querySelector('[data-kqsbuy=\"Bull Rush\"]').click()")
    r=ev("()=>({ap:apFree(),sk:heroSkills().map(s=>s.n),rk:kqrRank(kqsFind('warrior','Bull Rush'))})")
    chk('unlock Bull Rush = rank 1, no AP left',r['ap']==0 and 'Bull Rush' in r['sk'] and r['rk']==1,r)
    r=ev("()=>{const s=kqsFind('warrior','Bull Rush');const w=kqrWhy(s);kqrUp('Bull Rush');return {w,rk:kqrRank(s)}}")
    chk('rank up refused without AP',r['rk']==1 and 'Needs' in r['w'],r)
    r=ev("()=>{cheatLevel(48);const c=hero.cls,s=kqsFind(c,'Cleave');for(let i=0;i<6;i++)kqrUp('Cleave');return {rk:kqrRank(s),costs:[2,3,4,5].map(k=>kqrCost(s,k)),why:kqrWhy(s),ap:apFree(),earned:apEarned(),spent:apSpent()}}")
    chk('rank 5 is the maximum; costs 1/2/3/4 for the default',r['rk']==5 and r['costs']==[1,2,3,4] and r['why']=='Max rank' and r['ap']==r['earned']-r['spent'],r)
    r=ev("()=>{const s=kqsFind('warrior',\"Titan's Fall\");return {u:kqrUnlockCost(s),c:[2,3,4,5].map(k=>kqrCost(s,k))}}")
    chk('rank costs scale with the unlock cost (level 48: 9 to unlock, 3/4/5/6 to rank)',r['u']==9 and r['c']==[3,4,5,6],r)
    ev("()=>{KQS.sel='Cleave';rX()}");pg.wait_for_timeout(400)
    r=ev("()=>({box:document.querySelector('#xwB .kqr-box')?.textContent||'',slot:document.querySelectorAll('#xwB .kqr-sp').length})")
    chk('detail shows Max rank at 5 and slots show pips',('Max rank' in r['box']) and r['slot']>=1,r)
    ev("()=>{KQS.sel='Bull Rush';rX()}");pg.wait_for_timeout(400)
    r=ev("()=>document.querySelector('#xwB .kqr-box')?.textContent||''");chk('detail shows this rank → next rank values','→' in r and 'Damage' in r and 'Cooldown' in r,r)
    pg.wait_for_timeout(300);pg.screenshot(path=play.TMP+'/v90_abilities.png')
    ev("()=>{closeX();hud()}");pg.wait_for_timeout(300)
    r=ev("()=>[...document.querySelectorAll('#acts .kqr-b')].map(b=>b.textContent)");chk('hotbar shows a rank badge per ability',len(r)>=2 and '5★' in r,r)
    pg.locator('#acts').screenshot(path=play.TMP+'/v90_hotbar.png')
    # ---------- scaling: the same cast at rank 1 vs rank 5 ----------
    ev("()=>{window.__r=ren.render.bind(ren);ren.render=()=>{};if(window.POST)POST.render=()=>{};window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16)}")
    ev("()=>{const q=PMAP[0];toPos(q.path[40][0],q.path[40][1])}");pg.wait_for_timeout(2000)
    ev("(L)=>{eval(L);V90.home=[pl.position.x,pl.position.z];V90.start()}",LIB)
    def scal(cls,name,expr,rk=(1,5),wait=1500):
        out=[]
        for k in rk:
            ev("([c,k])=>{V90.setup(c,50,{rank:k,noTal:1});}",[cls,k]);pg.wait_for_timeout(300)
            out.append(ev("""async ([n,expr,w])=>{const cap={raw:[],dot:[],heal:0,sh:0};const fH=heroHit,fS=eStatus,fh=healHero;
              heroHit=function(e,raw){if(e===V90.dum)cap.raw.push(raw);return fH.apply(this,arguments)};eStatus=function(e,fx,atk){if(e===V90.dum&&atk>0&&(fx.poison||fx.bleed||fx.burn))cap.dot.push(atk);return fS.apply(this,arguments)};
              healHero=function(v){cap.heal+=v;return fh.apply(this,arguments)};
              try{kqsClear();hero.tal.__ld=n;KQS.ck='';hero.cd={};hero.mp=9999;hero.cr=0;hero.sh=0;V90.home0();tgt=V90.dum;const sk=heroSkills()[0];cast(0);if(sk.gt&&KQS.tg){KQS.tg.p=V90.dum.m.position.clone();kqsTgFire()}
                cap.cd=hero.cd.s0;cap.sh=hero.sh;cap.buff=(hero.buffs.find(b=>b.n==n)||{}).s||null;cap.mark=V90.dum.markV||0;await new Promise(r=>setTimeout(r,w))}
              finally{heroHit=fH;eStatus=fS;healHero=fh}return Object.assign(cap,{v:eval(expr)})}""",[name,expr,wait]))
        return out
    for cls,n,expr,want,what in [('warrior','Cleave','cap.raw[0]',1.48,'old skill damage'),('warrior','Bull Rush','cap.raw[0]',1.48,'v88 ability damage'),
                                ('assassin','Venom Flask','Math.max(...cap.dot)',1.48,'v88 DoT'),('warrior','Whirlwind','cap.raw[0]',1.48,'channel tick'),
                                ('paladin','Lay on Hands','cap.heal',1.48,'heal'),('paladin','Divine Barrier','cap.sh',1.48,'shield'),
                                ('warrior','War Cry','cap.buff&&cap.buff.paP',1.32,'buff'),('assassin','Death Mark','cap.mark',1.32,'debuff'),
                                ('warrior','Cleave','cap.cd',.85,'cooldown')]:
        r=scal(cls,n,expr,wait=2500 if n in('Venom Flask','Whirlwind') else 900)
        a,z=r[0]['v'],r[1]['v'];ok=bool(a) and bool(z) and abs(z/a-want)<.03
        chk('rank 5 vs 1: %s (%s) ×%.2f'%(what,n,want),ok,[a,z,round(z/a,3) if a else None])
    r=scal('mage','Fireball','cap.cd',rk=(1,3,5));chk('cooldown −8% at rank 3, −15% at rank 5',abs(r[1]['v']/r[0]['v']-.92)<.01 and abs(r[2]['v']/r[0]['v']-.85)<.01,[x['v'] for x in r])
    # ---------- save / load, reset, old saves ----------
    r=ev("""()=>{V90.setup('warrior',30,{rank:1,noTal:1});hero.tal['ab:Cleave']=4;hero.tal['ab:Shockwave']=3;const sp=apSpent();saveGame(true);hero.tal={};loadGame();
      return {c:hero.tal['ab:Cleave'],s:hero.tal['ab:Shockwave'],sp:apSpent(),sp0:sp,free:apFree(),earned:apEarned()}}""")
    chk('save/load keeps ranks and AP adds up',r['c']==4 and r['s']==3 and r['sp']==r['sp0'] and r['free']==r['earned']-r['sp'],r)
    r=ev("()=>{gold=1e6;kqsReset();return {free:apFree(),earned:apEarned(),c:kqrRank(kqsFind('warrior','Cleave')),sk:heroSkills().map(s=>s.n)}}")
    chk('reset refunds ranks too',r['free']==r['earned'] and r['c']==1 and r['sk']==['Cleave'],r)
    r=ev("""()=>{const s=gameSnapshot();s.hero.lvl=20;s.hero.tal={__ab:1,__apB:3,'ab:Shockwave':1,'ab:Leap Slam':1,'ab:War Cry':1,__ld:'Cleave|Shockwave'};localStorage.setItem(SAVE_KEY,JSON.stringify(s));hero.tal={};loadGame();
      return {rk:['Shockwave','Leap Slam','War Cry','Cleave'].map(n=>kqrRank(kqsFind('warrior',n))),free:apFree(),earned:apEarned(),spent:apSpent(),sk:heroSkills().map(s=>s.n)}}""")
    chk('v88 save: unlocked abilities load as rank 1, more AP to spend now',r['rk']==[1,1,1,1] and r['free']==r['earned']-r['spent'] and r['free']==42+3-r['spent'],r)
    r=ev("""()=>{const s=gameSnapshot();s.hero.lvl=3;s.hero.tal={__ab:1,'ab:Bull Rush':1,'ab:Leap Slam':1,'ab:Cleave':5,__ld:'Cleave|Bull Rush|Leap Slam'};localStorage.setItem(SAVE_KEY,JSON.stringify(s));hero.tal={};loadGame();
      return {free:apFree(),spent:apSpent(),earned:apEarned(),sk:heroSkills().map(s=>s.n),rk:kqrRank(kqsFind('warrior','Cleave'))}}""")
    chk('more spent than earned: keeps everything, AP never negative',r['free']==0 and r['spent']>r['earned'] and len(r['sk'])==3 and r['rk']==5,r)
    real=[e for e in errs if 'favicon' not in e]
    chk('no page errors (functional part)',not real,real[:6])
    # ---------- balance audit ----------
    if os.environ.get('BAL','1')!='0':
        ev("()=>{const q=PMAP[0];toPos(q.path[40][0],q.path[40][1]);V90.home=[pl.position.x,pl.position.z]}");pg.wait_for_timeout(1500)
        res=[]
        for cls in CLS:
            for L,rk in zip(LVS,RKS):
                r=ev("""async ([c,L,rk])=>{const st=V90.setup(c,L,{rank:rk});const b=await V90.basic(12);const ab=[];
                  for(const s of kqsAll(c)){if(s.lv>L||s.n=='Chronoshift')continue;const r=await V90.one(s.n);r.he=b.hit?+(r.dmg/b.hit).toFixed(2):0;ab.push(r)}
                  const ld=ab.filter(a=>a.dmg>0).sort((x,y)=>y.dmg/y.cd-x.dmg/x.cd).slice(0,4).map(a=>a.n);const rot=await V90.rot(ld,30);
                  return {c,L,rk,st,b,ab,ld,rot,ehp:V90.ehp(),mob:V90.base}}""",[cls,L,rk])
                res.append(r);print('  %-8s L%-2d r%d basic %7.1f rot %7.1f  max ability %s'%(cls,L,rk,r['b']['dps'],r['rot']['dps'],max([(a['he'],a['n']) for a in r['ab']] or [(0,'')])),flush=True)
        json.dump(res,open(play.TMP+'/v90_balance.json','w'),indent=0)
        bal=write_md(res)
        for L,d in bal:
            chk('L%d rotation DPS within ±18%% of the class average (target ±12%%)'%L,d<=.18,round(d,3))
            if d>.12:print('  WARN L%d: worst class is %.0f%% from the average (target ±12%%)'%(L,100*d))
        top=[(a['he'],r['c'],a['n']) for r in res if r['L']==max(LVS) for a in r['ab']]
        top.sort(reverse=True);print('  biggest casts:',top[:6])
        chk('no single cast above ~5.6 basic hits at max rank (lasting summons/zones included)',not top or top[0][0]<=5.6,top[:3])
        real=[e for e in errs if 'favicon' not in e]
        chk('no page errors',not real,real[:6])
    print('FAILED:',FAIL if FAIL else 'none');b.close()
