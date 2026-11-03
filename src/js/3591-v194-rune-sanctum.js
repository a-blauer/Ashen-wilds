// ================= v194: runes, part 2 — the Rune Sanctum window =================
// The only place runes go into anything. Tabs (RS194.tab):
//   set   — pick a piece of gear with rune slots or a companion, pick one of your runes, set it (gold fee by rank, two-step confirm:
//           permanent). A set rune can only be destroyed (two-step confirm); its slot is free again.
//   fuse  — three runes of one type and rank → one of the next rank (gold + Crystal Shards). Rank III needs Sanctum level 1.
//   buy   — rank I runes of any type; rank II from Sanctum level 2.
//   carve — Sanctum level 3: carve one rune slot into a Rare-or-better weapon or armour piece that has none.
// Window: the shared #xw in the visitor mode the Steward's shop prompt already opens (xwArg 'sage'); the older visitor code
// (v49 list, v109 note, kqm slot grid) is skipped for it.
var RS194={tab:'set',sel:null,rune:null,cf:null,anim:null,fsel:null};
var RS194_BUY=[500,2200],RS194_CARVE={g:2500,m:[['crystal',10],['Ectoplasm',6]]};
function rs194L(){return typeof shpL109=='function'?shpL109('sage'):0}
const rs194Hex=c=>'#'+c.toString(16).padStart(6,'0');
const rs194Esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
function rs194Gem(k,big,extra){const p=rn194Parse(k);if(!p)return '';return `<span class="rn194-gem rs194-g${big?' big':''}" style="--rc:${rs194Hex(p.T.col)};--rc2:${rs194Hex(p.T.c2)}" ${extra||''}>${p.T.i}<i>${RN194.rk[p.r-1]}</i></span>`}
function rs194Owned(){const L=[];RN194K.forEach(t=>{for(let r=1;r<=3;r++){const k=rn194Key(t,r);if(cnt(k)>0)L.push(k)}});return L}
// ---------------- targets: gear with slots (worn first) and companions ----------------
function rs194Targets(){const L=[];
  SLOTS.forEach(s=>{const it=eq[s];if(it&&it.rs>0)L.push({k:'i'+it.id,it,where:'Equipped · '+SLOTN[s]})});
  gear.forEach(it=>{if(it&&it.rs>0)L.push({k:'i'+it.id,it,where:'Bag · '+SLOTN[itT(it).sl]})});
  party.forEach((c,i)=>{if(c&&!c.st)L.push({k:'c'+i,c,where:i<actN141()?'Active companion':'Companion'})});return L}
function rs194Find(key){if(!key)return null;return rs194Targets().find(t=>t.k==key)||null}
function rs194Slots(T){if(!T)return {n:0,max:0,L:[]};if(T.it)return {n:T.it.rs|0,max:T.it.rs|0,L:rn194Ru(T.it)};const n=rn194CSlots(T.c);return {n,max:2,L:(T.c.runes||[]).filter(k=>rn194Parse(k))}}
function rs194Pips(T){const S=rs194Slots(T);let h='';for(let i=0;i<S.max;i++){const k=S.L[i],p=k&&rn194Parse(k);h+=p?`<i class="on" style="--rc:${rs194Hex(p.T.col)}"></i>`:i<S.n?'<i></i>':'<i class="lk"></i>'}return h}
function rs194Name(T){if(T.it)return `<span style="color:${RAR[T.it.r][1]}">${icoOf(T.it)} ${rs194Esc(itName(T.it))}</span>`;return `${em(T.c)} ${rs194Esc(T.c.n)} <small>Lv ${T.c.l}${T.c.evo?' '+'✦'.repeat(T.c.evo):''}</small>`}
// ---------------- prices ----------------
function rs194SockG(k){const p=rn194Parse(k);return p?shpP109('sage',RN194.sockG(p.r)):0}
function rs194FuseC(r){const f=RN194.fuse[r-1];return f?{g:shpP109('sage',f[0]),m:[['crystal',f[1]]]}:null}
function rs194Cost(g,ms){return `<span class="rs194-cost">${g?`<span class="${gold>=g?'':'bad'}">${g.toLocaleString()} 🪙</span>`:''}${(ms||[]).map(([k,n])=>{const q=matN(k),h=mats[k]||0;return `<span class="${h>=n?'':'bad'}">${q[0]} ${n} <small>(${h})</small></span>`}).join('')}</span>`}
// ---------------- the window ----------------
function rs194Render(){const B=$('xwB');if(!B)return;$('xwT').textContent='🔯 Rune Sanctum';$('xwS').textContent='🪙 '+gold.toLocaleString()+' · the Rune Sage';
  const L=rs194L(),tabs=[['set','◈ Set runes'],['fuse','⚗️ Fuse'],['buy','🛒 Buy runes'],['carve','⛏️ Carve a slot'+(L<3?' 🔒':'')]];
  if(!tabs.some(t=>t[0]==RS194.tab))RS194.tab='set';
  let h=rs194Note()+`<div class="rs194-tabs">${tabs.map(([k,n])=>`<button data-rs="tab:${k}" class="${RS194.tab==k?'on':''}">${n}</button>`).join('')}</div>`;
  h+=`<div class="rs194-body">${RS194.tab=='set'?rs194Set():RS194.tab=='fuse'?rs194Fuse():RS194.tab=='buy'?rs194Buy():rs194Carve()}</div>`;
  B.innerHTML=h;$('xwF').innerHTML='<span class="mut dtl">Runes are permanent: once set, the only way to free the slot is to destroy the rune. Rune slots are found on Rare (blue) or better weapons and armor; companions gain slots by evolving.</span>';
  if(RS194.anim){const a=RS194.anim;RS194.anim=null;requestAnimationFrame(()=>{const el=B.querySelector(a);if(el){el.classList.add('rs194-go');setTimeout(()=>el.classList.remove('rs194-go'),1300)}})}}
