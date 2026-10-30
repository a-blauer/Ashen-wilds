// ================= v176: enemy posture and the plainest foes dressed =================
// Owner: "optimize anatomy, posture and overall style … non-cartoony (dark fantasy), not too simple".
// * Posture: the older humanoid foes stood bolt upright like mannequins. ST176[hum key] is a stance laid over every pose
//   (idle, walk, attacks), like the v113 creatures' D.stance: a forward lean, the head raised to look ahead, bent knees with
//   the hips dropped, arms held out from the body. Brutes hunch, ghouls stoop, goblins crouch, soldiers stand ready.
//   A v113 creature with its own D.stance keeps it.
// * The Searing Sands cultists (Zealot of the Endless One, Salt Caller) were a bare default body: they now have their own
//   builders (serpent mask and ritual scars / salt-crusted robes and a hood).
var ST176={
  orc:{sx:.2,hx:-.18,lk:.14,rk:.14,lh:-.07,rh:-.07,dy:-.03,az:.1,lz:-.1,ex:-.2,le:-.25},
  troll:{sx:.28,hx:-.26,lk:.16,rk:.16,lh:-.08,rh:-.08,dy:-.04,az:.12,lz:-.12,ax:-.12,lx:-.15,ex:-.3,le:-.35},
  trollsh:{sx:.24,hx:-.22,lk:.12,rk:.12,lh:-.06,rh:-.06,dy:-.03,lz:-.08,le:-.25},
  yeti:{sx:.3,hx:-.28,lk:.16,rk:.16,lh:-.08,rh:-.08,dy:-.04,ax:-.15,lx:-.15,az:.12,lz:-.12,ex:-.35,le:-.35},
  ghoul:{sx:.36,hx:-.32,lk:.2,rk:.2,lh:-.1,rh:-.1,dy:-.05,ax:-.35,lx:-.35,ex:-.6,le:-.6},
  hob:{sx:.16,hx:-.14,lk:.16,rk:.16,lh:-.08,rh:-.08,dy:-.03,az:.08,lz:-.1,le:-.25},
  sling:{sx:.16,hx:-.14,lk:.16,rk:.16,lh:-.08,rh:-.08,dy:-.03,lz:-.1,le:-.25},
  shaman:{sx:.18,hx:-.16,lk:.12,rk:.12,lh:-.06,rh:-.06,dy:-.025,lz:-.08,le:-.3},
  bandit:{sx:.1,hx:-.08,lk:.1,rk:.1,lh:-.05,rh:-.05,dy:-.02,lz:-.06,le:-.2},
  brigand:{sx:.08,hx:-.06,lk:.08,rk:.08,lh:-.04,rh:-.04,dy:-.015,lz:-.06,le:-.15},
  cultist:{sx:.1,hx:-.06,lk:.06,rk:.06,lh:-.03,rh:-.03,dy:-.01,lz:-.05,le:-.3},
  giant:{sx:.12,hx:-.1,lk:.08,rk:.08,lh:-.04,rh:-.04,dy:-.02,lz:-.1,le:-.2},
  jotun:{sx:.12,hx:-.1,lk:.08,rk:.08,lh:-.04,rh:-.04,dy:-.02,lz:-.1,le:-.2},
  skel:{sx:.1,hx:.06,lk:.06,rk:.06,lh:-.03,rh:-.03,dy:-.01},
  archer:{sx:.1,hx:.06,lk:.06,rk:.06,lh:-.03,rh:-.03,dy:-.01},
  nagaw:{sx:.14,hx:-.12,lk:.1,rk:.1,lh:-.05,rh:-.05,dy:-.02,lz:-.06},
  nagaa:{sx:.12,hx:-.1,lk:.1,rk:.1,lh:-.05,rh:-.05,dy:-.02},
  nagas:{sx:.12,hx:-.1,lk:.06,rk:.06,lh:-.03,rh:-.03,dy:-.01,lz:-.06,le:-.25},
  selem:{sx:.1,hx:-.08,lk:.08,rk:.08,lh:-.04,rh:-.04,dy:-.02,az:.12,lz:-.12},
  revenant:{sx:.12,hx:-.06,lk:.05,rk:.05,dy:-.01,lz:-.05,le:-.25},
  lichen:{sx:.16,hx:-.12,lk:.1,rk:.1,lh:-.05,rh:-.05,dy:-.02,az:.08,lz:-.08,ex:-.25,le:-.25},
  executioner:{sx:.12,hx:-.1,lk:.1,rk:.1,lh:-.05,rh:-.05,dy:-.02,lz:-.08},
  amalgam:{sx:.22,hx:-.2,lk:.14,rk:.14,lh:-.07,rh:-.07,dy:-.03,az:.14,lz:-.14,ex:-.3,le:-.3},
  dgwretch:{sx:.3,hx:-.26,lk:.16,rk:.16,lh:-.08,rh:-.08,dy:-.04,ax:-.3,lx:-.3,ex:-.5,le:-.5},
  ss165zealot:{sx:.16,hx:-.14,lk:.16,rk:.16,lh:-.08,rh:-.08,dy:-.03,lz:-.1,le:-.4},
  ss165caller:{sx:.1,hx:-.08,lk:.06,rk:.06,lh:-.03,rh:-.03,dy:-.01,lz:-.08,le:-.35}};
{const f=mkHumanoid;mkHumanoid=function(key){const g=f.apply(this,arguments);try{if(g)g.hk176=key}catch(_){}return g}}
{const f=humAnim;humAnim=function(g,now,mv){const r=f.apply(this,arguments);try{const St=g&&g.hk176&&ST176[g.hk176],b=g&&g.h&&g.h.bones;
    if(St&&b&&!(g.n3k&&N3.def[g.n3k]&&N3.def[g.n3k].stance)){for(const c in St){if(c=='dy'){b.pelvis.position.y+=St.dy;continue}const ch=HACH[c];if(ch&&b[ch[0]])b[ch[0]].rotation[ch[1]]+=St[c]}}}catch(e){}return r}}

