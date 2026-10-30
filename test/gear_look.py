# Gear look sheets (v178): how each class's armour and weapons look, tier by tier.
#   CLS=warrior MODE=prog python3 gear_look.py       -> out/gear_prog_<cls>.jpg  rows = tiers I..V (the tier's helm + chest + boots +
#                                                        main weapon), columns front / 3-4 / back / head / chest / weapon
#   CLS=warrior MODE=items SL=helm python3 gear_look.py -> out/gear_items_<cls>_<sl>.jpg  every template of that slot the class can
#                                                        use, worn (or held), sorted by tier; columns front / 3-4 / back / close
#   MODE=weapons CLS=mage python3 gear_look.py       -> out/gear_weapons_<cls>.jpg  every weapon/shield model alone, 2 views
#   R=rarity (default 2)  LV=item level (default from tier)  TAG=suffix for the file name  FROM=/TO= template index range
import os,sys,re,base64
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
O=play.TMP
HERE=os.path.dirname(os.path.abspath(__file__))
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(HERE+'/v114_beasts.py').read(),re.S).group(1)
JS=COMMON+r"""(a)=>{const [mode,cls,sl,R,MV,fr,to]=a,V=THREE.Vector3,out={info:[],err:null};
  const RACE={warrior:1,assassin:2,mage:3,paladin:4,ranger:5},arm=CLS[cls].arm;
  const fits=t=>t.cls?t.cls==cls:(t.arm?t.arm==arm:true);
  const mk=(tp)=>({id:-1,tp,lv:Math.max(1,ITPL[tp].t*11+3),req:1,r:R,up:0,aff:[]});
  const L=[];
  if(mode=='prog'){for(let t=0;t<5;t++){const row={t,E:{}};['helm','chest','boots'].forEach(s=>{const i=ITPL.findIndex(q=>q.sl==s&&q.arm==arm&&q.t==t&&!q.nw);if(i>=0)row.E[s]=mk(i)});
      const w=ITPL.findIndex(q=>q.sl=='weapon'&&q.cls==cls&&q.t==t&&!q.nw);if(w>=0)row.E.weapon=mk(w);
      if(cls=='paladin'){const o=ITPL.findIndex(q=>q.sl=='offhand'&&q.t==t&&!q.nw);if(o>=0)row.E.offhand=mk(o)}
      row.n='T'+(t+1)+' '+['helm','chest','weapon'].map(s=>row.E[s]?ITPL[row.E[s].tp].n:'').join(' / ');L.push(row)}}
  else{const ids=[];ITPL.forEach((t,i)=>{if(i<fr||i>=to)return;if((sl=='weapon'?(t.sl=='weapon'||t.sl=='offhand'):t.sl==sl)&&fits(t))ids.push(i)});ids.sort((x,y)=>ITPL[x].t-ITPL[y].t||x-y);
    ids.forEach(i=>{const E={};E[ITPL[i].sl]=mk(i);L.push({t:ITPL[i].t,E,n:'#'+i+' T'+(ITPL[i].t+1)+' '+ITPL[i].n,tp:i})})}
  if(mode=='weapons'){const FW=300,FH=240,cols=4,{rd,sc,pc}=RT.mk(FW,FH,0x262a30);const hid=[];sc.children.forEach(o=>{if(o.isGridHelper||(o.isMesh&&o.geometry&&o.geometry.type=='PlaneGeometry')){o.visible=false;hid.push(o)}});
    const cnv=document.createElement('canvas');cnv.width=FW*cols;cnv.height=FH*Math.ceil(L.length*2/cols);const ctx=cnv.getContext('2d');
    L.forEach((row,n)=>{let g;try{const it=row.E.weapon||row.E.offhand;g=lgGroup('GL|'+row.tp+'|'+R+'|'+Math.random(),k=>v89Kit(k,it),.14)}catch(e){out.info.push('ERR '+row.n+' '+e);return}
      sc.add(g);g.updateMatrixWorld(true);let bb=new THREE.Box3().setFromObject(g);{const z0=bb.getSize(new V());if(z0.y>z0.x*1.6){g.rotation.z=Math.PI/2;g.updateMatrixWorld(true);bb=new THREE.Box3().setFromObject(g)}}
      const c=bb.getCenter(new V()),sz=bb.getSize(new V()).length();
      [[.6,.25,1],[-.9,.15,.5]].forEach((d,j)=>{pc.position.copy(c).add(new V(...d).normalize().multiplyScalar(sz*1.45+.08));pc.lookAt(c);rd.render(sc,pc);const q=n*2+j;ctx.drawImage(rd.domElement,(q%cols)*FW,Math.floor(q/cols)*FH);if(!j)RT.lbl(ctx,row.n,(q%cols)*FW,Math.floor(q/cols)*FH,FW*2)});sc.remove(g)});
    hid.forEach(o=>o.visible=true);out.img=cnv.toDataURL('image/jpeg',.88);return out}
  const FW=250,FH=310,{rd,sc,pc}=RT.mk(FW,FH,0x22252a);if(!RT.rim){RT.rim=new THREE.DirectionalLight(0xa8b8ff,.7);RT.rim.position.set(-3,3,-4);sc.add(RT.rim)}
  const views=mode=='prog'?['front','34','back','head','chest','weapon']:(sl=='helm'?['front','hf','h34','hb']:sl=='chest'?['front','cf','c34','cb']:sl=='boots'?['front','lf','ls','lb']:['34','weapon','windup','strike']);
  const cnv=document.createElement('canvas');cnv.width=FW*views.length;cnv.height=FH*L.length;const ctx=cnv.getContext('2d');let H=null;
  L.forEach((row,ri)=>{if(H)sc.remove(H);try{H=RT.beast(cls,RACE[cls],row.E)}catch(e){out.err=String(e);out.info.push('ERR '+row.n+' '+e);return}sc.add(H);RT.idle(H,700);
    const cb=new V(0,.8,0),shot=(col,dir,c,dist,l)=>{const d=new V(...dir).normalize().multiplyScalar(dist);pc.position.copy(c).add(d);pc.lookAt(c);rd.render(sc,pc);ctx.drawImage(rd.domElement,col*FW,ri*FH);RT.lbl(ctx,l,col*FW,ri*FH,FW)};
    const hc=()=>{const hp=H.bones.head.getWorldPosition(new V());return new V(hp.x,hp.y+.03,hp.z+.02)};
    const wc=()=>{let m=null;H.traverse(o=>{if(!m&&o.isMesh&&!o.isSkinnedMesh&&o.visible&&o.parent&&/aR|hand|wR/i.test(o.parent.name||''))m=o});const b=new THREE.Box3();let any=0;H.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&o.visible){o.updateMatrixWorld(true);b.expandByObject(o);any=1}});return any?b.getCenter(new V()):H.bones.aR2.getWorldPosition(new V())};
    const mv=MV[(row.E.weapon&&itT(row.E.weapon).wt)||'mace']||'mace1';
    views.forEach((v,col)=>{const lab=col?v:row.n;
      if(v=='front')shot(col,[0,.12,1],cb,3.6,lab);else if(v=='34')shot(col,[.8,.15,.6],cb,3.6,lab);else if(v=='back')shot(col,[-.5,.2,-.9],cb,3.6,lab);
      else if(v=='head'||v=='hf')shot(col,[0,.1,1],hc(),1.0,lab);else if(v=='h34')shot(col,[.75,.2,.6],hc(),1.0,lab);else if(v=='hb')shot(col,[-.6,.25,-.8],hc(),1.0,lab);
      else if(v=='chest'||v=='cf')shot(col,[.25,.15,1],new V(0,.78,0),1.7,lab);else if(v=='c34')shot(col,[.8,.2,.6],new V(0,.78,0),1.7,lab);else if(v=='cb')shot(col,[-.6,.2,-.8],new V(0,.78,0),1.7,lab);
      else if(v=='lf')shot(col,[0,.1,1],new V(0,.2,0),1.0,lab);else if(v=='ls')shot(col,[1,.1,.05],new V(0,.2,0),1.0,lab);else if(v=='lb')shot(col,[-.6,.2,-.8],new V(0,.2,0),1.0,lab);
      else if(v=='weapon'){const c=wc();shot(col,[.7,.2,.8],c,1.6,lab)}
      else if(v=='windup'){RT.pose(H,mv,.35);shot(col,[.7,.2,.8],cb,4.0,lab);RT.idle(H,300)}else if(v=='strike'){RT.pose(H,mv,.62);shot(col,[.5,.2,1],cb,4.0,lab);RT.idle(H,300)}})});
  if(H)sc.remove(H);out.img=cnv.toDataURL('image/jpeg',.86);out.err=out.err||RT.err||null;return out}"""
