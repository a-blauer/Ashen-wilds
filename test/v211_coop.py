# v211 co-op: a thrown knife reaches the partner as a knife (the 'L' message's last field = 2), spinning, not as an arrow.
# Run: python3 mpt.py v211_coop.py
if 'A' not in globals():
    import os,sys,subprocess;sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'mpt.py'),os.path.abspath(__file__)]))
import json,os
LIB=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v100_anim_lib.js')).read()
fails=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,info)
    if not ok:fails.append(name)
for pg in (A,B):pg.evaluate("()=>{FAST();window.__hp=setInterval(()=>{hero.hp=heroMax();hero.iv=1e9},100);const P=INSL[5].path,q=P[Math.floor(P.length*.15)];toPos(q[0]+(MP.me<'m'?0:1.5),q[1])}")
mp_roles(60000)
chk('the partners see each other',mp_until("()=>Object.values(MP.rh||{}).some(r=>r&&r.act)",30000))
# the partner counts what arrives: knives (and how they spin) and arrows
B.evaluate("""()=>{window.__kn={knife:0,spin:0};const a=scene.add;scene.add=function(){for(const o of arguments){if(!o||!o.userData)continue;
  if(o.userData.kn211){__kn.knife++;const pv=o.userData.kn211pv;setTimeout(()=>{let m=null;o.traverse(x=>{if(!m&&x.isMesh&&x.onBeforeRender)m=x});try{m.onBeforeRender()}catch(_){}__kn.spin=Math.max(__kn.spin,pv.rotation.x)},150)}
  }return a.apply(this,arguments)}}""")
A.evaluate("(s)=>{(0,eval)(s)}",LIB)
A.evaluate("""()=>{V100T.equip('knives');refreshGear(pl,hero.cls,eq);let i=0;const go=()=>{if(i++>=3)return;HA.cur=null;atkCd=0;tgt=null;swing();setTimeout(go,700)};go()}""")
A.wait_for_timeout(3500)
own=A.evaluate("()=>shots.filter(s=>s.kn211).length+'/'+shots.length")
got=B.evaluate("()=>__kn")
chk('the partner draws the thrown knives as knives',got['knife']>=1,json.dumps(got))
chk('they spin on the partner\'s screen too',got['spin']>.3,json.dumps(got))
if fails:print('FAILED',fails)
else:print('v211 co-op: checked')
