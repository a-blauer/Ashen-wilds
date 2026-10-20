// =============== 11. CAMP RAIDS: clear a camp → its leader arrives → treasure chest ===============
function campChest(C){
  const g=new THREE.Group(),y=GH(C.x,C.z);g.position.set(C.x,y,C.z);
  TQ(g,G_BOX,sm(0x6a4424),0,.32,0,1.1,.64,.72);TQ(g,G_BOX,sm(0x7a5230),0,.74,0,1.12,.22,.74);TQ(g,G_BOX,sm(0xd8a830,{metalness:.7,roughness:.3}),0,.4,.37,.18,.24,.04);
  [-.5,.5].forEach(x=>TQ(g,G_BOX,sm(0xc89a30,{metalness:.7,roughness:.3}),x,.45,0,.06,.9,.76));
  const gl=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,3.4,20,1,true),new THREE.MeshBasicMaterial({color:0xffd060,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));gl.position.y=1.7;g.add(gl);
  scene.add(g);C.chest={g,x:C.x,z:C.z+.0};say('💰 The leader has fallen! The camp treasure chest is yours. Press F to open it.');sfx('chime');
}
function campChestPrompt(){for(const C of CAMPS){if(C.chest&&Math.hypot(pl.position.x-C.chest.x,pl.position.z-C.chest.z)<2.2)return {label:'F · Open camp treasure',fn:()=>openCampChest(C)}}return null}
function openCampChest(C){
  const ch=C.chest;if(!ch)return;C.chest=null;const p=V(ch.x,0,ch.z+1),l=zoneLv(C.x,C.z),T=tierAt(C.x,C.z);
  tw(500,k=>{ch.g.scale.setScalar(1-k*.9);ch.g.position.y+=.02},()=>scene.remove(ch.g));burst(gY(p,.8),0xffd060,60,3,3,.8);sfx('chime');
  const g=Math.round((40+l*12)*(.9+Math.random()*.3));gold+=g;dn(p,'+'+g+' 🪙','#fbbf24',-26,1300);
  const it=genItem(l,{minR:Math.random()<.35?2:1,cls:hero.cls});drop('gear',it,p,it.r);
  drop('mat',{k:UPM[T-1][0],n:R(2,4)},p,T-1);
  if(Math.random()<.45){const eg=rollEgg(T);drop('egg',eg,p,eg.tier)}
  if(Math.random()<.5)drop('sup',{k:'s_'+pickSeed(T,Object.keys(CROPS)),n:R(1,3)},p,1);
  C.raid=0;C.kt=nowP();hud();
}

// ---------- per-frame bookkeeping (called from homeTick) ----------
function combatTick(dt,now){
  if((hero.cr||0)>0&&now-(hero.crT||0)>6000){hero.cr=Math.max(0,hero.cr-14*dt);resUI()}
  if(now-(combatTick.u||0)>120){combatTick.u=now;strkUI(false);resUI()}
  CAMPS.forEach(C=>{if(C.raid&&now-C.rT>150000&&!enemies.some(e=>e.leader===C&&!e.dead)){C.raid=0;C.kt=now}});
}
// settings: sound toggle
{const st=$('s_sfx');if(st){st.checked=SET.sfx!==false;st.onchange=()=>{SET.sfx=st.checked;saveSet()}}}
