// ================= v150: in co-op, Duskhold is the host's =================
// Owner: "Duskhold should be a single instance of the host's. Co-op players should be able to put their resources towards
// upgrading the host's kingdom."
// Every player used to walk round their own Duskhold, so partners stood in each other's buildings. Now, playing together,
// everybody's Duskhold is the kingdom host's: the join-code host (the one who made the code), or on the shared artifact
// room the player with the lowest id.
//  · The host's page sends its kingdom (buildings and their lots and turns, upgrade levels, houses and citizens, decorations,
//    shop levels, the kingdom's stage, the harvested outskirts) as ['ks', id, part, parts, text] on the 'ev' topic
//    (r -7: no zone instance), whenever it changes and every DK150.keep seconds.
//  · A guest keeps its own kingdom aside (DK150.stash, still what its saves write) and shows the host's instead: same walls,
//    same buildings, same shops (their levels give their discounts), same citizens. Leaving the game or the host leaving
//    brings the guest's own kingdom back.
//  · Building with the Steward as a guest pays from your own gold and materials, and the build goes to the host's kingdom
//    (['kd', what, key, lot]): a shop, an upgrade, a house, a decoration or a shop level. The host's page builds it without
//    charging the host (the checks against Sovereigns, lots and levels still apply) and everyone gets the new kingdom.
//    Gathering in the outskirts as a guest takes that tree or rock from the host's outskirts too (['kdo', candidate]).
//  · Moving or turning buildings, switching decorations off and on and managing the villagers stay with the host.
//  · A guest's own citizens rest while the host's kingdom is shown (no trips are paid out by the host's citizens).
var DK150={on:false,host:'',stash:null,st:0,last:'',sent:'',sentT:0,peers:'',parts:{},free:0,saveLater:0,keep:15,tick:0,
  KEYS:['sh','shp','kpos','krot','khs','kcit','kdeco','kst','shpu','out148']};
function dk150Host(){try{if(typeof MP=='undefined'||!MP.on||!MPX.be)return '';
    if(typeof KQNET!='undefined'&&KQNET.cur&&KQNET.cur.room===MPX.be){const h=KQNET.cur.host?MP.me:KQNET.pre+kqnClean(KQNET.cur.code);return h===MP.me||MP.rh[h]?h:''}
    let h=MP.me;for(const k in MP.rh)if(MP.rh[k].pr&&k<h)h=k;return h}catch(_){return ''}}
function dk150Peers(){try{return Object.keys(MP.rh).filter(k=>MP.rh[k].pr).length}catch(_){return 0}}
function dk150Name(){try{return DK150.host===MP.me?(hero.name||'You'):mpName(DK150.host)}catch(_){return 'the host'}}
// the kingdom as data (what x2Save keeps of it)
function dk150Pack(full){
  if(full){const o=x2Save()||{},s={};DK150.KEYS.forEach(k=>{if(o[k]!==undefined)s[k]=JSON.parse(JSON.stringify(o[k]))});return s}
  return {sh:Object.assign({},SH.lv),shp:Object.assign({},SH.shop),kpos:Object.assign({},SH.pos),krot:Object.assign({},SH.rot),
    khs:HS103.h.map(h=>({nm:h.nm,v:h.v})),kcit:HS103.cit.map(c=>({n:c.n,h:c.h,r:czRole104(c),rk:czRank105(c),lk:c.lk|0})),
    kdeco:Object.assign({},SH.deco),kst:kf109().s,shpu:Object.assign({},SHP109.lv),out148:[...OUT148.h]}}
