// ================= v114: beast races — one engine for every class's animal form =================
// hero.look.race: 0 human (default, every old save) · 1 rat (Warrior) · 2 cat (Assassin) · 3 frog (Mage) · 4 badger
// (Paladin) · 5 weasel (Ranger). Each class has exactly one animal; other values are dropped for that class (`lkFull`).
// The v112 rat (1990-v112-rat-race.js) is replaced by this engine; the rat itself is rebuilt here with a proper skull.
// Every beast uses the hero skeleton retargeted in place (rest pose moved to the beast's proportions + a hunch, tail
// bones appended, re-bound), so every animation, grip, mount pose, ability pose and worn item keeps working:
//  * body: the human torso / arm / leg / foot rings scaled per ring (same count, heights and parts), so every armour
//    shell — built from those rings — takes the beast's shape; the v99 proportion preset of the race + a forward shear.
//  * head: one skull+muzzle loft per race (`SN` rings back→front) plus ears, eyes, nose, jaw, whiskers of its own.
//  * paws: a flat palm grown out of the hand rings, fingers (count, length, claws, pads, webbing per race); bare feet
//    get toes. Equipped boots fit because they are lofted over the race's own foot rings.
//  * tail: part of the skinned body mesh along a chain of tail bones (tl0…), swaying with movement (none for the frog).
//  * helmets: `brHelm` builds every helm style of the game over the race's skull (ear openings where the ears are,
//    eye slits at the eyes, hoods, hats, circlets, masks), so each class's gear has its own animal version.
//  * a crouch (hips flexed, knees bent, feet flat) layered on every animation except riding; the frog squats deep.
// Look fields reused: skin = fur / hide colour, eye = eye colour. Hair, face and body sex are ignored.
var BR={on:false,R:null,C:null,bare:false,feet:false,P:null};
var BRD={};                                                   // race id -> definition (2110)
var BR_CLS={warrior:1,assassin:2,mage:3,paladin:4,ranger:5};  // the one animal of each class
function brOf(cls){return BRD[BR_CLS[cls]]||null}
// since v114 every hero is its class's animal (there is no human option; old human saves become animals)
function brRace(L,cls){const r=BR_CLS[cls];return r&&BRD[r]?r:0}
// ---------------- registration: bone tables and proportion plans ----------------
function brDef(id,D){D.id=id;BRD[id]=D;
  // tail bones: one per tail ring but the last two (the tip rides the last bone)
  const TP=D.TP||[],nb=Math.max(0,TP.length-2);D.TB=[];for(let i=0;i<nb;i++)D.TB.push('tl'+i);
  D.HBX=Object.assign({},HB);D.TB.forEach((n,i)=>{const p=TP[i];D.HBX[n]=[i?D.TB[i-1]:'pelvis',p[0],p[1],p[2]]});
  return D}
// the rest pose of a race: v99 preset + forward shear of spine / chest / neck (the hunch) + crouch angles
function brPlan(D){if(D._pl)return D._pl;const S=AW_PROP99,pn='br'+D.id;S.PRE[pn]=D.pre;
  S.plans.delete(D.HBX);const pl=S.plan(D.HBX,pn),SH=D.shear||{};
  for(const n in SH)pl.M[n][7]=SH[n];
  const mul=(M,x,y,z)=>[M[0]*x+M[1]*y+M[2]*z,M[3]*x+M[4]*y+M[5]*z,M[6]*x+M[7]*y+M[8]*z],a=pl.abs;
  pl.names.forEach(n=>{const p=D.HBX[n][0];if(!p||!pl.N[p]){for(let j=0;j<3;j++)pl.N[n][j]=a[n][j];return}
    const o=mul(pl.M[p],a[n][0]-a[p][0],a[n][1]-a[p][1],a[n][2]-a[p][2]);for(let j=0;j<3;j++)pl.N[n][j]=pl.N[p][j]+o[j]});
  let lift=0;['lh2','rh2'].forEach(f=>{const o=mul(pl.M[f],0,-a[f][1],0);lift=Math.max(lift,-(pl.N[f][1]+o[1]))});
  pl.names.forEach(n=>{pl.N[n][1]+=lift});pl.lift=lift;pl.hip=pl.N.pelvis[1];
  const V=THREE.Vector3,Lt=new V(...pl.N.lh1).distanceTo(new V(...pl.N.lh0)),Ls=new V(...pl.N.lh2).distanceTo(new V(...pl.N.lh1)),A=D.crouch[0],K=D.crouch[1];
  pl.crouch={a:-A,k:K,an:-(K-A),drop:Lt*(1-Math.cos(A))+Ls*(1-Math.cos(K-A))};
  return D._pl=pl}
