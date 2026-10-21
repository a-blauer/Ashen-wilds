// ================= v114: beast races in looks, saves, co-op, the creator and the barber =================
// Every hero is its class's animal (rat Warrior, cat Assassin, frog Mage, badger Paladin, weasel Ranger); there is no human
// option. A look keeps its fur / eye colour only when it is one of that animal's colours; anything else (old human saves,
// a co-op partner's human skin tone, a class change) falls back to the animal's first colour.
LOOK_DEF.race=0;
function brFur(D,v,list){const n=mdC(v);if(typeof n=='number'&&isFinite(n))for(const c of list)if(mdC(c)===n)return c;return list[0]}
{const f=lkClean;lkClean=function(o){const r=f.apply(this,arguments);if(o&&BRD[+o.race])r.race=+o.race;return r}}
{const f=lkFull;lkFull=function(cls,part){const r=f.apply(this,arguments),D=brOf(cls);if(!D)return r;r.race=D.id;r.skin=brFur(D,part&&part.skin,D.fur);r.eye=brFur(D,part&&part.eye,D.eye);return r}}
{const f=mdLookN;mdLookN=function(L,cls){const r=f.apply(this,arguments),D=brOf(cls);if(!D)return r;r.race=D.id;r.skin=mdC(brFur(D,L&&L.skin,D.fur));r.eye=mdC(brFur(D,L&&L.eye,D.eye));return r}}
// co-op partners: race follows their class; the array keeps index 8 for older peers
{const f=mpLookOut;mpLookOut=function(){const a=f.apply(this,arguments);try{if(Array.isArray(a))a[8]=mdLookOf(pl,hero.cls).race|0}catch(_){}return a}}
{const f=mpLookIn;mpLookIn=function(a){const r=f.apply(this,arguments);if(r&&Array.isArray(a))r.race=BRD[a[8]|0]?a[8]|0:0;return r}}
// ---------------- creator and barber: the animal's build, height, fur and eye colour ----------------
function brEdCls(){try{if(LK.on)return ccCls;if(LKB.on)return LKB.cls}catch(_){}return hero&&hero.cls}
{const f=lkCtl;lkCtl=function(L){const r=f.apply(this,arguments),cls=brEdCls(),D=brOf(cls);if(!D)return r;
  const g=(t,x)=>`<div class="lkg"><div class="lkl">${t}</div>${x}</div>`,skin=brFur(D,L.skin,D.fur),eye=brFur(D,L.eye,D.eye),
    sw=(k,a,cur)=>`<div class="lks">${a.map(c=>`<button class="lksw${cur==c?' on':''}" data-lk="${k}" data-v="${c}" style="background:${c}" title="${c}" aria-label="${k} ${c}"></button>`).join('')}</div>`;
  return {body:g('Race',`<div class="lkcs"><span class="lkc on" style="cursor:default">${D.n}</span></div>`)+
      g('Build',`<div class="lkcs">${LOOK_OPT.build.map((n,i)=>`<button class="lkc${(+L.build||0)==i?' on':''}" data-lk="build" data-v="${i}">${n}</button>`).join('')}</div>`)+
      g(`Height <b>${Math.round(L.height*100)}%</b>`,`<input class="lkr" type="range" min="0.9" max="1.1" step="0.01" value="${L.height}" data-lk="height" aria-label="Height">`)+g(D.furN||'Fur',sw('skin',D.fur,skin)),
    head:g('Eye colour',sw('eye',D.eye,eye))+`<div class="lkb"><button data-lka="rnd">🎲 Randomize</button><button data-lka="reset">↺ Reset</button></div>`}}}
// randomize / reset stay within the animal's colours
{const f=lkInput;lkInput=function(state,e){const D=brOf(brEdCls()||state.cls),a=e.target&&e.target.closest&&e.target.closest('[data-lka]'),r=f.apply(this,arguments);
  if(a&&D){const R=x=>x[Math.floor(Math.random()*x.length)];state.look=a.dataset.lka=='rnd'?{race:D.id,skin:R(D.fur),eye:R(D.eye),build:Math.floor(Math.random()*3),height:+(.93+Math.random()*.14).toFixed(2)}:{race:D.id,skin:D.fur[0],eye:D.eye[0]}}
  return r}}
