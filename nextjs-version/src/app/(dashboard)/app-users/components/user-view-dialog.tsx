"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Phone,
  Calendar,
  TrendingUp,
  DollarSign,
  User,
  Clock,
} from "lucide-react"
import { AppUser } from "@/services/app-user"

interface UserViewDialogProps {
  user: AppUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserViewDialog({ user, open, onOpenChange }: UserViewDialogProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm"
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string | null, phone: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return phone.slice(-2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Foydalanuvchi ma'lumotlari</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Avatar & Name */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.fullname || user.phone} />}
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {getInitials(user.fullname, user.phone)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.fullname || "Noma'lum"}</h3>
              <p className="text-muted-foreground">{user.phone}</p>
              <Badge
                variant="secondary"
                className={user.is_active
                  ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20 mt-2"
                  : "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20 mt-2"
                }
              >
                {user.is_active ? "Faol" : "Nofaol"}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Jami buyurtmalar</p>
                  <p className="text-xl font-bold">{user.total_orders}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Jami to'lov</p>
                  <p className="text-lg font-bold text-green-600">{formatPrice(user.total_spent)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="font-medium">#{user.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefon raqam</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ro'yxatdan o'tgan</p>
                <p className="font-medium">{formatDate(user.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">So'nggi faollik</p>
                <p className="font-medium">{formatDate(user.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
