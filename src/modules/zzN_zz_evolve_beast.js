// ================= v100 evolve: Beast rigs (Foxlet → Emberlynx, Ashwolf → Direfang, Skollmaw) =================
// Shared motifs used by several designs (all positions in the rig's model space, see zzN_zz_evolve.js for the kit E).
var EVO100_M={
  // a row of spikes/fins on the top line: zs = [[z, height, base radius],…]; lean = backward tilt; x offset
  ridge(E,zs,t,col,lean,x,tipCol,o){zs.forEach(q=>{const h=E.top(x||0,q[0]);if(!h)return;const d=E.nrm([h.n[0]*.5,1,-(lean==null?.6:lean)]);
    E.L(E.add(h.p,h.n,-q[2]*.5),E.add(h.p,d,q[1]),q[2],.002,t,col,4,o);if(tipCol!=null)E.L(E.add(h.p,d,q[1]*.62),E.add(h.p,d,q[1]*1.02),q[2]*.38,.001,'g',tipCol,4,o)})},
  // flank hit: side s (±1), y, z
  side(E,s,y,z){return E.on([s*2,y,z],[-s,0,0])},
  // fur tuft cone from hit h, pointing along h.n mixed with dir
  tuft(E,h,dir,len,r,col,t){const d=E.nrm([h.n[0]+dir[0],h.n[1]+dir[1],h.n[2]+dir[2]]);return E.L(E.add(h.p,h.n,-r*.6),E.add(h.p,d,len),r,.002,t||'c',col,4)},
  // extra tail splayed from a body tail (rings [z,y,r,bones,tip]) about root, yaw a, lift up, scale k
  tail(E,T,root,a,up,k,cBase,cTip,tipGlow,glowCol){const ca=Math.cos(a),sa=Math.sin(a),rings=T.map((r,i)=>{const dx=0,dy=r[1]-root[1],dz=r[0]-root[2],
      y2=dy*Math.cos(up)-dz*Math.sin(up),z2=dy*Math.sin(up)+dz*Math.cos(up);return {p:[root[0]+dx*ca+z2*sa,root[1]+y2,root[2]+z2*ca-dx*sa],r:r[2]*k,ry:r[2]*k*.92,col:r[4]?cTip:cBase,sk:r[3]}});
    rings[0].r*=.7;E.loft(rings,6,'c',{j:.12});
    if(tipGlow){const a1=rings[rings.length-3].p,b1=rings[rings.length-1].p,d=E.nrm([b1[0]-a1[0],b1[1]-a1[1]+.03,b1[2]-a1[2]]);
      E.L(E.add(b1,d,-.05*k),E.add(b1,d,.11*k*tipGlow),.05*k,.002,'g',glowCol,5,{bn:T[T.length-1][3][0]});E.L(E.add(b1,d,-.02*k),E.add(b1,[d[0]*.6,d[1]+.6,d[2]*.6],.08*k*tipGlow),.03*k,.001,'g',glowCol,4,{bn:T[T.length-1][3][0]})}
    return rings},
  // dangling charm on a string from point p (on the body), 'tooth' or 'bone' or gem
  charm(E,p,len,col,kind,o){E.L(p,E.add(p,[0,-len*.55,0]),.004,.004,'c',0x2a2018,3,o);const q=E.add(p,[0,-len*.55,0]);
    if(kind=='gem')return E.pd('oct','g',col,E.add(q,[0,-len*.18,0]),[0,1,0],[len*.18,len*.28,len*.18],null,o);
    if(kind=='bone'){E.L(E.add(q,[-len*.2,-len*.1,0]),E.add(q,[len*.2,-len*.1,0]),len*.06,len*.06,'c',col,4,o);return E}
    return E.pd('cone4','c',col,E.add(q,[0,-len*.25,0]),[0,-1,0],[len*.11,len*.5,len*.11],null,o)},
  // collar/band around a body section; returns the loop points; studs = metal studs every other point
  collar(E,c,axis,off,r,col,N,studCol,studSz,o){const pts=E.band(c,axis,off,r,'c',col,N,o);if(studCol!=null)pts.forEach((p,i)=>{if(i%2==0){const d=E.nrm([p[0]-c[0],p[1]-c[1],p[2]-c[2]]);E.pd('cone4','m',studCol,E.add(p,d,studSz*.3),d,[studSz*.5,studSz,studSz*.5],null,Object.assign({vs:1},o))}});return pts}};

