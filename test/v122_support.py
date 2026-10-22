# v122: companion heal / shield / buff spells go to whoever needs it most (the hero or a companion).
#   python3 v122_support.py
import os,json,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
fails=[]
def s(pg):
    L.start(pg);ev=pg.evaluate
    r=ev("""()=>{const R={};const ok=(k,v)=>{R[k]=v};
      const p=PMAP[0].path[60];toPos(p[0],p[1]);hero.lvl=50;STEP(.5);
      const SPF=n=>{for(const k of SPK){if(SP2[k][8]==n)return k}for(const f in EVSP)if(EVSP[f].includes(n))return famTier(f,1);return 'Foxlet'};
      const mk=n=>{const c=hatch(Object.assign(mkEgg(SPF(n),0,1),{basic:true}));c.l=50;c.h=M(c);c.sp=[n];c.cdm={};c.emp=false;return c};
      const A=mk('Mend'),B=mk('Hamstring Bite');party=[A,B].concat(party.filter(q=>q!==A&&q!==B)).slice(0,3);cmpSel=0;ui();STEP(.1);
      const P=pl.position,fa=fols[0],fb=fols[1];fa.position.set(P.x+1.5,0,P.z);fb.position.set(P.x-1.5,0,P.z);
      enemies.slice().forEach(e=>{if(e.agg)e.agg=0});
      // heal: the companion at 30% is picked over the hero at 90%
      hero.hp=heroMax()*.9;B.h=M(B)*.3;ok('heal_pick_comp',supPick122(A,fa,CSP['Mend'])===fb);
      // heal: the hero at 40% is picked over a companion at 60%
      hero.hp=heroMax()*.4;B.h=M(B)*.6;ok('heal_pick_hero',supPick122(A,fa,CSP['Mend'])===pl);
      // nobody hurt: no cast
      hero.hp=heroMax();B.h=M(B);A.h=M(A);ok('heal_none',supPick122(A,fa,CSP['Mend'])===null);
      // the healer can heal itself
      A.h=M(A)*.2;ok('heal_self',supPick122(A,fa,CSP['Mend'])===fa);A.h=M(A);
      // casting on a companion heals it and leaves the hero alone (plain cast, no motion)
      FX105.on=0;hero.hp=heroMax()*.9;const hh=hero.hp;B.h=M(B)*.3;const b0=B.h;compCast(A,fa,CSP['Mend'],null,fb);
      ok('heal_applied',{gain:Math.round(B.h-b0),want:Math.round(M(B)*.2),hero_same:hero.hp===hh});
      // shield: an enemy fighting companion B makes B the shield target
      const e=spawnEnemy(EN.goo?'goo':Object.keys(EN)[0],fb.position.x-1,fb.position.z,30,{});e.__d=1;e.agg=1;e.atk={tg:fb};e.cd=99;
      hero.hp=heroMax();B.h=M(B)*.8;
      ok('shield_pick',supPick122(A,fa,CSP['Earthen Bulwark'])===fb);
      compCast(A,fa,CSP['Earthen Bulwark'],null,fb);const sh=sup122Shield(B);ok('shield_val',Math.round(sh)>0);
      // a hit on B is soaked by the shield
      const hb=B.h;e.atk=null;hitTarget(e,fb,.5);ok('shield_absorb',{hp_same:B.h===hb,shield_left:Math.round(sup122Shield(B)),was:Math.round(sh)});
      // B is now shielded, so the next shield goes elsewhere (the hero)
      ok('shield_next',supPick122(A,fa,CSP['Earthen Bulwark'])===pl);
      // buff: the hero gets the attack buff first; once the hero has it, the fighting companion gets it
      e.m.position.set(P.x+.5,0,P.z+1.5);hero.buffs=[];
      const b1=supPick122(A,fa,CSP['Pack Howl']);ok('buff_hero',b1===pl);compCast(A,fa,CSP['Pack Howl'],null,pl);
      e.m.position.set(fb.position.x-1,0,fb.position.z);
      const b2=supPick122(A,fa,CSP['Pack Howl']);ok('buff_comp',b2===fb);
      const pa0=cStat(B,'pa');compCast(A,fa,CSP['Pack Howl'],null,fb);ok('buff_stat',+(cStat(B,'pa')/pa0).toFixed(3));
      fa.position.set(P.x+6,0,P.z);ok('buff_none',supPick122(A,fa,CSP['Pack Howl'])===null);
      // full loop with the motion: a wounded companion gets healed by the Mend companion on its own
      FX105.on=1;SUP122.clear();hero.buffs=[];A.cdm={};B.h=M(B)*.25;const c0=B.h;STEP(3);ok('loop_heal',{before:Math.round(c0),after:Math.round(B.h),max:Math.round(M(B))});
      // nothing saved: the companion objects carry no new fields
      ok('save_clean',!Object.keys(B).some(k=>/122|sup/i.test(k)));
      ok('desc',CSP['Mend'].d);
      return R}""")
    print(json.dumps(r,indent=1))
    chk=lambda k,c:(None if c else fails.append(k))
    chk('heal_pick_comp',r['heal_pick_comp']is True);chk('heal_pick_hero',r['heal_pick_hero']is True);chk('heal_none',r['heal_none']is True)
    chk('heal_self',r['heal_self']is True);h=r['heal_applied'];chk('heal_applied',abs(h['gain']-h['want'])<=1 and h['hero_same'])
    chk('shield_pick',r['shield_pick']is True);chk('shield_val',r['shield_val']is True)
    a=r['shield_absorb'];chk('shield_absorb',a['hp_same'] and a['shield_left']<a['was'])
    chk('shield_next',r['shield_next']is True);chk('buff_hero',r['buff_hero']is True);chk('buff_comp',r['buff_comp']is True)
    chk('buff_stat',abs(r['buff_stat']-1.15)<.01);chk('buff_none',r['buff_none']is True)
    lh=r['loop_heal'];chk('loop_heal',lh['after']>lh['before']+lh['max']*.1);chk('save_clean',r['save_clean']is True)
play.run(s)
print('FAILS',fails) if fails else print('ALL_OK')
sys.exit(1 if fails else 0)
