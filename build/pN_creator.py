# v94 creator track: text patches (exec'd by pV11 with the shared h / rep).
# 1. the hero kit cache key carries the hero's look (face, hair, eyes), so two looks of one class never share a baked kit
rep("const key='H|'+cls+'|'+sig(E.chest)+'|'+sig(E.helm)+'|'+sig(E.boots),k=",
    "const key='H|'+cls+'|'+sig(E.chest)+'|'+sig(E.helm)+'|'+sig(E.boots)+(typeof lkKey=='function'?lkKey():''),k=")
# 2. the main menu (title shown again from the game) pauses the game like an open window, also in co-op
rep("const uiOpen=()=>[","const uiOpen=()=>(typeof KQMENU!='undefined'&&KQMENU.on)||[")
rep("if((uiOpen()&&!mpLive())||!party.length)dt=0;","if((uiOpen()&&!mpLive())||!party.length||(typeof KQMENU!='undefined'&&KQMENU.on))dt=0;")
# 3. co-op: send the look with the hero's presence and dress partners in theirs
rep("g:mpMyGear(),sw:MP.sw","g:mpMyGear(),lk:typeof lkPack=='function'?lkPack():0,sw:MP.sw")
rep("sig=cls+'|'+JSON.stringify(pr.g||[]);","sig=cls+'|'+JSON.stringify(pr.g||[])+'|'+JSON.stringify(pr.lk||0);")
rep("if(sig!==r.sig){r.sig=sig;try{refreshGear(r.m,cls,mpGearE(pr.g))}",
    "if(sig!==r.sig){r.sig=sig;try{r.m.look=typeof lkUnpack=='function'?lkUnpack(pr.lk,cls):null;refreshGear(r.m,cls,mpGearE(pr.g));if(typeof heroRebuild=='function')heroRebuild(r.m)}")
