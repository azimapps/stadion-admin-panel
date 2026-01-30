"use client"

import { useState } from "react"
import { Media, mediaService } from "@/services/media"
import { Button } from "@/components/ui/button"
import { EllipsisVertical, Pencil, ExternalLink } from "lucide-react"
import { MediaFormDialog } from "./media-form-dialog"

interface CellActionProps {
    data: Media
    onRefresh: () => void
    onEdit: (id: number, data: any) => Promise<void>
    onDelete: (id: number) => Promise<void>
}

export function CellAction({ data, onRefresh, onEdit, onDelete }: CellActionProps) {
    return (
        <div className="flex items-center justify-end gap-2 text-foreground" onClick={(e) => e.stopPropagation()}>
            <MediaFormDialog
                media={data}
                onEditMedia={onEdit}
                onDeleteMedia={onDelete}
                trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="size-4" />
                        <span className="sr-only">Tahrirlash</span>
                    </Button>
                }
            />
            <a
                href={data.youtube_video_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                title="YouTube da ochish"
            >
                <ExternalLink className="size-4" />
            </a>
        </div>
    )
}
