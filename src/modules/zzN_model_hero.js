// ================= v94 (model track): the hero — class outfit + look + worn equipment =================
// refreshGear (re-declared: replaces the v54 one; the v78/v89/v93 wrappers still wrap it) builds the hero's body from
// the class outfit, the hero look and the worn helm/chest/boots/amulet/ring, cached per class + look + items, and keeps
// the v54 weapon placement (v93 grip re-poses it). heroOutfit(h,cls) rebuilds with the last worn items.
// Contract with the creator track: heroLook(h) / hero.look → look; heroRebuild(h) rebuilds a model in place;
// heroBuildPreview(look,cls) → THREE.Group with userData.anim(now) (idle) and userData.setLook(look,cls).
// class outfit: colours of the bare body + base pieces when a slot is empty + class extras (cape, quiver, tabard, collar)
function mdOutfit(cls){
  const O={
    warrior:{col:{torso:0x7e3626,sleeve:null,fore:0x5a3a22,pants:0x4a3a2e,shin:0x4a3a2e,boot:0x3e2a1c,belt:0x3a2618},bare:1,cape:0x6e2018,capeLen:.4,boots:{a:'medium',st:'trail',M:0x4a3020,A:0x6a4a2a},
      base:(B,P)=>{mdTS(B,P,.5,.99,.01,{col:m=>m.s>.85&&m.y>.8?mdSh(0x7e3626,.8):0x7e3626,lip:.008});mdTS(B,P,.93,1.0,.036,{col:m=>Math.round(m.c*7+m.s*2)%2?0x5a4636:0x4a3a2c,lip:.03,lipT:.012});
        [-1,1].forEach(s=>mdAS(B,P,s,4,5,.012,{col:0x5a3a22}));mdBelt(B,P,.6,0x3a2618,0xa88848)}},
    paladin:{col:{torso:0x8a8e9a,fore:0x6a6e78,pants:0x5a5a66,shin:0x5a5a66,boot:0x3a2e24,belt:0x4a3424},cape:0xd8ccaa,capeTrim:0xc9a24a,boots:{a:'medium',st:'trail',M:0x3a2e24,A:0x5a4a3a},
      base:(B,P)=>{mdTS(B,P,.5,.99,.012,{col:m=>Math.round(m.y*30)%2?0x8a8e9a:0x7a7e8a,lip:.01});[-1,1].forEach(s=>mdAS(B,P,s,0,5,.01,{col:m=>Math.round(m.y*30)%2?0x8a8e9a:0x7a7e8a}))},
      extra:(B,P,D)=>{if(!(D.chest&&(D.chest.st=='aegis'||D.chest.st=='blood')))mdTabard(B,P,0xe6dcc0,0xc9a24a,0xc9a24a)}},
    assassin:{col:{torso:0x3a2c4a,sleeve:0x2e2438,fore:0x241e2a,hand:0x1e1a22,pants:0x26222c,shin:0x2e2836,boot:0x1e1a20,belt:0x6a3a8a},boots:{a:'light',st:'soft',M:0x1e1a20,A:0x6a3a8a},
      base:(B,P)=>{mdTS(B,P,.5,.99,.01,{col:m=>Math.abs(m.c-m.s*.5)<.1&&m.y>.66?0x241e2a:0x3a2c4a});[-1,1].forEach(s=>{mdAS(B,P,s,0,3,.008,{col:0x2e2438});mdAS(B,P,s,4,6,.008,{col:m=>Math.round(m.y*40)%2?0x241e2a:0x302838})});mdBelt(B,P,.6,0x6a3a8a,0x8a8e96)},
      extra:(B,P,D)=>{const sc=D.chest?mdSh(D.chest.A,.85):0x5a3478;if(!D.helm||mdHelmHair(D.helm)!='none'){mdTS(B,P,.93,1.06,(P.tOff||0)+.024,{col:sc,lipT:.012,lip:.01});mdLoft(B,[{p:[-.06,.97,-.15],rx:.035,f:.01,b:.01,w:[['chest',1]]},{p:[-.09,.78,-.18],rx:.04,f:.01,b:.01,w:[['chest',.4],['cp1',.6]]},{p:[-.1,.62,-.2],rx:.034,f:.01,b:.01,w:[['cp1',1]]}],{seg:4,capA:true,capB:true,col:sc})}}},
    ranger:{col:{torso:0x4e6a34,fore:0x5a3e24,pants:0x5a4632,shin:0x4a3420,boot:0x4a3420,belt:0x3a2618},cape:0x2e4a26,capeLen:.38,boots:{a:'medium',st:'stalker',M:0x4a3420,A:0x6a4a2a},
      base:(B,P)=>{mdTS(B,P,.5,.99,.01,{col:0x4e6a34,lip:.008});[-1,1].forEach(s=>{mdAS(B,P,s,0,3,.008,{col:0x4e6a34});mdAS(B,P,s,4,5,.012,{col:0x5a3e24})});
        mdTS(B,P,.56,.975,.022,{col:m=>m.s>.82&&m.y<.95?0x4a3420:0x6a4a2e,lip:.006});mdBelt(B,P,.6,0x3a2618,0x8a8e96)},
      extra:(B,P)=>mdQuiver(B,P)},
    mage:{col:{torso:0x34449a,pants:0x2a2a48,shin:0x2a2a48,boot:0x2a2030,belt:0x7a2a1a},boots:{a:'cloth',st:'slipper',M:0x2a2030,A:0xc9a24a},
      base:(B,P)=>{const d={a:'cloth',st:'robe',ti:0,M:0x34449a,A:0xc9a24a,G:null,dk:mdSh(0x34449a,.6),gem:0x7cc8ff};mdChest(B,P,d)}}};
  return O[cls]||O.warrior}
