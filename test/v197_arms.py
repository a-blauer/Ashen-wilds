# v197 relaxed arms for the town folk: checks (FAIL lines) on several species
#   * standing: the arm hangs (elbow below the shoulder, paw below the elbow), elbow bent 8-35 degrees, paw outside the hip
#   * walking: the elbow bends more as the arm swings forward than when it swings back; the arms swing opposite each other
#   * idle + the v196 poses over many frames: no drift (the relaxed arm comes back to where it started)
#   * v196 poses: seated paws on the thighs, eating paw at the mouth, clapping paws meet, rim paws beside the hips
#   * the rest (czRest103) is the bind pose (work poses unchanged); lantern wardens have no relaxed arm
#   * hero (warrior rat): the empty left hand hangs (elbow <= 26 deg standing, was ~51), the sword arm is unchanged, the empty
#     elbow bends more on the forward swing than the back swing while walking, and an attack pose is left alone
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
SP=os.environ.get('SP','fox,bear,hare,mouse,boar,owl,stag,hedgehog,goat,wolf').split(',')
JS=r"""(sps)=>{const out={fails:[],info:[]},fail=s=>out.fails.push(s),V=THREE.Vector3;
  const mk=sp=>{const rig=idlNpcBody({robe:0x6a4a3a,trim:0xc9a24a,hat:'',fkSp:sp,fkFur:0,label:''});const g=new THREE.Group();rig.meshes.forEach(m=>g.add(m));g.bones=rig.bones;g.userData.rest=czRest103(g);return g};
  const W=(g,k)=>{g.updateMatrixWorld(true);return g.bones[k].getWorldPosition(new V())};
  const ang=(a,b,c)=>{const u=a.clone().sub(b).normalize(),v=c.clone().sub(b).normalize();return 180-Math.acos(Math.max(-1,Math.min(1,u.dot(v))))*180/Math.PI};
  const rot=(g,k)=>g.bones[k].rotation.toArray().slice(0,3);
  sps.forEach(sp=>{let g;try{g=mk(sp)}catch(e){fail(sp+': build '+e);return}const A=rlx197Of(g);if(!A){fail(sp+': no relaxed arm data');return}
    // the rest is still the bind pose
    const R=czRest103(g);['aL0','aL1','aR0','aR1'].forEach(k=>{if(Math.hypot(...R[k].slice(0,3).map((v,i)=>v-A.B[k][i]))>1e-6)fail(sp+': rest of '+k+' is not the bind pose')});
    IDL.on=true;czReset103(g);g._idl=null;let T=5000;for(let i=0;i<20;i++){T+=33;idlNpc(g,T)}
    ['L','R'].forEach(sd=>{const s=W(g,'a'+sd+'0'),e=W(g,'a'+sd+'1'),w=W(g,'a'+sd+'2'),h=W(g,(sd=='L'?'l':'r')+'h0'),b=ang(s,e,w);
      if(!(e.y<s.y-.12&&w.y<e.y-.08))fail(sp+' stand '+sd+': arm not hanging (shoulder '+s.y.toFixed(2)+' elbow '+e.y.toFixed(2)+' paw '+w.y.toFixed(2)+')');
      if(b<8||b>35)fail(sp+' stand '+sd+': elbow bend '+b.toFixed(1)+' deg (want 8-35)');
      if(Math.abs(w.x)<Math.abs(h.x)+.03)fail(sp+' stand '+sd+': paw inside the hip line (paw x '+w.x.toFixed(3)+', hip x '+h.x.toFixed(3)+')');
      if(sd=='L')out.info.push(sp+': elbow bend '+b.toFixed(1)+' deg')});
    // walking: forward swing bends the elbow more
    const wk=ph=>{czWalkPose103(g,ph,1);const r={};['L','R'].forEach(sd=>{r[sd]={b:ang(W(g,'a'+sd+'0'),W(g,'a'+sd+'1'),W(g,'a'+sd+'2')),z:W(g,'a'+sd+'2').z}});return r};
    const p1=wk(-Math.PI/2),p2=wk(Math.PI/2); // -pi/2: left arm forward
    if(!(p1.L.z>p2.L.z+.06&&p2.R.z>p1.R.z+.06))fail(sp+' walk: arms do not swing opposite (L '+p1.L.z.toFixed(2)+'/'+p2.L.z.toFixed(2)+' R '+p1.R.z.toFixed(2)+'/'+p2.R.z.toFixed(2)+')');
    if(!(p1.L.b>p2.L.b+8&&p2.R.b>p1.R.b+8))fail(sp+' walk: elbow does not bend more on the forward swing (L '+p1.L.b.toFixed(0)+'/'+p2.L.b.toFixed(0)+')');
    // drift: idle and poses for a long time, then stand again
    czReset103(g);g._idl=null;const r0=['aL0','aL1','aR0','aR1'].map(k=>rot(g,k));
    const acts=[['eat',{sit:1,h:.45}],['warm',{sit:1,h:.45}],['rim',{sit:1,h:.62}],['sit',{sit:1,h:.45}],['listen',{}],['browse',{}]];
    g.userData.hipY=W(g,'lh0').y;
    acts.forEach(([a,s])=>{const o={g,i:1,act:{a,s}};for(let i=0;i<240;i++){T+=33;dm196Undo(o);idlNpc(g,T);dm196Pose(o,T)}dm196Undo(o)});
    IDL.on=false;for(let i=0;i<3;i++){T+=33;idlNpc(g,T)}const A2=rlx197Of(g);rlx197Undo(g,A2);
    const r1=['aL0','aL1','aR0','aR1'].map(k=>rot(g,k));let dr=0;r0.forEach((v,i)=>v.forEach((x,j)=>dr=Math.max(dr,Math.abs(x-r1[i][j]))));
    IDL.on=true;if(dr>.05)fail(sp+': arms drifted '+dr.toFixed(3)+' rad after idle + poses');
    // the v196 poses put the paws where they belong
    const pose=(a,s,t)=>{czReset103(g);g._idl=null;IDL.on=false;const o={g,i:0,act:{a,s}};dm196Pose(o,t);g.updateMatrixWorld(true);const r={wL:W(g,'aL2'),wR:W(g,'aR2'),eL:W(g,'aL1'),eR:W(g,'aR1'),h:W(g,'head'),
        tL:W(g,'lh0').lerp(W(g,'lh1'),.5),tR:W(g,'rh0').lerp(W(g,'rh1'),.5),hL:W(g,'lh0'),hR:W(g,'rh0')};dm196Undo(o);IDL.on=true;return r};
    let q=pose('sit',{sit:1,h:.45},1000);['L','R'].forEach(sd=>{const d=q['w'+sd].distanceTo(q['t'+sd]);if(d>.16)fail(sp+' rest '+sd+': paw '+d.toFixed(2)+' m from the thigh')});
    q=pose('eat',{sit:1,h:.45},1111);{const N=A.nose;if(!N)fail(sp+': no snout tip measured');else{czReset103(g);g._idl=null;IDL.on=false;const o={g,i:0,act:{a:'eat',s:{sit:1,h:.45}}};dm196Pose(o,1111);g.updateMatrixWorld(true);const mo=g.bones.head.localToWorld(new V(0,N[1]-.045,N[2]*.78)),d=W(g,'aR2').distanceTo(mo);dm196Undo(o);IDL.on=true;out.info.push(sp+': eating wrist '+d.toFixed(3)+' m from the mouth');if(d>.14)fail(sp+' eat: wrist '+d.toFixed(2)+' m from the mouth')}}
    q=pose('listen',{},2000*Math.PI/9);{const d=q.wL.distanceTo(q.wR);if(d>.12)fail(sp+' clap: paws '+d.toFixed(2)+' m apart');if(Math.abs(q.eL.x)<.08||Math.abs(q.eR.x)<.08)fail(sp+' clap: an elbow inside the chest')}
    q=pose('rim',{sit:1,h:.62},1000);['L','R'].forEach(sd=>{const d=q['w'+sd].distanceTo(q['h'+sd]);if(d>.3)fail(sp+' rim '+sd+': paw '+d.toFixed(2)+' m from the hip')});
  });
  // every animal townsperson already in the game (built while the script loaded, before this file) gets the relaxed arm too
  {let n=0,r=0;const L=[];try{(npc.all||[]).forEach(g=>L.push(g))}catch(e){}try{(CZ103.live||[]).forEach(o=>o.g&&L.push(o.g))}catch(e){}
    L.forEach(g0=>{const g=g0.bones?g0:g0.children.find(c=>c.bones);if(!g||!g.bones.pelvis||!g.children.some(m=>m.isSkinnedMesh&&m.userData.fk))return;n++;if(rlx197Of(g))r++});
    out.info.push('live folk with the relaxed arm: '+r+' / '+n);if(r<n)fail('live folk without the relaxed arm: '+(n-r)+' of '+n)}
  // lantern wardens keep their weapon poses
  try{const k=Object.keys(MQW143.D)[0],w=mqw143Make(k);if(rlx197Of(w))fail('warden '+k+': has the relaxed arm');else out.info.push('warden '+k+': no relaxed arm (ok)')}catch(e){fail('warden build '+e)}
  return out}"""

