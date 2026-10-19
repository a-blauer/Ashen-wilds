# --- pace --- (v96) Sovereign pacing: next-special timer, Cataclysm cooldown, den schedulers ×PACE.I; plain-number den
# wind-ups ×PACE.W (moves that read `en` are scaled at runtime by paceWrap in zzN_pace.js); den sub-target health from the
# pre-×1.5 boss health (paceM0). PACE is defined in src/modules/zzN_pace.js (runtime only, so these patches only read it
# while the game runs).
# paceWrap() must run after every module (the v89 sands track wraps BMV after this track's module): call it right after
# the splice marker (pV11 still finds the marker exactly once).
rep("\n$('talBtn').onclick=openTal;\n","\n$('talBtn').onclick=openTal;\ntry{paceWrap()}catch(err){console.error('pace wrap',err)}\n")
# ---- base Sovereign AI (z_boss2.js; j_boss.js carries the same ult line) ----
rep("const r=BMV[k](e,A,en);b.last=k;b.lock=r.lock?r.d:0;b.t=r.d+(ph==3?.6:1.0)*en;",
    "const r=BMV[k](e,A,en);b.last=k;b.lock=r.lock?r.d:0;b.t=paceGap(k,r,(ph==3?.6:1.0)*en,e);")
rep("b.ult=ph==3?20:26;","b.ult=(ph==3?20:26)*PACE.U;",2)
rep("e.bs=Object.assign(e.bs,{t:2.2,lock:0,ph:1,last:'',ult:A.b.ult==2?14:10,dash:null});",
    "e.bs=Object.assign(e.bs,{t:PACE.T0,lock:0,ph:1,last:'',ult:(A.b.ult==2?14:10)*PACE.U,dash:null});")
rep("tele(q,3.2,.6*en,()=>{bxHide(e,false);","tele(q,3.2,.6*en*PACE.W,()=>{bxHide(e,false);")                 # burrow eruption
rep("if(f.t<1.1&&!f.boom){f.boom=true;const q=g.position.clone();tele(q,2.6,1.0,",
    "if(f.t<1.0*PACE.W+.1&&!f.boom){f.boom=true;const q=g.position.clone();tele(q,2.6,1.0*PACE.W,")          # exploding clones
# ---- den 0: Argus ----
rep("const k=Math.min(1,T.t/1.15)","const k=Math.min(1,T.t/(1.15*PACE.W))")                                   # eye wakes (tell)
rep("AR.wt=[8.5,8,7.2][ph-1]+Math.random()*1.5","AR.wt=([8.5,8,7.2][ph-1]+Math.random()*1.5)*PACE.I")
rep("tele(q,3,1.0,()=>{if(AR.mark)AR.mark=null;","tele(q,3,1.0*PACE.W,()=>{if(AR.mark)AR.mark=null;")         # marked leap
rep("jumpTo(e,q,1.0,5.5);e.bs.lock=Math.max(e.bs.lock,1.4);e.bs.t=Math.max(e.bs.t,2);",
    "jumpTo(e,q,1.0*PACE.W,5.5);e.bs.lock=Math.max(e.bs.lock,1.9);e.bs.t=Math.max(e.bs.t,2*PACE.I);")
