// ================= v186: every companion grows grander with each evolution (owner, Nov 1 2026) =================
// Owner: "It also seems the evolution physical appearance upgrade was lost on many companions. Evolutions should be like
// foxlet- they become a cooler, more upgraded version of themself visually with each evolution."
// The Foxlet is the model: its own feature (the tail) gets bigger and multiplies, so the animal itself grows grander.
// Round 2 (fresh-agent review: "the body almost never grows; each stage only adds small add-ons, so stage 0 and stage 3
// look like the same animal"): every stage now grows the creature's OWN features at body scale - mane, ruff, jaw, maw,
// thighs, shell, hump, abdomen, horns, fangs, ears, wingspan, hood, tatters, claws - with few separate pieces.
// The tool for that is EV38T.swell: body triangles inside an ellipsoid are copied and pushed out along the normals with a
// smooth falloff to nothing at the edge, so the body itself bulges (a ruff, a heavier jaw, bigger thighs, a crusted hump)
// and blends back into the surface; skinned like the body, it bends with it.
// Rules kept: no crowns, circlets, bands, chains, gems, lanterns, jewellery, pauldrons, bibs or breastplates; no shapes that
// read as icons (arrows, chevrons, hexagons, diamonds, flat cards); glow dark and desaturated; nothing floating; nothing
// on the legs that reads as a cuff. Some of those were in the bodies' own kits; they are taken out here too (kit wrappers below).
// How: the evolution kit E gets a second kit E.raw without the EVO186 limits (its parts are baked with E's, their colours
// graded like the body and their glow dulled). Designs are written per stage, not per level: a species only ever shows
// four of the five levels (tier 1-2: 0 1 2 4, tier 3-4: 1 2 3 5, tier 5: 2 3 4 5; evo100Lv in 1710).
// The dragon rigs (Drakelet: Drakelet, Pyrewing, Elderdrake; Gravewyrm: Gravewyrm, Venomcoil) have their own evolution pass
// (3436): nothing here touches them (no raw kit, no hook, no kit wrapper).
var EV38={on:true,skip:['Drakelet','Gravewyrm'],dull:[.6,.8]};
// the stage (0-3) a level shows for a species
function ev38St(L,sp){const t=typeof tierSp=='function'?tierSp(sp):1,V=t<=2?[0,1,2,4]:t<=4?[1,2,3,5]:[2,3,4,5];let s=0;V.forEach((v,i)=>{if(L>=v)s=i});return s}
// the stage of a companion (for its kit's post step)
function ev38StC(c){try{return ev38St(evo100Lv(c),c.g[0])}catch(e){return 0}}
{const f=evo100Kit;evo100Kit=function(n,L,P,seed){const E=f.apply(this,arguments);if(!EV38.on||typeof EVO186=='undefined'||EV38.skip.indexOf(n)>=0)return E;
  const o=EVO186.on;EVO186.on=false;try{E.raw=f.call(this,n,L,P,(seed|0)+386)}finally{EVO186.on=o}E.raw.sp=ev38Sp(n);return E}}
// the raw parts join the bake: body colours graded like the body (LP186.grade), glow dulled (dark, desaturated, never candy)
function ev38Col(hex,t,sp,keep){const c=new THREE.Color(hex);if(t=='g'){if(keep)return c.getHex();const h={};c.getHSL(h);c.setHSL(h.h,h.s*EV38.dull[0],h.l*EV38.dull[1]);return c.getHex()}
  if(t=='c'&&typeof lp186GradeC=='function'&&typeof LP186!='undefined')lp186GradeC(c,LP186.grade[sp]||LP186.grade.def);return c.getHex()}
{const f=evo100Bake;evo100Bake=function(E){if(E&&E.raw&&E.raw.parts.length){const sp=E.raw.sp,keep=E.raw.keepGlow;
    E.raw.parts.forEach(q=>{if(q.j!=null)q.j=0;
      if(q.raw)q.raw.cols=q.raw.cols.map(v=>ev38Col(v,q.t,sp,keep));else if(q.loft)q.loft.forEach(r=>{r.col=ev38Col(r.col,q.t,sp,keep)});
      else if(q.col!=null)q.col=ev38Col(q.col,q.t,sp,keep);E.parts.push(q)});E.raw.parts.length=0}return f.apply(this,arguments)}}
// ---------------------------------------------------------------- shared tools (positions in the rig's model space) ----------------------------------------------------------------
var EV38T={
  // box of the body vertices whose main bone matches re: {mn,mx,c}
  box(E,re){const S=E.S,P=S.P,SI=S.SI,SW=S.SW,O=S.O,mn=[9,9,9],mx=[-9,-9,-9],c=[0,0,0];let n=0;
    for(let v=0;v<P.length/3;v++){let bi=0;for(let k=1;k<4;k++)if(SW[v*4+k]>SW[v*4+bi])bi=k;if(!re.test(O[SI[v*4+bi]]||''))continue;n++;
      for(let k=0;k<3;k++){const x=P[v*3+k];if(x<mn[k])mn[k]=x;if(x>mx[k])mx[k]=x;c[k]+=x}}
    return n?{mn,mx,c:c.map(x=>x/n),n}:null},
  // main bone of the body at point p
  bone(R,p){const k=evo100Skin(R.S,p);return R.S.O[k[4]>=k[5]?k[0]:k[1]]||''},
  // a spike / horn / fin from a root sunk into the body at hit h, along d, length ln, base radius r; tip in glow from tk (0-1)
  spike(R,h,d,ln,r,col,tipCol,tk,o,seg){const a=R.add(h.p,h.n,-r*.7),D=R.nrm(d),b=R.add(h.p,D,ln);o=Object.assign({at:a},o);
    if(tipCol!=null&&tk!=null&&tk<1){const m=R.add(h.p,D,ln*tk);R.L(a,m,r,r*(1-tk)+.002,'c',col,seg||4,o);R.L(m,b,r*(1-tk)+.002,.001,'g',tipCol,seg||4,o)}
    else R.L(a,b,r,.001,'c',col,seg||4,o);return b},
  // flank hit at side s, height y, z
  side(R,s,y,z){return R.on([s*3,y,z],[-s,0,0])},
  // a fur tuft (tapered cone) from hit h
  tuft(R,h,dir,len,r,col,t){const d=R.nrm([h.n[0]+dir[0],h.n[1]+dir[1],h.n[2]+dir[2]]);return R.L(R.add(h.p,h.n,-r*.6),R.add(h.p,d,len),r,.002,t||'c',col,4)},
  // a tapered chain through points (radii r0 -> r1) skinned like its first point
  chain(R,pts,r0,r1,t,col,o){const N=pts.length-1;for(let i=0;i<N;i++)R.L(pts[i],pts[i+1],r0+(r1-r0)*i/N,r0+(r1-r0)*(i+1)/N,t,col,5,Object.assign({at:pts[0]},o));return pts[N]},
  mix(a,b,t){return new THREE.Color(a).lerp(new THREE.Color(b),t).getHex()},
  dim(a,k){return new THREE.Color(a).multiplyScalar(k).getHex()},
  hash(x,y,z){const v=Math.sin(x*91.7+y*47.3+z*73.1)*43758.5;return v-Math.floor(v)},
  // grow the body itself: body triangles inside the ellipsoid (centre c, radii r) are copied and pushed out along the
  // normals by up to amp, falling smoothly to nothing at the ellipsoid's edge (so the swelling blends into the body); o.jag
  // roughens it into clumps (fur, crust), o.legs lets it onto the legs, o.bone limits it to body parts on matching bones,
  // o.sel(x,y,z,nx,ny,nz) filters triangles; col(x,y,z,k) colours it (k: 0 at the edge .. 1 at the centre)
  // The body loft is coarse (a few hundred vertices), so each picked triangle is first split into 4^sub smaller ones
  // (o.sub, default 2): the swelling then follows the falloff smoothly and o.jag can break it into fur clumps or crust.
  // o.sweep [x,y,z] leans the growth that way (a mane sweeping back). Each new vertex is skinned like the nearest corner.
  swell(R,c,r,amp,col,o){o=o||{};const S=R.S,I=S.I,Pp=S.P,Nn=S.N,H=EV38T.hash,d=(x,y,z)=>((x-c[0])/r[0])**2+((y-c[1])/r[1])**2+((z-c[2])/r[2])**2,
    sub=o.sub==null?2:o.sub,m=1<<sub,sw=o.sweep,pos=[],cols=[],sk=[];let nt=0;
    const lift=(x,y,z)=>{const q=d(x,y,z);if(q>=1)return 0;const f=1-q;let a=amp*f*f*(3-2*f);if(o.jag)a*=1-o.jag*.5+o.jag*H(x,y,z);return a};
    for(let t3=0;t3<I.length;t3+=3){const V=[I[t3],I[t3+1],I[t3+2]],cx=(Pp[V[0]*3]+Pp[V[1]*3]+Pp[V[2]*3])/3,cy=(Pp[V[0]*3+1]+Pp[V[1]*3+1]+Pp[V[2]*3+1])/3,cz=(Pp[V[0]*3+2]+Pp[V[1]*3+2]+Pp[V[2]*3+2])/3;
      if(d(cx,cy,cz)>=1)continue;const nx=(Nn[V[0]*3]+Nn[V[1]*3]+Nn[V[2]*3])/3,ny=(Nn[V[0]*3+1]+Nn[V[1]*3+1]+Nn[V[2]*3+1])/3,nz=(Nn[V[0]*3+2]+Nn[V[1]*3+2]+Nn[V[2]*3+2])/3;
      if(o.sel&&!o.sel(cx,cy,cz,nx,ny,nz))continue;if(!o.legs&&EV38T.onLeg(R,[cx,cy,cz]))continue;if(o.bone&&!o.bone.test(EV38T.bone(R,[cx,cy,cz])))continue;nt++;
      const G={},pt=(i,j)=>{const k=i+'_'+j;if(G[k])return G[k];const b=[1-(i+j)/m,i/m,j/m],q=[0,0,0],n=[0,0,0];
        for(let v=0;v<3;v++)for(let a=0;a<3;a++){q[a]+=Pp[V[v]*3+a]*b[v];n[a]+=Nn[V[v]*3+a]*b[v]}const l=Math.hypot(n[0],n[1],n[2])||1,h=lift(q[0],q[1],q[2])+.001;
        const p=[q[0]+n[0]/l*h+(sw?sw[0]*(h-.001):0),q[1]+n[1]/l*h+(sw?sw[1]*(h-.001):0),q[2]+n[2]/l*h+(sw?sw[2]*(h-.001):0)];
        return G[k]={p,c:col(q[0],q[1],q[2],1-Math.min(1,d(q[0],q[1],q[2]))),s:V[b[0]>=b[1]&&b[0]>=b[2]?0:b[1]>=b[2]?1:2]}};
      const tri=(A,B,C)=>{const cc=A.c;[A,B,C].forEach(P=>{pos.push(P.p);cols.push(cc);sk.push(P.s)})};
      for(let i=0;i<m;i++)for(let j=0;j<m-i;j++){tri(pt(i,j),pt(i+1,j),pt(i,j+1));if(i+j<m-1)tri(pt(i+1,j),pt(i+1,j+1),pt(i,j+1))}}
    if(nt)R.parts.push({raw:{pos,cols,sk},t:o.t||'c'});return nt}};
// is the body point p on a leg (its nearest vertex mainly on a leg bone)?
EV38T.onLeg=function(R,p){return /^(fl|fr|hl|hr|a\d|b\d)/.test(EV38T.bone(R,p))};
// a row of spikes along the top line from z0 to z1: n spikes, height h(t) (t 0..1 along the row), base radius r
EV38T.crest=function(R,z0,z1,n,h,r,col,dir,tipCol,tk,x){for(let i=0;i<n;i++){const t=n>1?i/(n-1):0,z=z0+(z1-z0)*t,xx=x==null?0:(typeof x=='function'?x(i):x),q=R.top(xx,z);if(!q)continue;
  const d=dir?dir(t,q):[q.n[0]*.4,1,-.9];EV38T.spike(R,q,d,h(t),typeof r=='function'?r(t):r,typeof col=='function'?col(i):col,tipCol,tk)}};
