/* Admin-аас засагдах бүлэг бүрийн тодорхойлолт: цэс, маягтын талбар, шинэ бичлэгийн анхны утга.
   Шинэ бүлэг нэмэхэд: энд + src/core/cms.js (CMS_COLS, DEF) + server/cms/cms.service.ts (CMS_COLS). */
import { cms } from './cms';
import { Bi, kit, L, st } from './kit';

/* ---- Цэс ---- */
export type View = string;
/** [хаяг, икон, нэр, бүлэг] */
export const NAV: [View, string, Bi, string][] = [
  ['dash', 'layout-dashboard', ['Хянах самбар', 'Dashboard'], ''],
  ['inbox', 'inbox', ['Ирсэн хүсэлт', 'Submissions'], ''],
  ['news', 'newspaper', ['Мэдээ', 'News'], 'content'],
  ['alerts', 'siren', ['Анхааруулга', 'Alerts'], 'content'],
  ['events', 'calendar-days', ['Арга хэмжээ', 'Events'], 'content'],
  ['mediaitems', 'clapperboard', ['Медиа', 'Media'], 'content'],
  ['projects', 'hard-hat', ['Төслүүд', 'Projects'], 'content'],
  ['services', 'layout-grid', ['Үйлчилгээ', 'Services'], 'content'],
  ['sits', 'route', ['Амьдралын нөхцөл', 'Life events'], 'content'],
  ['docs', 'scroll-text', ['Ил тод байдал', 'Transparency'], 'content'],
  ['banners', 'panel-right', ['Босоо баннер', 'Side banner'], 'content'],
  ['govsched', 'calendar-clock', ['Засаг даргын хуваарь', "Governor's schedule"], 'content'],
  ['struct', 'network', ['Удирдлагын бүтэц', 'City structure'], 'about'],
  ['orgs', 'building-2', ['Харьяа байгууллага', 'City agencies'], 'about'],
  ['history', 'history', ['Түүх', 'History'], 'about'],
  ['citydata', 'chart-column', ['Хотын статистик', 'City statistics'], 'about'],
  ['menu', 'menu', ['Үндсэн цэс', 'Main menu'], 'struct'],
  ['rubrics', 'tag', ['Мэдээний ангилал', 'News categories'], 'struct'],
  ['ecats', 'calendar-range', ['Арга хэмжээний ангилал', 'Event categories'], 'struct'],
  ['pcats', 'tags', ['Төслийн ангилал', 'Project categories'], 'struct'],
  ['topics', 'message-square-plus', ['Санал хүсэлтийн сэдэв', 'Feedback topics'], 'struct'],
  ['faq', 'bot', ['AI туслахын хариулт', 'Assistant answers'], 'struct'],
  ['texts', 'type', ['Гарчиг, текст', 'Headings & text'], 'sys'],
  ['settings', 'settings', ['Тохиргоо', 'Settings'], 'sys'],
];
export const NAV_GROUPS: Record<string, Bi> = { content: ['Агуулга', 'Content'], about: ['Хотын тухай', 'About the city'], struct: ['Бүтэц, ангилал', 'Structure'], sys: ['Систем', 'System'] };
export const navLabel = (v: View) => (NAV.find((n) => n[0] === v) || NAV[0])[2];

