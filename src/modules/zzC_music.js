// ================= v79: music and more sound effects (all synthesized, no audio files) =================
// A small generative score: each place has a theme (key, mode, tempo, instruments). The engine plays it
// a sixteenth note at a time, a little ahead of the audio clock. Nearby fighting adds drums and a driving
// bass; a boss fight switches to its own theme. Everything goes through MU.xg so themes can cross-fade.
var MU={a:null,cur:null,want:null,sw:null,th:null,t:0,s:0,bar:0,int:0,fightT:-99,hold:0,phr:null,lead:1,gold:null,coinT:0};
if(SET.mus==null)SET.mus=.55;if(SET.sfxV==null)SET.sfxV=SET.sfx===false?0:1;
const MODES={aeo:[0,2,3,5,7,8,10],dor:[0,2,3,5,7,9,10],phr:[0,1,3,5,7,8,10],hmin:[0,2,3,5,7,8,11],hij:[0,1,4,5,7,8,10],loc:[0,1,3,5,6,8,10]};
const muF=n=>440*Math.pow(2,(n-69)/12);
// MTH: themes. prog = scale degree of each bar's chord. Pattern strings are 16 steps: X loud, x normal, g ghost.
var MTH={
 title:{bpm:54,root:50,mode:'aeo',prog:[0,5,3,4],pad:{v:.03,cut:650,form:1},drone:.11,bell:{p:.22,v:.045},
   bass:{v:.13,c:'x...............'},lead:{den:.35,oct:1,rest:.4,i:{w:'sine',cut:2200,vib:1,at:.12,sub:1},v:.07}},
 town:{bpm:74,root:50,mode:'dor',prog:[0,3,0,6,0,3,4,0],pad:{v:.022,cut:900},drone:.05,
   arp:{e:2,p:[0,1,2,3,2,1,0,1],oct:1,v:.07},bass:{v:.13,c:'x.......x.......'},bell:{p:.06,v:.03},
   lead:{den:.5,oct:1,rest:.3,i:{w:'triangle',cut:2600,vib:1,at:.05,sub:1},v:.075},
   drums:{c:{dum:'x.......g.....g.',tek:'....g.......g...'}}},
 // Kindlelight: drowned bog — low, sparse, cold
 z0:{bpm:60,root:47,mode:'phr',prog:[0,0,1,0,0,6,1,0],pad:{v:.026,cut:520,form:1},drone:.14,bell:{p:.12,v:.04,oct:2},
   arp:{e:4,p:[0,2,1,2],oct:0,v:.055},bass:{v:.15,c:'x...............',f:'x.....x.x.......'},
   lead:{den:.28,oct:0,rest:.45,i:{w:'square',cut:900,bp:1,vib:1,at:.1},v:.05},
   drums:{f:{taiko:'X.......x.....x.',tek:'....g.......g..g'}}},
 // Hillside Crest: windswept plains
 z1:{bpm:86,root:55,mode:'dor',prog:[0,6,3,0,0,6,4,4],pad:{v:.02,cut:1100},drone:.06,
   arp:{e:2,p:[0,1,2,1,0,1,2,3],oct:0,v:.065},bass:{v:.13,c:'x.......x...x...',f:'x.x.x.x.x.x.x.x.'},
   lead:{den:.55,oct:1,rest:.25,i:{w:'sine',cut:3000,vib:1,at:.04,sub:1},v:.07},
   drums:{c:{dum:'x...............'},f:{taiko:'X.....x.x...x...',hat:'..x...x...x...x.',tek:'....x.......x...'}}},
 // Burningeye Summit: frozen peak, burning sky
 z2:{bpm:92,root:52,mode:'phr',prog:[0,1,0,6,0,1,5,6],pad:{v:.024,cut:800},drone:.1,bell:{p:.16,v:.04,oct:2},
   arp:{e:2,p:[0,2,1,2,0,2,1,3],oct:0,v:.05},bass:{v:.14,c:'x.......x.......',f:'x.xxx.xxx.xxx.x.'},
   lead:{den:.45,oct:1,rest:.3,i:{w:'sawtooth',cut:1300,vib:.6,at:.07},v:.05},
   drums:{f:{taiko:'X..x..x.X..x..x.',snare:'....x.......x..g',hat:'x.x.x.x.x.x.x.x.'}}},
 // Searing Sands: desert — phrygian dominant, reed and oud
 z3:{bpm:90,root:50,mode:'hij',prog:[0,0,1,0,6,6,1,0],pad:{v:.018,cut:800},drone:.12,
   arp:{e:2,p:[0,1,2,1,0,2,1,0],oct:0,v:.07,w:'square'},bass:{v:.12,c:'x.....x.........',f:'x..x..x.x..x..x.'},
   lead:{den:.55,oct:1,rest:.25,i:{w:'square',cut:1500,bp:1,vib:1.4,at:.05,slide:1},v:.055},
   drums:{c:{shak:'..g...g...g...g.'},f:{dum:'X..x..x.x..x....',tek:'..x...x...x.x.xx',shak:'g.g.g.g.g.g.g.g.'}}},
 // The Dirge: haunted graveyard — locrian, bells, hollow choir
 z4:{bpm:64,root:48,mode:'loc',prog:[0,1,0,4,0,1,3,1],pad:{v:.028,cut:600,form:1},drone:.12,bell:{p:.3,v:.05,oct:2},
   bass:{v:.14,c:'x...............',f:'x..x....x..x....'},
   lead:{den:.3,oct:1,rest:.4,i:{w:'sine',cut:2000,vib:1.6,at:.15,sub:1},v:.06},
   drums:{f:{taiko:'X...x...X...x...',tek:'..g...g...g...gg',snare:'............x...'}}},
 // The Citadel: vampire court — harmonic minor, organ-like pad and brass
 z5:{bpm:72,root:48,mode:'hmin',prog:[0,5,3,4,0,5,1,4],pad:{v:.024,cut:1200,form:1},drone:.08,bell:{p:.1,v:.035,oct:2},
   arp:{e:1,p:[0,1,2,3,2,1,0,1,0,1,2,3,2,1,0,1],oct:1,v:.04,w:'square'},bass:{v:.14,c:'x.......x.......',f:'x.x.x.x.x.x.x.x.'},
   lead:{den:.45,oct:1,rest:.3,i:{w:'sawtooth',cut:1600,vib:.7,at:.06},v:.05},
   drums:{f:{taiko:'X.......X.....x.',snare:'....x.......x.gg',hat:'x.x.x.x.x.x.x.x.'}}},
 // Sovereign fight
 boss:{bpm:128,root:50,mode:'hmin',prog:[0,5,1,4,0,5,3,4],pad:{v:.026,cut:1300,form:1},drone:.1,fight:1,
   arp:{e:1,p:[0,1,2,1,0,1,2,3,0,1,2,1,0,2,1,0],oct:0,v:.04,w:'sawtooth'},bass:{v:.15,c:'x.xxx.xxx.xxx.xx'},
   lead:{den:.65,oct:1,rest:0,i:{w:'sawtooth',cut:1800,vib:.6,at:.03},v:.055},bell:{p:.08,v:.04,oct:2},
   drums:{c:{taiko:'X..x..x.X..x..x.',snare:'....X.......X..x',hat:'xgxgxgxgxgxgxgxg'}}}
};

