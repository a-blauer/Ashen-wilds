// ================= v165 The Black Channel — the raft =================
// The Drowned Crypts' (Dirge II) gateway to III is gone: at the far edge of its gateway clearing a tunnel mouth opens in the rock
// over a flooded channel, and a raft of lashed logs lies moored at a little stone quay (F · Take the raft). The current carries the
// raft down the Black Channel (special instance 'channel', 3260), played once: the drowned dead swim up out of the black water,
// seize the raft's edges and tear it apart plank by plank. Kill them. Every plank they rip away is gone and the raft grows smaller;
// when too few are left (RF165.min) it breaks apart and drags everyone under. At the channel's end the raft grinds onto a beach of
// bone in grey daylight: the Ossuary Fields (III). From then on the quay's raft takes you straight there.
//  * The raft: RF165.cols × RF165.rows planks (cells of RF165.cs tiles), each with its own strength (RF165.hp). You walk on it
//    (walk() is turned into moves on the deck: you cannot step off it or into a hole); it drifts at RF165.spd along the channel.
//  * The drowned (3265): Drowned Wretches, and twice a Drowned Hulk (the Dirge's bloated Thrall, elite) that slams the planks two at
//    a time and rocks the raft. Waves by progress (RF165.ph): calm, then more and more at once, a lull, a frenzy at the end.
//  * Dying: the run starts over at the quay end of the channel (solo). The 🏳 button gives up and goes back to the quay in II.
//  * Inside: companions wait on the quay, no mount, no recall.
var RF165={cs:1.2,cols:5,rows:7,min:9,hp:100,rake:11,slam:18,spd:4.3,wy:.02,deck:.3,
  ph:[[0,0,0],[.05,2,6.5],[.22,3,4.8],[.34,4,4.0],[.45,3,4.6],[.55,0,0],[.6,5,3.2],[.72,6,2.7],[.84,8,2.1],[.95,0,0]],hulk:[.46,.79],err:0};
var RF165R=null,RF165S=null;
function rf165In(){return sp152Here('channel')}
function rf165P(){return dg165ChPath()}
// ---------------- the raft's frame ----------------
function rf165Frame(R){const P=rf165P(),[x,z]=P.at(R.s,0);return {x,z,F:[Math.sin(R.yaw),Math.cos(R.yaw)],Rt:[Math.cos(R.yaw),-Math.sin(R.yaw)]}}
function rf165W(R,lu,lv){const f=R.fr;return [f.x+f.Rt[0]*lu+f.F[0]*lv,f.z+f.Rt[1]*lu+f.F[1]*lv]}
function rf165L(R,x,z){const f=R.fr,dx=x-f.x,dz=z-f.z;return [dx*f.Rt[0]+dz*f.Rt[1],dx*f.F[0]+dz*f.F[1]]}
function rf165Idx(c,r){return c*RF165.rows+r}
function rf165CellLU(c,r){return [(c-(RF165.cols-1)/2)*RF165.cs,(r-(RF165.rows-1)/2)*RF165.cs]}
function rf165CellAt(R,lu,lv){const c=Math.round(lu/RF165.cs+(RF165.cols-1)/2),r=Math.round(lv/RF165.cs+(RF165.rows-1)/2);if(c<0||r<0||c>=RF165.cols||r>=RF165.rows)return null;const C=R.cells[rf165Idx(c,r)];return C&&C.alive?C:null}
function rf165OnDeck(R,lu,lv){const m=.3;return !!(rf165CellAt(R,lu,lv)&&rf165CellAt(R,lu+m,lv)&&rf165CellAt(R,lu-m,lv)&&rf165CellAt(R,lu,lv+m)&&rf165CellAt(R,lu,lv-m))}
function rf165Alive(R){return R.cells.reduce((a,C)=>a+(C.alive?1:0),0)}
// the open sides of the planks (where a drowned can take hold): [cell, dir] with dir 0 +u (right) · 1 −u · 2 +v (front) · 3 −v (back)
var RF165D=[[1,0],[-1,0],[0,1],[0,-1]];
function rf165Open(R){const out=[];R.cells.forEach(C=>{if(!C.alive)return;RF165D.forEach((d,k)=>{const c=C.c+d[0],r=C.r+d[1],n=c>=0&&r>=0&&c<RF165.cols&&r<RF165.rows?R.cells[rf165Idx(c,r)]:null;if(!n||!n.alive)out.push([C,k])})});return out}
function rf165SlotL(C,k,out){const d=RF165D[k];return [C.lu+d[0]*(RF165.cs/2+(out||.62)),C.lv+d[1]*(RF165.cs/2+(out||.62))]}
// ---------------- models ----------------
function rf165CellKit(k,i){const R=svRng(7100+i),bark=[0x2a1e14,0x241a10,0x32241a][i%3],rope=0x6a5a3c,cs=RF165.cs;
  // two logs along the raft's length (a little longer than the plank, so neighbours read as one long log), a rope lashing, a cross plank
  [-.29,.29].forEach((x,j)=>{k.p('','cyl','c',lgCol(bark,0x120c08,R()*.4),x+(R()-.5)*.03,(R()-.5)*.03,0,.27+R()*.02,cs+.03,.27,Math.PI/2,0,(R()-.5)*.03);
    if(R()<.6)k.p('','ring','c',rope,x,0,(R()<.5?-1:1)*(cs/2-.16),.29,.55,.29,Math.PI/2,0,0);
    for(let q=0;q<3;q++)k.p('','box','c',0x0e0a06,x+(R()-.5)*.2,.265,(R()-.5)*cs*.8,.035,.01,.12+R()*.1,0,R()*3,0)});
  if(R()<.55)k.p('','box','c',lgCol(0x3a2818,0x1a120a,R()),0,.21,(R()-.5)*.6,cs-.12,.06,.2,0,(R()-.5)*.1,0);
  for(let q=0;q<2;q++)k.p('','dod','c',0x223022,(R()-.5)*.8,.2,(R()-.5)*.9,.08,.03,.1)}
function rf165LanternKit(k){k.L('','c',0x2a1e12,[0,0,0],[0,2.2,0],.05,.045,6);k.L('','c',0x2a1e12,[0,2.15,0],[.45,2.3,0],.03,.03,4);k.p('','box','m',0x2a2c30,.45,2.0,0,.2,.3,.2);k.p('','box','g',0xffc070,.45,2.0,0,.13,.2,.13);k.p('','cone4','m',0x2a2c30,.45,2.22,0,.14,.12,.14,0,Math.PI/4,0)}
// a drowned arm reaching out of the water (the scare at the lull): forearm, hand, claws; rises from local y −1
function rf165ArmKit(k){const s=0x5a6a64,s2=0x3a4a44;k.L('','c',s2,[0,-1.2,0],[0,.1,.05],.07,.055,6);k.L('','c',s,[0,.1,.05],[0,.55,.18],.055,.045,6);k.p('','sph','c',s2,0,.62,.2,.07,.05,.06);
  for(let f=0;f<4;f++){const x=(f-1.5)*.03;k.L('','c',s,[x,.64,.22],[x*1.4,.78,.32],.014,.011,4);k.L('','c',0x0a0a0a,[x*1.4,.78,.32],[x*1.6,.86,.36],.01,.003,4)}k.S('',0x1a1e1c,0,.1,.06,.08,.5,0,.2,3)}
