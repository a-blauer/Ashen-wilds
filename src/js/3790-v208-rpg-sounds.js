// ================= v208: heavier, traditional RPG sounds (owner, Nov 9 2026) =================
// "The sound effects from attacking, hitting, killing and leveling seem a bit too light and mobile gamey — lets change those to more
// serious traditional RPG sounds." The old ones were short square / triangle blips with pitch sweeps (the level-up a square-wave
// arpeggio). These are built from weight instead: low body thumps, filtered noise for steel, flesh and air, inharmonic metal partials
// for blade ring and gongs, brass-like filtered saw chords, and a short hall reverb behind all of them (one shared convolver).
//  * attacking: a melee swing now has a whoosh of air (deeper for slow, heavy weapons), played as the swing starts
//  * hitting: slash / blunt / stab / arrow thunk / arcane impact / critical crunch
//  * killing: a body collapsing (fall), a heavy fall with a gong for elites and bosses (elite), a brass fanfare for a Sovereign (victory)
//  * levelling: a horn call into a held brass chord over a low gong (lvl)
// The keys stay the same (sfx / mSfx callers are unchanged); everything else still plays the old sounds. Arrow hits use 'ahit' (0320)
// so the bow release keeps its own string sound. Co-op: sounds are local, each screen plays its own (as before).
var SND208={a:null,rv:null,last:{},
  // sfx() keys and mSfx() keys this file voices
  R:{slash:1,blunt:1,stab:1,arrow:1,ahit:1,zap:1,crit:1,swing:1,siphon:1,essence:1,rift:1,pour:1},
  M:{fall:1,elite:1,lvl:1,victory:1}};
function snd208Bus(){const a=typeof AUD!='undefined'?AUD:null;if(!a||!a.out)return null;
  if(SND208.a!==a){SND208.a=a;SND208.rv=null}
  if(SND208.rv==null){try{const sr=a.sampleRate,len=Math.floor(sr*1.9),ir=a.createBuffer(2,len,sr);
      for(let c=0;c<2;c++){const d=ir.getChannelData(c);let lp=0;for(let i=0;i<len;i++){const t=i/len,r=Math.random()*2-1;lp+=(r-lp)*(.35+.5*(1-t));d[i]=lp*Math.pow(1-t,3)*(i<sr*.012?i/(sr*.012):1)}}
      const cv=a.createConvolver();cv.buffer=ir;const g=a.createGain();g.gain.value=.55;cv.connect(g);g.connect(a.out);SND208.rv=cv}catch(_){SND208.rv=false}}
  return a}
// one voice: source → (filter) → gain envelope → dry out + reverb send
function snd208V(a,src,o,t,vol){const g=a.createGain(),at=Math.max(.002,o.atk||.004),pk=Math.max(.0002,o.v*vol);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+at);g.gain.exponentialRampToValueAtTime(.0001,t+at+o.dur);
  let n=src;if(o.lp||o.hp||o.bp){const f=a.createBiquadFilter();f.type=o.lp?'lowpass':o.hp?'highpass':'bandpass';const f0=o.lp||o.hp||o.bp;f.frequency.setValueAtTime(f0,t);
    if(o.f1)f.frequency.exponentialRampToValueAtTime(Math.max(40,o.f1),t+(o.fd||o.dur));f.Q.value=o.q||.8;n.connect(f);n=f}
  n.connect(g);g.connect(a.out);
  if(o.wet&&SND208.rv){const s=a.createGain();s.gain.value=o.wet;g.connect(s);s.connect(SND208.rv)}
  return t+at+o.dur+.05}
