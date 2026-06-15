"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { cn } from "@/lib/utils";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Extension } from "@tiptap/react";
import { TextStyle } from "@tiptap/extension-text-style";

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
                        parseHTML: (element) => element.style.fontSize.replace(/['"]+/g, ""),
                        renderHTML: (attributes) => {
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
            setFontSize: (fontSize: string) => ({ chain }: any) => {
                return chain().setMark("textStyle", { fontSize }).run();
            },
            unsetFontSize: () => ({ chain }: any) => {
                return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
            },
        };
    },
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null;
    }

    // Helper to maintain toggle state
    const isActive = (type: string, options?: any) => {
        return editor.isActive(type, options) ? "on" : "off";
    };

    return (
        <div className="border-b border-border p-1 bg-slate-50/50 dark:bg-slate-900/50">
            <ToggleGroup type="multiple" className="justify-start gap-1">
                <ToggleGroupItem
                    value="bold"
                    aria-label="Toggle bold"
                    className="h-8 w-8 px-0"
                    data-state={isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="italic"
                    aria-label="Toggle italic"
                    className="h-8 w-8 px-0"
                    data-state={isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="underline"
                    aria-label="Toggle underline"
                    className="h-8 w-8 px-0"
                    data-state={isActive("underline")}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="strike"
                    aria-label="Toggle strikethrough"
                    className="h-8 w-8 px-0"
                    data-state={isActive("strike")}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough className="h-4 w-4" />
                </ToggleGroupItem>

                <div className="w-[1px] h-4 bg-border mx-1 my-auto" />

                <div className="flex items-center px-1">
                    <Select
                        value={editor.getAttributes("textStyle").fontSize || "16px"}
                        onValueChange={(val) => {
                            if (val === "16px") (editor.chain().focus() as any).unsetFontSize().run();
                            else (editor.chain().focus() as any).setFontSize(val).run();
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px] text-xs px-2 shadow-none border-border">
                            <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[70px]">
                            <SelectItem value="12px" className="text-xs">12</SelectItem>
                            <SelectItem value="14px" className="text-xs">14</SelectItem>
                            <SelectItem value="16px" className="text-xs">16</SelectItem>
                            <SelectItem value="18px" className="text-xs">18</SelectItem>
                            <SelectItem value="20px" className="text-xs">20</SelectItem>
                            <SelectItem value="24px" className="text-xs">24</SelectItem>
                            <SelectItem value="30px" className="text-xs">30</SelectItem>
                            <SelectItem value="36px" className="text-xs">36</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-[1px] h-4 bg-border mx-1 my-auto" />

                <ToggleGroupItem
                    value="bullet-list"
                    aria-label="Toggle bullet list"
                    className="h-8 w-8 px-0"
                    data-state={isActive("bulletList")}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className="h-4 w-4" />
                </ToggleGroupItem>

                <ToggleGroupItem
                    value="ordered-list"
                    aria-label="Toggle ordered list"
                    className="h-8 w-8 px-0"
                    data-state={isActive("orderedList")}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );
};

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const [mounted, setMounted] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit, Underline, TextStyle, FontSize],
        content: value || "",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm dark:prose-invert max-w-none min-h-[150px] w-full focus:outline-none p-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold [&>ul]:list-disc [&>ol]:list-decimal [&>ul]:pl-5 [&>ol]:pl-5",
            },
        },
        onUpdate: ({ editor }) => {
            // Avoid firing onChange if it's identical or just blank paragraphs, but for safety returning exact HTML
            const html = editor.getHTML();
            onChange(html === "<p></p>" ? "" : html);
        },
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync value from outside if it changes (e.g. from react-hook-form reset)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    if (!mounted) {
        return (
            <div className={cn("overflow-hidden rounded-xl border border-input", className)}>
                <div className="h-[43px] border-b border-border bg-slate-50/50 dark:bg-slate-900/50" />
                <div className="min-h-[150px] p-4 animate-pulse bg-slate-50/20 dark:bg-slate-800/20" />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl border border-input bg-background focus-within:ring-1 focus-within:ring-blue-500",
                className
            )}
        >
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
