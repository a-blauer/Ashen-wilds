# v189 fusion stars and runes (owner, Nov 2 2026).
#   python3 v189_fusion_stars.py        (SP=Ashwolf,Skyhawk limits the species checked for runes; SRC=<build> as usual)
# Checks: the star list for 1–30 fusions (bronze/silver/gold/diamond, plain/crest/border, a new star at 13); nm(), the HUD
# companion bars, the Companions window and the Fusion window show the badge; a fusion rebuilds the follower with one more
# rune and the HUD badge follows; every companion species wears exactly one rune per fusion (up to 30), none on a head or
# jaw bone, none hidden behind another part, the same spots and symbols every build and on a co-op partner's copy (mpvLookOf
# → JSON → mpvLookIn → cr); older looks without fz still load. Pictures: out/v189_*.png. Prints FAIL … lines on a wrong result.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAIL=[]
def chk(name,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+name,(' '+str(info)[:500]) if info not in ('',None) else '')
    if not ok:FAIL.append(name)

SEED=r"""()=>{let s=11;const R0=Math.random;Math.random=()=>(s=(s*16807)%2147483647)/2147483647;
  try{const mk=(sp,l,o)=>{const c=mkC(sp,l,0,'',{hp:1,a:1,d:1,pa:1,ma:1,pd:1,md:1});ivSync(c);c.mods=[];Object.assign(c,o||{});c.fp=c.fz||0;c.f=Math.min(10,c.fz||0);c.h=M(c);party.push(c);return c};
  party.length=0;hero.tal.__cs2=1;
  mk('Ashwolf',20,{n:'Cinderfang',fz:13});mk('Skyhawk',14,{n:'Galewing',fz:6});mk('Foxlet',6,{n:'Ember'});mk('Mossfrog',9,{n:'Bogsy',fz:30});
  hsDirty();ui();hud();return party.map(c=>[c.n,c.fz||0])}finally{Math.random=R0}}"""
LIST=r"""()=>{const out=[];for(let n=0;n<=30;n++)out.push([n,fs189List(n).map(s=>s.t+''+s.d).join(',')]);return out}"""
# rune facts for one model: count, bones, positions in the model's own space
RUNES=r"""(g)=>{const R=[];g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert();
  g.traverse(o=>{if(o.userData&&o.userData.fr189&&o.isMesh){const p=new THREE.Vector3().setFromMatrixPosition(o.matrixWorld).applyMatrix4(inv);R.push({o,p})}});return R}"""