// move a hero model's skeleton to a race's rest pose (or back to the human) and re-bind its body to it
function brRig(h,race){
  const b=h&&h.bones,body=huBody(h);if(!b||!body||!body.skeleton)return;
  const D=race?BRD[race]:null,S=AW_PROP99,T=D?D.HBX:HB,pl=D?brPlan(D):(S.on?S.plan(HB,'real'):null);
  // drop the previous race's tail bones, add this one's
  Object.keys(b).filter(n=>/^tl\d+$/.test(n)&&!(T[n])).forEach(n=>{const bn=b[n];if(bn.parent)bn.parent.remove(bn);delete b[n]});
  if(D)D.TB.forEach(n=>{if(b[n])return;const bn=new THREE.Bone();b[n]=bn;b[T[n][0]].add(bn)});
  const names=Object.keys(T),arr=names.map(n=>b[n]);
  names.forEach(n=>{const P=pl?pl.N[n]:[T[n][1],T[n][2],T[n][3]],par=T[n][0],Q=par?(pl?pl.N[par]:[T[par][1],T[par][2],T[par][3]]):[0,0,0];b[n].position.set(P[0]-Q[0],P[1]-Q[1],P[2]-Q[2])});
  b.pelvis.userData.y0=b.pelvis.position.y-(D?pl.crouch.drop:0);
  const q=arr.map(x=>x.quaternion.clone());arr.forEach(x=>x.quaternion.identity());
  body.bind(new THREE.Skeleton(arr));
  arr.forEach((x,i)=>x.quaternion.copy(q[i]));h._race=race|0;h._brCr=null}
// ---------------- body rings: the human rings scaled per ring ----------------
// D.TR = [rx[12], f[12], b[12]] multipliers over the human torso rings; D.armK / D.legK thickness per ring; D.foot = {len, w, h}
{const f=mdTorso;mdTorso=function(P){const R=f.apply(this,arguments);if(!BR.on)return R;const K=BR.R.TR;
  return R.map((r,i)=>Object.assign({},r,{rx:r.rx*K[0][i],f:r.f*K[1][i],b:r.b*K[2][i]}))}}
// arms: thinner / thicker per ring; the hand rings (6–8) become a flat palm (thin across, wide front to back)
{const f=mdArm;mdArm=function(P,s){const R=f.apply(this,arguments);if(!BR.on)return R;const D=BR.R,K=D.armK,pw=D.paw,bn=s<0?'aL':'aR',A1=mdV(P.bones[bn+'1']),A2=mdV(P.bones[bn+'2']),d=A2.clone().sub(A1).normalize();
  const xo=s*((mdBuildF(P)-1)*.12+(P.armX||0)),at=(t,dz)=>A2.clone().add(d.clone().multiplyScalar(t)).add(new THREE.Vector3(xo,0,dz)).toArray(),pw2=pw.palm||1,pl=pw.plen||1;
  return R.map((r,i)=>{const o=Object.assign({},r);
    if(i<6){o.rx=r.rx*K[i];o.f=r.f*K[i];o.b=r.b*K[i]}
    // the first ring stays inside the torso (as on the human), so the arm needs no cap and no fur shows above a sleeve
    if(i==0){o.rx*=.94;o.f*=.94;o.b*=.94}
    if(i==6){o.p=at(.002,.002);o.rx=.022*pw2;o.f=.022*pw2;o.b=.02*pw2}
    if(i==7){o.p=at(.02*pl,.004);o.rx=.0095;o.f=.02*pw2;o.b=.017*pw2}
    if(i==8){o.p=at(.036*pl,.005);o.rx=.0075;o.f=.019*pw2;o.b=.016*pw2}
    return o})}}
{const f=mdLeg;mdLeg=function(P,s){const R=f.apply(this,arguments);if(!BR.on)return R;const K=BR.R.legK;
  return R.map((r,i)=>Object.assign({},r,{rx:r.rx*K[i],f:r.f*K[i]*(i<3?1.06:1),b:r.b*K[i]*(i<3?1.1:1)}))}}
