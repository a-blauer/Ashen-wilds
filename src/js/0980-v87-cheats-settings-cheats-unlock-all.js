// ================= v87: cheats (Settings → Cheats): unlock all portals, infinite money, level up, god mode =================
var CHEAT=Object.assign({portals:false,money:false,god:false,g0:0},SET.cheat||{});
function cheatSave(){SET.cheat={portals:CHEAT.portals,money:CHEAT.money,god:CHEAT.god,g0:CHEAT.g0};saveSet()}
const CHEAT_GOLD=9999999;
document.head.insertAdjacentHTML('beforeend',`<style>
#cheatBox{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border:1px dashed #c9a24a;border-radius:8px;background:rgba(201,162,74,.06)}
#cheatBox.hide{display:none}#cheatBox .chr{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:.8rem}
#cheatBox .chr small{display:block;color:var(--mut);font-size:.68rem}#cheatBox .chb{display:flex;gap:6px;flex-wrap:wrap}
#cheatBox input[type=checkbox]{width:18px;height:18px;accent-color:#c9a24a}
</style>`);
{const anchor=[...document.querySelectorAll('.setg')].find(d=>d.textContent.trim()=='Saved game');
 if(anchor){anchor.insertAdjacentHTML('beforebegin',`<div class="setg">Cheats</div><button id="cheatBtn" style="justify-self:start">🎛️ Cheats…</button>
  <div id="cheatBox" class="hide">
   <label class="chr"><span>🌀 Unlock all portals<small>Enter any zone without beating the bosses before it</small></span><input type="checkbox" id="ch_portals"></label>
   <label class="chr"><span>🪙 Infinite money<small>Gold stays at ${CHEAT_GOLD.toLocaleString()}; turning it off gives back your old amount</small></span><input type="checkbox" id="ch_money"></label>
   <label class="chr"><span>🛡️ God mode<small>You cannot die</small></span><input type="checkbox" id="ch_god"></label>
   <div class="chr"><span>⬆️ Level up<small>Gain levels instantly</small></span><span class="chb"><button id="ch_lv1">+1 level</button><button id="ch_lvmax">Max level</button></span></div>
  </div>`)}}
function cheatSync(){const s=(id,v)=>{const e=$(id);if(e)e.checked=!!v};s('ch_portals',CHEAT.portals);s('ch_money',CHEAT.money);s('ch_god',CHEAT.god)}
function cheatPortals(){try{portalRefresh();rportRefresh&&rportRefresh()}catch(_){}}
function cheatLevel(n){let k=0;while(k<n&&hero.lvl<MAXLV){hero.xp=0;heroLevelUp();k++}hero.hp=heroMax();hero.mp=mpMax();hsDirty();hud();if(k)say('⬆️ Cheat: you are now level '+hero.lvl+'.');else say('You are already at the max level ('+MAXLV+').')}
{const b=$('cheatBtn');if(b)b.onclick=()=>{$('cheatBox').classList.toggle('hide');cheatSync()}}
{const on=(id,fn)=>{const e=$(id);if(e)e.onchange=()=>fn(e.checked)};
 on('ch_portals',v=>{CHEAT.portals=v;cheatSave();cheatPortals();say(v?'🌀 Cheat: every portal is open.':'🌀 Portals locked again (bosses you beat still count).')});
 on('ch_money',v=>{if(v&&!CHEAT.money){CHEAT.g0=gold;gold=CHEAT_GOLD}else if(!v&&CHEAT.money){gold=CHEAT.g0||0}CHEAT.money=v;cheatSave();hud();say(v?'🪙 Cheat: infinite money.':'🪙 Infinite money off — your gold is back to '+gold+'.')});
 on('ch_god',v=>{CHEAT.god=v;cheatSave();say(v?'🛡️ Cheat: god mode — you cannot die.':'🛡️ God mode off.')});
 const b1=$('ch_lv1');if(b1)b1.onclick=()=>cheatLevel(1);const b2=$('ch_lvmax');if(b2)b2.onclick=()=>cheatLevel(MAXLV)}
// god mode: falling is cancelled; health never drops below 1
{const f=down;down=function(){if(CHEAT.god){hero.hp=Math.max(1,heroMax()*.25);dn(pl.position,'🛡️ God mode','#ffd24a',-20,900);return}return f.apply(this,arguments)}}
setInterval(()=>{try{if(CHEAT.god&&party.length&&hero.hp<1)hero.hp=1;if(CHEAT.money&&gold<CHEAT_GOLD){gold=CHEAT_GOLD;hud()}}catch(_){}},200);
cheatPortals();


