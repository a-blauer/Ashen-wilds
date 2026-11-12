# v225 pictures of the windows: the creator's Appearance step and the Barber with the new options, Settings → Cheats with the
# Teleport row, Cheddar's board at a computer screen size (keeper at the side), the food pouch's Add food list with basic foods.
# (the Appearance step is opened directly, as the title screen does). Writes out/v225_ui_<name><TAG>.png
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
TAG=os.environ.get('TAG','')
def shot(pg,n):
    print('shot',n,flush=True);pg.wait_for_timeout(500);pg.screenshot(path=play.TMP+'/v225_ui_%s%s.png'%(n,TAG),timeout=600000)
def s(pg):
    pg.set_default_timeout(180000)
    pg.click('[data-dev=desktop]',timeout=120000);pg.wait_for_timeout(800)
    pg.click('[data-c="assassin"]',timeout=120000);pg.wait_for_timeout(2000)
    pg.evaluate("()=>{LK.on=1;ccRender()}");pg.wait_for_timeout(2500)
    pg.evaluate("()=>{LK.look=Object.assign({},LK.look,{pat:1,fp:1,scar:2,hs:1.06,tl:1.15});lkStep()}");pg.wait_for_timeout(2500);shot(pg,'creator')
    pg.evaluate("()=>{const a=$('ccList'),b=$('ccInfo');if(a)a.scrollTop=9999;if(b)b.scrollTop=9999}");shot(pg,'creator_scrolled')
    pg.evaluate("()=>{LK.on=0;ccStep=1;ccRender()}");pg.wait_for_timeout(800);pg.click('#ccNext');pg.wait_for_timeout(4000)
    pg.evaluate("()=>{try{CHEAT.god=true}catch(_){}}")
    pg.evaluate("()=>openBarber()");pg.wait_for_timeout(2500);shot(pg,'barber')
    pg.evaluate("()=>lkBarberClose(false)")
    pg.evaluate("()=>{openSet();$('cheatBox').classList.remove('hide');cheatSync();const s=$('ch_tp');s.innerHTML=tp225Opts();s.value='sabeksi';$('cheatBox').scrollIntoView()}");shot(pg,'cheats')
    pg.evaluate("()=>{$('setw').classList.add('hide')}")
    pg.evaluate("()=>{const P=CHQ148.P&&CHQ148.P.ch&&CHQ148.P.ch.root;if(!P)return;const p=P.getWorldPosition(new THREE.Vector3());toPos(p.x+1.6,p.z+1.6)}");pg.wait_for_timeout(3000)
    pg.evaluate("()=>openX('chq132')");pg.wait_for_timeout(4000);shot(pg,'cheddar');pg.evaluate("()=>closeX()")
    pg.evaluate("()=>{if(SUP.meat)sup.meat=6;else mats.meat=6;if(SUP.berries)sup.berries=9;else mats.berries=9;CF206.open=true;if(typeof openCmp=='function')openCmp()}")
    pg.evaluate("()=>{try{$('cmp').classList.remove('hide');rC()}catch(e){console.warn(e)}}");pg.wait_for_timeout(1500);shot(pg,'pouch')
play.run(s,w=1280,hh=800)