// the quay in Dirge II: a tunnel mouth in the rock, the channel running into it, the raft moored at the steps (local +z faces the clearing)
function rf165QuayModel(s){const g=new THREE.Group();g.userData.psNo=1;
  g.add(lgGroup('DG165|quay',k=>{const R=svRng(7300),sA=0x4a4c50,sB=0x3a3c40,sC=0x5a5a5c,rock=[0x3a3e40,0x2e3234,0x464a4c];
    // the rock face and the arch of the tunnel mouth
    for(let i=0;i<26;i++){const sd=i%2?1:-1,x=sd*(3.6+R()*3.5),z=-6.5-R()*4,s0=1.4+R()*1.6;k.p('','dod','c',rock[i%3],x,s0*.6+R()*2.5,z,s0,s0*1.3,s0,R()*3,R()*3,R()*3)}
    for(let i=0;i<10;i++)k.p('','dod','c',rock[i%3],(R()-.5)*9,6.5+R()*2,-7-R()*3,1.6+R(),1.2,1.6,R()*3,R()*3,R()*3);
    for(let i=0;i<13;i++){const a=Math.PI*i/12,x=Math.cos(a)*3.4,y=1.2+Math.sin(a)*3.4;k.p('','box','c',i%2?sA:sC,x,y,-6.2,.7,.62,1.2,0,0,a-Math.PI/2)}
    [-1,1].forEach(sd=>{k.p('','box','c',sB,sd*3.4,.6,-6.2,.8,1.6,1.3);k.p('','box','c',sA,sd*3.4,1.45,-6.2,1,.2,1.4)});
    k.p('','box','c',0x010202,0,2.4,-7.2,6,5.2,.2);k.p('','sph','c',0xd8d0b8,0,4.65,-5.6,.32,.36,.34);[-1,1].forEach(sd=>k.p('','sph','c',0x060606,sd*.12,4.68,-5.32,.08,.08,.05));
    // the channel walls inside the basin and the quay with its steps
    [-1,1].forEach(sd=>{for(let z=-6;z<0;z+=1)k.p('','box','c',lgCol(sA,sB,R()),sd*3.15,-.1,z+.5,.5,.6,.96);k.p('','box','c',sC,sd*3.15,.24,-3,.6,.1,6.2)});
    k.p('','box','c',sA,0,.1,.55,6.8,.5,1.2);for(let i=0;i<3;i++)k.p('','box','c',lgCol(sA,sB,i/3),0,-.1-i*.22,-.25-i*.3,3.2,.22,.32);
    // mooring posts, a coil of rope, a lantern on a crook, bones on the steps
    [-1,1].forEach(sd=>{k.L('','c',0x2a2018,[sd*2.6,0,.5],[sd*2.6,1.1,.5],.1,.09,6);k.p('','ring','c',0x7a6a48,sd*2.6,.85,.5,.13,.6,.13)});
    k.L('','c',0x7a6a48,[-2.6,.85,.5],[-1.2,.4,-2.4],.02,.02,4);k.p('','tor','c',0x6a5a3a,1.9,.4,.9,.28,.1,.28);
    k.L('','c',0x2a1e12,[2.9,.3,.2],[2.9,2.6,.2],.05,.045,6);k.L('','c',0x2a1e12,[2.9,2.55,.2],[2.4,2.7,.2],.03,.03,4);k.p('','box','m',0x2a2c30,2.4,2.4,.2,.2,.3,.2);k.p('','box','g',0x9affd0,2.4,2.4,.2,.13,.2,.13);
    for(let i=0;i<5;i++)k.p('','sph','c',0xb8b098,(R()-.5)*4,.38,.4+R()*.4,.09,.07,.12)},0));
  // the raft at its mooring (planks as in the channel)
  const raft=new THREE.Group();raft.position.set(0,-.05,-3.1);g.add(raft);for(let c=0;c<RF165.cols;c++)for(let r=0;r<RF165.rows;r++){const m=lgGroup('DG165|rcell'+((c*7+r)%3),k=>rf165CellKit(k,(c*7+r)%3),0);const [lu,lv]=rf165CellLU(c,r);m.position.set(lu*.78,0,lv*.62);m.scale.set(.78,1,.62);raft.add(m)}
  g.userData.raft=raft;
  // the water of the basin: dark, with moving light on it
  const wm=new THREE.Mesh(new THREE.PlaneGeometry(5.8,7.4).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x08201c,roughness:.08,metalness:.4,transparent:true,opacity:.92}));wm.position.set(0,-.18,-3.3);wm.userData.noFade135=1;g.add(wm);g.userData.water=wm;
  // a green light deep in the tunnel and the mist breathing out of it
  {const lt=new THREE.PointLight(0x5affc0,2.2,14,1.4);lt.position.set(0,2.2,-7.6);g.add(lt);const gl=kqSpr(0x3affb0,5);gl.material=gl.material.clone();gl.material.opacity=.32;gl.position.set(0,2.2,-7.4);g.add(gl);g.userData.glow=gl;
   const lt2=new THREE.PointLight(0x9affd0,1.2,8,1.6);lt2.position.set(2.4,2.4,.2);g.add(lt2)}
  g.position.set(s.x,GH(s.x,s.z),s.z);g.rotation.y=s.ry;scene.add(g);
  const ca=Math.cos(s.ry),sa=Math.sin(s.ry);for(let o=-4.5;o<=4.5;o+=.6)for(let d=-8;d<=-.2;d+=.6){if(Math.abs(o)<3.4&&d>-1.6&&d<-.3)continue;const x=s.x+ca*o+sa*d,z=s.z-sa*o+ca*d;CBLK.add(Math.round(z)*W+Math.round(x))}
  return g}