rep("kqFall(A,q,1.0,0xffd040,'orb',1.2,src.p);","kqFall(A,q,1.0*PACE.W,0xffd040,'orb',1.2,src.p);")           # partner bolts
rep("tele(q,2.6,1.0,()=>{if(AR.mark)AR.mark=null;","tele(q,2.6,1.0*PACE.W,()=>{if(AR.mark)AR.mark=null;")
rep("T.hpM=T.hp=Math.round(M(e.c)*.03)","T.hpM=T.hp=Math.round(paceM0(e.c)*.03)")
# ---- den 1: the Crest Hydra ----
rep("tele(q,1.7,1.0,()=>{if(gen!==HY.gen","tele(q,1.7,1.0*PACE.W,()=>{if(gen!==HY.gen")                       # neck rises
rep("N.hpM=N.hp=Math.round(M(e.c)*.045)","N.hpM=N.hp=Math.round(paceM0(e.c)*.045)")
rep("N.atk={k:'bite',t:0,T:.85};tele(o,0,.85,","N.atk={k:'bite',t:0,T:.85*PACE.W};tele(o,0,.85*PACE.W,")
rep("N.atk={k:'spit',t:0,T:1.1};kqLob(A,N.p.clone(),q,1.1,","N.atk={k:'spit',t:0,T:1.1*PACE.W};kqLob(A,N.p.clone(),q,1.1*PACE.W,")
rep("tele(q,1.8,1.1,()=>{if(!A.f)return;burst(gY(q,.3),0x9aff3a","tele(q,1.8,1.1*PACE.W,()=>{if(!A.f)return;burst(gY(q,.3),0x9aff3a")
rep("N.cd=(2.8+Math.random()*1.4)*(ph>=3?.75:1)","N.cd=(2.8+Math.random()*1.4)*(ph>=3?.75:1)*PACE.I")
rep("HY.clk-HY.lastAtk>.75","HY.clk-HY.lastAtk>.75*PACE.I")
rep("HY.nt=live<want-1?1.6:[5,4.2,3.4][ph-1]","HY.nt=live<want-1?1.6:[5,4.2,3.4][ph-1]*PACE.I")
# ---- den 2: the Rime Wraith ----
rep("D.snT=[15,12,10][b.ph-1]","D.snT=[15,12,10][b.ph-1]*PACE.I")
rep("D.wh={t:7.5,nx:1.4};D.whCD=24;","D.wh={t:7.5,nx:1.4};D.whCD=24*PACE.I;")
rep("if(W2.nx<=0&&W2.t>.8){W2.nx=1.15;","if(W2.nx<=0&&W2.t>.8*PACE.W){W2.nx=1.15*PACE.W;")
rep("kqFall(A,q,.95,RW_COL,'spike',1.3);","kqFall(A,q,.95*PACE.W,RW_COL,'spike',1.3);")
rep("tele(q,1.8,.95,()=>{if(!A.f)return;burst(gY(q,.4),0xe8f8ff,24","tele(q,1.8,.95*PACE.W,()=>{if(!A.f)return;burst(gY(q,.4),0xe8f8ff,24")
rep("const o=q.clone();tele(o,4.2,1.0,()=>{","const o=q.clone();tele(o,4.2,1.0*PACE.W,()=>{")                 # re-forms after Whiteout
# ---- den 3: Ssith'ra ----
rep("D.vxCD=15;","D.vxCD=15*PACE.I;")
rep("D.st={t:8,nx:1.2};D.stCD=22;","D.st={t:8,nx:1.2};D.stCD=22*PACE.I;")
rep("tele(g,2.0,.9,()=>{","tele(g,2.0,.9*PACE.W,()=>{")                                                    # eruption geysers
rep("ssAim(A,e,D,Rm.n,.7)","ssAim(A,e,D,Rm.n,.7*PACE.W)")                                                  # follow-up ram
# when its ram / dive-and-erupt (+ EXPOSED / STUCK) ends, the den hands the boss back with a short next-special timer
rep("D.ram=null;b.lock=0;b.t=Math.min(b.t,.8)","D.ram=null;b.lock=0;b.t=Math.min(b.t,paceEnd(.8))")
rep("if(!D.er&&!D.ram){b.lock=0;b.t=Math.min(b.t,.9)}","if(!D.er&&!D.ram){b.lock=0;b.t=Math.min(b.t,paceEnd(.9))}")
rep("T.nx=e.bs.ph>=3?.5:.7;","T.nx=(e.bs.ph>=3?.5:.7)*PACE.I;")                                             # sandstorm lashes
rep("tele(q,1.5,.9,()=>{if(!A.f)return;ssLash","tele(q,1.5,.9*PACE.W,()=>{if(!A.f)return;ssLash")
# ---- den 4: the Bloated One ----
rep("S.cT=[0,15,12,9][S.ph]","S.cT=[0,15,12,9][S.ph]*PACE.I")
rep("S.pT=[0,0,18,13][S.ph]","S.pT=[0,0,18,13][S.ph]*PACE.I")
rep("say('⚠ The pustules erupt!');const en=1.2;","say('⚠ The pustules erupt!');const en=1.2*PACE.W;")
rep("(B?M(B.c):c.st.hp*12)*o.frac","(B?paceM0(B.c):c.st.hp*12)*o.frac")
# ---- den 5: Lord Vaelric ----
rep("S.chT=S.ph>=3?20:26;","S.chT=(S.ph>=3?20:26)*PACE.I;")
rep("S.moonT=S.ph>=3?20:25;","S.moonT=(S.ph>=3?20:25)*PACE.I;")
rep("R.harass=3.3;","R.harass=3.3*PACE.I;")
