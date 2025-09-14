"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Heading from "@tiptap/extension-heading";

interface TextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export default function TextEditor({
  value = "",
  onChange,
  placeholder = "Start typing...",
  height = "400px",
}: TextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [isVisualMode, setIsVisualMode] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Strike,
      CodeBlock,
      Blockquote,
      HorizontalRule,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const addTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const renderPreview = (html: string) => {
    return (
      <div 
        className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-em:text-gray-700 prose-a:text-blue-600 prose-table:text-gray-700"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          lineHeight: '1.6',
          fontSize: '16px'
        }}
      />
    );
  };

  const ToolbarButton = ({ 
    onClick, 
    children, 
    title,
    isActive = false,
    disabled = false
  }: { 
    onClick: () => void; 
    children: React.ReactNode; 
    title: string;
    isActive?: boolean;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
          setTimeout(() => {
            onClick();
          }, 10);
        }
      }}
      title={title}
      disabled={disabled}
      className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
        isActive
          ? "bg-blue-500 text-white border-blue-500"
          : disabled
          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      }`}
    >
      {children}
    </button>
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Sticky Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-3 flex flex-wrap gap-2 sticky top-0 z-10">
        {/* Mode Toggle */}
        <div className="flex gap-1 mr-4">
          <ToolbarButton 
            onClick={() => setIsVisualMode(true)} 
            title="Visual Mode"
            isActive={isVisualMode}
          >
            👁️ Visual
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => setIsVisualMode(false)} 
            title="HTML Mode"
            isActive={!isVisualMode}
          >
            &lt;/&gt; HTML
          </ToolbarButton>
        </div>

        {/* Text Formatting */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            title="Bold (Ctrl+B)"
            isActive={editor.isActive("bold")}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            title="Italic (Ctrl+I)"
            isActive={editor.isActive("italic")}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            title="Underline (Ctrl+U)"
            isActive={editor.isActive("underline")}
          >
            <u>U</u>
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleStrike().run()} 
            title="Strikethrough"
            isActive={editor.isActive("strike")}
          >
            <s>S</s>
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
            title="Heading 1"
            isActive={editor.isActive("heading", { level: 1 })}
          >
            H1
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            title="Heading 2"
            isActive={editor.isActive("heading", { level: 2 })}
          >
            H2
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
            title="Heading 3"
            isActive={editor.isActive("heading", { level: 3 })}
          >
            H3
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().setParagraph().run()} 
            title="Paragraph"
            isActive={editor.isActive("paragraph")}
          >
            P
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            title="Bullet List"
            isActive={editor.isActive("bulletList")}
          >
            • List
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            title="Numbered List"
            isActive={editor.isActive("orderedList")}
          >
            1. List
          </ToolbarButton>
        </div>

        {/* Media & Links */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={addLink} 
            title="Insert Link (Ctrl+K)"
          >
            🔗 Link
          </ToolbarButton>
          <ToolbarButton 
            onClick={addImage} 
            title="Insert Image"
          >
            🖼️ Image
          </ToolbarButton>
          <ToolbarButton 
            onClick={addTable} 
            title="Insert Table"
          >
            📊 Table
          </ToolbarButton>
        </div>

        {/* Other */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()} 
            title="Blockquote"
            isActive={editor.isActive("blockquote")}
          >
            &ldquo;
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().setCodeBlock().run()} 
            title="Code Block"
            isActive={editor.isActive("codeBlock")}
          >
            {'</>'}
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().setHorizontalRule().run()} 
            title="Horizontal Rule"
          >
            ─
          </ToolbarButton>
        </div>

        {/* Preview Toggle */}
        <div className="flex gap-1 ml-auto">
          <ToolbarButton 
            onClick={() => setIsPreview(!isPreview)} 
            title={isPreview ? "Edit Mode" : "Preview Mode"}
          >
            {isPreview ? "✏️ Edit" : "👁️ Preview"}
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        {isPreview ? (
          <div 
            className="p-4"
            style={{ minHeight: height }}
          >
            {value ? renderPreview(value) : (
              <div className="text-gray-400 italic">
                {placeholder}
              </div>
            )}
          </div>
        ) : isVisualMode ? (
          <EditorContent
            editor={editor}
            className="w-full p-4 outline-none resize-none border-0 focus:ring-0"
            style={{ 
              minHeight: height,
              lineHeight: '1.6',
              fontSize: '16px'
            }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 outline-none resize-none border-0 focus:ring-0"
            style={{ 
              fontFamily: 'monospace',
              minHeight: height,
              lineHeight: '1.6',
              fontSize: '14px'
            }}
          />
        )}
      </div>
    </div>
  );
}