// a fur colour: c0 deep in the clump, c1 at its outside (k 0..1 from the edge to the centre of the swelling)
EV38T.fur=(c0,c1)=>(x,y,z,k)=>EV38T.mix(c1,c0,Math.min(1,k*1.3)*(.7+.3*EV38T.hash(x,y,z)));
// the companion's species while its rig is built
function ev38Sp(rig){return (typeof RV137!='undefined'&&RV137.cur[rig])||rig}
EV38.S={};
function ev38Hook(rig){const D=EVO100.D[rig];if(!D)return;const b0=D.build;
  D.build=function(E,L,P,c){const sp=ev38Sp(rig),f=EV38.on&&E.raw&&EV38.S[sp];if(!f)return b0.apply(this,arguments);return f.call(this,E,L,P,c,ev38St(L,sp),b0)}}

// ===================================================================== Beasts =====================================================================
// Emberlynx: the lynx itself grows and catches fire. 1 the cheek ruff and the neck fur swell, a crest of dark fur down the nape,
// the bobtail bushes out · 2 the ruff becomes a great mane, the crest runs down the back with ember tips · 3 the mane is
// huge and smoulders through, a crest of obsidian spines on the brow, the tail tip burns (dark embers)
EV38.S.Emberlynx=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,blk=0x1a1210,obs=0x221a1a,fur=T.fur(P.mainD,T.mix(P.main,0xd8c0a0,.25));
  T.swell(R,[0,.6,.43],[.15+.02*s,.14+.02*s,.13],.018+.016*s,fur,{jag:.85,sweep:[0,.1,-.7],sel:(x,y,z)=>!(z>.5&&y>.62)});
  T.swell(R,[0,.61,-.52],[.07,.07,.08],.01+.008*s,T.fur(blk,P.mainD),{jag:.6});
  const n=[0,5,7,9][s],z1=[0,.22,.04,-.14][s];
  T.crest(R,.43,z1,n,t=>(.045+.02*s)*(1-.45*Math.abs(t-.25)),.018,i=>i%2?blk:P.mainD,(t,q)=>[q.n[0]*.3,1,-1.1],s>=2?P.glowD:null,.65);
  if(s>=2)for(let i=0;i<9;i++){const a=-1.6+i/8*3.2,c0=[0,.58,.4],o=[Math.sin(a)*.4,.58+Math.cos(a)*.4,.4],q=R.on(o,[c0[0]-o[0],c0[1]-o[1],0]);
    if(q)T.tuft(R,q,[Math.sin(a)*.3,Math.cos(a)*.2-.1,-1.3],.08+.04*(s-2)+(i%2)*.02,.034,i%2?P.mainD:P.main)}
  if(s>=3){for(let i=-1;i<=1;i++){const q=R.top(i*.026,.525-Math.abs(i)*.018);if(q)T.spike(R,q,[i*.4,1,-.85],.08-Math.abs(i)*.016,.016,obs,P.glowD,.7,{bn:'head'})}
    for(let i=0;i<5;i++){const a=-1.2+i/4*2.4,c0=[0,.58,.38],o=[Math.sin(a)*.4,.58+Math.cos(a)*.4,.38],q=R.on(o,[c0[0]-o[0],c0[1]-o[1],0]);
      if(q)R.L(R.add(q.p,q.n,-.01),R.add(q.p,R.nrm([q.n[0]*.8,q.n[1]+.3,-1.1]),.13),.026,.002,'g',P.glowD,4)}
    const q=R.top(0,-.55);if(q)R.L(R.add(q.p,[0,-.01,.02]),R.add(q.p,[0,.07,-.09]),.03,.002,'g',P.glowD,5,{bn:'tail1'})}};
// Ashwolf (its war-wolf armour, gold horn blades and bright glints are gone): the ash wolf itself grows. 1 the ash ruff swells
// round the neck and shoulders · 2 a big shaggy ruff, a deeper chest, hackles rising down the back, a bushier tail · 3 a
// huge ruff round a thick neck and chest, long dark dorsal spines smouldering at the tips (the frame, legs and tail grow with
// the bones, EV38G)
EV38.S.Ashwolf=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,ash=T.mix(P.main,0xc8c4bc,.15),fur=T.fur(T.mix(P.mainD,P.dark,.4),ash);
  T.swell(R,[0,.7,.44],[.18+.035*s,.18+.035*s,.16+.03*s],.02+.026*s,fur,{jag:.9,sweep:[0,.25,-.8],sel:(x,y,z)=>!(z>.62&&y<.78)&&!(z>.5&&y>.79)});
  if(s>=2){T.swell(R,[0,.56,.33],[.13,.13,.12],.012+.012*(s-1),T.fur(P.mainD,P.main),{jag:.4});
    T.crest(R,.36,-.22,s>=3?8:6,t=>(.05+.03*(s-2))*(1-.45*t),.02,i=>i%2?P.dark:P.mainD,(t,q)=>[q.n[0]*.3,1,-.85],s>=3?P.glowD:null,.75)}};
// Direfang (its war-wolf armour and the helmet-like horns are gone): the sabre-tooth grows. 1 a shaggier mane over the
// hump, heavier sabres (they thicken, rooted in the jaw; they never lengthen) · 2 a great mane, bone spurs breaking from the
// hump · 3 a huge black mane, the heaviest sabres, the spurs longer
EV38.S.Direfang=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,ivory=0xd8ccb0,mane=T.fur(P.dark,T.mix(P.mainD,P.dark,.4));
  T.swell(R,[0,.74,.36],[.2+.03*s,.17+.03*s,.17+.03*s],.016+.02*s,mane,{jag:.9,sweep:[0,.25,-.7],sel:(x,y,z)=>!(z>.6&&y<.74)});
  // (round 3 review: the extra fang pieces laid over the kit's sabres read as bamboo pillars; the sabres stay the kit's own)
  if(s>=2)T.crest(R,.36,.0,s>=3?7:5,t=>(.06+.03*(s-2))*(1-.35*t),.02,i=>i%2?P.boneD:P.bone,(t,q)=>[q.n[0]*.3,1,-.7])};
// Skollmaw (the eclipse wolf; the gold circlet, the bright orange fan and the fetters are gone): 0 ember tips in the mane,
// smouldering claws · 1 the mane and the tail grow shaggier, a corona of black spines from the nape · 2 a heavy mane, a long
// shaggy tail, the corona taller · 3 the mane and tail at their fullest, the corona tall and dark with ember tips
EV38.S.Skollmaw=function(E,L,P0,c,s){const G=sk181Glow(c,c&&c.v=='Shadow'),P=Object.assign({},P0,{glow:G.e,glow2:G.g,glowD:G.d}),R=E.raw,T=EV38T,blk=0x141016,fur=T.fur(blk,T.mix(P.mainD,blk,.3));
  ['fl2','fr2','hl2','hr2'].forEach(bn=>{const c0=R.bone(bn);for(let i=-1;i<=1;i++)R.L([c0[0]+i*.018,.024,c0[2]+.078],[c0[0]+i*.019,.004,c0[2]+.112],.006,.001,'g',P.glowD,3,{bn})});
  if(s>=1){T.swell(R,[0,.74,.34],[.18+.03*s,.17+.03*s,.2+.03*s],.012+.016*s,fur,{jag:.9,sweep:[0,.25,-.7],sel:(x,y,z)=>!(z>.6&&y<.76)});
    T.swell(R,[0,.62,-.78],[.1+.01*s,.1+.01*s,.28+.02*s],.01+.012*s,fur,{jag:.9,sweep:[0,0,-.5]});
    const n=[0,7,9,11][s];for(let i=0;i<n;i++){const z=.42-i*(.3/(n-1)),x=(i%2?1:-1)*.02,h=R.top(x,z);if(!h)continue;const ln=(.12+.045*s)*(.75+.25*Math.sin(i/(n-1)*Math.PI));
      T.spike(R,h,[x*4,1,-.6],ln,.02,blk,P.glowD,.8)}}};
['Foxlet','Ashwolf'].forEach(ev38Hook);
// Ashwolf kit (all stages): the upper fang hung below the jaw line, apart from the mouth: shorter, its root in the lip
{const B=LPR.Ashwolf,k0=B.kit;B.kit=function(k){const p0=k.p;k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz){if(bn=='head'&&geo=='cone4'&&col===0xe8e0c8)return p0.call(k,bn,geo,t,col,x,y+.018,z,sx,sy*.55,sz,rx,ry,rz);return p0.apply(k,arguments)};
  try{return k0.apply(this,arguments)}finally{k.p=p0}}}
// Direfang kit (all stages): the pale stacked brow plates read as a plank helmet - they take the mane's dark colour; the
// mouth is a narrow dark seam, not a red slab
{const f=df150Kit;df150Kit=function(k,c,C,red){const p0=k.p,L0=k.L,K=df150Cols(C),dk=K.dark.getHex();
  k.L=function(bn,t,col,a,b){if(bn=='head'&&col===0xa0948a)return k;   // the pale cheek scar read as a stick across the face
    if(bn=='head'&&(col===0xb4a68a||col===0x7a6e5a)&&a&&a[1]>.74){const q=Array.prototype.slice.call(arguments);q[2]=EV38T.mix(dk,col,.3);return L0.apply(k,q)}return L0.apply(k,arguments)};
  k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz){if(bn=='head'&&(geo=='box'||geo=='hem')&&(col===0xb4a68a||col===0x7a6e5a))return p0.call(k,bn,geo,t,EV38T.mix(dk,col,.25),x,y,z,sx,sy,sz,rx,ry,rz);
    if(bn=='jaw'&&geo=='box'&&col===0x3a0e10)return p0.call(k,bn,geo,t,0x160707,x,y,z,sx*.75,sy,sz*.8,rx,ry,rz);return p0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.p=p0;k.L=L0}}}
{const f=df150Cols;df150Cols=function(C){const K=f.apply(this,arguments);K.mouth=new THREE.Color(0x1e0a0a);return K}}
// Skollmaw kit (all stages): the gold corona on the brow read as a hollow eye ring, and the glowing tips in the throat ruff as
// candy corn: the brow eclipse and the ruff tips are gone (the eyes, the claws, the mouth's inner glow stay)
{const f=sk150Kit;sk150Kit=function(k,c,C,red){const p0=k.p,L0=k.L;
  k.L=function(bn,t,col,a,b,r1){if(t=='g'&&(bn=='head'&&r1===.0045||bn=='neck'||bn=='chest'))return k;return L0.apply(k,arguments)};
  k.p=function(bn,geo,t,col,x,y,z,sx,sy){if(bn=='head'&&geo=='sph'&&col===0x040306&&sy===.004)return k;return p0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.p=p0;k.L=L0}}}
// Emberlynx kit: the smouldering seams over the shoulders read as a strap; only the brow mark keeps its glow
// Emberlynx kit (all stages): no glowing strokes on the coat or the brow (the brow mark read as a crown gem), a slim slit
// pupil (the box read as an "H"), the cheek ruff in the coat's own colour (pale slabs read as buck teeth), no ember sparks on
// the ear tips (they read as candles)
{const f=el150Kit;el150Kit=function(k,c,C,red){const L0=k.L,p0=k.p,K=el150Cols(C),cream=K.cream.getHex(),ruff=K.main.clone().lerp(K.cream,.55).getHex(),main=K.main.getHex();
  k.L=function(bn,t,col,a,b,r1){if(t=='g')return k;if(bn=='head'&&(col===cream||col===ruff)&&r1>=.014){const q=Array.prototype.slice.call(arguments);q[2]=EV38T.mix(main,col,.3);return L0.apply(k,q)}return L0.apply(k,arguments)};
  k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz){if(bn=='head'&&geo=='box'&&col===0x000000)return p0.call(k,bn,'sph','c',0x0a0604,x-Math.sign(x)*.002,y,z-.002,.0028,.014,.004,rx,ry,rz);
    if(bn=='head'&&geo=='sph'&&t=='c'&&col===0x15100c&&sx===.028)return p0.call(k,bn,geo,t,col,x,y,z+.001,.0245,.0168,sz,rx,ry,rz);   // a thin dark rim, not a heavy bar over the eye
    return p0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.L=L0;k.p=p0}}}
{const f=el150Post;el150Post=function(x){const n0=x.ears?x.ears.length:0,r=f.apply(this,arguments);
  try{x.ears.slice(n0).forEach(p=>{const m=p.children[0];if(m)m.children.slice().forEach(ch=>{const em=ch.material&&ch.material.emissive;if(em&&em.getHex()===0x8a2a00)m.remove(ch)})})}catch(e){}return r}}

