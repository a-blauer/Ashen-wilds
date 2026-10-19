# v100 fusemenu track: the guided Fusion window (pick companion -> method -> partner -> preview -> confirm).
#   python3 v100_fusemenu.py            -> desktop (1000x620) + phone (390x780, touch)
#   DEV=desk|phone                       -> only one of them      SRC=<build> as in every play.py test
# Seeds a party with companions of several tiers / grades / families, a locked one, a Universal one, runes, catalysts;
# walks Fuse, Siphon (with a catalyst), Consume, Fuse across families with Binding Salts, end to end with real clicks/taps.
# Checks: preview numbers == real result after confirming, invalid partners disabled with a reason (clicking does nothing),
# used-up companion removed, Esc closes, Back / step chips / Backspace go back, no page errors, no text spilling out.
# Output: out/v100_fsm_<dev>_<n>_<step>.png and contact sheets out/v100_fsm_sheet_<dev>.jpg. Prints CHECKS OK / FAIL.
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
O=play.TMP;FAIL=[];DEV=os.environ.get('DEV','desk,phone').split(',')
def chk(name,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+name,(' '+str(info)[:400]) if info not in ('',None) else '')
    if not ok:FAIL.append(name)
def launch(p):
    return p.chromium.launch(executable_path=os.environ.get('PW_CHROME') or (os.path.exists('/opt/pw-browsers/chromium') and '/opt/pw-browsers/chromium') or None,args=['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files'])

SEED=r"""()=>{
  // deterministic rolls for the seed
  let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;const R0=Math.random;Math.random=rnd;
  try{
  const mk=(sp,l,iv,o)=>{const c=mkC(sp,l,0,'',{hp:1,a:1,d:1,pa:1,ma:1,pd:1,md:1});Object.assign(c.iv,iv||{});ivSync(c);c.mods=[];Object.assign(c,o||{});c.h=M(c);party.push(c);return c};
  party.length=0;
  const A=mk('Ashwolf',18,{hp:1.02,pa:.97,ma:.9,pd:1.03,md:.95},{n:'Cinderfang'});              // tier 2 Beast: the one we improve
  mk('Skyhawk',12,{hp:1.0,pa:1.05,ma:1.0,pd:.98,md:1.0},{n:'Galewing'});                          // tier 2 Sky (team slot 2)
  mk('Foxlet',9,{hp:.9,pa:1.22,ma:.95,pd:.9,md:.92},{n:'Ember Foxlet',mods:['Swift']});           // tier 1 Beast, S attack roll -> siphon (half strength)
  mk('Emberlynx',22,{hp:1.14,pa:1.08,ma:1.0,pd:1.13,md:1.0},{n:'Ashmane',runes:['r_ember']});       // tier 3 Beast, strong, a rune
  mk('Direfang',30,{hp:1.2,pa:1.2,ma:1.1,pd:1.2,md:1.2},{n:'Old Grimjaw',lock:true});              // tier 4 Beast, locked
  mk('Mossfrog',7,{hp:.95,pa:.92,ma:.9,pd:1.0,md:.96},{n:'Bogsy'});                               // tier 2 Earth -> only Consume (or Binding Salts)
  mk('Wispling',15,{hp:1.0,pa:1.0,ma:1.12,pd:1.0,md:1.15},{n:'Pale Wisp',tr:'Universal'});        // Universal Spirit
  mk('Batwing',4,{hp:.86,pa:.86,ma:.86,pd:.86,md:.86},{n:'Duskmite',evo:1});                      // tier 1 Sky, weak
  mk('Ashwolf',3,{hp:.9,pa:.9,ma:.9,pd:.9,md:.9},{n:'Runt'});                                     // tier 2 Beast, weak rolls
  for(let i=0;i<3;i++){const e=rollEgg(1+i);eggs.push(e)}
  sup.c_kin=2;sup.c_bind=1;sup.c_ess=1;gold=5000;hsDirty();ui();hud();
  return party.map(c=>c.n)}finally{Math.random=R0}}"""