MV={'gs':'gs1','ga':'gs1','axes':'gs1','halberd':'gs1','mace':'mace1','hammer':'mace1','flail':'mace1','dagger':'dag1','claws':'dag1','knives':'dag1','bow':'sling','crossbow':'sling','sling':'sling','staff':'sword0','wand':'sword0','orb':'sword0'}
def start(pg,cls='warrior'):
    pg.click('[data-dev=desktop]',timeout=300000);pg.click('[data-c="%s"]'%cls,timeout=300000);pg.click('#ccNext',timeout=300000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=300000);pg.wait_for_timeout(3000)
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    start(pg)
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
    mode=os.environ.get('MODE','prog');R=int(os.environ.get('R','2'));tag=os.environ.get('TAG','')
    fr=int(os.environ.get('FROM','0'));to=int(os.environ.get('TO','9999'))
    for cls in os.environ.get('CLS','warrior').split(','):
        for sl in os.environ.get('SL','weapon').split(','):
            r=ev(JS,[mode,cls,sl,R,MV,fr,to])
            for i in r['info'][:20]:print(' ',i)
            if r['err'] or errs:print('err',r['err'],'console',errs[:4])
            nm='gear_%s_%s%s%s.jpg'%(mode,cls,('_'+sl if mode=='items' else ''),tag)
            open(O+'/'+nm,'wb').write(base64.b64decode(r['img'].split(',')[1]));print('wrote',nm)
            if mode=='prog' or mode=='weapons':break
play.run(s,w=900,hh=600)
