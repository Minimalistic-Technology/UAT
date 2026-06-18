"use client";

import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import {
    Bold, Italic, Underline, List, ListOrdered, Quote,
    Image as ImageIcon
} from "lucide-react";

interface MenuBarProps {
    editor: any;
    onAddImage: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, onAddImage }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-1.5 p-3 px-4 bg-theme-element-sec border-b border-theme-accent/10 sticky top-0 z-20 backdrop-blur-md">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${editor.isActive('heading', { level: 1 })
                    ? 'bg-theme-action text-white shadow-sm'
                    : 'text-foreground/75 hover:bg-theme-element hover:text-foreground'
                    }`}
            >
                H1
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${editor.isActive('heading', { level: 2 })
                    ? 'bg-theme-action text-white shadow-sm'
                    : 'text-foreground/75 hover:bg-theme-element hover:text-foreground'
                    }`}
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${editor.isActive('heading', { level: 3 })
                    ? 'bg-theme-action text-white shadow-sm'
                    : 'text-foreground/75 hover:bg-theme-element hover:text-foreground'
                    }`}
            >
                H3
            </button>
            <div className="w-[1px] h-5 bg-theme-accent/15 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${editor.isActive('bold')
                    ? 'bg-theme-action text-white shadow-sm'
                    : 'text-foreground/75 hover:bg-theme-element hover:text-foreground'
                    }`}
                title="Bold"
            >
                <Bold size={16} />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${editor.isActive('italic')
                    ? 'bg-theme-action text-white shadow-sm'
                    : 'text-foreground/75 hover:bg-theme-element hover:text-foreground'
                    }`}
                title="Italic"
            >
                <Italic size={16} />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${editor.isActive('underline')
                    ? 'bg-theme-action text-white shadow-sm'
                    : 'text-foreground/75 hover:bg-theme-element hover:text-foreground'
                    }`}
                title="Underline"
            >
                <Underline size={16} />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`px-2.5 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${editor.isActive('strike')
                    ? 'bg-theme-action text-white shadow-sm'
                    : 'text-foreground/75 hover:bg-theme-element hover:text-foreground'
                    }`}
                title="Strike"
            >
                Strike
            </button>

            <div className="w-[1px] h-5 bg-theme-accent/15 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${editor.isActive('bulletList')
                    ? 'bg-theme-action text-white shadow-sm'
                    : 'text-foreground/75 hover:bg-theme-element hover:text-foreground'
                    }`}
                title="Bullet List"
            >
                <List size={16} />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${editor.isActive('orderedList')
                    ? 'bg-theme-action text-white shadow-sm'
                    : 'text-foreground/75 hover:bg-theme-element hover:text-foreground'
                    }`}
                title="Ordered List"
            >
                <ListOrdered size={16} />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${editor.isActive('blockquote')
                    ? 'bg-theme-action text-white shadow-sm'
                    : 'text-foreground/75 hover:bg-theme-element hover:text-foreground'
                    }`}
                title="Blockquote"
            >
                <Quote size={16} />
            </button>
            <div className="w-[1px] h-5 bg-theme-accent/15 mx-1" />

            <button
                type="button"
                onClick={() => {
                    const previousUrl = editor.getAttributes('link').href;
                    const url = window.prompt('Enter link URL:', previousUrl);
                    if (url === null) return;
                    if (url === '') {
                        editor.chain().focus().extendMarkRange('link').unsetLink().run();
                        return;
                    }
                    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer ${editor.isActive('link')
                    ? 'bg-theme-action text-white shadow-sm'
                    : 'text-foreground/75 hover:bg-theme-element hover:text-foreground'
                    }`}
                title="Insert Link"
            >
                <span className="font-extrabold underline text-xs px-1">Link</span>
            </button>

            <button
                type="button"
                onClick={onAddImage}
                className="p-2 rounded-xl transition-all cursor-pointer text-foreground/75 hover:bg-theme-element hover:text-foreground"
                title="Insert Image"
            >
                <ImageIcon size={16} />
            </button>
        </div>
    );
};

interface TiptapEditorProps {
    value: string;
    onChange: (val: string) => void;
    imageHandler: (editorInstance: any) => void;
    blogDataContent?: string;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
    value,
    onChange,
    imageHandler,
    blogDataContent
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            UnderlineExtension,
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-theme-action underline cursor-pointer',
                },
            }),
            ImageExtension.configure({
                HTMLAttributes: {
                    class: 'rounded-xl border border-theme-accent/10 max-w-full my-6 shadow-md mx-auto block',
                },
            }),
        ],
        content: value || "",
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const contentLoadedRef = useRef(false);
    useEffect(() => {
        if (editor && blogDataContent && !contentLoadedRef.current) {
            editor.commands.setContent(blogDataContent);
            contentLoadedRef.current = true;
        }
    }, [editor, blogDataContent]);

    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);

    if (!editor) {
        return <div className="h-[450px] bg-theme-element rounded-[2rem] animate-pulse border border-theme-accent/10" />;
    }

    return (
        <>
            <MenuBar editor={editor} onAddImage={() => imageHandler(editor)} />
            <div className="p-6 bg-theme-element">
                <EditorContent editor={editor} className="min-h-[400px] text-foreground focus:outline-none" />
            </div>
        </>
    );
};

export default TiptapEditor;
