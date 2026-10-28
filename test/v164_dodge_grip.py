# v164: a dash (dodge) never turns the weapon in the hand. Owner: "after sprinting the halberd is turned the wrong way briefly,
# it corrects itself after a few seconds". For every class and weapon type, two cases:
#  calm  - walking around, no fight: the weapon sits in the carry grip; dash twice, then wait 3 s
#  fight - right after an attack with a monster hunting nearby (the hands keep the strike grip); dash twice, then wait
# The weapon's turn against its hand (the bow in its carry: against the hero, it is held steady in his frame) is measured every 16 ms from just before the first dash. FAIL when it ever turns more
# than MAXD degrees away from where it was before the dash (before v164: the halberd ~100°+ for ~2 s), or more than MAXF in a frame.
# CLS=warrior,... to limit.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
MAXD=float(os.environ.get('MAXD','12'));MAXF=float(os.environ.get('MAXF','30'))
CLASSES=os.environ.get('CLS','warrior,paladin,assassin,ranger,mage').split(',')
JS=r"""async(cls)=>{const out={};window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;hero.hp=heroMax();try{loop(VT)}catch(err){out.err=String(err).slice(0,200)}}};
 {const p=PMAP[1],q=p.path[Math.floor(p.path.length/2)];toPos(q[0],q[1])}
 const clear=()=>enemies.slice().forEach(e=>{if(!e.boss)removeE(e)});clear();
 const types=[...new Set(ITPL.map((t,i)=>t.sl=='weapon'&&t.cls==cls?itT({tp:i,lv:1,r:1,up:0,aff:[]}).wt:null).filter(Boolean))];out.types=types;
 for(const wt of types){const tp=ITPL.findIndex((t,i)=>t.sl=='weapon'&&t.cls==cls&&itT({tp:i,lv:1,r:1,up:0,aff:[]}).wt==wt);eq.weapon={id:9e4+tp,tp,lv:30,req:1,r:2,up:0,aff:[]};refreshGear();
  out[wt]={};
  for(const cs of ['calm','fight']){clear();if(typeof tgt!='undefined')tgt=null;EDGE163.last=-1e9;EDGE163.fT=-1e9;STEP(200);
   const Ws=(pl.gearG||[]).filter(o=>o.userData&&o.userData.wt==wt&&o.parent);if(!Ws.length){out[wt][cs]={none:1};continue}
   if(cs=='fight'){const e=spawnEnemy(BIOEN[PMAP[1].n][0],pl.position.x+6,pl.position.z,5,{});if(e){e.c.h=e.c.st.hp=1e7;e.stun=999;e.agg=1}
     atkCd=0;swing();STEP(70)}
   const base=Ws.map(W=>W.quaternion.clone());let prev=Ws.map(W=>W.quaternion.clone());
   const R=Ws.map(()=>({dev:0,devAt:'',fr:0,frAt:''}));let f=0;
   const carry=pl._grip.w>.5,QH=W=>{if(W.userData.wt!='bow'||!carry)return W.quaternion.clone();const a=new THREE.Quaternion(),b=new THREE.Quaternion();pl.getWorldQuaternion(a);W.getWorldQuaternion(b);return a.invert().multiply(b)};   // the bow is carried steady in the hero's own frame (2390), the rest in the hand
   base.forEach((_,i)=>{base[i]=QH(Ws[i]);prev[i]=QH(Ws[i])});
   const tick=lab=>{STEP(1);f++;Ws.forEach((W,i)=>{const q=QH(W),ang=(a,b)=>2*Math.acos(Math.min(1,Math.abs(a.dot(b))))*180/Math.PI;
     const d=ang(base[i],q),fa=ang(prev[i],q);prev[i]=q.clone();const r=R[i];
     if(d>r.dev){r.dev=d;r.devAt=lab+'@'+f}if(fa>r.fr){r.fr=fa;r.frAt=lab+'@'+f}})};
   const shut=()=>{UIO_IDS.forEach(i=>{const x=$(i);if(x)x.classList.add('hide')});if(typeof KQMENU!='undefined')KQMENU.on=false};
   for(let n=0;n<2;n++){shut();hero.dc=5;hero.cdD=0;hero.dash=null;dodge();if(!hero.dash)out.nodash=(out.nodash||[]).concat([wt+' '+cs+' ui='+UIO_IDS.filter(i=>$(i)&&!$(i).classList.contains('hide')).join('/')+' chan='+!!hero.chan+' party='+party.length]);for(let i=0;i<40;i++)tick('dash'+n)}
   for(let i=0;i<190;i++)tick('after');
   out[wt][cs]=R.map(r=>({dev:+r.dev.toFixed(1),devAt:r.devAt,frame:+r.fr.toFixed(1),frameAt:r.frAt}))}}
 return out}"""
fails=[]
def F(m):fails.append(m);print('FAIL',m)
for CLS in CLASSES:
    def s(pg,CLS=CLS):
        pg.set_default_timeout(1500000)
        pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="%s"]'%CLS,timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
        r=pg.evaluate(JS,CLS)
        if r.get('err'):F('%s: error %s'%(CLS,r['err']))
        for m in r.get('nodash',[]):F('%s: the dash did not start (%s)'%(CLS,m))
        for wt in r['types']:
            for cs,L in r[wt].items():
                for i,q in enumerate(L if isinstance(L,list) else []):
                    print(CLS,wt,cs,i,json.dumps(q))
                    if q['dev']>MAXD:F('%s %s %s (hand %d): turned %s° from its pre-dash grip at %s'%(CLS,wt,cs,i,q['dev'],q['devAt']))
                    if q['frame']>MAXF:F('%s %s %s (hand %d): turned %s° in one frame at %s'%(CLS,wt,cs,i,q['frame'],q['frameAt']))
    play.run(s,w=800,hh=500)
print('dash grip: checked' if not fails else 'CHECKS FAILED')
