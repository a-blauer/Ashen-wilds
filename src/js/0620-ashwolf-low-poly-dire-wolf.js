// ================= Ashwolf: low-poly dire-wolf (v81 toolkit) — also Direfang and Skollmaw =================
// Rings are written in the Foxlet TEMPLATE space and mapped onto the stretched Ashwolf skeleton with lpT (longer snout, taller, wider).
// body ring: [z, y, half width, half height above, half height below, [boneA,boneB,blend], belly line]
var WOLF_BODY=[
  [.778,.548,.02,.016,.016,['head','head',0],'nose'],
  [.762,.552,.035,.028,.026,['head','head',0],'nose'],
  [.72,.557,.056,.039,.036,['head','head',0],-.1],
  [.66,.568,.072,.049,.044,['head','head',0],-.1],
  [.6,.588,.092,.06,.05,['head','head',0],0],
  [.535,.606,.12,.08,.068,['head','head',0],.05],
  [.47,.612,.112,.086,.08,['head','head',0],0],
  [.41,.588,.1,.092,.09,['neck','head',.5],-.1],
  [.35,.556,.12,.12,.12,['neck','neck',0],-.15],
  [.27,.522,.145,.155,.16,['neck','chest',.6],-.25],
  [.17,.492,.152,.165,.18,['chest','chest',0],-.4],
  [.06,.48,.135,.14,.15,['chest','spine',.5],-.5],
  [-.05,.472,.106,.112,.098,['spine','spine',0],-.55],
  [-.16,.472,.106,.11,.098,['spine','pelvis',.6],-.55],
  [-.26,.477,.12,.116,.112,['pelvis','pelvis',0],-.6],
  [-.34,.467,.092,.092,.085,['pelvis','tail0',.3],-.75],
  [-.39,.46,.05,.05,.05,['tail0','tail0',0],-1]];
// hanging tail: [z, y, radius, bones, dark tip?]
var WOLF_TAIL=[
  [-.33,.462,.05,['tail0','tail0',0]],[-.42,.445,.072,['tail0','tail1',.2]],[-.53,.425,.088,['tail0','tail1',.6]],
  [-.65,.405,.092,['tail1','tail1',0]],[-.77,.39,.086,['tail1','tail2',.6]],[-.87,.38,.072,['tail2','tail2',0],1],
  [-.96,.374,.048,['tail2','tail3',.6],1],[-1.03,.372,.01,['tail3','tail3',0],1]];
// legs: [x, y, z, half width, half depth, bones, dark lower?]
function wolfLegs(s){
  const f=(x,y,z,rx,rz,b,d)=>[s*x,y,z,rx,rz,b,d],F=s<0?'fl':'fr',H=s<0?'hl':'hr';
  return [
    [f(.095,.48,.19,.076,.09,['chest',F+'0',.5]),f(.104,.36,.2,.064,.078,[F+'0',F+'0',0]),f(.104,.23,.22,.05,.056,[F+'0',F+'1',.7]),
     f(.104,.15,.212,.042,.045,[F+'1',F+'1',0],1),f(.104,.075,.2,.039,.042,[F+'1',F+'2',.8],1),f(.104,.04,.205,.036,.04,[F+'2',F+'2',0],1)],
    [f(.1,.5,-.24,.09,.125,['pelvis',H+'0',.4]),f(.117,.38,-.23,.082,.108,[H+'0',H+'0',0]),f(.117,.27,-.2,.06,.07,[H+'0',H+'1',.6]),
     f(.114,.2,-.2,.04,.047,[H+'1',H+'1',0]),f(.114,.12,-.248,.034,.037,[H+'1',H+'2',.7],1),f(.114,.045,-.255,.034,.037,[H+'2',H+'2',0],1)]];
}
// template → Ashwolf model space; radii scale with the rig's width/height stretch
function wolfP(p){return lpT('Ashwolf',p)}
function wolfCols(C){
  const main=lpMain(C,.12),back=main.clone().multiplyScalar(.55),belly=main.clone().lerp(new THREE.Color(0xc4c2b8),.62),dark=main.clone().multiplyScalar(.32);
  return {main,back,belly,dark}}
