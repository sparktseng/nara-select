"""Empirical Miaoli passage-time model using TRA's own stopping trains as controls.

Instead of assuming constant speed, learn the time fraction to Miaoli from
same-day trains that actually stop at Miaoli, grouped by direction/car class
and by the surrounding anchor stations. Then apply robust median fractions to
non-stop trains. Every estimate carries sample count and spread.
"""
from collections import defaultdict
from statistics import median

MIAOLI="3160"

def sec(t):
    h,m,s=map(int,t.split(":"));return h*3600+m*60+s

def clock(x):
    x=round(x)%86400;return f"{x//3600:02d}:{(x%3600)//60:02d}:{x%60:02d}"

def ordered(t):
    return sorted(t["TimeInfos"],key=lambda x:int(x["Order"]))

def anchors_around(stops):
    mi=next((i for i,s in enumerate(stops) if s["Station"]==MIAOLI),None)
    if mi is None or mi==0 or mi==len(stops)-1:return None
    return stops[mi-1],stops[mi],stops[mi+1]

def learn(payload):
    """Return empirical fractions keyed by (direction, carClass, prevStation, nextStation).

    Fraction = elapsed(prev departure -> Miaoli arrival) / elapsed(prev departure -> next arrival).
    Also build relaxed direction/carClass pools for fallback.
    """
    exact=defaultdict(list); relaxed=defaultdict(list)
    for t in payload["TrainInfos"]:
        a=anchors_around(ordered(t))
        if not a:continue
        prev,mi,nxt=a
        t0,tmi,t1=sec(prev["DEPTime"]),sec(mi["ARRTime"]),sec(nxt["ARRTime"])
        if t1<=t0 or not(t0<=tmi<=t1):continue
        frac=(tmi-t0)/(t1-t0)
        if not 0.05<frac<0.95:continue
        key=(str(t["LineDir"]),t.get("CarClass"),prev["Station"],nxt["Station"])
        exact[key].append(frac)
        relaxed[(str(t["LineDir"]),t.get("CarClass"))].append(frac)
    return exact,relaxed

def estimate_between(prev,nxt,frac):
    t0,t1=sec(prev["DEPTime"]),sec(nxt["ARRTime"])
    if t1<=t0:return None
    return t0+frac*(t1-t0)

def empirical_estimate(train, exact, relaxed):
    """Estimate Miaoli only when train has stops on both sides and mountain Line=1.

    Exact anchor match is preferred. Relaxed same direction/car-class fallback
    requires >=3 controls; otherwise no time is emitted.
    """
    if str(train.get("Line"))!="1":return None
    stops=ordered(train)
    # For non-stop trains, find nearest listed stop north/south by route order is not
    # available in ODS alone. Conservative beta uses known corridor station code sets.
    north={"1000","1010","1020","1030","1040","1050","1060","1070","1080","1090","1100","1110","1120","1130","1140","1150","1160","1170","1180","1190","1200","1210","1220","1230","1240","1250"}
    south={"3170","3180","3190","3210","3230","3240","3250","3260","3270","3280","3290","3300"}
    pi=[(i,s) for i,s in enumerate(stops) if s["Station"] in north]
    ni=[(i,s) for i,s in enumerate(stops) if s["Station"] in south]
    if not pi or not ni:return None
    if str(train["LineDir"])=="2":
        prev=max(pi,key=lambda x:x[0])[1];nxt=min(ni,key=lambda x:x[0])[1]
    else:
        prev=max(ni,key=lambda x:x[0])[1];nxt=min(pi,key=lambda x:x[0])[1]
    key=(str(train["LineDir"]),train.get("CarClass"),prev["Station"],nxt["Station"])
    vals=exact.get(key,[])
    basis="exact-anchor"
    if len(vals)<2:
        vals=relaxed.get((str(train["LineDir"]),train.get("CarClass")),[])
        basis="same-class-direction"
    if len(vals)<3:return None
    mid=median(vals)
    center=estimate_between(prev,nxt,mid)
    if center is None:return None
    # Robust empirical uncertainty from fraction spread, minimum ±2 min.
    deviations=[abs(v-mid) for v in vals]
    mad=median(deviations) if deviations else 0
    span=max(120, mad*(sec(nxt["ARRTime"])-sec(prev["DEPTime"]))*2)
    return {"center":clock(center),"from":clock(center-span),"to":clock(center+span),
            "basis":basis,"samples":len(vals),"fraction":round(mid,4),"mad":round(mad,4),
            "anchors":[prev["Station"],nxt["Station"]]}
