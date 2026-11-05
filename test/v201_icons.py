# v201 painted icon art: every v88 icon name has a painting (KQA), every emoji tint variant paints a non-empty picture that
# stays inside its square, text emoji become painted spans in the DOM (class kqa + a PNG background), canvas text draws them,
# and the windows that show items / spells / eggs use them. Pictures: out/v201_sheet.png, out/v201_mat.png, out/v201_abil.png,
# out/v201_eggs.png.   Prints FAIL lines on a wrong result.
import os,sys,base64,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP;FAIL=[]
CHECK=r"""()=>{const out={bad:[],n:0};
  const names=Object.keys(KQI),miss=names.filter(n=>!KQA[n]);if(miss.length)out.bad.push('no painting: '+miss.join(' '));
  const combos={};names.forEach(n=>combos[n+'|'+KQI[n][0]]=1);Object.values(KQE).forEach(v=>{if(v)combos[v[0]+'|'+(v[1]||KQI[v[0]][0])]=1});
  const t0=performance.now();
  for(const k of Object.keys(combos)){const [n,t]=k.split('|');if(!KQA[n])continue;out.n++;
    let c;try{c=kqArtBmp(n,t,48)}catch(e){out.bad.push(k+' throws '+e);continue}
    const d=c.getContext('2d').getImageData(0,0,48,48).data;let on=0,edge=0,ne=0;
    for(let y=0;y<48;y++)for(let x=0;x<48;x++){const a=d[(y*48+x)*4+3];if(a>60)on++;if(x==0||y==0||x==47||y==47){ne++;if(a>60)edge++}}
    if(on<48*48*.08)out.bad.push(k+' nearly empty ('+on+' px)');if(edge>ne*.25)out.bad.push(k+' runs off its square ('+edge+'/'+ne+' edge px)')}
  out.ms=Math.round(performance.now()-t0);
  // DOM: emoji in text become painted spans
  const dv=document.createElement('div');dv.id='v201t';dv.style.cssText='position:fixed;left:0;top:0;font-size:20px;z-index:99';document.body.appendChild(dv);
  dv.innerHTML='Egg 🥚 fire 🔥 gold 🪙 skull 💀';const sp=[...dv.querySelectorAll('.kqi')];
  out.spans=sp.length;if(sp.length!=4)out.bad.push('expected 4 icon spans, got '+sp.length);
  sp.forEach(s=>{if(!s.classList.contains('kqa'))out.bad.push('span not painted: '+s.className);
    const bg=getComputedStyle(s,'::after').backgroundImage;if(!/data:image\/png/.test(bg))out.bad.push('span has no picture: '+s.className+' '+bg.slice(0,40))});
  if(dv.textContent!='Egg 🥚 fire 🔥 gold 🪙 skull 💀')out.bad.push('textContent changed: '+dv.textContent);
  dv.remove();
  // canvas text
  const cv=document.createElement('canvas');cv.width=cv.height=40;const g=cv.getContext('2d');g.font='24px sans-serif';g.textBaseline='middle';g.fillText('🔥',4,20);
  const cd=g.getImageData(0,0,40,40).data;let cp=0;for(let i=3;i<cd.length;i+=4)if(cd[i]>60)cp++;out.canvasPx=cp;if(cp<120)out.bad.push('canvas emoji drew '+cp+' px');
  out.miss=Object.keys(KQ_MISS);
  return out}"""
SHEET=r"""()=>{const N=Object.keys(KQI),cols=16,S=56,cv=document.createElement('canvas');cv.width=cols*S;cv.height=Math.ceil(N.length/cols)*S;
  const g=cv.getContext('2d');g.fillStyle='#1b140d';g.fillRect(0,0,cv.width,cv.height);
  N.forEach((n,i)=>g.drawImage(kqArtBmp(n,KQI[n][0],48),(i%cols)*S+4,Math.floor(i/cols)*S+4,48,48));return cv.toDataURL('image/png')}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    for q in ['[data-dev=desktop]','[data-c="warrior"]','#ccNext','#ccNext']:  # clicked from script: a big window's overlay can catch real clicks
        pg.wait_for_selector(q,timeout=60000);pg.eval_on_selector(q,'e=>e.click()');pg.wait_for_timeout(400)
    pg.wait_for_timeout(3000)
    r=ev(CHECK)
    print('paintings',r['n'],'in',r['ms'],'ms · spans',r.get('spans'),'· canvas px',r.get('canvasPx'),'· unknown emoji',r.get('miss'))
    for b in r['bad']:print('FAIL',b);FAIL.append(b)
    if r['n'] and r['ms']/r['n']>40:FAIL.append('slow: %d ms for %d paintings'%(r['ms'],r['n']));print('FAIL slow')
    open(O+'/v201_sheet.png','wb').write(base64.b64decode(ev(SHEET).split(',')[1]))
    ev("""()=>{try{Object.keys(mats).forEach(k=>mats[k]=5)}catch(e){};try{['Foxlet','Mossfrog','Boneling'].forEach((sp,i)=>eggs.push(mkEgg(sp,1+i,0)))}catch(e){}}""")
    for k,n,tab in [('i','mat','Materials'),('k','abil',None),('u','eggs',None)]:
        pg.keyboard.press('Escape');pg.wait_for_timeout(300);pg.keyboard.press(k);pg.wait_for_timeout(1200)
        if tab:ev("t=>{for(const b of document.querySelectorAll('button'))if(b.offsetParent&&b.textContent.trim().startsWith(t)){b.click();break}}",tab);pg.wait_for_timeout(800)
        c=ev("()=>{const v=[...document.querySelectorAll('.kqi')].filter(e=>e.offsetParent);return {all:v.length,art:v.filter(e=>e.classList.contains('kqa')).length,old:[...new Set(v.filter(e=>!e.classList.contains('kqa')).map(e=>e.className))]}}")
        print(n,'icons shown',c['all'],'painted',c['art'])
        if c['all']==0:FAIL.append(n+': no icons shown');print('FAIL',n,'no icons shown')
        if c['old']:FAIL.append(n+': unpainted '+str(c['old']));print('FAIL',n,'unpainted',c['old'])
        pg.screenshot(path=O+'/v201_%s.png'%n)
play.run(s,w=1280,hh=800)
print('FAILURES:',FAIL if FAIL else 'none')