function mdBelt(B,P,y,c,bc){mdTS(B,P,y-.022,y+.022,(P.tOff||0)+.008,{col:c});const k=dkKit();k.p('spine','box','m',bc,0,y,mdTorsoAt(P,y).f+(P.tOff||0)+.012,.05,.042,.014);mdKit(B,k)}
function mdTabard(B,P,c,tr,sym){const off=(P.tOff||0)+.01;
  mdTS(B,P,.62,.975,off,{col:m=>Math.abs(m.c)>.26?tr:c,keep:m=>Math.abs(m.c)<.33});
  mdSkirt(B,P,.62,.33,.02,Math.max(off+.006,(P.sOff||0)+.008),{col:m=>m.y<.355||Math.abs(m.c)>.26?tr:c,keep:m=>Math.abs(m.c)<.31,n:4});
  if(sym){const k=dkKit(),f=mdTorsoAt(P,.83).f+off+.006;k.p('chest','box','m',sym,0,.83,f,.022,.13,.006).p('chest','box','m',sym,0,.86,f,.085,.022,.006);mdKit(B,k)}}
function mdQuiver(B,P){const k=dkKit(),z=-(mdTorsoAt(P,.85).b+(P.tOff||0)+.05),a=[-.06,.66,z],b=[.1,1.0,z-.03];
  k.L('chest','c',0x5a3a20,a,b,.05,.056,8);k.L('chest','c',0x3a2618,[a[0]+.02,a[1]+.04,a[2]],[b[0]-.02,b[1]-.04,b[2]],.058,.058,8);
  for(let i=0;i<4;i++){const x=.07+i*.022,t=[x+.05,1.14,z-.05];k.L('chest','c',0x8a6a40,[x,.98,z-.03],t,.006,.006,4);k.p('chest','cone4','c',[0x8a2a1a,0xe8e0d0,0x2a2a2a,0x8a2a1a][i],t[0],t[1],t[2],.02,.06,.006,0,0,-.4)}
  // strap across the chest
  mdTS(B,P,.62,.99,(P.tOff||0)+.01,{col:0x3a2618,keep:m=>Math.abs(m.c+m.s*.55)<.1});mdKit(B,k)}
