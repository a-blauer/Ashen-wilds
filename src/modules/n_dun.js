// ================= v36: Dungeons — instanced room-by-room crawls with a warden and a treasure chest =================
const DUNS=[
 {n:'Hollowroot Burrow',z:1,lv:[5,9],tx:134,ty:260,col:0x8ac060,flo:0x4a4234,wal:0x5a4e3c},
 {n:'Sunken Crypt',z:2,lv:[13,19],tx:287,ty:287,col:0x7ab8e8,flo:0x3c4248,wal:0x4c545c},
 {n:'Ember Forge Depths',z:3,lv:[23,29],tx:427,ty:231,col:0xff7a3a,flo:0x3a2a26,wal:0x4a302a},
 {n:'Ossuary of Kings',z:4,lv:[33,39],tx:574,ty:231,col:0xd8d0b8,flo:0x48443c,wal:0x5c564a},
 {n:'Stormspire Vault',z:5,lv:[43,49],tx:700,ty:224,col:0x9ad8ff,flo:0x34384a,wal:0x44485e}
];
const DX0=1200,DZ0=40,DGW=72,DGH=34;let inDun=null;const dunClears={};
// put each entrance on the nearest open, walkable tile
DUNS.forEach(D=>{let best=null,bd=1e9;for(let r=0;r<30&&!best;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const x=D.tx+dx,y=D.ty+dy;if(x<3||y<3||x>W-4||y>H-4)continue;const t=MAP[y][x];
  if(!'.ga'.includes(t)||townAt(x,y,4)>=0||BOSSES.some(b=>Math.hypot(b.x-x,b.y-y)<20))continue;let ok=true;for(let q=-1;q<=1;q++)for(let w=-1;w<=1;w++){const u=MAP[y+q]&&MAP[y+q][x+w];if(!u||'#~rRWB'.includes(u))ok=false}if(!ok)continue;const d=Math.hypot(dx,dy);if(d<bd){bd=d;best=[x,y]}}
  D.x=best?best[0]:D.tx;D.y=best?best[1]:D.ty;
  const g=new THREE.Group(),y0=GH(D.x,D.y);g.position.set(D.x,y0,D.y);scene.add(g);D.g=g;
  const rk=sm(0x6a6258,{flatShading:true});[[-1.3,0,1.6,2.2],[1.3,0,1.6,2.1],[0,2.2,2.6,1.1],[-.6,-1.1,1.1,1.3],[.8,-1.2,1,1.2]].forEach(q=>{const m=TQ(g,G_OCT,rk,q[0],q[1]*.55+1,q[3]*-.2-.4,q[2]*.8,q[3],q[2]*.8);m.rotation.y=q[0]})
  const dark=new THREE.Mesh(new THREE.CircleGeometry(1.05,24),new THREE.MeshBasicMaterial({color:0x050404}));dark.position.set(0,1.05,.15);g.add(dark);
  const glow=new THREE.Mesh(new THREE.CircleGeometry(.9,24),new THREE.MeshBasicMaterial({color:D.col,transparent:true,opacity:.25,blending:THREE.AdditiveBlending,depthWrite:false}));glow.position.set(0,1.05,.2);g.add(glow);
  sign(g,[{t:D.n.toUpperCase(),f:'700 34px'},{t:'Dungeon · Lv '+D.lv[0]+'–'+D.lv[1],f:'600 22px'}],2.2,.55,'#14100c','#f4e9c8','#c9a24a',0,2.9,.5,0,512,130);
  TANIM.push({x:D.x,z:D.y,f:now=>{glow.material.opacity=.18+.1*Math.sin(now/400)}});
});
// ---------- instance geometry (reused between runs) ----------
const DG=new Uint8Array(DGW*DGH);
const DFL=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.2,1),new THREE.MeshStandardMaterial({roughness:.95}),DGW*DGH),DWL=new THREE.InstancedMesh(new THREE.BoxGeometry(1,3.2,1),new THREE.MeshStandardMaterial({roughness:.9,flatShading:true}),DGW*DGH);
[DFL,DWL].forEach(m=>{m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(DGW*DGH*3),3);m.count=0;m.frustumCulled=false;m.receiveShadow=true;scene.add(m)});DWL.castShadow=true;
const DUNG=new THREE.Group();scene.add(DUNG);
const DLT=[0,1,2,3].map(()=>{const l=new THREE.PointLight(0xffa050,0,9);scene.add(l);return l});
const dIdx=(gx,gz)=>gx+gz*DGW,dAt=(gx,gz)=>gx<0||gz<0||gx>=DGW||gz>=DGH?0:DG[dIdx(gx,gz)];
function dunSolid(x,z){const gx=Math.round(x-DX0),gz=Math.round(z-DZ0),t=dAt(gx,gz);return t==0||t==2}
let solidWrapReady=true;
function solid(x,z){if(inDun)return dunSolid(x,z);return solid_old(x,z)||(!inRealm&&typeof CBLK!='undefined'&&CBLK.size>0&&CBLK.has(Math.round(z)*W+Math.round(x)))}
function dunBuild(D){
  DG.fill(0);while(DUNG.children.length)DUNG.remove(DUNG.children[0]);
  const rooms=[],N=4+(D.z>=3?1:0);let x=2;
  for(let r=0;r<N+1;r++){const boss=r==N,w=boss?14:R(8,11),h=boss?13:R(8,11),cz=17+(r==0||boss?0:R(-5,5)),z0=Math.max(1,Math.min(DGH-h-1,cz-(h>>1)));rooms.push({x0:x,z0,w,h,boss,start:r==0});x+=w+R(4,6)}
  rooms.forEach(rm=>{for(let a=0;a<rm.w;a++)for(let b=0;b<rm.h;b++)DG[dIdx(rm.x0+a,rm.z0+b)]=1;rm.cx=rm.x0+(rm.w>>1);rm.cz=rm.z0+(rm.h>>1)});
  const carve=(x,z)=>{if(x>=0&&z>=0&&x<DGW&&z<DGH&&DG[dIdx(x,z)]==0)DG[dIdx(x,z)]=1};
  for(let r=0;r<rooms.length-1;r++){const A=rooms[r],B=rooms[r+1],mx=Math.floor((A.x0+A.w+B.x0)/2);
    for(let gx=A.x0+A.w;gx<=mx;gx++)for(let k=-1;k<=1;k++)carve(gx,A.cz+k);
    for(let z=Math.min(A.cz,B.cz)-1;z<=Math.max(A.cz,B.cz)+1;z++)for(let k=-1;k<=1;k++)carve(mx+k,z);
    for(let gx=mx;gx<B.x0;gx++)for(let k=-1;k<=1;k++)carve(gx,B.cz+k);
    if(!A.start)A.seal=[-1,0,1].map(k=>dIdx(A.x0+A.w,A.cz+k))}
  // geometry
  let nf=0,nw=0;const d0_=new THREE.Object3D(),cc_=new THREE.Color();
  for(let gz=0;gz<DGH;gz++)for(let gx=0;gx<DGW;gx++){const t=DG[dIdx(gx,gz)],wx=DX0+gx,wz=DZ0+gz,h=hh(gx*7+1,gz*13+3);
    if(t){d0_.position.set(wx,-.1,wz);d0_.scale.set(1,1,1);d0_.updateMatrix();DFL.setMatrixAt(nf,d0_.matrix);cc_.setHex(D.flo).offsetHSL(0,0,(h-.5)*.05);DFL.setColorAt(nf++,cc_)}
    else{let near=false;for(let a=-1;a<=1&&!near;a++)for(let b=-1;b<=1;b++)if(dAt(gx+a,gz+b)){near=true;break}
      if(near){d0_.position.set(wx,1.5,wz);d0_.scale.set(1,1+h*.25,1);d0_.updateMatrix();DWL.setMatrixAt(nw,d0_.matrix);cc_.setHex(D.wal).offsetHSL(0,0,(h-.5)*.08);DWL.setColorAt(nw++,cc_)}}}
  [[DFL,nf],[DWL,nw]].forEach(a=>{a[0].count=a[1];a[0].instanceMatrix.needsUpdate=true;a[0].instanceColor.needsUpdate=true});
  // dark ground skirt so the void never shows
  const sk=new THREE.Mesh(new THREE.PlaneGeometry(DGW+60,DGH+60),new THREE.MeshBasicMaterial({color:0x0a0806}));sk.rotation.x=-Math.PI/2;sk.position.set(DX0+DGW/2,-.25,DZ0+DGH/2);DUNG.add(sk);
  // torches in every room
  D.torch=[];rooms.forEach(rm=>[[rm.x0,rm.z0],[rm.x0+rm.w-1,rm.z0],[rm.x0,rm.z0+rm.h-1],[rm.x0+rm.w-1,rm.z0+rm.h-1]].forEach(q=>{const x=DX0+q[0],z=DZ0+q[1];TQ(DUNG,G_CYL,sm(0x2a2622),x,.6,z,.08,1.2,.08);const f=TQ(DUNG,G_CONE,new THREE.MeshBasicMaterial({color:D.col}),x,1.35,z,.16,.38,.16);f.castShadow=false;D.torch.push(f)}));
  // seals between rooms
  rooms.forEach(rm=>{if(!rm.seal)return;rm.sealM=new THREE.Group();rm.seal.forEach(i=>{DG[i]=2;const gx=i%DGW,gz=(i/DGW)|0;const m=new THREE.Mesh(G_BOX,new THREE.MeshBasicMaterial({color:D.col,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.set(DX0+gx,1.2,DZ0+gz);m.scale.set(1,2.4,1);rm.sealM.add(m)});DUNG.add(rm.sealM)});
  // exit portal in the first room
  const p0=rooms[0],pg=new THREE.Group();pg.position.set(DX0+p0.x0+1.5,0,DZ0+p0.cz);pm(pg,'tor',D.col,0,1.2,0,1.8,1.8,1.8,0,0,1).scale.z=.5;pg.rotation.y=Math.PI/2;DUNG.add(pg);D.exitP=[DX0+p0.x0+1.5,DZ0+p0.cz];
  return rooms;
}
function dunEnter(D){
  if(AF)return;if(riding)dismount();if(gat)gat=null;
  fadeTo(()=>{
    const rooms=dunBuild(D);inDun={D,rooms,ret:{x:pl.position.x,z:pl.position.z+2},cur:0,done:false,chest:null};
    enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});drops.slice().forEach(d=>scene.remove(d.g));drops.length=0;
    const r0=rooms[0];pl.position.set(DX0+r0.x0+3,0,DZ0+r0.cz);camYaw=-Math.PI/2;snapCam();mist.visible=false;
    rooms.forEach((rm,i)=>{if(rm.start)return;rm.foes=[];const L=dunFoes(D);
      if(rm.boss){const e=spawnEnemy(L[0],DX0+rm.cx,DZ0+rm.cz,D.lv[1]+1,{al:1,minion:1,zt:D.z});e.c.n='Warden of '+D.n.split(' ').slice(-1)[0];if(e.c.st){e.c.st.hp*=4;e.c.st.pa*=1.15;e.c.st.ma*=1.15}e.c.h=M(e.c);e.m.bs*=1.5;e.m.scale.setScalar(e.m.bs);e.dw=1;rm.foes.push(e)}
      else{const n=3+R(0,1)+(D.z>=3?1:0);for(let k=0;k<n;k++){const el=Math.random()<.22;const e=spawnEnemy(L[R(0,L.length-1)],DX0+rm.x0+2+Math.random()*(rm.w-4),DZ0+rm.z0+2+Math.random()*(rm.h-4),R(D.lv[0],D.lv[1])+(el?2:0),{al:el,minion:1,zt:D.z});rm.foes.push(e)}}
      rm.foes.forEach(e=>{e.dun=1;e.agg=0;e.wt=999})});
    banner('⛏ '+D.n.toUpperCase(),'Dungeon · Lv '+D.lv[0]+'–'+D.lv[1],'Clear each room to break the seal. A Warden guards the treasure.');hud();
  });
}
function dunFoes(D){const L=[];BIOMES.forEach(b=>{if(b.t==D.z)(BIOEN[b.n]||[]).forEach(k=>{if(!L.includes(k))L.push(k)})});return L.length?L:['hobgoblin']}
function dunExit(walkOut){
  if(!inDun)return;const S=inDun;inDun=null;
  enemies.slice().forEach(e=>{if(e.dun)removeE(e)});drops.slice().forEach(d=>scene.remove(d.g));drops.length=0;
  DFL.count=0;DWL.count=0;while(DUNG.children.length)DUNG.remove(DUNG.children[0]);DLT.forEach(l=>l.intensity=0);mist.visible=true;
  if(walkOut){pl.position.set(S.ret.x,0,S.ret.z);snapCam()}hud();
}
function dunTick(dt,now){
  if(!inDun)return;const S=inDun,P=pl.position,gx=Math.round(P.x-DX0),gz=Math.round(P.z-DZ0);
  S.rooms.forEach((rm,i)=>{const inside=gx>=rm.x0&&gx<rm.x0+rm.w&&gz>=rm.z0&&gz<rm.z0+rm.h;
    if(inside&&rm.foes&&!rm.woke){rm.woke=1;rm.foes.forEach(e=>{if(!e.dead){e.agg=1;e.wt=0}});if(rm.boss)banner('⚔ '+rm.foes[0].c.n,'Dungeon Warden','Defeat it to claim the treasure')}
    if(rm.foes&&!rm.cleared&&rm.foes.every(e=>e.dead)){rm.cleared=1;
      if(rm.sealM){rm.seal.forEach(q=>DG[q]=1);const g=rm.sealM;tw(500,k=>g.children.forEach(m=>m.material.opacity=.35*(1-k)),()=>DUNG.remove(g));say('🔓 The seal breaks.')}
      if(rm.boss)dunVictory(rm)}
  });
  // keep sleeping monsters home, light the torches nearest the hero
  S.D.torch&&S.D.torch.forEach((f,i)=>f.scale.y=.38*(1+.2*Math.sin(now/90+i)));
  const ts=(S.D.torch||[]).slice().sort((a,b)=>d2(a.position,P)-d2(b.position,P));DLT.forEach((l,i)=>{const t=ts[i];if(t){l.color.setHex(S.D.col);l.position.set(t.position.x,1.8,t.position.z);l.intensity=1.3+.2*Math.sin(now/110+i);l.distance=10}else l.intensity=0});
}
function dunVictory(rm){
  const S=inDun,D=S.D;S.done=true;const c=new THREE.Group(),x=DX0+rm.cx,z=DZ0+rm.cz;c.position.set(x,0,z);
  pm(c,'box',0x6a4020,0,.35,0,1.2,.7,.8);pm(c,'box',0x7a4a24,0,.82,0,1.24,.3,.84);pm(c,'box',0xd8b040,0,.5,.42,.2,.24,.06,0,0,.4);[-.55,.55].forEach(q=>pm(c,'box',0x3a3a40,q,.5,0,.08,.75,.86));
  DUNG.add(c);S.chest={x,z,g:c,open:false};ring(V(x,0,z),0xffd24a,3,600);burst(V(x,1,z),0xffd24a,60,3,3,.8);
  const pg=new THREE.Group();pg.position.set(x+3,0,z);pm(pg,'tor',D.col,0,1.2,0,1.8,1.8,1.8,0,0,1).scale.z=.5;pg.rotation.y=Math.PI/2;DUNG.add(pg);S.exit2=[x+3,z];
  banner('🏆 DUNGEON CLEARED',D.n,'Open the treasure chest (F)');
}
function dunChest(){
  const S=inDun;if(!S||!S.chest||S.chest.open)return;S.chest.open=true;const D=S.D,p=V(S.chest.x,0,S.chest.z),T=D.z,l=D.lv[1],first=!dunClears[D.n];
  tw(500,k=>{S.chest.g.children[1].rotation.x=-1.2*k;S.chest.g.children[1].position.z=-.3*k});
  const g=Math.round((60+l*12)*(first?2:1));gold+=g;dn(p,'+'+g+' 🪙','#fbbf24',-30,1600);
  for(let k=0;k<(first?3:2);k++){const it=genItem(l,{minR:T>=2?2:1,cls:hero.cls});drop('gear',it,p,it.r)}
  drop('mat',{k:UPM[T-1][0],n:R(3,5)},p,T-1);if(Math.random()<.35+(first?.3:0)){const eg=rollEgg(T);drop('egg',eg,p,eg.tier)}
  if(Math.random()<.03){const eg=rollMountEgg(T);drop('megg',eg,p,eg.t-1)}
  drop('sup',{k:'s_'+pickSeed(T,Object.keys(CROPS)),n:R(2,3)},p,1);if(Math.random()<.5)drop('potion',null,p,1);
  dunClears[D.n]=(dunClears[D.n]||0)+1;bountyOnDungeon(D.z);
  say('💰 Treasure! '+(first?'First clear bonus: double gold and an extra item. ':'')+'Step into the portal to leave.');
}
// world map + mini map support
function mini(){
  if(!inDun){mini_base();if(inRealm){const w=mmC.width,h=mmC.height;miniArrow((pl.position.x-RX+.5)*w/RN,(pl.position.z-RZ+.5)*h/RN)}else{const w=mmC.width,h=mmC.height,vw=64,vh=48,cx=Math.max(vw/2,Math.min(W-vw/2,pl.position.x)),cy=Math.max(vh/2,Math.min(H-vh/2,pl.position.z));if(typeof miniMarks=='function')miniMarks(w,h,vw,vh,cx,cy);miniArrow((pl.position.x-(cx-vw/2)+.5)*w/vw,(pl.position.z-(cy-vh/2)+.5)*h/vh)}return}const w=mmC.width,h=mmC.height;mmX.fillStyle='#0a0806';mmX.fillRect(0,0,w,h);const k=Math.min(w/DGW,h/DGH)*1.6,ox=w/2-(pl.position.x-DX0)*k,oz=h/2-(pl.position.z-DZ0)*k;
  for(let gz=0;gz<DGH;gz++)for(let gx=0;gx<DGW;gx++){const t=DG[dIdx(gx,gz)];if(!t)continue;mmX.fillStyle=t==2?'#c084fc':'#6a5a48';mmX.fillRect(ox+gx*k,oz+gz*k,k+.5,k+.5)}
  enemies.forEach(e=>{if(e.dead||!e.dun)return;mmX.fillStyle=e.dw?'#c084fc':e.c.al?'#f0abfc':'#f87171';mmX.fillRect(ox+(e.m.position.x-DX0)*k-2,oz+(e.m.position.z-DZ0)*k-2,4,4)});
  miniArrow(w/2,h/2);
}
function dunPrompt(){
  const S=inDun,d=(a,b)=>Math.hypot(pl.position.x-a,pl.position.z-b);
  if(d(S.D.exitP[0],S.D.exitP[1])<2)return {label:'F · Leave dungeon',fn:()=>fadeTo(()=>dunExit(true))};
  if(S.exit2&&d(S.exit2[0],S.exit2[1])<2)return {label:'F · Leave dungeon',fn:()=>fadeTo(()=>dunExit(true))};
  if(S.chest&&!S.chest.open&&d(S.chest.x,S.chest.z)<2)return {label:'F · Open treasure chest',fn:dunChest};
  return null;
}
function dunEntrancePrompt(){for(const D of DUNS){if(Math.hypot(pl.position.x-D.x,pl.position.z-(D.y+.6))<2.4)return {label:'F · Enter '+D.n+' (Lv '+D.lv[0]+'–'+D.lv[1]+')',fn:()=>dunEnter(D)}}return null}
