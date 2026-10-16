// ================= v73: title screen, death screen, hit feedback and low-health warning =================
var AWD={dead:0,ready:0,res:null,src:null,srcT:-1e9,life0:performance.now(),kills:0,hp0:null,pOn:0,lowWarn:0,beatT:0,beatAt:-1e9,lowA:0};
{const st=document.createElement('style');st.textContent=`
#awT{position:fixed;inset:0;z-index:90;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;overflow:hidden;
 background:radial-gradient(ellipse 80% 60% at 50% 72%,rgba(110,32,10,.55),rgba(20,8,4,.9) 55%,#040202 100%),#0a0503;transition:opacity .9s ease,filter .9s ease}
#awT.out{opacity:0;filter:blur(6px);pointer-events:none}
#awTc{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#awT .awin{position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;padding:0 16px;animation:awRise 1.6s cubic-bezier(.2,.7,.2,1) both}
#awT .awk{font:600 .72rem/1 Inter,sans-serif;letter-spacing:.42em;text-transform:uppercase;color:#b9825a;opacity:.85}
#awT h1{margin:0;font:800 clamp(2.5rem,9.5vw,6.4rem)/1 Cinzel,Georgia,serif;letter-spacing:.12em;padding-left:.12em;
 background:linear-gradient(180deg,#fff1d6 0%,#f6b26b 45%,#c2410c 80%,#7c1d06 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
 filter:drop-shadow(0 0 18px rgba(234,88,12,.45)) drop-shadow(0 4px 2px rgba(0,0,0,.8));animation:awFlick 5s infinite}
#awT .awr{width:min(420px,70vw);height:1px;background:linear-gradient(90deg,transparent,#c2410c 30%,#fdba74 50%,#c2410c 70%,transparent);position:relative}
#awT .awr::after{content:'◆';position:absolute;left:50%;top:50%;transform:translate(-50%,-52%);font-size:.7rem;color:#fdba74;background:#140804;padding:0 8px}
#awT .aws{margin:2px 0 14px;font:400 .95rem/1.4 Cinzel,Georgia,serif;color:#d6b89a;letter-spacing:.06em;max-width:520px;text-wrap:balance}
#awT .awm{display:flex;flex-direction:column;gap:10px;width:min(320px,82vw)}
#awT .awm button{all:unset;box-sizing:border-box;cursor:pointer;text-align:center;padding:13px 18px;border:1px solid rgba(253,186,116,.28);border-radius:3px;
 background:linear-gradient(180deg,rgba(40,16,8,.75),rgba(16,7,4,.85));color:#f3dcc0;font:700 1rem/1.2 Cinzel,Georgia,serif;letter-spacing:.14em;transition:all .18s}
#awT .awm button small{display:block;margin-top:4px;font:400 .72rem/1.3 Inter,sans-serif;letter-spacing:.02em;color:#b39a84}
#awT .awm button:hover,#awT .awm button:focus-visible{border-color:#fb923c;color:#fff4e6;background:linear-gradient(180deg,rgba(124,45,18,.8),rgba(40,14,6,.9));box-shadow:0 0 22px rgba(234,88,12,.35);outline:none}
#awT .awm button.p{border-color:rgba(251,146,60,.65);box-shadow:0 0 16px rgba(234,88,12,.22) inset}
#awT .awm button.warn{border-color:#ef4444;color:#fecaca}
#awT .awh{position:absolute;bottom:18px;left:0;right:0;font:400 .7rem/1 Inter,sans-serif;color:#8a6f5c;letter-spacing:.2em;text-transform:uppercase;animation:awBlink 2.4s infinite}
@keyframes awRise{from{opacity:0;transform:translateY(18px);filter:blur(4px)}to{opacity:1;transform:none;filter:none}}
@keyframes awFlick{0%,100%{opacity:1}47%{opacity:1}48%{opacity:.86}50%{opacity:1}73%{opacity:.93}74%{opacity:1}}
@keyframes awBlink{0%,100%{opacity:.35}50%{opacity:.9}}
#dth{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;padding:16px;
 background:radial-gradient(ellipse at center,rgba(60,0,0,.25) 0%,rgba(40,0,0,.7) 55%,rgba(6,0,0,.96) 100%);animation:awDIn 1.4s ease both}
#dth.hide{display:none}
#dth h1{margin:0;font:800 clamp(2rem,7.5vw,4.6rem)/1.05 Cinzel,Georgia,serif;color:#dc2626;letter-spacing:.16em;padding-left:.16em;
 text-shadow:0 0 24px rgba(220,38,38,.55),0 3px 2px #000;animation:awDT 2.2s cubic-bezier(.2,.7,.2,1) both}
#dth .dk{font:600 .7rem/1 Inter,sans-serif;letter-spacing:.4em;text-transform:uppercase;color:#a8746a;animation:awFade 1s .5s both}
#dth .dl{width:min(380px,70vw);height:1px;background:linear-gradient(90deg,transparent,#7f1d1d,#ef4444,#7f1d1d,transparent);animation:awFade 1s .7s both}
#dth .dc{font:400 1.05rem/1.4 Cinzel,Georgia,serif;color:#f1d5cf;animation:awFade 1s .9s both}
#dth .dc b{color:#fca5a5}
#dth .ds{display:flex;gap:26px;margin:6px 0 4px;animation:awFade 1s 1.1s both}
#dth .ds div{font:400 .7rem/1.3 Inter,sans-serif;color:#a8908a;text-transform:uppercase;letter-spacing:.14em}
#dth .ds div b{display:block;font:700 1.25rem/1.2 Cinzel,Georgia,serif;color:#f5e6e3;letter-spacing:.02em;text-transform:none}
#dth .dw{font:400 .8rem/1.4 Inter,sans-serif;color:#b8a09a;animation:awFade 1s 1.2s both}
#dth button{all:unset;box-sizing:border-box;cursor:pointer;margin-top:12px;padding:13px 34px;border:1px solid rgba(248,113,113,.5);border-radius:3px;
 background:linear-gradient(180deg,rgba(80,10,10,.8),rgba(30,4,4,.9));color:#fde2e2;font:700 1rem/1 Cinzel,Georgia,serif;letter-spacing:.2em;transition:all .2s;animation:awFade 1s 1.4s both}
#dth button:hover{border-color:#f87171;box-shadow:0 0 22px rgba(239,68,68,.4);color:#fff}
#dth button[disabled]{opacity:.35;cursor:default}
#dth button kbd{float:none;margin-left:10px;opacity:.6;font:400 .7rem Inter,sans-serif;letter-spacing:0}
@keyframes awDIn{from{opacity:0}to{opacity:1}}
@keyframes awDT{from{opacity:0;letter-spacing:.5em;filter:blur(8px)}to{opacity:1;filter:none}}
@keyframes awFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
#stage canvas{transition:filter 1.4s ease}
body.awdead #stage canvas{filter:grayscale(.8) sepia(.35) brightness(.5) contrast(1.15)}
#awHit,#awLow{position:absolute;inset:0;pointer-events:none;z-index:5;opacity:0}
#awHit{background:radial-gradient(ellipse at center,transparent 38%,rgba(200,10,10,.35) 70%,rgba(120,0,0,.85) 100%)}
#awHit.on{animation:awHitA .65s ease-out}
@keyframes awHitA{0%{opacity:var(--ak,.6)}100%{opacity:0}}
#awLow{background:radial-gradient(ellipse at center,transparent 32%,rgba(170,0,0,.32) 60%,rgba(130,0,0,.75) 86%,rgba(60,0,0,.95) 100%)}
#awDir{position:absolute;inset:0;pointer-events:none;z-index:6;overflow:hidden}
#awDir i{position:absolute;left:50%;top:50%;width:0;height:0;animation:awDirA 1.1s ease-out forwards}
#awDir i::before{content:'';position:absolute;left:-17vmin;top:-41vmin;width:34vmin;height:10vmin;border-radius:50% 50% 0 0/100% 100% 0 0;
 border-top:1.1vmin solid rgba(255,45,30,.95);filter:drop-shadow(0 0 6px rgba(255,30,20,.9))}
@keyframes awDirA{0%{opacity:1}60%{opacity:.85}100%{opacity:0}}
.orb.hp.awhit{animation:awOrbH .35s ease-out}
@keyframes awOrbH{0%{filter:brightness(2.2) saturate(1.5);transform:scale(1.08)}100%{filter:none;transform:none}}
.orb.hp.awlow{animation:awOrbL 1s ease-in-out infinite}
@keyframes awOrbL{0%,100%{box-shadow:0 0 0 rgba(239,68,68,0)}50%{box-shadow:0 0 22px 4px rgba(239,68,68,.75)}}
`;document.head.appendChild(st)}
{const s=$('stage');['awLow','awHit','awDir'].forEach(id=>{if(!$(id)){const d=document.createElement('div');d.id=id;s.appendChild(d)}})}

