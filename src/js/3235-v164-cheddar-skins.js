// ================= v164 Cheddar's board: eight quests a zone, and an exclusive skin for finishing them all =================
// Owner: "reduce the amount of cheddar quests in each zone to 8 total and award the player with an exclusive and extra cool looking
// cosmetic skin variant for either a playable animal race or a companion or mount if they do all the quests in a zone."
//  * Quests: every zone's list (CHQD148) is exactly 8 (Easy · Medium · Hard). Kindlelight and Hillside Crest drop their menu chores;
//    the Sands, the Dirge and the Citadel gain one or two. Removed quests keep their ids in CHQ132_ID (old saves load) but no longer
//    show or count.
//  * Skins (SKN164.D, one per zone, SKN164_Z[zone]): turning in the last of a zone's 8 quests unlocks its skin (title card, splash),
//    and it is worn at once. Each is a shader skin, not just a colour: a base palette, a procedural pattern in the model's own
//    space (it moves with the body) and glowing animated veins, a rim light, and its own sheen (roughness / metalness):
//      Kindlelight  Lanternbound  hero (any race)  charcoal fur threaded with flowing ember-light
//      Hillside     Stormmane     mount            gunmetal coat crackling with blue lightning
//      Burningeye   Rimeborn      companions       frost-white hide, glowing ice veins and sparkles
//      Searing Sands Sunforged    hero (any race)  hammered gold with molten seams
//      The Dirge    Wraithveil    companions       violet shadow with drifting ghost-light
//      The Citadel  Bloodcrown    mount            obsidian split by pulsing crimson veins
//    Where it goes: hero skins replace the fur only (the look's fur colour becomes a sentinel magenta, SKN164.SENT, when building the
//    model; the shader finds those vertices, mode 0), so armour and gear keep their colours; companion skins cover the whole creature
//    (mode 1, the cloth/hide material, never metal or glow); mount skins cover the coat (mode 2: vertices whose colour matches the mount's
//    own coat colours, MDL100_S[k].c/c2/bel/m), not the tack. One skin of each kind can be worn (SKN164.e.race / .comp / .mount);
//    Cheddar's board shows the zone's skin above its quests with progress, and Wear / Take off once it is earned.
//  * Saved as x2.skn164 {u: unlocked ids, e: worn per kind}. Co-op: the hero's skin travels in the look array (index 9).
var SKN164={u:[],e:{race:null,comp:null,mount:null},SENT:0xff00ff,t:{value:0},U:{},MC:new Map(),O:new WeakMap(),B:new WeakMap(),poll:0,v:164,D:{
  lantern:{n:'Lanternbound',k:'race',z:0,d:'Charcoal fur threaded with living ember-light: the glow of Kindlelight’s lanterns under your skin.',a:0x161214,b:0x4a3a32,e:0xff9a2a,r:0xff6a1a,rs:.22,sc:9,w:.055,pw:1.5,ro:.85,me:0,fx:0},
  storm:{n:'Stormmane',k:'mount',z:1,d:'A gunmetal coat that crackles with the Crest’s thunderheads.',a:0x1e242a,b:0x6a7888,e:0x8adcff,r:0x5aa8ff,rs:.35,sc:4.5,w:.045,pw:2.0,ro:.45,me:.4,fx:1},
  rime:{n:'Rimeborn',k:'comp',z:2,d:'Frost-white hide grown from the Summit’s ice. It sparkles, and glows from within.',a:0x6a94b8,b:0xeaf6ff,e:0x6ae8ff,r:0xbff4ff,rs:.55,sc:6,w:.07,pw:1.1,ro:.28,me:.12,fx:2},
  sun:{n:'Sunforged',k:'race',z:3,d:'Fur like hammered gold, its seams still molten from the heat of the Sands.',a:0xa0701e,b:0xffe08a,e:0xffa630,r:0xffd890,rs:.5,sc:8,w:.05,pw:1.35,ro:.5,me:.18,fx:0},
  wraith:{n:'Wraithveil',k:'comp',z:4,d:'A spectral shroud from the Dirge’s mists: violet shadow and drifting ghost-light.',a:0x150f22,b:0x5a4a80,e:0xb47aff,r:0xc89aff,rs:.9,sc:5,w:.09,pw:1.25,ro:.6,me:0,fx:3},
  blood:{n:'Bloodcrown',k:'mount',z:5,d:'Obsidian hide split by molten crimson veins, fit for the Crimson King’s own steed.',a:0x0e090b,b:0x3a2024,e:0xff2a14,r:0xff3a1a,rs:.3,sc:5,w:.065,pw:1.8,ro:.38,me:.25,fx:0}}};
