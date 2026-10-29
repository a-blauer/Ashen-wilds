// ================= v165 Searing Sands II · The Courtyard of the Warden: the place =================
// The Sunken Temple's road ends in a great courtyard (it replaces the gateway portal to III; its clearing is widened to a circle
// of radius CY165.R at load: ss165T2Map / ss165T2Terrain from 0045). Local frame ss165F(1): a along f (away from the road), b across.
//  * A floor of sandstone flags with a sun mosaic round a stepped dais in the middle; on it the altar, its top carved with the
//    outline of a six-legged, ant-headed figure (Kheprit, 3281/3282).
//  * A colonnade round the court (lotus columns, architraves; a few fallen), a wall behind it with glyph panels, four obelisks
//    with gold caps, six statues of the Warden's ant-headed kin, braziers, drifts of sand.
//  * Three gates in the wall (pylons with dark doorways): the road's, and one either side. The cultists pour out of them (3283).
//  * At the far end, the rift stones: two great horn-shaped arcs of dark stone curving toward each other like mandibles; the rift
//    opens between them (3283) and stays open as the way to III.
var CY165={R:16.4,g:null,err:0,fires:[],t:0};
// the plan (hoisted, pure: 0045 widens the clearing from it)
function ss165T2(DW){if(ss165T2.c)return ss165T2.c;const F=ss165F(1,DW),R=16.4,y0=null;
  const T={F,R,y0,altar:{a:0,b:0},rift:{a:R-3.6,b:0},kh:{a:R-6.6,b:0},gates:[{a:-R-.2,b:0,ang:Math.PI},{a:-3,b:-R-.2,ang:-Math.PI/2},{a:-3,b:R+.2,ang:Math.PI/2}],col:R-.9};
  // the urns: round the court in front of the colonnade, by the statues and the gates, beside the dais (seeded, never on a gate's way)
  const rn=dkRng(16521),U=[];const ok=(a,b)=>Math.hypot(a,b)<R-1.6&&Math.hypot(a-T.rift.a,b)>4.5&&Math.hypot(a,b)>4.4&&T.gates.every(g=>Math.hypot(a-g.a,b-g.b)>4.2)&&U.every(u=>Math.hypot(u.a-a,u.b-b)>2.6);
  for(let i=0;i<400&&U.length<14;i++){const ang=rn()*Math.PI*2,r=i<220?R-2.4-rn()*1.6:5+rn()*(R-7),a=Math.cos(ang)*r,b=Math.sin(ang)*r;if(ok(a,b))U.push({a,b,ry:rn()*6.28,s:.9+rn()*.25})}
  T.urns=U;
  // which urn holds which part (11 parts; the other three hold scarabs, dust, a cultist's offering of bones)
  const ord=U.map((u,i)=>i);for(let i=ord.length-1;i>0;i--){const j=Math.floor(rn()*(i+1)),q=ord[i];ord[i]=ord[j];ord[j]=q}T.part=U.map(()=>-1);ord.slice(0,11).forEach((ui,p)=>T.part[ui]=p);
  T.ex=ord.slice(11);return ss165T2.c=T}
// 0045: the court is walkable to its rim (after every other map pass, no seeded draws)
function ss165T2Map(m,bio,DW){try{const T=ss165T2(DW),F=T.F;for(let j=Math.floor(F.z-T.R-2);j<=F.z+T.R+2;j++)for(let i=Math.floor(F.x-T.R-2);i<=F.x+T.R+2;i++){const d=Math.hypot(i-F.x,j-F.z);if(d>T.R+.4||!m[j])continue;
    if(insAt(i,j)!==F.I)continue;const t=m[j][i];if(t!=='.'&&t!=='g'&&t!=='a')m[j][i]=d<T.R-3&&(i*7+j*3)%9==0?'a':'.';const k=j*W+i;DW[k]=Math.min(DW[k],d-T.R-.4)}}catch(e){console.warn('v165 court map',e)}}
