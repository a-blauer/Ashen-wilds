// ================= v89 dens: a warning sign on the road outside every Sovereign den =================
// A two-post sign (the Duskhold sign look from zzM_town.js) stands beside the road just outside each den's gate.
// Walk up to it and press F (the normal interact prompt, via worldPrompt) to read it: the window lists the Sovereign's
// attacks with how to avoid each one, its weaknesses / the den's counters, and a recommended level next to yours.
// The text is written from the den code (zzK_den*.js, z_boss2.js, j_boss.js move pools).
var DSIGN=[], DSTXT=[
 {den:'The Drowned Hollow',zone:'Kindlelight',
  atk:[['🐾 Pounce','Leaps onto a red circle under your feet.','Step or dash out of the circle before it lands.'],
   ['💨 Charge','Rushes along a red lane (three times in a row in Phase III).','Sidestep the lane — don\'t run straight away from it.'],
   ['👁 The Great Eye','A golden beam from its brow locks on and slowly tracks you; every moment inside hurts and fills SEEN.','Break line of sight behind a root pillar, out-turn it, or dash through it.'],
   ['👀 Watching Stalks','Six eye-stalks wake and sweep yellow gaze cones over the ground. Standing in a gaze fills SEEN; at 3/3 you are MARKED and Argus leaps on you (big red circle).','Keep a root pillar between you and any open eye. When MARKED, run out of the red circle.'],
   ['☄ Eye Rain','Phase II: strikes fall on red circles around you.','Keep moving.'],
   ['🐺 Calls the brood','Phase II: bog creatures join the fight.','Kill them quickly or lead them away from the gaze.'],
   ['🌑 Lights Out','Phase III: the hollow goes dark and Argus melts into the shadows, then bursts out along a red line from where two eyes glint.','Watch for the glinting eyes and step off the red line.']],
  weak:['Root pillars block every gaze cone and the Great Eye beam — fight near them.',
   'Eye-stalks can be struck down. Open eyes take +60% damage, and every burst eye wounds Argus and makes it reel (they regrow at each phase).',
   'Black bog pools slow you (Mired) — don\'t dodge into them.']},
 {den:'The Serpent Mere',zone:'Hillside Crest',
  atk:[['🟢 Venom Spit','Globs land on red circles and leave poison pools.','Step out of the circles and stay out of the green pools.'],
   ['👅 Tongue Lash','A red line in front of it; if it catches you, you are pulled in.','Sidestep the line.'],
   ['🌊 Tidal Surge','The stones glow blue and a wall of water rolls out from the Hydra (two waves from Phase II).','Stand on a raised glowing stepping stone, or dash through the crest.'],
   ['🐍 Brood Necks','Heads burst from the water (red circle first). Up close they bite along a red line; from afar they lob venom.','Leave the circle as they rise; sidestep bites; sever them.'],
   ['🔆 Sweeping Beam','Phase II: a beam sweeps around the mere.','Dash through it or stay ahead of it.'],
   ['💥 Venom Mines','Phase II: many red circles across the water.','Find the gaps and keep still only between them.'],
   ['☁ Toxic Spores','Phase III: spore clouds that linger.','Stay out of the purple clouds.'],
   ['⚠ Cataclysm','From Phase II the Hydra gathers the mere and blasts everything.','Get into a glowing blue safe circle.']],
  weak:['Sever a neck to wound the Hydra — but the stump regrows as TWO heads unless you sear it: touch a serpent-fire brazier, then touch the stump.',
   'While 3 or more necks live the Hydra is Brood-guarded and takes 35% less damage — keep the heads down.',
   'The raised stepping stones are safe from every Tidal Surge.']},
 {den:'The Frozen Sepulchre',zone:'Burningeye Summit',
  atk:[['✦ Wailing Orbs','Orbs gather at the edge of the den and hunt you down.','Keep moving and lead them around; never let them corner you.'],
   ['👻 Fade','It vanishes and re-forms behind you with a red circle.','Move as soon as it fades.'],
   ['🦴 Bone Prison','A ring of red circles closes around you.','Dash out through the gap.'],
   ['🔥 Snuff','It drains the Warmfire nearest it (red circle on the fire; two fires in Phase III).','Step out of the frost, then stand beside the dark fire for 2 seconds to rekindle it.'],
   ['🪞 Clones','Phase II: copies split off and explode.','Get away from them before they burst.'],
   ['🧊 Thaw','Phase II: frozen challengers crack (red circle) and Thawed thralls break free.','Step back from cracking statues and kill the thralls.'],
   ['🔆 Beam · Ice Mines · Shockwave','Phase II–III: a sweeping beam, falling ice spikes on red circles, a ring shockwave.','Dash through beams and shockwaves; find gaps in the mines.'],
   ['❄ Whiteout','Phase III: it vanishes into a blizzard (cold builds faster) while ice lances fall where you stand, then re-forms beside you with a frost nova.','Keep moving near a lit Warmfire; leave the nova circle.'],
   ['⚠ Cataclysm','From Phase II it blasts the whole den.','Get into a glowing blue safe circle.']],
  weak:['DEEP COLD: away from a lit Warmfire you chill (Chilled −15% speed, Freezing −30%; at 100% you freeze solid and take a hit).',
   'Stand in a Warmfire\'s warm circle to thaw fast — fight close to the fires and relight any that go dark. One always stays lit.']},
 {den:'The Sunken Pit',zone:'Searing Sands',
  atk:[['🐛 Burrow & Erupt','It dives; a sand mound hunts you, stops, and a red circle marks where it bursts out (Phase II adds three sand geysers; Phase III dives twice).','Keep moving while it hunts; leave the red circles.'],
   ['💢 Ram','A long red lane: it charges to the wall (twice in Phase III).','Sidestep — or stand in front of a column so it rams the column.'],
   ['🌀 Tail Sweep','A red circle around its body.','Back out of the circle.'],
   ['⏳ Quicksand Vortex','The sinkhole churns and drags you toward the middle for 6 seconds; its core grinds and slows you.','Walk or dash against the pull and stay off the sinkhole.'],
   ['🌪 Sandstorm','Phase II: thick dust for 8 seconds while body segments lash up under you (red circles).','Keep moving; each circle follows where you are going.'],
   ['🟠 Acid Spit · Mines','Phase II: acid globs and falling strikes on red circles.','Step out of the circles.'],
   ['⚠ Cataclysm','From Phase II it blasts the whole pit.','Get into a glowing blue safe circle.']],
  weak:['Lure its Ram into one of the four half-sunk columns: it smashes the column and gets its head STUCK for 3.6 s (×1.6 damage). Broken columns stay broken.',
   'After its final eruption it is EXPOSED for 2.8 s (×1.6 damage) — be ready to strike.']},
 {den:'The Charnel Pit',zone:'The Derge',
  atk:[['💥 Slam','A big red circle around him.','Back off before it lands.'],
   ['🤮 Rot Spit','Bile globs on red circles; each leaves a rot pool.','Leave the circles; keep the pools away from where you fight.'],
   ['🌫 Belch','A wide red cone of rot gas in front of him — hits hard and slows (Rotting).','Dash out of the cone or step behind him.'],
   ['🍄 Spore Ring','Phase II: rings of small red circles burst outward one after another.','Stand where a ring has just burst.'],
   ['🌋 Quake','Phase III: three shockwaves in a row.','Dash through each ring.'],
   ['🪱 Corpse Piles','A pile swells (green ring) and bursts into Bloat Maggots.','Destroy the swelling sac before it bursts.'],
   ['☣ Rot Tide','Phase III: the vats burst and rot creeps in from the walls, shrinking the clean ground.','Finish him before the clean ground runs out.']],
  weak:['Bile pustules (Phase II+): pop them for burst damage and a stagger. Pop all three and he reels, taking +35% damage for 5 s. Left alone they erupt into bile rain.',
   'Rot pools spread and stay all fight — standing in rot burns and slows you. Keep to clean ground.']},
 {den:'The Crimson Throne Hall',zone:'The Citadel',
  atk:[['🩸 Blood Fan','Three to five blood lances along red lines.','Step between the lines.'],
   ['🦇 Dive','He dashes at you along a red line, two or three times.','Sidestep each line.'],
   ['🦇 Bat Swarm','He bursts into bats that sweep the hall along red lanes (2/3/4 sweeps), draining you, then reforms with a red-circle burst.','Step out of each lane before the bats pass.'],
   ['🪞 Crimson Doubles','Phase II: four Vaelrics channel blood lances at you.','Only the real one casts a shadow — strike him to shatter every copy.'],
   ['🦴 Prison · Beam · Cross','Phase II–III: a bone prison, a sweeping beam and a cross of lines.','Dash out of prisons; stay out of the lines.'],
   ['🌑 Blood Moon','Phase II: the hall floods with blood; only the pale moonlight shafts are safe (they drift in Phase III).','Stand in the moonlight.'],
   ['⛓ The Crimson Rite','Phase III: he rises before his throne, warded, while four blood obelisks feed a sigil for 24 s. If it completes, a Crimson Cataclysm hits the whole hall.','Break all four obelisks — or dash the moment it ends.']],
  weak:['Blood Chalices heal him while they stand — shatter them as soon as they rise.',
   'Hitting the real Vaelric during the Doubles staggers him (+25% damage for 3 s).',
   'Break all four obelisks and he crashes down stunned, taking +50% damage for 6.5 s.']}];
