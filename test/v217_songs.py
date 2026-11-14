# v215: a song for every instance. Checks: every new theme is well formed (melody parts exactly as long as the chords,
# known scale and instruments), every instance maps to the right song (fields II / III, Dens, special levels; field I keeps
# the zone's), the game really switches to it on arrival, and each song renders (offline) without errors, not silent, not
# clipping and about as loud as its zone's first song.
import play,json,sys
bad=[]
def F(m):bad.append(m);print('FAIL',m)
def game(pg):
    ev=pg.evaluate;pg.set_default_timeout(600000)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    keys=ev("()=>Object.keys(MU215.names)")
    print('songs',len(keys))
    if len(keys)!=36:F('expected 36 new songs (35 of v217 + v232\'s Hollow Beneath), got %d'%len(keys))
    r=ev("""()=>Object.keys(MU215.names).map(k=>{const th=MTH[k],T=th.tune,e=[];if(!MODES[th.mode])e.push('mode');if(!T)e.push('no tune');else{mu215Tune(th);
        for(const c of T.form){if(c!='-'&&!T.on[c])e.push('part '+c)}if(!MU215.K[T.k])e.push('instrument '+T.k);if(T.kb&&!MU215.K[T.kb])e.push('instrument '+T.kb)}
        for(const s in th.drums||{})for(const n in th.drums[s]){if(!MUDR[n])e.push('drum '+n);if(th.drums[s][n].length!=16)e.push('drum pattern '+n)}
        for(const p of [th.bass&&th.bass.c,th.bass&&th.bass.f])if(p&&p.length!=16)e.push('bass pattern');
        return [k,e.join(', ')]}).filter(x=>x[1])""")
    for k,e in r:F('theme %s: %s'%(k,e))
    # every instance → its song
    m=ev("()=>INSL.map((I,g)=>I?[g,I.z,I.k,I.sp||'',I.den?1:0,I.fld?1:0,I.tri?1:0,mu215Key(I)]:null).filter(Boolean)")
    seen=set()
    for g,z,k,sp,den,fld,tri,key in m:
        want='sp_'+sp if sp else 'z%dd'%z if den else 'z%db'%z if fld and k==1 else 'z%dc'%z if fld and k==2 else None
        if key!=want:F('instance %d (zone %d k %d %s): song %s, wanted %s'%(g,z,k,sp,key,want))
        if key:
            seen.add(key)
            if not ev("k=>!!MTH[k]",key):F('instance %d: no theme %s'%(g,key))
    for k in keys:
        if k not in seen and k[-1] not in 'xm':F('song %s belongs to no instance'%k)
    # in the game: arrive in a field II, a Den and field I
    ev("()=>{audio()}");pg.wait_for_timeout(800)
    for z,k,want in [(1,1,'z1b'),(0,0,'z0'),(3,2,'z3c'),(4,3,'z4d')]:
        ev("([z,k])=>{const I=INSL[insG(z,k)];insArrive(I);enemies.forEach(e=>{e.agg=0})}",[z,k]);pg.wait_for_timeout(2600)
        ev("()=>{enemies.forEach(e=>{e.agg=0})}");pg.wait_for_timeout(1800)
        got=ev("()=>[muWant(),MU.cur,MU.err||0,MU215.err]")
        print('arrive',z,k,got)
        if got[0]!=want or got[1]!=want:F('zone %d instance %d plays %s / %s, wanted %s'%(z,k,got[0],got[1],want))
        if got[2] or got[3]:F('music error in zone %d instance %d'%(z,k))
    # offline render of every song (calm and fighting)
    ren="""async ([th,f,dur])=>{const SR=22050,off=new OfflineAudioContext(2,Math.ceil(SR*(dur+3)),SR),keep={...MU};let err='';
      try{muInit(off,off.destination);MU.g.gain.value=.55;MU.th=MTH[th];MU.s=0;MU.bar=0;MU.phr=null;MU.int=f;MU.xg.gain.value=1;
        let t=.1;while(t<dur){muStep(t);t+=60/MU.th.bpm/4;if(++MU.s>=16){MU.s=0;MU.bar++}}}catch(e){err=String(e)}
      const e215=MU215.err;Object.assign(MU,keep);MU215.err=0;if(err||e215)return {err:err||'v215 step error'};
      const b=await off.startRendering(),L=b.getChannelData(0);let pk=0,s=0,n=0;for(let i=SR*2;i<SR*dur;i++){const x=L[i];if(!(Math.abs(x)<=pk))pk=Math.abs(x);s+=x*x;n++}
      return {pk,rms:Math.sqrt(s/n),nan:L.some(x=>x!==x)}}"""
    # fights: a Sovereign near → the zone's Sovereign song, a mini boss (e.sv, no e.boss) → the mini boss song
    ev("()=>{const I=INSL[insG(2,1)];insArrive(I)}");pg.wait_for_timeout(2500)
    for flags,want in [("{e.sv=e.sv||{i:'t'}}",'z2m'),("{e.boss=1}",'z2x')]:
        ev("()=>{enemies.forEach(e=>{e.agg=0});const e=window.__f=window.__f||spawnEnemy('goo',pl.position.x+6,pl.position.z,30,{});e.agg=1;"+flags[1:-1]+"}")
        got=ev("()=>muWant()");print('fight',want,got)
        if got!=want:F('fight song %s, wanted %s'%(got,want))
    ev("()=>{const e=window.__f;e.boss=0;e.sv=null;removeE(e)}")
    bo=ev(ren,['boss',1,24]);bb=bo['rms'];print('boss rms %.4f peak %.3f'%(bb,bo['pk']))
    base={}
    for z in range(6):
        b=ev(ren,['z%d'%z,0,24]);base[z]=b['rms'];print('z%d'%z,'rms %.4f peak %.3f'%(b['rms'],b['pk']))
    for k in keys:
        z=int(k[1]) if k[0]=='z' else ev("k=>{const I=INSL.find(I=>I&&mu215Key(I)==k);return I?I.z:-1}",k)
        fight=ev("k=>!!MTH[k].fight",k)
        for f in (0,1):
            o=ev(ren,[k,f,24])
            if o.get('err'):F('song %s: %s'%(k,o['err']));continue
            ratio=o['rms']/(bb if fight else base[z])
            print(k,'fight' if f else 'calm ','rms %.4f peak %.3f  x%.2f of %s'%(o['rms'],o['pk'],ratio,'boss' if fight else 'z%d'%z))
            if o['nan']:F('song %s: broken sound (NaN)'%k)
            if o['rms']<.004:F('song %s is silent (rms %.4f)'%(k,o['rms']))
            if o['pk']>.98:F('song %s clips (peak %.3f)'%(k,o['pk']))
            if not f and not (.45<ratio<(1.45 if fight else 1.6)):F('song %s loudness x%.2f of its zone song'%(k,ratio))
    print('RESULT','FAILED %d'%len(bad) if bad else 'ALL OK')
play.run(game,w=1000,hh=620)
sys.exit(1 if bad else 0)
