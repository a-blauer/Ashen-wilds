// ================= v110/v112 Sovereign 5 — Lord Vaelric, the Crimson King (The Citadel) =================
// The last Sovereign: a tall vampire lord in layered black-and-crimson plate — lamed pauldrons with a skull trophy, couters,
// poleyns and pointed sabatons, a belt of rivets, a crimson tabard, a baldric, glowing blood runes on the breastplate and
// vambraces, a high bladed collar over a dark mantle, a thorned crown with a ruby, pale fanged face, long white hair, a
// tattered three-panel cape and a long blood-forged flamberge with a glowing fuller. Every joint has a cap (shoulder,
// elbow, wrist, hip, knee, ankle balls under the plates) so no gap opens at any pose. In Phase II bat wings with finger
// bones and scalloped membranes tear free. Fast, precise, and every pattern has a rhythm.
// Pattern (learnable; every move has a cooldown, the AI never repeats itself):
//  close in front ── Crimson Combo: a slash, a backhand, a pause… and a thrust (dodge the third late). It may chain a Lunge.
//  mid           ── Crimson Lunge: he draws the blade back level with his eyes, then lunges a long line.
//  mid, front    ── Hemorrhage Grasp (v112): he draws his left claw back, then thrusts it — blood tendrils lash a narrow
//                   red cone; caught, you are dragged to his feet and he often follows with a combo. Step out sideways.
//  far           ── Blood Wave: an overhead cut that sends a crescent of blood travelling down a line.
//  any           ── Bat Step: he bursts into bats and re-forms at your side for a rising slash (listen for the bell).
//  close, any    ── Sanguine Nova: he plants the sword and kneels; a blood circle bursts around him.
//  close, any    ── Danse Macabre (v112): he coils low and trembles, then spins twice with the blade out — first a red
//                   circle close around him, then a wider red ring. Be far away, or step in right after the first cut.
//  Phase II (55%) "The Blood Moon": wings, a crimson aura; adds Skyfall (he rises, blood spears rain on your trail, then he
//                   plunges onto you), Triple Wave (three crescents fanning out), a five-hit combo, and
//                   Thorned Procession (v112): he raises the sword point-down overhead and drives it into the floor; five
//                   lanes of blood thorns race out toward you, then four more burst in the gaps between them.
// Weakness: posture. Hits fill the yellow bar; a break staggers him (+35% damage). Big moves have armour.
var VLR={col:0xff2040,blood:0xd01030,gold:0xd8b060,spk:null};
function vlrSpkMat(){return VLR.spk||(VLR.spk=new THREE.MeshStandardMaterial({color:0x5a0410,emissive:0x3a0008,roughness:.3,metalness:.45,flatShading:true}))}
// a star-shaped flat polygon (wing membranes): fan from the centroid
function vlrPoly(P){const c=[0,0,0];P.forEach(p=>{c[0]+=p[0]/P.length;c[1]+=p[1]/P.length;c[2]+=p[2]/P.length});const pos=[];
  for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];pos.push(...c,...a,...b)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g}
function vlrBuild(R,e){}
function vlrWings(R,k){['L','R'].forEach(s=>{const w=R['wing'+s];w.scale.setScalar(Math.max(.01,k));w.visible=k>.02})}
function vlrLoco(e,S,O,dt,now){const t=now/1000,a=Math.min(1,S.spd/2.2);S.gp=(S.gp||0)+dt*(2+S.spd*2.3);const g=S.gp;
  O.hips[4]+=.03*Math.sin(t*1.4)+.05*Math.abs(Math.sin(g))*a;O.chest[0]+=.015*Math.sin(t*1.4);O.head[1]+=.08*Math.sin(t*.5);
  ['L','R'].forEach((s,j)=>{const ph=g+j*Math.PI,sw=Math.sin(ph)*.6*a,lf=Math.max(0,Math.cos(ph))*.8*a;O['th'+s][0]+=-sw;O['kn'+s][0]+=lf;O['ft'+s][0]+=-lf*.2});
  // guard stance: sword held low and forward, left claw open
  O.shR[0]+=-.45+.04*Math.sin(t*1.2);O.shR[2]+=-.15;O.elR[0]+=-.75;O.hdR[0]+=.25;O.shL[0]+=.15*Math.sin(g)*a+.1;O.shL[2]+=.18;O.elL[0]+=-.3;O.hdL[0]+=.1+.05*Math.sin(t*1.7);
  O.cp0[0]+=.15+.06*Math.sin(t*1.6)+.4*a;O.cp1[0]+=.05+.05*Math.sin(t*1.6-.8)+.15*a;O.cp2[0]+=.04*Math.sin(t*1.6-1.6)+.1*a;O.tab[0]+=.03*Math.sin(t*1.6+.5)-.12*a;
  if(S.ph>1){const fl=S.mv&&S.mv.id==='skyfall'?Math.sin(t*9)*.45:.12*Math.sin(t*1.8);O.wgL[1]+=fl;O.wgR[1]-=fl;O.wgL[2]+=fl*.5;O.wgR[2]-=fl*.5;
    const fo=.15+.12*Math.sin(t*1.8-.6);O.wfL[1]+=fo;O.wfR[1]-=fo}}
