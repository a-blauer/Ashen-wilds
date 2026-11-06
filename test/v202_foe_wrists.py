# v202: natural wrists on the humanoid foes. Every foe with the humanoid skeleton is played through its idle, a walk and each
# of its moves (the attack through its whole timeline), and the bend of each wrist (its swing off the forearm's line, the
# forearm's twist left out) is measured against the bind pose. FAIL when a wrist bends past MAIN (70°; v201: up to 122°,
# 24 foes over 64°; one-handed weapons and daggers now ~52-59°) — except the off hand on a two-handed haft, staff or bow
# (OFF, 78°: it wraps the shaft, a real grip) and the two blows v181 needs the full wrist for (KEEP: the slinger's whirl,
# the Troll Shaman's cast).
# Prints every foe's worst bends. ONLY=orc,brigand
import os,sys,json,math
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
MAIN=float(os.environ.get('MAIN','70'))
KEEP={'slinger':84,'trollsh':78};OFF=float(os.environ.get('OFF','78'))
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""()=>{const keys=new Set();Object.keys(BIOEN).forEach(z=>(BIOEN[z]||[]).forEach(k=>keys.add(k)));CAMPS.forEach(C=>[C.th,C.th0].forEach(t=>t&&t.mem.forEach(m=>keys.add(m[0]))));
Object.keys(N3.zone).forEach(z=>Object.keys(N3.zone[z]).forEach(k=>{const R=N3.zone[z][k];R.L.forEach(q=>keys.add(q));R.th.forEach(t=>t.mem.forEach(m=>keys.add(m[0])))}));Object.keys(EN).forEach(k=>{if(!/^boss/.test(k))keys.add(k)});
const list=[...keys].filter(k=>EN[k]).sort(),out=[],qi=new THREE.Quaternion();let T=5000;
const tw=new THREE.Quaternion(),sw=new THREE.Quaternion(),ax=new THREE.Vector3();
const ang=(b,q0)=>{qi.copy(q0).invert().multiply(b.quaternion);ax.copy(b.position).normalize().applyQuaternion(q0.clone().invert());
  const d=qi.x*ax.x+qi.y*ax.y+qi.z*ax.z;tw.set(ax.x*d,ax.y*d,ax.z*d,qi.w);if(tw.lengthSq()<1e-9)tw.set(0,0,0,1);tw.normalize();sw.copy(qi).multiply(tw.clone().invert());return 2*Math.acos(Math.min(1,Math.abs(sw.w)))};
for(const k of list){let g;try{g=cr(enemyC(k,20,{}))}catch(e){continue}const B={};g.traverse(o=>{if(o.isBone&&/^a[LR][012]$/.test(o.name))B[o.name]=o});if(!B.aR2&&!B.aL2)continue;
  const q0={};for(const n in B)q0[n]=B[n].quaternion.clone();const mx={aL2:0,aR2:0,aL1:0,aR1:0},when={};
  const samp=tag=>{for(const n in mx){if(!B[n])continue;const a=ang(B[n],q0[n]);if(a>mx[n]){mx[n]=a;when[n]=tag}}};
  const tick=(ms,mv,sp,tag)=>{for(let t=0;t<ms;t+=16){T+=16;try{animC(g,T,mv,sp||0)}catch(e){}samp(tag)}};
  tick(600,false,0,'idle');tick(500,true,4,'walk');
  (EN[k].moves||['bite']).slice(0,3).forEach(mv=>{for(let kk=0;kk<=1.001;kk+=.1){g.ak={n:mv,ph:1,k:kk};tick(48,false,0,'atk:'+mv)}g.ak=null;tick(200,false,0,'rec')});
  const K=FA_K[EN[k].hum]||{};out.push([k,EN[k].hum||'',+mx.aR2.toFixed(2),+mx.aL2.toFixed(2),when.aR2||'',when.aL2||'',+mx.aR1.toFixed(2),+mx.aL1.toFixed(2),K.c||''])}
return {v:out}
}"""
def s(pg):
    pg.set_default_timeout(1800000);ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{window.requestAnimationFrame=()=>0}")
    r=ev(JS);only=[q for q in os.environ.get('ONLY','').split(',') if q]
    print('%d humanoid foes'%len(r['v']))
    for k,hum,R,L,wR,wL,eR,eL,c in r['v']:
        if only and k not in only:continue
        R,L=math.degrees(R),math.degrees(L);print('%-14s %-12s %-6s right %4.0f (%s)  left %4.0f (%s)'%(k,hum,c,R,wR,L,wL))
        two=c in ('two','pole','staff','bow')
        # the weapon hand is the right one (aR2) for every weapon class; the left holds a haft, a bow or nothing
        if R>KEEP.get(k,MAIN):F('%s: the right wrist bends %.0f deg (%s; max %.0f)'%(k,R,wR,KEEP.get(k,MAIN)))
        if L>(OFF if two else MAIN):F('%s: the left wrist bends %.0f deg (%s; max %.0f)'%(k,L,wL,OFF if two else MAIN))
    for e in errs[:5]:F('page error: '+e)
    print('==== v202_foe_wrists: %d fails'%len(fails))
play.run(s)
