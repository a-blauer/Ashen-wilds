# v100 anim track: hero basic-attack swings (every melee weapon type and combo step), humanoid foe strikes, bow carry.
#   python3 v100_anim.py                         checks + sheets of the current build (TAG=after)
#   SRC=<old dist> TAG=before python3 v100_anim.py   sheets + hit frames of another build (written to out/v100_before.json)
#   BAKE=1 python3 v100_anim.py                  re-bake src/js/1705-v100-anim-baked-keys.js from test/v100_anim_moves.js
#                                                (IK on the real skeleton in the page), rebuild, then run the checks
#   WT=gs,mace  NOSHOT=1                         limit weapon types / skip the sheets
# Sheets (out/): v100_<TAG>_<weapon>.png  (per combo step: front and weapon-side views, 12 frames from start to rest;
#   the yellow line is the weapon tip's path, the HIT frame is the game's hit moment), v100_<TAG>_bow.png (bow carry: idle,
#   walk, combat stance, riding, creator preview, archer foes + their shot), v100_<TAG>_bowbig.png, v100_<TAG>_foes.png.
# Checks: hit frame and duration of every move equal to the before build (when out/v100_before.json exists), weapon tip
#   direction at contact per move (forehand right→left, backhand left→right, overhead/chop down, thrust forward, rising up),
#   two-handers keep the off hand on the handle at contact, no NaN, bow carry: hand at the riser, string clear of the hand,
#   no part of the bow inside the body, lower limb clear of the ground and the legs through a walk/run cycle, bow shot frames.
import play,json,base64,os,sys,subprocess,math
TAG=os.environ.get('TAG','after');NOSHOT=os.environ.get('NOSHOT');HERE=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(HERE)
STEPS={'sword':0,'gs':3,'ga':3,'mace':3,'hammer':3,'axes':4,'dagger':4,'claws':5,'halberd':3,'flail':2,'knives':1,'sling':1}
WT=[w for w in os.environ.get('WT',','.join(k for k in STEPS if STEPS[k])).split(',') if w]
# expected tip motion at contact: (axis, sign, which hand). Forehand = the weapon hand moves toward the off side (−x);
# mirrored moves are played by the left hand.
DIR={'gs':[('x',-1,'R'),('x',1,'R'),('y',-1,'R')],'ga':[('x',-1,'R'),('x',1,'R'),('y',-1,'R')],'mace':[('x',-1,'R'),('x',1,'R'),('y',-1,'R')],
     'hammer':[('x',-1,'R'),('x',1,'R'),('y',-1,'R')],'axes':[('x',-1,'R'),('x',1,'L'),('y',-1,'R'),('y',-1,'R')],
     'dagger':[('x',-1,'R'),('x',1,'L'),('z',1,'R'),('y',1,'R')],'claws':[('x',-1,'R'),('x',1,'L'),('y',1,'R'),('y',1,'L'),('y',-1,'R')],
     'halberd':[('z',1,'R'),('z',1,'R'),('x',1,'R')],'knives':[('z',1,'R')]}
TWO={'gs':[0,1,2],'ga':[0,1,2],'halberd':[0,1,2]}
LIB=open(HERE+'/v100_anim_lib.js').read()
BAKEJS=open(HERE+'/v100_anim_bake.js').read()+'\n'+open(HERE+'/v100_anim_moves.js').read()
def ld(pg,src):pg.evaluate("(s)=>{(0,eval)(s)}",src)
def png(name,data):
    if NOSHOT:return
    open(play.TMP+'/'+name,'wb').write(base64.b64decode(data.split(',')[1]))
