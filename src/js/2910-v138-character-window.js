// ================= v138: the Character window (C) =================
// The old Talents window (#tal) is now the Character window: on the left the hero model (the inventory's preview model HP on the
// shared PV renderer), name, level and XP, and under it the six attributes (2900) with their 10/25/50/75 bonus marks; on the
// right every stat of the hero in groups (with the pending points previewed as "old → new"), power, and the attribute bonuses
// (unlocked ones lit). C opens and closes it (0108), the ☰ button "Character" too. Abilities moved to K (1010).
var CH138={init:false};
function ch138Init(){if(CH138.init)return;const w=$('tal');if(!w)return;CH138.init=true;
  const win=w.querySelector('.win');if(win)win.style.width='min(1000px,100%)';
  const wb=w.querySelector('.wb');if(wb)wb.innerHTML=`<div class="ch138"><div class="ch138-l"><div class="ch138-pvw"><div class="ch138-pv" id="ch138PV"></div></div><div class="ch138-id" id="ch138Id"></div>
    <div class="ch138-ah"><span class="at138-h">✦ Attributes</span><span class="mut">${ATR138.per} points every level</span></div><div id="ch138Bar"></div><div class="at138-g" id="ch138At"></div><div class="ch138-info" id="ch138Info"></div></div>
    <div class="ch138-r" id="ch138St"></div></div><div id="talT" style="display:none"></div>`;
  const wf=w.querySelector('.wf');if(wf)wf.innerHTML=`<span class="mut dtl" id="talInfo">Spend attribute points with +, then press Apply. Reaching 10, 25, 50 and 75 points in one attribute unlocks a bonus. Shift+click adds 5.</span>`;
  ATR138_R.push(()=>{if(!w.classList.contains('hide'))ch138Render()})}
function ch138Fmt(v,k){if(v==null||!isFinite(v))return '—';if(k=='%')return (+(v*100).toFixed(1))+'%';if(k=='x')return '×'+(+v).toFixed(2);if(k=='+%')return '+'+(+(v*100).toFixed(1))+'%';if(k=='s')return (+v).toFixed(1)+'/s';return Math.round(v).toLocaleString()}
function ch138Stats(){const s=HS(),n=atr138Preview(),L=hero.lvl|0,kd=KD(L),mx=heroMax(),mm=typeof mpMax=='function'?mpMax():s.mp;
  const pdR=x=>x/(x+kd),row=(l,k,f,t,nk,opt)=>{const a=f(s,mx,mm),b=n?f(n,n._mx,n._mm):null,ch=n&&Math.abs((b||0)-(a||0))>1e-6;if(opt&&!ch&&!a)return '';
    return `<div class="kv ch138-kv"${t?` title="${t}"`:''}><span>${l}</span><b>${ch138Fmt(a,k)}${ch?` <em class="${(nk?b<a:b>a)?'up':'dn'}">→ ${ch138Fmt(b,k)}</em>`:''}</b></div>`};
  const sec=(t,h)=>`<div class="ch138-sec"><div class="ch138-st">${t}</div>${h}</div>`;
  const pw=heroPower(),pwN=n?n._pw:null;
  let h=`<div class="ch138-pw"><span>Power</span><b>${pw.toLocaleString()}${pwN!=null&&pwN!==pw?` <em class="up">→ ${pwN.toLocaleString()}</em>`:''}</b></div>`;
  h+=sec('⚔️ Offense',row('Physical attack','',s=>s.pa)+row('Magical attack','',s=>s.ma)+row('Critical chance','%',s=>Math.min(1,s.crit))+row('Critical damage','x',s=>1+s.cdm)+
    row('Attack speed','+%',s=>s.as)+row('Ability damage','+%',s=>s.skillP,'Bonus damage of class abilities')+row('Basic attack damage','+%',s=>s.basicP,'',0,1)+row('Combo finishers','+%',s=>s.finisher,'Extra damage of the last hit of a combo',0,1)+
    row('Ability cooldowns','%',s=>-Math.min(.5,s.cdr||0),'Shorter cooldowns',1,1)+row('Lifesteal','%',s=>s.ls,'',0,1)+row('Execute','+%',s=>s.exec,'More damage to enemies under 35% health',0,1)+row('Ability area','+%',s=>s.aoeP,'',0,1));
  h+=sec('🛡️ Defense',row('Health','',(s,mx)=>mx)+row('Physical defense','',s=>s.pd,'Damage cut against a monster of your level: '+ch138Fmt(pdR(s.pd),'%'))+row('Magical defense','',s=>s.md,'Damage cut against a monster of your level: '+ch138Fmt(pdR(s.md),'%'))+
    row('Physical damage cut','%',s=>pdR(s.pd),'Against a monster of your level')+row('Magical damage cut','%',s=>pdR(s.md),'Against a monster of your level')+row('Damage reduction','%',s=>Math.min(.75,s.dr),'',0,1)+
    row('Block chance','%',s=>s.blockC,'',0,1)+row('Health regen in combat','%',s=>s.regen,'Of max health per second',0,1)+row('Guard below 40% health','%',s=>s.lowdr,'',0,1)+row('Healing received','+%',s=>s.healP,'',0,1)+row('Heal per kill','%',s=>s.killheal,'Of max health',0,1));
  h+=sec('✨ Utility',row('Mana','',(s,mx,mm)=>mm)+row('Mana regen','s',(s,mx,mm)=>mm*(.012+(s.mpr||0)),'Mana per second')+row('Dash charges','',s=>s.dash)+row('Dash invulnerability','',s=>(.3+(s.iframe||0))*1000,'Milliseconds')+
    row('Move speed','+%',s=>s.mspd,'',0,1)+row('Loot find','+%',s=>s.loot,'',0,1)+row('XP bonus','+%',s=>s.xp,'',0,1));
  // bonuses
  const P=atr138Cur();let b='';ATR138.K.forEach(k=>{const D=ATR138.D[k],v=P[k],p=ATR138.pend[k]|0;D.T.forEach(t=>{const on=v>=t[0],nw=!on&&v+p>=t[0];
    b+=`<div class="ch138-bn${on?' on':nw?' nw':''}" style="--ac:${D.col}"><span>${D.i} ${D.ab} ${t[0]}</span><small>${t[2]}</small></div>`})});
  h+=sec('✦ Attribute bonuses',`<div class="ch138-bns">${b}</div>`);
  return h}
