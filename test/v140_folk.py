# v140: townsfolk anatomy. Builds every species (plain outfit) and every keeper, then
#  * checks (FAIL lines): build errors, floating parts (any separate piece of mesh more than FLOAT_MM from the rest of the
#    model) in the rest pose, idle, two walk phases and the keeper's work pose; feet on the ground (lowest foot vertex in the
#    idle pose between -1 and +2.5 cm; nothing below -2 cm); the animal body (not the human fallback)
#  * sheets: out/v140_folk_<set><n>.jpg — full body front / side, head 3/4 / side close-ups
# SP=fox,bear (species only)  KEEP=0 (no keepers)  NOSHEET=1 (checks only)  POSES=rest,idle,walk (fewer)  V137=1 (old models)
import os,sys,re,base64,json,io
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import play
from scipy.spatial import cKDTree
O=play.TMP
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
ALL='fox,wolf,hound,lynx,bear,raccoon,otter,beaver,mole,hedgehog,ferret,bat,mouse,squirrel,hare,stag,doe,goat,ram,sheep,boar,owl'
FLOAT_MM=float(os.environ.get('FLOAT_MM','4'))
JS=COMMON+r"""(a)=>{const [list,poses,nosheet,old]=a,V=THREE.Vector3,FW=300,FH=300,out={items:[],fails:[]};
  if(old)FK140.on=false;
  const mk=o=>{const rig=idlNpcBody(o),g=new THREE.Group();rig.meshes.forEach(m=>g.add(m));g.bones=rig.bones;g.userData.rest=czRest103(g);g.userData.npcO=o;return g};
  const animal=g=>{let a=null;g.traverse(m=>{if(m.isSkinnedMesh&&m.userData&&m.userData.fk)a=m.userData.fk});return a};
  const geo=g=>{g.updateMatrixWorld(true);const P=[];g.traverse(m=>{if(!m.isSkinnedMesh)return;m.skeleton.update();const pa=m.geometry.attributes.position,v=new V(),ix=m.geometry.index;
      const n=ix?ix.count:pa.count;for(let i=0;i<n;i++){const j=ix?ix.getX(i):i;v.fromBufferAttribute(pa,j);m.boneTransform(j,v);v.applyMatrix4(m.matrixWorld);P.push(v.x,v.y,v.z)}});
    const f=new Float32Array(P),u=new Uint8Array(f.buffer);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
  const tick=(g,ms,f)=>{for(let t=0;t<ms;t+=33){RT.T+=33;f(RT.T)}g.updateMatrixWorld(true)};
  const work=(g,k)=>{const W0=WK103[k];if(!W0)return false;g._wk={k,t0:3.3,base:0,g,mote:null,rest:czRest103(g)};
    if(W0.tool&&W0.tool!='mote'){const tl=wkTool103(W0.tool);g.add(tl);if(W0.tool=='lute'){tl.position.set(.02,1.02,.22);tl.rotation.set(.15,0,-.85)}else tl.userData.hand=1;g._wk.tool=tl}return true};
  const unwork=g=>{if(g._wk){if(g._wk.tool)g.remove(g._wk.tool);g._wk=null}czReset103(g)};
  const {rd,sc,pc}=RT.mk(FW,FH,0x262a30);
  const camO=cam.position.clone();cam.position.set(0,3,6);
  list.forEach(q=>{const it={lab:q.lab,poses:{},shots:[],err:null,sp:null};out.items.push(it);let g;
    try{g=mk(q.o)}catch(e){it.err='build error '+e;return}
    it.sp=animal(g);const D=it.sp&&FK137.sp[it.sp],A=D&&typeof fk140A=='function'?fk140A(D):null;it.hs=A?A.hs||1:1;
    sc.add(g);g.position.set(0,0,0);g.rotation.y=0;
    try{if(poses.includes('rest')){czReset103(g);it.poses.rest=geo(g)}
      IDL.on=true;tick(g,700,T=>idlNpc(g,T));if(poses.includes('idle'))it.poses.idle=geo(g);
      if(!nosheet){const shot=(dir,c0,dist,l)=>{const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(c0).add(d);pc.lookAt(c0);rd.render(sc,pc);it.shots.push([l,rd.domElement.toDataURL('image/jpeg',.88)])};
        const ctr=new V(0,.98,0);shot([0,.12,1],ctr,3.9,'front');shot([1,.1,0],ctr,3.9,'side');
        const k=g.bones.pelvis.scale.x;let hc,sz;if(D&&D._xf140){const S=D.SN,zA=S[0][0],zT=S[S.length-1][0];hc=new V(0,D.hp.yc||1.158,(zA+zT)/2).applyMatrix4(D._xf140).multiplyScalar(k);sz=(zT-zA)*it.hs*k}
        else{hc=g.bones.head.getWorldPosition(new V()).add(new V(0,.13*k,.03*k));sz=.26*k}
        shot([.6,.12,1],hc,sz*2.9,'head 3/4');shot([1,.06,.02],hc,sz*2.9,'head side')}
      if(poses.includes('walk')){g.userData.rest=g.userData.rest||czRest103(g);[[1.2,'walkA'],[4.3,'walkB']].forEach(([ph,nm])=>{czWalkPose103(g,ph,1);g.updateMatrixWorld(true);it.poses[nm]=geo(g)});czReset103(g)}
      if(poses.includes('work')&&q.wk&&work(g,q.wk)){tick(g,1900,T=>idlNpc(g,T));const tl=g._wk.tool;if(tl)g.remove(tl);it.poses.work=geo(g);unwork(g)}}
    catch(e){it.err='pose error '+e}
    sc.remove(g)});
  cam.position.copy(camO);return out}"""
