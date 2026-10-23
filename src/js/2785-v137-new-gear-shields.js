// ================= v137: the 8 new Paladin shields =================
// Same frame as the v83 shield: centred on the grip, the face in x-y, about .95 across, so the arm, block poses and the
// MD_SHIELD scale fit. The face is dressed on both sides (the picture looks at +z, the hero shows -z to the world).
var SH137={};
function s7Both(k,fn){[-1,1].forEach(s=>fn(s))}
// a shaped shield board: outline P (x, y), thickness th, rim tube of the outline, planks optional
function s7Board(k,key,P,th,col,rim,rimR){k.p('',lgSlab('s7'+key,P,th),'c',col,0,0,0,1,1,1);if(rim!=null)for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];k.L('','m',rim,[a[0],a[1],0],[b[0],b[1],0],rimR||.022,rimR||.022,5)}}
function s7Arc(cx,cy,r,a0,a1,n){const o=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}return o}
SH137.sh_coffin=(k,c)=>{const P=[[-.16,.48],[.16,.48],[.26,.26],[.18,-.48],[-.18,-.48],[-.26,.26]];s7Board(k,'cof',P,.05,0x4a3a2a,0x2a2a30,.018);
  s7Both(k,s=>{for(let i=-2;i<=2;i++)k.p('','box','c',i%2?0x3a2c20:0x52402c,i*.09,0,s*.027,.004,.9,.004);k.p('','box','m',0x3a3a40,0,.12,s*.03,.06,.5,.008);k.p('','box','m',0x3a3a40,0,.22,s*.03,.34,.06,.008);
    for(let i=0;i<8;i++){const a=i/8;k.p('','oct','m',0x5a5a60,(a<.5?-1:1)*(.2-Math.abs(a-.5)*.1),.4-(i%4)*.25,s*.03,.012)}if(c.gl)k.p('','oct','g',c.gl,0,.22,s*.036,.02,.026,.006)})};
SH137.sh_ossuary=(k,c)=>{const P=[[0,.5],[.3,.32],[.26,-.1],[0,-.52],[-.26,-.1],[-.3,.32]];s7Board(k,'oss',P,.05,0x5a5048,0xc8bca0,.02);
  s7Both(k,s=>{gkSkull(k,'',0,.24,s*.03,3.2,c.bone,s<0?Math.PI:0,null);for(let i=0;i<4;i++)[-1,1].forEach(q=>{const y=.04-i*.09;k.L('','c',c.bone,[q*.02,y,s*.032],[q*(.22-i*.04),y-.03,s*.03],.012,.008,5)});
    k.L('','c',c.bone,[0,.1,s*.034],[0,-.36,s*.034],.016,.012,5);[[-.18,.36],[.18,.36]].forEach(([x,y])=>gkSkull(k,'',x,y,s*.03,1.4,0xc8bca0,s<0?Math.PI:0,null))})};
SH137.sh_thorn=(k,c)=>{const P=[[-.3,.44],[.3,.44],[.3,.1],[.2,-.22],[0,-.5],[-.2,-.22],[-.3,.1]];s7Board(k,'thr',P,.05,0x3a3e3a,0x5a5e5a,.02);
  s7Both(k,s=>{for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];for(let j=0;j<4;j++){const t=(j+.5)/4,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;k.L('','c',0x2a3a1e,[x*.9,y*.9,s*.03],[x*.9+.03,y*.9+.02,s*.03],.01,.01,4);k.p('','cone4','c',0x4a3a24,x*.9,y*.9,s*.04,.006,.03,.006,s*Math.PI/2)}}
    k.p('','sph','c',0x8a1424,0,.04,s*.04,.06,.06,.035);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;k.p('','sph','c',0x6a0a18,Math.cos(a)*.045,.04+Math.sin(a)*.045,s*.035,.035,.03,.02)}
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;k.p('','oct','c',0x2a4a1e,Math.cos(a)*.11,.04+Math.sin(a)*.11,s*.03,.04,.016,.006,0,0,a)}})};
SH137.sh_saint=(k,c)=>{const P=[[-.26,-.5],[.26,-.5],[.26,.3]].concat(s7Arc(0,.3,.26,0,Math.PI,8).slice(1,-1)).concat([[-.26,.3]]);s7Board(k,'snt',P,.06,0x8a8478,0xc8a050,.02);
  s7Both(k,s=>{k.p('','sph2','c',0xc8c0b0,0,.14,s*.03,.12,.15,.05);[-1,1].forEach(q=>{k.p('','box','c',0x6a6458,q*.045,.17,s*.07,.04,.012,.01,0,0,q*.25);k.p('','box','c',0x4a4438,q*.045,.15,s*.075,.022,.01,.006);
      k.L('','g',c.gl||0xa0d8ff,[q*.045,.14,s*.078],[q*.05,-.02,s*.06],.006,.003,3);k.p('','sph','g',c.gl||0xa0d8ff,q*.05,-.04,s*.06,.008)});k.p('','box','c',0x6a6458,0,.07,s*.075,.05,.008,.006);
    k.p('','ring','g',0xffe8a0,0,.2,s*.02,.18,.08,.18,Math.PI/2);for(let i=0;i<3;i++)k.p('','box','c',0xe8e0d0,-.12+i*.12,-.3,s*.034,.08,.12,.004,0,0,(i-1)*.1);
    for(let i=0;i<3;i++)k.p('','box','c',0x8a1a1a,-.12+i*.12,-.22,s*.036,.03,.03,.008)})};
