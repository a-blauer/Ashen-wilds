// ================= v225: owner's list (Nov 12 2026) =================
// 1. Cheddar's board used the phone layout (Cheddar above the quest list) the first time it opened on a computer. The v221 shop
//    view (3940) chose "tall / narrow" once, when the window opened, from the stage's size at that moment (any stage under 720 px
//    wide or a little taller than wide counted: the claude.ai side panel, a window being resized or going full screen). Now only
//    a real phone-shaped stage (the mobile layout in portrait, or a stage under 560 px wide or clearly taller than wide) puts the
//    keeper above the window, and the choice is checked again every frame, so a resize or full screen swaps it straight away.
// 2. (3640) The Inn's fireside bench is gone: it stood between the player and the Ember Wheel.
// 3. Paladin guard (3840 GD213P.paladin): the shield is held up in front of the chest and face (see the pose below).
// 4. Cheats → Teleport: any zone instance (I, II, III, the Den), Duskhold, and the quest places (Abeksi, the Hilltop Ascent, the
//    Sandstorm Run, the Hidden Sanctum, the Black Channel, the Seeping Lair, the Frozen Maw). Quest places are entered through the
//    level's own entrance function, so they set themselves up exactly as when walked into. Nothing is marked as reached.
// 5. Mana (see the numbers below): costs and regeneration evened out between classes and tightened.
// 6. Companion food pouch (3704 / 3773): basic foods (meat, fish, berries, carrots, pumpkin, honey, wheat, glowcaps) go in the
//    pouch too, healing what feeding them by hand heals (FEEDRAW, 0270). Co-op: the bite effect is relayed as before (cf200Fx).
var V225={err:0};

// ---------------- 1 · the shop view's layout ----------------
im220Narrow=function(){const s=$('stage');if(!s)return false;const w=s.clientWidth,h=s.clientHeight;if(!(w>0&&h>0))return false;
  if(document.body.classList.contains('mob'))return w<h*1.05;return w<560||w<h*.8};
{const f=im220Tick;im220Tick=function(){const r=f.apply(this,arguments);try{const w=IM220.on;
    if(w&&w.mode=='shop'&&w.el){const n=im220Narrow();if(n!==w.narrow){w.narrow=n;w.el.classList.toggle('sk220v',n);w.el.classList.toggle('sk220',!n);im220Hi(w)}}}
  catch(e){if(!V225.err++)console.warn('v225 shop view',e)}return r}}
document.head.insertAdjacentHTML('beforeend',`<style id="v225css">.modal.w.sk220>.win{min-width:min(460px,74%)}</style>`);

// ---------------- 4 · cheats: teleport ----------------
// the quest places that are levels of their own (special instances) or caves inside a field instance, by zone
var TP225Q=[[{k:'lair144',n:'The Seeping Lair',f:'mq144Enter'}],[],[{k:'maw151',n:'The Frozen Maw',f:'mq151Enter'}],[],[],[]];
var TP225S={abeksi:()=>ab152Enter(),ascent:()=>ch153Enter(),sandrun:()=>sr165Go([{id:'v0',drv:'chd',gun:'me'}]),sanctum:()=>dg165SEnter(),channel:()=>rt165Enter()};
function tp225Opts(){let h='<option value="town">🏰 Duskhold</option>';
  try{PMAP.forEach((p,z)=>{let o='';(p.ins||[]).forEach(I=>{if(!I||I.tri||I.g==null)return;o+=`<option value="i${I.g}">${I.n}${I.den?' · '+BOSSES[z].name:''}</option>`});
      (SPI&&SPI.L||[]).filter(I=>I.z===z).forEach(I=>{if(TP225S[I.sp])o+=`<option value="s${I.sp}">★ ${I.n} (quest)</option>`});
      (TP225Q[z]||[]).forEach(q=>{if(typeof window[q.f]=='function')o+=`<option value="q${q.k}">★ ${q.n} (quest)</option>`});
      h+=`<optgroup label="${p.ic||''} ${p.n}">${o}</optgroup>`})}catch(e){console.warn('v225 teleport list',e)}
  return h}
