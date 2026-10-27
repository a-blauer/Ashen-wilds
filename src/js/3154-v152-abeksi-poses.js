// ================= v152 Abeksi — how the snake folk move =================
// The citizens and guards are Naga models (mkHumanoid 'nagaw' / 'nagaa' / 'nagas', the hero skeleton HB). Walking uses the
// model's own gait (g.rig, driven by its real movement); everything else is a pose from this table, written from the rest
// pose every frame (czReset103, then P(bone, rx, ry, rz) adds to the rest rotation, P.dy drops the pelvis), with a breath and
// small head movements so nobody ever freezes. HB axes: shoulder/hip x − = forward, elbow x − = bend, knee x + = bend,
// shoulder z + = out (right arm; the left is mirrored), spine/head x + = forward/down, y = turn.
// AB152P[name] = f(P, t, S): t seconds (each actor has its own phase), S the actor (S.ht = head turn wanted by the brain).
// Tools in the right hand (AB152T): ladle, cleaver, broom, fork, hammer, cup, bone (a rat leg to eat), lantern (left hand),
// cage (both hands), platter, staff (shaman's), spear.
function ab152SS(a,b,x){const t=x<=a?0:x>=b?1:(x-a)/(b-a);return t*t*(3-2*t)}
var AB152P={
  idle(P,t,S){const b=Math.sin(t*1.6);P('chest',.02*b,0,0);P('head',.04+.02*b,S.ht||0,0);P('aR0',-.08,0,.06);P('aL0',-.08,0,-.06);P('aR1',-.15);P('aL1',-.15)},
  look(P,t,S){const b=Math.sin(t*1.4);P('spine',.04,0,0);P('chest',.02*b,(S.ht||0)*.35,0);P('neck',0,(S.ht||0)*.3,0);P('head',.02,(S.ht||0)*.4,.04*Math.sin(t*.7));
    P('aR0',-.25,0,.08);P('aR1',-.55);P('aL0',-.2,0,-.1);P('aL1',-.5)},
  // guarding a post: weapon held across the body, slow menace
  guard(P,t,S){const b=Math.sin(t*1.3);P('spine',.05,0,0);P('chest',.02*b,(S.ht||0)*.35,0);P('neck',0,(S.ht||0)*.3,0);P('head',.05,(S.ht||0)*.4,0);
    P('aR0',-.55,0,.12);P('aR1',-.85);P('aR2',.2);P('aL0',-.35,0,-.12);P('aL1',-.7);P('lh0',-.06);P('rh0',.06);P('lh1',.08);P('rh1',.08)},
  talk(P,t,S){const T=t+(S.tph||0),turn=(Math.floor(T/3.2)%2)==0,w=turn?1:0,a=T*3.1,g=Math.sin(a),h=Math.sin(a*.5);
    // speaking: the right hand rises and turns with the words, the head nods; listening: arms folded, head tilted
    P('aR0',-.35-.55*w+.18*g*w,0,.12+.12*w);P('aR1',-.6-.5*w+.25*g*w);P('aR2',.3*g*w);
    P('aL0',-.25-.3*(1-w),0,-.1-.1*(1-w));P('aL1',-.55-1.2*(1-w));P('chest',.03*h,.08*g*w,0);P('head',.08*Math.abs(h)*w-.06*(1-w),(S.ht||0)*.3,.12*(1-w));
    P('spine',.04*w,0,0)},
  sit(P,t,S){const b=Math.sin(t*1.2);P.dy(-.13);P('lh0',-1.42);P('rh0',-1.42);P('lh1',1.42);P('rh1',1.42);P('lh2',-.05);P('rh2',-.05);
    P('spine',.14,0,0);P('chest',.04+.02*b,0,0);P('head',.12,(S.ht||0)*.5,0);P('aR0',-.6,0,.1);P('aR1',-.55);P('aL0',-.6,0,-.1);P('aL1',-.55)},
  // sitting at the table, tearing at a roast rat: the bite comes up to the mouth, the head dips to meet it, a chew, a pause
  sitEat(P,t,S){const T=4.2,u=((t+(S.tph||0))/T)%1,up=ab152SS(.05,.3,u)*(1-ab152SS(.55,.75,u)),chew=up*Math.max(0,Math.sin(t*14))*.06;
    P.dy(-.13);P('lh0',-1.42);P('rh0',-1.42);P('lh1',1.42);P('rh1',1.42);P('spine',.22,0,0);P('chest',.06,0,0);P('head',.18+.12*up+chew,(S.ht||0)*.4*(1-up),0);
    P('aR0',-.75-.55*up,0,.12);P('aR1',-.7-1.0*up);P('aR2',-.2*up);P('aL0',-.75,0,-.15);P('aL1',-.65)},
  eatStand(P,t,S){const T=4.6,u=((t+(S.tph||0))/T)%1,up=ab152SS(.05,.3,u)*(1-ab152SS(.55,.75,u));
    P('aR0',-.45-.75*up,0,.1);P('aR1',-.6-1.15*up);P('aL0',-.25,0,-.08);P('aL1',-.4);P('head',.08+.12*up,(S.ht||0)*.4*(1-up),0);P('spine',.04,0,0)},
  // a merchant over the counter: palms up, a shrug, a lean in, a point at the goods
  haggle(P,t,S){const T=6,u=((t+(S.tph||0))/T)%1,a=t*2.6,sh=ab152SS(.2,.3,u)*(1-ab152SS(.38,.48,u)),pt=ab152SS(.6,.68,u)*(1-ab152SS(.82,.9,u));
    P('aR0',-.7-.35*pt+.08*Math.sin(a),0,.22+.25*sh);P('aR1',-.9+.6*pt);P('aR2',.25*sh);P('aL0',-.65+.05*Math.cos(a),0,-.22-.25*sh);P('aL1',-.9);P('aL2',.25*sh);
    P('spine',.12+.08*pt,0,0);P('chest',-.05*sh,0,.04*Math.sin(a*.5));P('head',.12-.1*sh,(S.ht||0)*.4,.12*sh)},
  hammer(P,t,S){const T=1.3,u=((t+(S.tph||0))/T)%1,up=u<.55?ab152SS(0,.55,u):1-ab152SS(.55,.68,u);
    P('aR0',-.85-1.15*up,0,.16);P('aR1',-.45-.85*up);P('aR2',-.1+.3*up);P('aL0',-.75,0,-.1);P('aL1',-.85);P('spine',.14,.1,0);P('head',.3,-.1,0)},
  stir(P,t,S){const a=(t+(S.tph||0))*2.2;P('aR0',-1.15+.15*Math.sin(a),0,.12+.16*Math.cos(a));P('aR1',-.45+.15*Math.cos(a));P('aL0',-.9+.1*Math.sin(a),0,-.15+.1*Math.cos(a));P('aL1',-.55);
    P('spine',.16,.08*Math.sin(a),0);P('chest',.05,.06*Math.sin(a),0);P('head',.35,.08*Math.sin(a*.5),0)},
  // turning the spit crank: the right arm circles, the left hand on the bar, a glance over the shoulder now and then
  spit(P,t,S){const a=(t+(S.tph||0))*2.0,gl=ab152SS(.0,.1,(t%11)/11)*(1-ab152SS(.2,.3,(t%11)/11));
    P('aR0',-1.05+.32*Math.sin(a),0,.08+.12*Math.cos(a));P('aR1',-.3+.3*Math.cos(a));P('aL0',-.95,0,-.22);P('aL1',-.4);P('spine',.14,0,0);P('head',.25,.9*gl+(S.ht||0)*.3,0);P('rh0',-.12);P('rh1',.18)},
  chop(P,t,S){const T=1.05,u=((t+(S.tph||0))/T)%1,up=u<.6?ab152SS(0,.6,u):1-ab152SS(.6,.7,u);
    P('aR0',-.6-1.55*up,0,.2);P('aR1',-.3-.6*up);P('aR2',.4*up);P('aL0',-.75,0,-.05);P('aL1',-.75);P('spine',.22-.06*up,.08,0);P('head',.4,0,0)},
  // feeding the rats: a bucket on the left hip, the right hand scatters handfuls in a sweep
  feed(P,t,S){const T=2.4,u=((t+(S.tph||0))/T)%1,dip=ab152SS(0,.3,u)*(1-ab152SS(.3,.4,u)),sw=ab152SS(.4,.62,u)*(1-ab152SS(.75,1,u));
    P('aL0',-.35,0,-.18);P('aL1',-1.25);P('aR0',-.4-.7*sw+.4*dip,0,.1+.6*sw);P('aR1',-.9+.6*sw-.3*dip);P('aR2',-.4*sw);P('spine',.12+.12*dip,-.2*sw,0);P('head',.3,-.3*sw,0)},
  fork(P,t,S){const T=2.6,u=((t+(S.tph||0))/T)%1,dig=u<.45?ab152SS(0,.45,u):1-ab152SS(.5,.85,u),toss=ab152SS(.5,.7,u)*(1-ab152SS(.75,.95,u));
    P('aR0',-.55-.6*toss+.25*dig,0,.2);P('aR1',-.6-.4*toss);P('aL0',-.95-.5*toss+.3*dig,0,-.1);P('aL1',-.35);P('spine',.25*dig-.08*toss,.15*toss,0);P('chest',.15*dig,0,0);P('head',.1*dig,0,0);
    P('lh0',-.25*dig);P('lh1',.35*dig);P('rh1',.2*dig)},
  sweep(P,t,S){const a=(t+(S.tph||0))*1.9,s=Math.sin(a);P('aR0',-.55,0,.1+.12*s);P('aR1',-.5);P('aL0',-.95,0,-.05+.12*s);P('aL1',-.35);P('spine',.18,.22*s,0);P('chest',.05,.1*s,0);P('head',.3,.1*s,0);
    P('lh0',.06*s);P('rh0',-.06*s)},
  // overlays while walking (only the arms and head; the legs keep the gait)
  carry(P,t,S){P('aR0',-.95,0,.18);P('aR1',-.85);P('aL0',-.95,0,-.18);P('aL1',-.85);P('head',.1,(S.ht||0)*.4,0)},
  lantern(P,t,S){P('aL0',-1.25,0,-.15);P('aL1',-.35);P('aL2',.2);P('head',.05,(S.ht||0)*.6,0)},
  platter(P,t,S){P('aR0',-.75,0,.28);P('aR1',-1.35);P('aR2',-.2);P('aL0',-.75,0,-.28);P('aL1',-1.35);P('head',.08,(S.ht||0)*.4,0)},
  // suspicious: lean in, head forward, weapon up; caught: strike pose, mouth wide
  alert(P,t,S){const q=Math.sin(t*9)*.02;P('spine',.18,0,0);P('chest',.08,(S.ht||0)*.3,0);P('neck',-.1,(S.ht||0)*.3,0);P('head',-.12+q,(S.ht||0)*.35,0);
    P('aR0',-1.0,0,.2);P('aR1',-1.0);P('aL0',-.6,0,-.25);P('aL1',-.8);P('lh0',-.2);P('lh1',.3);P('rh0',.15);P('rh1',.15)},
  caught(P,t,S){P('spine',.22,0,0);P('neck',-.25,0,0);P('head',-.3,0,0);P('aR0',-1.7,0,.3);P('aR1',-.4);P('aL0',-1.2,0,-.3);P('aL1',-.5);P('lh0',-.35);P('lh1',.45);P('rh0',.2)}};
