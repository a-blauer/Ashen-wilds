// ================= v109: the kingdom grows with every Sovereign kill · shop upgrades =================
// 1) Building plots. Duskhold starts with 5 of the 31 lots (LOT103) open; every Sovereign kill (first kills and repeat
//    kills alike) opens 2 more, from the fountain outward (LOTO109), until all 31 are open (13 kills).
//    SOV109.k = Sovereign kills counted so far, saved as x2.ksov (older saves start from the number of Sovereigns defeated).
//    A lot is open when it is among the first lotN109() of LOTO109, or when something already stands on it (old saves
//    keep every building where it is; a lot given back that way closes again). lotFree103 = free AND open, so building,
//    moving and houses only ever use open lots. A pre-v103 save (no x2.kpos) may place its buildings on any lot once.
//    Empty open lots show a dim white outline on the ground (one InstancedMesh, replaces the v103 stakes and flags);
//    newly opened lots glow gold for a minute. Locked lots show nothing in town and are dark (🔒) on the Steward's plan.
// 2) Shop upgrades (SHP109.lv[k] 0..3, saved as x2.shpu), bought at the Stronghold Steward next to each built shop
//    (and the Trading Post, which is always open). Every level gives 5% off everything that shop sells (shpP109).
//    Stock: Trading Post +2 pieces of gear per level with better rarities (shpGear109) and higher-tier eggs (shpEgg109);
//    Magic Shop +1 egg per level, higher-tier eggs; Curio Shop +1 ware per level (rune, egg, rune), higher-tier eggs;
//    Cooking Hearth / Alchemy Table: crops of one more tier per level in the market. Rune Sanctum, Beast Trainer, Stable: discount.
//    Price and stock hooks sit in the shop code itself (0140 Trading Post / Magic Shop, 0430 runes, 0490 market + mana
//    potion, 0860 training, 0170/0590 mounts); the Curio stock is wrapped here (visStock).

// ---------------- 1. plots that open with Sovereign kills ----------------
var LOTO109=['CW','CE','NW','NE','NM', 'W1','E1', 'W2','E2', 'SW','SE', 'W3','E3', 'W4','E4', 'A1','B1', 'A2','B2', 'C1','D1',
  'A3','B3', 'C2','D2', 'A4','B4', 'C3','D3', 'C4','D4'];
var LOT109_START=5,LOT109_STEP=2;
var SOV109={k:null,grace:0,fresh:{},ft:0};
function sovK109(){return SOV109.k==null?(typeof bossDone!='undefined'?bossDone.size:0):SOV109.k}
function lotN109(k){return Math.min(LOTO109.length,LOT109_START+LOT109_STEP*(k==null?sovK109():k))}
function lotOpen109(id){const i=LOTO109.indexOf(id);return i>=0&&i<lotN109()||SOV109.grace>0||!!lotKey103(id)}
lotFree103=function(id){if(lotKey103(id))return false;const i=LOTO109.indexOf(id);return SOV109.grace>0||i>=0&&i<lotN109()};
// everything built gets a lot: its default lot when that one is open, otherwise the first open lot from the fountain out
lotAuto103=function(){let ch=0;for(const k in SH.pos)if(!LOTM103[SH.pos[k]]||!lotBuilt103(k)){delete SH.pos[k];ch=1}
  const keys=['smith'].concat(SHOPS.map(o=>o.k),UPK103.map(k=>'u:'+k));
  keys.forEach(k=>{if(SH.pos[k]||!lotBuilt103(k))return;const d=DEF103[k];let id=d&&lotFree103(d)?d:LOTO109.find(i=>lotFree103(i));
    if(!id)id=(LOT103.find(l=>lotFree103(l.id))||{}).id;if(id){SH.pos[k]=id;ch=1}});return ch};
