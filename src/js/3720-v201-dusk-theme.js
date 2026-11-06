// ================= v201: composed place music =================
// Owner, Nov 6 2026: "more atmospheric … a little more memorable with a resolving melody instead of droning notes".
// Pieces are written out and played through the v193 score hook in muStep (a theme with `score` skips the generative parts).
//
// 1) "Lanterns over the Meadow" (dk201Score): the first try for Duskhold. The owner liked it but it was not homely enough
//    for the town; kept, unused, for a zone instance later (it already has the combat layer).
// D minor, 72 bpm, 20 bars (~67 s) looping:
//   bars 0-3   intro / breath: harp, low strings, choir pad and wind only (Dm Bb Gm A, the tune's own chords)
//   bars 4-19  the song, four 4-bar phrases A A' B A'':
//              A   opens on the motif A-D-E-F and stops on C# (a half cadence, it wants to go on)
//              A'  same opening, climbs to Bb and comes home to D
//              B   brighter (F C Bb A7): rises to a held Bb, a low counter-line falls against it, ends on C# again
//              A'' the motif once more and the final resolution to a long D
// Every second time round the A phrases move to the low viol an octave down and a celesta sparkles over the B phrase,
// so the loop doesn't wear out. Fighting nearby (MU.int, as in every zone theme) fades in a pulsing bass and drums.
// Notes are MIDI numbers, lengths in sixteenths. All synthesized; uses the v79 / v193 instruments.
var DK201={bpm:72,bars:20,intro:4,
  ch:{Dm:[50,57,62,65,69],Bb:[46,53,58,62,65],Gm:[43,50,55,58,62],A:[45,52,57,61,64],F:[41,48,53,57,60],C:[48,55,60,64,67]},
  root:{Dm:38,Bb:46,Gm:43,A:45,F:41,C:48},
  // one entry per bar of the loop; a pair = first half / second half of the bar
  prog:['Dm','Bb','Gm','A',  'Dm','Bb','Gm','A', 'Dm','Bb',['Gm','A'],'Dm', 'F','C','Bb','A', 'Dm','Bb',['Gm','A'],'Dm'],
  mel:[ // the 16 song bars
    [[69,4],[74,6],[76,2],[77,4]], [[79,6],[77,2],[74,8]],          [[70,4],[74,4],[79,6],[77,2]], [[76,6],[74,2],[73,8]],
    [[69,4],[74,6],[76,2],[77,4]], [[79,6],[77,2],[74,4],[77,4]],   [[79,4],[82,4],[81,4],[76,2],[73,2]], [[74,12],[0,4]],
    [[72,4],[77,4],[81,6],[79,2]], [[79,6],[81,2],[79,4],[76,4]],   [[77,2],[79,2],[81,4],[82,8]], [[81,6],[79,2],[76,4],[73,4]],
    [[69,4],[74,6],[76,2],[77,4]], [[79,6],[77,2],[74,4],[70,4]],   [[70,4],[79,4],[76,6],[73,2]], [[74,16]]],
  counter:{12:57,13:55,14:53,15:52,16:50},   // loop bar → low viol note (whole bar), under the B phrase and into A''
  arp:[0,1,2,3,4,3,2,1],
  bell:{4:62,16:69},
  fight:{bass:'X.x.x.x.x.x.x.xx',drums:{taiko:'X.......x.....x.',tek:'....g.......g..g',dum:'..g.....g.......'}}};
{const D=DK201;D.on={};D.mel.forEach((bar,k)=>{let s=0;bar.forEach(([n,l])=>{if(n)D.on[(D.intro+k)*16+s]=[n,l,k];s+=l})})}
function dk201Chord(b,s){const p=DK201.prog[b];return Array.isArray(p)?p[s<8?0:1]:p}
// soft wind through the trees: a looped noise bed through a slowly wandering band-pass
function dk201Wind(t,d,v){const a=MU.a,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=MU.nz;s.loop=true;
  f.type='bandpass';f.Q.value=.9;const f0=380+Math.random()*200;f.frequency.setValueAtTime(f0,t);
  f.frequency.linearRampToValueAtTime(f0*(1.7+Math.random()*.6),t+d*.45);f.frequency.linearRampToValueAtTime(f0*(.9+Math.random()*.3),t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+d*.3);g.gain.linearRampToValueAtTime(v*.6,t+d*.7);g.gain.linearRampToValueAtTime(0,t+d+1.5);
  s.connect(f);f.connect(g);muRoute(g,2);s.start(t,Math.random()*.5);s.stop(t+d+1.6)}
