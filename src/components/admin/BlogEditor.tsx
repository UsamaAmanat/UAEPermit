// src/components/admin/BlogEditor.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useState,
  ClipboardEvent,
  KeyboardEvent,
} from "react";
import { toast } from "sonner";
import { storage } from "@/lib/firebaseClient";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

type Props = {
  value: string; // HTML
  onChange: (html: string) => void;
};

export default function BlogEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImageUrlBar, setShowImageUrlBar] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showLinkBar, setShowLinkBar] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // global line-height inside editor
  const [lineHeight, setLineHeight] = useState<"tight" | "normal" | "loose">(
    "normal"
  );

  const [fontSizePreset, setFontSizePreset] = useState<"sm" | "md" | "lg">(
    "md"
  );
  const [fontFamilyPreset, setFontFamilyPreset] = useState<
    "default" | "inter" | "georgia" | "system"
  >("default");

  // last clicked image inside editor
  const selectedImageRef = useRef<HTMLImageElement | null>(null);

  // sync external value -> editor DOM
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const focusEditor = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
  };

  const exec = (command: string, arg?: string) => {
    focusEditor();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleHeading = (level: 1 | 2 | 3) => exec("formatBlock", `H${level}`);
  const handleParagraph = () => exec("formatBlock", "P");
  const applyTextColor = (color: string) => exec("foreColor", color);
  const applyHighlight = (color: string) => exec("hiliteColor", color);

  const applyFontSize = (size: 2 | 3 | 4) => {
    focusEditor();
    document.execCommand("fontSize", false, String(size));
    handleInput();
  };

  const applyFontFamily = (family: string) => {
    focusEditor();
    document.execCommand("fontName", false, family);
    handleInput();
  };

  // 🧼 PASTE: keep lists/headings, strip garbage styles/classes & icons
  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const html =
      e.clipboardData.getData("text/html") ||
      e.clipboardData.getData("text/plain");

    if (!html) return;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    // remove designy media elements (icons, hero images, etc.)
    wrapper
      .querySelectorAll("img, svg, picture, figure")
      .forEach((el) => el.remove());

    // clean attributes + unwrap unsupported tags
    const allowed = new Set([
      "P",
      "BR",
      "H1",
      "H2",
      "H3",
      "UL",
      "OL",
      "LI",
      "STRONG",
      "EM",
      "B",
      "I",
      "U",
      "A",
    ]);

    wrapper.querySelectorAll("*").forEach((el) => {
      // strip inline styles
      el.removeAttribute("style");

      // keep only our blog-* utility classes
      const cls = el.getAttribute("class");
      if (cls) {
        const kept = cls
          .split(/\s+/)
          .filter((c) => c.startsWith("blog-"))
          .join(" ");
        kept ? el.setAttribute("class", kept) : el.removeAttribute("class");
      }

      // unwrap non-allowed tags but keep content
      if (!allowed.has(el.tagName)) {
        const parent = el.parentNode;
        while (el.firstChild) parent?.insertBefore(el.firstChild, el);
        parent?.removeChild(el);
      }
    });

    focusEditor();
    document.execCommand("insertHTML", false, wrapper.innerHTML);
    handleInput();
  };

  // 📸 track clicked image
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // clear old selected border
    editorRef.current
      ?.querySelectorAll("img.blog-img-selected")
      .forEach((img) => img.classList.remove("blog-img-selected"));

    if (target.tagName === "IMG") {
      const imgEl = target as HTMLImageElement;
      selectedImageRef.current = imgEl;
      imgEl.classList.add("blog-img-selected");
    } else {
      selectedImageRef.current = null;
    }
  };

  // delete selected image with Backspace / Delete
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      selectedImageRef.current
    ) {
      e.preventDefault();

      const img = selectedImageRef.current;
      img.classList.remove("blog-img-selected");
      selectedImageRef.current = null;
      img.parentElement?.removeChild(img);
      handleInput();
    }
  };

  // 📤 Upload image to Firebase
  const triggerUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadBlogImage(file);
      focusEditor();
      document.execCommand("insertImage", false, url);
      handleInput();
      toast.success("Image uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed. Please check your permissions.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // 🧽 Clean HTML: remove style/classes but keep our own helper classes
  const handleCleanHtml = () => {
    if (!editorRef.current) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = editorRef.current.innerHTML;

    wrapper.querySelectorAll("*").forEach((el) => {
      const cls = el.getAttribute("class");
      if (cls) {
        const kept = cls
          .split(/\s+/)
          .filter((c) => c.startsWith("blog-"))
          .join(" ")
          .trim();
        if (kept) el.setAttribute("class", kept);
        else el.removeAttribute("class");
      }
      el.removeAttribute("style");
    });

    editorRef.current.innerHTML = wrapper.innerHTML;
    handleInput();

    toast.success("Cleaned extra HTML", {
      description: "Removed builder styles and kept only editor formatting.",
    });
  };

  // 🧨 Reset content (inline confirmation)
  const handleResetClick = () => {
    setShowResetConfirm(true);
    setShowImageUrlBar(false);
    setShowLinkBar(false);
  };

  const confirmReset = () => {
    if (editorRef.current) editorRef.current.innerHTML = "";
    onChange("");
    setShowResetConfirm(false);
    toast.success("Article cleared", {
      description: "The editor content has been reset.",
    });
  };

  const cancelReset = () => setShowResetConfirm(false);

  // 🔗 Link bar
  const openLinkBar = () => {
    setShowLinkBar(true);
    setShowImageUrlBar(false);
    setLinkUrl("");
    setLinkText("");
  };

  const handleApplyLink = () => {
    let url = linkUrl.trim();
    if (!url) {
      toast.error("Please enter a link URL");
      return;
    }
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    const selection = window.getSelection();

    // if some text is selected inside editor -> wrap that text
    if (
      selection &&
      !selection.isCollapsed &&
      editorRef.current &&
      editorRef.current.contains(selection.anchorNode)
    ) {
      focusEditor();
      document.execCommand("createLink", false, url);
    } else {
      // no selection -> insert <a>text</a>
      const label = (linkText || url).trim();
      const safeLabel = label.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      focusEditor();
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`
      );
    }

    handleInput();
    setShowLinkBar(false);
    toast.success("Link added");
  };

  // 🖼 Image URL bar
  const openImageUrlBar = () => {
    setShowImageUrlBar(true);
    setShowLinkBar(false);
    setImageUrl("");
  };

  const handleInsertImageUrl = () => {
    let url = imageUrl.trim();
    if (!url) {
      toast.error("Please enter an image URL");
      return;
    }
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    focusEditor();
    document.execCommand("insertImage", false, url);
    handleInput();
    setShowImageUrlBar(false);
    toast.success("Image inserted from URL");
  };

  // 🧩 Image sizes (Small / Medium / Full)
  const setImageSize = (size: "sm" | "md" | "lg") => {
    const img = selectedImageRef.current;
    if (!img) {
      toast.info("Click an image in the article first");
      return;
    }

    img.classList.remove("blog-img-sm", "blog-img-md", "blog-img-lg");
    img.classList.add(`blog-img-${size}`);
    handleInput();
  };

  // handle fontSize preset change
  const handleFontSizePresetChange = (preset: "sm" | "md" | "lg") => {
    setFontSizePreset(preset);
    if (preset === "sm") applyFontSize(2);
    else if (preset === "md") applyFontSize(3);
    else applyFontSize(4);
  };

  // handle fontFamily preset change
  const handleFontFamilyPresetChange = (
    preset: "default" | "inter" | "georgia" | "system"
  ) => {
    setFontFamilyPreset(preset);
    if (preset === "default") applyFontFamily("inherit");
    else if (preset === "inter") applyFontFamily("Inter, system-ui, sans-serif");
    else if (preset === "georgia") applyFontFamily("Georgia, serif");
    else applyFontFamily("system-ui, -apple-system, BlinkMacSystemFont");
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80">
      {/* TOOLBAR */}
      <div className="blog-editor-toolbar flex flex-wrap items-center gap-1 border-b border-slate-700 bg-slate-950/95 px-3 py-2 text-xs text-slate-200 backdrop-blur">
        {/* Headings */}
        <ToolbarButton onClick={() => handleHeading(1)}>H1</ToolbarButton>
        <ToolbarButton onClick={() => handleHeading(2)}>H2</ToolbarButton>
        <ToolbarButton onClick={() => handleHeading(3)}>H3</ToolbarButton>
        <ToolbarButton onClick={handleParagraph}>P</ToolbarButton>

        <ToolbarDivider />

        {/* Basic styles */}
        <ToolbarButton onClick={() => exec("bold")}>
          <span className="font-semibold">B</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")}>
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")}>
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("strikeThrough")}>S</ToolbarButton>

        {/* Font size */}
        <ToolbarDivider />
        <span className="ml-1 text-[11px] text-slate-400">Size</span>
        <select
          value={fontSizePreset}
          onChange={(e) =>
            handleFontSizePresetChange(e.target.value as "sm" | "md" | "lg")
          }
          className="rounded-md bg-slate-900 border border-slate-700 px-1 py-[1px] text-[11px]"
        >
          <option value="sm">Small</option>
          <option value="md">Normal</option>
          <option value="lg">Large</option>
        </select>

        {/* Font family */}
        <ToolbarDivider />
        <span className="ml-1 text-[11px] text-slate-400">Font</span>
        <select
          value={fontFamilyPreset}
          onChange={(e) =>
            handleFontFamilyPresetChange(
              e.target.value as "default" | "inter" | "georgia" | "system"
            )
          }
          className="rounded-md bg-slate-900 border border-slate-700 px-1 py-[1px] text-[11px]"
        >
          <option value="default">Default</option>
          <option value="inter">Inter / Sans</option>
          <option value="georgia">Georgia / Serif</option>
          <option value="system">System</option>
        </select>

        {/* Align */}
        <ToolbarDivider />
        <ToolbarButton onClick={() => exec("justifyLeft")}>⯇</ToolbarButton>
        <ToolbarButton onClick={() => exec("justifyCenter")}>≡</ToolbarButton>
        <ToolbarButton onClick={() => exec("justifyRight")}>⯈</ToolbarButton>

        {/* Line height */}
        <ToolbarDivider />
        <span className="ml-1 mr-[2px] text-[11px] text-slate-400">Line</span>
        <ToolbarButton onClick={() => setLineHeight("tight")}>1.4</ToolbarButton>
        <ToolbarButton onClick={() => setLineHeight("normal")}>
          1.7
        </ToolbarButton>
        <ToolbarButton onClick={() => setLineHeight("loose")}>2.0</ToolbarButton>

        {/* Lists */}
        <ToolbarDivider />
        <ToolbarButton onClick={() => exec("insertUnorderedList")}>
          • List
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")}>
          1. List
        </ToolbarButton>

        {/* Text color */}
        <ToolbarDivider />
        <span className="ml-1 mr-1 text-[11px] text-slate-400">Color</span>
        <ColorDot
          onClick={() => applyTextColor("#e5e7eb")}
          className="bg-slate-100"
        />
        <ColorDot
          onClick={() => applyTextColor("#00a35a")}
          className="bg-emerald-500"
        />
        <ColorDot
          onClick={() => applyTextColor("#f97316")}
          className="bg-orange-400"
        />
        <ColorDot
          onClick={() => applyTextColor("#ef4444")}
          className="bg-red-500"
        />
        <ColorDot
          onClick={() => applyTextColor("#2563eb")}
          className="bg-blue-500"
        />

        {/* Highlight – more colors */}
        <ToolbarDivider />
        <span className="ml-1 mr-1 text-[11px] text-slate-400">Highlight</span>
        <ColorDot
          onClick={() => applyHighlight("#facc15")}
          className="bg-yellow-300"
        />
        <ColorDot
          onClick={() => applyHighlight("#bbf7d0")}
          className="bg-emerald-200"
        />
        <ColorDot
          onClick={() => applyHighlight("#fed7aa")}
          className="bg-orange-200"
        />
        <ColorDot
          onClick={() => applyHighlight("#fecaca")}
          className="bg-red-200"
        />
        <ColorDot
          onClick={() => applyHighlight("#e0e7ff")}
          className="bg-indigo-200"
        />
        <ColorDot
          onClick={() => applyHighlight("transparent")}
          className="bg-transparent border border-slate-600"
        />

        {/* Links & media */}
        <ToolbarDivider />
        <ToolbarButton onClick={openLinkBar}>Link</ToolbarButton>
        <ToolbarButton onClick={() => exec("unlink")}>Unlink</ToolbarButton>
        <ToolbarButton onClick={openImageUrlBar}>Image URL</ToolbarButton>
        <ToolbarButton onClick={triggerUpload}>Upload</ToolbarButton>

        {uploadingImage && (
          <span className="ml-2 flex items-center gap-1 text-[11px] text-emerald-300">
            <span className="h-3 w-3 rounded-full border border-emerald-400 border-t-transparent animate-spin" />
            Uploading…
          </span>
        )}

        {/* Image size controls */}
        <ToolbarDivider />
        <span className="ml-1 mr-1 text-[11px] text-slate-400">Image</span>
        <ToolbarButton onClick={() => setImageSize("sm")}>S</ToolbarButton>
        <ToolbarButton onClick={() => setImageSize("md")}>M</ToolbarButton>
        <ToolbarButton onClick={() => setImageSize("lg")}>Full</ToolbarButton>

        {/* Other */}
        <ToolbarDivider />
        <ToolbarButton onClick={() => exec("insertHorizontalRule")}>
          HR
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("removeFormat")}>
          Clear styles
        </ToolbarButton>

        {/* Clean + Reset */}
        <ToolbarDivider />
        <ToolbarButton onClick={handleCleanHtml}>Clean HTML</ToolbarButton>
        <ToolbarButton onClick={handleResetClick}>Reset</ToolbarButton>
      </div>

      {/* ✅ Reset confirm */}
      {showResetConfirm && (
        <div className="flex items-center justify-between gap-3 border-b border-amber-500/50 bg-amber-500/10 px-4 py-2 text-xs text-amber-100">
          <span>
            This will{" "}
            <span className="font-semibold">clear the entire article</span>. Are
            you sure?
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmReset}
              className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-semibold text-slate-900 hover:bg-amber-400"
            >
              Reset now
            </button>
            <button
              type="button"
              onClick={cancelReset}
              className="rounded-full border border-amber-500/60 px-3 py-1 text-[11px] text-amber-100 hover:bg-amber-500/10"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 🔗 Link URL bar */}
      {showLinkBar && (
        <InlineBar>
          <span className="text-xs text-slate-300 mr-2">Link</span>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <input
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Optional link text"
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleApplyLink}
            className="ml-2 rounded-md bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-900 hover:bg-emerald-400"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setShowLinkBar(false)}
            className="ml-1 rounded-md border border-slate-700 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
        </InlineBar>
      )}

      {/* 🖼 Image URL bar */}
      {showImageUrlBar && (
        <InlineBar>
          <span className="text-xs text-slate-300 mr-2">Image URL</span>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleInsertImageUrl}
            className="ml-2 rounded-md bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-900 hover:bg-emerald-400"
          >
            Insert
          </button>
          <button
            type="button"
            onClick={() => setShowImageUrlBar(false)}
            className="ml-1 rounded-md border border-slate-700 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
        </InlineBar>
      )}

      {/* EDITOR AREA – no inner scrollbar, page scrolls, toolbar stays sticky */}
      <div
        ref={editorRef}
        className="blog-editor-area min-h-[260px] bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:outline-none break-words"
        style={{
          lineHeight:
            lineHeight === "tight" ? 1.4 : lineHeight === "normal" ? 1.7 : 2.0,
        }}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onClick={handleEditorClick}
        onKeyDown={handleKeyDown}
      />

      {/* Hidden file input for Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Extra styling */}
      <style jsx global>{`
        .blog-editor-toolbar {
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .blog-editor-area img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1.5rem auto;
          border-radius: 16px;
        }

        .blog-editor-area img.blog-img-sm {
          max-width: 40%;
        }

        .blog-editor-area img.blog-img-md {
          max-width: 70%;
        }

        .blog-editor-area img.blog-img-lg {
          max-width: 100%;
        }

        .blog-editor-area img.blog-img-selected {
          box-shadow: 0 0 0 2px #22c55e;
        }

        .blog-editor-area hr {
          border: 0;
          border-top: 1px dashed #475569;
          margin: 1.5rem 0;
        }

        .blog-editor-area h1,
        .blog-editor-area h2,
        .blog-editor-area h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .blog-editor-area h1 {
          font-size: 1.5rem;
        }

        .blog-editor-area h2 {
          font-size: 1.25rem;
        }

        .blog-editor-area h3 {
          font-size: 1.1rem;
        }

        .blog-editor-area p {
          margin: 0.5rem 0;
        }

        .blog-editor-area ul {
          margin: 0.75rem 0 0.75rem 1.5rem;
          padding-left: 1.5rem;
          list-style-type: disc;
        }

        .blog-editor-area ol {
          margin: 0.75rem 0 0.75rem 1.5rem;
          padding-left: 1.5rem;
          list-style-type: decimal;
        }

        .blog-editor-area a {
          color: #22c55e;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

/* ---------- helpers ---------- */

type BtnProps = {
  children: React.ReactNode;
  onClick: () => void;
};

function ToolbarButton({ children, onClick }: BtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md px-2 py-1 hover:bg-slate-800/80 active:bg-slate-700 text-[11px]"
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-4 w-px bg-slate-700" />;
}

type ColorProps = {
  onClick: () => void;
  className?: string;
};

function ColorDot({ onClick, className = "" }: ColorProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-4 w-4 rounded-full border border-slate-700 hover:ring-2 hover:ring-emerald-400/60 ${className}`}
    />
  );
}

type InlineBarProps = {
  children: React.ReactNode;
};

function InlineBar({ children }: InlineBarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs">
      {children}
    </div>
  );
}

/* ---------- firebase helper ---------- */

async function uploadBlogImage(file: File): Promise<string> {
  const filePath = `blog/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}
