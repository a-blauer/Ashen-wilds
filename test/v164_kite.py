# v164: companions (owner: "pressing Space to make your companion attack makes his attack speed as fast as you press it";
# "companions are too good at kiting: the dragon can keep backing up while attacking and never get hit").
#  kite: one tough monster, the hero out of the fight, 30 s per companion. FAIL when a magic companion (Drakelet, Wispling) takes
#        fewer than MINHIT of the blows aimed at it (before v164: 2 of 7 and 1 of 5; the fox up close takes them all), or when any
#        companion stops attacking (fewer than MINATK hits of its own).
#  spam: Space pressed every 0.1 s for 6 s vs not pressed: FAIL when spamming gives more than SPAM× the attacks (before: ~5×).
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
MINHIT=float(os.environ.get('MINHIT','.6'));MINATK=int(os.environ.get('MINATK','12'));SPAM=float(os.environ.get('SPAM','1.5'))
JS=r"""async()=>{const out={};window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;try{loop(VT)}catch(err){out.err=String(err).slice(0,200)}}};
 hero.lvl=30;const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];
 const LOG=[];{const f=hitTarget;hitTarget=function(e,tg,mult,mt){LOG.push(tg===pl?'hero':(fols.indexOf(tg)>=0?'fol':'?'));return f.apply(this,arguments)}}
 let CH=0;{const f=compHit;compHit=function(){CH++;return f.apply(this,arguments)}}
 const setup=sp=>{party.length=0;party.push(mkC(sp,25));if(typeof syncFols=='function')syncFols();STEP(5);
  toPos(q[0],q[1]);STEP(30);enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});LOG.length=0;CH=0;
  const P0=pl.position.clone(),f0=fols[0];f0.position.set(P0.x+2,P0.y,P0.z);f0.cdA=0;f0.cmdQ164=0;
  const e=spawnEnemy(BIOEN[p.n][0],P0.x+9,P0.z,25,{});e.c.h=e.c.st.hp=1e7;e.agg=1;return {e,f0}};
 out.kite={};
 for(const sp of ['Drakelet','Wispling','Foxlet']){const {e,f0}=setup(sp);let aim=0;
  for(let i=0;i<60*30;i++){hero.hp=heroMax();hero.iv=5;party[0].h=M(party[0]);tgt=e;CMD={e,t:nowP()+12000};STEP(1);
    if(e.atk&&!e.atk._c){e.atk._c=1;if(e.atk.tg===f0)aim++}}
  out.kite[sp]={mt:xMt(party[0]),aimed:aim,hit:LOG.filter(w=>w=='fol').length,attacks:CH}}
 out.spam={};
 for(const mode of ['calm','spam']){const {e,f0}=setup('Foxlet');e.stun=999;f0.position.set(e.m.position.x-1.2,e.m.position.y,e.m.position.z);
  for(let i=0;i<60*6;i++){hero.hp=heroMax();hero.iv=5;tgt=e;if(i==0||(mode=='spam'&&i%6==0))commandAttack();STEP(1)}
  out.spam[mode]=CH}
 return out}"""
fails=[]
def F(m):fails.append(m);print('FAIL',m)
def s(pg):
    pg.set_default_timeout(1500000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    r=pg.evaluate(JS);print(json.dumps(r))
    if r.get('err'):F('error '+r['err'])
    for sp,k in r['kite'].items():
        if k['attacks']<MINATK:F('%s attacked only %d times in 30 s'%(sp,k['attacks']))
        if k['mt']=='m':
            if k['aimed']<3:F('%s: only %d blows were aimed at it (test setup)'%(sp,k['aimed']))
            elif k['hit']<MINHIT*k['aimed']:F('%s dodged too much: hit by %d of %d blows aimed at it'%(sp,k['hit'],k['aimed']))
    c,sp=r['spam']['calm'],r['spam']['spam']
    if c<1:F('the commanded companion did not attack (%d)'%c)
    elif sp>SPAM*c:F('pressing Space every 0.1 s gave %d attacks in 6 s vs %d without'%(sp,c))
play.run(s)
print('companion kiting and command: checked' if not fails else 'CHECKS FAILED')
