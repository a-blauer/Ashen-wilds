// ================= v200: the Training Grounds train your hero while you are away =================
// Owner (Nov 5 2026): "make the training ground a place you can interact with where your character will train offline. Tier 1
// will get you 1 level in 8 hours up to level 15 … Tier 2 is 1 level in 8 hours up to level 30 … Tier 3 is 1 level in 8 hours up to
// level 40, and then 1 level every 16 hours after 40", at most one level per time away, at every tier (owner's choice).
//  * At the Training Grounds you start (or stop) training. While it is on, every absence of TG200.need() or longer gives one level
//    (heroLevelUp, your XP bar is kept) as long as you are below the level the Grounds can teach (ST200_TG in 3700: 15 / 30 / 40;
//    level 3 goes on past 40 at 16 hours a level).
//  * An absence = the game closed (time from the last save to the next load) or its tab hidden (time hidden). The last time
//    the game was seen running is saved (x2.tg200.beat).
// Co-op: your own hero; the Grounds' level is that of the kingdom you see.
var TG200={on:0,beat:0,hid:0,last:null,H:3600000};
function tg200Cap(){const l=kdLv('train');return l>=3?MAXLV:ST200_TG[l]||0}
function tg200Need(){return kdLv('train')>=3&&hero.lvl>=40?16*TG200.H:8*TG200.H}
function tg200Can(){return kdLv('train')>0&&hero.lvl<tg200Cap()&&hero.lvl<MAXLV}
// an absence of ms milliseconds just ended
function tg200Away(ms){if(!TG200.on||!(ms>0))return;const need=tg200Need();TG200.last={ms,t:Date.now(),ok:false};
  if(!tg200Can()||ms<need)return;const from=hero.lvl;try{heroLevelUp()}catch(e){console.warn('v200 training',e);return}TG200.last.ok=true;TG200.last.from=from;
  setTimeout(()=>{try{say('⚔️ You trained at the Training Grounds while you were away ('+st200Clock(ms)+'): Lv '+from+' → Lv '+hero.lvl+'.')}catch(_){}},800);try{hud();ui();saveGame(true)}catch(_){}}
document.addEventListener('visibilitychange',()=>{try{if(document.hidden){TG200.hid=Date.now()}else if(TG200.hid){const ms=Date.now()-TG200.hid;TG200.hid=0;if(typeof hero!='undefined'&&hero&&party.length)tg200Away(ms)}}catch(e){console.warn('v200 away',e)}});
setInterval(()=>{if(!document.hidden)TG200.beat=Date.now()},15000);
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.tg200={on:TG200.on?1:0,beat:document.hidden&&TG200.hid?TG200.hid:Date.now()};return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.tg200;TG200.on=q&&q.on?1:0;const b=q&&+q.beat||0;TG200.beat=Date.now();
    if(TG200.on&&b>0){const ms=Date.now()-b;setTimeout(()=>{try{tg200Away(ms)}catch(e){console.warn('v200 training load',e)}},4000)}}catch(e){console.warn('v200 training',e)}return r}}
function tg200Toggle(){if(!TG200.on&&!(kdLv('train')>0))return;TG200.on=TG200.on?0:1;
  say(TG200.on?'⚔️ Training is on: every time you are away for '+Math.round(tg200Need()/TG200.H)+' hours or more, you come back one level stronger.':'⚔️ Training stopped.');try{sfx('chime');saveGame(true)}catch(_){}rX()}
XR.train200=function(){const l=kdLv('train'),cap=tg200Cap(),need=tg200Need(),can=tg200Can();
  $('xwT').textContent='⚔️ Training Grounds';$('xwS').textContent='Lv '+hero.lvl+' · the Grounds teach up to Lv '+(l>=3?MAXLV:cap)+' · '+Math.round(need/TG200.H)+' hours away = 1 level';
  const rows=[[1,'Up to Lv 15','8 hours away = 1 level'],[2,'Up to Lv 30','8 hours away = 1 level'],[3,'Up to Lv 40, then on to Lv '+MAXLV,'8 hours away = 1 level · 16 hours past Lv 40']];
  let h=st200Head('train');
  h+=`<div class="tg200-st ${TG200.on?'on':''}"><div class="tg200-ic">${TG200.on?'🏋️':'🪵'}</div><div><b>${TG200.on?'Training while you are away':'Not training'}</b>
    <small>${!can?(hero.lvl>=MAXLV?'You have reached the highest level.':'You have learned all the Grounds can teach (Lv '+cap+'). Upgrade them at the Stronghold Steward.'):TG200.on?'Close the game or leave it in the background for '+Math.round(need/TG200.H)+' hours or more and you come back one level stronger. One level per time away.':'Start training, then leave for '+Math.round(need/TG200.H)+' hours or more to gain a level.'}</small></div>
    <button class="${TG200.on?'':'pri'}" data-tg200="1">${TG200.on?'Stop training':'⚔️ Start training'}</button></div>`;
  if(TG200.last)h+=`<div class="s200-note">Last time away: ${st200Clock(TG200.last.ms)}${TG200.last.ok?' — trained Lv '+TG200.last.from+' → '+(TG200.last.from+1)+'.':' — '+(TG200.last.ms<need?'not long enough for a level.':'nothing more to learn here.')}</div>`;
  h+='<div class="s200-sec">What each level teaches</div><div class="tg200-t">'+rows.map(([L,a,b])=>`<div class="${l>=L?'on':''}${l===L?' cur':''}"><b>Level ${L}</b><span>${a}</span><small>${b}</small></div>`).join('')+'</div>';
  $('xwB').innerHTML=h;$('xwF').innerHTML='<span class="mut dtl">At most one level each time you are away, however long. Your XP bar is kept. Time away counts from when the game was closed or its tab hidden.</span>'};
$('xw').addEventListener('click',e=>{if(xwMode!='train200')return;const t=e.target.closest('[data-tg200]');if(t&&!t.disabled)tg200Toggle()});
ST200.open.train=()=>openX('train200');
document.head.insertAdjacentHTML('beforeend',`<style id="tg200css">
#xw .tg200-st{display:flex;gap:12px;align-items:center;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:rgba(0,0,0,.25)}
#xw .tg200-st.on{border-color:rgba(110,231,183,.55);background:linear-gradient(135deg,rgba(110,231,183,.12),rgba(0,0,0,.3))}
#xw .tg200-st>div:nth-child(2){flex:1}#xw .tg200-st small{display:block;color:var(--mut);font-size:.74rem}#xw .tg200-ic{font-size:2rem}
#xw .tg200-t{display:grid;gap:6px;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
#xw .tg200-t>div{padding:8px 10px;border-radius:8px;border:1px dashed var(--line);opacity:.6;display:flex;flex-direction:column;gap:2px;font-size:.78rem}
#xw .tg200-t>div.on{opacity:1;border-style:solid;border-color:rgba(201,162,74,.5)}#xw .tg200-t>div.cur{background:rgba(201,162,74,.12)}
#xw .tg200-t small{color:var(--mut);font-size:.68rem}
</style>`);
