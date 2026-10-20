// =====================================================================================================
var IDL_MD={80:1.4,81:1.3,82:1.6,83:3.2};
var IDL_FM=[80,3,81,3,82,3,83,2];
var IDM={nx:0,ny:0,hx:0,bz:0,bx:0,by:0,tz:0,tx:0,lg:0,lk:0,li:0};
{const f=mkMountRig;mkMountRig=function(k){const r=f.apply(this,arguments);try{idlMount(r)}catch(e){console.warn('idle mount',e)}return r}}
function idlMount(r){
  const o=r.rig,b=r.b;if(!o||!b)return;
  const bb=b.children.filter(c=>c.isBone),neck=bb[0],tail=bb[1],head=neck&&neck.children.find(c=>c.isBone);
  const hips=r.children.filter(c=>c.isBone&&c!==b),legs=hips.map(h=>({h:h,k:h.children.find(c=>c.isBone),fr:h.position.z>0}));
  const C={nx:neck&&idlCh(neck.rotation,'x'),ny:neck&&idlCh(neck.rotation,'y'),hx:head&&idlCh(head.rotation,'x'),bz:idlCh(b.rotation,'z'),bx:idlCh(b.rotation,'x'),by:idlCh(b.position,'y'),
    tz:tail&&idlCh(tail.rotation,'z'),tx:tail&&idlCh(tail.rotation,'x'),lh:legs.map(l=>idlCh(l.h.rotation,'x')),lz:legs.map(l=>idlCh(l.h.rotation,'z')),lk:legs.map(l=>l.k?idlCh(l.k.rotation,'x'):null)};
  const fronts=legs.map((l,i)=>l.fr?i:-1).filter(i=>i>=0),Lm=hips.length?hips[0].position.y:1;
  r._ido=Math.random()*6e4;
  r.rig=function(now,mv,sp){
    o.call(this,now+r._ido,mv,sp);
    if(!IDL.on)return;let t0=IDL.prof?IDL.pnow():0;
    try{
      let S=r._idl;if(!S)S=r._idl=idlNew(r,1.3);
      const dt=S.lt0==null?0:Math.min(.05,Math.max(0,(now-S.lt0)/1000));S.lt0=now;const A=S.sp;
      idlSp(A,0,mv?0:1,mv?.12:.5,dt);const G=r._ga,iw=idlCl(A[0],0,1)*(1-idlCl(G?G.w:(mv?1:0),0,1));
      if(iw<1e-3&&S.fid<0){if(S.on){for(const k in C){const c=C[k];if(Array.isArray(c))c.forEach(q=>idlAp(q,0));else idlAp(c,0)}S.on=0}}
      else{S.on=1;S.t+=dt;const O=IDM;for(const k in O)O[k]=0;O.li=-1;
        S.bp+=dt*S.bf*IDL_TAU;const B=Math.sin(S.bp);O.by+=.006*B;O.bx+=.008*B;
        S.wT-=dt;if(S.wT<=0){S.wg=idlRR(S,-1,1);S.wT=idlRR(S,3,7)}const W=idlSp(A,4,S.wg,1.2,dt);O.bz+=.022*W;
        S.lT-=dt;if(S.lT<=0){S.ly=idlRR(S,-.35,.35);S.lp=idlRR(S,-.08,.12);S.lT=idlRR(S,1.6,4.5)}
        O.ny+=idlSp(A,6,S.ly,.45,dt);O.nx+=idlSp(A,8,S.lp,.5,dt)+.03*Math.sin(S.t*1.3+S.tp);
        S.tp+=dt*S.tr*IDL_TAU*.4;O.tz+=.08*Math.sin(S.tp);
        if(idlFid(S,dt,!mv&&iw>.9,IDL_FM,IDL_MD)){const u=S.fu,s=S.fs;let ee;
          switch(S.fid){
            case 80:{ee=idlEnv(u,.15,.35);const up=Math.sin(Math.PI*idlSS(0,.45,u));O.nx-=.35*up;O.hx+=.15*up;O.ny+=s*.1*ee;break}// head toss
            case 81:{ee=idlEnv(u,.15,.2);const st=Math.sin(Math.PI*idlSS(.1,.6,u));O.li=fronts.length?fronts[(s>0?0:1)%fronts.length]:-1;O.lg=-.45*st;O.lk=.9*st;O.bz+=s*.01*st;break}// hoof stamp
            case 82:{ee=idlEnv(u,.1,.3);O.tz+=.5*Math.sin(u*IDL_TAU*3)*ee;O.tx-=.15*ee;break}// tail swish
            case 83:{ee=idlEnv(u,.3,.3);O.nx+=.55*ee;O.hx+=.25*ee+.03*Math.sin(u*IDL_TAU*6)*ee;break}// graze
          }}
        idlAp(C.nx,O.nx*iw);idlAp(C.ny,O.ny*iw);idlAp(C.hx,O.hx*iw);idlAp(C.bz,O.bz*iw);idlAp(C.bx,O.bx*iw);idlAp(C.by,O.by*iw*Lm);idlAp(C.tz,O.tz*iw);idlAp(C.tx,O.tx*iw);
        for(let i=0;i<C.lh.length;i++){const on=i==O.li;idlAp(C.lh[i],on?O.lg*iw:0);idlAp(C.lk[i],on?O.lk*iw*(legs[i].fr?-1:1):0);idlAp(C.lz[i],-O.bz*iw)}}
    }catch(e){if(!IDL.err){IDL.err=1;console.warn('idle mount',e)}}
    if(IDL.prof){IDL.ms+=IDL.pnow()-t0;IDL.n++}
  }}

// =====================================================================================================
// town folk: rebuilt as skinned figures on a small skeleton so they can breathe, shift and fidget