// ---------- engine setup (works with any AudioContext, so tests can render offline) ----------
function muInit(a,dest){
  MU.a=a;MU.g=a.createGain();MU.g.gain.value=0;
  const comp=a.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.3;
  MU.xg=a.createGain();MU.xg.gain.value=0;MU.dry=a.createGain();MU.dry.connect(MU.xg);
  const cv=a.createConvolver(),n=Math.round(a.sampleRate*3),ir=a.createBuffer(2,n,a.sampleRate);
  for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3.2)}
  cv.buffer=ir;cv.connect(MU.xg);MU.w1=a.createGain();MU.w1.gain.value=.22;MU.w2=a.createGain();MU.w2.gain.value=.55;MU.w1.connect(cv);MU.w2.connect(cv);
  MU.xg.connect(comp);comp.connect(MU.g);MU.g.connect(dest);
  MU.nz=a.createBuffer(1,a.sampleRate,a.sampleRate);const d=MU.nz.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
}
function muRoute(n,send){n.connect(MU.dry);if(send==1)n.connect(MU.w1);else if(send==2)n.connect(MU.w2)}
function muOsc(type,f,t,end,det){const o=MU.a.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(det)o.detune.value=det;o.start(t);o.stop(end);return o}
function muEnv(g,t,at,v,hold,rel){v=Math.max(.0002,v);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+at);if(hold>0)g.gain.setValueAtTime(v,t+at+hold);g.gain.exponentialRampToValueAtTime(.0001,t+at+Math.max(0,hold)+rel)}
function muNz(t,dur,ft,f0,f1,q,v,send,at){const a=MU.a,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=MU.nz;f.type=ft;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+dur);f.Q.value=q||.7;
  muEnv(g,t,at||.002,v,0,dur);s.connect(f);f.connect(g);muRoute(g,send);s.start(t,Math.random()*.5);s.stop(t+dur+.05)}

