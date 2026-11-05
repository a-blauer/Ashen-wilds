// ================= v200: every Bestiary tab gets pages like the creature (enemy) tab =================
// Owner (Nov 5 2026): "Improve the beastiary to make each section look like our creature portion with the mockup and stats and drop
// table where applicable." The Companions, Sovereigns and Fish tabs become a list plus a page (the v141 layout and styles, 2985):
//  * Companions: a full-body picture of the species, its family and tier, base stats at Lv 1 and Lv 50 (an average C-grade
//    companion), its signature ability, evolution levels, where its eggs come from and its fusion material. Unknown species stay
//    hidden until you see an egg of them; full details once tamed.
//  * Sovereigns: picture, where and level, health / attack / defense, and the drop table of a kill.
//  * Fish: picture (the fish's mark), rarity, how often it bites in each zone and what each catch gives.
// Pictures are rendered one at a time on the companion portrait renderer (CPIC), as the v141 enemy pictures are.
var DEX200={sel:{cre:null,boss:null,fish:null},pic:{},q:[],busy:false};
function dex200Pic(key,mk){if(DEX200.pic[key]!==undefined)return DEX200.pic[key];DEX200.pic[key]=null;DEX200.q.push([key,mk]);dex200Pump();return null}
function dex200Pump(){if(DEX200.busy||!DEX200.q.length)return;DEX200.busy=true;setTimeout(()=>{const [k,mk]=DEX200.q.shift();
  try{DEX200.pic[k]=dex200Shot(mk())||''}catch(e){console.warn('dex200 pic',k,e);DEX200.pic[k]=''}
  DEX200.busy=false;try{document.querySelectorAll('#xwB [data-dex200pic="'+k+'"]').forEach(el=>{if(DEX200.pic[k])el.innerHTML='<img src="'+DEX200.pic[k]+'" alt="">'})}catch(_){}dex200Pump()},30)}
function dex200Shot(m){if(!m||!cpicInit())return null;const R=CPIC.r,W=DEX141.W,H=DEX141.H;m.position.set(0,0,0);m.rotation.set(0,0,0);CPIC.sc.add(m);
  try{try{if(m.rig)m.rig(0,false,0)}catch(_){}m.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(m),sz=box.getSize(new THREE.Vector3()),ctr=box.getCenter(new THREE.Vector3());
    const r=Math.max(sz.y*.62,Math.hypot(sz.x,sz.z)*.5,.3),dist=r/Math.tan(15*Math.PI/180)*1.05;R.setSize(W,H,false);CPIC.cam.aspect=W/H;CPIC.cam.updateProjectionMatrix();
    CPIC.cam.position.set(ctr.x+dist*.55,ctr.y+dist*.22,ctr.z+dist*.8);CPIC.cam.lookAt(ctr);R.render(CPIC.sc,CPIC.cam);return R.domElement.toDataURL('image/png')}
  finally{CPIC.sc.remove(m);R.setSize(112,112,false);CPIC.cam.aspect=1;CPIC.cam.updateProjectionMatrix()}}
