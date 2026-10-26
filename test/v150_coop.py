# v150 co-op: shared camp clears and kill progress, monsters going for a partner's companion, decals cleaned up on the
# partner, the partner's mount, Duskhold shown from the host and a guest's build going to the host's kingdom.
# Run: python3 mpt.py v150_coop.py
if 'A' not in globals():  # run directly (the test suite): open the two co-op windows through mpt.py
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json
for pg in (A,B):pg.evaluate("()=>FAST()")
fails=[]
# both pages must keep running: a page in the background has its timers slowed right down (Chrome), so alternate the front one
def tick(ms):
    for i in range(max(1,ms//400)):
        (A if i%2 else B).bring_to_front();A.wait_for_timeout(400)
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
# ---- camp clear + kills ----
C=A.evaluate("()=>{const L=CAMPS.filter(C=>C.ig===0);const C=L[0];return [CAMPS.indexOf(C),C.x,C.z]}")
for pg,dx in ((A,6),(B,8)):pg.evaluate("([x,z])=>{toPos(x,z)}",[C[1]+dx,C[2]])
tick(9000)
H,G=(A,B) if A.evaluate("()=>MP.host===MP.me") else (B,A)
print('host is',H.evaluate("()=>hero.name"),'roles',A.evaluate("()=>[MP.rg,MP.others,MP.host===MP.me]"),B.evaluate("()=>[MP.rg,MP.others,MP.host===MP.me]"))
G.evaluate("""()=>{window.__ev={};const f=chqEv132;chqEv132=function(k,n){__ev[k]=(__ev[k]||0)+(n||1);return f.apply(this,arguments)};window.__xp0=hero.xp+hero.lvl*1e6;window.__ch0=CHESTS.length;hero.hp=heroMax()}""")
n=H.evaluate("""(j)=>{const C=CAMPS[j];const L=enemies.filter(e=>e.camp===C&&!e.dead);L.forEach(e=>{e.lhH=0;kill(e)});return L.length}""",C[0])
tick(5000)
r=G.evaluate("(j)=>{const C=CAMPS[j];return {clr:campCleared(C),ev:__ev,xp:hero.xp+hero.lvl*1e6-__xp0,chest:CHESTS.length-__ch0}}",C[0])
chk('camp clear shared',n>0 and r['clr'] and r['ev'].get('camp',0)>=1 and r['xp']>0 and r['chest']>=1,json.dumps([n,r]))
chk('partner kills count',r['ev'].get('kill',0)>=1,json.dumps(r['ev']))
# ---- a host monster goes for the guest's companion ----
r=G.evaluate("()=>[party.length,fols.length,!!(fols[0]&&fols[0].visible)]")
print('guest companions',r)
r=H.evaluate("""()=>{const R=Object.values(MP.rh)[0];if(!R||!R.fl||!R.fl[0])return 'no ghost';const g=R.fl[0];enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});
  const h=R.m.position,dx=g.position.x-h.x,dz=g.position.z-h.z,l=Math.hypot(dx,dz)||1;const e=spawnEnemy('goo',g.position.x+dx/l*2.5,g.position.z+dz/l*2.5,3,{});e.agg=1;
  const p0=AG150.pref;AG150.pref=0;let tg;try{tg=eTarget(e,e.m,e.m.position.distanceTo(pl.position))}finally{AG150.pref=p0}const ok=tg===g;
  window.__ag=[e,g];MP.tE=0;return [ok,+e.m.position.distanceTo(g.position).toFixed(1)]}""")
tick(2000)
r=r+[H.evaluate("()=>{const [e,g]=__ag;MP.evq.length=0;e.cd=0;mStart(e,g,'bite');const q=MP.evq.find(q=>q[0]==='a');return q&&q[3]}")]
chk('monster targets partner companion',isinstance(r,list) and r[0] and isinstance(r[-1],str) and '#0' in r[-1],json.dumps(r))
tick(800)
r2=G.evaluate("()=>{const e=enemies.find(e=>e.mir&&e.atk);return e?[e.atk.tg===fols[0],e.atk.n]:null}")
chk('owner plays it on its companion',r2 is not None and r2[0],json.dumps(r2))
# ---- decal on the partner goes away ----
A.evaluate("()=>{MPV.cap=1;try{const D=kqsDecal(pl.position.clone(),2,0x7ae04a,.2,.6);window.__D=D}finally{MPV.cap=0}}")
tick(2500)
d1=B.evaluate("()=>Object.keys(V150.dec).length")
A.evaluate("()=>{MPV.cap=1;try{__D.rm(200)}finally{MPV.cap=0}}")
tick(2500)
d2=B.evaluate("()=>Object.keys(V150.dec).length")
chk('partner decal removed',d1>=1 and d2==0,json.dumps([d1,d2]))
# ---- the partner's mount ----
A.evaluate("()=>{inCombatNow=()=>false;if(!mounts.length){mounts.push({id:1,k:'pony',n:'Pony',spd:10,cap:30,dist:0});mActive=1};toggleMount();MP.lastPres=''}")
tick(2500)
r=B.evaluate("()=>{const R=Object.values(MP.rh)[0];return [!!R.mt150,R.mt150&&R.mt150.k,R.m&&+R.m.children[0].position.y.toFixed(2)]}")
chk('partner mount shown',r[0],json.dumps(r))
A.evaluate("()=>{dismount();MP.lastPres=''}");tick(2500)
r=B.evaluate("()=>{const R=Object.values(MP.rh)[0];return [!!R.mt150,+R.m.children[0].position.y.toFixed(2)]}")
chk('partner mount gone',not r[0] and abs(r[1])<.01,json.dumps(r))
# ---- Duskhold: the host's kingdom ----
KH=A if A.evaluate("()=>dk150Host()===MP.me") else B
KG=B if KH is A else A
print('kingdom host',KH.evaluate("()=>hero.name"))
KH.evaluate("()=>{gold+=99999;['wood','stone','iron','fiber','crystal','clay','bone','petals','glowcap'].forEach(k=>mats[k]=(mats[k]||0)+999);const o=SHOPS.find(o=>!shopBuilt(o.k)&&!o.g||true);window.__hk=SHOPS.filter(o=>!shopBuilt(o.k)).map(o=>o.k);if(__hk[0]){shopBuy(__hk[0])};return __hk}")
own=KG.evaluate("()=>JSON.stringify(SH.shop)")
for pg in (A,B):pg.evaluate("()=>{goHome&&goHome()}")
tick(6000)
r=KG.evaluate("()=>[DK150.on,JSON.stringify(SH.shop),MP.rg]")
hs=KH.evaluate("()=>JSON.stringify(SH.shop)")
chk('guest shows host kingdom',r[0] and r[1]==hs,json.dumps([r,hs,own]))
# guest pays for a decoration
k=KG.evaluate("()=>{gold+=99999;['wood','stone','iron','fiber','crystal','clay','bone','petals','glowcap'].forEach(k=>mats[k]=(mats[k]||0)+999);const D=DECO103.find(D=>SH.deco[D.k]==null);if(!D)return null;window.__g0=gold;dcBuy103(D.k);return [D.k,__g0-gold]}")
tick(5000)
hd=KH.evaluate("(k)=>[SH.deco[k],gold]",k[0] if k else '')
gd=KG.evaluate("(k)=>SH.deco[k]",k[0] if k else '')
chk('guest build goes to host',k is not None and hd[0]==1 and gd==1,json.dumps([k,hd,gd]))
# the guest's save still holds its own kingdom
r=KG.evaluate("()=>{const o=x2Save();return [JSON.stringify(o.shp),JSON.stringify(o.kdeco||{})]}")
chk('guest save keeps own kingdom',r[0]==own,json.dumps([r,own]))
# leaving: own kingdom back
KG.evaluate("()=>{mpUse(null)}");tick(3000)
r=KG.evaluate("()=>[DK150.on,JSON.stringify(SH.shop)]")
chk('own kingdom back after leaving',not r[0] and r[1]==own,json.dumps([r,own]))
print('V150_COOP','PASS' if not fails else 'FAIL',fails)
