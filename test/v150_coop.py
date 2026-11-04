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
# steady on slow machines (Oct 27 2026): each step waits for its condition (generous deadline) instead of a fixed time
def poll(f,ms=30000):
    import time;t0=time.time()
    while True:
        try:
            if f():return True
        except Exception as e:
            if 'closed' in str(e):raise
        if (time.time()-t0)*1000>=ms:return False
        tick(400)
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
# ---- camp clear + kills ----
C=A.evaluate("()=>{const L=CAMPS.filter(C=>C.ig===0);const C=L[0];return [CAMPS.indexOf(C),C.x,C.z]}")
for pg,dx in ((A,6),(B,8)):pg.evaluate("([x,z])=>{toPos(x,z)}",[C[1]+dx,C[2]])
H,G=mp_roles(60000)
print('host is',H.evaluate("()=>hero.name"),'roles',A.evaluate("()=>[MP.rg,MP.others,MP.host===MP.me]"),B.evaluate("()=>[MP.rg,MP.others,MP.host===MP.me]"))
G.evaluate("""()=>{window.__ev={};const f=chqEv132;chqEv132=function(k,n){__ev[k]=(__ev[k]||0)+(n||1);return f.apply(this,arguments)};window.__xp0=hero.xp+hero.lvl*1e6;window.__ch0=CHESTS.length;hero.hp=heroMax()}""")
# the host's world must have spawned the camp, and the guest its copies (mirrored from the host) before they die, or the guest
# has no kill to count
poll(lambda:H.evaluate("(j)=>{const C=CAMPS[j];return enemies.filter(e=>e.camp===C&&!e.dead).length}",C[0])>0,40000)
poll(lambda:G.evaluate("(j)=>{const C=CAMPS[j];return enemies.filter(e=>e.mir&&!e.dead&&Math.hypot(e.m.position.x-C.x,e.m.position.z-C.z)<25).length}",C[0])>=H.evaluate("(j)=>{const C=CAMPS[j];return enemies.filter(e=>e.camp===C&&!e.dead).length}",C[0]),30000)
n=H.evaluate("""(j)=>{const C=CAMPS[j];const L=enemies.filter(e=>e.camp===C&&!e.dead);L.forEach(e=>{e.lhH=0;kill(e)});return L.length}""",C[0])
CLR="(j)=>{const C=CAMPS[j];return {clr:campCleared(C),ev:__ev,xp:hero.xp+hero.lvl*1e6-__xp0,chest:CHESTS.length-__ch0}}"
poll(lambda:(lambda r:r['clr'] and r['ev'].get('camp',0)>=1 and r['ev'].get('kill',0)>=1 and r['xp']>0 and r['chest']>=1)(G.evaluate(CLR,C[0])),40000)
r=G.evaluate(CLR,C[0])
chk('camp clear shared',n>0 and r['clr'] and r['ev'].get('camp',0)>=1 and r['xp']>0 and r['chest']>=1,json.dumps([n,r]))
chk('partner kills count',r['ev'].get('kill',0)>=1,json.dumps(r['ev']))
# ---- a host monster goes for the guest's companion ----
r=G.evaluate("()=>[party.length,fols.length,!!(fols[0]&&fols[0].visible)]")
print('guest companions',r)
poll(lambda:H.evaluate("()=>{const R=Object.values(MP.rh)[0];return !!(R&&R.fl&&R.fl[0])}"),20000)
r=H.evaluate("""()=>{const R=Object.values(MP.rh)[0];if(!R||!R.fl||!R.fl[0])return 'no ghost';const g=R.fl[0];enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});
  const h=R.m.position,dx=g.position.x-h.x,dz=g.position.z-h.z,l=Math.hypot(dx,dz)||1;const e=spawnEnemy('goo',g.position.x+dx/l*2.5,g.position.z+dz/l*2.5,3,{});e.agg=1;
  const p0=AG150.pref;AG150.pref=0;let tg;try{tg=eTarget(e,e.m,e.m.position.distanceTo(pl.position))}finally{AG150.pref=p0}const ok=tg===g;
  window.__ag=[e,g];MP.tE=0;return [ok,+e.m.position.distanceTo(g.position).toFixed(1)]}""")
