// ================= v56: humanoid designs for the portal-map monsters and the two humanoid bosses =================
function dkSnakeHead(k,sk,eye){const sd=dkShade(sk,.65);
  k.p('head','sph','c',sk,0,1.15,.04,.1,.09,.15).p('head','box','c',sd,0,1.13,.17,.09,.06,.08).p('head','box','c',dkShade(sk,1.15),0,1.095,.12,.08,.03,.12);
  k.p('head','cone4','c',sd,0,1.14,-.06,.24,.34,.04,-.12,0,0).p('head','cone4','c',dkShade(sk,.45),0,1.14,-.07,.18,.28,.03,-.12,0,0);
  [-1,1].forEach(s=>{k.p('head','sph','c',0x050404,s*.06,1.18,.12,.03,.022,.024);k.p('head','box','g',eye,s*.062,1.18,.135,.008,.026,.006);k.p('head','box','c',sd,s*.06,1.205,.12,.05,.014,.05,0,0,s*.3);
    k.p('head','cone4','c',0xe8e0c8,s*.03,1.08,.2,.007,.04,.007,Math.PI)});
  k.L('head','c',0xb02030,[0,1.09,.22],[0,1.09,.3],.006,.004,3);for(let i=0;i<6;i++)k.p('head','sph','c',sd,(i%2?.04:-.04),1.22-i*.012,.0-i*.03,.02,.008,.02);
  k.L('pelvis','c',sk,[0,.52,-.1],[0,.3,-.42],.08,.06).L('pelvis','c',sk,[0,.3,-.42],[0,.1,-.7],.06,.035).L('pelvis','c',sd,[0,.1,-.7],[.1,.04,-.98],.035,.008)}
function dkTrollHead(k,sk,eye){const sd=dkShade(sk,.7);
  k.p('head','box','c',sd,0,1.18,.09,.2,.04,.06,.25);[-1,1].forEach(s=>{k.p('head','sph','c',0x050404,s*.042,1.145,.098,.026,.018,.02);k.p('head','box','g',eye,s*.042,1.145,.11,.02,.008,.006);
    k.p('head','cone4','c',0xe8e0c8,s*.06,1.1,.11,.02,.11,.02,0,0,-s*.25);k.p('head','cone4','c',sk,s*.14,1.17,-.02,.03,.12,.02,0,0,-s*1.2)});
  k.p('head','cone4','c',sk,0,1.13,.15,.03,.12,.03,Math.PI/2+.2);k.p('head','box','c',0x14080a,0,1.07,.1,.09,.035,.03);
  for(let i=0;i<7;i++)k.p('head','cone4','c',0xc8e8ff,(i-3)*.035,1.25-Math.abs(i-3)*.01,-.02,.025,.16,.025,-.6,0,(i-3)*.18)}
function dkFurCoat(k,col,n){const R=dkRng(5);for(let i=0;i<n;i++){const bn=['chest','spine','pelvis','aL0','aR0','lh0','rh0'][i%7],y={chest:.9,spine:.68,pelvis:.52,aL0:.88,aR0:.88,lh0:.42,rh0:.42}[bn],
    x={aL0:-.24,aR0:.24,lh0:-.1,rh0:.1}[bn]||0,a=R()*6.283,r=bn=='chest'||bn=='spine'||bn=='pelvis'?.2:.08;k.p(bn,'cone4','c',i%3?col:dkShade(col,.85),x+Math.cos(a)*r,y+(R()-.5)*.12,Math.sin(a)*r*.75,.04,.13,.04,Math.sin(a)*1.2+.3,0,-Math.cos(a)*1.2)}}
