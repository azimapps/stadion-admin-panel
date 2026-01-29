"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "./logo"

export function SidebarNotification() {
  const [isVisible, setIsVisible] = React.useState(true)

  if (!isVisible) return null

  return (
    <Card className="mb-3 py-0 border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 transition-all duration-300">
      <CardContent className="p-4 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Close notification</span>
        </Button>

        <div className="pr-6">
          <h3 className="flex items-center gap-3 font-bold text-neutral-900 dark:text-neutral-100 mb-2 mt-1">
            <Logo size={32} monochrome className="text-neutral-900 dark:text-neutral-100" />
            <div className="tracking-tight text-lg">
              Stadion24 Admin Panel
            </div>
          </h3>
          <p className="text-sm text-muted-foreground dark:text-neutral-400 leading-relaxed font-medium">
            Tizimga xush kelibsiz! Barcha stadionlarni va foydalanuvchilarni bitta paneldan boshqaring.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