# the goo gets its shared id with the next snapshot, and the guest must have its copy before the bite is sent
poll(lambda:H.evaluate("()=>!!__ag[0].nid") and G.evaluate("(id)=>!!MP.emap[id]",H.evaluate("()=>__ag[0].nid")),20000)
r=r+[H.evaluate("()=>{const [e,g]=__ag;MP.evq.length=0;e.cd=0;mStart(e,g,'bite');const q=MP.evq.find(q=>q[0]==='a');return q&&q[3]}")]
chk('monster targets partner companion',isinstance(r,list) and r[0] and isinstance(r[-1],str) and '#0' in r[-1],json.dumps(r))
poll(lambda:G.evaluate("()=>enemies.some(e=>e.mir&&e.atk&&e.atk.tg===fols[0])"),15000)
r2=G.evaluate("()=>{const e=enemies.find(e=>e.mir&&e.atk);return e?[e.atk.tg===fols[0],e.atk.n]:null}")
chk('owner plays it on its companion',r2 is not None and r2[0],json.dumps(r2))
# ---- decal on the partner goes away ----
A.evaluate("()=>{MPV.cap=1;try{const D=kqsDecal(pl.position.clone(),2,0x7ae04a,.2,.6);window.__D=D}finally{MPV.cap=0}}")
poll(lambda:B.evaluate("()=>Object.keys(V150.dec).length>=1"),20000)
d1=B.evaluate("()=>Object.keys(V150.dec).length")
A.evaluate("()=>{MPV.cap=1;try{__D.rm(200)}finally{MPV.cap=0}}")
poll(lambda:B.evaluate("()=>Object.keys(V150.dec).length==0"),20000)
d2=B.evaluate("()=>Object.keys(V150.dec).length")
chk('partner decal removed',d1>=1 and d2==0,json.dumps([d1,d2]))
# ---- the partner's mount ----
A.evaluate("()=>{inCombatNow=()=>false;if(!mounts.length){mounts.push({id:1,k:'pony',n:'Pony',spd:10,cap:30,dist:0});mActive=1};toggleMount();MP.lastPres=''}")
poll(lambda:B.evaluate("()=>{const R=Object.values(MP.rh)[0];return !!(R&&R.mt150)}"),20000)
r=B.evaluate("()=>{const R=Object.values(MP.rh)[0];if(!R)return [false,'no partner',null];return [!!R.mt150,R.mt150&&R.mt150.k,R.m&&+R.m.children[0].position.y.toFixed(2)]}")
chk('partner mount shown',r[0],json.dumps(r))
A.evaluate("()=>{dismount();MP.lastPres=''}")
poll(lambda:B.evaluate("()=>{const R=Object.values(MP.rh)[0];return !!(R&&R.m&&!R.mt150&&Math.abs(R.m.children[0].position.y)<.01)}"),20000)
r=B.evaluate("()=>{const R=Object.values(MP.rh)[0];if(!R||!R.m)return [true,'no partner'];return [!!R.mt150,+R.m.children[0].position.y.toFixed(2)]}")
chk('partner mount gone',not r[0] and abs(r[1])<.01,json.dumps(r))
# ---- Duskhold: the host's kingdom ----
KH=A if A.evaluate("()=>dk150Host()===MP.me") else B
KG=B if KH is A else A
print('kingdom host',KH.evaluate("()=>hero.name"))
KH.evaluate("()=>{gold+=99999;['wood','stone','iron','fiber','crystal','clay','bone','petals','glowcap'].forEach(k=>mats[k]=(mats[k]||0)+999);const o=SHOPS.find(o=>!shopBuilt(o.k)&&!o.g||true);window.__hk=SHOPS.filter(o=>!shopBuilt(o.k)).map(o=>o.k);if(__hk[0]){shopBuy(__hk[0])};return __hk}")
own=KG.evaluate("()=>JSON.stringify(SH.shop)")
for pg in (A,B):pg.evaluate("()=>{goHome&&goHome()}")
poll(lambda:KG.evaluate("()=>DK150.on") and KG.evaluate("()=>JSON.stringify(SH.shop)")==KH.evaluate("()=>JSON.stringify(SH.shop)"),40000)
r=KG.evaluate("()=>[DK150.on,JSON.stringify(SH.shop),MP.rg]")
hs=KH.evaluate("()=>JSON.stringify(SH.shop)")
chk('guest shows host kingdom',r[0] and r[1]==hs,json.dumps([r,hs,own]))
# guest pays for a decoration
k=KG.evaluate("()=>{gold+=99999;['wood','stone','iron','fiber','crystal','clay','bone','petals','glowcap'].forEach(k=>mats[k]=(mats[k]||0)+999);const D=DECO103.find(D=>SH.deco[D.k]==null);if(!D)return null;window.__g0=gold;dcBuy103(D.k);return [D.k,__g0-gold]}")
poll(lambda:KH.evaluate("(k)=>SH.deco[k]==1",k[0] if k else '') and KG.evaluate("(k)=>SH.deco[k]==1",k[0] if k else ''),30000)
hd=KH.evaluate("(k)=>[SH.deco[k],gold]",k[0] if k else '')
gd=KG.evaluate("(k)=>SH.deco[k]",k[0] if k else '')
chk('guest build goes to host',k is not None and hd[0]==1 and gd==1,json.dumps([k,hd,gd]))
# v190: the remodelled decorations look the same for both (same meshes, vertices, spots and colliders), the moved obelisk too
DSIG="""()=>{const T=TOWNS[0];['obelisk','statue','torches','pavilion','beacon'].forEach(k=>{if(SH.deco[k]==null){SH.deco[k]=1}});dc103Sync();
  return DECO103.filter(D=>SH.deco[D.k]===1&&DC103.g[D.k]).map(D=>{let n=0,v=0;DC103.g[D.k].traverse(m=>{if(m.isMesh&&m.geometry){n++;v+=m.geometry.attributes.position.count}});
    return [D.k,n,v,(DC103.col[D.k]||[]).map(c=>[+(c.x-T.cx).toFixed(2),+(c.z-T.cy).toFixed(2)]).join(';')]})}"""
