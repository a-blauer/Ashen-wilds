// ================= v85: level-up heal, companion command, fishing loot, recall instances, courtyard growth, trainer =================

// ---------------- companions: magic users attack from range; Space commands the team to attack your target ----------------
var CMD={e:null,t:0};
const CMD_MS=12000,MAG_R=5.5;
function cmdTarget(){if(tgt&&!tgt.dead&&enemies.includes(tgt)&&d2(tgt.m.position,pl.position)<24)return tgt;
  let b=null,bd=14;const d=aimDir?aimDir():V(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y));
  enemies.forEach(e=>{if(e.dead)return;const v=V(e.m.position.x-pl.position.x,0,e.m.position.z-pl.position.z),L=v.length();if(L>=bd)return;if(L>2&&v.dot(d)/L<.2)return;bd=L;b=e});return b}
function commandAttack(){
  if(townAt(pl.position.x,pl.position.z,0)>=0)return say('There is nothing to fight here.');
  const act=party.slice(0,2).filter((c,i)=>c&&c.h>0&&!c.emp&&fols[i]);if(!act.length)return say('No companion is out to command (empowering companions stay with you).');
  const e=cmdTarget();if(!e)return say('Target an enemy first (Tab), then press Space to send your companions in.');
  CMD={e,t:nowP()+CMD_MS};if(!tgt||tgt.dead)tgt=e;
  ring(e.m.position,0xffd24a,2.2,500);burst(gY(e.m.position,1.6),0xffd24a,14,1.2,1.6,.5);
  act.forEach(c=>{const f=fols[party.indexOf(c)];if(f){f.cdA=Math.min(f.cdA||0,.15);dn(f.position,'!','#ffd24a',-10,700)}});
  say('📣 '+act.map(c=>c.n).join(' and ')+(act.length>1?' attack ':' attacks ')+(e.c.n||e.c.g[0])+'!');if(typeof sfx=='function')sfx('chime',.5)}
{const f=teamFoe;teamFoe=function(){const C=CMD;if(C.e){if(C.e.dead||nowP()>C.t||!enemies.includes(C.e)||d2(C.e.m.position,pl.position)>30)CMD={e:null,t:0};
  else if(townAt(pl.position.x,pl.position.z,0)<0)return C.e}return f.apply(this,arguments)}}
addEventListener('keydown',e=>{if(e.key!==' '||e.ctrlKey||e.metaKey)return;const a=document.activeElement;if(a&&(a.tagName=='INPUT'||a.tagName=='TEXTAREA'))return;
  e.preventDefault();e.stopImmediatePropagation();if(e.repeat||uiOpen())return;commandAttack()},true);
{const mb=$('mbtn');if(mb){const b=document.createElement('button');b.dataset.m='cmd';b.title='Command companions to attack';b.textContent='📣';mb.appendChild(b);
  b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();commandAttack()})}}
{const s=document.querySelector('.sub');if(s)s.innerHTML=s.innerHTML.replace('Tab target ·','Tab target · Space command companions to attack ·')}

// a magic bolt from a companion to its foe; the hit lands when the bolt arrives
function compBolt(f,c,foe,done){const col=(FAMD[famOf(c.g[0])]||{}).col||0x9ad8ff,s=gY(f.position,.75),m=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),addMat(col));m.position.copy(s);scene.add(m);
  const gl=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),addMat(col));gl.material.opacity=.35;m.add(gl);burst(s,col,8,.8,1,.3);
  const L=d2(f.position,foe.m.position),ms=Math.max(140,L/18*1000);let tr=0;
  tw(ms,k=>{const t=gY(foe.m.position,.8);m.position.lerpVectors(s,t,k);m.position.y+=Math.sin(k*Math.PI)*.4;if((tr++)%2==0)burst(m.position,col,2,.3,.4,.25)},
    ()=>{scene.remove(m);m.geometry.dispose();gl.geometry.dispose();if(!foe.dead){burst(gY(foe.m.position,.8),col,16,1.4,1.6,.45);ring(foe.m.position,col,1.2,260)}done&&done()})}
