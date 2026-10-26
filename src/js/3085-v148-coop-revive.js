// ================= v148.2: co-op revive =================
// In co-op, a hero who drops to 0 HP while a partner is still standing in the same map is DOWNED instead of dying:
//  * they lie on the ground for RV148.T seconds (bleeding out), cannot move, attack or cast, and nothing can hit them;
//    monsters turn to the partners instead; a Sovereign is driven by a partner who is still standing.
//  * a partner standing beside them presses F ("F · Revive …") and stays close for RV148.need seconds: the downed hero
//    gets up with RV148.hp of their health and a moment of invulnerability.
//  * bleeding out, pressing "Give up", or nobody left standing in the map = the normal death (death screen, wake in Duskhold).
//    In a Sovereign's arena the fight is only lost when everyone in it is down.
// Phoenix Heart, Unbreakable and the god cheat still save the hero first. Playing solo nothing changes.
// Net: presence carries dn (1 = downed) and bt (seconds left); the revive itself is an 'ev' entry ['rv', target peer].
var RV148={T:30,need:3,hp:.4,iv:2.5,reach:2.4,down:0,t:0,since:0,ch:null,lastDn:-1,lastBt:-1};
function rv148Down(){return !!RV148.down}
// partners standing (not downed, not dead) in my map
function rv148Standing(){if(typeof MP=='undefined'||!MP.on)return [];const out=[];
  for(const k in MP.rh){const r=MP.rh[k],p=r.pr;if(p&&p.rg===MP.rg&&MP.rg>-2&&p.hp>0&&!p.dn)out.push(r)}return out}
function rv148CanDown(){
  if(typeof MP=='undefined'||!MP.on||!MPX.be)return false;
  if(typeof WV!='undefined'&&WV)return false;
  try{if(typeof phxReady=='function'&&phxReady())return false}catch(_){}
  try{if(typeof CHEAT!='undefined'&&CHEAT.god)return false}catch(_){}
  try{if(typeof KQS!='undefined'&&KQS.unbrk>performance.now())return false}catch(_){}
  return rv148Standing().length>0}
// ---- going down ----
{const f=down;down=function(){
  if(RV148.down)return;                       // already lying there: nothing more happens until revive or bleed-out
  if(typeof AWD!='undefined'&&AWD.dead)return f.apply(this,arguments);
  if(!rv148CanDown())return f.apply(this,arguments);
  rv148Fall();}}
function rv148Fall(){
  RV148.down=1;RV148.t=RV148.T;RV148.since=performance.now();RV148.ch=null;hero.hp=0;
  try{if(riding)dismount()}catch(_){}hero.chan=null;hero.dash=null;pl.step=null;atkHeld=false;for(const k in K)K[k]=false;dp[0]=dp[1]=0;
  try{if(typeof gat!='undefined')gat=null}catch(_){}
  document.body.classList.add('rv148dn');rv148Box();MP.lastPres='';
  try{awSnd&&awSnd('toll')}catch(_){}
  say('💀 You are down! A partner can revive you — they press F beside you.');
  try{popT(pl.position,'💀 DOWN','#ff8a6a',true)}catch(_){}}
// bleeding out / giving up: the normal death from here (the death screen, Duskhold)
function rv148Die(why){if(!RV148.down)return;RV148.down=0;RV148.ch=null;pl.rotation.z=0;document.body.classList.remove('rv148dn');rv148Box();MP.lastPres='';
  if(why)say(why);hero.hp=0;
  // straight to the end of down(): the Phoenix / cheat checks already had their chance when the hero fell
  try{arenaFail()}catch(err){console.warn('v148 revive',err)}
  try{down_base()}catch(err){console.warn('v148 revive',err)}}
function rv148Up(by){if(!RV148.down)return;RV148.down=0;RV148.ch=null;pl.rotation.z=0;document.body.classList.remove('rv148dn');rv148Box();
  hero.hp=Math.max(1,Math.round(heroMax()*RV148.hp));hero.iv=Math.max(hero.iv||0,RV148.iv);MP.lastPres='';
  try{if(typeof AWD!='undefined'){AWD.hp0=hero.hp}}catch(_){}
  try{burst(gY(pl.position,1),0xffe08a,40,2.5,3,.8);ring(pl.position,0xffe08a,3,500)}catch(_){}
  try{popT(pl.position,'✨ REVIVED','#ffe08a',true)}catch(_){}
  say('✨ '+mpEsc(by||'A partner')+' revived you!');try{hud();ui()}catch(_){}}
