# v148: decorations cost less, many only common materials; six new big ones. Checks: every decoration has a price, at least
#   ten cost no gold at all, all are cheaper than v104's gold prices; buying a material-only one takes the materials and no
#   gold; without enough materials it is refused; the tab shows material prices; the six new ones build (stage 5) with meshes.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
OLD={'banner':300,'garland':450,'planter':250,'statue':1500,'brazier':400,'trees':600,'gild':2500,'trophy':2000,'ravens':350,'wisps':900,'skylant':1200,'carts':500,'well':700,'bunting':300,'benches':200,'pumpkins':250,'shrine':550,'totems':450,'ivy':200,'gatepoles':650,'crystals':800,'mosaic':700,'cats':300,'baskets':250,'woodpile':150,'fireworks':3000}
JS=r"""()=>{const o={};o.list=DECO103.map(D=>[D.k,D.g||0,D.m||null]);
  gold=50;mats.wood=3;dcBuy103('woodpile');o.refused=SH.deco.woodpile==null;
  mats.wood=40;const g0=gold;dcBuy103('woodpile');o.bought=SH.deco.woodpile===1;o.wood=mats.wood;o.gold=gold-g0;
  openX('hold');KM103.tab='deco';rX();o.chips=document.querySelectorAll('#xw .dcbuy').length;o.matChip=[...document.querySelectorAll('#xw .dcbuy')].some(b=>/🪨|🌿|🪵/.test(b.textContent));closeX();
  bossDone.clear();for(let i=0;i<5;i++)bossDone.add(i);kfApply109(true);gold=1e7;['wood','stone','fiber','petals','glowcap','bone','iron','crystal'].forEach(k=>mats[k]=999);
  const NEW=['obelisk','torches','pavilion','oak','garden','beacon'];NEW.forEach(k=>dcBuy103(k));dc103Sync();
  o.newBuilt=NEW.map(k=>{const g=DC103.g[k];let n=0;if(g)g.traverse(q=>{if(q.isMesh)n++});return [k,n,(DC103.col[k]||[]).length]});return o}"""
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:2500])
    F=lambda m:print('FAIL',m)
    L={k:(g,m) for k,g,m in r['list']}
    if any(g==0 and not m for g,m in L.values()):F('a decoration is free')
    if sum(1 for g,m in L.values() if g==0)<10:F('fewer than ten material-only decorations')
    for k,g in OLD.items():
        if k in L and L[k][0]>=g:F('%s is not cheaper (%s gold)'%(k,L[k][0]))
    if not r['refused']:F('bought without enough materials')
    if not r['bought'] or r['wood']!=25 or r['gold']!=0:F('material purchase wrong: %s'%r)
    if not r['matChip']:F('the tab shows no material prices')
    for k,n,c in r['newBuilt']:
        if n<1:F('%s has no meshes at stage 5'%k)
        if c<1:F('%s has no colliders'%k)
    print('decorations: checked')
play.run(s)