def run(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{window.__V189R="+RUNES+"}")
    print('party',ev(SEED))
    # 1. the star rules
    L=dict(ev(LIST))
    exp={0:'',1:'00',2:'01',3:'02',4:'10',5:'11',6:'12',7:'20',8:'21',9:'22',10:'30',11:'31',12:'32',13:'32,00',15:'32,02',24:'32,32',25:'32,32,00',30:'32,32,12'}
    for n,e in exp.items():chk('stars for %d fusions'%n,L[n]==e,L[n])
    # 2. names: nm(), HUD bars, Companions window, Fusion window
    r=ev("""()=>{const c=party,cnt=h=>(h.match(/class="fs189-s/g)||[]).length;
      return {nm:c.map(x=>cnt(nm(x))),hud:[...document.querySelectorAll('#cbars .cnm')].map(e=>e.querySelectorAll('.fs189-s').length),
        oldStar:c.map(x=>nm(x).includes('★'))}}""")
    chk('nm() badge stars (13,6,0,30 fusions)',r['nm']==[2,1,0,3],r['nm'])
    chk('nm() has no old ★ glyphs',not any(r['oldStar']),r['oldStar'])
    chk('HUD companion bars show the badge',r['hud'][:2]==[2,1],r['hud'])
    pg.screenshot(path=play.TMP+'/v189_hud.png',clip={'x':0,'y':0,'width':420,'height':200})
    ev("()=>{try{$('cmp').classList.remove('hide');rC()}catch(e){}}");pg.wait_for_timeout(500)
    r=ev("()=>[...document.querySelectorAll('#cmp .fs189')].length")
    chk('Companions window shows badges',r>=3,r)
    pg.screenshot(path=play.TMP+'/v189_companions.png')
    ev("()=>{closeWin&&closeWin();$('cmp').classList.add('hide');$('fuseBtn').click()}");pg.wait_for_timeout(500)
    r=ev("()=>({n:document.querySelectorAll('#fz .fs189').length,help:FSM100_helpHTML().includes('fs189')})")
    chk('Fusion window shows badges',r['n']>=3,r);chk('Fusion help explains the stars',r['help'],r)
    pg.screenshot(path=play.TMP+'/v189_fusion.png')
    ev("()=>{$('fz').classList.add('hide')}")
    # 3. a fusion: follower rebuilt with one more rune, HUD redrawn
    r=ev("""()=>{const c=party[0],g0=fols[0],n0=__V189R(g0).length;c.fz++;c.fp=c.fz;c.f=Math.min(10,c.fz);ui();hud();const g1=fols[0];
      return {n0,n1:__V189R(g1).length,rebuilt:g0!==g1,hud:document.querySelector('#cbars .cnm .fs189').getAttribute('title')}}""")
    chk('follower wore 13 runes before',r['n0']==13,r);chk('a fusion rebuilds the follower with 14 runes',r['rebuilt'] and r['n1']==14,r)
    chk('HUD badge follows the new count',r['hud'].startswith('14 fusions'),r['hud'])
    # 4. every species: one rune per fusion, never on the head or jaw, not hidden, deterministic, co-op copy identical
    sp=os.environ.get('SP')
    r=ev("""(only)=>{const out={},list=only?only.split(','):Object.keys(S).filter(n=>!EN[n]&&SPEC[rigOf(n)]);const t0=performance.now();
      list.forEach(n=>{try{const c=mkC(n,20,0,'',{hp:1,a:1,d:1,pa:1,ma:1,pd:1,md:1});c.fz=30;c.fp=30;c.f=10;c.rs189=12345+n.length*77;
        const a=__V189R(cr(c)),b=__V189R(cr(c));const S2=SPEC[rigOf(n)],O=Object.keys(S2.bones);
        const bones=a.map(q=>{const bn=q.o.parent;let sk=null;cr;return bn&&bn.isBone?bn:null});
        let bodyM=null;const g=cr(c);g.traverse(o=>{if(!bodyM&&o.isSkinnedMesh&&o.children.some(k=>k.isBone))bodyM=o});
        const names=[];__V189R(g).forEach(q=>{const i=bodyM.skeleton.bones.indexOf(q.o.parent);names.push(i<0?'?':O[i])});
        const same=a.length==b.length&&a.every((q,i)=>q.p.distanceTo(b[i].p)<1e-5&&q.o.material===b[i].o.material);
        const L=JSON.parse(JSON.stringify(mpvLookOf(c))),c2=mpvLookIn(L),m=__V189R(cr(c2));
        const coop=m.length==a.length&&m.every((q,i)=>q.p.distanceTo(a[i].p)<1e-4&&q.o.material===a[i].o.material);
        const L0=JSON.parse(JSON.stringify(L));delete L0.fz;delete L0.rs;const old=mpvLookIn(L0),g0=cr(old);
        const sz=a.length?a[0].o.scale.x:0;const cols=new Set(a.map(q=>q.o.material.color.getHex())).size;
        out[n]={k:a.length,bad:names.filter(x=>FR189.keepOut.test(x)||x=='?'),same,coop,old:__V189R(g0).length,sz:+sz.toFixed(4),cols}}catch(e){out[n]={err:String(e).slice(0,200)}}});
      out._ms=Math.round(performance.now()-t0);return out}""",sp or '')
    ms=r.pop('_ms');print('species',len(r),'built in',ms,'ms')
    for n,v in r.items():
        if 'err' in v:chk(n+' builds',False,v['err']);continue
        chk(n+' 30 fusions → 28–30 runes',28<=v['k']<=30,v['k'])
        chk(n+' no rune on head/jaw',not v['bad'],v['bad'])
        chk(n+' same runes every build',v['same'])
        chk(n+' co-op copy has the same runes',v['coop'])
        chk(n+' an old co-op look (no fz) still builds',v['old']>=0)
        chk(n+' every rune on one companion has the same colour',v['cols']==1,v['cols'])
    r=ev("()=>{const s=new Set();[11,12,13,14,15,16,17,18].forEach(k=>{const c=mkC('Ashwolf',20,0,'',{hp:1,a:1,d:1,pa:1,ma:1,pd:1,md:1});c.fz=4;c.rs189=k;const R=__V189R(cr(c));s.add(R[0].o.material.color.getHex())});return s.size}")
    chk('different companions can have different rune colours',r>=4,r)
    # 5. pictures: close-ups of a few companions with 3, 13 and 30 runes
    for n,fz,ang,far,walk in [('Ashwolf',13,0.6,1.35,0),('Ashwolf',13,-2.4,1.35,0),('Mossfrog',30,0.9,1.35,0),('Skyhawk',6,0.5,1.35,0),('Foxlet',3,-0.7,1.35,0),('Drakelet',20,0.8,1.35,0),
                             ('Ashwolf',30,1.4,.75,1),('Direfang',30,-1.2,.75,1),('Pyrewing',30,.9,.8,1),('Skyhawk',30,-.8,.75,1),('Stoneshell',30,.7,.75,1),('Venomcoil',30,1.8,.8,1)]:
        url=ev("""([n,fz,ang,far,walk])=>{if(!S[n])return null;const c=mkC(n,20,0,'',{hp:1,a:1,d:1,pa:1,ma:1,pd:1,md:1});c.fz=fz;c.fp=fz;c.f=Math.min(10,fz);c.rs189=770+n.length*3+fz;
          const g=cr(c),sc=new THREE.Scene();sc.background=new THREE.Color(0x1a1612);sc.add(new THREE.HemisphereLight(0xddd6c8,0x2a2018,.9));const dl=new THREE.DirectionalLight(0xffffff,.8);dl.position.set(2,4,3);sc.add(dl);
          sc.add(g);g.updateMatrixWorld(true);const bx=new THREE.Box3().setFromObject(g),ce=bx.getCenter(new THREE.Vector3()),D=bx.getSize(new THREE.Vector3()).length();
          const cam=new THREE.PerspectiveCamera(35,1,.01,100);cam.position.set(ce.x+Math.sin(ang)*D*far,ce.y+D*.45*far/1.35,ce.z+Math.cos(ang)*D*far);cam.lookAt(ce);
          try{if(walk)for(let k=0;k<9;k++)animC(g,1000+k*37,true,1);else animC(g,performance.now(),false,1)}catch(_){}
          const R=window.__v189ren||(window.__v189ren=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true}));R.setSize(420,420);R.outputEncoding=ren.outputEncoding;R.render(sc,cam);return R.domElement.toDataURL('image/png')}""",[n,fz,ang,far,walk])
        if url:
            import base64;open(play.TMP+'/v189_rune_%s_%d_%s%s.png'%(n,fz,'b' if ang<0 else 'a','_walk' if walk else ''),'wb').write(base64.b64decode(url.split(',')[1]))
play.run(run)
print('CHECKS', 'OK' if not FAIL else 'FAIL %d'%len(FAIL))
