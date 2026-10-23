// virtual clock: performance.now, Date.now, setTimeout/setInterval, rAF all run on VT; F.step advances 16 ms of game time
window.F={VT:performance.now(),D0:Date.now()-performance.now(),q:[],id:1,
 step(n){n=n||1;for(let k=0;k<n;k++){F.VT+=16;let g=0;while(g++<5000){let bi=-1,bt=1/0;for(let i=0;i<F.q.length;i++)if(F.q[i].t<=F.VT&&F.q[i].t<bt){bt=F.q[i].t;bi=i}if(bi<0)break;const T=F.q.splice(bi,1)[0];if(T.iv){T.t+=Math.max(1,T.iv);F.q.push(T)}try{T.fn.apply(null,T.a)}catch(e){console.warn('tm',e&&e.message)}}
   hero.hp=Math.max(hero.hp,heroMax()*.9);try{loop(F.VT)}catch(e){console.warn('loop',e&&e.message)}}}};
performance.now=()=>F.VT;Date.now=()=>F.D0+F.VT;window.requestAnimationFrame=()=>0;
window.setTimeout=(fn,ms,...a)=>{if(typeof fn!='function')return 0;const id=F.id++;F.q.push({id,t:F.VT+(+ms||0),fn,a});return id};
window.setInterval=(fn,ms,...a)=>{const id=F.id++;F.q.push({id,t:F.VT+Math.max(1,+ms||1),iv:Math.max(1,+ms||1),fn,a});return id};
window.clearTimeout=window.clearInterval=id=>{F.q=F.q.filter(T=>T.id!==id)};
ren.render=function(){};try{POST.render=function(){}}catch(_){}
try{CHEAT.god=true}catch(_){}
// synchronous replacements for the V90 drivers
V90.wait=function(sec){const g0=V90.gt;let n=0;while(V90.gt-g0<sec&&n++<20000)F.step()};
V90.basicS=function(sec){V90.home0();hero.cr=0;V90.wait(.4);V90.dmg=V90.n=V90.dot=0;V90.dmgX=0;V90.X.forEach(q=>q.dots=[]);const g0=V90.gt;let n=0;
  while(V90.gt-g0<sec&&n++<20000){tgt=V90.dum;hero.cr=0;if(V90.far()&&!hero.dash)V90.home0();face(kqsDir(pl.position,V90.dum.m.position));try{swing()}catch(err){}F.step()}
  V90.wait(.8);const T=V90.gt-g0;return {dmg:Math.round(V90.dmg),hits:V90.n,dps:+(V90.dmg/T).toFixed(1),hit:+(V90.n?(V90.dmg-V90.dot)/V90.n:0).toFixed(1),xdps:+(V90.dmgX/T).toFixed(1),dotdps:+(V90.dot/T).toFixed(1),as:+HS().as.toFixed(3)}};
V90.oneS=function(name,cr){kqsClear();hero.chan=null;hero.tal.__ld=name;KQS.ck='';hero.cd={};KQS.cdn={};hero.buffs=[];hsDirty();V90.home0();hero.mp=9999;V90.inf=1;
  const sk=heroSkills()[0];if(!sk||sk.n!==name)return {n:name,err:'not equipped'};hero.cr=cr==null?(sk.spend?100:0):cr;hero.crT=nowP();try{resUI()}catch(_){}V90.wait(.1);
  V90.dum.dots=[];V90.X.forEach(q=>q.dots=[]);V90.dmg=V90.n=V90.dot=0;V90.dmgX=0;tgt=V90.dum;const g0=V90.gt;cast(0);if(sk.gt&&KQS.tg){KQS.tg.p=V90.dum.m.position.clone();kqsTgFire()}
  const cd=hero.cd.s0||0;if(cd<=0){V90.inf=0;return {n:name,fail:1}}
  const max=Math.min(18,Math.max(4,(sk.dur||0)+(sk.k=='trap'||/trap|mine|frost/.test(sk.x||'')?2:0)+2.5));let n=0;
  while(n++<20000){const el=V90.gt-g0;if(traps.length)V90.dum.m.position.copy(traps[0].p);if(el>=max||(el>3.6&&V90.quiet()))break;tgt=V90.dum;F.step()}
  V90.inf=0;return {n:name,dmg:Math.round(V90.dmg),dot:Math.round(V90.dot),x:Math.round(V90.dmgX),cd:+cd.toFixed(2),mp:sk.mp,t:+(V90.gt-g0).toFixed(1),lv:sk.lv,spend:!!sk.spend,gt:sk.gt?sk.sh:''}};
V90.rotS=function(names,sec){kqsClear();hero.chan=null;hero.tal.__ld=names.join('|');KQS.ck='';hero.cd={};KQS.cdn={};hero.buffs=[];hero.cr=0;hsDirty();V90.home0();hero.mp=mpMax();V90.inf=0;try{resUI()}catch(_){}
  V90.wait(.2);V90.dum.dots=[];V90.X.forEach(q=>q.dots=[]);V90.dmg=V90.n=V90.dot=0;V90.dmgX=0;const g0=V90.gt;let casts=0,n=0;
  while(V90.gt-g0<sec&&n++<40000){tgt=V90.dum;if(V90.far()&&!hero.dash&&!KQS.ch)V90.home0();
    const L=heroSkills();for(let i=0;i<L.length;i++){if((hero.cd['s'+i]||0)<=0&&hero.mp>=L[i].mp&&!hero.chan&&!KQS.ch){const c0=hero.cd['s'+i]||0;try{cast(i);if(L[i].gt&&KQS.tg){KQS.tg.p=V90.dum.m.position.clone();kqsTgFire()}}catch(err){}if((hero.cd['s'+i]||0)>c0){casts++;break}}}
    face(kqsDir(pl.position,V90.dum.m.position));try{swing()}catch(err){}F.step()}
  const T=V90.gt-g0;kqsClear();return {dps:+(V90.dmg/T).toFixed(1),xdps:+(V90.dmgX/T).toFixed(1),casts}};

// fighting distance: melee at ~70% of the weapon's reach, ranged at 2.2; back to it when pushed outside [D/2, reach]
V90.reach=function(){const C=CLS[hero.cls],wt=curWT();if(C.atk=='bow'||C.atk=='staff'||wt=='knives')return 0;return C.rng*(MW[wt]?MW[wt].rg:(wt=='gs'||wt=='ga'?1.08:1))};
V90.far=function(){const q=d2(pl.position,V90.dum.m.position),R=V90.reach();if(!R)return q>3.2||q<1.2;return q>R*.95||q<R*.35};
V90.home0=function(){const R=V90.reach(),D=R?Math.min(2.2,R*.7):2.2;pl.position.x=V90.home[0];pl.position.z=V90.home[1]+2.2-D;pl.position.y=GH(pl.position.x,pl.position.z);hero.dash=null;pl.step=null;face(kqsDir(pl.position,V90.dum.m.position))};
