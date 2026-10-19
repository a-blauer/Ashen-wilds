# v94 model track: co-op partners see each other's hero look (zzN_model_hero.js: mpLookOut / mpLookIn).
# The presence gets a short look array `lk`; a partner's model is rebuilt when it changes. Old clients ignore it.
rep("g:mpMyGear(),sw:MP.sw","g:mpMyGear(),lk:typeof mpLookOut=='function'?mpLookOut():0,sw:MP.sw")
rep("sig=cls+'|'+JSON.stringify(pr.g||[]);","sig=cls+'|'+JSON.stringify(pr.g||[])+'|'+JSON.stringify(pr.lk||0);")
rep("if(sig!==r.sig){r.sig=sig;try{refreshGear(r.m,cls,mpGearE(pr.g))}","if(sig!==r.sig){r.sig=sig;try{if(typeof mpLookIn=='function')r.m.mdLook=mpLookIn(pr.lk);refreshGear(r.m,cls,mpGearE(pr.g))}")
