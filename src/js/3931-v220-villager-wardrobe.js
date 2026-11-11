// ================= v220: the villagers' wardrobe =================
// Owner (Nov 11 2026): "Touch up our villager npc models and give them more varied clothing that's a little more detailed
// (not just a plain robe)". Until now every citizen wore FKO.cit: one colour of tunic and trousers, and for half of them one
// long plain skirt over it, which read as a robe.
// Now a citizen gets one of nine outfits (VC220.fit), picked from their trade and their look number (so the same villager
// always wears the same clothes, and a co-op partner builds the same): farmhand (linen shirt, open vest, patched trousers,
// neckerchief, straw hat), burgher (buttoned doublet with a plastron, two-tone sleeves, peplum, breeches and hose, beret),
// dress (blouse, laced bodice, skirt with a hem band, shawl, coif), traveller (belted tunic with a trimmed hem, dagged
// capelet, satchel strap, bracers, leg wraps), craftsman (rolled sleeves, long apron with a pocket, kerchief), tabard
// (two-colour tabard over a long tunic), coat (long open coat over a waistcoat, two rows of buttons, scarf), fisher's
// smock (striped shirt, braces, oilskin skirt, tall boots) and hunter's jerkin (stitched leather, bracers, leg wraps).
// Per the detail recipe: the outline changes with real cloth (vests, skirts, capelets, hats); everything inside it is paint
// (yokes, plastrons, stripes, patches, wraps, hose, cuffs) plus a few small pieces (buttons, laces, buckles, pockets).
// A second dye (VC220.dye) and a linen come from the same hash, so the town is no longer one brown.
var VC220={on:true,
  dye:[0x6e2f2a,0x2e4a62,0x3f5a38,0x86642a,0x4c3660,0x2f524c,0x7a452a,0x5c2440,0x44506a,0x596030],
  lin:[0xcfc4a8,0xbdb196,0xd8ccb0,0xa99d86],lea:[0x5a3a22,0x3a2616,0x6a4a2e,0x4a3020],
  byRole:{gather:['farm','burgher','dress','hood','apron','tabard','coat','farm','dress'],egg:['dress','apron','farm','dress'],fish:['smock','smock','farm','coat'],hunt:['jerkin','jerkin','hood','tabard']},
  fit:{}};
function vc220Ctx(o,D,C){const h=fkHash('v220|'+(o.robe|0)+'|'+(o.trim|0)+'|'+(o.fkV|0)+'|'+(o.fkRole||'')),b=(n,m)=>(h>>>n)%m,rb=mdC(o.robe||0x6a5a4a),tr=mdC(o.trim||mdSh(rb,.6));
  let dy=VC220.dye[b(3,VC220.dye.length)];const far=(a,c)=>{const A=new THREE.Color(a),B2=new THREE.Color(c);return Math.abs(A.r-B2.r)+Math.abs(A.g-B2.g)+Math.abs(A.b-B2.b)};
  if(far(dy,rb)<.22)dy=VC220.dye[(b(3,VC220.dye.length)+3)%VC220.dye.length];
  const A=typeof fk142A=='function'?fk142A(D):null,plant=!A||!A.leg||A.leg=='plant',ear=D.ear&&D.ear.t;
  return {h,b,rb,tr,dy,lin:VC220.lin[b(7,4)],lea:VC220.lea[b(9,4)],dark:mdSh(mdMix(rb,0x2a2420,.55),.85),plant,tallEar:ear=='tri'||ear=='long',o,D,C}}
