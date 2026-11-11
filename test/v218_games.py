# v218: Fate's Hand's new pay rules (pairs by card, the special hands, the Wanderer's Road free hands and their save), the Ember Wheel
# (segments, odds, a spin lands where it says, stakes and pay, the partner replay), the Four Roads (the race, first to 5, pay and rout,
# the partner replay), the panels and keys, the hero hidden while playing, leaving, colliders, and the Blacksmith's lot clear of the Inn.
# Every check prints FAIL … on a wrong result. SHOTS=1 also writes out/v218_wheel.png and out/v218_race.png.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
JS=r"""()=>{const out={},F=[];window.VT=performance.now();performance.now=()=>VT;window.requestAnimationFrame=()=>0;POST.render=()=>{};ren.render=()=>{};
 const STEP=n=>{for(let i=0;i<n;i++){VT+=16;try{loop(VT)}catch(err){out.err=String(err).slice(0,200)}}};
 const key=(k,up)=>{document.body.dispatchEvent(new KeyboardEvent(up?'keyup':'keydown',{key:k,bubbles:true,cancelable:true}))};
 const l=DM196I.l;
 // ---- Fate's Hand: the rules ----
 {const P=c=>cd213Pay(c);const C=[[['lan','lan','fang'],1,'pair'],[['rav','rav','lan'],1.2,'pair'],[['crown','crown','hol'],3,'pair'],[['eye','wild','hol'],2,'pair'],[['wild','wild','hol'],2.5,'pair'],
    [['hol','hol','hol'],13,'sp'],[['wild','wild','wild'],100,'sp'],[['key','crown','eye'],15,'sp'],[['eye','fang','rav'],6,'sp'],[['gob','rav','key'],4,'sp'],[['key','rav','gob'],0,''],
    [['hol','wild','hol'],3,'sp'],[['gob','gob','gob'],8,'three'],[['gob','wild','gob'],8,'three'],[['lan','fang','hol'],0,''],[['hol','hol','lan'],0,'']];
  out.rules=C.map(([c,m,k])=>{const r=P(c);if(r.m!==m||r.kind!==k)F.push(c.join('+')+' pays ×'+r.m+' '+r.kind+' (want ×'+m+' '+k+')');return r.m});
  if(P(['wild','wild','wild']).free!==5)F.push('three Wanderers do not give 5 free hands');
  // the exact return over every hand (+ the free hands, doubled)
  const K=Object.keys(CD213.D),W=K.reduce((s,k)=>s+CD213.D[k].w,0);let ev=0,pw=0,pf=0;const sp={};
  for(const a of K)for(const b of K)for(const c of K){const p=CD213.D[a].w*CD213.D[b].w*CD213.D[c].w/W**3,r=P([a,b,c]);ev+=p*r.m;if(r.m>0)pw+=p;if(r.free)pf+=p;if(r.sp)sp[r.sp]=(sp[r.sp]||0)+p}
  out.rtp=+(ev+pf*5*2*ev).toFixed(4);out.winRate=+pw.toFixed(3);out.spOdds={};for(const k in sp)out.spOdds[k]=Math.round(1/sp[k]);
  if(!(out.rtp>.86&&out.rtp<.95))F.push('Fate’s Hand returns '+out.rtp+' of every gold bet');if(!(out.winRate>.35&&out.winRate<.5))F.push('Fate’s Hand win rate '+out.winRate);
  if(Object.keys(sp).length!==6)F.push('not every special hand can come up: '+Object.keys(sp))}
 // ---- Fate's Hand: free hands ----
 {const [sx,sz]=cd213L(-1.7,1.8);toPos(sx,sz,l.ry+Math.PI/2);STEP(10);cd213Open();STEP(20);gold=1000;CD213.bet=50;CD213.free=0;
  const Q=['wild','wild','wild','lan','lan','fang'];let qi=0;const R0=cd213Roll;cd213Roll=()=>Q[qi++];cd213Deal();STEP(240);
  out.road={free:CD213.free,freeBet:CD213.freeBet,gold};if(CD213.free!==5||CD213.freeBet!==50)F.push('the Wanderer’s Road gave '+CD213.free+' free hands at '+CD213.freeBet);if(gold!==1000-50+5000)F.push('three Wanderers paid wrong: gold '+gold);
  out.road.plaque=!!(CD213.plq&&CD213.plq.parent);if(!out.road.plaque)F.push('no plaque for the Wanderer’s Road');
  if(!/Free hand/.test(($('cd213w').textContent||'')))F.push('the panel does not offer the free hand');
  CD213.bet=10;const g1=gold;key(' ');STEP(240);out.road.after={free:CD213.free,gold};if(CD213.free!==4)F.push('a free hand was not used');if(gold!==g1+100)F.push('a free pair of Lanterns at 50 doubled should pay 100: got '+(gold-g1));
  cd213Roll=R0;const sv=x2Save();out.road.saved=sv.cd218;if(!sv.cd218||sv.cd218.n!==4||sv.cd218.b!==50)F.push('the free hands are not saved: '+JSON.stringify(sv.cd218));
  CD213.free=0;x2Load({cd218:{n:4,b:50}});if(CD213.free!==4||CD213.freeBet!==50)F.push('the free hands do not load');x2Load({});if(CD213.free!==0)F.push('an old save keeps free hands');
  // the Hollow Rises shows its skulls
  qi=0;const Q2=['hol','hol','hol'];cd213Roll=()=>Q2[qi++%3];gold=1000;cd213Deal();let sk=0;for(let i=0;i<260;i++){STEP(1);sk=Math.max(sk,CD213.root.children.filter(o=>o.isSprite&&o.material.map&&o.material.map.image===CD213.skullC).length)}
  cd213Roll=R0;out.skulls=sk;if(sk!==3)F.push('the Hollow Rises shows '+sk+' skulls (want 3)');STEP(200);
  out.skullsGone=CD213.root.children.filter(o=>o.isSprite&&o.material.map&&o.material.map.image===CD213.skullC).length;if(out.skullsGone)F.push('the skulls stay after the show');
  key('Escape');STEP(5)}
 // ---- the Ember Wheel ----
 {const S=WH218.S,cnt={};S.forEach(k=>cnt[k]=(cnt[k]||0)+1);out.wheel={n:S.length,cnt};const want={lan:12,fang:6,rav:4,key:2,crown:1};
  for(const k in want)if(cnt[k]!==want[k])F.push('the wheel has '+cnt[k]+' '+k+' segments (want '+want[k]+')');
  out.wheel.rtp={};for(const k in want){const r=cnt[k]/S.length*(WH218.M[k]+1);out.wheel.rtp[k]=+r.toFixed(3);if(!(r>.8&&r<.98))F.push('the wheel’s '+k+' returns '+r)}
  for(let i=1;i<S.length;i++)if(S[i]!=='lan'&&S[i-1]!=='lan')F.push('two big symbols side by side at '+i);
  const [sx,sz]=gm218L(...GM218.G.wheel.stand);toPos(sx,sz,l.ry);STEP(10);promptTick();out.wheel.prompt=PR&&PR.label;if(!/Ember Wheel/.test(out.wheel.prompt||''))F.push('no wheel prompt at the wheel: '+out.wheel.prompt);
  PR.fn();STEP(5);if(GM218.cur!=='wheel')F.push('F did not open the wheel');if($('gm218w').classList.contains('hide'))F.push('the wheel panel is hidden');if(uiOpen())F.push('the wheel panel pauses the game');if(pl.visible)F.push('the hero blocks the wheel');
  STEP(60);const [cx,cz]=gm218L(GM218.G.wheel.cv[0],GM218.G.wheel.cv[2]);out.wheel.camD=+Math.hypot(cam.position.x-cx,cam.position.z-cz).toFixed(2);if(out.wheel.camD>.5)F.push('the wheel camera is not in place');
  gold=1000;WH218.keys.forEach(k=>WH218.st[k]=0);WH218.chip=50;key('1');key('3');WH218.chip=20;key('5');out.wheel.st=Object.assign({},WH218.st);
  if(WH218.st.lan!==50||WH218.st.rav!==50||WH218.st.crown!==20)F.push('keys 1–5 did not put chips on: '+JSON.stringify(WH218.st));
  // several spins: each lands on the segment it picked and pays it
  const runs=[];for(let s=0;s<6;s++){const g0=gold;key(' ');if(!WH218.busy){F.push('Space did not spin');break}if(gold!==g0-120)F.push('the stakes were not taken: '+(g0-gold));STEP(560);
    const r=WH218.res;if(!r||WH218.busy){F.push('the spin never finished');break}const seg=wh218Seg(WH218.th);const want=(r.st[r.k]||0)*(WH218.M[r.k]+1);
    runs.push([r.k,r.win]);if(seg!==r.i)F.push('the wheel stopped on segment '+seg+' but paid '+r.i);if(r.win!==want)F.push('a '+r.k+' paid '+r.win+' (want '+want+')');if(gold!==g0-120+want)F.push('gold after a spin '+gold);
    const tip=Math.abs((WH218.th/(6.2832/S.length))-Math.round(WH218.th/(6.2832/S.length)));if(tip>.4)F.push('the pointer sits on a peg ('+tip.toFixed(2)+')')}
  out.wheel.runs=runs;out.wheel.stays=wh218Stake();if(wh218Stake()!==120)F.push('the stakes did not stay on for the next spin');
  out.wheel.plaque=!!(GM218.plq&&GM218.plq.wh&&GM218.plq.wh.parent);if(!out.wheel.plaque)F.push('no result plaque at the wheel');
  key('Backspace');if(wh218Stake())F.push('Backspace did not clear the stakes');gold=5;key('1');if(wh218Stake())F.push('put a chip on without the gold');
  // the partner's replay: the wheel turns to the segment it is given
  MPV.rep=1;try{wh218Show(13,3,WH218.th,4,.1)}finally{MPV.rep=0}STEP(300);out.wheel.rep=wh218Seg(WH218.th);if(out.wheel.rep!==13)F.push('a replayed spin stopped on '+out.wheel.rep+' (want 13)');
  key('Escape');STEP(5);if(GM218.cur)F.push('Esc did not leave the wheel');if(!pl.visible)F.push('the hero stays hidden after the wheel')}
 // ---- the Four Roads ----
 {let n=0,len=0,wins=[0,0,0,0],rout=0,bad=0;for(let i=0;i<20000;i++){const q=rc218Seq(),r=rc218Count(q);n++;len+=q.length;wins[r.w]++;if(r.rout)rout++;if(r.c[r.w]!==5||r.c.some((v,j)=>j!==r.w&&v>=5))bad++}
  out.race={len:+(len/n).toFixed(1),wins:wins.map(w=>+(w/n).toFixed(3)),rout:+(rout/n).toFixed(3)};if(bad)F.push(bad+' races did not end on the first suit to 5');
  if(wins.some(w=>Math.abs(w/n-.25)>.02))F.push('the suits do not win evenly: '+out.race.wins);const rtp=.25*RC218.pay+out.race.rout/4*(RC218.rout-RC218.pay);out.race.rtp=+rtp.toFixed(3);
  if(!(rtp>.88&&rtp<.99))F.push('the Four Roads return '+rtp);
  const [sx,sz]=gm218L(...GM218.G.race.stand);toPos(sx,sz,l.ry+Math.PI);STEP(10);promptTick();out.race.prompt=PR&&PR.label;if(!/Four Roads/.test(out.race.prompt||''))F.push('no race prompt at the table: '+out.race.prompt);
  PR.fn();STEP(60);if(GM218.cur!=='race')F.push('F did not open the race');if(pl.visible)F.push('the hero blocks the race table');
  gold=1000;RC218.bet=50;key('3');if(RC218.pick!==2)F.push('key 3 did not pick the Raven');
  const res=[];for(let s=0;s<5;s++){const g0=gold;key(' ');if(!RC218.busy){F.push('Space did not deal the race');break}if(gold!==g0-50)F.push('the race bet was not taken');STEP(900);const r=RC218.res;
    if(!r||RC218.busy){F.push('the race never finished');break}const want=r.w===2?Math.floor(50*(r.rout?5:3.6)):0;res.push([r.w,r.rout,r.win]);if(r.win!==want)F.push('a race paid '+r.win+' (want '+want+')');if(gold!==g0-50+want)F.push('gold after a race '+gold);
    const lay=RC218.lay.filter(m=>m.visible);if(lay.length!==r.seq.length)F.push('cards on the table '+lay.length+' (want '+r.seq.length+')');
    const top=RC218.lay.filter(m=>m.userData.s===r.w).length;if(top!==5)F.push('the winning road has '+top+' cards');
    if(RC218.lay.some(m=>Math.abs(m.userData.f.rotation.z)>.05))F.push('a race card lies face down');
    const ys=RC218.lay.map(m=>{const v=new THREE.Vector3();m.getWorldPosition(v);return v.y-TOWNS[0].ph});if(ys.some(y=>y<.71||y>.8))F.push('race cards not on the table: '+ys.map(y=>y.toFixed(2)))}
  out.race.res=res;if(!(GM218.plq&&GM218.plq.rc&&GM218.plq.rc.parent))F.push('no result plaque at the race');
  // a partner's replay lays the same cards
  MPV.rep=1;try{rc218Show([1,1,1,0,1,1],-1,0)}finally{MPV.rep=0}STEP(400);out.race.rep=RC218.lay.map(m=>m.userData.s);if(out.race.rep.join()!=='1,1,1,0,1,1')F.push('a replayed race laid '+out.race.rep);
  gold=10;const g1=gold;key('enter');if(gold!==g1||RC218.busy)F.push('dealt a race without the gold');
  key('Escape');STEP(5);if(GM218.cur)F.push('Esc did not leave the race');if(!pl.visible)F.push('the hero stays hidden after the race');
  // walking off ends it
  PR=null;toPos(sx,sz,l.ry+Math.PI);STEP(5);gm218Open('race');STEP(5);const [ax,az]=gm218L(1.0,4.0);pl.position.x=ax;pl.position.z=az;STEP(5);if(GM218.cur)F.push('walking away did not leave the race')}
 // ---- the room: colliders, the third dining table gone, a dealer behind the race table ----
 {const [tx,tz]=gm218L(...RC218.c);out.col=DM196S.col.some(c=>Math.hypot(c.x-tx,c.z-tz)<.3);if(!out.col)F.push('no collider on the race table');
  if(DM196I.tables.length!==2)F.push('the Inn still has '+DM196I.tables.length+' dining tables');if(!RC218.dealer||!RC218.dealer.parent)F.push('no race dealer');
  // the wheel and the race table stand inside the Inn's walls
  for(const [x,z] of [[WH218.c[0]-1.3,WH218.c[2]],[WH218.c[0]+1.3,WH218.c[2]],[RC218.c[0]+1.17,RC218.c[1]+.75],[RC218.c[0]-1.17,RC218.c[1]-.75]])if(Math.abs(x)>DM196I.W2-.2||Math.abs(z)>DM196I.D2-.15)F.push('a game sticks out of the Inn at '+x+','+z)}
 // ---- the Blacksmith clear of the Inn: no Inn corner or wall within reach of the forge's front ----
 {const L=dm196Lots(),cw=L.find(o=>o.id==='CW'),inn=L.find(o=>o.id==='inn'),T=TOWNS[0];out.smith={cw:[cw.x,cw.z],ang:+(cw.ang*180/Math.PI).toFixed(1)};
  const [fx,fz]=lotW103(cw,0,3.6),[ix,iz]=[T.cx+inn.x,T.cy+inn.z];let dmin=1e9;for(let u=-1;u<=1;u+=.05)for(const v of [-1,1]){for(const [a,b] of [[u,v],[v,u]]){const [x,z]=lotW103(inn,a*inn.w,b*inn.d);dmin=Math.min(dmin,Math.hypot(x-fx,z-fz))}}
  out.smith.gap=+dmin.toFixed(2);if(dmin<3.0)F.push('the Inn stands '+dmin.toFixed(2)+' from the forge’s front');
  const nw=L.find(o=>o.id==='NW');out.smith.nwGap=+Math.hypot(nw.x-cw.x,nw.z-cw.z).toFixed(2);if(out.smith.nwGap<7)F.push('lots CW and NW crowd each other: '+out.smith.nwGap)}
 out.F=F;return out}"""
