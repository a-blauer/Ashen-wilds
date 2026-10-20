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
  if(!L.length)return h+'<div class="mut dtl">You have no food. Cook meals at the Cooking Hearth in Duskhold, or carry meat, fish, berries or vegetables.</div>';
  return h+`<div class="mut dtl" style="margin-bottom:4px">Health ${Math.round(c.h)}/${mx}. Better food heals more.</div><div class="feedL">`+L.slice(0,8).map(k=>{const v=feedVal(k),q=feedQ(v),amt=Math.min(mx-c.h,Math.round(mx*v));
    return `<button data-feed="${k}" ${c.h>=mx?'disabled':''} title="${supNm(k)}: heals ${Math.round(v*100)}% of max health"><span>${supIco(k)}</span><b>${supNm(k)}</b><small style="color:${q[1]}">${q[0]} · +${Math.round(v*100)}%</small><em>×${cnt(k)}</em></button>`}).join('')+'</div>';
}
$('cd').addEventListener('click',e=>{const b=e.target.closest('[data-feed]');if(!b||b.disabled)return;feedComp(party[cmpSel],b.dataset.feed);rC()});
// ---------- a realm portal in every town ----------
const TPRT=[];
TOWNS.forEach(T=>{
  const avoid=[T.mp,T.mv,T.tv,T.st,T.sp,[T.cx-16.2,T.cy+4.65]].filter(Boolean);let spot=null;
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
function portalTick(now){for(const p of TPRT){if(Math.hypot(p.g.position.x-pl.position.x,p.g.position.z-pl.position.z)>60)continue;p.sw.rotation.z=now*.002;p.disc.material.opacity=.62+.12*Math.sin(now*.003)}}
// ---------- line of sight: enemies only notice you if nothing solid is in the way ----------
const LOSB={R:1,W:1,B:1,r:1};
function seeTg(a,b){
  const dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz),n=Math.ceil(L/.5);
  for(let i=1;i<n;i++){const x=Math.round(a.x+dx*i/n),z=Math.round(a.z+dz*i/n),t=MAP[z]&&MAP[z][x];if(t&&LOSB[t])return false;if(typeof CBLK!='undefined'&&CBLK&&CBLK.has(z*W+x))return false;
    if(tcHit(a.x+dx*i/n,a.z+dz*i/n))return false}
  return true;
}
