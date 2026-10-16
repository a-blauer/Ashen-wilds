// ================= v41: feeding companions, recall to town, town realm portals, line-of-sight aggro =================
// ---------- feeding ----------
// Cooked food heals more the richer the recipe (more ingredients = better meal). Raw ingredients are small snacks.
const FEEDRAW={meat:.15,fish:.15,berries:.1,carrot:.1,pumpkin:.2,honey:.12,wheat:.06,glowcap:.08};
function feedVal(k){const f=FOOD.find(x=>x[0]==k);if(f){const n=Object.values(f[3]).reduce((s,v)=>s+v,0);return Math.min(1,.2+.1*n)}return FEEDRAW[k]||0}
const feedQ=v=>v>=.95?['Feast','#f0cc72']:v>=.65?['Fine meal','#6ee7b7']:v>=.4?['Meal','#93c5fd']:['Snack','#a8a29e'];
function feedList(){const L=[];FOOD.forEach(f=>{if(cnt(f[0])>0)L.push(f[0])});Object.keys(FEEDRAW).forEach(k=>{if(cnt(k)>0)L.push(k)});return L.sort((a,b)=>feedVal(b)-feedVal(a))}
function feedHTML(c){
  const mx=M(c),L=feedList();
  let h=`<div class="sec">Feed ${c.n}</div>`;
  if(c.h<=0)return h+'<div class="mut dtl">Fainted companions can’t eat. Revive it with 💗 on the companion bar, or rest at a tavern.</div>';
  if(!L.length)return h+'<div class="mut dtl">You have no food. Cook meals at a Cooking Fire in your Realm, or carry meat, fish, berries or vegetables.</div>';
  return h+`<div class="mut dtl" style="margin-bottom:4px">Health ${Math.round(c.h)}/${mx}. Better food heals more.</div><div class="feedL">`+L.slice(0,8).map(k=>{const v=feedVal(k),q=feedQ(v),amt=Math.min(mx-c.h,Math.round(mx*v));
    return `<button data-feed="${k}" ${c.h>=mx?'disabled':''} title="${supNm(k)}: heals ${Math.round(v*100)}% of max health"><span>${supIco(k)}</span><b>${supNm(k)}</b><small style="color:${q[1]}">${q[0]} · +${Math.round(v*100)}%</small><em>×${cnt(k)}</em></button>`}).join('')+'</div>';
}
function feedComp(c,k){
  if(!c||c.h<=0||!(cnt(k)>0))return;const mx=M(c);if(c.h>=mx)return say(nm(c)+' is already at full health.');
  const v=feedVal(k),amt=Math.max(1,Math.min(mx-c.h,Math.round(mx*v)));
  if(SUP[k])sup[k]--;else mats[k]--;c.h=Math.min(mx,c.h+amt);
  const i=party.indexOf(c),f=i>=0&&i<2?fols[i]:null;if(f&&f.visible){burst(gY(f.position,.8),0x6ee7b7,16,1.6,2,.6);dn(f.position,'+'+amt,'#6ee7b7',-10)}
  say(supIco(k)+' '+nm(c)+' happily eats the '+supNm(k)+' (+'+amt+' health).');ui();hud();
}
$('cd').addEventListener('click',e=>{const b=e.target.closest('[data-feed]');if(!b||b.disabled)return;feedComp(party[cmpSel],b.dataset.feed);rC()});
// ---------- recall: back to the last town you rested in ----------
function recallTown(){
  const T=home||TOWNS[0];if(inRealm){inRealm=false;building=false;bheld=false;BGH.visible=false;realmEnv(false);realmHud()}
  pl.position.set(T.sp[0],0,T.sp[1]);snapCam();hud();say('🌀 You recall to '+T.n+'.');
}
// ---------- a realm portal in every town ----------
const TPRT=[];
TOWNS.forEach(T=>{
  const avoid=[T.mp,T.mv,T.tv,T.st,T.sp,[T.cx-10.8,T.cy+3.1]].filter(Boolean);let spot=null;
  for(let r=4;r<12&&!spot;r+=.5)for(let a=0;a<6.283&&!spot;a+=.26){const x=T.sp[0]+Math.cos(a)*r,z=T.sp[1]+Math.sin(a)*r;
    if(Math.abs(x-T.cx)>TS-2||Math.abs(z-T.cy)>TS-2)continue;
    if(avoid.some(p=>Math.hypot(p[0]-x,p[1]-z)<3))continue;
    let ok=true;for(let k=0;k<10&&ok;k++){const b=k/10*6.283,q=k<8?1.7:0;if(tcHit(x+Math.cos(b)*q,z+Math.sin(b)*q)||solid(x+Math.cos(b)*q,z+Math.sin(b)*q))ok=false}
    if(ok)spot=[x,z]}
  if(!spot)spot=[T.sp[0]+3.5,T.sp[1]];
  const [x,z]=spot,g=new THREE.Group(),y=GH(x,z),st=sm(0x8a8478),ry=Math.atan2(T.cx-x,T.cy-z);g.position.set(x,y,z);g.rotation.y=ry;
  TQ(g,G_BOX,st,-1.05,1.3,0,.42,2.6,.42);TQ(g,G_BOX,st,1.05,1.3,0,.42,2.6,.42);TQ(g,G_BOX,st,0,2.75,0,2.7,.35,.5);TQ(g,G_BOX,sm(0x6a6458),0,.08,0,2.9,.16,1.1);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(.95,32),new THREE.MeshBasicMaterial({color:0x9a6aff,transparent:true,opacity:.75,side:THREE.DoubleSide}));disc.position.set(0,1.35,0);disc.scale.y=1.3;g.add(disc);
  const sw=new THREE.Mesh(new THREE.RingGeometry(.3,.92,24,1,0,4),new THREE.MeshBasicMaterial({color:0xd8c8ff,transparent:true,opacity:.5,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));sw.position.set(0,1.35,.02);sw.scale.y=1.3;g.add(sw);
  [-1.05,1.05].forEach(px=>{const gm=TQ(g,G_OCT,gmat(0xb89aff),px,2.75,.3,.14,.18,.08);gm.castShadow=false});
  sign(g,[{t:'🌀 Your Realm',f:'700 40px'}],1.5,.38,'#3a2a5a','#efe6ff',null,0,3.25,.27,0);
  scene.add(g);T.rp=[x,z];TPRT.push({g,disc,sw});
  T.col.push({x:x+Math.cos(ry)*-1.05,z:z-Math.sin(ry)*-1.05,r:.3},{x:x+Math.cos(ry)*1.05,z:z-Math.sin(ry)*1.05,r:.3});
});
function townPortalPrompt(T){if(!T||!T.rp)return null;if(Math.hypot(pl.position.x-T.rp[0],pl.position.z-T.rp[1])<2.3)return {label:'F · Enter your Realm',fn:()=>{if(AF)return;fadeTo(enterRealm)}};return null}
function portalTick(now){for(const p of TPRT){if(Math.hypot(p.g.position.x-pl.position.x,p.g.position.z-pl.position.z)>60)continue;p.sw.rotation.z=now*.002;p.disc.material.opacity=.62+.12*Math.sin(now*.003)}}
// ---------- line of sight: enemies only notice you if nothing solid is in the way ----------
const LOSB={R:1,W:1,B:1,r:1};
function seeTg(a,b){
  if(inRealm||inDun)return true;const dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz),n=Math.ceil(L/.5);
  for(let i=1;i<n;i++){const x=Math.round(a.x+dx*i/n),z=Math.round(a.z+dz*i/n),t=MAP[z]&&MAP[z][x];if(t&&LOSB[t])return false;if(typeof CBLK!='undefined'&&CBLK&&CBLK.has(z*W+x))return false;
    if(tcHit(a.x+dx*i/n,a.z+dz*i/n))return false}
  return true;
}
// ================= v42 =================
// ---------- homing magic bolts ----------
function homeShot(sh,dt){
  sh.age=(sh.age||0)+dt;let e=sh.htg;
  if(!e||e.dead||!enemies.includes(e)){e=null;
    if(tgt&&!tgt.dead&&enemies.includes(tgt)&&d2(tgt.m.position,sh.m.position)<18)e=tgt;
    else{const sp=sh.v.length()||1;let bd=1e9;enemies.forEach(q=>{if(q.dead||sh.hit.has(q))return;const dx=q.m.position.x-sh.m.position.x,dz=q.m.position.z-sh.m.position.z,L=Math.hypot(dx,dz);if(L>14)return;const c=(dx*sh.v.x+dz*sh.v.z)/(L*sp||1);if(c<.35)return;const sc=L*(1.6-c);if(sc<bd){bd=sc;e=q}})}
    sh.htg=e}
  if(!e)return;
  const sp=sh.v.length(),dx=e.m.position.x-sh.m.position.x,dz=e.m.position.z-sh.m.position.z,L=Math.hypot(dx,dz)||1;
  const k=Math.min(1,dt*(7+8*Math.max(0,1-L/6)));sh.v.x+=(dx/L*sp-sh.v.x)*k;sh.v.z+=(dz/L*sp-sh.v.z)*k;sh.v.setLength(sp);
  if(sh.age<1.6)sh.t=Math.max(sh.t,.15);
  sh.m.lookAt(sh.m.position.clone().add(sh.v));
}
// ---------- enemy special-attack build-up ----------
const EBASIC={strike:1,bite:1,throw:1,bolt:1};
function ePick(e,ok){
  e.buN=e.buN||R(2,4);const ready=(e.bu|0)>=e.buN,sp=ok.filter(n=>!EBASIC[n]),bs=ok.filter(n=>EBASIC[n]);
  let pk=null;if(ready&&sp.length)pk=sp[Math.random()*sp.length|0];else if(bs.length)pk=bs[Math.random()*bs.length|0];
  if(!pk)return null;
  if(EBASIC[pk]){e.bu=(e.bu|0)+1;if(e.bu>=e.buN&&e.m)ring(e.m.position,0xffb020,1.1,300)}else{e.bu=0;e.buN=R(2,4)-(e.c.al?1:0)}
  return pk;
}
// ---------- calmer roaming with idle animations ----------
function enemyWander(e,m,dt,now){
  if(e.hx==null){e.hx=m.position.x;e.hz=m.position.z}
  e.wt-=dt;
  if(e.wt<=0){
    if(!e.idle){e.idle=1;e.wt=R(5,11);e.look=m.rotation.y;e.lt=R(.5,1.5)}
    else{e.idle=0;e.wt=R(3,5);const a=Math.random()*6.283,r=R(.8,3);e.wx=e.hx+Math.cos(a)*r;e.wz=e.hz+Math.sin(a)*r}
  }
  if(!e.idle){
    const wx=e.wx-m.position.x,wz=e.wz-m.position.z,wl=Math.hypot(wx,wz);
    if(e.ip){m.pose=null;e.ip=0}
    if(wl>.35)return [wx/wl,wz/wl,.65];e.wt=0;return [0,0,0];
  }
  // idle: look around now and then, with small gestures (sniff, glance up, sway)
  e.lt-=dt;if(e.lt<=0){e.lt=R(1.8,4);e.look=m.rotation.y+R(-1.3,1.3);e.ges=Math.random()<.5?{k:R(0,2),t:0}:null}
  let dr=((e.look-m.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;m.rotation.y+=dr*Math.min(1,dt*1.6);
  if(!e.atk){const g=e.ges,P={rx:0,ry:Math.sin(now/1300+e.hx)*.12,y:0};
    if(g){g.t+=dt;const k=Math.min(1,g.t/1.6),s=Math.sin(k*Math.PI);
      if(g.k==0)P.rx=.32*s*(1+.25*Math.sin(g.t*22));else if(g.k==1)P.rx=-.22*s;else{P.ry+=.45*Math.sin(g.t*5)*s;P.y=.03*s}
      if(k>=1)e.ges=null}
    m.pose=P;e.ip=1}
  return [0,0,0];
}
// ---------- minimap facing arrow ----------
function miniArrow(qx,qy){
  const a=pl.rotation.y,fx=Math.sin(a),fz=Math.cos(a),ca=camYaw,vx=-Math.sin(ca),vz=-Math.cos(ca);
  // camera view cone
  mmX.save();mmX.fillStyle='rgba(255,255,255,.13)';mmX.beginPath();mmX.moveTo(qx,qy);const sp=.55,R2=26,base=Math.atan2(vz,vx);mmX.arc(qx,qy,R2,base-sp,base+sp);mmX.closePath();mmX.fill();
  // facing arrow
  mmX.translate(qx,qy);mmX.rotate(Math.atan2(fz,fx));mmX.fillStyle='#4ade80';mmX.strokeStyle='#0b1a10';mmX.lineWidth=1.5;
  mmX.beginPath();mmX.moveTo(8,0);mmX.lineTo(-5,-5);mmX.lineTo(-2.5,0);mmX.lineTo(-5,5);mmX.closePath();mmX.stroke();mmX.fill();mmX.restore();
}
// ================= v43: sturdier companions =================
// 1) creatures grow faster per level (+80% health, +50% attack/defense)
Object.assign(CBS,{hp:110,pa:14,ma:14,pd:9,md:9});Object.assign(CGS,{hp:30,pa:4.4,ma:4.4,pd:2.8,md:2.8});
// 2) enemies prefer the player; a companion is only targeted when clearly closer, and at most two enemies gang up on one
function eTarget(e,m,dpl){
  const cnts=[0,0];enemies.forEach(o=>{if(o!==e&&!o.dead&&o.agg&&o.tgI!=null&&o.tgI<2)cnts[o.tgI]++});
  // stay on the current companion target while it's alive and nearby (no flip-flopping)
  if(e.tgI!=null){const f=fols[e.tgI],c=party[e.tgI];if(f&&c&&c.h>0&&!c.emp&&f.visible&&m.position.distanceTo(f.position)<6&&cnts[e.tgI]<2)return f;e.tgI=null}
  let tg=pl,bd=dpl-2.5;
  fols.forEach((f,i)=>{const c=party[i];if(i>1||!f||!c||c.h<=0||c.emp||!f.visible||cnts[i]>=2)return;const dd=m.position.distanceTo(f.position);if(dd<bd){bd=dd;tg=f;e.tgI=i}});
  if(tg===pl)e.tgI=null;return tg;
}
// 3) companions recover between fights: 4% of max health per second after 5s without taking damage
function compRegen(dt,now){
  if(dt<=0)return;party.forEach(c=>{if(!c||c.h<=0)return;const mx=M(c);
    if(c._ph!=null&&c.h<c._ph-.01)c._dt=now;
    if(now-(c._dt||0)>5000&&c.h<mx)c.h=Math.min(mx,c.h+mx*.04*dt);
    c._ph=c.h});
}
