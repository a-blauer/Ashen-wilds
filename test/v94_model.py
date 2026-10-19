# v94 model: sheets of every humanoid (hero classes, foes, Sovereigns, town folk), worn equipment and hero looks,
# plus triangle / draw-call numbers and a few fit checks.
#   python3 v94_model.py                                  -> this build (TAG=after)
#   SRC=<old.html> TAG=before python3 v94_model.py        -> the same sheets for another build (compare)
#   PART=ref,heroes,foes,npc,gear,look,perf,checks,game (default all)   ONLY=<subject,...> (heroes/foes)
# Sheets: <AW_TMP>/v94_<TAG>_<part>.jpg
import play,json,base64,os
TAG=os.environ.get('TAG','after');PART=os.environ.get('PART','ref,heroes,foes,npc,gear,look,perf,checks,game').split(',')
ONLY=[s for s in os.environ.get('ONLY','').split(',') if s]
LIB=r"""
window.V94=(function(){
  window.requestAnimationFrame=()=>0;
  const R={};
  R.init=(FW,FH)=>{const rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);rd.shadowMap.enabled=false;
    const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a4048);sc.add(new THREE.HemisphereLight(0xc8d4e0,0x403428,.85));
    const dl=new THREE.DirectionalLight(0xfff0d8,1.15);dl.position.set(2,5,4);sc.add(dl);const d2=new THREE.DirectionalLight(0x9ab0ff,.35);d2.position.set(-3,2,-4);sc.add(d2);
    const gr=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshLambertMaterial({color:0x4a5a3a}));gr.rotation.x=-Math.PI/2;sc.add(gr);
    const cam=new THREE.PerspectiveCamera(30,FW/FH,.05,300);R.rd=rd;R.sc=sc;R.cam=cam;R.FW=FW;R.FH=FH};
  R.lbl=(c,t,x,y)=>{c.fillStyle='#fff';c.font='12px sans-serif';c.fillText(t,x+4,y+13)};
  R.wpn=(cls,tp,r)=>{if(tp==null)tp=ITPL.findIndex(t=>t.cls==cls&&t.sl=='weapon'&&!t.nw);eq.weapon={id:uid++,tp,lv:12,req:1,r:r==null?2:r,up:0,aff:[]};
    if(cls=='paladin'&&!eq.offhand)eq.offhand={id:uid++,tp:ITPL.findIndex(t=>t.sl=='offhand'),lv:12,req:1,r:1,up:0,aff:[]}};
  R.item=(tp,r)=>({id:uid++,tp,lv:12,req:1,r:r==null?1:r,up:0,aff:[]});
  R.hero=(cls,E)=>{hero.cls=cls;hero.lvl=12;SLOTS.forEach(k=>delete eq[k]);if(E)Object.assign(eq,E);if(!eq.weapon)R.wpn(cls);try{hsDirty()}catch(_){}riding=null;HA.cur=null;pl.sw=0;refreshGear();
    return {o:pl,anim:(t,mv)=>animHero(t,mv,pl),atk:()=>swingAnim(0,300,()=>{}),hero:1}};
  R.foe=key=>{const g=mkHumanoid(key);g.isE=1;const e={m:g,agg:0,c:{g:[key]}};g._ie=e;if(key=='abom'||key=='vlord'){e.boss=1;e.bs={t:5,lock:0};g._bo=e}return {o:g,anim:(t,mv,sp)=>humAnim(g,t,mv,sp),ak:g}};
  R.npc=o=>{const T=window.T_cur;window.T_cur={col:[],cx:0,cy:0};const p=new THREE.Group();const n0=TANIM.length;const g=npc(p,0,0,o);window.T_cur=T;const A=TANIM.splice(n0,1)[0];
    g.children.forEach(c=>{if(c.isSprite)c.visible=false});return {o:p,anim:t=>A.f(t)}};
  R.st={t:300000};
  R.step=(M,ms,mv,v)=>{for(let t=0;t<ms;t+=16){R.st.t+=16;M.anim(R.st.t,mv,mv?v:0);if(mv)M.o.position.set(0,0,0)}};
  // views: [label, model yaw, camera elevation]
  R.fit=(M)=>{M.o.updateMatrixWorld(true);let hb=null;M.o.traverse(x=>{if(!hb&&x.bones&&x.bones.head)hb=x.bones.head});
    let top;if(hb){const v=new THREE.Vector3();hb.getWorldPosition(v);top=(v.y+.17*(v.y/1.1))*1.08}else{const b=new THREE.Box3().setFromObject(M.o);top=b.max.y}
    return {H:Math.max(.8,top),ctr:new THREE.Vector3(0,top*.5,0)}};
  R.shot=(M,F,ctx,col,row,yaw,label,el,zoom)=>{const o=M.o;o.rotation.y=yaw;o.updateMatrixWorld(true);const H=F.H/(zoom||1),d=H*2.35,cam=R.cam;
    const c=F.ctr.clone();if(zoom)c.y=F.H*(zoom>1.8?.86:.62);
    cam.position.set(c.x,c.y+(el||.12)*H,c.z+d);cam.lookAt(c);R.rd.render(R.sc,cam);ctx.drawImage(R.rd.domElement,col*R.FW,row*R.FH);if(label)R.lbl(ctx,label,col*R.FW,row*R.FH)};
  // one row: front, back, side, 3/4, walk a, walk b, attack a, attack b
  R.row=(M,ctx,row,name)=>{const home=M.o.parent;R.sc.add(M.o);M.o.position.set(0,0,0);R.step(M,700,false,0);const F=R.fit(M);
    R.shot(M,F,ctx,0,row,0,name+' front');R.shot(M,F,ctx,1,row,Math.PI,'back');R.shot(M,F,ctx,2,row,Math.PI/2,'side');R.shot(M,F,ctx,3,row,-.7,'3/4');
    R.shot(M,F,ctx,4,row,.4,'face',.05,2.6);
    R.step(M,260,true,1.4);R.shot(M,F,ctx,5,row,Math.PI/2+.25,'walk');R.step(M,180,true,1.4);R.shot(M,F,ctx,6,row,-.6,'walk');R.step(M,900,false,0);
    if(M.atk){M.atk();R.step(M,110,false,0);R.shot(M,F,ctx,7,row,-.6,'attack');R.step(M,110,false,0);R.shot(M,F,ctx,8,row,Math.PI/2+.4,'attack')}
    else if(M.ak){const g=M.ak;g.ak={n:'strike',ph:0,k:0};let tt=0;for(let i=0;i<28;i++){R.st.t+=16;tt+=.016;g.ak.k=Math.min(1,tt/.45);M.anim(R.st.t,false,0)}R.shot(M,F,ctx,7,row,-.6,'wind-up');
      g.ak={n:'strike',ph:1,k:0};tt=0;for(let i=0;i<8;i++){R.st.t+=16;tt+=.016;g.ak.k=Math.min(1,tt/.18);M.anim(R.st.t,false,0)}R.shot(M,F,ctx,8,row,Math.PI/2+.4,'strike');g.ak=null}
    R.step(M,600,false,0);R.sc.remove(M.o);if(home)home.add(M.o);if(M.o===pl)pl.position.set(START[0],0,START[1])};
  R.sheet=(list,make)=>{const cnv=document.createElement('canvas');cnv.width=R.FW*9;cnv.height=R.FH*list.length;const ctx=cnv.getContext('2d'),err=[];
    list.forEach((s,i)=>{try{R.row(make(s),ctx,i,s)}catch(e){err.push(s+': '+e+' '+(e.stack||'').slice(0,300))}});return {img:cnv.toDataURL('image/jpeg',.86),err}};
  // a grid of single shots (gear, looks): each entry {name, make()}, yaw per cell
  R.grid=(list,cols,yaws,zoom)=>{const rows=Math.ceil(list.length/cols)*yaws.length;const cnv=document.createElement('canvas');cnv.width=R.FW*cols;cnv.height=R.FH*rows;const ctx=cnv.getContext('2d'),err=[];
    list.forEach((e,i)=>{try{const M=e.make();const home=M.o.parent;R.sc.add(M.o);M.o.position.set(0,0,0);R.step(M,500,false,0);if(e.walk)R.step(M,e.walk,true,1.4);const F=R.fit(M);
      yaws.forEach((y,j)=>R.shot(M,F,ctx,i%cols,Math.floor(i/cols)*yaws.length+j,y,j?'':e.name,null,zoom));R.sc.remove(M.o);if(home)home.add(M.o);if(M.o===pl)pl.position.set(START[0],0,START[1])}catch(er){err.push(e.name+': '+er+' '+(er.stack||'').slice(0,300))}});
    return {img:cnv.toDataURL('image/jpeg',.86),err}};
  // triangles and draw calls of an object
  R.cost=o=>{let tris=0,calls=0;o.traverse(m=>{if(!(m.isMesh||m.isSkinnedMesh)||!m.visible)return;let v=m;while(v){if(!v.visible)return;v=v.parent}
    const g=m.geometry;if(!g)return;const n=g.index?g.index.count:g.attributes.position.count;const dr=g.drawRange&&g.drawRange.count!==Infinity?Math.min(n,g.drawRange.count):n;tris+=dr/3;calls++});return {tris:Math.round(tris),calls}};
  return R})();
"""
FOES=['hob','sling','shaman','bandit','brigand','cultist','orc','skel','archer','knight','giant','revenant','nagaw','nagaa','nagas','troll','trollsh','yeti','selem','ghoul','vamp','vampk','vampm','abom','vlord']
def save(name,data):
    open(play.TMP+f'/v94_{TAG}_{name}.jpg','wb').write(base64.b64decode(data.split(',')[1]))
