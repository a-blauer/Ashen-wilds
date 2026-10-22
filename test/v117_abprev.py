# v116 ability preview: for each class, a few abilities of different kinds; each frame stepped by hand to just after the hit.
# out/v117_abprev_<cls>.jpg (one tile per ability), out/v117_abwin.png (the Abilities window)
import os,sys,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
FAIL=[]
CL=os.environ.get('CLS','mage,warrior,ranger').split(',')
def s(pg):
    ev=pg.evaluate
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="%s"]'%CL[0],timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev("()=>{hero.lvl=50;openAbil();return {open:!$('xw').classList.contains('hide')&&xwMode=='abil',pv:!!$('abPV'),canvas:!!document.querySelector('#abPV canvas')}}")
    print(r);ok=r['open'] and r['pv'] and r['canvas'];print(('ok   ' if ok else 'FAIL ')+'preview in the Abilities window')
    if not ok:FAIL.append('panel')
    pg.wait_for_timeout(1500);pg.screenshot(path=play.TMP+'/v117_abwin.png',timeout=600000)
    for c in CL:
        r=ev("""(c)=>{hero.cls=c;eq={};const W=ITPL.findIndex(t=>t.sl=='weapon'&&t.cls==c&&t.t==0),Ch=ITPL.findIndex(t=>t.sl=='chest'&&t.arm==CLS[c].arm&&t.t==0);eq.weapon={id:1,tp:W,lv:1,req:1,r:0,up:0,aff:[]};eq.chest={id:2,tp:Ch,lv:1,req:1,r:0,up:0,aff:[]};
          if(c=='paladin')eq.offhand={id:3,tp:ITPL.findIndex(t=>t.sl=='offhand'&&t.t==0),lv:1,req:1,r:0,up:0,aff:[]};
          const all=kqsAll(c),seen={},L=[];all.forEach(s=>{const k=abKind116(s);if(!seen[k]){seen[k]=1;L.push(s)}});PV.run=false;
          const FW=300,FH=200,cv=document.createElement('canvas');cv.width=FW*4;cv.height=FH*Math.ceil(L.length/4);const x=cv.getContext('2d');const host=document.createElement('div');host.style.cssText='position:fixed;left:0;top:0;width:300px;height:200px';document.body.appendChild(host);
          const info=[];L.forEach((s,i)=>{abShow116(host,s);PV.run=false;const pT=kqsPoseT(s.pose||ABP116_POSE[s.k]||'cast')||kqsPoseT('cast'),ms=Math.max(260,(pT&&pT[1])||380)*1.7/1000;
            const k=abKind116(s),tEnd=.3+ms*.5+(k=='leap'?.6:k=='charge'?.33:k=='proj'?.35:k=='summon'?1.0:.18);let T=ABP116.t0;for(let t=0;t<=tEnd;t+=1/30){T=ABP116.t0+t*1000;PV.upd(T,1/30)}
            PV.r.setSize(FW,FH,false);PV.cam.aspect=FW/FH;PV.cam.updateProjectionMatrix();PV.r.render(PV.sc,PV.cam);x.drawImage(PV.cv,(i%4)*FW,Math.floor(i/4)*FH);
            x.fillStyle='rgba(0,0,0,.6)';x.fillRect((i%4)*FW,Math.floor(i/4)*FH,FW,16);x.fillStyle='#fff';x.font='11px sans-serif';x.fillText(s.n+' · '+k,(i%4)*FW+4,Math.floor(i/4)*FH+12);info.push(s.n+':'+k)});
          host.remove();return {img:cv.toDataURL('image/jpeg',.88),info}}""",c)
        print(c,r['info'])
        open(play.TMP+'/v117_abprev_%s.jpg'%c,'wb').write(base64.b64decode(r['img'].split(',')[1]))
play.run(s,w=1100,hh=760)
print('FAILURES:',FAIL if FAIL else 'none')
