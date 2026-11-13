// ================= v200: companion food (Cooking Hearth) and the companion's food pouch =================
// Owner (Nov 5 2026): "Add more recipes to the cooking hearth for dedicated companion food. This is food you can craft and put
// in your companions inventory. When the companion gets low enough, they will automatically eat this food. Have this food heal
// instantly instead of over time."
//  * CF200: seven recipes in a "Companion food" group at the Cooking Hearth (supplies keyed cf_*, category 'cfood'; the hero
//    can't eat them). Each heals a share of the companion's max health at once (v).
//  * Each companion has a food pouch c.cf200 = [{k,n}] (3 stacks of up to 10, saved with the companion) filled in the
//    Companions window (P), and an eating point c.cf200t (25 / 40 / 60% health, default 40%).
//  * An active companion (alive, at your side) below its point eats from its pouch: the food that best covers what it is
//    missing, at most one bite every CF200.cd seconds. Instant heal; the bite effect (cf200Fx) is relayed to co-op partners.
var CF200={cd:4,max:3,stack:10,pts:[.25,.4,.6],R:[
  ['cf_jerky','Jerky Bites','🥓',{meat:2},3,.25,'Chewy strips of dried meat.'],
  ['cf_fishcake','Fish Cakes','🍥',{fish:2,wheat:1},3,.3,'Pressed fish and grain, a favourite of every family.'],
  ['cf_marrow','Marrow Biscuits','🦴',{bone:2,wheat:2,honey:1},3,.4,'Hard biscuits baked round crushed bone and honey.'],
  ['cf_haunch','Hunter\'s Haunch','🍗',{meat:3,pepper:1},2,.5,'A peppered haunch, roasted on the bone.'],
  ['cf_broth','Ember Bone Broth','🥘',{meat:2,emberroot:1,bone:2},2,.6,'A thick broth that glows faintly from the emberroot.'],
  ['cf_frost','Frostcap Morsels','🍙',{fish:2,frostcap:1,moonpetal:1},2,.7,'Cold, sweet morsels that wake a tired beast at once.'],
  ['cf_feast','Starbloom Banquet','🍱',{meat:2,fish:2,starbloom:1,honey:1},2,.9,'A small feast fit for an elder companion.']]};
CF200.R.forEach(r=>{SUP[r[0]]={n:r[1],i:r[2],c:'cfood',v:r[5],d:'Companion food: heals '+Math.round(r[5]*100)+'% of a companion\'s health at once. Put it in a companion\'s food pouch (P).'}});
function cf200R(k){return CF200.R.find(r=>r[0]==k)}
// cooking (make in 0160 only knows FOOD and ALCH)
{const f=make;make=function(k,n){const r=cf200R(k);if(!r)return f.apply(this,arguments);let m=0;
  for(let i=0;i<n;i++){if(!recOk(r[3]))break;spend(r[3]);giveS(k,r[4]);m+=r[4]}
  if(m)say('🍳 Cooked '+r[2]+' '+r[1]+' ×'+m+'. Put it in a companion\'s food pouch (P).');else say('You are missing ingredients.');rX();hud()}}
function cf200Group(){const row=r=>{const ok=recOk(r[3]),own=cnt(r[0]);
    return `<div class="rw"><span class="rn">${r[2]} <b>${r[1]}</b> <span class="mut">×${own} · makes ${r[4]}</span><small>Heals ${Math.round(r[5]*100)}% of a companion's health at once<br>${recHTML(r[3])}</small></span><span class="ra"><button class="pri" data-mk="${r[0]}" data-n="1" ${ok?'':'disabled'}>Cook</button><button data-mk="${r[0]}" data-n="5" ${ok?'':'disabled'}>×5</button></span></div>`};
  return grpHTML('Companion food',CF200.R.map(row).join(''),CF200.R.length,CF200.R.filter(r=>recOk(r[3])).length)}
{const f=XR.cook;XR.cook=function(){const r=f.apply(this,arguments);try{const L=$('xwB').querySelector('.xcols > div');if(L&&!L.querySelector('[data-g="Companion food"]'))L.insertAdjacentHTML('beforeend',cf200Group());
  const S=$('xwS');if(S&&!/companion food/i.test(S.textContent))S.textContent+=' · companion food heals at once';
  const mine=CF200.R.filter(q=>cnt(q[0])>0),sec=[...$('xwB').querySelectorAll('.sec')].find(x=>/^yours/i.test(x.textContent.trim())),rows=sec&&sec.nextElementSibling;
  if(rows&&mine.length){if(!rows.querySelector('.rw'))rows.innerHTML='';rows.insertAdjacentHTML('beforeend',mine.map(q=>`<div class="rw"><span class="rn">${q[2]} <b>${q[1]}</b> <span class="mut">×${cnt(q[0])}</span><small>Companion food · put it in a companion's food pouch (P)</small></span></div>`).join(''))}}catch(e){console.warn('v200 cook',e)}return r}}