function rs194Note(){const L=rs194L(),U=['Rank III fusion','Rank II runes for sale','Carve a rune slot into gear'];
  return `<div class="shpnote${L?' on':''}">🏪 ${L?`<b>Sanctum level ${L}</b> <span class="shpip">${'◆'.repeat(L)}${'◇'.repeat(3-L)}</span> · <b>${5*L}% off</b> · `:''}${U.map((u,i)=>`<span class="rs194-un${L>i?' on':''}">${L>i?'✔ ':'🔒 L'+(i+1)+': '}${u}</span>`).join(' · ')}${L<3?' · upgrade at the Stronghold Steward':''}</div>`}
// ---- set ----
function rs194Set(){const T0=rs194Targets();if(!RS194.sel||!T0.some(t=>t.k==RS194.sel)){const d=T0.find(t=>t.it&&rn194Open(t.it))||T0.find(t=>t.c&&rs194Slots(t).n>rs194Slots(t).L.length)||T0[0];RS194.sel=d?d.k:null}
  const T=rs194Find(RS194.sel);
  const grp=(t,list)=>list.length?`<div class="rs194-gh">${t}</div>`+list.map(x=>`<button class="rs194-tg${x.k==RS194.sel?' on':''}" data-rs="sel:${x.k}" style="--rc:${x.it?RAR[x.it.r][1]:'#8a7aff'}"><span class="rs194-tn">${rs194Name(x)}</span><span class="rs194-pp">${rs194Pips(x)}</span><small>${x.where}</small></button>`).join(''):'';
  const items=T0.filter(x=>x.it),eqd=items.filter(x=>x.where.startsWith('Equipped')),bag=items.filter(x=>!x.where.startsWith('Equipped')),comps=T0.filter(x=>x.c);
  let left=grp('Worn gear',eqd)+grp('Gear in your bag',bag)+grp('Companions',comps);
  if(!items.length)left=`<div class="rs194-empty">None of your gear has rune slots yet. Rare (blue) or better weapons and armor sometimes drop with one, two or (Epic and Legendary only) three slots.</div>`+left;
  return `<div class="rs194-set"><div class="rs194-col rs194-list">${left||'<div class="rs194-empty">Nothing to rune.</div>'}</div>
    <div class="rs194-col rs194-mid">${rs194Altar(T)}</div><div class="rs194-col rs194-bag">${rs194Bag(T)}</div></div>`}