function dk201Score(t,bar,s){
  const D=DK201,b=bar%D.bars,cyc=Math.floor(bar/D.bars)%2,sp=60/D.bpm/4,F=MU.int||0,C=1-F*.35,k=b-D.intro,chn=dk201Chord(b,s),chd=D.ch[chn],
    bsec=k>=8&&k<12;
  // harp: eighth-note arpeggios through the chord
  if(s%2==0){const i=D.arp[(s/2)|0];muPluck(muF(chd[i]),t,(s%8==0?.17:.13)*C*(k<0?1.1:1),'triangle')}
  // low strings follow the bass line (a new note when the chord changes), choir pad, wind
  // the bass walks: the root on beat one, then the fifth (or the next chord's root) on beat three, so nothing sits still
  if(s==0||s==8){const half=Array.isArray(D.prog[b]),r=D.root[chn];
    muCello(muF(s==8&&!half?r+7:r),t,sp*8*.94,.075*C);
    if(s==0||half)muPad([2,3,4].map(i=>muF(chd[i])),t,sp*(half?8:16),(bsec?.018:.011)*C,{cut:bsec?900:650,form:1})}
  if(s==0&&b%4==0)dk201Wind(t,sp*16*4,.05);
  if(s==0&&D.bell[b]!=null&&cyc==0)muBell(muF(D.bell[b]),t,.032);
  if(s==0&&D.counter[b]!=null)muCello(muF(D.counter[b]),t,sp*16*.96,.06);
  // the melody
  const e=D.on[b*16+s];if(e){const [n,l,kk]=e,dur=sp*l*.95;
    if(cyc==1&&kk<8)muCello(muF(n-12),t,dur,.11);
    else muFlute(muF(n),t,dur,.1*(1+F*.15));
    if(cyc==1&&kk>=8&&kk<12&&l>=4)muCelesta(muF(n+12),t,.06)}
  // a soft frame drum lifts the B phrase
  if(bsec&&(s==0||s==10))MUDR.dum(t,(s?.14:.28)*C);
  // combat: a driving bass and drums fade in with MU.int and out after the fight, like the zone themes
  if(F>.05){const B=D.fight.bass[s];if(B!='.'){const r=D.root[chn];muBass(muF(r>47?r-12:r),t,sp*1.6,.14*Math.max(.6,F)*(B=='X'?1.2:1))}
    for(const nm in D.fight.drums){const ch=D.fight.drums[nm][s];if(ch&&ch!='.')MUDR[nm](t,F*(ch=='X'?1:ch=='g'?.35:.7))}}
}

