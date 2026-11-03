// ================= v192 Cheddar (owner, Nov 2 2026): every quest open at once, and quiet, switchable creature coats =================
// 1) "Make Cheddar quests all available for a zone at once, no gated unlocks by quest tier." chq148Open (3075) now always says yes;
//    saved progress (CHQ132.st) is untouched, so half-done tiers in old saves keep it.
// 2) "Skins from completing all quests are too intense and I don't like the fact that they cover all of the companion/mount. I just
//    want an exclusive toggleable skin for the actual creature/companion/mount."
//    * The hero never wears one any more (skn164RaceOf → null; look index 9 goes out as 0). The two old hero rewards became
//      creature coats: Lanternbound (Kindlelight) a companion coat, Sunforged (Searing Sands) a mount coat: 3 + 3.
//    * A coat dresses the creature's own body only: a companion's skinned body loft and the parts made of the same body material
//      (ears, fins); a mount's coat loft (userData.mdlBody). Gear, tack, saddle, rider, evolution armour, glow, sparkles,
//      Devotion glow and fusion stars keep their own materials (sk192Parts).
//    * The look is quiet (SK192): the creature's own markings and baked shading are kept (the coat follows each vertex's
//      brightness), soft countershading (darker back, lighter belly), one gentle pattern per coat (mottle, stripes, dapples,
//      rosettes, fine veins), a fur grain and only a faint rim tint. No pulsing, no glowing cracks.
//    * Switchable per creature: c.sk192 (companion) and m.sk192 (mount) hold the coat id, saved with the companion / mount. Off
//      unless chosen. The Companions window (Overview tab) and the Stable / Mounts windows list each earned coat as a chip.
//      Old saves: a companion coat that was "worn" (v164 SKN164.e.comp) goes to the active companions, a worn mount coat to the
//      active mount, once (x2.skn164.v192 marks a migrated save). Nothing else is switched on.
//    * Co-op: a companion's coat travels in its look (mpvLookOf field `sk`, last); the ridden mount's coat as presence `mts192`
//      (new key). Partners dress the same parts with the same shader (cr wrapper, v150MtTick wrapper).
var SK192={on:true,MC:new Map(),err:0,ui:{},
  // a: back, b: belly / light markings, e: pattern colour, pt: 0 mottle · 1 stripes · 2 dapples · 3 rosettes · 4 veins,
  // pa: pattern strength, ps: pattern scale, r: rim tint, rs: rim strength (faint), ro / me: sheen
  D:{lantern:{a:0x2a211c,b:0x8c6c4c,e:0xb0703a,pt:0,pa:.45,ps:5.5,r:0xffa060,rs:.05,ro:.85,me:0},
     storm:{a:0x262c33,b:0x8a96a2,e:0x4c6680,pt:1,pa:.5,ps:3.2,r:0xa8d4ff,rs:.05,ro:.6,me:.08},
     rime:{a:0x8aa2b4,b:0xe8f0f4,e:0x6a8ca8,pt:2,pa:.4,ps:6.5,r:0xdaf0ff,rs:.06,ro:.55,me:.04},
     sun:{a:0x7a5420,b:0xe0c48c,e:0x4a3012,pt:3,pa:.55,ps:4.2,r:0xffe2a8,rs:.05,ro:.6,me:.1},
     wraith:{a:0x231d2e,b:0x786a90,e:0x463a60,pt:1,pa:.4,ps:3.6,r:0xc4a8ff,rs:.06,ro:.8,me:0},
     blood:{a:0x1a1214,b:0x543234,e:0x6e1c1c,pt:4,pa:.55,ps:3.6,r:0xff6a50,rs:.04,ro:.5,me:.12}},
  // new words for the six rewards (the hero ones are creature coats now)
  T:{lantern:{k:'comp',d:'A charcoal coat with warm amber flecks, like lantern light through smoke.'},
     storm:{k:'mount',d:'A gunmetal coat with soft storm-blue stripes.'},
     rime:{k:'comp',d:'A frost-pale coat dappled like ice on a winter pond.'},
     sun:{k:'mount',d:'An old-gold coat with dark desert rosettes.'},
     wraith:{k:'comp',d:'A violet-shadow coat with faint mist bands.'},
     blood:{k:'mount',d:'An obsidian coat traced with fine crimson veins.'}}};