MEAS=r"""(a)=>{const [wt,N,shot]=a;const T=V100T,out={moves:[],sheet:null};
  const ks=[0,.14,.25,.3,.36,.39,.42,.45,.5,.58,.78,1],views=[[[.35,.3,1],'front'],[[1,.25,.35],'W side']];
  T.size(200,240);const C=shot?T.canvas(ks.length,N*views.length):null;
  for(let st=0;st<N;st++){
    // pass 1: the game's own 16 ms frames -> the hit frame
    const r1=T.play(wt,st,[],{dt:16});
    // pass 2: 4 ms frames (tip velocity at contact, two-hand grip) + the sheet
    const r2=T.play(wt,st,shot?ks:[],{dt:4,cx:C&&C.cx,row:st,views});
    const R=r2.rec,h=r2.hitF,vel={};
    ['R','L'].forEach(s=>{const tp=j=>{const q=R[j]&&R[j].tips.find(t=>t.s==s);return q?q.p:null};const a=tp(h-2),b=tp(h+2);if(a&&b)vel[s]=[0,1,2].map(i=>+((b[i]-a[i])/.016).toFixed(2))});
    // off hand to the weapon's shaft (grip → tip) at contact
    let two=null;const q=R[h];if(q){const t=q.tips.find(x=>x.s=='R');if(t){const g=new THREE.Vector3(...t.g),p=new THREE.Vector3(...t.p),hl=new THREE.Vector3(...q.hL),ab=p.clone().sub(g),u=Math.max(-.3/ab.length(),Math.min(1,hl.clone().sub(g).dot(ab)/ab.lengthSq()));two=+hl.distanceTo(g.clone().addScaledVector(ab,u)).toFixed(3)}}
    let nan=0,maxV=0;for(let j=0;j<R.length;j++){nan+=R[j].nan;if(j>0&&R[j].tips[0]&&R[j-1].tips[0]){const v=Math.hypot(...[0,1,2].map(i=>R[j].tips[0].p[i]-R[j-1].tips[0].p[i]))/.004;maxV=Math.max(maxV,v)}}
    out.moves.push({st,ms:+r1.ms.toFixed(2),hitAt:r1.hitAt,hitF:r1.hitF,n:r1.rec.length,vel,two,nan,maxV:+maxV.toFixed(1),errs:r1.errs.concat(r2.errs)})}
  if(C)out.sheet=C.c.toDataURL('image/png');T.size(180,230);return out}"""
