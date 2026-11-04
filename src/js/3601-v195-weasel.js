// ================= v195: the weasel Ranger on the beast kit (3600) =================
// The first race on the new kit (owner: "Let's start with the weasel ranger").
// Outline first (recipe §0): a long, supple body that stands upright with a gentle forward curve, a deep narrow chest, a
// thick muscular neck as wide as the head at its base, a small flat wedge-shaped head held level, short sturdy legs, short
// forelimbs carried in front, a bushy tail thick at the root. Paint: rich brown above, a cream throat / chest / belly whose
// edge waves along the flanks (as on a real weasel), a darker back and crown, cream lips and chin, a dark nose and a
// darkening tail tip. Black beady eyes (the look's eye colour tints the iris).
{const D=BRD[5];
  // ---- proportions (v99 plan of the race; bone lengths and thickness) ----
  D.pre={pelvis:[.82,1.08,.84],spine:[.76,1.36,.8],chest:[.76,1.22,.84],neck:[.95,1.42,.95],head:.8,arm:[.8,.86],hand:.9,leg:[.74,1],foot:.9,cape:[1.05,1]};
  D.shear={spine:.14,chest:.28,neck:.4};D.crouch=[.26,.46];D._pl=null;
  // a slimmer waist, a deeper chest; thicker thighs, slim shins
  D.TR=[[1.25,1.12,1.0,.88,.84,.88,.92,.94,.92,.95,1.05,1.1],[1.12,1.06,.98,.9,.94,1.02,1.06,1.04,1,1,1.05,1.08],[1.15,1.08,1.0,.94,.92,.94,.96,.97,.98,1,1.05,1.08]];
  D.armK=[.86,.9,.84,.78,.82,.74];D.legK=[1.2,1.22,1.1,.9,.86,.76,.7];
  // ---- the tail: bushy, thick at the root, about half the body long, carried low with the end lifting ----
  D.TP=[[0,.6,-.06,.04],[0,.572,-.125,.046],[0,.535,-.19,.047],[.004,.495,-.255,.046],[.008,.455,-.32,.044],[.013,.418,-.385,.042],[.018,.39,-.448,.039],[.023,.374,-.51,.036],[.028,.372,-.566,.032],[.033,.384,-.616,.027],[.037,.405,-.656,.02],[.04,.43,-.682,.011]];
  D.TB.forEach((n,i)=>{const p=D.TP[i];D.HBX[n]=[i?D.TB[i-1]:'pelvis',p[0],p[1],p[2]]});
  D.tailSway=[.06,.09,1.35,2.8];
  // ---- palette: the look's fur graded darker and less saturated (dark fantasy), a warm cream, a dark back ----
  const old=D.cols;
  D.cols=L=>{if(!BF195.on)return old(L);const f=bf195HSLk(mdC(L.skin),.8,.82);
    return brPal(L,{FUR:f,FURD:bf195HSLk(f,1.05,.55),FURL:mdMix(f,0xd6c8ac,.4),BELLY:bf195HSLk(mdMix(f,0xd8c8a8,.66),.95,.8),NOSE:0x120e0c,PINK:mdMix(f,0x8a6460,.55),MOUTH:0x1a1210,CLAW:0x1a1612})};
  D.bf={n:16,torK:1.03,limbK:1.1,shade:{dk:.1,hk:.2},
    // the neck: thick, rising from the collar into the back of the skull (human space, before the race's warp)
    neck:T=>[[1.0,.1,.086,.09,-.006],[1.04,.091,.08,.084,-.012],[1.078,.083,.076,.079,-.02],[1.112,.074,.068,.072,-.028],[1.14,.062,.058,.062,-.034]],
    // torso shape: a keel at the chest, a flatter back, the belly a little tucked (extra radius in metres; a from +x toward +z)
    tpush:(y,a,q)=>{const s=Math.sin(a),f=Math.max(0,s),b=Math.max(0,-s);return .014*Math.pow(f,4)*bf195SS(.72,.8,y)*(1-bf195SS(.9,.97,y))-.007*Math.pow(b,3)*bf195SS(.6,.7,y)*(1-bf195SS(.9,.98,y))-.008*Math.pow(f,2)*bf195SS(.58,.64,y)*(1-bf195SS(.66,.72,y))},
    // fur per corner: the cream underside with a waving edge along the flanks, a darker back, lighter inner thighs
    fur:(m,C,q)=>{const F=bf195Rgb(C.FUR),Bl=bf195Rgb(C.BELLY),Dk=bf195Rgb(C.FURD);
      if(q.kind=='t'){const y=m.y,s=q.s,edge=.22+.11*Math.sin(y*29+1.3)+.05*Math.sin(y*71+.4)-.12*bf195SS(.9,1.08,y),cr=bf195SS(edge-.07,edge+.07,s)*bf195SS(.36,.5,y),dk=bf195SS(-.45,-.85,s)*.38;
        return bf195Mix(bf195Mix(F,Dk,dk),Bl,cr)}
      if(q.kind=='l'){const inner=bf195SS(.25,.75,-m.nx*q.side)*bf195SS(.22,.42,m.y)*.55;return bf195Mix(F,Bl,inner)}
      if(q.kind=='a'){const inner=bf195SS(.3,.85,-m.nx*q.side)*(1-bf195SS(1.5,2.5,q.i))*.28;return bf195Mix(F,Bl,inner)}
      return F},
    // the head (head-local metres from FKS.C0 = model [0, 1.16, −.01]; +z forward)
    head:{R:.09,bb:[-.13,-.13,-.16,.13,.12,.22],seg:16,rings:19,ao:.32,muzzleZ:.12,
      forms:[FKH.E([0,.004,-.008],[.084,.064,.086]),                       // brain case: broad and flat
        FKH.E([0,-.002,-.052],[.068,.056,.048],{k:.03}),                      // the back of the skull
        FKH.E([.054,-.014,.03],[.03,.027,.042],{k:.026}),                     // cheekbones behind the eyes
        FKH.E([.03,.03,.052],[.026,.012,.022],{k:.016}),                      // brow over the eye
        FKH.RC([0,-.016,.055],[0,-.027,.156],.042,.023,{k:.034,sq:[1.12,1.02]}),  // the muzzle and jaw, one blunt wedge (a separate jaw left a dark groove)
        FKH.E([.019,-.028,.132],[.019,.015,.021],{k:.018}),                    // whisker pads
        FKH.E([0,-.02,.167],[.013,.011,.01],{k:.006}),                        // nose pad
        FKH.SP([.043,.018,.068],.0125,{sub:1,k:.008})],                       // eye socket
      eye:{c:[.043,.018,.068],g:[.64,.1,.76],r:.0118,sink:.4,fw:.8,al:.9},
      ear:{p:[.058,.034,-.036],len:.03,w:.027,th:.013,out:1.0,back:.55,tw:-.3,t:'round',inner:C=>mdMix(C.FURD,C.PINK,.4),rim:C=>mdMix(C.FUR,C.BELLY,.3)},
      whisk:{p:[.022,-.03,.138],n:3,len:.085,col:0x1c1814},
      // colour per corner (smooth): cream lips / chin / throat under a line from the mouth back under the ear, a darker crown
      // and nape, a dark mask round the eyes, a slightly darker bridge
      paint(p,n,C,ao){const x=Math.abs(p[0]),y=p[1],z=p[2],F=bf195Rgb(C.FUR),Bl=bf195Rgb(C.BELLY),Dk=bf195Rgb(C.FURD);
        const cr=Math.max(bf195SS(-.12,-.42,n[1])*bf195SS(-.006,-.016,y),bf195SS(-.4,-.7,n[1]))*(z<-.06?bf195SS(-.11,-.06,z):1);
        const crown=bf195SS(.45,.85,n[1])*bf195SS(.08,.0,z)*.35,eye=Math.hypot(x-.043,y-.018,z-.068),mask=(1-bf195SS(.014,.026,eye))*.55,bridge=bf195SS(.06,.1,z)*bf195SS(.5,.85,n[1])*(1-bf195SS(.004,.016,x))*.2;
        // the nose pad, painted per corner (crisp facets, and a painted mouth line, read as a zigzag of teeth)
        const nose=bf195SS(.154,.162,z)*bf195SS(-.034,-.028,y)*(1-bf195SS(-.01,-.004,y));
        let c=bf195Mix(F,Dk,Math.max(crown,mask,bridge));c=bf195Mix(c,Bl,cr*(1-mask));return bf195Mix(c,bf195Rgb(C.NOSE),nose)}},
    tail:{r:(i,r)=>r,flat:.92,
      col:(m,C,t)=>{const F=bf195Rgb(C.FUR),Dk=bf195Rgb(C.FURD),tip=[.012,.01,.009],un=bf195Rgb(C.FURL);
        let c=bf195Mix(F,un,bf195SS(-.3,-.8,m.ny)*.45*(1-t));c=bf195Mix(c,Dk,bf195SS(.45,.75,t)*.6);return bf195Mix(c,tip,bf195SS(.72,.92,t))}}};
  // the head: sculpted (3600 bf195Head); the old builder stays for BF195.on=false
  const oh=D.head;D.head=function(B,P,o){if(!BF195.on)return oh.call(this,B,P,o);P.head={w:.9,jaw:.85,top:1,len:.95,fwd:-.01};const H=P._H=mdHeadR(P);bf195Head(B,P,this);return H};
  // the helmets read the skull rings, eyes and ears: measure them now (the first model may be an item picture)
  try{bf195HeadSetup(D)}catch(e){console.warn('v195 weasel head',e)}}
