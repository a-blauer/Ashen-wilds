// ================= v172 Drakelet, remastered =================
// Direction from the original (0660): a young purple drake on four legs with bat wings, swept bone horns, cheek spikes, a bony
// ridge down the back, a spade tail, banded pale belly plates, orange eyes and the spell Ember Breath.
// Built with the method of docs/CREATURE_RECIPE.md (the Ashwolf): a smooth body with a PAINTED scale texture (cm172Tex 'scale'),
// a few big readable shapes for the silhouette, bold colour design and one theme accent:
//  * anatomy: a lithe lizard body (deep chest, narrow waist, heavy thighs), an S-curved neck, a long wedge skull with a heavy
//    brow, a jaw hinged behind the eye (cm172Hinge), two rows of small teeth and four fangs; three-toed feet with long ivory claws;
//  * silhouette: two great swept-back horns and brow horns, cheek frills, a dorsal crest of membrane spines from the crown to
//    the tail, a spade at the tail tip, and membrane wings with an arm, three finger bones and a scalloped trailing edge;
//  * colour: deep violet back, the companion colour on the flanks, cream ventral plates banded from throat to tail; ivory horns
//    and claws; the Ember Breath accent: ember eyes, a glowing seam down the throat, ember edges on the crest and frills.
// Bones (SPEC.Drakelet): pelvis spine chest neck head jaw tail0-3 fl0-2 fr0-2 hl0-2 hr0-2 (fl / hl at -x).
var DK172={hinge:[0,.656,.6]};
function dk172Pal(C){const m=cmCol(lpMain(C,.12)),hsl={};m.getHSL(hsl);
  return {main:m.getHex(),back:new THREE.Color().setHSL(hsl.h,Math.min(.6,hsl.s+.05),Math.max(.08,hsl.l*.32)).getHex(),
    side:new THREE.Color().setHSL(hsl.h,hsl.s,Math.min(.6,hsl.l*1.1)).getHex(),plate:0xd8c49a,plateD:0xa8946c,bone:0xe8dcc0,boneD:0x6a5a48,
    emb:0xff7a26,embD:0xb8361a,nose:0x140c10,gum:0x2a0c14,tooth:0xf0e8d4,claw:0xd8ccb0}}