// feet: the human foot rings stretched (len), widened (w), flattened (h); the rings keep their parts (heel, foot, toe)
{const f=mdFoot;mdFoot=function(P,s){const R=f.apply(this,arguments);if(!BR.on)return R;const F=BR.R.foot,A=mdV(P.bones[(s<0?'lh':'rh')+'2']);
  return R.map((r,i)=>Object.assign({},r,{p:[r.p[0],.02+(r.p[1]-.02)*F.h,A.z+(r.p[2]-A.z)*F.len],rx:r.rx*F.w,f:r.f*F.h,b:r.b*F.w}))}}
// ---------------- skull helpers (D.SN = rings back → front: [z, y centre, half-width, top, underside]) ----------------
function brSkullAt(D,z){const S=D.SN;let i=0;while(i<S.length-2&&S[i+1][0]<z)i++;const a=S[i],b=S[i+1],t=Math.max(0,Math.min(1,(z-a[0])/(b[0]-a[0]))),L=(u,v)=>u+(v-u)*t;
  return {yc:L(a[1],b[1]),rx:L(a[2],b[2]),f:L(a[3],b[3]),b:L(a[4],b[4]),slope:(b[2]-a[2])/(b[0]-a[0]),top:L(a[1]+a[3],b[1]+b[3])}}
function brSurfX(D,z,y){const q=brSkullAt(D,z),dy=y-q.yc,r=dy>0?q.f:q.b;return q.rx*Math.sqrt(Math.max(0,1-(dy/r)**2))}
// the skull loft itself (neck ring into the skull, then the rings); col(m) paints it
function brSkull(B,D,col,o){o=o||{};const hw=[['head',1]],S=D.SN,n0=S[0];
  if(!o.noNeck)mdLoft(B,[{p:[0,1.03,-.012],rx:.068,f:.067,b:.065,w:[['neck',.7],['head',.3]]},{p:[0,1.07,-.016],rx:.07,f:.068,b:.067,w:[['neck',.3],['head',.7]]},{p:[0,1.105,-.02],rx:.07,f:.066,b:.07,w:hw}],
    {seg:12,col:m=>m.s>.45?BR.C.BELLY:BR.C.FUR});
  mdLoft(B,S.map(q=>({p:[0,q[1],q[0]],rx:q[2],f:q[3],b:q[4],w:hw})),{seg:o.seg||14,ref:[0,1,0],capA:true,capB:o.capB||{dz:.006},col})}
// eyes on the skull surface: dark socket, glossy eye, coloured iris, highlight (fw: how much the eyes face forward)
function brEyes(k,D,o){const C=BR.C,[ex0,ey,ez]=D.EYEP,sz=o.sz||1,fw=o.fw==null?1:o.fw;
  const al=o.al||1,tl=o.tilt||0;
  [-1,1].forEach(s=>{const ex=brSurfX(D,ez,ey)-.004,ry=s*Math.atan2(1,-brSkullAt(D,ez).slope)*fw,rz=s*tl;
    const ins=(o.inset||0);
    k.p('head','sph2','c',o.socket||mdSh(C.FURD,.8),s*(ex-.002-ins),ey,ez,.021*sz,.017*sz,.02*sz*al,0,ry,rz);
    k.p('head','sph2','c',o.white||0x070606,s*(ex+.003-ins),ey,ez+.001,.0165*sz,.0145*sz,.016*sz*al,0,ry,rz);
    k.p('head',o.slit?'box':'sph2',o.glow?'g':'c',C.EYE,s*(ex+(o.slit?.0175:o.pupil?.015:.012)-ins),ey+(o.slit?.005:0),ez+(o.slit?.006:.004),o.slit?.004:.0095*sz,o.slit?.004:.0095*sz,o.slit?.003:.0075*sz*al,0,ry,rz);
    if(o.pupil)k.p('head','box','c',0x060404,s*(ex+.023-ins),ey,ez+.005,o.pupil[0],o.pupil[1],.002,0,ry,rz);
    k.p('head','box','c',0xe8e4dc,s*(ex+.016-ins),ey+.007,ez+.002,.0025,.0025,.002,0,ry,rz);
    if(o.brow!==false)k.p('head','sph2','c',o.brow||C.FURD,s*(ex-.002-ins),ey+(o.browY||.017)*sz,ez-.002,.024*sz,.008,.02*sz*al,0,ry,s*-.25+rz)})}