// shows a kingdom: the kingdom parts of the save loaders (0530, 1860, 1870, 1910, 1960, 3074), then the same rebuilds
function dk150Apply(s){s=s||{};const ob=v=>v&&typeof v=='object'&&!Array.isArray(v)?v:{};
  for(const i in HS103.g)hsDrop103(+i);HS103.h=[];HS103.cit=[];czClear103();
  (Array.isArray(s.khs)?s.khs:[]).slice(0,HS103_MAX).forEach(h=>{if(h&&typeof h.nm=='string')HS103.h.push({nm:h.nm.slice(0,40),v:Math.max(0,Math.min(2,h.v|0))})});
  (Array.isArray(s.kcit)?s.kcit:[]).forEach(c=>{if(c&&typeof c.n=='string'&&HS103.h[c.h|0]&&HS103.cit.length<HS103_MAX*2)HS103.cit.push({n:c.n.slice(0,24),h:c.h|0,r:CZR104[c.r]?c.r:'gather',rk:Math.max(1,Math.min(5,c.rk|0||1)),task:typeof c.task=='string'?c.task.slice(0,40):'',t0:+c.t0||0,lk:c.lk|0,bag:Array.isArray(c.bag)?c.bag.slice(0,12):null})});
  SH.lv={};SH.shop={};const sh=ob(s.sh),shp=ob(s.shp);SHU.forEach(u=>{const v=sh[u.k]|0;if(v>0)SH.lv[u.k]=Math.min(3,v)});SHOPS.forEach(o=>{if(shp[o.k])SH.shop[o.k]=1});
  SH.pos={};SH.rot={};const kr=ob(s.krot),kp=ob(s.kpos);for(const k in kr){const v=kr[k]|0;if(v>0&&v<4)SH.rot[k]=v}for(const k in kp){const v=kp[k];if(typeof v=='string'&&LOTM103[v]&&!Object.values(SH.pos).includes(v))SH.pos[k]=v}
  SH.deco={};const kd=ob(s.kdeco);DECO103.forEach(D=>{const v=kd[D.k];if(v===0||v===1)SH.deco[D.k]=v});
  SHP109.lv={};const su=ob(s.shpu);SHPU109.forEach(u=>{const v=su[u.k]|0;if(v>0)SHP109.lv[u.k]=Math.min(SHP109_MAX,v)});try{stock2=null}catch(_){}try{mstock=null}catch(_){}
  OUT148.h=new Set(Array.isArray(s.out148)?s.out148.filter(n=>Number.isInteger(n)&&n>=0):[]);
  DK150.st=Math.max(0,Math.min(5,s.kst|0));
  KF109.s=-1;KF109.fresh={};
  try{shApply()}catch(e){console.warn('v150 kingdom shops',e)}try{lotSync103()}catch(e){console.warn('v150 kingdom lots',e)}
  try{dc103Sync()}catch(e){console.warn('v150 kingdom deco',e)}try{kfApply109(true)}catch(e){console.warn('v150 kingdom size',e)}
  try{hud();ui()}catch(_){}}
// the guest's own kingdom while the host's is shown: stage, saves
{const f=kfStage109;kfStage109=function(){if(DK150.on)return DK150.st;return f.apply(this,arguments)}}
{const f=x2Save;x2Save=function(){const o=f.apply(this,arguments)||{};if(DK150.on&&DK150.stash)DK150.KEYS.forEach(k=>{if(DK150.stash[k]!==undefined)o[k]=DK150.stash[k];else delete o[k]});return o}}
{const f=czTick103;czTick103=function(){if(DK150.on)return;return f.apply(this,arguments)}}
function dk150Borrow(s){if(!DK150.on){DK150.stash=dk150Pack(true);DK150.on=true;DK150.told=0}dk150Apply(s)}
function dk150Return(){if(!DK150.on)return;const s=DK150.stash;DK150.on=false;DK150.stash=null;DK150.last='';DK150.host='';dk150Apply(s);
  if(typeof MP!='undefined'&&MP.rg===-1)say('🏰 You are back in your own Duskhold.')}

// ---------- the host sends ----------
function dk150Send(now){const peers=Object.keys(MP.rh).sort().join(',');const txt=JSON.stringify(dk150Pack(false));
  if(txt===DK150.sent&&peers===DK150.peers&&now-DK150.sentT<DK150.keep*1000)return;DK150.sent=txt;DK150.peers=peers;DK150.sentT=now;
  const id=Math.random().toString(36).slice(2,8),N=2800,n=Math.max(1,Math.ceil(txt.length/N));
  for(let i=0;i<n;i++)MP.room.emit('ev',{r:-7,l:[['ks',id,i,n,txt.slice(i*N,(i+1)*N)]]}).catch(()=>{})}
