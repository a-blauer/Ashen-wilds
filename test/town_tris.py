# Triangle counts of the town's pieces.
import play
def s(pg):
    print(pg.evaluate("""()=>{const tri=o=>{let n=0;o.traverse(c=>{if(c.isMesh&&c.geometry){const g=c.geometry,k=(g.index?g.index.count:g.attributes.position.count)/3;n+=k*(c.isInstancedMesh?c.count:1)}});return Math.round(n)};
      const T=TOWNS[0],out={town:tri(T.g),pave:T.pave?tri(T.pave):0};T.g.children.forEach((c,i)=>{const n=tri(c);if(n>2000)out['g'+i]=n});return out}"""))
play.run(s)
