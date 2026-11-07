# v203: see-through decorations (Kindlelight's ground mist, the Dirge's mist, cobwebs) keep their own alpha.
# v192's camera fade set every decoration's alpha to 1, so each mist patch drew as a solid pale disc inside a dark square.
# Checks the compiled shaders and a top-down picture of Kindlelight I with the mist on and off. PASS/FAIL lines.
import io,json,os,play
from PIL import Image,ImageChops,ImageStat
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'out');os.makedirs(OUT,exist_ok=True)
GO=r"""(()=>{window.requestAnimationFrame=()=>0;insArrive(INSL[0]);toPos(259,156);camDist=15;camPitch=1.0;
  for(let i=0;i<40;i++)loop(performance.now()+i*16);return 1})()"""
SRC=r"""(()=>{const gl=ren.getContext(),out={mist:null,plant:null,n:0};
  const src=m=>{const p=ren.properties.get(m);const pr=p&&(p.program||(p.programs&&p.programs.values().next().value));if(!pr||!pr.program)return null;
    const sh=gl.getAttachedShaders(pr.program).map(s=>gl.getShaderSource(s)).find(t=>/gl_FragColor|pc_fragColor|void main/.test(t)&&/dithering_fragment|gl_FragColor\.a/.test(t));return sh||null};
  scene.traverse(o=>{if(!o.isMesh||!o.material||Array.isArray(o.material))return;const m=o.material;
    if(m.map===WD.mistT&&!out.mist){out.n++;const s=src(m);if(s)out.mist={keep:/#define OB203_KEEPA/.test(s),key:m.customProgramCacheKey()}}
    else if(!m.transparent&&m.userData.ob176Fl===-.6&&!out.plant){const s=src(m);if(s)out.plant={keep:/#define OB203_KEEPA/.test(s),key:m.customProgramCacheKey()}}});
  return out})()"""
def shot(pg):
    b=pg.locator('canvas').first.screenshot();return Image.open(io.BytesIO(b)).convert('RGB')
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate(GO);on=shot(pg)
    r=pg.evaluate(SRC)
    n=pg.evaluate("(()=>{let n=0;scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.map===WD.mistT){o.visible=false;n++}});for(let i=0;i<4;i++)loop(performance.now()+i*16);return n})()")
    off=shot(pg)
    w,h=on.size;on.save(OUT+'/v203_mist_on.png');off.save(OUT+'/v203_mist_off.png')
    d=ImageStat.Stat(ImageChops.difference(on,off).convert('L'))
    mean=d.mean[0];big=sum(1 for v in ImageChops.difference(on,off).convert('L').getdata() if v>60)/(w*h)
    print('shaders:',json.dumps(r),'mist meshes hidden:',n,'mean diff %.2f, share of pixels changed a lot %.4f'%(mean,big))
    fails=[]
    if not n:fails.append('no mist meshes in Kindlelight I')
    if not r.get('mist'):fails.append('mist shader not found')
    elif not r['mist']['keep']:fails.append('mist shader replaces its alpha (OB203_KEEPA missing)')
    if r.get('plant') and r['plant']['keep']:fails.append('an opaque plant shader got OB203_KEEPA (program cache shared)')
    if big>.04:fails.append('mist still draws solid: %.1f%% of the view changes a lot when it is hidden'%(big*100))
    for f in fails:print('FAIL',f)
    if not fails:print('PASS v203 mist stays see-through (%.2f%% of pixels change a lot)'%(big*100))
play.run(s)
