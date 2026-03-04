"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    FileText,
    Users,
    ClipboardCheck,
    Award,
    PlusCircle,
    BookOpen,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Radio,
    PenLine,
    FlaskConical,
    UserCheck,
    UserX,
    ShieldAlert,
    TimerOff,
    Trophy,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { adminAPI } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardStats {
    // Legacy (kept for backwards-compat while API updates)
    total_exams: number
    total_candidates: number
    pending_grading: number
    issued_certificates: number

    // CPT Exam-Instance status tiles
    instances_draft?: number
    instances_live?: number
    instances_marking?: number
    instances_finalized?: number

    // CPT Marking health
    awaiting_first_marker?: number
    awaiting_second_marker?: number
    moderation_queue?: number

    // Integrity alerts
    missing_ai_disclosure?: number
    abnormal_timing?: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatCard({
    title,
    value,
    sub,
    icon: Icon,
    color = "text-muted-foreground",
    bg = "",
    onClick,
}: {
    title: string
    value: number | undefined
    sub: string
    icon: React.ElementType
    color?: string
    bg?: string
    onClick?: () => void
}) {
    return (
        <Card
            className={`transition-colors ${onClick ? "cursor-pointer hover:bg-accent/50" : ""} ${bg}`}
            onClick={onClick}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${color}`}>{value ?? "—"}</div>
                <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
        </Card>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()

    const [stats, setStats] = useState<DashboardStats>({
        total_exams: 0,
        total_candidates: 0,
        pending_grading: 0,
        issued_certificates: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && user?.role !== "admin" && !user?.is_staff) {
            router.push("/admin/login")
            return
        }

        const fetchStats = async () => {
            try {
                const data = await adminAPI.getDashboardStats()
                setStats(data)
            } catch (error) {
                console.error("Failed to fetch admin stats", error)
            } finally {
                setLoading(false)
            }
        }

        if (user) fetchStats()
    }, [user, authLoading, router])

    if (authLoading || loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        CPT Examination Platform · Moderation Control Centre
                    </p>
                </div>
                <Button onClick={() => router.push("/admin/exams/new")}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Exam Instance
                </Button>
            </div>

            {/* ── Section 1: Exam-Instance Status Tiles ── */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Exam Instance Status
                    </h2>
                    <Badge variant="outline" className="text-xs">CPT Lifecycle</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Draft"
                        value={stats.instances_draft ?? stats.total_exams}
                        sub="Instances not yet approved"
                        icon={PenLine}
                        color="text-slate-500"
                    />
                    <StatCard
                        title="Live"
                        value={stats.instances_live}
                        sub="Currently in session"
                        icon={Radio}
                        color="text-green-600"
                        onClick={() => router.push("/admin/exams")}
                    />
                    <StatCard
                        title="Marking"
                        value={stats.instances_marking ?? stats.pending_grading}
                        sub="Awaiting final scores"
                        icon={ClipboardCheck}
                        color="text-orange-500"
                        onClick={() => router.push("/admin/grading")}
                    />
                    <StatCard
                        title="Finalized"
                        value={stats.instances_finalized ?? stats.issued_certificates}
                        sub="Results locked & released"
                        icon={CheckCircle2}
                        color="text-indigo-600"
                    />
                </div>
            </div>

            <Separator />

            {/* ── Section 2: Marking Health ── */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Marking Health
                    </h2>
                    <Badge variant="outline" className="text-xs">Double-Blind</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        title="Awaiting 1st Marker"
                        value={stats.awaiting_first_marker ?? stats.pending_grading}
                        sub="No first mark yet"
                        icon={UserX}
                        color="text-red-500"
                        onClick={() => router.push("/admin/grading")}
                    />
                    <StatCard
                        title="Awaiting 2nd Marker"
                        value={stats.awaiting_second_marker}
                        sub="1st mark done, 2nd pending"
                        icon={UserCheck}
                        color="text-yellow-600"
                        onClick={() => router.push("/admin/grading")}
                    />
                    <StatCard
                        title="Moderation Queue"
                        value={stats.moderation_queue}
                        sub="Marker disagreement ≥10 pts"
                        icon={FlaskConical}
                        color="text-purple-600"
                        onClick={() => router.push("/admin/grading")}
                    />
                </div>
            </div>

            <Separator />

            {/* ── Section 3: Integrity Alerts ── */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Integrity Alerts
                    </h2>
                    {((stats.missing_ai_disclosure ?? 0) + (stats.abnormal_timing ?? 0)) > 0 && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                            Action Required
                        </Badge>
                    )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <StatCard
                        title="Missing AI Disclosures"
                        value={stats.missing_ai_disclosure ?? 0}
                        sub="Submissions without required AI declaration"
                        icon={ShieldAlert}
                        color={stats.missing_ai_disclosure ? "text-red-600" : "text-muted-foreground"}
                    />
                    <StatCard
                        title="Abnormal Submission Timing"
                        value={stats.abnormal_timing ?? 0}
                        sub="Submissions outside expected time window"
                        icon={TimerOff}
                        color={stats.abnormal_timing ? "text-orange-600" : "text-muted-foreground"}
                    />
                </div>
            </div>

            <Separator />

            {/* ── Section 4: Module Navigation ── */}
            <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
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