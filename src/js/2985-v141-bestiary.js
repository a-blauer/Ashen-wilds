// ================= v141: bestiary pages for every enemy (picture, stats, where it lives, drop table) =================
// The Enemies tab is a list (grouped by the zone where each creature first appears) and a page for the selected one.
// A creature's page opens once you have defeated it (the list keeps "Unknown enemy" before that, as it always did).
// Stats come from enStats at the levels of the instances it lives in. Drop chances are worked out from the loot code
// (lootE_base + meat in 0170, the 70% kept by pV6's filter in 0530, the egg rate EGG92.rate, uniques UNQ135_P) with your
// current loot bonus. The picture is a full-body render of the real model on the companion portrait renderer (CPIC.r).
var DEX141={sel:null,where:null,pic:{},q:[],busy:false,W:220,H:190};
// where each enemy lives: instance list per key [{z,k,lo,hi,t,camp}]
function dex141Where(){if(DEX141.where)return DEX141.where;const W2={};
  INSL.forEach((I,r)=>{if(!I.fld)return;const p=PMAP[I.z];const R=typeof n3Ins=='function'&&typeof N3!='undefined'&&N3.on?n3Ins(r):null;
    const add=(k,camp)=>{if(!EN[k])return;const L=W2[k]||(W2[k]=[]);let o=L.find(o=>o.z==I.z&&o.k==I.k);if(!o){o={z:I.z,k:I.k,lo:I.lv[0],hi:I.lv[1],t:p.t,camp:false,roam:false};L.push(o)}if(camp)o.camp=true;else o.roam=true};
    (R?R.L:(BIOEN[p.n]||[])).forEach(k=>add(k,false));
    CAMPS.forEach(C=>{if(C.ig!==r||!C.th||!C.th.mem)return;C.th.mem.forEach(m=>add(m[0],true))})});
  Object.values(W2).forEach(L=>L.sort((a,b)=>a.z-b.z||a.k-b.k));return DEX141.where=W2}
function dex141Keys(){return Object.keys(EN).filter(k=>!k.startsWith('boss'))}
function dex141St(k,l,al){const s=enStats(EN[k],l,al,0);return {hp:Math.round(s.hp),pa:Math.round(s.pa),ma:Math.round(s.ma),pd:Math.round(s.pd),md:Math.round(s.md)}}
function dex141Pct(p){if(p>=.995)return '100%';if(p<=0)return '—';if(p<.001)return '1 in '+Math.round(1/p).toLocaleString();const v=p*100;return (v<1?v.toFixed(2):v<10?v.toFixed(1):Math.round(v))+'%'}
// the drop table at level l, zone tier T (normal and elite)
function dex141Drops(k,l,T,z){const E=EN[k],fam=E.fam||'Beast',lk=1+((typeof HS=='function'&&HS().loot)||0),keep=.7,eg=typeof EGG92!='undefined'?EGG92.rate:1;
  const gb=1+([0,.1,.2,.3][typeof shL=='function'?shL('treas'):0]||0),g0=(3+l*1.4)*.65*gb;
  const rows=[['🪙','Gold',Math.round(g0*.7)+'–'+Math.round(g0*1.3),Math.round(g0*3*.7)+'–'+Math.round(g0*3*1.3)],
    ['⚔️','Gear (any slot, rolled at its level)',dex141Pct(.035*lk*keep),dex141Pct(Math.min(1,.3*lk)*keep)+' <small>uncommon+</small>'],
    ['🥚','Tier '+T+' egg (random family)',dex141Pct(.04*lk*keep*eg),dex141Pct(.12*lk*keep*eg)],
    [UPM[T-1][1],UPM[T-1][0],dex141Pct(.1*lk*keep),dex141Pct(.5*lk*keep)+' <small>×1–3</small>'],
    [(FAMD[fam]&&FAMD[fam].mi)||'🧩',(FAMD[fam]&&FAMD[fam].mat)||'Family part',dex141Pct(.18*lk*keep)+' <small>×1–2</small>',dex141Pct(.6*lk*keep)+' <small>×2–4</small>']];
  if(['Beast','Sky','Dragon','Earth'].includes(fam))rows.push(['🍖','Raw meat',dex141Pct(.1*keep),dex141Pct(.25*keep)]);
  rows.push(['🧪','Health potion',dex141Pct(.06*lk*keep),dex141Pct(.06*lk*keep)]);
  if(z!=null&&typeof UNQ135_ZK!='undefined'&&UNQ135_ZK[z]){const lu=1+Math.min(1,((typeof HS=='function'&&HS().loot)||0));
    rows.push(['✦','Unique of '+PMAP[z].n+': '+UNQ135_ZK[z].map(q=>UNQ135[q].n).join(', '),dex141Pct(UNQ135_P.kill*lu),dex141Pct(UNQ135_P.elite*lu)])}
  return rows}
