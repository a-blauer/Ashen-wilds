// ================= v186: every companion grows grander with each evolution (owner, Nov 1 2026) =================
// Owner: "It also seems the evolution physical appearance upgrade was lost on many companions. Evolutions should be like
// foxlet- they become a cooler, more upgraded version of themself visually with each evolution."
// The Foxlet is the model: at each stage the creature itself grows (more tails, a fur crest, a harness and chest plate,
// flame tips, a gold circlet, a spirit-flame mane), so its outline gets bigger and grander, in its own theme.
// Two rounds of clutter cuts (EVO186 in 3430, the removals in 3431) left many companions with almost the same look at
// every stage. Here each species gets a clear step at every stage it can show (stage 0 = not evolved, 3 = the last):
// horns, crests, spines, tails and fins that grow longer and more numerous, armour or regalia shaped to the body, bone
// and crystal growths, glowing veins and eyes that burn brighter, and one crowning feature at the last stage.
// Still no dangling charms, nothing floating, no cuffs on the legs, no rune stickers, no candy colours.
// How: the evolution kit E gets a second kit E.raw without the EVO186 limits (its parts are baked with E's); a species
// design here draws with it and keeps its own restraint. Designs are written per stage, not per level: a species only ever
// shows four of the five levels (tier 1-2: 0 1 2 4, tier 3-4: 1 2 3 5, tier 5: 2 3 4 5; evo100Lv in 1710).
var EV38={on:true};
// the stage (0-3) a level shows for a species
function ev38St(L,sp){const t=typeof tierSp=='function'?tierSp(sp):1,V=t<=2?[0,1,2,4]:t<=4?[1,2,3,5]:[2,3,4,5];let s=0;V.forEach((v,i)=>{if(L>=v)s=i});return s}
{const f=evo100Kit;evo100Kit=function(n,L,P,seed){const E=f.apply(this,arguments);if(!EV38.on||typeof EVO186=='undefined')return E;
  const o=EVO186.on;EVO186.on=false;try{E.raw=f.call(this,n,L,P,(seed|0)+386)}finally{EVO186.on=o}return E}}
{const f=evo100Bake;evo100Bake=function(E){if(E&&E.raw&&E.raw.parts.length){E.raw.parts.forEach(q=>{if(q.j!=null)q.j=0;E.parts.push(q)});E.raw.parts.length=0}return f.apply(this,arguments)}}
// ---------------------------------------------------------------- shared tools (positions in the rig's model space) ----------------------------------------------------------------
var EV38T={
  // box of the body vertices whose main bone matches re: {mn,mx,c}
  box(E,re){const S=E.S,P=S.P,SI=S.SI,SW=S.SW,O=S.O,mn=[9,9,9],mx=[-9,-9,-9],c=[0,0,0];let n=0;
    for(let v=0;v<P.length/3;v++){let bi=0;for(let k=1;k<4;k++)if(SW[v*4+k]>SW[v*4+bi])bi=k;if(!re.test(O[SI[v*4+bi]]||''))continue;n++;
      for(let k=0;k<3;k++){const x=P[v*3+k];if(x<mn[k])mn[k]=x;if(x>mx[k])mx[k]=x;c[k]+=x}}
    return n?{mn,mx,c:c.map(x=>x/n),n}:null},
  // a spike / horn / fin from a root sunk into the body at hit h, along d, length ln, base radius r; tip in glow from tk (0-1)
  spike(R,h,d,ln,r,col,tipCol,tk,o,seg){const a=R.add(h.p,h.n,-r*.7),D=R.nrm(d),b=R.add(h.p,D,ln);o=Object.assign({at:a},o);
    if(tipCol!=null&&tk!=null&&tk<1){const m=R.add(h.p,D,ln*tk);R.L(a,m,r,r*(1-tk)+.002,'c',col,seg||4,o);R.L(m,b,r*(1-tk)+.002,.001,'g',tipCol,seg||4,o)}
    else R.L(a,b,r,.001,'c',col,seg||4,o);return b},
  // curved horn from a root sunk at hit h: dir, bend, length, radius, colour, glowing tip colour (last quarter)
  horn(R,h,dir,bend,len,r,col,tipCol,o){const base=R.add(h.p,h.n,-r*.8);return R.horn(base,dir,bend,len,r,'c',col,5,o,tipCol)},
  // points along the top line at x from z0 to z1 (n points)
  top(R,x,z0,z1,n){const out=[];for(let i=0;i<n;i++){const z=z0+(z1-z0)*(n>1?i/(n-1):0),h=R.top(typeof x=='function'?x(i):x,z);if(h)out.push(h)}return out},
  // flank hit at side s, height y, z
  side(R,s,y,z){return R.on([s*3,y,z],[-s,0,0])},
  // a glowing vein laid on the surface through flank points [[y,z],…] on side s
  vein(R,s,yz,r,col,lift){let pr=null;yz.forEach(q=>{const h=R.on([s*3,q[0],q[1]],[-s,0,0]);if(!h){pr=null;return}const p=R.add(h.p,h.n,lift==null?.003:lift);if(pr)R.L(pr,p,r,r,'g',col,3,{vs:1});pr=p})},
  // a vein over the top through [[x,z],…]
  veinT(R,xz,r,col,lift){let pr=null;xz.forEach(q=>{const h=R.top(q[0],q[1]);if(!h){pr=null;return}const p=R.add(h.p,h.n,lift==null?.003:lift);if(pr)R.L(pr,p,r,r,'g',col,3,{vs:1});pr=p})},
  // a fur tuft (tapered cone) from hit h
  tuft(R,h,dir,len,r,col,t){const d=R.nrm([h.n[0]+dir[0],h.n[1]+dir[1],h.n[2]+dir[2]]);return R.L(R.add(h.p,h.n,-r*.6),R.add(h.p,d,len),r,.002,t||'c',col,4)},
  mix(a,b,t){return new THREE.Color(a).lerp(new THREE.Color(b),t).getHex()},
  dim(a,k){return new THREE.Color(a).multiplyScalar(k).getHex()}};
// is the body point p on a leg (its nearest vertex mainly on a leg bone)?
EV38T.onLeg=function(R,p){const k=evo100Skin(R.S,p);return /^(fl|fr|hl|hr|a\d|b\d)/.test(R.S.O[k[4]>=k[5]?k[0]:k[1]]||'')};
// an armour / growth shell that never spreads onto the legs, in one colour
EV38T.shell=function(R,sel,off,t,col,o){return R.shell((x,y,z,nx,ny,nz)=>sel(x,y,z,nx,ny,nz)&&!EV38T.onLeg(R,[x,y,z]),off,t,col,o)};
// a row of spikes along the top line from z0 to z1: n spikes, height h(t) (t 0..1 along the row), base radius r
EV38T.crest=function(R,z0,z1,n,h,r,col,dir,tipCol,tk,x){for(let i=0;i<n;i++){const t=n>1?i/(n-1):0,z=z0+(z1-z0)*t,xx=x==null?0:(typeof x=='function'?x(i):x),q=R.top(xx,z);if(!q)continue;
  const d=dir?dir(t,q):[q.n[0]*.4,1,-.9];EV38T.spike(R,q,d,h(t),typeof r=='function'?r(t):r,typeof col=='function'?col(i):col,tipCol,tk)}};
// the companion's species while its rig is built
function ev38Sp(rig){return (typeof RV137!='undefined'&&RV137.cur[rig])||rig}
EV38.S={};
function ev38Hook(rig){const D=EVO100.D[rig];if(!D)return;const b0=D.build;
  D.build=function(E,L,P,c){const sp=ev38Sp(rig),f=EV38.on&&E.raw&&EV38.S[sp];if(!f)return b0.apply(this,arguments);return f.call(this,E,L,P,c,ev38St(L,sp),b0)}}