var SKN164_Z=['lantern','storm','rime','sun','wraith','blood'];
var SKN164_KN={race:'Hero',comp:'Companion',mount:'Mount'};

// ---------------- eight quests a zone ----------------
(function(){const Q=CHQ132_ID,keep=(z,ids)=>{CHQD148[z]=ids.map(id=>Q[id]).filter(Boolean)};
  const add=(z,q)=>{q.z=z;q.ik='z'+z;if(!q.rw)q.rw='gear';CHQ132_ID[q.id]=q;return q};
  keep(0,['k1a','k1b','k3b','k2a','k2c','c0a','c0b','c0c']);
  Q.k3b.df=1;Q.k2a.df=2;Q.k2c.df=2;
  keep(1,['h1b','c1a','h2c','h1c','c1b','h2a','c1c','h1a']);
  Q.h2c.df=1;
  CHQD148[3].splice(5,0,add(3,{id:'c3h',t:'Buried Caravans',d:'Caravans the dunes swallowed whole. Their strongboxes always end up in the camps. Open five.',o:[['chest',5,'Camp chests opened']],df:2,rw:'gear'}));
  CHQD148[4].splice(5,0,add(4,{id:'c4h',t:'Sunken Purses',d:'Pilgrims drowned their coin in the black water. Fish up two gold pouches. Don’t look at what holds them.',o:[['pouch',2,'Gold pouches fished up']],df:2,rw:'egg'}));
  CHQD148[5].splice(2,0,add(5,{id:'c5g',t:'Rations for the March',d:'An army marches on its stomach, and so do yours. Feed your companions six times.',o:[['feed',6,'Companions fed']],df:1,rw:'boots'}));
  CHQD148[5].splice(5,0,add(5,{id:'c5h',t:'Forged for the Siege',d:'Have the Blacksmith forge your weapon to +2 or better, then kill something in the Citadel with it.',o:[['forgeKill',1,'Kill with a +2 forged weapon']],df:2,rw:'weapon'}));
  for(const z in CHQD148)CHQD148[z].forEach(q=>{q.z=+z;q.ik='z'+z})})();

// ---------------- the skin shader ----------------
function skn164U(id){if(SKN164.U[id])return SKN164.U[id];const S=SKN164.D[id],C=c=>new THREE.Color(c);
  return SKN164.U[id]={uT164:SKN164.t,uA164:{value:C(S.a)},uB164:{value:C(S.b)},uE164:{value:C(S.e)},uR164:{value:C(S.r)},uSc164:{value:S.sc},uW164:{value:S.w},
    uPw164:{value:S.pw},uRs164:{value:S.rs},uRo164:{value:S.ro},uMe164:{value:S.me},uFx164:{value:S.fx}}}
