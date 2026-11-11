// v215 trial (owner: "more complex and realistic music … lets try that on argus"): the Argus fight as a full piece (44 bars,
// about 75 s: intro, theme, theme with trumpets and choir, a quieter middle with a string melody, a build, the theme at full
// strength, a short close) played on recorded instrument samples instead of synthesised tones. Listening page only for now
// (tools/songs_page.js includes this file and the samples in tools/samples/fluidr3); not part of the game build.
// ---------- sample player ----------
var SM215={D:{},buf:{},p:null,ok:0,
  // each instrument's level, set from offline measurements so the tune (horns, trombones, trumpets) sits on top and the drums under it
  G:{french_horn:3,trombone:2,trumpet:3.5,string_ensemble_1:3.3,tremolo_strings:5,cello:3.3,contrabass:2.6,choir_aahs:3.5,pizzicato_strings:2.4,taiko_drum:1.4,timpani:2.5,tubular_bells:4}};
SM215.load=function(a){if(SM215.p)return SM215.p;const jobs=[];
  for(const inst in SM215.D){SM215.buf[inst]=[];for(const m in SM215.D[inst]){const bin=atob(SM215.D[inst][m]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
      jobs.push(a.decodeAudioData(u.buffer).then(b=>{SM215.buf[inst].push({m:+m,b})}))}}
  return SM215.p=Promise.all(jobs).then(()=>{for(const k in SM215.buf)SM215.buf[k].sort((x,y)=>x.m-y.m);SM215.ok=1})};
// play `inst` at MIDI note `midi` at time t for d seconds, loudness v. o: {at: attack s, rel: release s, send: reverb 0|1|2}
function sm215(inst,midi,t,d,v,o){const L=SM215.buf[inst];if(!L||!L.length)return;let b=L[0];for(const x of L)if(Math.abs(x.m-midi)<Math.abs(b.m-midi))b=x;
  const a=MU.a,src=a.createBufferSource(),g=a.createGain(),at=o&&o.at||.004,rel=o&&o.rel||.14;src.buffer=b.b;src.playbackRate.value=Math.pow(2,(midi-b.m)/12);
  t=Math.max(a.currentTime,t+(Math.random()-.5)*.012);v*=(.9+Math.random()*.2)*(SM215.G[inst]||1)*1.45;   // a little human looseness
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+at);g.gain.setValueAtTime(v,t+Math.max(at,d));g.gain.linearRampToValueAtTime(0,t+d+rel);
  src.connect(g);muRoute(g,o&&o.send!=null?o.send:2);src.start(t);src.stop(t+d+rel+.05)}
// ---------- the piece ----------
// B harmonic minor, 140 bpm. Chords are scale degrees (0 = B minor, 3 = E minor, 4 = F sharp major, 5 = G major).
// Every 8-bar section uses P: Bm Em F# Bm | G Em F# Bm, so each 4-bar phrase ends F# -> Bm (home).
var AR215={bpm:140,root:47,mode:'hmin',P:[0,3,4,0,5,3,4,0],
  form:[['intro',[0,0,5,4]],['A',null],['A2',null],['B',null],['build',[3,3,4,4]],['C',null],['out',[0,3,4,0]]],
  mel:{ // 'degree,length in sixteenths', '_' = rest (the notation of 3870)
    intro:'_,52 4,4 6,8',
    A:'0,2 _,2 0,2 _,2 4,2 _,2 2,4|3,2 _,2 3,2 _,2 7,4 5,4|4,2 _,2 4,2 _,2 8,2 _,2 6,4|7,12 _,4|9,2 _,2 9,2 _,2 7,2 _,2 5,4|7,2 _,2 7,2 _,2 5,4 3,4|4,2 _,2 6,2 _,2 8,2 _,2 6,4|7,12 _,4',
    B:'11,12 9,4|10,12 7,4|8,8 11,8|9,4 7,12|12,12 9,4|10,8 7,8|8,8 6,8|7,16',
    Bh:'2,16|5,16|6,16|4,16|7,16|5,16|6,8 8,8|7,16',   // the horn's slow line under the strings
    build:'3,8 5,8|7,8 10,8|8,8 11,8|13,16',
    out:'7,16|_,48'},
  tk:{intro:'x.....x.....x...',A:'X..x..x.X..x..x.',A2:'X..x..x.X..x..xx',B:'x.......x.......',build:'x.x.x.x.x.x.x.x.',C:'X.xxX.x.X.xxX.xx',out:'X.....x.....x...'},
  dyn:{intro:.7,A:.9,A2:1,B:.75,build:.9,C:1.1,out:.8}};
(function(){const A=AR215;A.bars=[];A.on={};
  A.form.forEach(([sec,ch])=>{const c=ch||A.P;c.forEach((d,i)=>A.bars.push({sec,i,ch:d,n:c.length}))});A.n=A.bars.length;
  for(const k in A.mel){const n=k=='Bh'?8:A.bars.filter(b=>b.sec==(k=='Bh'?'B':k)).length;A.on[k]=mu215Parse(A.mel[k],n);if(!A.on[k])console.warn('v215 trial: melody length',k)}
  A.on.A2=A.on.C=A.on.A})();
