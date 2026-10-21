// ================= v107: every zone monster fights in its own way =================
// Before: the 18 monsters of the six portal zones shared ten generic moves, and 12 of them had a lunge (charge or pounce).
// Now each keeps one basic attack (strike / bite / spit / throw / bolt) and gets two signature moves of its own that
// fit what it is (MSIG107 lists them). No zone monster charges or pounces any more.
// A signature move is an ordinary MV entry (so the AI, the red ground warning, the pacing rules, co-op mirroring and the
// viewer all work as before) plus a small handler x6 with hooks:
//   start(e,a)   right after mStart (adjust the target spot, add extra warnings, drop the warning for self-buffs)
//   tick(e,a,ph,k,dt,now,P)   every frame (P = the body group pose: rx, ry, z, y)
//   rel(e,a)     wind-up ends (projectiles leave, the burrower dives)
//   land(e,a)    the act phase ends (most damage lands here)
//   when(e)      the AI only picks the move when this is true (the troll only regenerates when hurt)
// an: which body animation plays (creature rigs: bite, spit, slam, spin, pounce; humanoids: strike, slam, spin, throw, bolt, rainfire)
// nm / ic: the name and icon shown in the animation viewer.
// Damage only ever goes through hitTarget/hitHero, so co-op works the same as for the old moves (each player's game resolves
// the hits on its own hero). Self-heals only run on the monster's owner (not on co-op mirrors).
var SIG107={on:true};
function s6R(a,b){return a+Math.random()*(b-a)}
function s6T(a){return a&&a.tg&&a.tg.position?a.tg:null}
// is the attack's target inside a circle / cone / line? (same tolerances as the old moves)
function s6InC(a,c,r){const t=s6T(a);return !!t&&Math.hypot(t.position.x-c.x,t.position.z-c.z)<r*a.sz+.3}
function s6InCone(a,o,d,r,ang){const t=s6T(a);if(!t)return false;const vx=t.position.x-o.x,vz=t.position.z-o.z,L=Math.hypot(vx,vz);
  if(L>=r*a.sz+.35)return false;if(L<.5)return true;return Math.acos(Math.max(-1,Math.min(1,(vx*d.x+vz*d.z)/L)))<ang+.2}
function s6InLine(a,o,d,w,l){const t=s6T(a);if(!t)return false;const vx=t.position.x-o.x,vz=t.position.z-o.z,u=vx*d.x+vz*d.z,p=Math.abs(vx*d.z-vz*d.x);return u>-.4&&u<l+.3&&p<w*a.sz/2+.35}
function s6Hit(e,a,mult,mt){const t=s6T(a);if(t)hitTarget(e,t,mult*(e.enr?1.3:1),mt)}
// a debuff on the hero (only when the hero is the one hit)
function s6Deb(a,n,i,s,ms,d){if(s6T(a)!==pl||hero.iv>0)return;dqDebuff(n,i,s,ms,d);popT(pl.position,n+'!','#ffb070')}
// poison / bleed ticks on the hero: n ticks every iv seconds
function s6Dot(e,a,mult,n,iv,col,lab){if(s6T(a)!==pl||hero.iv>0)return;let t=0,k=0;dqDebuff(lab,'☠️',{},n*iv*1000,lab+': taking damage over time');
  kqFx({tick(dt){t+=dt;if(t>=iv){t-=iv;k++;if(!(hero.iv>0)&&townAt(pl.position.x,pl.position.z,.5)<0&&!(typeof AWD!='undefined'&&AWD.dead)){hitHero(e,mult,'m');burst(gY(pl.position,1),col,6,.4,.6,.5)}}return k<n}})}
function s6Pool(e,p,r,col,ms,mult,deb){
  // a lingering ground patch: hurts and debuffs whoever stands in it (the hero only; companions walk through)
  const m=new THREE.Mesh(new THREE.CircleGeometry(r,28),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,fog:false}));
  m.rotation.x=-Math.PI/2;m.position.copy(gY(p,.07));scene.add(m);let t=0,tk=0;const T=ms/1000;
  kqFx({tick(dt){t+=dt;tk-=dt;const u=t/T;m.material.opacity=.42*(u<.08?u/.08:u>.85?(1-u)/.15:1);m.scale.setScalar(.9+.1*Math.sin(t*3));
    if(Math.random()<dt*10)burst(gY(V(p.x+s6R(-r,r)*.7,0,p.z+s6R(-r,r)*.7),.1),col,1,.1,.5,.6);
    if(Math.hypot(pl.position.x-p.x,pl.position.z-p.z)<r&&townAt(pl.position.x,pl.position.z,.5)<0){if(deb)dqDebuff(deb[0],deb[1],deb[2],500,deb[3]);
      if(mult&&tk<=0){tk=.6;if(hero.iv<=0)hitHero(e,mult,'m')}}
    return t<T},end(){scene.remove(m);m.geometry.dispose();m.material.dispose()}})}
// extra red warning circles (several drop spots); removed with the attack
function s6Tel(a,p,r){const t=telMake({M:{sh:'circle',r,at:'tg'},sz:a.sz,tp:p,d:a.d},{m:{position:p}});kqDimTel({tel:t});(a.xt||(a.xt=[])).push(t);return t}
function s6TelRm(a){(a.xt||[]).forEach(t=>{scene.remove(t);t.traverse(o=>o.geometry&&o.geometry.dispose())});a.xt=null}
function s6NoTel(a){if(a.tel){scene.remove(a.tel);a.tel.traverse(o=>o.geometry&&o.geometry.dispose());a.tel=null}}
function s6Free(x,z){return !solid(x,z)&&!solid(x+.3,z)&&!solid(x-.3,z)&&!solid(x,z+.3)&&!solid(x,z-.3)}
// fly a projectile model along a lob from a to b over ms; done() at landing
function s6Lob(mesh,a,b,h,ms,done,trail){scene.add(mesh);tw(ms,k=>{const x=a.x+(b.x-a.x)*k,z=a.z+(b.z-a.z)*k,y0=a.y+(GH(b.x,b.z)+.3-a.y)*k;mesh.position.set(x,y0+Math.sin(Math.PI*k)*h,z);
    if(mesh.userData.spin)mesh.userData.spin.rotation.x+=.25;if(trail&&Math.random()<.7)burst(mesh.position,trail,1,.15,.1,.4)},()=>{kqRm(mesh);done&&done()})}
