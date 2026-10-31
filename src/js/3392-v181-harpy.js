// ================= v181: harpies — a woman-bird, not an eagle =================
// The Harpy and the Storm Harpy were both an eagle body. Now each is a harpy: a gaunt, ash-skinned woman's upper body under a
// ragged feather mantle, a wild mane, a narrow face with burning eyes and a mouth of jagged teeth; her arms are great ragged
// wings (a bony leading edge with a hooked claw at the wrist); from the waist down she is bird — feathered hips and thighs,
// scaled shanks bending at a backward ankle, splayed talons. The skeleton is upright (same bone names as the bird rig, so the
// walk, bite, Gale Dive and Gale Shriek all still play), with the torso, neck and head at the humanoid heights.
// Harpy (carrion browns) and Storm Harpy (slate, storm-blue streaks) share it.
// (refine, Oct 31 2026) one smoothed cage surface from the head down the body and out into both legs (the v181 cage method,
// built here on the bird skeleton): the thighs grow out of the hip ring, the shoulders swell into a round deltoid that each wing's
// bony root sinks into, so neither wings nor legs look stuck on. Feathered wings of real feathers (coverts, secondaries,
// splayed primaries with dark bars and a pale shaft), not a flat fan. Detail is paint: smooth mottled skin (vcol), baked
// creases (cgShade), a darker beak-like hooked nose, scaled shanks, feather layers (cgFur) with ragged clumps; talons are
// tapering lofts ending in black claws.
var HARPY181={on:true,
  bones:{pelvis:[null,0,.55,-.01],spine:['pelvis',0,.66,0],chest:['spine',0,.84,0],neck:['chest',0,1.0,0],head:['neck',0,1.1,0],jaw:['head',0,1.07,.06],
    tail0:['pelvis',0,.52,-.1],tail1:['tail0',0,.46,-.2],tail2:['tail1',0,.41,-.29],tail3:['tail2',0,.37,-.37],
    hl0:['pelvis',-.085,.55,0],hl1:['hl0',-.09,.36,.09],hl2:['hl1',-.095,.14,-.05],hr0:['pelvis',.085,.55,0],hr1:['hr0',.09,.36,.09],hr2:['hr1',.095,.14,-.05]},
  pal:{Harpy181:{f:0x33281f,f2:0x241b14,ruff:0x4e4032,sk:0x6e645c,sk2:0x544a44,hair:0x1a1410,leg:0x34302c,claw:0x0c0a08,eye:0xffb020,glow:null,beak:0x2a2420,bar:0x18120c,pale:0x8a7a62},
       GaleHarpy:{f:0x2c323c,f2:0x1c2028,ruff:0x56606c,sk:0x66707a,sk2:0x4c5660,hair:0x14181e,leg:0x3a3e44,claw:0x0a0a0c,eye:0x8ad8ff,glow:0x8ad8ff,beak:0x262a30,bar:0x10141a,pale:0x8a96a6}},G:{},E:{}};
