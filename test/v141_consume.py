# v141 Consume: only the eaten companion's best stat goes up (same amount per stat as before), the preview shows the
# right stat, and the Change column shows a decimal gain (e.g. +0.5) instead of "±0" when rounding hides it.
#   python3 v141_consume.py      (SRC=<build> as in every play.py test)   Prints CHECKS OK / FAIL lines.
import sys,json,os,play
FAIL=[]
def chk(name,ok,info=''):
    print(('ok   ' if ok else 'FAIL ')+name,(' '+str(info)[:400]) if info not in ('',None) else '')
    if not ok:FAIL.append(name)
JS=r"""()=>{
  const mk=(sp,l,iv,n)=>{const c=mkC(sp,l,0,'',{hp:1,a:1,d:1,pa:1,ma:1,pd:1,md:1});Object.assign(c.iv,iv);ivSync(c);c.mods=[];c.n=n;c.h=M(c);party.push(c);return c};
  party.length=0;
  const A=mk('Gloomcap',7,{hp:1.052,pa:1.053,ma:1.054,pd:1.051,md:1.055},'Gloomcap');
  const B=mk('Foxlet',1,{hp:.95,pa:1.10,ma:.97,pd:1.0,md:.99},'Ember Foxlet');      // best roll: Phys. Attack
  const C=mk('Foxlet',1,{hp:.95,pa:.9,ma:1.2,pd:1.0,md:.99},'Spare Fox');             // best roll: Magic Attack
  A.iv.ma=1.3;                                                                       // ...which Gloomcap already maxed
  const out={key:conKey(B),keyC:conKey(C)};
  out.chkB=FSM100_check(A,B,'con');out.chkC=FSM100_check(A,C,'con');
  $('fz').classList.remove('hide');Object.assign(FSM100,{a:A,act:'con',b:B,st:'prev',stat:null,cat:'',res:null,busy:false});FSM100_render();
  out.rows=[...document.querySelectorAll('#fsmB .fsm-t tbody tr')].map(r=>[...r.cells].map(c=>c.textContent.trim()));
  out.hl=[...document.querySelectorAll('#fsmB .fsm-t tbody tr.hl')].map(r=>r.cells[0].textContent);
  out.note=[...document.querySelectorAll('#fsmB .fsm-note')].map(n=>n.textContent).join(' | ');
  const iv0={};IVK.forEach(k=>iv0[k]=ivOf(A,k));
  const g=conGainC(B);FSM100_confirm();
  const iv1={};IVK.forEach(k=>iv1[k]=ivOf(A,k));
  out.g=g;out.iv0=iv0;out.iv1=iv1;out.gone=!party.includes(B);out.st=FSM100.st;
  // refused when the stat it would raise is already maxed
  const before=A.iv.ma;sel=[party.indexOf(A)];fOpt='con';fCon=C;$('doF').onclick.call($('doF'));
  out.refused=party.includes(C)&&A.iv.ma==before;
  return out}"""
def s(pg):
    pg.set_default_timeout(1200000)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS)
    try:pg.screenshot(path=play.TMP+'/v141_consume_done.png',timeout=600000)
    except Exception as e:print('shot failed',e)
    print('RESULT',json.dumps(r)[:1500])
    chk('best stat of the eaten companion is picked',r['key']=='pa' and r['keyC']=='ma',(r['key'],r['keyC']))
    chk('partner usable, tag names the stat',r['chkB']['ok'] and r['chkB']['tag'].startswith('PA +'),r['chkB'])
    chk('partner whose best stat is maxed is greyed out',not r['chkC']['ok'] and 'maximum' in r['chkC']['why'],r['chkC'])
    chk('only Phys. Attack highlighted in the preview',r['hl']==['Phys. Attack'],r['hl'])
    rows={x[0]:x for x in r['rows']}
    chk('Phys. Attack shows a decimal gain instead of ±0','±0' not in rows['Phys. Attack'][3] and '.' in rows['Phys. Attack'][3],rows['Phys. Attack'])
    chk('other stats show ±0 and no grade change',all(rows[n][3]=='±0' for n in ['Health','Magic Attack','Phys. Defense','Magic Defense']),r['rows'])
    chk('note names the stat',('Phys. Attack' in r['note']) and ('other stats stay the same' in r['note']),r['note'])
    d={k:r['iv1'][k]-r['iv0'][k] for k in r['iv0']}
    chk('only PA rose, by the old per-stat amount (80–120% of the gain)',all(abs(d[k])<1e-9 for k in d if k!='pa') and r['g']*.8-1e-9<=d['pa']<=r['g']*1.2+1e-9,d)
    chk('PA grade C -> B (it was at 1.053)',r['iv1']['pa']>=1.06,r['iv1']['pa'])
    chk('partner used up, done screen',r['gone'] and r['st']=='done')
    chk('consume refused when that stat is already maxed',r['refused'])
    chk('no page errors',not errs,errs)
    print('CHECKS OK' if not FAIL else 'CHECKS FAIL '+str(FAIL))
play.run(s)
