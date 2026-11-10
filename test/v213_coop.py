# v213 co-op: a partner sees the class defences (the guard pose, a block's effect, the warrior's bulwark, the mage's mana ward) and
# that the card table's dealing goes through the effect relay (Duskhold itself has no shared room, so it is checked by name).
# Run: python3 mpt.py v213_coop.py   (A = warrior, B = mage)
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
# out in the field: Duskhold has no shared room (co-op effects and heroes relay inside a zone instance)
for pg in (A,B):pg.evaluate("()=>FAST()")
p=A.evaluate("()=>PMAP[0].ins[0].path[60]")
A.evaluate("(p)=>toPos(p[0],p[1])",p);B.evaluate("(p)=>toPos(p[0]+2.2,p[1]+1)",p)
mp_roles(60000)
chk('the partners see each other',mp_until("()=>Object.values(MP.rh||{}).some(r=>r&&r.act&&r.m&&r.m.visible)",30000))
cnt="()=>{const c=MPV.cnt||{};return {V:c.V||0,P:c.P||0}}"
b0=B.evaluate(cnt)
# A (warrior) raises the guard, blocks, and carries a bulwark
A.evaluate("()=>{gd213Down()}");A.wait_for_timeout(600)
A.evaluate("()=>{gd213Fx('block',pl.rotation.y,40,0);GD213.wsh=[{a0:120,t0:nowP()}]}")
ok=mp_until("""()=>{const r=Object.values(MP.rh).find(r=>r&&r.m&&r.pr&&r.pr.cls==='warrior')||Object.values(MP.rh)[0];const U=r&&r.m&&r.m.userData.gd213;return !!(U&&U.w)}""",15000,[B])
b1=B.evaluate(cnt)
chk('the guard pose reaches the partner',b1['P']>b0['P'],json.dumps([b0,b1]))
chk('the block effect reaches the partner',b1['V']>b0['V'],json.dumps([b0,b1]))
chk('the partner sees the warrior\'s bulwark',ok)
A.evaluate("()=>{gd213Up();GD213.wsh=[]}")
chk('the bulwark goes on the partner\'s screen when it runs out',mp_until("()=>!Object.values(MP.rh).some(r=>r&&r.m&&r.m.userData.gd213&&r.m.userData.gd213.w)",15000,[B]))
# B (mage) raises the mana ward
B.evaluate("()=>{hero.mp=mpMax();gd213Down()}")
chk('B\'s mana ward is up',B.evaluate("()=>GD213.mana"))
chk('the partner sees the mana ward',mp_until("()=>Object.values(MP.rh).some(r=>r&&r.m&&r.m.userData.gd213&&r.m.userData.gd213.m)",15000,[A]))
B.evaluate("()=>{gd213Down()}")
chk('the ward goes on the partner\'s screen when dropped',mp_until("()=>!Object.values(MP.rh).some(r=>r&&r.m&&r.m.userData.gd213&&r.m.userData.gd213.m)",15000,[A]))
# the card table's dealing is relayed like the other effects (seen by a partner wherever the two share a room)
chk('the card deal is a relayed effect',A.evaluate("()=>MPV.FX.indexOf('cd213Show')>=0&&MPV.FX.indexOf('gd213Fx')>=0&&MPV.FX.indexOf('gd213St')>=0"))
if fails:print('FAILED',fails)
else:print('v213 co-op: checked')
