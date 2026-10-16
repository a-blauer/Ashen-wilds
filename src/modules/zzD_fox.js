// ================= v79: new low-poly fox (Valheim style) =================
// Replaces the Foxlet look (wild foxes, fox companions and every creature that uses the Foxlet rig).
// One chunky, flat-shaded body skinned to the old Foxlet skeleton, so the existing walk/attack animation still drives it.
// Colours are painted per vertex with a little random mottling, like Valheim's hand-painted fur.
var FOXG={},FOXEM={},FOXMT={};
// body rings: [z, y, half width, half height above, half height below, [bone A, bone B, blend], belly line]
// belly line: vertices lower than this (−1 bottom … 1 top) turn cream; 'nose' paints the ring black
var FOX_BODY=[
  [.765,.546,.014,.014,.012,['head','head',0],'nose'],
  [.745,.549,.03,.026,.022,['head','head',0],'nose'],
  [.7,.556,.046,.036,.03,['head','head',0],-.05],
  [.64,.57,.066,.05,.04,['head','head',0],-.05],
  [.58,.59,.1,.068,.055,['head','head',0],.05],
  [.52,.605,.12,.08,.07,['head','head',0],.1],
  [.46,.607,.108,.085,.075,['head','head',0],.05],
  [.41,.58,.088,.08,.08,['neck','head',.5],-.1],
  [.35,.54,.092,.09,.1,['neck','neck',0],-.15],
  [.27,.505,.12,.12,.135,['neck','chest',.6],-.2],
  [.18,.48,.135,.13,.15,['chest','chest',0],-.35],
  [.07,.47,.128,.122,.135,['chest','spine',.5],-.55],
  [-.04,.468,.114,.112,.115,['spine','spine',0],-.6],
  [-.15,.468,.11,.11,.11,['spine','pelvis',.6],-.6],
  [-.26,.47,.122,.118,.118,['pelvis','pelvis',0],-.65],
  [-.34,.462,.095,.095,.09,['pelvis','tail0',.3],-.75],
  [-.39,.455,.048,.048,.048,['tail0','tail0',0],-1]];
// bushy tail: [z, y, radius, bones, cream tip?]
var FOX_TAIL=[
  [-.33,.452,.05,['tail0','tail0',0]],[-.42,.435,.085,['tail0','tail1',.2]],[-.53,.43,.125,['tail0','tail1',.6]],
  [-.65,.44,.15,['tail1','tail1',0]],[-.77,.46,.15,['tail1','tail2',.6]],[-.87,.48,.13,['tail2','tail2',0],1],
  [-.96,.5,.095,['tail2','tail3',.6],1],[-1.04,.515,.045,['tail3','tail3',0],1],[-1.09,.52,.008,['tail3','tail3',0],1]];
