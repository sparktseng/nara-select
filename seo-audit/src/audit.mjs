import { createHash } from 'node:crypto';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://nara5.tw';
const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXCLUDED_DIRS = new Set(['.git', 'node_modules', 'seo-audit']);

function decode(value = '') {
  return value
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function stripTags(value = '') {
  return decode(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return decode(match?.[1] ?? match?.[2] ?? match?.[3] ?? '');
}

function firstTag(html, pattern) {
  return html.match(pattern)?.[0] || '';
}

function allTags(html, pattern) {
  return [...html.matchAll(pattern)].map(match => match[0]);
}

function contentMeta(html, name) {
  const tag = allTags(html, /<meta\b[^>]*>/gi).find(item => attr(item, 'name').toLowerCase() === name.toLowerCase());
  return tag ? attr(tag, 'content') : '';
}

function linkValue(html, rel, attribute = 'href') {
  const tag = allTags(html, /<link\b[^>]*>/gi).find(item => attr(item, 'rel').toLowerCase().split(/\s+/).includes(rel));
  return tag ? attr(tag, attribute) : '';
}

function pageUrl(path) {
  if (path === 'index.html') return `${SITE_ORIGIN}/`;
  if (path.endsWith('/index.html')) return `${SITE_ORIGIN}/${path.slice(0, -10)}`;
  return `${SITE_ORIGIN}/${path}`;
}

export function urlToLocalPath(rawUrl) {
  const url = new URL(rawUrl, `${SITE_ORIGIN}/`);
  if (url.origin !== SITE_ORIGIN) return null;
  let path = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (!path || path.endsWith('/')) path += 'index.html';
  return path;
}

async function walk(dir, root, output = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && EXCLUDED_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, root, output);
    else output.push(relative(root, full).split(sep).join('/'));
  }
  return output;
}

function fingerprint(finding) {
  return createHash('sha256')
    .update([finding.severity, finding.code, finding.page || '', finding.target || '', finding.message].join('|'))
    .digest('hex').slice(0, 16);
}

function add(findings, severity, code, message, page = '', target = '') {
  const finding = { severity, code, message, page, target };
  finding.fingerprint = fingerprint(finding);
  findings.push(finding);
}

function parsePage(path, html) {
  // Remove inline script/style bodies before scanning HTML references. This prevents
  // template strings such as `<a href="${value}">` from becoming false links while
  // retaining real <script src> tags for asset validation.
  const referenceHtml = html
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  const title = stripTags(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
  const description = contentMeta(html, 'description');
  const canonical = linkValue(html, 'canonical');
  const robots = contentMeta(html, 'robots').toLowerCase();
  const htmlTag = firstTag(html, /<html\b[^>]*>/i);
  const alternates = allTags(html, /<link\b[^>]*>/gi)
    .filter(tag => attr(tag, 'rel').toLowerCase().split(/\s+/).includes('alternate') && attr(tag, 'hreflang'))
    .map(tag => ({ lang: attr(tag, 'hreflang'), href: attr(tag, 'href') }));
  const h1s = allTags(html, /<h1\b[^>]*>[\s\S]*?<\/h1>/gi).map(stripTags);
  const jsonLd = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1].trim());
  const refs = allTags(referenceHtml, /<(?:a|img|script|link)\b[^>]*>/gi)
    .map(tag => attr(tag, /^<a/i.test(tag) || /^<link/i.test(tag) ? 'href' : 'src'))
    .filter(Boolean);
  return { path, html, title, description, canonical, robots, lang: attr(htmlTag, 'lang'), alternates, h1s, jsonLd, refs };
}

function isIndexable(page) {
  return page.path !== '404.html' && !page.robots.includes('noindex');
}

