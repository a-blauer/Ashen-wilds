async()=>{const o={},errs=[];const ow=console.warn;console.warn=(...a)=>{const s=a.map(String).join(' ');if(/v233|v227|v226|v219|v165/.test(s))errs.push(s.slice(0,300));ow(...a)};
  window.__T=performance.now();const wait=ms=>new Promise(r=>setTimeout(r,ms));try{POST.render=()=>{}}catch(_){}
  hero.lvl=35;INSR[3]=2;SS165.c3.built=1;CHEAT.god=true;hero.hp=heroMax();
  sr165Go([{id:'v0',drv:'chd',gun:'me'}]);await wait(2600);const V=SR165.me,P=sr165Path(),hw=SR165C.hw;if(!V)return {run:false};
  if(window.__RIGID)RP234.on=false;SR165.ph='run';mOn=false;SKR227.auto=true;sr165Place(V,120,0);V.v=20;
  const dt=1/30,St={};let id=0;const kinds={};
  const stat={ticks:0,wall:0,rock:0,overlap:0,snap:0,crab:0,jump:0,n:0,stack:0,inHull:0};const ex={};const per={};
  const add=(k,kind,e,info)=>{stat[k]++;(per[kind]=per[kind]||{})[k]=(per[kind][k]||0)+1;if(!ex[k])ex[k]=[];if(ex[k].length<4)ex[k].push(Object.assign({kind},info))};
  const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
  const SEC=+(window.__SEC||75);
  for(let i=0;i<SEC*30;i++){__T+=1000/30;V.hp=100;V.wreck=0;V.gap=40;sr165Auto(V,dt);sr165Drive(V,dt);try{sr165Spawn(dt)}catch(e){errs.push('spawn '+e)}
    if(i%120===60){K.shift=1}if(i%120===110){K.shift=0}
    const L=enemies.filter(e=>e.sr165&&!e.dead);
    L.forEach(e=>{const p0=e.m.position.clone(),r0=e.m.rotation.y,old=e.__o;e.__o=1;try{eTick(e,dt,__T)}catch(err){errs.push(String(err))}
      if(e.dead||!enemies.includes(e))return;const kind=e.sr165;kinds[kind]=(kinds[kind]||0)+1;stat.n++;
      if(e.cl||(e.k218&&e.k218.st==='leap'))return;
      const p=e.m.position,dx=p.x-p0.x,dz=p.z-p0.z,st=Math.hypot(dx,dz),sp=st/dt,q=P.near(p.x,p.z);
      if(kind==='sc'&&e.k218&&old){const fx=Math.sin(V.h),fz=Math.cos(V.h),ra=(p.x-V.x)*fx+(p.z-V.z)*fz,rb=(p.x-V.x)*fz-(p.z-V.z)*fx;if(Math.abs(ra)<12&&e.__r){stat.near=(stat.near||0)+1;if(Math.hypot(ra-e.__r[0],rb-e.__r[1])<.006)stat.lock=(stat.lock||0)+1}e.__r=[ra,rb]}
      if(Math.abs(q.o)>hw+.3)add('wall',kind,e,{o:+q.o.toFixed(1),al:+skr226Along(V,p).toFixed(0)});
      for(const ob of SR165.obs){if(ob.gone||ob.k==='trap')continue;if(Math.abs(ob.s-q.s)>8)continue;const d=Math.hypot(ob.x-p.x,ob.z-p.z);if(d<ob.r*.8){add('rock',kind,e,{k:ob.k,d:+d.toFixed(1),r:+ob.r.toFixed(1)});break}}
      const dr=Math.abs(wrap(e.m.rotation.y-r0));if(old&&dr>.9&&!e.fall226)add('snap',kind,e,{deg:Math.round(dr*57),f:e.f233|0,al:+skr226Along(V,p).toFixed(0),st:e.k218&&e.k218.st||e.k226&&e.k226.st||''});
      if(sp>4){const mv=Math.atan2(dx,dz),cr=Math.abs(wrap(mv-e.m.rotation.y));if(cr>1.2)add('crab',kind,e,{deg:Math.round(cr*57),sp:+sp.toFixed(0),al:+skr226Along(V,p).toFixed(0),st:e.k218&&e.k218.st||e.k226&&e.k226.st||(e.fall226?'fall':'')})}
      if(sp>45)add('jump',kind,e,{sp:+sp.toFixed(0),al:+skr226Along(V,p).toFixed(0),st:e.k218&&e.k218.st||''});
      if(!(V.air>0)&&!(kind==='sb')&&Math.hypot(p.x-V.x,p.z-V.z)<1.6)add('inHull',kind,e,{d:+Math.hypot(p.x-V.x,p.z-V.z).toFixed(1),st:e.k218&&e.k218.st||''});
    });
    const A=enemies.filter(e=>e.sr165&&!e.dead&&!e.cl&&!(e.k218&&e.k218.st==='leap'));
    for(let a=0;a<A.length;a++)for(let b=a+1;b<A.length;b++){const d=Math.hypot(A[a].m.position.x-A[b].m.position.x,A[a].m.position.z-A[b].m.position.z),need=(skr226R(A[a].sr165)+skr226R(A[b].sr165))*.5;if(d<need){add('overlap',A[a].sr165+'+'+A[b].sr165,null,{d:+d.toFixed(2),need:+need.toFixed(2)});if(d<.25){stat.stack++;const tg=(A[a].fall226?'F':'')+(A[b].fall226?'F':'')+((A[a].k218&&A[a].k218.st)||'-')+((A[b].k218&&A[b].k218.st)||'-');stat['stk_'+tg]=(stat['stk_'+tg]||0)+1}}}
    stat.ticks++;try{sr165StingTick(dt);sr165WormTick(dt)}catch(_){}
    if(V.s>P.S-90)break}
  {const cnt=()=>document.querySelectorAll('.dn').length,p0=pl.position;o.inRun=sr165In();let n=cnt();dn(p0,'123','#fff');popT(p0,'-14','#fff');dn(p0,'(8)','#fff');o.dnNum=cnt()-n;n=cnt();popT(p0,'Flung off!','#fff');popT(p0,'×5','#fff');o.dnWord=cnt()-n}
  o.stat=stat;o.per=per;o.ex=ex;o.kinds=kinds;o.s=Math.round(V.s);o.errs=errs.slice(0,8);o.err=[SKR227.err,SKR226.err,SKR218.err,SR165F.err,RP233.err];sr165End();return o}
