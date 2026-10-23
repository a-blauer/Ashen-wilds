// ================= v137: the 19 armour motifs (helm · chest · boots) =================
// Local builders work in a small frame: origin on the surface, +z out of it, +y up (a7Put turns them onto the body).
// Long pieces (drapes, vines, rib bones, bandoliers) are laid along the measured surface in world space.
function a7L(ctx,at,u,sc,build,bn,w){if(!at)return;
  // on the head, a spot that falls in an ear moves down (same angle) until it is clear of it
  if(ctx.H&&ctx.ear&&ctx.ear(at.p)&&at.n[1]<.5){const th=Math.atan2(at.n[0],at.n[2]);let ok=null;for(let j=1;j<=5&&!ok;j++){const S=ctx.S(ctx.H.y-at.p[1]+.02*j,.015);if(!S.ok)continue;const q=S.at(th,.005);if(!ctx.ear(q.p))ok=q}if(!ok)return;at=ok}a7Put(ctx.k,bn||ctx.bn,at.p,at.n,u||[0,1,0],sc||1,build,w||a7NearW(ctx.B,at.p)||ctx.w||null)}
// the crown of the head: a frame with +z up and +y forward
function a7Crown(ctx,dz,clr){const t=ctx.H.top;return {p:[t[0],t[1]+(clr||.004),t[2]+(dz||0)],n:[0,1,0]}}
// ---- small local pieces ----
function l7Eye(t,s,C,lid){const g=C.gl;t.p('','cyl','m',C.T,0,0,.006*s,.03*s,.012*s,.026*s,Math.PI/2);t.p('','hem','c',0xe8e0d0,0,0,.01*s,.022*s,.02*s,.016*s,Math.PI/2);
  t.p('','cyl','g',g,0,0,.026*s,.012*s,.004*s,.012*s,Math.PI/2);t.p('','box','c',0x050505,0,0,.029*s,.003*s,.016*s,.002*s);
  if(lid!==false){t.p('','hem','c',C.M,0,.006*s,.012*s,.026*s,.012*s,.02*s,Math.PI/2-.5);t.p('','hem','c',mdSh(C.M,.8),0,-.008*s,.012*s,.026*s,.008*s,.02*s,-Math.PI/2+.6)}}
function l7Skull(t,s,col){gkSkull(t,'',0,0,.03*s,s,col||0xd8ccb0,0,null)}
function l7Spike(t,len,r,col,dir){const d=dir||[0,0,1];t.L('','m',col,[0,0,0],[d[0]*len,d[1]*len,d[2]*len],r,r*.08,5);t.p('','cyl','m',mdSh(col,.7),0,0,.003,r*1.25,.006,r*1.25,Math.PI/2)}
function l7Candle(t,s,ax){// a candle standing along +y (ax 'z': along +z)
  const T=ax=='z'?(x,y,z)=>[x,-z,y]:(x,y,z)=>[x,y,z],q=(x,y,z)=>T(x,y,z);const e=ax=='z'?Math.PI/2:0;
  let p=q(0,.02*s,0);t.p('','cyl','c',0xe8e0c8,p[0],p[1],p[2],.011*s,.04*s,.011*s,e);
  for(let i=0;i<3;i++){const a=i*2.1;p=q(Math.sin(a)*.01*s,.01*s-i*.004*s,Math.cos(a)*.01*s);t.p('','box','c',0xf4ecd8,p[0],p[1],p[2],.004*s,.02*s,.004*s,e)}
  p=q(0,.045*s,0);t.p('','cyl','c',0x1a1410,p[0],p[1],p[2],.0015,.008*s,.0015,e);p=q(0,.056*s,0);t.p('','cone4','g',0xffb040,p[0],p[1],p[2],.006*s,.02*s,.006*s,e);
  p=q(0,.002*s,0);t.p('','cyl','m',0x8a7a5a,p[0],p[1],p[2],.017*s,.005*s,.017*s,e)}
function l7Seal(t,s,col){t.p('','cyl','c',col||0x8a1a1a,0,0,.004*s,.022*s,.008*s,.022*s,Math.PI/2);t.p('','cyl','c',mdSh(col||0x8a1a1a,1.25),0,0,.008*s,.014*s,.004*s,.014*s,Math.PI/2);
  [-1,1].forEach(q=>t.p('','box','c',0xd8ccaa,q*.008*s,-.04*s,.002,.014*s,.06*s,.002,0,0,q*.12))}
function l7Crystal(t,s,g,n,seed){let h=seed||1;const Rr=()=>{h=(h*16807)%2147483647;return h/2147483647};for(let i=0;i<(n||4);i++){const a=(Rr()-.5)*1.4,b=(Rr()-.5)*1.4,L=(.04+Rr()*.05)*s;
  t.L('','g',i%2?g:mdSh(g,1.3),[(Rr()-.5)*.02*s,(Rr()-.5)*.02*s,0],[Math.sin(a)*L*.6,Math.sin(b)*L*.6,L],.012*s,.001,4)}}
function l7Moon(t,s,col,glow){for(let i=0;i<9;i++){const a0=-1.2+i*.27,a1=a0+.27,r=.035*s,w=Math.sin((i+.5)/9*Math.PI)*.01*s+.003*s;
    t.L('','m',col,[Math.cos(a0)*r,Math.sin(a0)*r,.004*s],[Math.cos(a1)*r,Math.sin(a1)*r,.004*s],w,w,4)}
  if(glow)t.p('','oct','g',glow,-.008*s,0,.006*s,.006*s,.009*s,.003*s)}
