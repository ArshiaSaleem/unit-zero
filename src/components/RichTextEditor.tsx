"use client";

import React, { useState, useRef, useEffect } from "react";

interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start typing...",
  height = "400px",
}: RichTextEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize both editors with the same content
  useEffect(() => {
    if (editorRef.current && htmlTextareaRef.current) {
      const initialContent = value || "";
      editorRef.current.innerHTML = initialContent;
      htmlTextareaRef.current.value = initialContent;
    }
  }, []); // Run once on mount

  // Sync content when switching modes
  useEffect(() => {
    if (isHtmlMode && htmlTextareaRef.current) {
      // Switching to HTML mode - get content from visual editor
      if (editorRef.current) {
        htmlTextareaRef.current.value = editorRef.current.innerHTML;
      }
    } else if (!isHtmlMode && editorRef.current) {
      // Switching to visual mode - get content from HTML textarea
      if (htmlTextareaRef.current) {
        editorRef.current.innerHTML = htmlTextareaRef.current.value;
      }
    }
  }, [isHtmlMode]);

  // Handle external value changes (but not during editing)
  useEffect(() => {
    if (!isHtmlMode && editorRef.current && value !== editorRef.current.innerHTML) {
      // Only update if editor is not focused (user is not actively editing)
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || "";
      }
    } else if (isHtmlMode && htmlTextareaRef.current && value !== htmlTextareaRef.current.value) {
      // Only update if textarea is not focused (user is not actively editing)
      if (document.activeElement !== htmlTextareaRef.current) {
        htmlTextareaRef.current.value = value || "";
      }
    }
  }, [value, isHtmlMode]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (!isHtmlMode && editorRef.current) {
      const content = editorRef.current.innerHTML;
      if (content !== value) {
        onChange(content);
        // Also update HTML textarea to keep it in sync
        if (htmlTextareaRef.current) {
          htmlTextareaRef.current.value = content;
        }
      }
    } else if (isHtmlMode && htmlTextareaRef.current) {
      const content = htmlTextareaRef.current.value;
      if (content !== value) {
        onChange(content);
        // Also update visual editor to keep it in sync
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
        }
      }
    }
  };

  const handleHtmlChange = () => {
    if (htmlTextareaRef.current) {
      const content = htmlTextareaRef.current.value;
      onChange(content);
      // Also update visual editor to keep it in sync
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
    }
  };

  const insertTable = () => {
    const table = `
      <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;" data-table-id="${Date.now()}">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid #ccc; background-color: #f5f5f5;">Header 1</th>
            <th style="padding: 8px; border: 1px solid #ccc; background-color: #f5f5f5;">Header 2</th>
            <th style="padding: 8px; border: 1px solid #ccc; background-color: #f5f5f5;">Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;">Cell 1</td>
            <td style="padding: 8px; border: 1px solid #ccc;">Cell 2</td>
            <td style="padding: 8px; border: 1px solid #ccc;">Cell 3</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc;">Cell 4</td>
            <td style="padding: 8px; border: 1px solid #ccc;">Cell 5</td>
            <td style="padding: 8px; border: 1px solid #ccc;">Cell 6</td>
          </tr>
        </tbody>
      </table>
    `;
    execCommand('insertHTML', table);
  };

  const addTableRow = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let table = range.commonAncestorContainer as Node;
      
      // Find the table element
      while (table && table.nodeType !== Node.ELEMENT_NODE) {
        table = table.parentNode as Node;
      }
      while (table && (table as Element).tagName !== 'TABLE') {
        table = table.parentNode as Node;
      }
      
      if (table && (table as Element).tagName === 'TABLE') {
        const tableElement = table as HTMLTableElement;
        const tbody = tableElement.querySelector('tbody') || tableElement;
        const rowCount = tbody.querySelectorAll('tr').length;
        const firstRow = tbody.querySelector('tr');
        const colCount = firstRow?.querySelectorAll('td, th').length || 2;
        
        const newRow = document.createElement('tr');
        for (let i = 0; i < colCount; i++) {
          const cell = document.createElement('td');
          cell.style.padding = '8px';
          cell.style.border = '1px solid #ccc';
          cell.innerHTML = `Cell ${rowCount + 1}-${i + 1}`;
          newRow.appendChild(cell);
        }
        
        tbody.appendChild(newRow);
        handleContentChange();
      }
    }
  };

  const removeTableRow = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let cell = range.commonAncestorContainer as Node;
      
      // Find the table cell
      while (cell && cell.nodeType !== Node.ELEMENT_NODE) {
        cell = cell.parentNode as Node;
      }
      while (cell && !['TD', 'TH'].includes((cell as Element).tagName)) {
        cell = cell.parentNode as Node;
      }
      
      if (cell && ['TD', 'TH'].includes((cell as Element).tagName)) {
        const row = cell.parentNode as HTMLTableRowElement;
        const tbody = row.parentNode as HTMLTableSectionElement;
        if (tbody && tbody.querySelectorAll('tr').length > 1) {
          tbody.removeChild(row);
          handleContentChange();
        }
      }
    }
  };

  const addTableColumn = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let table = range.commonAncestorContainer as Node;
      
      // Find the table element
      while (table && table.nodeType !== Node.ELEMENT_NODE) {
        table = table.parentNode as Node;
      }
      while (table && (table as Element).tagName !== 'TABLE') {
        table = table.parentNode as Node;
      }
      
      if (table && (table as Element).tagName === 'TABLE') {
        const tableElement = table as HTMLTableElement;
        const rows = tableElement.querySelectorAll('tr');
        rows.forEach((row: HTMLTableRowElement, index: number) => {
          const cell = document.createElement(index === 0 ? 'th' : 'td');
          cell.style.padding = '8px';
          cell.style.border = '1px solid #ccc';
          if (index === 0) {
            cell.style.backgroundColor = '#f5f5f5';
          }
          cell.innerHTML = index === 0 ? `Header ${rows[0].children.length + 1}` : `Cell ${index}-${rows[0].children.length + 1}`;
          row.appendChild(cell);
        });
        handleContentChange();
      }
    }
  };

  const removeTableColumn = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let cell = range.commonAncestorContainer as Node;
      
      // Find the table cell
      while (cell && cell.nodeType !== Node.ELEMENT_NODE) {
        cell = cell.parentNode as Node;
      }
      while (cell && !['TD', 'TH'].includes((cell as Element).tagName)) {
        cell = cell.parentNode as Node;
      }
      
      if (cell && ['TD', 'TH'].includes((cell as Element).tagName)) {
        const row = cell.parentNode as HTMLTableRowElement;
        const table = row.closest('table') as HTMLTableElement;
        if (table) {
          const rows = table.querySelectorAll('tr');
          const cellIndex = Array.from(row.children).indexOf(cell as Element);
          
          if (rows[0].children.length > 1) {
            rows.forEach((row: HTMLTableRowElement) => {
              if (row.children[cellIndex]) {
                row.removeChild(row.children[cellIndex]);
              }
            });
            handleContentChange();
          }
        }
      }
    }
  };

  const insertBulletList = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();
      
      if (selectedText) {
        // Convert selected text to bullet point
        execCommand('insertHTML', `<ul><li>${selectedText}</li></ul>`);
      } else {
        // No text selected, create new bullet point
        execCommand('insertHTML', '<ul><li>• New bullet point</li></ul>');
      }
    } else {
      // No selection, create new list
      execCommand('insertHTML', '<ul><li>• New bullet point</li></ul>');
    }
  };

  const insertNumberedList = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();
      
      if (selectedText) {
        // Convert selected text to numbered item
        execCommand('insertHTML', `<ol><li>${selectedText}</li></ol>`);
      } else {
        // No text selected, create new numbered item
        execCommand('insertHTML', '<ol><li>1. New numbered item</li></ol>');
      }
    } else {
      // No selection, create new list
      execCommand('insertHTML', '<ol><li>1. New numbered item</li></ol>');
    }
  };

  const insertImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      execCommand('insertHTML', `<img src="${url}" alt="Image" style="max-width: 100%; height: auto; margin: 10px 0;" />`);
    }
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      const text = window.prompt("Enter link text:", url);
      if (text) {
        execCommand('insertHTML', `<a href="${url}" style="color: #0066cc; text-decoration: underline;">${text}</a>`);
      }
    }
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
    <div className="border border-gray-300 rounded-lg overflow-hidden relative" style={{ height: height, minHeight: '400px' }}>
      {/* Sticky Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-3 flex flex-wrap gap-2 sticky top-0 z-50 shadow-sm" style={{ position: 'sticky', top: 0 }}>
        {/* Text Formatting */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => execCommand('bold')} 
            title="Bold (Ctrl+B)"
            disabled={isHtmlMode}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => execCommand('italic')} 
            title="Italic (Ctrl+I)"
            disabled={isHtmlMode}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => execCommand('underline')} 
            title="Underline (Ctrl+U)"
            disabled={isHtmlMode}
          >
            <u>U</u>
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => execCommand('strikeThrough')} 
            title="Strikethrough"
            disabled={isHtmlMode}
          >
            <s>S</s>
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => execCommand('formatBlock', 'h1')} 
            title="Heading 1"
            disabled={isHtmlMode}
          >
            H1
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => execCommand('formatBlock', 'h2')} 
            title="Heading 2"
            disabled={isHtmlMode}
          >
            H2
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => execCommand('formatBlock', 'h3')} 
            title="Heading 3"
            disabled={isHtmlMode}
          >
            H3
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => execCommand('formatBlock', 'p')} 
            title="Paragraph"
            disabled={isHtmlMode}
          >
            P
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={insertBulletList} 
            title="Bullet List"
            disabled={isHtmlMode}
          >
            • List
          </ToolbarButton>
          <ToolbarButton 
            onClick={insertNumberedList} 
            title="Numbered List"
            disabled={isHtmlMode}
          >
            1. List
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => execCommand('justifyLeft')} 
            title="Align Left"
            disabled={isHtmlMode}
          >
            ⬅️
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => execCommand('justifyCenter')} 
            title="Align Center"
            disabled={isHtmlMode}
          >
            ↔️
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => execCommand('justifyRight')} 
            title="Align Right"
            disabled={isHtmlMode}
          >
            ➡️
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => execCommand('justifyFull')} 
            title="Justify"
            disabled={isHtmlMode}
          >
            ⬌
          </ToolbarButton>
        </div>

        {/* Media & Links */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={insertLink} 
            title="Insert Link (Ctrl+K)"
            disabled={isHtmlMode}
          >
            🔗 Link
          </ToolbarButton>
          <ToolbarButton 
            onClick={insertImage} 
            title="Insert Image"
            disabled={isHtmlMode}
          >
            🖼️ Image
          </ToolbarButton>
        </div>

        {/* Table Management */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={insertTable} 
            title="Insert Table"
            disabled={isHtmlMode}
          >
            📊 Table
          </ToolbarButton>
          <ToolbarButton 
            onClick={addTableRow} 
            title="Add Row"
            disabled={isHtmlMode}
          >
            ➕ Row
          </ToolbarButton>
          <ToolbarButton 
            onClick={removeTableRow} 
            title="Remove Row"
            disabled={isHtmlMode}
          >
            ➖ Row
          </ToolbarButton>
          <ToolbarButton 
            onClick={addTableColumn} 
            title="Add Column"
            disabled={isHtmlMode}
          >
            ➕ Col
          </ToolbarButton>
          <ToolbarButton 
            onClick={removeTableColumn} 
            title="Remove Column"
            disabled={isHtmlMode}
          >
            ➖ Col
          </ToolbarButton>
        </div>

        {/* Other */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => execCommand('formatBlock', 'blockquote')} 
            title="Blockquote"
            disabled={isHtmlMode}
          >
            &ldquo;
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => execCommand('formatBlock', 'pre')} 
            title="Code Block"
            disabled={isHtmlMode}
          >
            {'</>'}
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => execCommand('insertHorizontalRule')} 
            title="Horizontal Rule"
            disabled={isHtmlMode}
          >
            ─
          </ToolbarButton>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-1 ml-auto">
          <ToolbarButton 
            onClick={() => setIsHtmlMode(!isHtmlMode)} 
            title={isHtmlMode ? "Visual Mode" : "Show HTML"}
            isActive={isHtmlMode}
          >
            {isHtmlMode ? "👁️ Visual" : "</> Show HTML"}
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <div className="relative" style={{ height: `calc(${height} - 100px)`, overflow: 'auto' }}>
        {isHtmlMode ? (
          <div className="h-full" key="html-editor">
            <div className="bg-gray-100 px-3 py-2 text-sm text-gray-600 border-b">
              HTML Code Editor
            </div>
            <textarea
              ref={htmlTextareaRef}
              onChange={handleHtmlChange}
              onBlur={handleHtmlChange}
              className="w-full h-full p-4 outline-none resize-none border-0 focus:ring-0 font-mono text-sm"
              style={{ 
                height: 'calc(100% - 40px)',
                lineHeight: '1.6',
                minHeight: '400px'
              }}
              placeholder={placeholder}
              value={value}
            />
          </div>
        ) : (
          <div className="relative" key="visual-editor">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              onBlur={handleContentChange}
              className="w-full h-full p-6 outline-none resize-none border-0 focus:ring-0 overflow-y-auto rich-text-preview"
                     style={{
                       lineHeight: '1.6',
                       fontSize: '16px',
                       minHeight: '400px',
                       paddingTop: '24px',
                       paddingBottom: '60px',
                       fontFamily: 'system-ui, -apple-system, sans-serif'
                     }}
              suppressContentEditableWarning={true}
            />
            {!value && (
              <div 
                className="absolute top-6 left-6 text-gray-400 italic pointer-events-none"
                style={{ fontSize: '16px', lineHeight: '1.6' }}
              >
                {placeholder}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}