// ---------------- the channel's masonry and dressing (built the first time you are on it) ----------------
function rf165Build(){if(RF165S)return RF165S;const P=rf165P(),C=dg165CCfg(),root=new THREE.Group();root.name='BlackChannel';scene.add(root);const S={root,spots:[],fl:[],float:[]};RF165S=S;
  const Rn=svRng(7400),o=new THREE.Object3D(),col=new THREE.Color(),L=[],add=(s,off,y,w,h,d,c)=>{const [x,z]=P.at(s,off);L.push([x,y,z,P.yaw(s),w,h,d,c])};
  for(let s=0;s<=P.S;s+=1){for(const sd of [1,-1]){
    // coping stones at the water's edge, the flagged walk, the wall behind it (courses of mixed blocks)
    add(s,sd*(C.hw+.25),C.walkY-.15,.6,.5,1.0,.24+Rn()*.05);
    for(let q=0;q<2;q++)add(s+(Rn()-.5)*.1,sd*(C.hw+.6+q*.82),C.walkY-.08,.8,.16,.96,.2+Rn()*.06);
    let y=C.walkY,hh;const wo=sd*(C.hw+C.walk+.3);while(y<C.walkY+5.2){hh=.45+Rn()*.35;if(Rn()>.04)add(s+(Rn()-.5)*.08,wo,y+hh/2,.6,hh*.95,.97,.17+Rn()*.07);y+=hh}
    add(s,wo-sd*.05,C.walkY+5.35,.8,.3,1.02,.14)}}
  const M=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,flatShading:true}),L.length);
  L.forEach((q,i)=>{o.position.set(q[0],q[1],q[2]);o.rotation.set((Rn()-.5)*.03,q[3]+(Rn()-.5)*.03,(Rn()-.5)*.03);o.scale.set(q[4],q[5],q[6]);o.updateMatrix();M.setMatrixAt(i,o.matrix);
    col.setRGB(q[7],q[7]*1.02,q[7]*1.04);if(Rn()<.1)col.lerp(new THREE.Color(0x2a3a30),.5);M.setColorAt(i,col)});M.instanceMatrix.needsUpdate=true;if(M.instanceColor)M.instanceColor.needsUpdate=true;M.frustumCulled=false;M.receiveShadow=true;root.add(M);
  // arches across the channel, with a lantern hung from each and chains dangling; pillars in the water; statues on the walks
  const span=C.hw+C.walk+.3,aK=lgGroup('DG165|carch',k=>{const sA=0x3e4044,sB=0x4e5054;[-1,1].forEach(sd=>{k.p('','box','c',sA,sd*span,2.6,0,1.2,5.2,1.4)});
      for(let i=0;i<=16;i++){const a=Math.PI*i/16,x=Math.cos(a)*span,y=5.1+Math.sin(a)*3.6;k.p('','box','c',i%2?sA:sB,x,y,0,1.0,.7,1.3,0,0,a-Math.PI/2)}
      k.p('','sph','c',0xc8c0a8,0,8.9,.66,.3,.34,.2);for(let i=0;i<5;i++)k.p('','ring','m',i%2?0x26282c:0x5a3420,-1.4,8.2-i*.18,.0,.06,.5,.06,i%2?Math.PI/2:0,0,0);
      k.L('','m',0x26282c,[1.6,8.4,0],[1.6,6.6,0],.02,.02,3);k.p('','box','m',0x26282c,1.6,6.4,0,.22,.32,.22);k.p('','box','g',0x9affd0,1.6,6.4,0,.14,.22,.14)},0);
  for(let s=38;s<P.S-20;s+=46+((s*7)%13)){const a=aK.clone(),[x,z]=P.at(s,0);a.position.set(x,C.walkY,z);a.rotation.y=P.yaw(s);root.add(a);const [lx,lz]=P.at(s,-1.6);S.spots.push({x:lx,y:C.walkY+6.4,z:lz,c:0x9affd0,i:2.2,r:16,fq:2.2,ph:s})}
  // the props: baked in stretches of the channel
  const props=[];for(let s=12;s<P.S-14;s+=7+Rn()*6){const sd=Rn()<.5?1:-1,r=Rn();props.push([s,sd,r<.18?'statue':r<.34?'pillarW':r<.5?'coffinF':r<.64?'grate':r<.8?'bones':'sconce'])}
  const by=[];props.forEach(q=>{const b=Math.floor(q[0]/120);(by[b]=by[b]||[]).push(q)});
  by.forEach((Lq,bi)=>{if(!Lq)return;root.add(lgGroup('DG165|cprops'+bi,k=>{const R=svRng(7500+bi);Lq.forEach(([s,sd,kind])=>{const yw=P.yaw(s),ca=Math.cos(yw),sa=Math.sin(yw);
      const put=(off,lx,ly,lz)=>{const [x,z]=P.at(s+lz,off);return [x+ca*lx,ly,z-sa*lx]};
      if(kind=='statue'){const [x,y,z]=put(sd*(C.hw+1.2),0,C.walkY,0);k.p('','box','c',0x3a3a3e,x,y+.3,z,.9,.6,.9);k.p('','skirt','c',0x5a5850,x,y+1.2,z,.4,1.2,.36);k.p('','sph','c',0x5a5850,x,y+2.05,z,.18,.2,.18);k.p('','hood','c',0x4a4842,x,y+2.1,z,.22,.26,.24,-.3,yw+(sd<0?Math.PI/2:-Math.PI/2),0);
        k.L('','c',0x5a5850,[x,y+1.6,z],[x+.25,y+2.4,z],.06,.05,5);k.p('','dod','c',0x2a3a2a,x,y+.62,z,.4,.08,.4)}
      else if(kind=='pillarW'){const [x,,z]=put(sd*(C.hw-1.3),0,0,0);k.p('','cyl','c',0x45474a,x,C.deep+2.2,z,.45,5.6,.45);k.p('','box','c',0x3a3c40,x,C.deep+5.2,z,1.1,.4,1.1,0,R()*3,0);for(let i=0;i<3;i++)k.p('','dod','c',0x2a3a2a,x+(R()-.5)*.5,.05,z+(R()-.5)*.5,.25,.06,.25)}
      else if(kind=='coffinF'){const [x,,z]=put(sd*(C.hw-2.4),0,0,0);k.p('','box','c',0x2a2014,x,.02,z,.75,.24,1.9,(R()-.5)*.2,yw+R(),(R()-.5)*.2)}
      else if(kind=='grate'){const [x,y,z]=put(sd*(C.hw+C.walk+.02),0,C.walkY+1.1,0);for(let i=0;i<5;i++)k.L('','m',0x26282c,[x,y-.5+i*.25,z],[x,y-.5+i*.25,z],.02,.02,3);k.p('','box','m',0x26282c,x,y,z,.12,1.2,1.2,0,yw,0);k.p('','box','c',0x020303,x-ca*sd*.0,y,z,.06,1.0,1.0,0,yw,0)}
      else if(kind=='bones'){for(let i=0;i<5;i++){const [x,y,z]=put(sd*(C.hw+.7+R()*1.2),(R()-.5)*.5,C.walkY+.06,(R()-.5)*2);k.L('','c',0xb8b098,[x,y,z],[x+(R()-.5)*.7,y,z+(R()-.5)*.7],.03,.025,4)}const [x,y,z]=put(sd*(C.hw+1.2),0,C.walkY+.12,.3);k.p('','sph','c',0xc8c0a8,x,y,z,.13,.14,.16)}
      else if(kind=='sconce'){const [x,y,z]=put(sd*(C.hw+C.walk+.05),0,C.walkY+2.4,0);dg165SconceKit(k);const last=k.P.length;for(let i=last-4;i<last;i++){const p=k.P[i];p.m.premultiply(new THREE.Matrix4().makeRotationY(yw+(sd>0?-Math.PI/2:Math.PI/2)).setPosition(x,y,z))}}})},0))});
  props.forEach(([s,sd,kind])=>{if(kind=='sconce'){const [x,z]=P.at(s,sd*(C.hw+C.walk-.3));const f=dg165Flame(root,x,C.walkY+2.85,z,.32,0xffa040);S.fl.push(f);S.spots.push({x,y:C.walkY+3,z,c:0xffa050,i:1.8,r:11,ph:s})}
    if(kind=='grate'&&Rn()<.8)S.float.push({k:'fall',s,sd})});
  // drifting things on the water: logs, a coffin lid, a skull on a plank (they float with the current)
  const fK=[lgGroup('DG165|flog',k=>{k.p('','cyl','c',0x2e2216,0,0,0,.22,2.2,.22,Math.PI/2,0,.1)},0),lgGroup('DG165|flid',k=>{k.p('','box','c',0x2a2014,0,0,0,.7,.1,1.8);k.p('','box','c',0x3a2a18,0,.06,0,.2,.04,1.2)},0),lgGroup('DG165|fsk',k=>{k.p('','box','c',0x3a2a18,0,0,0,.5,.08,1.0);k.p('','sph','c',0xc8c0a8,0,.15,.1,.13,.14,.16)},0)];
  for(let i=0;i<26;i++){const g=fK[i%3].clone();root.add(g);S.float.push({k:'d',g,s:10+Rn()*(P.S-20),o:(Rn()-.5)*2*(C.hw-1.6),ph:Rn()*6,v:.4+Rn()*.5})}
  // the far end: grey daylight pouring in over a beach of bone
  {const [x,z]=P.at(P.S,0),[x2,z2]=P.at(P.S-10,0);const glow=kqSpr(0xe8e4d0,26);glow.material=glow.material.clone();glow.material.opacity=.5;glow.position.set(x+(x-x2)*.8,C.walkY+5,z+(z-z2)*.8);root.add(glow);S.day=glow;
    const lt=new THREE.PointLight(0xe8e4d8,0,40,1.2);lt.position.set(x,C.walkY+8,z);root.add(lt);S.dayL=lt;
    root.add(lgGroup('DG165|beach',k=>{const R=svRng(7600);for(let i=0;i<60;i++){const [bx,bz]=P.at(P.S-8+R()*10,(R()-.5)*2*(C.hw+2));k.L('','c',lgCol(0xb8b098,0x8a8270,R()),[bx,C.walkY+.05,bz],[bx+(R()-.5)*.8,C.walkY+.05,bz+(R()-.5)*.8],.03,.025,4);
      if(R()<.3)k.p('','sph','c',0xc8c0a8,bx,C.walkY+.12,bz,.13,.14,.16)}},0))}
  // the raft
  S.raft=new THREE.Group();root.add(S.raft);S.lant=lgGroup('DG165|rlant',rf165LanternKit,0);S.lantL=new THREE.PointLight(0xffb060,1.4,16,1.4);S.lantL.position.set(.45,2.6,0);S.lant.add(S.lantL);S.lantF=dg165Flame(S.lant,.45,2.02,0,.3,0xffc070);
  S.arms=[];const armK=lgGroup('DG165|rarm',rf165ArmKit,0);for(let i=0;i<14;i++){const a=armK.clone();a.visible=false;root.add(a);S.arms.push({g:a,t:-1})}
  S.pool=dg165LPool(6,14);return S}
