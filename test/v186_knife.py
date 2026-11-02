# v186: throwing knives throw one knife at a time; damage stays comparable. Holds the attack for SEC s of game time against one
# dummy (normal, elite and boss-sized) at a few distances and prints the damage per second (crits off, a fixed random seed, bleed
# included; the dummy stands in a field instance). Checks: every case takes damage; every throw launches exactly one knife (FAIL otherwise); with REF=<json from a run on the old build> the
# average over all cases must stay within TOL (default 15%) of the old one.
#   python3 v186_knife.py            SRC=<old build> OUT=out/v186_knife_before.json ONE=0 python3 v186_knife.py
#   REF=out/v186_knife_before.json python3 v186_knife.py   (compare)   PRE='()=>{window.DS=[2.2];window.KS=["normal"]}' limits the cases
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
SEC=float(os.environ.get('SEC','8'))
JS=r"""async([sec])=>{const out={cases:[],shots:[]};window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 let seed=12345;Math.random=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648};
 aimDir=()=>new THREE.Vector3(1,0,0);{const f=HS;HS=function(){const s=f.apply(this,arguments);s.crit=0;return s}}
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){out.err=String(err).slice(0,200)}}};
 {const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];toPos(q[0],q[1])}enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});
 const tp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&itT({tp:i,lv:1,r:1,up:0,aff:[]}).wt=='knives');eq.weapon={id:9e4+tp,tp,lv:30,req:1,r:2,up:0,aff:[]};refreshGear();STEP(30);
 {const f=launch;launch=function(){const r=f.apply(this,arguments);if(window.__thr)window.__thr.n++;return r}}
 {const f=swingAnim;swingAnim=function(st,ms,onHit){const T={n:0};out.shots.push(T);return f.call(this,st,ms,onHit?function(){window.__thr=T;try{return onHit.apply(this,arguments)}finally{window.__thr=null}}:onHit)}}
 for(const kind of (window.KS||['normal','elite','boss']))for(const D of (window.DS||[1.2,2.2,3.5])){seed=12345;
   enemies.slice().forEach(e=>removeE(e));const e=spawnEnemy(BIOEN[PMAP[1].n][0],pl.position.x+D,pl.position.z,30,{});
   e.c.h=e.c.st.hp=1e9;e.stun=1e9;e.agg=1;if(kind=='elite')e.c.al=1;if(kind=='boss')e.boss=1;tgt=e;face(new THREE.Vector3(1,0,0));STEP(5);
   const h0=e.c.h,n0=out.shots.length;const n=Math.round(sec*1000/16);for(let i=0;i<n;i++){e.m.position.set(pl.position.x+D,e.m.position.y,pl.position.z);if(atkCd<=0)swing();STEP(1)}
   STEP(Math.round(3000/16));// let bleeds finish
   out.cases.push({kind,D,dps:+((h0-e.c.h)/sec).toFixed(1),throws:out.shots.length-n0});e.boss=0;removeE(e)}
 return out}"""
fails=[]
def F(m):fails.append(m);print('FAIL',m)
res={}
def s(pg):
    pg.set_default_timeout(1500000)
    pg.click('[data-dev=desktop]',timeout=900000);pg.click('[data-c="assassin"]',timeout=900000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    pg.evaluate(os.environ.get('PRE','()=>0'));r=pg.evaluate(JS,[SEC]);res.update(r)
play.run(s,w=800,hh=500)
if res.get('err'):F('error %s'%res['err'])
for c in res['cases']:print('%-6s %.1f m  dps %8.1f  throws %d'%(c['kind'],c['D'],c['dps'],c['throws']))
ns=[t['n'] for t in res['shots']];print('knives per throw:',sorted(set(ns)))
avg=sum(c['dps'] for c in res['cases'])/len(res['cases']);print('average dps %.1f'%avg)
if os.environ.get('OUT'):json.dump(res,open(os.environ['OUT'],'w'))
for c in res['cases']:
    if c['dps']<=0:F('%s foe at %.1f m took no damage'%(c['kind'],c['D']))
if os.environ.get('ONE','1')=='1' and any(n!=1 for n in ns):F('a throw launched %s knives (one expected)'%sorted(set(ns)))
if os.environ.get('REF'):
    ref=json.load(open(os.environ['REF']));ra=sum(c['dps'] for c in ref['cases'])/len(ref['cases'])
    for a,b in zip(ref['cases'],res['cases']):print('%-6s %.1f m  before %8.1f  after %8.1f  (%+.0f%%)'%(a['kind'],a['D'],a['dps'],b['dps'],(b['dps']/a['dps']-1)*100 if a['dps'] else 0))
    print('average before %.1f after %.1f (%+.0f%%)'%(ra,avg,(avg/ra-1)*100))
    if abs(avg/ra-1)>float(os.environ.get('TOL','.15')):F('average damage per second changed by %+.0f%%'%((avg/ra-1)*100))
print('knives: checked' if not fails else 'CHECKS FAILED')