(function(){for(const id in SK192.T){const S=SKN164.D[id];if(!S)continue;S.k=SK192.T[id].k;S.d=SK192.T[id].d;const P=SK192.D[id];S.a=P.a;S.b=P.b;S.e=P.e}})();
SKN164_KN.comp='Companion';SKN164_KN.mount='Mount';

// ---------------- the coat shader ----------------
var SK192_FH=`
uniform vec3 uA192,uB192,uE192,uR192;uniform float uPt192,uPa192,uPs192,uRs192,uRo192,uMe192,uK192,uSz192;varying vec3 vP192;varying vec3 vN192;
float k192h(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float k192n(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(k192h(i),k192h(i+vec3(1.,0.,0.)),f.x),mix(k192h(i+vec3(0.,1.,0.)),k192h(i+vec3(1.,1.,0.)),f.x),f.y),mix(mix(k192h(i+vec3(0.,0.,1.)),k192h(i+vec3(1.,0.,1.)),f.x),mix(k192h(i+vec3(0.,1.,1.)),k192h(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}
float k192f(vec3 p){return .5*k192n(p)+.25*k192n(p*2.03+3.1)+.125*k192n(p*4.01+7.7)+.125*k192n(p*8.1+1.3);}
vec2 k192v(vec3 p){vec3 i=floor(p),f=fract(p);float d1=8.,d2=8.;
  for(int z=-1;z<=1;z++)for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec3 g=vec3(float(x),float(y),float(z)),o=vec3(k192h(i+g),k192h(i+g+19.1),k192h(i+g+47.3));
    vec3 r=g+o*.8+.1-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}
  return vec2(sqrt(d1),sqrt(d2)-sqrt(d1));}
`;
var SK192_FC=`
{vec3 o0=diffuseColor.rgb;float L=dot(o0,vec3(.299,.587,.114));
  float t=smoothstep(.03,.62,L),up=clamp(normalize(vN192+vec3(0.,1e-4,0.)).y*.5+.5,0.,1.);
  vec3 q=vP192*uPs192*uSz192;float n=k192f(q*.6);
  vec3 c=mix(uA192,uB192,clamp(t*.78+(1.-up)*.28-.08+(n-.5)*.22,0.,1.));
  float pt=0.,back=smoothstep(.25,.75,up);
  if(uPt192<.5)pt=smoothstep(.56,.74,k192f(q*1.2+11.))*back;
  else if(uPt192<1.5){float s=sin(q.z*2.6+(k192f(q*.7)-.5)*5.);pt=smoothstep(.45,.9,s)*smoothstep(.15,.6,up);}
  else if(uPt192<2.5){vec2 v=k192v(q*.9);pt=(1.-smoothstep(.16,.3,v.x))*(.55+.45*back);}
  else if(uPt192<3.5){vec2 v=k192v(q*.8);pt=smoothstep(.1,.17,v.x)*(1.-smoothstep(.24,.33,v.x))*smoothstep(.1,.5,up);}
  else{vec2 v=k192v(q*.9+vec3(k192n(q*.5)*.6));pt=(1.-smoothstep(0.,.05,v.y))*.85;}
  c=mix(c,uE192,clamp(pt*uPa192,0.,1.));
  c*=.93+.14*k192n(q*9.);
  float cl=max(dot(c,vec3(.299,.587,.114)),.02);c*=mix(1.,clamp(L/cl,.55,1.5),.3);
  diffuseColor.rgb=mix(o0,c,uK192);}
`;
var SK192_FE=`
{vec3 nv=normalize(vViewPosition);float fr=pow(1.-clamp(abs(dot(normal,nv)),0.,1.),3.);totalEmissiveRadiance+=uR192*fr*uRs192*uK192;}
`;
function sk192U(id,sz){const P=SK192.D[id],C=c=>({value:new THREE.Color(c)}),v=x=>({value:x});
  return {uA192:C(P.a),uB192:C(P.b),uE192:C(P.e),uR192:C(P.r),uPt192:v(P.pt),uPa192:v(P.pa),uPs192:v(P.ps),uRs192:v(P.rs),uRo192:v(P.ro),uMe192:v(P.me),uK192:v(.9),uSz192:v(sz||1)}}
