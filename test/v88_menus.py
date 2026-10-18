# v88 menus: slot inventory, tooltips with comparison, slot shops, forge tab, companion tabs.
# SRC=<html> AW_TMP=<out dir> python3 v88_menus.py      (MOB=1 for the mobile layout run)
import play,json,os
O=play.TMP;MOB=os.environ.get('MOB')
SETUP="""()=>{try{ren.render=()=>{};if(typeof POST!='undefined'&&POST)POST.render=()=>{}}catch(_){}hero.lvl=24;gold=50000;for(let r=0;r<5;r++){['weapon','helm','chest','boots','amulet','ring'].forEach(sl=>{const it=genItem(18+r,{sl,cls:hero.cls,minR:r});it.r=r;if(r==3)it.up=4;gear.push(it)})}
  const bad=genItem(30,{sl:'chest',cls:'mage'});gear.push(bad);
  for(let i=0;i<3;i++)hatch(Object.assign(rollEgg(2),{basic:true}));eggs.push(rollEgg(2));const e2=rollEgg(3);e2.t0=Date.now()-1e6;eggs.push(e2);
  mats.wood=12;mats.iron=5;mats[UPM[2][0]]=9;mats['Beast Hide']=4;sup.f_meat=3;sup.p_mp=2;sup.meat=6;sup.r_ember=1;hsDirty();
  SH.shop.magic=1;SH.shop.merchant=1;SH.shop.sage=1;SH.shop.stable=1;SH.shop.cook=1;return gear.length}"""