var SKN164_FH=`
uniform float uT164,uSc164,uW164,uPw164,uRs164,uRo164,uMe164,uFx164,uMode164;uniform vec3 uA164,uB164,uE164,uR164,uC0164,uC1164,uC2164,uC3164;varying vec3 vP164;
float k164h(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float k164n(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(k164h(i),k164h(i+vec3(1.,0.,0.)),f.x),mix(k164h(i+vec3(0.,1.,0.)),k164h(i+vec3(1.,1.,0.)),f.x),f.y),mix(mix(k164h(i+vec3(0.,0.,1.)),k164h(i+vec3(1.,0.,1.)),f.x),mix(k164h(i+vec3(0.,1.,1.)),k164h(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}
float k164f(vec3 p){return .5*k164n(p)+.25*k164n(p*2.03+3.1)+.125*k164n(p*4.01+7.7)+.0625*k164n(p*8.1+1.3);}
// crackle: distance to the nearest cell wall (Voronoi F2-F1), cells drifting slowly
float k164v(vec3 p,float t){vec3 i=floor(p),f=fract(p);float d1=8.,d2=8.;
  for(int z=-1;z<=1;z++)for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec3 g=vec3(float(x),float(y),float(z)),o=vec3(k164h(i+g),k164h(i+g+19.1),k164h(i+g+47.3));
    o=.5+.38*sin(t*.35+6.2831*o);vec3 r=g+o-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}
  return sqrt(d2)-sqrt(d1);}
float k164c(vec3 a,vec3 c){float m=max(a.r,max(a.g,a.b)),n=max(c.r,max(c.g,c.b));return length(a/max(m,.001)-c/max(n,.001))+abs(m-n)*.3;}
`;
var SKN164_FC=`
float m164=0.;
#ifdef USE_COLOR
{vec3 c=vColor.rgb;float mx=max(c.r,max(c.g,c.b));
  if(uMode164<.5)m164=smoothstep(.12,.3,(min(c.r,c.b)-c.g)/max(mx,.001))*(1.-smoothstep(.1,.22,abs(c.r-c.b)/max(mx,.001)));
  else if(uMode164<1.5)m164=1.;
  else{float d=min(min(k164c(c,uC0164),k164c(c,uC1164)),min(k164c(c,uC2164),k164c(c,uC3164)));m164=1.-smoothstep(.12,.26,d);}
  float wh=uMode164<.5?clamp(c.g/max(mx,.001)*1.7,0.,1.):clamp(dot(c,vec3(.3,.59,.11))*1.6,0.,1.),dk=uMode164<.5?mx:1.,pt=k164f(vP164*uSc164*1.6);
  vec3 b=mix(uA164,uB164,clamp(wh*.85+pt*.4-.1,0.,1.))*(.5+.5*dk);
  diffuseColor.rgb=mix(diffuseColor.rgb,b,m164);}
#endif
`;
var SKN164_FE=`
if(m164>.001){vec3 q=vP164*uSc164;float t=uT164;
  vec3 qw=q+(vec3(k164n(q*.7+3.),k164n(q*.7+11.),k164n(q*.7+23.))-.5)*.9;
  float v=k164f(q*.8+vec3(0.,t*.1,t*.04)),e1=k164v(qw,t),vein=1.-smoothstep(0.,uW164*2.2,e1);
  vein=max(vein,(1.-smoothstep(0.,uW164*1.5,k164v(qw*2.3+5.,t*1.3)))*.45);
  if(uFx164>2.5){float b=abs(fract(dot(vP164,vec3(.8,2.6,.5))*1.4+v*1.6-t*.18)-.5);vein=max(vein*.5,1.-smoothstep(0.,uW164*2.5,b));}
  float pu;
  if(uFx164<.5)pu=.35+.65*pow(.5+.5*sin(t*2.2-dot(vP164,vec3(2.,5.,1.5))*2.6),2.);
  else if(uFx164<1.5)pu=.18+.9*step(.6,k164n(vec3(q.x*.7,q.y*.7+t*6.,t*11.)))+.15*sin(t*31.);
  else if(uFx164<2.5)pu=.55+.45*sin(t*1.4+v*9.);
  else pu=.4+.6*pow(.5+.5*sin(t*1.1+vP164.y*5.+v*6.),1.5);
  float sp=0.;if(uFx164>1.5&&uFx164<2.5)sp=step(.982,k164h(floor(q*10.)+vec3(floor(t*4.))))*1.6;
  vec3 nv=normalize(vViewPosition);float fr=pow(1.-clamp(abs(dot(normal,nv)),0.,1.),2.4);
  totalEmissiveRadiance+=m164*(uE164*(vein*pu*uPw164+sp)+uR164*fr*uRs164);}
`;
// patch a material (it must be the model's own, or a clone made here): mode 0 fur sentinel, 1 whole, 2 coat colours (cols: up to 4)
function skn164Patch(m,id,mode,cols){if(!m||!SKN164.D[id])return m;if(!SKN164.O.has(m))SKN164.O.set(m,{ob:m.onBeforeCompile,ck:m.customProgramCacheKey});
  const o=SKN164.O.get(m),U=skn164U(id),C=(cols||[]).concat([0,0,0,0]).slice(0,4).map(c=>({value:new THREE.Color(c||0xff00ff)})),mu={uMode164:{value:mode},uC0164:C[0],uC1164:C[1],uC2164:C[2],uC3164:C[3]};
  m.onBeforeCompile=(sh,rn)=>{if(o.ob&&o.ob!==THREE.Material.prototype.onBeforeCompile)o.ob.call(m,sh,rn);Object.assign(sh.uniforms,U,mu);
    sh.vertexShader='varying vec3 vP164;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvP164=position;');
    sh.fragmentShader=SKN164_FH+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+SKN164_FC)
      .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,uRo164,m164);')
      .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,uMe164,m164);')
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+SKN164_FE)};
  m.customProgramCacheKey=function(){return (o.ck&&o.ck!==THREE.Material.prototype.customProgramCacheKey?o.ck.call(m):'')+'|skn164'};
  m.userData.skn164=id;m.needsUpdate=true;return m}
