// ================= v192: owner's fixes — slot switching, more ability points, no stray equip chime in town =================
// 1. Switching characters (main menu → another slot) reloads the page and continues there (2145, sessionStorage kq_cont).
//    That continue used to run while the game script was still loading, before the later files: v137+ gear was not in ITPL
//    yet, so loadGame threw at heroMax() before it hid the creator (the creator showed instead of the hero), and the later
//    loadGame / x2Load wrappers were skipped. Fixed in 2145: the continue waits until the whole script has run.
// 2. Ability points per level-up to level L (1090 kqrLvAP): 3 (L 2–9), 4 (10–19), 5 (20–29), 6 (30–39), 7 (40–50).
//    apEarned() is worked out from the level, so an existing hero gets the new total as soon as it loads (nothing is stored,
//    nothing taken away, nothing granted twice). hero.tal.__ap192 only marks that the hero was told once.
// 3. The "equip" chime (sfx('chime'), played when you drag gear onto yourself) also rang from the Night Fireworks decoration
//    (1910: 40% of bursts, every 2.6–5.6 s at night, near the Grand Square fountain) and from villagers coming home (1870).
//    Those now use their own sounds (sfx192 'fwk' / 'home'); the chime stays for real player actions.
function ap192Old(L){let n=0;for(let l=2;l<=L;l++)n+=l%5==0?3:2;return n}
function ap192New(L){let n=0;for(let l=2;l<=L;l++)n+=kqrLvAP(l);return n}
function ap192Note(){try{if(!hero||!hero.tal||typeof hero.tal!='object')return 0;if(hero.tal.__ap192)return 0;hero.tal.__ap192=1;
  const L=hero.lvl|0,d=ap192New(L)-ap192Old(L);
  if(d>0)setTimeout(()=>{try{say('⚡ <b>More ability points:</b> heroes now earn '+KQR_APTXT+'. You gained <b>+'+d+'</b> ability points for your level (K · Abilities).');hud()}catch(_){}},3200);
  return d}catch(_){return 0}}
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);if(r)ap192Note();return r}}
{const f=ccBegin;ccBegin=function(){const r=f.apply(this,arguments);try{if(hero.tal&&typeof hero.tal=='object')hero.tal.__ap192=1}catch(_){}return r}}

// small sounds of their own (same bus and volume as sfx)
function sfx192(k,vol){try{if(SET.sfx===false)return;const a=AUD;if(!a||a.state!='running'||!a.out)return;const t=a.currentTime;vol=vol||1;
  const tone=(ty,f0,f1,at,dur,v)=>{const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.setValueAtTime(f0,t+at);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+at+dur);
    g.gain.setValueAtTime(0,t+at);g.gain.linearRampToValueAtTime(v*vol,t+at+.01);g.gain.exponentialRampToValueAtTime(.0001,t+at+dur);o.connect(g);g.connect(a.out);o.start(t+at);o.stop(t+at+dur+.05)};
  const nz=(ft,f0,f1,at,dur,v)=>{if(!NOISE)return;const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NOISE;f.type=ft;f.frequency.setValueAtTime(f0,t+at);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+at+dur);
    g.gain.setValueAtTime(0,t+at);g.gain.linearRampToValueAtTime(v*vol,t+at+.01);g.gain.exponentialRampToValueAtTime(.0001,t+at+dur);s.connect(f);f.connect(g);g.connect(a.out);s.start(t+at,Math.random()*.5);s.stop(t+at+dur+.05)};
  if(k=='fwk'){nz('lowpass',900,120,0,.5,.3);tone('sine',90,40,0,.4,.25);for(let i=0;i<5;i++)nz('highpass',3000,5000,.18+i*.07,.05,.05)}       // a distant pop and crackle
  else if(k=='home'){tone('sine',523,523,0,.5,.08);tone('sine',784,784,.12,.6,.06)}                                                      // a soft two-note call
}catch(_){}}
