// =====================================================================================================
// a mannequin-less build of one item in body space → dkKit parts on k (positions centred later by the icon camera)
function mdItemKit(k,it){const d=mdGD(it);if(!d)return false;const P=mdP({look:mdLookN(null,'warrior')}),B=mdB(HB);P._T=mdTorso(P);P._H=mdHeadR(P);
  if(d.sl=='chest'){mdChestPre(P,d);mdChest(B,P,d)}else if(d.sl=='helm')mdHelm(B,P,d);else if(d.sl=='boots')mdBoots(B,P,d);else if(d.sl=='amulet')mdAmulet(B,P,d);else return false; // rings keep the v89 close-up model (the worn ring is a tiny band + gem on the hand)
  const oy=d.sl=='helm'?-1.15:d.sl=='chest'?-.8:d.sl=='amulet'?-.9:d.sl=='ring'?-.58:0,ox=d.sl=='ring'?-.25:0;
  for(const t in B.L){const L=B.L[t];if(!L.p.length)continue;const by=new Map();
    for(let i=0;i<L.p.length;i+=9){const ci=i;const key=Math.round(L.c[ci]*255)<<16|Math.round(L.c[ci+1]*255)<<8|Math.round(L.c[ci+2]*255);let a=by.get(key);if(!a){a=[];by.set(key,a)}
      for(let j=0;j<9;j+=3)a.push(L.p[i+j]+ox,L.p[i+j+1]+oy,L.p[i+j+2])}
    by.forEach((a,col)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));g.computeVertexNormals();
      // the boots are both feet: keep one for the picture
      k.p('',g,t=='m'?'m':t=='g'?'g':'c',col,0,0,0,1,1,1)})}
  if(d.sl=='boots'){k.P=k.P.map(p=>{const g=p.geo,pa=g.attributes.position,a=[];for(let i=0;i<pa.count;i+=3){const x=(pa.getX(i)+pa.getX(i+1)+pa.getX(i+2))/3;if(x>0)for(let j=0;j<3;j++)a.push(pa.getX(i+j)-.1,pa.getY(i+j),pa.getZ(i+j))}
    if(!a.length)return null;const ng=new THREE.BufferGeometry();ng.setAttribute('position',new THREE.Float32BufferAttribute(a,3));ng.computeVertexNormals();return Object.assign({},p,{geo:ng})}).filter(Boolean)}
  return true}
{const f=v89ArmorKit;v89ArmorKit=function(k,it){try{if(mdItemKit(k,it))return}catch(e){console.warn('item model',e)}return f.apply(this,arguments)}}

