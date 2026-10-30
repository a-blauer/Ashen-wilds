# floating-piece check shared by v142_folk.py and v179_enemy_parts.py (copied from v142_folk.py)
import numpy as np
from scipy.spatial import cKDTree
# ---------------- geometry checks ----------------
def pt_tri_dist(P,A,B,C):
    # distance from points P (n,3) to triangles (n,3) A,B,C (Ericson, closest point on triangle)
    ab=B-A;ac=C-A;ap=P-A
    d1=(ab*ap).sum(1);d2=(ac*ap).sum(1)
    bp=P-B;d3=(ab*bp).sum(1);d4=(ac*bp).sum(1)
    cp=P-C;d5=(ab*cp).sum(1);d6=(ac*cp).sum(1)
    va=d3*d6-d5*d4;vb=d5*d2-d1*d6;vc=d1*d4-d3*d2
    den=va+vb+vc;den=np.where(np.abs(den)<1e-20,1e-20,den)
    v=vb/den;w=vc/den
    Q=A+ab*v[:,None]+ac*w[:,None]
    # regions
    def setq(mask,val):
        nonlocal Q
        Q=np.where(mask[:,None],val,Q)
    m=(d1<=0)&(d2<=0);setq(m,A)
    m2=(d3>=0)&(d4<=d3);setq(m2&~m,B)
    m3=(d6>=0)&(d5<=d6);setq(m3&~m&~m2,C)
    vc_=(d1*d4-d3*d2);mab=(vc_<=0)&(d1>=0)&(d3<=0)&~m&~m2&~m3
    t=np.where(mab,d1/np.where(np.abs(d1-d3)<1e-20,1e-20,d1-d3),0);setq(mab,A+ab*t[:,None])
    vb_=(d5*d2-d1*d6);mac=(vb_<=0)&(d2>=0)&(d6<=0)&~m&~m2&~m3&~mab
    t=np.where(mac,d2/np.where(np.abs(d2-d6)<1e-20,1e-20,d2-d6),0);setq(mac,A+ac*t[:,None])
    va_=(d3*d6-d5*d4);mbc=(va_<=0)&((d4-d3)>=0)&((d5-d6)>=0)&~m&~m2&~m3&~mab&~mac
    den2=(d4-d3)+(d5-d6);t=np.where(mbc,(d4-d3)/np.where(np.abs(den2)<1e-20,1e-20,den2),0);setq(mbc,B+(C-B)*t[:,None])
    return np.linalg.norm(P-Q,axis=1)
def components(V):
    T=V.reshape(-1,3,3);nt=len(T)
    key=np.round(V/2e-5).astype(np.int64);_,vid=np.unique(key,axis=0,return_inverse=True);vid=vid.reshape(-1,3)
    par=np.arange(vid.max()+1)
    def find(x):
        r=x
        while par[r]!=r:r=par[r]
        while par[x]!=r:par[x],x=r,par[x]
        return r
    for a,b,c in vid:
        ra,rb,rc=find(a),find(b),find(c)
        if ra!=rb:par[rb]=ra
        rc=find(c);ra=find(a)
        if ra!=rc:par[rc]=ra
    lab=np.array([find(a) for a in vid[:,0]]);_,lab=np.unique(lab,return_inverse=True);return T,lab
