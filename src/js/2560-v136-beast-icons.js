// ================= v136: item pictures of armour show it on its class's animal =================
// Helms, chest pieces and boots are fitted to the animal of the class that wears them (hoods to the ears, robes round the
// raven's legs, footwraps round the cat's toes), and the cloth is measured round the body. The item picture (mdItemKit, used
// by the inventory icons and the gear lying on the ground) is built the same way: the animal's body is built first, the item
// is built over it, then the body's triangles are dropped, so the picture is exactly the piece the hero wears.
function mdItemRace(it){try{const t=itT(it);if(!t||!['helm','chest','boots'].includes(t.sl))return 0;const cls=t.cls||(t.arm&&ARMC[t.arm]?ARMC[t.arm][0]:null),r=cls?BR_CLS[cls]:0;return r&&BRD[r]?r:0}catch(e){return 0}}
{const f=mdItemKit;mdItemKit=function(k,it){const r=mdItemRace(it),d=r?mdGD(it):null;if(!d)return f.apply(this,arguments);
  const D=BRD[r],L={skin:D.fur[0],eye:D.eye[0],build:1,height:1,race:r,hairStyle:5,face:0,sex:0},o={on:BR.on,R:BR.R,C:BR.C,feet:BR.feet,P:BR.P,mask:BR.mask};
  MD_ORN++;BR.on=true;BR.R=D;BR.C=D.cols(L);BR.feet=false;BR.mask=!!(d.sl=='helm'&&BR_MASK[d.st]);
  try{const B=mdB(HB),P=mdP({look:mdLookN(L,D.cls),sex:0,build:1,col:{skin:BR.C.FUR}});if(d.sl=='chest')mdChestPre(P,d);if(d.sl=='boots')mdBootsPre(P,d);
    P._T=mdTorso(P);mdBody(B,P);mdHead(B,P,{});const n0={};for(const t in B.L)n0[t]=B.L[t].p.length;
    if(d.sl=='chest')mdChest(B,P,d,D.cls);else if(d.sl=='helm')mdHelm(B,P,d);else mdBoots(B,P,d);
    const oy=d.sl=='helm'?-1.15:d.sl=='chest'?-.8:0;
    for(const t in B.L){const Lb=B.L[t],s0=n0[t]||0;if(Lb.p.length<=s0)continue;const by=new Map();
      for(let i=s0;i<Lb.p.length;i+=9){const key=Math.round(Lb.c[i]*255)<<16|Math.round(Lb.c[i+1]*255)<<8|Math.round(Lb.c[i+2]*255);let a=by.get(key);if(!a){a=[];by.set(key,a)}
        for(let j=0;j<9;j+=3)a.push(Lb.p[i+j],Lb.p[i+j+1]+oy,Lb.p[i+j+2])}
      by.forEach((a,col)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));g.computeVertexNormals();k.p('',g,t=='m'?'m':t=='g'?'g':'c',col,0,0,0,1,1,1)})}
    if(d.sl=='boots'){k.P=k.P.map(p=>{const g=p.geo,pa=g.attributes.position,a=[];for(let i=0;i<pa.count;i+=3){const x=(pa.getX(i)+pa.getX(i+1)+pa.getX(i+2))/3;if(x>0)for(let j=0;j<3;j++)a.push(pa.getX(i+j)-.1,pa.getY(i+j),pa.getZ(i+j))}
      if(!a.length)return null;const ng=new THREE.BufferGeometry();ng.setAttribute('position',new THREE.Float32BufferAttribute(a,3));ng.computeVertexNormals();return Object.assign({},p,{geo:ng})}).filter(Boolean)}
    return true}
  catch(e){console.warn('v136 item picture',e);return f.apply(this,arguments)}
  finally{Object.assign(BR,o);MD_ORN--}}}