SHOT=r"""(w)=>{const l=DM196I.l,STEP=n=>{for(let i=0;i<n;i++){VT+=16;loop(VT)}};gold=2000;if(w==='wheel'){const [sx,sz]=gm218L(...GM218.G.wheel.stand);toPos(sx,sz,l.ry+Math.PI);STEP(5);gm218Open('wheel');WH218.chip=50;wh218Add('lan');wh218Add('rav');STEP(40);wh218Spin();STEP(560)}
 else{const [sx,sz]=gm218L(...GM218.G.race.stand);toPos(sx,sz,l.ry+Math.PI);STEP(5);gm218Open('race');RC218.pick=1;STEP(40);rc218Deal();STEP(900)}
 ren.render=window.__rr;POST.render=window.__pr;POST.render();ren.render=()=>{};POST.render=()=>{};return 1}"""
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
        for w in ('wheel','race'):
            pg.evaluate(SHOT,w);pg.screenshot(path=play.TMP+'/v218_'+w+'.png',timeout=600000)
play.run(s)
L=open(play.TMP+'/lastlogs.txt').read()
for l in L.split('\n'):
    if 'PAGEERROR' in l or 'v218' in l or 'v213' in l:F('page: '+l[:200])
print('v218 games: checked' if not fails else 'CHECKS FAILED')
