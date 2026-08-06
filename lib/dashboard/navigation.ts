import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Settings,
  Building2,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const dashboardNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard/Overview", icon: LayoutDashboard },
  { label: "Organización", href: "/dashboard/Organization", icon: Building2 },
  { label: "Analytics", href: "/dashboard/Analytics", icon: BarChart3 },
  { label: "Reports", href: "/dashboard/Reports", icon: FileText },
  { label: "Settings", href: "/dashboard/Settings", icon: Settings },
]