// ---------- small sounds (share the game's audio context) ----------
function awSnd(k,vol){
  if(SET.sfx===false)return;const a=AUD;if(!a||a.state!='running')return;const t=a.currentTime;vol=vol||1;
  const tone=(type,f0,f1,at,dur,v)=>{const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f0,t+at);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+at+dur);
    g.gain.setValueAtTime(0,t+at);g.gain.linearRampToValueAtTime(v*vol,t+at+.008);g.gain.exponentialRampToValueAtTime(.001,t+at+dur);o.connect(g);g.connect(a.out);o.start(t+at);o.stop(t+at+dur+.05)};
  const nz=(f0,f1,at,dur,v)=>{if(!NOISE)return;const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NOISE;f.type='lowpass';f.frequency.setValueAtTime(f0,t+at);f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+at+dur);
    g.gain.setValueAtTime(0,t+at);g.gain.linearRampToValueAtTime(v*vol,t+at+.005);g.gain.exponentialRampToValueAtTime(.001,t+at+dur);s.connect(f);f.connect(g);g.connect(a.out);s.start(t+at,Math.random()*.5);s.stop(t+at+dur+.05)};
  if(k=='thud'){tone('sine',140,42,0,.24,.7);nz(700,120,0,.14,.35)}
  else if(k=='beat'){tone('sine',62,38,0,.14,.55);tone('sine',55,34,.19,.12,.38)}
  else if(k=='toll'){[[98,.5],[196,.22],[247,.14],[294,.12],[392,.06]].forEach(([f,v])=>tone('sine',f,f*.985,0,3.2,v));nz(260,60,0,2.2,.3)}
  else if(k=='rise'){tone('sine',220,660,0,.9,.22);tone('triangle',330,990,.05,.9,.1)}
  else if(k=='open'){[[73,.45],[110,.25],[146,.12]].forEach(([f,v])=>tone('sine',f,f*.99,0,2.6,v));nz(500,80,0,1.6,.25)}
}

