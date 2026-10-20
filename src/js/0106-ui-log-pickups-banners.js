// ---------- UI ----------
function say(t){const g=$('glog');if(!g)return;const d=document.createElement('div');d.innerHTML=t;g.appendChild(d);while(g.children.length>6)g.firstChild.remove();setTimeout(()=>d.remove(),7000)}
function pickup(o){
  const h=$('pk'),d=document.createElement('div');d.className='pku'+(o.r>=3?' big':'');d.style.setProperty('--c',o.col||'#ffffff');
  d.innerHTML='<div class="pt"><span>'+o.ic+'</span> '+o.t+'</div>'+(o.sub?'<div class="ps">'+o.sub+'</div>':'');
  h.appendChild(d);while(h.children.length>4)h.firstChild.remove();setTimeout(()=>d.remove(),2400);
}
function banner(t,sub,det){
  const h=$('banner'),d=document.createElement('div');d.className='bnr';d.innerHTML='<div class="b1">'+t+'</div><div class="b2">'+sub+'</div>'+(det?'<div class="b3">'+det+'</div>':'');
  h.appendChild(d);while(h.children.length>2)h.firstChild.remove();setTimeout(()=>d.remove(),3500);
}
let curTown=-2,home=TOWNS[0];
function restTavern(T){
  if(uiOpen())return;
  fadeTo(()=>{hero.hp=heroMax();hero.mp=mpMax();party.forEach(c=>c.h=M(c));rest={t:Date.now()+480000,m:Math.max(.03,restBonus())};home=T;ui();hud();
    say('You sleep soundly at '+T.tav+'. Your team is fully healed. Well Rested: +3% XP for 8 minutes.')});
}
function ui(){$('pty').innerHTML=party.map((c,i)=>card(c,i,i==0)).join('');$('fuseBtn').disabled=party.length<2||!!foe;$('bagBtn').disabled=!!foe;sync()}