function contentBeforeHead(html) {
  const htmlTag = html.match(/<html\b[^>]*>/i);
  const headTag = html.match(/<head\b[^>]*>/i);
  if (!htmlTag || !headTag || headTag.index < htmlTag.index) return null;
  return html
    .slice(htmlTag.index + htmlTag[0].length, headTag.index)
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

function resolveInternalRef(page, raw) {
  if (/^(?:mailto:|tel:|javascript:|data:)/i.test(raw) || raw.startsWith('#')) return null;
  let url;
  try { url = new URL(raw, pageUrl(page.path)); } catch { return null; }
  if (url.origin !== SITE_ORIGIN) return null;
  return { raw, path: urlToLocalPath(url), url: url.href };
}

export async function auditSite({ root = DEFAULT_ROOT } = {}) {
  const files = await walk(root, root);
  const fileSet = new Set(files);
  const htmlFiles = files.filter(path => extname(path).toLowerCase() === '.html');
  const pages = new Map();
  for (const path of htmlFiles) pages.set(path, parsePage(path, await readFile(join(root, path), 'utf8')));
  const findings = [];

  let sitemapUrls = [];
  try {
    const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
    sitemapUrls = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map(match => decode(match[1].trim()));
  } catch {
    add(findings, 'error', 'SITEMAP_MISSING', 'sitemap.xml is missing.');
  }
  const sitemapPaths = new Set();
  for (const url of sitemapUrls) {
    let path;
    try { path = urlToLocalPath(url); } catch { path = null; }
    if (!path) add(findings, 'error', 'SITEMAP_FOREIGN_URL', 'Sitemap URL is outside nara5.tw.', 'sitemap.xml', url);
    else if (!fileSet.has(path)) add(findings, 'error', 'SITEMAP_TARGET_MISSING', 'Sitemap URL has no matching local file.', 'sitemap.xml', url);
    else sitemapPaths.add(path);
  }

  for (const page of pages.values()) {
    const indexable = isIndexable(page);
    const expectedCanonical = pageUrl(page.path);
    const beforeHead = contentBeforeHead(page.html);
    if (beforeHead === null) add(findings, 'error', 'DOCUMENT_STRUCTURE', 'Page must contain <html> followed by <head>.', page.path);
    else if (beforeHead) add(findings, 'error', 'CONTENT_BEFORE_HEAD', 'HTML content must not appear between <html> and <head>.', page.path);
    if (!page.title) add(findings, 'error', 'TITLE_MISSING', 'Page has no title.', page.path);
    if (!page.description && indexable) add(findings, 'error', 'DESCRIPTION_MISSING', 'Indexable page has no meta description.', page.path);
    if (!page.canonical && indexable) add(findings, 'error', 'CANONICAL_MISSING', 'Indexable page has no canonical URL.', page.path);
    else if (page.canonical && page.canonical !== expectedCanonical) add(findings, 'error', 'CANONICAL_MISMATCH', `Canonical should be ${expectedCanonical}.`, page.path, page.canonical);
    if (!page.lang) add(findings, 'warning', 'HTML_LANG_MISSING', 'Page has no html lang attribute.', page.path);
    if (page.h1s.length !== 1 && indexable) add(findings, 'error', 'H1_COUNT', `Expected one H1; found ${page.h1s.length}.`, page.path);
    if (indexable && !sitemapPaths.has(page.path)) add(findings, 'warning', 'SITEMAP_COVERAGE', 'Indexable HTML page is not listed in sitemap.xml.', page.path);
    if (page.alternates.length && !page.alternates.some(item => item.lang === 'x-default')) add(findings, 'warning', 'HREFLANG_X_DEFAULT', 'Hreflang set has no x-default.', page.path);
    const seenLangs = new Set();
    for (const alternate of page.alternates) {
      if (seenLangs.has(alternate.lang)) add(findings, 'error', 'HREFLANG_DUPLICATE', `Duplicate hreflang ${alternate.lang}.`, page.path, alternate.href);
      seenLangs.add(alternate.lang);
      let target;
      try { target = urlToLocalPath(alternate.href); } catch { target = null; }
      if (!target || !fileSet.has(target)) add(findings, 'error', 'HREFLANG_TARGET_MISSING', `Hreflang ${alternate.lang} target is missing.`, page.path, alternate.href);
    }
    for (const block of page.jsonLd) {
      try { JSON.parse(block); } catch (error) { add(findings, 'error', 'JSONLD_INVALID', `Invalid JSON-LD: ${error.message}`, page.path); }
    }
    if (indexable && !page.html.includes('/assets/site-tracking.js')) add(findings, 'warning', 'GA4_SCRIPT_MISSING', 'Indexable page does not load the existing site tracking script.', page.path);
    for (const raw of page.refs) {
      const ref = resolveInternalRef(page, raw);
      if (!ref) continue;
      if (!fileSet.has(ref.path)) add(findings, 'error', 'INTERNAL_TARGET_MISSING', 'Internal href/src target is missing.', page.path, raw);
    }
  }

  for (const field of ['title', 'description']) {
    const groups = new Map();
    for (const page of pages.values()) {
      if (!isIndexable(page) || !page[field]) continue;
      const key = page[field].trim().toLowerCase();
      groups.set(key, (groups.get(key) || []).concat(page.path));
    }
    for (const paths of groups.values()) {
      if (paths.length > 1) add(findings, 'warning', `DUPLICATE_${field.toUpperCase()}`, `Duplicate ${field} across ${paths.length} pages.`, paths.join(', '));
    }
  }

  const referencedPages = new Set(['index.html']);
  for (const page of pages.values()) {
    for (const raw of page.refs) {
      const ref = resolveInternalRef(page, raw);
      if (ref?.path && pages.has(ref.path)) referencedPages.add(ref.path);
    }
  }
  for (const page of pages.values()) {
    if (isIndexable(page) && !referencedPages.has(page.path)) add(findings, 'warning', 'ORPHAN_PAGE', 'No internal HTML link points to this page.', page.path);
  }

  findings.sort((a, b) => `${a.severity}|${a.code}|${a.page}`.localeCompare(`${b.severity}|${b.code}|${b.page}`));
  return {
    generatedAt: new Date().toISOString(),
    siteOrigin: SITE_ORIGIN,
    summary: {
      htmlPages: pages.size,
      sitemapUrls: sitemapUrls.length,
      errors: findings.filter(item => item.severity === 'error').length,
      warnings: findings.filter(item => item.severity === 'warning').length
    },
    findings
  };
}

function markdown(report, baselineErrors = new Set()) {
  const newErrors = report.findings.filter(item => item.severity === 'error' && !baselineErrors.has(item.fingerprint));
  const lines = [
    '# Nara Select SEO audit', '',
    `Generated: ${report.generatedAt}`, '',
    `- HTML pages: ${report.summary.htmlPages}`,
    `- Sitemap URLs: ${report.summary.sitemapUrls}`,
    `- Errors: ${report.summary.errors}`,
    `- Warnings: ${report.summary.warnings}`,
    `- New errors vs baseline: ${newErrors.length}`, '',
    '| Severity | Code | Page | Detail |',
    '|---|---|---|---|'
  ];
  for (const item of report.findings) lines.push(`| ${item.severity} | ${item.code} | ${item.page || '—'} | ${(item.message + (item.target ? ` Target: ${item.target}` : '')).replace(/\|/g, '\\|')} |`);
  if (!report.findings.length) lines.push('| — | PASS | — | No findings |');
  return { text: `${lines.join('\n')}\n`, newErrors };
}

async function readBaseline(path) {
  if (!path) return new Set();
  try {
    const json = JSON.parse(await readFile(path, 'utf8'));
    return new Set(json.allowedErrorFingerprints || []);
  } catch { return new Set(); }
}

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function main() {
  const root = resolve(arg('--root') || DEFAULT_ROOT);
  const output = resolve(arg('--output') || join(root, 'seo-audit/reports'));
  const baselinePath = arg('--baseline') ? resolve(arg('--baseline')) : null;
  const writeBaselinePath = arg('--write-baseline') ? resolve(arg('--write-baseline')) : null;
  const report = await auditSite({ root });
  if (writeBaselinePath) {
    const baseline = {
      generatedAt: report.generatedAt,
      allowedErrorFingerprints: report.findings.filter(item => item.severity === 'error').map(item => item.fingerprint)
    };
    await mkdir(dirname(writeBaselinePath), { recursive: true });
    await writeFile(writeBaselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
  }
  const baseline = await readBaseline(writeBaselinePath || baselinePath);
  const rendered = markdown(report, baseline);
  await mkdir(output, { recursive: true });
  await writeFile(join(output, 'seo-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(join(output, 'seo-audit.md'), rendered.text);
  console.log(rendered.text);
  if (rendered.newErrors.length) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error); process.exitCode = 1; });
