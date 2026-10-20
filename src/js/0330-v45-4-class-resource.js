// =============== 4. CLASS RESOURCE ===============
const CRES={warrior:{n:'Rage',i:'💢',col:'#ef4444',gain:11,hurt:7},paladin:{n:'Faith',i:'✨',col:'#facc15',gain:10,hurt:5},assassin:{n:'Combo',i:'🗡️',col:'#a78bfa',gain:20,pips:5},ranger:{n:'Focus',i:'🎯',col:'#4ade80',gain:12},mage:{n:'Arcane',i:'🔮',col:'#60a5fa',gain:13}};
function resGain(v){hero.cr=Math.min(100,(hero.cr||0)+v);hero.crT=nowP();resUI()}
function cast(i){
  if(riding)dismount();
  const sk=heroSkills()[i],ok=sk&&party.length&&!hero.chan&&hero.lvl>=sk.lv&&!((hero.cd['s'+i]||0)>0)&&hero.mp>=sk.mp,R=CRES[hero.cls];
  let pw=0;if(ok&&R&&(hero.cr||0)>=50){pw=hero.cr;hero.buffs.push({n:R.n+' empowered',i:R.i,s:{skillP:.5*pw/100,aoeP:.3*pw/100},t:nowP()+1600});hsDirty();hero.cr=0;
    popT(pl.position,'EMPOWERED ×'+(1+.5*pw/100).toFixed(1),R.col,true);const c=parseInt(R.col.slice(1),16);burst(gY(pl.position,1),c,40,2.5,3,.6);ring(pl.position,c,2.6,320);sfx('power');resUI()}
  const cd0=hero.cd['s'+i]||0,r_=cast_base(i);if((hero.cd['s'+i]||0)>cd0&&typeof lpCast=='function')lpCast(heroSkills()[i]);return r_;
}
{const b=document.createElement('div');b.id='resb';b.innerHTML='<span class="ri"></span><div class="rbar"><i></i><b class="m50"></b></div><span class="rt"></span>';$('bmid').insertBefore(b,$('bmid').firstChild)}
// =============== 6. TEAM-UP ===============
{const mb=$('mbtn');if(mb){const b=document.createElement('button');b.dataset.m='team';b.title='Team-up';b.textContent='🤝';mb.appendChild(b);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();})}}