BOWBIG=r"""()=>{const T=V100T;T.setup();T.size(300,380);const C=T.canvas(5,2),cx=C.cx,un=T.park(),o={cy:.75,dist:2.6};
try{T.equip('bow');HA.cur=null;pl.sw=0;let now=5e6;pl._at=now;pl._ga=null;IDL.combat=0;for(let i=0;i<80;i++){now+=16;animHero(now,false,pl);pl.rotation.y=0}
 T.shot(cx,0,0,[0,.1,1],'idle front',o);T.shot(cx,300,0,[-1,.1,0],'idle left side',o);T.shot(cx,600,0,[-.7,.3,.7],'idle 3/4 left',o);T.shot(cx,900,0,[.3,.2,-1],'idle back',o);T.shot(cx,1200,0,[.8,.2,.6],'idle 3/4 right',o);
 pl._ga=null;for(let i=0;i<30;i++){now+=16;pl.position.z+=.05;animHero(now,true,pl);pl.rotation.y=0}pl.position.z=0;T.shot(cx,0,380,[-1,.1,.1],'walk',o);
 for(let i=0;i<10;i++){now+=16;pl.position.z+=.05;animHero(now,true,pl);pl.rotation.y=0}pl.position.z=0;T.shot(cx,300,380,[-1,.1,.1],'walk +160 ms',o);
 for(let i=0;i<40;i++){now+=16;pl.position.z+=.11;animHero(now,true,pl);pl.rotation.y=0}pl.position.z=0;T.shot(cx,600,380,[-.8,.1,.5],'run',o);
 IDL.combat=1;for(let i=0;i<90;i++){now+=16;animHero(now,false,pl);pl.rotation.y=0}T.shot(cx,900,380,[-.7,.2,.7],'combat-ready 3/4',o);T.shot(cx,1200,380,[0,.1,1],'combat-ready front',o);IDL.combat=null;
}finally{un();T.size(180,230)}return C.c.toDataURL('image/png')}"""
CLEAR=r"""()=>{const T=V100T,V3=THREE.Vector3;T.setup();const un=T.park();const out={};
const segD=(p,a,b)=>{const ab=b.clone().sub(a),t=Math.max(0,Math.min(1,p.clone().sub(a).dot(ab)/ab.lengthSq()));return p.distanceTo(a.clone().addScaledVector(ab,t))};
function clear(h,root){root.updateMatrixWorld(true);const W=h.bones.aL2.children.find(o=>o.userData&&o.userData.wt=='bow');const b=h.bones,wp=o=>new V3().setFromMatrixPosition(o.matrixWorld);
  const segs=[[b.lh0,b.lh1],[b.lh1,b.lh2],[b.rh0,b.rh1],[b.rh1,b.rh2]].map(([a,c])=>[wp(a),wp(c)]);let mn=9,low=9;const s=root.scale.x||1;
  for(let i=0;i<=10;i++){const a=Math.PI*(.55+i*.09),p=new V3(Math.cos(a)*.55,Math.sin(a)*.56,0).applyMatrix4(W.matrixWorld);segs.forEach(q=>mn=Math.min(mn,segD(p,q[0],q[1])/s));low=Math.min(low,(p.y-root.position.y)/s)}
  return [mn,low]}
try{T.equip('bow');HA.cur=null;pl.sw=0;let now=6e6;pl._at=now;pl._ga=null;IDL.combat=0;
  for(let i=0;i<60;i++){now+=16;animHero(now,false,pl);pl.rotation.y=0}out.idle=clear(pl,pl);
  for(const [nm,sp] of [['walk',.05],['run',.11]]){let m=9,l=9;pl._ga=null;for(let i=0;i<120;i++){now+=16;pl.position.z+=sp;animHero(now,true,pl);pl.rotation.y=0;if(i>30){const c=clear(pl,pl);m=Math.min(m,c[0]);l=Math.min(l,c[1])}}out[nm]=[m,l]}
}finally{un()}
for(const key of Object.keys(HUMLOOK).filter(k=>HUMLOOK[k].wpn=='bow')){const g=mkHumanoid(key);T.sc.add(g);let t=7e6,m=9,l=9;for(let j=0;j<150;j++){t+=16;g.position.z+=.05;g.rig(t,true,3);if(j>30){const c=clear(g.h,g);m=Math.min(m,c[0]);l=Math.min(l,c[1])}}out[key+'Walk']=[m,l];
  g.position.set(0,0,0);for(let j=0;j<60;j++){t+=16;g.rig(t,false,3)}out[key+'Idle']=clear(g.h,g);T.sc.remove(g)}
for(const k in out)out[k]=out[k].map(v=>+v.toFixed(3));return out}"""
# a bow shot still draws and releases: riser in the left hand, arrow nocked while drawing (from v93_grip)
BOWSHOT=r"""()=>{const T=V100T,V3=THREE.Vector3;T.setup();const un=T.park(),fr=[];
try{T.equip('bow');let now=9e6;HA.cur=null;atkCd=0;pl._at=now;bowAnim(900);const AC=HA.cur;pl.rotation.y=0;
  for(const k of [.1,.25,.4,.5,.56,.7,.95]){let n=0;while(HA.cur===AC&&AC.k<k&&n++<400){now+=16;animHero(now,false,pl);pl.rotation.y=0}
    const W=pl.gearG.find(o=>o.userData.wt=='bow');pl.updateMatrixWorld(true);const F=BOW_FX;
    fr.push({k,riser:T.r3(new V3(-.555,0,0).applyMatrix4(W.matrixWorld)),handL:T.r3(new V3(0,-.035,.01).applyMatrix4(pl.bones.aL2.matrixWorld)),arrow:F&&F.g.visible&&F.arrow.visible?1:0})}
  AC&&AC.end&&AC.end()}finally{HA.cur=null;un()}return fr}"""