function ch138Render(){ch138Init();const C=CLS[hero.cls]||{};
  $('talSub').textContent=(C.i||'')+' '+(C.n||'')+' · Lv '+hero.lvl+' · '+atr138Free()+' attribute point'+(atr138Free()==1?'':'s')+' to spend';
  const xp=hero.lvl>=MAXLV?100:Math.min(100,100*hero.xp/needH(hero.lvl));
  $('ch138Id').innerHTML=`<div class="ch138-nm">${String(hero.name||'Hero').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';')}</div><div class="mut">${C.i||''} Lv ${hero.lvl} ${C.n||''}</div>`+
    `<div class="ch138-xp" title="${hero.lvl>=MAXLV?'Max level':hero.xp+' / '+needH(hero.lvl)+' XP'}"><i style="width:${xp}%"></i></div>`;
  $('ch138Bar').innerHTML=atr138Bar(false);$('ch138At').innerHTML=atr138Rows(false);
  const k=ATR138.sel,D=k&&ATR138.D[k];
  $('ch138Info').innerHTML=D?`<b style="color:${D.col}">${D.i} ${D.n}</b> — ${D.d}. Each point: ${atr138PerTxt(k)}.<br>`+D.T.map(t=>`<span class="${atr138Pts(k)>=t[0]?'got':''}">${t[0]}: ${t[2]}</span>`).join(' · '):
    '<span class="mut">Click an attribute to read what it does. Hover a number mark (10, 25, 50, 75) for its bonus.</span>';
  $('ch138St').innerHTML=ch138Stats()}
function ch138PV(){const host=$('ch138PV');if(!host||$('tal').classList.contains('hide'))return;
  try{bagPV()}catch(_){}if(!HP||!HP.pv)return;try{refreshGear(HP)}catch(_){}
  pvShow(host,HP.pv,now=>{HP.pv.rotation.y=Math.sin(now/1900)*.6+.25;animHero(now,false,HP)})}
