// ================= v103 kingdom (2/5): houses and citizens =================
// Houses are built at the Stronghold Steward on any free lot (up to HS103_MAX). Two citizens move into each one.
// A citizen can be told to gather a material that grows in a zone you have completed (its Sovereign defeated):
// every trip takes HS103_TRIP ms and brings back a small load straight into your materials. Trips keep running while
// you are away (up to HS103_CAP of catch-up when the game is opened again).
// In Duskhold you can watch them: a gatherer walks from the house to the south gate with a tool, is away on the road,
// and comes back with a full sack; an idle citizen strolls between the streets and stops for a chat.
// Paths: A* on the town's own collision (solid / tcHit), one cell per tile, smoothed by line of sight.
// Saved in x2Save: khs (houses), kcit (citizens).
var HS103_MAX=6,HS103_TRIP=8*60000,HS103_CAP=4*3600000;
var HS103={h:[],cit:[],g:{},lastCatch:0};
var HS103_NM=['Ashcroft','Elmhollow','Bracken','Mossgate','Thornbury','Wrenfield','Cinderleigh','Stonemere','Rookwood','Fallowmere'];
var HS103_CN=['Mara','Tomas','Edda','Gorm','Ilse','Bram','Wenna','Osric','Hild','Corin','Ysolde','Aldo','Sabine','Fenn','Greta','Lorcan','Nell','Piet','Runa','Haldor'];
var HS103_LOAD={wood:2,stone:2,fiber:2,petals:2,glowcap:2,bone:2,clay:2,iron:1,crystal:1};
function hsCost103(n){return {g:300+200*n,m:[['wood',15+8*n],['stone',12+6*n]]}}
// ---------- which materials each zone gives (from its own nodes) ----------
var ZMAT103=null;
function zMat103(){if(ZMAT103)return ZMAT103;const Z=PMAP.map(()=>new Set());
  const kind={rock:'stone',grave:'stone',pillar:'stone',crystal:'crystal',bush:'fiber',flower:'petals',mush:'glowcap',bones:'bone'};
  MAP.props.forEach(q=>{const r=regionAt(q[0],q[1]);if(r<0)return;const m=kind[q[2]];if(m){Z[r].add(m);if(m=='stone')Z[r].add('iron')}});
  PMAP.forEach((p0,i)=>{let tr=0,wt=0;for(const p of p0.ins)for(let y=p.y0;y<p.y0+p.h&&!(tr&&wt);y+=2)for(let x=p.x0;x<p.x0+p.w;x+=2){const t=MAP[y][x];if(t=='#')tr=1;else if(t=='~'&&!BIOMES[MAP.bio[y][x]].lava)wt=1}
    if(tr)Z[i].add('wood');if(wt)Z[i].add('clay')});
  ZMAT103=Z;return Z}
// materials a citizen may gather now: [key, [zone names]]
function hsMats103(){const Z=zMat103(),o={};[...bossDone].forEach(i=>{if(!Z[i])return;Z[i].forEach(m=>{(o[m]=o[m]||[]).push(PMAP[i].n)})});
  return Object.keys(RES).filter(k=>o[k]).map(k=>[k,o[k]])}
// ---------- houses ----------
function hsKit103(k,v){const st=['plaster','stone','log'][v],wc=[0xd8ccb0,0x7a746a,0x6a4a30][v],o={w:4.4,d:3.8,h:2.3,zc:-1.4,st,wc};TWN100_body(k,o);
  const roof=[TWC.thatch,0x45403e,0x6a4a32][v];
  if(v==2){// a timber upper floor jettied over the logs
    k.at(0,0,-1.4,()=>{const U=2.35,V=2.05;k.as('wood',()=>k.p('c',TWC.woodD,'box',0,2.36,0,U*2+.1,.1,V*2+.1,0,0,0,.02));
      twPlanks(k,0x7a5a3a,-U,V,U,V,2.4,3.6,.24);twPlanks(k,0x7a5a3a,-U,-V,U,-V,2.4,3.6,.24);twPlanks(k,0x7a5a3a,-U,-V,-U,V,2.4,3.6,.24);twPlanks(k,0x7a5a3a,U,-V,U,V,2.4,3.6,.24);
      twWindow(k,-1.1,3.0,V+.04,.5,.5,0,0xffd27a);twWindow(k,1.1,3.0,V+.04,.5,.5,0,0xffd27a);twGable(k,roof,4.8,4.2,1.4,.32,3.6)})}
  else TWN100_roof(k,o,roof,v?1.5:1.8,v?'z':'x',v?0x2e2a2a:0);
  TWN100_chim(k,v==1?-1.2:1.4,-2.6,1.2,v==2?4.6:4.0,v==1?TWC.stoneD:0x7a6a5a);
  twDoor(k,-.9,.36,.52,.95,1.65,0);twWindow(k,1.0,1.35,.54,.8,.6,0,0xffd27a);
  // flower box under the window, a bench by the door, a lantern, a little vegetable patch with a low fence, firewood
  k.as('wood',()=>k.p('c',0x5a3c24,'box',1.0,.95,.68,.9,.16,.2,0,0,0,.02));[0,1,2,3].forEach(i=>k.p('c',[0xc83a5a,0xe8c84a,0xb070ff,0xe8e0d0][(i+v)%4],'sph',.7+i*.2,1.08,.68,.08,.07,.08,0,i,0,.04));
  k.as('board',()=>k.p('c',0x6a4a2e,'box',.2,.45,.85,.9,.07,.3,0,0,0,.05));[-.2,.6].forEach(x=>k.as('wood',()=>k.L('c',TWC.woodD,[x,0,.85],[x,.42,.85],.05,'box')));
  TWN100_lantern(k,-.25,1.85,.7);
  k.as('dirt',()=>k.p('c',0x4a3a28,'box',1.35,.04,2.15,1.6,.08,1.0,0,0,0,.02));
  for(let i=0;i<6;i++)k.p('c',[0x4a7a3a,0x5a8a44,0x3e6a34][i%3],'ico',.85+(i%3)*.5,.18,1.85+(i>2?.55:0),.16,.14,.16,0,i,0,.08);
  const fp=[[.45,1.55],[2.25,1.55],[2.25,2.75],[.45,2.75]];for(let i=0;i<4;i++){const a=fp[i],b=fp[(i+1)%4];if(i==3)continue;k.as('bark',()=>{k.L('c',TWC.woodD,[a[0],0,a[1]],[a[0],.55,a[1]],.04,'log')});k.as('wood',()=>k.L('c',TWC.wood,[a[0],.4,a[1]],[b[0],.4,b[1]],.03,'cyl6'))}
  for(let i=0;i<6;i++)k.as('bark',()=>k.L('c',[0x5a3a22,0x6a4a2a][i%2],[-2.0,.1+Math.floor(i/3)*.19,.95+(i%3)*.2],[-1.2,.1+Math.floor(i/3)*.19,.95+(i%3)*.2],.09,'log'))}
