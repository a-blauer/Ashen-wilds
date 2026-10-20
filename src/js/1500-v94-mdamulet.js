// =====================================================================================================
function mdAmulet(B,P,d){const k=mdKP(),ti=d.ti,gold=ti==0?0x7a6a4a:ti>=3?0xd8b050:0xa88848,off=(P.tOff||0)+.008,y=.87,f=mdTorsoAt(P,y).f+off+.008,sh=d.set?mdHash(d.n)%5:ti,gem=d.gem;
  // chain: a ring round the neck base lying on the shoulders
  const top=mdTorsoAt(P,.975);k.p('chest','ring','m',gold,0,.965,(top.z||0)+.005,top.rx*.62+off,.22,(top.f+top.b)/2*.95+off,-.18);
  k.L('chest','m',gold,[-.05,.95,f-.02],[0,y+.02,f],.005,.005,3).L('chest','m',gold,[.05,.95,f-.02],[0,y+.02,f],.005,.005,3);
  if(sh==0){k.p('chest','cone4','c',0xe8e0c8,0,y-.015,f,.014,.05,.01,Math.PI)}
  else if(sh==1){k.p('chest','oct','m',gold,0,y,f,.03,.036,.012);k.p('chest','oct',d.G?'g':'m',d.G||gem,0,y,f+.006,.02,.026,.01)}
  else if(sh==2){k.p('chest','cyl','m',gold,0,y,f,.028,.012,.028,Math.PI/2);k.p('chest','sph',d.G?'g':'m',d.G||gem,0,y,f+.008,.012)}
  else if(sh==3){k.p('chest','sph','m',gold,0,y,f,.026,.032,.012);k.p('chest','sph','g',d.G||gem,0,y,f+.01,.012,.014,.006)}
  else{for(let i=0;i<5;i++){const a=i/5*Math.PI*2;k.p('chest','cone4','m',gold,Math.sin(a)*.02,y+Math.cos(a)*.02,f,.008,.03,.006,0,0,-a)}k.p('chest','oct',d.G?'g':'m',d.G||gem,0,y,f+.006,.014)}
  mdKit(B,k)}
function mdRingW(B,P,d){const k=mdKP(),A2=P.bones.aR2,band=[0xb06a3a,0xc8ccd4,0xd8a040,0x3a3a46,0x7ab0d8][d.ti],hand=mdArm(P,1)[7],x=hand.p[0]-.012,y=hand.p[1]+.002,z=hand.p[2]+hand.f*.55;
  k.p('aR2','ring','m',band,x,y,z,.024,.16,.022,0,0,Math.PI/2);k.p('aR2','oct',d.G?'g':'m',d.G||d.gem,x+.004,y,z+.016,.012,.014,.01);mdKit(B,k)}

// =====================================================================================================
// icons and ground loot: the same builders, without the body, as rigid parts (one part per colour)