function dex200PicBox(key,mk,fallback,cls){const p=mk?dex200Pic(key,mk):null;return `<div class="d141-pic${cls?' '+cls:''}" data-dex200pic="${key}">${p?`<img src="${p}" alt="">`:`<span>${fallback}</span>`}</div>`}
// the list on the left (v141 look)
function dex200List(groups,tab){return '<div class="d141-l">'+groups.map(g=>`<div class="d141-g">${g.n}</div>`+g.L.map(o=>`<button class="d141-r${DEX200.sel[tab]==o.k?' on':''}" data-dex200="${tab}:${o.k}" style="--rc:${o.rc||'transparent'}"><span class="e">${o.ic}</span><span class="n">${o.n}<small>${o.sub}</small></span></button>`).join('')).join('')+'</div>'}
function dex200Tbl(head,rows){return `<table class="d141-t"><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`}
var DEX200_SN=[['hp','Health'],['pa','Phys. attack'],['ma','Magic attack'],['pd','Phys. defense'],['md','Magic defense']];
// ---------------- Companions ----------------
function dex200SpC(n,l){const c=mkC(n,l,0,'',{hp:1,a:1,d:1});c.tr='';c.mods=[];return c}
function dex200SpPage(n){const q=SP2[n],own=dex.own.has(n),seen=own||dex.egg.has(n),fam=q[0],F=FAMD[fam]||{},T=q[1];
  if(!seen)return `<div class="d141-page d141-unk"><div class="d141-pic">❔</div><b>Unknown companion</b><p class="mut">Find an egg of it, or tame one, to learn about it.<br>${F.i||''} ${fam} family · Tier ${T}</p></div>`;
  const c1=dex200SpC(n,1),c50=dex200SpC(n,MAXLV),st=k=>[Math.round(cStat(c1,k)),Math.round(cStat(c50,k))],w=F.w||{},hint=k=>{const v=w[k]||1;return v>=1.15?'<em class="hi">high</em>':v<=.75?'<em class="lo">low</em>':''};
  const sp=(c1.sp||[]).map(s=>CSP[s]?`${CSP[s].i||''} <b>${s}</b> <span class="mut" style="font-size:.74rem">${CSP[s].d||''}${CSP[s].cd?' · '+CSP[s].cd+'s cooldown':''}</span>`:s).join('<br>');
  const zones=PMAP.map((p,i)=>p.t==T?p.n:null).filter(Boolean);
  return `<div class="d141-page"><div class="d141-top">${dex200PicBox('sp:'+n,()=>cr(dex200SpC(n,1)),q[3])}
    <div class="d141-id"><b>${q[3]} ${n}</b><div class="mut">${F.i||''} ${fam} family · Tier ${T} · ${F.mt=='m'?'magic':'physical'} attacks</div>
    <div class="d141-kc">${own?'✔ Tamed':'🥚 Egg seen — tame one for the full page'}</div><div class="d141-mv"><small>Signature ability</small><br>${sp||'—'}</div>
    <div class="d141-wh"><small>Eggs found</small><br>${zones.length?zones.join(', ')+' (Tier '+T+' zones)':'Tier '+T+' zones'} · Magic Shop and Curio Shop eggs of your tier</div></div></div>
    ${F.d?`<p class="mut" style="font-size:.78rem;margin:8px 0 0">${F.d}</p>`:''}
    <div class="d141-sec">Stats <small class="mut">an average (grade C) ${n}, before traits and gear</small></div>
    ${own?dex200Tbl(['','Lv 1','Lv '+MAXLV],DEX200_SN.map(([k,l])=>{const v=st(k);return [l+' '+hint(k),v[0],v[1]]})):'<p class="mut" style="font-size:.78rem">Tame one to see its stats.</p>'}
    <div class="d141-sec">Growth and fusion</div>${dex200Tbl(['',''],[['Evolves at','Lv '+EVLV.join(' · Lv ')],['Fusion material',(F.mi||'🧩')+' '+(F.mat||'—')],['Family speed',(F.spd||1)+'×']])}</div>`}
function dex200SpTab(){const groups=FAMK.map(f=>({n:FAMD[f].i+' '+f,L:SPK.filter(n=>SP2[n][0]==f).sort((a,b)=>SP2[a][1]-SP2[b][1]).map(n=>{const own=dex.own.has(n),seen=own||dex.egg.has(n);
    return {k:n,ic:seen?SP2[n][3]:'❔',n:seen?n:'???',sub:'Tier '+SP2[n][1]+(own?' · ✔ tamed':seen?' · egg seen':''),rc:own?'#6ee7b7':seen?'#c9a24a':'transparent'}})}));
  if(!DEX200.sel.cre||!SP2[DEX200.sel.cre])DEX200.sel.cre=SPK.find(n=>dex.own.has(n))||SPK[0];
  return `<div class="d141">${dex200List(groups,'cre')}${dex200SpPage(DEX200.sel.cre)}</div>`}
