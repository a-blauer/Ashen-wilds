# v164 pictures: Cheddar's exclusive skins (3235) on the hero, a companion and a mount, from a free camera beside the hero.
#   python3 v164_skins_look.py -> <AW_TMP>/v164_skin_<view>.png     VIEWS=name,... CLS=warrior|assassin|mage|paladin|ranger
import play,os
VIEWS=[v for v in os.environ.get('VIEWS','').split(',') if v]
CLS=os.environ.get('CLS','warrior')
# name: skins worn {race,comp,mount}, ride?, camera offset from the hero [dx,dy,dz] (turned by the hero's facing), look-at height
V={'none':[{},0,[2.2,1.6,3.2],1.0],'lantern':[{'race':'lantern'},0,[0.45,1.5,1.05],1.38],'sun':[{'race':'sun'},0,[0.45,1.5,1.05],1.38],
   'rime':[{'comp':'rime'},0,[2.6,1.6,3.4],.6],'wraith':[{'comp':'wraith'},0,[2.6,1.6,3.4],.6],
   'storm':[{'mount':'storm'},1,[3.4,2.2,3.6],1.1],'blood':[{'mount':'blood','race':'lantern'},1,[3.4,2.2,3.6],1.1],'mount0':[{},1,[3.4,2.2,3.6],1.1]}
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="'+CLS+'"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    pg.add_style_tag(content='#hud,#acts,#mini,#glog,#pk,#chqt132,#locBox,.dn,#hint,#mqt143,#mqt152,.zt116,#zt116{display:none!important}')
    pg.evaluate("""()=>{SKN164.u=Object.keys(SKN164.D);if(!mounts.length)newMount(window.MK||MNTK.find(k=>/horse|destrier|steed|charger/.test(k))||MNTK[0]);
      const f=POST.render;POST.render=function(){try{if(window.CAMO){const o=window.CAMO,P=pl.position,a=window.CAMY||0,c=Math.cos(a),s=Math.sin(a);
        cam.position.set(P.x+o.p[0]*c-o.p[2]*s,P.y+o.p[1],P.z-o.p[0]*s-o.p[2]*c);cam.lookAt(P.x+(o.lx||0)*c,P.y+o.t,P.z-(o.lx||0)*s);if(!riding){pl.rotation.y=Math.atan2(cam.position.x-P.x,cam.position.z-P.z)+(o.ry||0)}cam.updateMatrixWorld(true)}}catch(e){}return f.apply(this,arguments)};
      window.CAMY=pl.rotation.y;return 1}""")
    pg.wait_for_timeout(3000)
    for k,q in V.items():
        if VIEWS and k not in VIEWS:continue
        pg.evaluate("""(q)=>{const [w,ride]=q;SKN164.e={race:w.race||null,comp:w.comp||null,mount:w.mount||null};skn164Refresh();
          if(ride&&!riding)toggleMount();if(!ride&&riding)dismount(true);
          const f=fols[0];if(f&&!ride){const a=pl.rotation.y+.9;f.position.set(pl.position.x+Math.sin(a)*1.6,f.position.y,pl.position.z+Math.cos(a)*1.6);f.rotation.y=pl.rotation.y}
          window.CAMY=pl.rotation.y;skn164Tick();return 1}""",[q[0],q[1]])
        pg.evaluate("(o)=>{window.CAMO={p:o[0],t:o[1],lx:o[2],ry:o[3]};return 1}",[q[2],q[3],0.4 if k in ('rime','wraith') else 0,-0.5 if k in ('rime','wraith') else (3.14159 if k in ('lantern','sun','none') else 0)])
        pg.wait_for_timeout(3500)
        pg.screenshot(path=play.TMP+'/v164_skin_'+k+'.png',timeout=600000);print('shot',k)
play.run(s,w=1100,hh=760)
