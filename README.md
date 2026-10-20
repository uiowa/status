# status

A build-independent `uiowa.edu` page for posting updates during
infrastructure outages.

## How it works

- **`status.md` is the live source of truth.** It is the only file editors need
  to touch.
- The page renders `status.md` **in the browser** from a vendored copy of
  `marked`, so a fresh edit reaches visitors immediately — even if the build
  pipeline is down.
- A GitHub Action also **prerenders** `status.md` into `index.html` so the page
  shows content on first paint and for visitors without JavaScript.
- Branding (the gold bar, IOWA wordmark, footer) is **self-hosted** University of
  Iowa Design System styling. The only external dependency is web fonts, and the
  page stays legible with system fonts if those fail to load.

## Editing the status (for ITS Help Desk or OSC)

1. Open [`status.md`](status.md) and click the pencil (**Edit**) icon on GitHub.
2. Update the fields. Add each new update to the top of **Past updates** with a
   timestamp — keep older entries beneath it as a running log.
3. Click **Commit changes**. Because `main` is protected, GitHub opens a quick
   pull request — give it a short title, **Create**, then **Merge** it. No review
   is required for `status.md`, so you can merge your own change right away.

The live page picks up the edit as soon as it merges; the Action rebuilds
`index.html` a moment later.

## Repo layout

| Path | Purpose |
| ---- | ------- |
| `status.md` | **The content.** Editors only touch this. |
| `index.html` | Committed, prerendered page (generated — do not hand-edit). |
| `template.html` | Page shell: brand bar, footer, critical inline CSS, render script. |
| `build.mjs` | ~30-line build: `marked(status.md)` → `template.html` → `index.html`. |
| `assets/marked.min.js` | Vendored Markdown renderer (no CDN). |
| `assets/uids-branding.css` | Trimmed University of Iowa branding CSS. |
| `.github/workflows/build.yml` | Builds and commits `index.html` on change. |

## Serving & SEO (cutover)

When this page goes live it is served at **`uiowa.edu` itself** — the org's
most-indexed URL — so crawler signals apply to the real homepage. Whoever wires
the cutover must:

- **Return HTTP `503 Service Unavailable` with a `Retry-After` header.** Set this at
  the edge (Cloudflare Worker / Netlify / Vercel), *not* in the HTML — a static host
  serves `200` and a file can't set its own status. `503` is Google's documented
  *temporary* signal: it preserves the existing search listing, won't index the outage
  text, and prompts a later recrawl.
- **Never add `noindex` or a robots.txt disallow.** Those mean *permanent* removal and
  can deindex `uiowa.edu`. `503` is the correct, reversible signal.

GitHub Pages can't set a custom status (it serves `200`); accept that on that fallback
leg only.

## Local development

```sh
npm install
npm run build      # regenerates index.html
open index.html
```