function dk172Build(B,c,C,red){const K=dk172Pal(C),eye=red?0xff3020:0xffb030,sd=s=>s>0?0:Math.PI,mix=cmMix,ss=cmSS;
  // scale colour: dark back → flank → belly plates (bands along the body)
  const hide=(s,u,bands)=>{if(s<-.62){const b=Math.floor(u*bands)%2;return mix(b?K.plate:K.plateD,K.plate,ss(-.62,-.9,s)*.4)}
    const t=ss(-.62,.8,s);return t>.55?mix(K.main,K.back,ss(.55,1,t)):mix(mix(K.plate,K.main,.6),K.main,ss(0,.55,t))};
  // ---------------- torso ----------------
  const T=B.loft({name:'torso',seg:16,sub:2,capA:0,capB:0,tile:.24,rings:[
      {p:[0,.5,.34],rx:.1,ryT:.1,ryB:.11,b:['neck','chest',.5]},
      {p:[0,.492,.22],rx:.13,ryT:.12,ryB:.14,b:'chest'},
      {p:[0,.476,.1],rx:.13,ryT:.115,ryB:.13,b:['chest','spine',.5]},
      {p:[0,.466,-.02],rx:.115,ryT:.108,ryB:.112,b:'spine'},
      {p:[0,.466,-.14],rx:.114,ryT:.108,ryB:.108,b:['spine','pelvis',.5]},
      {p:[0,.466,-.26],rx:.125,ryT:.115,ryB:.112,b:'pelvis'},
      {p:[0,.456,-.36],rx:.095,ryT:.09,ryB:.088,b:['pelvis','tail0',.4]}],
    paint:(r,s,c,u)=>hide(s,u,11)});
  // ---------------- tail (continues the torso) ----------------
  const Tl=B.loft({name:'tail',seg:12,sub:2,capA:0,capB:2,tile:.2,rings:[
      {p:[0,.458,-.33],rx:.095,ryT:.09,ryB:.088,b:['pelvis','tail0',.5]},{p:[0,.45,-.5],rx:.068,ryT:.07,ryB:.066,b:['tail0','tail1',.4]},
      {p:[0,.466,-.68],rx:.05,ryT:.054,ryB:.05,b:'tail1'},{p:[0,.495,-.84],rx:.038,ryT:.042,ryB:.038,b:['tail1','tail2',.5]},
      {p:[0,.522,-.98],rx:.029,ryT:.032,ryB:.029,b:'tail2'},{p:[0,.545,-1.1],rx:.02,ryT:.022,ryB:.02,b:['tail2','tail3',.5]},{p:[0,.56,-1.19],rx:.012,ryT:.013,ryB:.012,b:'tail3'}],
    paint:(r,s,c,u)=>hide(s,u,14)});
  // ---------------- neck: an S-curve rising to the head ----------------
  const N=B.loft({name:'neck',seg:14,sub:2,tile:.2,rings:[
      {p:[0,.5,.3],rx:.1,ryT:.1,ryB:.115,b:['neck','chest',.6]},{p:[0,.555,.37],rx:.078,ryT:.078,ryB:.088,b:'neck'},
      {p:[0,.618,.425],rx:.064,ryT:.066,ryB:.072,b:'neck'},{p:[0,.67,.48],rx:.058,ryT:.06,ryB:.062,b:['neck','head',.5]},{p:[0,.7,.53],rx:.055,ryT:.056,ryB:.058,b:'head'}],
    paint:(r,s,c,u)=>hide(s,u,6)});
  // ---------------- head ----------------
  const H=B.loft({name:'skull',seg:16,sub:3,capA:1,capB:2,capLen:.5,tile:.16,rings:[
      {p:[0,.702,.5],rx:.062,ryT:.058,ryB:.064,b:'head'},
      {p:[0,.712,.56],rx:.09,ryT:.058,ryB:.066,b:'head'},
      {p:[0,.71,.625],rx:.086,ryT:.05,ryB:.062,b:'head'},
      {p:[0,.698,.695],rx:.06,ryT:.042,ryB:.05,b:'head'},
      {p:[0,.686,.76],rx:.044,ryT:.036,ryB:.042,b:'head'},
      {p:[0,.678,.82],rx:.032,ryT:.03,ryB:.034,b:'head'},
      {p:[0,.674,.86],rx:.022,ryT:.024,ryB:.026,b:'head'}],
    sq:.18,
    prof:(a,u)=>{const c=Math.abs(Math.cos(a)),s=Math.sin(a);return 1+.14*c*Math.max(0,1-Math.abs(u-.36)*5)*(s>.1?1:.3)+.06*Math.pow(Math.max(0,s),6)*Math.max(0,1-Math.abs(u-.7)*3)}, // brow ridges, a ridge down the snout
    paint:(r,s,c,u)=>{if(u>.95&&s>-.2)return mix(K.back,K.nose,.6);if(s<-.6&&u>.35)return mix(K.nose,K.back,.3);return s<-.2?mix(K.plate,K.main,.5):hide(s,u,1)}});
  const Jw=B.loft({name:'jaw',seg:10,sub:2,capA:1,capB:2,capLen:.5,tile:.16,rings:[
      {p:[0,.655,.58],rx:.062,ryT:.026,ryB:.032,b:['head','jaw',.5]},{p:[0,.645,.66],rx:.052,ryT:.022,ryB:.029,b:'jaw'},
      {p:[0,.641,.75],rx:.04,ryT:.019,ryB:.024,b:'jaw'},{p:[0,.644,.82],rx:.028,ryT:.015,ryB:.017,b:'jaw'}],
    paint:(r,s)=>s>.8?K.gum:s>.4?mix(K.nose,K.back,.3):mix(K.plate,K.main,.3)});
  B.loft({name:'mouth',seg:8,sub:1,capA:1,capB:1,rings:[
      {p:[0,.662,.61],rx:.036,ryT:.007,ryB:.007,b:['head','jaw',.5]},{p:[0,.66,.72],rx:.025,ryT:.006,ryB:.006,b:['head','jaw',.5]},{p:[0,.66,.8],rx:.015,ryT:.005,ryB:.005,b:['head','jaw',.5]}],col:K.gum});
  // ventral plates: cream scutes from the chin to the tail
  const pc=(i,t)=>i%2?K.plate:cmMix(K.plate,K.plateD,.5);
  cmPlates(B,'neck',{u0:.02,u1:.92,n:6,wf:.85,col:pc});cmPlates(B,'torso',{u0:.0,u1:.98,n:9,wf:.8,col:pc});cmPlates(B,'tail',{u0:.0,u1:.55,n:7,wf:.85,col:pc});
  // the throat seam: Ember Breath glowing between the plates
  // Ember Breath: a glow in the throat, seen between the scutes and in the mouth
  B.stroke(N,[[.55,-Math.PI/2],[.75,-Math.PI/2],[.97,-Math.PI/2]],.03,[K.embD,K.emb],{sl:'g',off:-.004,nm:'throat'});
  [-1,1].forEach(s=>{const F=s<0?'fl':'fr',Hh=s<0?'hl':'hr',A=a=>sd(s)+s*a;
    // nostrils with a faint ember glow, eyes under the brow, teeth
    B.put('k',cmSph(6,4),B.at(H,.9,A(.6),-.004).p,{s:[.009,.005,.01],W:B.W('head'),col:K.nose,nm:'nostril'});
    cmEye(B,B.at(H,.4,A(.5),0),{r:.014,col:eye,lid:0x0a0608,brow:K.back,ba:.75,bh:.8,pr:.22,pupil:0x1a0602});
    cmTeeth(B,[.48,.56,.64,.72,.8].map(u=>B.at(H,u,A(-.82),-.005)),{dir:[0,-1,.05],l:.011,r:.0045,fang:[3],fl:.03,fr:.008,col:K.tooth});
    cmTeeth(B,[.45,.62,.8].map(u=>B.at(Jw,u,A(.85),-.004)),{dir:[0,1,.1],l:.01,r:.004,fang:[2],fl:.022,fr:.006,col:K.tooth});
    // horns: a great pair swept back from the crown, a short pair over the brows; ivory, dark at the root
    B.spike('b',B.at(H,.2,A(1.0),-.01),.2,.026,{dir:new CM_V(s*.28,.32,-1).normalize(),by:.045,n:7,seg:5,col:K.boneD,col2:K.bone,nm:'horn'});
    B.spike('b',B.at(H,.34,A(.85),-.006),.075,.013,{dir:new CM_V(s*.35,.55,-1).normalize(),by:.012,n:6,col:K.boneD,col2:K.bone,nm:'brow horn'});
    B.spike('b',B.at(Jw,.15,A(-.2),-.006),.05,.009,{dir:new CM_V(s*.7,-.15,-1).normalize(),n:5,col:K.boneD,col2:K.bone,nm:'jaw spike'});
    // cheek frills: membrane spines fanning back from the cheek
    B.fringe(B.row(H,{u:.16,a0:A(.25),a1:A(-.9),n:4}),{sl:'f',len:i=>.09-i*.012,wid:1.25,flow:new CM_V(s*.5,0,-1),lift:.25,curl:.05,fold:.08,col:i=>[K.main,mix(K.back,K.embD,.5)],nm:'frill'});
    // ---------------- legs ----------------
    const leg=(r,s2,cc)=>{const y=r.p.y;let h=cc*s<-.4?mix(K.plate,K.main,.55):K.main;if(s2>.3)h=mix(h,K.back,.4);if(y<.14)h=mix(h,K.back,.5);return h};
    cmLeg(B,{side:s,x:.1,name:'fleg'+s,seg:10,sub:2,tile:.16,pts:[
        [.5,.24,.03,.035,.04,['chest',F+'0',.25],.07],[.4,.235,.055,.066,.06,F+'0'],[.31,.235,.045,.05,.05,F+'0'],
        [.2,.245,.033,.033,.042,[F+'0',F+'1',.5]],[.13,.24,.028,.03,.03,F+'1'],[.08,.225,.025,.027,.027,[F+'1',F+'2',.6]]],paint:leg});
    cmPaw(B,{side:s,x:.1,y:.085,z:.25,bone:F+'2',len:.07,wide:.034,h:.024,toes:3,col:K.back,pad:K.nose,claw:K.claw});
    cmLeg(B,{side:s,x:.112,name:'hleg'+s,seg:10,sub:2,tile:.16,pts:[
        [.52,-.27,.035,.045,.05,['pelvis',Hh+'0',.35],.07],[.42,-.255,.072,.096,.09,Hh+'0'],[.32,-.23,.055,.06,.065,Hh+'0'],
        [.22,-.21,.036,.038,.042,[Hh+'0',Hh+'1',.5]],[.16,-.25,.03,.028,.04,Hh+'1'],[.1,-.297,.025,.026,.03,[Hh+'1',Hh+'2',.5]],[.065,-.285,.024,.025,.024,Hh+'2']],paint:leg});
    cmPaw(B,{side:s,x:.112,y:.07,z:-.255,bone:Hh+'2',len:.068,wide:.033,h:.023,toes:3,col:K.back,pad:K.nose,claw:K.claw});
    // ivory spurs on the elbows and heels
    B.spike('b',B.at('fleg'+s,.5,-Math.PI/2,0),.04,.008,{dir:new CM_V(0,-.2,-1).normalize(),col:K.boneD,col2:K.bone,nm:'spur'});
    B.spike('b',B.at('hleg'+s,.82,-Math.PI/2,0),.035,.007,{dir:new CM_V(0,.2,-1).normalize(),col:K.boneD,col2:K.bone,nm:'heel spur'});
  });
  // ---------------- dorsal crest: membrane spines from the crown down the neck, back and tail ----------------
  const crest=(i,t)=>[K.back,t<.95?mix(K.back,K.embD,.55):K.emb];
  B.fringe(B.row(H,{u0:.08,u1:.3,a:Math.PI/2,n:2}),{len:.06,flow:q=>q.t.clone().negate(),lift:.9,wid:1.3,col:crest,nm:'crest head'});
  B.fringe(B.row(N,{u0:.97,u1:.05,a:Math.PI/2,n:5}),{len:(i,t)=>.06+.025*t,flow:q=>q.t.clone().negate(),lift:1.05,wid:1.2,col:crest,nm:'crest neck'});
  B.fringe(B.row(T,{u0:.0,u1:1,a:Math.PI/2,n:7}),{len:(i,t)=>.085-.02*t,flow:q=>q.t,lift:1.05,wid:1.15,col:crest,nm:'crest back'});
  B.fringe(B.row(Tl,{u0:.0,u1:.86,a:Math.PI/2,n:9}),{len:(i,t)=>.065-.045*t,flow:q=>q.t,lift:1.0,wid:1.15,col:crest,nm:'crest tail'});
  // the spade at the tail tip: a broad leaf of horn, edged in ember
  const qs=B.at(Tl,.93,Math.PI/2,-.02);
  B.put('k',cmG('spade',()=>cmShell([[0,.5],[.42,.05],[.62,-.35],[.3,-.42],[0,-1],[-.3,-.42],[-.62,-.35],[-.42,.05]],.1,.0,.14)),qs.p,{ax:{y:qs.t.clone().negate(),z:new CM_V(0,1,0)},s:[.2,.17,.06],W:qs.W,
    paint:l=>mix(K.back,K.embD,ss(-.2,-.9,l.y)),nm:'spade'});
  // ---------------- anchors for traits and variants ----------------
  const pt=(L,u,a,b)=>{const q=B.at(L,u,a,.01);return [b,q.p.x,q.p.y,q.p.z]};
  B.head=pt(H,.28,Math.PI/2,'head');B.back=[pt(N,.5,Math.PI/2,'neck'),pt(T,.1,Math.PI/2,'chest'),pt(T,.4,Math.PI/2,'spine'),pt(T,.8,Math.PI/2,'pelvis'),pt(Tl,.35,Math.PI/2,'tail1')];
  B.up=.1;B.armor=.17}
