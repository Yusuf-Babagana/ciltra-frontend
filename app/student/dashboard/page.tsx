"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { studentAPI } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import {
  Loader2,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ArrowRight,
  Trophy,
  Activity,
  Calendar
} from "lucide-react"

interface ExamAttempt {
  id: number
  exam: { title: string }
  status: "pending" | "in_progress" | "completed"
  score?: number
  passed?: boolean
  start_time?: string
  end_time?: string
}

interface Certificate {
  id: string
  certificate_id: string
  exam_title: string
  issued_at: string
  score: number
}

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const attemptsData = await studentAPI.getExamAttempts()
      setExamAttempts(attemptsData as ExamAttempt[])

      const certsData = await studentAPI.getCertificates()
      setCertificates(certsData as Certificate[])

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate Stats
  const completed = examAttempts.filter((a) => a.status === "completed").length
  const inProgress = examAttempts.filter((a) => a.status === "in_progress" || !a.end_time).length
  const passed = examAttempts.filter((a) => a.passed).length

  return (
    <AuthGuard>
      <div className="space-y-8 p-8 max-w-7xl mx-auto">

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white shadow-xl">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Welcome back, {user?.first_name || "Scholar"}
            </h1>
            <p className="text-indigo-100 max-w-xl text-lg">
              Track your progress, manage your exams, and view your certifications all in one place.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold border-0">
                <Link href="/student/exams">
                  Start New Exam <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          {/* Background Decoration */}
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
            <Trophy className="h-full w-full -mr-16 -mt-8 rotate-12" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Exams"
                value={examAttempts.length}
                icon={FileText}
                color="text-blue-600"
                bg="bg-blue-50"
                description="Attempts started"
              />
              <StatsCard
                title="Certificates"
                value={certificates.length}
                icon={Award}
                color="text-amber-600"
                bg="bg-amber-50"
                description="Earned credentials"
              />
              <StatsCard
                title="In Progress"
                value={inProgress}
                icon={Clock}
                color="text-violet-600"
                bg="bg-violet-50"
                description="Resume anytime"
              />
              <StatsCard
                title="Pass Rate"
                value={examAttempts.length > 0 ? `${Math.round((passed / examAttempts.length) * 100)}%` : "0%"}
                icon={Activity}
                color="text-emerald-600"
                bg="bg-emerald-50"
                description="Average success"
              />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">

              {/* Recent Activity (Main Column) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Activity</h2>
                  <Link href="/student/exams" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</Link>
                </div>

                {examAttempts.length === 0 ? (
                  <EmptyState
                    title="No exams taken yet"
                    description="Start your journey by selecting a certification exam."
                    actionLink="/student/exams"
                    actionText="Browse Exams"
                  />
                ) : (
                  <div className="space-y-4">
                    {examAttempts.slice(0, 5).map((attempt) => (
                      <div
                        key={attempt.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-100"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 ${attempt.status === 'completed'
                              ? attempt.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                              : 'bg-indigo-50 text-indigo-600'
                            }`}>
                            {attempt.status === 'completed'
                              ? (attempt.passed ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />)
                              : <Clock className="h-6 w-6" />
                            }
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-lg">{attempt.exam?.title || "Unknown Exam"}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {attempt.start_time ? new Date(attempt.start_time).toLocaleDateString() : 'Pending'}</span>
                              <Badge variant="secondary" className="capitalize text-xs font-normal bg-slate-100 text-slate-600">
                                {attempt.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {attempt.status === "completed" && (
                            <div className="flex flex-col items-end mr-2">
                              <span className={`text-lg font-bold ${attempt.passed ? 'text-emerald-600' : 'text-slate-500'}`}>{attempt.score}%</span>
                              <span className="text-xs text-muted-foreground uppercase">Score</span>
                            </div>
                          )}

                          {attempt.status === "in_progress" && (
                            <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                              <Link href={`/student/session/${attempt.id}`}>Resume Exam</Link>
                            </Button>
                          )}

                          {attempt.status === "completed" && (
                            <Button asChild size="sm" variant="outline" className="border-slate-200">
                              <Link href={`/student/results/${attempt.id}`}>View Report</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Certificates (Sidebar Column) */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">My Certificates</h2>
                {certificates.length === 0 ? (
                  <Card className="bg-slate-50 border-dashed shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                      <Award className="h-12 w-12 opacity-20 mb-3" />
                      <p className="text-sm font-medium">No certificates yet</p>
                      <p className="text-xs max-w-[180px] mt-1">Complete passing exams to earn your credentials.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {certificates.map((cert) => (
                      <Card key={cert.id} className="overflow-hidden border-0 shadow-md group transition-all hover:-translate-y-1">
                        <div className="h-2 w-full bg-gradient-to-r from-amber-400 to-yellow-500" />
                        <CardHeader className="p-5 pb-2">
                          <CardTitle className="text-base font-bold line-clamp-2 leading-tight" title={cert.exam_title}>
                            {cert.exam_title}
                          </CardTitle>
                          <CardDescription className="text-xs flex items-center mt-1">
                            Issued: {new Date(cert.issued_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pt-2">
                          <Button asChild size="sm" variant="secondary" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700">
                            <Link href={`/certificates/${cert.certificate_id}`}>View Certificate</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </AuthGuard>
  )
}

function StatsCard({ title, value, icon: Icon, description, color, bg }: any) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 mb-4">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className={`p-2 rounded-lg ${bg} ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ title, description, actionLink, actionText }: any) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
        <FileText className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-2 mb-6">{description}</p>
      <Button asChild>
        <Link href={actionLink}>{actionText}</Link>
      </Button>
    </div>
  )
}