// ---------- title screen ----------
function awFmtSave(s){const C=CLS[s.hero.cls]||{i:'',n:''};return `${C.i} ${s.hero.name} · Lv ${s.hero.lvl} ${C.n} · ${s.wv===3?(s.bossDone||[]).length:0} of 6 realms`}
function awTitle(){
  if(window.AW_NOTITLE||$('awT'))return;
  const T=document.createElement('div');T.id='awT';const s=saveInfo();
  T.innerHTML=`<canvas id="awTc"></canvas><div class="awin"><div class="awk">A tale of embers and ruin</div><h1>Kill Quest</h1><div class="awr"></div>
   <div class="aws">The sky-fortress Duskhold stands alone. Beyond its portals, six realms burn.</div>
   <div class="awm">${s?`<button class="p" data-aw="cont">Continue<small>${awFmtSave(s)}</small></button><button data-aw="new">New Game</button>`:`<button class="p" data-aw="new">Begin</button>`}</div></div>
   <div class="awh">${matchMedia('(pointer:coarse)').matches?'Tap to choose':'Press Enter'}</div>`;
  document.body.appendChild(T);
  T.addEventListener('click',e=>{const b=e.target.closest('[data-aw]');if(b)awTitleGo(b.dataset.aw,b)});
  // drifting embers and ash
  const cv=$('awTc'),cx=cv.getContext('2d'),P=[];let W_=0,H_=0;
  const rs_=()=>{const r=devicePixelRatio||1;W_=cv.clientWidth;H_=cv.clientHeight;cv.width=W_*r;cv.height=H_*r;cx.setTransform(r,0,0,r,0,0)};rs_();addEventListener('resize',rs_);
  const mk=(y)=>({x:Math.random()*W_,y:y==null?H_+10:y,vy:-(14+Math.random()*40),vx:(Math.random()-.5)*10,r:Math.random()<.2?1.6+Math.random()*1.8:.6+Math.random()*1.2,ph:Math.random()*6.3,ash:Math.random()<.3,l:1});
  for(let i=0;i<90;i++)P.push(mk(Math.random()*H_));
  let last=performance.now();
  (function fr(now){if(!$('awT'))return;requestAnimationFrame(fr);const dt=Math.min(.05,(now-last)/1000);last=now;cx.clearRect(0,0,W_,H_);
    for(const p of P){p.ph+=dt*1.6;p.x+=(p.vx+Math.sin(p.ph)*12)*dt;p.y+=p.vy*dt*(p.ash?.5:1);if(p.y<-10)Object.assign(p,mk());
      const k=Math.max(0,Math.min(1,p.y/H_));
      if(p.ash){cx.fillStyle=`rgba(160,150,140,${.25*k})`;cx.fillRect(p.x,p.y,p.r*1.4,p.r*1.4)}
      else{const fl=.55+.45*Math.sin(p.ph*3.1);cx.fillStyle=`rgba(255,${120+Math.round(80*fl)},40,${(.25+.6*k)*fl})`;cx.shadowColor='rgba(255,110,30,.9)';cx.shadowBlur=8;cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.283);cx.fill();cx.shadowBlur=0}}
  })(last);
  setTimeout(()=>{const b=T.querySelector('[data-aw]');if(b&&!matchMedia('(pointer:coarse)').matches)b.focus()},50);
}
function awTitleGo(mode,btn){
  const T=$('awT');if(!T||T.classList.contains('out'))return;
  try{audio()}catch(_){}
  const s=saveInfo();
  if(mode=='new'&&s){if(!btn.dataset.sure){btn.dataset.sure=1;btn.classList.add('warn');btn.innerHTML='Start over?<small>Tap again — this replaces your saved hero</small>';return}deleteSave()}
  awSnd('open');T.classList.add('out');setTimeout(()=>T.remove(),950);
  if(SET.dev){applyDev(SET.dev);$('devp').classList.add('hide');
    if(SET.dev=='mobile'){try{const st=$('stage');if(st.requestFullscreen&&!document.fullscreenElement){const p=st.requestFullscreen();if(p&&p.catch)p.catch(()=>{})}}catch(_){}}
    if(mode=='cont'&&s){$('svp').classList.add('hide');if(!loadGame())say('That save could not be loaded.')}}
  // without a saved layout the "How are you playing?" picker shows next, then Continue / New game as before
}
addEventListener('keydown',e=>{
  const T=$('awT');if(T&&!T.classList.contains('out')){e.stopImmediatePropagation();
    if(e.key=='Enter'||e.key==' '){e.preventDefault();const b=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('[data-aw]')||T.querySelector('[data-aw]');if(b)awTitleGo(b.dataset.aw,b)}
    else if(e.key=='ArrowDown'||e.key=='ArrowUp'||e.key=='Tab'){e.preventDefault();const bs=[...T.querySelectorAll('[data-aw]')],i=bs.indexOf(document.activeElement);bs[(i+(e.key=='ArrowUp'?-1:1)+bs.length)%bs.length].focus()}
    return}
  if(AWD.dead){e.stopImmediatePropagation();if((e.key=='Enter'||e.key==' '||e.key.toLowerCase()=='f')&&AWD.ready){e.preventDefault();awRise()}}
},true);
awTitle();

