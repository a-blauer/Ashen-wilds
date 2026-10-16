# v79: music + sound effects. Checks theme switching, fight intensity, volume settings, no errors,
# and renders an offline audio preview of every theme to test/out/v79_music.wav (MP3 too if ffmpeg exists).
import play,json,os,base64,wave,subprocess
O=play.TMP
SEG=[('title',0,14),('town',0,18),('z0',0,12),('z0',1,8),('z1',0,10),('z1',1,10),('z2',0,8),('z2',1,10),('z3',0,10),('z3',1,10),('z4',0,12),('z4',1,8),('z5',0,10),('z5',1,10),('boss',1,16)]
def game(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:600])
    P('audio',"()=>{audio();return [AUD&&AUD.state,!!MU.a,MU.cur]}")
    pg.wait_for_timeout(2500)
    P('town',"()=>[MU.cur,MU.int.toFixed(2),regionAt(Math.round(pl.position.x),Math.round(pl.position.z))]")
    for i in range(6):
        ev("i=>{const p=PMAP[i];toPos(p.path[40][0],p.path[40][1]);snapCam();enemies.forEach(e=>{e.agg=0})}",i)
        pg.wait_for_timeout(2200)
        P('zone%d'%i,"()=>[MU.cur,MU.want,MU.th&&MU.th.bpm]")
    P('fight',"()=>{window.__e=spawnEnemy('goo',pl.position.x+3,pl.position.z,30,{});__e.agg=1;return 1}")
    pg.wait_for_timeout(2500)
    P('fightInt',"()=>[MU.cur,MU.int.toFixed(2)]")
    P('vol',"()=>{const r=$('s_mus');r.value=0.2;r.dispatchEvent(new Event('input'));const s=$('s_sfxV');s.value=0;s.dispatchEvent(new Event('input'));return [SET.mus,SET.sfxV,SET.sfx,AUD.out.gain.value,JSON.parse(localStorage.getItem('et_set')).mus]}")
    P('vol2',"()=>{const s=$('s_sfxV');s.value=1;s.dispatchEvent(new Event('input'));$('s_mus').value=.55;$('s_mus').dispatchEvent(new Event('input'));return [SET.sfx,AUD.out.gain.value]}")
    P('sfx',"()=>{['coin','pick','rare','lvl','fall','elite','victory','whoosh','gulp','mount','open','close','tick','warp'].forEach(k=>mSfx(k));heroLevelUp();gold+=50;pickup({ic:'⚔️',t:'x',r:3});return hero.lvl}")
    pg.wait_for_timeout(500)
    P('death',"()=>{AWD.dead=1;return 1}");pg.wait_for_timeout(2000);P('deadMusic',"()=>[MU.cur]");ev("()=>{AWD.dead=0}")
    # analyser: real output is not silent
    P('rms',"()=>new Promise(r=>{const an=MU.a.createAnalyser();an.fftSize=2048;MU.g.connect(an);let m=0,n=0;const id=setInterval(()=>{const d=new Float32Array(2048);an.getFloatTimeDomainData(d);let s=0;for(const x of d)s+=x*x;m=Math.max(m,Math.sqrt(s/d.length));if(++n>20){clearInterval(id);r(m.toFixed(4))}},100)})")
    # offline preview render
    if os.environ.get('NOREN'):return
    pg.set_default_timeout(600000)
    r=ev("""async SEG=>{const SR=24000,tot=SEG.reduce((a,s)=>a+s[2],0)+3;const off=new OfflineAudioContext(2,Math.ceil(SR*tot),SR);
      const keep={...MU};muInit(off,off.destination);MU.g.gain.value=.55;let T=.1;
      for(const [th,f,dur] of SEG){MU.th=MTH[th];MU.s=0;MU.bar=0;MU.phr=null;MU.int=f;MU.fightT=-99;
        MU.xg.gain.setValueAtTime(0,T);MU.xg.gain.linearRampToValueAtTime(1,T+.6);MU.xg.gain.setValueAtTime(1,T+dur-.8);MU.xg.gain.linearRampToValueAtTime(0,T+dur);
        let t=T;while(t<T+dur-.8){muStep(t);t+=60/MU.th.bpm/4;if(++MU.s>=16){MU.s=0;MU.bar++}}T+=dur}
      Object.assign(MU,keep);
      const buf=await off.startRendering();const L=buf.getChannelData(0),R=buf.getChannelData(1),o=new Int16Array(L.length*2);let pk=0;
      for(let i=0;i<L.length;i++){pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));o[2*i]=Math.max(-1,Math.min(1,L[i]))*32767;o[2*i+1]=Math.max(-1,Math.min(1,R[i]))*32767}
      let s='';const u=new Uint8Array(o.buffer);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return {sr:SR,pk,b:btoa(s)}}""",SEG)
    raw=base64.b64decode(r['b']);print('render peak',round(r['pk'],3),'seconds',len(raw)//4/r['sr'])
    w=wave.open(O+'/v79_music.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(r['sr']);w.writeframes(raw);w.close()
    try:subprocess.run(['ffmpeg','-y','-loglevel','error','-i',O+'/v79_music.wav','-b:a','128k',O+'/v79_music.mp3'],check=True);print('mp3 ok')
    except Exception as e:print('no mp3',e)
play.run(game,w=1000,hh=620)