function dkRockBody(k,col,core){const R=dkRng(9),cd=dkShade(col,.75);
  k.p('chest','dod','c',col,0,.86,0,.24,.2,.17).p('spine','dod','c',cd,0,.66,0,.18,.12,.14).p('pelvis','dod','c',col,0,.52,0,.18,.1,.13).p('head','dod','c',col,0,1.15,.02,.12,.12,.11);
  [-1,1].forEach(s=>{k.p('head','box','g',core,s*.045,1.16,.115,.035,.012,.008,0,0,s*.3);const a=DKA(s),l=DKL(s)+'h';
    k.p(a+'0','dod','c',cd,s*.27,.98,0,.12).p(a+'0','dod','c',col,s*.24,.86,0,.07).p(a+'1','dod','c',col,s*.245,.7,0,.075).p(a+'2','dod','c',cd,s*.26,.54,.02,.09);
    k.p(l+'0','dod','c',col,s*.1,.42,0,.09).p(l+'1','dod','c',cd,s*.1,.2,.01,.08).p(l+'2','dod','c',col,s*.1,.05,.04,.08,.06,.1)});
  k.p('chest','oct','g',core,0,.86,.14,.07);for(let i=0;i<8;i++){const a=i/8*6.283;k.p('pelvis','cone4','c',dkShade(col,.9),Math.cos(a)*.16,.32,Math.sin(a)*.12,.05,.28,.05,Math.PI+Math.sin(a)*.3,0,Math.cos(a)*.3)}
  for(let i=0;i<6;i++)k.p('chest','dod','c',dkShade(col,.9+R()*.2),(R()-.5)*.35,.95+R()*.15,(R()-.5)*.2,.05+R()*.03)}
function dkVampFace(k,sk,hair){const sd=dkShade(sk,.7);
  [-1,1].forEach(s=>{k.p('head','box','c',0x0b0807,s*.038,1.143,.103,.03,.011,.012);k.p('head','box','g',0xff2030,s*.038,1.143,.11,.02,.007,.006);k.p('head','box','c',hair,s*.04,1.163,.104,.044,.013,.016,0,0,s*.35);
    k.p('head','cone4','c',0xf0ece4,s*.016,1.083,.104,.006,.024,.006,Math.PI);k.p('head','box','c',sd,s*.07,1.115,.09,.02,.045,.02)});
  k.p('head','box','c',sd,0,1.122,.112,.016,.04,.02,-.15).p('head','box','c',0x4a0a10,0,1.094,.104,.034,.006,.008);
  k.p('head','hem','c',hair,0,1.15,-.02,.122,.13,.13,-.45).p('head','cone4','c',hair,0,1.2,.11,.03,.06,.01,Math.PI*.9)}
