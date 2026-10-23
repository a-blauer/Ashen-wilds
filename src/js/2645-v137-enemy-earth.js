// ================= v137: enemies get their own bodies (2) — Mire Croaker, Galecliff Basilisk, Shellback Snapper, Sun Scarab =================
// ===================================================================== Mire Croaker (Mossfrog skeleton) =====================================================================
// A horned bog toad: a round squat body, a head as wide as the body with an enormous mouth, pointed horn-like eyelids over
// gold eyes, swollen poison glands behind them, warty mottled skin, fat folded hind legs and a pale throat.
(function(){const n='Croaker';if(!LPR[n])return;
  const K={skin:0x55663a,skin2:0x3a4826,blot:0x2a3418,belly:0xc8c094,horn:0xc8803a,gland:0x8a8a4a,eye:0xe8b830,lip:0x6a2a2a,dark:0x080806};
  LPR[n].geo=function(C,c){const sk=new THREE.Color(K.skin),sk2=new THREE.Color(K.skin2),bl=new THREE.Color(K.blot),be=new THREE.Color(K.belly);
    const paint=(o,r,s,cc,i)=>{if(s<-.35&&r.k!='leg'){o.copy(be);if(i%2)o.multiplyScalar(.9);return}o.copy(sk);if((i*3+Math.round(cc*4))%5==0)o.copy(bl);else if(s>.6)o.lerp(sk2,.5);if(r.k=='leg'&&s<0)o.lerp(be,.25)};
    const body=e137Rows([[-.31,.22,.05,.04,.04,['pelvis','pelvis',0]],[-.26,.23,.17,.11,.13,['pelvis','pelvis',0]],[-.16,.25,.24,.16,.19,['pelvis','spine',.5]],[-.03,.265,.265,.18,.2,['spine','spine',0]],
      [.08,.275,.265,.17,.19,['spine','chest',.5]],[.18,.285,.255,.15,.17,['chest','chest',0]],[.26,.3,.25,.13,.13,['chest','head',.5]],[.33,.315,.24,.11,.07,['head','head',0]],
      [.41,.315,.21,.09,.05,['head','head',0]],[.47,.31,.15,.065,.04,['head','head',0]],[.5,.305,.08,.035,.025,['head','head',0]]]);
    const jaw=e137Rows([[.28,.27,.22,.03,.09,['head','jaw',.6]],[.38,.275,.2,.025,.07,['jaw','jaw',0]],[.46,.28,.14,.02,.045,['jaw','jaw',0]],[.5,.285,.06,.012,.02,['jaw','jaw',0]]]);
    const L=[];[-1,1].forEach(s=>{const f=s<0?'fl':'fr',h=s<0?'hl':'hr';
      L.push(e137Limb([[[s*.17,.2,.15],.055,['chest',f+'0',.6]],[[s*.2,.13,.17],.042,[f+'0',f+'1',.5]],[[s*.21,.06,.17],.032,[f+'1',f+'2',.5]],[[s*.22,.024,.2],.03,[f+'2',f+'2',0]],[[s*.23,.014,.25],.018,[f+'2',f+'2',0]]],paint,6));
      L.push(e137Limb([[[s*.19,.24,-.13],.1,['pelvis',h+'0',.6]],[[s*.25,.17,-.1],.085,[h+'0',h+'0',0]],[[s*.27,.11,-.04],.065,[h+'0',h+'1',.5]],[[s*.26,.06,-.14],.048,[h+'1',h+'1',0]],
        [[s*.24,.035,-.22],.036,[h+'1',h+'2',.5]],[[s*.23,.02,-.15],.034,[h+'2',h+'2',0]],[[s*.24,.012,-.06],.02,[h+'2',h+'2',0]]],paint,6))});
    return lpGeo('E137|'+n,n,[{rings:body,seg:12,capA:1,capB:1,paint},{rings:jaw,seg:9,capB:1,paint}].concat(L),81)};
  LPR[n].kit=function(k,c,C,red){
    // mouth line, tongue, small fangs; eyes on top with horn eyelids; poison glands; warts
    k.L('head','c',K.lip,[-.2,.29,.33],[0,.292,.5],.012,.012,3);k.L('head','c',K.lip,[.2,.29,.33],[0,.292,.5],.012,.012,3);
    k.p('jaw','sph','c',0xc85a6a,0,.29,.42,.06,.015,.05);
    [-1,1].forEach(s=>{k.p('head','sph','c',K.skin2,s*.13,.4,.37,.07,.06,.07);k.p('head','sph','g',red?0xff2a2a:K.eye,s*.15,.42,.4,.045,.045,.045);k.p('head','box','c',K.dark,s*.162,.425,.432,.008,.03,.008,0,s*.4,0);
      k.L('head','c',K.horn,[s*.12,.45,.37],[s*.17,.55,.31],.035,.003,5);k.L('head','c',K.horn,[s*.16,.43,.34],[s*.22,.49,.3],.02,.002,4);
      k.p('chest','sph','c',K.gland,s*.17,.4,.22,.06,.04,.1,0,s*.2,0);for(let i=0;i<4;i++)k.p('chest','sph','c',K.dark,s*(.15+i%2*.04),.43,.17+i*.03,.008,.006,.008);
      k.p('jaw','cone4','c',0xece4d0,s*.07,.285,.45,.01,.025,.01)});
    for(let i=0;i<30;i++){const z=-.24+n3Nz(i,1,7)*.58,a=(n3Nz(i,3,9)-.5)*2.8,y=.27+Math.cos(a)*.17,x=Math.sin(a)*.24;k.p(z>.2?'chest':z>-.08?'spine':'pelvis','sph','c',i%3?K.skin2:K.blot,x,y,z,.015+n3Nz(i,5,6)*.02,.012,.015+n3Nz(i,2,6)*.02)}
    // webbed toes
    [['fl2',-.23,.25],['fr2',.23,.25],['hl2',-.24,-.06],['hr2',.24,-.06]].forEach(f=>[-1,0,1].forEach(i=>k.L(f[0],'c',K.skin2,[f[1],.015,f[2]-.03],[f[1]+i*.035,.008,f[2]+.03],.012,.006,3)))};
  LPR[n].post=null;
})();

