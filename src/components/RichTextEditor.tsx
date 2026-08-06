"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        // Prevent editor blur on toolbar click
        e.preventDefault();
        onClick();
      }}
      title={title}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center h-7 w-7 rounded-sm border transition-all duration-150 text-xs font-bold",
        active
          ? "bg-primary/15 border-primary/50 text-primary"
          : "bg-transparent border-border/40 text-muted-foreground hover:bg-muted/30 hover:border-border/80 hover:text-foreground",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none"
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe el contenido aquí...",
  className,
  minHeight = "160px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions we don't use to keep the bundle lean
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
      }),
      Underline,
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      // Treat empty editor as empty string
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "outline-none min-h-[inherit] px-3 py-2.5 text-sm text-foreground leading-relaxed",
          "prose prose-invert max-w-none",
          "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_h1]:text-xl [&_h1]:font-black [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-bold",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground"
        ),
        "data-placeholder": placeholder,
      },
    },
  });

  // Sync external value changes (e.g. when modal opens with existing content)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (currentHtml !== value && value !== undefined) {
      // Only update if content genuinely differs to avoid cursor jumps
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  return (
    <div className={cn("rounded-sm border border-border/60 overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all duration-150 bg-card", className)}>
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/40 bg-muted/10 flex-wrap">
        {/* Bold */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Negrita (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Italic */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Cursiva (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Underline */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Subrayado (Ctrl+U)"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-4 bg-border/60 mx-0.5" />

        {/* Bullet list */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Lista con viñetas"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Ordered list */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Lista numerada"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-4 bg-border/60 mx-0.5" />

        {/* Undo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Deshacer (Ctrl+Z)"
        >
          <Undo className="h-3.5 w-3.5" />
        </ToolbarButton>

        {/* Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rehacer (Ctrl+Y)"
        >
          <Redo className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* ── Editor area ── */}
      <div style={{ minHeight }} className="relative">
        {/* Placeholder */}
        {editor.isEmpty && (
          <span className="absolute top-2.5 left-3 text-sm text-muted-foreground/50 pointer-events-none select-none">
            {placeholder}
          </span>
        )}
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