// ---- small shared pieces ----
// leg paint on top of FKG.paint: f(m, s) → colour or null (null = what was there)
function vc220Leg(P,f){const g=P.paint.leg;P.paint.leg=(m,s)=>{const c=f(m,s);return c==null?(g?g(m,s):P.col.pants):c}}
// cross-wrapped shins (cloth strips): bands by height, only on the shin
function vc220Wraps(P,c1,c2){vc220Leg(P,m=>m.r.part=='shin'||(m.r.part=='knee'&&m.i>3.4)?(Math.round(m.y*46)%2?c1:c2):null)}
// one patched knee and a seat patch
function vc220Patch(P,col,side){vc220Leg(P,(m,s)=>(s==side&&m.r.part=='knee'&&m.s>.2)||(s==-side&&m.r.part=='thigh'&&m.i<1.6&&m.s<-.5)?col:null)}
// hose below knee breeches
function vc220Hose(P,col){vc220Leg(P,m=>m.r.part=='shin'||(m.r.part=='knee'&&m.i>3.4)?col:null)}
// a pocket / patch lying on the torso at height y, angle a
function vc220Pocket(k,B,P,y,a,col,w,hh){const p=fk142Hug(B,P,y,a,.004);k.p(n3TB(y),'box','c',col,p[0],p[1],p[2],w||.07,hh||.06,.008,0,a,0);k.p(n3TB(y),'box','c',mdSh(col,.75),p[0],p[1]+(hh||.06)*.42,p[2]+.002*Math.cos(a),(w||.07)*1.04,.01,.01,0,a,0)}
// front lacing between y0 and y1 (criss-cross cords over what is built)
function vc220Laces(k,B,P,y0,y1,n,col,da){da=da||.13;for(let i=0;i<n;i++){const ya=y0+(y1-y0)*i/n,yb=y0+(y1-y0)*(i+1)/n,s=i%2?1:-1,a=fk142Hug(B,P,ya,s*da,.005),b=fk142Hug(B,P,yb,-s*da,.005);k.L(n3TB((ya+yb)/2),'c',col,a,b,.0045,.0045,4)}}
// hats: what fits between the ears
function vc220Hat(X,B,k,kind,col){const D=X.D,o=X.o;if(o.fkRole=='fish')return; // the fisher's straw hat is trade gear (czProps104)
  if(kind=='straw'&&!X.tallEar)fkBrimHat(k,D,0xc8ab62,{brim:.15,cr:.07,ch:.055,band:X.dy});
  else if(kind=='beret'||kind=='straw')fkBeret(k,D,col,{h:.034,btn:1,tz:.18});
  else if(kind=='cap')fkBeret(k,D,col,{peak:X.tallEar?0:.05,btn:1});
  else if(kind=='coif')fkCoif(B,D,col,{z1:D.EYEP[2]-.035,yMin:D.EYEP[1]+.03})}
function vc220Boots(X,col,i0){return X.plant?function(B,P){FKG.boots(B,P,col,{i0:i0||4,top:mdSh(col,1.25)})}:null}
// ---- the outfits ----
// farmhand: linen shirt with rolled sleeves, an open vest, patched trousers, a neckerchief, a straw hat
VC220.fit.farm=function(X){const {rb,tr,dy,lin,lea,b}=X,pt=mdSh(mdMix(rb,0x3a3028,.5),.85);
  return {boots:b(11,2)?vc220Boots(X,lea):null,
    paint(P,C){FKG.paint(P,C,{shirt:lin,sleeve:'short',pants:pt,legs:'long',tunic:.5,patt:m=>m.y>.9?mdSh(lin,.9):null});
      P.paint.sleeve=m=>m.i>4?mdSh(lin,.82):lin;vc220Patch(P,mdMix(dy,pt,.35),b(13,2)?1:-1)},
    build(B,P){FKG.shell(B,P,.6,.955,m=>m.y<.64||m.y>.93?mdSh(rb,.75):rb,{open:.55,off:.011,lipT:.003});
      FKG.belt(B,P,.595,lea,{h:.017,off:.014});FKG.scarf(B,P,dy);
      const k=dkKit();FKG.pouch(k,P,.58,-.95,lea,.85);vc220Pocket(k,B,P,.7,.75,mdSh(rb,.8),.055,.05);vc220Hat(X,B,k,b(15,3)?'straw':'cap',mdSh(rb,.8));mdKit(B,k)}}};
// burgher: a buttoned doublet with a plastron, two-tone sleeves, a short peplum, breeches and hose, a beret
VC220.fit.burgher=function(X){const {rb,tr,dy,lin,lea,b}=X,hose=b(11,2)?mdSh(lin,.92):mdSh(dy,.9);
  return {boots:vc220Boots(X,mdSh(lea,.8),5),
    paint(P,C){FKG.paint(P,C,{shirt:rb,sleeve:'long',pants:X.dark,legs:'knee',cuffs:tr,tunic:.5,patt:m=>m.s>.95&&m.y>.6?dy:m.y>.93?mdSh(rb,.8):null});
      P.paint.sleeve=m=>m.i>4?dy:m.i<3?mdSh(rb,1.12):rb;vc220Hose(P,hose)},
    build(B,P){FKG.buttons(B,P,.64,.9,5,0xb89a4a);FKG.belt(B,P,.6,lea,{h:.018,buckle:0xb89a4a});
      FKG.skirt(B,P,{y0:.6,hem:th=>.5+.012*Math.cos(th*2),col:fkTrim(rb,tr,{hem:.8}),flare:.035,lin:mdSh(rb,.6),rows:4});
      FKG.collar(B,P,mdSh(rb,.85),{h:th=>1.01+.025*Math.max(0,-Math.cos(th)),flare:.018,open:.45,lin:tr});
      const k=dkKit();FKG.pouch(k,P,.57,.95,mdSh(lea,.9),.8);vc220Hat(X,B,k,'beret',dy);mdKit(B,k)}}};