function tp225Go(v){v=String(v||'');if(!v)return;
  if(typeof AF!='undefined'&&AF)return say('🌀 Finish the current trip first.');
  try{if(typeof IC151!='undefined'&&IC151.on)return}catch(_){}
  try{if(typeof SR165!='undefined'&&SR165.on)sr165End()}catch(_){}
  try{if(riding&&v[0]=='s')dismount(true)}catch(_){}
  try{$('setw').classList.add('hide')}catch(_){}
  try{if(v=='town'){goHome();return}
    if(v[0]=='i'){const I=INSL[+v.slice(1)];if(!I)return;fadeTo(()=>{insArrive(I)});say('🌀 Cheat: teleported to '+I.n+'.');return}
    if(v[0]=='s'){const k=v.slice(1),f=TP225S[k];if(f){f();say('🌀 Cheat: into '+((sp152I(k)||{}).n||k)+'.')}return}
    if(v[0]=='q'){const q=[].concat(...TP225Q).find(q=>q.k==v.slice(1));if(q&&typeof window[q.f]=='function'){window[q.f]();say('🌀 Cheat: into '+q.n+'.')}return}}
  catch(e){console.error('v225 teleport',e);say('🌀 That place could not be reached: '+e.message)}}
{const box=$('cheatBox');if(box){box.insertAdjacentHTML('beforeend',`<div class="chr"><span>🌀 Teleport<small>Any zone instance, the Den, or a quest place (★)</small></span><span class="chb"><select id="ch_tp" style="max-width:230px"></select><button id="ch_tpGo">Go</button></span></div>`);
  const s=$('ch_tp');if(s)s.innerHTML=tp225Opts();const b=$('ch_tpGo');if(b)b.onclick=()=>tp225Go($('ch_tp').value);
  const c=$('cheatBtn');if(c)c.addEventListener('click',()=>{const s=$('ch_tp');if(s){const v=s.value;s.innerHTML=tp225Opts();s.value=v||'town'}})}}

// ---------------- 6 · basic foods in the companion food pouch ----------------
var CF225={ico:{meat:'🍖',fish:'🐟',berries:'🫐',carrot:'🥕',pumpkin:'🎃',honey:'🍯',wheat:'🌾',glowcap:'🍄'}};
// a pouch food: a companion recipe (3704), or a basic food with the heal it gives when fed by hand
function cf225R(k){const r=cf200R(k);if(r)return r;if(typeof FEEDRAW=='undefined'||!FEEDRAW[k])return null;
  let n=k,i=CF225.ico[k]||'🍽️';try{n=supNm(k)||k}catch(_){}try{const s=supIco(k);if(s&&!/</.test(s))i=s}catch(_){}
  return [k,n,i,null,0,FEEDRAW[k],'A basic food']}
function cf225Raw(k){return !cf200R(k)&&!!cf225R(k)}
// basic foods live in sup (SUP keys, e.g. berries) or in mats (meat, fish …), as cnt() reads them
function cf225Sub(k,n){if(k=='p_hp')pots-=n;else if(SUP[k])sup[k]=(sup[k]||0)-n;else mats[k]=(mats[k]||0)-n}
function cf225Add(k,n){if(SUP[k]||k=='p_hp')giveS(k,n);else mats[k]=(mats[k]||0)+n}
cf200P=function(c){if(!Array.isArray(c.cf200))c.cf200=[];c.cf200=c.cf200.filter(s=>s&&cf225R(s.k)&&s.n>0);return c.cf200};
cf200Put=function(c,k,n){if(!c||!cf225R(k))return;const P=cf200P(c);let s=P.find(q=>q.k==k);if(!s){if(P.length>=CF200.max)return say('🍖 '+c.n+'\'s pouch holds '+CF200.max+' kinds of food.');s={k,n:0};P.push(s)}
  const m=Math.min(n,CF200.stack-s.n,cnt(k));if(m<=0){if(!s.n)P.splice(P.indexOf(s),1);return say(s.n>=CF200.stack?'🍖 That stack is full ('+CF200.stack+').':'You have none left.')}
  cf225Sub(k,m);s.n+=m;try{hud()}catch(_){}};
