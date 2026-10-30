// ================= v137: enemies get their own bodies (1) — toolkit, Blood Hound, Bone Hound, Blood Bat =================
// Eleven v113 instance enemies were a companion's body with extra parts stuck on (a recoloured Ashwolf, Boneling, Batwing…).
// Each now gets an original body on the same skeleton (so every move and animation still works), its own rigid parts and,
// where it has them, its own ears and wings. Bodies use the low-poly toolkit (lpGeo lofts, dkKit parts).
// ---------------- toolkit ----------------
// a bone's rest position in model space
function e137B(n,b){const q=SPEC[n].bones[b];return [q[1],q[2],q[3]]}
function e137L(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
// body rows along z: [z, y, half width, above, below, bones, extra] → loft rings (r.z, r.k = extra tag for the painter)
function e137Rows(rows,x){return rows.map(q=>({p:[x?x(q[0]):0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],b:q[5],z:q[0],k:q[6]||0,j:q[7]||0}))}
// a limb loft through points [[x,y,z], radius, bones, tag]; ref leans forward-up so it works for legs that bend into a paw
function e137Limb(pts,paint,seg,o){return Object.assign({rings:pts.map(q=>({p:q[0],rx:q[1],ryT:q[1],ryB:q[1],b:q[2],k:q[3]||'leg'})),seg:seg||6,ref:[0,.6,.8],capB:1,paint},o||{})}
// the four legs of a quadruped skeleton (fl fr hl hr chains of 3 bones): F/H = radii [hip, knee, ankle, paw], toe = paw length
function e137Quad(n,F,H,paint,o){o=o||{};const L=[];
  [['fl',F,'chest'],['fr',F,'chest'],['hl',H,'pelvis'],['hr',H,'pelvis']].forEach(([p,R,par])=>{
    const a=e137B(n,p+'0'),b=e137B(n,p+'1'),c=e137B(n,p+'2'),s=Math.sign(a[0]),toe=(o.toe||.06),out=o.out||0,ft=o.foot||.03;
    const A=[a[0]+s*out*.3,a[1]+(o.lift||.05),a[2]];
    L.push(e137Limb([[A,R[0]*1.05,[par,p+'0',.6]],[e137L(a,b,.4),R[0]*.92,[p+'0',p+'0',0]],[b,R[1],[p+'0',p+'1',.5]],[e137L(b,c,.5),(R[1]+R[2])/2,[p+'1',p+'1',0]],
      [c,R[2],[p+'1',p+'2',.5],'ank'],[[c[0],ft+.012,c[2]+toe*.35],R[3],[p+'2',p+'2',0],'paw'],[[c[0],ft*.6,c[2]+toe],R[3]*.55,[p+'2',p+'2',0],'paw']],paint,o.seg||6))});
  return L}
// (v179) a point on a body loft made from e137Rows-style rows [z, y, half width, above, below]: at z, angle a from the top
// (0 = top, π/2 = the side, π = underneath; s = side ±1), d metres outside the surface (negative = sunk into it)
function e179On(rows,z,a,s,d){let i=0;while(i<rows.length-2&&z>rows[i+1][0])i++;const A=rows[i],B=rows[i+1],t=Math.max(0,Math.min(1,(z-A[0])/(B[0]-A[0]))),L=j=>A[j]+(B[j]-A[j])*t;
  const c=Math.cos(a),ry=c>0?L(3):L(4),rx=L(2),k=.96,x=Math.sin(a)*rx*k,y=c*ry*k,n=Math.hypot(x/(rx*rx||1),y/(ry*ry||1))||1;return [s*(x+d*x/(rx*rx)/n),L(1)+y+d*y/(ry*ry)/n,z]}
// claws on a paw: n toes spread around the paw tip
function e137Claws(k,n,bn,col,len,r,cnt){const c=e137B(n,bn);for(let i=0;i<(cnt||3);i++){const x=c[0]+(i-((cnt||3)-1)/2)*.022;k.L(bn,'c',col,[x,.03,c[2]+.05],[x,.006,c[2]+.05+len],r,.002,4)}}
function e137Rib(k,bn,col,x0,y0,z,w,h,r){// one rib arc on both flanks, from the spine (x0,y0) curving down to (±w, y0-h)
  [-1,1].forEach(s=>{let p=[x0,y0,z];for(let i=1;i<=4;i++){const t=i/4,a=t*Math.PI*.55,q=[x0+s*Math.sin(a)*w,y0-(1-Math.cos(a))*h*1.4,z-t*.02];k.L(bn,'c',col,p,q,r,r*.85,4);p=q}})}

// ===================================================================== Blood Hound (Ashwolf skeleton) =====================================================================
// A gaunt flayed hunting hound: hyena-like high shoulders over a tucked waist, raw red muscle with pale sinew, bare ribs
// down the flanks, a long narrow skull-like snout full of teeth, a mane of black bristles, a naked rat tail, a spiked iron collar.
(function(){const n='BloodHound';if(!LPR[n])return;
  const K={mus:0x7a1a20,mus2:0x5a0e14,sinew:0xc89a8a,skin:0x2a1416,bone:0xd8ccb4,iron:0x3a3a40,blood:0xc81a2a,glow:0xff3a4a,dark:0x120808};(window.VARK179=window.VARK179||{})[n]=K;   // v179: per-enemy palettes (3371)
  const BHR=[[-.47,.505,.03,.03,.03,['tail0','tail0',0]],[-.42,.5,.065,.06,.06,['pelvis','tail0',.5]],[-.36,.5,.1,.09,.095,['pelvis','pelvis',0]],[-.27,.5,.112,.1,.105,['pelvis','pelvis',0]],
      [-.16,.505,.095,.095,.075,['pelvis','spine',.5]],[-.04,.515,.1,.1,.085,['spine','spine',0]],[.08,.53,.13,.12,.15,['spine','chest',.5]],[.19,.545,.145,.13,.19,['chest','chest',0]],
      [.29,.57,.135,.13,.165,['chest','neck',.3]],[.37,.61,.1,.1,.11,['neck','neck',0]],[.45,.65,.08,.08,.08,['neck','head',.5]],
      [.51,.68,.092,.085,.072,['head','head',0],'hd'],[.58,.685,.085,.07,.055,['head','head',0],'hd'],[.66,.672,.06,.05,.04,['head','head',0],'hd'],[.74,.66,.044,.036,.028,['head','head',0],'hd'],[.8,.652,.03,.024,.02,['head','head',0],'hd']];
  LPR[n].geo=function(C,c){const mus=new THREE.Color(K.mus),mus2=new THREE.Color(K.mus2),sin=new THREE.Color(K.sinew),skin=new THREE.Color(K.skin),bone=new THREE.Color(K.bone);
    const paint=(o,r,s,cc,i)=>{if(r.k=='paw')return o.copy(skin);if(r.k=='hd'){o.copy(skin).lerp(bone,s>.2?.55:.15);return}
      o.copy(mus);if(Math.abs(cc)>.55&&(i+Math.round(s*3))%2)o.copy(mus2);if(s>.7)o.copy(skin);if(Math.abs(s)<.25&&i%3==0)o.lerp(sin,.6);if(r.k=='leg'&&s<-.3)o.lerp(sin,.3)};
    const body=e137Rows(BHR);
    const jaw=e137Rows([[.56,.63,.06,.02,.03,['head','jaw',.7],'hd'],[.65,.625,.05,.016,.025,['jaw','jaw',0],'hd'],[.73,.628,.036,.014,.02,['jaw','jaw',0],'hd'],[.79,.63,.02,.01,.012,['jaw','jaw',0],'hd']]);
    const tb=[e137B(n,'tail0'),e137B(n,'tail1'),e137B(n,'tail2'),e137B(n,'tail3')];
    const tail=e137Limb([[[0,.5,-.44],.045,['tail0','tail0',0]],[e137L(tb[0],tb[1],.5),.032,['tail0','tail1',.5]],[[0,tb[1][1]-.05,tb[1][2]],.024,['tail1','tail1',0]],[[0,tb[2][1]-.12,tb[2][2]],.016,['tail2','tail2',0]],[[0,tb[3][1]-.2,tb[3][2]],.008,['tail3','tail3',0]]],(o)=>o.copy(skin).lerp(mus,.3),5,{ref:[0,1,0]});
    return lpGeo('E137|'+n,n,[{rings:body,seg:10,capA:1,capB:1,paint},{rings:jaw,seg:6,capB:1,paint},tail].concat(e137Quad(n,[.06,.04,.026,.03],[.08,.045,.028,.03],paint,{toe:.07})),71)};
  LPR[n].kit=function(k,c,C,red){
    // eyes deep in bony sockets, a row of teeth and long fangs, drool of blood
    [-1,1].forEach(s=>{k.p('head','sph','c',K.dark,s*.058,.715,.6,.03,.022,.03,0,s*.4,0);k.p('head','sph','g',K.glow,s*.064,.716,.61,.016,.012,.014);
      k.p('head','box','c',K.bone,s*.06,.735,.59,.035,.012,.05,0,s*.35,s*.3);
      for(let i=0;i<5;i++)k.p('head','cone4','c',K.bone,s*(.036-i*.003),.645,.6+i*.04,.007,.024,.007,Math.PI);
      k.p('head','cone4','c',0xf0e8d8,s*.026,.64,.77,.009,.05,.009,Math.PI);k.p('jaw','cone4','c',0xf0e8d8,s*.03,.64,.74,.008,.04,.008);
      // bare ribs on the flanks
      // (v179: each rib lies on the flank's surface, half sunk into it; they stood off the waist before)
      for(let i=0;i<4;i++){const z=.17-i*.07,bn=i<2?'chest':'spine',P=[.42,.62,.82,1.02,1.2].map(a=>e179On(BHR,z-(a-.42)*.02,a*Math.PI/2,s,-.002));for(let j=0;j<4;j++)k.L(bn,'c',K.bone,P[j],P[j+1],.012-j*.001,.011-j*.001,4)}});
    k.p('head','sph','c',K.dark,0,.67,.8,.02,.015,.012);
    for(let i=0;i<3;i++)k.L('jaw','c',K.blood,[(i-1)*.025,.62,.68+i*.03],[(i-1)*.03,.53-i*.02,.7+i*.03],.008,.003,3);
    // a mane of black bristles from the crown down the spine
    for(let i=0;i<14;i++){const z=.55-i*.065,bn=z>.5?'head':z>.36?'neck':z>.12?'chest':z>-.15?'spine':'pelvis',y=z>.4?.73-(.55-z)*.5:z>.1?.69-(.4-z)*.3:.6;
      [-1,0,1].forEach(j=>k.L(bn,'c',K.dark,[j*.025,y,z],[j*.04,y+.07-i*.002,z-.07],.014,.002,3))}
    // spiked iron collar with a dangling chain
    for(let i=0;i<9;i++){const a=i/9*Math.PI*2;k.p('neck','cone4','m',K.iron,Math.sin(a)*.11,.61+Math.cos(a)*.105,.37,.012,.05,.012,Math.cos(a)*1.5,0,-Math.sin(a)*1.5)}
    k.p('neck','tor','m',0x2a2a30,0,.61,.37,.104,.03,.098,Math.PI/2+.25,0,0);   // v179: the collar hugs the neck
    for(let i=0;i<4;i++)k.p('neck','ring','m',K.iron,0,.502-i*.03,.345,.018,.03,.018,i%2?0:Math.PI/2,0,i%2?Math.PI/2:0);   // links in turn across and along: each hooks through the last (v179)
    // claws
    ['fl2','fr2','hl2','hr2'].forEach(b=>e137Claws(k,n,b,0x1a1210,.035,.008,3))};
  LPR[n].post=function(x,c,C,mat){// torn, swept-back ears
    const og=lpSpikeGeo(K.skin,K.dark,3),ig=lpSpikeGeo(K.mus,K.mus2,3);   // v179: from the palette (the Snow Wolf's were red)
    [-1,1].forEach(s=>{const p=lpPart(x.S,x.bones,'head',og,mat,s*.06,.73,.53,.055,.16,.03,-.6,-s*.3,s*.25);const m=new THREE.Mesh(ig,mat);m.scale.set(.6,.7,.5);m.position.set(0,.03,.45);p.children[0].add(m);p.userData={rz:-s*.3,sd:s};x.ears.push(p)})};
})();

// ===================================================================== Bone Hound (Boneling skeleton) =====================================================================
// A corpse hound, half flesh half bone: rotting grey-green hide on the haunches and shoulders, an open ribcage between them,
// a bare skull with ghast-flame eyes, exposed vertebrae, and green spirit fire licking along its spine.
(function(){const n='BoneHound';if(!LPR[n])return;
  const K={hide:0x4a5040,hide2:0x343a2c,rot:0x6a5a3a,bone:0xd8ccb0,bone2:0xa89c84,flame:0x7aff9a,dark:0x0a0c08};(window.VARK179=window.VARK179||{})[n]=K;   // v179: per-enemy palettes (3371)
  LPR[n].geo=function(C,c){const hide=new THREE.Color(K.hide),hide2=new THREE.Color(K.hide2),rot=new THREE.Color(K.rot),bone=new THREE.Color(K.bone),bone2=new THREE.Color(K.bone2);
    const paint=(o,r,s,cc,i)=>{if(r.k=='bn'||r.k=='paw'||r.k=='ank')return o.copy(i%2?bone:bone2);o.copy(hide);if(Math.abs(cc)>.5&&i%2)o.copy(hide2);if(s<-.4)o.lerp(rot,.5);if(r.k=='leg'&&s<0)o.lerp(rot,.3)};
    // haunches
    const hind=e137Rows([[-.44,.44,.03,.03,.03,['tail0','tail0',0],'bn'],[-.4,.44,.07,.06,.06,['pelvis','tail0',.5]],[-.33,.445,.1,.09,.09,['pelvis','pelvis',0]],[-.24,.45,.105,.095,.09,['pelvis','pelvis',0]],[-.15,.455,.085,.08,.07,['pelvis','spine',.4]],[-.1,.46,.05,.05,.04,['spine','spine',0],'bn']]);
    // a bare spine through the open ribcage
    const spine=e137Rows([[-.12,.48,.025,.025,.025,['pelvis','spine',.5],'bn'],[0,.49,.028,.028,.028,['spine','spine',0],'bn'],[.1,.49,.028,.028,.028,['spine','chest',.5],'bn'],[.14,.49,.03,.03,.03,['chest','chest',0],'bn']]);
    // shoulders and neck
    const front=e137Rows([[.12,.48,.04,.04,.04,['chest','chest',0],'bn'],[.17,.47,.1,.09,.1,['chest','chest',0]],[.25,.47,.115,.1,.12,['chest','chest',0]],[.32,.49,.1,.09,.1,['chest','neck',.4]],[.38,.53,.07,.07,.07,['neck','neck',0]],[.43,.56,.055,.055,.055,['neck','head',.5]],[.48,.585,.05,.05,.045,['neck','head',.9]]]);   // (v179: the neck runs into the skull)
    // the skull
    const skull=e137Rows([[.44,.585,.06,.06,.05,['head','head',0],'bn'],[.49,.605,.08,.075,.06,['head','head',0],'bn'],[.55,.6,.07,.06,.045,['head','head',0],'bn'],[.62,.58,.048,.04,.03,['head','head',0],'bn'],[.69,.565,.034,.028,.022,['head','head',0],'bn'],[.73,.56,.02,.018,.014,['head','head',0],'bn']]);
    const jaw=e137Rows([[.47,.56,.04,.025,.02,['head','jaw',.3],'bn'],[.52,.54,.05,.015,.02,['head','jaw',.7],'bn'],[.6,.535,.038,.012,.018,['jaw','jaw',0],'bn'],[.68,.54,.024,.01,.012,['jaw','jaw',0],'bn']]);
    const tb=[e137B(n,'tail0'),e137B(n,'tail1'),e137B(n,'tail2'),e137B(n,'tail3')];
    const tail=e137Limb([[[0,.44,-.42],.025,['tail0','tail0',0],'bn'],[tb[1],.018,['tail0','tail1',.5],'bn'],[tb[2],.013,['tail1','tail2',.5],'bn'],[tb[3],.006,['tail3','tail3',0],'bn']],paint,4,{ref:[0,1,0]});
    // front legs: hide down to the elbow, bare bone below; hind legs: hide to the hock
    const legs=e137Quad(n,[.05,.026,.018,.02],[.065,.03,.018,.02],paint,{toe:.06}).map((L,i)=>{L.rings.forEach((r,j)=>{if((i<2&&j>=3)||(i>=2&&j>=4))r.k='bn';if(r.k=='bn'){r.rx*=.7;r.ryT*=.7;r.ryB*=.7}});return L});
    return lpGeo('E137|'+n,n,[{rings:hind,seg:9,capA:1,capB:1,paint},{rings:spine,seg:5,paint},{rings:front,seg:9,capA:1,capB:1,paint},{rings:skull,seg:8,capA:1,capB:1,paint},{rings:jaw,seg:6,capB:1,paint},tail].concat(legs),73)};
  LPR[n].kit=function(k,c,C,red){
    // the open ribcage
    for(let i=0;i<5;i++){const z=.1-i*.055;e137Rib(k,i<2?'chest':'spine',i%2?K.bone2:K.bone,0,.49,z,.1,.09,.01)}
    for(let i=0;i<4;i++)k.p(i<2?'chest':'spine','box','c',K.bone2,0,.43-i*.01,.13-i*.06,.025,.012,.04);
    // vertebra spurs along the spine and tail
    for(let i=0;i<12;i++){const z=.36-i*.07,bn=z>.3?'neck':z>.12?'chest':z>-.1?'spine':z>-.36?'pelvis':'tail0',y=z>.3?.58:z>-.4?.53+(z>0?.02:0):.47;k.L(bn,'c',K.bone,[0,y-.02,z],[0,y+.045,z-.03],.014,.003,4)}
    // the skull: sockets with ghast flames, nasal hole, teeth, horn stubs
    [-1,1].forEach(s=>{k.p('head','sph','c',K.dark,s*.045,.625,.53,.03,.026,.028,0,s*.4,0);k.p('head','sph','g',K.flame,s*.05,.627,.545,.014,.016,.012);
      k.L('head','g',K.flame,[s*.05,.635,.54],[s*.07,.71,.48],.012,.001,4);
      for(let i=0;i<5;i++){k.p('head','cone4','c',0xece4d0,s*(.03-i*.002),.555,.56+i*.032,.006,.02,.006,Math.PI);k.p('jaw','cone4','c',0xece4d0,s*(.026-i*.002),.55,.56+i*.03,.005,.016,.005)}
      k.L('head','c',K.bone2,[s*.05,.64,.47],[s*.08,.68,.42],.016,.004,4)});
    k.p('head','box','c',K.dark,0,.6,.69,.016,.014,.02);
    // spirit fire along the back
    for(let i=0;i<7;i++){const z=.3-i*.1,bn=z>.12?'chest':z>-.1?'spine':'pelvis';k.L(bn,'g',K.flame,[(i%2-.5)*.03,.505,z],   /* v179: base down into the vertebrae */[(i%2-.5)*.05,.62+(i%3)*.02,z-.06],.022,.001,4)}
    // hanging scraps of hide at the ribcage edges, claws
    [-1,1].forEach(s=>{k.L('chest','c',K.hide2,[s*.1,.44,.12],[s*.105,.37,.1],.025,.006,3);k.L('pelvis','c',K.hide2,[s*.09,.42,-.11],[s*.095,.35,-.09],.02,.005,3)});
    ['fl2','fr2','hl2','hr2'].forEach(b=>e137Claws(k,n,b,K.bone2,.03,.007,3))};
  LPR[n].post=null;
})();

// ===================================================================== Blood Bat (its own rig, on the Batwing skeleton) =====================================================================
// A vampire bat: bald wrinkled crimson face with a big pig-like nose leaf, huge veined ears, a bloated belly swollen with
// glowing blood, gaunt bony shoulders, hooked thumbs and tattered, veined wings with holes along the trailing edge.
(function(){const n='BloodBat';SPEC[n]=Object.assign({},SPEC.Batwing);
  const K={fur:0x2a1418,skin:0x8a3a3a,skin2:0x6a2228,belly:0xb01a2a,mem:0x4a1a20,vein:0xa02a34,dark:0x120808,glow:0xff4a3a,bone:0xe8dcc8};(window.VARK179=window.VARK179||{})[n]=K;   // v179: per-enemy palettes (3371)
  const BB=LPR.Batwing;
  LPR[n]={head:['head',0,.5,.38],up:.08,sc:1.15,back:BB.back,
    geo(C,c){const fur=new THREE.Color(K.fur),skin=new THREE.Color(K.skin),skin2=new THREE.Color(K.skin2),belly=new THREE.Color(K.belly),dark=new THREE.Color(K.dark);
      const paint=(o,r,s,cc,i)=>{if(r.k=='hd'){o.copy(i%2?skin:skin2);if(s>.6)o.lerp(fur,.4);return}if(r.k=='paw')return o.copy(dark);
        if(r.k=='leg')return o.copy(skin2);o.copy(fur);if(s<-.25)o.copy(belly).multiplyScalar(i%2?1:.8)};
      const body=e137Rows([[-.42,.32,.012,.012,.012,['tail1','tail1',0]],[-.34,.305,.04,.035,.035,['tail0','tail1',.3]],[-.26,.29,.1,.09,.1,['pelvis','tail0',.2]],[-.16,.28,.15,.12,.17,['pelvis','spine',.4]],
        [-.04,.285,.17,.13,.19,['spine','spine',0]],[.07,.295,.16,.13,.17,['spine','chest',.5]],[.16,.31,.13,.12,.13,['chest','chest',0]],[.24,.33,.11,.11,.1,['chest','neck',.6]],
        [.3,.36,.11,.11,.1,['neck','head',.5]],[.36,.395,.125,.12,.1,['head','head',0],'hd'],[.42,.395,.11,.1,.085,['head','head',0],'hd'],[.46,.385,.08,.07,.06,['head','head',0],'hd'],[.49,.38,.05,.045,.04,['head','head',0],'hd'],[.5,.378,.02,.02,.02,['head','head',0],'hd']]);
      return lpGeo('E137|'+n,n,[{rings:body,seg:9,capA:1,capB:1,paint}].concat(e137Quad(n,[.035,.022,.016,.016],[.04,.024,.016,.016],paint,{toe:.04,lift:.02,foot:.02}).slice(2)),79)} /* v150: hind legs only, the wings are its forelimbs */,
    kit(k,c,C,red){
      // nose leaf, eyes, wrinkles, fangs
      k.p('head','sph','c',K.skin2,0,.4,.505,.05,.045,.025);k.L('head','c',K.skin,[0,.42,.51],[0,.48,.5],.03,.006,4);
      [-1,1].forEach(s=>{k.p('head','sph','c',K.dark,s*.015,.392,.53,.012,.01,.008);
        k.p('head','sph','c',K.dark,s*.062,.43,.465,.026,.022,.018,0,s*.5,0);k.p('head','sph','g',K.glow,s*.066,.432,.472,.015,.013,.01);
        for(let i=0;i<3;i++)k.L('head','c',K.skin2,[s*(.03+i*.02),.45-i*.01,.47-i*.02],[s*(.06+i*.02),.44-i*.012,.45-i*.02],.006,.006,3);
        k.p('head','cone4','c',K.bone,s*.026,.35,.49,.011,.05,.011,Math.PI);k.p('jaw','cone4','c',K.bone,s*.022,.352,.47,.007,.025,.007)});
      k.p('jaw','box','c',0x3a0a10,0,.36,.46,.045,.01,.05);
      // swollen belly veins and gaunt shoulder bones
      for(let i=0;i<6;i++){const a=(i/5-.5)*2.4;k.L('spine','g',K.glow,[Math.sin(a)*.15,.2,-.02+Math.cos(a)*.05],[Math.sin(a)*.12,.14,-.1],.006,.004,3)}
      k.p('spine','sph','g',0xc0182a,0,.17,-.05,.12,.07,.15);
      // a bristly black mane over the shoulders and down the back
      for(let i=0;i<9;i++){const z=.3-i*.06,bn=z>.25?'neck':z>.1?'chest':z>-.1?'spine':'pelvis',y=z>.2?.47:.43-(.2-z)*.15;[-1,0,1].forEach(j=>k.L(bn,'c',0x0a0606,[j*.04,y-.02,z],[j*.07,y+.06,z-.07],.018,.002,3))}
      [-1,1].forEach(s=>{k.L('chest','c',K.skin2,[s*.06,.43,.2],[s*.12,.4,.12],.02,.012,4);k.L('chest','c',K.skin2,[s*.12,.4,.12],[s*.1,.33,.08],.012,.008,4)});
      ['hl2','hr2'].forEach(b=>e137Claws(k,n,b,K.dark,.03,.006,3))},
    post(x,c,C,mat){
      const og=lpSpikeGeo(K.skin2,K.dark,3),ig=lpSpikeGeo(0x9a3a44,0x3a0a10,3);
      [-1,1].forEach(s=>{const p=lpPart(x.S,x.bones,'head',og,mat,s*.07,.47,.38,.1,.27,.045,-.25,-s*.5,s*.1);const m=new THREE.Mesh(ig,mat);m.scale.set(.62,.78,.5);m.position.set(0,.03,.5);p.children[0].add(m);p.userData={rz:-s*.45,sd:s};x.ears.push(p)});
      // tattered membrane: notches and holes along the trailing edge, veins as struts
      const W=lpwWing('bloodbat',
        [[0,0,.05],[.22,.05,.08],[.42,.06,.06],[.62,.04,0],[.9,0,-.1],[.8,-.02,-.2],[.74,0,-.3],[.7,-.02,-.24],[.64,0,-.38],[.55,-.02,-.3],[.47,0,-.52],[.4,-.03,-.4],[.33,0,-.46],[.24,-.02,-.36],[.18,0,-.5],[.1,-.02,-.34],[0,0,-.3]],
        [.36,.03,-.18],
        [[[0,.01,.05],[.42,.07,.06],.024],[[.42,.07,.06],[.62,.05,0],.018],[[.42,.06,.06],[.9,0,-.1],.012],[[.42,.06,.06],[.74,0,-.3],.012],[[.42,.06,.06],[.47,0,-.52],.012],[[.42,.06,.06],[.18,0,-.5],.01],[[.62,.05,0],[.65,.1,.06],.014],
         [[.3,.04,-.1],[.55,.02,-.3],.005],[[.2,.03,-.05],[.33,0,-.4],.005]],
        K.mem,0x1a0608,K.vein);
      lpwPair(x,'chest',W,mat,.1,.4,.14,.15,.1)}};
  if(EN.bloodbat){EN.bloodbat.rig=n}
})();