// ---------------- Foxlet: fox spirit — runes, then more tails, harness, flame tips, gold circlet, flame mane ----------------
EVO100.D.Foxlet={glow:0xff8a2a,build(E,L,P){
  const M=EVO100_M,root=[0,.455,-.36];
  // L1: glowing forehead blaze, shoulder runes, leather collar with a tooth charm, longer cheek fur
  const fh=E.top(0,.56);if(fh){E.pd('oct','g',P.glow,E.add(fh.p,fh.n,.003),fh.n,[.022,.004,.05],[0,0,1]);if(L>=3)E.pd('oct','g',P.glow2,E.add(fh.p,fh.n,.006),fh.n,[.01,.004,.026],[0,0,1])}
  [-1,1].forEach(s=>{const h=M.side(E,s,.5,.17);if(h)E.rune(h,[0,1,-.3],.045,P.glow);
    [[.57,.5],[.59,.47]].forEach((q,i)=>{const hh=E.on([s*.5,q[0],q[1]],[-s,0,0]);if(hh)M.tuft(E,hh,[s*.4,-.3,-1],.09+.02*L,.03,i?P.mainL:0xd8cbb2)})});
  const col=M.collar(E,[0,.53,.33],[0,.35,1],.006,.012,P.leather,10,L>=3?P.metal:null,.03);
  const lo=col.reduce((a,p)=>p[1]<a[1]?p:a,col[0]);M.charm(E,lo,.09,P.bone,'tooth');
  if(L>=2){// two more tails, a fur crest on the nape
    [-1,1].forEach(s=>M.tail(E,FOX_TAIL,root,s*.42,.12,L>=4?.86:.72,P.main,0xd8cbb2,L>=3?1:0,P.glow));
    for(let i=0;i<5;i++){const z=.36-i*.07,h=E.top(0,z);if(h)M.tuft(E,h,[0,.5,-1.2],.08+.012*L-.008*i,.028,i%2?P.mainD:P.main)}
    [-1,1].forEach(s=>{const h=M.side(E,s,.45,-.06);if(h)E.rune(h,[0,1,0],.04,P.glow)})}
  if(L>=3){// flame tip on the main tail, harness with a bronze chest plate, glowing rune bands on the forelegs
    const tp=[0,.52,-1.09];E.L([0,.515,-1.03],[0,.56,-1.2],.05,.002,'g',P.glow,5,{bn:'tail3'});E.L([0,.52,-1.06],[0,.62,-1.15],.03,.001,'g',P.glow2,4,{bn:'tail3'});
    M.collar(E,[0,.47,.1],[0,0,1],.006,.011,P.leather,12);
    const cp=E.on([0,.4,1],[0,0,-1]);if(cp){E.plate(cp.p,cp.n,[0,1,0],.1,.09,.014,'m',P.metal,'box');E.gem({p:E.add(cp.p,cp.n,.01),n:cp.n},.022,P.glow)}
    [-1,1].forEach(s=>{E.band([s*.102,.16,.212],[0,1,0],.003,.007,'m',P.trim,8);E.band([s*.112,.22,-.2],[0,1,0],.003,.007,'m',P.trim,8)})}
  if(L>=4){// gold circlet across the brow with a gem, two more tails, glowing paw runes
    const arc=[];for(let i=-3;i<=3;i++){const a=i/3*1.1,h=E.on([Math.sin(a)*.5,.9,.52+Math.cos(a)*.1],[-Math.sin(a),-1.2,-.1]);if(h)arc.push(h)}
    for(let i=0;i<arc.length-1;i++)E.L(E.add(arc[i].p,arc[i].n,.008),E.add(arc[i+1].p,arc[i+1].n,.008),.008,.008,'m',P.gold,4);
    arc.forEach((h,i)=>{if(i%2==0)E.pd('cone4','m',P.gold,E.add(h.p,h.n,.03),E.nrm([h.n[0],h.n[1]+1,h.n[2]]),[.012,.05+(i==3?.04:0),.012])});
    if(arc[3])E.gem({p:E.add(arc[3].p,arc[3].n,.012),n:arc[3].n},.02,P.glow);
    [-1,1].forEach(s=>M.tail(E,FOX_TAIL,root,s*.8,.25,.62,P.mainD,0xd8cbb2,1,P.glow))}
  if(L>=5){// spirit-flame mane around the neck
    for(let i=0;i<9;i++){const a=-1.2+i/8*2.4,h=E.on([Math.sin(a)*.6,.53+Math.cos(a)*.5,.36],[-Math.sin(a),-Math.cos(a),0]);if(h)E.L(E.add(h.p,h.n,-.01),E.add(h.p,E.nrm([h.n[0],h.n[1]+.4,-1.1]),.15+(i%2)*.05),.035,.002,'g',i%2?P.glow:P.glow2,4)}}
}};

