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
import { Calendar, Phone, User as UserIcon, MapPin, Activity } from "lucide-react"

import { Manager } from "@/services/manager"

interface UserViewDialogProps {
    user: Manager
    trigger?: React.ReactNode
}

export function UserViewDialog({ user, trigger }: UserViewDialogProps) {
    const [open, setOpen] = useState(false)
    const [stadiums, setStadiums] = useState<Stadium[]>([])

    useEffect(() => {
        if (open) {
            stadiumsService.getAll().then(setStadiums).catch(console.error)
        }
    }, [open])

    const userStadiums = stadiums.filter(s =>
        user.stadium_ids.includes(typeof s.id === 'string' ? parseInt(s.id) : s.id)
    )

    const getStatusColor = (active: boolean) => {
        return active
            ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
            : "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="cursor-pointer">
                        Ko'rish
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md text-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserIcon className="size-5 text-primary" />
                        Manager ma'lumotlari
                    </DialogTitle>
                    <DialogDescription>
                        Batafsil ma'lumotlar bilan tanishing
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                            {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">{user.name}</h3>
                            <Badge variant="secondary" className={getStatusColor(user.is_active)}>
                                {user.is_active ? "Faol" : "Nofaol"}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="size-4 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">Telefon</span>
                                <span className="font-medium">{user.phone}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="size-4 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">Qo'shilgan sana</span>
                                <span className="font-medium">{new Date(user.created_at).toLocaleDateString("uz-UZ", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <Activity className="size-4 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">Oxirgi yangilanish</span>
                                <span className="font-medium">{new Date(user.updated_at).toLocaleDateString("uz-UZ", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="space-y-2 mt-2">
                            <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                <MapPin className="size-4 text-muted-foreground" />
                                <span>Biriktirilgan stadionlar ({userStadiums.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {userStadiums.length > 0 ? (
                                    userStadiums.map(stadium => (
                                        <Badge key={stadium.id} variant="outline" className="bg-background">
                                            {stadium.name_uz}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">Stadionlar biriktirilmagan</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
                        Yopish
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