/* ---- Сонголтын жагсаалтууд ---- */
export const ICON_SET = ['triangle-alert', 'siren', 'droplets', 'zap', 'flame', 'wind', 'snowflake', 'construction', 'car-front', 'bus', 'tram-front', 'megaphone', 'info', 'file-text', 'baby', 'recycle', 'circle-parking', 'square-parking', 'map-pinned', 'map', 'hand-heart', 'school', 'graduation-cap', 'hard-hat', 'store', 'gavel', 'scale', 'landmark', 'briefcase', 'receipt-text', 'messages-square', 'building-2', 'database', 'stethoscope', 'house', 'heart', 'trees', 'wifi'];
/** Чимэглэлийн сэдэв (Scene «сэдэв:өнгө:тоо») */
export const RECIPES: Record<string, Bi> = { skyline: ['Хот', 'City'], road: ['Зам', 'Road'], bus: ['Автобус', 'Bus'], build: ['Барилга', 'Construction'], bridge: ['Гүүр', 'Bridge'], cable: ['Дүүжин зам', 'Cable car'], park: ['Цэцэрлэг', 'Park'], school: ['Сургууль', 'School'], civic: ['Ордон', 'Civic'], heat: ['Дулаан', 'Heating'], air: ['Агаар', 'Air'], ger: ['Гэр хороолол', 'Ger district'], stage: ['Тайз', 'Stage'], sport: ['Спорт', 'Sport'], market: ['Зах', 'Market'], art: ['Урлаг', 'Art'], tech: ['Технологи', 'Tech'] };
/** Чимэглэлийн өнгөний хослол */
export const PALETTES: Record<string, [string, string]> = { day: ['#9FD0FF', '#E9F5FF'], dawn: ['#FFD3BD', '#9A6274'], dusk: ['#1A2768', '#F28A66'], night: ['#060D29', '#FFCF6B'], winter: ['#CADDF2', '#F6FAFE'], green: ['#BDE7D6', '#2D7859'], civic: ['#F6CAC4', '#78293A'], navy: ['#0B1D45', '#27428A'], smog: ['#B9AE9C', '#5C554D'] };
/** Сайтын хэсгүүд (цэс, баннерын очих газар) */
export const SECTIONS: [string, Bi][] = [['hero', ['Нүүр', 'Home']], ['hub', ['Мэдээ, үйлчилгээ', 'News & services']], ['situations', ['Амьдралын нөхцөл', 'Life events']], ['media', ['Медиа', 'Media']], ['projects', ['Бүтээн байгуулалт', 'Development']], ['data', ['Хотын өгөгдөл', 'City data']], ['events', ['Арга хэмжээ', 'Events']], ['transparency', ['Ил тод байдал', 'Transparency']], ['about', ['Хотын тухай', 'About']], ['gov', ['Засаг дарга', 'The Governor']]];

/** Холбоосын очих газрууд: сайтын хэсэг, анхны цэсний холбоос, амьдралын нөхцөл, ил тод байдлын таб. [JSON, нэр] */
export function destinations(): [string, string][] {
  const out: [string, string][] = [], seen = new Set<string>();
  const add = (go: object, label: string) => { const k = JSON.stringify(go); if (!seen.has(k)) { seen.add(k); out.push([k, label]); } };
  const k = kit(), s = st();
  SECTIONS.forEach(([v, l]) => add({ sec: v }, L(l)));
  (k.defaults.menu || []).forEach((m: any) => (m.items || []).forEach((it: any) => it.go && add(it.go, `${m.k ? k.t(m.k, { n: s.PROJECTS.length }) : ''} › ${L(it.t)}`)));
  s.SITS.forEach((x) => add({ sec: 'situations', sit: x.id }, `${L(['Амьдралын нөхцөл', 'Life events'])} › ${L(x.t)}`));
  (['res', 'ord', 'tender'] as const).forEach((tr) => add({ sec: 'transparency', tr }, `${L(['Ил тод байдал', 'Transparency'])} › ${L(({ res: ['Тогтоол', 'Resolutions'], ord: ['Захирамж', 'Orders'], tender: ['Тендер', 'Tenders'] } as Record<string, Bi>)[tr])}`));
  return out;
}

/* ---- Маягтын талбар ---- */
export type FieldType = 'bi' | 'bitext' | 'chips' | 'select' | 'number' | 'range' | 'date' | 'time' | 'datetime' | 'url' | 'text' | 'dest'
  | 'color' | 'rows' | 'flags' | 'icon' | 'iconsel' | 'image' | 'logo' | 'mappos';
export interface FieldOpts {
  req?: boolean; rows?: number; empty?: boolean; def?: string;
  /** chips, select: [утга, нэр, өнгө?] */
  options?: () => [string, string, string?][];
  /** flags: [түлхүүр, нэр] */
  flags?: [string, Bi][];
  /** rows: давтагдах мөрийн талбарууд */
  sub?: Field[]; add?: Bi; blank?: () => Record<string, unknown>;
}
/** [түлхүүр, төрөл, нэр, тохиргоо] */
export type Field = [string, FieldType, Bi, FieldOpts?];

export interface Collection {
  icon: string;
  /** Нэг бичлэгийн нэр: «мэдээ» */
  one: Bi;
  /** Шинэ бичлэгийн id-ийн угтвар */
  idp: string;
  /** Ганц бичлэгтэй (Хотын статистик) */
  single?: boolean;
  title: (x: any) => string;
  fields: Field[];
}

