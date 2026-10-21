// ================= v110 Sovereign 0 — Argus, the Hundred-Eyed (Kindlelight) =================
// A gaunt bog-wolf the size of a hut: black matted hide over a ribcage, bark-like plates down the spine, antler horns, and
// eyes — dozens, half-lidded in Phase I, all staring wide (and dangerous) in Phase II. The great brow eye fires the gaze.
// Pattern (learnable):
//  close in front ── Rending Claws: right paw rises and trembles → sweep; often chained into the left backhand, then a bite.
//  close behind  ── Tail Lash: it looks back over its shoulder (the tell), then the tail sweeps the rear arc.
//  mid           ── Lunging Bite: it coils low, then lunges along a line (step aside, don't back away).
//  far           ── Leaping Pounce (crouch, then a high leap onto where you stood; long recovery: punish it)
//                   or the Hundred-Eyed Gaze (it rears, the brow eye charges, a beam fires down a line).
//  Phase II (55%) ─ "The Eyes Open": a howl and a push-back. New: Eye Barrage (bolts rain on your trail, keep moving) and
//                   Blinding Flare (it hunches and every eye brightens — get out of the circle). Combos get longer.
var ARG={col:0xffd040,dim:0xa87a1c};
function argBuild(R,e){
  const fur=svMat(R,0x2a2232,{roughness:.96,emissive:0x2a1838}),fur2=svMat(R,0x3e3648,{roughness:.95,emissive:0x1c1424}),hide=svMat(R,0x3e3546,{roughness:.8}),bark=svMat(R,0x3a2e22,{roughness:.9,emissive:0x0a0604}),
    bone=svMat(R,0xc4b494,{roughness:.6,emissive:0x40341c}),claw=svMat(R,0x141016,{roughness:.4,metalness:.2}),gum=svMat(R,0x6a1c24,{roughness:.6,emissive:0x200408}),lid=svMat(R,0x30222a,{roughness:.7}),
    iris=svGlowMat(R,ARG.dim),slit=new THREE.MeshBasicMaterial({color:0x0a0604});R.iris=iris;R.eyes=[];
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz);
  J('root',null,0,0,0);J('body','root',0,2.55,0);J('chest','body',0,0,.6);J('hips','body',0,0,-.9);
  // ---- one torso: haunches, a gaunt waist, a deep ribcage and a hunched shoulder hump ----
  svM(R,'body',svG('ag_tor',()=>svLoftZ([[-2.5,.26,.3,0,.3],[-2.2,.58,.62,0,.16],[-1.75,.78,.8,0,.06],[-1.15,.74,.74,0,.02],[-.5,.6,.66,0,.02],[.15,.74,.86,0,-.1],[.75,.94,1.08,0,-.18],[1.3,1.0,1.08,0,-.02],[1.8,.9,.96,0,.28],[2.2,.62,.68,0,.5],[2.45,.42,.5,0,.62]],12)),fur);
  svM(R,'body',svG('ag_hmp',()=>svLump(.8,1,.25,11)),fur,0,.75,1.55,0,0,0,1.05,.7,1.15);
  // shaggy mane of quills on the shoulders, thinning toward the rump (bark plates between them)
  const QS=[[2.1,1.15,1.35],[1.85,1.25,1.5],[1.6,1.22,1.6],[1.35,1.15,1.45],[1.1,1.0,1.25],[.8,.92,1.05],[.45,.85,.85],[.1,.78,.7],[-.3,.7,.55],[-.75,.72,.5],[-1.2,.78,.45],[-1.65,.8,.38],[-2.05,.66,.3]];
  QS.forEach(([z,y,h],k)=>{[0,1,-1].forEach(sd=>{if(sd&&(k>8||k%2))return;svM(R,'body',svG('ag_q'+(k%3),()=>svHorn(.12,1,0,-.42-.12*(k%3),5,5)),bone,sd*.32,y-(sd?.12:0),z,-1.25+(sd?.2:0)-.04*k,sd*.35,sd*.25,1,1,h*(sd?.7:1))});
    if(k%2==0)svM(R,'body',svG('ag_pl',()=>svLump(.34,0,.4,7)),bark,(k%4?1:-1)*.45,y-.25,z-.15,0,k,0,1.1,.4,.9)});
  // ragged fur hanging from the belly and the flanks
  for(let k=0;k<16;k++){const sd=k%2?1:-1,z=-1.9+(k>>1)*.5;svM(R,'body',svG('ag_tf',()=>svHorn(.18,.75,0,-.25,4,3)),fur2,sd*.62,-.62-.08*Math.sin(k),z,2.5,sd*.25,sd*.35)}
  // bark plates on the flanks (armour-like hide)
  [[1.0,.2,.85],[.4,.1,.9],[-1.4,.25,.78],[1.6,.45,.8]].forEach(([z,y,x],k)=>[-1,1].forEach(sd=>svM(R,'body',svG('ag_pl2',()=>svLump(.42,0,.3,13)),bark,sd*x,y,z,0,sd*.4,sd*.2,.5,.9,1.2)));
  // ---- neck, head, jaw, horns ----
  J('neck','chest',0,.45,1.55,-.42);svM(R,'neck',svG('ag_nk',()=>svLoftZ([[-.1,.55,.6],[.55,.46,.5,0,.1],[1.2,.36,.4,0,.18]],8)),fur);
  for(let k=0;k<5;k++)svM(R,'neck',svG('ag_mn',()=>svHorn(.14,.85,0,-.3,4,3)),fur2,0,.42-.02*k,.1+k*.24,-1.3,0,0,1.4,1.2,1);
  J('head','neck',0,.2,1.2,.42);
  svM(R,'head',svG('ag_hd',()=>svLoftZ([[-.42,.4,.42,0,.08],[-.05,.46,.46,0,.1],[.35,.38,.36,0,.03],[.75,.25,.25,0,-.05],[1.15,.17,.16,0,-.08],[1.38,.11,.1,0,-.1]],8)),fur);
  svM(R,'head',svG('ag_ns',()=>svLump(.13,0,.2,2)),claw,0,-.04,1.4);
  for(let k=0;k<5;k++)[-1,1].forEach(s=>svM(R,'head',svG('ag_tu',()=>svHorn(.04,.24,0,0,4,2)),bone,s*(.16-.015*k),-.15,.6+k*.15,1.6,0,0));
  [-1,1].forEach(s=>{svM(R,'head',svG('ag_hn',()=>svHorn(.13,1.45,.0,.7,6,6)),bone,s*.28,.32,-.1,-2.55,s*.5,0);svM(R,'head',svG('ag_hn2',()=>svHorn(.07,.6,0,.25,5,4)),bone,s*.42,.2,.05,-2.2,s*1.1,0)});
  R.J.head.scale.setScalar(1.25);J('jaw','head',0,-.18,.05);
  svM(R,'jaw',svG('ag_jw',()=>svLoftZ([[-.05,.32,.12],[.55,.22,.1,0,-.03],[1.15,.12,.07,0,0]],7)),fur);
  svM(R,'jaw',svG('ag_tg',()=>svLoftZ([[.1,.18,.04,0,.08],[.9,.08,.03,0,.07]],6)),gum);
  for(let k=0;k<5;k++)[-1,1].forEach(s=>svM(R,'jaw',svG('ag_tl',()=>svHorn(.035,.2,0,0,4,2)),bone,s*(.17-.018*k),.07,.4+k*.15,-1.55,0,0));
  // the great brow eye
  const brow=J('brow','head',0,.38,.42);svM(R,'brow',svG('ag_bl',()=>svLump(.26,1,.15,9)),lid,0,0,0,0,0,0,1.15,.8,.8);
  R.big=svM(R,'brow',svG('ag_be',()=>new THREE.SphereGeometry(.2,10,8)),iris,0,.02,.12);svM(R,'brow',svG('ag_bs',()=>new THREE.BoxGeometry(.05,.3,.02)),slit,0,.02,.32);
  R.bigSpr=svSpr(R,'brow',ARG.col,.01,0,.02,.35);
  // ---- legs: long gaunt forelegs, digitigrade hind legs, black hooked claws ----
  [-1,1].forEach(s=>{const L=s>0?'L':'R';
    J('sh'+L,'chest',s*.74,-.25,.7);svM(R,'sh'+L,svG('ag_ua',()=>svLoft([[.35,.44,.5],[-.15,.46,.52,0,.04],[-.65,.32,.36,0,-.02],[-1.22,.2,.24]],8)),fur);
    J('el'+L,'sh'+L,0,-1.2,0);svM(R,'el'+L,svG('ag_fa',()=>svLoft([[.08,.22,.25],[-.45,.2,.22,0,.03],[-1.08,.13,.15]],7)),fur);svM(R,'el'+L,svG('ag_tf',()=>svHorn(.18,.75,0,-.25,4,3)),fur2,0,-.15,-.15,2.7,0,0,.8,.8,.7);
    J('pw'+L,'el'+L,0,-1.1,0);svM(R,'pw'+L,svG('ag_pw',()=>svLump(.24,0,.25,4)),fur,0,-.06,.12,0,0,0,1,.6,1.4);
    for(let c=0;c<4;c++)svM(R,'pw'+L,svG('ag_cl',()=>svHorn(.06,.42,0,-.18,4,3)),claw,(c-1.5)*.1,-.08,.32,.25,0,0);
    J('hp'+L,'hips',s*.6,-.2,-.45);svM(R,'hp'+L,svG('ag_th',()=>svLoft([[.35,.5,.62,0,-.05],[-.3,.46,.56,0,.1],[-.75,.3,.36,0,.22],[-1.08,.19,.22,0,.32]],8)),fur);
    J('kn'+L,'hp'+L,0,-1.05,.34);svM(R,'kn'+L,svG('ag_sh',()=>svLoft([[.05,.17,.2],[-.85,.12,.14,0,-.4]],6)),fur2);
    J('hk'+L,'kn'+L,0,-.85,-.42);svM(R,'hk'+L,svG('ag_hk',()=>svLoft([[.05,.12,.13],[-.55,.1,.12,0,.08]],5)),fur2);
    svM(R,'hk'+L,svG('ag_pw',()=>svLump(.24,0,.25,4)),fur,0,-.62,.18,0,0,0,.85,.55,1.25);
    for(let c=0;c<3;c++)svM(R,'hk'+L,svG('ag_cl',()=>svHorn(.06,.42,0,-.18,4,3)),claw,(c-1)*.1,-.66,.38,.25,0,0)});
  // ---- tail: four segments, ragged ----
  J('t0','hips',0,.22,-1.4,.5);let pp='t0';[.55,.5,.45].forEach((l,k)=>{J('t'+(k+1),pp,0,0,-l);pp='t'+(k+1)});
  ['t0','t1','t2','t3'].forEach((n,k)=>{const r=.24-.045*k;svM(R,n,svG('ag_t'+k,()=>svLoftZ([[0,r,r],[-.6,r*.8,r*.8]],6)),fur);svM(R,n,svG('ag_tt',()=>svHorn(.12,.55,0,.15,4,3)),fur2,0,.1,-.3,2.6,0,0)});
  // ---- the hundred eyes (well, twenty-six): lids, irises, slits on hide, legs, neck and face ----
  const EY=[['chest',.92,.25,.3],['chest',.98,-.15,.75],['chest',.86,.45,1.15],['chest',.7,-.55,.2],['chest',.6,.75,.55],['chest',.95,.05,-.25],
    ['hips',.78,.25,-.6],['hips',.7,-.1,-1.0],['hips',.55,.45,.0],['neck',.5,.1,.55],['neck',.42,.25,1.0],['shL',.36,-.3,.12],['hpL',.43,-.25,.1],['head',.36,.15,.25]];
  EY.forEach(([j,x,y,z],k)=>[-1,1].forEach(s=>{if(s<0&&k%5==4)return;const jn=s<0?j.replace(/L$/,'R'):j,g=new THREE.Group();g.position.set(s*x,y,z);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(s,y*.6,j==='head'?.9:.15).normalize());R.J[jn].add(g);const sc=.11+.05*((k*7)%3);
    svM(R,g,svG('ag_lid',()=>svLump(1,0,.2,5)),lid,0,0,0,0,0,0,sc*1.15,sc*.9,sc*.7);
    const ir=svM(R,g,svG('ag_eye',()=>new THREE.SphereGeometry(1,8,6)),iris,0,0,sc*.4,0,0,0,sc*.82,sc*.62,sc*.5);ir.userData.noMerge=1;
    svM(R,g,svG('ag_slit',()=>new THREE.BoxGeometry(.18,1,.1)),slit,0,0,sc*.85,0,0,0,sc,sc*.85,sc);
    R.eyes.push({g,ir,s:sc,b:Math.random()*6})}));
  R.root.traverse(o=>{if(o.isMesh)o.castShadow=true});
}
function argLoco(e,S,O,dt,now){const t=now/1000,sp=Math.min(1.6,S.spd/2.4);S.gp=(S.gp||0)+dt*(2.2+S.spd*1.25);const g=S.gp,a=Math.min(1,sp);
  const br=Math.sin(t*1.6);O.body[4]+=.05*br*(1-a)+.09*Math.abs(Math.sin(g))*a;O.body[0]+=.02*br;O.chest[0]+=-.02*br;
  O.neck[0]+=.05*Math.sin(t*.9)*(1-a)+.06*Math.sin(g*2)*a;O.neck[1]+=.12*Math.sin(t*.53);O.head[1]+=.1*Math.sin(t*.71+1);O.jaw[0]+=.04+.03*Math.sin(t*2.3);
  // gait: diagonal pairs
  const L=(n,ph,amp)=>{const s=Math.sin(g+ph),c=Math.cos(g+ph);return [s*amp,Math.max(0,c)]};
  [['L',0],['R',Math.PI]].forEach(([s,ph])=>{const f=L(0,ph,.5*a),h=L(0,ph+Math.PI,.45*a);
    O['sh'+s][0]+=-f[0];O['el'+s][0]+=f[1]*.7*a;O['pw'+s][0]+=-f[1]*.5*a;
    O['hp'+s][0]+=-h[0];O['kn'+s][0]+=h[1]*.5*a;O['hk'+s][0]+=-h[1]*.6*a});
  ['t0','t1','t2','t3'].forEach((n,k)=>{O[n][1]+=Math.sin(t*1.7-k*.7)*(.12+.05*k)*(1+a);O[n][0]+=-.05*k+.04*Math.sin(t*1.1-k)})}
