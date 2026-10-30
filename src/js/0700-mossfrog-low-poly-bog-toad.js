// ================= Mossfrog: low-poly bog toad (v81) =================
// Species on this rig: Mossfrog, Bogmaw (colour C tints the skin). Anim type 'hop'.
// Positions are in the Mossfrog's own model space (a wide, squashed Foxlet skeleton: head bone at z≈.34).
(function(){
  const nz=(i,s,c)=>{const v=Math.sin(i*12.9898+s*78.233+c*37.719)*43758.5453;return v-Math.floor(v)};
  // body + head: [z, centre y, half width, half height above, below, [boneA,boneB,blend], belly line]
  const BODY=[[.47,.27,.04,.025,.025,['head','head',0],-.3],[.43,.28,.14,.065,.05,['head','head',0],-.25],[.37,.29,.195,.105,.07,['head','head',0],-.2],
    [.29,.29,.215,.15,.1,['neck','head',.5],-.25],[.17,.285,.235,.19,.13,['chest','chest',0],-.35],[.03,.285,.245,.2,.14,['spine','spine',0],-.4],
    [-.11,.285,.225,.19,.13,['spine','pelvis',.6],-.4],[-.21,.285,.175,.15,.1,['pelvis','pelvis',0],-.4],[-.29,.28,.09,.08,.06,['pelvis','tail0',.3],-.4],[-.32,.28,.02,.02,.02,['tail0','tail0',0],-1]];
  LPR.Mossfrog={
    head:['head',0,.43,.36],up:.08,sc:1.18,
    back:[['chest',0,.46,.16],['spine',0,.47,.02],['spine',0,.46,-.1],['pelvis',0,.43,-.2]],
    geo(C){
      const skin=lpMain(C,.42).multiplyScalar(.82),back=skin.clone().multiplyScalar(.68),spot=skin.clone().lerp(new THREE.Color(0x14180e),.6),belly=new THREE.Color(0xc4bf96),warm=new THREE.Color(0x8a8a4a);
      const legs=[].concat(...[-1,1].map(s=>{const F=s<0?'fl':'fr',H=s<0?'hl':'hr';return [
        [[s*.15,.22,.14,.05,['chest',F+'0',.5]],[s*.17,.14,.16,.044,[F+'0',F+'1',.7]],[s*.175,.065,.15,.036,[F+'1',F+'1',0]],[s*.175,.025,.155,.032,[F+'2',F+'2',0]]],
        [[s*.15,.26,-.16,.085,['pelvis',H+'0',.5]],[s*.2,.18,-.11,.072,[H+'0',H+'0',0]],[s*.215,.12,-.08,.05,[H+'0',H+'1',.6]],[s*.205,.075,-.16,.046,[H+'1',H+'1',0]],[s*.195,.035,-.22,.036,[H+'1',H+'2',.5]],[s*.19,.018,-.245,.03,[H+'2',H+'2',0]]]]}));
      return lpGeo('Mossfrog|'+C,'Mossfrog',[
        {rings:BODY.map(r=>({p:[0,r[1],r[0]],rx:r[2],ryT:r[3],ryB:r[4],b:r[5],bl:r[6]})),seg:10,capA:1,capB:1,paint:(o,r,s,c,i)=>{
          o.copy(skin);if(s>.6)o.lerp(back,.7);const n=nz(i,s,c);if(s>.1&&n>.7)o.copy(spot);else if(s>-.1&&n<.12)o.lerp(warm,.5);
          const t=Math.min(1,Math.max(0,(r.bl-s)*3));if(t>0)o.lerp(belly,t)}}]
      .concat(legs.map(L=>({rings:L.map(r=>({p:[r[0],r[1],r[2]],rx:r[3],ryT:r[3]*1.1,ryB:r[3]*1.1,b:r[4]})),seg:6,ref:[0,0,1],capB:1,
        paint:(o,r,sn,c,i)=>{o.copy(skin);if(sn>.3)o.lerp(belly,.3);if(nz(i,sn,c)>.75)o.copy(spot);if(r.p[1]<.05)o.multiplyScalar(.85)}}))));
    },
    kit(k,c,C,red){
      const skin=lpMain(C,.42).multiplyScalar(.82).getHex(),dk=dkShade(skin,.6),lid=dkShade(skin,.85),belly=0xc4bf96,eye=red?0xff2a2a:0xd8c030;
      // bulging eyes on top of the head: lidded domes, glowing gold iris with a black slit
      [-1,1].forEach(s=>{
        // v180 (owner: not cartoony): a toad's eyes, smaller and hooded, with a horizontal pupil; warty parotoid glands
        // behind them (the big round glowing eyes with slit pupils read as a cartoon frog)
        k.p('head','sph2','c',lid,s*.12,.415,.34,.056,.05,.058);
        k.p('head','sph2','g',dkShade(eye,.8),s*.134,.42,.366,.034,.029,.024,0,s*.5,0);
        k.p('head','box','c',0x050505,s*.139,.42,.388,.026,.007,.008,0,s*.5,0);
        k.p('head','box','c',dk,s*.118,.452,.352,.074,.022,.056,.12,s*.3,s*.3);
        k.p('head','sph','c',dkShade(skin,1.08),s*.15,.4,.25,.05,.034,.075,0,s*.25,s*.35);[0,1,2].forEach(i=>k.p('head','ico','c',dk,s*(.155+i*.01),.43-i*.01,.29-i*.035,.011,.008,.011));
        k.p('head','box','c',0x0a0c08,s*.03,.31,.462,.013,.009,.01);
      });
      // wide mouth seam and a pale lower jaw that drops on attack (tongue inside)
      k.p('jaw','sph','c',belly,0,.245,.34,.155,.04,.11);
      k.p('jaw','box','c',0x8a2a2a,0,.265,.36,.06,.012,.1);
      // warts along the back and flanks
      [[.08,.45,.14,.03],[-.09,.455,.08,.028],[.12,.44,-.04,.032],[-.13,.43,-.08,.03],[.05,.455,-.13,.026],[-.04,.44,.2,.022],[.18,.38,.06,.026],[-.19,.37,.02,.028],[.15,.39,-.15,.024],[-.15,.4,.14,.022]]
        .forEach((q,i)=>k.p(q[2]>.1?'chest':q[2]>-.1?'spine':'pelvis','ico','c',i%3?dk:dkShade(skin,1.15),q[0],q[1]+(q[1]>.42?.015:0),q[2],q[3],q[3]*.7,q[3]));
      // moss on the back
      [[.04,.474,.04],[-.06,.463,-.06]].forEach((q,i)=>k.p('spine','ico','c',0x4a6a2a,q[0],q[1],q[2],.055,.016,.045,0,i));
      // webbed feet: three splayed toes with knobbed tips
      [['fl2',-.175,.155,1],['fr2',.175,.155,1],['hl2',-.19,-.245,1.3],['hr2',.19,-.245,1.3]].forEach(f=>{
        k.p(f[0],'box','c',dkShade(skin,.8),f[1],.012,f[2]+.03*f[3],.08*f[3],.012,.06*f[3]);
        [-1,0,1].forEach(i=>{const a=i*.5+(f[1]<0?-.2:.2),L=.07*f[3],x=f[1]+Math.sin(a)*L,z=f[2]+Math.cos(a)*L;
          k.L(f[0],'c',dkShade(skin,.85),[f[1],.014,f[2]],[x,.012,z],.014,.01,4);k.p(f[0],'sph','c',belly,x,.014,z,.014,.01,.014)});
      });
    }};
})();