// ===================================================================== Beasts =====================================================================
// Emberlynx (was a collar, runes, a harness and a circlet on a bare lynx): the lynx itself catches fire, stage by stage.
// 1 a crest of dark fur spikes down the nape, the bobtail bushes into a black plume · 2 a great cheek-and-neck mane, the crest
// runs down the back with ember tips, smouldering seams on the flanks · 3 a crown of obsidian spikes on the brow, the mane
// and the tail burn
EV38.S.Emberlynx=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,blk=0x1a1210,obs=0x221a1a;
  const n=[0,5,7,9][s],z1=[0,.22,.04,-.14][s];
  T.crest(R,.43,z1,n,t=>(.04+.018*s)*(1-.45*Math.abs(t-.25)),.017,i=>i%2?blk:P.mainD,(t,q)=>[q.n[0]*.3,1,-1.1],s>=2?P.glowD:null,.62);
  // the bobtail plume
  [-.47,-.51,-.545].forEach((z,i)=>{const q=R.top((i-1)*.012,z);if(q)T.tuft(R,q,[(i-1)*.3,-.2,-1.4],.06+.025*s-i*.008,.026,i%2?blk:P.mainD)});
  if(s>=2){// the mane round the neck and cheeks, sweeping back
    for(let i=0;i<13;i++){const a=-1.9+i/12*3.8,c0=[0,.565,.4],o=[Math.sin(a)*.4,.565+Math.cos(a)*.4,.4],q=R.on(o,[c0[0]-o[0],c0[1]-o[1],0]);
      if(q)T.tuft(R,q,[Math.sin(a)*.3,Math.cos(a)*.2-.1,-1.3],.085+.035*(s-2)+(i%2)*.02,.03,i%2?P.mainD:P.main)}
    [-1,1].forEach(sd=>T.vein(R,sd,s>=3?[[.53,.2],[.5,.13],[.53,.06],[.49,-.02],[.52,-.1],[.49,-.18]]:[[.52,.16],[.49,.08],[.52,0],[.48,-.08]],.006,P.glowD))}
  if(s>=3){// the obsidian brow crown, the mane and the tail aflame
    for(let i=-2;i<=2;i++){const q=R.top(i*.024,.525-Math.abs(i)*.018);if(q)T.spike(R,q,[i*.4,1,-.85],.085-Math.abs(i)*.014,.016,obs,P.glow,.66,{bn:'head'})}
    for(let i=0;i<7;i++){const a=-1.5+i/6*3,c0=[0,.565,.38],o=[Math.sin(a)*.4,.565+Math.cos(a)*.4,.38],q=R.on(o,[c0[0]-o[0],c0[1]-o[1],0]);
      if(q)R.L(R.add(q.p,q.n,-.01),R.add(q.p,R.nrm([q.n[0]*.8,q.n[1]+.3,-1.1]),.15+(i%2)*.04),.03,.002,'g',i%2?P.glow:P.glow2,4)}
    const q=R.top(0,-.55);if(q){R.L(R.add(q.p,[0,-.01,.02]),R.add(q.p,[0,.09,-.1]),.035,.002,'g',P.glow,5,{bn:'tail1'});R.L(R.add(q.p,[0,-.01,.01]),R.add(q.p,[0,.05,-.13]),.022,.001,'g',P.glow2,4,{bn:'tail1'})}}};
// Ashwolf keeps its war-wolf (ruff, hackles, lames, horned brow helm) and grows with it: 2 a bushy crest of dark fur down the
// tail · 3 a ridge of black spines with ember tips down the back, the tail crest smoulders
EV38.S.Ashwolf=function(E,L,P,c,s,b0){b0.apply(this,arguments);const R=E.raw,T=EV38T,tb=T.box(E,/^tail/);if(!tb||s<2)return;
  const z0=tb.mx[2]-.06,z1=tb.mn[2]+.12;for(let i=0;i<5;i++){const z=z0+(z1-z0)*i/4,q=R.top(0,z);if(q)T.tuft(R,q,[0,.4,-1.4],.07+.02*(s-2)-i*.006,.03,i%2?P.dark:P.mainD)}
  if(s>=3){const W=wolfP;T.crest(R,W([0,0,.1])[2],W([0,0,-.24])[2],6,t=>.075-.025*t,.02,P.dark,(t,q)=>[q.n[0]*.3,1,-.8],P.glow,.72);
    const q=R.top(0,z1-.04);if(q)R.L(R.add(q.p,q.n,-.01),R.add(q.p,[0,.06,-.1]),.03,.002,'g',P.glowD,4)}};
// Direfang (was the war-wolf's armour on a sabre-tooth): primal bone grows out of it. 1 bone spurs over the shoulder hump ·
// 2 the spurs run to the hips, rows of bone spikes break out of the mane over the shoulders · 3 great curling horns from the
// bone brow plate, the shoulder spikes longer, the spurs blood-tipped
EV38.S.Direfang=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,hd=T.box(E,/^head$/),bone=P.bone,boneD=P.boneD;
  const zA=hd?hd.mn[2]-.04:.5,zB=-.24,n=[0,5,8,9][s],zE=s==1?zA-(zA-zB)*.45:zB;
  T.crest(R,zA,zE,n,t=>(.08+.02*s)*(1-.4*t),.022,i=>i%2?boneD:bone,(t,q)=>[q.n[0]*.3,1,-.7],s>=3?P.glowD:null,.75);
  if(s>=2){[-1,1].forEach(sd=>{
    [[.77,.27],[.74,.17],[.72,.07]].forEach((q,i)=>{const h=T.side(R,sd,q[0],q[1]);if(h)T.spike(R,h,[sd,.9,-.5],.07+.025*(s-2)-i*.012,.022,i%2?boneD:bone)})})}
  if(s>=3){if(hd){const zb=hd.mn[2]+(hd.mx[2]-hd.mn[2])*.22;[-1,1].forEach(sd=>{const q=R.top(sd*.07,zb);if(q)T.horn(R,q,[sd*.55,.75,-.45],[sd*.02,-.12,-.1],.24,.034,bone,boneD,{bn:'head'})})}
  }};
// Skollmaw (the eclipse wolf): the sun he swallowed burns out through him. 0 ember tips through the mane, glowing claws ·
// 1 a corona of black spines with glowing tips from the nape · 2 the corona taller, black spines down the back, a crown of
// gold rays round the brow eclipse · 3 the corona aflame, burning eye trails, a burning tail tip (no fetters: they read as
// cuffs on the legs; no eclipse discs on the haunches)
EV38.S.Skollmaw=function(E,L,P0,c,s){const G=sk181Glow(c,c&&c.v=='Shadow'),P=Object.assign({},P0,{glow:G.e,glow2:G.g,glowD:G.d}),R=E.raw,T=EV38T,blk=0x141016;
  const spike=(h,d,ln,r,t,col,sink)=>{const a=R.add(h.p,h.n,-(sink||.012)),D=R.nrm(d);R.L(a,R.add(h.p,D,ln),r,.002,t,col,4,{at:a});return D};
  for(let i=0;i<8;i++){const z=.44-i*.045,h=R.top((i%2?1:-1)*.03,z);if(h)spike(h,[0,.25,-1.3],.11+.012*s,.022,'g',i%2?P.glow:P.glow2)}
  ['fl2','fr2','hl2','hr2'].forEach(bn=>{const c0=R.bone(bn);for(let i=-1;i<=1;i++)R.L([c0[0]+i*.018,.024,c0[2]+.078],[c0[0]+i*.019,.004,c0[2]+.112],.006,.001,'g',P.glow,3,{bn})});
  if(s>=1){const n=[0,7,9,11][s];for(let i=0;i<n;i++){const z=.42-i*(.3/(n-1)),x=(i%2?1:-1)*.02,h=R.top(x,z);if(!h)continue;const ln=(.13+.045*s)*(.75+.25*Math.sin(i/(n-1)*Math.PI)),D=spike(h,[x*4,1,-.55],ln,.02,'c',blk);
    R.L(R.add(h.p,D,ln*.6),R.add(h.p,D,ln*1.01),.009,.001,'g',P.glow2,3,{at:R.add(h.p,h.n,-.012)});if(s>=3&&i%2==0)spike(h,[x*4,1,-.7],ln*1.12,.03,'g',P.glow,.01)}}
  if(s>=2){T.crest(R,.08,-.3,5,t=>.07-.02*t,.016,blk,(t,q)=>[q.n[0]*.3,1,-.8],P.glow2,.8);
    for(let i=0;i<11;i++){const a=i/11*Math.PI*2,dx=Math.cos(a),dz=Math.sin(a),q=R.top(dx*.04,.6+dz*.04);if(q)R.L(R.add(q.p,q.n,-.002),R.add(q.p,R.nrm([dx,.3,dz]),.035+(i%2?0:.018)),.007,.001,'m',P.gold,3,{vs:1})}}
  if(s>=3){[-1,1].forEach(sd=>{const h=R.on([sd*.5,.73,.625],[-sd,0,0]);if(h)R.L(R.add(h.p,h.n,.002),R.add(h.p,[sd*.03,.012,-.13]),.01,.001,'g',P.glow2,3,{bn:'head'})});
    R.L([0,.49,-1.0],[0,.55,-1.14],.034,.002,'g',P.glow,5,{bn:'tail3'});R.L([0,.49,-1.01],[0,.57,-1.1],.02,.001,'g',P.glow2,4,{bn:'tail3'})}};
// ===================================================================== Earth =====================================================================
// a crystal cluster grown out of the top at (x,z): a glowing core shard and n-1 dark shards round it, height h
EV38T.cluster=function(R,x,z,h,n,glow,dark,o){const q=R.top(x,z);if(!q)return;for(let i=0;i<n;i++){const a=i/n*6.283+x*7,r=i?.022+h*.08:0,p=R.add(q.p,[Math.cos(a)*r,0,Math.sin(a)*r]),
    d=R.nrm([q.n[0]*.4+Math.cos(a)*(i?.45:.06),1,q.n[2]*.4+Math.sin(a)*(i?.45:.06)]);R.L(R.add(p,q.n,-.025),R.add(p,d,i?h*(.45+((i*37)%10)/30):h),i?.02+h*.06:.026+h*.08,.003,i%2?'c':'g',i%2?dark:glow,4,o)}};
