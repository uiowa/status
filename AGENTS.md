# AGENTS.md

Guidance for AI agents (and humans) working in this repo. Read this before
changing anything.

## What this is

`status` — a lightly-branded continuity page for posting outage
updates. Its one job is to **keep working when AWS, Acquia, Drupal, or the build
tooling are down**. Every design choice serves that; don't trade it away for
tidiness or features.

## Golden rules

1. **`status.md` is the single source of truth** and the only file content
   editors touch. Keep its default message **generic and self-contained** — no
   `[fill in]` placeholders in the live text, because DNS may cut the homepage
   over to this page before anyone edits it. The fill-in template lives in an
   HTML comment (`<!-- ... -->`) that never renders.
2. **Never hand-edit `index.html`.** It is generated. Change `status.md`
   (content) or `template.html` (layout), then run the build.
3. **Do not hotlink anything except web fonts.** `marked`, the CSS, and the IOWA
   logo are vendored or inlined. Any new dependency must be committed to the
   repo, not loaded from a CDN at runtime. Fonts are the one exception (they
   degrade to system `sans-serif`/`serif` if the link fails).
4. **Keep the degradation ladder intact** — don't remove a rung:
   - inline **critical CSS** in `template.html` → gold bar + IOWA wordmark +
     readable text survive even if `uids-branding.css` fails;
   - **prerendered HTML** + a `<noscript>` link to `status.md` → works with JS
     off;
   - **client-side render** of the live `status.md` (vendored `marked`) → a
     fresh edit reaches visitors even when the build pipeline is down.
5. **Branding stays minimal and stable.** Rules come from the UIDS compiled dist
   but target the stable brand-bar/footer markup, with a small self-contained
   token block pinned to literal brand values.
6. **The build stays dependency-light** (single dep: `marked`) and
   **non-destructive** (write a temp file, swap on success) so a broken build
   never replaces a good `index.html`.

## Build & verify

```sh
npm install
node build.mjs      # regenerates index.html from status.md + template.html
```

Before shipping a change, confirm the ladder still holds:

- Load with **JS disabled** → brand bar, prerendered content, footer all render.
- Edit `status.md`, **don't** rebuild, load with JS on → the new text shows.
- Temporarily remove `uids-branding.css` → inline critical CSS still gives the
  gold bar + IOWA wordmark + legible text.

## Layout

| Path | Purpose |
| ---- | ------- |
| `status.md` | The content. Editors only touch this. |
| `index.html` | Generated, committed page. Do not hand-edit. |
| `template.html` | Shell: brand bar, footer, critical inline CSS, render script. |
| `build.mjs` | `marked(status.md)` → `template.html` → `index.html`. |
| `assets/marked.min.js` | Vendored Markdown renderer (no CDN). |
| `assets/uids-branding.css` | Trimmed UIDS branding, self-contained tokens. |
| `.github/workflows/build.yml` | Builds & commits `index.html` on change. |

## Review model

`CODEOWNERS` gives the `@uiowa/developer` team ownership of all plumbing;
`status.md` is intentionally **ownerless** so outage content can be updated
without a code review. Don't add an owner to `status.md`.