def piece_dist(Q,T,tree,mask,rmax,thr):
    cc=Q.mean(0);cr=np.linalg.norm(Q-cc,axis=1).max()
    idx=np.array(tree.query_ball_point(cc,cr+rmax+thr),dtype=np.int64)
    if len(idx):idx=idx[mask[idx]]
    if len(idx)==0:return 9.9
    A,B,C=T[idx,0],T[idx,1],T[idx,2];m=len(idx);step=max(1,400000//m);best=9.9
    for j in range(0,len(Q),step):
        q=Q[j:j+step];k=len(q)
        d=pt_tri_dist(np.repeat(q,m,0),np.tile(A,(k,1)),np.tile(B,(k,1)),np.tile(C,(k,1))).min()
        best=min(best,d)
        if best<=thr:break
    return best
def floating(V,thr,loose_inside=False):
    # grow the attached set from the biggest piece: a piece is attached when it comes within thr of something attached
    T,lab=components(V);n=lab.max()+1
    if n<=1:return []
    cen=T.mean(1);rad=np.linalg.norm(T-cen[:,None,:],axis=2).max(1);tree=cKDTree(cen);rmax=rad.max()
    sizes=np.bincount(lab);big=int(sizes.argmax());att=(lab==big)
    Qs={}
    for c in range(n):
        if c==big:continue
        tc=T[lab==c];Q=np.concatenate([tc.reshape(-1,3),((tc+np.roll(tc,1,axis=1))/2).reshape(-1,3),tc.mean(1)]);Qs[c]=np.unique(np.round(Q,5),axis=0)
    pend=set(Qs);last={}
    while True:
        ch=False
        for c in sorted(pend):
            d=piece_dist(Qs[c],T,tree,att,rmax,thr);last[c]=d
            if d>thr and crosses(T[lab==c],T,tree,att,rmax):d=0;last[c]=0
            if d<=thr:att|=(lab==c);pend.discard(c);ch=True
        if not ch:break
    # a piece wholly inside the attached body (hidden, e.g. a pocket under a coat) is not floating: rays from its centre
    # in all six directions hit attached surface
    out=[]
    At=T[att];D=[np.array(v,float) for v in ([1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1])]
    for c in sorted(pend):
        # (v179) every sample point of the piece must be enclosed, not just its centre: a ring round the waist has its centre inside
        Q=Qs[c];o=Q.mean(0);far=Q[np.argsort(-np.linalg.norm(Q-o,axis=1))[:6]]
        if all(all(ray_hits(p,d,At) for d in D) for p in ([o] if loose_inside else [o]+list(far))):continue
        out.append((c,sizes[c],o,last[c],int(np.argmax(lab==c))))
    return out
def crosses(tc,T,tree,mask,rmax):
    # a piece whose own edges pass through attached surface is attached (a whisker rooted inside the muzzle: its root is
    # deeper than the threshold, but the whisker crosses the skin)
    E=np.concatenate([tc[:,[0,1]],tc[:,[1,2]],tc[:,[2,0]]]);cc=tc.reshape(-1,3).mean(0);cr=np.linalg.norm(tc.reshape(-1,3)-cc,axis=1).max()
    idx=np.array(tree.query_ball_point(cc,cr+rmax),dtype=np.int64)
    if len(idx):idx=idx[mask[idx]]
    if len(idx)==0:return False
    At=T[idx]
    for a,b in E:
        d=b-a;L=np.linalg.norm(d)
        if L<1e-9:continue
        if ray_hits(a,d/L,At,L):return True
    return False
def ray_hits(o,d,T,maxd=.6):
    e1=T[:,1]-T[:,0];e2=T[:,2]-T[:,0];h=np.cross(d,e2);a=(e1*h).sum(1);ok=np.abs(a)>1e-12;f=np.where(ok,1/np.where(ok,a,1),0)
    s_=o-T[:,0];u=f*(s_*h).sum(1);q=np.cross(s_,e1);v=f*(q@d);t=f*(e2*q).sum(1)
    return bool((ok&(u>=0)&(v>=0)&(u+v<=1)&(t>1e-6)&(t<maxd)).any())
def seated(V,thr,dmin,maxsz):
    # (v181) small parts touching the body must sink into it, not just touch it (an ear or a horn set on a curved surface touches
    # at one spot and shows a gap round the rest of its base). For each small piece (size <= maxsz) within thr of the largest
    # piece (the body), the depth of its deepest vertex inside the body (signed by the nearest body triangle's normal) must be at
    # least dmin. Pieces that wrap round the body (centroid inside it: bands, cuffs) and pieces hung on something else are skipped.
    T,lab=components(V);n=lab.max()+1
    if n<=1:return []
    sizes=np.bincount(lab);big=int(sizes.argmax())
    Tb=T[lab==big];nb=np.cross(Tb[:,1]-Tb[:,0],Tb[:,2]-Tb[:,0]);nl=np.linalg.norm(nb,axis=1);ok=nl>1e-12;Tb=Tb[ok];nb=nb[ok]/nl[ok,None]
    cb=Tb.mean(1);c0=cb.mean(0)
    if np.mean(np.sum(nb*(cb-c0),1)>0)<.5:nb=-nb
    tree=cKDTree(cb);out=[]
    def sd(p):
        d,idx=tree.query(p,k=8);A,B,C=Tb[idx,0],Tb[idx,1],Tb[idx,2];dd=pt_tri_dist(np.repeat(p[None],len(idx),0),A,B,C);m=int(np.argmin(dd))
        return dd[m],float(np.dot(p-cb[idx[m]],nb[idx[m]]))
    # pieces that touch each other form one group (a finger's segments; a belt and the plates hung on it): judged together
    pcs=[c for c in range(n) if c!=big];PP={c:np.unique(np.round(T[lab==c].reshape(-1,3),5),axis=0) for c in pcs};par={c:c for c in pcs}
    def f(c):
        while par[c]!=c:par[c]=par[par[c]];c=par[c]
        return c
    # two pieces touch when a vertex of one comes within thr of a triangle of the other (surfaces that cross: hung gear)
    TT=T[lab!=big];TL=lab[lab!=big];tc=TT.mean(1);tr=np.linalg.norm(TT-tc[:,None,:],axis=2).max(1);kt=cKDTree(tc);rmx=float(tr.max()) if len(tr) else 0
    for c in pcs:
        P=PP[c];near=set()
        for i in kt.query_ball_point(P,thr+rmx):near.update(i)
        idx=np.array([i for i in near if TL[i]!=c],dtype=np.int64)
        if not len(idx):continue
        for o2 in np.unique(TL[idx]):
            if f(o2)==f(c):continue
            J=idx[TL[idx]==o2];A,B,C=TT[J,0],TT[J,1],TT[J,2];m=len(J);step=max(1,200000//m)
            for j in range(0,len(P),step):
                q=P[j:j+step];k2=len(q)
                if pt_tri_dist(np.repeat(q,m,0),np.tile(A,(k2,1)),np.tile(B,(k2,1)),np.tile(C,(k2,1))).min()<=thr:par[f(c)]=f(o2);break
    G={}
    for c in pcs:G.setdefault(f(c),[]).append(c)
    for L in G.values():
        P=np.concatenate([PP[c] for c in L]);sz=float(np.linalg.norm(P.max(0)-P.min(0)))
        if sz>maxsz:continue
        cu,cs=sd(P.mean(0))
        if cs<0:continue
        best=9.;depth=-9.
        for p in P:
            u,s=sd(p);best=min(best,u)
            if s<0:depth=max(depth,u)
        if best>thr:continue
        if depth<dmin:out.append((sz,P.mean(0),depth,int(sum(sizes[c] for c in L))))
    return out