// 0045: a flat floor (the rim beyond rises as it did)
function ss165T2Terrain(){const T=ss165T2(),F=T.F,HI=(i,j)=>(j+HPD)*HW+i+HPD;if(T.y0==null)T.y0=HF[HI(Math.round(F.x),Math.round(F.z))];for(let j=Math.floor(F.z-T.R-4);j<=F.z+T.R+4;j++)for(let i=Math.floor(F.x-T.R-4);i<=F.x+T.R+4;i++){const d=Math.hypot(i-F.x,j-F.z);if(d>T.R+3)continue;
    const k=HI(i,j),w=smt(T.R+.6,T.R+3,d);HF[k]=T.y0*(1-w)+Math.max(HF[k],T.y0+(d-T.R)*1.2)*w}}
// 1680: decorations stay off the court
function ss165Keep2(g,x,z){if(g!==insG(3,1))return false;const T=ss165T2();return Math.hypot(x-T.F.x,z-T.F.z)<T.R+2.5}
// ---------------- the build (the first time Searing Sands II is visited) ----------------
function cy165Build(){if(CY165.g)return CY165.g;const T=ss165T2(),F=T.F,g=new THREE.Group();g.name='WardenCourt';g.userData.psNo=1;scene.add(g);CY165.g=g;const R=dkRng(16522);
  const sd=[0xc8a070,0xbc9464,0xd2ac7c,0xb08858],sdD=0x8a6a44,gl=0x2a1a0e,gold=0xd8a840,lap=0x2a4a8a,pick=a=>a[Math.floor(R()*a.length)],W2=F.W2,y0=T.y0,yw=F.yaw;
  const rot=(a,b)=>Math.atan2(a*F.fx+b*F.lx,a*F.fz+b*F.lz);   // the world yaw of the local direction (a, b)
  g.add(dt168Group('CY165|floor',q=>{dt168Up(q);// the flags: a grid laid along f, the sun mosaic round the dais
    for(let a=-T.R;a<=T.R;a+=1.6)for(let b=-T.R;b<=T.R;b+=1.6){const r=Math.hypot(a,b);if(r>T.R-.4||r<4.6)continue;const [x,z]=W2(a+(R()-.5)*.06,b+(R()-.5)*.06),c=R()<.12?sdD:pick(sd);
      q.p('','box','c',c,x,y0+.02,z,1.54,.1,1.54,0,yw+(R()-.5)*.03,0)}
    for(let k=0;k<3;k++){const rr=[4.4,3.6,2.9][k],n=[36,30,24][k];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,[x,z]=W2(Math.cos(a)*rr,Math.sin(a)*rr);q.p('','box','c',k==1?(i%2?gold:lap):(i%3?sd[2]:sdD),x,y0+.04,z,.72,.1,.6,0,rot(Math.cos(a),Math.sin(a)),0)}}
    // sun rays in the mosaic
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2+.13;for(let s=0;s<4;s++){const rr=5.2+s*1.6,[x,z]=W2(Math.cos(a)*rr,Math.sin(a)*rr);q.p('','box','c',i%2?gold:0xc89a40,x,y0+.075,z,.32,.04,1.1,0,rot(Math.cos(a),Math.sin(a)),0)}}},CY168W,.05));
  // the dais and the altar
  g.add(dt168Group('CY165|altar',q=>{dt168Up(q);const [ax,az]=W2(T.altar.a,T.altar.b);[[6.8,.3],[5.6,.6],[4.4,.9]].forEach(([w,h],k)=>q.p('','box','c',k==1?sd[1]:sd[0],ax,y0+h-.15,az,w,.3,w,0,yw,0).p('','box','c',sdD,ax,y0+h+.005,az,w+.04,.02,w+.04,0,yw,0));
    q.p('','box','c',sd[2],ax,y0+1.35,az,1.9,.9,3.8,0,yw,0).p('','box','c',sdD,ax,y0+1.82,az,2.1,.12,4.0,0,yw,0);
    // the carved figure on the slab: a dark inlay outline (head, thorax, abdomen, six legs, two arms) lying with its head toward the rift
    const fig=(aa,bb,w,l,ang)=>{const [x,z]=W2(T.altar.a+aa,T.altar.b+bb);q.p('','box','c',gl,x,y0+1.89,z,w,.02,l,0,yw+ang,0)};
    fig(1.35,0,.42,.5,0);fig(.6,0,.6,.9,0);fig(-.55,0,.75,1.2,0);[-1,1].forEach(s=>{[.85,.55,.25].forEach((aa,k)=>fig(aa-.1,s*.62,.06,.9,s*(.9-k*.5)));fig(.95,s*.5,.06,.7,s*-.6)});
    // canopic jars at the corners, offering bowls of coals, gold inlay bands
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([a,b])=>{const [x,z]=W2(T.altar.a+a*1.85,T.altar.b+b*1.85);q.p('','cyl','c',0xd8c0a0,x,y0+1.25,z,.2,.5,.2).p('','sph','c',[0x6a5a3a,0x8a6a4a,0x5a4a3a,0x7a6a4a][(a+1)+(b+1)/2],x,y0+1.58,z,.17,.16,.17)});
    [-1,1].forEach(s=>{const [x,z]=W2(T.altar.a,T.altar.b+s*1.4);q.p('','cyl','m',0x6a4a24,x,y0+1.92,z,.28,.1,.28).p('','sph','g',0xff8a3a,x,y0+1.98,z,.22,.06,.22);CY165.fires.push([x,y0+2.05,z])});
    for(let k=0;k<4;k++){const [x,z]=W2(T.altar.a+(k<2?(k?1.9:-1.9):0),T.altar.b+(k>=2?(k==2?.95:-.95):0));q.p('','box','m',gold,x,y0+1.62,z,k<2?.06:3.8,.08,k<2?1.9:.06,0,yw,0)}},CY168W,.05));
  // the colonnade, its architraves, the wall behind, the gates, obelisks, statues, braziers, sand drifts
  g.add(dt168Group('CY165|court',q=>{dt168Up(q);const RC=T.col,gate=(ang)=>T.gates.some(G=>{const ga=Math.atan2(G.b,G.a);return Math.abs(Math.atan2(Math.sin(ang-ga),Math.cos(ang-ga)))<.32}),N=28,tops=[];
    for(let i=0;i<N;i++){const ang=i/N*Math.PI*2,a=Math.cos(ang)*RC,b=Math.sin(ang)*RC;if(gate(ang)||Math.hypot(a-T.rift.a,b)<4.2){tops.push(null);continue}const [x,z]=W2(a,b),broken=(i*7)%9==3,h=broken?2.2+R()*1.5:6.4;
      q.p('','box','c',sdD,x,y0+.35,z,1.25,.7,1.25,0,yw,0);q.p('',cy168Col(),'c',pick(sd),x,y0+.7,z,1,h/6.4,1,0,R()*6,0);if(broken)for(let k=0;k<3;k++)q.p('','dod','c',pick(sd),x+(R()-.5)*.5,y0+.7+h,z+(R()-.5)*.5,.2,.14,.2,R()*3,R()*3,0);
      if(!broken){q.p('',cy168Cap(),'c',sd[0],x,y0+.7+h,z,1,1,1,0,R()*6,0).p('','box','c',sdD,x,y0+.7+h+.92,z,1.3,.24,1.3,0,yw,0);tops.push([x,z])}
      else{tops.push(null);for(let k=0;k<3;k++){const dr=1.2+k*1.1,[fx,fz]=W2(a*(1-dr/RC*.6),b*(1-dr/RC*.6)+(R()-.5)*1.5);q.p('',cy168Col(),'c',pick(sd),fx,y0+.42,fz,.95,.9/6.4,.95,Math.PI/2,R()*3,0)}}
      // a band of carved glyphs round each shaft
      if(!broken)for(let k=0;k<8;k++){const aa=k/8*Math.PI*2;q.p('','box','c',gl,x+Math.cos(aa)*.47,y0+3.6,z+Math.sin(aa)*.47,.12,.42,.04,0,-aa+Math.PI/2,0)}}
    for(let i=0;i<N;i++){const A=tops[i],B=tops[(i+1)%N];if(!A||!B)continue;const mx=(A[0]+B[0])/2,mz=(A[1]+B[1])/2,L=Math.hypot(B[0]-A[0],B[1]-A[1]);q.p('','box','c',pick(sd),mx,y0+.7+6.4+1.36,mz,L+.9,.62,1.0,0,Math.atan2(B[0]-A[0],B[1]-A[1])+Math.PI/2,0);
      q.p('','box','c',sdD,mx,y0+.7+6.4+1.74,mz,L+1.0,.14,1.15,0,Math.atan2(B[0]-A[0],B[1]-A[1])+Math.PI/2,0)}
    // the wall behind the colonnade, in panels of glyphs, broken off unevenly at the top
    const RW=T.R+.9;for(let i=0;i<56;i++){const ang=i/56*Math.PI*2;if(gate(ang))continue;const a=Math.cos(ang)*RW,b=Math.sin(ang)*RW,[x,z]=W2(a,b),h=7.4+Math.sin(i*1.7)*1.4+(i%5==0?-2.2:0),ry=rot(Math.cos(ang),Math.sin(ang));
      for(let y=0;y<h;y+=.8)q.p('','box','c',pick(sd),x,y0+y+.4,z,1.92,.78,1.2,0,ry+Math.PI/2,0);
      if(i%2==0)for(let r=0;r<3;r++)q.p('','box','c',gl,x-Math.cos(ang)*.0+(F.fx*Math.cos(ang)+F.lx*Math.sin(ang))*-.62,y0+2.2+r*1.1,z+(F.fz*Math.cos(ang)+F.lz*Math.sin(ang))*-.62,.9,.5,.05,0,ry+Math.PI/2,0)}
    // the gates: two battered pylons, a lintel with a sun disc, a dark doorway into the temple
    T.gates.forEach(G=>{const ux=Math.cos(G.ang),uy=Math.sin(G.ang),ry=rot(ux,uy);[-1,1].forEach(s=>{const a=G.a+uy*-s*2.6,b=G.b+ux*s*2.6,[x,z]=W2(a,b);for(let k=0;k<9;k++)q.p('','box','c',pick(sd),x,y0+.45+k*.9,z,2.4-k*.1,.9,1.8-k*.05,0,ry,0)});
      const [lx,lz]=W2(G.a,G.b);q.p('','box','c',sd[2],lx,y0+5.6,lz,3.4,1.1,1.6,0,ry,0).p('','box','c',sdD,lx,y0+6.25,lz,3.8,.2,1.8,0,ry,0).p('','cyl','m',gold,lx-ux*0-F.fx*0,y0+5.6,lz,.36,.08,.36,Math.PI/2,ry,0);
      const [dx,dz]=W2(G.a+ux*.7,G.b+uy*.7);q.p('','box','c',0x080402,dx,y0+2.5,dz,2.8,5.0,.4,0,ry,0)});
    // the obelisks
    for(let k=0;k<4;k++){const ang=Math.PI/4+k*Math.PI/2,a=Math.cos(ang)*11.6,b=Math.sin(ang)*11.6,[x,z]=W2(a,b);q.p('','box','c',sdD,x,y0+.4,z,1.6,.8,1.6,0,yw+ang,0);
      q.p('',dt168Lathe([[0,0],[.5,0],[.36,7.62],[0,7.62]],4),'c',sd[0],x,y0+.8,z,1,1,1,0,yw+ang,0).p('','cone4','m',gold,x,y0+8.75,z,.48,.7,.48,0,yw+ang,0);for(let r=0;r<8;r++)[0,1].forEach(sd2=>q.p('','box','c',gl,x+(sd2?.5:-.5)*Math.cos(yw+ang)*.0,y0+1.4+r*.8,z,.14,.36,.05,0,yw+ang+sd2*Math.PI,0))}
    // the Warden's kin: ant-headed warriors in stone, spears grounded (two are broken)
    for(let k=0;k<6;k++){const ang=Math.PI/6+k*Math.PI/3,a=Math.cos(ang)*13.9,b=Math.sin(ang)*13.9;if(gate(ang)||Math.hypot(a-T.rift.a,b)<5)continue;const [x,z]=W2(a,b),ry=rot(-Math.cos(ang),-Math.sin(ang)),c=0xb89868,c2=0x9a7a50,br=k%3==1;
      {const i0=q.P.length;cy168Kin(q,br,c,c2,sdD);dt168Xf(q,i0,dt168Mx(x,y0,z,0,ry,0))}}
    // braziers on iron tripods, sand drifted against the walls
    for(let k=0;k<8;k++){const ang=k/8*Math.PI*2+.2,a=Math.cos(ang)*(T.R-3.2),b=Math.sin(ang)*(T.R-3.2);if(T.urns.some(u=>Math.hypot(u.a-a,u.b-b)<1.6))continue;const [x,z]=W2(a,b);[0,1,2].forEach(j=>{const aa=j*2.09;q.L('','m',0x3a3c42,[x+Math.cos(aa)*.32,y0,z+Math.sin(aa)*.32],[x,y0+1.0,z],.025,.025,4)});q.p('','cyl','m',0x4a3a2a,x,y0+1.05,z,.34,.2,.34).p('','sph','g',0xff7a2a,x,y0+1.16,z,.27,.1,.27);CY165.fires.push([x,y0+1.3,z])}
    for(let k=0;k<22;k++){const ang=R()*Math.PI*2,r=T.R-.4-R()*1.2,[x,z]=W2(Math.cos(ang)*r,Math.sin(ang)*r);if(gate(ang))continue;q.p('',dt168Mound(20+k%6),'c',R()<.5?0xd8b47a:0xc8a066,x,y0-.05,z,1.2+R()*1.4,.4+R()*.45,.9+R()*1.1,0,R()*3,0)}},CY168W,.05));
  // the rift stones: two horn-shaped arcs of dark stone, their runes dark until the rift is called
  {const [rx,rz]=W2(T.rift.a,T.rift.b),G=new THREE.Group();G.position.set(rx,y0,rz);G.rotation.y=Math.atan2(-F.fx,-F.fz);g.add(G);CY165.riftG=G;
    G.add(dt168Group('CY165|horns',q=>{dt168Up(q);[-1,1].forEach(s=>{q.p('','box','c',0x5a4a3a,s*3.4,.45,0,1.8,.9,2.0);const hp=[],hr=[];for(let k=0;k<=28;k++){const t=k/28,a=t*Math.PI*.92;hp.push([s*(3.2-(1-Math.cos(a))*2.6),.9+Math.sin(a)*7.2,0]);hr.push([.66-t*.5,.6-t*.46])}dt168P(q,dt168Geo('cyhorn'+s,()=>ch164Tube(hp,hr,16,{tip:.3})),'c',0x3a3430,new THREE.Matrix4());
      for(let k=0;k<8;k++){const t=(k+.5)/9,a=t*Math.PI*.92;q.p('','box','c',0x241e1a,s*(3.2-(1-Math.cos(a))*2.6)+s*-.02,.9+Math.sin(a)*7.2,.5-t*.3,.3,.3,.06,0,0,s*a)}})},CY168W,.05));
    const runeM=new THREE.MeshBasicMaterial({color:0x40e0c0,transparent:true,opacity:.0,fog:false,blending:THREE.AdditiveBlending,depthWrite:false});CY165.runeM=runeM;
    [-1,1].forEach(s=>{for(let k=0;k<8;k++){const t=(k+.5)/9,a=t*Math.PI*.92,m=new THREE.Mesh(svG('cy_rune',()=>new THREE.PlaneGeometry(.26,.26)),runeM);m.position.set(s*(3.2-(1-Math.cos(a))*2.6),.9+Math.sin(a)*7.2,.56-t*.3);m.rotation.z=s*a;G.add(m)}})}
  // what stands is solid: columns, statues, obelisks, the dais and altar, the rift stones' feet, the gate pylons
  try{const blk=(a,b,r)=>{const [x,z]=W2(a,b);for(let j=Math.floor(z-r-1);j<=z+r+1;j++)for(let i=Math.floor(x-r-1);i<=x+r+1;i++)if(Math.hypot(i-x,j-z)<=r)CBLK.add(j*W+i)};
    for(let i=0;i<28;i++){const ang=i/28*Math.PI*2;blk(Math.cos(ang)*T.col,Math.sin(ang)*T.col,.7)}for(let k=0;k<4;k++){const ang=Math.PI/4+k*Math.PI/2;blk(Math.cos(ang)*11.6,Math.sin(ang)*11.6,.9)}
    for(let k=0;k<6;k++){const ang=Math.PI/6+k*Math.PI/3;blk(Math.cos(ang)*13.9,Math.sin(ang)*13.9,.9)}blk(T.altar.a,T.altar.b,1.9);[-1,1].forEach(s=>blk(T.rift.a,s*3.4,1.0))}catch(_){}
  return g}
