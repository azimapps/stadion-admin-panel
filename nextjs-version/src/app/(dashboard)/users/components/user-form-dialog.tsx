"use client"

import { useState, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Search, X, Check, Plus } from "lucide-react"
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

type UserFormValues = z.infer<typeof userFormSchema>

interface User {
  id: number
  name: string
  phone: string
  stadium_ids: number[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UserFormDialogProps {
  onAddUser?: (user: UserFormValues) => void
  onEditUser?: (user: User) => void
  user?: User
  trigger?: React.ReactNode
}

export function UserFormDialog({ onAddUser, onEditUser, user, trigger }: UserFormDialogProps) {
  const [open, setOpen] = useState(false)
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

  function onSubmit(data: UserFormValues) {
    if (isEditing && user && onEditUser) {
      onEditUser({
        ...user,
        ...data,
        updated_at: new Date().toISOString(),
      })
    } else if (onAddUser) {
      onAddUser(data)
    }
    form.reset()
    setOpen(false)
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
                    <div>
                      <FormLabel className="text-base font-semibold">Stadionlar</FormLabel>
                      <FormDescription>
                        Boshqaruv uchun stadionlarni tanlang ({field.value?.length || 0} ta tanlandi)
                      </FormDescription>
                    </div>
                    {stadiums.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80 h-8 px-2"
                        onClick={() => {
                          const allIds = stadiums.map(s => typeof s.id === 'string' ? parseInt(s.id) : s.id);
                          if (field.value?.length === stadiums.length) {
                            field.onChange([]);
                          } else {
                            field.onChange(allIds);
                          }
                        }}
                      >
                        {field.value?.length === stadiums.length ? "Barchasini bekor qilish" : "Barchasini tanlash"}
                      </Button>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Stadionlarni qidirish..."
                      className="pl-9 h-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="size-3" />
                      </Button>
                    )}
                  </div>

                  <div className="border rounded-xl shadow-sm overflow-hidden bg-muted/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
                      {filteredStadiums.length > 0 ? (
                        filteredStadiums.map((stadium) => {
                          const stadiumId = typeof stadium.id === 'string' ? parseInt(stadium.id) : stadium.id;
                          const isSelected = field.value?.includes(stadiumId);
                          return (
                            <div
                              key={stadium.id}
                              className={cn(
                                "flex items-center gap-3 p-3 bg-background hover:bg-muted/50 transition-colors cursor-pointer group",
                                isSelected && "bg-primary/5"
                              )}
                              onClick={() => {
                                if (isSelected) {
                                  field.onChange(field.value.filter((id: number) => id !== stadiumId));
                                } else {
                                  field.onChange([...(field.value || []), stadiumId]);
                                }
                              }}
                            >
                              <div className={cn(
                                "size-5 rounded border flex items-center justify-center transition-colors shadow-sm",
                                isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input bg-background"
                              )}>
                                {isSelected && <Check className="size-3.5 stroke-[3]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm font-medium truncate",
                                  isSelected ? "text-primary" : "text-foreground"
                                )}>
                                  {stadium.name_uz}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {stadium.capacity} • {stadium.surface_type === 'artificial' ? 'Sun\'iy' : 'Tabiiy'}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full p-8 text-center bg-background">
                          <p className="text-sm text-muted-foreground italic">Stadionlar topilmadi</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {field.value?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {field.value.map((id: number) => {
                        const s = stadiums.find(st => (typeof st.id === 'string' ? parseInt(st.id) : st.id) === id);
                        if (!s) return null;
                        return (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="pl-2 pr-1.5 py-0.5 rounded-full bg-primary/10 border-primary/20 text-primary-foreground hover:bg-primary/20 max-w-[180px]"
                          >
                            <span className="truncate text-xs">{s.name_uz}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-4 ml-1 hover:bg-primary/20 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                field.onChange(field.value.filter((val: number) => val !== id));
                              }}
                            >
                              <X className="size-2.5" />
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
          >
            Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
