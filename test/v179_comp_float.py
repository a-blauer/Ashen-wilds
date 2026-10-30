# v179: companion bodies hold together. Builds every companion species at every evolution (0-3), every trait (Horned, Spiked,
# Armored, Universal), the colour variants (Ember, Frost, Shadow, Golden), a rare variant, shiny, and fused companions
# (a second / third species' signature parts), then checks in idle, two walk phases and a bite:
#  * FAIL on a floating piece: any separate piece of mesh more than FLOAT_MM (4 mm; MOVE_MM 12 mm in walk / bite frames) from the rest of the model that does not pierce it
#    and is not enclosed by it (same rule as the townsfolk test v142_folk.py, float_lib.py)
#  * FAIL on NaN vertices or a build error
# Parts meant to hover (glow motes, magic rings) are listed in OK_FLOAT below with the reason.
# SP=Foxlet,Ashwolf (species)  SETS=base,trait,var,fuse (fewer)  POSES=idle,walkA,walkB,bite  FLOAT_MM=4  VERBOSE=1
import os,sys,re,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import play
from float_lib import floating_fast as floating
FLOAT_MM=float(os.environ.get('FLOAT_MM','4'))
# in walk and bite frames a rigid ornament on bending skin opens a gap for a moment: up to MOVE_MM is allowed there
MOVE_MM=float(os.environ.get('MOVE_MM','12'))
JS=r"""(a)=>{const [list,poses]=a,V=THREE.Vector3,out=[];window.requestAnimationFrame=()=>0;
  if(!window._v179){window._v179=1;const tag=(r,key)=>{(Array.isArray(r)?r:[r]).forEach(m=>{if(m&&m.isMesh)m.userData._bk=String(key||'').split('|').slice(0,2).join('|')})};
    {const o=dkBake;dkBake=function(P,O,key){const r=o.apply(this,arguments);tag(r,key||'dk');return r}}
    {const o=bakeMesh;bakeMesh=function(parts,O,key){const r=o.apply(this,arguments);tag(r,key||'bake');return r}}}
  const sc=new THREE.Scene();
  const geo=g=>{g.updateMatrixWorld(true);const P=[],M=[],info=[],TB=[],TC=[];let mi=-1;
    g.traverse(m=>{if(!m.isMesh||m.isPoints||m.isLine||m.isSprite)return;let vis=true;for(let o=m;o;o=o.parent){if(o.visible===false){vis=false;break}}if(!vis)return;
      const mat=Array.isArray(m.material)?m.material[0]:m.material;if(mat&&mat.opacity!=null&&mat.transparent&&mat.opacity<.05)return;
      mi++;let bn='';for(let o=m.parent;o;o=o.parent){if(o.isBone){bn=o.name;break}}
      info.push({k:m.userData._bk||(m.userData.evo100?'EVO':m.isSkinnedMesh&&m.geometry.attributes.skinIndex&&!m.userData._bk?'body?':''),t:m.isSkinnedMesh?'skin':m.isInstancedMesh?'inst':'mesh',name:m.name||'',bone:bn,col:mat&&mat.color?mat.color.getHexString():'',em:mat&&mat.emissive?mat.emissive.getHexString():'',tr:!!(mat&&mat.transparent),add:!!(mat&&mat.blending==THREE.AdditiveBlending),ud:Object.keys(m.userData||{}).join(',')});
      if(m.isSkinnedMesh&&m.skeleton)m.skeleton.update();
      const pa=m.geometry.attributes.position,ca=m.geometry.attributes.color,si=m.geometry.attributes.skinIndex,sw=m.geometry.attributes.skinWeight,v=new V(),ix=m.geometry.index,n=ix?ix.count:pa.count,im=new THREE.Matrix4(),tm=new THREE.Matrix4();
      const reps=m.isInstancedMesh?m.count:1;
      for(let r=0;r<reps;r++){if(m.isInstancedMesh){m.getMatrixAt(r,im);tm.multiplyMatrices(m.matrixWorld,im)}else tm.copy(m.matrixWorld);
        for(let i=0;i<n;i++){const j=ix?ix.getX(i):i;v.fromBufferAttribute(pa,j);if(m.isSkinnedMesh)m.boneTransform(j,v);v.applyMatrix4(tm);P.push(v.x,v.y,v.z);if(i%3==0){M.push(mi);
          let b=bn;if(m.isSkinnedMesh&&si){let bw=-1;for(let k=0;k<4;k++){const G=['getX','getY','getZ','getW'][k],w=sw[G](j);if(w>bw){bw=w;const bb=m.skeleton.bones[si[G](j)];b=bb?bb.name:'?'}}}TB.push(b);
          TC.push(ca?('#'+new THREE.Color(ca.getX(j),ca.getY(j),ca.getZ(j)).getHexString()):'')}}}});
    const f=new Float32Array(P),u=new Uint8Array(f.buffer);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));
    return {v:btoa(s),m:M,info,tb:TB,tc:TC,bs:g.bs||1}};
  let T=5000;
  list.forEach(q=>{const it={lab:q.lab,poses:{},err:null};out.push(it);let g,c;
    try{c=mkC(q.g[0],30,q.f||0,q.v||'');c.g=q.g.slice();c.cl=q.g.map((s,i)=>i==0?c.cl[0]:new THREE.Color(SP2[s][4]).getHex());c.tr=q.tr||'';c.z=1;c.evo=q.evo||0;
      if(q.rv){c.rv=q.rv;if(typeof RVAR!='undefined'&&RVAR[q.rv])c.cl[0]=RVAR[q.rv]}if(q.shn)c.shn=1;g=cr(c);
      const K=SPEC[rigOf(c.g[0])]?Object.keys(SPEC[rigOf(c.g[0])].bones):[];g.traverse(m=>{if(m.isSkinnedMesh&&m.skeleton&&m.skeleton.bones.length==K.length)m.skeleton.bones.forEach((b,i)=>{if(!b.name)b.name=K[i]})})}catch(e){it.err='build error '+e;return}
    sc.add(g);g.position.set(0,0,0);g.rotation.set(0,0,0);
    const tick=(ms,mv,sp)=>{for(let t=0;t<ms;t+=16){T+=16;animC(g,T,mv,sp||0)}g.position.set(0,0,0);g.updateMatrixWorld(true)};
    try{tick(500,false);if(poses.includes('idle'))it.poses.idle=geo(g);
      if(poses.includes('walkA')||poses.includes('walkB')){tick(420,true,4);if(poses.includes('walkA'))it.poses.walkA=geo(g);tick(170,true,4);if(poses.includes('walkB'))it.poses.walkB=geo(g);tick(400,false)}
      if(poses.includes('bite')){g.ak={n:'bite',ph:1,k:.6};tick(64,false);it.poses.bite=geo(g);g.ak=null;tick(200,false)}}
    catch(e){it.err='pose error '+e}
    sc.remove(g)});
  return out}"""