function l7Fang(t,len,r,col,dir){const d=dir||[0,-1,0];t.L('','c',col,[0,0,.004],[d[0]*len,d[1]*len,d[2]*len+.004],r,r*.1,4)}
function l7Feather(t,len,wd,col,dir){gkFeather(t,'',[0,0,.004],dir||[0,1,.2],len,wd,col,null)}
function l7Knife(t,s,steel,hilt){t.p('','box','c',hilt||0x2a1a12,0,.025*s,.006*s,.012*s,.04*s,.01*s);t.p('','box','m',0x8a8a7a,0,.004*s,.006*s,.022*s,.006*s,.012*s);
  t.p('','box','m',steel||0x9aa2ae,0,-.03*s,.006*s,.01*s,.06*s,.003*s);t.p('','cone4','m',steel||0x9aa2ae,0,-.065*s,.006*s,.006*s,.014*s,.002*s,Math.PI,Math.PI/4)}
function l7Vial(t,s,g,T){gkVial(t,'',0,0,.014*s,s,g,T,null)}
function l7Web(t,s,col,n){const R=.05*s,sp=n||6;for(let i=0;i<sp;i++){const a=i/sp*Math.PI*2;t.L('','c',col,[0,0,.002],[Math.cos(a)*R,Math.sin(a)*R,.002],.0016,.0012,3)}
  [.4,.7,1].forEach(f=>{for(let i=0;i<sp;i++){const a=i/sp*Math.PI*2,b=(i+1)/sp*Math.PI*2;t.L('','c',col,[Math.cos(a)*R*f,Math.sin(a)*R*f,.002],[Math.cos(b)*R*f*.94,Math.sin(b)*R*f*.94,.002],.0012,.0012,3)}})}
function l7Spider(t,s,body,eye){t.p('','sph','c',body,0,-.006*s,.01*s,.012*s,.016*s,.009*s);t.p('','sph','c',body,0,.012*s,.009*s,.008*s,.008*s,.007*s);
  for(let i=0;i<4;i++)[-1,1].forEach(q=>{const y=.012*s-i*.007*s;t.L('','c',body,[q*.006*s,y,.01*s],[q*.02*s,y+.006*s-i*.002*s,.008*s],.0018*s,.0016*s,3);t.L('','c',body,[q*.02*s,y+.006*s-i*.002*s,.008*s],[q*.028*s,y-.01*s-i*.004*s,.002],.0016*s,.001,3)});
  [-1,1].forEach(q=>t.p('','sph','g',eye,q*.003*s,.016*s,.015*s,.0022*s))}
