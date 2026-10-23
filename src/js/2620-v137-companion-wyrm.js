// ================= v137: Gravewyrm and Venomcoil rebuilt =================
// The v81 serpent was a flat 8-sided tube with a small wedge head whose eyes looked sideways, and Venomcoil was the same body
// in green. Both now have rounder 12-sided coils with overlapping belly scutes, a neck that rises in an S so the head is held
// up, a bigger head with a brow, nostrils and eyes that look forward. On the shared skeleton (rig variants, RV137 in 2600):
//  * Gravewyrm — a grave serpent: a skull-plated head with bone horns, bone plates down the spine like vertebrae, pale
//    rib bands across the flanks, grave-moss tufts;
//  * Venomcoil — a king cobra: a broad flared hood with spectacle markings behind the head, bright venom bands, long
//    fangs and a rattle on the tail.
RV137.var.Gravewyrm=['Gravewyrm','Venomcoil'];if(EVO100.surf)delete EVO100.surf.Gravewyrm;
var WY137={
  // body rings [z, radius]
  body:[[-1.64,.01],[-1.55,.03],[-1.42,.052],[-1.28,.074],[-1.12,.096],[-.96,.118],[-.8,.138],[-.64,.155],[-.5,.168],[-.37,.178],[-.25,.186],[-.12,.188],[0,.184],[.1,.172],[.2,.152],[.29,.13],[.37,.115]],
  // head rings [z, y, half width, above, below]
  head:[[.42,.355,.122,.085,.065],[.49,.37,.15,.09,.062],[.57,.375,.152,.085,.055],[.65,.37,.13,.07,.045],[.73,.362,.095,.055,.035],[.8,.355,.058,.04,.026],[.85,.352,.022,.018,.014],[.87,.35,.004,.004,.004]],
  lift(z){if(z<=0)return 0;const t=Math.min(z,.38)/.38;return .22*t*t*(3-2*t)},
  curve(z){return z<.15?Math.sin(z*3.4+.6)*.06*Math.min(1,(.15-z)*3):0}};
WY137.top=function(z){let r=.01;const B=WY137.body;for(let i=0;i<B.length-1;i++)if(z>=B[i][0]&&z<=B[i+1][0]){const t=(z-B[i][0])/(B[i+1][0]-B[i][0]);r=B[i][1]+(B[i+1][1]-B[i][1])*t}
  return {x:WY137.curve(z),y:r*.74+.006+WY137.lift(z),r,top:r*.74+.006+WY137.lift(z)+r*.88}};