// a straight projectile the base shot code flies and resolves (hits the hero or the target companion, stops at walls)
function s6Shot(e,a,kind,col,dir,spd,mult,mt,sz,life){const P=kqHand(e,V()),g=kqShot(kind,col,sz||1);g.position.copy(P);scene.add(g);
  const s={m:g,v:dir.clone().multiplyScalar(spd),t:life||1.6,e,c:col,mult:mult*(e.enr?1.3:1),mt:mt||'p',kq:1,kind,tg:a.tg,y0:P.y-GH(P.x,P.z),hy:e.m.isHum?1.0:.75,age:0};
  if(kind=='arrow')g.lookAt(g.position.x+s.v.x,g.position.y,g.position.z+s.v.z);eshots.push(s);return s}
// a straight projectile with an on-hit extra (venom, pin): flies itself, stops at the first body it meets or a wall
function s6Own(e,a,kind,col,dir,spd,mult,mt,sz,onHit,len){const P=kqHand(e,V()),g=kqShot(kind,col,sz||1);g.position.copy(P);scene.add(g);const y0=P.y-GH(P.x,P.z);let L=0,done=0;len=len||10;
  kqFx({tick(dt){const st=spd*dt;L+=st;const p=g.position;p.x+=dir.x*st;p.z+=dir.z*st;p.y=GH(p.x,p.z)+y0;if(kind=='arrow')g.lookAt(p.x+dir.x,p.y,p.z+dir.z);if(Math.random()<.7)burst(p,col,1,.1,.1,.35);
    let h=null;if(Math.hypot(p.x-pl.position.x,p.z-pl.position.z)<.6)h=pl;else{const t=s6T(a);if(t&&t!==pl&&fols.indexOf(t)>=0&&t.visible&&Math.hypot(p.x-t.position.x,p.z-t.position.z)<.75)h=t}
    if(h){done=1;hitTarget(e,h,mult*(e.enr?1.3:1),mt);try{onHit&&onHit(h)}catch(_){}}
    return !done&&L<len&&!solid(p.x,p.z)},end(){kqImpact(g.position,col,kind,!!done);kqRm(g)}})}
function s6Rot(d,ang){const c=Math.cos(ang),s=Math.sin(ang);return V(d.x*c+d.z*s,0,-d.x*s+d.z*c)}
function s6Hum(e){return !!(e&&e.m&&e.m.isHum)}