// ---------------- Ashwolf: war-wolf — thicker ruff, war paint, bone charms, scarred lamellar armour, runes, ember mane ----------------
EVO100.D.Ashwolf={glow:0xff7a2a,build(E,L,P){
  const M=EVO100_M,W=wolfP,Z=z=>W([0,0,z])[2],Y=y=>W([0,y,0])[1];
  // L1: a thicker ruff (second ring of long shag), glowing claw-mark war paint on the shoulders, a bone fang charm
  for(let i=0;i<13;i++){const a=-Math.PI*.2+i/12*Math.PI*1.4,cx=Math.cos(a),sy=Math.sin(a),o=W([cx*.3,.53+sy*.3,.34]),c=W([0,.53,.34]);
    const h=E.on(o,[c[0]-o[0],c[1]-o[1],c[2]-o[2]]);if(h)M.tuft(E,h,[0,0,-1.3],.12+.012*L,.04,i%2?P.main:P.mainD)}
  [-1,1].forEach(s=>{[0,1,2].forEach(k=>{const h=E.on([s*.5,Y(.5)-k*.02,Z(.2-k*.035)],[-s,0,0]);if(h)E.L(E.add(h.p,h.n,.004),E.add(E.add(h.p,h.n,.004),[0,-.075,-.05]),.008,.003,'g',P.glow,3,{vs:1})})});
  if(L>=2){// spiked leather collar with a necklace of fangs and a bone talisman, longer hackle crest
    const c=W([0,.5,.36]),pts=M.collar(E,c,[0,.4,1],.01,.016,P.leather,12,P.metal,.045);
    pts.forEach((p,i)=>{if(p[1]<c[1]-.02&&i%2)M.charm(E,p,.1,P.bone,'tooth')});const lo=pts.reduce((a,p)=>p[1]<a[1]?p:a,pts[0]);M.charm(E,lo,.13,P.boneD,'bone');
    for(let i=0;i<7;i++){const h=E.top(0,Z(.4-i*.07));if(h)[-1,1].forEach(s=>M.tuft(E,{p:E.add(h.p,[s*.02,0,0]),n:h.n},[s*.3,.6,-1.3],.11+.015*L,.03,i%2?P.mainD:P.dark))}}
  if(L>=3){// lamellar pauldrons (three overlapping lames per shoulder), segmented saddle plates, rune on each pauldron, tusks
    [[.3,.2,.024],[.24,.14,.034],[.18,.08,.044]].forEach((q,k)=>E.shell((x,y,z,nx,ny)=>z<Z(q[0])&&z>Z(q[1])&&y>Y(.43)&&Math.abs(nx)>.3&&ny>-.35,q[2],'m',k==1?P.metal:P.iron,{rimCol:P.trim}));
    [[.02,-.06],[-.08,-.16],[-.18,-.25]].forEach((q,k)=>E.shell((x,y,z,nx,ny)=>z<Z(q[0])&&z>Z(q[1])&&ny>.45,.02,'m',k==1?P.metal:P.iron,{rimCol:P.trim}));
    [-1,1].forEach(s=>{const h=E.on([s*.5,Y(.56),Z(.25)],[-s,-.2,0]);if(h){E.pd('sph','m',P.trim,E.add(h.p,h.n,.03),h.n,.014);E.rune({p:E.add(h.p,h.n,.03),n:h.n},[0,1,0],.045,P.glow)}
      const t=W([s*.03,.535,.66]);E.L(t,E.add(t,[s*.012,.065,.035]),.013,.002,'c',P.bone,4,{bn:'jaw'})});
    [.0,-.11,-.21].forEach(z=>{const h=E.top(0,Z(z));if(h)E.pd('cone4','m',P.trim,E.add(h.p,h.n,.035),h.n,[.016,.05,.016])})}
  if(L>=4){// brow helm with swept horns, chest plate with a gem, bone bracers on the forelegs, glowing tail charms
    E.shell((x,y,z,nx,ny)=>z>Z(.5)&&z<Z(.6)&&ny>.55,.016,'m',P.metal,{rimCol:P.trim});
    const hb=E.top(0,Z(.56));if(hb){E.gem({p:E.add(hb.p,hb.n,.016),n:hb.n},.024,P.glow);
      [-1,1].forEach(s=>E.horn(E.add(hb.p,[s*.07,.0,-.04]),[s*.45,.55,-.6],[0,-.04,-.07],.24,.028,'c',P.bone,5,null,P.trim))}
    E.shell((x,y,z,nx,ny,nz)=>z>Z(.18)&&nz>.55&&y<Y(.56)&&y>Y(.36),.02,'m',P.metal,{rimCol:P.trim});
    const cp=E.on([0,Y(.46),2],[0,0,-1]);if(cp)E.gem({p:E.add(cp.p,cp.n,.02),n:cp.n},.028,P.glow);
    [-1,1].forEach(s=>{E.shell((x,y,z)=>Math.abs(x-s*W([.104,0,0])[0])<.07&&y>Y(.17)&&y<Y(.24)&&z>Z(.15),.01,'c',P.leather,{rimCol:P.dark});E.band(W([s*.104,.25,.215]),[0,1,0],.006,.008,'m',P.trim,8)});
    [['tail1',-.62],['tail2',-.82]].forEach(q=>{const h=E.top(0,Z(q[1]));if(h)M.charm(E,E.add(h.p,[0,-.05,0]),.1,P.glow,'gem',{bn:q[0]})})}
  if(L>=5){// ember mane through the ruff, burning eye trails, gold crown spikes on the helm
    for(let i=0;i<9;i++){const a=-Math.PI*.05+i/8*Math.PI*1.1,o=W([Math.cos(a)*.3,.53+Math.sin(a)*.3,.3]),c=W([0,.53,.3]),h=E.on(o,[c[0]-o[0],c[1]-o[1],c[2]-o[2]]);
      if(h)E.L(E.add(h.p,h.n,-.01),E.add(h.p,E.nrm([h.n[0],h.n[1]+.3,-1.2]),.22),.04,.002,'g',i%2?P.glow:P.glow2,4)}
    [-1,1].forEach(s=>{const e=W([s*.09,.636,.574]);E.L(e,E.add(e,[s*.04,.015,-.14]),.012,.001,'g',P.glow2,3,{bn:'head'})});
    for(let i=-2;i<=2;i++){const h=E.top(i*.035,Z(.53));if(h)E.pd('cone4','m',P.gold,E.add(h.p,h.n,.03),E.nrm([i*.3,1,-.3]),[.012,.07-Math.abs(i)*.012,.012])}}
}};