// ---------- instruments ----------
function muPad(fs,t,d,v,P){
  const a=MU.a,g=a.createGain(),lp=a.createBiquadFilter(),at=Math.min(d*.4,1.6),rel=1.6,end=t+d+rel+.1;lp.type='lowpass';lp.frequency.value=P.cut||900;lp.Q.value=.4;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+at);g.gain.setValueAtTime(v,t+d);g.gain.linearRampToValueAtTime(0,t+d+rel);
  fs.forEach(fr=>[-8,7].forEach(dt=>muOsc('sawtooth',fr,t,end,dt).connect(lp)));
  if(P.form){[[700,4,.9],[1150,5,.6],[2600,6,.25]].forEach(([fq,q,k])=>{const b=a.createBiquadFilter(),bg=a.createGain();b.type='bandpass';b.frequency.value=fq;b.Q.value=q;bg.gain.value=k*2.4;lp.connect(b);b.connect(bg);bg.connect(g)})}
  else lp.connect(g);
  muRoute(g,2)}
function muDrone(f,t,d,v){const a=MU.a,g=a.createGain(),end=t+d+2.2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+Math.min(2,d*.5));g.gain.setValueAtTime(v,t+d);g.gain.linearRampToValueAtTime(0,t+d+2);
  [[1,1],[1.5,.45],[2,.3]].forEach(([m,k])=>{const o=muOsc(m==1?'triangle':'sine',f*m,t,end,m==1?0:3),og=a.createGain();og.gain.value=k;o.connect(og);og.connect(g)});muRoute(g,1)}
function muPluck(f,t,v,w){const a=MU.a,end=t+1.6,o=muOsc(w||'triangle',f,t,end),o2=muOsc('sawtooth',f,t,end,4),lp=a.createBiquadFilter(),g=a.createGain(),g2=a.createGain();g2.gain.value=.22;
  lp.type='lowpass';lp.frequency.setValueAtTime(Math.min(9000,f*9),t);lp.frequency.exponentialRampToValueAtTime(Math.max(180,f*1.4),t+.45);
  o.connect(lp);o2.connect(g2);g2.connect(lp);lp.connect(g);muEnv(g,t,.003,w=='square'?v*.55:v,0,1.3);muRoute(g,1)}
function muBell(f,t,v){[[1,1,3.4],[2.76,.38,1.7],[5.4,.16,.8],[2,.22,2.5]].forEach(([m,k,d])=>{const o=muOsc('sine',f*m,t,t+d+.1),g=MU.a.createGain();muEnv(g,t,.003,v*k,0,d);o.connect(g);muRoute(g,2)})}
function muLead(f,t,d,v,P){
  const a=MU.a,end=t+d+.7,o=muOsc(P.w,f,t,end),fl=a.createBiquadFilter(),g=a.createGain(),at=Math.min(P.at||.05,d*.5);
  if(P.slide){o.frequency.setValueAtTime(f*.94,t);o.frequency.exponentialRampToValueAtTime(f,t+.07)}
  if(P.vib&&d>.25){const l=muOsc('sine',5.1,t,end),lg=a.createGain();lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.007*P.vib,t+Math.min(d,.6));l.connect(lg);lg.connect(o.frequency)}
  fl.type=P.bp?'bandpass':'lowpass';fl.frequency.value=P.cut;fl.Q.value=P.bp?1.4:.6;o.connect(fl);fl.connect(g);
  if(P.sub){const s=muOsc('sine',f,t,end),sg=a.createGain();sg.gain.value=.6;s.connect(sg);sg.connect(g)}
  if(P.bp)v*=1.8;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+at);g.gain.setValueAtTime(v,t+Math.max(at,d-.04));g.gain.exponentialRampToValueAtTime(.0001,t+d+.45);muRoute(g,2)}
