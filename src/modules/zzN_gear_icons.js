// ================= v89 (gear track): item icons rendered from the item's own 3D model =================
// Every piece of gear gets a picture of the actual item instead of one emoji per slot.
//  * Models: weapons and shields use the real weapon builder (lgWpnKit) tinted by the item's tier material (rust, iron, cinder,
//    nightglass, storm…) and rarity; the hero holds that same model (mkWpn is swapped inside refreshGear). Helms, chest pieces,
//    boots, amulets and rings are small procedural models (v89ArmorKit) shaped by armour type (heavy / medium / light / cloth)
//    and tier, coloured by tier material, with a per-set accent for the v78 sets and a gem coloured by the item's bonus.
//    Loot lying on the ground uses the same models.
//  * Rendering: one offscreen renderer shared with the companion portraits (CPIC.r, no extra WebGL context), 3/4 view,
//    three-point light, fitted with an orthographic camera so every icon is centred; the bitmap gets a rarity-tinted
//    vignette and frame, then becomes a blob URL. Cached per template + rarity (LRU, 400 entries); geometry is disposed after each render.
//  * Lazy: icoOf(it) returns an <img> when the icon is cached, otherwise a placeholder with the old emoji and queues the
//    render; a few icons are rendered per frame and the placeholders are swapped in place. No WebGL → the old emoji stay.
var V89I={cache:new Map(),q:[],qs:new Set(),busy:false,sc:null,cam:null,ok:null,max:400,n:0,ms:0};
var V89_TM=[0x7a5a44,0x8a929e,0x5e3a2e,0x50545e,0x6a88ae], // metal tint per tier: rusted, iron, cinder-black, hollowsteel, stormsteel
    V89_TA=[0x8a6a3a,0xb8bec8,0xe06a28,0x8ad8c8,0x7ac8ff], // accent per tier: bronze, silver, ember, ghost-teal, storm-blue
    V89_ORG=[0x7a5a40,0x8a8070,0x6a2618,0xc8bca0,0x2e3e58],// wood/leather tint per tier
    V89_MAG=[0x9a7aff,0x6ad06a,0xff7a2a,0x8affe8,0x6ab8ff], // staff / wand / orb glow per tier
    V89_ARM={heavy:V89_TM,medium:[0x6a4a2e,0x6a6050,0x7a3a22,0xb8ad90,0x3a5a4a],light:[0x5a5048,0x2e5a36,0x3a3a40,0x2a2444,0x2a3450],cloth:[0xb8ab88,0x4a6a3a,0x8a2a1a,0x3a3a5a,0x2a4a8a]},
    V89_GEM={loot:0xffd04a,hpP:0xe0303a,xp:0x4a8aff,paP:0xff8a2a,maP:0xb05aff,ls:0xa0101e,cdr:0x4ae0ff,regen:0x5ae05a,crit:0xfff06a,as:0xe8f0ff,mspd:0x3ad8b0,cdm:0xff5a2a};
function v89Hash(s){let h=7;s=String(s);for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)}
function v89Rc(r){return parseInt(RAR[Math.max(0,Math.min(RAR.length-1,r|0))][1].slice(1),16)}
// accent: tier accent, or for the v78 sets a colour of their own (so two chest pieces of one tier still differ)
function v89Acc(t){if(!t.nw||t.sl=='weapon')return V89_TA[t.t|0];const w=String(t.n).split(' ')[0];return new THREE.Color().setHSL((v89Hash(w)%360)/360,.55,.5).getHex()}
function v89Gem(t,r){const k=t.imp&&Object.keys(t.imp)[0];return k&&V89_GEM[k]!=null?V89_GEM[k]:r>=2?v89Rc(r):V89_TA[t.t|0]}
// weapon colour: tier material, pulled toward the rarity colour from Rare up (casters: the tier's magic glow)
function v89WCol(it){const t=itT(it),ti=t.t|0,r=it.r|0;
  if(t.wt=='staff'||t.wt=='wand'||t.wt=='orb')return r>=3?lgCol(V89_MAG[ti],v89Rc(r),.35):V89_MAG[ti];
  if(t.sl=='offhand')return lgCol([0x6a1a1a,0x2a4a7a,0xc0902a,0x3a3a46,0xe0d8b0][ti],v89Rc(r),r>=2?.35:0);
  const base=[0x8a6a52,0xb0bac6,0xe0702e,0x7a6aa8,0x6ab8ff][ti];return r>=2?lgCol(base,v89Rc(r),.4):base}
