import test from 'node:test';
import assert from 'node:assert/strict';
import { archiveSnapshotFromJson, buildSearchFeeds, candidateId, classify, commonsRows, dedupe, mergeCandidateCache, normalizeUrl, parseRss, robotsAllows } from '../src/radar.mjs';

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

test('候選佇列會保留前次結果並去重', () => {
  const a = { sourceItemId: 'a', title: 'A', url: 'https://example.com/a' };
  const b = { sourceItemId: 'b', title: 'B', url: 'https://example.com/b' };
  const cache = mergeCandidateCache([a], [a, b]);
  assert.equal(cache.length, 2);
  assert.deepEqual(cache.map(row => row.sourceItemId), ['a', 'b']);
});

const { fetchWithRetry, threadsErrorDetails, run } = await import('../src/radar.mjs');
const { mkdtemp, writeFile, readFile, rm } = await import('node:fs/promises');
const { tmpdir } = await import('node:os');
const { join } = await import('node:path');

test('搜尋遇到 503 與逾時會重試並恢復', async () => {
  let calls = 0;
  const response = await fetchWithRetry('https://example.com', {}, { requestTimeoutMs: 1000, retryDelayMs: 0 }, async () => {
    calls++;
    if (calls === 1) return new Response('', { status: 503 });
    if (calls === 2) throw new Error('timeout');
    return new Response('ok');
  });
  assert.equal(calls, 3);
  assert.equal(await response.text(), 'ok');
});

test('搜尋重試有上限，400 不重試', async () => {
  for (const [status, expected] of [[503, 3], [400, 1]]) {
    let calls = 0;
    await assert.rejects(fetchWithRetry('https://example.com', {}, { requestTimeoutMs: 1000, retryDelayMs: 0 }, async () => {
      calls++;
      return new Response('', { status });
    }), new RegExp(`HTTP ${status}`));
    assert.equal(calls, expected);
  }
});

test('Threads 診斷保留代碼但不輸出權杖與原始訊息', () => {
  const detail = threadsErrorDetails(400, { error: { code: 190, error_subcode: 463, message: 'secret-token', access_token: 'secret-token' } });
  assert.match(detail, /code=190/);
  assert.match(detail, /error_subcode=463/);
  assert.match(detail, /重新授權/);
  assert.doesNotMatch(detail, /secret-token/);
});

test('來源部分失敗仍寫入報告並保留候選資料', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'radar-test-'));
  const configPath = join(dir, 'config.json');
  const statePath = join(dir, 'state.json');
  const outputPath = join(dir, 'latest.json');
  const oldToken = process.env.THREADS_ACCESS_TOKEN;
  process.env.THREADS_ACCESS_TOKEN = 'test-only';
  try {
    const prior = { sourceItemId: 'cached', title: '舊史料', url: 'https://example.com/prior' };
    await writeFile(configPath, JSON.stringify({ ...config, queries: ['苗栗'], allowedDomains: ['example.com'], requestTimeoutMs: 1000, requestDelayMs: 0, retryDelayMs: 0, maxItemsPerQuery: 10, lookbackDays: 36500, timezone: 'Asia/Taipei' }));
    await writeFile(statePath, JSON.stringify({ seenIds: [candidateId(prior)], candidateCache: [prior] }));
    const report = await run({ configPath, statePath, outputPath, fetchImpl: async url => {
      if (String(url).includes('graph.threads.net')) return Response.json({ error: { code: 190, error_subcode: 463, message: 'test-only' } }, { status: 400 });
      return new Response('<rss><channel><item><guid>new</guid><title>苗栗火車頭園區新史料</title><link>https://example.com/new</link></item></channel></rss>');
    } });
    assert.equal(report.run.status, '部分失敗');
    assert.equal(report.run.newCandidates, 1);
    assert.equal(report.candidates.length, 2);
    assert.match(report.errors[0].error, /code=190/);
    const saved = await readFile(outputPath, 'utf8');
    assert.doesNotMatch(saved, /test-only/);
    assert.equal(JSON.parse(saved).candidates.length, 2);
    assert.equal(JSON.parse(await readFile(statePath, 'utf8')).candidateCache.length, 2);
  } finally {
    if (oldToken === undefined) delete process.env.THREADS_ACCESS_TOKEN;
    else process.env.THREADS_ACCESS_TOKEN = oldToken;
    await rm(dir, { recursive: true, force: true });
  }
});