// magic companions keep their distance and cast; physical ones still close in and bite
function compTick(dt,now){
  const foe=teamFoe();
  fols.forEach((f,i)=>{
    const c=party[i];if(!f||!c)return;
    f.visible=c.h>0&&!c.emp;f.position.y=GH(f.position.x,f.position.z);
    f.vel=f.vel||V();f.idleT=f.idleT||0;
    const P=pl.position,dpl=d2(f.position,P);
    if(dpl>28){f.position.set(P.x-Math.sin(pl.rotation.y)*2+(i?-1:1),0,P.z-Math.cos(pl.rotation.y)*2);f.vel.set(0,0,0)}
    f.cdA=(f.cdA||0)-dt;
    if(!f.visible||dt<=0){animC(f,now,false);return}
    const spdK=FAMD[famOf(c.g[0])].spd*((c.mods||[]).includes('Swift')?1.18:1),mg=xMt(c)=='m';
    let goal=null,want=0,face=null;
    if(foe&&!c.emp){
      const fp=foe.m.position,big=foe.boss?2.2:foe.c.al?.6:0,reach=mg?MAG_R+big:1.5+big,dv=V(fp.x-f.position.x,0,fp.z-f.position.z),L=dv.length();
      const ang=Math.atan2(f.position.x-fp.x,f.position.z-fp.z)+(i?.5:-.5)*dt,slot=V(fp.x+Math.sin(ang)*reach*.85,0,fp.z+Math.cos(ang)*reach*.85);
      face=dv;
      if(L>reach){goal=slot;want=Math.min(7,3.2+L)*spdK}
      else if(mg&&L<2.2&&!foe.boss){const away=V(-dv.x,0,-dv.z).normalize();goal=V(f.position.x+away.x*2,0,f.position.z+away.z*2);want=3*spdK} // step back to casting range
      if(L<=reach&&!f.lk&&f.cdA<=0){f.rotation.y=Math.atan2(dv.x,dv.z);
        if(mg){f.cdA=1.35/spdK;f.lk=1;const b=f.b;tw(220,k=>{if(b){b.position.y=Math.sin(k*Math.PI)*.12;b.rotation.x=-Math.sin(k*Math.PI)*.25}},()=>{if(b){b.position.y=0;b.rotation.x=0}f.lk=0;if(!foe.dead)compBolt(f,c,foe,()=>{if(!foe.dead)compHit(c,foe,1)})})}
        else{f.cdA=1.15/spdK;f.lk=1;lunge(f,fp,()=>{f.lk=0;if(!foe.dead)compHit(c,foe,1)})}}
    }else{
      const fy=pl.rotation.y,sd=i?-1:1,home=V(P.x-Math.sin(fy)*2.2+Math.cos(fy)*1.6*sd,0,P.z-Math.cos(fy)*2.2-Math.sin(fy)*1.6*sd),dh=d2(f.position,home);
      if(f.fol){if(dh<1.1)f.fol=0}else if(dh>3.4||dpl>4.6)f.fol=1;
      if(f.fol){goal=home;want=Math.min(12,1.2+dh*1.9)*(riding?1.6:1)}
      else{f.idleT-=dt;if(f.idleT<=0){f.idleT=2.5+Math.random()*4;f.look=Math.random()<.5?null:fy+(Math.random()-.5)*2.4;f.sniff=Math.random()<.3?V(f.position.x+(Math.random()-.5)*2.4,0,f.position.z+(Math.random()-.5)*2.4):null}
        if(f.sniff&&d2(f.sniff,P)<4.5){goal=f.sniff;want=1.1;if(d2(f.position,f.sniff)<.3)f.sniff=null}}
    }
    const tv=V();if(goal){const g=V(goal.x-f.position.x,0,goal.z-f.position.z),gl=g.length();if(gl>.15)tv.copy(g).multiplyScalar(Math.min(want,gl*4)/gl)}
    if(f.lk)tv.set(0,0,0);
    f.vel.lerp(tv,Math.min(1,dt*(tv.lengthSq()>f.vel.lengthSq()?5:7)));
    const sp=f.vel.length();if(sp>.05)compMove(f,f.vel.x*dt,f.vel.z*dt);
    let ty=null;if(face&&(f.lk||sp<1.5))ty=Math.atan2(face.x,face.z);else if(sp>.3)ty=Math.atan2(f.vel.x,f.vel.z);else if(f.look!=null)ty=f.look;
    if(ty!=null&&!f.lk){let da=ty-f.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));f.rotation.y+=da*Math.min(1,dt*(sp>.3?8:2.5))}
    animC(f,now,sp>.25,sp);
  });
}

