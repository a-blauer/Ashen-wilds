// ================= v172 Ashwolf, remastered =================
// Direction from the original (0620): a lean grey dire wolf with a shaggy ruff, dark hackles, a scarred muzzle, yellow eyes
// and long fangs ("Cinder…": an ash wolf). Built the way the owner's reference wolf is (Oct 30 2026):
//  * the fur is PAINTED (cm172Tex 'fur', shared) on a simple, smooth body; the silhouette gets a few big jagged fur clumps
//    (B.fringe): a mane of spikes over the neck and withers, a cheek ruff, a chest tuft, elbow and haunch tufts, a flame tail;
//  * bold colour design: a dark slate back fading to a near-white chest, cheeks, belly and legs, and the ash wolf's theme in
//    ember: smouldering brow and cheek markings, ember socks above white paws, an ember tail tip and an ember streak under the mane;
//  * anatomy: deep chest, tucked waist, strong haunches; a wedge skull, cheekbones, narrow muzzle, a jaw hinged under the ear
//    (cm172Hinge), black lips, fangs and a row of teeth, narrow amber eyes under a heavy brow, tall ears with pale inner fur;
//    jointed legs (elbow, wrist, pastern / stifle, hock) and four-toed paws with dark claws.
// Bones (SPEC.Ashwolf): pelvis spine chest neck head jaw tail0-3 fl0-2 fr0-2 hl0-2 hr0-2 (fl / hl at -x).
var AW172={hinge:[0,.668,.62]};
function aw172Pal(C){const m=cmCol(lpMain(C,.06)),hsl={};m.getHSL(hsl);
  // the coat: a slate back, the colour on the flanks, a near-white underside; the ember theme accents
  const back=new THREE.Color().setHSL(hsl.h,Math.min(.35,hsl.s+.1),Math.max(.1,hsl.l*.3)).getHex();
  return {main:m.getHex(),back,deep:cmShade(back,.6),pale:cmMix(m,0xf4f0ea,.85),cream:cmMix(m,0xf2eee8,.55),
    emb:0xd8461c,embD:0x7a1a0e,embL:0xff8a3a,nose:0x0d0b0c,gum:0x2a0e10,tooth:0xeee6d2,claw:0x1a1618}}
