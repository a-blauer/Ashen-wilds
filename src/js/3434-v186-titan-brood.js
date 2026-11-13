// ================= v186: Titanshell becomes a living mountain, Hivemother a brood queen spider (owner, Nov 1 2026) =================
// Owner: "I also dont like the city on titanshell's back- think of something else." and "I dont like hivemother's design at
// all either- remodel her completely." Chosen directions:
//  * Titanshell - a living mountain: the walled town on its dome (keep, turret, walls, gate, tree in the court) is gone; a
//    jagged summit of grey crags rises from the dome with lesser peaks and ridges running down its sides, scree at the
//    foot, three dead pines on the slopes, moss in the hollows and cold crystal veins glowing in the cracks. The shell rim,
//    the hanging roots, the head and tail are kept. Its evolution ripens the crystal: the clusters swell and glow, cracks
//    light down the dome, a crown of crystal breaks from the summit, the horns and tail club glow.
//  * Hivemother - a brood queen spider: a gaunt black queen on long angular legs; a narrow ridged carapace with a crest of
//    backward spines; a swollen abdomen tilted up behind her, its black chitin shell cracked open in places over clusters of
//    glowing amber egg cells, glowing seams running between the breaks; a hooked stinger at the tip and hatchlings
//    clinging to her back. No honeycomb, no bee stripes. Her evolution ripens the brood.
// ---------------------------------------------------------------- Titanshell ----------------------------------------------------------------
var TM186={on:true,
  // crystal clusters [x, z, size] (shared with the evolution)
  xl:[[.17,.1,1],[-.16,-.14,.9],[.05,.2,.75],[-.06,-.24,.8]],
  // the peaks [x, z, half width, height, lean x, lean z, turn]
  pk:[[-.03,-.06,.17,.33,.06,-.04,.3],[.06,.1,.13,.23,-.15,.1,.9],[-.09,.17,.1,.16,.2,.2,.2],[.02,-.22,.14,.25,0,-.15,1.3],[-.14,-.08,.11,.19,.3,.05,.6],[.14,-.1,.11,.18,-.3,-.05,2.0],[.0,-.35,.09,.13,0,-.3,.4]]};
{const f=er150TitanKit;er150TitanKit=function(k,C,red){if(!TM186.on)return f.apply(this,arguments);const T=ER150.TI,Y=T.Y,top=T.top,p0=k.p,L0=k.L;
  // drop the town: every part on the dome's top (the shell rim, roots and moss on the slopes, the head and tail stay)
  k.p=function(bn,geo,t,col,x,y,z){if(bn=='spine'&&y>Y-.1)return k;return p0.apply(k,arguments)};
  k.L=function(bn,t,col,a,b){if(bn=='spine'&&a[1]>Y-.1&&b[1]>Y-.1)return k;return L0.apply(k,arguments)};
  try{f.apply(this,arguments)}finally{k.p=p0;k.L=L0}
  tm186Mountain(k,C,red)}}
