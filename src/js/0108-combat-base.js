// ---------- Combat ----------
Object.keys(MOVES).forEach(k=>MOVES[k].nm=k);
function aimDir(){
  if(tgt&&!tgt.dead){const v=V(tgt.m.position.x-pl.position.x,0,tgt.m.position.z-pl.position.z),L=v.length();if(L<9&&L>.05)return v.multiplyScalar(1/L)}
  if(orb)return camFwd();
  const f=V(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y));
  if(!mOn)return f;const d=V().subVectors(mg,pl.position);d.y=0;return d.lengthSq()>.05?d.normalize():f;
}
const face=d=>{pl.rotation.y=Math.atan2(d.x,d.z)};
function fire(s,pos,d,dm){
  const o=gY(pos,.4);
  if(s.k=='nova'){const R2=s.big?3.4:2.7;ring(pos,s.col,R2*2.2,380);ring(pos,0xffffff,R2*1.6,260);burst(o,s.col,s.big?70:40,R2*1.6,3,.7);area(pos,R2,dm,s)}
  if(s.k=='cone'){arc(pos,d,s.col,2.7,300);burst(o.clone().addScaledVector(d,1.4),s.col,24,2.5,1.5,.5);area(pos,2.5,dm,s,d,.9)}
  if(s.k=='beam'){
    bolt(gY(o,.9),o.clone().addScaledVector(d,7).setY(.9),s.col);burst(o,s.col,14,2,2,.4);
    enemies.forEach(e=>{if(e.dead)return;const v=V().subVectors(e.m.position,pos).setY(0),a=v.dot(d),w=Math.abs(v.x*d.z-v.z*d.x);if(a>0&&a<7&&w<1){burst(gY(e.m.position,.7),s.col,16,2,2,.5);hurt(e,Math.max(1,Math.round(dm-D(e.c)*.4)),s)}});
  }
  if(s.k=='shot'){
    const c=s.n||1;
    for(let j=0;j<c;j++){
      const ang=(j-(c-1)/2)*.28,co=Math.cos(ang),sn=Math.sin(ang),dd=V(d.x*co+d.z*sn,0,-d.x*sn+d.z*co);
      const m=new THREE.Mesh(new THREE.SphereGeometry(s.big?.28:.15,8,6),addMat(s.col));
      m.position.copy(gY(pos,.7)).addScaledVector(dd,.6);scene.add(m);shots.push({m,v:dd.multiplyScalar(10),s,dm,t:1.1});
    }
    burst(o,s.col,12,1.5,1,.3);
  }
}
// ---------- Controls ----------
const gl=$('gl');
function mp(e){const r=gl.getBoundingClientRect();mnd.x=(e.clientX-r.left)/r.width*2-1;mnd.y=-((e.clientY-r.top)/r.height)*2+1;rc.setFromCamera(mnd,cam);rc.ray.intersectPlane(pln,mg);mOn=true}
gl.addEventListener('pointermove',mp);
gl.addEventListener('pointerleave',()=>{mOn=false;atkHeld=false;rmb=false});
gl.addEventListener('pointerdown',e=>{mp(e);if(e.button===0){atkHeld=true;swing()}}); // v148: only the left button (or a touch) attacks; the middle button only turns the camera
gl.addEventListener('contextmenu',e=>e.preventDefault());
gl.addEventListener('mousedown',e=>{if(e.button==0&&orb){atkHeld=true;swing()}});
addEventListener('mouseup',e=>{if(e.button==0)atkHeld=false});
// v135: a right click toggles mouse-look on and off (the cursor hides and the mouse turns the camera until the next right click);
// the middle button still turns the camera only while held. Esc, losing the pointer lock, the window losing focus or a window opening ends it.
let orb=null;const orbStart=(e,tg)=>{orb={x:e.clientX,y:e.clientY,tg};gl.style.cursor='none';try{const p=gl.requestPointerLock&&gl.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(_){}};
gl.addEventListener('pointerdown',e=>{if(e.button==2){e.preventDefault();atkHeld=!!(e.buttons&1);if(typeof KQS!='undefined'&&(KQS.tg||KQS.rcT===e.timeStamp))return;if(orb&&orb.tg)orbEnd();else orbStart(e,1)}
  else if(e.button==1){e.preventDefault();atkHeld=!!(e.buttons&1);if(!orb)orbStart(e,0)}});
addEventListener('pointermove',e=>{if(orb){const lk=document.pointerLockElement==gl,cl=v=>Math.max(-70,Math.min(70,v)),dx=lk?cl(e.movementX):e.clientX-orb.x,dy=lk?cl(e.movementY):e.clientY-orb.y;camYaw-=dx*.006*SET.sens;camPitch=Math.max(.14,Math.min(1.1,camPitch+dy*.004*SET.sens*(SET.inv?-1:1)));orb.x=e.clientX;orb.y=e.clientY}});
const orbEnd=()=>{orb=null;gl.style.cursor='';try{if(document.pointerLockElement)document.exitPointerLock()}catch(_){}};
addEventListener('pointerup',e=>{if(e.button==1&&orb&&!orb.tg)orbEnd()});addEventListener('blur',()=>{if(orb)orbEnd()});
document.addEventListener('pointerlockchange',()=>{if(orb&&orb.tg&&document.pointerLockElement!==gl&&orb.lk)orbEnd();else if(orb&&document.pointerLockElement===gl)orb.lk=1});
addEventListener('keydown',e=>{if(e.key==='Escape'&&orb)orbEnd()});setInterval(()=>{try{if(orb&&orb.tg&&uiOpen())orbEnd()}catch(_){}},250);
gl.addEventListener('wheel',e=>{camDist=Math.max(4.5,Math.min(15,camDist+e.deltaY*.008*SET.zoom));e.preventDefault()},{passive:false});
addEventListener('pointerup',e=>{if(!(e.buttons&1))atkHeld=false;rmb=false;if(joyId==null)dp[0]=dp[1]=0});
addEventListener('pointercancel',()=>{atkHeld=false;rmb=false;if(joyId==null)dp[0]=dp[1]=0});
$('dpad').addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(b){const d=b.dataset.d.split(',').map(Number);dp[0]=d[0];dp[1]=d[1];e.preventDefault()}});
$('acts').addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;e.preventDefault();const x=b.dataset.x;x=='a'?swing():x=='d'?dodge():x=='p'?drink():x=='z'?drinkMana():x=='v'?toggleMount():cast(+x)});
$('act').addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(b){e.preventDefault();toggleEmp(+b.dataset.e)}});
const WINS=['fz','bag','inc','cmp','shop','mshop','wmap','setw','tal','xw'];
const closeWin=()=>{let any=false;WINS.forEach(i=>{if(!$(i).classList.contains('hide')){$(i).classList.add('hide');any=true}});return any};
WINS.forEach(i=>$(i).addEventListener('click',e=>{if(e.target===$(i))$(i).classList.add('hide')}));
addEventListener('keydown',e=>{
  if(e.key=='Escape'){if(closeWin())return;if(!$('sysmenu').classList.contains('hide')){$('sysmenu').classList.add('hide');return}if(tgt){setTarget(null);return}}
  const k=e.key.toLowerCase();if(k.startsWith('arrow')||k==' '||k=='tab')e.preventDefault();K[k]=1;
  if(k=='tab'&&!uiOpen()){selectTarget();return}
  {const tw={i:'bag',p:'cmp',u:'inc',g:'fz',n:'wmap',o:'setw',c:'tal',h:'xw',j:'xw'}[k];if(tw&&!$(tw).classList.contains('hide')){$(tw).classList.add('hide');return}}
  if(uiOpen())return;
  if(k>='1'&&k<='6')cast(+k-1);
  if(k==' ')swing();if(k=='n')openWMap();if(k=='o')openSet();if(k=='c')openTal();if((k=='['||k==']'))camYaw+=(k=='['?.2:-.2);if(k=='f')interact();if(k=='t')doRecall();{const hk={i:'bagBtn',p:'cmpBtn',u:'incBtn',g:'fuseBtn',m:'sysBtn'};if(hk[k])$(hk[k]).click()}if(k=='q')feedLowest141();if(k=='z'&&!e.ctrlKey&&!e.metaKey)drink();if(k=='x'&&!e.ctrlKey&&!e.metaKey)drinkMana();if(k=='v')toggleMount();if(k=='h')openMounts();if(k=='j')openBosses();if(k=='e')toggleEmp(0);if(k=='r')toggleEmp(1);if(k=='shift')dodge();
});
addEventListener('keyup',e=>{K[e.key.toLowerCase()]=0});
$('wmClose').onclick=()=>$('wmap').classList.add('hide');
$('mini').style.cursor='pointer';$('mini').addEventListener('click',()=>{$('wmap').classList.contains('hide')?openWMap():$('wmap').classList.add('hide')});
const SET=Object.assign({sens:1,zoom:1,inv:false,shake:true,q:'auto'},(()=>{try{return JSON.parse(localStorage.getItem('et_set')||'{}')||{}}catch(_){return {}}})());
function saveSet(){try{localStorage.setItem('et_set',JSON.stringify(SET))}catch(_){}}
function applySet(){if(SET.q=='auto'){QL.auto=location.protocol!='file:'}else{QL.auto=false;setQ(+SET.q)}}
function syncSet(){$('s_sens').value=SET.sens;$('sv_sens').textContent=(+SET.sens).toFixed(2)+'×';$('s_zoom').value=SET.zoom;$('sv_zoom').textContent=(+SET.zoom).toFixed(1)+'×';$('s_inv').checked=SET.inv;$('s_shake').checked=SET.shake;$('s_q').value=SET.q}
function openSet(){if(uiOpen())return;syncSet();$('setw').classList.remove('hide')}
$('setBtn').onclick=openSet;$('setClose').onclick=()=>$('setw').classList.add('hide');
$('s_sens').oninput=e=>{SET.sens=+e.target.value;syncSet();saveSet()};$('s_zoom').oninput=e=>{SET.zoom=+e.target.value;syncSet();saveSet()};
$('s_inv').onchange=e=>{SET.inv=e.target.checked;saveSet()};$('s_shake').onchange=e=>{SET.shake=e.target.checked;saveSet()};
$('s_q').onchange=e=>{SET.q=e.target.value;applySet();saveSet()};
$('s_reset').onclick=()=>{Object.assign(SET,{sens:1,zoom:1,inv:false,shake:true,q:'auto'});saveSet();applySet();syncSet()};
applySet();
$('fsBtn').onclick=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else{const p=$('stage').requestFullscreen();if(p&&p.catch)p.catch(()=>say('Fullscreen is not allowed here — try opening the game in its own tab.'))}}catch(_){say('Fullscreen is not available here.')}};
$('pty').onclick=e=>{
  const b=e.target.closest('button');if(!b||foe)return;const i=+b.dataset.i;
  if(party[i].h<=0)return say('That companion needs healing first.');
  party.unshift(party.splice(i,1)[0]);ui();say(nm(party[0])+' takes the lead.');
};

