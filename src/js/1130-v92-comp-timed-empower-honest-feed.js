// ================= v92: comp — timed empower, honest feed tooltip, egg drop rate =================
// (the companion-menu layout fixes live in zzN_comp_menus.js)
//
// 1) EMPOWER IS TEMPORARY
//    Before: E / R / the ⚡ button toggled c.emp on and off forever.
//    Now each companion empowers you for EMP92.dur (15 s) and then goes back to fighting on its own,
//    followed by a rest (cooldown) of EMP92.cd (60 s) before THAT companion can empower again
//    (each companion has its own timer, so the lead and the 2nd can be used one after the other).
//    Ending it early (press E/R/⚡ again) gives a shorter rest: 4 s of rest per second used (max 60 s).
//    Per companion, saved with it:  c.empL = seconds of empower left,  c.empCd = seconds of rest left.
//    The timers run on game time (they stop while the game is paused), ticked from compRegen.
//    Old saves: p_save already loads every companion with c.emp=false; a leftover c.empL just turns into a rest.
//    Co-op: partners never see your companions (only heroes are synced), so nothing to relay.
//
// 2) FEED BUTTON TOOLTIP
//    Hovering showed "Feed the best food you have", and clicking/tapping it popped up the v84 material hint
//    for "Stone" (msrcFind read the companion names next to it — "Stoneshell" contains "stone").
//    The HUD companion bars no longer give material hints, and the 🍖 title says what it really does
//    (see feed92Tip): the food it will use, the % / amount it heals, over 8 s, nothing else.
//
// 3) EGG DROP RATE ×0.65 (EGG92.rate)
//    Every egg that drops by chance passes through the drop() wrapper below and is kept 65% of the time:
//    monster/elite kills (also wave-trial mobs), camp chests, crates & barrels, hidden caches, buried treasure,
//    world-event chests, dungeon chests, the wave-trial reward chest, fishing; bounty eggs (eggs.push, no drop())
//    are scaled in build/pN_comp.py. Guaranteed eggs are left alone: the Sovereign (boss) kill egg
//    (flag EGG92.g while lootE_base runs for a boss), Bestiary milestone eggs, and eggs you buy in shops.

// ---------------- 1) timed empower ----------------
var EMP92={dur:15,cd:60,early:4};
function emp92Stop(c,quiet){
  if(!c)return;const used=Math.max(0,EMP92.dur-(c.empL>0?c.empL:0));
  const was=!!c.emp;c.empL=0;c.empCd=Math.min(EMP92.cd,Math.max(5,Math.round(used*EMP92.early)));
  if(was){c.emp=false;hsDirty();hero.hp=Math.min(hero.hp,heroMax())}
  if(!quiet)say('⚡ '+nm(c)+' stops empowering you and goes back to fighting. It can empower again in '+Math.ceil(c.empCd)+'s.');
  try{cbarSig='';hud()}catch(_){}
}
{const f=toggleEmp;toggleEmp=function(i){
  const c=party[i];if(!c||c.h<=0)return f.apply(this,arguments);
  if(c.emp)return emp92Stop(c,false);
  if(c.empCd>0)return say('⚡ '+nm(c)+' is resting after empowering you. Ready again in '+Math.ceil(c.empCd)+'s.');
  f.apply(this,arguments);
  if(c.emp){c.empL=EMP92.dur;c.empCd=0;const sp=CSP[c.sp&&c.sp[0]];say('⚡ '+nm(c)+' empowers you for '+EMP92.dur+'s'+(sp&&sp.emp?': '+sp.emp.d:'.'));try{cbarSig='';hud()}catch(_){}}
}}
function emp92Tick(dt){
  if(!(dt>0)||!party)return;
  party.forEach((c,i)=>{if(!c)return;
    if(c.emp){
      if(!(c.empL>0))c.empL=EMP92.dur;                 // turned on some other way: start the timer
      if(i>1||c.h<=0){emp92Stop(c,c.h<=0);return}     // sent to the reserve, or fainted
      c.empL-=dt;if(c.empL<=0){c.empL=0;emp92Stop(c,true);c.empCd=EMP92.cd;
        say('⚡ '+nm(c)+'\'s empower fades. It can empower you again in '+EMP92.cd+'s.');try{mSfx('tick',.6)}catch(_){}}
    }else{
      if(c.empL>0)emp92Stop(c,true);                   // ended elsewhere (fainted, fused, loaded from a save)
      if(c.empCd>0){c.empCd=Math.max(0,c.empCd-dt);if(c.empCd<=0&&i<2){c.empCd=0;try{cbarSig=''}catch(_){}}}
    }})}
{const f=compRegen;compRegen=function(dt,now){f.apply(this,arguments);try{emp92Tick(dt)}catch(e){}}}

