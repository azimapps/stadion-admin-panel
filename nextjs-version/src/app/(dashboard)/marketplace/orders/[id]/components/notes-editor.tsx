"use client"

import { useEffect, useState } from "react"
import { Loader2, NotebookPen, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface NotesEditorProps {
    value: string | null
    onSave: (next: string | null) => Promise<void>
}

export function NotesEditor({ value, onSave }: NotesEditorProps) {
    const [draft, setDraft] = useState<string>(value ?? "")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setDraft(value ?? "")
    }, [value])

    const dirty = (value ?? "") !== draft
    const trimmed = draft.trim()

    const save = async () => {
        try {
            setSaving(true)
            setError(null)
            await onSave(trimmed === "" ? null : draft)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Saqlashda xatolik")
        } finally {
            setSaving(false)
        }
    }

    const reset = () => setDraft(value ?? "")

    return (
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <NotebookPen className="size-4 text-muted-foreground" />
                    <div className="text-[10px] font-black uppercase tracking-[0.25em]">
                        Admin eslatmasi
                    </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                    Faqat ichki ko'rinish
                </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
                <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Kuryer uchun ko'rsatma, qaytarish konteksti, xaridor izohi..."
                    className="min-h-[110px] rounded-xl resize-none"
                />
                {error && (
                    <div className="text-xs text-destructive rounded-lg bg-destructive/10 px-3 py-2">{error}</div>
                )}
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 tabular-nums">
                        {draft.length} ta belgi
                    </span>
                    <div className="flex items-center gap-2">
                        {dirty && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={reset}
                                disabled={saving}
                                className="cursor-pointer"
                            >
                                <X className="mr-1 size-3.5" />
                                Bekor
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={save}
                            disabled={!dirty || saving}
                            className="cursor-pointer rounded-xl"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                                    Saqlanmoqda
                                </>
                            ) : (
                                <>
                                    <Save className="mr-1.5 size-3.5" />
                                    Saqlash
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
