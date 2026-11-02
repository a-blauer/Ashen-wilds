// ================= v189 Devotion (owner, Nov 2 2026): investing in one companion pays off, lower tiers most =================
// Each companion earns Devotion points (c.dvp, saved with the companion) only while it is in the active team and standing:
// kills 1, elites / camp leaders 3, bosses 20, Sovereigns 40, feeding 2. Levels 0–10 (DV189.need: 100, 140, … 460; 2800 in all).
// Each level adds DV189.cap[tier] / 10 to every base stat (cStat): Tier 1 +40% at Devotion 10 … Tier 5 +5%, so a well-raised
// low tier can stand with an un-invested high tier, while a high tier given the same care still leads.
// Devotion 5: one extra modifier slot for fusion inheritance (dv189ModCap, used in 0490). Devotion 10: "Devoted": a badge in the
// Companions window and a faint warm glow under the companion. The glow is part of the model (cr), and the look field `dvd`
// goes to co-op partners through mpvLookOf / mpvLookIn, so partners see it too. Fusing a companion away loses its Devotion
// (the Improve window lists it as a loss).
var DV189={cap:[.40,.30,.20,.10,.05],max:10,need:L=>100+40*(L-1),pts:{kill:1,elite:3,boss:20,sov:40,feed:2}};
function dv189Lv(c){let p=(c&&c.dvp)||0,L=0;while(L<DV189.max&&p>=DV189.need(L+1)){p-=DV189.need(L+1);L++}return L}
// progress inside the current level: [points in, points needed] (needed 0 at the max)
function dv189Prog(c){let p=(c&&c.dvp)||0,L=0;while(L<DV189.max&&p>=DV189.need(L+1)){p-=DV189.need(L+1);L++}return L>=DV189.max?[0,0]:[p,DV189.need(L+1)]}
function dv189Cap(c){const t=Math.max(1,Math.min(5,tierSp(c.g[0])|0||1));return DV189.cap[t-1]}
function dv189Bonus(c){return c&&!c.mpRemote?dv189Lv(c)/DV189.max*dv189Cap(c):0}
function dv189ModCap(c){return 5+(dv189Lv(c)>=5?1:0)}
function dv189Pct(v){return Math.round(v*100)+'%'}

// ---------- stats ----------
{const f=cStat;cStat=function(c,k){const v=f.apply(this,arguments);if(!c||c.st)return v;const b=dv189Bonus(c);return b?v*(1+b):v}}

// ---------- earning ----------
function dv189Give(c,n){if(!c||!(n>0))return;const L0=dv189Lv(c),hp0=c.h>0?c.h/Math.max(1,M(c)):0;c.dvp=((c.dvp)||0)+n;const L1=dv189Lv(c);if(L1<=L0)return;
  if(c.h>0)c.h=Math.max(1,Math.round(hp0*M(c)));
  const i=party.indexOf(c),f=i>=0&&i<2?fols[i]:null;
  let msg='💛 '+nm(c)+'’s Devotion rose to '+L1+' · +'+dv189Pct(dv189Bonus(c))+' all stats';
  if(L0<5&&L1>=5)msg+=' · an extra modifier slot opened';
  if(L1>=DV189.max){msg='💛 '+nm(c)+' is Devoted! Devotion 10 · +'+dv189Pct(dv189Bonus(c))+' all stats';if(i>=0&&i<2)leadK[i]=''}
  say(msg);try{if(f&&f.visible){burst(gY(f.position,.8),0xffc85a,24,1.8,2.4,.8);ring(f.position,0xffc85a,2.2,600)}if(typeof sfx=='function')sfx('chime')}catch(_){}
  try{hsDirty()}catch(_){}}
function dv189Active(){const n=typeof actN141=='function'?actN141():1;return party.slice(0,n).filter(c=>c&&c.h>0)}
// a real kill is the one that counts on the death screen's tally (AWD.kills, 0560): props, sacs and mounds never reach it
{const f=kill;kill=function(e){const k0=typeof AWD!='undefined'?AWD.kills:0;const r=f.apply(this,arguments);
  try{if(e&&!e.dv189&&typeof AWD!='undefined'&&AWD.kills>k0){e.dv189=1;const P=DV189.pts;
    const n=(e.ar!=null||e.sv)?P.sov:e.boss?P.boss:(e.trait||(e.camp&&e.leader===e.camp))?P.elite:P.kill;dv189Active().forEach(c=>dv189Give(c,n))}}catch(err){console.warn('v189 devotion',err)}
  return r}}
{const f=feedComp;feedComp=function(c,k){const a=cnt(k);const r=f.apply(this,arguments);
  try{if(c&&cnt(k)<a&&dv189Active().includes(c))dv189Give(c,DV189.pts.feed)}catch(_){}return r}}

