import test from 'node:test';
import assert from 'node:assert/strict';
import { archiveSnapshotFromJson, buildSearchFeeds, candidateId, classify, commonsRows, dedupe, normalizeUrl, parseRss, robotsAllows } from '../src/radar.mjs';

const config = {
  subjects: { '園區': ['苗栗火車頭園區'], '5號店': ['文創五號店'] },
  categories: { '資訊勘誤': ['09:30'], '史料線索': ['老照片'], '網路聲量': ['參觀'] },
  misinformationRules: [{ id: 'wrong-hours', pattern: '09[:：]30.{0,20}17[:：]30', note: '錯誤時間' }]
};

test('URL 正規化會移除追蹤參數與片段', () => {
  assert.equal(normalizeUrl('https://www.Example.com/a/?utm_source=x&b=2#top'), 'https://example.com/a?b=2');
});

test('RSS 解析與 XML 解碼', () => {
  const xml = '<rss><channel><item><guid>x1</guid><title><![CDATA[苗栗火車頭園區 &amp; 活動]]></title><link>https://example.com/a</link><pubDate>Fri, 18 Sep 2026 00:00:00 GMT</pubDate><description><![CDATA[<b>參觀</b>心得]]></description></item></channel></rss>';
  const [item] = parseRss(xml, '苗栗');
  assert.equal(item.sourceItemId, 'x1');
  assert.equal(item.title, '苗栗火車頭園區 & 活動');
  assert.equal(item.summary, '參觀 心得');
});

test('辨識主體與錯誤資訊', () => {
  const result = classify({ title: '苗栗火車頭園區營業時間', summary: '09:30 到 17:30' }, config);
  assert.deepEqual(result.subjects, ['園區']);
  assert.equal(result.category, '資訊勘誤');
  assert.equal(result.warnings[0].ruleId, 'wrong-hours');
});

test('依來源 ID、網址與標題日期去重', () => {
  const base = { sourceItemId: '1', title: '苗栗火車頭園區活動', url: 'https://example.com/a?utm_source=x', publishedAt: '2026-09-18' };
  const duplicateUrl = { ...base, sourceItemId: '2', url: 'https://example.com/a' };
  const unique = dedupe([base, duplicateUrl], []);
  assert.equal(unique.length, 1);
  assert.equal(unique[0].id, candidateId(base));
  assert.equal(dedupe([base], [candidateId(base)]).length, 0);
});

test('robots.txt disallow 規則會生效', () => {
  assert.equal(robotsAllows('User-agent: *\nDisallow: /private', '/private/a'), false);
  assert.equal(robotsAllows('User-agent: *\nDisallow: /private', '/public'), true);
});

test('第二批史料來源會併入搜尋清單', () => {
  const feeds = buildSearchFeeds({ queries: ['園區'], lookbackDays: 14, historySearchFeeds: [{ name: '國家文化記憶庫', query: '鐵路', lookbackDays: 36500 }] });
  assert.equal(feeds.length, 2);
  assert.equal(feeds[1].name, '國家文化記憶庫');
  assert.equal(feeds[1].lookbackDays, 36500);
});

test('Wikimedia Commons 影像保留作者與授權', () => {
  const json = { query: { pages: { 1: { pageid: 1, title: 'File:Miaoli.jpg', fullurl: 'https://commons.wikimedia.org/wiki/File:Miaoli.jpg', imageinfo: [{ timestamp: '2020-01-01T00:00:00Z', url: 'https://upload.wikimedia.org/a.jpg', extmetadata: { Artist: { value: '作者甲' }, LicenseShortName: { value: 'CC BY-SA 4.0' }, ImageDescription: { value: '苗栗鐵路影像' } } }] } } } };
  const [row] = commonsRows(json, '苗栗 鐵路');
  assert.equal(row.category, undefined);
  assert.equal(row.defaultCategory, '影像授權');
  assert.equal(row.lookbackDays, 36500);
  assert.equal(row.license, 'CC BY-SA 4.0');
  assert.match(row.summary, /作者甲/);
});

test('Wayback 回應轉成可用存檔線索', () => {
  const snapshot = archiveSnapshotFromJson({ archived_snapshots: { closest: { available: true, url: 'http://web.archive.org/web/20200101/https://example.com', timestamp: '20200101', status: '200' } } });
  assert.equal(snapshot.url.startsWith('https://'), true);
  assert.equal(snapshot.timestamp, '20200101');
});