function skn164Unpatch(m){if(!m||!SKN164.O.has(m)||!m.userData.skn164)return;const o=SKN164.O.get(m);m.onBeforeCompile=o.ob;m.customProgramCacheKey=o.ck;delete m.userData.skn164;m.needsUpdate=true}
// a skin copy of a shared material (companions, mounts), cached per material and skin
function skn164Copy(base,id,mode,cols,tag){const k=base.uuid+'|'+id+'|'+(tag||'');let m=SKN164.MC.get(k);if(m)return m;m=base.clone();SKN164.B.set(m,base);skn164Patch(m,id,mode,cols);SKN164.MC.set(k,m);return m}
function skn164Fits(m){return m&&!Array.isArray(m)&&m.isMeshStandardMaterial&&m.vertexColors&&(m.metalness||0)<.5}

// ---------------- the hero: fur becomes the sentinel while the model is built; the hero's own material gets the shader ----------------
function skn164RaceOf(h){try{if(h&&h.mdLook){const id=h.mdLook.skn164;return SKN164.D[id]&&SKN164.D[id].k=='race'?id:null}if(h&&h.mpPeer)return null;return SKN164.e.race}catch(_){return null}}
{const f=mdLookOf;mdLookOf=function(h,cls){const r=f.apply(this,arguments);try{const id=skn164RaceOf(h);if(id&&r){r.skin=SKN164.SENT;r.skn164=id}}catch(_){}return r}}
{const f=mdLookKey;mdLookKey=function(L){return f.apply(this,arguments)+(L&&L.skn164?'.s'+L.skn164:'')}}
{const f=mdHeroApply;mdHeroApply=function(h,cls,E){const r=f.apply(this,arguments);try{const M=h&&h._mdM,L=h&&h.mdL;if(M&&M.c){const id=L&&L.skn164;
    if(id&&M.c.userData.skn164!==id)skn164Patch(M.c,id,0);else if(!id&&M.c.userData.skn164)skn164Unpatch(M.c)}}catch(e){console.warn('v164 skin',e)}return r}}
// co-op: the hero's skin rides in the look array (index 9)
{const f=mpLookOut;mpLookOut=function(){const a=f.apply(this,arguments);try{if(Array.isArray(a))a[9]=SKN164.e.race||0}catch(_){}return a}}
{const f=mpLookIn;mpLookIn=function(a){const r=f.apply(this,arguments);try{if(r&&Array.isArray(a)){const id=a[9];r.skn164=SKN164.D[id]&&SKN164.D[id].k=='race'?id:null}}catch(_){}return r}}

// ---------------- companions and the mount: their shared materials are swapped for skin copies ----------------
function skn164Dress(root,id,mode,cols,tag){if(!root)return;const want=id||null,key=want?want+'|'+(tag||''):'';if(root.userData.skn164k===key)return;root.userData.skn164k=key;
  root.traverse(o=>{if(!o.isMesh)return;const cur=o.material,base=(cur&&SKN164.B.get(cur))||cur;
    if(!want){if(cur!==base)o.material=base;return}if(!skn164Fits(base))return;o.material=skn164Copy(base,want,mode,cols,tag)})}
