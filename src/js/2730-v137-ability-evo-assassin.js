// ================= v137 evolved abilities: Assassin (violet shadow, magenta edges, venom green) =================
Object.assign(EVO137,{
 'Shadow Rush':{en:'Umbral Rift',d:'The path you dash along tears open behind you and detonates half a second later, cutting everything near it.',
  post(c){const A=c.P0?c.P0.clone():c.P.clone(),C=evC();setTimeout(()=>{const B=pl.position.clone(),d=kqsDir(A,B),L=d2(A,B);if(L<1)return;ev137Rift(A,B,C.c1,900);
   setTimeout(()=>{for(let t=0;t<=L;t+=1.6)ev137Flare(gY(evAt(A,d,t),.6),C.c2,1,260);kqsLine(A,d,L,2.6).forEach(e=>evHit(c,e,c.raw*.7));shake(.12)},420)},520)}},
 'Fan of Knives':{en:'Storm of Blades',d:'Eighteen knives instead of ten, and a second ring of blades follows a moment later.',mod:{n2:18},
  post(c){const P=c.P.clone();setTimeout(()=>{for(let j=0;j<12;j++){const a=(j+.5)/12*6.283,dd=kqsV(Math.sin(a),Math.cos(a));launch(P,dd,18,{col:c.sk.col,mt:c.mt,arrow:0},c.raw*.6,.6)}},180)}},
 'Poison Blades':{en:'Black Widow Venom',d:'Lasts 15s, and while it does you also gain +10% attack speed and +10% critical chance.',mod:{dur:15,buff:{poisonOn:1,as:.1,crit:.1}},
  post(c){const C=evC();ev137Orbit(pl.position,0x7aff6a,1.1,1000)}},
 'Death Mark':{en:'Mark of Oblivion',d:'Marks your target and the 2 enemies nearest to it: they take 50% more damage (instead of 35%) for 12s.',mod:{v:.5,dur:12},
  post(c){const C=evC(),t=evNearest(pl.position,9)[0];if(!t)return;ev137Sigil(t.m.position,C.c2,1.6,1100,1);evNearest(t.m.position,7,new Set([t])).slice(0,2).forEach(e=>{e.mark=c.sk.dur;e.markV=c.sk.v*kqrU(c.sk);
   kqsSpark(gY(t.m.position,1.2),gY(e.m.position,1.2),C.c1);ev137Sigil(e.m.position,C.c2,1.4,1000,1);dn(e.m.position,'Marked','#ff6a9a',-36,1000)})}},
 'Smoke Bomb':{en:'Nightfall Veil',d:'A 40% wider blast that stuns for 2s and leaves a cloud of night for 4s that weakens and slows enemies inside.',mod:{r:'*1.4',stun:2},
  post(c){const P=c.P.clone(),C=evC();ev137Shock(P,C.c1,c.R,600);let ti=0;kqsObj({life:4,tick:dt=>{for(let k=0;k<2;k++){const a=Math.random()*6.283,r=Math.random()*c.R;evxPuff(gY(kqsV(P.x+Math.cos(a)*r,P.z+Math.sin(a)*r),.3+Math.random()),{col:0x2a2238,r0:.5,r1:1.4,life:1.4,op:.5,v:[0,.3,0],drag:1,geo:'dod',fin:.2})}
   ti-=dt;if(ti>0)return;ti=.5;kqsFoes(P,c.R).forEach(e=>eStatus(e,{weak:1,slow:1},0))}})}},
 'Shuriken Volley':{en:'Thousand Stars',d:'Seven shuriken instead of three, in a wider spread.',mod:{n2:7}},
 'Shadow Dance':{en:'Dance of Death',d:'+50% attack speed, +30% critical chance and +15% move speed for 12s.',mod:{buff:{as:.5,crit:.3,mspd:.15},dur:12},
  post(c){const C=evC();ev137Orbit(pl.position,C.c1,1.2,1200);ev137Orbit(pl.position,C.c2,.8,900)}},
 'Eviscerate':{en:'Exsanguinate',d:'Three phantom blades follow the strike, slashing the target and everything within 2.4 tiles of it.',
  pre(c){c.evT=kqsNear(5)},post(c){const t=c.evT;if(!t)return;const C=evC(),t0=110+evLungeMs(t);for(let j=0;j<3;j++)setTimeout(()=>{if(!t.m)return;const p=t.m.position.clone(),a=Math.random()*6.283;
   ev137Crescent(kqsV(p.x-Math.sin(a)*1.2,p.z-Math.cos(a)*1.2),kqsV(Math.sin(a),Math.cos(a)),j%2?C.c2:C.c1,2.4,220);evArea(c,p,2.4,c.raw*.35);burst(gY(p,1),0xe04a6a,10,1.6,1.6,.4)},t0+90+j*110)}},
 'Venom Flask':{en:'Plague Cask',d:'Thrown up to 12 tiles, the poison cloud is 40% wider and lingers for 9s.',mod:{r:'*1.4',dur:9,rng:12},
  post(c){const p=c.gp.clone(),C=evC();setTimeout(()=>{ev137Shock(p,0x8ad84a,c.R,600);ev137Sigil(p,0x7ae04a,c.R,1600,1)},400)}},
 'Vanish':{en:'Shroud of Night',d:'Stay hidden for 6s, and you vanish in a burst of shadow that stuns enemies within 3.5 tiles.',mod:{dur:6},
  post(c){const P=pl.position.clone(),C=evC();ev137Shock(P,C.c1,3.5,520);ev137Rift(kqsV(P.x-1.5,P.z),kqsV(P.x+1.5,P.z),C.c1,800);kqsFoes(P,3.5).forEach(e=>eStatus(e,{stun:1.2},0,'h'))}},
 'Shadow Clone':{en:'Shadow Legion',d:'Two shadow doubles instead of one, and they stay for 10s.',mod:{dur:10},
  run(c,f){const r=f(c);const ry=pl.rotation.y;pl.rotation.y=ry+Math.PI;try{f(c)}finally{pl.rotation.y=ry}const C=evC();ev137Rift(kqsV(c.P.x-1.6,c.P.z),kqsV(c.P.x+1.6,c.P.z),C.c1,800);return r}},
 'Phantom Strike':{en:'Phantom Tempest',d:'Reaches 12 tiles, the slash is 45% wider, and an echo of the strike tears through the spot you left.',mod:{r:'*1.45',rng:12},
  pre(c){c.evO=pl.position.clone()},post(c){const o=c.evO,C=evC();setTimeout(()=>{ev137Rift(o,pl.position.clone(),C.c1,900)},80);setTimeout(()=>{ev137Shock(o,C.c2,2.6,420);ev137Flare(gY(o,1),C.c1,1.4,300);evArea(c,o,2.6,c.raw*.6)},380)}},
 'Caltrops':{en:'Field of Thorns',d:'The caltrops cover a 50% wider area for 12s.',mod:{r:'*1.5',dur:12},
  post(c){const p=c.gp.clone(),C=evC();ev137Sigil(p,C.c2,c.R,1200,1);ev137Shards(p,0xb0b0c0,14,c.R*.8,.5,1100)}},
 'Garrote':{en:'Strangling Shadows',d:'Silences for 2s, and shadow wires lash out to 2 more enemies nearby, choking them and making them bleed.',mod:{stun:2},
  pre(c){c.evT=kqsNear(5)},post(c){const t=c.evT;if(!t)return;const C=evC();setTimeout(()=>{if(!t.m)return;evNearest(t.m.position,6,new Set([t])).slice(0,2).forEach(e=>{kqsChain(gY(t.m.position,1.3),gY(e.m.position,1.3),C.c1,320);
   evHit(c,e,c.raw*.5);eStatus(e,{stun:1,bleed:6},c.A*.5,'h');dn(e.m.position,'Silenced','#fca5a5',-30,900)})},200+evLungeMs(t))}},
 'Thousand Cuts':{en:'Ten Thousand Cuts',d:'Flicker between up to 10 enemies within 11 tiles; every strike also cuts the enemies around its target.',
  run(c){const L=enemies.filter(e=>!e.dead&&d2(e.m.position,pl.position)<11).sort((a,b)=>d2(a.m.position,pl.position)-d2(b.m.position,pl.position)).slice(0,10);if(!L.length)return false;const C=evC();
   hero.iv=Math.max(hero.iv||0,L.length*.15+.3);let j=0;kqsSnd('shadow');const step=()=>{const e=L[j];if(e&&!e.dead){const a=e.m.position,an=Math.random()*6.283,o=pl.position.clone(),q=kqsLand(a,kqsV(a.x+Math.cos(an)*1.1,a.z+Math.sin(an)*1.1));
     ev137Rift(o,q,j%2?C.c2:C.c1,420);kqsTp(q);face(kqsDir(q,a));ev137Flare(gY(q,1),C.c2,1,220);kqsHit(e,c.raw,c,{crit:true});kqsFoes(a,1.6).forEach(f=>{if(f!==e)evHit(c,f,c.raw*.4)});
     ev137Crescent(q,kqsDir(q,a),C.c1,1.8,200);sfx('stab');kqsPose('dash',140)}j++;if(j<L.length)setTimeout(step,150);else ev137Shock(pl.position,C.c1,2.6,360)};step();return true}},
 'Envenom':{en:'Venom Supernova',d:'Reaches 11 tiles instead of 8, and the burst poisons every enemy it touches again.',mod:{r:11},
  post(c){const P=pl.position.clone();ev137Shock(P,0x8ad84a,c.R,700);ev137Sigil(P,0x7ae04a,c.R,900,1);kqsFoes(P,c.R).forEach(e=>eStatus(e,{poison:4},c.A*.3*(1+(c.s.poisonP||0))))}},
 'Eclipse':{en:'Total Eclipse',d:'The darkness covers a 7-tile circle up to 12 tiles away and lasts 8s.',mod:{r:7,dur:8,rng:12},
  post(c){const p=c.gp.clone(),C=evC();ev137Sigil(p,C.c1,c.R,2200,0);ev137Column(p,0x2a0a4a,9,1.2,900)}}
});