// ===================================================================== Earth =====================================================================
// a crystal cluster rooted in the top at (x,z): a core shard and n-1 shards round it, all sunk into the rock, height h
EV38T.cluster=function(R,x,z,h,n,glow,dark,o){const q=R.top(x,z);if(!q)return;for(let i=0;i<n;i++){const a=i/n*6.283+x*7,r=i?.02+h*.07:0,p=R.add(q.p,[Math.cos(a)*r,0,Math.sin(a)*r]),
    d=R.nrm([q.n[0]*.4+Math.cos(a)*(i?.4:.06),1,q.n[2]*.4+Math.sin(a)*(i?.4:.06)]);R.L(R.add(p,q.n,-.04),R.add(p,d,i?h*(.45+((i*37)%10)/30):h),i?.02+h*.07:.026+h*.09,.003,i%2?'c':'g',i%2?dark:glow,4,o)}};
// Stoneshell: the stone and its crystal grow. 1 a crystal cluster breaks from the shell, stone brow nubs · 2 three crystal
// spires, horns · 3 a great crystal outcrop on the shell with cracks running from it, long swept horns (crystal in dark,
// muted teal; no grass tufts)
EV38.S.Stoneshell=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,moss=0x34501e,moss2=0x2a4218,gl=T.mix(P.glow,0x1a2a2a,.6),dark=0x1a2a28,hb={bn:'head'};
  if(s==1)T.cluster(R,-.1,.04,.12,3,gl,dark);
  if(s>=2){T.cluster(R,.16,-.12,.13+.04*(s-2),4,gl,dark);T.cluster(R,-.2,-.16,.11+.03*(s-2),3,gl,dark)}
  [-1,1].forEach(sd=>R.horn([sd*.05,.36,.5],[sd*.45,.6,-.65],[0,-.03,-.05],[0,.06,.11,.17][s],.026+.004*s,'c',0x4e4c42,5,hb,0x34322a));
  if(s>=3){T.cluster(R,.02,-.03,.2,5,gl,dark);
    for(let k=0;k<6;k++){const a=k/6*6.283+.3;let pr=null;for(let i=1;i<=5;i++){const r=.06+i*.045,w=Math.sin(i*1.7+k)*.05,t=R.top(Math.sin(a+w)*r,Math.cos(a+w)*r-.02);if(!t)break;const q=R.add(t.p,t.n,.003);
      if(pr)R.L(pr,q,.008-i*.0008,.007-i*.0008,'g',T.dim(gl,.7),3,{vs:1});pr=q}}}};
// Cragback: its stone grows. 0 the kit as it is · 1 the ridge blades and flank blades grow taller, the horns larger, a few
// crystals · 2 taller again, a second pair of horns · 3 the tallest ridge, heavy rock horns, the crystals at their biggest
// (one crystal colour, the kit's pale blue muted; no moss or grass among them)
EV38.S.Cragback=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,TT=ER150.CR,top=TT.top,hb={bn:'head'},sb={bn:'spine'},g=1+.22*s,
  stone=T.dim(P.main,.7),st2=T.dim(stone,.72),blade=T.dim(P.main,.5),cry=0x4a6a80,cryD=0x22343e;
  [[.3,.11],[.19,.17],[.07,.22],[-.05,.23],[-.17,.2],[-.29,.15],[-.39,.09]].forEach(([z,h],i)=>{const y=top(0,z),H=h*g;R.p('cone4','c',i%2?blade:st2,[0,y+H*.42-.012,z],[.04*(1+.1*s),H,.1*(1+.1*s)],[-.42,0,(i%2?.06:-.06)],sb)});
  [-1,1].forEach(sd=>[[.18,.17,.08],[.05,.21,.11],[-.08,.2,.11],[-.21,.18,.09],[-.33,.15,.07]].forEach(([z,x,h],i)=>{const y=top(x,z),H=h*g;R.p('cone4','c',i%2?st2:blade,[sd*x,y+H*.38-.01,z],[.03,H,.065],[-.3,0,-sd*.55],sb)}));
  [[.22,.12],[-.24,-.08],[.18,-.27]].slice(0,s).forEach(([x,z])=>T.cluster(R,x,z,.1+.04*s,4,cry,cryD,sb));
  [-1,1].forEach(sd=>T.chain(R,[[sd*.065,.37,.49],[sd*.11,.44+.02*s,.5],[sd*(.14+.02*s),.5+.04*s,.52],[sd*(.13+.02*s),.53+.06*s,.56]],.034+.005*s,.004,'c',stone,hb));
  if(s>=2)[-1,1].forEach(sd=>T.chain(R,[[sd*.085,.33,.52],[sd*(.15+.02*s),.34,.54],[sd*(.19+.03*s),.37,.57]],.026,.003,'c',st2,hb))};
// Cragback kit (all stages): its crystals take one muted blue (the pale cores read busy beside the darker shards)
// and its pale bone horn spurs: the back-swept one poked out between the head and the shell; the other turns stone
{const f=er150CragKit;er150CragKit=function(k,C,red){const L0=k.L;k.L=function(bn,t,col,a,b,r1){if(t=='g'&&col===0x9ad8ff){const q=Array.prototype.slice.call(arguments);q[2]=0x4a6a80;return L0.apply(k,q)}
    if(bn=='head'&&t=='c'&&(col===0x8a8678||col===dkShade(0x8a8678,.8))){if(r1===.02)return k;const q=Array.prototype.slice.call(arguments);q[2]=dkShade(lpMain(C,.12).getHex(),.5);return L0.apply(k,q)}return L0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.L=L0}}}
// Titanshell (the living mountain; the crystal crown, the beads on the horns and the floating rim crystals are gone): the
// mountain itself grows. 0 the crystal veins swell · 1 the peaks rise, the great horns lengthen · 2 higher peaks and longer
// horns, crystal breaking from the cracks · 3 the summit towers, the horns sweep far forward, the crystal veins burn (dimly)
EV38.S.Titanshell=function(E,L,P,c,s){const R=E.raw,T=EV38T,TT=ER150.TI,top=TT.top,sb={bn:'spine'},hb={bn:'head'},
  rock=T.dim(P.main,.72),rockD=T.dim(P.main,.5),xc=0x2e5a62,xcD=0x1a3238,g=1+.2*s,wg=1+.1*s,horn=0x8a8070,horn2=0x6a6254;
  TM186.pk.slice(0,s?5:0).forEach((q,i)=>{const [x,z,w,h,lx,lz,ry]=q,y0=top(x,z)-.03,H=h*g,W=w*wg;R.p('cone4','c',i%2?rockD:rock,[x,y0+H/2,z],[W,H,W*.85],[lz,ry,-lx],sb)});
  TM186.xl.forEach(([x,z,k])=>{const y=top(x,z)-.03,f=k*(1+.25*s);R.pd('oct','c',xc,[x,y+.035*f,z],[x>0?-.2:.2,1,0],[.02*f,.07*f,.02*f],null,sb);R.pd('oct','c',xcD,[x+.02,y+.02*f,z+.01],[x>0?.3:-.3,1,.2],[.018*f,.05*f,.018*f],null,sb)});
  if(s>=1){[-1,1].forEach(sd=>{const H=[[sd*.12,.41,.52],[sd*.2,.44,.47],[sd*.27,.49,.47],[sd*.31,.55,.51],[sd*.3,.6,.57],[sd*.27,.64,.62],[sd*.23,.66,.66],[sd*.19,.665,.7]],n=4+s;
      for(let i=0;i<n;i++)R.L(H[i],H[i+1],Math.max(.006,.052-i*.009)+.002*s,Math.max(.003,.052-(i+1)*.009)+.002*s,'c',T.mix(horn2,0x3a342c,.35+.05*i),7,hb)});
    for(let n=0;n<6;n++){const a=n/6*6.283+.4;let pr=null;for(let i=0;i<4;i++){const r=.25+i*.045,w=Math.sin(i*1.7+n)*.06,t=R.top(Math.sin(a+w)*r,Math.cos(a+w)*r-.02);if(!t)break;const q=R.add(t.p,t.n,.003);
      if(pr)R.L(pr,q,.007-i*.001,.006-i*.001,'g',xcD,3,{vs:1});pr=q}}}};
// Mossfrog (the neon lure, the stick-on horns and spines are gone): the bog toad itself grows. 1 a heavier, wider jaw,
// thicker thighs, warty ridges rising along the back · 2 the jaw and thighs heavier still, the ridges higher, moss mounds ·
// 3 a massive jaw and thighs, high warty ridges with dim glowing glands in them
EV38.S.Mossfrog=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,skin=T.dim(T.mix(P.main,0x4a4a2a,.35),.62),skD=T.dim(skin,.75),wart=T.dim(skin,.6),moss=0x34461e,moss2=0x26341a;
  [-1,1].forEach(sd=>{T.swell(R,[sd*.2,.24,-.17],[.12,.12,.13],.008+.01*s,(x,y,z)=>T.mix(skD,skin,.5*T.hash(x,y,z)),{legs:1});
    T.swell(R,[sd*.11,.46,-.02],[.05+.01*s,.07,.22],.008+.01*s,(x,y,z,k)=>T.mix(skin,wart,k),{jag:.8})});
  if(s>=2)[[.1,-.02,.07],[-.12,.06,.06],[-.06,-.17,.065]].forEach((q,i)=>{const t=R.top(q[0],q[1]);if(!t)return;
    [[0,0,1],[.6,.4,.7],[-.5,.5,.6]].forEach((o,j)=>{const r=q[2]*.5*o[2]*(1+.2*s);R.pd('ico','c',(i+j)%2?moss:moss2,R.add(R.add(t.p,[o[0]*q[2]*.7,0,o[1]*q[2]*.7]),t.n,-.008),t.n,[r,r*.55,r])})});
  if(s>=3)[-1,1].forEach(sd=>[.12,-.02,-.14].forEach(z=>{const t=R.top(sd*.11,z);if(t)R.pd('sph','g',T.mix(P.glowD,skD,.5),R.add(t.p,t.n,-.002),t.n,[.016,.008,.02])}))};
// Bogmaw (the extra lures, the spines and rings are gone; one dim lure, a few mushroom clusters in the kit): the swamp maw
// grows. 0 a few dim pustules · 1 the maw swells wider and heavier, ridges rise along the back · 2 a huge maw, high ridges,
// bony brow horns · 3 the maw at its biggest, the ridges crusted, the horns long
EV38.S.Bogmaw=function(E,L,P,c,s){const R=E.raw,T=EV38T,hb={bn:'head'},skin=T.dim(P.main,.8),skD=T.dim(skin,.65),wart=T.dim(skin,.5);
  if(!s)return;
  T.swell(R,[0,.2,.42],[.4,.1,.17],.014+.017*s,(x,y,z)=>T.mix(skD,skin,.4*T.hash(x,y,z)),{sel:(x,y,z,nx,ny)=>ny<.6&&y<.236});
  [-.14,0,.14].forEach((x,i)=>T.swell(R,[x,.46,-.04],[.05+.01*s,.08,.26],.01+.013*s,(x,y,z,k)=>T.mix(skin,wart,k),{jag:.8}));
  if(s>=2)[-1,1].forEach(sd=>R.horn([sd*.2,.43,.36],[sd*.5,.8,-.3],[0,-.01,-.03],[0,0,.09,.15][s],.022+.004*s,'c',0x3a3428,4,hb,0x24201a))};
