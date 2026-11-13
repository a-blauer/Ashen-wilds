# v227 co-op: the reinvented Sandstorm Run with two on one machine (the guest steers, the host shoots and runs the creatures).
# The gunner sees the machine where the driver steers it, sees its jumps (height in the air, the new 14th field of 's5v') and its
# storm (the 15th); the gunner's shots and heavy shell (the 4th field of 's5f') show on the driver's screen; the storm's damage
# (the driver's own) reaches the gunner's hull bar; a scorpion's venom reaches the partner; creatures killed by either give
# no XP and no loot on either screen.
# Run: python3 mpt.py v227_coop.py
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
for pg in (A,B):pg.evaluate("()=>{FAST();window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=1e9;if(SR165.me&&window.__god)SR165.me.hp=Math.max(SR165.me.hp,60)},100);hero.lvl=Math.max(hero.lvl,35);INSR[3]=2;SS165.c3.built=1;SS165.c3.got=31;SET.intro=0;insArrive(INSL[insG(3,2)])}")
H,G=mp_roles(90000)
chk('both stand in Searing Sands III',mp_until("()=>ss165Here(2)&&MP.others>=1",40000))
for pg in (H,G):pg.evaluate("""()=>{window.__s={ya:0,st:0,hv:0,f:0,xp0:hero.xp,g0:gold,d0:drops.length};
  {const f=sr227Heavy;sr227Heavy=function(V,own){if(!own)__s.hv++;return f.apply(this,arguments)}}
  {const f=sr165Fire;sr165Fire=function(V,own,h){if(!own&&!h)__s.f++;return f.apply(this,arguments)}}
  setInterval(()=>{try{const V=SR165.me;if(!V)return;__s.ya=Math.max(__s.ya,V.y-GH(V.x,V.z));__s.st=Math.max(__s.st,SR165F.st.length)}catch(_){}},25)}""")
G.evaluate("()=>cs165Board()")
ok=mp_until("()=>SR165.on&&!!SR165.me&&sr165In()",40000)
r=[pg.evaluate("()=>SR165.me?[SR165.V.length,SR165.me.drv,SR165.me.gun,SR165.me.id]:null") for pg in (H,G)]
chk('one machine: the guest steers, the host shoots',ok and r[0] and r[1] and r[0][0]==1 and r[1][1]=='me' and r[0][2]=='me' and r[0][3]==r[1][3],json.dumps(r))
if ok:
    for pg in (H,G):pg.evaluate("()=>{window.__god=1}")
    mp_until("()=>SR165.ph==='run'",30000)
    # the driver slides right: the gunner sees the machine there
    G.evaluate("()=>{K.d=1;setTimeout(()=>{K.d=0},1500)}")
    ok=mp_until("()=>SR165.me.s>60",30000)
    G.evaluate("()=>{K.d=0}")
    p=[pg.evaluate("()=>{const V=SR165.me,q=sr165Path().near(V.x,V.z,V.s);return [+V.x.toFixed(1),+V.z.toFixed(1),+q.o.toFixed(1),Math.round(V.s)]}") for pg in (H,G)]
    chk('the gunner rides where the driver steers',ok and abs(p[0][0]-p[1][0])<12 and abs(p[0][1]-p[1][1])<12 and abs(p[0][2]-p[1][2])<4,json.dumps(p))
    # a jump: the driver's machine leaves a crest; the gunner sees it in the air
    for pg in (H,G):pg.evaluate("()=>{__s.ya=0}")
    G.evaluate("()=>{const V=SR165.me,R=sr165Ramps()[0];SR165.obs.forEach(o=>o.gone=1);sr165Place(V,R.s-30,0);V.v=20;V.gap=40}")
    ok=mp_until("()=>__s.ya>1",30000)
    ya=[pg.evaluate("()=>+__s.ya.toFixed(2)") for pg in (H,G)]
    chk('both see the Skimmer fly off the crest',ok,json.dumps(ya))
    # the storm: the driver's gap and the damage inside it reach the gunner
    G.evaluate("()=>{window.__god=0;window.__gp=setInterval(()=>{if(SR165.me)SR165.me.gap=-2},30)}");H.evaluate("()=>{window.__god=0}")
    ok=mp_until("()=>SR165.me.gap!=null&&SR165.me.gap<2&&SR165.me.hp<97",30000)
    g=[pg.evaluate("()=>[+SR165.me.gap.toFixed(1),Math.round(SR165.me.hp),($('sk227Gt')||{}).textContent||'']") for pg in (H,G)]
    chk('the storm on the driver\'s machine and its damage show for the gunner',ok and 'STORM' in g[0][2],json.dumps(g))
    G.evaluate("()=>{clearInterval(__gp);SR165.me.gap=45;SR165.me.hp=100;window.__god=1}");H.evaluate("()=>{window.__god=1}")
    # the gunner's shots and the heavy shell show on the driver's screen
    H.evaluate("()=>{const V=SR165.me;window.__sh=setInterval(()=>{V.fT=0;SKR226.hot=0;SKR226.heat=0;sr165Fire(V,true)},150);SKR227.hv=0;sr165Fire(V,true,1)}")
    ok=mp_until("()=>__s.f>=3&&__s.hv>=1",30000,[G])
    H.evaluate("()=>{clearInterval(__sh)}")
    chk('the driver sees the gunner\'s tracers and the heavy shell',ok,G.evaluate("()=>JSON.stringify([__s.f,__s.hv])"))
    # creatures: the host's scorpion spits; killed by the host and by the partner, no XP and no loot for either
    H.evaluate("()=>{const V=SR165.me,P=sr165Path();SKR226.T.calm=1e9;window.__e=[];[['scorp','sp',22,7],['scarab','sc',16,3],['scarab','sc',17,-3]].forEach(([k,t,d,o])=>{const [x,z]=P.at(V.s+d,o);const e=sr165Foe(k,x,z,t);if(e)__e.push(e)})}")
    ok=mp_until("()=>enemies.filter(e=>!e.dead&&e.mir&&e.c&&(e.c.en==='scarab'||e.c.en==='scorp')).length>=2",30000,[G])
    chk('the partner sees the host\'s creatures',ok)
    ok=mp_until("()=>__s.st>=1",40000)
    chk('a scorpion\'s venom flies on both screens',ok,json.dumps([pg.evaluate("()=>__s.st") for pg in (H,G)]))
    # the partner shoots one (a hit on its copy goes to the host), the host shoots the rest
    G.evaluate("()=>{const f=sr165FoeList().find(q=>q.e&&q.e.mir&&q.k==='sc');if(f)f.hit(1)}")
    H.evaluate("()=>{setTimeout(()=>{for(let n=0;n<8;n++)sr165FoeList().forEach(f=>{if(f.e&&!f.e.dead)f.hit(1)})},1500)}")
    ok=mp_until("()=>!enemies.some(e=>!e.dead&&e.c&&(e.c.en==='scarab'||e.c.en==='scorp'))",40000)
    x=[pg.evaluate("()=>[hero.xp-__s.xp0,gold-__s.g0,drops.length-__s.d0,SKR227.kills]") for pg in (H,G)]
    chk('the creatures die on both screens and give neither player XP, gold or loot',ok and all(q[0]==0 and q[1]==0 and q[2]==0 for q in x),json.dumps(x))
    e=[pg.evaluate("()=>[SKR227.err,SND227.err,CO165.err]") for pg in (H,G)]
    chk('no errors',all(q[0]==0 and q[1]==0 for q in e),json.dumps(e))
if fails:print('FAILED',fails)
else:print('v227 co-op: checked')