// ---------------- the moves ----------------
// common shape fields are the old ones: sh cone (r, ang) / line (w, l) / circle (r, at 'tg' or 'self'); timings wind/act/rec/cd; dmg
var MV107={
 // ===== Kindlelight =====
 // Caustic Goo: swells up and bursts, leaving an acid puddle; or flows over you and holds you fast
 gooburst:{nm:'Caustic Burst',ic:'🫧',an:'slam',rmin:0,rmax:2.4,wind:.95,act:.2,rec:.7,cd:3.6,dmg:1.25,sh:'circle',r:2.5,at:'self',mt:'m',
  x6:{tick(e,a,ph,k,dt,now,P){if(ph==0){const q=k*k;e.m.scale.setScalar(e.m.bs*(1+.22*q+.03*Math.sin(now/40)*q));P.y=0;P.rx=0}else if(ph==1)e.m.scale.setScalar(e.m.bs*(1.22-.3*k));else e.m.scale.setScalar(e.m.bs*(.92+.08*(1-k)))},
   land(e,a){const p=e.m.position;e.m.scale.setScalar(e.m.bs);ring(p,0xc8f03a,3,380);burst(gY(p,.4),0xc8f03a,34,3,2,.6);burst(gY(p,.3),0x6a8a1a,16,2,1,.7);
    if(s6InC(a,p,2.5))s6Hit(e,a,1.25,'m');s6Pool(e,p.clone(),1.9*a.sz,0x9ad82a,4000,.25,['Corroded','🧪',{mspd:-.3},'Acid: −30% move speed'])},
   end(e){if(e.m&&!e.dead)e.m.scale.setScalar(e.m.bs)}}},
 engulf:{nm:'Engulf',ic:'🟢',an:'bite',rmin:0,rmax:1.9,wind:.7,act:.3,rec:.8,cd:4,dmg:.9,sh:'cone',r:2.0,ang:.7,mt:'m',
  x6:{tick(e,a,ph,k,dt,now,P){if(ph==0){P.z=-.25*k;P.rx=-.2*k;P.y=-.05*k}else if(ph==1){P.z=.9*Math.sin(k*Math.PI);P.rx=.3*Math.sin(k*Math.PI)}},
   land(e,a){const p=gY(e.m.position,0).addScaledVector(a.d,1.1);burst(gY(p,.5),0x9ad82a,24,1.2,1.2,.6);fxWeb(p,0xb8f04a,.9,1200);
    if(s6InCone(a,a.o,a.d,2,.7)){s6Hit(e,a,.9,'m');s6Deb(a,'Engulfed','🟢',{mspd:-.9},1200,'Held in goo: almost rooted (dash out)')}}}},
 // Acid Spitter: lobs an acid glob that leaves a burning patch; or hoses you down with a short acid spray
 acidlob:{nm:'Acid Glob',ic:'🧪',an:'spit',rmin:2.6,rmax:8.5,wind:.65,act:.75,rec:.5,cd:3.4,dmg:1.15,sh:'circle',r:1.6,at:'tg',mt:'m',
  x6:{tick(e,a,ph,k,dt,now,P){if(ph==0){P.rx=-.5*k;e.m.atk=k>.5?1:0}else if(ph==1)P.rx=-.5+.8*Math.min(1,k*3)},
   rel(e,a){const g=kqShot('glob',0xc8f03a,1.5);s6Lob(g,kqHand(e,V()),a.tp,2.6,a.M.act*1000,null,0xc8f03a);burst(kqHand(e,V()),0xc8f03a,10,1,1,.35)},
   land(e,a){kqImpact(gY(a.tp,.3),0xc8f03a,'glob',s6InC(a,a.tp,1.6));if(s6InC(a,a.tp,1.6))s6Hit(e,a,1.15,'m');s6Pool(e,a.tp.clone(),1.5*a.sz,0xb8e02a,3500,.22,null)}}},
 acidspray:{nm:'Acid Spray',ic:'💦',an:'spit',rmin:0,rmax:3.2,wind:.6,act:.45,rec:.55,cd:3.2,dmg:.45,sh:'cone',r:3.4,ang:.5,mt:'m',
  x6:{tick(e,a,ph,k,dt,now,P){if(ph==0)P.rx=-.4*k;else if(ph==1){P.rx=.15;P.ry=Math.sin(k*18)*.18;if(Math.random()<.9)fxStream(gY(e.m.position,.6).addScaledVector(a.d,.4),a.d,0xc8f03a,2,3.2,.45,300,'sph',.14)}},
      land(e,a){if(s6InCone(a,a.o,a.d,3.4,.5)){s6Hit(e,a,.45,'m');s6Deb(a,'Burned Armour','🧪',{pdP:-.25},4000,'Acid: −25% physical defence')}}}},
 // Bloat Maggot: burrows into the mud and bursts up under you; or retches bile that slows
 burrow:{nm:'Burrow',ic:'🕳️',an:'bite',rmin:2.2,rmax:7.5,wind:1.0,act:.38,rec:.6,cd:4.2,dmg:1.35,sh:'circle',r:1.5,at:'tg',
  x6:{start(e,a){const o=e.m.position,q=a.tp;let k=1;while(k>0&&!s6Free(o.x+(q.x-o.x)*k,o.z+(q.z-o.z)*k))k-=.1;a.tp.set(o.x+(q.x-o.x)*Math.max(0,k),0,o.z+(q.z-o.z)*Math.max(0,k));if(a.tel)a.tel.position.copy(gY(a.tp,.12))},
   tick(e,a,ph,k,dt,now,P){const ib=1/(e.m.bs||1);if(ph==0){P.y=-1.1*k*k*ib;P.rx=.5*k;if(Math.random()<.6)burst(gY(e.m.position,.1),0x6a5a3a,2,.8,1,.4);
      if(Math.random()<dt*14)burst(gY(a.tp,.1),0x6a5a3a,1,.6,.6,.4)}
    else if(ph==1){P.y=(-1.1+1.5*Math.sin(Math.min(1,k*1.2)*Math.PI*.5))*ib;P.rx=-.5*(1-k)}},
   rel(e,a){burst(gY(e.m.position,.1),0x6a5a3a,20,1.6,1.6,.5);e.m.position.x=a.tp.x;e.m.position.z=a.tp.z;fxCracks(gY(a.tp,0),0x8a7050,7,1.6,500)},
   land(e,a){burst(gY(a.tp,.2),0x6a5a3a,30,2.4,2.4,.6);ring(a.tp,0xb89a6a,2.2,320);shake(.08);if(s6InC(a,a.tp,1.5))s6Hit(e,a,1.35)}}},
 retch:{nm:'Bile Retch',ic:'🤢',an:'spit',rmin:0,rmax:2.6,wind:.75,act:.3,rec:.6,cd:3.6,dmg:.8,sh:'cone',r:2.8,ang:.6,mt:'m',
  x6:{tick(e,a,ph,k,dt,now,P){if(ph==0){P.rx=-.35*k;e.m.scale.y=e.m.bs*(1+.12*k)}else if(ph==1){e.m.scale.y=e.m.bs;P.rx=.35*Math.sin(k*Math.PI)}},
   rel(e,a){fxStream(gY(e.m.position,.5).addScaledVector(a.d,.3),a.d,0xd8e070,16,2.8,.55,500,'sph',.2)},
   land(e,a){if(s6InCone(a,a.o,a.d,2.8,.6)){s6Hit(e,a,.8,'m');s6Deb(a,'Nauseous','🤢',{mspd:-.35},2500,'Bile: −35% move speed')}},end(e){if(e.m&&!e.dead)e.m.scale.setScalar(e.m.bs)}}},

 // ===== Hillside Crest =====
 // Naga Warrior: a full sweep of its serpent tail; or a long trident thrust
 tailsweep:{nm:'Tail Sweep',ic:'🐍',an:'spin',rmin:0,rmax:2.6,wind:.8,act:.36,rec:.6,cd:3.6,dmg:1.15,sh:'circle',r:2.7,at:'self',
  x6:{tick(e,a,ph,k,dt,now,P){if(ph==0)P.ry=.6*k;else if(ph==1){P.ry=.6-(Math.PI*2+.6)*k;if(Math.random()<.7)burst(gY(e.m.position,.2),0xd8c060,2,2.4,.3,.3)}else P.ry=0},
   land(e,a){const p=e.m.position;arc(p,a.d,0xd8c060,2.7,300);burst(gY(p,.2),0xc8b080,22,2.8,.6,.5);
    if(s6InC(a,p,2.7)){s6Hit(e,a,1.15);const t=s6T(a);if(t===pl){const v=V(pl.position.x-p.x,0,pl.position.z-p.z).normalize();for(let i=0;i<8;i++){const nx=pl.position.x+v.x*.25,nz=pl.position.z+v.z*.25;if(solid(nx,nz))break;pl.position.x=nx;pl.position.z=nz}}}}}},
 impale:{nm:'Trident Impale',ic:'🔱',an:'strike',rmin:0,rmax:4,wind:.85,act:.22,rec:.75,cd:3.4,dmg:1.5,sh:'line',w:.9,l:4.4,
  x6:{tick(e,a,ph,k,dt,now,P){if(ph==0){P.z=-.3*k;P.rx=-.1*k}else if(ph==1){P.z=.5*Math.sin(k*Math.PI);P.rx=.2*Math.sin(k*Math.PI)}},
   land(e,a){const o=gY(a.o,.9);x5('box',0xe8e0c0,260,(k,m)=>{m.position.copy(o).addScaledVector(a.d,2.2);m.lookAt(o.clone().addScaledVector(a.d,5));m.scale.set(.08,.08,4.4*Math.min(1,k*4));m.material.opacity=1-k},{p:o.clone()});
    burst(gY(a.o,.8).addScaledVector(a.d,4.2),0xffe8b0,12,1,.8,.35);if(s6InLine(a,a.o,a.d,.9,4.4)){s6Hit(e,a,1.5);s6Dot(e,a,.12,3,1,0xd04a4a,'Bleeding')}}}},
 // Naga Archer: a fan of five arrows; or one venom arrow
 volley:{nm:'Arrow Fan',ic:'🏹',an:'throw',rmin:2.4,rmax:9,wind:.9,act:.15,rec:.55,cd:3.8,dmg:.6,sh:'cone',r:9,ang:.42,
  x6:{rel(e,a){for(let i=-2;i<=2;i++)s6Shot(e,a,'arrow',0xffe8b0,s6Rot(a.d,i*.17),13,.6,'p',1)}}},
 venomshot:{nm:'Venom Arrow',ic:'🟩',an:'throw',rmin:2.4,rmax:10,wind:.75,act:.15,rec:.5,cd:3.4,dmg:.7,sh:'line',w:.5,l:10,
  x6:{rel(e,a){s6Own(e,a,'arrow',0x7ae04a,a.d.clone(),12,.7,'p',1.1,h=>{if(h===pl)s6Dot(e,{tg:pl},.14,4,1,0x7ae04a,'Venom')},11)}}},
 // Naga Shaman: calls spectral serpents that burst from the ground toward you; or a sigil that hexes (weakens) you
 serpents:{nm:'Serpent Rise',ic:'🐍',an:'bolt',rmin:0,rmax:8,wind:.95,act:.6,rec:.6,cd:4,dmg:1.2,sh:'line',w:1.2,l:8,mt:'m',
  x6:{tick(e,a,ph,k,dt,now,P){if(ph==1){const n=Math.floor(k*8);for(;(a.sn|0)<=n&&(a.sn|0)<8;a.sn=(a.sn|0)+1){const q=a.o.clone().addScaledVector(a.d,1+a.sn);
      x5('cone',0x4ad8c8,420,(kk,m)=>{const u=kk<.3?kk/.3:1-(kk-.3)/.7;m.scale.set(.18,1.1*u,.18);m.position.set(q.x,GH(q.x,q.z),q.z)},{p:q.clone(),r:[s6R(-.3,.3),0,s6R(-.3,.3)]});burst(gY(q,.3),0x4ad8c8,6,.6,1.6,.4);
      if(!a.hit&&s6InC(a,q,.9)){a.hit=1;s6Hit(e,a,1.2,'m')}}}}}},
 hex:{nm:'Serpent Hex',ic:'🔯',an:'rainfire',rmin:0,rmax:9,wind:1.15,act:.2,rec:.6,cd:4.6,dmg:.9,sh:'circle',r:1.7,at:'tg',mt:'m',
  x6:{start(e,a){a.sg=fxSigil(a.tp,0x4ad8c8,1.6,(a.M.wind+a.M.act)*1000+200,6)},
   tick(e,a,ph,k){const t=s6T(a);if(ph==0&&k<.7&&t){a.tp.set(t.position.x,0,t.position.z);if(a.tel)a.tel.position.copy(gY(a.tp,.12));if(a.sg)a.sg.position.copy(gY(a.tp,.06))}},
   land(e,a){fxPillar(a.tp,0x4ad8c8,.8,3,420);burst(gY(a.tp,.5),0x4ad8c8,24,1.6,2,.5);if(s6InC(a,a.tp,1.7)){s6Hit(e,a,.9,'m');s6Deb(a,'Hexed','🔯',{paP:-.2,maP:-.2},5000,'Hexed: −20% damage')}}}},

 // ===== Burningeye Summit =====
 // Frost Troll: hurls a boulder of ice; or, when hurt, stops to regenerate (hit it to stop it!)
 boulder:{nm:'Boulder Hurl',ic:'🪨',an:'throw',rmin:3,rmax:9,wind:1.0,act:.8,rec:.7,cd:4.2,dmg:1.5,sh:'circle',r:1.8,at:'tg',
  x6:{rel(e,a){const g=kqShot('rock',0,2.4);s6Lob(g,kqHand(e,V()),a.tp,3.4,a.M.act*1000,null,0xd8e8ff)},
   land(e,a){burst(gY(a.tp,.3),0xd8e8ff,30,2.6,2,.6);burst(gY(a.tp,.3),0x8a8070,14,2,1.4,.6);fxCracks(gY(a.tp,0),0xbfe0ff,8,1.8,600);ring(a.tp,0xbfe0ff,2.4,340);if(d2(pl.position,a.tp)<9)shake(.12);
    if(s6InC(a,a.tp,1.8))s6Hit(e,a,1.5)}}},
 regen:{nm:'Troll Blood',ic:'💚',an:'slam',rmin:0,rmax:8,wind:.4,act:2.4,rec:.4,cd:9,dmg:0,sh:'circle',r:1,at:'self',
  x6:{when(e){return e.c.h<M(e.c)*.7&&!e.mir},start(e,a){s6NoTel(a);a.h0=e.c.h;popT(e.m.position,'Regenerating!','#7ae08a')},
   tick(e,a,ph,k,dt,now,P){if(ph!=1)return;P.rx=-.15+.05*Math.sin(now/90);if(Math.random()<dt*12)burst(gY(e.m.position,s6R(.4,2)),0x7ae08a,2,.5,1.2,.6);
    if(e.c.h<a.h0-1){a.t=0;popT(e.m.position,'Interrupted','#ffd27a');return}   // a hit breaks it
    if(!e.mir){e.c.h=Math.min(M(e.c),e.c.h+M(e.c)*.075*dt);a.h0=e.c.h}}}},
 // Yeti: a freezing roar; or a giant snowball rolled down the line
 frostroar:{nm:'Frost Roar',ic:'❄️',an:'rainfire',rmin:0,rmax:3.4,wind:.9,act:.35,rec:.7,cd:4,dmg:.8,sh:'cone',r:3.8,ang:.7,mt:'m',
  x6:{tick(e,a,ph,k,dt,now,P){if(ph==0)P.rx=-.25*k;else if(ph==1)P.rx=.15},
   rel(e,a){fxWaves(gY(e.m.position,1.2),a.d,0xbfe8ff,4,3.8,380,.7);fxStream(gY(e.m.position,1.4).addScaledVector(a.d,.5),a.d,0xe8f8ff,18,3.8,.6,520,'oct',.16)},
   land(e,a){if(s6InCone(a,a.o,a.d,3.8,.7)){s6Hit(e,a,.8,'m');s6Deb(a,'Frozen','❄️',{mspd:-.45,as:-.2},3000,'Frozen: −45% move speed, −20% attack speed')}}}},
 snowball:{nm:'Avalanche Ball',ic:'⚪',an:'slam',rmin:2.6,rmax:9,wind:1.0,act:.15,rec:.8,cd:4.4,dmg:1.4,sh:'line',w:1.8,l:10,
  x6:{rel(e,a){const g=new THREE.Mesh(kqGeo('sph'),new THREE.MeshLambertMaterial({color:0xf0f6ff}));g.scale.setScalar(.7*a.sz);g.userData.lpsSkip=1;const P=gY(e.m.position,.7).addScaledVector(a.d,.9);g.position.copy(P);scene.add(g);
    let L=0,hit=0;kqFx({tick(dt){const st=8*dt;L+=st;const p=g.position;p.x+=a.d.x*st;p.z+=a.d.z*st;p.y=GH(p.x,p.z)+.7*a.sz;g.rotation.x+=st/.7;g.scale.setScalar((.7+L*.03)*a.sz);if(Math.random()<.8)burst(gY(p,.1),0xf0f6ff,2,.8,.6,.4);
      if(!hit&&s6InC(a,p,1)){hit=1;s6Hit(e,a,1.4);s6Deb(a,'Snowed In','⚪',{mspd:-.3},2000,'−30% move speed')}
      return L<10&&!solid(p.x,p.z)},end(){burst(g.position,0xf0f6ff,24,2,1.5,.5);scene.remove(g);g.material.dispose()}})}}},
 // Troll Rimecaller: icicles drop one after another around you; or a rune that freezes you in place
 icicles:{nm:'Icicle Fall',ic:'🧊',an:'rainfire',rmin:0,rmax:9,wind:1.0,act:.75,rec:.6,cd:4.4,dmg:1.0,sh:'circle',r:1.2,at:'tg',mt:'m',
  x6:{start(e,a){a.sp=[a.tp.clone()];for(let i=0;i<3;i++){const an=i/3*6.283+s6R(0,1),q=V(a.tp.x+Math.cos(an)*1.9,0,a.tp.z+Math.sin(an)*1.9);a.sp.push(q);s6Tel(a,q,1.0)}},
   tick(e,a,ph,k){if(ph!=1)return;const n=Math.floor(k*4);for(;(a.sn|0)<=n&&(a.sn|0)<4;a.sn=(a.sn|0)+1){const q=a.sp[a.sn];
      x5('cone',0xcff0ff,280,(kk,m)=>{m.position.set(q.x,GH(q.x,q.z)+6*(1-kk),q.z);m.scale.set(.3,1.3,.3)},{p:q.clone(),r:[Math.PI,0,0],add:0});
      setTimeout(()=>{burst(gY(q,.3),0xcff0ff,18,1.6,1.6,.5);ring(q,0x9ad8ff,1.6,260);if(!a.hit&&s6InC(a,q,a.sn==0?1.2:1.0)){a.hit=1;s6Hit(e,a,1.0,'m')}},260)}},
   end(e,a){s6TelRm(a)}}},
 frostbind:{nm:'Rime Bind',ic:'🔵',an:'bolt',rmin:0,rmax:9,wind:1.25,act:.2,rec:.6,cd:5.5,dmg:.6,sh:'circle',r:1.4,at:'tg',mt:'m',
  x6:{start(e,a){a.sg=fxSigil(a.tp,0x9ad8ff,1.3,(a.M.wind+a.M.act)*1000+200,8)},
   land(e,a){fxSpikes(gY(a.tp,0),0xcff0ff,8,1.1,1.2,900,1);burst(gY(a.tp,.5),0xe8f8ff,20,1.4,1.4,.6);
    if(s6InC(a,a.tp,1.4)){s6Hit(e,a,.6,'m');s6Deb(a,'Frozen Solid','🔵',{mspd:-1},1400,'Rooted in ice (dash out)')}}}},

 // ===== Searing Sands =====
 // Dune Scorpion: an overhead tail sting (poison); or kicks sand in your eyes
 sting:{nm:'Tail Sting',ic:'🦂',an:'slam',rmin:0,rmax:2.8,wind:.8,act:.2,rec:.6,cd:3.4,dmg:1.1,sh:'line',w:.9,l:3,
  x6:{tick(e,a,ph,k,dt,now,P){if(ph==0){P.rx=-.25*k;P.z=-.15*k}else if(ph==1){P.rx=.35*Math.sin(k*Math.PI);P.z=.25*Math.sin(k*Math.PI)}},
   land(e,a){const q=a.o.clone().addScaledVector(a.d,2.2);burst(gY(q,.4),0x9aff5a,14,1,1,.4);x5('cone',0x9aff5a,300,(k,m)=>{m.position.set(q.x,GH(q.x,q.z)+1.4-k,q.z);m.scale.set(.12,.6,.12);m.material.opacity=1-k},{p:q.clone(),r:[Math.PI,0,0]});
    if(s6InLine(a,a.o,a.d,.9,3)){s6Hit(e,a,1.1);s6Dot(e,a,.16,4,1,0x9aff5a,'Poisoned')}}}},
 sandkick:{nm:'Sand Kick',ic:'🏜️',an:'spin',rmin:0,rmax:2.8,wind:.55,act:.25,rec:.55,cd:3.6,dmg:.5,sh:'cone',r:3,ang:.65,
  x6:{tick(e,a,ph,k,dt,now,P){if(ph==0)P.ry=.5*k;else if(ph==1)P.ry=.5-1*k;else P.ry=0},
   rel(e,a){fxStream(gY(e.m.position,.3).addScaledVector(a.d,.3),a.d,0xe0c080,24,3,.6,500,'ico',.14)},
   land(e,a){if(s6InCone(a,a.o,a.d,3,.65)){s6Hit(e,a,.5);s6Deb(a,'Blinded','🏜️',{as:-.3,crit:-.1},3000,'Sand in your eyes: −30% attack speed')}}}},
 // Sand Elemental: opens quicksand under you; or becomes a sandstorm that drags you in
 quicksand:{nm:'Quicksand',ic:'⏳',an:'rainfire',rmin:0,rmax:9,wind:.9,act:.2,rec:.6,cd:5,dmg:.4,sh:'circle',r:2.2,at:'tg',mt:'m',
  x6:{land(e,a){fxSigil(a.tp,0xe0b060,2.1,4500,3);s6Pool(e,a.tp.clone(),2.2*a.sz,0xc89a50,4500,.2,['Sinking','⏳',{mspd:-.5},'Quicksand: −50% move speed']);if(s6InC(a,a.tp,2.2))s6Hit(e,a,.4,'m')}}},
 sandstorm:{nm:'Sandstorm',ic:'🌪️',an:'spin',rmin:0,rmax:4.5,wind:.8,act:1.8,rec:.6,cd:6,dmg:.35,sh:'circle',r:3.6,at:'self',mt:'m',
  x6:{rel(e,a){const m=e.m;fxTornado(()=>m.position,0xe0b060,3.4,2.4,a.M.act*1000);a.tk=0},
   tick(e,a,ph,k,dt,now,P){if(ph!=1)return;P.ry=(P.ry||0)+dt*14;const p=e.m.position,t=s6T(a);if(Math.random()<.8)burst(gY(p,s6R(.2,2.4)),0xe0b060,2,2.6,.4,.4);
    if(t===pl&&hero.iv<=0){const dx=p.x-pl.position.x,dz=p.z-pl.position.z,L=Math.hypot(dx,dz);if(L<4.2&&L>1){const s=Math.min(L-1,2.6*dt),nx=pl.position.x+dx/L*s,nz=pl.position.z+dz/L*s;if(!solid(nx,nz)){pl.position.x=nx;pl.position.z=nz}}}
    a.tk-=dt;if(a.tk<=0){a.tk=.45;if(s6InC(a,p,2.6))s6Hit(e,a,.35,'m')}}}},

 // ===== The Dirge =====
 // Skeleton Warrior: a two-handed overhead cleave; or a bone-rattling war cry that shakes your guard
 cleave:{nm:'Grave Cleave',ic:'🪓',an:'slam',rmin:0,rmax:2.6,wind:1.0,act:.2,rec:.8,cd:3.6,dmg:1.6,sh:'cone',r:2.9,ang:.36,
  x6:{land(e,a){const q=a.o.clone().addScaledVector(a.d,1.8);fxCracks(gY(q,0),0xd8d0b8,6,1.8,600);burst(gY(q,.3),0xd8d0b8,22,1.6,1.4,.5);if(d2(pl.position,q)<7)shake(.1);if(s6InCone(a,a.o,a.d,2.9,.36))s6Hit(e,a,1.6)}}},
 rattle:{nm:'Bone Rattle',ic:'💀',an:'rainfire',rmin:0,rmax:3,wind:.7,act:.3,rec:.6,cd:5,dmg:.5,sh:'circle',r:3,at:'self',
  x6:{tick(e,a,ph,k,dt,now,P){if(ph==1){P.ry=Math.sin(now/22)*.12;P.y=Math.abs(Math.sin(now/30))*.05}},
   rel(e,a){const p=e.m.position;for(let i=0;i<3;i++)setTimeout(()=>ring(p,0xd8d0b8,3.6,360),i*110);fxRise(gY(p,.3),8,1.2,1.4,700,(i,q,fn)=>x5('box',0xe8e0c8,700,(k,m)=>{fn(k,m);m.scale.set(.05,.18,.05);m.rotation.z+=.3},{p:q,add:0}))},
   land(e,a){if(s6InC(a,e.m.position,3)){s6Hit(e,a,.5);s6Deb(a,'Shaken','💀',{pdP:-.25,mdP:-.25},5000,'Shaken: −25% defence')}}}},
 // Grave Ghoul: a frenzy of claw rakes; or vomits grave rot
 frenzy:{nm:'Ghoul Frenzy',ic:'🩸',an:'strike',rmin:0,rmax:2,wind:.6,act:.9,rec:.7,cd:4,dmg:.5,sh:'cone',r:2.2,ang:.75,
  x6:{tick(e,a,ph,k,dt,now,P){if(ph!=1)return;const n=Math.floor(k*4);P.z=.25*Math.abs(Math.sin(k*Math.PI*4));P.ry=Math.sin(k*Math.PI*4)*.3;
    if(e.m.ak)e.m.ak.k=(k*4)%1;
    for(;(a.sn|0)<n&&(a.sn|0)<4;a.sn=(a.sn|0)+1){fxClaw(gY(e.m.position,0).addScaledVector(a.d,1.1),s6Rot(a.d,(a.sn%2?1:-1)*.4),0xd04a4a,3,.8,200);if(s6InCone(a,e.m.position,a.d,2.2,.75))s6Hit(e,a,.5)}}}},
 rotbreath:{nm:'Grave Rot',ic:'🤮',an:'bolt',rmin:0,rmax:3.2,wind:.8,act:.5,rec:.6,cd:4.2,dmg:.4,sh:'cone',r:3.3,ang:.55,mt:'m',
  x6:{tick(e,a,ph,k){if(ph==1&&Math.random()<.9)fxStream(gY(e.m.position,1.3).addScaledVector(a.d,.4),a.d,0x8aa060,2,3.3,.5,420,'sph',.22)},
   land(e,a){if(s6InCone(a,a.o,a.d,3.3,.55)){s6Hit(e,a,.4,'m');s6Dot(e,a,.12,5,1,0x8aa060,'Rotting')}}}},
 // Bone Archer: a long charged shot that goes through everything; or a pinning arrow
 pierce:{nm:'Piercing Shot',ic:'➶',an:'throw',rmin:3,rmax:12,wind:1.35,act:.12,rec:.6,cd:4.4,dmg:1.6,sh:'line',w:.7,l:13,
  x6:{rel(e,a){const P=kqHand(e,V()),g=kqShot('arrow',0x9affc8,1.5);g.position.copy(P);scene.add(g);let L=0,hit=0;const y0=P.y-GH(P.x,P.z);
    kqFx({tick(dt){const st=22*dt;L+=st;const p=g.position;p.x+=a.d.x*st;p.z+=a.d.z*st;p.y=GH(p.x,p.z)+y0;g.lookAt(p.x+a.d.x,p.y,p.z+a.d.z);burst(p,0x9affc8,2,.1,.1,.35);
      if(!hit&&s6InC(a,p,.6)){hit=1;s6Hit(e,a,1.6);burst(p,0x9affc8,18,1.4,1,.4)}return L<13&&!solid(p.x,p.z)},end(){kqImpact(g.position,0x9affc8,'arrow',false);kqRm(g)}})}}},
 pinshot:{nm:'Pinning Arrow',ic:'📍',an:'throw',rmin:2.4,rmax:10,wind:.8,act:.15,rec:.5,cd:5,dmg:.6,sh:'line',w:.5,l:10,
  x6:{rel(e,a){s6Own(e,a,'arrow',0xd8d0b8,a.d.clone(),14,.6,'p',1.1,h=>{if(h===pl&&hero.iv<=0){dqDebuff('Pinned','📍',{mspd:-1},1100,'Pinned to the ground (dash out)');popT(pl.position,'Pinned!','#ffb070')}},11)}}},

 // ===== The Citadel =====
 // Vampire Thrall: dissolves into mist and strikes from behind; or a draining bite that heals it
 miststep:{nm:'Mist Step',ic:'🌫️',an:'strike',rmin:2,rmax:8,wind:.75,act:.3,rec:.6,cd:4.6,dmg:1.25,sh:'circle',r:1.6,at:'tg',
  x6:{tick(e,a,ph,k,dt,now,P){if(ph==0){const s=1-.9*Math.max(0,(k-.5)/.5);e.m.scale.setScalar(e.m.bs*s);if(Math.random()<.7)burst(gY(e.m.position,s6R(.3,1.6)),0x6a2a3a,2,.6,.8,.5)}else e.m.scale.setScalar(e.m.bs)},
   rel(e,a){const t=s6T(a),o=e.m.position;burst(gY(o,1),0x3a1a2a,20,1.4,1,.6);x5emo('🦇',gY(o,1.4),500,(k,s)=>{s.position.y+=.02},.5);
    const tp=t?t.position:a.tp,dx=tp.x-o.x,dz=tp.z-o.z,L=Math.hypot(dx,dz)||1,nx=tp.x+dx/L*1.2,nz=tp.z+dz/L*1.2;
    if(s6Free(nx,nz)){o.x=nx;o.z=nz}else{o.x=tp.x-dx/L*1.2;o.z=tp.z-dz/L*1.2}
    a.tp.set(tp.x,0,tp.z);e.m.rotation.y=Math.atan2(tp.x-o.x,tp.z-o.z);a.d.set(tp.x-o.x,0,tp.z-o.z).normalize();burst(gY(o,1),0x6a2a3a,20,1.4,1,.6)},
   land(e,a){fxClaw(gY(e.m.position,0).addScaledVector(a.d,1),a.d,0xff3a5a,3,1,260);if(s6InC(a,a.tp,1.6))s6Hit(e,a,1.25)},end(e){if(e.m&&!e.dead)e.m.scale.setScalar(e.m.bs)}}},
 drain:{nm:'Blood Drain',ic:'🩸',an:'strike',rmin:0,rmax:1.9,wind:.6,act:.25,rec:.6,cd:4.2,dmg:1.0,sh:'cone',r:2,ang:.6,mt:'m',
  x6:{land(e,a){if(!s6InCone(a,a.o,a.d,2,.6))return;s6Hit(e,a,1.0,'m');const t=s6T(a),m=e.m;
    for(let i=0;i<6;i++)setTimeout(()=>x5('oct',0xff3a5a,380,(k,o)=>{const A=gY(t.position,1),B=gY(m.position,1.1);o.position.copy(A.lerp(B,k));o.position.y+=Math.sin(k*Math.PI)*.4;o.scale.setScalar(.12)},{p:gY(t.position,1)}),i*60);
    if(!e.mir){const h=Math.round(M(e.c)*.12);e.c.h=Math.min(M(e.c),e.c.h+h);dn(m.position,'+'+h,'#ff6a8a',-10)}}}},
 // Blood Bat: a sonic screech that slows; or a swarm of little bats that chase you
 screech:{nm:'Blood Screech',ic:'📢',an:'spit',rmin:0,rmax:3.2,wind:.6,act:.3,rec:.5,cd:4,dmg:.5,sh:'circle',r:3.2,at:'self',mt:'m',
  x6:{rel(e,a){fxWaves(gY(e.m.position,.8),a.d,0xff6a8a,4,3.2,360,3.1)},land(e,a){if(s6InC(a,e.m.position,3.2)){s6Hit(e,a,.5,'m');s6Deb(a,'Deafened','📢',{mspd:-.3,as:-.15},2500,'−30% move speed, −15% attack speed')}}}},
 batswarm:{nm:'Bat Swarm',ic:'🦇',an:'spit',rmin:2,rmax:9,wind:.7,act:.15,rec:.5,cd:4.6,dmg:.35,sh:'circle',r:1,at:'self',mt:'m',
  x6:{start(e,a){s6NoTel(a)},rel(e,a){const o=gY(e.m.position,.9);for(let i=0;i<3;i++){const s=x5emo('🦇',o.clone(),4000,null,.45);let t=0,v=s6Rot(a.d,(i-1)*.9).multiplyScalar(5),hit=0;
    kqFx({tick(dt){t+=dt;const T=s6T(a);if(!T||hit)return false;const tp=gY(T.position,1),p=s.position,w=V(tp.x-p.x,tp.y-p.y,tp.z-p.z),L=w.length();
      if(t>.35)v.lerp(w.normalize().multiplyScalar(6.5),Math.min(1,dt*3));p.addScaledVector(v,dt);p.y+=Math.sin(t*14+i)*.02;if(Math.random()<.4)burst(p,0xff3a5a,1,.1,.1,.3);
      if(L<.6){hit=1;s6Hit(e,a,.35,'m');burst(p,0xff3a5a,10,.8,.6,.35)}if(solid(p.x,p.z))hit=1;return t<3.2&&!hit},end(){s.material.opacity=0;s.visible=false}})}}}},
 // Blood Knight: blood spikes erupt in a line; or a blood oath (enraged: stronger and faster for a while)
 bloodspikes:{nm:'Blood Spikes',ic:'🩸',an:'slam',rmin:0,rmax:7,wind:1.0,act:.5,rec:.7,cd:4,dmg:1.4,sh:'line',w:1.3,l:7,
  x6:{tick(e,a,ph,k){if(ph!=1)return;const n=Math.floor(k*7);for(;(a.sn|0)<=n&&(a.sn|0)<7;a.sn=(a.sn|0)+1){const q=a.o.clone().addScaledVector(a.d,.8+a.sn);
      x5('cone',0xb01a2a,600,(kk,m)=>{const u=kk<.2?kk/.2:kk>.7?1-(kk-.7)/.3:1;m.scale.set(.25,1.5*u,.25);m.position.set(q.x,GH(q.x,q.z),q.z)},{p:q.clone(),add:0,r:[s6R(-.25,.25),0,s6R(-.25,.25)]});burst(gY(q,.3),0xff3a5a,6,.6,1.4,.4);
      if(!a.hit&&s6InC(a,q,.95)){a.hit=1;s6Hit(e,a,1.4)}}}}},
 bloodoath:{nm:'Blood Oath',ic:'😡',an:'rainfire',rmin:0,rmax:9,wind:.9,act:.2,rec:.4,cd:12,dmg:0,sh:'circle',r:1,at:'self',
  x6:{when(e){return !e.enr},start(e,a){s6NoTel(a)},
   land(e,a){const m=e.m;fxPillar(m.position,0xff2a3a,.9,3.4,500);ring(m.position,0xff2a3a,3,400);popT(m.position,'Blood Oath!','#ff5a6a');if(!e.enr){e.enr=1;e._oath=1;setTimeout(()=>{if(e._oath){e.enr=0;e._oath=0}},7000)}
    let t=0;kqFx({tick(dt){t+=dt;if(e.dead||!e.m.parent)return false;if(Math.random()<dt*10)burst(gY(e.m.position,s6R(.4,1.8)),0xff2a3a,1,.4,.8,.5);return t<7}})}}},
 // Blood Magister keeps its blood bolt and blood rain, and gains a blood curse that hunts you
 bloodcurse:{nm:'Blood Curse',ic:'🩸',an:'bolt',rmin:0,rmax:10,wind:1.6,act:.2,rec:.6,cd:5,dmg:1.3,sh:'circle',r:1.5,at:'tg',mt:'m',
  x6:{start(e,a){a.sg=fxSigil(a.tp,0xff3050,1.4,(a.M.wind+a.M.act)*1000+200,5)},
   tick(e,a,ph,k){const t=s6T(a);if(ph==0&&k<.75&&t){const q=a.tp;q.x+=(t.position.x-q.x)*.08;q.z+=(t.position.z-q.z)*.08;if(a.tel)a.tel.position.copy(gY(q,.12));if(a.sg)a.sg.position.copy(gY(q,.06))}},
   land(e,a){fxPillar(a.tp,0xff3050,.7,3.5,420);burst(gY(a.tp,.6),0xff3050,28,1.8,2.2,.5);if(s6InC(a,a.tp,1.5)){s6Hit(e,a,1.3,'m');s6Dot(e,a,.1,3,1,0xff3050,'Bleeding')}}}}
};
Object.assign(MV,MV107);
// which zone monster gets what: [basic, signature, signature] (Blood Magister keeps its bolt + blood rain as one signature)
var MSIG107={goo:['strike','gooburst','engulf'],spitter:['spit','acidlob','acidspray'],maggot:['bite','burrow','retch'],
  nagaw:['strike','tailsweep','impale'],nagaa:['throw','volley','venomshot'],nagas:['bolt','serpents','hex'],
  troll:['strike','boulder','regen'],yeti:['strike','frostroar','snowball'],trollsh:['bolt','icicles','frostbind'],
  scorp:['strike','sting','sandkick'],selem:['bolt','quicksand','sandstorm'],
  skeleton:['strike','cleave','rattle'],ghoul:['strike','frenzy','rotbreath'],bonearcher:['throw','pierce','pinshot'],
  vamp:['strike','miststep','drain'],bloodbat:['bite','screech','batswarm'],vampk:['strike','bloodspikes','bloodoath'],vampm:['bolt','rainfire','bloodcurse']};