// the body cage (bird bones), model space. Torso rings [y, half width, front, back] bottom → top; the head is the v181 base
// head (the thrall's skull space) moved down to the harpy's neck, every other profile ring kept
var NH_DY=-.44;
function nh_HW(y){return y<=.55?[['pelvis',1]]:y<=.66?mdWb('pelvis','spine',(y-.55)/.11):y<=.84?mdWb('spine','chest',(y-.66)/.18):y<=.95?[['chest',1]]:y<=1.04?mdWb('chest','neck',(y-.95)/.09):y<1.075?mdWb('neck','head',(y-1.04)/.035*.7):[['head',1]]}
function nh_HBody(B,K){const M=cgMesh(B),N=12,H=6,Q=3;   /* 12 columns: a slender body (24 round after the smoothing step) */
  // groin, hips, waist, lower ribs, chest, shoulders (the wing roots), shoulder line, neck base
  const TR=[[.5,.112,.078,.09],[.575,.128,.084,.1],[.665,.09,.06,.072],[.755,.104,.074,.078],[.845,.124,.088,.086],[.915,.142,.08,.088],[.965,.122,.06,.08],[1.0,.066,.054,.062]];
  const push=(i,j,a)=>{const ca=Math.cos(a),sa=Math.sin(a);let e=0;
    if((i==5||i==6)&&Math.abs(ca)>.55)e+=(i==5?.03:.022)*Math.pow((Math.abs(ca)-.55)/.45,1.5)*(sa<.3?1:.6);   // round deltoids at the wing roots
    if(i==4&&sa<-.5&&Math.abs(ca)>.2&&Math.abs(ca)<.75)e+=.01;   // shoulder blades
    if(i==2&&sa>.5)e-=.008;return e};                              // a sunken belly
  const tr=TR.map((q,i)=>cgRing(M,[0,q[0],q[4]||0],[1,0,0],[0,0,1],N,q[1],q[2],q[3],nh_HW(q[0]),{push:(j,a)=>push(i,j,a)}));
  for(let i=0;i<tr.length-1;i++)cgBand(M,tr[i],tr[i+1],'torso',[0,(TR[i][0]+TR[i+1][0])/2,0]);
  // bird legs out of the hip ring (cg181Body's leg, j2 seating): feathered thigh, knee, a long bare shank back to the ankle, the
  // short tarsus down to the foot. The bottom ring splits in two halves with a crotch line
  const R=tr[0],y0=TR[0][0],q0=TR[0],L=HARPY181.bones,LR=[];
  const cf=cgVert(M,[0,y0-.03,q0[2]*.5],[['pelvis',1]]),cm=cgVert(M,[0,y0-.04,0],[['pelvis',1]]),cb=cgVert(M,[0,y0-.03,-q0[3]*.5],[['pelvis',1]]);
  [-1,1].forEach(s=>{const l=s<0?'hl':'hr',P0=L[l+'0'],P1=L[l+'1'],P2=L[l+'2'],h0=[P0[1],P0[2],P0[3]],k1=[P1[1],P1[2],P1[3]],k2=[P2[1],P2[2],P2[3]],ft=[k2[0],.045,k2[2]+.035];
    const half=[];for(let i=0;i<=H;i++)half.push(s>0?(Q-i+N)%N:Q+i);const root=half.map(j=>R[j]).concat([cb,cm,cf]),LN=root.length;
    // t: 0 hip … 1 knee … 2 ankle … 3 foot
    const LG=[{t:.12,r:.074,rf:.07,rb:.08},{t:.45,r:.074,rf:.08,rb:.072},{t:1,r:.042},{t:1.22,r:.031},{t:1.92,r:.024},{t:2.08,r:.03},{t:2.95,r:.025}],rows=[];
    let prev=root;LG.forEach((q,i)=>{const t=q.t,c=t<=1?lerp3(h0,k1,t):t<=2?lerp3(k1,k2,t-1):lerp3(k2,ft,t-2),
      w=t<.12?[['pelvis',.4],[l+'0',.6]]:t<.9?[[l+'0',1]]:t<1.1?[[l+'0',.5],[l+'1',.5]]:t<1.88?[[l+'1',1]]:t<2.02?[[l+'1',.4],[l+'2',.6]]:[[l+'2',1]];
      const ring=[];for(let j=0;j<LN;j++){const a=(j<=H?90-j*180/H:[-135,180,135][j-H-1])*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),rf=sa>=0?(q.rf||q.r):(q.rb||q.r);
        let p=[c[0]+s*ca*q.r,c[1],c[2]+sa*rf];if(i<2){const P=M.V[root[j]],b=i?.8:.45;p=lerp3([P[0],P[1]-(i?.5:.3)*LG[0].r,P[2]],p,b)}ring.push(cgVert(M,p,w))}
      cgBand(M,prev,ring,'leg',c);prev=ring;rows.push(c[1])});
    cgCap(M,prev,[ft[0],ft[1]-.025,ft[2]],[[l+'2',1]],'leg',[ft[0],ft[1]+.1,ft[2]]);LR.push({s,l,h0,k1,k2,ft,rows})});
  // neck and head: one ring stack (the base head's profile, every other ring, narrowed for a woman's skull)
  const HB=CG181.base.head,hd=[0,2,3,5,8,9,11,14].map(i=>HB[i]),NK=[[1.045,.047,.047,.052,.006]];
  let prev=tr[tr.length-1];NK.concat(hd.map(q=>[q[0]+NH_DY,q[1]*.94,q[2]*.98,q[3]*.98,q[4]||0])).forEach((q,i)=>{const ring=cgRing(M,[0,q[0],q[4]||0],[1,0,0],[0,0,1],N,q[1],q[2],q[3],nh_HW(q[0]),{});
    cgBand(M,prev,ring,i<NK.length?'neck':'head',[0,q[0],(q[4]||0)-.01]);prev=ring});
  const top=HB[14];cgCap(M,prev,[0,top[0]+NH_DY+.012,-.004],[['head',1]],'head',[0,top[0]+NH_DY-.08,0]);
  cgOrient(M);return {M:cgSub(M),TR,LR}}