var FP103H=[-2.5,2.5,-3.5,.9];
function hsBuild103(i){const h=HS103.h[i],l=lotOf103('h:'+i);if(!h||!l)return;const T=TOWNS[0],key='HOUSE103|'+h.v;let k=null;if(!twHas(key)){k=twKit(1031+h.v*13);hsKit103(k,h.v)}
  const g=twGroup(k,key),[x,z]=lotW103(l,0,0);g.position.set(x,T.ph,z);g.rotation.y=l.ry;g.name='house_'+i;
  sign(g,[{t:h.nm,f:'700 46px'},{t:'🏠 home of '+hsWho103(i),f:'600 24px'}],1.9,.46,'#2a1c12','#f4e2c0','#c9a24a',1.0,2.05,.6,0,512,128);scene.add(g);
  const c=[];const box=(lx,lz,hx,hz)=>{const [X,Z]=lotW103(l,lx,lz),s=Math.abs(Math.sin(l.ry))>.5;c.push(s?{x:X,z:Z,hx:hz,hz:hx}:{x:X,z:Z,hx,hz})};
  box(1.35,2.15,.85,.6);box(-1.6,1.15,.45,.35);c.forEach(q=>T.col.push(q));
  HS103.g[i]={g,c,lot:l.id,ry:l.ry};lotMark103('h:'+i,lotTiles103(l,...FP103H));lotEject103(l)}
function hsDrop103(i){const o=HS103.g[i],T=TOWNS[0];if(!o)return;scene.remove(o.g);o.c.forEach(q=>{const j=T.col.indexOf(q);if(j>=0)T.col.splice(j,1)});lotMark103('h:'+i,[]);delete HS103.g[i]}
function hsWho103(i){const L=HS103.cit.filter(c=>c.h===i).map(c=>c.n);return L.length?L.join(' & '):'nobody yet'}
function hs103Sync(){if(typeof HS103=="undefined"||!HS103)return;HS103.h.forEach((h,i)=>{const l=lotOf103('h:'+i),o=HS103.g[i];if(o&&(!l||o.lot!==l.id||o.ry!==l.ry||o.who!==hsWho103(i)))hsDrop103(i);if(l&&!HS103.g[i]){hsBuild103(i);HS103.g[i].who=hsWho103(i)}});
  for(const i in HS103.g)if(!HS103.h[+i])hsDrop103(+i);CZ103.ver=-1}
function hsCan103(){const n=HS103.h.length,c=hsCost103(n);if(n>=HS103_MAX)return [false,'Every house is built'];if(gold<c.g)return [false,'Not enough gold'];if(!shHas(c.m))return [false,'Not enough materials'];return [true,'']}
// build a house on lot id: pay, raise it, two citizens move in
function hsBuy103(id){const ok=hsCan103();if(!ok[0]){say(ok[1]+'.');return false}if(!lotFree103(id))return false;const n=HS103.h.length,c=hsCost103(n);shPay(c.g,c.m);
  const used=new Set(HS103.h.map(h=>h.nm)),nm=(HS103_NM.find(q=>!used.has(q+' House'))||'New')+' House';HS103.h.push({nm,v:n%3});SH.pos['h:'+n]=id;
  const taken=new Set(HS103.cit.map(c=>c.n)),pool=HS103_CN.filter(q=>!taken.has(q));for(let j=0;j<2;j++){const k=pool.splice(Math.floor(Math.random()*pool.length),1)[0]||('Citizen '+(HS103.cit.length+1));
    HS103.cit.push({n:k,h:n,task:'',t0:0,lk:Math.floor(Math.random()*1e6)})}
  lotSync103();const who=hsWho103(n);banner('🏠 '+nm.toUpperCase(),who+' move in','Give them work at the Stronghold Steward');sfx('power');hud();ui();try{saveGame(true)}catch(_){}return true}
// ---------- v104/v105: trades, ranks, food and collecting ----------
// Every citizen starts as a gatherer; the Steward trains them for gold into an egg collector, fisherman or hunter.
// v105: a trade has a rank (1..5): a citizen only works zones of that tier or lower (Kindlelight 1 … The Citadel 5);
// each rank above 1 is bought at the Steward. Every trip costs food rations when it starts (raw food and crops 1 ration
// each, cooked meals 3; rations = the zone's tier, gatherers 1); with no food the citizen waits at home.
// When a trip ends the citizen comes home and waits outside the house with a sign over the head: walk up and press F
// to take the goods. Only then does the next trip start (no more trips piling up while you are away).
//   gather  materials of a completed zone, 8 min per trip      task = material key
//   egg     one egg of a chosen species of a completed zone   task = 'zone:Species'   (10 min)
//   fish    3 fish of a completed zone with water            task = 'zone'           (10 min)
//   hunt    4 kills of a completed zone: gold, monster parts, now and then gear (never eggs)  task = 'zone'  (10 min)
var CZR104={gather:{n:'Gatherer',i:'🧺',g:0,up:300,trip:HS103_TRIP,d:'Gathers materials'},egg:{n:'Egg Collector',i:'🥚',g:800,up:600,trip:10*60000,d:'Brings back one egg of a chosen kind'},
  fish:{n:'Fisherman',i:'🎣',g:500,up:400,trip:10*60000,d:'Fishes a zone and brings back the catch'},hunt:{n:'Hunter',i:'🏹',g:1000,up:700,trip:10*60000,d:'Hunts a zone and brings back the spoils'}};
