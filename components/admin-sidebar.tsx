"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Library,        // Content Bank (replaces BookOpen)
  Users,
  ClipboardCheck,
  Award,
  LogOut,
  Shield,
  History,
  Settings,
  UserCog,
  BarChart3,
  Database,
  Languages,      // Language Pairs
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

// ── Nav structure ─────────────────────────────────────────────────────────────

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: string[]
}

interface NavGroup {
  heading: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Core",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "examiner", "grader"],
      },
      {
        href: "/admin/grading",
        label: "Manual Grading",
        icon: ClipboardCheck,
        roles: ["admin", "examiner", "grader"],
      },
    ],
  },
  {
    heading: "Examination",
    items: [
      {
        href: "/admin/exams",
        label: "Exam Management",
        icon: FileText,
        roles: ["admin", "examiner"],
      },
      {
        // "Question Bank" → "Content Bank"
        href: "/admin/questions",
        label: "Content Bank",
        icon: Library,
        roles: ["admin", "examiner"],
      },
      {
        // New: Language Pairs management
        href: "/admin/language-pairs",
        label: "Language Pairs",
        icon: Languages,
        roles: ["admin"],
      },
    ],
  },
  {
    heading: "People",
    items: [
      {
        href: "/admin/examiners",
        label: "Manage Examiners",
        icon: UserCog,
        roles: ["admin"],
      },
      {
        href: "/admin/users",
        label: "User Management",
        icon: Shield,
        roles: ["admin"],
      },
      {
        href: "/admin/candidates",
        label: "Candidates",
        icon: Users,
        roles: ["admin"],
      },
    ],
  },
  {
    heading: "Results & Compliance",
    items: [
      {
        href: "/admin/results",
        label: "Exam Results",
        icon: BarChart3,
        roles: ["admin", "examiner"],
      },
      {
        href: "/admin/certificates",
        label: "Certificates",
        icon: Award,
        roles: ["admin"],
      },
      {
        // Promoted for compliance tracking
        href: "/admin/reports/audit",
        label: "Audit Logs",
        icon: History,
        roles: ["admin"],
      },
    ],
  },
  {
    heading: "System",
    items: [
      {
        href: "/admin/settings/backups",
        label: "System Backups",
        icon: Database,
        roles: ["admin"],
      },
      {
        href: "/admin/settings",
        label: "Platform Settings",
        icon: Settings,
        roles: ["admin"],
      },
    ],
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const userRole = user?.role?.toLowerCase() ?? ""

  const isActive = (href: string) =>
    href === "/admin/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/")

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-900 text-white">

      {/* ── Brand ── */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-indigo-400">CILTRA Admin</h2>
        {user && (
          <div className="mt-1 text-xs text-slate-400 uppercase tracking-wider font-semibold">
            {user.role} Portal
          </div>
        )}
      </div>

      {/* ── Nav Groups ── */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-5">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) =>
            item.roles.includes(userRole)
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={group.heading}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {group.heading}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-white",
                      isActive(item.href)
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── User footer ── */}
      <div className="p-4 border-t border-slate-800 mt-auto">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium text-white truncate">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
          onClick={() => {
            logout()
            window.location.href = "/admin/login"
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

    </div>
  )
}