// a ring of stone spikes round a shell rim: rays in from a ring (radius rx, rz, centre z cz) at height y, kept where the hit's height is in [y0,y1]
EV38T.rim=function(R,n,rx,rz,cz,y,y0,y1,len,r,col,col2,skip){for(let i=0;i<n;i++){const a=i/n*6.283+.15;if(skip&&skip(a))continue;const h=R.on([Math.sin(a)*rx,y,Math.cos(a)*rz+cz],[-Math.sin(a),0,-Math.cos(a)]);
    if(h&&h.p[1]>y0&&h.p[1]<y1)EV38T.spike(R,h,[h.n[0],.7,h.n[2]],len,r,i%2?col:col2)}};
// Stoneshell (was moss, runes on the rim and a little shrine): the stone and crystal grow. 1 moss, a crystal cluster, stone brow
// nubs · 2 three crystal spires, a ring of stone spikes round the rim, horns · 3 a great crystal crown on the shell with
// glowing cracks running down from it, long swept horns with glowing tips, taller rim spikes
EV38.S.Stoneshell=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,moss=0x3a5a22,moss2=0x2e4a1c,stone=P.mainD,dark=0x24423e,hb={bn:'head'};
  [[.15,.1],[-.18,-.05],[.05,-.25],[-.08,.22],[.22,-.18]].slice(0,s>=2?5:3).forEach((q,i)=>{const t=R.top(q[0],q[1]);if(!t)return;R.pd('ico','c',i%2?moss:moss2,R.add(t.p,t.n,-.005),t.n,[.07,.02,.06]);
    for(let k=0;k<3;k++){const a=k*2.1+i;R.L(t.p,R.add(t.p,R.nrm([t.n[0]+Math.cos(a)*.6,1,t.n[2]+Math.sin(a)*.6]),.05+.012*s),.012,.002,'c',0x4a7a32,3)}});
  if(s==1)T.cluster(R,-.1,.04,.12,3,P.glow,dark);
  if(s>=2){T.cluster(R,.16,-.12,.13+.04*(s-2),4,P.glow,dark);T.cluster(R,-.2,-.16,.11+.03*(s-2),3,P.glow,dark);
    T.rim(R,12,.8,.9,-.02,.24,.14,.34,.05+.03*(s-2),.026,stone,P.main,a=>Math.abs(Math.cos(a))>.93)}
  [-1,1].forEach(sd=>{const q={p:[sd*.05,.37,.5],n:[sd*.3,.9,.2]},len=[0,.06,.11,.17][s];
    T.horn(R,q,[sd*.45,.6,-.65],[0,-.03,-.05],len,.026+.004*s,0x6a685c,s>=3?P.glow:0x4a483e,hb)});
  if(s>=3){T.cluster(R,0,-.02,.3,7,P.glow,dark);T.cluster(R,.03,.1,.16,3,P.glow,dark);
    for(let k=0;k<7;k++){const a=k/7*6.283+.3;let pr=null;for(let i=1;i<=6;i++){const r=.06+i*.045,w=Math.sin(i*1.7+k)*.05,t=R.top(Math.sin(a+w)*r,Math.cos(a+w)*r-.02);if(!t)break;const q=R.add(t.p,t.n,.004);
      if(pr)R.L(pr,q,.009-i*.0008,.008-i*.0008,'g',i<3?P.glow:P.glowD,3,{vs:1});pr=q}}}};
// Cragback (was moss and a rune rim, hardly changing): the ridge and its crystals grow. 0 moss in the crevices · 1 glowing
// crystal shards between the ridge blades, a pair of stone horns · 2 more and taller crystals, a second, lower pair of horns,
// a ring of stone spikes round the rim · 3 a crystal crown on the brow, crystal spires along the ridge, glowing cracks at
// its foot, the horns longer with glowing tips
EV38.S.Cragback=function(E,L,P,c,s){const R=E.raw,T=EV38T,moss=0x3a5a22,moss2=0x2e4a1c,hb={bn:'head'},dark=0x2a3a4a;
  [[.15,.2],[-.16,.05],[.1,-.18],[-.08,-.32],[.25,-.06]].slice(0,s>=1?5:3).forEach((q,i)=>{const t=R.top(q[0],q[1]);if(!t)return;R.pd('ico','c',i%2?moss:moss2,R.add(t.p,t.n,-.004),t.n,[.06,.018,.05]);
    for(let j=0;j<3;j++){const a=j*2.1+i;R.L(t.p,R.add(t.p,R.nrm([t.n[0]+Math.cos(a)*.6,1,t.n[2]+Math.sin(a)*.6]),.04+.01*s),.01,.002,'c',0x4a7a32,3)}});
  if(s>=1){const xl=[[.07,.1],[-.07,-.04],[.07,-.17],[-.07,.22],[.07,-.3]].slice(0,[0,3,5,5][s]);xl.forEach((q,i)=>T.cluster(R,q[0],q[1],[0,.08,.12,.17][s]*(1-.1*i),3,P.glow,dark))}
  if(s>=1)[-1,1].forEach(sd=>T.horn(R,{p:[sd*.05,.39,.53],n:[sd*.3,.9,.2]},[sd*.3,.7,-.6],[0,-.02,-.03],[0,.08,.12,.17][s],.024,0x8a8678,s>=3?P.glow:0x5a5850,hb));
  if(s>=2){[-1,1].forEach(sd=>T.horn(R,{p:[sd*.085,.33,.52],n:[sd,.2,.2]},[sd*.9,.25,-.3],[0,.02,-.04],.06+.03*(s-2),.02,0x7a766a,0x4a483e,hb));
    T.rim(R,12,.8,.9,-.04,.2,.12,.3,.05+.03*(s-2),.024,P.mainD,0x5a5850,a=>Math.abs(Math.cos(a))>.93)}
  if(s>=3){for(let i=-2;i<=2;i++)R.L([i*.026,.39,.53],[i*.045,.48-Math.abs(i)*.022,.5],.012,.002,'g',P.glow,4,hb);
    for(let i=0;i<6;i++){const z=.25-i*.11,t=R.top(.05,z),t2=R.top(.05,z-.11);if(t&&t2)R.L(R.add(t.p,t.n,.004),R.add(t2.p,t2.n,.004),.008,.008,'g',P.glowD,3,{vs:1})}}};
// Titanshell (the living mountain; its crystal ripens): 0 the crystal clusters swell · 1 glowing cracks down the dome, a second
// pair of stone horns from the brow · 2 a crown of crystal breaks from the summit, crystal shards round the rim, the horns
// grow · 3 the crown towers, the lesser peaks crystallise, the horns and the tail club glow
EV38.S.Titanshell=function(E,L,P,c,s){const R=E.raw,T=EV38T,TT=ER150.TI,top=TT.top,sb={bn:'spine'},hb={bn:'head'},dark=0x2a3a44;
  TM186.xl.forEach(([x,z,k])=>{const y=top(x,z)-.01,g=1+.25*s;R.pd('oct','g',P.glow,[x,y+.05*k*g,z],[x>0?-.2:.2,1,0],[.022*k*g,.07*k*g,.022*k*g],null,sb);R.pd('oct','g',P.glow2,[x,y+.05*k*g,z],[0,1,0],[.01*k*g,.04*k*g,.01*k*g],null,sb)});
  if(s>=1){for(let n=0;n<7;n++){const a=n/7*6.283+.4;let pr=null;for(let i=0;i<5;i++){const r=.25+i*.045,w=Math.sin(i*1.7+n)*.06,t=R.top(Math.sin(a+w)*r,Math.cos(a+w)*r-.02);if(!t)break;const q=R.add(t.p,t.n,.004);
      if(pr)R.L(pr,q,.008-i*.001,.007-i*.001,'g',i<2?P.glow:P.glowD,3,{vs:1});pr=q}}
    [-1,1].forEach(sd=>T.horn(R,{p:[sd*.1,.44,.55],n:[sd*.4,.9,.2]},[sd*.35,.8,-.45],[0,-.02,-.04],[0,.1,.15,.2][s],.03,0x8a8070,s>=3?P.glow:0x6a6254,hb))}
  if(s>=2){const q=TM186.pk[0],sy=top(q[0],q[1])-.03+q[3]*.78,k=s>=3?1.5:1;
    for(let i=0;i<6;i++){const a=i/6*6.283,d=[Math.cos(a)*.5,1,Math.sin(a)*.5];R.pd('oct','g',i%2?P.glow:P.glowD,[q[0]+Math.cos(a)*.03,sy+.01*k,q[1]+Math.sin(a)*.03],d,[.02*k,(.08-i%2*.02)*k,.02*k],null,sb)}
    R.pd('oct','g',P.glow2,[q[0]+.01,sy+.07*k,q[1]-.01],[0,1,0],[.024*k,.1*k,.024*k],null,sb);
    for(let i=0;i<12;i++){const a=i/12*6.283+.3,h=R.on([Math.sin(a)*.9,.36,Math.cos(a)*1-.02],[-Math.sin(a),0,-Math.cos(a)]);if(h&&h.p[1]>.3&&h.p[1]<.45&&Math.abs(Math.cos(a))<.93)R.pd('oct',i%2?'c':'g',i%2?dark:P.glowD,R.add(h.p,h.n,-.01),R.nrm([h.n[0],.8,h.n[2]]),[.014,.045+.015*(s-2),.014],null,sb)}}
  if(s>=3){TM186.pk.slice(1,4).forEach(q=>{const sy=top(q[0],q[1])-.03+q[3]*.7;R.pd('oct','g',P.glow,[q[0],sy+.04,q[1]],[0,1,0],[.018,.07,.018],null,sb)});
    [-1,1].forEach(sd=>R.pd('oct','g',P.glow,[sd*.3,.6,.57],[sd*-.1,.5,.6],[.014,.032,.014],null,hb));
    const tb=T.box(E,/^tail/);if(tb){const q=R.top(0,tb.mn[2]+.05);if(q)for(let i=0;i<3;i++){const a=(i-1)*.9;T.spike(R,q,[Math.sin(a),.8,-.3],.06,.014,dark,P.glow,.5)}}}};
