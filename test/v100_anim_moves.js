// v100 anim: move specs — the source of the baked hero attack keys in src/modules/zzN_zz_anim0_data.js.
// Re-bake with `BAKE=1 python3 test/v100_anim.py` after changing anything here (or the skeleton).
// Hero frame: feet at the origin, facing +z, the weapon arm (bones aR*) on the +x side ("W side"), the off arm on −x.
// Hips y .713, shoulders y 1.13 at x ±.176, arm (shoulder→grip) ≈ .45.
// Each phase of a strike gives the weapon grip position p, the blade direction d (grip → tip), and a body pose:
//   coil (anticipation, weapon drawn back along the path it will travel) → hold (a touch deeper: the "loaded" moment) →
//   accel (hips already turning, blade still lagging) → HIT at k .42 (the game's hit moment) → thru (past the target) →
//   follow (end of the follow-through) → recover (settling, weapon coming back up) → rest.
window.V100M=(function(){
  const nrm=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l].map(x=>+x.toFixed(3))};
  const V=(p,d)=>({p,d:nrm(d)});
  // body. f: weight on the front foot 0..1; c: crouch (knee bend); w: stance width; lead: 1 = off-side foot (lh) in front,
  // −1 = weapon-side foot in front; py: hip yaw; sy: spine twist (on top of the hips); cy: chest twist; sx: forward lean
  // (+ = into the blow); sz: side bend; dy: extra pelvis drop.
  function body(o){o=o||{};const f=o.f==null?.4:o.f,c=o.c||0,w=o.w==null?1:o.w,R={};
    R.py=o.py||0;R.sy=o.sy||0;R.cy=o.cy||0;R.sx=.04+(o.sx||0);R.sz=o.sz||0;R.pz=o.pz||0;
    const st=.3*w,lead=o.lead==null?1:o.lead;
    const fh=-st*(.5+.35*f)-c*.5,bh=st*(.8-.3*f)-c*.15,fk=.1+c*.95+f*.2*w,bk=.06+c*.4+(1-f)*.18*w;
    if(lead>0){R.lh=fh;R.rh=bh;R.lk=fk;R.rk=bk}else{R.rh=fh;R.lh=bh;R.rk=fk;R.lk=bk}
    ['lh','rh','lk','rk','hx','hy','dy','la','ra','pz'].forEach(k=>{if(o[k]!=null)R[k]=(k=='dy'?0:0)+o[k]});
    return R}
  const OFF={ // off-hand poses (channel values)
    guard:{lx:-.55,ly:.1,lz:-.3,le:-1.2,lw:.2},   // fist up in front of the chest
    wide:{lx:-.35,ly:0,lz:-.55,le:-.5,lw:0},       // thrown out to the side for balance
    back:{lx:.45,ly:0,lz:-.3,le:-.45,lw:0},        // swept back behind the hip (counter-rotation)
    reach:{lx:-1.15,ly:.15,lz:-.15,le:-.35,lw:.1}, // reaching toward the target (aim / measure)
    low:{lx:-.15,ly:0,lz:-.15,le:-.6,lw:0},
    shield:{lx:-.85,ly:.35,lz:-.15,le:-1.25,lw:.1},   // shield up in front of the chest
    shieldHi:{lx:-1.05,ly:.35,lz:-.3,le:-1.0,lw:.1},  // shield raised (covering the head while the weapon is up)
    shieldLo:{lx:-.45,ly:.3,lz:-.4,le:-1.05,lw:.1},
    rest:{lx:0,ly:0,lz:0,le:-.25,lw:0,lq:0}};
  const TM={norm:{coil:.25,hold:.3,accel:.37,thru:.48,follow:.58,rec:.78},heavy:{coil:.29,hold:.335,accel:.385,thru:.49,follow:.62,rec:.83},
    snap:{coil:.22,hold:.27,accel:.355,thru:.48,follow:.56,rec:.74}};
  // build keys from phases. o: {ph:{coil,hold,accel,hit,thru,follow,rec}: {p,d,b,off}, tm, two}
  function strike(o){const tm=Object.assign({},TM[o.tm||'norm'],o.t||{}),ph=o.ph,two=o.two;const keys=[];
    const K=(k,e,q)=>{const K={k,e,b:body(q.b),R:q.p?{p:q.p,d:q.d,wd:q.wd}:q.R};if(two)K.L={two:o.twoOff==null?-.15:o.twoOff};else if(q.off)K.L={ch:q.off};else if(q.L)K.L=q.L;keys.push(K)};
    K(0,0,ph.start||ph.coil);K(tm.coil,0,ph.coil);K(tm.hold,0,ph.hold||ph.coil);if(ph.accel)K(tm.accel,0,ph.accel);K(.42,0,ph.hit);K(tm.thru,0,ph.thru);K(tm.follow,0,ph.follow);if(ph.rec)K(tm.rec,0,ph.rec);
    keys.push({k:1,rest:1,b:body({}),R:{ch:{ax:-.2,ay:0,az:0,ex:-.3,rw:0,rz:0}},L:{ch:OFF.rest}});
    return {keys,two:o.twoOff==null?-.15:o.twoOff,claw:o.claw,mirror:o.mirror}}
  // transform helpers on a phase set
  function mapPh(ph,fn){const o={};for(const k in ph)o[k]=fn(Object.assign({},ph[k]),k);return o}
  const mx=a=>[-a[0],a[1],a[2]];
  // ======================= base strikes for a one-handed weapon =======================
  // forehand: cocked high beside the weapon shoulder, blade back over it → diagonal down across the front → past the off hip
  function fore(x){x=x||{};const h=x.h||0,lo=x.lo||0;return {
    coil:{...V([.3,1.32+.04*h,-.06],[.3,.6,-.75]),b:{f:.08,py:.3+.08*h,sy:.38+.1*h,cy:.12,sx:-.06-.04*h,sz:-.05,c:.1+.06*h},off:OFF.reach},
    hold:{...V([.32,1.36+.05*h,-.1],[.25,.55,-.8]),b:{f:.04,py:.34+.08*h,sy:.44+.1*h,cy:.15,sx:-.08-.05*h,sz:-.06,c:.12+.06*h},off:OFF.reach},
    accel:{...V([.27,1.2,.24],[.6,.7,.1]),b:{f:.5,py:.0,sy:.32,cy:.1,sx:.06,c:.16+.06*h},off:OFF.guard},
    hit:{...V([.03,1.02-lo,.46],[.22,-.18-lo,1]),b:{f:.88,py:-.36-.05*h,sy:-.1,cy:-.05,sx:.16+.05*h,sz:.04,c:.24+.08*h},off:OFF.back},
    thru:{...V([-.24,.9-lo,.34],[-.75,-.32-lo,.55]),b:{f:1,py:-.48-.05*h,sy:-.34,cy:-.12,sx:.2+.05*h,sz:.06,c:.27+.08*h},off:OFF.back},
    follow:{...V([-.3,.8-lo,.06],[-.7,-.5,-.5]),b:{f:1,py:-.52-.06*h,sy:-.46-.08*h,cy:-.16,sx:.2+.06*h,sz:.06,c:.28+.1*h},off:OFF.back},
    rec:{...V([.02,.98,.3],[-.2,.85,.4]),b:{f:.5,py:-.15,sy:-.1,sx:.08,c:.12},off:OFF.low}}}
  // backhand: hand drawn across to the off shoulder, blade back over it → out across the front → past the weapon side
  function back(x){x=x||{};const h=x.h||0;return {
    coil:{...V([-.13,1.16+.03*h,.16],[-.5,.5,-.72]),b:{f:.1,py:-.28-.06*h,sy:-.44-.1*h,cy:-.12,sx:-.02,sz:.04,c:.12+.06*h,lead:-1},off:OFF.low},
    hold:{...V([-.16,1.18+.03*h,.13],[-.45,.48,-.76]),b:{f:.06,py:-.32-.06*h,sy:-.5-.1*h,cy:-.14,sx:-.03,sz:.05,c:.14+.06*h,lead:-1},off:OFF.low},
    accel:{...V([-.08,1.1,.36],[-.75,.3,.5]),b:{f:.5,py:-.05,sy:-.3,cy:-.08,sx:.06,c:.18+.06*h,lead:-1},off:OFF.low},
    hit:{...V([.08,1.04,.48],[-.1,.02,1]),b:{f:.86,py:.3+.04*h,sy:.12,cy:.06,sx:.14+.04*h,sz:-.03,c:.24+.08*h,lead:-1},off:OFF.wide},
    thru:{...V([.34,1.04,.32],[.75,.08,.6]),b:{f:1,py:.42+.04*h,sy:.32,cy:.12,sx:.16,sz:-.05,c:.26+.08*h,lead:-1},off:OFF.wide},
    follow:{...V([.42,1.06,.04],[.85,.2,-.45]),b:{f:1,py:.46+.05*h,sy:.44+.06*h,cy:.15,sx:.15,sz:-.05,c:.27+.1*h,lead:-1},off:OFF.wide},
    rec:{...V([.2,1.0,.25],[.3,.85,.3]),b:{f:.5,py:.12,sy:.1,sx:.08,c:.12,lead:-1},off:OFF.low}}}
  // overhead: raised above the weapon shoulder, blade hanging back → straight down in front → low follow-through
  function over(x){x=x||{};const h=x.h||0;return {
    coil:{...V([.14,1.6+.03*h,-.02],[.02,.35-.2*h,-1]),b:{f:.06,py:.16,sy:.18,sx:-.18-.05*h,c:.06,hx:.08},off:OFF.reach},
    hold:{...V([.13,1.64+.03*h,-.05],[.02,.2-.25*h,-1]),b:{f:.03,py:.18,sy:.2,sx:-.22-.05*h,c:.07,hx:.1},off:OFF.reach},
    accel:{...V([.11,1.55,.22],[0,1,.12]),b:{f:.55,py:.05,sy:.08,sx:.06,c:.16},off:OFF.guard},
    hit:{...V([.07,1.12,.5],[0,-.4,1]),b:{f:.95,py:-.14,sy:-.06,sx:.34+.06*h,c:.32+.1*h,w:1.1},off:OFF.back},
    thru:{...V([.05,.88,.46],[0,-.85,.55]),b:{f:1,py:-.16,sy:-.08,sx:.43+.08*h,c:.37+.12*h,w:1.1},off:OFF.back},
    follow:{...V([.04,.74,.34],[-.02,-.97,.22]),b:{f:1,py:-.16,sy:-.08,sx:.46+.1*h,c:.4+.14*h,w:1.1},off:OFF.back},
    rec:{...V([.12,1.0,.3],[0,.6,.8]),b:{f:.5,sx:.12,c:.15},off:OFF.low}}}
  const M={};
  // grip/blade transforms of a whole phase set: scale the reach (r about the shoulder), raise, two-hand variants
  const SH=[.176,1.13,0];
  function reach(ph,k,dy){return mapPh(ph,q=>{if(q.p)q.p=[SH[0]+(q.p[0]-SH[0])*k,SH[1]+(q.p[1]-SH[1])*k+(dy||0),SH[2]+(q.p[2]-SH[2])*k];return q})}
  function bodyAdd(ph,o){return mapPh(ph,(q,n)=>{if(n=='start')return q;q.b=Object.assign({},q.b);for(const c in o)q.b[c]=(q.b[c]||0)+o[c];return q})}
  function offAll(ph,off){return mapPh(ph,q=>{q.off=off;return q})}
  // ---------------- one-handed sword (also the fallback) ----------------
  M.sword0=strike({ph:fore()});M.sword1=strike({ph:back()});M.sword2=strike({ph:over(),tm:'heavy'});
  // ---------------- two-handed greatsword / greataxe: both hands, bigger coil, heavier body ----------------
  // the hands sit closer to the body (both on the grip) and the blade does the reaching
  function twoFore(h){const P=reach(fore({h}),.92);P.coil=Object.assign({},P.coil,V([.3,1.36,-.12],[.15,.55,-.82]));P.hold=Object.assign({},P.hold,V([.3,1.4,-.16],[.08,.45,-.88]));
    P.accel=Object.assign({},P.accel,V([.25,1.24,.18],[.55,.75,.1]));P.hit=Object.assign({},P.hit,V([.04,1.0,.4],[.25,-.22,1]));
    P.thru=Object.assign({},P.thru,V([-.18,.88,.3],[-.75,-.36,.55]));P.follow=Object.assign({},P.follow,V([-.24,.8,.08],[-.72,-.5,-.48]));return P}
  function twoBack(h){const P=reach(back({h}),.92);P.coil=Object.assign({},P.coil,V([-.1,1.2,.12],[-.55,.55,-.65]));P.hold=Object.assign({},P.hold,V([-.12,1.24,.08],[-.5,.55,-.68]));
    P.hit=Object.assign({},P.hit,V([.08,1.0,.42],[-.08,-.04,1]));P.thru=Object.assign({},P.thru,V([.3,1.0,.3],[.75,.04,.62]));P.follow=Object.assign({},P.follow,V([.36,1.02,.06],[.85,.15,-.45]));return P}
  function twoOver(h){const P=over({h});P.coil=Object.assign({},P.coil,V([.1,1.56,-.08],[.02,.1,-1]));P.hold=Object.assign({},P.hold,V([.09,1.58,-.12],[.02,-.08,-1]));
    P.accel=Object.assign({},P.accel,V([.08,1.52,.16],[0,1,.2]));P.hit=Object.assign({},P.hit,V([.05,1.06,.44],[0,-.42,1]));P.thru=Object.assign({},P.thru,V([.04,.84,.4],[0,-.88,.5]));
    P.follow=Object.assign({},P.follow,V([.03,.7,.3],[-.02,-.98,.15]));return P}
  M.gs0=strike({ph:twoFore(1),tm:'heavy',two:1,twoOff:-.14});M.gs1=strike({ph:twoBack(1),tm:'heavy',two:1,twoOff:-.14});M.gs2=strike({ph:twoOver(1.6),tm:'heavy',two:1,twoOff:-.14,t:{coil:.31,hold:.35}});
  M.ga0=strike({ph:bodyAdd(twoFore(1.4),{c:.03}),tm:'heavy',two:1,twoOff:-.11});M.ga1=strike({ph:bodyAdd(twoBack(1.4),{c:.03}),tm:'heavy',two:1,twoOff:-.11});
  M.ga2=strike({ph:bodyAdd(twoOver(2),{c:.04}),tm:'heavy',two:1,twoOff:-.11,t:{coil:.32,hold:.365,follow:.66,rec:.86}});
  // greataxe finisher (the game's whirl hit) keeps the overhead cleave, heavier (the game hits all around): a full spin, axe held out low, hips leading
  // ---------------- mace / hammer (one hand + shield): heavier forehand, backhand, overhead smash ----------------
  const shieldOn=(ph,hi,bk)=>mapPh(ph,(q,n)=>{q.off=n=='coil'||n=='hold'?(hi?OFF.shieldHi:bk?OFF.shieldLo:OFF.shield):n=='rec'?OFF.shieldLo:bk?OFF.shieldLo:OFF.shield;return q});
  M.mace0=strike({ph:shieldOn(bodyAdd(fore({h:1}),{sx:.02})),tm:'heavy',t:{coil:.27,hold:.32}});M.mace1=strike({ph:shieldOn(back({h:1}),0,1),tm:'heavy',t:{coil:.27,hold:.32}});
  M.mace2=strike({ph:shieldOn(over({h:1.4}),1),tm:'heavy',t:{coil:.3,hold:.35}});
  // warhammer finisher: the big overhead smash, the whole body drops into it (the shield stays up)
  {const P=shieldOn(over({h:2}),1);P.coil=Object.assign({},P.coil,V([.14,1.62,-.08],[.02,.05,-1]),{b:{f:.06,py:.2,sy:.22,sx:-.26,c:.05,hx:.12}});
    P.hold=Object.assign({},P.hold,V([.13,1.65,-.12],[.02,-.12,-1]),{b:{f:.03,py:.22,sy:.25,sx:-.3,c:.06,hx:.14,dy:.01}});
    P.accel=Object.assign({},P.accel,V([.11,1.52,.2],[0,1,.25]),{b:{f:.5,py:.04,sy:.08,sx:.1,c:.15}});
    P.hit=Object.assign({},P.hit,V([.07,.95,.5],[0,-.62,.8]),{b:{f:.92,py:-.18,sy:-.08,sx:.56,c:.58,w:1.15,hx:-.15}});
    P.thru=Object.assign({},P.thru,V([.06,.72,.46],[0,-.92,.4]),{b:{f:.92,py:-.2,sy:-.1,sx:.62,c:.66,w:1.15,hx:-.2}});
    P.follow=Object.assign({},P.follow,V([.06,.66,.44],[0,-.96,.28]),{b:{f:.92,py:-.2,sy:-.1,sx:.63,c:.68,w:1.15,hx:-.2}});P.rec=Object.assign({},P.rec,{b:{f:.6,sx:.3,c:.35}});
    M.hammer2=strike({ph:P,tm:'heavy',t:{coil:.31,hold:.36,thru:.5,follow:.66,rec:.86}})}
  // ---------------- twin axes: fast alternating chops, each from its own shoulder; finisher = both axes chop down ----------------
  const axOff=OFF.guard;
  M.axes0=strike({ph:offAll(fore({lo:.04}),{lx:-.55,ly:.1,lz:-.25,le:-1.3,lw:.3}),tm:'snap'});
  M.axes1=strike({mirror:1,ph:offAll(fore({lo:.04}),{lx:-.55,ly:.1,lz:-.25,le:-1.3,lw:.3}),tm:'snap'});
  M.axes2=strike({ph:offAll(over({h:0}),{lx:-.6,ly:.1,lz:-.25,le:-1.25,lw:.3}),tm:'snap'});
  {const R=over({h:1}),L=mapPh(over({h:1}),q=>{if(q.p){q.p=mx(q.p);q.d=mx(q.d)}return q});
    M.axes3=strike({ph:mapPh(R,(q,n)=>{q.L={p:L[n].p,d:L[n].d};delete q.off;return q}),tm:'heavy'})}
  // ---------------- daggers: low, quick, compact; slash, off-hand backhand, stab, rising X ----------------
  const dag=x=>reach(x,.86,-.04);
  M.dag0=strike({ph:bodyAdd(offAll(dag(fore()),OFF.guard),{c:.08,sx:.04}),tm:'snap'});
  M.dag1=strike({mirror:1,ph:bodyAdd(offAll(dag(fore()),OFF.guard),{c:.08,sx:.04}),tm:'snap'});
  function stab(x){x=x||{};const h=x.h||0,rch=x.r||1;return {
    coil:{...V([.22,1.0,-.06],[.05,.05,1]),b:{f:.06,py:.38,sy:.3,sx:-.02,c:.16,lead:1},off:OFF.reach},
    hold:{...V([.24,1.0,-.1],[.05,.04,1]),b:{f:.04,py:.42,sy:.33,sx:-.04,c:.18,lead:1},off:OFF.reach},
    accel:{...V([.16,1.02,.18],[0,0,1]),b:{f:.5,py:.1,sy:.1,sx:.1,c:.22},off:OFF.guard},
    hit:{...V([.08,1.04,.48*rch],[-.02,-.02,1]),b:{f:.95,py:-.32,sy:-.14,sx:.26,c:.3,w:1.25},off:OFF.back},
    thru:{...V([.07,1.03,.52*rch],[-.02,-.03,1]),b:{f:1,py:-.36,sy:-.16,sx:.3,c:.32,w:1.25},off:OFF.back},
    follow:{...V([.08,1.02,.48*rch],[-.02,-.05,1]),b:{f:1,py:-.36,sy:-.16,sx:.3,c:.32,w:1.25},off:OFF.back},
    rec:{...V([.18,1.0,.2],[0,.5,.85]),b:{f:.5,py:-.1,sy:-.05,sx:.1,c:.15},off:OFF.low}}}
  M.dag2=strike({ph:stab(),tm:'snap'});
  {// rising X: both blades low and crossed, then up and out
    const R={start:{...V([.12,.86,.3],[.4,-.4,.8]),b:{f:.3,c:.3}},coil:{...V([.06,.8,.3],[.3,-.7,.6]),b:{f:.3,c:.62,sx:.3,hx:-.15}},hold:{...V([.04,.78,.28],[.25,-.75,.6]),b:{f:.3,c:.68,sx:.32,hx:-.18}},
      accel:{...V([.12,1.0,.4],[.2,.3,1]),b:{f:.6,c:.36,sx:.12}},hit:{...V([.2,1.28,.44],[.3,.75,.6]),b:{f:.8,c:.18,sx:-.02,dy:.02}},thru:{...V([.3,1.5,.3],[.45,.85,.1]),b:{f:.8,c:.12,sx:-.1,dy:.02}},
      follow:{...V([.34,1.55,.2],[.5,.85,-.1]),b:{f:.8,c:.1,sx:-.1}},rec:{...V([.2,1.1,.25],[.1,.9,.3]),b:{f:.5,c:.12,sx:.05}}};
    M.dag3=strike({ph:mapPh(R,q=>{q.L={p:mx(q.p),d:mx(q.d)};return q}),tm:'heavy'})}
  // ---------------- claws: raking swipes that dip low, alternating hands; finisher = crouch and spring, both claws ----------------
  const rake=()=>{const P=reach(fore({lo:.1}),.9,-.03);return bodyAdd(offAll(P,{lx:-.75,ly:.1,lz:-.3,le:-1.5,lw:.4}),{c:.1,sx:.05})};
  M.claw0=strike({ph:rake(),tm:'snap',claw:1});M.claw1=strike({mirror:1,ph:rake(),tm:'snap',claw:1});
  {const up=()=>{// uppercut rake: low by the hip → up across the front
    return {coil:{...V([.24,.78,.02],[.3,-.6,.6]),b:{f:.1,py:.25,sy:.25,c:.3,sx:.12},off:{lx:-.75,lz:-.3,le:-1.5,lw:.4}},hold:{...V([.25,.74,-.02],[.3,-.65,.55]),b:{f:.06,py:.28,sy:.28,c:.34,sx:.14},off:{lx:-.75,lz:-.3,le:-1.5,lw:.4}},
      accel:{...V([.16,.92,.36],[.15,.3,1]),b:{f:.55,py:0,sy:.1,c:.24,sx:.1},off:{lx:-.7,lz:-.3,le:-1.5,lw:.4}},hit:{...V([.06,1.22,.44],[-.1,.85,.5]),b:{f:.9,py:-.25,sy:-.12,c:.14,sx:.0},off:OFF.back},
      thru:{...V([-.02,1.42,.3],[-.2,.95,.1]),b:{f:1,py:-.3,sy:-.18,c:.1,sx:-.06},off:OFF.back},follow:{...V([-.04,1.48,.2],[-.2,.95,-.1]),b:{f:1,py:-.3,sy:-.18,c:.1,sx:-.08},off:OFF.back},
      rec:{...V([.14,1.04,.26],[0,.8,.5]),b:{f:.5,c:.12,sx:.05},off:OFF.low}}};
    M.claw2=strike({ph:up(),tm:'snap',claw:1});M.claw3=strike({mirror:1,ph:up(),tm:'snap',claw:1});
    const R={start:{...V([.2,.9,.25],[.2,.2,1]),b:{f:.4,c:.2}},coil:{...V([.16,.72,.14],[.2,-.4,.9]),b:{f:.3,c:.78,sx:.42,hx:-.2,w:1.1}},hold:{...V([.15,.7,.12],[.2,-.45,.88]),b:{f:.3,c:.84,sx:.44,hx:-.22,w:1.1}},
      accel:{...V([.2,1.1,.35],[.1,.6,.8]),b:{f:.7,c:.2,sx:.1,dy:.04,w:1.2}},hit:{...V([.14,1.12,.5],[-.25,-.35,1]),b:{f:1,c:.32,sx:.32,w:1.3}},thru:{...V([.02,.92,.42],[-.45,-.7,.55]),b:{f:1,c:.42,sx:.42,w:1.3}},
      follow:{...V([-.02,.84,.32],[-.45,-.8,.3]),b:{f:1,c:.46,sx:.44,w:1.3}},rec:{...V([.16,1.0,.3],[0,.6,.8]),b:{f:.6,c:.25,sx:.2}}};
    M.claw4=strike({ph:mapPh(R,q=>{q.L={p:mx(q.p),d:mx(q.d)};return q}),tm:'heavy',claw:1})}
  // ---------------- halberd: two lunging thrusts (both hands on the shaft), finisher = wide two-handed sweep ----------------
  {// side-on: the off-side foot and shoulder lead, the rear (weapon) hand drives the shaft from the hip, the front hand guides it
    const T=x=>{const y=x?.05:0,lb=(o)=>Object.assign({lead:1},o);return {
      coil:{...V([.2,.95,-.2],[-.16,.03,1]),b:lb({f:.05,py:.42,sy:.12,sx:-.06,c:.16,w:1.15})},
      hold:{...V([.21,.95,-.25],[-.16,.03,1]),b:lb({f:.02,py:.45,sy:.14,sx:-.08,c:.18,w:1.15})},
      accel:{...V([.18,.98,-.02],[-.14,.01,1]),b:lb({f:.55,py:.36,sy:.08,sx:.1,c:.22,w:1.25})},
      hit:{...V([.13,1.0+y,.2],[-.12,-.01+y*.3,1]),b:lb({f:.95,py:.3,sy:.04,sx:.26,c:.3,w:1.35})},
      thru:{...V([.11,1.0+y,.27],[-.12,-.02+y*.3,1]),b:lb({f:1,py:.28,sy:.02,sx:.3,c:.32,w:1.35})},
      follow:{...V([.12,.99,.24],[-.12,-.03,1]),b:lb({f:1,py:.28,sy:.02,sx:.3,c:.32,w:1.35})},
      rec:{...V([.18,.97,.02],[-.1,.25,1]),b:lb({f:.5,py:.15,sx:.1,c:.15})}}};
    M.hal0=strike({ph:T(0),two:1,twoOff:.22});M.hal1=strike({ph:T(1),two:1,twoOff:.22});
    M.hal2=strike({ph:bodyAdd(twoBack(1.4),{c:.04}),tm:'heavy',two:1,twoOff:.18,t:{coil:.3,hold:.345}})}
  // ---------------- throwing knives: cock back over the shoulder, off hand points, whip through (release at the hit) ----------------
  {const P=over({h:0});P.coil=Object.assign({},P.coil,V([.28,1.42,-.12],[.2,.6,-.75]),{b:{f:.06,py:.4,sy:.45,sx:-.08,c:.1}});P.hold=Object.assign({},P.hold,V([.3,1.44,-.16],[.2,.55,-.8]),{b:{f:.03,py:.44,sy:.5,sx:-.1,c:.12}});
    P.coil.off=P.hold.off=OFF.reach;P.accel=Object.assign({},P.accel,V([.2,1.38,.2],[.1,.8,.55]),{b:{f:.5,py:.05,sy:.15,sx:.08,c:.15}});
    P.hit=Object.assign({},P.hit,V([.08,1.2,.5],[0,.05,1]),{b:{f:.9,py:-.3,sy:-.15,sx:.2,c:.22}});P.thru=Object.assign({},P.thru,V([-.04,1.0,.46],[-.1,-.5,.85]),{b:{f:1,py:-.4,sy:-.28,sx:.24,c:.25}});
    P.follow=Object.assign({},P.follow,V([-.1,.9,.36],[-.2,-.7,.6]),{b:{f:1,py:-.42,sy:-.32,sx:.24,c:.26}});M.knives=strike({ph:P})}
  // ---------------- sling: whirl beside the body, step and whip forward (release at the hit) ----------------
  {const C=[.32,1.42,.02],ring=(a,k)=>V([C[0]+.05*Math.sin(a),C[1]+.16*Math.cos(a),C[2]+.16*Math.sin(a)],[0,-1,0]);
    const keys=[];const b0={f:.2,py:.3,sy:.3,sx:-.04,c:.1};
    [[0,0,{f:.3}],[.08,0,b0],[.15,2.1,b0],[.22,4.2,b0],[.29,6.28,Object.assign({},b0,{f:.1,py:.36,sy:.4})]].forEach(([k,a,b])=>keys.push({k,e:0,b:body(b),R:ring(a),L:{ch:OFF.reach}}));
    keys.push({k:.42,b:body({f:.9,py:-.3,sy:-.15,sx:.18,c:.22}),R:V([.12,1.2,.5],[0,.6,.8]),L:{ch:OFF.back}});
    keys.push({k:.54,b:body({f:1,py:-.4,sy:-.28,sx:.22,c:.24}),R:V([-.04,1.02,.42],[-.1,-.6,.8]),L:{ch:OFF.back}});
    keys.push({k:.78,b:body({f:.5,py:-.1,sx:.08,c:.12}),R:V([.2,.95,.15],[0,-1,0]),L:{ch:OFF.low}});
    keys.push({k:1,rest:1,b:body({}),R:{ch:{ax:-.2,ay:0,az:0,ex:-.3,rw:0,rz:0}},L:{ch:OFF.rest}});M.sling={keys}}
  return {M,strike,fore,back,over,body,OFF,TM,V,nrm,mapPh,mx}})();
