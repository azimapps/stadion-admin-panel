"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2, Percent, Plus, Calendar as CalendarIcon, DollarSign, Clock, MapPin, Users } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
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
import { Discount } from "@/services/discount"
import { Stadium, stadiumsService } from "@/services/stadium"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { DiscountFormValues, discountSchema } from "./discount-schema"

interface DiscountFormDialogProps {
    discount?: Discount
    onAddDiscount?: (data: any) => Promise<void>
    onEditDiscount?: (id: number, data: any) => Promise<void>
    onDeleteDiscount?: (id: number) => Promise<void>
    trigger?: React.ReactNode
}

export function DiscountFormDialog({
    discount,
    onAddDiscount,
    onEditDiscount,
    onDeleteDiscount,
    trigger,
}: DiscountFormDialogProps) {
    const isEditing = !!discount
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [stadiums, setStadiums] = useState<Stadium[]>([])
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const form = useForm<DiscountFormValues>({
        resolver: zodResolver(discountSchema) as any,
        defaultValues: {
            stadium_id: discount?.stadium_id || 0,
            discount_price_per_hour: discount?.discount_price_per_hour || 0,
            start_datetime: discount?.start_datetime ? new Date(discount.start_datetime).toISOString().slice(0, 16) : "",
            end_datetime: discount?.end_datetime ? new Date(discount.end_datetime).toISOString().slice(0, 16) : "",
        },
    })

    useEffect(() => {
        if (open) {
            stadiumsService.getAll().then(setStadiums).catch(console.error)
        }
    }, [open])

    async function onSubmit(values: DiscountFormValues) {
        setLoading(true)
        try {
            if (isEditing && onEditDiscount && discount) {
                await onEditDiscount(discount.id, values)
            } else if (onAddDiscount) {
                await onAddDiscount(values)
            }
            setOpen(false)
            form.reset()
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (discount && onDeleteDiscount) {
            setLoading(true)
            try {
                await onDeleteDiscount(discount.id)
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
                    <Button className="h-11 px-6 rounded-xl font-bold text-sm gap-2 shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95">
                        <Plus className="h-4 w-4" />
                        Yangi umumiy chegirma
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[92vh] flex flex-col p-0 overflow-hidden border-none shadow-[0_0_50px_rgba(0,0,0,0.2)] rounded-[2rem] bg-background">
                <DialogHeader className="p-10 pb-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold">{isEditing ? "Umumiy chegirmani tahrirlash" : "Yangi umumiy chegirma qo'shish"}</DialogTitle>
                            <DialogDescription className="text-muted-foreground font-medium">
                                Umumiy chegirma - butun bron uchun qo&apos;llanadi (barcha soatlar uchun). Vaqt oralig&apos;ini belgilang.
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
                    title="Umumiy chegirma o'chirilsinmi?"
                    description={`Umumiy chegirmani o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`}
                />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-10 pt-2 space-y-8 custom-scrollbar">
                        <FormField
                            control={form.control}
                            name="stadium_id"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-muted-foreground ml-1">Stadionni tanlang</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(parseInt(val))}
                                        value={field.value ? field.value.toString() : undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium transition-all focus:ring-primary/20">
                                                <div className="flex items-center gap-3">
                                                    <Percent className="size-4 text-primary/60" />
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
                                                    <Percent className="size-10 text-muted-foreground/20" />
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
                                                        <p className="line-clamp-2">{selectedStadium.address_uz}</p>
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
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">Asl narxi</span>
                                                    <div className="flex flex-col lg:items-end">
                                                        <span className="text-lg font-bold text-foreground">
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

                        <FormField
                            control={form.control}
                            name="discount_price_per_hour"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-muted-foreground ml-1">Umumiy chegirma narxi (soatiga UZS)</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-blue-500/40 group-focus-within:text-blue-500 transition-all" />
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                className="h-12 pl-12 rounded-xl bg-muted/20 border-border/40 font-medium text-base transition-all focus-visible:ring-blue-500/20 text-blue-600"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <p className="text-[10px] text-muted-foreground ml-1">Bu narx butun bron uchun (barcha soatlarga) qo&apos;llanadi</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="start_datetime"
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
                                name="end_datetime"
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
