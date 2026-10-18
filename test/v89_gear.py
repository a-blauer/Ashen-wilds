# v89 gear track: item icons rendered from each item's 3D model (bag, paper doll, shop grids, tooltips, loot popup),
# held weapon = icon model, ground loot model, cache cap, no-WebGL fallback, and the vampire collar models.
# SRC=<html> AW_TMP=<out dir> python3 v89_gear.py
import play,json,os
O=play.TMP;BAD=[]
SETUP="""()=>{try{ren.render=()=>{};if(typeof POST!='undefined'&&POST)POST.render=()=>{}}catch(_){}hero.lvl=30;gold=90000;
  const sl=['weapon','helm','chest','boots','amulet','ring'];for(let r=0;r<5;r++)sl.forEach(s=>{const it=genItem(14+r*4,{sl:s,cls:hero.cls,minR:r});it.r=r;gear.push(it)});
  [ITPL_V78,ITPL_V78+5,ITPL_V78+45,ITPL_V78+46,ITPL_V78+48,ITPL_V78+80,ITPL_V78+90].forEach((tp,i)=>{const it=genItem(20,{sl:ITPL[tp].sl,cls:hero.cls});it.tp=tp;it.r=(i+2)%5;gear.push(it)});
  hsDirty();return gear.length}"""
def chk(name,ok,info=''):
    print(('OK   ' if ok else 'FAIL ')+name,info)
    if not ok:BAD.append(name)
def waitIcons(pg,sel,ms=400000):
    pg.wait_for_function("(s)=>V89I.q.length==0&&!document.querySelector(s+' [data-kqg]')",arg=sel,timeout=ms);pg.wait_for_timeout(300)
