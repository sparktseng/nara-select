# 鐵路一村史料爬蟲與網路監測

零外部套件的 Node.js 20 爬蟲，定期搜尋「苗栗火車頭園區／苗栗鐵路一村／文創五號店」相關公開內容，執行去重、分類、資訊勘誤提示與官方連結健康檢查。

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

輸出的 `candidates` 含候選 ID、標題、網址、發布時間、來源、主體、分類、關鍵字與勘誤警示；`linkChecks` 是連結狀態；`errors` 保留失敗原因。
