// ================= v165 The Dirge main quest — shared kit: state, sounds, hurt, cards, title cards =================
// State DG165Q (saved as x2.dg165, 3318):
//   g {st 0 · 1 the angel read (you have the spade) · 2 the Keeper's grave open, ex[14] examined, bad[14] wrong graves dug}
//   s {st 0 · 1 entered · 2 through (II reached), cp checkpoint 0..5, cw closing walls solved}
//   r {st 0 · 1 boarded · 2 through (III reached)}
//   o {lit[5] runes lit, st 0 · 1 the Den open}
var DG165Q={g:{st:0,ex:[],bad:[]},s:{st:0,cp:0,cw:0},r:{st:0},o:{lit:[0,0,0,0,0],st:0}};
var DG165={err:0,cardT:0,card:null,fear:0,lights:[]};
function dg165Z(){try{return ZT116.Z[4]}catch(_){return null}}
function dg165Title(t,sub,foot,kick){try{zt116Show(dg165Z(),kick||'The Dirge · Main Quest',t,sub||'',foot||'','z4')}catch(_){}}
function dg165Lv(g){try{return INSL[g].lv}catch(_){return [38,38]}}
function dg165InG(g){try{const I=curIns();return !!I&&I.g===g}catch(_){return false}}
// done also when the next instance has been reached (heroes already further on are never blocked)
function dg165GDone(){return DG165Q.g.st>=2||insReach(4)>=1}
function dg165SDone(){return DG165Q.s.st>=2||insReach(4)>=1}
function dg165RDone(){return DG165Q.r.st>=2||insReach(4)>=2}
function dg165ODone(){return DG165Q.o.st>=1||DG165Q.o.lit.every(Boolean)||insReach(4)>=3}

// ---------------- sounds: the crypt's own (whispers, heartbeat, creaks, water), made like svSnd ----------------
function dg165Snd(k,vol,pitch){try{if(SET.sfx===false)return;const a=AUD;if(!a||a.state!='running'||!NOISE)return;const t=a.currentTime;vol=(vol||1)*.9;const p=pitch||1;
  const env=(g,v,at,dec,hold,t0)=>{const s=t+(t0||0);g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(v*vol,s+at);if(hold)g.gain.setValueAtTime(v*vol,s+at+hold);g.gain.exponentialRampToValueAtTime(.001,s+at+(hold||0)+dec)};
  const osc=(type,f0,f1,dur,v,at,hold,t0)=>{const o=a.createOscillator(),g=a.createGain(),s=t+(t0||0);o.type=type;o.frequency.setValueAtTime(f0*p,s);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1*p),s+(hold||0)+dur);
    env(g,v,at||.01,dur,hold,t0);o.connect(g);g.connect(a.out);o.start(s);o.stop(s+(at||.01)+(hold||0)+dur+.05)};
  const noise=(ft,f0,f1,dur,v,q,at,hold,t0)=>{const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),s0=t+(t0||0);s.buffer=NOISE;s.loop=true;f.type=ft;f.Q.value=q||1;f.frequency.setValueAtTime(f0*p,s0);
    f.frequency.exponentialRampToValueAtTime(Math.max(40,f1*p),s0+(hold||0)+dur);env(g,v,at||.005,dur,hold,t0);s.connect(f);f.connect(g);g.connect(a.out);s.start(s0);s.stop(s0+(at||.005)+(hold||0)+dur+.05)};
  ({// a breathy whisper: formant-filtered noise in a few syllables
    whisper:()=>{for(let i=0;i<4;i++){const f=900+Math.random()*1400;noise('bandpass',f,f*(.7+Math.random()*.6),.18+Math.random()*.12,.09,7,.04,.03,i*.2+Math.random()*.05)}},
    heart:()=>{osc('sine',58,38,.18,.5,.005,0,0);osc('sine',52,36,.2,.36,.005,0,.22)},
    drone:()=>{osc('sawtooth',46,44,2.4,.05,.6,1.2);osc('sine',69,67,2.4,.08,.6,1.2);noise('lowpass',220,140,2.2,.08,1,.6,1)},
    drip:()=>{osc('sine',1400+Math.random()*600,700,.09,.05,.002)},
    creak:()=>{osc('sawtooth',90+Math.random()*30,60,.5,.05,.08,.25);noise('bandpass',700,380,.6,.08,9,.08,.2)},
    splint:()=>{noise('highpass',3000,900,.18,.4,1,.002);osc('square',180,70,.12,.08);noise('bandpass',1200,500,.25,.2,3,.01,0,.05)},
    gurgle:()=>{for(let i=0;i<5;i++)osc('sine',160+Math.random()*180,90,.07,.12,.004,0,i*.07+Math.random()*.03);noise('lowpass',600,200,.4,.15,1,.01)},
    scrape:()=>{noise('bandpass',2400,1400,.35,.22,6,.02,.1);noise('highpass',3800,2600,.3,.1,1,.01,.05)},
    wail:()=>{osc('sine',520,330,1.6,.12,.25,.4);osc('triangle',780,520,1.4,.05,.25,.4);noise('bandpass',1600,900,1.6,.06,4,.3,.4)},
    spade:()=>{noise('lowpass',1200,300,.22,.45,1,.004);osc('triangle',120,70,.12,.15);noise('highpass',2600,1600,.06,.15,1,.002)},
    thud:()=>{osc('sine',70,36,.5,.6,.004);noise('lowpass',500,90,.4,.4,1,.004)},
    grind:()=>{noise('bandpass',260,180,1.1,.35,2,.08,.5);osc('sawtooth',48,42,1.2,.06,.1,.5)},
    rumble:()=>{noise('lowpass',180,60,2.6,.55,1,.3,1.2);osc('sine',38,30,2.6,.25,.3,1.2)},
    chime:()=>{osc('sine',880,880,1.2,.08,.004);osc('sine',1320,1318,.9,.05,.004);osc('sine',660,660,1.4,.06,.004,0,.05)},
    choir:()=>{[220,277,330,415].forEach((f,i)=>osc('sine',f,f*.99,2.4,.035,.5,.8,i*.04))},
    gasp:()=>{noise('bandpass',1100,600,.5,.25,2,.12,.05)},
    scream:()=>{osc('sawtooth',880,420,.9,.06,.03,.2);osc('square',1240,760,.8,.03,.03,.15);noise('bandpass',2600,1400,1,.18,3,.03,.2)},
    slam:()=>{osc('sine',60,30,.8,.7,.003);noise('lowpass',800,70,.7,.55,1,.003);noise('highpass',2200,1200,.12,.25,1,.003)},
    fire:()=>{noise('bandpass',700,300,.8,.35,.8,.05,.35);noise('lowpass',400,160,.9,.25,1,.03,.4)},
    spikes:()=>{noise('highpass',4200,2600,.12,.3,1,.002);osc('square',420,180,.08,.05)},
    splash:()=>{noise('lowpass',2400,240,.6,.5,1,.005);osc('sine',200,60,.35,.22)},
    crumble:()=>{for(let i=0;i<6;i++)noise('lowpass',900,200,.18,.25,1,.004,0,i*.06+Math.random()*.04)}})[k]?.()}catch(_){}}

