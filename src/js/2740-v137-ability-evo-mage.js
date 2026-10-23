// ================= v137 evolved abilities: Mage (arcane azure and violet, frost, fire and stars) =================
Object.assign(EVO137,{
 'Fireball':{en:'Phoenix Barrage',d:'Hurls three fireballs in a spread instead of one.',mod:{n2:3}},
 'Frost Nova':{en:'Absolute Zero',d:'Freezes everything within 4.8 tiles for 2.4s, and a ring of ice spikes bursts from the ground.',mod:{r:'*1.45',stun:2.4},
  post(c){const P=c.P.clone();ev137Shards(P,0x9fe3ff,18,c.R*.85,1.5,1300);ev137Shock(P,0xdff6ff,c.R,620);ev137Sigil(P,0x9fe3ff,c.R,900,1)}},
 'Chain Lightning':{en:'Storm Lattice',d:'The lightning jumps between up to 8 enemies instead of 4.',mod:{jumps:8}},
 'Meteor':{en:'Cataclysm',d:'A wider impact, followed by two more meteors crashing down around it.',mod:{r:'*1.3'},
  post(c){const p=(c.gp||aimPoint(10)).clone(),C=evC();[0,1].forEach(j=>{const a=Math.random()*6.283,q=kqsV(p.x+Math.cos(a)*2.8,p.z+Math.sin(a)*2.8),dl=1.35+j*.3;
   tele(q,2.4,dl,()=>{evSlam(q,0xff7a2a,2.4);burst(gY(q,.4),0xff5a1a,40,2.4,3,.8);evArea(c,q,2.4,c.raw*.55,{burn:1});shake(.2)});setTimeout(()=>ev137Fall(q,0xff7a2a,'comet',600),dl*1000-600)});
   setTimeout(()=>ev137Fall(p,0xffa040,'comet',600),c.sk.delay*1000-600)}},
 'Arcane Missiles':{en:'Arcane Torrent',d:'Seven seeking bolts instead of three.',mod:{n2:7}},
 'Blizzard':{en:'Eternal Winter',d:'The storm covers a 45% wider area for 50% longer.',mod:{r:'*1.45',ticks:15},
  post(c){const p=(c.gp||aimPoint(10)).clone();ev137Sigil(p,0x9fe3ff,c.R,15*.4*1000+300,0);let ti=0;kqsObj({life:15*.4,tick:dt=>{ti-=dt;if(ti>0)return;ti=.5;const a=Math.random()*6.283,r=Math.sqrt(Math.random())*c.R*.8;ev137Shards(kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r),0xbfefff,4,.4,.8,700)}})}},
 'Mana Shield':{en:'Arcane Aegis',d:'Absorbs 60% of your max health for 10s, and a burst of arcane force hurls nearby enemies back.',mod:{v:.6,dur:10},
  post(c){const P=pl.position.clone(),C=evC();ev137Shock(P,C.c1,4.5,560);ev137Orbit(P,C.c2,1.2,1100);kqsFoes(P,4.5).forEach(e=>{evHit(c,e,c.A*.8);if(e.boss)return;const d=kqsDir(P,e.m.position);e.vx+=d.x*9;e.vz+=d.z*9})}},
 'Blink':{en:'Rift Walk',d:'Teleport up to 12 tiles, and you arrive in an arcane explosion.',mod:{rng:12},
  post(c){const p=pl.position.clone(),C=evC();ev137Rift(c.P0||c.evO||p,p,C.c2,600);ev137Shock(p,C.c1,2.8,460);ev137Flare(gY(p,1),C.c2,1.6,300);evArea(c,p,2.8,c.raw*1.2)},pre(c){c.evO=pl.position.clone()}},
 "Dragon's Breath":{en:'Wyrmfire',d:'The cone of fire reaches 7.5 tiles and leaves three patches of burning ground.',mod:{r:7.5},
  post(c){const P=c.P.clone(),d=c.d;ev137Crescent(P,d,0xff7a2a,c.R*.8,380);[[0,3],[-.35,5.2],[.35,5.2]].forEach(([a,t])=>{const q=evAt(P,evRot(d,a),t);zoneAt(q,1.7,c.A*.25,c.mt,0xff6a1a,6,.5,{});ev137Sigil(q,0xff6a1a,1.7,3200,1)})}},
 'Frozen Orb':{en:'Glacial Twins',d:'Two orbs of ice fly out side by side instead of one.',
  run(c,f){const d=c.d;let r;try{r=f(Object.assign({},c,{d:evRot(d,-.2)}));f(Object.assign({},c,{d:evRot(d,.2)}))}catch(err){console.error(err)}return r}},
 'Rift Gate':{en:'Astral Gateway',d:'Portals up to 20 tiles apart that stay open for 14s.',mod:{rng:20,dur:14},
  post(c){const C=evC();ev137Column(c.P0||c.P,C.c2,5,.5,700,.7);ev137Column(pl.position,C.c2,5,.5,700,.7)}},
 'Time Warp':{en:'Stasis Field',d:'Time bends over a 6.5-tile circle for 9s.',mod:{r:6.5,dur:9},
  post(c){const p=c.gp.clone();ev137Sigil(p,0x8ad8ff,c.R,9000*.4,0);ev137Sigil(p,0xdff6ff,c.R*.6,9000*.3,0)}},
 'Disintegrate':{en:'Annihilation Ray',d:'Channel for 3.2s: the beam reaches 14 tiles and is 45% wider.',mod:{dur:3.2},
  run(c){kqsSnd('beam');const C=evC();kqsChan({t:c.sk.dur,iv:.2,slow:.6,tick:()=>{const d=aimDir();face(d);const o=gY(pl.position,1.15).addScaledVector(d,.6),e=o.clone().addScaledVector(d,14);
   ev137Lance(o,e,C.c2,.16,230);ev137Flare(o.clone().addScaledVector(d,.3),C.c1,.9,200);ev137Flare(e,C.c2,.9,200);
   kqsLine(pl.position,d,14,1.9).forEach(q=>{kqsHit(q,c.raw,c,{proc:false});burst(gY(q.m.position,1),0xc890ff,4,1,1,.3)});if(Math.random()<.4)kqsPose('cast',220)}});return true}},
 'Wall of Fire':{en:'Inferno Rampart',d:'An 11-tile wall of fire that burns for 9s.',mod:{L:11,dur:9},
  post(c){const p=c.gp.clone(),d=kqsDir(c.P,p),n=kqsV(-d.z,d.x);ev137Rift(kqsV(p.x-n.x*c.sk.L/2,p.z-n.z*c.sk.L/2),kqsV(p.x+n.x*c.sk.L/2,p.z+n.z*c.sk.L/2),0xff7a2a,9000)}},
 'Chronoshift':{en:'Temporal Paradox',d:'Also halves the cooldowns of your other abilities and heals 15% of your max health.',
  post(c){for(const k in hero.cd)if(k!==c.key)hero.cd[k]=(hero.cd[k]||0)*.5;healHero(heroMax()*.15*c.rk);const C=evC();ev137Sigil(pl.position,0x9ad8ff,3,1200,0);ev137Orbit(pl.position,0xdff6ff,1.2,1000)}},
 'Singularity':{en:'Event Horizon',d:'A 7-tile singularity that pulls for 4s before it collapses.',mod:{r:7,dur:4},
  post(c){const p=c.gp.clone(),C=evC();ev137Sigil(p,C.c1,c.R,4000,0);setTimeout(()=>{ev137Shock(p,C.c2,c.R,700);ev137Column(p,C.c1,10,1.4,800)},4000)}},
 'Comet Storm':{en:'Starfall Apocalypse',d:'Fourteen comets instead of eight, over an 8-tile area.',mod:{r:8,rng:14},
  post(c){const p=c.gp.clone(),C=evC(),K=[0xff7a2a,0x9fe3ff,0xfff06a];for(let j=0;j<6;j++)setTimeout(()=>{const a=Math.random()*6.283,r=Math.sqrt(Math.random())*c.R*.85,q=kqsV(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r),col=K[j%3];
   kqsWarn(q,2,col,.5,()=>{});ev137Fall(q,col,j%2?'comet':'star',500);setTimeout(()=>{evArea(c,q,2,c.raw,j%3==0?{burn:1}:j%3==1?{stun:.5}:{});shake(.1)},500)},150+j*360)}}
});