def boot(pg):
    pg.evaluate("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=300000);pg.click('[data-c="warrior"]',timeout=300000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{window.requestAnimationFrame=f=>0}")  # freeze the main loop: poses are driven by hand
def bake(pg):
    ld(pg,LIB);ld(pg,BAKEJS)
    d=pg.evaluate("()=>{V100T.equip('gs');const R=V100B.bake(V100M.M);const bad={};for(const n in R.rep)R.rep[n].forEach(x=>{['R','L'].forEach(s=>{if(x[s]&&x[s].err>.06)(bad[n]=bad[n]||[]).push(x.k+s+':'+x[s].err)})});return {ch:R.ch,mv:R.mv,bad}}")
    L=['// v100 anim: baked hero attack keys (generated by `BAKE=1 python3 test/v100_anim.py` from test/v100_anim_moves.js; do not edit by hand).',
       '// V100A_K.ch = channel names; V100A_K.mv[move] = [[k, ease, ...channel values], ...] (see src/js/1700-v100-anim-weighty-readable-basic-attack.js).',
       'var V100A_K={ch:'+json.dumps(d['ch'],separators=(',',':'))+',mv:{',
       ',\n'.join(' %s:%s'%(n,json.dumps(v,separators=(',',':'))) for n,v in d['mv'].items()),'}};']
    open(ROOT+'/src/js/1705-v100-anim-baked-keys.js','w').write('\n'.join(L)+'\n')
    print('baked',len(d['mv']),'moves; IK misses > .06:',json.dumps(d['bad'])[:800])
def s(pg):
    ev=pg.evaluate;boot(pg);ld(pg,LIB)
    res={'moves':{}}
    for wt in WT:
        r=ev(MEAS,[wt,STEPS[wt],not NOSHOT]);res['moves'][wt]=r['moves']
        if r.get('sheet'):png('v100_%s_%s.png'%(TAG,wt),r['sheet'])
        for m in r['moves']:print(wt,m['st'],'ms',m['ms'],'hitF',m['hitF'],'/',m['n'],'vel',m['vel'],'two',m['two'],'maxV',m['maxV'],m['errs'] or '')
    b=ev("()=>{const r=V100T.bowSheet(Object.keys(HUMLOOK).filter(k=>HUMLOOK[k].wpn=='bow'));return r}")
    png('v100_%s_bow.png'%TAG,b['sheet']);res['bow']=b['chk']
    if not NOSHOT:png('v100_%s_bowbig.png'%TAG,ev(BOWBIG))
    res['clear']=ev(CLEAR);res['bowshot']=ev(BOWSHOT)
    f=ev("()=>V100T.foeSheet(['skel','bandit','orc','knight','giant','hob','brigand'],{giant:'slam'})")
    png('v100_%s_foes.png'%TAG,f['sheet']);res['foes']=f['chk']
    for k,v in res['bow'].items():print('bow',k,v)
    print('clear',res['clear']);print('bowshot',res['bowshot'])
    json.dump(res,open(play.TMP+'/v100_%s.json'%TAG,'w'))
    s.res=res
from playwright.sync_api import Page as _Pg, Browser as _Br
_g0=_Pg.goto;_Pg.goto=lambda self,url,**k:_g0(self,url,**dict(k,timeout=600000))
_n0=_Br.new_page;_Br.new_page=lambda self,*a,**k:(lambda p:(p.set_default_timeout(600000),p)[1])(_n0(self,*a,**k))
if os.environ.get('BAKE'):
    play.run(lambda pg:(boot(pg),bake(pg)),w=1000,hh=620)
    o=subprocess.run(['bash',ROOT+'/build.sh'],capture_output=True,text=True);print(o.stdout.strip().splitlines()[-1] if o.stdout else o.stderr[-500:])
    h=open(ROOT+'/dist/ashen-wilds.html').read()   # play.py rewrote live.html at import: refresh it with the new build
    import re
    h=h.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','file://'+play.VEND+'/three.min.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js','file://'+play.VEND+'/GLTFLoader.js').replace('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js','file://'+play.VEND+'/SkeletonUtils.js')
    h=re.sub(r'<link rel="stylesheet" href="https://fonts[^>]*>','',h);open(play.TMP+'/live.html','w').write(h)
