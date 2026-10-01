# 苗栗看火車：有限時段取樣草稿

本程式供現場校正使用，尚未啟用，也沒有發布網站或排程。
使用 Python 3 標準函式庫；在可信任後端從秘密設定提供
`TDX_CLIENT_ID`、`TDX_CLIENT_SECRET`。不要在聊天、指令參數、前端或 GitHub 填入值。
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
