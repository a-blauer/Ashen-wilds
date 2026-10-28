// ================= v153 The Hilltop Ascent — models =================
//  * Skarrith, the Mountain Coil: v164 rebuilt it in detail (3251: ch153Snake, ch153SnakeHead, ch153SnakeLay).
//  * The course: the tunnel arches and the summit crack (v164: the obstacles, the bridge and the venom meshes are gone; the broken
//    trail's lips and the venom globs, rings and puddles are 3250's).
//  * The uphill road at the far edge of Mistmere (Hillside Crest II), which replaces its gateway to III.
var CH153M={col:{sk:0x2e3a22,skD:0x1c2416,belly:0xb8a870,band:0x5a6a2a,hood:0x3a4a28,spot:0xd8c060,eye:0xf0ff60,fang:0xf0e8d0,mouth:0x6a1a1a,tongue:0xc02030,horn:0x3a3020},
  rock:[0x6a645a,0x7a7266,0x5a554c,0x8a8274],wood:0x5a4028,woodD:0x3a2818,woodL:0x7a5a38,rope:0x9a8a5a,venom:0x8aff3a,venomD:0x3a8a12};
function ch153R(seed){return ab152R(seed)}
// ---------------- the course ----------------
function ch153Arch(){return lgGroup('CH153|arch',q=>{const C=CH153M,R=ch153R(77);[-1,1].forEach(s=>{q.p('','box','c',C.rock[2],s*3.6,2.4,0,1.6,5.2,2.6);for(let i=0;i<3;i++)q.p('','dod','c',C.rock[i],s*(3.4+R()*.6),1+i*1.5,(R()-.5)*1.6,.9,.8,.9,R(),R(),R())});
  q.p('','box','c',C.rock[0],0,5.4,0,8.6,1.4,2.7);for(let i=0;i<4;i++)q.p('','cone','c',C.rock[3],-2.4+i*1.6,4.5,(R()-.5)*1.2,.22,.8,.22,Math.PI,0,0)},0)}
function ch153Crack(){return lgGroup('CH153|crack',q=>{const C=CH153M,R=ch153R(1313);
  [-1,1].forEach(s=>{for(let i=0;i<6;i++){const sz=1.6+R()*1.4;q.p('','dod','c',C.rock[i%4],s*(1.7+sz*.7+R()*.6),sz*.8+R()*3,(R()-.5)*2,sz,sz*1.4,sz,R()*3,R()*3,R()*3)}
    q.p('','box','c',C.rock[2],s*2.6,3.6,-1.0,2.6,7.2,3.6,0,0,s*.06)});
  q.p('','box','c',C.rock[0],0,7.6,-1,7.6,1.8,4);q.p('','box','c',0x050404,0,1.8,-.5,1.5,3.6,.1);
  for(let i=0;i<5;i++)q.p('','dod','c',C.rock[3],(R()-.5)*1.4,4.0+i*.5,.2,.25,.4,.25,R(),R(),R())},0)}
// ---------------- the uphill road at the far edge of Mistmere ----------------
function ch153GateModel(s){const C=CH153M,g=new THREE.Group();g.userData.psNo=1;
  g.add(lgGroup('CH153|road',q=>{const R=ch153R(808);
    // a worn road climbing away out of the clearing between two rising shoulders of rock, stone steps, a waymarker, a carved serpent
    for(let i=0;i<9;i++){const z=-.6-i*.9,y=.08+i*.42;q.p('','box','c',i%2?0x8a7a5e:0x7a6c52,0,y,z,2.6,.24,1.0,-.42,0,0);q.p('','box','c',0x5a5040,0,y-.5,z,2.8,.8,1.0)}
    [-1,1].forEach(sd=>{for(let i=0;i<8;i++){const sz=.8+R()*1.1;q.p('','dod','c',C.rock[i%4],sd*(2.1+sz*.6+R()*.8),sz*.6+i*.45+R()*.8,-.8-i*1.0,sz,sz*1.25,sz,R()*3,R()*3,R()*3)}});
    for(let i=0;i<4;i++)q.p('','cone','c',0x2f5a32,(i%2?1:-1)*(3.6+R()),2.6+i*.9,-3-i*1.6,.8,2.2,.8);
    q.L('','c',C.woodD,[1.5,0,.6],[1.5,1.6,.6],.06,.05,5);q.p('','box','c',C.woodL,1.5,1.45,.62,.9,.3,.06,0,0,-.12);q.p('','box','c',0x2a2018,1.52,1.45,.66,.7,.06,.02,0,0,-.12);
    q.L('','c',0x3a6a4a,[-1.8,.25,.7],[-1.2,.35,1.6],.24,.18,7);q.p('','hood','c',0x2a5a3a,-1.1,.5,1.75,.7,.8,.35,1.3,0,.2)},0));
  g.position.set(s.x,GH(s.x,s.z),s.z);g.rotation.y=s.ry;scene.add(g);
  const ca=Math.cos(s.ry),sa=Math.sin(s.ry);for(let o=-4.6;o<=4.6;o+=.6)for(let d=-7;d<=-.6;d+=.6){if(Math.abs(o)<1.2&&d>-1.6)continue;const x=s.x+ca*o+sa*d,z=s.z-sa*o+ca*d;CBLK.add(Math.round(z)*W+Math.round(x))}
  return g}
