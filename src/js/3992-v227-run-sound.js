// ================= v227: the Sandstorm Run's sound (owner, Nov 13 2026: "improve the audio design for the level - the gunshots
// aren't doing it for me") =================
// The guns used the sovereigns' 'heavy' thud pitched up (a soft low knock) and their shells the 'crack' tick. Every sound of the
// Run is now its own, synthesised on the effects bus (AUD.out: v226's presence lift, low-end copy and limiter apply):
//  * the autocannon ('gun'): a hard crack, a falling punch (210 → 46 Hz), a mid body, the breech's ring and the report rolling
//    off the dunes a moment later; the two barrels are pitched a little apart and every shell varies a few percent;
//  * the heavy shell ('heavy') and its blast ('boom': a long low drop, a roar and falling debris);
//  * shells landing: on chitin ('hit'), on sand ('sand'); a creature bursting ('kill', pitched up along a kill streak);
//  * the machine, as one running loop (snd227Loop): the turbine (two detuned saws and a sub through a filter that opens with
//    speed, chopped by the fan's blades), the jet's roar while boosting, the wind and the sand hissing on the hull with speed,
//    and the storm's rumble swelling as it closes;
//  * 'boost' (the turbine's kick), 'jump' and 'land' (the crests), 'whoosh' (a boulder or spire going by), 'clang' (the hull
//    struck), 'thunder' (the storm), 'overheat' (the barrels), 'check' (a checkpoint, the finish).
// Co-op: sounds are each player's own (a partner's guns are heard quieter, from their shots as they are shown here).
var SND227={on:true,vol:1,L:null,last:{},err:0,n:0};
function snd227(k,vol,pitch){try{if(!SND227.on||typeof SET=='undefined'||SET.sfx===false)return;const a=AUD;if(!a||a.state!='running'||!NOISE||!a.out)return;const V=SND227.V[k];if(!V)return;
    const now=performance.now(),gap=SND227.gap[k];if(gap){if(now-(SND227.last[k]||0)<gap)return;SND227.last[k]=now}
    const t=a.currentTime+.003,p=pitch||1,out=a.out;vol=(vol==null?1:vol)*SND227.vol*(SND227.k[k]||1);if(!(vol>0))return;SND227.n++;
    // O: an oscillator sweeping f0 → f1 · N: filtered noise sweeping f0 → f1 (o.q, o.a attack, o.h hold)
    const env=(g,t0,dur,v,o)=>{const at=o.a||.002;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v*vol,t0+at);if(o.h)g.gain.setValueAtTime(v*vol,t0+at+o.h);g.gain.exponentialRampToValueAtTime(.0008,t0+at+(o.h||0)+dur)};
    const O=(type,f0,f1,at,dur,v,o)=>{o=o||{};const os=a.createOscillator(),g=a.createGain(),t0=t+at,end=t0+(o.a||.002)+(o.h||0)+dur;os.type=type;os.frequency.setValueAtTime(f0*p,t0);os.frequency.exponentialRampToValueAtTime(Math.max(18,f1*p),end);
      env(g,t0,dur,v,o);os.connect(g);g.connect(out);os.start(t0);os.stop(end+.03)};
    const N=(ft,f0,f1,at,dur,v,o)=>{o=o||{};const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t0=t+at,end=t0+(o.a||.002)+(o.h||0)+dur;s.buffer=NOISE;s.loop=true;f.type=ft;f.Q.value=o.q||.8;
      f.frequency.setValueAtTime(f0*p,t0);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1*p),end);env(g,t0,dur,v,o);s.connect(f);f.connect(g);g.connect(out);s.start(t0,Math.random()*.8);s.stop(end+.03)};
    V(O,N)}catch(e){if(!SND227.err++)console.warn('v227 sound',e)}}