// legs: rings [x, y, z, half width, half depth, bones, black sock?]
function foxLegs(s){
  const f=(x,y,z,rx,rz,b,d)=>[s*x,y,z,rx,rz,b,d],F=s<0?'fl':'fr',H=s<0?'hl':'hr';
  return [
    [f(.095,.48,.19,.066,.082,['chest',F+'0',.5]),f(.102,.36,.2,.056,.07,[F+'0',F+'0',0]),f(.102,.23,.22,.04,.046,[F+'0',F+'1',.7]),
     f(.102,.15,.212,.033,.036,[F+'1',F+'1',0],1),f(.102,.075,.2,.03,.033,[F+'1',F+'2',.8],1),f(.102,.04,.205,.029,.033,[F+'2',F+'2',0],1)],
    [f(.1,.5,-.24,.08,.115,['pelvis',H+'0',.4]),f(.115,.38,-.23,.074,.1,[H+'0',H+'0',0]),f(.115,.27,-.2,.05,.062,[H+'0',H+'1',.6]),
     f(.112,.2,-.2,.036,.044,[H+'1',H+'1',0]),f(.112,.12,-.248,.031,.035,[H+'1',H+'2',.7],1),f(.112,.045,-.255,.029,.033,[H+'2',H+'2',0],1)]];
}
function foxGeo(C){
  if(FOXG[C])return FOXG[C];
  const O=Object.keys(SPEC.Foxlet.bones),P=[],Cc=[],SI=[],SW=[],IX=[],R=dkRng(77),V=THREE.Vector3;
  const main=new THREE.Color(C).lerp(new THREE.Color(0x5a4636),.18),back=main.clone().multiplyScalar(.68),cream=new THREE.Color(0xd8cbb2),dark=new THREE.Color(0x1c1511),tmp=new THREE.Color();
  // a loft through rings; ref = the direction that counts as "up" on the cross-section
  const loft=(rings,seg,ref,paint,capA,capB)=>{
    const base=P.length/3,pts=rings.map(r=>new V(r.p[0],r.p[1],r.p[2]));
    rings.forEach((r,i)=>{
      const tg=pts[Math.min(i+1,pts.length-1)].clone().sub(pts[Math.max(i-1,0)]).normalize(),U=ref.clone().sub(tg.clone().multiplyScalar(ref.dot(tg))).normalize(),Sd=new V().crossVectors(U,tg);
      for(let k=0;k<seg;k++){
        const a=Math.PI/2+k/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a),ry=s>0?r.ryT:r.ryB;
        P.push(pts[i].x+Sd.x*c*r.rx+U.x*s*ry,pts[i].y+Sd.y*c*r.rx+U.y*s*ry,pts[i].z+Sd.z*c*r.rx+U.z*s*ry);
        paint(tmp,r,s,c);tmp.multiplyScalar(.9+R()*.15);Cc.push(tmp.r,tmp.g,tmp.b);
        SI.push(O.indexOf(r.b[0]),O.indexOf(r.b[1]),0,0);SW.push(1-r.b[2],r.b[2],0,0);
      }
    });
    for(let i=0;i<rings.length-1;i++)for(let k=0;k<seg;k++){const a=base+i*seg+k,a1=base+i*seg+(k+1)%seg,b2=a+seg,b3=a1+seg;IX.push(a,a1,b2,b2,a1,b3)}
    [[capA,0],[capB,rings.length-1]].forEach(q=>{if(!q[0])return;const r=rings[q[1]],ci=P.length/3;P.push(pts[q[1]].x,pts[q[1]].y,pts[q[1]].z);
      const o=base+q[1]*seg;paint(tmp,r,q[1]?1:-1,0);Cc.push(tmp.r,tmp.g,tmp.b);SI.push(O.indexOf(r.b[0]),O.indexOf(r.b[1]),0,0);SW.push(1-r.b[2],r.b[2],0,0);
      for(let k=0;k<seg;k++){const a=o+k,a1=o+(k+1)%seg;if(q[1])IX.push(ci,a,a1);else IX.push(ci,a1,a)}});
  };
  // body + head
  loft(FOX_BODY.map(r=>({p:[0,r[1],r[0]],rx:r[2],ryT:r[3],ryB:r[4],b:r[5],bl:r[6]})),8,new V(0,1,0),(o,r,s)=>{
    if(r.bl=='nose')return o.copy(dark);
    o.copy(main);if(s>.62)o.lerp(back,.75);
    const t=Math.min(1,Math.max(0,(r.bl-s)*3.5));if(t>0)o.lerp(cream,t);
  },true,true);
  // tail
  loft(FOX_TAIL.map(r=>({p:[0,r[1],r[0]],rx:r[2],ryT:r[2]*.9,ryB:r[2],b:r[3],tip:r[4]})),8,new V(0,1,0),(o,r,s)=>{
    o.copy(r.tip?cream:main);if(!r.tip&&s>.5)o.lerp(back,.6);if(!r.tip&&s<-.6)o.lerp(cream,.35)},true,true);
  // legs
  [-1,1].forEach(s=>foxLegs(s).forEach(L=>loft(L.map(r=>({p:[r[0],r[1],r[2]],rx:r[3],ryT:r[4],ryB:r[4],b:r[5],d:r[6]})),6,new V(0,0,1),(o,r,sn)=>{
    o.copy(r.d?dark:main);if(!r.d&&r.p[1]<.3)o.lerp(dark,.35);if(!r.d&&sn>.5&&r.p[2]>0)o.lerp(cream,.4)},false,true)));
  const G=new THREE.BufferGeometry();
  G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));
  G.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4));G.setAttribute('skinWeight',new THREE.Float32BufferAttribute(SW,4));
  G.setIndex(IX);G.computeVertexNormals();G.computeBoundingSphere();return FOXG[C]=G;
}
function foxMat(v,skin){
  const k=(v||'')+(skin?'s':'');if(FOXMT[k])return FOXMT[k];
  return FOXMT[k]=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.95,metalness:0,skinning:!!skin,side:THREE.DoubleSide,
    emissive:v=='Ember'?0x2a0c00:v=='Golden'?0x2a1e00:0})}
