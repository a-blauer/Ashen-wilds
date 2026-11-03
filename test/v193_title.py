# v193: "The Blade" title screen. Press Start → menu; the scene draws (and stops + frees itself when the title goes);
# main menu items for no hero / one hero / two heroes / three heroes; Choose Hero shows the v116 slot list and Back;
# arrow keys move the cursor; Settings opens over the title and goes back into #stage on close; the composed title
# theme schedules without errors; Continue loads the hero. Screenshots: out/v193_press.png, v193_menu.png, v193_heroes.png.
#   TITLE=1 python3 v193_title.py     (TITLE is set by this script)
import os,json
os.environ['TITLE']='1'
import play
O=play.TMP
def chk(n,ok,info=''):print(('ok   ' if ok else 'FAIL ')+n,'' if ok else str(info)[:400],flush=True)
def s(pg):
    ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    # rebuild the title with Press Start (it is skipped under automation unless KQ_PRESS)
    ev("()=>{window.KQ_PRESS=1;const o=$('awT');if(o)o.remove();awTitle()}");pg.wait_for_timeout(2500)
    r=ev("()=>{const T=$('awT'),c=$('bt193c');return {bt:T&&T.classList.contains('bt193'),menu:T.classList.contains('menu'),press:getComputedStyle(T.querySelector('.bt193p')).display!='none',on:BT193.on,cw:c&&c.width,ch:c&&c.height,vis:c&&c.classList.contains('on')}}")
    chk('press start shows first, the scene draws at low resolution',r['bt'] and not r['menu'] and r['press'] and r['on']==1 and r['ch']==200 and r['cw']>200 and r['vis'],r)
    px=ev("()=>{const c=$('bt193c'),g=c.getContext('webgl')||c.getContext('webgl2');if(!g)return null;const p=new Uint8Array(4*16);BT193.S.frame(performance.now());g.readPixels((c.width/2|0)-2,(c.height/2|0),8,2,g.RGBA,g.UNSIGNED_BYTE,p);let n=0;for(let i=0;i<p.length;i+=4)n+=p[i]+p[i+1]+p[i+2];return n}")
    chk('the scene is not blank',px is None or px>0,px)
    pg.screenshot(path=O+'/v193_press.png',timeout=120000)
    pg.keyboard.press('Enter');pg.wait_for_timeout(1200)
    r=ev("()=>{const T=$('awT'),b=[...T.querySelectorAll('.awm button')];return {menu:T.classList.contains('menu'),items:b.map(x=>(x.dataset.aw)+':'+(x.dataset.slot||'')),foc:document.activeElement&&(document.activeElement.dataset.aw)}}")
    chk('no hero: New Character (slot 1), Settings, Join a Friend; cursor on New',r['menu'] and r['items']==['new:0','set:','join:'] and r['foc']=='new',r)
    pg.keyboard.press('ArrowDown');pg.wait_for_timeout(200)
    chk('arrow down moves the cursor',ev("()=>document.activeElement.dataset.aw")=='set')
    pg.keyboard.press('ArrowUp');pg.keyboard.press('ArrowUp');pg.wait_for_timeout(200)
    chk('arrow up wraps around',ev("()=>document.activeElement.dataset.aw")=='join')
    pg.wait_for_timeout(1500);pg.screenshot(path=O+'/v193_menu.png',timeout=120000)
    # settings over the title
    ev("()=>document.querySelector('#awT [data-aw=set]').click()");pg.wait_for_timeout(500)
    r=ev("()=>({open:!$('setw').classList.contains('hide'),inT:$('awT').contains($('setw'))})")
    chk('Settings opens over the title',r['open'] and r['inT'],r)
    ev("()=>$('setClose').click()");pg.wait_for_timeout(500)
    r=ev("()=>({hid:$('setw').classList.contains('hide'),back:$('stage').contains($('setw'))})")
    chk('closing Settings puts it back in the game window',r['hid'] and r['back'],r)
    # the composed title theme: schedule two full loops on the music clock without errors
    r=ev("""()=>{try{audio()}catch(_){}if(!AUD)return {na:1};if(!MU.a){muInit(AUD,AUD.destination)}MU.th=MTH.title;const t=AUD.currentTime;let n=0;
      for(let bar=0;bar<32;bar++)for(let st=0;st<16;st++){MU.bar=bar;MU.s=st;muStep(t+bar*4+st*.25);n++}
      return {n,err:!!MU.err193,score:typeof MTH.title.score=='function',bpm:MTH.title.bpm}}""")
    chk('title theme schedules 2 loops without errors',r.get('na') or (r['n']==512 and not r['err'] and r['score'] and r['bpm']==60),r)
    # heroes: one, then two, then three
    ev("""()=>{const hero0={name:'Ana',cls:'warrior',lvl:7};const mk=(n,c,l)=>JSON.stringify({wv:3,at:Date.now(),hero:{name:n,cls:c,lvl:l,look:null},bossDone:[]});
      localStorage.setItem(KQSL.keys[0],mk('Ana','warrior',7));kqSlotSet(0);const o=$('awT');if(o)o.remove();window.KQ_PRESS=0;awTitle()}""");pg.wait_for_timeout(600)
    r=ev("()=>[...$('awT').querySelectorAll('.awm button')].map(x=>(x.dataset.aw)+':'+(x.dataset.slot||'')+':'+x.textContent.slice(0,40))")
    chk('one hero: Continue (Ana) first, New Character in slot 2',r[0].startswith('cont:0:Continue') and 'Ana' in r[0] and r[1].startswith('new:1') and not any(x.startswith('heroes') for x in r),r)
    ev("""()=>{const mk=(n,c,l)=>JSON.stringify({wv:3,at:Date.now(),hero:{name:n,cls:c,lvl:l,look:null},bossDone:[]});localStorage.setItem(KQSL.keys[1],mk('Bex','mage',12));const o=$('awT');if(o)o.remove();awTitle()}""");pg.wait_for_timeout(600)
    r=ev("()=>[...$('awT').querySelectorAll('.awm button')].map(x=>(x.dataset.aw)+':'+(x.dataset.slot||''))")
    chk('two heroes: Choose Hero appears',r[:3]==['cont:0','new:2','heroes:'],r)
    ev("()=>document.querySelector('#awT [data-aw=heroes]').click()");pg.wait_for_timeout(400)
    r=ev("()=>({rows:document.querySelectorAll('#awT .kqsl-r').length,cont:[...document.querySelectorAll('#awT [data-aw=cont]')].map(b=>b.dataset.slot),dl:document.querySelectorAll('#awT [data-sld]').length,back:!!document.querySelector('#awT [data-aw=back]')})")
    chk('Choose Hero lists the three slots with delete and Back',r['rows']==3 and r['cont']==['0','1'] and r['dl']==2 and r['back'],r)
    pg.screenshot(path=O+'/v193_heroes.png',timeout=120000)
    ev("()=>document.querySelector('#awT [data-aw=back]').click()");pg.wait_for_timeout(300)
    chk('Back goes back to the main menu',ev("()=>BT193.view=='main'&&!!document.querySelector('#awT [data-aw=heroes]')"))
    ev("""()=>{const mk=(n,c,l)=>JSON.stringify({wv:3,at:Date.now(),hero:{name:n,cls:c,lvl:l,look:null},bossDone:[]});localStorage.setItem(KQSL.keys[2],mk('Cy','ranger',3));const o=$('awT');if(o)o.remove();awTitle()}""");pg.wait_for_timeout(600)
    r=ev("()=>[...$('awT').querySelectorAll('.awm button')].map(x=>(x.dataset.aw)+':'+(x.dataset.slot||''))")
    chk('three heroes: New Character opens the slot list instead',r[:3]==['cont:0','replace:','heroes:'],r)
    # a real hero: make one, reload, Continue loads it and the scene stops and frees itself
    ev("()=>{localStorage.clear();const o=$('awT');if(o)o.remove();awTitle()}");pg.wait_for_timeout(500)
    ev("()=>document.querySelector('#awT [data-aw=new]').click()");pg.wait_for_timeout(1500)
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=120000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    chk('New Character → creator → in game, title gone, scene stopped',ev("()=>party.length>0&&!$('awT')&&BT193.on==0&&!BT193.S&&!$('bt193c')"),ev("()=>[party.length,!!$('awT'),BT193.on]"))
    ev("()=>{hero.name='Tess';saveGame(true)}");pg.reload(timeout=240000);pg.wait_for_function('document.readyState=="complete"',timeout=240000);pg.wait_for_timeout(4000)
    r=ev("()=>{const b=document.querySelector('#awT .awm button');return b&&[b.dataset.aw,b.textContent]}")
    chk('after reload: Continue Tess is first',r and r[0]=='cont' and 'Tess' in r[1],r)
    pg.keyboard.press('Enter')
    try:pg.wait_for_function("()=>party.length>0&&!$('awT')&&BT193.on==0",timeout=60000)
    except Exception:pass
    chk('Enter continues the hero',ev("()=>party.length>0&&hero.name=='Tess'&&!$('awT')&&BT193.on==0"),ev("()=>[party.length,hero.name,!!$('awT')]"))
    chk('no page errors',not errs,errs[:4])
play.run(s,w=1100,hh=640)