// re-tint a weapon kit's wood/leather and metal parts toward the tier's material
function v89Tint(k,ti){const W=LGW,org=[W.wood,W.woodD,W.leather,W.wrap,0x33251a,0x4a3018,0x3e2814,0x6a4a2c,0x5a4a32,0x4a3420,0x2e2014],met=[W.iron,W.iron2,W.dark];
  if(!ti)return;k.P.forEach(p=>{if(org.includes(p.col))p.col=lgCol(p.col,V89_ORG[ti],.5);else if(met.includes(p.col))p.col=lgCol(p.col,V89_TM[ti],.35)})}
function v89WType(wt){return wt=='axes'?'axe':wt=='knives'?'dagger':wt}
function v89WpnKit(k,it){const t=itT(it);lgWpnKit(k,t.sl=='offhand'?'shield':v89WType(t.wt||'sword'),v89WCol(it),it.r|0);v89Tint(k,t.t|0)}
// the in-hand model of an item (cached per template + rarity, like every other weapon model)
function v89Wpn(it,type){const t=itT(it),g=lgGroup('LW89|'+it.tp+'|'+(it.r|0),k=>v89WpnKit(k,it),.18);g.userData.wt=type||(t.sl=='offhand'?'shield':t.wt);return g}
// procedural armour / jewellery model (rigid parts, grip/centre near the origin; the icon camera fits whatever it gets)
function v89ArmorKit(k,it){const t=itT(it),ti=t.t|0,r=it.r|0,sl=t.sl,a=t.arm||'heavy',acc=v89Acc(t),base0=(V89_ARM[a]||V89_TM)[ti],M=t.nw?lgCol(base0,acc,.22):base0,
    A=r>=2?lgCol(acc,0x9a7838,.35):acc,G=r>=3?v89Rc(r):null,gem=v89Gem(t,r),dk=lgCol(M,0,.45),var2=v89Hash(t.n)%3;
  if(sl=='helm'){
    if(a=='heavy'){
      if(ti<=1){k.p('','hem','m',M,0,0,0,.125,.13,.135);k.p('','cyl','m',A,0,0,0,.13,.03,.14);k.p('','box','m',A,0,-.055,.13,.024,.12,.02);
        [-1,1].forEach(s=>k.p('','box','m',dk,s*.11,-.06,.025,.025,.11,.1));for(let i=0;i<8;i++){const q=i/8*Math.PI*2;k.p('','sph','m',A,Math.sin(q)*.132,0,Math.cos(q)*.142,.01)}
        if(ti==1||var2==1)[-1,1].forEach(s=>{k.L('','c',0xd8ccb0,[s*.11,.05,0],[s*.2,.1,-.01],.03,.02,5);k.L('','c',0xd8ccb0,[s*.2,.1,-.01],[s*.23,.21,-.03],.02,.003,5)})}
      else{k.p('','cyl','m',M,0,-.035,0,.125,.18,.135);k.p('','hem','m',M,0,.055,0,.125,.07,.135);k.p('','box',G?'g':'c',G||0x0a0806,0,-.005,.133,.17,.016,.01);
        k.p('','box','m',A,0,-.05,.136,.022,.13,.012);k.p('','cyl','m',A,0,.05,0,.128,.022,.138);for(let i=0;i<4;i++)k.p('','box','c',0x0a0806,(i-1.5)*.02,-.08,.134,.006,.03,.006);
        if(ti==3)for(let i=0;i<5;i++){const q=(i-2)*.38;k.p('','cone4','m',A,Math.sin(q)*.1,.13,Math.cos(q)*.05-.02,.02,.1,.02,0,0,-q*.4)}
        if(ti==4){for(let i=0;i<7;i++)k.p('','box','m',A,0,.14+Math.sin(i/6*Math.PI)*.05,-.09+i*.03,.012,.08,.03,(i-3)*.18);[-1,1].forEach(s=>{for(let j=0;j<3;j++)k.p('','box','m',j?M:A,s*(.14+j*.02),.03+j*.03,-.02-j*.02,.012,.09-j*.015,.07,-.3,0,-s*(.5+j*.25))})}}}
    else if(a=='medium'){k.p('','hood','c',M,0,-.14,0,.15,.32,.16);k.p('','sph','c',0x0c0806,0,-.03,.05,.1,.1,.08);k.p('','cyl','c',lgCol(M,0,.3),0,-.12,.03,.12,.05,.11);
      k.L('','c',M,[0,.14,-.08],[0,.2,-.2],.04,.01,5);
      if(ti==1)[-1,1].forEach(s=>k.p('','cone4','c',lgCol(M,0xffffff,.15),s*.08,.15,-.01,.035,.09,.025,0,0,-s*.3));
      if(ti==2||ti==4)k.p('','box','c',A,0,-.06,.115,.17,.05,.03);if(ti==3)k.p('','hem','c',0xd8ccb0,0,.02,.05,.1,.07,.09,-.4);
      if(ti==4)[-1,1].forEach(s=>{for(let j=0;j<3;j++)k.p('','box','c',j%2?A:0xe8e8f0,s*(.13+j*.012),.04+j*.04,-.04,.008,.12,.03,-.3,0,-s*(.4+j*.2))});
      if(G)[-1,1].forEach(s=>k.p('','box','g',G,s*.035,-.02,.12,.022,.01,.008))}
    else if(a=='light'){k.p('','sph','c',M,0,0,0,.115,.125,.12);k.p('','box','c',lgCol(M,0,.4),0,-.045,.085,.2,.07,.07);k.p('','box',G?'g':'c',G||0x0a0806,0,.012,.112,.15,.018,.01);
      [-1,1].forEach(s=>k.p('','box','c',A,s*.06,.02,.115,.04,.012,.006,0,0,s*.25));k.L('','c',M,[0,-.02,-.11],[.04,-.2,-.16],.03,.008,5);
      if(ti>=2)k.p('','hood','c',lgCol(M,0,.25),0,-.13,-.01,.15,.32,.16);if(ti>=3)k.p('','cone4','c',A,0,.15,-.02,.03,.08,.02)}
    else{ // cloth: hood, hat, circlet, diadem, crown
      if(ti==0){k.p('','hood','c',M,0,-.14,0,.15,.32,.16);k.p('','sph','c',0x0c0806,0,-.03,.05,.1,.1,.08);k.L('','c',M,[0,.14,-.08],[0,.17,-.22],.04,.01,5)}
      else if(ti==1){k.p('','cyl','c',dk,0,-.06,0,.24,.02,.24);k.p('','cone','c',M,0,.08,0,.12,.28,.12);k.L('','c',M,[0,.2,0],[.06,.3,-.04],.04,.01,5);k.p('','cyl','c',A,0,-.04,0,.122,.03,.122)}
      else{const n=ti==2?5:ti==3?7:9,h=ti==2?.03:ti==3?.07:.1;k.p('','cyl','m',A,0,0,0,.12,.035,.12);
        for(let i=0;i<n;i++){const q=(i/(n-1)-.5)*Math.PI*(ti==4?2:1.1),big=i==(n-1)/2;if(ti==4||Math.abs(q)<1.6)k.p('','cone4','m',A,Math.sin(q)*.12,.02+h*.5*(big?1.5:1),Math.cos(q)*.12,.016,h*(big?1.5:1),.016)}
        k.p('','oct',G?'g':'m',G||gem,0,.015,.125,.026,.034,.014);if(ti==4)[-1,1].forEach(s=>k.p('','oct','m',gem,s*.085,.015,.085,.014))}}}
  else if(sl=='chest'){
    if(a=='heavy'){k.p('','tor','m',M,0,0,0,.21,.3,.15);k.p('','box','m',A,0,.0,.148,.03,.27,.02,-.07);k.p('','cyl','m',dk,0,.17,0,.1,.06,.085);
      for(let i=0;i<3;i++)k.p('','tor','m',i%2?M:dk,0,-.17-i*.045,0,.19-i*.008,.05,.138-i*.006);
      [-1,1].forEach(s=>{for(let i=0;i<(ti>=3?3:2);i++)k.p('','hem','m',i?M:A,s*(.24+i*.014),.13-i*.042,0,.12-i*.014,.085,.125-i*.012,0,0,s*(.38+i*.2));
        if(ti>=2)k.p('','cone4','m',A,s*.28,.22,0,.022,.12,.022,0,0,-s*.45);if(ti==4)k.p('','cone4','m',A,s*.24,.23,-.05,.018,.1,.018,-.2,0,-s*.2)});
      for(let i=0;i<4;i++)k.p('','box','m',i%2?M:dk,-.12+i*.08,-.3,.11-Math.abs(i-1.5)*.015,.07,.1,.02,.1);if(ti>=1)k.p('','ring','m',A,0,.12,0,.2,.3,.14)}
    else if(a=='medium'){k.p('','tor','c',M,0,0,0,.21,.3,.15);k.p('','box','c',dk,0,0,.146,.04,.32,.01,0,0,.5);
      for(let i=0;i<13;i++){const q=i/13*Math.PI*2;if(Math.sin(q)>.5)continue;k.p('','cone4','c',i%3?lgCol(M,0x2a2018,.5):lgCol(M,0xd8d0c0,.3),Math.cos(q)*.17,.135,Math.sin(q)*.115-.015,.04,.12,.04,Math.sin(q)*.8,0,-Math.cos(q)*1.15)}
      if(ti>=1)for(let rr=0;rr<3;rr++)for(let c=0;c<4;c++)k.p('','sph','m',A,-.09+c*.06,-.1+rr*.08,.152-rr*.003,.011);
      [-1,1].forEach(s=>k.p('','hem','c',ti==3?0xd8ccb0:lgCol(M,0,.2),s*.24,.12,0,.11,.075,.115,0,0,s*.4));
      k.p('','ring','c',0x2a1d14,0,-.25,0,.18,.45,.13);k.p('','box','m',A,0,-.25,.13,.045,.04,.016);if(ti==4)k.p('','hem','c',A,0,.1,-.01,.25,.1,.17)}
    else if(a=='light'){k.p('','tor','c',M,0,0,0,.21,.3,.15);[-1,1].forEach(s=>{k.p('','box','c',lgCol(M,0,.5),0,0,.148,.035,.36,.012,0,0,s*.6);for(let i=0;i<2;i++)k.p('','box','m',A,s*(.05+i*.05),.02-s*(.04+i*.035),.155,.012,.06,.006,0,0,s*.6+Math.PI/2)});
      k.p('','hem','c',lgCol(M,0,.3),-.24,.12,0,.115,.08,.12,0,0,-.4);k.p('','hem','m',A,-.26,.09,0,.1,.065,.105,0,0,-.62);k.p('','cyl','c',lgCol(M,0,.2),0,.16,0,.11,.07,.1);
      k.p('','ring','c',lgCol(M,A,.3),0,-.25,0,.176,.7,.13);if(ti>=2)k.p('','hem','c',lgCol(M,0,.35),0,.2,-.08,.12,.1,.08,-1.2)}
    else{k.p('','tor','c',M,0,0,0,.21,.3,.15);k.p('','skirt','c',M,0,-.38,0,.3,.5,.24);k.p('','hem','c',lgCol(M,0,.2),0,.1,-.005,.255,.12,.18);
      [-1,1].forEach(s=>{k.p('','box','m',A,s*.06,-.05,.15,.018,.32,.01,0,0,-s*.05);k.p('','box','m',A,s*.07,-.42,.22,.02,.4,.01,-.28,0,-s*.03)});
      k.p('','ring','c',lgCol(A,0,.35),0,-.22,0,.178,.7,.132);if(ti>=3||var2==2)k.p('','ring','c',lgCol(M,0xffffff,.15),0,.15,-.03,.13,.9,.12,-.3);
      if(ti>=2)k.p('','oct',G?'g':'m',G||gem,0,.02,.16,.025)}
    if(G&&a!='cloth')k.p('','oct','g',G,0,.03,.168,.025)}
  else if(sl=='boots'){[-1,1].forEach(s=>{const x=s*.1;
    if(a=='heavy'){k.p('','box','m',M,x,.035,.05,.105,.07,.2);k.p('','cone4','m',dk,x,.04,.17,.045,.07,.03,Math.PI/2,Math.PI/4);k.L('','m',M,[x,.06,0],[x,.26,.012],.064,.058,7);
      k.p('','sph','m',A,x,.29,.05,.047,.052,.04);k.p('','cone4','m',A,x,.29,.1,.016,.05,.016,Math.PI/2);for(let i=0;i<2;i++)k.p('','cyl','m',i?dk:A,x,.1+i*.08,.006,.068,.02,.068);if(ti>=3)k.p('','cone4','m',A,x+s*.05,.2,0,.014,.06,.014,0,0,-s*1.2)}
    else if(a=='medium'){k.p('','box','c',M,x,.035,.05,.105,.07,.2);k.p('','cone4','c',dk,x,.035,.16,.05,.06,.035,Math.PI/2,Math.PI/4);k.L('','c',M,[x,.06,0],[x,.24,.015],.064,.07,7);
      k.p('','cyl','c',lgCol(M,0x2a2018,.5),x,.25,.015,.08,.05,.08);for(let i=0;i<3;i++)k.p('','box','c',A,x,.1+i*.045,.075,.05,.008,.01)}
    else if(a=='light'){k.p('','box','c',M,x,.03,.05,.095,.06,.19);k.L('','c',M,[x,.05,0],[x,.24,.01],.055,.058,7);for(let i=0;i<5;i++)k.p('','ring','c',i%2?A:lgCol(M,0,.4),x,.07+i*.04,.005,.064,.3,.064,0,0,(i%2?.15:-.15))}
    else{k.p('','box','c',M,x,.025,.04,.09,.05,.18);k.p('','cone4','c',M,x,.04,.15,.035,.08,.025,Math.PI/2-.5,Math.PI/4);k.p('','cyl','c',A,x,.05,0,.06,.02,.06);if(ti>=2)k.p('','oct',G?'g':'m',G||gem,x,.05,.06,.015)}
    if(G&&a!='cloth')k.p('','oct','g',G,x,.3,.1,.015)})}
  else if(sl=='amulet'){const gold=ti==0?0x6a5a40:ti>=3?0xc8a040:0x9a7838,sh=t.nw?var2+(ti>=3?2:0):ti;
    k.p('','ring','m',gold,0,.16,0,.15,.5,.19,Math.PI/2-.25);for(let i=0;i<6;i++)k.p('','sph','m',gold,Math.sin(i/5*Math.PI-Math.PI/2)*.14,.02+Math.cos(i/5*Math.PI-Math.PI/2)*.03-.02,.05,.012);
    k.p('','cyl','m',gold,0,-.01,0,.02,.04,.02);
    if(sh==0){k.p('','box','c',0xd8ccb0,0,-.1,0,.05,.12,.03,0,0,.2);k.L('','c',0x6a4a2a,[0,-.04,0],[0,-.02,0],.02,.02,4)}
    else if(sh==1){k.p('','cone4','c',0xe8e0c8,0,-.12,0,.035,.16,.03,Math.PI);k.p('','ring','m',gold,0,-.04,0,.03,.4,.03,Math.PI/2)}
    else if(sh==2){k.p('','oct','m',gold,0,-.1,0,.07,.09,.03);k.p('','oct',G?'g':'m',gem,0,-.1,.012,.045,.06,.025)}
    else if(sh==3){k.p('','cyl','m',gold,0,-.1,0,.065,.025,.065,Math.PI/2);k.p('','cyl','m',lgCol(gold,0,.3),0,-.1,.014,.045,.01,.045,Math.PI/2);k.p('','sph',G?'g':'m',gem,0,-.1,.02,.022)}
    else{k.p('','sph','m',gold,0,-.1,0,.07,.07,.03);k.p('','sph','c',0xf0ece0,0,-.1,.02,.045,.045,.02);k.p('','sph','g',G||gem,0,-.1,.035,.022,.022,.012);
      for(let i=0;i<6;i++){const q=i/6*Math.PI*2;k.p('','cone4','m',gold,Math.cos(q)*.085,-.1+Math.sin(q)*.085,0,.012,.04,.008,0,0,q-Math.PI/2)}}}
  else if(sl=='ring'){const band=[0xb06a3a,0xc8ccd4,0xd8a040,0x3a3a46,0x7ab0d8][ti],sh=v89Hash(t.n)%3;
    k.p('','ring','m',band,0,0,0,.1,.16,.1,Math.PI/2);
    if(sh==0){k.p('','cyl','m',band,0,.11,0,.04,.03,.04);k.p('','oct',G?'g':'m',gem,0,.145,0,.04,.045,.04)}
    else if(sh==1){k.p('','box','m',band,0,.11,0,.08,.03,.05);k.p('','box','m',lgCol(band,0,.35),0,.127,0,.06,.006,.04);k.p('','sph',G?'g':'m',gem,0,.135,0,.02)}
    else{for(let i=0;i<4;i++){const q=i/4*Math.PI*2;k.p('','cone4','m',band,Math.cos(q)*.03,.13,Math.sin(q)*.03,.008,.04,.008)}k.p('','ico',G?'g':'m',gem,0,.14,0,.035)}}
  else k.p('','oct','g',gem,0,0,0,.16,.18,.16)}
