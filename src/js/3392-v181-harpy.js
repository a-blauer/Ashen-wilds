// ================= v181: harpies — a woman-bird, not an eagle =================
// The Harpy and the Storm Harpy were both an eagle body. Now each is a harpy: a gaunt, ash-skinned woman's upper body under a
// ragged feather mantle, a wild mane, a narrow face with burning eyes and a mouth of jagged teeth; her arms are great ragged
// wings (a bony leading edge with a hooked claw at the wrist); from the waist down she is bird — feathered hips and thighs,
// scaled shanks bending at a backward ankle, splayed talons. The skeleton is upright (same bone names as the bird rig, so the
// walk, bite, Gale Dive and Gale Shriek all still play), with the torso, neck and head at the humanoid heights so the face,
// eyes and hair use the v181 anatomy toolkit. Harpy (carrion browns) and Storm Harpy (slate, storm-blue streaks) share it.
var HARPY181={on:true,
  bones:{pelvis:[null,0,.55,-.01],spine:['pelvis',0,.66,0],chest:['spine',0,.84,0],neck:['chest',0,1.0,0],head:['neck',0,1.1,0],jaw:['head',0,1.07,.06],
    tail0:['pelvis',0,.52,-.1],tail1:['tail0',0,.46,-.2],tail2:['tail1',0,.41,-.29],tail3:['tail2',0,.37,-.37],
    hl0:['pelvis',-.085,.55,0],hl1:['hl0',-.09,.36,.09],hl2:['hl1',-.095,.14,-.05],hr0:['pelvis',.085,.55,0],hr1:['hr0',.09,.36,.09],hr2:['hr1',.095,.14,-.05]},
  pal:{Harpy181:{f:0x33281f,f2:0x241b14,ruff:0x4e4032,sk:0x6e645c,sk2:0x544a44,hair:0x1a1410,leg:0x34302c,claw:0x0c0a08,eye:0xffb020,glow:null},
       GaleHarpy:{f:0x2c323c,f2:0x1c2028,ruff:0x56606c,sk:0x66707a,sk2:0x4c5660,hair:0x14181e,leg:0x3a3e44,claw:0x0a0a0c,eye:0x8ad8ff,glow:0x8ad8ff}},G:{}};
