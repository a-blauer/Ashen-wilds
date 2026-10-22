// ================= v124: clean map edges =================
// Before v124 the rim band round every zone instance's walkable ground (tiles '#' and 'R', 0..2.6 tiles past the edge) was
// drawn as one choppable tree per '#' tile (0060/0070) and three randomly tilted boulders per 'R' tile, so the trees stood
// inside the boulders. Now:
//   * rim tiles stay what they were (solid, same minimap), but draw nothing of their own: v124Rim(x,y) makes 0060 skip the
//     tree and 0070 skip the boulders there. The Citadel (void rim + castle walls) is unchanged.
//   * v124Edge (called at the end of wdDeco in 1680) lines the edge with the instance's theme: a tidy row of low, seated
//     ledge stones on one contour (d ~ .55), turned along the edge, and behind them, on the slope, a spaced row of themed
//     decorations (big background trees, stalagmites, crystals, cacti, pillars ...) that never touch the stones, each other
//     or the zone's own bank decorations. None of them can be chopped (they are decorations, not '#' nodes).
//   * v124Groves (called at the end of the 0045 map build) keeps wood in the game: small groves of choppable trees ('#'
//     tiles + a 'tree' prop) inside the walkable ground of every field instance, off the road, camps, gateway and entrance.
// Everything is seeded per instance, so co-op partners build the same world.
function v124Rim(x,y){const I=insAt(x,y);return !!I&&I.z!==5&&MAP.DW[y*W+x]>=0}
// the wall starts rising this many tiles later (0045 heights), so the edge's tree line stands on a low shelf at the foot of the
// wall instead of up its face; caves, canyons, cliffs and the Citadel keep their walls as they were
function v124Shelf(I){if(I.z===5)return 0;const t=I.fld&&I.k&&typeof TH112!='undefined'&&TH112&&TH112.byG[I.g];if(!t)return 1.7;const k=t.sh.k;return k=='cave'||k=='canyon'||k=='cliff'||k=='keep'?0:1.7}
function v124R(s){let sd=(Math.abs(Math.floor(s))%2147483646)+1;return ()=>(sd=sd*16807%2147483647)/2147483647}
// ---------- choppable groves (inside the field instances) ----------
function v124Groves(m){const DW=m.DW,props=m.props,walk=t=>t=='.'||t=='g'||t=='a';let n=0;
  INSL.forEach(I=>{if(!I.fld||I.z===5)return;const rnd=v124R(123000+I.g*104729),P=I.path,e1=P[16]||I.en,th=typeof TH112!='undefined'&&TH112&&TH112.byG[I.g],cave=!!th&&th.sh.k=='cave',RD=cave?5.6:8.5,ED=cave?2.6:5;
    const away=(x,y)=>Math.hypot(x-I.ba[0],y-I.ba[1])>PM_GTR+7&&Math.hypot(x-I.en[0],y-I.en[1])>15&&Math.hypot(x-e1[0],y-e1[1])>15&&I.cl.every(c=>Math.hypot(x-c[0],y-c[1])>22)
      &&!(I.wa&&Math.hypot(x-I.wa[0],y-I.wa[1])<24)&&P.every((q,i)=>i%3||Math.hypot(q[0]-x,q[1]-y)>RD)&&I.br.every(l=>l.every(q=>Math.hypot(q[0]-x,q[1]-y)>RD-1.5));
    const want=Math.round(I.w*I.h/58000*9);let got=0;const cen=[];
    for(let tr=0;tr<want*60&&got<want;tr++){const x=I.x0+4+Math.floor(rnd()*(I.w-8)),y=I.y0+4+Math.floor(rnd()*(I.h-8));
      if(!walk(m[y][x])||DW[y*W+x]>-ED||insAt(x,y)!==I||!away(x,y)||cen.some(c=>Math.hypot(c[0]-x,c[1]-y)<(cave?16:26)))continue;
      const k=3+Math.floor(rnd()*4);let put=0;
      for(let t=0;t<40&&put<k;t++){const a=rnd()*6.283,d=t?1.4+rnd()*2.4:0,cx=Math.round(x+Math.cos(a)*d),cy=Math.round(y+Math.sin(a)*d);
        if(!walk(m[cy][cx])||DW[cy*W+cx]>1-ED||insAt(cx,cy)!==I||!away(cx,cy))continue;
        // keep one free tile round each trunk, so a grove can be walked through and every tree reached
        let ok=true;for(let j=-1;j<=1&&ok;j++)for(let i=-1;i<=1;i++)if((i||j)&&m[cy+j][cx+i]=='#'){ok=false;break}if(!ok)continue;
        m[cy][cx]='#';props.push([cx,cy,'tree']);put++;n++}
      if(put){cen.push([x,y]);got++}}});
  m.v124g=n}
