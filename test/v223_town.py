# v223 town folk fixes: the Blacksmith holds his hammer head-up through the fist, the Bard's strumming hand is at the lute's
# body (forearm over the bowl's top edge) and the other at the neck, working keepers hold still while their window is open
# (Beast Trainer, Blacksmith) and work again after, and the Scholar's Tower has a lectern station with the F prompt.
# Run: python3 v223_town.py   (prints PASS / FAIL lines)
import os,sys,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
bad=[]
def chk(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name,'' if ok else json.dumps(info)[:900],flush=True)
    if not ok:bad.append(name)
SETUP="""()=>{[0,1,2,3,4,5].forEach(i=>bossDone.add(i));try{kfApply109()}catch(e){}SHOPS.forEach(o=>SH.shop[o.k]=1);shApply();try{lotSync103()}catch(_){}TOD=.3;$('xw').classList.add('hide');
  window.KP=k=>{const g=TWN100_S.npc[k]||((VIS.find(v=>v.k==k)||{}).g);return g&&(g.bones?g:g.children.find(c=>c.bones))};
  window.KL=k=>{const q=TWN100_SH.find(s=>s.k==k);return lotOf103(k)||(q&&LOTM103[q._lot])};
  window.GO=k=>{const l=KL(k),[x,z]=lotW103(l,0,4.8);toPos(x,z);visTick();STEP(.3)};
  // one animation frame of keeper k at loop time t (seconds into its loop)
  window.AT=(k,t)=>{const n=KP(k);wkAnim103(n,(t-n._wk.t0+1000)*1000);n.updateMatrixWorld(true);return n};
  GO('smith');return ['smith','bard','trainer'].map(k=>!!KP(k)&&!!KP(k)._wk)}"""
