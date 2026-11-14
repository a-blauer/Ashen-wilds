# v233 a worn amulet hangs round the neck (owner, Nov 14 2026: "worn amulets dont seem to go around the neck like they should").
# Every class's animal, bare and in chest armour, with an old amulet and a v137 one: the chain is measured (no fallback to the
# old shoulder-wide band), it passes behind the neck at the neck's own radius and height, no link is far from the body's
# surface, it ends at the pendant on the chest, and nothing of the amulet is as wide as the shoulders.   python3 v233_amulet.py
import play,json
fails=[]
def ok(c,m):
    print(('PASS ' if c else 'FAIL ')+m)
    if not c:fails.append(m)
JS=r"""async()=>{const o={rows:[],errs:[]};const ow=console.warn;console.warn=(...a)=>{const s=a.map(String).join(' ');if(/v233/.test(s))o.errs.push(s.slice(0,200));ow(...a)};
 const CL=['warrior','assassin','mage','paladin','ranger'],ams=[ITPL.findIndex(t=>t.sl=='amulet'),ITPL.findIndex((t,i)=>i>=ITPL_V137&&t.sl=='amulet')];
 for(const c of CL)for(const arm of [0,1])for(const tp of ams){const E={amulet:{id:-1,tp,lv:20,req:1,r:3,up:0,aff:[]}};if(arm){const ch=ITPL.findIndex(t=>t.sl=='chest'&&fitsCls(t,c)&&t.t>=2);E.chest={id:-2,tp:ch,lv:20,req:1,r:3,up:0,aff:[]}}
  const row={c,arm,tp:ITPL[tp].n};AM233.last=null;AM233.why='?';
  try{const L=mdLookOf(pl,c),B0=mdHeroB(c,L,arm?{chest:E.chest}:{}),n0=B0.L.m.p.length+B0.L.c.p.length+B0.L.g.p.length,B=mdHeroB(c,L,E),A=AM233.last;row.why=AM233.why;row.added=(B.L.m.p.length+B.L.c.p.length+B.L.g.p.length-n0)/9;
   if(A){const T=am233Tris(B0,.7,B0.bones.head[2]+.02),nb=A.base,P=A.pts,loop=P.slice(0,9);row.base=+nb.y.toFixed(3);row.neckR=+nb.r.toFixed(3);
    row.loopR=+Math.max(...loop.map(p=>{const m=am233Mid(B0,p[1]);return Math.hypot(p[0]-m[0],p[2]-m[2])})).toFixed(3);row.loopY=[+Math.min(...loop.map(p=>p[1])).toFixed(3),+Math.max(...loop.map(p=>p[1])).toFixed(3)];
    row.nape=+P[0][2].toFixed(3);row.tip=P[P.length-1].map(v=>+v.toFixed(3));row.wide=+Math.max(...P.map(p=>Math.abs(p[0]))).toFixed(3);
    // how far each drape point floats in front of the surface
    let fl=0;for(let i=9;i<P.length;i++){const H=am233Ray(T,P[i][0],P[i][1],1.5,0,0,-1);if(H.length)fl=Math.max(fl,P[i][2]-(1.5-H[0]))}row.float=+fl.toFixed(3);
    // the amulet's own metal: nothing shoulder-wide (the old band was ~0.2 either side at one height)
    const m0=B0.L.m.p.length,mp=B.L.m.p;let w=0;for(let i=m0;i<mp.length;i+=3)if(mp[i+1]>nb.y-.02)w=Math.max(w,Math.abs(mp[i]));row.metalW=+w.toFixed(3)}}catch(e){row.err=String(e)}
  o.rows.push(row)}
 o.err=AM233.err;return o}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:6000])
    ok(len(r['rows'])==20,'twenty heroes built (%s)'%len(r['rows']))
    for q in r['rows']:
        nm='%s %s · %s'%(q['c'],'armoured' if q['arm'] else 'bare',q['tp'])
        if q.get('err') or q.get('why') or 'base' not in q:ok(False,'%s: the chain is measured on the hero (%s %s)'%(nm,q.get('why'),q.get('err')));continue
        ok(q['added']>40,'%s: the amulet is built (%s triangles)'%(nm,q['added']))
        ok(q['loopR']<=q['neckR']*1.4+.02 and q['nape']<-.04,'%s: the chain passes behind the neck at the neck\'s size (links within %s of its middle, neck %s, nape z %s)'%(nm,q['loopR'],q['neckR'],q['nape']))
        ok(q['base']<=q['loopY'][0] and q['loopY'][1]<=q['base']+.045,'%s: round the neck\'s base, not the shoulders (heights %s, base %s)'%(nm,q['loopY'],q['base']))
        ok(q['wide']<=q['neckR']*1.4+.02 and q['metalW']<=q['neckR']*1.4+.03,'%s: nothing as wide as the shoulders (chain %s, metal %s)'%(nm,q['wide'],q['metalW']))
        ok(abs(q['tip'][0])<1e-6 and .86<q['tip'][1]<.92 and q['tip'][2]>.08,'%s: the chain ends at the pendant on the chest %s'%(nm,q['tip']))
        ok(q['float']<=.06,'%s: the chain lies on the chest (at most %s off it)'%(nm,q['float']))
    ok(not r['errs'] and r['err']==0,'no errors %s'%r['errs'])
play.run(s)
print('v233 amulet:','ALL PASS' if not fails else 'FAILED %d'%len(fails))
if fails:raise SystemExit(1)
