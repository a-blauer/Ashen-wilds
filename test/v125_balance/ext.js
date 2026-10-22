V90.OFF3=[[-1.3,0],[1.3,0],[0,1.3]];V90.OFF5=[[-1.0,.3],[1.1,.5],[-1.7,1.5],[1.5,1.3],[.2,1.7]];V90.OFF=V90.OFF5;
// extensions: 3 extra dummies around the main one (cluster), weapon swaps, companion spells
V90.X=[];V90.dmgX=0;
V90.keepX=function(){const e=V90.dum;if(!e)return;const off=V90.OFF;V90.X.forEach((q,i)=>{if(q.dead)q.dead=0;q.c.h=Math.max(q.c.h,1e8);q.stun=Math.max(q.stun||0,5);q.agg=1;q.m.position.x=e.m.position.x+off[i][0];q.m.position.z=e.m.position.z+off[i][1];q.vx=q.vz=0;if(q.atk)mCancel(q);if(q.hb)q.hb.visible=true})};
V90.addX=function(n){V90.X.forEach(q=>{try{removeE(q)}catch(_){}});V90.X=[];const e=V90.dum;for(let i=0;i<n;i++){const q=spawnEnemy(e.c.en,e.m.position.x+1,e.m.position.z,e.c.l,{});q.__x=1;q.c.st.hp=1e9;q.c.h=6e8;
  ['pd','md'].forEach(k=>q.c.st[k]=e.c.st[k]);V90.X.push(q)}V90.keepX()};
V90.wtp=function(wt,L){const T=tierOfLv(L)-1;let i=ITPL.findIndex(t=>t.sl=='weapon'&&t.wt==wt&&t.t==T&&!t.nw);if(i<0)i=ITPL.findIndex(t=>t.sl=='weapon'&&t.wt==wt&&t.t==T);return i};
V90.oneX=async function(name){V90.dmgX=0;V90.X.forEach(q=>q.dots=[]);const r=await V90.one(name);r.x=Math.round(V90.dmgX);return r};
V90.basicX=async function(sec){V90.dmgX=0;V90.X.forEach(q=>q.dots=[]);const r=await V90.basic(sec);r.x=Math.round(V90.dmgX);r.xdps=+(V90.dmgX/sec).toFixed(1);return r};
V90.wtp=function(wt,L){const T=tierOfLv(L)-1;let best=-1,bt=-1;ITPL.forEach((t,i)=>{if(t.sl=='weapon'&&t.wt==wt&&t.t<=T){const sc=t.t*2+(t.nw?0:1);if(sc>bt){bt=sc;best=i}}});return best};
{const w0=V90.wtp;V90.wtp=function(wt,L){let i=w0(wt,L);if(i<0){let bt=99;ITPL.forEach((t,j)=>{if(t.sl=='weapon'&&t.wt==wt&&t.t<bt){bt=t.t;i=j}})}return i}}