// ---------- per frame ----------
function dk150Tick(now){if(now-DK150.tick<1500)return;DK150.tick=now;
  const h=dk150Host();
  if(!h||h===MP.me||!dk150Peers()){if(DK150.on)dk150Return();if(h===MP.me&&dk150Peers())dk150Send(now);return}
  if(DK150.on&&DK150.host&&DK150.host!==h)dk150Return();
  if(DK150.on&&MP.rg===-1&&!DK150.told){DK150.told=1;say('🏰 You are in '+mpEsc(dk150Name())+'\'s Duskhold. What you build with the Steward goes to their kingdom.')}}
{const f=homeTick;homeTick=function(){const r=f.apply(this,arguments);try{if(typeof MP!='undefined'&&MP.on&&party.length)dk150Tick(performance.now());else if(DK150.on)dk150Return()}catch(err){if(!DK150.err){DK150.err=1;console.warn('v150 duskhold',err)}}return r}}
{const f=mpUse;mpUse=function(){const r=f.apply(this,arguments);try{if(!MP.on&&DK150.on)dk150Return()}catch(_){}return r}}

// ---------- guests build for the host ----------
function dk150Fwd(what,k,lot){try{MP.room.emit('ev',{r:-7,l:[['kd',what,String(k).slice(0,40),lot?String(lot).slice(0,12):'']]}).catch(()=>{})}catch(_){}
  say('🏰 Sent to '+mpEsc(dk150Name())+'\'s kingdom.')}
{const f=shopBuy;shopBuy=function(k){if(!DK150.on||DK150.free)return f.apply(this,arguments);const b=shopBuilt(k);const r=f.apply(this,arguments);if(!b&&shopBuilt(k))dk150Fwd('shop',k,SH.pos[k]);return r}}
{const f=shBuy;shBuy=function(k){if(!DK150.on||DK150.free)return f.apply(this,arguments);const b=kdLv(k);const r=f.apply(this,arguments);if(kdLv(k)>b)dk150Fwd('up',k,SH.pos['u:'+k]);return r}}
{const f=hsBuy103;hsBuy103=function(id){if(!DK150.on||DK150.free)return f.apply(this,arguments);const n=HS103.h.length;const r=f.apply(this,arguments);if(HS103.h.length>n)dk150Fwd('house',id,id);return r}}
{const f=dcBuy103;dcBuy103=function(k){if(!DK150.on||DK150.free)return f.apply(this,arguments);const b=SH.deco[k];const r=f.apply(this,arguments);if(b==null&&SH.deco[k]!=null)dk150Fwd('deco',k);return r}}
{const f=shpBuy109;shpBuy109=function(k){if(!DK150.on||DK150.free)return f.apply(this,arguments);const b=shpL109(k);const r=f.apply(this,arguments);if(shpL109(k)>b)dk150Fwd('shpu',k);return r}}
{const f=out148Take;out148Take=function(i){const W=KF109.wsel,p=W&&W.L&&W.L[i],had=p&&OUT148.h.has(p.ci);const r=f.apply(this,arguments);
  try{if(DK150.on&&p&&!had&&OUT148.h.has(p.ci))MP.room.emit('ev',{r:-7,l:[['kdo',p.ci|0]]}).catch(()=>{})}catch(_){}return r}}
// what stays with the host
['lotPut103','kfRotate109','dcToggle103','czTask103','czTrain104','czRankUp105','czCollectHouse105','vlCollect116'].forEach(n=>{const f=window[n];if(typeof f!='function')return;
  window[n]=function(){if(DK150.on){say('🏰 This is '+mpEsc(dk150Name())+'\'s Duskhold: only they can do that.');return false}return f.apply(this,arguments)}});
// the host builds what a guest paid for, free of charge
{const f=dc148Has;dc148Has=function(){if(DK150.free)return true;return f.apply(this,arguments)}}
{const f=saveGame;saveGame=function(){if(DK150.free){DK150.saveLater=1;return false}return f.apply(this,arguments)}}
// every material any kingdom cost names (shHas is a constant, so the checks are passed by lending plenty of each)
function dk150Mats(){const s=new Set(),add=L=>{(Array.isArray(L)?L:[]).forEach(q=>{if(Array.isArray(q))s.add(q[0])})};
  try{SHU.forEach(u=>{for(let l=1;l<=3;l++)try{add(shCost(u,l))}catch(_){}})}catch(_){}try{SHOPS.forEach(o=>add(o.m))}catch(_){}
  try{for(let n=0;n<HS103_MAX;n++)add(hsCost103(n).m)}catch(_){}try{SHPU109.forEach(u=>{for(let l=1;l<=SHP109_MAX;l++)try{add(shpCost109(u,l).m)}catch(_){}})}catch(_){}
  try{DECO103.forEach(D=>{for(const k in D.m||{})s.add(k)})}catch(_){}return [...s]}
