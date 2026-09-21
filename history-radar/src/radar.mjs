import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DEFAULT_CONFIG = resolve(ROOT, 'history-radar/config.json');
const DEFAULT_STATE = resolve(ROOT, 'data/history-radar/state.json');
const DEFAULT_OUTPUT = resolve(ROOT, 'data/history-radar/latest.json');
const UA = 'RailwayHistoryRadar/1.0 (+https://github.com/sparktseng/nara-select)';

export function decodeXml(value = '') {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).trim();
}

export function stripHtml(value = '') {
  return decodeXml(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
}

export function normalizeUrl(raw = '') {
  try {
    const url = new URL(raw);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(k => url.searchParams.delete(k));
    url.hash = '';
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/$/, '');
    const params = [...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b));
    url.search = '';
    params.forEach(([k, v]) => url.searchParams.append(k, v));
    return url.toString();
  } catch { return raw.trim(); }
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}

export function parseRss(xml, query = '', metadata = {}) {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(match => {
    const block = match[1];
    const rawLink = tag(block, 'link');
    return {
      sourceItemId: tag(block, 'guid') || rawLink,
      title: stripHtml(tag(block, 'title')),
      url: normalizeUrl(rawLink),
      publishedAt: tag(block, 'pubDate'),
      summary: stripHtml(tag(block, 'description')),
      publisher: stripHtml(tag(block, 'source')),
      query,
      ...metadata
    };
  }).filter(item => item.title && item.url);
}

function hostnameAllowed(raw, allowedDomains) {
  try {
    const host = new URL(raw).hostname.toLowerCase();
    return allowedDomains.some(domain => host === domain || host.endsWith(`.${domain}`));
  } catch { return false; }
}

export function classify(item, config) {
  const text = `${item.title} ${item.summary}`;
  const lower = text.toLowerCase();
  const subjects = [...new Set((item.subjectHints || []).concat(Object.entries(config.subjects)
    .filter(([, words]) => words.some(word => lower.includes(word.toLowerCase())))
    .map(([name]) => name)))];
  const warnings = config.misinformationRules
    .filter(rule => new RegExp(rule.pattern, 'iu').test(text))
    .map(rule => ({ ruleId: rule.id, note: rule.note }));
  let category = warnings.length ? '資訊勘誤' : (item.defaultCategory || '網路聲量');
  if (!warnings.length && !item.defaultCategory) {
    for (const [name, words] of Object.entries(config.categories)) {
      if (words.some(word => lower.includes(word.toLowerCase()))) { category = name; break; }
    }
  }
  const matchedKeywords = [...new Set(Object.values(config.subjects).flat().concat(Object.values(config.categories).flat())
    .filter(word => lower.includes(word.toLowerCase())))];
  return { subjects, category, warnings, matchedKeywords };
}

export function candidateId(item) {
  const basis = item.sourceItemId || item.url || `${item.title}|${item.publishedAt || ''}`;
  return createHash('sha256').update(basis).digest('hex').slice(0, 24);
}

export function dedupe(items, priorIds = []) {
  const ids = new Set(priorIds);
  const urls = new Set();
  const titleDates = new Set();
  const output = [];
  for (const item of items) {
    const id = candidateId(item);
    const url = normalizeUrl(item.url);
    const titleDate = `${item.title.toLowerCase().replace(/\s+/g, '')}|${(item.publishedAt || '').slice(0, 16)}`;
    if (ids.has(id) || urls.has(url) || titleDates.has(titleDate)) continue;
    ids.add(id); urls.add(url); titleDates.add(titleDate);
    output.push({ ...item, id, url });
  }
  return output;
}

export function mergeCandidateCache(prior = [], incoming = [], limit = 500) {
  return dedupe(prior.concat(incoming), []).slice(-limit);
}

export function robotsAllows(text, pathname) {
  let applies = false;
  const disallowed = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const [key, ...rest] = line.split(':');
    const value = rest.join(':').trim();
    if (key?.toLowerCase() === 'user-agent') applies = value === '*';
    if (applies && key?.toLowerCase() === 'disallow' && value) disallowed.push(value);
  }
  return !disallowed.some(rule => pathname.startsWith(rule));
}

async function safeFetch(url, options, config, fetchImpl = fetch) {
  const target = new URL(url);
  let robotsStatus = '未檢查';
  try {
    const robots = await fetchImpl(`${target.protocol}//${target.host}/robots.txt`, {
      signal: AbortSignal.timeout(config.requestTimeoutMs), headers: { 'User-Agent': UA }
    });
    if (robots.ok) {
      if (!robotsAllows(await robots.text(), target.pathname)) return { ok: false, status: 0, error: 'robots.txt 禁止存取', robotsStatus: '禁止' };
      robotsStatus = '允許';
    } else robotsStatus = `未提供(${robots.status})`;
  } catch { robotsStatus = '無法取得'; }
  try {
    const response = await fetchImpl(url, {
      ...options, redirect: 'follow', signal: AbortSignal.timeout(config.requestTimeoutMs),
      headers: { 'User-Agent': UA, ...(options?.headers || {}) }
    });
    return { ok: response.ok, status: response.status, response, robotsStatus };
  } catch (error) {
    return { ok: false, status: 0, error: error.message, robotsStatus };
  }
}