// tools (rigid, hung on a hand bone)
var AB152T={};
function ab152Tool(k){const C=AB152C;switch(k){
  case 'ladle':return lgGroup('AB152T|ladle',q=>{q.L('','c',C.woodL,[0,0,0],[0,-.75,.0],.018,.015,4);q.p('','hem','m',C.ironL,0,-.78,.02,.07,.05,.07,Math.PI,0,0)},0);
  case 'cleaver':return lgGroup('AB152T|cleaver',q=>{q.L('','c',C.woodD,[0,.02,0],[0,-.12,0],.02,.02,4);q.p('','box','m',C.ironL,0,-.24,.05,.02,.2,.14)},0);
  case 'broom':return lgGroup('AB152T|broom',q=>{q.L('','c',C.woodL,[0,.25,0],[0,-.95,.15],.018,.018,4);q.p('','cone','c',0xa89058,0,-1.08,.18,.12,.3,.08,Math.PI,0,0)},0);
  case 'fork':return lgGroup('AB152T|fork',q=>{q.L('','c',C.woodL,[0,.3,0],[0,-1.0,.0],.02,.02,4);for(let i=0;i<3;i++)q.L('','m',C.ironL,[(i-1)*.05,-1.0,0],[(i-1)*.06,-1.25,.03],.01,.006,3)},0);
  case 'hammer':return lgGroup('AB152T|hammer',q=>{q.L('','c',C.woodD,[0,0,0],[0,-.35,0],.02,.02,4);q.p('','box','m',C.iron,0,-.38,0,.07,.07,.16)},0);
  case 'cup':return lgGroup('AB152T|cup',q=>{q.p('','cyl','c',0x8a5a32,0,-.05,.05,.05,.1,.05)},0);
  case 'bone':return lgGroup('AB152T|bone',q=>{q.p('','sph','c',C.meat,0,-.05,.06,.05,.09,.05);q.L('','c',0xd8ccb0,[0,-.12,.06],[0,-.2,.07],.012,.01,3)},0);
  case 'lantern':return lgGroup('AB152T|lantern',q=>{q.L('','m',C.iron,[0,0,0],[0,-.12,0],.006,.006,3);q.p('','box','m',C.brass,0,-.18,0,.14,.03,.14);q.p('','box','g',C.glow,0,-.28,0,.11,.17,.11);q.p('','box','m',C.brass,0,-.38,0,.13,.03,.13)},0);
  case 'cage':return lgGroup('AB152T|cage',q=>{q.p('','box','c',C.woodD,0,-.2,.25,.5,.05,.36);q.p('','box','c',C.woodD,0,.22,.25,.5,.05,.36);for(let i=0;i<6;i++)q.p('','box','m',C.ironL,-.22+(i%3)*.22,0,.25+(i>2?.16:-.16),.015,.42,.015);
    for(let i=0;i<3;i++)q.p('','sph2','c',C.rat,-.12+i*.12,-.13,.25+(i%2-.5)*.1,.06,.05,.09)},0);
  case 'platter':return lgGroup('AB152T|platter',q=>{q.p('','cyl','m',C.brass,0,.02,.2,.32,.02,.22);for(let i=0;i<3;i++)q.p('','sph','c',C.meat,-.12+i*.12,.08,.2,.08,.05,.11)},0);
  case 'spear':return lgGroup('AB152T|spear',q=>{q.L('','c',C.woodD,[0,.9,0],[0,-.9,0],.02,.02,4);q.p('','oct','m',C.ironL,0,1.05,0,.04,.16,.015)},0)}
  return null}
