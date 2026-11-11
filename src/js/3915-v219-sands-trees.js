// ================= v219: Searing Sands' trees in one piece (owner, Nov 10 2026) =================
// Owner: "The trees in searing sands are broken and have floating pieces."
// The sands' trees (the world's '#' tiles, built in 0070: BIOMES 'Searing Sands' tree ['cactus','cactus','spire']) are instanced
// parts placed one by one. Two of them came apart:
//  * the cactus: its arm was a short upright stub stood beside the trunk (each part sits at its own offset, turned about its own
//    middle), with nothing joining it to the trunk. The arm now grows out of the trunk: a low elbow reaches from the trunk's axis
//    out to the stub (TR218.cb), and every arm keeps the side its offset puts it on (its turn about the vertical is dropped; the
//    trunk is round, so nothing else changes);
//  * the spire: its glowing tip was placed and tilted on its own, so on a leaning spire it hung beside the apex. The tip now sits on
//    each spire's own apex, leaning with it.
// The same world on every screen (placement is seeded): nothing to relay.
var TR218={on:true,n:{cactus:0,spire:0},err:null};
function tr218Each(geo,fn){(typeof VIL!='undefined'?VIL:[]).forEach(v=>{if(v.geo===geo)fn(v)})}
function tr218Set(v,i,m){m.toArray(v.M,i*16);const c=v.cm&&v.cm[i];if(c){m.toArray(c.instanceMatrix.array,v.cl[i]*16);c.instanceMatrix.needsUpdate=true}}
function tr218Fix(){if(typeof TT=='undefined'||!TT.cactus||!TT.spire)return;const G=THREE,{fin,tr,merge}=NK,m4=new G.Matrix4(),p=new G.Vector3(),q=new G.Quaternion(),s=new G.Vector3(),e=new G.Euler();
  // the cactus arm: the old stub (r .065-.07, .5 tall, centred), an elbow from the trunk's axis (x -.2 in the arm's own units) and a knuckle
  const CB=TT.cactus[1][0],paint=(h,ny,r)=>{const v=(.72+.4*h)*(.86+.24*r);return [v,v*1.03,v*.92]};
  const up=fin(new G.CylinderGeometry(.065,.07,.5,6,2),{j:.02,sd:18,paint}),el=fin(tr(new G.CylinderGeometry(.06,.068,.26,6,1),-.11,-.2,0,0,0,Math.PI/2),{j:.01,sd:21,paint}),
    kn=fin(tr(new G.SphereGeometry(.072,6,4),-.005,-.205,0,0,0,0),{j:.008,sd:22,paint}),A=merge([up,el,kn]);
  ['position','normal','color'].forEach(k=>{if(A.attributes[k])CB.setAttribute(k,A.attributes[k])});CB.setIndex(A.index||null);CB.computeBoundingSphere();CB.computeBoundingBox();
  tr218Each(CB,v=>{for(let i=0;i<v.n;i++){m4.fromArray(v.M,i*16);m4.decompose(p,q,s);if(s.x===0)continue;e.setFromQuaternion(q,'XYZ');e.y=0;q.setFromEuler(e);m4.compose(p,q,s);tr218Set(v,i,m4);TR218.n.cactus++}});
  // the spire's tip: on the apex of its own spire (the spire is a cone 1.8 tall, centred; the tip a cone .5 tall, centred: the tip's
  // middle goes .7 above the spire's middle, along the spire's own axis)
  const SP=TT.spire[0][0],SG=TT.spire[1][0];let vs=null,vg=null;tr218Each(SP,v=>vs=v);tr218Each(SG,v=>vg=v);
  if(vs&&vg&&vs.n===vg.n){const pg=new G.Vector3(),qg=new G.Quaternion(),sg=new G.Vector3(),off=new G.Vector3();
    for(let i=0;i<vs.n;i++){m4.fromArray(vs.M,i*16);m4.decompose(p,q,s);if(s.x===0)continue;const mg=new G.Matrix4().fromArray(vg.M,i*16);mg.decompose(pg,qg,sg);
      off.set(0,.7*s.y,0).applyQuaternion(q);mg.compose(p.clone().add(off),q,sg);tr218Set(vg,i,mg);TR218.n.spire++}}}
try{if(TR218.on)tr218Fix()}catch(err){TR218.err=String(err);console.warn('v219 sands trees',err)}
