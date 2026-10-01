# 苗栗看火車：有限時段取樣草稿

本程式供現場校正使用。main 已安裝手動單筆連線測試 workflow；
尚未使用真實金鑰驗收，也未啟動現場取樣或定期排程。
使用 Python 3 標準函式庫；在可信任後端從秘密設定提供
`TDX_CLIENT_ID`、`TDX_CLIENT_SECRET`。秘密值只填入 GitHub Actions Secrets 或可信任後端的秘密設定。
不要填入聊天、指令參數、前端、repository 檔案、commit 或 workflow 明文。
授權採官方 Client Credentials 流程並在記憶體快取 token：
https://github.com/tdxmotc/SampleCode

範例（後端已配置秘密值才可執行）：

```sh
python train-watch/collect.py --samples 30 --interval 60 --output /private/train-samples/session.jsonl
```

預設 30 筆，每分鐘一次，约29分鐘；最多180筆、間隔至少60秒。
資料查詢無重試，每次嘗試都計入預算；授權最多3次，錯誤立即停止。
實際配額／收費須先確認；有上限不代表免費。
輸出需放在網站根目錄之外，不可公開。使用新檔名，拒絕覆寫。

每筆保存 receivedAt、TDX UpdateTime、SrcUpdateTime、更新間隔、車次、
站點、狀態、誤點及列車更新時間。保留未變動的樣本以辨識來源沒有更新；
來源超過180秒未更新會標記sourceStale，缺時間則為null。
所有時間包含時區。receivedAt是抓取時間，UpdateTime是資料事件時間，
都不能當成園區真正通過時刻；站名依TDX說明可能是最近離開的經過站。
本程式未產生倒數、辨識彩繪編組或確認現場車次。

現場同步記固定位置、分鐘或秒的精度、方向、車型、車次證據，
分開標示看到／持續等候未見／未觀察。只有配對確認後才計算誤差。
先跑單筆驗收，再選雙方同時記錄的短時段；不要回填上午缺失動態。

## 2026-10-01：手動連線測試已安裝

執行入口：
https://github.com/sparktseng/nara-select/actions/workflows/train-watch-probe.yml

金鑰設定入口：
https://github.com/sparktseng/nara-select/settings/secrets/actions

按 New repository secret，分別新增：
- Name：TDX_CLIENT_ID；Secret：TDX 服務金鑰中的 Client ID。
- Name：TDX_CLIENT_SECRET；Secret：同一組服務金鑰中的 Client Secret。

使用者在 GitHub 頁面直接輸入；不由聊天接收或讀取秘密值。
在 Actions 頁面選 main，按 Run workflow 只抓一筆。
先確認 TDX 可用配額；本測試最多一次資料查詢，沒有資料重試。
成功只表示後端連線與格式驗收；現場預警精度仍未驗證。

此 workflow 已位於 main，以固定 commit 7ada2d8893b50f883cdc8008c935089c5d50fb16
讀取本草稿程式。第三方 Actions 固定 SHA，repository 權限只讀，
沒有 push／pull_request／schedule 觸發，不會寫回取樣資料或修改網站。
資料放 runner.temp，以 Actions artifact 留存7天；下載需登入且有repository讀取權限，
並非只有owner可看。公開執行日誌只輸出樣本數、列車數及簡化錯誤；
不输出 token、授權標頭、金鑰或原始HTTP回應。
執行前不需另外租用主機。持續取樣仍需另外配置與驗收。
