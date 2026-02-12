"use client"

import * as React from "react"
import { Percent, List } from "lucide-react"
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"
import { discountsService, Discount } from "@/services/discount"
import { DiscountFormDialog } from "./components/discount-form-dialog"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export const DiscountsContext = React.createContext<{
    onEdit: (id: number, data: any) => Promise<void>
    onDelete: (id: number) => Promise<void>
} | null>(null)

export const useDiscounts = () => {
    const context = React.useContext(DiscountsContext)
    if (!context) throw new Error("useDiscounts must be used within DiscountsProvider")
    return context
}

export default function DiscountsPage() {
    const [data, setData] = React.useState<Discount[]>([])
    const [loading, setLoading] = React.useState(true)

    const fetchDiscounts = React.useCallback(async () => {
        try {
            setLoading(true)
            const response = await discountsService.getAll()
            setData(response.items)
        } catch (error) {
            console.error(error)
            toast.error("Umumiy chegirmalarni yuklashda xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchDiscounts()
    }, [fetchDiscounts])

    const onAdd = async (values: any) => {
        try {
            await discountsService.create(values)
            toast.success("Yangi umumiy chegirma qo'shildi")
            fetchDiscounts()
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Xatolik yuz berdi")
            throw error
        }
    }

    const onEdit = async (id: number, values: any) => {
        try {
            await discountsService.update(id, values)
            toast.success("Umumiy chegirma yangilandi")
            fetchDiscounts()
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Xatolik yuz berdi")
            throw error
        }
    }

    const onDelete = async (id: number) => {
        try {
            await discountsService.delete(id)
            toast.success("Umumiy chegirma o'chirildi")
            fetchDiscounts()
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Xatolik yuz berdi")
            throw error
        }
    }

    return (
        <DiscountsContext.Provider value={{ onEdit, onDelete }}>
            <div className="flex-1 space-y-12 p-10 pt-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-[1.25rem] bg-blue-500/10 flex items-center justify-center shadow-inner">
                                <Percent className="size-6 text-blue-500" />
                            </div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Umumiy Chegirmalar</h1>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground/60 tracking-wide ml-1">
                            Umumiy chegirmalar - butun bron uchun (barcha soatlarga) qo&apos;llanadi. Vaqt oralig&apos;ida faol.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <DiscountFormDialog onAddDiscount={onAdd} />
                    </div>
                </div>

                <Separator className="bg-border/40" />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <List className="size-4 text-blue-500" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Umumiy chegirmalar ro&apos;yxati</h2>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-64 items-center justify-center rounded-3xl bg-muted/20 animate-pulse border border-border/20">
                            <div className="flex flex-col items-center gap-4">
                                <Percent className="size-10 text-blue-500 opacity-20 animate-bounce" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/40">Yuklanmoqda...</span>
                            </div>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={data} />
                    )}
                </div>
            </div>
        </DiscountsContext.Provider>
    )
}