// ---- motion (3600 bf195Motion): a supple body; the weasel's own idle gestures between the v93 fidgets ----
// signs (hero bones): x − raises an arm forward / lifts the head, x + bends the spine forward; elbows bend with x −
{const D=BRD[5];if(D.bf){D.bf.motion={lead:.11,bank:.1,stop:.024,start:.006,flex:.05,armLag:1};
  const E=(u,a,b)=>idlEnv(u,a,b),SS=bf195SS;
  D.bf.gest=[
    // rise up tall and scan the surroundings, forepaws tucked to the chest (the weasel's sentry pose)
    {id:'scan',dur:3.6,w:3,fn(u,s,O){const e=E(u,.18,.2),sw=Math.sin((u-.2)/.6*Math.PI*2)*SS(.18,.3,u)*(1-SS(.72,.84,u));
      O['spine.x']=-.13*e;O['chest.x']=-.09*e;O['neck.x']=-.1*e;O['head.x']=.14*e;O['head.y']=.55*sw*s;O['neck.y']=.22*sw*s;
      O['aR0.x']=-.3*e;O['aR1.x']=-.6*e;O['aR2.x']=.5*e;O['aL0.x']=-.12*e;O['aL1.x']=-.2*e}},
    // lift the nose and sniff the air in quick little twitches
    {id:'sniff',dur:2.1,w:3,fn(u,s,O){const e=E(u,.2,.25),tw=Math.sin(u*Math.PI*2*6)*SS(.25,.35,u)*(1-SS(.7,.8,u));
      O['neck.x']=-.12*e;O['head.x']=-.26*e+.035*tw;O['head.y']=.12*s*e;O['chest.x']=-.04*e}},
    // groom: the free right paw wipes the muzzle a few times
    {id:'groom',dur:2.8,w:2,fn(u,s,O){const e=E(u,.22,.22),rb=Math.sin(u*Math.PI*2*3.5)*SS(.25,.35,u)*(1-SS(.65,.75,u));
      O['aR0.x']=-1.3*e;O['aR0.z']=.22*e;O['aR1.x']=-1.75*e+.2*rb;O['aR2.x']=.25*e;O['head.x']=.3*e+.05*rb;O['head.z']=-.26*e;O['head.y']=-.22*e;O['neck.x']=.12*e;O['chest.x']=.05*e}},
    // a curious tilt of the head, the tail giving a small flick
    {id:'tilt',dur:1.7,w:2,tail:2.5,fn(u,s,O){const e=E(u,.2,.3);O['head.z']=.48*s*e;O['head.y']=.2*s*e;O['head.x']=-.1*e;O['neck.z']=.12*s*e}},
    // a glance back over the shoulder with a flick of the tail
    {id:'glance',dur:1.8,w:2,tail:5,fn(u,s,O){const e=E(u,.2,.32);O['head.y']=.5*s*e;O['neck.y']=.24*s*e;O['spine.y']=.08*s*e;O['chest.y']=.06*s*e}}]}}
