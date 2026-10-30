// ================= v176: enemy posture and the plainest foes dressed =================
// Owner: "optimize anatomy, posture and overall style … non-cartoony (dark fantasy), not too simple".
// * Posture: the older humanoid foes stood bolt upright like mannequins. ST176[hum key] is a stance laid over every pose
//   (idle, walk, attacks), like the v113 creatures' D.stance: a forward lean, the head raised to look ahead, bent knees (the hips
//   drop by what the bend takes off the leg, so the feet stay on the ground), arms held out from the body. Brutes hunch, ghouls stoop, goblins crouch, soldiers stand ready.
//   A v113 creature with its own D.stance keeps it.
// * The Searing Sands cultists (Zealot of the Endless One, Salt Caller) were a bare default body: they now have their own
//   builders (serpent mask and ritual scars / salt-crusted robes and a hood).
var ST176={
  orc:{sx:.2,hx:-.18,lk:.24,rk:.24,az:.1,lz:-.1,ex:-.2,le:-.25},
  troll:{sx:.28,hx:-.26,lk:.27,rk:.27,az:.12,lz:-.12,ax:-.12,lx:-.15,ex:-.3,le:-.35},
  trollsh:{sx:.24,hx:-.22,lk:.20,rk:.20,lz:-.08,le:-.25},
  yeti:{sx:.3,hx:-.28,lk:.27,rk:.27,ax:-.15,lx:-.15,az:.12,lz:-.12,ex:-.35,le:-.35},
  ghoul:{sx:.36,hx:-.32,lk:.34,rk:.34,ax:-.35,lx:-.35,ex:-.6,le:-.6},
  hob:{sx:.16,hx:-.14,lk:.27,rk:.27,az:.08,lz:-.1,le:-.25},
  sling:{sx:.16,hx:-.14,lk:.27,rk:.27,lz:-.1,le:-.25},
  shaman:{sx:.18,hx:-.16,lk:.20,rk:.20,lz:-.08,le:-.3},
  bandit:{sx:.1,hx:-.08,lk:.17,rk:.17,lz:-.06,le:-.2},
  brigand:{sx:.08,hx:-.06,lk:.14,rk:.14,lz:-.06,le:-.15},
  cultist:{sx:.1,hx:-.06,lk:.10,rk:.10,lz:-.05,le:-.3},
  giant:{sx:.12,hx:-.1,lk:.14,rk:.14,lz:-.1,le:-.2},
  jotun:{sx:.12,hx:-.1,lk:.14,rk:.14,lz:-.1,le:-.2},
  skel:{sx:.1,hx:.06,lk:.10,rk:.10},
  archer:{sx:.1,hx:.06,lk:.10,rk:.10},
  nagaw:{sx:.14,hx:-.12,lk:.17,rk:.17,lz:-.06},
  nagaa:{sx:.12,hx:-.1,lk:.17,rk:.17},
  nagas:{sx:.12,hx:-.1,lk:.10,rk:.10,lz:-.06,le:-.25},
  selem:{sx:.1,hx:-.08,lk:.14,rk:.14,az:.12,lz:-.12},
  revenant:{sx:.12,hx:-.06,lk:.09,rk:.09,lz:-.05,le:-.25},
  lichen:{sx:.16,hx:-.12,lk:.17,rk:.17,az:.08,lz:-.08,ex:-.25,le:-.25},
  executioner:{sx:.12,hx:-.1,lk:.17,rk:.17,lz:-.08},
  amalgam:{sx:.22,hx:-.2,lk:.24,rk:.24,az:.14,lz:-.14,ex:-.3,le:-.3},
  dgwretch:{sx:.3,hx:-.26,lk:.27,rk:.27,ax:-.3,lx:-.3,ex:-.5,le:-.5},
  ss165zealot:{sx:.16,hx:-.14,lk:.27,rk:.27,lz:-.1,le:-.4},
  ss165caller:{sx:.1,hx:-.08,lk:.10,rk:.10,lz:-.08,le:-.35}};
{const f=mkHumanoid;mkHumanoid=function(key){const g=f.apply(this,arguments);try{if(g)g.hk176=key}catch(_){}return g}}
{const f=humAnim;humAnim=function(g,now,mv){const r=f.apply(this,arguments);try{const St=g&&g.hk176&&ST176[g.hk176],b=g&&g.h&&g.h.bones;
    if(St&&b&&!(g.n3k&&N3.def[g.n3k]&&N3.def[g.n3k].stance)){for(const c in St){const ch=HACH[c];if(ch&&b[ch[0]])b[ch[0]].rotation[ch[1]]+=St[c]}
      // bent knees: each thigh swings forward half the bend so the shin comes back under the hip, and the hips drop by exactly
      // what the bend shortens the leg, so the feet stay planted
      [['lk','lh0','lh1','lh2'],['rk','rh0','rh1','rh2']].forEach(([c,h,kn,an])=>{const k=St[c]||0;if(!k||!b[h])return;b[h].rotation.x-=k/2});
      const k=Math.max(St.lk||0,St.rk||0);if(k&&b.lh1&&b.lh2)b.pelvis.position.y-=(b.lh1.position.length()+b.lh2.position.length())*(1-Math.cos(k/2))}}catch(e){}return r}}

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