function rs194Altar(T){if(!T)return '<div class="rs194-empty">Pick a piece of gear or a companion.</div>';const S=rs194Slots(T),R=RS194.rune&&cnt(RS194.rune)>0&&rn194Fits(RS194.rune,T.it||T.c)?RS194.rune:null;
  const kind=T.it?(rn194SlK(T.it)=='w'?'Takes weapon runes':'Takes armor runes'):'Takes any rune';
  let socks='';for(let i=0;i<S.max;i++){const k=S.L[i],p=k&&rn194Parse(k),lock=i>=S.n,cf=RS194.cf=='d:'+T.k+':'+i;
    if(p)socks+=`<div class="rs194-sock full" style="--rc:${rs194Hex(p.T.col)}" id="rs194s${i}">${rs194Gem(k,1)}<b>${rn194Name(k)}</b><small>${rn194Desc(k,T.it?'h':'c')}</small>
      <button class="rs194-del${cf?' cf':''}" data-rs="del:${i}">${cf?'⚠ Destroy it for good':'🗑 Destroy'}</button></div>`;
    else if(lock)socks+=`<div class="rs194-sock lock"><span class="rn194-gem big">🔒</span><b>Locked</b><small>${i==0?'Unlocks at its first evolution ✦':'Unlocks at its third evolution ✦✦✦'}</small></div>`;
    else socks+=`<div class="rs194-sock open${R?' ready':''}" id="rs194s${i}"><span class="rn194-gem big rs194-hole">◇</span><b>Empty slot</b><small>${R?'Ready for '+rn194Name(R):'Choose a rune on the right'}</small></div>`}
  const open=S.n-S.L.length;let act='';
  if(R&&open>0){const g=rs194SockG(R),cf=RS194.cf=='s:'+T.k+':'+R,ok=gold>=g;
    act=`<div class="rs194-act"><div class="rs194-ap">${rs194Gem(R)}<span><b>Set ${rn194Name(R)}</b><small>${rn194Desc(R,T.it?'h':'c')}</small></span></div>
      <div class="rs194-ab">${rs194Cost(g)}<button class="pri${cf?' cf':''}" data-rs="set" ${ok?'':'disabled'}>${cf?'✔ Confirm — this is permanent':'◈ Set rune'}</button>${cf?'<button data-rs="nocf">Cancel</button>':''}</div>
      ${cf?'<div class="rs194-warn">Once set, this rune cannot be taken out. Freeing the slot later destroys it.</div>':''}</div>`}
  else if(open<=0&&S.n)act=`<div class="rs194-act mut">Every slot is filled. Destroy a rune to free its slot.</div>`;
  else if(!S.n)act=`<div class="rs194-act mut">${T.c?rn194CNext(T.c):'No rune slots.'}</div>`;
  else act=`<div class="rs194-act mut">Choose one of your runes on the right to set it here.</div>`;
  const stat=T.it?`<div class="rs194-sub">${RAR[T.it.r][0]} ${SLOTN[itT(T.it).sl]} · iLvl ${T.it.lv} · ${kind}</div>`:`<div class="rs194-sub">${kind} · ${S.n}/2 slots open by evolution</div>`;
  return `<div class="rs194-altar"><div class="rs194-at">${rs194Name(T)}</div>${stat}<div class="rs194-socks n${S.max}">${socks}</div></div>${act}`}
function rs194Bag(T){const own=rs194Owned();if(!own.length)return `<div class="rs194-gh">Your runes</div><div class="rs194-empty">You have no runes. Sovereigns always drop one; elites, chests, rare fish and Bestiary milestones sometimes do. You can also buy them here.</div>`;
  const fit=k=>T&&rn194Fits(k,T.it||T.c),sec=(sl,n)=>{const L=own.filter(k=>rn194Parse(k).T.sl==sl);return L.length?`<div class="rs194-gh">${n}</div><div class="rs194-rg">`+L.map(k=>`<button class="rs194-rc${RS194.rune==k?' on':''}${fit(k)?'':' no'}" data-rs="rune:${k}" title="${rs194Esc(SUP[k].d)}">${rs194Gem(k)}<span class="rs194-ct">×${cnt(k)}</span><span class="rs194-rn">${rn194Parse(k).T.n} ${RN194.rk[rn194Parse(k).r-1]}</span></button>`).join('')+'</div>':''};
  const R=RS194.rune&&cnt(RS194.rune)>0?RS194.rune:null;
  return `<div class="rs194-gh">Your runes</div>`+sec('w','⚔️ Weapon runes')+sec('a','🛡️ Armor runes')+
    (R?`<div class="rs194-rd">${rs194Gem(R)}<div><b>${rn194Name(R)}</b><small>${rn194Kind(R)}</small><p><b>In gear:</b> ${rn194Desc(R,'h')}</p><p><b>In a companion:</b> ${rn194Desc(R,'c')}</p>${T&&!fit(R)?'<p class="bad">This rune doesn\'t fit '+(T.it?(rn194SlK(T.it)=='w'?'a weapon (it is an armor rune)':'armor (it is a weapon rune)'):'here')+'.</p>':''}</div></div>`:'<div class="rs194-rd mut">Select a rune to read what it does.</div>')}