// ---------------- Sovereigns ----------------
function dex200BossModel(i){const k='boss'+i;if(!EN[k])return null;const c=enemyC(k,BOSSES[i].lvl,{boss:1});return cr(c)}
function dex200BossPage(i){const d=BOSSES[i],done=bossDone.has(i),P=PMAP[i]||{};
  if(!done)return `<div class="d141-page d141-unk"><div class="d141-pic">❔</div><b>Undefeated Sovereign</b><p class="mut">It waits in the Sovereign's Den at the end of ${P.n||'its zone'} (Lv ${d.lvl}). Defeat it to fill this page.</p></div>`;
  const E=EN['boss'+i],fam=(E&&FAMD[E.fam]?E.fam:famOf(d.sp)),F=FAMD[fam]||{},T=Math.max(1,Math.min(5,P.t||tierOfLv(d.lvl))),s=enStats({w:{hp:.8,pa:1,ma:1,pd:1.05,md:1.05}},d.lvl,0,1),hp=Math.round(s.hp*(typeof PACE!='undefined'?PACE.hp:1)),g0=(3+d.lvl*1.4)*13*.65;
  const drops=[['🪙 Gold',Math.round(g0*.7)+'–'+Math.round(g0*1.3)],['⚔️ Gear (rare or better)','2'],['🥚 Tier '+T+' egg','1'],[UPM[T-1][1]+' '+UPM[T-1][0],'3–5'],[(F.mi||'🧩')+' '+(F.mat||'Family parts'),'5–8']];
  if(['Beast','Sky','Dragon','Earth'].includes(fam))drops.push(['🍖 Raw meat','2–3']);
  return `<div class="d141-page"><div class="d141-top">${dex200PicBox('bs:'+i,()=>dex200BossModel(i),d.i||'👑')}
    <div class="d141-id"><b>${d.i||'👑'} ${d.name}</b><div class="mut">${F.i||''} ${fam} · Lv ${d.lvl}</div><div class="d141-kc">✔ Defeated</div>
    <div class="d141-wh"><small>Lair</small><br>The Sovereign's Den of ${P.n||'—'}</div><div class="d141-wh"><small>Posture</small><br>Fill its posture bar to stagger it (+35% damage taken).</div></div></div>
    <div class="d141-sec">Stats</div>${dex200Tbl(['','Lv '+d.lvl],[['Health',hp.toLocaleString()],['Phys. attack',Math.round(s.pa)],['Magic attack',Math.round(s.ma)],['Phys. defense',Math.round(s.pd)],['Magic defense',Math.round(s.md)]])}
    <div class="d141-sec">Drops <small class="mut">every kill</small></div>${dex200Tbl(['','Amount'],drops)}</div>`}
function dex200BossTab(){const L=BOSSES.map((B,i)=>{const d=bossDone.has(i);return {k:String(i),ic:d?B.i||'👑':'❔',n:d?B.name:'Undefeated Sovereign',sub:((PMAP[i]||{}).n||'')+' · Lv '+B.lvl+(d?' · ✔ defeated':''),rc:d?'#6ee7b7':'transparent'}});
  if(DEX200.sel.boss==null||!BOSSES[+DEX200.sel.boss])DEX200.sel.boss=String([...bossDone][0]||0);
  return `<div class="d141">${dex200List([{n:'Sovereigns',L}],'boss')}${dex200BossPage(+DEX200.sel.boss)}</div>`}