// the wings: an arm (shoulder, elbow, wrist), three finger bones, a scalloped membrane, pale veins
function dk172Wing(C){const K=dk172Pal(C);return cmWing({key:'drk172|'+C,tile:.22,
  outline:[[0,.06],[.3,.1],[.52,.06],[.97,-.12],[.82,-.2],[.8,-.4],[.64,-.38],[.58,-.58],[.42,-.45],[.28,-.54],[.15,-.38],[0,-.3]],
  camber:(x,z)=>.05*Math.sin(Math.min(1,x/.9)*Math.PI)*(1+z)-.02*x,
  mem:(x,z)=>{const d=Math.hypot(x,z);return cmMix(cmMix(K.back,K.main,.4),cmMix(K.back,K.embD,.5),cmSS(.5,1,d))},
  struts:[[[0,.012,.06],[.3,.08,.1],.016,.012],[[.3,.08,.1],[.52,.09,.06],.012,.009],[[.52,.09,.06],[.97,-.04,-.12],.008,.003],[[.52,.09,.06],[.8,-.02,-.4],.007,.003],
    [[.52,.09,.06],[.58,-.01,-.58],.007,.003],[[.52,.09,.06],[.28,.0,-.54],.006,.002],[[.52,.09,.06],[.56,.15,.12],.01,.003]],strut:cmMix(K.back,K.bone,.25)})}
cm172Def('Drakelet','Drakelet',{sc:1.1,tex:'scale',ftex:'scale',build:dk172Build,post(x,c,C){cm172Hinge(x,'jaw',DK172.hinge,.06);
  cmWingPair(x,'chest',dk172Wing(C),cm172TexMat('skin','w',1),.1,.575,.14,.35,.25)}});
cm172Install('Drakelet');
