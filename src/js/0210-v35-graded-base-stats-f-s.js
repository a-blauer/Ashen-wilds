// ================= v35: graded base stats (F–S) and three fusion paths =================
const IVK=['hp','pa','ma','pd','md'],IVN={hp:'Health',pa:'Physical attack',ma:'Magical attack',pd:'Physical defense',md:'Magical defense'},IVS={hp:'HP',pa:'PA',ma:'MA',pd:'PD',md:'MD'};
const GR=[[1.2,'S','#ffd24a'],[1.12,'A','#ff8a4a'],[1.06,'B','#c084fc'],[1.0,'C','#60a5fa'],[.94,'D','#6ee7b7'],[.88,'E','#a8b0bc'],[-9,'F','#8a8f98']];
const A_LINE=1.12,grade=v=>GR.find(g=>v>=g[0]);
const ivOf=(c,k)=>{const iv=c.iv;return iv[k]!=null?iv[k]:k=='hp'?iv.hp:(k=='pa'||k=='ma')?iv.a:iv.d};
function ivSync(c){c.iv.a=(ivOf(c,'pa')+ivOf(c,'ma'))/2;c.iv.d=(ivOf(c,'pd')+ivOf(c,'md'))/2}
function ivFix(c){if(!c||!c.iv)return c;const iv=c.iv;if(iv.pa==null){const j=()=>(Math.random()-.5)*.09;iv.pa=iv.a+j();iv.ma=iv.a+j();iv.pd=iv.d+j();iv.md=iv.d+j()}ivSync(c);return c}
const gTag=(c,k)=>{const g=grade(ivOf(c,k));return `<b class="grd" style="color:${g[2]}" title="${IVN[k]} roll ${ivOf(c,k).toFixed(3)}">${IVS[k]} ${g[1]}</b>`};
const gradeStr=c=>IVK.map(k=>gTag(c,k)).join(' ');
function mkC(n,l,f,v,iv){const c=mkC_base(n,l,f,v,iv);ivFix(c);c.h=M(c);return c}
// creature stats: each stat uses its own roll; fusion growth raises the per-level gain
function cStat(c,k){
  if(c.st)return c.st[k];
  const n=c.g[0],F=FAMD[famOf(n)],t=tierSp(n),TM=1+.55*(t-1),GM=1+.2*(t-1);
  let v=(CBS[k]*TM+CGS[k]*GM*((c.l||1)-1)*(1+(c.gs||0)))*F.w[k];
  v*=ivOf(c,k);
  {const sm=typeof SPM!='undefined'&&SPM[n];if(sm&&sm[k])v*=sm[k]}
  if(c.runes&&c.runes.length&&typeof runeMul=='function')v*=runeMul(c,k);
  v*=(1+.1*(c.evo||0))*vm(c,k=='hp'?0:(k=='pa'||k=='ma')?1:2);
  (c.mods||[]).forEach(m=>{const s=MODS[m].s;if(s&&s[k+'P'])v*=1+s[k+'P']});
  return v;
}
party.forEach(ivFix);
// companions window: show the graded rolls and the new fusion growth line
function rC0(){
  rC0_base();if(!party.length)return;const c=party[cmpSel];if(!c)return;ivFix(c);
  const cd=$('cd');cd.innerHTML=cd.innerHTML.replace(/<div class="kv"><span>Fusion<\/span><b>[^<]*<\/b><\/div>/,`<div class="kv"><span>Fusion</span><b>${c.fz||0} fusion${(c.fz||0)==1?'':'s'} · +${Math.round((c.gs||0)*100)}% growth per level</b></div>`)
    .replace('<div class="sec">Modifiers</div>',`<div class="sec">Base stat grades</div><div class="grds">${IVK.map(k=>{const g=grade(ivOf(c,k));return `<span style="--gc:${g[2]}"><i>${g[1]}</i>${IVN[k]}</span>`}).join('')}</div><div class="sec">Modifiers</div>`);
  if(typeof feedHTML=='function')cd.insertAdjacentHTML('beforeend',feedHTML(c));
  if(typeof runeHTML=='function')cd.insertAdjacentHTML('beforeend',runeHTML(c));
}
// ---------- fusion ----------
let fOpt='std',fStat='pa';
const pctS=v=>Math.round(v*100)+'%';
function rF(){
  if(fCat&&!(sup[fCat]>0))fCat='';party.forEach(ivFix);
  const a=sel.length>=1?party[sel[0]]:null,b=sel.length==2?party[sel[1]]:null;
  $('fl').innerHTML=party.map((c,i)=>{const h=mrow(c,i,sel.includes(i)).replace('<span class="rn">',`<span class="rn">${sel[0]==i?'<b style="color:#6ee7b7">KEEP</b> ':sel[1]==i?'<b style="color:#f87171">CONSUMED</b> ':''}`).replace('</small>','<br>'+gradeStr(c)+'</small>');return a&&!sel.includes(i)&&!compat(a,c)?h.replace('<button','<button disabled'):h}).join('');
  const ok=a&&b&&compat(a,b);$('doF').disabled=!ok;
  const own=CATS.filter(k=>(sup[k]||0)>0),catH=`<div class="fcat"><span>Catalyst:</span>${['',...own].map(k=>`<button data-fc="${k}" class="${fCat==k?'on':''}" title="${k?SUP[k].d:'No catalyst'}">${k?SUP[k].i+' '+SUP[k].n+' ×'+sup[k]:'None'}</button>`).join('')}${own.length?'':'<small class="mut">Brew catalysts at an Alchemy Table to boost fusion.</small>'}</div>`;
  const m=!a?'Pick the companion to <b>keep</b> first, then the one to consume.':!b?'Now pick a companion of the same family ('+famOf(a.g[0])+') to consume.':!ok?'Only the same family can fuse, unless one has the Universal trait (or you use Binding Salts).':null;
  $('fmsg').className=m?'warn':'';$('fmsg').innerHTML=(m||fuseOpts(a,b))+catH;
  const ft=document.querySelector('#fz .wf .dtl');if(ft)ft.textContent='Grades run F · E · D · C · B · A · S. The kept companion resets to level 1.';
}
$('fz').addEventListener('click',e=>{const o=e.target.closest('[data-fo]'),s=e.target.closest('[data-fs]');if(o&&!o.disabled){e.stopPropagation();fOpt=o.dataset.fo;rF()}else if(s&&!s.disabled){e.stopPropagation();fStat=s.dataset.fs;rF()}});
$('doF').onclick=()=>{
  if(sel.length!=2)return;const a=party[sel[0]],b=party[sel[1]];if(!a||!b||!compat(a,b))return;ivFix(a);ivFix(b);
  const cat=fCat&&(sup[fCat]||0)>0?fCat:'',v=fuseVal(a,b);let msg='';
  if(fOpt=='sip'){const k=fStat,o=ivOf(a,k);if(!(ivOf(b,k)>o))return say('Pick a stat that '+b.n+' has a better roll in.');a.iv[k]=o+(ivOf(b,k)-o)*Math.min(1,v);ivSync(a);msg=IVN[k]+' '+grade(o)[1]+' → '+grade(a.iv[k])[1]}
  else if(fOpt=='bol'){const up=[];IVK.forEach(k=>{const o=ivOf(a,k);if(o<A_LINE){a.iv[k]=Math.min(A_LINE,o+(.025+Math.random()*.02)*v);if(grade(a.iv[k])[1]!=grade(o)[1])up.push(IVS[k]+' '+grade(o)[1]+'→'+grade(a.iv[k])[1])}});ivSync(a);msg='stats bolstered'+(up.length?' ('+up.join(', ')+')':'')}
  else{a.gs=Math.min(.6,(a.gs||0)+.06*v);msg='growth per level now +'+pctS(a.gs)}
  a.fz=(a.fz||0)+1;a.fp=Math.min(10,a.fz);a.f=Math.floor(a.fp);
  const inh=(b.mods||[]).filter(m=>!(a.mods||[]).includes(m));if(inh.length&&(a.mods||[]).length<5&&Math.random()<(cat=='c_ess'?1:.35)){const m=inh[R(0,inh.length-1)];a.mods.push(m);say(a.n+' inherited '+MODS[m].i+' '+m+'!')}
  if(b.tr=='Universal'&&a.tr!='Universal'){}else if(a.tr=='Universal'&&famOf(a.g[0])!=famOf(b.g[0]))a.tr='';
  if(cat){sup[cat]--;say(SUP[cat].i+' '+SUP[cat].n+' was used up.');if(!(sup[cat]>0))fCat=''}
  if(b.emp)b.emp=false;a.l=1;a.x=0;a.h=M(a);party=party.filter((_,i)=>i!=sel[1]);sel=[];
  say('Fusion complete! '+nm(a)+': '+msg+'. It starts again at level 1.');$('fz').classList.add('hide');hsDirty();hero.hp=Math.min(hero.hp,heroMax());ui();
};

