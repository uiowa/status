// Shared Markdown renderer (build + browser). Markdown only: raw HTML dropped,
// link/image URLs scheme-restricted.
const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i;
const safeUrl = (href, fallback) =>
  SAFE_URL.test(String(href || '').trim()) ? href : fallback;

export function renderMarkdown(md, Marked) {
  const r = new Marked({
    gfm: true,
    breaks: false,
    renderer: {
      html: () => '',
      link(href, title, text) {
        return `<a href="${safeUrl(href, '#')}"${title ? ` title="${title}"` : ''}>${text}</a>`;
      },
      image(href, title, text) {
        return `<img src="${safeUrl(href, '')}" alt="${text || ''}"${title ? ` title="${title}"` : ''}>`;
      },
    },
  });
  return r.parse(md).trim();
}
