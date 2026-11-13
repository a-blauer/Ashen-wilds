// ================= v186: Gloomcap and Sporelord redone as fungal crawlers (owner, Nov 1 2026) =================
// Owner: "I dont like the mushroom companions design at all and would like to redo them completely. I dont like the face on the
// stem and their shape is too phallic." Chosen direction: a fungal crawler. Both were an upright stalk with a face under a cap.
//  * Gloomcap: a low, broad mound of fungal flesh on four splayed root-legs (two more stiff legs at its sides), its back a
//    layered growth of caps and shelf fungi; a brim cap overhangs the front and small eyes glow from under its gills; a gill
//    mouth with two pale hooked mouthparts.
//  * Sporelord: the same crawler grown into a hunched cordyceps beast: a high humped back, dark mottled hide with veins, shelf
//    plates along the spine and long cordyceps fruiting stalks bursting from the hump, each ending in a swollen club; a wider
//    underslung maw and six eyes.
// The skeleton is laid out again as a low quadruped and walks with the quad gait (SPEC.Gloomcap is replaced with a new object:
// the Fungal Shambler enemy keeps its own copy of the old biped skeleton). Detail is paint and a few shapes (recipe): mottled
// caps, gill lines that follow the body, a pale underside; no polka dots.
var FC186={};
SPEC.Gloomcap=Object.assign({},SPEC.Gloomcap,{anim:'quad',hd:[0,.33,.33],bk:[['pelvis',.42,-.18],['spine',.46,0],['chest',.44,.14]],
  bones:{pelvis:[null,0,.24,-.16],spine:['pelvis',0,.27,0],chest:['spine',0,.27,.15],neck:['chest',0,.26,.25],head:['neck',0,.25,.32],jaw:['head',0,.19,.38],
    tail0:['pelvis',0,.22,-.28],tail1:['tail0',0,.2,-.35],tail2:['tail1',0,.17,-.4],tail3:['tail2',0,.14,-.44],
    hl0:['pelvis',-.15,.22,-.18],hl1:['hl0',-.3,.31,-.24],hl2:['hl1',-.38,.05,-.29],hr0:['pelvis',.15,.22,-.18],hr1:['hr0',.3,.31,-.24],hr2:['hr1',.38,.05,-.29],
    fl0:['chest',-.15,.24,.15],fl1:['fl0',-.29,.32,.22],fl2:['fl1',-.37,.05,.29],fr0:['chest',.15,.24,.15],fr1:['fr0',.29,.32,.22],fr2:['fr1',.37,.05,.29]},
  legs:[['hl',0],['hr',Math.PI],['fl',Math.PI],['fr',0]]});
if(typeof EVO100!='undefined'&&EVO100.surf)Object.keys(EVO100.surf).forEach(k=>{});
// body sections [z, centre y, half width, above, below, bones]
FC186.B={Gloomcap:[[-.38,.2,.04,.035,.03,['tail0','tail0',0]],[-.32,.22,.16,.11,.08,['pelvis','tail0',.3]],[-.22,.24,.23,.15,.1,['pelvis','pelvis',0]],
    [-.1,.26,.27,.18,.11,['pelvis','spine',.5]],[.03,.27,.28,.19,.11,['spine','spine',0]],[.14,.27,.25,.17,.1,['chest','chest',0]],
    [.23,.265,.2,.13,.09,['chest','neck',.5]],[.3,.255,.15,.09,.08,['neck','head',.6]],[.35,.245,.1,.065,.06,['head','head',0]],[.385,.24,.035,.03,.03,['head','head',0]]],
  Sporelord:[[-.4,.2,.05,.04,.03,['tail0','tail0',0]],[-.33,.23,.18,.15,.08,['pelvis','tail0',.3]],[-.22,.26,.25,.23,.1,['pelvis','pelvis',0]],
    [-.1,.3,.29,.38,.12,['pelvis','spine',.5]],[.02,.3,.3,.37,.12,['spine','spine',0]],[.13,.28,.27,.26,.1,['chest','chest',0]],
    [.22,.27,.21,.16,.09,['chest','neck',.5]],[.3,.245,.16,.1,.085,['neck','head',.6]],[.355,.235,.11,.07,.065,['head','head',0]],[.39,.23,.04,.03,.03,['head','head',0]]]};
