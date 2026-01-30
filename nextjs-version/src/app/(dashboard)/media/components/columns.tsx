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
            header: "Sarlavha (UZ)",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Video className="size-5" />
                        </div>
                        <span className="font-semibold text-foreground line-clamp-1">
                            {row.getValue("title_uz")}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: "title_ru",
            header: "Sarlavha (RU)",
            cell: ({ row }) => <span className="line-clamp-1">{row.getValue("title_ru")}</span>
        },
        {
            accessorKey: "created_at",
            header: "Yaratilgan vaqt",
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"))
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{format(date, "dd.MM.yyyy")}</span>
                        <span className="text-xs text-muted-foreground">{format(date, "HH:mm")}</span>
                    </div>
                )
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right">Amallar</div>,
            cell: ({ row }) => (
                <CellAction
                    data={row.original}
                    onRefresh={onRefresh}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ),
        },
    ]