// 2) "Hearth and Home" (hm201Score): Duskhold's theme. Owner: "a place of safety … a place you call home. It should feel cozy
//    and put you at ease". A slow waltz (3/4, 80 bpm) in F major, 36 bars (~81 s) looping:
//      bars 0-3   intro: the waltz alone (plucked bass on one, soft harp chords on two and three), a music box twinkles
//      bars 4-11  A   the wooden flute's lullaby, ending on C (wants to go on)
//      bars 12-19 A'  the same tune coming home to F (4-3-2-1)
//      bars 20-27 B   the warm cello sings the bridge (Bb F Gm C), a soft pad comes in
//      bars 28-35 A'' the flute again with the music box an octave up, home to F
//    Every second loop the first A is played by the music box instead of the flute. A faint hearth crackle under it all.
//    Duskhold has no fights, so this theme has no combat layer. The engine counts 16-step bars; a waltz bar is 12 steps,
//    so the score keeps its own position (bar*16+step).
var HM201={bpm:80,bar:12,bars:36,
  ch:{F:[41,[57,60,65]],Bb:[46,[58,62,65]],C:[48,[55,60,64]],C7:[48,[58,60,64]],Dm:[50,[57,62,65]],Gm:[43,[58,62,67]]},
  prog:['F','Bb','F','C', 'F','Bb','F','C','Dm','Bb','C','C', 'F','Bb','F','C','Dm','Bb','C','F',
        'Bb','F','Gm','C','Bb','F','Gm','C7', 'F','Bb','F','C','Dm','Bb','C','F'],
  A:[[[72,6],[74,2],[72,4]],[[74,6],[72,2],[70,4]],[[69,8],[72,4]],[[67,12]],[[69,4],[74,4],[77,4]],[[74,6],[72,2],[70,4]]],
  endA:[[[67,4],[69,4],[70,4]],[[72,12]]], home:[[[72,4],[70,4],[67,4]],[[65,12]]],
  B:[[[70,6],[72,2],[74,4]],[[72,8],[69,4]],[[70,6],[69,2],[67,4]],[[64,4],[67,4],[72,4]],[[77,8],[74,4]],[[72,8],[77,4]],[[74,4],[72,4],[70,4]],[[67,6],[69,2],[70,4]]]};
{const H=HM201;H.on={};const put=(bars,b0,part)=>bars.forEach((bar,k)=>{let s=0;bar.forEach(([n,l])=>{H.on[(b0+k)*H.bar+s]=[n,l,part];s+=l})});
  put(H.A.concat(H.endA),4,'A1');put(H.A.concat(H.home),12,'A2');put(H.B,20,'B');put(H.A.concat(H.home),28,'A3')}
function hm201Crackle(t,v){muNz(t,.012+Math.random()*.02,'bandpass',1400+Math.random()*2600,900,1.2,v,0,.001)}
function hm201Score(t,bar,s){
  const H=HM201,sp=60/H.bpm/4,pos=bar*16+s,L=H.bars*H.bar,p=pos%L,cyc=Math.floor(pos/L)%2,b=Math.floor(p/H.bar),ms=p%H.bar,
    cn=H.prog[b],[bs,up]=H.ch[cn],late=b>=20;
  // the waltz: a plucked bass on one, soft harp chords on two and three, a little ripple before the next bar now and then
  if(ms==0)muPluck(muF(bs),t,.2,'triangle');
  if(ms==4||ms==8)up.forEach((n,i)=>muPluck(muF(n),t+i*.012,ms==4?.06:.05,'triangle'));
  if(ms==10&&b%4==3)[up[2]+12,up[1]+12].forEach((n,i)=>muPluck(muF(n),t+i*sp,.045,'triangle'));
  // a warm pad under the second half (B and A'')
  if(ms==0&&late)muPad(up.map(muF),t,sp*12,.008,{cut:560});
  // the intro's music box
  if(b<4&&(ms==0||ms==8))muCelesta(muF(up[ms?1:2]+24),t,ms?.04:.06);
  // the melody
  const e=H.on[p];if(e){const [n,l,part]=e,dur=sp*l*.95;
    if(part=='B')muCello(muF(n-12),t,dur,.12);
    else if(part=='A1'&&cyc==1)muCelesta(muF(n+12),t,.13);
    else{muFlute(muF(n),t,dur,.09);if(part=='A3')muCelesta(muF(n+12),t,.045)}}
  // the hearth: a few soft pops
  if(Math.random()<.18)hm201Crackle(t+Math.random()*sp,.03+Math.random()*.04);
}
MTH.town=Object.assign({},MTH.town,{bpm:HM201.bpm,score:hm201Score});
