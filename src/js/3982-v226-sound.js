// ================= v226: sound effects you can hear (owner, Nov 12 2026: "Sound effects aren't working in general") =================
// What was found:
//  * The effects did play, but far under the music. Measured offline (the game's own voices, the sound bus as it was): a sword hit
//    peaked about 4 dB under the music and its RMS was 15–20 dB under it; most of a hit's weight was a 40–150 Hz body thump (v208)
//    that laptop and phone speakers cannot play, so what was left was a faint tick; the swing's whoosh peaked at −35 dB.
//  * The sound could get stuck off: the ability preview (2240) mutes effects while it plays an ability (SET.sfx = false) and puts the
//    setting back when it ends; stopping the preview from inside one of its own steps reset its counter without putting it back, and a
//    settings save in the meantime wrote "effects off" into the saved settings, while the volume slider still showed 100%.
//  * The game's sound only woke on the very first click or key (a listener that ran once): a browser that suspends or interrupts
//    the audio later (a tab switch on a phone, a lock screen) left the effects silent until a reload.
// Now:
//  * The effects' bus (AUD.out, its volume the "Sound effects volume" slider) runs through a presence lift (SND226.eq dB at
//    SND226.eqF Hz), a saturated copy of its low end (SND226.sat: the thump's harmonics, so small speakers play the weight), a make-up
//    gain (SND226.mk) and a soft limiter that keeps stacked hits from clipping. Hits now peak around the music's level.
//  * The preview's mute can't be saved, and stopping the preview always puts the setting back. Saved settings with effects off while
//    the effects volume is above zero are switched back on once (SET.v226s): that combination came from the stuck mute.
//  * Every click, tap or key wakes the audio again if the browser suspended it.
//  * The swing whoosh is louder (SND226.swing ×); sfx('hit') (Ssith'ra's burst) and svSnd('thud') / ('zap') had no sound and now use
//    'blunt', 'heavy' and the zap.
// Co-op: sounds are local (each screen plays its own), as before.
var SND226={on:true,mk:2.6,eq:4,eqF:2400,sat:.42,swing:2.6,a:null};
function snd226Bus(){try{if(!SND226.on||typeof AUD=='undefined'||!AUD||!AUD.out||SND226.a===AUD)return;const a=AUD;SND226.a=a;
  const eq=a.createBiquadFilter();eq.type='peaking';eq.frequency.value=SND226.eqF;eq.Q.value=.7;eq.gain.value=SND226.eq;
  const mk=a.createGain();mk.gain.value=SND226.mk;
  const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=240;const ws=a.createWaveShaper();{const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*4)}ws.curve=c}
  const hp=a.createBiquadFilter();hp.type='highpass';hp.frequency.value=320;const sg=a.createGain();sg.gain.value=SND226.sat;
  // a soft limiter (tanh: the same below a third of full scale, rounding off above) so stacked hits never clip
  const pre=a.createGain();pre.gain.value=.5;const lim=a.createWaveShaper();{const n=2048,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(2*x)}lim.curve=c}const post=a.createGain();post.gain.value=.95;
  try{a.out.disconnect()}catch(_){}
  a.out.connect(eq);eq.connect(mk);mk.connect(pre);a.out.connect(lp);lp.connect(ws);ws.connect(hp);hp.connect(sg);sg.connect(pre);pre.connect(lim);lim.connect(post);post.connect(a.destination);SND226.n={eq,mk,lim}}catch(e){console.warn('v226 sound bus',e)}}
{const f=audio;audio=function(){const r=f.apply(this,arguments);snd226Bus();return r}}
setInterval(()=>{try{snd226Bus()}catch(_){}},1500);
// wake the audio on any later click, tap or key
['pointerdown','keydown','touchend'].forEach(ev=>addEventListener(ev,()=>{try{if(typeof AUD=='undefined'||!AUD){audio();return}if(AUD.state!=='running'&&AUD.resume){const p=AUD.resume();if(p&&p.catch)p.catch(()=>{})}}catch(_){}},true));
document.addEventListener('visibilitychange',()=>{try{if(!document.hidden&&AUD&&AUD.state!=='running'&&AUD.resume){const p=AUD.resume();if(p&&p.catch)p.catch(()=>{})}}catch(_){}});
// the ability preview's mute is never saved, and always put back
{const f=saveSet;saveSet=function(){let keep;try{if(typeof ABX!='undefined'&&ABX.ctx>0){keep=SET.sfx;SET.sfx=ABX.sfx}}catch(_){}try{return f.apply(this,arguments)}finally{if(keep!==undefined)SET.sfx=keep}}}
{const f=abxStop;abxStop=function(){let back;try{if(ABX.on&&ABX.ctx>0)back=ABX.sfx}catch(_){}const r=f.apply(this,arguments);if(back!==undefined)SET.sfx=back;return r}}
// a saved "effects off" with the effects volume up came from that stuck mute: on once more
try{if(SND226.on&&!SET.v226s){SET.v226s=1;if(SET.sfx===false&&+SET.sfxV>0)SET.sfx=true;saveSet();const st=$('s_sfx');if(st)st.checked=SET.sfx!==false}}catch(_){}
// louder whoosh; the keys that had no sound
{const f=sfx;sfx=function(k,vol){if(SND226.on){if(k==='swing')vol=(vol||1)*SND226.swing;else if(k==='hit')k='blunt'}return f.call(this,k,vol)}}
{const f=svSnd;svSnd=function(k,vol,p){if(SND226.on){if(k==='thud')return f.call(this,'heavy',(vol||1)*.8,(p||1)*1.3);if(k==='zap'){try{sfx('zap',vol)}catch(_){}return}}return f.apply(this,arguments)}}