// ---------------- the pouch ----------------
function cf200P(c){}
function cf200Put(c,k,n){}
function cf200Take(c,k){}
// the bite: shown on this page and on co-op partners' pages
function cf200Fx(x,y,z,amt,ic){try{const p=new THREE.Vector3(x,y,z);burst(p,0x6ee7b7,18,1.6,2,.6);dn(p,(ic||'🍖')+' +'+amt,'#6ee7b7',-12)}catch(_){}}
try{sg2Reg(['cf200Fx'])}catch(_){}
function cf200Eat(c,i){}
setInterval(()=>{try{if(typeof party=='undefined'||!party.length||typeof hero=='undefined'||hero.hp<=0)return;const A=actN141(),now=Date.now();
  party.slice(0,A).forEach((c,i)=>{if(!c||c.h<=0||c.tr200||!c.cf200||!c.cf200.length)return;const t=CF200.pts.includes(c.cf200t)?c.cf200t:.4;
    if(c.h/M(c)>=t||now-(c._cf200||0)<CF200.cd*1000)return;c._cf200=now;cf200Eat(c,i)})}catch(e){console.warn('v200 pouch',e)}},250);
// ---------------- the pouch in the Companions window (P) ----------------
function cf200Html(c){}
{const f=rC0;rC0=function(){const r=f.apply(this,arguments);try{if(!party.length||CE.hat||CE.sel!=null)return r;const c=party[cmpSel],cd=$('cd');if(!c||!cd||cd.querySelector('.cf200'))return r;
  const bt=cd.querySelector('.btns');if(bt)bt.insertAdjacentHTML('beforebegin',cf200Html(c));else cd.insertAdjacentHTML('beforeend',cf200Html(c))}catch(e){console.warn('v200 pouch ui',e)}return r}}
$('cd').addEventListener('click',e=>{const t=e.target.closest('[data-cf200p],[data-cf200o]');if(!t)return;e.stopImmediatePropagation();const c=party[cmpSel];if(!c)return;
  if(t.dataset.cf200p)cf200Put(c,t.dataset.cf200p,+t.dataset.n||1);else cf200Take(c,t.dataset.cf200o);try{rC()}catch(_){}},true);
$('cd').addEventListener('change',e=>{const t=e.target.closest('[data-cf200t]');if(!t)return;const c=party[cmpSel];if(c)c.cf200t=+t.value},true);
document.head.insertAdjacentHTML('beforeend',`<style id="cf200css">
#cd .cf200{margin:8px 0}#cd .cf200s{display:flex;gap:6px;margin:4px 0}
#cd .cf200x{position:relative;flex:1;min-width:0;height:42px;border-radius:7px;border:1px solid rgba(201,162,74,.45);background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;gap:6px;font-size:1.2rem}
#cd .cf200x.e{border-style:dashed;opacity:.5;font-size:.7rem;color:var(--mut)}#cd .cf200x b{font-size:.8rem}
#cd .cf200x button{position:absolute;top:1px;right:1px;padding:0 4px;min-height:0;height:16px;line-height:14px;font-size:.6rem}
#cd .cf200a{display:flex;flex-wrap:wrap;gap:4px}#cd .cf200a button{padding:2px 7px;font-size:.72rem;min-height:0}
#cd .cf200 select{font-size:.7rem;padding:0 2px}
</style>`);
