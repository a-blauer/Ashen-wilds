// =====================================================================================================
// P: {bones, sex 0|1, build 0..2, wf (width), af (arm thickness), lf (leg thickness), belly, hunch, col:{…}, paint:{…}}
//   col regions: skin, torso, torsoLo, belt, sleeve, fore, hand, pants, shin, boot, sole, neck
function mdP(o){const P=Object.assign({sex:0,build:1,wf:1,af:1,lf:1,belly:0,col:{},paint:{}},o||{});
  if(!P.bones)P.bones=HB;P.col=Object.assign({skin:0xd9b38c,torso:0x6a4a34,belt:0x3a2618,sleeve:null,fore:null,hand:null,pants:0x4a3a2c,shin:null,boot:0x3a2a1e,sole:0x1e1610,neck:null},P.col);
  const C=P.col;if(C.sleeve==null)C.sleeve=C.torso;if(C.fore==null)C.fore=C.skin;if(C.hand==null)C.hand=C.skin;if(C.shin==null)C.shin=C.pants;if(C.neck==null)C.neck=C.skin;if(C.torsoLo==null)C.torsoLo=C.torso;
  return P}
function mdBuildF(P){return [.86,1,1.16][P.build|0]*(P.wf||1)}
// torso rings bottom → neck, with bone weights by height
function mdTorsoW(y){return y<=.5?[['pelvis',1]]:y<=.66?mdWb('pelvis','spine',(y-.5)/.16):y<=.82?mdWb('spine','chest',(y-.66)/.16):y<=.97?[['chest',1]]:y<=1.035?mdWb('chest','neck',(y-.97)/.065):mdWb('neck','head',Math.min(1,(y-1.035)/.05))}
function mdTorso(P){const W=mdBuildF(P),fem=P.sex==1,sh=fem?.86:1,wa=fem?.8:1,hp=fem?1.15:1,bu=P.belly||0,bust=fem?.064:0;
  const T=[[.44,.145*hp,.1,.105],[.5,.158*hp+bu*.1,.11+bu*.3,.114],[.56,.165*hp+bu*.25,.116+bu*.6,.118+bu*.2],[.62,.158*(wa+.06)+bu*.35,.112+bu,.114+bu*.3],[.7,.16*wa+bu*.35,.114+bu,.114+bu*.3],[.78,.18*(fem?.92:1)+bu*.25,.124+bu*.6+bust*.5,.118+bu*.2],
    [.86,.205*sh,.132+bu*.2+bust,.124],[.93,.212*sh,.124+bust*.4,.122],[.972,.18*sh,.102,.104],[1.0,.104,.074,.08],[1.035,.062,.062,.058],[1.075,.056,.058,.055]];
  return T.map(q=>{const y=q[0],k=y>.98?1:W;return {p:[0,y,y>.9?-.004:0],rx:q[1]*k,f:q[2]*(y>.98?1:(1+(W-1)*.6)),b:q[3]*(y>.98?1:(1+(W-1)*.6)),w:mdTorsoW(y),y}})}
// the torso ring at height y (interpolated) — used to place things on the surface
function mdTorsoAt(P,y){const T=P._T||(P._T=mdTorso(P));for(let i=0;i<T.length-1;i++){const a=T[i],b=T[i+1];if(y<=b.y||i==T.length-2){const t=Math.max(0,Math.min(1,(y-a.y)/(b.y-a.y)));
  return {rx:a.rx+(b.rx-a.rx)*t,f:a.f+(b.f-a.f)*t,b:a.b+(b.b-a.b)*t,z:a.p[2]+(b.p[2]-a.p[2])*t}}}return T[0]}
function mdV(a){return new THREE.Vector3(a[1],a[2],a[3])}
// arm rings shoulder → fingertips (s = −1 left, +1 right)
function mdArm(P,s){const bn=s<0?'aL':'aR',Bt=P.bones,A0=mdV(Bt[bn+'0']),A1=mdV(Bt[bn+'1']),A2=mdV(Bt[bn+'2']),W=mdBuildF(P),af=(P.af||1)*(P.sex==1?.88:1)*(1+(W-1)*.7),L=(a,b,t)=>a.clone().lerp(b,t);
  const sh=A0.clone().add(new THREE.Vector3(-s*.035*(2-W),.03,0)),d2=A2.clone().sub(A1).normalize(),hand=A2.clone().add(d2.clone().multiplyScalar(.05)),tip=A2.clone().add(d2.clone().multiplyScalar(.1));
  const xo=s*((W-1)*.12+(P.armX||0)),X=v=>{v.x+=xo;return v};
  const r=(p,rx,w,part,f,b)=>({p:p.toArray(),rx:rx*af,f:(f||rx)*af,b:(b||rx)*af,w,part});
  return [r(X(sh.clone()),.064,[['chest',.5],[bn+'0',.5]],'up'),r(X(A0.clone().add(new THREE.Vector3(0,-.02,0))),.067,[[bn+'0',1]],'up'),r(X(L(A0,A1,.5)),.062,[[bn+'0',1]],'up'),
    r(X(A1.clone()),.056,[[bn+'0',.5],[bn+'1',.5]],'el'),r(X(L(A1,A2,.45)),.054,[[bn+'1',1]],'fore'),r(X(L(A1,A2,.88)),.047,[[bn+'1',.6],[bn+'2',.4]],'wrist'),
    r(X(A2.clone().add(new THREE.Vector3(0,0,.006))),.05,[[bn+'2',1]],'hand',.054,.04),r(X(hand.add(new THREE.Vector3(0,0,.014))),.046,[[bn+'2',1]],'hand',.05,.03),r(X(tip.add(new THREE.Vector3(0,0,.02))),.026,[[bn+'2',1]],'hand',.03,.02)]}