function dk150Do(what,k,lot,from){const g0=gold,m0=Object.assign({},mats);let set=null;DK150.free=1;gold+=1e12;dk150Mats().forEach(q=>{mats[q]=(mats[q]||0)+1e9});const before=JSON.stringify(dk150Pack(false));
  try{if(what==='shop'&&SHOPS.some(o=>o.k===k)&&!shopBuilt(k)){if(lot&&LOTM103[lot]&&lotFree103(lot)){SH.pos[k]=lot;set=k}shopBuy(k);if(set&&!shopBuilt(k))delete SH.pos[set]}
    else if(what==='up'&&SHU.some(u=>u.k===k)){const key='u:'+k;if(!kdLv(k)&&!SH.pos[key]&&lot&&LOTM103[lot]&&lotFree103(lot)){SH.pos[key]=lot;set=key}shBuy(k);if(set&&!(kdLv(k)>0))delete SH.pos[set]}
    else if(what==='house'&&LOTM103[k])hsBuy103(k);
    else if(what==='deco'&&DECO103.some(D=>D.k===k))dcBuy103(k);
    else if(what==='shpu'&&SHPU109.some(u=>u.k===k))shpBuy109(k)}
  catch(err){console.warn('v150 kingdom build',err)}
  finally{DK150.free=0;gold=g0;for(const q in mats)if(!(q in m0))delete mats[q];for(const q in m0)mats[q]=m0[q]}
  const done=JSON.stringify(dk150Pack(false))!==before;
  if(done){say('🏰 '+mpEsc(mpName(from))+' paid for a new build in your kingdom.');try{sfx('power')}catch(_){}}
  if(DK150.saveLater||done){DK150.saveLater=0;try{saveGame(true)}catch(_){}}
  DK150.sentT=0;try{hud();ui();if(typeof xwMode!='undefined'&&(xwMode=='hold'||xwMode=='kingdom'))rX()}catch(_){}}
// ---------- messages ----------
{const f=mpOnEV;mpOnEV=function(msg){try{const d=msg&&msg.data;if(MP.on&&!msg.sameTab&&d&&d.r===-7&&Array.isArray(d.l)){
    for(const q of d.l.slice(0,8)){if(!Array.isArray(q))continue;
      if(q[0]==='ks'&&typeof q[1]==='string'&&Number.isInteger(q[2])&&Number.isInteger(q[3])&&q[3]>0&&q[3]<40&&typeof q[4]==='string'){
        const h=dk150Host();if(!h||msg.peer!==h||h===MP.me)continue;const P=DK150.parts[q[1]]||(DK150.parts[q[1]]={n:q[3],p:[],t:nowP()});P.p[q[2]]=q[4];
        for(const id in DK150.parts)if(nowP()-DK150.parts[id].t>30000)delete DK150.parts[id];
        if(P.p.filter(x=>typeof x==='string').length===P.n){delete DK150.parts[q[1]];const txt=P.p.join('');if(txt===DK150.last&&DK150.on)continue;
          let s=null;try{s=JSON.parse(txt)}catch(_){}if(!s||typeof s!=='object')continue;DK150.last=txt;DK150.host=h;dk150Borrow(s)}}
      else if(q[0]==='kd'&&typeof q[1]==='string'&&typeof q[2]==='string'&&dk150Host()===MP.me&&MP.rh[msg.peer])dk150Do(q[1],q[2],typeof q[3]==='string'?q[3]:'',msg.peer);
      else if(q[0]==='kdo'&&Number.isInteger(q[1])&&dk150Host()===MP.me&&MP.rh[msg.peer]){const W=KF109.wsel,i=W&&W.L?W.L.findIndex(p=>p.ci===q[1]):-1;if(i>=0&&!OUT148.h.has(q[1])){out148Take(i);DK150.sentT=0;try{saveGame(true)}catch(_){}}}}
    return}}catch(err){console.warn('v150 duskhold ev',err)}
  return f.apply(this,arguments)}}