function v89Kit(k,it){const t=itT(it);if(t.sl=='weapon'||t.sl=='offhand')v89WpnKit(k,it);else v89ArmorKit(k,it)}

// ---------------- the hero (and co-op partners) hold the same model the icon shows ----------------
var V89_RG=null;
{const f=refreshGear;refreshGear=function(h,cls,E){const o=V89_RG;V89_RG=E||eq;try{return f.apply(this,arguments)}finally{V89_RG=o}}}
{const f=mkWpn;mkWpn=function(type,col,r){const E=V89_RG;if(E)try{const it=type=='shield'?E.offhand:E.weapon,t=it&&it.tp!=null&&itT(it);
    if(t&&(type=='shield'?t.sl=='offhand':t.wt==type))return v89Wpn(it,type)}catch(e){}return f.apply(this,arguments)}}
// loot on the ground: the same model as the icon
{const f=lgDropModel;lgDropModel=function(kind,data,r){if(kind!='gear'||!data||data.tp==null||!ITPL[data.tp])return f.apply(this,arguments);
  try{const it={tp:data.tp,r:data.r!=null?data.r:r},g=new THREE.Group(),inner=lgGroup('LD89|'+it.tp+'|'+(it.r|0),k=>v89Kit(k,it),.14);g.add(inner);
    inner.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(inner),sz=bb.getSize(new THREE.Vector3()),mx=Math.max(sz.x,sz.y,sz.z)||1;
    if(mx>.62)inner.scale.setScalar(.62/mx);else if(mx<.36)inner.scale.setScalar(.36/mx);const c=bb.getCenter(new THREE.Vector3()).multiplyScalar(inner.scale.x);inner.position.sub(c);
    if(sz.y>sz.x*1.6)g.rotation.z=.75;return g}catch(e){return f.apply(this,arguments)}}}