cf200Eat=function(c,i){const P=cf200P(c);if(!P.length)return false;const mx=M(c),miss=mx-c.h;
  const L=P.slice().sort((a,b)=>cf225R(a.k)[5]-cf225R(b.k)[5]);let s=L.find(q=>cf225R(q.k)[5]*mx>=miss*.85)||L[L.length-1];
  const r=cf225R(s.k),amt=Math.max(1,Math.round(mx*r[5]));c.h=Math.min(mx,c.h+amt);c._ph=c.h;s.n--;if(s.n<=0)P.splice(P.indexOf(s),1);
  const fo=typeof fols!='undefined'&&fols[i];if(fo&&fo.visible){try{mpvRun(cf200Fx,null,[fo.position.x,fo.position.y+.8,fo.position.z,amt,r[2]])}catch(_){cf200Fx(fo.position.x,fo.position.y+.8,fo.position.z,amt,r[2])}}
  if(!P.length)try{say('🍖 '+c.n+' ate the last food in its pouch.')}catch(_){}return true};
// the pouch's slots and its "Add food" list (3773's layout; basic foods listed after the companion recipes, each marked as basic)
cf200Html=function(c){const P=cf200P(c),t=CF200.pts.includes(c.cf200t)?c.cf200t:.4,E=st200Esc,
    have=CF200.R.filter(r=>cnt(r[0])>0).concat(Object.keys(FEEDRAW).filter(k=>cnt(k)>0).map(cf225R)).filter(Boolean);
  let h=`<div class="cf200"><div class="hsec cf206h"><span>🍖 Food pouch <span class="mut" style="text-transform:none;letter-spacing:0;font-weight:500">· eats at once below <select data-cf200t="1">${CF200.pts.map(p=>`<option value="${p}" ${p==t?'selected':''}>${Math.round(p*100)}%</option>`).join('')}</select> health</span></span>`+
    `<button class="cf206b${CF206.open?' on':''}" data-cf206="1" title="Put food from your bag into the pouch">＋ Add food</button></div><div class="cf200s">`;
  for(let i=0;i<CF200.max;i++){const s=P[i],r=s&&cf225R(s.k);h+=r?`<div class="cf200x" title="${E(r[1])}: heals ${Math.round(r[5]*100)}% at once"><span>${r[2]}</span><b>${s.n}</b><button data-cf200o="${s.k}" title="Take it out">✕</button></div>`
    :`<button class="cf200x e cf206e" data-cf206="1" title="Add food from your bag">＋ add food</button>`}
  h+='</div>';
  if(CF206.open){h+='<div class="cf206l">';
    if(!have.length)h+='<div class="mut cf206n">No food in your bag. Cook companion food at the Cooking Hearth in Duskhold, or carry meat, fish, berries or vegetables.</div>';
    else have.forEach(r=>{const own=cnt(r[0]),s=P.find(q=>q.k==r[0]),room=s?CF200.stack-s.n:(P.length<CF200.max?CF200.stack:0),ok=room>0,raw=cf225Raw(r[0]);
      h+=`<div class="cf206r${raw?' cf225raw':''}"><span class="cf206i">${r[2]}</span><span class="cf206t"><b>${E(r[1])}</b><small>${raw?'basic food · ':''}×${own} in your bag · heals ${Math.round(r[5]*100)}%${ok?'':s?' · stack full':' · pouch full'}</small></span>`+
        `<button data-cf200p="${r[0]}" data-n="1" ${ok?'':'disabled'}>+1</button><button data-cf200p="${r[0]}" data-n="5" ${ok&&own>1?'':'disabled'}>+5</button><button data-cf200p="${r[0]}" data-n="${CF200.stack}" ${ok&&own>1?'':'disabled'}>All</button></div>`});
    h+='</div>'}
  return h+'</div>'};
// taking a basic food out puts it back in the bag (giveS knows every supply key)
cf200Take=function(c,k){const P=cf200P(c),s=P.find(q=>q.k==k);if(!s)return;cf225Add(k,s.n);P.splice(P.indexOf(s),1)};