def s(pg):
    ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    print('gear',ev(SETUP))
    # ---- inventory ----
    ev("()=>{bagTab2=0;$('bagBtn').click()}");pg.wait_for_timeout(500)
    ph=ev("()=>document.querySelectorAll('#bl [data-kqg]').length")
    chk('placeholders queued first (lazy)',ph>0,ph)
    waitIcons(pg,'#bag')
    r=ev("""()=>{const im=[...document.querySelectorAll('#bl .kqm-slot.kqm-it img.kqgi')],keys=new Set(gear.map(v89Key));
      return {tiles:document.querySelectorAll('#bl .kqm-slot.kqm-it').length,imgs:im.length,src:new Set(im.map(i=>i.src)).size,keys:keys.size,blob:im.every(i=>i.src.startsWith('blob:')),
        loaded:im.filter(i=>i.complete&&i.naturalWidth==112).length,cache:V89I.cache.size,ms:Math.round(V89I.ms/Math.max(1,V89I.n)),lgb:Object.keys(LGB).filter(k=>k.startsWith('KQI')).length}}""")
    print('bag',json.dumps(r))
    chk('every bag tile shows a rendered picture',r['imgs']==r['tiles']==len(ev("()=>gear.map(g=>g.id)")),r)
    chk('one distinct picture per template+rarity',r['src']==r['keys'],r)
    chk('icon geometry disposed after rendering',r['lgb']==0,r['lgb'])
    # equip one of each slot, check the paper doll shows pictures and the hero holds the icon's weapon model
    ev("()=>{['weapon','helm','chest','boots','amulet','ring'].forEach(s=>{const it=gear.filter(g=>itT(g).sl==s&&canUse(g)).sort((a,b)=>b.r-a.r)[0];if(it){selI={k:'g',id:it.id};invAct()}});refreshGear();rB0()}")
    waitIcons(pg,'#bag')
    r=ev("""()=>{const d=[...document.querySelectorAll('.kqm-doll .kqm-slot.kqm-it')];const w=eq.weapon;
      return {doll:d.length,dollImg:d.filter(x=>x.querySelector('img.kqgi')).length,held:!!(pl.gearG||[]).find(o=>o.userData&&o.userData.wt==itT(w).wt),lw:Object.keys(LGB).includes('LW89|'+w.tp+'|'+w.r)}}""")
    print('doll',json.dumps(r))
    chk('paper doll slots show pictures',r['doll']>=5 and r['dollImg']==r['doll'],r)
    chk('hero holds the same weapon model as its icon',r['held'] and r['lw'],r)
    pg.screenshot(timeout=120000,path=O+'/v89_bag.png')
    pg.locator('#bl .kqm-slot.kqm-it').nth(0).hover();pg.wait_for_timeout(500)
    r=ev("()=>{const d=$('kqmTip');return [d.style.display,!!d.querySelector('.kqm-tn img.kqgi')]}")
    chk('tooltip header shows the picture',r[0]=='block' and r[1],r)
    pg.screenshot(timeout=120000,path=O+'/v89_bag_tip.png')
    pg.locator('#bt [data-bt="7"]').click();pg.wait_for_timeout(400);waitIcons(pg,'#bag')
    pg.screenshot(timeout=120000,path=O+'/v89_forge.png')
    ev("()=>{$('bag').classList.add('hide')}")
    # ---- Trading Post: buy and sell grids ----
    ev("()=>{stock2=null;openShop('m')}");pg.wait_for_timeout(500);waitIcons(pg,'#shop')
    r=ev("""()=>{const b=[...document.querySelectorAll('#sb .kqm-cell')],g=b.filter(c=>c._kq&&c._kq.item);
      return {cells:b.length,gear:g.length,img:g.filter(c=>c.querySelector('img.kqgi')).length,src:new Set(g.map(c=>(c.querySelector('img.kqgi')||{}).src)).size,keys:new Set(stock2.gear.map(v89Key)).size,
        sell:document.querySelectorAll('#ss .kqm-cell img.kqgi').length,potEmoji:!!document.querySelector('#sb .kqm-cell .kqi')}}""")
    print('shop',json.dumps(r))
    chk('shop gear slots show pictures',r['gear']>0 and r['img']==r['gear'] and r['src']==r['keys'],r)
    chk('sell grid shows pictures',r['sell']>0,r)
    chk('non-gear wares keep their icons',r['potEmoji'],r)
    pg.screenshot(timeout=120000,path=O+'/v89_shop_buy.png')
    pg.locator('#sb .kqm-cell').nth(3).click();pg.wait_for_timeout(300)
    pg.locator('#sb .kqm-cell').nth(3).hover();pg.wait_for_timeout(500)
    r=ev("()=>[!!document.querySelector('#sb .kqm-bbar img.kqgi'),!!document.querySelector('#kqmTip img.kqgi')]")
    chk('shop buy bar + tooltip show the picture',r[0] and r[1],r)
    pg.screenshot(timeout=120000,path=O+'/v89_shop_tip.png')
    ev("()=>{$('shop').classList.add('hide')}")
    # ---- loot pickup popup and the model on the ground ----
    r=ev("""()=>{const it=genItem(25,{sl:'chest',cls:hero.cls});it.r=4;it.tp=ITPL_V78+46;take_base({kind:'gear',data:it});
      const n0=drops.length;drop('gear',genItem(25,{sl:'helm',cls:hero.cls}),pl.position.clone(),3);const d=drops[drops.length-1];
      return {pk:!!document.querySelector('#pk .kqgp,#pk img.kqgi'),ground:Object.keys(LGB).some(k=>k.startsWith('LD89|')),dropped:drops.length>n0}}""")
    pg.wait_for_function("()=>V89I.cache.has('I'+(ITPL_V78+46)+'.4')",timeout=120000)
    r['pkImg']=ev("()=>{const it=genItem(25,{sl:'chest',cls:hero.cls});it.r=4;it.tp=ITPL_V78+46;take_base({kind:'gear',data:it});return !!document.querySelector('#pk img.kqgi')}")
    print('loot',json.dumps(r))
    chk('loot popup shows the picture',r['pk'] and r['pkImg'],r)
    chk('ground loot uses the item model',r['ground'] and r['dropped'],r)
    # ---- cache cap, no-WebGL fallback, main renderer untouched ----
    r=ev("""async()=>{const m=V89I.max;V89I.max=6;for(let tp=0;tp<14;tp++)icoOf({tp,r:1});await new Promise(res=>{const f=()=>V89I.q.length?setTimeout(f,50):setTimeout(res,300);f()});
      const sz=V89I.cache.size;V89I.max=m;const ok=V89I.ok;V89I.ok=false;const fb=icoOf({tp:3,r:2});V89I.ok=ok;return {sz,fb,ctx:CPIC.r&&CPIC.r.getContext()!==ren.getContext()}}""")
    print('cache',json.dumps(r))
    chk('icon cache is capped',r['sz']<=6,r)
    chk('no WebGL falls back to the old emoji',r['fb']==ev("()=>v89IcoOld({tp:3,r:2})"),r)
    chk('icons use the shared portrait renderer, not the main one',r['ctx'],r)
    # ---- vampire collars: two mirrored halves on the chest bone ----
    r=ev("""()=>{const out={};['vamp','vampm','vampk','vlord'].forEach(k=>{const g=mkHumanoid(k);g.updateMatrixWorld(true);let n=0;g.traverse(o=>{if(o.isMesh)n++});out[k]=n});
      const G=v89CollarGeo(true).inner,p=G.attributes.position;let l=0,rr=0,sy=0;for(let i=0;i<p.count;i++){const x=p.getX(i);if(x<-.01)l++;if(x>.01)rr++}return {out,l,rr}}""")
    print('collar',json.dumps(r))
    chk('collar has both halves (mirrored)',r['l']==r['rr'] and r['l']>0,r)
    print('errors',errs[:5]);chk('no page errors',not errs,errs[:3])
# a busy machine can take over two minutes to parse the page: give goto more time (play.py uses 120 s)
from playwright.sync_api import Page as _Pg, Browser as _Br  # SLOWLOAD
_g0=_Pg.goto;_Pg.goto=lambda self,url,**k:_g0(self,url,**dict(k,timeout=600000))
_n0=_Br.new_page;_Br.new_page=lambda self,*a,**k:(lambda p:(p.set_default_timeout(240000),p)[1])(_n0(self,*a,**k))
play.run(s,w=1100,hh=700)
print('RESULT', 'PASS' if not BAD else 'FAIL '+', '.join(BAD))
