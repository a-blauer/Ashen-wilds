# v88 abilities: real mouse ground targeting (reticle follows the mouse, click casts where aimed, right-click cancels)
# and screenshots of reticles + abilities mid-cast.  SRC=<html> AW_TMP=<out> python3 v88_skills_shots.py
import sys,json,os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from playwright.sync_api import sync_playwright
FAIL=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+(' · '+str(info)[:300] if info!='' else ''))
    if not ok:FAIL.append(name)
W,H=960,600
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':W,'height':H});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)+' '+(e.stack or '')[:400]))
    pg.on('console',lambda m:errs.append('console '+m.text) if m.type=='error' else None)
    pg.add_init_script('window.AW_NOTITLE=1')
    pg.goto('file://'+play.TMP+'/live.html',wait_until='domcontentloaded',timeout=120000);pg.wait_for_timeout(4000)
    ev=pg.evaluate;ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="mage"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{window.__r=ren.render;window.__pr=window.POST&&POST.render;window.FAST=on=>{if(on){ren.render=()=>{};if(window.POST)POST.render=()=>{}}else{ren.render=__r;if(window.POST)POST.render=__pr}}}")
    ev("()=>{FAST(1);const q=PMAP[0];toPos(q.path[40][0],q.path[40][1]);window.__P=[pl.position.x,pl.position.z];camYaw=0;camPitch=.75;camDist=13;snapCam();window.__hp=setInterval(()=>{hero.hp=Math.max(hero.hp,heroMax()*.6);hero.mp=999},50)}")
    pg.wait_for_timeout(2500)
    def setup(cls,ld,foes=5,spread=1.4,dz=5):
        return ev("""([c,ld,n,sp,dz])=>{kqsClear();hero.cls=c;hero.lvl=50;hero.tal={__ab:1};kqsAll(c).forEach(s=>hero.tal['ab:'+s.n]=1);hero.tal.__ld=ld;KQS.ck='';const tp=ITPL.findIndex(t=>t.cls==c&&t.sl=='weapon'&&t.t==4);eq.weapon={id:uid++,tp,lv:50,req:1,r:2,up:0,aff:[]};hsDirty();refreshGear();
           pl.position.x=__P[0];pl.position.z=__P[1];pl.rotation.y=Math.PI;hero.cd={};hero.mp=999;hero.cr=100;hero.buffs=hero.buffs.filter(b=>b.perm);hsDirty();enemies.filter(e=>!e.dead&&d2(e.m.position,pl.position)<40).forEach(e=>removeE(e));
           const out=[];for(let i=0;i<n;i++){const e=spawnEnemy('goo',pl.position.x+(i-(n-1)/2)*sp,pl.position.z-dz-(i%2)*1.2,40,{});e.__t=1;e.agg=0;e.cd=99;out.push(e)}window.__E=out;tgt=null;camYaw=0;camPitch=.75;camDist=13;snapCam();hud();return out.length}""",[cls,ld,foes,spread,dz])
    def shot(name,wait=1600):
        ev("()=>{FAST(0)}");pg.wait_for_timeout(wait);pg.screenshot(path=play.TMP+'/'+name+'.png');ev("()=>FAST(1)");print('  shot',name)
    def scr(wx,wz):  # world → screen point on the canvas
        return ev("([x,z])=>{cam.updateMatrixWorld();const v=new THREE.Vector3(x,GH(x,z),z).project(cam),r=gl.getBoundingClientRect();return [r.left+(v.x*.5+.5)*r.width,r.top+(-v.y*.5+.5)*r.height]}",[wx,wz])
    ev("()=>{const f=kqsTgFire;kqsTgFire=function(){window.__fp=KQS.tg&&KQS.tg.p.clone();return f.apply(this,arguments)}}")
    # ---------- mage: Comet Storm with the real mouse ----------
    setup('mage','Comet Storm|Wall of Fire|Singularity|Frozen Orb')
    tx,tz=ev("()=>[__E[3].m.position.x,__E[3].m.position.z]")
    pg.wait_for_timeout(3000);sx,sy=scr(tx,tz);pg.mouse.move(sx,sy);pg.wait_for_timeout(400)
    pg.keyboard.press('1');pg.wait_for_timeout(1200)
    r=ev("([x,y])=>{const q=kqsPick(x,y);return {tg:!!KQS.tg,p:KQS.tg&&[+KQS.tg.p.x.toFixed(1),+KQS.tg.p.z.toFixed(1)],m:q&&[+q.x.toFixed(1),+q.z.toFixed(1)],bar:!$('kqsTg').classList.contains('hide'),aim:!!document.querySelector('#acts .kqs-aim')}}",[sx,sy])
    chk('key 1 starts targeting; reticle under the mouse',r['tg'] and r['bar'] and r['aim'] and abs(r['p'][0]-r['m'][0])<.8 and abs(r['p'][1]-r['m'][1])<.8,r)
    shot('v88_ret_circle_comet',2200)
    pg.mouse.move(sx+60,sy+10);pg.wait_for_timeout(1500)
    want=ev("([x,y])=>{const p=kqsPick(x,y);return p&&[p.x,p.z]}",[sx+60,sy+10])
    hp0=ev("()=>__E.reduce((a,e)=>a+e.c.h,0)")
    pg.mouse.click(sx+60,sy+10);pg.wait_for_timeout(400)
    r=ev("()=>({fp:window.__fp&&[__fp.x,__fp.z],tg:!!KQS.tg,cd:hero.cd.s0||0,swing:atkCd})")
    chk('left-click casts where the mouse points (no basic attack)',r['fp'] and want and abs(r['fp'][0]-want[0])<.6 and abs(r['fp'][1]-want[1])<.6 and not r['tg'] and r['cd']>0,[r,want])
    pg.wait_for_timeout(1400);shot('v88_cast_comet_storm',2500)
    pg.wait_for_timeout(5000)
    r=ev("(h0)=>h0-__E.reduce((a,e)=>a+(e.dead?0:e.c.h),0)",hp0);chk('comets hit the enemies near the point',r>0,r)
    # right-click cancels
    pg.mouse.move(sx,sy);pg.keyboard.press('2');pg.wait_for_timeout(1500);a=ev("()=>!!KQS.tg")
    shot('v88_ret_wall_fire',2000)
    pg.mouse.click(sx,sy,button='right');pg.wait_for_timeout(500)
    r=ev("()=>({tg:!!KQS.tg,cd:hero.cd.s1||0})");chk('right-click cancels (no cooldown)',a and not r['tg'] and r['cd']==0,r)
    pg.keyboard.press('2');pg.wait_for_timeout(900);pg.mouse.click(sx,sy);pg.wait_for_timeout(1200);shot('v88_cast_wall_fire',2400)
    pg.keyboard.press('3');pg.wait_for_timeout(900);pg.mouse.move(sx-80,sy);pg.wait_for_timeout(900);pg.mouse.click(sx-80,sy);pg.wait_for_timeout(1000);shot('v88_cast_singularity',2400)
    pg.wait_for_timeout(3000);ev("()=>{tgt=__E[2];cast(3)}");pg.wait_for_timeout(700);shot('v88_cast_frozen_orb',2000)
    # ---------- warrior: Seismic Rupture (line reticle), War Banner, Titan's Fall ----------
    setup('warrior',"Seismic Rupture|War Banner|Titan's Fall|Intimidating Shout")
    tx,tz=ev("()=>[__E[2].m.position.x,__E[2].m.position.z]");pg.wait_for_timeout(600);sx,sy=scr(tx,tz);pg.mouse.move(sx,sy)
    pg.keyboard.press('1');pg.wait_for_timeout(1200);shot('v88_ret_line_rupture',2000)
    pg.mouse.click(sx,sy);pg.wait_for_timeout(300);shot('v88_cast_seismic_rupture',1500)
    pg.keyboard.press('2');pg.wait_for_timeout(800);pg.mouse.move(sx-40,sy+40);pg.wait_for_timeout(900);pg.mouse.click(sx-40,sy+40);pg.wait_for_timeout(1500);shot('v88_cast_war_banner',2000)
    pg.keyboard.press('3');pg.wait_for_timeout(800);pg.mouse.move(sx+40,sy-20);pg.wait_for_timeout(900);pg.mouse.click(sx+40,sy-20);pg.wait_for_timeout(250);shot('v88_cast_titans_fall',1200)
    # ---------- paladin: Sanctuary + Heaven's Wrath + Blessed Hammers ----------
    setup('paladin',"Sanctuary|Heaven's Wrath|Blessed Hammers|Beacon of Light")
    pg.wait_for_timeout(600);sx,sy=scr(*ev("()=>[__E[2].m.position.x,__E[2].m.position.z]"));pg.mouse.move(sx,sy)
    pg.keyboard.press('2');pg.wait_for_timeout(900);pg.mouse.click(sx,sy);pg.wait_for_timeout(700)
    pg.keyboard.press('1');pg.wait_for_timeout(900);pg.mouse.move(sx,sy+90);pg.wait_for_timeout(900);pg.mouse.click(sx,sy+90);pg.wait_for_timeout(300);ev("()=>cast(2)");pg.wait_for_timeout(400);shot('v88_cast_paladin',2200)
    # ---------- assassin: Eclipse + Shadow Clone, ranger: Stampede reticle + Wild Hunt ----------
    setup('assassin','Eclipse|Shadow Clone|Caltrops|Venom Flask')
    pg.wait_for_timeout(600);sx,sy=scr(*ev("()=>[__E[2].m.position.x,__E[2].m.position.z]"));pg.mouse.move(sx,sy)
    pg.keyboard.press('1');pg.wait_for_timeout(900);pg.mouse.click(sx,sy);pg.wait_for_timeout(500);ev("()=>{cast(1)}");pg.keyboard.press('3');pg.wait_for_timeout(900);pg.mouse.move(sx+90,sy+60);pg.wait_for_timeout(800);pg.mouse.click(sx+90,sy+60)
    pg.wait_for_timeout(600);ev("()=>{__E.forEach(e=>{e.agg=1;e.cd=99})}");pg.wait_for_timeout(900);shot('v88_cast_assassin',2200)
    setup('ranger','Stampede|Wild Hunt|Explosive Trap|Entangling Roots')
    pg.wait_for_timeout(600);sx,sy=scr(*ev("()=>[__E[2].m.position.x,__E[2].m.position.z]"));pg.mouse.move(sx,sy)
    pg.keyboard.press('1');pg.wait_for_timeout(1200);shot('v88_ret_line_stampede',1800)
    pg.keyboard.press('1');pg.wait_for_timeout(250);shot('v88_cast_stampede',1000)
    ev("()=>{cast(1);__E.forEach(e=>e.agg=1)}");pg.wait_for_timeout(1500);pg.keyboard.press('4');pg.wait_for_timeout(900);pg.mouse.click(sx,sy);pg.wait_for_timeout(700);shot('v88_cast_ranger',2200)
    # ability window screenshot at level 50
    ev("()=>{KQS.sel='Stampede';openAbil()}");pg.wait_for_timeout(800);ev("()=>FAST(0)");pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/v88_abil_window.png')
    ev("()=>{closeX();openTal()}");pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/v88_tal_window.png')
    real=[e for e in errs if 'favicon' not in e];chk('no page errors',not real,real[:6])
    print('FAILED:',FAIL if FAIL else 'none');b.close()