// ---------------- icon rendering ----------------
function v89Key(it){return 'I'+it.tp+'.'+(it.r|0)}
function v89Init(){if(V89I.ok!=null)return V89I.ok;V89I.ok=false;
  try{if(typeof cpicInit!='function'||!cpicInit())return false;const sc=new THREE.Scene();
    const hl=new THREE.HemisphereLight(0xfff2dc,0x2a2030,.95),key=new THREE.DirectionalLight(0xfff0d8,1.6),rim=new THREE.DirectionalLight(0x9ab8ff,1.1),fill=new THREE.DirectionalLight(0xffd8a8,.45);
    key.position.set(-2,3,4);rim.position.set(3,2,-3);fill.position.set(3,-1,2);sc.add(hl,key,rim,fill);V89I.sc=sc;V89I.cam=new THREE.OrthographicCamera(-1,1,1,-1,.01,50);V89I.ok=true}catch(e){V89I.ok=false}
  return V89I.ok}
// pose by slot: weapons on the diagonal (grip low-left, point high-right), armour in 3/4 view
function v89Pose(g,t){const wt=t.wt;
  if(t.sl=='weapon'){if(wt=='bow'){g.rotation.set(0,.35,-.62)}else if(wt=='orb'){g.rotation.set(.25,.5,0)}else if(wt=='sling'){g.rotation.set(0,.3,2.4)}else g.rotation.set(0,.42,2.36)}
  else if(t.sl=='offhand')g.rotation.set(-.12,.55,0);else if(t.sl=='boots')g.rotation.set(.12,-.55,0);else if(t.sl=='ring')g.rotation.set(.45,.35,0);else if(t.sl=='amulet')g.rotation.set(.1,.3,0);else g.rotation.set(.08,.5,0)}
