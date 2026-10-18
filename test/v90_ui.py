# v90 ui: cheats password, location box under the minimap, drag & drop equipment.
# PART=cheats,layout,drag (default all) · AW_TMP=<out dir> · screenshots out/v90_*.png
import play,json,os
from playwright.sync_api import Page as _Pg
_g0=_Pg.goto
def _goto(self,url,**k):
    k['timeout']=max(k.get('timeout') or 0,600000);return _g0(self,url,**k)
_Pg.goto=_goto
T=play.TMP
PART=os.environ.get('PART','cheats,layout,drag')
FAIL=[]
LONG='Searing Sands · Lv 32 (27–35) · Rec: companion B ⚠ · power 10,650 ⚠'
def s(pg):
    pg.set_default_timeout(600000);ev=pg.evaluate;errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>{localStorage.clear();try{sessionStorage.clear()}catch(_){}}")
    pg.click('[data-dev=desktop]');pg.click('[data-c="warrior"]');pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    def P(n,c,a=None):
        r=ev(c,a) if a is not None else ev(c);print(n,'=>',json.dumps(r)[:900]);return r
    def ok(n,c):
        print('CHECK',n,'OK' if c else 'FAIL')
        if not c:FAIL.append(n)
    def shot(name,clip=None):
        pg.screenshot(path=T+'/'+name,timeout=900000,clip=clip)

    # ---------------- 1. cheats password ----------------
    if 'cheats' in PART:
        ev("()=>openSet()");pg.wait_for_timeout(500)
        r=P('locked',"()=>[!!$('chLock'),$('chLock').offsetParent!==null,$('cheatBtn').offsetParent===null,$('cheatBox').offsetParent===null,CHU.on]")
        ok('locked at start',r[0] and r[1] and r[2] and r[3] and not r[4])
        pg.locator('#chLock').scroll_into_view_if_needed();shot('v90_cheat_locked.png',pg.locator('#setw .panel, #setw').first.bounding_box())
        # typing in the field must not reach game hotkeys (o closes settings, i opens the bag, w moves)
        pg.click('#chPw');pg.keyboard.type('woikb9');pg.wait_for_timeout(200)
        r=P('typed',"()=>[$('chPw').value,$('setw').classList.contains('hide'),$('bag').classList.contains('hide'),!!K.w,!!K.o]")
        ok('field eats hotkeys',r[0]=='woikb9' and not r[1] and r[2] and not r[3] and not r[4])
        pg.keyboard.press('Enter');pg.wait_for_timeout(200)
        r=P('wrong',"()=>[CHU.on,$('chErr').textContent,$('chErr').offsetParent!==null,$('cheatBox').offsetParent===null]")
        ok('wrong password rejected',not r[0] and r[1] and r[2] and r[3])
        shot('v90_cheat_wrong.png',pg.locator('#chLock').bounding_box())
        # handlers refuse while locked (hidden controls clicked by script)
        r=P('blocked',"()=>{const g=gold;$('ch_money').checked=true;$('ch_money').onchange();$('ch_lv1').onclick();return [CHEAT.money,gold==g,hero.lvl,$('ch_money').checked]}")
        ok('locked handlers do nothing',not r[0] and r[1] and r[2]==1 and not r[3])
        pg.fill('#chPw','112233');pg.keyboard.press('Enter');pg.wait_for_timeout(300)
        r=P('unlocked',"()=>[CHU.on,$('chLock').offsetParent===null,$('cheatBtn').offsetParent!==null,sessionStorage.getItem('kq_cheatpw'),$('chPw').value]")
        ok('correct password unlocks',r[0] and r[1] and r[2] and r[3]=='1' and r[4]=='')
        pg.click('#cheatBtn');pg.wait_for_timeout(300);pg.locator('#cheatBox').scroll_into_view_if_needed()
        shot('v90_cheat_open.png',pg.locator('#setw .panel, #setw').first.bounding_box())
        pg.click('#ch_lv1');r=P('lv after unlock',"()=>hero.lvl");ok('cheat works unlocked',r==2)
        pg.click('#chLockBtn');pg.wait_for_timeout(200)
        r=P('relocked',"()=>[CHU.on,$('chLock').offsetParent!==null,$('cheatBox').offsetParent===null,sessionStorage.getItem('kq_cheatpw')]")
        ok('lock button',not r[0] and r[1] and r[2] and r[3] is None)
        # a flag that was on in the save keeps working while locked
        r=P('flag kept',"()=>{CHEAT.god=true;hero.hp=-5;down();return [CHEAT.god,hero.hp>0]}")
        ok('active flag keeps working',r[0] and r[1]);ev("()=>{CHEAT.god=false;cheatSave()}")
        # session unlock survives a reopen of settings
        ev("()=>CHU.unlock('112233')");ev("()=>{$('setw').classList.add('hide');openSet()}")
        r=P('reopen',"()=>[CHU.on,$('chLock').offsetParent===null]");ok('session unlock kept',r[0] and r[1])
        ev("()=>{CHU.lock();$('setw').classList.add('hide')}")

    # ---------------- 2. location box layout ----------------
    if 'layout' in PART:
        ev("""(t)=>{window.LB=()=>{const q=id=>{const e=$(id);if(!e||e.offsetParent===null||getComputedStyle(e).display=='none')return null;const b=e.getBoundingClientRect();return b.width?[Math.round(b.left),Math.round(b.top),Math.round(b.right),Math.round(b.bottom)]:null};
          const r={};['mini','locBox','fsBtn','sysBtn','evtk','tgt','boss','topl','sysmenu','mbtn','joy'].forEach(k=>r[k]=q(k));r.lines=$('locBox')?Math.round($('locBox').getBoundingClientRect().height):0;return r};
          window.OV=(a,b)=>a&&b&&a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3];
          // anything else on the HUD that the location box now covers
          window.HITS=()=>{const lb=$('locBox').getBoundingClientRect(),L=[lb.left,lb.top,lb.right,lb.bottom];return [...$('stage').querySelectorAll('*')].filter(e=>{if(e===$('locBox')||e.closest('#locBox')||e.contains($('locBox'))||e.id=='mini'||e.closest('.modal')||e.tagName=='CANVAS')return false;const cs=getComputedStyle(e);if(cs.position!='absolute'&&cs.position!='fixed')return false;if(e.offsetParent===null||cs.visibility=='hidden'||+cs.opacity==0)return false;const b=e.getBoundingClientRect();return b.width>4&&b.height>4&&b.width<innerWidth*.6&&OV(L,[b.left,b.top,b.right,b.bottom])}).map(e=>e.id||e.className)};
          if(!window.__fh){window.__fh=1;window.__hud=hud}
          const st=document.createElement('style');st.id='fkst';document.head.appendChild(st);
          window.FAKE=(boss,txt)=>{const s=txt||t,i=s.indexOf(' · Rec');window.FT=i<0?s:s.slice(0,i)+' <span class="rec">'+s.slice(i+1)+'</span>';hud=__hud;hud();hud=()=>{};$('areaT').innerHTML=FT;v90LocBuild();v90Lay(true);
            let d=$('evtk');if(!d){d=document.createElement('div');d.id='evtk';d.className='glass';$('stage').appendChild(d);try{v90Lay(true)}catch(_){}}
            d.classList.remove('hide');d.innerHTML='<b>⚡ Blood Moon</b><span>Elites roam the Dirge</span><small>2:41 left</small>';
            document.body.classList.toggle('bossf',!!boss);document.body.classList.toggle('bfxT',!!boss);$('bossN').textContent='Ssith\\'ra, Sovereign of Sands';
            $('fkst').textContent='#tgt{display:flex!important}'+(boss?'#boss{display:block!important}':'');$('tgN')&&($('tgN').textContent='Brood Neck');
            if(boss){const g=$('tgt'),b=$('boss').getBoundingClientRect(),p=g.offsetParent.getBoundingClientRect();$('fkst').textContent+='#tgt{top:'+Math.round(b.bottom-p.top+6)+'px!important}'}}}""",LONG)
        def lay(tag,boss=False,txt=None):
            ev("([b,t])=>FAKE(b,t)",[boss,txt]);pg.wait_for_timeout(1500)
            r=P('lay '+tag,"()=>LB()")
            m,l=r['mini'],r['locBox']
            short=tag.startswith('mob_land')
            if short:  # short landscape phone: box left of the minimap on the top row
                ok(tag+' loc left of mini',m and l and l[2]<=m[0] and abs(l[1]-m[1])<=8 and l[3]-l[1]<=48)
            else:
                ok(tag+' loc under mini',m and l and l[1]>=m[3]-1 and l[1]-m[3]<16 and abs(l[0]-m[0])<=8 and abs(l[2]-m[2])<=8)
            for k in ['fsBtn','sysBtn','evtk','tgt','boss','topl','mbtn','joy']:
                if r.get(k):ok(tag+' no overlap loc/'+k,not ev("([a,b])=>OV(a,b)",[l,r[k]]))
            for k in ['fsBtn','sysBtn','evtk']:
                for o in ['mbtn','joy','boss','tgt','topl']+(['evtk'] if k!='evtk' else []):
                    if r.get(k) and r.get(o):ok(tag+' no overlap '+k+'/'+o,not ev("([a,b])=>OV(a,b)",[r[k],r[o]]))
                if not short and k!='evtk' and r.get(k):ok(tag+' '+k+' below loc',r[k][1]>=l[3])
            if r.get('tgt') and r.get('boss'):ok(tag+' tgt below boss',r['tgt'][1]>=r['boss'][3])
            h=P('hits',"()=>HITS()");ok(tag+' nothing else under loc',not h)
            shot('v90_loc_'+tag+'.png')
        pg.set_viewport_size({'width':1100,'height':760});lay('desk');lay('desk_boss',True)
        lay('desk_short',False,'🏰 Duskhold · Safe haven')
        P('sysmenu',"()=>{$('sysBtn').click();return LB().sysmenu}");shot('v90_loc_desk_menu.png');ev("()=>$('sysmenu').classList.add('hide')")
        pg.set_viewport_size({'width':1920,'height':1080});lay('full');lay('full_boss',True)
        ev("()=>applyDev('mobile')");pg.set_viewport_size({'width':844,'height':390});pg.wait_for_timeout(600);lay('mob_land');lay('mob_land_boss',True)
        pg.set_viewport_size({'width':390,'height':844});pg.wait_for_timeout(600);lay('mob_port');lay('mob_port_boss',True)
        pg.set_viewport_size({'width':600,'height':560});ev("()=>applyDev('desktop')");pg.wait_for_timeout(600);lay('narrow')
        ev("()=>{window.FT=null;hud=__hud;document.body.classList.remove('bossf','bfxT');$('fkst').textContent='';$('evtk').classList.add('hide')}")
        pg.set_viewport_size({'width':1100,'height':760});pg.wait_for_timeout(400)

    # ---------------- 3. drag & drop equipment ----------------
    if 'drag' in PART:
        ev("""()=>{hero.lvl=24;gear.length=0;SLOTS.forEach(s=>delete eq[s]);
          ['weapon','helm','chest','boots','amulet','ring'].forEach(sl=>{const it=genItem(18,{sl,cls:hero.cls,minR:2});it.r=2;gear.push(it)});
          const hi=genItem(40,{sl:'helm',cls:hero.cls});hi.req=60;hi.r=3;gear.push(hi);const bad=genItem(20,{sl:'chest',cls:'mage'});gear.push(bad);
          window.ID={w:gear[0].id,h:gear[1].id,c:gear[2].id,r:gear[5].id,hi:hi.id,bad:bad.id};bagTab2=0;KQM.filt='all';KQM.sort='new';
          refreshGear();$('bagBtn').click();return [gear.length,ID,itT(bad).cls||itT(bad).arm]}""");pg.wait_for_timeout(1500)
        # centre of the element's visible part (small slots are scrolled into view first; big drop areas are not)
        C=lambda sel:ev("""(s)=>{const e=document.querySelector(s);if(!e)return null;let b=e.getBoundingClientRect();if(b.height<120&&(b.top<0||b.bottom>innerHeight)){e.scrollIntoView({block:'nearest'});b=e.getBoundingClientRect()}
          let p=e.parentElement;let t=Math.max(0,b.top),u=Math.min(innerHeight,b.bottom);while(p&&p!==document.body){const q=p.getBoundingClientRect(),o=getComputedStyle(p).overflowY;if(o=='auto'||o=='scroll'||o=='hidden'){t=Math.max(t,q.top);u=Math.min(u,q.bottom)}p=p.parentElement}
          return [b.left+b.width/2,(t+u)/2]}""",sel)
        G=lambda id:'#bl .kqm-bagg [data-k="g"][data-id="%d"]'%id
        DS=lambda sl:'.kqm-doll [data-kqs="%s"]'%sl
        EQ=lambda id:'.kqm-doll [data-k="e"][data-id="%d"]'%id
        ids=ev("()=>ID")
        MID="()=>[V90D.on,!!document.querySelector('.v90-ghost'),[...document.querySelectorAll('#bag .v90-ok')].map(e=>e.dataset.kqs||e.dataset.id),[...document.querySelectorAll('#bag .v90-no')].length,$('kqmTip')?$('kqmTip').style.display:'none',!!document.querySelector('.v90-binz')]"
        def drag(a,b,shotname=None,steps=8):
            pa=C(a);pb=C(b) if isinstance(b,str) else b
            if not pa or not pb:print('missing',a,b,pa,pb);return [False]*6
            pg.mouse.move(*pa);pg.mouse.down()
            for i in range(1,steps+1):pg.mouse.move(pa[0]+(pb[0]-pa[0])*i/steps,pa[1]+(pb[1]-pa[1])*i/steps);pg.wait_for_timeout(30)
            mid=P('mid',MID)
            if shotname:shot(shotname)
            pg.mouse.up();pg.wait_for_timeout(400);return mid
        pg.mouse.move(*C(G(ids['w'])));pg.wait_for_timeout(500);P('tip before',"()=>$('kqmTip')&&$('kqmTip').style.display")
        m=drag(G(ids['w']),DS('weapon'),'v90_drag_weapon.png')
        ok('drag ghost + highlight + no tooltip',m[0] and m[1] and 'weapon' in m[2] and m[4]=='none')
        r=P('weapon eq',"()=>[eq.weapon&&eq.weapon.id==ID.w,gear.some(g=>g.id==ID.w),!document.querySelector('.v90-ghost'),!document.body.classList.contains('v90drag')]")
        ok('drop equips weapon',r[0] and not r[1] and r[2] and r[3])
        drag(G(ids['h']),DS('chest'))
        r=P('wrong slot',"()=>[!eq.helm,!eq.chest,gear.some(g=>g.id==ID.h),$('glog').textContent.slice(-90)]")
        ok('wrong slot rejected',r[0] and r[1] and r[2] and 'Head' in r[3])
        m=drag(G(ids['hi']),DS('helm'),'v90_drag_lowlv.png')
        r=P('low level',"()=>[!eq.helm,gear.some(g=>g.id==ID.hi),$('glog').textContent.slice(-80),!!document.querySelector('.kqm-doll .v90-flash')]")
        ok('level rejected',m[3]>=1 and r[0] and r[1] and 'level' in r[2] and r[3])
        shot('v90_drag_reject.png')
        drag(G(ids['bad']),DS('chest'))
        r=P('class',"()=>[!eq.chest,$('glog').textContent.slice(-60)]");ok('class rejected',r[0] and 'class' in r[1])
        drag(G(ids['r']),DS('ring'));drag(G(ids['c']),DS('chest'))
        r=P('ring chest',"()=>[eq.ring&&eq.ring.id==ID.r,eq.chest&&eq.chest.id==ID.c]");ok('ring + chest equipped',r[0] and r[1])
        drag(G(ids['h']),'#hv');r=P('hero drop',"()=>eq.helm&&eq.helm.id==ID.h");ok('drop on hero equips',r)
        ev("()=>{const it=genItem(19,{sl:'weapon',cls:hero.cls});it.r=4;gear.push(it);ID.w2=it.id;rB0()}");pg.wait_for_timeout(300);ids=ev("()=>ID")
        drag(G(ids['w2']),EQ(ids['w']))
        r=P('swap',"()=>[eq.weapon.id==ID.w2,gear.some(g=>g.id==ID.w)]");ok('swap weapon',r[0] and r[1])
        m=drag(EQ(ids['r']),'#bl .kqm-bagg','v90_drag_unequip.png')
        r=P('unequip',"()=>[!eq.ring,gear.some(g=>g.id==ID.r)]");ok('drag to bag unequips',m[5] and r[0] and r[1])
        pg.click(G(ids['r']),timeout=30000);r=P('click',"()=>[selI&&selI.id==ID.r,V90D.on,!document.querySelector('.v90-ghost')]");ok('click selects',r[0] and not r[1] and r[2])
        pg.dblclick(G(ids['r']),timeout=30000);pg.wait_for_timeout(300);r=P('dbl',"()=>eq.ring&&eq.ring.id==ID.r");ok('double-click equips',r)
        # touch (CDP touch events -> pointer events): long-press then drag
        cdp=pg.context.new_cdp_session(pg);cdp.send('Emulation.setTouchEmulationEnabled',{'enabled':True,'maxTouchPoints':5})
        def touch(a,b,hold=650,steps=8):
            pa=C(a);pb=C(b)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':pa[0],'y':pa[1]}]});pg.wait_for_timeout(hold)
            for i in range(1,steps+1):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':pa[0]+(pb[0]-pa[0])*i/steps,'y':pa[1]+(pb[1]-pa[1])*i/steps}]});pg.wait_for_timeout(40)
            mid=ev("()=>[V90D.on,!!document.querySelector('.v90-ghost')]")
            cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});pg.wait_for_timeout(400);return mid
        m=touch(EQ(ids['r']),'#bl .kqm-bagg')
        r=P('touch unequip',"()=>[!eq.ring,gear.some(g=>g.id==ID.r)]");ok('touch long-press drag unequips',m[0] and r[0] and r[1])
        m=touch(G(ids['r']),DS('ring'))
        r=P('touch equip',"()=>eq.ring&&eq.ring.id==ID.r");ok('touch drag equips',m[0] and r)
        # quick swipe and tap: headless delivers CDP input seconds late, so these two run as synthetic pointer events
        # dispatched in one go (real event times), which is what the long-press timing reads
        SYN="""(a)=>new Promise(res=>{const el=document.querySelector(a.sel),b=el.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2;
          const P=(t,dx,dy)=>el.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:77,pointerType:'touch',isPrimary:true,clientX:x+dx,clientY:y+dy}));
          P('pointerdown',0,0);if(a.mv){P('pointermove',0,-30);P('pointermove',0,-60)}
          setTimeout(()=>{const on=V90D.on;P('pointerup',0,a.mv?-60:0);if(!a.mv)el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:x,clientY:y}));
            setTimeout(()=>res([on,V90D.on,!!V90D.p,!!document.querySelector('.v90-ghost')]),600)},a.wait)})"""
        ev("()=>{KQM.touch=true}")
        r=P('swipe',SYN,{'sel':G(ids['hi']),'mv':1,'wait':500});ok('quick touch swipe is not a drag',not r[0] and not r[1] and not r[2] and not r[3])
        r=P('tap',SYN,{'sel':G(ids['bad']),'mv':0,'wait':60});r2=P('tap sel',"()=>selI&&selI.id==ID.bad");ok('touch tap selects (no drag)',not r[0] and not r[2] and r2)
        shot('v90_drag_after.png')
        # mobile: tapping the cheat password field focuses it (on-screen keyboard) and typing works
        ev("()=>{$('bag').classList.add('hide');applyDev('mobile');openSet()}");pg.set_viewport_size({'width':390,'height':844});pg.wait_for_timeout(800)
        ev("()=>$('chPw').scrollIntoView({block:'center'})");pa=C('#chPw')
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':pa[0],'y':pa[1]}]});pg.wait_for_timeout(80);cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});pg.wait_for_timeout(500)
        pg.keyboard.type('112233');r=P('mobile field',"()=>[document.activeElement&&document.activeElement.id,$('chPw').value,$('setw').classList.contains('hide')]")
        ok('mobile tap focuses password field',r[0]=='chPw' and r[1]=='112233' and not r[2])
        shot('v90_cheat_mobile.png');pg.keyboard.press('Enter');pg.wait_for_timeout(300);r=P('mobile unlock',"()=>CHU.on");ok('mobile unlock',r)
    print('ERRS',errs[:5]);print('FAILS',FAIL)
play.run(s,w=1100,hh=760)
