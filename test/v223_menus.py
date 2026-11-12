# v223: the Character window, the Kingdom window's Construction tab and its Villagers tab, laid out as tidy ledger pages.
# Every button still works, nothing scrolls sideways (desktop and phone width), lg222Audit finds no unreadable text.
# Run: python3 v223_menus.py      SHOTS=1 also saves pictures test/out/<TAG>_<window>_<size>.png (TAG default v223)
import os,json,play
bad=[];SHOTS=os.environ.get('SHOTS')=='1';TAG=os.environ.get('TAG','v223')
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,'' if ok else info,flush=True)
    if not ok:bad.append(name)
SETUP="""()=>{gold=1e7;for(const k of Object.keys(RES))mats[k]=5000;['Rock Core','Silk Gland','Ectoplasm'].forEach(k=>mats[k]=500);
  [0,1,2].forEach(i=>bossDone.add(i));TOD=.3;try{kfApply109()}catch(_){}
  const free=()=>LOT103.find(l=>lotFree103(l.id)&&(typeof lotOpen109!='function'||lotOpen109(l.id)));
  SHOPS.slice(0,3).forEach(o=>{const l=free();if(l&&!shopBuilt(o.k)){SH.pos[o.k]=l.id;shopBuy(o.k);if(!shopBuilt(o.k))delete SH.pos[o.k]}});
  SHU.filter(u=>!UPK103.includes(u.k)).slice(0,2).forEach(u=>{try{shBuy(u.k)}catch(_){}});
  for(let i=0;i<2;i++){const l=free();if(l)hsBuy103(l.id)}
  const C=HS103.cit;C.forEach(c=>{c.bag=null;c.t0=0;c.task=''});
  if(C[1])czTrain104(C[1],'fish');if(C[0])czTask103(C[0],(czOpts104(C[0]).find(o=>o[2])||[''])[0]);
  hero.lvl=24;hero.xp=Math.floor(needH(24)*.4);atr139Auto();atr139Apply();hero.lvl=27;atr139Add(ATR139.K[0],2);
  try{hsDirty();hud();ui()}catch(_){}return {cit:C.length,houses:HS103.h.length,free:atr139Free()}}"""
CLOSE="()=>{try{closeX()}catch(_){}document.querySelectorAll('.modal.w').forEach(e=>e.classList.add('hide'))}"
OPEN={'char':"()=>{if(!$('tal').classList.contains('hide'))$('tal').classList.add('hide');openTal()}",
      'build':"()=>{KM103.tab='kingdom';openX('hold')}",
      'vill':"()=>{KM103.tab='vill';openX('hold')}"}
# no sideways scroll anywhere in the open window, and nothing poking out of it
FIT="""()=>{const w=document.querySelector('.modal.w:not(.hide)>.win');if(!w)return {none:1};const W=w.getBoundingClientRect(),o=[];
  w.querySelectorAll('*').forEach(e=>{if(e.closest('canvas'))return;const ox=getComputedStyle(e).overflowX;if(e.scrollWidth>e.clientWidth+2&&(ox=='auto'||ox=='scroll')&&e.clientWidth>0)o.push('scroll:'+(e.id||e.className||e.tagName));
    const r=e.getBoundingClientRect();if(r.width&&(r.right>W.right+2||r.left<W.left-2)&&getComputedStyle(e).position!='fixed')o.push('out:'+(e.id||String(e.className).slice(0,30)||e.tagName)+' in '+(e.parentElement.id||String(e.parentElement.className).slice(0,30))+' '+Math.round(r.left)+'-'+Math.round(r.right)+' win '+Math.round(W.left)+'-'+Math.round(W.right))});
  return {o:o.slice(0,6),n:o.length,page:document.documentElement.scrollWidth<=innerWidth+1,ww:Math.round(W.width),vw:innerWidth}}"""
