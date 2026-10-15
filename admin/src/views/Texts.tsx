'use client';
/* Гарчиг, текст: сайтын бүх товч, гарчиг, тайлбарын текстийг (src/data/i18n.js) монгол, англиар засна. */
import { useEffect, useState } from 'react';
import { cms, errMsg, useCms } from '../cms';
import { Bi, kit, L, st } from '../kit';
import { Icon, useToast } from '../ui';

/** Текстийн түлхүүрийг сайтын хэсгээр нь бүлэглэнэ */
const GROUPS: [string, Bi, RegExp][] = [
  ['head', ['Толгой, цэс', 'Header & menu'], /^(brand|slogan|homeAria|home|search|login|menu|close|nav_|cta_|urgent|dismiss|notify|theme|a11y|hotlineShort|weather|cloudy|aqi$|traffic|busy|more)/],
  ['home', ['Нүүр хуудас', 'Home page'], /^(breaking|liveUpd|isNew|allNews|read|minRead|views|gov|report|vote|hub|tab_|f_all|svcSearch|online|inperson|system|noResults|allEvents|sitPromo|popularSvc|allServices|related|helpful|thanks|share|copied|src)/],
  ['svc', ['Амьдралын нөхцөл', 'Life events'], /^(sit|steps|progress|doneOf|markDone|undo|applyOnline|book|nextStep|doneLbl|restart|allDone|stepSent|pickSlot|confirmBook|booked|where|svc|openSys|sysDemo|requestSent)/],
  ['media', ['Медиа', 'Media'], /^(media|m_|watching|photosN|prev|next|play|pause|liveFor|photoCredit)/],
  ['proj', ['Бүтээн байгуулалт', 'Development'], /^(proj|st_|avgProgress|projectsN|completedN|budget$|dueYear|zoom|resetMap|schematic|district|showOnMap)/],
  ['data', ['Хотын өгөгдөл', 'City data'], /^(data|live$|updated|aqi|feels|wind|humidity|congestion|busiest|population|popNote|budgetExec|budgetNote|plan|actual)/],
  ['ev', ['Арга хэмжээ', 'Events'], /^(ev|f_|v_|free|save|saved|unsavedT|noEvents|eventsOn)/],
  ['tr', ['Ил тод байдал', 'Transparency'], /^(tr|docSearch|inForce|tOpen|tEval|tAwarded|daysLeft|closesToday|view$|bid|docNote|tl_|days)/],
  ['about', ['Хотын тухай', 'About'], /^(about|leadership|orgs|founded|area|admin|elevation)/],
  ['foot', ['Хөл хэсэг', 'Footer'], /^(contact|hotline|emergency|fire|police|ambulance|digest|email|subscribe|badEmail|conceptNote|privacy|access|openData|f_services|f_info)/],
  ['forms', ['Маягтууд', 'Forms'], /^(r[A-Z]|rStep|rS\d|locate|tapMap|pickedIn|desc|photo|track|continue|back|submit|needCat|v[A-Z]|poll|voteBtn|voted|totalVotes|yourPick|topic|idea|toGov|needText|dan|scanQr|waiting|regPh|sendCode|codePh|codeSent|signIn|bankPick|demoNote|signedIn|myCorner|logout|loggedOut|hello|my_|s\d|newReq|notifs|payments|pay|paid|due|savedItems|noSaved|kh|hours|residents|households|nearby|reqAgency|myStats|noReq)/],
  ['chat', ['AI туслах', 'Assistant'], /^(chat|thinking|stop|send|restartChat|s_|popular|escClose|bb_)/],
];
const groupOf = (k: string) => (GROUPS.find(([, , re]) => re.test(k)) || ['other'])[0];