// a tapering loft that ends in a black claw (toes, the wrist claw): pts along it, radii, the claw from ring nc on
function nh_Claw(B,pts,rr,w,col,claw,nc,ref){mdLoft(B,pts.map((p,i)=>({p,rx:rr[i],f:rr[i]*.85,b:rr[i]*.85,w})),{seg:5,ref:ref||[0,1,0],capB:true,col:m=>m.i>nc-.5?claw:col})}
// (refine) cgFur (3393) with the colour flowing per corner (vcol): smooth grooves and value, so a fur or feather layer has no
// stair-stepped per-face blocks ("pixel camouflage"); everything else (shell, ragged clumps, weights) is cgFur's
function nh_Fur(B,M,sel,o){const N=M.N||(M.N=cgNormals(M)),V=M.V,pick=M.F.map(f=>sel(cgInfo(M,f))),cnt=new Map(),ef=new Map(),seed=o.seed||0;
  M.F.forEach((f,fi)=>{if(!pick[fi])return;const n=f.v.length;for(let i=0;i<n;i++){const a=f.v[i],b=f.v[(i+1)%n],k=a<b?a+'_'+b:b+'_'+a;cnt.set(k,(cnt.get(k)||0)+1);ef.set(k,[fi,a,b])}});
  const rim=new Set(),low=[];cnt.forEach((c,k)=>{if(c!=1)return;const [fi,a,b]=ef.get(k),m=cgInfo(M,M.F[fi]),my=(V[a][1]+V[b][1])/2;rim.add(a);rim.add(b);if(m.y>my+.002)low.push([a,b])});
  const lb=o.lump||[.35,1.3],lf=o.freq||24,lump=v=>{const n=n3Sn(v[0]*1.6,v[1]*.3,v[2]*1.6,lf,seed);return lb[0]+lb[1]*n*n},P=new Map(),pos=i=>{let p=P.get(i);if(p)return p;const v=V[i],n=N[i],d=o.off*lump(v)*(rim.has(i)?(low.some(e=>e[0]==i||e[1]==i)?1:.1):1);p=[v[0]+n[0]*d,v[1]+n[1]*d,v[2]+n[2]*d];P.set(i,p);return p};
  const groove=v=>n3Sn(v[0]*1.4,v[1]*.35,v[2]*1.4,22,seed)<.42,col=m=>{const c=a181Nz(o.col,m,.3,18,seed);return o.col2!=null&&groove([m.x,m.y,m.z])?o.col2:c};
  const sm=v=>{const n=n3Sn(v.x*1.4,v.y*.35,v.z*1.4,22,seed),g=Math.max(0,Math.min(1,(.47-n)/.1));return mdSh(mdMix(o.col,o.col2==null?mdSh(o.col,.75):o.col2,g),.92+.12*n3Sn(v.x,v.y,v.z,18,seed+1))};
  cgEmit(B,M,()=>null,{t:o.t,pos,keep:(m,fi)=>pick[fi],vcol:sm});   /* (nh) the colour flows corner to corner: the darker grooves fade in, no per-face blocks */
  // clumps along the lower edge: the rim is walked as loops and cut into runs of 2–4 edges; each run hangs as one wide, solid
  // clump (outer and inner faces fanned to its tip, closed at its two ends), uneven in length
  const W=new Map(),wOf=i=>{let w=W.get(i);if(w)return w;const a=V[i],L=[];for(let j=3;j<a.length;j++)if(a[j]>1e-4)L.push([j-3,a[j]]);L.sort((p,q)=>q[1]-p[1]);const si=[0,0,0,0],sw=[0,0,0,0];let s=0;for(let j=0;j<4&&j<L.length;j++){si[j]=L[j][0];sw[j]=L[j][1];s+=L[j][1]}for(let j=0;j<4;j++)sw[j]/=s||1;w=[si,sw];W.set(i,w);return w};
  const vx=(p,i)=>({x:p[0],y:p[1],z:p[2],w:wOf(i)}),t=o.t||'c',nx=new Map();low.forEach(([a,b])=>{nx.set(a,b)});const used=new Set();let ci=0;
  low.forEach(([a0])=>{if(used.has(a0))return;const loop=[];let v=a0;while(v!=null&&!used.has(v)){used.add(v);loop.push(v);v=nx.get(v)}
    for(let i=0;i<loop.length-1;){const n=Math.min(loop.length-1-i,2+Math.floor(a181H(ci,seed,7)*3)),run=loop.slice(i,i+n+1);i+=n;ci++;
      const h=a181H(ci,seed,3),L=o.len*(1-(o.jag==null?.6:o.jag)*h),mid=lerp3(pos(run[0]),pos(run[run.length-1]),.5),nn=nrm3(run.reduce((q,j)=>add3(q,N[j]),[0,0,0]));
      const tip=[mid[0]+nn[0]*L*.35,mid[1]-L,mid[2]+nn[2]*L*.35],c=mdC(h<.25&&o.col2!=null?o.col2:mdSh(o.col,.8+a181H(ci,9,seed)*.28)),T=vx(tip,run[Math.floor(run.length/2)]);
      for(let j=0;j<run.length-1;j++){const p=run[j],q=run[j+1];mdTri(B,t,vx(pos(p),p),T,vx(pos(q),q),c);mdTri(B,t,vx(V[q],q),T,vx(V[p],p),c)}
      const f=run[0],l=run[run.length-1];mdTri(B,t,vx(V[f],f),T,vx(pos(f),f),c);mdTri(B,t,vx(pos(l),l),T,vx(V[l],l),c)}})}
