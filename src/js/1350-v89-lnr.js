// =====================================================================================================
var LNR={};   // per-instance reachability (flood fill from the entrance); v106: keyed by instance key g = zone*3+k
function lnZB(g){const I=INSL[g];return {x0:I.x0,y0:I.y0,w:I.w,h:I.h}}
function lnReach(g){const B=lnZB(g),key=g+':'+B.w+'x'+B.h;let R=LNR[g];if(R&&R.key==key)return R;
  const a=new Uint8Array(B.w*B.h),p=INSL[g],q=[];
  const free=(x,y)=>{const t=MAP[y]&&MAP[y][x];return !!t&&t!='~'&&!solid(x,y)};
  const push=(x,y)=>{const i=(y-B.y0)*B.w+(x-B.x0);if(x<B.x0||y<B.y0||x>=B.x0+B.w||y>=B.y0+B.h||a[i]||!free(x,y))return;a[i]=1;q.push(x,y)};
  // start at the entrance (or the first free road tile)
  let s=p.en;if(!free(s[0],s[1]))for(const t of (p.path||p.wp||[]))if(free(t[0],t[1])){s=t;break}
  push(Math.round(s[0]),Math.round(s[1]));
  for(let k=0;k<q.length;k+=2){const x=q[k],y=q[k+1];push(x+1,y);push(x-1,y);push(x,y+1);push(x,y-1)}
  R=LNR[g]={key,a,B,n:q.length/2};return R}
function lnReachable(g,x,y){const R=lnReach(g),B=R.B;x=Math.round(x);y=Math.round(y);if(x<B.x0||y<B.y0||x>=B.x0+B.w||y>=B.y0+B.h)return false;return !!R.a[(y-B.y0)*B.w+(x-B.x0)]}
// the instance a map belongs to: m.r = zone, m.k = instance (maps from before v106 have no m.k: instance I)
function tmG(m){return insG(m.r,m.k|0)}
// a good spot for a buried treasure: reachable, open around it, not in the den / gateway / wave arena / a camp / near the entrance
function tmOk(g,x,y){if(g<0||!INSL[g]||!INSL[g].fld)return false;const p=INSL[g],B=lnZB(g);x=Math.round(x);y=Math.round(y);
  if(x<B.x0+4||y<B.y0+4||x>=B.x0+B.w-4||y>=B.y0+B.h-4||rgAt(x,y)!==g)return false;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(!lnReachable(g,x+i,y+j))return false;
  const R0=(typeof ARENA_R!='undefined'?ARENA_R:14);
  if(Math.hypot(x-p.ba[0],y-p.ba[1])<R0+10||(p.wa&&Math.hypot(x-p.wa[0],y-p.wa[1])<20)||Math.hypot(x-p.en[0],y-p.en[1])<10)return false;
  if(typeof CAMPS!='undefined'&&CAMPS.some(C=>C.ig===g&&Math.hypot(C.x-x,C.z-y)<(C.r||(typeof CAMP_R!='undefined'?CAMP_R:12))+3))return false;
  if(typeof SECRETS!='undefined'&&SECRETS.some(S=>Math.hypot(S.x-x,S.z-y)<4))return false;
  if(typeof DUNS!='undefined'&&DUNS.some(D=>Math.hypot((D.x||D.tx)-x,(D.y||D.ty)-y)<10))return false;
  if(typeof tmaps!='undefined'&&tmaps.some(m=>tmG(m)===g&&Math.hypot(m.x-x,m.z-y)<12&&m.x!==x))return false;
  return true}
function tmPick(g,near){const B=lnZB(g);let fb=null;
  for(let k=0;k<1500;k++){const x=B.x0+4+Math.floor(Math.random()*(B.w-8)),y=B.y0+4+Math.floor(Math.random()*(B.h-8));if(!tmOk(g,x,y))continue;
    if(!fb)fb=[x,y];if(near&&rgAt(near.x,near.z)===g&&Math.hypot(x-near.x,y-near.z)<35)continue;return [x,y]}
  return fb}
// the instance a new map leads to: the one you are in; in Duskhold, the instance that suits the hero's level
function tmZoneFor(p){let g=rgAt(Math.round(p.x),Math.round(p.z));if(g>=0)return INSL[g].fld?g:insG(INSL[g].z,PMF-1); // v108: from the den or the trial: instance III
  const L=hero.lvl||1,F=INSL.filter(q=>q.fld);let I=F.find(q=>L>=q.lv[0]&&L<=q.lv[1]);if(!I)I=L>PMAP[PMAP.length-1].lv[1]?F[F.length-1]:F[0];return I.g}
