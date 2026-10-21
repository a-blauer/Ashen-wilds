// =============== 9. GEAR SETS & LEGENDARIES ===============
const SETS={
 storm:{n:'Stormcaller',i:'⚡',b2:['+8% attack speed',{as:.08}],b4:['Basic attacks have a 15% chance to call lightning on the target',{setStorm:1}]},
 bulwark:{n:'Bulwark',i:'🛡️',b2:['+10% damage reduction',{dr:.1}],b4:['+40% thorns and +1% health regeneration per second',{thorns:.4,regen:.01}]},
 blood:{n:'Bloodmoon',i:'🩸',b2:['+5% lifesteal',{ls:.05}],b4:['+25% damage while below half health',{berserk:.25}]},
 beast:{n:'Beastmaster',i:'🐾',b2:['+15% companion damage',{compP:.15}],b4:['Empowering a companion is 20% stronger',{empP:.2}]},
 arcane:{n:'Arcanist',i:'🔮',b2:['+12% skill damage',{skillP:.12}],b4:['−15% cooldowns and your class resource builds 30% faster',{cdr:.15,setArc:1}]},
 shadow:{n:'Nightshade',i:'🌑',b2:['+6% critical chance',{crit:.06}],b4:['+40% critical damage and +30% damage on your first hit',{cdm:.4,first:.3}]}};
const SETK=Object.keys(SETS);
const LP={
 split:{n:'Splitting Fireball',cls:'mage',d:'Fireball splits into three fireballs.'},
 storm:{n:'Stormheart',cls:null,d:'12% of your hits zap two nearby enemies with lightning.'},
 echo:{n:'Echoing Cleave',cls:'warrior',d:'Cleave strikes a second time a moment later.'},
 nova:{n:'Radiant Nova',cls:'paladin',d:'Divine Barrier and Lay on Hands blast nearby enemies with holy light.'},
 venom:{n:'Venom Rush',cls:'assassin',d:'Shadow Rush leaves a deadly poison on everything it cuts.'},
 splinter:{n:'Splinter Shot',cls:'ranger',d:'Piercing Arrow splits into three arrows.'},
 phoenix:{n:'Phoenix Heart',cls:null,d:'Once every 3 minutes, survive a killing blow with 30% health.'},
 hunger:{n:'Bottomless Hunger',cls:null,d:'Kills restore 5% of your max health.'}};
function genItem(l,o){const it=genItem_base(l,o);
  if(it.r>=4){const tp=ITPL[it.tp],c=tp.cls||(tp.arm?ARMC[tp.arm][0]:null),pool=Object.keys(LP).filter(k=>!LP[k].cls||(tp.sl=='weapon'&&LP[k].cls==c));const own=pool.filter(k=>LP[k].cls);const src=own.length&&Math.random()<.6?own:pool;it.lp=src[R(0,src.length-1)]}
  else if(it.r>=2&&Math.random()<.2)it.set=SETK[R(0,SETK.length-1)];
  return it}
const eqItems=()=>SLOTS.map(k=>eq[k]).filter(it=>it&&canUse(it));
const lpHas=k=>eqItems().some(it=>it.lp==k);
function setCount(k){return eqItems().filter(it=>it.set==k).length}
function gearX(s){SETK.forEach(k=>{const n=setCount(k),S=SETS[k];const add=o=>{for(const q in o)s[q]=(s[q]||0)+o[q]};if(n>=2)add(S.b2[1]);if(n>=4)add(S.b4[1])});if(lpHas('hunger'))s.killheal=(s.killheal||0)+.05}
function idHTML(){let h=idHTML_base();const it=selI&&(selI.k=='e'?SLOTS.map(k=>eq[k]).find(x=>x&&x.id==selI.id):gear.find(x=>x.id==selI.id));if(!it)return h;
  if(it.lp){const L=LP[it.lp];h+=`<div class="lpbox"><b>★ Legendary power: ${L.n}</b><span>${L.d}</span></div>`}
  if(it.set){const S=SETS[it.set],n=setCount(it.set);h+=`<div class="setbox"><b>${S.i} ${S.n} set (${n}/4 equipped)</b><span class="${n>=2?'on':''}">(2) ${S.b2[0]}</span><span class="${n>=4?'on':''}">(4) ${S.b4[0]}</span></div>`}
  return h}
function lpCast(sk){if(!sk)return;const P=pl.position,d=aimDir(),mt=sk.mt||CLS[hero.cls].mt,raw=atkOf(mt)*(sk.m||1)*(1+HS().skillP);
  const rot=(v,a)=>V(v.x*Math.cos(a)-v.z*Math.sin(a),0,v.x*Math.sin(a)+v.z*Math.cos(a));
  if(sk.n=='Fireball'&&lpHas('split'))[-.3,.3].forEach(a=>launch(P,rot(d,a),16,{col:sk.col,mt:'m',big:1,fx:{burn:4}},raw*.6,1.0));
  if(sk.n=='Piercing Arrow'&&lpHas('splinter'))[-.22,.22].forEach(a=>launch(P,rot(d,a),26,{col:sk.col,arrow:1,mt:'p',pierce:6},raw*.6,.6));
  if(sk.n=='Cleave'&&lpHas('echo'))setTimeout(()=>{area(pl.position,(sk.r||3.2),raw*.65,{col:sk.col,mt:'p'},aimDir(),1.1);burst(gY(pl.position,1),sk.col,30,3,2,.5);sfx('slash')},320);
  if((sk.n=='Divine Barrier'||sk.n=='Lay on Hands')&&lpHas('nova')){ring(P,0xffe08a,4.5,400);burst(gY(P,1),0xffe08a,60,4.5,3,.6);area(P,4.5,atkOf('p')*2.4,{col:0xffe08a,mt:'p'},null,0);sfx('boom',.6)}
}
function phxReady(){return lpHas('phoenix')&&nowP()-(hero.phT||-1e9)>180000}
function down(){
  if(phxReady()){hero.phT=nowP();hero.hp=heroMax()*.3;hero.iv=Math.max(hero.iv||0,1.2);popT(pl.position,'🔥 PHOENIX HEART','#fb923c',true);flash('rgba(251,146,60,.4)');burst(gY(pl.position,1),0xff8a3a,80,4,4,.9);sfx('power');hud();return}
  if(riding)dismount();arenaFail();return down_base()}

