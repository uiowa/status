import { readFile, writeFile, rename } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { Marked } from 'marked';
import { renderMarkdown } from './assets/render.mjs';

const p = (name) => new URL(name, import.meta.url);

const [md, template] = await Promise.all([
  readFile(p('status.md'), 'utf8'),
  readFile(p('template.html'), 'utf8'),
]);

const content = renderMarkdown(md, Marked);

// "Last updated" = commit time of status.md (needs fetch-depth: 0 in CI).
function contentDate() {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', 'status.md'],
      { encoding: 'utf8' }).trim();
    const d = iso ? new Date(iso) : null;
    if (d && !Number.isNaN(d.getTime())) return d;
  } catch {}
  return new Date();
}

const built = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago',
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
}).format(contentDate());

const BANNER = `<!--
  GENERATED FILE — do not edit by hand. Edit status.md or template.html.
-->
`;

const page = template
  .replace('{{content}}', () => content)
  .replaceAll('{{built}}', built)
  .replaceAll('{{year}}', String(new Date().getFullYear()))
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/^[ \t]+$/gm, '')
  .replace(/\n{3,}/g, '\n\n');

const html = page.replace('<!DOCTYPE html>\n', '<!DOCTYPE html>\n' + BANNER);

const tmp = p('index.html.tmp');
await writeFile(tmp, html, 'utf8');
await rename(tmp, p('index.html'));
console.log('Built index.html from status.md');
