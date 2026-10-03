# TDX 臺鐵能力驗證（2026-10-04，Asia/Taipei）

## 結論

TDX 可補「不停靠列車曾出現在苗栗站位置事件」的證據與延誤資訊；不能直接補出所有不停靠列車的精準表定或實際通過時間。可用於校正與持續蒐樣，不可把 UpdateTime、表定時間加 DelayTime，或里程插值當成官方通過時刻。

目前 main 已整合 TDX，而非尚未使用：station_monitor.py 的 LIVE 為 v3/Rail/TRA/TrainLiveBoard；three-station-monitor.yml 從 GitHub Secrets 讀取 TDX_CLIENT_ID / TDX_CLIENT_SECRET。基準 commit 4b0321f。保留既有監測，新增獨立診斷工具；本 patch 不修改正式網站、排程或公開預估。

## 官方端點與欄位

基底：https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/

| 端點 | 能提供 | 不能提供／使用界線 |
|---|---|---|
| DailyTrainTimetable/TrainDates | 可供應營運日期 | 不是歷史位置事件 |
| DailyTrainTimetable/TrainDate/{YYYY-MM-DD} | TrainTimetables、TrainInfo、StopTimes；TripLine、Direction、SuspendedFlag、ServiceType；停靠站序及到發時刻 | StopTimes 是停靠站，並非逐站通過序列；秒數可能被捨去 |
| GeneralTrainTimetable、/TrainNo/{TrainNo} | 定期班表與停站 | 不代表指定日期所有加開列車；本輪只核對 OAS，未另呼叫 |
| SpecificTrainTimetable/TrainNo/{TrainNo} | 特殊班表及適用資訊 | 本輪6725回傳空陣列，但每日班表有6725；不能以空結果否定開行 |
| StationLiveBoard/Station/{StationID} | ScheduleArrivalTime、ScheduleDepartureTime、DelayTime、RunningStatus、UpdateTime | 欄位仍為表定時刻；未定義 ActualArrivalTime／ActualDepartureTime 或實測通過時間 |
| TrainLiveBoard、/TrainNo/{TrainNo} | TrainNo、StationID、TrainStationStatus、DelayTime、UpdateTime | 位置是站點及狀態，無GPS座標、速度或官方通過時刻；單車次端點本輪只核對 OAS |
| StationOfLine | 路線站序及 CumulativeDistance | 里程不能代表實際運行秒數、待避或限速 |

TrainStationStatus 官方定義：0進站中、1在站上、2已離站。
UpdateTime 官方定義為「本筆位置資料之更新日期時間」，不能改名為 actualPassTime。
TDX Direction 0順行、1逆行；本輪149／165／6725均為1，對照 ODS LineDir=2南下。兩來源數值不可直接通用。
TDX TripLine=1山線、2海線；苗栗站3160位於山線。單憑苗栗縣或北南端點不足以排除海線。

## 已讀回的實際證據

第一次隔離驗證：Actions run 37136290085，artifact 11278538751。
收件時間2026-10-04 00:17:20+08:00；查詢營運日2026-10-03。

- dates、daily、specific6725、lines成功；daily共915筆。
- 149次：TDX苗栗20:37到／20:39開；同日臺鐵ODS為20:37:30／20:39:30。既有秒數來源應保留，TDX只作比對。
- 165及6725：每日班表均存在，TripLine=1、SuspendedFlag=0，但StopTimes完全沒有3150／3160／3170，不提供三站通過時刻。
- specific6725的TrainTimetables為空；不可視為6725取消或無車。
- 路線WL的站序38豐富3150（136.6km）、39苗栗3160（140.6km）、40南勢3170（147.2km）。可作三站順序／里程核對，不作通過速度模型。
- 此次動態四次查詢HTTP_429，屬頻率限制，不能視為沒車或API不支援。後續工具每次請求間隔20秒，429等待60秒且只重試一次；和既有監測共用配額，仍可能被限流。

第二次驗證 run 37136392792、artifact 11277874015 已完成，八項查詢皆成功，原始JSON已下載讀回。
report.receivedAt=00:19:04是整輪開始時間，非各筆事件收件時間；各端點後續依序查詢，不能將此值用於計算位置事件延遲。

