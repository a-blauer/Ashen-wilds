// ================= v131 title card on loading a save =================
// When the page opens, the game starts in Duskhold behind the start screens, and that shows the Duskhold title card.
// Continue then moves the hero to where the save was (a zone instance, say) without showing a card, so the Duskhold one
// was what the player saw. After a save loads, the old card is cleared and the card for where the hero is now is shown.
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);try{
  if(typeof ZT116=='undefined')return r;clearTimeout(ZT116.tm);if(ZT116.el)ZT116.el.className='';
  const I=typeof curIns=='function'?curIns():null;
  if(I)zt116Ins(I);
  else if(pl&&townAt(pl.position.x,pl.position.z,0)>=0)zt116Show(ZT116.town,'The Floating Stronghold','Duskhold','The last stronghold, adrift above the void','The Grand Square · the Portal Road leads south','town')
}catch(e){console.warn('v131 load title',e)}return r}}
