import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:900])
    P('hatch',"()=>{for(let i=0;i<2;i++){hatch(Object.assign(rollEgg(1),{basic:true}))};party[1].tr='Universal';sup.f_meat=(sup.f_meat||0)+2;sup.meat=(sup.meat||0)+3;gold=1234;hero.lvl=5;hud();return party.map(c=>c.n)}")
    pg.wait_for_timeout(2500)
    P('feed',"()=>{const c=party[0];c.h=Math.round(M(c)*.3);const h0=c.h;feedBest(0);const r=[h0,c.h,JSON.stringify(c.fhot),sup.f_meat,sup.meat];compRegen(2,performance.now());r.push(Math.round(c.h));compRegen(10,performance.now());r.push(Math.round(c.h),M(c),c.fhot);return r}")
    P('regen',"()=>{const c=party[0];c.h=10;c._dt=0;c._ph=10;compRegen(10,performance.now()+1e6);return [Math.round(c.h*10)/10,M(c)]}")
    P('hud',"()=>{hud();return [$('locBox').textContent,$('chInfo').innerText,$('cbars').innerText,[...document.querySelectorAll('#cbars img')].length,getComputedStyle(document.querySelector('.bar-row')).display]}")
    pg.wait_for_timeout(1500)
    pg.locator('#stage').screenshot(path=play.TMP+'/v79_hud.png',timeout=120000,animations='disabled')
    pg.screenshot(path=play.TMP+'/v79_full.png',timeout=120000,animations='disabled',full_page=True)
    P('cmp',"()=>{cmpSel=1;openCmp();return [...$('cd').querySelectorAll('.kv')].slice(0,5).map(r=>r.innerText).concat([$('cd').innerText.match(/MODIFIERS[\\s\\S]{0,80}/i)?.[0]])}")
    pg.wait_for_timeout(1200)
    pg.screenshot(path=play.TMP+'/v79_cmp.png',timeout=120000,animations='disabled')
    P('close',"()=>{$('cmp').classList.add('hide');mats.wood=12;mats['Beast Hide']=3;bagTab2=1;return 1}")
    ev("()=>{const b=$('bagBtn')||document.querySelector('[data-open=bag]');if(typeof openBag=='function')openBag();else if(b)b.click()}")
    pg.wait_for_timeout(800)
    el=pg.locator('.mi').first
    print('mi count',pg.locator('.mi').count())
    if pg.locator('.mi').count():
        el.click();pg.wait_for_timeout(300)
        P('hint',"()=>$('mhint')&&$('mhint').innerText")
        pg.screenshot(path=play.TMP+'/v79_hint.png',timeout=120000,animations='disabled')
    P('hints',"()=>{if(!MSRC)MSRC=msrcBuild();return Object.values(MSRC).map(h=>h.n+': '+h.t).slice(0,40)}")
play.run(s,w=1280,hh=800)