// ===================================================================== Galecliff Basilisk (Drakelet skeleton) =====================================================================
// The king of serpents as a heavy armoured lizard: low sprawling stance, a thick tail, rows of stone osteoderms down the
// back, an orange throat dewlap, a crown of bone horns with a frill membrane between them, and blazing petrifying eyes.
(function(){const n='Basilisk';if(!LPR[n])return;
  const K={skin:0x4a5438,skin2:0x2e3622,belly:0xa89a70,stone:0x7a7262,dew:0xc85a2a,horn:0xd8ccb0,frill:0x7a2e22,frill2:0xa8542a,eye:0xffe060,dark:0x080806};
  LPR[n].geo=function(C,c){const sk=new THREE.Color(K.skin),sk2=new THREE.Color(K.skin2),be=new THREE.Color(K.belly),st=new THREE.Color(K.stone);
    const paint=(o,r,s,cc,i)=>{if(r.k=='paw')return o.copy(sk2);if(s<-.45){o.copy(be);if(i%2)o.multiplyScalar(.85);return}o.copy(sk);if(s>.55)o.copy(i%2?sk2:sk.clone().lerp(st,.25));else if((i+Math.round(cc*3))%3==0)o.lerp(sk2,.6)};
    const body=e137Rows([[-0.45,0.43,0.096,0.073,0.072,['pelvis','tail0',.6]],[-0.36,0.42,0.147,0.101,0.096,['pelvis','pelvis',0]],[-0.26,0.41,0.186,0.112,0.12,['pelvis','pelvis',0]],[-0.12,0.415,0.198,0.112,0.132,['pelvis','spine',.5]],
      [0,0.42,0.205,0.112,0.138,['spine','spine',0]],[0.12,0.425,0.198,0.112,0.132,['spine','chest',.5]],[0.24,0.44,0.179,0.112,0.126,['chest','chest',0]],[0.33,0.5,0.1,0.08,0.11,['chest','neck',.5]],
      [0.4,0.58,0.085,0.075,0.085,['neck','neck',0]],[0.47,0.645,0.085,0.075,0.07,['neck','head',.5]],
      [0.52,0.69,0.095,0.075,0.06,['head','head',0]],[0.6,0.695,0.09,0.065,0.045,['head','head',0]],[0.68,0.685,0.068,0.048,0.035,['head','head',0]],[0.74,0.675,0.046,0.032,0.025,['head','head',0]],[0.775,0.67,0.02,0.015,0.012,['head','head',0]]]);
    const jaw=e137Rows([[.55,.645,.075,.02,.03,['head','jaw',.7]],[.64,.64,.062,.015,.025,['jaw','jaw',0]],[.72,.645,.042,.012,.018,['jaw','jaw',0]],[.77,.65,.02,.008,.01,['jaw','jaw',0]]]);
    const tb=['tail0','tail1','tail2','tail3'].map(b=>e137B(n,b));
    const tail=e137Limb([[[0,.425,-.46],.07,['tail0','tail0',0]],[e137L(tb[0],tb[1],.5),.058,['tail0','tail1',.5]],[[0,tb[1][1]-.03,tb[1][2]],.046,['tail1','tail1',0]],[e137L(tb[1],tb[2],.5),.036,['tail1','tail2',.5]],
      [[0,tb[2][1]-.06,tb[2][2]],.026,['tail2','tail2',0]],[[0,tb[3][1]-.1,tb[3][2]],.014,['tail3','tail3',0]],[[0,tb[3][1]-.12,tb[3][2]-.15],.004,['tail3','tail3',0]]],paint,7,{ref:[0,1,0]});
    // sprawling legs: elbows and knees pushed out to the sides
    const legs=e137Quad(n,[.07,.05,.036,.036],[.09,.058,.038,.038],paint,{toe:.08}).map(L=>{const s=Math.sign(L.rings[0].p[0]);L.rings.forEach((r,j)=>{if(j>0)r.p=[r.p[0]+s*(j==2?.09:j==1?.05:j>=3?.06:0),r.p[1],r.p[2]]});return L});
    return lpGeo('E137|'+n,n,[{rings:body,seg:10,capA:1,capB:1,paint},{rings:jaw,seg:7,capB:1,paint},tail].concat(legs),83)};
  LPR[n].kit=function(k,c,C,red){
    // crown of horns with frill membrane between them
    for(let i=0;i<7;i++){const a=-1.1+i*.367,x=Math.sin(a),y=Math.cos(a);k.L('head','c',K.horn,[x*.05,.74+y*.03,.55],[x*.2,.75+y*.2,.47],.016,.003,4);
      if(i<6){const a2=a+.367;k.p('head','cone4','c',i%2?K.frill:K.frill2,(Math.sin(a)+Math.sin(a2))*.07,.74+(Math.cos(a)+Math.cos(a2))*.07,.5,.05,.15,.008,0,0,-(a+.18))}}
    [-1,1].forEach(s=>{k.p('head','sph','c',K.dark,s*.06,.73,.64,.028,.022,.026,0,s*.4,0);k.p('head','sph','g',red?0xff2a2a:K.eye,s*.066,.732,.65,.019,.016,.015);
      k.p('head','box','c',K.skin2,s*.062,.755,.63,.045,.014,.06,0,s*.3,s*.3);
      k.p('head','cone4','c',0xece4d0,s*.04,.655,.74,.008,.025,.008,Math.PI);
      // stone scales on the flanks
      for(let i=0;i<7;i++){const z=.2-i*.085;k.p(z>.1?'chest':z>-.15?'spine':'pelvis','dod','c',i%3?K.stone:dkShade(K.stone,.8),s*.13,.46-Math.abs(z)*.05,z,.032,.02,.034)}});
    k.p('head','sph','c',K.dark,.018,.69,.775,.006,.005,.005);k.p('head','sph','c',K.dark,-.018,.69,.775,.006,.005,.005);
    // dewlap under the throat, forked tongue
    k.p('neck','sph','c',K.dew,0,.5,.4,.02,.09,.07,.4,0,0);k.p('neck','sph','c',dkShade(K.dew,.75),0,.47,.38,.015,.06,.05,.4,0,0);
    k.L('jaw','c',0xb03a4a,[0,.65,.72],[0,.65,.84],.008,.004,3);
    // two rows of osteoderm plates down the back and tail
    for(let i=0;i<16;i++){const z=.36-i*.1,bn=z>.3?'neck':z>.12?'chest':z>-.12?'spine':z>-.36?'pelvis':z>-.62?'tail0':z>-.9?'tail1':'tail2';
      const y=z>.3?.6:z>-.4?.53:.5-(-.4-z)*.08,w=z>-.4?.05:.03;if(z<-1.12)break;[-1,1].forEach(s=>k.p(bn,'dod','c',i%2?K.stone:dkShade(K.stone,.85),s*w,y,z,.03,.025,.035))}
    ['fl2','fr2','hl2','hr2'].forEach(b=>{const q=e137B(n,b),s=Math.sign(q[0]);for(let i=-1;i<=1;i++)k.L(b,'c',0x1a1812,[q[0]+s*.06+i*.02,.025,q[2]+.07],[q[0]+s*.06+i*.028,.008,q[2]+.11],.008,.002,3)})};
})();