function muBass(f,t,d,v){const a=MU.a,end=t+d+.4,g=a.createGain(),lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(700,t);lp.frequency.exponentialRampToValueAtTime(220,t+.25);
  muOsc('triangle',f,t,end).connect(g);const s=muOsc('sawtooth',f,t,end),sg=a.createGain();sg.gain.value=.35;s.connect(lp);lp.connect(sg);sg.connect(g);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.setValueAtTime(v,t+Math.max(.02,d*.7));g.gain.exponentialRampToValueAtTime(.0001,t+d+.25);muRoute(g,0)}
const MUDR={
  taiko:(t,v)=>{const o=muOsc('sine',96,t,t+.7),g=MU.a.createGain();o.frequency.exponentialRampToValueAtTime(46,t+.45);muEnv(g,t,.002,v*.9,0,.6);o.connect(g);muRoute(g,1);muNz(t,.18,'lowpass',900,200,.7,v*.5,1)},
  dum:(t,v)=>{const o=muOsc('sine',150,t,t+.4),g=MU.a.createGain();o.frequency.exponentialRampToValueAtTime(88,t+.2);muEnv(g,t,.002,v*.7,0,.3);o.connect(g);muRoute(g,1)},
  tek:(t,v)=>{muNz(t,.06,'bandpass',3600,2400,3,v*.6,1);const o=muOsc('triangle',620,t,t+.1),g=MU.a.createGain();muEnv(g,t,.001,v*.15,0,.05);o.connect(g);muRoute(g,1)},
  snare:(t,v)=>{muNz(t,.18,'bandpass',2000,1300,.8,v*.55,1);const o=muOsc('triangle',200,t,t+.15),g=MU.a.createGain();o.frequency.exponentialRampToValueAtTime(140,t+.08);muEnv(g,t,.001,v*.25,0,.09);o.connect(g);muRoute(g,1)},
  hat:(t,v)=>muNz(t,.04,'highpass',8000,7000,.7,v*.22,0),
  shak:(t,v)=>muNz(t,.08,'bandpass',5200,4800,1.2,v*.3,0,.025)
};

// ---------- composition helpers ----------
function muNote(th,deg,oct){const m=MODES[th.mode];return th.root+12*oct+12*Math.floor(deg/7)+m[((deg%7)+7)%7]}
function muChord(th,bar){return th.prog[bar%th.prog.length]}
// one two-bar phrase: [{p:step 0..31, r:degrees above the chord root, l:length in steps}]
function muPhrase(den){
  const on=[];for(let p=0;p<32;p++){const s=p%16==0?1:p%8==0?.85:p%4==0?.55:p%2==0?.22:.06;if(Math.random()<s*den*1.5)on.push(p)}
  if(!on.length||on[0]!=0)on.unshift(0);
  let r=[0,2,4][Math.random()*3|0];const out=[];
  on.forEach((p,i)=>{if(i){r+=[-2,-1,-1,1,1,2,0,3,-3,-1,1][Math.random()*11|0];r=Math.max(-3,Math.min(9,r))}
    if(p%8==0){const ct=[0,2,4,7,9];r=ct.reduce((b,c)=>Math.abs(c-r)<Math.abs(b-r)?c:b,0)}
    const nx=i+1<on.length?on[i+1]:32;out.push({p,r,l:Math.min(nx-p,8)})});
  if(out.length>2&&Math.random()<.5)out.pop();
  return out}
function muVary(ph){return ph.map(n=>Math.random()<.25?{p:n.p,r:Math.max(-3,Math.min(9,n.r+[-1,1,2,-2][Math.random()*4|0])),l:n.l}:n)}