// whiskers from the whisker pads at z, y: n per side
function brWhiskers(k,D,z,y,n,len,col){[-1,1].forEach(s=>{const wx=brSurfX(D,z,y);
  for(let i=0;i<n;i++)k.L('head','c',col||0x2a2420,[s*(wx-.003),y+i*.005-.004,z-i*.006],[s*(wx+len*.55-i*.008),y+(i-1)*.022*len/.12,z-.04*len/.12-i*.025],.0015,.0005,3)})}
// nose: rhinarium with two nostrils at the muzzle tip
function brNose(k,D,col,sz,dy){const tip=D.SN[D.SN.length-1],z=tip[0],y=tip[1]+(dy||0);sz=sz||1;
  k.p('head','sph2','c',col,0,y+.004,z+.011*sz,.0145*sz,.012*sz,.012*sz);[-1,1].forEach(s=>k.p('head','box','c',0x2a1818,s*.0058*sz,y+.001,z+.021*sz,.004*sz,.003*sz,.003*sz));
  k.p('head','box','c',mdSh(col,.75),0,y-.009*sz,z+.008*sz,.0025,.01*sz,.003)}
// lower jaw: a small loft under the muzzle from z0 to z1 (chin at the front), the mouth line along its upper edge
function brJaw(B,D,z0,z1,col,o){o=o||{};const R=[],n=4,hw=[['head',1]];
  for(let i=0;i<=n;i++){const z=z0+(z1-z0)*i/n,q=brSkullAt(D,z),w=q.rx*(.92-.22*i/n)*(o.w||1),y=q.yc-q.b*.55;R.push({p:[0,y+(o.dy||0),z],rx:w,f:q.b*.5*(o.h||1),b:q.b*.42*(o.h||1),w:hw})}
  mdLoft(B,R,{seg:10,ref:[0,1,0],capB:true,col:m=>m.s>.5?BR.C.MOUTH:col||BR.C.BELLY})}
