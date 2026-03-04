"use client"

import { useEffect, useState } from "react"
import { adminAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    LayoutDashboard, Users, FileCheck, AlertCircle,
    Clock, CheckCircle2, Languages, Microscope, BookOpen, FileText, ClipboardCheck, Trophy, TrendingUp
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export default function CPTAdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        // In a real implementation this would fetch from adminAPI.getDashboardStats()
        // but for now we'll just set some dummy data if the API doesn't return these exactly
        const fetchStats = async () => {
            try {
                const data = await adminAPI.getDashboardStats()
                setStats(data)
            } catch (error) {
                console.error("Failed to fetch admin stats", error)
            }
        }
        fetchStats()
    }, [])

    // --- CPT STATUS TILES --- [cite: 4]
    const statusTiles = [
        { label: "Draft", count: stats?.draft || stats?.total_exams || 0, color: "text-slate-500", bg: "bg-slate-100" },
        { label: "Approved", count: stats?.approved || 0, color: "text-blue-500", bg: "bg-blue-100" },
        { label: "Live (S1)", count: stats?.live_s1 || 0, color: "text-emerald-500", bg: "bg-emerald-100" },
        { label: "Live (S2)", count: stats?.live_s2 || 0, color: "text-orange-500", bg: "bg-orange-100" },
        { label: "Marking", count: stats?.marking || stats?.pending_grading || 0, color: "text-purple-500", bg: "bg-purple-100" },
        { label: "Finalized", count: stats?.finalized || stats?.issued_certificates || 0, color: "text-indigo-500", bg: "bg-indigo-100" },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">CPT Command Center</h1>
                <p className="text-muted-foreground">Real-time monitoring of integrated CPT exam instances.</p>
            </div>

            {/* 1. EXAM INSTANCE STATUS TILES [cite: 4] */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {statusTiles.map((tile) => (
                    <Card key={tile.label} className="border-none shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {tile.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${tile.color}`}>{tile.count}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* 2. LIVE MONITORING COUNTERS [cite: 5] */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" /> Active Session Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Section A (Core Knowledge)</span>
                                <span className="font-medium">{stats?.section_a_submitted || 0} / {stats?.total_candidates || 0}</span>
                            </div>
                            <Progress value={45} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Section B (Practical Translation)</span>
                                <span className="font-medium">{stats?.section_b_submitted || 0} / {stats?.total_candidates || 0}</span>
                            </div>
                            <Progress value={20} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* 3. MARKING HEALTH & MODERATION [cite: 6] */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Microscope className="h-5 w-5 text-purple-600" /> Marking Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm">Awaiting 1st Marker</span>
                            <Badge variant="secondary">{stats?.awaiting_1st || stats?.pending_grading || 0}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm">Awaiting 2nd Marker</span>
                            <Badge variant="secondary">{stats?.awaiting_2nd || 0}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-amber-50 border border-amber-100">
                            <span className="text-sm font-semibold text-amber-700">Moderation Queue</span>
                            <Badge className="bg-amber-500">{stats?.moderation_needed || 0}</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 4. INTEGRITY & RISK ALERTS  */}
            <Card className="border-red-100 bg-red-50/30">
                <CardHeader>
                    <CardTitle className="text-red-800 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" /> Integrity & Risk Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-red-600">{stats?.missing_ai_disclosure || 0}</div>
                            <div className="text-xs text-slate-500 uppercase">Missing AI Disclosure</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-red-600">{stats?.abnormal_timing || 0}</div>
                            <div className="text-xs text-slate-500 uppercase">Abnormal Timing</div>
                        </div>
                        <div className="text-center border-l border-red-100">
                            <div className="text-xl font-bold text-red-600">{stats?.login_failures || 0}</div>
                            <div className="text-xs text-slate-500 uppercase">Login Failures</div>
                        </div>
                        <div className="text-center border-l border-red-100">
                            <div className="text-xl font-bold text-red-600">{stats?.flagged_submissions || 0}</div>
                            <div className="text-xs text-slate-500 uppercase">Flagged Items</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 5. QUICK NAVIGATION (Carried over to retain usability) */}
            <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 mt-8">
                    Quick Navigation
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card
                        className="hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => router.push("/admin/exams")}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" /> Examination Management
                            </CardTitle>
                            <CardDescription>Create, approve, and schedule CPT instances.</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        className="hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => router.push("/admin/questions")}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" /> Content Bank
                            </CardTitle>
                            <CardDescription>
                                Manage Text Packs, Translation Briefs, and question items.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        className="hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => router.push("/admin/candidates")}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" /> Candidate Management
                            </CardTitle>
                            <CardDescription>View profiles, track progress, and manage users.</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        className="hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => router.push("/admin/grading")}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardCheck className="h-5 w-5 text-primary" /> Manual Grading
                            </CardTitle>
                            <CardDescription>Grade theory tasks using the CPT rubric.</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        className="hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => router.push("/admin/certificates")}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-primary" /> Certificate Inventory
                            </CardTitle>
                            <CardDescription>Track issued certificates and verify authenticity.</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        className="hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => router.push("/admin/reports")}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" /> Analytics &amp; Reports
                            </CardTitle>
                            <CardDescription>View performance analytics and inter-rater statistics.</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    )
}