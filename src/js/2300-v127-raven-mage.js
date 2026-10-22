// ================= v127: the raven Mage (replaces the frog) =================
// A bipedal raven: a round feathered skull with a heavy curved beak (nasal bristles over its base, a hooked tip, the gape
// line), dark side-set eyes, shaggy throat hackles and a ruffled nape; a deep keeled chest, a thick feathered neck; arms that
// are wings (primaries fan out behind each wrist, so they show below a robe's sleeves; bare arms also carry the secondaries
// along the forearm); scaly three-fingered talon hands with a thumb; feathered thighs over thin scaled shanks; bird feet with
// three forward toes and a back toe, all hooked claws; a stiff wedge tail of long feathers that pivots at the rump.
// Built with the v114 beast engine (2100): same hero skeleton retargeted, one tail bone (tl0) carrying the whole fan.
// Feathers are one shared low-poly blade (`rvFeatherG`: a flat diamond, widest near the tip, a ridge along the shaft).
var RV_FG=null;
function rvFeatherG(){if(RV_FG)return RV_FG;const g=new THREE.BufferGeometry(),
    v=[0,0,0, 0,1,0, -1,.62,0, 1,.62,0, 0,.52,1, 0,.52,-1];
  g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex([0,3,4, 0,4,2, 0,2,5, 0,5,3, 1,4,3, 1,2,4, 1,5,2, 1,3,5]);
  return RV_FG=g}
// one feather on bone bn: from base along dir, flat side facing nrm; len, half-width w, half-thickness th
function rvFeather(k,bn,col,base,dir,nrm,len,w,th,t,wt){const V=THREE.Vector3,y=new V(...dir).normalize(),z=new V(...nrm);z.sub(y.clone().multiplyScalar(z.dot(y))).normalize();
  const x=new V().crossVectors(y,z),m=new THREE.Matrix4().makeBasis(x.multiplyScalar(w),y.multiplyScalar(len),z.multiplyScalar(th||.004));m.setPosition(new V(...base));
  const p={bn,geo:rvFeatherG(),t:t||'c',col,m};if(wt)p.w=wt;k.P.push(p);return p}