def keepers_js():
    return r"""()=>{const K=[];const seen={};const addK=(o,wk)=>{if(!o||seen[o.label])return;seen[o.label]=1;K.push({lab:o.label,o:Object.assign({},o),wk})};
  try{(npc.all||[]).forEach(g=>{const o=g.userData&&g.userData.npcO;if(o)addK(o,null)})}catch(e){}
  addK({robe:0x2a4a7a,trim:0xc9a24a,hat:'cap',hatC:0x6a2a2a,label:'Merchant'},null);addK({robe:0x5a3aa0,trim:0xd8b44a,hat:'wiz',hatC:0x2e2078,label:'Magic Vendor'},'magic');
  addK({robe:0x6a3a2a,trim:0x2a1a12,hat:'chef',apron:1,label:'Innkeeper'},null);addK({robe:0x2a3550,trim:0xd8b44a,hat:'cap',hatC:0x1a2236,label:'Stronghold Steward'},null);
  const WKL={Blacksmith:'smith',Alchemist:'alch',Cook:'cook','Stable Master':'stable','Wandering Merchant':'merchant','Beast Trainer':'trainer','Traveling Bard':'bard','Rune Sage':'sage','Magic Vendor':'magic'};
  for(const k in TWN100_NPCO)addK(TWN100_NPCO[k],k);VIS.forEach(v=>addK({robe:v.robe,trim:0xd8b44a,hat:v.hat,hatC:v.hatC,label:v.n},v.k));
  K.forEach(q=>{if(!q.wk&&WKL[q.lab])q.wk=WKL[q.lab]});
  const C=[];const roles=Object.keys(CZR104);for(let i=0;i<6;i++){const r=roles[i%roles.length];const c={n:HS103_CN[i%HS103_CN.length],h:0,r,rk:1,task:'',t0:0,lk:(i*7919+i*i*104729+12345)%1000000};C.push({lab:'cit '+c.n+' '+r,o:czLook103(c),wk:null})}
  return K.concat(C)}"""
# ---------------- geometry checks ----------------
def pt_tri_dist(P,A,B,C):
    # distance from points P (n,3) to triangles (n,3) A,B,C (Ericson, closest point on triangle)
    ab=B-A;ac=C-A;ap=P-A
    d1=(ab*ap).sum(1);d2=(ac*ap).sum(1)
    bp=P-B;d3=(ab*bp).sum(1);d4=(ac*bp).sum(1)
    cp=P-C;d5=(ab*cp).sum(1);d6=(ac*cp).sum(1)
    va=d3*d6-d5*d4;vb=d5*d2-d1*d6;vc=d1*d4-d3*d2
    den=va+vb+vc;den=np.where(np.abs(den)<1e-20,1e-20,den)
    v=vb/den;w=vc/den
    Q=A+ab*v[:,None]+ac*w[:,None]
    # regions
    def setq(mask,val):
        nonlocal Q
        Q=np.where(mask[:,None],val,Q)
    m=(d1<=0)&(d2<=0);setq(m,A)
    m2=(d3>=0)&(d4<=d3);setq(m2&~m,B)
    m3=(d6>=0)&(d5<=d6);setq(m3&~m&~m2,C)
    vc_=(d1*d4-d3*d2);mab=(vc_<=0)&(d1>=0)&(d3<=0)&~m&~m2&~m3
    t=np.where(mab,d1/np.where(np.abs(d1-d3)<1e-20,1e-20,d1-d3),0);setq(mab,A+ab*t[:,None])
    vb_=(d5*d2-d1*d6);mac=(vb_<=0)&(d2>=0)&(d6<=0)&~m&~m2&~m3&~mab
    t=np.where(mac,d2/np.where(np.abs(d2-d6)<1e-20,1e-20,d2-d6),0);setq(mac,A+ac*t[:,None])
    va_=(d3*d6-d5*d4);mbc=(va_<=0)&((d4-d3)>=0)&((d5-d6)>=0)&~m&~m2&~m3&~mab&~mac
    den2=(d4-d3)+(d5-d6);t=np.where(mbc,(d4-d3)/np.where(np.abs(den2)<1e-20,1e-20,den2),0);setq(mbc,B+(C-B)*t[:,None])
    return np.linalg.norm(P-Q,axis=1)
