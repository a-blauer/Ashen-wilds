# v95 ornate armour: sheets of every armour set worn (front + back), close-ups, rarity steps, hero looks with armour,
# walk/attack frames, and triangle counts per hero.
#   python3 v95_ornate.py                                  -> this build (TAG=after)
#   SRC=<old.html> TAG=before python3 v95_ornate.py        -> the same sheets for another build (compare)
#   PART=sets,close,rar,look,anim,perf (default all)
# Sheets: <AW_TMP>/v95_<TAG>_<part>.jpg
import play,json,base64,os
TAG=os.environ.get('TAG','after');PART=os.environ.get('PART','sets,close,rar,look,anim,perf').split(',')
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v94_model.py')).read()
LIB=src[src.index('LIB=r"""')+8:src.index('"""',src.index('LIB=r"""')+8)]
from playwright.sync_api import Page as _Pg
_g0=_Pg.goto
def _goto(self,url,**k):
    k['timeout']=600000;return _g0(self,url,**k)
_Pg.goto=_goto
ARMS=[('heavy','warrior'),('medium','ranger'),('light','assassin'),('cloth','mage')]
# every set of one armour type: 5 base tiers + the v78 named sets -> [{name,h,c,b}]
SETS="""(arm)=>{const T=ITPL.map((t,i)=>Object.assign({i},t)).filter(t=>t.arm==arm);
  const sets=[];const base=T.filter(t=>!t.nw);for(let tier=0;tier<5;tier++){const g=s=>base.find(t=>t.t==tier&&t.sl==s);sets.push({name:'T'+(tier+1)+' '+g('chest').n,h:g('helm'),c:g('chest'),b:g('boots')})}
  const nw=T.filter(t=>t.nw);[...new Set(nw.map(t=>t.n.split(' ')[0]))].forEach(sn=>{const g=s=>nw.find(t=>t.n.startsWith(sn+' ')&&t.sl==s);sets.push({name:sn+' (T'+(g('chest').t+1)+')',h:g('helm'),c:g('chest'),b:g('boots')})});
  return sets}"""
def save(name,data):
    open(play.TMP+f'/v95_{TAG}_{name}.jpg','wb').write(base64.b64decode(data.split(',')[1]))
