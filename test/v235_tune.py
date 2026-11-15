# v235 (owner, Nov 15 2026): "let's remove the penalty" (no damage loss against a higher-level enemy, hero and companions)
# and "leveling at later levels takes too long" (past level 10 each level needs less XP).   python3 v235_tune.py
import play,json
fails=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c:fails.append(m)
JS=r"""()=>{const o={};const L0=hero.lvl;hero.lvl=10;hsDirty();
 // the same creature read as level 10 and as level 20: only its level differs, so the average hit must be the same
 const c=mkC('Foxlet',10);c.h=M(c)*.6;const avg=(l,n)=>{let t=0;const e={c:Object.assign({},c)};const d0=cPD(e.c);e.c.l=l;o['def'+l]=[d0,cPD(e.c)];
   for(let i=0;i<n;i++)t+=rollHero(e,1000,'p',{}).d;return t/n};
 o.same=avg(10,600);o.above=avg(20,600);
 // companion: compHit_base against a creature 10 levels above it
 const p=party[0];if(p){const hits=[];const h0=hurt;hurt=function(e,d){hits.push(d)};try{const pl0=p.l;p.l=10;
   const e1={c:Object.assign({},c,{l:10})},e2={c:Object.assign({},c,{l:20})};let a=0,b=0;for(let i=0;i<300;i++){hits.length=0;compHit_base(p,e1,1);a+=hits[0];hits.length=0;compHit_base(p,e2,1);b+=hits[0]}
   o.cs=a/300;o.ca=b/300;o.cdef=[dmgCE(p,e1.c,1),dmgCE(p,e2.c,1)];p.l=pl0}finally{hurt=h0}}
 // XP curve
 const old=l=>Math.round(8*l*l+20*l+20);o.need={};for(const l of [1,5,10,11,20,30,40,49])o.need[l]=[old(l),needH(l)];
 o.mono=true;for(let l=1;l<49;l++)if(needH(l+1)<=needH(l))o.mono=false;
 // a hero holding more XP than the new need levels up on the next gain and keeps the rest
 hero.lvl=30;hero.xp=old(30)-10;const g=gainXP({c:{l:30,al:0,boss:0,g:['Foxlet']}});o.carry={lvl:hero.lvl,xp:hero.xp,g};
 hero.lvl=L0;hero.xp=0;hsDirty();return o}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r))
    K=40+9*10;d=r['def20'];want=(1-d[1]/(d[1]+K))/(1-d[0]/(d[0]+K))   # only its own defence changes the hit
    ok(abs(r['above']/r['same']/want-1)<.1,'hero: no level penalty against a creature 10 levels above (ratio %.2f, expected %.2f; the old rule ×0.15)'%(r['above']/r['same'],want))
    if 'cs' in r:
        want=r['cdef'][1]/r['cdef'][0]
        ok(abs(r['ca']/r['cs']/want-1)<.25,'companion: no level penalty (ratio %.2f, expected %.2f; the old rule ×0.2)'%(r['ca']/r['cs'],want))
    else:ok(False,'no companion to test')
    n=r['need']
    ok(all(n[k][0]==n[k][1] for k in ['1','5','10']),'levels 1-10 need the same XP as before')
    ok(abs(n['20'][0]/n['20'][1]-1.4)<.01 and abs(n['30'][0]/n['30'][1]-1.8)<.01 and abs(n['49'][0]/n['49'][1]-2.56)<.01,'later levels need less XP: 20 %s, 30 %s, 49 %s'%(n['20'],n['30'],n['49']))
    ok(r['mono'],'every level still needs more XP than the one before')
    c=r['carry'];ok(c['lvl']>30 and c['xp']>=0,'a hero holding more XP than a level now needs levels up on the next gain (%s)'%c)
    print('FAILS',len(fails))
play.run(s)
