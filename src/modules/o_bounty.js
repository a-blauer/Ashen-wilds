// ================= v36: Bounty boards — every town's notice board hands out hunts, supply runs and challenges =================
let bounties=[];const bOffers={};let bSeq=1;
const zoneFoes=T=>{const L=[];BIOMES.forEach(b=>{if(b.t==T)(BIOEN[b.n]||[]).forEach(k=>{if(!L.includes(k))L.push(k)})});return L.length?L:['hobgoblin']};
const BSUP=[[['wood',20],['stone',20],['fiber',15],['meat',6],['wheat',8],['carrot',8]],[['iron',10],['clay',15],['petals',15],['berries',10],['pepper',6]],[['crystal',10],['bone',15],['glowcap',12],['pumpkin',4],['fish',8]],[['iron',20],['crystal',15],['emberroot',6],['frostcap',6]],[['crystal',25],['bone',25],['starbloom',3],['frostcap',10]]];
function bReward(T,k){const lv=TIERS[T-1][1];return {g:Math.round((40+lv*14)*k),xp:Math.round(needH(Math.max(1,lv-3))*.18*k),up:k>=1.5?R(1,2):Math.random()<.5?1:0}}
function bGen(T){
  const t=Math.random(),L=zoneFoes(T),B=[];
  B.push((()=>{const key=L[R(0,L.length-1)],n=R(8,14);return {ty:'hunt',key,n,T,d:'Hunt '+n+' '+EN[key].n+(n>1?'s':''),i:EN[key].e,rw:bReward(T,n/10)}})());
  const sp=BSUP[T-1][R(0,BSUP[T-1].length-1)];B.push({ty:'sup',key:sp[0],n:sp[1],T,d:'Deliver '+sp[1]+' '+supNm(sp[0]),i:supIco(sp[0]),rw:bReward(T,.8)});
  const roll=Math.random();
  if(roll<.4){const n=R(1,2);B.push({ty:'elite',n,T,d:'Slay '+n+' elite monster'+(n>1?'s':'')+' in '+ZN[T-1],i:'💀',rw:bReward(T,1.6)})}
  else if(roll<.7){const D=DUNS[T-1];B[2]={ty:'dun',n:1,T,d:'Clear '+D.n,i:'⛏',rw:bReward(T,2)};B.length=3}
  else{const bi=2*(T-1)+R(0,1);B[2]={ty:'boss',bi,n:1,T,d:'Defeat '+BOSSES[bi].name,i:BOSSES[bi].i,rw:bReward(T,3)};B.length=3}
  return B.slice(0,3).map(b=>Object.assign(b,{id:bSeq++,c:0}));
}
function bOffersFor(ti){const o=bOffers[ti];if(!o||Date.now()-o.t>15*60000||!o.list.length)bOffers[ti]={t:Date.now(),list:bGen(ti+1)};return bOffers[ti].list}
const bDone=b=>b.ty=='sup'?cnt(b.key)>=b.n:b.c>=b.n;
const bProg=b=>b.ty=='sup'?Math.min(cnt(b.key),b.n)+'/'+b.n:b.c+'/'+b.n;
function bountyOnKill(e){if(!bounties.length||!e||!e.c)return;const zt=e.c.zt||tierOfLv(e.c.l);let ch=false;
  bounties.forEach(b=>{if(b.c>=b.n)return;if(b.ty=='hunt'&&e.c.en==b.key){b.c++;ch=true}else if(b.ty=='elite'&&e.c.al&&!e.dun&&zt==b.T){b.c++;ch=true}else if(b.ty=='boss'&&e.ar===b.bi){b.c++;ch=true}
    if(ch&&b.c>=b.n)say('📜 Bounty complete: '+b.d+'. Turn it in at any bounty board.')});if(ch)bTrack()}
