// ================= Stoneshell: low-poly stone-backed tortoise (v81) =================
// Species on this rig: Stoneshell, Cragback, Titanshell (colour C tints the shell stone).
// Positions are in the Stoneshell's own model space (a squashed Foxlet skeleton: head bone at z≈.41, feet at y≈0).
(function(){
  const nz=(i,s,c)=>{const v=Math.sin(i*12.9898+s*78.233+c*37.719)*43758.5453;return v-Math.floor(v)};
  // shell dome: [z, centre y, half width, dome height, underside depth]
  const SHELL=[[.44,.21,.13,.06,.04],[.39,.215,.24,.14,.07],[.29,.22,.32,.24,.08],[.16,.22,.355,.31,.09],[.02,.22,.365,.34,.09],[-.12,.22,.36,.33,.09],[-.26,.22,.335,.28,.08],[-.38,.21,.28,.19,.07],[-.47,.2,.16,.08,.04]];
  const domeY=(x,z)=>.22+.33*Math.sqrt(Math.max(0,1-(x/.36)**2-((z+.04)/.5)**2));
  LPR.Stoneshell={
    head:['head',0,.37,.46],up:.12,
    back:[['spine',0,.5,.14],['spine',0,.54,-.06],['spine',0,.51,-.26]],
    geo(C){
      const stone=lpMain(C,.22).multiplyScalar(.72),light=stone.clone().multiplyScalar(1.22),rim=stone.clone().multiplyScalar(.5),moss=new THREE.Color(0x3e5428),
        skin=new THREE.Color(C).lerp(new THREE.Color(0x3a3e2c),.7),belly=skin.clone().lerp(new THREE.Color(0xb8b494),.45),dark=new THREE.Color(0x1a1a14);
      const legs=[].concat(...[-1,1].map(s=>{const F=s<0?'fl':'fr',H=s<0?'hl':'hr';return [
        [[s*.14,.2,.17,.07,['chest',F+'0',.5]],[s*.15,.12,.19,.066,[F+'0',F+'1',.7]],[s*.155,.06,.185,.06,[F+'1',F+'1',0]],[s*.155,.025,.185,.066,[F+'2',F+'2',0],1],[s*.155,.004,.195,.072,[F+'2',F+'2',0],1]],
        [[s*.15,.2,-.21,.075,['pelvis',H+'0',.5]],[s*.16,.12,-.18,.07,[H+'0',H+'1',.7]],[s*.165,.06,-.2,.065,[H+'1',H+'1',0]],[s*.165,.025,-.21,.068,[H+'2',H+'2',0],1],[s*.165,.004,-.21,.074,[H+'2',H+'2',0],1]]]}));
      return lpGeo('Stoneshell|'+C,'Stoneshell',[
        // rocky shell: vertex jitter makes each facet a chipped stone
        {rings:SHELL.map((r,i)=>({p:[0,r[1],r[0]],rx:r[2],ryT:r[3],ryB:r[4],b:[r[0]>.25?'chest':r[0]<-.3?'pelvis':'spine','spine',r[0]>.25||r[0]<-.3?.5:0],j:i&&i<SHELL.length-1?.2:.05})),seg:12,capA:1,capB:1,
          paint:(o,r,s,c,i)=>{o.copy(stone);if(s>.55)o.lerp(light,.5);if(nz(i+3,c,s)>.6)o.multiplyScalar(.78);if(s<.05)o.copy(rim);if(s<-.4)o.copy(belly).multiplyScalar(.8);if(s>.45&&nz(i,s,c)>.8)o.lerp(moss,.8)}},
        // neck + head with a horny beak
        {rings:[[.3,.24,.075,.075],[.4,.27,.072,.07],[.47,.3,.088,.07],[.53,.31,.08,.062],[.59,.302,.06,.046],[.635,.29,.03,.025],[.655,.285,.008,.008]].map((r,i)=>({p:[0,r[1],r[0]],rx:r[2],ryT:r[3],ryB:r[3]*.9,b:i<1?['neck','neck',0]:i<2?['neck','head',.5]:['head','head',0],beak:i>4})),seg:8,capA:1,capB:1,
          paint:(o,r,s)=>{o.copy(r.beak?dark:skin);if(!r.beak&&s>.5)o.multiplyScalar(.8);if(!r.beak&&s<-.3)o.copy(belly)}},
        // stubby tail
        {rings:[[-.4,.2,.05],[-.5,.21,.038],[-.58,.22,.02],[-.63,.225,.006]].map((r,i)=>({p:[0,r[1],r[0]],rx:r[2],b:i<1?['tail0','tail0',0]:i<2?['tail0','tail1',.5]:['tail2','tail2',0]})),seg:6,capB:1,paint:o=>o.copy(skin)}]
      .concat(legs.map(L=>({rings:L.map(r=>({p:[r[0],r[1],r[2]],rx:r[3],ryT:r[3]*1.05,ryB:r[3]*1.05,b:r[4],d:r[5]})),seg:6,ref:[0,0,1],capB:1,
        paint:(o,r,sn)=>{o.copy(skin);if(r.d)o.multiplyScalar(.6);if(sn>.4&&!r.d)o.lerp(belly,.25)}}))));
    },
    kit(k,c,C,red){
      const stone=dkShade(lpMain(C,.12).getHex(),.72),dstone=dkShade(stone,.65),eye=red?0xff2a2a:0xc8d05a,horn=0x2a2a20,moss=0x3e5a2a;
      // face: sunken eyes under a heavy brow, beak-edged jaw
      [-1,1].forEach(s=>{
        k.p('head','box','c',0x080806,s*.07,.335,.535,.032,.024,.02,0,s*.5,-s*.15);
        k.p('head','box','g',eye,s*.076,.336,.538,.02,.011,.008,0,s*.5,-s*.2);
        k.p('head','box','c',horn,s*.066,.355,.53,.048,.016,.036,0,s*.45,s*.3);
      });
      k.L('jaw','c',0x5a5a46,[0,.272,.47],[0,.272,.625],.05,.014,5);
      k.p('jaw','box','c',horn,0,.283,.62,.03,.012,.03);
      // shell: embedded boulders, moss tufts and a ring of rim stones
      const rocks=[[0,.02,.075],[-.2,.0,.06],[.2,-.02,.06],[0,.26,.055],[0,-.3,.065],[-.22,.18,.05],[.22,.17,.05],[-.21,-.2,.055],[.21,-.22,.05],[.1,-.1,.045],[-.1,.1,.04]];
      rocks.forEach((q,i)=>k.p('spine',i%3?'dod':'ico','c',i%2?stone:dstone,q[0],domeY(q[0],q[1])-q[2]*.5,q[1],q[2],q[2]*.75,q[2],i*.7,i*1.3,i*.4));
      [[.12,.08],[-.15,-.12],[.17,-.02],[-.05,.18]].forEach((q,i)=>k.p('spine','ico','c',moss,q[0],domeY(q[0],q[1])-.005,q[1],.06,.018,.05,0,i));
      for(let i=0;i<12;i++){const a=i/12*Math.PI*2,x=Math.sin(a)*.355,z=Math.cos(a)*.44-.02;k.p('spine','dod','c',i%2?dstone:stone,x,.215,z,.045,.03,.045,i,i*.5,0)}
      // glowing crystal cluster growing from the shell
      [[.06,-.02,.12,.15],[-.02,.04,.09,-.25],[.0,-.08,.07,.35],[-.16,-.16,.06,-.2]].forEach((q,i)=>{const y=domeY(q[0],q[1])-.02;k.L('spine',i<3?'g':'c',i<3?0x5ae8d0:0x3a6a64,[q[0],y,q[1]],[q[0]+q[3]*.12,y+q[2],q[1]-q[3]*.05],.028,.003,4)});
      // claws
      [['fl2',-.155,.19],['fr2',.155,.19],['hl2',-.165,-.21],['hr2',.165,-.21]].forEach(f=>[-1,0,1].forEach(i=>k.p(f[0],'cone4','c',0x1a1812,f[1]+i*.03,.012,f[2]+.075,.012,.04,.012,Math.PI/2)));
    }};
})();