var CZ104_EGGMAX=40,CZ105_RMAX=5;
function czRole104(c){return CZR104[c.r]?c.r:'gather'}
function czRank105(c){return Math.max(1,Math.min(CZ105_RMAX,c.rk|0||1))}
function czUpCost105(c){const r=czRank105(c);return r>=CZ105_RMAX?0:CZR104[czRole104(c)].up*r}
function czTrip104(c){return CZR104[czRole104(c)].trip}
// the companion kinds whose eggs can be found in zone i: the families of its monsters at the zone's tier, plus its own creature
function zEggs104(i){const p=PMAP[i];if(!p)return [];const S=new Set();(BIOEN[p.n]||[]).forEach(k=>{const f=EN[k]&&EN[k].fam,sp=f&&famTier(f,p.t);if(sp)S.add(sp)});const b=BIOMES[p.bi];if(b&&b.sp&&SP2[b.sp])S.add(b.sp);return [...S]}
function zWater104(i){return zMat103()[i]&&zMat103()[i].has('clay')}
function czZones104(){return [...bossDone].filter(i=>PMAP[i]).sort((a,b)=>a-b)}
// the zone a task works in (gatherers: the lowest-tier completed zone in reach that has the material)
function czZone105(c,v){v=v==null?c.task:v;if(!v)return -1;const r=czRole104(c);if(r=='egg')return +v.split(':')[0];if(r!='gather')return +v;
  const Z=zMat103(),rk=czRank105(c);let best=-1;czZones104().forEach(i=>{if(Z[i]&&Z[i].has(v)&&PMAP[i].t<=rk&&(best<0||PMAP[i].t<PMAP[best].t))best=i});
  if(best<0)czZones104().forEach(i=>{if(Z[i]&&Z[i].has(v)&&(best<0||PMAP[i].t<PMAP[best].t))best=i});return best}
function czTier105(c,v){const i=czZone105(c,v);return i>=0&&PMAP[i]?PMAP[i].t:1}
// [value, label, allowed] for every task of this trade (allowed: the citizen's rank reaches the zone's tier)
function czOpts104(c){const r=czRole104(c),Z=czZones104(),rk=czRank105(c),lk=t=>t>rk?' · needs rank '+t:'';
  if(r=='gather')return hsMats103().map(([k,z])=>{const t=czTier105(c,k);return [k,matInfo(k)[1]+' Gather '+matInfo(k)[0]+' ('+z.join(', ')+')'+lk(t),t<=rk]});
  if(r=='egg'){const o=[];Z.forEach(i=>zEggs104(i).forEach(sp=>o.push([i+':'+sp,'🥚 '+sp+' egg · Tier '+SP2[sp][1]+' ('+PMAP[i].n+')'+lk(PMAP[i].t),PMAP[i].t<=rk])));return o}
  if(r=='fish')return Z.filter(zWater104).map(i=>[String(i),'🎣 Fish the waters of '+PMAP[i].n+lk(PMAP[i].t),PMAP[i].t<=rk]);
  return Z.map(i=>[String(i),'🏹 Hunt in '+PMAP[i].n+' (Lv '+czHLv104(i)+')'+lk(PMAP[i].t),PMAP[i].t<=rk])}
function czOk104(c,v){return !v||czOpts104(c).some(q=>q[0]===v&&q[2])}
function czTaskTxt104(c){const r=czRole104(c),v=c.task;if(!v)return '';
  if(r=='gather')return 'Gathering '+matInfo(v)[1]+' '+matInfo(v)[0]+' · '+(HS103_LOAD[v]||1)+' per trip';
  if(r=='egg'){const [i,sp]=v.split(':');return 'Collecting '+sp+' eggs in '+(PMAP[+i]||{}).n}
  if(r=='fish')return 'Fishing in '+(PMAP[+v]||{}).n;return 'Hunting in '+(PMAP[+v]||{}).n}
function czHLv104(i){return Math.max(1,((BOSSES[i]||{}).lvl||9)-3)}
// ---------- food ----------
function czFoodV105(k){const S=SUP[k];return !S?0:S.c=='food'?3:(S.c=='ing'||S.c=='crop')?1:0}
function czFood105(){let n=0;for(const k in sup){const v=czFoodV105(k);if(v&&sup[k]>0)n+=v*sup[k]}return n}
function czCost105(c){return czRole104(c)=='gather'?1:czTier105(c)}
// take n rations from the bag: raw food first, cooked meals last; false when there is not enough
function czEat105(n){if(czFood105()<n)return false;const K=Object.keys(sup).filter(k=>czFoodV105(k)&&sup[k]>0).sort((a,b)=>czFoodV105(a)-czFoodV105(b));
  for(const k of K){while(n>0&&sup[k]>0){sup[k]--;n-=czFoodV105(k)}if(n<=0)break}return true}
// ---------- tasks, ranks, trades ----------
function czTask103(c,m){if(m&&!czOk104(c,m))return;if(c.bag)return say('🎁 '+c.n+' is waiting with goods at home: collect them first.');c.task=m||'';c.t0=0;c.wf=0;c.vt=null;try{czTick103()}catch(_){}try{saveGame(true)}catch(_){}}
function czLeft103(c){return c.task&&c.t0?Math.max(0,czTrip104(c)-(Date.now()-c.t0)):0}
function czTrain104(c,r){if(!CZR104[r]||czRole104(c)===r)return false;if(c.t0||c.bag){say('🧑 '+c.n+' is busy: wait until the trip is over and the goods are collected.');return false}
  const R=CZR104[r];if(gold<R.g){say('Training a '+R.n.toLowerCase()+' costs 🪙 '+R.g+'.');return false}
  gold-=R.g;c.r=r;c.rk=1;c.task='';c.t0=0;c.wf=0;c.vt=null;czClear103();say(R.i+' '+c.n+' is now '+(r=='egg'?'an':'a')+' '+R.n.toLowerCase()+' (rank 1).');sfx('power');hud();try{saveGame(true)}catch(_){}return true}
