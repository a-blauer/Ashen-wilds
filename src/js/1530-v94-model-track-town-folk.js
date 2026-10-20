// ================= v94 (model track): town folk =================
// idlNpcBody (v93 idle, re-declared here) builds the Duskhold folk on the same small skeleton (idlNB: hands folded in
// front), so the v93 town-folk idle (breathing, weight shifts, stretches, nods) is unchanged. The body now comes from the
// shared v94 toolkit: a clean robe with sleeves, belt and pouch, an apron for cooks and smiths, and a hat, hood or hair
// with an optional beard — one cached geometry per look (key from the npc options), shared materials.
// Runs while the towns are built, before this file's own code: only hoisted functions and lazily created state here.
function mdNpcB(o){const NB=idlNB(),B=mdB(NB),seed=((o.robe|0)*31+(o.trim|0)*7+((o.hatC|0)*3))%99991+11,R=dkRng(seed);
  const sks=[0xd6aa84,0xbe926e,0x966c4e,0xdeba98],hcs=[0x2a1a12,0x4a3a2a,0x6a6a66,0x8a8a88,0x5a3418,0x1a1410],skin=sks[Math.floor(R()*4)],hair=hcs[Math.floor(R()*6)];
  const fem=R()<.35,look={hair,hairStyle:fem?(R()<.5?1:2):(R()<.5?0:5),face:fem?0:[0,1,2,3][Math.floor(R()*4)],eye:0x3a3a2a,sex:fem?1:0};
  const rb=mdC(o.robe),tr=mdC(o.trim||mdSh(rb,.6)),P=mdP({bones:NB,sex:look.sex,look,col:{skin,torso:rb,pants:mdSh(rb,.7),boot:0x2a1d14,belt:0x2a1d14}});
  P._T=mdTorso(P);mdBody(B,P);const hat=o.hat||'',hood=!hat&&R()<.4;
  mdHead(B,P,{hood:hood||hat=='chef',noScalp:hat=='cap'});
  const d={a:'cloth',st:'robe',ti:0,r:0,M:rb,A:tr,G:null,dk:mdSh(rb,.6),gem:tr};mdChest(B,P,d);
  mdBoots(B,P,{a:'cloth',st:'slipper',ti:0,M:0x2a1d14,A:tr,G:null,dk:0x1a1410});
  const k=dkKit();
  if(o.apron){mdTS(B,P,.62,.93,(P.tOff||0)+.008,{col:0xd8d0bc,keep:m=>m.s>.45});mdSkirt(B,P,.62,.3,.04,(P.sOff||0)+.008,{col:m=>m.y<.33?0xb8b0a0:0xd8d0bc,keep:m=>m.s>.5,n:4})}
  k.p('pelvis','box','c',0x3a2a1a,-.17,.52,.08,.06,.08,.04,0,-.5,0);
  if(hat=='wiz')mdHelm(B,P,{a:'cloth',st:'hat',ti:1,r:0,M:mdC(o.hatC),A:tr,G:null,dk:mdSh(mdC(o.hatC),.6),gem:tr});
  else if(hat=='cap'){const c=mdC(o.hatC);mdLoft(B,mdHeadR(P).filter(r=>r.y>=1.15),{seg:10,off:.022,capB:true,col:c});k.p('head','box','c',mdSh(c,.8),0,1.17,mdHeadZ(P,1.17)+.03,.15,.016,.06,.15);k.L('head','c',mdSh(c,1.3),[.07,1.24,-.04],[.15,1.34,-.12],.012,.003,4)}
  else if(hat=='chef'){k.p('head','cyl','c',0xd8d2c4,0,1.29,0,.11,.12,.11);k.p('head','sph','c',0xe4ded0,0,1.37,0,.14,.07,.14);mdLoft(B,mdHeadR(P).filter(r=>r.y>=1.15),{seg:10,off:.016,capB:true,col:0xd8d2c4})}
  else if(hood)mdHelm(B,P,{a:'cloth',st:'linen',ti:0,r:0,M:mdSh(tr,.8),A:tr,G:null,dk:mdSh(tr,.5),gem:tr});
  mdKit(B,k);return B}
function idlNpcBody(o){const NB=idlNB(),key='NPC|'+o.robe+'|'+(o.trim||0)+'|'+(o.hat||'')+'|'+(o.hatC||0)+'|'+(o.apron?1:0),G=mdGeo(key,()=>mdNpcB(o)),M=mdMats();
  const mb=mkBones({bones:NB}),mesh=new THREE.SkinnedMesh(G.c,M.c);mesh.castShadow=true;mesh.add(mb.bones.pelvis);mesh.updateMatrixWorld(true);mesh.bind(new THREE.Skeleton(mb.arr));
  const out=[mesh];['m','g'].forEach(t=>{if(!G[t])return;const m=new THREE.SkinnedMesh(G[t],M[t]);m.castShadow=t!='g';m.bind(mesh.skeleton,mesh.bindMatrix);out.push(m)});
  return {meshes:out,bones:mb.bones}}

