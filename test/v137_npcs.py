# v137 animal townsfolk: every Duskhold keeper and a spread of citizens, rendered and checked.
#   sheets: out/v137_npcs_keep<N>.jpg (keepers) and out/v137_npcs_cit<N>.jpg (citizens): front, 3/4, side, back, face, walk, work
#   checks (FAIL lines): a model without an animal body (human head), page errors, NaN vertices, a hand with no body mesh
#   near it in idle / walk / work poses, a held tool away from the hand, bones missing, the in-game NPCs not animal.
#   SP=fox,bear (species sheets in a plain outfit)   ONLY=keep|cit   VIEWS=front,34,side,back,face,walk,work   NOSHEET=1 (checks only)   PICK=Blacksmith,Cook (keeper labels)
import os,sys,re,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
JS=COMMON+r"""(a)=>{let [views,only,nosheet,pick,spl]=a,V=THREE.Vector3,FW=200,FH=230,out={sheets:{},fails:[],info:[]};
  const fail=s=>out.fails.push(s);
  // ---- what to build: the keepers (from the game's own tables) and citizens of every trade ----
  const K=[];const seen={};
  const addK=(o,wk)=>{if(!o||seen[o.label])return;seen[o.label]=1;K.push({lab:o.label,o:Object.assign({},o),wk})};
  try{(npc.all||[]).forEach(g=>{const o=g.userData&&g.userData.npcO;if(o)addK(o,null)})}catch(e){}
  addK({robe:0x2a4a7a,trim:0xc9a24a,hat:'cap',hatC:0x6a2a2a,label:'Merchant'},null);addK({robe:0x5a3aa0,trim:0xd8b44a,hat:'wiz',hatC:0x2e2078,label:'Magic Vendor'},'magic');
  addK({robe:0x6a3a2a,trim:0x2a1a12,hat:'chef',apron:1,label:'Innkeeper'},null);addK({robe:0x2a3550,trim:0xd8b44a,hat:'cap',hatC:0x1a2236,label:'Stronghold Steward'},null);
  const WKL={Blacksmith:'smith',Alchemist:'alch',Cook:'cook','Stable Master':'stable','Wandering Merchant':'merchant','Beast Trainer':'trainer','Traveling Bard':'bard','Rune Sage':'sage','Magic Vendor':'magic'};
  for(const k in TWN100_NPCO)addK(TWN100_NPCO[k],k);VIS.forEach(v=>addK({robe:v.robe,trim:0xd8b44a,hat:v.hat,hatC:v.hatC,label:v.n},v.k));
  K.forEach(q=>{if(!q.wk&&WKL[q.lab])q.wk=WKL[q.lab]});
  const C=[];const roles=Object.keys(CZR104);for(let i=0;i<16;i++){const r=roles[i%roles.length];C.push({n:HS103_CN[i%HS103_CN.length],h:0,r,rk:1,task:'',t0:0,lk:(i*7919+i*i*104729+12345)%1000000})}
  // ---- helpers ----
  const mkK=q=>{const rig=idlNpcBody(q.o),g=new THREE.Group();rig.meshes.forEach(m=>g.add(m));g.bones=rig.bones;g.userData.rest=czRest103(g);return g};
  const animal=g=>{let a=null;g.traverse(m=>{if(m.isSkinnedMesh&&m.userData&&m.userData.fk)a=m.userData.fk});return a};
  const NB=idlNB();
  const skinPts=g=>{g.updateMatrixWorld(true);const P=[];g.traverse(m=>{if(!m.isSkinnedMesh)return;m.skeleton.update();const pa=m.geometry.attributes.position,v=new V(),n=pa.count;
      const step=Math.max(1,Math.floor(n/2500));for(let i=0;i<n;i+=step){v.fromBufferAttribute(pa,i);m.boneTransform(i,v);v.applyMatrix4(m.matrixWorld);P.push(v.x,v.y,v.z)}});return P};
  const handChk=(g,tag,lab)=>{const P=skinPts(g);for(let i=0;i<P.length;i++)if(!isFinite(P[i])){fail(lab+' '+tag+': NaN vertex');return}
    let ymax=-9,ymin=9;for(let i=1;i<P.length;i+=3){ymax=Math.max(ymax,P[i]);ymin=Math.min(ymin,P[i])}
    if(ymax>2.6||ymin<-.15)fail(lab+' '+tag+': mesh out of range y '+ymin.toFixed(2)+'..'+ymax.toFixed(2));
    ['aL2','aR2','head','lh2','rh2'].forEach(bn=>{const b=g.bones[bn];if(!b){fail(lab+': bone '+bn+' missing');return}const w=b.getWorldPosition(new V());let d=9;
      for(let i=0;i<P.length;i+=3){const dx=P[i]-w.x,dy=P[i+1]-w.y,dz=P[i+2]-w.z,q=dx*dx+dy*dy+dz*dz;if(q<d)d=q}d=Math.sqrt(d);if(d>.07)fail(lab+' '+tag+': no body mesh within 7cm of '+bn+' ('+d.toFixed(3)+')')})};
  const tick=(g,ms,f)=>{for(let t=0;t<ms;t+=33){RT.T+=33;f(RT.T)}g.updateMatrixWorld(true)};
  const camO=cam.position.clone();cam.position.set(0,3,6);
  const work=(g,k)=>{const W0=WK103[k];if(!W0)return false;g._wk={k,t0:3.3,base:0,g,mote:null,rest:czRest103(g)};
    if(W0.tool&&W0.tool!='mote'){const tl=wkTool103(W0.tool);g.add(tl);if(W0.tool=='lute'){tl.position.set(.02,1.02,.22);tl.rotation.set(.15,0,-.85)}else tl.userData.hand=1;g._wk.tool=tl}
    if(W0.tool=='mote'){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.08,0),new THREE.MeshBasicMaterial({color:0xc8a0ff}));m.position.set(0,1.32,.42);g.add(m);g._wk.mote=m}return true};
  const unwork=g=>{if(g._wk){if(g._wk.tool)g.remove(g._wk.tool);if(g._wk.mote)g.remove(g._wk.mote);g._wk=null}czReset103(g)};
  // ---- render ----
  const {rd,sc,pc}=RT.mk(FW,FH,0x262a30);
  const sheet=(list,name,mk)=>{const cnv=document.createElement('canvas');cnv.width=FW*views.length;cnv.height=FH*list.length;const ctx=cnv.getContext('2d');
    list.forEach((q,row)=>{let g;try{g=mk(q)}catch(e){fail(q.lab+': build error '+e);console.error(e);return}
      const sp=animal(g);out.info.push(q.lab+' -> '+(sp||'HUMAN'));if(!sp)fail(q.lab+': human model (no animal body)');
      sc.add(g);g.position.set(0,0,0);g.rotation.y=0;IDL.on=true;tick(g,700,T=>idlNpc(g,T));try{handChk(g,'idle',q.lab)}catch(e){fail(q.lab+' chk '+e)}
      const shot=(col,dir,c0,dist,l)=>{if(nosheet)return;const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(c0).add(d);pc.lookAt(c0);rd.render(sc,pc);ctx.drawImage(rd.domElement,col*FW,row*FH);RT.lbl(ctx,l,col*FW,row*FH,FW)};
      const ctr=new V(0,.95,0);
      views.forEach((v,col)=>{const l=col?v:q.lab+' · '+(sp||'?');
        if(v=='front')shot(col,[0,.12,1],ctr,4.3,l);else if(v=='34')shot(col,[.75,.2,.75],ctr,4.3,l);else if(v=='side')shot(col,[1,.1,0],ctr,4.3,l);else if(v=='back')shot(col,[-.4,.2,-.95],ctr,4.3,l);
        else if(v=='head'){czReset103(g);g.updateMatrixWorld(true);const h=g.bones.head.getWorldPosition(new V());shot(col,[0,.05,1],h.add(new V(0,.12,.02)),.75,l);tick(g,100,T=>idlNpc(g,T))}
        else if(v=='face'){const h=g.bones.head.getWorldPosition(new V());shot(col,[.25,.08,1],h.add(new V(0,.1,.03)),1.05,l)}
        else if(v=='walk'){g.userData.rest=g.userData.rest||czRest103(g);let ph=0;for(let i=0;i<40;i++){ph+=.12;czWalkPose103(g,ph,1);try{if(typeof fk137Anim=='function')fk137Anim(g,RT.T+=33,1)}catch(e){}}g.updateMatrixWorld(true);
          try{handChk(g,'walk',q.lab)}catch(e){fail(q.lab+' chk '+e)}shot(col,[1,.15,.35],ctr,4.3,l);czReset103(g)}
        else if(v=='work'){const k=q.wk;if(k&&work(g,k)){tick(g,1900,T=>idlNpc(g,T));try{handChk(g,'work',q.lab)}catch(e){fail(q.lab+' chk '+e)}
            const tl=g._wk&&g._wk.tool;if(tl&&tl.userData.hand){const h=g.bones.aR2.getWorldPosition(new V()),t=tl.getWorldPosition(new V());if(h.distanceTo(t)>.09)fail(q.lab+' work: tool '+h.distanceTo(t).toFixed(3)+' from the hand')}
            shot(col,[.8,.25,.75],ctr,4.3,l);unwork(g)}else if(!nosheet){ctx.fillStyle='#202428';ctx.fillRect(col*FW,row*FH,FW,FH)}}});
      sc.remove(g)});
    if(!nosheet)out.sheets[name]=cnv.toDataURL('image/jpeg',.86)};
  let KK=K;if(pick)KK=K.filter(q=>pick.split(',').indexOf(q.lab)>=0);
  if(spl){const S=spl.split(',').map((sp,i)=>({lab:sp,o:{robe:[0x6a4a3a,0x3a5a6a,0x5a3a5a,0x4a5a3a][i%4],trim:0xc9a24a,hat:'',fkSp:sp,fkFur:0,label:''},wk:'smith'}));for(let i=0;i<S.length;i+=6)sheet(S.slice(i,i+6),'sp'+(i/6),mkK);only='none'}
  if(only!='cit'&&only!='none')for(let i=0;i<KK.length;i+=6)sheet(KK.slice(i,i+6),'keep'+(i/6),mkK);
  if(only!='keep'&&only!='none')for(let i=0;i<C.length;i+=8)sheet(C.slice(i,i+8).map(c=>({lab:c.n+' '+c.r,c,wk:null})),'cit'+(i/8),q=>czModel103(q.c));
  cam.position.copy(camO);
  // ---- the NPCs actually in the game ----
  const live=[];try{(npc.all||[]).forEach(g=>live.push([g.userData.npcO?g.userData.npcO.label:'npc',g]))}catch(e){}
  for(const k in TWN100_S.npc){const g=TWN100_S.npc[k];if(g)live.push(['keeper '+k,g])}
  live.forEach(([l,g])=>{const n=g.bones?g:g.children.find(c=>c.bones);if(!n){fail('live '+l+': no rig');return}if(!animal(n))fail('live '+l+': human model in the game')});
  out.info.push('live NPCs checked: '+live.length);
  return out}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    errs=[];pg.on('pageerror',lambda e: errs.append(str(e)));pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    V=os.environ.get('VIEWS','front,34,side,back,face,walk,work').split(',')
    r=ev(JS,[V,os.environ.get('ONLY',''),bool(os.environ.get('NOSHEET')),os.environ.get('PICK',''),os.environ.get('SP','')])
    for i in r['info']:print(' ',i)
    for k,v in r['sheets'].items():
        nm='v137_npcs_%s.jpg'%k;open(O+'/'+nm,'wb').write(base64.b64decode(v.split(',')[1]));print('wrote',nm)
    for f in r['fails']:print('FAIL',f)
    for e in errs[:6]:print('FAIL page error:',e[:300])
    print('==== v137_npcs: %d fails'%(len(r['fails'])+len(errs[:6])))
# like play.run, with a longer page-load timeout (a busy machine can take over two minutes to parse the page)
def run(steps):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
        pg=b.new_page(viewport={'width':900,'height':600});pg.set_default_timeout(600000)
        if not os.environ.get('TITLE'):pg.add_init_script('window.AW_NOTITLE=1')
        pg.goto('file://'+O+'/live.html',wait_until='domcontentloaded',timeout=900000);pg.wait_for_timeout(4500)
        steps(pg);b.close()
run(s)