// ear: a flat four-sided spike, fur coloured at the base and black at the tip
function foxEarGeo(C,inner){
  const k=C+'|'+(inner?1:0);if(FOXEM[k])return FOXEM[k];
  const g=new THREE.ConeGeometry(1,1,4,2).toNonIndexed();g.rotateY(Math.PI/4);g.translate(0,.5,0);
  const pa=g.attributes.position,col=[],main=new THREE.Color(C).lerp(new THREE.Color(0x5a4636),.18),c=new THREE.Color();
  for(let i=0;i<pa.count;i++){const y=pa.getY(i);if(inner)c.set(0xcdbfa6).multiplyScalar(y>.6?.55:1);else c.copy(main).lerp(new THREE.Color(0x1c1511),Math.min(1,y*1.3));col.push(c.r,c.g,c.b)}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();return FOXEM[k]=g}
// rigid details (eyes, nose, jaw, ruffs, paws, variant/trait extras); all positions in model space
function foxKit(c,C,red){
  const k=dkKit(),cream=0xd8cbb2,dark=0x1c1511,back=dkShade(new THREE.Color(C).lerp(new THREE.Color(0x5a4636),.18).getHex(),.6),eye=red?0xff2a2a:0xf2a21e;
  // face
  k.p('head','box','c',0x0c0908,0,.553,.762,.036,.028,.03);
  k.L('jaw','c',cream,[0,.538,.5],[0,.536,.725],.032,.012,5);
  k.p('jaw','box','c',0x3a0e10,0,.55,.63,.03,.008,.1);
  [-1,1].forEach(s=>{
    k.p('head','box','c',0x0a0706,s*.074,.632,.57,.044,.028,.016,0,s*.6,-s*.18);
    k.p('head','box','g',eye,s*.084,.634,.574,.034,.015,.008,0,s*.6,-s*.22);
    k.p('head','box','c',back,s*.07,.656,.568,.056,.016,.03,0,s*.55,s*.32);
    k.p('head','cone4','c',0xe8e0c8,s*.02,.535,.7,.009,.028,.009,Math.PI);
    // cheek ruff: pointy tufts sweeping back
    k.L('head','c',cream,[s*.095,.57,.52],[s*.17,.535,.43],.04,.004,4);
    k.L('head','c',cream,[s*.09,.59,.48],[s*.155,.565,.39],.032,.004,4);
  });
  // throat ruff
  [-1,0,1].forEach(i=>k.L(i?'neck':'chest','c',cream,[i*.045,.45,.3],[i*.06,.35,.25],.04,.004,4));
  // soft scruff behind the ears
  [-1,0,1].forEach(i=>k.L('neck','c',back,[i*.04,.6,.4],[i*.05,.6,.3],.04,.004,4));
  k.L('tail3','c',cream,[0,.515,-1.05],[0,.52,-1.14],.035,.003,4);
  // paws with claws
  [['fl2',-.1,.215],['fr2',.1,.215],['hl2',-.11,-.24],['hr2',.11,-.24]].forEach(f=>{k.p(f[0],'box','c',dark,f[1],.022,f[2]+.03,.06,.04,.09);
    [-1,0,1].forEach(i=>k.p(f[0],'cone4','c',0x0a0807,f[1]+i*.018,.012,f[2]+.08,.007,.03,.007,Math.PI/2))});
  // variants
  if(c.v=='Ember')[[.42,.66,'head'],[.27,.6,'neck'],[.12,.585,'chest'],[-.02,.57,'spine'],[-.18,.57,'spine'],[-1.04,.58,'tail3']].forEach((q,i)=>k.L(q[2],'g',i%2?0xffb040:0xff6a1a,[0,q[1]-.03,q[0]],[0,q[1]+.07,q[0]-.05],.03,.002,4));
  if(c.v=='Frost')[[.27,.6,'neck'],[.12,.585,'chest'],[-.02,.57,'spine'],[-.18,.57,'spine']].forEach(q=>k.L(q[2],'g',0xd8f6ff,[0,q[1]-.03,q[0]],[0,q[1]+.09,q[0]-.03],.03,.002,4));
  if(c.v=='Golden')k.p('head','ring','g',0xffd84a,0,.77,.46,.1,.12,.1);
  // traits
  if(c.tr=='Horned')[-1,1].forEach(s=>k.L('head','c',0xd8ccb0,[s*.045,.66,.52],[s*.07,.76,.4],.022,.004,5));
  if(c.tr=='Spiked')[[.18,.58,'chest'],[.04,.57,'chest'],[-.1,.57,'spine'],[-.24,.58,'pelvis']].forEach(q=>k.L(q[2],'c',0x2a2a30,[0,q[1]-.02,q[0]],[0,q[1]+.1,q[0]-.05],.035,.003,5));
  if(c.tr=='Armored')[['chest',.16],['spine',-.04],['pelvis',-.22]].forEach(q=>k.p(q[0],'box','m',0x4a4a52,0,.565,q[1],.2,.04,.15));
  if(c.tr=='Universal'){k.p('head','ring','g',0x7cf0ff,0,.82,.46,.13,.1,.13);[0,1,2].forEach(i=>k.p('head','sph','g',[0xff6a9a,0x7cf0ff,0xffe36a][i],Math.cos(i*2.1)*.13,.8,.46+Math.sin(i*2.1)*.13,.018))}
  return k}