function vlrPost(e,S,dt,now){const R=S.R,on=S.ph>1,O=S.O;S.wk=Math.min(1,(S.wk||0)+(on?dt*1.2:-dt*3));vlrWings(R,on?svEase.o(Math.max(0,S.wk)):0);
  const pu=.5+.5*Math.sin(now/260);R.rune.color.setHex(on?0xff3050:0x8a1020);if(on)R.rune.color.lerp(SVX.vlW||(SVX.vlW=new THREE.Color(0xff9aa8)),pu*.35);
  // cloth follows the body: the tabard lifts with a raised thigh, the cape clears the floor when he crouches
  const J=R.J,lift=Math.max(0,-O.thL[0],-O.thR[0]);J.tab.rotation.x+=-Math.min(1.3,lift*.85)-Math.max(0,-O.hips[0])*.5;
  J.cp0.rotation.x+=Math.min(.7,Math.max(0,-O.hips[4]-.15)*.7+Math.max(0,O.spine[0]+O.chest[0]-.1)*.4);
  e.m.visible=!S.gone&&e.m.visible;
  if(on&&Math.random()<dt*10){const p=svWP(e,'chest',(Math.random()-.5)*.8,(Math.random()-.5)*1.2,0);burst(p,VLR.blood,1,.4,.6,.7)}}
