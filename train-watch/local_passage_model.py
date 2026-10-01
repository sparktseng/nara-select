"""Local empirical travel-time model around Miaoli.

Learn actual same-day running seconds between Miaoli and every station that
co-occurs with Miaoli on stopping trains, grouped by direction/car class.
For a non-stop train, estimate from its nearest listed anchor with a learned
travel time. Require the same car class and nearby corridor anchors; abstain
when evidence is sparse or the two sides disagree.
"""
from collections import defaultdict
from statistics import median
from math import ceil

MIAOLI="3160"
def sec(t):
    h,m,s=map(int,t.split(":"));return h*3600+m*60+s
def clock(x):
    x=round(x)%86400;return f"{x//3600:02d}:{(x%3600)//60:02d}:{x%60:02d}"
def ordered(t):return sorted(t["TimeInfos"],key=lambda x:int(x["Order"]))

def learn(payload):
    # key: (dir, carClass, station, relation) relation before/after in travel direction
    pools=defaultdict(list); generic=defaultdict(list)
    for t in payload["TrainInfos"]:
        st=ordered(t); idx=next((i for i,s in enumerate(st) if s["Station"]==MIAOLI),None)
        if idx is None:continue
        mi=st[idx]
        for i,s in enumerate(st):
            if i==idx:continue
            if i<idx:
                dt=sec(mi["ARRTime"])-sec(s["DEPTime"]); rel="before"
            else:
                dt=sec(s["ARRTime"])-sec(mi["DEPTime"]); rel="after"
            if dt<=0 or dt>7200:continue
            k=(str(t["LineDir"]),t.get("CarClass"),s["Station"],rel)
            pools[k].append(dt)
            generic[(str(t["LineDir"]),s["Station"],rel)].append(dt)
    return pools,generic

def estimate(train,pools,generic):
    if str(train.get("Line"))!="1":return None
    st=ordered(train); direction=str(train["LineDir"])
    candidates=[]
    # Only nearby mountain-corridor anchors; remote low dispersion is misleading.
    local={'1250','3140','3150','3170','3180','3190','3210','3220','3230'}
    for s in st:
        if s['Station'] not in local:continue
        for rel in ("before","after"):
            vals=pools.get((direction,train.get("CarClass"),s["Station"],rel),[])
            basis="same-class-local"
            if len(vals)<4:continue
            run=median(vals)
            if rel=="before": center=sec(s["DEPTime"])+run
            else: center=sec(s["ARRTime"])-run
            dev=median([abs(v-run) for v in vals])
            candidates.append((run,dev,-len(vals),center,s["Station"],rel,len(vals),basis))
    if not candidates:return None
    # Shortest learned running time first, then dispersion and sample count.
    candidates.sort()
    run,dev,neg,center,station,rel,n,basis=candidates[0]
    # A second nearby anchor is a consistency check, never a reason to narrow
    # the interval. Reject exceptional local waits instead of hiding them.
    opposite=[c for c in candidates if c[5]!=rel]
    if opposite and abs((opposite[0][3]-center+43200)%86400-43200)>180:
        return None
    vals=pools[(direction,train.get('CarClass'),station,rel)]
    residuals=sorted(abs(v-run) for v in vals)
    # Empirical 90th-percentile spread, rather than twice the median deviation.
    span=max(120,residuals[min(len(residuals)-1,ceil(.9*len(residuals))-1)])
    return {"center":clock(center),"from":clock(center-span),"to":clock(center+span),
            "basis":basis,"samples":n,"anchor":station,"relation":rel,
            "medianRunSec":round(run),"madSec":round(dev)}