// eyes: blink, open wide in Phase II, flare with the moves
function argPost(e,S,dt,now){const R=S.R,t=now/1000,open=S.ph>1?1:.45,fl=S.eyeF||0;S.eyeF=Math.max(0,fl-dt*1.5);
  R.eyes.forEach(E=>{let k=open;const bl=(t+E.b)%(S.ph>1?5.2:3.4);if(bl<.14)k*=.15;E.ir.scale.y=E.s*.62*k*(1+fl*.3);E.ir.scale.x=E.s*.82*(1+fl*.3)});
  const c=S.ph>1?ARG.col:ARG.dim;if(R._ic!==c+fl){R._ic=c+fl;R.iris.color.setHex(c).lerp(new THREE.Color(0xffffff),Math.min(.85,fl*.6))}
  const bc=S.bigC||0;S.bigC=Math.max(0,bc-dt*.0);R.bigSpr.scale.setScalar(.05+bc*2.2+(S.ph>1?.25:0)*(1+.15*Math.sin(t*5)))}
var ARGP={
  // rending claws (right), mirrored for the left with '~'
  cUp:{body:[-.16,-.32,.1,0,.18,-.1],chest:[0,-.1,0],neck:[-.25,-.25,0],head:[.3,-.15,.1],jaw:[.35,0,0],shR:[-1.75,0,-.6],elR:[1.05,0,0],pwR:[.7,0,0],shL:[.2,0,.1],elL:[-.1,0,0],hips:[0,.12,0]},
  cHit:{body:[.14,.38,-.08,0,-.08,.35],chest:[.05,.15,0],neck:[.15,.3,0],head:[-.05,.25,0],jaw:[.1,0,0],shR:[-.85,0,.55],elR:[.15,0,0],pwR:[-.35,0,0],shL:[.25,0,0],hips:[0,-.15,0]},
  cRec:{body:[.06,.18,-.03,0,-.05,.12],neck:[.08,.15,0],shR:[-.35,0,.2],elR:[.25,0,0],hips:[0,-.06,0]},
  // lunging bite
  coil:{body:[.2,0,0,0,-.55,-.35],chest:[.08,0,0],neck:[.32,0,0],head:[-.38,0,0],jaw:[.3,0,0],shL:[.55,0,.08],shR:[.55,0,-.08],elL:[-.4,0,0],elR:[-.4,0,0],hpL:[-.45,0,0],hpR:[-.45,0,0],knL:[.75,0,0],knR:[.75,0,0],hkL:[-.4,0,0],hkR:[-.4,0,0]},
  lunge:{body:[-.08,0,0,0,.1,.3],neck:[-.15,0,0],head:[.28,0,0],jaw:[.8,0,0],shL:[-1.25,0,0],shR:[-1.1,0,0],elL:[-.15,0,0],elR:[-.3,0,0],hpL:[.75,0,0],hpR:[.6,0,0],knL:[-.35,0,0],knR:[-.3,0,0],t0:[-.3,0,0]},
  bite:{body:[.12,0,0,0,-.12,.35],neck:[.12,0,0],head:[.32,0,0],jaw:[-.06,0,0],shL:[-.35,0,0],shR:[-.25,0,0],hpL:[.3,0,0],hpR:[.25,0,0]},
  // tail lash: it looks back first
  look:{body:[0,-.32,0],hips:[0,.4,-.05],neck:[-.1,-.7,0],head:[.1,-.55,.1],jaw:[.25,0,0],t0:[-.65,.7,0],t1:[-.25,.45,0],t2:[-.15,.35,0],t3:[0,.25,0],hpL:[.2,0,0]},
  lash:{body:[0,.38,0],hips:[0,-.6,.05],neck:[.05,-.3,0],head:[0,-.25,0],t0:[-.35,-1.25,0],t1:[-.1,-.8,0],t2:[0,-.6,0],t3:[0,-.45,0],hpR:[.25,0,0]},
  // the gaze: rear up, the brow eye charges, fire
  rear:{body:[-.55,0,0,0,.35,-.45],chest:[-.05,0,0],hips:[.45,0,0],hpL:[.35,0,0],hpR:[.35,0,0],knL:[.35,0,0],knR:[.35,0,0],hkL:[-.5,0,0],hkR:[-.5,0,0],shL:[-.75,0,.1],shR:[-.75,0,-.1],elL:[1.25,0,0],elR:[1.25,0,0],pwL:[.6,0,0],pwR:[.6,0,0],neck:[.05,0,0],head:[.42,0,0],jaw:[.25,0,0],t0:[.3,0,0]},
  fire:{body:[-.42,0,0,0,.28,-.6],hips:[.38,0,0],hpL:[.3,0,0],hpR:[.3,0,0],knL:[.3,0,0],knR:[.3,0,0],hkL:[-.45,0,0],hkR:[-.45,0,0],shL:[-.55,0,.1],shR:[-.55,0,-.1],elL:[1.0,0,0],elR:[1.0,0,0],neck:[.2,0,0],head:[.28,0,0],jaw:[.6,0,0]},
  // pounce
  pcr:{body:[.22,0,0,0,-.7,-.35],chest:[.06,0,0],neck:[.25,0,0],head:[-.28,0,0],jaw:[.2,0,0],shL:[.5,0,.12],shR:[.5,0,-.12],elL:[-.55,0,0],elR:[-.55,0,0],hpL:[-.7,0,0],hpR:[-.7,0,0],knL:[1.05,0,0],knR:[1.05,0,0],hkL:[-.6,0,0],hkR:[-.6,0,0],t0:[.4,0,0]},
  air:{root:[0,0,0,0,3.6,0],body:[-.25,0,0],neck:[-.1,0,0],head:[.2,0,0],jaw:[.7,0,0],shL:[-1.35,0,.15],shR:[-1.35,0,-.15],elL:[-.2,0,0],elR:[-.2,0,0],pwL:[-.5,0,0],pwR:[-.5,0,0],hpL:[1.0,0,0],hpR:[1.0,0,0],knL:[-.6,0,0],knR:[-.6,0,0],t0:[-.5,0,0],t1:[-.2,0,0]},
  land:{root:[0,0,0,0,0,0],body:[.32,0,0,0,-.6,.15],neck:[.35,0,0],head:[.05,0,0],jaw:[.1,0,0],shL:[-.4,0,.3],shR:[-.4,0,-.3],elL:[.65,0,0],elR:[.65,0,0],hpL:[-.35,0,0],hpR:[-.35,0,0],knL:[.7,0,0],knR:[.7,0,0],hkL:[-.4,0,0],hkR:[-.4,0,0]},
  // howl (awakening) and the intro
  howl:{body:[-.62,0,0,0,.42,-.5],chest:[-.1,0,0],hips:[.45,0,0],hpL:[.35,0,0],hpR:[.35,0,0],hkL:[-.45,0,0],hkR:[-.45,0,0],neck:[-.75,0,0],head:[-.35,0,0],jaw:[1.0,0,0],shL:[-.9,0,.2],shR:[-.9,0,-.2],elL:[1.35,0,0],elR:[1.35,0,0],t0:[-.7,0,0],t1:[-.3,0,0]},
  low:{body:[.3,0,0,0,-.8,0],neck:[.55,0,0],head:[.2,0,0],jaw:[0,0,0],shL:[.35,0,.35],shR:[.35,0,-.35],elL:[-.3,0,0],elR:[-.3,0,0],hpL:[-.5,0,0],hpR:[-.5,0,0],knL:[.9,0,0],knR:[.9,0,0],hkL:[-.5,0,0],hkR:[-.5,0,0],t0:[.5,0,0]},
  // blinding flare: hunch, every eye brightens, then flash
  hunch:{body:[.25,0,0,0,-.5,-.1],chest:[.1,0,0],neck:[.4,0,0],head:[.35,0,0],shL:[.3,0,.45],shR:[.3,0,-.45],elL:[-.2,0,0],elR:[-.2,0,0],hpL:[-.4,0,.2],hpR:[-.4,0,-.2],knL:[.7,0,0],knR:[.7,0,0],t0:[.5,0,0],t1:[.3,0,0]},
  flare:{body:[-.3,0,0,0,.25,0],neck:[-.35,0,0],head:[-.4,0,0],jaw:[1.0,0,0],shL:[-.4,0,-.25],shR:[-.4,0,.25],hpL:[.2,0,0],hpR:[.2,0,0],t0:[-.6,0,0]},
  // barrage: stand tall, eyes fire
  tall:{body:[-.18,0,0,0,.2,0],neck:[-.25,0,0],head:[.15,0,0],jaw:[.4,0,0],shL:[-.15,0,-.12],shR:[-.15,0,.12],t0:[-.4,0,0]},
  tallB:{body:[-.22,.12,0,0,.25,0],neck:[-.3,.12,0],head:[.12,0,0],jaw:[.5,0,0],t0:[-.45,.3,0]},
  // stagger and death
  stag:{body:[.38,0,.28,0,-1.0,0],neck:[.6,0,.25],head:[.35,0,.35],jaw:[.5,0,0],shL:[.85,0,.5],shR:[.4,0,-.2],elL:[-1.1,0,0],elR:[-.4,0,0],hpL:[-.7,0,.2],hpR:[-.4,0,0],knL:[1.2,0,0],knR:[.9,0,0],hkL:[-.6,0,0],t0:[.6,0,0],t1:[.3,0,0]},
  dead:{root:[0,0,1.42,0,-.1,0],body:[.1,0,0,0,-1.3,0],neck:[.3,.3,0],head:[.2,.2,0],jaw:[.7,0,0],shL:[-.4,0,.2],shR:[-.7,0,-.1],elL:[.3,0,0],hpL:[.3,0,0],hpR:[.5,0,0],knL:[-.4,0,0],t0:[.2,.4,0],t1:[0,.4,0]}};