FC186.cols=(C,sp)=>{const m=lpMain(C,.18),spore=sp=='Sporelord';
  const cap=spore?m.clone().lerp(new THREE.Color(0x3a3a34),.45):m.clone().lerp(new THREE.Color(0x4a3426),.4).multiplyScalar(.85),flesh=new THREE.Color(spore?0x8a8474:0x9a8a74),gill=new THREE.Color(spore?0x2a2a22:0x3a2228);
  return {cap,capD:cap.clone().multiplyScalar(.55),capL:cap.clone().lerp(new THREE.Color(0xc8b89a),.3),flesh,fleshD:flesh.clone().multiplyScalar(.6),gill,
    vein:spore?m.clone().lerp(new THREE.Color(0x9affd8),.25):cap.clone().multiplyScalar(.4),root:new THREE.Color(0x3a2e22),stalk:new THREE.Color(spore?0xb8b4a0:0xc0b096),club:spore?m.clone().lerp(new THREE.Color(0xd89a4a),.35):cap.clone(),ochre:new THREE.Color(spore?0x6a6448:0x8a6438),ochreD:new THREE.Color(spore?0x3e3a2a:0x4a3420)}};
FC186.ST=[[0,-.06,.32,-.3],[-.08,.02,.26,-.15],[.08,.02,.28,.15],[-.12,-.14,.22,-.35],[.12,-.14,.24,.35],[0,.1,.2,0],[.03,-.2,.24,.1]];
FC186.club=(q,top)=>{const x=q[0],z=q[1],y=top(x,z)-.02,L=q[2],lean=q[3];return [x+lean*.13,y+L,z-.12]};
FC186.sp=c=>{try{return rv137('Gloomcap',c)||'Gloomcap'}catch(e){return 'Gloomcap'}};
function fc186Geo(C,c){const sp=FC186.sp(c),spore=sp=='Sporelord',K=FC186.cols(C,sp),T=FC186.B[sp],sn=(p,f,s)=>n3Sn(p[0],p[1],p[2],f,s);
  const paint=(o,r,s,cc)=>{const p=rm186Pt(r,s,cc);
    if(r.k=='leg'){o.copy(K.stalk).lerp(K.root,Math.max(0,.6-p[1]*2.4));if(sn(p,30,4)>.66)o.lerp(K.root,.35);return}
    o.copy(K.cap);
    // the top: mottled cap flesh, darker toward the edge; the flanks: gill lines that run down the body; the underside pale
    const m=sn(p,9,spore?7:2);o.lerp(K.capD,Math.max(0,(m-.45)*.7));if(s>.55)o.lerp(K.capL,(s-.55)*.5*(m<.45?1:.3));
    if(s<.25&&s>-.45){const g=Math.abs(Math.sin(Math.atan2(cc,1)*14+r.p[2]*9));o.lerp(K.gill,.25+.35*(g>.7?1:0))}
    if(s<-.45)o.copy(K.flesh).lerp(K.fleshD,Math.max(0,(-s-.7)*1.4));
    if(spore&&s>-.2){const v=sn(p,22,11);if(v>.72)o.lerp(K.vein,.6*Math.min(1,(v-.72)*6))}
    if(r.k=='hd'&&s<.1)o.lerp(K.gill,.35)};
  const body={rings:T.map(q=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],b:q[5],k:q[0]>.29?'hd':'b'})),seg:10,capA:1,capB:1,paint};
  const B=SPEC.Gloomcap.bones,leg=(k,par)=>{const a=B[k+'0'],b=B[k+'1'],d=B[k+'2'],s=Math.sign(a[1]);
    return {rings:[{p:[a[1]*.7,a[2]+.01,a[3]],rx:.044,b:[par,k+'0',.4],k:'leg'},{p:[a[1],a[2]+.01,a[3]],rx:.036,b:[k+'0',k+'0',0],k:'leg'},
      {p:[(a[1]+b[1])/2,(a[2]+b[2])/2+.012,(a[3]+b[3])/2],rx:.028,b:[k+'0',k+'1',.5],k:'leg'},{p:[b[1],b[2],b[3]],rx:.032,b:[k+'1',k+'1',0],k:'leg'},
      {p:[b[1]*.6+d[1]*.4+s*.012,b[2]*.6+d[2]*.4,b[3]*.6+d[3]*.4],rx:.022,b:[k+'1',k+'2',.4],k:'leg'},{p:[d[1],d[2],d[3]],rx:.016,b:[k+'2',k+'2',0],k:'leg'},
      {p:[d[1]+s*.006,.004,d[3]+.006],rx:.006,b:[k+'2',k+'2',0],k:'leg'}],seg:6,ref:[0,0,1],capB:1,paint}};
  const lofts=[body,leg('hl','pelvis'),leg('hr','pelvis'),leg('fl','chest'),leg('fr','chest')];
  return lpGeo('FC186|'+sp+'|'+C,'Gloomcap',lofts,53)}
