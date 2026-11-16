# v239 (owner, Nov 16 2026: "Make each tier gain the same amount per level"): companions of every tier gain the same per level
# (the tier still raises the starting stats); enemies keep their own fixed stats; a companion from an older save with more health
# than its new maximum is trimmed to it after loading.   python3 v239_tier_growth.py
import play,json
fails=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c:fails.append(m)
JS=r"""async()=>{const o={};const byT={};Object.keys(SP2).forEach(n=>{const t=tierSp(n);if(!byT[t])byT[t]=n});o.sp=byT;
 const mk=(n,l)=>{const c=mkC(n,l,0,'',{hp:1,a:1,d:1,pa:1,ma:1,pd:1,md:1});c.mods=[];c.tr='';return c};
 o.grow={};o.base={};Object.keys(byT).forEach(t=>{const n=byT[t],F=FAMD[famOf(n)],a=mk(n,1),b=mk(n,40);
   o.grow[t]=IVK.map(k=>+((cStat(b,k)-cStat(a,k))/(F.w[k]*ivOf(b,k))).toFixed(2));o.base[t]=IVK.map(k=>+(cStat(a,k)/(F.w[k]*ivOf(a,k))).toFixed(2))});
 o.want={grow:IVK.map(k=>+(CGS[k]*39).toFixed(2)),base:Object.fromEntries(Object.keys(byT).map(t=>[t,IVK.map(k=>+(CBS[k]*(1+.55*(t-1))).toFixed(2))]))};
 // enemies: fixed stats, not this formula
 const P=pl.position,e=spawnEnemy(Object.values(BIOEN).flat()[0],P.x+30,P.z+30,40,{});o.enemySt=!!(e&&e.c.st);if(e)removeE(e);
return o}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r))
    # an older save: a companion carrying more health than its new maximum (its maximum was larger before v239)
    pg.evaluate("()=>{const c=mkC(Object.keys(SP2).find(n=>tierSp(n)===5),40,0,'',{hp:1,a:1,d:1,pa:1,ma:1,pd:1,md:1});party[0]=c;c.h=M(c)*2;saveGame(true)}")
    pg.reload(wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(3000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.wait_for_timeout(500)
    try:pg.click('#svpC',timeout=120000)
    except Exception as e:print('noclick',str(e)[:100])
    pg.wait_for_timeout(5000)
    r['after']=pg.evaluate("()=>party[0]?[Math.round(party[0].h),Math.round(M(party[0]))]:null")
    w=r['want']
    ok(all(r['grow'][t]==w['grow'] for t in r['grow']),'every tier gains the same per level %s'%json.dumps(r['grow']))
    ok(all(r['base'][t]==w['base'][t] for t in r['base']),'higher tiers still start with higher stats %s'%json.dumps(r['base']))
    ok(r['enemySt'],'enemies keep their own fixed stats')
    a=r.get('after')
    ok(a and a[0]<=a[1],'a companion from an older save is trimmed to its new maximum health %s %s'%(a,r.get('loadErr','')))
    print('FAILS',len(fails))
play.run(s)