// full-body picture, rendered one at a time in the background
function dex141Pic(k){if(DEX141.pic[k]!==undefined)return DEX141.pic[k];DEX141.pic[k]=null;DEX141.q.push(k);dex141Pump();return null}
function dex141Pump(){if(DEX141.busy||!DEX141.q.length)return;DEX141.busy=true;setTimeout(()=>{const k=DEX141.q.shift();
  try{DEX141.pic[k]=dex141Make(k)||''}catch(e){console.warn('dex pic',k,e);DEX141.pic[k]=''}
  DEX141.busy=false;try{const im=document.querySelectorAll('#xwB [data-dexpic="'+k+'"]');im.forEach(el=>{if(DEX141.pic[k])el.innerHTML='<img src="'+DEX141.pic[k]+'" alt="">'})}catch(_){}
  dex141Pump()},30)}
function dex141Make(k){if(!cpicInit())return null;const c=enemyC(k,10,{});const m=cr(c);if(!m)return null;const R=CPIC.r,W=DEX141.W,H=DEX141.H,cv=R.domElement;
  m.position.set(0,0,0);m.rotation.set(0,0,0);CPIC.sc.add(m);
  try{try{if(m.rig)m.rig(0,false,0)}catch(_){}m.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(m),sz=box.getSize(new THREE.Vector3()),ctr=box.getCenter(new THREE.Vector3());
    const r=Math.max(sz.y*.62,Math.hypot(sz.x,sz.z)*.5,.3),dist=r/Math.tan(15*Math.PI/180)*1.05;
    R.setSize(W,H,false);CPIC.cam.aspect=W/H;CPIC.cam.updateProjectionMatrix();
    CPIC.cam.position.set(ctr.x+dist*.55,ctr.y+dist*.22,ctr.z+dist*.8);CPIC.cam.lookAt(ctr);R.render(CPIC.sc,CPIC.cam);return cv.toDataURL('image/png')}
  finally{CPIC.sc.remove(m);R.setSize(112,112,false);CPIC.cam.aspect=1;CPIC.cam.updateProjectionMatrix()}}