function dkNewKit(key,L){
  const k=dkKit(),sk=dkShade(dkHex(L.skin),.82),lt=0x2a1d14,M1=0x3a3c44,M2=0x5e626c,bronze=0x8a6a2a,crim=0x6a0c16,crim2=0x3a0610,gold=0x9a7a30;
  if(key=='nagaw'||key=='nagaa'||key=='nagas'){dkSnakeHead(k,sk,0xffd020);dkClawFeet(k,sk);
    if(key=='nagaw'){for(let r=0;r<4;r++)for(let c=0;c<5;c++)k.p('chest','box','m',r%2?bronze:dkShade(bronze,.8),-.12+c*.06,.72+r*.075,.15-Math.abs(c-2)*.012,.065,.07,.012,.15);
      k.p('chest','tor','c',0x2a3a20,0,.83,.0,.205,.3,.145);dkPauldron(k,-1,bronze,dkShade(bronze,1.3),true,2);dkBelt(k,lt,bronze);dkLoin(k,0x3a4a2a,4,1);[-1,1].forEach(s=>k.p(DKA(s)+'1','ring','m',bronze,s*.245,.68,0,.058,.5,.058))}
    else if(key=='nagaa'){k.p('chest','tor','c',0x4a3a22,0,.83,.006,.212,.3,.148);k.p('chest','box','c',0x1a120c,0,.84,.146,.04,.34,.01,0,0,.55);dkCollar(k,0x5a4a30,11);dkBelt(k,lt,0x6a6a6a);
      k.L('chest','c',0x3a2414,[-.05,.66,-.16],[.12,1.04,-.2],.05,.055,7);for(let i=0;i<3;i++){const x=.09+i*.025;k.L('chest','c',0x6a5030,[x,1.0,-.2],[x+.07,1.14,-.23],.006,.006,4);k.p('chest','cone4','c',0x2a6a2a,x+.07,1.14,-.23,.02,.06,.006,0,0,-.4)}dkLoin(k,0x4a3a22,4,2)}
    else{dkSkirt(k,0x1a3a3a,.6,.5,.28,11,2);k.p('chest','tor','c',0x163030,0,.83,.006,.212,.3,.148);dkTeethNeck(k,0xe8e0c8);for(let i=0;i<5;i++)k.p('head','cone4','c',[0x2a8a6a,0xd8c060,0x2a6a8a][i%3],-.08+i*.04,1.3,-.06,.02,.16,.008,-.4,0,(i-2)*.25);
      [-1,1].forEach(s=>k.L(DKA(s)+'1','c',0x1a3a3a,[s*.243,.77,0],[s*.255,.6,0],.055,.085,8))}}
  else if(key=='troll'||key=='trollsh'){dkTrollHead(k,sk,0x6ad8ff);dkClawFeet(k,sk);
    [-1,1].forEach(s=>{const a=DKA(s);k.p(a+'1','ring','c',0xd8dce4,s*.245,.66,0,.06,.6,.06);k.p(a+'2','box','c',sk,s*.255,.55,.012,.07,.085,.075);for(let f=0;f<3;f++)k.p(a+'2','cone4','c',0x2a2a30,s*.255+(f-1)*.02,.49,.03,.01,.05,.01,Math.PI);
      k.p(a+'0','cone4','m',0xbfeaff,s*.27,1.05,0,.04,.16,.04,0,0,-s*.5)});
    if(key=='troll'){dkLoin(k,0xc8ccd4,5,3);dkCollar(k,0xd8dce4,13);k.p('spine','ring','c',lt,0,.6,0,.17,.6,.125);k.p('spine','sph','c',0xd8d0b0,0,.6,.135,.04,.04,.035)}
    else{dkSkirt(k,0x22304a,.6,.48,.27,11,4);k.p('chest','hem','c',0x1a2238,0,.93,0,.25,.1,.17);[-1,1].forEach(s=>k.L('head','c',0x8a8270,[s*.08,1.24,-.02],[s*.18,1.36,-.08],.022,.012).L('head','c',0x8a8270,[s*.18,1.36,-.08],[s*.2,1.46,-.04],.012,.002));k.p('chest','oct','g',0x9ad8ff,0,.8,.16,.03,.045,.02)}}
  else if(key=='yeti'){const fur=0xd8dce4;dkFurCoat(k,fur,90);
    k.p('head','sph','c',0x5a6a7a,0,1.13,.07,.08,.08,.06);[-1,1].forEach(s=>{k.p('head','box','c',0x050505,s*.04,1.16,.12,.03,.016,.012);k.p('head','box','g',0x7ad8ff,s*.04,1.16,.127,.02,.008,.006);
      k.L('head','c',0xb8ad90,[s*.08,1.22,0],[s*.18,1.3,-.04],.03,.02).L('head','c',0xb8ad90,[s*.18,1.3,-.04],[s*.2,1.4,.02],.02,.003);k.p(DKA(s)+'2','box','c',0x5a6a7a,s*.255,.54,.02,.08,.09,.08);
      for(let f=0;f<3;f++)k.p(DKA(s)+'2','cone4','c',0x1a1a20,s*.255+(f-1)*.025,.47,.05,.014,.07,.014,Math.PI-.3)});
    k.p('head','box','c',0x14080a,0,1.09,.12,.07,.03,.02);for(let i=-2;i<=2;i++)k.p('head','cone4','c',0xe8e0c8,i*.016,1.1,.125,.007,.03,.007,Math.PI);dkClawFeet(k,0x5a6a7a)}
  else if(key=='selem'){dkRockBody(k,0xc8a060,0xffa030)}
  else if(key=='ghoul'){dkGoblinHead(k,sk,0x9aff6a);[-1,1].forEach(s=>{for(let f=0;f<4;f++)k.L(DKA(s)+'2','c',dkShade(sk,.7),[s*.255+(f-1.5)*.014,.52,.02],[s*.26+(f-1.5)*.02,.42,.06],.008,.004,4)});
    for(let i=0;i<4;i++)k.p('chest','ring','c',0xb8ad90,0,.76+i*.05,0,.19-i*.01,.25,.135);dkLoin(k,0x2a2a24,5,5);dkClawFeet(k,sk);k.L('head','c',0x6a1a1a,[0,1.08,.11],[0,.98,.16],.012,.006,4)}
  else if(key=='vamp'||key=='vampm'){dkVampFace(k,sk,0x0a0808);
    if(key=='vamp'){k.p('chest','tor','c',crim2,0,.83,.006,.212,.3,.148);k.p('chest','box','m',gold,0,.86,.15,.02,.24,.008);[-1,1].forEach(s=>k.p('chest','box','c',crim,s*.07,.85,.15,.05,.3,.01,0,0,-s*.12));dkHighCollar(k,crim,false);dkGloves(k,0x1a0a10,crim);dkBoots(k,0x140a0c,crim);dkBelt(k,0x1a0a0c,gold);dkCapeEnds(k,crim,8)}
    else{dkHood(k,crim2,true,0xff2030,true);dkSkirt(k,crim2,.6,.5,.28,12,6);k.p('chest','tor','c',crim,0,.83,.006,.212,.3,.148);dkHighCollar(k,crim,true);k.p('chest','oct','g',0xff2030,0,.8,.16,.03,.045,.02);
      [-1,1].forEach(s=>k.L(DKA(s)+'1','c',crim2,[s*.243,.77,0],[s*.255,.6,0],.055,.09,8))}}
  else if(key=='vampk'||key=='vlord'){const K1=key=='vlord'?0x2a1a20:0x24181c,K2=key=='vlord'?0x6a2a30:0x4a2a30;
    if(key=='vampk'){k.p('head','cyl','m',K1,0,1.15,.004,.116,.17,.124).p('head','hem','m',K1,0,1.235,.004,.116,.06,.124).p('head','box','g',0xff2030,0,1.152,.126,.13,.013,.01).p('head','box','m',K2,0,1.14,.128,.018,.12,.012);
      [-1,1].forEach(s=>{for(let i=0;i<3;i++)k.p('head','box','m',K2,s*(.13+i*.012),1.2+i*.035,-.02-i*.015,.012,.12-i*.02,.06,-.3,0,-s*(.6+i*.25))})}
    else{dkVampFace(k,sk,0x0a0808);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;k.p('head','cone4','m',gold,Math.cos(a)*.1,1.27,Math.sin(a)*.1,.018,.1,.018)}k.p('head','ring','m',gold,0,1.23,0,.11,.35,.12);k.p('head','oct','g',0xff2030,0,1.25,.115,.02)}
    [-1,1].forEach(s=>dkPauldron(k,s,K1,K2,key=='vlord',3));dkCuirass(k,K1,K2,gold);dkPlateArms(k,K1,K2);dkPlateLegs(k,K1,K2);k.p('pelvis','skirt','m',crim2,0,.47,0,.22,.18,.158);
    dkHighCollar(k,crim,key=='vlord');for(let i=0;i<11;i++){const x=-.24+i*.048;k.S('chest',i%2?crim:crim2,x,1.0,-.15-Math.abs(x)*.1,.06,.7+((i*5)%4)*.08,0,.14,i)}k.S('pelvis',crim,0,.6,.14,.12,.36,0,-.06,4)}
  else if(key=='abom'){const fl=sk,st=0x2a1a14;
    k.p('spine','sph2','c',fl,0,.68,.08,.34,.32,.3).p('chest','sph2','c',dkShade(fl,.9),0,.92,.02,.3,.2,.24).p('head','sph','c',fl,0,1.13,.03,.1,.1,.1);
    for(let i=0;i<9;i++){const y=.5+i*.06;k.p('spine','box','c',st,(i%2?.1:-.1),y,.3+Math.sin(i)*.03,.12,.008,.01,0,0,(i%2?.3:-.3))}
    k.L('spine','c',st,[-.2,.85,.25],[.15,.5,.33],.008,.008,3);for(let i=0;i<5;i++)k.p('spine','box','c',st,-.2+i*.09,.84-i*.088,.27+i*.015,.008,.05,.01,0,0,.8);
    [-1,1].forEach(s=>{k.p('head','sph','c',0x050404,s*.035,1.15,.1,.02);k.p('head','box','g',0xffd040,s*.035,1.15,.115,.014,.006,.005);k.p('pelvis','sph','c',fl,s*.12,.48,.02,.14,.12,.13)});
    k.p('head','box','c',0x3a0a0a,0,1.08,.11,.07,.03,.02);for(let i=0;i<4;i++){const a=i/4*Math.PI*2;k.L('chest','m',0x5a5a60,[Math.cos(a)*.24,1.0,Math.sin(a)*.18],[Math.cos(a)*.3,.75,Math.sin(a)*.25],.012,.012,4);k.p('chest','cone4','m',0x6a6a70,Math.cos(a)*.3,.72,Math.sin(a)*.25,.02,.07,.02,Math.PI)}
    dkLoin(k,0x4a4030,5,7);dkClawFeet(k,fl);dkGloves(k,0x3a2a1a,0x1a1210)}
  else return null;
  return k}

