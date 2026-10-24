// ---------------- inventory ----------------
var icoOf=i=>{const t=itT(i);return t.sl=='weapon'?WTYPE[t.wt].i:SLOTIC[t.sl]};
const itMain=i=>{const s=itStats(i);return s.pa?'PA '+s.pa:s.ma?'MA '+s.ma:s.pd?'PD '+s.pd+(s.md?' · MD '+s.md:''):s.hp?'HP '+s.hp:''};
const itClsTxt=t=>t.cls?CLS[t.cls].n:t.arm?ARMC[t.arm].map(c=>CLS[c].n).join(' & '):'Any class';
const grow=(i,k)=>{const t=itT(i),ok=canUse(i);return `<button class="rw it${selI&&selI.k==k&&selI.id==i.id?' on':''}" data-k="${k}" data-id="${i.id}" style="--rc:${RAR[i.r][1]}"><span class="rn">${icoOf(i)} <span style="color:${RAR[i.r][1]}">${itName(i)}</span><small>${SLOTN[t.sl]}${t.wt?' · '+WTYPE[t.wt].n:t.arm?' · '+t.arm:''} · iLvl ${i.lv}${ok?'':fitsCls(t,hero.cls)?' · <b style="color:#f87171">needs Lv '+i.req+'</b>':' · <b style="color:#f87171">'+itClsTxt(t)+'</b>'}</small></span><span class="ra">${itMain(i)}</span></button>`};
let bagTab2=0;
function rB0_base(){
  $('eqrow').innerHTML=SLOTS.filter(k=>k!='offhand'||hero.cls=='paladin').map(k=>eq[k]?grow(eq[k],'e'):`<div class="rw empty"><span class="rn">${SLOTIC[k]} <span class="mut">${SLOTN[k]} · empty</span></span></div>`).join('');
  const BT=['Gear','Materials','Skills'];
  $('bt').innerHTML=BT.map((n,i)=>`<button data-bt="${i}" class="${i==bagTab2?'on':''}">${n}${i==0&&gear.length?' ('+gear.length+')':''}</button>`).join('');
  let c;
  if(bagTab2==0)c='<div class="rows">'+(gear.slice().sort((a,b)=>(canUse(b)-canUse(a))||b.r-a.r).map(i=>grow(i,'g')).join('')||'<div class="mut" style="padding:8px">No gear in your bag. Monsters drop gear for your class; elites and bosses drop the best.</div>')+'</div>';
  else if(bagTab2==1){
    const row=k=>`<div class="mi"><span>${matInfo(k)[1]} ${matInfo(k)[0]}</span><b>×${mats[k]}</b></div>`,up=UPM.map(u=>u[0]).filter(k=>mats[k]>0),fm=FAMK.map(f=>FAMD[f].mat).filter(k=>mats[k]>0),rs=Object.keys(RES).filter(k=>mats[k]>0);
    const sec=(t,a)=>a.length?`<div class="sec">${t}</div><div class="mgrid">${a.join('')}</div>`:'';
    c=sec('Upgrade materials',up.map(row))+sec('Companion materials (evolution)',fm.map(row))+sec('Gathered',rs.map(row))+sec('Realm items',Object.keys(have).filter(k=>have[k]>0&&ITEMS[k]).map(k=>`<div class="mi"><span>${ITEMS[k].i} ${ITEMS[k].n}</span><b>×${have[k]}</b></div>`))||'<div class="mut" style="padding:8px">Chop trees, mine rocks, forage plants and defeat monsters for materials.</div>';
  }else c='<div class="rows">'+heroSkills().map((k,i)=>`<div class="rw" style="--rc:${hero.lvl>=k.lv?'#c9a24a':'transparent'}"><span class="rn">${k.i} <b>${k.n}</b> <span class="mut">key ${i+1}</span><small>${k.d} · ${k.mp} mana · ${k.cd}s cooldown</small></span><span class="ra">${hero.lvl>=k.lv?'<em>Ready</em>':'<small>🔒 Lv '+k.lv+'</small>'}</span></div>`).join('')+'</div>';
  $('bl').innerHTML=c;$('idt').innerHTML=idHTML();
}
function idHTML_base(){
  if(!selI)return '<span class="mut dtl">Select an item to inspect it. Green and red compare it with what you have equipped. Upgrade items at any town.</span>';
  const it=selI.k=='e'?SLOTS.map(k=>eq[k]).find(x=>x&&x.id==selI.id):gear.find(x=>x.id==selI.id);if(!it){selI=null;return idHTML()}
  const t=itT(it),cur=selI.k=='e'?null:eq[t.sl],a=itStats(it),b=cur?itStats(cur):{},keys=[...new Set([...Object.keys(a),...Object.keys(b)])];
  const rows=keys.map(k=>{const nv=a[k]||0,ov=b[k]||0,d=nv-ov,fl=['pa','ma','pd','md','hp','mp'].includes(k),F=v=>fl?Math.round(v):(+(v*100).toFixed(1))+'%';return `<span>${SNM[k]||k} <b>${F(nv)}</b>${selI.k=='e'?'':` <i style="font-style:normal;color:${d>0?'#6ee7b7':d<0?'#f87171':'#8fa0b4'}">${d>0?'+':''}${F(d)}</i>`}</span>`}).join('');
  const uc=upCost(it),ok=canUse(it);
  return `<div class="dtl"><div class="dh"><span style="color:${RAR[it.r][1]}">${icoOf(it)} ${itName(it)}</span> <small>${RAR[it.r][0]} ${SLOTN[t.sl]} · ${TIERN[t.t]} · iLvl ${it.lv} · requires Lv ${it.req} · ${itClsTxt(t)}${selI.k=='e'?'':' · vs '+(cur?itName(cur):'empty slot')}</small></div><div class="dfs">${rows}</div>
   <div class="mut" style="font-size:.72rem;margin-top:4px">${(it.up||0)>=10?'Fully upgraded (+10).':`Upgrade to +${(it.up||0)+1}: ${matInfo(uc.m)[1]} ${uc.n}× ${uc.m} (have ${mats[uc.m]||0}) · 🪙 ${uc.g} · ${Math.round(uc.ch*100)}% success`}</div></div>
   <div style="display:flex;gap:6px">${(it.up||0)<10&&typeof KQM_SMITH!='undefined'&&KQM_SMITH?'<button id="idUp">⚒️ Upgrade</button>':''}<button class="pri" id="idAct" ${selI.k=='g'&&!ok?'disabled':''}>${selI.k=='e'?'Unequip':ok?'Equip':'Cannot equip'}</button></div>`;
}
function invAct(){
  if(!selI)return;
  if(selI.k=='e'){const k=SLOTS.find(x=>eq[x]&&eq[x].id==selI.id);if(k){gear.push(eq[k]);delete eq[k]}selI=null}
  else{const i=gear.findIndex(g=>g.id==selI.id);if(i<0)return;const it=gear[i];if(!canUse(it))return;const sl=eqSlot135(it);gear.splice(i,1);if(eq[sl])gear.push(eq[sl]);eq[sl]=it;selI={k:'e',id:it.id}}
  hsDirty();hero.hp=Math.min(hero.hp,heroMax());refreshGear();if(HP)refreshGear(HP);rB();hud();
}
function bagStats(){
  const s=HS(),C=CLS[hero.cls],kv=(l,v,t)=>`<div class="kv"${t?' title="'+t+'"':''}><span>${l}</span><b>${v}</b></div>`,p=v=>(+(v*100).toFixed(1))+'%';
  $('hs').innerHTML=kv('Class',C.i+' '+C.n)+kv('Level',hero.lvl+' · '+(hero.lvl>=MAXLV?'max':hero.xp+'/'+needH(hero.lvl)+' XP'))+kv('Health',Math.round(s.hp))+kv('Mana',Math.round(s.mp))+kv('Physical attack',Math.round(s.pa))+kv('Magical attack',Math.round(s.ma))+kv('Physical defense',Math.round(s.pd))+kv('Magical defense',Math.round(s.md))+
    kv('Critical hit',p(s.crit)+' · ×'+(1+s.cdm).toFixed(2))+kv('Attack speed','+'+p(s.as))+(s.ls?kv('Lifesteal',p(s.ls)):'')+(s.dr?kv('Damage reduction',p(Math.min(.75,s.dr))):'')+(s.blockC?kv('Block chance',p(s.blockC)):'')+kv('Dash charges',s.dash)+(s.loot?kv('Loot find','+'+p(s.loot)):'')+(s.xp?kv('XP bonus','+'+p(s.xp)):'')+kv('Gold','🪙 '+gold)+kv('Potions','🧪 ×'+pots)+kv('Woodcutting','Lv '+skills.wood.l)+kv('Mining','Lv '+skills.mine.l);
}
$('bag').addEventListener('click',e=>{
  if(e.target.id=='idUp'){e.stopImmediatePropagation();const it=selI&&(selI.k=='e'?SLOTS.map(k=>eq[k]).find(x=>x&&x.id==selI.id):gear.find(x=>x.id==selI.id));if(it){doUpgrade(it);if(selI.k=='e'){refreshGear();if(HP)refreshGear(HP)}rB()}return}
  const t=e.target.closest('[data-bt]');if(t){e.stopImmediatePropagation();bagTab2=+t.dataset.bt;rB0()}
},true);
// ---------------- talents window ----------------
let talSel=null;
function rTal(){
  const T=TAL[hero.cls],tp=tpFree();$('talSub').textContent=CLS[hero.cls].i+' '+CLS[hero.cls].n+' · '+tp+' point'+(tp==1?'':'s')+' to spend · 1 point per level';
  $('talT').innerHTML=T.map((br,bi)=>{const sp=talSpent(bi);return `<div class="talc"><div class="talh">${br.i} ${br.n} <small>${sp} pts</small></div>`+br.t.map((t,ri)=>{const r=talRank(t[0]),lock=sp<ri*3,mx=r>=t[3];
    return `<button class="taln${lock?' lk':''}${r?' has':''}${mx?' mx':''}${talSel==t[0]?' on':''}" data-t="${t[0]}" data-b="${bi}" data-r="${ri}"><span class="ti">${t[2]}</span><span class="tn">${t[1]}</span><span class="tr">${r}/${t[3]}</span></button>`}).join('')+'</div>'}).join('');
  const t=talSel&&T.flatMap(b=>b.t).find(x=>x[0]==talSel);
  if(t){const r=talRank(t[0]),k=Object.keys(t[5])[0],v=t[5][k],fmt=x=>Math.abs(v)<1?(+(x*100).toFixed(1)):x;const ri=T.findIndex(b=>b.t.includes(t)),row=T[ri].t.indexOf(t);
    $('talInfo').innerHTML=`<b>${t[2]} ${t[1]}</b> (${r}/${t[3]}) — ${t[4].replace('#',fmt(v*Math.max(1,r)))}${r<t[3]?' · next rank: '+t[4].replace('#',fmt(v*(r+1))):''}${talSpent(ri)<row*3?' · <span style="color:#f87171">needs '+row*3+' points in '+T[ri].n+'</span>':''}`}
  else $('talInfo').textContent='Click a talent to see it, click again to learn a rank. Each row unlocks after 3 points in the rows above it.';
  $('talReset').textContent='Reset (🪙 '+(40*hero.lvl)+')';
}
function openTal(){if(uiOpen())return;if(!party.length)return;talSel=null;rTal();$('tal').classList.remove('hide')}
$('talClose').onclick=()=>$('tal').classList.add('hide');
$('talT').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;const id=b.dataset.t,T=TAL[hero.cls],t=T[+b.dataset.b].t[+b.dataset.r];
  if(talSel!=id){talSel=id;rTal();return}
  if(tpFree()<1)return say('No talent points left. You earn one each level.');if(talRank(id)>=t[3])return;if(talSpent(+b.dataset.b)<(+b.dataset.r)*3)return say('Spend more points higher in this branch first.');
  hero.tal[id]=talRank(id)+1;hsDirty();hero.hp=Math.min(hero.hp,heroMax());rTal();hud()};