['Stoneshell','Mossfrog'].forEach(ev38Hook);
{const f=lpGeo;lpGeo=function(key,n,lofts){if(typeof key=='string'&&key.indexOf('ER150|Titanshell|')==0&&lofts&&lofts[2]&&lofts[2].paint&&!lofts[2].ev38){const p=lofts[2].paint;
    lofts[2]=Object.assign({},lofts[2],{ev38:1,paint:function(o,r,s2){p.apply(this,arguments);if(s2>.5)o.setHex(0x140a08);else o.multiplyScalar(.82)}})}return f.apply(this,arguments)}}
// Stoneshell kit (all stages): the flat moss pads on the shell read as lily pads (the shell's painted moss stays), and the
// bright cyan crystal cluster read as candy: dark teal crystals, a dim core
{const B=LPR.Stoneshell,k0=B.kit;B.kit=function(k,c,C,red){if((RV137.cur.Stoneshell||'Stoneshell')!='Stoneshell')return k0.apply(this,arguments);
  const p0=k.p,L0=k.L;k.p=function(bn,geo,t,col){if(bn=='spine'&&geo=='ico'&&col===0x3e5a2a)return k;return p0.apply(k,arguments)};
  k.L=function(bn,t,col,a,b,r1,r2,sg){if(bn=='spine'&&t=='g'&&col===0x5ae8d0){if(r1===.028&&a&&Math.abs(a[0]-.06)<1e-6)return L0.call(k,bn,'g',0x2a6a5e,a,b,r1*.8,r2,sg);return L0.call(k,bn,'c',0x2e4a46,a,b,r1,r2,sg)}return L0.apply(k,arguments)};
  try{return k0.apply(this,arguments)}finally{k.p=p0;k.L=L0}}}
// Titanshell kit (all stages): the loose stone blocks on the brow and the tusks are gone (they read as buck teeth in a grin);
// the open mouth is dark inside, not pink (lpGeo wrapper)
{const f=er150TitanKit;er150TitanKit=function(k,C,red){const p0=k.p,L0=k.L,hd={0x8a8070:0x5a5244,0x6a6254:0x443e34};
  k.L=function(bn,t,col){if(bn=='head'&&hd[col]){const q=Array.prototype.slice.call(arguments);q[2]=hd[col];return L0.apply(k,q)}return L0.apply(k,arguments)};
  k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz){if(bn=='head'&&geo=='box')return k;if(bn=='head'&&geo=='tor'&&hd[col])return p0.call(k,bn,geo,t,hd[col],x,y,z,sx,sy,sz,rx,ry,rz);
    if(bn=='jaw'&&geo=='cone4'&&col===0xb8ae94)return k;return p0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.p=p0;k.L=L0}}}
// Mossfrog kit (all stages): the eyes looked like coconuts - now a dark eyeball with an amber iris and a black slit pupil under a
// dark lid; the flat tan gland slab beside each eye is gone
{const f=mf186Kit;mf186Kit=function(k,c,C,red){const p0=k.p,K=MF186.cols(C),gl=K.gland.getHex();
  k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz){
    if(bn=='head'&&geo=='sph2'&&t=='c'&&(col===0x6a4a14||col===0x7a2414)){const s=Math.sign(x);
      p0.call(k,bn,geo,t,0x1a1208,x,y-.006,z,sx*.8,sy*.75,sz*.8);p0.call(k,'head','sph2','c',red?0x8a2a10:0x8a5a14,s*.175,.38,.4,.022,.02,.008,0,s*Math.PI/4,0);
      return p0.call(k,'head','sph2','c',0x030303,s*.178,.38,.402,.005,.017,.007,0,s*Math.PI/4,0)}
    if(bn=='head'&&geo=='sph'&&sx===.032&&sz===.008)return k;   // the round eardrum
    if(bn=='head'&&geo=='box'&&col===0x140c0a&&Math.abs(x)>.14)return k;   // the mouth seam's upturned ends (a smile)
    if(bn=='head'&&geo=='sph2'&&t=='c'&&col===0x050505)return k;
    if(bn=='head'&&geo=='sph'&&t=='g'&&sx===.005)return k;
    if(bn=='head'&&geo=='sph2'&&t=='c'&&Math.abs(y-.412)<1e-6)return p0.call(k,bn,geo,t,dkShade(col,.55),x,y-.012,z,sx*1.08,sy*1.25,sz*1.05,rx,ry,rz);   // a heavy lid hooding the eye
    if(bn=='head'&&geo=='sph'&&(col===gl||(sx===.007&&sy===.004)))return k;   // the gland and its pores
    return p0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.p=p0}}}
// Bogmaw kit (all stages): one lure bulb in a dark sickly green; no toadstools, shelf fungi, pale pustules or glowing spore
// dots (they read as a mushroom field and salmon blobs); only the big pair of eyes (six read as bumps)
{const f=er150BogKit;er150BogKit=function(k,C,red){const p0=k.p,L0=k.L;let skip=0,ei=0;
  k.L=function(bn,t,col){if(col===0x9a9078){skip=3;return k}return L0.apply(k,arguments)};
  k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz){if(skip>0){skip--;return k}
    if(bn=='head'&&geo=='sph'&&t=='c'&&col===0x0a0806){ei++;if((ei-1)%3){skip=3;return k}}
    if(t=='g'&&col===0x9aff5a)return k;if(t=='g'&&col===0xc8ff6a){p0.call(k,bn,geo,'c',0x26301a,x,y,z,sx*.92,sy*.92,sz*.92,rx,ry,rz);return p0.call(k,bn,geo,t,red?0x5a1a12:0x3a4a20,x,y-sy*.2,z+sz*.45,sx*.4,sy*.35,sz*.4,rx,ry,rz)}
    if(geo=='hem'&&(col===0x6a5238||col===0x4a3a28))return k;if(geo=='sph'&&(col===0x8a8a50||col===0xb0a860))return k;return p0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.p=p0;k.L=L0}}}

// ===================================================================== Sky =====================================================================
// Batwing (the floating wing claws, the rods through the wings, the belly spikes, the dangling fang strands and the icon eyes are
// gone): the bat grows. Its barrel chest, head and fangs grow with the bones (EV38G) and its ears with the kit's post step,
// and 1 a fuller ruff of fur round the neck · 2 a tall mohawk of fur from the crown down the back · 3 the mohawk at its fullest
// Duskwing (the moon bat) takes its own path: a slimmer, longer-necked bat with longer ears (EV38BASE), its silver mane
// swelling into a great collar
EV38.bat=function(E,L,P,c,s,moon){if(!s)return;const R=E.raw,T=EV38T,hb={bn:'head'},jb={bn:'jaw'},silver=T.mix(P.mainL,0xc8c4d8,.5),dk=moon?T.mix(P.mainD,0x4a4060,.3):P.dark;
  T.swell(R,[0,.37,.28],[.15,.11,.11],(moon?.014:.009)+(moon?.011:.007)*s,T.fur(moon?T.mix(silver,P.mainD,.4):P.mainD,moon?silver:P.mainL),{jag:.4});
  if(!moon&&s>=2){for(let i=0;i<7;i++){const z=.38-i*.075,h=R.top(0,z);if(h)[-1,1].forEach(sd=>R.L(R.add(h.p,[sd*.014,-.008,0]),R.add(h.p,R.nrm([sd*.25,1,-.9]),(.1+.04*(s-2))*(1-i*.09)),.026,.002,'c',i%2?P.mainD:dk,4))}}};
EV38.S.Batwing=function(E,L,P,c,s){EV38.bat(E,L,P,c,s,0)};
EV38.S.Duskwing=function(E,L,P,c,s){EV38.bat(E,L,P,c,s,1)};
// the bat kit (all stages): slit eyes instead of flat glowing boxes; no belly tufts; ears grow with the stage; no claws on the wing tips
{const B=LPR.Batwing,k0=B.kit,p0=B.post;
  B.kit=function(k,c,C,red){const kp=k.p;k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz){if(bn=='head'&&geo=='box'&&t=='c'&&col===0x070506)return kp.call(k,bn,'sph','c',0x1a0e0c,x,y,z,.022,.017,.014,rx,ry,rz);
    if(bn=='head'&&geo=='cone4'&&col===0xece4d0)return kp.call(k,bn,geo,t,0xc8bca0,x,y-.004,z,sx*1.5,sy*1.15,sx*1.5,rx,ry,rz);
    if(bn=='jaw'&&geo=='cone4'&&col===0xece4d0)return kp.call(k,bn,geo,t,0xa89c84,x,y+.008,z-.004,sx,sy*.6,sz,rx,ry,rz);   // the lower fangs poked out under the chin
    if(bn=='head'&&geo=='box'&&t=='g'){const s=Math.sign(x);
      return kp.call(k,'head','sph','g',red?0x8a1a14:col===0xc070ff?0x7a4aa8:0xa02a18,x+s*.002,y,z+.005,.009,.007,.006,rx,ry,rz)}   // a small glinting eye in a dark socket
    return kp.apply(k,arguments)};
  // the pale fluff tufts hanging under the belly read as extra legs
  const kL=k.L;k.L=function(bn,t,col,a,b){if(t=='c'&&(bn=='chest'||bn=='spine')&&a&&b&&a[1]<.2&&b[1]<a[1])return k;return kL.apply(k,arguments)};
  try{return k0.apply(this,arguments)}finally{k.p=kp;k.L=kL}};
  B.post=function(x,c){const n0=x.ears?x.ears.length:0,r=p0.apply(this,arguments);try{const s=ev38StC(c),dusk=rv137('Batwing',c)=='Duskwing',g=1+(dusk?.12:.1)*s;
      if(x.ears)x.ears.forEach(p=>{const m=p.children[0];if(m){m.scale.multiplyScalar(g*(dusk?1.1:1));
        // Duskwing's glowing violet inner ear read as a plastic neon strip: a dim violet
        m.children.forEach(ch=>{const em=ch.material&&ch.material.emissive;if(em&&em.getHex()===0x3a1060){ch.geometry=lpSpikeGeo(0x4a3460,0x24163a,3);ch.material=lpMat(c.v,0,{emissive:0x10061a})}})}})}catch(e){}return r}}
if(EVO100.D.Batwing)EVO100.D.Batwing.wing={grow:.06,claws:false,veins:false};
// the bat wings' evolved copy (evo100Wing): no glowing panels (they read as plastic); its accent stays the body's dark colour
{const f=evo100Wing;evo100Wing=function(geo,L,P,key,o){if(EVO100.D.Batwing&&o===EVO100.D.Batwing.wing)return f.call(this,geo,L,Object.assign({},P,{glow:P.mainD,glowD:P.dark}),key+'|d38',o);return f.apply(this,arguments)}}
// Skyhawk, Stormtalon, Rocsovereign (the breastplates, bibs, runes and arrows on the chest, the crowns, circlets, gems, beak caps,
// bead cords, eye streaks and tail-tip dots are gone): the bird's own feathers grow. 1 a longer crest, hackles on the nape ·
// 2 a full crest, long hackles, a mantle of long feathers over the shoulders, a longer forked tail · 3 everything at its
// biggest. Stormtalon's crest is a storm-swept fan, Rocsovereign's a tall regal plume with a heavy mantle down the back; the
// chest, neck and tail grow with the bones (EV38G).
EV38.bird=function(E,P,s,o){const R=E.raw,T=EV38T,hb={bn:'head'};if(!s||typeof bd184Fth!='function')return;
  // the crest
  const n=1+s;for(let i=-n;i<=n;i++){const q=R.top(i*.014,o.z-Math.abs(i)*.006);if(!q||q.p[1]<o.y-.06)continue;const a=R.add(q.p,q.n,-.012),ln=(o.len+.07*s)*(1-Math.abs(i)*.08),
      b=[a[0]+i*.03,a[1]+ln*o.up,a[2]-ln*.8],d=R.nrm([b[0]-a[0],b[1]-a[1],b[2]-a[2]]);bd184Fth(R,a,d,[i*.2,1,.4],ln,.017,'c',Math.abs(i)%2?P.mainD:P.dark,hb);
}
  // hackles round the back of the neck, lying back over the shoulders
  [o.ny,o.ny-.05,o.ny-.1].slice(0,s).forEach((y,k)=>{for(let i=0;i<9;i++){const a=-1.5+i/8*3,h=R.on([Math.sin(a)*.5,y,o.nz-Math.cos(a)*.5],[-Math.sin(a),0,Math.cos(a)]);
    if(h)bd184Fth(R,R.add(h.p,h.n,-.006),R.nrm([h.n[0]*.6,-.35,-1]),h.n,(.09+.045*s)*(1-k*.12)*(1-Math.abs(a)*.12),.026,'c',(i+k)%2?P.mainD:P.dark,{vs:1})}});
  if(s>=2){// the mantle over the shoulders (two rows of long feathers)
    for(let k=0;k<2;k++)for(let i=0;i<9;i++){const a=-1.25+i/8*2.5,h=R.on([Math.sin(a)*1.5,o.my-k*.05,o.mz+Math.cos(a)*.3-k*.04],[-Math.sin(a),-.2,-.3]);
      if(h)bd184Fth(R,R.add(h.p,h.n,-.006),R.nrm([h.n[0]*.5,-.3-o.drape,-1]),h.n,(.13+.06*(s-2))*(1-k*.15),.032,'c',(i+k)%2?P.mainD:P.dark,{vs:1})}
    // the forked tail: two broad feathers lying along the tail, a little past it
    const tq=R.top(0,o.tz);if(tq)[-1,1].forEach(sd=>{const a=R.add(tq.p,[sd*.03,-.025,0]),d=R.nrm([sd*.16,-.06,-1]);bd184Fth(R,a,d,[sd*.15,1,0],.3+.1*(s-2),.04,'c',P.dark,{bn:'tail1',kind:'lance'});
      bd184Fth(R,R.add(a,[sd*.012,.006,-.02]),R.nrm([sd*.08,-.05,-1]),[sd*.15,1,0],.23+.08*(s-2),.032,'c',P.mainD,{bn:'tail1',kind:'lance'})})}};
