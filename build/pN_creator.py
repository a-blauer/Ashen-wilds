# v94 creator track: text patches (exec'd by pV11 with the shared h / rep).
# 1. the hero kit cache key carries the hero's look (face, hair, eyes), so two looks of one class never share a baked kit
rep("const key='H|'+cls+'|'+sig(E.chest)+'|'+sig(E.helm)+'|'+sig(E.boots),k=",
    "const key='H|'+cls+'|'+sig(E.chest)+'|'+sig(E.helm)+'|'+sig(E.boots)+(typeof lkKey=='function'?lkKey():''),k=")
# 2. the main menu (title shown again from the game) pauses the game like an open window, also in co-op
rep("const uiOpen=()=>[","const uiOpen=()=>(typeof KQMENU!='undefined'&&KQMENU.on)||[")
rep("if((uiOpen()&&!mpLive())||!party.length)dt=0;","if((uiOpen()&&!mpLive())||!party.length||(typeof KQMENU!='undefined'&&KQMENU.on))dt=0;")
# 3. co-op look sync: done by the model track (build/pN_model.py, mpLookOut/mpLookIn)