// ---------------- the run ----------------
function rf165Reset(){const S=rf165Build();rf165Clear();S.raft.children.slice().forEach(c=>S.raft.remove(c));S.drift=(S.drift||[]).filter(d=>{S.root.remove(d.g);return false});
  const R={ph:'moor',t:0,s:2,v:0,yaw:rf165P().yaw(2),cells:[],H:[0,-1.6],W:[],spawnT:3,roll:0,rollV:0,pitch:0,hk:0,sc:{},n:0,lost:0,id:(RF165R&&RF165R.id||0)+1};
  for(let c=0;c<RF165.cols;c++)for(let r=0;r<RF165.rows;r++){const [lu,lv]=rf165CellLU(c,r),v=(c*7+r)%3,g=lgGroup('DG165|rcell'+v,k=>rf165CellKit(k,v),0);g.position.set(lu,0,lv);S.raft.add(g);R.cells.push({c,r,lu,lv,alive:1,hp:RF165.hp,g,shk:0,i:rf165Idx(c,r)})}
  S.raft.add(S.lant);S.lant.position.set(0,0,0);S.lantOn=1;R.fr=rf165Frame(R);RF165R=R;rf165Place();return R}
// the drowned: remove all of them (a new run, leaving)
function rf165Clear(){enemies.slice().forEach(e=>{if(e.dg165w&&!e.mir)try{removeE(e)}catch(_){}})}
function rf165Place(){const R=RF165R;if(!R)return;const [x,z]=rf165W(R,R.H[0],R.H[1]);pl.position.x=x;pl.position.z=z;pl.position.y=RF165.wy+RF165.deck+(R.bob||0);R.last=[x,z]}
// moves on the deck: one axis at a time, never off the planks
function rf165Walk(dx,dz){const R=RF165R;if(!R||R.ph=='broken')return;const f=R.fr,du=dx*f.Rt[0]+dz*f.Rt[1],dv=dx*f.F[0]+dz*f.F[1];
  if(rf165OnDeck(R,R.H[0]+du,R.H[1]))R.H[0]+=du;if(rf165OnDeck(R,R.H[0],R.H[1]+dv))R.H[1]+=dv;rf165Place()}
{const f=walk;walk=function(o,dx,dz){if(o===pl&&rf165In()&&RF165R&&!(typeof AWD!='undefined'&&AWD.dead))return rf165Walk(dx,dz);return f.apply(this,arguments)}}
function rf165Phase(p){const L=RF165.ph;let q=L[0];for(const x of L)if(p>=x[0])q=x;return q}
function rf165Tick(dt,now){const inC=rf165In(),S=RF165S;
  if(!inC){if(S){S.root.visible=false;dg165LPoolTick(S.pool,S.spots,pl.position,0,false);S.lantL.intensity=0}if(RF165R){rf165Clear();RF165R=null}if(!RF165.off){RF165.off=1;rf165Hud()}return}
  RF165.off=0;rf165Build();if(!RF165R)rf165Reset();const R=RF165R,P=rf165P(),t=now/1000;RF165S.root.visible=true;R.t+=dt;
  if(riding)try{dismount(true)}catch(_){}
  // other things that moved the hero this frame (a knock-back, a pull): onto the deck if they can
  if(R.last&&R.ph!='broken'){const ex=pl.position.x-R.last[0],ez=pl.position.z-R.last[1];if(Math.abs(ex)+Math.abs(ez)>.001&&Math.abs(ex)+Math.abs(ez)<3)rf165Walk(ex,ez)}
  // drift: ease out of the mooring, a little faster and slower with the current, slow onto the beach at the end
  const p=R.s/P.S;let vt=R.ph=='moor'?0:R.ph=='run'?RF165.spd*(1+.1*Math.sin(R.s/55))*(R.s>P.S-30?Math.max(.15,(P.S-R.s)/30):1):R.ph=='end'?0:R.v*.97;
  if(R.ph=='moor'&&R.t>2.6){R.ph='run';R.t=0;dg165Snd('creak',.8,.8);say('🌊 The mooring rope parts. The current takes the raft into the dark…')}
  R.v+=(vt-R.v)*Math.min(1,dt*(R.ph=='run'?.6:2));R.s=Math.min(P.S,R.s+R.v*dt);
  let dy=P.yaw(Math.min(P.S,R.s+3))-R.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));R.yaw+=dy*Math.min(1,dt*1.2);R.fr=rf165Frame(R);
  // the raft rides the water: bob, pitch, roll (a hulk's slam rocks it)
  R.rollV+=(-R.roll*9-R.rollV*2.2)*dt;R.roll+=R.rollV*dt;R.bob=.05*Math.sin(t*1.4)+.03*Math.sin(t*2.3+1);
  const G=RF165S.raft;G.position.set(R.fr.x,RF165.wy+.06+R.bob,R.fr.z);G.rotation.set(.025*Math.sin(t*1.1)+R.pitch,R.yaw,.03*Math.sin(t*.9)+R.roll,'YXZ');
  R.cells.forEach(C=>{if(!C.alive)return;const dmg=1-C.hp/RF165.hp;C.shk=Math.max(0,C.shk-dt*3);C.g.position.y=-dmg*.1+(C.shk>0?(Math.random()-.5)*.08*C.shk:0);C.g.rotation.z=(C.i%2?1:-1)*dmg*.12;C.g.rotation.x=(C.i%3-1)*dmg*.08});
  rf165Place();
  if(R.ph=='run'){if(p>=.97&&R.s>=P.S-2.5){R.ph='end';R.t=0;rf165End()}rf165Spawn(R,dt,p);rf165Scripts(R,dt,now,p)}
  if(R.ph=='end'&&R.t>2.2&&!R.fin){R.fin=1;rf165Finish()}
  if(R.ph=='broken')rf165BrokenTick(R,dt);
  rf165World(R,dt,t,p);
  if(now-(RF165.hT||0)>110){RF165.hT=now;rf165Hud()}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{rf165Tick(dt,now)}catch(e){if(!RF165.err++)console.error('v165 raft',e)}return r}}
