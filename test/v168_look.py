# v168 pictures: the Frozen Maw's cave mouths (Burningeye I's road end; inside the cave the way out and the passage at the back,
# sealed and open), Gorthrak's Rimelock (the leap's ring, the window with the gold arc behind him), the Serpent Shrine's idol.
# VIEWS=name,... (default all) -> <AW_TMP>/v168_<view>.png
#   mouth · mouthFar · mouthIn (looking down the throat) · exitIn (the way out, from inside the cave) · passage (sealed) ·
#   passageOpen · passageIn (down the open passage) · warn (his leap's ring) · rlk (Rimelocked, hero behind him) · shrine · shrineSide
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
VIEWS=[v for v in os.environ.get('VIEWS','').split(',') if v]
ALL=['mouth','mouthFar','mouthIn','exitIn','passage','passageOpen','passageIn','warn','rlk','shrine','shrineSide']
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{TOD=.3;document.querySelectorAll('#banner,#glog,#ztc116,#mqt143,#boss').forEach(e=>e.style.display='none')}")
    for v in ALL:
        if VIEWS and v not in VIEWS:continue
        r=ev("""(v)=>{const out={};const hideE=()=>enemies.forEach(e=>{if(e.m&&!e.gb151)e.m.visible=false});
          if(v.startsWith('mouth')){const G=mq151Gate();insArrive(INSL[insG(2,0)]);toPos(G.x+G.fx*6,G.z+G.fz*6,G.ry);STEP(.3);hideE();const y=GH(G.x,G.z);
            if(v=='mouth')FC([G.x+G.fx*10-G.fz*3.5,y+3.4,G.z+G.fz*10+G.fx*3.5],[G.x,y+2.2,G.z]);
            else if(v=='mouthFar')FC([G.x+G.fx*22+G.fz*7,y+9,G.z+G.fz*22-G.fx*7],[G.x,y+2.8,G.z]);
            else {toPos(G.x+G.fx*12,G.z+G.fz*12,G.ry);STEP(.1);FC([G.x+G.fx*3.2,y+1.7,G.z+G.fz*3.2],[G.x-G.fx*6,y+1.3,G.z-G.fz*6])}
            STEP(.6);hideE();out.tris=GB168.tris}
          else if(v.startsWith('shrine')){const I=PMAP[1].ins[0];insArrive(I);const C=CAMPS.filter(C=>C.ig===I.g)[1];out.n=C&&C.th&&C.th.n;const r=C.r||12,a=.7;toPos(C.x+Math.sin(a)*r*.55,C.z+Math.cos(a)*r*.55,a);if(!C.g)buildCamp(C);STEP(.4);hideE();
            const y0=GH(C.x,C.z),lo=[];for(let k=0;k<8;k++){const b=k/8*6.283;lo.push(+(GH(C.x+Math.cos(b)*1.6,C.z+Math.sin(b)*1.6)-y0).toFixed(2))}out.rim=lo;
            if(v=='shrine')FC([C.x+Math.sin(a)*5.5,y0+3.0,C.z+Math.cos(a)*5.5],[C.x,y0+1.2,C.z]);else FC([C.x+Math.sin(a)*7,y0+.6,C.z+Math.cos(a)*7],[C.x,y0+.6,C.z]);STEP(.4);hideE()}
          else{if(!mq151InCave())mq151Enter();return 'enter'}
          return out}""",v)
        if r=='enter':
            pg.wait_for_timeout(900)
            r=ev("""(v)=>{const Lc=GB151L;STEP(.4);let e=MQ151.e;const out={};
              const t=Lc.tun,ty=GH(t.x,t.z),cx=Lc.cx,cz=Lc.cz,dx=t.x-cx,dz=t.z-cz,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l;
              if(v.startsWith('passage')||v=='exitIn'){MQ151.st=v=='passage'?1:2;if(v!='passage'&&e&&!e.dead){try{removeE(e)}catch(_){}MQ151.e=null;e=null}gb151LairSync();if(e)e.m.visible=false;
                if(v=='exitIn'){const m=Lc.mouth;toPos(cx,cz,0);STEP(.2);FC([cx+2.5,GH(cx,cz)+2.6,cz+5],[m.x,GH(m.x,m.z)+1.8,m.z])}
                else if(v=='passageIn'){toPos(t.x-ux*1.2,t.z-uz*1.2,0);STEP(.2);FC([t.x-ux*2.6,ty+1.7,t.z-uz*2.6],[t.x+ux*6,ty+1.2,t.z+uz*6])}
                else{toPos(cx,cz,0);STEP(.2);FC([cx+ux*6.5+uz*2.5,ty+2.6,cz+uz*6.5-ux*2.5],[t.x,ty+1.8,t.z])}}
              else{// the fight: Phase II, the Glacier Shell up, one leap
                if(!e||e.dead){MQ151.st=1;e=gb151Spawn(true)}const S=e.sv;toPos(Lc.home.x+1,Lc.home.z+5,0);gb151Start(e);STEP(.1);svEndMove(e,true);S.on=true;S.ph=2;e.bs.ph=2;e.c.h=Math.round(M(e.c)*.5);
                S.rp={n:1,hit:0};S.crk=1;S.shell=1;S.dr=.15;e.m.position.set(cx,0,cz-2);e.m.rotation.y=0;toPos(cx+1.5,cz+5,0);svStart(e,'rleap');
                if(v=='warn'){STEP(.8);FC([cx+8,GH(cx,cz)+7,cz+12],[cx+1,GH(cx,cz)+.5,cz+2.5])}
                else{STEP(1.75);const m=e.m,a=m.rotation.y;toPos(m.position.x-Math.sin(a)*3.2+Math.cos(a)*.8,m.position.z-Math.cos(a)*3.2-Math.sin(a)*.8,a);STEP(.25);out.rlk=!!S.rlk;out.mv=S.mv&&S.mv.id;out.behind=gb151Behind(e);
                  FC([m.position.x-Math.sin(a)*7.5+Math.cos(a)*4.5,GH(cx,cz)+4.2,m.position.z-Math.cos(a)*7.5-Math.sin(a)*4.5],[m.position.x,GH(cx,cz)+1.2,m.position.z])}}
              STEP(.3);return out}""",v)
        print(v,json.dumps(r))
        L.shot(pg,play.TMP+'/v168_'+v+'.png')
play.run(s,w=960,hh=600)
