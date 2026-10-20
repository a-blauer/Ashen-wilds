# v100: the real game loop playing basic attacks (not a frozen loop). Virtual clock + captured rAF, real swing() calls.
#   python3 v100_live_swing.py   (SRC=<build> TAG=<name>)  -> out/v100_live_<TAG>.json + out/v100_live_<TAG>_<wt>.png
import play,json,os,base64
TAG=os.environ.get('TAG','new');WTS=os.environ.get('WT','start,gs,mace,axes,dagger').split(',')
INIT=r"""()=>{window.__vt=performance.now();window.__q=[];const P=performance.now.bind(performance);
  performance.now=()=>window.__vt;const D0=Date.now()-window.__vt;Date.now=()=>Math.floor(D0+window.__vt);
  window.requestAnimationFrame=f=>{window.__q.push(f);return window.__q.length};
  window.__step=(n,dt)=>{for(let i=0;i<n;i++){window.__vt+=dt||16;const q=window.__q;window.__q=[];q.forEach(f=>{try{f(window.__vt)}catch(e){console.error('loop',e)}})}}}"""
EQUIP=r"""(wt)=>{const idx=ITPL.findIndex(t=>t.sl=='weapon'&&t.wt==wt);if(idx<0)return null;const t=ITPL[idx];hero.cls=t.cls||hero.cls;hero.lvl=Math.max(hero.lvl,60);
  eq.weapon={id:910000,tp:idx,r:2,req:1,up:0,n:t.n};if(hero.cls=='paladin')eq.offhand=null;refreshGear(pl,hero.cls,eq);return t.n}"""
SHOTST=int(os.environ.get('SHOTST','0'))
SHOT=r"""()=>{const C=window.__cc||(window.__cc=new THREE.PerspectiveCamera(40,ren.domElement.width/ren.domElement.height,.1,200));
  const ry=pl.rotation.y+.9,p=pl.position;C.position.set(p.x+Math.sin(ry)*4.2,p.y+2.1,p.z+Math.cos(ry)*4.2);C.lookAt(p.x,p.y+1.0,p.z);
  const t=(HA.cur?'k '+HA.cur.k.toFixed(2)+(HA.cur.hit?' HIT':''):'idle');ren.render(scene,C);const c=document.createElement('canvas');c.width=ren.domElement.width/2;c.height=ren.domElement.height/2;const x=c.getContext('2d');x.drawImage(ren.domElement,0,0,c.width,c.height);x.fillStyle='#ff0';x.font='20px sans-serif';x.fillText(window.__fi+' '+(window.__fi*16)+'ms '+t,8,24);return c.toDataURL('image/png')}"""
REC=r"""()=>{const b=pl.bones,r=o=>[+o.rotation.x.toFixed(3),+o.rotation.y.toFixed(3),+o.rotation.z.toFixed(3)];
  const W=(pl.gearG||[]).find(o=>o.userData&&o.userData.wt&&o.userData.wt!='shield'&&o.parent);let tip=null;
  if(W){pl.updateMatrixWorld(true);const v=new THREE.Vector3(0,-.8,0).applyMatrix4(W.matrixWorld);pl.worldToLocal(v);tip=[+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2)]}
  return {aR0:r(b.aR0),aR1:r(b.aR1),chest:r(b.chest),spine:r(b.spine),pelvis:r(b.pelvis),lh0:r(b.lh0),tip,k:HA.cur?+HA.cur.k.toFixed(2):null}}"""
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(4000)
    ev(INIT);ev("()=>__step(5)")
    out={}
    for wt in WTS:
        nm=ev(EQUIP,wt) if wt!='start' else ev('()=>(eq.weapon&&eq.weapon.n)||"start"')
        if not nm:continue
        out[wt]={'name':nm,'steps':[]}
        ev("()=>__step(40)")
        for st in range(3):
            ev("(st)=>{combo=st;comboT=performance.now();atkCd=0;HA.buf=0;swing()}",st)
            fr=[]
            shots=[]
            for f in range(int(os.environ.get('NF','36'))):
                ev("(f)=>{window.__fi=f+1;__step(1)}",f);fr.append(ev(REC))
                if st==SHOTST and f%3==0 and f<48:
                    u=ev(SHOT);open(play.TMP+'/_f%d.png'%f,'wb').write(base64.b64decode(u.split(',')[1]));shots.append('/_f%d.png'%f)
            out[wt]['steps'].append(fr)
            if shots:
                from PIL import Image
                ims=[Image.open(play.TMP+p) for p in shots];W,H=ims[0].size;cols=6;rows=(len(ims)+cols-1)//cols;sh=Image.new('RGB',(W*cols,H*rows))
                for i,im in enumerate(ims):sh.paste(im,((i%cols)*W,(i//cols)*H))
                sh.save(play.TMP+'/v100_live_%s_%s.png'%(TAG,wt))
            ev("()=>__step(40)")
    json.dump(out,open(play.TMP+'/v100_live_%s.json'%TAG,'w'))
    print('DONE',TAG)
play.run(s)
