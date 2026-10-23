// ================= v134: Wave Trials are gone (owner's request) =================
// The portal lists no Wave Trial (0510 XR.portal), the "Leave trial" portals are taken out of the world, a trial can no longer
// start, and a save or recall spot inside a trial arena (older saves) goes home to Duskhold instead. The trial instances stay in
// the world grid (INSL, k 4) so every other instance keeps its place and old saves load; nothing leads there.
waveStart=function(){};
try{for(let j=RPORT.length-1;j>=0;j--){const r=RPORT[j];if(r.k!=='wave')continue;r.g.visible=false;if(r.g.parent)r.g.parent.remove(r.g);RPORT.splice(j,1)}}catch(e){console.warn('v134 wave portals',e)}
function wv134Out(){try{const I=curIns();if(I&&I.tri){if(typeof WV!='undefined'&&WV)try{waveEnd(false,true)}catch(_){}TWN100_home()}}catch(_){}}
{const f=x2Load;x2Load=function(s){const r=f.apply(this,arguments);try{if(INST&&INSL[INST.r]&&INSL[INST.r].tri)INST=null}catch(_){}return r}}
{const f=loadGame;loadGame=function(){const r=f.apply(this,arguments);setTimeout(wv134Out,0);return r}}
