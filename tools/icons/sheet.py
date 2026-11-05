# v201 icon art sheet: every painted icon (KQA) at 64 / 28 / 18 px on the game's window colour, the old v88 glyph beside it.
#   python3 tools/icons/sheet.py [OUT.png]          env: NAMES="coin,egg,..." (only these), TINTS=1 (each emoji tint variant too),
#                                                    OLD=0 (no old glyph), COLS=10
# Loads only the icon files (0020, 0030, 0035-0039), so it takes a few seconds and needs no game build.
import os,sys,glob,json
from playwright.sync_api import sync_playwright
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','src','js')
files=sorted(glob.glob(R+'/0020-*.js')+glob.glob(R+'/0030-*.js')+[f for f in glob.glob(R+'/003[5-9]-*.js')])
js='\n'.join(open(f).read() for f in files)
OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','test','out','icons_sheet.png')
cfg=json.dumps({'names':[n for n in os.environ.get('NAMES','').split(',') if n],'tints':os.environ.get('TINTS')=='1','old':os.environ.get('OLD','1')!='0','cols':int(os.environ.get('COLS','10')),'big':int(os.environ.get('BIG','64'))})
html='''<html><body style="margin:0;background:#1b140d"><canvas id=c></canvas><script>'''+js+'''
const CF='''+cfg+''';
let N=CF.names.length?CF.names:Object.keys(KQI);const L=[];
for(const n of N){L.push([n,KQI[n]?KQI[n][0]:'parch']);if(CF.tints){const seen={};seen[L[L.length-1][1]]=1;
  for(const [e,v] of Object.entries(KQE))if(v&&v[0]==n&&v[1]&&!seen[v[1]]){seen[v[1]]=1;L.push([n,v[1]])}}}
const cols=CF.cols,B=CF.big,W=86+B,H=54+B,c=document.getElementById('c');c.width=cols*W;c.height=Math.ceil(L.length/cols)*H;
const g=c.getContext('2d');g.fillStyle='#1b140d';g.fillRect(0,0,c.width,c.height);
L.forEach(([n,t],i)=>{const x=(i%cols)*W,y=Math.floor(i/cols)*H;
  const gr=g.createLinearGradient(0,y,0,y+H);gr.addColorStop(0,'#2a1f14');gr.addColorStop(1,'#17110b');g.fillStyle=gr;g.fillRect(x+3,y+3,W-6,H-6);
  g.strokeStyle='#4a3820';g.strokeRect(x+3.5,y+3.5,W-7,H-7);
  const has=!!KQA[n];
  if(has){g.drawImage(kqArtBmp(n,t,B),x+10,y+12,B,B);g.drawImage(kqArtBmp(n,t,28),x+B+18,y+14,28,28);g.drawImage(kqArtBmp(n,t,18),x+B+52,y+19,18,18)}
  else{g.fillStyle='#a33';g.font='bold 12px sans-serif';g.fillText('no art',x+20,y+46)}
  if(CF.old){const KA=KQA[n];delete KQA[n];g.drawImage(kqBitmap(n,t,22),x+B+22,y+50,22,22);if(KA)KQA[n]=KA}
  g.font='11px sans-serif';g.fillStyle='#d8c6a2';g.textAlign='left';g.fillText(n+(t!=(KQI[n]||[])[0]?' · '+t:''),x+10,y+B+32);
  g.fillStyle='#7d6d58';g.fillText(has?'':'',x+10,y+108)});
document.title=JSON.stringify({n:L.length,missing:L.filter(l=>!KQA[l[0]]).map(l=>l[0]),ms:Math.round(KQAS.ms)});
</script></body></html>'''
tmp='/tmp/kq_icon_sheet_%d.html'%os.getpid();open(tmp,'w').write(html)
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':2400,'height':900});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+tmp);pg.wait_for_timeout(300)
    print(pg.title());[print('PAGEERROR',e) for e in errs]
    pg.locator('#c').screenshot(path=OUT);b.close()
print('wrote',OUT)