// a coat copy of a body material (cached per material, coat and size): its own uniforms, one shared program
function sk192Mat(base,id,sz){const k=base.uuid+'|'+id+'|'+(sz||1);let m=SK192.MC.get(k);if(m)return m;
  m=base.clone();const ob=base.onBeforeCompile,ck=base.customProgramCacheKey,U=sk192U(id,sz),P=THREE.Material.prototype;
  m.onBeforeCompile=function(sh,rn){if(ob&&ob!==P.onBeforeCompile)ob.call(this,sh,rn);Object.assign(sh.uniforms,U);
    sh.vertexShader='varying vec3 vP192;varying vec3 vN192;\n'+sh.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nvN192=objectNormal;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvP192=position;');
    sh.fragmentShader=SK192_FH+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+SK192_FC)
      .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,uRo192,uK192);')
      .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,uMe192,uK192);')
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+SK192_FE)};
  m.customProgramCacheKey=function(){return (ck&&ck!==P.customProgramCacheKey?ck.call(base):'')+'|sk192'};
  m.userData=Object.assign({},base.userData,{sk192:id});m.needsUpdate=true;SK192.MC.set(k,m);return m}

// ---------------- which meshes are the creature itself ----------------
function sk192InEvo(o,g){for(let p=o;p&&p!==g;p=p.parent)if(p.userData&&p.userData.evo100)return true;return false}
function sk192Parts(g){if(!g)return [];if(g.userData.sk192P)return g.userData.sk192P;const P=[];
  let body=null;g.traverse(o=>{if(!body&&o.isMesh&&o.userData.mdlBody)body=o});
  if(body){P.push(body);g.userData.sk192Sz=.6}            // a mount: its coat loft only (tack, saddle, reins, flames are other meshes)
  else if(g.b){body=g.b.children.find(m=>m.isSkinnedMesh&&m.skeleton&&!m.userData.evo100&&m.material&&!Array.isArray(m.material)&&m.material.vertexColors);
    if(body){P.push(body);const bm=body.userData.sk192o||body.material,LP=new Set((typeof LPMT!='undefined'?Object.values(LPMT):[]).concat(typeof LP186M!='undefined'?[...LP186M.values()]:[])),eh=bm.emissive?bm.emissive.getHex():0;
      // ears, fins, crests: meshes made of the body's own material family (not glow, not armour, not effects)
      g.traverse(o=>{if(o===body||!o.isMesh||o.isSkinnedMesh||o.isPoints||o.isSprite)return;const m=o.userData.sk192o||o.material;
        if(m&&!Array.isArray(m)&&LP.has(m)&&m.vertexColors&&!m.transparent&&(m.emissive?m.emissive.getHex():0)===eh&&!sk192InEvo(o,g))P.push(o)})}}
  g.userData.sk192P=P;return P}
function sk192Dress(g,id){if(!g)return;const want=id&&SK192.D[id]?id:'';if(g.userData.sk192k===want)return;g.userData.sk192k=want;
  const P=sk192Parts(g),sz=g.userData.sk192Sz||1;
  P.forEach(o=>{const base=o.userData.sk192o||o.material;if(!base||Array.isArray(base))return;
    if(!want){o.material=base;delete o.userData.sk192o;return}o.userData.sk192o=base;o.material=sk192Mat(base,want,sz)})}
// the coat a creature should wear: own ones only when earned; a partner's (mpRemote) when it is a real coat of that kind
function sk192Ok(id,k,remote){const S=SKN164.D[id];return S&&S.k===k&&(remote||SKN164.u.includes(id))?id:null}
function sk192Comp(c){return c?sk192Ok(c.sk192,'comp',!!c.mpRemote):null}
function sk192Mount(m){return m?sk192Ok(m.sk192,'mount',false):null}

// ---------------- the old v164 hooks, quietened ----------------
function skn164RaceOf(h){return null}                      // the hero never wears a coat
function skn164Tick(){try{if(!SK192.on)return;for(let i=0;i<2;i++){const g=typeof fols!='undefined'?fols[i]:null;if(g&&!g.userData.mpFol)sk192Dress(g,sk192Comp(party[i]))}
    if(typeof mModel!='undefined'&&mModel)sk192Dress(mModel,riding?sk192Mount(riding):null)}catch(e){if(!SK192.err++)console.warn('v192 coats',e)}}
