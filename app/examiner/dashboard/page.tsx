"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogoHeader } from "../../../components/logo-header"
import { useAuth } from "@/lib/auth-context"
// You will likely need to create an examinerAPI in lib/api.ts later

import {
    ClipboardCheck,
    LogOut,
    FileCheck,
    AlertCircle,
    GraduationCap,
    ChevronRight,
    Clock
} from "lucide-react"

export default function ExaminerDashboardPage() {
    const router = useRouter()
    const { user, logout, isLoading: authLoading } = useAuth()
    const [stats, setStats] = useState({ pending: 0, graded: 0, total: 0 })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return

        // Redirect if not an examiner
        if (!user || user.role !== "examiner") {
            router.push("/login")
            return
        }

        loadData()
    }, [user, authLoading, router])

    const loadData = async () => {
        try {
            // Placeholder: In a real scenario, you'd fetch specific examiner stats here
            // const data = await examinerAPI.getStats()
            setStats({ pending: 12, graded: 45, total: 57 })
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-20">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <LogoHeader />
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="font-semibold text-sm">{user?.firstName} {user?.lastName}</div>
                            <div className="text-xs text-muted-foreground uppercase">{user?.role}</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { logout(); router.push("/login") }}>
                            <LogOut className="w-4 h-4 mr-2" /> Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-6 py-10">
                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Examiner Portal</h1>
                        <p className="text-muted-foreground">Manage grading and assessment reviews.</p>
                    </div>
                    <Button onClick={() => router.push('/examiner/grading')}>
                        <ClipboardCheck className="w-4 h-4 mr-2" /> Start Grading
                    </Button>
                </div>

                {/* 📊 Stats Overview */}
                <div className="grid gap-6 md:grid-cols-3 mb-10">
                    {[
                        { label: "Pending Reviews", value: stats.pending, icon: Clock, color: "bg-amber-100 text-amber-600" },
                        { label: "Graded Scripts", value: stats.graded, icon: FileCheck, color: "bg-emerald-100 text-emerald-600" },
                        { label: "Total Assigned", value: stats.total, icon: GraduationCap, color: "bg-blue-100 text-blue-600" }
                    ].map((stat, i) => (
                        <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* 📋 Grading Queue (Placeholder UI) */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-primary" /> Attention Required
                        </h2>
                    </div>

                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg">Professional Certification in Translation</h3>
                                <p className="text-sm text-muted-foreground">Session: 2024/2025 • 12 Scripts Pending</p>
                            </div>
                            <Button onClick={() => router.push('/examiner/grading/session-123')}>
                                Grade Now <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </section>
            </main>
        </div>
    )
}