// ---------------- Zealot of the Endless One: sun-dark, lean, ritual serpent scars, a bronze viper mask, wrapped arms, a rust kilt ----------------
f137Reg('ss165zealot',function(B,P,k,L){const X=f137(B,P,k,L),C=X.C,sk=mdSh(dkHex(L.skin),.8),rust=0x6a2412,rust2=0x4a180c,wrap=0x8a7a5a,bronze=0x8a6a2a,scar=mdSh(sk,.62);
  P.af=.92;P.lf=.95;Object.assign(C,{skin:sk,torso:sk,sleeve:sk,fore:sk,hand:mdSh(sk,.9),pants:wrap,shin:wrap,boot:0x3a2618,belt:0x2a1a10});
  // ritual scars: a serpent coiling down the chest and back, painted in dried blood
  P.paint.torso=m=>{const a=Math.atan2(m.x,m.z),w=Math.sin(a*2+m.y*22);return Math.abs(w)<.18&&m.y>.62&&m.y<.95?scar:sk};
  X.human({hair:0x140e0a,hairStyle:0});X.body();X.head({noHair:true});
  mdHelm(B,P,mdD('medium','viper',bronze,rust2));
  mdLoin(B,P,rust,rust2,.34,.6);mdSkirt(B,P,.6,.42,.03,.012,{col:m=>Math.round(m.c*8)%2?rust:rust2,n:4});
  // wrapped forearms and shins, bone charms on a cord, a curved-dagger sheath on the hip
  [-1,1].forEach(s=>{mdAS(B,P,s,4,6,.008,{col:m=>Math.round(m.y*60)%2?wrap:mdSh(wrap,.8)});mdLS(B,P,s,4,6,.008,{col:m=>Math.round(m.y*50)%2?wrap:mdSh(wrap,.8)})});
  for(let i=0;i<7;i++){const a=(i-3)*.24,p=n3Surf(P,.95-Math.abs(i-3)*.012,a,.012);k.p('chest',i%2?'cone4':'sph','c',i%2?0xe0d4b4:0x6a2412,p[0],p[1]-.012,p[2],.012,i%2?.04:.012,.01,Math.PI)}
  k.p('pelvis','box','c',0x2a1a10,-.19,.5,.02,.03,.16,.05,0,0,.25)});

// ---------------- Salt Caller: a salt-crusted sand robe, a blood-red hood, glowing salt crystals grown through the shoulders ----------------
f137Reg('ss165caller',function(B,P,k,L){const X=f137(B,P,k,L),C=X.C,sk=mdSh(dkHex(L.skin),.78),robe=0x9a8a68,robe2=0x6a5a40,red=0x5a1410,salt=0xe8e4dc,gl=0x40e0c0;
  Object.assign(C,{skin:sk,hand:sk});X.human({hair:0x1a1410,hairStyle:0});X.body();X.head({eyes:'glow',glow:gl,noHair:true});
  mdChest(B,P,mdD('cloth','robe',robe,red));mdHelm(B,P,mdD('cloth','tallcowl',red,0x3a0c08));mdBoots(B,P,mdD('cloth','wrapped',robe2,0x3a2a1a));
  // a crust of salt along the hem and sleeves, crystals through the shoulders and down the spine, a cord of salt beads
  mdTS(B,P,.36,.42,(P.sOff||P.tOff||0)+.02,{col:m=>Math.round(m.c*9)%2?salt:0xc8c0b0,lip:.02});
  [-1,1].forEach(s=>{const a=s<0?'aL0':'aR0',x=P.bones[a][1];for(let i=0;i<3;i++)k.p(a,'oct',i?'c':'g',i?salt:gl,x+s*(.02+i*.03),1.01+i*.02,-.02+i*.02,.022-i*.004,.06-i*.012,.022-i*.004,0,0,s*(.4+i*.25))});
  for(let i=0;i<4;i++)k.p('chest','oct','c',salt,0,.96-i*.07,-mdTorsoAt(P,.96-i*.07).b-(P.tOff||0)-.004,.016,.04,.016,-.5);
  for(let i=0;i<9;i++){const a=(i-4)*.2,p=n3Surf(P,.93-Math.abs(i-4)*.014,a,(P.tOff||0)+.012);k.p('chest','oct',i==4?'g':'c',i==4?gl:salt,p[0],p[1],p[2],.012)}});
