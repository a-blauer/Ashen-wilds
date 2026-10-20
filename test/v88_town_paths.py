# v88 town: for every kingdom level 0..3 (all upgrades at that level), check that every shop keeper, NPC, station,
# the gates and the Portal Court can still be reached on foot from the spawn point (grid flood fill using the game's
# own solid()/tcHit() collision), and that no upgrade collider sits on top of an NPC. Also prints draw calls.
#   SRC=build.html AW_TMP=/outdir python3 v88_town_paths.py
import play,os,json
# play.run with a longer page-load timeout (the shared test machine can be slow)
def run2(steps,w=820,hh=520):
    import types;src=open(play.__file__).read().replace('timeout=120000','timeout=600000');m=types.ModuleType('play2');m.__dict__['__file__']=play.__file__;exec(compile(src.split("if __name__=='__main__':")[0],play.__file__,'exec'),m.__dict__);return m.run(steps,w=w,hh=hh)
def s(pg):
    ev=pg.evaluate
    ev("()=>localStorage.clear()")
    pg.click('[data-dev=desktop]',timeout=60000);pg.click('[data-c="warrior"]',timeout=60000);pg.click('#ccNext',timeout=90000);pg.wait_for_timeout(300);pg.click('#ccNext',timeout=90000);pg.wait_for_timeout(2500)
    ev("()=>{if(typeof SOV109!='undefined')SOV109.k=13;SHOPS.forEach(o=>SH.shop[o.k]=1);shApply();visTick&&visTick()}")  # v109: all 31 lots open
    fails=0
    for L in [0,1,2,3]:
        r=ev("""(L)=>{SHU.forEach(u=>SH.lv[u.k]=L);shApply();const T=TOWNS[0],st=.25,x0=T.cx-25,z0=T.cy-25,nx=Math.round(80/st),nz=Math.round((50+((T.sz||TS)-TS))/st); // v100: the town reaches cy+T.sz
          const free=(x,z)=>!CR.some(([a,b])=>solid(x+a,z+b))&&!tcHit(x,z);const seen=new Uint8Array(nx*nz),q=[];
          const id=(x,z)=>{const i=Math.round((x-x0)/st),j=Math.round((z-z0)/st);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i};
          const s0=id(T.sp[0],T.sp[1]);seen[s0]=1;q.push(s0);
          while(q.length){const c=q.pop(),i=c%nx,j=(c/nx)|0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)return;const k=jj*nx+ii;if(seen[k])return;
            const x=x0+ii*st,z=z0+jj*st;if(!free(x,z)){seen[k]=2;return}seen[k]=1;q.push(k)})}
          const reach=(x,z,R)=>{for(let dz=-R;dz<=R;dz+=st)for(let dx=-R;dx<=R;dx+=st){if(dx*dx+dz*dz>R*R)continue;const k=id(x+dx,z+dz);if(k>=0&&seen[k]==1)return true}return false};
          const tg=[['Steward',SHM.st.x,SHM.st.z],['Merchant',T.cx,T.cy-15.75+2.7],['Innkeeper',T.cx-14.25+1.45,T.cy-15.75+2.75],['Magic',T.cx+14.25+.7,T.cy-15.75+2.8],
            ['StableMaster',STB.n[0],STB.n[1]],['Hearth',T.st2.c[0],T.st2.c[1]],['Alchemy',T.st2.a[0],T.st2.a[1]],['GateW',T.cx-23,T.cy],['GateE',T.cx+23,T.cy],['Fountain',T.cx,T.cy+3.8]];
          VIS.forEach(v=>tg.push(['vis_'+v.k,v.x,v.z]));
          const out=tg.map(([n,x,z])=>[n,reach(x,z,2.2)]);
          // upgrade colliders must not cover an NPC
          const K=KGD,mine=[].concat(K.wcol||[],K.pcol||[],...Object.values(K.up).map(u=>u.col));
          const hit=tg.filter(([n,x,z])=>mine.some(c=>c.r!=null?Math.hypot(x-c.x,z-c.z)<c.r+.4:Math.abs(x-c.x)<c.hx+.4&&Math.abs(z-c.z)<c.hz+.4)).map(t=>t[0]);
          const i=ren.info.render;return {L,unreach:out.filter(o=>!o[1]).map(o=>o[0]),npcHit:hit,mine:mine.length,cols:T.col.length,tlamp:TLAMP.length}}""",L)
        pg.wait_for_timeout(600)
        info=ev("()=>{const T=TOWNS[0];toPos(T.cx,T.cy+6,0);camDist=9;camPitch=.42;snapCam();return 1}")
        pg.wait_for_timeout(2500)
        r['draw']=ev("()=>{const i=ren.info.render;return [i.calls,i.triangles]}")
        print(json.dumps(r))
        if r['unreach'] or r['npcHit']:fails+=1
    print('PATHS', 'OK' if not fails else 'FAIL')
run2(s)