function czRankUp105(c){const g=czUpCost105(c);if(!g)return false;if(gold<g){say('Rank '+(czRank105(c)+1)+' costs 🪙 '+g+'.');return false}gold-=g;c.rk=czRank105(c)+1;
  say(CZR104[czRole104(c)].i+' '+c.n+' reaches rank '+c.rk+' and can now work Tier '+c.rk+' zones.');sfx('power');hud();try{saveGame(true)}catch(_){}return true}
// ---------- one trip's goods (computed when the trip ends, given when collected) ----------
function czGoods105(c){const r=czRole104(c),v=c.task,G=[];
  if(r=='gather'){G.push({t:'mat',k:v,n:HS103_LOAD[v]||1});return G}
  if(r=='egg'){const sp=v.split(':')[1];if(SP2[sp])G.push({t:'egg',sp});return G}
  const zi=+v,p=PMAP[zi];if(!p)return G;const T=p.t;
  if(r=='fish'){let fsh=0;const caught=[];for(let k=0;k<3;k++){const pool=FISH.filter(f=>f[2]<=T),w=pool.map(f=>[8,3,1,.15][f[3]]*(f[2]==T?1.5:1));let x=Math.random()*w.reduce((a,b)=>a+b,0),f=pool[0];for(let j=0;j<pool.length;j++){x-=w[j];if(x<0){f=pool[j];break}}
      fsh+=f[3]+1;caught.push(f[0])}G.push({t:'sup',k:'fish',n:fsh,log:caught});if(Math.random()<.05)G.push({t:'sup',k:RUNEK[R(0,RUNEK.length-1)],n:1});return G}
  // hunt: four kills of the zone's monsters at its level; the same drop odds as in the field, without eggs
  const L=czHLv104(zi),E=BIOEN[p.n]||[];let g=0;const got={};let meat=0;
  for(let k=0;k<4;k++){const en=EN[E[R(0,E.length-1)]]||{},fam=en.fam||'Beast';g+=Math.max(1,Math.round((3+L*1.4)*(.7+Math.random()*.6)*.65));
    if(Math.random()<.18){const m=FAMD[fam].mat;got[m]=(got[m]||0)+R(1,2)}if(Math.random()<.1){const m=UPM[T-1][0];got[m]=(got[m]||0)+1}
    if(['Beast','Sky','Dragon','Earth'].includes(fam)&&Math.random()<.25)meat++;
    if(Math.random()<.035)G.push({t:'gear',it:genItem(L,{minR:0})})}
  g=Math.round(g*(1+[0,.1,.2,.3][shL('treas')]));G.push({t:'gold',n:g});if(meat)G.push({t:'sup',k:'meat',n:meat});for(const m in got)G.push({t:'mat',k:m,n:got[m]});return G}
function czGoodsTxt105(G){return (G||[]).map(q=>q.t=='mat'?matInfo(q.k)[1]+' '+q.n+' '+matInfo(q.k)[0]:q.t=='sup'?(SUP[q.k]?SUP[q.k].i+' '+q.n+' '+SUP[q.k].n:'🔮 '+q.n+' '+(RUNES[q.k]?RUNES[q.k][0]:q.k)):q.t=='gold'?'🪙 '+q.n:q.t=='egg'?'🥚 '+q.sp+' Egg':q.t=='gear'?icoOf(q.it)+' '+itName(q.it):'').filter(Boolean).join(' · ')}
// hand over a citizen's goods
function czCollect105(c){const G=c.bag;if(!G)return '';G.forEach(q=>{if(q.t=='mat')mats[q.k]=(mats[q.k]||0)+q.n;else if(q.t=='sup'){giveS(q.k,q.n);(q.log||[]).forEach(f=>fishLog[f]=(fishLog[f]||0)+1)}
    else if(q.t=='gold')gold+=q.n;else if(q.t=='egg'){const eg=mkEgg(q.sp,SP2[q.sp][1]-1,.95+Math.random()*.15);eggs.push(eg);try{dex.egg.add(q.sp)}catch(_){}}else if(q.t=='gear')gear.push(q.it)});
  const txt=czGoodsTxt105(G);c.bag=null;c.vt=null;return txt}
function czCollectHouse105(i){const L=HS103.cit.filter(c=>c.h===i&&c.bag);if(!L.length)return;const parts=L.map(c=>c.n+': '+czCollect105(c));
  pickup({ic:'🎁',t:'Goods from '+L.map(c=>c.n).join(' & '),col:'#f0cc72',sub:parts.join(' — ').slice(0,160),r:2});say('🏘️ '+parts.join(' — '));sfx('chime');hsDirty&&hsDirty();hud();ui();try{czTick103()}catch(_){}try{saveGame(true)}catch(_){}}
function czTick103(){const now=Date.now();let back=[];
  HS103.cit.forEach(c=>{if(!c.task||c.bag)return;if(!c.t0){if(!czOk104(c,c.task)){c.task='';c.wf=0;return}
      if(czRole104(c)=='egg'&&eggs.length>=CZ104_EGGMAX){c.wf=2;return}
      if(czEat105(czCost105(c))){c.t0=now;c.wf=0;c.vt=null}else c.wf=1;return}
    if(now-c.t0>=czTrip104(c)){c.bag=czGoods105(c);c.t0=0;c.vt=null;back.push(c)}});
  if(back.length){say('🏘️ '+back.map(c=>c.n).join(', ')+(back.length>1?' are':' is')+' back home with goods — collect them at the house (F).');sfx&&sfx('chime')}
  try{if(back.length&&typeof xwMode!='undefined'&&xwMode=='hold'&&!$('xw').classList.contains('hide'))rX()}catch(_){}}