// Mossfrog (was three dim pustules, then two brow nubs, then the lure): a horned bog toad that grows into a bog elder.
// 1 short horns on the eyelids (a horned frog's), moss mounds on the back · 2 the horns longer, a ridge of warty spines down
// the back, reeds sprouting from the moss, the glands behind the eyes glow · 3 long bone horns with glowing tips, the angler
// lure, the back spines tipped with glowing venom
EV38.S.Mossfrog=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,moss=0x34461e,moss2=0x26341a,reed=0x6a7a34,hb={bn:'head'},pg=T.mix(P.glow,P.mainD,.35),skD=T.dim(P.mainD,.85);
  [[.09,.03],[-.11,-.07],[.12,-.15],[-.05,.13]].forEach(q=>{const t=R.top(q[0],q[1]);if(t)R.pd('sph','g',pg,R.add(t.p,t.n,-.003),t.n,[.014,.008,.014])});
  [[.1,-.02,.07],[-.12,.06,.06],[-.06,-.17,.065],[.14,.12,.05]].slice(0,s>=2?4:3).forEach((q,i)=>{const t=R.top(q[0],q[1]);if(!t)return;
    [[0,0,1],[.6,.4,.7],[-.5,.5,.6],[.2,-.6,.65]].forEach((o,j)=>{const r=q[2]*.5*o[2]*(1.25+.15*s);R.pd('ico','c',(i+j)%2?moss:moss2,R.add(R.add(t.p,[o[0]*q[2]*.7,0,o[1]*q[2]*.7]),t.n,-.006),t.n,[r,r*.6,r])});
    if(s>=2)for(let k=0;k<3;k++){const a=k*2.1+i;R.L(R.add(t.p,t.n,-.01),R.add(t.p,R.nrm([Math.cos(a)*.25,1,Math.sin(a)*.25-.2]),.07+.03*(s-2)+k*.012),.007,.002,'c',k%2?reed:0x5a6a2a,3)}});
  [-1,1].forEach(sd=>T.horn(R,{p:[sd*.14,.43,.35],n:[sd*.2,1,0]},[sd*.35,.85,-.45],[0,-.01,-.035],[0,.065,.095,.13][s],.017+.003*s,s>=3?P.boneD:skD,s>=3?P.glow:T.dim(skD,.7),hb));
  if(s>=2){T.crest(R,.2,-.16,s>=3?6:5,t=>(.03+.02*(s-2))*(1-.3*t),.016,i=>i%2?skD:P.mainD,(t,q)=>[0,1,-.5],s>=3?P.glow2:null,.6);
    [-1,1].forEach(sd=>R.pd('oct','g',P.glowD,[sd*.16,.383,.27],[0,1,0],[.022,.006,.05],null,hb))}
  if(s>=3){const lt=R.top(0,.3),b=lt?lt.p[1]-.012:.38;
    R.chain([[0,b,.3],[0,b+.08,.33],[0,b+.12,.39],[0,b+.1,.45]],.013,.006,'c',P.mainD,5,hb);R.pd('ico','g',P.glow,[0,b+.075,.46],[0,1,0],.024,null,hb);R.pd('ico','g',P.glow2,[0,b+.075,.46],[0,1,0],.013,null,hb)}};
// Bogmaw (was pustules, runes, a moss cloak, charms, then glowing eye rings): the swamp maw grows horned and spined.
// 0 glowing pustules · 1 bony brow horns, glowing spore caps · 2 the horns longer, a ridge of bone spines down the back, two
// more lures · 3 great curved horns with glowing tips, the bone ridge and two rows of venom spines along the back burn
EV38.S.Bogmaw=function(E,L,P,c,s){const R=E.raw,T=EV38T,hb={bn:'head'};
  [[.1,.02],[-.12,-.08],[.16,-.18],[-.04,.16],[-.2,.06]].forEach(q=>{const t=R.top(q[0],q[1]);if(t)R.pd('sph','g',P.glowD,R.add(t.p,t.n,.002),t.n,[.02,.012,.02])});
  if(s>=1){[[.2,-.04],[-.16,.1],[.06,.12]].forEach(q=>{const t=R.top(q[0],q[1]);if(!t)return;const tp=R.add(t.p,t.n,.05);R.L(R.add(t.p,t.n,-.01),tp,.009,.007,'c',0xb8ac88,4);R.pd('hem','g',P.glowD,tp,t.n,[.026,.018,.026]);R.pd('cyl','c',0xa89878,R.add(tp,t.n,.001),t.n,[.025,.003,.025])});
    [-1,1].forEach(sd=>T.horn(R,{p:[sd*.2,.44,.36],n:[sd*.3,1,0]},[sd*.5,.8,-.3],[0,-.01,-.03],[0,.07,.11,.16][s],.02+.004*s,P.boneD,s>=3?P.glow:T.dim(P.boneD,.7),hb))}
  if(s>=2){T.crest(R,.2,-.24,7,t=>(.045+.02*(s-2))*(1-.3*Math.abs(t-.4)),.018,i=>i%2?P.boneD:P.bone,(t,q)=>[0,1,-.55],s>=3?P.glow2:null,.62);
    [-1,1].forEach(sd=>{const P0=[sd*.13,.44,.31],P1=[sd*.2,.53,.38],P2=[sd*.24,.5,.45];R.L(P0,P1,.009,.007,'c',P.mainD,4,hb);R.L(P1,P2,.007,.005,'c',P.mainD,4,hb);R.pd('ico','g',P.glow,P2,[0,1,0],.018,null,hb)})}
  if(s>=3){
    for(let i=-1;i<=1;i+=2)[.1,-.04,-.18].forEach(z=>{const t=R.top(i*.13,z);if(t)T.spike(R,t,[i*.3,1,-.5],.08,.016,P.mainD,P.glow2,.55)})}};
