// v132: screenshots of Cheddar beside the portal (SHOT=name). ZONE=0..5 K=0..3 through window.CHQSHOT
(async()=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));const o=window.CHQSHOT||{z:0,k:0,d:3.2,side:1.2,q:'!'};
 const I=PMAP[o.z].ins[o.k];insArrive(I);await sleep(400);for(let i=0;i<40;i++)chqTick132(.05,performance.now());
 const st=document.createElement('style');st.textContent='#bnr,#banner,.ztc,#zt116,#pk,.pku,#glog{display:none!important}';document.head.appendChild(st);
 document.querySelectorAll('[id^=zt],[class*=zt116]').forEach(e=>e.style.display='none');
 if(o.q=='?'){CHQ132.st[chqList132(I)[0].id]={s:2,p:[99,99]}}else if(o.q=='trk'){chqList132(I).forEach(q=>CHQ132.st[q.id]={s:1,p:[1,3]})}
 const s=CHQ132.spots[I.g],f=s.face,hx=s.x+Math.sin(f)*o.d+Math.cos(f)*o.side,hz=s.z+Math.cos(f)*o.d-Math.sin(f)*o.side;toPos(hx,hz);
 camYaw=o.cy!=null?f+o.cy:Math.atan2(hx-s.x,hz-s.z);pl.rotation.y=camYaw+Math.PI;try{dTar=o.zoom||4.5;camDD=dTar}catch(_){}try{snapCam()}catch(_){}
 if(o.cam){const cx=o.tb?s.bx:s.x,cz=o.tb?s.bz:s.z,T=V(cx,GH(cx,cz)+o.cam[2],cz),P=V(cx+Math.sin(f+o.cam[0])*o.cam[1],GH(cx,cz)+o.cam[3],cz+Math.cos(f+o.cam[0])*o.cam[1]),la=cam.lookAt.bind(cam);cam.lookAt=function(){cam.position.copy(P);la(T)}}
 for(let i=0;i<30;i++)chqTick132(.05,performance.now()+i*50);CHQ132.trkK='';chqTrk132();await sleep(1500);
 return {g:I.g,mk:CHQ132.mkK,vis:CHQ132.ch.root.visible,trk:$('chqt132').className,top:$('chqt132').style.top}})()
