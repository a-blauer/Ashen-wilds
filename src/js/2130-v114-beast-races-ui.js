// ================= v114: beast races in looks, saves, co-op, the creator and the barber =================
LOOK_DEF.race=0;
{const f=lkClean;lkClean=function(o){const r=f.apply(this,arguments);if(o&&BRD[+o.race])r.race=+o.race;return r}}
// a race belongs to one class: other classes drop it (and the fur / eye colours with it)
{const f=lkFull;lkFull=function(cls,part){if(part&&+part.race&&BR_CLS[cls]!==+part.race){part=Object.assign({},part);delete part.race;delete part.skin;delete part.eye}return f.call(this,cls,part)}}
// co-op partners see your race (sent after the 8 look values)
{const f=mpLookOut;mpLookOut=function(){const a=f.apply(this,arguments);try{if(Array.isArray(a))a[8]=mdLookOf(pl,hero.cls).race|0}catch(_){}return a}}
{const f=mpLookIn;mpLookIn=function(a){const r=f.apply(this,arguments);if(r&&Array.isArray(a))r.race=BRD[a[8]|0]?a[8]|0:0;return r}}
// ---------------- creator and barber: a Race row for every class; a beast picks fur and eye colour ----------------
function brEdCls(){try{if(LK.on)return ccCls;if(LKB.on)return LKB.cls}catch(_){}return hero&&hero.cls}
{const f=lkCtl;lkCtl=function(L){const r=f.apply(this,arguments),cls=brEdCls(),D=brOf(cls);if(!D)return r;
  const race=+L.race===D.id?D.id:0,g=(t,x)=>`<div class="lkg"><div class="lkl">${t}</div>${x}</div>`,
    ch=(k,a)=>`<div class="lkcs">${a.map(([v,n])=>`<button class="lkc${race==v?' on':''}" data-lk="${k}" data-v="${v}">${n}</button>`).join('')}</div>`,
    sw=(k,a)=>`<div class="lks">${a.map(c=>`<button class="lksw${L[k]==c?' on':''}" data-lk="${k}" data-v="${c}" style="background:${c}" title="${c}" aria-label="${k} ${c}"></button>`).join('')}</div>`;
  const row=g('Race',ch('race',[[0,'Human'],[D.id,D.n]]));
  if(!race)return {body:row+r.body,head:r.head};
  return {body:row+g('Build',`<div class="lkcs">${LOOK_OPT.build.map((n,i)=>`<button class="lkc${(+L.build||0)==i?' on':''}" data-lk="build" data-v="${i}">${n}</button>`).join('')}</div>`)+
      g(`Height <b>${Math.round(L.height*100)}%</b>`,`<input class="lkr" type="range" min="0.9" max="1.1" step="0.01" value="${L.height}" data-lk="height" aria-label="Height">`)+g(D.furN||'Fur',sw('skin',D.fur)),
    head:g('Eye colour',sw('eye',D.eye))+`<div class="lkb"><button data-lka="rnd">🎲 Randomize</button><button data-lka="reset">↺ Reset</button></div>`}}}
// switching race swaps in that race's colours
{const f=lkSet;lkSet=function(state,k,v){f.apply(this,arguments);if(k!='race')return;const L=state.look,D=BRD[+v];
  if(D){L.skin=D.fur[0];L.eye=D.eye[0]}else{const all=Object.values(BRD);if(all.some(d=>d.fur.includes(L.skin)))delete L.skin;if(all.some(d=>d.eye.includes(L.eye)))delete L.eye}}}
// randomize / reset keep the beast a beast
{const f=lkInput;lkInput=function(state,e){const D=state.look&&BRD[+state.look.race],a=e.target&&e.target.closest&&e.target.closest('[data-lka]'),r=f.apply(this,arguments);
  if(a&&D){const R=x=>x[Math.floor(Math.random()*x.length)];state.look=a.dataset.lka=='rnd'?{race:D.id,skin:R(D.fur),eye:R(D.eye),build:Math.floor(Math.random()*3),height:+(.93+Math.random()*.14).toFixed(2)}:{race:D.id,skin:D.fur[0],eye:D.eye[0]}}
  return r}}