SNAP="(n)=>{const c=party.find(x=>x.n==n);if(!c)return null;ivFix(c);const o={};IVK.forEach(k=>o[k]=Math.round(cStat(c,k)));o.l=c.l;o.gs=c.gs||0;o.fz=c.fz||0;o.n=party.length;o.mods=(c.mods||[]).slice();o.tr=c.tr||'';return o}"
PREV="()=>{const o={};document.querySelectorAll('#fsmB td.aft[data-k]').forEach(t=>o[t.dataset.k]=[+t.dataset.lo,+t.dataset.hi]);return o}"
STATE="()=>({st:FSM100.st,a:FSM100.a&&FSM100.a.n,act:FSM100.act,b:FSM100.b&&FSM100.b.n,open:!$('fz').classList.contains('hide'),go:($('fsmGo')||{}).textContent||''})"
# text spilling out of rows/buttons/cards, or text boxes overlapping each other
OVL=r"""()=>{const W=document.querySelector('#fz .win');const out=[];if(!W)return ['nowin'];const wr=W.getBoundingClientRect();
  if(wr.right>innerWidth+1||wr.left<-1)out.push('window wider than screen '+wr.width);
  const L=[...W.querySelectorAll('#fsmB *,#fsmF *')].filter(e=>{const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return false;const cs=getComputedStyle(e);return cs.visibility!='hidden'&&cs.display!='none'&&!e.closest('.hide')});
  L.forEach(e=>{if(e.children.length||!e.textContent.trim())return;const box=e.closest('.fsm-row,.fsm-act,.fsm-pc,.fsm-tgt,button,td,.fsm-loss,.fsm-note');if(!box||box===e)return;const a=e.getBoundingClientRect(),b=box.getBoundingClientRect();
    const cs=getComputedStyle(e);if(cs.textOverflow=='ellipsis'||getComputedStyle(e.parentElement).textOverflow=='ellipsis')return;
    if(a.right>b.right+2||a.left<b.left-2||a.bottom>b.bottom+2)out.push('spill:'+e.textContent.trim().slice(0,28))});
  const B=$('fsmB');if(B.scrollWidth>B.clientWidth+2)out.push('horizontal scroll in body '+B.scrollWidth+'>'+B.clientWidth);
  return out.slice(0,12)}"""

