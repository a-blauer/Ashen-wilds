# v189 fusion stars (owner, Nov 2 2026).
#   python3 v189_fusion_stars.py        (SRC=<build> as usual)
# Checks: the star list for 1–30 fusions (bronze/silver/gold/diamond, plain/crest/border, a new star at 13); nm(), the HUD
# companion bars, the Companions window and the Fusion window show the badge; a fusion updates the HUD badge; no runes are
# put on companion models. Pictures: out/v189_hud.png, v189_companions.png, v189_fusion.png. Prints FAIL … lines on a wrong result.
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
def run(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
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
    pg.screenshot(timeout=180000,path=play.TMP+'/v189_hud.png',clip={'x':0,'y':0,'width':420,'height':200})
    ev("()=>{try{$('cmp').classList.remove('hide');rC()}catch(e){}}");pg.wait_for_timeout(500)
    r=ev("()=>[...document.querySelectorAll('#cmp .fs189')].length")
    chk('Companions window shows badges',r>=3,r)
    pg.screenshot(timeout=180000,path=play.TMP+'/v189_companions.png')
    ev("()=>{closeWin&&closeWin();$('cmp').classList.add('hide');$('fuseBtn').click()}");pg.wait_for_timeout(500)
    r=ev("()=>({n:document.querySelectorAll('#fz .fs189').length,help:FSM100_helpHTML().includes('fs189')})")
    chk('Fusion window shows badges',r['n']>=3,r);chk('Fusion help explains the stars',r['help'],r)
    pg.screenshot(timeout=180000,path=play.TMP+'/v189_fusion.png')
    ev("()=>{$('fz').classList.add('hide')}")
    # 3. a fusion: the HUD badge follows; no runes on the model
    r=ev("""()=>{const c=party[0];c.fz++;c.fp=c.fz;c.f=Math.min(10,c.fz);ui();hud();let n=0;fols[0].traverse(o=>{if(o.userData&&o.userData.fr189)n++});
      return {hud:document.querySelector('#cbars .cnm .fs189').getAttribute('title'),runes:n,fn:typeof fr189Apply}}""")
    chk('HUD badge follows the new count',r['hud'].startswith('14 fusions'),r['hud'])
    chk('no runes on companion models',r['runes']==0 and r['fn']=='undefined',r)
play.run(run)
print('CHECKS', 'OK' if not FAIL else 'FAIL %d'%len(FAIL))