// ---- fuse ----
function rs194Fuse(){const L=rs194L();if(!RS194.fsel){const own=rs194Owned().find(k=>cnt(k)>=3&&rn194Parse(k).r<3);RS194.fsel=own||rn194Key('ember',1)}
  const row=t=>{const T=RN194.T[t];return `<div class="rs194-fr"><span class="rs194-fn" style="color:${rs194Hex(T.col)}">${T.i} ${T.n}</span>`+[1,2,3].map(r=>{const k=rn194Key(t,r),n=cnt(k);
    return `<button class="rs194-fc${RS194.fsel==k?' on':''}${n?'':' zero'}${n>=3&&r<3?' can':''}" data-rs="fsel:${k}"><b>${RN194.rk[r-1]}</b><span>×${n}</span></button>`}).join('')+'</div>'};
  const grid=`<div class="rs194-gh">⚔️ Weapon runes</div>`+RN194K.filter(t=>RN194.T[t].sl=='w').map(row).join('')+`<div class="rs194-gh">🛡️ Armor runes</div>`+RN194K.filter(t=>RN194.T[t].sl=='a').map(row).join('');
  const p=rn194Parse(RS194.fsel);let pan='';
  if(p&&p.r<3){const nx=rn194Key(p.t,p.r+1),n=cnt(p.k),C=rs194FuseC(p.r),lock=p.r==2&&L<1,ok=n>=3&&!lock&&gold>=C.g&&shHas(C.m);
    pan=`<div class="rs194-fz" id="rs194fz"><div class="rs194-tri">${[0,1,2].map(i=>`<span class="rs194-fi f${i}${i<n?'':' miss'}">${rs194Gem(p.k,1)}</span>`).join('')}<span class="rs194-arrow">➜</span><span class="rs194-fo">${rs194Gem(nx,1)}</span></div>
      <div class="rs194-ft"><b>3 × ${rn194Name(p.k)} → ${rn194Name(nx)}</b><small>You have ${n}.</small></div>
      <div class="rs194-cmp"><div><small>Rank ${RN194.rk[p.r-1]} in gear</small>${rn194Desc(p.k,'h')}</div><div><small>Rank ${RN194.rk[p.r]} in gear</small>${rn194Desc(nx,'h')}</div></div>
      <div class="rs194-ab">${rs194Cost(C.g,C.m)}<button class="pri" data-rs="fuse" ${ok?'':'disabled'}>${lock?'🔒 Rank III fusion needs Sanctum level 1':n<3?'Needs 3 runes':'⚗️ Fuse'}</button></div></div>`}
  else if(p)pan=`<div class="rs194-fz"><div class="rs194-tri"><span class="rs194-fo">${rs194Gem(p.k,1)}</span></div><div class="rs194-ft"><b>${rn194Name(p.k)}</b><small>Rank III is the highest rank.</small></div><div class="rs194-cmp one"><div><small>In gear</small>${rn194Desc(p.k,'h')}</div><div><small>In a companion</small>${rn194Desc(p.k,'c')}</div></div></div>`;
  return `<div class="rs194-fuse"><div class="rs194-col">${grid}</div><div class="rs194-col">${pan}<div class="mut dtl" style="margin-top:8px">Three runes of the same type and rank fuse into one of the next rank. Ranks: I → II → III.</div></div></div>`}
// ---- buy ----
function rs194Buy(){const L=rs194L(),card=(k,price,lock)=>`<div class="rs194-bc">${rs194Gem(k,1)}<div class="rs194-bt"><b>${rn194Name(k)}</b><small>${rn194Kind(k)}</small><p>${rn194Desc(k,'h')}</p><p class="mut">Companion: ${rn194Desc(k,'c')}</p></div>
    <div class="rs194-bb"><span class="mut">You have ${cnt(k)}</span>${lock?`<button disabled>🔒 ${lock}</button>`:`<button class="pri" data-rs="buy:${k}" ${gold>=price?'':'disabled'}>${price.toLocaleString()} 🪙</button>`}</div></div>`;
  const r1=shpP109('sage',RS194_BUY[0]),r2=shpP109('sage',RS194_BUY[1]);
  return `<div class="rs194-gh">Rank I runes</div><div class="rs194-buy">${RN194K.map(t=>card(rn194Key(t,1),r1)).join('')}</div>
    <div class="rs194-gh">Rank II runes</div><div class="rs194-buy">${RN194K.map(t=>card(rn194Key(t,2),r2,L<2?'Sanctum level 2':'')).join('')}</div>`}
// ---- carve ----
function rs194CarveList(){const L=[];SLOTS.forEach(s=>{const it=eq[s];if(it)L.push([it,'Equipped'])});gear.forEach(it=>L.push([it,'Bag']));
  return L.filter(([it])=>it&&rn194SlK(it)&&(it.r|0)>=2&&!(it.rs>0)&&!it.rc194)}