HJS=r"""()=>{const out={fails:[],info:[]},fail=s=>out.fails.push(s);window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){out.err=String(err).slice(0,200)}}};
 enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});const V=THREE.Vector3,B=pl.bones;
 const W=k=>{pl.updateMatrixWorld(true);return B[k].getWorldPosition(new V())};
 const ang=sd=>{const s=W('a'+sd+'0'),e=W('a'+sd+'1'),w=W('a'+sd+'2'),u=s.sub(e).normalize(),v=w.sub(e).normalize();return 180-Math.acos(Math.max(-1,Math.min(1,u.dot(v))))*180/Math.PI};
 if(!rlx197HEmpty(pl,'L')||rlx197HEmpty(pl,'R'))fail('warrior: expected an empty left hand and a weapon in the right ('+rlx197HEmpty(pl,'L')+','+rlx197HEmpty(pl,'R')+')');
 STEP(90);const L1=ang('L'),R1=ang('R');RLX197H.on=false;STEP(30);const L0=ang('L'),R0=ang('R');RLX197H.on=true;STEP(30);
 out.info.push('standing elbows: empty left '+L1.toFixed(1)+' (layer off '+L0.toFixed(1)+'), sword right '+R1.toFixed(1)+' (off '+R0.toFixed(1)+')');
 if(L1>26)fail('standing: empty left elbow '+L1.toFixed(1)+' deg (want <= 26)');{const seen=[],f0=brAddR;brAddR=function(H,bn){seen.push(bn);return f0.apply(this,arguments)};try{rlx197HArms(pl,BRD[pl._race],VT)}finally{brAddR=f0}brUndo(pl);STEP(2);
   if(seen.some(n=>/^aR/.test(n)))fail('the layer touched the sword arm: '+seen.join(','));if(!seen.includes('aL1'))fail('the layer did not touch the empty left elbow: '+seen.join(','))}
 K.w=true;STEP(40);const sw=[];for(let i=0;i<90;i++){STEP(1);sw.push([B.aL0.rotation.x,ang('L')])}K.w=false;
 sw.sort((a,b)=>a[0]-b[0]);const n=Math.max(3,sw.length/6|0),fwd=sw.slice(0,n).reduce((a,q)=>a+q[1],0)/n,bk=sw.slice(-n).reduce((a,q)=>a+q[1],0)/n;
 out.info.push('walking: empty elbow '+fwd.toFixed(1)+' on the forward swing, '+bk.toFixed(1)+' on the back swing');if(!(fwd>bk+8))fail('walking: the empty elbow does not bend more on the forward swing ('+fwd.toFixed(1)+' vs '+bk.toFixed(1)+')');
 STEP(60);atkCd=0;swing();STEP(4);const a=HA.cur;let mx=0;for(let i=0;i<20&&HA.cur;i++){STEP(1);let s=0;(pl._brU||[]).forEach(u=>{});mx=Math.max(mx,pl._brS?1-pl._brS.a:0)}
 if(!a)out.info.push('no attack pose started (skipped the attack check)');else if(mx<.5)fail('attack: the arm hold did not ease out ('+mx.toFixed(2)+')');
 return out}"""
def s(pg):
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    errs=[];pg.on('pageerror',lambda e: errs.append(str(e)))
    r=pg.evaluate(JS,SP)
    h=pg.evaluate(HJS)
    if h.get('err'):h['fails'].append('hero loop error '+h['err'])
    r['info']+=h['info'];r['fails']+=h['fails']
    for i in r['info']:print(' ',i)
    for f in r['fails']:print('FAIL',f)
    for e in errs[:6]:print('FAIL page error:',e[:300])
    print('==== v197_arms: %d fails'%(len(r['fails'])+len(errs[:6])))
play.run(s)