setInterval(()=>{try{czTick103()}catch(e){console.warn('v103 citizens',e)}},1000);
// ---------- saves ----------
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};o.khs=HS103.h.map(h=>({nm:h.nm,v:h.v}));o.kcit=HS103.cit.map(c=>({n:c.n,h:c.h,r:czRole104(c),rk:czRank105(c),task:c.task,t0:c.t0,lk:c.lk,bag:c.bag||null}));return o}}
{const f=x2Load;x2Load=function(s){for(const i in HS103.g)hsDrop103(+i);HS103.h=[];HS103.cit=[];czClear103();
  if(s&&Array.isArray(s.khs))s.khs.slice(0,HS103_MAX).forEach(h=>{if(h&&typeof h.nm=='string')HS103.h.push({nm:h.nm.slice(0,40),v:Math.max(0,Math.min(2,h.v|0))})});
  if(s&&Array.isArray(s.kcit))s.kcit.forEach(c=>{if(c&&typeof c.n=='string'&&HS103.h[c.h|0]&&HS103.cit.length<HS103_MAX*2)HS103.cit.push({n:c.n.slice(0,24),h:c.h|0,r:CZR104[c.r]?c.r:'gather',rk:Math.max(1,Math.min(5,c.rk|0||1)),task:typeof c.task=='string'?c.task.slice(0,40):'',t0:+c.t0||0,lk:c.lk|0,bag:Array.isArray(c.bag)?c.bag.slice(0,12):null})});
  return f.apply(this,arguments)}}
// a house is solid and lot-bound: the lot table must know it is built
// (lotBuilt103 reads HS103.h; lotAuto103 drops any 'h:' key whose house is gone)

// ---------- walking the streets: grid A* on the town's collision ----------
var CZ103={ver:-1,grid:null,x0:-37,z0:-22,nx:75,nz:84,cols:0,live:[],on:false,last:0};
function czWalk103(X,Z){return !solid(X,Z)&&!tcHit(X,Z)}
function czGrid103(){const T=TOWNS[0],sig=KL103.ver+'|'+T.col.length;if(CZ103.grid&&CZ103.ver===sig)return CZ103.grid;const G=new Uint8Array(CZ103.nx*CZ103.nz);
  for(let j=0;j<CZ103.nz;j++)for(let i=0;i<CZ103.nx;i++){const X=T.cx+CZ103.x0+i,Z=T.cy+CZ103.z0+j;G[j*CZ103.nx+i]=czWalk103(X,Z)?1:0}
  CZ103.grid=G;CZ103.ver=sig;CZ103.live.forEach(c=>c.path=null);return G}
function czNear103(G,i,j){const nx=CZ103.nx,nz=CZ103.nz;for(let r=0;r<5;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){const a=i+di,b=j+dj;if(a>=0&&b>=0&&a<nx&&b<nz&&G[b*nx+a])return [a,b]}return null}
// line of sight on the cached grid (a few samples across the body width)
function czG103(x,z){const T=TOWNS[0],G=CZ103.grid,i=Math.round(x-T.cx-CZ103.x0),j=Math.round(z-T.cy-CZ103.z0);return i>=0&&j>=0&&i<CZ103.nx&&j<CZ103.nz&&G[j*CZ103.nx+i]===1}
function czLos103(a,b){const d=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(d/.3);for(let k=1;k<n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(!czG103(x,z)||!czG103(x+.3,z)||!czG103(x-.3,z)||!czG103(x,z+.3)||!czG103(x,z-.3))return false}return true}
// world points → smoothed world path (null when there is none)
function czPath103(ax,az,bx,bz){const T=TOWNS[0],G=czGrid103(),nx=CZ103.nx,nz=CZ103.nz,toI=(x,z)=>[Math.round(x-T.cx-CZ103.x0),Math.round(z-T.cy-CZ103.z0)];
  let s=toI(ax,az),e=toI(bx,bz);if(s[0]<0||s[1]<0||s[0]>=nx||s[1]>=nz||e[0]<0||e[1]<0||e[0]>=nx||e[1]>=nz)return null;s=czNear103(G,s[0],s[1]);e=czNear103(G,e[0],e[1]);if(!s||!e)return null;
  const N=nx*nz,gS=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),cl=new Uint8Array(N),H=[],si=s[1]*nx+s[0],ei=e[1]*nx+e[0];
  const h=k=>{const dx=Math.abs(k%nx-e[0]),dz=Math.abs(((k/nx)|0)-e[1]);return Math.max(dx,dz)+.414*Math.min(dx,dz)};
  const push=(k,f)=>{H.push([f,k]);let i=H.length-1;while(i>0){const p=(i-1)>>1;if(H[p][0]<=H[i][0])break;[H[p],H[i]]=[H[i],H[p]];i=p}};
  const pop=()=>{const t=H[0],l=H.pop();if(H.length){H[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let m=i;if(a<H.length&&H[a][0]<H[m][0])m=a;if(b<H.length&&H[b][0]<H[m][0])m=b;if(m==i)break;[H[m],H[i]]=[H[i],H[m]];i=m}}return t};
  gS[si]=0;push(si,h(si));let it=0;
  while(H.length&&it++<N*2){const [,k]=pop();if(cl[k])continue;cl[k]=1;if(k===ei)break;const i=k%nx,j=(k/nx)|0;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=nz)continue;const q=b*nx+a;if(!G[q]||cl[q])continue;
      if(di&&dj&&(!G[j*nx+a]||!G[b*nx+i]))continue;const g=gS[k]+(di&&dj?1.414:1);if(g<gS[q]){gS[q]=g;from[q]=k;push(q,g+h(q))}}}
  if(from[ei]<0&&ei!==si)return null;const L=[];for(let k=ei;k>=0;k=from[k]){L.push([T.cx+CZ103.x0+k%nx,T.cy+CZ103.z0+((k/nx)|0)]);if(k===si)break}L.reverse();
  L[0]=[ax,az];L.push([bx,bz]);
  const out=[L[0]];let a=0;while(a<L.length-1){let b=Math.min(L.length-1,a+40);while(b>a+1&&!czLos103(L[a],L[b]))b--;out.push(L[b]);a=b}return out}