// ---------------- palettes: dark-fantasy colours; enemies that shared another's body get their own ----------------
// VAR176[rig] = {'*': changes for every enemy on that body, <enemy key>: that enemy only}. The body builders (2640–2665)
// register their palette object (VARK176[rig]); it is swapped in while the model builds and the caches get their own keys.
var VAR176={suf:'',
  Croaker:{'*':{skin:0x48523a,skin2:0x30382a,blot:0x1c2216,belly:0x8e8668,horn:0x4a3e2c,gland:0x5e5a34,eye:0xa8802a,lip:0x4a1e1e},
    lurker:{skin:0x3c4836,skin2:0x283024,blot:0x141a10,eye:0x8aa830},
    boghorror:{skin:0x3a3a30,skin2:0x26261e,blot:0x12120c,belly:0x6e6450,eye:0xb84a24,horn:0x2a241c,gland:0x4a3a2a}},
  BloodHound:{snowwolf:{mus:0xa8b0bc,mus2:0x7a8490,sinew:0xd8e0e8,skin:0x3a424e,bone:0xe8e4dc,blood:0x4a6a88,glow:0x8ad8ff,dark:0x101418}},
  Basilisk:{magmadrake:{skin:0x2a2420,skin2:0x16120e,belly:0x5a2a14,stone:0x3a3430,dew:0xe8601a,horn:0x4a3a2e,frill:0x6a1a0a,frill2:0xd8501a,eye:0xffa020}},
  BloodBat:{cavebat:{fur:0x241c18,skin:0x5a4a40,skin2:0x3e322a,belly:0x6a4a3a,mem:0x2e2420,vein:0x4a3a30,glow:0xd8a040}},
  DustWyrm:{'*':{sand:0x8e7652,sand2:0x5e4830,belly:0xa89470,plate:0x6e5638},sandwyrm:{sand:0x7e7058,sand2:0x524430,belly:0x9a8c70,plate:0x5e5040,glass:0xff7a2a}},
  Rimecrawler:{stalker:{shell:0x4a4a5a,shell2:0x2a2a36,dark:0x16161e,under:0x22222c,ice:0x8a8aa0,glow:0xb05aff,eye:0xd88aff}},
  Snapper:{tortoise:{shell:0x5a5a58,shell2:0x3a3a38,skin:0x4e4e46,skin2:0x343430,moss:0x4a5236}},
  Banshee:{wraith:{gown:0x3a4658,gown2:0x1e2632,lace:0x8a96a4,hair:0x6a7480,hair2:0x4a525e,glow:0x7ab8ff}},
  Shambler:{'*':{cap:0x4a2a3a,cap2:0x6a4050}},
  SunScarab:{'*':{sh:0x6a5226,sh2:0x3e2e12,hi:0xb8963a}}};
{const f=lpRig;lpRig=function(c,n,D){const V=VAR176[n],K=window.VARK176&&VARK176[n],key=c&&c.g&&c.g[0];if(!V||!K)return f.apply(this,arguments);
  const own=key&&V[key],ov=Object.assign({},V['*']||{},own||{}),old={};for(const q in ov){old[q]=K[q];K[q]=ov[q]}const o=VAR176.suf;VAR176.suf=own?'|v176'+key:'|v176';
  try{return f.apply(this,arguments)}finally{for(const q in old)K[q]=old[q];VAR176.suf=o}}}
{const f=lpGeo;lpGeo=function(key){if(VAR176.suf&&key){arguments[0]=key+VAR176.suf}return f.apply(this,arguments)}}
{const f=dkBake;dkBake=function(P,O,key){if(VAR176.suf&&key&&/^LP\|/.test(key))key+=VAR176.suf;return f.call(this,P,O,key)}}