function l7Rune(t,s,g,T){t.p('','ring','m',T,0,0,.003*s,.04*s,.03,.04*s,Math.PI/2);t.p('','ring','g',g,0,0,.004*s,.03*s,.02,.03*s,Math.PI/2);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;t.p('','box','g',g,Math.cos(a)*.02*s,Math.sin(a)*.02*s,.005*s,.003*s,.012*s,.002,0,0,a)}
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2+Math.PI/2,b=a+Math.PI*2/3;t.L('','g',g,[Math.cos(a)*.03*s,Math.sin(a)*.03*s,.005*s],[Math.cos(b)*.03*s,Math.sin(b)*.03*s,.005*s],.0018*s,.0018*s,3)}}
function l7Scroll(t,s,T,ry){gkScroll(t,'',0,0,.014*s,s,T,ry||0,null)}
function l7Bone(t,a,b,r,col){gkBone(t,'',a,b,r,col||0xd8ccb0,null)}
// ---- a ring of points round a section (helm bands, cuffs) ----
function a7Band(S,th0,th1,n,clr,ctx){const out=[];for(let i=0;i<=n;i++){const th=th0+(th1-th0)*i/n,q=S.at(th,clr);if(ctx&&ctx.ear&&ctx.ear(q.p))continue;q.i=i;out.push(q)}return out}
// contiguous runs of a band (where points were left out round the ears)
function a7Runs(L){const R=[];let cur=[];L.forEach((q,j)=>{if(j&&q.i!=L[j-1].i+1){if(cur.length>1)R.push(cur);cur=[]}cur.push(q)});if(cur.length>1)R.push(cur);return R}
// ---------------------------------------------------------------------------------------------------------------
var A7MOT={
 // ---- Gravewarden: chains ----
 chain:{
  helm(c){const S=c.S(.075,.02);if(!S.ok)return;a7Runs(a7Band(S,-1.5,1.5,14,.008,c)).forEach(R=>gkChain(c.k,'head',R.map(a=>a.p),.0075,c.C.T,null));
    a7L(c,S.at(0,.012),[0,1,0],1,t=>{t.p('','box','m',0x3a3a40,0,-.022,.006,.034,.03,.012);t.p('','ring','m',0x5a5a60,0,.002,.006,.012,.08,.012,Math.PI/2);t.p('','box','c',0x0a0a0a,0,-.024,.013,.005,.01,.002)})},
  chest(c){[-1,1].forEach(s=>{const P=c.path([[.98,s*.7],[.93,s*.45],[.86,s*.2],[.8,0],[.74,-s*.25],[.68,-s*.45]],.01);gkChain(c.k,'chest',P,.009,c.C.T,A7W)});
    const S=c.S(.8,.03);if(S.ok)a7L(c,S.at(0,.02),[0,1,0],1.2,t=>{t.p('','box','m',0x3a3a40,0,-.022,.006,.036,.032,.014);t.p('','ring','m',0x5a5a60,0,.004,.006,.013,.08,.013,Math.PI/2);t.p('','box','c',0x0a0a0a,0,-.026,.014,.006,.012,.002)},'spine',mdTorsoW(.8));
    [-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.3,1,0]},[0,0,1],1,u=>{gkChain(u,'',[[0,-.07,.006],[0,-.035,.012],[0,0,.014],[0,.035,.012],[0,.07,.006]],.008,c.C.T,null);u.p('','box','m',0x3a3a40,0,0,.024,.02,.024,.012)},q.bn,[[q.bn,1]])})},
  boots(c){const S=c.S(.1,.03);if(!S.ok)return;const P=a7Band(S,0,Math.PI*2,16,.008).map(a=>a.p);gkChain(c.k,c.bn,P,.007,c.C.T,c.nw);
    a7L(c,S.at(c.s*Math.PI/2,.012),[0,1,0],.9,t=>{t.p('','ring','m',0x4a4a50,0,-.02,.006,.02,.12,.02,Math.PI/2);t.p('','cyl','m',0x3a3a40,0,-.044,.006,.008,.02,.008)})}},
 // ---- Bonelord: bones ----
 bone:{
  helm(c){// a crest of finger bones along the top and rib bones sweeping back from the temples
    for(let i=0;i<5;i++){const dz=.05-i*.028,S=c.S(.012+Math.abs(i-1.2)*.008,.02);a7L(c,a7Crown(c,dz,.002+Math.abs(i-1.5)*-.002),[0,0,1],1,u=>l7Bone(u,[0,0,0],[0,-.005,.05-Math.abs(i-1.5)*.008],.007,c.C.bone))}
    [-1,1].forEach(s=>{const S=c.S(.07,.03);if(!S.ok)return;a7L(c,S.at(s*1.35,.006),[0,1,0],1,u=>{u.L('','c',c.C.bone,[0,0,.004],[-s*.02,.03,.03],.009,.007,5);u.L('','c',c.C.bone,[-s*.02,.03,.03],[-s*.06,.04,.03],.007,.003,5);u.p('','sph','c',c.C.bone,0,0,.006,.013)})})},
  chest(c){// ribs over the breast, a sternum, a femur on each shoulder
    [.92,.86,.8].forEach((y,i)=>[-1,1].forEach(s=>{const P=c.path([[y,s*.1],[y-.01,s*.3],[y-.024,s*.5]],.006);a7Tube(c.k,'chest',P,.009,.005,c.C.bone,'c',A7W,5)}));
    {const P=c.path([[.95,0],[.9,0],[.84,0],[.78,0]],.008);a7Tube(c.k,'chest',P,.011,.009,mdSh(c.C.bone,.92),'c',A7W,6);if(P.length)gkW(c.k.p('chest','sph','c',c.C.bone,P[0][0],P[0][1],P[0][2],.016),A7W(P[0]))}
    [-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.25,1,0]},[0,0,1],1,u=>{l7Bone(u,[-.045,0,.01],[.045,0,.01],.01,c.C.bone);u.p('','box','c',0x4a3020,0,0,.008,.016,.03,.026)},q.bn,[[q.bn,1]])});
    const S=c.S(.6,.03);if(S.ok)a7L(c,S.at(0,.004),[0,1,0],1.3,u=>l7Skull(u,1,c.C.bone),'pelvis',[['pelvis',1]])},
  boots(c){const S=c.S(.19,.08);if(!S.ok)return;a7L(c,S.at(0,.004),[0,1,0],1,u=>{l7Bone(u,[0,-.08,.01],[0,.08,.01],.009,c.C.bone);[-.04,.04].forEach(y=>u.p('','box','c',0x3a2618,0,y,.006,.04,.01,.016))});
    const S2=c.S(.29,.03);if(S2.ok)a7L(c,S2.at(0,.004),[0,1,0],.9,u=>l7Skull(u,1,c.C.bone))}},
 // ---- Briarsworn: thorns ----
 thorn:{
  helm(c){const S=c.S(.06,.025);if(!S.ok)return;a7Runs(a7Band(S,0,Math.PI*2,24,.008,c)).forEach(R=>{const P=R.map(a=>[a.p[0],a.p[1]+Math.sin(a.i*1.7)*.008,a.p[2]]);
    a7Tube(c.k,'head',P,.007,.007,0x2a3a1e,'c',null,4);R.forEach((a,i)=>{if(a.i%2)return;const p=P[i];c.k.L('head','c',0x4a3a24,p,[p[0]+a.n[0]*.03,p[1]+.012,p[2]+a.n[2]*.03],.005,.0005,4)})});
    a7L(c,S.at(.35,.012),[0,1,0],1,u=>{u.p('','sph','c',c.C.acc,0,0,.012,.016,.014,.014);u.p('','sph','c',mdSh(c.C.acc,.7),0,0,.018,.009,.008,.008);[0,1,2].forEach(i=>u.p('','cone4','c',0x2a4a1e,Math.cos(i*2.1)*.016,Math.sin(i*2.1)*.016,.006,.008,.018,.003,0,0,i*2.1-Math.PI/2))})},
  chest(c){const P=c.path([[.99,-.75],[.95,-.5],[.9,-.2],[.85,.05],[.8,.3],[.74,.5],[.68,.6],[.62,.55]],.01);a7Tube(c.k,'chest',P,.01,.008,0x2a3a1e,'c',A7W,5);
    P.forEach((p,i)=>{if(i==0)return;[-1,1].forEach(q=>{const n=[p[0]*1.0,0,p[2]];const L=Math.hypot(n[0],n[2])||1;gkW(c.k.L('chest','c',0x4a3a24,p,[p[0]+n[0]/L*.03+q*.01,p[1]+q*.015,p[2]+n[2]/L*.03],.006,.0006,4),A7W(p))})});
    const S=c.S(.88,.025);if(S.ok)a7L(c,S.at(-.25,.02),[0,1,0],1.2,u=>{u.p('','sph','c',c.C.acc,0,0,.012,.018,.016,.016);u.p('','sph','c',mdSh(c.C.acc,.7),0,0,.02,.01,.009,.009);for(let i=0;i<4;i++)u.p('','cone4','c',0x2a4a1e,Math.cos(i*1.57+.7)*.02,Math.sin(i*1.57+.7)*.02,.006,.009,.022,.003,0,0,i*1.57+.7-Math.PI/2)},'chest');
    [-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.3,1,0]},[0,0,1],1,u=>{for(let i=0;i<4;i++)l7Fang(u,.035,.006,0x3a2a1a,[(i-1.5)*.4,0,1])},q.bn,[[q.bn,1]])})},
  boots(c){const P=[];for(let i=0;i<=14;i++){const y=.04+i*.019,S=c.S(y,.012);if(!S.ok)continue;P.push(S.at(c.s*(i*.55),.007))}
    a7Tube(c.k,c.bn,P.map(a=>a.p),.006,.005,0x2a3a1e,'c',c.nw,4);P.forEach((a,i)=>{if(i%2)return;const p=a.p;gkW(c.k.L(c.bn,'c',0x4a3a24,p,[p[0]+a.n[0]*.025,p[1]+.01,p[2]+a.n[2]*.025],.005,.0005,4),c.nw(p))})}},
 // ---- Reliquarian: candles and purity seals ----
 candle:{
  helm(c){[[0,-.012],[-.035,.012],[.035,.012]].forEach(([x,dz],i)=>a7L(c,{p:[c.H.top[0]+x,c.H.top[1]-.004-Math.abs(x)*.5,c.H.top[2]+dz],n:[x*3,1,0]},[0,0,1],i?1.2:1.45,u=>l7Candle(u,1,'z')));
    const S=c.S(.08,.02);if(S.ok)a7L(c,S.at(0,.006),[0,1,0],.9,u=>l7Seal(u,1,0x8a1a1a))},
  chest(c){[-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[0,1,0]},[0,0,1],1.35,u=>{l7Candle(u,1,'z');u.p('','cyl','m',c.C.T,0,0,.002,.02,.006,.02,Math.PI/2);[[.022,.01],[-.016,-.016]].forEach(([x,y])=>{u.p('','cyl','c',0xe8e0c8,x,y,.012,.008,.024,.008,Math.PI/2)})},q.bn,[[q.bn,1]])});
    const S=c.S(.88,.03);if(S.ok){a7L(c,S.at(.3,.004),[0,1,0],1.2,u=>l7Seal(u,1,0x8a1a1a),'chest');a7L(c,S.at(-.35,.004),[0,1,0],1,u=>l7Seal(u,1,0x6a1a5a),'chest')}
    const S2=c.S(.62,.03);if(S2.ok)a7L(c,S2.at(-.6,.006),[0,1,0],1,u=>{gkBook(u,'',0,-.03,.016,1,0x5a1a1a,c.C.T,0,null);u.L('','m',c.C.T,[0,.006,.012],[0,.03,.004],.003,.003,3)},'pelvis',[['pelvis',1]])},
  boots(c){const S=c.S(.2,.03);if(S.ok)a7L(c,S.at(c.s*.3,.004),[0,1,0],.9,u=>l7Seal(u,1,0x8a1a1a))}},
 // ---- Dreadknight: spikes ----
 spike:{
  helm(c){for(let i=0;i<5;i++){const dz=.06-i*.03;a7L(c,a7Crown(c,dz,-.004),[0,0,1],1,u=>l7Spike(u,.05+(i==1||i==2?.03:0),.012,c.C.T,[0,-.15,1]))}
    [-1,1].forEach(s=>{const S=c.S(.06,.03);if(S.ok)a7L(c,S.at(s*1.45,.004),[0,1,0],1,u=>l7Spike(u,.06,.012,c.C.T,[0,.35,1]))})},
  chest(c){[-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.35,1,0]},[0,0,1],1,u=>{[[-.03,0],[0,.02],[.03,0]].forEach(([x,y],i)=>l7Spike(u,i==1?.08:.06,.014,c.C.T,[x*6,y*4,1]))},q.bn,[[q.bn,1]])});
    const P=c.path([[.9,-.6],[.9,-.3],[.9,0],[.9,.3],[.9,.6]],.004);P.forEach((p,i)=>{const L=Math.hypot(p[0],p[2]-.0)||1;gkW(c.k.L('chest','m',c.C.T,p,[p[0]+p[0]/L*.025,p[1],p[2]+Math.max(.3,p[2]/L)*.025],.008,.001,4),A7W(p))});
    const S=c.S(.75,.03);if(S.ok)a7L(c,S.at(0,.004),[0,1,0],1.25,u=>{l7Skull(u,1,0xc8c0b0);[-1,1].forEach(q=>l7Spike(u,.03,.006,c.C.T,[q*.8,.6,.4]))},'spine')},
  boots(c){const S=c.S(.3,.03);if(S.ok)a7L(c,S.at(0,.004),[0,1,0],1,u=>{u.p('','hem','m',c.C.T,0,0,.002,.03,.012,.03,Math.PI/2);l7Spike(u,.045,.011,c.C.T,[0,.2,1])});
    const S2=c.S(.14,.03);if(S2.ok)a7L(c,S2.at(c.s*Math.PI/2,.004),[0,1,0],1,u=>{l7Spike(u,.03,.008,c.C.T,[0,.3,1]);u.p('','cyl','m',c.C.T,0,.03,.004,.008,.006,.008,Math.PI/2)})}},
 // ---- Abyssal & Starless: eyes ----
 eye:{
  helm(c){const S=c.S(.06,.025);if(S.ok){a7L(c,S.at(0,.006),[0,1,0],1.3,u=>l7Eye(u,1,c.C));[-1,1].forEach(s=>a7L(c,S.at(s*1.0,.006),[0,1,0],.7,u=>l7Eye(u,1,c.C)))}
    if(c.C.lv>=3)[-1,1].forEach(s=>{const S2=c.S(.03,.02);if(S2.ok)a7L(c,S2.at(s*1.6,.004),[0,1,0],1,u=>{u.L('','c',mdSh(c.C.M,.8),[0,0,.004],[0,.05,.04],.012,.008,5);u.L('','c',mdSh(c.C.M,.6),[0,.05,.04],[0,.1,.02],.008,.001,5)})})},
  chest(c){const S=c.S(.86,.04);if(S.ok){a7L(c,S.at(0,.006),[0,1,0],1.8,u=>{l7Eye(u,1,c.C);for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.3;u.L('','g',c.C.gl,[Math.cos(a)*.032,Math.sin(a)*.032,.005],[Math.cos(a+.3)*.06,Math.sin(a+.3)*.06,.003],.0022,.001,3)}},'chest')}
    [-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.5,1,0]},[0,0,1],.8,u=>l7Eye(u,1,c.C),q.bn,[[q.bn,1]])});
    const S2=c.S(.68,.03);if(S2.ok)[-1,1].forEach(s=>a7L(c,S2.at(s*.35,.006),[0,1,0],.6,u=>l7Eye(u,1,c.C),'spine'))},
  boots(c){const S=c.S(.22,.03);if(S.ok)a7L(c,S.at(0,.006),[0,1,0],.8,u=>l7Eye(u,1,c.C))}},
 // ---- Trapper & Shadowfang: fangs and claws ----
 fang:{
  helm(c){const S=c.S(.085,.015);if(!S.ok)return;a7Band(S,-1.1,1.1,8,.004,c).forEach((a,i)=>a7L(c,a,[0,1,0],1,u=>l7Fang(u,i%2?.03:.045,.007,c.C.bone,[0,-1,.25])))},
  chest(c){const P=c.path([[.99,-.7],[.95,-.45],[.92,-.2],[.91,0],[.92,.2],[.95,.45],[.99,.7]],.006);gkW(c.k,null);for(let i=0;i<P.length-1;i++)gkW(c.k.L('chest','c',0x3a2618,P[i],P[i+1],.003,.003,3),A7W(P[i]));
    const S=c.S(.9,.03);if(S.ok)a7Band(S,-.7,.7,8,.008).forEach((a,i)=>a7L(c,a,[0,1,0],1,u=>l7Fang(u,i==4?.06:.04-Math.abs(i-4)*.002,.008,i%3?c.C.bone:0xe8e0d0,[0,-1,.2]),'chest'));
    [-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.3,1,0]},[0,0,1],1,u=>{for(let i=0;i<3;i++)u.L('','c',0x2a2a2a,[(i-1)*.014,-.01,.004],[(i-1)*.02,.02,.025],.006,.0008,4);u.p('','box','c',mdSh(c.C.M,.9),0,-.01,.004,.05,.02,.01)},q.bn,[[q.bn,1]])})},
  boots(c){const S=c.S(.3,.015);if(!S.ok)return;a7Band(S,-1.4,1.4,6,.004).forEach((a,i)=>a7L(c,a,[0,1,0],1,u=>l7Fang(u,.03,.006,c.C.bone,[0,1,.25])))}},
 // ---- Crowfeather & Ravenkin: feathers ----
 feather:{
  helm(c){const S=c.S(.04,.025);if(!S.ok)return;[-1,1].forEach(s=>{const a=S.at(s*1.9,.006);a7L(c,a,[0,1,0],1,u=>{for(let i=0;i<4;i++)l7Feather(u,.08+i*.012,.012,i%2?0x1a1a22:0x2a2a3a,[s*(.3-i*.1)*-1,1,-.1-i*.15])})});
    a7L(c,S.at(Math.PI,.006),[0,1,0],1,u=>{for(let i=0;i<3;i++)l7Feather(u,.1,.014,0x14141a,[(i-1)*.3,1,-.6])})},
  chest(c){[-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.2,1,0]},[0,0,1],1,u=>{for(let i=0;i<6;i++){const a=(i/5-.5)*2.2;u.p('','oct','c',i%2?0x1a1a22:0x2a2a36,Math.sin(a)*.03,Math.cos(a)*.03-.01,.006,.012,.035,.003,0,0,-a)}},q.bn,[[q.bn,1]])});
    const P=c.path([[.99,-.6],[.97,-.35],[.96,0],[.97,.35],[.99,.6]],.006);P.forEach((p,i)=>{const L=Math.hypot(p[0],p[2])||1;gkW(c.k,null);gkFeather(c.k,'chest',p,[p[0]/L*.3,-1,p[2]/L*.6],.07,.012,i%2?0x14141a:0x2a2a3a,A7W(p))})},
  boots(c){const S=c.S(.26,.02);if(S.ok)a7L(c,S.at(c.s*Math.PI/2,.006),[0,1,0],1,u=>{for(let i=0;i<3;i++)l7Feather(u,.07,.011,i%2?0x1a1a22:0x2a2a36,[0,1,-.4-i*.3])})}},
 // ---- Bogstalker: roots, moss and toadstools ----
 root:{
  helm(c){[-1,1].forEach(s=>{const S=c.S(.05,.02);if(!S.ok)return;a7L(c,S.at(s*1.3,.004),[0,1,0],1,u=>{u.L('','c',0x4a3a24,[0,0,.004],[s*.01,.04,.03],.008,.006,5);u.L('','c',0x4a3a24,[s*.01,.04,.03],[s*.03,.08,.02],.006,.003,5);u.L('','c',0x4a3a24,[s*.01,.04,.03],[-s*.015,.065,.045],.004,.001,4);
      u.p('','dod','c',0x4a6a2a,0,-.004,.008,.016,.01,.012)})});
    a7L(c,a7Crown(c,0,-.002),[0,0,1],1,u=>{u.p('','dod','c',0x4a6a2a,0,0,0,.03,.03,.012);u.p('','cyl','c',0xd8ccb0,.01,0,.012,.004,.016,.004,Math.PI/2);u.p('','hem','c',0x8a3a2a,.01,0,.02,.012,.008,.012,Math.PI/2)})},
  chest(c){[-1,1].forEach(s=>{const P=c.path([[1.0,s*.8],[.95,s*.6],[.88,s*.5],[.8,s*.55],[.72,s*.5]],.006);a7Tube(c.k,'chest',P,.009,.004,0x4a3a24,'c',A7W,5)});
    const S=c.S(.9,.03);if(S.ok)[.5,-.4].forEach((th,i)=>a7L(c,S.at(th,.004),[0,1,0],1,u=>{u.p('','dod','c',i?0x3a5a22:0x4a6a2a,0,0,.006,.03,.022,.014);u.p('','cyl','c',0xd8ccb0,.01,.008,.016,.003,.014,.003);u.p('','hem','c',0x8a4a2a,.01,.016,.016,.01,.007,.01)},'chest'));
    [-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.3,1,0]},[0,0,1],1,u=>u.p('','dod','c',0x3a5a22,0,0,.004,.035,.03,.012),q.bn,[[q.bn,1]])})},
  boots(c){const P=[];for(let i=0;i<=8;i++){const y=.03+i*.02,S=c.S(y,.012);if(S.ok)P.push(S.at(c.s*(1.5-i*.7),.006).p)}a7Tube(c.k,c.bn,P,.007,.004,0x4a3a24,'c',c.nw,4);
    const S=c.S(.06,.02);if(S.ok)a7L(c,S.at(c.s*1.2,.004),[0,1,0],1,u=>u.p('','dod','c',0x3a5a22,0,0,.004,.02,.014,.01))}},
 // ---- Hornwood: antlers ----
 horn:{
  helm(c){const S=c.S(.03,.02);if(!S.ok)return;[-1,1].forEach(s=>a7L(c,S.at(s*1.25,.002),[0,1,0],1,u=>{const A=0xd8c8a0,B2=0xb8a880;
    u.L('','c',A,[0,0,0],[s*.02,.05,.03],.011,.009,5);u.L('','c',A,[s*.02,.05,.03],[s*.03,.11,.02],.009,.006,5);u.L('','c',B2,[s*.03,.11,.02],[s*.02,.16,-.02],.006,.002,5);
    u.L('','c',B2,[s*.02,.05,.03],[-s*.01,.09,.06],.006,.002,5);u.L('','c',B2,[s*.03,.11,.02],[s*.05,.14,.05],.005,.001,4);u.p('','cyl','c',0x5a3e28,0,0,.004,.016,.01,.016,Math.PI/2)}))},
  chest(c){[-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.3,1,0]},[0,0,1],1,u=>{u.L('','c',0xd8c8a0,[-.03,0,.006],[.04,0,.02],.008,.004,5);u.L('','c',0xc8b890,[.0,0,.01],[.02,.02,.04],.005,.001,4)},q.bn,[[q.bn,1]])});
    const S=c.S(.86,.03);if(S.ok)[-1,1].forEach(s=>a7L(c,S.at(s*.45,.004),[0,1,0],1,u=>{u.L('','c',0xd8c8a0,[0,.015,.006],[0,-.015,.008],.006,.004,4);u.p('','box','c',0x3a2618,0,0,.002,.03,.006,.004)},'chest'))},
  boots(c){const S=c.S(.08,.02);if(S.ok)a7L(c,S.at(Math.PI,.004),[0,1,0],1,u=>{u.L('','c',0xd8c8a0,[0,0,.004],[0,-.01,.04],.007,.001,4);u.p('','cyl','m',0x8a7a5a,0,0,.004,.012,.006,.012,Math.PI/2)})}},
 // ---- Gravehound & Soulreaver: skulls ----
 skull:{
  helm(c){const S=c.S(.06,.03);if(!S.ok)return;a7L(c,S.at(0,.004),[0,1,0],1.15,u=>l7Skull(u,1,c.C.bone));
    if(c.C.lv>=3){[-1,1].forEach(s=>a7L(c,S.at(s*1.2,.004),[0,1,0],.7,u=>l7Skull(u,1,c.C.bone)));a7L(c,S.at(0,.002,S.y+.035),[0,1,0],1,u=>{for(let i=0;i<3;i++)u.p('','sph','g',c.C.gl,(i-1)*.02,0,.01,.004)})}},
  chest(c){const S=c.S(.86,.04);if(S.ok)a7L(c,S.at(0,.004),[0,1,0],1.6,u=>{l7Skull(u,1,c.C.bone);if(c.C.lv>=3)[-1,1].forEach(q=>u.p('','sph','g',c.C.gl,q*.012,.002,.065,.005))},'chest');
    [-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.4,1,0]},[0,0,1],1,u=>l7Skull(u,1,c.C.bone),q.bn,[[q.bn,1]])});
    const S2=c.S(.6,.03);if(S2.ok)[-.5,-.75].forEach(th=>a7L(c,S2.at(th,.004),[0,1,0],.7,u=>{l7Skull(u,1,c.C.bone);u.L('','c',0x3a2618,[0,.03,.03],[0,.05,.004],.002,.002,3)},'pelvis',[['pelvis',1]]))},
  boots(c){const S=c.S(.3,.04);if(S.ok)a7L(c,S.at(0,.004),[0,1,0],.95,u=>l7Skull(u,1,c.C.bone))}},
 // ---- Moonhunter: crescent moons and stars ----
 moon:{
  helm(c){const S=c.S(.07,.03);if(!S.ok)return;a7L(c,S.at(0,.004),[0,1,0],1.4,u=>{l7Moon(u,1,0xd8dce0,c.C.gl);u.p('','oct','g',c.C.gl,.03,.03,.004,.005)});
    [-1,1].forEach(s=>a7L(c,S.at(s*.9,.004),[0,1,0],1,u=>u.p('','oct','g',c.C.gl,0,0,.004,.006,.009,.003)))},
  chest(c){const S=c.S(.86,.05);if(S.ok)a7L(c,S.at(0,.004),[0,1,0],2,u=>{l7Moon(u,1,0xd8dce0,c.C.gl);[[.03,.035],[.04,-.02],[.01,-.045]].forEach(([x,y])=>u.p('','oct','g',c.C.gl,x,y,.004,.004,.006,.002))},'chest');
    [-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.3,1,0]},[0,0,1],1,u=>{u.L('','m',0xc8ccd0,[-.03,0,.006],[.03,0,.006],.008,.008,6);u.p('','oct','g',c.C.gl,0,0,.014,.007)},q.bn,[[q.bn,1]])})},
  boots(c){const S=c.S(.18,.03);if(S.ok)a7L(c,S.at(c.s*Math.PI/2,.004),[0,1,0],1,u=>l7Moon(u,.8,0xd8dce0,c.C.gl))}},
 // ---- Gutterblade: knives ----
 blade:{
  helm(c){const S=c.S(.05,.03);if(S.ok)a7L(c,S.at(c.C.ti%2?1.3:-1.3,.004),[0,1,0],.8,u=>{u.p('','box','c',0x3a2a20,0,0,.004,.02,.03,.006);l7Knife(u,.9)})},
  chest(c){const P=c.path([[1.0,-.7],[.94,-.4],[.86,-.1],[.78,.2],[.7,.45],[.64,.6]],.008);for(let i=0;i<P.length-1;i++)gkW(c.k.L('chest','c',0x3a2618,P[i],P[i+1],.012,.012,4),A7W(P[i]));
    for(let i=1;i<P.length-1;i++){const p=P[i],q=P[i+1],L=Math.hypot(p[0],p[2])||1;a7L(c,{p:[p[0]+p[0]/L*.01,p[1],p[2]+p[2]/L*.01],n:[p[0]/L,0,p[2]/L]},[q[0]-p[0]+(p[0]>0?.4:-.4)*0,1,0],.8,u=>l7Knife(u,1),'chest',A7W(p))}},
  boots(c){const S=c.S(.16,.05);if(S.ok)a7L(c,S.at(c.s*Math.PI/2,.004),[0,1,0],1,u=>{u.p('','box','c',0x2a1a12,0,-.02,.008,.024,.08,.012);l7Knife(u,1)})}},
 // ---- Widowsilk: webs and a spider ----
 web:{
  helm(c){const S=c.S(.06,.03);if(!S.ok)return;a7L(c,S.at(0,.004),[0,1,0],1,u=>{for(let i=0;i<8;i++){const a=i/8*Math.PI*2;u.p('','sph','g',0xff2a3a,Math.cos(a)*.012*(i%2?1:.6),Math.sin(a)*.01*(i%2?1:.6)+.004,.006,.0035)}u.p('','box','c',0x14141a,0,.004,.003,.04,.022,.004)});
    [-1,1].forEach(s=>a7L(c,S.at(s*1.0,.004),[0,1,0],.8,u=>l7Web(u,1,0xc8c8d0,6)))},
  chest(c){const S=c.S(.86,.06);if(S.ok)a7L(c,S.at(.15,.004),[0,1,0],2.2,u=>l7Web(u,1,0xc8c8d0,8),'chest');const S2=c.S(.86,.03);if(S2.ok)a7L(c,S2.at(-.2,.012),[0,1,0],1.6,u=>l7Spider(u,1,0x14141a,0xff2a3a),'chest');
    [-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.3,1,0]},[0,0,1],.9,u=>l7Web(u,1,0xb8b8c0,6),q.bn,[[q.bn,1]])})},
  boots(c){const S=c.S(.2,.04);if(S.ok)a7L(c,S.at(c.s*.6,.004),[0,1,0],1,u=>l7Web(u,1,0xc8c8d0,6))}},
 // ---- Plaguebird: goggles and vials ----
 vial:{
  helm(c){const S=c.S(.065,.02);if(!S.ok)return;[-1,1].forEach(s=>a7L(c,S.at(s*.42,.004),[0,1,0],1,u=>{u.p('','cyl','m',0x6a5a3a,0,0,.008,.022,.016,.022,Math.PI/2);u.p('','cyl','g',0x9adf5a,0,0,.016,.016,.004,.016,Math.PI/2)}));
    a7Runs(a7Band(S,-2.6,2.6,16,.004,c)).forEach(R=>a7Tube(c.k,'head',R.map(a=>a.p),.006,.006,0x2a2018,'c',null,4))},
  chest(c){const P=c.path([[1.0,.7],[.94,.4],[.86,.1],[.78,-.2],[.7,-.45],[.64,-.6]],.008);for(let i=0;i<P.length-1;i++)gkW(c.k.L('chest','c',0x3a2618,P[i],P[i+1],.012,.012,4),A7W(P[i]));
    for(let i=1;i<P.length-1;i++){const p=P[i],L=Math.hypot(p[0],p[2])||1;a7L(c,{p:[p[0]+p[0]/L*.006,p[1],p[2]+p[2]/L*.006],n:[p[0]/L,0,p[2]/L]},[0,1,0],1.1,u=>l7Vial(u,1,i%2?0x9adf5a:0x6aff8a,c.C.T),'chest',A7W(p))}},
  boots(c){const S=c.S(.18,.04);if(S.ok)a7L(c,S.at(c.s*Math.PI/2,.004),[0,1,0],1,u=>{u.p('','box','c',0x3a2618,0,0,.004,.05,.012,.006);[-.012,.012].forEach(x=>{u.p('','cyl','g',0x9adf5a,x,0,.016,.008,.03,.008);u.p('','cyl','c',0x8a6a40,x,.02,.016,.005,.008,.005)})})}},
 // ---- Bloodveil: crimson ribbons and a blood gem ----
 ribbon:{
  helm(c){const S=c.S(.05,.02);if(!S.ok)return;[-1,1].forEach(s=>a7L(c,S.at(s*1.8,.004),[0,1,0],1,u=>{u.p('','box','c',c.C.acc,0,0,.006,.02,.02,.01);u.S('',c.C.acc,s*.01,-.01,.008,.016,.1,s*.3,.25,s>0?2:3);u.S('',mdSh(c.C.acc,.7),-s*.004,-.01,.006,.014,.08,-s*.2,.2,s>0?4:5)}))},
  chest(c){const S=c.S(.62,.03);if(S.ok)a7L(c,S.at(.75,.006),[0,1,0],1.2,u=>{u.p('','box','c',c.C.acc,0,0,.008,.03,.024,.014);u.S('',c.C.acc,.008,-.01,.012,.022,.16,.2,.18,1);u.S('',mdSh(c.C.acc,.75),-.008,-.01,.01,.02,.13,-.25,.14,2)},'pelvis',[['pelvis',1]]);
    const S2=c.S(.88,.03);if(S2.ok)a7L(c,S2.at(0,.004),[0,1,0],1.2,u=>{u.p('','oct','m',c.C.T,0,0,.006,.014,.022,.006);u.p('','oct','g',0xd0102a,0,0,.01,.009,.016,.006)},'chest')},
  boots(c){const S=c.S(.1,.03);if(!S.ok)return;const P=a7Band(S,0,Math.PI*2,12,.004).map(a=>a.p);a7Tube(c.k,c.bn,P,.008,.008,c.C.acc,'c',c.nw,4);
    a7L(c,S.at(c.s*Math.PI/2,.008),[0,1,0],1,u=>{u.S('',c.C.acc,0,0,.004,.016,.09,0,.2,3)})}},
 // ---- Voidwalker: void crystals ----
 crystal:{
  helm(c){a7L(c,a7Crown(c,-.03,-.004),[0,0,1],1,u=>l7Crystal(u,1.2,c.C.gl,6,7));const S=c.S(.06,.02);if(S.ok)a7L(c,S.at(0,.004),[0,1,0],1,u=>{u.p('','oct','g',c.C.gl,0,0,.006,.01,.016,.005);u.p('','oct','m',c.C.T,0,0,.003,.016,.022,.004)})},
  chest(c){[-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.4,1,0]},[0,0,1],1.1,u=>l7Crystal(u,1,c.C.gl,5,s>0?3:9),q.bn,[[q.bn,1]])});
    const S=c.S(.86,.03);if(S.ok)a7L(c,S.at(0,.004),[0,1,0],1.4,u=>{u.p('','oct','m',c.C.T,0,0,.004,.024,.032,.006);u.p('','oct','g',c.C.gl,0,0,.008,.014,.022,.008);for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.78;u.L('','g',c.C.gl,[Math.cos(a)*.022,Math.sin(a)*.028,.005],[Math.cos(a)*.05,Math.sin(a)*.06,.003],.002,.001,3)}},'chest')},
  boots(c){const S=c.S(.12,.03);if(S.ok)a7L(c,S.at(c.s*Math.PI/2,.002),[0,1,0],.8,u=>l7Crystal(u,1,c.C.gl,4,c.s>0?5:11))}},
 // ---- Bonescribe: scrolls, a quill and a book ----
 scroll:{
  helm(c){const S=c.S(.06,.02);if(!S.ok)return;a7L(c,S.at(1.55,.004),[0,1,0],1,u=>{gkFeather(u,'',[0,0,.006],[.2,1,-.3],.12,.012,0xe8e0d0,null);u.L('','m',0x2a2a2a,[0,0,.006],[-.01,-.03,.012],.002,.0008,3)})},
  chest(c){const S=c.S(.9,.03);if(S.ok){a7L(c,S.at(-.35,.004),[0,1,0],1,u=>{l7Scroll(u,1,c.C.T,.3);l7Seal(u,.6,0x8a1a1a)},'chest');a7L(c,S.at(.3,.004),[0,1,0],.9,u=>{u.p('','box','c',0xe0d4b4,0,-.02,.003,.04,.06,.002,0,0,.1);for(let i=0;i<4;i++)u.p('','box','c',0x3a2a20,0,-.004-i*.01,.005,.03,.002,.001,0,0,.1)},'chest')}
    const S2=c.S(.6,.03);if(S2.ok)a7L(c,S2.at(.65,.008),[0,1,0],1,u=>{gkBook(u,'',0,-.035,.016,1.1,0x4a2a1a,c.C.T,0,null);u.L('','m',c.C.T,[0,.004,.012],[0,.03,.004],.003,.003,3)},'pelvis',[['pelvis',1]])},
  boots(c){const S=c.S(.2,.04);if(S.ok)a7L(c,S.at(c.s*.9,.004),[0,1,0],.9,u=>{l7Scroll(u,1,c.C.T,Math.PI/2);u.p('','box','c',0x3a2618,0,0,.016,.03,.006,.004)})}},
 // ---- Hexbound: glowing rune sigils ----
 rune:{
  helm(c){const S=c.S(.065,.02);if(!S.ok)return;a7L(c,S.at(0,.004),[0,1,0],1,u=>l7Rune(u,1,c.C.gl,c.C.T));const P=a7Band(S,-1.3,1.3,10,.003,c);gkRunes(c.k,'head',P.filter(a=>a.i<4||a.i>6).map(a=>a.p.concat([Math.atan2(a.n[0],a.n[2])])),c.C.gl,null,1)},
  chest(c){const S=c.S(.84,.06);if(S.ok)a7L(c,S.at(0,.004),[0,1,0],2,u=>l7Rune(u,1,c.C.gl,c.C.T),'chest');
    [-1,1].forEach(s=>{const q=c.sh(s);if(q)a7L(c,{p:q.p,n:[s*.3,1,0]},[0,0,1],1,u=>{for(let i=0;i<5;i++)u.p('','box','g',c.C.gl,(i-2)*.012,0,.004,.004,.016,.002,0,0,i%2?.5:-.3)},q.bn,[[q.bn,1]])});
    const S2=c.S(.6,.03);if(S2.ok)gkRunes(c.k,'pelvis',a7Band(S2,-1,1,8,.003).map(a=>a.p.concat([Math.atan2(a.n[0],a.n[2])])),c.C.gl,[['pelvis',1]],1)},
  boots(c){const S=c.S(.16,.02);if(S.ok)gkRunes(c.k,c.bn,a7Band(S,-1.6,1.6,8,.003).map(a=>a.p.concat([Math.atan2(a.n[0],a.n[2])])),c.C.gl,c.nw(S.at(0,0).p),1)}}};