def components(V):
    T=V.reshape(-1,3,3);nt=len(T)
    key=np.round(V/2e-5).astype(np.int64);_,vid=np.unique(key,axis=0,return_inverse=True);vid=vid.reshape(-1,3)
    par=np.arange(vid.max()+1)
    def find(x):
        r=x
        while par[r]!=r:r=par[r]
        while par[x]!=r:par[x],x=r,par[x]
        return r
    for a,b,c in vid:
        ra,rb,rc=find(a),find(b),find(c)
        if ra!=rb:par[rb]=ra
        rc=find(c);ra=find(a)
        if ra!=rc:par[rc]=ra
    lab=np.array([find(a) for a in vid[:,0]]);_,lab=np.unique(lab,return_inverse=True);return T,lab
def piece_dist(Q,T,tree,mask,rmax,thr):
    cc=Q.mean(0);cr=np.linalg.norm(Q-cc,axis=1).max()
    idx=np.array(tree.query_ball_point(cc,cr+rmax+thr),dtype=np.int64)
    if len(idx):idx=idx[mask[idx]]
    if len(idx)==0:return 9.9
    A,B,C=T[idx,0],T[idx,1],T[idx,2];m=len(idx);step=max(1,400000//m);best=9.9
    for j in range(0,len(Q),step):
        q=Q[j:j+step];k=len(q)
        d=pt_tri_dist(np.repeat(q,m,0),np.tile(A,(k,1)),np.tile(B,(k,1)),np.tile(C,(k,1))).min()
        best=min(best,d)
        if best<=thr:break
    return best
def floating(V,thr):
    # grow the attached set from the biggest piece: a piece is attached when it comes within thr of something attached
    T,lab=components(V);n=lab.max()+1
    if n<=1:return []
    cen=T.mean(1);rad=np.linalg.norm(T-cen[:,None,:],axis=2).max(1);tree=cKDTree(cen);rmax=rad.max()
    sizes=np.bincount(lab);big=int(sizes.argmax());att=(lab==big)
    Qs={}
    for c in range(n):
        if c==big:continue
        tc=T[lab==c];Q=np.concatenate([tc.reshape(-1,3),((tc+np.roll(tc,1,axis=1))/2).reshape(-1,3),tc.mean(1)]);Qs[c]=np.unique(np.round(Q,5),axis=0)
    pend=set(Qs);last={}
    while True:
        ch=False
        for c in sorted(pend):
            d=piece_dist(Qs[c],T,tree,att,rmax,thr);last[c]=d
            if d>thr and crosses(T[lab==c],T,tree,att,rmax):d=0;last[c]=0
            if d<=thr:att|=(lab==c);pend.discard(c);ch=True
        if not ch:break
    # a piece wholly inside the attached body (hidden, e.g. a pocket under a coat) is not floating: rays from its centre
    # in all six directions hit attached surface
    out=[]
    At=T[att];D=[np.array(v,float) for v in ([1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1])]
    for c in sorted(pend):
        o=Qs[c].mean(0)
        if all(ray_hits(o,d,At) for d in D):continue
        out.append((c,sizes[c],o,last[c]))
    return out
def crosses(tc,T,tree,mask,rmax):
    # a piece whose own edges pass through attached surface is attached (a whisker rooted inside the muzzle: its root is
    # deeper than the threshold, but the whisker crosses the skin)
    E=np.concatenate([tc[:,[0,1]],tc[:,[1,2]],tc[:,[2,0]]]);cc=tc.reshape(-1,3).mean(0);cr=np.linalg.norm(tc.reshape(-1,3)-cc,axis=1).max()
    idx=np.array(tree.query_ball_point(cc,cr+rmax),dtype=np.int64)
    if len(idx):idx=idx[mask[idx]]
    if len(idx)==0:return False
    At=T[idx]
    for a,b in E:
        d=b-a;L=np.linalg.norm(d)
        if L<1e-9:continue
        if ray_hits(a,d/L,At,L):return True
    return False
def ray_hits(o,d,T,maxd=.6):
    e1=T[:,1]-T[:,0];e2=T[:,2]-T[:,0];h=np.cross(d,e2);a=(e1*h).sum(1);ok=np.abs(a)>1e-12;f=np.where(ok,1/np.where(ok,a,1),0)
    s_=o-T[:,0];u=f*(s_*h).sum(1);q=np.cross(s_,e1);v=f*(q@d);t=f*(e2*q).sum(1)
    return bool((ok&(u>=0)&(v>=0)&(u+v<=1)&(t>1e-6)&(t<maxd)).any())
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(3600000)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    errs=[];pg.on('pageerror',lambda e: errs.append(str(e)));pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    sp=os.environ.get('SP',ALL).split(',') if os.environ.get('SP','x')!='' else []
    L=[{'lab':k,'o':{'robe':[0x6a4a3a,0x3a5a6a,0x5a3a5a,0x4a5a3a][i%4],'trim':0xc9a24a,'hat':'','fkSp':k,'fkFur':0,'label':''},'wk':'smith'} for i,k in enumerate(sp)]
    sets=[('sp',L)]
    if os.environ.get('KEEP','1')!='0':sets.append(('keep',ev(keepers_js())))
    poses=os.environ.get('POSES','rest,idle,walk,work').split(',');nos=bool(os.environ.get('NOSHEET'))
    fails=[];thr=FLOAT_MM/1000
    from PIL import Image,ImageDraw
    for name,lst in sets:
        cells=[]
        for i in range(0,len(lst),4):
            r=ev(JS,[lst[i:i+4],poses,nos,bool(os.environ.get('V137'))])
            for it in r['items']:
                lab=it['lab']
                if it['err']:fails.append(lab+': '+it['err']);continue
                if not it['sp']:fails.append(lab+': human model (no animal body)')
                foot=None
                for pn,b64 in it['poses'].items():
                    V=np.frombuffer(base64.b64decode(b64),dtype=np.float32).astype(np.float64)
                    if not np.isfinite(V).all():fails.append('%s %s: NaN vertex'%(lab,pn));continue
                    V=V.reshape(-1,3)
                    if pn=='idle':
                        lo=V[:,1].min()
                        if lo<-.01 or lo>.025:fails.append('%s idle: lowest point %.3f m (feet should touch the ground)'%(lab,lo))
                    bad=floating(V,thr)
                    for c,n,cc,d in bad:fails.append('%s %s: floating piece (%d tris) at (%.3f, %.3f, %.3f), %.1f mm from the body'%(lab,pn,n,cc[0],cc[1],cc[2],d*1000))
                print('checked',lab,it['sp'],flush=True)
                if not nos:cells.append((lab,it['shots']))
        if not nos and cells:
            for si in range(0,len(cells),6):
                ch=cells[si:si+6];W=300;sh=Image.new('RGB',(W*4,W*len(ch)),(38,42,48));d=ImageDraw.Draw(sh)
                for ri,(lab,shots) in enumerate(ch):
                    for ci,(l,u) in enumerate(shots):
                        im=Image.open(io.BytesIO(base64.b64decode(u.split(',')[1])));sh.paste(im,(ci*W,ri*W));d.rectangle([ci*W,ri*W,ci*W+len(lab+' · '+l)*7+8,ri*W+16],fill=(0,0,0));d.text((ci*W+4,ri*W+2),(lab+' · '+l) if ci==0 else l,fill=(255,255,255))
                nm='%s/v140_folk_%s%d.jpg'%(O,name,si//6);sh.save(nm,quality=86);print('wrote',nm,flush=True)
    for f in fails:print('FAIL',f)
    for e in errs[:6]:print('FAIL page error:',e[:300])
    print('==== v140_folk: %d fails'%(len(fails)+len(errs[:6])))
play.run(s)