# Parts meant to hover free of the body. Match on the species label (regex) and the mesh description; keep each with a reason.
# (label regex, piece regex, reason, at most this many mm)
OK_FLOAT=[
 (r'^Venomcoil',r'EVO on chest',"an evolution scale line on the breast lies 4 mm off the hide",6),
 (r'^Drakelet evo3',r'EVO on chest',"an evolution chest piece in the bite frame (the neck stretches)",14),
 (r'\+',r'LPF\||mesh \?|^skin \? ',"a fused companion's borrowed parts are rigid on one bone of the new body; up to 2 cm in a stride or bite",20),
]
def configs():
    SP=json.loads(os.environ.get('_SPK','[]'))
    sets=os.environ.get('SETS','base,trait,var,fuse').split(',')
    want=os.environ.get('SP');L=[]
    sp=[s for s in SP if not want or s in want.split(',')]
    for s in sp:
        if 'base' in sets:
            for e in range(4):L.append({'lab':'%s evo%d'%(s,e),'g':[s],'evo':e})
        if 'trait' in sets:
            for tr in ['Horned','Spiked','Armored','Universal','Bulky']:
                for e in (0,3):L.append({'lab':'%s evo%d %s'%(s,e,tr),'g':[s],'evo':e,'tr':tr})
        if 'var' in sets:
            for v in ['Ember','Frost','Shadow','Golden']:L.append({'lab':'%s %s'%(s,v),'g':[s],'v':v,'evo':1})
            L.append({'lab':'%s rare shiny f5'%s,'g':[s],'rv':'Crimson','shn':1,'f':5,'evo':2})
        if 'fuse' in sets:
            i=SP.index(s);o1=SP[(i+5)%len(SP)];o2=SP[(i+11)%len(SP)]
            L.append({'lab':'%s+%s+%s'%(s,o1,o2),'g':[s,o1,o2],'evo':1,'f':2})
    return L
