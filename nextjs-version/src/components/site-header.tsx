import { Settings } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"

interface SiteHeaderProps {
  onOpenThemeSettings?: () => void
}

export function SiteHeader({ onOpenThemeSettings }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <Link href="/dashboard" className="flex items-center gap-2.5 transition-all hover:opacity-80">
            <Logo size={28} monochrome className="text-foreground" />
            <span className="text-xl font-black italic tracking-tighter text-foreground uppercase">
              Stadion24 Admin Panel
            </span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {onOpenThemeSettings && (
            <Button variant="ghost" size="icon" onClick={onOpenThemeSettings} className="cursor-pointer">
              <Settings className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Theme Settings</span>
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