function h181Geo(n){if(HARPY181.G[n])return HARPY181.G[n];const K=HARPY181.pal[n],B=mdB(HARPY181.bones),k=dkKit(),E=HARPY181.E[n]={};
  const C=nh_HBody(B,K),M=C.M,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ss=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t)},hp=(x,y,z)=>[x*.94,y+NH_DY,(z||0)*.98];
  // the face: the gaunt v181 face (deep sockets, a hard brow, high cheekbones, hollow cheeks), with a longer, hooked, beak-like nose
  const G=CG181.faceGaunt,FACE=(x,y,z,nn)=>{const by=y-NH_DY,bx=x/.94;let d=G(bx,by,z,nn);if(nn[2]>.1)d+=(.012*cgG(bx,by,0,1.6,.009,.016)+.012*cgG(bx,by,0,1.583,.007,.007)+.007*cgG(bx,by,0,1.54,.016,.01)-.006*cgG(bx,by,0,1.523,.03,.007))*Math.min(1,nn[2]*1.6);return d};
  cgSculpt(M,{head:1},FACE);
  // a wild mane over the crown and the back of the skull, as a shell (it bends with the head)
  const EY=1.629+NH_DY,EX=.036*.94,nose=(x,y)=>Math.abs(x)<.012&&y>1.578+NH_DY&&y<1.61+NH_DY;
  M.shade=cgShade(M,{y0:0,y1:1.3,hk:.2,cav:1.1});
  const skin=m=>{const n1=n3Sn(m.x,m.y,m.z,9,4);let c=mdMix(K.sk,K.sk2,cl(.3+(n1-.5)*.9+ss(-.2,-.8,m.nz)*.35,0,1));
    if(m.part=='head'){const ax=Math.abs(m.x);c=mdMix(c,mdSh(K.sk2,.45),ss(.026,.012,Math.hypot(ax-EX,(m.y-EY)*1.3))*ss(.1,.4,m.nz));   // dark, sunken sockets
      if(m.nz>.2)c=mdMix(c,K.beak,ss(.016,.006,ax)*ss(1.575+NH_DY,1.592+NH_DY,m.y)*ss(1.625+NH_DY,1.6+NH_DY,m.y))}     // the horn-dark hooked nose
    if(m.part=='leg'){const sh=ss(.33,.29,m.y);c=mdMix(mdMix(K.f,K.f2,cl(.4+(n1-.5),0,1)),K.leg,sh);if(sh>0)c=mdMix(c,mdSh(K.leg,.7),ss(.02,0,Math.abs(m.y-.36))*.6)}   // feathered thigh, bare shank
    if(m.part=='torso'){c=mdMix(c,K.sk2,.4);c=mdMix(c,mdMix(K.f,K.f2,n1),ss(.7,.64,m.y))}return c};   /* the bare waist in shadow, feathers below */
  // crisp: the lips' line, the shank's scutes (rows across its front, every other one darker)
  const leg=C.LR[0].rows,scute=m=>{if(m.part!='leg'||m.y>.33||m.nz<.25)return null;for(let i=0;i<leg.length-1;i++){const a=leg[i],b=leg[i+1];if((m.y-a)*(m.y-b)<=0){const r=2*i+(Math.abs(m.y-a)>Math.abs(b-a)/2?1:0);return r%2?mdSh(K.leg,1.15):mdSh(K.leg,.92)}}return null};
  cgEmit(B,M,m=>{if(m.part=='head'&&m.nz>.4&&Math.abs(m.y-(1.558+NH_DY))<.004&&Math.abs(m.x)<.024)return 0x1a0a0a;return scute(m)},{vcol:skin});
  // hair: a shell over the crown and the back of the head, locks of feathers sweeping back from it
  cgShell(B,M,m=>(m.part=='head'&&m.y>1.585+NH_DY&&(m.nz<.12+.5*(n3Sn(m.x*2,m.y*2,m.z*2,16,4)-.5)||m.y>1.662+NH_DY+.016*(n3Sn(m.x*3,0,m.z,26,9)-.5)-.024*Math.exp(-(m.x/.02)*(m.x/.02))))||(m.part=='neck'&&m.nz<-.35),v=>(.016+.012*Math.max(0,-v[2]-.02)/.06)*Math.min(1,Math.max(.35,(v[1]-1.5-NH_DY)/.15)),m=>mdSh(K.hair,.9+.15*n3Sn(m.x,m.y,m.z,24,2)));   /* ragged bangs; the mane runs down the nape */
  for(let i=0;i<11;i++){const a=Math.PI*(.5+i*.05)*(i%2?1:-1),o=[Math.sin(a)*.3,1.17+a181H(i,3)*.08,Math.cos(a)*.3],p=cgRay(M,o,nrm3([-o[0],0,-o[2]]),{head:1});if(!p)continue;
    const e=[p[0]*2.1,p[1]-.13-a181H(i,5)*.13,p[2]*1.5-.1],r=.03,d=nrm3(sub3(e,p)),root=sub3(p,mul3(d,.02));
    mdLoft(B,[{p:root,rx:r*.6,f:.004,b:.004,w:[['head',1]]},{p:lerp3(p,e,.3),rx:r,f:.004,b:.004,w:[['head',1]]},{p:lerp3(p,e,.7),rx:r*.7,f:.003,b:.003,w:[['head',.6],['neck',.4]]},{p:e,rx:.002,f:.002,b:.002,w:[['neck',1]]}],
      {seg:4,ref:nrm3([p[0],0,p[2]]),col:m=>m.i>2?K.bar:m.i>1.4?mdSh(K.f,1.15):i%3?K.hair:K.ruff})}
  // a ragged crest of feathers from the crown, swept up and back (breaks the round outline of the head)
  for(let i=0;i<5;i++){const x=(i-2)*.018,z=-.005-Math.abs(i-2)*.012,p=cgRay(M,[x,1.6,z],[0,-1,0],{head:1});if(!p)continue;const e=add3(p,[x*1.6,.07+.03*Math.cos((i-2)*.8)-Math.abs(i-2)*.012,-.13-a181H(i,8)*.04]),d=nrm3(sub3(e,p));
    mdLoft(B,[{p:sub3(p,mul3(d,.025)),rx:.012,f:.004,b:.004,w:[['head',1]]},{p:lerp3(p,e,.35),rx:.02,f:.004,b:.004,w:[['head',1]]},{p:lerp3(p,e,.75),rx:.013,f:.003,b:.003,w:[['head',1]]},{p:e,rx:.002,f:.002,b:.002,w:[['head',1]]}],
      {seg:4,ref:[1,0,0],col:m=>m.i>2.2?K.bar:i%2?K.hair:K.ruff})}
  // the mantle of feathers over the shoulders and the breast, feathered hips and thighs: layers with ragged clumps
  nh_Fur(B,M,m=>(m.part=='torso'&&m.y>cgEdge(m,.75,.02,3))||m.part=='neck'||(m.part=='head'&&m.y<1.532+NH_DY&&m.nz<.55),   /* up to a ruff under the jaw */{off:.032,len:.15,col:K.ruff,col2:K.f,seed:61,jag:.55,lump:[.6,.7]});
  nh_Fur(B,M,m=>(m.part=='torso'&&m.y<cgEdge(m,.675,.02,5))||(m.part=='leg'&&m.y>cgEdge(m,.42,.025,7)),{off:.032,len:.15,col:K.f,col2:K.f2,seed:67,jag:.5,lump:[.6,.8]});
  // talons: three forward, one back, each a loft ending in a hooked black claw, rooted in the foot
  C.LR.forEach(({s,l,ft})=>{[[-.45,.12],[0,.14],[.45,.12],[Math.PI,.07]].forEach(([an,len],i)=>{const d=[Math.sin(an)*s,0,Math.cos(an)],b=[ft[0],.028,ft[2]],p0=add3(b,mul3(d,.005)),p1=add3(b,[d[0]*len*.45,-.012,d[2]*len*.45]),p2=add3(b,[d[0]*len,-.016,d[2]*len]),
      c1=add3(p2,[d[0]*.022,-.002,d[2]*.022]),c2=add3(p2,[d[0]*.04,-.022,d[2]*.04]);nh_Claw(B,[sub3(p0,mul3(d,.02)),p0,p1,p2,c1,c2],[.017,.016,.012,.01,.007,.0012],[[l+'2',1]],K.leg,K.claw,3.6)})});
  // the tail: a fan of long ragged feathers, rooted inside the rump
  for(let i=0;i<9;i++){const a=(i-4)*.23,l=.26+.06*Math.cos(a*2)-a181H(i,4)*.05,p0=[Math.sin(a)*.04,.53,-.05],p1=[Math.sin(a)*(.05+l*.6),.46-l*.35,-.1-l*.85],pm=lerp3(p0,p1,.45);
    mdLoft(B,[{p:p0,rx:.01,f:.004,b:.004,w:[['tail0',1]]},{p:pm,rx:.038,f:.005,b:.005,w:[['tail1',1]]},{p:lerp3(p0,p1,.82),rx:.03,f:.004,b:.004,w:[['tail2',1]]},{p:p1,rx:.004,f:.003,b:.003,w:[['tail2',1]]}],
      {seg:4,ref:[0,1,0],col:m=>m.i>1.6&&m.i<2.2?K.bar:i%2?K.f:K.f2})}
  // where the kit goes (eyes, the storm streaks): on this surface
  E.eyes=[-1,1].map(s=>{const p=cgRay(M,[s*EX,EY,.3],[0,0,-1],{head:1});return p||[s*EX,EY,.08]});
  const onBack=(y,a)=>{const d=[Math.sin(a),0,Math.cos(a)];return cgRay(M,[d[0]*.5,y,d[2]*.5],[-d[0],0,-d[2]],{torso:1})};
  E.streak=[];for(let i=0;i<5;i++){const s=i%2?1:-1,y=.88-i*.075,p=onBack(y,s*(2.75-i*.04)),q=onBack(y-.05,s*(2.45-i*.04));if(p&&q)E.streak.push([p,q,cgWAt(M,lerp3(p,q,.5))])}
  // jagged teeth in the mouth line
  for(let i=0;i<6;i++){const x=(i-2.5)*.0085,p=cgRay(M,[x,1.558+NH_DY,.3],[0,0,-1],{head:1});if(p)k.p('head','cone4','c',0xd8d0b8,p[0],p[1]+(i%2?.003:-.004),p[2]-.003,.0035,(i==0||i==5?.016:.01),.0035,i%2?0:Math.PI)}
  mdKit(B,k);const Gc=mdBake(B).c,n3=Gc.attributes.position.count,I=new (n3>65535?Uint32Array:Uint16Array)(n3);for(let i=0;i<n3;i++)I[i]=i;Gc.setIndex(new THREE.BufferAttribute(I,1));   // indexed like every creature body (the v84 limb helpers read the index)
  return HARPY181.G[n]=Gc}
