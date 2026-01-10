"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    ClipboardCheck,
    LogOut,
    User,
    Settings
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export function ExaminerSidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const { logout, user } = useAuth()

    const links = [
        { href: "/examiner/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/examiner/grading", label: "Grading Queue", icon: ClipboardCheck },
        { href: "/examiner/profile", label: "My Profile", icon: User },
        // { href: "/examiner/settings", label: "Settings", icon: Settings },
    ]

    return (
        <div className={cn("flex h-full w-64 flex-col border-r bg-zinc-900 text-white shadow-xl", className)}>
            <div className="p-6 border-b border-zinc-800 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-lg">C</div>
                <h2 className="text-xl font-bold tracking-tight text-white">Examiner</h2>
            </div>

            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                            pathname === link.href || pathname.startsWith(link.href + "/")
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        )}
                    >
                        <link.icon className={cn("h-4 w-4 transition-colors", pathname === link.href ? "text-white" : "text-zinc-500 group-hover:text-white")} />
                        {link.label}
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                <div className="mb-4 flex items-center gap-3 px-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-200 border border-indigo-500/30">
                        {user?.first_name?.[0] || "E"}
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
                        <p className="truncate text-xs text-zinc-500">{user?.email}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={() => { logout(); window.location.href = "/login"; }}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