function tm186Mountain(k,C,red){const T=ER150.TI,Y=T.Y,top=T.top,nz=er150Nz,base=lpMain(C,.12).getHex(),
    rock=dkShade(base,.72),rockD=dkShade(base,.5),rockL=dkShade(base,.95),scree=dkShade(base,.62),moss=0x3e5a2a,moss2=0x2e4420,wood=0x4a4036,woodD=0x2e2820,
    xc=red?0xff4a2a:0x6ad0e0,xcD=red?0x8a2010:0x2a6a7a,P=(x,y,z,sx,sy,sz,rx,ry,rz,col,geo)=>k.p('spine',geo||'cone4','c',col,x,y,z,sx,sy,sz,rx||0,ry||0,rz||0);
  // the summit and the lesser peaks: four-sided crags, leaning, each with a darker second face and a broken shoulder
  TM186.pk.forEach((q,i)=>{const [x,z,w,h,lx,lz,ry]=q,y0=top(x,z)-.03;
    P(x,y0+h/2,z,w,h,w*.85,lz,ry,-lx,i%2?rockD:rock);
    P(x+w*.35,y0+h*.28,z-w*.2,w*.7,h*.56,w*.6,lz*.6,ry+.7,-lx*.6+.15,i%2?rock:rockD);
    P(x-w*.3,y0+h*.2,z+w*.25,w*.55,h*.4,w*.5,lz*.5-.1,ry-.5,-lx*.5-.12,rockL)});
  // ridges running down from the summit: short crags along four directions, falling away
  [[.5,0],[2.3,.4],[3.6,.2],[5.1,.5]].forEach(([a,o],j)=>{for(let i=1;i<=4;i++){const r=.1+i*.075,x=Math.sin(a)*r-.03,z=Math.cos(a)*r-.06,h=.13-i*.022,w=.05-i*.006;
    if(Math.abs(x)>.38||z>.38||z<-.44)continue;P(x,top(x,z)+h*.3,z,w,h,w*.8,Math.cos(a)*.35,a+i,-Math.sin(a)*.35,(i+j)%2?rock:rockD)}});
  // scree and boulders round the foot of the massif
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2+.3,r=.25+(i%3)*.035,x=Math.sin(a)*r,z=Math.cos(a)*r-.05,s=.05+nz(i,2,5)*.03;
    if(Math.abs(x)>.4)continue;P(x,top(x,z)+s*.12,z,s,s*.55,s*.8,Math.cos(a)*.3,i*.9,-Math.sin(a)*.3,i%2?scree:rockD)}
  // three dead pines on the slopes: a grey trunk, a broken top, short branches hanging down
  [[.22,.17,.17,.15],[-.24,.03,.15,-.2],[.17,-.26,.13,.3]].forEach(([x,z,h,lean],n)=>{const y=top(x,z)-.015,t=[[x,y,z],[x+lean*.03,y+h*.5,z],[x+lean*.06,y+h,z+.005]];
    k.L('spine','c',wood,t[0],t[1],.014,.01,5);k.L('spine','c',woodD,t[1],t[2],.01,.003,4);
    for(let b=0;b<4;b++){const by=y+h*(.3+b*.17),a=b*2.2+n,l=.05-b*.008,bx=x+lean*.03*(by-y)/h*2;k.L('spine','c',b%2?wood:woodD,[bx,by,z],[bx+Math.cos(a)*l,by-.025,z+Math.sin(a)*l],.005,.002,3)}
    k.p('spine','dod','c',scree,x,y,z,.025,.012,.025)});
  // moss in the hollows between the crags
  [[.12,.16],[-.18,-.03],[.0,.22],[.2,-.1],[-.08,-.28],[-.2,.15]].forEach(([x,z],i)=>k.p('spine','ico','c',i%2?moss:moss2,x,top(x,z)+.002,z,.05,.012,.04,0,i,0));
  // crystal veins: clusters of cold crystal breaking from the cracks at the foot of the peaks, glowing seams up into the rock
  TM186.xl.forEach(([x,z,s],i)=>{const y=top(x,z)-.01;[[0,0,1,0],[.022,.012,.7,.5],[-.02,.016,.6,-.6],[.006,-.02,.55,.3]].forEach(([dx,dz,f,tl])=>
      k.p('spine','oct','g',f>.9?xc:xcD,x+dx*s,y+.03*f*s,z+dz*s,.016*s*f,.05*s*f,.016*s*f,dz*8,0,tl+(x>0?-.25:.25)));
    const pk=TM186.pk[i%TM186.pk.length],tx=pk[0],tz=pk[1];k.L('spine','g',xcD,[x,y+.01,z],[x+(tx-x)*.4,top(x+(tx-x)*.4,z+(tz-z)*.4)+.03,z+(tz-z)*.4],.006,.004,3)})}