function rs194Carve(){const L=rs194L();
  if(L<3)return `<div class="rs194-lockp"><span class="rn194-gem big">⛏️</span><div><b>Carving opens at Sanctum level 3</b><p>The Rune Sage can carve one rune slot into a Rare (blue) or better weapon or armor piece that has none. Upgrade the Rune Sanctum at the Stronghold Steward.</p></div></div>`;
  const list=rs194CarveList(),c=RS194_CARVE,g=shpP109('sage',c.g),ok=gold>=g&&shHas(c.m);
  if(!list.length)return `<div class="rs194-empty">No weapon or armor piece to carve: it must be Rare (blue) or better and have no rune slots yet (each piece can be carved once).</div>`;
  return `<div class="rs194-gh">Carve one rune slot · ${rs194Cost(g,c.m)}</div><div class="rs194-cv">`+list.map(([it,w])=>{const cf=RS194.cf=='c:'+it.id;
    return `<div class="rs194-cvr" style="--rc:${RAR[it.r][1]}"><span>${rs194Name({it})}<small>${w} · ${RAR[it.r][0]} ${SLOTN[itT(it).sl]} · iLvl ${it.lv}</small></span><button class="pri${cf?' cf':''}" data-rs="carve:${it.id}" ${ok?'':'disabled'}>${cf?'✔ Confirm carving':'⛏️ Carve a slot'}</button></div>`}).join('')+'</div>'}
// ---------------- actions ----------------
function rs194Refresh(it){hsDirty();try{if(it&&Object.values(eq).includes(it)){refreshGear();if(typeof HP!='undefined'&&HP)refreshGear(HP)}}catch(e){console.warn(e)}try{hud();ui()}catch(_){}try{saveGame(true)}catch(_){}}
function rs194Do(a){const [cmd,arg]=[a.split(':')[0],a.slice(a.indexOf(':')+1)];const T=rs194Find(RS194.sel);
  if(cmd=='tab'){RS194.tab=arg;RS194.cf=null}
  else if(cmd=='sel'){RS194.sel=arg;RS194.cf=null;const T2=rs194Find(arg);if(RS194.rune&&T2&&!rn194Fits(RS194.rune,T2.it||T2.c))RS194.rune=null}
  else if(cmd=='rune'){RS194.rune=RS194.rune==arg?null:arg;RS194.cf=null}
  else if(cmd=='nocf')RS194.cf=null;
  else if(cmd=='set'){const R=RS194.rune;if(!T||!R||!(cnt(R)>0)||!rn194Fits(R,T.it||T.c))return;const S=rs194Slots(T);if(S.L.length>=S.n)return;const g=rs194SockG(R);if(gold<g)return say('Not enough gold.');
    const key='s:'+T.k+':'+R;if(RS194.cf!==key){RS194.cf=key;rX();return}
    gold-=g;sup[R]--;if(T.it){T.it.ru=rn194Ru(T.it);T.it.ru.push(R)}else{T.c.runes=(T.c.runes||[]).filter(k=>rn194Parse(k));T.c.runes.push(R);T.c.h=Math.min(T.c.h,M(T.c))}
    RS194.cf=null;if(!(cnt(R)>0))RS194.rune=null;RS194.anim='#rs194s'+(S.L.length);say('◈ '+rn194Name(R)+' set into '+(T.it?itName(T.it):T.c.n)+'.');try{sfx('chime')}catch(_){}try{mSfx('rare')}catch(_){}rs194Refresh(T.it)}
  else if(cmd=='del'){if(!T)return;const i=+arg,S=rs194Slots(T),k=S.L[i];if(!k)return;const key='d:'+T.k+':'+i;if(RS194.cf!==key){RS194.cf=key;rX();return}
    if(T.it){T.it.ru=rn194Ru(T.it);T.it.ru.splice(i,1)}else{T.c.runes=S.L.slice();T.c.runes.splice(i,1);T.c.h=Math.min(T.c.h,M(T.c))}
    RS194.cf=null;say('🗑 '+rn194Name(k)+' was destroyed. The slot is free.');try{sfx('brk',.6)}catch(_){}rs194Refresh(T.it)}
  else if(cmd=='fsel'){RS194.fsel=arg}
  else if(cmd=='fuse'){const p=rn194Parse(RS194.fsel);if(!p||p.r>=3||cnt(p.k)<3)return;if(p.r==2&&rs194L()<1)return;const C=rs194FuseC(p.r);if(gold<C.g||!shHas(C.m))return say('Not enough gold or Crystal Shards.');
    shPay(C.g,C.m);sup[p.k]-=3;const nx=rn194Key(p.t,p.r+1);giveS(nx,1);RS194.anim='#rs194fz';say('⚗️ Three '+rn194Name(p.k)+'s fused into a '+rn194Name(nx)+'!');
    try{sfx('power')}catch(_){}try{mSfx('rare')}catch(_){}if(cnt(p.k)<3)RS194.fsel=nx;try{hud();saveGame(true)}catch(_){}}
  else if(cmd=='buy'){const p=rn194Parse(arg);if(!p||p.r>2)return;if(p.r==2&&rs194L()<2)return;const c=shpP109('sage',RS194_BUY[p.r-1]);if(gold<c)return say('Not enough gold.');gold-=c;giveS(arg,1);say('🔮 Bought a '+rn194Name(arg)+'.');try{sfx('chime')}catch(_){}try{hud()}catch(_){}}
  else if(cmd=='carve'){if(rs194L()<3)return;const it=rs194CarveList().map(q=>q[0]).find(q=>q.id==+arg);if(!it)return;const c=RS194_CARVE,g=shpP109('sage',c.g);if(gold<g||!shHas(c.m))return say('Not enough gold or materials.');
    const key='c:'+it.id;if(RS194.cf!==key){RS194.cf=key;rX();return}shPay(g,c.m);it.rs=1;it.ru=[];it.rc194=1;RS194.cf=null;RS194.tab='set';RS194.sel='i'+it.id;say('⛏️ The Rune Sage carved a rune slot into '+itName(it)+'.');try{sfx('power')}catch(_){}rs194Refresh(it)}
  rX()}
