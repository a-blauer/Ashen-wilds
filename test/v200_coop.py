# v200 co-op: what a partner sees of the station work — the host's Hatchery standing on the guest's screen (it exists at
# level 0 now), a companion's new look after a Beast Den reroll, and the companion-food bite effect (cf200Fx, relayed).
# Run: python3 v200_coop.py   (opens the two co-op windows through mpt.py)
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json
for pg in (A,B):pg.evaluate("()=>FAST()")
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info,flush=True)
    if not ok:fails.append(name)
H,G=(A,B) if A.evaluate("()=>!!(typeof DK150!='undefined'&&dk150Host()===MP.me)") else (B,A)
# 1. the kingdom on show is the host's, Hatchery included (built at level 0 on the host's lot)
ok=mp_until("()=>typeof DK150!='undefined'&&(DK150.host===MP.me||DK150.on&&!!DK150.host)",60000)
hl=H.evaluate("()=>[SH.pos['u:hatch']||null,kdLv('hatch')]")
mp_until("(l)=>SH.pos['u:hatch']===l",40000,[G],hl[0])
gl=G.evaluate("()=>{const s=kdState().up.hatch;return [SH.pos['u:hatch']||null,s?s.l:null,DK150.on,DK150.host===MP.me]}")
chk('guest sees the host\'s Hatchery on the same lot, standing at level 0',bool(hl[0] and gl[0]==hl[0] and gl[1]==1),json.dumps({'host':hl,'guest':gl}))
# the rest happens out in the field (effects relay inside a zone instance; Duskhold has none)
p=A.evaluate("()=>{const p=PMAP[0].ins[0].path[60];return p}")
A.evaluate("(p)=>toPos(p[0],p[1])",p);B.evaluate("(p)=>toPos(p[0]+2.2,p[1]+1)",p)
H,G=mp_roles(60000)
# 2. a Beast Den reroll that turns B's lead companion shiny and a rare colour reaches A's copy of it
B.evaluate("()=>{const c=party[0];c.shn=1;c.rv='Crimson';c.cl=c.cl.slice();c.cl[0]=RVAR.Crimson;c.tr='Horned';cbarSig=''}")
seen=mp_until("()=>{const r=Object.values(MP.rh)[0],g=r&&r.fl&&r.fl[0],c=g&&g.mpC;return !!(c&&c.shn&&c.rv==='Crimson'&&c.tr==='Horned')}",60000,[A])
chk('partner sees the rerolled companion (shiny, Crimson, Horned)',seen,json.dumps(A.evaluate("()=>{const r=Object.values(MP.rh)[0],g=r&&r.fl&&r.fl[0],c=g&&g.mpC;return c?{shn:c.shn,rv:c.rv,tr:c.tr}:null}")))
# 3. the companion food bite effect is relayed
A.evaluate("()=>{window.__cf=0;const f=window.cf200Fx;window.cf200Fx=function(){__cf++;return f.apply(this,arguments)}}")
B.evaluate("()=>{sup.cf_jerky=5;const c=party[0];c.cf200=[];cf200Put(c,'cf_jerky',3);c._cf200=0;c.h=Math.max(1,M(c)*.1)}")
got=mp_until("()=>window.__cf>0",30000,[A])
chk('partner sees the companion-food bite',got,json.dumps({'B pouch':B.evaluate("()=>party[0].cf200"),'A calls':A.evaluate("()=>window.__cf")}))
errs=[pg.evaluate("()=>(window.__pe||[]).slice(0,3)") for pg in (A,B)]
print('V200 COOP','OK' if not fails else 'FAILED %d'%len(fails))
