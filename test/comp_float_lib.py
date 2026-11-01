# Floating-piece geometry checks (copied from v142_folk.py so other tests can import them).
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
def floating(V,thr,root=None):
    # grow the attached set from the biggest piece: a piece is attached when it comes within thr of something attached.
    # root (optional, one bool per triangle): start from the biggest piece among those triangles (the body), not from a
    # bigger accessory
    T,lab=components(V);n=lab.max()+1
    if n<=1:return []
    cen=T.mean(1);rad=np.linalg.norm(T-cen[:,None,:],axis=2).max(1);tree=cKDTree(cen);rmax=rad.max()
    sizes=np.bincount(lab)
    if root is not None and root.any():big=int(np.bincount(lab[root],minlength=n).argmax())
    else:big=int(sizes.argmax())
    att=(lab==big)
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
        o=Qs[c].mean(0)
        if all(ray_hits(o,d,At) for d in D):continue
        out.append((c,sizes[c],o,last[c]))
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

def seg_tri_any(E,Tt):
    # does any segment E[i] (a->b) pass through any triangle Tt[j]? vectorised Moller-Trumbore, chunked
    if len(E)==0 or len(Tt)==0:return False
    lo=np.minimum(E[:,0],E[:,1]).min(0);hi=np.maximum(E[:,0],E[:,1]).max(0)
    keep=((Tt.max(1)>=lo-1e-6)&(Tt.min(1)<=hi+1e-6)).all(1);Tt=Tt[keep]
    if len(Tt)==0:return False
    A=Tt[:,0];e1=Tt[:,1]-A;e2=Tt[:,2]-A
    step=max(1,200000//len(Tt))
    for i in range(0,len(E),step):
        a=E[i:i+step,0][:,None,:];d=(E[i:i+step,1]-E[i:i+step,0])[:,None,:]
        h=np.cross(d,e2[None]);det=(e1[None]*h).sum(-1);ok=np.abs(det)>1e-14;f=np.where(ok,1/np.where(ok,det,1),0)
        sv=a-A[None];u=f*(sv*h).sum(-1);q=np.cross(sv,e1[None]);v=f*(q*d).sum(-1);t=f*(e2[None]*q).sum(-1)
        if (ok&(u>=0)&(v>=0)&(u+v<=1)&(t>1e-6)&(t<1)).any():return True
    return False
def components_fast(V):
    # same as components(), with scipy's connected_components instead of a Python union-find loop
    from scipy.sparse import coo_matrix
    from scipy.sparse.csgraph import connected_components
    T=V.reshape(-1,3,3)
    key=np.round(V/2e-5).astype(np.int64);_,vid=np.unique(key,axis=0,return_inverse=True);vid=vid.reshape(-1,3);nv=vid.max()+1
    r=np.concatenate([vid[:,0],vid[:,1]]);c=np.concatenate([vid[:,1],vid[:,2]])
    _,vl=connected_components(coo_matrix((np.ones(len(r),np.int8),(r,c)),shape=(nv,nv)),directed=False)
    _,lab=np.unique(vl[vid[:,0]],return_inverse=True);return T,lab.ravel()
def floating_fast(V,thr,root=None):
    # same rule as floating(), built as a graph: two pieces are joined when they come within thr of each other (or an edge
    # of one passes through the other); the attached set is everything joined to the root piece. Much faster on models
    # with hundreds of separate parts (companion kits).
    T,lab=components_fast(V);n=lab.max()+1
    if n<=1:return []
    sizes=np.bincount(lab)
    if root is not None and root.any():big=int(np.bincount(lab[root],minlength=n).argmax())
    else:big=int(sizes.argmax())
    cen=T.mean(1);rad=np.linalg.norm(T-cen[:,None,:],axis=2).max(1);tree=cKDTree(cen);rmax=rad.max()
    order=np.argsort(lab,kind='stable');starts=np.searchsorted(lab[order],np.arange(n+1))
    tris_of=lambda c:order[starts[c]:starts[c+1]]
    Qs=[]
    for c in range(n):
        tc=T[tris_of(c)];Q=np.concatenate([tc.reshape(-1,3),((tc+np.roll(tc,1,axis=1))/2).reshape(-1,3),tc.mean(1)]);Qs.append(np.unique(np.round(Q,5),axis=0))
    # triangles grouped by size, each group searched with its own radius: one big body triangle no longer makes every small
    # feather look at half the model (same pairs survive the filter below, far fewer are looked at)
    edges=[0,.006,.015,.035,.08,np.inf];Bk=[]
    for lo,hi in zip(edges[:-1],edges[1:]):
        ix=np.nonzero((rad>=lo)&(rad<hi))[0]
        if len(ix):Bk.append((ix,cKDTree(cen[ix]),float(rad[ix].max())))
    adj=[set() for _ in range(n)]
    for c in range(n):
        Q=Qs[c];tq=cKDTree(Q);PI=[];TI=[]
        for ix,tr,rm in Bk:
            sm=tq.sparse_distance_matrix(tr,rm+thr,output_type='ndarray')
            if len(sm):PI.append(sm['i'].astype(np.int64));TI.append(ix[sm['j']])
        if not PI:continue
        pi=np.concatenate(PI);ti=np.concatenate(TI)
        m=(lab[ti]!=c)
        if adj[c]:m&=~np.isin(lab[ti],np.fromiter(adj[c],dtype=np.int64))  # pieces already joined to this one need no second look
        pi,ti=pi[m],ti[m]
        m=np.linalg.norm(Q[pi]-cen[ti],axis=1)<=rad[ti]+thr;pi,ti=pi[m],ti[m]
        cands=set(np.unique(lab[ti]).tolist())-adj[c]
        if pi.size:
            hitd=set()
            for j in range(0,len(pi),300000):
                p,t=pi[j:j+300000],ti[j:j+300000];dd=pt_tri_dist(Q[p],T[t,0],T[t,1],T[t,2]);hitd|=set(np.unique(lab[t[dd<=thr]]).tolist())
            for d in hitd:adj[c].add(d);adj[d].add(c)
            cands-=hitd
        # an edge of this piece passing through a nearby piece (a whisker rooted deep inside a muzzle)
        if cands:
            tc=T[tris_of(c)];E=np.concatenate([tc[:,[0,1]],tc[:,[1,2]],tc[:,[2,0]]])
            for d in cands:
                if d in adj[c]:continue
                if seg_tri_any(E,T[tris_of(d)]):adj[c].add(d);adj[d].add(c)
    seen={big};st=[big]
    while st:
        c=st.pop()
        for d in adj[c]:
            if d not in seen:seen.add(d);st.append(d)
    att=np.isin(lab,list(seen));At=T[att];out=[]
    Dd=[np.array(v,float) for v in ([1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1])]
    for c in range(n):
        if c in seen:continue
        o=Qs[c].mean(0)
        if all(ray_hits(o,d,At,3.) for d in Dd):continue
        out.append((c,sizes[c],o,piece_dist(Qs[c],T,tree,att,rmax,thr)))
    return out