function foxRig(c){
  const S=SPEC.Foxlet,g=new THREE.Group(),b=new THREE.Group();g.add(b);g.b=b;g.legs=[];g.wings=[];g.tails=[];
  const mb=mkBones(S),bones=mb.bones,O=Object.keys(S.bones),C=c.cl[0],red=c.v=='Shadow';
  const mesh=new THREE.SkinnedMesh(foxGeo(C),foxMat(c.v,1));
  mesh.castShadow=true;mesh.frustumCulled=false;mesh.add(bones.pelvis);b.add(mesh);mesh.updateMatrixWorld(true);
  const sk=new THREE.Skeleton(mb.arr);mesh.bind(sk);
  const key='FOX|'+C+'|'+(c.v||'')+'|'+(c.tr||'')+'|'+(red?1:0);
  dkBind(mesh,dkBake(DKBK&&DKBK[key]?[]:foxKit(c,C,red).P,O,key));
  const x={g:g,b:b,C:C,bones:bones,spec:S,ears:[],wings:[],red:red};
  // ears pivot at their base so the idle twitch and attack flatten work
  const hb=S.bones.head;
  [-1,1].forEach(s=>{
    const p=new THREE.Group();p.position.set(s*.062-hb[1],.665-hb[2],.47-hb[3]);p.rotation.order='YXZ';
    const e=new THREE.Mesh(foxEarGeo(C),foxMat(c.v));e.scale.set(.06,.16,.026);e.rotation.y=-s*.25;e.castShadow=true;p.add(e);
    const n=new THREE.Mesh(foxEarGeo(C,1),foxMat(c.v));n.scale.set(.6,.68,.5);n.position.set(0,.02,.45);e.add(n);
    p.userData={rz:-s*.3,sd:s};bones.head.add(p);x.ears.push(p);
  });
  // fused companions: overlay the other species' signature parts like the old rig did
  const extra=c.g.slice(1).filter(o=>SPEC[o]&&SPEC[o].sig);
  if(extra.length){
    const parts=[],bax=raw=>(bn,geo,col,px,py,pz,sx,sy,sz,rx,rz,basic)=>{const r=(S.T&&!raw)?S.T([px,py,pz]):[px,py,pz];parts.push({bn:bn,geo:geo,col:col,x:r[0],y:r[1],z:r[2],sx:sx||1,sy:sy||1,sz:sz||1,rx:rx||0,rz:rz||0,basic:basic})};
    Object.assign(x,{ax:bax(),axw:bax(true),axm:mkAx(S,bones),
      tex:(st,hex,pal)=>{const t=rigTex({id:'x'+st,st:st,pal:pal},hex);return new THREE.MeshStandardMaterial({map:t.map,normalMap:t.nm,roughness:.9})},
      wing:(bn,s,span,chord,col,col2,type,px,py,pz)=>{const grp=mkWing(type,span,chord,col,col2);if(s<0)grp.scale.x=-1;const p=new THREE.Group();p.add(grp);
        const r=S.bones[bn];p.position.set(s*px-r[1],py-r[2],pz-r[3]);bones[bn].add(p);x.wings.push({p:p,s:s,base:.35,amp:.55});return p}});
    extra.forEach(o=>{try{SPEC[o].sig(x,c.cl[c.g.indexOf(o)]||C,c)}catch(e){console.error('fox fuse',o,e)}});
    [false,true].forEach(bs=>{const m=bakeMesh(parts,O,'FOXF|'+c.g.join()+'|'+c.cl.join(),bs);if(m){b.add(m);m.updateMatrixWorld(true);m.bind(sk)}});
  }
  if(c.tr=='Bulky')b.scale.set(1.15,1.08,1.08);
  g.rig=(now,mv,sp)=>rigAnim(x,now,mv,sp);
  g.bs=(S.sc||1)*(1+.07*(c.f||0))*(c.z||1);g.scale.setScalar(g.bs);return g;
}
{const f=crRig;crRig=function(c,n){if(n=='Foxlet'&&SPEC.Foxlet){try{return foxRig(c)}catch(e){console.error('fox rig failed',e)}}return f.apply(this,arguments)}}