// ---------------- paws: flat palm with fingers (D.paw = {n, len[], rad, claw, web, pad, spread, thumb}) ----------------
function brPaws(B){const C=BR.C,D=BR.R,pw=D.paw,V=THREE.Vector3,k=dkKit(),P=BR.P||{},pc=pw.colOf?pw.colOf(C):C.PINK,padC=pw.padColOf?pw.padColOf(C):C.PINK;
  [['aL1','aL2',-1],['aR1','aR2',1]].forEach(([a,b,s])=>{const A=mdV(HB[a]),W=mdV(HB[b]),d=W.clone().sub(A).normalize(),z=new V(0,0,1),e=z.clone().sub(d.clone().multiplyScalar(z.dot(d))).normalize(),
      sd=new V().crossVectors(d,e).multiplyScalar(s),bw=[[b,1]],xo=s*((mdBuildF(P)-1)*.12+(P.armX||0)),pl=pw.plen||1,at=(t,o,l)=>W.clone().add(d.clone().multiplyScalar(t)).add(e.clone().multiplyScalar(o)).add(sd.clone().multiplyScalar(l||0)).add(new V(xo,0,.005));
    const n=pw.n,mids=[];
    for(let i=0;i<n;i++){const o=(i-(n-1)/2)*(pw.spread||.0112)*(pw.palm||1),len=pw.len[i],sp=(i-(n-1)/2)*.05,R=[];let p=at(.028*pl,o),dir=d.clone().add(e.clone().multiplyScalar(sp)).normalize();
      const rr=pw.rad||1,rad=[.0062*rr,.0056*rr,.0047*rr,.0036*rr,.0024*rr],seg=[0,.012,.012,.008,.006],curl=pw.curl==null?1:pw.curl;
      for(let j=0;j<5;j++){if(j){const st=len*seg[j]/.038;p=p.clone().add(dir.clone().multiplyScalar(st));dir=dir.clone().add(sd.clone().multiplyScalar((.16+.1*j)*curl)).normalize()}
        R.push({p:p.toArray(),rx:rad[j],f:rad[j],b:rad[j],w:bw});if(j==2)mids.push({p:p.clone(),d:dir.clone()})}
      mdLoft(B,R,{seg:6,capB:true,col:m=>m.i>3.6&&pw.pad?padC:pc});
      const t=new V(...R[4].p);
      if(pw.pad)k.p(b,'sph2','c',padC,t.x,t.y,t.z,rad[4]*1.3,rad[4]*1.1,rad[4]*1.3);
      if(pw.claw)k.L(b,'c',C.CLAW,t.clone().sub(dir.clone().multiplyScalar(.003)).toArray(),t.clone().add(dir.clone().add(sd.clone().multiplyScalar(.6)).normalize().multiplyScalar(pw.claw)).toArray(),.0032,.0004,4)}
    // webbing: a thin skin between neighbouring fingers from the palm to mid-finger
    if(pw.web)for(let i=0;i+1<n;i++){const m0=mids[i],m1=mids[i+1],r0=at(.03*pl,(i-(n-1)/2)*(pw.spread||.0112)*(pw.palm||1)),r1=at(.03*pl,(i+1-(n-1)/2)*(pw.spread||.0112)*(pw.palm||1));
      const c0=r0.clone().lerp(r1,.5),c1=m0.p.clone().lerp(m1.p,.5),half=r1.clone().sub(r0).length()/2,half1=m1.p.clone().sub(m0.p).length()/2;
      mdLoft(B,[{p:c0.toArray(),rx:half,f:.0018,b:.0018,w:bw},{p:c1.toArray(),rx:half1,f:.0014,b:.0014,w:bw}],{seg:4,ref:[sd.x,sd.y,sd.z],col:pw.webCol||mdSh(pc,.9)})}
    // thumb nub on the front edge of the palm
    if(pw.thumb!==false){const tp=at(.012*pl,.017*(pw.palm||1)),td=d.clone().multiplyScalar(.45).add(e.clone().multiplyScalar(.85)).add(sd.clone().multiplyScalar(.25)).normalize(),tl=pw.tlen||.017;
      mdLoft(B,[{p:tp.toArray(),rx:.0068,f:.0068,b:.0068,w:bw},{p:tp.clone().add(td.clone().multiplyScalar(tl*.6)).toArray(),rx:.0058,f:.0058,b:.0058,w:bw},{p:tp.clone().add(td.clone().multiplyScalar(tl)).toArray(),rx:.0038,f:.0038,b:.0038,w:bw}],{seg:6,capB:true,col:pc});
      const tt=tp.clone().add(td.clone().multiplyScalar(tl));if(pw.claw)k.L(b,'c',C.CLAW,tt.toArray(),tt.clone().add(td.clone().multiplyScalar(pw.claw*.8)).toArray(),.003,.0004,4)}});
  mdKit(B,k)}
function brToeC(D,C){return D.toes.colOf?D.toes.colOf(C):C.PINK}
// rounded shoulder joints (the arm loft is open at the top); half on the chest, half on the upper arm
// sized from the arm's own first ring, so any sleeve or pauldron built from that ring covers it
function brShoulders(B){return;const k=dkKit(),P=BR.P||mdP({});['aL0','aR0'].forEach((bn,i)=>{const s=i?1:-1,r0=mdArm(P,s)[0],r=Math.min(r0.rx,r0.f,r0.b)*.97;
  k.p(bn,'sph2','c',BR.C.FUR,r0.p[0],r0.p[1],r0.p[2],r,r*.92,r);k.P[k.P.length-1].w=r0.w});mdKit(B,k)}
// the ears as ellipsoids (D.earE = right ear [x,y,z, rx,ry,rz, ax,ay,az]; the left one mirrored): helmets cut their openings
// from these and fit their rims round the ear base
var BR_EM=null;
function brEarIn(D,x,y,z,grow){const E=D.earE;if(!E)return false;const g=grow||[1.25,1.2,3];
  for(const s of [-1,1]){const M=BR_EM||(BR_EM={e:new THREE.Euler(),q:new THREE.Quaternion(),v:new THREE.Vector3()});M.e.set(E[6],s*E[7],s*E[8]);M.q.setFromEuler(M.e).invert();
    M.v.set(x-s*E[0],y-E[1],z-E[2]).applyQuaternion(M.q);const a=M.v.x/(E[3]*g[0]),b=M.v.y/(E[4]*g[1]),c=M.v.z/(E[5]*g[2]);if(a*a+b*b+c*c<1)return true}return false}
