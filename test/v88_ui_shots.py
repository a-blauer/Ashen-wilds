# v88 UI theme + icon layer: screenshot tour of every major UI state.
#   SRC=<html> AW_TMP=<outdir> [PFX=ui] [ONLY=town,bag,...] [MOB=1] python3 v88_ui_shots.py
#   TITLE=1 runs the title screen only.
import play,json,os,v88_ui_run
O=play.TMP;PFX=os.environ.get('PFX','ui');ONLY=os.environ.get('ONLY','').split(',') if os.environ.get('ONLY') else None
def shot(pg,n,anim=False):
    pg.wait_for_timeout(700 if not anim else 150)
    pg.screenshot(path=O+'/%s_%s.png'%(PFX,n),timeout=180000,**({} if anim else {'animations':'disabled'}))
    print('shot',n)
CLOSE="()=>{document.querySelectorAll('.modal.w').forEach(m=>m.classList.add('hide'));const s=$('sysmenu');s&&s.classList.add('hide');try{if(typeof closeX=='function')closeX()}catch(_){};return 1}"
def emo(pg,n):
    # visible emoji left anywhere in the DOM text (outside our icon spans)
    r=pg.evaluate("""()=>{const RX=/\\p{Extended_Pictographic}/u,out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let t;
      while(t=w.nextNode()){const p=t.parentElement;if(!p||p.closest('.kqi,script,style'))continue;if(!p.offsetParent&&getComputedStyle(p).position!='fixed')continue;
        const m=t.data.match(/\\p{Extended_Pictographic}/gu);if(m)out.push(m.join('')+' @'+(p.id||p.className||p.tagName))}
      return out.slice(0,20)}""")
    print('EMOJI',n,r)
def title(pg):
    pg.wait_for_timeout(2500);shot(pg,'title');emo(pg,'title')
    pg.keyboard.press('Enter');pg.wait_for_timeout(1500);shot(pg,'devp');emo(pg,'devp')
    pg.click('[data-dev=desktop]',timeout=60000);pg.wait_for_timeout(800);shot(pg,'create');emo(pg,'create')
def game(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=120000);ev("()=>$('ccNext').click()");pg.wait_for_timeout(600);ev("()=>$('ccNext').click()");pg.wait_for_timeout(4000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:600])
    P('setup',"()=>{for(let i=0;i<2;i++){hatch(Object.assign(rollEgg(1),{basic:true}))};gold=4321;hero.lvl=12;sup.f_meat=3;sup.p_mp=2;try{for(let i=0;i<14;i++){const it=genItem(hero.lvl,{minR:i%5,cls:i%3?hero.cls:undefined});if(it)gear.push(it)}}catch(e){console.log('items',e)};Object.keys(RES).forEach(k=>mats[k]=7);eggs.push(rollEgg(2));hud();return party.map(c=>c.n)}")
    if os.environ.get('MOB'):ev("()=>applyDev('mobile')");pg.wait_for_timeout(1500)
    st=[('town',None),('sys',"()=>{$('sysmenu').classList.remove('hide')}"),
        ('bag',"()=>{$('bagBtn').click()}"),('cmp',"()=>{openCmp()}"),('set',"()=>{openSet()}"),('tal',"()=>{openTal()}"),
        ('map',"()=>{openWMap()}"),('hold',"()=>{openX('hold')}"),('shop',"()=>{openShop('m')}"),('portal',"()=>{openX('portal',0)}"),
        ('bosses',"()=>{openX('bosses')}"),('mounts',"()=>{openMounts()}"),('fuse',"()=>{$('fuseBtn').click()}")]
    for n,js in st:
        if ONLY and n not in ONLY:continue
        ev(CLOSE)
        if js:
            r=ev("()=>{try{("+js+")();return 'ok'}catch(e){return String(e)}}");print(n,r)
        shot(pg,n);emo(pg,n)
    ev(CLOSE)
    if not ONLY or 'zone' in ONLY:
        P('zone',"()=>{const p=PMAP[0];toPos(p.path[40][0],p.path[40][1]);snapCam();window.__e=spawnEnemy('goo',pl.position.x+3,pl.position.z-2,14,{});__e.ai=0;setTarget(__e);hero.buffs.push({n:'Test',i:'🔥',t:performance.now()+60000});hud();tgtHud();return 1}")
        pg.wait_for_timeout(2500);shot(pg,'zone');emo(pg,'zone')
        P('say',"()=>{say('🪙 You found 25 gold');say('⚔️ Elite slain · 🩸 Bleed');banner('👑 Sovereign Slain','Argus falls','✨ New power');pickup({ic:'💎',t:'Gem of Ash',col:'#a78bfa',r:3,sub:'Epic'});return 1}")
        ev("()=>document.getAnimations().forEach(a=>{try{a.currentTime=900;a.pause()}catch(_){}})");shot(pg,'toast',True);emo(pg,'toast')
    if not ONLY or 'dead' in ONLY:
        P('die',"()=>{hero.hp=1;hitHero(window.__e||enemies[0],3);return [AWD.dead]}")
        pg.wait_for_timeout(3000);shot(pg,'dead');emo(pg,'dead')
if os.environ.get('TITLE'):v88_ui_run.run(title,w=1100,hh=680)
else:v88_ui_run.run(game,w=int(os.environ.get('VW','1100')),hh=int(os.environ.get('VH','680')))