function dex141Mv(n){const M=typeof MV!='undefined'&&MV[n];const nm=M&&(M.nm||M.n);return nm&&typeof nm=='string'?nm:String(n).replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,s=>s.toUpperCase())}
function dex141Page(k){const E=EN[k],n=kills[k]||0,Wh=dex141Where()[k]||[],F=FAMD[E.fam]||{};
  if(!n)return `<div class="d141-page d141-unk"><div class="d141-pic">❔</div><b>Unknown enemy</b><p class="mut">Defeat one to learn its stats and what it drops.</p></div>`;
  const pic=dex141Pic(k),w0=Wh[0],lo=w0?w0.lo:1,hi=w0?Wh.reduce((a,o)=>Math.max(a,o.hi),0):1,T=w0?w0.t:1,z=w0?w0.z:null;
  const s0=dex141St(k,lo,0),s1=dex141St(k,hi,0),se=dex141St(k,hi,1),SN=[['hp','Health'],['pa','Phys. attack'],['ma','Magic attack'],['pd','Phys. defense'],['md','Magic defense']];
  const wt=E.w||{},hint=q=>{const v=wt[q]||1;return v>=1.15?'<em class="hi">high</em>':v<=.75?'<em class="lo">low</em>':''};
  const where=Wh.length?Wh.map(o=>`${PMAP[o.z].n} ${['I','II','III'][o.k]} <small>Lv ${o.lo}–${o.hi}${o.camp&&!o.roam?' · camps':o.camp?' · roams + camps':''}</small>`).join('<br>'):'<span class="mut">Not found in the zones any more.</span>';
  const mv=(E.moves||[]).map(dex141Mv).join(' · ');
  return `<div class="d141-page"><div class="d141-top"><div class="d141-pic" data-dexpic="${k}">${pic?`<img src="${pic}" alt="">`:`<span>${E.e||'❔'}</span>`}</div>
   <div class="d141-id"><b>${E.e||''} ${E.n}</b><div class="mut">${F.i||''} ${E.fam||'—'} · ${E.mt=='m'?'magic':'physical'} attacks${E.ranged?' · ranged':''}</div>
   <div class="d141-kc">${n} defeated${n>=100?' · ★ mastered':n>=25?' · ✔ studied':''}</div>${mv?`<div class="d141-mv"><small>Moves</small> ${mv}</div>`:''}<div class="d141-wh"><small>Lives in</small><br>${where}</div></div></div>
   <div class="d141-sec">Stats</div><table class="d141-t"><thead><tr><th></th><th>Lv ${lo}</th>${hi!=lo?`<th>Lv ${hi}</th>`:''}<th>Elite Lv ${hi}</th></tr></thead><tbody>
   ${SN.map(([q,l])=>`<tr><td>${l} ${hint(q)}</td><td>${s0[q]}</td>${hi!=lo?`<td>${s1[q]}</td>`:''}<td>${se[q]}</td></tr>`).join('')}</tbody></table>
   <div class="d141-sec">Drops <small class="mut">per kill · Lv ${hi}${((typeof HS=='function'&&HS().loot)||0)>0?' · with your +'+Math.round(HS().loot*100)+'% loot':''}</small></div>
   <table class="d141-t d141-d"><thead><tr><th></th><th>Normal</th><th>Elite</th></tr></thead><tbody>
   ${dex141Drops(k,hi,T,z).map(r=>`<tr><td>${r[0]} ${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div>`}
function dex141Tab(){const Wh=dex141Where(),keys=dex141Keys(),grp={};
  keys.forEach(k=>{const o=(Wh[k]||[])[0],g=o?o.z:99;(grp[g]=grp[g]||[]).push(k)});
  Object.values(grp).forEach(L=>L.sort((a,b)=>{const A=(Wh[a]||[])[0],B=(Wh[b]||[])[0];return (A?A.k*100+A.lo:999)-(B?B.k*100+B.lo:999)||EN[a].n.localeCompare(EN[b].n)}));
  if(!DEX141.sel||!EN[DEX141.sel])DEX141.sel=keys.find(k=>kills[k])||keys[0];
  const list=Object.keys(grp).sort((a,b)=>a-b).map(g=>`<div class="d141-g">${g==99?'Elsewhere':PMAP[g].n}</div>`+grp[g].map(k=>{const n=kills[k]||0,E=EN[k];
    return `<button class="d141-r${DEX141.sel==k?' on':''}" data-dex141="${k}" style="--rc:${n>=100?'#fbbf24':n>=25?'#6ee7b7':'transparent'}"><span class="e">${n?E.e:'❔'}</span><span class="n">${n?E.n:'Unknown enemy'}<small>${n?n+' defeated':'not met yet'}</small></span></button>`}).join('')).join('');
  return `<div class="d141"><div class="d141-l">${list}</div>${dex141Page(DEX141.sel)}</div>`}
{const f=XR.dex;XR.dex=function(){const r=f.apply(this,arguments);try{if(dexTab!='en')return r;const B=$('xwB'),T=B.querySelector('.dexT');B.innerHTML=(T?T.outerHTML:'')+dex141Tab();
  const F=$('xwF');if(F&&!/Pick an enemy/.test(F.textContent))F.insertAdjacentHTML('afterbegin','<span class="mut dtl">Pick an enemy to see its page. </span>')}catch(e){console.warn('dex141',e)}return r}}
$('xw').addEventListener('click',e=>{if(xwMode!='dex')return;const t=e.target.closest('[data-dex141]');if(!t)return;e.stopImmediatePropagation();DEX141.sel=t.dataset.dex141;rX()},true);
document.head.insertAdjacentHTML('beforeend',`<style id="dex141css">
#xw .d141{display:grid;grid-template-columns:minmax(170px,230px) 1fr;gap:12px;align-items:start}
#xw .d141-l{max-height:min(60vh,560px);overflow:auto;display:flex;flex-direction:column;gap:3px;padding-right:4px}
#xw .d141-g{font:700 .68rem/1 var(--kq-head,serif);letter-spacing:.08em;text-transform:uppercase;color:#c9a24a;margin:8px 0 3px}
#xw .d141-r{flex:none;height:auto;min-height:38px;line-height:1.2;white-space:normal;display:flex;gap:8px;align-items:center;text-align:left;padding:5px 8px;border-left:3px solid var(--rc);background:rgba(0,0,0,.18);border-radius:6px;min-height:0}
#xw .d141-r.on{background:rgba(201,162,74,.18);outline:1px solid rgba(201,162,74,.55)}
#xw .d141-r .e{font-size:1.1rem;width:1.4em;text-align:center}#xw .d141-r .n{display:flex;flex-direction:column;gap:1px;font-weight:700;font-size:.8rem}#xw .d141-r small{font-weight:500;opacity:.7;font-size:.66rem}
#xw .d141-page{min-width:0}#xw .d141-top{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}
#xw .d141-pic{width:220px;height:190px;flex:none;border-radius:10px;background:radial-gradient(ellipse at 50% 60%,rgba(201,162,74,.18),rgba(0,0,0,.45) 70%);border:1px solid rgba(201,162,74,.35);display:flex;align-items:center;justify-content:center;font-size:3rem;overflow:hidden}
#xw .d141-pic img{width:100%;height:100%;object-fit:contain}
#xw .d141-id{flex:1 1 200px;min-width:0;display:flex;flex-direction:column;gap:5px}#xw .d141-id>b{font-size:1.1rem}
#xw .d141-id small{text-transform:uppercase;letter-spacing:.06em;font-size:.62rem;color:#c9a24a}#xw .d141-wh,#xw .d141-mv{font-size:.78rem}
#xw .d141-sec{margin:10px 0 4px;font:700 .72rem/1 var(--kq-head,serif);letter-spacing:.08em;text-transform:uppercase;color:#c9a24a}
#xw .d141-t{width:100%;border-collapse:collapse;font-size:.8rem}#xw .d141-t th{font-size:.66rem;text-align:right;color:#a8957a;font-weight:600;padding:2px 6px}
#xw .d141-t td{padding:3px 6px;border-top:1px solid rgba(255,255,255,.06);text-align:right}#xw .d141-t td:first-child,#xw .d141-t th:first-child{text-align:left}
#xw .d141-t em{font-style:normal;font-size:.62rem;padding:0 4px;border-radius:4px;margin-left:4px}#xw .d141-t em.hi{background:rgba(110,231,183,.18);color:#6ee7b7}#xw .d141-t em.lo{background:rgba(248,113,113,.15);color:#fca5a5}
#xw .d141-unk{text-align:center;padding:30px}#xw .d141-unk .d141-pic{margin:0 auto 10px}
@media(max-width:640px){#xw .d141{grid-template-columns:1fr}#xw .d141-l{max-height:30vh}#xw .d141-pic{width:100%;height:170px}}
</style>`);

// ---------------- Sovereigns tab: stats and drops of each defeated Sovereign ----------------
function dex141Boss(i){const d=BOSSES[i],fam=famOf(d.sp),F=FAMD[fam]||{},T=Math.max(1,Math.min(5,(PMAP[i]&&PMAP[i].t)||tierOfLv(d.lvl)));
  const s=enStats({w:{hp:.8,pa:1,ma:1,pd:1.05,md:1.05}},d.lvl,0,1),hp=Math.round(s.hp*(typeof PACE!='undefined'?PACE.hp:1));
  const g0=(3+d.lvl*1.4)*13*.65;
  return `<div class="d141-bs"><span>❤️ ${hp.toLocaleString()} health</span><span>⚔️ ${Math.round(F.mt=='m'?s.ma:s.pa)} ${F.mt=='m'?'magic':'phys.'} attack</span><span>🛡️ ${Math.round(s.pd)} / ${Math.round(s.md)} defense</span></div>
   <div class="d141-bs d141-bd"><b>Drops</b> 🪙 ${Math.round(g0*.7)}–${Math.round(g0*1.3)} · ⚔️ 2 gear (rare or better) · 🥚 Tier ${T} egg · ${UPM[T-1][1]} ${UPM[T-1][0]} ×3–5 · ${F.mi||'🧩'} ${F.mat||'parts'} ×5–8${['Beast','Sky','Dragon','Earth'].includes(fam)?' · 🍖 meat ×2–3':''}</div>`}
{const f=XR.dex;XR.dex=function(){const r=f.apply(this,arguments);try{if(dexTab!='boss')return r;
  $('xwB').querySelectorAll('.rows>.rw').forEach((el,i)=>{if(!BOSSES[i]||!bossDone.has(i))return;const rn=el.querySelector('.rn');if(rn&&!rn.querySelector('.d141-bs'))rn.insertAdjacentHTML('beforeend',dex141Boss(i))})}catch(e){console.warn('dex141 boss',e)}return r}}
document.head.insertAdjacentHTML('beforeend','<style id="dex141b">#xw .d141-bs{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:.74rem;margin-top:3px;font-weight:600}#xw .d141-bd{font-weight:500;opacity:.85}#xw .d141-bd b{color:#c9a24a;font-size:.66rem;text-transform:uppercase;letter-spacing:.06em}</style>');
