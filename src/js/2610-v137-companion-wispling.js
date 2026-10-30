// ================= v137: Wispling, Lumenwisp and Soulwarden rebuilt =================
// The v81 spirit wore the kit's lathe 'hood' — a hard black cone — over a translucent tube. Now each of the three spirits on
// the Wispling rig has its own body (rig variants, RV137 in 2600):
//  * a flowing robe that tapers into a ragged spirit tail, four trailing tendrils, wide bell sleeves with tattered cuffs;
//  * a real cowl (wsp137Hood): a soft hood that drapes over the shoulders, pleated, with a deep front opening that frames
//    the face, a rolled edge, a darker lining and a point bending back; inside, the dark void with slanted glowing eyes;
//  * Wispling: a small spirit flame on the hood's point and a glowing heart · Lumenwisp: a pale hood, a halo of light behind
//    the head and a lantern on a chain · Soulwarden: a horned hood, a bone mantle on the shoulders, spectral chains round
//    the waist and a soul-gem on the breast.
// The cowl keeps the size of the old hood, so the v100 evolution pieces (runes, circlet, halo, flames) still sit on it.
var WSP137={hood:{}};
// the cowl as one BufferGeometry in model space: rows round the head, the front opening cut out, plus the inside lining
function wsp137Hood(v,inset){const key=v+'|'+(inset||0);if(WSP137.hood[key])return WSP137.hood[key];
  const PR=v==2?[[.84,.196],[.88,.186],[.93,.168],[.98,.16],[1.03,.15],[1.08,.128],[1.13,.095],[1.18,.055],[1.215,.02],[1.23,.004]]
    :[[.84,.193],[.88,.176],[.93,.162],[.98,.156],[1.03,.146],[1.08,.124],[1.13,.09],[1.17,.052],[1.2,.022],[1.215,.004]];
  const N=24,rows=PR.map(([y,r],i)=>{const t=i/(PR.length-1),back=-.01-.06*t*t,ph=y>1.12?0:y<.9?0:Math.min(.95,.95*Math.sqrt(Math.max(0,1-((y-1.0)/.12)**2)));
    const row=[];for(let j=0;j<=N;j++){const a=j/N*Math.PI*2,fold=.007*Math.sin(a*7+i)*(1-t),rr=Math.max(0,r+fold-(inset||0));row.push([Math.sin(a)*rr,y,back+Math.cos(a)*rr*(1+.05*(Math.cos(a)<0?1:0)),a])}return {row,ph}});
  const P=[];for(let i=0;i<rows.length-1;i++){const A=rows[i],B=rows[i+1];for(let j=0;j<N;j++){const a=(j+.5)/N*Math.PI*2,ca=Math.cos(a)>0?Math.min(a,Math.PI*2-a):9;
      if(ca<Math.max(A.ph,B.ph))continue;const p0=A.row[j],p1=A.row[j+1],p2=B.row[j],p3=B.row[j+1];P.push(...p0.slice(0,3),...p2.slice(0,3),...p1.slice(0,3),...p1.slice(0,3),...p2.slice(0,3),...p3.slice(0,3))}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.computeVertexNormals();
  // the rim of the opening (for the rolled edge)
  g.userData.rim=[];rows.forEach(R=>{if(R.ph>0){const a=R.ph,r=Math.hypot(R.row[0][0],R.row[0][2]-0);g.userData.rim.push([R.row[0][1],a])}});
  return WSP137.hood[key]=g}
function wsp137HoodR(v,y){const PR=v==2?[[.84,.196],[.88,.186],[.93,.168],[.98,.16],[1.03,.15],[1.08,.128],[1.13,.095],[1.18,.055],[1.215,.02],[1.23,.004]]
    :[[.84,.193],[.88,.176],[.93,.162],[.98,.156],[1.03,.146],[1.08,.124],[1.13,.09],[1.17,.052],[1.2,.022],[1.215,.004]];
  if(y<=PR[0][0])return PR[0][1];for(let i=1;i<PR.length;i++)if(y<=PR[i][0]){const k=(y-PR[i-1][0])/(PR[i][0]-PR[i-1][0]);return PR[i-1][1]+(PR[i][1]-PR[i-1][1])*k}return 0}
LPR.Wispling={
  head:['head',0,1.13,-.03],up:.1,
  back:[['chest',0,.86,-.15],['spine',0,.7,-.17],['pelvis',0,.52,-.16]],
  mat:{transparent:true,opacity:.72,depthWrite:false,emissive:0x0c2030},
  geo(C,c){const sp=rv137('Wispling',c),v=rv137I('Wispling',sp);
    const base=new THREE.Color(C),pale=base.clone().lerp(new THREE.Color(0xe4ecf0),v==1?.55:.28),deep=base.clone().lerp(new THREE.Color(v==2?0x0a0a14:0x1a2a3a),v==2?.7:.55);
    const paint=(o,r,s,cc)=>{o.copy(pale).lerp(deep,Math.min(1,Math.max(0,(.82-r.p[1])*1.25)));if(Math.abs(Math.sin((cc+s)*5+r.p[1]*14))>.9)o.multiplyScalar(.85)};
    const R=(x,y,z,rx,f,b,bn,j)=>({p:[x,y,z],rx,ryT:f,ryB:b,b:bn,j});
    const lofts=[{rings:[R(0,.9,0,.1,.1,.1,['neck','head',.5]),R(0,.86,0,.19,.16,.17,['chest','neck',.3]),R(0,.78,-.005,.21,.17,.19,['chest','chest',0],.01),R(0,.68,-.01,.195,.165,.18,['chest','spine',.5],.02),
        R(0,.58,-.02,.175,.15,.165,['spine','spine',0],.035),R(0,.48,-.035,.152,.13,.145,['pelvis','pelvis',0],.06),R(0,.38,-.065,.126,.11,.12,['tail0','tail0',0],.1),
        R(0,.27,-.12,.096,.085,.09,['tail1','tail1',0],.2),R(0,.16,-.2,.062,.055,.06,['tail2','tail2',0],.22),R(0,.07,-.29,.026,.024,.026,['tail3','tail3',0],.2),R(0,.03,-.335,.006,.006,.006,['tail3','tail3',0])],
      seg:14,ref:[0,0,1],capB:1,paint}];
    // trailing tendrils: two at the sides, two at the back
    [[-1,0],[1,0],[-.5,-1],[.5,-1]].forEach(([sx,sz],q)=>lofts.push({rings:[R(sx*.11,.5,sz*.08-.02,.06,.06,.06,['pelvis','pelvis',0]),R(sx*.15,.36,sz*.12-.08,.05,.05,.05,['tail0','tail0',0],.2),
      R(sx*.17,.23,sz*.16-.15,.032,.032,.032,['tail1','tail1',0],.2),R(sx*.18,.12-q*.01,sz*.2-.21,.009,.009,.009,['tail2','tail2',0])],seg:6,ref:[0,0,1],capB:1,paint}));
    // bell sleeves with tattered cuffs
    ['fl','fr'].forEach((k,i)=>{const s=i?1:-1;lofts.push({rings:[R(s*.13,.83,0,.065,.065,.065,['chest',k+'0',.5]),R(s*.19,.72,.04,.058,.058,.058,[k+'0',k+'1',.6]),
      R(s*.215,.63,.075,.075,.075,.075,[k+'1',k+'2',.6],.12),R(s*.225,.575,.09,.095,.095,.095,[k+'2',k+'2',0],.3)],seg:9,ref:[0,0,1],paint})});
    return lpGeo('WSP137|'+sp+'|'+C,'Wispling',lofts,53)},
  kit(k,c,C,red){const sp=rv137('Wispling',c),v=rv137I('Wispling',sp),base=new THREE.Color(C);
    const hood=v==1?base.clone().lerp(new THREE.Color(0xd8d4c8),.6).getHex():dkShade(base.clone().lerp(new THREE.Color(0x2a2a34),.72).getHex(),.6),
      lin=v==1?0x8a8070:0x0a0a10,trim=v==1?0xe8d8a0:v==2?0x8a8494:mdSh(hood,1.5),eye=red?0xff2a2a:v==1?0xfff0b0:v==2?0x7affd0:0x9ff0ff,glow=base.clone().lerp(new THREE.Color(0xffffff),.5).getHex();
    k.p('head',wsp137Hood(v,0),'c',hood,0,0,0,1,1,1);k.p('head',wsp137Hood(v,.006),'c',lin,0,0,0,1,1,1);
    // the rolled edge round the opening
    {const rim=[];for(let y=.9;y<=1.12;y+=.011){const ph=Math.min(.95,.95*Math.sqrt(Math.max(0,1-((y-1.0)/.12)**2))),r=wsp137HoodR(v,y)+.002,t=(y-.84)/.38,bz=-.01-.06*t*t;rim.push([Math.sin(ph)*r,y,bz+Math.cos(ph)*r])}
      const pts=rim.concat(rim.slice().reverse().map(p=>[-p[0],p[1],p[2]]));for(let i=0;i<pts.length-1;i++)k.L('head','c',trim,pts[i],pts[i+1],.008,.008,4)}
    // the void inside the hood and the eyes
    k.p('head','sph','c',0x020306,0,.95,.0,.115,.12,.1); // v173: the void fills the robe's neck (the hood hung over a gap)
    [-1,1].forEach(s=>{k.p('head','box','c',0x010204,s*.046,1.0,.085,.05,.032,.02,0,s*.3,s*.28);k.p('head','box','g',eye,s*.048,1.0,.097,.034,.012,.006,0,s*.3,s*.28);
      k.p('head','sph','g',mdSh(eye,1.2),s*.052,1.002,.1,.008,.006,.004)});
    // the glowing heart and wispy fingers
    k.p('chest','ico','g',glow,0,.72,.06,.05);k.L('chest','g',glow,[0,.74,.04],[0,.79,-.16],.008,.004,4); // v173: a soul thread holds the heart to the robe's back
    // a ghostly forearm out of each bell sleeve (from its wall), a palm and three wispy fingers (they hung in the sleeve's mouth)
    [['fl2',-.225],['fr2',.225]].forEach(f=>{const s=Math.sign(f[1]);k.L(f[0],'g',0xa8dcf8,[s*.214,.645,.072],[f[1],.545,.098],.074,.03,6);k.p(f[0],'sph','g',0xbfeaff,f[1],.54,.1,.036,.03,.038);
      [-1,0,1].forEach(i=>k.L(f[0],'g',0xbfeaff,[f[1]+i*.014,.53,.105],[f[1]+i*.025,.47,.125],.011,.002,4))});
    k.p('tail3','sph','g',glow,0,.04,-.33,.026);
    if(v==0){// a small spirit flame on the hood's point
      k.p('head','sph','g',0x9ff0ff,0,1.215,-.07,.026,.03,.026);k.L('head','g',0x9ff0ff,[0,1.22,-.07],[.01,1.3,-.1],.024,.002,6);k.L('head','g',0xffffff,[0,1.215,-.066],[0,1.26,-.08],.012,.001,4)}
    else if(v==1){// a halo of light behind the head, a lantern on a chain in the right hand
      for(let i=0;i<16;i++){const a=i/16*Math.PI*2,a2=(i+1)/16*Math.PI*2,r=.19;k.L('head','g',0xfff0b0,[Math.sin(a)*r,1.04+Math.cos(a)*r,-.2],[Math.sin(a2)*r,1.04+Math.cos(a2)*r,-.2],.008,.008,3)}
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2,r=.19;k.L('head','g',0xffe080,[Math.sin(a)*r,1.04+Math.cos(a)*r,-.2],[Math.sin(a)*(r+.05),1.04+Math.cos(a)*(r+.05),-.2],.006,.001,3)}
      const h=[.225,.55,.1],e=lk173Chain(k,'fr2','m',0xb8a870,[h[0],h[1]-.012,h[2]],4,.009),y=e[1]; // v173: links that hold together, the lantern on the last
      k.p('fr2','cyl','m',0xb8a870,h[0],y-.004,h[2],.03,.012,.03);k.p('fr2','oct','g',0xffe8a0,h[0],y-.039,h[2],.026,.042,.026);k.p('fr2','cone','m',0xb8a870,h[0],y-.084,h[2],.024,.022,.024,Math.PI)}
    else{// horns on the hood, a bone mantle, spectral chains, a soul-gem
      [-1,1].forEach(s=>{k.L('head','c',0xd0c8b8,[s*.09,1.1,-.06],[s*.16,1.2,-.14],.024,.012,5).L('head','c',0xa89a88,[s*.16,1.2,-.14],[s*.15,1.3,-.24],.012,.002,5);
        for(let i=0;i<4;i++){const a=s*(.5+i*.35);k.p('chest','hem','c',i%2?0xc8c0b0:0xe0d8c8,Math.sin(a)*.2,.87-i*.01,Math.cos(a)*.17-.01,.07,.025,.06,0,a,-s*.4)}});
      lk173Loop(k,'pelvis','m',0x7affd0,0,-.035,.158,.142,.5,34,.011,a=>Math.sin(a*2)*.02); // v173: a closed chain of linked rings round the waist
      k.p('chest','oct','g',0x7affd0,0,.8,.17,.028,.04,.016);k.p('chest','tor','m',0x8a8494,0,.8,.165,.04,.008,.04,Math.PI/2)}
  }};
