"""Build beta pass-through candidates for Miaoli (station 3160).

Conservative first version:
- only trains whose official stop sequence proves a West/Main mountain-line path across Miaoli;
- never labels an interpolated time as official;
- traction is separate from passenger train/car type;
- model calibration is explicit and date-scoped.
"""
from dataclasses import dataclass
from datetime import datetime, timedelta
from local_passage_model import learn as learn_local, estimate as estimate_local

MIAOLI = "3160"

# User-provided APP readings are comparisons, never calibration or live data.
APP_COMPARISON = {
    ("137", "2026-10-02"): "13:37",
    ("164", "2026-10-02"): "12:41",
    ("193", "2026-10-02"): "11:02",
    ("194", "2026-10-02"): "17:47",
}

# Calibration from 2026-10-01 field observations.
# These are not official passage times. Keep the raw observation and uncertainty.
CALIBRATION = {
    ("111", "2026-10-01"): {"observed": "09:21:00", "window_min": 2, "note": "southbound EMU3000 field observation"},
    ("110", "2026-10-01"): {"observed": "09:36:00", "window_min": 2, "note": "northbound non-stop field observation; train pairing strongly supported"},
}

# External comparison only; not TRA official passage time.
SPECIAL_REFERENCE = {
    ("6725", "2026-10-03"): {
        "reference": "12:39:00",
        "source": "TransTaiwan screenshot supplied by user",
        "official": False,
        "kind": "通過不停",
        "special": "寶可夢主題專列",
    }
}

CAR_CLASS = {
    "1131": ("區間車", None),
    "1132": ("區間快", None),
    "110G": ("自強(3000)", "EMU3000"),
}

def car_info(train):
    label, vehicle = CAR_CLASS.get(train.get("CarClass"), ("對號列車", None))
    return {
        "serviceType": label,
        "vehicleType": vehicle,
        "traction": None,  # e.g. E500 only when independently verified for that date/train.
    }

def station_ids(train):
    return [s["Station"] for s in sorted(train["TimeInfos"], key=lambda x: int(x["Order"]))]

def proven_mountain_candidate(train):
    """Conservative beta gate.

    ODS Line/LineDir alone is not enough. Require stops on both sides of Miaoli
    in the western mountain corridor and reject known coastal-only evidence.
    This intentionally under-includes rather than inventing trains.
    """
    ids = station_ids(train)
    if MIAOLI in ids:
        return False
    # North-side and south-side anchors used by current beta.
    north = {"1000","1010","1020","1030","1040","1050","1060","1070","1080","1090","1100","1110","1120","1130","1140","1150","1160","1170","1180","1190","1200","1210","1220","1230","1240","1250"}
    south = {"3170","3180","3190","3210","3230","3240","3250","3260","3270","3280","3290","3300"}
    # Coastal evidence: Houlong/Baishatun/Tongxiao/Yuanli family. Keep explicit,
    # because "passes Miaoli County" must never be confused with Miaoli Station.
    coast = {"2110","2120","2130","2140","2150","2160","2170","2180","2190","2200"}
    return bool(set(ids) & north) and bool(set(ids) & south) and not bool(set(ids) & coast)

def sec(t):
    h,m,s=map(int,t.split(':'));return h*3600+m*60+s

def hm(t):
    return datetime.strptime(t, "%H:%M:%S")

def fmt(t):
    return t.strftime("%H:%M:%S")

def calibrated_estimate(train_no, service_date):
    cal = CALIBRATION.get((str(train_no), service_date))
    if not cal:
        return None
    t = hm(cal["observed"])
    w = timedelta(minutes=cal["window_min"])
    return {"from": fmt(t-w), "to": fmt(t+w), "basis": "field-calibrated"}

def special_estimate(train_no, service_date):
    ref = SPECIAL_REFERENCE.get((str(train_no), service_date))
    if not ref:
        return None
    # Beta deliberately exposes a window, not a fake exact minute.
    t = hm(ref["reference"])
    return {"from": fmt(t-timedelta(minutes=4)), "to": fmt(t+timedelta(minutes=2)),
            "basis": "external-reference-window", "reference": ref["reference"]}

def beta_rows(payload, service_date):
    rows = []
    local_pools, local_generic = learn_local(payload)
    for train in payload["TrainInfos"]:
        if not proven_mountain_candidate(train):
            continue
        info = car_info(train)
        row = {
            "date": service_date,
            "train": str(train["Train"]),
            "direction": "南下" if train["LineDir"] == "2" else "北上",
            "kind": "通過不停",
            **info,
            "estimate": None,
            "estimateKind": "尚未校正",
            "confidence": "C｜僅確認經苗栗不停",
            "timeGrade": "C",
            "source": "TRA ODS route/stop sequence",
        }
        est = calibrated_estimate(row["train"], service_date)
        if est:
            row["estimate"] = est
            row["estimateKind"] = "現場觀測校正區間"
            row["confidence"] = "A｜當日現場實測校正"
            row["timeGrade"] = "A"
            row["calibrationNote"] = CALIBRATION[(row["train"], service_date)]["note"]
        # Same-day self-calibrating local model. It may promote a C row to B,
        # but only when its empirical interval is no wider than 6 minutes.
        if not row["estimate"]:
            loc = estimate_local(train, local_pools, local_generic)
            if loc:
                width = sec(loc["to"]) - sec(loc["from"])
                if 0 <= width <= 360:
                    row["estimate"] = {k:loc[k] for k in ("from","to","center","basis","samples","anchor","madSec")}
                    row["estimateKind"] = "臺鐵當日停靠列車局部模型"
                    row["confidence"] = f"B｜當日官方排點自我校正，樣本{loc['samples']}筆"
                    row["timeGrade"] = "B"
        ref = SPECIAL_REFERENCE.get((row["train"], service_date))
        if ref:
            row["externalReference"] = ref
            if not row["estimate"]:
                row["estimate"] = special_estimate(row["train"], service_date)
                row["estimateKind"] = "外部參考保守區間"
                row["confidence"] = "B｜外部通過時刻參考，待現場驗證"
                row["timeGrade"] = "B"
        app_time = APP_COMPARISON.get((row["train"], service_date))
        if app_time:
            row["appComparison"] = {
                "date": service_date, "time": app_time, "source": "TransTaiwan",
                "providedBy": "user", "precision": "minute",
                "includesDelay": None, "isObservation": False,
            }
        rows.append(row)
    return rows
