# v222: the Ledger menus (paper, ink, no tiled picture), every window readable, and the floating item preview.
# Run: python3 v222_ledger.py
import os,json,play
bad=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,'' if ok else info,flush=True)
    if not ok:bad.append(name)
def s(pg):
    pg.set_default_timeout(1200000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    ev=pg.evaluate
    ev("()=>{gold=1e6}")
    # ---- 1. the page: paper, ink, nothing tiled ----
    r=ev("""()=>{$('bag').classList.remove('hide');rB();const w=$('bag').querySelector('.win'),cs=getComputedStyle(w),h=getComputedStyle(w.querySelector('.wh h2'));
      const rep=cs.backgroundRepeat.split(',').map(s=>s.trim()),bi=cs.backgroundImage;
      return {rep,leather:/kq-leath/.test(bi)||bi.indexOf(getComputedStyle(document.documentElement).getPropertyValue('--kq-leath').trim().slice(0,60))>=0&&getComputedStyle(document.documentElement).getPropertyValue('--kq-leath').trim().length>10,
        frame:cs.borderImageSource,ink:cs.color,font:cs.fontFamily,hfont:h.fontFamily,tt:h.textTransform,x:getComputedStyle(w.querySelector('.wh .x')).backgroundImage.slice(0,15)}}""")
    chk('no layer of the window background repeats (no tile, no seam)',all(x=='no-repeat' for x in r['rep']) and not r['leather'],r)
    chk('the old gold frame image is gone',r['frame']=='none',r)
    chk('ink on paper: dark text, book faces',r['ink']=='rgb(42, 33, 24)' and 'EB Garamond' in r['font'] and 'IM Fell English' in r['hfont'] and r['tt']=='none',r)
    chk('the close button is a wax seal',r['x'].startswith('radial-gradient'),r)
    ev("()=>$('bag').classList.add('hide')")
    # ---- 2. every window stays readable ----
    wins=[('inventory',"$('bag').classList.remove('hide');rB()"),('companions',"$('cmp').classList.remove('hide');rC()"),('settings',"$('setw').classList.remove('hide')"),('steward',"openX('hold')"),
          ('quest board',"openX('chq132')"),('portal',"openX('portal')"),('alchemist',"openX('alch')"),('cook',"openX('cook')"),('magic shop',"openX('magic')"),('stable',"openX('stable',0)"),('sovereigns',"openX('bosses')"),('trading post',"openShop('m')")]
    for n,js in wins:
        try:
            ev("()=>{"+js+"}");pg.wait_for_timeout(700)
            r=ev("()=>{lg222Ink();return {low:lg222Audit(1.9),n:document.querySelectorAll('.modal.w:not(.hide)>.win *').length,fix:LG222.fix.size}}")
            chk(n+': no text is lost against its background',len(r['low'])==0 and r['n']>5,r['low'][:4])
        except Exception as e:chk(n+': opens',False,str(e)[:200])
        ev("()=>{try{closeX()}catch(_){}document.querySelectorAll('.modal.w').forEach(e=>e.classList.add('hide'))}")
    # the pass darkens light text on paper and leaves text on dark plates light
    r=ev("""()=>{$('xw').classList.remove('hide');xwMode='';$('xwT').textContent='T';$('xwS').textContent='';$('xwF').innerHTML='';
      $('xwB').innerHTML='<span id="t1" style="color:#ffe08a">gold</span><span id="t2" style="color:#5fcf6a">green</span><div id="t3" class="kqm-slot" style="width:40px"><span id="t4" style="color:#ffe08a">9</span></div><div id="t5" style="background:#1a120c;width:300px;height:60px"><span id="t6" style="color:#f0e0c0">card</span></div>';
      lg222Ink();const L=id=>{const c=lg222Rgb(getComputedStyle($(id)).color);return +lg222Lum(c).toFixed(2)},B=id=>{const c=lg222Rgb(getComputedStyle($(id)).backgroundColor);return c[3]?+lg222Lum(c).toFixed(2):-1};
      const o={t1:L('t1'),t2:L('t2'),t4:L('t4'),t5bg:getComputedStyle($('t5')).backgroundColor,t6:L('t6')};$('xwB').innerHTML='';$('xw').classList.add('hide');return o}""")
    chk('light text on paper becomes ink of the same hue',r['t1']<.4 and r['t2']<.4,r)
    chk('text on a dark item slot stays light',r['t4']>.6,r)
    chk('an old dark card becomes a pale inset with ink text',r['t5bg']!='rgb(26, 18, 12)' and r['t6']<.4,r)
    # ---- 3. the floating item ----
    ev("()=>{const n=im220Rig(DM196TP.npc).getWorldPosition(new THREE.Vector3());pl.position.set(n.x+1.2,pl.position.y,n.z+2.2);snapCam();openShop('m')}")
    pg.wait_for_function("()=>document.querySelectorAll('#shop [data-kqt]').length>3",timeout=60000);pg.wait_for_timeout(600)
    r=ev("""()=>{const L=[...document.querySelectorAll('#shop [data-kqt]')],g=L.find(e=>{const i=ip222Info(e);return i&&i.it}),p=L.find(e=>{const i=ip222Info(e);return i&&!i.it});
      const out={n:L.length,gear:!!g,other:!!p};KQM.tipEl=g;ip222Tick();const d=IP222.el;out.g=[IP222.cur,d&&d.className,!!IP222.P,d&&d.querySelector('b').textContent,ip222Info(g).nm];
      const S=$('stage').getBoundingClientRect(),W=$('shop').querySelector('.win').getBoundingClientRect(),R=d.getBoundingClientRect();out.beside=R.left>=W.right-2&&R.right<=S.right+2;out.mid=Math.abs((R.left+R.right)/2-(W.right+S.right)/2)<6;out.big=R.width>=220;
      let tris=0;if(IP222.P)IP222.P.traverse(m=>{if(m.isMesh)tris+=(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3});out.tris=tris;
      KQM.tipEl=p;ip222Tick();out.p=[IP222.cur,d.className,!!IP222.P,d.querySelector('.ip222i').children.length+d.querySelector('.ip222i').textContent.length,IP222.key];
      KQM.tipEl=null;ip222Tick();out.none=[IP222.cur,d.className];
      // the ledger list: one line per ware with its name, a leader and the price; choosing one fills the page beside the list
      const C=[...document.querySelectorAll('#sb .kqm-cell')],c0=C.find(c=>c._kq&&c._kq.item&&c._kq.item())||C[0],r0=C[0].getBoundingClientRect(),r1=C[1].getBoundingClientRect();
      out.list={n:C.length,names:C.every(c=>c.querySelector('.lg-nm')&&c.querySelector('.lg-nm').textContent.trim().length>1&&c.querySelector('.lg-dots')),lines:Math.abs(r0.left-r1.left)<2&&r1.top>=r0.bottom-1&&r0.width>200,price:!!C[0].querySelector('.kqm-pr').textContent.trim()};
      c0.click();const bar=$('sb').querySelector(':scope>.kqm-bbar'),det=bar&&bar.querySelector('.lg-det'),lr=$('sb').querySelector('.kqm-shopg').getBoundingClientRect(),br=bar.getBoundingClientRect();
      out.page={det:!!det,name:det&&det.textContent.indexOf(c0.querySelector('.lg-nm').textContent.trim().slice(0,8))>=0,buy:bar.querySelectorAll('button').length,beside:br.left>=lr.right-2,on:c0.classList.contains('on')};
      const g0=gold;bar.querySelector('button').click();out.bought=gold<g0;
      lg222Tab('s');out.tabs=[$('sb').offsetParent===null,$('ss').offsetParent!==null];lg222Tab('b');out.tabs.push($('sb').offsetParent!==null,$('ss').offsetParent===null);
      KQM.tipEl=g&&g.isConnected?g:document.querySelector('#sb .kqm-cell');ip222Tick();$('shop').classList.add('hide');ip222Tick();out.closed=[IP222.cur,d.className,!!IP222.P,IP222.key];KQM.tipEl=null;return out}""")
    chk('the shop is a written list: name, leader, price on each line',r['list']['n']>3 and r['list']['names'] and r['list']['lines'] and r['list']['price'],r['list'])
    chk('choosing a ware describes it on the page beside the list, with Buy',r['page']['det'] and r['page']['name'] and r['page']['buy']>=1 and r['page']['beside'] and r['page']['on'],r['page'])
    chk('Buy on that page buys it',r['bought'],r)
    chk('Buy and Sell are two tabs',r['tabs']==[True,True,True,True],r['tabs'])
    chk('the shop has gear and other wares to look at',r['gear'] and r['other'],r)
    chk('gear floats as its 3D model, named, beside the window',r['g'][1]=='m3' and r['g'][2] and r['g'][3]==r['g'][4] and r['tris']>8 and r['beside'],r)
    chk('in the keeper view it is large and centred in the space in front of the keeper',r['mid'] and r['big'],r)
    chk('other wares float as their painted icon; the model is freed',r['p'][1]=='m2' and not r['p'][2] and r['p'][3]>0 and r['p'][4]=='',r)
    chk('nothing pointed at or selected: nothing floats',r['none']==['','hide'],r)
    chk('closing the window puts it away and frees the model',r['closed'][1]=='hide' and not r['closed'][2] and r['closed'][3]=='',r)
play.run(s,w=1280,hh=760)
logs=open(play.TMP+'/lastlogs.txt').read()
chk('no page errors','PAGEERROR' not in logs and 'v222' not in logs,[l for l in logs.split('\n') if 'PAGEERROR' in l or 'v222' in l][:3])
print('v222_ledger:','ALL PASS' if not bad else 'FAILED %d'%len(bad))
import sys;sys.exit(1 if bad else 0)
