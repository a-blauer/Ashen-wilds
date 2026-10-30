// ================= v136: darker, more detailed weapons =================
// Every weapon keeps the v83 model (and the v135 bow); on top of it each type gets the marks of a dark world, more with
// rarity (r): notched and serrated edges, a fuller etched with runes, leather tassels and torn ribbons from the pommel,
// chains and small skulls hung from guards and hafts, spikes, bone and fur wraps with feathers. The Mage's staff carries a
// raven skull cradling its crystal and charms on cords; the wand is carved bone with a skull; the orb sits in a cage of bone.
// All parts are added in the weapon's own frame (grip at the origin, the head down -y), so grips and animations are unchanged.
function wpNotch(k,x0,y0,y1,z,n,s,col){for(let i=0;i<n;i++){const y=y0+(y1-y0)*(i+.5)/n;k.p('','cone4','m',col,x0,y,z,.008,.012,.004,0,0,s*Math.PI/2)}}
function wpRibbon(k,y,col,len,sd){k.S('',col,0,y,0,.03,len,0,.2,sd||1);k.S('',mdSh(col,.7),0,y,0,.022,len*.8,1.6,.2,(sd||1)+2)}
function wpX(k,type,col,r){const W=LGW,steel=col==0x9aa2ae?W.steel:lgCol(W.steel,col,.42),dk=0x14100c,bone=0xd8ccb0,gl=r>=3?col:null,fit=r>=2?W.brass:W.iron;
  if(type=='sword'){wpNotch(k,.046,-.2,-.6,0,3+r,1,dk);if(r>=1)wpRibbon(k,.14,0x5a1414,.16,1);if(r>=2)gkSkull(k,'',0,.15,0,.8,bone,0,null);
    [-1,1].forEach(s=>k.L('','m',fit,[s*.12,-.09,0],[s*.16,-.04,0],.012,.003,4))}
  else if(type=='gs'){wpNotch(k,.07,-.35,-.9,0,4+r,1,dk);wpNotch(k,-.07,-.5,-.85,0,2+r,-1,dk);
    // a leather-wrapped ricasso, a skull set in the guard, chains from the quillons
    for(let i=0;i<3;i++)k.p('','box','c',i%2?W.wrap:W.leather,0,-.26-i*.025,0,.13,.02,.04);gkSkull(k,'',0,-.15,.04,1.05,r>=2?bone:W.iron2,0,null);
    if(r>=1)[-1,1].forEach(s=>gkChain(k,'',[[s*.17,-.13,0],[s*.19,-.24,.01],[s*.18,-.3,.02]],.008,W.iron,null));if(r>=2)wpRibbon(k,.29,0x3a0c0c,.2,3)}
  else if(type=='axe'||type=='ga'){const big=type=='ga',y=big?-.78:-.62,sc=big?1.05:.86;
    wpNotch(k,.29*sc+.02,y-.12,y+.12,0,2+r,1,dk);if(big)wpNotch(k,-.29*sc-.02,y-.12,y+.12,0,2+r,-1,dk);
    k.p('','cone4','m',W.iron2,0,y-.13,0,.03,.12,.03,Math.PI);
    // fur and bone wrapped round the haft with feathers
    k.p('','cyl','c',0x4a3a2c,0,y+.2,0,.048,.06,.048);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.p('','cone4','c',i%2?0x5a4836:0x3a2e24,Math.cos(a)*.045,y+.18,Math.sin(a)*.045,.016,.05,.01,Math.PI,a,0)}
    gkBone(k,'',[.04,y+.24,.01],[.05,y+.16,.02],.006,bone,null);gkFeather(k,'',[-.045,y+.2,0],[-.25,-1,.1],.1,.014,0x1a1a1a,null);
    if(r>=2)gkSkull(k,'',0,y+.02,.035,.75,bone,0,null)}
  else if(type=='mace'){for(let i=0;i<6;i++){const a=(i+.5)/6*Math.PI*2;k.p('','cone4','m',W.iron2,Math.cos(a)*.08,-.73,Math.sin(a)*.08,.012,.05,.012,Math.sin(a)*1.57,0,-Math.cos(a)*1.57)}
    gkChain(k,'',[[0,-.5,.038],[.03,-.4,.035],[0,-.3,.037],[-.03,-.2,.035]],.008,W.iron,null);if(r>=2)gkSkull(k,'',0,-.58,.045,.7,bone,0,null);if(r>=1)wpRibbon(k,.05,0xd8ccaa,.14,5)}
  else if(type=='hammer'){gkSkull(k,'',0,-.74,.105,1.4,r>=2?bone:lgCol(W.iron,0,.3),0,null,'m');gkSkull(k,'',0,-.74,-.105,1.4,r>=2?bone:lgCol(W.iron,0,.3),Math.PI,null,'m');
    [-1,1].forEach(s=>[-1,1].forEach(q=>k.p('','cone4','m',W.iron2,s*.22,-.74+q*.08,0,.015,.05,.015,0,0,-s*Math.PI/2)));if(r>=1)gkChain(k,'',[[0,-.62,.03],[.02,-.52,.03],[0,-.42,.03]],.008,W.iron,null)}
  else if(type=='dagger'){// a serrated back edge, a ring pommel
    for(let i=0;i<5+r;i++){const y=-.12-i*.035;k.p('','cone4','m',steel,-.036,y,0,.006,.014,.003,0,0,Math.PI/2+.4)}k.p('','ring','m',fit,0,.11,0,.022,.12,.022,Math.PI/2);if(r>=2)wpRibbon(k,.09,0x3a0c14,.1,7)}
  else if(type=='claws'){k.L('','m',steel,[.06,-.06,0],[.1,-.2,.04],.01,.002,4);k.p('','cone4','c',bone,-.06,0,.04,.008,.03,.008,0,0,.4);if(gl)k.p('','box','g',gl,0,-.02,.05,.04,.01,.004)}
  else if(type=='halberd'){wpNotch(k,.33,-1.42,-1.16,0,2+r,1,dk);k.S('',0x3a0c0c,-.03,-1.12,0,.06,.24,0,.1,9);k.S('',0x2a0808,.03,-1.12,0,.05,.2,.3,.1,11);if(r>=2)gkSkull(k,'',0,-1.2,.035,.8,bone,0,null)}
  else if(type=='flail'){for(let i=0;i<6;i++){const a=(i+.5)/6*Math.PI*2;k.p('','cone4','m',W.iron2,Math.cos(a)*.1,-.76,Math.sin(a)*.1,.02,.08,.02,Math.sin(a)*1.57,0,-Math.cos(a)*1.57)}if(r>=2)gkSkull(k,'',0,-.66,0,.6,bone,0,null)}
  else if(type=='staff'){// a raven skull cradling the crystal, charms hanging on cords, a band of runes
    gkSkull(k,'',0,-.93,.045,1.0,bone,0,null);k.L('','c',bone,[0,-.95,.08],[0,-.99,.17],.018,.004,5);
    [[.05,-.78,0x2a2a30,'f'],[-.05,-.8,bone,'b'],[.02,-.84,0x8a2a1a,'v']].forEach(([x,y,c,t])=>{k.L('','c',0x2a1e14,[0,-.72,0],[x,y,.02],.003,.003,3);
      if(t=='f')gkFeather(k,'',[x,y,.02],[.1,-1,.05],.09,.013,c,null);else if(t=='b')gkBone(k,'',[x,y,.02],[x+.005,y-.03,.025],.004,c,null);else gkVial(k,'',x,y-.015,.02,.8,gl||c,W.brass,null)});
    if(gl)for(let i=0;i<4;i++)k.p('','box','g',gl,0,-.35-i*.08,.034,.006,.03,.004,0,0,i%2?.4:-.4)}
  else if(type=='wand'){gkSkull(k,'',0,-.36,.0,.55,bone,0,null);for(let i=0;i<3;i++)k.p('','box','c',mdSh(bone,.7),0,-.2-i*.04,.016,.012,.004,.004,0,0,.5)}
  else if(type=='orb'){for(let i=0;i<5;i++){const a=i/5*Math.PI*2;k.L('','c',bone,[Math.cos(a)*.06,-.13,Math.sin(a)*.06],[Math.cos(a)*.14,-.02,Math.sin(a)*.14],.008,.006,4);k.L('','c',bone,[Math.cos(a)*.14,-.02,Math.sin(a)*.14],[Math.cos(a)*.06,.12,Math.sin(a)*.06],.006,.002,4)}
    gkChain(k,'',[[0,-.16,.05],[.04,-.24,.04]],.007,W.brass,null)}
  else if(type=='bow'){// feathers and bone charms tied at the limbs, carved rings on the riser
    [-1,1].forEach(s=>{const y=s*.3*BOW_K,x=-.555+(.555-Math.sqrt(1-Math.pow(.3/.561,2))*.55)*BOW_KX+.016;/* v178: tied on the limb itself (they hung 9 cm off it) */gkFeather(k,'',[x-.02,y,0],[.1,-1,.15],.08,.012,s<0?0x1a1a1a:0x8a2a1a,null);k.L('','c',0x2a1e14,[x-.02,y+.01,0],[x-.03,y-.04,.01],.003,.003,3)});
    for(let i=0;i<3;i++)k.p('','cyl','m',fit,-.553,-.06+i*.06,0,.021,.008,.021)}   // (v178) rings hug the grip
  else if(type=='crossbow'){gkSkull(k,'',0,.14,.0,.7,bone,0,null);[-1,1].forEach(s=>k.p('','cone4','m',W.iron2,s*.08,-.5,0,.01,.05,.01,0,0,-s*Math.PI/2))}
  else if(type=='shield'){// a spiked boss, a skull set over it (Rare+), claw marks across the face
    [-1,1].forEach(s=>{k.p('','cone4','m',W.iron2,0,0,s*.1,.03,.08,.03,s*Math.PI/2);if(r>=2)gkSkull(k,'',0,.24,s*.035,1.1,bone,s<0?Math.PI:0,null);
      for(let i=0;i<3;i++)k.p('','box','c',dk,-.12+i*.04,-.12+i*.02,s*.026,.006,.18,.004,0,0,.5)})}}
{const f=lgWpnKit;lgWpnKit=function(k,type,col,r){f.apply(this,arguments);try{wpX(k,type,col,r||0)}catch(e){console.warn('v136 weapon',type,e)}}}