EV38.S.Skyhawk=function(E,L,P,c,s){EV38.bird(E,P,s,{y:.92,z:.37,len:.1,up:.55,ny:.85,nz:.3,my:.8,mz:.25,drape:0,tz:-.27})};
EV38.S.Stormtalon=function(E,L,P,c,s){EV38.bird(E,P,s,{y:.92,z:.4,len:.15,up:.35,ny:.84,nz:.3,my:.77,mz:.22,drape:0,tz:-.29})};
EV38.S.Rocsovereign=function(E,L,P,c,s){EV38.bird(E,P,s,{y:.95,z:.36,len:.12,up:.75,ny:.88,nz:.3,my:.8,mz:.2,drape:.4,tz:-.3})};
['Batwing','Skyhawk'].forEach(ev38Hook);
// bird kits (all stages): Rocsovereign's beak was a long pale drooping trunk with a dark tip and a pale nub (the cere) on top -
// now a short, deep, dark raptor hook; Skyhawk's beak is deeper (it read as a wire) and its lower mandible tucked under the hook
// (a pale sliver showed); Stormtalon loses the cyan streak under each eye and its crest is dark feathers with only a thin
// glowing edge (it read as a flat cyan comb)
function ev38Beak(fn,up,lo,col){return function(k){const p0=k.p,L0=k.L;
  k.p=function(bn,geo,t,c0,x,y,z,a,b,cc){if(geo&&geo.userData&&geo.userData.bk186){if(bn=='head')return p0.call(k,bn,bk186Geo(...up),t,col?col(c0):c0,x,y,z,a,b,cc);
      return p0.call(k,bn,bk186Geo(...lo),t,dkShade(c0,.75),x,y+up[2]*.12,z-.004,a,b,cc)}return p0.apply(k,arguments)};
  try{return fn.apply(this,arguments)}finally{k.p=p0;k.L=L0}}}
bd184KitSky=ev38Beak(bd184KitSky,[.095,.04,.058,.046],[.045,.022,.014,0]);
bd184KitSt=(f=>function(k){const L0=k.L;k.L=function(bn,t,col,a,b,r1,r2,sg){if(bn=='head'&&t=='g'&&col===0x9ae8ff){if(r1<=.006)return k;L0.call(k,bn,'c',0x1a2230,a,b,r1,r2,sg);return L0.call(k,bn,'g',0x4a7a90,a,b,.004,.001,3)}return L0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.L=L0}})(ev38Beak(bd184KitSt,[.11,.032,.044,.05],[.05,.018,.012,0]));
bd184KitRs=(f=>function(k){const L0=k.L;k.L=function(bn,t,col,a,b,r1){if(bn=='head'&&t=='c'&&col===0xa88c44&&r1===.056){const q=Array.prototype.slice.call(arguments);q[2]=0x3a2e1e;q[5]=.05;q[6]=.046;return L0.apply(k,q)}return L0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.L=L0}})(ev38Beak(bd184KitRs,[.095,.06,.08,.055],[.045,.034,.02,0],c=>dkShade(c,.5)));

// ===================================================================== Swarm =====================================================================
// Gloomcap (the pile of small pale-stemmed caps, the sideways flank cap and the candy pink are gone): the fungus grows.
// 1 the great cap broadens, darker and ragged at the rim, gills glowing dimly under it; the legs thicken · 2 broader still,
// the body swells with fungal crust, thorns on the legs · 3 a huge ragged cap over the whole back, thick thorny legs
EV38.S.Gloomcap=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,K=FC186.cols(P.C,'Gloomcap'),cap=T.mix(K.capD.getHex(),0x2a1c1c,.35),capR=T.dim(cap,.7),gill=K.gill.getHex();
  const q=R.top(.04,-.05);if(q){const y=q.p[1]-.012+.035,r=.14*(1+.17*s),h=.1*(1+.12*s),c0=[.04,y+.004,-.05],sb={bn:'spine'};
    R.pd('cyl','g',T.mix(P.glowD,gill,.4),[c0[0],y-.002,c0[2]],[0,1,0],[r*.9,.006,r*.9],null,sb);R.pd('cyl','c',gill,[c0[0],y,c0[2]],[0,1,0],[r*.95,.006,r*.95],null,sb);
    R.pd('hem','c',cap,c0,[0,1,0],[r,h,r],null,sb);
    for(let i=0;i<10+2*s;i++){const a=i/(10+2*s)*6.283,l=.03+.02*s*(.5+T.hash(a,s,1));R.L([c0[0]+Math.cos(a)*r*.92,y+.01,c0[2]+Math.sin(a)*r*.92],[c0[0]+Math.cos(a)*(r+l*.6),y-l*.5,c0[2]+Math.sin(a)*(r+l*.6)],.024,.002,'c',capR,3,sb)}}
  if(s>=2)T.swell(R,[0,.4,-.08],[.3,.12,.3],.008+.008*s,(x,y,z)=>T.mix(cap,K.flesh.getHex(),.25*T.hash(x,y,z)),{jag:.8,sel:(x,y,z,nx,ny)=>ny>.2&&z<.12});
  ['hl','hr','fl','fr'].forEach(k=>{const a=R.bone(k+'0'),b=R.bone(k+'1'),m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
    T.swell(R,m,[.12,.12,.12],.006+.005*s,(x,y,z)=>T.mix(K.stalk.getHex(),K.root.getHex(),.4),{legs:1,bone:/^(hl|hr|fl|fr)/});
    if(s>=2)for(let i=0;i<2;i++){const p=[a[0]+(b[0]-a[0])*(.3+.4*i),a[1]+(b[1]-a[1])*(.3+.4*i)+.01,a[2]+(b[2]-a[2])*(.3+.4*i)];R.L(p,R.add(p,[Math.sign(a[0])*.02,.04+.015*(s-2),0]),.012,.001,'c',K.root.getHex(),4,{bn:k+'0'})}})};
// Sporelord (the flat diamonds on the stalks read as map pins: they are swollen spore pods now, in the kit too): the cordyceps
// beast grows. 1 its hump swells with crust and ridges, one more thick stalk · 2 a bigger crusted hump, two more stalks, the
// pods glow faintly · 3 a towering hump, three more stalks
EV38.S.Sporelord=function(E,L,P,c,s){const R=E.raw,T=EV38T,K=FC186.cols(P.C,'Sporelord'),crust=T.mix(K.capD.getHex(),0x1e2218,.3),pod=0x2a3a22,podG=0x2e4a24;
  const stalk=(x,z,ln,lean)=>{const q=R.top(x,z);if(!q)return;const p0=R.add(q.p,q.n,-.03),p1=R.add(q.p,[lean*.04,ln*.4,-.02]),p2=R.add(q.p,[lean*.1,ln*.75,-.07]),p3=R.add(q.p,[lean*.14,ln,-.12]);
    T.chain(R,[p0,p1,p2,p3],.036,.016,'c',T.mix(K.stalk.getHex(),K.club.getHex(),.4),{});R.pd('sph',s>=2?'g':'c',s>=2?podG:pod,R.add(p3,[lean*.01,.025,-.006]),R.nrm([lean*.2,1,-.3]),[.038,.044,.038],null,{at:p0})};
  if(!s)return;
  T.swell(R,[0,.6,-.04],[.3,.22,.3],.01+.012*s,(x,y,z,k)=>T.mix(T.mix(crust,K.ochreD.getHex(),.5*T.hash(x,y,z)),0x0e120c,.45*(1-k)+.2*T.hash(z,x,y)),{jag:.85,sel:(x,y,z,nx,ny)=>ny>0});
  [-1,1].forEach(sd=>T.swell(R,[sd*.11,.66,-.06],[.04,.08,.24],.008+.008*s,(x,y,z)=>crust,{jag:.6}));
  stalk(-.16,-.04,.26+.02*s,-.4);if(s>=2){stalk(.16,-.06,.3,.4);stalk(.06,-.18,.32,.2)}if(s>=3){stalk(-.1,.06,.38,-.3);stalk(0,-.08,.44,0);stalk(-.04,-.26,.32,-.1)}};
// Cryptspider (the candle-crown tips, the strapped-on slats, the hanging fang sticks, the horn fan and the cherry venom drop are
// gone): the crypt spider grows; its abdomen and carapace grow with the bones (EV38G). 1 a row of dark spines down the abdomen
// · 2 bone plates grown flush into it, bone spurs at the knees · 3 the spines and spurs longer, a bone ridge on the carapace
EV38.S.Cryptspider=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,hb={bn:'head'},chit=0x2a2228,plate=T.mix(P.mainD,0x6a5e54,.35);
  T.crest(R,-.12,-.56,[0,4,6,7][s],t=>(.06+.03*(s-1))*(1-.4*Math.abs(t-.35)),.02,i=>i%2?P.dark:chit,(t,q)=>[q.n[0]*.4,1,-.5]);
  if(s>=2){R.shell((x,y,z,nx,ny)=>ny>.35&&Math.abs(x)<.24&&y>.6&&((z<-.18&&z>-.28)||(z<-.36&&z>-.46)),.004,'c',plate,{rimCol:plate});
    [-1,1].forEach(sd=>[0,1,2,3].forEach(i=>{const G=spidLeg(sd,i);R.L(G.p1,R.add(G.p1,[sd*.02,.06+.03*(s-2),-.01]),.016,.002,'c',T.mix(P.boneD,chit,.45),4,{bn:G.k+'1'})}))}
  if(s>=3)T.crest(R,.28,.1,3,t=>.045-.012*t,.02,chit,(t,q)=>[0,.7,-1])};
