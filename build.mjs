// build.mjs — render status.md into index.html using template.html.
//
// Deliberately tiny and dependency-light (one dep: marked). The build is
// ADDITIVE: status.md is the source of truth and is served as-is; this just
// prerenders it so visitors (and no-JS clients) get content on first paint.
//
// Non-destructive: writes to a temp file and swaps on success, so a broken
// build never replaces a known-good index.html.

import { readFile, writeFile, rename } from 'node:fs/promises';
import { marked } from 'marked';

const ROOT = new URL('./', import.meta.url);
const p = (name) => new URL(name, ROOT);

const [md, template] = await Promise.all([
  readFile(p('status.md'), 'utf8'),
  readFile(p('template.html'), 'utf8'),
]);

marked.setOptions({ gfm: true, breaks: false });
const content = marked.parse(md).trim();

// Build-time stamp in US Central (auto CST/CDT). This is the baseline; the
// page upgrades it client-side from status.md's Last-Modified header, so the
// shown time stays correct even when the build pipeline is down.
const built = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago',
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: '2-digit',
  timeZoneName: 'short',
}).format(new Date());

const BANNER = `<!--
  GENERATED FILE — do not edit by hand.
  Content lives in status.md; layout lives in template.html.
  index.html is rebuilt by build.mjs (and the GitHub Action) and any manual
  change here will be overwritten on the next build.
-->
`;

const html = template
  .replace('<!DOCTYPE html>\n', '<!DOCTYPE html>\n' + BANNER)
  .replace('{{content}}', content)
  .replaceAll('{{built}}', built)
  .replaceAll('{{year}}', String(new Date().getFullYear()));

const tmp = p('index.html.tmp');
await writeFile(tmp, html, 'utf8');
await rename(tmp, p('index.html'));

console.log('Built index.html from status.md');