// ===================================================================== Shellback Snapper (Stoneshell skeleton) =====================================================================
// An alligator snapping turtle: a flat, ridged shell with three keels of jagged spikes and a serrated rim, a huge triangular
// head with a hooked beak, a thick tubercled neck, elephantine clawed legs and a long saw-crested tail. Moss and weed hang off it.
(function(){const n='Snapper';if(!LPR[n])return;
  const K={shell:0x4e5a3a,shell2:0x353f28,plast:0xb8a878,skin:0x5a5a40,skin2:0x3e3e2a,moss:0x3a4e22,spike:0x2a2a20,beak:0x1a1a14,eye:0xd8a020,dark:0x080806};
  const SHELL=[[-.5,.24,.12,.05,.05],[-.42,.25,.27,.13,.08],[-.3,.26,.35,.2,.09],[-.15,.27,.39,.24,.1],[0,.27,.4,.25,.1],[.14,.27,.38,.24,.1],[.26,.27,.33,.19,.09],[.34,.27,.24,.11,.08],[.38,.27,.12,.05,.05]];
  function shellAt(z){for(let i=0;i<SHELL.length-1;i++)if(z>=SHELL[i][0]&&z<=SHELL[i+1][0]){const a=SHELL[i],b=SHELL[i+1],t=(z-a[0])/(b[0]-a[0]);return a.map((v,j)=>v+(b[j]-v)*t)}return null}
  LPR[n].geo=function(C,c){const sh=new THREE.Color(K.shell),sh2=new THREE.Color(K.shell2),pl=new THREE.Color(K.plast),sk=new THREE.Color(K.skin),sk2=new THREE.Color(K.skin2);
    const shp=(o,r,s,cc,i)=>{if(s<-.2){o.copy(pl);if(i%2)o.multiplyScalar(.88);return}o.copy((i+Math.round((cc+1)*2.5))%2?sh:sh2);if(s<.15)o.multiplyScalar(.8)};
    const skp=(o,r,s,cc,i)=>{o.copy(sk);if(i%2&&Math.abs(cc)>.4)o.copy(sk2);if(s<-.4)o.lerp(pl,.4)};
    const bones=z=>z>.22?['spine','chest',Math.min(1,(z-.22)/.16+.4)]:z<-.25?['spine','pelvis',Math.min(1,(-.25-z)/.25+.3)]:['spine','spine',0];
    const shell=SHELL.map(q=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],b:bones(q[0])}));
    const head=e137Rows([[.3,.25,.1,.09,.09,['chest','neck',.5]],[.38,.27,.105,.09,.09,['neck','neck',0]],[.44,.295,.125,.1,.08,['neck','head',.6]],[.5,.31,.135,.09,.07,['head','head',0]],[.57,.305,.115,.075,.05,['head','head',0]],
      [.63,.295,.08,.05,.035,['head','head',0]],[.67,.28,.035,.03,.03,['head','head',0]]]);
    const jaw=e137Rows([[.47,.25,.11,.02,.04,['head','jaw',.7]],[.56,.245,.09,.015,.03,['jaw','jaw',0]],[.63,.25,.05,.012,.02,['jaw','jaw',0]],[.67,.26,.018,.01,.01,['jaw','jaw',0]]]);
    const tail=e137Limb([[[0,.23,-.46],.075,['pelvis','tail0',.6]],[[0,.22,-.58],.058,['tail0','tail1',.5]],[[0,.19,-.7],.042,['tail1','tail2',.5]],[[0,.15,-.82],.028,['tail2','tail3',.5]],[[0,.1,-.93],.014,['tail3','tail3',0]],[[0,.07,-.99],.004,['tail3','tail3',0]]],skp,6,{ref:[0,1,0]});
    return lpGeo('E137|'+n,n,[{rings:shell,seg:14,capA:1,capB:1,paint:shp},{rings:head,seg:9,capA:1,capB:1,paint:skp},{rings:jaw,seg:7,capB:1,paint:skp},tail].concat(e137Quad(n,[.075,.065,.058,.062],[.08,.068,.06,.064],skp,{toe:.05,seg:7})),85)};
  LPR[n].kit=function(k,c,C,red){
    const bn=z=>z>.22?'chest':z<-.25?'pelvis':'spine';
    // three keels of spikes and a serrated rim
    [0,-.15,.15].forEach((x0,j)=>{for(let i=0;i<7;i++){const z=.28-i*.11,S=shellAt(z);if(!S)continue;const x=x0*(S[2]/.4),y=S[1]+S[3]*Math.sqrt(Math.max(0,1-(x/S[2])**2))-.01;
      k.p(bn(z),'cone4','c',j?dkShade(K.spike,1.2):K.spike,x,y,z,j?.028:.042,j?.08:.13,j?.028:.042,-.3,0,x*1.5)}});
    for(let i=0;i<24;i++){const a=i/24*Math.PI*2,z=-.06+Math.cos(a)*.44,S=shellAt(Math.max(-.49,Math.min(.37,z)));if(!S)continue;const x=Math.sin(a)*S[2]*1.02;
      k.p(bn(z),'cone4','c',i%2?K.shell2:K.spike,x,S[1]-.01,z,.03,.07,.022,Math.cos(a)*1.45,0,-Math.sin(a)*1.45)}
    // moss on the shell, weed strands hanging off the rim
    for(let i=0;i<10;i++){const z=-.35+n3Nz(i,2,3)*.6,S=shellAt(z),x=(n3Nz(i,4,5)-.5)*S[2]*1.2,y=S[1]+S[3]*Math.sqrt(Math.max(0,1-(x/S[2])**2));k.p(bn(z),'dod','c',K.moss,x,y,z,.05,.015,.05)}
    [-1,1].forEach(s=>{for(let i=0;i<3;i++){const z=.15-i*.2,S=shellAt(z);k.L(bn(z),'c',K.moss,[s*S[2],S[1]-.01,z],[s*S[2]*1.03,S[1]-.1-i*.02,z-.02],.012,.004,3)}});
    // the face: sunken glowing eyes, heavy brow, a hooked beak; tubercles on head and neck
    [-1,1].forEach(s=>{k.p('head','sph','c',K.dark,s*.085,.345,.55,.028,.022,.024,0,s*.5,0);k.p('head','sph','g',red?0xff2a2a:K.eye,s*.09,.346,.56,.016,.012,.012);
      k.p('head','box','c',K.skin2,s*.08,.37,.545,.05,.016,.05,0,s*.45,s*.3);
      for(let i=0;i<4;i++)k.p(i<2?'head':'neck','cone4','c',K.skin2,s*(.08+i%2*.03),.35-i*.02,.48-i*.05,.012,.03,.012,0,0,-s*.8)});
    k.p('head','cone4','c',K.beak,0,.27,.685,.03,.06,.025,Math.PI+.4,0,0);k.p('jaw','cone4','c',K.beak,0,.27,.665,.025,.04,.02,-.3,0,0);
    for(let i=0;i<5;i++)k.p('head','sph','c',K.skin2,(i-2)*.03,.39,.5-i%2*.03,.015,.01,.015);
    // saw crest down the tail, big claws
    for(let i=0;i<6;i++){const z=-.5-i*.08,y=.23-i*.025+.06-i*.008;k.p(z>-.55?'tail0':z>-.68?'tail1':z>-.8?'tail2':'tail3','cone4','c',K.spike,0,y,z,.018,.05-i*.005,.025,-.4)}
    ['fl2','fr2','hl2','hr2'].forEach(b=>{const q=e137B(n,b);for(let i=-1;i<=1;i++)k.p(b,'cone4','c',0x1a1812,q[0]+i*.035,.014,q[2]+.08,.013,.05,.013,Math.PI/2)})};
  LPR[n].post=null;
})();