Object.keys(MSIG107).forEach(k=>{if(!EN[k])return;EN[k].moves=MSIG107[k].slice();MSET[k]=EN[k].moves;});
MVN&&Object.keys(MV107).forEach(n=>{MVN[n]=MV107[n].nm});

// ---------------- hooks into the move engine ----------------
{const f=mStart;mStart=function(e,tg,n){f.apply(this,arguments);const a=e&&e.atk,M=MV107[n];if(!M||!a||a.n!==n)return;a.sn=0;
  try{M.x6.start&&M.x6.start(e,a)}catch(err){console.warn('v107 start',err)}}}
{const f=mTick;mTick=function(e,dt,now){const a=e&&e.atk,M=a&&MV107[a.n];if(!M||!SIG107.on)return f.apply(this,arguments);
  const ph0=a.ph,X=M.x6;f.apply(this,arguments);
  const done=e.atk!==a;
  try{
    if(ph0==0&&(a.ph>=1||done))X.rel&&X.rel(e,a);
    if(ph0<=1&&(a.ph==2||done)&&!a.landed){a.landed=1;X.land&&X.land(e,a)}
    if(done){s6TelRm(a);X.end&&X.end(e,a);return}
    const m=e.m;if(m.ak)m.ak.n=s6Hum(e)?M.an:({strike:'bite',throw:'spit',bolt:'spit',rainfire:'spit'}[M.an]||M.an);
    const P=m.pose||(m.pose={}),k=a.ph==0?1-a.t/a.T:a.ph==1?1-a.t/(a.A||1):a.t/(a.R||1);
    X.tick&&X.tick(e,a,a.ph,Math.max(0,Math.min(1,k)),dt,now,P);
    if(a.ph==1)m.atk=1;
  }catch(err){console.warn('v107 move',err)}}}
// a cancelled move (stun, death, safe zone) also cleans its extra warnings and restores the body size
{const f=mCancel;mCancel=function(e){const a=e&&e.atk,M=a&&MV107[a.n];if(M){try{s6TelRm(a);M.x6.end&&M.x6.end(e,a)}catch(_){}if(e.m&&e.m.bs)e.m.scale.setScalar(e.m.bs)}return f.apply(this,arguments)}}
// the AI never picks a move whose condition fails (troll regenerates only when hurt, the knight's oath not while enraged)
{const f=ePick;ePick=function(e,ok){ok=ok.filter(n=>{const M=MV107[n];return !M||!M.x6.when||M.x6.when(e)});if(!ok.length)return null;
  // out of reach of its basic attack: a monster with a gap-closing signature (burrow, mist step, boulder, snowball, bat swarm…)
  // uses it now and then instead of only walking in (the generic picker saves signatures for after a few basic attacks)
  if(SIG107.on&&!ok.some(n=>KQMEL[n]||KQR[n])){const g=ok.filter(n=>MV107[n]&&MV107[n].rmin>=2);if(g.length&&Math.random()<.5){e.bu=0;e.buN=R(2,4);return g[Math.random()*g.length|0]}}
  return f.call(this,e,ok)}}