// Titanshell evolution (levels 2 to 5): the crystal clusters swell and burn brighter, glowing cracks run down the dome, a
// crown of crystal breaks out of the summit, then the horns and the tail club glow (was lit windows, banners, a beacon)
er150TitanEvo=function(E,L,P){const T=ER150.TI,top=T.top,sb={bn:'spine'},hb={bn:'head'};
  // L2: the crystal clusters swell, a bright core in each
  TM186.xl.forEach(([x,z,s],i)=>{const y=top(x,z)-.01;E.pd('oct','g',P.glow,[x,y+.05*s,z],[x>0?-.2:.2,1,0],[.022*s,.07*s,.022*s],null,sb);E.pd('oct','g',P.glow2,[x,y+.05*s,z],[0,1,0],[.01*s,.04*s,.01*s],null,sb)});
  if(L>=3){// glowing cracks running down the dome from the foot of the massif
    for(let n=0;n<7;n++){const a=n/7*6.283+.4;let pr=null;for(let i=0;i<5;i++){const r=.25+i*.045,w=Math.sin(i*1.7+n)*.06,t=E.top(Math.sin(a+w)*r,Math.cos(a+w)*r-.02);if(!t)break;const q=E.add(t.p,t.n,.004);
      if(pr)E.L(pr,q,.008-i*.001,.007-i*.001,'g',i<2?P.glow:P.glowD,3,{vs:1});pr=q}}}
  if(L>=4){// a crown of crystal breaking out of the summit
    const q=TM186.pk[0],sy=top(q[0],q[1])-.03+q[3]*.78;
    for(let i=0;i<5;i++){const a=i/5*6.283,d=[Math.cos(a)*.5,1,Math.sin(a)*.5];E.pd('oct','g',i%2?P.glow:P.glowD,[q[0]+Math.cos(a)*.03,sy,q[1]+Math.sin(a)*.03],d,[.018,.075-i%2*.02,.018],null,sb)}
    E.pd('oct','g',P.glow2,[q[0]+.01,sy+.06,q[1]-.01],[0,1,0],[.022,.09,.022],null,sb)}
  if(L>=5){// glowing horn tips and crystal on the tail club
    [-1,1].forEach(s=>E.pd('oct','g',P.glow,[s*.3,.6,.57],[s*-.1,.5,.6],[.012,.026,.012],null,hb));
    for(let i=0;i<10;i++){const a=i/10*6.283+.3,h=E.on([Math.sin(a)*.9,.36,Math.cos(a)*1-.02],[-Math.sin(a),0,-Math.cos(a)]);if(h&&h.p[1]>.3&&h.p[1]<.45)E.pd('oct','g',i%2?P.glow:P.glowD,E.add(h.p,h.n,-.01),E.nrm([h.n[0],.8,h.n[2]]),[.012,.04,.012],null,sb)}}};
// ---------------------------------------------------------------- Hivemother ----------------------------------------------------------------
var HM186={on:true,chev:[-.4,-.58,-.76],
  // abdomen [z, y, rx, ryT, ryB] back to front, then the waist, carapace and head
  ab:[[-1.02,.64,.04,.04,.035],[-.97,.635,.11,.1,.08],[-.9,.63,.19,.17,.14],[-.81,.62,.26,.24,.19],[-.7,.6,.31,.29,.23],[-.58,.58,.33,.31,.25],
    [-.46,.55,.32,.3,.25],[-.34,.52,.28,.26,.22],[-.24,.49,.21,.19,.16],[-.17,.465,.12,.11,.09],[-.13,.45,.06,.05,.045]],
  fr:[[-.09,.435,.05,.045,.04],[-.04,.425,.07,.05,.05],[.01,.425,.12,.07,.06],[.08,.435,.155,.088,.07],[.16,.44,.165,.092,.07],[.24,.44,.15,.088,.068],
    [.31,.435,.12,.078,.062],[.37,.43,.092,.064,.054],[.42,.42,.068,.05,.044],[.46,.41,.036,.032,.028],[.48,.405,.01,.01,.01]],
  // the breaks in the shell [z, angle round the abdomen (pi/2 = the top)], the first four always open, the rest from evolution
  br:[[-.5,1.15],[-.66,2.05],[-.76,.85],[-.42,2.45],[-.84,1.75],[-.58,.45],[-.6,2.75]],
  pal(C){const main=lpMain(C,.12),blk=new THREE.Color(0x0a0809).lerp(main,.03);
    return {main,blk,gloss:blk.clone().lerp(new THREE.Color(0x6a5a50),.22),under:new THREE.Color(0x2a1410).lerp(main,.1),
      egg:new THREE.Color(C).lerp(new THREE.Color(0xffd870),.4).multiplyScalar(.9),eggD:new THREE.Color(C).lerp(new THREE.Color(0xff8a20),.3).multiplyScalar(.5),crack:new THREE.Color(0x3a1c08).lerp(main,.2)}}};