function TextRow({ k, value, changed }: { k: string; value: Bi; changed: boolean }) {
  const toast = useToast(), [mn, setMn] = useState(value[0]), [en, setEn] = useState(value[1]), [dirty, setDirty] = useState(false), [busy, setBusy] = useState(false);
  useEffect(() => { if (!dirty) { setMn(value[0]); setEn(value[1]); } }, [value, dirty]);   // өөр газраас засагдвал
  const save = async () => {
    setBusy(true);
    try { await cms.save('texts', k, { mn, en }, k); setDirty(false); toast(L(['Текст шинэчлэгдлээ', 'Text updated'])); }
    catch (e) { toast(errMsg(e), 'triangle-alert'); }
    setBusy(false);
  };
  const reset = async () => {
    try { await cms.revert('texts', k, k); setDirty(false); toast(L(['Анхны утгад буцлаа', 'Default restored']), 'rotate-ccw'); }
    catch (e) { toast(errMsg(e), 'triangle-alert'); }
  };
  return (
    <li className="grid md:grid-cols-[170px_1fr_1fr_112px] gap-2 md:gap-3 px-4 py-3 items-start">
      <span className="text-[12.5px] text-muted break-all pt-2">{k}{changed && <span className="badge b-blue ml-1.5 !h-5">{L(['Өөрчилсөн', 'Changed'])}</span>}</span>
      <textarea rows={1} className="field !h-auto !py-2 !text-[14px] min-h-[40px]" aria-label={k + ' MN'} value={mn} onChange={(e) => { setMn(e.target.value); setDirty(true); }} />
      <textarea rows={1} className="field !h-auto !py-2 !text-[14px] min-h-[40px]" aria-label={k + ' EN'} value={en} onChange={(e) => { setEn(e.target.value); setDirty(true); }} />
      <span className="flex gap-1">
        <button type="button" className="btn btn-sm btn-blue flex-1" disabled={!dirty || busy} onClick={save}>{L(['Хадгалах', 'Save'])}</button>
        {changed && <button type="button" className="icon-btn !w-9 !h-9 !rounded-lg hover:bg-soft" onClick={reset} title={L(['Анхны утга', 'Restore default'])} aria-label={L(['Анхны утга', 'Restore default'])}><Icon name="rotate-ccw" className="w-4 h-4" /></button>}
      </span>
    </li>
  );
}

export function Texts() {
  const { data } = useCms();
  const [q, setQ] = useState(''), [g, setG] = useState('all'), [onlyChanged, setOnlyChanged] = useState(false);
  const I = st().I, overrides = data.texts || {}, needle = q.trim().toLowerCase();
  const keys = Object.keys(kit().defaults.texts).filter((k) => (g === 'all' || groupOf(k) === g) && (!onlyChanged || overrides[k]) && (!needle || (k + ' ' + I[k][0] + ' ' + I[k][1]).toLowerCase().includes(needle)));
  const tabs: [string, Bi][] = [['all', ['Бүгд', 'All']], ...GROUPS.map(([v, l]): [string, Bi] => [v, l]), ['other', ['Бусад', 'Other']]];
  return (
    <>
      <p className="text-muted max-w-[70ch] mb-5">{L(['Сайтын бүх гарчиг, товч, тайлбарын текстийг эндээс монгол, англи хэлээр засна. Хадгалсан даруйд сайт шинэчлэгдэнэ.', 'Edit every heading, button and label on the site in Mongolian and English. The site updates as soon as you save.'])}</p>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
        <div className="relative md:w-80">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"><Icon name="search" className="w-[18px] h-[18px]" /></span>
          <input type="search" className="field !h-10 !pl-10 !text-[14px]" placeholder={L(['Текст хайх', 'Search text'])} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <label className="inline-flex items-center gap-2 text-[14px] font-semibold"><input type="checkbox" className="adm-switch" checked={onlyChanged} onChange={(e) => setOnlyChanged(e.target.checked)} />{L(['Зөвхөн өөрчилсөн', 'Changed only'])}</label>
        <span className="md:ml-auto text-[13px] text-muted">{L([`${keys.length} текст`, `${keys.length} texts`])}</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-4">{tabs.map(([v, l]) => (
        <button key={v} type="button" className="chip !h-9 shrink-0" aria-pressed={g === v} onClick={() => setG(v)}>{L(l)}</button>
      ))}</div>
      <div className="card overflow-hidden">
        <div className="hidden md:grid grid-cols-[170px_1fr_1fr_112px] gap-3 px-4 py-2.5 bg-soft border-b border-line text-[12.5px] font-bold text-muted"><span>{L(['Түлхүүр', 'Key'])}</span><span>Монгол</span><span>English</span><span /></div>
        <ul className="divide-y divide-line">{keys.slice(0, 400).map((k) => <TextRow key={k} k={k} value={I[k]} changed={!!overrides[k]} />)}</ul>
      </div>
    </>
  );
}