// ---------- the edge line ----------
function v124Edge(c,out){try{const T0=performance.now(),{T,def,F,M,cyl,dod,cone,ico,deadTree}=c,DW=MAP.DW,ZG=(z,k)=>insG(z,k);
  // shapes: a low ledge stone (three rounded lumps along x) and a taller standing stone; big background trees
  const ledge=(hex,top)=>M([F(dod(1),hex,{j:.16,top,tt:.6,lo:.62,hi:.42},0,.42,0,0,.3,0,[1.15,.62,.78]),
    F(dod(1),hex,{j:.14,top,tt:.6,lo:.62,hi:.42},.95,.3,.12,0,1.1,.12,[.72,.46,.62]),F(dod(1),hex,{j:.14,top,tt:.6,lo:.62,hi:.42},-.9,.28,-.1,0,2.2,-.1,[.7,.44,.6])]);
  const stand=(hex,top)=>M([F(dod(1),hex,{j:.13,top,tt:.6,lo:.6,hi:.45},0,.62,0,0,.4,0,[1.15,.9,.95]),F(dod(1),hex,{j:.12,top,tt:.6,lo:.62,hi:.42},1.05,.25,.25,0,2.4,0,[.62,.4,.55]),
    F(dod(1),hex,{j:.12,top,tt:.6,lo:.62,hi:.42},-1.05,.22,-.15,0,.9,0,[.55,.36,.5])]);
  const oak=(bark,l1,l2)=>M([F(cyl(.16,.32,2.6,7),bark,{j:.04,lo:.6,hi:.4,f:(x,y,z)=>y<-1.2?[x*1.4,y,z*1.4]:[x,y,z]},0,1.3,0),F(cyl(.06,.11,1.1,5),bark,{j:.02},.35,2.3,0,0,0,-.9),F(cyl(.05,.1,1,5),bark,{j:.02},-.3,2.4,.15,.3,0,.9),
    F(ico(1.35,1),l1,{j:.3,lo:.6,hi:.5},0,3.3,0,0,0,0,[1,.78,1]),F(ico(1.05,1),l2,{j:.25,lo:.65,hi:.5},.75,3.85,.3,0,0,0,[1,.8,1]),F(ico(.95,1),l2,{j:.22,lo:.65,hi:.5},-.7,3.7,-.35,0,0,0,[1,.8,1]),F(ico(.8,1),l1,{j:.2,lo:.7,hi:.45},.1,4.35,-.1,0,0,0,[1,.8,1])]);
  const pine=(bark,leaf,snow)=>{const p=[F(cyl(.12,.22,1.4,6),bark,{j:.03},0,.7,0)];[[1.35,1.6,1.25],[1.12,1.45,2.15],[.88,1.3,2.95],[.62,1.15,3.65],[.36,.95,4.25]].forEach(([r,h,y],i)=>p.push(F(cone(r,h,8),leaf,{j:.07,top:snow,tt:.35,lo:.55+i*.04,hi:.45},0,y,0,0,i*.6,0)));return M(p)};
  const mk=(k,o)=>{if(!T[k])def(k,o);return k};
  const eOak=(b,l1,l2)=>mk('e_oak_'+b.toString(16)+l1.toString(16),{parts:[oak(b,l1,l2)],cast:true,s:[1,1.35],sway:.012,j:.14});
  const ePine=(b,l,sn)=>mk('e_pine_'+b.toString(16)+l.toString(16)+(sn?'s':''),{parts:[pine(b,l,sn)],cast:true,s:[1,1.45],sway:.015,j:.14});
  // ---- the kits: stone colour + top (moss, snow, sand ...), the back row (kinds with weights), its density and band ----
  const K={},kit=(gs,o)=>gs.forEach(g=>K[g]=o);
  const zone=(z,o)=>kit([ZG(z,0),ZG(z,3),ZG(z,4)],o);
  zone(0,{st:[0x4a473c,0x4e6a2c],bk:[[eOak(0x2e241a,0x23401e,0x2c4a22),3],[ePine(0x2a2018,0x1c3424),2],['k_tree',1]],bd:.92});
  zone(1,{st:[0x8a8478,0x6a8a42],bk:[[eOak(0x3a2b1d,0x2f5a26,0x3a6a2c),3],[ePine(0x3a2a1e,0x244d34),3]],bd:.92});
  zone(2,{st:[0x7c808a,0xf0f4fa],bk:[[ePine(0x3a2a1e,0x2a5a58,0xf4f8ff),3],['b_crystal',1]],bd:.7});
  zone(3,{st:[0xc08850,0xe2b67a],bk:[['s_cactus',2],['s_pillar',1]],bd:.35});
  zone(4,{st:[0x5a5e64,0x3e4a40],bk:[['d_tree',3],['d_cross',1]],bd:.7});
  kit([ZG(0,1)],{st:[0x3c4a42,0x2c6a4c],bk:[['k2_stalag',3],['k2_gshroom',1]],bd:.55,bw:[1.3,2.3]});
  kit([ZG(0,2)],{st:[0x4a4234,0x4a4a2a],bk:[['k3_tree',3],['k3_snag',1],[ePine(0x2a2018,0x2a3220),1]],bd:.9});
  kit([ZG(1,1)],{st:[0x7a8072,0x4e7a48],bk:[[eOak(0x4a3a2a,0x2f6a44,0x3e7a52),3],[ePine(0x3a2a1e,0x2a5a3a),2]],bd:.88});
  kit([ZG(1,2)],{st:[0x9a8e70,0x8a9a52],bk:[['h3_pine',1]],bd:.45});
  kit([ZG(2,1)],{st:[0x6a7e96,0xcfe6ff],bk:[['b2_stalag',3],['b2_bigcrys',1]],bd:.55,bw:[1.3,2.3]});
  kit([ZG(2,2)],{st:[0x8a90a0,0xf4f8ff],bk:[['b_pine',2],['b3_spire',1]],bd:.5});
  kit([ZG(3,1)],{st:[0xa85a38,0xc88a5a],bk:[['s2_pillar',1],['s_cactus',1]],bd:.3,bw:[1.3,2.3]});
  kit([ZG(3,2)],{st:[0xd8d0bc,0xf4f0e6],bk:[['s3_palm',1],['s3_salt',2]],bd:.35});
  kit([ZG(4,1)],{st:[0x464c54,0x2e5a50],bk:[['d2_col',1],['k2_stalag',1]],bd:.35,bw:[1.3,2.3]});
  kit([ZG(4,2)],{st:[0x7e7a6a,0x9a967e],bk:[['d_tree',2],['d3_spikes',1]],bd:.55});
  // occupancy grid (2-tile cells) of everything already standing out of reach, so nothing new overlaps it
  const occ=new Map(),ck=(x,z)=>(Math.floor(z/2)*4096+Math.floor(x/2)),addO=(x,z,r,sn)=>{const k=ck(x,z);(occ.get(k)||occ.set(k,[]).get(k)).push([x,z,r,sn])},
    clear=(x,z,r,rs)=>{for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const L=occ.get(ck(x+i*2,z+j*2));if(L)for(const q of L)if(Math.hypot(q[0]-x,q[1]-z)<(q[3]&&rs!=null?q[2]*.6+rs:q[2]+r))return false}return true};
  // the zones' own boulders on the bank: drop the ones on a sheer face (they hung in the air off the wall)
  for(let i=out.length-1;i>=0;i--){const d=out[i];if(!/boulder|_rock$/.test(d.k)||DW[Math.round(d.z)*W+Math.round(d.x)]<0)continue;
    const a=[GH(d.x+1,d.z),GH(d.x-1,d.z),GH(d.x,d.z+1),GH(d.x,d.z-1)];if(Math.max(...a)-Math.min(...a)>2.6)out.splice(i,1)}
  out.forEach(d=>{if(DW[Math.round(d.z)*W+Math.round(d.x)]>=0)addO(d.x,d.z,.9*(d.s||1))});
  const st={stones:0,back:0,ms:0};
  INSL.forEach(I=>{const kt=K[I.g];if(!kt||I.z===5)return;const rnd=v124R(231000+I.g*7919),ri=(a,b)=>a+rnd()*(b-a);
    const sk='e_st'+I.g,sb='e_sb'+I.g;mk(sk,{parts:[ledge(kt.st[0],kt.st[1])],cast:true,s:[1.15,1.45],y:-.24,j:.16});mk(sb,{parts:[stand(kt.st[0],kt.st[1])],cast:true,s:[1.1,1.35],y:-.26,j:.16});
    const x0=I.x0+1,y0=I.y0+1,x1=I.x0+I.w-1,y1=I.y0+I.h-1,dw=(x,y)=>{x=Math.max(x0,Math.min(x1-1,Math.round(x)));y=Math.max(y0,Math.min(y1-1,Math.round(y)));return DW[y*W+x]};
    const nrm=(x,y)=>{const gx=dw(x+1,y)-dw(x-1,y),gy=dw(x,y+1)-dw(x,y-1),l=Math.hypot(gx,gy)||1;return [gx/l,gy/l]};
    // front row: the ledge stones on one contour line
    const F0=[];for(let y=y0+1;y<y1-1;y++)for(let x=x0+1;x<x1-1;x++){const t=MAP[y][x];if((t=='#'||t=='R')&&DW[y*W+x]>=.1&&DW[y*W+x]<1.3&&insAt(x,y)===I)F0.push(x,y)}
    const ord=[];for(let i=0;i<F0.length;i+=2)ord.push(i);for(let i=ord.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1)),q=ord[i];ord[i]=ord[j];ord[j]=q}
    const SP=[];
    for(const i of ord){const tx=F0[i],ty=F0[i+1],d=DW[ty*W+tx],[nx,ny]=nrm(tx,ty),o=.55-d,x=tx+nx*o+(rnd()-.5)*.2,z=ty+ny*o+(rnd()-.5)*.2;
      const big=rnd()<.15,s=ri(1.15,1.4),k=big?sb:sk;if(!clear(x,z,1.05*s))continue;
      out.push({k,x,z,ry:Math.atan2(-nx,-ny)+(rnd()-.5)*.25,s,col:0});addO(x,z,1.08*s,1);SP.push([x,z]);st.stones++}
    // back row: themed decorations on the slope behind the stones, spaced apart, only where the ground keeps rising
    const bw=kt.bw||[1.3,2.5],tot=kt.bk.reduce((a,q)=>a+(T[q[0]]?q[1]:0),0);if(!tot)return;
    const B0=[];for(let y=y0+1;y<y1-1;y+=1)for(let x=x0+1;x<x1-1;x+=1){const d=DW[y*W+x];if(d>=bw[0]&&d<bw[1]&&insAt(x,y)===I)B0.push(x,y)}
    const bo=[];for(let i=0;i<B0.length;i+=2)bo.push(i);for(let i=bo.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1)),q=bo[i];bo[i]=bo[j];bo[j]=q}
    for(const i of bo){const x=B0[i]+(rnd()-.5)*.8,z=B0[i+1]+(rnd()-.5)*.8,[nx,ny]=nrm(x,z),g=GH(x,z);
      const gu=GH(x+nx*1.2,z+ny*1.2);if(GH(x-nx*1.2,z-ny*1.2)>g+.3||gu<g-.4||gu>g+3.2||g<-.5)continue; // a drop, a hollow or a sheer face: leave it bare
      let u=rnd()*tot,k=null;for(const q of kt.bk){if(!T[q[0]])continue;u-=q[1];if(u<=0){k=q[0];break}}if(!k)continue;
      const S=T[k],s=ri(S.s[0],S.s[1]),r=(/oak/.test(k)?1.25:/pine/.test(k)?1.05:.85)*s;if(!clear(x,z,r,.45*s))continue;
      if(rnd()>kt.bd){addO(x,z,r*.8);continue} // a gap in the row: sparse themes keep more of them
      out.push({k,x,z,ry:rnd()*6.283,s,col:0});addO(x,z,r);st.back++}});
  st.ms=Math.round(performance.now()-T0);window.V124=st}catch(err){console.warn('v124 edges',err)}}