// lights, the lantern, the floating things, the daylight at the end
function rf165World(R,dt,t,p){const S=RF165S,P=rf165P();dg165LPoolTick(S.pool,S.spots,pl.position,t,true);dg165FlTick(S.fl,t);if(S.lantF)dg165FlTick([S.lantF],t);
  S.lantL.intensity=S.lantOn?(1.3+.18*Math.sin(t*7)*Math.sin(t*3.3))*(R.flick>0?(Math.random()<.5?.15:1):1):0;R.flick=Math.max(0,(R.flick||0)-dt);
  S.float.forEach(f=>{if(f.k=='d'){f.s+=f.v*dt;if(f.s>P.S-12)f.s=8;const [x,z]=P.at(f.s,f.o);f.g.position.set(x,RF165.wy+.05+.04*Math.sin(t*1.3+f.ph),z);f.g.rotation.y=P.yaw(f.s)+f.ph;
      // the raft pushes floating things aside
      const [lu,lv]=rf165L(R,x,z);if(Math.abs(lu)<4&&Math.abs(lv)<5.2){f.o+=(lu>0?1:-1)*dt*2;f.o=Math.max(-dg165CCfg().hw+1,Math.min(dg165CCfg().hw-1,f.o))}}
    else if(f.k=='fall'&&Math.abs(f.s-R.s)<40&&Math.random()<dt*10){const C=dg165CCfg(),[x,z]=P.at(f.s,f.sd*(C.hw+C.walk-.1));burst(V(x,C.walkY+1+Math.random()*.3,z),0x6aa8a0,1,.4,-.2,.8)}});
  (S.drift||[]).forEach(d=>{d.t+=dt;d.g.position.y-=dt*(.05+d.t*.06);d.g.rotation.x+=dt*d.rx;d.g.rotation.z+=dt*d.rz;if(d.t>6){S.root.remove(d.g);d.dead=1}});S.drift=(S.drift||[]).filter(d=>!d.dead);
  S.arms.forEach(a=>{if(a.t<0)return;a.t+=dt;const k=a.t<.8?a.t/.8:a.t<2.4?1:Math.max(0,1-(a.t-2.4)/.8);a.g.position.y=RF165.wy-1.2+k*1.2+.06*Math.sin(a.t*5);a.g.rotation.z=.25*Math.sin(a.t*3+a.ph);if(a.t>3.2){a.t=-1;a.g.visible=false}});
  const day=Math.max(0,(p-.86)/.14);S.day.material.opacity=.15+.55*day;S.dayL.intensity=day*2.6}
{const f=atmos;atmos=function(dt,now){const r=f.apply(this,arguments);try{if(rf165In()&&RF165R){const day=Math.max(0,(RF165R.s/rf165P().S-.86)/.14);if(day>0){sun.intensity*=1+day*3;hemi.intensity*=1+day*2}}}catch(_){}return r}}
// ---------------- the drowned: spawning ----------------
function rf165Mates(){try{return typeof cl155Mates=='function'?cl155Mates(MP.rg).length:0}catch(_){return 0}}
function rf165Host(){try{return !(typeof MP!='undefined'&&MP.on&&MP.others)||MP.host===MP.me||!MP.host}catch(_){return true}}
function rf165Spawn(R,dt,p){if(!rf165Host())return;const q=rf165Phase(p),live=R.W.filter(w=>!w.e.dead&&enemies.includes(w.e)).length,co=1+.4*rf165Mates();
  RF165.hulk.forEach((hp,i)=>{if(p>=hp&&!R['hk'+i]){R['hk'+i]=1;rf165Make(R,1);dg165Snd('gurgle',1,.6);setTimeout(()=>dg165Snd('scream',.5,.4),400);say('🌊 Something huge rises beside the raft!')}});
  if(!q[1])return;R.spawnT-=dt;if(R.spawnT>0||live>=Math.round(q[1]*co))return;R.spawnT=q[2]*(.75+Math.random()*.5)/Math.sqrt(co);rf165Make(R,0)}
function rf165Make(R,hulk){const P=rf165P(),C=dg165CCfg();let ds=Math.random()<.5?-(8+Math.random()*8):9+Math.random()*12,o=(Math.random()-.5)*2*(C.hw-1.2);if(Math.random()<.3){ds=(Math.random()-.5)*8;o=(Math.random()<.5?1:-1)*(C.hw-1)}
  const s=Math.max(1,Math.min(P.S-2,R.s+ds)),[x,z]=P.at(s,o),lv=dg165Lv(33);let e=null;
  try{e=spawnEnemy(hulk?'drowned':'dgwretch',x,z,hulk?lv[1]+1:lv[1],{al:!!hulk})}catch(err){console.warn('v165 drowned',err)}if(!e)return null;
  const w={e,st:'swim',t:0,ph:Math.random()*6,x,z,s,slot:null,act:null,hp:e.c.h,hulk:!!hulk,nT:.8,arm:0,rid:R.id};e.dg165w=w;e.hid=1;e.agg=1;e.cd=99;R.W.push(w);
  if(hulk)e.m.children.forEach(c=>{if(c.isMesh&&c.geometry&&c.geometry.type=='RingGeometry')c.visible=false});
  return w}
// pick an open side of a plank to take hold of (not one another drowned holds)
function rf165PickSlot(R,w){const open=rf165Open(R).filter(([C,k])=>!R.W.some(q=>q!==w&&q.slot&&q.slot.C===C&&q.slot.k===k&&!q.e.dead));if(!open.length)return null;
  // a little more often near where the drowned already is
  let best=null,bd=1e9;for(let i=0;i<4;i++){const q=open[(Math.random()*open.length)|0],[lu,lv]=rf165SlotL(q[0],q[1]),[x,z]=rf165W(R,lu,lv),d=Math.hypot(x-w.x,z-w.z)+Math.random()*6;if(d<bd){bd=d;best=q}}
  return {C:best[0],k:best[1]}}
