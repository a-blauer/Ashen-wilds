# v177 gear audit: every helm / chest / boots on each class animal that wears it, every weapon and shield model, every unique.
# Prints each floating piece (a part of the gear that touches nothing that leads back to the body, or to the grip for weapons),
# in the bind pose and while running / striking (pieces that come away from what they sit on), and the clipping counts
# (v114 poke / hide) per worn piece.
#   python3 v177_gear_audit.py          CLS=warrior,mage  SL=helm,chest,boots,weapon  R=4  POSED=0  CLIP=1 (also count clipping)  PIC=all|<indices> (pictures, floating pieces magenta)  OUT=out/v177_audit.json
#   FAIL lines: a rigid floating piece bigger than MINSZ (default .012 m) with a gap over 7 mm (cloth: 'cloth:' warning lines).
import os,sys,json,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
HERE=os.path.dirname(os.path.abspath(__file__))
LIB=open(HERE+'/v114_clip_lib.js').read()+'\n'+open(HERE+'/v177_gear_audit_lib.js').read()
MV={'warrior':'gs1','paladin':'mace1','assassin':'dag1','ranger':'sling','mage':'sword0'}
CL=os.environ.get('CLS','warrior,paladin,assassin,ranger,mage').split(',')
SL=os.environ.get('SL','helm,chest,boots,weapon').split(',')
R=int(os.environ.get('R','4'));POSED=os.environ.get('POSED','1')!='0';CLIPC=os.environ.get('CLIP','0')!='0'
PIC=os.environ.get('PIC','')   # PIC=all or template indices: a picture per item (floating pieces magenta)
MINSZ=float(os.environ.get('MINSZ','.012'))
LIST=r"""(a)=>{const [cls,sls]=a,arm=CLS[cls].arm,out=[];ITPL.forEach((t,i)=>{if(!sls.includes(t.sl=='offhand'?'weapon':t.sl))return;
  if(t.sl=='weapon'||t.sl=='offhand'){if(t.cls==cls)out.push([i,t.n,t.sl])}else if(t.arm==arm)out.push([i,t.n,t.sl])});
  if(sls.includes('weapon'))for(const k in UNQ135){const U=UNQ135[k];if(U.sl=='weapon')out.push([-1,k,'unique'])}
  return out}"""
ONE=r"""(a)=>{const [cls,tp,sl,R,mv,posed,clip]=a;if(!V100A.T.sword0)V100A_build();
  let it;if(tp<0){const U=UNQ135[sl];const w=ITPL.findIndex(t=>t.sl=='weapon'&&t.cls==cls&&t.t==Math.min(4,U.z|0));it={id:-1,tp:w,lv:30,req:1,r:4,up:0,aff:[],u:sl}}else it={id:-1,tp,lv:30,req:1,r:R,up:0,aff:[]};
  const t=itT(it);try{if(t.sl=='weapon'||t.sl=='offhand')return {k:GA.kit(it)};const E={};E[t.sl]=it;return {w:GA.worn(cls,E,mv,{posed,clip})}}catch(e){return {err:String(e&&e.stack||e).slice(0,400)}}}"""
PICJS=r"""(a)=>{const [cls,tp,sl,R]=a;let it;if(tp<0){const U=UNQ135[sl];const w=ITPL.findIndex(t=>t.sl=='weapon'&&t.cls==cls&&t.t==Math.min(4,U.z|0));it={id:-1,tp:w,lv:30,req:1,r:4,up:0,aff:[],u:sl}}else it={id:-1,tp,lv:30,req:1,r:R,up:0,aff:[]};
  const t=itT(it);if(t.sl=='weapon'||t.sl=='offhand')return GA.kitPic(it);const E={};E[t.sl]=it;return GA.pic(cls,E)}"""
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    ev("(L)=>{eval(L);window.requestAnimationFrame=()=>0;POST.render=()=>{}}",LIB)
    ALL={};F=[];W=[]
    for cls in CL:
        L=ev(LIST,[cls,SL]);print('==',cls,len(L),'items',flush=True)
        for tp,n,sl in L:
            r=ev(ONE,[cls,tp,(n if sl=='unique' else sl),R,MV[cls],POSED,CLIPC])
            key='%s|%s|%s'%(cls,tp,n);ALL[key]=r
            if PIC and (PIC=='all' or str(tp) in PIC.split(',')) and 'err' not in r:
                img=ev(PICJS,[cls,tp,(n if sl=='unique' else sl),R]);nm='v177_audit_%s_%s.jpg'%(cls,tp if tp>=0 else n)
                open(play.TMP+'/'+nm,'wb').write(base64.b64decode(img.split(',')[1]));print('  wrote',nm)
            if 'err' in r:print('  ERR',tp,n,r['err'][:200]);F.append('error %s %s'%(n,r['err'][:120]));continue
            if 'k' in r:
                k=r['k'];fl=[d for d in k['float'] if d['sz']>=MINSZ and d['gap']>.007]
                print('  %4d %-30s parts %3d pieces %3d float %d %s'%(tp,n[:30],k['parts'],k['pieces'],len(fl),'; '.join('%s sz %.3f gap %.3f @%s'%(d['lab'][0],d['sz'],d['gap'],d['c']) for d in fl[:4])),flush=True)
                for d in fl:F.append('%s %s: floating %s (size %.3f, gap %.3f) at %s'%(cls,n,d['lab'][0],d['sz'],d['gap'],d['c']))
                continue
            w=r['w'];fl=[d for d in w['bind'] if d['sz']>=MINSZ and d['gap']>.007]
            ps=[];[ps.extend([(nm,d) for d in v if d['sz']>=MINSZ]) for nm,v in w.get('posed',{}).items()]
            cl=w.get('clip') or {}
            print('  %4d %-30s pieces %4d float %d posed %d clip %s/%s %s'%(tp,n[:30],w['pieces'],len(fl),len(ps),cl.get('poke','-'),cl.get('hide','-'),
                  '; '.join('%s sz %.3f gap %.3f @%s'%(d['lab'][0][:40],d['sz'],d['gap'],d['c']) for d in fl[:3])+(' | posed: '+'; '.join('%s %s sz %.3f gap %.3f'%(nm,d['lab'][0][:30],d['sz'],d['gap']) for nm,d in ps[:3]) if ps else '')),flush=True)
            # rigid pieces (kit parts: their label has '@') fail; cloth (lofts, skirts, sleeves, capes) is listed as a warning
            for d in fl:(F if '@' in d['lab'][0] else W).append('%s %s: floating %s (size %.3f, gap %.3f) at %s'%(cls,n,d['lab'][0],d['sz'],d['gap'],d['c']))
            for nm,d in ps:(F if '@' in d['lab'][0] else W).append('%s %s: comes away when %s: %s (size %.3f, gap %.3f)'%(cls,n,nm,d['lab'][0],d['sz'],d['gap']))
    json.dump(ALL,open(os.environ.get('OUT',play.TMP+'/v177_audit.json'),'w'))
    for w in W:print('cloth:',w)
    for f in F:print('FAIL',f)
    print('FAILURES:',len(F))
play.run(s,w=900,hh=600)