// Widowqueen (the upright red-tipped comb, the gold crown strands and the shell over her hourglass are gone): the widow grows;
// her abdomen and long front legs grow with the bones (EV38G). 1 rows of black spines swept back along the abdomen, longer
// fangs, red bars branching from her hourglass · 2 longer spines, more red markings, heavier front legs · 3 the longest spines
EV38.S.Widowqueen=function(E,L,P,c,s){const R=E.raw,T=EV38T,jb={bn:'jaw'},blk=0x0c0a0e,red=0x6a1218;
  [-1,1].forEach(sd=>{R.L([sd*.016,.36,.485],[sd*.014,.32-.022*s,.5],.011,.001,'c',0x2a2228,4,jb)});
  if(!s)return;
  // her red marking on top spreads: red bars branch from the hourglass along the abdomen's crown (flush, painted)
  const K=CS150.pal(P.C,'Widowqueen'),rd=K.red.getHex(),AB=CS150.wqAb;[[-.48,.18],[-.76,.16],[-.38,.3],[-.84,.28]].slice(0,s+1).forEach(([z,a],i)=>[-1,1].forEach(sd=>{
    const p0=v150Surf(AB,z,Math.PI/2+sd*a*.4,.003),p1=v150Surf(AB,z+(i%2?-.05:.05),Math.PI/2+sd*a,.003);R.L(p0,p1,.012+.002*s,.006,'c',rd,4,{bn:'tail0'})}));
  [-1,1].forEach(sd=>{for(let i=0;i<6;i++){const z=-.32-i*.09,x=sd*(.15-Math.abs(i-2.5)*.008),h=R.top(x,z);if(h)T.spike(R,h,[h.n[0]*.5,.35,-1],(.1+.045*(s-1))*(i%2?1.12:1),.024,blk)}});
  if(s>=2)['a0','b0'].forEach(k=>{const a=R.bone(k+'0'),b=R.bone(k+'1'),m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];T.swell(R,m,[.16,.16,.16],.006+.006*s,()=>T.mix(P.dark,blk,.5),{legs:1,bone:/^(a0|b0)/})})};
// Hivemother (her crowns, gem and egg sacs are gone; owner: "the abdomen is kind of gross, lets remove those details and add
// some other accents to make her seem more special"): a regal brood queen with her own outline - a long tapered abdomen and
// long elegant forelegs at every stage (EV38BASE), growing with the bones (EV38G). 1 ridged chitin bands round the abdomen, a
// mantle of swept-back spines where it meets the carapace · 2 more bands, a taller mantle, a spined crest down the carapace,
// a longer stinger · 3 the full banded abdomen, the tallest mantle, the mantle tips smouldering amber
EV38.S.Hivemother=function(E,L,P,c,s){const R=E.raw,T=EV38T,tb={bn:'tail0'},AB=HM186.ab,K=HM186.pal(P.C),blk=K.blk.getHex(),gl=K.gloss.getHex();
  if(!s)return;
  const ridge=T.mix(gl,0x5a4434,.5);
  [-.3,-.5,-.7,-.86,-.95].slice(0,1+s).forEach(z=>{const q=v150At(AB,z);T.swell(R,[0,q[1],z],[q[2]+.06,q[3]+.06,.036],.014+.008*s,(x,y,z2,k)=>T.mix(blk,ridge,.15+.75*k*k),{sel:(x,y,z2,nx,ny)=>ny>-.5})});
  // a keel rises along the abdomen's crown (it read as a plain egg)
  T.swell(R,[0,.6+.27,-.62],[.06,.12,.36],.012+.01*s,(x,y,z,k)=>T.mix(blk,ridge,.5*k),{sel:(x,y,z,nx,ny)=>ny>.6});
  const n=5+2*s;for(let i=0;i<n;i++){const a=Math.PI/2+(i/(n-1)-.5)*1.7,p=v150Surf(AB,-.3,a,-.012),nn=[Math.cos(a),Math.sin(a),0],ln=(.08+.04*s)*(1-Math.abs(i/(n-1)-.5)*.6);
    const e=R.add(p,R.nrm([nn[0]*.6,nn[1]*.9+.6,-.7]),ln);R.L(p,e,.022,.002,'c',i%2?blk:ridge,4,tb);if(s>=3)R.L(R.add(p,R.nrm([nn[0]*.6,nn[1]*.9+.6,-.7]),ln*.72),e,.007,.001,'g',P.glowD,3,tb)}
  if(s>=2){T.crest(R,.26,.0,4+s,t=>(.05+.025*(s-2))*(1-.3*t),.016,i=>i%2?blk:gl,(t,q)=>[0,1,-.8]);R.L([0,.54,-1.16],[0,.49,-1.2-.03*s],.016,.002,'c',gl,5,tb)}};
// Widowqueen's colours (all stages): the red joint bands and marks were a flat bright red, the gloss band down her abdomen read
// as plastic: a deep blood red and a duller sheen
{const f=CS150.pal;CS150.pal=function(C,sp){const K=f.apply(this,arguments);if(sp=='Widowqueen'&&K){if(K.red)K.red=K.red.clone().multiplyScalar(.62).lerp(new THREE.Color(0x3a0a0e),.2);if(K.gloss&&K.blk)K.gloss=K.gloss.clone().lerp(K.blk,.5)}return K}}
// Hivemother kit (all stages): her pale amber chevrons read as "7" strokes and the amber stone and crown tips as jewellery:
// the chevrons are painted dark brood-red into the chitin (not glowing), the glowing tips and the stone are gone
{const f=cs150HMKit;cs150HMKit=function(k,C,red){const p0=k.p,L0=k.L,K=HM186.pal(C),mk=EV38T.mix(K.under.getHex(),0x4a1a10,.5);
  k.L=function(bn,t,col,a,b,r1,r2,sg){if(bn=='tail0'&&t=='g')return L0.call(k,bn,'c',mk,a,b,r1*1.15,r2*1.15,sg);if(col===0xd8c8a8)return L0.call(k,bn,t,0x7a6a56,a,b,r1,r2,sg);return L0.apply(k,arguments)};
  k.p=function(bn,geo,t){if(geo=='oct'&&t=='g')return k;if(bn=='chest'&&geo=='cyl')return k;return p0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.p=p0;k.L=L0}}}
// Sporelord kit (all stages): the club at each stalk's end is a swollen dull spore pod, not a flat diamond
// and the row of glowing eyes along the mouth read as a smiley grin: Gloomcap keeps two small dim eyes under its brim,
// Sporelord four in a tight cluster (two pairs, one above the other)
{const f=fc186Kit;fc186Kit=function(k,c,C,red){const p0=k.p,spore=rv137('Gloomcap',c)=='Sporelord';let ei=-1,eg=-1;
  const keep=spore?{1:[-.03,.284,.386],2:[-.052,.266,.378],3:[.052,.266,.378],4:[.03,.284,.386]}:{2:[-.028,.276,.388],3:[.028,.276,.388]};
  k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz){if(spore&&geo=='oct'&&t=='c')return p0.call(k,bn,'sph','c',0x2a3a22,x,y+.006,z,.03,.05,.03);
    if(bn=='head'&&geo=='sph'&&t=='c'&&col===0x080604){ei++;const q=keep[ei];if(!q)return k;return p0.call(k,bn,geo,t,col,q[0],q[1],q[2]-.004,sx*.85,sy*.85,sz)}
    if(bn=='head'&&geo=='sph'&&t=='g'&&sx===.007){eg++;const q=keep[eg];if(!q)return k;return p0.call(k,bn,geo,t,red?0x8a2a1a:spore?0x4a8a70:0x7a9a4a,q[0],q[1],q[2]+.001,.005,.0045,.004)}
    return p0.apply(k,arguments)};
  try{return f.apply(this,arguments)}finally{k.p=p0}}}
['Gloomcap','Cryptspider'].forEach(ev38Hook);
// the fungal crawlers' coat (all stages): Gloomcap's cap rots toward dark brown (it read pink), Sporelord's hide toward dark
// grey-green (it read mint); the paler tops follow
{const f=FC186.cols;FC186.cols=function(C,sp){const K=f.apply(this,arguments),d=new THREE.Color(sp=='Sporelord'?0x262a22:0x34281e),a=sp=='Sporelord'?.4:.35;
  K.cap.lerp(d,a);K.capD=K.cap.clone().multiplyScalar(.55);K.capL=K.cap.clone().lerp(new THREE.Color(0x9a8c74),.25);return K}}

// ===================================================================== Spirit =====================================================================
// Boneling (the mint card heart, the second green lump and the neon streaks are gone; the heart is one faceted dark-green stone):
// the skeleton grows; its skull, jaw, chest and legs grow with the bones (EV38G) so the sockets and nose hole keep their shape.
// 1 longer horns, the vertebrae rise into spines · 2 a second pair of horns, longer spines and a spiked tail · 3 long curling
// horns, the tallest spines, bone blades at the tail tip
EV38.S.Boneling=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,B=boneP,hb={bn:'head'},bone=P.bone,boneD=P.boneD;
  [-1,1].forEach(sd=>R.horn(B([sd*.07,.69,.42]),[sd*.35,.55,-1],s>=3?[sd*.02,-.07,-.02]:[0,-.04,-.03],[0,.15,.2,.26][s],.02+.003*s,'c',boneD,5,hb,bone));
  if(s>=2)[-1,1].forEach(sd=>{const q=R.top(sd*.03,B([0,0,.5])[2]);if(q)R.horn(R.add(q.p,q.n,-.008),[sd*.3,1,-.2],[sd*.02,-.01,-.03],.07+.04*(s-2),.013,'c',bone,4,hb,boneD)});
  {const n=[0,6,8,9][s];for(let i=0;i<n;i++){const z=B([0,0,.235-i*.065])[2],q=R.top(0,z);if(!q)continue;T.spike(R,q,[0,1,-.45],(.065+.03*(s-1))*(1-Math.abs(i-n*.4)/n*.6),.012,i%2?boneD:bone)}}
  if(s>=2){const tb=T.box(E,/^tail/);if(tb)for(let i=0;i<3;i++){const q=R.top(0,tb.mx[2]-.12-i*.16);if(q)T.spike(R,q,[0,1,-.6],.05-.008*i+.02*(s-2),.011,bone)}}
  if(s>=3){const tb=T.box(E,/^tail/);if(tb){const q=R.top(0,tb.mn[2]+.05);if(q)[-1,0,1].forEach(i=>T.spike(R,q,[i*.6,.7,-.6],.07-Math.abs(i)*.015,.012,i?boneD:bone))}}};
// Lichbone (its crown, gold neck trim, rags, cage, phylactery gem and the violet flames at the paws are gone; the ram horns
// curl tight round the ears as a smooth tapering spiral): the lich hound grows; its skull, chest and legs grow with the bones.
// 0 dark soul-fire hanging from the spine into the ribcage · 1 the horns thicken, a longer jaw, more spines down the
// back, more soul-fire · 2 bigger horns, taller spines · 3 the heaviest horns (dark violet throughout)
var LB38={vio:0x3e1c60,vio2:0x5a3480,
  // the ram horn's centre line (template space; boneP maps it): from the side of the skull, back, down round the ear and
  // forward; later stages add the next turns of the spiral
  horn:s=>[[s*.06,.74,.49],[s*.12,.79,.44],[s*.18,.78,.38],[s*.215,.72,.355],[s*.215,.655,.39],[s*.19,.62,.45],[s*.165,.64,.5],[s*.155,.685,.505],[s*.165,.72,.47],[s*.19,.73,.43]],
  hr:[.036,.032,.028,.024,.02,.016,.012,.009,.007,.005],
  // the spiral smoothed (Catmull-Rom through the first n points, 3 steps a span)
  curve(s,n){const H=LB38.horn(s).slice(0,Math.min(10,n)),out=[];for(let i=0;i<H.length-1;i++){const p0=H[Math.max(0,i-1)],p1=H[i],p2=H[i+1],p3=H[Math.min(H.length-1,i+2)];
    for(let k=0;k<3;k++){const t=k/3,t2=t*t,t3=t2*t;out.push([0,1,2].map(a=>.5*((2*p1[a])+(-p0[a]+p2[a])*t+(2*p0[a]-5*p1[a]+4*p2[a]-p3[a])*t2+(-p0[a]+3*p1[a]-3*p2[a]+p3[a])*t3)))}}out.push(H[H.length-1]);return out}};
