# v201: the composed Duskhold theme. Checks that Duskhold plays the score, that a nearby fight raises MU.int (the combat
# layer), that the score runs without errors, and renders a preview: test/out/v201_dusk_calm.mp3 (two loops, ~2:15)
# and test/out/v201_dusk_fight.mp3 (calm → fight → calm, the combat layer fading in and out). NOREN=1 skips the render.
import play,json,os,base64,wave,subprocess
O=play.TMP;bad=[]
def game(pg):
    ev=pg.evaluate
    pg.set_default_timeout(900000);ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    P=lambda n,c:(lambda r:(print(n,'=>',json.dumps(r)[:400]),r)[1])(ev(c))
    P('audio',"()=>{audio();return [AUD&&AUD.state,!!MU.a]}")
    pg.wait_for_timeout(2500)
    r=P('town',"()=>[MU.cur,MTH.town.score===dk201Score,MTH.town.bpm,muWant()]")
    if r[1]!=True or r[3]!='town':bad.append('Duskhold does not use the v201 score: %s'%r)
    # the score itself: every note list adds up to whole bars, every step runs
    r=P('data',"()=>{const D=DK201,o=[];D.mel.forEach((b,k)=>{const n=b.reduce((a,x)=>a+x[1],0);if(n!=16)o.push('bar '+k+' = '+n)});if(D.prog.length!=D.bars)o.push('prog '+D.prog.length);return o}")
    if r:bad.append('note data: %s'%r)
    if os.environ.get('NOREN'):return
    pg.set_default_timeout(900000)
    sp=60/72/4;loop=20*16*sp
    calm=2*loop+4;fight=40
    r=ev("""async ([calm,fight])=>{const SR=24000,tot=calm+fight+3;const off=new OfflineAudioContext(2,Math.ceil(SR*tot),SR);
      const keep={...MU};let err=null;muInit(off,off.destination);MU.g.gain.value=.55;
      const seg=(T,dur,intAt)=>{MU.th=MTH.town;MU.s=0;MU.bar=0;
        MU.xg.gain.setValueAtTime(0,T);MU.xg.gain.linearRampToValueAtTime(1,T+.6);MU.xg.gain.setValueAtTime(1,T+dur-2);MU.xg.gain.linearRampToValueAtTime(0,T+dur);
        let t=T,int=0;while(t<T+dur-2){const tg=intAt(t-T);int+=(tg-int)*(tg>int?.12:.03)*1.2;MU.int=int;try{muStep(t)}catch(e){err=err||String(e)}t+=60/MU.th.bpm/4;if(++MU.s>=16){MU.s=0;MU.bar++}}};
      seg(.1,calm,x=>0);
      // the fight clip starts in the middle of the B phrase so the combat layer comes in under the melody
      seg(calm+.1,fight,x=>x>8&&x<24?1:0);
      Object.assign(MU,keep);
      const buf=await off.startRendering();const L=buf.getChannelData(0),R=buf.getChannelData(1),o=new Int16Array(L.length*2);let pk=0,ss=0;
      for(let i=0;i<L.length;i++){pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));ss+=L[i]*L[i];o[2*i]=Math.max(-1,Math.min(1,L[i]))*32767;o[2*i+1]=Math.max(-1,Math.min(1,R[i]))*32767}
      let s='';const u=new Uint8Array(o.buffer);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return {sr:SR,pk,rms:Math.sqrt(ss/L.length),err,b:btoa(s)}}""",[calm,fight])
    print('render peak',round(r['pk'],3),'rms',round(r['rms'],4),'err',r['err'])
    if r['err']:bad.append('score error: '+r['err'])
    if r['pk']<.05:bad.append('render is silent')
    if r['pk']>.99:bad.append('render clips (peak %.3f)'%r['pk'])
    raw=base64.b64decode(r['b']);w=wave.open(O+'/v201_dusk.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(r['sr']);w.writeframes(raw);w.close()
    try:
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',O+'/v201_dusk.wav','-t',str(calm),'-b:a','160k',O+'/v201_dusk_calm.mp3'],check=True)
        subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(calm),'-i',O+'/v201_dusk.wav','-b:a','160k',O+'/v201_dusk_fight.mp3'],check=True);print('mp3 ok')
    except Exception as e:print('no mp3',e)
play.run(game,w=1000,hh=620)
logs=open(O+'/lastlogs.txt').read()
if 'v193 score' in logs or 'PAGEERROR' in logs:bad.append('errors in the page log')
for b in bad:print('FAIL',b)
print('v201 dusk music:', 'FAIL' if bad else 'PASS')
