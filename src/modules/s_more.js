// ================= v41: feeding companions, recall to your rest town, town realm portals, enemy line of sight =================
// ---------- feeding: food heals a companion; better food heals more ----------
const FQ={f_meat:.3,f_fish:.3,f_bread:.3,f_soup:.45,f_skewer:.45,f_tart:.45,f_cake:.45,f_stew:.65,f_pie:.65,f_feast:1};
const fqOf=k=>FQ[k]!=null?FQ[k]:(SUP[k]&&(SUP[k].c=='crop'||SUP[k].c=='ing'))?.1:0;
const fqName=q=>q>=1?'Feast':q>=.6?'Fine':q>=.4?'Good':q>=.25?'Simple':'Raw';
const fqCol=q=>q>=1?'#fbbf24':q>=.6?'#c084fc':q>=.4?'#60a5fa':q>=.25?'#6ee7b7':'#a8a29e';
function feedList(){return Object.keys(SUP).filter(k=>fqOf(k)>0&&cnt(k)>0).sort((a,b)=>fqOf(b)-fqOf(a))}
function feedComp(i,k){
  const c=party[i];if(!c)return;if(c.h<=0)return say(nm(c)+' has fainted. Food can’t wake it; use 💗 Revive.');
  const mx=M(c);if(c.h>=mx)return say(nm(c)+' is already at full health.');
  if(!(cnt(k)>0))return;const q=fqOf(k),heal=Math.max(1,Math.round(mx*q)),got=Math.min(heal,mx-c.h);
  if(SUP[k])sup[k]--;else mats[k]--;c.h+=got;
  const f=fols[i];if(f&&f.visible){burst(gY(f.position,.8),0x6ee7b7,18,1.6,2,.6);dn(f.position,'+'+got,'#6ee7b7',-10)}
  say(SUP[k].i+' '+nm(c)+' gobbles the '+SUP[k].n+' and recovers '+got+' health.');ui();hud();rX();
}
XR.feed=()=>{
  const act=party.slice(0,2);let sel=xwArg|0;if(!act[sel])sel=0;xwArg=sel;
  $('xwT').textContent='🍖 Feed your companions';$('xwS').textContent='Better food heals more · Raw 10% · Simple 30% · Good 45% · Fine 65% · Feast 100% of max health';
  const tabs=act.map((c,i)=>{const p=Math.max(0,100*c.h/M(c));return `<button class="${i==sel?'pri':''}" data-fsel="${i}" style="flex:1;text-align:left">${em(c)} <b>${c.n}</b> Lv${c.l}<span class="meter sm" style="margin-top:3px"><i style="width:${p}%"></i><span>${c.h<=0?'Fainted':Math.round(c.h)+'/'+M(c)}</span></span></button>`}).join('');
  const c=act[sel],L=feedList();
  const rows=L.map(k=>{const q=fqOf(k),h=c?Math.min(Math.round(M(c)*q),Math.max(0,M(c)-c.h)):0,dis=!c||c.h<=0||c.h>=M(c);
    return `<div class="rw" style="--rc:${fqCol(q)}"><span class="rn">${SUP[k].i} <b>${SUP[k].n}</b> <span class="mut">×${cnt(k)}</span><small><b style="color:${fqCol(q)}">${fqName(q)}</b> · heals ${Math.round(q*100)}% of max health</small></span><span class="ra"><button class="pri" data-feed="${k}" ${dis?'disabled':''}>Feed${h?' +'+h:''}</button></span></div>`}).join('')||'<div class="mut" style="padding:8px">You have no food. Cook meals at a Cooking Station in your Realm, or feed raw meat, fish and crops for a small heal.</div>';
  $('xwB').innerHTML=`<div style="display:flex;gap:6px;margin-bottom:8px">${tabs}</div><div class="rows">${rows}</div>`;
  $('xwF').innerHTML='<span class="mut dtl">Feeding works anywhere, even mid-fight. Fainted companions need the 💗 Revive button instead.</span>';
};
$('xw').addEventListener('click',e=>{if(xwMode!='feed')return;const t=e.target.closest('[data-fsel],[data-feed]');if(!t||t.disabled)return;
  if(t.dataset.fsel!=null){xwArg=+t.dataset.fsel;rX()}else feedComp(xwArg|0,t.dataset.feed)});
