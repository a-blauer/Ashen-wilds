# Inventory: which creature rig every enemy / boss / species uses, and whether it is low-poly yet.
#   AW_TMP=/outdir python3 beasts_inv.py
import play,json
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=ev("""()=>{const out={en:{},sp:{},boss:[],specs:Object.keys(SPEC),lpr:Object.keys(LPR)};
      for(const k in EN){const e=EN[k];out.en[k]=[e.rig||'',e.hum||'',rigOf(k),!!LPR[rigOf(k)]?'LP':'',!!SPEC[rigOf(k)]?'S':'']}
      for(const k of SPK){const r=rigOf(k);(out.sp[r]=out.sp[r]||[]).push(k)}
      BOSSES.forEach((b,i)=>out.boss.push([b.name,b.sp,b.hum||'',rigOf(b.sp),!!LPR[rigOf(b.sp)]]));
      out.bioen=BIOEN;
      const pairs=[['Maggot','Gravewyrm'],['Hydra','Gravewyrm'],['Centipede','Gravewyrm'],['Scorpion','Cryptspider'],['EyeWolf','Ashwolf'],['IceWraith','Wispling']];
      out.same=pairs.map(([a,b])=>[a,b,SPEC[a].bones===SPEC[b].bones,JSON.stringify(SPEC[a].bones)==JSON.stringify(SPEC[b].bones),SPEC[a].anim,SPEC[a].sc,!!SPEC[a].T,SPEC[a].T===SPEC[b].T]);
      out.goo=SPEC.Goo.bones;out.spid=SPEC.Cryptspider.bones;out.spidlegs=SPEC.Cryptspider.legs;out.wisp=SPEC.Wispling.bones;out.wolfT=[0,.5,1].map(z=>SPEC.Ashwolf.T([0,.6,z]));out.wyrm=SPEC.Gravewyrm.bones;out.anims={};for(const k in SPEC)out.anims[k]=[SPEC[k].anim,SPEC[k].sc,SPEC[k].hd,SPEC[k].bk];return out}""")
    for k,v in r.items():print(k,json.dumps(v))
play.run(s)