// ---- the wing: real feathers, for the RIGHT side in its pivot's space (+x out, −z back), mirrored for the left ----
// a bony arm (rooted inside the shoulder's deltoid) with a hooked claw at the wrist; rows of coverts overlapping the roots of the
// flight feathers; secondaries hanging from the forearm; primaries from the hand, longest toward the tip. Each feather: a blade
// with a raised shaft, dark bars across it, pale shaft, darker toward its tip.
// (round 2, owner: "the wings look a bit awkward" — they were held stiffly out like boards) the wing is built twice with the
// same vertices: spread, and FOLDED the way a bird folds it at rest: the upper arm back and up from the shoulder, the forearm up
// to the bend of the wing just above and behind the shoulder, the hand and the primaries tucked down along the back, every
// feather fanned closed and hanging flat against the flank (its broad face outward, the outer ones angled back toward the tail),
// coverts outermost. The folded shape is the geometry's morph target; nh_WingAnim opens and
// closes it with the creature's state (folded at rest, half open walking, spread to strike or fly, a little folding on each
// upstroke) while the pivot's flap is scaled by the same openness, so the wing never flaps as a board.
var NH_WS=.8,NH_WD=.1,NH_WH=[.17,.95,-.03];   // the pivot's sweep, droop and hinge (lpwPair)
function nh_WingBuild(n,F){const K=HARPY181.pal[n],P=[],Cc=[],T=new THREE.Color(),c3=h=>{T.setHex(h);return [T.r,T.g,T.b]};
  const tri=(a,b,c,ca,cb,cc)=>{P.push(...a,...b,...c);Cc.push(...ca,...cb,...cc)};
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],sc=(a,f)=>[a[0]*f,a[1]*f,a[2]*f];
  const cR=c3(K.ruff),cF=c3(K.f),cF2=c3(K.f2),cP=c3(K.pale);
  // folded parts are designed in model space round the hinge, then taken into the pivot's frame (rest: no flap raise)
  const cs=Math.cos(NH_WS),sn=Math.sin(NH_WS),cd=Math.cos(NH_WD),sd=Math.sin(NH_WD),toL=v=>{const x=cs*v[0]-sn*v[2],z=sn*v[0]+cs*v[2],y=v[1];return [cd*x-sd*y,sd*x+cd*y,z]};
  const feather=(p,d,wv,L,W,seed,base,tipc,bars)=>{d=nrm3(d);wv=nrm3(sub3(wv,mul3(d,wv[0]*d[0]+wv[1]*d[1]+wv[2]*d[2])));const up=cross3(wv,d),NR=4,rows=[];for(let i=0;i<=NR;i++){const t=i/NR,w=W*(i==0?.25:i==NR?0:Math.sin(Math.min(1,t*1.25)*Math.PI*.5)*(1-.35*t*t)),c=add3(p,mul3(d,L*t));
      rows.push([add3(c,mul3(wv,-w)),add3(c,mul3(up,W*.12*(1-t))),add3(c,mul3(wv,w))])}
    for(let i=0;i<NR;i++){const t=(i+.5)/NR,bar=bars&&(i==1||i==3)?.55:1,col=sc(mix(base,tipc,t*t),bar*(.94+a181H(seed,i)*.1)),sh=mix(col,cP,.3),A=rows[i],Bv=rows[i+1];
      if(i<NR-1){tri(A[0],A[1],Bv[1],col,sh,sh);tri(A[0],Bv[1],Bv[0],col,sh,col);tri(A[1],A[2],Bv[2],sh,col,col);tri(A[1],Bv[2],Bv[1],sh,col,sh)}
      else{tri(A[0],A[1],Bv[1],col,sh,sh);tri(A[1],A[2],Bv[1],sh,col,sh)}}};
  // the arm: shoulder (inside the body) → elbow → wrist → hand tip, a 6-sided tapering tube; spread (AR, pivot frame) and folded
  // (AFm, model offsets from the hinge; the first two rings, inside the shoulder, are the same in both)
  const AR=[[-.06,0,.0,.05],[.02,.004,.03,.044],[.2,.04,.07,.032],[.4,.06,.08,.024],[.56,.055,.05,.02],[.72,.04,0,.016],[.86,.02,-.05,.011],[1.0,0,-.1,.004]];
  const AFm=[null,null,[.05,.06,-.13],[.06,.13,-.19],[.07,.19,-.17],[.08,.225,-.13],[.09,.11,-.18],[.1,-.02,-.22]];
  const AP=AR.map((q,i)=>F&&AFm[i]?toL(AFm[i]):[q[0],q[1],q[2]]);
  // a point along the arm at the spread arm's x (both shapes share the parameter), and the model-space direction helper
  const AT=x=>{for(let i=0;i<AR.length-1;i++){if(x<=AR[i+1][0]){const t=Math.max(0,(x-AR[i][0])/(AR[i+1][0]-AR[i][0]));return lerp3(AP[i],AP[i+1],t)}}return AP[AP.length-1]},D=v=>F?toL(v):v;
  const ring=(c,r,d)=>{let u=cross3(d,[0,1,0]);if(Math.hypot(...u)<.3)u=cross3(d,[0,0,1]);u=nrm3(u);const v=cross3(u,d);return [0,1,2,3,4,5].map(j=>{const a=j*Math.PI/3;return add3(c,add3(mul3(u,Math.cos(a)*r),mul3(v,Math.sin(a)*r*.8)))})};
  const RR=AP.map((q,i)=>ring(q,AR[i][3],nrm3(sub3(AP[Math.min(AP.length-1,i+1)],AP[Math.max(0,i-1)]))));
  for(let i=0;i<RR.length-1;i++)for(let j=0;j<6;j++){const a=RR[i][j],b=RR[i][(j+1)%6],c=RR[i+1][(j+1)%6],d=RR[i+1][j],col=mix(cR,cF,i/(RR.length-1)),c2=sc(col,.85);tri(a,c,b,col,c2,col);tri(a,d,c,col,c2,c2)}
  // the hooked claw at the bend of the wing, pointing forward (folded: forward and up)
  {const w=add3(AP[5],D([0,.01,.01])),e=add3(w,D(F?[.0,.035,.075]:[.03,-.01,.08])),tip=add3(e,D(F?[-.008,-.02,.02]:[-.015,-.02,.025])),cc=c3(K.claw),sx=D([.006,0,0]);const R0=ring(w,.012,nrm3(sub3(e,w)));for(let j=0;j<6;j++){tri(R0[j],e,R0[(j+1)%6],cc,cc,cc)}tri(e,tip,add3(e,sx),cc,cc,cc);tri(e,sub3(e,sx),tip,cc,cc,cc)}
  // coverts: two rows over the arm lying over the roots of the long feathers (folded: outermost, hanging)
  for(let r=0;r<2;r++)for(let i=0;i<7;i++){const x=.03+i*.1+r*.05,a=AT(x);
    if(F)feather(add3(a,toL([.024+r*.006,.004,0])),toL([.04,-1,-.08]),toL([0,0,1]),.11+r*.07,.046,i+r*20,r?cF:cR,mix(cR,cF,.6),false);
    else feather(add3(a,[0,.008-r*.002,-.004]),[.1,-.07+r*.025,-1],[1,0,0],.11+r*.07,.046,i+r*20,r?cF:cR,mix(cR,cF,.6),false)}
  // secondaries along the forearm and upper arm (even, a little ragged)
  for(let i=0;i<10;i++){const x=.02+i*.074,a=AT(x),L=.37+.025*Math.sin(i*1.7)+a181H(i,2)*.04;
    if(F)feather(add3(a,toL([.004+.0012*i,-.004,0])),toL([.04,-1,-.05-.025*i]),toL([0,0,1]),L,.064,i+40,cR,cF2,true);
    else{const d=nrm3([.1+i*.03,-.03,-1]);feather(add3(a,[0,-.004+i*.0012,-.005]),d,[1,0,d[0]],L,.064,i+40,cR,cF2,true)}}
  // primaries from the hand, longest toward the tip (spread: splayed; folded: closed and tucked down the back, over the secondaries)
  for(let i=0;i<7;i++){const t=i/6,x=.74+t*.22,a=AT(x),L=.36+.19*Math.sin(t*1.9)+a181H(i,7)*.03,an=-.5+t*1.45;
    if(F)feather(add3(a,toL([.016+.002*i,0,0])),toL([.05,-1,-.22-.12*t]),toL([0,0,1]),L,.05,i+60,cR,cF2,true);
    else{const d=nrm3([Math.sin(an),-.04,-Math.cos(an)]);feather(add3(a,[0,-.004+.0015*i,0]),d,[-d[2],0,d[0]],L,.05,i+60,cR,cF2,true)}}
  return {P,Cc}}
