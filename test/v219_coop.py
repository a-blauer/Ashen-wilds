# v219 co-op: a thrown shuriken reaches the partner as the thrower's own held model (a star, spinning flat), built from the
# partner's copy of the thrower's gear (3910 kn211Mesh(r.m)), not the plain dagger.
# Run: python3 mpt.py v219_coop.py
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
  if(o.userData.kn211){__kn.knife++;if(o.userData.kn218==='star')__kn.star=(__kn.star||0)+1;const pv=o.userData.kn211pv;setTimeout(()=>{let m=null;o.traverse(x=>{if(!m&&x.isMesh&&x.onBeforeRender)m=x});try{m.onBeforeRender()}catch(_){}__kn.spin=Math.max(__kn.spin,Math.abs(pv.rotation.y))},150)}
  }return a.apply(this,arguments)}}""")
A.evaluate("(s)=>{(0,eval)(s)}",LIB)
A.evaluate("""()=>{const idx=ITPL.findIndex(t=>t.sl=='weapon'&&t.n=='Blackstar Shuriken');hero.cls='assassin';hero.lvl=Math.max(hero.lvl,60);eq.weapon={id:918300,tp:idx,r:2,req:1,up:0,n:'Blackstar Shuriken'};refreshGear(pl,hero.cls,eq);try{mpPresence(performance.now())}catch(_){}let i=0;const go=()=>{if(i++>=3)return;HA.cur=null;atkCd=0;tgt=null;swing();setTimeout(go,700)};go()}""")
A.wait_for_timeout(3500)
own=A.evaluate("()=>shots.filter(s=>s.kn211).length+'/'+shots.length")
got=B.evaluate("()=>__kn")
chk('the partner draws the thrown shuriken as stars',got['knife']>=1 and got.get('star',0)>=1,json.dumps(got))
chk('they spin flat on the partner\'s screen too',got['spin']>.3,json.dumps(got))
if fails:print('FAILED',fails)
else:print('v219 co-op: checked')
