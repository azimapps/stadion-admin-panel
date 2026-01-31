"use client"

import * as React from "react"
import {
    Bold,
    Italic,
    Link as LinkIcon,
    Image as ImageIcon,
    List,
    ListOrdered,
    Code,
    Quote,
    Table,
    Type,
    Eye,
    Edit3,
    X,
} from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    label?: string
    placeholder?: string
}

export function MarkdownEditor({ value, onChange, label, placeholder }: MarkdownEditorProps) {
    const [isFullEditorOpen, setIsFullEditorOpen] = React.useState(false)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    const insertText = (before: string, after: string = "") => {
        if (!textareaRef.current) return

        const start = textareaRef.current.selectionStart
        const end = textareaRef.current.selectionEnd
        const text = textareaRef.current.value
        const selectedText = text.substring(start, end)

        const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)
        onChange(newText)

        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus()
                const newCursorPos = start + before.length + selectedText.length + after.length
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
            }
        }, 0)
    }

    const commands = [
        { icon: <Type className="size-4" />, action: () => insertText("# "), title: "Heading" },
        { icon: <Bold className="size-4" />, action: () => insertText("**", "**"), title: "Bold" },
        { icon: <Italic className="size-4" />, action: () => insertText("_", "_"), title: "Italic" },
        { icon: <LinkIcon className="size-4" />, action: () => insertText("[", "](url)"), title: "Link" },
        { icon: <ImageIcon className="size-4" />, action: () => insertText("![alt](", ")"), title: "Image" },
        { icon: <List className="size-4" />, action: () => insertText("- "), title: "List" },
        { icon: <ListOrdered className="size-4" />, action: () => insertText("1. "), title: "Ordered List" },
        { icon: <Code className="size-4" />, action: () => insertText("`", "`"), title: "Code" },
        { icon: <Quote className="size-4" />, action: () => insertText("> "), title: "Quote" },
        { icon: <Table className="size-4" />, action: () => insertText("\n| Col 1 | Col 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n"), title: "Table" },
    ]

    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-medium leading-none">{label}</label>}

            <div
                className="relative min-h-[160px] rounded-xl border border-input bg-background p-4 cursor-pointer hover:border-primary/50 transition-all shadow-sm group"
                onClick={() => setIsFullEditorOpen(true)}
            >
                {value ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-6 opacity-80 pointer-events-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground italic">
                        <p>{placeholder || "Tahrirlash uchun bosing..."}</p>
                    </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="h-7 bg-background shadow-sm">
                        <Edit3 className="size-3 mr-2" />
                        Tahrirlash
                    </Button>
                </div>
            </div>

            <Dialog open={isFullEditorOpen} onOpenChange={setIsFullEditorOpen}>
                <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 flex flex-col overflow-hidden bg-background">
                    <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
                        <DialogTitle className="flex items-center gap-2">
                            <Edit3 className="size-5 text-primary" />
                            Maqola tahrirlash
                        </DialogTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsFullEditorOpen(false)} className="h-8 w-8">
                            <X className="size-4" />
                        </Button>
                    </DialogHeader>

                    <div className="flex items-center gap-1 p-2 bg-muted/30 border-b">
                        {commands.map((cmd, i) => (
                            <Button
                                key={i}
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-9"
                                onClick={cmd.action}
                                title={cmd.title}
                            >
                                {cmd.icon}
                            </Button>
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x overflow-hidden">
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="px-4 py-2 bg-muted/20 border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tahrirlash</div>
                            <textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                className="flex-1 p-6 bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed"
                                placeholder="Markdown formatida yozing..."
                            />
                        </div>
                        <div className="flex-1 flex flex-col min-h-0 bg-muted/5">
                            <div className="px-4 py-2 bg-muted/20 border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ko'rinish</div>
                            <div className="flex-1 p-8 overflow-y-auto bg-background/50">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    {value ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
                                    ) : (
                                        <p className="text-muted-foreground italic text-center py-20">Matn yozishni boshlang...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 border-t bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-4 px-3">
                            <span>{value.length} belgi</span>
                            <span>{value.trim() ? value.trim().split(/\s+/).length : 0} so'z</span>
                        </div>
                        <Button size="sm" onClick={() => setIsFullEditorOpen(false)} className="h-8 px-6 font-bold">Saqlash</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
