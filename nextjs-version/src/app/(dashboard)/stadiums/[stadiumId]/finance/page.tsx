"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Bar, ComposedChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { toast } from "sonner"
import {
    ArrowLeft, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
    DollarSign, Trophy, Banknote, Plus, Pencil, Trash2, Loader2, Calendar as CalendarIcon
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
} from "@/components/ui/chart"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"

import { financeService, StadiumFinanceResponse, Expense } from "@/services/finance"

const MONTHS_UZ = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
]

const chartConfig = {
    income: {
        label: "Daromad",
        color: "#22c55e",
    },
    expenses: {
        label: "Xarajatlar",
        color: "#ef4444",
    },
    profit: {
        label: "Sof foyda",
        color: "#3b82f6",
    },
} satisfies ChartConfig

const formatAxisUZS = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
    return String(value)
}

const formatUZS = (num: number = 0) => new Intl.NumberFormat('ru-RU').format(num) + ' UZS'

export default function StadiumFinancePage() {
    const params = useParams<{ stadiumId: string }>()
    const stadiumId = Number(params.stadiumId)

    const [currentDate, setCurrentDate] = React.useState(() => new Date())
    const [data, setData] = React.useState<StadiumFinanceResponse | null>(null)
    const [loading, setLoading] = React.useState(true)

    // Expense dialog
    const [expenseDialogOpen, setExpenseDialogOpen] = React.useState(false)
    const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null)
    const [expenseForm, setExpenseForm] = React.useState({ amount: "", description: "", date: "" })
    const [expenseSaving, setExpenseSaving] = React.useState(false)

    // Delete dialog
    const [deleteExpense, setDeleteExpense] = React.useState<Expense | null>(null)
    const [deleting, setDeleting] = React.useState(false)

    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()
    const today = new Date()
    const isFutureMonth = year === today.getFullYear() && currentDate.getMonth() >= today.getMonth()

    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true)
            const res = await financeService.getStadiumFinance(stadiumId, month, year)
            setData(res)
        } catch (error) {
            console.error(error)
            toast.error("Moliyaviy ma'lumotlarni yuklashda xatolik")
        } finally {
            setLoading(false)
        }
    }, [stadiumId, month, year])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    const handleNextMonth = () => {
        if (isFutureMonth) return
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    }

    const openAddExpense = () => {
        setEditingExpense(null)
        setExpenseForm({ amount: "", description: "", date: format(new Date(), "yyyy-MM-dd") })
        setExpenseDialogOpen(true)
    }

    const openEditExpense = (expense: Expense) => {
        setEditingExpense(expense)
        setExpenseForm({
            amount: String(expense.amount),
            description: expense.description,
            date: expense.date,
        })
        setExpenseDialogOpen(true)
    }

    const handleSaveExpense = async () => {
        if (!expenseForm.amount || !expenseForm.description || !expenseForm.date) {
            toast.error("Barcha maydonlarni to'ldiring")
            return
        }
        try {
            setExpenseSaving(true)
            if (editingExpense) {
                await financeService.updateExpense(editingExpense.id, {
                    amount: Number(expenseForm.amount),
                    description: expenseForm.description,
                    date: expenseForm.date,
                })
                toast.success("Xarajat yangilandi")
            } else {
                await financeService.createExpense({
                    stadium_id: stadiumId,
                    amount: Number(expenseForm.amount),
                    description: expenseForm.description,
                    date: expenseForm.date,
                })
                toast.success("Xarajat qo'shildi")
            }
            setExpenseDialogOpen(false)
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Xatolik yuz berdi")
        } finally {
            setExpenseSaving(false)
        }
    }

    const handleDeleteExpense = async () => {
        if (!deleteExpense) return
        try {
            setDeleting(true)
            await financeService.deleteExpense(deleteExpense.id)
            toast.success("Xarajat o'chirildi")
            setDeleteExpense(null)
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Xarajatni o'chirishda xatolik")
        } finally {
            setDeleting(false)
        }
    }

    const displayMonthYear = `${MONTHS_UZ[currentDate.getMonth()]} ${year}`

    return (
        <div className="flex flex-col gap-6 px-4 lg:px-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/stadiums/${stadiumId}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Moliya</h1>
                        {data && <p className="text-sm text-muted-foreground">{data.stadium_name}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center min-w-[140px] font-medium text-sm">
                        {displayMonthYear}
                    </div>
                    <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={isFutureMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array(4).fill(0).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-32" />
                            </CardHeader>
                            <CardFooter><Skeleton className="h-4 w-40" /></CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Jami Daromad</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {formatUZS(data?.summary.total_income)}
                            </CardTitle>
                            <CardAction><TrendingUp className="text-green-500 opacity-60 w-5 h-5" /></CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="text-muted-foreground">Bron + Turnir daromadi</div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Bron Daromadi</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {formatUZS(data?.summary.total_booking_income)}
                            </CardTitle>
                            <CardAction><DollarSign className="text-blue-500 opacity-60 w-5 h-5" /></CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="text-muted-foreground">Stadion band qilishdan</div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Turnir Daromadi</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {formatUZS(data?.summary.total_tournament_income)}
                            </CardTitle>
                            <CardAction><Trophy className="text-orange-500 opacity-60 w-5 h-5" /></CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="text-muted-foreground">Turnirlardan tushgan daromad</div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Xarajatlar</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {formatUZS(data?.summary.total_expenses)}
                            </CardTitle>
                            <CardAction><TrendingDown className="text-red-500 opacity-60 w-5 h-5" /></CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="text-muted-foreground font-semibold">
                                Sof foyda: {formatUZS(data?.summary.total_profit)}
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Chart */}
            {!loading && data && (
                <Card className="@container/card">
                    <CardHeader>
                        <CardTitle>Kunlik daromad va xarajatlar</CardTitle>
                        <CardDescription>{displayMonthYear} — daromad, xarajat va sof foyda</CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                            <ComposedChart data={data.daily} barGap={2}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tickFormatter={(value) => {
                                        const d = new Date(value)
                                        return `${d.getDate()}-${MONTHS_UZ[d.getMonth()].slice(0, 3)}`
                                    }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    width={55}
                                    tickFormatter={formatAxisUZS}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(value) => {
                                                const d = new Date(value as string)
                                                return `${d.getDate()} ${MONTHS_UZ[d.getMonth()]}, ${d.getFullYear()}`
                                            }}
                                            indicator="dot"
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar
                                    dataKey="income"
                                    fill="var(--color-income)"
                                    radius={[4, 4, 0, 0]}
                                    barSize={16}
                                />
                                <Bar
                                    dataKey="expenses"
                                    fill="var(--color-expenses)"
                                    radius={[4, 4, 0, 0]}
                                    barSize={16}
                                />
                                <Line
                                    dataKey="profit"
                                    type="monotone"
                                    stroke="var(--color-profit)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </ComposedChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            )}

            {/* Expenses Table */}
            {!loading && data && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Xarajatlar</CardTitle>
                            <CardDescription>{displayMonthYear} dagi xarajatlar ro&apos;yxati</CardDescription>
                        </div>
                        <Button onClick={openAddExpense} className="gap-2">
                            <Plus className="h-4 w-4" /> Xarajat qo&apos;shish
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {data.expenses_list.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Banknote className="h-10 w-10 opacity-20 mb-3" />
                                <p className="text-sm font-medium">Xarajatlar topilmadi</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sana</TableHead>
                                        <TableHead>Tavsif</TableHead>
                                        <TableHead className="text-right">Summa</TableHead>
                                        <TableHead className="w-[100px]" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.expenses_list.map((expense) => (
                                        <TableRow key={expense.id}>
                                            <TableCell className="font-mono text-sm">
                                                {format(new Date(expense.date), "dd.MM.yyyy")}
                                            </TableCell>
                                            <TableCell>{expense.description}</TableCell>
                                            <TableCell className="text-right font-semibold text-red-500">
                                                {formatUZS(expense.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditExpense(expense)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteExpense(expense)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Add/Edit Expense Dialog */}
            <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingExpense ? "Xarajatni tahrirlash" : "Yangi xarajat"}</DialogTitle>
                        <DialogDescription>
                            {editingExpense ? "Xarajat ma'lumotlarini o'zgartiring" : "Stadion uchun yangi xarajat qo'shing"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Summa (UZS)</Label>
                            <Input
                                type="number"
                                placeholder="50000"
                                value={expenseForm.amount}
                                onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tavsif</Label>
                            <Input
                                placeholder="Elektr energiya, suv, ta'mirlash..."
                                value={expenseForm.description}
                                onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Sana</Label>
                            <Input
                                type="date"
                                value={expenseForm.date}
                                onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExpenseDialogOpen(false)}>Bekor qilish</Button>
                        <Button onClick={handleSaveExpense} disabled={expenseSaving}>
                            {expenseSaving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saqlanmoqda...</>
                            ) : (
                                editingExpense ? "Yangilash" : "Qo'shish"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Expense Confirm */}
            <ConfirmDeleteDialog
                open={!!deleteExpense}
                onOpenChange={(open) => !open && setDeleteExpense(null)}
                onConfirm={handleDeleteExpense}
                title="Xarajatni o'chirish"
                description={`"${deleteExpense?.description}" xarajatini o'chirmoqchimisiz?`}
                loading={deleting}
            />
        </div>
    )
}