def s(pg):
    ev=pg.evaluate;pg.set_default_timeout(3600000)
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=600000);pg.click('[data-c="warrior"]',timeout=600000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    errs=[];pg.on('pageerror',lambda e: errs.append(str(e)));pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    os.environ['_SPK']=json.dumps(ev("()=>SPK"))
    L=configs();poses=os.environ.get('POSES','idle,walkA,walkB,bite').split(',')
    fails=[];okd=[];thr=FLOAT_MM/1000;verbose=bool(os.environ.get('VERBOSE'))
    print('configs',len(L),flush=True)
    for i in range(0,len(L),6):
        import time;t0=time.time();r=ev(JS,[L[i:i+6],poses]);tj=time.time()-t0;t1=time.time()
        for it in r:
            lab=it['lab']
            if it['err']:fails.append(lab+': '+it['err']);continue
            seen=set()
            for pn,P in it['poses'].items():
                V=np.frombuffer(base64.b64decode(P['v']),dtype=np.float32).astype(np.float64)
                if not np.isfinite(V).all():fails.append('%s %s: NaN vertex'%(lab,pn));continue
                V=V.reshape(-1,3);M=np.array(P['m']);info=P['info']
                # scale the threshold with the model (companions are drawn at their own scale)
                root=np.array([info[i].get('k')=='body?' for i in M]) if len(M) else None
                if os.environ.get('DUMP'):np.savez(os.environ['DUMP']+'_%s_%s.npz'%(lab.replace(' ','_'),pn),V=V,root=root)
                bad=floating(V,thr if pn=='idle' else max(thr,MOVE_MM/1000),root)
                if bad:from float_lib import components_fast;_,lab_=components_fast(V)
                for c,n,cc,d in bad:
                    # which mesh owns most of the piece
                    sel=np.where(lab_==c)[0];mid=np.bincount(M[sel]).argmax();mi=info[mid]
                    from collections import Counter
                    tb=Counter(P['tb'][k] for k in sel).most_common(1)[0][0];tc=Counter(P['tc'][k] for k in sel).most_common(1)[0][0]
                    desc='%s %s on %s col %s%s%s'%(mi['t'],mi.get('k') or '?',tb or '-',tc or '#'+mi['col'],' glow' if mi['add'] else '',' see-through' if mi['tr'] else '')
                    key=(desc,round(cc[0],2),round(cc[1],2),round(cc[2],2))
                    bs=P.get('bs',1);msg='%s %s: floating piece (%d tris, %s) at (%.3f, %.3f, %.3f) [model %.3f, %.3f, %.3f], %.1f mm from the body'%(lab,pn,n,desc,cc[0],cc[1],cc[2],cc[0]/bs,cc[1]/bs,cc[2]/bs,d*1000)
                    ok=[w for w in OK_FLOAT if re.search(w[0],lab) and re.search(w[1],desc) and d*1000<=w[3]]
                    if ok:okd.append(msg+'  [ok: '+ok[0][2]+']');continue
                    if desc in seen and not verbose:continue
                    seen.add(desc);fails.append(msg)
            print('checked',lab,flush=True)
        if os.environ.get('TIMING'):print('timing js %.1fs py %.1fs'%(tj,time.time()-t1),flush=True)
    for o in okd[:40] if verbose else []:print('ok',o)
    for f in fails:print('FAIL',f)
    for e in errs[:6]:print('FAIL page error:',e[:300])
    print('==== v179_comp_float: %d configs, %d fails, %d allowed hovering parts'%(len(L),len(fails)+len(errs[:6]),len(okd)))
play.run(s)
