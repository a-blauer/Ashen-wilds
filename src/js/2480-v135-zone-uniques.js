// ================= v135: unique items — three per zone, very rare, each with a model of its own =================
// Every zone has a unique amulet, a unique ring and a unique weapon. They drop very rarely from any creature in the zone's three
// field instances (UNQ135_P: 1 in 2,000 kills, 1 in 300 for elites). A unique is an item of the base template of its slot and the
// zone's tier (the weapon: your class's weapon of that tier) with it.u = its key: legendary rarity (four affixes, no legendary
// power), its own name (itName, 0120), a fixed bonus on top of its stats (itStats below), a "✦ Unique" block in the tooltip, and
// its own model (icons, the item on the ground, the weapon in the hero's hand; the worn amulet / ring take its gem colours).
// Amulets and rings have a bespoke kit each (UNQ135[key].kit); the weapon is the class weapon rebuilt with the zone's ornaments
// (UNQ135_ORN[zone]: wisps, scales, ice, gold, bone, thorns) and its metal tinted towards the zone's colour.
var UNQ135_P={kill:1/2000,elite:1/300};
var UNQ135={
 // ---- 0 · Kindlelight ----
 lantern:{z:0,sl:'amulet',n:'Lanternheart',fl:'A wisp of bog-light caged in black iron. It never gutters.',e:{hpP:.08,regen:.006},gem:0x7aff9a,
   kit(k){const I=0x2a2a30,G=0x8affa8;k.p('','ring','m',I,0,.03,0,.035,.2,.035,Math.PI/2);k.p('','cone4','m',I,0,-.02,0,.055,.04,.055,0,Math.PI/4);
     for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;k.L('','m',I,[Math.cos(a)*.05,-.035,Math.sin(a)*.05],[Math.cos(a)*.055,-.15,Math.sin(a)*.055],.006,.006,4)}
     k.p('','cyl','m',I,0,-.16,0,.06,.015,.06);k.p('','cone4','m',I,0,-.185,0,.03,.04,.03,Math.PI,Math.PI/4);k.p('','ico','g',G,0,-.095,0,.032);k.p('','ico','g',0xe8ffe8,0,-.095,0,.016)}},
 mirewyrm:{z:0,sl:'ring',n:'Mirewyrm Coil',fl:'A bog serpent, swallowed its own tail and set in bronze.',e:{ls:.04,crit:.03},gem:0x9aff6a,
   kit(k){const B=0x5a6a3a,S=0x3a5a2a;k.p('','ring','m',B,0,0,0,.1,.16,.1,Math.PI/2);
     for(let i=0;i<7;i++){const a=-.6+i*.2,r=.105;k.p('','sph','c',i%2?S:lgCol(S,0x9aff6a,.2),Math.sin(a)*r,Math.cos(a)*r+.012,0,.024-i*.0012,.022,.03)}
     k.p('','oct','c',S,.085,.085,0,.032,.022,.03,0,0,-.6);[-1,1].forEach(s=>k.p('','sph','g',0xc8ff4a,.1,.095,s*.012,.006))}},
 // ---- 1 · Hillside Crest ----
 trilith:{z:1,sl:'amulet',n:'Trilith Stone',fl:'Three stones of the crest, carved with the serpent that sleeps beneath it.',e:{dr:.06,hpP:.06},gem:0x6ac850,
   kit(k){const S=0x8a8a80,D=0x5a5a54;k.p('','ring','m',0x9a7838,0,.03,0,.03,.2,.03,Math.PI/2);k.p('','box','c',S,-.05,-.1,0,.032,.12,.03);k.p('','box','c',S,.05,-.1,0,.032,.12,.03);
     k.p('','box','c',D,0,-.03,0,.14,.034,.034);k.L('','c',0x4a8a3a,[-.06,-.03,.019],[.06,-.03,.019],.006,.004,4);k.p('','oct','g',0x6ac850,0,-.03,.022,.012)}},
 hydratooth:{z:1,sl:'ring',n:"Hydra's Tooth Band",fl:'Three fangs, pulled from three heads that grew back.',e:{as:.08,crit:.02},gem:0x7ac850,
   kit(k){const B=0xb8bcc4;k.p('','ring','m',B,0,0,0,.1,.16,.1,Math.PI/2);[-.45,0,.45].forEach((a,i)=>k.p('','cone4','c',0xe8e0c8,Math.sin(a)*.12,Math.cos(a)*.12+.02,0,.014,i==1?.07:.05,.012,0,0,-a));
     k.p('','oct','g',0x7ac850,0,.1,.02,.018)}},
 // ---- 2 · Burningeye Summit ----
 rimeeye:{z:2,sl:'amulet',n:'Rime Eye',fl:'It watched the summit freeze. It still watches.',e:{cdr:.08,maP:.06},gem:0x9ad8ff,
   kit(k){const C=0xbfe8ff;k.p('','ring','m',0xc8ccd4,0,.03,0,.03,.2,.03,Math.PI/2);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;k.p('','cone4',i%2?'g':'m',i%2?0xcff0ff:C,Math.cos(a)*.06,-.1+Math.sin(a)*.06,0,.014,.07,.01,0,0,a-Math.PI/2)}
     k.p('','sph','c',0xf0f4f8,0,-.1,0,.04,.04,.025);k.p('','sph','g',0x4ab8ff,0,-.1,.018,.02,.02,.01);k.p('','box','c',0x08101a,0,-.1,.026,.004,.016,.003)}},
 frostsignet:{z:2,sl:'ring',n:'Frostbitten Signet',fl:'The seal of a lord the Rime Wraith kept.',e:{crit:.04,cdm:.15},gem:0xbfe8ff,
   kit(k){const B=0xa8b0bc;k.p('','ring','m',B,0,0,0,.1,.16,.1,Math.PI/2);k.p('','box','m',B,0,.11,0,.07,.02,.06);k.p('','box','g',0x9ad8ff,0,.122,0,.05,.006,.044);
     for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;k.p('','cone4','g',0xdff6ff,Math.cos(a)*.028,.14,Math.sin(a)*.022,.007,.045,.007,0,0,Math.cos(a)*.3)}}},
 // ---- 3 · Searing Sands ----
 sunscarab:{z:3,sl:'amulet',n:'Sunscarab Pectoral',fl:'Gold that remembers the sun, and the hands that buried it.',e:{xp:.1,hpP:.06},gem:0xffa030,
   kit(k){const G=0xd8a838;k.p('','ring','m',G,0,.03,0,.03,.2,.03,Math.PI/2);k.p('','cyl','m',G,0,-.1,-.008,.085,.01,.085,Math.PI/2);k.p('','sph2','m',lgCol(G,0x2a4a8a,.55),0,-.1,.01,.034,.048,.02);
     [-1,1].forEach(s=>k.p('','box','m',G,s*.055,-.085,.01,.06,.026,.008,0,0,s*.45));k.p('','sph','g',0xff8a20,0,-.06,.016,.016)}},
 dustwyrm:{z:3,sl:'ring',n:'Ring of the Dust Wyrm',fl:'Segmented like the beast, and just as hungry.',e:{mspd:.06,as:.05},gem:0xe8b860,
   kit(k){const B=0xc89a58;for(let i=0;i<10;i++){const a=i/10*Math.PI*2;k.p('','cyl','m',i%2?B:lgCol(B,0,.25),Math.sin(a)*.1,Math.cos(a)*.1,0,.03,.024,.03,0,0,-a)}
     k.p('','cone','m',lgCol(B,0,.2),0,.125,0,.03,.04,.03);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;k.p('','cone4','c',0xf0e8d0,Math.cos(a)*.022,.145,Math.sin(a)*.022,.004,.016,.004,Math.PI)}}},
 // ---- 4 · The Dirge ----
 drownedbell:{z:4,sl:'amulet',n:'Drowned Bell',fl:'It tolled for the crypt as the water came in. Listen closely.',e:{thorns:.3,dr:.05},gem:0x5ac8b0,
   kit(k){const B=0x5a7a6a;k.p('','ring','m',0x3a3a40,0,.03,0,.03,.2,.03,Math.PI/2);k.p('','sph','m',B,0,-.035,0,.035,.03,.035);k.p('','skirt','m',B,0,-.095,0,.06,.1,.06);
     k.p('','sph','m',0x3a4a44,0,-.15,0,.014);[[.04,-.08,.03],[-.03,-.11,.04],[.02,-.13,-.04],[-.045,-.07,-.02]].forEach(([x,y,z])=>k.p('','sph','c',0xc8c0a8,x,y,z,.009));k.p('','sph','g',0x5ac8b0,0,-.06,.05,.008)}},
 knuckle:{z:4,sl:'ring',n:'Ossuary Knuckle',fl:'Carved from a knuckle of the Colossus. It still grips.',e:{killheal:.03,ls:.03},gem:0x9affd8,
   kit(k){const B=0xe0d8c0;k.p('','ring','c',B,0,0,0,.1,.18,.1,Math.PI/2);k.p('','sph2','c',B,0,.135,0,.04,.036,.036);k.p('','box','c',B,0,.105,.012,.028,.016,.024);
     [-1,1].forEach(s=>k.p('','sph','g',0x5affd0,s*.015,.138,.032,.007));k.p('','cone4','c',0x2a2420,0,.122,.036,.005,.008,.003,Math.PI)}},
 // ---- 5 · The Citadel ----
 chalice:{z:5,sl:'amulet',n:'Crimson Chalice',fl:'A thimble of the Throne Hall\'s wine. It is not wine.',e:{ls:.06,hpP:.05},gem:0xff2040,
   kit(k){const G=0x8a6a3a;k.p('','ring','m',G,0,.03,0,.03,.2,.03,Math.PI/2);k.p('','cone','m',G,0,-.045,0,.045,.06,.045,Math.PI);k.p('','cyl','g',0xd01030,0,-.02,0,.04,.008,.04);
     k.p('','cyl','m',G,0,-.1,0,.008,.06,.008);k.p('','cyl','m',G,0,-.135,0,.035,.01,.035);k.p('','oct','g',0xff2040,0,-.075,.012,.01)}},
 nosferatu:{z:5,sl:'ring',n:"Nosferatu's Seal",fl:'Whoever wears it is never quite the first to bleed.',e:{first:.3,crit:.04},gem:0xff1030,
   kit(k){const B=0x2a2228;k.p('','ring','m',B,0,0,0,.1,.16,.1,Math.PI/2);k.p('','oct','g',0xff1030,0,.12,0,.026,.034,.022);
     [-1,1].forEach(s=>{k.p('','cone4','m',B,s*.05,.125,0,.012,.08,.006,0,0,s*1.25);k.p('','cone4','m',B,s*.045,.11,0,.01,.06,.005,0,0,s*1.7)})}},
 // ---- the weapons (the finder's class weapon, with the zone's ornaments) ----
 gloamfen:{z:0,sl:'weapon',n:'Gloamfen',fl:'Bog-light clings to it, and so does the moss.',e:{skillP:.1,loot:.1},gem:0x8affa8,tint:0x3a6a4a},
 coilfang:{z:1,sl:'weapon',n:'Coilfang',fl:'Scaled like the Hydra, and it bites like one.',e:{cdm:.25,as:.05},gem:0x7ac850,tint:0x4a7a3a},
 wraithfrost:{z:2,sl:'weapon',n:'Wraithfrost',fl:'Rime grows on it in the warmest hand.',e:{paP:.08,maP:.08,mspd:.04},gem:0x9ad8ff,tint:0x9ab8d8},
 sunforged:{z:3,sl:'weapon',n:'Sunforged',fl:'Hammered under the sun the scarabs worship.',e:{paP:.1,maP:.1},gem:0xffa030,tint:0xd8a838},
 dirgebone:{z:4,sl:'weapon',n:'Dirgebone',fl:'Bound with chain and ossuary bone; it grows bolder as you weaken.',e:{berserk:.2,ls:.04},gem:0x5ac8b0,tint:0x6a7a70},
 bloodthorn:{z:5,sl:'weapon',n:'Bloodthorn',fl:'Thorns of the Citadel\'s red briar, still drinking.',e:{cdm:.3,ls:.04},gem:0xff2040,tint:0x8a1a24}};