// ---- while down: no damage, no moving, no acting ----
{const f=hitHero;hitHero=function(){if(RV148.down)return;return f.apply(this,arguments)}}
{const f=bossHit;bossHit=function(){if(RV148.down)return;return f.apply(this,arguments)}}
{const f=hitTarget;hitTarget=function(e,tg){if(tg===pl&&RV148.down)return;return f.apply(this,arguments)}}
{const f=walk;walk=function(o){if(o===pl&&RV148.down)return;return f.apply(this,arguments)}}
{const f=swing;swing=function(){if(RV148.down)return;return f.apply(this,arguments)}}
{const f=cast;cast=function(){if(RV148.down)return;return f.apply(this,arguments)}}
{const f=saveGame;saveGame=function(){if(RV148.down)return false;return f.apply(this,arguments)}}
// keys: only menus, chat and the co-op window work while down (the camera still turns: mouse-look is not blocked)
var RV148_KEYS={escape:1,y:1,m:1,o:1,enter:1};
addEventListener('keydown',e=>{if(!RV148.down)return;const t=e.target;if(t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'))return;
  if(RV148_KEYS[(e.key||'').toLowerCase()])return;e.stopImmediatePropagation();e.preventDefault()},true);
addEventListener('pointerdown',e=>{if(!RV148.down)return;const t=e.target;if(t&&t.closest&&(t.closest('#acts')||t.closest('#mbtn')))e.stopImmediatePropagation()},true);
// monsters I run leave me alone while I lie there
{const f=eTarget;eTarget=function(e,m,dpl){const tg=f.apply(this,arguments);if(!RV148.down||tg!==pl||typeof MP=='undefined'||!MP.on)return tg;
  let best=null,bd=1e9;for(const k in MP.rh){const r=MP.rh[k];if(!r.act||!r.m)continue;const d=m.position.distanceTo(r.m.position);if(d<bd){bd=d;best=r.m}}return best||tg}}
// presence: my downed state and seconds left
{const f=MP.room.presence;MP.room.presence=function(p){if(p&&typeof p=='object'){p.dn=RV148.down?1:0;if(RV148.down)p.bt=Math.ceil(RV148.t)}return f.apply(this,arguments)}}

// ---- the downed box (bleed-out timer, Give up) ----
document.head.insertAdjacentHTML('beforeend',`<style>
body.rv148dn #stage canvas{filter:grayscale(.7) brightness(.62) contrast(1.1)}
#rv148b{position:absolute;left:50%;top:22%;transform:translateX(-50%);z-index:7;min-width:300px;max-width:92%;padding:12px 18px;text-align:center;
  background:linear-gradient(180deg,rgba(40,12,10,.9),rgba(16,6,5,.9));border:1px solid rgba(255,120,90,.5);border-radius:8px;box-shadow:0 8px 30px #000a;color:#f3e2cf}
#rv148b.hide{display:none}#rv148b h3{margin:0 0 4px;font:800 1.25rem Cinzel,Georgia,serif;letter-spacing:.08em;color:#ff9a7a}
#rv148b .m{font-size:.8rem;opacity:.85}#rv148b .bar{height:8px;margin:9px 0 10px;background:rgba(0,0,0,.55);border-radius:99px;overflow:hidden}
#rv148b .bar i{display:block;height:100%;background:linear-gradient(90deg,#c0281c,#ff8a5a);transition:width .25s linear}
#rv148b button{font-size:.78rem;padding:5px 12px}
#rv148r{position:absolute;left:50%;bottom:168px;transform:translateX(-50%);z-index:6;width:240px;padding:7px 10px;text-align:center;font-size:.78rem;font-weight:700;color:#ffe9b0}
#rv148r.hide{display:none}#rv148r .bar{height:7px;margin-top:5px;background:rgba(0,0,0,.55);border-radius:99px;overflow:hidden}#rv148r .bar i{display:block;height:100%;background:linear-gradient(90deg,#c9a24a,#ffe08a)}
</style>`);
{const S=$('stage')||document.body;S.insertAdjacentHTML('beforeend','<div id="rv148b" class="hide"><h3>💀 You are down</h3><div class="m" id="rv148m"></div><div class="bar"><i id="rv148i"></i></div><button id="rv148g">Give up · wake in Duskhold</button></div><div id="rv148r" class="glass hide"><span id="rv148rt"></span><div class="bar"><i id="rv148ri"></i></div></div>');
  $('rv148g').onclick=()=>rv148Die('☠ You gave in to your wounds.')}
function rv148Box(){const b=$('rv148b');if(!b)return;b.classList.toggle('hide',!RV148.down);if(!RV148.down)return;
  const s=Math.max(0,Math.ceil(RV148.t)),n=rv148Standing().map(r=>mpName(r.peer));
  $('rv148m').textContent=(n.length?n.join(', ')+' can revive you — they press F beside you.':'Nobody is left standing…')+'  ·  '+s+'s';
  $('rv148i').style.width=(100*RV148.t/RV148.T).toFixed(1)+'%'}

// ---- reviving a partner ----
function rv148Near(){if(typeof MP=='undefined'||!MP.on||RV148.down||hero.hp<=0)return null;let best=null,bd=RV148.reach;
  for(const k in MP.rh){const r=MP.rh[k],p=r.pr;if(!p||!p.dn||p.hp>0||p.rg!==MP.rg||!r.m||!r.m.visible)continue;const d=Math.hypot(r.m.position.x-pl.position.x,r.m.position.z-pl.position.z);if(d<bd){bd=d;best=r}}return best}
function rv148Start(r){if(!r||RV148.ch)return;RV148.ch={peer:r.peer,t:0,fx:0};say('🤝 Reviving '+mpEsc(mpName(r.peer))+'… stay beside them.')}
function rv148Cancel(msg){if(!RV148.ch)return;RV148.ch=null;const b=$('rv148r');if(b)b.classList.add('hide');if(msg)say(msg)}
function rv148Send(peer){try{MP.room.emit('ev',{r:MP.rg,l:[['rv',peer,String(hero.name||'Hero').slice(0,20)]]}).catch(()=>{})}catch(_){}}
// F beside a downed partner (before the other town / world prompts)
{const f=promptTick;promptTick=function(){const r=f.apply(this,arguments);try{
  if(RV148.down){PR=null;const b=$('prompt');if(b)b.classList.add('hide');return r}
  if(RV148.ch){const n=mpName(RV148.ch.peer);PR={label:'Reviving '+n+'… '+Math.round(100*RV148.ch.t/RV148.need)+'%',fn:()=>rv148Cancel('Revive stopped.')};const b=$('prompt');b.classList.toggle('hide',uiOpen());b.textContent=PR.label;return r}
  const t=rv148Near();if(t){PR={label:'F · Revive '+mpName(t.peer)+(t.pr.bt?' ('+t.pr.bt+'s)':''),fn:()=>rv148Start(t)};const b=$('prompt');b.classList.toggle('hide',uiOpen());b.textContent=PR.label}
}catch(err){console.warn('v148 revive',err)}return r}}
// the revive message
{const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(MP.on&&!msg.sameTab&&d&&Array.isArray(d.l))for(const q of d.l.slice(0,60)){
    if(!Array.isArray(q)||q[0]!=='rv'||q[1]!==MP.me||!RV148.down)continue;const fr=MP.rh[msg.peer];if(!fr||!fr.pr||fr.pr.rg!==MP.rg||!(fr.pr.hp>0))continue;
    rv148Up(mpName(msg.peer))}}catch(err){console.warn('v148 revive',err)}return f.apply(this,arguments)}}

