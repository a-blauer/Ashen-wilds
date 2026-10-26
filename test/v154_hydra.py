# v154: the Gate of the Hydra (Hillside Crest III main quest): the great door replaces the Den portal and is locked; five Wind
# Stones stand on open ground off the road, reachable, apart; turning a vane to face the door lights its head; with five winds the
# song plays and must be repeated on the chime stones (a wrong stone replays the verse); three verses open the door; the doorway
# collider clears; F enters the Den; saves; old saves (Den reached = open).
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
fails=[]
def F(m):fails.append(m);print('FAIL',m)
JS=r"""async()=>{const out={},wait=ms=>new Promise(r=>setTimeout(r,ms)),errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(String).join(' ').slice(0,300));oe(...a)};
  let T=performance.now();const tick=(sec)=>{for(let i=0;i<Math.round(sec*30);i++){T+=33;homeTick(1/30,T)}};
  const I=INSL[7];toPos(I.ba[0],I.ba[1]);tick(.3);const G=SP152.gates.hydra,D=G.spot;out.built=!!G.g&&!!HD154.S;const r=RPORT.find(q=>q.k=='next'&&q.ig===7);out.portalHidden=!r||!r.g.visible;
  const Pl=hd154Plan();out.stones=Pl.st.map(o=>({x:o.x,z:o.z,fb:o.fb||0,ins:(insAt(o.x,o.z)||{}).g,dDoor:Math.round(Math.hypot(o.x-D.x,o.z-D.z)),dEn:Math.round(Math.hypot(o.x-I.en[0],o.z-I.en[1]))}));
  out.minApart=99;Pl.st.forEach((a,i)=>Pl.st.forEach((b,j)=>{if(j>i)out.minApart=Math.min(out.minApart,Math.round(Math.hypot(a.x-b.x,a.z-b.z)))}));
  // the shut door: locked prompt, the doorway is blocked
  toPos(D.x-D.ux*3,D.z-D.uz*3,D.ry);tick(.1);out.locked=(worldPrompt()||{}).label||'';
  {const x=D.x+D.ux*.0,z=D.z+D.uz*.0;out.blockShut=HD154.S.blkDoor.some(k=>CBLK.has(k))}
  // each stone: reach it on foot (a free tile beside it), then turn the vane until it faces the door
  out.reach=[];out.turns=[];for(let j=0;j<5;j++){const o=Pl.st[j];let got=null;for(const [dx,dz] of [[2,0],[-2,0],[0,2],[0,-2],[2,2],[-2,-2]]){if(!solid(o.x+dx,o.z+dz)){got=[o.x+dx,o.z+dz];break}}
    out.reach.push(!!got);if(!got)continue;toPos(got[0],got[1]);tick(.05);const p=worldPrompt()||{};let n=0;if(!/Wind Stone/.test(p.label||'')){out.turns.push('noPrompt:'+p.label);continue}
    while(!HD154.on[j]&&n<9){(worldPrompt()).fn();n++;tick(.05)}out.turns.push(n)}
  tick(.6);out.n=hd154N();out.headsLit=HD154.S.heads.filter(h=>h.m.visible).length;out.ribbons=HD154.S.ribbons.filter(r=>r.visible).length;
  // turning one away again switches it off
  {const o=Pl.st[0];toPos(o.x+2,o.z);if(solid(o.x+2,o.z))toPos(o.x-2,o.z);tick(.05);worldPrompt().fn();out.offAgain=HD154.on[0]===0;for(let i=0;i<7;i++)worldPrompt().fn();out.onAgain=HD154.on[0]===1}
  out.trk=JSON.stringify(SP152.trk.hydra(I));
  // the song
  toPos(D.x-D.ux*3,D.z-D.uz*3,D.ry);tick(.1);out.listen=(worldPrompt()||{}).label||'';worldPrompt().fn();out.sing=HD154.song&&HD154.song.mode;
  const strikeAt=j=>{const c=Pl.ch[j];toPos(c.x-D.ux*1.2,c.z-D.uz*1.2);tick(.03);const p=worldPrompt()||{};if(!/chime/.test(p.label||''))return 'noPrompt:'+p.label;p.fn();tick(.03);return 1};
  out.verses=[];for(let v=0;v<3;v++){let w=0;while(HD154.song&&HD154.song.mode!='play'&&w<400){tick(.1);w++}
    if(!HD154.song){out.verses.push('noSong');await wait(2400);tick(.1);continue}const seq=HD154.song.seq.slice();
    if(v==1){// one mistake first: the verse is sung again
      const bad=(seq[0]+1)%5;out.wrongP=strikeAt(bad);out.wrong=HD154.song.mode;await wait(1800);tick(.1);out.resung=HD154.song&&HD154.song.mode;w=0;while(HD154.song&&HD154.song.mode!='play'&&w<400){tick(.1);w++}}
    const res=seq.map(j=>strikeAt(j));out.verses.push([seq.length,res.join(''),HD154.v]);await wait(2500);tick(.2)}
  await wait(1200);tick(6.5);out.st=HD154.st;out.leafRot=+HD154.S.leafs[0].g.rotation.y.toFixed(2);out.blockOpen=HD154.S.blkDoor.some(k=>CBLK.has(k));
  toPos(D.x-D.ux*3,D.z-D.uz*3,D.ry);tick(.1);out.enter=(worldPrompt()||{}).label||'';out.trkDone=SP152.trk.hydra(I);
  // saves
  const sv=x2Save();out.saved=JSON.stringify(sv.hd154);const old=JSON.parse(JSON.stringify(sv));delete old.hd154;x2Load(old);out.oldSt=HD154.st;out.oldN=hd154N();
  x2Load(sv);out.reSt=HD154.st;
  {const s2=JSON.parse(JSON.stringify(sv));s2.hd154={v:154,st:1,vane:Pl.st.map(o=>o.want),on:[1,1,1,1,1],vs:1};x2Load(s2);out.midN=hd154N();out.midV=HD154.v;out.midDone=hd154Done()}
  // the door picture positions (for v154_look)
  out.door=[+D.x.toFixed(1),+D.z.toFixed(1)];out.errs=errs.slice(0,6);return out}"""
