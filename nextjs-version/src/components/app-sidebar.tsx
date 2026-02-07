"use client"

import * as React from "react"
import {
  LayoutPanelLeft,
  LayoutDashboard,
  Mail,
  CheckSquare,
  MessageCircle,
  Calendar,
  Shield,
  AlertTriangle,
  Settings,
  HelpCircle,
  CreditCard,
  LayoutTemplate,
  Users,
  MapPin,
  Map as MapIcon,
  Video,
  Trophy,
  Wifi,
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { SidebarNotification } from "@/components/sidebar-notification"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@gmail.com",
    avatar: "",
  },
  navGroups: [
    {
      label: "Asosiy",
      items: [
        {
          title: "Statistikalar",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Stadionlar",
          url: "/stadiums",
          icon: MapPin,
        },
        {
          title: "Managerlar",
          url: "/users",
          icon: Users,
        },
        {
          title: "Media",
          url: "/media",
          icon: Video,
        },
        {
          title: "Turnirlar",
          url: "/tournaments",
          icon: Trophy,
        },
      ],
    },
    {
      label: "Qo'shimchalar",
      items: [
        {
          title: "Qulayliklar",
          url: "/comforts",
          icon: Wifi,
        },
        {
          title: "Jamoalar",
          url: "/teams",
          icon: Shield,
        },
        {
          title: "Regionlar",
          url: "/regions",
          icon: MapIcon,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="h-14 hover:bg-transparent">
              <Link href="/dashboard">
                <div className="flex size-14 items-center justify-center bg-transparent transition-all duration-300 hover:scale-110">
                  <Logo size={56} className="object-contain" />
                </div>
                <div className="ml-2 flex flex-1 flex-col justify-center leading-none">
                  <span className="text-2xl font-black italic tracking-tighter text-foreground">STADION</span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarNotification />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
