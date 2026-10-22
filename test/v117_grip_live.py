# v117: the frog Mage's real attacks and a cast, snapshots at fixed moments (out/v117_grip_live_<wt>.jpg): paw round the weapon?
import os,sys,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
WTS=os.environ.get('WT','staff,wand,orb').split(',')
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="mage"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    for wt in WTS:
        r=ev("""(wt)=>new Promise(res=>{POST.render=()=>{};const tp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls=='mage'&&itT({tp:i,lv:1,r:1,up:0,aff:[]}).wt==wt);eq.weapon={id:9e4,tp,lv:1,req:1,r:2,up:0,aff:[]};refreshGear();
          const FW=260,FH=260,rd=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(FW,FH);const c=new THREE.PerspectiveCamera(24,1,.05,60);
          const K=[.15,.35,.5,.65,.85],cv=document.createElement('canvas');cv.width=FW*K.length*2;cv.height=FH*2;const x=cv.getContext('2d');let row=0,done={};
          const snap=(col)=>{const P=pl.position,f=new THREE.Vector3(Math.sin(pl.rotation.y),0,Math.cos(pl.rotation.y)),sd=new THREE.Vector3(f.z,0,-f.x),hp=pl.bones.aR2.getWorldPosition(new THREE.Vector3());
            [[sd.clone().multiplyScalar(2.2).add(f.clone().multiplyScalar(.8)),0],[sd.clone().multiplyScalar(-.5).add(f.clone().multiplyScalar(2.2)),1]].forEach(([o,j])=>{c.position.set(P.x+o.x,P.y+1.2,P.z+o.z);c.lookAt(P.x,P.y+.75,P.z);rd.render(scene,c);x.drawImage(rd.domElement,(col*2+j)*FW,row*FH)});
            x.fillStyle='#000a';x.fillRect(col*2*FW,row*FH,FW,16);x.fillStyle='#fff';x.font='11px sans-serif';x.fillText((row?'cast':'attack')+' k='+K[col],col*2*FW+4,row*FH+12)};
          const f=animHero;animHero=function(now,mv,h){const r=f.apply(this,arguments);if((!h||h===pl)&&HA.cur){const k=HA.cur.k||0;K.forEach((kk,i)=>{if(k>=kk&&!done[row+':'+i]){done[row+':'+i]=1;pl.updateMatrixWorld(true);snap(i)}})}return r};
          atkCd=0;swing();setTimeout(()=>{row=1;hero.cd={};hero.mp=999;cast(0);setTimeout(()=>{animHero=f;res(cv.toDataURL('image/jpeg',.88))},5000)},4000)})""",wt)
        open(play.TMP+'/v117_grip_live_%s.jpg'%wt,'wb').write(base64.b64decode(r.split(',')[1]));print('wrote',wt)
play.run(s)