document.head.insertAdjacentHTML('beforeend',`<style>
.cbar button[data-e]{position:relative;overflow:hidden}
.cbar button[data-e]::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:conic-gradient(var(--e92c,rgba(0,0,0,.66)) calc(var(--e92p,0)*1turn),transparent 0)}
.cbar button[data-e].e92on::after{--e92c:rgba(255,236,150,.0)}
.cbar button[data-e].e92on{animation:e92pulse 1.2s ease-in-out infinite}
.cbar button[data-e].e92cd{filter:saturate(.35) brightness(.85)}
.cbar button[data-e][data-t]::before{content:attr(data-t);position:absolute;z-index:2;left:0;right:0;bottom:-1px;text-align:center;
  font:800 10px/12px system-ui,sans-serif;color:#fff;text-shadow:0 0 2px #000,0 1px 1px #000,0 0 4px #000;pointer-events:none}
.cbar button[data-e].e92on[data-t]::before{color:#fff3b0}
.cbar .e92bar{height:3px;margin-top:1px;border-radius:2px;background:rgba(0,0,0,.45);overflow:hidden;display:none}
.cbar .e92bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#fbbf24,#fde68a)}
.cbar .e92bar.cd i{background:linear-gradient(90deg,#6b7280,#9ca3af)}
@keyframes e92pulse{0%,100%{box-shadow:0 0 0 1px #000,0 0 6px rgba(251,191,36,.5)}50%{box-shadow:0 0 0 1px #000,0 0 14px rgba(251,191,36,.95)}}
</style>`);

// per tick: sweep + seconds on the ⚡ button, a thin timer strip under the health bar, and live tooltips
function emp92Hud(){
  const cb=$('cbars');if(!cb)return;
  party.slice(0,2).forEach((c,i)=>{const el=cb.children[i];if(!el||!c)return;
    const b=el.querySelector('button[data-e]'),k=i?'R':'E';
    let bar=el.querySelector('.e92bar');if(!bar){const inf=el.querySelector('.cinf');if(inf){inf.insertAdjacentHTML('beforeend','<div class="e92bar"><i></i></div>');bar=inf.querySelector('.e92bar')}}
    let p=0,t='',cls='',tip,bw=0;
    if(c.emp){const L=Math.max(0,c.empL>0?c.empL:EMP92.dur);p=1-L/EMP92.dur;t=Math.ceil(L)+'';cls='on';bw=L/EMP92.dur;
      tip='Empowering you: '+Math.ceil(L)+'s left ('+k+' or click to end early; a shorter rest follows). Then it rests for '+EMP92.cd+'s.'}
    else if(c.empCd>0){p=c.empCd/EMP92.cd;t=Math.ceil(c.empCd)+'';cls='cd';bw=1-c.empCd/EMP92.cd;
      tip='Resting after empowering you: ready again in '+Math.ceil(c.empCd)+'s.'}
    else tip='Empower ('+k+'): '+c.n+' joins with you for '+EMP92.dur+'s, giving you 40% of its strength and its empower passive. Then it rests for '+EMP92.cd+'s.';
    if(b){b.style.setProperty('--e92p',p.toFixed(3));if(t)b.dataset.t=t;else delete b.dataset.t;
      b.classList.toggle('e92on',cls=='on');b.classList.toggle('e92cd',cls=='cd');if(b.title!==tip)b.title=tip}
    if(bar){bar.style.display=cls?'block':'none';bar.classList.toggle('cd',cls=='cd');bar.firstChild.style.width=(100*bw).toFixed(1)+'%'}
    const fb=el.querySelector('button[data-fd]');if(fb){const ft=feed92Tip(c);if(fb.title!==ft)fb.title=ft}
  })}
{const f=cbarsRender;cbarsRender=function(){f.apply(this,arguments);try{emp92Hud()}catch(e){}}}

// ---------------- 2) feed tooltip (from the v84 feedBest/feedComp code: best food first, heal over FEED_T s) ----------------
function feed92Tip(c){
  if(!c)return '';if(c.h<=0)return 'Feed: '+c.n+' has fainted and cannot eat. Revive it first.';
  const L=feedList();if(!L.length)return 'Feed: you have no food. Cook meals at the Cooking Hearth in Duskhold, or carry raw meat, fish, berries or vegetables.';
  const k=L[0],v=feedVal(k),mx=M(c),amt=Math.max(1,Math.round(mx*v)),T=typeof FEED_T!='undefined'?FEED_T:8;
  const pend=c.fhot&&c.fhot.left>0?c.fhot.left:0,full=c.h+pend>=mx;
  return 'Feed: eats 1 '+supNm(k)+' (your best food, you have '+cnt(k)+') and heals '+c.n+' for '+Math.round(v*100)+'% of its max health (+'+amt+') over '+T+'s. '+
    'Feeding only restores health. '+(full?'It is full right now.':'Pick a different food in the Care tab (P).')}
// HUD bars are not material labels: no "where to get it" hints for them (that showed "Stone" for a Stoneshell)
{const f=msrcFind;msrcFind=function(el){try{if(el&&el.closest&&el.closest('#cbars,#chInfo,#locBox,#hotbar,#mbtn'))return null}catch(_){}return f.apply(this,arguments)}}

// ---------------- 3) egg drop rate ----------------
var EGG92={rate:.65,g:0,f:null,n:0,cut:0};
{const f=lootE_base;lootE_base=function(e){const b=EGG92.g;EGG92.g=e&&e.c&&e.c.boss?1:0;try{return f.apply(this,arguments)}finally{EGG92.g=b}}}
EGG92.f=drop;
drop=function(kind){if(kind=='egg'&&!EGG92.g){EGG92.n++;if(Math.random()>=EGG92.rate){EGG92.cut++;return}}return EGG92.f.apply(this,arguments)};