// the least time between two of the same (ms): a burst of hits is one rattle, not a wall
SND227.gap={hit:45,sand:90,whoosh:140,clang:120,kill:40,thunder:900};
// each voice's own level (the gun fires ten times a second: it sits just over a sword hit, the big ones stay big)
SND227.k={gun:.55,heavy:.72,boom:.75,land:.7,clang:.78,whoosh:2.2,jump:1.7,hit:1.5,check:1.5,sand:1.2};
SND227.V={
  gun(O,N){N('highpass',2400,1500,0,.045,.6,{a:.001});O('triangle',210,46,0,.12,.95,{a:.001});O('sine',125,38,0,.15,.6);
    N('bandpass',1150,380,0,.12,.62,{q:.7,a:.001});O('square',1480,1150,0,.03,.05,{a:.001});
    N('lowpass',950,220,.04,.28,.2,{q:.5,a:.02});N('bandpass',640,300,.14,.2,.07,{q:1.2,a:.03})},
  heavy(O,N){N('highpass',1800,900,0,.07,.8,{a:.001});O('sine',130,26,0,.75,1.2,{a:.003});O('triangle',260,40,0,.3,.7,{a:.002});O('sawtooth',90,30,0,.4,.25,{a:.004});
    N('lowpass',2600,90,0,.6,.95,{a:.003});N('bandpass',520,160,.18,.5,.3,{q:.6,a:.05});N('bandpass',420,140,.4,.5,.14,{q:.6,a:.06})},
  boom(O,N){O('sine',95,22,0,1.0,1.2,{a:.004});O('triangle',180,30,0,.45,.6);N('lowpass',2000,60,0,1.0,1,{a:.004});N('highpass',3200,1200,0,.09,.5,{a:.001});
    for(let i=0;i<7;i++)N('bandpass',1400+Math.random()*2200,500,.12+Math.random()*.55,.06,.16,{q:3,a:.002});N('lowpass',500,90,.3,1.1,.3,{a:.1})},
  hit(O,N){N('bandpass',2900,1900,0,.035,.5,{q:2.5,a:.001});O('square',560,230,0,.05,.16,{a:.001});N('lowpass',700,220,0,.07,.3,{a:.002})},
  sand(O,N){N('lowpass',640,180,0,.13,.3,{a:.004});N('bandpass',2600,1200,0,.06,.1,{q:1,a:.002})},
  kill(O,N){N('lowpass',1200,140,0,.18,.7,{q:1.6,a:.003});O('square',190,52,0,.11,.26,{a:.002});N('highpass',3600,2000,0,.03,.4,{a:.001});O('sine',420,90,.01,.14,.22);
    N('bandpass',1700,600,.05,.12,.2,{q:2.5,a:.004})},
  clang(O,N){[[318,1],[492,.7],[741,.5],[1183,.35],[1766,.2]].forEach(([f,v],i)=>O(i%2?'triangle':'sine',f,f*.985,0,.34-i*.04,.3*v,{a:.001}));O('sine',110,40,0,.2,.7);N('lowpass',1500,200,0,.14,.5,{a:.001});N('highpass',4200,2400,0,.03,.3,{a:.001})},
  whoosh(O,N){N('bandpass',420,1900,0,.11,.42,{q:1.1,a:.05});N('bandpass',1900,360,.1,.18,.3,{q:1.1,a:.01})},
  boost(O,N){O('sawtooth',70,260,0,.5,.22,{a:.05,h:.12});O('sine',180,720,0,.5,.14,{a:.05,h:.12});N('bandpass',500,3200,0,.5,.6,{q:.8,a:.06,h:.12});O('sine',70,30,0,.35,.9,{a:.004});N('lowpass',900,120,0,.3,.5,{a:.004})},
  jump(O,N){N('bandpass',600,2400,0,.3,.4,{q:1,a:.05});O('sine',240,520,0,.3,.1,{a:.04})},
  land(O,N){O('sine',100,28,0,.4,1.1,{a:.003});O('triangle',64,30,0,.3,.5);N('lowpass',1700,110,0,.45,.8,{a:.004});N('bandpass',2400,700,.03,.3,.3,{q:.8,a:.02});[392,611].forEach(f=>O('triangle',f,f*.98,0,.16,.1,{a:.001}))},
  thunder(O,N){N('highpass',3000,700,0,.14,.5,{a:.002});N('lowpass',520,50,0,2.2,1,{a:.02,h:.15});O('sine',62,24,0,1.7,.8,{a:.02});N('lowpass',240,60,.6,1.8,.5,{a:.3});N('bandpass',900,200,.08,.5,.3,{q:.6,a:.02})},
  overheat(O,N){N('highpass',4400,2600,0,.8,.5,{a:.03,h:.15});O('sine',900,220,0,.5,.12,{a:.01});N('bandpass',1600,500,0,.5,.22,{q:2,a:.02})},
  check(O,N){[392,523,659,784].forEach((f,i)=>{O('sine',f,f,i*.07,.7,.16,{a:.004});O('triangle',f*2,f*2,i*.07,.4,.05,{a:.004})});N('highpass',6000,8000,0,.5,.07,{a:.05})}};