function h181Geo(n){if(HARPY181.G[n])return HARPY181.G[n];const K=HARPY181.pal[n],B=mdB(HARPY181.bones),k=dkKit(),P=mdP({bones:HB,col:{skin:K.sk}});
  const skin=m=>a181Nz(K.sk,m,.3,14),fe=m=>a181Nz(K.f,m,.4,12);
  // torso: lean, narrow-waisted; feathers from the waist down
  a181Torso(B,P,a181TRings('lean',{w:.86,d:.9}),m=>m.y<.66?fe(m):skin(m));
  [-1,1].forEach(s=>{const x=s*.17;mdLoft(B,[{p:[x*.7,.94,0],rx:.06,f:.06,b:.06,w:[['chest',1]]},{p:[x,.95,-.01],rx:.07,f:.06,b:.065,w:[['chest',1]]},{p:[x*1.12,.93,-.02],rx:.05,f:.045,b:.05,w:[['chest',1]]}],{seg:10,capA:true,capB:true,col:skin})});
  // the head: narrow, hollow-cheeked; eyes burn; a mouth of jagged teeth; a wild mane with quills
  a181Head(B,P,{w:.88,jaw:.84,chin:.92,gaunt:1,cheek:1.08,len:1.04,crown:1.04},m=>m.s>.5&&m.y>1.13&&m.y<1.165&&Math.abs(m.c)>.08?mdSh(K.sk2,.5):m.s<-.2?K.sk2:K.sk);
  a181Eyes(k,P,{glow:K.eye,brow:K.sk2,tilt:.3,browTilt:.35,r:.9});a181Nose(k,P,K.sk,{out:.018,len:1.05,w:.85,r:.011});
  a181Mouth(k,P,{y:1.072,open:.008,col:0x120606,lip:K.sk2,w:.9,fangs:[[-.016,.014],[.016,.014],[-.008,.009,1],[.008,.009,1]]});
  a181HairCap(B,P,{col:K.hair,col2:mdSh(K.hair,1.4),y1:.8,thick:.016,rag:.9,front:.08});
  for(let i=0;i<9;i++){const a=Math.PI*(.55+i*.11)*(i%2?1:-1),y=1.2-a181H(i,2)*.08,p=[Math.sin(a)*.07,y,Math.cos(a)*.07];k.L('head','c',i%3?K.f:K.ruff,p,[p[0]*2.8,y-.05-a181H(i,5)*.1,p[2]*2.3-.05],.012,.002,4)}
  // the feather mantle over the shoulders and breast, the feathered hips (two layers)
  a181Shag(B,P,.76,.99,.02,K.ruff,K.f,.12);a181Shag(B,P,.5,.66,.03,K.f,K.f2,.16);a181Fringe(B,a181TRingPts(B,P,.58,.05,44),{len:.2,col:K.f2,col2:K.f,closed:true});
  // bird legs: a feathered thigh, a bare scaled shank, an ankle knob, splayed talons (three forward, one back)
  [-1,1].forEach(s=>{const l=s<0?'hl':'hr',Hb=HARPY181.bones,a=Hb[l+'0'],b=Hb[l+'1'],c=Hb[l+'2'],A=[a[1],a[2],a[3]],Kn=[b[1],b[2],b[3]],An=[c[1],c[2],c[3]],L=(p,q,t)=>p.map((v,i)=>v+(q[i]-v)*t);
    const ring=(p,r,w,f)=>({p,rx:r,f:f||r,b:f||r,w});
    const TH=[ring(L(A,Kn,-.1),.07,[['pelvis',.6],[l+'0',.4]]),ring(L(A,Kn,.3),.085,[[l+'0',1]]),ring(L(A,Kn,.7),.07,[[l+'0',1]]),ring(L(A,Kn,1.05),.045,[[l+'0',.5],[l+'1',.5]])];
    mdLoft(B,mdDome(TH),{seg:10,capA:true,col:fe});a181Fringe(B,a181RingPts(B,TH[3],.012,16),{len:.08,col:K.f,col2:K.f2,closed:true,cx:TH[3].p[0],cz:TH[3].p[2]});
    mdLoft(B,[ring(Kn,.034,[[l+'0',.4],[l+'1',.6]]),ring(L(Kn,An,.5),.026,[[l+'1',1]]),ring(L(Kn,An,.92),.024,[[l+'1',.6],[l+'2',.4]]),ring(An,.03,[[l+'2',1]]),ring([An[0],.05,An[2]+.02],.026,[[l+'2',1]]),ring([An[0],.03,An[2]+.04],.03,[[l+'2',1]])],
      {seg:8,capB:true,col:m=>Math.round(m.y*60)%2?K.leg:mdSh(K.leg,.8)});
    k.p(l+'2','sph','c',K.leg,An[0],.03,An[2]+.035,.04,.024,.046);
    [[-.5,.11],[0,.13],[.5,.11],[Math.PI,.07]].forEach(([an,len])=>{const d=[Math.sin(an),0,Math.cos(an)],p=[An[0]+d[0]*.02,.03,An[2]+.04+d[2]*.02],q=[p[0]+d[0]*len*.55,.02,p[2]+d[2]*len*.55],e=[p[0]+d[0]*len,.016,p[2]+d[2]*len];
      k.L(l+'2','c',K.leg,p,q,.014,.011,5).L(l+'2','c',K.leg,q,e,.011,.008,5);a181Digit(k,l+'2',K.claw,e,[d[0],-.25,d[2]],.05,.008,2,.6,[d[2],0,-d[0]],.012)})});
  // the tail: a fan of long ragged feathers
  for(let i=0;i<9;i++){const a=(i-4)*.17,l=.3+.08*Math.cos(a*2)-a181H(i,4)*.06,p0=[Math.sin(a)*.05,.52,-.1],p1=[Math.sin(a)*(.05+l*.6),.46-l*.35,-.1-l*.85];
    mdLoft(B,[{p:p0,rx:.012,f:.004,b:.004,w:[['tail0',1]]},{p:[(p0[0]+p1[0])/2,(p0[1]+p1[1])/2,(p0[2]+p1[2])/2],rx:.035,f:.005,b:.005,w:[['tail1',1]]},{p:p1,rx:.006,f:.003,b:.003,w:[['tail2',1]]}],{seg:4,ref:[0,1,0],col:i%2?K.f:K.f2})}
  mdKit(B,k);return HARPY181.G[n]=mdBake(B).c}
function h181Wing(n){const K=HARPY181.pal[n],O=[[0,0,.06],[.2,.05,.09],[.45,.07,.09],[.7,.04,.02],[1.0,0,-.1]];const N=13;
  for(let i=1;i<=N;i++){const t=i/N,x=1.0-t*.98,z=-.1-Math.sin(t*Math.PI)*.42-t*.12,tip=i%2?.1+a181H(i,3)*.08:0;O.push([x+tip*.15,-.01,z-tip])}
  O.push([0,0,-.2]);
  return lpwWing('harpy181'+n,O,[.32,.02,-.12],[[[0,.01,.06],[.45,.08,.09],.03],[[.45,.08,.09],[1.0,.02,-.1],.016],[[.45,.08,.09],[.5,.1,.17],.008]],K.ruff,K.f2,K.sk2,6)}
(function(){if(!HARPY181.on||!LPR.GaleHarpy||!SPEC.GaleHarpy)return;
  ['Harpy181','GaleHarpy'].forEach(n=>{const K=HARPY181.pal[n];
    SPEC[n]=Object.assign({},SPEC.GaleHarpy,{bones:HARPY181.bones,hd:[0,1.2,.04],bk:[['spine',.7,-.12],['chest',.88,-.12],['neck',1.02,-.08]],legs:[['hl',0],['hr',Math.PI]],ex:()=>{},sig:null,dt:null});
    LPR[n]=Object.assign({},LPR.GaleHarpy,{geo:()=>h181Geo(n),
      kit(k,c,C,red){[-1,1].forEach(s=>k.p('head','sph','g',red?0xff2a2a:K.eye,s*.04,1.148,.1,.012,.007,.006));
        if(K.glow)for(let i=0;i<5;i++){const s=i%2?1:-1;k.L(i<2?'chest':'pelvis','g',K.glow,[s*(.06+i*.02),.9-i*.08,-.11],[s*(.1+i*.02),.84-i*.08,-.13],.005,.002,3)}},
      post(x,c,C,mat){lpwPair(x,'chest',h181Wing(n),mat,.17,.95,-.03,.8,.1,.55,.4)}})});
  if(EN.harpy)EN.harpy.rig='Harpy181';})();
