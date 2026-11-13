# v226 co-op: in the Sandstorm Run the host's Shellback and Brood Scorpion reach the partner as the grown alpha scarab / scorpion with
# their glow (worked out on the partner's screen from the alpha flag), the partner's guns count the same shells for them, and a
# worm the host sends takes 8 shells on the partner's screen too.
# Run: python3 mpt.py v226_coop.py
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
for pg in (A,B):pg.evaluate("()=>{FAST();window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=1e9},100);CHEAT.god=true;hero.lvl=Math.max(hero.lvl,35);INSR[3]=2;sr165Go([{id:'v0',drv:'chd',gun:'me'}])}")
H,G=mp_roles(90000)
chk('both ride the Run in the same instance',mp_until("()=>SR165.on&&sr165In()",30000))
H.evaluate("()=>{const V=SR165.me,P=sr165Path();SR165.ph='run';SR165.t=0;window.__k226={};[['sb',5],['gs',-5]].forEach(([k,o])=>{const [x,z]=P.at(V.s+16,o);const e=skr226Spawn(k,x,z);if(e){e.k226.st=k=='sb'?'wait':'hunt';__k226[k]=1}})}")
ok=mp_until("()=>{const L=enemies.filter(e=>!e.dead&&e.mir&&e.c&&e.c.al);return L.some(e=>e.c.en=='scarab'&&e.sz226)&&L.some(e=>e.c.en=='scorp'&&e.sz226)}",30000,[G])
info=G.evaluate("()=>JSON.stringify(enemies.filter(e=>!e.dead&&e.mir).map(e=>[e.c.en,e.c.al?1:0,e.sz226||0,+e.m.bs.toFixed(2)]))")
chk('the partner sees the Shellback and the Brood Scorpion grown',ok,info)
g=G.evaluate("()=>{skr226Glow(performance.now());return SKR226G.size}")
chk('the partner draws their glow',g>=2,str(g))
k=G.evaluate("()=>{const L=sr165FoeList();return L.filter(f=>f.e&&f.e.mir&&f.e.c.al).map(f=>skr226Kind(f.e)).sort().join(',')}")
chk('the partner\'s guns know them as Shellback and Brood Scorpion',k=='gs,sb',k)
H.evaluate("()=>{const V=SR165.me;sr165Worm(V.s+40,-5,5,true)}")
w=mp_until("()=>SR165F.wy.length>0",15000,[G])
hp=G.evaluate("()=>SR165F.wy.map(W=>W.hp).join(',')")
chk('a worm sent by the host takes 12 shells (v227) on the partner\'s screen',w and hp.startswith('12'),hp)
if fails:print('FAILED',fails)
else:print('v226 co-op: checked')
