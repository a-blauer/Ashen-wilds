// =====================================================================================================
function mdBootsO(B,P,d){mdDX(d);const M=d.M,A=d.A,G=d.G,dk=d.dk,st=d.st,k=mdKP(),a=d.a,T=d.T==null?MD_TRIM[d.ti|0]:d.T,lv=d.lv==null?(d.ti|0):d.lv,ps=mdSh(M,1.15);
  [-1,1].forEach(s=>{const l=s<0?'lh':'rh',L=mdLeg(P,s),F=mdFoot(P,s);
    if(d.R&&!(a=='cloth'&&st=='sandal'))mdLB(B,L,a=='heavy'?5.75:a=='cloth'&&st=='slipper'?5.75:5.2,.005,a=='heavy'?.032:.03,d.R,{});
    if(a=='heavy'){const off=.022;
      // sabaton lames across the foot, greave with trims, knee cop with a fan
      mdFS(B,P,s,off,{t:'m',col:m=>m.y<.03?dk:(Math.round(m.z*40)%2&&m.z>F[1].p[2]?ps:M)});
      for(let i=0;i<3;i++){const q=mdRAt(F,1.4+i*.6);mdLoft(B,[Object.assign({},q,{p:[q.p[0],q.p[1],q.p[2]-.006]}),Object.assign({},q,{p:[q.p[0],q.p[1],q.p[2]+.006]})],{seg:7,off:off+.006,t:'m',col:i==0&&lv>=2?T:mdSh(M,.85),ref:[0,1,0],keep:m=>m.y>.03})}
      mdLS(B,P,s,st=='hobnail'?4:3,6,off,{t:'m',col:m=>m.y>.27?ps:m.s>.6&&lv>=2?ps:M});
      mdLB(B,L,6,.008,off+.008,T,{});if(st!='hobnail')mdLB(B,L,4.1,.008,off+.008,lv>=2?T:mdSh(M,.8),{});else{mdLB(B,L,4.2,.016,off+.006,0x3a2618,{t:'c',fl:.012});mdLB(B,L,5,.006,off+.004,0x3a2618,{t:'c'});mdBuckle(k,l+'1',L[4].p[0]+s*(L[4].rx+.024),.21,L[4].p[2],.6,T,0x3a2618,L[4].w,s*Math.PI/2)}
      if(st!='hobnail'){const K=L[3],kp=K.p;k.p(l+'1','sph','m',ps,kp[0],kp[1],kp[2]+K.f+.03,.045,.05,.034);mdOW(k,K.w);k.p(l+'1','box','m',T,kp[0]+s*.045,kp[1],kp[2]+K.f+.012,.012,.06,.05,0,0,0);mdOW(k,K.w);
        if(lv>=3){k.p(l+'1','box','m',T,kp[0],kp[1]+.045,kp[2]+K.f+.03,.06,.012,.03,.3);mdOW(k,K.w)}
        if(st=='stomper'||st=='tread'||st=='wall'||st=='warlord'){k.p(l+'1','cone4','m',T,kp[0],kp[1],kp[2]+K.f+.075,.016,.05,.016,Math.PI/2);mdOW(k,K.w)}
        // rivets down the greave
        for(let i=0;i<3;i++){const q=mdRAt(L,4+i*.6);k.p(l+'1','oct','m',T,q.p[0]+s*(q.rx+off+.002),q.p[1],q.p[2],.007);mdOW(k,q.w)}}
      if(st=='tread'||st=='blood'||st=='warlord')k.L(l+'1','m',mdSh(T,1.05),[s*.15,.2,0],[s*.2,.26,-.02],.016,.002,4);
      if(st=='wall'){mdLB(B,L,5.3,.03,off+.006,mdSh(M,1.08),{});mdLB(B,L,5.6,.006,off+.012,T,{})}
      if(G)mdLB(B,L,5.6,.005,off+.01,G,{t:'g',keep:m=>m.s>0})}
    else if(a=='medium'){const off=.016,lt=0x3a2618,top=st=='trail'||st=='path'?5:4;
      mdFS(B,P,s,off,{col:m=>m.y<.03?0x1e1610:m.y<.045?mdSh(M,.75):M});mdLS(B,P,s,top,6,off,{col:M});
      // folded cuff (fur for pelt/path), laces up the front, a strap with buckle
      const fur=st=='pelt'||st=='path';mdLB(B,L,top+.05,.02,off+.012,fur?0xd8ccb0:mdSh(M,1.18),{t:'c',fl:.012,col:fur?(m=>Math.round(m.c*5+m.s*3)%2?0xd8ccb0:0xb8ac90):mdSh(M,1.18)});
      for(let i=0;i<4;i++){const q=mdRAt(L,top+.4+i*((6-top-.5)/3));if(q.p[1]<.08)continue;[-1,1].forEach(j=>{k.p(l+'1','box','c',0xd8c8a0,q.p[0],q.p[1],q.p[2]+q.f+off+.004,.03,.004,.004,0,0,j*.5);mdOW(k,q.w)})}
      mdLB(B,L,5.7,.008,off+.006,lt,{t:'c'});const q=mdRAt(L,5.7);mdBuckle(k,l+'1',q.p[0]+s*(q.rx+off+.01),q.p[1],q.p[2],.55,T,lt,q.w,s*Math.PI/2);
      if(st=='stalker'||st=='strider'||st=='gale'){mdLS(B,P,s,4,6,off+.004,{col:A,keep:m=>m.s>.5&&Math.round(m.y*45)%2==0})}
      if(st=='gale'||st=='trail'&&lv>=4){for(let i=0;i<3;i++)k.p(l+'1','cone4','c',i%2?A:0xe8e8f0,L[4].p[0]+s*(L[4].rx+.02),.24+i*.02,-.02-i*.02,.01,.07,.004,-.5,0,-s*.5)}
      if(st=='stalker'||st=='strider'){mdLB(B,L,4.6,.006,off+.01,T,{})}
      if(G)k.p(l+'1','oct','g',G,L[5].p[0],L[5].p[1],L[5].p[2]+L[5].f+off+.006,.012)}
    else if(a=='light'){const off=.012,dm=0x2a2c32;mdFS(B,P,s,off,{col:m=>m.y<.03?0x14100c:M});mdLS(B,P,s,st=='soft'?5:4,6,off,{col:m=>Math.round(m.y*40)%2?M:mdSh(M,.75)});
      // wraps, ankle strap, shin guard of dark metal, a small blade at the boot
      mdLB(B,L,st=='soft'?5.05:4.05,.008,off+.006,mdSh(M,.65),{t:'c'});mdLB(B,L,5.85,.006,off+.006,T,{});
      if(st!='soft'){const R=[mdRAt(L,4.2),mdRAt(L,5.4)];mdLoft(B,R,{seg:8,off:off+.008,t:'m',col:lv>=3?mdSh(M,.9):dm,keep:m=>m.s>.45})}
      if(st=='wrapped'){mdLS(B,P,s,3,4,off,{col:mdSh(M,.8)});mdLB(B,L,3.4,.006,off+.006,mdSh(M,.6),{t:'c'})}
      if(st=='storm'||st=='glass'){mdLS(B,P,s,5,6,off+.006,{col:G||A,t:G?'g':'c',keep:m=>m.y>.14&&m.s>0})}
      if(s>0&&lv>=2){const q=mdRAt(L,4.8);k.p(l+'1','box','m',0xb8bec8,q.p[0]+(q.rx+off+.008),q.p[1]+.02,q.p[2],.004,.07,.012);mdOW(k,q.w);k.p(l+'1','box','c',0x241812,q.p[0]+(q.rx+off+.008),q.p[1]-.02,q.p[2],.008,.03,.014);mdOW(k,q.w)}}
    else{const off=.01;
      if(st=='sandal'){mdFS(B,P,s,.004,{col:P.col.skin});mdLoft(B,F.slice(0,4),{seg:7,off:.008,ref:[0,1,0],col:m=>m.y<.03?0x3a2618:M,keep:m=>m.y<.03||Math.round(m.i*2)%2==0});mdLS(B,P,s,5,6,.008,{col:M,keep:m=>Math.round(m.y*50)%2==0})}
      else{mdFS(B,P,s,off,{col:m=>m.y<.03?0x14100c:M});mdLS(B,P,s,st=='slipper'?6:5,6,off,{col:M});if(st=='tempest'||st=='lich'||st=='slipper'&&lv>=1)k.p(l+'2','cone4','c',A,F[4].p[0],.05,F[4].p[2]+.03,.022,.06,.018,Math.PI/2-.4);
        // embroidered cuff and a band over the instep
        mdLB(B,L,st=='slipper'?5.9:5.05,.008,off+.006,lv>=2?T:A,{t:lv>=2?'m':'c'});const q=mdRAt(F,2.2);mdLoft(B,[Object.assign({},q,{p:[q.p[0],q.p[1],q.p[2]-.008]}),Object.assign({},q,{p:[q.p[0],q.p[1],q.p[2]+.008]})],{seg:7,off:off+.004,ref:[0,1,0],col:A,keep:m=>m.y>.03});
        if(lv>=3){k.p(l+'2','oct',G?'g':'m',G||d.gem||A,F[2].p[0],F[2].p[1]+F[2].f+off+.004,F[2].p[2],.01)}
        if(st!='slipper')mdLS(B,P,s,5,6,off+.006,{col:G||A,t:G?'g':'c',keep:m=>m.y>.13&&Math.round(m.c*4)%2==0})}}});
  mdKit(B,k)}

// =====================================================================================================
// class capes and the paladin tabard over armour
