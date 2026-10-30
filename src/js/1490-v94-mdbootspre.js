// =====================================================================================================
function mdBootsPre(P,d){P.col.boot=d.M;P.col.shin=d.M}
function mdBoots(B,P,d){const M=d.M,A=d.A,G=d.G,dk=d.dk,st=d.st,k=mdKP(),a=d.a;
  [-1,1].forEach(s=>{const l=s<0?'lh':'rh';
    if(a=='heavy'){const off=.022;mdFS(B,P,s,off,{t:'m',col:m=>m.y<.03?dk:M});mdLS(B,P,s,st=='hobnail'?4:3,6,off,{t:'m',col:m=>m.y>.27?A:M});
      if(st!='hobnail'){const K=P.bones[l+'1'];k.p(l+'1','sph','m',A,K[1],K[2],K[3]+.062,.044,.05,.036);if(st=='stomper'||st=='tread'||st=='wall'||st=='warlord')k.p(l+'1','cone4','m',A,K[1],K[2],K[3]+.105,.016,.05,.016,Math.PI/2)}
      if(st=='tread'||st=='blood'||st=='warlord')k.L(l+'1','m',mdSh(A,1.1),[s*.15,.2,0],[s*.2,.26,-.02],.016,.002,4);
      if(G)mdLS(B,P,s,5,6,off+.006,{t:'g',col:G,keep:m=>m.y>.13})}
    else if(a=='medium'){const off=.016;mdFS(B,P,s,off,{col:m=>m.y<.03?0x1e1610:M});mdLS(B,P,s,st=='trail'?5:4,6,off,{col:M});
      const L=mdLeg(P,s),cuff=Object.assign({},L[st=='trail'?5:4]);cuff.rx+=.012;cuff.f+=.012;cuff.b+=.012;mdLoft(B,[cuff,Object.assign({},cuff,{p:[cuff.p[0],cuff.p[1]+.03,cuff.p[2]]})],{seg:8,off,col:st=='pelt'||st=='path'?0xd8ccb0:mdSh(M,1.15)});
      {const cc=st=='pelt'||st=='path'?0xd8ccb0:mdSh(M,1.15),rim=y=>mdLoft(B,[Object.assign({},cuff,{p:[cuff.p[0],y,cuff.p[2]]}),Object.assign({},cuff,{p:[cuff.p[0],y+.0015,cuff.p[2]],rx:cuff.rx-.011,f:cuff.f-.011,b:cuff.b-.011})],{seg:8,off,col:cc});rim(cuff.p[1]);rim(cuff.p[1]+.0285)}   // v176: the cuff's edges close down onto the boot (it hovered round it)
      if(st=='stalker'||st=='strider'||st=='gale')mdLS(B,P,s,4,6,off+.004,{col:A,keep:m=>m.s>.5&&Math.round(m.y*45)%2==0});
      if(G)k.p(l+'1','oct','g',G,P.bones[l+'1'][1],.2,.09,.012)}
    else if(a=='light'){const off=.012;mdFS(B,P,s,off,{col:m=>m.y<.03?0x14100c:M});mdLS(B,P,s,st=='soft'?6:4,6,off,{col:m=>Math.round(m.y*40)%2?M:mdSh(M,.75)});
      if(st=='storm'||st=='glass')mdLS(B,P,s,5,6,off+.006,{col:G||A,t:G?'g':'c',keep:m=>m.y>.14});if(st=='wrapped')mdLS(B,P,s,3,4,off,{col:mdSh(M,.8)})}
    else{const off=.01;
      if(st=='sandal'){mdFS(B,P,s,.004,{col:P.col.skin});mdLoft(B,mdFoot(P,s).slice(0,4),{seg:7,off:.008,ref:[0,1,0],col:m=>m.y<.03?0x3a2618:M,keep:m=>m.y<.03||Math.round(m.i*2)%2==0});mdLS(B,P,s,5,6,.008,{col:M,keep:m=>Math.round(m.y*50)%2==0})}
      else{mdFS(B,P,s,off,{col:m=>m.y<.03?0x14100c:M});mdLS(B,P,s,st=='slipper'?6:5,6,off,{col:M});if(st=='tempest'||st=='lich')k.p(l+'2','cone4','c',A,P.bones[l+'2'][1],.05,.19,.022,.06,.018,Math.PI/2-.4);
        if(st!='slipper')mdLS(B,P,s,5,6,off+.006,{col:G||A,t:G?'g':'c',keep:m=>m.y>.13})}}});
  mdKit(B,k)}

// =====================================================================================================
// amulet (on the chest, outside whatever the torso wears) and ring (a small glint on the right hand)