function fc186Kit(k,c,C,red){const sp=FC186.sp(c),spore=sp=='Sporelord',K=FC186.cols(C,sp),T=FC186.B[sp],hx=x=>x.getHex(),eye=red?0xff2a2a:spore?0x9affd0:0xc8ff7a;
  const top=(x,z)=>{let i=0;while(i<T.length-2&&z>T[i+1][0])i++;const A=T[i],Bq=T[i+1],t=Math.max(0,Math.min(1,(z-A[0])/(Bq[0]-A[0]))),y=A[1]+(Bq[1]-A[1])*t,w=A[2]+(Bq[2]-A[2])*t,h=A[3]+(Bq[3]-A[3])*t;
    return y+h*Math.sqrt(Math.max(0,1-(x/w)**2))};
  const bnz=z=>z>.26?'head':z>.08?'chest':z>-.12?'spine':'pelvis';
  const side=(z,f)=>{let i=0;while(i<T.length-2&&z>T[i+1][0])i++;const A=T[i],Bq=T[i+1],t=Math.max(0,Math.min(1,(z-A[0])/(Bq[0]-A[0]))),l=j=>A[j]+(Bq[j]-A[j])*t,H=f>0?l(3):l(4);
    return {x:l(2)*Math.sqrt(Math.max(0,1-f*f)),y:l(1)+H*f}};
  // a cap: stalk from the body, a dome, dark gills under it (all one bone)
  const cap=(x,z,r,h,st,col,tilt)=>{const y=top(x,z)-.012,bn=bnz(z),cy=y+st,tx=(tilt||0);
    if(st>.008)k.L(bn,'c',hx(K.stalk),[x,y-.01,z],[x+tx*st,cy,z],r*.28,r*.22,6);
    k.p(bn,'cyl','c',hx(K.gill),x+tx*st,cy-.002,z,r*.94,.006,r*.94);k.p(bn,'hem','c',col,x+tx*st,cy,z,r,h,r,0,0,-tx*.8)};
  // a bracket fungus growing out of the flank: a half-dome shelf with a paler growth band at its edge and pale pores under it
  const bracket=(s,z,f,w,cA,cB,turn)=>{const q=side(z,f),bn=bnz(z),x=s*(q.x+w*.18),y=q.y,ry=turn||0,rz=-s*.12;
    k.p(bn,'cyl','c',hx(K.flesh),x,y-.004,z,w*.62,.008,w*.8,0,ry,rz);k.p(bn,'hem','c',cB,x,y,z,w*.64,w*.26,w*.82,0,ry,rz);
    k.p(bn,'hem','c',cA,x-s*w*.08,y+.004,z,w*.5,w*.27,w*.66,0,ry,rz)};
  // the front: two brackets overhanging the face, small eyes glowing in the dark gills under them, pale mouthparts
  [-1,1].forEach(s=>{k.p('head','cyl','c',hx(K.gill),s*.045,.284,.35,.07,.008,.06,-.15,s*.4,-s*.1);k.p('head','hem','c',hx(K.capD),s*.05,.288,.35,.075,.04,.062,-.15,s*.4,-s*.1);
    k.p('head','hem','c',hx(spore?K.cap:K.ochreD),s*.044,.293,.345,.06,.04,.05,-.15,s*.4,-s*.1)});
  const E2=spore?[[-.07,.262,.37],[-.045,.27,.38],[-.016,.262,.388],[.016,.262,.388],[.045,.27,.38],[.07,.262,.37]]:[[-.062,.262,.372],[-.036,.27,.384],[-.012,.264,.39],[.012,.264,.39],[.036,.27,.384],[.062,.262,.372]];
  E2.forEach(e=>{k.p('head','sph','c',0x080604,e[0],e[1],e[2]-.004,.013,.011,.009);k.p('head','sph','g',eye,e[0],e[1],e[2]+.001,.007,.006,.005)});
  [-1,1].forEach(s=>{k.L('jaw','c',hx(K.stalk),[s*.035,.22,.37],[s*.05,.19,.405],.012,.007,5);k.L('jaw','c',hx(K.stalk),[s*.05,.19,.405],[s*.03,.175,.42],.007,.002,4)});
  // the middle pair of stiff root legs at the sides (rigid on the spine)
  [-1,1].forEach(s=>{const a=[s*.25,.25,0],b=[s*.38,.32,-.01],d=[s*.46,.005,0];k.L('spine','c',hx(K.stalk),a,b,.03,.028,6);k.p('spine','sph','c',hx(K.stalk),b[0],b[1],b[2],.03,.03,.03);k.L('spine','c',hx(K.stalk),b,d,.024,.006,6);
    k.L('spine','c',hx(K.root),[b[0]*.4+d[0]*.6,b[1]*.4+d[1]*.6,0],d,.017,.005,5)});
  if(!spore){// the body is a cluster of fungus: tiers of bracket shelves round the flanks and the rump, caps crowding the back
    const BA=[[hx(K.ochreD),hx(K.ochre)],[hx(K.cap),hx(K.capL)],[hx(K.ochre),hx(K.capL)]];
    [-1,1].forEach(s=>{[[.17,.55,.13],[.03,.6,.15],[-.12,.55,.15],[-.25,.45,.12]].forEach((q,i)=>bracket(s,q[0],q[1],q[2],...BA[(i+(s>0?1:0))%3],s*.2*(i-1.5)));
      [[.1,.05,.12],[-.05,.0,.13],[-.2,-.05,.11]].forEach((q,i)=>bracket(s,q[0],q[1],q[2],...BA[(i+2)%3],0))});
    [[-.33,.3,.1],[-.31,-.15,.09]].forEach((q,i)=>{const y=T[1][1]+q[1]*.1;k.p('pelvis','hem','c',hx(i?K.ochreD:K.ochre),0,y+q[1]*.05,q[0]-.01,q[2]*1.2,q[2]*.35,q[2]*.7,0,0,0)});
    cap(.04,-.05,.14,.1,.035,hx(K.cap));cap(-.13,.1,.09,.06,.025,hx(K.ochre),-.2);cap(-.1,-.2,.1,.065,.02,hx(K.capL),-.15);cap(.15,.11,.065,.045,.02,hx(K.ochre),.25);
    [[-.02,-.27,.045],[.07,-.25,.035],[.13,-.15,.04],[-.15,-.06,.04],[.0,.15,.05]].forEach((q,i)=>cap(q[0],q[1],q[2],q[2]*.7,.012+i%2*.012,[hx(K.capL),hx(K.ochre),hx(K.cap)][i%3],q[0]*1.5))}
  else{// cordyceps stalks bursting from the hunched back, each swelling into a club; a few dark brackets on the flanks
    FC186.ST.forEach((q,i)=>{
      const x=q[0],z=q[1],y=top(x,z)-.02,bn=bnz(z),L=q[2],lean=q[3],p0=[x,y,z],p1=[x+lean*.06,y+L*.45,z-.03],p2=[x+lean*.12,y+L*.8,z-.08],p3=[x+lean*.13,y+L,z-.12];
      k.L(bn,'c',hx(K.stalk),p0,p1,.026,.019,5).L(bn,'c',hx(K.stalk),p1,p2,.019,.016,5).L(bn,'c',hx(K.club),p2,p3,.03,.016,6);
      k.p(bn,'oct','c',hx(K.club),p3[0],p3[1],p3[2],.02,.04,.02);k.p(bn,'sph','c',hx(K.stalk),p0[0],p0[1]+.004,p0[2],.034,.014,.034)});
    const BA=[[hx(K.capD),hx(K.ochreD)],[hx(K.ochreD),hx(K.ochre)]];
    [-1,1].forEach(s=>[[.12,.2,.12],[-.04,.1,.14],[-.2,.15,.12],[.04,-.15,.1]].forEach((q,i)=>bracket(s,q[0],q[1],q[2],...BA[i%2],s*.15*(i-1.5))))}}
