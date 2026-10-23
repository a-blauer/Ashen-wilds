// v132 Cheddar's quests: placement in every instance, marker, prompt, quest flow, rewards, saves, feasibility per instance.
// python3 probe.py v132_cheddar.js  (SHOT=name saves a screenshot standing near Cheddar in Kindlelight I)
(async()=>{const F=[],sleep=ms=>new Promise(r=>setTimeout(r,ms)),out={fail:F};
 const tick=n=>{for(let i=0;i<(n||1);i++)chqTick132(.05,performance.now())};
 // every field instance and den: a spot on free ground in front of the arrival spot (v135: the camera looks down the road at him),
 // facing it, with a burrow; every field instance also has a second spot before its end gateway, past the gateway's F reach
 const spots=[];INSL.forEach(I=>{if(I.tri)return;const s=chqSpot132(I),e=I.en,n=I.path[26];
   const de=Math.hypot(s.x-e[0],s.z-e[1]),fw=((s.x-e[0])*(n[0]-e[0])+(s.z-e[1])*(n[1]-e[1]))/(Math.hypot(n[0]-e[0],n[1]-e[1])||1),db=Math.hypot(s.x-s.bx,s.z-s.bz);
   const fa=Math.atan2(e[0]-s.x,e[1]-s.z),dfa=Math.abs(Math.atan2(Math.sin(fa-s.face),Math.cos(fa-s.face)));spots.push([I.n,+de.toFixed(1),+fw.toFixed(1),+db.toFixed(1)]);
   if(!(de>2.5&&de<7&&fw>2))F.push('spot not in front of the arrival '+I.n+' '+de.toFixed(2)+' fw '+fw.toFixed(2));if(dfa>.05)F.push('not facing the arrival '+I.n);
   const J=insAt(Math.round(s.x),Math.round(s.z));if(!J||J.g!==I.g)F.push('spot outside instance '+I.n);
   if(solid_old(Math.round(s.bx),Math.round(s.bz)))F.push('burrow on solid ground '+I.n);
   const t=chqSpotEnd135(I),r=RPORT.find(q=>q.k=='next'&&q.ig===I.g);
   if(I.fld){if(!t||!r)F.push('no gateway Cheddar '+I.n);else{const dg=Math.hypot(t.x-r.x,t.z-r.z);if(!(dg>5.1&&dg<9))F.push('gateway Cheddar distance '+I.n+' '+dg.toFixed(2));
     const J2=insAt(Math.round(t.x),Math.round(t.z));if(!J2||J2.g!==I.g)F.push('gateway spot outside instance '+I.n);if(solid_old(Math.round(t.bx),Math.round(t.bz)))F.push('gateway burrow on solid ground '+I.n)}}
   else if(t)F.push('gateway Cheddar in a den '+I.n)});
 out.spots=spots;
 // feasibility: nodes and water per Kindlelight / Hillside field instance
 const feas={};for(const z of [0,1])for(let k=0;k<3;k++){const I=PMAP[z].ins[k],c={tree:0,rock:0,iron:0,mush:0,water:0,camps:(I.cl||[]).length,secrets:0};
   for(let y=I.y0;y<I.y0+I.h;y++)for(let x=I.x0;x<I.x0+I.w;x++){const J=insAt(x,y);if(!J||J.g!==I.g)continue;const t=MAP[y][x],pk=PROPK[y*W+x],n=NODE[y*W+x];
     if(n&&t=='#')c.tree++;if(n&&t=='r'&&(pk=='rock'||pk=='grave'||pk=='pillar')){c.rock++;if(lnV({kind:'rock',x,y})=='iron')c.iron++}if(n&&pk=='mush')c.mush++;
     if(t=='~'&&!BIOMES[MAP.bio[y][x]].lava)c.water++}
   c.secrets=SECRETS.filter(S=>{const J=insAt(S.x,S.z);return J&&J.g===I.g}).length;feas[I.n]=c}
 out.feas=feas;
 [['Kindlelight I','water'],['Kindlelight I','mush'],['Kindlelight I','tree'],['Kindlelight I','rock'],['Kindlelight II','water'],['Kindlelight II','iron'],['Hillside Crest I','secrets']].forEach(([n,k])=>{if(!(feas[n]&&feas[n][k]>0))F.push('nothing for '+k+' in '+n)});
 if(feas['Hillside Crest I'].camps!==3)F.push('Hillside I camps '+feas['Hillside Crest I'].camps);
 // go to Kindlelight I
 const I0=PMAP[0].ins[0];insArrive(I0);await sleep(300);tick(40);
 const C=CHQ132.ch;if(!C||!C.root.visible)F.push('Cheddar not shown in Kindlelight I');
 if(!CHQ132.bur.visible)F.push('burrow not shown');
 if(!CHQ132.mk.visible||CHQ132.mkK!=='!')F.push('no ! marker: '+CHQ132.mkK);
 out.heights={ch:+(new THREE.Box3().setFromObject(C.root).max.y-C.root.position.y).toFixed(2)};
 // walk up to him
 const s=CHQ132.spots[I0.g];toPos(s.x+Math.sin(s.face)*1.8,s.z+Math.cos(s.face)*1.8);tick(5);
 const p=worldPrompt();out.prompt=p&&p.label;if(!p||!/Cheddar/.test(p.label))F.push('no Cheddar prompt: '+(p&&p.label));
 p.fn();await sleep(50);if(xwMode!=='chq132')F.push('window did not open');out.win=$('xwB').innerText.slice(0,400);
 // v135: the gateway Cheddar at the end of the road: shown, talkable, same window
 {const E=CHQ132.e,t=chqSpotEnd135(I0);if(!E.ch||!E.ch.root.visible)F.push('gateway Cheddar not shown');
  if(!E.mk||!E.mk.visible)F.push('gateway Cheddar has no marker');
  const back=[pl.position.x,pl.position.z];closeX();toPos(t.x+Math.sin(t.face)*1.8,t.z+Math.cos(t.face)*1.8);tick(30);const q=worldPrompt();out.prompt2=q&&q.label;
  if(!q||!/Cheddar/.test(q.label))F.push('no prompt at the gateway Cheddar: '+(q&&q.label));
  const r=RPORT.find(o=>o.k=='next'&&o.ig===I0.g);toPos(r.x+(t.x-r.x)*.3,r.z+(t.z-r.z)*.3);tick(2);const q2=worldPrompt();if(!q2||!/Step through/.test(q2.label))F.push('gateway prompt lost: '+(q2&&q2.label));
  toPos(back[0],back[1]);tick(5);p.fn();await sleep(50)}
 // accept all through the window button
 const all=document.querySelector('[data-cqall]');if(!all)F.push('no accept all');else all.click();
 const L=chqList132(I0);if(!L.every(q=>chqS132(q)&&chqS132(q).s==1))F.push('not all accepted');closeX();tick(3);chqTrk132();
 if($('chqt132').classList.contains('hide'))F.push('tracker hidden');out.trk=$('chqt132').innerText;
 // events: gathering, fishing, camp, empowered kill
 chqEv132('wood',25);chqEv132('stone',9);chqEv132('fish',5);chqEv132('glow',5);
 if(chqS132(CHQ132_ID.k1b).s!==1)F.push('k1b done early');chqEv132('stone',1);if(chqS132(CHQ132_ID.k1b).s!==2)F.push('k1b not ready');
 if(chqS132(CHQ132_ID.k1c).s!==2)F.push('fish not ready');
 // a real gather through gFinish: find a tree in the instance
 {const t0=chqS132(CHQ132_ID.k1b);CHQ132.st.k1b={s:1,p:[0,0]};let tree=null;for(let y=I0.y0;y<I0.y0+I0.h&&!tree;y++)for(let x=I0.x0;x<I0.x0+I0.w;x++){if(MAP[y][x]=='#'&&NODE[y*W+x]&&insAt(x,y)&&insAt(x,y).g===I0.g){tree={kind:'tree',x,y,k:y*W+x};break}}
  if(tree){gFinish(tree);if(!(CHQ132.st.k1b.p[0]>0))F.push('gFinish did not count wood')}CHQ132.st.k1b=t0}
 // marker turns into "?"
 tick(3);if(CHQ132.mkK!=='?')F.push('marker not ? when ready: '+CHQ132.mkK);
 // turn in: rewards
 const g0=gold,x0=hero.xp+1e6*hero.lvl,gearN=gear.length,eggN=eggs.length;chqTurnIn132('k1b');chqTurnIn132('k1c');
 if(!(gold>g0))F.push('no gold reward');if(!(hero.xp+1e6*hero.lvl>x0))F.push('no xp reward');if(gear.length!==gearN+1)F.push('no boots');if(eggs.length!==eggN+1)F.push('no egg');
 const bt=gear[gear.length-1];out.reward={boots:itT(bt).n,sl:itT(bt).sl,r:bt.r,lv:bt.lv,egg:eggs[eggs.length-1].sp+' T'+(eggs[eggs.length-1].tier+1),gold:gold-g0};
 if(itT(bt).sl!=='boots')F.push('boots reward is '+itT(bt).sl);
 // v132.1: empower counts only while a companion empowers the hero (not buff spells); +2 forged weapons only
 {const fe=()=>({c:{al:0,l:2,h:0,g:['x']},dead:1,lhH:nowP(),m:{position:pl.position.clone()},hb:{visible:false}});CHQ132.st.k1e={s:1,p:[0]};
  party.forEach(c=>{if(c)c.emp=false});const sp=Object.values(CSP).find(q=>q.k=='buff');if(sp)hero.buffs.push({s:sp.buff,t:nowP()+60000,n:'',i:''});
  chqKill132(fe(),null,true);if(CHQ132.st.k1e.p[0]!==0)F.push('companion buff spell counted as empower');
  if(party[0]){party[0].emp=true;chqKill132(fe(),null,true);party[0].emp=false;if(CHQ132.st.k1e.s!==2)F.push('empowered kill not counted')}else F.push('no companion to empower')}
 // only counts in its own instance: leave to Kindlelight II and gather glowcaps for k1d (already done) / fish for nothing
 // a real camp clear through kill(): every creature of one camp
 {const C=CAMPS.find(c=>c.ig===I0.g);for(let w=0;w<60&&!((ROST&&ROST.r===I0.g&&(ROST.slots||[]).some(q=>q.camp===C)));w++)await sleep(250);out.rost=ROST&&ROST.r;const sl=(ROST.slots||[]).filter(q=>q.camp===C);out.campSlots=sl.length;let n=0;
  for(const q of sl){const e=q.on||enemies.find(x=>x.slot===q);if(e&&!e.dead){e.c.h=0;e.dead=1;e.hb.visible=false;kill(e);n++}}
  out.campKills=n;if(chqS132(CHQ132_ID.k1a).s!==2){F.push('camp clear not counted (kills '+n+'/'+sl.length+')');chqEv132('camp',1)}}
 const I1=PMAP[0].ins[1];insArrive(I1);await sleep(200);tick(30);
 if(CHQ132.g!==I1.g)F.push('Cheddar did not follow to II');if(!$('chqt132').classList.contains('hide'))F.push('tracker shows I quests in II');
 if(CHQ132.mkK!=='!')F.push('no ! in II');
 CHQ132.st.k1e={s:1,p:[0]};chqEv132('empKill',1);if(CHQ132.st.k1e.p[0]!==0)F.push('I quest counted in II');
 // kill events through kill(): an elite in II
 CHQ132.st.k2a={s:1,p:[0]};{const e={c:{al:1,l:5,h:0,g:['x']},dead:1,m:{position:pl.position.clone()},hb:{visible:false}};try{chqKill132(e,null,true)}catch(err){F.push('kill err '+err)}if(CHQ132.st.k2a.s!==2)F.push('elite kill not counted')}
 // empowered + food + bard + forged
 CHQ132.st.k2a={s:1,p:[0]};
 // Kindlelight III: forged +2 weapon kills, ability rank 2+
 {const I2=PMAP[0].ins[2];insArrive(I2);await sleep(150);tick(10);CHQ132.st.k3a={s:1,p:[0]};CHQ132.st.k3c={s:1,p:[0]};
  const w=eq.weapon,u0=w&&w.up;const fe=()=>({c:{al:0,l:7,h:0,g:['x']},dead:1,lhH:nowP(),m:{position:pl.position.clone()},hb:{visible:false}});
  if(w){w.up=1;chqKill132(fe(),null,true);if(CHQ132.st.k3a.p[0]!==0)F.push('+1 weapon counted');w.up=2;chqKill132(fe(),null,true);if(CHQ132.st.k3a.s!==2)F.push('+2 weapon kill not counted');w.up=u0}else F.push('no weapon');
  hero.lvl=30;hsDirty();const ab=heroSkills()[0];if(ab){kqrUp(ab.n);out.abRank=kqrRank(kqsFind(hero.cls,ab.n));if(out.abRank>=2&&CHQ132.st.k3c.s!==2)F.push('rank 2 not counted');if(out.abRank<2)F.push('could not rank up '+ab.n+': '+kqrWhy(kqsFind(hero.cls,ab.n)))}}
 // Hillside Crest II: a Tier 2+ egg found
 {const I3=PMAP[1].ins[1];insArrive(I3);await sleep(150);tick(10);CHQ132.st.h2a={s:1,p:[0]};chqEggs132();const sp=zEggs104(1)[0];
  eggs.push(mkEgg(sp,0,1));chqEggs132();if(CHQ132.st.h2a.p[0]!==0)F.push('tier 1 egg counted');eggs.push(mkEgg(sp,1,1));chqEggs132();if(CHQ132.st.h2a.s!==2)F.push('tier 2 egg not counted')}
 // saves
 const sv=x2Save();if(!sv.chq||!sv.chq.st.k1b||sv.chq.st.k1b.s!==3)F.push('save missing');const keep=JSON.stringify(CHQ132.st);CHQ132.st={};x2Load(JSON.parse(JSON.stringify(sv)));
 if(JSON.stringify(CHQ132.st)!==keep)F.push('load mismatch');
 x2Load({});if(Object.keys(CHQ132.st).length)F.push('old save not empty');x2Load(JSON.parse(JSON.stringify(sv)));
 // Duskhold: hidden
 recallTown();await sleep(100);tick(5);if(CHQ132.ch.root.visible||CHQ132.e.ch.root.visible)F.push('Cheddar visible in town');
 // back to Kindlelight I for the shot
 insArrive(I0);await sleep(200);tick(30);toPos(s.x+Math.sin(s.face)*3.4,s.z+Math.cos(s.face)*3.4);camYaw=Math.atan2(Math.sin(s.face),Math.cos(s.face));snapCam&&snapCam();
 CHQ132.st.k1d={s:2,p:[5]};tick(40);
 p.fn();await sleep(100);out.ok=F.length==0;F.forEach(f=>console.log('FAIL '+f));return out})()
