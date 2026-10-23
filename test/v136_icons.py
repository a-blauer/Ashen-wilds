# v136 item pictures: every helm / chest / boots style of an armour type rendered as its inventory icon -> out/v136_icons_<arm>.jpg
#   ARM=cloth,light (default all four)   prints FAIL when an icon can't be made or comes out empty
import os,sys,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP;FAIL=[]
JS=r"""(arm)=>{const it=(tp,r)=>({id:-1,tp,lv:1,req:1,r,up:0,aff:[]}),list=[],seen={};
  ITPL.forEach((t,i)=>{if(!['helm','chest','boots'].includes(t.sl)||t.arm!=arm)return;const d=mdGD(it(i,2));if(!d||seen[t.sl+d.st])return;seen[t.sl+d.st]=1;list.push(i)});
  if(!v89Init||!v89Init())return {err:'no icon renderer'};const S=112,cols=8,cv=document.createElement('canvas');cv.width=S*cols;cv.height=S*Math.ceil(list.length/cols);const c=cv.getContext('2d'),bad=[];
  list.forEach((tp,n)=>{let ic=null;try{ic=v89Render(it(tp,n%5))}catch(e){bad.push(ITPL[tp].n+': '+e)}if(!ic){bad.push(ITPL[tp].n+': none');return}
    // an empty picture is all background: look at the centre pixels' spread
    const d=ic.getContext('2d').getImageData(28,28,56,56).data;let mn=255,mx=0;for(let i=0;i<d.length;i+=4){const v=d[i]+d[i+1]+d[i+2];mn=Math.min(mn,v);mx=Math.max(mx,v)}if(mx-mn<60)bad.push(ITPL[tp].n+': empty');
    c.drawImage(ic,(n%cols)*S,Math.floor(n/cols)*S)});
  return {img:cv.toDataURL('image/jpeg',.9),n:list.length,bad}}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    for arm in os.environ.get('ARM','heavy,medium,light,cloth').split(','):
        r=ev(JS,arm)
        if r.get('err'):FAIL.append(arm+' '+r['err']);print('FAIL',arm,r['err']);continue
        print(arm,r['n'],'icons',('FAIL '+str(r['bad'])) if r['bad'] else 'ok');FAIL.extend(r['bad'])
        open(O+'/v136_icons_%s.jpg'%arm,'wb').write(base64.b64decode(r['img'].split(',')[1]))
play.run(s,w=900,hh=600)
print('FAILURES:',FAIL if FAIL else 'none')
