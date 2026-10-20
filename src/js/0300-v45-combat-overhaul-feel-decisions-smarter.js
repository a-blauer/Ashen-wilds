// ================= v45: Combat overhaul — feel, decisions, smarter enemies, pacing =================
var slowT=0;
const nowP=()=>performance.now();
// ---------- tiny synth for hit sounds (no audio files needed) ----------
let AUD=null,NOISE=null;const sfxLast={};
function audio(){if(!AUD){try{AUD=new (window.AudioContext||window.webkitAudioContext)();const g=AUD.createGain();g.gain.value=.32;g.connect(AUD.destination);AUD.out=g;
  NOISE=AUD.createBuffer(1,AUD.sampleRate,AUD.sampleRate);const d=NOISE.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}catch(_){AUD=null}}
  if(AUD&&AUD.state=='suspended')AUD.resume();return AUD}
addEventListener('pointerdown',()=>audio(),{once:true});addEventListener('keydown',()=>audio(),{once:true});
function sfx(k,vol){
  if(SET.sfx===false)return;const a=AUD;if(!a||a.state!='running')return;const t=a.currentTime;if(sfxLast[k]&&t-sfxLast[k]<.045)return;sfxLast[k]=t;vol=vol||1;
  const env=(g,v,at,dec)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*vol,t+at);g.gain.exponentialRampToValueAtTime(.001,t+at+dec)};
  const osc=(type,f0,f1,dur,v,at)=>{const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);env(g,v,at||.004,dur);o.connect(g);g.connect(a.out);o.start(t);o.stop(t+dur+.05)};
  const noise=(ft,f0,f1,dur,v,q)=>{const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NOISE;f.type=ft;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+dur);f.Q.value=q||1;env(g,v,.003,dur);s.connect(f);f.connect(g);g.connect(a.out);s.start(t,Math.random()*.5);s.stop(t+dur+.05)};
  ({
   slash:()=>{noise('bandpass',3200,700,.13,.5,1.4);osc('triangle',520,180,.08,.12)},
   blunt:()=>{osc('sine',150,55,.16,.6);noise('lowpass',900,200,.1,.35)},
   stab:()=>{noise('bandpass',4200,1500,.07,.4,2);osc('square',900,400,.04,.06)},
   arrow:()=>{noise('highpass',3500,2000,.05,.3);osc('sine',820,420,.07,.2)},
   zap:()=>{osc('triangle',1100,260,.16,.25);noise('bandpass',2500,900,.09,.15,3)},
   crit:()=>{osc('square',1400,700,.09,.08);osc('sine',1800,1200,.12,.1)},
   brk:()=>{osc('square',520,500,.35,.13);osc('square',783,760,.35,.1);noise('bandpass',2000,1200,.2,.25,4)},
   perfect:()=>{osc('sine',380,1600,.25,.25);osc('sine',1760,1760,.5,.12,.05)},
   power:()=>{osc('sawtooth',180,720,.32,.09);osc('sine',360,1440,.3,.12)},
   boom:()=>{osc('sine',110,40,.45,.6);noise('lowpass',1400,120,.4,.5)},
   chime:()=>{osc('sine',990,990,.25,.12);osc('sine',1320,1320,.35,.1,.06)},
   horn:()=>{osc('sawtooth',196,190,.9,.12,.08);osc('sawtooth',294,290,.9,.08,.08)}
  })[k]?.();
}
// ---------- big popup text + screen flash ----------
{const v=document.createElement('div');v.id='pdv';$('stage').appendChild(v);const s=document.createElement('div');s.id='strk';s.className='hide';$('stage').appendChild(s)}
function popT(p,t,col,big){dn(p,t,col,-46,big?1300:1000);const el=$('stage').lastChild;if(el&&el.className=='dn'){el.style.fontSize=big?'1.55rem':'1.12rem';el.style.fontWeight='900';el.style.letterSpacing='.04em'}}
function flash(col){const v=$('pdv');v.style.setProperty('--fc',col);v.classList.remove('on');void v.offsetWidth;v.classList.add('on')}