EV38.S.Lichbone=function(E,L,P,c,s){const R=E.raw,T=EV38T,B=boneP,hb={bn:'head'},K=LB150.cols(P.C),bone=K.bone.getHex(),ivory=0xd8ccb0;
  R.keepGlow=1;const v1=LB38.vio,v2=LB38.vio2;
  // soul-fire hanging from the spine into the ribcage, dark violet, stronger each stage
  for(let i=0;i<2+s;i++){const z=.24-i*.075,t=R.top(0,B([0,0,z])[2]);if(!t)continue;R.L(R.add(t.p,[0,-.03,0]),R.add(t.p,[0,-.1-.025*s,-.01]),.016+.004*s,.002,'g',i%2?v1:v2,4)}
  if(!s)return;
  [-1,1].forEach(sd=>{const H=LB38.curve(sd,7).map(B);for(let i=0;i<H.length-1;i++){const k0=i/(H.length-1),k1=(i+1)/(H.length-1);
    R.L(H[i],H[i+1],.032*(1-k0*.8)+.005*s,.032*(1-k1*.8)+.004*s,'c',i%2?T.dim(K.dark.getHex(),1.2):K.dark.getHex(),6,hb)}});
  R.L(B([0,.598,.68]),B([0,.596,.75+.025*s]),.02,.012,'c',bone,5,{bn:'jaw'});
  T.crest(R,.3,-.3,[0,6,8,10][s],t=>(.06+.04*(s-1))*(1-.4*t),.017,i=>i%2?P.boneD:bone,(t,q)=>[0,1,-.6])};
// Lichbone's robe over the back read as a glossy purple tube: a dark, dull shroud
{const f=LB150.cols;LB150.cols=function(C){const K=f.apply(this,arguments);K.robe=K.robe.clone().lerp(new THREE.Color(0x1c181a),.55);K.robe2=K.robe.clone().multiplyScalar(.7);if(K.trim)K.trim=K.robe.clone().multiplyScalar(1.3);return K}}
{const f=lb150Kit;lb150Kit=function(k,C,red){const p0=k.p,L0=k.L,S0=k.S,K=LB150.cols(C),dark=K.dark.getHex(),dark2=dkShade(dark,1.2),trim=K.trim.getHex(),glow=red?0xff2a2a:K.glow.getHex();
  const hornR=[.034,.03,.026,.021,.015];
  k.S=function(){return k};
  k.p=function(bn,geo,t,col){if(t=='m')return k;if((bn=='head'||bn=='chest')&&geo=='oct'&&t=='g')return k;if(bn=='neck'&&col===trim)return k;
    if(t=='g'&&!red){const a=Array.prototype.slice.call(arguments);a[3]=col===glow?LB38.vio:LB38.vio2;return p0.apply(k,a)}return p0.apply(k,arguments)};
  k.L=function(bn,t,col,a,b,r1){if(t=='m')return k;if(t=='g'&&/^(fl|fr|hl|hr)2$/.test(bn))return k;
    if(bn=='head'&&t=='c'&&(col===dark||col===dark2)&&hornR.indexOf(r1)>=0)return k;
    if(t=='g'&&!/^(head|jaw)$/.test(bn)){const q=Array.prototype.slice.call(arguments);q[1]='c';q[2]=0x2a1a36;return L0.apply(k,q)}   // the glowing spines and tail blade: dark
    if(t=='g'&&!red){const q=Array.prototype.slice.call(arguments);q[2]=col===glow?LB38.vio:LB38.vio2;return L0.apply(k,q)}return L0.apply(k,arguments)};
  try{f.apply(this,arguments)}finally{k.p=p0;k.L=L0;k.S=S0}
  [-1,1].forEach(s=>{const H=LB38.curve(s,7).map(boneP);for(let i=0;i<H.length-1;i++){const k0=i/(H.length-1),k1=(i+1)/(H.length-1);L0.call(k,'head','c',i%2?dark2:dark,H[i],H[i+1],.032*(1-k0*.8),.032*(1-k1*.8),6)}})}}
// Boneling kit (all stages): the ribcage heart is a faceted deep-green stone with a dim core, hung on dark sinews (no neon threads)
{const B=LPR.Boneling,k0=B.kit;B.kit=function(k,c,C,red){if(rv137('Boneling',c)=='Lichbone')return k0.apply(this,arguments);const p0=k.p,L0=k.L;
  k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz){if(bn=='chest'&&geo=='ico'&&t=='g'){if(sx<.03)return k;p0.call(k,bn,'dod','c',0x16301e,x,y,z,sx*.85,sx*1.05,sx*.85,.3,.5,0);return p0.call(k,bn,'oct','g',0x24502e,x,y,z+sx*.5,sx*.35,sx*.45,sx*.35)}return p0.apply(k,arguments)};
  k.L=function(bn,t,col,a,b,r1,r2,sg){if(bn=='chest'&&t=='g'){if(r1<.007)return k;return L0.call(k,bn,'c',0x4a4238,a,b,r1,r2,sg)}return L0.apply(k,arguments)};   // the heart hangs from the spine on a sinew
  try{return k0.apply(this,arguments)}finally{k.p=p0;k.L=L0}}}
// Wispling, Lumenwisp, Soulwarden (the gold hood band, the sunburst and the halo ring, the lanterns, gems, the waist chain, the
// horn through the hood and the pom-pom at the tail are gone): the spirit itself grows, each its own way. All: more and
// longer tattered strands trailing from the robe, the hem shredding further, bigger clawed hands, brighter eyes.
// Wispling: the longest trailing strands. Lumenwisp: the hood's peak rises and a light grows inside the hood. Soulwarden: its
// curved bone horns grow and its bone mantle spreads over the shoulders. Hood size, robe length and arms grow with the bones
// (EV38G); the hood is smaller than before at every stage (it read as chibi).
EV38.spirit=function(E,L,P,c,s,v){const R=E.raw,T=EV38T,hb={bn:'head'};if(!s)return;R.keepGlow=1;
  const base=new THREE.Color(P.C),deep=T.dim(base.clone().lerp(new THREE.Color(v==2?0x0a0a14:0x1a2a3a),v==2?.7:.55).getHex(),.8),pale=base.clone().lerp(new THREE.Color(0xe4ecf0),v==1?.55:.28).getHex(),
    hood=v==1?T.dim(base.clone().lerp(new THREE.Color(0xd8d4c8),.6).getHex(),.85):T.dim(base.clone().lerp(new THREE.Color(0x2a2a34),.72).getHex(),.6),eye=v==1?0xfff0b0:v==2?0x7affd0:0x9ff0ff,claw=0x1a1820;
  // tattered strands from the robe's lower body, trailing down and back
  const n=3+2*s;for(let i=0;i<n;i++){const a=Math.PI+(i/(n-1)-.5)*2.4,y0=.42-(i%2)*.06,h=R.on([Math.sin(a)*.6,y0,Math.cos(a)*.6-.05],[-Math.sin(a),0,-Math.cos(a)]);if(!h||Math.hypot(h.p[0],h.p[2]+.05)>.16)continue;   // on the robe, not on a trailing tendril
    const len=.16+.07*s+(i%3)*.03,p0=R.add(h.p,h.n,-.01),dir=[Math.sin(a)*.25,-1,Math.cos(a)*.5-.35];
    R.loft([{p:p0,r:.022,col:deep,sk:['pelvis','tail0',.5]},{p:R.add(p0,R.nrm(dir),len*.45),r:.016,col:deep,sk:['tail0','tail1',.5]},{p:R.add(p0,R.nrm(dir),len),r:.003,col:T.dim(deep,.7),sk:['tail1','tail2',.5]}],5,'c')}
  // the hem shreds: jagged points round the robe's skirt
  for(let i=0;i<8+3*s;i++){const a=i/(8+3*s)*6.283,h=R.on([Math.sin(a)*.6,.3,Math.cos(a)*.6-.12],[-Math.sin(a),0,-Math.cos(a)]);if(!h||Math.hypot(h.p[0],h.p[2]+.12)>.13)continue;
    R.L(R.add(h.p,h.n,-.024),R.add(h.p,[h.n[0]*.03,-.06-.03*s-(i%2)*.02,h.n[2]*.03-.02]),.024,.001,'c',deep,3)}
  // bigger clawed hands
  [['fl2',-.225],['fr2',.225]].forEach(f=>{const sd=Math.sign(f[1]),bn=f[0];R.pd('sph','g',v==1?0xf0ead8:0xbfeaff,[f[1],.54,.1],[0,1,0],[.036+.006*s,.03+.005*s,.038+.006*s],null,{bn});
    [-1,0,1].forEach(i=>{R.L([f[1]+i*.015,.53,.105],[f[1]+i*.027,.47-.01*s,.127],.012,.004,'g',v==1?0xf0ead8:0xbfeaff,4,{bn});R.L([f[1]+i*.027,.475-.01*s,.126],[f[1]+i*.03,.44-.02*s,.135+.008*s],.007,.001,'c',claw,4,{bn})})});
  // brighter eyes
  [-1,1].forEach(sd=>R.pd('box','g',eye,[sd*.048,1.0,.099],[sd*.3,0,1],[.03+.004*s,.004,.011+.002*s],[0,1,0],hb));
  if(v==1){const a=[0,1.18,-.06],n2=.06+.06*s;T.chain(R,[a,[0,1.2+n2*.5,-.07-n2*.25],[0,1.21+n2,-.1-n2*.5]],.035,.003,'c',hood,hb);
    // light spilling from inside the hood: a warm glow along the inside of the opening's edge, wider each stage
    const rim=[];for(let y=.91;y<=1.11;y+=.02){const ph=Math.min(.95,.95*Math.sqrt(Math.max(0,1-((y-1.0)/.12)**2))),r=wsp137HoodR(1,y)-.006,t=(y-.84)/.38,bz=-.01-.06*t*t;rim.push([Math.sin(ph)*r,y,bz+Math.cos(ph)*r])}
    const pts=rim.concat(rim.slice().reverse().map(p=>[-p[0],p[1],p[2]]));for(let i=0;i<pts.length-1;i++)R.L(pts[i],pts[i+1],.005+.002*s,.005+.002*s,'g',T.mix(0xfff0b0,0x6a5a3a,.35),4,hb)}
  else if(v==2){[-1,1].forEach(sd=>{const H=EV38.swHorn(sd);for(let i=3;i<3+s;i++)R.L(H[i],H[i+1],.026-i*.004,.022-i*.004,'c',i%2?0x6a6052:0x7a7062,5,hb);
      for(let i=0;i<s;i++){const a=sd*(.5+(i+4)*.32);R.pd('hem','c',i%2?0x5a5650:0x6a6660,[Math.sin(a)*.2,.86-i*.01,Math.cos(a)*.17-.01],[0,1,0],[.07,.025,.06],[0,a,-sd*.4],{bn:'chest'})}})}};