// ---------------- fishing treasure: a gold pouch, a ring or an amulet may come up with the fish ----------------
var FSHF=false;
function fishTreasure(r,T,p){
  const flaw=FSHF?1.5:1,ch=[.1,.15,.22,.4][r]*flaw;if(Math.random()>=ch)return;
  const roll=Math.random(),lv=Math.max(1,Math.min(MAXLV,Math.max(hero.lvl-1,(typeof zoneLv=='function'?zoneLv(p.x,p.z):hero.lvl)))),pos=p.clone().add(V(.6,0,.6));
  if(roll<.6){const g=Math.round((8+4*lv)*[1,1.4,2.1,4][r]*(.8+Math.random()*.4));gold+=g;pickup({ic:'💰',t:'A gold pouch! +'+g+' gold',col:'#ffd24a',sub:'Snagged on your line'});burst(gY(pl.position,1),0xffd24a,18,1.4,1.8,.5);if(typeof sfx=='function')sfx('chime');hud();return}
  const sl=roll<.8?'ring':'amulet';let it=null;try{it=genItem(lv,{sl,minR:r>=2?1:0,cls:hero.cls});if(!it||itT(it).sl!==sl)it=null}catch(_){it=null}
  if(!it){const g=Math.round((8+4*lv)*[1,1.4,2.1,4][r]);gold+=g;pickup({ic:'💰',t:'A gold pouch! +'+g+' gold',col:'#ffd24a'});hud();return}
  drop('gear',it,pos,it.r);say('🎣 Something glints on your hook: '+(sl=='ring'?'a ring':'an amulet')+'!')}

// ---------------- inventory preview: always mirrors what is equipped right now ----------------
var BAGSIG='';
const bagSig=()=>hero.cls+'|'+SLOTS.map(k=>eq[k]?eq[k].id+':'+(eq[k].up||0):'-').join(',');
{const f=bagPV;bagPV=function(){try{if(typeof HP!='undefined'&&HP&&HP._cls&&HP._cls!==hero.cls){if(PV.obj===HP.pv){PV.sc.remove(HP.pv);PV.obj=null}HP=null}}catch(_){}
  const r=f.apply(this,arguments);try{if(HP){HP._cls=hero.cls;BAGSIG=bagSig()}}catch(_){}return r}}
setInterval(()=>{try{if($('bag')&&!$('bag').classList.contains('hide')&&HP&&bagSig()!==BAGSIG){BAGSIG=bagSig();refreshGear(HP);bagPV()}}catch(_){}},400);

// ---------------- recall keeps your place: press T again in Duskhold to go straight back ----------------
// INST = where you recalled from: the zone instance (r = instance key, v106), where you stood, and its creatures (each dead
// one keeps the time left until it comes back, rl ms). Saved with the game. Entering through a portal starts that instance
// fresh at its entrance instead.
var INST=null,RECBACK=false;
const instMP=()=>typeof MP!='undefined'&&MP.on&&MP.host&&MP.host!==MP.me;
function instSave(){const r=rgAt(Math.round(pl.position.x),Math.round(pl.position.z));if(r<0||ROST.r!==r||(!ROST.slots.length&&!(INSL[r]&&INSL[r].den))||instMP()||(typeof WV!='undefined'&&WV))return;
  const now=nowP();INST={v:108,r,x:pl.position.x,z:pl.position.z,slots:ROST.slots.map(s=>Object.assign({},s,{on:null,camp:s.camp?CAMPS.indexOf(s.camp):-1,rl:s.dead?Math.max(0,(s.rt||0)-now):0,rt:0}))};
  enemies.slice().forEach(e=>{if(!e.dead&&!e.boss&&e.slot&&rgAt(Math.round(e.m.position.x),Math.round(e.m.position.z))===r)removeE(e)})}
