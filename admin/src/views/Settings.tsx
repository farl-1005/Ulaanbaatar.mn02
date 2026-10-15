'use client';
/* Тохиргоо: нүүрний гол мэдээ, Засаг даргын мэдээ, улирлын эффект, түгээмэл үйлчилгээ, хайлт, AI туслахын санал. */
import { useState } from 'react';
import { cms, errMsg, useCms } from '../cms';
import { kit, L, st } from '../kit';
import { Icon, useArmed, useToast } from '../ui';

export function Settings() {
  const { data } = useCms(), toast = useToast(), { armed, confirm } = useArmed(), k = kit(), s = st();
  const news = cms.merged('news').filter((n) => !n.draft).sort((a, b) => (+(k.parseUB(b.d) || 0)) - (+(k.parseUB(a.d) || 0)));
  const [form, setForm] = useState(() => ({
    heroId: s.HERO_ID, featuredId: s.FEATURED_ID, gov: s.GOV.slice(), tickerOn: s.SET.tickerOn !== false, season: s.SET.season || 'auto',
    quick: s.QUICK.slice(), chatChips: k.linesOf(s.CHAT_CHIPS), popSearch: k.linesOf(s.SQ_POP),
  }));
  const set = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));
  const changed = Object.values(data).reduce((a, c) => a + Object.keys(c || {}).length, 0);

  const toggleGov = (id: string, on: boolean) => {
    if (on && form.gov.length >= 3) { toast(L(['Хамгийн ихдээ 3 мэдээ сонгоно', 'Pick up to 3 stories']), 'info'); return; }
    set({ gov: on ? [...form.gov, id] : form.gov.filter((x) => x !== id) });
  };
  const toggleQuick = (id: string, on: boolean) => {   // сонгосон дарааллаар
    if (on && form.quick.length >= 8) { toast(L(['Хамгийн ихдээ 8 үйлчилгээ сонгоно', 'Pick up to 8 services']), 'info'); return; }
    set({ quick: on ? [...form.quick, id] : form.quick.filter((x) => x !== id) });
  };
  const save = async () => {
    try { await cms.save('settings', 'main', form, L(['Тохиргоо', 'Settings'])); toast(L(['Тохиргоо хадгалагдлаа', 'Settings saved'])); }
    catch (e) { toast(errMsg(e), 'triangle-alert'); }
  };
  const wipe = async () => {
    if (!confirm('wipe')) return;
    try {
      for (const col of k.cols) for (const id of Object.keys(data[col] || {})) await cms.drop(col, id);
      toast(L(['Сайт анхны агуулгадаа буцлаа', 'The site is back to its original content']), 'rotate-ccw');
    } catch (e) { toast(errMsg(e), 'triangle-alert'); }
  };
  const storyOptions = news.filter((n) => !n.zar).map((n) => <option key={n.id} value={n.id}>{L(n.t)}</option>);   // зар биш мэдээ

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="card p-6 lg:col-span-3 space-y-5">
        <h2 className="text-[18px] font-extrabold">{L(['Нүүр хуудас', 'Home page'])}</h2>
        <label className="block"><span className="adm-label">{L(['Гол мэдээ', 'Lead story'])}</span>
          <select className="field" value={form.heroId} onChange={(e) => set({ heroId: e.target.value })}>{storyOptions}</select></label>
        <label className="block"><span className="adm-label">{L(['«Өнөөдөр хотод» хэсгийн онцлох мэдээ', 'Featured story in "Today in the city"'])}</span>
          <select className="field" value={form.featuredId} onChange={(e) => set({ featuredId: e.target.value })}>{storyOptions}</select></label>
        <div><span className="adm-label">{L(['Засаг даргын мэдээ (3 хүртэл)', "Governor's news (up to 3)"])}</span>
          <div className="rounded-xl border border-line max-h-[260px] overflow-auto thin-scroll divide-y divide-line">{news.map((n) => (
            <label key={n.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer">
              <input type="checkbox" className="w-[18px] h-[18px] accent-[#145095]" checked={form.gov.includes(n.id)} onChange={(e) => toggleGov(n.id, e.target.checked)} />
              <span className="text-[14px] leading-snug">{L(n.t)}</span>
            </label>
          ))}</div></div>
        <div><span className="adm-label">{L(['Улирлын эффект (мэдээ унших хуудсанд)', 'Seasonal effect (news pages)'])}</span>
          <div className="flex flex-wrap gap-2">{Object.keys(s.SEASON_L).map((v) => (
            <button key={v} type="button" className="chip !h-9" aria-pressed={form.season === v} onClick={() => set({ season: v })}>
              <Icon name={s.SEASON_IC[v]} className="w-4 h-4" />{L(s.SEASON_L[v])}{v === 'auto' && <span className="text-muted font-medium">· {L(s.SEASON_L[s.season])}</span>}
            </button>
          ))}</div>
          <p className="mt-2 text-[12.5px] text-muted">{L(['«Автомат» нь огноогоор: 3–5 сар хавар, 6–8 зун, 9–11 намар, 12–2 өвөл.', '"Auto" follows the date: Mar–May spring, Jun–Aug summer, Sep–Nov autumn, Dec–Feb winter.'])}</p></div>
        <label className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
          <span><b className="block text-[14.5px]">{L(['Яаралтай анхааруулгын мөр', 'Urgent alert ticker'])}</b><span className="text-[13px] text-muted">{L(['Шар гүйдэг мөрийг сайт дээр харуулах', 'Show the yellow ticker on the site'])}</span></span>
          <input type="checkbox" className="adm-switch" checked={form.tickerOn} onChange={(e) => set({ tickerOn: e.target.checked })} />
        </label>
        <div><span className="adm-label">{L(['Нүүр хуудасны «Түгээмэл үйлчилгээ» (8 хүртэл, сонгосон дарааллаар)', 'Home page "Popular services" (up to 8, in the order picked)'])}</span>
          <div className="rounded-xl border border-line max-h-[260px] overflow-auto thin-scroll divide-y divide-line">{s.ALL_SVC.map((x) => (
            <label key={x.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer">
              <input type="checkbox" className="w-[18px] h-[18px] accent-[#145095]" checked={form.quick.includes(x.id)} onChange={(e) => toggleQuick(x.id, e.target.checked)} />
              <span className="text-[14px] leading-snug flex-1">{L(x.t)}</span>
              {form.quick.includes(x.id) && <span className="text-[12px] tnum text-muted">#{form.quick.indexOf(x.id) + 1}</span>}
            </label>
          ))}</div></div>
        <label className="block"><span className="adm-label">{L(['AI туслахын санал болгох асуултууд (мөр бүрд: Монгол | English)', 'Assistant suggestion chips (one per line: Mongolian | English)'])}</span>
          <textarea className="field font-mono !text-[13px]" rows={5} value={form.chatChips} onChange={(e) => set({ chatChips: e.target.value })} /></label>
        <label className="block"><span className="adm-label">{L(['Хайлтын түгээмэл үгс (мөр бүрд: Монгол | English)', 'Popular searches (one per line: Mongolian | English)'])}</span>
          <textarea className="field font-mono !text-[13px]" rows={5} value={form.popSearch} onChange={(e) => set({ popSearch: e.target.value })} /></label>
        <div className="flex justify-end"><button type="button" className="btn btn-blue" onClick={save}><Icon name="check" className="w-[18px] h-[18px]" />{L(['Тохиргоог хадгалах', 'Save settings'])}</button></div>
      </div>

      <div className="lg:col-span-2 space-y-5">
        <div className="card p-6">
          <h2 className="text-[18px] font-extrabold">{L(['Систем', 'System'])}</h2>
          <dl className="mt-4 space-y-3 text-[14px]">
            <div className="flex justify-between gap-3"><dt className="text-muted">{L(['Холболт', 'Connection'])}</dt><dd className="inline-flex items-center gap-2 font-semibold text-greenink"><span className="live" style={{ ['--dot' as string]: 'rgb(var(--c-green))' }} />{L(['Сервертэй холбогдсон', 'Connected to server'])}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">{L(['Таны эрх', 'Your role'])}</dt><dd className="font-semibold">{L(['Админ', 'Admin'])}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">{L(['Өөрчилсөн бичлэг', 'Changed records'])}</dt><dd className="font-semibold tnum">{changed}</dd></div>
          </dl>
          <p className="mt-4 text-[13px] text-muted leading-relaxed">{L(['Мэдээлэл серверийн өгөгдлийн санд (PostgreSQL эсвэл SQLite) хадгалагдана. Сайтын зочид уншина, зөвхөн нэвтэрсэн админ засна.', 'Content is stored in the server database (PostgreSQL or SQLite). Visitors read it; only a signed-in admin can change it.'])}</p>
        </div>
        <div className="card p-6 border-ubred/30">
          <h2 className="text-[18px] font-extrabold text-ubred">{L(['Аюултай бүс', 'Danger zone'])}</h2>
          <p className="mt-2 text-[13.5px] text-muted">{L(['Бүх засвар, нэмсэн бичлэг, оруулсан зургийг устгаж, сайтыг анхны агуулгад нь буцаана.', 'Remove every edit, added item and uploaded photo, returning the site to its original content.'])}</p>
          <button type="button" className="btn btn-sm btn-ghost !text-ubred mt-4" onClick={wipe}>
            <Icon name={armed === 'wipe' ? 'triangle-alert' : 'trash-2'} className="w-4 h-4" />{armed === 'wipe' ? L(['Дахин дарж баталгаажуулна', 'Click again to confirm']) : L(['Бүх өөрчлөлтийг арилгах', 'Remove all changes'])}
          </button>
        </div>
      </div>
    </div>
  );
}
