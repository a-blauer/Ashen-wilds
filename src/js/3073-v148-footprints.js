// ================= v148: no invisible walls round buildings =================
// A shop or house marked every tile of its whole lot rectangle solid (FP103.shop 5x7, FP103H), but the models are smaller
// than that and most have an open yard in front (a forge, pedestals, stalls), so the hero bumped into thin air there.
// Now a footprint keeps only the tiles where the building itself stands: downward rays at the tile (centre and four points
// round it, at least two of the five) have to meet the building's own model higher than knee height. Tiles of its yard with nothing on them stay
// walkable; props that stand in a yard keep the tiles under them. Done whenever a footprint is marked (shops 1860,
// houses 1870) and once for the buildings already standing when the game (or a save) loads.
var FP148={knee:.35,n:0};
function fp148Group(key){try{if(key.startsWith('h:')){const o=typeof HS103!='undefined'&&HS103.g[+key.slice(2)];return o&&o.g||null}
  return typeof TWN100_S!='undefined'&&TWN100_S.b[key]||null}catch(_){return null}}
function fp148Filter(key,list){const g=fp148Group(key);if(!g||!list||!list.length)return list;
  const V=THREE.Vector3,rc=new THREE.Raycaster(),T=TOWNS[0],base=T&&T.ph!=null?T.ph:0;g.updateMatrixWorld(true);
  const keep=list.filter(t=>{const x=t%W,z=(t/W)|0;
    let n=0;for(const [a,b] of [[0,0],[.3,.3],[-.3,.3],[.3,-.3],[-.3,-.3]]){rc.set(new V(x+a,base+30,z+b),new V(0,-1,0));rc.far=40;
      const h=rc.intersectObject(g,true).find(q=>q.object.visible!==false);if(h&&h.point.y>base+FP148.knee&&++n>=2)return true}
    return false});
  // a model the rays cannot see at all (still loading, hidden): keep the old full footprint rather than none
  return keep.length?keep:list}
{const f=lotMark103;lotMark103=function(key,list){try{if(list&&list.length)list=fp148Filter(key,list)}catch(e){console.warn('v148 footprint',e)}return f.call(this,key,list)}}
function fp148Redo(){try{for(const k in KL103.own){const L=KL103.own[k];if(L&&L.length){const F=fp148Filter(k,L);if(F.length!==L.length){lotMark103(k,F);FP148.n++}}}}catch(e){console.warn('v148 footprints',e)}}
{const f=lotSync103;lotSync103=function(){const r=f.apply(this,arguments);fp148Redo();return r}}
try{fp148Redo()}catch(_){}
