// ================= Batwing (Batwing, Duskwing): low-poly bat on the v81 toolkit =================
// Also defines lpwWing(), the faceted wing builder shared by the Drakelet and Skyhawk files (hoisted, so order doesn't matter).
// lpwWing: a flat, slightly folded wing for the RIGHT side (+x) in its pivot's space; mirror the left one with scale.x=-1.
//   outline: [[x,y,z]…] around the wing edge (fanned from hub), sticks: [[[x,y,z],[x,y,z],radius]…] bony struts / quills
//   cA = colour at the root, cB = colour at the edge, cS = strut colour, bands = optional stripe count across the span (feathers)
var LPWG={};
function lpwWing(key,outline,hub,sticks,cA,cB,cS,bands){
  if(LPWG[key])return LPWG[key];
  const P=[],C=[],R=dkRng(31),A=new THREE.Color(cA),B=new THREE.Color(cB),S=new THREE.Color(cS),t=new THREE.Color();
  let mx=0;outline.forEach(p=>{mx=Math.max(mx,Math.hypot(p[0],p[2]))});
  const col=(p,sel)=>{if(sel)return t.copy(S).multiplyScalar(.9+R()*.15);const d=Math.min(1,Math.hypot(p[0],p[2])/mx);t.copy(A).lerp(B,d*d);
    if(bands){const b=Math.floor(d*bands);if(b%2)t.multiplyScalar(.8)}return t.multiplyScalar(.9+R()*.14)};
  const tri=(a,b,c,sel)=>[a,b,c].forEach(p=>{P.push(p[0],p[1],p[2]);const k=col(p,sel);C.push(k.r,k.g,k.b)});
  for(let i=0;i<outline.length;i++)tri(hub,outline[i],outline[(i+1)%outline.length]);
  sticks.forEach(s=>{const a=new THREE.Vector3(...s[0]),b=new THREE.Vector3(...s[1]),d=b.clone().sub(a),n=new THREE.Vector3(0,1,0).cross(d).normalize().multiplyScalar(s[2]),u=new THREE.Vector3(0,s[2]*1.2,0);
    const q=[a.clone().add(n),a.clone().sub(n),a.clone().add(u)],e=b.toArray();
    for(let i=0;i<3;i++)tri(q[i].toArray(),q[(i+1)%3].toArray(),e,1)});
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  G.computeVertexNormals();return LPWG[key]=G}
// hang a wing pair on bone bn at model point (x,y,z); sweep = turn back (rad), droop = tilt down (rad)
function lpwPair(x,bn,geo,mat,px,py,pz,sweep,droop,base,amp){
  [-1,1].forEach(s=>{const p=lpPart(x.S,x.bones,bn,geo,mat,s*px,py,pz,s,1,1,0,s*sweep,-s*droop);x.wings.push({p:p,s:s,base:base==null?.35:base,amp:amp==null?.55:amp})})}

// Batwing rings are in model space (stretched fox template: pelvis y .28, head z .38). [z, y, half width, above, below, bones, kind]
var BAT_BODY=[
  [-.42,.31,.012,.012,.012,['tail1','tail1',0],0],
  [-.35,.3,.035,.03,.03,['tail0','tail1',.3],0],
  [-.27,.29,.09,.085,.08,['pelvis','tail0',.2],0],
  [-.18,.295,.135,.125,.13,['pelvis','spine',.4],0],
  [-.06,.3,.155,.145,.155,['spine','spine',0],0],
  [.06,.305,.16,.15,.155,['spine','chest',.5],0],
  [.16,.315,.15,.14,.145,['chest','chest',0],1],
  [.24,.335,.125,.12,.12,['chest','neck',.6],1],
  [.3,.36,.125,.125,.11,['neck','head',.5],1],
  [.36,.4,.135,.13,.105,['head','head',0],0],
  [.42,.405,.125,.115,.095,['head','head',0],0],
  [.47,.392,.082,.072,.065,['head','head',0],0],
  [.5,.384,.05,.045,.04,['head','head',0],2],
  [.515,.38,.03,.026,.024,['head','head',0],2]];
function batLegs(s){const f=(x,y,z,r,b)=>[s*x,y,z,r,r,b];return [
  [f(.07,.24,.15,.04,['chest',s<0?'fl0':'fr0',.4]),f(.075,.15,.17,.025,[s<0?'fl0':'fr0',s<0?'fl1':'fr1',.6]),f(.075,.07,.165,.018,[s<0?'fl1':'fr1',s<0?'fl2':'fr2',.7]),f(.075,.035,.17,.016,[s<0?'fl2':'fr2',s<0?'fl2':'fr2',0])],
  [f(.08,.24,-.19,.05,['pelvis',s<0?'hl0':'hr0',.4]),f(.083,.16,-.16,.03,[s<0?'hl0':'hr0',s<0?'hl1':'hr1',.6]),f(.083,.08,-.2,.02,[s<0?'hl1':'hr1',s<0?'hl2':'hr2',.7]),f(.083,.04,-.21,.018,[s<0?'hl2':'hr2',s<0?'hl2':'hr2',0])]]}