const ORD: Field = ['ord', 'number', ['Дараалал (бага тоо нь эхэнд)', 'Order (lower comes first)']];
const modes = (): [string, string][] => [['on', kit().t('online')], ['off', kit().t('inperson')], ['sys', kit().t('system')]];

export const SCHEMA: Record<string, Collection> = {
  news: { icon: 'newspaper', one: ['мэдээ', 'story'], idp: 'n', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Гарчиг', 'Headline'], { req: true }],
    ['l', 'bitext', ['Товч агуулга', 'Summary'], { rows: 3 }],
    ['bt', 'bitext', ['Үндсэн текст (догол мөрийг хоосон мөрөөр тусгаарлана)', 'Body (separate paragraphs with a blank line)'], { rows: 6 }],
    ['cat', 'chips', ['Ангилал', 'Category'], { options: () => Object.entries(st().RUB).map(([k, r]) => [k, L(r.t), r.c]) }],
    ['nt', 'chips', ['Мэдээний төрөл', 'News type'], { options: () => Object.entries(st().NEWS_NT).map(([k, l]) => [k, L(l)]) }],
    ['img', 'image', ['Зураг', 'Image']],
    ['d', 'datetime', ['Нийтэлсэн огноо', 'Published']],
    ['flags', 'flags', ['Байршил ба төлөв', 'Placement and status'], { flags: [['br', ['Шуурхай мэдээнд харуулах', 'Show in the latest feed']], ['zar', ['Зар хэлбэрээр харуулах', 'Show as a notice']], ['draft', ['Ноорог (сайтад гарахгүй)', 'Draft (hidden from the site)']]] }],
    ['src', 'url', ['Эх сурвалжийн холбоос', 'Source link']],
    ['views', 'number', ['Үзэлт', 'Views']],
  ] },
  alerts: { icon: 'siren', one: ['анхааруулга', 'alert'], idp: 'a', title: (x) => L(x.k), fields: [
    ['k', 'bi', ['Гарчиг', 'Label'], { req: true }], ['t', 'bi', ['Гүйдэг мөрийн текст', 'Ticker text'], { req: true }],
    ['area', 'bi', ['Хамрах хүрээ', 'Affected area']], ['when', 'bi', ['Хугацаа', 'When']], ['adv', 'bitext', ['Зөвлөмж', 'Advice'], { rows: 2 }],
    ['i', 'icon', ['Тэмдэг', 'Icon']], ['flags', 'flags', ['Төлөв', 'Status'], { flags: [['off', ['Түр нуух', 'Hide for now']]] }],
  ] },
  events: { icon: 'calendar-days', one: ['арга хэмжээ', 'event'], idp: 'e', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Нэр', 'Title'], { req: true }], ['c', 'chips', ['Ангилал', 'Category'], { options: () => Object.entries(st().ECAT).map(([k, r]) => [k, L(r.t), r.c]) }],
    ['date', 'date', ['Огноо', 'Date']], ['tm', 'time', ['Эхлэх цаг', 'Start time']], ['v', 'bi', ['Байршил', 'Venue']], ['price', 'number', ['Үнэ, ₮ (0 бол үнэгүй)', 'Price, ₮ (0 = free)']],
    ['desc', 'bitext', ['Тайлбар', 'Description'], { rows: 3 }], ['img', 'image', ['Зураг', 'Image']], ['pos', 'mappos', ['Газрын зураг дээрх байршил', 'Position on the map']],
  ] },
  projects: { icon: 'hard-hat', one: ['төсөл', 'project'], idp: 'p', title: (x) => L(x.n), fields: [
    ['n', 'bi', ['Төслийн нэр', 'Project name'], { req: true }], ['c', 'chips', ['Ангилал', 'Category'], { options: () => Object.entries(st().PCAT).map(([k, r]) => [k, L(r.t), r.c]) }],
    ['p', 'range', ['Гүйцэтгэл', 'Progress']], ['bud', 'number', ['Төсөв, тэрбум ₮', 'Budget, ₮ bn']], ['due', 'number', ['Дуусах он', 'Completion year']], ['pos', 'mappos', ['Байршил', 'Location']],
  ] },
  services: { icon: 'layout-grid', one: ['үйлчилгээ', 'service'], idp: 's', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Нэр', 'Name'], { req: true }], ['d', 'bi', ['Тайлбар', 'Description']],
    ['g', 'chips', ['Бүлэг', 'Group'], { options: () => [['citizen', L(['Иргэн', 'Residents'])], ['business', L(['Аж ахуйн нэгж', 'Businesses'])], ['esys', L(['Цахим систем', 'E-services'])]] }],
    ['m', 'chips', ['Хэлбэр', 'Mode'], { options: modes }], ['i', 'icon', ['Тэмдэг', 'Icon']],
  ] },
  mediaitems: { icon: 'clapperboard', one: ['медиа', 'media item'], idp: 'm', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Гарчиг', 'Title'], { req: true }], ['d', 'bi', ['Дэд гарчиг', 'Subtitle']],
    ['type', 'chips', ['Төрөл', 'Type'], { options: () => [['live', 'Live'], ['photo', L(['Фото сурвалжилга', 'Photo report'])], ['poster', L(['Постер', 'Poster'])], ['podcast', L(['Подкаст', 'Podcast'])]], def: 'live' }],
    ['img', 'image', ['Нүүр зураг', 'Cover image']],
    ['url', 'url', ['Бичлэгийн холбоос (YouTube, Facebook г.м.). Бөглөвөл дарахад тэр рүү шилжинэ.', 'Link to the video or audio (YouTube etc.). If set, clicking opens it.']],
    ['dur', 'text', ['Үргэлжлэх хугацаа (видео, подкаст), жишээ 12:34', 'Duration (video, podcast), e.g. 12:34']],
    ['n', 'number', ['Зургийн тоо (фото)', 'Number of photos (photo)']], ['ep', 'text', ['Дугаар (подкаст), жишээ #25', 'Episode (podcast), e.g. #25']], ['viewers', 'number', ['Үзэгчдийн тоо (шууд)', 'Viewers (live)']],
    ORD,
  ] },
  sits: { icon: 'route', one: ['амьдралын нөхцөл', 'life event'], idp: 'sit', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Нэр', 'Name'], { req: true }], ['i', 'icon', ['Тэмдэг', 'Icon']],
    ['steps', 'rows', ['Алхмууд', 'Steps'], { add: ['Алхам нэмэх', 'Add a step'], blank: () => ({ m: 'on', t: ['', ''], d: ['', ''], tm: ['', ''] }), sub: [
      ['t', 'bi', ['Алхмын нэр', 'Step name']], ['d', 'bitext', ['Тайлбар', 'Description']],
      ['m', 'select', ['Хэлбэр', 'Mode'], { options: modes }], ['tm', 'bi', ['Хугацаа, жишээ 10 минут', 'Time, e.g. 10 min']]] }],
    ORD,
  ] },
  docs: { icon: 'scroll-text', one: ['баримт бичиг', 'document'], idp: 'doc', title: (x) => L(x.t), fields: [
    ['kind', 'chips', ['Төрөл', 'Type'], { options: () => [['res', L(['ИТХ-ын тогтоол', 'Council resolution'])], ['ord', L(['Засаг даргын захирамж', "Governor's order"])], ['tender', L(['Тендер', 'Tender'])]], def: 'res' }],
    ['no', 'text', ['Дугаар', 'Number'], { req: true }], ['t', 'bi', ['Нэр', 'Title'], { req: true }], ['date', 'date', ['Огноо', 'Date']],
    ['url', 'url', ['Баримтын холбоос (PDF г.м.). Бөглөвөл дарахад нээгдэнэ.', 'Link to the document (PDF etc.). If set, clicking opens it.']],
    ['st', 'chips', ['Тендерийн төлөв (зөвхөн тендер)', 'Tender status (tenders only)'], { options: () => [['open', kit().t('tOpen')], ['eval', kit().t('tEval')], ['won', kit().t('tAwarded')]] }],
    ['due', 'date', ['Тендер хаагдах огноо', 'Tender closing date']], ['bud', 'number', ['Төсөв, сая ₮ (тендер)', 'Budget, ₮ million (tender)']],
  ] },
  banners: { icon: 'panel-right', one: ['баннер', 'banner'], idp: 'bn', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Гарчиг', 'Title'], { req: true }], ['d', 'bitext', ['Тайлбар', 'Text'], { rows: 2 }], ['tag', 'bi', ['Шошго (жишээ: Аян, Арга хэмжээ)', 'Label (e.g. Campaign, Event)']],
    ['theme', 'chips', ['Өнгө', 'Colour'], { options: () => Object.keys(st().RAIL_THEMES).map((k) => [k, L(st().RAIL_THEME_L[k]), st().RAIL_THEMES[k][0]]), def: 'red' }],
    ['img', 'image', ['Зураг', 'Image']], ['btn', 'bi', ['Товчны бичиг', 'Button text']],
    ['act', 'chips', ['Товч дарахад', 'Button action'], { options: () => [['go', L(['Сайтын хэсэг рүү', 'Go to a section'])], ['url', L(['Гадаад холбоос', 'External link'])], ['vote', kit().t('cta_vote')], ['report', kit().t('cta_report')]], def: 'go' }],
    ['go', 'dest', ['Сайтын хэсэг («Сайтын хэсэг рүү» үед)', 'Page section (for "Go to a section")']], ['href', 'url', ['Гадаад холбоос («Гадаад холбоос» үед)', 'External link (for "External link")']],
    ['from', 'date', ['Эхлэх огноо (хоосон бол шууд харагдана)', 'Start date (empty = right away)'], { empty: true }], ['to', 'date', ['Дуусах огноо (хоосон бол хугацаагүй). 30 хоногоос бага үлдвэл тоолуур гарна.', 'End date (empty = no end). A countdown shows in the last 30 days.'], { empty: true }],
    ['flags', 'flags', ['Төлөв', 'Status'], { flags: [['off', ['Түр нуух', 'Hide for now']]] }], ORD,
  ] },
  govsched: { icon: 'calendar-clock', one: ['хуваарь', 'schedule item'], idp: 'g', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Ажлын нэр (уулзалт, хуралдаан г.м.)', 'Title (meeting, session etc.)'], { req: true }],
    ['type', 'chips', ['Төрөл', 'Type'], { options: () => Object.entries(st().GOV_TYPES).map(([k, g]) => [k, L(g.t), g.c]), def: 'meeting' }],
    ['date', 'date', ['Огноо', 'Date']], ['from', 'time', ['Эхлэх цаг', 'Starts']], ['to', 'time', ['Дуусах цаг', 'Ends']],
    ['place', 'bi', ['Хаана', 'Where']], ['d', 'bitext', ['Товч тайлбар (юуны тухай)', 'Short note (what it is about)'], { rows: 2 }],
    ['flags', 'flags', ['Төлөв', 'Status'], { flags: [['off', ['Сайтад харуулахгүй', 'Hide from the site']]] }],
  ] },
  struct: { icon: 'network', one: ['бүтцийн нэгж', 'structure item'], idp: 'st', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Нэр', 'Name'], { req: true }], ['d', 'bi', ['Тайлбар', 'Description']], ['i', 'icon', ['Тэмдэг', 'Icon']], ORD,
  ] },
  orgs: { icon: 'building-2', one: ['байгууллага', 'agency'], idp: 'o', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Нэр', 'Name'], { req: true }], ['cat', 'chips', ['Ангилал', 'Category'], { options: () => st().ORG_CATS.map((c) => [c.id, L(c.t)]) }],
    ['logo', 'logo', ['Лого', 'Logo']], ['url', 'url', ['Вэб сайт', 'Website']], ['i', 'icon', ['Тэмдэг (лого оруулаагүй үед харагдана)', 'Icon (shown when there is no logo)']], ORD,
  ] },
  history: { icon: 'history', one: ['түүхэн нэр', 'historical name'], idp: 'h', title: (x) => `${x.y || ''} · ${L(x.t || ['', ''])}`, fields: [
    ['y', 'number', ['Он', 'Year'], { req: true }], ['t', 'bi', ['Нэр', 'Name'], { req: true }],
  ] },
  citydata: { icon: 'chart-column', one: ['хотын статистик', 'city statistics'], idp: 'cd', single: true, title: () => L(['Хотын статистик өгөгдөл', 'City statistics']), fields: [
    ['pop', 'rows', ['Дүүргийн хүн ам («Хотын өгөгдөл» хэсэгт)', 'District population ("City data" section)'], { add: ['Дүүрэг нэмэх', 'Add a district'], blank: () => ({ n: ['', ''], v: 0 }), sub: [['n', 'bi', ['Дүүрэг', 'District']], ['v', 'number', ['Хүн ам', 'Population']]] }],
    ['budget', 'rows', ['Төсвийн гүйцэтгэл улирлаар (тэрбум ₮)', 'Budget by quarter (₮ billion)'], { add: ['Улирал нэмэх', 'Add a quarter'], blank: () => ({ plan: 0, act: 0 }), sub: [['plan', 'number', ['Төлөвлөгөө', 'Plan']], ['act', 'number', ['Гүйцэтгэл', 'Actual']]] }],
    ['roads', 'rows', ['Түгжрэлтэй замууд (0–10)', 'Busiest roads (0–10)'], { add: ['Зам нэмэх', 'Add a road'], blank: () => ({ n: ['', ''], v: 5 }), sub: [['n', 'bi', ['Зам', 'Road']], ['v', 'number', ['Түгжрэл', 'Congestion']]] }],
  ] },
  menu: { icon: 'menu', one: ['цэсийн бүлэг', 'menu group'], idp: 'menu', title: (x) => (x.lbl && L(x.lbl)) || (x.k ? kit().t(x.k, { n: st().PROJECTS.length }) : ''), fields: [
    ['lbl', 'bi', ['Цэсийн нэр (хоосон бол «Гарчиг, текст» хэсгийн утгыг ашиглана)', 'Menu label (empty = the value from "Headings & text")']],
    ['sec', 'chips', ['Дарахад очих хэсэг', 'Section it scrolls to'], { options: () => SECTIONS.map(([v, l]) => [v, L(l)]), def: 'hub' }],
    ['items', 'rows', ['Холбоосууд', 'Links'], { add: ['Холбоос нэмэх', 'Add a link'], blank: () => ({ i: 'file-text', t: ['', ''], d: ['', ''], go: { sec: 'hub' } }), sub: [
      ['t', 'bi', ['Нэр', 'Name']], ['d', 'bi', ['Тайлбар', 'Description']], ['i', 'iconsel', ['Тэмдэг', 'Icon']],
      ['go', 'dest', ['Сайт доторх хэсэг', 'Page section']], ['href', 'url', ['Эсвэл гадаад холбоос (бөглөвөл түүнийг ашиглана)', 'Or an external link (used if set)']]] }],
    ORD,
  ] },
  rubrics: { icon: 'tag', one: ['мэдээний ангилал', 'news category'], idp: 'r', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Нэр', 'Name'], { req: true }], ['c', 'color', ['Өнгө', 'Colour']],
    ['flags', 'flags', ['Харагдац', 'Visibility'], { flags: [['chip', ['Мэдээний шүүлтүүрт харуулах', 'Show as a news filter']]] }], ORD,
  ] },
  ecats: { icon: 'calendar-range', one: ['арга хэмжээний ангилал', 'event category'], idp: 'ec', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Нэр', 'Name'], { req: true }], ['c', 'color', ['Өнгө', 'Colour']], ORD,
  ] },
  pcats: { icon: 'tags', one: ['төслийн ангилал', 'project category'], idp: 'pc', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Нэр', 'Name'], { req: true }], ['c', 'color', ['Өнгө', 'Colour']], ['i', 'icon', ['Тэмдэг', 'Icon']], ORD,
  ] },
  topics: { icon: 'message-square-plus', one: ['сэдэв', 'topic'], idp: 'tp', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Сэдвийн нэр («Санал өгөх» маягтад)', 'Topic name (in the feedback form)'], { req: true }], ORD,
  ] },
  faq: { icon: 'bot', one: ['хариулт', 'answer'], idp: 'f', title: (x) => String(x.kw || '').trim() || L(['(Бусад бүх асуултад)', '(Fallback for everything else)']), fields: [
    ['kw', 'text', ['Түлхүүр үгс, таслалаар (жишээ: халуун ус, hot water). Хоосон бол өөр тохирох хариулт олдоогүй үед ашиглана.', 'Keywords, comma-separated (e.g. hot water, халуун ус). Empty = used when nothing else matches.']],
    ['a', 'bitext', ['Хариулт. {aqi}, {tr}, {t+2} (2 хоногийн дараах огноо) гэх мэт хувьсагч ашиглаж болно.', 'Answer. You can use {aqi}, {tr}, {t+2} (date in 2 days) and similar.'], { rows: 4, req: true }],
  ] },
};