SH137.sh_lantern=(k,c)=>{const P=[];for(let i=0;i<16;i++){const a=i/16*Math.PI*2;P.push([Math.cos(a)*.46,Math.sin(a)*.46])}s7Board(k,'lan',P,.06,0x2a2a30,0x4a4a54,.026);
  s7Both(k,s=>{k.p('','cyl','g',c.gl||0xffc060,0,0,s*.03,.14,.01,.14,Math.PI/2);for(let i=-2;i<=2;i++){k.p('','box','m',0x1a1a1e,i*.055,0,s*.038,.012,.28,.012);k.p('','box','m',0x1a1a1e,0,i*.055,s*.038,.28,.012,.012)}
    k.p('','ring','m',c.fit,0,0,s*.035,.15,.2,.15,Math.PI/2);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;k.p('','box','m',0x3a3a40,Math.cos(a)*.3,Math.sin(a)*.3,s*.034,.12,.03,.01,0,0,a)}
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.p('','oct','m',0x5a5a60,Math.cos(a)*.41,Math.sin(a)*.41,s*.034,.014)}})};
SH137.sh_moon=(k,c)=>{const P=[];for(let i=0;i<16;i++){const a=i/16*Math.PI*2;P.push([Math.cos(a)*.44,Math.sin(a)*.44])}s7Board(k,'mon',P,.055,0x1e1a20,0x5a4a50,.024);
  [-1,1].forEach(q=>{const W=[[0,0],[.12,.1],[.22,.26],[.3,.18],[.26,.08],[.22,.12],[.18,-.02],[.12,.04],[.06,-.06]];k.p('',lgSlab('s7mw',W,.03),'m',0x2a2228,q*.38,.1,0,q,1,1)});
  s7Both(k,s=>{k.p('','cyl','c',0x8a1018,0,.04,s*.03,.22,.012,.22,Math.PI/2);k.p('','cyl','c',0x1e1a20,.08,.08,s*.036,.18,.01,.18,Math.PI/2);if(c.gl)k.p('','ring','g',c.gl,0,.04,s*.036,.22,.06,.22,Math.PI/2);
    for(let i=0;i<5;i++){const a=-1.2+i*.3;k.L('','c',0x6a0a10,[Math.cos(a)*.2,.04+Math.sin(a)*.2,s*.036],[Math.cos(a)*.21,.04+Math.sin(a)*.2-.08-i%2*.04,s*.036],.008,.003,3)}})};
SH137.sh_gorgon=(k,c)=>{const BZ=0xa8783a,P=[];for(let i=0;i<16;i++){const a=i/16*Math.PI*2;P.push([Math.cos(a)*.45,Math.sin(a)*.45])}s7Board(k,'gor',P,.055,lgCol(BZ,0,.25),BZ,.024);
  s7Both(k,s=>{k.p('','sph2','m',BZ,0,0,s*.03,.13,.15,.06);[-1,1].forEach(q=>{k.p('','sph','g',c.gl||0x9aff5a,q*.045,.03,s*.085,.018,.012,.008);k.p('','box','m',lgCol(BZ,0,.3),q*.045,.055,s*.085,.04,.01,.01,0,0,-q*.3)});
    k.p('','box','m',lgCol(BZ,0,.4),0,-.06,s*.085,.06,.012,.01);for(let i=0;i<12;i++){const a=i/12*Math.PI*2,p0=[Math.cos(a)*.13,Math.sin(a)*.14,s*.04],p1=[Math.cos(a+.25)*.25,Math.sin(a+.25)*.25,s*.04],p2=[Math.cos(a-.05)*.36,Math.sin(a-.05)*.36,s*.035];
      k.L('','m',i%2?lgCol(BZ,0x3a6a2a,.5):lgCol(BZ,0x2a4a1e,.4),p0,p1,.018,.014,5);k.L('','m',i%2?lgCol(BZ,0x3a6a2a,.5):lgCol(BZ,0x2a4a1e,.4),p1,p2,.014,.008,5);k.p('','sph','m',lgCol(BZ,0x2a4a1e,.4),p2[0],p2[1],p2[2],.016,.014,.012)}})};
SH137.sh_dawn=(k,c)=>{const G=0xd8b050,P=[[-.32,.46],[.32,.46],[.32,.08],[.22,-.24],[0,-.52],[-.22,-.24],[-.32,.08]];s7Board(k,'dwn',P,.06,0xe0d8c0,G,.026);
  [-1,1].forEach(q=>{for(let i=0;i<4;i++){const y=.42-i*.075,L=.16-i*.02,a=q*(.35+i*.14);k.p('','box','m',i%2?mdSh(G,.85):G,q*(.3+Math.cos(a)*L*.5-.01),y+Math.sin(Math.abs(a))*L*.5,0,L,.034,.028,0,0,a)}});
  s7Both(k,s=>{k.p('','cyl','m',G,0,.08,s*.03,.12,.012,.12,Math.PI/2);k.p('','cyl','g',c.gl||0xfff0b0,0,.08,s*.036,.07,.008,.07,Math.PI/2);
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;k.p('','cone4','m',G,Math.cos(a)*(i%2?.17:.2),.08+Math.sin(a)*(i%2?.17:.2),s*.03,.02,i%2?.06:.12,.006,0,0,a-Math.PI/2)}
    k.p('','box','m',G,0,-.25,s*.034,.025,.28,.008);k.p('','box','m',G,0,-.2,s*.034,.14,.025,.008)})};
