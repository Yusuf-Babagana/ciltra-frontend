"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Users,
  ClipboardCheck,
  Award,
  LogOut,
  Shield,
  History,
  Settings,
  UserCog,
  BarChart3,
  Database // Added for Backups
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const allLinks = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "examiner", "grader"]
    },
    {
      href: "/admin/examiners",
      label: "Manage Examiners",
      icon: UserCog,
      roles: ["admin"]
    },
    {
      href: "/admin/users",
      label: "User Management",
      icon: Shield,
      roles: ["admin"]
    },
    {
      href: "/admin/exams",
      label: "Exam Management",
      icon: FileText,
      roles: ["admin", "examiner"]
    },
    {
      href: "/admin/questions",
      label: "Question Bank",
      icon: BookOpen,
      roles: ["admin", "examiner"]
    },
    {
      href: "/admin/candidates",
      label: "Candidates",
      icon: Users,
      roles: ["admin"]
    },
    {
      href: "/admin/grading",
      label: "Manual Grading",
      icon: ClipboardCheck,
      roles: ["admin", "examiner", "grader"]
    },
    {
      href: "/admin/results",
      label: "Exam Results",
      icon: BarChart3,
      roles: ["admin", "examiner"]
    },
    {
      href: "/admin/certificates",
      label: "Certificates",
      icon: Award,
      roles: ["admin"]
    },
    {
      href: "/admin/reports/audit",
      label: "Audit Logs",
      icon: History,
      roles: ["admin"]
    },
    {
      // --- NEW BACKUP LINK ---
      href: "/admin/settings/backups",
      label: "System Backups",
      icon: Database,
      roles: ["admin"]
    },
    {
      href: "/admin/settings",
      label: "Platform Settings",
      icon: Settings,
      roles: ["admin"]
    },
  ]

  const filteredLinks = allLinks.filter(link => {
    if (!user || !user.role) return false
    const userRole = user.role.toLowerCase()
    return link.roles.includes(userRole)
  })

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-indigo-400">CILTRA Admin</h2>
        {user && (
          <div className="mt-2 text-xs text-slate-400 uppercase tracking-wider font-semibold">
            {user.role} Portal
          </div>
        )}
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {filteredLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-white",
              pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/admin/dashboard")
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 mt-auto">
        <div className="mb-4 px-2">
          <p className="text-sm font-medium text-white truncate">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
          onClick={() => { logout(); window.location.href = "/admin/login"; }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}