// ---------- Loot, gear, eggs ----------
const RAR=[['Common','#a8a8a8'],['Uncommon','#5fcf6a'],['Rare','#5a96ff'],['Epic','#b45cff'],['Legendary','#ff9a2a']];
const WB=[['Sword',.42,2.4,1],['Axe',.6,2.7,1.3],['Mace',.55,2.3,1.15],['Dagger',.3,1.9,.7]],AB=['Jerkin','Hauberk','Plate'],CB=['Talisman','Amulet','Idol'],PF=['Worn','Sturdy','Runed','Cursed','Hallowed'];
const cn=i=>`<span style="color:${RAR[i.r][1]}">${i.nm}</span>`,en=e=>`<span style="color:${RAR[e.tier][1]}">🥚 Tier ${e.tier+1} ${e.sp} Egg <small>${TGI[e.tag]||''} ${e.tag||''}</small></span>`;
let uid=1,gold=0,pots=1,stock=null,stockLv=0;
// shared shapes for every drop; the materials are the drop's own (marked dropOwn, freed by dropFree when it goes)
var G_DROP=null;
function dropFree(d){d.g.traverse(o=>{if(o.material&&o.material.userData.dropOwn)o.material.dispose()})}
function drop(kind,data,p,r){G_DROP=G_DROP||{s:new THREE.SphereGeometry(.16,12,10),o:new THREE.OctahedronGeometry(.18),b:new THREE.CylinderGeometry(.05,.05,1.6,8)};
  const own=m=>{m.userData.dropOwn=1;return m};
  const col=parseInt(RAR[r][1].slice(1),16),g=new THREE.Group(),gem=new THREE.Mesh(kind=='egg'||kind=='megg'?G_DROP.s:G_DROP.o,own(new THREE.MeshBasicMaterial({color:col})));
  if(kind=='egg'||kind=='megg')gem.scale.y=1.3;if(kind=='megg')gem.scale.setScalar(1.5);
  const beam=new THREE.Mesh(G_DROP.b,own(new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false})));
  gem.position.y=.5;beam.position.y=.8;g.add(gem,beam);
  const a=Math.random()*6.28,d=.5+Math.random()*.8;g.position.set(p.x+Math.cos(a)*d,0,p.z+Math.sin(a)*d);scene.add(g);drops.push({g,gem,kind,data,t:90});
  burst(gY(g.position,.4),col,12,2,2.5,.7);
}
// shop
const topL=()=>hero.lvl||1,SV=[40,140,500],EV=[30,90,250,700,1800];
const val=i=>Math.round(((i.atk||0)*9+(i.def||0)*8+(i.hp||0)*1.5)*[1,1.6,2.6,4.5,9][i.r]),pr=v=>Math.round(v*1.8);
$('shopBtn').onclick=()=>{const ti=townAt(pl.position.x,pl.position.z,2);if(ti<0)return say('Shops are inside the town walls. Walk to a town to trade.');const T=TOWNS[ti],a=Math.hypot(pl.position.x-T.mp[0],pl.position.z-T.mp[1]),b=Math.hypot(pl.position.x-T.mv[0],pl.position.z-T.mv[1]);openShop(a<=b?'m':'x')};
$('sClose').onclick=()=>$('shop').classList.add('hide');
$('sb').onclick=e=>{
  const b=e.target.closest('[data-b]');if(!b)return;const k=b.dataset.b,n=+k.slice(1);let c;
  if(k=='pot'){c=30}else if(k[0]=='g'){c=pr(val(stock.gear[n]))}else if(k[0]=='s'){c=SV[MOVES[stock.scrolls[n]].r]*2}else c=EV[0]*3;
  if(gold<c)return say('Not enough gold.');gold-=c;
  if(k=='pot')pots++;else if(k[0]=='g')gear.push(stock.gear.splice(n,1)[0]);else if(k[0]=='s'){const m=stock.scrolls.splice(n,1)[0];inv[m]=(inv[m]||0)+1}else{eggs.push(stock.egg);stock.egg=null}
  rS();hud();
};
$('ss').onclick=e=>{
  const b=e.target.closest('[data-s]');if(!b)return;const k=b.dataset.s,t=k[0],id=k.slice(1);
  if(t=='g'){const i=gear.findIndex(g=>g.id==+id);if(i<0)return;gold+=Math.round(val(gear[i])*.5);gear.splice(i,1)}
  if(t=='s'){inv[id]--;gold+=SV[MOVES[id].r]}
  if(t=='e'){const i=eggs.findIndex(g=>g.id==+id);if(i<0)return;gold+=EV[eggs[i].tier];eggs.splice(i,1)}
  rS();hud();
};
// bag
let selI=null;
let bagTab=0;
$('bagBtn').onclick=()=>{$('bag').classList.remove('hide');rB()};
$('bClose').onclick=()=>$('bag').classList.add('hide');
$('bag').addEventListener('click',e=>{
  const t=e.target.closest('[data-bt]');if(t){bagTab=+t.dataset.bt;rB0();return}
  const b=e.target.closest('[data-k]');
  if(b){selI={k:b.dataset.k,id:b.dataset.k=='p'?b.dataset.id:+b.dataset.id};rB();return}
  if(e.target.id=='idAct')invAct();
});
const QT=[[.88,'Perfect','#ffd24a'],[.74,'Excellent','#b45cff'],[.58,'Good','#5a96ff']];
let hq=[],hAct=false;
function refreshOpen(){if(!$('cmp').classList.contains('hide'))rC();if(!$('bag').classList.contains('hide'))rB();if(!$('inc').classList.contains('hide'))rI()}
// ---------- preview renderer: companions, hero and the hatching scene ----------
const PV={r:null,cv:null,sc:null,cam:null,obj:null,upd:null,run:false,last:0};
function pvInit(){
  if(PV.r)return true;
  try{
    PV.cv=document.createElement('canvas');PV.cv.style.cssText='width:100%;height:100%;display:block';
    PV.r=new THREE.WebGLRenderer({canvas:PV.cv,antialias:true,alpha:true});PV.r.setClearColor(0x000000,0);
    PV.sc=new THREE.Scene();PV.cam=new THREE.PerspectiveCamera(35,1,.1,50);PV.cam.position.set(0,1.0,4.0);PV.cam.lookAt(0,.9,0);
    const h=new THREE.HemisphereLight(0xbcd0ff,0x40352a,.9),d=new THREE.DirectionalLight(0xfff0dd,1.2),rim=new THREE.DirectionalLight(0x7aa0ff,.6);d.position.set(2,4,3);rim.position.set(-3,2,-2);
    PV.pl=new THREE.PointLight(0xffffff,0,8);PV.pl.position.set(0,1.1,1.6);PV.sc.add(h,d,rim,PV.pl);return true;
  }catch(e){PV.r=null;return false}
}
function pvShow(host,obj,upd){
  if(!pvInit())return false;
  if(PV.obj)PV.sc.remove(PV.obj);PV.obj=obj;if(obj)PV.sc.add(obj);PV.upd=upd||null;PV.pl.intensity=0;
  host.appendChild(PV.cv);const w=host.clientWidth||200,h=host.clientHeight||220;
  PV.r.setPixelRatio(Math.min(devicePixelRatio||1,2));PV.r.setSize(w,h,false);PV.cam.aspect=w/h;PV.cam.updateProjectionMatrix();
  if(!PV.run){PV.run=true;requestAnimationFrame(pvLoop)}
  return true;
}
function pvLoop(now){
  if(!PV.run)return;
  if(!PV.cv.isConnected||!PV.cv.offsetParent){PV.run=false;return}
  requestAnimationFrame(pvLoop);const dt=Math.min(.05,(now-(PV.last||now))/1000);PV.last=now;
  if(PV.upd)PV.upd(now,dt);PV.r.render(PV.sc,PV.cam);
}
function pvFit(m,size){
  const b=new THREE.Box3().setFromObject(m),sz=b.getSize(new THREE.Vector3()),k=size/Math.max(sz.x,sz.y,sz.z*.9,.01);m.scale.multiplyScalar(k);
  const b2=new THREE.Box3().setFromObject(m),c=b2.getCenter(new THREE.Vector3());m.position.set(-c.x,-b2.min.y,-c.z);
}
function cmpPV(c){
  const m=cr(c),pv=new THREE.Group(),inner=new THREE.Group();inner.add(m);pv.add(inner);pvFit(inner,1.7);
  pvShow($('cvw'),pv,now=>{pv.rotation.y=now/2000;if(m.rig)m.rig(now,false,0)});
}
let HP=null;
function bagPV(){
  if(!HP){HP=buildHero();const inner=new THREE.Group(),piv=new THREE.Group();inner.add(HP);piv.add(inner);pvFit(inner,1.9);HP.pv=piv}
  refreshGear(HP);
  if(PV.obj===HP.pv&&PV.cv&&PV.cv.parentNode===$('hv'))return;
  pvShow($('hv'),HP.pv,now=>{HP.pv.rotation.y=Math.sin(now/1600)*.7+.3;animHero(now,false,HP)});
}
function rB(){rB0();bagStats();bagPV()}
$('hOk').onclick=()=>{PV.run=false;nextHatch()};
$('incBtn').onclick=openInc;
$('iClose').onclick=()=>$('inc').classList.add('hide');