$('act').addEventListener('pointerdown',e=>{const b=e.target.closest('button[data-fd]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();openX('feed',+b.dataset.fd)},true);
// ---------- recall: back to the last town you rested in ----------
var restTown=TOWNS[0];
function recallTown(){
  const T=restTown||TOWNS[0];if(riding)dismount&&dismount();
  pl.position.set(T.sp[0],0,T.sp[1]);fols.forEach((f,i)=>{if(f)f.position.set(T.sp[0]+(i?1.4:-1.4),0,T.sp[1]+1.6)});snapCam();hud();
  say('🏘️ You recall to '+T.n+'.');
}
// ---------- a realm portal in every town ----------
TOWNS.forEach(T=>{
  const cand=[[-4.2,7.6],[4.6,-7.4],[-7.6,-1.2],[7.6,2.4],[0,-7.8],[-2,7.8]],taken=[T.mp,T.mv,T.tv,T.sp,T.st||[1e9,1e9],[T.cx-7.3,T.cy+2.1]];
  let pos=null;for(const [ox,oz] of cand){const x=T.cx+ox,z=T.cy+oz;let ok=true;
    for(let a=0;a<6.28&&ok;a+=.8)if(tcHit(x+Math.cos(a)*1.4,z+Math.sin(a)*1.4))ok=false;
    if(ok&&taken.some(p=>Math.hypot(p[0]-x,p[1]-z)<3.2))ok=false;if(ok){pos=[x,z];break}}
  if(!pos)pos=[T.cx-4.2,T.cy+7.6];T.rp=pos;
  const g=new THREE.Group(),y=GH(pos[0],pos[1]),st=sm(0x8a8478),dk=sm(0x5a5650);g.position.set(pos[0],y,pos[1]);g.rotation.y=Math.atan2(T.cx-pos[0],T.cy-pos[1]);
  TQ(g,G_BOX,dk,0,.1,0,2.6,.2,1.2);[-1,1].forEach(s=>{TQ(g,G_BOX,st,s*.95,1.25,0,.4,2.5,.5);TQ(g,G_BOX,dk,s*.95,2.55,0,.5,.12,.6)});
  TQ(g,G_BOX,st,0,2.75,0,2.5,.35,.55);const gem=TQ(g,G_OCT,gmat(0xc4a8ff),0,3.1,0,.18,.26,.18);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(.82,32),new THREE.MeshBasicMaterial({color:0x8a6aff,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));disc.position.set(0,1.25,0);disc.scale.set(1,1.38,1);g.add(disc);
  const sw=new THREE.Mesh(new THREE.TorusGeometry(.62,.05,6,24),gmat(0xd8c8ff));sw.position.set(0,1.25,.02);sw.scale.set(1,1.38,1);g.add(sw);
  sign(g,[{t:'🌀 Your Realm',f:'700 40px'}],1.3,.32,'#3a2a5a','#e8dcff',null,0,3.35,.3,0);
  scene.add(g);T.rpm={g,disc,sw,gem};
});
function realmPortalPrompt(T){if(!T||!T.rp)return null;if(Math.hypot(pl.position.x-T.rp[0],pl.position.z-T.rp[1])<2.4)return {label:'F · Enter your Realm',fn:()=>fadeTo(enterRealm)};return null}
setInterval(()=>{const t=performance.now()/1000;TOWNS.forEach(T=>{const r=T.rpm;if(!r||!r.g.visible)return;r.sw.rotation.z=t*1.6;r.disc.material.opacity=.45+.12*Math.sin(t*2.4);r.gem.rotation.y=t})},50);
// ---------- enemies only notice what they can see ----------
function sightBlk(x,z){
  if(inDun)return dunSolid(x,z);if(inRealm)return false;
  const rx=Math.round(x),rz=Math.round(z),t=MAP[rz]&&MAP[rz][rx];
  return t=='W'||t=='B'||t=='R'||t=='r'||!!(campBlk&&campBlk.has(rz*W+rx))||tcHit(x,z);
}
function canSee(a,b){const dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz),n=Math.ceil(L/.45);for(let i=1;i<n;i++){if(sightBlk(a.x+dx*i/n,a.z+dz*i/n))return false}return true}