- positions共57筆，實際欄位為TrainNo、TrainTypeID／Code／Name、StationID／Name、TrainStationStatus、DelayTime、UpdateTime，無GPS、速度或ActualPassTime。
- 本次位置包裝UpdateTime=00:20:04、SrcUpdateTime=00:20:00、UpdateInterval=30、SrcUpdateInterval=60。平台30秒刷新不代表源頭每30秒提供新位置，更不代表通過誤差30秒。
- 苗栗1128、272均status=2、UpdateTime=00:18:49。單次午夜初始快照不得當成剛通過，運行日與新鮮度仍依既有監測規則判斷。
- 三站StationLiveBoard皆HTTP成功但0筆（來源包裝更新00:21:00）。因此本輪只完成該端點連線及wrapper驗證；非空row欄位由官方OAS核對，尚未用營業時段非空回應驗證其實際列車覆蓋。不把0筆說成沒有列車。
- dates／daily／specific6725／lines結果與首輪一致。
- 三項離線稽核測試通過：跨artifact去重、來源過期／初始快照／未知新鮮度排除、同站狀態更新時間變化不得宣稱實測通過。

可重現摘要保存為tdx-validation-evidence.json，含第二輪report與既有part10事件稽核；原始端點JSON由上述Actions artifact保留30天。

另實際下載既有三站監測 run 37098352220 part10，artifact 11267148463（15:15–15:30，16次成功取樣）。

- 165次苗栗位置事件15:16:30，15:17:10.915598收到，status=2、誤點4分、非初始、未過期。ODS與TDX每日停站序列均無苗栗，證明不停靠車也可能有本站動態事件。
- 2203次同站、同status=2在15:14:49、15:15:38、15:16:38、15:17:37、15:18:15多次更新，延誤同步改變。更新鐘面不能全部當作新的實車通過。
- 本片段不能證明完整三站鏈、所有不停靠車的覆蓋率或現場時間誤差；也沒有6725於12:23的當時快照。午夜重查不能還原中午動態。

## 最小整合方案

1. 保留 ODS 每日時刻表（含秒數）與現有 station_monitor.py / pass_samples.py。
2. 將 tdx_validate.py 當作後端獨立診斷或班表交叉核對工具；TDX每日班表只能補運行日、停站與山海線判定，不替换公開時刻資料。
3. 現有TrainLiveBoard持續蒐樣。依運行日、車次、車種碼、方向、時刻表版本分組；去重、排除來源過期及初始快照，誤點與準點樣本分開。觀測UpdateTime改變不是多次通過。
4. 想做對外預估：需要完整三站有效事件鏈、多日樣本及使用者現場通過時間。先量測誤差與漏報比例，再決定發布區間；不自動由里程／延誤推算精準秒數。沒有鏈即資料不足，不以0筆代表沒車。

此輪不改已核實特殊列車文案、不把6725舊12:39自動減16分，不新增未驗證推定公式。

## 執行

僅後端環境設定 TDX_CLIENT_ID、TDX_CLIENT_SECRET（GitHub Secrets亦可）；不放repo、網頁JS、網址、log或artifact。

```bash
python3 train-watch/tdx_validate.py --date 2026-10-03 --output /tmp/tdx-validation
python3 train-watch/tdx_validate.py --events /path/part01/events.json /path/part02/events.json --output /tmp/tdx-event-audit
python3 -m unittest discover -s train-watch -p test_tdx_validate.py
```

輸出目錄需尚未存在。驗證八端點，保存原始JSON與report.json；不保存OAuth回應。HTTP失敗／集合schema錯誤／可見截斷會回傳非零並保留診斷；空集合只代表當次無回報。離線稽核同一事件跨artifact去重並指出同站狀態更新時間變化，永遠標 physicalPassageTimeMeasured=false。

workflow僅隔離分支push或手動啟動，無cron；目前查詢日期固定2026-10-03供本輪重現。後續手動驗證請改日期或在後端直接執行工具，不以過去日期請求還原即時資料。

## 來源

- 官方OAS（已下載、檢查路徑及schemas）：https://tdx.transportdata.tw/webapi/File/Swagger/V3/5fa88b0c-120b-43f1-b188-c379ddb2593d
- https://data.gov.tw/dataset/161161 （位置動態，30秒更新標示；不保證每站事件都被輪詢捕捉）
- https://data.gov.tw/dataset/161156 （即時到離站）
- ODS：https://ods.railway.gov.tw/tra-ods-web/ods/download/dataResource/railway_schedule/JSON/list
- 10/1 Gmail註冊啟用通知已讀；僅帳號啟用證據，不是API能力證明。
