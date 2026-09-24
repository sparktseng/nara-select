# SEO audit

Dependency-free, read-only audit for the static `nara5.tw` site. It checks sitemap coverage and targets, titles, descriptions, canonicals, H1s, internal links/assets, hreflang targets, JSON-LD syntax, duplicate metadata, orphan pages, and continued loading of the existing GA4 tracking script.

The audit never writes to site content, history-radar data, GA4/GSC, or GitHub Secrets. Generated reports stay in the workflow artifact and are not committed.

## Local commands

```bash
cd seo-audit
npm test
npm run audit
```

`baseline.json` contains only the fingerprints of errors already present when the audit was introduced. CI fails only when a new error appears; warnings remain visible in the report for planned cleanup.