// gaunt angular legs: a high peak, the knee by the k1 bone, a long shin to the foot
{const f=CS150.leg;CS150.leg=function(sp,s,i){if(sp!='Hivemother'||!HM186.on)return f.apply(this,arguments);const z=SPID_LZ[i],dz=SPID_LDZ[i],k=(s<0?'a':'b')+i,g=[1.1,1,1,1.12][i];
  return {k,P:[[s*.08,.43,z*.9],[s*.32,.74+(i==1||i==2?.02:0),z+dz*.22*g],[s*.43,.6,z+dz*.36*g],[s*.72,.24,z+dz*.84*g],[s*.86,0,z+dz*1.06*g]]}}}
function hm186Rot(d){const l=Math.hypot(...d)||1,e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(d[0]/l,d[1]/l,d[2]/l)));return [e.x,e.y,e.z]}
cs150HMGeo=function(C,sp){if(!HM186.on)return;const K=HM186.pal(C),AB=HM186.ab,FR=HM186.fr,T=AB.concat(FR);
  const rings=T.map((q,i)=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],b:q[0]<-.11?cs150AbB(q[0]):cs150FrB(q[0]),z:q[0],ab:q[0]<-.11,i}));
  const L=[{rings,seg:14,capA:1,capB:1,paint:(o,r,s,cc,i)=>{const a=Math.atan2(s,cc);
    if(r.ab){// black chitin plates (a slightly different black each), a dark brood-red underside, dark seams between the plates
      o.copy(K.blk);if(s>.55)o.lerp(K.gloss,.5*(s-.55)/.45);
      if(s<-.45)o.copy(K.under);return}
    // the carapace: black, a gloss ridge down the middle, the head a little redder
    o.copy(K.blk);if(s>.7)o.copy(K.gloss);if(s<-.3)o.copy(K.under).multiplyScalar(.8);if(r.z>.36)o.lerp(K.under,.25)}}];
  [-1,1].forEach(s=>[0,1,2,3].forEach(i=>{const G=CS150.leg('Hivemother',s,i),k=G.k,P=G.P,rs=1-i*.02;
    const pts=[v150Lerp(P[0],P[1],-.1),v150Lerp(P[0],P[1],.5),P[1],P[2],v150Lerp(P[2],P[3],.35),v150Lerp(P[2],P[3],.75),P[3],v150Lerp(P[3],P[4],.5),P[4]];
    L.push(v150Leg(pts,[.05,.042,.036,.04,.031,.026,.03,.017,.005].map(r=>r*rs),
      [[k+'0',k+'0',0],[k+'0',k+'0',0],[k+'0',k+'0',0],[k+'0',k+'1',.5],[k+'1',k+'1',0],[k+'1',k+'1',0],[k+'1',k+'2',.5],[k+'2',k+'2',0],[k+'2',k+'2',0]],
      [0,0,0,1,0,0,1,0,0],(o,r,s2)=>{o.copy(K.blk);if(s2>.5)o.copy(K.gloss).multiplyScalar(.85);if(r.jt)o.lerp(K.under,.5);if(s2<-.4)o.lerp(K.under,.3)},6))}));
  return lpGeo('HM186|'+C,'Cryptspider',L,186)};