function lotCounts109(){const N=lotN109(),open=LOT103.filter(l=>lotOpen109(l.id)),used=open.filter(l=>lotKey103(l.id)).length;return {N,open:open.length,used,free:open.length-used}}
// the Steward window: plots line under the plan
function lotInfo109(P){const c=lotCounts109(),k=sovK109(),more=c.N<LOTO109.length;
  return `<div class="kminfo kmplots">🏗️ <b>${c.used}</b> of <b>${c.open}</b> plots used${more?` · 👑 the next Sovereign kill opens ${Math.min(LOT109_STEP,LOTO109.length-c.N)} more`:' · the whole square is yours'}`+
    (P&&!c.free?'<br><span class="warn" style="display:inline">No free plot. Move something, or defeat a Sovereign to grow the kingdom.</span>':'')+'</div>'}
// placing on a locked lot is refused (the plan never lights it, this covers any other path)
{const f=kmPlace103;kmPlace103=function(id){const p=KM103.pick;if(p&&LOTM103[id]&&!lotOpen109(id)){say('🔒 That plot is not part of the kingdom yet. Every Sovereign kill opens two more.');return}return f.apply(this,arguments)}}
// the plan: locked lots are dark with a lock
{const f=lotPlan103;lotPlan103=function(cv,opt){const info=f.apply(this,arguments);try{const c=cv.getContext('2d'),s=info.s;
  LOT103.forEach(l=>{if(lotOpen109(l.id))return;const r=info.R[l.id];if(!r)return;const [ax,az,w]=r;
    c.fillStyle='#0d0b09';c.fillRect(ax,az,w,w);c.fillStyle='rgba(60,52,44,.55)';c.fillRect(ax+2,az+2,w-4,w-4);
    c.strokeStyle='rgba(120,104,84,.35)';c.lineWidth=1;c.strokeRect(ax+2,az+2,w-4,w-4);
    c.globalAlpha=.55;c.font=Math.round(s*2.4)+'px serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🔒',ax+w/2,az+w/2);c.globalAlpha=1})}catch(e){console.warn('v109 plan',e)}return info}}
// the ground: a dim white outline round every empty open lot (gold for a minute when it has just opened)
function lotRingGeo109(){const h=3.42,t=.12,P=[],I=[];let n=0;
  const quad=(x0,z0,x1,z1)=>{P.push(x0,0,z0, x1,0,z0, x1,0,z1, x0,0,z1);I.push(n,n+2,n+1, n,n+3,n+2);n+=4};
  quad(-h,-h,h,-h+t);quad(-h,h-t,h,h);quad(-h,-h+t,-h+t,h-t);quad(h-t,-h+t,h,h-t);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeBoundingSphere();return g}
function lotRingMesh109(col,op,name){const m=new THREE.InstancedMesh(KL103.rgeo||(KL103.rgeo=lotRingGeo109()),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false,
    polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),LOT103.length);
  m.castShadow=false;m.receiveShadow=false;m.frustumCulled=false;m.renderOrder=2;m.userData.lpsSkip=1;m.userData.psNo=1;m.name=name;m.count=0;scene.add(m);return m}
lotStakes103=function(){const T=TOWNS[0];if(!T||!T.g)return;
  [KL103.stakes,KL103.flags].forEach(m=>{if(m){scene.remove(m);m.visible=false}});KL103.stakes=KL103.flags=null;
  if(!KL103.ring){KL103.ring=lotRingMesh109(0xffffff,.5,'lotOutline');KL103.ringN=lotRingMesh109(0xf0cc72,.75,'lotOutlineNew');
    const mt=KL103.ringN.material;KL103.ringN.onBeforeRender=()=>{mt.opacity=.45+.35*Math.sin(performance.now()/260)}}
  const now=Date.now(),d=new THREE.Object3D();let a=0,b=0;
  LOT103.forEach(l=>{if(!lotFree103(l.id)||SOV109.grace>0&&LOTO109.indexOf(l.id)>=lotN109())return;const [x,z]=lotW103(l,0,0);d.position.set(x,T.ph+.045,z);d.rotation.set(0,l.ry,0);d.updateMatrix();
    if((SOV109.fresh[l.id]||0)>now)KL103.ringN.setMatrixAt(b++,d.matrix);else KL103.ring.setMatrixAt(a++,d.matrix)});
  KL103.ring.count=a;KL103.ringN.count=b;KL103.ring.instanceMatrix.needsUpdate=KL103.ringN.instanceMatrix.needsUpdate=true;KL103.ring.visible=a>0;KL103.ringN.visible=b>0};
