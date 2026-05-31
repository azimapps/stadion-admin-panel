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
        <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <NotebookPen className="size-4 text-muted-foreground" />
                    <div className="text-sm font-semibold">Admin eslatmasi</div>
                </div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Faqat ichki
                </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
                <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Kuryer uchun ko'rsatma, qaytarish konteksti, xaridor izohi..."
                    className="min-h-[100px] rounded-lg resize-none"
                />
                {error && (
                    <div className="text-xs text-destructive rounded-md bg-destructive/10 px-3 py-2">
                        {error}
                    </div>
                )}
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {draft.length} ta belgi
                    </span>
                    <div className="flex items-center gap-2">
                        {dirty && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={reset}
                                disabled={saving}
                                className="cursor-pointer h-8"
                            >
                                <X className="mr-1 size-3.5" />
                                Bekor
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={save}
                            disabled={!dirty || saving}
                            className="cursor-pointer rounded-lg h-8"
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
