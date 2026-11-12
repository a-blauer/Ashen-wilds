# v225 co-op: a partner sees the new hero looks (pattern, war paint, scar, underside: the same painted model; head size and
# tail length on the same bones) and the Paladin's shield held up in front while guarding.
# Run: python3 v225_coop.py   (opens the two co-op windows through mpt.py)
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json
for pg in (A,B):pg.evaluate("()=>FAST()")
def chk(name,ok,info=''):print(('PASS ' if ok else 'FAIL ')+name,info,flush=True)
p=A.evaluate("()=>PMAP[0].ins[0].path[60]")
A.evaluate("(p)=>toPos(p[0],p[1])",p);B.evaluate("(p)=>toPos(p[0]+2.2,p[1]+1)",p)
H,G=mp_roles(60000)
# 1. B's look: every new field
B.evaluate("()=>{hero.look=lkClean(Object.assign({},hero.look||{},{pat:1,pc:'#ece4d4',bel:2,fp:3,fpc:'#2a58a8',scar:2,hs:1.1,tl:1.25}));heroRebuild();MP.lastPres=''}")
own=B.evaluate("()=>({key:pl._mdKey,hs:+pl.bones.head.scale.x.toFixed(3),cls:hero.cls})")
ok=mp_until("(k)=>{const r=Object.values(MP.rh)[0];return !!(r&&r.m&&r.m._mdKey===k)}",60000,[A],own['key'])
seen=A.evaluate("()=>{const r=Object.values(MP.rh)[0];return r&&r.m?{key:r.m._mdKey,hs:+r.m.bones.head.scale.x.toFixed(3),lk:r.m.mdLook&&{pat:r.m.mdLook.pat,fp:r.m.mdLook.fp,scar:r.m.mdLook.scar,bel:r.m.mdLook.bel,tl:r.m.mdLook.tl}}:null}")
chk('partner builds the same painted model',ok and seen and seen['key']==own['key'],json.dumps({'own':own,'partner':seen}))
chk('partner sees the same head size',bool(seen) and abs(seen['hs']-own['hs'])<.01,json.dumps(seen))
tl=B.evaluate("()=>{const D=BRD[pl._race],n=D&&D.TB&&D.TB[1];return n?+pl.bones[n].position.length().toFixed(4):null}")
tl2=A.evaluate("()=>{const r=Object.values(MP.rh)[0],D=BRD[r.m._race],n=D&&D.TB&&D.TB[1];return n?+r.m.bones[n].position.length().toFixed(4):null}")
chk('partner sees the same tail length',tl is None or (tl2 is not None and abs(tl-tl2)<.002),json.dumps([tl,tl2]))
# 2. B as a Paladin raises the shield: the partner's copy holds it in front the same way
B.evaluate("()=>{hero.cls='paladin';hero.look=null;heroRebuild();refreshGear(pl,'paladin',eq);MP.lastPres=''}")
mp_until("()=>{const r=Object.values(MP.rh)[0];return !!(r&&r.m&&r.m.cls==='paladin')}",60000,[A])
SH="""(H)=>{const sh=H.gearG[H.gearG.length-1],V=THREE.Vector3,a=H.rotation.y,fw=new V(Math.sin(a),0,Math.cos(a)),c=sh.getWorldPosition(new V()).sub(H.position),n=new V(0,0,-1).applyQuaternion(sh.getWorldQuaternion(new THREE.Quaternion()));return [+c.dot(fw).toFixed(2),+n.dot(fw).toFixed(2)]}"""
B.evaluate("()=>{gd213Down()}")
B.wait_for_timeout(2500);A.wait_for_timeout(1500)
own=B.evaluate("()=>{gd213Down();return ("+SH+")(pl)}")
seen=A.evaluate("()=>{const r=Object.values(MP.rh)[0];return ("+SH+")(r.m)}")
chk('partner sees the shield up in front',seen[0]>.25 and abs(seen[1])>.75,json.dumps({'own [forward, face]':own,'partner':seen}))
B.evaluate("()=>gd213Up()")