function czLen103(P){let s=0;for(let i=1;i<P.length;i++)s+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return s}
function czAt103(P,d){for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=l||i==P.length-1){const t=l?Math.min(1,d/l):1;return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[0]-a[0],b[1]-a[1])]}d-=l}const q=P[P.length-1];return [q[0],q[1],0]}
// ---------- citizen models ----------
var CZ103_ROBE=[0x5a4a3a,0x3a4a5a,0x4a3a2a,0x5a3a3a,0x3a5040,0x6a5a40,0x4a4a52,0x5a4060],CZ103_HAT=['','cap','','','cap',''];
function czLook103(c){const r=n=>(c.lk>>n)&7,ro=czRole104(c);
  if(ro=='egg')return {robe:0xd8ccb0,trim:[0x5a7a3a,0x4a6a3a][r(0)&1],hat:'cap',hatC:0x4a6a3a,apron:1};
  if(ro=='fish')return {robe:[0x2e4a5e,0x34505a][r(0)&1],trim:0xc8b890,hat:'',hatC:0,apron:0};
  if(ro=='hunt')return {robe:[0x3a3a22,0x33301e][r(0)&1],trim:0x6a4a2a,hat:'cap',hatC:0x2a2a1a,apron:0};
  return {robe:CZ103_ROBE[r(0)],trim:[0x2a1a12,0x8a6a2a,0x3a2a1a,0xc9a24a,0x1a2a3a,0x6a3a2a,0x2a2a30,0x5a4a2a][r(3)],hat:CZ103_HAT[r(6)%6],hatC:[0x3a2a1a,0x5a4a2a,0x2a3a2a,0x4a2a2a][r(9)&3],apron:r(11)<2?1:0}}
function czModel103(c){const o=czLook103(c),rig=idlNpcBody(o),g=new THREE.Group();rig.meshes.forEach(m=>g.add(m));g.bones=rig.bones;g.userData.psNo=1;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:txTex([{t:c.n+(czRole104(c)!='gather'?' · '+CZR104[czRole104(c)].n:''),f:'700 28px'}],320,56,'rgba(10,14,20,.7)','#f4e9c8','rgba(255,214,120,.5)'),transparent:true,depthWrite:false}));
  sp.scale.set(1.3,.23,1);sp.position.set(0,2.0,0);g.add(sp);g.userData.lab=sp;try{czProps104(g,c)}catch(e){console.warn('v104 props',e)}
  // a sack on the back (coming home) and a tool in the hand (going out)
  const sk=new THREE.Mesh(new THREE.IcosahedronGeometry(.15,0),new THREE.MeshLambertMaterial({color:0x8a6a44}));sk.scale.set(1,1.2,.75);sk.position.set(0,.06,-.15);sk.visible=false;
  (g.bones.chest||g).add(sk);g.userData.sack=sk;
  const tl=new THREE.Group(),hd=new THREE.Mesh(new THREE.CylinderGeometry(.02,.022,.62,5),new THREE.MeshLambertMaterial({color:0x5a3a22}));tl.add(hd);
  const bl=new THREE.Mesh(new THREE.BoxGeometry(.05,.12,.2),new THREE.MeshLambertMaterial({color:0x6a6a72}));bl.position.set(0,.27,.08);tl.add(bl);tl.position.set(0,-.05,.05);tl.rotation.x=1.2;tl.visible=false;
  (g.bones.aR2||g).add(tl);g.userData.tool=tl;
  g.userData.rest=czRest103(g);return g}
function czRest103(g){const R={};for(const k in g.bones){const b=g.bones[k];R[k]=[b.rotation.x,b.rotation.y,b.rotation.z,b.position.x,b.position.y,b.position.z]}return R}
function czReset103(g){const R=g.userData.rest;for(const k in R){const b=g.bones[k],r=R[k];b.rotation.set(r[0],r[1],r[2]);b.position.set(r[3],r[4],r[5])}}
// procedural walk on the town-folk skeleton (absolute from the rest pose): legs, knees, ankles, arm swing, a bob
function czWalkPose103(g,ph,amp){const B=g.bones,R=g.userData.rest;czReset103(g);const s=Math.sin(ph),c=Math.cos(ph),a=amp||1;
  const r=(k,x,y,z)=>{const b=B[k];if(!b)return;b.rotation.x+=x||0;b.rotation.y+=y||0;b.rotation.z+=z||0};
  r('lh0',-.42*s*a);r('rh0',.42*s*a);r('lh1',.55*Math.max(0,-c)*a+.08);r('rh1',.55*Math.max(0,c)*a+.08);r('lh2',.2*s*a);r('rh2',-.2*s*a);
  // arms hang (unfolded) and swing against the legs
  r('aL0',.3*s*a,0,.03);r('aR0',-.3*s*a,0,-.03);r('aL1',-.3-.12*Math.max(0,-s)*a,0,-.62);r('aR1',-.3-.12*Math.max(0,s)*a,0,.62);
  r('spine',0,.06*s*a,0);r('chest',.04,-.1*s*a,0);r('head',.02,.05*s*a,0);
  if(B.pelvis)B.pelvis.position.y=R.pelvis[4]+Math.abs(c)*.025*a-.012}
// ---------- citizens in town ----------
function czClear103(){CZ103.live.forEach(o=>scene.remove(o.g));CZ103.live=[];CZ103.on=false}
function czDoor103(c){const l=lotOf103('h:'+c.h);return l?lotDoor103(l):null}
function czGate103(){const T=TOWNS[0],F=typeof kf109=='function'?kf109():null;return [T.cx,T.cy+(F?F.SZ:(T.sz||TS))+3.5]} // v109: the gate moves with the walls
function czSpawn103(){const T=TOWNS[0];czClear103();CZ103.on=true;HS103.cit.forEach((c,i)=>{const d=czDoor103(c);if(!d)return;const g=czModel103(c);g.position.set(d[0],T.ph,d[1]);scene.add(g);
    CZ103.live.push({c,g,i,mode:'',path:null,d:0,wait:1+Math.random()*4,ph:Math.random()*6,ry:0,seed:i*7+3})})}