var VLRP={
  // crimson combo: slash (right to left), backhand (left to right), thrust
  s1Up:{hips:[0,-.35,0],chest:[0,-.45,0],shR:[-1.2,0,-1.25],elR:[-.6,0,0],hdR:[1.25,0,0],shL:[-.4,0,.4],head:[0,.3,0],thL:[-.4,0,0],knL:[.4,0,0]},
  s1Hit:{hips:[0,.45,0,0,-.05,.25],chest:[.1,.55,0],shR:[-1.45,0,.55],elR:[-.1,0,0],hdR:[1.3,0,0],shL:[-.2,0,.8],head:[0,-.3,0],thL:[-.6,0,0],knL:[.5,0,0],thR:[.3,0,0]},
  s2Hit:{hips:[0,-.5,0,0,-.05,.3],chest:[.1,-.6,0],shR:[-1.0,0,-1.45],elR:[-.2,0,0],hdR:[1.3,0,0],shL:[-.4,0,.3],head:[0,.35,0],thR:[-.6,0,0],knR:[.5,0,0],thL:[.3,0,0]},
  thUp:{hips:[0,.4,0,0,0,-.25],chest:[0,.55,0],shR:[-.35,0,-.25],elR:[-1.9,0,0],hdR:[.5,0,0],shL:[-1.3,0,.6],elL:[-.3,0,0],head:[0,-.4,0],thR:[.3,0,0],thL:[-.4,0,0],knL:[.5,0,0]},
  thHit:{hips:[.1,-.15,0,0,-.15,.55],chest:[.15,-.2,0],shR:[-1.55,0,-.05],elR:[0,0,0],hdR:[0,0,0],shL:[.3,0,.4],head:[0,.1,0],thL:[-1.0,0,0],knL:[.7,0,0],thR:[.55,0,0],knR:[.1,0,0]},
  cRec:{hips:[0,0,0],shR:[-.8,0,-.2],elR:[-.6,0,0],hdR:[.2,0,0]},
  // lunge: sword drawn back level with the eyes
  lDraw:{hips:[0,.6,0,0,-.15,-.2],chest:[0,.5,0],shR:[-1.5,0,-.6],elR:[-1.8,0,0],hdR:[.9,0,0],shL:[-1.4,0,.1],elL:[-.2,0,0],head:[0,-.5,0],thL:[-.8,0,0],knL:[1.0,0,0],thR:[.4,0,0],knR:[.6,0,0]},
  lGo:{hips:[.2,-.1,0,0,-.35,.3],chest:[.15,-.15,0],shR:[-1.6,0,0],elR:[0,0,0],hdR:[0,0,0],shL:[.5,0,.5],head:[-.1,.1,0],thL:[-1.2,0,0],knL:[.6,0,0],thR:[.8,0,0],knR:[.3,0,0],cp0:[.9,0,0],cp1:[.3,0,0]},
  // blood wave: overhead cut
  wUp:{chest:[-.2,0,0],shR:[-2.9,0,-.15],elR:[-.4,0,0],hdR:[-.4,0,0],shL:[-2.7,0,.2],elL:[-.5,0,0],head:[-.2,0,0],thR:[.2,0,0],thL:[-.3,0,0]},
  wDn:{hips:[.1,0,0,0,-.2,.2],chest:[.4,0,0],shR:[-1.0,0,-.1],elR:[0,0,0],hdR:[.3,0,0],shL:[-.9,0,.2],head:[.25,0,0],thL:[-.6,0,0],knL:[.6,0,0],thR:[.3,0,0]},
  // rising slash (after the bat step)
  rLow:{hips:[0,.3,0,0,-.35,0],chest:[.3,.3,0],shR:[.4,0,-.4],elR:[-.3,0,0],hdR:[.4,0,0],shL:[-.3,0,.4],thL:[-.8,0,0],knL:[1.3,0,0],thR:[-.2,0,0],knR:[.9,0,0],head:[.1,-.2,0]},
  rHigh:{hips:[0,-.3,0,0,.1,0],chest:[-.25,-.4,0],shR:[-2.6,0,-.4],elR:[0,0,0],hdR:[-.2,0,0],shL:[-.3,0,.6],head:[-.3,.2,0],thR:[.2,0,0]},
  // sanguine nova: plant and kneel
  kneel:{hips:[0,0,0,0,-.85,0],spine:[.2,0,0],chest:[.15,0,0],shR:[-.9,0,-.05],elR:[-.3,0,0],hdR:[1.5,0,0],shL:[-.9,0,.05],elL:[-.3,0,0],thL:[-1.6,0,0],knL:[1.6,0,0],thR:[.3,0,0],knR:[1.9,0,0],ftR:[-.3,0,0],head:[.3,0,0]},
  rise:{hips:[0,0,0,0,.05,0],chest:[-.35,0,0],shR:[-1.8,0,-1.0],elR:[0,0,0],shL:[-1.8,0,1.0],head:[-.5,0,0],cp0:[.4,0,0]},
  // skyfall
  sUp:{root:[0,0,0,0,7,0],hips:[-.2,0,0],shR:[-1.8,0,-.4],elR:[-.2,0,0],shL:[-1.4,0,.8],thL:[-.4,0,0],knL:[.8,0,0],thR:[.1,0,0],knR:[.5,0,0],cp0:[.6,0,0]},
  sDive:{root:[0,0,0,0,0,0],hips:[.4,0,0,0,-.4,0],chest:[.4,0,0],shR:[-.5,0,-.05],elR:[0,0,0],hdR:[1.4,0,0],shL:[-.6,0,.4],thL:[-1.4,0,0],knL:[1.5,0,0],thR:[.2,0,0],knR:[1.6,0,0]},
  roar:{chest:[-.35,0,0],head:[-.55,0,0],shR:[-1.6,0,-1.1],elR:[-.2,0,0],shL:[-1.6,0,1.1],elL:[-.2,0,0],cp0:[.7,0,0],cp1:[.3,0,0]},
  bow:{hips:[0,0,0,0,-.05,0],chest:[.35,0,0],head:[.4,0,0],shR:[-.4,0,-.5],elR:[-.5,0,0],shL:[.3,0,.3],elL:[-1.3,0,0]},
  stag:{hips:[.1,0,.1,0,-.55,0],spine:[.3,0,.1],chest:[.3,0,0],head:[.5,0,.3],shR:[.3,0,-.3],elR:[-.2,0,0],hdR:[1.2,0,0],shL:[.1,0,.4],thL:[-1.3,0,0],knL:[1.6,0,0],thR:[-.2,0,0],knR:[1.2,0,0]},
  dead:{root:[0,0,0,0,-1.5,0],hips:[-.3,0,0,0,0,0],spine:[-.2,0,0],chest:[-.4,0,0],head:[-.4,.4,0],shR:[-.4,0,-1.2],shL:[-.3,0,1.3],thL:[-1.5,0,0],knL:[1.8,0,0],thR:[-1.4,0,0],knR:[1.9,0,0]},
  // ---- v112: Hemorrhage Grasp — draw the claw back, thrust it out, yank it home ----
  gReach:{hips:[0,.4,0,0,-.12,0],spine:[-.08,.1,0],chest:[-.12,.25,0],head:[0,-.55,0],shL:[.75,0,.55],elL:[-1.3,0,0],hdL:[.4,0,-.3],shR:[-.35,0,-.55],elR:[-.45,0,0],hdR:[.7,0,0],
    thL:[-.55,0,0],knL:[.65,0,0],ftL:[-.1,0,0],thR:[.35,0,0],knR:[.35,0,0],cp0:[.3,0,0]},
  gThrust:{hips:[.08,-.3,0,0,-.22,.3],spine:[.08,-.05,0],chest:[.12,-.15,0],head:[-.05,.3,0],shL:[-1.6,0,.05],elL:[.1,0,0],hdL:[-.5,0,0],shR:[.35,0,-.45],elR:[-.3,0,0],hdR:[.5,0,0],
    thL:[-1.0,0,0],knL:[.75,0,0],ftL:[.2,0,0],thR:[.55,0,0],knR:[.25,0,0],cp0:[.6,0,0],cp1:[.2,0,0]},
  gYank:{hips:[0,.3,0,0,-.08,-.1],chest:[-.15,.4,0],head:[-.1,-.35,0],shL:[-.5,0,.35],elL:[-1.9,0,0],hdL:[.7,0,0],shR:[-1.1,0,-1.15],elR:[-.7,0,0],hdR:[1.0,0,0],
    thL:[-.3,0,0],knL:[.4,0,0],thR:[.2,0,0],knR:[.2,0,0]},
  // ---- v112: Danse Macabre — a low coil, the blade held out flat for the spin, a sweeping finish ----
  dmCoil:{hips:[0,-.75,0,0,-.42,0],spine:[.1,-.25,0],chest:[.15,-.45,0],head:[.05,.95,0],shR:[.55,0,-.75],elR:[-.55,0,0],hdR:[1.1,0,0],shL:[-1.35,0,.35],elL:[-.35,0,0],
    thL:[-.85,0,0],knL:[1.4,0,0],ftL:[-.45,0,0],thR:[-.3,0,0],knR:[1.3,0,0],ftR:[-.6,0,0],cp0:[.2,0,0],cp1:[.15,0,0]},
  dmOut:{hips:[0,0,0,0,-.1,0],chest:[-.05,0,0],head:[0,0,0],shR:[-.1,0,-1.5],elR:[0,0,0],hdR:[1.57,0,0],shL:[-.1,0,1.35],elL:[-.2,0,0],hdL:[0,0,0],
    thL:[-.3,0,0],knL:[.6,0,0],ftL:[-.2,0,0],thR:[-.2,0,0],knR:[.55,0,0],ftR:[-.2,0,0],cp0:[1.1,0,0],cp1:[.35,0,0],cp2:[.2,0,0],tab:[-.6,0,0]},
  dmEnd:{hips:[.05,.55,0,0,-.35,.2],spine:[.05,.15,0],chest:[.15,.4,0],head:[0,-.6,0],shR:[-1.1,0,.75],elR:[-.15,0,0],hdR:[1.2,0,0],shL:[.3,0,.7],elL:[-.4,0,0],
    thL:[-.9,0,0],knL:[1.0,0,0],thR:[.4,0,0],knR:[.6,0,0],cp0:[.4,0,0]},
  // ---- v112: Thorned Procession — the sword raised point-down overhead in both hands, then driven into the floor ----
  tpRaise:{hips:[0,0,0,0,.08,0],spine:[-.1,0,0],chest:[-.25,0,0],head:[-.35,0,0],shR:[-2.5,0,.6],elR:[-.3,0,0],hdR:[1.6,-.5,0],shL:[-2.5,0,-.6],elL:[-.3,0,0],hdL:[1.3,0,0],
    thL:[-.15,0,0],knL:[.15,0,0],ftL:[.25,0,0],thR:[.1,0,0],ftR:[.3,0,0],wgL:[0,-.35,.25],wgR:[0,.35,-.25],cp0:[.35,0,0]},
  tpPlunge:{hips:[0,0,0,0,-.8,.15],spine:[.25,0,0],chest:[.3,0,0],head:[-.4,0,0],shR:[-.85,0,.6],elR:[-.05,0,0],hdR:[1.17,-.5,0],shL:[-.85,0,-.6],elL:[-.05,0,0],hdL:[.8,0,0],
    thL:[-1.45,0,0],knL:[1.35,0,0],ftL:[.1,0,0],thR:[.2,0,0],knR:[1.75,0,0],ftR:[-.35,0,0],cp0:[.7,0,0],cp1:[.25,0,0],wgL:[0,-.2,.45],wgR:[0,.2,-.45]}};
