# v163: weapons never spin in the hand. For every class and weapon type: three attacks with a monster hunting the hero nearby,
# the weapon's turn against its hand measured every 16 ms. FAIL when any frame turns more than MAXF degrees or any 0.1 s more
# than MAXW (the orb lifting off the palm: ~26° a frame, ~100° in 0.1 s, smooth; before v163: the halberd 375° in 0.1 s, twin axes 72° in one frame, every melee weapon / the bow 60-104° in a frame
# when an attack started). CLS=warrior,... to limit.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
MAXF=float(os.environ.get('MAXF','30'));MAXW=float(os.environ.get('MAXW','120'))
CLASSES=os.environ.get('CLS','warrior,paladin,assassin,ranger,mage').split(',')
JS=r"""async(cls)=>{const out={};window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){out.err=String(err).slice(0,200)}}};
 {const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];toPos(q[0],q[1])}enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});
 const types=[...new Set(ITPL.map((t,i)=>t.sl=='weapon'&&t.cls==cls?itT({tp:i,lv:1,r:1,up:0,aff:[]}).wt:null).filter(Boolean))];out.types=types;
 for(const wt of types){const tp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls==cls&&itT({tp:i,lv:1,r:1,up:0,aff:[]}).wt==wt);eq.weapon={id:9e4+tp,tp,lv:30,req:1,r:2,up:0,aff:[]};refreshGear();STEP(60);
  const Ws=(pl.gearG||[]).filter(o=>o.userData&&o.userData.wt==wt&&o.parent);if(!Ws.length){out[wt]={none:1};continue}
  const R=Ws.map(()=>({max:0,maxAt:0,win:0,winAt:0,hist:[]}));let prev=Ws.map(W=>W.quaternion.clone());
  const fr=[];let f=0;
  const tick=(lab)=>{STEP(1);f++;Ws.forEach((W,i)=>{const q=W.quaternion,d=Math.min(1,Math.abs(prev[i].dot(q)));const a=2*Math.acos(d)*180/Math.PI;prev[i]=q.clone();const r=R[i];r.hist.push(a);
     if(a>r.max){r.max=a;r.maxAt=lab+'@'+f+' k='+(HA.cur?HA.cur.k.toFixed(2):'-')}const w=r.hist.slice(-6).reduce((s,x)=>s+x,0);if(w>r.win){r.win=w;r.winAt=lab+'@'+f}})};
  if(window.FIGHT){const e=spawnEnemy(BIOEN[PMAP[1].n][0],pl.position.x+6,pl.position.z,5,{});if(e){e.c.h=e.c.st.hp=1e7;e.stun=999;e.agg=1}}for(let i=0;i<20;i++)tick('idle');
  for(let n=0;n<3;n++){atkCd=0;swing();for(let i=0;i<45;i++)tick('atk'+n)}
  for(let i=0;i<40;i++)tick('rest');
  out[wt]=R.map(r=>({max:+r.max.toFixed(1),maxAt:r.maxAt,win6:+r.win.toFixed(1),winAt:r.winAt}))}
 return out}"""
fails=[]
def F(m):fails.append(m);print('FAIL',m)
for CLS in CLASSES:
    def s(pg,CLS=CLS):
        pg.set_default_timeout(1500000)
        pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="%s"]'%CLS,timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
        pg.evaluate('()=>{window.FIGHT=1}');r=pg.evaluate(JS,CLS)
        if r.get('err'):F('%s: error %s'%(CLS,r['err']))
        for wt in r['types']:
            for i,q in enumerate(r[wt] if isinstance(r[wt],list) else []):
                print(CLS,wt,i,json.dumps(q))
                if q['max']>MAXF:F('%s %s (hand %d): turned %s° in one frame at %s'%(CLS,wt,i,q['max'],q['maxAt']))
                if q['win6']>MAXW:F('%s %s (hand %d): turned %s° in 0.1 s at %s'%(CLS,wt,i,q['win6'],q['winAt']))
    play.run(s,w=800,hh=500)
print('weapon turns: checked' if not fails else 'CHECKS FAILED')