// schedule step MU.s (0..15) of bar MU.bar at time t
function muStep(t){
  const th=MU.th,s=MU.s,bar=MU.bar,sp=60/th.bpm/4,deg=muChord(th,bar),F=th.fight?1:MU.int,C=th.fight?1:1-F*.35;
  if(s==0){
    if(th.pad)muPad([0,2,4].map(k=>muF(muNote(th,deg+k,0))),t,sp*16,th.pad.v,th.pad);
    if(th.drone&&bar%2==0)muDrone(muF(th.root-12),t,sp*32,th.drone);
    if(bar%8==0){const L=th.lead;if(!MU.phr||Math.random()<.5)MU.phr=[muPhrase(L?L.den:.4),muPhrase(L?L.den:.4)];else MU.phr=[MU.phr[0],muVary(MU.phr[1])];MU.lead=!L?0:Math.random()>=(L.rest||0)*(1-F)}
  }
  // bass
  const B=th.bass;if(B){const pat=F>.05&&B.f?B.f:B.c,ch=pat[s];if(ch&&ch!='.'){const v=B.v*(ch=='X'?1.2:ch=='g'?.5:1)*(pat===B.f?Math.max(.6,F):1),n=muNote(th,deg,-1)-(muNote(th,deg,-1)>th.root-2?12:0);muBass(muF(n),t,sp*(pat===B.c?3.5:1.6),v)}}
  // arpeggio (harp / lute / oud)
  const A=th.arp;if(A&&s%A.e==0){const i=A.p[(s/A.e|0)%A.p.length];muPluck(muF(muNote(th,deg+[0,2,4,7][i],A.oct)),t,A.v*C*(s%4==0?1:.75),A.w)}
  // bells
  const Be=th.bell;if(Be&&s%4==0&&Math.random()<Be.p*(1-F*.5))muBell(muF(muNote(th,deg+[0,2,4,7][Math.random()*4|0],Be.oct||1)),t,Be.v);
  // melody
  const L=th.lead;if(L&&MU.lead&&MU.phr){const ph=MU.phr[(bar>>1)&1],ps=(bar&1)*16+s;for(const n of ph)if(n.p==ps)muLead(muF(muNote(th,deg+n.r,L.oct)),t,sp*n.l*.95,L.v*(1+F*.2),L.i)}
  // drums: calm set always, fight set fades in with intensity
  const D=th.drums;if(D){const play=(set,k)=>{for(const nm in set){const ch=set[nm][s];if(ch&&ch!='.')MUDR[nm](t,k*(ch=='X'?1:ch=='g'?.35:.7))}};
    if(D.c)play(D.c,th.fight?1:C*.8);if(D.f&&F>.05)play(D.f,F)}
}

// ---------- what should be playing now ----------
function muWant(){
  if(nowP()<MU.hold)return null;
  if(typeof AWD!='undefined'&&AWD.dead)return null;
  if($('awT')||!party.length)return 'title';
  const P=pl.position;
  if(enemies.some(e=>e.boss&&!e.dead&&e.agg&&e.m&&e.m.position.distanceTo(P)<45))return 'boss';
  const g=inRealm?-1:regionAt(Math.round(P.x),Math.round(P.z));return g<0?'town':'z'+g}
function muFight(){if(typeof WV!='undefined'&&WV&&WV.go)return true;const P=pl.position;return !!party.length&&enemies.some(e=>!e.dead&&e.agg&&e.m&&e.m.position.distanceTo(P)<24)}
function muVol(){if(!MU.a)return;const v=document.hidden?0:Math.pow(+SET.mus||0,1.5)*.9;MU.g.gain.setTargetAtTime(v,MU.a.currentTime,.25);if(AUD&&AUD.out)AUD.out.gain.value=.32*(+SET.sfxV)}
function muSwitch(now){
  const w=MU.want;MU.sw=null;if(w===MU.cur){MU.xg.gain.setTargetAtTime(1,now,.5);return}
  MU.cur=w;MU.th=w?MTH[w]:null;MU.s=0;MU.bar=0;MU.phr=null;MU.t=now+.05;
  MU.xg.gain.cancelScheduledValues(now);MU.xg.gain.setValueAtTime(0,now);if(w)MU.xg.gain.setTargetAtTime(1,now+.05,w=='boss'?.3:.9)}
