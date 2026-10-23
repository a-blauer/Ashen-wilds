// ================= v137: enemies get their own bodies (3) — Rimeshell Crawler, Storm Harpy, Dust Wyrm, Wailing Banshee =================
// ===================================================================== Rimeshell Crawler (Cryptspider skeleton) =====================================================================
// An ice crab-spider: a broad, flat armoured carapace (no round spider abdomen) crusted with ice crystals, a small segmented
// tail tucked under, two big pincers in front (the moving fingers ride the jaw, so a bite snaps them shut), a cluster of
// glowing eyes and thick crystal-jointed legs.
(function(){const n='Rimecrawler';if(!LPR[n])return;
  const K={shell:0x8ab8d8,shell2:0x4a6e94,dark:0x2a3e58,under:0x3a4e68,ice:0xbfeaff,glow:0x5ad8ff,eye:0x9af0ff};
  LPR[n].geo=function(C,c){const sh=new THREE.Color(K.shell),sh2=new THREE.Color(K.shell2),dk=new THREE.Color(K.dark),un=new THREE.Color(K.under),ice=new THREE.Color(K.ice);
    const paint=(o,r,s,cc,i)=>{if(r.jt)return o.copy(ice);if(r.k=='leg')return o.copy(r.p[1]<.12?dk:sh2);if(s<-.3)return o.copy(un);o.copy(sh2);if(s>.5)o.copy(i%2?sh:sh.clone().lerp(ice,.3));else if(Math.abs(cc)>.85)o.copy(dk)};
    const body=e137Rows([[-.5,.4,.04,.03,.03,['tail2','tail2',0]],[-.45,.41,.1,.06,.05,['tail1','tail2',.4]],[-.38,.42,.16,.08,.07,['tail0','tail1',.5]],[-.29,.44,.25,.11,.09,['pelvis','tail0',.3]],
      [-.17,.45,.34,.14,.1,['pelvis','spine',.4]],[-.03,.455,.38,.155,.1,['spine','spine',0]],[.11,.455,.37,.145,.1,['spine','chest',.5]],[.23,.45,.32,.12,.09,['chest','chest',0]],
      [.32,.44,.23,.09,.08,['chest','head',.5]],[.39,.43,.13,.06,.06,['head','head',0]],[.43,.425,.05,.03,.03,['head','head',0]]]);
    const L=[{rings:body,seg:14,capA:1,capB:1,paint}];
    [-1,1].forEach(s=>[0,1,2,3].forEach(i=>{const G=spidLeg(s,i),k=G.k,rs=1.15-i*.05,R=(p,r,b,jt)=>({p,rx:r*rs,ryT:r*rs,ryB:r*rs,b,jt,k:'leg'});
      L.push({rings:[R(spidLerp(G.p0,G.p1,-.1),.06,[k+'0',k+'0',0]),R(spidLerp(G.p0,G.p1,.5),.055,[k+'0',k+'0',0]),R(spidLerp(G.p0,G.p1,.9),.045,[k+'0',k+'1',.5]),R(G.p1,.055,[k+'1',k+'1',0],1),
        R(spidLerp(G.p1,G.p2,.2),.045,[k+'1',k+'1',0]),R(spidLerp(G.p1,G.p2,.6),.04,[k+'1',k+'1',0]),R(spidLerp(G.p1,G.p2,.92),.032,[k+'1',k+'2',.5]),R(G.p2,.04,[k+'2',k+'2',0],1),
        R(spidLerp(G.p2,G.p3,.4),.026,[k+'2',k+'2',0]),R(spidLerp(G.p2,G.p3,.85),.016,[k+'2',k+'2',0]),R(G.p3,.005,[k+'2',k+'2',0])],seg:6,ref:[0,0,1],capA:1,capB:1,paint})}));
    return lpGeo('E137|'+n,n,L,91)};
  LPR[n].kit=function(k,c,C,red){
    // ice crystals on the carapace
    for(let i=0;i<14;i++){const z=-.25+n3Nz(i,1,3)*.45,x=(n3Nz(i,5,7)-.5)*.5,y=.45+.15*Math.sqrt(Math.max(0,1-(x/.38)**2))-.01,h=.06+n3Nz(i,2,9)*.08;
      k.p(z>.15?'chest':z>-.1?'spine':'pelvis',i%3?'oct':'cone4',i%4?'c':'g',i%4?K.ice:K.glow,x,y+h*.4,z,.025,h,.025,(n3Nz(i,3,3)-.5)*.6,0,-x*1.2)}
    // rim of the carapace: jagged frost spines
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2,z=.03+Math.cos(a)*.3,x=Math.sin(a)*.37;if(Math.cos(a)>.85)continue;k.p(z>.15?'chest':z>-.1?'spine':'pelvis','cone4','c',K.ice,x,.45,z,.02,.06,.018,Math.cos(a)*1.4,0,-Math.sin(a)*1.4)}
    // eyes
    [[-.04,.47,.42],[.04,.47,.42],[-.08,.46,.4],[.08,.46,.4],[-.02,.49,.39],[.02,.49,.39]].forEach((p,i)=>k.p('head','sph','g',red?0xff2a2a:K.eye,p[0],p[1],p[2],i<2?.018:.011));
    // pincers: arm on the head, fixed finger on the head, moving finger on the jaw
    [-1,1].forEach(s=>{k.L('head','c',K.shell2,[s*.12,.42,.38],[s*.24,.44,.48],.05,.04,6).L('head','c',K.shell,[s*.24,.44,.48],[s*.26,.43,.6],.07,.06,6);
      k.p('head','cone4','c',K.shell,s*.25,.44,.7,.035,.16,.03,Math.PI/2+.1,0,0);k.p('jaw','cone4','c',K.ice,s*.22,.39,.67,.025,.13,.022,Math.PI/2-.25,0,-s*.2);
      for(let i=0;i<3;i++)k.p('head','cone4','c',K.ice,s*(.25-.012),.42,.64+i*.03,.006,.02,.006,Math.PI)});
    // frost mandibles
    [-1,1].forEach(s=>k.L('jaw','c',K.ice,[s*.03,.39,.42],[s*.015,.35,.47],.014,.004,4))};
})();

