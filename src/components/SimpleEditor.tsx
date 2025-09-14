"use client";

import React, { useState, useRef } from "react";

interface SimpleEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export default function SimpleEditor({
  value = "",
  onChange,
  placeholder = "Start typing...",
  height = "400px",
}: SimpleEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + text + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const wrapText = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newText = before + selectedText + after;
      const newValue = value.substring(0, start) + newText + value.substring(end);
      onChange(newValue);
      
      // Set cursor position
      setTimeout(() => {
        textarea.focus();
        if (selectedText) {
          textarea.setSelectionRange(start + before.length, end + before.length);
        } else {
          textarea.setSelectionRange(start + before.length, start + before.length);
        }
      }, 0);
    }
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
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
          onClick();
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

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Sticky Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-3 flex flex-wrap gap-2 sticky top-0 z-10">
        {/* Text Formatting */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => wrapText('<strong>', '</strong>')} 
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => wrapText('<em>', '</em>')} 
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => wrapText('<u>', '</u>')} 
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => wrapText('<s>', '</s>')} 
            title="Strikethrough"
          >
            <s>S</s>
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => wrapText('<h1>', '</h1>')} 
            title="Heading 1"
          >
            H1
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => wrapText('<h2>', '</h2>')} 
            title="Heading 2"
          >
            H2
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => wrapText('<h3>', '</h3>')} 
            title="Heading 3"
          >
            H3
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => wrapText('<p>', '</p>')} 
            title="Paragraph"
          >
            P
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => insertText('<ul><li>• List item</li></ul>')} 
            title="Bullet List"
          >
            • List
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => insertText('<ol><li>1. List item</li></ol>')} 
            title="Numbered List"
          >
            1. List
          </ToolbarButton>
        </div>

        {/* Media & Links */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => {
              const url = window.prompt("Enter URL:");
              if (url) {
                const text = window.prompt("Enter link text:", url);
                if (text) {
                  insertText(`<a href="${url}">${text}</a>`);
                }
              }
            }} 
            title="Insert Link (Ctrl+K)"
          >
            🔗 Link
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => {
              const url = window.prompt("Enter image URL:");
              if (url) {
                insertText(`<img src="${url}" alt="Image" style="max-width: 100%; height: auto;" />`);
              }
            }} 
            title="Insert Image"
          >
            🖼️ Image
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => insertText('<table border="1" style="border-collapse: collapse;"><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></table>')} 
            title="Insert Table"
          >
            📊 Table
          </ToolbarButton>
        </div>

        {/* Other */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => wrapText('<blockquote>', '</blockquote>')} 
            title="Blockquote"
          >
            &ldquo;
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => wrapText('<code>', '</code>')} 
            title="Code"
          >
            {'</>'}
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => insertText('<hr />')} 
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