def s(pg):
    ev=pg.evaluate;errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev(LIB);ev("()=>V94.init(150,190)")
    new=ev("()=>typeof heroRebuild=='function'")
    if 'ref' in PART:
        r=ev("""()=>{const L=[];['Foxlet','Ashwolf','Boneling','Drakelet','Mossfrog'].forEach(sp=>L.push({name:sp,make:()=>{const c=mkC(sp,5,0,'');c.z=1;const g=cr(c);return {o:g,anim:(t,mv,s)=>animC(g,t,mv,s)}}}));
          L.push({name:'warrior',make:()=>V94.hero('warrior')});L.push({name:'mage',make:()=>V94.hero('mage')});
          ['bandit','orc','skel','vamp'].forEach(k=>L.push({name:k,make:()=>V94.foe(k)}));return V94.grid(L,11,[-.6,.9])}""")
        save('ref',r['img']);print('ref err',r['err'])
    if 'heroes' in PART:
        L=ONLY or ['warrior','paladin','assassin','ranger','mage']
        r=ev("(L)=>V94.sheet(L,c=>V94.hero(c))",L);save('heroes',r['img']);print('heroes err',r['err'])
    if 'foes' in PART:
        L=ONLY or FOES
        for i in range(0,len(L),7):
            r=ev("(L)=>V94.sheet(L,k=>V94.foe(k))",L[i:i+7]);save('foes%d'%(i//7+1),r['img']);print('foes err',r['err'])
    if 'npc' in PART:
        r=ev("""()=>{const O=[{robe:0x2a4a7a,trim:0xc9a24a,hat:'cap',hatC:0x6a2a2a,label:'Merchant'},{robe:0x6a3a2a,trim:0x2a1a12,hat:'chef',apron:1,label:'Innkeeper'},
          {robe:0x3a2a5a,trim:0xc9a24a,hat:'wiz',hatC:0x2a2a6a,label:'Mage'},{robe:0x4a4a3a,trim:0x6a5a3a,label:'Folk'},{robe:0x5a2a2a,trim:0x8a6a2a,label:'Smith',apron:1},{robe:0x2a3a2a,trim:0x6a8a4a,hat:'cap',hatC:0x3a5a2a,label:'Ranger'}];
          return V94.grid(O.map(o=>({name:o.label,make:()=>V94.npc(o)})),6,[-.5,Math.PI*.8])}""")
        save('npc',r['img']);print('npc err',r['err'])
    if 'gear' in PART:
        r=ev("""()=>{const L=[],T=ITPL.map((t,i)=>Object.assign({i},t));
          const pick=(arm,sl,f)=>T.filter(t=>t.arm==arm&&t.sl==sl&&(!f||f(t)));
          const armOf={warrior:'heavy',paladin:'heavy',assassin:'light',ranger:'medium',mage:'cloth'};
          Object.keys(armOf).forEach(cls=>{const a=armOf[cls],H=pick(a,'helm'),C=pick(a,'chest'),B=pick(a,'boots'),A=T.filter(t=>t.sl=='amulet'),Rg=T.filter(t=>t.sl=='ring'),W=T.filter(t=>t.cls==cls&&t.sl=='weapon');
            for(let j=0;j<5;j++){const r=Math.min(4,j);L.push({name:cls+' t'+H[j].t+' r'+r,make:()=>V94.hero(cls,{helm:V94.item(H[j].i,r),chest:V94.item(C[j].i,r),boots:V94.item(B[j].i,r),amulet:V94.item(A[j].i,r),ring:V94.item(Rg[j].i,r),weapon:V94.item(W[j%W.length].i,r),
              offhand:cls=='paladin'?V94.item(T.filter(t=>t.sl=='offhand')[j].i,r):undefined})})}
            // the v78 sets
            const sets=[...new Set(C.filter(t=>t.nw).map(t=>t.n.split(' ')[0]))];sets.forEach(sn=>{const f=t=>t.nw&&t.n.startsWith(sn+' ');const h=pick(a,'helm',f)[0],c=pick(a,'chest',f)[0],b=pick(a,'boots',f)[0];
              L.push({name:cls+' '+sn,make:()=>V94.hero(cls,{helm:V94.item(h.i,3),chest:V94.item(c.i,3),boots:V94.item(b.i,3),weapon:V94.item(W[5+(sn.length%(W.length-5))].i,3)})})});
            L.push({name:cls+' none',make:()=>V94.hero(cls,{})});L.push({name:cls+' helm only',make:()=>V94.hero(cls,{helm:V94.item(H[2].i,2)})})});
          window.V94G=L;return L.length}""")
        ev("()=>V94.init(260,330)")
        for i,cls in enumerate(['warrior','paladin','assassin','ranger','mage']):
            r=ev("(i)=>V94.grid(V94G.slice(i*10,i*10+10),10,[-.55,Math.PI*.85])",i);save('gear_'+cls,r['img']);print('gear err',r['err'])
        ev("()=>V94.init(150,190)")
        r=ev("""()=>{const L=[],T=ITPL.map((t,i)=>Object.assign({i},t));const C=T.filter(t=>t.arm=='heavy'&&t.sl=='chest'),H=T.filter(t=>t.arm=='heavy'&&t.sl=='helm');
          ['warrior','paladin','assassin','ranger','mage'].forEach(cls=>{const arm={warrior:'heavy',paladin:'heavy',assassin:'light',ranger:'medium',mage:'cloth'}[cls];
            const E={helm:V94.item(T.filter(t=>t.arm==arm&&t.sl=='helm')[3].i,4),chest:V94.item(T.filter(t=>t.arm==arm&&t.sl=='chest')[3].i,4),boots:V94.item(T.filter(t=>t.arm==arm&&t.sl=='boots')[3].i,4)};
            [0,130,260,420].forEach(w=>L.push({name:cls+(w?' walk '+w:' idle'),walk:w,make:()=>V94.hero(cls,E)}))});
          return V94.grid(L,8,[-.6,Math.PI/2])}""")
        save('gearwalk',r['img']);print('gearwalk err',r['err'])
    if 'look' in PART and new:
        r=ev("""()=>{const L=[],D={skin:'#d9b38c',hair:'#3a2414',hairStyle:0,face:0,eye:'#4a6a8a',build:1,height:1,sex:0};
          const mk=(n,o,cls)=>L.push({name:n,make:()=>{hero.look=Object.assign({},D,o);return V94.hero(cls||'warrior',{})}});
          for(let i=0;i<6;i++)mk('hair '+i,{hairStyle:i});for(let i=0;i<6;i++)mk('hair f '+i,{hairStyle:i,sex:1,hair:'#8a5a2a'});
          for(let i=0;i<6;i++)mk('face '+i,{face:i,hairStyle:0});
          [0,1,2].forEach(b=>mk('build '+b,{build:b}));[0,1,2].forEach(b=>mk('fem build '+b,{build:b,sex:1,hairStyle:1}));
          mk('h .94',{height:.94});mk('h 1.06',{height:1.06});
          [['#f1d2b6','#e8d080','#3a8a4a'],['#c48a5a','#1a1410','#6a3a1a'],['#7a4a2a','#2a1a10','#2a2a2a'],['#5a3a24','#c8c8c8','#8a2a2a'],['#e0b090','#a02818','#2a6aaa'],['#b07850','#4a2a5a','#d0a020']].forEach((c,i)=>mk('col '+i,{skin:c[0],hair:c[1],eye:c[2],hairStyle:i,face:i%3==0?2:0,sex:i%2}));
          ['paladin','assassin','ranger','mage'].forEach(c=>mk(c+' fem',{sex:1,hairStyle:3},c));
          delete hero.look;return V94.grid(L,10,[-.45,Math.PI*.8])}""")
        save('look',r['img']);print('look err',r['err'])
        r=ev("""()=>{const L=[],D={skin:'#d9b38c',hair:'#3a2414',hairStyle:0,face:0,eye:'#4a6a8a',build:1,height:1,sex:0};
          const mk=(n,o)=>L.push({name:n,make:()=>{hero.look=Object.assign({},D,o);return V94.hero('ranger',{})}});
          for(let i=0;i<6;i++)mk('hair '+i,{hairStyle:i,face:i});for(let i=0;i<6;i++)mk('fem '+i,{hairStyle:i,sex:1,face:i==5?5:0,hair:'#a0602a',eye:'#3a9a5a'});
          delete hero.look;return V94.grid(L,6,[.35,Math.PI*.7],2.6)}""")
        save('lookface',r['img']);print('lookface err',r['err'])
    if 'look' in PART and new:
        ev("()=>V94.init(220,300)")
        r=ev("""()=>{const L=[],D={skin:'#d9b38c',hair:'#3a2414',hairStyle:2,face:0,eye:'#4a6a8a',build:1,height:1,sex:0};
          [0,1].forEach(sx=>[0,1,2].forEach(b=>L.push({name:(sx?'fem ':'masc ')+['lean','avg','broad'][b],make:()=>{hero.look=Object.assign({},D,{sex:sx,build:b});return V94.hero('assassin',{})}})));
          delete hero.look;return V94.grid(L,6,[0,Math.PI/2])}""")
        save('lookbody',r['img']);print('lookbody err',r['err']);ev("()=>V94.init(150,190)")
    if 'perf' in PART:
        r=ev("""()=>{const out={};V94.hero('warrior');out.hero=V94.cost(pl);
          const keys=['bandit','orc','skel','archer','cultist','brigand','troll','vamp','vampk','ghoul','nagaw','hob','knight','revenant','shaman','sling','vampm','trollsh','yeti','giant'];
          let t=0,c=0;const per={};keys.forEach(k=>{const g=mkHumanoid(k);const q=V94.cost(g);per[k]=q;t+=q.tris;c+=q.calls});out.foes20={tris:t,calls:c};out.per=per;
          out.total={tris:out.hero.tris+t,calls:out.hero.calls+c};
          // geometry sharing: two of the same foe share geometry
          const a=mkHumanoid('orc'),b=mkHumanoid('orc');const ga=[],gb=[];a.traverse(m=>{if(m.geometry)ga.push(m.geometry.uuid)});b.traverse(m=>{if(m.geometry)gb.push(m.geometry.uuid)});
          out.shared=ga.filter(u=>gb.includes(u)).length+'/'+ga.length;return out}""")
        print(TAG,'PERF',json.dumps(r))
    if 'checks' in PART and new:
        r=ev("""()=>{const o={};
          // bones and hand positions are unchanged
          o.bones=Object.keys(pl.bones).join(',');pl.updateMatrixWorld(true);const v=new THREE.Vector3();
          o.hands=['aR2','aL2'].map(n=>pl.bones[n].getWorldPosition(v).sub(pl.position).toArray().map(x=>+x.toFixed(3)));
          o.preview=(()=>{const g=heroBuildPreview({hairStyle:2,sex:1,build:2,height:1.05},'mage');const ok=g&&g.isGroup;try{g.userData.anim&&g.userData.anim(1000)}catch(e){return 'anim '+e}return ok+' '+V94.cost(g).calls})();
          hero.look={skin:'#c48a5a',hair:'#1a1410',hairStyle:4,face:3,eye:'#6a3a1a',build:2,height:1.06,sex:0};heroRebuild();o.sc=+pl.children.find(m=>m.isSkinnedMesh&&!m.dk).scale.y.toFixed(3);
          o.look=JSON.stringify(mdLookOf(pl,hero.cls));delete hero.look;heroRebuild();
          return o}""")
        print(TAG,'CHECKS',json.dumps(r))
    if 'game' in PART:
        ev("()=>{camPitch=.35;camDist=7;const T=TOWNS[0];toPos(T.cx+1,T.cy+4.5,0);pl.rotation.y=Math.PI;snapCam();return 1}");pg.wait_for_timeout(3500)
        pg.screenshot(path=play.TMP+f'/v94_{TAG}_town.png',timeout=120000)
    print(TAG,'PAGEERRORS',len(errs),errs[:5])
play.run(s,w=1000,hh=620)
