"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { examinerAPI } from "@/lib/api"
import {
    ClipboardCheck,
    FileCheck,
    AlertCircle,
    GraduationCap,
    ChevronRight,
    Clock,
    Loader2,
    TrendingUp,
    RefreshCw // Added icon
} from "lucide-react"
import { cn } from "@/lib/utils" // Ensure you have this utility, or remove usage if not

export default function ExaminerDashboardPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()

    const [stats, setStats] = useState({ pending: 0, graded: 0, total: 0 })
    const [nextSession, setNextSession] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // 1. Extracted fetch logic so we can reuse it for the "Refresh" button
    const loadDashboardData = useCallback(async () => {
        try {
            const statsData = await examinerAPI.getStats()
            setStats(statsData)

            const pendingList = await examinerAPI.getPendingReviews()
            if (pendingList && pendingList.length > 0) {
                setNextSession(pendingList[0])
            } else {
                setNextSession(null)
            }
        } catch (error) {
            console.error("Failed to load dashboard data", error)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    useEffect(() => {
        if (authLoading) return

        if (!user || user.role !== "examiner") {
            router.push("/login")
            return
        }

        loadDashboardData()
    }, [user, authLoading, router, loadDashboardData])

    const handleRefresh = () => {
        setIsRefreshing(true)
        loadDashboardData()
    }

    if (authLoading || isLoading) {
        return (
            <div className="h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    <p className="text-zinc-500 font-medium animate-pulse">Loading Dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full p-6 md:p-10 max-w-7xl mx-auto space-y-10">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-indigo-50/80 to-transparent -z-10 pointer-events-none" />

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
                        Examiner <span className="text-indigo-600">Portal</span>
                    </h1>
                    <p className="text-muted-foreground max-w-lg">
                        Welcome back, {user?.first_name}. Manage assessments, grade pending submissions, and track your grading performance efficiently.
                    </p>
                </div>
                <Button
                    size="lg"
                    onClick={() => router.push('/examiner/grading')}
                    className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 transition-all hover:scale-105 active:scale-95"
                >
                    <ClipboardCheck className="w-5 h-5 mr-2" /> View Review Queue
                </Button>
            </div>

            {/* 📊 Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <StatCard
                    label="Pending Reviews"
                    value={stats.pending}
                    icon={Clock}
                    color="text-amber-600"
                    bg="bg-amber-50"
                    border="border-amber-100"
                    trend="Critical"
                    onClick={() => router.push('/examiner/grading')} // Link to Pending
                />

                {/* 🔗 ADDED LINK TO HISTORY HERE */}
                <StatCard
                    label="Graded Scripts"
                    value={stats.graded}
                    icon={FileCheck}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    border="border-emerald-100"
                    trend="View History"
                    onClick={() => router.push('/examiner/history')}
                />

                <StatCard
                    label="Total Assessed"
                    value={stats.total}
                    icon={TrendingUp}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    border="border-blue-100"
                    trend="Lifetime"
                />
            </div>

            {/* 📋 Grading Queue Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-zinc-800">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-indigo-600" />
                        </div>
                        Next in Queue
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="text-zinc-500 hover:text-indigo-600"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                {nextSession ? (
                    <div className="group relative overflow-hidden bg-white rounded-2xl border border-zinc-200 shadow-xl shadow-indigo-100/50 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-purple-600" />
                        <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                        High Priority
                                    </span>
                                    <h3 className="text-2xl font-bold text-zinc-900 group-hover:text-indigo-700 transition-colors">
                                        {nextSession.exam?.title || "Untitled Assessment"}
                                    </h3>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                                            <GraduationCap className="w-4 h-4" />
                                        </div>
                                        <span>Candidate ID: <span className="font-mono font-medium text-zinc-900">{nextSession.user}</span></span>
                                    </div>
                                    <div className="hidden md:block w-px h-4 bg-zinc-200" />
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-zinc-400" />
                                        <span>Submitted: {new Date(nextSession.end_time).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                onClick={() => router.push(`/examiner/grading/${nextSession.id}`)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
                            >
                                Grade Now <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardContent>
                    </div>
                ) : (
                    <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100/50">
                        <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                                <FileCheck className="h-8 w-8 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-emerald-900">All Caught Up!</h3>
                                <p className="text-emerald-700/80 mt-1 max-w-sm mx-auto">
                                    You have graded all pending submissions. Great work keeping the queue empty.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                            >
                                {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Refresh Queue"}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </section>
        </div>
    )
}

// Updated StatCard to handle clicks
function StatCard({ label, value, icon: Icon, color, bg, border, trend, onClick }: any) {
    return (
        <Card
            className={`
                border ${border} shadow-sm relative overflow-hidden group 
                hover:shadow-md transition-all duration-300 
                ${onClick ? 'cursor-pointer hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100' : ''}
            `}
            onClick={onClick}
        >
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon className="w-24 h-24 -mr-4 -mt-4 transform rotate-12" />
            </div>
            <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
                        <h4 className="text-4xl font-bold text-zinc-900 tracking-tight">{value}</h4>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
                {trend && (
                    <div className="mt-4 flex items-center text-xs font-medium text-muted-foreground">
                        <span className={`px-1.5 py-0.5 rounded mr-2 ${onClick ? "text-indigo-600 bg-indigo-50" : "text-emerald-600 bg-emerald-50"}`}>
                            {trend}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}