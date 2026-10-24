import { Extension } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { Bold, Heading2, Heading3, ImagePlus, Italic, List, ListOrdered, Pilcrow, Table as TableIcon, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { uploadContentImage } from "@/lib/upload";

/** Adds a `dir` attribute to paragraphs and headings, with a toggle command for Arabic (RTL). */
const Direction = Extension.create({
  name: "direction",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          dir: {
            default: null,
            parseHTML: (el) => el.getAttribute("dir"),
            renderHTML: (attrs) => (attrs["dir"] ? { dir: attrs["dir"] } : {}),
          },
        },
      },
    ];
  },
});

export function RichEditor({ value, onChange, folder = "lessons" }: { value: string; onChange: (html: string) => void; folder?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Image, Table.configure({ resizable: false }), TableRow, TableHeader, TableCell, Direction],
    content: value,
    editorProps: { attributes: { class: "lesson-content min-h-80 px-4 py-3 focus:outline-none" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onTransaction: bump,
    onSelectionUpdate: bump,
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return <div className="h-96 animate-pulse rounded-lg border border-input bg-muted" />;

  const state = {
    h2: editor.isActive("heading", { level: 2 }),
    h3: editor.isActive("heading", { level: 3 }),
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    ul: editor.isActive("bulletList"),
    ol: editor.isActive("orderedList"),
    rtl: editor.getAttributes("paragraph")["dir"] === "rtl" || editor.getAttributes("heading")["dir"] === "rtl",
    table: editor.isActive("table"),
  };

  const toggleRtl = () => {
    const next = state.rtl ? null : "rtl";
    editor.chain().focus().updateAttributes("paragraph", { dir: next }).updateAttributes("heading", { dir: next }).run();
  };

  async function onImage(file: File | undefined) {
    if (!file || !editor) return;
    setUploading(true);
    try {
      const url = await uploadContentImage(file, folder);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ছবি আপলোড হয়নি");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-background">
      <div className="flex flex-wrap gap-1 border-b border-input bg-muted p-1.5">
        <Tb on={state.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="বড় শিরোনাম"><Heading2 /></Tb>
        <Tb on={state.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="ছোট শিরোনাম"><Heading3 /></Tb>
        <Tb onClick={() => editor.chain().focus().setParagraph().run()} title="সাধারণ লেখা"><Pilcrow /></Tb>
        <Tb on={state.bold} onClick={() => editor.chain().focus().toggleBold().run()} title="বোল্ড"><Bold /></Tb>
        <Tb on={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()} title="ইটালিক"><Italic /></Tb>
        <Tb on={state.ul} onClick={() => editor.chain().focus().toggleBulletList().run()} title="তালিকা"><List /></Tb>
        <Tb on={state.ol} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="নম্বর তালিকা"><ListOrdered /></Tb>
        <Tb onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="টেবিল"><TableIcon /></Tb>
        {state.table && (
          <>
            <Tb onClick={() => editor.chain().focus().addRowAfter().run()} title="সারি যোগ">+সারি</Tb>
            <Tb onClick={() => editor.chain().focus().addColumnAfter().run()} title="কলাম যোগ">+কলাম</Tb>
            <Tb onClick={() => editor.chain().focus().deleteTable().run()} title="টেবিল মুছুন"><Trash2 /></Tb>
          </>
        )}
        <Tb onClick={() => fileRef.current?.click()} title="ছবি">{uploading ? "…" : <ImagePlus />}</Tb>
        <Tb on={state.rtl} onClick={toggleRtl} title="আরবি (ডান থেকে বাম)"><span className="arabic text-base" lang="ar">ع</span> RTL</Tb>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onImage(e.target.files?.[0])} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function Tb({ on, onClick, title, children }: { on?: boolean; onClick: () => void; title: string; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center gap-1 rounded px-2 text-xs [&_svg]:h-4 [&_svg]:w-4 ${on ? "bg-primary text-primary-foreground" : "hover:bg-background"}`}
    >
      {children}
    </button>
  );
}