// a feather direction turned by yaw (about y) then pitch (down from horizontal)
function rvDir(yaw,pitch){return [Math.sin(yaw)*Math.cos(pitch),-Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)]}
brDef(6,{key:'raven',n:'Raven',cls:'mage',furN:'Plumage',
  fur:['#2a2c35','#262232','#30333a','#3a3029','#5c5e64','#d8d6d0'],eye:['#3a2414','#0e0c0c','#d0a030','#9ec4e0','#9a40e0'],
  cols:L=>{const f=mdC(L.skin),pale=(((f>>16)&255)+((f>>8)&255)+(f&255))>480;
    return brPal(L,{FURD:mdSh(f,.62),FURL:mdMix(f,0x6c78c8,pale?.08:.34),BELLY:mdMix(f,0x8a8a90,.05),
      BEAK:pale?0xb8b4ac:mdMix(0x26262c,f,.2),BEAKL:pale?0xd0ccc4:mdMix(0x3a3c46,f,.15),MOUTH:0x0c0c0e,NOSE:0x101012,
      SCALE:pale?0xa8a49c:mdMix(0x2e2e34,f,.2),SCALED:pale?0x8a867e:mdMix(0x1e1e22,f,.2),CLAW:0x0c0c0e,PINK:pale?0xa8a49c:mdMix(0x2e2e34,f,.2)})},
  // upright but leaning: narrow hips, a deep chest, a thick short neck, long wing-arms, long thin legs
  pre:{pelvis:[.86,1,.92],spine:[.86,1.02,.98],chest:[.96,1.02,1.12],neck:[1.1,1.12,1.1],head:1.12,arm:[1.12,.84],hand:1.05,leg:[1.22,.84],foot:1.05,cape:[1.15,1]},
  shear:{spine:.12,chest:.24,neck:.28},crouch:[.34,.66],pose:{sp:.1,ch:.05,shx:-.22,el:-.5},run:{sp:.14,shx:-.3,el:-.2},look:[.05,0],atk:{shz:.12},
  // torso rings (hips → neck): the keel bulges forward at the breast, the neck ruff is thick
  TR:[[.88,.88,.87,.9,.98,1.05,1.04,.94,.9,1.04,1.06,1.06],[.95,1,1.08,1.18,1.3,1.38,1.34,1.18,1.06,1.08,1.1,1.08],[.98,1,1,1,1.02,1.06,1.1,1.1,1.04,1.04,1.06,1.06]],
  armK:[.9,.9,.86,.8,.78,.7],legK:[1.04,1.12,1.06,.72,.5,.44,.4],foot:{len:.42,w:.7,h:.72},
  // skull + beak, back → front: [z, y centre, half-width, top, underside]
  SN:[[-.108,1.162,.04,.04,.04],[-.088,1.166,.074,.072,.066],[-.058,1.17,.094,.09,.084],[-.022,1.172,.1,.094,.09],[.014,1.168,.095,.087,.088],
      [.044,1.158,.078,.07,.078],[.066,1.146,.052,.06,.06],[.088,1.141,.042,.052,.048],[.114,1.136,.034,.044,.037],[.14,1.129,.027,.036,.028],
      [.164,1.119,.02,.028,.019],[.184,1.106,.014,.021,.011],[.198,1.09,.009,.014,.006],[.206,1.072,.004,.007,.003]],
  EYEP:[.07,1.176,.03],EAR:null,muzzleZ:.066,hoodZ:-.004,crownZ:-.05,hatZ:-.06,bandY:1.2,bandZ:-.04,
  TP:[[0,.62,-.09,.04],[0,.5,-.24,.04],[0,.38,-.38,.03]],tailSway:[.025,.04,1.1,2.2],
  tailCol:(m,C)=>C.FUR,
  paw:{n:3,len:[.034,.04,.035],rad:.95,claw:.017,spread:.0125,palm:.95,plen:1,curl:1.1,thumb:true,tlen:.022,pad:true,colOf:C=>C.SCALE,padColOf:C=>C.SCALED},handCol:C=>C.SCALE,
  toes:{n:3,len:.085,claw:.02,colOf:C=>C.SCALE,padColOf:C=>C.SCALED},
  paint(P,C){const row=m=>((m.y*34+Math.abs(m.x)*18)%1)<.24;
    P.paint.torso=m=>m.s<-.45&&m.y>.78?C.FURL:m.s>.4&&m.y<.68?C.FURD:m.s>.3&&m.y>.84?C.BELLY:C.FUR;
    P.paint.torsoLo=m=>m.s>.45?C.FURD:C.FUR;
    P.paint.leg=(m,s)=>{const pt=m.r.part;if(pt=='hip'||pt=='thigh')return row(m)?C.FURD:C.FUR;if(pt=='knee')return C.FUR;
      return Math.floor(m.y*70)%2?C.SCALE:C.SCALED};
    P.paint.fore=m=>m.r.part=='wrist'?C.FURD:C.FUR;P.paint.sleeve=m=>m.s<-.3?C.FURL:C.FUR},
  head(B,P,o){const D=this,C=BR.C,k=dkKit();P.head={w:1,jaw:.9,top:1,len:1,fwd:-.01};const H=P._H=mdHeadR(P);
    brSkull(B,D,m=>{const z=m.r.p[2];
      if(z>.062){ // the beak: bristles over its base, the gape line along the side, a lighter ridge on top
        if(z<.11&&m.s>.25)return C.FURD;
        return m.s>.7?C.BEAKL:C.BEAK}
      if(m.s<-.35&&z>-.04)return C.BELLY;if(m.s>.65&&z<.02)return C.FURL;return C.FUR},{seg:14,capB:{dz:.002}});
    // nostrils under the bristles, a tuft of bristles fanning forward over the beak base
    const at=z=>brSkullAt(D,z);
    [-1,1].forEach(s=>{const q=at(.1),x=q.rx*.62;k.p('head','box','c',C.NOSE,s*x,q.yc+q.f*.55,.1,.004,.003,.008,0,s*.3,0);
      for(let i=0;i<3;i++){const z=.064+i*.012,qq=at(z),xx=s*(.008+i*.006);rvFeather(k,'head',i%2?C.FURD:C.FUR,[xx,qq.top-.004,z],[s*.08,-.18,1],[s*.25,1,0],.045-.008*i,.009,.0035)}});
    rvFeather(k,'head',C.FURD,[0,at(.06).top-.002,.06],[0,-.12,1],[0,1,0],.05,.01,.004);
    // eyes: set on the sides, a dark ring, a glossy dark eye with the iris colour, a feathered brow
    brEyes(k,D,{sz:1,fw:.3,socket:C.FURD,white:0x060606,brow:C.FURD,browY:.019});
    // hackles: shaggy lance feathers hanging from the throat, longest in the middle
    for(let r=0;r<3;r++)for(let i=-3;i<=3;i++){if(r==2&&Math.abs(i)>2)continue;const t=(i+(r==1?.5:0))/3.4,z=.03-r*.035-Math.abs(t)*.015,q=at(Math.max(-.05,z)),x=t*q.rx*.75,y=q.yc-q.b*Math.sqrt(Math.max(0,1-t*t*.56))+.006;
      rvFeather(k,'head',(i*7+r*3)%3?C.FUR:C.FURD,[x,y,z+.006],[t*.22,-1,.2-r*.1],[t*.7,.1,1],(.1-.028*Math.abs(t)-.012*r)*(1+.18*Math.sin(i*2.7+r*1.9)),.017,.004,'c',[['head',.7],['neck',.3]])}
    // the gape: a thin dark line along each side of the beak, from under the eye to near the tip
    [-1,1].forEach(sd=>{const Z=[.05,.075,.1,.13,.16,.184];for(let i=0;i+1<Z.length;i++){const p=z=>{const q=at(z),y=q.yc-q.b*.12;return [sd*(brSurfX(D,z,y)+.0008),y,z]};
      k.L('head','c',C.MOUTH,p(Z[i]),p(Z[i+1]),.0026-.0003*i,.0023-.0003*i,4)}});
    // the nape: a few loose feathers lying back over the neck
    for(let i=0;i<4;i++){const z=-.06-i*.016,q=at(z),x=(i%2?1:-1)*.012*i;rvFeather(k,'head',i%2?C.FURD:C.FUR,[x,q.top-.012,z],[x*3,-.45-i*.12,-1],[0,1,-.3],.075-.006*i,.017,.004)}
    mdKit(B,k);return H},
  // the wings on the arms: primaries fan out behind each wrist (always), secondaries along the forearm and coverts on the
  // upper arm (bare only, a robe's sleeve covers them)
  wings(B){const C=BR.C,k=dkKit(),V=THREE.Vector3,full=!!BR.bare;
    [['aL',-1],['aR',1]].forEach(([a,s])=>{const A0=mdV(HB[a+'0']),A1=mdV(HB[a+'1']),A2=mdV(HB[a+'2']),out=[s,0,0],xo=0;
      // primaries: 6 from the back of the wrist, trailing back (and a little down / out) like a folded wing's tip
      for(let i=0;i<6;i++){const t=i/5,b=A2.clone().add(new V(s*(.014+t*.006),.045-t*.02,-.02)),dir=[s*(.1+t*.1),-.55+t*.25,-1];
        rvFeather(k,a+'2',i%2?C.FURD:C.FUR,b.toArray(),dir,[s,0,0],.2+.08*t,.021,.005,'c')}
      if(!full)return;
      // bare only: a skirt of belly and flank feathers over the hip joints, so the thighs grow out of the body like a bird's
      if(s>0)for(let i=0;i<13;i++){const a=-2.3+i/12*4.6,P0=BR.P||mdP({}),q=mdTorsoAt(P0,.56),r=Math.cos(a)>0?q.f:q.b,b=new V(Math.sin(a)*q.rx*.92,.56,Math.cos(a)*r*.92);
        rvFeather(k,'pelvis',i%2?C.FURD:C.FUR,b.toArray(),[Math.sin(a)*.3,-1,Math.cos(a)*.3],[Math.sin(a),0,Math.cos(a)],.11+.02*Math.cos(a),.03,.006)}
      // secondaries: a row along the back of the forearm, hanging down and back
      for(let i=0;i<6;i++){const t=i/5,b=A1.clone().lerp(A2,.12+t*.8).add(new V(s*.02,0,-.03));
        rvFeather(k,a+'1',i%2?C.FURD:C.FUR,b.toArray(),[s*.12,-.45-.3*(1-t),-1],[s,0,0],.16+.04*t,.022,.005,'c')}
      // coverts over the upper arm and the elbow
      for(let i=0;i<4;i++){const t=i/3,b=A0.clone().lerp(A1,.2+t*.7).add(new V(s*.035,0,-.02));
        rvFeather(k,a+'0',i%2?C.FURL:C.FUR,b.toArray(),[s*.15,-1,-.25],[s*.6,0,-1],.09,.022,.006,'c')}});
    mdKit(B,k)},
  // the tail: a wedge of 11 long feathers fanned from the rump on the one tail bone, upper coverts over its base
  tailB(B){const C=BR.C,D=BR.R,k=dkKit(),V=THREE.Vector3,base=new V(0,.6,-.1),cd=new V(0,-.84,-.55).normalize(),X=new V(1,0,0),N=new V().crossVectors(X,cd);
    for(let i=-5;i<=5;i++){const t=i/5,a=t*.68,d=cd.clone().multiplyScalar(Math.cos(a)).add(X.clone().multiplyScalar(Math.sin(a))),b=base.clone().add(X.clone().multiplyScalar(t*.035)).add(N.clone().multiplyScalar(-Math.abs(t)*.012));
      rvFeather(k,'tl0',Math.abs(i)%2?C.FURD:C.FUR,b.toArray(),d.toArray(),N.toArray(),.4-.13*Math.pow(Math.abs(t),1.4),.026,.006,'c')}
    for(let i=-2;i<=2;i++){const t=i/2,a=t*.4,d=cd.clone().multiplyScalar(Math.cos(a)).add(X.clone().multiplyScalar(Math.sin(a))),b=base.clone().add(new V(t*.03,.03,.02)).add(N.clone().multiplyScalar(.012));
      rvFeather(k,'tl0',i%2?C.FURL:C.FUR,b.toArray(),d.toArray(),N.toArray(),.17-.03*Math.abs(t),.03,.007,'c',[['tl0',.6],['pelvis',.4]])}
    // the rump the fan grows from
    k.p('tl0','sph2','c',C.FUR,0,.6,-.1,.06,.05,.05,.6);
    mdKit(B,k)},
  // bird feet: three forward toes splayed, a back toe; each toe jointed (scutes as small knuckle pads), a hooked black claw
  toesB(B,P){const C=BR.C,D=BR.R,T=D.toes,k=dkKit(),V=THREE.Vector3;
    [-1,1].forEach(s=>{const l=(s<0?'lh':'rh')+'2',A=mdV(P.bones[l]),lf=P.lf||1;
      const toe=(yaw,len,root,w)=>{const d=new V(Math.sin(yaw),0,Math.cos(yaw)),p0=new V(A.x+root[0],root[1],A.z+root[2]),pts=[p0];
        [.4,.35,.25].forEach((f,j)=>{pts.push(pts[j].clone().add(d.clone().multiplyScalar(len*f*lf)).add(new V(0,-(j==0?.008:.005),0)))});
        pts.forEach((p,j)=>{if(j<3)k.L(l,'c',j%2?C.SCALED:C.SCALE,p.toArray(),pts[j+1].toArray(),(.0115-.0022*j)*lf*(w||1),(.0095-.0022*j)*lf*(w||1),5);
          if(j>0&&j<3)k.p(l,'sph2','c',C.SCALED,p.x,p.y+.001,p.z,.0095*lf*(w||1),.007*lf,.009*lf)});
        const tp=pts[3],c1=tp.clone().add(d.clone().multiplyScalar(.012*lf)).add(new V(0,.002,0)),c2=c1.clone().add(d.clone().multiplyScalar(.008*lf)).add(new V(0,-.012,0));
        k.L(l,'c',C.CLAW,tp.toArray(),c1.toArray(),.005*lf,.0035*lf,4);k.L(l,'c',C.CLAW,c1.toArray(),c2.toArray(),.0035*lf,.0006,4)};
      toe(0,T.len*1.1,[0,.024,.02]);toe(s*.42,T.len*.95,[s*.008,.024,.016]);toe(-s*.42,T.len*.9,[-s*.008,.024,.016]);
      toe(Math.PI-s*.15,T.len*.55,[-s*.004,.024,-.018],.95);
      // a fringe of thigh feathers over the knee (the 'trousers' end), on the thigh bone
      {const H0=mdV(P.bones[(s<0?'lh':'rh')+'0']),K=mdV(P.bones[(s<0?'lh':'rh')+'1']);for(let i=0;i<7;i++){const a=i/7*Math.PI*2,r=.05*lf,b=H0.clone().lerp(K,.78).add(new V(Math.sin(a)*r,0,Math.cos(a)*r));
        rvFeather(k,(s<0?'lh':'rh')+'0',i%2?C.FURD:C.FUR,b.toArray(),[Math.sin(a)*.25,-1,Math.cos(a)*.25],[Math.sin(a),0,Math.cos(a)],.065,.02,.005)}}
      // the ankle joint: a knobbly ball where the shank meets the toes
      k.p(l,'sph2','c',C.SCALED,A.x,.032,A.z+.004,.024*lf,.02*lf,.026*lf)});
    mdKit(B,k)}});
// the Mage is the raven now (the frog's definition stays registered but unused)
BR_CLS.mage=6;
// race-specific builders: the raven's tail fan, feet and wings replace the generic loft / toes
{const f=brTail;brTail=function(B){const D=BR.R;if(D&&D.tailB)return D.tailB(B);return f.apply(this,arguments)}}
{const f=brToes;brToes=function(B,P){const D=BR.R;if(D&&D.toesB)return D.toesB(B,P);return f.apply(this,arguments)}}
{const f=brPaws;brPaws=function(B){const r=f.apply(this,arguments);const D=BR.R;if(D&&D.wings)D.wings(B);return r}}
