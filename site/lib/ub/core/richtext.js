/* Admin-ы засварлагчаар (admin/src/views/RichText.tsx) бичсэн мэдээний HTML-ийг сайтад харуулахаас өмнө шүүнэ:
   зөвшөөрсөн таг, атрибутаас бусдыг (script, style, onclick, javascript: холбоос ...) хасна. */
const ALLOWED = new Set(['P', 'BR', 'H2', 'H3', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A']);
const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'NOSCRIPT', 'SVG', 'MATH']);   // агуулгатайгаа хамт хасна

export function cleanHtml(html) {
  if (!html) return '';
  const root = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html').body.firstElementChild;
  const walk = (el) => {
    for (const n of Array.from(el.childNodes)) {
      if (n.nodeType === 3) continue;   // текст
      if (n.nodeType !== 1 || DROP.has(n.tagName)) { n.remove(); continue; }
      walk(n);
      if (!ALLOWED.has(n.tagName)) { n.replaceWith(...n.childNodes); continue; }   // таг нь хасагдаж агуулга нь үлдэнэ
      const href = n.tagName === 'A' ? (n.getAttribute('href') || '').trim() : '';
      for (const a of Array.from(n.attributes)) n.removeAttribute(a.name);
      if (n.tagName === 'A') {
        if (/^(https?:\/\/|mailto:)/i.test(href)) { n.setAttribute('href', href); n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener noreferrer'); }
        else n.replaceWith(...n.childNodes);
      }
    }
  };
  walk(root);
  while (root.lastElementChild && root.lastElementChild.tagName === 'P' && !root.lastElementChild.textContent.trim()) root.lastElementChild.remove();   // төгсгөлийн хоосон мөр
  return root.innerHTML;
}

/** HTML-д бодит текст байгаа эсэх (хоосон <p></p> биш) */
export const hasText = (html) => !!html && /[^\s]/.test(html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' '));