// a Sovereign falls (first or repeat kill): two more plots open
function lotGrow109(k0){if(k0==null)k0=sovK109();const n0=lotN109(k0);SOV109.k=k0+1;const n1=lotN109();if(n1<=n0)return [];
  const ids=LOTO109.slice(n0,n1),t=Date.now()+60000;ids.forEach(id=>SOV109.fresh[id]=t);
  try{lotStakes103()}catch(e){console.warn('v109 grow',e)}clearTimeout(SOV109.ft);SOV109.ft=setTimeout(()=>{try{lotStakes103()}catch(_){}},60500);ids.n=lotCounts109().open;return ids}
function lotGrowMsg109(ids){if(!ids||!ids.length)return;const L=ids.map(id=>LOTM103[id]),where=[...new Set(L.map(l=>l.a))].join(' and ');
  banner('🏰 THE KINGDOM EXPANDS',ids.length+' new building plot'+(ids.length>1?'s':'')+' in Duskhold · '+where,(ids.n||lotCounts109().open)+' of '+LOTO109.length+' plots are now yours');
  say('🏗️ Duskhold grows: plot'+(ids.length>1?'s ':' ')+ids.join(' and ')+' ('+where+') can now be built on. Build at the Stronghold Steward.');try{sfx('power')}catch(_){}}
{const f=bossDefeated;bossDefeated=function(e){const A=typeof arenaOf=='function'?arenaOf(e):null,k0=sovK109();const r=f.apply(this,arguments);
  if(A){const ids=lotGrow109(k0);if(ids.length)setTimeout(()=>lotGrowMsg109(ids),6200);try{saveGame(true)}catch(_){}}return r}}
// saves
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.ksov=sovK109();return o}}
{const f=x2Load;x2Load=function(s){SOV109.k=s&&typeof s.ksov=='number'&&s.ksov>=0?Math.floor(s.ksov):null;SOV109.fresh={};
  SOV109.grace=s&&s.kpos&&typeof s.kpos=='object'?0:1;let r;try{r=f.apply(this,arguments)}finally{SOV109.grace=0}try{lotSync103()}catch(e){console.warn('v109 lots',e)}return r}}
// a new game: the Blacksmith moves off its old west-side lot to the first plot by the fountain
try{if(!lotOpen109('W1')||SH.pos.smith==='W1'&&LOTO109.indexOf('W1')>=lotN109()){delete SH.pos.smith}lotSync103()}catch(e){console.warn('v109 lots',e)}

// ---------------- 2. shop upgrades ----------------
var SHP109={lv:{}};
var SHPU109=[
  {k:'post',n:'Trading Post',i:'🪙',g:500,m:[['stone',10],['fiber',10]]},
  {k:'magic'},{k:'cook'},{k:'alch'},{k:'merchant'},{k:'trainer'},{k:'sage'},{k:'stable'}];