function instRestore(){const I=INST;if(!I||!INSL[I.r])return false;const now=nowP();ROST.r=I.r;ROST.slots=I.slots.map(s=>Object.assign({},s,{on:null,camp:s.camp>=0?CAMPS[s.camp]:null,rt:s.dead?now+(s.rl||0):0}));
  const N=INSL[I.r],p=PMAP[N.z];toPos(I.x,I.z);INST=null;banner(p.ic+' '+N.n.toUpperCase(),'Back where you left off','Fallen creatures return '+RESP_T+' seconds after they die');return true}
{const f=recallTown;recallTown=function(){const back=RECBACK&&nowP()-RECBACK<8000;RECBACK=false;if(back&&instRestore())return;instSave();return f.apply(this,arguments)}}
{const f=goHome;goHome=function(){instSave();return f.apply(this,arguments)}}
{const f=doRecall;doRecall=function(){
  if(INST&&INSL[INST.r]&&curMap()<0&&!rec&&!uiOpen()){if(instMP())return say('Only the zone host can return to a saved spot.');
    if(enemies.some(e=>!e.dead&&e.agg&&e.m.position.distanceTo(pl.position)<10))return say('You cannot recall with enemies this close.');
    RECBACK=nowP();rec={t:0,need:4,hp:hero.hp};say('Returning to '+INSL[INST.r].n+'... stay still for 4 seconds.');return}
  if(rec)RECBACK=false;return f.apply(this,arguments)}}
$('recallBtn').onclick=()=>doRecall();
// entering an instance through its portal starts it fresh, so a saved spot in that same instance is dropped
{const f=enterMap;enterMap=function(i,k){if(INST&&INST.r===insG(i,k|0)&&!instMP())INST=null;return f.apply(this,arguments)}}
// a hint while a spot is saved
{const f=hud;hud=function(){f.apply(this,arguments);try{if(INST&&INSL[INST.r]&&curMap()<0){const b=$('buffs'),n=INSL[INST.r].n;if(b&&!b.querySelector('.instb'))b.insertAdjacentHTML('afterbegin',`<span class="bf instb" title="Press T to return to where you left ${n}">🌀 ${n} · T to return</span>`)}}catch(_){}}}
{const f=x2Save;x2Save=function(){const s=f.apply(this,arguments);try{if(INST)s.inst=INST}catch(_){}return s}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{INST=s&&s.inst&&s.inst.slots&&s.inst.v===108?s.inst:null}catch(_){INST=null}return r}}

// ---------------- Consume: a companion absorbs another companion (not an egg) for a boost to every base stat ----------------
var fCon=null;
// gain from a consumed companion: its tier matters most, its level a little
const conGainC=b=>consGain(Math.max(0,tierSp(b.g[0])-1))*(1+Math.min(.5,(b.l-1)/60))*(1+.1*(b.evo||0));
function conHTML(a){const L=party.filter(c=>c&&c!==a);
  return `<div class="fdet">🍽️ ${a.n} absorbs another companion and gains about <b>+${pctS(consGain(0))}</b> (Tier 1) to <b>+${pctS(consGain(4))}</b> (Tier 5) on every base stat; higher level and evolved companions give a little more. <b>The eaten companion is gone for good.</b>
  <div class="fstats" style="flex-wrap:wrap">${L.length?L.map(c=>{const i=party.indexOf(c),lk=c.lock,act=i<2;return `<button data-fcon="${i}" class="${fCon===c?'on':''}" ${lk?'disabled title="Locked: unlock it in the Companions window first"':act?'title="Active companion"':''}>${lk?'🔒 ':''}${em(c)} ${c.n} Lv ${c.l}${act&&!lk?' <small style="color:#fbbf24">active</small>':''} <small class="mut">T${tierSp(c.g[0])} · +${pctS(conGainC(c))}</small></button>`}).join(''):'<span class="mut">You need a second companion to consume. Hatch one from an egg.</span>'}</div></div>`}
{const f=fuseOpts;fuseOpts=function(a,b){return f.apply(this,arguments).replace(/Feed [^<]* an egg for a small boost to every base stat/,'Absorb another companion for a boost to every base stat').replace(/Feed [^<]* an egg instead/,'Absorb a companion instead').replace(/or choose Consume to feed it an egg\./,'or choose Consume to have it absorb another companion.').replace('<span class="fi">🥚</span>','<span class="fi">🍽️</span>')}}
{const f=rF;rF=function(){f.apply(this,arguments);try{const a=sel.length>=1?party[sel[0]]:null;if(fCon&&(!party.includes(fCon)||fCon===a||fCon.lock))fCon=null;const d=$('doF');
  if(a&&fOpt=='con'&&d){d.disabled=!fCon;d.textContent=fCon?'🍽️ Consume '+fCon.n:'🍽️ Consume'}}catch(_){}}}