// ---------------- hurting the hero (traps, the crush, a fall): a share of their health, dodge-able unless `sure` ----------------
function dg165Hurt(frac,label,col,sure){try{if(typeof AWD!='undefined'&&AWD.dead)return false;if(typeof RV148!='undefined'&&RV148.down)return false;
  if(!sure&&hero.iv>0){dn(pl.position,'Dodged!','#bfe3ff',-20,900);return false}
  const d=Math.max(1,Math.round(heroMax()*frac));hero.hp-=d;hero.lastHit=performance.now();try{heroFlinch()}catch(_){}dn(pl.position,d,col||'#ff6b5b');
  if(label)dn(pl.position,label,'#ffb0a0',-36,900);shake(.18);burst(gY(pl.position,.9),0xaa2018,12,2,2,.45);flash('rgba(160,0,0,.35)');
  hero.iv=Math.max(hero.iv||0,.7);if(hero.hp<=0)down();try{hud()}catch(_){}return true}catch(e){console.warn('v165 hurt',e);return false}}

// ---------------- the card: an inscription or a clue, read on screen while you stand there ----------------
(function(){const st=document.createElement('style');st.textContent=`
#dg165c{position:fixed;left:50%;bottom:120px;transform:translateX(-50%) translateY(8px);z-index:8;width:min(430px,88vw);pointer-events:none;opacity:0;transition:opacity .35s,transform .35s;
  padding:18px 22px 16px;border-radius:6px;color:#d8d6cc;text-align:center;text-shadow:0 1px 2px #000;
  background:radial-gradient(ellipse at 50% 0%,rgba(70,74,72,.96),rgba(26,28,28,.97) 75%),#1a1c1c;border:1px solid rgba(160,180,170,.35);box-shadow:0 10px 40px rgba(0,0,0,.7),inset 0 0 40px rgba(0,0,0,.6)}
#dg165c.on{opacity:1;transform:translateX(-50%)}
#dg165c .kk{font:600 10px Cinzel,Georgia,serif;letter-spacing:.22em;text-transform:uppercase;color:#8ab0a4;margin-bottom:6px}
#dg165c .nm{font:600 20px 'Pirata One','IM Fell English SC',Georgia,serif;letter-spacing:.04em;color:#eef2ea}
#dg165c .dt{font:12px 'IM Fell English',Georgia,serif;color:#a8aaa0;margin:2px 0 8px}
#dg165c .ep{font:italic 15px 'IM Fell English',Georgia,serif;color:#e4e0d0;line-height:1.4}
#dg165c .ob{margin-top:10px;font:12.5px system-ui,sans-serif;color:#b8c8c0;line-height:1.45}
#dg165c .ob b{color:#e8f4ee}
#dg165c .hn{margin-top:10px;font:600 11.5px system-ui,sans-serif;color:#9ae8c8}
body.mob #dg165c{bottom:170px}
#dg165v{position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0;transition:opacity .2s;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 45%,rgba(0,0,0,.75) 100%)}`;document.head.appendChild(st);
  const d=document.createElement('div');d.id='dg165c';document.body.appendChild(d);const v=document.createElement('div');v.id='dg165v';document.body.appendChild(v)})();