// ===================================================================== Storm Harpy (Skyhawk skeleton) =====================================================================
// A vulture-hag of the storm: hunched, shaggy dark plumage, a pale ruff round a bare wrinkled neck, a bald blue-grey head
// with a long hooked beak and glowing eyes, feathered thighs over scaly shanks, huge talons, ragged wings and tail with
// lightning-blue streaks.
(function(){const n='GaleHarpy';if(!LPR[n])return;
  const K={f:0x2c323c,f2:0x1c2028,ruff:0xb8b8b0,skin:0x6a7a8a,skin2:0x4a5866,beak:0xc8b070,claw:0x1a1a1e,glow:0x8ad8ff,leg:0x8a8070};
  LPR[n].geo=function(C,c){const f=new THREE.Color(K.f),f2=new THREE.Color(K.f2),ru=new THREE.Color(K.ruff),sk=new THREE.Color(K.skin),sk2=new THREE.Color(K.skin2),lg=new THREE.Color(K.leg);
    const paint=(o,r,s,cc,i)=>{if(r.k=='hd')return o.copy(i%2?sk:sk2);if(r.k=='ruff')return o.copy(ru).multiplyScalar(i%2?1:.85);if(r.k=='leg'||r.k=='paw'||r.k=='ank')return o.copy(lg);
      if(r.k=='thigh')return o.copy(i%2?f:f2);o.copy(f);if((i+Math.round(cc*3))%3==0)o.copy(f2);if(s<-.4)o.lerp(ru,.25)};
    const body=e137Rows([[-.5,.5,.03,.02,.02,['tail1','tail1',0]],[-.42,.52,.07,.05,.05,['tail0','tail1',.4]],[-.3,.54,.1,.09,.08,['pelvis','tail0',.4]],[-.18,.56,.13,.12,.12,['pelvis','pelvis',0]],
      [-.04,.6,.15,.14,.15,['pelvis','spine',.6]],[.08,.64,.16,.15,.16,['spine','chest',.4]],[.18,.69,.15,.14,.15,['chest','chest',0]],[.25,.74,.15,.12,.12,['chest','neck',.3],'ruff',.25],
      [.29,.78,.12,.08,.08,['neck','neck',0],'ruff',.25],[.31,.81,.045,.04,.04,['neck','neck',0],'hd'],[.34,.85,.045,.045,.04,['neck','head',.6],'hd']]);
    const head=e137Rows([[.35,.86,.05,.05,.045,['head','head',0],'hd'],[.39,.875,.065,.06,.05,['head','head',0],'hd'],[.44,.875,.06,.055,.045,['head','head',0],'hd'],[.48,.865,.042,.04,.03,['head','head',0],'hd'],[.5,.86,.02,.02,.02,['head','head',0],'hd']]);
    const L=[{rings:body,seg:11,capA:1,capB:1,paint},{rings:head,seg:8,capA:1,capB:1,paint}];
    [-1,1].forEach(s=>{const h=s<0?'hl':'hr',a=e137B(n,h+'0'),b=e137B(n,h+'1'),d=e137B(n,h+'2');
      L.push(e137Limb([[[a[0]*1.2,a[1]+.05,a[2]],.085,['pelvis',h+'0',.6],'thigh'],[e137L(a,b,.45),.08,[h+'0',h+'0',0],'thigh'],[[b[0],b[1]+.03,b[2]],.055,[h+'0',h+'1',.4],'thigh'],[e137L(b,d,.4),.025,[h+'1',h+'1',0]],
        [d,.02,[h+'1',h+'2',.5],'ank'],[[d[0],.03,d[2]+.02],.022,[h+'2',h+'2',0],'paw']],paint,7))});
    return lpGeo('E137|'+n,n,L,93)};
  LPR[n].kit=function(k,c,C,red){
    // hooked beak, eyes, wrinkles on the bald head and neck
    k.L('head','c',K.beak,[0,.87,.48],[0,.865,.56],.03,.022,5).L('head','c',K.beak,[0,.865,.56],[0,.83,.6],.022,.004,4);k.L('jaw','c',dkShade(K.beak,.8),[0,.84,.47],[0,.84,.54],.02,.006,4);
    [-1,1].forEach(s=>{k.p('head','sph','c',0x0a0a0c,s*.045,.89,.44,.02,.016,.016);k.p('head','sph','g',red?0xff2a2a:K.glow,s*.05,.892,.448,.012,.01,.008);k.p('head','box','c',K.skin2,s*.042,.912,.44,.03,.01,.03,0,s*.3,s*.35);
      for(let i=0;i<3;i++)k.L('neck','c',K.skin2,[s*.04,.82+i*.02,.31],[s*.045,.82+i*.02,.34],.006,.006,3)});
    k.p('head','sph','c',dkShade(K.beak,.7),0,.88,.5,.02,.012,.016);
    // shaggy ruff feathers round the neck, ragged back plumage with lightning streaks
    for(let i=0;i<14;i++){const a=(i/14)*Math.PI*2;k.L('chest','c',i%2?K.ruff:dkShade(K.ruff,.8),[Math.sin(a)*.12,.76,.27+Math.cos(a)*.1],[Math.sin(a)*.17,.7,.25+Math.cos(a)*.13],.035,.004,3)}
    for(let i=0;i<10;i++){const z=.12-i*.07,bn=z>.1?'chest':z>-.05?'spine':'pelvis',y=.79-i*.025;[-1,1].forEach(s=>k.L(bn,'c',i%3?K.f2:K.f,[s*.08,y,z],[s*.12,y-.08,z-.1],.03,.003,3))}
    for(let i=0;i<4;i++)k.L(i<2?'spine':'pelvis','g',K.glow,[(i%2-.5)*.1,.76-i*.04,.0-i*.07],[(i%2-.5)*.14,.7-i*.04,-.06-i*.07],.006,.002,3);
    // ragged tail feathers
    for(let i=0;i<7;i++){const a=(i-3)*.22;k.L('tail1','c',i%2?K.f:K.f2,[Math.sin(a)*.03,.5,-.48],[Math.sin(a)*.18,.44-Math.abs(i-3)*.01,-.72-(i%2)*.06],.035,.004,3)}
    k.L('tail1','g',K.glow,[0,.505,-.5],[0,.46,-.74],.006,.002,3);
    // huge talons
    [['hl2',-1],['hr2',1]].forEach(([b,s])=>{const d=e137B(n,b);[[0,1],[-.6,.85],[.6,.85],[Math.PI,.7]].forEach(([a,l])=>{const tx=d[0]+Math.sin(a)*.07*l,tz=d[2]+.02+Math.cos(a)*.07*l;
      k.L(b,'c',K.leg,[d[0],.03,d[2]+.02],[tx,.015,tz],.014,.01,4);k.L(b,'c',K.claw,[tx,.015,tz],[tx+Math.sin(a)*.03,0.002,tz+Math.cos(a)*.03],.01,.002,4)})})};
  LPR[n].post=function(x,c,C,mat){
    const W=lpwWing('harpy137',
      [[0,0,.07],[.22,.06,.1],[.44,.07,.06],[.62,.05,-.02],[.8,.01,-.14],[.7,-.02,-.2],[.8,0,-.3],[.64,-.02,-.3],[.7,0,-.42],[.55,-.02,-.38],[.56,0,-.52],[.43,-.02,-.44],[.38,0,-.56],[.28,-.02,-.45],[.2,0,-.55],[.12,-.02,-.42],[0,0,-.3]],
      [.34,.04,-.18],[[[0,.01,.07],[.44,.08,.06],.026],[[.44,.08,.06],[.8,.02,-.14],.014],[[.3,.05,-.05],[.56,0,-.5],.004]],K.f,0x14161c,K.f2,5);
    lpwPair(x,'chest',W,mat,.12,.72,.14,.4,.3)};
})();