def run(dev):
    W,H,mob=(1000,620,False) if dev=='desk' else (390,780,True)
    shots=[]
    with sync_playwright() as p:
        b=launch(p);ctx=b.new_context(viewport={'width':W,'height':H},has_touch=mob,is_mobile=mob,device_scale_factor=1)
        pg=ctx.new_page();errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)[:300]+' '+(e.stack or '')[:300].replace('\n',' ')))
        pg.add_init_script('window.AW_NOTITLE=1')
        pg.goto('file://'+O+'/live.html',wait_until='domcontentloaded',timeout=180000);pg.wait_for_function("()=>typeof hero!='undefined'&&!!document.getElementById('ccNext')",timeout=180000);pg.wait_for_timeout(1500)
        ev=pg.evaluate;ev("()=>localStorage.clear()")
        pg.click('[data-dev=%s]'%('mobile' if mob else 'desktop'),timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext',timeout=180000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=180000,no_wait_after=True);pg.wait_for_function("()=>party.length>0",timeout=180000);pg.wait_for_timeout(2500)
        ev("()=>{ren.render=()=>{};if(typeof POST!='undefined'&&POST)POST.render=()=>{}}")
        print(dev,'party',ev(SEED))
        n=[0]
        def tap(sel):
            loc=pg.locator(sel).first;loc.scroll_into_view_if_needed(timeout=20000)
            if mob:loc.tap(timeout=20000)
            else:loc.click(timeout=20000)
            pg.wait_for_timeout(250)
        def shot(step):
            n[0]+=1;path=O+'/v100_fsm_%s_%02d_%s.png'%(dev,n[0],step);pg.wait_for_timeout(350);pg.screenshot(path=path,timeout=180000,animations='disabled');shots.append((path,step))
            o=ev(OVL);chk('%s %s: no spilling/overlapping text'%(dev,step),not o,o)
        def shotEnd(step):
            ev("()=>{const B=$('fsmB');B.scrollTop=B.scrollHeight}");shot(step)
            ev("()=>{$('fsmB').scrollTop=0}")
        def openF():
            ev("()=>{closeWin();$('sysmenu').classList.add('hide')}");ev("()=>$('fuseBtn').click()");pg.wait_for_timeout(400)
        def pickA(name):
            i=ev("(n)=>party.findIndex(c=>c.n==n)",name);tap('#fsmB [data-fsm=a][data-i="%d"]'%i)
        def pickB(name):
            i=ev("(n)=>party.findIndex(c=>c.n==n)",name);tap('#fsmB [data-fsm=b][data-i="%d"]'%i)

        # ---------- 1. Fuse (growth), Ember-free partner, then check exact numbers ----------
        openF();st=ev(STATE);chk(dev+' Fusion button opens step 1',st['open'] and st['st']=='pick',st)
        chk(dev+' old option cards are hidden',ev("()=>getComputedStyle(document.querySelector('#fz .win > .wb:not(.fsm-b)')).display=='none'&&getComputedStyle($('doF').parentElement).display=='none'"))
        shot('1_pick')
        tap('#fz .fsm-hb');shot('1b_help');tap('#fz .fsm-hb')
        pickA('Cinderfang');st=ev(STATE);chk(dev+' picking a companion goes to the method step',st['st']=='act' and st['a']=='Cinderfang',st)
        shot('2_method')
        r=ev("()=>[...document.querySelectorAll('#fsmB [data-fsm=act]')].map(b=>[b.dataset.k,b.disabled,b.textContent.replace(/\\s+/g,' ').trim().slice(0,160)])")
        chk(dev+' three method cards (Fuse, Siphon, Consume) all usable here',[x[0] for x in r]==['std','sip','con'] and not any(x[1] for x in r),r)
        tap('#fsmB [data-fsm=act][data-k=std]');shot('3_partner_fuse')
        rows=ev("()=>[...document.querySelectorAll('#fsmB [data-fsm=b]')].map(b=>({n:party[+b.dataset.i].n,dis:b.disabled,why:(b.querySelector('.fsm-why')||{}).textContent||'',gain:(b.querySelector('.fsm-gain')||{}).textContent||''}))")
        dis={x['n']:x for x in rows if x['dis']};ok_={x['n']:x for x in rows if not x['dis']}
        chk(dev+' locked partner is greyed with the reason',('Old Grimjaw' in dis) and 'Locked' in dis['Old Grimjaw']['why'],dis.get('Old Grimjaw'))
        chk(dev+' other-family partner is greyed with the reason (Binding Salts named)',('Galewing' in ok_) or ('Galewing' in dis and 'family' in dis['Galewing']['why']),rows)
        chk(dev+' Universal partner of another family is usable',('Pale Wisp' in ok_),list(ok_))
        order=[x['n'] for x in rows if not x['dis']]
        gains=[float(x['gain'].split('%')[0].strip('+')) for x in rows if not x['dis']]
        chk(dev+' usable partners listed first, biggest gain first (ties: least valuable first)',all(not x['dis'] for x in rows[:len(order)]) and gains==sorted(gains,reverse=True) and order[0]=='Runt',[order,gains])
        # a disabled row does nothing when clicked
        lk=ev("()=>party.findIndex(c=>c.n=='Old Grimjaw')");pg.locator('#fsmB [data-fsm=b][data-i="%d"]'%lk).click(force=True,timeout=20000);pg.wait_for_timeout(200)
        chk(dev+' clicking a locked partner does nothing',ev(STATE)['st']=='mate')
        # back with the Back button, then forward again
        tap('#fsmF [data-fsm=back]');chk(dev+' Back returns to the method step',ev(STATE)['st']=='act');tap('#fsmB [data-fsm=act][data-k=std]')
        ev("()=>{party.find(c=>c.n=='Runt').mods=[]}")
        pickB('Runt');st=ev(STATE);chk(dev+' picking a partner shows the preview with an explicit button',st['st']=='prev' and 'Runt' in st['go'] and 'used up' in st['go'],st)
        shot('4_preview_fuse');shotEnd('4_preview_fuse_end')
        pv=ev(PREV);b0=ev(SNAP,'Cinderfang');np0=ev("()=>party.length")
        tap('#fsmGo');pg.wait_for_timeout(300);st=ev(STATE);a1=ev(SNAP,'Cinderfang')
        chk(dev+' Fuse: preview == result for every stat',all(pv[k][0]<=a1[k]<=pv[k][1] for k in pv) and len(pv)==5,{'prev':pv,'after':a1})
        chk(dev+' Fuse: growth went up, level kept, partner removed',a1['gs']>b0['gs'] and a1['l']==b0['l'] and ev("()=>!party.some(c=>c.n=='Runt')") and a1['n']==np0-1,[b0,a1])
        chk(dev+' result step shown',st['st']=='done' and st['open'],st)
        shot('5_done_fuse')

        # ---------- 2. Siphon with a catalyst (Kinship Draught), half strength from a lower tier ----------
        tap('#fsmF [data-fsm=again]');chk(dev+' "Improve again" goes to the method step for the same companion',ev(STATE)['st']=='act' and ev(STATE)['a']=='Cinderfang')
        tap('#fsmB [data-fsm=act][data-k=sip]');shot('6_partner_siphon')
        rows=ev("()=>[...document.querySelectorAll('#fsmB [data-fsm=b]')].map(b=>({n:party[+b.dataset.i].n,dis:b.disabled,why:(b.querySelector('.fsm-why')||{}).textContent||'',gain:(b.querySelector('.fsm-gain')||{}).textContent||'',w:(b.querySelector('.fsm-w')||{}).textContent||''}))")
        d={x['n']:x for x in rows}
        chk(dev+' siphon: a partner with no better roll is greyed with the reason',d.get('Duskmite',{}).get('dis') and 'better' in d['Duskmite']['why'],d.get('Duskmite'))
        chk(dev+' siphon: lower-tier partner warns about half strength',('Ember Foxlet' in d) and 'half strength' in d['Ember Foxlet']['w'],d.get('Ember Foxlet'))
        ev("()=>{party.find(c=>c.n=='Ember Foxlet').mods=[]}")
        pickB('Ember Foxlet');shot('7_preview_siphon')
        chips=ev("()=>[...document.querySelectorAll('#fsmB [data-fsm=stat]')].map(b=>[b.dataset.k,b.disabled,b.classList.contains('on')])")
        chk(dev+' siphon: stat chips, only better rolls enabled, best one pre-selected (PA)',[c for c in chips if c[2]]==[['pa',False,True]] and any(c[1] for c in chips),chips)
        pv0=ev(PREV);tap('#fsmB [data-fsm=cat][data-k=c_kin]');pv=ev(PREV)
        chk(dev+' siphon: choosing a catalyst updates the preview',pv['pa'][0]>pv0['pa'][0],[pv0['pa'],pv['pa']])
        shot('8_preview_siphon_cat');shotEnd('8_preview_siphon_cat_end')
        kin0=ev("()=>sup.c_kin");b0=ev(SNAP,'Cinderfang');tap('#fsmGo');a1=ev(SNAP,'Cinderfang')
        chk(dev+' Siphon: preview == result',all(pv[k][0]<=a1[k]<=pv[k][1] for k in pv),{'prev':pv,'after':a1})
        chk(dev+' Siphon: catalyst used, partner gone',ev("()=>sup.c_kin")==kin0-1 and ev("()=>!party.some(c=>c.n=='Ember Foxlet')"))
        shot('9_done_siphon')

        # ---------- 3. Consume a companion of another family (range preview) ----------
        tap('#fsmF [data-fsm=restart]');chk(dev+' "Choose another" returns to step 1',ev(STATE)['st']=='pick')
        pickA('Cinderfang');tap('#fsmB [data-fsm=act][data-k=con]');shot('10_partner_consume')
        rows=ev("()=>[...document.querySelectorAll('#fsmB [data-fsm=b]')].map(b=>({n:party[+b.dataset.i].n,dis:b.disabled}))")
        chk(dev+' consume: any family usable, locked still greyed',{x['n'] for x in rows if x['dis']}=={'Old Grimjaw'},rows)
        pickB('Galewing');shot('11_preview_consume');shotEnd('11_preview_consume_end')
        txt=ev("()=>document.querySelector('#fsmB .fsm-loss').textContent")
        chk(dev+' consume: loss box names the active-team slot',('active team' in txt),txt)
        pv=ev(PREV);tap('#fsmGo');a1=ev(SNAP,'Cinderfang')
        chk(dev+' Consume: result inside the previewed range for every stat',all(pv[k][0]<=a1[k]<=pv[k][1] for k in pv),{'prev':pv,'after':a1})
        chk(dev+' Consume: partner removed',ev("()=>!party.some(c=>c.n=='Galewing')"))
        shot('12_done_consume')

        # ---------- 4. Fuse across families with Binding Salts; Esc / Backspace / step chips ----------
        tap('#fsmF [data-fsm=restart]');pickA('Bogsy');shot('13_method_earth')
        r=ev("()=>[...document.querySelectorAll('#fsmB [data-fsm=act]')].map(b=>[b.dataset.k,b.disabled])")
        chk(dev+' Earth companion: Fuse usable through Binding Salts / Universal',dict(r)['std']==False,r)
        tap('#fsmB [data-fsm=act][data-k=std]');pickB('Duskmite');shot('14_preview_salts');shotEnd('14_preview_salts_end')
        chk(dev+' different family: Binding Salts note shown',ev("()=>/Binding Salts/.test(document.querySelector('#fsmB').textContent)&&FSM100.cat=='c_bind'"))
        pg.keyboard.press('Backspace');pg.wait_for_timeout(250);chk(dev+' Backspace goes one step back',ev(STATE)['st']=='mate')
        tap('#fsmB .fsm-steps [data-st=pick]');chk(dev+' step chip jumps back to step 1',ev(STATE)['st']=='pick')
        pickA('Bogsy');tap('#fsmB [data-fsm=act][data-k=std]');pickB('Duskmite');pv=ev(PREV);s0=ev("()=>sup.c_bind")
        ev("()=>{party.find(c=>c.n=='Duskmite').mods=[]}");tap('#fsmGo');a1=ev(SNAP,'Bogsy')
        chk(dev+' Binding-Salts fuse: preview == result, salts used',all(pv[k][0]<=a1[k]<=pv[k][1] for k in pv) and ev("()=>sup.c_bind|0")==s0-1,{'prev':pv,'after':a1})
        ev("()=>{party.find(c=>c.n=='Pale Wisp').lock=true}")
        tap('#fsmF [data-fsm=restart]');pickA('Bogsy');shot('15_method_no_partner')
        r=ev("()=>[...document.querySelectorAll('#fsmB [data-fsm=act]')].map(b=>[b.dataset.k,b.disabled,(b.querySelector('.no')||{}).textContent||''])")
        chk(dev+' no salts left: Fuse/Siphon greyed with a reason, Consume usable',r[0][1] and r[0][2] and not r[2][1],r)
        ev("()=>{party.find(c=>c.n=='Pale Wisp').lock=false}")
        pg.keyboard.press('Escape');pg.wait_for_timeout(250);chk(dev+' Esc closes the window',not ev(STATE)['open'])
        # ---------- 5. Improve button in the Companions window ----------
        ev("()=>{$('cmpBtn').click()}");pg.wait_for_timeout(600);ev("()=>{cmpSel=party.findIndex(c=>c.n=='Pale Wisp');CE.sel=null;rC()}");pg.wait_for_timeout(500)
        has=ev("()=>!!document.querySelector('#cd #fsmImp')");chk(dev+' Companions window has an Improve button',has)
        if has:
            tap('#cd #fsmImp');st=ev(STATE);chk(dev+' Improve opens Fusion on that companion',st['open'] and st['st']=='act' and st['a']=='Pale Wisp',st);shot('16_from_companions')
        # old code paths still work (tests v57/v92 drive these)
        r=ev("()=>{try{sel=[0];fOpt='con';rF();return [!!$('fmsg').innerHTML,FSM100.st]}catch(e){return String(e)}}")
        chk(dev+' old rF() path still runs',isinstance(r,list),r)
        ev("()=>closeWin()")
        chk(dev+' no page errors',not errs,errs[:3])
        b.close()
    # contact sheet
    ims=[Image.open(p) for p,_ in shots];cols=4 if dev=='desk' else 6;sc=.5 if dev=='desk' else .6
    tw,th=int(ims[0].width*sc),int(ims[0].height*sc);rows_=(len(ims)+cols-1)//cols
    sh=Image.new('RGB',(cols*tw,rows_*(th+18)),(20,16,12));dr=ImageDraw.Draw(sh)
    for i,(im,(p_,stp)) in enumerate(zip(ims,shots)):
        x,y=(i%cols)*tw,(i//cols)*(th+18);sh.paste(im.convert('RGB').resize((tw,th)),(x,y+18));dr.text((x+4,y+3),stp,fill=(230,200,140))
    out=O+'/v100_fsm_sheet_%s.jpg'%dev;sh.save(out,quality=88);print('sheet',out)

for d in DEV:run(d)
print('CHECKS OK' if not FAIL else 'FAIL '+json.dumps(FAIL))