function skn164Refresh(){SKN164.e.race=null;try{if(typeof pl!='undefined'&&pl&&pl._mdM&&pl._mdM.c&&pl._mdM.c.userData.skn164)heroOutfit(pl,hero.cls)}catch(_){}skn164Tick()}
// skn164Wear (old API): put the coat on the active companions / the active mount, or take it off them
function skn164Wear(id,on){const S=SKN164.D[id];if(!S||!SKN164.u.includes(id))return;
  if(S.k==='comp')party.slice(0,typeof actN141=='function'?actN141():1).forEach(c=>{if(c)sk192Set(c,on?id:(c.sk192===id?null:c.sk192))});
  else if(S.k==='mount'){const m=typeof mOf=='function'?mOf(mActive):null;if(m)sk192SetM(m,on?id:(m.sk192===id?null:m.sk192))}}
function skn164Unlock(id,silent){const S=SKN164.D[id];if(!S||SKN164.u.includes(id))return false;SKN164.u.push(id);
  const where=S.k==='comp'?'Turn it on for any companion in the Companions window (✨ Exclusive coat)':'Turn it on for any mount at the Stable or in the Mounts window (✨ Exclusive coats)';
  if(!silent){try{zt116Show(ZT116.Z[S.z]||ZT116.Z[0],'Cheddar’s Reward · '+PMAP[S.z].n,S.n,'Exclusive '+SKN164_KN[S.k].toLowerCase()+' coat unlocked',where,'z'+S.z)}catch(_){}
    try{pickup({ic:'✨',t:'Exclusive coat: '+S.n,col:'#'+new THREE.Color(S.b).getHexString(),sub:SKN164_KN[S.k]+' coat · every '+PMAP[S.z].n+' quest done',r:4})}catch(_){}
    try{mSfx('rare')}catch(_){try{sfx('chime')}catch(__){}}
    say('🐭✨ Every one of Cheddar’s <b>'+PMAP[S.z].n+'</b> quests is done. Your reward: the exclusive <b>'+S.n+'</b> '+SKN164_KN[S.k].toLowerCase()+' coat. '+where+'.')}
  skn164Refresh();return true}

// ---------------- switching a coat on / off ----------------
function sk192Coop(){try{if(typeof MP!='undefined')MP.lastPres=''}catch(_){}}
function sk192Set(c,id){if(!c)return;const v=id&&sk192Ok(id,'comp',false);if(v)c.sk192=v;else delete c.sk192;
  const i=party.indexOf(c);if(i>=0&&i<2&&typeof fols!='undefined'&&fols[i])sk192Dress(fols[i],sk192Comp(c));sk192Coop()}
function sk192SetM(m,id){if(!m)return;const v=id&&sk192Ok(id,'mount',false);if(v)m.sk192=v;else delete m.sk192;
  if(riding===m&&typeof mModel!='undefined'&&mModel)sk192Dress(mModel,sk192Mount(m));sk192Coop()}
