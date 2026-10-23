// ================= v137 evolved abilities: Warrior (molten orange and gold, rock and steel) =================
Object.assign(EVO137,{
 'Cleave':{en:'Rending Crescent',d:'A 40% wider sweep that also hurls a crescent of force 8 tiles ahead, cutting everything in its path.',mod:{r:'*1.4'},
  post(c){const C=evC();ev137Crescent(c.P,c.d,C.c1,8,460);setTimeout(()=>ev137Crescent(c.P,c.d,C.c2,7,420),60);evWave(c,c.P,c.d,8,2.2,c.raw*.6,17)}},
 'Leap Slam':{en:'Meteor Leap',d:'Leap up to 10 tiles; the landing is 50% wider, stuns longer, and two aftershocks ripple out.',mod:{r:'*1.5',rng:10,stun:1.4},
  post(c){setTimeout(()=>{const p=pl.position.clone(),C=evC();evSlam(p,C.c1,c.R*1.2);[0,300].forEach((t,j)=>setTimeout(()=>{ev137Shock(p,j?C.c2:C.c1,c.R*(1.7+j*.5),520);evRing(p,c.R*.8,c.R*(1.7+j*.5)).forEach(e=>evHit(c,e,c.raw*.45,{stun:.3}))},160+t))},440)}},
 'War Cry':{en:"Warlord's Roar",d:'+45% physical attack, 22% damage reduction and +15% attack speed for 12s, and enemies within 7 are weakened.',mod:{buff:{paP:.45,dr:.22,as:.15},dur:12},
  post(c){const C=evC(),P=pl.position;ev137Shock(P,C.c1,7,620);setTimeout(()=>ev137Shock(P,C.c2,5,480),120);kqsFoes(P,7).forEach(e=>{eStatus(e,{weak:5},0);dn(e.m.position,'Weakened','#fca5a5',-30,900)});try{popT(P,"WARLORD'S ROAR",'#fdba74',true)}catch(_){}shake(.15)}},
 'Whirlwind':{en:'Bladestorm',d:'Spin for 3.4s in a 35% larger storm of blades that drags nearby enemies into the edge.',mod:{r:'*1.35',dur:3.4},
  post(c){const C=evC();let ti=0,a=0;kqsObj({life:3.6,tick:(dt,now,o)=>{if(!hero.chan)return false;const P=pl.position;a+=dt*11;ti-=dt;
    kqsFoes(P,c.R+2.6).forEach(e=>{if(e.boss)return;const v=kqsV(P.x-e.m.position.x,P.z-e.m.position.z),L=v.length();if(L>c.R*.7)walkM(e.m,v.x/L*2.6*dt,v.z/L*2.6*dt)});
    if(ti>0)return;ti=.14;ev137Crescent(P,kqsV(Math.sin(a),Math.cos(a)),(Math.random()<.5?C.c1:C.c2),c.R*.55,260);if(Math.random()<.35)ev137Shock(P,C.c1,c.R,300)}})}},
 'Shockwave':{en:'Earthsplitter',d:'Three shockwaves instead of one: two more rip out to the sides in a fan.',
  post(c){const C=evC();setTimeout(()=>[-.42,.42].forEach(a=>{const d=evRot(c.d,a);evWave(c,c.P,d,9,2.2,c.raw*.8,26,(q,j)=>{if(j%2)ev137Shards(q,C.c1,4,.5,.9,520);burst(gY(q,.3),0xb08a60,6,1.4,2,.5)})}),300)}},
 'Iron Skin':{en:'Adamant Bulwark',d:'Absorbs 50% of your max health for 8s, and when the shield breaks or ends it bursts into steel shards.',mod:{v:.5,dur:8},
  post(c){const C=evC();ev137Orbit(pl.position,C.c2,1.2,900);let done=0;const boom=()=>{if(done)return;done=1;const P=pl.position.clone();evSlam(P,C.c2,3.2);evArea(c,P,3.2,c.A*1.6);shake(.2);kqsSnd('thud')};
   kqsObj({life:8.2,tick:()=>{if(!(hero.sh>0)||performance.now()>hero.shT){boom();return false}},end:boom})}},
 'Earthshatter':{en:'World Breaker',d:'The crack is 35% wider and stuns for 1.8s, then a second ring of erupting stone bursts further out.',mod:{r:'*1.35',stun:1.8},
  post(c){const C=evC(),P=c.P.clone();evSlam(P,C.c1,c.R);setTimeout(()=>{ev137Shards(P,C.c1,16,c.R*1.25,1.7,900);ev137Shock(P,C.c2,c.R*1.6,560);evRing(P,c.R*.8,c.R*1.6).forEach(e=>evHit(c,e,c.raw*.6,{stun:.8}));shake(.3);kqsSnd('quake')},300)}},
 'Bull Rush':{en:'Juggernaut',d:'Charge 50% further, and the charge ends in a shockwave that stuns everything around you.',
  pre(c){c.evN0=KQS.objs.length},post(c){evStretch(c,1.5);const T=(hero.dash?hero.dash.t:.75)+.05,C=evC();
   kqsObj({life:T,tick:()=>{if(Math.random()<.5)ev137Flare(gY(pl.position,1),C.c1,.9,200)},end:()=>{const P=pl.position.clone();evSlam(P,C.c1,2.8);evArea(c,P,2.8,c.raw*.6,{stun:.6});shake(.2)}})}},
 'Intimidating Shout':{en:'Dread Roar',d:'Reaches 9 tiles instead of 6 and hurls the enemies it terrifies back.',mod:{r:9},
  post(c){const C=evC(),P=c.P;ev137Shock(P,C.c1,c.R,700);setTimeout(()=>ev137Shock(P,C.c2,c.R*.7,500),150);kqsFoes(P,c.R).forEach(e=>{if(e.boss)return;const d=kqsDir(P,e.m.position);e.vx+=d.x*8;e.vz+=d.z*8;eStatus(e,{stun:.6},0)})}},
 'Skull Splitter':{en:'Skullquake',d:'The blow cracks the ground: everything within 3 tiles of the target is hit and starts bleeding.',
  pre(c){c.evT=kqsNear(5.2)},post(c){const t=c.evT;if(!t)return;const C=evC();setTimeout(()=>{if(!t.m)return;const p=t.m.position.clone();evSlam(p,C.c1,3);ev137Fall(p,C.c2,'axe',1);
   evArea(c,p,3,c.raw*.7).forEach(e=>eStatus(e,{bleed:6},c.A*.4))},200+evLungeMs(t))}},
 'Seismic Rupture':{en:'Tectonic Rift',d:'A 15-tile fissure, 45% wider, that erupts a second time half a second later.',mod:{L:15,rng:15,w:3.2},
  post(c){const C=evC(),P=c.P.clone(),d=kqsDir(P,c.gp),L=Math.max(3,Math.min(c.sk.L,d2(P,c.gp)));ev137Rift(P,evAt(P,d,L),C.c1,1600);
   setTimeout(()=>{evWave(c,P,d,L,c.sk.w,c.raw*.5,30,(q,j)=>{if(j%2==0)ev137Shards(q,C.c1,5,.8,1.4,700);ev137Column(q,C.c2,2.2,.35,360)})},Math.ceil(L)*45+380)}},
 'War Banner':{en:'Standard of the Legion',d:'A 7-tile circle that stands for 18s, and every 2s the banner sends out a burning pulse.',mod:{r:7,dur:18},
  post(c){const p=c.gp.clone(),C=evC();ev137Column(p,C.c2,9,.8,900);let ti=1.2;kqsObj({life:c.sk.dur,tick:dt=>{ti-=dt;if(ti>0)return;ti=2;ev137Shock(p,C.c1,c.R,620);ev137Sigil(p,C.c2,c.R,700,1);evArea(c,p,c.R,c.A*.45)}})}},
 'Bloodrage':{en:'Crimson Frenzy',d:'No longer costs health; lasts 14s with +35% attack speed, +18% physical attack and 15% lifesteal.',mod:{dur:14},
  pre(c){c.evHp=hero.hp},post(c){if(c.evHp>hero.hp)hero.hp=c.evHp;evBuff('Bloodrage',kqrB(c.sk,{as:.35,paP:.18,ls:.15}),14);const C=evC();ev137Orbit(pl.position,0xff2030,1.2,1200);ev137Column(pl.position,0xff3040,6,.8,700)}},
 'Chain Hook':{en:'Kraken Chains',d:'Catches enemies in a 4-tile circle up to 13 tiles away, and they are slammed down a second time at your feet.',mod:{r:4,rng:13},
  post(c){setTimeout(()=>{const P=pl.position.clone(),C=evC();evSlam(P,C.c2,2.6);evArea(c,P,2.6,c.raw*.6,{stun:.6})},480)}},
 'Execute':{en:"Headsman's Verdict",d:'Spectral axes fall on up to 2 more enemies nearby; the low-health rule applies to each of them.',
  pre(c){c.evT=kqsNear(5.2)},post(c){const C=evC(),not=new Set([c.evT]);evNearest(pl.position,8,not).slice(0,2).forEach((e,j)=>{const p=e.m.position.clone();setTimeout(()=>{ev137Fall(e.m.position.clone(),C.c1,'axe',480);
   setTimeout(()=>{if(e.dead)return;const low=e.c.h/M(e.c)<.3;evHit(c,e,c.raw*(low?2.4:.8));burst(gY(e.m.position,1),0xff2a1a,low?40:20,2.4,2.4,.5);if(e.dead)popT(e.m.position,'EXECUTED','#ff4a3a',true)},480)},120+j*160)})}},
 'Unbreakable':{en:'Undying Colossus',d:'Lasts 11s, scorches enemies within 2.6 tiles every second, and heals twice as much when it ends.',mod:{dur:11},
  post(c){const C=evC();let ti=.5;ev137Column(pl.position,C.c2,7,1,800);kqsObj({life:c.sk.dur,tick:dt=>{ti-=dt;if(ti>0)return;ti=1;ev137Shock(pl.position,C.c1,2.6,420);evArea(c,pl.position,2.6,c.A*.5)},
   end:o=>{if(o.abort)return;healHero(heroMax()*.15*c.rk);ev137Orbit(pl.position,0x9affb0,1,800)}})}},
 "Titan's Fall":{en:'Worldshaker',d:'Lands in a 6-tile crater from up to 15 tiles away, followed by three aftershocks that rattle further out.',mod:{r:6,rng:15},
  post(c){setTimeout(()=>{const p=pl.position.clone(),C=evC();evSlam(p,C.c1,c.R);ev137Fall(p,C.c2,'hammer',1);[0,300,600].forEach((t,j)=>setTimeout(()=>{const r=c.R*(1.25+j*.3);ev137Shock(p,j%2?C.c2:C.c1,r,520);ev137Shards(p,C.c1,10,r*.9,1.2,700);evRing(p,c.R*.8,r).forEach(e=>evHit(c,e,c.raw*.35,{stun:.3}));shake(.2)},200+t))},660)}}
});
