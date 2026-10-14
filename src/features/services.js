/* ================= Services & booking ================= */
function openService(id) {
  const s = ALL_SVC.find((x) => x.id === id); if (!s) return;
  const steps = s.m === 'on' ? [['ДАН-аар нэвтэрнэ', 'Sign in with DAN'], ['Мэдээллээ шалгаж баталгаажуулна', 'Check and confirm your details'], ['Хүсэлтээ илгээж, хариугаа Миний буланд авна', 'Send the request and get the answer in My page']]
    : s.m === 'off' ? [['Цагаа онлайнаар захиална', 'Book a time online'], ['Иргэний үнэмлэх, холбогдох баримтаа бүрдүүлнэ', 'Bring your ID and documents'], ['Захиалсан цагтаа очиж үйлчлүүлнэ', 'Visit at your booked time']]
    : [['Системд ДАН-аар нэвтэрнэ', 'Sign in with DAN'], ['Үйлчилгээгээ сонгоно', 'Choose a service'], ['Явцаа системээс хянана', 'Track progress in the system']];
  openModal({ size: 'md', label: L(s.t), render: () => `${modalHead(L(s.t), esc(L(s.d)), s.i, 'bg-ubblue/10 text-ubblue')}<div class="px-5 sm:px-7 py-6">
    <div class="flex items-center gap-2">${modeBadge(s.m)}</div>
    <div class="mt-4 grid grid-cols-2 gap-3 text-[13.5px]"><div class="rounded-xl bg-soft p-3"><p class="text-muted">${t('svcTime')}</p><b>${s.m === 'off' ? L(['1 өдөр', '1 day']) : L(['5–10 минут', '5–10 min'])}</b></div><div class="rounded-xl bg-soft p-3"><p class="text-muted">${t('svcFee')}</p><b>${t('svcFree')}</b></div></div>
    <p class="mt-6 font-bold">${t('svcSteps')}</p><ol class="mt-3 space-y-3">${steps.map((x, i) => `<li class="flex gap-3"><span class="w-7 h-7 rounded-full bg-ink text-card grid place-items-center text-[13px] font-bold shrink-0">${i + 1}</span><span class="pt-0.5 text-[14.5px]">${esc(L(x))}</span></li>`).join('')}</ol>
    <p class="mt-6 font-bold">${t('svcDocs')}</p><p class="mt-1.5 text-[14px] text-muted">${L(['Иргэний үнэмлэх эсвэл ДАН баталгаажуулалт', 'Your ID card or a DAN sign-in'])}</p>
    <div class="mt-7">${s.m === 'sys' ? `<button type="button" class="btn btn-blue w-full" data-act="sys-open">${ic('external-link', 'w-[18px] h-[18px]')}${t('openSys')}</button>` : s.m === 'on' ? `<button type="button" class="btn btn-blue w-full" data-act="svc-apply" data-id="${s.id}">${ic('send', 'w-[18px] h-[18px]')}${t('applyOnline')}</button>` : `<button type="button" class="btn btn-ink w-full" data-act="svc-book" data-id="${s.id}">${ic('calendar-clock', 'w-[18px] h-[18px]')}${t('book')}</button>`}</div></div>` });
}
function svcApply(id) {
  const s = ALL_SVC.find((x) => x.id === id);
  const doIt = () => { addRequest('service', s.t); closeModal(); toast(t('requestSent'), 'send'); };
  if (!S.user) openLogin(doIt); else doIt();
}
function openBooking(o) {
  const days = []; let d = today();
  while (days.length < 5) { d = addDays(d, 1); if (o.wd != null ? d.getDay() === o.wd : d.getDay() !== 0 && d.getDay() !== 6) days.push(d); }
  const slots = o.wd != null ? ['14:00', '14:20', '14:40', '15:00', '15:20', '15:40'] : ['09:30', '10:30', '11:30', '14:00', '15:30', '16:30'];
  let di = 0, si = null;
  const taken = (a, b) => (a * 7 + b * 3) % 5 === 0;
  openModal({ size: 'md', label: t('book'), render: () => `${modalHead(t('book'), esc(L(o.t)), 'calendar-clock', 'bg-ink text-card')}<div class="px-5 sm:px-7 py-6">
    <p class="text-[13.5px] text-muted flex items-center gap-2">${ic('map-pin', 'w-4 h-4')}${esc(L(o.place || ['Сүхбаатар дүүргийн иргэний үйлчилгээний төв', 'Sükhbaatar District service centre']))}</p>
    <p class="mt-5 font-bold">${t('pickSlot')}</p>
    <div class="mt-3 grid grid-cols-5 gap-2">${days.map((x, i) => `<button type="button" class="rounded-xl border py-2 text-center transition-colors ${i === di ? 'bg-ink text-card border-transparent' : 'border-line hover:bg-soft'}" data-act="bk-day" data-i="${i}" aria-pressed="${i === di}"><span class="block text-[12px] font-semibold opacity-70">${EN() ? EN_WD[x.getDay()] : MN_WDS[x.getDay()]}</span><b class="block text-[17px] tnum">${x.getDate()}</b></button>`).join('')}</div>
    <div class="mt-3 grid grid-cols-3 gap-2">${slots.map((s, j) => { const tk = taken(di, j); return `<button type="button" ${tk ? 'disabled' : ''} class="h-11 rounded-xl border text-[14px] font-semibold tnum transition-colors ${tk ? 'border-line text-muted/50 line-through cursor-not-allowed' : j === si ? 'bg-ubbluebg text-white border-transparent' : 'border-line hover:bg-soft'}" data-act="bk-slot" data-j="${j}" aria-pressed="${j === si}">${s}</button>`; }).join('')}</div>
    <button type="button" class="btn btn-blue w-full mt-6" data-act="bk-ok" ${si == null ? 'disabled' : ''}>${ic('calendar-check', 'w-[18px] h-[18px]')}${t('confirmBook')}</button></div>` });
  MS = {
    bkDay: (i) => { di = i; si = null; paintModal(true); },
    bkSlot: (j) => { si = j; paintModal(true); },
    bkOk: () => { if (si == null) return; closeModal(); toast(`${t('booked')}: ${fDate(days[di], true)}, ${slots[si]}`, 'calendar-check'); if (o.onDone) o.onDone(); },
  };
}
function stepApply(i) {
  const s = SITS.find((x) => x.id === S.sit), st = s.steps[i];
  if (st.m === 'off') { openBooking({ t: st.t, onDone: () => toggleStep(i, true) }); return; }
  const doIt = () => { addRequest('service', st.t); toggleStep(i, true); toast(t('stepSent'), 'send'); };
  if (!S.user) openLogin(doIt); else doIt();
}