// ===================================================================== Sky =====================================================================
// Batwing (its crest and mask hid under the wings): a night bat that grows a hunter's crown. 1 tufts at the ear roots, a pale
// throat ruff, a nose-leaf spike · 2 a tall mohawk of dark fur from the crown down the back, hooked bone spurs at the wing
// shoulders, a barbed tail spike · 3 two crescent horns curving up from the brow, the mohawk tipped with glow, longer spurs
// and barb, a glowing mark on the brow
// Duskwing (the moon bat) shares the plan in silver-violet: its horns meet over the brow as a crescent moon
EV38.bat=function(E,L,P,c,s,moon,g){if(!s)return;if(g==null)g=s>=3;const R=E.raw,T=EV38T,hb={bn:'head'},fur=P.mainL,silver=moon?T.mix(P.mainL,0xc8c4d8,.5):P.mainD,dk=moon?T.mix(P.mainD,0x4a4060,.3):P.dark;
  [-1,1].forEach(sd=>[0,1,2].forEach(k=>R.L([sd*.075,.47-k*.025,.38],[sd*(.15+k*.03+.02*s),.55-k*.05+.01*s,.3],.026,.002,'c',k%2?P.mainD:fur,4,hb)));
  for(let i=-2;i<=2;i++){const h=R.on([i*.06,.26,1],[0,0,-1]);if(h)T.tuft(R,h,[0,-.6,0],.05+.015*s,.024,i%2?fur:P.main)}
  R.L([0,.45,.505],[0,.5+.012*s,.5],.011,.002,'c',P.mainD,4,hb);
  if(s>=2){for(let i=0;i<8;i++){const z=.38-i*.075,h=R.top(0,z);if(h)[-1,1].forEach(sd=>R.L(R.add(h.p,[sd*.014,-.008,0]),R.add(h.p,R.nrm([sd*.25,1,-.9]),(.11+.03*(s-2))*(1-i*.08)),.028,.002,i%2?'c':'c',i%2?silver:dk,4));
      if(g&&h&&i<6)R.L(R.add(h.p,R.nrm([0,1,-.9]),(.11+.03*(s-2))*(1-i*.08)*.6),R.add(h.p,R.nrm([0,1,-.9]),(.11+.03*(s-2))*(1-i*.08)*1.02),.012,.001,'g',P.glow,3)}
    [-1,1].forEach(sd=>{const h=R.on([sd*.4,.43,.14],[-sd,0,0]);if(h)T.horn(R,h,[sd*.5,1,-.3],[sd*.03,-.02,-.03],.07+.04*(s-2),.018,P.bone,P.boneD)});
    const tb=T.box(E,/^tail/);if(tb){const q=R.top(0,tb.mn[2]+.03);if(q)T.spike(R,q,[0,.3,-1],.06+.04*(s-2),.016,P.boneD,g?P.glow:null,.6)}}
  if(s>=3){[-1,1].forEach(sd=>{const q=R.top(sd*.035,.43);if(q)T.horn(R,q,[sd*.25,1,-.15],moon?[-sd*.07,.01,-.02]:[-sd*.03,-.01,-.04],moon?.17:.15,.02,moon?silver:dk,g?P.glow:P.boneD,hb)});
    const q=R.top(0,.46);if(q&&g)R.pd('oct','g',P.glow,R.add(q.p,q.n,.004),q.n,[.014,.005,.026],[0,0,1],hb)}};
EV38.S.Batwing=function(E,L,P,c,s){EV38.bat(E,L,P,c,s,0)};
EV38.S.Duskwing=function(E,L,P,c,s){EV38.bat(E,L,P,c,[1,2,3,3][s],1,s>=3)};
// the birds keep their designs (crest, mantle, breastplate, crown) and their crest grows: a longer, fuller crest of swept
// plumes at every stage, at the last a pair of long nape plumes lying down the neck; Rocsovereign's bead cords (they hung
// from the crown) are gone
EV38.birdCrest=function(E,P,s,o){const R=E.raw,hb={bn:'head'},n=s>=3?4:s>=2?3:2;if(!s||typeof bd184Fth!='function')return;
  for(let i=-n;i<=n;i++){if(Math.abs(i)<=1&&s<2)continue;const a=[i*.02,o.y,o.z],ln=(o.len+.05*s)*(1-Math.abs(i)*.09),b=[i*.055,o.y+ln*.55,o.z-ln*.8],d=R.nrm([b[0]-a[0],b[1]-a[1],b[2]-a[2]]);
    bd184Fth(R,a,d,[i*.2,1,.4],ln,.016,'c',Math.abs(i)%2?P.mainD:P.dark,hb);if(s>=3&&Math.abs(i)%2==0)bd184Fth(R,R.add(a,d,ln-.05),d,[i*.2,1,.4],.06,.008,'g',o.glow||P.glow,hb)}
  if(s>=3)[-1,1].forEach(sd=>{const a=[sd*.04,o.y-.04,o.z-.06],d=R.nrm([sd*.15,-.55,-1]);bd184Fth(R,a,d,[sd,.3,0],.2,.02,'c',P.dark,Object.assign({kind:'lance'},hb))})};
// a ruff of long hackle feathers round the back of the neck, lying back over the shoulders (rows at heights ys)
EV38.birdRuff=function(E,P,ys,len,cz){const R=E.raw;if(typeof bd184Fth!='function')return;ys.forEach((y,k)=>{for(let i=0;i<9;i++){const a=-1.5+i/8*3,o=[Math.sin(a)*.5,y,cz-Math.cos(a)*.5],h=R.on(o,[-Math.sin(a),0,Math.cos(a)]);
  if(h)bd184Fth(R,R.add(h.p,h.n,-.006),R.nrm([h.n[0]*.6,-.35,-1]),h.n,len*(1-k*.15)*(1-Math.abs(a)*.12),.022,'c',(i+k)%2?P.mainD:P.dark,{vs:1})}})};
EV38.S.Skyhawk=function(E,L,P,c,s,b0){b0.apply(this,arguments);EV38.birdCrest(E,P,s,{y:.92,z:.37,len:.1})};
EV38.S.Stormtalon=function(E,L,P,c,s,b0){const ch0=E.chain;E.chain=function(pts,r0,r1,t,col){if(t=="g"&&r0===.008&&col===P.glow2)return E;return ch0.apply(E,arguments)};try{b0.apply(this,arguments)}finally{E.chain=ch0}EV38.birdCrest(E,P,s,{y:.92,z:.4,len:.13,glow:P.glow2});if(s>=1)EV38.birdRuff(E,P,s>=3?[.86,.81,.76]:s>=2?[.85,.79]:[.84],.08+.035*s,.3)};
EV38.S.Rocsovereign=function(E,L,P,c,s,b0){const L0=E.L,pd0=E.pd;
  E.L=function(a,b,r1,r2,t,col){if(col===P.leather&&r1===.003)return E;return L0.apply(E,arguments)};
  E.pd=function(geo,t,col,pos,dir,sc){if(geo=='sph'&&sc===.011)return E;return pd0.apply(E,arguments)};
  try{b0.apply(this,arguments)}finally{E.L=L0;E.pd=pd0}EV38.birdCrest(E,P,s+1>3?3:s+1,{y:.95,z:.36,len:.12});if(s>=2)EV38.birdRuff(E,P,s>=3?[.9,.84,.78]:[.88,.82],.1+.035*s,.3)};
// ===================================================================== Swarm =====================================================================
// a fungus cap on a stalk from hit q: stalk height h, cap radius r, lit gills under it (glow colour gl, or none)
EV38T.cap=function(R,q,h,r,K,gl,lean,o){const d=R.nrm([q.n[0]*.4+(lean||0),1,q.n[2]*.4]),top=R.add(q.p,d,h);o=Object.assign({at:R.add(q.p,q.n,-.01)},o);
  R.L(R.add(q.p,q.n,-.012),top,r*.28,r*.2,'c',K.stalk.getHex(),5,o);if(gl!=null)R.pd('cyl','g',gl,R.add(top,d,-.004),d,[r*.88,.004,r*.88],null,o);
  R.pd('cyl','c',K.gill.getHex(),R.add(top,d,-.006),d,[r*.92,.003,r*.92],null,o);R.pd('hem','c',K.cap.getHex(),R.add(top,d,-.003),d,[r,r*.55,r],null,o);return top};
// Gloomcap (the fungal crawler; its growth hardly changed): the growth on its back spreads and rises. 1 lit gill slits on the
// flanks, a cluster of new caps on the rear · 2 caps on tall stalks rise from the back, shelf fungi jut from the flanks, the
// brim's gills glow · 3 one towering cap on a thick stalk crowns the back, ringed by luminous caps; glowing mycelium veins
EV38.S.Gloomcap=function(E,L,P0,c,s){const R=E.raw,T=EV38T,dim=h=>T.mix(h,0x2a3018,.35),P=Object.assign({},P0,{glow:dim(P0.glow),glowD:dim(P0.glowD),glow2:dim(P0.glow2)}),K=FC186.cols(P.C,'Gloomcap');
  if(!s)return;
  [-1,1].forEach(sd=>[.12,0,-.12,-.22].forEach(z=>{const h=R.on([sd*.6,.24,z],[-sd,0,0]);if(h)R.pd('box','g',P.glowD,R.add(h.p,h.n,-.002),h.n,[.004,.03,.012],[0,0,1])}));
  [[-.06,-.2,.03],[.05,-.25,.026],[.12,-.18,.022]].forEach(q=>{const t=R.top(q[0],q[1]);if(t)T.cap(R,t,.02+.01*s,q[2]+.004*s,K,s>=2?P.glowD:null)});
  if(s>=2){[[-.12,.02,.07,.045,-.2],[.13,-.06,.09,.05,.2],[.02,.12,.06,.04,0]].forEach(q=>{const t=R.top(q[0],q[1]);if(t)T.cap(R,t,q[2]+.03*(s-2),q[3]+.008*(s-2),K,P.glowD,q[4])});
    [-1,1].forEach(sd=>[[.27,.06],[.25,-.12],[.22,-.27]].forEach((q,i)=>{const h=R.on([sd*.8,q[0],q[1]],[-sd,0,0]);if(!h)return;const w=.05+.012*s-i*.008;
      R.pd('hem','c',i%2?K.capD.getHex():K.cap.getHex(),R.add(h.p,h.n,w*.25),[0,1,0],[w,w*.28,w*.8],null,{at:R.add(h.p,h.n,-.01)});R.pd('cyl','c',K.gill.getHex(),R.add(h.p,h.n,w*.24),[0,1,0],[w*.95,.003,w*.75],null,{at:R.add(h.p,h.n,-.01)})}));
    R.pd('cyl','g',P.glowD,[0,.293,.336],[0,1,-.12],[.12,.004,.095],null,{bn:'head'})}
  if(s>=3){const t=R.top(-.01,-.06);if(t)T.cap(R,t,.2,.11,K,P.glow,0);
    for(let i=0;i<5;i++){const a=i/5*6.283+.3,x=Math.cos(a)*.17,z=-.05+Math.sin(a)*.13,q=R.top(x,z);if(q)R.pd('hem','g',P.glow,R.add(q.p,q.n,-.006),q.n,[.026,.018,.026])}
    [-1,1].forEach(sd=>T.vein(R,sd,[[.3,.18],[.26,.08],[.29,-.02],[.25,-.12],[.28,-.22]],.005,P.glowD))}};
