# v185 helper: what stands at given spots (v185_whatis.js).  python3 v185_whatis.py spots.json [max]  -> prints a compact list
#   spots.json: [[x,z,r,"label"],...]
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
H=os.path.dirname(os.path.abspath(__file__));PTS=json.load(open(sys.argv[1]));MAX=int(sys.argv[2]) if len(sys.argv)>2 else 30
def s(pg):
    pg.set_default_timeout(3600000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.evaluate("()=>{try{CHEAT.god=true}catch(_){}}")
    JS=open(H+'/v185_whatis.js').read();r=[]
    for P in PTS:
      R=pg.evaluate(JS,{'pts':[P],'max':MAX})[0];r.append(R);json.dump(r,open(play.TMP+'/v185_whatis.json','w'),indent=1)
      if 1:
        print('=== %s (%s,%s) %s ground %s'%(R['lab'],R['x'],R['z'],R['ins'],R['g']))
        if R['wd']:print('  WD:',' '.join('%s@%s,%s%s'%(w[0],w[1],w[2],('['+w[4]+']') if w[4] else '') for w in R['wd'][:40]))
        for m in R['mesh']:print('  %-26s %-18s %-16s %s %s v%d %s y%.2f size%s x%d %s'%(m['root'][:26],(m['path'] or m['name'] or '')[:18],m['geo'][:16],m['mat'] and m['mat'].replace('Material','')[:10],m['col'],m['verts'],'map' if m['map'] else ('vc' if m['vc'] else ''),m['at'][1],m['size'],m['n'],m['rud']))
play.run(s)