function v89Mix(a,b,t){return '#'+new THREE.Color(a).lerp(new THREE.Color(b),t).getHexString()}
function v89Render(it){const t=itT(it),S=112,key='KQI|'+v89Key(it);let g=null;const r=CPIC.r;
  try{g=lgGroup(key,k=>v89Kit(k,it),.14);const P=new THREE.Group();P.add(g);v89Pose(g,t);V89I.sc.add(P);P.updateMatrixWorld(true);
    const cam=V89I.cam,bb=new THREE.Box3().setFromObject(P),ctr=bb.getCenter(new THREE.Vector3()),d=new THREE.Vector3(.12,.16,1).normalize();
    cam.position.copy(ctr).addScaledVector(d,6);cam.up.set(0,1,0);cam.lookAt(ctr);cam.updateMatrixWorld(true);
    const inv=cam.matrixWorldInverse,v=new THREE.Vector3();let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
    P.traverse(o=>{if(!o.isMesh)return;const pa=o.geometry.attributes.position;for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);if(v.x<x0)x0=v.x;if(v.x>x1)x1=v.x;if(v.y<y0)y0=v.y;if(v.y>y1)y1=v.y}});
    const hw=Math.max(x1-x0,y1-y0)/2*1.16,cx=(x0+x1)/2,cy=(y0+y1)/2;cam.left=cx-hw;cam.right=cx+hw;cam.top=cy+hw;cam.bottom=cy-hw;cam.near=.01;cam.far=20;cam.updateProjectionMatrix();
    const oc=r.getClearColor(new THREE.Color()),oa=r.getClearAlpha();r.setClearColor(0,0);r.render(V89I.sc,cam);r.setClearColor(oc,oa);
    const cv=document.createElement('canvas');cv.width=cv.height=S;const c=cv.getContext('2d'),rc=RAR[it.r|0][1],gr=c.createRadialGradient(S/2,S*.44,S*.06,S/2,S/2,S*.72);
    gr.addColorStop(0,v89Mix(rc,'#1a120c',.55));gr.addColorStop(.62,v89Mix(rc,'#0c0806',.86));gr.addColorStop(1,'#060403');c.fillStyle=gr;c.fillRect(0,0,S,S);
    c.drawImage(r.domElement,0,0,r.domElement.width,r.domElement.height,0,0,S,S);
    c.lineWidth=3;c.strokeStyle=v89Mix(rc,'#000000',.25);c.strokeRect(1.5,1.5,S-3,S-3);c.lineWidth=1;c.strokeStyle='rgba(0,0,0,.8)';c.strokeRect(3.5,3.5,S-7,S-7);
    V89I.sc.remove(P);return cv}
  finally{if(g){const gs=LGB[key];if(gs)for(const q in gs)gs[q].dispose();delete LGB[key]}}}