// the zone ornaments laid along a weapon (points picked from its own parts, away from the grip)
var UNQ135_ORN=[
 (k,p,i,R)=>{k.p('','ico','g',i%2?0x8affa8:0xc8ffd8,p.x+(R()-.5)*.03,p.y,p.z+.03,.018+R()*.01);if(i%2==0)k.p('','cone4','c',0x2a4a2a,p.x,p.y,p.z-.02,.02,.04,.012,R()*3,R()*3,0)},
 (k,p,i,R)=>{[-1,1].forEach(s=>k.p('','oct','m',0x4a7a3a,p.x+s*.022,p.y,p.z,.016,.026,.006,0,s*.5,R()));if(i%3==0)k.p('','cone4','c',0xe8e0c8,p.x,p.y-.02,p.z+.025,.008,.04,.008,1.2)},
 (k,p,i,R)=>{for(let j=0;j<2;j++)k.p('','cone4',j?'g':'m',j?0xdff6ff:0xbfe8ff,p.x+(R()-.5)*.04,p.y+(R()-.5)*.03,p.z+(R()-.5)*.04,.01,.05+R()*.04,.01,R()*2-1,0,R()*2-1)},
 (k,p,i,R)=>{k.p('','ring','m',0xd8a838,p.x,p.y,p.z,.036,.16,.036);if(i%2==0)k.p('','oct','g',0xff9a30,p.x,p.y,p.z+.03,.012)},
 (k,p,i,R)=>{if(i%2)k.p('','ring','m',0x3a3a40,p.x,p.y,p.z,.03,.2,.03,R()*3,0,R());else k.p('','cone4','c',0xe0d8c0,p.x+.02,p.y,p.z,.012,.06,.01,0,0,-1.2+R())},
 (k,p,i,R)=>{for(let j=0;j<2;j++)k.p('','cone4','c',0x5a0a14,p.x+(j?.02:-.02),p.y,p.z,.008,.045,.008,0,0,j?-1.4:1.4);if(i%3==0)k.p('','oct','g',0xff2040,p.x,p.y,p.z+.02,.012)}];
