'use client';
/* Гарын авлага: удирдлагын системийг хэрхэн ашиглах (хэрэглэгчдийн санал #23). Агуулгыг энд (HELP) засна. */
import { useState } from 'react';
import { Bi, L } from '../kit';
import { Icon } from '../ui';

interface Topic { id: string; icon: string; title: Bi; steps: Bi[]; tip?: Bi }

const HELP: Topic[] = [
  { id: 'start', icon: 'compass', title: ['Ерөнхий', 'Getting around'], steps: [
    ['Зүүн талын цэснээс засах хэсгээ сонгоно. Гар утсанд цэс дээд талд хэвтээ байрлана.', 'Pick what to edit in the left menu. On a phone the menu runs across the top.'],
    ['Жагсаалтаас бичлэг дээр дарж засна, «Нэмэх» товчоор шинийг үүсгэнэ.', 'Click an item in a list to edit it; use «Add» to create a new one.'],
    ['Маягтын дээд талын «Монгол / English» товчоор хэлийг сольж, хоёр хэлээр бичнэ. Англи хоосон бол сайт дээр монгол текст харагдана.', 'Use «Монгол / English» at the top of a form to switch languages. If English is empty, the Mongolian text is shown.'],
    ['«Хадгалах» дармагц өөрчлөлт сайтын бүх зочинд шууд харагдана (хуудсыг дахин ачаалах шаардлагагүй).', 'Changes appear to every visitor as soon as you press «Save» (no reload needed).'],
  ], tip: ['Улаан од (*) бүхий талбарыг заавал бөглөнө.', 'Fields marked with a red star (*) are required.'] },
  { id: 'news', icon: 'newspaper', title: ['Мэдээ нийтлэх', 'Publishing news'], steps: [
    ['«Мэдээ» → «Нэмэх мэдээ». Гарчиг, товч агуулгаа бичнэ.', '«News» → «Add story». Write the headline and a short summary.'],
    ['«Үндсэн текст» засварлагчийн дээд мөрөөр тод, налуу, гарчиг, жагсаалт, ишлэл, холбоос оруулна. Word-оос хуулж буулгаж болно.', 'Use the toolbar of the «Body» editor for bold, italic, headings, lists, quotes and links. Pasting from Word works.'],
    ['«Нүүр зураг»: кодоор зурсан чимэглэл сонгох эсвэл «Зураг оруулах»-аар өөрийн зургаа оруулна.', '«Cover image»: pick an illustration or upload your own photo.'],
    ['«Зургийн цомог»: олон зургийг нэг дор сонгож оруулна. Сумаар дарааллыг сольж, ★ товчоор нүүр зураг болгоно. Цомог мэдээний доор харагдана.', '«Photo gallery»: select several photos at once. Reorder with the arrows; ★ makes a photo the cover. The gallery shows below the story.'],
    ['Бичлэг (видео) байвал файлаар оруулах эсвэл YouTube/Facebook холбоосыг тавина.', 'For a video, upload the file or paste a YouTube/Facebook link.'],
    ['«Нийтэлсэн огноо» хоосон бол хадгалах үеийн цаг тавигдана. Сүүлд нийтэлсэн мэдээ сайтын эхэнд гарна.', 'If «Published» is empty, the time of saving is used. The newest story appears first on the site.'],
    ['«Ноорог» тэмдэглэвэл сайтад гарахгүй. «Шуурхай мэдээнд харуулах» нь нүүрний зүүн талын жагсаалтад оруулна.', '«Draft» keeps a story off the site. «Show in the latest feed» adds it to the list on the left of the home page.'],
  ], tip: ['Гол мэдээ «Тохиргоо → Гол мэдээ»-нд «Автомат» байвал хамгийн сүүлийн мэдээ нүүрний гол мэдээ болно.', 'With «Settings → Lead story» set to «Automatic», the newest story becomes the home page lead.'] },
  { id: 'media', icon: 'clapperboard', title: ['Медиа (видео, подкаст, фото)', 'Media (video, podcasts, photos)'], steps: [
    ['«Медиа» → «Нэмэх». Төрлийг сонгоно: Live / видео, фото сурвалжилга, постер, подкаст.', '«Media» → «Add». Choose the type: live/video, photo report, poster or podcast.'],
    ['Видео, подкастын файлыг оруулахад үргэлжлэх хугацааг систем өөрөө уншина (гараар бичих шаардлагагүй).', 'When you upload a video or podcast file, its duration is read automatically.'],
    ['Фото сурвалжилгад зургуудаа цомогт оруулна. Зургийн тоо автоматаар тоологдоно.', 'For a photo report, add the photos to the gallery; the count is automatic.'],
  ] },
  { id: 'alerts', icon: 'siren', title: ['Анхааруулга, арга хэмжээ', 'Alerts and events'], steps: [
    ['«Анхааруулга»: сайтын дээд талын шар мөрөнд гарна. Хамрах хүрээ, эхлэх ба дуусах хугацаа, зөвлөмжөө бөглөнө. Дуусах хугацаа өнгөрмөгц сайтаас өөрөө алга болно. «Түр нуух»-аар устгалгүйгээр нууна.', '«Alerts» show in the yellow strip at the top. Fill in the area, start and end time, and advice. Once the end time passes, the alert disappears by itself. «Hide for now» hides without deleting.'],
    ['«Арга хэмжээ»: огноо, цаг, байршил, үнэ, газрын зураг дээрх цэгийг оруулна.', '«Events»: set the date, time, venue, price and the point on the map.'],
  ] },
  { id: 'docs', icon: 'scroll-text', title: ['Ил тод байдал', 'Transparency'], steps: [
    ['«Ил тод байдал»: ИТХ-ын тогтоол, Засаг даргын захирамж, тендерийг дугаар, огноо, баримтын холбоостой нь оруулна.', '«Transparency»: add council resolutions, orders and tenders with their number, date and a link to the document.'],
  ] },
  { id: 'inbox', icon: 'inbox', title: ['Ирсэн хүсэлт', 'Submissions'], steps: [
    ['Иргэдийн илгээсэн санал хүсэлт, имэйл бүртгэл «Ирсэн хүсэлт»-д ирнэ. Шинэ хүсэлтийн тоо цэсэнд харагдана.', 'Feedback and newsletter sign-ups from residents arrive in «Submissions»; the menu shows how many are new.'],
    ['Хүсэлт бүрийн төлөвийг («Шинэ», «Шийдвэрлэж буй», «Шийдвэрлэсэн», «Татгалзсан») сольж явцыг тэмдэглэнэ.', 'Set each submission\'s status (New, In progress, Resolved, Rejected) to track it.'],
  ] },
  { id: 'menu', icon: 'menu', title: ['Цэс засах', 'Editing the menu'], steps: [
    ['«Үндсэн цэс»: цэсийн бүлгийн нэр, дарааллыг сольж, «Нэмэх»-ээр шинэ бүлэг үүсгэнэ.', '«Main menu»: rename and reorder menu groups; «Add» creates a new group.'],
    ['Бүлэг доторх холбоосыг «Холбоос нэмэх»-ээр нэмж, хогийн сав товчоор хасна. Сайт доторх хэсэг эсвэл гадаад хаяг (https://...) сонгоно.', 'Add links with «Add a link» and remove them with the bin. Each link points to a part of the site or an external address (https://...).'],
  ] },
  { id: 'texts', icon: 'languages', title: ['Гарчиг, текст', 'Headings and text'], steps: [
    ['«Гарчиг, текст»: сайтын товч, гарчиг, тайлбарын бүх бичвэрийг монгол, англиар засна.', '«Headings and text»: edit every button, heading and label on the site in both languages.'],
  ] },
  { id: 'settings', icon: 'settings', title: ['Тохиргоо', 'Settings'], steps: [
    ['Нүүрний гол мэдээ, Засаг даргын мэдээ, түгээмэл үйлчилгээ, хайлтын түгээмэл үгсийг сонгоно.', 'Choose the lead story, the Governor\'s news, popular services and popular searches.'],
    ['«Удирдлагын системийн нэр»: энэ системийн нэрийг сольж болно.', '«Admin system name»: rename this admin system.'],
  ] },
  { id: 'undo', icon: 'rotate-ccw', title: ['Буцаах, устгах', 'Undo and delete'], steps: [
    ['Анхны агуулгыг засварласан бол «Анхны хувилбарт буцаах»-аар засвараа арилгана.', 'If you edited built-in content, «Revert to original» removes your changes.'],
    ['Устгах товчийг хоёр удаа дарж баталгаажуулна.', 'Press delete twice to confirm.'],
  ], tip: ['«Хянах самбар»-ын «Сүүлийн өөрчлөлтүүд» хэсэгт хэн, юуг, хэзээ өөрчилсөн нь харагдана.', 'The «Recent changes» panel on the dashboard shows what changed and when.'] },
];

