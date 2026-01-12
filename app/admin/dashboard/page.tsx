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
    AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { adminAPI } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
    total_exams: number
    total_candidates: number
    pending_grading: number
    issued_certificates: number
}

export default function AdminDashboardPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()

    const [stats, setStats] = useState<DashboardStats>({
        total_exams: 0,
        total_candidates: 0,
        pending_grading: 0,
        issued_certificates: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && user?.role !== 'admin' && !user?.is_staff) {
            router.push('/admin/login')
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

        if (user) {
            fetchStats()
        }
    }, [user, authLoading, router])

    if (authLoading || loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Overview of the CILTRA Examination Platform
                    </p>
                </div>
                <Button onClick={() => router.push('/admin/exams/new')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Exam
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_exams}</div>
                        <p className="text-xs text-muted-foreground">Active certification exams</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Registered Candidates</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_candidates}</div>
                        <p className="text-xs text-muted-foreground">Across all programs</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => router.push('/admin/grading')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.pending_grading}</div>
                        <p className="text-xs text-muted-foreground">Sessions awaiting manual grading</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
                        <Award className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.issued_certificates}</div>
                        <p className="text-xs text-muted-foreground">Verified completions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Module Navigation */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Exam Management */}
                <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push('/admin/exams')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" /> Examination Management
                        </CardTitle>
                        <CardDescription>Create, edit, and schedule certification exams.</CardDescription>
                    </CardHeader>
                </Card>

                {/* Question Bank */}
                <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push('/admin/questions')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" /> Question Bank
                        </CardTitle>
                        <CardDescription>Manage questions, categories, and options.</CardDescription>
                    </CardHeader>
                </Card>

                {/* Candidate Management */}
                <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push('/admin/candidates')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" /> Candidate Management
                        </CardTitle>
                        <CardDescription>View profiles, track progress, and manage users.</CardDescription>
                    </CardHeader>
                </Card>

                {/* Grading */}
                <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push('/admin/grading')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5 text-primary" /> Manual Grading
                        </CardTitle>
                        <CardDescription>Grade open-ended responses and finalize scores.</CardDescription>
                    </CardHeader>
                </Card>

                {/* Certificates */}
                <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push('/admin/certificates')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" /> Certificate Inventory
                        </CardTitle>
                        <CardDescription>Track issued certificates and verify authenticity.</CardDescription>
                    </CardHeader>
                </Card>

                {/* Reports - ENABLED */}
                <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push('/admin/reports')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {/* Changed icon color from muted to primary */}
                            <TrendingUp className="h-5 w-5 text-primary" /> Analytics & Reports
                        </CardTitle>
                        {/* Updated Description */}
                        <CardDescription>View detailed performance analytics and trends.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}