// show a card while the hero stays within r of (x, z)
function dg165CardShow(html,x,z,r){const el=$('dg165c');if(!el)return;el.innerHTML=html;el.classList.add('on');DG165.card={x,z,r:r||3.4,t:performance.now()}}
function dg165CardHide(){const el=$('dg165c');if(el)el.classList.remove('on');DG165.card=null}
function dg165CardTick(){const C=DG165.card;if(!C)return;const P=pl.position;if(Math.hypot(P.x-C.x,P.z-C.z)>C.r||(typeof uiOpen=='function'&&uiOpen()))dg165CardHide()}
// fear: the edges of the screen darken in pulses (a jump scare, the walls closing in, the raft breaking)
function dg165Fear(k){DG165.fear=Math.max(DG165.fear,k)}
function dg165FearTick(dt){const v=$('dg165v');if(!v)return;DG165.fear=Math.max(0,DG165.fear-dt*.5);const o=Math.min(1,DG165.fear);if(Math.abs((DG165.fo||0)-o)>.02){DG165.fo=o;v.style.opacity=o.toFixed(2)}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{dg165CardTick();dg165FearTick(dt)}catch(e){if(!DG165.err++)console.warn('v165 kit',e)}return r}}

// ---------------- small shared pieces ----------------
// a candle on the kit (wax, drips, wick); its flame is a sprite added at runtime (dg165Flame)
function dg165Candle(k,x,y,z,h){h=h||.22;k.p('','cyl','c',0xd0c4a2,x,y+h/2,z,.035,h,.035);for(let i=0;i<3;i++)k.p('','sph','c',0xc8bc98,x+Math.cos(i*2.1)*.03,y+h*(.4+i*.18),z+Math.sin(i*2.1)*.03,.012,.03,.012);
  k.p('','sph','c',0xb8ac88,x,y+.01,z,.06,.02,.06);k.p('','box','c',0x1a1410,x,y+h+.012,z,.006,.025,.006)}
// a flickering flame sprite (+ an optional weak light pooled by the caller)
function dg165Flame(parent,x,y,z,s,col){const f=kqSpr(col||0xffb050,s||.22);f.position.set(x,y,z);f.userData.ph=Math.random()*6;f.userData.s0=s||.22;parent.add(f);return f}
function dg165FlTick(L,t){for(const f of L){const s=f.userData.s0*(1+.18*Math.sin(t*13+f.userData.ph)*Math.sin(t*5.1+f.userData.ph));f.scale.set(s*.75,s*1.25,1)}}
// a shared pool of point lights for one place: lights follow the nearest light spots, so only a few are ever in the scene
function dg165LPool(n,dist){const L=[];for(let i=0;i<n;i++){const l=new THREE.PointLight(0xffa050,0,dist||9,1.6);l.position.set(0,-50,0);scene.add(l);L.push(l)}return {L,on:false}}
function dg165LPoolTick(Pool,spots,P,t,on){const L=Pool.L;if(!on){if(Pool.on){Pool.on=false;L.forEach(l=>l.intensity=0)}return}Pool.on=true;
  const S=spots.map(s=>[s,(s.x-P.x)*(s.x-P.x)+(s.z-P.z)*(s.z-P.z)]).sort((a,b)=>a[1]-b[1]);
  for(let i=0;i<L.length;i++){const q=S[i];if(!q||q[1]>1600){L[i].intensity=0;continue}const s=q[0];L[i].position.set(s.x,s.y,s.z);L[i].color.setHex(s.c||0xffa050);L[i].distance=s.r||9;
    L[i].intensity=(s.i||1.4)*(s.off?0:1)*(.82+.18*Math.sin(t*(s.fq||9)+(s.ph||0))*Math.sin(t*3.7+(s.ph||0)))}}
