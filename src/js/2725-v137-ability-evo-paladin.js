// ================= v137 evolved abilities: Paladin (gold and white light, swords and hammers from the sky) =================
Object.assign(EVO137,{
 'Holy Smite':{en:'Radiant Cataclysm',d:'The burst reaches 4 tiles, and six spears of light fall in a ring around you.',mod:{r:4},
  post(c){const C=evC(),P=c.P.clone();for(let j=0;j<6;j++){const a=j/6*6.283,q=kqsV(P.x+Math.cos(a)*c.R*.75,P.z+Math.sin(a)*c.R*.75);setTimeout(()=>{ev137Fall(q,j%2?C.c2:C.c1,'spear',380);setTimeout(()=>evArea(c,q,1.6,c.raw*.5),380)},j*60)}}},
 'Divine Barrier':{en:'Bastion of Dawn',d:'Absorbs 45% of your max health for 9s, and while it holds it sends out a searing pulse every 1.5s.',mod:{v:.45,dur:9},
  post(c){const C=evC();let ti=.6;ev137Orbit(pl.position,C.c2,1.3,900);kqsObj({life:9,tick:dt=>{if(!(hero.sh>0)||performance.now()>hero.shT)return false;ti-=dt;if(ti>0)return;ti=1.5;ev137Shock(pl.position,C.c1,3,480);evArea(c,pl.position,3,c.A*.4)}})}},
 'Consecration':{en:'Hallowed Ground',d:'The burning ground is 45% wider and lasts 8.4s instead of 6s.',mod:{r:'*1.45',ticks:14},
  post(c){const C=evC();let ti=0;kqsObj({life:14*.6,tick:dt=>{ti-=dt;if(ti>0)return;ti=.6;ev137Sigil(pl.position,C.c1,c.R,760,1);if(Math.random()<.5)ev137Column(kqsV(pl.position.x+(Math.random()-.5)*c.R,pl.position.z+(Math.random()-.5)*c.R),C.c2,3,.3,400)}})}},
 'Lay on Hands':{en:'Miracle',d:'Heals 60% of your max health, heals your companions by 40%, and holy light bursts out around you.',mod:{v:.6},
  post(c){const C=evC(),P=pl.position.clone();party.forEach(q=>{if(q&&q.h>0){q.h=Math.min(M(q),q.h+M(q)*.4)}});try{hud()}catch(_){}
   ev137Column(P,C.c2,10,1.2,900);ev137Shock(P,C.c1,4,600);evArea(c,P,4,c.A*1.6);ev137Orbit(P,0x9affb0,1.4,1000)}},
 'Judgment':{en:'Final Verdict',d:'Three swords of light fall instead of one: two more strike lines fanned out to the sides.',
  post(c){const C=evC(),P=c.P.clone();[-.5,.5].forEach(a=>{const d=evRot(c.d,a),q=evAt(P,d,6);ev137Fall(q,C.c2,'sword',425);setTimeout(()=>{ev137Lance(gY(P,.3),gY(evAt(P,d,9),.3),C.c1,.18,360);
   kqsLine(P,d,9,2.2).forEach(e=>evHit(c,e,c.raw*.85))},425)})}},
 'Hammer of Light':{en:'Hammerfall of the Heavens',d:'The hammer strikes a 40% wider area, and two more hammers fall on its flanks.',mod:{r:'*1.4'},
  post(c){const C=evC(),p=(c.gp||aimPoint(10)).clone(),n=kqsV(-c.d.z,c.d.x);[-1,1].forEach((s,j)=>{const q=kqsV(p.x+n.x*s*2.8,p.z+n.z*s*2.8);ev137Sigil(q,C.c1,2.2,1100,1);
   setTimeout(()=>ev137Fall(q,j?C.c2:C.c1,'hammer',520),400+j*120);setTimeout(()=>{evArea(c,q,2.2,c.raw*.6,{stun:.5});shake(.15)},920+j*120)})}},
 'Aegis':{en:'Aegis of the Ancients',d:'35% damage reduction and +30% defenses for 12s, guarded by three circling shields of light.',mod:{buff:{dr:.35,pdP:.3,mdP:.3},dur:12},
  post(c){const C=evC(),S=[0,1,2].map(()=>{const g=evxWeapon('star',C.c2);g.scale.setScalar(.45);scene.add(g);return g});
   kqsObj({life:12,tick:(dt,now,o)=>{S.forEach((g,j)=>{const a=o.age*2.4+j*2.094;g.position.set(pl.position.x+Math.cos(a)*1.25,pl.position.y+.9+Math.sin(o.age*3+j)*.15,pl.position.z+Math.sin(a)*1.25);g.rotation.y=-a})},end:()=>S.forEach(g=>evxRm(g))})}},
 'Shield Bash':{en:'Sundering Bash',d:'The bash sends a wave of force through everything in a cone in front of you, stunning them too.',
  post(c){setTimeout(()=>{const C=evC(),P=pl.position.clone(),d=aimDir();ev137Crescent(P,d,C.c1,3.8,300);ev137Crescent(P,d,C.c2,3,260);area(P,4,c.raw*.7,Object.assign({},c.fx,{stun:1,proc:false}),d,.8);shake(.15)},140)}},
 'Blessed Hammers':{en:'Hammers of Zeal',d:'Five hammers instead of three, for 8s: two more circle wider, the other way round.',mod:{dur:8},
  post(c){const H=[0,1].map(()=>{const h=kqsHammer();h.scale.setScalar(1.25);scene.add(h);return h}),last=new Map(),C=evC();
   kqsObj({life:c.sk.dur,tick:(dt,now,o)=>{const r=1.6+Math.min(1,o.age/.6)*2.2;H.forEach((h,j)=>{const a=-o.age*3.3+j*3.1416;h.position.set(pl.position.x+Math.cos(a)*r,pl.position.y+1.1,pl.position.z+Math.sin(a)*r);h.rotation.y=-a;h.rotation.z+=dt*12;
     if(Math.random()<.35)evxPuff(h.position.clone(),{spr:1,col:C.c2,r0:.4,r1:0,life:.3,op:.8});enemies.forEach(e=>{if(e.dead||d2(e.m.position,h.position)>1.05+(e.boss?1.2:0))return;const t=last.get(e)||{};if((t[j]||0)>now)return;t[j]=now+500;last.set(e,t);evHit(c,e,c.raw);ev137Flare(gY(e.m.position,1),C.c1,.9,220)})})},
    end:()=>H.forEach(h=>{burst(h.position,0xffe08a,10,1,1,.4);kqsRm(h)})})}},
 'Beacon of Light':{en:'Lighthouse of Faith',d:'A 6-tile circle that shines for 14s, with a pillar of light flaring above it every 2 seconds.',mod:{r:6,dur:14},
  post(c){const p=c.gp.clone(),C=evC();let ti=0;kqsObj({life:c.sk.dur,tick:dt=>{ti-=dt;if(ti>0)return;ti=2;ev137Column(p,C.c2,11,1,800);ev137Sigil(p,C.c1,c.R,900,1)}})}},
 "Crusader's Charge":{en:'Holy Avalanche',d:'Charge 50% further, leaving a trail of holy fire that burns enemies on it for 3s.',
  pre(c){c.evN0=KQS.objs.length;c.evP=pl.position.clone()},post(c){evStretch(c,1.5);const T=(hero.dash?hero.dash.t:.6)+.05,C=evC(),A=c.evP;
   kqsObj({life:T,end:()=>{const B=pl.position.clone();ev137Rift(A,B,C.c1,3000);let ti=0;kqsObj({life:3,tick:dt=>{ti-=dt;if(ti>0)return;ti=.5;const d=kqsDir(A,B),L=d2(A,B);kqsLine(A,d,L,1.8).forEach(e=>{evHit(c,e,c.A*.3);eStatus(e,{burn:2},c.A*.2)})}})}})}},
 'Sanctuary':{en:'Celestial Sanctum',d:'A 6.5-tile dome that holds for 9s, ringed by pillars of light.',mod:{r:6.5,dur:9},
  post(c){const p=c.gp.clone(),C=evC();for(let j=0;j<8;j++){const a=j/8*6.283;setTimeout(()=>ev137Column(kqsV(p.x+Math.cos(a)*c.R,p.z+Math.sin(a)*c.R),j%2?C.c1:C.c2,7,.4,900),j*50)}ev137Sigil(p,C.c1,c.R,1600,0)}},
 "Avenger's Shield":{en:'Aegis Storm',d:'Hurl two shields one after the other: each bounces between up to 5 enemies.',
  run(c,f){const r=f(c);if(r===false)return false;setTimeout(()=>{try{f(c)}catch(_){}},260);return r}},
 'Penance':{en:'Litany of Light',d:'Pray for 4s instead of 2.5s, and the searing light reaches 5 tiles.',mod:{dur:4,r:5},
  post(c){const C=evC();ev137Column(pl.position,C.c2,9,.7,1200);let ti=0;kqsObj({life:4,tick:dt=>{if(!KQS.ch)return false;ti-=dt;if(ti>0)return;ti=.5;ev137Sigil(pl.position,C.c1,c.R,560,1)}})}},
 'Seal of Light':{en:'Seal of the Sun',d:'For 18s your basic attacks deal 50% more damage, your magic attack is 25% higher and you heal for 10% of the damage you deal.',mod:{dur:18},
  post(c){evBuff('Seal of Light',kqrB(c.sk,{basicP:.5,maP:.25,ls:.1}),18);const C=evC();ev137Orbit(pl.position,C.c1,1.3,1200);ev137Column(pl.position,C.c2,8,.6,700)}},
 'Divine Intervention':{en:'Ascension',d:'Untouchable for 4.5s while spears of light strike enemies around you, then a 6-tile holy nova.',mod:{dur:4.5,r:6},
  post(c){const C=evC();ev137Column(pl.position,C.c2,14,1.3,1400);let ti=.3;kqsObj({life:c.sk.dur,tick:dt=>{ti-=dt;if(ti>0)return;ti=.5;const e=evNearest(pl.position,8)[Math.floor(Math.random()*3)];if(!e)return;const q=e.m.position.clone();
   ev137Fall(q,C.c1,'spear',380);setTimeout(()=>{if(!e.dead)evHit(c,e,c.A*.8)},380)}})}},
 "Heaven's Wrath":{en:'Judgement Day',d:'Twelve pillars strike a 7-tile area instead of six, and a giant sword of light lands for the final judgement.',mod:{r:7,rng:14},
  post(c){const p=c.gp.clone(),C=evC();for(let j=0;j<6;j++)setTimeout(()=>{const a=Math.random()*6.283,r=Math.sqrt(Math.random())*c.R*.85,q=kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r);ev137Sigil(q,C.c1,1.6,700,1);
    setTimeout(()=>{ev137Column(q,C.c2,12,.6,420);evArea(c,q,1.6,c.raw,{stun:0});shake(.06)},350)},140+j*280);
   setTimeout(()=>ev137Fall(p,C.c2,'sword',700),1050);setTimeout(()=>{ev137Shock(p,C.c1,c.R,700);evArea(c,p,c.R*.7,c.A*1.2)},1760)}}
});