SHPU109.forEach(u=>{const o=SHOPS.find(q=>q.k==u.k);if(o){u.n=o.n;u.i=o.i;u.g=o.g;u.m=o.m}});
var SHP109_MAX=3,SHP109_G=[0,1.5,5,12],SHP109_X=[0,1,2.5,5],SHP109_B=[0,0,2,4];
function shpL109(k){return typeof SHP109!='undefined'&&SHP109&&SHP109.lv?Math.min(3,SHP109.lv[k]|0):0}
function shpOff109(k){return .05*shpL109(k)}
function shpP109(k,c){c=+c||0;const L=shpL109(k);return L&&c>0?Math.max(1,Math.round(c*(1-.05*L))):c}
function shpCost109(u,l){return {g:Math.round(u.g*SHP109_G[l]),m:u.m.map(([k,n])=>[k,Math.round(n*SHP109_X[l])]),b:SHP109_B[l]}}
function shpOpen109(k){return k=='post'||shopBuilt(k)}
function shpCan109(u){const l=shpL109(u.k);if(!shpOpen109(u.k))return [false,'Build the shop first'];if(l>=SHP109_MAX)return [false,'Fully upgraded'];const c=shpCost109(u,l+1);
  if(bossDone.size<c.b)return [false,'Needs '+c.b+' Sovereigns defeated'];if(gold<c.g)return [false,'Not enough gold'];if(!shHas(c.m))return [false,'Not enough materials'];return [true,'']}
// what a level does, per shop
function shpFx109(k,l){const off=5*l+'% off';
  if(k=='post')return shpGearN109(l)+' pieces of gear for sale'+(l?', better rarities, higher-tier eggs':'')+' · '+off;
  if(k=='magic')return (2+l)+' eggs for sale'+(l?', higher-tier eggs more often':'')+' · '+off;
  if(k=='merchant')return (3+l)+' wares'+(l?' (+'+CUR109.slice(0,l).map(x=>x=='egg'?'egg':'rune').join(', +')+'), higher-tier eggs more often':'')+' · '+off;
  if(k=='cook'||k=='alch')return (l?'crops '+l+' tier'+(l>1?'s':'')+' above your own in the market · ':'')+off;
  return off+' everything'}
// Steward rows (1880 calls this for the Trading Post and every built shop)
function shpUp109(k,P){const u=SHPU109.find(q=>q.k==k);if(!u||!u.g)return null;const l=shpL109(k),ok=shpCan109(u),c=l<SHP109_MAX?shpCost109(u,l+1):null;
  return {pips:'◆'.repeat(l)+'◇'.repeat(SHP109_MAX-l),d:'<br>'+(l?'Now: '+shpFx109(k,l):'Not upgraded yet'),
    cost:c?'Next: '+shpFx109(k,l+1)+'<br>Cost: '+costH(c.g,c.m)+(c.b?' · 👑 '+c.b+' Sovereigns':''):'<em style="color:#6ee7b7">✔ Fully upgraded</em>',
    btn:l<SHP109_MAX?[['⬆ Upgrade','data-shpu="'+k+'"','class="pri" '+(ok[0]&&!P?'':'disabled')+' title="'+ok[1]+'"']]:[]}}
function shpBuy109(k){const u=SHPU109.find(q=>q.k==k);if(!u)return;const ok=shpCan109(u);if(!ok[0])return say(ok[1]+'.');const l=shpL109(k)+1,c=shpCost109(u,l);
  shPay(c.g,c.m);SHP109.lv[k]=l;
  try{if(k=='post')stock2=null;if(k=='magic')mstock=null}catch(_){}
  banner('🏪 '+u.n.toUpperCase()+' · LEVEL '+l,shpFx109(k,l),'More wares, better wares, lower prices');try{sfx('power')}catch(_){}hud();ui();rX();try{saveGame(true)}catch(_){}}
$('xw').addEventListener('click',e=>{if(xwMode!='hold')return;const t=e.target.closest('[data-shpu]');if(!t||t.disabled)return;shpBuy109(t.dataset.shpu)});
// a line at the top of each shop's wares
function shpNote109(k){const l=shpL109(k),u=SHPU109.find(q=>q.k==k);if(!u)return '';
  return `<div class="shpnote${l?' on':''}">${l?`🏪 <b>Shop level ${l}</b> <span class="shpip">${'◆'.repeat(l)}${'◇'.repeat(SHP109_MAX-l)}</span> · <b>${5*l}% off</b>`+(l<SHP109_MAX?' · upgrade it further at the Stronghold Steward':''):'🏪 Upgrade this shop at the Stronghold Steward: more wares, better wares, 5% off per level.'}</div>`}
