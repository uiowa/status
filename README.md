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
3. Commit directly to `main` with a short message.

The live page picks up edits right away; the Action rebuilds
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

## Local development

```sh
npm install
npm run build      # regenerates index.html
open index.html
```