LPR.Gravewyrm={
  head:['head',0,.46,.55],up:.1,
  back:[['chest',0,.3,.2],['spine',0,.32,0],['pelvis',0,.33,-.27],['tail0',0,.3,-.52]],
  geo(C,c){const sp=rv137('Gravewyrm',c),ven=sp=='Venomcoil';
    const main=lpMain(C,.15),back=main.clone().multiplyScalar(ven?.45:.6),belly=new THREE.Color(ven?0xd8d0a0:0xc4bb94),
      band=ven?new THREE.Color(0xe8d860):new THREE.Color(0xd0c8a8),blot=main.clone().lerp(new THREE.Color(0x14140c),.6);
    const rings=WY137.body.map(q=>{const z=q[0],r=q[1],ryB=r*.74;return {p:[WY137.curve(z),ryB+.006+WY137.lift(z),z],rx:r,ryT:r*.88,ryB,b:wyrmBones(z),z}})
      .concat(WY137.head.map(q=>({p:[0,q[1],q[0]],rx:q[2],ryT:q[3],ryB:q[4],b:q[0]<.47?['neck','head',.6]:['head','head',0],hd:1,z:q[0]})));
    return lpGeo('WY137|'+sp+'|'+C,'Gravewyrm',[{rings,seg:12,capA:1,capB:1,paint:(o,r,s,cc,i)=>{
      if(s<-.5){o.copy(belly);if(i%2)o.multiplyScalar(.8);return}            // belly scutes
      o.copy(main);
      if(r.hd){if(s>.35)o.lerp(back,.6);if(s<-.1)o.lerp(belly,.5);return}
      const z=r.z,bandOn=ven?(Math.floor((z+2)*7.5)%3==0):(Math.floor((z+2)*9)%2==0);
      if(ven){if(bandOn&&z<.25)o.copy(band).lerp(main,.25);else if(s>.55)o.copy((Math.round(z*30)+Math.round(Math.abs(cc)*5))%3==0?back.clone().multiplyScalar(.55):back);else if(s<-.2)o.lerp(belly,.35);else if((i+Math.round(cc*4))%4==0)o.lerp(back,.5)}
      else{if(s>.62)o.copy(i%2?back:back.clone().lerp(band,.25));else if(bandOn&&s>-.4)o.copy(band).lerp(main,.45);else if(i%2==0&&s>-.3)o.copy(blot)}
    }}]);
  },
  kit(k,c,C,red){const sp=rv137('Gravewyrm',c),ven=sp=='Venomcoil';
    const bone=0xd8d0b8,bone2=0xb0a68c,eye=red?0xff2a2a:ven?0x9aff3a:0xe8c020,main=lpMain(C,.15).getHex(),dk=dkShade(main,.4);
    // lower jaw: a wedge on the jaw bone with a red mouth and a forked tongue
    k.p('jaw','cone4','c',dkShade(0xc4bb94,.9),0,.302,.61,.1,.36,.03,Math.PI/2);
    k.p('jaw','box','c',0x5a1418,0,.318,.62,.1,.01,.2);
    k.L('jaw','c',0xb03a4a,[0,.32,.6],[0,.322,.86],.012,.005,4);
    [-1,1].forEach(s=>{k.L('jaw','c',0xb03a4a,[0,.322,.86],[s*.02,.324,.9],.007,.002,3);
      // eyes looking forward: socket, glowing slit eye, highlight, a heavy brow ridge
      k.p('head','sph','c',0x0a0908,s*.095,.405,.66,.036,.03,.036,0,s*.55,0);
      k.p('head','sph','g',eye,s*.1,.406,.668,.03,.025,.03,0,s*.55,0);
      k.p('head','box','c',0x050403,s*.104,.406,.692,.004,.022,.004,0,s*.55,0);
      k.p('head','box','c',ven?dk:bone2,s*.085,.44,.64,.06,.016,.09,.15,s*.45,s*.25);
      // nostrils
      k.p('head','sph','c',0x0a0908,s*.022,.392,.85,.008,.006,.008);
      // fangs
      k.p('head','cone4','c',0xf4eee0,s*.05,.312,.79,.012,ven?.085:.06,.012,Math.PI+.15,0,0);
      k.p('head','cone4','c',0xf4eee0,s*.08,.322,.71,.009,.04,.009,Math.PI)});
    if(!ven){
      // skull plate over the head with bone horns sweeping back, cheek spurs
      k.p('head','sph','c',bone,0,.45,.6,.11,.03,.15,-.06,0,0);k.p('head','sph','c',bone2,0,.455,.53,.08,.025,.06);
      [-1,1].forEach(s=>{k.L('head','c',bone,[s*.08,.45,.5],[s*.17,.52,.34],.032,.006,5).L('head','c',bone2,[s*.17,.52,.34],[s*.2,.5,.22],.012,.002,4);
        k.L('head','c',bone,[s*.135,.37,.5],[s*.21,.35,.4],.02,.003,4)});
      // vertebra plates down the spine and rib bands down the flanks; tufts of grave moss
      for(let z=.3,i=0;z>-1.42;z-=.12,i++){const T=WY137.top(z),bn=wyrmBones(z)[0];
        k.L(bn,'c',i%2?bone:bone2,[T.x,T.top-.02,z+.03],[T.x,T.top+T.r*.38,z-.06],T.r*.3,.004,4);
        if(i%2==0&&z<.15&&z>-1.2)[-1,1].forEach(s=>k.L(bn,'c',bone2,[T.x+s*T.r*.55,T.top-T.r*.25,z],[T.x+s*T.r*.95,T.y-T.r*.15,z-.02],.012,.008,3));
        if(i%3==1&&z<0)k.p(bn,'dod','c',0x4a5a2a,T.x+(i%2?.05:-.05),T.top-.01,z,.03,.018,.03)}
      k.L('tail3','c',bone,[WY137.curve(-1.6),.02,-1.58],[WY137.curve(-1.72),.03,-1.74],.02,.002,4)}
    else{
      // the hood: a broad lens flaring behind the head; a pale front with dark throat bands, a ribbed back with the
      // spectacle mark, a rim of small scales
      const T=WY137.top(.3),hz=.33,hy=T.y+.05,pale=dkShade(0xd8d0a0,.95),dkr=0x14140c,rx=-.25,cr=Math.cos(rx),sr=Math.sin(rx);
      const H=(x,y,dz)=>[x,hy+y*cr,hz+dz-y*sr];
      k.p('neck','sph','c',main,0,hy,hz,.27,.24,.035,rx,0,0);
      k.p('neck','sph','c',pale,0,hy-.01,hz+.012,.22,.19,.026,rx,0,0);
      for(let i=0;i<4;i++){const y=-.12+i*.06,w=.2*Math.sqrt(Math.max(0,1-(y/.19)**2));k.L('neck','c',0x8a7a50,H(-w,y,.04),H(w,y,.04),.006,.006,3)}
      for(let i=0;i<20;i++){const a=i/20*Math.PI*2;const p=H(Math.sin(a)*.262,Math.cos(a)*.232,0);k.p('neck','dod','c',i%2?dk:mdSh(main,.7),p[0],p[1],p[2],.011,.011,.008)}
      for(let i=0;i<7;i++){const a=(i/6-.5)*2.4;k.L('neck','c',dk,H(0,-.02,-.03),H(Math.sin(a)*.24,Math.cos(a)*.21-.02,-.03),.008,.003,3)}
      [-1,1].forEach(s=>{const e=H(s*.075,.04,-.034);k.p('neck','tor','c',dkr,e[0],e[1],e[2],.048,.014,.048,Math.PI/2+rx,0,0);
        k.p('neck','sph','c',0xe8d860,e[0],e[1],e[2]-.002,.03,.03,.006,rx,0,0);k.p('neck','sph','c',dkr,e[0],e[1],e[2]-.004,.012,.012,.004,rx,0,0)});
      {const a=H(-.075,.08,-.033),b=H(.075,.08,-.033),m=H(0,.105,-.033);k.L('neck','c',dkr,a,m,.01,.01,3).L('neck','c',dkr,m,b,.01,.01,3)}
      // big head plates, cheek venom glands, heat pits
      [[0,.462,.6,.05,.012,.06],[-.035,.458,.68,.03,.01,.04],[.035,.458,.68,.03,.01,.04],[0,.452,.74,.04,.01,.035]].forEach(q=>k.p('head','box','c',dk,q[0],q[1],q[2],q[3],q[4],q[5],-.08,0,0));
      [-1,1].forEach(s=>{k.p('head','sph','c',mdSh(main,1.15),s*.11,.37,.6,.045,.04,.07);k.p('head','sph','c',dkr,s*.05,.4,.81,.007,.006,.006)});
      // a ridge of keeled scales down the back
      for(let z=.18,i=0;z>-1.45;z-=.09,i++){const T2=WY137.top(z),bn=wyrmBones(z)[0];k.p(bn,'dod','c',i%2?dk:dkr,T2.x,T2.top-.004,z,.022,.014,.03)}
      // a crest of small scales on the head, and a rattle on the tail
      for(let i=0;i<4;i++)k.p('head','cone4','c',dk,0,.45-i*.006,.62-i*.05,.02,.03,.025,-.5);
      for(let i=0;i<5;i++){const z=-1.56-i*.035,r=.03-i*.004;k.p('tail3','sph','c',i%2?0xc8b890:0xa89870,WY137.curve(z),.04,z,r,r*.8,.022)}}
  }};
