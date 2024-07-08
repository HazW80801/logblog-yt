'use client'
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useParams } from 'next/navigation'
import { useCallback } from 'react'
import { supabase } from '../config/supabase_client'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import Image from '@tiptap/extension-image'


const extensions = [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure({ types: [ListItem.name] }),
    Image,
    StarterKit.configure({
        bulletList: {
            keepMarks: true,
            keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
        orderedList: {
            keepMarks: true,
            keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
    }),
]
const MenuBar = () => {
    const { editor } = useCurrentEditor()
    if (!editor) {
        return null
    }
    const addImage = () => {
        let url = window.prompt("please enter the image url")
        editor.chain().focus().setImage({ src: url }).run()
    }

    return (
        <div className='border-b border-black pb-4 mb-12 sticky top-0 bg-white z-50'>
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={
                    !editor.can()
                        .chain()
                        .focus()
                        .toggleBold()
                        .run()
                }
                className={editor.isActive('bold') ? 'is-active menu-item__active' : ' menu-item'}
            >
                bold
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={
                    !editor.can()
                        .chain()
                        .focus()
                        .toggleItalic()
                        .run()
                }
                className={editor.isActive('italic') ? 'is-active menu-item__active' : ' menu-item'}
            >
                italic
            </button>
            <button
                onClick={addImage}
                disabled={
                    !editor.can()
                        .chain()
                        .focus()
                        .setImage()
                        .run()
                }
                className={editor.isActive('image') ? 'is-active menu-item__active' : ' menu-item'}
            >
                image
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={
                    !editor.can()
                        .chain()
                        .focus()
                        .toggleStrike()
                        .run()
                }
                className={editor.isActive('strike') ? 'is-active menu-item__active' : ' menu-item'}
            >
                strike
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={
                    !editor.can()
                        .chain()
                        .focus()
                        .toggleCode()
                        .run()
                }
                className={editor.isActive('code') ? 'is-active menu-item__active' : ' menu-item'}
            >
                code
            </button>
            <button onClick={() => editor.chain().focus().unsetAllMarks().run()} className='menu-item'>
                clear marks
            </button>
            <button onClick={() => editor.chain().focus().clearNodes().run()} className='menu-item'>
                clear nodes
            </button>
            <button
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={editor.isActive('paragraph') ? 'is-active menu-item__active' : ' menu-item'}
            >
                paragraph
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'is-active menu-item__active' : ' menu-item'}
            >
                h1
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'is-active menu-item__active' : ' menu-item'}
            >
                h2
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive('heading', { level: 3 }) ? 'is-active menu-item__active' : ' menu-item'}
            >
                h3
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                className={editor.isActive('heading', { level: 4 }) ? 'is-active menu-item__active' : ' menu-item'}
            >
                h4
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                className={editor.isActive('heading', { level: 5 }) ? 'is-active menu-item__active' : ' menu-item'}
            >
                h5
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                className={editor.isActive('heading', { level: 6 }) ? 'is-active menu-item__active' : ' menu-item'}
            >
                h6
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'is-active menu-item__active' : ' menu-item'}
            >
                bullet list
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'is-active menu-item__active' : ' menu-item'}
            >
                ordered list
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={editor.isActive('codeBlock') ? 'is-active menu-item__active' : ' menu-item'}
            >
                code block
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'is-active menu-item__active' : ' menu-item'}
            >
                blockquote
            </button>
            <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className='menu-item'>
                horizontal rule
            </button>
            <button onClick={() => editor.chain().focus().setHardBreak().run()} className='menu-item'>
                hard break
            </button>
            <button
                className='menu-item'
                onClick={() => editor.chain().focus().undo().run()}
                disabled={
                    !editor.can()
                        .chain()
                        .focus()
                        .undo()
                        .run()
                }
            >
                undo
            </button>
            <button
                className='menu-item'
                onClick={() => editor.chain().focus().redo().run()}
                disabled={
                    !editor.can()
                        .chain()
                        .focus()
                        .redo()
                        .run()
                }
            >
                redo
            </button>
            <button
                onClick={() => editor.chain().focus().setColor('#958DF1').run()}
                className={editor.isActive('textStyle', { color: '#958DF1' }) ? 'is-active menu-item__active' : ' menu-item'}
            >
                purple
            </button>
        </div>
    )
}

const Tiptap = ({ content, updateNow }) => {
    const { blogPostId } = useParams()
    const handleUpdate = useCallback(async ({ editor }) => {
        const html = editor.getHTML()
        await supabase.from("blog_posts")
            .update({ "content": html }).eq("post_id", blogPostId).select()
    }, [])

    return (
        <EditorProvider slotBefore={<MenuBar />} onUpdate={handleUpdate}
            extensions={extensions}
            content={content}></EditorProvider>
    )
}

export default Tiptap
