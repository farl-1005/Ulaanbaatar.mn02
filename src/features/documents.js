/* ================= Documents, tenders, events ================= */
function openDoc(type, i) {
  const d = DOCS[type][i]; if (!d) return;
  if (/^https?:\/\//.test(d.url || '')) { window.open(d.url, '_blank', 'noopener'); return; }   // admin-аас оруулсан баримтын холбоос
  const date = addDays(today(), -d.ago);
  if (type === 'tender') { openTender(d, date); return; }
  const res = type === 'res';
  const hdr = res ? L(['НИЙСЛЭЛИЙН ИРГЭДИЙН ТӨЛӨӨЛӨГЧДИЙН ХУРЛЫН ТОГТООЛ', 'RESOLUTION OF THE CITY COUNCIL']) : L(['НИЙСЛЭЛИЙН ЗАСАГ ДАРГЫН ЗАХИРАМЖ', 'ORDER OF THE GOVERNOR OF THE CAPITAL CITY']);
  const clauses = [
    [res ? 'Нийслэлийн хөгжлийн бодлого, иргэдийн саналыг үндэслэн ТОГТООХ нь:' : 'Нийслэлийн хөгжлийн бодлого, иргэдийн саналыг үндэслэн ЗАХИРАМЖЛАХ нь:', res ? 'Based on the city development policy and residents\u2019 input, IT IS RESOLVED:' : 'Based on the city development policy and residents\u2019 input, IT IS ORDERED:'],
    ['1. Энэхүү шийдвэрийн хэрэгжилтийг хангаж ажиллахыг холбогдох газар, агентлагуудад даалгасугай.', '1. The relevant departments and agencies shall implement this decision.'],
    ['2. Хэрэгжилтийн явцыг улирал бүр иргэдэд нээлттэй мэдээлэхийг Тамгын газарт үүрэг болгосугай.', '2. City Hall shall report progress to residents every quarter.'],
    ['3. Энэхүү шийдвэрийг нийтэлсэн өдрөөс эхлэн дагаж мөрдсүгэй.', '3. This decision takes effect on the day of publication.'],
  ];
  openModal({ size: 'lg', label: d.no, render: () => `${modalHead(d.no, fDate(date), res ? 'scroll-text' : 'stamp', 'bg-soft text-ubblue')}<div class="p-4 sm:p-8 bg-soft"><div class="paper rounded-lg mx-auto max-w-[560px] px-6 sm:px-12 py-10 text-[13.5px] leading-relaxed">
    <div class="flex justify-center">${logoMark('w-12 h-12')}</div><p class="mt-4 text-center font-extrabold tracking-wide text-[12.5px] text-[#111827]">${hdr}</p>
    <div class="mt-5 flex justify-between gap-3 text-[12px] text-gray-500"><span>${fDate(date)}</span><span class="font-bold text-gray-800 tnum">${esc(d.no)}</span><span>${L(['Улаанбаатар хот', 'Ulaanbaatar'])}</span></div>
    <p class="mt-6 text-center font-bold text-[15px] leading-snug text-[#111827]">${esc(L(d.t))}</p>
    <div class="mt-6 space-y-3 text-gray-700">${clauses.map((c) => `<p>${esc(L(c))}</p>`).join('')}</div>
    <div class="mt-5 space-y-2" aria-hidden="true">${[92, 100, 84, 96, 60].map((w) => `<span class="block h-2 rounded-[4px] bg-gray-200" style="width:${w}%"></span>`).join('')}</div>
    <div class="mt-10 flex items-end justify-between text-[12px] text-gray-500"><span>${res ? L(['ХУРЛЫН ДАРГА', 'CHAIR OF THE COUNCIL']) : L(['ЗАСАГ ДАРГА', 'GOVERNOR'])}</span><span class="w-28 border-b border-gray-400"></span></div></div>
    <p class="mt-4 text-center text-[13px] text-muted">${t('docNote')}</p></div>` });
}
function openTender(d, date) {
  const cur = d.st === 'open' ? 1 : d.st === 'eval' ? 2 : 3;
  const steps = [[t('tl_pub'), fDate(date)], [t('tl_bids'), fDate(addDays(today(), d.st === 'open' ? d.left : -Math.max(1, d.ago - 21)))], [t('tl_eval'), ''], [t('tl_contract'), '']];
  openModal({ size: 'md', label: L(d.t), render: () => `${modalHead(L(d.t), esc(d.no), 'gavel', 'bg-soft text-ubblue')}<div class="px-5 sm:px-7 py-6">
    <div class="grid grid-cols-2 gap-3 text-[13.5px]"><div class="rounded-xl bg-soft p-3"><p class="text-muted">${t('budget')}</p><b class="tnum">${mln(d.bud)}</b></div><div class="rounded-xl bg-soft p-3"><p class="text-muted mb-1">${L(['Төлөв', 'Status'])}</p>${tenderBadge(d)}</div></div>
    <ol class="mt-6">${steps.map((s, i) => `<li class="flex gap-3 relative ${i < 3 ? 'pb-5' : ''}">${i < 3 ? `<span class="absolute left-[11px] top-7 bottom-0 w-0.5 ${i < cur ? 'bg-ubgreen' : 'bg-line'}"></span>` : ''}<span class="relative w-6 h-6 rounded-full grid place-items-center shrink-0 ${i < cur ? 'bg-ubgreen text-white' : i === cur ? 'bg-ubbluebg text-white' : 'bg-line'}">${i < cur ? ic('check', 'w-3.5 h-3.5', 3) : ''}</span><span><b class="block text-[14.5px]">${s[0]}</b>${s[1] ? `<span class="text-[13px] text-muted">${s[1]}</span>` : ''}</span></li>`).join('')}</ol>
    ${d.st === 'open' ? `<button type="button" class="btn btn-blue w-full mt-2" data-act="bid">${ic('file-signature', 'w-[18px] h-[18px]')}${t('bidBtn')}</button>` : ''}</div>` });
}
function openEvent(id) {
  const e = EVENTS.find((x) => x.id === id); if (!e) return;
  const d = evDate(e.w), c = ECAT[e.c];
  openModal({ size: 'md', label: L(e.t), render: () => { const saved = S.evSaved.includes(id);
    return `<div class="relative"><div class="scene aspect-[16/8] sm:rounded-t-[8px]">${Scene(e.img)}</div>${closeBtnImg()}</div><div class="px-5 sm:px-7 py-6"><span class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted"><i class="w-2 h-2 rounded-full" style="background:${c.c}"></i>${esc(L(c.t))}</span><h2 class="mt-2 text-[24px] font-extrabold leading-tight">${esc(L(e.t))}</h2>
    <div class="mt-4 grid gap-2.5 text-[14.5px]"><p class="flex items-center gap-3">${ic('calendar-days', 'w-5 h-5 text-muted')}${fDate(d, true)}, ${esc(e.tm)}</p><p class="flex items-center gap-3">${ic('map-pin', 'w-5 h-5 text-muted')}${esc(L(e.v))}</p><p class="flex items-center gap-3">${ic('ticket', 'w-5 h-5 text-muted')}${e.price ? money(e.price) : t('free')}</p></div>
    <p class="mt-5 text-[15px] leading-relaxed text-ink/85">${esc(L(e.desc && (e.desc[0] || e.desc[1]) ? e.desc : (EVDESC[e.c] || ['', ''])))}</p>
    <div class="mt-6 flex flex-wrap gap-2"><button type="button" class="btn ${saved ? 'btn-ghost' : 'btn-ink'}" data-act="ev-save" data-id="${id}" aria-pressed="${saved}">${ic(saved ? 'bookmark-check' : 'bookmark', 'w-[18px] h-[18px]')}${saved ? t('saved') : t('save')}</button><button type="button" class="btn btn-ghost" data-act="ev-onmap" data-id="${id}">${ic('map', 'w-[18px] h-[18px]')}${t('showOnMap')}</button></div></div>`; } });
}
function toggleSave(id) {
  const has = S.evSaved.includes(id);
  S.evSaved = has ? S.evSaved.filter((x) => x !== id) : S.evSaved.concat(id); store.set('evSaved', S.evSaved);
  toast(has ? t('unsavedT') : t('savedT'), has ? 'bookmark' : 'bookmark-check');
  repaintEvents(); if (MODAL) paintModal(true); if (S.route === 'my') renderMy();
}