function nh_Wing(n){const key='nhw'+n;if(LPWG[key])return LPWG[key];const O=nh_WingBuild(n,0),Fo=nh_WingBuild(n,1);
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(O.P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(O.Cc,3));G.computeVertexNormals();
  G.morphAttributes.position=[new THREE.Float32BufferAttribute(Fo.P,3)];return LPWG[key]=G}
// the wing material with morph targets (one clone per base material)
var NH_WM={};function nh_WingMat(m){return NH_WM[m.uuid]||(NH_WM[m.uuid]=Object.assign(m.clone(),{morphTargets:true}))}
// open / close the wings with the creature's state; the pivot's flap (rigAnim) is scaled by the same openness
function nh_WingAnim(x,now){const W=x.nhw,g=x.g;if(!W||!g)return;const G=g._ga||{},A=!!(g.atk||g.ak),fly=x.spec&&x.spec.anim=='fly',w=G.w||0,tg=A||fly?1:.1+.5*w;
  const dt=W.t==null?0:Math.min(.1,Math.max(0,(now-W.t)/1000));W.t=now;W.o=W.o==null?tg:W.o+(tg-W.o)*Math.min(1,dt*(tg>W.o?9:3));
  const o=Math.max(0,Math.min(1,W.o*(.88+.12*Math.sin((G.wp||0)+1.2))));
  x.wings.forEach(wg=>{if(!wg.p)return;wg.p.rotation.z*=o;const m=wg.p.children[0];if(m&&m.morphTargetInfluences)m.morphTargetInfluences[0]=1-o})}
{const f=rigAnim;rigAnim=function(x,now){const r=f.apply(this,arguments);try{if(x&&x.nhw)nh_WingAnim(x,now)}catch(e){}return r}}
(function(){if(!HARPY181.on||!LPR.GaleHarpy||!SPEC.GaleHarpy)return;
  ['Harpy181','GaleHarpy'].forEach(n=>{const K=HARPY181.pal[n];
    SPEC[n]=Object.assign({},SPEC.GaleHarpy,{bones:HARPY181.bones,hd:[0,1.2,.04],bk:[['spine',.7,-.12],['chest',.88,-.12],['neck',1.02,-.08]],legs:[['hl',0],['hr',Math.PI]],ex:()=>{},sig:null,dt:null});
    LPR[n]=Object.assign({},LPR.GaleHarpy,{geo:()=>h181Geo(n),
      // burning eyes in the sockets (placed on the face by h181Geo), storm-blue streaks lying on the Storm Harpy's back
      kit(k,c,C,red){const E=HARPY181.E[n]||{};(E.eyes||[[-.036,1.189,.08],[.036,1.189,.08]]).forEach((p,i)=>{const s=i?1:-1;k.p('head','sph','g',red?0xff2a2a:K.eye,p[0],p[1],p[2]-.002,.011,.0075,.006,0,0,s*.25)});
        if(K.glow)(E.streak||[]).forEach(([p,q,w])=>{k.L(p[1]>.75?'chest':'spine','g',K.glow,p,q,.006,.004,3);k.P[k.P.length-1].w=w})},
      post(x,c,C,mat){lpwPair(x,'chest',nh_Wing(n),nh_WingMat(mat),NH_WH[0],NH_WH[1],NH_WH[2],NH_WS,NH_WD,.55,.4);x.nhw={};x.wings.forEach(wg=>{const m=wg.p&&wg.p.children[0];if(m)m.frustumCulled=false});try{nh_WingAnim(x,0)}catch(e){}}})});
  if(EN.harpy)EN.harpy.rig='Harpy181';})();