// companions menu
let cmpSel=0;
$('cmpBtn').onclick=()=>{$('cmp').classList.remove('hide');rC()};
$('cClose').onclick=()=>$('cmp').classList.add('hide');
$('cl').onclick=e=>{const b=e.target.closest('button');if(b){cmpSel=+b.dataset.i;rC()}};
$('cd').onclick=e=>{const id=e.target.id;if(id!='mkLead'&&id!='mk2')return;const c=party[cmpSel];if(c.h<=0)return say('Rest at a tavern to revive it first.');party.splice(cmpSel,1);const at=id=='mkLead'?0:Math.min(1,party.length);party.splice(at,0,c);cmpSel=at;hero.hp=Math.min(hero.hp,heroMax());ui();rC()};
$('fuseBtn').onclick=()=>{held=null;sel=[];rF();$('fz').classList.remove('hide')};
$('fCancel').onclick=()=>$('fz').classList.add('hide');
$('fl').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;const i=+b.dataset.i;
  sel=sel.includes(i)?sel.filter(x=>x!=i):sel.length<2?[...sel,i]:[sel[1],i];rF();
};
$('doF').onclick=()=>{
  if(sel.length!=2||!compat(party[sel[0]],party[sel[1]]))return;
  const a=party[sel[0]],b=party[sel[1]],base=a.l>=b.l?a:b,o=base==a?b:a,same=a.g.join()==b.g.join();
  const r=mk(base.g[0],Math.max(a.l,b.l)+1,Math.min(5,Math.max(a.f,b.f)+1+(same?1:0)),base.v),mp={};
  // merge looks: every species from both parents (up to 3) with their colors, and a brand-new name
  [base,o].forEach(p=>p.g.forEach((s,i)=>{mp[s]=mp[s]||p.cl[i]}));
  r.g=Object.keys(mp).slice(0,3);r.cl=r.g.map(s=>mp[s]);r.sy=[base.sy[0],o.sy[1]];r.z=(a.z+b.z)/2;
  r.n=r.sy[0]+r.sy[1];r.iv={hp:(a.iv.hp+b.iv.hp)/2*1.04,a:(a.iv.a+b.iv.a)/2*1.04,d:(a.iv.d+b.iv.d)/2*1.04};r.sp=[...new Set([...base.sp,...o.sp])].slice(0,3);r.tr=base.tr=='Universal'?(o.tr&&o.tr!='Universal'?o.tr:''):base.tr;r.h=M(r);
  party=party.filter((_,i)=>!sel.includes(i));party.push(r);
  say('Fusion complete! '+nm(r)+' was born.');
  $('fz').classList.add('hide');ui();
};

