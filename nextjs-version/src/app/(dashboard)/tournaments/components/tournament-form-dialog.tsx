"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Trash2, Trophy, Plus, Calendar as CalendarIcon, MapPin, DollarSign, Clock, Users } from "lucide-react"
import { format, parseISO } from "date-fns"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tournament, TournamentCreate } from "@/services/tournament"
import { Stadium, stadiumsService } from "@/services/stadium"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const tournamentFormSchema = z.object({
    title_uz: z.string().min(2, { message: "Sarlavha kamida 2 ta belgi bo'lishi kerak." }),
    title_ru: z.string().min(2, { message: "Заголовок должен содержать минимум 2 символа." }),
    description_uz: z.string().optional(),
    description_ru: z.string().optional(),
    stadium_id: z.coerce.number().min(1, { message: "Stadionni tanlang." }),
    start_time: z.string().min(1, { message: "Boshlanish vaqtini tanlang." }),
    end_time: z.string().min(1, { message: "Tugash vaqtini tanlang." }),
    entrance_fee: z.coerce.number().min(0),
})

type TournamentFormValues = z.infer<typeof tournamentFormSchema>

interface TournamentFormDialogProps {
    tournament?: Tournament
    fixedStadiumId?: number
    onAddTournament?: (data: TournamentCreate) => Promise<void>
    onEditTournament?: (id: number, data: Partial<TournamentCreate>) => Promise<void>
    onDeleteTournament?: (id: number) => Promise<void>
    trigger?: React.ReactNode
}