$('talReset').onclick=()=>{const c=40*hero.lvl;if(!talSpent())return;if(gold<c)return say('Resetting talents costs '+c+' gold.');gold-=c;hero.tal={};hsDirty();hero.hp=Math.min(hero.hp,heroMax());rTal();hud();say('Your talents were reset.')};
// ---------------- companions ----------------
const famT=c=>{const f=famOf(c.g[0]);return FAMD[f].i+' '+f+' · Tier '+tierSp(c.g[0])};
const modChips=c=>(c.mods||[]).map(m=>`<span class="mod" title="${MODS[m].d}">${MODS[m].i} ${m}</span>`).join(' ')||'<span class="mut">none</span>';
function card(c,i,on){return `<button class="card${on?' lead':''}" data-i="${i}"><b>${nm(c)}</b><span class="bar"><i style="width:${100*c.h/M(c)}%"></i></span><small>${famT(c)} · HP ${Math.round(c.h)}/${M(c)}</small><br><small>${(c.mods||[]).map(m=>MODS[m].i+' '+m).join(' ')}</small> ${i<2?'<small style="color:var(--acc)">● Active '+(i+1)+'</small>':''}</button>`}
function evoCost(c){const e=c.evo||0,T=tierOfLv(EVLV[e]||50)-1;return {lv:EVLV[e],fm:FAMD[famOf(c.g[0])].mat,fn:[12,24,40][e],um:UPM[T][0],un:[3,6,10][e],g:[500,2000,5000][e]}}
function rC0_base(){
  if(!party.length)return;if(cmpSel>=party.length)cmpSel=0;const c=party[cmpSel],kv=(l,v)=>`<div class="kv"><span>${l}</span><b>${v}</b></div>`,F=FAMD[famOf(c.g[0])];
  $('cl').innerHTML=party.map((x,i)=>mrow(x,i,i==cmpSel)).join('');
  const sp=c.sp.map((n,j)=>{const s=CSP[n];if(!s)return '';return `<div class="rw"><span class="rn">${s.i} <b>${n}</b>${j?` <span class="mut">evolution ${j}</span>`:' <span class="mut">signature</span>'}<small>${s.d} · ${s.cd}s cooldown${s.emp?'<br>⚡ Empowering: '+s.emp.d:''}</small></span></div>`}).join('');
  let evo='';const e=c.evo||0;
  if(e>=3)evo='<div class="mut">Fully evolved.</div>';else{const q=evoCost(c),ok=c.l>=q.lv&&(mats[q.fm]||0)>=q.fn&&(mats[q.um]||0)>=q.un&&gold>=q.g;
    evo=`<div class="evo"><span>Stage ${e+1} at Lv ${q.lv}: ${FAMD[famOf(c.g[0])].mi} ${mats[q.fm]||0}/${q.fn} ${q.fm} · ${matInfo(q.um)[1]} ${mats[q.um]||0}/${q.un} ${q.um} · 🪙 ${q.g}<br><small class="mut">New look, +10% stats, a new spell (${EVSP[famOf(c.g[0])][e]}) and a random modifier.</small></span><button class="pri" id="mkEvo" ${ok?'':'disabled'}>${c.l<q.lv?'Lv '+q.lv:'Evolve'}</button></div>`}
  $('cd').innerHTML=`<div class="dh">${nm(c)}</div><div class="mut" style="font-size:.74rem;margin-bottom:6px">${famT(c)}${c.v?' · '+c.v:''} · ${F.d}</div>`+
   kv('Health',M(c))+kv('Physical attack',cPA(c))+kv('Magical attack',cMA(c))+kv('Physical defense',D(c))+kv('Magical defense',cMD(c))+kv('Attack style',(F.mt=='m'?'Magic':'Physical')+' · speed '+F.spd+'×')+kv('XP',c.l>=MAXLV?'max':c.x+' / '+needH(c.l))+kv('Potential',pot(c)+'%')+kv('Fusion','★'.repeat(Math.floor(c.fp||0))+' +'+Math.round((c.fp||0)*10)+'% stats')+kv('Evolution',e?'✦'.repeat(e)+' stage '+e:'none')+
   `<div class="sec">Modifiers</div><div style="display:flex;gap:4px;flex-wrap:wrap">${modChips(c)}</div><div class="sec">Spells <span style="text-transform:none;letter-spacing:0">(auto-cast while active)</span></div><div class="rows">${sp}</div><div class="sec">Evolution</div>${evo}`+
   `<div class="btns"><button id="mkLead">Make lead</button><button id="mk2">Set as 2nd</button><span class="mut" style="margin-left:auto;align-self:center">${cmpSel<2?'Active '+(cmpSel+1)+(c.emp?' · empowering':''):'Reserve'}</span></div>`;
}
function evolve(c){
  const q=evoCost(c);if(c.l<q.lv||(mats[q.fm]||0)<q.fn||(mats[q.um]||0)<q.un||gold<q.g)return;
  mats[q.fm]-=q.fn;mats[q.um]-=q.un;gold-=q.g;c.evo=(c.evo||0)+1;const ns=EVSP[famOf(c.g[0])][c.evo-1];c.sp.push(ns);const m=rollMod(c);c.h=M(c);hsDirty();
  banner('✦ EVOLUTION ✦',c.n+' reached stage '+c.evo,'New spell: '+CSP[ns].i+' '+ns+(m?' · New modifier: '+MODS[m].i+' '+m:''));
  const f=fols[party.indexOf(c)];if(f){ring(f.position,0xffe08a,4,800);burst(gY(f.position,1),0xffe08a,80,3,4,1.2)}
  ui();rC();
}
$('cd').addEventListener('click',e=>{if(e.target.id=='mkEvo'){e.stopImmediatePropagation();evolve(party[cmpSel])}},true);
// ---------------- fusion: same family; a higher-tier base only gets half the value ----------------
const compat_v2=(a,b)=>famOf(a.g[0])==famOf(b.g[0])||a.tr=='Universal'||b.tr=='Universal';
function fuseVal_base(a,b){return (tierSp(a.g[0])>tierSp(b.g[0])?.5:1)*((b.mods||[]).includes('Catalyst')?1.6:1)}
$('doF').onclick=()=>{
  if(sel.length!=2)return;const a=party[sel[0]],b=party[sel[1]];if(!compat(a,b))return;
  const v=fuseVal(a,b);a.fp=Math.min(10,(a.fp||0)+v);a.f=Math.floor(a.fp);
  ['hp','a','d'].forEach(k=>a.iv[k]=Math.max(a.iv[k],a.iv[k]*.75+b.iv[k]*.25+.01));
  const inh=(b.mods||[]).filter(m=>!(a.mods||[]).includes(m));if(inh.length&&(a.mods||[]).length<5&&Math.random()<.35){const m=inh[R(0,inh.length-1)];a.mods.push(m);say(a.n+' inherited '+MODS[m].i+' '+m+'!')}
  if(b.tr=='Universal'&&a.tr!='Universal'){}else if(a.tr=='Universal'&&famOf(a.g[0])!=famOf(b.g[0]))a.tr='';
  a.h=M(a);party=party.filter((_,i)=>i!=sel[1]);say('Fusion complete! '+nm(a)+' grew stronger (+'+Math.round(v*10)+'% stats).');$('fz').classList.add('hide');hsDirty();ui();
};
// ---------------- hatching ----------------
function hatch_base(e){
  const t=e.tier,hab=0/100,lo0=.82+(e.pa-1)*.5,hi0=1.18+(e.pa-1)*.5,lo=lo0+hab*.22,hi=hi0+hab*.14,rv=()=>lo+Math.random()*(hi-lo),iv={hp:rv(),a:rv(),d:rv()};
  const c=mkC(e.sp,TIERS[t][0],0,Math.random()<.03+hab*.03?'Golden':pick(),iv);c.hab=Math.round(hab*100);
  c.q=Math.max(0,Math.min(1,((iv.hp+iv.a+iv.d)/3-lo0)/(hi0-lo0)));if(Math.random()<.06)c.tr='Universal';
  rollMod(c);if(Math.random()<.06*(t+1))rollMod(c);party.push(c);ui();return c;
}
// ---------------- shops ----------------
const itVal=i=>Math.round((10+i.lv*6)*[1,1.6,2.6,4.5,9][i.r]*(1+.15*(i.up||0))),EGV=[120,600,2000,6000,15000],UPV=[30,90,250,600,1400];
const townTier=()=>Math.max(1,Math.min(5,tierOfLv(hero.lvl)));
let stock2=null;
// v109: the Trading Post's level (shpL109) adds gear, raises rarities and lowers prices (shpP109); helpers in 1960
function mkStock2(){const T=townTier(),l=Math.max(TIERS[T-1][0],Math.min(TIERS[T-1][1],hero.lvl+1)),L=shpL109('post');stock2={T,lvl:hero.lvl,L,gear:Array.from({length:shpGearN109(L)},()=>shpGear109(Math.max(1,l-R(0,2)),L)),egg:shpEgg109(T,L)}}
function rS_base(){
  if(!stock2||stock2.T!=townTier()||stock2.lvl!=hero.lvl||stock2.L!==shpL109('post'))mkStock2();$('gold2').textContent=gold;
  const T=stock2.T,P=c=>{c=shpP109('post',c);return `<span class="gp${gold<c?' poor':''}">${c} 🪙</span>`},E=m=>`<div class="mut" style="padding:6px 8px">${m}</div>`;
  $('sb').innerHTML=shpNote109('post')+'<button class="rw" data-b="pot"><span class="rn">🧪 Health Potion<small>Heals 40% HP</small></span><span class="ra">'+P(30+hero.lvl*4)+'</span></button>'+
   `<button class="rw" data-b="up"><span class="rn">${UPM[T-1][1]} ${UPM[T-1][0]}<small>Upgrade material for ${TIERN[T-1]} gear</small></span><span class="ra">${P(UPV[T-1])}</span></button>`+
   stock2.gear.map((i,k)=>`<button class="rw it" data-b="g${k}" style="--rc:${RAR[i.r][1]}"><span class="rn">${icoOf(i)} <span style="color:${RAR[i.r][1]}">${itName(i)}</span><small>${SLOTN[itT(i).sl]} · iLvl ${i.lv} · ${itMain(i)}</small></span><span class="ra">${P(Math.round(itVal(i)*1.8))}</span></button>`).join('')+
   (stock2.egg?`<button class="rw" data-b="e"><span class="rn">${en(stock2.egg)}</span><span class="ra">${P(EGV[stock2.egg.tier])}</span></button>`:'');
  $('ss').innerHTML=gear.map(i=>`<button class="rw it" data-s="g${i.id}" style="--rc:${RAR[i.r][1]}"><span class="rn">${icoOf(i)} <span style="color:${RAR[i.r][1]}">${itName(i)}</span><small>${itMain(i)}</small></span><span class="ra"><span class="gp">${Math.round(itVal(i)*.5)} 🪙</span></span></button>`).join('')+
   eggs.map(e=>`<button class="rw" data-s="e${e.id}"><span class="rn">${en(e)}</span><span class="ra"><span class="gp">${Math.round(EGV[e.tier]*.4)} 🪙</span></span></button>`).join('')||E('Nothing to sell.');
}
$('sb').onclick=e=>{
  const b=e.target.closest('[data-b]');if(!b)return;const k=b.dataset.b,n=+k.slice(1),T=stock2.T;let c;
  if(k=='pot')c=30+hero.lvl*4;else if(k=='up')c=UPV[T-1];else if(k[0]=='g')c=Math.round(itVal(stock2.gear[n])*1.8);else c=EGV[stock2.egg.tier];c=shpP109('post',c);
  if(gold<c)return say('Not enough gold.');gold-=c;
  if(k=='pot')pots++;else if(k=='up')mats[UPM[T-1][0]]++;else if(k[0]=='g')gear.push(stock2.gear.splice(n,1)[0]);else{eggs.push(stock2.egg);stock2.egg=null}
  rS();hud();
};
$('ss').onclick=e=>{
  const b=e.target.closest('[data-s]');if(!b)return;const k=b.dataset.s,t=k[0],id=+k.slice(1);
  if(t=='g'){const i=gear.findIndex(g=>g.id==id);if(i<0)return;gold+=Math.round(itVal(gear[i])*.5);gear.splice(i,1)}
  if(t=='e'){const i=eggs.findIndex(g=>g.id==id);if(i<0)return;gold+=Math.round(EGV[eggs[i].tier]*.4);eggs.splice(i,1)}
  rS();hud();
};
let mstock=null;
function rMS(){
  const T=townTier(),L=shpL109('magic');if(!mstock||mstock.T!=T||mstock.L!==L)mstock={T,L,eggs:Array.from({length:2+L},()=>shpEgg109(T,L))};$('gold3').textContent=gold;
  const P=c=>`<span class="gp${gold<c?' poor':''}">${c} 🪙</span>`,D=c=>shpP109('magic',c),rc=D(40*hero.lvl),xc=D(60+hero.lvl*12);
  $('mst').innerHTML=shpNote109('magic')+`<div class="rw"><span class="rn">🔄 <b>Tome of Unlearning</b><small>Take back all your attribute points to spend again</small></span><span class="ra">${P(rc)}<button class="pri" data-ms="reset" ${gold<rc||!atr139Spent()?'disabled':''}>Reset</button></span></div>`+
   `<div class="rw"><span class="rn">📜 <b>Elixir of Insight</b><small>+25% XP for 10 minutes</small></span><span class="ra">${P(xc)}<button class="pri" data-ms="xp" ${gold<xc?'disabled':''}>Buy</button></span></div>`+
   UPM.slice(0,T).map((u,i)=>`<div class="rw"><span class="rn">${u[1]} <b>${u[0]}</b><small>Upgrade material · ${TIERN[i]}</small></span><span class="ra">${P(D(Math.round(UPV[i]*.9)))}<button class="pri" data-ms="u${i}" ${gold<D(Math.round(UPV[i]*.9))?'disabled':''}>Buy</button></span></div>`).join('')+
   mstock.eggs.map((e,i)=>e?`<div class="rw"><span class="rn">${en(e)}<small>${FAMD[e.tag].d}</small></span><span class="ra">${P(D(EGV[e.tier]))}<button class="pri" data-ms="e${i}" ${gold<D(EGV[e.tier])?'disabled':''}>Buy</button></span></div>`:'').join('');
}
$('mst').onclick=e=>{
  const b=e.target.closest('[data-ms]');if(!b||b.disabled)return;const k=b.dataset.ms,D=c=>shpP109('magic',c);
  if(k=='reset'){const c=D(40*hero.lvl);if(gold<c||!atr139Spent())return;gold-=c;atr139Clear();say('Your attribute points were returned. Press C to spend them again.')}   // v139: only attributes (it used to wipe hero.tal, abilities too)
  else if(k=='xp'){const c=D(60+hero.lvl*12);if(gold<c)return;gold-=c;rest={t:Date.now()+600000,m:.25};say('You feel insightful: +25% XP for 10 minutes.')}
  else if(k[0]=='u'){const i=+k.slice(1),c=D(Math.round(UPV[i]*.9));if(gold<c)return;gold-=c;mats[UPM[i][0]]++}
  else if(k[0]=='e'){const i=+k.slice(1),eg=mstock.eggs[i];if(!eg||gold<D(EGV[eg.tier]))return;gold-=D(EGV[eg.tier]);eggs.push(eg);mstock.eggs[i]=null}
  rMS();hud();
};
// ---------------- character creation ----------------
let ccStep=0,ccCls='warrior',ccSp='Foxlet',ccSel=0,ccHero=null;
const STARTERS=FAMK.map(f=>famTier(f,1));
function ccPreview(){
  if(ccStep==0){
    if(!ccHero){ccHero=buildHero();const inner=new THREE.Group(),piv=new THREE.Group();inner.add(ccHero);piv.add(inner);pvFit(inner,1.9);ccHero.pv=piv;
      const ped=new THREE.Mesh(new THREE.CylinderGeometry(.7,.8,.12,32),new THREE.MeshStandardMaterial({color:0x3a2c1e,roughness:.8}));ped.position.y=-.06;piv.add(ped);
      const rg=new THREE.Mesh(new THREE.RingGeometry(.72,.8,48),new THREE.MeshBasicMaterial({color:0xffd060,transparent:true,opacity:.7,side:THREE.DoubleSide}));rg.rotation.x=-Math.PI/2;rg.position.y=.005;piv.add(rg);ccHero.rg=rg}
    const C=CLS[ccCls],tmp={};const w=ITPL.findIndex(t=>t.sl=='weapon'&&t.cls==ccCls&&t.t==0);tmp.weapon={id:-1,tp:w,lv:1,req:1,r:1,up:0,aff:[]};
    ['chest','helm','boots'].forEach(sl=>{const i=ITPL.findIndex(t=>t.sl==sl&&t.arm==C.arm&&t.t==1);tmp[sl]={id:-2,tp:i,lv:5,req:1,r:2,up:0,aff:[]}});
    if(ccCls=='paladin'){tmp.offhand={id:-3,tp:ITPL.findIndex(t=>t.sl=='offhand'&&t.t==1),lv:5,req:1,r:2,up:0,aff:[]}}
    refreshGear(ccHero,ccCls,tmp);ccHero.rg.material.color.set(C.col);const t0=performance.now();
    pvShow($('ccPV'),ccHero.pv,now=>{const k=(now-t0)/1000,b=ccHero.bones;ccHero.pv.rotation.y=Math.sin(now/1900)*.5+.2;animHero(now,false,ccHero);ccHero.rg.material.opacity=.45+.3*Math.sin(now/300);
      const q=Math.max(0,Math.min(1,(k-.15)/.9)),s=Math.sin(q*Math.PI);ccHero.sw=q>0&&q<1;
      if(C.atk=='bow'){b.aL0.rotation.x=-1.5*s;b.aR0.rotation.x=-1.4*s;b.aR1.rotation.x=-1.6*s;b.spine.rotation.y=-.5*s}
      else if(C.atk=='staff'){b.aR0.rotation.x=-.4-2.2*s;b.aL0.rotation.x=-1.6*s;b.spine.rotation.x=-.15*s;if(q>.4&&q<.6&&!ccHero.fl){ccHero.fl=1}}
      else{b.aR0.rotation.x=-.2-2.4*s;b.aR0.rotation.z=(q<.5?-.6:.9)*s;b.spine.rotation.y=(q<.5?.7:-.8)*s;if(ccCls=='paladin')b.aL0.rotation.x=-1.2*s}
      if(q>=1){ccHero.fl=0}});
  }else{
    const c=mkC(ccSp,1,0,''),m=cr(c),pv=new THREE.Group(),inner=new THREE.Group();inner.add(m);pv.add(inner);pvFit(inner,1.6);
    const ped=new THREE.Mesh(new THREE.CylinderGeometry(.75,.85,.12,32),new THREE.MeshStandardMaterial({color:0x3a2c1e,roughness:.8}));ped.position.y=-.06;pv.add(ped);
    const col=FAMD[famOf(ccSp)].col,rg=new THREE.Mesh(new THREE.RingGeometry(.76,.86,48),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8,side:THREE.DoubleSide}));rg.rotation.x=-Math.PI/2;rg.position.y=.005;pv.add(rg);
    const sp=[];for(let i=0;i<26;i++){const o=new THREE.Mesh(new THREE.SphereGeometry(.03,6,5),new THREE.MeshBasicMaterial({color:i%2?col:0xffffff,transparent:true}));o.userData={a:Math.random()*6.28,r:.3+Math.random()*.6,v:.6+Math.random()*1.2,y0:Math.random()};pv.add(o);sp.push(o)}
    const t0=performance.now();
    pvShow($('ccPV'),pv,now=>{const k=(now-t0)/1000;
      const hop=k<.9?Math.abs(Math.sin(k*Math.PI*2.2))*.35*(1-k/.9):0;inner.position.y=hop;pv.rotation.y=k<1.2?(1-Math.pow(1-Math.min(1,k/1.2),3))*Math.PI*2+.4:.4+Math.sin(now/1700)*.5;
      if(m.rig)m.rig(now,k<.9,2);m.atk=k>.25&&k<.7?1:0;rg.scale.setScalar(1+Math.max(0,.6-k)*1.4);rg.material.opacity=.5+.3*Math.sin(now/260);
      sp.forEach(o=>{const u=o.userData,t=((now/1000)*u.v*.5+u.y0)%1;o.position.set(Math.cos(u.a+now/900)*u.r,t*1.8,Math.sin(u.a+now/900)*u.r);o.material.opacity=Math.sin(t*Math.PI)*(k<1.5?1:.6)})});
  }
}
const statBar=(l,v,mx)=>`<div class="sbr"><span>${l}</span><i><b style="width:${Math.min(100,v/mx*100)}%"></b></i></div>`;
function ccRender(){
  $('ccS1').classList.toggle('on',ccStep==0);$('ccS2').classList.toggle('on',ccStep==1);$('ccBack').classList.toggle('hide',ccStep==0);$('ccNext').textContent=ccStep==0?'Next ›':'Begin your journey';
  $('ccName').classList.toggle('hide',ccStep!=0);$('ccT').textContent=ccStep==0?'Create your hero':'Choose your first companion';
  if(ccStep==0){
    $('ccList').innerHTML=CLSK.map(k=>`<button class="ccc${k==ccCls?' on':''}" data-c="${k}" style="--cc:${CLS[k].col}"><span class="cci">${CLS[k].i}</span><span><b>${CLS[k].n}</b><small>${CLS[k].role}</small></span></button>`).join('');
    const C=CLS[ccCls],S50=k=>C.base[k]+C.per[k]*49;
    $('ccInfo').innerHTML=`<h3 style="color:${C.col}">${C.i} ${C.n}</h3><p>${C.d}</p><div class="mut" style="font-size:.72rem;margin-bottom:6px">${C.st} · ${C.arm} armor · ${({melee3:'heavy 3-hit combo',melee4:'fast 4-hit combo',bow:'arrows from range',staff:'magic bolts from range'})[C.atk]}</div>`+
      statBar('Health',S50('hp'),1400)+statBar('Phys. attack',S50('pa'),200)+statBar('Magic attack',S50('ma'),215)+statBar('Phys. defense',S50('pd'),150)+statBar('Magic defense',S50('md'),125)+statBar('Speed',1/C.spd,2.8)+
      `<div class="sec">Starting ability</div>`+SKL[ccCls].slice(0,1).map(k=>`<div class="ccsk">${k.i} <b>${k.n}</b><br><small class="mut">${k.d}</small></div>`).join('')+`<div class="mut" style="font-size:.72rem;margin-top:6px">⚡ Earn 2 ability points every level (3 every 5th level), rank abilities up to 5 and unlock 16 more ${CLS[ccCls].n} abilities in the Abilities window (C).</div>`;
  }else{
    $('ccList').innerHTML=STARTERS.map(n=>{const f=famOf(n);return `<button class="ccc${n==ccSp?' on':''}" data-s="${n}" style="--cc:#${('00000'+FAMD[f].col.toString(16)).slice(-6)}"><span class="cci">${SP2[n][3]}</span><span><b>${n}</b><small>${FAMD[f].i} ${f} family</small></span></button>`}).join('');
    const f=famOf(ccSp),F=FAMD[f],sp=CSP[SP2[ccSp][8]];
    $('ccInfo').innerHTML=`<h3>${SP2[ccSp][3]} ${ccSp}</h3><p>${F.d}</p>`+statBar('Health',F.w.hp,1.5)+statBar('Phys. attack',F.w.pa,1.5)+statBar('Magic attack',F.w.ma,1.5)+statBar('Phys. defense',F.w.pd,1.5)+statBar('Magic defense',F.w.md,1.5)+statBar('Speed',F.spd,1.5)+
      `<div class="sec">Signature spell</div><div class="ccsk">${sp.i} <b>${SP2[ccSp][8]}</b><br><small class="mut">${sp.d}</small><br><small>⚡ Empowering: ${sp.emp.d}</small></div><div class="mut" style="font-size:.72rem;margin-top:8px">Grows through 5 tiers in the ${f} family: ${FAMK.length&&[1,2,3,4,5].map(t=>famTier(f,t)).join(' → ')}. It hatches with a random modifier.</div>`;
  }
  ccPreview();
}
function ccBegin(){
  hero.cls=ccCls;hero.name=($('ccName').value||'').trim().slice(0,16)||CLS[ccCls].n;hero.lvl=1;hero.xp=0;hero.tal={};hero.cd={};hero.buffs=[];hero.dc=2;
  eq={};const W_=ITPL.findIndex(t=>t.sl=='weapon'&&t.cls==ccCls&&t.t==0),Ch=ITPL.findIndex(t=>t.sl=='chest'&&t.arm==CLS[ccCls].arm&&t.t==0);
  eq.weapon={id:uid++,tp:W_,lv:1,req:1,r:0,up:0,aff:[]};eq.chest={id:uid++,tp:Ch,lv:1,req:1,r:0,up:0,aff:[]};
  if(ccCls=='paladin')eq.offhand={id:uid++,tp:ITPL.findIndex(t=>t.sl=='offhand'&&t.t==0),lv:1,req:1,r:0,up:0,aff:[]};
  const c=mkC(ccSp,1,0,'',{hp:1.03,a:1.03,d:1.03,pa:1.03,ma:1.03,pd:1.03,md:1.03});rollMod(c);party=[c];hsDirty();hero.hp=heroMax();hero.mp=mpMax();
  PV.run=false;$('start').classList.add('hide');refreshGear();ui();hud();
  fadeTo(()=>{banner('Welcome, '+hero.name,CLS[ccCls].i+' '+CLS[ccCls].n+' · with '+SP2[ccSp][3]+' '+ccSp+' ('+MODS[c.mods[0]].i+' '+c.mods[0]+')','Hearthvale · enemies here are Lv 1–9')});
  say('Welcome to Hearthvale. Visit the Trading Post, Magic Shop and tavern, then head out. Press C for your character, K for abilities, Tab to target enemies.');
}
$('start').innerHTML=`<div class="ccw"><div class="cch"><h2 id="ccT">Create your hero</h2><div class="ccst"><span id="ccS1" class="on">1 · Class</span><span id="ccS2">2 · First companion</span></div></div>
 <div class="ccb"><div id="ccList" class="ccl"></div><div class="ccm"><div id="ccPV" class="ccpv"></div></div><div id="ccInfo" class="ccr"></div></div>
 <div class="ccf"><input id="ccName" maxlength="16" placeholder="Hero name"><span style="flex:1"></span><button id="ccBack" class="hide">‹ Back</button><button id="ccNext" class="pri">Next ›</button></div></div>`;
$('ccList').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.c)ccCls=b.dataset.c;if(b.dataset.s)ccSp=b.dataset.s;ccRender()};
$('ccNext').onclick=()=>{if(ccStep==0){ccStep=1;ccRender()}else ccBegin()};
$('ccBack').onclick=()=>{ccStep=0;ccRender()};
requestAnimationFrame(()=>ccRender());

