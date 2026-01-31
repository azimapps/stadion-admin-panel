"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Media } from "@/services/media"
import { format } from "date-fns"
import { Video } from "lucide-react"
import { CellAction } from "./cell-action"

export const getColumns = (
    onRefresh: () => void,
    onEdit: (id: number, data: any) => Promise<void>,
    onDelete: (id: number) => Promise<void>
): ColumnDef<Media>[] => [
        {
            accessorKey: "title_uz",
            header: "Media va Maqola",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-3 py-1">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <Video className="size-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground text-sm line-clamp-1">
                                {row.getValue("title_uz")}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate">
                                {row.original.title_ru}
                            </span>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "created_at",
            header: "Sana",
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"))
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{format(date, "dd.MM.yyyy")}</span>
                        <span className="text-[10px] text-muted-foreground">{format(date, "HH:mm")}</span>
                    </div>
                )
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right">Amallar</div>,
            cell: ({ row }) => (
                <div className="flex justify-end pr-1">
                    <CellAction
                        data={row.original}
                        onRefresh={onRefresh}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </div>
            ),
        },
    ]
