// =====================================================================================================
// (npc() runs while the towns are built, before this code: everything here is hoisted functions + lazy state)
function idlNB(){return idlNB.c||(idlNB.c={pelvis:[null,0,.55,0],spine:['pelvis',0,.65,0],chest:['spine',0,.85,0],neck:['chest',0,.99,0],head:['neck',0,1.04,0],
  lh0:['pelvis',-.1,.55,0],lh1:['lh0',-.1,.3,.02],lh2:['lh1',-.1,.07,0],rh0:['pelvis',.1,.55,0],rh1:['rh0',.1,.3,.02],rh2:['rh1',.1,.07,0],
  aL0:['chest',-.2,.95,0],aL1:['aL0',-.235,.72,.1],aL2:['aL1',-.11,.655,.19],aR0:['chest',.2,.95,0],aR1:['aR0',.235,.72,.1],aR2:['aR1',.11,.655,.19]})}
function npc(p,x,z,o){DKBK=DKBK||{};
  tc(p,x,z,.38);const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=o.ry||0;p.add(g);
  let rig=null;try{rig=idlNpcBody(o)}catch(e){console.error('town folk rig',e)}
  if(rig){rig.meshes.forEach(m=>g.add(m));g.bones=rig.bones}else huNpcBody(o).forEach(m=>g.add(m));
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:txTex([{t:o.label,f:'700 30px'}],256,56,'rgba(10,14,20,.78)','#f4e9c8','rgba(255,214,120,.7)'),transparent:true,depthWrite:false}));
  sp.scale.set(1.5,.33,1);sp.position.set(0,2.05,0);g.add(sp);
  const wb=wbase(p,T_cur);
  TANIM.push({x:wb[0]+x,z:wb[1]+z,f:rig?now=>idlNpc(g,now):now=>{g.position.y=Math.sin(now/700+x)*.012;g.rotation.y=(o.ry||0)+Math.sin(now/2300+z)*.12}});
  return g}
function idlNpc(g,now){
  if(typeof IDL=='undefined'||!IDL||!g.bones)return;
  if(!IDL.on){const S=g._idl;if(S&&S.on){for(const c of S.C)idlAp(c,0);S.on=0}return}
  let t0=IDL.prof?IDL.pnow():0;
  try{let S=g._idl;if(!S){S=g._idl=idlNew(g,1.15);S.sp[0]=1}
    const dt=S.lt0==null?0:Math.min(.05,Math.max(0,(now-S.lt0)/1000));S.lt0=now;
    if(!g.visible||(g.parent&&!g.parent.visible)){return}
    idlHum(g,S,dt,3,true,0,false)}catch(e){if(!IDL.err){IDL.err=1;console.warn('idle town folk',e)}}
  if(IDL.prof){IDL.ms+=IDL.pnow()-t0;IDL.n++}}

