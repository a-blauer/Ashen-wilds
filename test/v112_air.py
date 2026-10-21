# v112: views from above of themed instances (out/v112_air_<g>.png). GS=1,26 picks instance keys, F=0.35 the spot.
import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import play,v100_lib as L
GS=[int(x) for x in os.environ.get('GS','1,26').split(',')]
F=float(os.environ.get('F','0.35'));HGT=float(os.environ.get('HGT','70'))
def s(pg):
    L.start(pg);ev=pg.evaluate
    ev("()=>{TOD=.3;document.querySelectorAll('#banner,#glog').forEach(e=>e.style.display='none')}")
    for g in GS:
        r=ev("""([g,f,hg])=>{const I=INSL[g];insArrive(I);const P=I.path,i=Math.floor((P.length-30)*f),q=P[i];toPos(q[0],q[1]);rosterTick();STEP(1.5);
          FC([q[0]+.1,GH(q[0],q[1])+hg,q[1]+hg*.45],[q[0],GH(q[0],q[1]),q[1]],1);return [I.n,q]}""",[g,F,HGT])
        L.shot(pg,play.TMP+'/v112_air_%d.png'%g);print(r)
play.run(s,w=900,hh=600)
