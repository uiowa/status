// Shared Markdown renderer (build + browser). Markdown only: raw HTML dropped,
// link/image URLs scheme-restricted.
const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i;
const safeUrl = (href, fallback) =>
  SAFE_URL.test(String(href || '').trim()) ? href : fallback;
// Escape for an HTML attribute so a crafted URL/title can't break out of quotes.
const attr = (s) =>
  String(s).replace(/[&"'<>]/g, (c) =>
    ({ '&': '&amp;', '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;' }[c]));

export function renderMarkdown(md, Marked) {
  const r = new Marked({
    gfm: true,
    breaks: false,
    renderer: {
      html: () => '',
      link(href, title, text) {
        return `<a href="${attr(safeUrl(href, '#'))}"${title ? ` title="${attr(title)}"` : ''}>${text}</a>`;
      },
      image(href, title, text) {
        return `<img src="${attr(safeUrl(href, ''))}" alt="${attr(text || '')}"${title ? ` title="${attr(title)}"` : ''}>`;
      },
    },
  });
  return r.parse(md).trim();
}
