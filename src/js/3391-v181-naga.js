// ================= v181: the naga — a serpent body instead of legs =================
// The v94 / v137 naga were lizard-men standing on two legs with a short tail. Now: a human upper body (scaled, a pale ventral
// plate running down the belly) that flows at the hips into a heavy snake body which lies on the ground and trails ~1.7 m
// behind in an S-curve, a cobra hood flaring behind a reptilian head (slit eyes, no nose, a lipless mouth with fangs).
// The snake body hangs on five tail bones of its own (nt0–nt4, added to the humanoid skeleton of these three foes only):
// they are children of the body mesh, not of the pelvis, so the coils stay on the ground whatever the upper body does (hip
// bob, lean, twist), and they sway in a slither wave (faster and wider on the move). The legs are not built at all; the
// humanoid animations still drive the arms, spine and head, so every naga move plays as before.
var NAGA181={keys:{nagaw:1,nagaa:1,nagas:1},
  // name, parent, rest position (model space, before the foe's scale)
  bones:[['nt0',null,0,.3,-.05],['nt1','nt0',0,.115,-.32],['nt2','nt1',-.13,.098,-.66],['nt3','nt2',.06,.082,-1.0],['nt4','nt3',.15,.058,-1.32]],
  amp:[.05,.1,.16,.2,.24],sc:1.3};
Object.assign(AW_PROP99.PRE,{v181n:{pelvis:[.96,1.05,.92],spine:[.9,1.22,.88],chest:[.96,1.14,.92],neck:[1,1.45,1],head:.78,arm:[1.28,.98],hand:.92,leg:[1,1],foot:1,cape:[1.2,1]}});
// the snake body: rings from the waist down into the ground and back along an S-curve
function n181Tail(B,P,col){const T=(y)=>mdTorsoAt(P,y),q=T(.66),W=(a,b,t)=>t<=0?[[a,1]]:t>=1?[[b,1]]:[[a,1-t],[b,t]];
  const R=[{p:[0,.66,q.z],rx:q.rx+.004,f:q.f+.004,b:q.b+.004,w:mdTorsoW(.66)},{p:[0,.58,0],rx:.152,f:.118,b:.122,w:[['pelvis',1]]},{p:[0,.5,-.006],rx:.162,f:.128,b:.132,w:[['pelvis',1]]},
    {p:[0,.41,-.022],rx:.164,f:.134,b:.136,w:W('pelvis','nt0',.2)},{p:[0,.31,-.052],rx:.158,f:.132,b:.132,w:W('pelvis','nt0',.55)},{p:[0,.215,-.11],rx:.148,f:.13,b:.13,w:[['nt0',1]]},
    {p:[0,.145,-.2],rx:.138,f:.124,b:.124,w:W('nt0','nt1',.4)}];
  [[0,.115,-.32,.128,'nt1','nt1',0],[-.07,.105,-.48,.118,'nt1','nt2',.4],[-.13,.097,-.66,.108,'nt2','nt2',0],[-.09,.088,-.84,.098,'nt2','nt3',.5],[.06,.08,-1.0,.088,'nt3','nt3',0],
   [.14,.07,-1.16,.077,'nt3','nt4',.4],[.15,.058,-1.32,.064,'nt4','nt4',0],[.09,.045,-1.48,.05,'nt4','nt4',0],[0,.032,-1.6,.034,'nt4','nt4',0],[-.07,.021,-1.7,.019,'nt4','nt4',0],[-.11,.012,-1.76,.006,'nt4','nt4',0]]
    .forEach(([x,y,z,r,a,b,t])=>R.push({p:[x,y,z],rx:r,f:r*.9,b:r*.9,w:W(a,b,t)}));
  mdLoft(B,R,{seg:16,ref:[0,0,-1],capB:true,col});return R}
