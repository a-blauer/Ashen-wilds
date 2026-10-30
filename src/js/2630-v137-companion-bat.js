// ================= v137: Batwing and Duskwing, fluffier and told apart =================
// Both bats had the same smooth body. Now both get fur: cheek tufts, a fluffy collar, shoulder and belly fluff, a tuft on the
// crown. Duskwing (a rig variant, RV137 in 2600) is the moon bat: a thick silver-violet mane round its neck and chest, a pale
// crescent moon marked on its breast, taller ears with a glowing violet inner ear, violet eyes, star freckles on the wings'
// arm bones and a tail tuft.
RV137.var.Batwing=['Batwing','Duskwing'];if(EVO100.surf)delete EVO100.surf.Batwing;
{const B=LPR.Batwing,k0=B.kit,p0=B.post;
  B.kit=function(k,c,C,red){k0.apply(this,arguments);const sp=rv137('Batwing',c),dusk=sp=='Duskwing';
    const main=lpMain(C,.12),fur=dkShade(main.clone().lerp(new THREE.Color(dusk?0xb8b0d0:0xb0a090),dusk?.5:.3).getHex(),.95),furD=dkShade(main.getHex(),.6);
    const tuft=(bn,a,b,r,col)=>k.L(bn,'c',col||fur,a,b,r||.028,.003,4);
    // cheek tufts and a crown tuft
    [-1,1].forEach(s=>{tuft('head',[s*.1,.4,.41],[s*.155,.37,.38],.03);tuft('head',[s*.09,.38,.43],[s*.14,.34,.41],.022)});
    tuft('head',[0,.5,.4],[0,.55,.35],.03,furD);tuft('head',[.025,.49,.39],[.05,.53,.33],.022,furD);tuft('head',[-.025,.49,.39],[-.05,.53,.33],.022,furD);
    // collar of fur round the neck
    for(let i=0;i<12;i++){const a=(i/11-.5)*3.6,r=.13;tuft('neck',[Math.sin(a)*r*.9,.36+Math.cos(a)*.05,.29+Math.cos(a)*.03],[Math.sin(a)*r*1.25,.31+Math.cos(a)*.03,.25],dusk?.04:.03,i%2?fur:furD)}
    // shoulder and belly fluff
    [-1,1].forEach(s=>{for(let i=0;i<3;i++)tuft('chest',[s*.13,.36-i*.04,.18-i*.03],[s*.18,.33-i*.05,.13-i*.03],.026)});
    for(let i=0;i<5;i++){const z=.08-i*.07;tuft(z>0?'chest':'spine',[((i%2)-.5)*.06,.17+Math.max(0,-z)*.2,z],[((i%2)-.5)*.07,.135,z-.04],.03)}
    if(dusk){// mane, crescent moon on the breast, violet eyes over the old ones, tail tuft
      for(let i=0;i<14;i++){const a=(i/13-.5)*4.2,r=.15;tuft(i%3?'neck':'chest',[Math.sin(a)*r*.85,.42+Math.cos(a)*.04,.27],[Math.sin(a)*r*1.35,.4+Math.cos(a)*.02,.13],.05,i%2?0xc8c0e0:0x9a90b8)}
      for(let i=0;i<7;i++){const a=-1.2+i*.4,a2=a+.4,R=.07,rr=.045;k.L('chest','g',0xe8e0ff,[Math.sin(a)*R,.25+Math.cos(a)*R,.3+Math.cos(a)*.01],[Math.sin(a2)*R,.25+Math.cos(a2)*R,.3+Math.cos(a2)*.01],.014-Math.abs(i-3)*.003,.014-Math.abs(i-3+1)*.003,3)}
      [-1,1].forEach(s=>k.p('head','box','g',red?0xff2a2a:0xc070ff,s*.08,.433,.473,.038,.02,.008,0,s*.55,-s*.25));
      tuft('tail1',[0,.31,-.4],[0,.33,-.5],.035,0xc8c0e0)}
  };
  B.post=function(x,c,C,mat){const n0=x.ears?x.ears.length:0;p0.apply(this,arguments);const sp=rv137('Batwing',c);
    if(sp=='Duskwing'&&x.ears)for(let i=n0;i<x.ears.length;i++){const p=x.ears[i],m=p.children[0];if(m){m.scale.y*=1.25;m.scale.x*=1.08;
      const g=new THREE.Mesh(lpSpikeGeo(0xb070ff,0x4a2080,3),lpMat(c.v,0,{emissive:0x3a1060}));g.scale.set(.42,.6,.3);g.position.set(0,.06,.6);m.add(g)}}};
}
