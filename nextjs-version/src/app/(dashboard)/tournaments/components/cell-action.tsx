"use client"

import { Tournament } from "@/services/tournament"
import { Button } from "@/components/ui/button"
import { Pencil, Trophy } from "lucide-react"
import { TournamentFormDialog } from "./tournament-form-dialog"
import { useTournaments } from "../page"

interface CellActionProps {
    data: Tournament
}

export function CellAction({ data }: CellActionProps) {
    const { onEdit, onDelete } = useTournaments()

    return (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <TournamentFormDialog
                tournament={data}
                onEditTournament={onEdit}
                onDeleteTournament={onDelete}
                trigger={
                    <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer text-muted-foreground hover:text-primary transition-all rounded-xl border border-transparent hover:border-primary/10 hover:bg-primary/5">
                        <Pencil className="size-4" />
                        <span className="sr-only">Tahrirlash</span>
                    </Button>
                }
            />
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-muted/30 text-muted-foreground/40 border border-transparent hover:border-primary/10 transition-all group">
                <Trophy className="size-4 group-hover:text-primary/40" />
            </div>
        </div>
    )
}
