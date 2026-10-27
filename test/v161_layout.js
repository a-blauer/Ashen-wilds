()=>{
  // v161 layout check: key HUD pieces must be on screen, the touch controls must not cover each other or the hotbar.
  const fail=[],info={vw:innerWidth,vh:innerHeight};
  const R=id=>{const e=document.getElementById(id);if(!e)return null;const cs=getComputedStyle(e);if(cs.display=='none'||cs.visibility=='hidden'||e.classList.contains('hide'))return null;
    const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return null;return {l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),w:Math.round(r.width),h:Math.round(r.height)}};
  const mob=document.body.classList.contains('mob');info.mob=mob;try{info.open=UIO_IDS.filter(i=>$(i)&&!$(i).classList.contains('hide'))}catch(_){}
  const ids=['topl','mini','sysBtn','fsBtn','bbar','hot','acts','joy','mbtn','glog','tgt'];
  ids.forEach(i=>info[i]=R(i));
  const on=(i,r)=>{if(!r)return;if(r.l<-2||r.t<-2||r.r>innerWidth+2||r.b>innerHeight+2)fail.push(i+' off screen '+JSON.stringify(r))};
  ['topl','mini','sysBtn','bbar','hot','joy','mbtn'].forEach(i=>on(i,info[i]));
  const ov=(a,b)=>{const A=info[a],B=info[b];if(!A||!B)return 0;const x=Math.min(A.r,B.r)-Math.max(A.l,B.l),y=Math.min(A.b,B.b)-Math.max(A.t,B.t);return x>4&&y>4};
  if(mob){[['joy','mbtn'],['joy','hot'],['mbtn','hot'],['joy','bbar'],['mbtn','bbar'],['topl','mini'],['mini','sysBtn'],['joy','topl'],['mbtn','mini']].forEach(([a,b])=>{if(ov(a,b))fail.push(a+' overlaps '+b)});
    if(!(info.open&&info.open.length)){if(!info.joy)fail.push('joystick hidden');if(!info.mbtn)fail.push('action buttons hidden')}
    // how much of the screen the HUD covers (rough): the bars + controls
    let cov=0;['topl','mini','bbar','joy','mbtn'].forEach(i=>{const r=info[i];if(r)cov+=r.w*r.h});info.cover=Math.round(100*cov/(innerWidth*innerHeight));
    if(info.cover>36)fail.push('HUD covers '+info.cover+'% of the screen');
    // touch targets: buttons at least 40 px
    document.querySelectorAll('#mbtn button').forEach(b=>{const r=b.getBoundingClientRect();if(r.width>0&&r.width<40)fail.push('touch button '+b.dataset.m+' only '+Math.round(r.width)+'px')});
    const hs=[...document.querySelectorAll('#acts .hs')].find(b=>b.offsetWidth>0);if(hs){const r=hs.getBoundingClientRect();info.hs=Math.round(r.width);if(r.width<28)fail.push('hotbar slot only '+Math.round(r.width)+'px')}
  }
  // every visible direct child of the stage that is fully off screen
  [...document.getElementById('stage').children].forEach(e=>{const cs=getComputedStyle(e);if(cs.display=='none'||e.classList.contains('hide')||cs.position=='static')return;const r=e.getBoundingClientRect();
    if(r.width>2&&r.height>2&&(r.right<0||r.bottom<0||r.left>innerWidth||r.top>innerHeight))fail.push('#'+(e.id||e.className)+' fully off screen')});
  return {fail,info};
}