function n181Rig(g){const h=g.h,body=huBody(h);if(!body||!body.skeleton)return;const sk=body.skeleton,abs={},nb=[],by={};
  NAGA181.bones.forEach(([n,p,x,y,z])=>{const b=new THREE.Bone();b.name=n;abs[n]=[x,y,z];by[n]=b;if(p){const a=abs[p];b.position.set(x-a[0],y-a[1],z-a[2]);by[p].add(b)}else{b.position.set(x,y,z);body.add(b)}nb.push(b)});
  const inv=nb.map(b=>new THREE.Matrix4().makeTranslation(abs[b.name][0],abs[b.name][1],abs[b.name][2]).premultiply(body.bindMatrix).invert());
  const S=new THREE.Skeleton(sk.bones.concat(nb),sk.boneInverses.map(m=>m.clone()).concat(inv));
  h.children.forEach(o=>{if(o.isSkinnedMesh&&o.skeleton===sk)o.bind(S,o.bindMatrix)});h.nt=nb;g.n181=1}
{const f=mkHumanoid;mkHumanoid=function(key){const g=f.apply(this,arguments);if(A181.on&&NAGA181.keys[key]&&g&&g.h){try{n181Rig(g)}catch(e){console.error('v181 naga rig',e)}}return g}}
// the slither: a travelling wave down the tail bones (the coils stay on the ground: rotations about the vertical only)
{const f=humAnim;humAnim=function(g,now,mv){const r=f.apply(this,arguments);try{const N=g&&g.h&&g.h.nt;if(N){const k=mv?1:.4,sp=mv?.0062:.0024;
  N.forEach((b,i)=>{b.rotation.y=Math.sin(now*sp-i*1.25)*NAGA181.amp[i]*k*(mv?1.6:1)});N[0].rotation.y+=g.ak&&g.ak.n=='spin'?0:0}}catch(e){}return r}}

// ---------------- the naga body (shared), then each one's gear ----------------
function n181Body(B,P,k,o){B.O.push(...NAGA181.bones.map(q=>q[0]));
  const sk=o.sk,sk2=o.sk2,bel=o.bel,bel2=mdSh(o.bel,.82),pat=o.pat;
  // scales: a mottled back with dark diamond bands down the spine, pale ventral plates down the belly and under the tail
  const scale=m=>a181Nz(sk,m,.38,13);
  a181Torso(B,P,a181TRings('knight',{w:.98}).filter(r=>r.y>=.58),m=>m.s>.55&&Math.abs(m.c)<.45&&m.y<.84?(Math.round(m.y*34)%2?bel:bel2):m.s<-.6&&n3Sn(m.x,m.y*2,m.z,7,1)>.55?pat:scale(m),{capA:false});
  n181Tail(B,P,m=>{const top=m.i<5?m.s<-.2:m.s>.2,a=Math.abs(Math.atan2(m.c,m.s));if(m.i<5?m.s>.45:m.s<-.45)return Math.round(m.i*2.2)%2?bel:bel2;
    if(top&&(a<.55||a>2.6)&&Math.round(m.i*1.3)%2==0)return a181Nz(pat,m,.3,9);return scale(m)});
  const AR=[-1,1].map(s=>a181Arm(B,P,s,{sh:1.1,bi:1.08,fo:1.05,wr:1},scale));
  [-1,1].forEach(s=>a181Hand(B,P,k,s,{kind:o.fist&&o.fist(s)?'fist':'open',col:sk,len:1.05,nail:0x14100a,tip:.014,w:.95}));
  // the head: long, flat-browed, no nose; slit eyes; a cobra hood flaring behind
  a181Head(B,P,{w:.9,jaw:.86,chin:.85,len:1.18,crown:.88,back:1.1,cheek:1.06,brow:1.12},m=>m.s>.5&&m.y<1.1&&Math.abs(m.c)<.5?bel:scale(m));
  a181Eyes(k,P,{glow:o.eye,sock:mdSh(o.sk2,.6),r:.72,tilt:.4,brow:false});[-1,1].forEach(s=>{const z=mdHeadZ(P,1.148);k.p('head','box','c',0x050403,s*.04,1.148,z+.002,.003,.014,.004);
    k.L('head','c',sk2,[s*.075,1.176,mdHeadZ(P,1.176)-.016],[s*.02,1.168,mdHeadZ(P,1.168)],.012,.008,4);k.p('head','box','c',0x0a0806,s*.008,1.112,mdHeadZ(P,1.112)+.002,.004,.006,.004,0,0,s*.4)});
  a181Mouth(k,P,{y:1.072,w:1.25,open:.006,col:0x140806,tooth:0xe8e0c8,fangs:[[-.022,.026],[.022,.026]]});
  for(let i=0;i<5;i++)k.p('head','sph','c',i%2?sk2:sk,0,1.215+i*.012,mdHeadZ(P,1.215+i*.012)-.012-i*.018,.018,.012,.03);
  const HR=[];[[1.0,.085,-.055],[1.05,.15,-.07],[1.11,.205,-.085],[1.17,.215,-.09],[1.23,.18,-.09],[1.275,.1,-.085],[1.3,.025,-.08]].forEach(([y,r,z])=>HR.push({p:[0,y,z],rx:r,f:.02,b:.03,w:y<1.07?[['neck',1]]:[['neck',.3],['head',.7]]}));
  mdLoft(B,HR,{seg:18,capB:true,col:m=>{if(m.s>.3){const ex=Math.abs(Math.abs(m.x)-.12),ey=Math.abs(m.y-1.16),rim=Math.abs(m.x)>.15;return ex<.022&&ey<.02?0x0a0806:ex<.034&&ey<.032?mdSh(bel,.8):rim?a181Nz(sk2,m,.3,12):a181Nz(mdMix(sk,bel,.25),m,.3,14)}return a181Nz(sk2,m,.35,12)}});
  [-1,1].forEach(s=>{for(let i=0;i<3;i++)k.L('neck','c',sk2,[s*.03,1.04,-.075],[s*(.17-i*.035),1.1+i*.065,-.095],.006,.004,3)});
  return AR}