// dress: blouse, laced bodice, a full skirt with a hem band, a shawl or an apron, a coif
VC220.fit.dress=function(X){const {rb,tr,dy,lin,lea,b,o}=X,sk=b(11,2)?rb:dy,bod=sk==rb?dy:rb,hemY=b(13,2)?.17:.3;
  return {paint(P,C){FKG.paint(P,C,{shirt:lin,sleeve:'long',pants:mdSh(lin,.8),legs:'knee',cuffs:mdSh(lin,.8),tunic:.5,patt:m=>m.y>.93?mdSh(lin,.88):null});P.paint.sleeve=m=>m.i<3.2?mdSh(lin,1.06):lin},
    build(B,P){FKG.shell(B,P,.6,.9,m=>m.y>.87?mdSh(bod,.72):bod,{off:.011,vneck:[.72,.55],lipT:.003});
      FKG.skirt(B,P,{y0:.6,hem:th=>hemY+.02*Math.max(0,-Math.cos(th)),col:m=>m.v>.9?tr:m.v>.84?mdSh(sk,.7):sk,flare:.06,lin:mdSh(sk,.55)});
      if(o.apron)FKG.apron(B,P,mdSh(lin,1.04),{hem:hemY+.1,bib:false,w:.95});else FKG.belt(B,P,.6,mdSh(bod,.6),{h:.014,buckle:false});
      const k=dkKit();vc220Laces(k,B,P,.63,.86,5,mdSh(lin,.95));
      if(b(15,2)&&!o.apron){mdKit(B,k);{const sw=mdMix(VC220.dye[(b(3,VC220.dye.length)+5)%VC220.dye.length],0x8a8070,.45);FKG.mantle(B,P,{y0:.995,hem:th=>.86-.07*Math.max(0,-Math.cos(th))**3-.03*Math.max(0,Math.cos(th))**2,col:m=>m.v!=null&&m.v>.8?mdSh(sw,.7):sw,clear:.012,flare:.006,open:.16,rows:5,folds:[8,.004]})};const k2=dkKit();vc220Hat(X,B,k2,'coif',mdSh(lin,.96));mdKit(B,k2);return}
      FKG.collar(B,P,mdSh(lin,.95),{h:th=>.995+.02*Math.max(0,-Math.cos(th)),flare:.014});vc220Hat(X,B,k,o.hat=='cap'||b(17,2)?'coif':'',b(19,2)?mdSh(lin,.96):mdSh(dy,.9));mdKit(B,k)}}};
// traveller: a belted tunic with a trimmed hem, a dagged capelet with a rolled collar, a satchel strap, bracers, wrapped shins
VC220.fit.hood=function(X){const {rb,tr,dy,lin,lea,b,o}=X,cape=mdSh(mdMix(dy,0x2a2824,.4),.9),hunt=o.fkRole=='hunt';
  return {boots:vc220Boots(X,lea),
    paint(P,C){FKG.paint(P,C,{shirt:rb,sleeve:'long',pants:X.dark,legs:'long',tunic:.5});vc220Wraps(P,mdSh(lin,.8),mdSh(lin,.62))},
    build(B,P){FKG.cuff(B,P,4,5,lea,.012);
      FKG.skirt(B,P,{y0:.6,hem:th=>.45+.015*Math.cos(th*2),col:m=>m.v>.78?tr:rb,flare:.03,lin:mdSh(rb,.6),rows:5});
      FKG.belt(B,P,.6,lea,{h:.02,buckle:0x8a8a92});mdTStrap(B,P,.93,-.5,.6,.9,(P.tOff||0)+.004,.028,mdSh(lea,.85),{n:9});
      const k=dkKit();FKG.pouch(k,P,.56,1.0,lea,1.15);vc220Hat(X,B,k,b(15,2)?'cap':'',mdSh(cape,.9));mdKit(B,k);
      if(!hunt)FKG.mantle(B,P,{y0:1.0,hem:th=>.86-.02*Math.max(0,-Math.cos(th)),col:m=>m.v!=null&&m.v>.8?mdSh(cape,.72):cape,dag:.016,roll:.016,rollCol:mdSh(cape,.8),clear:.016,flare:.012,rows:5})}}};
