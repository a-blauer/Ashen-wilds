// ================= companions: tabs instead of one long column =================
const KQM_CT=[['ov','Overview'],['st','Stats & Grades'],['sp','Spells & Evolution'],['care','Care'],['tal','Talents']];
function kqmCInit(){if($('kqmCT'))return;const cv=$('cvw');if(!cv)return;const d=document.createElement('div');d.id='kqmCT';d.className='tabs kqm-ctabs hide';cv.parentElement.insertBefore(d,cv);
  d.addEventListener('click',e=>{const b=e.target.closest('[data-kqc]');if(!b)return;KQM.ctab=b.dataset.kqc;kqmSave();kqmCApply(true)});
  new MutationObserver(()=>{const cd=$('cd'),has=cd&&cd.querySelector(':scope > .kqm-cpane');if(!has){d.classList.add('hide');cv.parentElement.classList.remove('kqm-novw')}}).observe($('cd'),{childList:true})}
function kqmCApply(click,keepVw){const cd=$('cd'),T=$('kqmCT');if(!cd||!T)return;const c=party[cmpSel];
  if(!cd.querySelector(':scope > .kqm-cpane[data-kqc="'+KQM.ctab+'"]'))KQM.ctab='ov';
  cd.querySelectorAll(':scope > .kqm-cpane').forEach(p=>p.classList.toggle('hide',p.dataset.kqc!=KQM.ctab));
  T.querySelectorAll('[data-kqc]').forEach(b=>b.classList.toggle('on',b.dataset.kqc==KQM.ctab));
  const col=T.parentElement,was=col.classList.contains('kqm-novw');if(!keepVw)col.classList.toggle('kqm-novw',KQM.ctab!='ov');
  if(click){cd.scrollTop=0;if(KQM.ctab=='ov'&&(was||!PV.run)&&c&&!CE.hat)try{cmpPV(c)}catch(_){}}}
function kqmCTabs(){kqmCInit();const cd=$('cd'),T=$('kqmCT');if(!cd||!T||!party.length)return;const c=party[cmpSel];if(!c||cd.querySelector(':scope > .kqm-cpane'))return;
  const kids=[...cd.children];if(!kids.length)return;const P={ov:[],st:[],sp:[],care:[],tal:[]},head=[];let cur='head';
  kids.forEach(el=>{const cl=el.classList;let k;
    if(cl.contains('sec')){const t=el.textContent.toLowerCase();cur=/grade|modifier/.test(t)?'st':/spell|evolution|abilit/.test(t)?'sp':/feed|rune/.test(t)?'care':/talent/.test(t)?'tal':'ov';k=cur}
    else if(cl.contains('ctal'))k='tal';else if(cl.contains('btns'))k='ov';else if(cl.contains('kv'))k='st';
    else if(cur=='head'&&(cl.contains('dh')||cl.contains('mut')||cl.contains('cedh')))k='head';else k=cur=='head'?'ov':cur;
    (k=='head'?head:P[k]).push(el)});
  if(!P.st.length&&!P.sp.length)return; // not a companion detail (egg / hatch panel)
  const hd=document.createElement('div');hd.className='kqm-chead';head.forEach(x=>hd.appendChild(x));
  // overview: the numbers people look at most, modifiers and the action buttons
  let sum='';try{const kv=(l,v,t)=>`<div class="kv"${t?' title="'+t+'"':''}><span>${l}</span><b>${v}</b></div>`,o=typeof ovG=='function'?ovG(c):null;
    sum=kv('Health',Math.round(c.h)+' / '+M(c))+kv('Overall grade',o?`<span style="color:${o[2]}">${o[1]}</span>`:'—')+kv('Physical attack',cPA(c))+kv('Magical attack',cMA(c))+kv('Physical defense',D(c))+kv('Magical defense',cMD(c))+
      kv('Level',c.l+' · '+(c.l>=MAXLV?'max':c.x+' / '+needH(c.l)+' XP'))+kv('Evolution',c.evo?'✦'.repeat(c.evo)+' stage '+c.evo:'none')}catch(_){}
  const ov=document.createElement('div');ov.innerHTML=`<div class="kqm-csum">${sum}</div><div class="kqm-cmods">${typeof modChips=='function'?modChips(c):''}</div>`;
  const panes={};KQM_CT.forEach(([k])=>{const p=document.createElement('div');p.className='kqm-cpane';p.dataset.kqc=k;panes[k]=p});
  [...ov.children].forEach(x=>panes.ov.appendChild(x));P.ov.forEach(x=>panes.ov.appendChild(x));['st','sp','care','tal'].forEach(k=>P[k].forEach(x=>panes[k].appendChild(x)));
  cd.innerHTML='';cd.appendChild(hd);KQM_CT.forEach(([k])=>{if(k=='ov'||panes[k].children.length)cd.appendChild(panes[k])});
  // tab labels with small hints: free talent points, evolution ready, open rune slots, hurt companion
  const dot=n=>n?`<span class="kqm-dot">${n}</span>`:'',evo=panes.sp.querySelector('#mkEvo'),fr=typeof ctFree=='function'?ctFree(c):0;
  const hint={sp:evo&&!evo.disabled?'!':'',tal:fr>0?fr:'',care:c.h<M(c)*.5&&c.h>0?'!':''};
  T.innerHTML=KQM_CT.filter(([k])=>cd.querySelector(':scope > .kqm-cpane[data-kqc="'+k+'"]')).map(([k,n])=>`<button data-kqc="${k}">${n}${dot(hint[k])}</button>`).join('');T.classList.remove('hide');
  kqmCApply(false,true)}
{const f=rC0;rC0=function(){const r=f.apply(this,arguments);try{kqmCTabs()}catch(err){console.warn('kqm cmp',err)}return r}}
{const f=rC;rC=function(){try{kqmCInit();const T=$('kqmCT');if(T)T.parentElement.classList.remove('kqm-novw')}catch(_){}const r=f.apply(this,arguments);try{const cd=$('cd'),T=$('kqmCT');if(cd&&cd.querySelector(':scope > .kqm-cpane'))kqmCApply(false);else if(T)T.classList.add('hide')}catch(_){}return r}}
// [ and ] switch tabs in the open character or companion window
addEventListener('keydown',e=>{const t=e.target;if(t&&(t.tagName=='INPUT'||t.tagName=='TEXTAREA'||t.tagName=='SELECT'))return;if(e.key!='['&&e.key!=']')return;const d=e.key==']'?1:-1;
  if(!$('cmp').classList.contains('hide')){const L=[...document.querySelectorAll('#kqmCT [data-kqc]')].map(b=>b.dataset.kqc);if(!L.length)return;const i=L.indexOf(KQM.ctab);KQM.ctab=L[(i+d+L.length)%L.length];kqmSave();kqmCApply(true);e.preventDefault()}
  else if(!$('bag').classList.contains('hide')){const L=[...document.querySelectorAll('#bt [data-bt]')].map(b=>+b.dataset.bt);if(!L.length)return;const i=L.indexOf(bagTab2);bagTab2=L[(i+d+L.length)%L.length];rB0();e.preventDefault()}else return;e.stopImmediatePropagation()},true);