// ---------- death screen ----------
function awKiller(){
  const e=AWD.src;if(!e||!e.c||performance.now()-AWD.srcT>5000)return null;
  return {n:(e.boss?'☠ ':e.c.al?'Elite ':'')+(e.c.n||e.c.g[0]),l:e.c.l}}
function awPlace(){
  if(typeof inDun!='undefined'&&inDun)return 'a dungeon';
  try{const g=regionAt(Math.round(pl.position.x),Math.round(pl.position.z));if(g>=0&&PMAP[g])return PMAP[g].n}catch(_){}
  return 'the wilds'}
function awDie(res){
  AWD.dead=1;AWD.ready=0;AWD.res=res;hero.hp=0;
  const k=awKiller(),sec=Math.round((performance.now()-AWD.life0)/1000),tm=sec>=3600?Math.floor(sec/3600)+'h '+Math.floor(sec%3600/60)+'m':sec>=60?Math.floor(sec/60)+'m '+(sec%60)+'s':sec+'s';
  const D=$('dth');D.innerHTML=`<div class="dk">${typeof WV!='undefined'&&WV?'The trial is lost':'Your light fades'}</div><h1>You Have Fallen</h1><div class="dl"></div>
    <div class="dc">${k?`Slain by <b>${k.n}</b> · Lv ${k.l}<br>`:''}<span style="font-size:.85rem;opacity:.8">in ${awPlace()}</span></div>
    <div class="ds"><div><b>${tm}</b>survived</div><div><b>${AWD.kills}</b>foes slain</div><div><b>Lv ${hero.lvl}</b>${(CLS[hero.cls]||{n:''}).n}</div></div>
    <div class="dw">You will wake at ${home&&home.n||'Duskhold'}, fully healed. Your gear and companions are safe.</div>
    <button id="dthB" disabled>Rise Again<kbd>Enter</kbd></button>`;
  D.classList.remove('hide');document.body.classList.add('awdead');$('awLow').style.opacity=0;$('awDir').innerHTML='';
  $('dthB').onclick=awRise;awSnd('toll');
  setTimeout(()=>{if(!AWD.dead)return;AWD.ready=1;const b=$('dthB');if(b){b.disabled=false;if(!matchMedia('(pointer:coarse)').matches)b.focus()}},1800);
}
function awRise(){
  if(!AWD.dead||!AWD.ready)return;AWD.ready=0;awSnd('rise');
  fadeTo(()=>{try{AWD.res&&AWD.res()}finally{AWD.res=null;AWD.dead=0;$('dth').classList.add('hide');document.body.classList.remove('awdead');
    AWD.life0=performance.now();AWD.kills=0;AWD.lowWarn=0;AWD.hp0=hero.hp;hero.iv=Math.max(hero.iv||0,2)}});
}
// the actual respawn waits for "Rise Again"; everything before it (leaving dungeons, failing trials) still runs at once
{const f=down_base;down_base=function(){if(AWD.dead)return;const a=arguments,me=this;awDie(()=>f.apply(me,a))}}
{const f=down;down=function(){if(AWD.dead)return;return f.apply(this,arguments)}}
// no more damage while lying dead (matters in co-op, where the world keeps running)
{const f=hitHero;hitHero=function(e){if(AWD.dead)return;if(e){AWD.src=e;AWD.srcT=performance.now()}return f.apply(this,arguments)}}
{const f=hitTarget;hitTarget=function(e,tg){if(tg===pl){if(AWD.dead)return;if(e){AWD.src=e;AWD.srcT=performance.now()}}return f.apply(this,arguments)}}
{const f=bossHit;bossHit=function(e){if(AWD.dead)return;if(e){AWD.src=e;AWD.srcT=performance.now()}return f.apply(this,arguments)}}
{const f=kill;kill=function(e){if(e&&!e.dead_aw){e.dead_aw=1;AWD.kills++}return f.apply(this,arguments)}}
{const f=saveGame;saveGame=function(){if(AWD.dead)return false;return f.apply(this,arguments)}}