// craftsman: shirt with rolled sleeves, a long apron with a pocket, a kerchief
VC220.fit.apron=function(X){const {rb,tr,dy,lin,lea,b,o}=X,ap=b(11,2)||o.apron?mdSh(lin,.98):mdSh(lea,1.15);
  return {boots:vc220Boots(X,mdSh(lea,.85)),
    paint(P,C){FKG.paint(P,C,{shirt:rb,sleeve:'short',pants:X.dark,legs:'long',tunic:.5,patt:m=>m.y>.93?mdSh(rb,.8):null});P.paint.sleeve=m=>m.i>4?tr:rb;vc220Patch(P,mdSh(X.dark,1.5),1)},
    build(B,P){FKG.apron(B,P,ap,{hem:.27,w:1.15,bibTop:.92});
      const k=dkKit();vc220Pocket(k,B,P,.72,0,mdSh(ap,.84),.1,.06);FKG.pouch(k,P,.57,-1.2,lea,.8);
      if(b(13,2))FKG.scarf(B,P,dy);vc220Hat(X,B,k,b(15,3)?'coif':'cap',b(17,2)?dy:mdSh(rb,.8));mdKit(B,k)}}};
// tabard: a long tunic under a two-colour tabard (front and back panels, a border), belted, hose
VC220.fit.tabard=function(X){const {rb,tr,dy,lin,lea,b}=X,tb=dy,t2=b(11,2)?tr:mdSh(lin,.9);
  return {boots:vc220Boots(X,lea),
    paint(P,C){FKG.paint(P,C,{shirt:rb,sleeve:'long',pants:X.dark,legs:'knee',cuffs:mdSh(rb,.7),tunic:.5});P.paint.sleeve=m=>m.i<3?mdSh(rb,.85):rb;vc220Hose(P,mdSh(rb,.7))},
    build(B,P){const fb=m=>Math.abs(m.s)>.8;
      FKG.shell(B,P,.6,.965,m=>m.y>.9?t2:(m.x>0)==(m.s>0)?tb:mdSh(tb,.72),{off:.012,keep:fb,lipT:.003});
      FKG.skirt(B,P,{y0:.6,hem:th=>.4-.04*Math.abs(Math.cos(th)),col:m=>m.v>.84?t2:(Math.sin(m.u*Math.PI*2)>0)==(Math.cos(m.u*Math.PI*2)>0)?tb:mdSh(tb,.72),flare:.03,lin:mdSh(tb,.55),keep:m=>Math.abs(Math.cos(m.u*Math.PI*2))>.55,rows:6});
      FKG.skirt(B,P,{y0:.59,hem:()=>.47,col:rb,flare:.012,lin:mdSh(rb,.6),rows:4,clear:.002});
      FKG.belt(B,P,.6,lea,{h:.02,buckle:0xb89a4a,off:.02});
      const k=dkKit();FKG.pouch(k,P,.56,-1.0,lea,.9);vc220Hat(X,B,k,b(15,2)?'cap':'beret',mdSh(tb,.8));mdKit(B,k)}}};
// coat: a long open coat over a waistcoat, two rows of buttons, a turned-up collar, a scarf
VC220.fit.coat=function(X){const {rb,tr,dy,lin,lea,b}=X,ct=X.dark,wc=dy;
  return {boots:vc220Boots(X,mdSh(lea,.7)),
    paint(P,C){FKG.paint(P,C,{shirt:lin,sleeve:'long',pants:mdSh(mdMix(rb,0x3a3028,.4),.8),legs:'long',cuffs:tr,tunic:.5,patt:m=>m.y<.9?wc:null});P.paint.sleeve=()=>ct;P.paint.fore=m=>m.r.part=='wrist'?tr:ct},
    build(B,P){FKG.buttons(B,P,.64,.86,4,0xb89a4a);FKG.shell(B,P,.57,.965,m=>m.y>.92?mdSh(ct,.8):ct,{open:.5,off:.012,lipT:.004});
      FKG.skirt(B,P,{y0:.6,hem:th=>.27+.1*Math.max(0,Math.cos(th))**2,col:fkTrim(ct,mdSh(ct,.7),{hem:.9}),lin:mdSh(wc,.6),open:.42,flare:.045,backF:.4});
      FKG.belt(B,P,.595,lea,{h:.014,off:.004,buckle:0x8a8a92});
      FKG.collar(B,P,ct,{h:th=>1.015+.035*Math.max(0,-Math.cos(th)),flare:.028,open:.6,lin:mdSh(wc,.8)});
      if(b(13,2))FKG.scarf(B,P,b(17,2)?tr:mdSh(lin,.9));
      const k=dkKit();vc220Pocket(k,B,P,.52,1.0,mdSh(ct,.8),.06,.05);vc220Hat(X,B,k,b(15,3)?'cap':'beret',mdSh(ct,.9));mdKit(B,k)}}};
