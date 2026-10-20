// ================= v83: low-poly mounts (Valheim style) — uses the bakers in zzG_gear.js =================
// One skinned, vertex-painted body per mount, driven by the same simple gait as before.
// The rig keeps the old shape of mkMountRig: r.b (body, bobbed and pitched), legs [{hip,kn,ph,front}], neck, tail, wings, flame, r.seat.
// hip/kn/neck/head/tail are now Bones, so one seamless mesh bends with them.
var LGMS={
 pony:{L:1.35,H:.48,W:.36,leg:.58,lr:.066,nl:.55,na:.55,hl:.42,hw:.14,hh:.18,c:0x7a5434,c2:0x45301f,bel:0xa88a68,m:0x1e1510,hoof:0x1e1812,eye:0x0e0a08,tl:.55,tr:-2.55,ear:'horse',tail:'hair',mane:1,feath:1},
 boar:{L:1.3,H:.6,W:.46,leg:.38,lr:.08,nl:.22,na:1.2,hl:.44,hw:.22,hh:.26,c:0x4e3e32,c2:0x2e241c,bel:0x6e5c4a,m:0x1a1410,hoof:0x16110e,eye:0xff6a2a,tl:.22,tr:-2.4,ear:'boar',tail:'stub',
   bp:[[-.53,.3,.2,.18,0],[-.45,.78,.38,.38,0],[-.3,.96,.44,.46,0],[-.1,.98,.5,.52,.04],[.12,1.04,.6,.54,.1],[.3,1.08,.62,.52,.12],[.44,.9,.5,.44,.08],[.53,.5,.3,.3,.05]]},
 stag:{L:1.3,H:.42,W:.3,leg:.72,lr:.05,nl:.6,na:.42,hl:.38,hw:.12,hh:.15,c:0xb3a690,c2:0x6e6656,bel:0xe8e0d0,m:0x8a8270,hoof:0x2a2620,eye:0x9ad8ff,tl:.16,tr:-2.1,ear:'deer',tail:'flash'},
 ram:{L:1.2,H:.55,W:.44,leg:.48,lr:.062,nl:.28,na:.8,hl:.34,hw:.14,hh:.17,c:0xcfc3a6,c2:0x2e2824,bel:0xbcb096,m:0xcfc3a6,hoof:0x161210,eye:0xe8c060,tl:.16,tr:-2.4,ear:'droop',tail:'stub',wool:1,face:0x3a322c},
 charger:{L:1.55,H:.55,W:.4,leg:.66,lr:.075,nl:.62,na:.5,hl:.46,hw:.155,hh:.2,c:0x2c1e18,c2:0x1a1210,bel:0x3e2e24,m:0xff6a1a,hoof:0x111111,eye:0xffa040,tl:.6,tr:-2.5,ear:'horse',tail:'fire',fire:1,barding:1},
 raptor:{L:1.1,H:.5,W:.34,leg:.78,lr:.08,nl:.68,na:.45,hl:.56,hw:.12,hh:.16,c:0xc49658,c2:0x7a5228,bel:0xe8d2a6,m:0xc8402e,hoof:0x2a2018,eye:0xffd040,tl:.95,tr:-1.75,biped:1,tail:'thick',stripes:1},
 panther:{L:1.5,H:.42,W:.32,leg:.55,lr:.07,nl:.32,na:.95,hl:.32,hw:.16,hh:.15,c:0x1e1c24,c2:0x131117,bel:0x2c2832,m:0x1e1c24,hoof:0x0e0c12,eye:0x8aff6a,tl:.9,tr:-1.9,ear:'cat',paw:1,tail:'thin',
   bp:[[-.53,.3,.2,.16,0],[-.45,.78,.4,.34,.02],[-.3,.95,.46,.4,.02],[-.1,.8,.4,.4,-.02],[.12,.88,.44,.48,0],[.3,1.02,.5,.5,.04],[.44,.86,.44,.42,.06],[.53,.5,.28,.28,.08]]},
 destrier:{L:1.5,H:.52,W:.36,leg:.68,lr:.04,nl:.6,na:.5,hl:.46,hw:.13,hh:.18,c:0xd8d0b8,c2:0xa89e84,bel:0xd8d0b8,m:0x6affc8,hoof:0x3a3a3a,eye:0x6affc8,tl:.5,tr:-2.5,skel:1,ear:'none',tail:'ghost'},
 direwolf:{L:1.55,H:.56,W:.4,leg:.66,lr:.08,nl:.42,na:.85,hl:.48,hw:.17,hh:.19,c:0x423d3c,c2:0x262222,bel:0x7a7270,m:0x2a2626,hoof:0x141212,eye:0xff2a1a,tl:.6,tr:-2.2,ear:'wolf',paw:1,ruff:1,tail:'bushy'},
 drake:{L:1.6,H:.56,W:.42,leg:.6,lr:.09,nl:.7,na:.6,hl:.48,hw:.15,hh:.17,c:0x4e1e2a,c2:0x2a0e16,bel:0xb8683a,m:0x5a2030,hoof:0x18080e,eye:0xffb03a,tl:1.1,tr:-1.9,paw:1,wings:1,tail:'thick',spikes:1}
};

function mkMountRig(k){
  const r=MDL100_rig(MDL100_S[k]?k:'pony');if(!r)throw new Error('mount model failed: '+k);return r
}
// the saddle: blanket in the mount's tier colour, leather seat with a raised cantle, stirrups
function mountModel(k){
  const r=mkMountRig(MOUNTS[k]?k:'pony'),g=new THREE.Group();g.add(r);g.r=r;g.seat=r.seat;
  const sd=new THREE.Group();sd.position.set(0,r.seat[0]-.06,r.seat[1]);g.add(sd);g.sd=sd;
  return MDL100_fin(g,k);
}

