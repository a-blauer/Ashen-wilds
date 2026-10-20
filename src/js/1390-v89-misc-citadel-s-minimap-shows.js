// ================= v89 misc: the Citadel's minimap shows its road like the other zones =================
// Root cause: the map generator (w0_world.js //@@MAP) rims every zone's walkable ground with a 2–3 tile band of trees ('#')
// and rock ('R'), and the minimap/world-map image (mmB) draws that band dark/light, which is what outlines the road,
// branches, camps and arena. The Citadel is a floating castle, so its band is left as void ('') instead — and the mmB
// bake paints void with the zone's ground colour, so the Citadel minimap was one flat colour with no visible route.
// Fix: after the bake, paint the same two-tone rim onto mmB wherever void touches walkable ground inside a zone (only
// the image changes; the tiles stay void). Works from PMAP/regionAt, so it follows any zone size or layout.
var MMRIM=[];
function mmRimPaint(){try{
  const c=mmB.getContext('2d'),walk=t=>t==='.'||t==='a'||t==='g'||t==='p'||t==='r'||t==='~'||t==='P';
  INSL.forEach(I=>{const p=PMAP[I.z],x0=I.x0,y0=I.y0,x1=I.x0+PMW-1,y1=I.y0+PMH-1,bm=BIOMES[p.bi]||BIOMES[0]; // v106: per instance
    const inner=(bm.frs||[30,24,28]).map(v=>Math.round(v*.8)),outer=bm.n=='The Citadel'?[150,100,108]:[96,92,88];
    const L=[];let edge=0;
    // v97: the neighbour test checks the zone rectangle directly instead of calling regionAt() (same result, faster bake)
    for(let y=y0+1;y<y1;y++){const row=MAP[y];if(!row)continue;for(let x=x0+1;x<x1;x++){if(row[x]!=='')continue;
      let d=9;for(let dy=-3;dy<=3&&d>1;dy++){const r2=MAP[y+dy];if(!r2)continue;for(let dx=-3;dx<=3;dx++){if(x+dx<x0||x+dx>x1||y+dy<y0||y+dy>y1||!walk(r2[x+dx]))continue;const q=Math.hypot(dx,dy);if(q<d)d=q}}
      if(d>3.1)continue;L.push(x,y,d);if(d<1.5)edge++}}
    if(edge<200)return;                 // zones whose rim is already trees/rock (all but the Citadel today) are left as they are
    const id=c.getImageData(x0,y0,PMW,PMH);
    for(let i=0;i<L.length;i+=3){const b=L[i+2]<1.6?inner:outer,k=((L[i+1]-y0)*PMW+(L[i]-x0))*4;id.data[k]=b[0];id.data[k+1]=b[1];id.data[k+2]=b[2];id.data[k+3]=255}
    c.putImageData(id,x0,y0);MMRIM.push(I.n)});
}catch(err){console.warn('minimap rim',err)}}
mmRimPaint();

