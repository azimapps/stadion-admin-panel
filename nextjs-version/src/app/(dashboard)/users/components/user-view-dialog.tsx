"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Stadium, stadiumsService } from "@/services/stadium"
import { Calendar, Phone, User as UserIcon, MapPin, Activity, Map as MapIcon, Users2, BadgeDollarSign, ExternalLink } from "lucide-react"

import { Manager } from "@/services/manager"

interface UserViewDialogProps {
    user: Manager
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function UserViewDialog({ user, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: UserViewDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen
    const [stadiums, setStadiums] = useState<Stadium[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            setLoading(true)
            stadiumsService.getAll()
                .then(setStadiums)
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [open])

    const userStadiums = stadiums.filter(s =>
        user.stadium_ids.includes(typeof s.id === 'string' ? parseInt(s.id) : s.id)
    )

    const getStatusColor = (active: boolean) => {
        return active
            ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
            : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="cursor-pointer rounded-xl">
                        Batafsil ko'rish
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl text-foreground p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                                <UserIcon className="size-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight">Manager ma'lumotlari</DialogTitle>
                                <DialogDescription className="text-muted-foreground font-medium">
                                    Batafsil profil va biriktirilgan ob'ektlar
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Profile Card */}
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm backdrop-blur-sm">
                            <div className="relative">
                                <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl shadow-inner uppercase tracking-tighter">
                                    {user.name.substring(0, 2)}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 size-5 rounded-full border-4 border-card ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold tracking-tight">{user.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className={`rounded-lg px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider ${getStatusColor(user.is_active)}`}>
                                        {user.is_active ? "Aktiv Manager" : "Nofaol"}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                        <Calendar className="size-3" />
                                        {new Date(user.created_at).toLocaleDateString("uz-UZ", { day: 'numeric', month: 'short' })} dan beri
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">ID</span>
                                <span className="text-sm font-mono font-bold bg-muted px-2 py-1 rounded-lg">#{user.id}</span>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-3">
                                <div className="size-8 rounded-lg bg-background flex items-center justify-center border border-border shadow-sm shrink-0">
                                    <Phone className="size-4 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Telefon</span>
                                    <span className="font-bold text-sm tracking-tight">{user.phone}</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-3">
                                <div className="size-8 rounded-lg bg-background flex items-center justify-center border border-border shadow-sm shrink-0">
                                    <Activity className="size-4 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">Yangilangan</span>
                                    <span className="font-bold text-sm tracking-tight">{new Date(user.updated_at).toLocaleDateString("uz-UZ", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stadiums Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="size-6 rounded bg-primary/10 flex items-center justify-center">
                                        <MapIcon className="size-3.5 text-primary" />
                                    </div>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-foreground">Biriktirilgan stadionlar</h4>
                                </div>
                                <Badge variant="outline" className="rounded-lg bg-primary/5 text-primary border-primary/20 font-bold">
                                    {userStadiums.length} ta ob'ekt
                                </Badge>
                            </div>

                            <div className="grid gap-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {userStadiums.length > 0 ? (
                                    userStadiums.map(stadium => (
                                        <div key={stadium.id} className="group relative p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
                                            {/* Background Decoration */}
                                            <div className="absolute top-0 right-0 size-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />

                                            <div className="flex gap-4 relative z-10">
                                                {/* Stadium Image Placeholder or Thumbnail */}
                                                <div className="size-20 rounded-xl bg-muted border border-border overflow-hidden shrink-0 shadow-inner">
                                                    {stadium.main_image ? (
                                                        <img src={stadium.main_image} alt={stadium.name_uz} className="size-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="size-full flex items-center justify-center">
                                                            <MapIcon className="size-8 text-muted-foreground/30" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 flex flex-col justify-between py-0.5">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h5 className="font-bold text-base tracking-tight group-hover:text-primary transition-colors">{stadium.name_uz}</h5>
                                                            <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-black uppercase">
                                                                {stadium.capacity}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                                                            <MapPin className="size-3 text-primary/70 shrink-0" />
                                                            <span className="text-xs font-medium line-clamp-1">{stadium.address_uz}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                                                            <BadgeDollarSign className="size-3.5 text-green-500" />
                                                            <span className="text-xs font-bold font-mono tracking-tighter">
                                                                {new Intl.NumberFormat("uz-UZ").format(stadium.price_per_hour)}
                                                                <span className="text-[10px] text-muted-foreground ml-0.5">UZS/S</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                                                            <Users2 className="size-3.5 text-blue-500" />
                                                            <span className="text-xs font-bold tracking-tight">{stadium.surface_type === 'artificial' ? 'Sun\'iy' : 'Tabiiy'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Overlay */}
                                            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                                                <div className="flex gap-1.5">
                                                    {stadium.is_metro_near && (
                                                        <Badge variant="outline" className="rounded-md h-5 px-1.5 text-[10px] bg-blue-500/5 text-blue-500 border-blue-500/20 font-bold uppercase">
                                                            Metro yaqin
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className={`rounded-md h-5 px-1.5 text-[10px] font-bold uppercase ${stadium.roof_type === 'covered' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' : 'bg-sky-500/5 text-sky-500 border-sky-500/20'}`}>
                                                        {stadium.roof_type === 'covered' ? 'Yopiq' : 'Ochiq'}
                                                    </Badge>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-lg group/btn shadow-none" asChild>
                                                    <a href={`/stadiums/${stadium.id}`} target="_blank">
                                                        Stadionga o'tish
                                                        <ExternalLink className="size-3 ml-1 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-border bg-muted/10 opacity-60">
                                        <MapIcon className="size-12 text-muted-foreground/30 mb-3" />
                                        <p className="text-sm text-center font-semibold text-muted-foreground uppercase tracking-widest">Hozircha stadionlar biriktirilmagan</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-8 pb-2">
                        <Button
                            variant="default"
                            onClick={() => setOpen(false)}
                            className="rounded-xl px-12 h-11 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
                        >
                            Yopish
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
