// v129 Cheddar's quests: placement in every instance, marker, prompt, quest flow, rewards, saves, feasibility per instance.
// python3 probe.py v129_cheddar.js  (SHOT=name saves a screenshot standing near Cheddar in Kindlelight I)
(async()=>{const F=[],sleep=ms=>new Promise(r=>setTimeout(r,ms)),out={fail:F};
 const tick=n=>{for(let i=0;i<(n||1);i++)chqTick129(.05,performance.now())};
 // every field instance and den: a spot on free ground beside its home portal, with a burrow
 const spots=[];INSL.forEach(I=>{if(I.tri)return;const s=chqSpot129(I),r=RPORT.find(q=>q.k=='home'&&q.ig===I.g);
   const dp=r?Math.hypot(s.x-r.x,s.z-r.z):-1,db=Math.hypot(s.x-s.bx,s.z-s.bz);spots.push([I.n,+dp.toFixed(1),+db.toFixed(1)]);
   if(!(dp>1.5&&dp<5))F.push('spot far from portal '+I.n+' '+dp);const J=insAt(Math.round(s.x),Math.round(s.z));if(!J||J.g!==I.g)F.push('spot outside instance '+I.n);
   if(solid_old(Math.round(s.bx),Math.round(s.bz)))F.push('burrow on solid ground '+I.n)});
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
 const C=CHQ129.ch;if(!C||!C.root.visible)F.push('Cheddar not shown in Kindlelight I');
 if(!CHQ129.bur.visible)F.push('burrow not shown');
 if(!CHQ129.mk.visible||CHQ129.mkK!=='!')F.push('no ! marker: '+CHQ129.mkK);
 out.heights={ch:+(new THREE.Box3().setFromObject(C.root).max.y-C.root.position.y).toFixed(2)};
 // walk up to him
 const s=CHQ129.spots[I0.g];toPos(s.x+Math.sin(s.face)*1.8,s.z+Math.cos(s.face)*1.8);tick(5);
 const p=worldPrompt();out.prompt=p&&p.label;if(!p||!/Cheddar/.test(p.label))F.push('no Cheddar prompt: '+(p&&p.label));
 p.fn();await sleep(50);if(xwMode!=='chq129')F.push('window did not open');out.win=$('xwB').innerText.slice(0,400);
 // accept all through the window button
 const all=document.querySelector('[data-cqall]');if(!all)F.push('no accept all');else all.click();
 const L=chqList129(I0);if(!L.every(q=>chqS129(q)&&chqS129(q).s==1))F.push('not all accepted');closeX();tick(3);chqTrk129();
 if($('chqt129').classList.contains('hide'))F.push('tracker hidden');out.trk=$('chqt129').innerText;
 // events: gathering, fishing, camp, empowered kill
 chqEv129('wood',25);chqEv129('stone',9);chqEv129('fish',5);chqEv129('glow',5);
 if(chqS129(CHQ129_ID.k1b).s!==1)F.push('k1b done early');chqEv129('stone',1);if(chqS129(CHQ129_ID.k1b).s!==2)F.push('k1b not ready');
 if(chqS129(CHQ129_ID.k1c).s!==2)F.push('fish not ready');
 // a real gather through gFinish: find a tree in the instance
 {const t0=chqS129(CHQ129_ID.k1b);CHQ129.st.k1b={s:1,p:[0,0]};let tree=null;for(let y=I0.y0;y<I0.y0+I0.h&&!tree;y++)for(let x=I0.x0;x<I0.x0+I0.w;x++){if(MAP[y][x]=='#'&&NODE[y*W+x]&&insAt(x,y)&&insAt(x,y).g===I0.g){tree={kind:'tree',x,y,k:y*W+x};break}}
  if(tree){gFinish(tree);if(!(CHQ129.st.k1b.p[0]>0))F.push('gFinish did not count wood')}CHQ129.st.k1b=t0}
 // marker turns into "?"
 tick(3);if(CHQ129.mkK!=='?')F.push('marker not ? when ready: '+CHQ129.mkK);
 // turn in: rewards
 const g0=gold,x0=hero.xp+1e6*hero.lvl,gearN=gear.length,eggN=eggs.length;chqTurnIn129('k1b');chqTurnIn129('k1c');
 if(!(gold>g0))F.push('no gold reward');if(!(hero.xp+1e6*hero.lvl>x0))F.push('no xp reward');if(gear.length!==gearN+1)F.push('no boots');if(eggs.length!==eggN+1)F.push('no egg');
 const bt=gear[gear.length-1];out.reward={boots:itT(bt).n,sl:itT(bt).sl,r:bt.r,lv:bt.lv,egg:eggs[eggs.length-1].sp+' T'+(eggs[eggs.length-1].tier+1),gold:gold-g0};
 if(itT(bt).sl!=='boots')F.push('boots reward is '+itT(bt).sl);
 // only counts in its own instance: leave to Kindlelight II and gather glowcaps for k1d (already done) / fish for nothing
 // a real camp clear through kill(): every creature of one camp
 {await sleep(300);const C=CAMPS.find(c=>c.ig===I0.g);out.rost=ROST&&ROST.r;const sl=(ROST.slots||[]).filter(q=>q.camp===C);out.campSlots=sl.length;let n=0;
  for(const q of sl){const e=q.on||enemies.find(x=>x.slot===q);if(e&&!e.dead){e.c.h=0;e.dead=1;e.hb.visible=false;kill(e);n++}}
  out.campKills=n;if(chqS129(CHQ129_ID.k1a).s!==2){F.push('camp clear not counted (kills '+n+'/'+sl.length+')');chqEv129('camp',1)}}
 const I1=PMAP[0].ins[1];insArrive(I1);await sleep(200);tick(30);
 if(CHQ129.g!==I1.g)F.push('Cheddar did not follow to II');if(!$('chqt129').classList.contains('hide'))F.push('tracker shows I quests in II');
 if(CHQ129.mkK!=='!')F.push('no ! in II');
 CHQ129.st.k1e={s:1,p:[0]};chqEv129('empKill',1);if(CHQ129.st.k1e.p[0]!==0)F.push('I quest counted in II');
 // kill events through kill(): an elite in II
 CHQ129.st.k2a={s:1,p:[0]};{const e={c:{al:1,l:5,h:0,g:['x']},dead:1,m:{position:pl.position.clone()},hb:{visible:false}};try{chqKill129(e,null,true)}catch(err){F.push('kill err '+err)}if(CHQ129.st.k2a.s!==2)F.push('elite kill not counted')}
 // empowered + food + bard + forged
 CHQ129.st.k2a={s:1,p:[0]};
 // saves
 const sv=x2Save();if(!sv.chq||!sv.chq.st.k1b||sv.chq.st.k1b.s!==3)F.push('save missing');const keep=JSON.stringify(CHQ129.st);CHQ129.st={};x2Load(JSON.parse(JSON.stringify(sv)));
 if(JSON.stringify(CHQ129.st)!==keep)F.push('load mismatch');
 x2Load({});if(Object.keys(CHQ129.st).length)F.push('old save not empty');x2Load(JSON.parse(JSON.stringify(sv)));
 // Duskhold: hidden
 recallTown();await sleep(100);tick(5);if(CHQ129.ch.root.visible)F.push('Cheddar visible in town');
 // back to Kindlelight I for the shot
 insArrive(I0);await sleep(200);tick(30);toPos(s.x+Math.sin(s.face)*3.4,s.z+Math.cos(s.face)*3.4);camYaw=Math.atan2(Math.sin(s.face),Math.cos(s.face));snapCam&&snapCam();
 CHQ129.st.k1d={s:2,p:[5]};tick(40);
 p.fn();await sleep(100);out.ok=F.length==0;F.forEach(f=>console.log('FAIL '+f));return out})()