a181Reg('nagaw',function(B,P,k,L){const br=0x6a5226,br2=0x4a3818,gd=0x8a7034,lt=0x2e2014;
  const AR=n181Body(B,P,k,{sk:0x3a4a2c,sk2:0x283420,bel:0x8c7c4e,pat:0x1a2214,eye:0xffc020,fist:s=>s>0});
  // bronze scale cuirass, gorget, one heavy pauldron, vambraces
  mdLoft(B,a181TShell(P,.62,.975,.02,y=>y>.82?.006:0),{seg:18,t:'m',col:m=>m.i<.45||m.i>5.6?gd:a181Nz(Math.round(m.y*36+(Math.round(Math.atan2(m.c,m.s)*8)%2)*.5)%2?br:br2,m,.25,12)});
  mdLoft(B,[{p:[0,.955,0],rx:.19,f:.14,b:.13,w:[['chest',1]]},{p:[0,1.0,0],rx:.12,f:.1,b:.1,w:[['chest',.6],['neck',.4]]},{p:[0,1.03,0],rx:.075,f:.075,b:.075,w:[['neck',1]]}],{seg:16,t:'m',col:gd});
  const a='aL0',x=P.bones[a][1];[[1.0,.13,.09,.135,br],[.955,.12,.075,.125,br2],[.915,.11,.06,.115,br]].forEach(([y,sx,sy,sz,c],j)=>k.p(a,'hem','m',c,x-(.02+j*.012),y,0,sx,sy,sz,0,0,-(.4+j*.12)));
  for(let j=0;j<3;j++)k.L(a,'m',gd,[x-.06-j*.025,1.05,-.03+j*.03],[x-.1-j*.03,1.14,-.04+j*.03],.016,.002,4);
  [-1,1].forEach((s,i)=>a181Shell(B,AR[i],6,8,.014,br,{t:'m',col:m=>m.i<.4||m.i>1.6?gd:br}));
  // the war-belt over the join: a thick wrap and hanging bronze plates
  mdLoft(B,a181TShell(P,.6,.68,.03),{seg:20,col:lt});k.p('spine','oct','m',gd,0,.64,mdTorsoAt(P,.64).f+.035,.03,.035,.012);
  for(let i=0;i<9;i++){const an=-1.3+i*(2.6/8),p=n3Surf(P,.61,an,.032);k.p('pelvis','box','m',i%2?br:br2,p[0],p[1]-.08,p[2]+Math.cos(an)*.012,.07,.15,.012,-.12*Math.cos(an),an,0)}},'v181n');

