// ================= v148: aimed abilities while mouse-look is on =================
// With mouse-look toggled on (right click, v135) the cursor is hidden, so an ability that is aimed on the ground (KQS.tg,
// 1010) could not be placed. Now pressing such an ability turns mouse-look off and shows the cursor while you pick the spot;
// once the spell is cast (or cancelled with a right click or the ✕), mouse-look comes back on. Esc cancels and leaves it off
// (Esc always ends mouse-look). It is only switched back on inside a click or key press (the browser allows the pointer lock
// only then), and never while a window is open.
{const f=kqsTgStart;kqsTgStart=function(i,sk){const was=!!(KQS.mlR&&KQS.tg),ml=was||!!(typeof orb!='undefined'&&orb&&orb.tg);if(ml&&orb){try{orbEnd()}catch(_){}}
  KQS.noBack=1;let r;try{r=f.apply(this,arguments)}finally{KQS.noBack=0}if(ml&&KQS.tg){KQS.mlR=1;if(!was)KQS.mIn=false}return r}}
{const f=kqsTgEnd;kqsTgEnd=function(){const back=KQS.mlR&&!!KQS.tg&&!KQS.noBack;const r=f.apply(this,arguments);
  if(back){KQS.mlR=0;try{const ev=typeof window.event!='undefined'?window.event:null,esc=ev&&ev.type=='keydown'&&ev.key=='Escape',
      act=!navigator.userActivation||navigator.userActivation.isActive;
    if(!esc&&act&&party.length&&!(typeof uiOpen=='function'&&uiOpen())&&!(typeof orb!='undefined'&&orb))
      orbStart({clientX:KQS.mx!=null?KQS.mx:innerWidth/2,clientY:KQS.my!=null?KQS.my:innerHeight/2},1)}catch(e){console.warn('v148 mouse-look back',e)}}
  else if(!KQS.tg&&!KQS.noBack)KQS.mlR=0;return r}}