function ar215Score(t,bar,s){if(!SM215.ok)return;const A=AR215,B=A.bars[bar%A.n],sec=B.sec,d=B.ch,sp=60/A.bpm/4,ps=B.i*16+s,N=(deg,oct)=>muNote(A,deg,oct);
  let D=A.dyn[sec];if(sec=='build')D*=.75+.35*(ps/64);if(sec=='intro')D*=.6+.4*(ps/64);
  const acc=s==0||s==6||s==12;
  // low strings: a driving 3+3+2 pulse on the chord's root (held notes in the quiet middle)
  if(sec=='B'){if(s==0){sm215('cello',N(d,0),t,sp*15,.5*D,{at:.06,rel:.3});sm215('contrabass',N(d,-1),t,sp*15,.5*D,{at:.06,rel:.3})}}
  else if(s%2==0){sm215('cello',N(d,0),t,sp*1.5,(acc?.62:.36)*D,{rel:.08,send:1});if(acc)sm215('contrabass',N(d,-1),t,sp*2.5,.6*D,{rel:.1,send:1})}
  // string chords, one bow per bar (shivering tremolo in the intro and the build)
  if(s==0){const tr=sec=='intro'||sec=='build',v=(tr?.2:sec=='B'?.2:.16)*D;[0,2,4].forEach(k=>sm215(tr?'tremolo_strings':'string_ensemble_1',N(d+k,1),t,sp*15.5,v,{at:.12,rel:.3}));
    if(sec=='C')sm215('string_ensemble_1',N(d+7,1),t,sp*15.5,v,{at:.12,rel:.3})}
  // choir: with the second theme and the last one, and softly in the middle
  if(s==0&&(sec=='A2'||sec=='C'||sec=='B')){const v=(sec=='B'?.12:.2)*D;[0,2,4].forEach(k=>sm215('choir_aahs',N(d+k,1),t,sp*15.5,v,{at:.15,rel:.35}))}
  // plucked strings on the off-beats under the theme
  if((sec=='A'||sec=='A2')&&s%4==2)[0,2,4].forEach(k=>sm215('pizzicato_strings',N(d+k,1),t,1.2,.2*D,{rel:.2,send:1}));
  // melody
  const e=A.on[sec]&&A.on[sec][ps];
  if(e){const dur=sp*e[1]*.94,lg=e[1]>=4,o={at:lg?.03:.008,rel:.12};
    if(sec=='B'){sm215('string_ensemble_1',N(e[0],1),t,dur,.5*D,{at:.07,rel:.25});sm215('string_ensemble_1',N(e[0],2),t,dur,.22*D,{at:.07,rel:.25})}
    else{sm215('french_horn',N(e[0],1),t,dur,.6*D,o);sm215('trombone',N(e[0],0),t,dur,.4*D,o);
      if(sec=='A2'||sec=='C'||sec=='build')sm215('trumpet',N(e[0],1),t,dur,(sec=='C'?.42:.3)*D,o)}}
  if(sec=='B'){const h=A.on.Bh[ps];if(h)sm215('french_horn',N(h[0],1),t,sp*h[1]*.95,.3*D,{at:.08,rel:.25})}
  // the last theme: violins run up and down the chord above everything, a bell on every bar
  if(sec=='C'){if(s%2==0)sm215('string_ensemble_1',N(d+[0,2,4,7,4,2,4,2][s/2],2),t,sp*1.8,.2*D,{at:.01,rel:.1});if(s==0)sm215('tubular_bells',N(d,1),t,2.6,.3*D,{rel:.3})}
  // drums: taiko, and a kettledrum on the first beat (rolling through the end of the intro and the build)
  const c=A.tk[sec][s];if(c!='.')sm215('taiko_drum',45,t,1.2,(c=='X'?.9:.5)*D,{rel:.2,send:1});
  if(s==0)sm215('timpani',N(d,-1),t,1.8,.7*D,{rel:.3,send:1});
  if((sec=='build'&&B.i>=2)||(sec=='intro'&&B.i==3))sm215('timpani',N(d,-1),t,.5,(.25+.5*((ps%32)/32))*D,{rel:.2,send:1})}
MTH.z0x2={bpm:140,root:47,mode:'hmin',prog:[0],fight:1,score:ar215Score,samples:1};
// v79's engine plays a theme's `score` instead of its own parts (3580 hook; the listening page has no 3580, so hook it here too)
{const f=muStep;muStep=function(t){if(MU.th&&MU.th.samples){try{MU.th.score(t,MU.bar,MU.s)}catch(e){if(!SM215.err){SM215.err=1;console.warn('v215 trial',e)}}return}return f.apply(this,arguments)}}