// ---------------- the drowned: each frame (runs instead of the normal AI) ----------------
{const f=eTick;eTick=function(e,dt,now){const w=e&&e.dg165w;if(w&&!e.dead){try{if(e.mir)return rf165Mirror(e,w,dt,now,f,arguments);rf165WTick(e,w,dt,now)}catch(err){if(!RF165.err++)console.error('v165 drowned tick',err)}return true}return f.apply(this,arguments)}}
function rf165WTick(e,w,dt,now){const R=RF165R,m=e.m,t=now/1000,P=rf165P(),C=dg165CCfg(),wy=RF165.wy;
  if(!R||!rf165In()||w.rid!==R.id){try{removeE(e)}catch(_){}return}
  w.t+=dt;const hurtNow=e.c.h<w.hp-.5;w.hp=e.c.h;let pose=null,y=0,yaw=m.rotation.y;
  const slotW=()=>{const [lu,lv]=rf165SlotL(w.slot.C,w.slot.k,w.hulk?.95:.62);return rf165W(R,lu,lv)};
  const slotOk=()=>w.slot&&w.slot.C.alive&&rf165Open(R).some(([Cc,k])=>Cc===w.slot.C&&k===w.slot.k);
  if(R.ph=='broken'||R.ph=='end'){if(w.st!='sink'){w.st='sink';w.t=0}}
  if(w.st=='swim'){if(!slotOk())w.slot=rf165PickSlot(R,w);if(!w.slot){w.st='tread'}else{const [tx,tz]=slotW(),dx=tx-w.x,dz=tz-w.z,d=Math.hypot(dx,dz),sp=R.v+(w.hulk?1.8:2.6);
      if(d<1.1){w.st='rise';w.t=0;w.rx=w.x;w.rz=w.z;rf165Splash(w.x,w.z,w.hulk);e.hid=0}else{const k=Math.min(d,sp*dt)/d;w.x+=dx*k+Math.sin(t*2+w.ph)*dt*.4*(-dz/d);w.z+=dz*k+Math.sin(t*2+w.ph)*dt*.4*(dx/d);yaw=Math.atan2(dx,dz)}}
    // stay in the water: inside the channel's banks
    const [ss,oo]=P.near(w.x,w.z,w.s);w.s=ss;if(Math.abs(oo)>C.hw-.6){const [nx,nz]=P.at(ss,Math.sign(oo)*(C.hw-.6));w.x=nx;w.z=nz}
    const crest=Math.pow(Math.max(0,Math.sin(t*1.2+w.ph)),6);y=wy+DG165WY.swim+crest*1.1;pose=dg165WPose('swim',t,w.ph);
    if(Math.random()<dt*6){ring(V(w.x,wy+.04,w.z),0x6a9a94,.35+crest*.4,520);if(Math.random()<.5)burst(V(w.x,wy+.08,w.z),0x9ac8c0,2,.25,.5,.4)}}
  if(w.st=='tread'){y=wy+DG165WY.tread;pose=dg165WPose('tread',t,w.ph);if(w.t>1.5){w.t=0;w.st='swim'}}
  if(w.st=='rise'){const k=Math.min(1,w.t/.85),[tx,tz]=slotW(),e2=k*k*(3-2*k);w.x=w.rx+(tx-w.rx)*e2;w.z=w.rz+(tz-w.rz)*e2;y=wy+DG165WY.swim+(DG165WY.cling-DG165WY.swim)*e2;
    pose=k<.5?dg165WMix(dg165WPose('swim',t,w.ph),dg165WPose('reach',t,w.ph),k*2):dg165WMix(dg165WPose('reach',t,w.ph),dg165WPose('cling',t,w.ph),(k-.5)*2);
    const [cx,cz]=rf165W(R,w.slot.C.lu,w.slot.C.lv);yaw=Math.atan2(cx-w.x,cz-w.z);if(k>=1){w.st='cling';w.t=0;w.nT=.4+Math.random()*.6;dg165Snd('scrape',.5,.7)}}
  if(w.st=='cling'){if(!slotOk()){w.st='drop';w.t=0}else{const [tx,tz]=slotW();w.x=tx;w.z=tz;const [cx,cz]=rf165W(R,w.slot.C.lu,w.slot.C.lv);yaw=Math.atan2(cx-w.x,cz-w.z);y=wy+DG165WY.cling;
      if(hurtNow&&(!w.act||w.act.k!='flinch'))w.act={k:'flinch',t:0,T:.45};
      if(!w.act){w.nT-=dt;if(w.nT<=0){const H=rf165Heroes(),nh=H.filter(h=>Math.hypot(h.x-w.x,h.z-w.z)<(w.hulk?2.8:2.2));w.act=nh.length&&Math.random()<.5?{k:'lunge',t:0,T:1.15,tg:nh[0]}:{k:'rake',t:0,T:w.hulk?1.5:1.05,arm:(w.arm^=1)}}}
      const A=w.act;if(A){A.t+=dt;const k=Math.min(1,A.t/A.T);
        if(A.k=='rake'){pose=dg165WPose('rake',t,w.ph,{k,arm:A.arm});if(k>.5&&!A.hit){A.hit=1;rf165Rake(R,w)}}
        else if(A.k=='lunge'){pose=dg165WPose('lunge',t,w.ph,{k});y+=.45*Math.sin(Math.min(1,k/.6)*Math.PI/2);const hy=Math.atan2(A.tg.x-w.x,A.tg.z-w.z);yaw=hy;if(k<.6&&Math.random()<dt*10)burst(V(w.x,wy+.05,w.z),0xa8d8d0,2,.6,.6,.3);
          if(k>.62&&!A.hit){A.hit=1;dg165Snd('scrape',.6,1.2);rf165Lunge(R,w,A.tg)}}
        else if(A.k=='flinch'){pose=dg165WMix(dg165WPose('cling',t,w.ph),dg165WPose('flinch',t,w.ph,{k}),Math.sin(k*Math.PI));y-=.18*Math.sin(k*Math.PI)}
        if(k>=1){w.act=null;w.nT=(w.hulk?.9:.5)+Math.random()*.9}}
      if(!pose)pose=dg165WPose('cling',t,w.ph);
      if(Math.random()<dt*3)ring(V(w.x,wy+.04,w.z),0x6a9a94,.6,700)}}
  if(w.st=='drop'){const k=Math.min(1,w.t/.8);y=wy+DG165WY.cling+(DG165WY.swim-DG165WY.cling)*k;pose=dg165WMix(dg165WPose('flinch',t,w.ph,{k:.5}),dg165WPose('swim',t,w.ph),k);if(k>=1){w.st='swim';w.t=0;w.slot=null;e.hid=1}}
  if(w.st=='sink'){const k=Math.min(1,w.t/1.4);y=wy+DG165WY.cling-k*1.6;pose=dg165WPose('sink',t,w.ph,{k});e.hid=1;if(Math.random()<dt*12)burst(V(w.x,wy+.06,w.z),0x9ac8c0,2,.3,.6,.5);if(k>=1){try{removeE(e)}catch(_){}return}}
  m.position.set(w.x,y,w.z);let dr=yaw-m.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));m.rotation.y+=dr*Math.min(1,dt*(w.st=='swim'?6:10));
  if(pose)dg165WApply(e,pose);
  e.hb.visible=!e.hid&&m.visible;e.hb.position.set(m.position.x,wy+(w.hulk?2.6:1.9),m.position.z)}
// a partner's copy of a host's drowned (co-op): it goes where the host says; its state comes in the host's 'rw' list (3268),
// or, before that arrives, from how close it is to the raft's edge
function rf165Mirror(e,w,dt,now,f,args){const r=f.apply(this,args);const R=RF165R,m=e.m,t=now/1000,wy=RF165.wy;if(!R)return r;
  const st=w.net||(()=>{const [lu,lv]=rf165L(R,m.position.x,m.position.z);return Math.abs(lu)<RF165.cs*(RF165.cols/2)+1.1&&Math.abs(lv)<RF165.cs*(RF165.rows/2)+1.1?'cling':'swim'})();
  const y=wy+(DG165WY[st]||DG165WY.cling);m.position.y+=(y-m.position.y)*Math.min(1,dt*6);e.hid=st=='swim'||st=='sink'?1:0;
  dg165WApply(e,st=='rake'?dg165WPose('rake',t,w.ph,{k:(t*.95)%1,arm:0}):dg165WPose(st=='rake'||st=='lunge'?'cling':st,t,w.ph,{k:.5}));
  e.hb.visible=!e.hid&&m.visible;e.hb.position.set(m.position.x,wy+(w.hulk?2.6:1.9),m.position.z);return true}
// the heroes on the raft (me and my partners on the channel)
function rf165Heroes(){const L=[{x:pl.position.x,z:pl.position.z,me:1}];try{if(typeof cl155Mates=='function')for(const r of cl155Mates(MP.rg))if(r.pr&&r.pr.hp>0&&r.m)L.push({x:r.m.position.x,z:r.m.position.z,peer:r.peer})}catch(_){}return L}
function rf165Splash(x,z,big){const wy=RF165.wy;burst(V(x,wy+.2,z),0xc8f0e8,big?60:30,big?3:2,big?4:3,.7);burst(V(x,wy+.1,z),0x2a5a54,big?30:14,2,2,.6);ring(V(x,wy+.04,z),0xa8e8e0,big?2.4:1.4,700);dg165Snd('splash',big?1.1:.7,big?.6:.9+Math.random()*.2);if(big)shake(.2)}
// a rake: the claws tear at the plank (a hulk's slam tears at it and the next one, and rocks the raft)
function rf165Rake(R,w){const C=w.slot&&w.slot.C;if(!C||!C.alive)return;const [lu,lv]=rf165SlotL(C,w.slot.k,.1),[x,z]=rf165W(R,lu,lv);
  burst(V(x,RF165.wy+.35,z),0x6a4a2a,w.hulk?18:9,1.6,1.4,.5);dg165Snd('splint',w.hulk?.9:.45,w.hulk?.7:1+Math.random()*.3);
  if(w.hulk){shake(.25);R.rollV+=(w.slot.k==0?-1:w.slot.k==1?1:0)*1.6+(Math.random()-.5);const d=RF165D[w.slot.k],n=[[d[1],d[0]],[-d[1],-d[0]]].map(q=>{const c=C.c+q[0],r=C.r+q[1];return c>=0&&r>=0&&c<RF165.cols&&r<RF165.rows?R.cells[rf165Idx(c,r)]:null}).find(q=>q&&q.alive);rf165Dmg(R,C,RF165.slam);if(n)rf165Dmg(R,n,RF165.slam*.6)}
  else rf165Dmg(R,C,RF165.rake*(.85+Math.random()*.3))}