function czRand103(o){o.seed=(o.seed*16807+11)%2147483647;return o.seed/2147483647}
// a few street spots an idle citizen may stroll to (lot doors and the plaza)
function czSpots103(){const T=TOWNS[0],L=LOT103.map(l=>lotDoor103(l));[[-12,-2],[12,-2],[0,6],[-17,4],[17,4],[-6.8,20],[6.8,27],[-6.8,35],[6.8,42]].forEach(([x,z])=>L.push([T.cx+x,T.cy+z]));
  return typeof kfIn109=='function'?L.filter(([x,z])=>kfIn109(x-T.cx,z-T.cy,1)):L} // v109: only spots inside the walls
function czStep103(o,dt,now){const g=o.g,c=o.c,T=TOWNS[0],door=czDoor103(c);if(!door){g.visible=false;return}
  const sp=1.55,u=g.userData;let walk=false;
  if(c.task&&c.t0){// a trip: out to the gate, away, back home
    if(!o.pOut||o.pv!==CZ103.ver){const gt=czGate103();o.pOut=czPath103(door[0],door[1],gt[0],gt[1]);o.pv=CZ103.ver;o.lOut=o.pOut?czLen103(o.pOut):0}
    const el=(Date.now()-c.t0)/1000,dO=o.lOut/sp,tot=czTrip104(c)/1000;
    if(!o.pOut){g.visible=el<4;g.position.set(door[0],T.ph,door[1]);u.tool.visible=true;u.sack.visible=false}
    else if(el<dO){const p=czAt103(o.pOut,el*sp);g.visible=true;g.position.set(p[0],T.ph,p[1]);o.ry=p[2];walk=true;u.tool.visible=true;u.sack.visible=false;o.mode='out'}
    else if(el>tot-dO){const p=czAt103(o.pOut,Math.max(0,(tot-el)*sp));g.visible=true;g.position.set(p[0],T.ph,p[1]);o.ry=p[2]+Math.PI;walk=true;u.tool.visible=false;u.sack.visible=true;o.mode='back'}
    else{g.visible=false;o.mode='away'}}
  else if(c.bag||(c.task&&c.wf)){// v105: home with goods (or short of food): waits outside the door, facing the street
    const l=lotOf103('h:'+c.h),mates=HS103.cit.filter(q=>q.h===c.h),j=mates.indexOf(c),side=(j%2?1:-1)*.55,[wx,wz]=l?lotW103(l,side,4.0):door;
    u.tool.visible=false;u.sack.visible=!!c.bag;g.visible=true;
    if(Math.hypot(g.position.x-wx,g.position.z-wz)>.4&&o.mode!='walk'){const P=czPath103(g.position.x,g.position.z,wx,wz);if(P&&czLen103(P)>.4){o.path=P;o.len=czLen103(P);o.d=0;o.mode='walk'}else g.position.set(wx,T.ph,wz)}
    if(o.mode=='walk'&&o.path){o.d+=sp*dt;const p=czAt103(o.path,Math.min(o.d,o.len));g.position.set(p[0],T.ph,p[1]);o.ry=p[2];walk=true;if(o.d>=o.len)o.mode='home'}
    else{o.mode='home';o.ry=l?l.ry:o.ry}}
  else{u.tool.visible=false;u.sack.visible=false;g.visible=true;if(o.mode=='home')o.mode='';
    if(o.mode=='walk'&&o.path){o.d+=sp*.8*dt;const L=o.len;const p=czAt103(o.path,Math.min(o.d,L));g.position.set(p[0],T.ph,p[1]);o.ry=p[2];walk=true;if(o.d>=L){o.mode='';o.wait=4+czRand103(o)*9;o.ry+=czRand103(o)*2-1}}
    else{o.wait-=dt;if(o.wait<=0){const S=czSpots103(),home=czRand103(o)<.35,t=home?door:S[Math.floor(czRand103(o)*S.length)];
        if(Math.hypot(t[0]-door[0],t[1]-door[1])<34){const P=czPath103(g.position.x,g.position.z,t[0],t[1]);if(P&&czLen103(P)>.5){o.path=P;o.len=czLen103(P);o.d=0;o.mode='walk'}else o.wait=3}else o.wait=1}}}
  // turn smoothly toward the heading
  let dr=o.ry-g.rotation.y;while(dr>Math.PI)dr-=6.283;while(dr<-Math.PI)dr+=6.283;g.rotation.y+=dr*Math.min(1,dt*8);
  // the sign over the head: goods to collect (bobbing gift) or no food (a grey plate)
  const sg=c.bag?'bag':(c.task&&c.wf==1&&!c.t0)?'food':(c.task&&c.wf==2&&!c.t0)?'full':'';if(u.sgK!==sg){u.sgK=sg;czSign105(g,sg)}
  if(u.sign&&u.sign.visible){u.sign.position.y=2.45+Math.sin(now/260)*.08;u.sign.material.rotation=Math.sin(now/500)*.12}
  if(!g.visible)return;const near=Math.hypot(g.position.x-pl.position.x,g.position.z-pl.position.z);u.lab.visible=near<9;
  if(near>40)return; // too far to bother animating
  if(walk){o.ph+=dt*sp*3.6;czWalkPose103(g,o.ph,1);o.idl=0}
  else{if(!o.idl){czReset103(g);o.idl=1}try{idlNpc(g,now)}catch(_){}}}
{const f=townTick;townTick=function(now,pp){f.apply(this,arguments);try{const inT=townAt(pp.x,pp.z,8)==0;
  if(!inT){if(CZ103.on)czClear103();return}
  if(!CZ103.on||CZ103.live.length!==HS103.cit.filter(c=>lotOf103("h:"+c.h)).length)czSpawn103();
  czGrid103();const dt=Math.min(.1,Math.max(0,(now-(CZ103.last||now))/1000));CZ103.last=now;CZ103.live.forEach(o=>czStep103(o,dt,now))}catch(e){if(!CZ103.err){CZ103.err=1;console.warn('v103 citizens',e)}}}}