// ---------------- Fish ----------------
var DEX200_RAR=['Common','Uncommon','Rare','Legendary'],DEX200_RC=['#a8a8a8','#5fcf6a','#5a96ff','#ff9a2a'];
function dex200FishOdds(f,T){const pool=FISH.filter(q=>q[2]<=T);if(!pool.includes(f))return 0;const w=q=>[8,3,1,.15][q[3]]*(q[2]==T?1.5:1);return w(f)/pool.reduce((s,q)=>s+w(q),0)}
function dex200FishPage(i){const f=FISH[i],n=fishLog[f[0]]||0;
  if(!n)return `<div class="d141-page d141-unk"><div class="d141-pic">❔</div><b>Unknown fish</b><p class="mut">${DEX200_RAR[f[3]]} · bites in Tier ${f[2]}+ waters. Catch one to fill this page.</p></div>`;
  const zones=PMAP.map((p,z)=>[p,dex200FishOdds(f,p.t)]).filter(q=>q[1]>0);
  return `<div class="d141-page"><div class="d141-top"><div class="d141-pic dex200-fish" style="--rc:${DEX200_RC[f[3]]}"><span>${f[1]}</span></div>
    <div class="d141-id"><b>${f[1]} ${f[0]}</b><div class="mut" style="color:${DEX200_RC[f[3]]}">${DEX200_RAR[f[3]]} · Tier ${f[2]}</div><div class="d141-kc">${n} caught</div>
    <div class="d141-wh"><small>Bites in</small><br>${zones.map(q=>q[0].n).join(', ')}</div></div></div>
    <div class="d141-sec">Bite chance <small class="mut">of each catch at the water</small></div>${dex200Tbl(['Zone','Chance'],zones.map(([p,o])=>[p.n+' <small class="mut">T'+p.t+'</small>',dex141Pct(o)]))}
    <div class="d141-sec">Each catch gives</div>${dex200Tbl(['','Chance'],[['🐟 Fish ×'+(f[3]+1)+' (cooking)','100%'],['🥚 An egg of the zone\'s tier',dex141Pct(f[3]>=2?.08:.012)]].concat(f[3]>=2?[['🔮 A rank I rune','35%']]:[]))}</div>`}
function dex200FishTab(){const L=FISH.map((f,i)=>{const n=fishLog[f[0]]||0;return {k:String(i),ic:n?f[1]:'❔',n:n?f[0]:'???',sub:DEX200_RAR[f[3]]+' · Tier '+f[2]+(n?' · caught '+n:''),rc:n?DEX200_RC[f[3]]:'transparent'}});
  if(DEX200.sel.fish==null||!FISH[+DEX200.sel.fish])DEX200.sel.fish=String(Math.max(0,FISH.findIndex(f=>fishLog[f[0]])));
  return `<div class="d141">${dex200List([{n:'Fish',L}],'fish')}${dex200FishPage(+DEX200.sel.fish)}</div>`}
// ---------------- the tabs ----------------
{const f=XR.dex;XR.dex=function(){const r=f.apply(this,arguments);try{const t=dexTab,fn={cre:dex200SpTab,boss:dex200BossTab,fish:dex200FishTab}[t];if(!fn)return r;
  const B=$('xwB'),T=B.querySelector('.dexT');B.innerHTML=(T?T.outerHTML:'')+fn();
  const F=$('xwF');if(F)F.innerHTML='<span class="mut dtl">Pick an entry to see its page.</span>'}catch(e){console.warn('dex200',e)}return r}}
$('xw').addEventListener('click',e=>{if(xwMode!='dex')return;const t=e.target.closest('[data-dex200]');if(!t)return;e.stopImmediatePropagation();const [tab,k]=t.dataset.dex200.split(':');DEX200.sel[tab]=k;rX()},true);
document.head.insertAdjacentHTML('beforeend',`<style id="dex200css">
#xw .dex200-fish{background:radial-gradient(ellipse at 50% 55%,color-mix(in srgb,var(--rc) 35%,transparent),rgba(10,30,50,.7) 70%);font-size:5rem}
#xw .dex200-fish span{filter:drop-shadow(0 0 12px var(--rc))}
</style>`);