a181Reg('nagaa',function(B,P,k,L){const lt=0x4a3422,lt2=0x30200f,fe=0x8a2a1a;
  const AR=n181Body(B,P,k,{sk:0x4a4c2c,sk2:0x34361e,bel:0x9a8a5a,pat:0x22220e,eye:0xffd84a,fist:s=>s<0});
  // a leather harness crossing the chest, a quiver of arrows on the back, a bracer on the bow arm, a hide wrap over the join
  [-1,1].forEach(s=>{const p=n3Surf(P,.97,s*.45,.012),q=n3Surf(P,.64,-s*.6,.016),r=n3Surf(P,.97,Math.PI-s*.5,.012),t=n3Surf(P,.66,Math.PI+s*.6,.016);k.L('chest','c',lt,p,[(p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2+.02],.014,.014,4).L('spine','c',lt,[(p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2+.02],q,.014,.014,4);k.L('chest','c',lt,r,t,.014,.014,4)});
  k.p('chest','sph','m',0x8a7a50,0,.84,mdTorsoAt(P,.84).f+.03,.022,.022,.012);
  const qz=-mdTorsoAt(P,.82).b-.06;k.L('chest','c',lt2,[.1,.62,qz],[-.08,1.02,qz-.03],.045,.04,8);for(let i=0;i<6;i++){const ox=(i%3-1)*.025,oz=(i<3?0:.02);k.L('chest','c',0x5a4a32,[-.08+ox,1.0,qz-.03+oz],[-.1+ox,1.1,qz-.04+oz],.004,.004,3);k.p('chest','cone4','c',i%2?fe:0xd8d0b8,-.1+ox,1.12,qz-.04+oz,.012,.05,.004)}
  a181Shell(B,AR[0],5,8,.014,lt,{col:m=>Math.round(m.i*4)%2?lt:lt2});
  mdLoft(B,a181TShell(P,.6,.68,.022),{seg:20,col:m=>a181Nz(lt,m,.3,12)});a181Fringe(B,a181TRingPts(B,P,.6,.022,40),{len:.09,col:lt,col2:lt2,closed:true});
  for(let i=0;i<5;i++){const p=n3Surf(P,.67,-.6+i*.3,.026);k.p('spine','cone4','c',0xd8d0b8,p[0],p[1]-.02,p[2],.008,.04,.006,Math.PI)}},'v181n');

a181Reg('nagas',function(B,P,k,L){const cl=0x1e3a3a,cl2=0x122626,gd=0xa88a3a,rune=0x5affc8,bone=0xd8d0b8;
  const AR=n181Body(B,P,k,{sk:0x2c4844,sk2:0x1e3430,bel:0x8a9a78,pat:0x0e1e1c,eye:0x7affd8,fist:s=>s>0});
  // a fringed shawl over the shoulders, bead and fang necklaces, a sash with long cloth panels over the join, glowing marks
  mdLoft(B,a181TShell(P,.84,1.0,.022,y=>y>.97?.008:0),{seg:22,col:m=>a181Nz(cl,m,.35,14)});a181Fringe(B,a181TRingPts(B,P,.84,.022,44),{len:.1,col:cl,col2:cl2,closed:true});
  for(let j=0;j<2;j++)for(let i=0;i<13;i++){const a=(i-6)*.15,p=n3Surf(P,.96-j*.05-Math.abs(i-6)*.006,a,.03+j*.004);k.p('chest',i%3?'sph':'cone4','c',i%3?(j?gd:0x2a8a7a):bone,p[0],p[1],p[2],i%3?.011:.008,i%3?.011:.035,i%3?.011:.006,i%3?0:Math.PI)}
  mdLoft(B,a181TShell(P,.6,.68,.024),{seg:20,col:cl2});[[0,.15],[.5,.13],[-.5,.13],[Math.PI,.16]].forEach(([a,l])=>{const p=n3Surf(P,.62,a,.03);mdLoft(B,[0,1,2].map(i=>({p:[p[0]+Math.sin(a)*i*.012,p[1]-i*l*.5,p[2]+Math.cos(a)*i*.012],rx:.06,f:.008,b:.008,w:i?[['pelvis',.5],['nt0',.5]]:[['pelvis',1]]})),{seg:6,ref:[Math.sin(a),0,Math.cos(a)],col:m=>m.i>1.6?gd:cl})});
  [[.86,.25],[.86,-.25],[.76,0],[.92,.5],[.92,-.5]].forEach(([y,a],i)=>{const p=n3Surf(P,y,a,.002);k.p(n3TB(y),'box','g',rune,p[0],p[1],p[2],.006,.05,.002,0,a,i%2?.7:-.7)});
  [-1,1].forEach((s,i)=>{const R=AR[i];for(let j=0;j<2;j++){const p=R[2+j*4].p;k.p((s<0?'aL':'aR')+(j?'1':'0'),'box','g',rune,p[0]+s*.03,p[1],p[2]+.03,.005,.045,.002,0,0,s*.3)}a181Shell(B,R,7,8,.012,gd,{t:'m'})});
  // a crown of bone spines and feathers behind the hood
  for(let i=0;i<7;i++){const a=(i-3)*.32;k.L('head','c',i%2?bone:gd,[Math.sin(a)*.08,1.25,-.07+Math.cos(a)*.02],[Math.sin(a)*.16,1.38-Math.abs(i-3)*.025,-.13],.012,.002,4)}},'v181n');

// no legs: no knee bend in their stance (ST179); a little lean, the arms ready
ST179.nagaw={sx:.1,hx:-.08,az:.08,lz:-.1,le:-.15};ST179.nagaa={sx:.08,hx:-.06,lz:-.06};ST179.nagas={sx:.08,hx:-.06,lz:-.06,le:-.25};
Object.keys(NAGA181.keys).forEach(k=>{if(HUMLOOK[k])HUMLOOK[k].sc=(HUMLOOK[k].sc||1)*NAGA181.sc});