def s(pg):
    L.start(pg);ev=pg.evaluate
    r=ev(SETUP);chk('the smith, the bard and the trainer are at work',r==[True,True,True],r)
    # ---------------- 1. the smith's hammer ----------------
    r=ev("""()=>{const V=THREE.Vector3,out=[];GO('smith');for(let i=0;i<25;i++){const t=i/25*1.25,n=AT('smith',t),B=n.bones,tl=n._wk.tool,L=p=>n.worldToLocal(p);
        const w=L(B.aR2.getWorldPosition(new V())),e=L(B.aR1.getWorldPosition(new V())),f=w.clone().sub(e),fl=f.length();f.normalize();
        const g=L(tl.getWorldPosition(new V())),hd=L(tl.children[1].getWorldPosition(new V())),hf=hd.clone().sub(g).normalize();
        out.push({t:+t.toFixed(2),grip:+(g.clone().sub(w).dot(f)/fl).toFixed(2),ang:Math.round(Math.acos(Math.max(-1,Math.min(1,hf.dot(f))))*57.3),hy:+(hd.y-g.y).toFixed(2),hz:+(hd.z-g.z).toFixed(2),gy:+g.y.toFixed(2)})}return out}""")
    chk('the hammer is gripped in the fist, past the wrist (not hanging from the wrist joint)',all(.2<=f['grip']<=.7 for f in r),r[:4])
    chk('the haft crosses the fist (60-125 degrees from the forearm) all through the loop',all(60<=f['ang']<=125 for f in r),[f for f in r if not 60<=f['ang']<=125][:5])
    up=[f for f in r if .45<=f['t']<=.68]
    chk('raised, the head is above the fist',up and all(f['hy']>.1 for f in up),up[:4])
    hit=[f for f in r if f['t']<=.05 or abs(f['t']-.85)<.04]
    chk('striking, the head is in front of the fist and comes down onto the anvil',hit and all(f['hz']>.15 and f['hy']<.12 for f in hit),hit)
    # ---------------- 2. the bard ----------------
    r=ev("""()=>{const V=THREE.Vector3,out=[];GO('bard');for(let i=0;i<16;i++){const t=i*.11,n=AT('bard',t),B=n.bones,lu=n._wk.tool,bowl=lu.children[0],neck=lu.children[1];
        const W=b=>b.getWorldPosition(new V()),mi=bowl.matrixWorld.clone().invert(),lo=p=>p.clone().applyMatrix4(mi);
        const sw=W(B.aL2),se=W(B.aL1),ss=W(B.aL0),paw=sw.clone().add(sw.clone().sub(se).normalize().multiplyScalar(.04));
        const nw=W(B.aR2),nl=neck.worldToLocal(nw.clone());
        const pl=lo(paw),el=lo(se),sh=lo(ss);
        out.push({t:+t.toFixed(2),paw:+Math.hypot(pl.x,pl.y,pl.z).toFixed(2),pawFront:+pl.z.toFixed(3),elbowUp:+(se.y-W(bowl).y).toFixed(3),neckD:+Math.hypot(nl.x,nl.z).toFixed(3),neckY:+nl.y.toFixed(3)})}return out}""")
    chk('the strumming paw is at the lute\'s body (bowl-local distance < 0.32, on the soundboard side)',all(f['paw']<.32 and f['pawFront']>0 for f in r),r[:4])
    chk('the strumming forearm comes over the top of the bowl (elbow above the bowl\'s middle, beside the body)',all(f['elbowUp']>-.05 for f in r),r[:4])
    chk('the other hand holds the neck',all(f['neckD']<.12 and -.3<f['neckY']<.3 for f in r),r[:4])
    # ---------------- 3. hold still while the window is open ----------------
    def hold(k,opn,close,wake):
        ev("([k])=>{const l=KL(k),W0=WK103[k],[x,z]=lotW103(l,W0.x,W0.z),a=l.ry+W0.ry;toPos(x+Math.sin(a)*1.6,z+Math.cos(a)*1.6);visTick();STEP(.5)}",[k])
        mv0=ev("([k])=>{const n=KP(k),tl=n._wk.tool,V=THREE.Vector3,P=[];for(let i=0;i<8;i++){STEP(.12);P.push(tl.getWorldPosition(new V()).toArray())}let m=0;P.forEach(p=>P.forEach(q=>m=Math.max(m,Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]))));return m}",[k])
        ev("()=>{"+opn+"}");ev("()=>STEP(1.4)")
        r=ev("""([k])=>{const n=KP(k),tl=n._wk.tool,V=THREE.Vector3,P=[],Q=[];for(let i=0;i<14;i++){STEP(.12);P.push(tl.getWorldPosition(new V()).toArray());Q.push(n.bones.aR1.quaternion.toArray())}
            let m=0,a=0;P.forEach(p=>P.forEach(q=>m=Math.max(m,Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]))));Q.forEach(p=>Q.forEach(q=>a=Math.max(a,2*Math.acos(Math.min(1,Math.abs(p[0]*q[0]+p[1]*q[1]+p[2]*q[2]+p[3]*q[3]))))));
            const w=n.bones.aR2.getWorldPosition(new V()),root=n.getWorldPosition(new V());
            return {h:n._wk.h223,view:!!(IM220.on&&IM220.on.o===n),move:+m.toFixed(3),arm:+a.toFixed(3),tool:+(tl.getWorldPosition(new V()).y-root.y).toFixed(2),hand:+(w.y-root.y).toFixed(2)}}""",[k])
        chk('%s: while his window is open he stands still (tool moves < 4 cm, arm < 0.06 rad)'%k,r['h']==1 and r['move']<.04 and r['arm']<.06,r)
        chk('%s: the work loop moved his tool before (%.2f m)'%(k,mv0),mv0>.15,mv0)
        chk('%s: his hand is down by his side, the tool rests below the shoulders'%k,r['hand']<1.0 and r['tool']<1.1,r)
        ev("()=>{"+close+"}");ev("()=>STEP(1.2)")
        m=ev("([k])=>{const n=KP(k),tl=n._wk.tool,V=THREE.Vector3,P=[];for(let i=0;i<10;i++){STEP(.12);P.push(tl.getWorldPosition(new V()).toArray())}let m=0;P.forEach(p=>P.forEach(q=>m=Math.max(m,Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]))));return [m,n._wk.h223]}",[k])
        chk('%s: after the window closes he works again'%k,m[0]>.15 and m[1]==0,m)
    hold('trainer',"openX('visitor','trainer')","closeX()",1)
    hold('smith',"KQM_SMITH=true;$('bag').classList.remove('hide');try{rB()}catch(_){}","$('bag').classList.add('hide');KQM_SMITH=false",1)
    r=ev("()=>{const n=KP('bard'),l=KL('bard'),W0=WK103.bard,[x,z]=lotW103(l,W0.x,W0.z+1.8);toPos(x,z);visTick();STEP(.3);n._wk.h223=0;openX('visitor','bard');STEP(1.5);const L=n._wk.tool,V=THREE.Vector3,P=[];for(let i=0;i<8;i++){STEP(.1);P.push(n.bones.aL2.getWorldPosition(new V()).toArray())}closeX();let m=0;P.forEach(p=>P.forEach(q=>m=Math.max(m,Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]))));return {m:+m.toFixed(3),h:n._wk.h223}}")
    chk('bard: he stops strumming while you talk',r['m']<.02 and r['h']==1,r)
    # ---------------- 4. the Scholar's Tower lectern ----------------
    r=ev("""()=>{SH.lv.tower=1;if(!SH.pos['u:tower'])lotSync103();kdSync();STEP(.2);const T=TOWNS[0],st=kdState().up.tower,s=st223Spot(),l=lotOf103('u:tower');
        const cols=T.col.filter(c=>s&&Math.hypot(c.x-s[0],c.z-s[1])<.05&&Math.abs((c.r||0)-ST223.col)<1e-6).length;
        // the way from the door spot to the door stays open (only the tower's own body is on it)
        let block=0;for(let i=0;i<=20;i++){const [x,z]=lotW103(l,0,1.9+i*(4.45-1.9)/20);T.col.forEach(c=>{if(c.r!=null&&c.r>1)return;const d=c.r!=null?Math.hypot(c.x-x,c.z-z)-c.r:Math.max(Math.abs(c.x-x)-c.hx,Math.abs(c.z-z)-c.hz);if(d<.35)block++})}
        let v=0;st.g.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.position)v+=o.geometry.attributes.position.count});
        return {built:!!st.g,spot:!!s,cols,block,verts:v,key:Object.keys(TWBK).some(k=>k=='KDU|tower223|1'),meshes:st.g.children.length}}""")
    chk('the tower is built with its lectern (own bake key, one collider at the lectern)',r['built'] and r['spot'] and r['key'] and r['cols']==1,r)
    chk('the lectern does not block the way to the door',r['block']==0,r)
    r=ev("""()=>{const out=[];const T=TOWNS[0],l=lotOf103('u:tower'),[sx,sz]=st223Spot(),f=lotW103(l,ST223.x+.75*Math.sin(ST223.ry),ST223.z+.75*Math.cos(ST223.ry));
        toPos(f[0],f[1]);STEP(.1);const p=townPortalPrompt(T);out.push(p&&p.label);const d=Math.hypot(pl.position.x-sx,pl.position.z-sz);
        const D=lotDoor103(l);toPos(D[0],D[1]);STEP(.1);const q=townPortalPrompt(T);out.push(q&&q.label);
        // F at the lectern opens the collection log
        toPos(f[0],f[1]);STEP(.1);const r=townPortalPrompt(T);try{r.fn()}catch(e){}const m=xwMode;closeX();out.push(m,+d.toFixed(2));return out}""")
    chk('standing at the lectern shows the Scholar\'s Tower F prompt',bool(r[0]) and 'Scholar' in r[0],r)
    chk('the old door spot still shows it',bool(r[1]) and 'Scholar' in r[1],r)
    chk('F at the lectern opens the collection log',r[2]=='tower200',r)
    r=ev("""()=>{const T=TOWNS[0],a=st223Spot();SH.rot=SH.rot||{};SH.rot['u:tower']=1;kdSync();STEP(.1);const b=st223Spot(),l=lotOf103('u:tower'),c=lotW103(l,ST223.x,ST223.z);
        const has=T.col.some(q=>Math.hypot(q.x-b[0],q.z-b[1])<.05&&Math.abs((q.r||0)-ST223.col)<1e-6),old=T.col.some(q=>Math.hypot(q.x-a[0],q.z-a[1])<.05&&Math.abs((q.r||0)-ST223.col)<1e-6);
        const f=lotW103(l,ST223.x+.75*Math.sin(ST223.ry),ST223.z+.75*Math.cos(ST223.ry));toPos(f[0],f[1]);STEP(.1);const p=townPortalPrompt(T);
        SH.rot['u:tower']=0;kdSync();return {moved:Math.hypot(a[0]-b[0],a[1]-b[1])>.5,has,old,p:p&&p.label}}""")
    chk('turning the tower turns the lectern with it (collider and prompt follow)',r['moved'] and r['has'] and not r['old'] and r['p'] and 'Scholar' in r['p'],r)
play.run(s,w=900,hh=560)
logs=open(play.TMP+'/lastlogs.txt').read()
chk('no page errors or v223 warnings','PAGEERROR' not in logs and 'v223' not in logs,[l for l in logs.split('\n') if 'PAGEERROR' in l or 'v223' in l][:3])
print('v223_town:','ALL PASS' if not bad else 'FAILED %d'%len(bad))
sys.exit(1 if bad else 0)