function snd208Play(k,vol){
  try{if(typeof SET!='undefined'&&(SET.sfx===false||SET.sfxV!=null&&!(+SET.sfxV>0)))return true;const a=snd208Bus();if(!a||a.state!='running')return true;
    const t0=a.currentTime;if(SND208.last[k]&&t0-SND208.last[k]<.045)return true;SND208.last[k]=t0;vol=vol||1;
    try{if(typeof fx141Quiet=='function'&&fx141Quiet(k))vol*=FX141.vol}catch(_){}
    const T=(ty,f0,f1,at,dur,v,o)=>{o=Object.assign({},o||{},{dur,v});const t=t0+at,s=a.createOscillator();s.type=ty;s.frequency.setValueAtTime(f0,t);
        if(f1&&f1!==f0)s.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur*(o.sw||1));if(o.det)s.detune.value=o.det;const e=snd208V(a,s,o,t,vol);s.start(t);s.stop(e)},
      N=(f0,f1,at,dur,v,o)=>{if(typeof NOISE=='undefined'||!NOISE)return;o=Object.assign({bp:f0},o||{},{dur,v,f1});if(o.lp){o.lp=f0;delete o.bp}if(o.hp){o.hp=f0;delete o.bp}
        const t=t0+at,s=a.createBufferSource();s.buffer=NOISE;s.loop=true;const e=snd208V(a,s,o,t,vol);s.start(t,Math.random()*.5);s.stop(e)},
      // metal: inharmonic partials (a struck blade, a gong); f = the lowest partial
      Mt=(f,at,dur,v,wet,P)=>{(P||[[1,1],[2.76,.55],[5.4,.3],[8.93,.16]]).forEach(([r,w],i)=>T('sine',f*r,f*r*.998,at,dur*(1-i*.16),v*w,{wet,atk:.002}))},
      // brass: two detuned saws through a lowpass that opens with the swell
      B=(f,at,dur,v,o)=>{o=o||{};[-6,6].forEach(d=>T('sawtooth',f,f,at,dur,v,{lp:o.lp0||500,f1:o.lp1||2200,fd:o.fd||.35,q:.9,atk:o.atk||.09,det:d,wet:o.wet==null?.45:o.wet}))};
    const S={
      // ---- attacking ----
      swing:()=>{const w=Math.max(0,Math.min(1,SND208.sw==null?.5:SND208.sw)),c=1-w*.45;N(380*c,1500*c,0,.24+w*.12,.2,{q:1.1,atk:.07,wet:.12});N(220*c,600*c,.04,.2+w*.1,.08,{lp:1,atk:.05})},
      arrow:()=>{T('triangle',196,132,0,.16,.16,{lp:1400,wet:.15,atk:.002});N(2600,900,0,.14,.12,{hp:1,atk:.004,wet:.1});T('sine',98,70,0,.1,.12)},
      // ---- hitting ----
      slash:()=>{N(2400,800,0,.1,.38,{q:1.3,atk:.002,wet:.15});T('sine',150,52,0,.18,.5,{atk:.003});N(900,160,0,.14,.3,{lp:1,atk:.003});Mt(1650,.004,.24,.035,.35)},
      blunt:()=>{T('sine',96,36,0,.3,.72,{atk:.003,wet:.2});N(750,90,0,.24,.48,{lp:1,atk:.003,wet:.2});N(1700,500,0,.05,.22,{q:1.4,atk:.002})},
      stab:()=>{N(3100,1200,0,.07,.32,{q:2,atk:.002,wet:.1});T('sine',170,66,.01,.14,.42,{atk:.003});N(650,120,.01,.12,.26,{lp:1,atk:.003})},
      ahit:()=>{T('sine',190,68,0,.13,.48,{atk:.002});N(1500,380,0,.08,.3,{q:1.5,atk:.002,wet:.1});T('triangle',430,300,0,.05,.07)},
      zap:()=>{T('sine',260,58,0,.32,.38,{atk:.004,wet:.45});N(2300,450,0,.26,.2,{q:2.2,atk:.004,wet:.4});T('sawtooth',116,55,0,.3,.1,{lp:700,f1:200,atk:.004,wet:.3})},
      crit:()=>{N(2200,180,0,.22,.55,{lp:1,atk:.002,wet:.3});T('sine',72,30,0,.38,.6,{atk:.002,wet:.25});N(3600,1400,0,.05,.32,{q:1.6,atk:.001});Mt(1180,.006,.5,.06,.5)},
      // ---- the Sovereign's essence (v208) ----
      siphon:()=>{T('sine',62,92,0,3.1,.28,{atk:.8,wet:.5,sw:1});N(300,1800,0,3.1,.12,{q:2.5,atk:1.2,wet:.6,fd:3});[0,.9,1.8].forEach(at=>Mt(520+at*90,at+.6,1.4,.018,.8,[[1,1],[2.4,.5],[3.9,.3]]))},
      essence:()=>{T('sine',55,55,0,2.4,.45,{atk:.05,wet:.6});N(1600,300,0,1.4,.22,{q:1.2,atk:.01,wet:.6});[[392,0],[523,.08],[784,.16],[1046,.24]].forEach(([f,at])=>T('sine',f,f,at,2,.05,{atk:.04,wet:.8}));Mt(262,0,2.6,.07,.8)},
      pour:()=>{N(500,2400,0,1.1,.16,{q:1.4,atk:.3,wet:.6});T('sine',110,165,0,1.2,.3,{atk:.3,wet:.6});Mt(330,.9,2.4,.06,.85);B(147,1,2.2,.03,{atk:.4,lp1:1600,fd:.9,wet:.7});B(220,1,2.2,.03,{atk:.4,lp1:1600,fd:.9,wet:.7})},
      rift:()=>{N(180,2600,0,.35,.4,{q:.9,atk:.01,wet:.5});T('sine',58,30,0,1.1,.6,{atk:.01,wet:.6});N(900,120,.1,1.2,.3,{lp:1,atk:.05,wet:.7});Mt(150,.05,1.8,.06,.8)},
      // ---- killing ----
      fall:()=>{T('sine',112,38,.02,.46,.55,{atk:.004,wet:.3});N(620,80,.02,.5,.42,{lp:1,atk:.02,wet:.3});T('sine',82,34,.2,.26,.3,{atk:.004});N(2600,1600,.18,.12,.05,{q:3,atk:.004})},
      elite:()=>{T('sine',72,24,0,.95,.72,{atk:.004,wet:.5});N(520,60,0,.95,.5,{lp:1,atk:.01,wet:.5});T('sawtooth',55,40,0,1.2,.12,{lp:320,atk:.02,wet:.4});Mt(310,.03,2.2,.07,.85,[[1,1],[2.02,.5],[2.92,.45],[4.2,.25],[5.5,.15]])},
      victory:()=>{[0,.32,.64].forEach((at,i)=>{T('sine',84-i*6,46,at,.45,.55,{atk:.003,wet:.4});N(420,70,at,.32,.35,{lp:1,atk:.004,wet:.4})});
        [[[147,175,220],.95,.6],[[117,147,175],1.55,.55],[[131,165,196],2.1,.5],[[147,185,220,294],2.65,2.9]].forEach(([ch,at,d])=>ch.forEach(f=>B(f,at,d,.028,{atk:.06,lp1:2400,fd:.25})));
        T('sine',73,73,2.65,3,.3,{atk:.08,wet:.6});Mt(220,2.65,3.2,.05,.9)},
      // ---- levelling ----
      lvl:()=>{B(220,0,.36,.04,{atk:.03,lp1:1800,fd:.12});B(294,.22,.3,.04,{atk:.03,lp1:1900,fd:.12});
        [147,220,294,370].forEach(f=>B(f,.46,2.3,.03,{atk:.22,lp0:400,lp1:2600,fd:.7}));T('sine',73,73,.46,2.4,.32,{atk:.12,wet:.6});
        Mt(196,.46,2.8,.09,.9,[[1,1],[2.02,.45],[2.76,.5],[5.4,.22],[8.9,.1]]);[1175,1480].forEach(f=>T('sine',f,f,.7,1.9,.018,{atk:.6,wet:.9}))}
    };
    const f=S[k];if(!f)return false;f();return true}catch(err){if(!SND208.err){SND208.err=1;console.warn('v208 sound',err)}return true}}
{const f=sfx;sfx=function(k,vol){if(SND208.R[k]&&snd208Play(k,vol))return;return f.apply(this,arguments)}}
{const f=mSfx;mSfx=function(k,vol){if(SND208.M[k]&&snd208Play(k,vol))return;return f.apply(this,arguments)}}
// attacking: the swing's air, as a melee swing starts (not the gathering swings, which come without a hit, nor knives / slings)
function snd208Swing(ms){try{if(!party.length)return;SND208.sw=Math.max(0,Math.min(1,((ms||300)-160)/380));sfx('swing',.9)}catch(_){}}
{const f=swingAnim;swingAnim=function(st,ms,onHit){try{if(onHit&&!(typeof SWNOL!='undefined'&&SWNOL))snd208Swing(ms)}catch(_){}return f.apply(this,arguments)}}
{const f=spinAnim;spinAnim=function(ms,onHit){try{if(onHit)snd208Swing((ms||400)*1.2)}catch(_){}return f.apply(this,arguments)}}
