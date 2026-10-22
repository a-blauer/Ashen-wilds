# v125 balance harness: python3 test/v125_balance/mat.py  (env: LV=10,20 CL=mage COMP=1 TUNE=<js file applied first> TAG=name) -> out/mat_<TAG>.json; python3 test/v125_balance/rep.py out/mat_<TAG>.json
# full matrix: per level, per class -> best loadouts (one target / group), then every weapon of the class: basic, fight 1, fight 4, toughness
import sys,json,os,time
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
import play
SP=os.path.dirname(os.path.abspath(__file__))
LIB=open(SP+'/lib.js').read()+'\n'+open(SP+'/ext.js').read();FAST=open(SP+'/fast.js').read()
TUNE=open(os.environ['TUNE']).read() if os.environ.get('TUNE') else ''
LVS=[int(x) for x in os.environ.get('LV','10,20,30,40,50').split(',')];CL=os.environ.get('CL','warrior,paladin,assassin,ranger,mage').split(',')
COMP=os.environ.get('COMP')=='1'
OUT=play.TMP+'/mat_'+os.environ.get('TAG','x')+'.json';res={'w':[],'ab':[],'comp':[]}
def save():open(OUT,'w').write(json.dumps(res))
def s(pg):
    pg.set_default_timeout(7200000);ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("(L)=>{eval(L);const q=PMAP[0];toPos(q.path[40][0],q.path[40][1]);V90.home=[pl.position.x,pl.position.z];V90.start();return 1}",LIB)
    ev("(L)=>{eval(L);F.step(60);return 1}",FAST)
    if TUNE:ev("(L)=>{(0,eval)(L);return 1}",TUNE)
    t0=time.time()
    if COMP:
      ev("""()=>{V90.setup('warrior',50,{rank:1});V90.comp=1;V90.addX(3);{const f=heroTick;heroTick=function(){if(V90.comp)fols.forEach(q=>{if(q)q.cdA=999});return f.apply(this,arguments)}}
        window.SPF=n=>{for(const k of SPK){if(SP2[k][8]==n)return k}for(const f in EVSP)if(EVSP[f].includes(n))return famTier(f,1);return 'Foxlet'};
        window.SETC=n=>{const sp=SPF(n),c=hatch(Object.assign(mkEgg(sp,0,1),{basic:true}));c.l=50;c.h=M(c);c.emp=false;party=[c];cmpSel=0;c.sp=[n];c.cdm={};Object.keys(CSP).forEach(k=>c.cdm[k]=999);try{ui()}catch(_){};return sp};return 1}""")
      for n in ev("()=>Object.keys(CSP).filter(k=>CSP[k].m)"):
        r=ev("""(n)=>{const sp=SETC(n);V90.wait(.4);const c=party[0],f=fols[0],e=V90.dum;f.position.set(e.m.position.x,0,e.m.position.z-2.2);Object.keys(CSP).forEach(k=>c.cdm[k]=999);
          let bs=0;for(let i=0;i<300;i++)bs+=dmgCE(c,e.c,1)*(1+HS().compP);const basic=bs/300;e.el=null;V90.X.forEach(q=>{q.el=null;q.dots=[]});
          e.dots=[];V90.dmg=V90.dmgX=V90.dot=0;compCast(c,f,CSP[n],e);V90.wait(6.5);const S=CSP[n];
          return {n,sp,k:S.k,m:S.m,cd:S.cd,dmg:Math.round(V90.dmg),x:Math.round(V90.dmgX),he:+(V90.dmg/basic).toFixed(2),hx:+(V90.dmgX/basic).toFixed(2)}}""",n)
        res['comp'].append(r);save()
      ev("()=>{V90.comp=0;party.forEach(c=>{if(c)c.h=0});return 1}");print('comp done t=%.0f'%(time.time()-t0),flush=True)
    for L in LVS:
      for c in CL:
        a=ev("""([c,L])=>{V90.setup(c,L,{rank:1});V90.addX(3);const b=V90.basicS(6);const ab=[];
          for(const s of kqsAll(c)){if(s.lv>L||s.n=='Chronoshift')continue;let r;try{r=V90.oneS(s.n)}catch(e){r={n:s.n,err:''+e}}ab.push({n:s.n,dmg:r.dmg||0,x:r.x||0,cd:r.cd||0,he:b.hit?+((r.dmg||0)/b.hit).toFixed(2):0,hx:b.hit?+((r.x||0)/b.hit).toFixed(2):0})}
          const ok=ab.filter(a=>a.cd>0);const ld1=ok.filter(a=>a.dmg>0).sort((p,q)=>q.dmg/q.cd-p.dmg/p.cd).slice(0,4).map(a=>a.n);
          const ld2=ok.filter(a=>a.dmg+a.x>0).sort((p,q)=>(q.dmg+q.x)/q.cd-(p.dmg+p.x)/p.cd).slice(0,4).map(a=>a.n);return {c,L,ab,ld1,ld2,hit:b.hit}}""",[c,L])
        res['ab'].append(a);save()
        wts=ev("(c)=>[...new Set(ITPL.filter(t=>t.sl=='weapon'&&fitsCls(t,c)).map(t=>t.wt))]",c)
        for wt in wts:
          r=ev("""([c,wt,L,l1,l2])=>{const tp=V90.wtp(wt,L);V90.setup(c,L,{rank:1,wtp:tp});V90.addX(0);const b=V90.basicS(10);const r1=V90.rotS(l1,30);V90.addX(3);const bg=V90.basicS(6),r2=V90.rotS(l2,30);
            return {c,wt,L,b,bg,r1,r2,ehp:V90.ehp().hitsToDie,hp:Math.round(heroMax())}}""",[c,wt,L,a['ld1'],a['ld2']])
          res['w'].append(r);save()
      print('L',L,'done t=%.0f'%(time.time()-t0),flush=True)
play.run(s)