// ---------------- the machine, the wind and the storm: one running loop, shaped each frame ----------------
function snd227Stop(){const L=SND227.L;if(!L)return;SND227.L=null;try{L.src.forEach(s=>{try{s.stop()}catch(_){}});L.g.disconnect()}catch(_){}}
function snd227Build(a){const g=a.createGain();g.gain.value=0;g.connect(a.out);const src=[];
  const osc=(type,f)=>{const o=a.createOscillator();o.type=type;o.frequency.value=f;o.start();src.push(o);return o},nz=rate=>{const s=a.createBufferSource();s.buffer=NOISE;s.loop=true;s.playbackRate.value=rate||1;s.start(0,Math.random()*.9);src.push(s);return s},
    gain=v=>{const n=a.createGain();n.gain.value=v;return n},filt=(t,f,q)=>{const n=a.createBiquadFilter();n.type=t;n.frequency.value=f;n.Q.value=q||.7;return n};
  // the turbine: two saws a fifth apart and a square an octave down, through a filter, chopped by the fan
  const o1=osc('sawtooth',60),o2=osc('sawtooth',90),o3=osc('square',30),lp=filt('lowpass',500,1.4),eg=gain(0),chop=gain(1),lfo=osc('sine',12),ld=gain(.4);
  o1.connect(lp);const g2=gain(.5);o2.connect(g2);g2.connect(lp);const g3=gain(.6);o3.connect(g3);g3.connect(lp);lp.connect(chop);lfo.connect(ld);ld.connect(chop.gain);chop.connect(eg);eg.connect(g);
  // its whine
  const o4=osc('sine',700),wg4=gain(0);o4.connect(wg4);wg4.connect(g);
  // the jet's roar (boost), the wind, the sand on the hull, the storm
  const j=nz(.8),jf=filt('bandpass',900,.6),jg=gain(0);j.connect(jf);jf.connect(jg);jg.connect(g);
  const w=nz(1),wf=filt('bandpass',700,.5),wg=gain(0);w.connect(wf);wf.connect(wg);wg.connect(g);
  const h=nz(1.31),hf=filt('highpass',5200,.7),hg=gain(0);h.connect(hf);hf.connect(hg);hg.connect(g);
  const s=nz(.6),sf=filt('lowpass',120,1.1),sg=gain(0),sl=osc('sine',.37),sd=gain(.35),sm=gain(1);s.connect(sf);sf.connect(sm);sl.connect(sd);sd.connect(sm.gain);sm.connect(sg);sg.connect(g);
  const s2=nz(.9),sf2=filt('bandpass',340,.5),sg2=gain(0);s2.connect(sf2);sf2.connect(sg2);sg2.connect(g);
  return {g,src,o1,o2,o3,o4,lp,eg,lfo,wg4,jf,jg,wf,wg,hg,sg,sg2,offT:0}}
function snd227Loop(V,dt){try{const a=typeof AUD=='undefined'?null:AUD,can=!!a&&a.state=='running'&&!!NOISE&&!!a.out;let L=SND227.L;
    const on=!!V&&can&&SND227.on&&SET.sfx!==false&&!document.hidden&&!(typeof uiOpen=='function'&&uiOpen())&&SR165.ph!=='win';
    if(!on){if(L){if(!can){snd227Stop();return}L.g.gain.setTargetAtTime(0,a.currentTime,.1);if(!L.offT)L.offT=performance.now();if(!V&&performance.now()-L.offT>700)snd227Stop()}return}
    if(!L)L=SND227.L=snd227Build(a);L.offT=0;const t=a.currentTime,S=SKR227,sp=Math.max(0,Math.min(1.6,Math.abs(V.v)/S.v)),bk=V.boost?1:0,air=V.air>0?1:0,c=sr227Close(V),dead=V.wreck?0:1,T=(p,v,k)=>p.setTargetAtTime(v,t,k||.09);
    const f=52+sp*46+bk*30+air*16;T(L.o1.frequency,f);T(L.o2.frequency,f*1.498);T(L.o3.frequency,f*.5);T(L.o4.frequency,f*9.03,.15);
    T(L.lp.frequency,320+sp*820+bk*1500);T(L.lfo.frequency,8+sp*13+bk*9);T(L.eg.gain,dead*(.07+.12*sp+.08*bk));T(L.wg4.gain,dead*(.006*sp+.03*bk),.2);
    T(L.jf.frequency,700+bk*900,.2);T(L.jg.gain,dead*bk*.3,.12);T(L.wf.frequency,480+sp*700+bk*800+air*500,.15);T(L.wg.gain,.05+.17*sp*sp+.12*bk+.1*air+.2*c,.15);
    T(L.hg.gain,.012+.045*sp+.09*c,.2);T(L.sg.gain,.12+.8*c*c,.3);T(L.sg2.gain,.03+.4*c*c,.3);T(L.g.gain,SND227.vol,.08)}catch(e){if(!SND227.err++)console.warn('v227 loop',e)}}