// fisher's smock: a striped shirt, braces, an oilskin skirt, tall boots
VC220.fit.smock=function(X){const {rb,tr,dy,lin,lea,b}=X,oil=mdMix(rb,0x6a6a3a,.35),st=mdSh(lin,.95),s2=mdMix(rb,lin,.25);
  return {boots:vc220Boots(X,0x2a2a26,3),
    paint(P,C){FKG.paint(P,C,{shirt:st,sleeve:'short',pants:mdSh(rb,.7),legs:'long',tunic:.5,patt:m=>Math.round(m.y*32)%2?s2:st});P.paint.sleeve=m=>m.i>4?mdSh(st,.8):Math.round(m.i)%2?s2:st},
    build(B,P){[-1,1].forEach(s=>{mdTStrap(B,P,.6,s*.42,.985,s*.5,(P.tOff||0)+.005,.03,oil,{n:7});mdTStrap(B,P,.985,s*2.55,.6,s*2.9,(P.tOff||0)+.005,.03,oil,{n:7})});
      FKG.shell(B,P,.56,.7,m=>m.y>.67?mdSh(oil,.75):oil,{off:.012,lipT:.003});
      FKG.skirt(B,P,{y0:.58,hem:th=>.4+.01*Math.cos(th*3),col:m=>m.v>.86?mdSh(oil,.7):oil,flare:.04,lin:mdSh(oil,.55),rows:5});
      const k=dkKit();[-1,1].forEach(s=>{const p=fk142Hug(B,P,.69,s*.42,.006);k.p('spine','sph','m',0xb89a4a,p[0],p[1],p[2],.011,.011,.007)});
      vc220Pocket(k,B,P,.63,0,mdSh(oil,.82),.1,.05);if(b(13,2))FKG.scarf(B,P,dy);mdKit(B,k)}}};
// hunter's jerkin: stitched leather over a wool shirt, bracers, wrapped shins
VC220.fit.jerkin=function(X){const {rb,tr,dy,lin,lea,b}=X,jk=mdMix(lea,rb,.3),wool=mdMix(rb,0x4a5a3a,.4);
  return {boots:vc220Boots(X,mdSh(lea,.8)),
    paint(P,C){FKG.paint(P,C,{shirt:wool,sleeve:'long',pants:mdSh(rb,.75),legs:'long',cuffs:mdSh(wool,.7),tunic:.5});P.paint.sleeve=m=>m.i<3?mdSh(wool,.85):wool;vc220Wraps(P,mdSh(lea,1.1),mdSh(lea,.8))},
    build(B,P){FKG.shell(B,P,.56,.95,m=>m.y>.91||m.y<.6?mdSh(jk,.7):m.s>.95?mdSh(jk,1.12):jk,{off:.012,vneck:[.8,.5],lip:.006,lipT:.003});
      FKG.skirt(B,P,{y0:.59,hem:th=>.49+.012*Math.cos(th*4),col:m=>m.v>.7?mdSh(jk,.7):jk,flare:.03,lin:mdSh(jk,.55),rows:3});
      FKG.cuff(B,P,4,5,mdSh(lea,.8),.013);FKG.belt(B,P,.6,mdSh(lea,.7),{h:.02,buckle:0x8a8a92,off:.016});
      const k=dkKit();vc220Laces(k,B,P,.8,.93,3,mdSh(lin,.8),.07);FKG.pouch(k,P,.56,.95,lea,.9);vc220Hat(X,B,k,X.o.hat=='cap'?'cap':'',mdSh(wool,.7));mdKit(B,k)}}};
// ---- the switch: FKO.cit picks an outfit; the old plain one stays as FKO.cit137 (VC220.on=false brings it back) ----
FKO.cit137=FKO.cit;
FKO.cit=function(o,D,C){if(!VC220.on)return FKO.cit137(o,D,C);const X=vc220Ctx(o,D,C),L=VC220.byRole[o.fkRole]||VC220.byRole.gather,kind=o.fkFit&&VC220.fit[o.fkFit]?o.fkFit:L[X.h%L.length];
  const F=VC220.fit[kind](X);F.kind=kind;if(!F.boots)delete F.boots;return F};
// the trade reaches the outfit (and the geometry cache key)
{const f=czLook103;czLook103=function(c){const o=f.apply(this,arguments);try{o.fkRole=czRole104(c)}catch(e){}return o}}
{const f=fkKey;fkKey=function(o,pk){return f.apply(this,arguments)+(VC220.on&&pk.out=='cit'?'|w220|'+(o.fkRole||'')+'|'+(o.fkFit||''):'')}}
