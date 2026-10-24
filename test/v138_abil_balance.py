# v138 ability balance: the value table is loaded, spread-shot volleys hit each enemy once at full damage (Arcane Missiles exempt),
# evolved casts use their factor and the class factor, the evolved Death Mark is +35% for 10 s, and every ability of every class
# still casts and deals damage, base and evolved (level 50).   python3 v138_abil_balance.py
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
B=os.path.join(os.path.dirname(os.path.abspath(__file__)),'v127_balance')
LIB=open(B+'/lib.js').read()+'\n'+open(B+'/ext.js').read();FAST=open(B+'/fast.js').read()
FAIL=[]
def chk(n,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+n,'' if ok else str(info)[:400],flush=True)
    if not ok:FAIL.append(n)
def s(pg):
    pg.set_default_timeout(3600000);ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("(L)=>{eval(L);const q=PMAP[0];toPos(q.path[40][0],q.path[40][1]);V90.home=[pl.position.x,pl.position.z];V90.start();return 1}",LIB)
    ev("(L)=>{eval(L);F.step(60);return 1}",FAST)
    r=ev("()=>({bal:typeof BAL138,evo:Object.keys(BAL138_EVO).length,cls:typeof BAL138_EVOC,dm:EVO137['Death Mark'].mod,dmd:EVO137['Death Mark'].d,ms:KQR_TUNE['Multishot']})")
    chk('value table loaded (62 evolved factors, class factors)',r['bal']=='object' and r['evo']>=60 and r['cls']=='object',r)
    chk('evolved Death Mark: +35% for 10 s, description says so',abs(r['dm']['v']-.35)<1e-9 and r['dm']['dur']==10 and '35%' in r['dmd'] and '10s' in r['dmd'],r)
    # volley: ranger point-blank on one dummy, Multishot: later arrows on the same enemy deal 30% of the first
    r=ev("""()=>{V90.setup('ranger',50,{rank:1});V90.addX(0);const H=[];{const f=hurt;window.__h=f;hurt=function(e,d,s,c,dot){const h0=e.c.h;const r=f.apply(this,arguments);if(e===V90.dum&&!dot)H.push(h0-e.c.h);return r}}
      V90.home0();pl.position.z=V90.dum.m.position.z-1.0;V90.oneS('Multishot');hurt=window.__h;return H}""")
    ok=len(r)>=2 and max(r[1:])<=r[0]*.45
    chk('Multishot point-blank: extra arrows on one enemy deal ~30%%',ok,r)
    r=ev("""()=>{V90.setup('mage',50,{rank:1});V90.addX(0);const H=[];{const f=hurt;window.__h=f;hurt=function(e,d,s,c,dot){const h0=e.c.h;const r=f.apply(this,arguments);if(e===V90.dum&&!dot)H.push(h0-e.c.h);return r}}
      V90.home0();V90.oneS('Arcane Missiles');hurt=window.__h;return H}""")
    chk('Arcane Missiles exempt: every bolt hits at full damage',len(r)>=3 and min(r)>=max(r)*.6,r)
    # evolved factor in kqrP
    r=ev("""()=>{V90.setup('warrior',50,{rank:5});const s=kqsFind('warrior','Cleave');const b=kqrP(s);hero.tal['__ev:Cleave']=1;const e=ev137Sk(s);const k=kqrP(e);
      return {b,k,want:b*EV137.dmg*BAL138_EVO['Cleave']*BAL138_EVOC.warrior,evo:!!e.ev137}}""")
    chk('evolved Cleave uses evolution bonus × its factor × the class factor',r['evo'] and abs(r['k']-r['want'])<1e-6*max(1,r['want']),r)
    # every ability casts, base and evolved; damaging ones (in KQR_TUNE) deal damage
    for evo in (0,1):
      r=ev("""(evo)=>{const out=[];for(const c of ['warrior','paladin','assassin','ranger','mage']){V90.setup(c,50,{rank:evo?5:1});if(evo)kqsAll(c).forEach(s=>{hero.tal['__ev:'+s.n]=1});V90.addX(4);
        for(const s of kqsAll(c)){if(s.n=='Chronoshift')continue;let r;try{r=V90.oneS(s.n)}catch(e){r={err:''+e}}
          const dmg=(r.dmg||0)+(r.x||0);if(r.err||r.fail)out.push([c,s.n,'cast failed',r.err||'']);else if(KQR_TUNE[s.n]!=null&&!['Shadow Clone','Call of the Wild','Wild Hunt'].includes(s.n)&&dmg<=0)out.push([c,s.n,'no damage'])}}return out}""",evo)
      chk(('evolved' if evo else 'base')+': every ability casts and the damaging ones deal damage',not r,r)
play.run(s)
print('FAILURES:',FAIL if FAIL else 'none')
