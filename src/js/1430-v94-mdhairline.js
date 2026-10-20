// =====================================================================================================
// hair region on the head shell: front hairline high, temples, nape low
function mdHairLine(m,lo){const s=m.s;return s>0?1.13+.065*s+(lo||0)*s:1.13-(1.13-1.055)*(-s)}
// P.look: normalised look; P.face options: {eyes:'human'|'glow'|'none', eye, brow, ears, nose, mouth, glow}
function mdHead(B,P,o){o=o||{};const H=mdHeadR(P);P._H=H;const sk=P.col.skin,lk=P.look||{},hair=mdC(lk.hair==null?0x3a2414:lk.hair);
  const stubble=lk.face==1,stC=mdMix(sk,hair,.42),bald=lk.hairStyle==5||o.bald,mo=lk.hairStyle==4,shav=mo?mdMix(sk,hair,.35):null;
  mdLoft(B,H,{seg:10,capA:true,capB:true,col:o.headCol||(m=>{if(stubble&&m.y<1.1&&m.s>.05)return stC;if(shav&&m.y>mdHairLine(m))return shav;if(o.paint)return o.paint(m)||sk;return sk})});
  if(o.noFace)return H;
  const k=dkKit(),ey=1.145,ez=mdHeadZ(P,ey),ex=.04*(P.head&&P.head.w||1);
  // eyes: dark socket, white, iris (eye colour)
  [-1,1].forEach(s=>{
    if(o.eyes=='glow'){k.p('head','box','c',0x080606,s*ex,ey,ez-.004,.034,.02,.012);k.p('head','box','g',o.glow||0xff3020,s*ex,ey,ez+.003,.024,.011,.008)}
    else if(o.eyes!='none'){k.p('head','box','c',mdSh(sk,.62),s*ex,ey,ez-.003,.034,.02,.012);k.p('head','box','c',0xf2eee6,s*ex,ey,ez+.002,.026,.013,.008);
      k.p('head','box','c',mdC(lk.eye==null?0x3a5a7a:lk.eye),s*(ex-.002),ey-.001,ez+.006,.012,.012,.006);k.p('head','box','c',0x0a0808,s*(ex-.002),ey-.001,ez+.0085,.006,.006,.004)}
    // brow
    if(o.brow!==false)k.p('head','box','c',o.brow!=null?o.brow:mdSh(hair,.9),s*ex,ey+.022,mdHeadZ(P,ey+.022)+.002,.04,.011,.014,0,0,s*(P.sex==1?.12:.2));
    // ear
    if(o.ears!==false){const hx=mdHeadX(P,1.14);k.p('head','box','c',mdSh(sk,.9),s*(hx+.004),1.135,-.005,.022,.045,.032)}});
  // nose and mouth
  if(o.nose!==false){const nz=mdHeadZ(P,1.118);k.p('head','cone4','c',mdSh(sk,.88),0,1.118,nz+.008,.018,.04,.016,-.35)}
  if(o.mouth!==false){const mz=mdHeadZ(P,1.088);k.p('head','box','c',o.mouth||0x5a2a22,0,1.088,mz-.001,.036,.007,.006)}
  mdKit(B,k);
  if(o.noHair)return H;
  // facial hair
  const f=lk.face|0,bc=mdSh(hair,.95);
  if(f==2||f==3)mdLoft(B,H.slice(0,4),{seg:10,off:.011,col:bc,keep:m=>m.s>-.1&&m.y<1.108&&!(m.s>.6&&m.y>1.075&&m.y<1.1)});
  if(f==3){const z=mdHeadZ(P,1.04);mdLoft(B,[{p:[0,1.06,z-.03],rx:.06,f:.03,b:.03,w:[['head',1]]},{p:[0,1.0,z-.012],rx:.05,f:.028,b:.024,w:[['head',1]]},{p:[0,.95,z],rx:.026,f:.016,b:.014,w:[['head',1]]}],{seg:6,capB:{dy:-.03},col:bc})}
  if(f==2||f==3||f==4){const mk=dkKit(),mz=mdHeadZ(P,1.1);[-1,1].forEach(s=>mk.p('head','box','c',bc,s*.022,1.1,mz+.004,.034,.012,.012,0,0,-s*.25));if(f==4)[-1,1].forEach(s=>mk.p('head','box','c',bc,s*.04,1.084,mz-.004,.012,.028,.01,0,0,s*.15));mdKit(B,mk)}
  if(f==5){const sk2=dkKit();sk2.p('head','box','c',0x9a4a40,-.04,1.15,mdHeadZ(P,1.15)+.009,.008,.07,.004,0,0,.35);mdKit(B,sk2)}
  // hair
  if(!bald&&!o.hood)mdHair(B,P,H,hair,lk.hairStyle|0,o);
  return H}
