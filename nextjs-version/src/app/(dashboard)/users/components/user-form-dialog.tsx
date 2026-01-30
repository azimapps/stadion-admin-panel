"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X, Check, Plus, Loader2, MapPin, BadgeDollarSign, Map } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Switch } from "@/components/ui/switch"
import { Stadium, stadiumsService } from "@/services/stadium"
import { cn } from "@/lib/utils"

const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Ism kamida 2 ta belgidan iborat bo'lishi kerak.",
  }),
  phone: z.string().min(17, {
    message: "Telefon raqamini to'liq kiriting (masalan: +998 90 123 45 67).",
  }),
  stadium_ids: z.array(z.number()),
  is_active: z.boolean(),
})

import { Manager, ManagerFormValues, managersService } from "@/services/manager"

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormDialogProps {
  onAddUser?: (user: ManagerFormValues) => Promise<void>
  onEditUser?: (user: Manager) => Promise<void>
  user?: Manager
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UserFormDialog({ onAddUser, onEditUser, user, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: UserFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen
  const [loading, setLoading] = useState(false)
  const [stadiums, setStadiums] = useState<Stadium[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const isEditing = !!user

  useEffect(() => {
    if (open) {
      stadiumsService.getAll().then(setStadiums).catch(console.error)
    }
  }, [open])

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      stadium_ids: user?.stadium_ids || [],
      is_active: user?.is_active ?? true,
    },
  })

  // Reset form when user changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: user?.name || "",
        phone: user?.phone || "",
        stadium_ids: user?.stadium_ids || [],
        is_active: user?.is_active ?? true,
      })
    }
  }, [open, user, form])

  async function onSubmit(data: UserFormValues) {
    setLoading(true)
    try {
      // Remove all spaces from the phone number before sending to backend
      const sanitizedData = {
        ...data,
        phone: data.phone.replace(/\s+/g, '')
      }

      if (isEditing && user && onEditUser) {
        await onEditUser({
          ...user,
          ...sanitizedData,
          updated_at: new Date().toISOString(),
        })
      } else if (onAddUser) {
        await onAddUser(sanitizedData)
      }
      form.reset()
      setOpen(false)
    } catch (error: any) {
      const errorMessage = error.message || ""

      if (errorMessage.toLowerCase().includes("already exists") || errorMessage.toLowerCase().includes("mavjud")) {
        form.setError("phone", {
          type: "manual",
          message: "Bu telefon raqami allaqachon ro'yxatdan o'tgan"
        })
        toast.error("Bu telefon raqami tizimda mavjud")
      } else {
        console.error(error)
        toast.error("Ma'lumotlarni saqlashda xatolik yuz berdi")
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredStadiums = stadiums.filter(s =>
    s.name_uz.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.name_ru && s.name_ru.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Yangi manager
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden text-foreground">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{isEditing ? "Managerni tahrirlash" : "Yangi manager qo'shish"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Manager ma'lumotlarini o'zgartiring. Barcha maydonlarni tekshiring."
              : "Tizimga yangi manager qo'shing. Barcha maydonlarni to'ldiring."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>F.I.SH</FormLabel>
                    <FormControl>
                      <Input placeholder="Ism va familiyani kiriting" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon raqami</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+998 99 123 45 67"
                        {...field}
                        onChange={(e) => {
                          let val = e.target.value;
                          let digits = val.replace(/\D/g, '');
                          if (digits.length > 0 && !digits.startsWith('998')) {
                            digits = '998' + digits;
                          }
                          let formatted = '';
                          if (digits.length > 0) {
                            formatted = '+' + digits.substring(0, 3);
                            if (digits.length > 3) formatted += ' ' + digits.substring(3, 5);
                            if (digits.length > 5) formatted += ' ' + digits.substring(5, 8);
                            if (digits.length > 8) formatted += ' ' + digits.substring(8, 10);
                            if (digits.length > 10) formatted += ' ' + digits.substring(10, 12);
                          }
                          if (digits.length <= 12) field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="stadium_ids"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <FormLabel className="text-sm font-bold uppercase tracking-widest text-foreground">Stadionlar</FormLabel>
                      <FormDescription className="text-[10px] font-medium italic">Boshqaruv uchun stadionlarni tanlang ({field.value?.length || 0} ta tanlandi)</FormDescription>
                    </div>
                    {stadiums.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-primary/5 hover:text-primary transition-all px-3 border-border/50"
                        onClick={() => {
                          const allIds = stadiums.map(s => typeof s.id === 'string' ? parseInt(s.id) : s.id);
                          if (field.value?.length === stadiums.length) {
                            field.onChange([]);
                          } else {
                            field.onChange(allIds);
                          }
                        }}
                      >
                        {field.value?.length === stadiums.length ? "Bekor qilish" : "Barchasini tanlash"}
                      </Button>
                    )}
                  </div>

                  <div className="relative group/search">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                    <Input
                      placeholder="Stadionlarni qidirish..."
                      className="pl-10 h-11 bg-muted/50 border-border/50 rounded-xl focus-visible:ring-primary/20 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 size-8 rounded-lg hover:bg-background/80"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="size-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="border rounded-2xl shadow-inner overflow-hidden bg-muted/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {filteredStadiums.length > 0 ? (
                        filteredStadiums.map((stadium) => {
                          const stadiumId = typeof stadium.id === 'string' ? parseInt(stadium.id) : stadium.id;
                          const isSelected = field.value?.includes(stadiumId);
                          return (
                            <div
                              key={stadium.id}
                              className={cn(
                                "group relative flex flex-col p-3 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                                isSelected
                                  ? "bg-primary/10 border-primary ring-1 ring-primary shadow-md"
                                  : "bg-card border-border hover:border-primary/50 hover:shadow-sm"
                              )}
                              onClick={() => {
                                if (isSelected) {
                                  field.onChange(field.value.filter((id: number) => id !== stadiumId));
                                } else {
                                  field.onChange([...(field.value || []), stadiumId]);
                                }
                              }}
                            >
                              {/* Selection Indicator */}
                              <div className={cn(
                                "absolute top-2 right-2 size-6 rounded-full border-2 flex items-center justify-center transition-all z-20",
                                isSelected ? "bg-primary border-primary text-primary-foreground scale-110" : "border-muted-foreground/30 bg-background/50"
                              )}>
                                {isSelected && <Check className="size-4 stroke-[3]" />}
                              </div>

                              <div className="flex gap-3 h-20">
                                {/* Thumbnail */}
                                <div className="size-20 rounded-xl bg-muted border border-border overflow-hidden shrink-0 shadow-inner group-hover:shadow-none transition-shadow">
                                  {stadium.main_image ? (
                                    <img src={stadium.main_image} alt={stadium.name_uz} className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                  ) : (
                                    <div className="size-full flex items-center justify-center">
                                      <Map className="size-8 text-muted-foreground/20" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between py-0.5 overflow-hidden">
                                  <div>
                                    <h5 className={cn(
                                      "font-bold text-sm truncate pr-6 transition-colors",
                                      isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                                    )}>
                                      {stadium.name_uz}
                                    </h5>
                                    <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                                      <MapPin className="size-3 shrink-0" />
                                      <span className="text-[10px] font-medium truncate italic">{stadium.address_uz}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-black border-none bg-primary/5 text-primary">
                                      {stadium.capacity}
                                    </Badge>
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50">
                                      <BadgeDollarSign className="size-3 text-green-500" />
                                      <span className="text-[10px] font-bold font-mono">
                                        {new Intl.NumberFormat("uz-UZ").format(stadium.price_per_hour)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Selection Glow Effect */}
                              {isSelected && (
                                <div className="absolute inset-0 bg-primary/5 pointer-events-none animate-in fade-in duration-500" />
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full p-12 text-center bg-background rounded-xl border border-dashed border-border/50">
                          <Map className="size-12 text-muted-foreground/20 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest italic">Stadionlar topilmadi</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {field.value?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                      {field.value.map((id: number) => {
                        const s = stadiums.find(st => (typeof st.id === 'string' ? parseInt(st.id) : st.id) === id);
                        if (!s) return null;
                        return (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="pl-3 pr-1 py-1 rounded-xl bg-background border-primary/20 text-primary hover:bg-primary/5 transition-all shadow-sm flex items-center gap-1 group/badge"
                          >
                            <MapPin className="size-3 text-primary/50" />
                            <span className="truncate text-xs font-bold leading-none">{s.name_uz}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-6 ml-1 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                field.onChange(field.value.filter((val: number) => val !== id));
                              }}
                            >
                              <X className="size-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-2xl border bg-muted/20 p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-foreground font-medium">Faol holati</FormLabel>
                    <FormDescription>
                      Manager tizimga kira oladimi?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="p-6 pt-2 border-t bg-muted/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl"
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            className="cursor-pointer rounded-xl bg-primary px-8"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saqlanmoqda...
              </>
            ) : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
