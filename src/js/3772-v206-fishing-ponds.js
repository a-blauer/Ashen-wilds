// ================= v206: fishing only at real water =================
// Owner (Nov 7 2026): "Change fishing to only be available in ponds that are a decent amount of water. There are many 'ponds'
// that are fishable but they don't even show any visible water."
// nearWater (0400) offered F · Fish beside any water tile ('~'), but about 1 in 10 of them sit above the water surface (y .02:
// the shelving banks of v177 / v185 and the camps' own ground raise them), so nothing shows there. Now a tile is fishable only
// when the water over it is at least FP206.dep deep and it belongs to a body of such water of FP206.min tiles or more (counted
// once, 4-way connected, the first time anyone fishes). The spot looked for reaches FP206.r tiles from the hero.
var FP206={dep:.12,min:20,r:3,ok:null};
function fp206Build(){const ok=new Uint8Array(W*H),lab=new Int32Array(W*H),sz=[0],st=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(MAP[y][x]!='~')continue;const b=BIOMES[MAP.bio[y][x]];if(!b||b.lava)continue;if(.02-GHv(x,y)>=FP206.dep)ok[y*W+x]=1}
  for(let k=0;k<W*H;k++){if(!ok[k]||lab[k])continue;const id=sz.length;let n=0;lab[k]=id;st.push(k);
    while(st.length){const q=st.pop();n++;const x=q%W,y=(q/W)|0;
      if(x>0&&ok[q-1]&&!lab[q-1]){lab[q-1]=id;st.push(q-1)}if(x<W-1&&ok[q+1]&&!lab[q+1]){lab[q+1]=id;st.push(q+1)}
      if(y>0&&ok[q-W]&&!lab[q-W]){lab[q-W]=id;st.push(q-W)}if(y<H-1&&ok[q+W]&&!lab[q+W]){lab[q+W]=id;st.push(q+W)}}
    sz.push(n)}
  const F=new Uint8Array(W*H);for(let k=0;k<W*H;k++)if(lab[k]&&sz[lab[k]]>=FP206.min)F[k]=1;FP206.ok=F;return F}
function fp206Ok(x,y){if(x<0||y<0||x>=W||y>=H)return false;const F=FP206.ok||fp206Build();return !!F[y*W+x]}
// the nearest fishable tile within reach of the hero (the hook the cast flies to)
nearWater=(f=>function(){if(!f.apply(this,arguments))return null;   // keeps every rule of the wrappers (raft, the Dirge sanctum …)
  const px=Math.round(pl.position.x),pz=Math.round(pl.position.z),R=FP206.r;let best=null,bd=1e9;
  for(let j=-R;j<=R;j++)for(let i=-R;i<=R;i++){const d=i*i+j*j;if(d>R*R+1||d>=bd)continue;if(fp206Ok(px+i,pz+j)){bd=d;best=[px+i,pz+j]}}
  return best})(nearWater);
