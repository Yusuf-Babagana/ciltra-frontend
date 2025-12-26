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
  LogOut
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/exams", label: "Exam Management", icon: FileText },
    { href: "/admin/questions", label: "Question Bank", icon: BookOpen },
    { href: "/admin/candidates", label: "Candidates", icon: Users },
    { href: "/admin/grading", label: "Manual Grading", icon: ClipboardCheck },
    { href: "/admin/certificates", label: "Certificates", icon: Award },
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-indigo-400">CILTRA Admin</h2>
      </div>
      <div className="flex-1 py-6 px-3 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-white",
              pathname.startsWith(link.href)
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-slate-800">
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