// where the road reaches the den: first road point at least ~31 tiles out, then a spot beside the road
function dsignSpot(i){const A=ARN[i],P=PMAP[i].path,Rr=ARENA_R+12.5;let k=P.length-1;while(k>0&&Math.hypot(P[k][0]-A.cx,P[k][1]-A.cz)<Rr)k--;
  const q=P[k],o=P[Math.max(0,k-6)],dx=q[0]-o[0],dz=q[1]-o[1],L=Math.hypot(dx,dz)||1,nx=-dz/L,nz=dx/L;
  const ok=(x,z)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const t=MAP[Math.round(z)+a]&&MAP[Math.round(z)+a][Math.round(x)+b];if(!t||!'.gap'.includes(t))return false}return Math.hypot(x-A.cx,z-A.cz)>ARENA_R+9};
  for(const off of [4.2,-4.2,3,-3,5.5,-5.5,2,-2])for(const back of [0,2,4]){const x=q[0]+nx*off-dx/L*back,z=q[1]+nz*off-dz/L*back;if(ok(x,z))return {x,z,fx:o[0],fz:o[1]}}
  return {x:q[0]+nx*3,z:q[1]+nz*3,fx:o[0],fz:o[1]}}
function dsignBuild(){ARN.forEach(A=>{const i=A.i,T=DSTXT[i];if(!T)return;try{const s=dsignSpot(i),y=GH(s.x,s.z),g=new THREE.Group();g.position.set(s.x,y,s.z);
    g.rotation.y=Math.atan2(s.fx-s.x,s.fz-s.z);   // the painted face looks back down the road at whoever walks up
    g.add(twPostG(1.5,1.38,.74));sign(g,[{t:'⚠ '+T.den,f:'700 36px'},{t:A.b.name,f:'600 24px'},{t:'Read before you enter',f:'italic 600 20px'}],1.5,.74,'#2a1a10','#f3dcb0','#b0863a',0,1.38,0,0,512,256);
    const gl=kqSpr(0xffb060,.9);gl.position.set(0,2.35,0);g.add(gl);scene.add(g);DSIGN[i]={i,x:s.x,z:s.z,g}}catch(err){console.error('den sign',i,err)}})}
