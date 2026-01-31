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
    X,
    Maximize2,
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
            {label && <label className="text-sm font-bold uppercase tracking-tight text-foreground/70">{label}</label>}

            <div
                className="group relative min-h-[160px] rounded-xl border border-border bg-muted/20 p-6 cursor-pointer hover:bg-muted/30 transition-all overflow-hidden"
                onClick={() => setIsFullEditorOpen(true)}
            >
                {value ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-6 opacity-80 pointer-events-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-6 text-center text-muted-foreground gap-3">
                        <Maximize2 className="size-8 opacity-20" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold">{placeholder || "Maqola matnini yozish uchun bosing"}</p>
                            <p className="text-xs opacity-50 italic">Professional maqola tahrirlash rejimini ochish uchun bosing</p>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={isFullEditorOpen} onOpenChange={setIsFullEditorOpen}>
                <DialogContent
                    showCloseButton={false}
                    className="max-w-[94vw] sm:max-w-[94vw] w-full h-[92vh] p-0 flex flex-col overflow-hidden bg-background border border-border shadow-2xl rounded-3xl"
                >
                    <DialogHeader className="px-8 py-5 border-b flex flex-row items-center justify-between space-y-0 bg-muted/5">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Maqola tahrirlash</DialogTitle>
                            <p className="text-xs text-muted-foreground font-medium tracking-wider opacity-50 uppercase">Markdown Editor • Professional Suite</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsFullEditorOpen(false)}
                            className="size-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                        >
                            <X className="size-5" />
                        </Button>
                    </DialogHeader>

                    <div className="flex items-center gap-1.5 p-3 bg-muted/20 border-b overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-1 mr-5 border-r pr-5 border-border/50">
                            {commands.slice(0, 3).map((cmd, i) => (
                                <Button key={i} type="button" variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-background" onClick={cmd.action} title={cmd.title}>{cmd.icon}</Button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            {commands.slice(3).map((cmd, i) => (
                                <Button key={i} type="button" variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-background" onClick={cmd.action} title={cmd.title}>{cmd.icon}</Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        <div className="flex-1 flex flex-col border-r border-border/50">
                            <div className="px-6 py-2 bg-muted/40 border-b text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Tahrirlash paneli</div>
                            <textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                className="flex-1 p-8 bg-transparent resize-none focus:outline-none font-mono text-base leading-relaxed"
                                placeholder="Markdown formatida yozing..."
                                spellCheck={false}
                            />
                        </div>
                        <div className="flex-1 flex flex-col bg-muted/5">
                            <div className="px-6 py-2 bg-muted/40 border-b text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Jonli ko'rinish</div>
                            <div className="flex-1 p-10 overflow-y-auto bg-background/30 custom-scrollbar">
                                <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none">
                                    {value ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full opacity-10 py-20">
                                            <p className="italic font-bold tracking-widest uppercase text-xs">Hozircha hech narsa yo'q...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-5 border-t bg-muted/10 flex items-center justify-between">
                        <div className="flex items-center gap-8 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                            <div className="flex items-center gap-2"><span>Belgi:</span> <span className="text-foreground/60">{value.length}</span></div>
                            <div className="flex items-center gap-2"><span>So'z:</span> <span className="text-foreground/60">{value.trim() ? value.trim().split(/\s+/).length : 0}</span></div>
                        </div>
                        <Button size="lg" onClick={() => setIsFullEditorOpen(false)} className="px-10 h-12 font-bold uppercase tracking-widest text-[11px] rounded-xl shadow-lg hover:scale-[1.02] transition-all">Saqlash va Yopish</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