dh=KH.evaluate(DSIG);dg=KG.evaluate(DSIG)
ob=KH.evaluate("()=>{const T=TOWNS[0],c=DC103.col.obelisk&&DC103.col.obelisk[0];return c?(+(c.x-T.cx).toFixed(2))+','+(+(c.z-T.cy).toFixed(2)):''}")
dif=[[a,b] for a,b in zip(dh,dg) if a!=b]+([['count',len(dh),len(dg)]] if len(dh)!=len(dg) else [])
chk('v190 decorations identical for host and guest',dh==dg and any(q[0]=='obelisk' and q[2]>0 and q[3]==ob for q in dh) and ob=='13.9,10.47',json.dumps([ob,dif])[:1400]) # v196: the obelisk stands in the ring-A gap at 127 degrees
# v196: the round town's buildings at the host's levels (a Trading Post upgrade), and the same sealed entryways
KH.evaluate("()=>{gold+=1e6;for(const k of Object.keys(RES))mats[k]=9999;shpBuy109('post')}")
poll(lambda:KH.evaluate("()=>DM196TP.lv")>0 and KG.evaluate("()=>DM196TP.lv")==KH.evaluate("()=>DM196TP.lv"),40000)
r=[KH.evaluate("()=>[DM196TP.lv,SHP109.lv.post|0]"),KG.evaluate("()=>[DM196TP.lv,SHP109.lv.post|0]")]
chk('v196 partner sees the Trading Post at the host level',r[0][0]>0 and r[0]==r[1],json.dumps(r))
r=[pg.evaluate("()=>[DM196P.seal.map(s=>s?s.g.visible:null).join(','),!!DM196I.g,DM196P.trees.length,!!(TOWNS[0].tv&&TOWNS[0].mp)]") for pg in (KH,KG)]
chk('v196 same seals, inn and forest for host and guest',r[0]==r[1] and r[0][1] and r[0][2]>10,json.dumps(r))
# v197: the townsfolk have relaxed arms on both sides (every client builds the folk with the same arm data)
ASIG="""()=>{const L=[];try{(CZ103.live||[]).forEach(o=>{if(o.g)L.push(o.g)})}catch(e){}try{(npc.all||[]).forEach(g=>L.push(g))}catch(e){}
  let n=0,r=0;const E={};L.forEach(g0=>{const g=g0.bones?g0:g0.children.find(c=>c.bones);if(!g||!g.bones.pelvis||!g.children.some(m=>m.isSkinnedMesh&&m.userData.fk))return;n++;const A=rlx197Of(g);if(A){r++;const sp=(g.children.find(m=>m.isSkinnedMesh&&m.userData.fk)||{userData:{}}).userData.fk;if(sp)E[sp]=A.E.aL1.map(v=>+v.toFixed(3)).join(',')}});
  return [n,r,Object.keys(E).sort().map(k=>k+':'+E[k]).join(';')]}"""