// Sporelord (the cordyceps beast): the fruiting stalks multiply and ripen. 0 lit gill slits · 1 two more cordyceps stalks burst
// from the hump, glowing veins down its sides · 2 two more stalks, the clubs of all of them glow, dark shelf plates jut along
// the spine · 3 a crown of tall stalks with burning clubs, lit spore pores across the back
EV38.S.Sporelord=function(E,L,P0,c,s){const R=E.raw,T=EV38T,dim=h=>T.mix(h,0x2a3018,.35),P=Object.assign({},P0,{glow:dim(P0.glow),glowD:dim(P0.glowD),glow2:dim(P0.glow2)}),K=FC186.cols(P.C,'Sporelord');
  [-1,1].forEach(sd=>[.12,0,-.12,-.22].forEach(z=>{const h=R.on([sd*.6,.24,z],[-sd,0,0]);if(h)R.pd('box','g',P.glowD,R.add(h.p,h.n,-.002),h.n,[.004,.03,.012],[0,0,1])}));
  const stalk=(x,z,ln,lean,glow)=>{const q=R.top(x,z);if(!q)return;const p0=R.add(q.p,q.n,-.02),p1=R.add(q.p,[lean*.04,ln*.4,-.02]),p2=R.add(q.p,[lean*.1,ln*.75,-.07]),p3=R.add(q.p,[lean*.14,ln,-.12]);
    R.chain([p0,p1,p2,p3],.022,.009,'c',K.stalk.getHex(),5,{at:p0});R.pd('oct',glow?'g':'c',glow?P.glow:K.club.getHex(),R.add(p3,[lean*.01,.03,-.006]),R.nrm([lean*.2,1,-.3]),[.026,.06,.026],null,{at:p0})};
  if(s>=1){stalk(-.16,-.04,.26,-.4,s>=2);stalk(.16,-.04,.27,.4,s>=2);[-1,1].forEach(sd=>T.vein(R,sd,[[.5,.08],[.44,0],[.48,-.08],[.42,-.16],[.4,-.24]],.006,P.glowD))}
  if(s>=2){stalk(-.06,-.18,.3,-.2,1);stalk(.07,-.16,.31,.2,1);
    const top=(x,z)=>{const h=R.top(x,z);return h?h.p[1]+.02:.6};FC186.ST.forEach((q,i)=>{const p=FC186.club(q,top);R.pd('oct','g',i%2?P.glow:P.glowD,p,[0,1,0],[.024,.046,.024],null,{at:R.add([q[0],top(q[0],q[1])-.04,q[1]],[0,0,0])})});
    [-1,1].forEach(sd=>[.02,-.1,-.2].forEach((z,i)=>{const h=R.top(sd*.1,z);if(h)R.pd('hem','c',K.capD.getHex(),R.add(h.p,h.n,.004),R.nrm([sd*.9,.5,0]),[.06-i*.008,.018,.05],null,{at:R.add(h.p,h.n,-.01)})}))}
  if(s>=3){[[-.1,.06,.36,-.3],[.1,.06,.38,.3],[0,-.08,.44,0],[-.02,-.26,.3,-.1]].forEach(q=>stalk(q[0],q[1],q[2],q[3],1));
    for(let i=0;i<8;i++){const x=(i%4-1.5)*.08,z=-.2+Math.floor(i/4)*.2+((i%2)*.05),t=R.top(x,z);if(t)R.pd('sph','g',P.glow2,R.add(t.p,t.n,-.002),t.n,[.01,.004,.01])}}};
// Cryptspider (its crown of horns came only at the end, with gold bands round the legs): a crypt spider that grows bone.
// 1 a spiked crest on the carapace, venom on the fangs, a second row of eyes, a row of spines down the abdomen · 2 bone spurs
// rise from every knee, a bone mantle on the carapace, the abdomen spines longer, venom veins along its sides · 3 a crown of
// curved bone horns, bone plates ringing the abdomen with a glowing hourglass, the spines tipped with venom
EV38.S.Cryptspider=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,hb={bn:'head'};
  [[.3,.05,.018],[.22,.07,.022],[.14,.06,.02]].forEach(q=>{const h=R.top(0,q[0]);if(h)R.L(R.add(h.p,h.n,-.01),R.add(h.p,R.nrm([0,1,-.8]),q[1]+.012*s),q[2],.002,'c',P.dark,4)});
  [-1,1].forEach(sd=>{R.pd('sph','g',P.glow,[sd*.02,.27,.5],[0,1,0],.012,null,{bn:'jaw'});[[.05,.49,.4],[.03,.5,.37]].forEach(q=>R.pd('sph','g',P.glow,[sd*q[0],q[1],q[2]],[0,1,0],.01,null,{vs:1}))});
  T.crest(R,-.12,-.56,[0,4,6,7][s],t=>(.04+.025*(s-1))*(1-.4*Math.abs(t-.35)),.016,i=>i%2?P.dark:0x2a2228,(t,q)=>[q.n[0]*.4,1,-.4],s>=3?P.glow:null,.68);
  if(s>=2){[-1,1].forEach(sd=>{[0,1,2,3].forEach(i=>{const G=spidLeg(sd,i);R.L(G.p1,R.add(G.p1,[sd*.02,.06+.03*(s-2),-.01]),.016,.002,'c',P.bone,4,{bn:G.k+'1'})});
      T.vein(R,sd,[[.72,-.12],[.68,-.24],[.7,-.36],[.65,-.48],[.6,-.58]],.006,P.glowD)});
    T.shell(R,(x,y,z,nx,ny)=>z>.08&&z<.34&&ny>.5&&Math.abs(x)<.13&&y>.47,.014,'c',0x4a4240,{rimCol:P.boneD})}
  if(s>=3){for(let i=-2;i<=2;i++){const h=R.top(i*.04,.38);if(h)R.horn(R.add(h.p,h.n,-.006),[i*.3,1,-.3],[0,0,-.05],.14-Math.abs(i)*.018,.016,'c',P.bone,4,null,P.boneD)}
    [[-.18,-.28],[-.42,-.54]].forEach((q,k)=>T.shell(R,(x,y,z,nx,ny)=>z<q[0]&&z>q[1]&&ny>.35&&Math.abs(x)<.26&&y>.55,.016,'c',k%2?0x5a5048:0x40383a,{rimCol:P.boneD}));
    const h=R.top(0,-.36);if(h){const c0=R.add(h.p,h.n,.006);R.pd('cone4','g',P.glow,R.add(c0,[0,0,.03]),[0,0,-1],[.03,.05,.01],[0,1,0],{vs:1});R.pd('cone4','g',P.glow,R.add(c0,[0,0,-.03]),[0,0,1],[.03,.05,.01],[0,1,0],{vs:1})}}};