export function Help() {
  const [q, setQ] = useState('');
  const s = q.trim().toLowerCase();
  const list = s ? HELP.filter((h) => [h.title, ...h.steps, h.tip || ['', '']].some((b) => (b[0] + ' ' + b[1]).toLowerCase().includes(s))) : HELP;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6">
      <nav className="hidden lg:block sticky top-24 self-start space-y-0.5" aria-label={L(['Агуулга', 'Contents'])}>
        {HELP.map((h) => <a key={h.id} href={`#help-${h.id}`} onClick={(e) => { e.preventDefault(); document.getElementById('help-' + h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
          className="flex items-center gap-2.5 px-3 h-10 rounded-lg text-[14px] font-semibold hover:bg-soft"><Icon name={h.icon} className="w-4 h-4 text-muted" />{L(h.title)}</a>)}
      </nav>
      <div className="space-y-4 min-w-0">
        <input className="field" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={L(['Гарын авлагаас хайх...', 'Search the guide...'])} aria-label={L(['Гарын авлагаас хайх', 'Search the guide'])} />
        {list.map((h) => (
          <section key={h.id} id={'help-' + h.id} className="card p-5 sm:p-6 scroll-mt-24">
            <h2 className="flex items-center gap-3 text-[17px] font-bold"><span className="w-9 h-9 rounded-lg bg-soft grid place-items-center"><Icon name={h.icon} className="w-[18px] h-[18px]" /></span>{L(h.title)}</h2>
            <ol className="mt-4 space-y-3">
              {h.steps.map((st, i) => (
                <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed"><span className="w-6 h-6 shrink-0 rounded-full bg-ubblue/10 text-ubblue text-[12.5px] font-bold grid place-items-center mt-0.5">{i + 1}</span><span>{L(st)}</span></li>
              ))}
            </ol>
            {h.tip && <p className="mt-4 rounded-lg bg-soft px-4 py-3 text-[13.5px] text-muted flex gap-2.5"><Icon name="lightbulb" className="w-[18px] h-[18px] shrink-0 text-ubamber" />{L(h.tip)}</p>}
          </section>
        ))}
        {!list.length && <p className="card p-8 text-center text-muted">{L(['Илэрц олдсонгүй', 'Nothing found'])}</p>}
      </div>
    </div>
  );
}