function cy165Tick(dt,now){const here=ss165Here(1);if(here&&!CY165.g)try{cy165Build()}catch(e){console.error('v165 court build',e);CY165.err++;CY165.g=CY165.g||new THREE.Group()}
  if(!CY165.g)return;CY165.g.visible=here;if(!here)return;if(Math.random()<dt*16&&CY165.fires.length){const q=CY165.fires[Math.floor(Math.random()*CY165.fires.length)];burst(new THREE.Vector3(q[0]+(Math.random()-.5)*.3,q[1],q[2]+(Math.random()-.5)*.3),Math.random()<.5?0xff8a2a:0xffc040,1,.15,1.4,.5)}}
{const f=homeTick;homeTick=function(dt,now,al){const r=f.apply(this,arguments);try{cy165Tick(dt,now)}catch(e){if(!CY165.err++)console.warn('v165 court tick',e)}return r}}
// v168: the colonnade's papyrus columns (a bundle of eight stems on a swelling foot, bound under the capital: one shaft 6.4 tall, scaled
// for the broken ones) and their open lotus capitals (.85 tall), turned with lobes; the court weathers darker toward the ground
var CY168W={c:{g:[1.4,.3],n:.14,s:.35,sd:41},m:{n:.2,sd:2}};
function cy168Col(){return dt168Sweep('cycol',[[0,.5,.5,.5,0,0,.05],[.25,.56,.56,.56,0,0,.07],[.7,.54,.54,.54,0,0,.08],[1.4,.47,.47,.47,0,0,.08],[3.5,.44,.44,.44,0,0,.08],[5.6,.42,.42,.42,0,0,.08],[5.75,.45,.45,.45,0,0,.02],[5.82,.45,.45,.45,0,0,.02],[5.9,.41,.41,.41,0,0,.07],[6.05,.45,.45,.45,0,0,.02],[6.12,.45,.45,.45,0,0,.02],[6.2,.41,.41,.41,0,0,.07],[6.4,.42,.42,.42,0,0,.07]],24,{fk:8,bot:1,top:1,reg:1})}
function cy168Cap(){return dt168Sweep('cycap',[[0,.42,.42,.42,0,0,.07],[.25,.52,.52,.52,0,0,.1],[.5,.68,.68,.68,0,0,.12],[.72,.8,.8,.8,0,0,.11],[.82,.82,.82,.82,0,0,.08],[.82,.5,.5,.5,0,0,0]],24,{fk:8,top:1,reg:1})}
// the Warden's kin (v168, was spheres and sticks): an ant-headed warrior on a moulded plinth, its jointed legs braced, the segmented
// gaster resting on the plinth behind, a chitin torso, mandibles and elbowed antennae, a spear grounded; broken ones lost head and spear
function cy168Kin(q,br,c,c2,sdD){const V3=THREE.Vector3,eg=dt168Lathe([[0,-1],[.6,-.82],[.92,-.4],[1,0],[.92,.4],[.6,.82],[0,1]],14);
  dt168P(q,dt168Lathe([[0,-.3],[.82,-.3],[.82,.08],[.78,.12],[.76,.85],[.8,.9],[.84,.95],[.84,1.0],[0,1.0]],4),'c',sdD,new THREE.Matrix4());
  [-1,1].forEach(s=>{dt168T(q,'kinl'+s,'c',c,[[s*.38,1.02,-.05],[s*.5,1.45,.12],[s*.56,1.9,.2],[s*.45,2.25,.12],[s*.3,2.55,0]],[.11,.13,.15,.16,.17],12);
    dt168P(q,eg,'c',c2,dt168Mx(s*.38,1.06,.08,0,0,0,.13,.07,.22));dt168P(q,eg,'c',c2,dt168Mx(s*.56,1.9,.22,0,0,0,.16,.14,.16))});
  for(let i=0;i<3;i++)dt168P(q,eg,'c',i%2?c2:c,dt168Mx(0,1.36+i*.03,-.42-i*.26,-.35,0,0,.44-i*.06,.36-i*.04,.22));
  dt168T(q,'kinw','c',c2,[[0,1.5,-.3],[0,2.0,-.12],[0,2.5,0]],[.1,.11,.14],10);
  dt168P(q,dt168Sweep('kint',[[2.45,.3,.22,.22,0,0,.02],[2.7,.34,.26,.24,0,.02,.03],[3.05,.4,.3,.26,0,.04,.03],[3.4,.44,.28,.26,0,.04,.02],[3.65,.4,.22,.24,0,.03,.01],[3.8,.22,.16,.16,0,.04,0],[3.88,.12,.1,.1,0,.05,0]],22,{bot:1,top:1,fk:6}),'c',c,new THREE.Matrix4());
  for(let i=0;i<3;i++)dt168P(q,dt168BBox(.62-i*.06,.06,.06,.02),'c',c2,dt168Mx(0,2.75+i*.28,.28,0,0,0));
  [-1,1].forEach(s=>{dt168P(q,dt168Lathe([[0,0],[.26,0],[.25,.08],[.18,.16],[0,.2]],14),'c',c2,dt168Mx(s*.42,3.62,0,0,0,s*-.5));
    const hand=s>0?[.5,3.25,.28]:[-.38,2.92,.34];dt168T(q,'kina'+s,'c',c,[[s*.44,3.58,0],[s*.58,3.15,.12],[s*.56,2.92,.2]],[.11,.1,.09],10);dt168T(q,'kinf'+s,'c',c,[[s*.56,2.92,.2],[(s*.56+hand[0])/2,(2.92+hand[1])/2+.04,.28],hand],[.09,.085,.08],10);
    dt168P(q,eg,'c',c2,dt168Mx(hand[0],hand[1],hand[2],0,0,0,.09,.1,.09))});
  if(br){for(let i=0;i<4;i++)dt168P(q,dt168Rock(190+i,1,.6),'c',c,dt168Mx((i-1.5)*.18,3.85+(i%2)*.06,.02,i,i*2,0,.14,.1,.12));return}
  dt168P(q,eg,'c',c2,dt168Mx(0,4.08,.08,.35,0,0,.3,.28,.4));dt168P(q,eg,'c',c2,dt168Mx(0,3.95,.36,.3,0,0,.18,.12,.16));
  [-1,1].forEach(s=>{dt168P(q,eg,'g',0x2a6a5a,dt168Mx(s*.2,4.14,.22,0,s*.5,0,.09,.11,.08));
    dt168P(q,dt168Geo('kinm'+s,()=>ch164Tube([[0,0,0],[s*.05,-.06,.12],[-s*.02,-.1,.22],[-s*.1,-.1,.26]],[.045,.04,.03,.01],8,{tip:.03})),'c',c,dt168Mx(s*.1,3.88,.44));
    dt168P(q,dt168Geo('kinn'+s,()=>ch164Tube([[0,0,0],[s*.08,.25,.06],[s*.12,.5,.1],[s*.3,.68,.32],[s*.42,.78,.5]],[.025,.022,.02,.016,.01],6,{tip:.02})),'c',c2,dt168Mx(s*.08,4.25,.28))});
  dt168T(q,'kinsp','m',0x6a5a3a,[[.5,1.0,.28],[.5,3.0,.28],[.5,5.15,.28]],.045,10);
  dt168P(q,dt168Ext('kinbl',[[-.09,0],[.09,0],[.12,.18],[0,.62],[-.12,.18]],.04,.012,1),'m',0xa89060,dt168Mx(.5,5.15,.28));dt168P(q,dt168Geo('kinsk',()=>new THREE.TorusGeometry(.06,.02,6,14).rotateX(Math.PI/2)),'m',0xa89060,dt168Mx(.5,5.12,.28))}

