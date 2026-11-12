# v225 pictures: the new hero looks on every animal. SHEET=body (patterns, underside, head size, tail, an armoured set) or
# SHEET=face (war paints and scars, head close-ups). Writes out/v225_<sheet><TAG>.jpg; prints errors and paint counts.
import os,sys,re,json,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP;TAG=os.environ.get('TAG','');SHEET=os.environ.get('SHEET','body')
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const [sheet]=a,V=THREE.Vector3,CL=['warrior','assassin','mage','paladin','ranger'],RC={warrior:1,assassin:2,mage:3,paladin:4,ranger:5};
 const body=[['default',{}],['tabby',{pat:1}],['spots',{pat:2,pc:'#2e2622'}],['mask+streaks',{pat:3,fp:1,fpc:'#a8261c'}],['saddle+pale',{pat:4,bel:1}],['socks',{pat:5,pc:'#ece4d4'}],
   ['blaze',{pat:6,pc:'#f8f6f0'}],['piebald',{pat:8,pc:'#ece4d4'}],['points',{pat:9}],['grizzled',{pat:10,pc:'#d8b070'}],['brindle+scar',{pat:11,scar:1}],['rings big',{pat:12,hs:1.12,tl:1.3}],['armour',{pat:1,hs:1.12,tl:.7,fp:2}]];
 const face=[['none',{}],['streaks',{fp:1}],['brow',{fp:2}],['rings',{fp:3}],['rune',{fp:4}],['slash',{fp:5}],['muzzle',{fp:6}],['scar L',{scar:1}],['scar R',{scar:2}],['cheek',{scar:3}],['muzzle scar',{scar:4}]];
 const cols=sheet=='face'?face:body,FW=sheet=='face'?150:150,FH=sheet=='face'?150:210,R=RT.mk(FW,FH,0x262a30),rd=R.rd,sc=R.sc,pc=R.pc;
 const cv=document.createElement('canvas');cv.width=FW*cols.length;cv.height=FH*CL.length;const ctx=cv.getContext('2d');const out={rows:[]};
 const gear=cls=>{const E={},C=CLS[cls];const pick=(sl,arm)=>{let best=-1;ITPL.forEach((t,i)=>{if(t.sl==sl&&(!arm||t.arm==arm)&&(t.cls==null||t.cls==cls)&&(t.t|0)<=4&&(best<0||(t.t|0)>(ITPL[best].t|0)))best=i});return best};
   ['helm','chest','boots'].forEach(sl=>{const i=pick(sl,C.arm);if(i>=0)E[sl]=RT.it(i,3)});const w=pick('weapon');const wi=ITPL.findIndex(t=>t.sl=='weapon'&&t.cls==cls&&(t.t|0)==4);if(wi>=0)E.weapon=RT.it(wi,3);
   if(cls=='paladin'){const s=ITPL.findIndex(t=>t.sl=='offhand'&&(t.t|0)==4);if(s>=0)E.offhand=RT.it(s,3)}return E};
 CL.forEach((cls,ri)=>{const race=RC[cls],D=BRD[race],row={cls,n:{}};
   cols.forEach(([lab,lk],ci)=>{let H=null;try{H=RT.beast(cls,race,lab=='armour'?gear(cls):{},Object.assign({skin:D.fur[0],eye:D.eye[0]},lk))}catch(e){row.n[lab]='ERR '+e.message;return}
     sc.add(H);RT.idle(H,300);H.updateMatrixWorld(true);
     if(sheet=='face'){const hp=H.bones.head.getWorldPosition(new V());const c=new V(hp.x,hp.y+.07,hp.z+.05),d=new V(.25,.1,1).normalize().multiplyScalar(.62);pc.position.copy(c).add(d);pc.lookAt(c)}
     else{const c=new V(0,.72,0),d=new V(.55,.22,.8).normalize().multiplyScalar(3.4);pc.position.copy(c).add(d);pc.lookAt(c)}
     rd.render(sc,pc);ctx.drawImage(rd.domElement,ci*FW,ri*FH);RT.lbl(ctx,(ci?'':cls+' ')+lab,ci*FW,ri*FH,FW);
     let n=0;H.traverse(o=>{if(o.isSkinnedMesh&&o.geometry&&o.geometry.attributes.position)n+=o.geometry.attributes.position.count});row.n[lab]=n;sc.remove(H)});
   out.rows.push(row)});
 out.img=cv.toDataURL('image/jpeg',.88);out.err=RT.err||null;out.perr=LK225.err;return out}"""
def s(pg):
    pg.set_default_timeout(2400000)
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext');pg.wait_for_timeout(300);pg.click('#ccNext');pg.wait_for_timeout(2500)
    r=pg.evaluate(JS,[SHEET]);img=r.pop('img');p=O+'/v225_%s%s.jpg'%(SHEET,TAG);open(p,'wb').write(base64.b64decode(img.split(',')[1]));print(json.dumps(r));print('wrote',p)
    if r.get('err'):print('FAIL render error',r['err'])
    if r.get('perr'):print('FAIL paint errors',r['perr'])
play.run(s)