def s(pg):
    pg.set_default_timeout(1200000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=240000);pg.click('[data-c="warrior"]',timeout=240000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS);print(json.dumps(r)[:3000])
    exp=lambda c,m:(None if c else F(m))
    exp(r['built'] and r['portalHidden'],'III: the great door is built and the old portal hidden')
    exp('0/5' in r['locked'] and r['blockShut'],'the shut door is locked and blocks the doorway (%s)'%r['locked'])
    st=r['stones'];exp(all(o['ins']==7 and not o['fb'] for o in st),'all five Wind Stones stand in III on open ground (%s)'%st)
    exp(r['minApart']>=26 and all(o['dDoor']>=24 and o['dEn']>=20 for o in st),'the stones are spread out (closest %s)'%r['minApart'])
    exp(all(r['reach']) and all(isinstance(n,int) and 1<=n<=7 for n in r['turns']),'each stone can be reached and turned to face the door (%s)'%r['turns'])
    exp(r['n']==5 and r['headsLit']==5 and r['ribbons']==5,'five winds: five heads lit, five ribbons (%s %s %s)'%(r['n'],r['headsLit'],r['ribbons']))
    exp(r['offAgain'] and r['onAgain'],'turning a vane away switches its wind off again')
    exp('Listen' in r['listen'] and r['sing']=='sing','with five winds the door sings (%s)'%r['listen'])
    v=r['verses'];exp(len(v)==3 and all(isinstance(q,list) for q in v) and [q[0] for q in v]==[3,4,5] and all(set(q[1])=={'1'} for q in v),'three verses of 3, 4, 5 notes are repeated on the chime stones (%s)'%v)
    exp(r.get('wrongP')==1 and r.get('wrong')=='wrong' and r.get('resung') in ('sing','play'),'a wrong chime: the heads hiss and sing the verse again (%s %s)'%(r.get('wrong'),r.get('resung')))
    exp(r['st']==2 and abs(r['leafRot'])>1 and not r['blockOpen'],'the song opens the doors and clears the doorway (%s %s %s)'%(r['st'],r['leafRot'],r['blockOpen']))
    exp('Hydra' in r['enter'] and 'Enter' in r['enter'] and r['trkDone'] is None,'F at the open door enters the Den (%s)'%r['enter'])
    exp(r['oldSt']==0 and r['oldN']==0 and r['reSt']==2,'saves: new saves start closed with vanes off the door, and the open door is remembered')
    exp(r['midN']==5 and r['midV']==1 and not r['midDone'],'a save mid-song keeps the winds and the verse')
    exp(not r['errs'],'no console errors (%s)'%r['errs'])
    for e in errs[:5]:F('page error '+e)
    print('v154 hydra:',len(fails),'fails')
play.run(s)
