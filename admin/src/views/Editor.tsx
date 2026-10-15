'use client';
/* Бичлэг засах / нэмэх цонх: зүүн талд талбарууд, баруун талд сайт дээр хэрхэн харагдах. */
import { useCallback, useDeferredValue, useState } from 'react';
import { cms, errMsg } from '../cms';
import { L, Lang } from '../kit';
import { blankDoc, docForEdit, prepareSave, SCHEMA } from '../schema';
import { Html, Icon, Modal, ModalHead, Seg, useArmed, useToast } from '../ui';
import { Doc, FieldView } from './fields';
import { previewHtml } from './preview';

/** id: засах бичлэг, null бол шинэ */
export function Editor({ col, id, onClose }: { col: string; id: string | null; onClose: () => void }) {
  const sc = SCHEMA[col], toast = useToast(), { armed, confirm } = useArmed();
  const [start] = useState(() => {
    if (!id) return { id: sc.idp + Date.now().toString(36), isNew: true, edited: false, doc: blankDoc(col) };
    const it = cms.merged(col).find((x) => x.id === id);
    return it ? { id, isNew: false, edited: !!it._edited, doc: docForEdit(col, it) } : null;
  });
  const [doc, setDoc] = useState<Doc>(start ? start.doc : {});
  const [lang, setLang] = useState<Lang>('mn'), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const preview = useDeferredValue(doc);   // бичих үед удаашруулахгүй
  const patch = useCallback((p: Doc) => setDoc((d) => ({ ...d, ...p })), []);

  if (!start) {
    return (
      <Modal onClose={onClose} size="sm:max-w-md">
        <div className="p-8 text-center"><p className="font-bold">{L(['Бичлэг олдсонгүй', 'Item not found'])}</p>
          <button type="button" className="btn btn-ghost mt-4" onClick={onClose}>{L(['Хаах', 'Close'])}</button></div>
      </Modal>
    );
  }

  const title = start.isNew ? L(['Шинэ', 'New']) + ' ' + L(sc.one) : L(['Засах', 'Edit']) + ': ' + (sc.title(doc) || '');
  const save = async () => {
    const d = { ...doc }, missing = prepareSave(col, d);
    if (missing.length) { setErr(L(['Монгол хэл дээрх заавал бөглөх талбарыг бөглөнө үү', 'Fill in the required Mongolian fields']) + ': ' + missing.join(', ')); setLang('mn'); return; }
    setBusy(true);
    try {
      await cms.save(col, start.id, d, sc.title(d), start.isNew ? 'create' : 'update');
      toast(L(['Хадгаллаа. Сайт шинэчлэгдлээ.', 'Saved. The site is updated.']));
      onClose();
    } catch (e) { setErr(errMsg(e)); setBusy(false); }
  };
  const remove = async () => {
    if (!confirm('del')) return;
    try { await cms.remove(col, start.id, sc.title(doc)); toast(L(['Устгалаа', 'Deleted']), 'trash-2'); onClose(); }
    catch (e) { toast(errMsg(e), 'triangle-alert'); }
  };
  const revert = async () => {
    try { await cms.revert(col, start.id, sc.title(doc)); toast(L(['Анхны хувилбарт буцаалаа', 'Reverted to the original']), 'rotate-ccw'); onClose(); }
    catch (e) { toast(errMsg(e), 'triangle-alert'); }
  };

  return (
    <Modal onClose={onClose} label={L(sc.one)}>
      <ModalHead title={title} icon={sc.icon} onClose={onClose} />
      <div className="px-5 sm:px-7 pt-4"><Seg items={[['mn', 'Монгол'], ['en', 'English']]} value={lang} onChange={setLang} label="Language" /></div>
      <div className="px-5 sm:px-7 pt-5 pb-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_268px] gap-7">
        <form className="space-y-5" noValidate onSubmit={(e) => { e.preventDefault(); save(); }}>
          {sc.fields.map((f) => <FieldView key={f[0]} f={f} doc={doc} patch={patch} lang={lang} />)}
        </form>
        <aside className="hidden lg:block"><div className="sticky top-24">
          <p className="adm-label">{L(['Сайт дээр ингэж харагдана', 'How it looks on the site'])}</p>
          <Html className="pointer-events-none select-none" html={previewHtml(col, preview)} />
        </div></aside>
      </div>
      <div className="sticky bottom-0 z-10 bg-card/95 backdrop-blur border-t border-line px-5 sm:px-7 py-3 flex flex-wrap items-center gap-2">
        {!start.isNew && <button type="button" className="btn btn-sm btn-ghost !text-ubred" onClick={remove}><Icon name={armed === 'del' ? 'triangle-alert' : 'trash-2'} className="w-4 h-4" />{armed === 'del' ? L(['Дахин дарж баталгаажуулна', 'Click again to confirm']) : L(['Устгах', 'Delete'])}</button>}
        {start.edited && <button type="button" className="btn btn-sm btn-ghost" onClick={revert}><Icon name="rotate-ccw" className="w-4 h-4" />{L(['Анхны хувилбар', 'Revert'])}</button>}
        <span className="flex-1" />
        <span className="text-[13px] text-ubred" role="alert">{err}</span>
        <button type="button" className="btn btn-ghost" onClick={onClose}>{L(['Болих', 'Cancel'])}</button>
        <button type="button" className="btn btn-blue" disabled={busy} onClick={save}><Icon name="check" className="w-[18px] h-[18px]" />{L(['Хадгалах', 'Save'])}</button>
      </div>
    </Modal>
  );
}