function dsignNear(){if(inDun||inRealm||AF)return null;for(const s of DSIGN){if(s&&Math.hypot(pl.position.x-s.x,pl.position.z-s.z)<3.2&&Math.abs(pl.position.y-GH(s.x,s.z))<2.5)return s}return null}
{const f=typeof worldPrompt=='function'?worldPrompt:null;worldPrompt=function(){const s=dsignNear();if(s)return {label:'F · Read the warning sign',fn:()=>openDenSign(s.i)};return f?f.apply(this,arguments):null}}
// recommended level: the Sovereign's own level (never below the road's monsters + 1); power: the game's usual power for that level
function dsignLv(i){const b=bossEnt(i)||enemies.find(e=>e.ar===i),bl=b&&b.c?b.c.l:BOSSES[i].lvl,s=DSIGN[i]||{x:ARN[i].cx,z:ARN[i].cz},zl=zoneLv(s.x,s.z),rec=Math.max(bl,zl+1);
  let pw=0,me=0;try{pw=recPower(rec);me=heroPower()}catch(_){}return {bl,zl,rec,pw,me}}
function openDenSign(i){if(uiOpen()&&$('xw').classList.contains('hide'))return;openX('densign',i);try{mSfx('open')}catch(_){}}
XR.densign=()=>{const i=+xwArg,T=DSTXT[i],B=BOSSES[i];if(!T||!B)return;const L=dsignLv(i),me=hero.lvl|0,good=me>=L.rec,done=bossDone.has(i);
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  $('xwT').textContent='📜 '+T.den;$('xwS').textContent=B.name+' · '+B.title;
  const pg=!L.pw||L.me>=L.pw,col=g=>g?'#6ee7b7':'#ff6b5b';
  const rec=`<div class="dsg-lv"><span>Recommended level <b>Lv ${L.rec}</b></span><span>Your level <b style="color:${col(good)}">Lv ${me}</b>${good?' ✔':' ✖'}</span>
    ${L.pw?`<span>Recommended power <b>${L.pw.toLocaleString()}</b></span><span>Your power <b style="color:${col(pg)}">${L.me.toLocaleString()}</b>${pg?' ✔':' ✖'}</span>`:''}
    <small class="mut">${esc(B.name)} is Lv ${L.bl}; monsters on the road here are about Lv ${L.zl}.${good&&pg?'':' Come back stronger, or bring a co-op partner.'}${done?' You have defeated it before.':''}</small></div>`;
  const atk=T.atk.map(([n,d,a])=>`<div class="rw dsg-a"><span class="rn"><b>${esc(n)}</b><small>${esc(d)}</small><small class="dsg-av">➜ ${esc(a)}</small></span></div>`).join('');
  const wk=T.weak.map(w=>`<li>${esc(w)}</li>`).join('');
  $('xwB').innerHTML=`<div class="dsg">${rec}<h4 class="dsg-h">Attacks</h4><div class="rows">${atk}</div><h4 class="dsg-h">Weaknesses &amp; counters</h4><ul class="dsg-w">${wk}</ul></div>`;
  $('xwF').innerHTML='<span class="mut dtl">Red on the ground marks where a hit will land — it stays until the blow falls. Phases change at 70% and 40% health.</span>'};
{const st=document.createElement('style');st.textContent=`.dsg-lv{display:flex;flex-wrap:wrap;gap:4px 18px;align-items:baseline;padding:8px 12px;margin:2px 0 8px;border:1px solid rgba(201,162,74,.45);border-radius:8px;background:rgba(40,24,12,.55)}
.dsg-lv small{flex-basis:100%}.dsg-h{margin:10px 0 4px;font-family:Cinzel,Georgia,serif;color:var(--kq-gold,#e6bf6a);letter-spacing:.04em;font-size:.95rem}
.dsg-a .rn small{display:block;margin-top:2px}.dsg-a .rn .dsg-av{color:#9ae8b0}.dsg-w{margin:0;padding-left:20px;line-height:1.45}.dsg-w li{margin:3px 0}`;document.head.appendChild(st)}
try{dsignBuild()}catch(err){console.error('den signs',err)}
