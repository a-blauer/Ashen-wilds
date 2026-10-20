// ================= shops: wares as slot grids =================
function kqmRowInfo(r,o){const rn=r.querySelector('.rn'),ra=r.querySelector('.ra');if(!rn)return null;
  const cl=rn.cloneNode(true);cl.querySelectorAll('small,.ck,.mut').forEach(x=>x.remove());const bEl=cl.querySelector('b');let nm=(bEl?bEl.textContent:cl.textContent).trim();
  let ic=kqmIcon(nm)||kqmIcon(cl.textContent);if(ic)nm=nm.replace(ic,'').trim();
  const sm=rn.querySelector('small');
  const acts=r.tagName=='BUTTON'?[r]:[...(ra?ra.querySelectorAll('button'):[])];const gp=r.querySelector('.gp');
  let pr=gp?gp.textContent.trim():'';if(!pr){const pb=acts.find(b=>/🪙|\d/.test(b.textContent));if(pb)pr=(pb.textContent.match(/[\d,]+/)||[''])[0]}
  pr=pr.replace(/🪙/g,'').trim();
  const off=acts.length&&acts.every(b=>b.disabled),poor=!!(gp&&gp.classList.contains('poor'));
  const key=[...r.attributes].concat(acts[0]&&acts[0]!==r?[...acts[0].attributes]:[]).filter(a=>a.name.startsWith('data-')&&a.name!='data-kqt').map(a=>a.name+'='+a.value).join('&')+'|'+nm;
  return {r,nm:kqmEsc(nm),ic:ic||'📦',sub:sm?sm.innerHTML:'',pr,pl:pr?(o.direct?'Sells for ':'Price ')+pr+' 🪙':'',acts,off,poor,key,rc:(r.style.getPropertyValue('--rc')||'').trim()}}
function kqmSlotify(rows,o){rows=rows.filter(r=>r&&!r.closest('.kqm-hold'));if(!rows.length)return;o=o||{};const ctx=o.ctx||'x';
  const runs=[];rows.forEach(r=>{const L=runs[runs.length-1],prev=L&&L[L.length-1];let q=r.previousElementSibling;while(q&&q!==prev&&!q.offsetParent&&q.classList.contains('kqm-hold'))q=q.previousElementSibling;
    if(L&&prev.parentElement===r.parentElement&&q===prev)L.push(r);else runs.push([r])});
  const cells=[];
  runs.forEach(rs=>{const p=rs[0].parentElement;const grid=document.createElement('div');grid.className='kqm-grid kqm-shopg';const hold=document.createElement('div');hold.className='kqm-hold';
    p.insertBefore(grid,rs[0]);grid.after(hold);
    rs.forEach(r=>{const I=kqmRowInfo(r,o);hold.appendChild(r);if(!I)return;if(o.info)o.info(I);
      const c=document.createElement('button');c.type='button';c.className='kqm-cell'+(I.off?' kqm-off':'')+(I.poor?' kqm-poor':'')+(o.selCls&&r.classList.contains(o.selCls)?' kqm-sel':'');c.dataset.kqt='x';
      c.innerHTML=`<span class="kqm-slot" style="--rc:${I.rc||'rgba(255,255,255,.16)'}"><span class="kqm-ic">${I.ic}</span>${I.badge||''}${I.own!=null&&I.own>0?`<span class="kqm-ct">${I.own}</span>`:''}</span><span class="kqm-pr">${I.pr?kqmShort(I.pr)+' 🪙':I.tag||'—'}</span>`;
      I.hint=o.direct?(o.dhint||'Click to select'):(KQM.touch?'Tap to select, then use the button below':'Click to select · double-click to buy');
      KQM.wm.set(c,I);c._kq=I;grid.appendChild(c);cells.push(c);
      if(o.direct)c.addEventListener('click',()=>r.click());
      else{c.addEventListener('click',()=>{KQM.sel[ctx]=I.key;if(r.dataset.msel&&!r.classList.contains('on')){r.click();return}kqmBuyBar(cells,o)});
        c.addEventListener('dblclick',()=>{const a=I.acts.find(b=>!b.disabled&&b!==r)||(r.tagName=='BUTTON'&&!r.disabled?r:null);if(a){kqmTipHide();a.click()}})}})});
  if(!o.direct)kqmBuyBar(cells,o)}
function kqmBuyBar(cells,o){const ctx=o.ctx,host=o.bar;if(!host)return;let bar=host.querySelector(':scope > .kqm-bbar');if(!bar){bar=document.createElement('div');bar.className='kqm-bbar';host.appendChild(bar)}
  const c=cells.find(x=>x._kq.key==KQM.sel[ctx]);cells.forEach(x=>x.classList.toggle('on',x===c));
  if(!c){bar.innerHTML=`<span class="mut">${o.empty||'Select an item to buy it.'}</span>`;return}const I=c._kq;
  const acts=I.acts.length?I.acts:[];bar.innerHTML=`<span class="kqm-bn"><span class="kqm-ic">${I.ic}</span><span><b>${I.nm}</b><small>${I.pl||''}</small></span></span>`+
    acts.map((b,i)=>{const tx=b.textContent.trim(),lab=b===I.r||!tx||/🪙|^\d/.test(tx)?(o.buy||'Buy'):/^×/.test(tx)?'Buy '+tx:tx;return `<button class="${i==0?'pri':''}" data-kqa="${i}" ${b.disabled?'disabled':''}>${kqmEsc(lab)}</button>`}).join('');
  bar.querySelectorAll('[data-kqa]').forEach(x=>x.addEventListener('click',()=>{const a=acts[+x.dataset.kqa];if(a&&!a.disabled){kqmTipHide();a.click()}}))}