function muTick(){
  const a=AUD;if(!a||a.state!='running'||!SET||!(typeof pl!='undefined'&&pl))return;
  if(!MU.a){muInit(a,a.destination);muVol()}
  const now=a.currentTime,w=muWant();MU.want=w;
  if(w!==MU.cur&&MU.sw==null){MU.sw=MU.cur?now+1.3:now;if(MU.cur)MU.xg.gain.setTargetAtTime(0,now,.35)}
  if(MU.sw!=null&&now>=MU.sw)muSwitch(now);
  if(muFight())MU.fightT=now;const tg=now-MU.fightT<5?1:0;MU.int+=(tg-MU.int)*(tg>MU.int?.12:.03);
  if(!MU.th){MU.t=now;return}
  if(MU.t<now-.1)MU.t=now+.05;
  while(MU.t<now+.3){muStep(MU.t);MU.t+=60/MU.th.bpm/4;if(++MU.s>=16){MU.s=0;MU.bar++}}
  // coin sound for any gold gain
  if(MU.gold!=null&&gold>MU.gold&&now-MU.coinT>.09){MU.coinT=now;mSfx('coin',Math.min(1.3,.6+(gold-MU.gold)/400))}MU.gold=gold;
}
setInterval(()=>{try{muTick()}catch(e){if(!MU.err){MU.err=1;console.warn('music',e)}}},50);
document.addEventListener('visibilitychange',muVol);

// ---------- new sound effects (share the game's sound volume) ----------
function mSfx(k,vol){
  if(SET.sfx===false||!(+SET.sfxV>0))return;const a=AUD;if(!a||a.state!='running')return;const t=a.currentTime;vol=vol||1;
  const tone=(type,f,at,dur,v,f1)=>{const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t+at);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+at+dur);
    g.gain.setValueAtTime(0,t+at);g.gain.linearRampToValueAtTime(v*vol,t+at+.006);g.gain.exponentialRampToValueAtTime(.0001,t+at+dur);o.connect(g);g.connect(a.out);o.start(t+at);o.stop(t+at+dur+.05)};
  const nz=(ft,f0,f1,at,dur,v,q)=>{if(!NOISE)return;const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NOISE;f.type=ft;f.Q.value=q||.8;f.frequency.setValueAtTime(f0,t+at);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+at+dur);
    g.gain.setValueAtTime(0,t+at);g.gain.linearRampToValueAtTime(v*vol,t+at+dur*.3);g.gain.exponentialRampToValueAtTime(.0001,t+at+dur);s.connect(f);f.connect(g);g.connect(a.out);s.start(t+at,Math.random()*.5);s.stop(t+at+dur+.05)};
  ({
   coin:()=>{tone('square',1568,0,.07,.05);tone('square',2093,.06,.18,.05);tone('sine',2093,.06,.25,.08)},
   pick:()=>{tone('sine',880,0,.12,.12,1320);tone('triangle',1320,.05,.15,.06)},
   rare:()=>{[1047,1319,1568,2093].forEach((f,i)=>tone('sine',f,i*.06,.6,.1));nz('highpass',6000,9000,0,.5,.08)},
   lvl:()=>{[[523,0],[659,.1],[784,.2],[1047,.3]].forEach(([f,at])=>{tone('square',f,at,.35,.05);tone('sine',f,at,.5,.12)});tone('sine',1047,.42,1.4,.12);tone('triangle',1568,.42,1.2,.05);tone('sine',262,.3,1.4,.15)},
   fall:()=>{nz('lowpass',800,120,0,.35,.25);tone('sine',120,0,.3,.25,50)},
   elite:()=>{nz('lowpass',1200,100,0,.6,.35);tone('sine',90,0,.6,.4,35);tone('sawtooth',220,.02,.4,.04,110)},
   victory:()=>{[[392,0],[523,.18],[659,.36],[784,.54]].forEach(([f,at])=>{tone('sawtooth',f,at,.5,.04);tone('sine',f,at,.6,.12)});
     [[523,.8],[659,.8],[784,.8],[1047,.8]].forEach(([f,at])=>{tone('sawtooth',f,at,2.4,.03);tone('sine',f,at,2.8,.08)});tone('sine',131,.8,2.8,.2)},
   whoosh:()=>nz('bandpass',600,2400,0,.22,.3,1.2),
   gulp:()=>{tone('sine',300,0,.09,.18,520);tone('sine',260,.12,.09,.15,480);tone('sine',700,.25,.25,.06,1100)},
   mount:()=>{nz('lowpass',500,120,0,.2,.3);[0,.13,.3,.43].forEach(at=>tone('sine',110,at,.08,.25,70))},
   open:()=>{nz('bandpass',900,2600,0,.16,.16,1.4);tone('sine',660,0,.08,.04,880)},
   close:()=>{nz('bandpass',2400,800,0,.14,.12,1.4)},
   tick:()=>tone('triangle',1400,0,.04,.06,1100),
   warp:()=>{tone('sine',300,0,.8,.12,1200);tone('triangle',450,.05,.8,.05,1800);nz('bandpass',800,4000,0,.7,.12,3)}
  })[k]?.();
}