// the window itself: replaces the talents window's drawing and opening
rTal=function(){ch138Render()};
openTal=function(){if(!$('tal').classList.contains('hide')){$('tal').classList.add('hide');return}if(uiOpen())return;if(!party.length)return;
  ch138Render();$('tal').classList.remove('hide');try{mSfx('open')}catch(_){}requestAnimationFrame(()=>{try{ch138PV()}catch(e){console.warn('v138 char model',e)}})};
{const b=$('talBtn');if(b)b.onclick=()=>{if($('sysmenu'))$('sysmenu').classList.add('hide');openTal()}}
{const b=$('talClose');if(b)b.onclick=()=>$('tal').classList.add('hide')}
// keep it current while open (gear swaps elsewhere, level-ups, buffs)
setInterval(()=>{try{const w=$('tal');if(!w||w.classList.contains('hide'))return;const sig=hero.lvl+'|'+hero.xp+'|'+(typeof bagSig=='function'?bagSig():'')+'|'+atr138Spent()+'|'+atr138PendN()+'|'+hero.buffs.length;
  if(sig!==CH138.sig){CH138.sig=sig;ch138Render()}}catch(_){}},500);
document.head.insertAdjacentHTML('beforeend',`<style>
.ch138{display:grid;grid-template-columns:minmax(260px,330px) 1fr;gap:14px;min-height:0}
@media(max-width:760px){.ch138{grid-template-columns:1fr}}
.ch138-pvw{position:relative;height:240px;border:1px solid rgba(240,204,114,.22);border-radius:8px;background:radial-gradient(ellipse at 50% 70%,rgba(240,204,114,.12),rgba(0,0,0,.35) 70%);overflow:hidden}
.ch138-pv{position:absolute;inset:0}
.ch138-id{text-align:center;margin-top:6px}
.ch138-nm{font-family:'Cinzel Decorative',serif;font-weight:700;color:#f0cc72;font-size:1rem}
.ch138-xp{height:4px;margin:4px auto 0;width:70%;background:rgba(0,0,0,.5);border-radius:2px;overflow:hidden}.ch138-xp i{display:block;height:100%;background:linear-gradient(90deg,#8a6a20,#f0cc72)}
.ch138-ah{display:flex;justify-content:space-between;align-items:baseline;margin-top:10px;font-size:.72rem}
.ch138-info{margin-top:8px;font-size:.74rem;line-height:1.45;color:#d8ccb0;min-height:3.2em}.ch138-info span.got{color:#7ef0a0}
.ch138-r{min-width:0;display:grid;grid-template-columns:1fr 1fr;gap:4px 14px;align-content:start}
@media(max-width:560px){.ch138-r{grid-template-columns:1fr}}
.ch138-pw{grid-column:1/-1;display:flex;justify-content:space-between;align-items:baseline;padding:6px 10px;border:1px solid rgba(240,204,114,.3);border-radius:8px;background:rgba(240,204,114,.06)}
.ch138-pw span{font-family:'Cinzel Decorative',serif;color:#c9a24a;letter-spacing:.1em}.ch138-pw b{font-size:1.3rem;color:#f4ead2}
.ch138-sec{min-width:0}.ch138-sec:last-child{grid-column:1/-1}
.ch138-st{font-family:'Cinzel Decorative',serif;font-size:.74rem;color:#c9a24a;letter-spacing:.08em;margin:6px 0 2px;border-bottom:1px solid rgba(240,204,114,.18)}
.ch138-kv{font-size:.76rem;padding:2px 0}.ch138-kv em,.ch138-pw em{font-style:normal;font-size:.85em}.ch138-kv em.up,.ch138-pw em.up{color:#7ef0a0}.ch138-kv em.dn{color:#ff8a7a}
.ch138-bns{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:4px}
.ch138-bn{padding:3px 6px;border:1px solid rgba(255,255,255,.08);border-radius:5px;font-size:.68rem;opacity:.45}
.ch138-bn span{display:block;font-weight:700;color:var(--ac)}.ch138-bn small{color:#d8ccb0}
.ch138-bn.on{opacity:1;border-color:var(--ac);background:rgba(0,0,0,.25)}.ch138-bn.nw{opacity:.9;border-color:#7ef0a0;border-style:dashed}
</style>`);
// the "✦ N attribute points · C" chip in the buff bar opens the Character window
document.addEventListener('click',e=>{const t=e.target.closest('#buffs .tpn');if(!t)return;e.preventDefault();if($('tal').classList.contains('hide'))openTal()});
document.head.insertAdjacentHTML('beforeend','<style>#buffs .tpn{cursor:pointer}</style>');
