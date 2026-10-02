"""Date-scoped Pokemon consist assignments, checked against official sources 2026-10-01."""
PDF='https://www.railway.gov.tw/tra-tip-web/tip/file/aafd2a2a-eb9a-4bbc-b123-e53ee16fad82'
NOTICE='https://www.railway.gov.tw/tra-tip-web/tip/tip009/tip911/newsDtl?newsNo=8ae4cac2a0cfb55601a0d3373b9c04fd&page=0'
# October regular workings from page 2. Missing dates are never extrapolated.
OCTOBER={
 1:['2128','3177','3228','2257'],2:['2144','2203','2264'],
 4:['2183','3231'],5:['3010','3035'],6:['3001','3018','3021'],7:['3006','1038'],8:['2013','2244'],
 9:['2183','3231'],10:['3010','3035'],11:['3001','3018','3021'],12:['3006','1038'],13:['2013','2244'],
 14:['2143','2204','2263'],15:['2124','2163','2224'],16:['2143','2204','2263'],17:['2124','2163','2224'],
 19:['2183','3231'],20:['3010','3035'],21:['3001','3018','3021'],22:['3006','1038'],23:['2013','2244'],
 24:['2183','3231'],25:['3010','3035'],26:['3001','3018','3021'],27:['3006','1038'],28:['2013','2244'],
 29:['2143','2204','2263'],30:['2124','2163','2224']}
# 6725: official daily JSON Line=1; route/times and six charter dates match public trip.
CHARTER_DATES={'2026-10-03','2026-10-18','2026-10-31','2026-11-14','2026-11-29','2026-12-05'}
def mark_rows(rows,day):
    numbers=OCTOBER.get(int(day[-2:]),[]) if day.startswith('2026-10-') else []
    for row in rows:
        row.pop('special',None)
        if row['train'] in numbers:
            row['special']={'label':'寶可夢彩繪列車','service':'常態班次','source':PDF}
    return rows

def charter_rows(payload,day):
    if day not in CHARTER_DATES:return []
    for t in payload['TrainInfos']:
        if t['Train']!='6725' or t['Line']!='1' or t['LineDir']!='2':continue
        stops=sorted(t['TimeInfos'],key=lambda s:int(s['Order']))
        if any(s['Station']=='3160' for s in stops):continue
        taipei=next((s for s in stops if s['Station']=='1000'),None)
        if not taipei or taipei['DEPTime']!='10:37:00':continue
        tc=next((s for s in stops if s['Station']=='3300'),None)
        if not tc or tc['ARRTime']!='13:23:00':continue
        return [{'train':'6725','direction':'南下','kind':'通過不停','label':'寶可夢主題專列',
          'time':None,'expectedPassTime':'12:39' if day=='2026-10-03' else None,'note':'苗栗通過時間未公布；臺北10:37發車、臺中13:23抵達。車次依公開班次比對。',
          'source':'https://ods.railway.gov.tw/tra-ods-web/ods/download/dataResource/railway_schedule/JSON/list'}]
    return []
