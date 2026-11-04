// ================= v195: the weasel Ranger on the beast kit (3600) =================
// The first race on the new kit (owner: "Let's start with the weasel ranger").
// Outline first (recipe §0): a long, supple body that stands upright with a gentle forward curve, a deep narrow chest, a
// thick muscular neck as wide as the head at its base, a small flat wedge-shaped head held level, short sturdy legs, short
// forelimbs carried in front, a bushy tail thick at the root. Paint: rich brown above, a cream throat / chest / belly whose
// edge waves along the flanks (as on a real weasel), a darker back and crown, cream lips and chin, a dark nose and a
// darkening tail tip. Black beady eyes (the look's eye colour tints the iris).
{const D=BRD[5];
  // ---- proportions (v99 plan of the race; bone lengths and thickness) ----
  D.pre={pelvis:[.82,1.08,.84],spine:[.76,1.36,.8],chest:[.76,1.22,.84],neck:[.86,1.42,.86],head:.8,arm:[.8,.86],hand:.9,leg:[.84,1],foot:.95,cape:[1.05,1]};
  D.shear={spine:.14,chest:.28,neck:.4};D.crouch=[.12,.24];D.foot={len:1.05,w:.85,h:.8};D._pl=null;
  // a slimmer waist, a deeper chest; thicker thighs, slim shins
  D.TR=[[1.25,1.1,1.0,.88,.84,.88,.92,.94,.92,.95,1.05,1.1],[1.12,1.06,.98,.9,.94,1.02,1.06,1.04,1,1,1.05,1.08],[1.15,1.08,1.0,.94,.92,.94,.96,.97,.98,1,1.05,1.08]];
  D.armK=[.86,.9,.84,.78,.82,.74];D.legK=[1.2,1.22,1.1,.9,.86,.76,.7];
  // ---- the tail: bushy, thick at the root, about half the body long, carried low with the end lifting ----
  D.TP=[[0,.6,-.035,.066],[0,.572,-.115,.052],[0,.535,-.19,.047],[.004,.495,-.255,.046],[.008,.455,-.32,.044],[.013,.418,-.385,.042],[.018,.39,-.448,.039],[.023,.374,-.51,.036],[.028,.372,-.566,.032],[.033,.384,-.616,.027],[.037,.405,-.656,.02],[.04,.43,-.682,.011]];
  D.TB.forEach((n,i)=>{const p=D.TP[i];D.HBX[n]=[i?D.TB[i-1]:'pelvis',p[0],p[1],p[2]]});
  D.tailSway=[.06,.09,1.35,2.8];
  // the forepaws held a little away from the (now fuller) thighs
  D.pose=Object.assign({},D.pose,{shz:.1});
  // ---- palette: the look's fur graded darker and less saturated (dark fantasy), a warm cream, a dark back ----
  const old=D.cols;
  D.cols=L=>{if(!BF195.on)return old(L);const f=bf195HSLk(mdC(L.skin),.8,.82);
    return brPal(L,{FUR:f,FURD:bf195HSLk(f,1.05,.55),FURL:mdMix(f,0xd6c8ac,.4),BELLY:bf195HSLk(mdMix(f,0xd8c8a8,.66),.95,.8),NOSE:0x120e0c,PINK:mdMix(f,0x8a6460,.55),MOUTH:0x1a1210,CLAW:0x1a1612})};
  D.bf={n:16,torK:1.06,limbK:1.15,sh0:[.035,.9],shade:{dk:.1,hk:.2,cav:0},
    // the neck: thick, rising from the collar into the back of the skull (human space, before the race's warp)
    neck:T=>[[1.0,.088,.076,.08,-.006],[1.04,.074,.067,.071,-.012],[1.078,.066,.061,.065,-.02],[1.112,.06,.056,.06,-.028],[1.14,.052,.049,.052,-.034]],
    // the legs grow from the ring at the hip joints (y .5), not from under the hips: the thighs start high on the body's sides
    hipY:.49,
    // torso shape: a keel at the chest (extra radius in metres; a from +x toward +z)
    tpush:(y,a,q)=>{const s=Math.sin(a),f=Math.max(0,s);return .014*Math.pow(f,4)*bf195SS(.72,.8,y)*(1-bf195SS(.9,.97,y))+(.009*f*f+.007)*bf195SS(.5,.56,y)*(1-bf195SS(.64,.7,y))},   // (no flattening / tucking: belts, capes and coats are built at the rings' radius and must lie on the body)
    // fur per corner: the cream underside with a waving edge along the flanks, a darker back, lighter inner thighs
    fur:(m,C,q)=>{const F=bf195Rgb(C.FUR),Bl=bf195Rgb(C.BELLY),Dk=bf195Rgb(C.FURD);
      if(q.kind=='t'){const y=m.y,s=q.s,edge=.22+.11*Math.sin(y*29+1.3)+.05*Math.sin(y*71+.4)-.12*bf195SS(.9,1.08,y),cr=bf195SS(edge-.07,edge+.07,s)*bf195SS(.36,.5,y),dk=bf195SS(-.45,-.85,s)*.38;
        return bf195Mix(bf195Mix(F,Dk,dk),Bl,cr)}
      if(q.kind=='l'){const inner=bf195SS(.25,.75,-m.nx*q.side)*bf195SS(.22,.42,m.y)*.55;return bf195Mix(F,Bl,inner)}
      if(q.kind=='a'){const inner=bf195SS(.3,.85,-m.nx*q.side)*(1-bf195SS(1.5,2.5,q.i))*.28;return bf195Mix(F,Bl,inner)}
      return F},
    // the head (head-local metres from FKS.C0 = model [0, 1.16, −.01]; +z forward)
    head:{R:.09,bb:[-.13,-.13,-.16,.13,.12,.22],seg:16,rings:25,ao:.32,muzzleZ:.12,
      forms:[FKH.E([0,.004,-.008],[.084,.064,.086]),                       // brain case: broad and flat
        FKH.E([0,-.002,-.052],[.068,.056,.048],{k:.03}),                      // the back of the skull
        FKH.E([.054,-.014,.03],[.03,.027,.042],{k:.045}),                     // cheekbones behind the eyes
        FKH.RC([0,-.016,.055],[0,-.027,.156],.042,.023,{k:.05,sq:[1.12,1.02]}),  // the muzzle and jaw, one blunt wedge (a separate jaw left a dark groove)
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
      O['aR0.x']=-1.55*e;O['aR0.z']=-.2*e;O['aR1.x']=-1.5*e+.2*rb;O['aR2.x']=.25*e;O['head.x']=.3*e+.05*rb;O['head.z']=-.26*e;O['head.y']=-.22*e;O['neck.x']=.12*e;O['chest.x']=.05*e}},
    // a curious tilt of the head, the tail giving a small flick
    {id:'tilt',dur:1.7,w:2,tail:2.5,fn(u,s,O){const e=E(u,.2,.3);O['head.z']=.48*s*e;O['head.y']=.2*s*e;O['head.x']=-.1*e;O['neck.z']=.12*s*e}},
    // a glance back over the shoulder with a flick of the tail
    {id:'glance',dur:1.8,w:2,tail:5,fn(u,s,O){const e=E(u,.2,.32);O['head.y']=.5*s*e;O['neck.y']=.24*s*e;O['spine.y']=.08*s*e;O['chest.y']=.06*s*e}}]}}