def s(pg):
    pg.set_default_timeout(600000);ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]');pg.click('[data-c="warrior"]');pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev(LIB);ev("(S)=>{window.V95SETS=eval(S);return 1}",SETS)
    if 'sets' in PART:
        ev("()=>V94.init(210,280)")
        for arm,cls in ARMS:
            r=ev("""([arm,cls])=>{const L=V95SETS(arm).map(S=>({name:S.name,make:()=>V94.hero(cls,{helm:V94.item(S.h.i,2),chest:V94.item(S.c.i,2),boots:V94.item(S.b.i,2)})}));
              return Object.assign(V94.grid(L,8,[-.45,Math.PI-.45]),{n:L.length})}""",[arm,cls])
            save('sets_'+arm,r['img']);print(arm,r['n'],r['err'])
    if 'close' in PART:
        # big cells: T5 of each type + the named sets, front / back / side
        ev("()=>V94.init(330,440)")
        for arm,cls in ARMS:
            r=ev("""([arm,cls])=>{const S=V95SETS(arm),L=[S[4],S[5],S[6],S[7]].map(S=>({name:S.name,make:()=>V94.hero(cls,{helm:V94.item(S.h.i,3),chest:V94.item(S.c.i,3),boots:V94.item(S.b.i,3)})}));
              return V94.grid(L,4,[-.45,Math.PI-.35,Math.PI/2])}""",[arm,cls])
            save('close_'+arm,r['img']);print('close',arm,r['err'])
    if 'rar' in PART:
        # one T3 and one T5 set at every rarity (Common .. Legendary)
        ev("()=>V94.init(180,240)")
        r=ev("""()=>{const L=[];[['heavy','warrior'],['medium','ranger'],['light','assassin'],['cloth','mage']].forEach(([arm,cls])=>{const S=V95SETS(arm);[2,4].forEach(ti=>{for(let r=0;r<5;r++)L.push({name:arm+' T'+(ti+1)+' r'+r,
          make:()=>V94.hero(cls,{helm:V94.item(S[ti].h.i,r),chest:V94.item(S[ti].c.i,r),boots:V94.item(S[ti].b.i,r),amulet:V94.item(ITPL.findIndex(t=>t.sl=='amulet'&&(t.t|0)==ti),r),ring:V94.item(ITPL.findIndex(t=>t.sl=='ring'&&(t.t|0)==ti),r)})})})});
          return V94.grid(L,10,[-.45])}""")
        save('rar',r['img']);print('rar',r['err'])
    if 'look' in PART:
        # hero looks (sex, build, height) wearing armour of each type
        ev("()=>V94.init(160,230)")
        r=ev("""()=>{const L=[],D={skin:'#d9b38c',hair:'#3a2414',hairStyle:2,face:0,eye:'#4a6a8a',build:1,height:1,sex:0};
          const V=[['m lean',{build:0}],['m broad',{build:2}],['f lean',{sex:1,build:0}],['f avg',{sex:1}],['f broad',{sex:1,build:2}],['h .94',{height:.94}],['h 1.06 f',{height:1.06,sex:1,build:2}],['m avg',{}]];
          [['heavy','warrior',4],['heavy','paladin',6],['medium','ranger',4],['medium','ranger',7],['light','assassin',4],['light','assassin',7],['cloth','mage',4],['cloth','mage',6]].forEach(([arm,cls,si])=>{const S=V95SETS(arm)[si];
            V.forEach(([n,o])=>L.push({name:cls+' '+n,make:()=>{hero.look=Object.assign({},D,o);return V94.hero(cls,{helm:V94.item(S.h.i,3),chest:V94.item(S.c.i,3),boots:V94.item(S.b.i,3)})}}))});
          const r=V94.grid(L,8,[-.5,Math.PI*.8]);delete hero.look;return r}""")
        save('look',r['img']);print('look',r['err'])
    if 'anim' in PART:
        ev("()=>V94.init(150,190)")
        r=ev("""()=>{const L=[];[['heavy','warrior'],['heavy','paladin'],['medium','ranger'],['light','assassin'],['cloth','mage']].forEach(([arm,cls],j)=>{const S=V95SETS(arm)[j==1?7:4];
          L.push(cls);window['V95E_'+cls]={helm:V94.item(S.h.i,3),chest:V94.item(S.c.i,3),boots:V94.item(S.b.i,3)}});
          return V94.sheet(L,c=>V94.hero(c,window['V95E_'+c]))}""")
        save('anim',r['img']);print('anim',r['err'])
        r=ev("""()=>{const L=[];[['heavy','warrior',6],['medium','ranger',6],['light','assassin',5],['cloth','mage',7]].forEach(([arm,cls,si])=>{const S=V95SETS(arm)[si];
          L.push(cls);window['V95E_'+cls]={helm:V94.item(S.h.i,4),chest:V94.item(S.c.i,4),boots:V94.item(S.b.i,4),amulet:V94.item(ITPL.findIndex(t=>t.sl=='amulet'),4)}});
          return V94.sheet(L,c=>V94.hero(c,window['V95E_'+c]))}""")
        save('anim2',r['img']);print('anim2',r['err'])
    if 'perf' in PART:
        r=ev("""()=>{const out={};[['heavy','warrior'],['heavy','paladin'],['medium','ranger'],['light','assassin'],['cloth','mage']].forEach(([arm,cls])=>{
          const per=[];V95SETS(arm).forEach(S=>{V94.hero(cls,{helm:V94.item(S.h.i,4),chest:V94.item(S.c.i,4),boots:V94.item(S.b.i,4),amulet:V94.item(ITPL.findIndex(t=>t.sl=='amulet'),4),ring:V94.item(ITPL.findIndex(t=>t.sl=='ring'),4)});
            const b=huBody(pl),q=V94.cost(pl),G=mdS().G.get(pl._mdKey).g;let body=0;for(const t in G)body+=G[t].attributes.position.count/3;per.push([S.name,Math.round(body),q.calls])});
          V94.hero(cls,{});const n=V94.cost(pl);let nb=0;const G=mdS().G.get(pl._mdKey).g;for(const t in G)nb+=G[t].attributes.position.count/3;
          out[cls]={none:Math.round(nb),max:Math.max(...per.map(p=>p[1])),avg:Math.round(per.reduce((a,p)=>a+p[1],0)/per.length),calls:Math.max(...per.map(p=>p[2])),per}});return out}""")
        print(TAG,'PERF',json.dumps(r))
play.run(s,w=900,hh=560)