// ---------- getting hit ----------
function awHurt(frac,src){
  const k=Math.max(.35,Math.min(1,.3+frac*3.2)),h=$('awHit');h.style.setProperty('--ak',k);h.classList.remove('on');void h.offsetWidth;h.classList.add('on');
  const o=document.querySelector('.orb.hp');if(o){o.classList.remove('awhit');void o.offsetWidth;o.classList.add('awhit')}
  awSnd('thud',Math.min(1,.35+frac*3));
  if(frac>=.18&&typeof shake=='function')shake(.12+frac*.3);
  if(src&&src.m&&!src.dead){const dx=src.m.position.x-pl.position.x,dz=src.m.position.z-pl.position.z;
    if(dx*dx+dz*dz>.15){const rx=Math.cos(camYaw),rz=-Math.sin(camYaw),fx=-Math.sin(camYaw),fz=-Math.cos(camYaw);
      const ang=Math.atan2(dx*rx+dz*rz,dx*fx+dz*fz)*180/Math.PI,D=$('awDir');
      while(D.children.length>3)D.firstChild.remove();
      const i=document.createElement('i');i.style.transform=`rotate(${ang.toFixed(1)}deg)`;i.style.opacity=Math.min(1,.55+frac*3);D.appendChild(i);setTimeout(()=>i.remove(),1150)}}
}
// ---------- watcher: hits, low health, heartbeat ----------
(function awTick(){requestAnimationFrame(awTick);
  const now=performance.now(),L=$('awLow'),O=document.querySelector('.orb.hp');
  if(!party.length||AWD.dead){AWD.hp0=null;AWD.pOn=0;if(L)L.style.opacity=0;if(O)O.classList.remove('awlow');return}
  if(!AWD.pOn)AWD.pOn=now;
  const mx=heroMax(),hp=Math.max(0,hero.hp),paused=uiOpen()&&!mpLive();
  if(AWD.hp0!=null&&hp<AWD.hp0-.5&&now-AWD.pOn>1500&&!paused){
    const fr=(AWD.hp0-hp)/mx,recent=now-AWD.srcT<400||now-(hero.lastHit||-1e9)<400;
    if(recent||fr>=.03)awHurt(fr,recent&&now-AWD.srcT<400?AWD.src:null)}
  AWD.hp0=hp;
  const r=hp/mx,lv=r<.35?Math.min(1,(.35-r)/.3):0;
  if(lv>0&&!paused){
    const per=1150-450*lv;if(now>=AWD.beatT){AWD.beatT=now+per;AWD.beatAt=now;awSnd('beat',.45+.55*lv)}
  }else AWD.beatT=0;
  const since=(now-AWD.beatAt)/1000,pulse=lv>0?Math.max(0,1-since*3.2)*.35:0;
  AWD.lowA+=((lv>0?.3+.45*lv:0)-AWD.lowA)*.08;
  if(L)L.style.opacity=Math.min(1,AWD.lowA+pulse*lv).toFixed(3);
  if(O)O.classList.toggle('awlow',lv>0);
  if(r<.25&&!AWD.lowWarn&&!paused){AWD.lowWarn=1;popT(pl.position,'⚠ LOW HEALTH','#f87171',true);if(pots>0)say('⚠ Low health! Press Q to drink a potion ('+pots+' left), or fall back.');else say('⚠ Low health and no potions — fall back or recall (T).')}
  if(r>.5)AWD.lowWarn=0;
})();
