# v138 ability harness: every ability of every class at level 50 (base rank 1, or EVO=1: evolved rank 5) on a dummy + 4 near + 4 far,
# every hit logged. OUT=<json> [TUNE=<js applied first>] python3 test/v138_abilities/abl.py ; then python3 test/v138_abilities/step.py b.json e.json state.json next.js
# (prints abilities off their target by >12%; an2.py holds the value table: delivery type, area size, utility) ; niche2.py <base> <evolved> lists strictly-worse pairs
# every class ability at level 50: per-hit log (time, dummy, damage, dot) on a main dummy + 4 near (1.3) + 4 far (3.0),
# plus what else it does: statuses on enemies, heals / shields / buffs / invulnerability on the hero, how far the hero moved
import sys,json,os,time
T=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..');sys.path.insert(0,T)
import play
B=os.environ.get('LIBDIR',T+'/v127_balance');LIB=open(B+'/lib.js').read()+'\n'+open(B+'/ext.js').read();FAST=open(B+'/fast.js').read()
TUNE=open(os.environ['TUNE']).read() if os.environ.get('TUNE') else ''
EVO=os.environ.get('EVO')=='1';OUT=os.environ.get('OUT');res=[]
def s(pg):
    pg.set_default_timeout(7200000);ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("(L)=>{eval(L);const q=PMAP[0];toPos(q.path[40][0],q.path[40][1]);V90.home=[pl.position.x,pl.position.z];V90.start();return 1}",LIB)
    ev("(L)=>{eval(L);F.step(60);return 1}",FAST)
    if TUNE:ev("(L)=>{(0,eval)(L);return 1}",TUNE)
    ev("""()=>{V90.OFF=[[-1.3,0],[1.3,0],[0,1.3],[-.9,.9],[-3,0],[3,0],[0,3],[2.1,2.1]];window.AL=null;
      const ix=e=>e===V90.dum?0:V90.X.indexOf(e)+1;
      {const f=hurt;hurt=function(e,d,s,crit,dot){const h0=e&&e.c?e.c.h:0;const r=f.apply(this,arguments);if(AL&&e){const i=ix(e);if(i>=0)AL.h.push([+V90.gt.toFixed(2),i,Math.round(h0-e.c.h),dot?1:0])}return r}}
      {const f=eStatus;eStatus=function(e,fx){if(AL&&e&&fx){const i=ix(e);if(i>=0)for(const k in fx)if(['stun','slow','root','weak','freeze','silence','fear','pull'].includes(k)&&fx[k])(AL.st[k]=AL.st[k]||{}),AL.st[k][i]=Math.max(AL.st[k][i]||0,+fx[k]||1)}return f.apply(this,arguments)}}
      {const f=healHero;healHero=function(v){if(AL)AL.heal+=+v||0;return f.apply(this,arguments)}}
      return 1}""")
    t0=time.time()
    for c in ['warrior','paladin','assassin','ranger','mage']:
      r=ev("""([c,evo])=>{V90.setup(c,50,{rank:evo?5:1});if(evo)kqsAll(c).forEach(s=>{hero.tal['__ev:'+s.n]=1});V90.addX(8);const out=[];const sP=HS().skillP||0,atk0=atkOf(CLS[c].mt);
        for(const s of kqsAll(c)){if(s.n=='Chronoshift')continue;
          V90.home0();hero.sh=0;hero.buffs=[];hero.iv=0;const p0=pl.position.clone();let mv=0,iv=0,sh=0,mark=0;
          AL={h:[],st:{},heal:0};
          {const f=heroTick;window.__ht=f;heroTick=function(){const r=f.apply(this,arguments);try{mv=Math.max(mv,d2(pl.position,p0));iv=Math.max(iv,hero.iv||0);sh=Math.max(sh,hero.sh||0);
            mark=Math.max(mark,V90.dum.mark||0,V90.dum.wk||0)}catch(_){}return r}}
          const g0=V90.gt;let r;try{r=V90.oneS(s.n)}catch(e){r={err:''+e}}heroTick=window.__ht;
          const bf=(hero.buffs||[]).map(b=>Object.keys(b.s||{}).join('+')).filter(x=>x);
          const E=(typeof EVO137!='undefined'&&EVO137[s.n])||{};
          out.push({n:s.n,cd:r.cd||0,hits:AL.h.map(h=>[+(h[0]-g0).toFixed(2),h[1],h[2],h[3]]),st:AL.st,heal:Math.round(AL.heal),sh:Math.round(sh),iv:+iv.toFixed(2),mv:+mv.toFixed(1),mark:+mark.toFixed(1),bf,
            k:s.k||s.x||'',stun:s.stun||0,ty:s.ty||'',d:s.d||'',en:E.en||'',ed:E.d||'',tune:KQR_TUNE[s.n]||1,err:r.err||r.fail||''})}
        AL=null;return {c,atk0,sP,hp:heroMax(),evo:evo?1:0,evoc:(evo&&typeof BAL138_EVOC!='undefined'&&BAL138_EVOC[c])||1,ab:out}}""",[c,EVO])
      res.append(r);open(OUT,'w').write(json.dumps(res));print('done',c,len(r['ab']),'t=%.0f'%(time.time()-t0),flush=True)
play.run(s)