$('xw').addEventListener('click',e=>{if(xwMode!='visitor'||xwArg!='sage')return;const t=e.target.closest('[data-rs]');if(!t||t.disabled)return;e.stopPropagation();try{rs194Do(t.dataset.rs)}catch(err){console.warn('v194 sanctum',err)}});
{const f=XR.visitor;XR.visitor=function(){if(xwArg=='sage'){try{return rs194Render()}catch(e){console.warn('v194 sanctum',e)}}return f.apply(this,arguments)}}
document.head.insertAdjacentHTML('beforeend',`<style>
#xw .rs194-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}
#xw .rs194-tabs button{padding:6px 12px;border-radius:99px;border:1px solid var(--line);background:rgba(255,255,255,.03);color:var(--mut);font-weight:700}
#xw .rs194-tabs button.on{color:#efe4ff;border-color:#8a6aff;background:linear-gradient(180deg,rgba(138,106,255,.32),rgba(80,50,160,.18));box-shadow:0 0 12px rgba(138,106,255,.25) inset}
#xw .rs194-un{white-space:nowrap;color:var(--mut)}#xw .rs194-un.on{color:#c9f5c0}
#xw .rs194-set{display:grid;grid-template-columns:minmax(200px,250px) minmax(0,1fr) minmax(200px,260px);gap:12px;align-items:start}
#xw .rs194-fuse{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start}
#xw .rs194-col{min-width:0;display:flex;flex-direction:column;gap:5px}
#xw .rs194-list{max-height:58vh;overflow:auto;padding-right:2px}
#xw .rs194-gh{font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:#bfb0e8;margin:6px 0 2px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
#xw .rs194-tg{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 6px;text-align:left;padding:7px 9px;border-radius:7px;border:1px solid var(--line);border-left:3px solid var(--rc);background:rgba(0,0,0,.25)}
#xw .rs194-tg.on{background:linear-gradient(90deg,rgba(138,106,255,.22),rgba(0,0,0,.2));border-color:#8a6aff;border-left-color:var(--rc)}
#xw .rs194-tg small{grid-column:1/-1;color:var(--mut);font-size:.68rem}#xw .rs194-tn{font-size:.8rem;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#xw .rs194-pp{display:flex;gap:3px;align-items:center}#xw .rs194-pp i{width:10px;height:10px;transform:rotate(45deg);border:1px solid #9a8ad0;background:transparent;display:block}
#xw .rs194-pp i.on{background:var(--rc);border-color:var(--rc);box-shadow:0 0 6px var(--rc)}#xw .rs194-pp i.lk{border-color:#4a4a54;background:repeating-linear-gradient(45deg,#2a2a30 0 2px,#3a3a42 2px 4px)}
#xw .rs194-empty{font-size:.78rem;color:var(--mut);padding:10px;border:1px dashed var(--line);border-radius:7px;line-height:1.4}
#xw .rs194-altar{padding:14px 12px 12px;border-radius:12px;border:1px solid rgba(138,106,255,.4);text-align:center;
  background:radial-gradient(ellipse at 50% 0%,rgba(138,106,255,.25),transparent 60%),radial-gradient(ellipse at 50% 120%,rgba(201,162,74,.18),transparent 60%),#0e0b12}
#xw .rs194-at{font-size:1rem;font-weight:800}#xw .rs194-at small{color:var(--mut);font-weight:600}#xw .rs194-sub{font-size:.72rem;color:var(--mut);margin-top:2px}
#xw .rs194-socks{display:grid;gap:10px;margin-top:14px;grid-template-columns:repeat(var(--n,2),minmax(0,1fr))}#xw .rs194-socks.n1{--n:1}#xw .rs194-socks.n2{--n:2}#xw .rs194-socks.n3{--n:3}
#xw .rs194-sock{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 8px 10px;border-radius:10px;border:1px solid var(--line);background:rgba(0,0,0,.35);min-width:0}
#xw .rs194-sock b{font-size:.8rem}#xw .rs194-sock small{font-size:.7rem;color:var(--mut);line-height:1.3}
#xw .rs194-sock.full{border-color:color-mix(in srgb,var(--rc) 60%,transparent);background:radial-gradient(circle at 50% 30%,color-mix(in srgb,var(--rc) 22%,transparent),rgba(0,0,0,.35) 70%)}
#xw .rs194-sock.open{border-style:dashed}#xw .rs194-sock.open.ready{border-color:#c9a2ff;animation:rs194pulse 1.6s ease-in-out infinite}
#xw .rs194-sock.lock{opacity:.6;filter:grayscale(.7)}
#xw .rn194-gem.big{width:56px;height:56px;font-size:1.6rem}#xw .rn194-gem.big i{font-size:.7rem;right:12px;bottom:4px}
#xw .rs194-g{box-shadow:0 0 0 1px rgba(255,255,255,.08)}#xw .rs194-sock.full .rs194-g,#xw .rs194-fo .rs194-g{filter:drop-shadow(0 0 8px var(--rc));animation:rs194glow 2.6s ease-in-out infinite}
#xw .rs194-hole{background:radial-gradient(circle,#1a1622,#07060a 70%);color:#6a5a9a}
#xw .rs194-del{margin-top:4px;font-size:.7rem!important;padding:3px 9px!important;border-color:rgba(255,90,90,.4)!important;color:#f0b0b0!important;background:rgba(120,20,20,.15)!important}
#xw .rs194-del.cf,#xw button.cf{border-color:#ff7a5a!important;color:#fff!important;background:linear-gradient(180deg,#8a2a1a,#5a1a10)!important}
#xw .rs194-act{margin-top:10px;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:rgba(0,0,0,.25);font-size:.78rem}
#xw .rs194-ap{display:flex;gap:10px;align-items:center;text-align:left}#xw .rs194-ap small{display:block;color:var(--mut);font-size:.72rem}
#xw .rs194-ab{display:flex;gap:8px;align-items:center;justify-content:flex-end;flex-wrap:wrap;margin-top:8px}
#xw .rs194-cost{display:inline-flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:.76rem;font-weight:700;color:#f0dca0}#xw .rs194-cost .bad{color:#f0a0a0}#xw .rs194-cost small{color:var(--mut);font-weight:500}
#xw .rs194-warn{margin-top:6px;color:#ffb08a;font-size:.72rem;text-align:right}
#xw .rs194-rg{display:grid;grid-template-columns:repeat(auto-fill,minmax(58px,1fr));gap:5px}
#xw .rs194-rc{position:relative;display:grid;place-items:center;padding:7px 2px 6px;border-radius:8px;border:1px solid var(--line);background:rgba(0,0,0,.3)}
#xw .rs194-rc.on{border-color:#c9a2ff;background:rgba(138,106,255,.22);box-shadow:0 0 10px rgba(138,106,255,.35)}#xw .rs194-rc.no{opacity:.38}
#xw .rs194-ct{position:absolute;top:1px;right:4px;font-size:.62rem;font-weight:800;color:#efe4cc}#xw .rs194-rn{font-size:.6rem;color:var(--mut);margin-top:2px;white-space:nowrap}
#xw .rs194-rd{display:flex;gap:9px;align-items:flex-start;margin-top:8px;padding:9px;border-radius:8px;border:1px solid var(--line);background:rgba(0,0,0,.25);font-size:.74rem;line-height:1.35}
#xw .rs194-rd small{display:block;color:#bfb0e8;font-size:.68rem}#xw .rs194-rd p{margin:5px 0 0}#xw .rs194-rd .bad,#xw .bad{color:#f0a0a0}
#xw .rs194-fr{display:grid;grid-template-columns:minmax(80px,1fr) repeat(3,minmax(44px,58px));gap:5px;align-items:center}
#xw .rs194-fn{font-size:.8rem;font-weight:800}
#xw .rs194-fc{display:flex;flex-direction:column;align-items:center;padding:4px 2px;border-radius:7px;border:1px solid var(--line);background:rgba(0,0,0,.3);line-height:1.1}
#xw .rs194-fc b{font-size:.72rem}#xw .rs194-fc span{font-size:.7rem;color:var(--mut)}#xw .rs194-fc.zero{opacity:.45}#xw .rs194-fc.can{border-color:#6ee7b7}#xw .rs194-fc.can span{color:#a8f0c8}
#xw .rs194-fc.on{border-color:#c9a2ff;background:rgba(138,106,255,.25);opacity:1}
#xw .rs194-fz{padding:16px 14px;border-radius:12px;border:1px solid rgba(138,106,255,.4);background:radial-gradient(ellipse at 50% 30%,rgba(138,106,255,.22),transparent 65%),#0e0b12}
#xw .rs194-tri{position:relative;display:flex;align-items:center;justify-content:center;gap:14px;min-height:120px}
#xw .rs194-fi{display:inline-block;transition:transform .5s,opacity .5s}#xw .rs194-fi.f1{transform:translateY(-22px)}#xw .rs194-fi.miss{opacity:.22;filter:grayscale(1)}
#xw .rs194-arrow{font-size:1.4rem;color:#c9a2ff}#xw .rs194-ft{text-align:center;margin-top:6px}#xw .rs194-ft small{display:block;color:var(--mut)}
#xw .rs194-cmp{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;font-size:.74rem;line-height:1.35}#xw .rs194-cmp>div{padding:8px;border-radius:8px;background:rgba(0,0,0,.3);border:1px solid var(--line)}
#xw .rs194-cmp small{display:block;color:#bfb0e8;font-size:.66rem;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px}
#xw .rs194-buy{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px}
#xw .rs194-bc{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 10px;padding:10px;border-radius:10px;border:1px solid var(--line);background:rgba(0,0,0,.28)}
#xw .rs194-bt b{font-size:.84rem}#xw .rs194-bt small{display:block;color:#bfb0e8;font-size:.66rem}#xw .rs194-bt p{margin:4px 0 0;font-size:.72rem;line-height:1.3}
#xw .rs194-bb{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;font-size:.72rem}
#xw .rs194-cv{display:flex;flex-direction:column;gap:6px}#xw .rs194-cvr{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:8px 10px;border-radius:8px;border:1px solid var(--line);border-left:3px solid var(--rc);background:rgba(0,0,0,.25)}
#xw .rs194-cvr small{display:block;color:var(--mut);font-size:.7rem}
#xw .rs194-lockp{display:flex;gap:14px;align-items:center;padding:16px;border-radius:12px;border:1px dashed rgba(138,106,255,.4);font-size:.8rem}#xw .rs194-lockp p{margin:4px 0 0;color:var(--mut)}
@keyframes rs194pulse{0%,100%{box-shadow:0 0 0 rgba(201,162,255,0)}50%{box-shadow:0 0 16px rgba(201,162,255,.45)}}
@keyframes rs194glow{0%,100%{filter:drop-shadow(0 0 5px var(--rc))}50%{filter:drop-shadow(0 0 12px var(--rc))}}
#xw .rs194-sock.rs194-go{animation:rs194set 1.2s ease-out}@keyframes rs194set{0%{transform:scale(.8);box-shadow:0 0 0 rgba(255,255,255,0)}35%{transform:scale(1.06);box-shadow:0 0 34px var(--rc)}100%{transform:none}}
#xw .rs194-fz.rs194-go .rs194-fi{animation:rs194in 1s ease-in forwards}#xw .rs194-fz.rs194-go .rs194-fi.f0{--dx:60px}#xw .rs194-fz.rs194-go .rs194-fi.f2{--dx:-60px}#xw .rs194-fz.rs194-go .rs194-fo{animation:rs194out 1.2s ease-out}
@keyframes rs194in{to{transform:translateX(var(--dx,0)) scale(.3);opacity:0}}@keyframes rs194out{0%,50%{transform:scale(.4);opacity:0}75%{transform:scale(1.25);opacity:1;filter:drop-shadow(0 0 20px #fff)}100%{transform:none}}
@media (max-width:760px){#xw .rs194-set,#xw .rs194-fuse{grid-template-columns:1fr}#xw .rs194-list{max-height:none}}
</style>`);
