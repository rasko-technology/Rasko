"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface Props {
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ defaultValue, onChange, placeholder }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: "snow",
      placeholder: placeholder || "Start typing...",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "link"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"],
        ],
      },
    });

    if (defaultValue) {
      quill.root.innerHTML = defaultValue;
    }

    quill.on("text-change", () => {
      onChange?.(quill.root.innerHTML);
    });

    quillRef.current = quill;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rich-text-editor">
      <div ref={containerRef} />
      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          border-radius: 8px 8px 0 0;
          border-color: var(--color-surface-200);
          background: var(--color-surface-50);
        }
        .rich-text-editor .ql-container {
          border-radius: 0 0 8px 8px;
          border-color: var(--color-surface-200);
          font-size: 14px;
          min-height: 300px;
        }
        .rich-text-editor .ql-editor {
          min-height: 300px;
        }
        .dark .rich-text-editor .ql-toolbar {
          border-color: var(--color-surface-700);
          background: var(--color-surface-800);
        }
        .dark .rich-text-editor .ql-container {
          border-color: var(--color-surface-700);
          background: var(--color-surface-800);
          color: white;
        }
        .dark .rich-text-editor .ql-editor.ql-blank::before {
          color: var(--color-surface-400);
        }
        .dark .rich-text-editor .ql-stroke {
          stroke: var(--color-surface-400) !important;
        }
        .dark .rich-text-editor .ql-fill {
          fill: var(--color-surface-400) !important;
        }
        .dark .rich-text-editor .ql-picker-label {
          color: var(--color-surface-400) !important;
        }
      `}</style>
    </div>
  );
}
