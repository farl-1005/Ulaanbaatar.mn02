/* ================= Маягт илгээх туслах ================= */
function submitErr(e) {
  const c = e && e.code;
  if (c === 'too_many_requests') return L(['Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.', 'Too many submissions. Please wait and try again.']);
  if (c === 'bad_email') return t('badEmail');
  if (c === 'too_large') return L(['Зураг хэт том байна', 'The photo is too large']);
  return L(['Илгээж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.', "Couldn't send. Check your connection and try again."]);
}

/* ================= Эрсдэл мэдээлэх =================
   Нийслэлийн нэгдсэн «Санал хүсэлт» системд (open.ulaanbaatar.mn, ДАН-аар нэвтэрч «Эрсдэл мэдээлэх» төрлийг сонгоно) шинэ цонхонд нээнэ. */
const REPORT_URL = 'https://open.ulaanbaatar.mn/feedback';
function openReport() {
  closeMenu();
  window.open(REPORT_URL, '_blank', 'noopener');
}
/* ================= Have your say ================= */
const VOTE_URL = 'https://vote.ulaanbaatar.mn/home';
function openVote(tab, opts = {}) {
  closeMenu();
  if ((tab || 'poll') === 'poll') { window.open(VOTE_URL, '_blank', 'noopener'); return; }
  let cur = tab || 'poll', pick = null, topic = opts.topic || (opts.gov ? 'other' : 'plan'), sent = false, text = '';
  const body = () => {
    if (cur === 'poll') {
      const v = S.vote, counts = POLL.map((p, i) => p[2] + (v === i ? 1 : 0)), tot = counts.reduce((a, b) => a + b, 0);
      return `<p class="text-[17px] font-extrabold leading-snug">${t('pollQ')}</p><p class="mt-1 text-[13px] text-muted">${t('pollUntil', { d: fDate(addDays(today(), 23)) })}</p>
        <div class="mt-5 space-y-2.5">${POLL.map((p, i) => {
          const pct = Math.round((counts[i] / tot) * 100), lbl = esc(EN() ? p[1] : p[0]);
          return v != null
            ? `<div class="relative rounded-xl border ${v === i ? 'border-ubblue' : 'border-line'} overflow-hidden"><div class="hbar absolute inset-y-0 left-0 ${v === i ? 'bg-ubblue/15' : 'bg-soft'}" style="width:${pct}%"></div><div class="relative flex items-center justify-between gap-3 px-4 h-12"><span class="font-semibold text-[14.5px] flex items-center gap-2">${v === i ? ic('circle-check', 'w-[18px] h-[18px] text-ubblue') : ''}${lbl}</span><b class="tnum text-[14px]">${pct}%</b></div></div>`
            : `<button type="button" class="w-full flex items-center gap-3 px-4 h-12 rounded-xl border-2 text-left transition-colors ${pick === i ? 'border-ubblue bg-ubblue/5' : 'border-line hover:border-ink/25'}" data-act="v-pick" data-i="${i}" aria-pressed="${pick === i}"><span class="w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${pick === i ? 'border-ubblue' : 'border-line'}">${pick === i ? '<i class="w-2.5 h-2.5 rounded-full bg-ubblue"></i>' : ''}</span><span class="font-semibold text-[14.5px]">${lbl}</span></button>`;
        }).join('')}</div>
        ${v != null ? `<p class="mt-4 text-[13.5px] text-muted flex items-center gap-2">${ic('users-round', 'w-4 h-4')}${t('totalVotes', { n: num(tot) })}</p>` : `<button type="button" class="btn btn-blue w-full mt-5" data-act="v-cast" ${pick == null ? 'disabled' : ''}>${ic('vote', 'w-[18px] h-[18px]')}${t('voteBtn')}</button>`}`;
    }
    if (sent) return `<div class="py-6 text-center"><span class="w-14 h-14 mx-auto rounded-full bg-ubgreen text-white grid place-items-center check-pop">${ic('check', 'w-7 h-7', 2.6)}</span><p class="mt-4 font-extrabold text-[18px] max-w-[30ch] mx-auto">${t('ideaSent')}</p></div>`;
    return `${opts.gov ? `<p class="rounded-xl bg-soft p-3 mb-4 text-[13.5px] font-semibold flex items-center gap-2">${ic('mail', 'w-4 h-4')}${t('toGov')}</p>` : ''}<p class="text-[13.5px] font-semibold">${t('topic')}</p><div class="mt-2 flex flex-wrap gap-2">${TOPICS.map(([k, mn, en]) => `<button type="button" class="chip" data-act="v-topic" data-v="${k}" aria-pressed="${topic === k}">${esc(EN() ? en : mn)}</button>`).join('')}</div><textarea id="v-text" rows="5" class="field mt-4" placeholder="${esc(t('ideaPh'))}">${esc(text)}</textarea><p class="mt-1 text-[13px] text-ubred min-h-[18px]" id="v-err" role="alert"></p><button type="button" class="btn btn-blue w-full mt-1" data-act="v-send">${ic('send', 'w-[18px] h-[18px]')}${t('ideaSend')}</button>`;
  };
  const bindText = (root) => { const ta = $('#v-text', root); if (ta) ta.addEventListener('input', () => { text = ta.value; const e = $('#v-err'); if (e) e.textContent = ''; }); };
  const drawn = (el) => requestAnimationFrame(() => requestAnimationFrame(() => el && el.classList.add('drawn')));
  openModal({ size: 'md', label: t('vTitle'), render: () => `${modalHead(t('vTitle'), '', 'vote', 'bg-ubbluebg text-white')}<div class="px-5 sm:px-7 py-6">${tabs('vote', [['poll', t('vPoll'), 'chart-bar-big'], ['idea', t('vIdea'), 'message-square-plus']], cur, { cls: 'w-full [&>button]:flex-1 [&>button]:justify-center' })}<div id="v-body" class="mt-6">${body()}</div></div>`,
    after: (sh) => { bindText(sh); drawn($('#v-body', sh)); } });
  MS = {
    vTab: (v) => { if (v === cur) return; if (v === 'poll') { window.open(VOTE_URL, '_blank', 'noopener'); return; } const dir = v === 'idea' ? 1 : -1; cur = v; selectTab('vote', v); swap($('#v-body'), body(), dir, (el) => { bindText(el); el.classList.add('drawn'); }); },
    vPick: (i) => { pick = i; $('#v-body').innerHTML = body(); },
    vCast: () => { if (pick == null) return; S.vote = pick; store.set('vote', pick); const b = $('#v-body'); b.classList.remove('drawn'); b.innerHTML = body(); drawn(b); toast(t('voted'), 'vote'); },
    vTopic: (k) => { topic = k; $$('[data-act="v-topic"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === k))); },
    vSend: async () => {
      if (!text.trim()) { const e = $('#v-err'); if (e) e.textContent = t('needText'); const ta = $('#v-text'); if (ta) ta.focus(); return; }
      if (CMS.mode === 'api') {
        const btn = $('[data-act="v-send"]'); if (btn) { if (btn.disabled) return; btn.disabled = true; }
        try { await apiCall('/submit/idea', { method: 'POST', body: { topic, text, gov: !!opts.gov } }); }
        catch (e) { if (btn) btn.disabled = false; toast(submitErr(e), 'triangle-alert'); return; }
      }
      sent = true; $('#v-body').innerHTML = body(); toast(t('ideaSent'), 'send'); },
  };
}

