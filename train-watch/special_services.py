"""Identify public special services without guessing equipment or pass times."""
from build_stopping_table import station_rows
NAMES=('山嵐號','海風號','鳴日廚房','鳴日號','藍皮解憂號','環島之星','仲夏寶島號','蒸汽')
SPECIAL={'1104','1105','1106','1112','1113','1121','1122','1130','1133','1134','1150','1154','1155'}
# Conservative, known west-line anchors. Line=1 is required for a passing inference.
NORTH={'0980':'基隆','0990':'七堵','1000':'臺北','1001':'臺北','1020':'板橋','1080':'桃園','1210':'中壢','3000':'新竹','3100':'竹南','3150':'豐富'}
SOUTH={'3170':'南勢','3180':'銅鑼','3190':'三義','3210':'后里','3220':'豐原','3300':'臺中','3360':'彰化','3390':'員林','3470':'斗六','4080':'嘉義','4190':'新營','4220':'臺南','4310':'新左營','4340':'高雄','4400':'屏東'}
def special_services(payload,day,source):
    stopping={r['train']:r for r in station_rows(payload)}
    result=[]
    for t in payload.get('TrainInfos',[]):
        note=str(t.get('Note',''))
        names=[n for n in NAMES if n in note]
        if str(t.get('CarClass','')) not in SPECIAL and not names:continue
        train=str(t['Train']);row=stopping.get(train)
        label=names[0] if len(names)==1 else (row or {}).get('type','特殊專列')
        if not row:
            from build_stopping_table import car_class_label
            label=names[0] if len(names)==1 else car_class_label(t['CarClass'])
        base=dict(date=day,train=train,label=label,source=source,verified=True,nameConfirmed=len(names)==1,evidence='臺鐵每日班次資料',note=note)
        if row:
            result.append(dict(base,**{k:row[k] for k in ('direction','arrival','departure','kind')},routeEvidence='官方時刻表列出苗栗站（3160）',endTime=row['departure'] or row['arrival']))
            continue
        if str(t.get('Line'))!='1':continue
        stops=sorted(t.get('TimeInfos',[]),key=lambda s:int(s['Order']))
        # A complete pair must straddle Miaoli on the mountain line. No time interpolation.
        for a,b in zip(stops,stops[1:]):
            sa,sb=str(a['Station']),str(b['Station'])
            down=sa in NORTH and sb in SOUTH;up=sa in SOUTH and sb in NORTH
            if not (down or up):continue
            amap=NORTH if down else SOUTH;bmap=SOUTH if down else NORTH
            result.append(dict(base,direction='南下' if down else '北上',arrival=None,departure=None,kind='通過不停',endTime=b['ARRTime'],routeEvidence='官方路線為山線（Line=1），相鄰停靠站跨越苗栗站',bracket=dict(beforeStation=amap[sa],beforeTime=a['DEPTime'],afterStation=bmap[sb],afterTime=b['ARRTime'])))
            break
    return result