// ---- the weasel's own skeleton (3600 bf195Skel): a long supple spine and neck, ears and toes of its own ----
// spine → sp1 → sp2 → chest (three even links where the hero had one), neck → nk1 → head, ear bones at the ear roots, a toe
// bone in each long hind foot. Skin, armour and cloth are shared among the new bones by height (spine, neck) or by length
// along the foot (toes). The motion layer spreads every spine / neck turn over its links, adds a travelling wave down the
// back while running, keeps the toes flat on the ground when a heel lifts, and moves the ears: folded back at a run, perked
// up while scanning, a flick now and then.
{const D=BRD[5];if(D.bf){const S=D.bf.head,C0=FKS.C0,e=S._earB||[.07,.04,-.04],E=[e[0]+C0[0],e[1]+C0[1],e[2]+C0[2]];
  D.skel={ins:[['sp1','spine','chest',1/3],['sp2','sp1','chest',.5],['nk1','neck','head',.5]],
    add:[['erL','head',-E[0],E[1],E[2]],['erR','head',E[0],E[1],E[2]],['lt','lh2',-.1,.03,.1],['rt','rh2',.1,.03,.1]],
    mf:{sp1:'spine',sp2:'spine',nk1:'neck',erL:'head',erR:'head',lt:'lh2',rt:'rh2'},
    remap:[{from:'spine',bones:['spine','sp1','sp2'],ax:'y',at:[.65,.7167,.7833,.85]},{from:'neck',bones:['neck','nk1'],ax:'y',at:[1.0,1.05,1.1]},
      {from:'lh2',bones:['lh2','lt'],ax:'z',at:[-.1,.1,.26]},{from:'rh2',bones:['rh2','rt'],ax:'z',at:[-.1,.1,.26]}],
    chains:[['spine','sp1','sp2'],['neck','nk1']],
    // the weasel's curve at rest: the lower back leaning in, the upper back coming upright (an S down the spine), the neck
    // reaching forward off the shoulders and rising to the head; every curve sums to zero, so the chest and the head keep
    // the orientation the animation gave them (weapons, aim and the head levelling are untouched)
    curve:{sp2:[-.06,0,0],spine:[.06,0,0],nk1:[-.13,0,0],neck:[.13,0,0]},
    drive(H,S,now){const b=H.bones;if(!S)return;const G=H._ga,w=G?bf195Cl(G.w,0,1):0,ph=G?G.ph:0,dt=S._dt2==null?0:Math.min(.05,Math.max(0,(now-S._dt2)/1000));S._dt2=now;
      // a wave down the back while running (sp1 then sp2, each a little later)
      const a=.05*w*bf195SS(.5,3.5,G?G.v:0);if(a>1e-4&&b.sp1&&b.sp2){b.sp1.rotateX(a*Math.sin(ph*Math.PI*4-.7));b.sp2.rotateX(a*Math.sin(ph*Math.PI*4-1.4))}
      // toes: keep them flat when the foot pitches heel-up
      const V=BF195_Q.v||(BF195_Q.v={q:new THREE.Quaternion(),f:new THREE.Vector3()});
      [['lh2','lt'],['rh2','rt']].forEach(([fb,tb])=>{const F=b[fb],T=b[tb];if(!F||!T)return;F.getWorldQuaternion(V.q);V.f.set(0,0,1).applyQuaternion(V.q);
        const p=Math.asin(bf195Cl(V.f.y,-1,1));T.rotation.set(bf195Cl(p,-.85,0)*.9,0,0)});
      // ears: back at a run, up while scanning, a quick flick now and then (springs, so they ease)
      if(!S.ear)S.ear={sp:new Float64Array(8),t:2+Math.random()*4,f:0,s:1};const Ea=S.ear;Ea.t-=dt;if(Ea.t<=0){Ea.f=1;Ea.s=Math.random()<.5?-1:1;Ea.t=3+Math.random()*7}
      Ea.f=Math.max(0,Ea.f-dt*4.5);const scan=S.g&&S.g.G&&S.g.G.id=='scan'?1:0,back=-.45*w,up=.25*scan,fl=Ea.f>0?Math.sin((1-Ea.f)*Math.PI)*.5:0;
      if(dt>0){bf195Spr(Ea.sp,0,back+up+(Ea.s>0?fl:0),18,.55,dt);bf195Spr(Ea.sp,2,back+up+(Ea.s<0?fl:0),18,.55,dt)}
      if(b.erR)b.erR.rotation.set(Ea.sp[0],0,-.15*Ea.sp[0]);if(b.erL)b.erL.rotation.set(Ea.sp[2],0,.15*Ea.sp[2])}};
  bf195Skel(D)}}