// Widowqueen (her crown was gold spines and runes stuck on the abdomen): the black widow grows armoured and crowned.
// 0 venom on the fangs, glowing eyes, a jewel at the hourglass · 1 two rows of black spines down the abdomen's crown ·
// 2 the spines longer and red-tipped, black chitin plates over the carapace, a crown of black spines · 3 a gilded crown
// with a great jewel, a ridge of tall spines down the abdomen, all their tips burning
EV38.S.Widowqueen=function(E,L,P,c,s){const R=E.raw,T=EV38T,jb={bn:'jaw'},hb={bn:'head'},blk=0x0c0a0e,chit=T.mix(P.dark,P.mainD,.4);
  [-1,1].forEach(sd=>{R.pd('sph','g',P.glow,[sd*.014,.338,.49],[0,1,0],[.009,.015,.009],null,jb);R.pd('sph','g',P.glow,[sd*.03,.585,.395],[0,0,1],.009,null,hb)});
  {const h=R.top(0,-.62);if(h)R.pd('oct','g',P.glow,R.add(h.p,h.n,.004),h.n,[.018,.024,.018])}
  if(s>=1)[-1,1].forEach(sd=>{for(let i=0;i<6;i++){const z=-.32-i*.09,x=sd*(.15-Math.abs(i-2.5)*.008),h=R.top(x,z);if(h)T.spike(R,h,[h.n[0]*.6,1,-.5],(.07+.03*(s-1))*(i%2?1.15:1),.017,blk,s>=2?P.glowD:null,.7)}});
  if(s>=2){[.04,.14,.24].forEach((z,i)=>{const h=R.top(0,z);if(h)R.pd('hem','c',chit,R.add(h.p,h.n,-.006),h.n,[.1-i*.012,.026,.06],[0,0,1])});
    for(let i=0;i<5;i++){const a=((i+.5)/5-.5)*Math.PI*1.3,x=Math.sin(a)*.06,z=.335+Math.cos(a)*.05;R.L([x,.565,z],[x+Math.sin(a)*.03,.67-Math.abs(i-2)*.02,z-.04],.012,.002,'c',blk,4,hb)}}
  if(s>=3){const cy=.574,cz=.335;for(let i=0;i<6;i++){const a=((i+.5)/6-.5)*Math.PI*1.5,x=Math.sin(a)*.068,z=cz+Math.cos(a)*.058;R.L([x,cy,z],[x+Math.sin(a)*.02,cy+.11-Math.abs(i-2.5)*.014,z-.02],.01,.002,'m',P.gold,4,hb)}
    R.pd('oct','g',P.glow,[0,cy+.03,cz+.08],[0,1,.3],[.022,.034,.016],null,hb);
    T.crest(R,-.3,-.78,5,t=>.16-.05*Math.abs(t-.4),.022,blk,(t,q)=>[0,1,-.35],P.glow,.75)}};
// Hivemother (the brood queen; her evolution only lit what she had): her regalia grows. 0 venom on the fangs and the stinger,
// the chevrons burn · 1 amber tips on her crown and leg spurs, rows of black spines down the abdomen's flanks · 2 a second,
// taller crown, a ridge of tall spines down the abdomen, the stinger longer and amber · 3 a full ring of crown spines with
// amber stones, amber stones along the abdomen, a glowing seam down her back, the spines amber-tipped
EV38.S.Hivemother=function(E,L,P,c,s){const R=E.raw,T=EV38T,jb={bn:'jaw'},hb={bn:'head'},tb={bn:'tail0'},AB=HM186.ab,K=HM186.pal(P.C),blk=K.blk.getHex(),gl=K.gloss.getHex();
  [-1,1].forEach(sd=>R.pd('sph','g',P.glow,[sd*.012,.29,.48],[0,1,0],[.008,.014,.008],null,jb));
  HM186.chev.forEach((z0,j)=>[-1,1].forEach(sd=>{let pr=v150Surf(AB,z0,Math.PI/2,.006);for(let i=1;i<=3;i++){const t=i/3,p=v150Surf(AB,z0+.1*t,Math.PI/2+sd*.85*t,.006);R.L(pr,p,.01,.01,'g',j?P.glow:P.glow2,3,tb);pr=p}}));
  if(s>=1){[-2,-1,0,1,2].forEach(i=>{const x=i*.03,h=1-Math.abs(i)*.18;R.pd('oct','g',P.glow,[x*2.4,.49+.15*h,.22],[x*2,.5,-.9],[.008,.022,.008],null,hb)});
    [-1,1].forEach(sd=>{[0,1,2,3].forEach(i=>{const G=CS150.leg('Hivemother',sd,i),P1=G.P[1];R.pd('oct','g',P.glowD,[P1[0]+sd*.015,P1[1]+.08,P1[2]-.02],[0,1,0],[.006,.016,.006],null,{bn:G.k+'0'})});
      for(let i=0;i<5;i++){const z=-.42-i*.11,a=Math.PI/2-sd*.75,p=v150Surf(AB,z,a,-.012),n=[Math.cos(a),Math.sin(a),0];R.L(p,R.add(p,R.nrm([n[0]*.9,n[1]+.5,-.5]),(.05+.02*s)*(1-Math.abs(i-2)*.12)),.016,.002,'c',i%2?blk:gl,4,tb)}})}
  if(s>=2){[-1,0,1].forEach(i=>{const b=[i*.045,.49,.37],t=[i*.085,.69-Math.abs(i)*.05,.32];R.L(b,t,.013,.003,'c',blk,4,hb);R.pd('oct','g',P.glow2,t,[i*.3,1,-.2],[.008,.022,.008],null,hb)});
    for(let j=0;j<5;j++){const z=-.36-j*.13,p=v150Surf(AB,z,Math.PI/2,-.012),ln=(.1+.04*(s-2))*(1-Math.abs(j-2)*.1);R.L(p,R.add(p,R.nrm([0,1,-.45]),ln),.02,.002,'c',j%2?blk:gl,4,tb);
      if(s>=3)R.L(R.add(p,R.nrm([0,1,-.45]),ln*.65),R.add(p,R.nrm([0,1,-.45]),ln*1.01),.008,.001,'g',P.glow,3,tb)}
    R.L([0,.54,-1.16],[0,.49,-1.2],.016,.002,'g',P.glow,4,tb)}
  if(s>=3){for(let i=0;i<7;i++){const a=(i/6-.5)*Math.PI*1.4,b=[Math.sin(a)*.06,.49,.36+Math.cos(a)*.03-.03],t=[Math.sin(a)*.12,.62+.06*Math.cos(a),.3];R.L(b,t,.011,.002,'c',gl,4,hb)}
    R.pd('oct','g',P.glow,[0,.535,.4],[0,.6,.8],[.018,.026,.014],null,hb);
    let pr=null;for(let j=0;j<8;j++){const h=R.top(0,-.22-j*.1),p=h?R.add(h.p,h.n,.004):null;if(p&&pr)R.L(pr,p,.008,.008,'g',j%2?P.glow:P.glow2,3,{vs:1});pr=p}
    for(let i=0;i<6;i++){const z=-.4-(i%3)*.17,a=i<3?.2:Math.PI-.2,h=R.on(v150Surf(AB,z,a,.4),[-Math.cos(a),-Math.sin(a),0]);if(h)R.pd('oct','g',i%2?P.glow:P.glowD,R.add(h.p,h.n,-.002),h.n,[.014,.02,.014],null,tb)}}};
// ===================================================================== Spirit =====================================================================
// Boneling (iron plates and a crown pinned to a bare skeleton): the bones themselves grow. 1 soul-fire in the sockets, short
// horns, the vertebrae rise into a row of spines · 2 the horns sweep back, the spines lengthen with a soul-flame ribbon along
// them, soul-fire in the ribcage, bone spikes down the tail · 3 long curling horns with burning tips, a lich crown of bone
// spikes on the skull, shoulder blades grown into spiked bone pauldrons, a caged soul crystal at the tail tip
EV38.S.Boneling=function(E,L,P,c,s){if(!s)return;const R=E.raw,T=EV38T,B=boneP,hb={bn:'head'},bone=P.bone,boneD=P.boneD;
  [-1,1].forEach(sd=>{const e=B([sd*.055,.625,.575]);R.L(e,R.add(e,[sd*.02,.06,-.07]),.016,.002,'g',P.glow,4,hb);if(s>=2)R.L(R.add(e,[0,.01,0]),R.add(e,[sd*.035,.1,-.14]),.012,.001,'g',P.glow2,3,hb)});
  [-1,1].forEach(sd=>R.horn(B([sd*.07,.69,.42]),[sd*.35,.55,-1],s>=3?[sd*.02,-.07,-.02]:[0,-.04,-.03],[0,.08,.14,.21][s],.016+.003*s,'c',boneD,5,hb,s>=3?P.glow:bone));
  {const n=[0,6,8,9][s];for(let i=0;i<n;i++){const z=B([0,0,.3-i*.065])[2],q=R.top(0,z);if(!q)continue;const ln=(.035+.025*(s-1))*(1-Math.abs(i-n*.4)/n*.6);
    T.spike(R,q,[0,1,-.45],ln,.012,i%2?boneD:bone,s>=3?P.glow2:null,.7);if(s==2&&i%2==0)R.L(R.add(q.p,q.n,.01),R.add(q.p,[0,ln+.05,-.06]),.016,.002,'g',P.glowD,4,{at:q.p})}}
  if(s>=2){R.pd('ico','g',P.glow2,[0,.512,.12],[0,1,0],.05,null,{bn:'chest'});
    const tb=T.box(E,/^tail/);if(tb)for(let i=0;i<3;i++){const z=tb.mx[2]-.12-i*.16,q=R.top(0,z);if(q)T.spike(R,q,[0,1,-.6],.05-.008*i+.02*(s-2),.011,bone)}}
  if(s>=3){for(let i=-2;i<=2;i++){const p=B([i*.03,.69,.48]);R.L(p,R.add(p,[i*.018,.09-Math.abs(i)*.015,-.035]),.011,.002,'c',bone,4,hb)}
    R.band(B([0,.66,.48]),[0,1,-.3],.003,.006,'m',P.gold,10,hb);
    [-1,1].forEach(sd=>{const h=R.on([sd*.4,B([0,.55,0])[1],B([0,0,.22])[2]],[-sd,0,0]);if(h){R.pd('hem','c',boneD,R.add(h.p,h.n,-.004),h.n,[.06,.02,.08],[0,1,0],{vs:1});T.spike(R,h,[sd,.9,-.4],.07,.014,bone)}});
    const tp=B([0,.47,-.98]);R.pd('cyl','m',P.trim,tp,[0,1,0],[.022,.05,.022],null,{bn:'tail3'});R.pd('oct','g',P.glow,R.add(tp,[0,-.04,0]),[0,1,0],[.028,.045,.028],null,{bn:'tail3'})}};