function sk192Have(k){return SKN164_Z.filter(id=>SKN164.u.includes(id)&&SKN164.D[id].k===k)}
function sk192Css(c){return '#'+new THREE.Color(c).getHexString()}
function sk192Chips(cur,list,attr,who){return '<span class="sk192ch"><button class="'+(cur?'':'on')+'" '+attr+'="" data-sk192w="'+who+'">Off</button>'+
  list.map(id=>{const S=SKN164.D[id],P=SK192.D[id];return '<button class="'+(cur===id?'on':'')+'" '+attr+'="'+id+'" data-sk192w="'+who+'" title="'+S.d.replace(/"/g,'&quot;')+'">'+
    '<i style="background:radial-gradient(circle at 35% 30%,'+sk192Css(P.b)+','+sk192Css(P.a)+' 75%);box-shadow:inset 0 0 0 2px '+sk192Css(P.e)+'"></i>'+S.n+'</button>'}).join('')+'</span>'}

// the creature models: a companion built anywhere (own follower, window preview, a partner's copy) wears its coat
{const f=cr;cr=function(c){const g=f.apply(this,arguments);try{const id=SK192.on&&sk192Comp(c);if(g&&id)sk192Dress(g,id)}catch(e){if(!SK192.err++)console.warn('v192 coat',e)}return g}}
// the ridden mount wears its coat from the first frame (the 400 ms tick catches every other way of mounting)
{const f=toggleMount;toggleMount=function(){const r=f.apply(this,arguments);try{if(riding&&mModel)sk192Dress(mModel,sk192Mount(riding));sk192Coop()}catch(_){}return r}}
// the mount preview in the Stable / Mounts window: the coat of the owned mount of that kind (the active one first)
{const f=mPreview;mPreview=function(k){const r=f.apply(this,arguments);try{if(mPV&&mPV.m){const a=mOf(mActive),m=a&&a.k===k?a:mounts.find(q=>q.k===k&&q.sk192);sk192Dress(mPV.m,sk192Mount(m))}}catch(_){}return r}}

// ---------------- the Companions window: ✨ Exclusive coat (Overview tab) ----------------
{const f=rC0;rC0=function(){const r=f.apply(this,arguments);try{const c=party[cmpSel],cd=$('cd');if(!c||!cd)return r;const L=sk192Have('comp');if(!L.length||cd.querySelector('.sk192r'))return r;
  const ov=cd.querySelector('.kqm-cpane[data-kqc="ov"]')||cd,sum=ov.querySelector('.kqm-csum');
  const h='<div class="sk192r"><span>✨ Exclusive coat</span>'+sk192Chips(sk192Comp(c),L,'data-sk192c','c')+'</div>';
  if(sum)sum.insertAdjacentHTML('afterend',h);else ov.insertAdjacentHTML('beforeend',h)}catch(err){console.warn('v192 coat ui',err)}return r}}
$('cd').addEventListener('click',e=>{const b=e.target.closest('[data-sk192c]');if(!b)return;e.stopImmediatePropagation();const c=party[cmpSel];if(!c)return;
  sk192Set(c,b.dataset.sk192c||null);try{sfx('chime')}catch(_){}try{rC()}catch(_){}},true);

// ---------------- the Stable and Mounts windows: ✨ Exclusive coats per owned mount ----------------
function sk192MountSec(){const L=sk192Have('mount');if(!L.length||!mounts.length)return '';
  return '<div class="sec">✨ Exclusive coats</div><div class="sk192m">'+mounts.map(m=>{const D=MOUNTS[m.k]||{};
    return '<div class="sk192r"><span>'+(D.i||'🐎')+' <b>'+m.n+'</b></span>'+sk192Chips(sk192Mount(m),L,'data-sk192m','m'+m.id)+'</div>'}).join('')+'</div>'}
['mounts','stable'].forEach(w=>{const f=XR[w];if(!f)return;XR[w]=function(){const r=f.apply(this,arguments);try{const col=$('xwB').querySelector('.xcols>div')||$('xwB');const h=sk192MountSec();if(col&&h)col.insertAdjacentHTML('beforeend',h)}catch(e){console.warn('v192 mount coats',e)}return r}});
$('xw').addEventListener('click',e=>{if(xwMode!='mounts'&&xwMode!='stable')return;const b=e.target.closest('[data-sk192m]');if(!b)return;e.stopImmediatePropagation();
  const m=mOf(+String(b.dataset.sk192w).slice(1));if(!m)return;sk192SetM(m,b.dataset.sk192m||null);mSel=m.k;mPVk='';try{sfx('chime')}catch(_){}rX()},true);

// ---------------- Cheddar's board: the zone's coat card (earned, where to switch it on) ----------------
function skn164Card(z){const id=SKN164_Z[z],S=SKN164.D[id];if(!S)return '';const P=SK192.D[id],st=chq148State(z),have=SKN164.u.includes(id),pc=Math.round(st.dn/Math.max(1,st.n)*100);
  const who=S.k==='comp'?'any companion (Companions window)':'any mount (Stable / Mounts window)';
  return '<div class="sk164 sk192c'+(have?' have':'')+'" style="--a:'+sk192Css(P.a)+';--b:'+sk192Css(P.b)+';--e:'+sk192Css(P.e)+'">'+
    '<div class="sk164sw"><i></i><s></s></div><div class="sk164t"><div class="sk164l">✨ Exclusive '+SKN164_KN[S.k].toLowerCase()+' coat · '+(have?'earned':'finish every quest here')+'</div>'+
    '<b>'+S.n+'</b><div class="sk164d">'+S.d+' <span class="mut">'+(have?'Switch it on for ':'For ')+who+'.</span></div>'+
    (have?'':'<div class="sk164p"><i style="width:'+pc+'%"></i></div><small>'+st.dn+' of '+st.n+' quests turned in</small>')+'</div>'+
    (have?'<span class="sk192ok" title="Earned">✓</span>':'<span class="sk164lk" title="Locked">🔒</span>')+'</div>'}

// ---------------- co-op ----------------
// the hero sends no skin (look index 9 stays 0, as before v164)
{const f=mpLookOut;mpLookOut=function(){const a=f.apply(this,arguments);try{if(Array.isArray(a))a[9]=0}catch(_){}return a}}
{const f=mpvLookOf;mpvLookOf=function(c){const L=f.apply(this,arguments);try{const id=sk192Comp(c);if(L&&id)L.sk=id}catch(_){}return L}}
{const f=mpvLookIn;mpvLookIn=function(L){const c=f.apply(this,arguments);try{if(c&&L&&typeof L.sk=='string'&&SKN164.D[L.sk]&&SKN164.D[L.sk].k==='comp')c.sk192=L.sk}catch(_){}return c}}
// a companion's look changed (a coat switched): send presence now, not only when something moves
{const f=mpvMine;mpvMine=function(){const k0=MPV.ckK;const r=f.apply(this,arguments);try{if(MPV.ckK!==k0)MP.lastPres=''}catch(_){}return r}}
{const f=MP.room.presence;MP.room.presence=function(p){if(p&&typeof p=='object'&&typeof p.x=='number'){try{p.mts192=riding&&mModel?(sk192Mount(riding)||0):0}catch(_){p.mts192=0}}return f.apply(this,arguments)}}
{const f=v150MtTick;v150MtTick=function(now){const r=f.apply(this,arguments);
  for(const k in MP.rh){const R=MP.rh[k];if(!R||!R.mt150||!R.mt150.g)continue;const id=R.pr&&R.pr.mts192,ok=typeof id=='string'&&SKN164.D[id]&&SKN164.D[id].k==='mount'?id:null;sk192Dress(R.mt150.g,ok)}
  return r}}

// ---------------- saves: coats live on the companion / mount (c.sk192, m.sk192); a v164 save's worn coats move over once ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{if(o.skn164){o.skn164.v192=1;o.skn164.e={race:null,comp:null,mount:null}}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const q=s&&s.skn164,old=q&&!q.v192&&q.e?Object.assign({},q.e):null;const r=f.apply(this,arguments);
  try{if(old){const c0=SKN164.D[old.comp]&&SKN164.u.includes(old.comp)?old.comp:null,m0=SKN164.D[old.mount]&&SKN164.u.includes(old.mount)?old.mount:null;
      if(c0&&SKN164.D[c0].k==='comp')party.slice(0,typeof actN141=='function'?actN141():1).forEach(c=>{if(c&&!c.sk192)c.sk192=c0});
      if(m0&&SKN164.D[m0].k==='mount'){const m=typeof mOf=='function'?(mOf(mActive)||mounts[0]):null;if(m&&!m.sk192)m.sk192=m0}}
    SKN164.e={race:null,comp:null,mount:null};
    // coats on companions / mounts that are not earned (or of the wrong kind) are dropped
    (party||[]).forEach(c=>{if(c&&c.sk192&&!sk192Ok(c.sk192,'comp',false))delete c.sk192});(mounts||[]).forEach(m=>{if(m&&m.sk192&&!sk192Ok(m.sk192,'mount',false))delete m.sk192});
    setTimeout(()=>{try{skn164Refresh()}catch(_){}},0)}catch(e){console.warn('v192 coats load',e)}return r}}

document.head.insertAdjacentHTML('beforeend',`<style>
.sk192r{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;margin:8px 0 4px;padding:6px 8px;border-radius:8px;border:1px solid rgba(216,184,96,.22);background:rgba(30,22,14,.35);font-size:.8rem}
.sk192r>span:first-child{color:#d8c08a;min-width:110px}
.sk192ch{display:flex;flex-wrap:wrap;gap:4px}
.sk192ch button{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;padding:3px 8px;border-radius:99px;opacity:.75}
.sk192ch button.on{opacity:1;border-color:#d8b860;box-shadow:0 0 0 1px rgba(216,184,96,.5) inset;color:#f4e2a8}
.sk192ch i{display:inline-block;width:12px;height:12px;border-radius:50%}
.sk192m .sk192r{margin:4px 0}
#xw .sk164.sk192c.have{box-shadow:none}
#xw .sk164.sk192c .sk164sw i{opacity:.22;animation:none;mix-blend-mode:normal}
#xw .sk164.sk192c .sk164sw s{box-shadow:inset 0 0 6px rgba(0,0,0,.45)}
#xw .sk192ok{font-size:1.2rem;color:#d8b860;flex:none}
</style>`);