function argEyeBolt(c,i){const e=c.e,S=c.S,R=S.R,E=R.eyes[(i*7+3)%R.eyes.length],p=new THREE.Vector3();E.g.getWorldPosition(p);
  const q=c.inA(pl.position.clone().add(new THREE.Vector3(((pl.mvd&&pl.mvd.x)||0)*.9,0,((pl.mvd&&pl.mvd.z)||0)*.9)),.8),S2={k:'c',r:1.9},an={x:q.x,z:q.z,a:0},T=.72;
  S.eyeF=1;kqFlash(p,ARG.col,1.4,200);svSnd('crack',.5,1.6);c.M.warn.push(svWarn(S2,an,T));
  svShot(p,new THREE.Vector3(q.x,GH(q.x,q.z)+.3,q.z),T,ARG.col,1.3,3.5,P=>{if(e.dead||!AF)return;burst(P,ARG.col,18,2.5,2.4,.5);svShock(P,ARG.col,1.9,.3);svDecal(P,0x3a2a08,1.4,2.4,.5);svHitNow(e,S2,an,.75,{})})}
function argBeam(c,an,L){const e=c.e,o=svWP(e,'brow',0,.02,.3),end=new THREE.Vector3(an.x+Math.sin(an.a)*L,0,an.z+Math.cos(an.a)*L);end.y=GH(end.x,end.z)+.4;
  const d=end.clone().sub(o),len=d.length(),g=svG('ag_bm',()=>{const q=new THREE.CylinderGeometry(1,1,1,8,1,true);q.translate(0,.5,0);q.rotateX(Math.PI/2);return q});
  const m1=new THREE.MeshBasicMaterial({color:ARG.col,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),m2=new THREE.MeshBasicMaterial({color:0xfff8e0,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
  const b1=new THREE.Mesh(g,m1),b2=new THREE.Mesh(g,m2);[b1,b2].forEach(b=>{b.position.copy(o);b.lookAt(end);b.renderOrder=24;b.frustumCulled=false;scene.add(b)});b1.scale.set(.7,.7,len);b2.scale.set(.22,.22,len);
  let t=0;shake(.25);svSnd('charge',.4,2);kqFlash(o,0xffffff,4,260);for(let s=2;s<L;s+=1.4){const q=new THREE.Vector3(an.x+Math.sin(an.a)*s,0,an.z+Math.cos(an.a)*s);burst(gY(q,.3),ARG.col,3,1.2,1.6,.5);if(s%2.8<1.4)svDecal(q,0x2a1a04,1.1,3,.6)}
  kqFx({tick(dt){t+=dt||0;const k=t/.42;b1.scale.x=b1.scale.y=.7*(1-k*.8);b2.scale.x=b2.scale.y=.22*(1-k);m1.opacity=.8*(1-k);return k<1},end(){scene.remove(b1,b2);m1.dispose();m2.dispose()}})}
var ARGM={
  intro:{dur:2.6,trk:[[.3,'low','io'],[.9,'low','io',.01],[1.5,'howl','o'],[2.2,'howl','l',.02],[2.6,'cRec','io']],trn:[[0,2.6,1.5]],
    ev:[[.95,c=>{c.S.eyeF=1.2;svSnd('hum',.6)}],[1.45,c=>{svSnd('roar',1);shake(.35);c.S.bigC=.4;svShock(c.m.position,ARG.col,8,.8)}],[2.4,c=>{c.S.bigC=0}]]},
  claw:{wt:10,r:[0,6.2],a:'f',mel:1,dur:1.3,lock:.48,trk:[[.5,'cUp','io'],[.66,'cUp','l',.02],[.8,'cHit','s'],[1.0,'cRec','io'],[1.3,'cRec','io']],
    hit:[{t:.78,s:{k:'a',r:5.6,h:1.05},f:.3,dm:1.05}],tr:[[.68,.86,'pwR',[0,-.1,.75],[0,0,0],0xffe8a0]],ev:[[.18,c=>svSnd('hum',.25,1.5)],[.7,c=>svSnd('swing',.8)]],
    nx:[['claw2',.65,7]],rec:.2},
  claw2:{dur:1.15,mel:1,lock:.3,trk:[[.36,'cUp~','io'],[.5,'cUp~','l',.02],[.64,'cHit~','s'],[.85,'cRec~','io'],[1.15,'cRec~','io']],
    hit:[{t:.62,s:{k:'a',r:5.6,h:1.05},f:.3,dm:1.05}],tr:[[.52,.7,'pwL',[0,-.1,.75],[0,0,0],0xffe8a0]],ev:[[.55,c=>svSnd('swing',.8,.9)]],
    nx:[['snapF',.45,9],['flare',.3,6]],rec:.15},
  snapF:{dur:1.4,mel:1,lock:.45,trk:[[.4,'coil','io'],[.56,'coil','l',.015],[.78,'lunge','o'],[.9,'bite','s'],[1.4,'cRec','io']],
    rm:[[.58,.9,'tgt','o',1.3,6]],hit:[{t:.88,s:{k:'a',r:4.2,h:.6},f:1.2,dm:1.25,track:1,show:false}],ev:[[.58,c=>svSnd('whoosh',.8)],[.88,c=>{svSnd('crack',.8,.7);shake(.15)}]]},
  snap:{wt:8,r:[4.5,11],a:'f',dur:1.75,lock:.62,trk:[[.55,'coil','io'],[.78,'coil','l',.02],[1.02,'lunge','o'],[1.14,'bite','s'],[1.75,'cRec','io']],
    rm:[[.82,1.14,9,'o']],hit:[{t:1.12,s:{k:'l',w:3,l:10.5,b:.5},f:0,dm:1.3,w:.62}],ev:[[.3,c=>svSnd('hiss',.4,.6)],[.82,c=>svSnd('whoosh',1)],[1.12,c=>{svSnd('crack',.9,.6);shake(.2);burst(gY(c.at(3),1.2),0xffe0b0,12,2,1.5,.4)}]],
    nx:[['claw',.35,6]],rec:.3},
  tail:{wt:12,r:[0,7.5],a:'sb',mel:1,dur:1.3,lock:.3,trn:[[0,.3,2]],trk:[[.45,'look','io'],[.62,'look','l',.015],[.82,'lash','s'],[1.3,'cRec','io']],
    hit:[{t:.8,s:{k:'a',r:6.4,h:1.25},f:-.6,ay:Math.PI,dm:1.1,kb:3}],tr:[[.66,.9,'t3',[0,0,-.6],[0,0,0],0xc8a060]],ev:[[.3,c=>svSnd('hiss',.5)],[.72,c=>svSnd('whoosh',.9,.8)]],rec:.25},
  gaze:{wt:7,r:[8,60],a:'any',dur:2.6,lock:1.15,trn:[[0,1.15,3]],armor:1,trk:[[.6,'rear','io'],[1.25,'rear','l',.025],[1.4,'fire','s'],[2.0,'fire','l'],[2.6,'cRec','io']],
    hit:[{t:1.38,s:{k:'l',w:2.4,l:30,b:0},f:1.5,dm:1.45,w:.95,fx:(c,an)=>argBeam(c,an,30)}],
    ev:[[.25,c=>{svSnd('charge',.7);svCharge(c.e,'brow',ARG.col,2.4,1.1,0,.02,.3)}],[.3,c=>{c.S.bigC=0}]],
    tk(c,dt){c.S.bigC=Math.min(1,c.M.t/1.3)*(c.M.t<1.45?1:0)},end(c){c.S.bigC=0},nx:[['gaze2',.0]],rec:.5},
  gaze2:{dur:1.6,lock:.62,ph:2,trn:[[0,.62,3.4]],armor:1,trk:[[.3,'rear','io'],[.68,'rear','l',.025],[.8,'fire','s'],[1.6,'cRec','io']],
    hit:[{t:.78,s:{k:'l',w:2.4,l:30,b:0},f:1.5,dm:1.35,w:.6,fx:(c,an)=>argBeam(c,an,30)}],ev:[[.05,c=>{svSnd('charge',.6,1.2);svCharge(c.e,'brow',ARG.col,2,.7,0,.02,.3)}]],rec:.6},
  pounce:{wt:9,r:[6.5,24],a:'fs',dur:2.1,lock:.6,armor:1,trn:[[0,.6,4]],trk:[[.5,'pcr','io'],[.62,'pcr','l',.02],[.92,'air','o'],[1.2,'land','i'],[1.75,'land','l'],[2.1,'cRec','io']],
    rm:[[.64,1.2,'tgt','l',.3,26]],hit:[{t:1.2,s:{k:'c',r:3.8},o:'tgt',dm:1.5,w:.62,kb:2.5,fx:(c,an)=>{const p=new THREE.Vector3(an.x,0,an.z);svShock(p,0xc8b080,5,.5);burst(gY(p,.4),0x5a4a30,40,4,3,.8);svDecal(p,0x1a1408,3,4,.6);shake(.4);svSnd('heavy',1)}}],
    ev:[[.62,c=>svSnd('whoosh',1,.7)]],rec:.35},
  // ---- Phase II ----
  awaken:{dur:3.2,inv:[0,3.2],armor:1,trk:[[.4,'low','io'],[1.0,'low','l',.03],[1.45,'howl','o'],[2.6,'howl','l',.025],[3.2,'cRec','io']],trn:[[0,3,1]],
    hit:[{t:1.5,s:{k:'c',r:7.5},dm:.5,kb:6,w:1.1,fx:c=>{svShock(c.m.position,ARG.col,10,.7);svShock(c.m.position,0xffffff,6,.45)}}],
    ev:[[.05,c=>{banner('THE EYES OPEN','Argus wakes every eye','');svSnd('hum',.8,.7)}],[1.0,c=>{c.S.ph=2;c.e.bs.ph=2;c.S.eyeF=2;flash('rgba(255,210,80,.35)');svSnd('roar',1.1,.85);shake(.5)}],[1.6,c=>svSnd('shriek',.6,.6)]]},
  barrage:{wt:8,ph:2,r:[5,40],a:'any',dur:3.0,armor:1,trn:[[0,3,2.2]],trk:[[.4,'tall','io'],[.7,'tall','l',.02],[1.0,'tallB','io'],[1.5,'tall','io'],[2.0,'tallB','io'],[2.4,'tall','io'],[3.0,'cRec','io']],
    ev:[[.15,c=>{svSnd('hum',.7,1.3);c.S.eyeF=1.2}]].concat([0,1,2,3,4,5,6].map(i=>[.55+i*.3,c=>argEyeBolt(c,i)])),rec:.4},
  flare:{wt:7,ph:2,r:[0,7],a:'any',dur:2.2,armor:1,trn:[[0,.4,2]],trk:[[.45,'hunch','io'],[1.25,'hunch','l',.03],[1.38,'flare','s'],[1.8,'flare','l'],[2.2,'cRec','io']],
    hit:[{t:1.36,s:{k:'c',r:7},dm:1.6,w:1.25,fx:c=>{kqFlash(gY(c.m.position,2.5),0xffffff,14,420);flash('rgba(255,240,180,.45)');svShock(c.m.position,ARG.col,8,.45);burst(gY(c.m.position,2),ARG.col,60,6,4,.7);svSnd('crack',1,.5);shake(.35)}}],
    tk(c,dt){c.S.eyeF=c.M.t<1.4?Math.min(2,c.M.t*1.6):0},ev:[[.2,c=>svSnd('charge',.6,.6)]],rec:.6}};
// Phase II combo strings
ARGM.claw2.nx=[['snapF',.45,9],['flare',.3,7]];
svReg(0,{name:'Argus',col:ARG.col,body:2.3,ph2:.55,poise:.17,headJ:'head',turnA:4,
  ai:{pref:4.6,walk:2.6,run:4.2,turn:2.2,rest:[.9,1.6],ph2r:.7,strafe:.4},
  build:argBuild,loco:argLoco,post:argPost,P:ARGP,M:ARGM,
  stag:[[.25,'stag','o'],[2.0,'stag','l',.02],[2.6,'cRec','io']],stagT:2.6,
  die:[[.4,'stag','o'],[1.2,'dead','i'],[2.1,'dead','l']],
  homeY(A){return Math.atan2(Math.cos(AR&&AR.ent!=null?AR.ent:0),Math.sin(AR&&AR.ent!=null?AR.ent:0))},
  awake(e){e.sv.eyeF=1},reset(e){e.sv.eyeF=0;e.sv.bigC=0},
  dying(e,t){if(t<1.5)e.sv.eyeF=Math.max(0,1-t)}});
