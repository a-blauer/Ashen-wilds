# v92 comp track test: timed empower, feed tooltip, crowded companion/egg menus, egg drop rate.
#   PART=emp,feed,menus,eggs (default all)   MOB=1 also shoots the menus at phone size   TAG=before|after (screenshot suffix)
#   SRC=<other build> works like every play.py test (the empower/feed/egg checks need this build).
import os,json,play
PART=os.environ.get('PART','emp,feed,menus,eggs').split(',');TAG=os.environ.get('TAG','after')
OUT=play.TMP;FAIL=[]
def ok(c,m):
    print(('OK   ' if c else 'FAIL ')+m)
    if not c:FAIL.append(m)

CROWD="""()=>{const long=['Grimfang the Unyielding Shadow of the Northern Wastes','Sir Fluffington','Bartholomew-Maximilian','Zz','Ashwhisker Moonbane Thunderhide','Pip','Lady Seraphine of the Hollow Mere','Gorgon','Mr. Snuggles the Terrible','Kraaaaaaaaaaaaaaaaaaaaaaaaaak'];
  for(let i=0;i<48;i++){const T=1+(i%5);const c=hatch(Object.assign(rollEgg(T),{basic:true}));if(!c)continue;
    c.n=long[i%long.length]+(i>=10?' '+(i+1):'');c.l=1+((i*7)%50);c.x=0;c.evo=i%4==0?Math.min(3,1+(i%3)):0;if(i%6==1)c.shn=1;if(i%9==2)c.rv=1;if(i%5==3)c.tr='Universal';c.h=Math.round(M(c)*(.2+.8*((i*37)%100)/100))}
  for(let i=0;i<34;i++){const e=rollEgg(1+(i%5));e.id=uid++;e.t0=Date.now()-(i%3==0?999999:i*1500);eggs.push(e)}
  gold=999999;hero.lvl=50;sup.f_meat=5;sup.meat=7;hsDirty();hud();ui();return [party.length,eggs.length]}"""

def start(pg,dev='desktop'):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=%s]'%dev,timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)

def shot(pg,name):
    p=OUT+'/v92_%s_%s.png'%(name,TAG);pg.screenshot(path=p,timeout=180000,animations='disabled');print('shot',p)

# overlap check: visible text elements inside a window whose boxes intersect another text element's box, or that spill out of their row
OVL="""(sel)=>{const W=document.querySelector(sel);if(!W)return 'nowin';const out=[];
  const els=[...W.querySelectorAll('b,small,span,em,i.kqi,.rn,.ra,.mut,button,h2,.wsub')].filter(e=>{const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return false;const cs=getComputedStyle(e);return cs.visibility!='hidden'&&cs.display!='none'&&e.textContent.trim()&&!e.closest('.ceh')});
  const vis=e=>{let p=e.parentElement;const r=e.getBoundingClientRect();while(p&&p!==W){const cs=getComputedStyle(p);if(/(auto|scroll|hidden)/.test(cs.overflow+cs.overflowY+cs.overflowX)){const q=p.getBoundingClientRect();if(r.bottom<=q.top+1||r.top>=q.bottom-1||r.right<=q.left+1||r.left>=q.right-1)return false}p=p.parentElement}return true};
  const L=els.filter(vis);
  // text spilling sideways out of its row/button (no ellipsis)
  L.forEach(e=>{const row=e.closest('.rw,button,.kv,.cbar');if(!row||row===e)return;const a=e.getBoundingClientRect(),b=row.getBoundingClientRect();if(a.right>b.right+2||a.left<b.left-2||a.bottom>b.bottom+3)out.push('spill:'+e.tagName+':'+e.textContent.trim().slice(0,30)+' in '+row.className.slice(0,20))});
  // leaf text boxes overlapping each other (siblings in different rows)
  const leaf=L.filter(e=>!e.querySelector('b,small,span,em,button')&&e.tagName!='BUTTON');
  for(let i=0;i<leaf.length;i++)for(let j=i+1;j<leaf.length;j++){const a=leaf[i],b=leaf[j];if(a.contains(b)||b.contains(a))continue;const p=a.getBoundingClientRect(),q=b.getBoundingClientRect();
    const ix=Math.min(p.right,q.right)-Math.max(p.left,q.left),iy=Math.min(p.bottom,q.bottom)-Math.max(p.top,q.top);if(ix>3&&iy>3)out.push('overlap:'+a.textContent.trim().slice(0,24)+' / '+b.textContent.trim().slice(0,24))}
  return out.slice(0,40)}"""