function vlrWave(c,a0,spd,L,dm){const e=c.e,o=c.m.position.clone(),a=c.m.rotation.y+a0;const g=svG('vl_cres',()=>{const q=new THREE.RingGeometry(1.0,1.6,14,1,-1.1+Math.PI/2,2.2);q.rotateX(-Math.PI/2);return q});
  const m=new THREE.MeshBasicMaterial({color:VLR.col,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),ms=new THREE.Mesh(g,m);ms.renderOrder=24;ms.userData.lpsSkip=1;scene.add(ms);
  let t=0,hit=false;const T=L/spd;svSnd('blood',.9,1.2);
  kqFx({tick(dt){t+=dt||0;const d=1+spd*t,p=new THREE.Vector3(o.x+Math.sin(a)*d,0,o.z+Math.cos(a)*d);ms.position.set(p.x,GH(p.x,p.z)+1.0,p.z);ms.rotation.y=a+Math.PI;ms.scale.set(1.3,1,1);
    if(Math.random()<.9)burst(gY(p,1),VLR.blood,3,1,.8,.5);if(!hit&&AF&&!e.dead&&svIn({k:'l',w:3.4,l:1.6,b:.8},{x:p.x,z:p.z,a},pl.position,.3)){hit=true;svHitNow(e,{k:'c',r:99},{x:p.x,z:p.z,a},dm,{flash:false})}
    return t<T&&!e.dead},end(){scene.remove(ms);m.dispose()}})}
function vlrSpear(c,q,T){const e=c.e,S2={k:'c',r:1.5},an={x:q.x,z:q.z,a:0};c.M.warn.push(svWarn(S2,an,T));
  const m=new THREE.Mesh(svG('vl_sp',()=>{const g=new THREE.ConeGeometry(.16,2.6,5);g.rotateX(Math.PI/2);return g}),kqBas(VLR.blood));
  svShot(new THREE.Vector3(q.x+(c.rnd()-.5)*3,GH(q.x,q.z)+14,q.z+(c.rnd()-.5)*3),new THREE.Vector3(q.x,GH(q.x,q.z)+.4,q.z),T,VLR.col,1.1,0,P=>{if(e.dead||!AF)return;burst(P,VLR.blood,20,2.2,2.5,.5);svDecal(P,0x4a0008,1.4,3,.6);svSnd('crack',.6,1.4);svHitNow(e,S2,an,.85,{col:VLR.col})},m)}
function vlrGone(e,on){const S=e.sv;S.gone=on;S.ghost=on;e.m.visible=!on;const p=e.m.position;for(let k=0;k<24;k++)burst(gY(p,1+Math.random()*2.2),0x1a0408,2,2.5,1.5,.9);burst(gY(p,1.8),VLR.blood,30,2,2,.6);svSnd('whoosh',.8,1.4)}
// ---- v112 effects ----
// Hemorrhage Grasp: five barbed blood tendrils shoot from the left claw along the cone; a caught hero is reeled in by the middle one
function vlrTendrils(c,an,hit){}
// Danse Macabre: a crescent of blood that trails the blade round the spin
function vlrCrescent(c,T){const e=c.e,m=c.m,g=svG('vl2_dmc',()=>{const q=new THREE.RingGeometry(1.1,4.5,22,1,-Math.PI/2-1.1,1.1);q.rotateX(-Math.PI/2);return q}),
  mt=new THREE.MeshBasicMaterial({color:VLR.col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),ms=new THREE.Mesh(g,mt);ms.renderOrder=24;ms.userData.lpsSkip=1;scene.add(ms);let t=0;
  kqFx({tick(dt){t+=dt||0;const k=t/T;ms.position.set(m.position.x,GH(m.position.x,m.position.z)+1.55,m.position.z);ms.rotation.y=m.rotation.y-Math.PI/2;mt.opacity=.75*Math.sin(Math.min(1,k)*Math.PI);
    if(Math.random()<.7)burst(svWP(e,'swd',0,0,2.2),VLR.blood,2,2.5,.6,.5);return t<T&&!e.dead},end(){scene.remove(ms);mt.dispose()}})}
// Thorned Procession: a lane of blood thorns erupting one after another away from the sword; hits once per lane
function vlrThorns(c,an,dm){const e=c.e,A=c.A,N=12,step=1.35,mat=vlrSpkMat(),sa=Math.sin(an.a),ca=Math.cos(an.a);let t=0,k=0,hit=false;
  kqFx({tick(dt){t+=dt||0;while(k<N&&t>=k*.055){const d=k*step,x=an.x+sa*d,z=an.z+ca*d;k++;if(A&&Math.hypot(x-A.cx,z-A.cz)>ARENA_R-1){k=N;break}
      const p=new THREE.Vector3(x,0,z);svSpike(p,mat,1.6+(k%3)*.25,.3,.9,.5);const sd=(k%2?1:-1)*.5;svSpike(new THREE.Vector3(x+ca*sd,0,z-sa*sd),mat,.9,.18,.75,.7);
      if(k%2)svDecal(p,0x3a0008,1.1,1.6,.5);burst(gY(p,.4),VLR.blood,4,2,2,.4);if(k%3===1)svSnd('crack',.5,1.1+k*.04);
      if(!hit&&AF&&!e.dead&&svIn({k:'c',r:.75},{x,z,a:0},pl.position,.3)){hit=true;svHitNow(e,{k:'c',r:99},{x,z,a:0},dm,{flash:false})}}
    return k<N&&!e.dead},end(){}})}
var VLRM={
  intro:{dur:3.0,trk:[[.5,'bow','io'],[1.3,'bow','l',.005],[1.9,'rise','o'],[2.6,'rise','l'],[3.0,'cRec','io']],trn:[[0,3,1]],
    ev:[[.4,c=>svSnd('bell',.7,.8)],[1.85,c=>{svSnd('blood',1,.6);svSnd('shriek',.5,1.4);shake(.3);svShock(c.m.position,VLR.col,8,.7);flash('rgba(200,20,40,.25)')}]]},
  combo:{wt:10,cd:2.5,r:[0,6.2],a:'f',mel:1,dur:2.35,lock:.38,trn:[[0,.38,5],[.75,.85,5],[1.2,1.5,4]],
    trk:[[.38,'s1Up','io'],[.5,'s1Up','l',.01],[.62,'s1Hit','s'],[.82,'s1Hit','l'],[.98,'s2Hit','s'],[1.3,'thUp','io'],[1.55,'thUp','l',.012],[1.68,'thHit','s'],[2.0,'cRec','io'],[2.35,'cRec','l']],
    rm:[[.55,.66,1,'o'],[.9,1.0,.8,'o'],[1.6,1.72,2.5,'o']],
    hit:[{t:.61,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.95},{t:.97,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.95},{t:1.68,s:{k:'l',w:1.6,l:6.5,b:0},f:.4,dm:1.3,w:.38}],
    tr:[[.52,.7,'swd',[0,0,2.3],[0,0,.4],0xff5060,.18],[.86,1.04,'swd',[0,0,2.3],[0,0,.4],0xff5060,.18],[1.58,1.75,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15]],
    ev:[[.55,c=>svSnd('swing',.8,1.3)],[.9,c=>svSnd('swing',.8,1.4)],[1.62,c=>svSnd('whoosh',.8,1.6)]],nx:[['lunge',.25,9]],rec:.25},
  lunge:{wt:8,cd:5,r:[4.5,15],a:'f',dur:1.9,lock:.7,armor:1,trn:[[0,.7,5]],trk:[[.55,'lDraw','io'],[.8,'lDraw','l',.012],[.95,'lGo','s'],[1.3,'lGo','l'],[1.9,'cRec','io']],
    rm:[[.86,1.1,'tgt','o',-1.5,14]],hit:[{t:1.0,s:{k:'l',w:2.2,l:15,b:0},f:0,dm:1.4,w:.6}],tr:[[.86,1.15,'swd',[0,0,2.3],[0,0,.4],0xff5060,.2]],
    ev:[[.3,c=>svSnd('hum',.4,1.6)],[.86,c=>{svSnd('whoosh',1.1,1.1);burst(gY(c.m.position,1),VLR.blood,30,3,1,.6)}]],rec:.4},
  wave:{wt:8,cd:5,r:[6.5,40],a:'f',dur:1.9,lock:.75,trn:[[0,.75,4]],trk:[[.6,'wUp','io'],[.85,'wUp','l',.015],[.98,'wDn','s'],[1.4,'wDn','l'],[1.9,'cRec','io']],
    hit:[{t:.96,s:{k:'l',w:3.4,l:22,b:0},f:1,dm:0,nohit:1,w:.75,fx:c=>vlrWave(c,0,16,22,1.2)}],tr:[[.86,1.04,'swd',[0,0,2.3],[0,0,.4],0xff5060,.2]],ev:[[.88,c=>svSnd('swing',1,1)]],rec:.35},
  batstep:{wt:7,cd:10,r:[0,40],a:'any',dur:2.6,armor:1,inv:[.35,1.35],trn:[[0,.1,1]],trk:[[.3,'bow','io'],[1.35,'rLow','io'],[1.65,'rLow','l',.012],[1.8,'rHigh','s'],[2.2,'cRec','io'],[2.6,'cRec','l']],
    ev:[[.32,c=>vlrGone(c.e,true)],[1.3,c=>{const e=c.e,m=e.m,a=svYawTo(m,pl.position)+(c.rnd()<.5?1.4:-1.4),q=c.inA(pl.position.clone().add(new THREE.Vector3(Math.sin(a)*3.2,0,Math.cos(a)*3.2)),2);
      m.position.set(q.x,0,q.z);m.rotation.y=svYawTo(m,pl.position);vlrGone(e,false);svSnd('bell',.9,1.3)}]],
    hit:[{t:1.78,s:{k:'a',r:5.2,h:.9},f:0,dm:1.3,w:.45}],tr:[[1.68,1.88,'swd',[0,0,2.3],[0,0,.4],0xff5060,.2]],end(c){if(c.S.gone)vlrGone(c.e,false)},rec:.35},
  nova:{wt:6,cd:7,r:[0,6],a:'any',dur:2.2,armor:1,trn:[[0,.4,2]],trk:[[.5,'kneel','io'],[1.25,'kneel','l',.01],[1.4,'rise','s'],[2.2,'cRec','io']],
    hit:[{t:1.38,s:{k:'c',r:7},dm:1.5,w:1.2,kb:3,fx:c=>{svShock(c.m.position,VLR.col,8,.5);burst(gY(c.m.position,1),VLR.blood,70,6,4,.8);svDecal(c.m.position,0x3a0008,6,4,.55);shake(.4);svSnd('blood',1.2,.7)}}],
    ev:[[.25,c=>{svSnd('charge',.6,.7);svDecal(c.m.position,0x8a0018,7,1.4,.35)}]],rec:.4},
  // ---- v112: Hemorrhage Grasp (both phases): a narrow red cone; caught = dragged in, often followed by a combo ----
  grasp:{wt:8,cd:9,r:[3.5,9.5],a:'f',dur:2.4,lock:.75,trn:[[0,.75,4]],
    trk:[[.5,'gReach','io'],[1.0,'gReach','l',.012],[1.12,'gThrust','s'],[1.5,'gThrust','l'],[1.78,'gYank','b'],[2.2,'cRec','io'],[2.4,'cRec','l']],
    hit:[{t:1.12,s:{k:'a',r:9.4,h:.34},f:0,dm:1.0,w:.9,on:(c)=>{const m=c.m,a=m.rotation.y,q=c.inA(new THREE.Vector3(m.position.x+Math.sin(a)*2.6,0,m.position.z+Math.cos(a)*2.6),1),
        dx=q.x-pl.position.x,dz=q.z-pl.position.z,L=Math.hypot(dx,dz);if(L>.3)pl.step={x:dx/L,z:dz/L,t:.32,sp:L/.32};c.M.an.caught=1;svSnd('squelch',1,.9);flash('rgba(160,0,20,.25)')},
      fx:(c,an,hit)=>{vlrTendrils(c,an,hit);burst(c.wp('hdL',0,-.15,0),VLR.blood,25,3,1.5,.5)}}],
    ev:[[.35,c=>{svSnd('hiss',.6,.6);svCharge(c.e,'hdL',VLR.col,.9,.75,0,-.15,0);svDecal(c.m.position,0x6a0010,2.2,2.2,.4)}],[1.1,c=>svSnd('whoosh',.9,.8)]],
    nx:[['combo5',.6,6.5],['combo',.6,6.5]],rec:.3},
  // ---- v112: Danse Macabre (both phases): coil, then two full spins — a close circle, then a wide ring ----
  spin:{wt:(e,L,side)=>side==='f'?7:12,cd:8,r:[0,5.8],a:'any',dur:3.0,trn:[[0,.9,4]],
    trk:[[.55,'dmCoil','io'],[1.05,'dmCoil','l',.012],[1.2,'dmOut','s'],[2.05,'dmOut','l'],[2.3,'dmEnd','o'],[2.75,'cRec','io'],[3.0,'cRec','l']],
    hit:[{t:1.5,s:{k:'c',r:4.6},dm:1.1,w:.85,fx:c=>{svShock(c.m.position,VLR.col,4.8,.35);burst(gY(c.m.position,1.5),VLR.blood,30,5,1,.5);svSnd('swing',1,.9)}},
      {t:1.98,s:{k:'r',r0:2.6,r:6.8},dm:1.2,w:.6,kb:2.5,fx:c=>{svShock(c.m.position,VLR.col,7,.45,.5);svDecal(c.m.position,0x3a0008,6.5,2.5,.45);burst(gY(c.m.position,1.5),VLR.blood,50,7,1.4,.6);shake(.25);svSnd('blood',1,1.1)}}],
    tr:[[1.15,2.12,'swd',[0,0,2.3],[0,0,.5],0xff5060,.3]],
    ev:[[.3,c=>{svSnd('hum',.5,.9);svCharge(c.e,'swd',VLR.col,1.1,.8,0,0,2.2)}],[1.12,c=>{c.M.an.y0=c.m.rotation.y;vlrCrescent(c,1.0);svSnd('whoosh',1.1,.9)}],[1.6,c=>svSnd('whoosh',1.1,1.1)]],
    tk(c){const M=c.M;if(M.an.y0==null||M.an.yd)return;const k=Math.min(1,(c.t-1.12)/.95);c.m.rotation.y=M.an.y0+Math.PI*4*svEase.o(k);if(k>=1){c.m.rotation.y=svAng(M.an.y0);M.an.yd=1}},
    end(c){const M=c.M;if(M&&M.an.y0!=null&&!M.an.yd){c.m.rotation.y=svAng(c.m.rotation.y);M.an.yd=1}},rec:.4},
  // ---- Phase II ----
  awaken:{dur:3.4,inv:[0,3.4],armor:1,trk:[[.5,'bow','io'],[1.2,'bow','l',.02],[1.7,'roar','o'],[2.9,'roar','l',.02],[3.4,'cRec','io']],trn:[[0,3,1]],
    hit:[{t:1.75,s:{k:'c',r:7.5},dm:.5,kb:6,w:1.2,fx:c=>{svShock(c.m.position,VLR.col,10,.8);burst(gY(c.m.position,2),VLR.blood,90,6,4,1)}}],
    ev:[[.05,c=>{banner('THE BLOOD MOON','Vaelric casts off his mortal shape','');svSnd('bell',.9,.6)}],[1.2,c=>{c.S.ph=2;c.e.bs.ph=2;flash('rgba(220,20,50,.4)');svSnd('shriek',1,.8);svSnd('roar',.8,1.3);shake(.5)}]]},
  skyfall:{wt:8,cd:14,ph:2,r:[0,40],a:'any',dur:4.2,armor:1,inv:[.7,3.1],trn:[[0,4.2,2.5]],trk:[[.45,'kneel','io'],[1.0,'sUp','o'],[2.95,'sUp','l'],[3.25,'sDive','i'],[3.8,'sDive','l'],[4.2,'cRec','io']],
    ev:[[.5,c=>svSnd('whoosh',1.2,.6)],[.9,c=>{c.S.ghost=1}]].concat([0,1,2,3,4,5].map(i=>[1.15+i*.28,c=>{const d=pl.mvd&&nowP()-pl.mvd.t<300?pl.mvd:{x:0,z:0},q=c.inA(pl.position.clone().add(new THREE.Vector3(d.x*2.2,0,d.z*2.2)),.8);vlrSpear(c,q,.62)}])),
    rm:[[2.85,3.25,'tgt','i',0,40]],hit:[{t:3.25,s:{k:'c',r:4.6},o:'tgt',dm:1.7,w:.75,kb:3.5,fx:(c,an)=>{c.S.ghost=0;const p=new THREE.Vector3(an.x,0,an.z);svShock(p,VLR.col,7,.6);burst(gY(p,.5),VLR.blood,80,5,4,.8);svDecal(p,0x3a0008,4,4,.6);shake(.55);svSnd('heavy',1.2,1.1)}}],
    end(c){c.S.ghost=0},rec:.5},
  waves:{wt:7,cd:7,ph:2,r:[5,40],a:'f',dur:2.3,lock:.8,trn:[[0,.8,4]],trk:[[.6,'wUp','io'],[.88,'wUp','l',.015],[1.0,'wDn','s'],[1.5,'wDn','l'],[2.3,'cRec','io']],
    hit:[{t:.98,s:{k:'l',w:3.4,l:20,b:0},ay:-.45,f:1,dm:0,nohit:1,w:.75,fx:c=>vlrWave(c,-.45,15,20,1.1)},{t:.98,s:{k:'l',w:3.4,l:20,b:0},f:1,nohit:1,w:.75,fx:c=>vlrWave(c,0,15,20,1.1)},{t:.98,s:{k:'l',w:3.4,l:20,b:0},ay:.45,f:1,nohit:1,w:.75,fx:c=>vlrWave(c,.45,15,20,1.1)}],
    tr:[[.9,1.06,'swd',[0,0,2.3],[0,0,.4],0xff5060,.2]],ev:[[.9,c=>svSnd('swing',1,.8)]],rec:.4},
  combo5:{wt:9,cd:3.5,ph:2,r:[0,6.5],a:'f',mel:1,dur:3.1,lock:.3,trn:[[0,.3,5],[.6,.7,5],[1.0,1.1,5],[1.4,1.5,5],[2.0,2.25,4]],
    trk:[[.3,'s1Up','io'],[.45,'s1Hit','s'],[.62,'s1Hit','l'],[.78,'s2Hit','s'],[.95,'s1Up','io'],[1.12,'s1Hit','s'],[1.3,'s1Up','io'],[1.48,'s2Hit','s'],[1.9,'thUp','io'],[2.2,'thUp','l',.012],[2.33,'thHit','s'],[2.7,'cRec','io'],[3.1,'cRec','l']],
    rm:[[.4,.5,.8,'o'],[.72,.82,.6,'o'],[1.05,1.15,.6,'o'],[1.42,1.52,.6,'o'],[2.25,2.38,2.6,'o']],
    hit:[{t:.44,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.85},{t:.77,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.85},{t:1.11,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.85},{t:1.47,s:{k:'a',r:4.6,h:1.25},f:.3,dm:.85},{t:2.33,s:{k:'l',w:1.8,l:7,b:0},f:.4,dm:1.4,w:.4}],
    tr:[[.38,.52,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15],[.7,.84,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15],[1.04,1.18,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15],[1.4,1.55,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15],[2.22,2.4,'swd',[0,0,2.3],[0,0,.4],0xff5060,.15]],
    ev:[[.38,c=>svSnd('swing',.8,1.3)],[.72,c=>svSnd('swing',.8,1.4)],[1.05,c=>svSnd('swing',.8,1.3)],[1.42,c=>svSnd('swing',.8,1.5)],[2.25,c=>svSnd('whoosh',.9,1.6)]],rec:.4},
  // ---- v112: Thorned Procession (Phase II): five lanes of thorns race out toward you, then four more in the gaps ----
  thorns:{wt:9,cd:12,ph:2,r:[5,28],a:'fs',dur:3.3,armor:1,trn:[[0,.35,4]],
    trk:[[.6,'tpRaise','io'],[1.05,'tpRaise','l',.012],[1.2,'tpPlunge','s'],[2.6,'tpPlunge','l',.006],[3.1,'cRec','io'],[3.3,'cRec','l']],
    hit:[-.64,-.32,0,.32,.64].map(ay=>({t:1.22,s:{k:'l',w:1.6,l:16,b:0},f:2.4,ay,nohit:1,w:.85,fx:(c,an)=>vlrThorns(c,an,.95)}))
      .concat([-.48,-.16,.16,.48].map(ay=>({t:2.05,s:{k:'l',w:1.6,l:16,b:0},f:2.4,ay,nohit:1,w:.7,fx:(c,an)=>vlrThorns(c,an,.95)}))),
    ev:[[.4,c=>{svSnd('charge',.6,.6);svCharge(c.e,'swd',VLR.col,1.3,.8,0,0,2.3)}],[1.2,c=>{const p=c.at(2.5);svShock(p,VLR.col,5,.45);svDecal(p,0x3a0008,2.5,3.5,.6);burst(gY(p,.3),VLR.blood,50,4,3,.6);shake(.45);svSnd('heavy',1.2,.9)}],
      [2.0,c=>{svSnd('blood',.9,.8);burst(gY(c.at(2.5),.3),VLR.blood,30,3,2,.5)}]],rec:.45}};
VLRM.combo.ph1only=1;
svReg(5,{name:'Vaelric',col:VLR.col,body:1.3,ph2:.55,poise:.17,headJ:'head',turnA:5,
  ai:{pref:4,walk:2.8,run:5.2,turn:3.4,rest:[.6,1.2],ph2r:.7,strafe:.65,back:1},
  build:vlrBuild,loco:vlrLoco,post:vlrPost,P:VLRP,M:VLRM,
  stag:[[.25,'stag','o'],[2.0,'stag','l',.02],[2.5,'cRec','io']],stagT:2.5,
  die:[[.5,'stag','o'],[1.3,'dead','i'],[2.1,'dead','l']],
  homeY(A){const a=A.dqA!=null?A.dqA:0;return Math.atan2(Math.cos(a),Math.sin(a))},
  reset(e){const S=e.sv;if(S.gone)vlrGone(e,false);S.ghost=0;S.wk=0},
  dying(e,t){if(Math.random()<.6)burst(gY(e.m.position,1+Math.random()*2),0x1a0408,2,2,1.5,.9)}});
// ---- v112: the den's warning sign describes the current fight ----
DSTXT[5]={den:'The Crimson Throne Hall',zone:'The Citadel',
  atk:[['⚔ Crimson Combo','Up close: a slash, a backhand, a pause… then a long thrust. Phase II: four slashes, then the thrust.','Dodge each slash as it comes; the thrust is late — dash through it or step to the side, then strike.'],
   ['🗡 Crimson Lunge','He draws the blade back level with his eyes, then lunges far along a red line.','Sidestep the line as he lunges; once committed he cannot turn.'],
   ['🖐 Hemorrhage Grasp','He draws his left claw back, then thrusts it: blood tendrils lash a narrow red cone. Caught, you are dragged to his feet — often straight into a combo.','Step sideways out of the cone, or dash through it as he thrusts. If you are caught, dodge at once.'],
   ['🌊 Blood Wave','From afar: an overhead cut sends a crescent of blood down a long red line. Phase II: Triple Wave, three crescents fanning out.','Step out of the line; against three, stand in a gap or close in.'],
   ['🦇 Bat Step','He bursts into bats (untouchable) and re-forms at your side with a bell toll and a rising slash.','When the bell tolls, dash away from where he reappears.'],
   ['🩸 Sanguine Nova','He plants the sword and kneels; a blood circle bursts around him and throws you back.','Leave the red circle before he rises — then punish him.'],
   ['🌀 Danse Macabre','He coils low and trembles, then spins twice with the blade out: first a red circle close around him, then a wider red ring.','Be beyond the outer ring — or step in close right after the first cut: the second ring misses the inside.'],
   ['🌕 The Blood Moon','At 55% health he roars (immune) and a shockwave throws you back; bat wings tear free and he rests less between attacks.','Back off while he roars.'],
   ['☄ Skyfall','Phase II: he rises out of reach, blood spears rain on red circles where you are heading, then he plunges onto you.','Keep changing direction under the spears, then dash out of the plunge circle.'],
   ['🌹 Thorned Procession','Phase II: he raises the sword point-down and drives it into the floor: five lanes of blood thorns race out toward you, then four more burst in the gaps.','Stand between the first lanes, then step into a lane that has just sunk — or leave the fan to the side.']],
  weak:['Posture: your hits fill the yellow bar under his health. When it breaks he is STAGGERED for about 2 seconds and takes +35% damage.',
   'Lunge, Bat Step, Nova, Skyfall and Thorned Procession have armour: a posture break waits until the move ends.',
   'Every move ends with a recovery — the third hit of a combo, the end of a spin and the plunged sword are your openings.',
   'Red on the ground marks area attacks for their whole wind-up; sword swings only flash faint just before they land, so watch the blade.']};