function skn164MountCols(k){const S=(typeof MDL100_S!='undefined'&&(MDL100_S[k]||MDL100_S.pony))||{};return [S.c,S.c2,S.bel,S.m].filter(c=>c!=null)}
function skn164Tick(){try{const c=SKN164.e.comp;if(typeof fols!='undefined')fols.forEach(g=>{if(g)skn164Dress(g,c,1)});
    const m=SKN164.e.mount;if(typeof mModel!='undefined'&&mModel&&typeof riding!='undefined'&&riding){const k=riding.k;skn164Dress(mModel,m,2,skn164MountCols(k),k)}}catch(e){if(!SKN164.err++)console.warn('v164 skins',e)}}
SKN164.err=0;
{const f=loop;loop=function(t){SKN164.t.value=performance.now()/1000;if(performance.now()-SKN164.poll>400){SKN164.poll=performance.now();skn164Tick()}return f.apply(this,arguments)}}

// ---------------- earning, wearing ----------------
function skn164ZoneDone(z){const L=CHQD148[z]||[];return L.length>0&&L.every(q=>{const S=chqS132(q);return S&&S.s===3})}
function skn164Wear(id,on){const S=SKN164.D[id];if(!S||!SKN164.u.includes(id))return;SKN164.e[S.k]=on?id:(SKN164.e[S.k]===id?null:SKN164.e[S.k]);skn164Refresh()}
function skn164Refresh(){try{if(SKN164.e.race!==SKN164.lastRace){SKN164.lastRace=SKN164.e.race;heroOutfit(pl,hero.cls)}}catch(e){console.warn('v164 hero skin',e)}skn164Tick()}
function skn164Unlock(id,silent){const S=SKN164.D[id];if(!S||SKN164.u.includes(id))return false;SKN164.u.push(id);if(!SKN164.e[S.k])SKN164.e[S.k]=id;
  if(!silent){try{zt116Show(ZT116.Z[S.z]||ZT116.Z[0],'Cheddar’s Reward · '+PMAP[S.z].n,S.n,'Exclusive '+SKN164_KN[S.k].toLowerCase()+' skin unlocked','Wear or take it off at Cheddar’s quest board','z'+S.z)}catch(_){}
    try{pickup({ic:'✨',t:'Exclusive skin: '+S.n,col:'#'+new THREE.Color(S.e).getHexString(),sub:SKN164_KN[S.k]+' skin · every '+PMAP[S.z].n+' quest done',r:4})}catch(_){}
    try{mSfx('rare')}catch(_){try{sfx('chime')}catch(__){}}
    say('🐭✨ Every one of Cheddar’s <b>'+PMAP[S.z].n+'</b> quests is done. Your reward: the exclusive <b>'+S.n+'</b> '+SKN164_KN[S.k].toLowerCase()+' skin'+(SKN164.e[S.k]===id?' (now worn)':'')+'.')}
  skn164Refresh();return true}
function skn164Check(silent){let n=0;SKN164_Z.forEach((id,z)=>{if(!SKN164.u.includes(id)&&skn164ZoneDone(z)&&skn164Unlock(id,silent))n++});return n}
{const f=chqTurnIn132;chqTurnIn132=function(){const r=f.apply(this,arguments);try{skn164Check(false)}catch(e){console.warn('v164 unlock',e)}return r}}
if(typeof cheatQuests147=='function'){const f=cheatQuests147;cheatQuests147=function(){const r=f.apply(this,arguments);try{skn164Check(false)}catch(_){}return r}}
// ---------------- saves ----------------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};try{o.skn164={u:SKN164.u.slice(),e:Object.assign({},SKN164.e)}}catch(_){}return o}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{const q=s&&s.skn164;SKN164.u=[];SKN164.e={race:null,comp:null,mount:null};
    if(q){(Array.isArray(q.u)?q.u:[]).forEach(id=>{if(SKN164.D[id]&&!SKN164.u.includes(id))SKN164.u.push(id)});
      if(q.e)for(const k in SKN164.e){const id=q.e[k];if(SKN164.D[id]&&SKN164.D[id].k===k&&SKN164.u.includes(id))SKN164.e[k]=id}}
    skn164Check(true);SKN164.lastRace=undefined;setTimeout(()=>{try{skn164Refresh()}catch(_){}},0)}catch(e){console.warn('v164 skins load',e)}return r}}

