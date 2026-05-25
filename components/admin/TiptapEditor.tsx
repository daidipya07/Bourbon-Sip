'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useRef } from 'react'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your article here…' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        style: 'min-height:400px; outline:none; padding:24px; font-size:17px; line-height:1.85; color:#e8dcc8;',
      },
    },
  })

  const uploadImage = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url && editor) {
      editor.chain().focus().setImage({ src: data.url }).run()
    }
  }, [editor])

  if (!editor) return null

  const btn = (active: boolean, onClick: () => void, label: string) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 10px',
        background: active ? '#c8963e' : 'transparent',
        color: active ? '#0a0a0a' : '#aaa',
        border: '1px solid #2a2a2a',
        borderRadius: '4px',
        fontSize: '13px',
        cursor: 'pointer',
        fontWeight: active ? 700 : 400,
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ border: '1px solid #2a2a2a', borderRadius: '8px', background: '#111', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '12px 16px', borderBottom: '1px solid #1e1e1e', background: '#0f0f0f' }}>
        {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'B')}
        {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'I')}
        {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2')}
        {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3')}
        {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), '• List')}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), '1. List')}
        {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), 'Quote')}
        {btn(editor.isActive('code'), () => editor.chain().focus().toggleCode().run(), 'Code')}
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('Enter URL:')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          style={{ padding: '5px 10px', background: 'transparent', color: '#aaa', border: '1px solid #2a2a2a', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{ padding: '5px 10px', background: 'transparent', color: '#aaa', border: '1px solid #2a2a2a', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
        >
          Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) uploadImage(file)
            e.target.value = ''
          }}
        />
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          style={{ padding: '5px 10px', background: 'transparent', color: '#555', border: '1px solid #1e1e1e', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
        >
          ↩
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          style={{ padding: '5px 10px', background: 'transparent', color: '#555', border: '1px solid #1e1e1e', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
        >
          ↪
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      <style>{`
        .tiptap h2 { font-size: 26px; font-weight: 700; margin: 28px 0 12px; color: #fff; }
        .tiptap h3 { font-size: 20px; font-weight: 600; margin: 24px 0 10px; color: #ddd; }
        .tiptap p { margin: 0 0 16px; }
        .tiptap blockquote { border-left: 3px solid #c8963e; margin: 20px 0; padding: 4px 20px; color: #aaa; font-style: italic; }
        .tiptap ul, .tiptap ol { padding-left: 24px; margin: 0 0 16px; }
        .tiptap li { margin-bottom: 6px; }
        .tiptap code { background: #1a1a1a; padding: 2px 6px; border-radius: 3px; font-size: 14px; color: #c8963e; }
        .tiptap a { color: #c8963e; text-decoration: underline; }
        .tiptap img { max-width: 100%; border-radius: 6px; margin: 16px 0; display: block; }
        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #444; pointer-events: none; float: left; height: 0; }
      `}</style>
    </div>
  )
}
