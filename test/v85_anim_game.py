# v85 animation smoke test in the live game loop: walk with companions, stop, ride a mount, shoot a bow while moving.
#   SRC=<build.html> AW_TMP=<outdir> python3 v85_anim_game.py
# Prints gait state (speed, stride rate, move weight) for hero/companion/mount and any page errors; writes v85_game_*.png.
import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="ranger"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev("()=>{window.requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16);ren.render=()=>{};POST.render=()=>{};hatch(Object.assign(rollEgg(1),{basic:true}));hatch(Object.assign(rollEgg(1),{basic:true}))}")
    pg.wait_for_timeout(1500)
    st="()=>{const g=o=>o&&o._ga?{v:+o._ga.v.toFixed(2),hz:+(o._ga.f||0).toFixed(2),w:+o._ga.w.toFixed(2)}:null;return {hero:g(pl),comp:fols.map(f=>f&&g(f)),mount:mModel&&g(mModel.r),riding:!!riding}}"
    ev("()=>{K.d=true}");pg.wait_for_timeout(2500);print('walking',json.dumps(ev(st)))
    ev("()=>{K.d=false}");pg.wait_for_timeout(1500);print('stopped',json.dumps(ev(st)))
    print('mount',ev("()=>{hero.lastHit=-1e9;enemies.forEach(e=>e.agg=0);if(!mounts.length)mounts.push({id:950,k:'pony',n:'Pony',spd:20,cap:60,dist:0});mActive=mounts[0].id;toggleMount();return !!riding}"))
    ev("()=>{K.a=true}");pg.wait_for_timeout(2500);print('riding',json.dumps(ev(st)))
    ev("()=>{K.a=false;if(riding)dismount();const tp=ITPL.findIndex(t=>t.cls=='ranger'&&t.wt=='bow');eq.weapon={id:uid++,tp,lv:1,req:1,r:1,up:0,aff:[]};hsDirty();refreshGear();K.w=true;atkCd=0;swing()}")
    pg.wait_for_timeout(300);print('shooting',ev("()=>({cur:!!HA.cur,arrowFx:!!(BOW_FX&&BOW_FX.g.visible),shots:shots.length})"))
    pg.wait_for_timeout(1500);print('after shot',ev("()=>{K.w=false;return {cur:!!HA.cur,arrowFx:!!(BOW_FX&&BOW_FX.g.visible),shots:shots.length}}"))
play.run(s,w=1000,hh=620)