def menus(pg,tag):
    ev=pg.evaluate;P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:1500])
    P('crowd',CROWD);pg.wait_for_timeout(1500)
    res={}
    ev("()=>{openCmp();$('cl').scrollTop=0}");pg.wait_for_timeout(1500);shot(pg,tag+'_cmp_eggs')
    res['cmp_eggs']=ev(OVL,'#cmp')
    ev("()=>{const b=document.querySelector('#cl [data-i]');if(b)b.scrollIntoView();}");pg.wait_for_timeout(800);shot(pg,tag+'_cmp_list')
    res['cmp_list']=ev(OVL,'#cmp')
    ev("()=>{$('cl').scrollTop=$('cl').scrollHeight}");pg.wait_for_timeout(600);shot(pg,tag+'_cmp_end')
    for k in ['ov','st','sp','care','tal']:
        ev("(k)=>{CE.sel=null;cmpSel=0;rC();KQM.ctab=k;kqmCApply(true)}",k);pg.wait_for_timeout(900);shot(pg,tag+'_cmp_tab_'+k);res['tab_'+k]=ev(OVL,'#cmp')
    ev("()=>{const e=eggs.find(x=>!eggRdy(x));if(e){CE.sel=e.id;rC()}}");pg.wait_for_timeout(900);shot(pg,tag+'_cmp_egg')
    res['egg']=ev(OVL,'#cmp')
    ev("()=>{$('cmp').classList.add('hide');held=null;sel=[];rF();$('fz').classList.remove('hide')}");pg.wait_for_timeout(1200);shot(pg,tag+'_fuse')
    res['fuse']=ev(OVL,'#fz')
    ev("()=>{sel=[0];rF()}");pg.wait_for_timeout(800);shot(pg,tag+'_fuse_sel');res['fuse_sel']=ev(OVL,'#fz')
    ev("()=>{sel=[0];fOpt='con';rF()}");pg.wait_for_timeout(800);shot(pg,tag+'_fuse_con');res['fuse_con']=ev(OVL,'#fz')
    ev("()=>{$('fz').classList.add('hide');openX('visitor','trainer')}");pg.wait_for_timeout(1200);shot(pg,tag+'_trainer');res['trainer']=ev(OVL,'#xw')
    ev("()=>{$('xw').classList.add('hide');$('inc').classList.remove('hide');try{rI()}catch(e){}}");pg.wait_for_timeout(900);shot(pg,tag+'_inc');res['inc']=ev(OVL,'#inc')
    ev("()=>{$('inc').classList.add('hide')}")
    # render churn: how often #cl is rebuilt per second while the window sits open
    ev("()=>{openCmp();window._mut=0;window._mo=new MutationObserver(m=>{window._mut+=m.length});_mo.observe($('cl'),{childList:true,subtree:true})}");pg.wait_for_timeout(4000)
    res['churn_4s']=ev("()=>{_mo.disconnect();return window._mut}")
    for k,v in res.items():print('  ',k,v if isinstance(v,(int,str)) else (len(v),v[:6]))
    return res

