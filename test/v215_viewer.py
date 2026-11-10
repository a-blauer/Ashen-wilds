# v215 animation viewer: the Bosses tab's Movement group (Idle, Walk, Run) for Argus — he paces at his walk / run speed with the v215 gait
# and his body is the v215 one. FAIL lines on: Argus not ready, not the v215 body, no Movement actions, speed off, errors.
# Build first: ./viewer/build_viewer.sh
import sys,os,json,base64;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
os.environ['SRC']=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dist','kq-anim-viewer.html')
import play
fails=[]
def F(*a):fails.append(' '.join(map(str,a)));print('FAIL',*a)
def s(pg):
    pg.set_default_timeout(2400000);ev=pg.evaluate
    for i in range(120):
        if ev("()=>!!(window.KV&&KV.on)"):break
        pg.wait_for_timeout(1000)
    ev("""()=>{KVCLK.manual=true;window.ERR=[];const cap=fn=>function(){ERR.push([].map.call(arguments,a=>a&&a.stack?String(a.stack).slice(0,300):String(a)).join(' '));return fn.apply(console,arguments)};
      console.warn=cap(console.warn);console.error=cap(console.error);window.addEventListener('error',e=>ERR.push('ERR '+e.message));window.ST=ms=>{for(let i=0;i<Math.round(ms/16);i++)KVCLK.tick(16)};ST(300);return 1}""")
    for i in range(40):
        if ev("()=>KVCLK.cbs.length>=2"):break
        pg.wait_for_timeout(250)
    r=ev("()=>{KVselect('boss','s0');for(let i=0;i<60&&!KVbossReady();i++)ST(250);const e=KV.boss&&KV.boss.e;return {ok:KVbossReady(),v215:!!(e&&e.sv&&e.sv.R.v215),acts:KVactions().filter(k=>['bidle','bwalk','brun'].includes(k))}}")
    print('argus',json.dumps(r))
    if not r['ok']:F('Argus not ready in the viewer');return
    if not r['v215']:F('the viewer Argus is not the v215 body')
    if r['acts']!=['bidle','bwalk','brun']:F('Movement actions',r['acts'])
    ai=ev("()=>{const a=KV.boss.e.sv.B.ai||{};return [a.walk||2.2,a.run||Math.max((a.walk||2.2)*1.6,3.6)]}")
    for k,want in [('bwalk',ai[0]),('brun',ai[1])]:
        o=ev("""(k)=>{ERR.length=0;KVact(k);ST(2500);const e=KV.boss.e,S=e.sv,p0=e.m.position.clone();let mx=0;for(let i=0;i<60;i++){ST(32);mx=Math.max(mx,S.spd)}
          return {spd:+S.spd.toFixed(2),mx:+mx.toFixed(2),moved:+p0.distanceTo(e.m.position).toFixed(2),err:ERR.filter(x=>!/fishing|audio|AudioContext/i.test(x)).slice(0,3)}}""",k)
        print(k,json.dumps(o))
        if not want*.75<=o['mx']<=want*1.15:F(k,'peak speed %.2f (his %.1f)'%(o['mx'],want))
        if o['moved']<.5:F(k,'he did not move')
        if o['err']:F(k,'errors',o['err'])
    o=ev("()=>{ERR.length=0;KVact('bidle');ST(3000);const e=KV.boss.e;return {spd:+e.sv.spd.toFixed(2),err:ERR.slice(0,3)}}")
    print('bidle',json.dumps(o))
    if o['spd']>.3:F('idle: still moving',o['spd'])
    if o['err']:F('idle errors',o['err'])
    print('==== v215_viewer: %d fails'%len(fails))
play.run(s)