export function buildSearchFeeds(config) {
  const monitoring = config.queries.map(query => ({
    name: 'Google News RSS', query, lookbackDays: config.lookbackDays
  }));
  return monitoring.concat(config.historySearchFeeds || []);
}

async function mapLimit(items, limit, worker) {
  const output = new Array(items.length);
  let cursor = 0;
  async function runWorker() {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runWorker));
  return output;
}

async function fetchGoogleNews(config, fetchImpl = fetch) {
  const results = [];
  const errors = [];
  const feeds = buildSearchFeeds(config);
  await mapLimit(feeds, 3, async feed => {
    const query = feed.query;
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`;
    try {
      const response = await fetchImpl(url, { signal: AbortSignal.timeout(config.requestTimeoutMs), headers: { 'User-Agent': UA } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      results.push(...parseRss(await response.text(), query, {
        sourceGroup: feed.name,
        defaultCategory: feed.category || null,
        lookbackDays: feed.lookbackDays ?? config.lookbackDays
      }).slice(0, config.maxItemsPerQuery));
    } catch (error) {
      errors.push({ source: 'Google News RSS', query, status: 'API未取得', error: error.message });
    }
    await new Promise(done => setTimeout(done, config.requestDelayMs));
  });
  return { results, errors };
}

function cleanCommonsText(value = '') {
  return stripHtml(String(value).replace(/\{\{[^{}]*\}\}/g, ' ')).slice(0, 1200);
}

export function commonsRows(json, query) {
  return Object.values(json?.query?.pages || {}).map(page => {
    const info = page.imageinfo?.[0] || {};
    const meta = info.extmetadata || {};
    const license = meta.LicenseShortName?.value || meta.UsageTerms?.value || '授權待核對';
    const artist = cleanCommonsText(meta.Artist?.value || '');
    const description = cleanCommonsText(meta.ImageDescription?.value || meta.ObjectName?.value || '');
    return {
      sourceItemId: `commons:${page.pageid}`,
      title: page.title?.replace(/^File:/, '') || 'Wikimedia Commons 影像',
      url: page.fullurl || info.descriptionurl || '',
      publishedAt: info.timestamp || '',
      summary: [description, artist && `作者：${artist}`, `授權：${license}`].filter(Boolean).join('；'),
      publisher: 'Wikimedia Commons',
      query,
      sourceGroup: 'Wikimedia Commons',
      defaultCategory: '影像授權',
      lookbackDays: 36500,
      subjectHints: ['園區'],
      mediaUrl: info.url || null,
      license,
      artist: artist || null
    };
  }).filter(item => item.url);
}

async function fetchWikimediaCommons(config, fetchImpl = fetch) {
  const settings = config.wikimediaCommons || {};
  if (!settings.enabled) return { results: [], errors: [] };
  const results = [];
  const errors = [];
  await mapLimit(settings.queries || [], 2, async query => {
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    Object.entries({
      action: 'query', generator: 'search', gsrsearch: query, gsrnamespace: '6',
      gsrlimit: String(settings.maxItemsPerQuery || 20), prop: 'imageinfo|info',
      iiprop: 'url|timestamp|extmetadata', inprop: 'url', format: 'json', origin: '*'
    }).forEach(([key, value]) => url.searchParams.set(key, value));
    try {
      const response = await fetchImpl(url, { signal: AbortSignal.timeout(config.requestTimeoutMs), headers: { 'User-Agent': UA } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      results.push(...commonsRows(await response.json(), query));
    } catch (error) {
      errors.push({ source: 'Wikimedia Commons API', query, status: 'API未取得', error: error.message });
    }
    await new Promise(done => setTimeout(done, config.requestDelayMs));
  });
  return { results, errors };
}

async function fetchThreads(config, fetchImpl = fetch) {
  const token = process.env.THREADS_ACCESS_TOKEN;
  if (!token) return { results: [], errors: [{ source: 'Threads API', status: 'API未取得', error: '未設定 THREADS_ACCESS_TOKEN' }] };
  const results = [];
  const errors = [];
  for (const query of config.queries.slice(0, 5)) {
    const url = new URL('https://graph.threads.net/keyword_search');
    url.searchParams.set('q', query);
    url.searchParams.set('fields', 'id,text,permalink,timestamp,username,media_type');
    url.searchParams.set('access_token', token);
    try {
      let response;
      let lastError;
      const timeoutMs = Math.max(config.requestTimeoutMs, 30000);
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
          if (response.ok || response.status < 500) break;
          lastError = new Error(`HTTP ${response.status}`);
        } catch (error) {
          lastError = error;
        }
        if (attempt < 3) await new Promise(done => setTimeout(done, attempt * 1000));
      }
      if (!response?.ok) throw lastError || new Error(`HTTP ${response?.status || 0}`);
      const json = await response.json();
      for (const row of json.data || []) results.push({
        sourceItemId: row.id, title: (row.text || '').slice(0, 120) || 'Threads 貼文',
        url: row.permalink, publishedAt: row.timestamp, summary: row.text || '',
        publisher: row.username ? `@${row.username}` : 'Threads', query
      });
    } catch (error) {
      errors.push({ source: 'Threads API', query, status: 'API未取得', error: error.message });
    }
  }
  return { results, errors };
}

async function checkLinks(config, fetchImpl = fetch) {
  return mapLimit(config.healthCheckUrls || [], 4, async url => {
    const result = await safeFetch(url, { method: 'HEAD' }, config, fetchImpl);
    let archivedSnapshot = null;
    if (!result.ok && result.robotsStatus !== '禁止') {
      try {
        const archiveUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
        const archiveResponse = await fetchImpl(archiveUrl, { signal: AbortSignal.timeout(config.requestTimeoutMs), headers: { 'User-Agent': UA } });
        if (archiveResponse.ok) archivedSnapshot = archiveSnapshotFromJson(await archiveResponse.json());
      } catch {}
    }
    return { url, checkedAt: new Date().toISOString(), ok: result.ok, httpStatus: result.status, robotsStatus: result.robotsStatus, error: result.error || null, archivedSnapshot };
  });
}

export function archiveSnapshotFromJson(json) {
  const closest = json?.archived_snapshots?.closest;
  if (!closest?.available || !closest.url) return null;
  return { url: closest.url.replace(/^http:/, 'https:'), timestamp: closest.timestamp || null, status: closest.status || null };
}

async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { return fallback; }
}

export async function run({ configPath = DEFAULT_CONFIG, statePath = DEFAULT_STATE, outputPath = DEFAULT_OUTPUT, dryRun = false, fetchImpl = fetch } = {}) {
  const startedAt = new Date().toISOString();
  const config = await readJson(configPath, {});
  const state = await readJson(statePath, { seenIds: [] });
  const [news, commons, threads, linkChecks] = await Promise.all([
    fetchGoogleNews(config, fetchImpl), fetchWikimediaCommons(config, fetchImpl),
    fetchThreads(config, fetchImpl), checkLinks(config, fetchImpl)
  ]);
  const discovered = news.results.concat(commons.results, threads.results)
    .filter(item => hostnameAllowed(item.url, config.allowedDomains))
    .filter(item => {
      const itemCutoff = Date.now() - (item.lookbackDays ?? config.lookbackDays) * 86400000;
      return !item.publishedAt || Number.isNaN(Date.parse(item.publishedAt)) || Date.parse(item.publishedAt) >= itemCutoff;
    })
    .map(item => ({ ...item, ...classify(item, config) }))
    .filter(item => item.subjects.length);
  const candidates = dedupe(discovered, state.seenIds);
  const brokenLinks = linkChecks.filter(check => [404, 410].includes(check.httpStatus)).map(check => ({
    id: candidateId({ sourceItemId: `link:${check.url}:${check.httpStatus}` }),
    sourceItemId: `link:${check.url}`, title: `連結檢查異常：${check.url}`,
    url: check.url, publishedAt: check.checkedAt,
    summary: [check.error || `HTTP ${check.httpStatus}`, check.archivedSnapshot?.url && `歷史快照：${check.archivedSnapshot.url}`].filter(Boolean).join('；'),
    publisher: '系統連結檢查', query: '', subjects: ['園區'], category: '失效網址',
    warnings: [], matchedKeywords: []
  }));
  const allCandidates = dedupe(candidates.concat(brokenLinks), state.seenIds);
  const candidateCache = mergeCandidateCache(state.candidateCache || [], allCandidates);
  const report = {
    schemaVersion: 1,
    run: {
      startedAt, finishedAt: new Date().toISOString(), timezone: config.timezone,
      status: news.errors.length === buildSearchFeeds(config).length ? '部分失敗' : '完成',
      discovered: discovered.length, newCandidates: allCandidates.length,
      availableCandidates: candidateCache.length
    },
    candidates: candidateCache, linkChecks, errors: news.errors.concat(commons.errors, threads.errors)
  };
  if (!dryRun) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n');
    const seenIds = [...new Set(state.seenIds.concat(allCandidates.map(item => item.id)))].slice(-10000);
    await writeFile(statePath, JSON.stringify({ updatedAt: report.run.finishedAt, seenIds, candidateCache }, null, 2) + '\n');
  }
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await run({ dryRun: process.argv.includes('--dry-run') });
  console.log(JSON.stringify(report.run));
  if (report.errors.length) console.error(JSON.stringify(report.errors));
  if (report.run.status === '部分失敗') process.exitCode = 2;
}