play.run(s,w=1000,hh=620)
res=s.res
logs=open(play.TMP+'/lastlogs.txt').read()
if TAG=='before':print('before data written');sys.exit()
bad=[]
before=None
try:before=json.load(open(play.TMP+'/v100_before.json'))
except Exception:print('(no out/v100_before.json: hit frames not compared; run SRC=<old build> TAG=before first)')
for wt,L in res['moves'].items():
    for m in L:
        st=m['st']
        if m['nan']:bad.append('%s#%d NaN'%(wt,st))
        if m['errs']:bad.append('%s#%d errors %s'%(wt,st,m['errs']))
        if m['hitF']<0 and wt not in('flail',):bad.append('%s#%d no hit'%(wt,st))
        if before and wt in before['moves']:
            B=before['moves'][wt][st]
            if B['hitF']!=m['hitF'] or abs(B['ms']-m['ms'])>.01 or B['n']!=m['n']:bad.append('%s#%d timing changed: hit frame %s->%s, ms %s->%s, frames %s->%s'%(wt,st,B['hitF'],m['hitF'],B['ms'],m['ms'],B['n'],m['n']))
        D=DIR.get(wt)
        if D and st<len(D):
            ax,sg,hand=D[st];v=m['vel'].get(hand)
            if not v:bad.append('%s#%d no %s tip'%(wt,st,hand))
            else:
                i='xyz'.index(ax)
                if v[i]*sg<1.5:bad.append('%s#%d tip moves wrong way at contact (%s%s expected) %s'%(wt,st,'+' if sg>0 else '-',ax,v))
        if wt in TWO and st in TWO[wt] and (m['two'] is None or m['two']>.1):bad.append('%s#%d off hand not on the handle (%.3f)'%(wt,st,m['two'] or -1))
for k,v in res['bow'].items():
    if not isinstance(v,dict) or 'err' in v:bad.append('bow %s %s'%(k,v));continue
    if v['dGrip']>.03:bad.append('bow %s: hand off the riser %.3f'%(k,v['dGrip']))
    if v['dStr']<.3:bad.append('bow %s: string in the hand %.3f'%(k,v['dStr']))
    if v['inBody']>0:bad.append('bow %s: through the body %.3f'%(k,v['inBody']))
    if v['up']<.6:bad.append('bow %s: limbs not upright %.2f'%(k,v['up']))
    if v['nan']:bad.append('bow %s NaN'%k)
    if not k.startswith('ride') and v['tipLow']<.04:bad.append('bow %s: lower limb on the ground %.3f'%(k,v['tipLow']))
for k,(mn,low) in res['clear'].items():
    if mn<.06:bad.append('bow %s: limb hits the legs (%.3f)'%(k,mn))
    if low<.04:bad.append('bow %s: limb hits the ground (%.3f)'%(k,low))
for fr in res['bowshot']:
    if .25<=fr['k']<=.5 and (not fr['arrow'] or math.dist(fr['riser'],fr['handL'])>.08):bad.append('bow shot frame %s'%fr)
for k,v in res['foes'].items():
    if k.endswith('Err'):bad.append('foe '+k+' '+v[:200]);continue
    T=v['tips']
    if T and max(abs(T[4][i]-T[2][i]) for i in range(3))<.3:bad.append('foe %s: weapon barely moves in the strike'%k)
pe=[l for l in logs.split('\n') if 'PAGEERROR' in l]
if pe:bad.append('page errors: '+' | '.join(pe)[:600])
print('CHECKS',('FAIL '+'; '.join(bad)) if bad else 'OK')