// ---------- look: a faint warm glow under a Devoted companion (own and partners') ----------
var DV189_TEX=null;
function dv189Tex(){if(DV189_TEX)return DV189_TEX;const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,214,130,.9)');g.addColorStop(.45,'rgba(255,170,70,.35)');g.addColorStop(1,'rgba(255,140,40,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
  DV189_TEX=new THREE.CanvasTexture(cv);return DV189_TEX}
var DV189_GEO=null; // one shared disc; never disposed (companion models are not disposed either)
function dv189Glow(g){if(!g||g.getObjectByName('dv189'))return;DV189_GEO=DV189_GEO||new THREE.PlaneGeometry(1.9,1.9);
  const m=new THREE.Mesh(DV189_GEO,new THREE.MeshBasicMaterial({map:dv189Tex(),transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false}));
  m.name='dv189';m.rotation.x=-Math.PI/2;m.position.y=.04;m.renderOrder=2;m.userData.fx=1;m.castShadow=false;m.receiveShadow=false;
  m.onBeforeRender=()=>{m.material.opacity=.32+.1*Math.sin(performance.now()/700)};g.add(m)}
{const f=cr;cr=function(c){const g=f.apply(this,arguments);try{if(c&&g&&(c.dvd||dv189Lv(c)>=DV189.max))dv189Glow(g)}catch(_){}return g}}
// co-op: the partner builds our companion from the look, so the Devoted flag goes with it (new field at the end)
{const f=mpvLookOf;mpvLookOf=function(c){const L=f.apply(this,arguments);try{if(L&&c&&dv189Lv(c)>=DV189.max)L.dvd=1}catch(_){}return L}}
{const f=mpvLookIn;mpvLookIn=function(L){const c=f.apply(this,arguments);try{if(c&&L&&L.dvd===1)c.dvd=1}catch(_){}return c}}

// ---------- Companions window: a Devotion row in the overview and a Devoted badge ----------
{const st=document.createElement('style');st.textContent=`
.dv189r{grid-column:1/-1}.dv189r b{display:flex;align-items:center;gap:8px;justify-content:flex-end}
.dv189bar{display:inline-block;width:70px;height:5px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden}
.dv189bar i{display:block;height:100%;background:linear-gradient(90deg,#c9893a,#ffd27a)}
.dv189t{display:inline-block;margin-left:6px;padding:1px 6px;border-radius:8px;font-size:.72rem;color:#ffd27a;border:1px solid rgba(255,210,122,.45);background:rgba(255,190,90,.08)}`;
  document.head.appendChild(st)}
function dv189Tip(c){return 'Devotion grows while '+c.n+' is in your active team: kills, elites, bosses, Sovereigns and feeding. Each level adds '+dv189Pct(dv189Cap(c)/DV189.max)+
  ' to all stats (lower tiers gain more; '+dv189Pct(dv189Cap(c))+' at Devotion 10). Devotion 5: one extra modifier slot. Fusing it away loses its Devotion.'}
function dv189Row(c){const L=dv189Lv(c),p=dv189Prog(c),w=L>=DV189.max?100:Math.round(100*p[0]/p[1]);
  return `<div class="kv dv189r" title="${dv189Tip(c).replace(/"/g,'&quot;')}"><span>💛 Devotion</span><b><span class="dv189bar"><i style="width:${w}%"></i></span>${L} / ${DV189.max}${L?' · +'+dv189Pct(dv189Bonus(c))+' all stats':''}${L<DV189.max?' <small class="mut">('+p[0]+' / '+p[1]+')</small>':''}</b></div>`}
{const f=rC0;rC0=function(){const r=f.apply(this,arguments);try{const c=party[cmpSel],cd=$('cd');if(!c||!cd)return r;
  const sum=cd.querySelector('.kqm-cpane[data-kqc="ov"] .kqm-csum');
  if(sum&&!sum.querySelector('.dv189r'))sum.insertAdjacentHTML('beforeend',dv189Row(c)); // full width, under the stat pairs
  const hd=cd.querySelector('.kqm-chead .dh')||cd.querySelector('.dh');if(hd&&dv189Lv(c)>=DV189.max&&!cd.querySelector('.dv189t'))hd.insertAdjacentHTML('beforeend','<span class="dv189t" title="Devotion 10">💛 Devoted</span>')}catch(err){console.warn('v189 devotion ui',err)}return r}}

// ---------- the Improve (fusion) window lists lost Devotion ----------
{const f=FSM100_check;FSM100_check=function(a,b,act){const r=f.apply(this,arguments);try{const L=dv189Lv(b);if(r&&r.warn&&L>0)r.warn.push('Devotion '+L+' lost')}catch(_){}return r}}
