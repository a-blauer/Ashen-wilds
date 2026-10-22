# v128: the warrior's Whirlwind pose — the weapon is held out level while spinning (it pointed up before).
#   out/v128_whirl.jpg: per warrior weapon type a row of frames during the channel (side, front, top views)
#   checks: for each weapon type the weapon's tip sits away from the body and roughly level (not pointing up)
import os,sys,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__))
LIB=open(HERE+'/v90_abil_lib.js').read()
res=[]
def chk(n,ok,info=''):
    res.append(ok);print(('PASS ' if ok else 'FAIL ')+n,'' if ok else info)
JS=r"""async(wts)=>{const V=THREE.Vector3,FW=220,FH=220,views=[[2.6,1.1,0],[0,1.1,2.6],[0.01,3.4,0]];
  const cnv=document.createElement('canvas');cnv.width=FW*views.length*2;cnv.height=FH*wts.length;const x=cnv.getContext('2d');
  const cam=new THREE.PerspectiveCamera(40,1,.05,60),out={};const sz=ren.getSize(new THREE.Vector2());
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  for(let wi=0;wi<wts.length;wi++){const wt=wts[wi];
    const tp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&fitsCls(t,'warrior')&&itT({tp:i,lv:30,r:2,up:0,aff:[]}).wt==wt);
    if(tp<0){out[wt]={err:'no item'};continue}
    eq.weapon={id:uid++,tp,lv:30,req:1,r:2,up:0,aff:[]};refreshGear();hero.chan=null;hero.cd={};hero.mp=9999;hero.tal.__ld='Whirlwind';KQS.cdn={};hsDirty();await wait(600);
    const sk=heroSkills()[0];if(!sk||sk.n!='Whirlwind'){out[wt]={err:'not equipped '+(sk&&sk.n)};continue}
    cast(0);const S=[];
    for(let f=0;f<2;f++){await wait(f?700:900);if(!hero.chan)break;
      pl.updateMatrixWorld(true);const W=(pl.gearG||[]).find(o=>o.userData&&o.userData.wt)||null;
      const P=pl.position,c=new V(P.x,P.y+.85,P.z);
      // weapon tip: the mesh point farthest from the hand along the model's -y (blade/head axis)
      if(W){const hand=pl.bones.aR2.getWorldPosition(new V());
        const tip=W.localToWorld(new V(0,-1.2,0)),dir=tip.clone().sub(W.getWorldPosition(new V())).normalize();
        S.push({up:+dir.y.toFixed(2),handR:+Math.hypot(hand.x-P.x,hand.z-P.z).toFixed(2),handY:+(hand.y-P.y).toFixed(2)})}
      views.forEach((v,vi)=>{cam.position.set(c.x+v[0],c.y+v[1]-.85+.9,c.z+v[2]);cam.lookAt(c);POST.render=()=>{};
        ren.setSize(FW,FH,false);ren.render(scene,cam);x.drawImage(ren.domElement,(f*views.length+vi)*FW,wi*FH);ren.setSize(sz.x,sz.y,false)});
      x.fillStyle='#fff';x.font='12px sans-serif';x.fillText(wt+' t'+f,f*views.length*FW+4,wi*FH+14)}
    out[wt]={S};await wait(2200)}
  return {img:cnv.toDataURL('image/jpeg',.85),out}}"""
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=120000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("()=>{requestAnimationFrame=f=>setTimeout(()=>f(performance.now()),16);const q=PMAP[0];toPos(q.path[40][0],q.path[40][1])}");pg.wait_for_timeout(2500)
    ev("(L)=>{eval(L);V90.home=[pl.position.x,pl.position.z];V90.setup('warrior',30,{rank:1});refreshGear()}",LIB)
    wts=os.environ.get('WT','gs,ga,axes,halberd').split(',')
    r=ev(JS,wts)
    open(play.TMP+'/v128_whirl.jpg','wb').write(base64.b64decode(r['img'].split(',')[1]))
    print(json.dumps(r['out']))
    for wt,o in r['out'].items():
        if 'err' in o: print('skip',wt,o['err']);continue
        S=o['S'];chk(wt+': channel frames',len(S)>=1,o)
        for i,f in enumerate(S):
            chk(wt+' t%d: weapon held out level (|up|<.45)'%i,abs(f['up'])<.45,f)
            chk(wt+' t%d: hand away from the body (>.42)'%i,f['handR']>.42,f)
    print('RESULT',sum(res),'/',len(res))
play.run(s,w=900,hh=600)