// ---------------- the whole hero ----------------
function mdHeroD(E){const D={};['helm','chest','boots','amulet','ring'].forEach(s=>{const d=E&&E[s]?mdGD(E[s]):null;if(d&&d.sl==s)D[s]=d});return D}
function mdHeroKey(cls,L,E){const D=mdHeroD(E);return 'H|'+cls+'|'+mdLookKey(Object.assign({},L,{height:1}))+'|'+['helm','chest','boots','amulet','ring'].map(s=>D[s]?D[s].key:'-').join(',')}
function mdHeroB(cls,L,E){
  const B=mdB(HB),O=mdOutfit(cls),P=mdP({look:L,sex:L.sex,build:L.build,col:Object.assign({},O.col,{skin:L.skin})}),D=mdHeroD(E);
  if(O.bare&&!D.chest)P.col.sleeve=L.skin;if(P.col.fore==null||O.col.fore==null)P.col.fore=L.skin;
  if(D.chest)mdChestPre(P,D.chest);if(D.boots)mdBootsPre(P,D.boots);
  P._T=mdTorso(P);mdBody(B,P);
  const hh=D.helm?mdHelmHair(D.helm):'all';
  mdHead(B,P,{hood:hh=='none',noScalp:hh=='hang'});
  if(D.chest)mdChest(B,P,D.chest,cls);else O.base(B,P);
  const bd=D.boots||Object.assign({ti:0,G:null,r:0,dk:mdSh(O.boots.M,.6),gem:0},O.boots);mdBoots(B,P,bd);
  if(D.helm)mdHelm(B,P,D.helm);
  if(O.extra)O.extra(B,P,D);
  if(D.amulet)mdAmulet(B,P,D.amulet);if(D.ring)mdRingW(B,P,D.ring);
  if(O.cape!=null){const ct=D.chest?(D.chest.G!=null?D.chest.G:D.chest.r>=2?D.chest.A:O.capeTrim):O.capeTrim;mdCape(B,P,O.cape,{len:O.capeLen||.36,trim:ct})}
  return B}
// put the cached geometry on a hero model (keeps its bones, skeleton and weapons)
function mdHeroApply(h,cls,E){const body=huBody(h);if(!body||!body.skeleton)return;cls=CLS[cls]?cls:'warrior';const L=mdLookOf(h,cls);
  const key=mdHeroKey(cls,L,E),G=mdGeo(key,()=>mdHeroB(cls,L,E),true);
  if(h._mdKey!==key){if(h._mdKey)mdUse(h._mdKey,-1);mdUse(key,1);h._mdKey=key}
  const M=h._mdM||(h._mdM=mdOwnMats());
  body.geometry=G.c;body.material=M.c;body.userData.lowpoly=1;body.castShadow=true;body.frustumCulled=false;h.mat=M.c;if(h===pl)pl.mat=M.c;
  (h._mdX||[]).forEach(m=>m.parent&&m.parent.remove(m));h._mdX=[];
  ['m','g'].forEach(t=>{if(!G[t])return;const m=new THREE.SkinnedMesh(G[t],M[t]);m.dk=1;m.castShadow=t!='g';m.frustumCulled=false;body.parent.add(m);m.bind(body.skeleton,body.bindMatrix);h._mdX.push(m)});
  body.scale.setScalar(L.height);h.mdL=L;h._mdE=E;h.cls=cls}