def s(pg):
    ev=pg.evaluate;P=lambda n,c:print(n,'=>',json.dumps(ev(c))[:1500])
    start(pg)
    if 'emp' in PART:
        P('hatch',"()=>{for(let i=0;i<2;i++)hatch(Object.assign(rollEgg(1),{basic:true}));hud();return party.map(c=>c.n)}")
        r=ev("""()=>{const c=party[0],h0=heroMax();toggleEmp(0);const on=c.emp,h1=heroMax();
          compRegen(5,performance.now());const L5=c.empL;cbarsRender();const b=document.querySelector('#cbars button[data-e="0"]');
          const t5=b&&b.dataset.t,cls=b&&b.className,tip=b&&b.title;
          compRegen(10.2,performance.now());const off=c.emp,cd=c.empCd,h2=heroMax();toggleEmp(0);const blocked=!c.emp;cbarsRender();
          const t2=b&&document.querySelector('#cbars button[data-e="0"]').dataset.t;compRegen(30,performance.now());const cd2=c.empCd;compRegen(31,performance.now());
          const cd3=c.empCd;toggleEmp(0);const again=c.emp;compRegen(3,performance.now());toggleEmp(0);const early=[c.emp,c.empCd];
          const d=party[1];toggleEmp(1);const both=d.emp;d.h=0;compRegen(.1,performance.now());const faint=[d.emp,d.empCd];
          return {on,h0,h1,L5,t5,cls,tip,off,cd,h2,blocked,t2,cd2,cd3,again,early,both,faint}}""")
        print('emp',json.dumps(r))
        ok(r['on'] and r['h1']>r['h0'],'empower turns on and raises max health')
        ok(abs(r['L5']-10)<.01 and r['t5']=='10','10s left after 5s, shown on the button')
        ok(r['off']==False and r['cd']==60 and r['h2']==r['h0'],'empower ends by itself after 15s, 60s rest, stats back')
        ok(r['blocked'] and r['t2']=='60','cannot empower while resting; button shows 60')
        ok(abs(r['cd2']-30)<.01 and r['cd3']==0 and r['again'],'rest counts down, then it can empower again')
        ok(r['early'][0]==False and r['early'][1]==12,'ending early after 3s gives a 12s rest')
        ok(r['both'] and r['faint'][0]==False and r['faint'][1]>0,'second companion empowers too; fainting ends it with a rest')
        # old save with an empower flag: loads with emp=false; a leftover timer becomes a rest
        r=ev("()=>{const c=party[0];c.emp=false;c.empL=7;c.empCd=0;compRegen(.1,performance.now());return [c.emp,c.empL,c.empCd]}")
        ok(r[0]==False and r[1]==0 and r[2]>0,'leftover timer from a save turns into a rest %s'%r)
        ev("()=>{party.forEach(c=>{c.emp=false;c.empL=0;c.empCd=0;c.h=M(c)});party[0].emp=false;toggleEmp(0);party[1].empCd=41;compRegen(.016,performance.now());cbarSig='';hud()}")
        pg.wait_for_timeout(1500);ev("()=>compRegen(4.3,performance.now())");pg.wait_for_timeout(600)
        pg.locator('#cbars').screenshot(path=OUT+'/v92_emp_bars_%s.png'%TAG,timeout=120000,animations='disabled')
        shot(pg,'emp_hud')
    if 'feed' in PART:
        if not ev("()=>party.length"):ev("()=>{for(let i=0;i<2;i++)hatch(Object.assign(rollEgg(1),{basic:true}));hud()}")
        r=ev("""()=>{party[0].n='Stoneshell';sup.f_meat=2;sup.meat=3;cbarSig='';hud();const b=document.querySelector('#cbars button[data-fd="0"]');return [b.title,feedList()[0],Math.round(feedVal(feedList()[0])*100)]}""")
        print('feed title',r)
        ok('heals' in r[0] and '8s' in r[0] and str(r[2])+'%' in r[0],'feed title names the food, the % healed and the 8 s')
        bb=pg.locator('#cbars button[data-fd]').first.bounding_box()
        pg.mouse.click(bb['x']+8,bb['y']+8);pg.wait_for_timeout(700)
        r=ev("()=>{const d=$('mhint');return d?getComputedStyle(d).display+' '+d.innerText:'none'}")
        ok(not r.startswith('block'),'no material hint pops up from the feed button (%s)'%r[:60])
        r=ev("()=>{const c=party[0];c.h=Math.round(M(c)*.3);return [document.querySelector('#cbars button[data-fd=\"0\"]').title]}")
    if 'eggs' in PART:
        # the real loot code runs; only the last step (making the 3D drop) is swapped for a counter, so 10,000s of kills are quick.
        # lootE_base is the kill loot (monsters, elites, wave-trial mobs, Sovereigns); stdLoot is every random chest
        # (hidden caches, buried treasure, event chests). EGG92.rate=1 is the old rate, .65 the new one.
        r=ev("""()=>{const D=dn,F=EGG92.f;dn=()=>{};let n=0;EGG92.f=function(k){if(k=='egg')n++};
          const sim=(rate,fn,N)=>{EGG92.rate=rate;n=0;for(let i=0;i<N;i++)fn();return n};
          const mob=(al,bs)=>()=>lootE_base({c:{l:20,al:al?1:0,boss:bs?1:0,zt:2,en:'',g:['Foxlet'],iv:{hp:1,a:1,d:1}},m:{position:new THREE.Vector3(0,0,0)}});
          const P=new THREE.Vector3(),r={};
          try{for(const [k,fn,N] of [['mob',mob(0,0),40000],['elite',mob(1,0),8000],['boss',mob(0,1),300],['chest',()=>stdLoot(P,2,{egg:.3}),6000]])r[k]=[sim(1,fn,N),sim(.65,fn,N),N]}
          finally{EGG92.rate=.65;EGG92.f=F;dn=D}return r}""")
        print('eggs',json.dumps(r))
        for k in ['mob','elite','chest']:
            b,a,n=r[k];ok(b>0 and abs(a/b-.65)<.08,'%s: %d eggs before vs %d after in %d (x%.2f; %.2f%% -> %.2f%%)'%(k,b,a,n,a/max(1,b),100*b/n,100*a/n))
        b,a,n=r['boss'];ok(b==n and a==n,'boss egg stays guaranteed: %d/%d before, %d/%d after'%(b,n,a,n))
        r=ev("()=>bTurnIn.toString().includes('EGG92')")
        ok(r,'bounty-board egg chance uses EGG92.rate')
    if 'menus' in PART:
        res=menus(pg,'desk')
        bad={k:v for k,v in res.items() if isinstance(v,list) and v}
        ok(not bad,'no overlapping or spilling text in the companion menus (desktop) %s'%json.dumps(bad)[:600])
        ok(res['churn_4s']<60,'the companion list is not rebuilt every frame (%d mutations in 4 s)'%res['churn_4s'])
    logs=open(OUT+'/lastlogs.txt').read() if os.path.exists(OUT+'/lastlogs.txt') else ''

def smob(pg):
    start(pg,'mobile');res=menus(pg,'mob')
    bad={k:v for k,v in res.items() if isinstance(v,list) and v}
    ok(not bad,'no overlapping or spilling text in the companion menus (phone) %s'%json.dumps(bad)[:600])

play.run(s,w=1280,hh=800)
errs=[l for l in open(OUT+'/lastlogs.txt').read().split('\n') if 'PAGEERROR' in l];ok(not errs,'no page errors %s'%errs[:3])
if 'menus' in PART and os.environ.get('MOB','1')=='1':
    play.run(smob,w=760,hh=400)
    errs=[l for l in open(OUT+'/lastlogs.txt').read().split('\n') if 'PAGEERROR' in l];ok(not errs,'no page errors (phone) %s'%errs[:3])
print('FAILED:' if FAIL else 'ALL OK',FAIL)