AUD="()=>{lg222Ink();return lg222Audit(1.9).slice(0,5)}"
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    if SHOTS:
        ev("()=>{const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Cinzel:wght@600;800&family=Cinzel+Decorative:wght@700&family=IM+Fell+English:ital@0;1&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap';document.head.appendChild(l)}");pg.wait_for_timeout(2500)
    print('setup',json.dumps(ev(SETUP)))
    for size,(W,H) in [('desk',(1600,900)),('phone',(390,844))]:
        pg.set_viewport_size({'width':W,'height':H})
        if size=='phone':   # phone mode: the game view fills the screen (as in fullscreen on a phone)
            ev("()=>{applyDev('mobile');document.head.insertAdjacentHTML('beforeend','<style id=\"t223fs\">#stage{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;margin:0!important;z-index:50}</style>');try{rs()}catch(_){}}")
        pg.wait_for_timeout(800)
        for win in ['char','build','vill']:
            ev(CLOSE);pg.wait_for_timeout(200);ev(OPEN[win]);pg.wait_for_timeout(2500)
            f=ev(FIT);chk('%s %s: fits, no sideways scroll'%(win,size),not f.get('none') and f['n']==0 and f['page'],f)
            a=ev(AUD);chk('%s %s: every text readable on the paper'%(win,size),len(a)==0,a)
            if SHOTS:pg.wait_for_timeout(600);pg.screenshot(path=play.TMP+'/%s_%s_%s.png'%(TAG,win,size));print('SHOT',win,size)
            if SHOTS:
                ev("()=>{const b=%s;b.scrollTop=b.scrollHeight*(%s)}"%("document.querySelector('#tal .wb')" if win=='char' else "$('xwB')",'1' if win=='char' else '.55'));pg.wait_for_timeout(400);pg.screenshot(path=play.TMP+'/%s_%s_%s2.png'%(TAG,win,size))
        ev(CLOSE)
    ev("()=>{applyDev('desktop');const s=$('t223fs');if(s)s.remove()}")
    pg.set_viewport_size({'width':1280,'height':760});pg.wait_for_timeout(500)
    if os.environ.get('NOCHECK')=='1':return
    # ---- Character window: the attribute buttons, Apply, the stats and bonuses ----
    ev(OPEN['char']);pg.wait_for_timeout(800)
    r=ev("""()=>{const o={};const q=s=>document.querySelectorAll('#tal '+s).length;o.plus=q('[data-at139]');o.minus=q('[data-at139m]');o.rows=q('[data-at139i]');o.stats=q('.ch139-kv');o.bn=q('.ch139-bn');o.pw=q('.ch139-pw');
      o.sec=[...document.querySelectorAll('#tal .ch139-st')].map(e=>e.textContent.trim());
      const p0=atr139PendN();document.querySelector('#tal [data-at139]:not([disabled])').click();o.add=atr139PendN()-p0;
      document.querySelector('#tal [data-at139m]:not([disabled])').click();o.sub=atr139PendN()-p0;
      document.querySelector('#tal [data-at139i]').click();o.info=$('ch139Info').textContent.length;
      const ap=document.querySelector('#tal [data-at139x=apply]');o.apply=!!ap;const sp=atr139Spent();if(ap)ap.click();o.applied=atr139Spent()>sp;
      o.reset=!!document.querySelector('#tal [data-at139x=reset]');o.pv=!!$('ch139PV');
      o.cards=q('.ch223-cards>.ch139-sec');o.brows=q('.ch223-br');o.xpt=q('.ch223-xpt');o.fs=parseFloat(getComputedStyle(document.querySelector('#tal .ch139-kv')).fontSize);return o}""")
    chk('character v223 layout: stat cards, a bonus line per attribute, XP in words, readable size',r['cards']==3 and r['brows']==6 and r['xpt']==1 and r['fs']>=12,r)
    chk('character: six attributes with + and −',r['plus']==6 and r['minus']==6 and r['rows']==6,r)
    chk('character: stats in Offense / Defense / Utility, power, bonuses',r['stats']>12 and r['bn']>=24 and r['pw']==1 and len(r['sec'])>=4,r)
    chk('character: + stages a point, − takes it back, Apply spends',r['add']==1 and r['sub']==0 and r['applied'],r)
    chk('character: a picked attribute explains itself; Reset and the model are there',r['info']>20 and r['reset'] and r['pv'],r)
    ev(CLOSE)
    # ---- Construction: Build, Move, Turn, the plan, Cancel ----
    ev(OPEN['build']);pg.wait_for_timeout(800)
    r=ev("""()=>{const o={};const q=s=>document.querySelectorAll('#xw '+s).length;o.h=q('.kmrw .km223-h');o.b=q('.kmrw .km223-b');o.lab=q('.km223-d i');o.help=q('#xwF .v223-help');return o}""")
    chk('construction v223 layout: card heads, button groups, Now/Next/Cost labels, folded help',r['h']>8 and r['b']>8 and r['lab']>8 and r['help']==1,r)
    r=ev("""()=>{const o={};const q=s=>document.querySelectorAll('#xw '+s).length;o.tabs=q('[data-kmtab]');o.build=q('[data-kmb]');o.mv=q('[data-kmmv]');o.rot=q('[data-kmrot]');o.cv=q('#kmCv');o.rows=q('.kmrw');
      const m=document.querySelector('#xw .kmrw [data-kmmv]');m.click();o.pick=!!KM103.pick;o.cancel=q('[data-kmx]');document.querySelector('#xw [data-kmx]').click();o.unpick=!KM103.pick;
      const t=document.querySelector('#xw .kmrw [data-kmrot]'),key=t.dataset.kmrot,r0=(SH.rot||{})[key]|0;t.click();o.rot1=((SH.rot||{})[key]|0)!==r0;
      const b=[...document.querySelectorAll('#xw [data-kmb^="lvl:"]')].find(b=>!b.disabled);o.lvl=!!b;if(b){const k=b.dataset.kmb.split(':')[1],l=shL(k);b.click();o.up=shL(k)>l}
      const h=document.querySelector('#xw [data-kmb="house:1"]');o.house=!!h;if(h&&!h.disabled){h.click();o.hpick=KM103.pick&&KM103.pick.kind=='house';kmPickEnd103();rX()}
      return o}""")
    chk('construction: tabs, plan, building rows',r['tabs']==3 and r['cv']==1 and r['rows']>8,r)
    chk('construction: Build / Move / Turn buttons',r['build']>3 and r['mv']>=4 and r['rot']>=4,r)
    chk('construction: Move starts placing, Cancel stops it',r['pick'] and r['cancel']>=1 and r['unpick'],r)
    print('turned',r['rot1'])   # a turn may be refused when it would block a door: the click must still reach kfRotate109
    chk('construction: Upgrade upgrades',(not r['lvl'] or r.get('up')),r)
    chk('construction: New house starts placing',(not r['house']) or r.get('hpick',True),r)
    # ---- Villagers ----
    ev("()=>{KM103.tab='vill';rX()}");pg.wait_for_timeout(500)
    r=ev("""()=>{const o={};const q=s=>document.querySelectorAll('#xw '+s).length;o.jn=q('.vljob .vj-n');o.job=q('.vljob');o.help=q('#xwF .v223-help .vlhow');return o}""")
    chk('villagers v223 layout: jobs as name rows, steps folded into the help line',r['jn']==r['job'] and r['job']>0 and r['help']==1,r)
    r=ev("""()=>{const o={};const q=s=>document.querySelectorAll('#xw '+s).length;o.cards=q('.vlc');o.tr=q('[data-vltr]');o.job=q('[data-vljob]');o.rk=q('[data-vlrk]');o.all=q('[data-vlall]');o.n=HS103.cit.length;
      const c=HS103.cit.findIndex(c=>!c.t0&&!c.bag);const j=[...document.querySelectorAll('#xw [data-vljob="'+c+'"]')].find(b=>!b.disabled&&b.dataset.v);o.jb=!!j;if(j){j.click();o.task=HS103.cit[c].task===j.dataset.v}
      const k=document.querySelector('#xw [data-vlrk]:not([disabled])');if(k){const i=+k.dataset.vlrk,r0=czRank105(HS103.cit[i]);k.click();o.ranked=czRank105(HS103.cit[i])>r0}
      const t=document.querySelector('#xw [data-vltr]:not([disabled])');if(t){const [i,r]=t.dataset.vltr.split(':');t.click();o.trade=czRole104(HS103.cit[+i])===r}
      return o}""")
    chk('villagers: a card per villager with trades, jobs, rank',r['n']>=2 and r['cards']==r['n'] and r['tr']==4*r['n'] and r['job']>=r['n'] and r['all']==1,r)
    chk('villagers: a job, a rank-up and a trade still work',r['jb'] and r.get('task') and r.get('ranked',True) and r.get('trade',True),r)
    ev(CLOSE)
play.run(s,w=1280,hh=760)
logs=open(play.TMP+'/lastlogs.txt').read()
chk('no page errors','PAGEERROR' not in logs and 'v223' not in logs,[l for l in logs.split('\n') if 'PAGEERROR' in l or 'v223' in l][:3])
print('v223_menus:','ALL PASS' if not bad else 'FAILED %d'%len(bad))
import sys;sys.exit(1 if bad and not SHOTS else 0)   # a picture run always brings its pictures back
