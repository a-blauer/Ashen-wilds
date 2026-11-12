# Turn a test's PASS / FAIL lines into a picture (out/<name>.png), so tools/sheet.sh brings them back with the screenshots.
#   python3 logshot.py out/t.log v223_log
import sys,textwrap
from PIL import Image,ImageDraw
L=[]
for l in open(sys.argv[1],errors='replace'):
    if l.startswith(('PASS','FAIL','SHOT')) or 'ALL PASS' in l or 'FAILED' in l or 'PAGEERROR' in l or 'Error' in l:
        L+=textwrap.wrap(l.rstrip(),200) or ['']
L=L[:300] or ['(no PASS / FAIL lines)']
im=Image.new('RGB',(1500,16*len(L)+12),'white');d=ImageDraw.Draw(im)
for i,l in enumerate(L):d.text((6,6+16*i),l,fill=(170,0,0) if l.startswith('FAIL') else (0,0,0))
im.save('out/%s.png'%sys.argv[2])