cs150HMKit=function(k,C,red){const K=HM186.pal(C),AB=HM186.ab,blk=K.blk.getHex(),gl=K.gloss.getHex(),un=K.under.getHex(),egg=red?0xff4a2a:K.egg.getHex(),eggD=red?0x8a1a10:K.eggD.getHex(),eye=red?0xff3a1a:0xffa020,R=dkRng(186),tb='tail0';
  // round 3 (owner: "the abdomen is kind of gross, lets remove those details and add some other accents to make her seem more
  // special"): no broken shell, egg clusters, seams, flank plates or hatchlings. A sleek black abdomen marked with three amber
  // chevrons pointing to her head (the queen's mark), a ridge of amber-tipped spines down its crown
  HM186.chev.forEach((z0,j)=>{[-1,1].forEach(sd=>{let pr=v150Surf(AB,z0,Math.PI/2,.002);for(let i=1;i<=3;i++){const t=i/3,p=v150Surf(AB,z0+.1*t,Math.PI/2+sd*.85*t,.002);
    k.L(tb,'g',eggD,pr,p,.012-j*.002,.012-j*.002,3);pr=p}})});
  for(let j=0;j<5;j++){const z=-.3-j*.13,p=v150Surf(AB,z,Math.PI/2,-.01);k.p(tb,'cone4','c',j%2?blk:gl,p[0],p[1]+.018,p[2],.022,.08-Math.abs(j-2)*.01,.03,-.7,0,0);
    k.p(tb,'oct','g',eggD,p[0],p[1]+.05-Math.abs(j-2)*.005,p[2]-.026,.006,.014,.006,-.7,0,0)}
  // the stinger: a curved black hook from the tip of the abdomen, a dark red point
  {const S=[[0,.64,-.99],[0,.62,-1.06],[0,.585,-1.12],[0,.54,-1.16]];k.L(tb,'c',blk,S[0],S[1],.04,.03,6).L(tb,'c',gl,S[1],S[2],.03,.016,6).L(tb,'c',un,S[2],S[3],.016,.002,5)}
  // the carapace: a ridge of short spines, a crest of three long backward spines behind the eyes
  [.25,.17,.09,.02].forEach((z,i)=>k.p(z>.1?'chest':'spine','cone4','c',i%2?blk:gl,0,.53-Math.abs(z-.16)*.25,z,.014,.05,.018,-.6,0,0));
  // her crown: five long spines swept back from behind the eyes in an arc, amber at the tips; an amber stone set in the carapace
  [-2,-1,0,1,2].forEach(i=>{const x=i*.03,h=1-Math.abs(i)*.18,b=[x,.478,.38],m=[x*1.9,.48+.1*h,.31],t=[x*2.4,.49+.15*h,.22];k.L('head','c',blk,b,m,.016,.009,4);k.L('head','c',gl,m,t,.009,.002,4);
    k.p('head','oct','g',eggD,t[0],t[1],t[2],.006,.014,.006,-.9,0,0)});
  k.p('chest','cyl','c',gl,0,.524,.16,.032,.012,.03);k.p('chest','oct','g',egg,0,.537,.16,.018,.02,.016);
  // eyes: two large, six small, amber, in a dark brow
  k.p('head','box','c',blk,0,.478,.405,.1,.02,.05,-.3,0,0);
  [-1,1].forEach(s=>{k.p('head','sph','c',0x080606,s*.026,.462,.43,.018);k.p('head','sph','g',eye,s*.028,.465,.438,.012);
    [[.05,.456,.415,.009],[.062,.443,.4,.008],[.016,.472,.418,.008],[.042,.468,.403,.007]].forEach(q=>k.p('head','sph','g',eye,s*q[0],q[1],q[2],q[3]));
    // chelicerae with long curved pale fangs (jaw bone: they flare when biting), thin pedipalps
    k.L('jaw','c',blk,[s*.024,.415,.44],[s*.032,.36,.49],.024,.018,5);k.L('jaw','c',0xd8c8a8,[s*.032,.36,.49],[s*.026,.31,.5],.012,.007,4);k.L('jaw','c',0xd8c8a8,[s*.026,.31,.5],[s*.012,.29,.48],.007,.001,4);
    k.L('head','c',blk,[s*.05,.41,.44],[s*.09,.39,.52],.012,.01,5);k.L('head','c',gl,[s*.09,.39,.52],[s*.1,.35,.55],.011,.01,5);k.L('head','c',blk,[s*.1,.35,.55],[s*.098,.29,.57],.01,.003,5);
    // spurs on the legs: one on each high peak, two along each shin
    [0,1,2,3].forEach(i=>{const G=CS150.leg('Hivemother',s,i),kk=G.k,P=G.P;k.L(kk+'0','c',gl,[P[1][0],P[1][1]+.02,P[1][2]],[P[1][0]+s*.015,P[1][1]+.08,P[1][2]-.02],.012,.002,4);
      [.3,.62].forEach(t=>{const p=v150Lerp(P[2],P[3],t);k.L(kk+'1','c',blk,[p[0]+s*.02,p[1],p[2]],[p[0]+s*.07,p[1]+.035,p[2]],.011,.002,4)})})});
  // spinnerets under the stinger
  [-1,1].forEach(s=>k.L(tb,'c',un,[s*.025,.58,-.98],[s*.03,.55,-1.02],.016,.005,4))};