// leg rings hip → ankle, foot rings heel → toe
function mdLeg(P,s){const l=s<0?'lh':'rh',Bt=P.bones,H0=mdV(Bt[l+'0']),K=mdV(Bt[l+'1']),A=mdV(Bt[l+'2']),lf=(P.lf||1)*(1+(mdBuildF(P)-1)*.5),fh=P.sex==1?1.04:1,L=(a,b,t)=>a.clone().lerp(b,t);
  const r=(p,rx,w,part,f,b)=>({p:p.toArray(),rx:rx*lf,f:(f||rx)*lf,b:(b||rx)*lf,w,part});
  return [r(H0.clone().add(new THREE.Vector3(-s*.005,.02,0)),.09*fh,[['pelvis',.5],[l+'0',.5]],'hip'),r(L(H0,K,.3),.086*fh,[[l+'0',1]],'thigh'),r(L(H0,K,.68),.074,[[l+'0',1]],'thigh'),
    r(K.clone(),.066,[[l+'0',.5],[l+'1',.5]],'knee',.068,.064),r(L(K,A,.35),.064,[[l+'1',1]],'shin',.062,.068),r(L(K,A,.75),.056,[[l+'1',1]],'shin'),r(A.clone().add(new THREE.Vector3(0,.01,0)),.054,[[l+'1',.4],[l+'2',.6]],'ankle')]}
function mdFoot(P,s){const l=(s<0?'lh':'rh')+'2',A=mdV(P.bones[l]),x=A.x,lf=(P.lf||1)*(P.sex==1?.9:1);
  const r=(z,y,rx,f,b,part)=>({p:[x,y,A.z+z],rx:rx*lf,f:f*lf,b:b*lf,w:[[l,1]],part});
  return [r(-.06,.05,.05,.03,.045,'heel'),r(-.035,.055,.058,.045,.05,'foot'),r(.035,.05,.06,.04,.045,'foot'),r(.11,.04,.054,.028,.036,'toe'),r(.155,.032,.036,.016,.028,'toe')]}
// head rings (around the head bone); hp = head params {w,jaw,len,top,fwd}
function mdHeadR(P){const h=P.head||{},w=h.w||1,jw=(h.jaw||1)*(P.sex==1?.88:1),fz=h.fwd||0,top=h.top||1,ln=h.len||1;
  const R=(y,rx,f,b,ww,jj)=>({p:[0,y,fz*(y<1.13?1:.5)],rx:rx*w*(jj?jw:1),f:f*(jj?(1+(jw-1)*.6):1)*ln,b:b*w,w:ww||[['head',1]],y});
  return [R(1.02,.056,.06,.054,[['neck',.5],['head',.5]],1),R(1.056,.078,.094,.072,null,1),R(1.09,.09,.108,.09,null,1),R(1.13,.1,.11,.106),R(1.17,.104,.104,.11),
    R(1.21,.097,.088,.104),R(1.24+(top-1)*.03,.074,.06,.08),R(1.262+(top-1)*.05,.034,.026,.04)]}
// front surface of the head at height y (for placing eyes, brows, beards)
function mdHeadZ(P,y){const H=P._H||(P._H=mdHeadR(P));for(let i=0;i<H.length-1;i++){const a=H[i],b=H[i+1];if(y<=b.y){const t=(y-a.y)/(b.y-a.y);return a.p[2]+a.f+(b.p[2]+b.f-a.p[2]-a.f)*t}}return 0}
function mdHeadX(P,y){const H=P._H||(P._H=mdHeadR(P));for(let i=0;i<H.length-1;i++){const a=H[i],b=H[i+1];if(y<=b.y){const t=(y-a.y)/(b.y-a.y);return a.rx+(b.rx-a.rx)*t}}return .05}
// build the whole body: torso + neck, arms + hands, legs, feet (head separately: mdHead)
function mdBody(B,P){const C=P.col,T=mdTorso(P);P._T=T;
  // torso: lower part (hips/pants), belt band, upper (shirt), neck skin
  const tp=P.paint.torso,belt=P.beltY==null?.6:P.beltY;
  if(!P.noTorso)mdLoft(B,T,{seg:12,capA:true,sq:P.sq||0,col:m=>m.y>1.0?C.neck:m.y>.985&&!P.highNeck?C.neck:Math.abs(m.y-belt)<.026&&C.belt!=null?C.belt:m.y<belt?(P.paint.torsoLo?P.paint.torsoLo(m):C.torsoLo==C.torso&&m.y<.5?C.pants:C.torsoLo):tp?tp(m):C.torso});
  [-1,1].forEach(s=>{
    mdLoft(B,mdArm(P,s),{seg:7,capB:true,col:m=>{const p=m.r.part;return p=='hand'?(P.paint.hand?P.paint.hand(m,s):C.hand):p=='up'||(p=='el'&&m.i<3.5)?(P.paint.sleeve?P.paint.sleeve(m,s):C.sleeve):(P.paint.fore?P.paint.fore(m,s):C.fore)}});
    mdLoft(B,mdLeg(P,s),{seg:8,col:m=>{const p=m.r.part;return (P.paint.leg?P.paint.leg(m,s):null)||(p=='shin'||p=='ankle'||(p=='knee'&&m.i>3.5)?C.shin:C.pants)}});
    mdLoft(B,mdFoot(P,s),{seg:7,ref:[0,1,0],capA:true,capB:true,col:m=>m.y<.022?C.sole:C.boot})})}

// =====================================================================================================
// heads, faces, hair (the hero look)