// ---------------- Cheddar's board: the zone's skin above its quests ----------------
function skn164Css(c){return '#'+new THREE.Color(c).getHexString()}
function skn164Card(z){const id=SKN164_Z[z],S=SKN164.D[id];if(!S)return '';const st=chq148State(z),have=SKN164.u.includes(id),on=SKN164.e[S.k]===id,pc=Math.round(st.dn/Math.max(1,st.n)*100);
  const who={race:'your hero, whatever its race',comp:'your companions',mount:'the mount you ride'}[S.k];
  return '<div class="sk164'+(have?' have':'')+(on?' on':'')+'" style="--a:'+skn164Css(S.a)+';--b:'+skn164Css(S.b)+';--e:'+skn164Css(S.e)+'">'+
    '<div class="sk164sw"><i></i><s></s></div><div class="sk164t"><div class="sk164l">✨ Exclusive '+SKN164_KN[S.k].toLowerCase()+' skin · '+(have?'earned':'finish every quest here')+'</div>'+
    '<b>'+S.n+'</b><div class="sk164d">'+S.d+' <span class="mut">For '+who+'.</span></div>'+
    (have?'':'<div class="sk164p"><i style="width:'+pc+'%"></i></div><small>'+st.dn+' of '+st.n+' quests turned in</small>')+'</div>'+
    (have?'<button class="'+(on?'':'pri ')+'sk164b" data-sk164="'+id+'">'+(on?'Take off':'Wear it')+'</button>':'<span class="sk164lk" title="Locked">🔒</span>')+'</div>'}
{const f=XR.chq132;XR.chq132=function(){const r=f.apply(this,arguments);try{const z=CHQ148.tab;if(z!=null)$('xwB').insertAdjacentHTML('afterbegin',skn164Card(z))}catch(e){console.warn('v164 card',e)}return r}}
$('xw').addEventListener('click',e=>{if(xwMode!='chq132')return;const t=e.target.closest('[data-sk164]');if(!t)return;const id=t.dataset.sk164,S=SKN164.D[id];if(!S)return;
  skn164Wear(id,SKN164.e[S.k]!==id);try{sfx('chime')}catch(_){}rX()});
document.head.insertAdjacentHTML('beforeend',`<style>
#xw .sk164{display:flex;align-items:center;gap:12px;margin:0 0 12px;padding:10px 12px;border-radius:10px;border:1px solid rgba(216,168,68,.35);
  background:linear-gradient(90deg,rgba(30,20,10,.85),rgba(20,14,10,.6));position:relative;overflow:hidden}
#xw .sk164.have{border-color:var(--e);box-shadow:0 0 14px -4px var(--e)}
#xw .sk164sw{flex:none;width:58px;height:58px;border-radius:50%;position:relative;background:radial-gradient(circle at 35% 30%,var(--b),var(--a) 70%);border:2px solid rgba(255,255,255,.18);overflow:hidden}
#xw .sk164sw i{position:absolute;inset:0;background:repeating-linear-gradient(115deg,transparent 0 9px,var(--e) 9px 11px,transparent 11px 19px);opacity:.75;mix-blend-mode:screen;animation:sk164v 3s linear infinite}
#xw .sk164sw s{position:absolute;inset:0;border-radius:50%;box-shadow:inset 0 0 12px var(--e)}
#xw .sk164:not(.have) .sk164sw{filter:grayscale(.7) brightness(.6)}
@keyframes sk164v{from{background-position:0 0}to{background-position:40px 0}}
#xw .sk164t{flex:1;min-width:0}#xw .sk164l{font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:#d8b860}
#xw .sk164t b{display:block;font-size:1.05rem;color:#f4e2a8;margin:1px 0 2px}#xw .sk164d{font-size:.76rem;color:#cbb994;line-height:1.3}
#xw .sk164p{height:6px;border-radius:4px;background:rgba(255,255,255,.08);margin:6px 0 2px;overflow:hidden}#xw .sk164p i{display:block;height:100%;background:linear-gradient(90deg,#c9a24a,var(--e))}
#xw .sk164 small{font-size:.68rem;color:#a8987a}#xw .sk164lk{font-size:1.4rem;opacity:.6}#xw .sk164b{flex:none}
</style>`);
