// v166: watches every HUD element / window while the game runs (town, menus, a field fight, a den fight) and lists any inline
// style, class or on-screen box that keeps flipping between a few values (two pieces of code fighting over it = a flickering HUD).
async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const R={};hero.hp=1e9;
 const P=['top','left','right','bottom','width','height','maxHeight','transform','display','zoom','visibility'];
 const watch=async(name,n)=>{const els=[...document.querySelectorAll('body *')].filter(x=>x.id&&!/^(tgB|xpB|orbHf|orbMf|rcB|bossB)$/.test(x.id));const hist={},rh={};
  for(let i=0;i<(n||70);i++){await w(40);for(const x of els){const st=x.style;for(const k of P){const v=st[k];const id=x.id+'.'+k;const h=hist[id]||(hist[id]=[]);if(!h.length||h[h.length-1]!==v)h.push(v)}
   const c=typeof x.className=='string'?x.className:'';const hc=hist[x.id+'.class']||(hist[x.id+'.class']=[]);if(!hc.length||hc[hc.length-1]!==c)hc.push(c);
   if(x.offsetParent!==null&&x.offsetWidth){const r=x.getBoundingClientRect(),v=[r.left,r.top,r.width,r.height].map(Math.round).join(',');const h=rh[x.id]||(rh[x.id]=[]);if(!h.length||h[h.length-1]!==v)h.push(v)}}}
  const bad=[];for(const id in hist){const h=hist[id];if(h.length>=4&&new Set(h).size<=3)bad.push(id+' x'+h.length+' '+[...new Set(h)].map(s=>JSON.stringify(s).slice(0,40)).join(' / '))}
  for(const id in rh){const h=rh[id];if(h.length>=4&&new Set(h).size<=4)bad.push('RECT '+id+' x'+h.length+' '+[...new Set(h)].join(' / '))}
  R[name]=bad};
 const shut=()=>{try{closeX()}catch(_){}['sysmenu','bag','tal'].forEach(i=>{const e=$(i);if(e)e.classList.add('hide')})};
 await watch('town');
 $('sysmenu').classList.remove('hide');await watch('menu');shut();
 $('bagBtn').click();await watch('inventory');shut();
 try{openTal()}catch(e){R.talErr=String(e)};await watch('character');shut();
 try{openAbil()}catch(e){R.abErr=String(e)};await watch('abilities');shut();
 insArrive(PMAP[0].ins[0]);await w(2500);
 let e=enemies.filter(e=>!e.dead&&!e.boss).sort((a,b)=>a.m.position.distanceTo(pl.position)-b.m.position.distanceTo(pl.position))[0];
 if(e)toPos(e.m.position.x+3,e.m.position.z);else{const q=pl.position;e=spawnEnemy(Object.keys(EN)[0],q.x+3,q.z,3,{})}
 if(e){e.c.h=e.c.st.hp=1e7;await w(300);setTarget(e);R.fieldTgt=!!tgt;await watch('field+target')}
 setTarget(null);
 insArrive(PMAP[0].ins[3]);await w(2500);const A=ARN[0];toPos(A.cx+5,A.cz);await w(2500);
 R.AF=!!AF;const b=enemies.find(q=>q.boss&&!q.dead);if(b){setTarget(b);await watch('den boss target')}
 const p=pl.position,m=spawnEnemy(Object.keys(EN)[0],p.x+2,p.z+2,5,{});if(m){m.c.h=m.c.st.hp=1e7;m.agg=0;m.cd=99;setTarget(m);await w(200);R.bfxT=document.body.classList.contains('bfxT');
   const tr=$('tgt').getBoundingClientRect(),br=$('boss').getBoundingClientRect();R.tgtTop=Math.round(tr.top);R.bossBottom=Math.round(br.bottom);R.tgtShown=tr.height>0;await watch('den add target')}
 return R}
