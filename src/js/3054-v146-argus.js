// ================= v146 Argus, the Hundred-Eyed — a new model, and the fight to the Vorraxis standard =================
// The owner asked for Argus' model to be redone completely (same idea: a giant bog-wolf covered in eyes). argBuild146
// replaces argBuild (1971) and builds every part anew on the same skeleton (the joint names and rest positions stay, so
// the v110/v112 poses and moves keep working).
//  * Silhouette: a hulking, hunched bog-wolf — a deep chest and shoulder hump, a gaunt waist, heavy haunches, long gaunt legs,
//    a long skull-like muzzle under a pair of branching bog-elk antlers, a bony tail.
//  * Coat: ~340 shingled fur tufts laid in rows over the body (dark on the back, mossy-grey on the flanks, pale on the belly),
//    each turned to the surface and lifted at the tip; a torn window in the hide on each flank shows the ribs, a dark
//    membrane and glowing amber veins; a shaggy mane of long tufts and bone quills; bog moss, hanging weed, glowing
//    mushrooms and roots tangled round the legs.
//  * Bone: vertebrae and spurs along the spine, exposed tendons on the forelegs, elbow and hock spurs, long black claws.
//  * The eyes: more than fifty lidded eyes with slit pupils over the flanks, neck, legs, tail and face (a cluster of six
//    along each side of the muzzle, the great brow eye in the forehead) — they blink, half-shut in Phase I, staring in II.
//  * Trophies: the riveted iron collar with its broken chain and skull, a trophy belt, three broken spears with rags.
//  * Motion: ears, jaw, tail, the mane and the hanging weed follow through on springs.
// The fight (all Phase II):
//  * Den change, "The Drowned Fog": a low bog fog fills the hollow and will-o'-wisps drift through it toward you; touching
//    one bursts it (damage, Hexed: slowed).
//  * Signature mechanic, The Hundred Eyes: Argus sinks into the fog (only his eyes show; warded) and four great Watcher Eyes
//    open on the walls of the hollow, each firing at you. Shut all four and he is dragged out of the fog, BROKEN. If any
//    still watch when the gaze completes he heals (10%) and every eye fires at once: a storm of bolts on your trail.
//  * Effects: eye bolts streak and crack the floor, the gaze beam scorches a trail, the furrow spikes burst into amber
//    shards, the pounce lands in a wall of mud and shards, every claw hit throws sparks and blood.
var ARG146={col:0xffd040,tor:[[-2.6,.28,.32,0,.32],[-2.3,.62,.66,0,.18],[-1.85,.84,.86,0,.06],[-1.3,.8,.8,0,.0],[-.7,.58,.64,0,.02],[-.15,.62,.7,0,-.06],[.4,.86,1.0,0,-.16],[.95,1.04,1.14,0,-.18],[1.45,1.08,1.14,0,-.02],[1.9,.96,1.02,0,.26],[2.25,.68,.74,0,.48],[2.5,.44,.52,0,.6]]};
function argBuild146(R,e){const T0=ARG.TOR;ARG.TOR=ARG146.tor;try{arg146Body(R)}finally{ARG.TOR=T0}}
function arg146Body(R){
  const fur=svMat(R,0x1e1a16,{roughness:.96,emissive:0x0e0a08}),furM=svMat(R,0x3a4236,{roughness:.95,emissive:0x0a0c08}),furP=svMat(R,0x6a6a5a,{roughness:.95,emissive:0x0c0c08}),
    hide=svMat(R,0x3a2c26,{roughness:.8,emissive:0x0a0604}),mem=svMat(R,0x4a1820,{roughness:.6,emissive:0x1a0408}),bark=svMat(R,0x2e2418,{roughness:.9,emissive:0x080604}),
    bone=svMat(R,0xc8b898,{roughness:.6,emissive:0x302818}),claw=svMat(R,0x0e0c10,{roughness:.35,metalness:.25}),gum=svMat(R,0x6a1c24,{roughness:.55,emissive:0x200408}),
    moss=svMat(R,0x4a6a30,{roughness:.95,emissive:0x0c1406}),iron=svMat(R,0x3a3430,{roughness:.5,metalness:.65,emissive:0x0a0806}),rag=svMat(R,0x4a4030,{roughness:1,side:THREE.DoubleSide}),
    iris=svGlowMat(R,ARG.dim),vein=svGlowMat(R,ARG.vein),cap=svGlowMat(R,0x9aff8a);R.iris=iris;R.vein=vein;R.eyes=[];
  const J=(n,p,x,y,z,rx,ry,rz)=>svJ(R,n,p,x,y,z,rx,ry,rz),V3=THREE.Vector3,Z=new V3(0,0,1),G=(k,f)=>svG('a46'+k,f),Mm=(j,g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>svM(R,j,g,m,x,y,z,rx,ry,rz,sx,sy,sz);
  const aim=(m,d,roll)=>{m.quaternion.setFromUnitVectors(Z,new V3(d[0],d[1],d[2]).normalize());if(roll)m.rotateZ(roll);return m};
  const tuftG=G('tuft',()=>{const g=svHorn(.15,.62,0,-.16,4,2);g.scale(1.75,.45,1);return g}),tuftL=G('tufL',()=>{const g=svHorn(.15,1.0,0,-.35,4,3);g.scale(1.55,.45,1);return g}),
    ball=G('ball',()=>svLump(1,0,.12,21)),gClaw=G('cl',()=>svHorn(.065,.5,0,-.22,5,4)),gToe=G('toe',()=>svLump(.1,0,.25,8));
  // ---- skeleton (same names and rest positions as 1971) ----
  J('root',null,0,0,0);J('body','root',0,2.55,0);J('chest','body',0,0,.6);J('hips','body',0,0,-.9);
  // ---- the torso under the coat ----
  Mm('body',G('tor',()=>svLoftZ(ARG146.tor,18)),hide);
  Mm('body',G('hmp',()=>svLump(.85,1,.2,11)),fur,0,.8,1.5,0,0,0,1.1,.75,1.2);
  // the coat: rows of tufts, skipping the torn windows on the flanks (z -.6..1.1, th .75..2.05)
  const tuft=(j,p,d,roll,m,s,L)=>{const o=Mm(j,L?tuftL:tuftG,m,p[0],p[1],p[2]);aim(o,d,roll);if(s)o.scale.multiplyScalar(s);return o};
  const win=(z,th)=>z>-.6&&z<1.1&&th>.75&&th<2.05;
  for(let z=-2.45,row=0;z<2.35;z+=.26,row++){const [rx,ry]=argTor(z);const nTh=Math.max(4,Math.round(rx*8));for(let q=0;q<=nTh;q++){const th=q/nTh*2.95+(row%2?.09:0);[1,-1].forEach(sd=>{if(sd<0&&q===0)return;if(win(z,th))return;
      const p=argTS(z,th,1.0,sd),n=[sd*Math.sin(th)/rx,Math.cos(th)/ry,0],nl=Math.hypot(n[0],n[1])||1,d=[n[0]/nl*.38,n[1]/nl*.38-.12,-1];
      const m=th<.9?fur:th<2.1?(((q+row)%4===0)?furP:furM):furP;tuft('body',p,d,-sd*th,m,(.85+.25*((q*7+row*3)%3)/2)*(1+.25*Math.sin(z*1.3)))})}}
  // the torn windows: ribs, the dark membrane, veins, ragged hide edges
  [1,-1].forEach(sd=>{for(let z=-.45;z<1.0;z+=.3){const P=[];for(let q=0;q<7;q++){const th=.78+q*.2;P.push(argTS(z+Math.sin(q*.5)*.05,th,1.04+.02*Math.sin(q*.9),sd))}Mm('body',G('rb'+Math.round(z*10)+sd,()=>svTube(P,.065,5)),bone)}
    {const P=[];for(let q=0;q<=6;q++){const th=.8+q*.2;P.push(argTS(.25,th,.96,sd))}Mm('body',G('mb'+sd,()=>svTube(P,[.7,.72,.72,.72,.7,.6,.5].map(r=>[.05,r]),5)),mem)}
    [-.3,.0,.3,.6,.9].forEach((z,k)=>{const P=[];for(let q=0;q<7;q++){const th=.85+q*.18;P.push(argTS(z+.13+Math.sin(q*1.7+k)*.05,th,1.0,sd))}Mm('body',G('vn'+k+sd,()=>svTube(P,.028,4)),vein)});
    for(let k=0;k<10;k++){const z=-.6+k*.18;[.75,2.05].forEach(th=>{const p=argTS(z,th,1.02,sd);tuft('body',p,[sd*Math.sin(th)*.6,Math.cos(th)*.6-.3,-.4],-sd*th,hide,.7)})}});
  // the spine: vertebrae and spurs, the mane of long tufts and bone quills on the hump
  for(let z=-2.3;z<2.1;z+=.3){const p=argTS(z,0,1.02,1);Mm('body',G('vt',()=>svLump(.11,0,.2,12)),bone,p[0],p[1],p[2],0,0,0,1,.7,1.2);if(Math.round(z*10)%6===0)aim(Mm('body',G('vs',()=>svHorn(.06,.34,0,-.1,4,2)),bone,p[0],p[1]+.05,p[2]),[0,1,-.6])}
  for(let k=0;k<26;k++){const z=1.0+(k%13)*.12,th=(k<13?-1:1)*(.15+(k%4)*.22),p=argTS(z,Math.abs(th),1.05,Math.sign(th)||1);tuft('body',[p[0],p[1]+.1,p[2]],[Math.sign(th)*.4,.5,-1],-th,k%3?fur:furM,1.1,1)}
  const QS=[[2.1,1.2,1.3],[1.85,1.3,1.45],[1.6,1.28,1.55],[1.35,1.2,1.4],[1.1,1.06,1.2],[.8,.98,1.0],[.45,.9,.8]];
  QS.forEach(([z,y,h],k)=>[0,1,-1].forEach(sd=>{if(sd&&k%2)return;Mm('body',G('q'+(k%3),()=>svHorn(.11,1,0,-.42-.1*(k%3),5,5)),bone,sd*.3,y-(sd?.1:0),z,-1.25+(sd?.2:0)-.04*k,sd*.35,sd*.25,1,1,h*(sd?.7:1))}));
  // bog: moss on the back and haunches, hanging weed, glowing mushrooms
  [[-1.9,.3],[-1.4,.5],[.2,.25],[1.3,.4],[-2.2,.9],[-.9,.4]].forEach(([z,th],k)=>[1,-1].forEach(sd=>{if((k+(sd>0?0:1))%2)return;const p=argTS(z,th,1.06,sd);Mm('body',G('ms'+(k%3),()=>svLump(.3,1,.4,40+k%3)),moss,p[0],p[1],p[2],0,0,0,1.2,.35,1.1)}));
  for(let k=0;k<14;k++){const sd=k%2?1:-1,z=-2.0+(k>>1)*.55,p=argTS(z,2.65,.98,sd);Mm('body',G('wd'+(k%3),()=>svBlade([[-.04,0],[.04,0],[.03,-.5-(k%3)*.15],[0,-.6-(k%3)*.15],[-.02,-.45]],.01)),moss,p[0],p[1],p[2],0,sd*.3,0)}
  [[-1.6,.2],[.0,.15],[1.2,.3],[-1.0,.6]].forEach(([z,th],k)=>{const p=argTS(z,th,1.05,k%2?1:-1);for(let q=0;q<3;q++){Mm('body',G('mst',()=>new THREE.CylinderGeometry(.02,.03,.16,4).toNonIndexed()),furP,p[0]+q*.08,p[1]+.08,p[2]+q*.05);Mm('body',G('mcp',()=>new THREE.SphereGeometry(.07,6,3,0,Math.PI*2,0,Math.PI/2).toNonIndexed()),cap,p[0]+q*.08,p[1]+.16,p[2]+q*.05)}});
  // the trophy belt
  {const P=[];for(let q=0;q<=18;q++){const th=q/18*Math.PI*2;const [x,y]=argTS(-.7,th,1.1,1);P.push([x,y,-.7+.05*Math.cos(th)])}Mm('body',G('belt',()=>svTube(P,.08,5,{cap:false})),hide);
    for(let q=0;q<10;q++){const th=.3+q*.29;[-1,1].forEach(sd=>{const [x,y]=argTS(-.7,th,1.16,sd);Mm('body',G('riv',()=>svLump(.07,0,.15,5)),iron,x,y,-.7)})}
    [[1,1.8],[-1,2.1]].forEach(([sd,th],k)=>{const [x,y]=argTS(-.7,th,1.15,sd);Mm('body',G('cd',()=>svTube([[0,0,0],[0,-.2,.02],[0,-.38,0]],.02,3)),hide,x,y,-.7);
      Mm('body',G('sk',()=>svLump(.16,1,.12,31)),bone,x,y-.5,-.78,0,sd,0,1,.85,1.15)})}
  // three broken spears with rags
  [[.42,.75,-.55,.6,1,-.5,1.1],[-.5,.66,.25,-.8,.9,.25,.85],[.3,1.0,-1.55,.35,1,-.2,.95]].forEach(([x,y,z,dx,dy,dz,l],k)=>{aim(Mm('body',G('sp'+k,()=>svLoftZ([[-.5,.05,.05],[l*.8,.045,.045],[l,.03,.05,.02,.01]],5)),bark,x,y,z),[dx,dy,dz]);
    aim(Mm('body',G('spr',()=>svBlade([[0,0],[.25,-.05],[.3,-.45],[.12,-.38],[.02,-.5]],.01)),rag,x+dx*.75*l,y+dy*.75*l,z+dz*.75*l),[dx,dy,dz])});
  // ---- the neck: coat, iron collar with a broken chain and a skull, mane ----
  J('neck','chest',0,.45,1.55,-.42);Mm('neck',G('nk',()=>svLoftZ([[-.1,.55,.6],[.55,.46,.5,0,.1],[1.2,.36,.4,0,.18],[1.45,.3,.34,0,.2]],14)),hide);
  for(let z=0;z<1.4;z+=.23)for(let q=0;q<=6;q++){const th=q/6*2.9;[1,-1].forEach(sd=>{if(sd<0&&q===0)return;const k=1-z/1.6,rx=.55*k+.05,ry=.6*k+.05,oy=.12*z/1.4;const p=[sd*Math.sin(th)*rx,oy+Math.cos(th)*ry,z];tuft('neck',p,[sd*Math.sin(th)*.4,Math.cos(th)*.4,-1],-sd*th,th<1.2?fur:furM,1.1,z<.5)})}
  {const ring=(z,k)=>{const P=[];for(let q=0;q<=18;q++){const t=q/18*Math.PI*2,rx=.55-(.09*(z+.1)/.65),ry=.6-(.1*(z+.1)/.65),oy=.1*(z+.1)/.65;P.push([Math.sin(t)*rx*k,oy+Math.cos(t)*ry*k,z])}return P};
    Mm('neck',G('col',()=>svTube(ring(.18,1.12),.09,6,{cap:false})),iron);Mm('neck',G('col2',()=>svTube(ring(.36,1.1),.05,5,{cap:false})),iron);
    for(let q=0;q<12;q++){const t=q/12*Math.PI*2;Mm('neck',G('riv',()=>svLump(.07,0,.15,5)),iron,Math.sin(t)*.63,.04+Math.cos(t)*.69,.18)}
    const g=G('lk',()=>new THREE.TorusGeometry(.085,.03,4,6).toNonIndexed());let px=.12,py=-.62,pz=.12;for(let q=0;q<6;q++){Mm('neck',g,iron,px,py,pz,q%2?0:Math.PI/2,0,1.15);py-=.12;pz-=.05;px+=.01}
    Mm('neck',G('sk',()=>svLump(.16,1,.12,31)),bone,px,py-.12,pz-.06,0,0,0,1,.85,1.15)}
  // ---- the head: a long skull-like muzzle, brow ridges, cheek bones, antlers, torn ears, eyes ----
  J('head','neck',0,.2,1.2,.42);
  Mm('head',G('hd',()=>svLoftZ([[-.45,.42,.44,0,.08],[-.2,.48,.48,0,.1],[.1,.45,.43,0,.07],[.4,.34,.33,0,.02],[.7,.26,.25,0,-.03],[.98,.2,.19,0,-.06],[1.22,.15,.14,0,-.08],[1.42,.1,.09,0,-.1]],14)),hide);
  Mm('head',G('nos',()=>svLump(.14,1,.15,2)),claw,0,-.03,1.42,0,0,0,1.1,.8,.9);
  [-1,1].forEach(s=>{Mm('head',G('brw',()=>svTube([[0,0,-.1],[.06,.06,.15],[.04,.04,.45]],[.07,.08,.05],5)),bone,s*.22,.32,.15);
    Mm('head',G('chb',()=>svTube([[0,0,0],[.04,-.02,.3],[0,-.04,.6]],[.06,.05,.03],5)),bone,s*.32,.0,.1);
    for(let k=0;k<5;k++)Mm('head',G('tu',()=>svHorn(.04,.24,0,0,4,2)),bone,s*(.16-.015*k),-.15,.6+k*.15,1.6,0,0);
    Mm('head',G('fg',()=>svHorn(.065,.46,0,.06,5,3)),bone,s*.15,-.12,1.0,1.62,0,0);
    // antlers: a curving beam with four tines
    const A=svJ(R,'ant'+(s>0?'L':'R'),'head',s*.26,.4,-.12,0,0,0),beam=[[0,0,0],[s*.25,.45,-.15],[s*.55,.85,-.2],[s*.75,1.3,-.1],[s*.85,1.7,.1]];
    Mm(A,G('ab'+s,()=>svTube(beam,[.09,.08,.065,.05,.035],6)),bone);
    [[1,s*.25,.55,.55],[2,s*.15,.5,.6],[3,s*.3,.35,.5],[3,-s*.1,.55,.45]].forEach(([i,dx,dy,l],k)=>{const p=beam[i],o=Mm(A,G('at',()=>svHorn(.045,1,0,.15,5,3)),bone,p[0],p[1],p[2]);aim(o,[dx,dy,.3]);o.scale.set(1,1,l)});
    for(let k=0;k<3;k++)Mm(A,G('amo',()=>svBlade([[-.03,0],[.03,0],[.02,-.35],[0,-.42],[-.02,-.3]],.008)),moss,beam[1+k][0],beam[1+k][1],beam[1+k][2],0,s*.5,0);
    for(let k=0;k<5;k++)tuft('head',[s*.36,.25-.08*k,-.25+.06*k],[s*.6,.2,-1],-s,fur,.9);
    for(let k=0;k<3;k++)Mm('head',G('run',()=>new THREE.BoxGeometry(.035,.035,.16)),vein,s*(.11+.07*k),.47-.035*k,.3-.06*k,-.2,s*(.5+.25*k),0)});
  for(let z=-.4;z<.5;z+=.22)for(let q=0;q<=3;q++){const th=q/3*1.4;[1,-1].forEach(sd=>{if(sd<0&&q===0)return;tuft('head',[sd*Math.sin(th)*.46,.1+Math.cos(th)*.48,z],[sd*Math.sin(th)*.3,.35,-1],-sd*th,fur,.8)})}
  R.J.head.scale.setScalar(1.25);
  // ears (their own joints: they twitch), torn
  [-1,1].forEach(s=>{const L=s>0?'L':'R';J('ear'+L,'head',s*.3,.36,-.18,-.55,0,-s*.45);
    Mm('ear'+L,G('ear',()=>svLoft([[-.05,.15,.06],[.2,.13,.05,0,.02],[.32,.1,.04,0,.03],[.45,.05,.03,0,.04],[.62,.015,.015,0,.06]],5)),fur);
    Mm('ear'+L,G('ein',()=>svLoft([[0,.09,.02,0,.04],[.38,.04,.015,0,.06]],4)),gum);if(s>0)Mm('ear'+L,G('er',()=>new THREE.TorusGeometry(.06,.016,4,8).toNonIndexed()),iron,.08,.22,0,0,Math.PI/2,0)});
  J('jaw','head',0,-.18,.05);
  Mm('jaw',G('jw',()=>svLoftZ([[-.05,.32,.12],[.35,.26,.11,0,-.02],[.75,.18,.09,0,-.03],[1.15,.12,.07,0,0]],10)),hide);
  Mm('jaw',G('tg',()=>svLoftZ([[.1,.18,.04,0,.08],[.9,.08,.03,0,.07]],6)),gum);
  for(let k=0;k<5;k++)[-1,1].forEach(s=>Mm('jaw',G('tl',()=>svHorn(.035,.2,0,0,4,2)),bone,s*(.17-.018*k),.07,.4+k*.15,-1.55,0,0));
  [-1,1].forEach(s=>{Mm('jaw',G('fg2',()=>svHorn(.045,.3,0,-.04,5,3)),bone,s*.12,.06,.95,-1.55,0,0);for(let k=0;k<3;k++)tuft('jaw',[s*.2,-.08,.1+.25*k],[s*.3,-.6,-1],0,furM,.75)});
  Mm('jaw',G('drl',()=>svTube([[0,0,0],[.02,-.2,.02],[0,-.42,.04]],[.025,.018,.01],4)),gum,.08,-.02,.9);
  // the great brow eye
  J('brow','head',0,.38,.42);Mm('brow',G('bl',()=>svLump(.27,1,.15,9)),fur,0,0,0,0,0,0,1.15,.8,.8);
  R.big=Mm('brow',G('be',()=>new THREE.SphereGeometry(.2,12,10)),iris,0,.02,.12);Mm('brow',G('bs',()=>new THREE.BoxGeometry(.05,.3,.02)),claw,0,.02,.32);R.bigSpr=svSpr(R,'brow',ARG.col,.01,0,.02,.35);
  // ---- legs ----
  [-1,1].forEach(s=>{const L=s>0?'L':'R';
    J('sh'+L,'chest',s*.74,-.25,.7);Mm('sh'+L,G('ua',()=>svLoft([[.35,.46,.52],[-.15,.48,.54,0,.04],[-.65,.33,.37,0,-.02],[-1.22,.2,.24]],12)),hide);
    for(let y=.25;y>-1.1;y-=.22){const k=1-(.35-y)/1.6,n=6;for(let q=0;q<n;q++){const t=q/n*Math.PI*2;tuft('sh'+L,[Math.sin(t)*.48*k,y,Math.cos(t)*.52*k],[Math.sin(t)*.35,-1,Math.cos(t)*.35],t,(q+Math.round(y*6))%3?fur:furM,.8,y>-.2)}}
    Mm('sh'+L,G('pd',()=>svLump(.5,1,.25,52)),bark,s*.36,.12,0,0,0,0,.55,.35,.6);
    aim(Mm('sh'+L,G('ps',()=>svHorn(.075,.46,0,.12,5,3)),bone,s*.6,.3,-.1),[s,.6,-.4]);
    J('el'+L,'sh'+L,0,-1.2,0);Mm('el'+L,G('fa',()=>svLoft([[.08,.22,.25],[-.45,.19,.21,0,.03],[-1.08,.13,.15]],10)),hide);Mm('el'+L,ball,hide,0,0,0,0,0,0,.24,.26,.26);
    Mm('el'+L,G('es',()=>svHorn(.085,.52,0,.18,5,3)),bone,0,.02,-.18,-.3,Math.PI,0);Mm('el'+L,G('tdn',()=>svTube([[0,-.1,-.17],[0,-.5,-.16],[0,-.95,-.11]],.035,4)),bone);
    for(let y=-.1;y>-.9;y-=.26)for(let q=0;q<4;q++){const t=q/4*Math.PI*2+.4;tuft('el'+L,[Math.sin(t)*.2,y,Math.cos(t)*.22],[Math.sin(t)*.3,-1,Math.cos(t)*.3],t,fur,.6)}
    Mm('el'+L,G('vn',()=>svTube([[.1,-.2,.16],[.12,-.5,.13],[.08,-.85,.12]],.022,4)),vein);
    // roots wound round the shin
    {const P=[];for(let q=0;q<=10;q++){const t=q/10*Math.PI*4;P.push([Math.sin(t)*.19,-.25-q*.07,Math.cos(t)*.21])}Mm('el'+L,G('rt',()=>svTube(P,.025,4)),bark)}
    J('pw'+L,'el'+L,0,-1.1,0);Mm('pw'+L,G('pw',()=>svLump(.26,1,.25,4)),hide,0,-.06,.12,0,0,0,1,.6,1.4);Mm('pw'+L,ball,hide,0,.02,0,0,0,0,.16,.17,.16);
    for(let c=0;c<5;c++){const x=(c-2)*.09;Mm('pw'+L,gToe,hide,x,-.08,.3-Math.abs(c-2)*.04);Mm('pw'+L,gClaw,claw,x,-.08,.36-Math.abs(c-2)*.04,.25,0,0)}
    J('hp'+L,'hips',s*.6,-.2,-.45);Mm('hp'+L,G('th',()=>svLoft([[.35,.52,.64,0,-.05],[-.3,.48,.58,0,.1],[-.75,.31,.37,0,.22],[-1.08,.19,.22,0,.32]],12)),hide);
    for(let y=.25;y>-1.0;y-=.22){const k=1-(.35-y)/1.7;for(let q=0;q<7;q++){const t=q/7*Math.PI*2;tuft('hp'+L,[Math.sin(t)*.52*k,y,Math.cos(t)*.62*k+.1*(.35-y)],[Math.sin(t)*.35,-1,Math.cos(t)*.35],t,(q+Math.round(y*6))%3?fur:furM,.85,y>-.3)}}
    Mm('hp'+L,G('hpd',()=>svLump(.45,1,.25,53)),bark,s*.42,0,.02,0,0,0,.5,.32,.6);
    J('kn'+L,'hp'+L,0,-1.05,.34);Mm('kn'+L,G('shn',()=>svLoft([[.05,.17,.2],[-.85,.12,.14,0,-.4]],8)),hide);Mm('kn'+L,ball,hide,0,0,0,0,0,0,.2,.21,.22);
    for(let y=-.1;y>-.8;y-=.26)for(let q=0;q<4;q++){const t=q/4*Math.PI*2;tuft('kn'+L,[Math.sin(t)*.16,y,Math.cos(t)*.18+y*.45],[Math.sin(t)*.3,-1,Math.cos(t)*.3],t,fur,.55)}
    J('hk'+L,'kn'+L,0,-.85,-.42);Mm('hk'+L,G('hk',()=>svLoft([[.05,.12,.13],[-.55,.1,.12,0,.08]],6)),hide);Mm('hk'+L,ball,hide,0,0,0,0,0,0,.14,.15,.15);
    Mm('hk'+L,G('hs',()=>svHorn(.065,.4,0,.1,5,3)),bone,0,.02,-.1,-.25,Math.PI,0);Mm('hk'+L,G('pw',()=>svLump(.26,1,.25,4)),hide,0,-.62,.18,0,0,0,.85,.55,1.25);
    for(let c=0;c<4;c++){const x=(c-1.5)*.1;Mm('hk'+L,gToe,hide,x,-.66,.34);Mm('hk'+L,gClaw,claw,x,-.66,.4,.25,0,0)}});
  // ---- tail: four segments, coat, spurs, a barbed tip ----
  J('t0','hips',0,.22,-1.4,.5);let pp='t0';[.55,.5,.45].forEach((l,k)=>{J('t'+(k+1),pp,0,0,-l);pp='t'+(k+1)});
  ['t0','t1','t2','t3'].forEach((n,k)=>{const r=.25-.045*k;Mm(n,G('t'+k,()=>svLoftZ([[0,r,r],[-.6,r*.8,r*.8]],10)),hide);Mm(n,ball,hide,0,0,0,0,0,0,r*1.02);
    for(let z=-.05;z>-.6;z-=.2)for(let q=0;q<5;q++){const t=q/5*Math.PI*2;tuft(n,[Math.sin(t)*r,Math.cos(t)*r,z],[Math.sin(t)*.3,Math.cos(t)*.3,-1],-t,q%3?fur:furM,.75-.08*k)}
    Mm(n,G('ts',()=>svHorn(.07,.4,0,-.12,5,3)),bone,0,r*.9,-.2,-1.1,Math.PI,0,1-.12*k)});
  [[0,0],[1,.5],[-1,.5],[0,-1]].forEach(([x,y])=>Mm('t3',G('tb',()=>svHorn(.07,.5,0,.1,5,3)),bone,x*.06,y*.05,-.62,y*.5,Math.PI+x*.45,0));
  // ---- the hundred eyes: a lid, an iris, a slit (the iris on its own so it can blink) ----
  const eye=(jn,x,y,z,dx,dy,dz,sc)=>{const g=new THREE.Group();g.position.set(x,y,z);g.quaternion.setFromUnitVectors(Z,new V3(dx,dy,dz).normalize());g.updateMatrix();
    const J0=R.J[jn],m1=svM(R,J0,G('lid',()=>svLump(1,1,.15,5)),fur,0,0,0,0,0,0,sc*1.2,sc*.95,sc*.7),ir=svM(R,J0,G('eye',()=>new THREE.SphereGeometry(1,10,8)),iris,0,0,sc*.42,0,0,0,sc*.85,sc*.62,sc*.5),
      m3=svM(R,J0,G('slit',()=>new THREE.BoxGeometry(.18,1,.1)),claw,0,0,sc*.88,0,0,0,sc,sc*.85,sc);
    [m1,ir,m3].forEach(m=>{m.updateMatrix();m.applyMatrix4(g.matrix)});ir.userData.noMerge=1;R.eyes.push({ir,s:sc,b:((R.eyes.length*2.39)%6)})};
  // flanks and haunches (in the coat), around the windows
  const fl=[[-2.0,1.3],[-1.6,1.0],[-1.7,1.7],[-1.2,1.3],[-.9,.7],[-.9,2.2],[1.3,1.0],[1.5,1.6],[1.8,1.25],[1.25,2.2],[.7,.6],[-.35,.55],[.25,2.3],[2.1,.8],[-2.3,1.2]];
  fl.forEach(([z,th],k)=>[1,-1].forEach(sd=>{if(sd<0&&k%4===3)return;const p=argTS(z,th,1.08,sd),sc=.1+.05*((k*7)%3);eye('body',p[0],p[1],p[2],sd*Math.sin(th),Math.cos(th)*.8,.15,sc)}));
  [['neck',.5,.1,.55],['neck',.42,.25,1.0],['neck',.45,-.2,.3],['shL',.4,-.3,.12],['shL',.36,-.7,.1],['hpL',.47,-.25,.1],['hpL',.4,-.6,.2],['elL',.2,-.55,.05]].forEach(([j,x,y,z],k)=>[-1,1].forEach(s=>{const jn=s<0?j.replace(/L$/,'R'):j;eye(jn,s*x,y,z,s,y*.6,.15,(.11+.03*(k%3))*(j==='elL'?.7:1))}));
  // the face: six along each side of the muzzle
  for(let k=0;k<6;k++)[-1,1].forEach(s=>{const z=.2+k*.17,[rx]=[.4-.18*k/5];eye('head',s*(rx+.02),.18-.03*k,z,s,.5,.6,.07+.012*(k%2))});
  eye('t1',0,.22,-.25,0,1,-.3,.12);eye('t3',0,0,-.55,0,.2,-1,.13);eye('neck',0,-.5,.7,0,-1,.3,.12);
  R.root.traverse(o=>{if(o.isMesh)o.castShadow=true})}
if(SVB[0]){SVB[0].build=argBuild146;
  SVB[0].spr={earL:[60,8,.6],earR:[60,8,.6],jaw:[80,10,.2],t0:[40,6,1.2],t1:[32,5,1.5],t2:[26,4,1.8],t3:[22,3.5,2],antL:[120,16,0],antR:[120,16,0]}}
// ---------------- Phase II: "The Drowned Fog" ----------------
function arg146Fog(A,e){const D=sk146Den(A);if(D.ph2)return;D.ph2=1;const y0=GH(A.cx,A.cz),fog=[];
  for(let k=0;k<30;k++){const s=kqSpr(0x8a9a7a,6+Math.random()*5);s.material=s.material.clone();s.material.blending=THREE.NormalBlending;s.material.opacity=0;const a=Math.random()*6.283,r=Math.random()*(ARENA_R-1);
    s.position.set(A.cx+Math.cos(a)*r,y0+.6+Math.random()*1.1,A.cz+Math.sin(a)*r);s.userData.a=a;s.userData.r=r;s.userData.w=(Math.random()-.5)*.08;s.renderOrder=25;sk146DenAdd(A,s);fog.push(s)}
  D.fog={fog,wisps:[],t:2,dT:0};D.spores=sk146DenAdd(A,sk146Weather(A,'spores',0xc8ff8a,240));
  try{banner('🌫 THE DROWNED FOG','Bog fog fills the hollow — will-o’-wisps drift toward you','Keep clear of the wisps')}catch(_){}svSnd('hiss',1,.4)}
function arg146Wisp(A){const D=A.s146,y0=GH(A.cx,A.cz),a=Math.random()*6.283,r=ARENA_R-1.5,o=kqSpr(0x9aff8a,1.1),c=kqSpr(0xffffff,.4);o.add(c);o.position.set(A.cx+Math.cos(a)*r,y0+1.1,A.cz+Math.sin(a)*r);sk146DenAdd(A,o);
  const w={o,t:0,life:14,ph:Math.random()*6};D.fog.wisps.push(w);return w}
function arg146FogTick(A,e,dt){const D=A.s146,F=D&&D.fog;if(!F)return;F.fog.forEach(s=>{s.userData.a+=dt*s.userData.w;s.position.x=A.cx+Math.cos(s.userData.a)*s.userData.r;s.position.z=A.cz+Math.sin(s.userData.a)*s.userData.r;s.material.opacity=Math.min(.38,s.material.opacity+dt*.12)});
  F.t-=dt;if(F.t<=0&&F.wisps.length<5&&sk146In(A)){F.t=3.5;arg146Wisp(A)}
  const P=pl.position;F.wisps.slice().forEach(w=>{w.t+=dt;const o=w.o,dx=P.x-o.position.x,dz=P.z-o.position.z,d=Math.hypot(dx,dz)||1,sp=1.1;o.position.x+=dx/d*sp*dt+Math.sin(w.t*1.7+w.ph)*dt*.8;o.position.z+=dz/d*sp*dt+Math.cos(w.t*1.3+w.ph)*dt*.8;
    o.position.y=GH(o.position.x,o.position.z)+1.0+.25*Math.sin(w.t*2.3+w.ph);o.scale.setScalar(1.1*(1+.15*Math.sin(w.t*9)));if(Math.random()<dt*6)burst(o.position.clone(),0x9aff8a,1,.2,.3,.5);
    const hit=sk146In(A)&&e&&!e.dead&&d<1.0&&!(hero.iv>0);if(hit||w.t>w.life){if(hit){hitHero(e,.35,'m');dqDebuff('Hexed','👁',{mspd:-.3},2200,'A will-o’-wisp burst on you: −30% move speed');D.deb='Hexed';burst(o.position.clone(),0x9aff8a,30,3,2,.6);sk146Flash(o.position,0x9aff8a,3,8,400);svSnd('crack',.8,1.5)}
      if(o.parent)o.parent.remove(o);F.wisps.splice(F.wisps.indexOf(w),1)}})}
{const B=SVB[0];if(B){const t0=B.denTick,c0=B.denClear;
  B.denTick=function(A,e,dt,now){try{t0&&t0.apply(this,arguments)}catch(_){}try{if(A.f&&e&&e.sv&&e.sv.ph>1&&!sk146Den(A).ph2)arg146Fog(A,e);arg146FogTick(A,e,dt)}catch(err){if(!SK146.err++)console.error('v146 fog',err)}};
  B.denClear=function(A,won){try{c0&&c0.apply(this,arguments)}catch(_){}sk146DenClear(A);const e=sk146Boss(A);if(e&&e.sv&&e.sv.gone146){e.sv.gone146=0;e.sv.ghost=0;e.m.visible=true}}}}
// ---------------- the signature: The Hundred Eyes ----------------
function arg146Watcher(){const g=new THREE.Group(),flesh=new THREE.MeshStandardMaterial({color:0x3a2a2a,roughness:.7,flatShading:true,emissive:0x0a0404}),bk=new THREE.MeshStandardMaterial({color:0x2e2418,roughness:.9,flatShading:true}),
    irm=new THREE.MeshBasicMaterial({color:0xffd040}),wh=new THREE.MeshStandardMaterial({color:0xd8ccb0,roughness:.35,emissive:0x2a2414});
  const mound=new THREE.Mesh(svG('a46wm',()=>svLump(1.2,1,.35,60)),flesh);mound.scale.set(1,1.1,.6);mound.position.y=1.8;g.add(mound);
  const ball=new THREE.Mesh(svG('a46wb',()=>new THREE.SphereGeometry(.75,14,10)),wh);ball.position.set(0,1.9,.45);g.add(ball);
  const ir=new THREE.Mesh(svG('a46wi',()=>new THREE.SphereGeometry(.42,12,8)),irm);ir.position.set(0,1.9,.85);ir.scale.set(1,1,.4);g.add(ir);
  const sl=new THREE.Mesh(svG('a46ws',()=>new THREE.BoxGeometry(.12,.6,.05)),new THREE.MeshBasicMaterial({color:0x0a0806}));sl.position.set(0,1.9,1.0);g.add(sl);
  [-1,1].forEach(s=>{const l=new THREE.Mesh(svG('a46wl',()=>svLump(.8,1,.2,61)),bk);l.scale.set(1.15,.4,.6);l.position.set(0,1.9+s*.62,.4);l.userData.s=s;g.add(l);(g.userData.lids=g.userData.lids||[]).push(l)});
  for(let k=0;k<6;k++){const a=k/6*6.283,v=new THREE.Mesh(svG('a46wv',()=>svTube([[0,0,0],[.4,.2,.1],[.9,.1,.2]],.04,4)),new THREE.MeshBasicMaterial({color:0xa06a1c}));v.position.set(0,1.9,.3);v.rotation.z=a;g.add(v)}
  const gl=kqSpr(0xffd040,1.8);gl.position.set(0,1.9,1.05);g.add(gl);return {g,ir,gl,mats:[flesh,bk,irm,wh,sl.material]}}
function arg146EyesStart(c){const e=c.e,S=c.S,A=c.A;if(!A)return;S.dr=.2;const D=sk146Den(A),a0=Math.random()*6.283;
  // he sinks into the fog: the body fades, only the eyes show
  S.gone146=1;S.ghost=1;c.M.an.ghost=kqSpr(0xffd040,2.2);c.M.an.ghost.position.copy(gY(e.m.position,2.6));sk146DenAdd(A,c.M.an.ghost);
  for(let k=0;k<20;k++)burst(gY(e.m.position,1+Math.random()*2),0x8a9a7a,3,2,1.5,1);
  const L=[0,1,2,3].map(k=>{const a=a0+k/4*6.283,x=A.cx+Math.cos(a)*(ARENA_R-1.2),z=A.cz+Math.sin(a)*(ARENA_R-1.2),W=arg146Watcher();W.g.rotation.y=Math.atan2(A.cx-x,A.cz-z);W.g.scale.setScalar(.01);let t=0,ft=1.2+k*.45;
    return {x,z,n:'Watcher Eye',frac:.016,mesh:W.g,hbY:3.6,hbS:.8,cupY:1.9,
      tick(pe,dt,now){t+=dt;W.g.scale.setScalar(Math.min(1,t/.6));const P=pl.position,p=pe.m.position;W.ir.lookAt(P.x,GH(P.x,P.z)+1.2,P.z);W.gl.scale.setScalar(1.6+.4*Math.sin(now/120+k));
        W.g.userData.lids.forEach(l=>{l.position.y=1.9+l.userData.s*(.62+.06*Math.sin(now/300+k))});
        ft-=dt;if(ft<=0&&AF&&!e.dead){ft=2.2;const from=gY(p,1.9),q=new THREE.Vector3(P.x,0,P.z),S2={k:'c',r:1.6},an={x:q.x,z:q.z,a:0};c.M.warn.push(svWarn(S2,an,.8));
          svShot(from,new THREE.Vector3(q.x,GH(q.x,q.z)+.3,q.z),.8,ARG.col,1.2,2.5,Pp=>{if(e.dead||!AF)return;burst(Pp,ARG.col,16,2.4,2,.5);sk146Crack(Pp,0xffb030,1.2,1.8);svHitNow(e,S2,an,.7,{})});svSnd('crack',.5,1.7)}},
      die(pe,killed){if(killed){const p=gY(pe.m.position,1.9);sk146Drops(p,0xd8ccb0,16,3.5,3,{splats:4,dc:0x3a2a08});sk146Drops(p,0x6a1c24,14,3,3,{splats:4});burst(p,ARG.col,40,3,3,.7);sk146Flash(p,ARG.col,3.5,10,500);popT(pe.m.position,'👁 SHUT','#ffe08a');svSnd('squelch',1.2,1);svSnd('stag',.5,1.4)}W.mats.forEach(m=>m.dispose())}}});
  const P=sk146Props(A,L);c.M.an.props=P;D.props=(D.props||[]).concat(P);svSnd('roar',.9,.6);
  try{banner('👁 THE HUNDRED EYES','Argus sinks into the fog — four great eyes open on the walls','Shut all four before the gaze completes!')}catch(_){}say('👁 Argus hides in the fog: shut the four Watcher Eyes on the walls!')}
function arg146EyesCleanup(c){const S=c.S,M=c.M,e=c.e;S.dr=0;if(S.gone146){S.gone146=0;S.ghost=0;e.m.visible=true;for(let k=0;k<14;k++)burst(gY(e.m.position,1+Math.random()*2),0x8a9a7a,3,2,1.5,.8)}
  if(!M)return;if(M.an.ghost&&M.an.ghost.parent)M.an.ghost.parent.remove(M.an.ghost);(M.an.props||[]).forEach(p=>{if(!p._gone)dqPropGone(p,false)})}
function arg146EyesEnd(c,broken){const e=c.e,M=c.M;if(M.an.done2)return;M.an.done2=1;
  if(broken){arg146EyesCleanup(c);svEndMove(e,true);svCast(e,'broken');sk146Wall(e.m.position,0x8a9a7a,6,3,.6);try{banner('💔 DRAGGED FROM THE FOG','Every Watcher Eye is shut','Strike now!')}catch(_){}return}
  // the gaze completes: he heals and every eye fires at once, on your trail
  const live=sk146Alive(M.an.props);sk146Heal(e,.1,ARG.col);arg146EyesCleanup(c);svSnd('roar',1.1,.8);shake(.4);
  for(let k=0;k<12;k++)setTimeout(()=>{if(e.dead||!AF)return;const d=pl.mvd&&nowP()-pl.mvd.t<300?pl.mvd:{x:0,z:0},q=new THREE.Vector3(pl.position.x+d.x*1.6+(Math.random()-.5)*2,0,pl.position.z+d.z*1.6+(Math.random()-.5)*2),S2={k:'c',r:1.7},an={x:q.x,z:q.z,a:0};
    const from=live.length&&!live[k%live.length]._gone?gY(live[k%live.length].m.position,1.9):gY(e.m.position,3);svWarn(S2,an,.7);svShot(from,new THREE.Vector3(q.x,GH(q.x,q.z)+.3,q.z),.7,ARG.col,1.2,3,Pp=>{if(e.dead||!AF)return;burst(Pp,ARG.col,16,2.4,2,.5);sk146Crack(Pp,0xffb030,1.3,1.8);svHitNow(e,S2,an,.8,{})})},k*170)}
Object.assign(ARGP,{sink:{body:[.35,0,0,0,-1.1,0],neck:[.5,0,0],head:[.2,0,0],jaw:[.2,0,0],shL:[.5,0,.5],shR:[.5,0,-.5],elL:[-.3,0,0],elR:[-.3,0,0],hpL:[-.6,0,.3],hpR:[-.6,0,-.3],knL:[1.0,0,0],knR:[1.0,0,0],hkL:[-.5,0,0],hkR:[-.5,0,0],t0:[.6,0,0],earL:[-.8,0,0],earR:[-.8,0,0]}});
Object.assign(ARGM,{
  hundred:{wt:(e,L)=>e.sv.heN?9:30,cd:30,ph:2,r:[0,40],a:'any',armor:1,dur:11.4,inv:[0,1.0],trn:[[0,.4,2]],
    trk:[[.7,'sink','io'],[10.2,'sink','l',.01],[10.8,'howl','o'],[11.4,'cRec','io']],
    go(c){c.S.heN=(c.S.heN||0)+1;svSnd('whoosh',1,.5)},
    ev:[[.8,c=>arg146EyesStart(c)],[10.3,c=>arg146EyesEnd(c,false)]],
    tk(c,dt){const M=c.M,e=c.e;if(c.S.gone146){e.m.visible=false;if(M.an.ghost){M.an.ghost.position.copy(gY(e.m.position,2.4+.2*Math.sin(c.t*2)));M.an.ghost.scale.setScalar(2.2*(1+.1*Math.sin(c.t*6)))}}
      if(M.an.props&&c.t>1.4&&c.t<10.3&&!M.an.done2&&!sk146Alive(M.an.props).length)arg146EyesEnd(c,true)},
    end(c){arg146EyesCleanup(c)},rec:.6},
  broken:sk146Broken(SVB[0],4.6,'stag','cRec')});
// ---------------- richer effects ----------------
{const f=argEyeBolt;argEyeBolt=function(c,i){f.apply(this,arguments);try{const q=c.inA(pl.position.clone().add(new THREE.Vector3(((pl.mvd&&pl.mvd.x)||0)*.9,0,((pl.mvd&&pl.mvd.z)||0)*.9)),.8),p=new THREE.Vector3(q.x,0,q.z);
  setTimeout(()=>{if(c.e.dead||!AF)return;sk146Crack(p,0xffb030,1.3,2);sk146Flash(p,ARG.col,2,7,260)},720)}catch(_){}}}
{const f=argSpikeAt;argSpikeAt=function(c,an,k,li){const r=f.apply(this,arguments);try{if(k%2===0)sk146Debris(new THREE.Vector3(an.x,0,an.z),argSpikeMat(),3,.08,2.5,4,1)}catch(_){}return r}}
{const P=ARGM.pounce;if(P&&P.hit)P.hit.forEach(h=>{const f=h.fx;h.fx=function(c,an,hit){f&&f.apply(this,arguments);try{const p=c.m.position;sk146Wall(p,0x8a9a7a,5,2.4,.5);sk146Crack(p,0xffb030,3,2.6);sk146Debris(p,argSpikeMat(),8,.1,4,5,1.3);sk146Flash(p,ARG.col,3,10,400)}catch(_){}}})}
{const W=ARGM.whirl;if(W&&W.hit)W.hit.forEach(h=>{const f=h.fx;h.fx=function(c,an,hit){f&&f.apply(this,arguments);try{sk146Wall(c.m.position,ARG.col,5.5,2,.45)}catch(_){}}})}
sk146AutoFx(ARGM,{liq:0x6a1c24,sp:0xffd060,dust:0x5a5040});
try{svRegMoves(0)}catch(_){}
try{DSTXT[0].atk.push(['👁 The Hundred Eyes','Phase II: Argus sinks into the fog (warded; only his eyes show) and four great Watcher Eyes open on the walls, each firing at you.','Shut all four: he is dragged out of the fog BROKEN. If any still watch when the gaze completes he heals and every eye fires on your trail — keep moving.'],
  ['🌫 The Drowned Fog','Phase II: bog fog fills the hollow and will-o’-wisps drift toward you.','Keep clear of the wisps: one bursting on you slows you.'])}catch(_){}
