# 鐵路一村史料爬蟲與網路監測

零外部套件的 Node.js 20 爬蟲，定期搜尋「苗栗火車頭園區／苗栗鐵路一村／文創五號店」相關公開內容，執行去重、分類、資訊勘誤提示與官方連結健康檢查。

第二批史料來源已涵蓋國家文化記憶庫、國家圖書館、政府資料開放平臺、臺鐵、客委會、苗栗縣政府、Wikimedia Commons、地方新聞、部落格、影音平台與 Wayback Machine 存檔線索。官方及地方網站以限定網域的 RSS 搜尋進行公開發現；Wikimedia Commons 與 Wayback Machine 使用公開 API。

## 執行

```bash
cd history-radar
npm test
npm run dry-run
npm run crawl
```

正式結果寫入 `data/history-radar/latest.json`，永久去重索引寫入 `data/history-radar/state.json`。GitHub Actions 每日於台北時間 07:20 執行，也可手動觸發。

## 資料原則

- 只讀取公開資料並遵守 robots.txt，不繞過登入、驗證碼或付費牆。
- 自動結果僅是「待審核候選」，不直接寫入史料主庫。
- 來源 ID、正規化網址、標題加日期三層去重。
- API 無法存取時記錄為「API未取得」，絕不當成零聲量。
- Threads 僅走官方 API；需設定 GitHub Actions Secret `THREADS_ACCESS_TOKEN` 才啟用。
- Wikimedia Commons 會保存作者與授權欄位；授權仍須人工覆核後才能使用影像。
- 失效網址會查詢 Wayback Machine 是否存在可讀取的歷史快照。

輸出的 `candidates` 含候選 ID、標題、網址、發布時間、來源、主體、分類、關鍵字與勘誤警示；`linkChecks` 是連結狀態；`errors` 保留失敗原因。
