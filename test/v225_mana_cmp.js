// v225: mana before / after (python3 probe.py v225_mana_cmp.js): the old rules (fixed costs, old regeneration) vs the new
(()=>{const old={warrior:.01,paladin:.008,assassin:.01,ranger:.01,mage:0},keep=mana225Mul,kp={};for(const c in KQR_CLS)kp[c]=KQR_CLS[c].mpr;
 mana225Mul=()=>1;for(const c in old)KQR_CLS[c].mpr=old[c];MANA225.C={};const before=v225Mana();
 mana225Mul=keep;for(const c in kp)KQR_CLS[c].mpr=kp[c];MANA225.C={};const after=v225Mana();
 const need={};for(const c in CLS){need[c]={};[10,30,50].forEach(L=>need[c][L]=+mana225Need(c,L).toFixed(2))}
 return {before,after,need,pool:Object.fromEntries(Object.keys(CLS).map(c=>[c,[1,10,30,50].map(L=>Math.round(mana225Pool(c,L)))]))}})()