function brEarRimK(D,k,col,t,o){const E=D.earE;if(!E)return;o=o||{};[-1,1].forEach(s=>{const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(E[6],s*E[7],s*E[8])),
    d=new THREE.Vector3(0,-E[4]*(o.at||.62),0).applyQuaternion(q),e=new THREE.Euler().setFromQuaternion(q);
  k.p('head','ring',t||'m',col,s*E[0]+d.x,E[1]+d.y,E[2]+d.z,E[3]*(o.w||1.3),o.h||.07,E[5]*(o.d||3.4),e.x,e.y,e.z)})}
// bare feet: toes (D.toes = {n, len, claw, web, dew, col}) grown from the toe ring of the race's foot
function brToes(B,P){const C=BR.C,D=BR.R,T=D.toes,k=dkKit(),tc=T.colOf?T.colOf(C):C.PINK,tpc=T.padColOf?T.padColOf(C):tc;[-1,1].forEach(s=>{const l=(s<0?'lh':'rh')+'2',A=mdV(P.bones[l]),lf=P.lf||1,F=D.foot;
    const n=T.n,z0=A.z+.16*lf*F.len,pts=[];
    for(let i=0;i<n;i++){const o=(i-(n-1)/2)*.02*lf*F.w*(T.spread||1),x=A.x+o,ln=T.len*(1-.18*Math.abs(i-(n-1)/2)/((n-1)/2||1))*lf,dx=o*.45,a=[x,.018,z0],b=[x+dx,.012,z0+ln],c=[x+dx*1.2,.004,z0+ln+(T.claw||.018)*lf];
      k.L(l,'c',tc,a,b,.011*lf*(T.w||1),.008*lf*(T.w||1),5);if(T.pad)k.p(l,'sph2','c',tpc,b[0],b[1]-.003,b[2],.012*lf,.008*lf,.012*lf);
      if(T.claw)k.L(l,'c',C.CLAW,b,c,.006*lf,.0008,4);pts.push([a,b])}
    if(T.web)for(let i=0;i+1<n;i++){const a=pts[i],b=pts[i+1],m=j=>[(a[j][0]+b[j][0])/2,a[j][1]-.004,(a[j][2]+b[j][2])/2],h=j=>Math.abs(b[j][0]-a[j][0])/2;
      mdLoft(B,[{p:m(0),rx:h(0),f:.0015,b:.0015,w:[[l,1]]},{p:[m(1)[0],.009,m(1)[2]-.004],rx:h(1),f:.0012,b:.0012,w:[[l,1]]}],{seg:4,ref:[0,1,0],col:T.webCol||mdSh(tc,.9)})}
    if(T.dew!==false)k.L(l,'c',tc,[A.x-s*.033*lf,.03,A.z+.03*F.len],[A.x-s*.048*lf,.016,A.z+.07*F.len],.009*lf,.006*lf,4)});
  mdKit(B,k)}
// tail: part of the body mesh, each ring weighted between the tail bones on either side of it
function brTail(B){const D=BR.R,TP=D.TP;if(!TP||!TP.length)return;const last=D.TB.length-1;
  mdLoft(B,TP.map((t,i)=>{const w=i==0?[['pelvis',.6],['tl0',.4]]:i>last?[['tl'+last,1]]:[['tl'+(i-1),.4],['tl'+i,.6]];return {p:[t[0],t[1],t[2]],rx:t[3],f:t[3],b:t[3],w}}),
    {seg:8,capB:true,col:m=>D.tailCol(m,BR.C)})}
// ---------------- the beast's model build ----------------
{const f=mdHead;mdHead=function(B,P,o){return BR.on?BR.R.head(B,P,o||{}):f.apply(this,arguments)}}
{const f=mdHelm;mdHelm=function(B,P,d){return BR.on?brHelm(B,P,d):f.apply(this,arguments)}}
// equipped boots go on; the outfit's default boots don't (beasts go barefoot)
{const f=mdBoots;mdBoots=function(B,P,d){if(BR.on&&BR.feet&&!d.key){brToes(B,P);return}return f.apply(this,arguments)}}
// the beast's body is built on the hero bones + tail bones, warped by the race's proportions
{const f=mdB;mdB=function(bones){if(BR.on&&bones===HB){const D=BR.R;brPlan(D);const B=f.call(this,D.HBX);B.kqPre='br'+D.id;B.kqDone=0;return B}return f.apply(this,arguments)}}
{const f=mdBody;mdBody=function(B,P){if(BR.on){BR.P=P;const C=BR.C,D=BR.R,c=P.col;if(c.hand==null||mdC(c.hand)==C.FUR)c.hand=D.handCol?D.handCol(C):C.PINK;
    if(BR.feet){c.boot=brToeC(D,C);c.sole=mdSh(c.boot,.8);const pl=P.paint.leg;P.paint.leg=(m,s)=>m.r.part=='ankle'&&m.i>5.5?mdMix(c.shin,c.boot,.5):pl?pl(m,s):null}}
  return f.apply(this,arguments)}}
