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
3. Click **Commit changes** and commit **directly to `main`** with a short message.

The live page picks up your edit right away; the Action rebuilds `index.html` a
moment later.

**Everything in `status.md` is public** — it's served as-is (the "plain text"
link points at it), so never put anything private in it.

### Update template

The default message stands on its own. When you have specifics, replace it with
incident details — a starting point:

```markdown
**What is affected:** e.g., uiowa.edu and department sites
**What is not affected:** e.g., email, phones, in-person services
**Next update by:** date and time

## Past updates
- (date / time CT) — Initial notice posted.
```

For an actual campus emergency (not just a website outage), you can point people
to Hawk Alerts, which needs no login or website: **text `HAWK4WEEK` to `67283`.**

## Repo layout

| Path | Purpose |
| ---- | ------- |
| `status.md` | **The content.** Editors only touch this. |
| `index.html` | Committed, prerendered page (generated — do not hand-edit). |
| `template.html` | Page shell: brand bar, footer, critical inline CSS, render script. |
| `build.mjs` | ~30-line build: `marked(status.md)` → `template.html` → `index.html`. |
| `assets/marked.min.js` | Vendored Markdown renderer (no CDN). |
| `assets/render.mjs` | Shared Markdown renderer (build + browser); Markdown only. |
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
- **Exempt `/assets/*` and `/status.md` from the edge rules.** The page loads them by
  relative path; if the edge `503`s or catch-alls *every* path, the CSS/JS won't apply
  and the live `status.md` fetch bails, so a fresh edit can't reach visitors while the
  build is down (the inline critical CSS + prerender still show).

GitHub Pages can't set a custom status (it serves `200`); accept that on that fallback
leg only.

## Local development

```sh
npm install
npm run build      # regenerates index.html
open index.html
```