function rf165Dmg(R,C,d){if(!C||!C.alive||R.ph!='run')return;C.hp-=d;C.shk=1;dg165Co('rd',C.i,Math.round(C.hp));if(C.hp<=0)rf165Break(R,C,true)}
// a plank torn away: it drifts off and sinks; whoever stood on it stumbles onto the nearest plank left
function rf165Break(R,C,mine){if(!C.alive)return;C.alive=0;C.hp=0;R.lost++;const S=RF165S,g=C.g;
  g.updateMatrixWorld(true);const p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();g.matrixWorld.decompose(p,q,s);S.raft.remove(g);g.position.copy(p);g.quaternion.copy(q);S.root.add(g);
  (S.drift=S.drift||[]).push({g,t:0,rx:(Math.random()-.5)*.6,rz:(Math.random()-.5)*.9});burst(V(p.x,RF165.wy+.3,p.z),0x6a4a2a,26,2.4,2,.6);rf165Splash(p.x,p.z,false);dg165Snd('splint',1,.6);dg165Snd('creak',.7,.6);shake(.15);
  if(S.lant.parent===g||(C.c==2&&C.r==3)){if(S.lantOn){S.lantOn=0;S.raft.remove(S.lant);dg165Snd('splash',.6,1.4);say('🕯 The lantern goes over the side and hisses out. Darkness.');dg165Fear(.8)}}
  const [hu,hv]=R.H;if(!rf165OnDeck(R,hu,hv)){let best=null,bd=1e9;R.cells.forEach(D=>{if(!D.alive)return;const d=Math.hypot(D.lu-hu,D.lv-hv);if(d<bd){bd=d;best=D}});if(best){R.H=[best.lu,best.lv];rf165Place();dg165Fear(.5);try{svSnd('splash',.5,1.2)}catch(_){}}}
  if(mine)dg165Co('rb',C.i);
  const n=rf165Alive(R);if(n<=RF165.min)rf165Shatter(R,mine);else if(n<=RF165.min+4&&!R.warn){R.warn=1;say('⚠ The raft is coming apart! Only '+n+' planks left!');dg165Fear(.9)}}
// a lunge at a hero beside the edge
function rf165Lunge(R,w,tg){if(tg.me){if(Math.hypot(pl.position.x-w.x,pl.position.z-w.z)<(w.hulk?3:2.5))try{hitHero(w.e,w.hulk?1.3:.85)}catch(_){}}else dg165Co('lg',w.e.nid||'',tg.peer)}
// ---------------- scripted moments ----------------
function rf165Scripts(R,dt,now,p){const sc=R.sc,S=RF165S;
  if(!sc.under&&p>.03){sc.under=1;dg165Snd('gurgle',.9,.5);R.rollV+=1.4;shake(.18);dg165Fear(.6);setTimeout(()=>{dg165Snd('whisper',.7,.7);say('🌊 Something huge passes beneath the raft. The logs knock against it.')},600);
    for(let i=0;i<24;i++)setTimeout(()=>{try{const [x,z]=rf165W(R,(Math.random()-.5)*1.5,-6+i*.6);burst(V(x,RF165.wy+.05,z),0x9ac8c0,3,.3,.8,.6)}catch(_){}},i*90)}
  if(!sc.hands&&p>.552){sc.hands=1;R.flick=2.2;dg165Snd('wail',.8,.7);dg165Fear(1);S.arms.forEach((a,i)=>{const an=i/S.arms.length*6.283,[x,z]=rf165W(R,Math.cos(an)*(4.4+Math.random()),Math.sin(an)*(5.6+Math.random()));a.g.position.set(x,RF165.wy-1.2,z);a.g.rotation.y=Math.atan2(R.fr.x-x,R.fr.z-z);a.g.visible=true;a.t=-Math.random()*.6;a.ph=Math.random()*6;
      setTimeout(()=>{a.t=0;ring(V(x,RF165.wy+.04,z),0xa8e8e0,.6,600)},Math.random()*700)});setTimeout(()=>say('🌊 Hands. Dozens of them, rising all around you… and sinking again.'),900)}
  // the arms drift with the raft while they are up
  S.arms.forEach(a=>{if(a.t>=0){a.g.position.x+=R.fr.F[0]*R.v*dt;a.g.position.z+=R.fr.F[1]*R.v*dt}});
  if(Math.random()<dt*.08)dg165Snd(['whisper','drip','creak','gurgle'][(Math.random()*4)|0],.4,.8+Math.random()*.4);
  if(p>.3&&p<.55&&Math.random()<dt*.15)R.flick=.25}
// ---------------- the end: broken, or through ----------------
function rf165Shatter(R,mine){if(R.ph=='broken')return;R.ph='broken';R.t=0;const S=RF165S;dg165Fear(1.2);shake(.6);dg165Snd('splint',1.2,.5);dg165Snd('slam',1,.6);dg165Snd('scream',.8,.6);
  R.cells.forEach(C=>{if(C.alive){C.alive=0;const g=C.g;g.updateMatrixWorld(true);const p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();g.matrixWorld.decompose(p,q,s);S.raft.remove(g);g.position.copy(p);g.quaternion.copy(q);S.root.add(g);S.drift.push({g,t:0,rx:(Math.random()-.5)*1.4,rz:(Math.random()-.5)*1.6})}});
  if(S.lantOn){S.lantOn=0;S.raft.remove(S.lant)}
  dg165Title('The Raft Breaks Apart','The drowned drag you down into the black water','','The Black Channel');if(mine)dg165Co('rx',0)}
function rf165BrokenTick(R,dt){pl.position.y=RF165.wy-Math.min(2.2,R.t*1.1);if(Math.random()<dt*14)burst(V(pl.position.x,RF165.wy+.06,pl.position.z),0x9ac8c0,3,.4,.8,.5);
  if(R.t>2.2&&!R.died){R.died=1;try{if(typeof RV148!='undefined'&&RV148.down){RV148.down=0;document.body.classList.remove('rv148dn')}}catch(_){}hero.hp=0;try{down_base()}catch(e){console.warn('v165 raft death',e)}}}
function rf165End(){dg165Snd('choir',.7,.9);dg165Title('Grey Light Ahead','The channel opens onto a beach of bone','The Ossuary Fields','The Black Channel');say('🌫 The raft grinds onto a shore of bones. Grey daylight. The drowned sink away behind you.')}
function rf165Finish(){DG165Q.r.st=2;dg165Co('rout',0);fadeTo(()=>{rf165Clear();RF165R=null;const N=INSL[22];insArrive(N);insMark(N);setTimeout(()=>{dg165Title('Out of the Black Channel','You climb up from the beach into the Ossuary Fields','Onward through '+N.n);try{mSfx('victory')}catch(_){}},400);
  say('🌊 You brought the raft through the Black Channel. <b>'+N.n+'</b> lies ahead.')})}
// ---------------- getting on and off ----------------
function rf165Enter(){if(AF)return;try{if(riding)dismount(true)}catch(_){}const first=DG165Q.r.st<1;DG165Q.r.st=Math.max(1,DG165Q.r.st);
  fadeTo(()=>{rf165Build();const P=rf165P(),[x,z]=P.at(2,0);toPos(x,z,P.yaw(2)+Math.PI);rf165Reset();
    setTimeout(()=>dg165Title('The Black Channel','The current carries the raft down into the dark',first?'Keep the drowned off the raft · every plank counts':'Hold the raft together'),300);
    if(first)setTimeout(()=>{say('🌊 The drowned will rise and tear at the raft’s edges. Kill them before they rip the planks away — if the raft falls apart, you go down with it.');dg165Snd('drone',.9,.8)},2000)});try{dg165Co('renter',0)}catch(_){}}