function aw172Build(B,c,C,red){const K=aw172Pal(C),eye=red?0xff3020:0xf2c040,side=s=>s>0?0:Math.PI,mix=cmMix,ss=cmSS;
  // coat colour by height on the body section (s = sin of the angle: 1 top, -1 belly)
  const coat=s=>{const t=ss(-.45,.6,s);return t>.45?mix(K.main,K.back,ss(.45,1,t)):mix(K.pale,K.main,ss(0,.45,t))};
  // ---------------- torso: chest to rump ----------------
  const T=B.loft({name:'torso',seg:16,sub:2,capA:0,capB:2,rings:[
      {p:[0,.585,.42],rx:.105,ryT:.115,ryB:.13,b:['neck','chest',.5]},
      {p:[0,.568,.32],rx:.15,ryT:.152,ryB:.2,b:'chest'},
      {p:[0,.548,.18],rx:.156,ryT:.15,ryB:.205,b:'chest'},
      {p:[0,.532,.04],rx:.138,ryT:.135,ryB:.15,b:['chest','spine',.5]},
      {p:[0,.526,-.1],rx:.11,ryT:.12,ryB:.092,b:'spine'},
      {p:[0,.522,-.2],rx:.118,ryT:.121,ryB:.095,b:['spine','pelvis',.5]},
      {p:[0,.516,-.3],rx:.13,ryT:.126,ryB:.115,b:'pelvis'},
      {p:[0,.506,-.4],rx:.1,ryT:.1,ryB:.1,b:['pelvis','tail0',.25]}],
    prof:(a,u)=>{const s=Math.sin(a);return 1+.05*Math.max(0,-s)*Math.max(0,1-Math.abs(u-.3)*4)-.03*Math.pow(Math.max(0,s),8)},
    paint:(r,s,c,u)=>{let h=coat(s);if(u<.25&&s<.1)h=mix(h,K.pale,ss(.25,.05,u));if(s>.9&&u<.35)h=mix(h,K.embD,.45);return h}});
  // ---------------- neck ----------------
  const N=B.loft({name:'neck',seg:14,sub:2,rings:[
      {p:[0,.565,.34],rx:.118,ryT:.13,ryB:.15,b:['neck','chest',.6]},
      {p:[0,.62,.46],rx:.098,ryT:.108,ryB:.118,b:'neck'},
      {p:[0,.675,.54],rx:.086,ryT:.092,ryB:.092,b:['neck','head',.5]},
      {p:[0,.71,.585],rx:.078,ryT:.078,ryB:.082,b:'head'}],
    paint:(r,s)=>s<.1?K.pale:coat(s)});
  // ---------------- head: skull and upper muzzle, with the ember markings ----------------
  const H=B.loft({name:'skull',seg:18,sub:3,capA:1,capB:2,capLen:.6,tile:.22,rings:[
      {p:[0,.722,.53],rx:.072,ryT:.068,ryB:.072,b:'head'},
      {p:[0,.736,.595],rx:.092,ryT:.08,ryB:.076,b:'head'},
      {p:[0,.733,.66],rx:.09,ryT:.068,ryB:.066,b:'head'},
      {p:[0,.716,.72],rx:.064,ryT:.05,ryB:.056,b:'head'},
      {p:[0,.702,.79],rx:.047,ryT:.041,ryB:.045,b:'head'},
      {p:[0,.694,.855],rx:.034,ryT:.035,ryB:.036,b:'head'},
      {p:[0,.69,.9],rx:.026,ryT:.029,ryB:.03,b:'head'}],
    prof:(a,u)=>{const c=Math.abs(Math.cos(a)),s=Math.sin(a);return 1+.09*c*Math.max(0,1-Math.abs(u-.35)*5)*(s<.3?1:.4)}, // cheekbones
    paint:(r,s,c,u)=>{if(u>.965&&s>-.1)return K.nose;if(s<-.78&&u>.42)return mix(K.nose,K.back,.4);
      let h=s>.55?mix(K.main,K.back,ss(.55,.95,s)*.85):s>-.05?mix(K.pale,K.main,ss(-.05,.55,s)):K.pale;
      if(u>.55&&s>.2)h=mix(h,K.back,.55);                                                     // dark muzzle bridge
      return h}});
  // ---------------- lower jaw (hinged under the ear) and the mouth ----------------
  const Jw=B.loft({name:'jaw',seg:10,sub:2,capA:1,capB:2,capLen:.5,rings:[
      {p:[0,.664,.62],rx:.058,ryT:.03,ryB:.032,b:['head','jaw',.5]},
      {p:[0,.658,.7],rx:.042,ryT:.024,ryB:.027,b:'jaw'},
      {p:[0,.658,.79],rx:.031,ryT:.02,ryB:.022,b:'jaw'},
      {p:[0,.662,.86],rx:.022,ryT:.016,ryB:.015,b:'jaw'}],
    paint:(r,s)=>s>.8?K.gum:s>.45?K.nose:K.pale});
  B.loft({name:'mouth',seg:8,sub:1,capA:1,capB:1,rings:[
      {p:[0,.674,.65],rx:.036,ryT:.008,ryB:.008,b:['head','jaw',.5]},{p:[0,.672,.76],rx:.024,ryT:.007,ryB:.007,b:['head','jaw',.5]},{p:[0,.672,.84],rx:.015,ryT:.006,ryB:.006,b:['head','jaw',.5]}],col:K.gum});
  B.put('k',cmBlob(3,.06,8),new CM_V(0,.712,.902),{s:[.017,.013,.015],W:B.W('head'),col:K.nose,nm:'nose'});
  [-1,1].forEach(s=>{const F=s<0?'fl':'fr',Hh=s<0?'hl':'hr',sd=side(s);
    // teeth: a row along the lip with a long upper fang; a lower fang
    cmTeeth(B,[.5,.58,.66,.74].map(u=>B.at(H,u,sd+s*-.8,-.006)),{dir:[0,-1,.1],l:.012,r:.005,fang:[3],fl:.034,fr:.009,col:K.tooth});
    cmTeeth(B,[B.at(Jw,.78,sd+s*.8,-.004)],{dir:[0,1,.15],l:.02,r:.006,col:K.tooth});
    // narrow eyes under a heavy brow
    cmEye(B,B.at(H,.46,sd+s*.45,0),{r:.013,col:eye,lid:0x0a0808,brow:K.back,ba:.5,pr:.28});
    // ember markings (painted strokes): a slash over the eye sweeping up to the ear, a line under the eye along the cheek, a
    // short mark on the muzzle bridge
    const A=a=>sd+s*a;
    B.stroke(H,[[.6,A(.6)],[.53,A(.7)],[.46,A(.8)],[.39,A(.9)],[.32,A(1.0)],[.25,A(1.08)]],.014,[K.emb,K.embD],{taper:[.35,0],nm:'brow mark'});
    B.stroke(H,[[.62,A(.2)],[.55,A(.14)],[.48,A(.08)],[.41,A(.02)],[.34,A(-.06)]],.009,[K.emb,K.embD],{nm:'cheek mark'});
    
    // ears: tall, set back, the backs dark, pale fur inside
    const qa=B.at(H,.2,sd+s*1.08,-.014),dir=new CM_V(s*.3,1,-.3).normalize(),fz=new CM_V(s*.3,0,1).normalize();
    B.put('hide',cmG('ear',()=>cmShell([[0,.5],[.5,.35],[.42,0],[.2,-.5],[0,-.95],[-.2,-.5],[-.42,0],[-.5,.35]],.12,0,.18)),qa.p,{ax:{y:dir.clone().negate(),z:fz},s:[.07,.105,.06],W:qa.W,
      paint:l=>l.y<-.6?K.deep:K.back,nm:'ear'});
    const ex=new CM_V().crossVectors(dir,fz).normalize(),ef=[0,1,2,3].map(i=>({p:qa.p.clone().addScaledVector(dir,.012+i*.006).addScaledVector(fz,.016).addScaledVector(ex,(i-1.5)*.012),n:fz,t:dir,s:ex,W:qa.W}));
    B.fringe(ef,{len:.045,flow:dir,lift:.15,curl:.05,col:[K.cream,K.pale],nm:'ear fur'});
    // cheek ruff: jagged clumps sweeping back and down from the cheekbones
    B.fringe(B.row(H,{u:.3,a0:sd+s*.35,a1:sd+s*-1.25,n:4}),{len:i=>.11-i*.01,wid:1.3,flow:new CM_V(s*.3,-.35,-1),lift:.4,col:[K.main,K.pale],nm:'cheek'});
    B.fringe(B.row(H,{u:.16,a0:sd+s*.6,a1:sd+s*-1.4,n:4}),{len:.12,wid:1.3,flow:new CM_V(s*.4,-.3,-1),lift:.45,col:[K.pale,mix(K.pale,0xffffff,.5)],nm:'cheek2'});
    // ---------------- legs ----------------
    const fx=.112,hx=.122,leg=(r,s2,cc,k)=>{const y=r.p.y;let h=cc*s<-.4?K.pale:mix(K.main,K.pale,.35);if(y<.26)h=mix(h,mix(K.emb,K.embD,.3),ss(.26,.12,y)*.85*(1-ss(.1,.07,y)));if(y<.07)h=K.pale;if(y>.42&&k)h=coat(s2*.5+.2);return h};
    cmLeg(B,{side:s,x:fx,name:'fleg'+s,seg:10,sub:2,pts:[
        [.56,.285,.03,.035,.04,['chest',F+'0',.25],.06],
        [.47,.27,.06,.072,.068,F+'0'],[.37,.255,.05,.058,.06,F+'0'],[.26,.245,.038,.038,.055,[F+'0',F+'1',.5]],
        [.18,.25,.032,.033,.034,F+'1'],[.105,.24,.027,.029,.029,[F+'1',F+'2',.6]],[.055,.252,.026,.027,.025,F+'2']],
      paint:(r,s2,cc)=>leg(r,s2,cc,0)});
    cmPaw(B,{side:s,x:fx,y:.06,z:.275,bone:F+'2',len:.068,wide:.035,h:.024,col:K.pale,pad:0x2a2224,claw:K.claw});
    cmLeg(B,{side:s,x:hx,name:'hleg'+s,seg:10,sub:2,pts:[
        [.56,-.3,.035,.045,.05,['pelvis',Hh+'0',.35],.06],[.46,-.27,.07,.098,.096,Hh+'0'],[.35,-.235,.054,.064,.068,Hh+'0'],
        [.265,-.22,.037,.04,.044,[Hh+'0',Hh+'1',.5]],[.19,-.265,.03,.028,.044,Hh+'1'],[.12,-.312,.025,.026,.033,[Hh+'1',Hh+'2',.5]],[.06,-.29,.024,.025,.024,Hh+'2']],
      paint:(r,s2,cc)=>leg(r,s2,cc,1)});
    cmPaw(B,{side:s,x:hx,y:.055,z:-.262,bone:Hh+'2',len:.066,wide:.033,h:.023,col:K.pale,pad:0x2a2224,claw:K.claw});
    // elbow feathering and the haunch breeches
    B.fringe(B.row('fleg'+s,{u0:.28,u1:.48,a:-Math.PI/2,n:3}),{len:.09,wid:1.5,flow:new CM_V(0,-1,-.6),lift:.5,col:[K.pale,mix(K.pale,0xffffff,.4)],nm:'elbow'});
    B.fringe(B.row('hleg'+s,{u0:.12,u1:.4,a:-Math.PI/2+s*-.5,n:4}),{len:.1,wid:1.4,flow:new CM_V(0,-1,-.4),lift:.45,col:[K.main,K.pale],nm:'breeches'});
  });
  // ---------------- tail: a full brush ending in an ember flame ----------------
  const Tl=B.loft({name:'tail',seg:10,sub:2,capA:0,capB:2,rings:[
      {p:[0,.525,-.41],rx:.042,ryT:.042,ryB:.042,b:['pelvis','tail0',.6]},{p:[0,.49,-.5],rx:.06,ryT:.062,ryB:.06,b:'tail0'},
      {p:[0,.43,-.61],rx:.07,ryT:.072,ryB:.07,b:['tail0','tail1',.5]},{p:[0,.37,-.72],rx:.07,ryT:.072,ryB:.07,b:'tail1'},
      {p:[0,.32,-.82],rx:.06,ryT:.062,ryB:.06,b:['tail1','tail2',.5]},{p:[0,.285,-.9],rx:.042,ryT:.044,ryB:.042,b:'tail2'},
      {p:[0,.27,-.95],rx:.02,ryT:.02,ryB:.02,b:['tail2','tail3',.5]}],
    paint:(r,s,c,u)=>u>.62?mix(K.back,K.emb,ss(.62,.9,u)):coat(s*.8+.1)});
  const tcol=(t,dk)=>t>.62?[mix(K.back,K.emb,ss(.6,.85,t)),mix(K.emb,K.embL,ss(.75,1,t))]:[dk?K.back:K.main,dk?K.main:K.pale];
  [[Math.PI/2,1],[Math.PI*.15,0],[Math.PI*.85,0],[-Math.PI*.25,0],[-Math.PI*.75,0]].forEach(([a,dk],k)=>
    B.fringe(B.row(Tl,{u0:.08+k*.02,u1:.97,a,n:7}),{len:(i,t)=>.1+.09*Math.sin(t*Math.PI*.9),wid:1.3,flow:q=>q.t,lift:.35+.1*(k%2),curl:.15,col:(i,t)=>tcol(t,dk),nm:'tail'+k}));
  // ---------------- the mane: three rows of big spikes over the neck and withers, a dorsal ridge, the chest tuft ----------------
  const back=q=>q.t.clone().negate().add(new CM_V(0,-.25,0));
  B.fringe(B.row(N,{u:.82,a0:-.35,a1:Math.PI+.35,n:8}),{len:i=>.13+.05*Math.sin(i/7*Math.PI),wid:1.3,flow:back,lift:.6,col:i=>[K.main,i>1&&i<6?K.back:K.pale],nm:'mane0'});
  B.fringe(B.row(N,{u:.5,a0:-.25,a1:Math.PI+.25,n:8}),{len:i=>.17+.06*Math.sin(i/7*Math.PI),wid:1.3,flow:back,lift:.6,col:i=>[K.main,i>1&&i<6?K.back:K.pale],nm:'mane1'});
  B.fringe(B.row(N,{u:.15,a0:-.1,a1:Math.PI+.1,n:7}),{len:i=>.18+.07*Math.sin(i/6*Math.PI),wid:1.3,flow:back,lift:.55,col:i=>[K.main,i>1&&i<5?K.deep:K.main],nm:'mane2'});
  B.fringe(B.row(T,{u0:.02,u1:.36,a:Math.PI/2,n:6}),{len:(i,t)=>.15-.09*t,flow:q=>q.t,lift:.6,wid:1.6,col:(i,t)=>[K.back,t<.4?K.embD:K.deep],nm:'ridge'});
  B.fringe(B.row(N,{u0:.05,u1:.6,a:-Math.PI/2,n:4}),{len:.15,flow:new CM_V(0,-1,-.35),lift:.4,wid:2.2,col:[K.pale,0xf8f6f2],nm:'bib'});
  B.fringe(B.row(T,{u:.06,a0:-Math.PI/2-.9,a1:-Math.PI/2+.9,n:5}),{len:.14,wid:1.4,flow:new CM_V(0,-1,-.5),lift:.35,col:[K.pale,0xf8f6f2],nm:'chest'});
  B.fringe(B.row(T,{u0:.18,u1:.5,a:-Math.PI/2,n:4}),{len:.08,flow:new CM_V(0,-1,-.3),lift:.35,wid:2.4,col:[K.pale,K.pale],nm:'belly'});
  // ---------------- anchors for traits and variants (bone + model-space point) ----------------
  const pt=(L,u,a,b)=>{const q=B.at(L,u,a,.01);return [b,q.p.x,q.p.y,q.p.z]};
  B.head=pt(H,.25,Math.PI/2,'head');B.back=[pt(N,.5,Math.PI/2,'neck'),pt(T,.1,Math.PI/2,'chest'),pt(T,.25,Math.PI/2,'chest'),pt(T,.45,Math.PI/2,'spine'),pt(T,.6,Math.PI/2,'spine')];
  B.up=.11;B.armor=.19}
cm172Def('Ashwolf','Ashwolf',{sc:1.16,tex:'fur',build:aw172Build,post(x){cm172Hinge(x,'jaw',AW172.hinge,.08)}});
cm172Install('Ashwolf');