// base model only (fur body, no outfit): the inspection renders use it through BR.bare
function brBareB(L){const C=BR.C,D=BR.R,B=mdB(HB),P=mdP({look:L,sex:0,build:1,col:{skin:C.FUR,torso:C.FUR,torsoLo:C.FUR,sleeve:C.FUR,fore:C.FUR,hand:D.handCol?D.handCol(C):C.PINK,pants:C.FUR,shin:C.FUR,neck:C.FUR,belt:null,boot:brToeC(D,C),sole:mdSh(brToeC(D,C),.8)}});
  P.paint.torso=m=>m.s>.45&&m.y>.5?C.BELLY:m.s<-.6&&m.y>.8?C.FURD:C.FUR;P.paint.torsoLo=m=>m.s>.5&&m.y>.47?C.BELLY:C.FUR;
  P.paint.leg=(m,s)=>m.r.part=='ankle'&&m.i>5.5?mdMix(C.FUR,brToeC(D,C),.5):m.s>.5&&m.r.part=='thigh'?mdMix(C.FUR,C.BELLY,.4):C.FUR;
  P.paint.fore=m=>m.r.part=='wrist'?mdMix(C.FUR,P.col.hand,.3):C.FUR;P.col.neck=C.BELLY;
  if(D.paint)D.paint(P,C);
  P._T=mdTorso(P);mdBody(B,P);brShoulders(B);mdHead(B,P,{});brToes(B,P);brPaws(B);brTail(B);return B}
{const f=mdHeroB;mdHeroB=function(cls,L,E){const r=brRace(L,cls);if(!r)return f.apply(this,arguments);
  const o={on:BR.on,R:BR.R,C:BR.C,feet:BR.feet,P:BR.P},D=BRD[r];BR.on=true;BR.R=D;BR.C=D.cols(L);BR.feet=!(E&&E.boots&&mdGD(E.boots));
  try{const L2=Object.assign({},L,{hairStyle:5,face:0,sex:0});if(BR.bare)return brBareB(L2);
    const B=f.call(this,cls,L2,E);brShoulders(B);brPaws(B);brTail(B);return B}
  finally{Object.assign(BR,o)}}}
// ---------------- looks: the race field ----------------
{const f=mdLookN;mdLookN=function(L,cls){const r=f.apply(this,arguments);r.race=brRace(L,cls);return r}}
{const f=mdLookKey;mdLookKey=function(L){return f.apply(this,arguments)+(L&&L.race?'.r'+L.race:'')}}
// every hero model is (re)built here: retarget its skeleton when its race changes
{const f=mdHeroApply;mdHeroApply=function(h,cls,E){try{const c=CLS[cls]?cls:'warrior',L=mdLookOf(h,c),r=brRace(L,c);if((h._race|0)!==r)brRig(h,r)}catch(e){console.error('beast rig',e)}
  return f.apply(this,arguments)}}
// crouch, posture and tail: layered on every animation (the offsets are taken off before and put back after each frame).
// D.pose = standing posture, D.run = what is added at full run: {sp, ch, nk, hd} pitch of spine / chest / neck / head (+ = forward),
// {shx, shz, el} shoulder pitch / spread and elbow bend (skipped while an attack or ability pose plays)
var BR_V=null;
var BR_PB=[['spine','sp','x'],['chest','ch','x'],['neck','nk','x'],['head','hd','x'],['aL0','shx','x'],['aR0','shx','x'],['aL0','shz','z'],['aR0','shz','z'],['aL1','el','x'],['aR1','el','x']];
function brPoseOff(D,w,arm){const P=D.pose||{},R=D.run||{},o={};
  BR_PB.forEach(([bn,k,ax])=>{let v=(P[k]||0)+(R[k]||0)*w;if(!v)return;if(bn[0]=='a'){v*=arm;if(!v)return;if(ax=='z')v*=bn=='aL0'?1:-1}o[bn+'.'+ax]=(o[bn+'.'+ax]||0)+v});return o}
