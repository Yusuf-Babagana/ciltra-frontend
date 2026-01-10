"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    FileText,
    Award,
    User,
    LogOut,
    BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth" // Assuming we have this based on previous files

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function StudentSidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const { logout } = useAuth()

    const routes = [
        {
            href: "/student/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            active: pathname === "/student/dashboard",
        },
        {
            href: "/student/exams",
            label: "Exams",
            icon: BookOpen,
            active: pathname === "/student/exams" || pathname.startsWith("/student/exam/"),
        },
        {
            href: "/student/results", // Or a dedicated history page if it exists, otherwise keeping generic
            label: "My Results",
            icon: FileText,
            active: pathname.startsWith("/student/results"),
        },
        // {
        //     href: "/student/certificates", 
        //     label: "Certificates",
        //     icon: Award,
        //     active: pathname.startsWith("/student/certificates"),
        // },
        {
            href: "/student/profile",
            label: "Profile",
            icon: User,
            active: pathname === "/student/profile",
        },
    ]

    return (
        <div className={cn("pb-12 min-h-screen border-r bg-white", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="mb-2 px-4 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">C</span>
                        </div>
                        <h2 className="text-lg font-bold tracking-tight text-slate-900">
                            Ciltra<span className="text-indigo-600">Student</span>
                        </h2>
                    </div>
                    <div className="space-y-1 mt-8">
                        {routes.map((route) => (
                            <Button
                                key={route.href}
                                asChild
                                variant={route.active ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start transition-all duration-200",
                                    route.active
                                        ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                <Link href={route.href}>
                                    <route.icon className={cn("mr-2 h-5 w-5", route.active ? "text-indigo-600" : "text-slate-400")} />
                                    {route.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="absolute bottom-4 px-3 w-full border-t pt-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => logout()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Button>
            </div>
        </div>
    )
}