/* ---- Шинэ бичлэг, засах бичлэг ---- */
const rseed = () => 1 + Math.floor(Math.random() * 999);
export const randomImage = (recipe = 'skyline', palette = 'day') => `${recipe}:${palette}:${rseed()}`;
const isoDay = (d: Date) => `${d.getFullYear()}-${kit().pad(d.getMonth() + 1)}-${kit().pad(d.getDate())}`;
/** «2026-10-14 18:30» (Улаанбаатарын цагаар) */
export const ubStamp = (d: Date) => `${isoDay(d)} ${kit().hhmm(d)}`;

/** Шинэ бичлэгийн анхны утга */
export function blankDoc(col: string): Record<string, any> {
  const k = kit(), now = k.ubNow(), tomorrow = isoDay(k.addDays(k.today(), 1));
  const special: Record<string, Record<string, any>> = {
    news: { t: ['', ''], l: ['', ''], bt: ['', ''], cat: 'city', d: ubStamp(now), img: randomImage(), br: 1, views: 0 },
    alerts: { k: ['', ''], t: ['', ''], area: ['', ''], when: ['', ''], adv: ['', ''], i: 'triangle-alert' },
    events: { t: ['', ''], c: 'civic', date: tomorrow, tm: '18:00', v: ['', ''], price: 0, desc: ['', ''], img: randomImage('civic'), x: 560, y: 285 },
    projects: { n: ['', ''], c: 'transport', p: 0, bud: 0, due: now.getFullYear() + 1, x: 560, y: 300 },
    services: { t: ['', ''], d: ['', ''], g: 'citizen', m: 'on', i: 'file-text' },
    govsched: { t: ['', ''], type: 'meeting', date: tomorrow, from: '10:00', to: '11:00', place: ['', ''], d: ['', ''] },
  };
  if (special[col]) return special[col];
  // Бусад бүлэг: талбаруудаас автоматаар
  const d: Record<string, any> = {};
  SCHEMA[col].fields.forEach(([key, type, , o = {}]) => {
    if (type === 'bi' || type === 'bitext') d[key] = ['', ''];
    else if (type === 'rows') d[key] = [];
    else if (type === 'chips') d[key] = o.def || ((o.options && o.options()[0]) || [])[0];
    else if (type === 'icon') d.i = 'file-text';
    else if (type === 'color') d[key] = '#145095';
    else if (type === 'image') d.img = randomImage();
    else if (type === 'date') d[key] = o.empty ? '' : isoDay(k.today());
    else if (type === 'dest') d[key] = { sec: 'hub' };
    else if (key === 'ord') d.ord = cms.merged(col).reduce((m, x) => Math.max(m, +x.ord || 0), 0) + 10;
  });
  if (col === 'rubrics') d.chip = 1;
  return d;
}

