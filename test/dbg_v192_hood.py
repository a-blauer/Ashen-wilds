# debug (v192): what makes a Ranger hood's mantle wide. Prints the hood's rows and the widest built parts at shoulder height
# by builder, then exits 1 so tools/sheet.sh returns the last lines. SETS="Hood|Chest;..."
import os,sys,re,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play
COMMON=re.search(r'COMMON=r"""(.*?)"""',open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'v114_beasts.py')).read(),re.S).group(1)
JS=COMMON+r"""(sets)=>{const out=[];const tag=[];let cur=null;
  const wrapN=['mdChest','mdHelm','mdBoots','mdCape','mdQuiver','mdExtra','hvExtra','o176Chest','o176Helm','a7Orn','gkHood','gkSkirt','brPaws','brTail','mdFur','mdBody','mdHead'];
  const saved={};wrapN.forEach(n=>{const f=window[n];if(typeof f!='function')return;saved[n]=f;window[n]=function(B){const b=B&&B.L?B:(B&&B.B&&B.B.L?B.B:null);const n0=b?{c:b.L.c.p.length,m:b.L.m.p.length,g:b.L.g.p.length}:null;const r=f.apply(this,arguments);
    if(b){tag.push({n,b,n0,n1:{c:b.L.c.p.length,m:b.L.m.p.length,g:b.L.g.p.length}})}if(n=='gkHood'&&r&&r.G){const rows=r.G.map(row=>{let m=0,z0=9,z1=-9;row.forEach(v=>{m=Math.max(m,Math.abs(v.x));z0=Math.min(z0,v.z);z1=Math.max(z1,v.z)});return [+row[0].y.toFixed(3),+m.toFixed(3),+z0.toFixed(2),+z1.toFixed(2)]});cur.hood=rows.filter((_,i)=>i%2==0).slice(0,8)}return r}});
  const byName=n=>ITPL.findIndex(t=>t.n==n);
  try{sets.forEach(S=>{const [h,c]=S.split('|'),E={};if(h)E.helm=RT.it(byName(h),2);if(c)E.chest=RT.it(byName(c),2);tag.length=0;cur={set:S};out.push(cur);
    const D=BRD[5],L=Object.assign(mdLookN(null,'ranger'),{race:5,skin:D.fur[0],eye:D.eye[0],build:1,height:1});const B=mdHeroB('ranger',L,E);
    const who={};['c','m','g'].forEach(t=>{const p=B.L[t].p;for(let i=0;i<p.length;i+=9){const y=(p[i+1]+p[i+4]+p[i+7])/3;if(y<.86||y>1.0)continue;const x=Math.max(Math.abs(p[i]),Math.abs(p[i+3]),Math.abs(p[i+6]));
      let nm='?';for(let j=tag.length-1;j>=0;j--){const q=tag[j];if(q.b===B&&i>=q.n0[t]&&i<q.n1[t]){nm=q.n;}}
      who[nm]=Math.max(who[nm]||0,+x.toFixed(3))}});
    cur.who=who;
    // the same in the final (warped: beast proportions) space, per height band: body / chest / hood half-width and z range
    const rng={};['c','m','g'].forEach(t=>{const p=B.L[t].p;for(let i=0;i<p.length;i+=9){let nm='?';for(let j=tag.length-1;j>=0;j--){const q=tag[j];if(q.b===B&&i>=q.n0[t]&&i<q.n1[t])nm=q.n}(rng[t]=rng[t]||[]).push([i,nm])}});
    mdBake(B);const bands={};['c','m','g'].forEach(t=>{const p=B.L[t].p;(rng[t]||[]).forEach(([i,nm])=>{const g=nm=='mdBody'||nm=='mdHead'||nm=='brPaws'?'body':nm=='gkHood'?'hood':nm=='?'?'other':'gear';
      for(let v=0;v<9;v+=3){const x=p[i+v],y=p[i+v+1],z=p[i+v+2];if(y<.78||y>1.2)continue;const k=(Math.round(y/.04)*.04).toFixed(2);const b=bands[k]=bands[k]||{};const q=b[g]=b[g]||[0,9,-9];q[0]=Math.max(q[0],+Math.abs(x).toFixed(3));q[1]=Math.min(q[1],+z.toFixed(3));q[2]=Math.max(q[2],+z.toFixed(3))}})});
    cur.bands=bands;
    BR.bare=true;const Bb=mdHeroB('ranger',Object.assign({},L),{});BR.bare=false;let sw=0;const p=Bb.L.c.p;for(let i=0;i<p.length;i+=3){const y=p[i+1];if(y>.86&&y<1.0)sw=Math.max(sw,Math.abs(p[i]))}cur.bareW=+sw.toFixed(3)})}
  finally{for(const n in saved)window[n]=saved[n]}
  return out}"""
def s(pg):
    pg.evaluate("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=300000);pg.click('[data-c="ranger"]',timeout=300000);pg.click('#ccNext',timeout=300000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=300000);pg.wait_for_timeout(3000)
    sets=os.environ.get('SETS','Hornwood Hood|Galewing Mantle;Leather Hood|Padded Jerkin;|Galewing Mantle').split(';')
    r=pg.evaluate(JS,sets)
    for q in r:
        print(q['set'],'bareW',q.get('bareW'),flush=True)
        for k in sorted(q.get('bands',{})):print(' ',k,json.dumps(q['bands'][k],separators=(',',':')),flush=True)
play.run(s,w=900,hh=600)
sys.exit(1)
