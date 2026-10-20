// ================= v36: Dungeons — instanced room-by-room crawls with a warden and a treasure chest =================
const DUNS=[
 {n:'Hollowroot Burrow',z:1,lv:[5,9],tx:134,ty:260,col:0x8ac060,flo:0x4a4234,wal:0x5a4e3c},
 {n:'Sunken Crypt',z:2,lv:[13,19],tx:287,ty:287,col:0x7ab8e8,flo:0x3c4248,wal:0x4c545c},
 {n:'Ember Forge Depths',z:3,lv:[23,29],tx:427,ty:231,col:0xff7a3a,flo:0x3a2a26,wal:0x4a302a},
 {n:'Ossuary of Kings',z:4,lv:[33,39],tx:574,ty:231,col:0xd8d0b8,flo:0x48443c,wal:0x5c564a},
 {n:'Stormspire Vault',z:5,lv:[43,49],tx:700,ty:224,col:0x9ad8ff,flo:0x34384a,wal:0x44485e}
];
// put each entrance on the nearest open, walkable tile
// dungeons were retired in v56; their entrance spots still keep camps and secrets away at load
DUNS.forEach(D=>{let best=null,bd=1e9;for(let r=0;r<30&&!best;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const x=D.tx+dx,y=D.ty+dy;if(x<3||y<3||x>W-4||y>H-4)continue;const t=MAP[y][x];
  if(!'.ga'.includes(t)||townAt(x,y,4)>=0||BOSSES.some(b=>Math.hypot(b.x-x,b.y-y)<20*DK))continue;let ok=true;for(let q=-1;q<=1;q++)for(let w=-1;w<=1;w++){const u=MAP[y+q]&&MAP[y+q][x+w];if(!u||'#~rRWB'.includes(u))ok=false}if(!ok)continue;const d=Math.hypot(dx,dy);if(d<bd){bd=d;best=[x,y]}}
  D.x=best?best[0]:D.tx;D.y=best?best[1]:D.ty;
});
// ---------- instance geometry (reused between runs) ----------
const DLT=[0,1,2,3].map(()=>{const l=new THREE.PointLight(0xffa050,0,9);scene.add(l);return l});
function solid(x,z){return solid_old(x,z)||(typeof CBLK!='undefined'&&CBLK.size>0&&CBLK.has(Math.round(z)*W+Math.round(x)))}
// world map + mini map support
function mini(){
  mini_base();{const w=mmC.width,h=mmC.height,vw=64,vh=48,cx=Math.max(vw/2,Math.min(W-vw/2,pl.position.x)),cy=Math.max(vh/2,Math.min(H-vh/2,pl.position.z));if(typeof miniMarks=='function')miniMarks(w,h,vw,vh,cx,cy);miniArrow((pl.position.x-(cx-vw/2)+.5)*w/vw,(pl.position.z-(cy-vh/2)+.5)*h/vh)}return;
}
// ================= v36: Bounty boards — every town's notice board hands out hunts, supply runs and challenges =================