LPR.Gloomcap={head:['head',0,.33,.33],up:.07,
  back:[['pelvis',0,.42,-.18],['spine',0,.46,0],['chest',0,.44,.14]],
  geo(C,c){return fc186Geo(C,c)},kit(k,c,C,red){return fc186Kit(k,c,C,red)}};
// evolution: one theme, the growth spreads and starts to glow
EVO100.D.Gloomcap={glow:0xb8ff6a,build(E,L,P0,c){const dim=h=>new THREE.Color(h).lerp(new THREE.Color(0x2a3018),.35).getHex(),P=Object.assign({},P0,{glow:dim(P0.glow),glowD:dim(P0.glowD),glow2:dim(P0.glow2)});const bz=z=>({bn:z>.26?'head':z>.08?'chest':z>-.12?'spine':'pelvis'}),sp=RV137.cur.Gloomcap=='Sporelord'?'Sporelord':'Gloomcap',spore=sp=='Sporelord',K=FC186.cols(P.C,sp);
  // L1: glowing gills along each flank (small lit slits in the gill line)
  [-1,1].forEach(s=>[.12,0,-.12,-.22].slice(0,L>=2?4:3).forEach(z=>{const h=E.on([s*.6,.24,z],[-s,0,0]);if(h)E.pd('box','g',P.glowD,E.add(h.p,h.n,-.002),h.n,[.004,.03,.012],[0,0,1])}));
  if(L>=2){// more growth: a cluster of small caps with lit gills on the rear of the back
    [[-.06,-.18],[.03,-.24],[.1,-.2]].forEach((q,i)=>{const t=E.top(q[0],q[1]);if(!t)return;const r=.035-i*.004,cp=E.add(t.p,t.n,.02);
      const o=bz(q[1]);E.L(E.add(t.p,t.n,-.01),cp,r*.3,r*.25,'c',K.stalk.getHex(),5,o);E.pd('cyl','g',P.glowD,E.add(cp,t.n,-.004),t.n,[r*.9,.004,r*.9],null,o);E.pd('hem','c',K.cap.getHex(),E.add(cp,t.n,-.003),t.n,[r,r*.5,r],null,o)})}
  if(L>=3){// mycelium threads hanging from the body's lower edge, the brim's gills lit
    [-1,1].forEach(s=>[.1,-.05,-.2].forEach(z=>{const h=E.on([s*.6,.19,z],[-s,.2,0]);if(h)E.L(E.add(h.p,h.n,-.004),E.add(h.p,[s*.01,-.07,-.01]),.005,.002,'c',K.fleshD.getHex(),3,{vs:1})}));
    E.pd('cyl','g',P.glowD,[0,.293,.336],[0,1,-.12],[.12,.004,.095],null,{bn:'head'})}
  if(L>=4){if(!spore){// a crown of luminous caps round the great cap
      for(let i=0;i<5;i++){const a=i/5*6.283+.3,x=.05+Math.cos(a)*.16,z=-.04+Math.sin(a)*.12,t=E.top(x,z);if(!t)continue;const cp=E.add(t.p,t.n,.03);
        const o=bz(z);E.pd('hem','g',P.glow,E.add(t.p,t.n,-.006),t.n,[.026,.018,.026],null,o)}}
    else{// the cordyceps clubs glow; two more stalks
      const T=FC186.B.Sporelord,top=(x,z)=>{let i=0;while(i<T.length-2&&z>T[i+1][0])i++;const A=T[i],Bq=T[i+1],t=Math.max(0,Math.min(1,(z-A[0])/(Bq[0]-A[0]))),y=A[1]+(Bq[1]-A[1])*t,w=A[2]+(Bq[2]-A[2])*t,h=A[3]+(Bq[3]-A[3])*t;
        return y+h*Math.sqrt(Math.max(0,1-(x/w)**2))},bnz=z=>z>.26?'head':z>.08?'chest':z>-.12?'spine':'pelvis';
      FC186.ST.forEach((q,i)=>{const p=FC186.club(q,top);E.pd('oct','g',i%2?P.glow:P.glowD,p,[0,1,0],[.024,.046,.024],null,{bn:bnz(q[1])})})}}
  if(L>=5){// lit spore pores across the back
    for(let i=0;i<8;i++){const x=(i%4-1.5)*.08,z=-.2+Math.floor(i/4)*.2+((i%2)*.05),t=E.top(x,z);if(t)E.pd('sph','g',P.glow2,E.add(t.p,t.n,-.002),t.n,[.01,.004,.01])}}}};
// the Sporelord's look is its own: stalk clubs keep the species colour (the cordyceps), glow from its spell colour
