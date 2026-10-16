// ================= Skyhawk (Skyhawk, Stormtalon, Rocsovereign): low-poly raptor on the v81 toolkit =================
// Own bird skeleton (pelvis y .55, head z .38, two legs). Wings use lpwWing from zzE_Batwing.js.
// body ring: [z, y, half width, above, below, bones, kind]  kind: 1 = head (pale face), 2 = beak base
var HWK_BODY=[
  [-.33,.53,.03,.022,.022,['tail0','tail0',0],0],
  [-.25,.54,.075,.065,.065,['tail0','pelvis',.4],0],
  [-.13,.55,.125,.12,.12,['pelvis','pelvis',0],0],
  [-.01,.575,.155,.145,.155,['pelvis','spine',.6],0],
  [.09,.61,.165,.15,.17,['spine','spine',0],0],
  [.18,.655,.15,.14,.16,['spine','chest',.7],0],
  [.25,.715,.115,.1,.12,['chest','neck',.4],0],
  [.3,.785,.085,.08,.085,['neck','neck',0],0],
  [.34,.84,.085,.085,.075,['neck','head',.7],1],
  [.39,.875,.09,.085,.07,['head','head',0],1],
  [.45,.875,.07,.065,.055,['head','head',0],1],
  [.49,.865,.042,.036,.034,['head','head',0],2]];
function hwkLeg(s){const H=s<0?'hl':'hr',x=s*.075;return [
  [x,.52,-.03,.075,.085,['pelvis',H+'0',.5],0],[x,.42,-.0,.07,.075,[H+'0',H+'0',0],0],[x,.33,.015,.045,.05,[H+'0',H+'1',.6],0],
  [x,.28,.02,.022,.024,[H+'1',H+'1',0],1],[x,.12,-.015,.02,.022,[H+'1',H+'2',.8],1],[x,.04,0,.022,.024,[H+'2',H+'2',0],1]]}
LPR.Skyhawk={
  head:['head',0,.94,.39],up:.08,sc:1.24,
  back:[['neck',0,.86,.29],['chest',0,.79,.2],['spine',0,.75,.08],['pelvis',0,.68,-.06]],
  geo(C){
    const main=lpMain(C,.22),back=main.clone().multiplyScalar(.55),bel=new THREE.Color(0xd8ccb0),bar=main.clone().multiplyScalar(.5).lerp(new THREE.Color(0x3a3024),.4),
      face=bel.clone().lerp(main,.25),cere=new THREE.Color(0xc89a3a),scale=new THREE.Color(0x9a8448),trou=bel.clone().lerp(main,.55).multiplyScalar(.85);
    return lpGeo('Skyhawk|'+C,'Skyhawk',[
      {rings:HWK_BODY.map((r,i)=>({p:[0,r[1],r[0]],rx:r[2],ryT:r[3],ryB:r[4],b:r[5],k:r[6],i:i,j:r[6]?0:.06})),seg:8,capA:1,capB:1,paint:(o,r,s,c)=>{
        if(r.k==2)return o.copy(cere);o.copy(main);if(s>.4)o.lerp(back,.8);
        if(r.k==1){if(s<.3)o.copy(face);if(s<-.2)o.copy(bel)}
        // pale barred breast
        else if(s<-.15){o.copy(bel);if(r.i%2&&r.i>2)o.lerp(bar,.55)}}}]
      .concat([-1,1].map(s=>({rings:hwkLeg(s).map(r=>({p:[r[0],r[1],r[2]],rx:r[3],ryT:r[4],ryB:r[4],b:r[5],d:r[6]})),seg:6,ref:[0,0,1],capB:1,paint:(o,r)=>{o.copy(r.d?scale:trou)}}))),53);
  },
  kit(k,c,C,red){
    const dark=0x141210,eye=red?0xff2a2a:0xf2b21e,main=lpMain(C,.22),back=dkShade(main.getHex(),.55),deep=dkShade(main.getHex(),.35),beak=0x2a2420,tip=0x14100e;
    [-1,1].forEach(s=>{
      k.p('head','box','c',0x070606,s*.068,.89,.43,.042,.03,.018,0,s*.7,-s*.12);
      k.p('head','box','g',eye,s*.076,.892,.434,.032,.016,.008,0,s*.7,-s*.18);
      // heavy brow shelf: the raptor scowl
      k.p('head','box','c',back,s*.06,.915,.44,.07,.022,.05,0,s*.5,s*.25);
      // talons: three forward, one back
      const f=s<0?'hl2':'hr2',fx=s*.075;
      [-1,0,1].forEach(i=>{k.L(f,'c',0x9a8448,[fx,.025,.0],[fx+i*.04,.02,.09-Math.abs(i)*.02],.016,.012,4);k.p(f,'cone4','c',tip,fx+i*.045,.018,.1-Math.abs(i)*.02,.008,.04,.008,Math.PI/2)});
      k.L(f,'c',0x9a8448,[fx,.025,0],[fx,.02,-.07],.015,.011,4);k.p(f,'cone4','c',tip,fx,.018,-.085,.008,.035,.008,-Math.PI/2);
    });
    // hooked beak: upper on the head, lower on the jaw
    k.L('head','c',beak,[0,.872,.48],[0,.865,.56],.032,.018,4);
    k.L('head','c',beak,[0,.865,.56],[0,.83,.6],.018,.004,4);
    k.L('jaw','c',dkShade(beak,1.3),[0,.84,.48],[0,.835,.54],.022,.008,4);
    // swept crest feathers
    [-1,0,1].forEach(i=>k.L('head','c',deep,[i*.03,.93,.37],[i*.05,.95,.26],.025,.003,4));
    // fanned tail feathers
    [-2,-1,0,1,2].forEach(i=>{const a=i*.18;k.p(i?'tail2':'tail3','box','c',i%2?back:deep,Math.sin(a)*.13,.515-Math.abs(i)*.008,-.46-Math.cos(a)*.15,.1,.02,.34,0,a,0);
      k.p('tail3','box','c',0xb8ac92,Math.sin(a)*.29,.512-Math.abs(i)*.008,-.46-Math.cos(a)*.31,.1,.016,.04,0,a,0)});
    // breast ruff
    [-1,0,1].forEach(i=>k.L('chest','c',0xc8bca2,[i*.06,.68,.27],[i*.07,.6,.24],.04,.004,4));
  },
  post(x,c,C,mat){
    const main=lpMain(C,.22),root=main.clone().multiplyScalar(.85),tipC=main.clone().multiplyScalar(.32).lerp(new THREE.Color(0x221c18),.4);
    // half-folded raptor wing: broad coverts, jagged primary feather tips
    const W=lpwWing('hwk|'+C,
      [[0,0,.07],[.22,.06,.1],[.44,.07,.06],[.62,.05,-.02],[.78,.01,-.12],[.72,-.02,-.2],[.76,0,-.26],[.65,-.02,-.3],[.67,0,-.38],[.55,-.02,-.38],[.56,0,-.47],[.43,-.02,-.43],[.4,0,-.52],[.28,-.02,-.45],[.24,0,-.52],[.12,-.02,-.42],[0,0,-.3]],
      [.34,.04,-.18],
      [[[0,.01,.07],[.44,.08,.06],.026],[[.44,.08,.06],[.78,.02,-.12],.014]],
      root,tipC,dkShade(main.getHex(),.45),4);
    lpwPair(x,'chest',W,mat,.12,.72,.14,.4,.3);
  }};