function heroOutfit(h,cls){h=h||pl;try{mdHeroApply(h,cls,h._mdE||{})}catch(e){console.error('hero model',e)}}
function refreshGear(h,cls,E){
  h=h||pl;cls=cls||hero.cls;E=E||eq;
  (h.gearG||[]).forEach(o=>o.parent&&o.parent.remove(o));h.gearG=[];
  if(!h.dkHid){h.dkHid=1;Object.values(h.bones).forEach(b=>b.children.forEach(o=>{if(o.isMesh&&!o.isSkinnedMesh)o.visible=false}))}
  try{mdHeroApply(h,cls,E)}catch(e){console.error('hero model',e)}
  const col=r=>parseInt(RAR[r][1].slice(1),16),w=E.weapon,wt=w?itT(w).wt:DEFW[cls],wr=w?w.r:0,wc=w&&w.r>=2?col(w.r):0x9aa2ae;
  const W1=mkWpn(wt,wt=='staff'?(cls=='mage'?(wr>=2?col(wr):0x9a7aff):0xffe08a):wc,wr);
  if(wt=='bow'){W1.rotation.set(0,Math.PI/2,0);W1.position.set(-.05,-.02,.05);h.bones.aL2.add(W1)}else{W1.rotation.x=-1.0;W1.position.set(0,-.03,.02);h.bones.aR2.add(W1)}h.gearG.push(W1);
  if(wt=='dagger'){const W2=mkWpn('dagger',wc,wr);W2.rotation.x=-1.0;W2.position.set(0,-.03,.02);h.bones.aL2.add(W2);h.gearG.push(W2)}
  if(cls=='paladin'){const sh=E.offhand,S2=mkWpn('shield',sh&&sh.r>=2?col(sh.r):0x6a1a1a,sh?sh.r:0);S2.position.set(-.06,0,.06);S2.rotation.y=Math.PI/2;S2.scale.setScalar(MD_SHIELD);h.bones.aL2.add(S2);h.gearG.push(S2)}
}
var MD_SHIELD=.82;
// ---------------- contract API ----------------
// rebuild a hero model in place: h = a model (pl, the bag preview, a co-op or preview model) or the hero data / nothing (= the player)
function heroRebuild(h){
  try{
    if(!h||h===hero||!h.isObject3D){const L=[pl];if(typeof HP!='undefined'&&HP)L.push(HP);L.forEach(m=>{try{refreshGear(m===pl?pl:m,hero.cls,eq);if(m.pv&&typeof pvFit=='function'){} }catch(e){console.error('heroRebuild',e)}});return pl}
    if(h.userData&&h.userData.mdPrev){h.userData.setLook(h.userData.look,h.userData.cls);return h}
    const m=h.h||h;if(m.bones)refreshGear(m,m.cls||hero.cls,m._mdE||(m===pl?eq:{}));return h
  }catch(e){console.error('heroRebuild',e)}return h}
// a stand-alone hero (look + class, starter outfit and class weapon) for previews; userData.anim(now) plays the idle
function heroBuildPreview(look,cls){cls=CLS[cls]?cls:'warrior';
  const root=new THREE.Group(),h=buildHero();root.add(h);h.mdLook=Object.assign({},look||{});
  const set=(lk,c)=>{c=CLS[c]?c:cls;h.mdLook=Object.assign({},lk||{});root.userData.look=h.mdLook;root.userData.cls=c;cls=c;
    const tp=ITPL.findIndex(t=>t.cls==c&&t.sl=='weapon'&&!t.nw),E={};if(tp>=0)E.weapon={id:-1,tp,lv:1,req:1,r:0,up:0,aff:[]};
    if(c=='paladin'){const so=ITPL.findIndex(t=>t.sl=='offhand');if(so>=0)E.offhand={id:-1,tp:so,lv:1,req:1,r:0,up:0,aff:[]}}
    refreshGear(h,c,E);h.position.set(0,0,0);h.rotation.set(0,0,0)};
  root.userData.mdPrev=1;root.userData.hero=h;root.userData.setLook=set;
  root.userData.anim=now=>{try{h.position.set(0,0,0);animHero(now==null?performance.now():now,false,h);h.position.set(0,0,0)}catch(e){}};
  set(look,cls);return root}
// ---------------- the hero models that already exist ----------------
{const f=buildHero;buildHero=function(){const h=f.apply(this,arguments);try{mdHeroApply(h,(typeof hero!='undefined'&&hero&&hero.cls)||'warrior',{})}catch(e){console.error('hero model',e)}return h}}
// co-op: partners see your look (sent as a short array), and their models carry theirs
function mpLookOut(){try{const L=mdLookOf(pl,hero.cls);return [L.skin,L.hair,L.hairStyle,L.face,L.eye,L.build,Math.round(L.height*100),L.sex]}catch(e){return 0}}
function mpLookIn(a){if(!Array.isArray(a)||a.length<8)return null;return {skin:a[0]|0,hair:a[1]|0,hairStyle:a[2]|0,face:a[3]|0,eye:a[4]|0,build:a[5]|0,height:(+a[6]||100)/100,sex:a[7]|0}}
try{(function(){const b=huBody(pl);if(!b)return;const old=pl.children.filter(o=>o.isSkinnedMesh&&o.dk);old.forEach(o=>pl.remove(o));(pl.gearG||[]).forEach(o=>{if(o.isSkinnedMesh&&o.parent)o.parent.remove(o)});
  if(pl.cls||hero.cls)refreshGear(pl,pl.cls||hero.cls,eq);else mdHeroApply(pl,'warrior',{})})()}catch(e){console.error('hero model',e)}