function rf165Leave(){fadeTo(()=>{rf165Clear();RF165R=null;const G=SP152.gates.channel,s=G&&G.spot;if(s)toPos(s.x+s.ux*-2.4,s.z+s.uz*-2.4,s.ry);else insArrive(INSL[21])})}
function rf165Rise(){hero.hp=heroMax();hero.mp=mpMax();try{party.forEach(c=>c.h=M(c))}catch(_){}const P=rf165P(),[x,z]=P.at(2,0);toPos(x,z,P.yaw(2)+Math.PI);rf165Reset();say('🌊 You wake on a fresh raft at the mouth of the channel. Again…');try{ui()}catch(_){}}
{const f=down_base;down_base=function(){if(!(rf165In()&&RF165S))return f.apply(this,arguments);if(typeof awDie=='function'&&typeof AWD!='undefined'){if(AWD.dead)return;awDie(()=>rf165Rise())}else rf165Rise()}}
// a dead drowned sinks under the water instead of toppling over
{const f=kill;kill=function(e){const w=e&&e.dg165w;if(w&&e.m){e.m._ssDead=1}const r=f.apply(this,arguments);
  if(w&&e.m){const m=e.m,x=m.position.x,z=m.position.z,y0=m.position.y;let t=0;dg165Snd('gurgle',.6,.9);burst(V(x,RF165.wy+.2,z),0x9ac8c0,16,1.4,1.6,.6);
    kqFx({tick(dt){t+=(dt||.016);const k=Math.min(1,t/1.4);m.position.set(x,y0-k*1.8,z);try{dg165WApply(e,dg165WPose('sink',t,w.ph,{k}))}catch(_){}if(Math.random()<.3)burst(V(x,RF165.wy+.06,z),0x9ac8c0,1,.3,.5,.5);return k<1},end(){}})}
  return r}}
{const f=gw150X;gw150X=function(e){const k=f.apply(this,arguments);return e&&e.dg165w?k*(e.dg165w.hulk?.8:.35):k}}
{const f=lootE;lootE=function(e){if(e&&e.dg165w&&!e.dg165w.hulk&&Math.random()>=.25)return;return f.apply(this,arguments)}}
// ---------------- the HUD ----------------
(function(){const st=document.createElement('style');st.textContent=`
#rf165h{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:7;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:5px;color:#e2ece8;font:600 12px system-ui,sans-serif;text-shadow:0 1px 2px #000}
#rf165h.hide{display:none}#rf165h .rw{display:flex;align-items:center;gap:8px}#rf165h .lb{font:600 11px Cinzel,Georgia,serif;letter-spacing:.12em;color:#a8d8c8;min-width:64px;text-align:right}
#rf165h .bar{position:relative;width:260px;height:11px;border-radius:6px;background:rgba(0,0,0,.6);border:1px solid rgba(160,220,200,.35);overflow:hidden}
#rf165h .bar i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#8a3a20,#c88a40 50%,#d8c890)}#rf165h .bar.pr i{background:linear-gradient(90deg,#2a6a6a,#8ad8c8)}
#rf165h .n{min-width:70px;font-size:11.5px}#rf165h .warn{font:800 14px Cinzel,Georgia,serif;letter-spacing:.12em;color:#ff6a4a;opacity:0}#rf165h.hot .bar.hp{animation:rf165p .4s infinite alternate}
@keyframes rf165p{to{border-color:#ff5030;box-shadow:0 0 12px rgba(255,60,30,.7)}}
#rf165g{position:fixed;right:14px;top:92px;z-index:7;pointer-events:auto;padding:5px 10px;border-radius:8px;border:1px solid rgba(160,220,200,.35);background:rgba(6,10,10,.7);color:#e0ece8;font:600 12px system-ui,sans-serif;cursor:pointer}#rf165g.hide{display:none}`;
  document.head.appendChild(st);const d=document.createElement('div');d.id='rf165h';d.className='hide';d.innerHTML='<div class="rw"><span class="lb">RAFT</span><div class="bar hp"><i></i></div><span class="n a"></span></div><div class="rw"><span class="lb">CHANNEL</span><div class="bar pr"><i></i></div><span class="n b"></span></div><div class="warn">⚠ THE RAFT IS BREAKING</div>';document.body.appendChild(d);
  const g=document.createElement('button');g.id='rf165g';g.className='hide';g.textContent='🏳 Abandon the raft';g.addEventListener('click',()=>{if(rf165In()&&RF165R&&RF165R.ph!='broken')rf165Leave()});document.body.appendChild(g)})();
function rf165Hud(){const el=$('rf165h'),gb=$('rf165g');if(!el)return;const R=RF165R,on=rf165In()&&!!R&&!(typeof uiOpen=='function'&&uiOpen());el.classList.toggle('hide',!on);if(gb)gb.classList.toggle('hide',!on||R.ph=='broken');if(!on)return;
  const n=rf165Alive(R),N=R.cells.length,k=Math.max(0,(n-RF165.min)/(N-RF165.min)),P=rf165P();el.querySelector('.hp i').style.width=(k*100).toFixed(1)+'%';el.querySelector('.n.a').textContent=n+' planks';
  el.querySelector('.pr i').style.width=(R.s/P.S*100).toFixed(1)+'%';el.querySelector('.n.b').textContent=Math.round(R.s/P.S*100)+'%';el.classList.toggle('hot',k<.3);el.querySelector('.warn').style.opacity=k<.3&&R.ph=='run'?(.6+.4*Math.sin(performance.now()/120)).toFixed(2):0}
// ---------------- the rules while inside ----------------
SP152.R.channel={park:1,noMount:'🌊 No mount on a raft.',noRecall:'🌊 The current has you. Hold on (or 🏳 abandon the raft).',onLoad(){setTimeout(()=>{try{rf165Rise()}catch(e){console.warn('v165 raft load',e)}},0)}};
// ---------------- the quay in Dirge II ----------------
sp152Gate('channel',{ig:21,r:3.4,build:rf165QuayModel,where:()=>sp152GateSpot(21,5.5),
  tick(s){const G=SP152.gates.channel;if(!G||!G.g)return;const t=performance.now()/1000,rf=G.g.userData.raft,gl=G.g.userData.glow;if(gl)gl.material.opacity=.26+.08*Math.sin(t*1.4);if(rf){rf.position.y=-.05+.04*Math.sin(t*1.3);rf.rotation.z=.02*Math.sin(t*.9)}
    if(Math.random()<.05)burst(V(s.x-Math.sin(s.ry)*6,GH(s.x,s.z)-.1,s.z-Math.cos(s.ry)*6),0x8ab8b0,1,.2,.4,.6)},
  prompt(s){if(dg165RDone()){const N=INSL[22];return {label:'F · Take the raft down to '+N.n+' ('+rpTxt139(N.lv[0])+')',fn:()=>insGo(N)}}
    return {label:'F · Board the raft (down the Black Channel)',fn:()=>rf165Enter()}}});
// ---------------- the tracker ----------------
SP152.trk.channel=I=>{if(I.g===21&&!dg165RDone())return {name:'The Black Channel',lines:[['Find the flooded tunnel at the end of '+INSL[21].n],['Take the raft down the channel']]};
  if(I.sp==='channel'&&RF165R){const R=RF165R;return {name:'The Black Channel',lines:[['Keep the drowned off the raft'],['Planks left',rf165Alive(R)+' / '+R.cells.length],['Reach the end of the channel',null,1]]}}return null};
// ---------------- the atmosphere ----------------
sp152Theme('channel',{nm:'The Black Channel',sub:'Flooded vaults beneath the crypts',a:{fog:.048,fc:0x041412,fcA:.95,sun:.14,hemi:.34,env:'dark',ex:.95,sat:1.1,vig:1.8,sky:0,pt:'wisp',pc:0x6affd8,po:.55}});
// the raft floats over water tiles (solid ground for walking): the "stuck in a wall" rescue (0570) leaves a hero on it alone
{const f=unstick;unstick=function(){if(rf165In()&&RF165R)return;return f.apply(this,arguments)}}
// no fishing off the raft (or down in the Sanctum)
{const f=nearWater;nearWater=function(){if(rf165In()||(typeof dg165SIn=='function'&&dg165SIn()))return null;return f.apply(this,arguments)}}