// houses have a walk-up prompt at the door: collect goods waiting there, else open the Steward's window on the citizens
{const f=townPortalPrompt;townPortalPrompt=function(T){if(T===TOWNS[0]){const p=pl.position;for(let i=0;i<HS103.h.length;i++){const l=lotOf103('h:'+i);if(!l)continue;const d=lotDoor103(l);
    if(Math.hypot(p.x-d[0],p.z-d[1])<2.6){const W=HS103.cit.filter(c=>c.h===i&&c.bag);if(W.length)return {label:'F · 🎁 Collect from '+W.map(c=>c.n).join(' & '),fn:()=>czCollectHouse105(i)}}
    if(Math.hypot(p.x-d[0],p.z-d[1])<2.2)return {label:'F · '+HS103.h[i].nm+' · '+hsWho103(i),fn:()=>{KM103.focus='cit';KM103.house=i;openX('hold')}}}}return f.apply(this,arguments)}}
var KM103=KM103||{};

// ---------- v104: what each trade carries (on the back = chest bone; a hat on the head bone) ----------
function czProps104(g,c){const r=czRole104(c),B=g.bones,M=col=>new THREE.MeshLambertMaterial({color:col}),add=(p,m,x,y,z,rx,ry,rz)=>{m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);(p||g).add(m);return m};
  const ch=B.chest||g,hd=B.head||g,role=new THREE.Group();ch.add(role);g.userData.role=role;
  if(r=='gather'){// a coil of rope and a hatchet on the belt
    add(role,new THREE.Mesh(new THREE.TorusGeometry(.08,.025,4,8),M(0x9a8458)),.17,-.18,-.08,0,1.3,0);return}
  if(r=='egg'){// a big wicker basket on the back with eggs in it, and a shepherd's crook
    const bk=add(role,new THREE.Mesh(new THREE.CylinderGeometry(.19,.14,.3,8,1,true),new THREE.MeshLambertMaterial({color:0xa8844a,side:THREE.DoubleSide})),0,.02,-.22,-.15);
    [[0,0xe8dcc0],[.08,0xd8a84a],[-.08,0x9ad8c0]].forEach(([x,col],i)=>add(bk,new THREE.Mesh(new THREE.SphereGeometry(.065,6,5),M(col)),x,.13+(i?0:.03),i?.03:-.02).scale.set(1,1.3,1));
    const ck=new THREE.Group();add(ch,ck,.24,-.1,-.15,-.25,0,.12);add(ck,new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1.5,5),M(0x6a4a2a)),0,.2,0);add(ck,new THREE.Mesh(new THREE.TorusGeometry(.09,.018,4,8,Math.PI),M(0x6a4a2a)),-.09,.95,0);role.add(ck);return}
  if(r=='fish'){// a broad straw hat, a rod over the shoulder and a creel at the hip
    add(hd,new THREE.Mesh(new THREE.CylinderGeometry(.25,.27,.025,10),M(0xc8a860)),0,.16,0);add(hd,new THREE.Mesh(new THREE.ConeGeometry(.13,.14,8),M(0xb89850)),0,.23,0);
    const rod=new THREE.Group();add(role,rod,.12,.05,-.12,-.75,0,-.2);add(rod,new THREE.Mesh(new THREE.CylinderGeometry(.008,.016,1.9,4),M(0x7a5a2a)),0,.75,0);
    add(rod,new THREE.Mesh(new THREE.CylinderGeometry(.002,.002,.6,3),M(0xe8e8e8)),.0,1.4,.04,.4);
    add(role,new THREE.Mesh(new THREE.BoxGeometry(.16,.14,.12),M(0x9a7a42)),-.2,-.28,-.05,0,0,.1);return}
  if(r=='hunt'){// a bow and a quiver on the back, a fur mantle on the shoulders
    const bow=add(role,new THREE.Group(),.02,-.02,-.2,0,0,.5);const arc=add(bow,new THREE.Mesh(new THREE.TorusGeometry(.4,.016,4,12,Math.PI*.7),M(0x4a2e18)),-.3,0,0,0,0,-Math.PI*.35);add(bow,new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.72,3),M(0xd8d0b8)),.0,0,0);
    const qv=add(role,new THREE.Mesh(new THREE.CylinderGeometry(.06,.05,.42,6),M(0x5a3a22)),-.1,.05,-.19,0,0,.45);
    for(let i=0;i<3;i++)add(qv,new THREE.Mesh(new THREE.BoxGeometry(.03,.09,.008),M([0xc83a3a,0xe8e0d0,0x3a3a3a][i])),(i-1)*.025,.25,0);
    add(role,new THREE.Mesh(new THREE.TorusGeometry(.15,.07,5,10),M(0x6a5a44)),0,.12,0,Math.PI/2,0,0).scale.set(1.15,1,.8)}}

// ---------- v105: the sign over a citizen's head ----------
var CZ105_SG={};
function czSignTex105(kind,role){const key=kind+'|'+role;if(CZ105_SG[key])return CZ105_SG[key];const cv=document.createElement('canvas');cv.width=cv.height=96;const x=cv.getContext('2d');
  const col=kind=='bag'?'#f0cc72':'#9a9aa4';x.fillStyle='rgba(20,14,8,.85)';x.beginPath();x.arc(48,44,34,0,6.283);x.fill();x.lineWidth=5;x.strokeStyle=col;x.stroke();
  x.beginPath();x.moveTo(40,76);x.lineTo(56,76);x.lineTo(48,90);x.closePath();x.fillStyle=col;x.fill();
  x.font='38px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(kind=='bag'?(CZR104[role]||CZR104.gather).i:kind=='full'?'🥚':'🍽️',48,46);
  if(kind!='bag'){x.strokeStyle='#e85a4a';x.lineWidth=5;x.beginPath();x.moveTo(26,22);x.lineTo(70,66);x.stroke()}
  return CZ105_SG[key]=new THREE.CanvasTexture(cv)}
function czSign105(g,kind){const u=g.userData;if(!kind){if(u.sign)u.sign.visible=false;return}const c=CZ103.live.find(o=>o.g===g);const t=czSignTex105(kind,c?czRole104(c.c):'gather');
  if(!u.sign){u.sign=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));u.sign.scale.set(.62,.62,1);u.sign.position.set(0,2.45,0);g.add(u.sign)}else u.sign.material.map=t;
  u.sign.material.needsUpdate=true;u.sign.visible=true}
