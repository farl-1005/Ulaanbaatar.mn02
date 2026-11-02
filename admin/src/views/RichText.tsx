'use client';
/* Форматтай текст засварлагч (TipTap): тод, налуу, доогуур зураас, гарчиг, жагсаалт, ишлэл, холбоос.
   Монгол, англи хоёр тусдаа засварлагч (идэвхтэй хэлнийх нь л харагдана). Утга: [монгол HTML, англи HTML].
   Сайт дээр зөвхөн эдгээр тагийг зөвшөөрч шүүнэ (site/lib/ub/core/richtext.js). */
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { Bi, L, Lang } from '../kit';
import { Icon } from '../ui';

export function RichTextBi({ value, onChange, lang }: { value: Bi | undefined; onChange: (v: Bi) => void; lang: Lang }) {
  return (
    <>
      {(['mn', 'en'] as const).map((lg, i) => (
        <div key={lg} hidden={lang !== lg}>
          <RichText value={(value || [])[i] || ''} placeholder={lg === 'mn' ? 'Монгол' : 'English'}
            onChange={(html) => { const a: Bi = Array.isArray(value) ? [...value] as Bi : ['', '']; a[i] = html; onChange(a); }} />
        </div>
      ))}
    </>
  );
}

function RichText({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder: string }) {
  const editor = useEditor({
    extensions: [StarterKit.configure({
      heading: { levels: [2, 3] },
      code: false, codeBlock: false, horizontalRule: false,
      link: { openOnClick: false, autolink: true, defaultProtocol: 'https', HTMLAttributes: { rel: 'noopener', target: '_blank' } },
    })],
    content: value,
    immediatelyRender: false,   // Next.js: сервер дээр зурахгүй
    editorProps: { attributes: { class: 'adm-rt-body news-text', 'aria-label': placeholder, 'data-placeholder': placeholder } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  });
  // Гаднаас утга солигдвол (жишээ нь «Анхны хувилбарт буцаах») засварлагчийг шинэчилнэ
  useEffect(() => {
    if (editor && !editor.isFocused && value !== (editor.isEmpty ? '' : editor.getHTML())) editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);
  return (
    <div className="adm-rt">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'), italic: e.isActive('italic'), underline: e.isActive('underline'), strike: e.isActive('strike'),
      h2: e.isActive('heading', { level: 2 }), h3: e.isActive('heading', { level: 3 }),
      ul: e.isActive('bulletList'), ol: e.isActive('orderedList'), quote: e.isActive('blockquote'), link: e.isActive('link'),
      undo: e.can().undo(), redo: e.can().redo(),
    }),
  });
  const run = () => editor.chain().focus();
  const link = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt(L(['Холбоосын хаяг (хоосон бол холбоосыг арилгана)', 'Link URL (leave empty to remove)']), prev || 'https://');
    if (url === null) return;
    if (!url.trim() || url.trim() === 'https://') { run().extendMarkRange('link').unsetLink().run(); return; }
    if (!/^(https?:\/\/|mailto:)/i.test(url.trim())) { window.alert(L(['Хаяг https:// эсвэл mailto:-оор эхлэх ёстой', 'The URL must start with https:// or mailto:'])); return; }
    run().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };
  const B = ({ on, icon, label, act, disabled }: { on?: boolean; icon: string; label: [string, string]; act: () => void; disabled?: boolean }) => (
    <button type="button" className="adm-rt-btn" aria-pressed={!!on} disabled={disabled} title={L(label)} aria-label={L(label)}
      onMouseDown={(e) => e.preventDefault()} onClick={act}><Icon name={icon} className="w-[18px] h-[18px]" /></button>
  );
  return (
    <div className="adm-rt-bar" role="toolbar" aria-label={L(['Текстийн формат', 'Text formatting'])}>
      <B on={s.bold} icon="bold" label={['Тод', 'Bold']} act={() => run().toggleBold().run()} />
      <B on={s.italic} icon="italic" label={['Налуу', 'Italic']} act={() => run().toggleItalic().run()} />
      <B on={s.underline} icon="underline" label={['Доогуур зураас', 'Underline']} act={() => run().toggleUnderline().run()} />
      <B on={s.strike} icon="strikethrough" label={['Дундуур зураас', 'Strikethrough']} act={() => run().toggleStrike().run()} />
      <span className="adm-rt-sep" />
      <B on={s.h2} icon="heading-2" label={['Гарчиг', 'Heading']} act={() => run().toggleHeading({ level: 2 }).run()} />
      <B on={s.h3} icon="heading-3" label={['Дэд гарчиг', 'Subheading']} act={() => run().toggleHeading({ level: 3 }).run()} />
      <span className="adm-rt-sep" />
      <B on={s.ul} icon="list" label={['Цэгтэй жагсаалт', 'Bulleted list']} act={() => run().toggleBulletList().run()} />
      <B on={s.ol} icon="list-ordered" label={['Дугаартай жагсаалт', 'Numbered list']} act={() => run().toggleOrderedList().run()} />
      <B on={s.quote} icon="text-quote" label={['Ишлэл', 'Quote']} act={() => run().toggleBlockquote().run()} />
      <B on={s.link} icon="link" label={['Холбоос', 'Link']} act={link} />
      <span className="adm-rt-sep" />
      <B icon="remove-formatting" label={['Форматыг арилгах', 'Clear formatting']} act={() => run().unsetAllMarks().clearNodes().run()} />
      <B icon="undo-2" label={['Буцаах', 'Undo']} act={() => run().undo().run()} disabled={!s.undo} />
      <B icon="redo-2" label={['Дахин хийх', 'Redo']} act={() => run().redo().run()} disabled={!s.redo} />
    </div>
  );
}