def s(pg):
    ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:900])
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=%s]'%('mobile' if MOB else 'desktop'),timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P('setup',SETUP)
    pre='v88m_' if MOB else 'v88_'
    ev("()=>{bagTab2=0;$('bagBtn').click()}");pg.wait_for_timeout(1500)
    P('bag',"()=>({tiles:document.querySelectorAll('#bl .kqm-slot.kqm-it').length,empty:document.querySelectorAll('#bl .kqm-slot.kqm-empty').length,doll:document.querySelectorAll('.kqm-doll .kqm-slot').length,hv:!!document.querySelector('.kqm-doll #hv canvas'),tabs:[...document.querySelectorAll('#bt button')].map(b=>b.textContent)})")
    pg.screenshot(timeout=120000,path=O+'/'+pre+'bag.png')
    # hover a bag item (a legendary) and an equipped slot
    t=pg.locator('#bl .kqm-slot.kqm-it').nth(0)
    if MOB:
        t.tap();pg.wait_for_timeout(600)
    else:
        t.hover();pg.wait_for_timeout(400)
    P('tip',"()=>{const d=$('kqmTip');return d&&[d.style.display,d.innerText.slice(0,500)]}")
    pg.screenshot(timeout=120000,path=O+'/'+pre+'tip.png')
    if not MOB:
        pg.locator('.kqm-doll .kqm-slot.kqm-it').first.hover();pg.wait_for_timeout(400)
        P('tipEq',"()=>$('kqmTip').innerText.slice(0,200)")
        pg.screenshot(timeout=120000,path=O+'/'+pre+'tip_eq.png')
        pg.locator('.kqm-doll .kqm-empty').first.hover();pg.wait_for_timeout(300)
        P('tipEmpty',"()=>$('kqmTip').innerText.slice(0,200)")
        # unusable item dims + tooltip
        pg.locator('#bl .kqm-slot.kqm-no').first.hover();pg.wait_for_timeout(300)
        P('tipBad',"()=>$('kqmTip').innerText.slice(0,300)")
        pg.screenshot(timeout=120000,path=O+'/'+pre+'tip_bad.png')
    # click selects, footer has Equip; double-click / second tap equips
    P('before',"()=>{selI=null;rB0();return [eq.weapon&&eq.weapon.id,eq.helm&&eq.helm.id]}")
    first=pg.locator('#bl .kqm-slot.kqm-it:not(.kqm-no)').first
    fid=first.get_attribute('data-id')
    (first.tap() if MOB else first.click());pg.wait_for_timeout(400)
    P('sel',"()=>[selI,[...document.querySelectorAll('#idt button')].map(b=>b.textContent)]")
    pg.screenshot(timeout=120000,path=O+'/'+pre+'sel.png')
    if MOB:
        pg.locator('#bl [data-id="%s"]'%fid).tap()
    else:
        pg.locator('#bl [data-id="%s"]'%fid).dblclick()
    pg.wait_for_timeout(500)
    P('equipped',"()=>[SLOTS.some(k=>eq[k]&&eq[k].id==%s),gear.some(g=>g.id==%s)]"%(fid,fid))
    # lock
    ev("()=>{const it=gear[0];selI={k:'g',id:it.id};rB0()}");pg.wait_for_timeout(200)
    pg.click('#kqmLock');pg.wait_for_timeout(200)
    P('lock',"()=>[gear[0].lock,sellables().some(x=>x.k=='g'+gear[0].id),!!document.querySelector('#bl .kqm-lk')]")
    # sort + filter
    ev("()=>{const s=document.querySelector('.kqm-sort');s.value='rarity';s.dispatchEvent(new Event('change',{bubbles:true}))}");pg.wait_for_timeout(200)
    pg.locator('[data-kqf="helm"]').click();pg.wait_for_timeout(200)
    P('filter',"()=>[KQM.sort,KQM.filt,document.querySelectorAll('#bl .kqm-slot.kqm-it').length,gear.filter(i=>itT(i).sl=='helm').length]")
    pg.locator('[data-kqf="all"]').click();pg.wait_for_timeout(200)
    for tab,name in [(1,'mats'),(3,'sup'),(4,'eggs'),(7,'forge'),(8,'stats'),(2,'skills')]:
        pg.locator('#bt [data-bt="%d"]'%tab).click();pg.wait_for_timeout(500)
        if tab==3:
            pg.locator('[data-kqsup="f_meat"]').click();pg.wait_for_timeout(300)
            P('supSel',"()=>[KQM.supSel,$('idt').innerText.slice(0,120)]")
            if not MOB:pg.locator('[data-kqsup="f_meat"]').hover();pg.wait_for_timeout(300)
        if tab==1 and not MOB:
            pg.locator('#bl .kqm-slot.mi').first.hover();pg.wait_for_timeout(300)
        if tab==4 and not MOB:
            pg.locator('#bl [data-kqt^="egg:"]').first.hover();pg.wait_for_timeout(300)
        if tab==7:
            pg.locator('#bl .kqm-forge [data-k="e"]').first.click();pg.wait_for_timeout(400)
            P('forgePanel',"()=>$('kqmFP').innerText.slice(0,500)")
            P('forgeUp',"()=>{const it=kqmForgeItem(),u0=it.up||0;toPos(TOWNS[0].cx,TOWNS[0].cy);const b=document.querySelector('[data-kqup]');const d=b&&b.disabled;b&&b.click();return [u0,it.up,d,$('kqmFP').innerText.slice(0,80)]}")
        pg.screenshot(timeout=120000,path=O+'/'+pre+'bag_'+name+'.png')
    P('tabSaved',"()=>localStorage.getItem('kqm_menus')")
    ev("()=>{$('bag').classList.add('hide')}")
    # companions
    ev("()=>{openCmp()}");pg.wait_for_timeout(1200)
    P('ctabs',"()=>[...document.querySelectorAll('#kqmCT button')].map(b=>b.textContent)")
    for k in ['ov','st','sp','care','tal']:
        b=pg.locator('#kqmCT [data-kqc="%s"]'%k)
        if b.count():
            b.click();pg.wait_for_timeout(700)
            P('pane_'+k,"()=>[getComputedStyle($('cvw')).display,$('cd').scrollHeight,$('cd').clientHeight,$('cd').innerText.replace(/\\s+/g,' ').slice(0,160)]")
            pg.screenshot(timeout=120000,path=O+'/'+pre+'cmp_'+k+'.png')
    # buttons still work inside the tabs: lock, feed, talents
    P('btns',"()=>{KQM.ctab='ov';rC();const c=party[cmpSel];const l0=!!c.lock;$('mkLock').click();const l1=!!party[cmpSel].lock;KQM.ctab='care';rC();c.h=5;rC();const f=document.querySelector('#cd [data-feed]');const h0=c.h;f&&f.click();return [l0,l1,!!f,h0,Math.round(c.h),KQM.ctab,$('kqmCT').classList.contains('hide')]}")
    P('egg',"()=>{CE.sel=eggs[0].id;rC();return [$('kqmCT').classList.contains('hide'),getComputedStyle($('cvw')).display,$('cd').innerText.slice(0,60)]}")
    pg.screenshot(timeout=120000,path=O+'/'+pre+'cmp_egg.png')
    ev("()=>{CE.sel=null;rC();$('cmp').classList.add('hide')}")
    # shops
    ev("()=>{openShop('m')}");pg.wait_for_timeout(800)
    P('shop',"()=>[document.querySelectorAll('#sb .kqm-cell').length,document.querySelectorAll('#ss .kqm-cell').length,document.querySelectorAll('#sb .kqm-hold .rw').length]")
    pg.screenshot(timeout=120000,path=O+'/'+pre+'shop.png')
    gc=pg.locator('#sb .kqm-cell').nth(2)
    if MOB:gc.tap()
    else:gc.hover()
    pg.wait_for_timeout(400)
    P('shopTip',"()=>$('kqmTip').innerText.slice(0,400)")
    pg.screenshot(timeout=120000,path=O+'/'+pre+'shop_tip.png')
    gc.click();pg.wait_for_timeout(300)
    P('shopBar',"()=>document.querySelector('#sb .kqm-bbar').innerText")
    P('buy',"()=>{const g0=gold,n0=gear.length;document.querySelector('#sb .kqm-bbar [data-kqa]').click();return [g0-gold,gear.length-n0]}")
    pg.locator('#ss .kqm-cell').nth(1).click();pg.locator('#ss .kqm-cell').nth(2).click();pg.wait_for_timeout(300)
    P('sellSel',"()=>[sellSel.size,document.querySelectorAll('#ss .kqm-cell.kqm-sel').length,document.querySelector('#ss .sellbar').innerText]")
    pg.screenshot(timeout=120000,path=O+'/'+pre+'shop_sell.png')
    P('sell',"()=>{const g0=gold,n0=gear.length;document.querySelector('[data-sa=sell]').click();document.querySelector('[data-sa=yes]').click();return [gold-g0,n0-gear.length]}")
    ev("()=>{$('shop').classList.add('hide');openShop('x')}");pg.wait_for_timeout(600)
    P('mshop',"()=>document.querySelectorAll('#mst .kqm-cell').length")
    pg.screenshot(timeout=120000,path=O+'/'+pre+'mshop.png')
    ev("()=>{$('mshop').classList.add('hide')}")
    for nm,js in [('curio',"openX('visitor','merchant')"),('sage',"openX('visitor','sage')"),('stable',"openX('stable',0)"),('cook',"openX('cook')"),('hold',"openX('hold')")]:
        ev("()=>{"+js+"}");pg.wait_for_timeout(900)
        P(nm,"()=>[document.querySelectorAll('#xwB .kqm-cell').length,document.querySelectorAll('#xwB .kqm-hold .rw').length]")
        if nm=='stable':
            pg.locator('#xwB .kqm-cell').nth(3).click();pg.wait_for_timeout(600)
            P('stableSel',"()=>[mSel,document.querySelector('#xwB .kqm-bbar').innerText]")
            P('stableBuy',"()=>{const n=mounts.length;document.querySelector('#xwB .kqm-bbar [data-kqa]').click();return mounts.length-n}")
        if nm=='cook':
            c=pg.locator('#xwB .kqm-cell').first
            if c.count():
                c.click();pg.wait_for_timeout(300)
                P('mktBuy',"()=>{const b=[...document.querySelectorAll('#xwB .kqm-bbar [data-kqa]')];const ks=[...document.querySelectorAll('#xwB [data-ibuy]')].map(x=>x.dataset.ibuy),tot=()=>ks.reduce((a,k)=>a+cnt(k),0)/2;const n0=tot();b[1]&&b[1].click();return [b.map(x=>x.textContent),tot()-n0]}")
        if nm=='curio' and not MOB:
            pg.locator('#xwB .kqm-cell').first.hover();pg.wait_for_timeout(300)
        pg.screenshot(timeout=120000,path=O+'/'+pre+'x_'+nm+'.png')
        ev("()=>$('xw').classList.add('hide')")
    P('paladinDoll',"()=>{const c=hero.cls;hero.cls='paladin';rB0();const n=[...document.querySelectorAll('.kqm-doll .kqm-slot')].map(x=>x.dataset.kqs||x.dataset.k);hero.cls=c;rB0();return n}")
    print('ERRS',errs[:5])
def run_ctx(steps,w,hh,touch):
    # like play.run (longer page-load timeout); MOB=1 uses a touch-screen context so taps report pointerType "touch"
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
        ctx=b.new_context(viewport={'width':w,'height':hh},has_touch=touch);pg=ctx.new_page()
        pg.add_init_script('window.AW_NOTITLE=1')
        pg.goto('file://'+play.TMP+'/live.html',wait_until='domcontentloaded',timeout=400000);pg.wait_for_timeout(4500)
        steps(pg);b.close()
if MOB:run_ctx(s,412,860,True)
else:run_ctx(s,1280,800,False)
