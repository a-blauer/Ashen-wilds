# v223: the Alchemy Table and Cooking Hearth as working stations, the Treasury as a stock exchange board.
# Run: python3 v223_stations.py      SHOTS=1 also writes pictures: out/v223_<window>_<desktop|phone>.png (W/H set the desktop size)
import os,json,play
bad=[]
SHOTS=os.environ.get('SHOTS')=='1';W=int(os.environ.get('W','1600'));H=int(os.environ.get('H','900'))
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,'' if ok else info,flush=True)
    if not ok:bad.append(name)
GIVE="""()=>{TOD=.3;gold=250000;SH.shop.alch=1;SH.shop.cook=1;try{shApply()}catch(_){}
  ['sunleaf','moonpetal','emberroot','pepper','meat','fish','wheat','carrot','honey','berries','frostcap','starbloom','pumpkin'].forEach((k,i)=>{sup[k]=12+i%3});
  ['glowcap','petals','crystal','stone','bone'].forEach(k=>{mats[k]=12})}"""
OPEN="""(k)=>{try{const N=TWN100_S.npc[k];if(N){const n=im220Rig(N).getWorldPosition(new THREE.Vector3());pl.position.set(n.x+1.2,pl.position.y,n.z+2.2);snapCam()}}catch(_){}openX(k)}"""
FIT="""()=>{lg222Ink();try{$('xw').querySelector('.win').getAnimations().forEach(a=>a.finish())}catch(_){}const w=$('xw').querySelector('.win'),B=$('xwB'),S=$('stage').getBoundingClientRect(),r=w.getBoundingClientRect();
  return {low:lg222Audit(1.9).slice(0,4),over:[w.scrollWidth-w.clientWidth,B.scrollWidth-B.clientWidth],out:r.left<S.left-2||r.right>S.right+2,r:[r.left,r.right,S.left,S.right].map(Math.round)}}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    if SHOTS:
        ev("()=>{const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&family=IM+Fell+English:ital@0;1&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap';document.head.appendChild(l)}");pg.wait_for_timeout(2000)
    ev(GIVE)
    def shot(n):
        if SHOTS:pg.wait_for_timeout(900);pg.screenshot(path=play.TMP+'/v223_%s.png'%n);print('SHOT',n)
    # ---------------- alchemy ----------------
    ev(OPEN,'alch');pg.wait_for_timeout(1800)
    r=ev("""()=>{const R=$('xwB').querySelector('.c223');if(!R)return null;return {lines:R.querySelectorAll('[data-c223r]').length,chips:R.querySelectorAll('.c223-r .c223-chip').length,
      bench:!!R.querySelector('.c223-bench .c223-svg'),go:!!R.querySelector('[data-c223go]'),flt:R.querySelectorAll('[data-c223f]').length,ibuy:R.querySelectorAll('[data-ibuy][data-n="1"]').length,
      okc:[...R.querySelectorAll('.c223-chip.ok b')].every(b=>getComputedStyle(b).color=='rgb(47, 94, 40)'),noc:R.querySelectorAll('.c223-chip.no').length}}""")
    chk('alchemy: the station window (recipe lines with ingredient chips, work area, filters, market kept)',r and r['lines']==10 and r['chips']>=4 and r['bench'] and r['go'] and r['flt']==4 and r['ibuy']>3,r)
    f=ev(FIT);chk('alchemy (desktop): readable, no sideways overflow',not f['low'] and max(f['over'])<=1 and not f['out'],f)
    shot('alch_desktop')
    # brew Health Potions x5 through the new UI: same spend and result as make()
    r=ev("""()=>{const R=$('xwB').querySelector('.c223');R.querySelector('[data-c223r="p_hp"]').click();R.querySelector('[data-c223q="5"]').click();
      const r=ALCH.find(x=>x[0]=='p_hp'),mx=Math.min(...Object.keys(r[3]).map(k=>Math.floor(cnt(k)/r[3][k]))),b=Math.min(5,mx);
      window.__b={b,pots:pots,sl:cnt('sunleaf'),gc:cnt('glowcap')};const go=$('xwB').querySelector('[data-c223go]');go.click();
      return {b,busy:!!C223.busy,sel:c223S('alch').sel,cls:$('xwB').querySelector('.c223-bench').className,fly:$('xwB').querySelectorAll('.c223-ing.fly').length}}""")
    chk('alchemy: Brew starts the work (busy, ingredients fly in)',r['busy'] and r['sel']=='p_hp' and 'c223-busy' in r['cls'] and r['fly']==2 and r['b']==5,r)
    shot('alch_brewing')
    pg.wait_for_timeout(int(ev("()=>C223.T"))+700)
    r=ev("""()=>{const b=window.__b;return {d:[pots-b.pots,b.sl-cnt('sunleaf'),b.gc-cnt('glowcap')],want:[2*b.b,2*b.b,b.b],res:!!$('xwB').querySelector('.c223-res'),busy:!!C223.busy}}""")
    chk('alchemy: the potions arrive and the ingredients are spent exactly as make() does',r['d']==r['want'] and not r['busy'],r)
    chk('alchemy: what was made pops out',r['res'],r)
    shot('alch_done')
    # leaving during the brew spends nothing
    r=ev("""()=>{const go=$('xwB').querySelector('[data-c223go]');const o={pots,sl:cnt('sunleaf')};go.click();closeX();window.__c=o;return !!C223.busy}""")
    pg.wait_for_timeout(int(ev("()=>C223.T"))+500)
    r=ev("()=>[pots-__c.pots,__c.sl-cnt('sunleaf'),!!C223.busy]")
    chk('alchemy: closing the window during a brew cancels it (nothing spent)',r==[0,0,False],r)
    # the Market tab: the old market list, still buying
    ev(OPEN,'alch');pg.wait_for_timeout(700)
    r=ev("""()=>{const R=$('xwB').querySelector('.c223');R.querySelector('[data-c223t="shop"]').click();const sh=R.querySelector('.c223-shop'),vis=sh.offsetParent!==null,mk=R.querySelector('.c223-make').offsetParent===null;
      const c=sh.querySelector('.kqm-cell');let bought=0;if(c){c.click();const k=(c._kq&&c._kq.acts&&c._kq.acts[0]&&c._kq.acts[0].dataset.ibuy)||'';const n0=k?cnt(k):0;const b=sh.querySelector('.kqm-bbar [data-kqa]');if(b)b.click();bought=k?cnt(k)-n0:0}
      const o={vis,mk,cells:sh.querySelectorAll('.kqm-cell').length,bought,tab:c223S('alch').tab};return o}""")
    chk('alchemy: the Market & stores tab shows the market and buys',r['vis'] and r['mk'] and r['cells']>3 and r['bought']>=1,r)
    f=ev(FIT);chk('alchemy market tab: readable, no sideways overflow',not f['low'] and max(f['over'])<=1,f)
    shot('alch_market')
    ev("()=>{$('xwB').querySelector('[data-c223t=\"make\"]').click();closeX()}")
    # ---------------- cooking ----------------
    ev(OPEN,'cook');pg.wait_for_timeout(900)
    r=ev("""()=>{const R=$('xwB').querySelector('.c223.c223-cook');if(!R)return null;return {lines:R.querySelectorAll('[data-c223r]').length,cf:!!R.querySelector('[data-c223r="cf_jerky"]'),flt:R.querySelectorAll('[data-c223f]').length,stir:!!R.querySelector('.c223-stir')}}""")
    chk('cooking: the hearth window (all meals and companion food, a pot with a spoon)',r and r['lines']==17 and r['cf'] and r['flt']==5 and r['stir'],r)
    f=ev(FIT);chk('cooking (desktop): readable, no sideways overflow',not f['low'] and max(f['over'])<=1 and not f['out'],f)
    r=ev("""()=>{const R=$('xwB').querySelector('.c223');R.querySelector('[data-c223f="Hearty meals"]').click();const n=$('xwB').querySelectorAll('[data-c223r]').length;
      const K=['f_stew','f_skewer','f_meat','f_fish'].find(x=>!locked(x));
      $('xwB').querySelector('[data-c223f="all"]').click();$('xwB').querySelector('[data-c223r="'+K+'"]').click();$('xwB').querySelector('[data-c223q="max"]').click();
      const r=FOOD.find(x=>x[0]==K),ks=Object.keys(r[3]),mx=Math.min(...ks.map(k=>Math.floor(cnt(k)/r[3][k])));window.__k={K,r,ks,mx,st:cnt(K),h:ks.map(cnt)};
      $('xwB').querySelector('[data-c223go]').click();return {n,K,mx,busy:!!C223.busy}}""")
    chk('cooking: the category filter narrows the list',r['n']==2,r)
    shot('cook_desktop')
    pg.wait_for_timeout(int(ev("()=>C223.T"))+700)
    r=ev("""()=>{const k=__k;return {K:k.K,d:[cnt(k.K)-k.st].concat(k.ks.map((q,i)=>k.h[i]-cnt(q))),want:[k.r[4]*k.mx].concat(k.ks.map(q=>k.r[3][q]*k.mx)),res:!!$('xwB').querySelector('.c223-res')}}""")
    chk('cooking: Max cooks every batch you can afford, spent and made exactly as make() does',r['d']==r['want'] and r['want'][0]>0 and r['res'],r)
    shot('cook_done')
    ev("()=>closeX()")
    # ---------------- treasury ----------------
    ev("()=>{SH.lv.treas=1;TRS200.h={};gold=10000;T223.v=1;ST200.open.treas()}");pg.wait_for_timeout(1200)
    r=ev("""()=>{const R=$('xwB').querySelector('.t223');if(!R)return null;const cv=R.querySelector('[data-t223cv]'),g=cv.getContext('2d'),d=g.getImageData(0,0,cv.width,cv.height).data;let px=0;for(let i=3;i<d.length;i+=16)if(d[i])px++;
      const p=trs200P(1);return {tape:R.querySelectorAll('.t223-tape .t223-ti').length,tiles:R.querySelectorAll('[data-t223v]').length,px,cvw:cv.width,big:R.querySelector('.t223-big b').textContent,want:t223F(p,2),
        arrow:/[▲▼]/.test(R.querySelector('.t223-big span').textContent),buy:R.querySelectorAll('[data-trs200b="1"]').length,sell:R.querySelectorAll('[data-trs200s="1"]').length,tm:!!T223.tm,
        spark:[...R.querySelectorAll('[data-t223sp]')].every(c=>c.width>0)}}""")
    chk('treasury: ticker tape, three quote tiles, a drawn candle chart, big price with arrow',r and r['tape']>=5 and r['tiles']==3 and r['px']>200 and r['big']==r['want'] and r['arrow'] and r['spark'],r)
    chk('treasury: the trading ticket has the old Buy and Sell buttons',r and r['buy']==5 and r['sell']==3 and r['tm'],r)
    f=ev(FIT);chk('treasury (desktop): readable, no sideways overflow',not f['low'] and max(f['over'])<=1 and not f['out'],f)
    shot('treas_desktop')
    r=ev("""()=>{const o={};const g0=gold,p=trs200P(1);$('xwB').querySelector('[data-trs200b="1"][data-g="500"]').click();o.buy=[g0-gold,TRS200.h.caravan&&TRS200.h.caravan.c,+(TRS200.h.caravan.s).toFixed(6),+(500*.99/p).toFixed(6)];
      const inp=$('xwB').querySelector('[data-t223amt]');inp.value='250';inp.dispatchEvent(new Event('input',{bubbles:true}));const bb=$('xwB').querySelector('.t223-bb');o.en=!bb.disabled;const g1=gold;bb.click();o.custom=[g1-gold,TRS200.h.caravan.c];
      o.pos=!!$('xwB').querySelector('.t223-pos b');const H=TRS200.h.caravan,want=Math.floor(H.s*trs200P(1)*.99),g2=gold;$('xwB').querySelector('[data-trs200s="1"][data-f="1"]').click();o.sell=[gold-g2,want,!TRS200.h.caravan];
      $('xwB').querySelector('[data-t223v="2"]').click();o.v=[T223.v,$('xwB').querySelector('.t223-tile.on').dataset.t223v];$('xwB').querySelector('[data-t223r="1W"]').click();o.rg=T223.rg;return o}""")
    chk('treasury: Buy 500 takes 500 gold and gives the shares trs200Buy gives',r['buy'][0]==500 and r['buy'][1]==500 and r['buy'][2]==r['buy'][3],r)
    chk('treasury: a typed amount buys that much',r['en'] and r['custom']==[250,750],r)
    chk('treasury: Sell All pays the shares back at the price less the fee',r['sell'][0]==r['sell'][1] and r['sell'][2],r)
    chk('treasury: choosing a venture and a range redraws the board',r['v']==[2,'2'] and r['rg']=='1W',r)
    ev("()=>{TRS200.h={crystal:{s:40,c:3900}};rX()}");pg.wait_for_timeout(500);shot('treas_held')
    ev("()=>closeX()");pg.wait_for_timeout(1600)
    r=ev("()=>[T223.tm,[...document.querySelectorAll('#xwB .t223 canvas')].every(c=>c.width==0)]")
    chk('treasury: closing stops the timer and empties the canvases',r[0]==0 and r[1],r)
    # ---------------- phone width ----------------
    pg.set_viewport_size({'width':390,'height':844});ev("()=>{try{applyDev('mobile')}catch(_){}}");pg.wait_for_timeout(1200)
    for k,js in [('alch',"openX('alch')"),('cook',"openX('cook')"),('treas',"TRS200.h={caravan:{s:30,c:1400}};ST200.open.treas()")]:
        ev("()=>{"+js+"}");pg.wait_for_timeout(1000)
        f=ev(FIT);chk(k+' (phone): readable, no sideways overflow',not f['low'] and max(f['over'])<=1,f)
        shot(k+'_phone');ev("()=>closeX()")
    pg.set_viewport_size({'width':W,'height':H})
play.run(s,w=W,hh=H)
logs=open(play.TMP+'/lastlogs.txt').read()
chk('no page errors','PAGEERROR' not in logs and 'v223' not in logs,[l for l in logs.split('\n') if 'PAGEERROR' in l or 'v223' in l][:3])
print('v223_stations:','ALL PASS' if not bad else 'FAILED %d'%len(bad))
import sys;sys.exit(1 if bad else 0)