function tmName(m){const I=INSL[tmG(m)];return 'Treasure Map — '+(I?I.n:'Unknown lands')}
function tmNewId(){let id=1;tmaps.forEach(m=>{if(m.id>=id)id=m.id+1});return id}
var TM_DIR=['east','south-east','south','south-west','west','north-west','north','north-east'];
function tmHint(m){const g=tmG(m),p=INSL[g];if(!p)return '';const L=[['the entrance',p.en],[p.den?"the Sovereign's lair":'the gateway',p.ba]];
  try{CAMPS.forEach(C=>{if(C.ig===g)L.push([(C.th&&C.th.n?'the '+C.th.n:'a camp'),[C.x,C.z]])})}catch(_){}
  let b=L[0],bd=1e9;L.forEach(q=>{const d=Math.hypot(q[1][0]-m.x,q[1][1]-m.z);if(d<bd){bd=d;b=q}});
  const a=Math.atan2(m.z-b[1][1],m.x-b[1][0]),dir=TM_DIR[((Math.round(a/(Math.PI/4))%8)+8)%8];
  return 'The ✕ lies '+(bd<6?'right by':'about '+Math.round(bd/5)*5+' paces '+dir+' of')+' '+b[0]+'.'}
function tmCur(){return rgAt(Math.round(pl.position.x),Math.round(pl.position.z))}
// new maps (rz: an instance key)
function giveMap(p,rz){const g=rz!=null?rz:tmZoneFor(p);const s=tmPick(g,p);if(!s)return null;const I=INSL[g];
  const m={id:tmNewId(),r:I.z,k:I.k,x:s[0],z:s[1],T:PMAP[I.z].t};tmaps.push(m);
  pickup({ic:'🗺️',t:tmName(m),col:'#fbbf24',sub:'Kept in your bag until you dig it up. The ✕ shows on the minimap and map (N) in '+I.n+'.',r:2});sfx('chime');
  say('🗺️ <b>'+tmName(m)+'</b>: '+tmHint(m));lnBagRefresh();return m}
// digging removes the map from the bag
{const f=digTreasure;digTreasure=function(m){if(!m||!tmaps.includes(m))return;const n=tmName(m);f.apply(this,arguments);try{say('🗺️ '+n+' is used up — the treasure is yours!');lnMarkSync()}catch(_){}lnBagRefresh()}}
// old saves: give each map a zone and an instance, re-place it if the spot is not reachable
function tmMigrate(){let ch=0;(tmaps||[]).forEach(m=>{if(m.r==null||!PMAP[m.r]){let r=regionAt(Math.round(m.x),Math.round(m.z));if(r<0)r=Math.max(0,PMAP.findIndex(p=>p.t==m.T));m.r=r;ch=1}
    if(m.k==null||!(m.k<PMF)){const I=insAt(Math.round(m.x),Math.round(m.z));m.k=I&&I.z===m.r&&I.fld?I.k:0;ch=1}
    m.T=PMAP[m.r].t;if(!tmOk(tmG(m),m.x,m.z)){const s=tmPick(tmG(m),null);if(s){m.x=s[0];m.z=s[1];ch=1}}});
  const ids=new Set();tmaps.forEach(m=>{if(!m.id||ids.has(m.id))m.id=tmNewId()+ids.size;ids.add(m.id)});return ch}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{tmMigrate()}catch(e){console.warn('tmaps migrate',e)}try{lnMarkSync()}catch(_){}return r}}

