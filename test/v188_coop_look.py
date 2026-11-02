# v188 co-op look: what a partner sees of the recent visual work (companion models and evolutions, wings moving, the raven's
# wand hold, an evolved cast's second colour and lightning, no page errors from replayed effects).
# Run: python3 v188_coop_look.py   (opens the two co-op windows through mpt.py; A = warrior, B = mage)
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json
for pg in (A,B):pg.evaluate("()=>FAST()")
def tick(ms):
    for i in range(max(1,ms//400)):
        (A if i%2 else B).bring_to_front();A.wait_for_timeout(400)
def poll(f,ms=40000):
    import time;t0=time.time()
    while True:
        try:
            if f():return True
        except Exception as e:
            if 'closed' in str(e):raise
        if (time.time()-t0)*1000>=ms:return False
        tick(400)
def chk(name,ok,info=''):print(('PASS ' if ok else 'FAIL ')+name,info,flush=True)
# stand together
p=A.evaluate("()=>{const p=PMAP[0].ins[0].path[60];return p}")
A.evaluate("(p)=>toPos(p[0],p[1])",p);B.evaluate("(p)=>toPos(p[0]+2.2,p[1]+1)",p)
H,G=mp_roles(60000)
# 1. B's companions: an evolved dragon and an evolved bird
B.evaluate("""()=>{const a=mkC('Gravewyrm',30,0,'');a.evo=3;a.z=1;a.tr='Horned';const b=mkC('Skyhawk',30,0,'');b.evo=2;b.z=1;party[0]=a;party[1]=b}""")
SIG="""(g)=>{let v=0,n=0;g.traverse(m=>{if(m.geometry&&m.geometry.attributes&&m.geometry.attributes.position){n++;v+=m.geometry.attributes.position.count}});return [n,v]}"""
def mine(i):return B.evaluate("(i)=>{if(!party[i])return null;const g=cr(party[i]);let v=0,n=0;g.traverse(m=>{if(m.geometry&&m.geometry.attributes&&m.geometry.attributes.position){n++;v+=m.geometry.attributes.position.count}});return [party[i].n,evo100Lv(party[i]),n,v]}",i)
def theirs(i):return A.evaluate("(i)=>{const r=Object.values(MP.rh)[0];const g=r&&r.fl&&r.fl[i];if(!g||!g.mpC)return null;let v=0,n=0;g.traverse(m=>{if(m.geometry&&m.geometry.attributes&&m.geometry.attributes.position){n++;v+=m.geometry.attributes.position.count}});return [g.mpC.n,evo100Lv(g.mpC),n,v,g.visible]}",i)
for sp,ev in (('Gravewyrm',3),('Skyhawk',2)):
    B.evaluate("([s,e])=>{const a=mkC(s,30,0,'');a.evo=e;a.z=1;a.tr='Horned';party[0]=a}",[sp,ev])
    poll(lambda:(theirs(0) or [0])[0]==sp,60000)
    m,t=mine(0),theirs(0)
    chk('partner sees %s at the same evolution, same model'%sp,bool(m and t and m[:4]==t[:4]),json.dumps({'own (fresh build)':m,'partner sees':t,'own follower now':B.evaluate("()=>{let v=0,n=0;fols[0].traverse(m=>{if(m.geometry&&m.geometry.attributes&&m.geometry.attributes.position){n++;v+=m.geometry.attributes.position.count}});return [n,v]}")}))
# a plain stage-0 dragon for contrast: the evolved one must differ from it
r=A.evaluate("()=>{const c=mkC('Gravewyrm',30,0,'');c.evo=0;c.z=1;c.tr='Horned';const g=cr(c);let v=0;g.traverse(m=>{if(m.geometry&&m.geometry.attributes&&m.geometry.attributes.position)v+=m.geometry.attributes.position.count});return [evo100Lv(c),v]}")
print('stage-0 Gravewyrm for contrast',r)
# 2. wings move on the partner's copy (rig animated every frame)
w=A.evaluate("()=>{const r=Object.values(MP.rh)[0],g=r.fl[0];const q=[];g.traverse(o=>{if(o.isBone)q.push(o.quaternion.clone())});window.__wq=[g,q];return q.length}")
tick(1600)
d=A.evaluate("()=>{const [g,q]=__wq;let i=0,mx=0;g.traverse(o=>{if(o.isBone){mx=Math.max(mx,o.quaternion.angleTo(q[i]));i++}});return +mx.toFixed(3)}")
chk('partner bird companion animates',d>0.01,json.dumps({'bones':w,'max bone turn':d}))
# 3. the mage's wand: own screen vs what the partner sees
B.evaluate("""()=>{const tp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls==hero.cls&&itT({tp:i,lv:1,r:1,up:0,aff:[]}).wt=='wand');eq.weapon={id:9e4+tp,tp,lv:30,req:1,r:2,up:0,aff:[]};refreshGear()}""")
poll(lambda:A.evaluate("()=>{const r=Object.values(MP.rh)[0];return !!(r&&r.m&&(r.m.gearG||[]).some(o=>o.userData&&o.userData.wt=='wand'&&o.parent))}"),40000)
A.evaluate("""()=>{window.__wa=[];const f=fc116Apply;fc116Apply=function(H){const r=f.apply(this,arguments);const R=Object.values(MP.rh)[0];if(R&&H===R.m){const W=(H.gearG||[]).find(o=>o.userData&&o.userData.wt=='wand'&&o.parent);if(W){const d=new THREE.Vector3(0,1,0).applyQuaternion(W.getWorldQuaternion(new THREE.Quaternion()));__wa.push([H._wa186==null?null:+H._wa186.toFixed(2),+d.y.toFixed(2)])}}return r}}""")
B.evaluate("""()=>{window.__wb=[];const f=fc116Apply;fc116Apply=function(H){const r=f.apply(this,arguments);if(H===pl){const W=(H.gearG||[]).find(o=>o.userData&&o.userData.wt=='wand'&&o.parent);if(W){const d=new THREE.Vector3(0,1,0).applyQuaternion(W.getWorldQuaternion(new THREE.Quaternion()));__wb.push([H._wa186==null?null:+H._wa186.toFixed(2),+d.y.toFixed(2)])}}return r}}""")
B.evaluate("()=>{for(const e of enemies)e.agg=0}")
for i in range(4):
    B.evaluate("()=>{try{swing()}catch(e){console.warn(e)}}");tick(800)
tick(1200)
wa=A.evaluate("()=>__wa");wb=B.evaluate("()=>__wb")
def spread(L):
    ys=[x[1] for x in L];return [len(L),min(ys) if ys else None,max(ys) if ys else None,sorted(set(str(x[0]) for x in L))[:4]]
print('wand on own screen  [samples, min up, max up, hold weights]',spread(wb))
print('wand on partner     [samples, min up, max up, hold weights]',spread(wa))
sa,sb=spread(wa),spread(wb)
chk('partner wand uses the v186 hold',any(x[0] is not None for x in wa),json.dumps(sa))
chk('partner wand stays in line like on the own screen',sa[0]>20 and sb[0]>20 and sa[2] is not None and sa[2]<=sb[2]+.25,json.dumps({'own':sb,'partner':sa}))
# 4. an evolved cast's second colour and its second lightning bolt reach the partner
A.evaluate("()=>{window.__fb=[];const f=fx186Bolt;fx186Bolt=function(a,b,col){__fb.push(evxCol(col));return f.apply(this,arguments)}}")
B.evaluate("""()=>{const p=pl.position,a=new THREE.Vector3(p.x,p.y+1.5,p.z),b=new THREE.Vector3(p.x+3,p.y+.5,p.z);const o=EV137.cur,oc=MPV.cap;
  EV137.cur={sk:{},cls:hero.cls,col:0x6040ff,c1:0x6040ff,c2:0x12ab34};MPV.cap=1;try{bolt(a,b,0x6040ff)}finally{EV137.cur=o;MPV.cap=oc}}""")
poll(lambda:A.evaluate("()=>__fb.length>0"),30000)
fb=A.evaluate("()=>__fb")
chk('partner draws the evolved second bolt in the second colour',0x12ab34 in fb,json.dumps(fb))
# 4b. v189: a Devoted companion's glow reaches the partner (look field dvd)
B.evaluate("()=>{const a=mkC('Foxlet',30,0,'');a.z=1;a.dvp=2800;party[0]=a;leadK[0]=''}")
poll(lambda:A.evaluate("()=>{const r=Object.values(MP.rh)[0],g=r&&r.fl&&r.fl[0];return !!(g&&g.mpC&&g.mpC.n=='Foxlet'&&g.getObjectByName('dv189'))}"),60000)
dv=[B.evaluate("()=>!!(fols[0]&&fols[0].getObjectByName('dv189'))"),A.evaluate("()=>{const r=Object.values(MP.rh)[0],g=r&&r.fl&&r.fl[0];return !!(g&&g.getObjectByName('dv189'))}")]
chk('partner sees the Devoted glow (v189)',dv==[True,True],json.dumps({'own':dv[0],'partner':dv[1]}))
# 5. replayed effects throw nothing on either screen
tick(1500)
errs=[l for k in 'AB' for l in logs[k] if 'PAGEERROR' in l or 'v105 cast' in l]
chk('no page errors from replayed effects',not errs,json.dumps(errs[:3])[:400])