// ===================================================================== Sun Scarab (Stoneshell skeleton) =====================================================================
// A giant dung-scarab: glossy domed wing cases with a seam and sheen, a broad horned shield in front, a shovel head with a
// great curved horn, clubbed antennae, jagged spiny legs (the middle pair swings with the walk) and a glowing sun disc
// rising from its back.
(function(){const n='SunScarab';if(!LPR[n])return;
  const K={sh:0x8a6a2a,sh2:0x5a4218,hi:0xe8c060,leg:0x2a1e10,dark:0x0a0804,sun:0xffc040,eye:0xff8a20};
  LPR[n].geo=function(C,c){const sh=new THREE.Color(K.sh),sh2=new THREE.Color(K.sh2),hi=new THREE.Color(K.hi),lg=new THREE.Color(K.leg);
    const paint=(o,r,s,cc,i)=>{if(r.k=='leg'||r.k=='ank'||r.k=='paw')return o.copy(lg).multiplyScalar(i%2?1:.8);if(s<-.3)return o.copy(sh2).multiplyScalar(.6);
      o.copy(sh);if(s>.75)o.lerp(hi,.55);else if(Math.abs(cc)>.7)o.copy(sh2);if(r.k=='pro'&&s>.4)o.lerp(hi,.25)};
    const bb=z=>z>.15?['chest','chest',0]:z<-.25?['spine','pelvis',Math.min(1,(-.25-z)/.2+.3)]:['spine','spine',0];
    const ely=[[-.47,.3,.08,.05,.05],[-.42,.3,.2,.14,.08],[-.32,.3,.27,.2,.09],[-.18,.3,.3,.23,.1],[-.04,.3,.3,.235,.1],[.08,.3,.28,.21,.1],[.14,.3,.22,.14,.09],[.16,.3,.12,.06,.06]].map(q=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],b:bb(q[0])}));
    const pro=e137Rows([[.16,.3,.15,.08,.07,['chest','chest',0],'pro'],[.2,.305,.23,.13,.09,['chest','chest',0],'pro'],[.28,.31,.25,.14,.09,['chest','chest',0],'pro'],[.35,.305,.21,.11,.08,['chest','neck',.4],'pro'],[.38,.3,.13,.06,.06,['neck','neck',0],'pro']]);
    const head=e137Rows([[.38,.29,.12,.06,.05,['neck','head',.6]],[.43,.29,.15,.06,.045,['head','head',0]],[.49,.285,.17,.04,.035,['head','head',0]],[.53,.28,.16,.022,.022,['head','head',0]],[.55,.278,.1,.01,.01,['head','head',0]]]);
    const legs=e137Quad(n,[.035,.028,.022,.018],[.038,.03,.022,.018],paint,{toe:.07,seg:5,lift:.02}).map(L=>{const s=Math.sign(L.rings[0].p[0]);L.rings.forEach((r,j)=>{if(j>0)r.p=[r.p[0]+s*(j==2?.17:j==1?.1:.13),r.p[1]+(j==2?.06:0),r.p[2]]});return L});
    return lpGeo('E137|'+n,n,[{rings:ely,seg:14,capA:1,capB:1,paint},{rings:pro,seg:12,capA:1,capB:1,paint},{rings:head,seg:9,capB:1,paint}].concat(legs),87)};
  LPR[n].kit=function(k,c,C,red){
    // seam between the wing cases, sheen lines
    k.L('spine','c',K.dark,[0,.535,.14],[0,.53,-.2],.008,.008,3);k.L('pelvis','c',K.dark,[0,.53,-.2],[0,.4,-.44],.008,.006,3);
    [-1,1].forEach(s=>{k.L('spine','c',K.hi,[s*.12,.5,.1],[s*.14,.5,-.25],.006,.006,3);
      // the shield's forward horn tips, eyes, antennae with clubbed ends, mandibles on the jaw
      k.L('chest','c',K.sh2,[s*.12,.42,.3],[s*.1,.45,.42],.025,.006,4);
      k.p('head','sph','c',K.dark,s*.12,.31,.45,.022,.02,.022);k.p('head','sph','g',red?0xff2a2a:K.eye,s*.128,.312,.458,.012,.012,.012);
      k.L('head','c',K.leg,[s*.1,.3,.5],[s*.18,.34,.56],.007,.006,3);for(let i=0;i<3;i++)k.p('head','box','c',K.sh2,s*(.185+i*.006),.34+i*.008,.56+i*.012,.012,.03,.006,0,s*.5,0);
      k.L('jaw','c',K.leg,[s*.06,.26,.5],[s*.035,.26,.58],.016,.004,4);
      for(let i=0;i<6;i++)k.p('head','cone4','c',K.sh2,s*(.03+i*.025),.275,.555-i*.004,.01,.02,.01,Math.PI/2)});
    // the great curved horn
    let p=[0,.32,.45],d=[0,.6,.8];for(let i=0;i<5;i++){const q=[p[0]+d[0]*.07,p[1]+d[1]*.07,p[2]+d[2]*.07];k.L('head','c',i>3?K.hi:K.sh2,p,q,.035-i*.006,.03-i*.006,5);p=q;const a=-.32;d=[0,d[1]*Math.cos(a)-d[2]*Math.sin(a),d[1]*Math.sin(a)+d[2]*Math.cos(a)]}
    // the sun disc rising from the back: a glowing ring of rays
    k.p('spine','ico','g',K.sun,0,.62,-.14,.07);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.L('spine','g',0xffe080,[Math.sin(a)*.115,.6+Math.cos(a)*.115,-.14],[Math.sin(a)*(i%2?.15:.17),.6+Math.cos(a)*(i%2?.15:.17),-.14],.01,.002,3)}
    // spines on the leg shins, hooked feet
    ['fl','fr','hl','hr'].forEach(p=>{const a=e137B(n,p+'1'),b=e137B(n,p+'2'),s=Math.sign(a[0]);for(let i=0;i<3;i++){const t=.25+i*.25,q=[a[0]+s*.17*(1-t)+s*.13*t,a[1]+.06*(1-t)+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];k.L(p+'1','c',K.leg,q,[q[0]+s*.03,q[1]+.01,q[2]],.008,.001,3)}})};
  LPR[n].post=function(x,c,C,mat){// the middle pair of legs: rigid jointed legs on the body, swinging with the opposite front leg
    const g1=lpSpikeGeo(K.leg,0x1a1208,4);x.mid137=x.mid137||[];
    [-1,1].forEach(s=>{const r=x.S.bones.spine,p=new THREE.Group();p.position.set(s*.2-r[1],.28-r[2],.02-r[3]);x.bones.spine.add(p);
      const f=new THREE.Mesh(g1,mat);f.scale.set(.035,.24,.035);f.rotation.set(0,0,-s*1.15);p.add(f);
      const t=new THREE.Mesh(g1,mat);t.scale.set(.026,.4,.026);t.position.set(s*.21,.1,0);t.rotation.set(0,0,Math.PI+s*.35);p.add(t);
      x.mid137.push({p,src:x.bones[s<0?'fr0':'fl0'],k:1})})};
})();
{const f=rigAnim;rigAnim=function(x){const r=f.apply(this,arguments);if(x&&x.mid137)x.mid137.forEach(m=>{if(m.src)m.p.rotation.x=m.src.rotation.x*m.k});return r}}
