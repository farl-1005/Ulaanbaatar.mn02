import { ICONS } from '../live.js';
/* ================= Helpers ================= */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
export const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const store = {
  get(k, d) { try { const v = localStorage.getItem('ubmn:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('ubmn:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
};
export function ic(n, c = 'w-5 h-5', sw = 1.9) {
  const b = ICONS[n];
  if (!b) console.warn('missing icon', n);
  return `<svg class="${c} shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${b || '<circle cx="12" cy="12" r="9"/>'}</svg>`;
}

/* Хөдөлгөөнт тэмдэг (өөрийн SVG + CSS хөдөлгөөн, styles/05-search.css-ийн .ai-*). name: 'siren' | 'vote' */
export function animIcon(name, c = 'w-6 h-6') {
  const a = `class="ai ai-${name} ${c} shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"`;
  if (name === 'siren') return `<svg ${a}>
    <g class="ai-ray ai-ray-a"><path d="M3 12.5H1.8"/><path d="m5.3 6.3-.9-.9"/></g>
    <g class="ai-ray ai-ray-b"><path d="M21 12.5h1.2"/><path d="m18.7 6.3.9-.9"/></g>
    <path class="ai-ray ai-ray-c" d="M12 2.6V1.4"/>
    <path d="M7 18v-6a5 5 0 1 1 10 0v6"/>
    <circle class="ai-lamp" cx="12" cy="13" r="2.1" fill="currentColor" stroke="none"/>
    <path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/></svg>`;
  if (name === 'vote') { const id = 'aic' + (++animIcon.n); return `<svg ${a}>
    <defs><clipPath id="${id}"><rect x="0" y="-6" width="24" height="18"/></clipPath></defs>
    <g clip-path="url(#${id})"><g class="ai-ballot"><rect x="9" y="3" width="6" height="10" rx="1"/><path class="ai-check" d="m10.4 7.9 1.2 1.2 2.1-2.3"/></g></g>
    <g class="ai-box"><path d="M3.5 12h5M15.5 12h5"/><path d="M3.5 12v7.5A1.5 1.5 0 0 0 5 21h14a1.5 1.5 0 0 0 1.5-1.5V12"/><path d="M8.5 16.5h7"/></g></svg>`; }
  return ic(name, c);
}
animIcon.n = 0;
/* Хөдөлгөөнт гал («Шуурхай мэдээ»): 3 давхар дөл тус бүр өөр хэмнэлээр найгана, ард нь гэрэлтэлт, дээш хөөрөх оч. styles/06-header-dock.css .fire-* */
export function fireIcon(cls = 'w-[22px] h-[28px]') {
  const n = ++animIcon.n, g = (id, a, b) => `<linearGradient id="${id}${n}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  return `<svg class="fire ${cls} shrink-0" viewBox="0 0 24 30" aria-hidden="true" focusable="false"><defs>
    <radialGradient id="fg${n}" cx="50%" cy="62%" r="52%"><stop offset="0" stop-color="#FFB020" stop-opacity=".6"/><stop offset=".55" stop-color="#FF6A13" stop-opacity=".22"/><stop offset="1" stop-color="#FF5A1F" stop-opacity="0"/></radialGradient>
    ${g('fo', '#FF7A1A', '#E3262E')}${g('fm', '#FFB224', '#FF6A13')}${g('fi', '#FFF6D2', '#FFD45C')}</defs>
    <g class="fire-ign"><ellipse class="fire-glow" cx="12" cy="20" rx="12" ry="10" fill="url(#fg${n})"/><g class="fire-body">
      <path class="fire-o" fill="url(#fo${n})" d="M12.3 1.2C12.8 5 15.9 7.2 17.8 10.2C19.4 12.7 20.2 15.3 20.2 18.2C20.2 24.1 16.6 28.5 12 28.5C7.4 28.5 3.8 24.6 3.8 19C3.8 15.7 5.2 13.1 7.1 11.1C7.3 13.3 8.2 14.7 9.5 15.5C9 10.6 10 5.9 12.3 1.2Z"/>
      <path class="fire-m" fill="url(#fm${n})" d="M12.4 9.2C13 12 15.4 13.9 16.4 16.4C17 17.8 17.2 19 17.2 20.4C17.2 24.3 14.9 26.9 12 26.9C9.1 26.9 6.8 24.6 6.8 21.3C6.8 19.2 7.7 17.6 8.9 16.4C9.1 17.8 9.7 18.7 10.6 19.2C10.3 15.8 10.9 12.4 12.4 9.2Z"/>
      <path class="fire-i" fill="url(#fi${n})" d="M12.3 15.6C12.8 17.5 14.6 18.9 14.6 21.9C14.6 24.1 13.4 25.5 12 25.5C10.6 25.5 9.4 24.3 9.4 22.4C9.4 20.8 10.3 19.8 11 18.9C11.2 19.9 11.6 20.4 12 20.6C11.8 19 11.9 17.2 12.3 15.6Z"/>
    </g></g>
    <circle class="fire-ember e1" cx="8.5" cy="16" r=".95" fill="#FFC524"/><circle class="fire-ember e2" cx="15.5" cy="14" r=".8" fill="#FF8A1F"/><circle class="fire-ember e3" cx="12" cy="10.5" r=".65" fill="#FFE37A"/></svg>`;
}