const kqmShort=p=>{const n=+String(p).replace(/[^\d]/g,'');return n>=10000?(+(n/1000).toFixed(n<100000?1:0))+'k':String(p)};
const kqmRows=(root,sel)=>root?[...root.querySelectorAll(sel||'.rw')]:[];
// Trading Post (#shop): buy list and the multi-sell list
{const f=rS;rS=function(){const r=f.apply(this,arguments);try{
    kqmSlotify(kqmRows($('sb')),{ctx:'sb',bar:$('sb'),empty:'Select something to buy. Hover a slot to compare it with your gear.',info:I=>{const d=I.r.dataset;
      if(d.b&&d.b[0]=='g'&&typeof stock2!='undefined'&&stock2){const it=stock2.gear[+d.b.slice(1)];I.item=()=>it;if(it){I.rc=RAR[it.r][1];I.ic=icoOf(it)}}
      if(d.b=='e'&&typeof stock2!='undefined'&&stock2&&stock2.egg){const eg=stock2.egg;I.egg=()=>eg;I.ic='🥚';I.rc=RAR[eg.tier][1]}
      if(d.b2)I.own=cnt(d.b2);if(d.b=='pot')I.own=pots;if(d.b=='up'){try{const k=UPM[townTier()-1][0];I.own=mats[k]||0}catch(_){}}}});
    kqmSlotify(kqmRows($('ss')),{ctx:'ss',direct:1,selCls:'sel',dhint:'Click to select it for selling',info:I=>{const k=I.r.dataset.sk||'',t=k[0],id=+k.slice(1);
      if(t=='g'){const it=gear.find(x=>x.id==id);I.item=()=>it;if(it){I.ic=icoOf(it);if(it.up)I.badge=`<span class="kqm-up">+${it.up}</span>`}}
      if(t=='e'){const eg=eggs.find(x=>x.id==id);I.egg=()=>eg;I.ic='🥚'}
      if(t=='s'&&SUP[k.slice(1)])I.ic=SUP[k.slice(1)].i}});
    const ss=$('ss'),bar=ss&&ss.querySelector('.sellbar');if(bar)ss.appendChild(bar)}catch(err){console.warn('kqm shop',err)}return r}}
// Magic Shop (#mshop)
{const f=rMS;rMS=function(){const r=f.apply(this,arguments);try{kqmSlotify(kqmRows($('mst')),{ctx:'ms',bar:$('mst'),info:I=>{const k=(I.acts[0]&&I.acts[0].dataset.ms)||'';
  if(k[0]=='e'&&typeof mstock!='undefined'&&mstock){const eg=mstock.eggs[+k.slice(1)];if(eg){I.egg=()=>eg;I.ic='🥚';I.rc=RAR[eg.tier][1]}}
  if(k[0]=='u'){try{const u=UPM[+k.slice(1)];I.own=mats[u[0]]||0}catch(_){}}}})}catch(err){console.warn('kqm mshop',err)}return r}}
// Curio Merchant and Rune Sage (XR.visitor), Stable (XR.stable), hearth / alchemy market (XR.cook / XR.alch)
{const f=XR.visitor;XR.visitor=function(){const r=f.apply(this,arguments);try{if(xwArg=='merchant'||xwArg=='sage'){const B=$('xwB');
  kqmSlotify(kqmRows(B).filter(x=>x.querySelector('[data-vbuy],[data-vrune]')),{ctx:'v'+xwArg,bar:B,info:I=>{const a=I.acts[0];if(!a)return;
    if(a.dataset.vrune){I.own=cnt(a.dataset.vrune);I.rc='#7a5cff'}
    if(a.dataset.vbuy!=null){try{const q=visStock()[+a.dataset.vbuy];if(q){if(q.k=='egg'){I.ic='🥚';I.sub='A mystery egg: you find out what hatches.'}if(q.sold){I.tag='Sold';I.pr=''}if(q.k!='egg'&&q.r&&RUNES[q.r])I.own=cnt(q.r)}}catch(_){}}}})}}catch(err){console.warn('kqm visitor',err)}return r}}
{const f=XR.stable;XR.stable=function(){const r=f.apply(this,arguments);try{const B=$('xwB'),L=B&&B.querySelector('.xcols > div');
  kqmSlotify(kqmRows(B,'[data-msel]'),{ctx:'stable',bar:L,empty:'Select a mount to see it and buy it.',info:I=>{const k=I.r.dataset.msel,D=MOUNTS[k];if(!D)return;I.ic=D.i;I.sub=D.d+'<br>Tier '+D.t+' · speed '+MBASE[D.t-1]+'-'+(MBASE[D.t-1]+6);
    if(mounts.some(m=>m.k==k))I.badge='<span class="kqm-lk">✔</span>'}})}catch(err){console.warn('kqm stable',err)}return r}}
function kqmMarket(){const B=$('xwB');if(!B)return;const sec=[...B.querySelectorAll('.sec')].find(s=>/^market/i.test(s.textContent.trim()));const rs=sec&&sec.nextElementSibling;
  if(rs)kqmSlotify(kqmRows(rs),{ctx:'mkt',bar:rs.parentElement,empty:'Select an ingredient to buy it (×1 or ×5).',info:I=>{const a=I.acts[0];if(a&&a.dataset.ibuy){const k=a.dataset.ibuy;I.own=cnt(k);if(SUP[k]&&SUP[k].d)I.sub=SUP[k].d}}})}
['cook','alch'].forEach(k=>{const f=XR[k];if(f)XR[k]=function(){const r=f.apply(this,arguments);try{kqmMarket()}catch(err){console.warn('kqm market',err)}return r}});

