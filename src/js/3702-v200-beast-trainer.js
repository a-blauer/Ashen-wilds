// ================= v200: the Beast Trainer trains companions in slots =================
// Owner (Nov 5 2026): "make the beast trainer a station where you have to place a companion inside for it to gradually level
// up to your level. It should take 5 minutes to level up to your level. Instead of upgrades giving discount — make it just have
// more slots available for training. Each slot costs 1k gold." Training itself is free (owner's choice).
//  * Slots: 1 + the shop's level (shpL109('trainer'), 0-3; each level costs 1,000 gold at the Steward, 3700).
//  * A companion set in a slot gets c.tr200 = {t0, a: its level then, b: your level then} (saved with the companion) and climbs
//    from a to b evenly over TRN200.T (5 minutes, real time: it keeps training while you are away). Done → the slot frees.
//  * A companion in training does not fight: one from your active team gives its place to the first free reserve companion
//    (you need one); swapping it back into the team (Companions window) ends its training and keeps the levels it gained.
//  * The Companion Bond (v141) row stays on top of the window.
// Co-op: personal (your companions); the slot count follows the trainer's level in the kingdom you see.
var TRN200={T:5*60000};
function trn200N(){return 1+shpL109('trainer')}
function trn200In(){return party.filter(c=>c&&c.tr200)}
function trn200Lv(c){const t=c.tr200;if(!t)return c.l;const p=Math.max(0,Math.min(1,(Date.now()-t.t0)/TRN200.T));return Math.min(t.b,t.a+Math.floor((t.b-t.a)*p+1e-9))}
function trn200Left(c){const t=c.tr200;return t?Math.max(0,TRN200.T-(Date.now()-t.t0)):0}
function trn200To(){return Math.min(hero.lvl,MAXLV)}
// levels gained so far are written onto the companion; done → out of the slot
function trn200Tick(quiet){let ch=false;const A=actN141();
  party.forEach((c,i)=>{const t=c&&c.tr200;if(!t)return;const L=trn200Lv(c);
    if(L>c.l){const from=c.l;c.l=L;c.x=0;c.h=M(c);ch=true;if(EVLV.some(v=>v>from&&v<=L)&&!quiet)try{say('✨ '+c.n+' reached Lv '+L+' in training and can evolve now (Companions menu).')}catch(_){}}
    if(L>=t.b||Date.now()-t.t0>=TRN200.T){delete c.tr200;ch=true;if(!quiet)try{say('💪 '+c.n+' finished training: Lv '+t.a+' → Lv '+c.l+'.');sfx('power')}catch(_){}}
    else if(i<A){delete c.tr200;ch=true;if(!quiet)try{say('🐾 '+c.n+' left training to join you (Lv '+c.l+').')}catch(_){}}});
  if(ch){try{hsDirty();ui();hud()}catch(_){}}return ch}
setInterval(()=>{try{if(typeof party!='undefined'&&party.length&&trn200In().length){if(trn200Tick()&&xwMode=='visitor'&&xwArg=='trainer'&&!$('xw').classList.contains('hide'))rX()}}catch(e){console.warn('v200 trainer',e)}},1000);
function trn200Set(i){const c=party[i];if(!c||c.tr200)return;const to=trn200To();
  if(trn200In().length>=trn200N())return say('💪 Every training slot is taken.');if(c.l>=to)return say(c.n+' is already at your level.');
  const A=actN141();if(i<A){const j=party.findIndex((q,k)=>k>=A&&q&&!q.tr200&&q.h>0);if(j<0)return say('🐾 '+c.n+' is in your active team and no reserve companion can take its place. Hatch or tame another first.');
    const sub=party.splice(j,1)[0];party.splice(i,1,sub);party.push(c);c.emp=false;try{say('🐾 '+sub.n+' takes '+c.n+'\'s place at your side.')}catch(_){}}
  c.tr200={t0:Date.now(),a:c.l,b:to};try{sfx('chime')}catch(_){}say('💪 '+c.n+' starts training: Lv '+c.l+' → Lv '+to+' in 5 minutes.');try{hsDirty();ui();hud();saveGame(true)}catch(_){}rX()}
