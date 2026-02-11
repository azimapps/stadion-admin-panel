"use client"

import * as React from "react"
import { Trophy, Plus, LayoutGrid, List } from "lucide-react"
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"
import { tournamentService, Tournament, TournamentCreate } from "@/services/tournament"
import { TournamentFormDialog } from "./components/tournament-form-dialog"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

// Exporting hooks for child components to use
export const TournamentsContext = React.createContext<{
    onEdit: (id: number, data: Partial<TournamentCreate>) => Promise<void>
    onDelete: (id: number) => Promise<void>
} | null>(null)

export const useTournaments = () => {
    const context = React.useContext(TournamentsContext)
    if (!context) throw new Error("useTournaments must be used within TournamentsProvider")
    return context
}

export default function TournamentsPage() {
    const [data, setData] = React.useState<Tournament[]>([])
    const [loading, setLoading] = React.useState(true)

    const fetchTournaments = React.useCallback(async () => {
        try {
            setLoading(true)
            const tournaments = await tournamentService.getAll()
            setData(tournaments)
        } catch (error) {
            console.error(error)
            toast.error("Turnirlarni yuklashda xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchTournaments()
    }, [fetchTournaments])

    const onAdd = async (values: TournamentCreate) => {
        try {
            await tournamentService.create(values)
            toast.success("Yangi turnir qo'shildi")
            fetchTournaments()
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Xatolik yuz berdi")
            throw error
        }
    }

    const onEdit = async (id: number, values: Partial<TournamentCreate>) => {
        try {
            await tournamentService.update(id, values)
            toast.success("Turnir yangilandi")
            fetchTournaments()
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Xatolik yuz berdi")
            throw error
        }
    }

    const onDelete = async (id: number) => {
        try {
            await tournamentService.delete(id)
            toast.success("Turnir o'chirildi")
            fetchTournaments()
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Xatolik yuz berdi")
            throw error
        }
    }

    return (
        <TournamentsContext.Provider value={{ onEdit, onDelete }}>
            <div className="flex-1 space-y-12 p-10 pt-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center shadow-inner">
                                <Trophy className="size-6 text-primary" />
                            </div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Turnirlar</h1>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground/60 tracking-wide ml-1">
                            Barcha futbol turnirlari va musobaqalarni shu yerdan boshqaring.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <TournamentFormDialog onAddTournament={onAdd} />
                    </div>
                </div>

                <Separator className="bg-border/40" />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <List className="size-4 text-primary" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Turnirlar ro'yxati</h2>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-64 items-center justify-center rounded-3xl bg-muted/20 animate-pulse border border-border/20">
                            <div className="flex flex-col items-center gap-4">
                                <Trophy className="size-10 text-primary opacity-20 animate-bounce" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Yuklanmoqda...</span>
                            </div>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={data} />
                    )}
                </div>
            </div>
        </TournamentsContext.Provider>
    )
}
