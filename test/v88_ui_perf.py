# v88 UI: cost of the icon layer. Measures hud() with and without the emoji MutationObserver, the observer's total work
# over a stretch of normal play, canvas icon draws, and that no raw emoji is left in visible DOM text.
#   SRC=<html> AW_TMP=<outdir> python3 v88_ui_perf.py
import play,json,v88_ui_run
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=120000);ev("()=>$('ccNext').click()");pg.wait_for_timeout(600);ev("()=>$('ccNext').click()");pg.wait_for_timeout(4000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:900])
    P('setup',"()=>{for(let i=0;i<2;i++){hatch(Object.assign(rollEgg(1),{basic:true}))};hero.buffs.push({n:'Test',i:'🔥',t:performance.now()+9e5});hud();return [KQIS.n,KQIS.nodes,KQIS.icons,KQIS.canvas,Math.round(KQIS.t)]}")
    # hud() + the observer's microtask, 300 times, observer on vs off
    # hud() + the observer's microtask, observer on vs off, interleaved 4x to even out machine load
    P('hud x150 x4',"""async()=>{const run=async()=>{const t0=performance.now();for(let i=0;i<150;i++){hud();cbarsRender&&cbarsRender();await 0}return (performance.now()-t0)/150};
      const on=[],off=[],obs=[];let made=0;
      for(let k=0;k<4;k++){const t=KQIS.t,n0=KQIS.nodes;on.push(await run());obs.push((KQIS.t-t)/150);made+=(KQIS.nodes-n0)/150;
        KQ_MO.disconnect();off.push(await run());KQ_MO.observe(document.body,{childList:true,subtree:true,characterData:true})}
      const md=a=>a.slice().sort((x,y)=>x-y)[a.length>>1];
      return {ms_per_hud_with_icons:+md(on).toFixed(3),ms_per_hud_without:+md(off).toFixed(3),observer_ms_per_hud:+md(obs).toFixed(3),icons_per_hud:+(made/4).toFixed(1),hud_calls_per_s:5}}""")
    P('play10s',"()=>{window.__k0={n:KQIS.n,t:KQIS.t,nodes:KQIS.nodes,c:KQIS.canvas,t0:performance.now()};return 1}")
    pg.wait_for_timeout(10000)
    P('observer over 10s',"()=>{const k=__k0,dt=(performance.now()-k.t0)/1000;return {seconds:+dt.toFixed(1),callbacks:KQIS.n-k.n,ms_total:+(KQIS.t-k.t).toFixed(2),ms_per_second:+((KQIS.t-k.t)/dt).toFixed(3),icons_made:KQIS.nodes-k.nodes,canvas_icon_draws:KQIS.canvas-k.c}}")
    P('totals',"()=>({callbacks:KQIS.n,ms:Math.round(KQIS.t),icon_spans:KQIS.nodes,icon_rules:KQIS.icons,canvas_icon_draws:KQIS.canvas,unknown_emoji:KQ_MISS,bitmaps:Object.keys(KQ_BMP).length})")
    P('raw emoji left in DOM text',"""()=>{const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let t;
      while(t=w.nextNode()){const p=t.parentElement;if(!p||p.closest('.kqi,script,style'))continue;const m=t.data.match(/\\p{Extended_Pictographic}/gu);if(m&&!/^[▶◀]+$/.test(m.join('')))out.push(m.join('')+' @'+(p.id||p.className||p.tagName))}
      const at=[...document.querySelectorAll('[title]')].filter(e=>/\\p{Extended_Pictographic}/u.test(e.title)).length;return {text:out.slice(0,20),titles_with_emoji:at}}""")
    P('textContent kept',"()=>[$('goldT').textContent,$('goldT').querySelectorAll('.kqi').length]")
    # a 3D sign texture and a minimap-style label drawn with emoji: saved to PNG to eyeball the canvas icons
    d=ev("""()=>{const t=txTex([{t:'THE LAST LANTERN',f:'700 52px'},{t:'🍺 INN & ALE · BEDS FOR WEARY HEROES 🛏️',f:'600 24px'}],512,128,'#2e1f12','#f4e9c8','#c9a24a');
      const c=document.createElement('canvas');c.width=512;c.height=200;const g=c.getContext('2d');g.drawImage(t.image,0,0);g.fillStyle='#0a0d12';g.fillRect(0,128,512,72);
      g.font='700 12px system-ui,sans-serif';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';g.textAlign='center';g.strokeText('🌀 Portal Court',120,150);g.fillStyle='#fff3c8';g.fillText('🌀 Portal Court',120,150);
      g.font='64px serif';g.textBaseline='middle';g.fillText('🐟',300,165);g.textAlign='left';g.font='600 11px system-ui';g.fillStyle='#ddd';g.fillText('● you   ⛺ camp   ◆ Sovereign   ✕ treasure   🔵 ally',16,190);return c.toDataURL()}""")
    import base64;open(play.TMP+'/v88_canvas.png','wb').write(base64.b64decode(d.split(',')[1]));print('canvas png saved')
v88_ui_run.run(s,w=1100,hh=680)
