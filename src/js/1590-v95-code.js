// =====================================================================================================
// with a chest piece the cape is a short half-cape on the left shoulder, so the armour's back stays visible
{const f=mdCape;mdCape=function(B,P,col,o){if(!MD_ORN||!P.hasChest)return f.apply(this,arguments);if(P.noCape)return;o=o||{};const off=(P.tOff||0)+.018,ins=mdSh(col,.58),tr=o.trim,x0=-.12;
  const at=(y,bn,rx,x)=>{const q=mdTorsoAt(P,Math.min(.97,y));return {p:[x,y,-(Math.max(q.b,.12)+off+(.97-Math.min(.97,y))*.06)],rx,f:.012,b:.012,w:bn}};
  const R=[at(.99,[['chest',.7],['cp0',.3]],.08,x0+.01),at(.88,[['cp0',1]],.11,x0-.01),at(.76,[['cp0',.5],['cp1',.5]],.12,x0-.02),at(.6,[['cp1',1]],.125,x0-.025)];
  R[0].p[2]+=.012;mdLoft(B,R,{seg:6,capA:true,capB:true,col:m=>tr!=null&&m.i>R.length-1.4?tr:m.s>.3?ins:col});
  // clasp on the shoulder
  const k=mdKP(),p=mdTP(P,.97,-.5,(P.tOff||0)+.02);k.p('chest','oct','m',tr!=null?tr:0xc9a24a,p[0],p[1],p[2],.018,.018,.01);mdKit(B,k)}}
{const f=mdTabard;mdTabard=function(B,P,c,tr,sym){if(!MD_ORN||!P.hasChest)return f.apply(this,arguments);
  const X={B,P,d:{T:tr},k:mdKP()};mdTabardO(X,c,tr,{top:.6,lo:.3,wd:.15,band:.42});
  if(sym){const k=X.k,z=Math.max(.135,mdTorsoAt(P,.6).f)+(P.tOff||0)+.012*1.15+.008,w=mdSkW(P,.6)(0,.5);k.p('pelvis','box','m',sym,0,.5,z,.016,.09,.006);mdOW(k,w);k.p('pelvis','box','m',sym,0,.52,z,.06,.016,.006);mdOW(k,w)}mdKit(B,X.k)}}

// class extras over armour: the assassin scarf becomes a slim neck scarf (the chest piece shows), the ranger's quiver
// replaces the cape on the back
{const f=mdOutfit;mdOutfit=function(cls){const O=f.apply(this,arguments);
  if(cls=='assassin'&&O.extra){const e=O.extra;O.extra=function(B,P,D){if(!MD_ORN||!D.chest)return e.apply(this,arguments);if(D.helm&&mdHelmHair(D.helm)=='none')return;
    const sc=mdMix(mdSh(D.chest.A,.7),D.chest.M,.35);mdTS(B,P,.955,1.045,(P.tOff||0)+.022,{col:m=>Math.abs(m.y-.97)<.012?mdSh(sc,.8):sc,lipT:.01,lip:.006});
    mdRib(B,[{p:[-.07,.96,-.13],n:[0,0,-1],w:[['chest',1]]},{p:[-.09,.86,-.16],n:[0,0,-1],w:[['chest',.6],['cp0',.4]]},{p:[-.1,.76,-.18],n:[0,0,-1],w:[['cp0',.5],['cp1',.5]]}],.045,.004,sc,{capB:true})}}
  if(cls=='ranger'&&O.extra){const e=O.extra;O.extra=function(B,P,D){if(MD_ORN&&D.chest)P.noCape=1;return e.apply(this,arguments)}}
  return O}}

