// v225: mana economy per class and level: pool, passive regen per second (measured by running the game), the equipped / owned
// abilities' cost and cooldown, and how long each class can cast every ability on cooldown before running dry.
(()=>{const R={};window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 try{CHEAT.god=true}catch(_){}
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;try{loop(VT)}catch(e){}}};
 {const T=TOWNS[0];toPos(T.cx+6,T.cy+14,0)}STEP(10);
 const lvls=(window.LV||[5,15,30,50]);
 for(const c of ['warrior','paladin','assassin','ranger','mage']){R[c]={};
  for(const L of lvls){hero.cls=c;hero.lvl=L;hsDirty();const s=HS(),mm=mpMax();
   hero.mp=0;const t0=VT;STEP(312);const sec=(VT-t0)/1000,reg=hero.mp/sec;
   // every class ability the hero could own at this level (the book), cost and real cooldown
   let book=[];try{book=kqsAll(c)}catch(_){}
   if(!book.length){try{book=[].concat(SKB[c]||[],(typeof SKX!='undefined'&&SKX[c])||[],(KQN[c]||[]))}catch(_){book=heroSkills()}}
   const ab=book.filter(k=>k&&k.lv<=L&&k.mp!=null).map(k=>({n:k.n,mp:k.mp,cd:+(k.cd*kqrC(k)*(1-Math.min(.5,s.cdr||0))).toFixed(1)}));
   // the 6 costliest-per-second abilities cast on cooldown
   const top=ab.slice().sort((a,b)=>b.mp/b.cd-a.mp/a.cd).slice(0,6),need=top.reduce((a,k)=>a+k.mp/k.cd,0);
   const avg=ab.length?ab.reduce((a,k)=>a+k.mp,0)/ab.length:0;
   R[c][L]={mm,mpr:+(s.mpr||0).toFixed(4),regen:+reg.toFixed(2),regenPct:+(100*reg/mm).toFixed(2),fullIn:+(mm/reg).toFixed(0),
     avgCost:+avg.toFixed(1),avgCostPct:+(100*avg/mm).toFixed(1),castsFull:+(mm/Math.max(1,avg)).toFixed(1),
     need6:+need.toFixed(2),sustain:+(reg/Math.max(.01,need)).toFixed(2),dryIn:need>reg?+(mm/(need-reg)).toFixed(0):-1,n:ab.length}}}
 return R})()