function bountyOnDungeon(T){bounties.forEach(b=>{if(b.ty=='dun'&&b.T==T&&b.c<b.n){b.c++;say('📜 Bounty complete: '+b.d+'. Turn it in at any bounty board.')}});bTrack()}
function bTurnIn(b){
  if(!bDone(b))return;if(b.ty=='sup'){if(SUP[b.key])sup[b.key]-=b.n;else mats[b.key]-=b.n}
  const r=b.rw;gold+=r.g;if(hero.lvl<MAXLV){hero.xp+=r.xp;while(hero.lvl<MAXLV&&hero.xp>=needH(hero.lvl)){hero.xp-=needH(hero.lvl);heroLevelUp()}}
  if(r.up)mats[UPM[b.T-1][0]]=(mats[UPM[b.T-1][0]]||0)+r.up;
  if(Math.random()<.2){const eg=rollEgg(b.T);eggs.push(eg);say('🥚 The board keeper adds a '+eg.sp+' egg to your reward!')}
  bounties=bounties.filter(x=>x!==b);pickup({ic:'📜',t:'Bounty complete',col:'#fbbf24',sub:'+'+r.g+' gold · +'+r.xp+' XP'+(r.up?' · +'+r.up+' '+UPM[b.T-1][0]:''),r:2});bTrack();hud();
}
const rwTxt=r=>`🪙 ${r.g} · ✨ ${r.xp} XP${r.up?' · '+r.up+'× upgrade material':''}`;
XR.bounty=()=>{
  const ti=xwArg|0,T=TOWNS[ti],offers=bOffersFor(ti);$('xwT').textContent='📜 Bounty Board · '+T.n;$('xwS').textContent=ZN[ti]+' · '+bounties.length+'/3 active · new bounties every 15 minutes';
  const act=bounties.map(b=>`<div class="rw" style="--rc:${bDone(b)?'#6ee7b7':'#c9a24a'}"><span class="rn">${b.i} <b>${b.d}</b> <span class="mut">${ZN[b.T-1]}</span><small>Progress ${bProg(b)} · ${rwTxt(b.rw)}</small></span><span class="ra">${bDone(b)?`<button class="pri" data-bin="${b.id}">Turn in</button>`:''}<button data-bab="${b.id}" title="Abandon">✕</button></span></div>`).join('')||'<div class="mut" style="padding:6px 8px">No active bounties. Pick up to three.</div>';
  const off=offers.map(b=>`<div class="rw"><span class="rn">${b.i} <b>${b.d}</b><small>${rwTxt(b.rw)}${b.ty=='sup'?' · you have '+Math.min(cnt(b.key),999):''}</small></span><span class="ra"><button class="pri" data-bacc="${b.id}" ${bounties.length>=3?'disabled':''}>Accept</button></span></div>`).join('')||'<div class="mut" style="padding:6px 8px">The board is empty. Check back soon.</div>';
  $('xwB').innerHTML=`<div class="sec">Your bounties</div><div class="rows">${act}</div><div class="sec">Posted here</div><div class="rows">${off}</div>`;
  $('xwF').innerHTML='<span class="mut dtl">Hunts and challenges count from the moment you accept. Supply bounties take the items when you turn them in. Any board accepts turn-ins.</span>';
};
$('xw').addEventListener('click',e=>{if(xwMode!='bounty')return;const t=e.target.closest('[data-bacc],[data-bin],[data-bab]');if(!t||t.disabled)return;const ds=t.dataset,ti=xwArg|0;
  if(ds.bacc){const L=bOffersFor(ti),b=L.find(x=>x.id==+ds.bacc);if(b&&bounties.length<3){bounties.push(b);bOffers[ti].list=L.filter(x=>x!==b);say('📜 Accepted: '+b.d+'.')}}
  else if(ds.bin){const b=bounties.find(x=>x.id==+ds.bin);if(b)bTurnIn(b)}
  else if(ds.bab){bounties=bounties.filter(x=>x.id!=+ds.bab)}
  bTrack();rX()});
// small tracker under the hero panel
{const d=document.createElement('div');d.id='btrk';d.className='glass hide';$('stage').appendChild(d)}
function bTrack(){const d=$('btrk');if(!d)return;d.classList.toggle('hide',!bounties.length);d.innerHTML=bounties.map(b=>`<div class="${bDone(b)?'ok':''}">${b.i} ${b.d} <b>${bDone(b)?'✔':bProg(b)}</b></div>`).join('')}
function boardPrompt(T){if(!T)return null;if(Math.hypot(pl.position.x-(T.cx-10.8),pl.position.z-(T.cy+3.1))<2.4)return {label:'F · Bounty Board',fn:()=>openX('bounty',T.i)};return null}