// her evolution (round 3): the queen's regalia grows - L1 venom on the fangs and the stinger; L2 the chevrons burn bright;
// L3 her crown and leg spurs burn at the tips; L4 a second, taller crown of amber spines and an amber stinger; L5 a glowing
// seam down her back and amber stones along her abdomen's flanks
cs150HMEvo=function(E,L,P){const jb={bn:'jaw'},hb={bn:'head'},tb={bn:'tail0'},AB=HM186.ab,hit=(z,a)=>E.on(v150Surf(AB,z,a,.4),[-Math.cos(a),-Math.sin(a),0]);
  [-1,1].forEach(s=>E.pd('sph','g',P.glow,[s*.012,.29,.48],[0,1,0],[.008,.014,.008],null,jb));
  if(L>=2)HM186.chev.forEach((z0,j)=>[-1,1].forEach(sd=>{let pr=v150Surf(AB,z0,Math.PI/2,.006);for(let i=1;i<=3;i++){const t=i/3,p=v150Surf(AB,z0+.1*t,Math.PI/2+sd*.85*t,.006);
    E.L(pr,p,.01,.01,'g',j?P.glow:P.glow2,3,tb);pr=p}}));
  if(L>=3){[-2,-1,0,1,2].forEach(i=>{const x=i*.03,h=1-Math.abs(i)*.18;E.pd('oct','g',P.glow,[x*2.4,.49+.15*h,.22],[x*2,.5,-.9],[.008,.022,.008],null,hb)});
    [-1,1].forEach(s=>[0,1,2,3].forEach(i=>{const G=CS150.leg('Hivemother',s,i),P1=G.P[1];E.pd('oct','g',P.glowD,[P1[0]+s*.015,P1[1]+.08,P1[2]-.02],[0,1,0],[.006,.016,.006],null,{bn:G.k+'0'})}))}
  if(L>=4){[-1,0,1].forEach(i=>{const b=[i*.045,.49,.37],t=[i*.08,.66-Math.abs(i)*.04,.33];E.L(b,t,.012,.003,'c',P.dark,4,hb);E.pd('oct','g',P.glow2,t,[i*.3,1,-.2],[.008,.02,.008],null,hb)});
    E.L([0,.585,-1.12],[0,.54,-1.16],.016,.003,'g',P.glow,4,tb)}
  if(L>=5){let pr=null;for(let j=0;j<8;j++){const h=E.top(0,-.22-j*.1),p=h?E.add(h.p,h.n,.004):null;if(p&&pr)E.L(pr,p,.008,.008,'g',j%2?P.glow:P.glow2,3,{vs:1});pr=p}
    for(let i=0;i<6;i++){const h=hit(-.4-(i%3)*.17,i<3?.2:Math.PI-.2);if(h)E.pd('oct','g',i%2?P.glow:P.glowD,E.add(h.p,h.n,-.002),h.n,[.014,.02,.014],null,tb)}}};
// lpExtras (traits) read her new back line and head
V150_EX.Hivemother={back:[['tail0',0,.86,-.72],['tail0',0,.89,-.58],['tail0',0,.85,-.44],['chest',0,.53,.15]],head:['head',0,.48,.41],up:.1};
if(typeof EVO100!='undefined'&&EVO100.surf){delete EVO100.surf.Cryptspider;delete EVO100.surf.Stoneshell}