/** Жагсаалтын бичлэгийг засахад бэлдэнэ (мэдээний догол мөрийг нэг текст болгох г.м.) */
export function docForEdit(col: string, x: any): Record<string, any> {
  const d = JSON.parse(JSON.stringify(x));
  delete d._edited; delete d._new;
  if (col === 'news') {
    if (!d.bt && Array.isArray(d.b)) d.bt = [d.b.map((p: Bi) => p[0]).join('\n\n'), d.b.map((p: Bi) => p[1]).join('\n\n')];
    delete d.b;
  }
  if (col === 'events' && !d.date) d.date = isoDay(kit().evDate(d.w));
  if (col === 'events' && !d.desc) d.desc = JSON.parse(JSON.stringify(st().EVDESC[d.c] || ['', '']));
  return d;
}

/** Хадгалахаас өмнө: заавал бөглөх монгол талбаруудыг шалгаж, тоог засна. Дутуу талбаруудын нэрийг буцаана. */
export function prepareSave(col: string, d: Record<string, any>): string[] {
  const empty = (v: unknown) => (Array.isArray(v) ? !String(v[0] || '').trim() : v == null || !String(v).trim());
  const missing = SCHEMA[col].fields.filter((f) => f[3] && f[3].req && empty(d[f[0]])).map((f) => L(f[2]));
  if (missing.length) return missing;
  if (col === 'projects') d.p = d.p == null || d.p === '' ? null : Math.max(0, Math.min(100, Math.round(+d.p || 0)));
  if (col === 'news') { d.views = +d.views || 0; if (!d.d) d.d = ubStamp(kit().ubNow()); }
  if (col === 'events') d.price = Math.max(0, +d.price || 0);
  return [];
}