LPR.Ashwolf={
  sc:1.16,
  head:['head',...wolfP([0,.69,.5])],up:.11,
  back:[['neck',...wolfP([0,.64,.36])],['chest',...wolfP([0,.64,.2])],['chest',...wolfP([0,.62,.07])],['spine',...wolfP([0,.59,-.06])],['spine',...wolfP([0,.59,-.19])]],
  geo(C){
    const K=wolfCols(C),nose=new THREE.Color(0x121014);
    const ring=(z,y,rx,ryT,ryB,b,ex)=>Object.assign({p:wolfP([0,y,z]),rx:rx*1.1,ryT:ryT*1.2,ryB:ryB*1.2,b},ex);
    return lpGeo('Ashwolf|'+C,'Ashwolf',[
      {rings:WOLF_BODY.map(r=>ring(r[0],r[1],r[2],r[3],r[4],r[5],{bl:r[6]})),seg:8,capA:1,capB:1,paint:(o,r,s)=>{
        if(r.bl=='nose')return o.copy(nose);o.copy(K.main);if(s>.45)o.lerp(K.back,Math.min(1,(s-.45)*2.4));
        const t=Math.min(1,Math.max(0,(r.bl-s)*3.2));if(t>0)o.lerp(K.belly,t)}},
      {rings:WOLF_TAIL.map(r=>ring(r[0],r[1],r[2],r[2]*.92,r[2],r[3],{tip:r[4]})),seg:7,capA:1,capB:1,paint:(o,r,s)=>{
        o.copy(r.tip?K.dark:K.main);if(!r.tip&&s>.3)o.lerp(K.back,.65);if(!r.tip&&s<-.6)o.lerp(K.belly,.4)}}]
      .concat([].concat(...[-1,1].map(s=>wolfLegs(s).map(L=>({rings:L.map(r=>({p:wolfP([r[0],r[1],r[2]]),rx:r[3]*1.1,ryT:r[4]*1.1,ryB:r[4]*1.1,b:r[5],d:r[6]})),seg:6,ref:[0,0,1],capB:1,paint:(o,r,sn)=>{
        o.copy(K.main);if(r.d)o.lerp(K.dark,.55);else if(r.p[1]<.35)o.lerp(K.dark,.25);if(sn<-.4&&!r.d)o.lerp(K.back,.35)}}))))));
  },
  kit(k,c,C,red){
    const K=wolfCols(C),back=K.back.getHex(),belly=K.belly.getHex(),dark=K.dark.getHex(),ruff=K.main.clone().lerp(K.belly,.2).getHex(),eye=red?0xff2a2a:0xd8e040;
    const P=wolfP,L=(bn,t,col,a,b,r1,r2,sg)=>k.L(bn,t,col,P(a),P(b),r1,r2,sg),B=(bn,t,col,p,sx,sy,sz,rx,ry,rz)=>{const q=P(p);k.p(bn,'box',t,col,q[0],q[1],q[2],sx,sy,sz,rx,ry,rz)};
    // nose, jaw, mouth
    B('head','c',0x0c0a0c,[0,.557,.775],.05,.036,.04);
    L('jaw','c',K.main.clone().lerp(K.belly,.5).getHex(),[0,.535,.5],[0,.535,.74],.044,.018,5);
    B('jaw','c',0x3a0e10,[0,.55,.64],.04,.01,.14);
    [-1,1].forEach(s=>{
      // sunken eye, yellow glow, heavy angry brow
      B('head','c',0x08070a,[s*.074,.632,.57],.05,.03,.018,0,s*.6,-s*.2);
      B('head','g',eye,[s*.083,.634,.574],.036,.013,.008,0,s*.6,-s*.25);
      B('head','c',back,[s*.068,.658,.566],.066,.022,.04,0,s*.55,s*.36);
      // fangs: long upper canines, smaller lower ones
      const f=P([s*.036,.513,.71]);k.p('head','cone4','c',0xe8e0c8,f[0],f[1],f[2],.013,.062,.013,Math.PI);
      const g=P([s*.022,.548,.685]);k.p('jaw','cone4','c',0xe0d8c0,g[0],g[1],g[2],.009,.03,.009);
      // cheek shag sweeping back
      L('head','c',ruff,[s*.095,.575,.52],[s*.16,.545,.43],.055,.006,5);
      L('head','c',ruff,[s*.09,.6,.48],[s*.15,.59,.4],.045,.005,5);
      // a pale scar across the muzzle on one side
      if(s>0)B('head','c',0x9a948a,[.045,.6,.63],.004,.04,.012,0,0,.5);
    });
    // shaggy ruff ringing the neck (pointing back and out)
    for(let i=0;i<11;i++){const a=-Math.PI*.15+i/10*Math.PI*1.3,cx=Math.cos(a),sy=Math.sin(a);
      L(sy>.3?'neck':'chest','c',i%2?ruff:dkShade(ruff,.82),[cx*.09,.53+sy*.09,.38],[cx*.135,.51+sy*.125,.27],.07,.006,5)}
    // throat bib
    [-1,0,1].forEach(i=>L('chest','c',belly,[i*.05,.43,.3],[i*.065,.33,.22],.05,.004,4));
    // hackles: ragged dark fur along neck and shoulders
    [[.42,.66,'head'],[.35,.645,'neck'],[.28,.64,'neck'],[.2,.64,'chest'],[.12,.625,'chest'],[.03,.6,'chest']].forEach((q,i)=>
      [-1,1].forEach(s=>L(q[2],'c',i%2?back:dark,[s*.025,q[1]-.035,q[0]],[s*.045,q[1]+.012,q[0]-.1],.035,.003,4)));
    // tail shag
    // v177: placed on the tail as v100 shortened (z ×.8 from the root) and slimmed it (×.72); they hung off its sides
    const tk=WOLF_TAIL.v100?.72:1,tz=z=>WOLF_TAIL.v100?-.33+(z+.33)*.8:z;
    [['tail1',.43,-.6],['tail1',.4,-.72],['tail2',.39,-.84]].forEach(q=>[-1,1].forEach(s=>L(q[0],'c',dkShade(back,1.2),[s*.05*tk*.8,q[1],tz(q[2])],[s*.09*tk,q[1]-.04,tz(q[2]-.12)],.04*tk,.003,4)));
    // big paws with black claws
    [['fl2',-.104,.215],['fr2',.104,.215],['hl2',-.114,-.24],['hr2',.114,-.24]].forEach(f=>{B(f[0],'c',dark,[f[1],.022,f[2]+.03],.08,.045,.11);
      [-1,0,1].forEach(i=>{const q=P([f[1]+i*.022,.014,f[2]+.088]);k.p(f[0],'cone4','c',0x08080a,q[0],q[1],q[2],.009,.04,.009,Math.PI/2)})});
  },
  post(x,c,C,mat){
    // shorter, wider ears than the fox, laid slightly back
    const K=wolfCols(C),og=lpSpikeGeo(K.main.clone().lerp(K.back,.3),K.dark),ig=lpSpikeGeo(0x6a645c,0x2a2622);
    [-1,1].forEach(s=>{const q=wolfP([s*.064,.668,.46]);const p=lpPart(x.S,x.bones,'head',og,mat,q[0],q[1],q[2],.07,.15,.03,-.15,-s*.25,0);
      const n=new THREE.Mesh(ig,mat);n.scale.set(.6,.66,.5);n.position.set(0,.02,.45);p.children[0].add(n);p.userData={rz:-s*.3,sd:s};x.ears.push(p)});
  }};