// exact undo: every offset this layer adds is recorded as [bone, axis, value before, value written]; next frame, a bone that
// still holds the written value gets back the exact value it had before (bit for bit), so the v93 idle layer, which checks
// `value === what it wrote` to remove its own breathing / glances, never sees a rounding change and never stacks them
function brAddR(H,bn,ax,v){const b=H.bones[bn];if(!b||!v)return;const R=b.rotation,pre=R[ax];R[ax]=pre+v;(H._brU||(H._brU=[])).push([R,ax,pre,R[ax]])}
function brUndo(H){const U=H._brU;if(!U||!U.length)return;for(let i=U.length-1;i>=0;i--){const u=U[i];if(u[0][u[1]]===u[3])u[0][u[1]]=u[2]}U.length=0}
{const f=animHero;animHero=function(now,mv,h){const H=h||pl,b=H&&H.bones,D=H&&H._race?BRD[H._race]:null,rat=D&&b;
  if(H)brUndo(H);
  const rid=H===pl&&typeof riding!='undefined'&&!!riding,R=rat?brPlan(D).crouch:null;
  const r=f.apply(this,arguments);
  if(rat){const w=H.mvW||0;
    if(!rid){[['lh0',R.a],['rh0',R.a],['lh1',R.k],['rh1',R.k],['lh2',R.an],['rh2',R.an]].forEach(q=>brAddR(H,q[0],'x',q[1]));
      // the arm hold eases out when an attack / ability pose starts and back in when it ends (no snap at the transition);
      // the posture follows a low-passed gait blend, so uneven frame times can never make the lean flicker
      const atk=H===pl?!!(typeof HA!='undefined'&&HA.cur):!!H.sw,S=H._brS||(H._brS={a:atk?0:1,w,t:now||0}),dt=Math.min(.1,Math.max(0,((now||0)-S.t)/1000));S.t=now||0;
      S.a+=((atk?0:1)-S.a)*Math.min(1,dt*(atk?14:5));const arm=S.a<.001?0:S.a*S.a*(3-2*S.a);
      S.w+=(w-S.w)*(1-Math.exp(-dt/.2));
      const o=brPoseOff(D,S.w,arm);for(const k in o){const [bn,ax]=k.split('.');brAddR(H,bn,ax,o[k])}
      // head levelling: measure how far the chest frame pitches forward and turn the neck and head back by that much, so
      // the eyes look ahead (a small natural tilt at idle, level when running); the idle glances / nods and the attack
      // head motions ride on top unchanged; eases off while an attack pose plays
      if(arm>0&&b.chest&&b.head&&b.neck){const V=BR_V||(BR_V={v:new THREE.Vector3(),q:new THREE.Quaternion()});b.chest.updateWorldMatrix(true,false);b.chest.getWorldQuaternion(V.q);
        V.v.set(0,0,1).applyQuaternion(V.q);const down=Math.asin(Math.max(-1,Math.min(1,-V.v.y))),L=D.look||[.08,0],tg=L[0]+(L[1]-L[0])*S.w;
        const dl=Math.max(-.9,Math.min(.9,(tg-down)*arm));brAddR(H,'neck','x',dl*.4);brAddR(H,'head','x',dl*.6)}}
    const t=(now||0)/1000,ts=D.tailSway||[.06,.1,1.6,3.2],amp=ts[0]+ts[1]*w,sp=ts[2]+ts[3]*w,n=D.TB.length;
    for(let i=0;i<n;i++){const bn=b[D.TB[i]];if(!bn)continue;bn.rotation.y=amp*Math.sin(t*sp-i*.55)*(.4+i*.12*(11/Math.max(n,1)));bn.rotation.x=(.015+.02*w)*Math.sin(t*sp*2-i*.5)}}
  return r}}
// a model changing race (or back to human) drops the offsets of the old one
{const f=brRig;brRig=function(h){if(h)brUndo(h);if(h)h._brS=null;return f.apply(this,arguments)}}