// Lichbone (runes, a halo and iron on the robe): the lich hound's crown and horns grow. 0 soul-fire in the sockets · 1 a row
// of bone spines down the robe's back, spectral ribbons from the horn tips · 2 grave-iron pauldrons with spikes, a second
// pair of horns rising from the crown, the spines longer · 3 the crown towers (a ring of tall bone spikes round the iron crown
// with a soul gem), gold-banded horns, soul-flames from the ribcage, burning spine tips
EV38.S.Lichbone=function(E,L,P,c,s){const R=E.raw,T=EV38T,B=boneP,hb={bn:'head'};
  [-1,1].forEach(sd=>{const e=B([sd*.057,.7,.577]);R.L(e,R.add(e,[sd*.02,.06,-.07]),.016,.002,'g',P.glow,4,hb);if(s>=2)R.L(R.add(e,[0,.01,0]),R.add(e,[sd*.035,.1,-.14]),.012,.001,'g',P.glow2,3,hb)});
  if(s>=1){T.crest(R,.3,-.3,[0,5,7,8][s],t=>(.04+.03*(s-1))*(1-.4*t),.016,i=>i%2?P.boneD:P.bone,(t,q)=>[0,1,-.6],s>=3?P.glow2:null,.7);
    [-1,1].forEach(sd=>{const t=B([sd*.21,.64,.43]);R.L(t,R.add(t,[sd*.02,-.07,-.04]),.012,.002,'g',P.glow2,4,hb)})}
  if(s>=2){[-1,1].forEach(sd=>{const h=R.on([sd*2,B([0,.63,0])[1],B([0,0,.25])[2]],[-sd,-.4,0]);if(h){R.plate(h.p,h.n,[0,0,1],.09,.12,.018,'m',P.metal,'hem');T.spike(R,h,[sd,.7,-.2],.07+.02*(s-2),.016,P.trim)}
      const c0=B([sd*.05,.79,.47]);R.horn(c0,[sd*.35,1,-.25],[0,-.01,-.04],.12+.05*(s-2),.016,'c',P.dark,5,hb,P.bone)})}
  if(s>=3){const c0=B([0,.765,.52]);for(let i=0;i<9;i++){const a=(i/8-.5)*Math.PI*1.8,x=Math.sin(a)*.085,z=c0[2]+Math.cos(a)*.075;R.L([x,c0[1]-.01,z],[x*1.25,c0[1]+.14-Math.abs(i-4)*.012,z-.02],.012,.002,'c',P.bone,4,hb)}
    R.pd('oct','g',P.glow,[0,c0[1]+.035,c0[2]+.08],[0,1,.3],[.02,.03,.014],null,hb);
    [-1,1].forEach(sd=>[[.12,.82,.43],[.24,.72,.345]].forEach(q=>R.pd('ring','m',P.gold,B([sd*q[0],q[1],q[2]]),[sd*.3,1,0],[.034,.03,.034],null,hb)));
    [-1,1].forEach(sd=>[.2,.06,-.06].forEach(z=>{const p=B([sd*.16,.5,z]),h=R.on([sd*2,p[1],p[2]],[-sd,0,0]);if(h)R.L(R.add(h.p,h.n,-.01),R.add(h.p,[sd*.03,.11,-.05]),.022,.002,'g',P.glow,4)}))}};
// Wispling, Lumenwisp, Soulwarden (the hooded spirits): the hood and its spirit grow grander. Wispling 1 a soul-lantern, the
// hood's point grows long and sweeps back · 2 wraith horns curve back from the hood · 3 the horns longer, a silver circlet
// with a brow jewel and a crown of spectral flames. Lumenwisp: a sunburst of light rays fans out behind the hood instead of
// horns, longer at the last stage. Soulwarden: its horned hood grows a second, taller pair of bone horns, then the crown.
EV38.spirit=function(E,L,P,c,s,kind){const R=E.raw,T=EV38T,hb={bn:'head'};if(!s)return;
  // a point on the v137 cowl (wsp137Hood) at angle a (0 = the open front), height y, pushed out by o
  const v=kind=='warden'?2:kind=='lumen'?1:0,top=v==2?1.23:1.215,H=(a,y,o)=>{const r=wsp137HoodR(v,y)+(o||0),t=Math.max(0,Math.min(1,(y-.84)/(top-.84)));
      return [Math.sin(a)*r,y,-.01-.06*t*t+Math.cos(a)*r*(1+.05*(Math.cos(a)<0?1:0))]},dk=T.mix(P.dark,P.mainD,.3);
  if(kind!='lumen'){// the soul-lantern held in the right hand (Lumenwisp has its own)
    const hand=[.225,.55,.1],bn='fr2';R.L(hand,R.add(hand,[0,-.06,0]),.004,.004,'m',P.iron,3,{bn});R.pd('cyl','m',P.iron,R.add(hand,[0,-.065,0]),[0,1,0],[.028,.012,.028],null,{bn});
    R.pd('oct','g',P.glow,R.add(hand,[0,-.1,0]),[0,1,0],[.024,.04,.024],null,{bn});R.pd('cone','m',P.iron,R.add(hand,[0,-.145,0]),[0,-1,0],[.022,.02,.022],null,{bn})}
  // the hood's point, longer each stage, sweeping back
  {const a=[0,top-.035,-.065],n=[0,.12,.2,.28][s];R.chain([a,R.add(a,[0,n*.3,-n*.3]),R.add(a,[0,n*.38,-n*.68]),R.add(a,[0,n*.25,-n])],.028,.003,'c',v==1?P.mainL:dk,5,hb)}
  if(s>=2){if(kind=='lumen'){for(let i=0;i<11;i++){const a=Math.PI+(i/10-.5)*2.4,p=H(a,1.03,-.012),d=R.nrm([Math.sin(a)*.8,.45+.5*Math.cos((i/10-.5)*Math.PI),Math.cos(a)*.8]);R.L(p,R.add(p,d,(.15+.07*(s-2))*(i%2?.7:1)),.016,.001,'g',i%2?P.glow2:P.glow,4,hb)}}
    else{const big=kind=='warden'?1.3:1,y=kind=='warden'?1.13:1.07;[-1,1].forEach(sd=>{const p=H(sd*Math.PI*.55,y,-.014);R.horn(p,[sd*.6,.75,-.35],[sd*.03,-.05,-.07],(.16+.07*(s-2))*big,.022*big,'c',kind=='warden'?P.bone:dk,5,hb,P.glowD)})}}
  if(s>=3){for(let i=0;i<14;i++){const a=i/14*6.283,a2=(i+1)/14*6.283;if(Math.cos(a)>.55&&Math.cos(a2)>.55)continue;R.L(H(a,1.0,.004),H(a2,1.0,.004),.009,.009,'m',P.trim,4,hb)}
    R.pd('cone4','m',P.trim,[0,1.14,.035],[0,1,.3],[.018,.055,.018],null,hb);R.pd('oct','g',P.glow,[0,1.125,.05],[0,.5,.85],[.018,.024,.012],null,hb);
    for(let i=-3;i<=3;i++){const a=i/3*1.25+Math.PI,p=H(a,1.09,-.008);R.L(p,R.add(p,R.nrm([Math.sin(a)*.35,1,Math.cos(a)*.35]),.17-Math.abs(i)*.02),.024,.002,'g',i%2?P.glow:P.glow2,4,hb)}}};
EV38.S.Wispling=function(E,L,P,c,s){EV38.spirit(E,L,P,c,s,'wisp')};
EV38.S.Lumenwisp=function(E,L,P,c,s){EV38.spirit(E,L,P,c,s,'lumen')};
EV38.S.Soulwarden=function(E,L,P,c,s){EV38.spirit(E,L,P,c,s,'warden')};
//@@MORE@@
['Foxlet','Ashwolf','Stoneshell','Mossfrog','Batwing','Skyhawk','Gloomcap','Cryptspider','Boneling','Wispling'].forEach(ev38Hook);