$('fz').addEventListener('click',e=>{const g=e.target.closest('[data-fcon]');if(g){e.stopPropagation();if(g.disabled)return;fCon=party[+g.dataset.fcon]||null;rF()}},true);
{const f=$('doF').onclick;$('doF').onclick=function(){
  if(fOpt!='con')return f.apply(this,arguments);
  const a=party[sel[0]],b=fCon;if(!a||!b||b===a||!party.includes(b)||b.lock)return;
  ivFix(a);const g=conGainC(b),up=[];
  IVK.forEach(k=>{const o=ivOf(a,k),n=Math.min(1.3,o+g*(.8+Math.random()*.4));a.iv[k]=n;if(grade(n)[1]!=grade(o)[1])up.push(IVS[k]+' '+grade(o)[1]+'→'+grade(n)[1])});ivSync(a);
  if(b.emp)b.emp=false;party=party.filter(c=>c!==b);sel=[party.indexOf(a)];cmpSel=Math.max(0,party.indexOf(a));a.h=Math.min(M(a),a.h+Math.round(M(a)*.1));fCon=null;
  say('🍽️ '+nm(a)+' absorbed '+b.n+' · every base stat +'+pctS(g)+(up.length?' ('+up.join(', ')+')':''));if(typeof sfx=='function')sfx('chime');hsDirty();ui();rF()}}

// ---------------- Beast Trainer: one purchase raises a companion to your level ----------------
// each level costs about 1.9 × (level + 1.1) gold: Lv 1→20 ≈ 400, Lv 10→20 ≈ 315, Lv 1→40 ≈ 1,560
function trainCost(c){const a=c.l,b=Math.min(hero.lvl,MAXLV);if(b<=a)return 0;const n=b-a,sum=(a+b-1)*n/2;return shpP109('trainer',Math.max(10,Math.round(1.9*(sum+1.1*n))))} // v109: Beast Trainer discount
{const f=XR.visitor;XR.visitor=function(){const r=f.apply(this,arguments);try{const B=$('xwB'),rows=B&&B.querySelectorAll('[data-vtrain]');if(rows&&rows.length){
  const dtl=B.querySelector('.dtl');if(dtl)dtl.textContent='One training session raises a companion straight to your level. The bigger the gap, the more it costs.';
  rows.forEach(bt=>{const c=party[+bt.dataset.vtrain];if(!c)return;const cost=trainCost(c),ok=cost>0;bt.disabled=!ok||gold<cost;bt.textContent=ok?'Train to Lv '+Math.min(hero.lvl,MAXLV)+' · 🪙 '+cost:'At your level'})}}catch(_){}return r}}
$('xw').addEventListener('click',e=>{if(xwMode!='visitor')return;const t=e.target.closest('[data-vtrain]');if(!t)return;e.stopImmediatePropagation();if(t.disabled)return;
  const c=party[+t.dataset.vtrain];if(!c)return;const cost=trainCost(c);if(!cost||gold<cost)return;const to=Math.min(hero.lvl,MAXLV),from=c.l;
  gold-=cost;c.l=to;c.x=0;c.h=M(c);say('💪 '+c.n+' trained hard: Lv '+from+' → Lv '+to+'!'+(EVLV.some(v=>v>from&&v<=to)?' ✨ It can evolve now (Companions menu).':''));if(typeof sfx=='function')sfx('power');hsDirty();ui();hud();if(XR.visitor)XR.visitor()},true);

// ---------------- (v103: the courtyard garden that grew with every completed zone is gone) ----------------
// repaint one minimap tile from MAP (used when tiles change at runtime: building lots)
function mmPaint(x,y){try{const c=mmB.getContext('2d'),t=MAP[y][x],bm=BIOMES[MAP.bio[y][x]],b=t=='R'?[96,92,88]:t=='W'?[196,188,170]:t=='B'?[168,126,92]:t=='P'?[200,190,164]:t=='p'?[168,140,96]:t=='#'?bm.frs.map(v=>v*.8):t=='~'?bm.wat:t=='g'?bm.grs:t=='a'?bm.acc:bm.gnd;
  c.fillStyle='rgb('+(b[0]|0)+','+(b[1]|0)+','+(b[2]|0)+')';c.fillRect(x,y,1,1)}catch(_){}}

