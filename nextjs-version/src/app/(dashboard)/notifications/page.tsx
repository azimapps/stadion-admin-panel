"use client"

import * as React from "react"
import { Bell, Send, Search, ChevronsUpDown, User, X, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { notificationService, SendNotificationRequest } from "@/services/notification"
import { appUsersService, AppUser } from "@/services/app-user"

const notificationSchema = z.object({
    title_uz: z.string().min(1, "Sarlavha (UZ) majburiy"),
    title_ru: z.string().min(1, "Sarlavha (RU) majburiy"),
    body_uz: z.string().min(1, "Matn (UZ) majburiy"),
    body_ru: z.string().min(1, "Matn (RU) majburiy"),
})

type NotificationFormValues = z.infer<typeof notificationSchema>

export default function NotificationsPage() {
    const [isBroadcast, setIsBroadcast] = React.useState(true)
    const [selectedUser, setSelectedUser] = React.useState<AppUser | null>(null)
    const [userSearchOpen, setUserSearchOpen] = React.useState(false)
    const [users, setUsers] = React.useState<AppUser[]>([])
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isSearching, setIsSearching] = React.useState(false)
    const [isSending, setIsSending] = React.useState(false)

    const form = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationSchema),
        defaultValues: {
            title_uz: "",
            title_ru: "",
            body_uz: "",
            body_ru: "",
        },
    })

    // Debounced user search
    React.useEffect(() => {
        if (!userSearchOpen) return

        const timer = setTimeout(async () => {
            try {
                setIsSearching(true)
                const response = await appUsersService.getAll({
                    search: searchQuery || undefined,
                    limit: 20,
                })
                setUsers(response.items)
            } catch {
                console.error("Failed to search users")
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, userSearchOpen])

    const onSubmit = async (values: NotificationFormValues) => {
        if (!isBroadcast && !selectedUser) {
            toast.error("Foydalanuvchini tanlang")
            return
        }

        try {
            setIsSending(true)
            const payload: SendNotificationRequest = {
                ...values,
                ...((!isBroadcast && selectedUser) ? { user_id: selectedUser.id } : {}),
            }

            const result = await notificationService.send(payload)
            toast.success(`${result.sent} ta qurilmaga yuborildi${result.failed > 0 ? `, ${result.failed} ta xato` : ""}`)
            form.reset()
            setSelectedUser(null)
            setIsBroadcast(true)
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Bildirishnoma yuborishda xatolik yuz berdi")
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="flex-1 space-y-12 p-10 pt-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-[1.25rem] bg-amber-500/10 flex items-center justify-center shadow-inner">
                        <Bell className="size-6 text-amber-500" />
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase">Bildirishnomalar</h1>
                </div>
                <p className="text-sm font-medium text-muted-foreground/60 tracking-wide ml-1">
                    Foydalanuvchilarga push-bildirishnoma yuboring — hammaga yoki tanlangan foydalanuvchiga.
                </p>
            </div>

            <Separator className="bg-border/40" />

            {/* Form */}
            <Card className="max-w-2xl border-border/40">
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Broadcast toggle */}
                            <div className="flex items-center justify-between rounded-xl border border-border/40 p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Kimga yuborish</Label>
                                    <p className="text-xs text-muted-foreground">
                                        {isBroadcast ? "Barcha foydalanuvchilarga yuboriladi" : "Tanlangan foydalanuvchiga yuboriladi"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold ${!isBroadcast ? "text-amber-500" : "text-muted-foreground/40"}`}>
                                        Tanlangan
                                    </span>
                                    <Switch
                                        checked={isBroadcast}
                                        onCheckedChange={(checked) => {
                                            setIsBroadcast(checked)
                                            if (checked) setSelectedUser(null)
                                        }}
                                    />
                                    <span className={`text-xs font-bold ${isBroadcast ? "text-amber-500" : "text-muted-foreground/40"}`}>
                                        Hammaga
                                    </span>
                                </div>
                            </div>

                            {/* User search (shown when not broadcast) */}
                            {!isBroadcast && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Foydalanuvchi</Label>
                                    {selectedUser ? (
                                        <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-full bg-amber-500/10 flex items-center justify-center">
                                                    <User className="size-4 text-amber-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{selectedUser.fullname || "Ismsiz"}</p>
                                                    <p className="text-xs text-muted-foreground">{selectedUser.phone}</p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setSelectedUser(null)}
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    role="combobox"
                                                    className="w-full justify-between font-normal"
                                                >
                                                    <span className="flex items-center gap-2 text-muted-foreground">
                                                        <Search className="size-4" />
                                                        Foydalanuvchini qidiring...
                                                    </span>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                <Command shouldFilter={false}>
                                                    <CommandInput
                                                        placeholder="Ism yoki telefon raqam..."
                                                        value={searchQuery}
                                                        onValueChange={setSearchQuery}
                                                    />
                                                    <CommandList>
                                                        {isSearching ? (
                                                            <div className="flex items-center justify-center py-6">
                                                                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <CommandEmpty>Foydalanuvchi topilmadi</CommandEmpty>
                                                                <CommandGroup>
                                                                    {users.map((user) => (
                                                                        <CommandItem
                                                                            key={user.id}
                                                                            value={String(user.id)}
                                                                            onSelect={() => {
                                                                                setSelectedUser(user)
                                                                                setUserSearchOpen(false)
                                                                                setSearchQuery("")
                                                                            }}
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                                                                                    <User className="size-3.5 text-muted-foreground" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-medium">{user.fullname || "Ismsiz"}</p>
                                                                                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                                                                                </div>
                                                                            </div>
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </>
                                                        )}
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </div>
                            )}

                            <Separator className="bg-border/40" />

                            {/* Title fields */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="title_uz"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Sarlavha (UZ)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Yangi aksiya!" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="title_ru"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Sarlavha (RU)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Новая акция!" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Body fields */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="body_uz"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Matn (UZ)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Bugun barcha stadionlarda 50% chegirma!"
                                                    className="min-h-[100px] resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="body_ru"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Matn (RU)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Сегодня скидка 50% на все стадионы!"
                                                    className="min-h-[100px] resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={isSending}
                                className="w-full h-12 text-sm font-black uppercase tracking-wider"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Yuborilmoqda...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 size-4" />
                                        {isBroadcast ? "Hammaga yuborish" : "Yuborish"}
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
