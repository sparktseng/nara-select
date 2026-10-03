# 三站完整來源回應｜上線驗收

更新：2026-10-04，Asia/Taipei。

使用者於07:31同意接續執行。PR14已合併main，commit 5f9822c57160d5d9d436a730eaca9f16e15f8093。
station_monitor.py成功快照會將完整公開TrainLiveBoards陣列寫入snapshots.jsonl的sourceTrainLiveBoards，與原records並存。未新增API請求，不改公開時刻表、事件去重、CSV及工作表欄位，不保存OAuth回應或憑證。

## 實際驗收

- 合併前重新跑14項監測、重試及事件稽核測試，全部通過。
- 正式main自動啟動run37162105433；授權快照、artifact保存、接班dispatch皆成功，第一段每分鐘監測已進行。這不是整日零缺口保證。
- 實際下載artifact11287902374，讀回summary.json與snapshots.jsonl。
- 快照收到時間07:33:18.860158；1次成功、0失敗，新欄位存在，完整來源155筆。
- 完整來源三站紀錄：3150=0、3160=1、3170=0。名稱搜尋也沒有豐富／南勢，並非只按站码搜尋漏掉。
- 唯一苗栗紀錄161次，來源事件07:29:11、status=2；收到時約248秒，且為初始快照。不得用這筆判定剛通過或校正精準過站時刻。
- 包裝UpdateTime07:33:04、SrcUpdateTime07:33:00、UpdateInterval30、SrcUpdateInterval60；包裝新鮮不代表每列資料都新鮮。
- 當次extract保留了源頭唯一苗栗紀錄；這份快照缺另外兩站是完整來源本身沒有它們，未發現本次解析遺失。

此為單次白天快照，只能判斷該次回應，不能宣稱TDX永遠不回報兩站或沒有實車經過。後續監測已具備完整來源證據，應按樣本時間窗檢查，再决定是否能建立三站鏈。

## 工作表狀態

07:32讀取「列車紀錄」A7:V1000，共600筆、全部苗栗；最新收到06:35:10.859791。工作表落後原始監測，不把最後一筆列車事件時間當監測停止時間。
完整原始資料存於GitHub artifact；工作表沿用既有事件備份流程，不新增完整來源陣列欄位。

## 接續規則

1. 優先讀sourceTrainLiveBoards，核對StationID／StationName，再與records對照。舊檔沒有此欄位時，標記缺少原始完整來源，不猜補。
2. 若完整來源有3150或3170而records沒有，修解析；若完整來源沒有，記錄來源缺站，再交叉核對StationLiveBoard白天回應及停站班表。
3. StationLiveBoard的ScheduleArrivalTime／ScheduleDepartureTime仍為表定時刻，不能寫成實際到離站或通過時間。
4. 不把0筆說成沒車；來源過期、初始快照、凌晨運行日不明與誤點樣本仍按既有規則分開。

來源：
https://github.com/sparktseng/nara-select/pull/14
https://github.com/sparktseng/nara-select/actions/runs/37162105433
https://docs.google.com/spreadsheets/d/1HpRApokc_UHJm0YQ6V_Xcue6GXIJxMfuuFzdZnEZ8I8/edit