// ---------- hooks ----------
{const f=heroLevelUp;heroLevelUp=function(){const r=f.apply(this,arguments);mSfx('lvl');return r}}
{const f=pickup;pickup=function(o){const r=f.apply(this,arguments);if(o&&o.ic!='🪙')mSfx(o.r>=3?'rare':'pick');return r}}
{const f=kill;kill=function(e){const r=f.apply(this,arguments);try{if(e&&e.m&&e.m.position.distanceTo(pl.position)<30)mSfx(e.boss||e.c&&e.c.al?'elite':'fall',e.boss?1.2:.8)}catch(_){}return r}}
{const f=bossDefeated;bossDefeated=function(){const r=f.apply(this,arguments);MU.hold=nowP()+7000;mSfx('victory');return r}}
{const f=dodge;dodge=function(){const d=hero.cdD||0;const r=f.apply(this,arguments);if((hero.cdD||0)>d)mSfx('whoosh');return r}}
{const f=drink;drink=function(){const p=pots;const r=f.apply(this,arguments);if(pots<p)mSfx('gulp');return r}}
{const f=toggleMount;toggleMount=function(){const m=riding;const r=f.apply(this,arguments);if(riding!==m)mSfx('mount');return r}}
{const f=fadeTo;fadeTo=function(fn){if(!(typeof AWD!='undefined'&&AWD.dead)&&party.length)mSfx('warp',.8);return f.apply(this,arguments)}}
// windows: soft page sound on open/close, a tick on buttons inside them
{const seen=new WeakMap(),mo=new MutationObserver(L=>{for(const m of L){const el=m.target,sh=!el.classList.contains('hide'),was=seen.get(el);if(was!==undefined&&was!==sh)mSfx(sh?'open':'close',.8);seen.set(el,sh)}});
  document.querySelectorAll('.modal').forEach(el=>{seen.set(el,!el.classList.contains('hide'));mo.observe(el,{attributes:true,attributeFilter:['class']})})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(b&&!b.disabled&&b.closest('.modal,#awT,#dth'))mSfx('tick',.7)},true);

// ---------- settings: music and sound volume ----------
{const sh=$('s_shake');if(sh&&!$('s_mus')){const L=sh.closest('label'),w=document.createElement('div');w.style.cssText='display:contents';
  w.innerHTML='<div class="setg">Sound</div><label class="setr"><span>Music volume <b id="sv_mus"></b></span><input type="range" id="s_mus" min="0" max="1" step="0.05"></label><label class="setr"><span>Sound effects volume <b id="sv_sfxV"></b></span><input type="range" id="s_sfxV" min="0" max="1" step="0.05"></label>';
  L.after(w);
  const sync=()=>{$('s_mus').value=SET.mus;$('sv_mus').textContent=Math.round(SET.mus*100)+'%';$('s_sfxV').value=SET.sfxV;$('sv_sfxV').textContent=Math.round(SET.sfxV*100)+'%'};sync();
  $('s_mus').oninput=e=>{SET.mus=+e.target.value;sync();muVol();saveSet()};
  $('s_sfxV').oninput=e=>{SET.sfxV=+e.target.value;SET.sfx=SET.sfxV>0;sync();muVol();saveSet()};
  $('s_reset').addEventListener('click',()=>{SET.mus=.55;SET.sfxV=1;SET.sfx=true;sync();muVol();saveSet()})}}