LPR.Batwing={
  head:['head',0,.5,.38],up:.08,sc:1.18,
  back:[['neck',0,.48,.28],['chest',0,.46,.16],['spine',0,.45,.02],['pelvis',0,.42,-.14]],
  geo(C){
    const main=lpMain(C,.12),back=main.clone().multiplyScalar(.62),bel=main.clone().lerp(new THREE.Color(0xa898a8),.45),ruff=main.clone().lerp(new THREE.Color(0xb0a090),.35),nose=new THREE.Color(0x4a2a34),dark=new THREE.Color(0x150f18);
    return lpGeo('Batwing|'+C,'Batwing',[
      {rings:BAT_BODY.map(r=>({p:[0,r[1],r[0]],rx:r[2],ryT:r[3],ryB:r[4],b:r[5],k:r[6],j:r[6]==2?0:.14})),seg:8,capA:1,capB:1,paint:(o,r,s)=>{
        if(r.k==2)return o.copy(nose);o.copy(main);if(s>.55)o.lerp(back,.7);if(s<-.3)o.lerp(bel,.8);if(r.k==1&&s<.6)o.lerp(ruff,.6)}}]
      .concat([].concat(...[-1,1].map(s=>batLegs(s).map(L=>({rings:L.map(r=>({p:[r[0],r[1],r[2]],rx:r[3],ryT:r[4],ryB:r[4],b:r[5]})),seg:5,ref:[0,0,1],capB:1,paint:(o,r)=>{o.copy(r.p[1]<.12?dark:back)}}))))),61);
  },
  kit(k,c,C,red){
    const dark=0x150f18,eye=red?0xff2a2a:0xff3a2a,back=dkShade(lpMain(C,.12).getHex(),.5);
    [-1,1].forEach(s=>{
      k.p('head','box','c',0x070506,s*.073,.43,.465,.05,.034,.02,0,s*.55,-s*.2);
      k.p('head','box','g',eye,s*.08,.432,.471,.036,.018,.008,0,s*.55,-s*.25);
      k.p('head','box','c',back,s*.058,.458,.462,.064,.018,.032,0,s*.5,s*.38);
      k.p('head','cone4','c',0xece4d0,s*.03,.338,.5,.01,.044,.01,Math.PI);
      k.p('jaw','cone4','c',0xece4d0,s*.03,.35,.48,.007,.022,.007);
    });
    // leaf nose and small chin
    k.L('head','c',0x4a2a34,[0,.39,.512],[0,.45,.505],.026,.004,4);
    k.L('jaw','c',dkShade(lpMain(C,.12).getHex(),.7),[0,.35,.39],[0,.355,.48],.04,.02,5);
    k.p('jaw','box','c',0x3a0e14,0,.365,.46,.04,.008,.06);
    // shaggy chest ruff
    [-2,-1,0,1,2].forEach(i=>k.L('chest','c',dkShade(lpMain(C,.12).lerp(new THREE.Color(0xb0a090),.35).getHex(),.9),[i*.045,.26,.27],[i*.055,.17,.22],.04,.004,4));
    // hooked claws on the feet
    [['fl2',-.075,.17],['fr2',.075,.17],['hl2',-.083,-.21],['hr2',.083,-.21]].forEach(f=>[-1,1].forEach(i=>k.p(f[0],'cone4','c',dark,f[1]+i*.012,.02,f[2]+.02,.007,.035,.007,Math.PI*.75)));
  },
  post(x,c,C,mat){
    const main=lpMain(C,.12),mem=main.clone().multiplyScalar(.55).lerp(new THREE.Color(0x3a2a34),.4),edge=main.clone().multiplyScalar(.3);
    // ears: huge, black-tipped
    const og=lpSpikeGeo(main.clone().multiplyScalar(.85),0x120c14,3),ig=lpSpikeGeo(0x6a4452,0x2a1820,3);
    [-1,1].forEach(s=>{const p=lpPart(x.S,x.bones,'head',og,mat,s*.075,.48,.37,.085,.24,.04,-.15,-s*.45,0);
      const n=new THREE.Mesh(ig,mat);n.scale.set(.62,.75,.5);n.position.set(0,.03,.5);p.children[0].add(n);p.userData={rz:-s*.42,sd:s};x.ears.push(p)});
    // membrane wings: arm along the leading edge, four fingers, scalloped trailing edge
    const W=lpwWing('bat|'+C,
      [[0,0,.05],[.22,.05,.08],[.42,.06,.06],[.62,.04,.0],[.86,0,-.08],[.74,-.02,-.24],[.66,0,-.36],[.52,-.03,-.34],[.44,0,-.5],[.3,-.03,-.42],[.2,0,-.5],[.1,-.02,-.36],[0,0,-.28]],
      [.36,.03,-.18],
      [[[0,.01,.05],[.42,.07,.06],.022],[[.42,.07,.06],[.62,.05,0],.016],[[.42,.06,.06],[.86,0,-.08],.012],[[.42,.06,.06],[.66,0,-.36],.012],[[.42,.06,.06],[.44,0,-.5],.012],[[.42,.06,.06],[.2,0,-.5],.01],[[.62,.05,0],[.64,.09,.05],.012]],
      mem,edge,0x1a1218);
    lpwPair(x,'chest',W,mat,.1,.4,.14,.15,.1);
  }};

