"use client";

import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
} from "lucide-react";

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: any) =>
              element.style.fontSize.replace(/['"]+/g, ""),
            renderHTML: (attributes: any) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: { chain: any }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: { chain: any }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    } as any;
  },
});

interface MenuBarProps {
  editor: any;
  onAddImage: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, onAddImage }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="bg-theme-element-sec border-theme-accent/10 sticky top-0 z-20 flex flex-wrap items-center gap-1.5 border-b p-3 px-4 backdrop-blur-md">
      <div className="flex items-center">
        <input
          type="number"
          list="fontSizes"
          className="bg-theme-element text-foreground/90 border-theme-accent/20 hover:border-theme-accent/40 focus:ring-theme-action w-[70px] rounded-xl border px-2 py-1.5 text-center text-xs font-bold transition-all outline-none focus:ring-1"
          placeholder="16"
          onChange={(e) => {
            const val = e.target.value;
            if (val && !isNaN(Number(val))) {
              editor.chain().focus().setFontSize(`${val}px`).run();
            }
          }}
          defaultValue={16}
        />
        <span className="text-foreground/50 mr-2 ml-1 text-[10px] font-bold uppercase">
          pt
        </span>
        <datalist id="fontSizes">
          <option value="10"></option>
          <option value="12"></option>
          <option value="14"></option>
          <option value="16"></option>
          <option value="18"></option>
          <option value="20"></option>
          <option value="24"></option>
          <option value="32"></option>
        </datalist>
      </div>
      <div className="bg-theme-accent/15 mx-1 h-5 w-[1px]" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`cursor-pointer rounded-xl p-2 transition-all ${
          editor.isActive("bold")
            ? "bg-theme-action text-white shadow-sm"
            : "text-foreground/75 hover:bg-theme-element hover:text-foreground"
        }`}
        title="Bold"
      >
        <Bold size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`cursor-pointer rounded-xl p-2 transition-all ${
          editor.isActive("italic")
            ? "bg-theme-action text-white shadow-sm"
            : "text-foreground/75 hover:bg-theme-element hover:text-foreground"
        }`}
        title="Italic"
      >
        <Italic size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`cursor-pointer rounded-xl p-2 transition-all ${
          editor.isActive("underline")
            ? "bg-theme-action text-white shadow-sm"
            : "text-foreground/75 hover:bg-theme-element hover:text-foreground"
        }`}
        title="Underline"
      >
        <Underline size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`cursor-pointer rounded-xl px-2.5 py-1 text-xs font-black transition-all ${
          editor.isActive("strike")
            ? "bg-theme-action text-white shadow-sm"
            : "text-foreground/75 hover:bg-theme-element hover:text-foreground"
        }`}
        title="Strike"
      >
        Strike
      </button>

      <div className="bg-theme-accent/15 mx-1 h-5 w-[1px]" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`cursor-pointer rounded-xl p-2 transition-all ${
          editor.isActive("bulletList")
            ? "bg-theme-action text-white shadow-sm"
            : "text-foreground/75 hover:bg-theme-element hover:text-foreground"
        }`}
        title="Bullet List"
      >
        <List size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`cursor-pointer rounded-xl p-2 transition-all ${
          editor.isActive("orderedList")
            ? "bg-theme-action text-white shadow-sm"
            : "text-foreground/75 hover:bg-theme-element hover:text-foreground"
        }`}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`cursor-pointer rounded-xl p-2 transition-all ${
          editor.isActive("blockquote")
            ? "bg-theme-action text-white shadow-sm"
            : "text-foreground/75 hover:bg-theme-element hover:text-foreground"
        }`}
        title="Blockquote"
      >
        <Quote size={16} />
      </button>
      <div className="bg-theme-accent/15 mx-1 h-5 w-[1px]" />

      <button
        type="button"
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("Enter link URL:", previousUrl);
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }}
        className={`cursor-pointer rounded-xl p-2 transition-all ${
          editor.isActive("link")
            ? "bg-theme-action text-white shadow-sm"
            : "text-foreground/75 hover:bg-theme-element hover:text-foreground"
        }`}
        title="Insert Link"
      >
        <span className="px-1 text-xs font-extrabold underline">Link</span>
      </button>

      <button
        type="button"
        onClick={onAddImage}
        className="text-foreground/75 hover:bg-theme-element hover:text-foreground cursor-pointer rounded-xl p-2 transition-all"
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
  blogDataContent,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-theme-action underline cursor-pointer",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class:
            "rounded-xl border border-theme-accent/10 max-w-full my-6 shadow-md mx-auto block",
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
    return (
      <div className="bg-theme-element border-theme-accent/10 h-[450px] animate-pulse rounded-[2rem] border" />
    );
  }

  return (
    <>
      <MenuBar editor={editor} onAddImage={() => imageHandler(editor)} />
      <div className="bg-theme-element p-6">
        <EditorContent
          editor={editor}
          className="text-foreground min-h-[400px] focus:outline-none"
        />
      </div>
    </>
  );
};

export default TiptapEditor;