export function TournamentFormDialog({
    tournament,
    fixedStadiumId,
    onAddTournament,
    onEditTournament,
    onDeleteTournament,
    trigger,
}: TournamentFormDialogProps) {
    const isEditing = !!tournament
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [stadiums, setStadiums] = useState<Stadium[]>([])
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const form = useForm<any>({
        resolver: zodResolver(tournamentFormSchema),
        defaultValues: {
            title_uz: tournament?.title_uz || "",
            title_ru: tournament?.title_ru || "",
            description_uz: tournament?.description_uz || "",
            description_ru: tournament?.description_ru || "",
            stadium_id: fixedStadiumId || tournament?.stadium_id || 0,
            start_time: tournament?.start_time ? new Date(tournament.start_time).toISOString().slice(0, 16) : "",
            end_time: tournament?.end_time ? new Date(tournament.end_time).toISOString().slice(0, 16) : "",
            entrance_fee: tournament?.entrance_fee || 0,
            team_ids: tournament?.team_ids || [],
        },
    })

    useEffect(() => {
        if (open && !fixedStadiumId) {
            stadiumsService.getAll().then(setStadiums).catch(console.error)
        }
    }, [open, fixedStadiumId])

    async function onSubmit(values: TournamentFormValues) {
        setLoading(true)
        try {
            if (isEditing && onEditTournament && tournament) {
                await onEditTournament(tournament.id, values)
            } else if (onAddTournament) {
                await onAddTournament(values as TournamentCreate)
            }
            setOpen(false)
            form.reset()
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (tournament && onDeleteTournament) {
            setLoading(true)
            try {
                await onDeleteTournament(tournament.id)
                setShowDeleteConfirm(false)
                setOpen(false)
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button className="h-11 px-6 rounded-xl font-bold text-sm gap-2 shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95">
                        <Plus className="h-4 w-4" />
                        Yangi turnir
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden border-none shadow-[0_0_50px_rgba(0,0,0,0.2)] rounded-[2rem] bg-background">
                <DialogHeader className="p-10 pb-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold">{isEditing ? "Turnirni tahrirlash" : "Yangi turnir qo'shish"}</DialogTitle>
                            <DialogDescription className="text-muted-foreground font-medium">
                                Turnir ma'lumotlarini to'ldiring. Stadion va vaqtni aniq belgilang.
                            </DialogDescription>
                        </div>
                        {isEditing && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-12 rounded-xl bg-destructive/5 hover:bg-destructive/10 text-destructive border border-destructive/10 transition-all"
                                onClick={() => setShowDeleteConfirm(true)}
                                type="button"
                                disabled={loading}
                            >
                                <Trash2 className="size-5" />
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <ConfirmDeleteDialog
                    open={showDeleteConfirm}
                    onOpenChange={setShowDeleteConfirm}
                    onConfirm={handleDelete}
                    loading={loading}
                    title="Turnir o'chirilsinmi?"
                    description={`"${tournament?.title_uz}" turnirini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`}
                />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-10 pt-2 space-y-10 custom-scrollbar">
                        {!fixedStadiumId && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="stadium_id"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-medium text-muted-foreground ml-1">Stadionni tanlang</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium transition-all focus:ring-primary/20">
                                                        <div className="flex items-center gap-3">
                                                            <Trophy className="size-4 text-primary/60" />
                                                            <SelectValue placeholder="Stadionni tanlang" />
                                                        </div>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl border-border/40 shadow-2xl p-1 bg-background/95 backdrop-blur-xl">
                                                    {stadiums.map((stadium) => (
                                                        <SelectItem
                                                            key={stadium.id}
                                                            value={stadium.id.toString()}
                                                            className="rounded-lg py-2 px-3 focus:bg-primary focus:text-white transition-colors cursor-pointer mb-1 last:mb-0"
                                                        >
                                                            <div className="flex items-center justify-between w-full gap-8">
                                                                <span className="text-sm font-medium">{stadium.name_uz}</span>
                                                                <span className="text-[10px] opacity-40 font-mono">ID: {stadium.id}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="entrance_fee"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-sm font-medium text-muted-foreground ml-1">Kirish haqi (UZS)</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-primary/40 group-focus-within:text-primary transition-all" />
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        className="h-12 pl-12 rounded-xl bg-muted/20 border-border/40 font-medium text-base transition-all focus-visible:ring-primary/20"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {fixedStadiumId && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="entrance_fee"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2 md:col-span-2">
                                            <FormLabel className="text-sm font-medium text-muted-foreground ml-1">Kirish haqi (UZS)</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-primary/40 group-focus-within:text-primary transition-all" />
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        className="h-12 pl-12 rounded-xl bg-muted/20 border-border/40 font-medium text-base transition-all focus-visible:ring-primary/20"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Standardized Stadium Info Card */}
                        {(() => {
                            const stadiumId = form.watch("stadium_id");
                            const selectedStadium = stadiums.find(s => s.id === Number(stadiumId));
                            if (!selectedStadium) return null;
                            return (
                                <div className="overflow-hidden rounded-2xl border bg-muted/30 backdrop-blur-sm p-6 shadow-sm">
                                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                                        {/* Image Frame */}
                                        <div className="relative h-32 w-full lg:w-48 shrink-0 rounded-xl overflow-hidden border bg-muted shadow-inner">
                                            {selectedStadium.main_image ? (
                                                <img
                                                    src={selectedStadium.main_image}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <Trophy className="size-10 text-muted-foreground/20" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Area */}
                                        <div className="flex-1 w-full space-y-6">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-bold text-primary uppercase tracking-wide">Tanlangan stadion</p>
                                                <h4 className="text-xl font-bold text-foreground">
                                                    {selectedStadium.name_uz}
                                                </h4>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-border/50">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Manzil</span>
                                                    <div className="flex items-start gap-2 text-sm text-foreground">
                                                        <MapPin className="size-3.5 text-muted-foreground mt-0.5" />
                                                        <p>{selectedStadium.address_uz}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Sig'imi</span>
                                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                                        <Users className="size-3.5 text-muted-foreground" />
                                                        <p>{selectedStadium.capacity} kishi</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 lg:text-right">
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Narxi</span>
                                                    <div className="flex flex-col lg:items-end">
                                                        <span className="text-lg font-bold text-primary">
                                                            {selectedStadium.price_per_hour.toLocaleString()} UZS
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground uppercase">soatiga</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="grid grid-cols-2 gap-8">
                            <FormField
                                control={form.control}
                                name="start_time"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-medium text-muted-foreground ml-1">Boshlanish vaqti</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "h-12 w-full pl-4 text-left font-medium rounded-xl bg-muted/20 border-border/40 transition-all hover:bg-muted/30 focus:ring-primary/20",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-3 size-4 text-primary/60" />
                                                        {field.value ? (
                                                            format(new Date(field.value), "PPP HH:mm")
                                                        ) : (
                                                            <span>Vaqtni tanlang</span>
                                                        )}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-border/40" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        if (!date) return;
                                                        const current = field.value ? new Date(field.value) : new Date();
                                                        date.setHours(current.getHours());
                                                        date.setMinutes(current.getMinutes());
                                                        field.onChange(date.toISOString().slice(0, 16));
                                                    }}
                                                    initialFocus
                                                    className="rounded-t-2xl"
                                                />
                                                <div className="p-4 border-t border-border/40 flex items-center gap-3">
                                                    <Clock className="size-4 text-primary/60" />
                                                    <Input
                                                        type="time"
                                                        className="h-10 bg-muted/20 border-border/40 rounded-lg text-sm font-medium"
                                                        value={field.value ? field.value.split('T')[1]?.slice(0, 5) : "00:00"}
                                                        onChange={(e) => {
                                                            const [hours, minutes] = e.target.value.split(':');
                                                            const current = field.value ? new Date(field.value) : new Date();
                                                            current.setHours(parseInt(hours));
                                                            current.setMinutes(parseInt(minutes));
                                                            field.onChange(current.toISOString().slice(0, 16));
                                                        }}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end_time"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="text-sm font-medium text-muted-foreground ml-1">Tugash vaqti</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "h-12 w-full pl-4 text-left font-medium rounded-xl bg-muted/20 border-border/40 transition-all hover:bg-muted/30 focus:ring-primary/20",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-3 size-4 text-primary/60" />
                                                        {field.value ? (
                                                            format(new Date(field.value), "PPP HH:mm")
                                                        ) : (
                                                            <span>Vaqtni tanlang</span>
                                                        )}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-border/40" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        if (!date) return;
                                                        const current = field.value ? new Date(field.value) : new Date();
                                                        date.setHours(current.getHours());
                                                        date.setMinutes(current.getMinutes());
                                                        field.onChange(date.toISOString().slice(0, 16));
                                                    }}
                                                    initialFocus
                                                    className="rounded-t-2xl"
                                                />
                                                <div className="p-4 border-t border-border/40 flex items-center gap-3">
                                                    <Clock className="size-4 text-primary/60" />
                                                    <Input
                                                        type="time"
                                                        className="h-10 bg-muted/20 border-border/40 rounded-lg text-sm font-medium"
                                                        value={field.value ? field.value.split('T')[1]?.slice(0, 5) : "00:00"}
                                                        onChange={(e) => {
                                                            const [hours, minutes] = e.target.value.split(':');
                                                            const current = field.value ? new Date(field.value) : new Date();
                                                            current.setHours(parseInt(hours));
                                                            current.setMinutes(parseInt(minutes));
                                                            field.onChange(current.toISOString().slice(0, 16));
                                                        }}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Tabs defaultValue="uz" className="w-full">
                            <TabsList className="grid w-fit grid-cols-2 rounded-xl h-11 p-1 bg-muted/40 border border-border/20">
                                <TabsTrigger value="uz" className="rounded-lg px-8 font-semibold text-xs transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">Uzbekcha</TabsTrigger>
                                <TabsTrigger value="ru" className="rounded-lg px-8 font-semibold text-xs transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">Русский</TabsTrigger>
                            </TabsList>

                            <TabsContent value="uz" className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <FormField
                                    control={form.control}
                                    name="title_uz"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-muted-foreground ml-1">Turnir nomi (UZ)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Masalan: Yozgi Kubok 2024" className="h-12 rounded-xl bg-muted/20 border-border/40 font-semibold text-lg transition-all focus-visible:ring-primary/20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description_uz"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-muted-foreground ml-1">Tavsif (UZ)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Turnir haqida qisqacha ma'lumot" className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium text-sm transition-all focus-visible:ring-primary/20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="ru" className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <FormField
                                    control={form.control}
                                    name="title_ru"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-muted-foreground ml-1">Название турнира (RU)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Например: Летний Кубок 2024" className="h-12 rounded-xl bg-muted/20 border-border/40 font-semibold text-lg transition-all focus-visible:ring-primary/20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description_ru"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-muted-foreground ml-1">Описание (RU)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Краткая информация о турнире" className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium text-sm transition-all focus-visible:ring-primary/20" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>
                    </form>
                </Form>

                <DialogFooter className="p-10 pt-6 border-t bg-muted/10 backdrop-blur-md">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="h-12 px-10 rounded-xl font-bold text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all"
                        disabled={loading}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        type="submit"
                        onClick={form.handleSubmit(onSubmit)}
                        className="h-12 px-16 rounded-xl bg-primary font-bold text-sm shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
                        disabled={loading}
                    >
                        {loading ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