// ---- the ✕ on the ground (a red painted cross with a faint glow) ----
var TMG=new Map();
function lnMarkSync(){if(typeof scene=='undefined')return;const cur=tmCur();
  for(const [m,g] of TMG)if(!tmaps.includes(m)){scene.remove(g);TMG.delete(m)}
  tmaps.forEach(m=>{let g=TMG.get(m);if(!g){g=new THREE.Group();const mt=new THREE.MeshBasicMaterial({color:0xd8282a,transparent:true,opacity:.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
      [1,-1].forEach(s=>{const b=new THREE.Mesh(new THREE.PlaneGeometry(1.7,.32),mt);b.rotation.x=-Math.PI/2;b.rotation.z=s*Math.PI/4;b.position.y=.06;g.add(b)});
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:typeof SPR!='undefined'?SPR:null,color:0xffb040,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.set(2.2,2.2,1);sp.position.y=.6;g.add(sp);g.userData.sp=sp;
      g.position.set(m.x,GH(m.x,m.z),m.z);scene.add(g);TMG.set(m,g)}
    g.visible=cur===tmG(m)&&Math.hypot(pl.position.x-m.x,pl.position.z-m.z)<70;if(g.visible&&g.userData.sp)g.userData.sp.material.opacity=.35+.2*Math.sin(performance.now()/300)})}
{const f=worldTick;worldTick=function(dt,now){f.apply(this,arguments);try{lnMarkSync()}catch(_){}}}

// ---- minimap: ✕ in view (old code), plus an arrow at the edge pointing to this zone's ✕ when it is off the minimap ----
{const f=miniMarks;miniMarks=function(w,h,vw,vh,cx,cy){f.apply(this,arguments);try{const cur=tmCur();if(cur<0)return;
  tmaps.forEach(m=>{if(tmG(m)!==cur)return;let x=(m.x-(cx-vw/2)+.5)*w/vw,y=(m.z-(cy-vh/2)+.5)*h/vh;if(x>-6&&y>-6&&x<w+6&&y<h+6){
      mmX.strokeStyle='#000';mmX.lineWidth=4.5;mmX.beginPath();mmX.moveTo(x-5,y-5);mmX.lineTo(x+5,y+5);mmX.moveTo(x+5,y-5);mmX.lineTo(x-5,y+5);mmX.stroke();
      mmX.strokeStyle='#ef4444';mmX.lineWidth=2.5;mmX.stroke();return}
    const a=Math.atan2(y-h/2,x-w/2),ex=w/2+Math.cos(a)*(w/2-9),ey=h/2+Math.sin(a)*(h/2-9);
    mmX.save();mmX.translate(ex,ey);mmX.rotate(a);mmX.fillStyle='#ef4444';mmX.strokeStyle='#000';mmX.lineWidth=1.2;mmX.beginPath();mmX.moveTo(7,0);mmX.lineTo(-4,-5);mmX.lineTo(-2,0);mmX.lineTo(-4,5);mmX.closePath();mmX.fill();mmX.stroke();mmX.restore()})}catch(_){}}}

// ---- world map (N): a big red ✕ with the map's name, and a note for maps of other zones ----
{const f=openWMap;openWMap=function(){const r0=f.apply(this,arguments);try{lnWmapDraw()}catch(e){console.warn('tmap wmap',e)}return r0}}
function lnWmapDraw(){const c=$('wmc');if(!c||$('wmap').classList.contains('hide')||!tmaps.length)return;const g=c.getContext('2d'),r=tmCur();
  if(r>=0){const B=lnZB(r),s=c.width/B.w,P=(x,z)=>[(x-B.x0+.5)*s,(z-B.y0+.5)*s];
    tmaps.filter(m=>tmG(m)===r).forEach(m=>{const [x,y]=P(m.x,m.z),k=9;g.lineCap='round';
      g.strokeStyle='#1a0a06';g.lineWidth=7;g.beginPath();g.moveTo(x-k,y-k);g.lineTo(x+k,y+k);g.moveTo(x+k,y-k);g.lineTo(x-k,y+k);g.stroke();
      g.strokeStyle='#e0302a';g.lineWidth=4;g.stroke();g.lineCap='butt';
      g.textAlign='center';g.textBaseline='middle';g.font='700 12px system-ui,sans-serif';const t='Treasure';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(t,x,y+18);g.fillStyle='#ffd0c8';g.fillText(t,x,y+18)})}
  const other=tmaps.filter(m=>tmG(m)!==r);if(other.length){const zs=[...new Set(other.map(m=>INSL[tmG(m)]?INSL[tmG(m)].n:'?'))];
    let t='🗺️ Your treasure map'+(other.length>1?'s are':' is')+' for '+zs.join(', ')+' — open the map there to see the ✕',fs=12;
    g.font='600 12px system-ui,sans-serif';if(g.measureText(t).width>c.width-40){t='🗺️ Treasure maps for other zones: '+zs.join(', ');}
    while(fs>8){g.font='600 '+fs+'px system-ui,sans-serif';if(g.measureText(t).width<=c.width-40)break;fs--}g.textAlign='center';g.textBaseline='middle';const w=Math.min(c.width-16,g.measureText(t).width+24);
    g.fillStyle='rgba(20,10,6,.78)';g.fillRect(c.width/2-w/2,46,w,22);g.strokeStyle='#c9a24a';g.lineWidth=1;g.strokeRect(c.width/2-w/2+.5,46.5,w-1,21);g.fillStyle='#ffe2a8';g.fillText(t,c.width/2,57)}}

// ---- prompts: uncover secrets, dig with the map's name ----
{const f=worldPrompt;worldPrompt=function(){let p=f.apply(this,arguments);
  try{if(p&&/^Attack the cracked boulder/.test(p.label))p=lnSecretPrompt()||p;
    if(p&&p.label=='F · Dig for treasure'){const P=pl.position,m=tmaps.find(q=>Math.hypot(P.x-q.x,P.z-q.z)<2);if(m)p={label:'F · Dig up the treasure ('+tmName(m).replace('Treasure Map — ','')+' map)',fn:p.fn}}}catch(_){}
  return p}}

// ---- the bag: maps are items in the Gear grid and the Supplies tab until dug up ----
function lnBagRefresh(){try{if(!$('bag').classList.contains('hide'))rB0()}catch(_){}}
function tmTile(m){return `<div class="kqm-slot kqm-tmap" data-kqtm="${m.id}" data-kqt="tm:${m.id}" style="--rc:#fbbf24" title=""><span class="kqm-ic">🗺️</span><span class="kqm-up">${(PMAP[m.r]?PMAP[m.r].n:'?').replace(/^The /,'').split(' ')[0]+' '+(PM_RN[m.k|0]||'')}</span></div>`}
function tmTip(m){const p=INSL[tmG(m)],here=tmCur()===tmG(m);
  return `<div class="kqm-tn"><span>🗺️ ${tmName(m)}</span></div><div class="kqm-ts">Quest item · can't be sold</div>`+
    `<div class="kqm-td">A treasure is buried in <b>${p?p.n:'?'}</b>${p?' (Lv '+p.lv[0]+'–'+p.lv[1]+')':''}. ${tmHint(m)}</div>`+
    `<div class="kqm-th">${here?'You are there: the red ✕ is on your minimap and map (N). Stand on it and press F to dig.':'Travel to '+(p?p.n:'its zone')+' through its zone\'s portal gate outside Duskhold, then follow the ✕.'} The map is used up once you dig the treasure.</div>`}
{const f=kqmTipHTML;kqmTipHTML=function(el){const k=el&&el.dataset&&el.dataset.kqt||'';if(k.slice(0,3)=='tm:'){const m=tmaps.find(q=>q.id==+k.slice(3));return m?[tmTip(m),'#fbbf24']:null}return f.apply(this,arguments)}}
{const f=kqmBag;kqmBag=function(){const r=f.apply(this,arguments);try{if(!tmaps.length)return r;const bl=$('bl'),T=bagTab2;if(!bl)return r;
    if(T==0&&KQM.filt=='all'){const g=bl.querySelector('.kqm-bagg');if(g){g.insertAdjacentHTML('afterbegin',tmaps.map(tmTile).join(''));for(let i=0;i<tmaps.length;i++){const e=g.querySelector('.kqm-empty:last-child');if(e)e.remove()}}}
    if(T==3)bl.insertAdjacentHTML('afterbegin',`<div class="kqm-h">Treasure maps</div><div class="kqm-grid">${tmaps.map(tmTile).join('')}${kqmEmpty((8-tmaps.length%8)%8)}</div>`);
    if(LN.tmSel&&!tmaps.some(m=>m.id==LN.tmSel))LN.tmSel=null;
    if(LN.tmSel&&(T==0||T==3)){const m=tmaps.find(q=>q.id==LN.tmSel);bl.querySelectorAll('[data-kqtm="'+m.id+'"]').forEach(e=>e.classList.add('on'));
      $('idt').innerHTML=`<div class="dtl"><div class="dh">🗺️ ${tmName(m)}</div><div class="mut" style="font-size:.74rem">${tmHint(m)} Quest item: it can't be sold and is used up when you dig the treasure.</div></div>`+(tmCur()===tmG(m)?'<button class="pri" data-tmopen="1">🗺️ Show on map</button>':'')}
  }catch(e){console.warn('tmap bag',e)}return r}}
$('bag').addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('[data-kqtm],[data-tmopen]');if(!t)return;
  if(t.dataset.tmopen){$('bag').classList.add('hide');openWMap();return}
  LN.tmSel=+t.dataset.kqtm;try{selI=null}catch(_){}rB0()});
document.head.insertAdjacentHTML('beforeend',`<style>
.kqm-slot.kqm-tmap{cursor:pointer;background:radial-gradient(circle at 50% 40%,rgba(251,191,36,.18),transparent 70%),var(--kq-slot,rgba(0,0,0,.35));box-shadow:inset 0 0 0 1px rgba(251,191,36,.55)}
.kqm-slot.kqm-tmap.on{box-shadow:inset 0 0 0 2px #fbbf24,0 0 8px rgba(251,191,36,.5)}
.kqm-slot.kqm-tmap .kqm-up{font-size:.52rem;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
</style>`);

// =====================================================================================================
// 3. gathering nodes: one model per material