// ---- per frame ----
function rv148Tick(dt){
  if(RV148.down){
    hero.hp=0;pl.rotation.z=Math.min(1.35,(pl.rotation.z||0)+dt*4);
    if(dt>0)RV148.t-=dt;
    const alone=!MP.on||!MPX.be||rv148Standing().length===0;
    if(alone&&performance.now()-RV148.since>1500)return rv148Die('☠ Nobody was left standing to revive you.');
    if(RV148.t<=0)return rv148Die('☠ You bled out.');
    if(Math.ceil(RV148.t)!==RV148.lastBt){RV148.lastBt=Math.ceil(RV148.t);MP.lastPres=''}
    rv148Box();return}
  const c=RV148.ch,b=$('rv148r');
  if(c){const r=MP.rh[c.peer],p=r&&r.pr;
    if(!MP.on||hero.hp<=0||!p||!p.dn||p.hp>0||p.rg!==MP.rg||!r.m){rv148Cancel(p&&p.hp>0?'':'Revive stopped.');return}
    const d=Math.hypot(r.m.position.x-pl.position.x,r.m.position.z-pl.position.z);if(d>RV148.reach+.5){rv148Cancel('Revive stopped — you moved away.');return}
    c.t+=dt;c.fx-=dt;if(c.fx<=0){c.fx=.25;try{burst(gY(r.m.position,.6),0xffe08a,6,.8,1.5,.5)}catch(_){}}
    if(b){b.classList.toggle('hide',uiOpen());$('rv148rt').textContent='🤝 Reviving '+mpName(c.peer)+'…';$('rv148ri').style.width=Math.min(100,100*c.t/RV148.need).toFixed(0)+'%'}
    if(c.t>=RV148.need){RV148.ch=null;if(b)b.classList.add('hide');rv148Send(c.peer);say('🤝 You revived '+mpEsc(mpName(c.peer))+'.');try{ring(r.m.position,0xffe08a,3,500)}catch(_){}}}
  else if(b&&!b.classList.contains('hide'))b.classList.add('hide')}
{const f=homeTick;homeTick=function(dt){const r=f.apply(this,arguments);try{rv148Tick(Math.max(0,Math.min(.1,+dt||0)))}catch(err){console.warn('v148 revive',err)}return r}}
// leaving co-op while down: nobody can help any more
{const f=mpSolo;mpSolo=function(){const r=f.apply(this,arguments);try{if(RV148.ch)rv148Cancel('');}catch(_){}return r}}
