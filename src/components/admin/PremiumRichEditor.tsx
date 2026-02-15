"use client";

import React, { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Link2,
  Unlink,
  Heading2,
  Heading3,
  Minus,
  X,
} from "lucide-react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function LinkModal({
  open,
  initialUrl,
  onClose,
  onSubmit,
  onRemove,
}: {
  open: boolean;
  initialUrl: string;
  onClose: () => void;
  onSubmit: (url: string) => void;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState(initialUrl || "https://");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setUrl(initialUrl?.trim() || "https://");
    setError("");
  }, [open, initialUrl]);

  if (!open) return null;

  const validateUrl = (v: string) => {
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    const v = url.trim();
    if (!v) return setError("Please enter a URL.");
    if (!validateUrl(v)) return setError("Please enter a valid http(s) URL.");
    onSubmit(v);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onMouseDown={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl border border-white/10 bg-[#070b1a] shadow-[0_30px_90px_rgba(0,0,0,0.7)] overflow-hidden"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs tracking-[0.18em] uppercase text-white/50">
                Add link
              </div>
              <div className="text-sm font-semibold text-white/90 mt-1">
                Paste URL for selected text
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition inline-flex items-center justify-center"
            >
              <X className="h-4 w-4 text-white/80" />
            </button>
          </div>

          <div className="p-5 space-y-3">
            <label className="text-xs font-medium text-white/70">URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/90 placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#DEE05B]/60"
            />

            {error ? (
              <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onRemove();
                  onClose();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
              >
                <Unlink className="h-4 w-4" />
                Remove link
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-full bg-[#DEE05B] px-4 py-2 text-xs font-semibold text-black shadow-[0_16px_40px_rgba(222,224,91,0.35)] hover:brightness-95 transition"
                >
                  Save link
                </button>
              </div>
            </div>

            <p className="text-[11px] text-white/40">
              Tip: Select text first, then add a link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // keeps editor focused (fixes list/buttons)
        onClick();
      }}
      className={cx(
        "inline-flex items-center justify-center rounded-lg px-2.5 py-2 border transition",
        "border-white/10 bg-white/5 hover:bg-white/10",
        active && "bg-[#DEE05B]/15 border-[#DEE05B]/35"
      )}
    >
      {children}
    </button>
  );
}

export default function PremiumRichEditor({
  value,
  onChange,
  placeholder = "Write content here…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [linkOpen, setLinkOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noreferrer noopener",
          target: "_blank",
          class: "text-[#DEE05B] font-semibold underline underline-offset-4",
        },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none " +
          "prose-a:text-[#DEE05B] prose-a:font-semibold " +
          "prose-strong:text-white prose-li:marker:text-white/60 " +
          "min-h-[260px] px-4 py-4",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || "";
    const current = editor.getHTML();
    if (next !== current) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  const linkHref = useMemo(() => {
    if (!editor) return "";
    return (editor.getAttributes("link")?.href || "").toString();
  }, [editor, linkOpen]);

  if (!editor) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
      <LinkModal
        open={linkOpen}
        initialUrl={linkHref}
        onClose={() => setLinkOpen(false)}
        onSubmit={(url) =>
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
        }
        onRemove={() => editor.chain().focus().unsetLink().run()}
      />

      <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center gap-2">
        <ToolbarBtn
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4 text-white/85" />
        </ToolbarBtn>

        <ToolbarBtn
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4 text-white/85" />
        </ToolbarBtn>

        <div className="mx-1 h-6 w-px bg-white/10" />

        <ToolbarBtn
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4 text-white/85" />
        </ToolbarBtn>

        <ToolbarBtn
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4 text-white/85" />
        </ToolbarBtn>

        <ToolbarBtn
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4 text-white/85" />
        </ToolbarBtn>

        <div className="mx-1 h-6 w-px bg-white/10" />

        <ToolbarBtn
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4 text-white/85" />
        </ToolbarBtn>

        <ToolbarBtn
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4 text-white/85" />
        </ToolbarBtn>

        <ToolbarBtn
          title="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4 text-white/85" />
        </ToolbarBtn>

        <ToolbarBtn
          title="Divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4 text-white/85" />
        </ToolbarBtn>

        <div className="mx-1 h-6 w-px bg-white/10" />

        <ToolbarBtn
          title="Add / Edit link"
          active={editor.isActive("link")}
          onClick={() => setLinkOpen(true)}
        >
          <Link2 className="h-4 w-4 text-white/85" />
        </ToolbarBtn>

        <ToolbarBtn
          title="Remove link"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Unlink className="h-4 w-4 text-white/85" />
        </ToolbarBtn>

        <div className="mx-1 h-6 w-px bg-white/10" />

        <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4 text-white/85" />
        </ToolbarBtn>

        <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4 text-white/85" />
        </ToolbarBtn>
      </div>

      <div className="border-t border-white/10 bg-[#060a18] focus-within:ring-2 focus-within:ring-[#DEE05B]/60">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