// ===================================================================== Dust Wyrm (Gravewyrm skeleton) =====================================================================
// A sand worm: a thick, ringed body with armoured sand-plates along the back, no eyes, and a round lamprey maw at the front:
// three great petal jaws (the lower two ride the jaw bone, so they spread when it bites) round rings of hooked teeth and a
// glowing throat (its glass breath).
(function(){const n='DustWyrm';if(!LPR[n])return;
  const K={sand:0xb89a62,sand2:0x8a6a3a,belly:0xd8c8a0,plate:0x9a7a48,glass:0xff9a3a,tooth:0xf0e8d0,throat:0x4a1a0a};
  const RAD=z=>z<-1.5?.03+(z+1.65)*.8:z<-.9?.15+(z+1.5)*.18:z<.2?.26:.26-(z-.2)*.15;
  const LIFT=z=>z<=0?0:.12*Math.min(1,z/.35);
  LPR[n].geo=function(C,c){const sa=new THREE.Color(K.sand),sa2=new THREE.Color(K.sand2),be=new THREE.Color(K.belly),th=new THREE.Color(K.throat),gl=new THREE.Color(K.glass);
    const rings=[];for(let z=-1.65,i=0;z<=.5;z+=.055,i++){const r=Math.max(.012,RAD(z))*(i%2?1.06:.97);rings.push({p:[wyrmCurve(z)*.6,r*.78+.004+LIFT(z),z],rx:r,ryT:r*.9,ryB:r*.78,b:wyrmBones(z),i,z})}
    const r0=RAD(.5);rings.push({p:[0,r0*.78+.004+LIFT(.5),.53],rx:r0*.8,ryT:r0*.72,ryB:r0*.62,b:['head','head',0],k:'maw'});rings.push({p:[0,r0*.78+.004+LIFT(.5),.5],rx:r0*.5,ryT:r0*.45,ryB:r0*.4,b:['head','head',0],k:'maw'});
    return lpGeo('E137|'+n,n,[{rings,seg:12,capA:1,capB:1,paint:(o,r,s,cc,i)=>{if(r.k=='maw')return o.copy(th).lerp(gl,.25);
      if(s<-.45){o.copy(be);if(r.i%2)o.multiplyScalar(.82);return}o.copy(r.i%2?sa:sa2);if(s>.7)o.lerp(sa2,.4)}}],95)};
  LPR[n].kit=function(k,c,C,red){const r0=RAD(.5),cy=r0*.78+.004+LIFT(.5);
    // armoured plates down the back
    for(let z=.35,i=0;z>-1.45;z-=.11,i++){const r=RAD(z),y=r*.78+.004+LIFT(z)+r*.9,bn=wyrmBones(z)[0],x=wyrmCurve(z)*.6;k.p(bn,'hem','c',i%2?K.plate:dkShade(K.plate,.85),x,y-.04,z,r*.75,.05,.07,-.2)}
    // the three petal jaws round the maw and the teeth
    [[0,'head'],[2.094,'jaw'],[-2.094,'jaw']].forEach(([a,bn])=>{const x=Math.sin(a)*r0*.7,y=cy+Math.cos(a)*r0*.65;
      k.p(bn,'cone4','c',K.sand2,x,y,.62,.13,.24,.03,Math.PI/2,0,-a);k.p(bn,'cone4','c',K.plate,x*1.05,y+Math.cos(a)*.01,.6,.1,.18,.035,Math.PI/2,0,-a);
      for(let i=0;i<4;i++){const b=a+(i-1.5)*.35;k.p(bn,'cone4','c',K.tooth,Math.sin(b)*r0*.62,cy+Math.cos(b)*r0*.56,.6,.012,.06,.012,Math.PI/2+.5*Math.cos(b),0,-b+Math.PI)}});
    for(let i=0;i<10;i++){const b=i/10*Math.PI*2;k.p('head','cone4','c',K.tooth,Math.sin(b)*r0*.38,cy+Math.cos(b)*r0*.34,.5,.01,.05,.01,Math.PI/2+.6*Math.cos(b),0,-b+Math.PI)}
    k.p('head','sph','g',K.glass,0,cy,.47,r0*.3,r0*.28,.03);
    // sensory pits instead of eyes, sand dribbling from the plates' edges
    [-1,1].forEach(s=>{for(let i=0;i<3;i++)k.p('head','sph','c',0x3a2a14,s*r0*.75,cy+.05-i*.04,.42,.012,.012,.01)})};
  LPR[n].post=null;
})();

