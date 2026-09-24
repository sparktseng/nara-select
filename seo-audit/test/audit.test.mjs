import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { auditSite, urlToLocalPath } from '../src/audit.mjs';

test('maps public URLs to repository files', () => {
  assert.equal(urlToLocalPath('https://nara5.tw/'), 'index.html');
  assert.equal(urlToLocalPath('https://nara5.tw/en/'), 'en/index.html');
  assert.equal(urlToLocalPath('https://nara5.tw/story.html?lang=en'), 'story.html');
  assert.equal(urlToLocalPath('https://example.com/story.html'), null);
});

test('finds missing internal targets without network access', async () => {
  const root = await mkdtemp(join(tmpdir(), 'seo-audit-'));
  await mkdir(join(root, 'assets'));
  await writeFile(join(root, 'assets/site-tracking.js'), '');
  await writeFile(join(root, 'sitemap.xml'), '<urlset><url><loc>https://nara5.tw/</loc></url></urlset>');
  await writeFile(join(root, 'index.html'), '<html lang="zh-Hant"><head><title>Home</title><meta name="description" content="Description"><link rel="canonical" href="https://nara5.tw/"></head><body><h1>Home</h1><a href="/missing.html">Missing</a><script src="/assets/site-tracking.js"></script></body></html>');
  const report = await auditSite({ root });
  assert.ok(report.findings.some(item => item.code === 'INTERNAL_TARGET_MISSING'));
});

test('accepts a minimal valid static site', async () => {
  const root = await mkdtemp(join(tmpdir(), 'seo-audit-'));
  await mkdir(join(root, 'assets'));
  await writeFile(join(root, 'assets/site-tracking.js'), '');
  await writeFile(join(root, 'sitemap.xml'), '<urlset><url><loc>https://nara5.tw/</loc></url></urlset>');
  await writeFile(join(root, 'index.html'), '<html lang="zh-Hant"><head><title>Home</title><meta name="description" content="Description"><link rel="canonical" href="https://nara5.tw/"></head><body><h1>Home</h1><script src="/assets/site-tracking.js"></script></body></html>');
  const report = await auditSite({ root });
  assert.equal(report.summary.errors, 0);
});