function v89Put(k,url){const C=V89I.cache;C.set(k,url);while(C.size>V89I.max){const o=C.keys().next().value,u=C.get(o);C.delete(o);try{if(u&&u.startsWith('blob:'))URL.revokeObjectURL(u)}catch(_){}}}
function v89Swap(k,url){document.querySelectorAll('[data-kqg="'+k+'"]').forEach(el=>{const im=document.createElement('img');im.className='kqgi';im.alt='';im.draggable=false;im.src=url;el.replaceWith(im)})}
function v89Pump(){V89I.busy=false;if(!V89I.q.length)return;const t0=performance.now();let n=0;
  while(V89I.q.length&&n<4&&(n<1||performance.now()-t0<7)){const it=V89I.q.shift(),k=v89Key(it);V89I.qs.delete(k);if(V89I.cache.has(k))continue;n++;
    let cv=null;try{cv=v89Render(it)}catch(e){console.warn('item icon',e)}
    if(!cv){v89Put(k,'');continue}V89I.n++;
    const done=url=>{v89Put(k,url);v89Swap(k,url)};
    try{if(cv.toBlob)cv.toBlob(b=>{try{done(b?URL.createObjectURL(b):cv.toDataURL('image/png'))}catch(_){}},'image/png');else done(cv.toDataURL('image/png'))}catch(e){try{done(cv.toDataURL('image/png'))}catch(_){v89Put(k,'')}}}
  V89I.ms+=performance.now()-t0;v89Kick()}
