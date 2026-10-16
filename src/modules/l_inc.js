// ================= v34: Basic Incubator — hatches any egg, no habitat bonus =================
TGI.Basic='🥚';FAMC.Basic=0xd8c8a0;
ITEMS['i:Basic']={id:'inc_Basic',key:'i:Basic',n:'Basic Incubator',i:'🥚',cat:3,fam:'Basic',s:1,cz:0,out:1,rec:{wood:8,stone:6,fiber:4},mk:mkPed('Basic'),basic:1};
const INCT=()=>['Basic'].concat(FAMS);
function rI(){
  const all=INCT(),bt=all.filter(t=>built[t]),nb=all.filter(t=>!built[t]);
  $('islots').innerHTML=bt.map(t=>{const sl=incS[t],st=sl?`<span>${RAR[sl.egg.tier][0]} ${sl.egg.sp}</span><span class="hpm"><i style="width:${Math.min(100,(Date.now()-sl.t0)/300)}%"></i></span>`:'<span class="mut">Empty</span>';
    let sub;if(t=='Basic')sub='Hatches any egg · no habitat bonus';else{const hb=habInfo(t)||{tot:0},H=HAB[t];sub=`Habitat ${hb.tot}% (+${Math.round(hb.tot*.14)}% stats) · likes ${H.ter.map(x=>TER[TERI[x]].n).join(', ')}, ${H.dec.map(x=>ITEMS['d:'+x].n).join(', ')}`}
    return `<div class="rw slot" data-t="${t}"><span class="rn">${TGI[t]} <b>${t=='Basic'?'Basic Incubator':t}</b><small>${sub}</small></span><span class="ra">${st}</span></div>`}).join('')
   +(nb.length?`<div class="mut" style="padding:8px;font-size:.76rem">${bt.length?'Not placed':'No incubators placed yet'}: ${nb.map(t=>TGI[t]+' '+(t=='Basic'?'Basic':t)).join(' · ')}<br>Start with a 🥚 Basic Incubator (wood, stone, fiber): it hatches any egg. A family incubator in a matching habitat hatches a stronger creature.</div>`:'');
  $('eggs').innerHTML=eggs.length?eggs.map(e=>`<button class="rw it${incSel==e.id?' on':''}" draggable="true" data-e="${e.id}" style="--rc:${RAR[e.tier][1]}"><span class="rn">${en(e)}</span><span class="ra">Parent potential ${Math.round(e.pa*100)}%</span></button>`).join(''):'<div class="mut" style="padding:6px 8px">No eggs yet. Eggs are rare drops from monsters.</div>';
}
function place(id,tag){
  const i=eggs.findIndex(e=>e.id==id);if(i<0)return;const e=eggs[i];
  if(!tag){tag=e.tag;if(!(built[tag]&&!incS[tag])&&built.Basic&&!incS.Basic)tag='Basic'}
  if(tag!='Basic'&&e.tag!=tag)return say('That is a '+e.tag+' egg. It needs a '+e.tag+' incubator or a Basic Incubator.');
  if(!built[tag])return say(tag=='Basic'?'Place a Basic Incubator in your Realm first.':'Place a '+tag+' or Basic Incubator in your Realm first (recall with T, then build with B).');
  if(incS[tag])return say('That incubator is busy.');
  e.basic=tag=='Basic';incS[tag]={egg:eggs.splice(i,1)[0],t0:Date.now()};incSel=0;rI();
}
function hatch(e){if(!e.basic)return hatch_base(e);const t=e.tag;e.tag='Basic';const c=hatch_base(e);e.tag=t;c.hab=0;return c}