// Soulwarden's horn: from the hood's side out, back and curling down (a goat's), its later stages add the next spans
EV38.swHorn=sd=>[[sd*.09,1.1,-.06],[sd*.15,1.17,-.1],[sd*.2,1.2,-.16],[sd*.23,1.18,-.23],[sd*.23,1.13,-.28],[sd*.2,1.08,-.3],[sd*.16,1.06,-.29]];
EV38.S.Wispling=function(E,L,P,c,s){EV38.spirit(E,L,P,c,s,0)};
EV38.S.Lumenwisp=function(E,L,P,c,s){EV38.spirit(E,L,P,c,s,1)};
EV38.S.Soulwarden=function(E,L,P,c,s){EV38.spirit(E,L,P,c,s,2)};
// the spirit kits (all stages): no pom-pom at the tail, no halo ring or lantern (Lumenwisp), no waist chain or soul-gem
// (Soulwarden); the Lumenwisp hood a little darker so its pleats no longer read as a checkerboard
{const B=LPR.Wispling,k0=B.kit;B.kit=function(k,c,C,red){const v=rv137I('Wispling',rv137('Wispling',c)),p0=k.p,L0=k.L;
  k.p=function(bn,geo,t,col,x,y,z,sx,sy,sz,rx,ry,rz){if(bn=='tail3'&&t=='g')return k;if(v==1&&bn=='fr2'&&(t=='m'||col===0xffe8a0))return k;
    if(bn=='head'&&geo=='box'&&t=='c'&&col===0x010204)return p0.call(k,bn,'sph',t,0x020306,x,y,z-.003,sx*.6,sy*.42,sz,rx,ry,rz);   // the dark squares beside the face opening: a small stub behind each eye (it holds the eye to the void)
    // the void reaches further down into the robe's neck: the hood is smaller than the body now (EV38G), and the void must
    // still close the gap between them
    if(bn=='head'&&geo=='sph'&&t=='c'&&col===0x020306&&sx===.115)return p0.call(k,bn,geo,t,col,x,y-.03,z-.006,sx*1.04,sy*1.32,sz,rx,ry,rz);
    if(v==0&&bn=='head'&&t=='g'&&col===0x9ff0ff&&y>1.2)return k;   // the spirit flame on the hood's point (it read as a unicorn horn)
    if(v==2&&bn=='chest'&&geo=='hem'&&(col===0xc8c0b0||col===0xe0d8c8))return p0.call(k,bn,geo,t,col===0xc8c0b0?0x5a5650:0x6a6660,x,y,z,sx,sy,sz,rx,ry,rz);
    if(v==2&&bn=='chest'&&(geo=='oct'||geo=='tor'))return k;if(v==2&&bn=='pelvis'&&t=='m')return k;
    if(v==1&&bn=='head'&&typeof geo!='string'&&t=='c'&&x===0&&sx===1)return p0.call(k,bn,geo,t,dkShade(col,.82),x,y,z,sx,sy,sz,rx,ry,rz);return p0.apply(k,arguments)};
  k.L=function(bn,t,col,a,b){if(v==0&&bn=='head'&&t=='g'&&(col===0x9ff0ff||col===0xffffff)&&a&&a[1]>1.2)return k;
    if(v==2&&bn=='head'&&t=='c'&&(col===0xd0c8b8||col===0xa89a88))return k;   // the thin kit horns (antennae), redrawn below
    if(v==1&&bn=='head'&&t=='g'&&(col===0xfff0b0||col===0xffe080))return k;if(v==1&&bn=='fr2'&&t=='m')return k;if(v==2&&bn=='pelvis'&&t=='m')return k;return L0.apply(k,arguments)};
  const n0=k.P?k.P.length:0;let r;try{r=k0.apply(this,arguments)}finally{k.p=p0;k.L=L0}
  // chain links are pushed straight into the part list (lk180Link): drop Soulwarden's belt and Lumenwisp's lantern chain
  if(k.P&&v)for(let i=k.P.length-1;i>=n0;i--){const q=k.P[i];if(q&&q.t=='m'&&((v==2&&q.bn=='pelvis')||(v==1&&q.bn=='fr2')))k.P.splice(i,1)}
  if(v==2)[-1,1].forEach(sd=>{const H=EV38.swHorn(sd);for(let i=0;i<3;i++)L0.call(k,'head','c',i%2?0x6a6052:0x7a7062,H[i],H[i+1],.03-i*.004,.026-i*.004,5)});
  // Wispling's own outline (the three spirits shared one body): a long ragged hood point that falls back off the crown and
  // trails behind it like a tattered cowl, dark at its tip
  if(v==0){const h=new THREE.Color(C).multiplyScalar(.42).getHex(),h2=dkShade(h,.7),Q=[[0,1.12,-.05],[0,1.19,-.12],[0,1.17,-.21],[0,1.1,-.28],[.01,1.0,-.31]],R0=[.07,.05,.034,.02,.008,.002];
    for(let i=0;i<Q.length-1;i++)L0.call(k,'head','c',i<2?h:h2,Q[i],Q[i+1],R0[i],R0[i+1],6)}
  return r}}
['Boneling','Wispling'].forEach(ev38Hook);

// ---------------- EV38G: the body itself grows at every stage (the Foxlet method; reviewers: "the body almost never grows").
// Each stage scales the creature's own bones: a bigger frame, a heavier chest and neck, thicker legs (their length stays, so
// the feet stay on the ground), a longer, fuller tail or abdomen. The numbers are the WORLD scale each bone should end up with;
// a bone without a rule keeps its parent's. EV38BASE gives some species their own outline at every stage (Duskwing slimmer and
// longer-necked than Batwing, Hivemother's long abdomen and long forelegs). The coat also darkens a little per stage (EV38G.dk).
var EV38G={on:true,dk:.06,
  grp:{Emberlynx:'quad',Ashwolf:'quad',Direfang:'quad',Skollmaw:'quad',Boneling:'quad',Lichbone:'quad',Stoneshell:'shell',Cragback:'shell',Titanshell:'shell',
    Mossfrog:'frog',Bogmaw:'frog',Batwing:'bat',Duskwing:'bat',Skyhawk:'bird',Stormtalon:'bird',Rocsovereign:'bird',Wispling:'spirit',Lumenwisp:'spirit',Soulwarden:'spirit',
    Gloomcap:'fungus',Sporelord:'fungus',Cryptspider:'spider',Widowqueen:'spider',Hivemother:'spider'},
  // [bone pattern, per-stage growth [x,y,z]] - first match wins
  R:{quad:[[/^chest$/,[.1,.09,.07]],[/^neck$/,[.1,.08,.08]],[/^(head|jaw)$/,[.045,.045,.04]],[/^spine$/,[.07,.06,.03]],[/^pelvis$/,[.06,.04,.03]],[/^f[lr]\d/,[.13,0,.13]],[/^h[lr]\d/,[.11,0,.11]],[/^tail/,[.09,.09,.12]]],
    shell:[[/^(spine|chest)$/,[.1,.11,.07]],[/^pelvis$/,[.09,.09,.06]],[/^neck$/,[.08,.08,.07]],[/^(head|jaw)$/,[.06,.06,.06]],[/^[fh][lr]\d/,[.14,0,.14]],[/^tail/,[.06,.06,.08]]],
    frog:[[/^head$/,[.1,.05,.07]],[/^jaw$/,[.13,.07,.09]],[/^spine$/,[.06,.1,.03]],[/^chest$/,[.07,.09,.04]],[/^pelvis$/,[.07,.07,.03]],[/^h[lr]\d/,[.17,0,.17]],[/^f[lr]\d/,[.09,0,.09]]],
    bat:[[/^chest$/,[.1,.1,.06]],[/^neck$/,[.07,.07,.07]],[/^(head|jaw)$/,[.07,.07,.06]],[/^spine$/,[.06,.06,.03]],[/^pelvis$/,[.05,.05,.03]],[/^[fh][lr]\d/,[.09,0,.09]],[/^tail/,[.05,.05,.06]]],
    bird:[[/^chest$/,[.1,.1,.07]],[/^neck$/,[.07,.07,.07]],[/^(head|jaw)$/,[.045,.045,.045]],[/^spine$/,[.07,.07,.04]],[/^pelvis$/,[.06,.05,.04]],[/^h[lr]\d/,[.1,0,.1]],[/^tail/,[.07,.04,.14]]],
    spirit:[[/^chest$/,[.09,.06,.09]],[/^neck$/,[.04,.04,.04]],[/^(head|jaw)$/,[.03,.03,.03]],[/^spine$/,[.07,.06,.07]],[/^pelvis$/,[.07,.04,.07]],[/^f[lr]\d/,[.09,.09,.09]],[/^tail/,[.1,.04,.1]]],
    fungus:[[/^(spine|chest)$/,[.1,.09,.1]],[/^pelvis$/,[.07,.06,.07]],[/^neck$/,[.06,.06,.06]],[/^(head|jaw)$/,[.06,.06,.06]],[/^[fh][lr]\d/,[.07,0,.07]],[/^tail/,[.07,.06,.07]]],
    spider:[[/^tail0$/,[.11,.1,.12]],[/^(chest|spine)$/,[.07,.06,.06]],[/^pelvis$/,[.06,.04,.04]],[/^(neck|head|jaw)$/,[.045,.045,.045]],[/^[ab]0\d$/,[.12,0,.12]]]},   // (the other legs keep their thickness: growth there sheared the bent rear legs apart in the bite)
  // every stage: [bone pattern, [x,y,z] world scale]
  B:{Batwing:[[/^chest$/,[1.2,1.32,.96]],[/^spine$/,[1.14,1.3,.9]],[/^pelvis$/,[1.06,1.16,.96]],[/^(head|jaw)$/,[1.06,1.06,1]]],
    Duskwing:[[/^chest$/,[.96,1.14,1.05]],[/^pelvis$/,[.96,1.08,1]],[/^neck$/,[.98,1.14,1.14]],[/^spine$/,[.94,.96,1.08]],[/^(head|jaw)$/,[.95,.98,1.06]],[/^tail/,[.9,.9,1.15]]],
    Hivemother:[[/^tail0$/,[.86,.86,1.24]],[/^[ab]0\d$/,[1.18,1,1.18]],[/^(head|jaw)$/,[1.04,1.04,1.04]]],
    Wispling:[[/^(head|jaw)$/,[.88,.88,.88]]],Lumenwisp:[[/^(head|jaw)$/,[.88,.88,.88]]],Soulwarden:[[/^(head|jaw)$/,[.9,.9,.9]]]},
  // every stage: a colour multiplier on the whole coat (reviewers: Lumenwisp cream and pale blue, Soulwarden periwinkle,
  // Gloomcap pink-mauve and Sporelord mint read as candy): darker, less saturated
  T:{Lumenwisp:[.6,.58,.52],Soulwarden:[.52,.5,.48],Wispling:[.82,.82,.8],Gloomcap:[.78,.8,.7],Sporelord:[.78,.72,.72]},
  mc:{}};
function ev38Grow(g,c,n){const sp=c&&c.g&&c.g[0],gr=EV38G.grp[sp],S=SPEC[n];if(!EV38G.on||!gr||!S||c.en)return;
  const s=ev38StC(c),body=g.b.children.find(m=>m.isSkinnedMesh&&m.skeleton);if(!body)return;
  const O=Object.keys(S.bones),Rs=EV38G.R[gr],Bs=EV38G.B[sp]||[],W={},BS=[];
  O.forEach((k,i)=>{const pa=S.bones[k][0],pw=pa&&W[pa]||[1,1,1],r=Rs.find(q=>q[0].test(k)),b=Bs.find(q=>q[0].test(k));
    let d=r?r[1].map(v=>1+v*s):pw.slice();if(b)d=d.map((v,j)=>v*b[1][j]);W[k]=d;const bn=body.skeleton.bones[i];if(bn){bn.scale.set(d[0]/pw[0],d[1]/pw[1],d[2]/pw[2]);if(Math.abs(bn.scale.x-1)+Math.abs(bn.scale.y-1)+Math.abs(bn.scale.z-1)>1e-4)BS.push([bn,bn.scale.clone()])}});
  // the animation sets some bone scales outright each frame (the chest breathing, Hivemother's abdomen pulse): the growth is
  // applied on top of whatever it sets, every frame
  if(BS.length&&g.rig){const r0=g.rig;g.rig=function(){BS.forEach(q=>q[0].scale.set(1,1,1));const r=r0.apply(this,arguments);BS.forEach(q=>q[0].scale.multiply(q[1]));return r}}
  // the paint darkens per stage (glowing parts keep their colour)
  const Tm=EV38G.T[sp];if(!s&&!Tm)return;const kk=1-EV38G.dk*s,gd=LP186&&LP186.grade&&LP186.grade[sp],tint=gd&&gd[2]!=null?new THREE.Color(gd[2]):null;
  g.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material)||o.material.isMeshBasicMaterial)return;const m=o.material,key=m.uuid+'|'+sp+'|'+s;
    let m2=EV38G.mc[key];if(!m2){m2=EV38G.mc[key]=m.clone();m2.onBeforeCompile=m.onBeforeCompile;m2.color.multiplyScalar(kk);if(Tm){const tc=new THREE.Color(Tm[0],Tm[1],Tm[2]);m2.color.multiply(tc);if(m2.emissive)m2.emissive.multiply(tc)}
      if(tint&&s)m2.color.lerp(tint.clone().multiplyScalar(2.2),.05*s)}o.material=m2})}
{const f=lpRig;lpRig=function(c,n,D){const g=f.apply(this,arguments);if(g&&EV38.skip.indexOf(n)<0)try{ev38Grow(g,c,n)}catch(e){console.error('ev38Grow',n,e)}return g}}