function trn200Stop(i){const c=party[i];if(!c||!c.tr200)return;trn200Tick(true);if(c.tr200){delete c.tr200;say('🐾 '+c.n+' stops training at Lv '+c.l+'.')}try{ui();hud()}catch(_){}rX()}
function trn200Bond(){if(typeof cs141Has!='function')return '';const has=cs141Has(),rd=cs141Ready(),c=cs141Cost();
  return `<div class="cs141row" style="display:flex;gap:10px;align-items:center;padding:8px 10px;margin:0 0 8px;border:1px solid rgba(201,162,74,.45);border-radius:8px;background:rgba(201,162,74,.08)">
    <span style="font-size:1.5rem">🐾</span><div style="flex:1"><b>Companion Bond</b><div class="mut" style="font-size:.72rem">${has?'Learned: you lead two companions at once.':rd?'Learn to lead a second companion into battle.':'Defeat two Sovereigns first ('+bossDone.size+' / '+CS141.need+').'}</div></div>
    ${has?'<span class="mut">✔ Learned</span>':`<button data-cs141="1" ${rd&&gold>=c?'':'disabled'}>Learn · 🪙 ${c}</button>`}</div>`}
function trn200Render(){trn200Tick(true);const N=trn200N(),In=trn200In(),to=trn200To(),A=actN141();
  $('xwT').textContent='🦴 Beast Trainer';$('xwS').textContent=In.length+' / '+N+' training slots in use · companions climb to your level (Lv '+to+') in 5 minutes';
  let h=shpNote109('trainer')+trn200Bond()+'<div class="s200-sec">Training slots</div><div class="s200-grid">';
  for(let s=0;s<N;s++){const c=In[s];if(!c){h+='<div class="s200-card empty"><div class="s200-ic">🦴</div><div class="s200-t"><b>Empty slot</b><small>Pick a companion below</small></div></div>';continue}
    const t=c.tr200,p=Math.max(0,Math.min(1,(Date.now()-t.t0)/TRN200.T)),i=party.indexOf(c);
    h+=`<div class="s200-card" style="--rc:#c9a24a"><div class="s200-ic">${st200Pic(c)}</div><div class="s200-t"><b>${st200Esc(c.n)}</b><small>Lv <span data-trn200l="${i}">${c.l}</span> → ${t.b} · <span data-trn200t="${i}">${st200Clock(trn200Left(c))}</span> left</small></div>
      <div class="s200-bar"><i data-trn200b="${i}" style="width:${(p*100).toFixed(1)}%"></i></div><div class="s200-btns"><button data-trn200x="${i}" title="It keeps the levels it has gained">Stop</button></div></div>`}
  h+='</div><div class="s200-sec">Your companions</div>';
  const full=In.length>=N,L=party.map((c,i)=>[c,i]).filter(([c])=>c&&!c.tr200);
  h+=L.length?`<div class="s200-pick">${L.map(([c,i])=>{const ok=!full&&c.l<to,why=c.l>=to?'At your level':full?'All slots are taken':(i<A?'In your team · a reserve takes its place':'Train Lv '+c.l+' → '+to);
      return `<button data-trn200s="${i}" ${ok?'':'disabled'}><span class="s200-ic">${st200Pic(c)}</span><span>${st200Esc(c.n)} <span class="mut">Lv ${c.l}</span><small>${why}</small></span></button>`}).join('')}</div>`
    :'<div class="s200-note">Every companion you have is training.</div>';
  $('xwB').innerHTML=h;$('xwF').innerHTML='<span class="mut dtl">Training is free and keeps going while you are away. A companion in training rests instead of fighting. Each Beast Trainer upgrade at the Steward adds a slot.</span>'}
{const f=XR.visitor;XR.visitor=function(){if(xwArg=='trainer'){try{return trn200Render()}catch(e){console.warn('v200 trainer',e)}}return f.apply(this,arguments)}}
$('xw').addEventListener('click',e=>{if(xwMode!='visitor'||xwArg!='trainer')return;const t=e.target.closest('[data-trn200s],[data-trn200x]');if(!t||t.disabled)return;e.stopPropagation();
  if(t.dataset.trn200s!=null)trn200Set(+t.dataset.trn200s);else trn200Stop(+t.dataset.trn200x)});
setInterval(()=>{try{if(xwMode!='visitor'||xwArg!='trainer'||$('xw').classList.contains('hide'))return;
  trn200In().forEach(c=>{const i=party.indexOf(c),q=s=>document.querySelector('#xw [data-trn200'+s+'="'+i+'"]');const a=q('t'),b=q('b'),l=q('l');
    if(a)a.textContent=st200Clock(trn200Left(c));if(b)b.style.width=(Math.min(1,(Date.now()-c.tr200.t0)/TRN200.T)*100).toFixed(1)+'%';if(l)l.textContent=c.l})}catch(_){}},1000);
// a companion in training never fights or follows: the swap code (0108) can put it back in the team; the tick then ends it.
// after loading: catch up on time spent away
// (the 1-second tick also catches up on time spent away, a few seconds after loading)