function v89Kick(){if(V89I.busy||!V89I.q.length)return;V89I.busy=true;requestAnimationFrame(v89Pump)}
function v89Want(it){const k=v89Key(it);if(V89I.qs.has(k)||V89I.cache.has(k))return;V89I.qs.add(k);V89I.q.push({tp:it.tp,r:it.r|0});v89Kick()}
// the icon HTML for one item: the picture when ready, otherwise the old emoji (swapped in place once rendered)
var v89IcoOld=icoOf;
icoOf=function(it){let old='';try{old=v89IcoOld(it)}catch(e){old=SLOTIC.weapon}
  try{if(!it||it.tp==null||!ITPL[it.tp]||!v89Init())return old;const k=v89Key(it),u=V89I.cache.get(k);
    if(u){V89I.cache.delete(k);V89I.cache.set(k,u);return `<img class="kqgi" src="${u}" alt="" draggable="false">`}
    if(u==='')return old;v89Want(it);return `<span class="kqgp" data-kqg="${k}">${old}</span>`}catch(e){return old}};
{const st=document.createElement('style');st.id='v89Css';st.textContent=`
img.kqgi{display:inline-block;width:1.7em;height:1.7em;vertical-align:-.55em;border-radius:3px;object-fit:cover;pointer-events:none;box-shadow:0 1px 2px rgba(0,0,0,.6)}
.kqm-slot .kqm-ic img.kqgi{position:absolute;inset:1px;width:calc(100% - 2px);height:calc(100% - 2px);border-radius:2px;box-shadow:none}
.kqm-slot.kqm-no .kqm-ic img.kqgi{filter:grayscale(.6)}
.kqm-bbar .kqm-bn .kqm-ic img.kqgi{width:2.2em;height:2.2em;vertical-align:middle}
.kqm-tn img.kqgi{width:2.3em;height:2.3em;vertical-align:middle;margin-right:2px}
#pk .pt img.kqgi{width:2em;height:2em;vertical-align:middle}
.mpch img.kqgi{width:1.5em;height:1.5em}
`;document.head.appendChild(st)}
// shop buy bar: the slot's icon string was taken when the grid was built; ask again so a finished picture is used
{const f=kqmBuyBar;kqmBuyBar=function(cells){try{(cells||[]).forEach(c=>{const I=c&&c._kq,it=I&&I.item&&I.item();if(it&&it.tp!=null)I.ic=icoOf(it)})}catch(_){}return f.apply(this,arguments)}}