r=[pg.evaluate(ASIG) for pg in (KH,KG)]
PSIG="""()=>{const V=THREE.Vector3,out=[];for(const k in (MP.rh||{})){const m=MP.rh[k]&&MP.rh[k].m;if(!m||!m.bones||!m.bones.aL1)continue;m.updateMatrixWorld(true);
    const W=n=>m.bones[n].getWorldPosition(new V()),r={};['L','R'].forEach(sd=>{const s=W('a'+sd+'0'),e=W('a'+sd+'1'),w=W('a'+sd+'2'),u=s.sub(e).normalize(),v=w.sub(e).normalize();
      r[sd]=[+(180-Math.acos(Math.max(-1,Math.min(1,u.dot(v))))*180/Math.PI).toFixed(1),rlx197HEmpty(m,sd)]});out.push(r)}return out}"""
pp=[];emp=[]
for i in range(5):
    for pg in (KH,KG):
        q=pg.evaluate(PSIG);pp.append(q);emp+=[r[sd][0] for r in q for sd in ('L','R') if r[sd][1]]
    tick(400)
# the old fold was a steady ~51 degrees; relaxed it is ~17 standing (more on a forward walking swing), so the least seen is low
chk('v197 the partner hero empty hand hangs relaxed on the other screen',len(emp)>0 and min(emp)<=30,json.dumps(pp)[:600])
chk('v197 relaxed folk arms for host and guest',r[0][0]>0 and r[0][1]==r[0][0] and r[1][1]==r[1][0] and r[1][0]>0,json.dumps(r)[:600])
# the guest's save still holds its own kingdom
r=KG.evaluate("()=>{const o=x2Save();return [JSON.stringify(o.shp),JSON.stringify(o.kdeco||{})]}")
chk('guest save keeps own kingdom',r[0]==own,json.dumps([r,own]))
# leaving: own kingdom back
KG.evaluate("()=>{mpUse(null)}")
poll(lambda:KG.evaluate("(o)=>!DK150.on&&JSON.stringify(SH.shop)===o",own),20000)
r=KG.evaluate("()=>[DK150.on,JSON.stringify(SH.shop)]")
chk('own kingdom back after leaving',not r[0] and r[1]==own,json.dumps([r,own]))
print('V150_COOP','PASS' if not fails else 'FAIL',fails)
