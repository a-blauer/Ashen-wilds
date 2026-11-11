# v213: the bigger Inn (room size, walls and porch cut away from inside, roof hidden, colliders, rest prompt) and Fate's Hand,
# the card table (pay rules, house edge, the prompt, a hand dealt with Space, gold, the cards laid on the table, Esc leaves).
# v213b: the panel only has the bets and the pay list; the result plaque on the table; the head-on seat camera with the hero hidden;
# the dealer's arms settle after hands. Every check prints FAIL … on a wrong result. SHOTS=1 also writes out/v213_table.png.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=r"""()=>{const out={},F=[];window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;try{loop(VT)}catch(err){out.err=String(err).slice(0,200)}}};
 const key=(k,up)=>{document.body.dispatchEvent(new KeyboardEvent(up?'keyup':'keydown',{key:k,bubbles:true,cancelable:true}))};
 // ---- the Inn ----
 {const l=dm196Fix('inn');out.inn={w:l.w,d:l.d,r:l.r,W2:DM196I.W2,D2:DM196I.D2};if(!(DM196I.W2*DM196I.D2>=5.5*4*1.4))F.push('the Inn is not 40% bigger: '+DM196I.W2+' x '+DM196I.D2);
  if(l.w!==DM196I.W2||l.d!==DM196I.D2)F.push('the lot footprint does not match the room');
  // nothing of it on the avenue (|x| < 1.6 from the fountain) or through the first town wall (r 21)
  const T=TOWNS[0];let av=0,wall=0;for(const [u,v] of [[-1,-1],[-1,1],[1,-1],[1,1]]){const [x,z]=lotW103(l,u*(DM196I.W2+.3),v*(DM196I.D2+.3)),lx=x-T.cx,lz=z-T.cy;if(Math.abs(lx)<1.6)av++;if(Math.hypot(lx,lz)>DM196.WR[0]-.4)wall++}
  out.inn.av=av;out.inn.wall=wall;if(av)F.push('an Inn corner stands on the avenue');if(wall)F.push('an Inn corner goes through the town wall');
  const [ix,iz]=lotW103(l,0,0);toPos(ix,iz,l.ry);STEP(40);out.inn.inside=DM196I.inside;out.inn.roof=DM196I.roof.visible;out.inn.cut=Object.assign({},DM196I.cut||{});
  if(!DM196I.inside||DM196I.roof.visible)F.push('inside the Inn the roof still shows');
  // the camera stands outside the wall behind the hero (it looks toward the back wall): that wall is cut, the porch with it if it is the front
  const lc=dm196InnLocal(cam.position.x,cam.position.z);out.inn.camL=lc.map(v=>+v.toFixed(2));
  const sides={f:lc[1]>DM196I.D2-.35,b:lc[1]<-DM196I.D2+.35,l:lc[0]<-DM196I.W2+.35,r:lc[0]>DM196I.W2-.35};
  for(const sd in sides){if(sides[sd]&&DM196I.w[sd].visible)F.push('the '+sd+' wall between the camera and the hero is not cut');if(!sides[sd]&&!DM196I.w[sd].visible)F.push('the '+sd+' wall is cut though the camera is not behind it')}
  if(sides.f&&DM196I.outF.visible)F.push('the porch still shows over the cut front wall');
  const [ox,oz]=lotW103(l,0,DM196I.D2+5);toPos(ox,oz,l.ry);STEP(40);out.inn.out=[DM196I.roof.visible].concat(Object.values(DM196I.w).map(g=>g.visible),DM196I.outF.visible);
  if(out.inn.out.some(v=>!v))F.push('outside the Inn a wall, the porch or the roof stays hidden');
  // the walls stop you; the doorway lets you in
  const [bx,bz]=lotW103(l,0,-DM196I.D2);out.inn.backCol=DM196S.col.some(c=>Math.hypot(c.x-bx,c.z-bz)<.4);if(!out.inn.backCol)F.push('no collider on the back wall');
  const [dx,dz]=lotW103(l,0,DM196I.D2);out.inn.doorCol=DM196S.col.some(c=>Math.hypot(c.x-dx,c.z-dz)<.5);if(out.inn.doorCol)F.push('the doorway is blocked');
  const [tx,tz]=T.tv;toPos(tx,tz);STEP(5);promptTick();out.inn.rest=PR&&PR.label;if(!/Rest at/.test(out.inn.rest||''))F.push('the rest prompt at the bar is gone: '+out.inn.rest)}
 // ---- the rules ----
 {const P=c=>cd213Pay(c).m;const C=[[['crown','crown','crown'],50],[['wild','wild','wild'],100],[['crown','wild','crown'],50],[['hol','hol','hol'],13],[['lan','lan','hol'],1],
    [['lan','wild','hol'],1],[['lan','gob','fang'],0],[['hol','wild','wild'],2.5],[['lan','fang','wild'],1],[['eye','wild','wild'],25]]; // v218: pairs pay by card, three Hollows wake the dead
  out.rules=C.map(([c,m])=>{const g=P(c);if(g!==m)F.push(c.join('+')+' pays ×'+g+' (want ×'+m+')');return g});
  let ret=0,win=0;const N=60000;for(let i=0;i<N;i++){const m=P([cd213Roll(),cd213Roll(),cd213Roll()]);ret+=m;if(m>0)win++}out.rtp=+(ret/N).toFixed(3);out.winRate=+(win/N).toFixed(3);
  if(!(out.rtp>.8&&out.rtp<.96))F.push('house edge off: returns '+out.rtp+' of every gold bet');if(!(out.winRate>.33&&out.winRate<.5))F.push('win rate off: '+out.winRate)}
 // ---- the deck paints ----
 {const bad=[];CD213.order.concat(['back']).forEach(k=>{const t=cd213Can(k),c=t.image,d=c.getContext('2d').getImageData(c.width/2-20,c.height/2-20,40,40).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>200)n++;if(n<1000)bad.push(k)});
  out.paintBad=bad;if(bad.length)F.push('cards painted blank: '+bad.join(','))}
 // ---- a hand at the table ----
 {const l=DM196I.l,[sx,sz]=cd213L(-1.7,1.8);toPos(sx,sz,l.ry+Math.PI/2);STEP(10);promptTick();out.prompt=PR&&PR.label;if(!/Fate/.test(out.prompt||''))F.push('no card table prompt next to the table: '+out.prompt);
  PR.fn();STEP(5);out.open=CD213.open;if(!CD213.open)F.push('F did not sit you at the table');if($('cd213w').classList.contains('hide'))F.push('the card panel is hidden');
  if(uiOpen())F.push('the card panel pauses the game');
  STEP(60);const [cx,cz]=cd213L(CD213.cv[0],CD213.cv[2]);out.camD=+Math.hypot(cam.position.x-cx,cam.position.z-cz).toFixed(2);if(out.camD>.5)F.push('the table camera is not in place ('+out.camD+')');
  gold=1000;CD213.bet=50;const g0=gold;key(' ');out.busy=CD213.busy;if(!CD213.busy)F.push('Space did not deal');if(gold!==g0-50)F.push('the bet was not taken: '+(g0-gold));
  const p0=[pl.position.x,pl.position.z];STEP(30);const p1=[pl.position.x,pl.position.z];key('w');STEP(30);key('w',1);out.drift=+Math.hypot(p1[0]-p0[0],p1[1]-p0[1]).toFixed(2);out.walked=+Math.hypot(pl.position.x-p1[0],pl.position.z-p1[1]).toFixed(2);if(out.walked>.05)F.push('W walked away mid-hand');
  STEP(200);out.res=CD213.res&&{c:CD213.res.c,win:CD213.res.win};if(CD213.busy||!CD213.res)F.push('the hand never finished');else{const want=Math.floor(50*cd213Pay(CD213.res.c).m);if(CD213.res.win!==want)F.push('paid '+CD213.res.win+' (want '+want+')');if(gold!==g0-50+want)F.push('gold after the hand '+gold+' (want '+(g0-50+want)+')')}
  // v213b: the panel holds only the bets and what each card pays; the hand and its result are on the table
  out.panel={hand:document.querySelectorAll('#cd213w .cd213c').length,pay:document.querySelectorAll('#cd213w .cd213p').length,bets:document.querySelectorAll('#cd213w [data-cdb]').length};
  if(out.panel.hand)F.push('the panel still shows the dealt cards');if(out.panel.pay!==9||out.panel.bets!==4)F.push('the panel lacks the bets or the pay list: '+JSON.stringify(out.panel));
  out.plaque=!!(CD213.plq&&CD213.plq.parent&&CD213.plq.visible);if(!out.plaque)F.push('no result plaque over the table');
  out.heroHidden=!pl.visible;if(pl.visible)F.push('the hero blocks the table view');
  // the dealer's arms come back to rest after many hands (the old arm code stacked turns each frame and spun him)
  {const b=CD213.rig.bones,snap=()=>['aR0','aR1','chest'].map(n=>[b[n].rotation.x,b[n].rotation.y,b[n].rotation.z]);const s0=snap();
   for(let h=0;h<4;h++){gold=1000;CD213.busy=false;cd213Deal();STEP(240)}STEP(120);const s1=snap();let d=0;s0.forEach((r,i)=>r.forEach((v,j)=>d=Math.max(d,Math.abs(v-s1[i][j]))));out.armDrift=+d.toFixed(3);
   if(!(d<.35))F.push('the dealer\'s pose drifted after four hands: '+out.armDrift);if(s1.flat().some(v=>!isFinite(v)))F.push('the dealer\'s bones went NaN')}
  out.lay=CD213.lay.length;const faces=CD213.lay.map(m=>Math.abs(m.userData.f.rotation.z)<.05);if(CD213.lay.length!==3||faces.some(f=>!f))F.push('the three cards are not lying face up on the table');
  // the cards lie on the table top
  const tops=CD213.lay.map(m=>{const v=new THREE.Vector3();m.getWorldPosition(v);return +(v.y-TOWNS[0].ph).toFixed(2)});out.tops=tops;if(tops.some(y=>y<.68||y>.8))F.push('cards not on the table top: '+tops.join(','));
  gold=10;CD213.bet=50;const g1=gold;key('enter');if(gold!==g1||CD213.busy)F.push('dealt a hand without the gold for it');
  key('Escape');STEP(5);if(CD213.open)F.push('Esc did not leave the table');if(!pl.visible)F.push('the hero stays hidden after leaving the table');STEP(40);
  // the dealer stands behind the table
  const D=CD213.dealer;out.dealer=!!D;if(!D)F.push('no dealer')}
 out.F=F;return out}"""
SHOT=r"""()=>{const l=DM196I.l,T=TOWNS[0];const [sx,sz]=cd213L(-1.7,1.8);toPos(sx,sz,l.ry+Math.PI/2);for(let i=0;i<10;i++){VT+=16;loop(VT)}cd213Open();gold=500;cd213Deal();for(let i=0;i<240;i++){VT+=16;loop(VT)}ren.render=window.__rr;POST.render=window.__pr;POST.render();return 1}"""
fails=[]
def F(m):fails.append(m);print('FAIL',m)
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(3000)
    pg.evaluate("()=>{window.__rr=ren.render;window.__pr=POST.render}")
    r=pg.evaluate(JS);print(json.dumps(r))
    if r.get('err'):F('error '+r['err'])
    for m in r['F']:F(m)
    if os.environ.get('SHOTS'):
        pg.evaluate(SHOT);pg.screenshot(path=play.TMP+'/v213_table.png',timeout=600000)
    logs=open(play.TMP+'/lastlogs.txt').read() if os.path.exists(play.TMP+'/lastlogs.txt') else ''
play.run(s)
L=open(play.TMP+'/lastlogs.txt').read()
for l in L.split('\n'):
    if 'PAGEERROR' in l or 'v213' in l:F('page: '+l[:200])
print('v213 cards: checked' if not fails else 'CHECKS FAILED')