var UNQ135_ZK=(()=>{const Z=[];for(const key in UNQ135){const U=UNQ135[key];U.key=key;(Z[U.z]=Z[U.z]||[]).push(key)}return Z})();
// ---------------- the item ----------------
function unqOf135(it){return it&&it.u&&UNQ135[it.u]||null}
function unqName135(it){const U=unqOf135(it);if(!U)return null;return U.sl=='weapon'?U.n+' '+String(itT(it).n).split(' ').pop():U.n}
function unqMake135(key,lv){const U=UNQ135[key];if(!U)return null;
  let it=null;try{it=genItem_base(Math.max(1,lv|0),{sl:U.sl,cls:hero.cls})}catch(_){return null}if(!it||!ITPL[it.tp]||itT(it).sl!==U.sl)return null;
  it.r=4;it.u=key;delete it.lp;delete it.set;const ks=Object.keys(AFX).filter(k=>!(U.sl=='weapon'&&k=='mp')&&!it.aff.some(a=>a.k==k)),T=tierOfLv(it.lv)-1;
  while(it.aff.length<4&&ks.length){const k=ks.splice(R(0,ks.length-1),1)[0],A_=AFX[k];it.aff.push({k,v:A_[1]=='n'?Math.round(A_[2]*(2+it.lv)*(.9+Math.random()*.4)):+(A_[2]*(1+T*.45)*(.9+Math.random()*.4)).toFixed(4)})}
  return it}
{const f=itStats;itStats=function(it){const s=f.apply(this,arguments);try{const U=unqOf135(it);if(U)for(const k in U.e)s[k]=(s[k]||0)+U.e[k]}catch(_){}return s}}
Object.assign(SNM,{dr:'Damage reduction',thorns:'Thorns',berserk:'Damage below half health',first:'First-hit damage',killheal:'Health per kill',skillP:'Skill damage',compP:'Companion damage'});
function unqTipHTML135(it){const U=unqOf135(it);if(!U)return '';const zn=PMAP[U.z]?PMAP[U.z].n:'';
  return `<div class="kqm-tx" style="color:#ffcf6a">✦ Unique · ${kqmEsc(zn)}</div><div class="kqm-tx">${Object.keys(U.e).map(k=>fmtS(k,U.e[k])+' '+(SNM[k]||k)).join(' · ')}</div><div class="kqm-ts" style="font-style:italic">“${kqmEsc(U.fl)}”</div>`}
{const f=kqmGearTip;kqmGearTip=function(it,o){let h=f.apply(this,arguments);try{if(unqOf135(it)){h=h.replace('>Legendary '+SLOTN[itT(it).sl],'>Unique '+SLOTN[itT(it).sl]);
  const m='<div class="kqm-ts" style="margin-top:4px">Upgrade';const i=h.indexOf(m);h=i>=0?h.slice(0,i)+unqTipHTML135(it)+h.slice(i):h+unqTipHTML135(it)}}catch(_){}return h}}
{const f=idHTML;idHTML=function(){let h=f.apply(this,arguments);try{const it=selI&&(selI.k=='e'?SLOTS.map(k=>eq[k]).find(x=>x&&x.id==selI.id):gear.find(x=>x.id==selI.id));if(unqOf135(it))h+=unqTipHTML135(it)}catch(_){}return h}}
// ---------------- the drop ----------------
function unqRoll135(e){if(!e||e.boss||e.wv||e.dprop||(e.c&&e.c.boss)||e.__abx)return;const P=e.m&&e.m.position;if(!P)return;
  const I=insAt(Math.round(P.x),Math.round(P.z));if(!I||!I.fld)return;const L=UNQ135_ZK[I.z];if(!L||!L.length)return;
  const p=(e.c&&e.c.al?UNQ135_P.elite:UNQ135_P.kill)*(1+Math.min(1,(HS().loot||0)));if(Math.random()>=p)return;
  const it=unqMake135(L[R(0,L.length-1)],I.lv[1]);if(!it)return;drop('gear',it,P,it.r);
  try{banner('✦ A UNIQUE ITEM FALLS',unqName135(it),PMAP[I.z].n+' · '+SLOTN[itT(it).sl])}catch(_){}try{mSfx('rare')}catch(_){try{sfx('chime')}catch(__){}}}
{const f=lootE;lootE=function(e){const r=f.apply(this,arguments);try{unqRoll135(e)}catch(err){console.warn('v135 unique',err)}return r}}
// ---------------- the models ----------------
function unqWpnKit135(k,it,U){const n0=k.P.length;v89WpnKit(k,it);
  // the metal takes the zone's colour; ornaments on points spread along the weapon, away from the grip
  for(let i=n0;i<k.P.length;i++){const p=k.P[i];if(p.t=='m')p.col=lgCol(p.col,U.tint,.45)}
  const V=new THREE.Vector3(),pts=[];for(let i=n0;i<k.P.length;i++){V.setFromMatrixPosition(k.P[i].m);if(V.length()>.12)pts.push(V.clone())}
  let s=U.key.length*977;const Rr=()=>{s=(s*16807)%2147483647;return s/2147483647};
  pts.sort((a,b)=>b.length()-a.length());const pick=[];for(const q of pts){if(pick.every(o=>o.distanceTo(q)>.09))pick.push(q);if(pick.length>=8)break}
  const n1=k.P.length;pick.forEach((p,i)=>UNQ135_ORN[U.z](k,p,i,Rr));const S=new THREE.Vector3(1.5,1.5,1.5);for(let i=n1;i<k.P.length;i++)k.P[i].m.scale(S);
  // the gem sits on the grip; on a bow (the frame is off the hand) on the part nearest the grip (v178: it hung in the air)
  let gp=[0,-.02,.03];{let bd=1e9,bq=null;for(let i=n0;i<n1;i++){V.setFromMatrixPosition(k.P[i].m);const d=V.length();if(d<bd){bd=d;bq=V.clone()}}if(bq&&bd>.1)gp=[bq.x,bq.y,bq.z+.03]}
  k.p('','oct','g',U.gem,gp[0],gp[1],gp[2],.024)}
{const f=v89Kit;v89Kit=function(k,it){const U=unqOf135(it);if(!U)return f.apply(this,arguments);try{if(U.sl=='weapon')return unqWpnKit135(k,it,U);return U.kit(k)}catch(e){console.warn('v135 unique kit',e);return f.apply(this,arguments)}}}
{const f=v89Key;v89Key=function(it){return f.apply(this,arguments)+(it&&it.u?'|u'+it.u:'')}}
{const f=v89Wpn;v89Wpn=function(it,type){if(!unqOf135(it))return f.apply(this,arguments);const t=itT(it),g=lgGroup('LW89U|'+it.u+'|'+it.tp,k=>v89WpnKit_u135(k,it),.18);g.userData.wt=type||t.wt;return g}}
function v89WpnKit_u135(k,it){return unqWpnKit135(k,it,unqOf135(it))}
{const f=lgDropModel;lgDropModel=function(kind,data,r){if(kind!='gear'||!unqOf135(data))return f.apply(this,arguments);
  try{const it={tp:data.tp,r:data.r!=null?data.r:r,u:data.u},g=new THREE.Group(),inner=lgGroup('LD89U|'+it.u+'|'+it.tp,k=>v89Kit(k,it),.14);g.add(inner);
    inner.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(inner),sz=bb.getSize(new THREE.Vector3()),mx=Math.max(sz.x,sz.y,sz.z)||1;
    if(mx>.62)inner.scale.setScalar(.62/mx);else if(mx<.4)inner.scale.setScalar(.4/mx);const c=bb.getCenter(new THREE.Vector3()).multiplyScalar(inner.scale.x);inner.position.sub(c);
    if(sz.y>sz.x*1.6)g.rotation.z=.75;return g}catch(e){return f.apply(this,arguments)}}}
// worn amulet / ring: the unique's gem colour (and a glow), and its own cache key
{const f=mdGD;mdGD=function(it){const d=f.apply(this,arguments);try{const U=d&&unqOf135(it);if(U&&(U.sl=='amulet'||U.sl=='ring')){d.gem=U.gem;d.G=U.gem;d.key=(d.key||'')+'|u'+it.u}}catch(_){}return d}}