function mdHair(B,P,H,hair,st,o){const hd=mdSh(hair,.82),fem=P.sex==1;
  if(st==4){// mohawk: shaved sides (painted on the head) + a crest
    if(o.noScalp)return;const k=dkKit();for(let i=0;i<7;i++){const a=-1.1+i*.36,y=1.17+Math.cos(a)*.1,z=Math.sin(a)*.115;k.p('head','box','c',i%2?hair:hd,0,y,z,.026,.075,.05,a)}mdKit(B,k);return}
  if(!o.noScalp)mdLoft(B,H.slice(1),{seg:10,off:.013,capB:true,col:m=>m.y>1.2?hair:m.s<-.3?hd:hair,keep:m=>m.y>mdHairLine(m,fem?.012:0)});
  if(st==1){// long: down the back to the shoulders (+ locks framing the face when feminine)
    mdLoft(B,[{p:[0,1.16,-.06],rx:.1,f:.04,b:.05,w:[['head',1]]},{p:[0,1.06,-.085],rx:.098,f:.03,b:.04,w:[['head',.8],['neck',.2]]},{p:[0,.98,-.1],rx:.09,f:.02,b:.03,w:[['head',.4],['chest',.6]]},{p:[0,fem?.86:.92,-.12],rx:.07,f:.012,b:.02,w:[['chest',1]]}],{seg:8,capB:true,col:m=>m.y<.95?hd:hair});
    if(fem)[-1,1].forEach(s=>mdLoft(B,[{p:[s*.098,1.18,.0],rx:.022,f:.03,b:.03,w:[['head',1]]},{p:[s*.1,1.08,.0],rx:.02,f:.028,b:.028,w:[['head',1]]},{p:[s*.095,.99,-.01],rx:.012,f:.018,b:.018,w:[['head',.6],['neck',.4]]}],{seg:5,capB:true,col:hair}))}
  if(st==2){// ponytail
    const k=dkKit();k.p('head','sph','c',hd,0,1.17,-.115,.03);mdKit(B,k);
    mdLoft(B,[{p:[0,1.18,-.12],rx:.032,w:[['head',1]]},{p:[0,1.12,-.155],rx:.036,w:[['head',1]]},{p:[0,1.03,-.165],rx:.03,w:[['head',.6],['neck',.4]]},{p:[0,.95,-.16],rx:.012,w:[['head',.3],['chest',.7]]}],{seg:6,capB:true,col:hair})}
  if(st==3){// braid down the back
    const k=dkKit();for(let i=0;i<6;i++){const y=1.1-i*.042,z=-.12-i*.008;k.p(i<3?'head':'neck','oct','c',i%2?hd:hair,0,y,z,.028-i*.002,.032,.026)}k.p('neck','box','c',0x6a2a1a,0,.85,-.17,.03,.016,.03);mdKit(B,k);
    mdLoft(B,[{p:[0,1.1,-.13],rx:.022,w:[['head',1]]},{p:[0,.86,-.17],rx:.016,w:[['neck',.4],['chest',.6]]}],{seg:5,col:hd})}
  if(st==0&&fem){// short + a short bob at the back
    mdLoft(B,[{p:[0,1.15,-.06],rx:.106,f:.05,b:.06,w:[['head',1]]},{p:[0,1.06,-.07],rx:.104,f:.04,b:.05,w:[['head',1]]},{p:[0,1.03,-.07],rx:.09,f:.03,b:.04,w:[['head',.8],['neck',.2]]}],{seg:9,col:hair,keep:m=>m.s<.2})}}

// =====================================================================================================
// the hero look