// better rarities: the shop rolls its own rarity (weights shift toward rare with each level) and genItem keeps at least that
var SHP109_RW=[62,26,9,2.6,.4];
function shpGearN109(L){return 6+2*(L|0)}
function shpGear109(lv,L){if(!L)return genItem(lv,{cls:hero.cls});const w=SHP109_RW.map((v,i)=>v*(i==0?Math.max(.1,1-.2*L):1+[0,.15,.5,.8,1][i]*L));
  let r=Math.random()*w.reduce((a,b)=>a+b,0),q=0;for(let i=0;i<w.length;i++){r-=w[i];if(r<0){q=i;break}}return genItem(lv,{cls:hero.cls,minR:q})}
function shpEgg109(T,L){const t=T<5&&Math.random()<.12*(L|0)?T+1:T;return rollEgg(t)}
// the Curio Shop: discounted prices, one extra ware per level, higher-tier eggs
var CUR109=['rune','egg','rune'];
{const f=visStock;visStock=function(){const st=f.apply(this,arguments);if(!st)return st;try{const L=shpL109('merchant'),T=Math.max(1,Math.min(5,tierOfLv(hero.lvl)));
  if(!st._b109){st._b109=1;st.forEach(s=>{if(s.k=='egg'&&!s.x109&&s.t<5&&Math.random()<.12*L){s.t++;s.p=150+s.t*120;s.p0=null}})}
  for(let j=0;j<L;j++){if(st.some(s=>s.x109==j+1))continue;const k=CUR109[j];
    if(k=='egg'){const t=T<5&&Math.random()<.12*L?T+1:T;st.push({k:'egg',t,p:150+t*120,r:RUNEK[0],x109:j+1})}
    else{const have=st.filter(s=>s.k=='rune').map(s=>s.r),pool=RUNEK.filter(r=>!have.includes(r));st.push({k:'rune',r:(pool.length?pool:RUNEK)[R(0,(pool.length?pool:RUNEK).length-1)],p:450,x109:j+1})}}
  st.forEach(s=>{if(s.p0==null)s.p0=s.p;s.p=shpP109('merchant',s.p0)})}catch(e){console.warn('v109 curio',e)}return st}}
// shop notes in the windows the shop code doesn't draw itself (Curio, Rune Sanctum, Beast Trainer; the Stable draws its own)
{const f=XR.visitor;XR.visitor=function(){const r=f.apply(this,arguments);try{const k=xwArg;if(k=='merchant'||k=='sage'||k=='trainer'){const B=$('xwB');if(B&&!B.querySelector('.shpnote'))B.insertAdjacentHTML('afterbegin',shpNote109(k))}}catch(e){console.warn('v109 note',e)}return r}}
// saves
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.shpu=Object.assign({},SHP109.lv);return o}}
{const f=x2Load;x2Load=function(s){SHP109.lv={};if(s&&s.shpu&&typeof s.shpu=='object')SHPU109.forEach(u=>{const v=s.shpu[u.k]|0;if(v>0)SHP109.lv[u.k]=Math.min(SHP109_MAX,v)});
  try{stock2=null;mstock=null}catch(_){}return f.apply(this,arguments)}}
document.head.insertAdjacentHTML('beforeend',`<style>
.shpnote{font-size:.74rem;color:var(--mut);padding:5px 8px;margin:0 0 6px;border:1px dashed rgba(201,162,74,.3);border-radius:5px}
.shpnote.on{color:var(--ink);border-style:solid;border-color:rgba(201,162,74,.45);background:rgba(201,162,74,.08)}.shpnote .shpip{color:#f0cc72;letter-spacing:2px}
#xw .kmplots{font-size:.74rem;color:var(--mut)}#xw .kmplots b{color:var(--ink)}
</style>`);
