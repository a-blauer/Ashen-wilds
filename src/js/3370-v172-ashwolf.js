// ================= v172 Ashwolf, remastered =================
// Direction from the original (0620): a lean grey dire wolf with a shaggy ruff, dark hackles, a scarred muzzle, yellow eyes
// and long fangs. Now a serious timber wolf built to the mini-boss standard:
//  * Anatomy: a deep keel chest reaching the elbows, a tucked waist, strong haunches; withers higher than the rump; a wedge
//    skull with a sloping stop, wide cheekbones, a narrow muzzle and a lower jaw hinged under the ear (cm172Hinge), lips, a dark
//    mouth, fangs and a row of teeth; small amber eyes under a heavy brow; upright ears set back.
//  * Legs: shoulder blade, upper arm, elbow, forearm, wrist and an angled pastern in front; thigh, stifle, gaskin and an angled
//    hock behind; four-toed paws with knuckles, pads and black claws.
//  * Fur (shingled locks, the Vorraxis scale method): a heavy mane and hackles, a dark saddle down the back, a cheek ruff,
//    a pale throat bib, breeches on the haunches and a full brush tail with a charcoal tip.
//  * Colours from the companion colour: grey with a charcoal saddle and muzzle top, pale underneath and inside the legs.
// Bones (SPEC.Ashwolf): pelvis spine chest neck head jaw tail0-3 fl0-2 fr0-2 hl0-2 hr0-2 (fl / hl at -x).
var AW172={hinge:[0,.668,.62]};
function aw172Build(B,c,C,red){const K=cm172Pal(C,{mute:.1,back:.52,belly:.42}),eye=red?0xe02818:0xd8a028,nose=0x0c0b0c,gum=0x1e0c0c,tooth=0xe2d8c0,claw=0x121012;
  const sad=K.back,deep=K.dark,cream=K.belly,ash=cmMix(K.main,0xd0ccc4,.2),side=s=>s>0?0:Math.PI;
  // ---------------- torso: chest to rump (front → back) ----------------
  const T=B.loft({name:'torso',seg:12,sub:2,capA:0,capB:2,rings:[
      {p:[0,.585,.42],rx:.105,ryT:.115,ryB:.13,b:['neck','chest',.5]},
      {p:[0,.565,.32],rx:.148,ryT:.15,ryB:.2,b:'chest'},
      {p:[0,.545,.18],rx:.155,ryT:.15,ryB:.205,b:'chest'},
      {p:[0,.53,.04],rx:.138,ryT:.135,ryB:.15,b:['chest','spine',.5]},
      {p:[0,.525,-.1],rx:.11,ryT:.12,ryB:.092,b:'spine'},
      {p:[0,.52,-.2],rx:.116,ryT:.12,ryB:.095,b:['spine','pelvis',.5]},
      {p:[0,.515,-.3],rx:.128,ryT:.125,ryB:.115,b:'pelvis'},
      {p:[0,.505,-.4],rx:.1,ryT:.1,ryB:.1,b:['pelvis','tail0',.25]}],
    prof:(a,u)=>{const s=Math.sin(a);return 1+.05*Math.max(0,-s)*Math.max(0,1-Math.abs(u-.3)*4)-.03*Math.pow(Math.max(0,s),8)},
    paint:(r,s,c,u)=>u<.2&&s<-.2?cream:cmCounter(K,s,{t1:.35,t0:-.3})});
  // ---------------- neck ----------------
  const N=B.loft({name:'neck',seg:12,sub:2,rings:[
      {p:[0,.565,.34],rx:.118,ryT:.13,ryB:.15,b:['neck','chest',.6]},
      {p:[0,.62,.46],rx:.098,ryT:.108,ryB:.118,b:'neck'},
      {p:[0,.675,.54],rx:.086,ryT:.092,ryB:.092,b:['neck','head',.5]},
      {p:[0,.71,.585],rx:.078,ryT:.078,ryB:.082,b:'head'}],
    paint:(r,s)=>s<-.1?cream:cmCounter(K,s,{t1:.2})});
  // ---------------- head: skull and upper muzzle ----------------
  const H=B.loft({name:'skull',seg:14,sub:2,capA:1,capB:2,capLen:.6,rings:[
      {p:[0,.722,.53],rx:.072,ryT:.068,ryB:.072,b:'head'},
      {p:[0,.736,.595],rx:.092,ryT:.08,ryB:.076,b:'head'},
      {p:[0,.733,.66],rx:.09,ryT:.068,ryB:.066,b:'head'},
      {p:[0,.716,.72],rx:.064,ryT:.05,ryB:.056,b:'head'},
      {p:[0,.702,.79],rx:.047,ryT:.041,ryB:.045,b:'head'},
      {p:[0,.694,.855],rx:.034,ryT:.035,ryB:.036,b:'head'},
      {p:[0,.69,.9],rx:.026,ryT:.029,ryB:.03,b:'head'}],
    prof:(a,u)=>{const c=Math.abs(Math.cos(a)),s=Math.sin(a);return 1+.09*c*Math.max(0,1-Math.abs(u-.35)*5)*(s<.3?1:.4)}, // cheekbones
    paint:(r,s,c,u)=>{if(u>.965&&s>-.1)return nose;if(s<-.8&&u>.42)return cmMix(nose,deep,.5);if(u>.4&&s>.35)return cmMix(sad,deep,.3);if(s<-.15)return cream;return cmCounter(K,s,{t1:.3})}});
  // ---------------- lower jaw (hinged under the ear) and the mouth ----------------
  const Jw=B.loft({name:'jaw',seg:10,sub:2,capA:1,capB:2,capLen:.5,rings:[
      {p:[0,.664,.62],rx:.058,ryT:.03,ryB:.032,b:['head','jaw',.5]},
      {p:[0,.658,.7],rx:.042,ryT:.024,ryB:.027,b:'jaw'},
      {p:[0,.658,.79],rx:.031,ryT:.02,ryB:.022,b:'jaw'},
      {p:[0,.662,.86],rx:.022,ryT:.016,ryB:.015,b:'jaw'}],
    paint:(r,s,c,u)=>s>.8?gum:s>.45?cmMix(nose,deep,.4):cmMix(cream,K.main,.45)});
  // the mouth cavity between the jaws (dark), half on each so it stretches as the jaw opens
  B.loft({name:'mouth',seg:8,sub:1,capA:1,capB:1,rings:[
      {p:[0,.674,.65],rx:.036,ryT:.008,ryB:.008,b:['head','jaw',.5]},{p:[0,.672,.76],rx:.024,ryT:.007,ryB:.007,b:['head','jaw',.5]},{p:[0,.672,.84],rx:.015,ryT:.006,ryB:.006,b:['head','jaw',.5]}],col:gum});
  // nose leather
  B.put('k',cmBlob(3,.06,8),new CM_V(0,.712,.902),{s:[.016,.012,.014],W:B.W('head'),col:nose,nm:'nose'});
  [-1,1].forEach(s=>{
    // teeth: a long upper fang near the front with a row behind it; a lower fang on the jaw
    const up=[.5,.62,.74].map(u=>B.at(H,u,side(s)+s*-.78,-.006));cmTeeth(B,up,{dir:[0,-1,.1],l:.013,r:.005,fang:[2],fl:.036,fr:.009,col:tooth});
    cmTeeth(B,[B.at(Jw,.78,side(s)+s*.8,-.004)],{dir:[0,1,.15],l:.02,r:.006,col:tooth});
    // eyes under the brow
    cmEye(B,B.at(H,.46,side(s)+s*.45,0),{r:.013,col:eye,lid:0x0a0808,brow:cmMix(sad,deep,.3),ba:.45,pr:.3});
    // cheek ruff: broad locks sweeping back from the cheekbone
    for(let i=0;i<3;i++){const q=B.at(H,.17+i*.07,side(s)+s*(-.4+i*.3),-.004);B.on('f',CM_SH.lock(),q,{dir:new CM_V(s*.45,-.1,-1).normalize(),s:[.055,.075,.035],tilt:-.12,paint:l=>cmMix(K.main,cmMix(K.main,ash,.5),cmSS(.3,-.9,l.y)),nm:'cheek'})}
    // ears: upright, set back on the crown, cupped, fur inside
    const qa=B.at(H,.2,side(s)+s*1.08,-.014),dir=new CM_V(s*.3,1,-.3).normalize(),fz=new CM_V(s*.3,0,1).normalize();
    B.put('hide',cmG('ear',()=>cmShell([[0,.5],[.5,.35],[.42,0],[.2,-.5],[0,-.95],[-.2,-.5],[-.42,0],[-.5,.35]],.12,0,.18)),qa.p,{ax:{y:dir.clone().negate(),z:fz},s:[.068,.1,.06],W:qa.W,
      paint:l=>l.y<-.55?deep:cmMix(K.main,sad,.45),nm:'ear'});
    B.put('f',CM_SH.lock(),qa.p.clone().addScaledVector(dir,.04).addScaledVector(fz,.012),{ax:{y:dir.clone().negate(),z:fz},s:[.036,.055,.03],W:qa.W,col:cmMix(cream,0x6a5a4a,.4),nm:'ear fur'});
    // ---------------- legs ----------------
    const fx=.112,hx=.122,inner=(cc)=>cc*s<-.55,F=s<0?'fl':'fr',Hh=s<0?'hl':'hr';
    cmLeg(B,{side:s,x:fx,name:'fleg'+s,seg:8,sub:1,pts:[
        [.56,.285,.03,.035,.04,['chest',F+'0',.25],.06],
        [.47,.27,.06,.072,.068,F+'0'],[.37,.255,.05,.058,.06,F+'0'],[.26,.245,.038,.038,.055,[F+'0',F+'1',.5]],
        [.18,.25,.032,.033,.034,F+'1'],[.105,.24,.027,.029,.029,[F+'1',F+'2',.6]],[.055,.252,.026,.027,.025,F+'2']],
      paint:(r,ss,cc)=>r.p.y<.2&&ss>.4?cmMix(K.main,sad,.55):inner(cc)?cmMix(cream,K.main,.75):cmMix(K.main,sad,.35)});
    cmPaw(B,{side:s,x:fx,y:.06,z:.275,bone:F+'2',len:.068,wide:.035,h:.024,col:cmMix(K.main,sad,.45),claw});
    cmLeg(B,{side:s,x:hx,name:'hleg'+s,seg:8,sub:1,pts:[
        [.56,-.3,.035,.045,.05,['pelvis',Hh+'0',.35],.06],[.46,-.27,.07,.098,.096,Hh+'0'],[.35,-.235,.054,.064,.068,Hh+'0'],
        [.265,-.22,.037,.04,.044,[Hh+'0',Hh+'1',.5]],[.19,-.265,.03,.028,.044,Hh+'1'],[.12,-.312,.025,.026,.033,[Hh+'1',Hh+'2',.5]],[.06,-.29,.024,.025,.024,Hh+'2']],
      paint:(r,ss,cc)=>inner(cc)?cmMix(cream,K.main,.75):r.p.y>.4&&ss<-.3?cmMix(K.main,sad,.3):cmMix(K.main,sad,.35)});
    cmPaw(B,{side:s,x:hx,y:.055,z:-.262,bone:Hh+'2',len:.066,wide:.033,h:.023,col:cmMix(K.main,sad,.45),claw});
    // breeches on the haunch
    cmFur(B,'hleg'+s,{u0:.1,u1:.32,a0:-Math.PI/2-.8,a1:-Math.PI/2+.8,rows:2,n:3,size:.08,w:.9,col:()=>[K.main,cmMix(K.main,ash,.5)],lift:.12});
  });
  // ---------------- tail: a hanging brush ----------------
  B.loft({name:'tail',seg:9,sub:2,capA:0,capB:2,rings:[
      {p:[0,.525,-.41],rx:.042,ryT:.042,ryB:.042,b:['pelvis','tail0',.6]},{p:[0,.49,-.5],rx:.056,ryT:.056,ryB:.056,b:'tail0'},
      {p:[0,.43,-.61],rx:.064,ryT:.064,ryB:.064,b:['tail0','tail1',.5]},{p:[0,.37,-.72],rx:.064,ryT:.064,ryB:.064,b:'tail1'},
      {p:[0,.32,-.82],rx:.054,ryT:.054,ryB:.054,b:['tail1','tail2',.5]},{p:[0,.285,-.9],rx:.038,ryT:.038,ryB:.038,b:'tail2'},
      {p:[0,.27,-.95],rx:.02,ryT:.02,ryB:.02,b:['tail2','tail3',.5]}],
    paint:(r,s,c,u)=>u>.75?deep:s>.2?sad:K.main});
  cmFur(B,'tail',{u0:.12,u1:.9,rows:6,n:6,size:.12,w:.95,col:(a,u)=>u>.72?[sad,deep]:Math.sin(a)>.3?[sad,cmMix(sad,K.main,.3)]:[K.main,cmMix(K.main,ash,.5)],lift:.12,sz:(a,u)=>1-.35*Math.max(0,u-.6)});
  // ---------------- fur on the body ----------------
  // mane and hackles: big locks over the neck and withers, darker on top
  cmFur(B,'neck',{u0:.05,u1:.8,rows:4,n:7,a0:-Math.PI*.2,a1:Math.PI*1.2,size:.11,w:.95,back:1,col:(a)=>Math.sin(a)>.7?[sad,cmMix(sad,deep,.4)]:Math.sin(a)>.3?[K.main,sad]:[K.main,cmMix(K.main,ash,.5)],lift:.16,sz:(a,u)=>1.15-.3*u});
  // throat bib: pale locks under the neck pointing down and back
  cmFur(B,'neck',{u0:.05,u1:.55,rows:2,n:4,a0:-Math.PI/2-.7,a1:-Math.PI/2+.7,size:.085,w:.9,back:1,col:()=>[cmMix(cream,K.main,.55),cmMix(cream,K.main,.35)],lift:.15});
  // the saddle: rows of dark locks down the back to the waist
  cmFur(B,'torso',{u0:.04,u1:.5,rows:4,n:5,a0:Math.PI/2-.85,a1:Math.PI/2+.85,size:.09,w:.95,back:1,col:(a,u,r,k)=>Math.abs(a-Math.PI/2)<.35?[sad,cmMix(sad,deep,.3)]:[cmMix(sad,K.main,.5),sad],lift:.08,sz:(a,u)=>1.2-.6*u});
  // chest ruff
  cmFur(B,'torso',{u0:.03,u1:.14,rows:2,n:4,a0:-Math.PI/2-1,a1:-Math.PI/2+1,size:.08,w:.9,back:1,col:()=>[cmMix(cream,K.main,.55),cmMix(cream,K.main,.35)],lift:.18});
  // ---------------- anchors for traits and variants (bone + model-space point) ----------------
  const pt=(L,u,a,b)=>{const q=B.at(L,u,a,.01);return [b,q.p.x,q.p.y,q.p.z]};
  B.head=pt(H,.25,Math.PI/2,'head');B.back=[pt(N,.5,Math.PI/2,'neck'),pt(T,.1,Math.PI/2,'chest'),pt(T,.25,Math.PI/2,'chest'),pt(T,.45,Math.PI/2,'spine'),pt(T,.6,Math.PI/2,'spine')];
  B.up=.11;B.armor=.19}
cm172Def('Ashwolf','Ashwolf',{sc:1.16,build:aw172Build,post(x){cm172Hinge(x,'jaw',AW172.hinge,.08)}});
cm172Install('Ashwolf');