// ===================================================================== Wailing Banshee (Wispling skeleton) =====================================================================
// A drowned woman's ghost: no hood — a gaunt skull-like face with hollow glowing eyes and a long gaping mouth (the jaw drops
// when she wails), a mane of pale hair streaming down her back, bony shoulders and long skeletal arms with claw fingers,
// a torn gown that thins into a ragged spirit tail, and chains of a grave gem at her throat.
(function(){const n='Banshee';if(!LPR[n])return;
  const K={gown:0x7aa8c0,gown2:0x4a6e84,pale:0xd8f0f8,skin:0xb8c8d0,hair:0xc8d8e0,hair2:0x98aab4,dark:0x0a1418,glow:0xa8e8ff,eye:0xe8ffff};
  LPR[n].geo=function(C,c){const g=new THREE.Color(K.gown),g2=new THREE.Color(K.gown2),pa=new THREE.Color(K.pale),sk=new THREE.Color(K.skin),h=new THREE.Color(K.hair),h2=new THREE.Color(K.hair2);
    const paint=(o,r,s,cc,i)=>{if(r.k=='hd'||r.k=='arm')return o.copy(sk).multiplyScalar(i%2?1:.9);if(r.k=='hair')return o.copy(i%2?h:h2);o.copy(g).lerp(g2,Math.min(1,Math.max(0,(.6-r.p[1])*1.5)));if(r.p[1]>.7&&s>.3)o.lerp(pa,.25)};
    const R=(x,y,z,rx,f,b,bn,k,j)=>({p:[x,y,z],rx,ryT:f,ryB:b,b:bn,k,j});
    const body={rings:[R(0,.9,0,.045,.045,.045,['neck','neck',0],'hd'),R(0,.85,0,.15,.07,.08,['chest','neck',.3]),R(0,.78,0,.13,.08,.08,['chest','chest',0]),R(0,.7,0,.1,.07,.07,['chest','spine',.5]),
      R(0,.62,-.005,.095,.07,.07,['spine','spine',0]),R(0,.53,-.015,.14,.1,.1,['pelvis','pelvis',0],0,.08),R(0,.42,-.04,.18,.13,.14,['pelvis','tail0',.5],0,.16),R(0,.32,-.08,.19,.14,.15,['tail0','tail1',.3],0,.24),
      R(0,.22,-.13,.15,.11,.12,['tail1','tail1',0],0,.3),R(0,.13,-.19,.1,.07,.08,['tail2','tail2',0],0,.3),R(0,.06,-.26,.05,.04,.04,['tail3','tail3',0],0,.25),R(0,.02,-.31,.008,.008,.008,['tail3','tail3',0])],seg:14,ref:[0,0,1],capB:1,paint};
    const head={rings:[R(0,.92,.02,.05,.05,.05,['head','head',0],'hd'),R(0,.96,.02,.07,.075,.07,['head','head',0],'hd'),R(0,1.0,.015,.08,.085,.08,['head','head',0],'hd'),R(0,1.04,.01,.078,.08,.08,['head','head',0],'hd'),
      R(0,1.08,0,.06,.06,.065,['head','head',0],'hd'),R(0,1.105,-.005,.025,.025,.028,['head','head',0],'hd')],seg:10,ref:[0,0,1],capA:1,capB:1,paint};
    const hair={rings:[R(0,1.1,-.02,.07,.03,.03,['head','head',0],'hair'),R(0,1.04,-.08,.11,.035,.035,['head','head',0],'hair'),R(0,.94,-.11,.13,.04,.04,['neck','head',.4],'hair',.1),R(0,.8,-.13,.15,.04,.04,['chest','chest',0],'hair',.2),
      R(0,.66,-.15,.14,.04,.04,['spine','spine',0],'hair',.3),R(0,.52,-.18,.12,.035,.035,['pelvis','pelvis',0],'hair',.35),R(0,.4,-.22,.08,.03,.03,['tail0','tail0',0],'hair',.4),R(0,.3,-.26,.02,.01,.01,['tail1','tail1',0],'hair')],seg:8,ref:[0,0,1],capB:1,paint};
    const arms=[-1,1].map(s=>{const p=s<0?'fl':'fr';return e137Limb([[[s*.12,.83,0],.04,['chest',p+'0',.5],'arm'],[[s*.17,.76,.02],.028,[p+'0',p+'0',0],'arm'],[e137B(n,p+'1').map((v,i)=>i?v:v),.024,[p+'0',p+'1',.5],'arm'],
      [[s*.21,.65,.06],.018,[p+'1',p+'1',0],'arm'],[e137B(n,p+'2'),.017,[p+'1',p+'2',.5],'arm'],[[s*.225,.56,.1],.026,[p+'2',p+'2',0],'arm'],[[s*.23,.53,.11],.012,[p+'2',p+'2',0],'arm']],paint,6)});
    return lpGeo('E137|'+n,n,[body,head,hair].concat(arms),97)};
  LPR[n].kit=function(k,c,C,red){
    // the face: hollow eyes, cheekbones, a long gaping mouth on the jaw bone, a few teeth
    [-1,1].forEach(s=>{k.p('head','box','c',K.dark,s*.032,1.018,.072,.034,.02,.02,0,s*.25,-s*.35);k.p('head','box','g',red?0xff2a2a:K.eye,s*.032,1.018,.083,.016,.006,.006,0,s*.25,-s*.35);
      k.p('head','box','c',K.hair2,s*.05,.995,.07,.02,.01,.02,0,0,s*.3);
      // strands of hair over the shoulders in front
      k.L('head','c',K.hair,[s*.07,1.04,.0],[s*.1,.9,.03],.02,.012,3).L('chest','c',K.hair2,[s*.1,.9,.03],[s*.12,.74,.07],.012,.004,3);
      // long claw fingers and tatters hanging from the forearms
      const f=e137B(n,(s<0?'fl':'fr')+'2');for(let i=-1;i<=1;i++)k.L((s<0?'fl':'fr')+'2','c',K.skin,[f[0]+s*.005,.535,.11],[f[0]+s*.01+i*.02,.46,.14],.007,.002,3);
      for(let i=0;i<2;i++)k.L((s<0?'fl':'fr')+'1','c',K.gown2,[s*(.19+i*.01),.7-i*.04,.04],[s*(.2+i*.01),.6-i*.05,.02],.025,.004,3)});
    k.p('head','sph','c',K.dark,0,.955,.075,.028,.012,.012);k.p('jaw','sph','c',K.dark,0,.93,.072,.03,.04,.014);
    k.p('jaw','box','c',K.skin,0,.895,.07,.04,.012,.025);for(let i=-1;i<=1;i++)k.p('head','cone4','c',0xe8e4d8,i*.012,.945,.08,.004,.012,.004,Math.PI);
    // a grave-gem on a chain at her throat; wisps trailing from the hem
    for(let i=0;i<10;i++){const a=(i/9-.5)*2.4;k.p('neck','ring','m',0x8a9aa8,Math.sin(a)*.07,.86-Math.cos(a)*.03+.03,.05+Math.cos(a)*.02,.008,.012,.008,i%2?Math.PI/2:0,a,0)}
    k.p('chest','oct','g',K.glow,0,.82,.1,.018,.026,.012);
    for(let i=0;i<5;i++){const a=(i/4-.5)*2.6;k.L('tail1','g',K.glow,[Math.sin(a)*.14,.24,-.13+Math.cos(a)*.08],[Math.sin(a)*.16,.12,-.16+Math.cos(a)*.06],.008,.001,3)}};
  LPR[n].post=null;
})();

// the old v2 wild monsters (only listed in the bestiary now) stop borrowing companion bodies too
(function(){const M={lurker:'Croaker',boghorror:'Croaker',snowwolf:'BloodHound',tortoise:'Snapper',cavebat:'BloodBat',magmadrake:'Basilisk',stalker:'Rimecrawler',wraith:'Banshee',harpy:'GaleHarpy',sandwyrm:'DustWyrm'};
  Object.keys(M).forEach(k=>{if(EN[k]&&LPR[M[k]])EN[k].rig=M[k]})})();
